<?php
/**
 * Admin attachment processing handler.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Attachment_Processor
 *
 * Handles new attachments, auto-encoding, and auto-thumbnail generation.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Attachment_Processor implements Hook_Subscriber {

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
				'hook'     => 'add_attachment',
				'callback' => 'add_attachment_handler',
			),
			array(
				'hook'     => 'videopack_process_new_attachment',
				'callback' => 'process_new_attachment_action',
			),
			array(
				'hook'     => 'videopack_generate_thumbnail',
				'callback' => 'generate_thumbnails_with_ffmpeg',
			),
			array(
				'hook'     => 'videopack_batch_enqueue_video',
				'callback' => 'execute_batch_enqueue_action',
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
	 * Handler for the 'add_attachment' hook.
	 *
	 * @param int $post_id The attachment ID.
	 */
	public function add_attachment_handler( $post_id ) {
		if ( ! empty( $this->options['auto_encode'] ) || ! empty( $this->options['auto_thumb'] ) ) {
			if ( $this->is_video( (int) $post_id ) ) {
				as_schedule_single_action( time(), 'videopack_process_new_attachment', array( 'post_id' => (int) $post_id ), 'videopack-attachments' );
			}
		}
	}

	/**
	 * Processes a new attachment, generating thumbnails or encoding as needed.
	 *
	 * @param int $post_id The attachment ID.
	 */
	public function process_new_attachment_action( $post_id ) {
		$post = get_post( (int) $post_id );
		if ( ! $post instanceof \WP_Post ) {
			return;
		}

		// Thumbnail generation logic.
		if ( ! empty( $this->options['auto_thumb'] ) && $this->is_video( $post ) && 'image/gif' !== $post->post_mime_type ) {
			if ( ! has_post_thumbnail( (int) $post_id ) ) {
				if ( (bool) ( $this->options['ffmpeg_exists'] ?? false ) && 'notinstalled' !== ( $this->options['ffmpeg_exists'] ?? '' ) ) {
					$this->generate_thumbnails_with_ffmpeg( (int) $post_id );
				}
			}
		}

		// Encoding.
		if ( ! empty( $this->options['auto_encode'] ) ) {
			$is_animated = ( 'image/gif' === $post->post_mime_type ) ? $this->is_animated_gif( (string) get_attached_file( (int) $post_id ) ) : false;
			if ( ( ! $is_animated || ! empty( $this->options['auto_encode_gif'] ) ) && $this->is_video( $post ) ) {
				$encode_queue      = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );
				$movieurl          = (string) wp_get_attachment_url( (int) $post_id );
				$encode_attachment = new \Videopack\Admin\Encode\Encode_Attachment( $this->options, $this->format_registry, (int) $post_id, $movieurl );

				$all_formats       = $this->format_registry->get_video_formats();
				$formats_to_encode = array();

				foreach ( $all_formats as $format_key => $format_object ) {
					if ( $format_object->is_enabled() ) {
						$can_queue_status = $encode_attachment->check_if_can_queue( (string) $format_key );
						if ( 'ok_to_queue' === $can_queue_status ) {
							$formats_to_encode[] = (string) $format_key;
						}
					}
				}

				if ( ! empty( $formats_to_encode ) ) {
					$encode_queue->enqueue_encodes(
						array(
							'id'      => (int) $post_id,
							'url'     => $movieurl,
							'formats' => $formats_to_encode,
						)
					);
				}
			}
		}
	}

	/**
	 * Generates thumbnails for a video using FFmpeg.
	 *
	 * @param int $post_id The ID of the video attachment.
	 */
	public function generate_thumbnails_with_ffmpeg( $post_id ) {
		if ( ! (bool) ( $this->options['ffmpeg_exists'] ?? false ) || 'notinstalled' === ( $this->options['ffmpeg_exists'] ?? '' ) ) {
			return;
		}

		$post = get_post( (int) $post_id );
		if ( ! $post instanceof \WP_Post ) {
			return;
		}

		$ffmpeg_thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options, $this->format_registry );
		$filepath          = (string) get_attached_file( (int) $post_id );
		$thumb_ids         = array();
		$total_thumbs      = intval( $this->options['auto_thumb_number'] ?? 1 );

		if ( 1 === $total_thumbs ) {
			$ffmpeg_path    = ! empty( $this->options['app_path'] ) ? (string) $this->options['app_path'] . '/ffmpeg' : 'ffmpeg';
			$video_metadata = new \Videopack\Admin\Encode\Video_Metadata( (int) $post_id, $filepath, true, $ffmpeg_path, $this->options );

			if ( $video_metadata->worked && ! empty( $video_metadata->duration ) ) {
				$position = intval( $this->options['auto_thumb_position'] ?? 0 );
				$timecode = 0.1;
				if ( $position > 0 ) {
					$timecode = ( $position / 100 ) * (float) $video_metadata->duration;
				}

				$thumb_data = $ffmpeg_thumbnails->generate_thumbnail_at_timecode( (int) $post_id, (float) $timecode );

				if ( ! is_wp_error( $thumb_data ) && is_array( $thumb_data ) ) {
					$thumb_info = $ffmpeg_thumbnails->save( (int) $post_id, (string) $post->post_title, (string) $thumb_data['url'], false );
					if ( isset( $thumb_info['thumb_id'] ) && $thumb_info['thumb_id'] && ! is_wp_error( $thumb_info['thumb_id'] ) ) {
						$thumb_ids[1] = (int) $thumb_info['thumb_id'];
					}
				}
			}
		} else {
			for ( $i = 1; $i <= $total_thumbs; $i++ ) {
				$thumb_data = $ffmpeg_thumbnails->generate_single_thumbnail_data( (int) $post_id, $total_thumbs, $i, false );
				if ( is_wp_error( $thumb_data ) ) {
					continue;
				}
				if ( is_array( $thumb_data ) ) {
					$thumb_info = $ffmpeg_thumbnails->save( (int) $post_id, (string) $post->post_title, (string) $thumb_data['url'], $i );
					if ( isset( $thumb_info['thumb_id'] ) && $thumb_info['thumb_id'] && ! is_wp_error( $thumb_info['thumb_id'] ) ) {
						$thumb_ids[ $i ] = (int) $thumb_info['thumb_id'];
					}
				}
			}
		}

		if ( ! empty( $thumb_ids ) ) {
			$thumb_key = ( $total_thumbs > 1 ) ? intval( $this->options['auto_thumb_position'] ?? 1 ) : 1;
			if ( $thumb_key > $total_thumbs || $thumb_key <= 0 ) {
				$thumb_key = 1;
			}
			if ( array_key_exists( $thumb_key, $thumb_ids ) ) {
				set_post_thumbnail( (int) $post_id, (int) $thumb_ids[ $thumb_key ] );
				if ( ! empty( $this->options['featured'] ) && ! empty( $post->post_parent ) ) {
					set_post_thumbnail( (int) $post->post_parent, (int) $thumb_ids[ $thumb_key ] );
				}
			}
		}
	}

	/**
	 * Action Scheduler callback to enqueue a video for encoding.
	 *
	 * @param int $post_id The ID of the video attachment.
	 */
	public function execute_batch_enqueue_action( $post_id ) {
		$formats_to_encode = array();

		if ( ! empty( $this->options['encode'] ) && is_array( $this->options['encode'] ) ) {
			foreach ( $this->options['encode'] as $format_key => $settings ) {
				if ( ! empty( $settings['enabled'] ) && $settings['enabled'] ) {
					$formats_to_encode[] = (string) $format_key;
				}
			}
		}

		if ( empty( $formats_to_encode ) ) {
			return;
		}

		$url = (string) wp_get_attachment_url( (int) $post_id );
		if ( ! $url ) {
			return;
		}

		$encode_attachment = new \Videopack\Admin\Encode\Encode_Attachment( $this->options, $this->format_registry, (int) $post_id, $url );
		$valid_formats     = array();

		foreach ( $formats_to_encode as $format_key ) {
			$can_queue_status = $encode_attachment->check_if_can_queue( (string) $format_key );
			if ( 'ok_to_queue' === $can_queue_status ) {
				$valid_formats[] = (string) $format_key;
			}
		}

		if ( ! empty( $valid_formats ) ) {
			$controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );
			$controller->enqueue_encodes(
				array(
					'id'      => (int) $post_id,
					'url'     => $url,
					'formats' => $valid_formats,
				)
			);
		}
	}

	/**
	 * Helper to process thumbnail generation batch.
	 *
	 * @return array Array containing the total count of scheduled actions.
	 */
	public function process_batch_thumbs() {
		$args   = $this->get_thumbnail_candidate_args();
		$videos = get_posts( $args );
		$count  = 0;

		$ffmpeg_exists = ! empty( $this->options['ffmpeg_exists'] ) && true === $this->options['ffmpeg_exists'];

		if ( ! $ffmpeg_exists ) {
			return array( 'total' => 0 );
		}

		foreach ( $videos as $video_id ) {
			as_enqueue_async_action(
				'videopack_generate_thumbnail',
				array( (int) $video_id ),
				'videopack-generate-thumbnails'
			);
			++$count;
		}

		return array( 'total' => $count );
	}

	/**
	 * Helper to process encoding batch.
	 *
	 * @return array Array containing the total count of scheduled actions.
	 */
	public function process_batch_encoding() {
		$args = array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'video',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_query'     => array(
				array(
					'key'     => '_kgflashmediaplayer-format',
					'compare' => 'NOT EXISTS',
				),
			),
		);

		$videos = get_posts( $args );
		$count  = 0;

		foreach ( $videos as $video_id ) {
			as_enqueue_async_action(
				'videopack_batch_enqueue_video',
				array( (int) $video_id ),
				'videopack-batch-enqueue'
			);
			++$count;
		}

		return array( 'total' => $count );
	}

	/**
	 * Helper to get arguments for finding videos without thumbnails.
	 *
	 * @return array WP_Query arguments.
	 */
	private function get_thumbnail_candidate_args() {
		return array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'video',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_query'     => array(
				'relation' => 'AND',
				array(
					'relation' => 'OR',
					array(
						'key'     => '_kgflashmediaplayer-poster',
						'compare' => 'NOT EXISTS',
					),
					array(
						'key'   => '_kgflashmediaplayer-poster',
						'value' => '',
					),
				),
				array(
					'key'     => '_kgflashmediaplayer-format',
					'compare' => 'NOT EXISTS',
				),
			),
		);
	}

	/**
	 * Helper to get a list of videos that need thumbnails generated.
	 *
	 * @return array The list of candidates.
	 */
	public function get_thumbnail_candidates() {
		$args    = $this->get_thumbnail_candidate_args();
		$videos  = get_posts( $args );
		$results = array();

		foreach ( $videos as $video_id ) {
			$results[] = array(
				'id'  => (int) $video_id,
				'url' => (string) wp_get_attachment_url( (int) $video_id ),
			);
		}

		return $results;
	}

	/**
	 * Helper function to check if an attachment is a video.
	 *
	 * @param \WP_Post|int $post Post object or ID.
	 * @return bool
	 */
	protected function is_video( $post ) {
		if ( is_numeric( $post ) ) {
			$post = get_post( (int) $post );
		}
		if ( ! $post instanceof \WP_Post ) {
			return false;
		}
		return 0 === strpos( (string) $post->post_mime_type, 'video/' ) || 'image/gif' === $post->post_mime_type;
	}

	/**
	 * Checks if a file is an animated GIF.
	 *
	 * @param string $filename Path to the file.
	 * @return bool
	 */
	protected function is_animated_gif( $filename ) {
		// Simplified implementation for now, or could depend on Attachment class.
		// For now, I'll copy the logic from Attachment.php.
		if ( ! file_exists( $filename ) ) {
			return false;
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
}
