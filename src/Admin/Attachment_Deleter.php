<?php
/**
 * Admin attachment deletion handler.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Attachment_Deleter
 *
 * Handles cleanup and child reassignment when a video attachment is deleted.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Attachment_Deleter implements Hook_Subscriber {

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $format_registry
	 */
	protected $format_registry;

	/**
	 * Constructor.
	 *
	 * @param array                             $options        Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry ) {
		$this->options         = $options;
		$this->format_registry = $format_registry;
	}

	/**
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'delete_attachment',
				'callback' => 'delete_handler',
			),
		);
	}

	/**
	 * Returns an array of filters to subscribe to.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array();
	}

	/**
	 * Handles cleanup when a video attachment is deleted.
	 *
	 * @param int $video_id The attachment ID.
	 */
	public function delete_handler( $video_id ) {
		$mime_type = get_post_mime_type( (int) $video_id );
		$format_id = get_post_meta( (int) $video_id, '_kgflashmediaplayer-format', true );

		if ( ( $mime_type && strpos( (string) $mime_type, 'video' ) !== false ) || $format_id ) {

			$encode_queue = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );

			// If this is a child format attachment, find the corresponding job and delete it.
			if ( $format_id ) {
				$parent_id = wp_get_post_parent_id( (int) $video_id );
				if ( $parent_id ) {
					$encoder       = new \Videopack\Admin\Encode\Encode_Attachment( $this->options, $this->format_registry, (int) $parent_id );
					$encode_format = $encoder->get_encode_format( (string) $format_id );
					if ( $encode_format && $encode_format->get_job_id() ) {
						$encode_queue->delete_job( (int) $encode_format->get_job_id(), false );
					}
				}
			} else {
				// This is a parent/master video attachment, delete all its jobs.
				$encoder = new \Videopack\Admin\Encode\Encode_Attachment( $this->options, $this->format_registry, (int) $video_id );
				$formats = $encoder->get_formats();
				foreach ( $formats as $format ) {
					if ( $format->get_job_id() ) {
						$encode_queue->delete_job( (int) $format->get_job_id(), false );
					}
				}
			}

			$post      = get_post( (int) $video_id );
			$parent_id = $post instanceof \WP_Post ? $post->post_parent : 0;

			$args  = array(
				'post_parent' => (int) $video_id,
				'post_type'   => 'attachment',
				'numberposts' => -1,
			);
			$posts = get_posts( $args ); // Find all children of the video in the database.
			if ( $posts ) {
				$formats = array();
				foreach ( $posts as $child_post ) {
					wp_update_post(
						array(
							'ID'          => $child_post->ID,
							'post_parent' => $parent_id,
						)
					); // Set post_parent field to the original video's post_parent.

					$is_video = strpos( (string) $child_post->post_mime_type, 'video' ) !== false;
					$is_image = strpos( (string) $child_post->post_mime_type, 'image' ) !== false;

					if ( $is_image && ! empty( $this->options['delete_child_thumbnails'] ) ) {
						wp_delete_attachment( $child_post->ID, true );
					} elseif ( $is_video && ! empty( $this->options['delete_child_encoded'] ) ) {
						wp_delete_attachment( $child_post->ID, true );
					} elseif ( $is_video ) {
						$format = get_post_meta( $child_post->ID, '_kgflashmediaplayer-format', true );
						if ( $format ) {
							$formats[ (string) $format ] = (int) $child_post->ID;
						}
					}
				} // end loop.

				if ( ! empty( $formats ) ) { // Find a child to be the new master video.
					$video_formats = $this->format_registry->get_video_formats();
					foreach ( $video_formats as $format_key => $format_obj ) {
						if ( array_key_exists( (string) $format_key, $formats ) ) {
							$new_master = $formats[ (string) $format_key ];
							unset( $formats[ (string) $format_key ] );
							delete_post_meta( (int) $new_master, '_kgflashmediaplayer-format' ); // Master videos don't have the child format meta info.
							wp_update_post(
								array(
									'ID'         => $new_master,
									'post_title' => get_the_title( (int) $video_id ),
								)
							); // Set the new master's title to the old master's title.
							foreach ( $formats as $child_id ) {
								wp_update_post(
									array(
										'ID'          => $child_id,
										'post_parent' => $new_master,
									)
								); // Set all the other children as the new master's child.
							}
							break; // Stop after the highest quality format.
						}
					}
				}
			}
		} elseif ( $mime_type && strpos( (string) $mime_type, 'image' ) !== false ) {
			$args  = array(
				'numberposts' => -1,
				'post_type'   => 'attachment',
				'meta_key'    => '_kgflashmediaplayer-poster-id',
				'meta_value'  => (int) $video_id,
			);
			$posts = get_posts( $args ); // Find all posts that have this thumbnail ID in their meta.
			if ( $posts ) {
				foreach ( $posts as $meta_post ) {
					delete_post_meta( $meta_post->ID, '_kgflashmediaplayer-poster-id' );
					delete_post_meta( $meta_post->ID, '_thumbnail-id' );
					delete_post_meta( $meta_post->ID, '_kgflashmediaplayer-poster' );
				}
			}
		}

		// Clear transient caches.
		$transient_name = $this->get_transient_name( (string) wp_get_attachment_url( (int) $video_id ) );
		delete_transient( 'kgvid_' . (string) $transient_name );
		delete_transient( 'videopack_url_cache_' . md5( $transient_name ) );
	}

	/**
	 * Gets a sanitized name for use in transients.
	 *
	 * @param string $url The URL to sanitize.
	 * @return string The sanitized URL for transient use.
	 */
	protected function get_transient_name( $url ) {
		$url        = str_replace( ' ', '', (string) $url );
		$search_url = (string) preg_replace( '/-\d+x\d+(\.(?:png|jpg|gif))$/i', '.' . (string) pathinfo( $url, PATHINFO_EXTENSION ), $url );
		return $search_url;
	}
}
