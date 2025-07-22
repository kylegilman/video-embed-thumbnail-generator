<?php

namespace Videopack\Admin\Thumbnails;

class FFmpeg_Thumbnails {

	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;
	protected $options;

	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
	}

	public function process_thumb(
		$input,
		$output,
		$ffmpeg_path = false,
		$seek = '0',
		$rotate_array = array(),
		$filter_complex = array()
	) {

		if ( $ffmpeg_path === '' ) {
			$ffmpeg_path = 'ffmpeg';
		} elseif ( $ffmpeg_path === false ) {
			$ffmpeg_path = $this->options['app_path'] . '/ffmpeg';
		} else {
			$ffmpeg_path = $ffmpeg_path . '/ffmpeg';
		}

		$before_thumb_options = array(
			$ffmpeg_path,
			'-y',
			'-ss',
			$seek,
			'-i',
			$input,
		);

		if ( ! empty( $filter_complex['input'] ) ) {
			$before_thumb_options[] = '-i';
			$before_thumb_options[] = $filter_complex['input'];
		}

		$thumb_options = array(
			'-q:v',
			'2',
			'-vframes',
			'1',
			'-f',
			'mjpeg',
		);

		if ( ! empty( $rotate_array ) ) {
			$thumb_options = array_merge( $thumb_options, $rotate_array );
		}

		if ( ! empty( $filter_complex['input'] ) ) {
			$thumb_options[] = '-filter_complex';
			$thumb_options[] = $filter_complex['filter'];
		}

		$thumb_options[] = $output;

		$commandline = array_merge( $before_thumb_options, $thumb_options );
		$process     = new \Videopack\Admin\Encode\FFmpeg_process( $commandline );

		try {
			$process->run();
			return $process->getErrorOutput();
		} catch ( \Exception $e ) {
			return $e->getMessage();
		}
	}

	/**
	 * Generates a single temporary thumbnail image for a given video.
	 *
	 * @param int    $attachment_id    The ID of the source video attachment.
	 * @param int    $total_thumbnails The total number of thumbnails being generated in this batch.
	 * @param int    $thumbnail_index  The 1-based index of the thumbnail to generate.
	 * @param bool   $is_random        Whether to use a random offset for the timecode.
	 * @return array|\WP_Error An array with 'path' and 'url' of the generated temp file on success, or WP_Error on failure.
	 */
	public function generate_single_thumbnail_data( int $attachment_id, int $total_thumbnails, int $thumbnail_index, bool $is_random ) {
		// 1. Get video metadata.
		$input_path = get_attached_file( $attachment_id );
		if ( ! $input_path || ! file_exists( $input_path ) ) {
			return new \WP_Error( 'file_not_found', __( 'Video file not found for this attachment.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}
		$ffmpeg_path    = ! empty( $this->options['app_path'] ) ? $this->options['app_path'] . '/ffmpeg' : 'ffmpeg';
		$video_metadata = new \Videopack\Admin\Encode\Video_Metadata( $attachment_id, $input_path, true, $ffmpeg_path, $this->options_manager );
		if ( ! $video_metadata->worked || ! $video_metadata->duration ) { // Check for duration as well.
			return new \WP_Error( 'metadata_failed', __( 'Could not read video metadata.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		// 2. Calculate timecode.
		// This logic creates evenly spaced points, e.g., for 4 thumbnails, at 12.5%, 37.5%, 62.5%, 87.5%.
		$timecode = ( ( $thumbnail_index - 0.5 ) / $total_thumbnails ) * $video_metadata->duration;
		if ( $is_random ) {
			// For random, subtract a random amount from the evenly spaced point.
			$random_max_subtraction = $video_metadata->duration / $total_thumbnails;
			$random_subtraction     = ( mt_rand() / mt_getrandmax() ) * $random_max_subtraction;
			$timecode              -= $random_subtraction;
		}
		$timecode = max( 0, round( $timecode, 3 ) );
		if ( $timecode < 0 ) { // Ensure timecode is not negative.
			return new \WP_Error( 'timecode_calculation_failed', __( 'Could not calculate timecodes for thumbnails.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		// 3. Generate temp thumbnail.
		return $this->generate_temp_thumbnail( $input_path, $timecode, $video_metadata );
	}

	/**
	 * Generates a single thumbnail for a video at a specific timecode.
	 *
	 * @param int   $attachment_id The ID of the source video attachment.
	 * @param float $timecode      The time in seconds to capture the thumbnail from.
	 * @return array|\WP_Error An array with 'path' and 'url' of the generated temp file on success, or WP_Error on failure.
	 */
	public function generate_thumbnail_at_timecode( int $attachment_id, float $timecode ) {
		$input_path = get_attached_file( $attachment_id );
		if ( ! $input_path || ! file_exists( $input_path ) ) {
			return new \WP_Error( 'file_not_found', __( 'Video file not found for this attachment.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}
		$ffmpeg_path    = ! empty( $this->options['app_path'] ) ? $this->options['app_path'] . '/ffmpeg' : 'ffmpeg';
		$video_metadata = new \Videopack\Admin\Encode\Video_Metadata( $attachment_id, $input_path, true, $ffmpeg_path, $this->options_manager );
		if ( ! $video_metadata->worked ) {
			return new \WP_Error( 'metadata_failed', __( 'Could not read video metadata.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		return $this->generate_temp_thumbnail( $input_path, $timecode, $video_metadata );
	}

	/**
	 * Generates a single thumbnail image from a video at a specific timecode into a temporary directory.
	 *
	 * @param string                               $input_path     The full path to the input video file.
	 * @param float                                $timecode       The time in seconds to capture the thumbnail from.
	 * @param \Videopack\Admin\Encode\Video_Metadata $video_metadata The metadata object for the video.
	 * @return array|\WP_Error An array with 'path' and 'url' of the generated temp file on success, or WP_Error on failure.
	 */
	protected function generate_temp_thumbnail( string $input_path, float $timecode, \Videopack\Admin\Encode\Video_Metadata $video_metadata ) {
		$uploads = wp_upload_dir();
		wp_mkdir_p( $uploads['path'] . '/thumb_tmp' );

		$sanitized_basename = sanitize_file_name( pathinfo( $input_path, PATHINFO_FILENAME ) );
		$unique_id          = uniqid();
		$temp_filename      = "{$sanitized_basename}_thumb_{$unique_id}.jpg";
		$temp_filepath      = $uploads['path'] . '/thumb_tmp/' . $temp_filename;
		$temp_fileurl       = $uploads['url'] . '/thumb_tmp/' . $temp_filename;

		$rotate_strings = $this->rotate_array( $video_metadata->rotate, $video_metadata->actualwidth, $video_metadata->actualheight );
		$filter_complex = $this->filter_complex( $this->options['ffmpeg_thumb_watermark'], $video_metadata->actualheight, true );

		$output = $this->process_thumb(
			$input_path,
			$temp_filepath,
			$this->options['app_path'],
			$timecode,
			$rotate_strings['rotate'],
			$filter_complex
		);

		if ( ! is_file( $temp_filepath ) ) {
			return new \WP_Error( 'thumbnail_generation_failed', __( 'FFmpeg failed to generate the thumbnail.', 'video-embed-thumbnail-generator' ), array( 'output' => $output ) );
		}

		// Schedule cleanup for the temp directory.
		( new \Videopack\Admin\Cleanup() )->schedule( 'thumbs' );

		return array(
			'path' => $temp_filepath,
			'url'  => $temp_fileurl,
		);
	}

	public function rotate_array( $rotate, $width, $height ) {

		$rotate_complex = '';

		if ( $rotate === false ) {
			$rotate = '';
		}

		switch ( $rotate ) { // if it's a sideways mobile video

			case 90:
				if ( empty( $this->options['ffmpeg_thumb_watermark']['url'] ) ) {
					$rotate_array = array(
						'-vf',
						'transpose=1,scale=' . $height . ':-1',
					);
				} else { // Watermark exists, needs filter_complex
					$rotate_array   = array();
					$rotate_complex = 'transpose=1[rotate];[rotate]';
				}

				$rotate_array[] = '-metadata:s:v:0';
				$rotate_array[] = 'rotate=0';

				break;

			case 270:
				if ( empty( $this->options['ffmpeg_thumb_watermark']['url'] ) ) {
					$rotate_array = array(
						'-vf',
						'transpose=2',
					);
				} else { // Watermark exists, needs filter_complex
					$rotate_array   = array();
					$rotate_complex = 'transpose=2[rotate];[rotate]';
				}

				$rotate_array[] = '-metadata:s:v:0';
				$rotate_array[] = 'rotate=0';

				break;

			case 180:
				if ( empty( $this->options['ffmpeg_thumb_watermark']['url'] ) ) {
					$rotate_array = array(
						'-vf',
						'hflip,vflip',
					);
				} else { // Watermark exists, needs filter_complex
					$rotate_array   = array();
					$rotate_complex = 'hflip,vflip[rotate];[rotate]';
				}

				$rotate_array[] = '-metadata:s:v:0';
				$rotate_array[] = 'rotate=0';

				break;

			default:
				$rotate_array   = array();
				$rotate_complex = '';
				break;
		}

		$rotate_strings = array(
			'rotate'  => $rotate_array,
			'complex' => $rotate_complex,
			'width'   => $width,
			'height'  => $height,
		);

		return $rotate_strings;
	}

	public function filter_complex( $ffmpeg_watermark, $movie_height, $thumb = false ) {

		if ( is_array( $ffmpeg_watermark )
			&& array_key_exists( 'url', $ffmpeg_watermark )
			&& ! empty( $ffmpeg_watermark['url'] )
		) {

			$watermark_height = strval( round( intval( $movie_height ) * ( intval( $ffmpeg_watermark['scale'] ) / 100 ) ) );

			if ( $ffmpeg_watermark['align'] === 'right' ) {
				$watermark_align = 'main_w-overlay_w-';
			} elseif ( $ffmpeg_watermark['align'] === 'center' ) {
				$watermark_align = 'main_w/2-overlay_w/2-';
			} else {
				$watermark_align = '';
			} //left justified

			if ( $ffmpeg_watermark['valign'] === 'bottom' ) {
				$watermark_valign = 'main_h-overlay_h-';
			} elseif ( $ffmpeg_watermark['valign'] === 'center' ) {
				$watermark_valign = 'main_h/2-overlay_h/2-';
			} else {
				$watermark_valign = '';
			} //top justified

			if ( \Videopack\Common\Validate::filter_validate_url( $ffmpeg_watermark['url'] ) ) {
				$watermark_id = false;
				$watermark_id = ( new \Videopack\Admin\Attachment( $this->options_manager ) )->url_to_id( $ffmpeg_watermark['url'] );
				if ( $watermark_id ) {
					$watermark_file = get_attached_file( $watermark_id );
					if ( file_exists( $watermark_file ) ) {
						$ffmpeg_watermark['url'] = $watermark_file;
					}
				}
			}

			$watermark_filters = '[1:v]scale=-1:' . $watermark_height . '[watermark];';
			if ( $thumb ) {
				$scale_main_video = '[0:v]scale=iw*sar:ih[scaled];';
			} else {
				$scale_main_video = '[0:v]scale=-2:' . $movie_height . '[scaled];';
			}
			$overlay_watermark = '[scaled][watermark]overlay=' . $watermark_align . 'main_w*' . round( intval( $ffmpeg_watermark['x'] ) / 100, 3 ) . ':' . $watermark_valign . 'main_w*' . round( intval( $ffmpeg_watermark['y'] ) / 100, 3 );

			$filter_complex['input']  = $ffmpeg_watermark['url'];
			$filter_complex['filter'] = $watermark_filters . $scale_main_video . $overlay_watermark;

		} else {
			$filter_complex['input'] = '';
			if ( $thumb ) {
				$filter_complex['filter'] = '[0:v]scale=iw*sar:ih';
			} else {
				$filter_complex['filter'] = '[0:v]scale=-2:' . $movie_height;
			}
		}

		return $filter_complex;
	}

	/**
	 * Saves a thumbnail image to the Media Library and links it to a video attachment.
	 *
	 * This method handles both temporary files generated by FFmpeg and external URLs (sideloading).
	 * It ensures unique filenames and updates relevant post meta.
	 *
	 * @param int    $attachment_id   The ID of the video attachment to link the thumbnail to.
	 * @param string $post_name       The title of the video post (used for thumbnail title/description).
	 * @param string $thumb_url       The URL of the thumbnail image (can be a temporary local URL or an external URL).
	 * @param int|false $thumbnail_index The 1-based index of the thumbnail in a set, or false if not part of a set.
	 * @return array An associative array with 'thumb_id' (new attachment ID) and 'thumb_url' (final URL),
	 *               or an array with 'thumb_id' = false on failure.
	 */
	public function save( $attachment_id, $post_name, $thumb_url, $thumbnail_index = false ) {

		$user_ID = get_current_user_id();
		$uploads = wp_upload_dir();

		// 1. Check if this exact URL already exists as an attachment.
		$existing_attachment_id = attachment_url_to_postid( $thumb_url );
		if ( $existing_attachment_id ) {
			return array(
				'thumb_id'  => $existing_attachment_id,
				'thumb_url' => $thumb_url,
			);
		}

		$thumb_id         = false; // Initialize thumb_id to false (failure)
		$final_poster_url = $thumb_url; // Assume external URL for sideloading by default

		// Determine if the thumbnail is a temporary file generated by FFmpeg.
		$is_local_temp_file = ( strpos( $thumb_url, trailingslashit( $uploads['url'] ) . 'thumb_tmp/' ) === 0 );

		if ( $is_local_temp_file ) {
			$posterfile_basename = pathinfo( $thumb_url, PATHINFO_BASENAME ); // e.g., video_thumb_uniqueid.jpg
			$tmp_posterpath      = $uploads['path'] . '/thumb_tmp/' . $posterfile_basename;

			if ( ! is_file( $tmp_posterpath ) ) {
				// Temporary file not found, cannot proceed.
				return array(
					'thumb_id'  => false,
					'thumb_url' => $thumb_url,
				);
			}

			// Generate a unique filename in the main uploads directory.
			$filename_parts = explode( '_thumb_', $posterfile_basename ); // e.g., ['video', 'uniqueid.jpg']
			$base_filename  = sanitize_file_name( $filename_parts[0] ?? 'thumbnail' );
			$extension      = pathinfo( $posterfile_basename, PATHINFO_EXTENSION );

			$unique_suffix = uniqid();
			if ( $thumbnail_index !== false ) {
				$unique_suffix = 'idx' . $thumbnail_index . '_' . $unique_suffix;
			}
			$new_filename_base = "{$base_filename}_thumb_{$unique_suffix}";
			$final_posterpath  = $uploads['path'] . '/' . $new_filename_base . '.' . $extension;
			$final_poster_url  = $uploads['url'] . '/' . $new_filename_base . '.' . $extension;

			// Copy the temporary file to its final destination.
			$success = copy( $tmp_posterpath, $final_posterpath );
			wp_delete_file( $tmp_posterpath ); // Clean up the temporary file immediately.

			if ( ! $success ) {
				return array(
					'thumb_id' => false,
					'thumb_url' => $thumb_url,
				); // Failed to copy.
			}

			$desc = $post_name . ' ' . esc_html_x( 'thumbnail', 'text appended to newly created thumbnail titles', 'video-embed-thumbnail-generator' );
			if ( $thumbnail_index ) {
				$desc .= ' ' . $thumbnail_index;
			}

			$video     = get_post( $attachment_id );
			$parent_id = $attachment_id; // The video is the parent by default.
			if ( $this->options['thumb_parent'] === 'post' ) {
				if ( ! empty( $video->post_parent ) ) {
					$parent_id = $video->post_parent; // The parent post becomes the parent.
				}
			}

			$wp_filetype = wp_check_filetype( basename( $final_posterpath ), null );
			if ( empty( $wp_filetype['type'] ) ) {
				// Fallback if filetype is not detected (e.g., due to missing extension)
				$wp_filetype['type'] = 'image/jpeg';
			}

			if ( $user_ID == 0 ) { // If no user ID, use video's author.
				$user_ID = $video->post_author;
			}

			$attachment = array(
				'guid'           => $final_poster_url,
				'post_mime_type' => $wp_filetype['type'],
				'post_title'     => $desc,
				'post_content'   => '',
				'post_status'    => 'inherit',
				'post_author'    => $user_ID,
			);

			$thumb_id = wp_insert_attachment( $attachment, $final_posterpath, $parent_id ); // Insert attachment.
			// you must first include the image.php file
			// for the function wp_generate_attachment_metadata() to work
			require_once ABSPATH . 'wp-admin/includes/image.php';
			$attach_data = wp_generate_attachment_metadata( $thumb_id, $final_posterpath );
			wp_update_attachment_metadata( $thumb_id, $attach_data );
		} else { // Not a local temporary file, so it's an external URL to sideload.
			$tmp = download_url( $thumb_url );

			// Set variables for storage
			// fix file filename for query strings
			preg_match( '/[^\?]+\.(jpg|JPG|jpe|JPE|jpeg|JPEG|gif|GIF|png|PNG)/', $thumb_url, $matches );
			$file_array['name']     = basename( $matches[0] ?? 'thumbnail.jpg' ); // Ensure a default name.
			$file_array['tmp_name'] = $tmp;

			// If error storing temporarily, delete
			if ( is_wp_error( $tmp ) ) {
				wp_delete_file( $file_array['tmp_name'] );
				$arr = array(
					'thumb_id'  => false,
					'thumb_url' => $thumb_url,
				);
				return $arr;
			}

			// do the validation and storage stuff
			$thumb_id = media_handle_sideload( $file_array, $parent_id, $desc ); // Sideload the file.

			// If error storing permanently, delete
			if ( is_wp_error( $thumb_id ) ) {
				wp_delete_file( $file_array['tmp_name'] );
				$arr = array(
					'thumb_id'  => $thumb_id,
					'thumb_url' => $thumb_url,
				);
				return $arr;
			}

			// After sideload, the final URL is wp_get_attachment_url($thumb_id)
			$final_poster_url = wp_get_attachment_url( $thumb_id );
		}

		// Update post meta for the video attachment.
		// Use the new _videopack-meta key for consistency.
		$attachment_meta_instance = new \Videopack\Admin\Attachment_Meta( $this->options_manager, $attachment_id );
		$current_meta             = $attachment_meta_instance->get();
		$current_meta['poster']   = $final_poster_url;
		$current_meta['poster_id'] = intval( $thumb_id );
		$attachment_meta_instance->save( $current_meta );

		// Also update the thumbnail's own meta to link back to the video.
		update_post_meta( $thumb_id, '_videopack-video-id', $attachment_id );

		// Return the final result.
		$arr = array(
			'thumb_id'  => $thumb_id,
			'thumb_url' => $final_poster_url,
		);
		return $arr;
	}
}
