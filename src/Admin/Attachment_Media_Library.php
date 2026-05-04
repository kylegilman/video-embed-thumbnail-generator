<?php
/**
 * Admin attachment Media Library extensions and UI syncing.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Attachment_Media_Library
 *
 * Handles attachment metadata syncing, parent switching, and featured image management.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Attachment_Media_Library implements Hook_Subscriber {

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Flag to prevent recursion during update.
	 *
	 * @var bool $processing_update
	 */
	private static $processing_update = false;

	/**
	 * Constructor.
	 *
	 * @param array $options Plugin options.
	 */
	public function __construct( array $options ) {
		$this->options = $options;
	}

	/**
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'edit_attachment',
				'callback' => 'validate_attachment_updated',
			),
			array(
				'hook'     => 'videopack_cron_check_post_parent',
				'callback' => 'cron_check_post_parent_handler',
			),
			array(
				'hook'          => 'updated_post_meta',
				'callback'      => 'clear_browser_thumb_flag',
				'priority'      => 10,
				'accepted_args' => 4,
			),
			array(
				'hook'          => 'added_post_meta',
				'callback'      => 'clear_browser_thumb_flag',
				'priority'      => 10,
				'accepted_args' => 4,
			),
			array(
				'hook'          => 'videopack_set_featured_image',
				'callback'      => 'execute_featured_image_action',
				'priority'      => 10,
				'accepted_args' => 2,
			),
			array(
				'hook'          => 'videopack_switch_thumbnail_parent',
				'callback'      => 'execute_switch_parent_action',
				'priority'      => 10,
				'accepted_args' => 4,
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
	 * Validates and updates attachment data when modified.
	 *
	 * @param int $post_id The attachment ID.
	 */
	public function validate_attachment_updated( $post_id ) {
		if ( self::$processing_update ) {
			return;
		}

		$post = get_post( (int) $post_id );
		if ( $post instanceof \WP_Post && 0 === strpos( (string) $post->post_mime_type, 'video/' ) ) {
			self::$processing_update = true;
			if ( ( $this->options['thumb_parent'] ?? 'post' ) === 'post' ) {
				$this->change_thumbnail_parent( (int) $post_id, (int) $post->post_parent );
			}

			$featured_id = get_post_meta( (int) $post_id, '_kgflashmediaplayer-poster-id', true );
			set_post_thumbnail( (int) $post_id, (int) $featured_id );

			$meta = get_post_meta( (int) $post_id, '_videopack-meta', true );
			if ( ! empty( $meta['featuredchanged'] ) && ! empty( $featured_id ) && ! empty( $post->post_parent ) ) {
				set_post_thumbnail( (int) $post->post_parent, (int) $featured_id );
			}
			self::$processing_update = false;
		}
	}

	/**
	 * Changes the parent ID of all thumbnails associated with a video.
	 *
	 * @param int $post_id   The video attachment ID.
	 * @param int $parent_id The new parent post ID.
	 */
	public function change_thumbnail_parent( $post_id, $parent_id ) {
		$args       = array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'numberposts'    => -1,
			'meta_key'       => '_kgflashmediaplayer-video-id',
			'meta_value'     => (int) $post_id,
		);
		$thumbnails = get_posts( $args );

		if ( $thumbnails ) {
			foreach ( $thumbnails as $thumbnail ) {
				if ( (int) $thumbnail->post_parent !== (int) $parent_id ) {
					$new_parent = empty( $parent_id ) ? (int) $post_id : (int) $parent_id;
					wp_update_post(
						array(
							'ID'          => $thumbnail->ID,
							'post_parent' => $new_parent,
						)
					);
				}
			}
		}
	}

	/**
	 * Logic to set the parent post's featured image if it doesn't have one and the video does.
	 *
	 * @param int $post_id The video attachment ID.
	 */
	public function cron_check_post_parent_handler( $post_id ) {
		$post = get_post( (int) $post_id );
		if ( ! $post instanceof \WP_Post ) {
			return;
		}
		$video_thumbnail_id = get_post_thumbnail_id( (int) $post_id );
		$post_thumbnail_id  = get_post_thumbnail_id( (int) $post->post_parent );
		if ( ! empty( $post->post_parent ) && ! empty( $video_thumbnail_id ) && empty( $post_thumbnail_id ) ) {
			set_post_thumbnail( (int) $post->post_parent, (int) $video_thumbnail_id );
		}
	}

	/**
	 * Clears the 'needs browser thumb' flag when a thumbnail is set.
	 *
	 * @param int    $meta_id    The meta ID.
	 * @param int    $object_id  The object ID.
	 * @param string $meta_key   The meta key.
	 * @param mixed  $meta_value The meta value.
	 */
	public function clear_browser_thumb_flag( $meta_id, $object_id, $meta_key, $meta_value ) {
		if ( '_thumbnail_id' === $meta_key ) {
			delete_post_meta( (int) $object_id, '_videopack_needs_browser_thumb' );
		}
	}

	/**
	 * Action Scheduler callback to set the featured image.
	 *
	 * @param int $parent_id The parent post ID.
	 * @param int $poster_id The poster image attachment ID.
	 */
	public function execute_featured_image_action( $parent_id, $poster_id ) {
		set_post_thumbnail( (int) $parent_id, (int) $poster_id );
	}

	/**
	 * Action Scheduler callback to switch the parent of a thumbnail.
	 *
	 * @param int    $thumbnail_id The thumbnail attachment ID.
	 * @param string $target_type  The target parent type ('post' or 'attachment').
	 * @param int    $target_id    The target parent ID.
	 * @param int    $video_id     The video attachment ID.
	 */
	public function execute_switch_parent_action( $thumbnail_id, $target_type, $target_id, $video_id = 0 ) {
		wp_update_post(
			array(
				'ID'          => (int) $thumbnail_id,
				'post_parent' => (int) $target_id,
			)
		);
		if ( 'post' === $target_type && $video_id ) {
			update_post_meta( (int) $thumbnail_id, '_kgflashmediaplayer-video-id', (int) $video_id );
		}
	}

	/**
	 * Helper to process featured image batch.
	 *
	 * @return array Array containing the total count of scheduled actions.
	 */
	public function process_batch_featured() {
		$args   = array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'video',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
		);
		$videos = get_posts( $args );
		$count  = 0;

		foreach ( $videos as $video_id ) {
			$poster_id = get_post_meta( (int) $video_id, '_kgflashmediaplayer-poster-id', true );
			$post      = get_post( (int) $video_id );
			if ( $poster_id && $post instanceof \WP_Post && ! empty( $post->post_parent ) ) {
				as_enqueue_async_action(
					'videopack_set_featured_image',
					array( (int) $post->post_parent, (int) $poster_id ),
					'videopack-featured-images'
				);
				++$count;
			}
		}

		return array( 'total' => $count );
	}

	/**
	 * Helper to process parent switching batch.
	 *
	 * @param string $target_parent Optional. The target parent type ('post' or 'attachment').
	 * @return array Array containing the total count of scheduled actions.
	 */
	public function process_batch_parents( $target_parent = '' ) {
		if ( empty( $target_parent ) ) {
			$target_parent = $this->options['thumb_parent'] ?? 'post';
		}

		$args       = array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'numberposts'    => -1,
			'meta_key'       => '_kgflashmediaplayer-video-id',
			'fields'         => 'ids',
		);
		$thumbnails = get_posts( $args );
		$count      = 0;

		foreach ( $thumbnails as $thumbnail_id ) {
			$video_id = (int) get_post_meta( (int) $thumbnail_id, '_kgflashmediaplayer-video-id', true );
			$video    = get_post( $video_id );
			if ( ! $video instanceof \WP_Post ) {
				continue;
			}

			$target_id = ( 'post' === $target_parent ) ? (int) $video->post_parent : (int) $video_id;
			if ( empty( $target_id ) ) {
				$target_id = (int) $video_id;
			}

			as_enqueue_async_action(
				'videopack_switch_thumbnail_parent',
				array( (int) $thumbnail_id, $target_parent, $target_id, (int) $video_id ),
				'videopack-parent-switching'
			);
			++$count;
		}

		return array( 'total' => $count );
	}
}
