<?php

namespace Videopack\Admin\Encode;

class Encode_Attachment {
	/**
	 * The ID of the video attachment.
	 *
	 * @var int|string
	 */
	protected $id;

	/**
	 * The URL of the video.
	 *
	 * @var string
	 */
	protected $url;

	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;
	protected $options;
	protected $attachment_manager;
	protected $uploads;
	protected $video_formats;
	protected $available_formats;
	protected $encode_formats;
	protected $queue_log;
	protected $is_attachment;
	protected $video_metadata;
	protected $encode_input;
	protected $codecs;
	protected $encode_info = array();
	protected $ffmpeg_path;
	protected $queue_table_name;
	protected $current_temp_watermark_path = null;

	/**
	 * Constructor.
	 *
	 * @param \Videopack\Admin\Options $options_manager
	 * @param int|string $id The ID of the video attachment.
	 * @param string $url The URL of the video if it's not an attachment.
	 */
	public function __construct(
		\Videopack\Admin\Options $options_manager,
		$id,
		string $url = null
	) {
		$this->options_manager    = $options_manager;
		$this->options            = $options_manager->get_options();
		$this->attachment_manager = new \Videopack\Admin\Attachment( $options_manager );
		$this->id                 = $id;
		$this->url                = $url;
		$this->uploads            = wp_upload_dir();
		$this->video_formats      = $options_manager->get_video_formats();
		$this->queue_log          = array();
		$this->set_is_attachment();
		$this->set_encode_formats();
		$this->set_queue_table_name();
		$this->set_ffmpeg_path();
	}

	protected function set_is_attachment() {
		if ( is_numeric( $this->id ) ) {
			$this->is_attachment = get_post_type( $this->id ) === 'attachment';
		} else {
			$this->is_attachment = false;
		}
		if ( $this->is_attachment ) {
			$this->encode_input = get_attached_file( $this->id );
			if ( ! $this->url ) {
				$this->url = wp_get_attachment_url( $this->id );
			}
		} else {
			$this->encode_input = $this->url;
		}
	}

	/**
	 * Retrieve an array of Encode_Format objects for each queued job for this attachment.
	 *
	 * @return array An array of Encode_Format objects.
	 */
	protected function set_encode_formats() {
		global $wpdb;
		$this->encode_formats = array();
		$results              = null;
		$current_blog_id      = get_current_blog_id(); // Assumes context is correctly set by caller

		if ( $this->is_attachment && is_numeric( $this->id ) ) {
			$results = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i WHERE attachment_id = %d AND blog_id = %d', $this->queue_table_name, $this->id, $current_blog_id ), ARRAY_A );
		} elseif ( ! empty( $this->url ) ) {
			$results = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i WHERE input_url = %s AND blog_id = %d', $this->queue_table_name, $this->url, $current_blog_id ), ARRAY_A );
		} else {
			return; // Not enough info to fetch formats
		}

		if ( $results ) {
			foreach ( $results as $job_data ) {
				// Add the DB row ID as 'job_id' to the data array for Encode_Format
				$job_data['job_id']     = $job_data['id'];
				$this->encode_formats[] = Encode_Format::from_array( $job_data );
			}
		}
	}

	protected function set_queue_table_name() {
		global $wpdb;
		if ( is_multisite() ) {
			$main_site_id = defined( 'BLOG_ID_CURRENT_SITE' ) ? BLOG_ID_CURRENT_SITE : 1;
			$this->queue_table_name = $wpdb->get_blog_prefix( $main_site_id ) . 'videopack_encoding_queue';
		} else {
			$this->queue_table_name = $wpdb->prefix . 'videopack_encoding_queue';
		}
	}

	protected function set_ffmpeg_path() {
		if ( empty( $this->options['app_path'] ) ) { // Handles '' and false
			$this->ffmpeg_path = 'ffmpeg';
		} else {
			$this->ffmpeg_path = $this->options['app_path'] . '/ffmpeg';
		}
	}

	protected function save_format( Encode_Format $encode_format ) {
		global $wpdb;
		$job_id = $encode_format->get_job_id();

		if ( ! $job_id ) {
			// Cannot save if we don't know which DB job this format corresponds to.
			// Log an error or handle appropriately.
			return;
		}

		$data_to_save = $encode_format->to_array();
		// Remove fields that are auto-managed by DB (like 'id' if it's part of to_array)
		// or fields that shouldn't be directly updated from Encode_Format state.
		// For example, 'id' from the DB table is $job_id, not $encode_format->get_id() (which is child attachment ID).
		// We need to map Encode_Format properties to DB columns carefully.

		$db_data = array(
			'status'              => $data_to_save['status'],
			'output_path'         => $data_to_save['path'], // Mapped from 'path'
			'output_url'          => $data_to_save['url'],  // Mapped from 'url'
			'pid'                 => $data_to_save['pid'],
			'logfile_path'        => $data_to_save['logfile'],
			'started_at'          => $data_to_save['started'] ? gmdate( 'Y-m-d H:i:s', $data_to_save['started'] ) : null,
			'completed_at'        => $data_to_save['ended'] ? gmdate( 'Y-m-d H:i:s', $data_to_save['ended'] ) : null, // Assuming 'ended' is completion
			'error_message'       => $data_to_save['error'],
			'temp_watermark_path' => $data_to_save['temp_watermark_path'],
			// 'updated_at' will be handled by DB trigger `ON UPDATE CURRENT_TIMESTAMP`
		);

		// If status is 'failed', set 'failed_at'
		if ( 'failed' === $data_to_save['status'] ) {
			// Check if failed_at is already set in the DB to avoid overwriting it.
			$current_failed_at = $wpdb->get_var( $wpdb->prepare( 'SELECT failed_at FROM %i WHERE id = %d', $this->queue_table_name, $job_id ) );
			if ( empty( $current_failed_at ) ) {
				$db_data['failed_at'] = current_time( 'mysql', true );
			}
		}

		// Remove null values to avoid overwriting existing DB values with NULL if not intended.
		$db_data = array_filter(
			$db_data,
			function ( $value ) {
				return ! is_null( $value );
			}
		);

		if ( ! empty( $db_data ) ) {
			$wpdb->update( $this->queue_table_name, $db_data, array( 'id' => $job_id ) );
		}

		// After saving to DB, refresh $this->encode_formats if necessary,
		// though ideally, the object in $this->encode_formats is the same one we just saved.
		// $this->set_encode_formats(); // Optional: re-fetch to ensure consistency if many changes.
	}

	public function get_formats() {
		if ( ! $this->encode_formats ) {
			$this->set_encode_formats();
		}
		return $this->encode_formats;
	}

	public function get_available_formats() {
		if ( ! $this->available_formats ) {
			$this->set_available_formats();
		}
		return $this->available_formats;
	}

	public function get_encode_format( string $format ) {
		$encode_formats = $this->get_formats();
		if ( $encode_formats ) {
			foreach ( $encode_formats as $encode_format_obj ) {
				if ( $encode_format_obj->get_format_id() === $format ) {
					return $encode_format_obj;
				}
			}
		}
		return null; // Return null if not found, was returning $encode_formats
	}

	public function get_encode_format_by_job_id( int $job_id ) {
		$encode_formats = $this->get_formats(); // This now reads from DB
		if ( $encode_formats ) {
			foreach ( $encode_formats as $encode_format_obj ) {
				if ( $encode_format_obj->get_job_id() === $job_id ) {
					return $encode_format_obj;
				}
			}
		}
		return null;
	}

	public function get_formats_by_status( string $status ) {
		global $wpdb;
		$formats = array();
		$results = null;
		$current_blog_id = get_current_blog_id(); // Assumes context is correctly set by caller

		if ( $this->is_attachment && is_numeric( $this->id ) ) {
			$results = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i WHERE attachment_id = %d AND blog_id = %d AND status = %s', $this->queue_table_name, $this->id, $current_blog_id, $status ), ARRAY_A );
		} elseif ( ! empty( $this->url ) ) {
			$results = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i WHERE input_url = %s AND blog_id = %d AND status = %s', $this->queue_table_name, $this->url, $current_blog_id, $status ), ARRAY_A );
		} else {
			return $formats; // Not enough info.
		}
		if ( $results ) {
			foreach ( $results as $job_data ) {
				$job_data['job_id'] = $job_data['id'];
				$formats[]          = Encode_Format::from_array( $job_data );
			}
		}
		return $formats;
	}

	public function get_formats_array() {
		// This method might need to change its purpose or be removed if
		// Encode_Queue_Controller directly queries the DB for array representations.
		// For now, it converts the Encode_Format objects (from DB) to arrays.
		$formats_array       = array();
		$encode_formats_objs = $this->get_formats(); // This now gets objects from DB
		if ( $encode_formats_objs ) {
			foreach ( $encode_formats_objs as $encode_format_obj ) {
				$formats_array[] = $encode_format_obj->to_array();
			}
		}
		return $formats_array;
	}

	// start_next_format() is superseded by Encode_Queue_Controller::handle_job_action()
	// public function start_next_format() { ... }

	public function start_encode( Encode_Format $encode_format ) {

		// Ensure encode_array is set on the object if not already
		if ( ! $encode_format->get_encode_array() ) {
			$this->set_encode_array( $encode_format ); // This will set logfile and encode_array on $encode_format
		}
		$encode_array = $encode_format->get_encode_array();

		if ( empty( $encode_array ) ) {
			$encode_format->set_error( __( 'FFmpeg command array is empty. Cannot start encoding.', 'video-embed-thumbnail-generator' ) );
			$this->save_format( $encode_format ); // Save error to DB
			return $encode_format;
		}

		$process = new FFmpeg_Process( $encode_array );
		try {
			$process->start(); // Starts the process in the background
			// It might take a moment for the OS to assign and report the PID
			// A small sleep might be useful but can be unreliable.
			// FFmpeg_Process should ideally handle PID retrieval robustly.
			sleep( 1 ); // Keep for now, but review FFmpeg_Process
			$pid = $process->getPID();
			if ( $pid ) {
				$encode_format->set_encode_start( $pid, time() );
			} else {
				// Attempt to get error output if PID is not available
				$error_output = $process->getErrorOutput();
				$std_output   = $process->getOutput();
				$error_msg    = __( 'Failed to get PID after starting FFmpeg.', 'video-embed-thumbnail-generator' );
				if ( ! empty( $error_output ) ) {
					$error_msg .= ' Error Output: ' . $error_output;
				}
				if ( ! empty( $std_output ) ) {
					$error_msg .= ' Standard Output: ' . $std_output;
				}
				$encode_format->set_error( $error_msg );
			}
		} catch ( \Symfony\Component\Process\Exception\ProcessTimedOutException $e ) {
			$encode_format->set_error( __( 'FFmpeg process timed out on start: ', 'video-embed-thumbnail-generator' ) . $e->getMessage() );
		} catch ( \Symfony\Component\Process\Exception\ProcessFailedException $e ) {
			$encode_format->set_error( __( 'FFmpeg process failed on start: ', 'video-embed-thumbnail-generator' ) . $e->getMessage() . ' Output: ' . $e->getProcess()->getErrorOutput() );
		} catch ( \Exception $e ) {
			$encode_format->set_error( __( 'General error starting FFmpeg: ', 'video-embed-thumbnail-generator' ) . $e->getMessage() );
		} finally {
			$this->save_format( $encode_format ); // Save PID, status, logfile, or error to DB
			return $encode_format;
		}
	}

	public function get_encode_array( Encode_Format $encode_format ) {

		if ( ! $encode_format->get_encode_array() ) {
			return $this->set_encode_array( $encode_format );
		} else {
			return $encode_format->get_encode_array();
		}
	}

	protected function get_encode_dimensions( Encode_Format $encode_format ) {

		// Default dimensions, used if metadata is unavailable or format config is missing.
		$encode_movie_width  = 640;
		$encode_movie_height = 360;

		$video_metadata = $this->get_video_metadata(); // Instance of Video_Metadata

		if ( $video_metadata && $video_metadata->worked && $video_metadata->actualwidth && $video_metadata->actualheight ) {
			$source_w = (int) $video_metadata->actualwidth;
			$source_h = (int) $video_metadata->actualheight;

			$format_id           = $encode_format->get_format_id();
			$video_format_config = $this->video_formats[ $format_id ] ?? null; // Video_Format object
			$resolution_config   = $video_format_config ? $video_format_config->get_resolution() : null; // Video_Resolution object

			if ( $resolution_config ) {

				if ( $video_format_config->get_replaces_original() ) { // Check if it's the 'fullres' format
					$max_w_for_format = $source_w;
					$max_h_for_format = $source_h; // Use source dimensions for 'fullres'
				} else {
					// If not 'fullres', get the height from the resolution configuration.
					$max_h_for_format = (int) $resolution_config->get_height();
					// This is an assumed max width for the format if not otherwise specified, based on a 16:9 aspect for the target height.
					$max_w_for_format = (int) round( $max_h_for_format * ( 16 / 9 ) );
				}

				// Calculate width based on source aspect ratio, capped by max_w_for_format
				if ( $source_h > 0 ) {
					$target_w_for_max_h = (int) round( ( $source_w / $source_h ) * $max_h_for_format );
				} else {
					$target_w_for_max_h = $source_w; // Avoid division by zero, use source width
				}
				$encode_movie_width = min( $source_w, $max_w_for_format, $target_w_for_max_h );

				// Calculate height based on the new width, maintaining aspect ratio
				if ( $source_w > 0 ) {
					$encode_movie_height = (int) round( ( $source_h / $source_w ) * $encode_movie_width );
				} else { // Avoid division by zero, use max_h_for_format if source_w is 0
					$encode_movie_height = min( $source_h, $max_h_for_format );
				}

				// Ensure height does not exceed max_h_for_format
				if ( $encode_movie_height > $max_h_for_format ) {
					$encode_movie_height = $max_h_for_format;
					// Recalculate width if height was capped
					if ( $source_h > 0 ) {
						$encode_movie_width = (int) round( ( $source_w / $source_h ) * $encode_movie_height );
					}
				}
			}
		}

		// Ensure dimensions are at least 2px and are even
		$encode_movie_width  = max( 2, $encode_movie_width - ( $encode_movie_width % 2 ) );
		$encode_movie_height = max( 2, $encode_movie_height - ( $encode_movie_height % 2 ) );

		$encode_format->set_encode_width( $encode_movie_width );
		$encode_format->set_encode_height( $encode_movie_height );

		return $encode_format; // Return the modified object
	}

	protected function set_encode_array( Encode_Format $encode_format ) {

		$format_id      = $encode_format->get_format_id();
		$video_metadata = $this->get_video_metadata();

		// Ensure Video_Format config exists for the format_id
		$video_format_config = $this->video_formats[ $format_id ] ?? null;
		if ( ! $video_format_config ) {
			// translators: %s is the video format id (ex. 'mp4_720p').
			$encode_format->set_error( sprintf( __( 'Video format configuration not found for %s in set_encode_array.', 'video-embed-thumbnail-generator' ), $format_id ) );
			return array(); // Return empty array, error is set on object
		}

		// $encode_info is used for basename for logfile.
		// The Encode_Info class itself might be less relevant if output_path/url are directly from DB job.
		// However, its basename calculation could still be useful.
		// For now, we assume $encode_format already has its path and URL set from the DB job.
		$source_for_pathinfo = $encode_format->get_path() ? $encode_format->get_path() : $this->url;
		$path_parts          = pathinfo( $source_for_pathinfo );
		$basename            = $path_parts['filename']; // Basename without extension

		$encode_format = $this->get_encode_dimensions( $encode_format ); // Calculate and set dimensions on the object

		$watermark_flags = $this->get_watermark_flags();
		// If a temporary watermark was downloaded, its path is now in $this->current_temp_watermark_path
		if ( ! empty( $this->current_temp_watermark_path ) ) {
			$encode_format->set_temp_watermark_path( $this->current_temp_watermark_path );
		}
		$ffmpeg_flags        = $this->get_ffmpeg_flags( $encode_format );
		$ffmpeg_flags_before = $this->get_ffmpeg_flags_before( $watermark_flags );

		$encode_array_after_options = array(
			'-threads',
			$this->options['threads'],
		);

		if ( ! empty( $watermark_flags['input'] ) && ! empty( $watermark_flags['filter'] ) ) {
			array_push(
				$encode_array_after_options,
				'-filter_complex',
				$watermark_flags['filter']
			);
		}

		// Ensure uploads path exists for logfile
		$uploads_dir = $this->uploads['path'];
		if ( ! is_dir( $uploads_dir ) ) {
			wp_mkdir_p( $uploads_dir );
		}
		$logfile_name = sanitize_file_name( $basename . '_' . $format_id . '_' . wp_generate_password( 8, false ) . '_encode.txt' );
		$logfile      = $uploads_dir . '/' . $logfile_name;

		array_push(
			$encode_array_after_options,
			'-progress',
			$logfile,
			$encode_format->get_path() // This should be the final output path
		);

		$encode_array = array_merge(
			$ffmpeg_flags_before,
			$ffmpeg_flags,
			$encode_array_after_options
		);

		$dimensions_for_filter = array(
			'width'  => $encode_format->get_encode_width(),
			'height' => $encode_format->get_encode_height(),
		);

		$encode_array = apply_filters( 'videopack_generate_encode_array', $encode_array, $this->encode_input, $encode_format->get_path(), $video_metadata, $format_id, $dimensions_for_filter['width'], $dimensions_for_filter['height'] );

		//remove empty elements from array
		$encode_array = array_filter(
			$encode_array,
			function ( $value ) {
				return (
					$value === 0
					|| $value === '0'
					|| ( is_string( $value ) && trim( $value ) !== '' ) // Keep non-empty strings
					|| is_numeric( $value ) // Keep numbers
				);
			}
		);
		$encode_array = array_values( $encode_array ); // Re-index after filter

		$encode_format->set_encode_array( $encode_array );
		$encode_format->set_logfile( $logfile );

		return $encode_array;
	}

	protected function get_watermark_flags() {

		$video_metadata    = $this->get_video_metadata(); // Ensure Video_Metadata object is loaded
		$watermark_options = $this->options['ffmpeg_watermark'];
		$watermark_flags   = array(
			'input'  => '',
			'filter' => '',
		);

		if ( ! empty( $watermark_options['url'] ) && $video_metadata && $video_metadata->worked && $video_metadata->actualwidth ) {

			$watermark_path = $watermark_options['url'];
			$this->current_temp_watermark_path = null; // Reset for this call

			// Check if watermark URL is external and try to get local path
			if ( filter_var( $watermark_options['url'], FILTER_VALIDATE_URL ) ) {
				$watermark_id = $this->attachment_manager->url_to_id( $watermark_options['url'] );
				if ( $watermark_id ) {
					$local_watermark_file = get_attached_file( $watermark_id );
					if ( $local_watermark_file && file_exists( $local_watermark_file ) ) {
						$watermark_path = $local_watermark_file; // Update to local path
					} else {
						// Watermark attachment found but file doesn't exist, cannot use.
						return $watermark_flags;
					}
				} else { // No attachment ID found, it's an external URL
					if ( ! function_exists( 'download_url' ) ) {
						require_once ABSPATH . 'wp-admin/includes/file.php';
					}
					$temp_watermark_file = download_url( $watermark_options['url'], 15 ); // 15 sec timeout

					if ( is_wp_error( $temp_watermark_file ) ) {
						// Failed to download
						return $ffmpeg_params;
					} else {
						$watermark_path                    = $temp_watermark_file;
						$this->current_temp_watermark_path = $temp_watermark_file; // Store for Encode_Format
					}
				}
			} elseif ( ! file_exists( $watermark_path ) ) {
				// Local path provided but file doesn't exist
				return $watermark_flags;
			}

			$watermark_scale_percent = max( 1, min( 100, (int) ( $watermark_options['scale'] ?? 10 ) ) ); // Default 10%, ensure 1-100
			$watermark_width_calc    = (string) round( (int) $video_metadata->actualwidth * ( $watermark_scale_percent / 100 ) );
			$watermark_width_calc    = max( 2, (int) $watermark_width_calc - ( (int) $watermark_width_calc % 2 ) ); // Ensure even and at least 2px

			$x_offset_percent = max( 0, min( 100, (int) ( $watermark_options['x'] ?? 5 ) ) ); // Default 5%
			$y_offset_percent = max( 0, min( 100, (int) ( $watermark_options['y'] ?? 5 ) ) ); // Default 5%

			$overlay_x = $watermark_options['align'] === 'right' ? 'main_w-overlay_w-' . $x_offset_percent . '*main_w/100' :
						( $watermark_options['align'] === 'center' ? 'main_w/2-overlay_w/2' : $x_offset_percent . '*main_w/100' );

			$overlay_y = $watermark_options['valign'] === 'bottom' ? 'main_h-overlay_h-' . $y_offset_percent . '*main_h/100' :
						( $watermark_options['valign'] === 'center' ? 'main_h/2-overlay_h/2' : $y_offset_percent . '*main_h/100' );

			$watermark_flags['input']  = $watermark_path; // Use the determined local path
			$watermark_flags['filter'] = '[1:v]scale=' . $watermark_width_calc . ':-2[watermark];[0:v][watermark]overlay=' . $overlay_x . ':' . $overlay_y;
			// Using -2 for height in scale to maintain aspect and ensure even number.
		}

		return $watermark_flags;
	}

	/**
	 * Get FFmpeg flags for a specific format.
	 *
	 * @param Encode_Format $encode_format The Encode_Format object.
	 * @return array An array of FFmpeg flags.
	 */
	protected function get_ffmpeg_flags( Encode_Format $encode_format ) {

		$dimensions          = array(
			'width'  => $encode_format->get_encode_width(),
			'height' => $encode_format->get_encode_height(),
		);
		$format_id           = $encode_format->get_format_id();
		$video_format_config = $this->video_formats[ $format_id ] ?? null; // Video_Format object

		if ( ! $video_format_config || ! $dimensions['width'] || ! $dimensions['height'] ) {
			return array(); // Return empty flags if format configuration or dimensions are not found
		}

		$codec_obj    = $video_format_config->get_codec();
		$ffmpeg_flags = $codec_obj->get_codec_ffmpeg_flags( $this->options, $dimensions, $this->codecs );

		return $ffmpeg_flags;
	}

	protected function get_ffmpeg_flags_before( array $watermark_flags ) {
		$nice_prefix = array();
		if ( strtoupper( substr( PHP_OS, 0, 3 ) ) !== 'WIN' && ! empty( $this->options['nice'] ) && $this->options['nice'] == true ) {
			// Ensure 'nice' command is available and user has permission.
			$nice_prefix = array( 'nice' );
		}

		$input_source = $this->encode_input;
		if ( ! empty( $this->options['htaccess_login'] ) && filter_var( $input_source, FILTER_VALIDATE_URL ) ) {
			// Basic check for http/https before attempting to prepend auth
			if ( strpos( $input_source, 'http://' ) === 0 ) {
				$input_source = substr_replace( $input_source, $this->options['htaccess_login'] . ':' . $this->options['htaccess_password'] . '@', 7, 0 );
			} elseif ( strpos( $input_source, 'https://' ) === 0 ) {
				$input_source = substr_replace( $input_source, $this->options['htaccess_login'] . ':' . $this->options['htaccess_password'] . '@', 8, 0 );
			}
		}

		$ffmpeg_flags_before = array_merge(
			$nice_prefix,
			array(
				$this->ffmpeg_path,
				'-y', // Overwrite output files without asking
				'-i',
				$input_source,
			)
		);

		if ( ! empty( $watermark_flags['input'] ) && file_exists( $watermark_flags['input'] ) ) {
			array_push(
				$ffmpeg_flags_before,
				'-i',
				$watermark_flags['input']
			);
		}

		if ( ! empty( $this->options['audio_channels'] ) && $this->options['audio_channels'] == true ) {
			array_push(
				$ffmpeg_flags_before,
				'-ac', // Number of audio channels
				'2'
			);
		}

		return $ffmpeg_flags_before;
	}

	/**
	 * Retrieve video metadata.
	 * @return Video_Metadata object
	 */
	public function get_video_metadata() {
		if ( empty( $this->video_metadata ) ) {
			$this->set_video_metadata();
		}
		return $this->video_metadata;
	}

	public function get_codecs() {
		if ( empty( $this->codecs ) ) {
			$this->set_codecs();
		}
		return $this->codecs;
	}

	protected function set_video_metadata() {
		$this->video_metadata = new Video_Metadata( $this->id, $this->encode_input, $this->is_attachment, $this->ffmpeg_path, $this->options_manager );
	}

	/**
	 * Performs pre-flight checks for a format. Does NOT queue.
	 * This method is for checking if a format can be queued.
	 * The actual queuing is handled by Encode_Queue_Controller.
	 *
	 * @param string $format_id The format string (e.g., "mp4_720p").
	 * @return string Status string: 'ok_to_queue', 'already_exists', 'lowres', 'vcodec_unavailable', 'error_invalid_format_key'.
	 */
	public function check_if_can_queue( string $format_id ) {

		$video_format_config = $this->video_formats[ $format_id ] ?? null;
		if ( ! $video_format_config ) {
			return 'error_invalid_format_key';
		}

		// Instantiate Encode_Info to check if the *actual encoded file* already exists
		$encode_info_obj = new Encode_Info( $this->id, $this->url, $this->is_attachment, $video_format_config );
		if ( $encode_info_obj->exists ) {
			return 'already_exists'; // File already exists on disk
		}

		$video_metadata = $this->get_video_metadata();
		if ( $video_metadata && $video_metadata->worked && $video_format_config->get_resolution() ) {
			$target_height = $video_format_config->get_resolution()->get_height();
			// If the format is not 'fullres' and source height is already less than or equal to target, it's 'lowres'.
			if ( ! $video_format_config->get_replaces_original() && is_numeric( $target_height ) && $video_metadata->actualheight <= $target_height ) {
				return 'lowres';
			}
		}

		$codecs    = $this->get_codecs();
		$codec_obj = $video_format_config->get_codec();
		$vcodec    = $codec_obj->get_vcodec();
		// Check if the required video codec for this format is available in FFmpeg.
		if ( ! $codecs || ! isset( $codecs[ $vcodec ] ) || ! $codecs[ $vcodec ] ) {
			return 'vcodec_unavailable';
		}

		$acodec = $codec_obj->get_acodec();
		// Check if the required audio codec for this format is available in FFmpeg.
		if ( ! $codecs || ! isset( $codecs[ $acodec ] ) || ! $codecs[ $acodec ] ) {
			return 'acodec_unavailable';
		}

		return 'ok_to_queue';
	}

	public function already_queued( string $format_id ) {
		if ( $this->encode_formats ) {
			foreach ( $this->encode_formats as $encode_format_obj ) {
				if ( $encode_format_obj->get_format_id() === $format_id ) {
					return $encode_format_obj; // Returns the Encode_Format object if found
				}
			}
		}
		return false;
	}

	protected function set_available_formats() {
		$all_defined_formats = $this->video_formats; // All possible formats from Options
		$available_formats   = array();

		// Get source properties once
		$post_mime_type          = '';
		$source_video_codec_name = '';
		$video_metadata          = $this->get_video_metadata();

		if ( $this->is_attachment && is_numeric( $this->id ) ) {
			$post_mime_type = get_post_mime_type( $this->id );
		} elseif ( ! empty( $this->url ) ) {
			// For external URLs, try to get mime type from URL headers if necessary,
			$attachment_meta_util = new \Videopack\Admin\Attachment_Meta( $this->options_manager, false );
			$check_mime_type      = $attachment_meta_util->url_mime_type( $this->url, false );
			$post_mime_type       = $check_mime_type['type'] ?? '';
		}

		if ( $video_metadata && $video_metadata->worked ) {
			$source_video_codec_name = $video_metadata->codec;
		}

		$normalized_source_codec = '';
		if ( ! empty( $source_video_codec_name ) ) {
			$normalized_source_codec = strtolower( trim( $source_video_codec_name ) );
			// Normalize common variations from FFmpeg output to match Video_Codec IDs
			if ( 'hevc' === $normalized_source_codec ) {
				$normalized_source_codec = 'h265';
			} elseif ( 'theora' === $normalized_source_codec ) {
				$normalized_source_codec = 'ogv';
			}
			// Add other normalizations if necessary
		}

		foreach ( $all_defined_formats as $format_key => $video_format_obj ) {
			$target_codec_obj = $video_format_obj->get_codec();
			if ( ! $target_codec_obj ) { // Should not happen if formats are well-defined
				continue;
			}
			$target_mime_type = $target_codec_obj->get_mime_type();
			$target_codec_id  = $target_codec_obj->get_id();

			$target_resolution_obj = $video_format_obj->get_resolution();
			if ( ! $target_resolution_obj ) { // Should not happen
				continue;
			}
			$target_resolution_id = $target_resolution_obj->get_id();

			// 1. Skip if source is already this exact format (mime and codec)
			if ( ! empty( $post_mime_type ) &&
				! empty( $normalized_source_codec ) &&
				$post_mime_type === $target_mime_type &&
				$normalized_source_codec === $target_codec_id
			) {
				continue;
			}

			// 2. Check based on 'hide_video_formats' option and explicit enablement in settings
			$is_potentially_available = false;
			if ( strpos( $format_key, 'custom_' ) === 0 ) { // Custom formats are always potentially available if defined.
				$is_potentially_available = true;
			} elseif ( empty( $this->options['hide_video_formats'] ) ) { // If not hiding, all non-custom are potentially available.
				$is_potentially_available = true;
			} elseif ( isset( $this->options['encode'][ $target_codec_id ]['resolutions'][ $target_resolution_id ] ) &&
					true === $this->options['encode'][ $target_codec_id ]['resolutions'][ $target_resolution_id ]
			) { // If hiding, only show if explicitly enabled in options.
				$is_potentially_available = true;
			}

			if ( ! $is_potentially_available ) {
				continue; // Skip if not enabled by plugin options.
			}

			// 3. Check if source resolution is already too low (unless it's 'fullres')
			if ( $video_metadata && $video_metadata->worked && $target_resolution_obj ) {
				$target_height = $target_resolution_obj->get_height();
				// A format "replaces_original" if its resolution ID is 'fullres'.
				// So, if it does NOT replace original, and target height is numeric,
				// and source height is already less than or equal to target, then skip.
				if ( is_numeric( $target_height ) &&
					! $video_format_obj->get_replaces_original() &&
					(int) $video_metadata->actualheight <= (int) $target_height
				) {
					continue; // Skip if source is already this resolution or smaller and not 'fullres'.
				}
			}
			// If all checks pass, add to available formats
			$available_formats[ $format_key ] = $video_format_obj;
		}
		$this->available_formats = $available_formats;
	}

	public function set_codecs() {

		$codec_list            = array();
		$ffmpeg_codecs_process = new FFmpeg_Process(
			array(
				$this->ffmpeg_path,
				'-codecs',
			)
		);

		try {
			$ffmpeg_codecs_process->run();
			$codec_output = $ffmpeg_codecs_process->getOutput();
		} catch ( \Exception $e ) {
			$codec_output = ''; // Ensure $codec_output is a string
		}

		// Build a list of video codecs we are interested in from $this->video_formats
		if ( ! empty( $codec_output ) ) {
			$lines = explode( "\n", $codec_output );
			$parsing_codecs = false;
			foreach ( $lines as $line ) {
				if ( trim( $line ) === '-------' ) {
					$parsing_codecs = true;
					continue;
				}
				if ( ! $parsing_codecs || empty( trim( $line ) ) ) {
					continue;
				}

				// Regex to parse the codec line:
				// Example line: " DEA.L. libfdk_aac           Fraunhofer FDK AAC (encoders: libfdk_aac )"
				// Captures:
				// $matches[1] = D flag or .
				// $matches[2] = E flag or .
				// ...
				// $matches[9] = codec name (e.g., libfdk_aac)
				if ( preg_match( '/^\s*([D\.])([E\.])([V\.])([A\.])([S\.])([I\.])([L\.])([S\.])\s+([a-zA-Z0-9_\-]+)\s+.*/', $line, $matches ) ) {
					$is_encoder = ( $matches[2] === 'E' );
					$codec_name = $matches[9];
					if ( ! empty( $codec_name ) ) {
						// We only care if it's an encoder. Store true if it is, false otherwise,
						// or simply only store true for encoders.
						// For the purpose of $this->codecs, we only need to know if an encoder is available.
						if ( $is_encoder ) {
							$codec_list[ $codec_name ] = true;
						} elseif ( ! isset( $codec_list[ $codec_name ] ) ) { // If not an encoder, and not already set as true
							$codec_list[ $codec_name ] = false;
						}
					}
				}
			}
		}

		$this->codecs = $codec_list;
	}

	/**
	 * Cancel the encoding job.
	 */
	public function cancel_encoding( int $job_id ) {

		$canceled      = false;
		$encode_format = $this->get_encode_format_by_job_id( $job_id );

		if ( ! $encode_format ) { // If format object couldn't be retrieved
			return false;
		}

		// Capability check:
		// User can cancel if they started the job and can 'encode_videos',
		// OR if they can 'edit_others_video_encodes'.
		$can_cancel_own_job = ( get_current_user_id() === $encode_format->get_user_id() && current_user_can( 'encode_videos' ) );

		if ( ! ( $can_cancel_own_job || current_user_can( 'edit_others_video_encodes' ) ) ) {
			$encode_format->set_error( __( 'User does not have permission to cancel this encoding job.', 'video-embed-thumbnail-generator' ) );
			$this->save_format( $encode_format );
			return false;
		}

		if ( ! $encode_format->get_pid() || 'encoding' !== $encode_format->get_status() ) {
			return false;
		}

		$pid = $encode_format->get_pid();

		if ( '\\' !== DIRECTORY_SEPARATOR ) { // not Windows
			if ( function_exists( 'posix_kill' ) && posix_kill( $pid, 0 ) ) { // Check if process exists
				$canceled = posix_kill( $pid, SIGTERM ); // Send SIGTERM (15)
				// If SIGTERM failed or to be more aggressive, try SIGKILL after a short delay
				if ( ! $canceled || ( $canceled && posix_kill( $pid, 0 ) ) ) { // Check if still alive after SIGTERM
					sleep( 1 ); // Give it a second
					if ( posix_kill( $pid, 0 ) ) { // Check again before SIGKILL
						$canceled = posix_kill( $pid, SIGKILL ); // Send SIGKILL (9)
						if ( ! $canceled && posix_kill( $pid, 0 ) ) {
							// translators: %d is the process ID.
							$encode_format->set_error( __( 'Failed to kill process with SIGTERM or SIGKILL.', 'video-embed-thumbnail-generator' ) );
						}
					} else {
						$canceled = true; // Process was gone after SIGTERM or sleep
					}
				}
			} elseif ( function_exists( 'posix_kill' ) && ! posix_kill( $pid, 0 ) ) {
				// Process with PID did not exist or no permission to signal.
				// Assuming it's already gone if it was our process.
				$canceled = true; // Consider it canceled if the process is gone.
				$encode_format->set_error( sprintf( __( 'Process not found or no permission to send cancel signal.', 'video-embed-thumbnail-generator' ), $pid ) );
			} else {
				// posix_kill not available.
				// translators: %d is the process ID.
				$encode_format->set_error( __( 'posix_kill function not available to cancel process.', 'video-embed-thumbnail-generator' ) );
			}
		} else { // Windows
			// First, check if the process exists.
			$check_pid_command = FFmpeg_Process::fromShellCommandline( 'tasklist /NH /FI "PID eq ' . intval( $pid ) . '"' );
			try {
				$check_pid_command->run();
				if ( $check_pid_command->isSuccessful() && strpos( $check_pid_command->getOutput(), (string) $pid ) !== false ) {
					// Process exists, attempt to kill it.
					$commandline  = 'taskkill /F /T /PID ' . intval( $pid );
					$kill_process = FFmpeg_Process::fromShellCommandline( $commandline );
					try {
						$kill_process->run();
						if ( $kill_process->isSuccessful() ) {
							$canceled = true;
						} else {
							// translators: %s is the error output from taskkill.
							$encode_format->set_error( sprintf( __( 'Taskkill failed: %s', 'video-embed-thumbnail-generator' ), $kill_process->getErrorOutput() ) );
						}
					} catch ( \Exception $e ) {
						// translators: %s is the exception message.
						$encode_format->set_error( sprintf( __( 'Exception during taskkill: %s', 'video-embed-thumbnail-generator' ), $e->getMessage() ) );
					}
				} else {
					// Process not found by tasklist, assume it's already gone.
					$canceled = true;
					$encode_format->set_error( __( 'Process not found via tasklist, assuming canceled.', 'video-embed-thumbnail-generator' ) );
				}
			} catch ( \Exception $e ) {
				// translators: %s is the exception message.
				$encode_format->set_error( sprintf( __( 'Exception during tasklist check: %s', 'video-embed-thumbnail-generator' ), $e->getMessage() ) );
			}
		}

		if ( $canceled ) {
			$encode_format->set_canceled();
			$this->cleanup_encode_files( $encode_format ); // Attempt to clean up files, errors will be set on $encode_format
		}

		$this->save_format( $encode_format );
		return $canceled;
	}

	/**
	 * Execute the logic to replace the original attachment with an encoded format.
	 *
	 * @param Encode_Format $replacing_format The encoded format that will replace the original.
	 * @return bool|string True on success, error string on failure.
	 */
	protected function replace_original( Encode_Format $replacing_format ) {
		global $wp_filesystem, $wpdb;

		// Initialize WP_Filesystem
		if ( empty( $GLOBALS['wp_filesystem'] ) ) {
			if ( ! function_exists( 'WP_Filesystem' ) ) {
				require_once ABSPATH . 'wp-admin/includes/file.php';
			}
			// Attempt to initialize the filesystem.
			if ( ! WP_Filesystem() ) { // This will try to request credentials if needed.
				// If WP_Filesystem() returns false, it means it couldn't initialize (e.g. credentials not provided).
				$replacing_format->set_error( __( 'WordPress filesystem initialization failed. Please ensure credentials are set if required.', 'video-embed-thumbnail-generator' ) );
				return false;
			}
		}

		$video_id = $this->id; // Original attachment ID
		if ( ! is_numeric( $video_id ) || get_post_type( $video_id ) !== 'attachment' ) {
			$replacing_format->set_error( __( 'Original item is not a valid attachment ID for replacement.', 'video-embed-thumbnail-generator' ) );
			return false;
		}

		$encoded_filepath    = $replacing_format->get_path();
		$format_id           = $replacing_format->get_format_id();
		$video_format_config = $this->video_formats[ $format_id ] ?? null;

		if ( ! $video_format_config ) {
			// translators: %s is the video format id (ex. 'mp4_720p').
			$replacing_format->set_error( sprintf( __( 'Video format configuration not found for format: %s', 'video-embed-thumbnail-generator' ), $format_id ) );
			return false;
		}
		if ( ! $encoded_filepath || ! $wp_filesystem->exists( $encoded_filepath ) ) {
			// translators: %s is a file path.
			$replacing_format->set_error( sprintf( __( 'Encoded file not found at %s.', 'video-embed-thumbnail-generator' ), $encoded_filepath ) );
			return false;
		}

		$original_filepath = get_attached_file( $video_id );
		if ( ! $original_filepath ) {
			$replacing_format->set_error( __( 'Could not retrieve original attachment file path.', 'video-embed-thumbnail-generator' ) );
			return false;
		}

		$path_parts    = pathinfo( $original_filepath );
		$new_extension = $video_format_config->get_suffix();

		$original_url = wp_get_attachment_url( $video_id );
		$new_filename = $original_filepath; // Default if extension doesn't change
		$new_url      = $original_url;

		if ( $path_parts['extension'] !== $new_extension ) {
			$new_filename = $path_parts['dirname'] . '/' . $path_parts['filename'] . '.' . $new_extension;
			$new_url      = dirname( $original_url ) . '/' . $path_parts['filename'] . '.' . $new_extension;
		}

		// Perform file replacement
		// Delete the original file first if it's different from the new target name
		if ( $original_filepath !== $new_filename && $wp_filesystem->exists( $original_filepath ) ) {
			$wp_filesystem->delete( $original_filepath );
		}

		// Move the encoded file to the new (or original) location/name
		if ( ! $wp_filesystem->move( $encoded_filepath, $new_filename, true ) ) { // true for overwrite
			// translators: %1$s and %2$s are both file paths.
			$replacing_format->set_error( sprintf( __( 'Failed to move encoded file from %1$s to %2$s.', 'video-embed-thumbnail-generator' ), $encoded_filepath, $new_filename ) );
			return false;
		}

		// Update WordPress attachment metadata and post content references
		if ( $original_url !== $new_url ) {
			$results = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT ID, post_content FROM $wpdb->posts WHERE post_content LIKE %s",
					'%' . $wpdb->esc_like( $original_url ) . '%'
				)
			);
			if ( $results ) {
				foreach ( $results as $result ) {
					$new_post_content = str_replace( $original_url, $new_url, $result->post_content );
					if ( $new_post_content !== $result->post_content ) {
						wp_update_post(
							array(
								'ID'           => $result->ID,
								'post_content' => $new_post_content,
							)
						);
					}
				}
			}
		}

		// Update attachment metadata
		if ( ! function_exists( 'wp_generate_attachment_metadata' ) ) {
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}
		if ( ! function_exists( 'wp_read_video_metadata' ) ) { // Though wp_generate_attachment_metadata calls it
			require_once ABSPATH . 'wp-admin/includes/media.php';
		}

		update_attached_file( $video_id, $new_filename ); // IMPORTANT: Call this BEFORE wp_generate_attachment_metadata
		$attach_data = wp_generate_attachment_metadata( $video_id, $new_filename );
		wp_update_attachment_metadata( $video_id, $attach_data );

		// Update post mime type
		$new_mime    = wp_check_filetype( $new_filename );
		$post_update = array(
			'ID'             => $video_id,
			'post_mime_type' => $new_mime['type'],
			'guid'           => $new_url, // Update GUID to new URL
		);
		wp_update_post( $post_update );

		// Update Videopack custom meta using Attachment_Meta
		$attachment_meta_instance          = new \Videopack\Admin\Attachment_Meta( $this->options_manager, $video_id );
		$current_meta                      = $attachment_meta_instance->get();
		$current_meta['original_replaced'] = $format_id;
		$attachment_meta_instance->save( $current_meta );

		// Trigger thumbnail regeneration if needed
		do_action( 'videopack_cron_new_attachment', $video_id, 'thumbs' );

		// Update the Encode_Format object itself with new path/url
		$replacing_format->set_path( $new_filename );
		$replacing_format->set_url( $new_url );

		return true; // Indicate success
	}

	/**
	 * Delete the encoded file.
	 */
	public function delete_format( int $job_id ) {
		$encode_format = $this->get_encode_format_by_job_id( $job_id );

		if ( ! $encode_format ) {
			// Job not found in DB.
			return false;
		}

		// Capability check:
		// User can delete if they started the job and can 'encode_videos' (or a more specific 'delete_video_encodes'),
		// OR if they can 'edit_others_video_encodes' (or 'delete_others_video_encodes').
		$can_delete_own_job    = ( get_current_user_id() === $encode_format->get_user_id() && current_user_can( 'encode_videos' ) );
		$can_delete_others_job = current_user_can( 'edit_others_video_encodes' );

		if ( ! ( $can_delete_own_job || $can_delete_others_job ) ) {
			$encode_format->set_error( __( 'User does not have permission to delete this encoding job.', 'video-embed-thumbnail-generator' ) );
			$this->save_format( $encode_format );
			return false;
		}

		// Attempt to clean up all associated files.
		// cleanup_encode_files will set an error on $encode_format if it fails.
		if ( ! $this->cleanup_encode_files( $encode_format ) ) {
			// An error occurred during file cleanup and was set on $encode_format.
			$this->save_format( $encode_format ); // Save the error.
			// Proceed to mark as deleted in DB anyway, but the error will be logged.
		}

		// Delete the WordPress attachment if this format created one (and it's not the original)
		$wp_attachment_id = $encode_format->get_id(); // This is the WP attachment ID for the encoded version
		if ( $wp_attachment_id && get_post_type( $wp_attachment_id ) === 'attachment' ) {
			// Ensure this is not the original attachment ID that was replaced
			$is_original_attachment = ( $this->is_attachment && is_numeric( $this->id ) && (int) $this->id === (int) $wp_attachment_id );
			if ( ! $is_original_attachment ) {
				if ( ! wp_delete_attachment( $wp_attachment_id, true ) ) {
					// translators: %d is the attachment ID.
					$encode_format->set_error( sprintf( __( 'Failed to delete child attachment ID: %d. Please delete manually.', 'video-embed-thumbnail-generator' ), $wp_attachment_id ) );
					// Continue to mark the job as deleted, but with an error.
				}
			}
		}

		// Mark the job status as 'deleted' in the database.
		$encode_format->set_status( 'deleted' );
		// Clear path and URL as the files are gone (or should be)
		$encode_format->set_path( null );
		$encode_format->set_url( null );
		$encode_format->set_logfile( null );
		$encode_format->set_temp_watermark_path( null );

		$this->save_format( $encode_format ); // Save the 'deleted' status and any errors.

		return true; // Indicates the deletion process was attempted. Check $encode_format->get_error() for issues.
	}

	/**
	 * Cleans up files associated with an encoding job.
	 *
	 * @param Encode_Format $encode_format The format object.
	 * @return bool True if all deletions were successful or files didn't exist, false if any deletion failed.
	 */
	protected function cleanup_encode_files( Encode_Format $encode_format ) {
		$success = true;

		// Files to delete
		$files_to_delete = array(
			$encode_format->get_path(),
			$encode_format->get_logfile(),
			$encode_format->get_temp_watermark_path(),
		);

		foreach ( $files_to_delete as $file_path ) {
			if ( $file_path && file_exists( $file_path ) ) {
				if ( ! wp_delete_file( $file_path ) ) {
					// translators: %s is the file path.
					$encode_format->set_error( sprintf( __( 'Failed to delete file: %s', 'video-embed-thumbnail-generator' ), $file_path ) );
					$success = false; // Mark failure but continue trying to delete other files.
				}
			}
		}
		return $success;
	}

	public function insert_attachment( Encode_Format $encode_format ) {
		$format_id           = $encode_format->get_format_id();
		$path                = $encode_format->get_path();
		$url                 = $encode_format->get_url();
		$user_id             = $encode_format->get_user_id(); // This is user who queued, not necessarily post author
		$video_format_config = $this->video_formats[ $format_id ] ?? null;

		if ( ! $video_format_config ) {
			// translators: %s is the video format id (ex. 'mp4_720p').
			$encode_format->set_error( sprintf( __( 'Video format configuration not found for format: %s', 'video-embed-thumbnail-generator' ), $format_id ) );
			$this->save_format( $encode_format ); // Save error to DB
			return false;
		}

		if ( ! $path || ! file_exists( $path ) ) {
			// translators: %1$s is the file path. %2$s is the format ID (ex. 'mp4_720p')
			$encode_format->set_error( sprintf( __( 'Encoded file not found at path: %1$s for format %2$s', 'video-embed-thumbnail-generator' ), $path, $format_id ) );
			$this->save_format( $encode_format );
			return false;
		}

		// Check if this format is intended to replace the original
		if ( $video_format_config->get_replaces_original() ) {
			global $wpdb;
			$current_blog_id = get_current_blog_id(); // Assumes context is correctly set

			// Check if any other formats for this attachment are still encoding or queued in the DB
			$pending_job_count = 0;
			if ( $this->is_attachment && is_numeric( $this->id ) ) {
				$pending_job_count = (int) $wpdb->get_var(
					$wpdb->prepare(
						"SELECT COUNT(*) FROM %i WHERE attachment_id = %d AND blog_id = %d AND status IN ('encoding', 'queued', 'processing') AND id != %d",
						$this->queue_table_name,
						$this->id,
						$current_blog_id,
						$encode_format->get_job_id()
					)
				);
			} elseif ( ! empty( $this->url ) ) {
				$pending_job_count = (int) $wpdb->get_var(
					$wpdb->prepare(
						"SELECT COUNT(*) FROM %i WHERE input_url = %s AND blog_id = %d AND status IN ('encoding', 'queued', 'processing') AND id != %d",
						$this->queue_table_name,
						$this->url,
						$current_blog_id,
						$encode_format->get_job_id()
					)
				);
			}

			if ( $pending_job_count > 0 ) {
				// Other formats are still pending, defer replacement
				$encode_format->set_status( 'pending_replacement' );
				$this->save_format( $encode_format ); // Save status to DB
				return false; // Indicate that insertion/replacement is not complete
			} else {
				// No other formats pending, proceed with replacement
				$result = $this->replace_original( $encode_format );
				if ( true === $result ) {
					$encode_format->set_status( 'complete' );
					// replace_original updates the $encode_format object with new path/url
					$this->save_format( $encode_format );
					return true;
				} else {
					// replace_original sets the error on $encode_format and returns false.
					$this->save_format( $encode_format );
					return false;
				}

	/**
	 * Queues a specific video format for encoding.
	 * This method performs pre-flight checks, inserts the job into the database,
	 * and schedules an ActionScheduler task to process it.
	 *
	 * @param string $format_id The ID of the video format to queue (e.g., 'h264_720p').
	 * @param int    $user_id   The ID of the user who initiated the queueing.
	 * @param int    $blog_id   The ID of the blog where the job originated.
	 * @return array An associative array with 'status' ('success' or 'failed') and 'reason' or 'job_id'.
	 */
	public function queue_format( string $format_id, int $user_id, int $blog_id ) {
		global $wpdb;

		// 1. Pre-flight check: Determine if this format can be queued for this video.
		$can_queue_status = $this->check_if_can_queue( $format_id );
		if ( 'ok_to_queue' !== $can_queue_status ) {
			return array( 'status' => 'failed', 'reason' => $can_queue_status );
		}

		// 2. Get Video_Format configuration object.
		$all_video_formats   = $this->options_manager->get_video_formats();
		$video_format_config = $all_video_formats[ $format_id ] ?? null;

		if ( ! $video_format_config ) {
			return array( 'status' => 'failed', 'reason' => 'error_invalid_format_key' );
		}

		// 3. Determine output paths/URLs for the new job using Encode_Info.
		$is_attachment   = is_numeric( $this->id ) && get_post_type( $this->id ) === 'attachment';
		$encode_info_obj = new Encode_Info( $this->id, $this->url, $is_attachment, $video_format_config );

		// 4. Prepare job data for database insertion.
		$job_data = array(
			'blog_id'       => $blog_id,
			'attachment_id' => $is_attachment ? (int) $this->id : null,
			'input_url'     => $this->url,
			'format_id'     => $format_id,
			'status'        => 'queued',
			'output_path'   => $encode_info_obj->path,
			'output_url'    => $encode_info_obj->url,
			'user_id'       => $user_id,
			'created_at'    => current_time( 'mysql', true ),
			'updated_at'    => current_time( 'mysql', true ),
		);

		// 5. Insert the job into the queue table.
		$inserted = $wpdb->insert( $this->queue_table_name, $job_data );

		if ( ! $inserted ) {
			return array( 'status' => 'failed', 'reason' => 'error_db_insert' );
		}

		$job_id = $wpdb->insert_id;

		// 6. Schedule an ActionScheduler task to handle this job.
		$action_id = as_schedule_single_action( time(), 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );

		if ( ! $action_id ) {
			// If scheduling fails, mark job as failed in DB.
			$wpdb->update( $this->queue_table_name, array( 'status' => 'failed', 'error_message' => 'Failed to schedule ActionScheduler task.' ), array( 'id' => $job_id ) );
			return array( 'status' => 'failed', 'reason' => 'error_scheduling' );
		}

		// 7. Update the job with the ActionScheduler action ID.
		$wpdb->update( $this->queue_table_name, array( 'action_id' => $action_id ), array( 'id' => $job_id ) );

		return array( 'status' => 'success', 'job_id' => $job_id, 'action_id' => $action_id );
	}
			}
		} elseif ( ! $encode_format->get_id() ) { // If not replacing the original, insert as a new child attachment. Check if Encode_Format already has a WP attachment ID

			$parent_post_id = 0; // Default for non-attachments or if original is not an attachment
			if ( $this->is_attachment && is_numeric( $this->id ) ) {
				$parent_post_id = (int) $this->id;
			}

			$existing_attachment_id = $this->attachment_manager->url_to_id( $url );

			if ( ! $existing_attachment_id ) {
				$wp_filetype = wp_check_filetype( basename( $path ) );
				$title_base  = $parent_post_id ? get_the_title( $parent_post_id ) : get_the_title( $this->id );
				$title       = $title_base . ' ' . $video_format_config->get_name();

				// Determine author for the new attachment
				$author_id_from_parent = $parent_post_id ? get_post_field( 'post_author', $parent_post_id ) : get_current_user_id();
				if ( $user_id ) {
					$author_id = $user_id;
				} else {
					$author_id = $author_id_from_parent;
				}
				if ( ! $author_id ) {
					$author_id = get_current_user_id();
				}

				$attachment_data = array(
					'guid'           => $url,
					'post_mime_type' => $wp_filetype['type'],
					'post_title'     => $title,
					'post_content'   => '',
					'post_status'    => 'inherit',
					'post_author'    => $author_id,
				);

				$new_attachment_id = wp_insert_attachment( $attachment_data, $path, $parent_post_id );

				if ( ! is_wp_error( $new_attachment_id ) ) {
					if ( ! function_exists( 'wp_generate_attachment_metadata' ) ) {
						require_once ABSPATH . 'wp-admin/includes/image.php';
					}
					if ( ! function_exists( 'wp_read_video_metadata' ) ) {
						require_once ABSPATH . 'wp-admin/includes/media.php';
					}
					$attach_meta = wp_generate_attachment_metadata( $new_attachment_id, $path );
					wp_update_attachment_metadata( $new_attachment_id, $attach_meta );

					update_post_meta( $new_attachment_id, '_kgflashmediaplayer-format', $format_id );
					if ( ! $this->is_attachment && ! empty( $this->url ) ) { // If original was an external URL
						update_post_meta( $new_attachment_id, '_kgflashmediaplayer-externalurl', $this->url );
					}

					$encode_format->set_id( $new_attachment_id ); // Set WP attachment ID on Encode_Format
					$encode_format->set_status( 'complete' );
					$this->save_format( $encode_format ); // Save to DB
					return true;
				} else {
					$encode_format->set_error( __( 'Failed to insert new attachment: ', 'video-embed-thumbnail-generator' ) . $new_attachment_id->get_error_message() );
					$this->save_format( $encode_format );
					return false;
				}
			} else {
				// Attachment with this URL already exists, mark as complete
				$encode_format->set_id( $existing_attachment_id );
				$encode_format->set_status( 'complete' );
				$this->save_format( $encode_format );
				return true;
			}
		} elseif ( $encode_format->get_id() && file_exists( $path ) ) {
			// Already has an attachment ID and file exists, ensure status is complete
			$encode_format->set_status( 'complete' );
			$this->save_format( $encode_format );
			return true;
		} elseif ( $encode_format->get_id() && ! file_exists( $path ) ) {
			// Has an attachment ID, but the file is missing. This is an error.
			// translators: %1$d is the attachment ID. %2$s is the file path.
			$encode_format->set_error( sprintf( __( 'Encoded file is missing for existing attachment ID %1$d at path: %2$s', 'video-embed-thumbnail-generator' ), $encode_format->get_id(), $path ) );
			$this->save_format( $encode_format );
			return false;
		}

		// Fallback: If reached, it's an unexpected state or unhandled condition.
		// Avoid overwriting a more specific error if one was already set and not returned from.
		if ( ! $encode_format->get_error() && 'complete' !== $encode_format->get_status() ) {
			$encode_format->set_error( __( 'An unexpected error occurred during attachment processing.', 'video-embed-thumbnail-generator' ) );
		}
		$this->save_format( $encode_format ); // Ensure any state/error is saved.
		return false;
	}
}
