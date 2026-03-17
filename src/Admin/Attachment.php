<?php
/**
 * Admin attachment handler.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

/**
 * Class Attachment
 *
 * Attachment class for handling video attachments and thumbnails in the admin.
 *
 * This class provides utility methods for working with video attachments,
 * including URL-to-ID resolution, video type detection (including animated GIFs),
 * cleanup management, and integration with the encoding queue.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Attachment {

	/**
	 * Videopack Options manager class instance.
	 *
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Video formats.
	 *
	 * @var array $video_formats
	 */
	protected $video_formats;

	/**
	 * Attachment meta handler.
	 *
	 * @var \Videopack\Admin\Attachment_Meta $attachment_meta
	 */
	protected $attachment_meta;

	/**
	 * Constructor.
	 *
	 * @param \Videopack\Admin\Options $options_manager Videopack Options manager class instance.
	 */
	public function __construct( \Videopack\Admin\Options $options_manager ) {

		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->video_formats   = $options_manager->get_video_formats();
		$this->attachment_meta = new \Videopack\Admin\Attachment_Meta( $options_manager );
	}

	/**
	 * Converts a URL to an attachment ID, with optional transient caching.
	 *
	 * @param string $url The URL to convert.
	 * @return int|null The attachment ID, or null if not found.
	 */
	public function url_to_id( $url ) {

		$post_id    = false;
		$search_url = $this->get_transient_name( (string) $url );

		if ( ! empty( $this->options['transient_cache'] ) ) {
			$post_id = get_transient( 'videopack_url_cache_' . md5( $search_url ) );
		}

		if ( false === $post_id ) {

			$post_id = attachment_url_to_postid( $search_url );

			if ( ! empty( $this->options['transient_cache'] ) ) {
				if ( ! $post_id ) {
					$post_id = 'not found'; // Don't save a transient value that could evaluate as false.
				}

				set_transient( 'videopack_url_cache_' . md5( $search_url ), $post_id, MONTH_IN_SECONDS );
			}
		}

		if ( 'not found' === $post_id ) {
			$post_id = null;
		}

		/**
		 * Filters the post ID returned for a given URL.
		 *
		 * @param int|null $post_id The post ID.
		 * @param string   $url     The URL.
		 */
		return (int) apply_filters( 'videopack_url_to_id', (int) $post_id, $url );
	}

	/**
	 * Checks if a file is an animated GIF.
	 *
	 * @param string $filename Path to the file.
	 * @return bool True if animated GIF, false otherwise.
	 */
	public function is_animated_gif( $filename ) {
		// Attempt to use Imagick if available.
		if ( class_exists( 'Imagick' ) ) {
			try {
				$image  = new \Imagick( $filename );
				$frames = $image->coalesceImages();

				$count = 0;
				foreach ( $frames as $frame ) {
					++$count;
					if ( $count > 1 ) {
						return true;
					}
				}
			} catch ( \Exception $e ) {
				return false;
			}
		}

		// Read file in chunks if Imagick isn't available.
		$fh = fopen( $filename, 'rb' );

		if ( ! $fh ) {
			return false;
		}

		$total_count = 0;
		$chunk       = '';

		while ( ! feof( $fh ) && $total_count < 2 ) {
			// Read 100kb at a time and append it to the remaining chunk.
			$chunk       .= fread( $fh, 1024 * 100 );
			$count        = preg_match_all( '#\x00\x21\xF9\x04.{4}\x00(\x2C|\x21)#s', $chunk, $matches );
			$total_count += $count;

			// Execute this block only if we found at least one match,
			// and if we did not reach the maximum number of matches needed.
			if ( $count > 0 && $total_count < 2 ) {
				// Get the last full expression match.
				$last_match = (string) end( $matches[0] );
				// Get the string after the last match.
				$end   = strrpos( $chunk, $last_match ) + strlen( $last_match );
				$chunk = substr( $chunk, $end );
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
			// A video is considered a "master" video if:
			// 1. It has no parent.
			// 2. Its parent is not a video (e.g., it's attached to a post).
			// 3. It is a remote placeholder (has external URL meta), even if attached to a post.
			if ( empty( $post->post_parent ) || (int) $post->post_parent === (int) $post->ID ) {
				return true;
			}

			// If it has a parent, check if the parent is a video.
			$parent_mime = get_post_mime_type( (int) $post->post_parent );
			if ( ! $parent_mime || 0 !== strpos( (string) $parent_mime, 'video/' ) ) {
				return true;
			}

			// If parent is a video, it might still be a master if it's a remote placeholder.
			if ( ! empty( get_post_meta( $post->ID, '_kgflashmediaplayer-externalurl', true ) ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Handles cleanup when a video attachment is deleted.
	 *
	 * @param int $video_id The attachment ID.
	 */
	public function delete_video_attachment( $video_id ) {
		$mime_type = get_post_mime_type( (int) $video_id );

		if ( ( $mime_type && strpos( (string) $mime_type, 'video' ) !== false )
			|| get_post_meta( (int) $video_id, '_kgflashmediaplayer-format', true )
		) { // Only do this for videos or other child formats.

			$encode_queue = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options_manager );

			// If this is a child attachment, find the corresponding job and delete it.
			$parent_id = wp_get_post_parent_id( (int) $video_id );
			if ( $parent_id ) {
				$format_id = get_post_meta( (int) $video_id, '_kgflashmediaplayer-format', true );
				if ( $format_id ) {
					$encoder       = new \Videopack\Admin\Encode\Encode_Attachment( $this->options_manager, (int) $parent_id );
					$encode_format = $encoder->get_encode_format( (string) $format_id );
					if ( $encode_format && $encode_format->get_job_id() ) {
						$encode_queue->delete_job( (int) $encode_format->get_job_id(), false );
					}
				}
			} else { // This is a parent attachment, delete all its jobs.
				$encoder = new \Videopack\Admin\Encode\Encode_Attachment( $this->options_manager, (int) $video_id );
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
				}//end loop
				if ( ! empty( $formats ) ) { // Find a child to be the new master video.
					$video_formats = $this->options_manager->get_video_formats();
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
				// End if there are any children.
			}
			// End if video or other child format.
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

		$transient_name = $this->get_transient_name( (string) wp_get_attachment_url( (int) $video_id ) );
		delete_transient( 'kgvid_' . (string) $transient_name );
	}

	/**
	 * Handler for the 'add_attachment' hook.
	 *
	 * @param int $post_id The attachment ID.
	 */
	public function add_attachment_handler( $post_id ) {
		if ( ! empty( $this->options['auto_encode'] ) || ! empty( $this->options['auto_thumb'] ) ) {
			$post = get_post( (int) $post_id );
			if ( $this->is_video( $post ) ) {
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
			// If a thumbnail already exists, the frontend script probably succeeded.
			if ( ! has_post_thumbnail( (int) $post_id ) ) {
				if ( ! empty( $this->options['ffmpeg_exists'] ) && true === $this->options['ffmpeg_exists'] ) {
					$this->generate_thumbnails_with_ffmpeg( (int) $post_id );
				} elseif ( ! empty( $this->options['browser_thumbnails'] ) && true === $this->options['browser_thumbnails'] ) {
					// FFmpeg is not available. Flag for deferred browser-based generation.
					update_post_meta( (int) $post_id, '_videopack_needs_browser_thumb', true );
				}
			}
		}

		// Encoding.
		if ( ! empty( $this->options['auto_encode'] ) ) {
			$is_animated = ( 'image/gif' === $post->post_mime_type ) ? $this->is_animated_gif( (string) get_attached_file( (int) $post_id ) ) : false;
			if ( ( ! $is_animated || ! empty( $this->options['auto_encode_gif'] ) ) && $this->is_video( $post ) ) {
				$encode_queue      = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options_manager );
				$movieurl          = (string) wp_get_attachment_url( (int) $post_id );
				$encode_attachment = new \Videopack\Admin\Encode\Encode_Attachment( $this->options_manager, (int) $post_id, $movieurl );

				$all_formats       = $this->options_manager->get_video_formats();
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
	 * Clears the 'needs browser thumb' flag when a thumbnail is set.
	 *
	 * @param int    $meta_id    ID of the meta data entry.
	 * @param int    $object_id  ID of the object the meta is attached to.
	 * @param string $meta_key   Meta key.
	 * @param mixed  $meta_value Meta value.
	 */
	public function clear_browser_thumb_flag( $meta_id, $object_id, $meta_key, $meta_value ) {
		unset( $meta_value );
		if ( '_thumbnail_id' === $meta_key ) {
			delete_post_meta( (int) $object_id, '_videopack_needs_browser_thumb' );
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

		if ( ! empty( $post->post_parent )
			&& ! empty( $video_thumbnail_id )
			&& empty( $post_thumbnail_id )
		) {
			set_post_thumbnail( (int) $post->post_parent, (int) $video_thumbnail_id );
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
		$thumbnails = get_posts( $args ); // Find all thumbnail children of the video in the database.

		if ( $thumbnails ) {

			foreach ( $thumbnails as $thumbnail ) {

				if ( (int) $thumbnail->post_parent !== (int) $parent_id ) {

					if ( empty( $parent_id ) ) {
						$thumbnail->post_parent = (int) $post_id;
					} else { // Parent post exists.
						$thumbnail->post_parent = (int) $parent_id;
					}

					wp_update_post( $thumbnail );
				}
			}//end loop through thumbnails
		}//end if thumbnails
	}

	/**
	 * Validates and updates attachment data when modified.
	 *
	 * @param int $post_id The attachment ID.
	 */
	public function validate_attachment_updated( $post_id ) {

		$post     = get_post( (int) $post_id );
		$is_video = $this->is_video( $post );

		if ( $is_video && $post instanceof \WP_Post ) {
			if ( ( $this->options['thumb_parent'] ?? 'post' ) === 'post' ) {
				$this->change_thumbnail_parent( (int) $post_id, (int) $post->post_parent );
			}

			$featured_id        = get_post_meta( (int) $post_id, '_kgflashmediaplayer-poster-id', true );
			$videopack_postmeta = $this->attachment_meta->get( (int) $post_id );
			// This doesn't always get set in the old Media Library view.
			set_post_thumbnail( (int) $post_id, (int) $featured_id );
			if ( ( $videopack_postmeta['featuredchanged'] ?? '' ) === 'true'
				&& ! empty( $featured_id )
				&& ! empty( $post->post_parent )
			) {
				set_post_thumbnail( (int) $post->post_parent, (int) $featured_id );
			}
		}
	}

	/**
	 * Gets a sanitized name for use in transients.
	 *
	 * @param string $url The URL to sanitize.
	 * @return string The sanitized URL for transient use.
	 */
	public function get_transient_name( $url ) {

		$url = str_replace( ' ', '', (string) $url ); // In case a url with spaces got through.
		// Get the path or the original size image by slicing the widthxheight off the end and adding the extension back.
		$search_url = (string) preg_replace( '/-\d+x\d+(\.(?:png|jpg|gif))$/i', '.' . (string) pathinfo( $url, PATHINFO_EXTENSION ), $url );

		return $search_url;
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
	 * Action Scheduler callback to set the featured image.
	 *
	 * @param int $parent_id The ID of the parent post.
	 * @param int $poster_id The ID of the attachment to set as featured.
	 */
	public function execute_featured_image_action( $parent_id, $poster_id ) {
		set_post_thumbnail( (int) $parent_id, (int) $poster_id );
	}

	/**
	 * Action Scheduler callback to switch the parent of a thumbnail.
	 *
	 * @param int    $thumbnail_id The ID of the thumbnail attachment.
	 * @param string $target_type  The target type ('post' or 'video').
	 * @param int    $target_id    The ID of the new parent.
	 * @param int    $video_id     The ID of the video attachment (used when switching to post).
	 */
	public function execute_switch_parent_action( $thumbnail_id, $target_type, $target_id, $video_id = 0 ) {
		if ( 'post' === $target_type ) {
			wp_update_post(
				array(
					'ID'          => (int) $thumbnail_id,
					'post_parent' => (int) $target_id,
				)
			);
			if ( $video_id ) {
				update_post_meta( (int) $thumbnail_id, '_kgflashmediaplayer-video-id', (int) $video_id );
			}
		} elseif ( 'video' === $target_type ) {
			wp_update_post(
				array(
					'ID'          => (int) $thumbnail_id,
					'post_parent' => (int) $target_id,
				)
			);
		}
	}

	/**
	 * Action Scheduler callback to enqueue a video for encoding.
	 *
	 * @param int $post_id The ID of the video attachment.
	 */
	public function execute_batch_enqueue_action( $post_id ) {
		$options           = $this->options_manager->get_options();
		$formats_to_encode = array();

		if ( ! empty( $options['encode'] ) && is_array( $options['encode'] ) ) {
			foreach ( $options['encode'] as $format_key => $settings ) {
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

		$encode_attachment = new \Videopack\Admin\Encode\Encode_Attachment( $this->options_manager, (int) $post_id, $url );
		$valid_formats     = array();

		foreach ( $formats_to_encode as $format_key ) {
			$can_queue_status = $encode_attachment->check_if_can_queue( (string) $format_key );
			if ( 'ok_to_queue' === $can_queue_status ) {
				$valid_formats[] = (string) $format_key;
			}
		}

		if ( ! empty( $valid_formats ) ) {
			$controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options_manager );
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
	 * Generates thumbnails for a video using FFmpeg.
	 *
	 * @param int $post_id The ID of the video attachment.
	 */
	public function generate_thumbnails_with_ffmpeg( $post_id ) {
		if ( empty( $this->options['ffmpeg_exists'] ) || true !== $this->options['ffmpeg_exists'] ) {
			if ( ! empty( $this->options['browser_thumbnails'] ) && true === $this->options['browser_thumbnails'] ) {
				update_post_meta( (int) $post_id, '_videopack_needs_browser_thumb', 1 );
			}
			return;
		}

		$post = get_post( (int) $post_id );
		if ( ! $post instanceof \WP_Post ) {
			return;
		}

		$ffmpeg_thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options_manager );
		$filepath          = (string) get_attached_file( (int) $post_id );
		$thumb_ids         = array();
		$total_thumbs      = intval( $this->options['auto_thumb_number'] ?? 1 );

		if ( 1 === $total_thumbs ) {
			$ffmpeg_path    = ! empty( $this->options['app_path'] ) ? (string) $this->options['app_path'] . '/ffmpeg' : 'ffmpeg';
			$video_metadata = new \Videopack\Admin\Encode\Video_Metadata( (int) $post_id, $filepath, true, $ffmpeg_path, $this->options_manager );

			if ( $video_metadata->worked && ! empty( $video_metadata->duration ) ) {
				$position = intval( $this->options['auto_thumb_position'] ?? 0 );
				$timecode = 0.1; // Default to 0.1s to avoid black frames.
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
	 * Helper to process featured images batch.
	 *
	 * @return array Array containing the total count of scheduled actions.
	 */
	public function process_batch_featured() {
		$args = array(
			'post_type'      => 'attachment',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'meta_query'     => array(
				array(
					'key'     => '_kgflashmediaplayer-poster-id',
					'compare' => 'EXISTS',
				),
			),
			'fields'         => 'ids',
		);

		$attachments = get_posts( $args );
		$count       = 0;

		foreach ( $attachments as $att_id ) {
			$poster_id = get_post_meta( (int) $att_id, '_kgflashmediaplayer-poster-id', true );
			$parent_id = wp_get_post_parent_id( (int) $att_id );

			if ( $parent_id && $poster_id ) {
				as_enqueue_async_action(
					'videopack_set_featured_image',
					array( (int) $parent_id, (int) $poster_id ),
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
	 * @param string $target_parent The target parent type ('post' or 'video').
	 * @return array Array containing the total count of scheduled actions.
	 */
	public function process_batch_parents( $target_parent ) {
		$count = 0;

		if ( 'post' === $target_parent ) {
			// Find all video attachments.
			$videos = get_posts(
				array(
					'post_type'      => 'attachment',
					'post_mime_type' => 'video',
					'post_status'    => 'any',
					'posts_per_page' => -1,
					'fields'         => 'ids',
				)
			);

			foreach ( $videos as $video_id ) {
				$parent_id = wp_get_post_parent_id( (int) $video_id );
				if ( $parent_id ) {
					// Find image children of this video.
					$thumbnails = get_posts(
						array(
							'post_parent'    => (int) $video_id,
							'post_type'      => 'attachment',
							'post_mime_type' => 'image',
							'post_status'    => 'any',
							'posts_per_page' => -1,
							'fields'         => 'ids',
						)
					);

					foreach ( $thumbnails as $thumb_id ) {
						as_enqueue_async_action(
							'videopack_switch_thumbnail_parent',
							array( (int) $thumb_id, 'post', (int) $parent_id, (int) $video_id ),
							'videopack-parent-switching'
						);
						++$count;
					}
				}
			}
		} elseif ( 'video' === $target_parent ) {
			// Find thumbnails that have the video ID stored in meta.
			$thumbnails = get_posts(
				array(
					'post_type'      => 'attachment',
					'post_mime_type' => 'image',
					'post_status'    => 'any',
					'meta_key'       => '_kgflashmediaplayer-video-id',
					'posts_per_page' => -1,
					'fields'         => 'ids',
				)
			);

			foreach ( $thumbnails as $thumb_id ) {
				$video_id = get_post_meta( (int) $thumb_id, '_kgflashmediaplayer-video-id', true );
				if ( $video_id ) {
					as_enqueue_async_action(
						'videopack_switch_thumbnail_parent',
						array( (int) $thumb_id, 'video', (int) $video_id, 0 ),
						'videopack-parent-switching'
					);
					++$count;
				}
			}
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
	 * Retrieves a list of attachments that need browser-based thumbnail generation.
	 *
	 * @return array List of attachments with 'id' and 'url'.
	 */
	public function get_pending_browser_thumbnails() {
		// Only proceed if browser thumbnails are enabled and user has capability.
		if ( empty( $this->options['browser_thumbnails'] ) || ! current_user_can( 'make_video_thumbnails' ) ) {
			return array();
		}

		$query = new \WP_Query(
			array(
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'posts_per_page' => 20, // Limit to avoid performance issues.
				'meta_query'     => array(
					array(
						'key'   => '_videopack_needs_browser_thumb',
						'value' => '1',
					),
				),
				'fields'         => 'ids',
			)
		);

		$attachments = array();
		if ( is_array( $query->posts ) ) {
			foreach ( $query->posts as $post_id ) {
				$url = (string) wp_get_attachment_url( (int) $post_id );
				if ( $url ) {
					$attachments[] = array(
						'id'  => (int) $post_id,
						'url' => $url,
					);
				}
			}
		}
		return $attachments;
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

		// Check for existing attachment with this external URL that is NOT a child format.
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
			// Update parent if it's currently 0 or different?
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

		// Create a new remote attachment.
		$filename = basename( $url );
		$title    = (string) pathinfo( $filename, PATHINFO_FILENAME );
		$title    = str_replace( '-', ' ', $title );

		$filetype = wp_check_filetype( $url );
		$mime     = ! empty( $filetype['type'] ) ? $filetype['type'] : 'video/mp4';

		$attachment_data = array(
			'post_title'     => $title,
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'post_parent'    => (int) $parent_id,
			'post_mime_type' => $mime,
			'post_content'   => $url, // Store the URL in the description for easy searching.
		);

		$attachment_id = wp_insert_post( $attachment_data );

		if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
			return new \WP_Error( 'create_failed', __( 'Could not create remote attachment.', 'video-embed-thumbnail-generator' ) );
		}

		update_post_meta( (int) $attachment_id, '_kgflashmediaplayer-externalurl', $url );
		// Flag to easily identify these for hiding from media library.
		update_post_meta( (int) $attachment_id, '_kgflashmediaplayer-external-remote', 'true' );

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
		if ( $external_url ) {
			return (string) $external_url;
		}
		return (string) $url;
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
				if ( is_admin() && function_exists( 'get_current_screen' ) ) {
					$screen = get_current_screen();
					if ( $screen instanceof \WP_Screen && 'upload' === $screen->id ) {
						return '/[External URL] ' . basename( (string) $external_url );
					}
				}
				return (string) $external_url;
			}
		}
		return (string) $file;
	}
}
