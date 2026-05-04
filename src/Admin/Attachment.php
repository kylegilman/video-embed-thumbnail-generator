<?php
/**
 * Admin attachment base helper and subscriber.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Attachment
 *
 * Core attachment class for handling base video attachment logic.
 *
 * This class provides utility methods for working with video attachments,
 * including URL-to-ID resolution, video type detection (including animated GIFs),
 * and basic attachment URL/path filtering.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Attachment implements Hook_Subscriber {

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
	 * Attachment meta handler.
	 *
	 * @var \Videopack\Admin\Attachment_Meta $attachment_meta
	 */
	protected $attachment_meta;

	/**
	 * Constructor.
	 *
	 * @param array                             $options        Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 * @param \Videopack\Admin\Attachment_Meta  $attachment_meta  Attachment meta handler.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry, Attachment_Meta $attachment_meta ) {
		$this->options         = $options;
		$this->format_registry = $format_registry;
		$this->attachment_meta = $attachment_meta;
	}

	/**
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'          => 'wp_read_video_metadata',
				'callback'      => 'add_extra_video_metadata',
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
		return array(
			array(
				'hook'     => 'mime_types',
				'callback' => 'add_mime_types',
			),
			array(
				'hook'          => 'wp_get_attachment_url',
				'callback'      => 'filter_attachment_url',
				'priority'      => 10,
				'accepted_args' => 2,
			),
			array(
				'hook'          => 'get_attached_file',
				'callback'      => 'filter_attached_file',
				'priority'      => 10,
				'accepted_args' => 2,
			),
		);
	}

	/**
	 * Converts a URL to an attachment ID, with optional transient caching.
	 *
	 * @param string $url The URL to convert.
	 * @return int|null The attachment ID, or null if not found.
	 */
	public function url_to_id( $url ) {
		$search_url = $this->get_transient_name( (string) $url );
		$post_id    = get_transient( 'videopack_url_cache_' . md5( $search_url ) );

		if ( false === $post_id ) {
			$post_id = attachment_url_to_postid( $search_url );
			if ( ! $post_id ) {
				$post_id = 'not found';
			}
			set_transient( 'videopack_url_cache_' . md5( $search_url ), $post_id, MONTH_IN_SECONDS );
		}

		if ( 'not found' === $post_id ) {
			$post_id = null;
		}

		return (int) apply_filters( 'videopack_url_to_id', (int) $post_id, $url );
	}

	/**
	 * Checks if a file is an animated GIF.
	 *
	 * @param string $filename Path to the file.
	 * @return bool True if animated GIF, false otherwise.
	 */
	public function is_animated_gif( $filename ) {
		if ( ! file_exists( $filename ) ) {
			return false;
		}

		if ( class_exists( 'Imagick' ) ) {
			try {
				$image  = new \Imagick( $filename );
				$frames = $image->coalesceImages();
				$count  = 0;
				foreach ( $frames as $frame ) {
					++$count;
					if ( $count > 1 ) {
						return true;
					}
				}
			} catch ( \Exception $e ) {
				unset( $e ); // Imagick failed; fall back to manual GIF header check.
			}
		}

		$fh = fopen( $filename, 'rb' );
		if ( ! $fh ) {
			return false;
		}

		$total_count = 0;
		$chunk       = '';
		while ( ! feof( $fh ) && $total_count < 2 ) {
			$chunk       .= fread( $fh, 1024 * 100 );
			$count        = preg_match_all( '#\x00\x21\xF9\x04.{4}\x00(\x2C|\x21)#s', $chunk, $matches );
			$total_count += $count;
			if ( $count > 0 && $total_count < 2 ) {
				$last_match = (string) end( $matches[0] );
				$end        = strrpos( $chunk, $last_match ) + strlen( $last_match );
				$chunk      = substr( $chunk, $end );
			}
		}
		fclose( $fh );

		return $total_count > 1;
	}

	/**
	 * Checks if a post is a video attachment.
	 *
	 * @param \WP_Post|int|null $post Post object or ID.
	 * @return bool True if video, false otherwise.
	 */
	public function is_video( $post ) {
		if ( is_numeric( $post ) ) {
			$post = get_post( (int) $post );
		}

		if ( ! $post instanceof \WP_Post || ! property_exists( $post, 'post_mime_type' ) ) {
			return false;
		}

		$is_animated = false;
		if ( 'image/gif' === $post->post_mime_type ) {
			$moviefile          = get_attached_file( $post->ID );
			$videopack_postmeta = $this->attachment_meta->get( $post->ID );
			if ( isset( $videopack_postmeta['animated'] ) && 'notchecked' === $videopack_postmeta['animated'] ) {
				$videopack_postmeta['animated'] = $this->is_animated_gif( (string) $moviefile );
				$this->attachment_meta->save( $videopack_postmeta );
			}
			$is_animated = ! empty( $videopack_postmeta['animated'] );
		}

		if ( $is_animated ) {
			return true;
		}

		if ( 0 === strpos( (string) $post->post_mime_type, 'video/' ) ) {
			if ( empty( $post->post_parent ) || (int) $post->post_parent === (int) $post->ID ) {
				return true;
			}
			$parent_mime = get_post_mime_type( (int) $post->post_parent );
			if ( ! $parent_mime || 0 !== strpos( (string) $parent_mime, 'video/' ) ) {
				return true;
			}
			if ( ! empty( get_post_meta( $post->ID, '_kgflashmediaplayer-externalurl', true ) ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Resolves a URL to an attachment ID, creating a "remote attachment" if needed.
	 *
	 * @param string $url       The external video URL.
	 * @param int    $parent_id The ID of the post to associate the attachment with.
	 * @param bool   $create    Whether to create the attachment if it doesn't exist.
	 * @return int|\WP_Error|null The attachment ID on success, null if not found (and $create is false), or WP_Error on failure.
	 */
	public function resolve_url_to_attachment( $url, $parent_id = 0, $create = false ) {
		if ( ! $url ) {
			return new \WP_Error( 'missing_url', __( 'No URL provided.', 'video-embed-thumbnail-generator' ) );
		}

		$url = (string) esc_url_raw( (string) $url );

		$existing = get_posts(
			array(
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_query'     => array(
					'relation' => 'AND',
					array(
						'key'   => '_kgflashmediaplayer-externalurl',
						'value' => $url,
					),
					array(
						'key'     => '_kgflashmediaplayer-format',
						'compare' => 'NOT EXISTS',
					),
				),
			)
		);

		if ( ! empty( $existing ) ) {
			$attachment_id = (int) $existing[0];
			if ( $parent_id && (int) wp_get_post_parent_id( $attachment_id ) !== (int) $parent_id ) {
				wp_update_post(
					array(
						'ID'          => $attachment_id,
						'post_parent' => (int) $parent_id,
					)
				);
			}
			return $attachment_id;
		}

		if ( ! $create ) {
			return null;
		}

		$filename = basename( $url );
		$title    = (string) pathinfo( $filename, PATHINFO_FILENAME );
		$title    = str_replace( '-', ' ', $title );

		$filetype = wp_check_filetype( $url );
		$mime     = ! empty( $filetype['type'] ) ? $filetype['type'] : 'video/mp4';

		$attachment_id = wp_insert_post(
			array(
				'post_title'     => $title,
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'post_parent'    => (int) $parent_id,
				'post_mime_type' => $mime,
			)
		);

		if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
			return new \WP_Error( 'create_failed', __( 'Could not create remote attachment.', 'video-embed-thumbnail-generator' ) );
		}

		update_post_meta( (int) $attachment_id, '_kgflashmediaplayer-externalurl', $url );
		update_post_meta( (int) $attachment_id, '_kgflashmediaplayer-external-remote', 'true' );
		$this->attachment_meta->get( (int) $attachment_id );

		return (int) $attachment_id;
	}

	/**
	 * Filters the attachment URL to return the external URL if it exists.
	 *
	 * @param string $url     The attachment URL.
	 * @param int    $post_id The attachment ID.
	 * @return string The filtered URL.
	 */
	public function filter_attachment_url( $url, $post_id ) {
		$external_url = get_post_meta( (int) $post_id, '_kgflashmediaplayer-externalurl', true );
		return $external_url ? (string) $external_url : (string) $url;
	}

	/**
	 * Filters the attached file path to return the external URL for remote attachments.
	 *
	 * @param string $file          Path to the attached file.
	 * @param int    $attachment_id Attachment ID.
	 * @return string The filtered file path.
	 */
	public function filter_attached_file( $file, $attachment_id ) {
		if ( empty( $file ) ) {
			$external_url = get_post_meta( (int) $attachment_id, '_kgflashmediaplayer-externalurl', true );
			if ( $external_url ) {
				return (string) $external_url;
			}
		}
		return (string) $file;
	}

	/**
	 * Adds extra video mime types to the allowed list.
	 *
	 * @param array $existing_mimes Existing mime types.
	 * @return array Modified mime types.
	 */
	public function add_mime_types( $existing_mimes ) {
		$existing_mimes['mpd']  = 'application/dash+xml';
		$existing_mimes['m3u8'] = 'application/vnd.apple.mpegurl';
		return (array) $existing_mimes;
	}

	/**
	 * Adds extra video metadata during processing.
	 *
	 * @param array  $metadata    The metadata array.
	 * @param string $file        The file path.
	 * @param string $file_format The file format.
	 * @param array  $data        Additional data.
	 * @return array The updated metadata.
	 */
	public function add_extra_video_metadata( $metadata, $file, $file_format, $data ) {
		if ( isset( $data['video']['dataformat'] ) && 'quicktime' !== $data['video']['dataformat'] ) {
			$metadata['codec'] = (string) str_replace( 'V_', '', (string) $data['video']['dataformat'] );
		} elseif ( isset( $data['video']['fourcc'] ) ) {
			$metadata['codec'] = (string) $data['video']['fourcc'];
		}

		if ( ! empty( $data['video']['frame_rate'] ) ) {
			$metadata['frame_rate'] = (string) $data['video']['frame_rate'];
		}

		return (array) $metadata;
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
