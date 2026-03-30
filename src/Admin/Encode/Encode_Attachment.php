<?php
/**
 * Video encoding attachment handler.
 *
 * @package Videopack
 * @subpackage Videopack/Admin/Encode
 */

namespace Videopack\Admin\Encode;

use Videopack\Common\Debug_Logger;
use Videopack\Admin\Attachment;
use Videopack\Admin\Attachment_Meta;
use Videopack\Admin\Formats\Video_Format;

/**
 * Class Encode_Attachment
 *
 * Manages video encoding operations for a specific attachment or URL.
 *
 * This class handles the logic for determining which formats are available
 * for a video, generating FFmpeg commands, managing background processes,
 * and integrating encoded files back into the WordPress media library.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin/Encode
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Encode_Attachment {
	/**
	 * The ID of the video attachment.
	 *
	 * @var int|string $id
	 */
	protected $id;

	/**
	 * The URL of the video.
	 *
	 * @var string|null $url
	 */
	protected $url;

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $format_registry
	 */
	protected $format_registry;

	/**
	 * Plugin options array.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Attachment manager instance.
	 *
	 * @var \Videopack\Admin\Attachment $attachment_manager
	 */
	protected $attachment_manager;

	/**
	 * WordPress upload directory data.
	 *
	 * @var array $uploads
	 */
	protected $uploads;

	/**
	 * Defined video formats.
	 *
	 * @var array $video_formats
	 */
	protected $video_formats;

	/**
	 * Available formats for the current video.
	 *
	 * @var array|null $available_formats
	 */
	protected $available_formats;

	/**
	 * Currently queued or active encode formats.
	 *
	 * @var \Videopack\Admin\Encode\Encode_Format[] $encode_formats
	 */
	protected $encode_formats;

	/**
	 * Log of encoding activities.
	 *
	 * @var array $queue_log
	 */
	protected $queue_log;

	/**
	 * Whether the source is a WordPress attachment.
	 *
	 * @var bool $is_attachment
	 */
	protected $is_attachment;

	/**
	 * Video metadata handler.
	 *
	 * @var \Videopack\Admin\Encode\Video_Metadata|null $video_metadata
	 */
	protected $video_metadata;

	/**
	 * Path or URL to the encoding input file.
	 *
	 * @var string $encode_input
	 */
	protected $encode_input;

	/**
	 * List of codecs detected in FFmpeg.
	 *
	 * @var array $codecs
	 */
	protected $codecs;

	/**
	 * Information about current encodes.
	 *
	 * @var array $encode_info
	 */
	protected $encode_info = array();

	/**
	 * Absolute path to the FFmpeg executable.
	 *
	 * @var string $ffmpeg_path
	 */
	protected $ffmpeg_path;

	/**
	 * Name of the encoding queue database table.
	 *
	 * @var string $queue_table_name
	 */
	protected $queue_table_name;

	/**
	 * Path to a temporary watermark file if downloaded.
	 *
	 * @var string|null $current_temp_watermark_path
	 */
	protected $current_temp_watermark_path = null;

	/**
	 * Browser-provided metadata used as a fallback if FFmpeg is unavailable.
	 *
	 * @var array $browser_metadata
	 */
	protected $browser_metadata = array();

	/**
	 * Flag to prevent recursion during deletion.
	 *
	 * @var bool
	 */
	private static $in_delete_format = false;

	/**
	 * Constructor.
	 *
	 * @param array                             $options        Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 * @param int|string                        $id       The ID of the video attachment or source URL.
	 * @param string|null                       $url      Optional. The URL of the video (if not an attachment).
	 */
	public function __construct(
		array $options,
		\Videopack\Admin\Formats\Registry $format_registry,
		$id,
		string $url = null,
		array $browser_metadata = array()
	) {
		$this->options          = $options;
		$this->format_registry  = $format_registry;
		$this->id               = $id;
		$this->url              = $url;
		$this->browser_metadata = $browser_metadata;
		$attachment_meta          = new Attachment_Meta( $this->options );
		$this->attachment_manager = new Attachment( $this->options, $format_registry, $attachment_meta );
		$this->uploads            = (array) wp_upload_dir();
		$this->video_formats      = (array) $format_registry->get_video_formats();
		$this->queue_log          = array();
		$this->set_is_attachment();
		$this->set_queue_table_name();
		$this->update_formats_replacement_status();
		$this->set_encode_formats();
		$this->set_ffmpeg_path();
	}

	/**
	 * Determines if the input source is a WordPress attachment and sets the input path.
	 *
	 * @return void
	 */
	protected function set_is_attachment() {
		if ( is_numeric( $this->id ) ) {
			$this->is_attachment = (string) get_post_type( (int) $this->id ) === 'attachment';
		} else {
			$this->is_attachment = false;
		}

		if ( $this->is_attachment ) {
			$this->encode_input = (string) get_attached_file( (int) $this->id );
			if ( empty( $this->encode_input ) ) {
				$this->encode_input = (string) get_post_meta( (int) $this->id, '_kgflashmediaplayer-externalurl', true );
			}
			if ( empty( $this->url ) ) {
				$this->url = (string) wp_get_attachment_url( (int) $this->id );
			}
		} else {
			$this->encode_input = (string) $this->url;
		}
	}

	/**
	 * Retrieves and stores the Encode_Format objects for each queued job for this source.
	 *
	 * @return void
	 */
	protected function set_encode_formats() {
		global $wpdb;
		$this->ensure_table_exists();
		$this->encode_formats = array();
		$results              = array();
		$current_blog_id      = (int) get_current_blog_id();

		if ( $this->is_attachment && is_numeric( $this->id ) ) {
			$results = (array) $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i WHERE attachment_id = %d AND blog_id = %d', $this->queue_table_name, (int) $this->id, $current_blog_id ), ARRAY_A );
		} elseif ( ! empty( $this->url ) ) {
			$results = (array) $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i WHERE input_url = %s AND blog_id = %d', $this->queue_table_name, (string) $this->url, $current_blog_id ), ARRAY_A );
		} else {
			return;
		}

		if ( ! empty( $results ) ) {
			foreach ( $results as $job_data ) {
				$this->encode_formats[] = Encode_Format::from_array( (array) $job_data );
			}
		}
	}

	/**
	 * Sets the name of the encoding queue database table.
	 *
	 * @return void
	 */
	protected function set_queue_table_name() {
		global $wpdb;
		if ( is_multisite() && \Videopack\Admin\Multisite::is_videopack_active_for_network() ) {
			$main_site_id           = (int) ( defined( 'BLOG_ID_CURRENT_SITE' ) ? BLOG_ID_CURRENT_SITE : 1 );
			$this->queue_table_name = (string) ( $wpdb->get_blog_prefix( $main_site_id ) . 'videopack_encoding_queue' );
		} else {
			$this->queue_table_name = (string) ( $wpdb->prefix . 'videopack_encoding_queue' );
		}
	}

	/**
	 * Ensures the database table exists.
	 */
	public function ensure_table_exists() {
		static $checked = false;
		if ( $checked ) {
			return;
		}

		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $this->queue_table_name ) ) === $this->queue_table_name ) {
			$checked = true;
			return;
		}

		$queue_controller = new Encode_Queue_Controller( $this->options, $this->format_registry );
		$queue_controller->add_table();
		$checked = true;
	}

	/**
	 * Sets the absolute path to the FFmpeg executable.
	 *
	 * @return void
	 */
	protected function set_ffmpeg_path() {
		$app_path = (string) ( $this->options['app_path'] ?? '' );
		if ( empty( $app_path ) ) {
			$this->ffmpeg_path = 'ffmpeg';
		} else {
			$this->ffmpeg_path = $app_path . '/ffmpeg';
		}
	}

	/**
	 * Saves the state of an encoding job to the database.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $encode_format The format object to save.
	 * @return void
	 */
	protected function save_format( Encode_Format $encode_format ) {
		global $wpdb;
		$this->ensure_table_exists();

		$job_id = (int) $encode_format->get_job_id();

		if ( ! $job_id ) {
			return;
		}

		$data_to_save = (array) $encode_format->to_array();

		$db_data = array(
			'status'              => (string) $data_to_save['status'],
			'output_path'         => (string) $data_to_save['path'],
			'output_url'          => (string) $data_to_save['url'],
			'pid'                 => (int) $data_to_save['pid'],
			'logfile_path'        => (string) $data_to_save['logfile'],
			'started_at'          => $data_to_save['started'] ? (string) gmdate( 'Y-m-d H:i:s', (int) $data_to_save['started'] ) : null,
			'completed_at'        => $data_to_save['ended'] ? (string) gmdate( 'Y-m-d H:i:s', (int) $data_to_save['ended'] ) : null,
			'error_message'       => (string) $data_to_save['error'],
			'temp_watermark_path' => (string) $data_to_save['temp_watermark_path'],
		);

		if ( 'failed' === (string) $data_to_save['status'] ) {
			$current_failed_at = $wpdb->get_var( $wpdb->prepare( 'SELECT failed_at FROM %i WHERE id = %d', $this->queue_table_name, $job_id ) );
			if ( empty( $current_failed_at ) ) {
				$db_data['failed_at'] = (string) current_time( 'mysql', true );
			}
		}

		$db_data = array_filter(
			$db_data,
			function ( $value ) {
				return ! is_null( $value );
			}
		);

		if ( ! empty( $db_data ) ) {
			$wpdb->update( (string) $this->queue_table_name, (array) $db_data, array( 'id' => $job_id ) );
		}
	}

	/**
	 * Returns the list of encoding formats for this source.
	 *
	 * @return \Videopack\Admin\Encode\Encode_Format[] Array of format objects.
	 */
	public function get_formats() {
		if ( empty( $this->encode_formats ) ) {
			$this->set_encode_formats();
		}
		return (array) $this->encode_formats;
	}

	/**
	 * Returns the list of available encoding formats based on source properties and settings.
	 *
	 * @return \Videopack\Admin\Formats\Video_Format[] Array of format objects.
	 */
	public function get_available_formats() {
		if ( empty( $this->available_formats ) ) {
			$this->set_available_formats();
		}
		return (array) $this->available_formats;
	}

	/**
	 * Returns a specific Encode_Format object by its format ID.
	 *
	 * @param string $format The format ID (e.g., 'h264_720p').
	 * @return \Videopack\Admin\Encode\Encode_Format|null The format object or null if not found.
	 */
	public function get_encode_format( string $format ) {
		$encode_formats = (array) $this->get_formats();
		foreach ( $encode_formats as $encode_format_obj ) {
			if ( $encode_format_obj instanceof Encode_Format && (string) $encode_format_obj->get_format_id() === $format ) {
				return $encode_format_obj;
			}
		}
		return null;
	}

	/**
	 * Returns a specific Encode_Format object by its database job ID.
	 *
	 * @param int $job_id The database job ID.
	 * @return \Videopack\Admin\Encode\Encode_Format|null The format object or null if not found.
	 */
	public function get_encode_format_by_job_id( int $job_id ) {
		$encode_formats = (array) $this->get_formats();
		foreach ( $encode_formats as $encode_format_obj ) {
			if ( $encode_format_obj instanceof Encode_Format && (int) $encode_format_obj->get_job_id() === $job_id ) {
				return $encode_format_obj;
			}
		}
		return null;
	}

	/**
	 * Retrieves formats with a specific status from the database.
	 *
	 * @param array $statuses The statuses to filter by (e.g., ['queued', 'failed']).
	 * @return \Videopack\Admin\Encode\Encode_Format[] Array of matching format objects.
	 */
	public function get_formats_by_status( array $statuses ) {
		global $wpdb;
		$this->ensure_table_exists();

		$formats         = array();
		$results         = array();
		$current_blog_id = (int) get_current_blog_id();

		if ( empty( $statuses ) ) {
			return $formats;
		}

		$status_placeholders = implode( ',', array_fill( 0, count( $statuses ), '%s' ) );

		if ( $this->is_attachment && is_numeric( $this->id ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$results = (array) $wpdb->get_results( $wpdb->prepare( "SELECT * FROM %i WHERE attachment_id = %d AND blog_id = %d AND status IN ($status_placeholders)", ...array_merge( array( $this->queue_table_name, (int) $this->id, $current_blog_id ), $statuses ) ), ARRAY_A );
		} elseif ( ! empty( $this->url ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$results = (array) $wpdb->get_results( $wpdb->prepare( "SELECT * FROM %i WHERE input_url = %s AND blog_id = %d AND status IN ($status_placeholders)", ...array_merge( array( $this->queue_table_name, (string) $this->url, $current_blog_id ), $statuses ) ), ARRAY_A );
		} else {
			return $formats;
		}

		if ( ! empty( $results ) ) {
			foreach ( $results as $job_data ) {
				$job_data       = (array) $job_data;
				$job_data['id'] = (int) $job_data['id'];
				$formats[]      = Encode_Format::from_array( $job_data );
			}
		}
		return (array) $formats;
	}

	/**
	 * Returns an array representation of all queued jobs for this source.
	 *
	 * @return array Array of job data arrays.
	 */
	public function get_formats_array() {
		$formats_array       = array();
		$encode_formats_objs = (array) $this->get_formats();
		foreach ( $encode_formats_objs as $encode_format_obj ) {
			if ( $encode_format_obj instanceof Encode_Format ) {
				$formats_array[] = (array) $encode_format_obj->to_array();
			}
		}
		return (array) $formats_array;
	}

	/**
	 * Gets all defined video formats and their encoding status for the current source.
	 *
	 * This method combines data from the defined formats in settings with the
	 * actual job statuses in the database and the physical file existence on disk.
	 *
	 * @return array An associative array of format data, keyed by format ID.
	 */
	public function get_all_formats_with_status() {
		$video_formats_data  = array();
		$all_defined_formats = (array) $this->format_registry->get_video_formats();
		$encoded_jobs        = (array) $this->get_formats();
		$video_metadata      = $this->get_video_metadata();

		$encoded_jobs_map = array();
		foreach ( $encoded_jobs as $job_obj ) {
			if ( $job_obj instanceof Encode_Format ) {
				$encoded_jobs_map[ (string) $job_obj->get_format_id() ] = $job_obj;
			}
		}

		$replace_format          = (string) ( $this->options['replace_format'] ?? 'none' );
		$normalized_source_codec = (string) $this->get_normalized_source_codec();

		foreach ( $all_defined_formats as $format_id => $video_format_obj ) {
			if ( ! $video_format_obj instanceof Video_Format ) {
				continue;
			}

			$format_id            = (string) $format_id;
			$target_codec_id      = (string) $video_format_obj->get_codec()->get_id();
			$target_resolution_id = (string) $video_format_obj->get_resolution()->get_id();

			$is_replacement = $this->is_replacement_format( $format_id );

			if ( $is_replacement && ! $video_format_obj->get_replaces_original() ) {
				$video_format_obj = new Video_Format( clone $video_format_obj->get_codec(), clone $video_format_obj->get_resolution(), true, true );
			}

			$format_array              = (array) $video_format_obj->to_array();
			$format_array['format_id'] = (string) $format_array['id'];
			$format_array['id']        = null;
			$job_exists                = isset( $encoded_jobs_map[ $format_id ] );

			$encode_info = new Encode_Info( $this->id, $this->url, $video_format_obj, $this->options, $this->format_registry );
			$file_exists = false;
			if ( (bool) $encode_info->exists ) {
				if ( ! empty( $encode_info->path ) && is_file( (string) $encode_info->path ) ) {
					$file_exists = (bool) ( filesize( (string) $encode_info->path ) > 0 );
				} else {
					$file_exists = true;
				}
			}

			if ( (bool) ( $this->options['hide_video_formats'] ?? false ) ) {
				$is_enabled_in_options = $video_format_obj->is_enabled();

				if ( ! $is_enabled_in_options && ! $file_exists && ! $job_exists ) {
					continue;
				}
			}

			if ( $this->is_unnecessary_encode( $video_format_obj ) && ! $file_exists && ! $job_exists ) {
				continue;
			}

			$format_array['status']     = Encode_Format::STATUS_NOT_ENCODED;
			$format_array['was_picked'] = false;

			if ( $file_exists ) {
				$format_array['url'] = (string) $encode_info->url;

				if ( $encode_info->id && (int) $encode_info->id !== (int) $this->id ) {
					$format_array['status'] = Encode_Format::STATUS_COMPLETED;
					$format_array['id']     = (int) $encode_info->id;

					$parent_id = (int) get_post_meta( (int) $encode_info->id, '_kgflashmediaplayer-parent', true );

					if ( $parent_id > 0 && $parent_id === (int) $this->id ) {
						$format_array['was_picked'] = true;
					}
				} elseif ( ! $encode_info->sameserver ) {
					$format_array['status'] = Encode_Format::STATUS_REMOTE_EXISTS;
				} else {
					$format_array['status'] = Encode_Format::STATUS_COMPLETED;
				}
			}

			if ( $job_exists ) {
				$matching_encode_format = $encoded_jobs_map[ $format_id ];

				if ( $video_metadata && $video_metadata->duration ) {
					$duration_in_microseconds = (int) round( (float) $video_metadata->duration * 1000000 );
					$matching_encode_format->set_video_duration( $duration_in_microseconds );
				}

				if ( in_array( (string) $matching_encode_format->get_status(), array( Encode_Format::STATUS_ENCODING, Encode_Format::STATUS_NEEDS_INSERT, Encode_Format::STATUS_PENDING_REPLACEMENT ), true ) ) {
					$format_array['progress'] = (int) $matching_encode_format->get_progress();
				}

				$job_data_array             = (array) $matching_encode_format->to_array();
				$was_picked_value           = (bool) $format_array['was_picked'];
				$format_array               = array_merge( $format_array, $job_data_array );
				$format_array['was_picked'] = $was_picked_value;
				$format_array['status']     = (string) $matching_encode_format->get_status();
			}

			$format_array['exists']       = (bool) $file_exists;
			$format_array['encoding_now'] = in_array( (string) $format_array['status'], array( Encode_Format::STATUS_QUEUED, Encode_Format::STATUS_PROCESSING, Encode_Format::STATUS_ENCODING, Encode_Format::STATUS_NEEDS_INSERT, Encode_Format::STATUS_PENDING_REPLACEMENT ), true );
			$format_array['deletable']    = false;

			if ( $file_exists && ! $this->is_replacement_format( $format_id ) && $this->is_attachment ) {
				$attachment_post = get_post( (int) $this->id );
				if ( $attachment_post && ( (int) get_current_user_id() === (int) $attachment_post->post_author || current_user_can( 'edit_others_video_encodes' ) ) ) {
					$format_array['deletable'] = true;
				}
			}

			$res_name  = (string) $video_format_obj->get_resolution()->get_name();
			$res_label = (string) $video_format_obj->get_resolution()->get_label();

			if ( $is_replacement ) {
				$has_been_replaced = false;
				if ( $this->is_attachment ) {
					if ( ! empty( $video_metadata->original_replaced ) ) {
						$has_been_replaced = true;
					}
				}

				// If it's a replacement format, treat it as not encoded in the UI so the checkbox remains enabled,
				// BUT only if it didn't fail. We want to show error messages if they exist.
				if ( ! $format_array['encoding_now'] && ! in_array( (string) $format_array['status'], array( Encode_Format::STATUS_ERROR, Encode_Format::STATUS_FAILED ), true ) ) {
					$format_array['status'] = Encode_Format::STATUS_NOT_ENCODED;
					$format_array['exists'] = false;
				}

				$format_array['has_been_replaced'] = $has_been_replaced;
				$format_array['replaces_original'] = true;

				$resolution_label = (string) $video_format_obj->get_resolution()->get_label();
				$translated_label = (string) $this->format_registry->get_resolution_l10n( $resolution_label );

				$replacement_basename = $has_been_replaced
					/* translators: %s is the resolution label (e.g. 1080p). */
					? __( 'Replace original again (%s)', 'video-embed-thumbnail-generator' )
					/* translators: %s is the resolution label (e.g. 1080p). */
					: __( 'Replace original (%s)', 'video-embed-thumbnail-generator' );

				if ( 'fullres' === $target_resolution_id ) {
					$full_res_translated = (string) $this->format_registry->get_resolution_l10n( 'Full Resolution' );
					$res_label           = (string) sprintf( $replacement_basename, $full_res_translated );
					$res_name            = $res_label;
				} else {
					$actual_height = ( $video_metadata && (int) $video_metadata->actualheight ) ? (int) $video_metadata->actualheight . 'p' : '';
					$height_label  = ! empty( $actual_height ) ? $actual_height : $resolution_label;
					$res_label     = (string) sprintf( $replacement_basename, $translated_label );
					$res_name      = (string) sprintf( $replacement_basename, (string) $this->format_registry->get_resolution_l10n( $height_label ) );
				}
			}

			$format_array['resolution']['name']  = (string) $this->format_registry->get_resolution_l10n( $res_name );
			$format_array['resolution']['label'] = (string) $this->format_registry->get_resolution_l10n( $res_label );
			$format_array['name']                = (string) ( $video_format_obj->get_codec()->get_name() . ' ' . $format_array['resolution']['name'] );
			$format_array['label']               = (string) $format_array['resolution']['label'];
			$format_array['status_l10n']         = (string) Encode_Format::get_status_label( (string) $format_array['status'] );
			$format_array['video_duration']      = ( $video_metadata && $video_metadata->duration ) ? (int) round( (float) $video_metadata->duration * 1000000 ) : null;

			$video_formats_data[ $format_id ] = (array) $format_array;
		}

		return (array) $video_formats_data;
	}

	/**
	 * Checks if an encode is unnecessary based on source and target formats.
	 *
	 * An encode is considered unnecessary if it's an upscale (target resolution is
	 * higher than source) or if it's a transcode to the exact same resolution and codec.
	 *
	 * @param \Videopack\Admin\Formats\Video_Format $video_format_obj The target video format object.
	 * @return bool True if the encode is unnecessary, false otherwise.
	 */
	protected function is_unnecessary_encode( Video_Format $video_format_obj ) {
		$video_metadata = $this->get_video_metadata();
		if ( ! $video_metadata || ! (bool) $video_metadata->worked || ! $video_format_obj->get_resolution() ) {
			return false;
		}

		$target_height = (int) $video_format_obj->get_resolution()->get_height();
		$source_height = (int) ( $video_metadata->actualheight ?? 0 );
		$source_width  = (int) ( $video_metadata->actualwidth ?? 0 );

		if ( (bool) $video_format_obj->get_replaces_original() || ! is_numeric( $target_height ) ) {
			return false;
		}

		$target_width = (int) round( $target_height * 16 / 9 );

		if ( $source_height < $target_height && $source_width < $target_width ) {
			return true;
		}

		if ( $source_height === $target_height || $source_width === $target_width ) {
			$source_codec_name       = (string) ( $video_metadata->codec ?? '' );
			$normalized_source_codec = '';
			if ( ! empty( $source_codec_name ) ) {
				$normalized_source_codec = (string) strtolower( trim( $source_codec_name ) );
				$normalized_source_codec = ( 'hevc' === $normalized_source_codec ) ? 'h265' : $normalized_source_codec;
				$normalized_source_codec = ( 'theora' === $normalized_source_codec ) ? 'ogv' : $normalized_source_codec;
				$normalized_source_codec = ( 'avc1' === $normalized_source_codec ) ? 'h264' : $normalized_source_codec;
				$normalized_source_codec = ( 'vp09' === $normalized_source_codec ) ? 'vp9' : $normalized_source_codec;
				$normalized_source_codec = ( 'vp08' === $normalized_source_codec ) ? 'vp8' : $normalized_source_codec;
			}
			if ( (string) $video_format_obj->get_codec()->get_id() === $normalized_source_codec ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Gets the ideal replacement format ID for this source based on settings and upscaling rules.
	 *
	 * @return string|null The format ID correctly resolved (e.g., will return 'h264_fullres' if preferred 'h264_1080p' is an upscale).
	 */
	public function get_ideal_replacement_id() {
		$replace_setting = (string) ( $this->options['replace_format'] ?? 'none' );
		if ( 'none' === $replace_setting ) {
			return null;
		}

		$video_metadata = $this->get_video_metadata();
		$source_codec   = '';
		$source_height  = 0;
		if ( $video_metadata && $video_metadata->worked ) {
			$source_codec  = (string) strtolower( trim( $video_metadata->codec ?? '' ) );
			$source_codec  = ( 'hevc' === $source_codec ) ? 'h265' : ( ( 'avc1' === $source_codec ) ? 'h264' : ( ( 'theora' === $source_codec ) ? 'ogv' : ( ( 'vp09' === $source_codec ) ? 'vp9' : ( ( 'vp08' === $source_codec ) ? 'vp8' : $source_codec ) ) ) );
			$source_height = (int) ( $video_metadata->actualheight ?? 0 );
		}

		$codec_id = '';
		$res_id   = '';

		if ( strpos( $replace_setting, 'same_' ) === 0 ) {
			$codec_id = $source_codec;
			$res_id   = substr( $replace_setting, 5 );
		} else {
			// Find codec and res from setting ID (e.g. h264_1080).
			$all_formats = $this->format_registry->get_video_formats();
			$f_obj       = $all_formats[ $replace_setting ] ?? null;
			if ( $f_obj ) {
				$codec_id = (string) $f_obj->get_codec()->get_id();
				$res_id   = (string) $f_obj->get_resolution()->get_id();
			}
		}

		if ( ! $codec_id || ! $res_id ) {
			return null;
		}

		if ( 'fullres' === $res_id ) {
			return $codec_id . '_fullres';
		}

		// Check for upscale.
		$target_res_obj = $this->format_registry->get_resolution( $res_id );
		$target_height  = $target_res_obj ? (int) $target_res_obj->get_height() : 0;

		if ( $source_height > 0 && $target_height > 0 && $source_height < $target_height ) {
			return $codec_id . '_fullres';
		}

		return $codec_id . '_' . $res_id;
	}

	/**
	 * Determines if a given format ID should be treated as a replacement for the current source.
	 *
	 * @param string $format_id The format ID to check.
	 * @return bool True if it's a replacement format, false otherwise.
	 */
	public function is_replacement_format( string $format_id ) {
		$all_video_formats = $this->format_registry->get_video_formats();
		$format_obj        = $all_video_formats[ $format_id ] ?? null;
		if ( ! $format_obj instanceof Video_Format ) {
			return false;
		}

		// First, check for "same codec" or explicit setting match. This is the user's INTENT.
		$replace_setting = (string) ( $this->options['replace_format'] ?? 'none' );
		if ( 'none' !== $replace_setting ) {
			$match = false;
			if ( strpos( $replace_setting, 'same_' ) === 0 ) {
				$source_codec = (string) $this->get_normalized_source_codec();
				$res_id       = substr( $replace_setting, 5 );
				$target_codec = (string) $format_obj->get_codec()->get_id();
				$target_res   = (string) $format_obj->get_resolution()->get_id();

				if ( $target_codec === $source_codec && $target_res === $res_id ) {
					$match = true;
				}
			} elseif ( $format_id === $replace_setting ) {
				$match = true;
			}

			if ( $match ) {
				return true;
			}
		}

		// Third, check for any "Full Resolution" format that is enabled. 
		// These are always valid replacement candidates.
		$res_id   = (string) $format_obj->get_resolution()->get_id();
		$codec_id = (string) $format_obj->get_codec()->get_id();
		if ( 'fullres' === $res_id && ! empty( $this->options['encode'][ $codec_id ]['resolutions']['fullres'] ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Extracts and normalizes the source video codec name.
	 *
	 * @return string|null Normalized codec name (e.g. 'h264', 'h265', 'vp9') or null if unknown.
	 */
	public function get_normalized_source_codec() {
		$video_metadata = $this->get_video_metadata();
		if ( ! $video_metadata instanceof Video_Metadata || ! (bool) $video_metadata->worked ) {
			return null;
		}

		$codec = (string) $video_metadata->codec;
		if ( empty( $codec ) ) {
			return null;
		}

		$normalized = (string) strtolower( trim( $codec ) );
		$normalized = ( 'hevc' === $normalized ) ? 'h265' : $normalized;
		$normalized = ( 'theora' === $normalized ) ? 'ogv' : $normalized;
		$normalized = ( 'avc1' === $normalized ) ? 'h264' : $normalized;
		$normalized = ( 'vp09' === $normalized ) ? 'vp9' : $normalized;
		$normalized = ( 'vp08' === $normalized ) ? 'vp8' : $normalized;

		return $normalized;
	}

	/**
	 * Starts the FFmpeg encoding process for a specific format.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $encode_format The format object to encode.
	 * @return \Videopack\Admin\Encode\Encode_Format The updated format object.
	 */
	public function start_encode( Encode_Format $encode_format ) {
		if ( empty( $encode_format->get_encode_array() ) ) {
			$this->set_encode_array( $encode_format );
		}
		$encode_array = (array) $encode_format->get_encode_array();

		if ( empty( $encode_array ) ) {
			$encode_format->set_error( (string) __( 'FFmpeg command array is empty. Cannot start encoding.', 'video-embed-thumbnail-generator' ) );
			$this->save_format( $encode_format );
			return $encode_format;
		}

		Debug_Logger::log( 'Starting FFmpeg process', array( 'command' => implode( ' ', $encode_array ) ) );

		$process = new FFmpeg_Process( (array) $encode_array );
		try {
			$process->disableOutput();
			$process->start();
			$pid = (int) $process->getPID();
			if ( $pid > 0 ) {
				Debug_Logger::log( 'FFmpeg process started successfully', array( 'pid' => $pid ) );
				$encode_format->set_encode_start( $pid, (int) time() );
			} else {
				$error_output = (string) $process->getErrorOutput();
				$std_output   = (string) $process->getOutput();
				$error_msg    = (string) __( 'Failed to get PID after starting FFmpeg.', 'video-embed-thumbnail-generator' );
				if ( ! empty( $error_output ) ) {
					$error_msg .= ' Error Output: ';
					$error_msg .= $error_output;
				}
				if ( ! empty( $std_output ) ) {
					$error_msg .= ' Standard Output: ';
					$error_msg .= $std_output;
				}
				Debug_Logger::log( 'FFmpeg process failed to start (no PID)', array( 'error' => $error_msg ) );
				$encode_format->set_error( $error_msg );
			}
		} catch ( \Symfony\Component\Process\Exception\ProcessTimedOutException $e ) {
			/* translators: %s is the exception message. */
			$msg = (string) sprintf( (string) __( 'FFmpeg process timed out on start: %s', 'video-embed-thumbnail-generator' ), (string) $e->getMessage() );
			Debug_Logger::log( 'FFmpeg process timeout on start', array( 'error' => $msg ) );
			$encode_format->set_error( $msg );
		} catch ( \Symfony\Component\Process\Exception\ProcessFailedException $e ) {
			/* translators: 1: the exception message, 2: the process error output. */
			$msg = (string) sprintf( (string) __( 'FFmpeg process failed on start: %1$s Output: %2$s', 'video-embed-thumbnail-generator' ), (string) $e->getMessage(), (string) $e->getProcess()->getErrorOutput() );
			Debug_Logger::log( 'FFmpeg process failure on start', array( 'error' => $msg ) );
			$encode_format->set_error( $msg );
		} catch ( \Exception $e ) {
			/* translators: %s is the exception message. */
			$msg = (string) sprintf( (string) __( 'General error starting FFmpeg: %s', 'video-embed-thumbnail-generator' ), (string) $e->getMessage() );
			Debug_Logger::log( 'General error starting FFmpeg', array( 'error' => $msg ) );
			$encode_format->set_error( $msg );
		} finally {
			$this->save_format( $encode_format );
			return $encode_format;
		}
	}

	/**
	 * Returns the FFmpeg command array for a format, generating it if necessary.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $encode_format The format object.
	 * @return array The FFmpeg command array.
	 */
	public function get_encode_array( Encode_Format $encode_format ) {
		if ( empty( $encode_format->get_encode_array() ) ) {
			return (array) $this->set_encode_array( $encode_format );
		}
		return (array) $encode_format->get_encode_array();
	}

	/**
	 * Calculates the output dimensions for the encoded video.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $encode_format The format object.
	 * @return \Videopack\Admin\Encode\Encode_Format The updated format object with dimensions set.
	 */
	protected function get_encode_dimensions( Encode_Format $encode_format ) {
		$encode_movie_width  = 640;
		$encode_movie_height = 360;

		$video_metadata = $this->get_video_metadata();

		if ( $video_metadata instanceof Video_Metadata && (bool) $video_metadata->worked && (int) $video_metadata->actualwidth && (int) $video_metadata->actualheight ) {
			$source_w = (int) $video_metadata->actualwidth;
			$source_h = (int) $video_metadata->actualheight;

			$format_id           = (string) $encode_format->get_format_id();
			$video_format_config = $this->video_formats[ $format_id ] ?? null;
			$resolution_config   = $video_format_config instanceof Video_Format ? $video_format_config->get_resolution() : null;

			if ( $resolution_config instanceof \Videopack\Admin\Formats\Video_Resolution ) {
				if ( 'fullres' === $resolution_config->get_id() || ! $resolution_config->get_height() ) {
					$max_w_for_format = $source_w;
					$max_h_for_format = $source_h;
				} else {
					$max_h_for_format = (int) $resolution_config->get_height();
					$max_w_for_format = (int) round( $max_h_for_format * ( 16 / 9 ) );
				}

				if ( $source_h > 0 ) {
					$target_w_for_max_h = (int) round( ( $source_w / $source_h ) * $max_h_for_format );
				} else {
					$target_w_for_max_h = $source_w;
				}
				$encode_movie_width = (int) min( $source_w, $max_w_for_format, $target_w_for_max_h );

				if ( $source_w > 0 ) {
					$encode_movie_height = (int) round( ( $source_h / $source_w ) * $encode_movie_width );
				} else {
					$encode_movie_height = (int) min( $source_h, $max_h_for_format );
				}

				if ( $encode_movie_height > $max_h_for_format ) {
					$encode_movie_height = (int) $max_h_for_format;
					if ( $source_h > 0 ) {
						$encode_movie_width = (int) round( ( $source_w / $source_h ) * $encode_movie_height );
					}
				}
			}
		}

		$encode_movie_width  = (int) max( 2, $encode_movie_width - ( $encode_movie_width % 2 ) );
		$encode_movie_height = (int) max( 2, $encode_movie_height - ( $encode_movie_height % 2 ) );

		$encode_format->set_encode_width( $encode_movie_width );
		$encode_format->set_encode_height( $encode_movie_height );

		return $encode_format;
	}

	/**
	 * Sets the full FFmpeg command array on the format object.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $encode_format The format object.
	 * @return array The generated FFmpeg command array.
	 */
	protected function set_encode_array( Encode_Format $encode_format ) {
		$format_id           = (string) $encode_format->get_format_id();
		$video_metadata      = $this->get_video_metadata();
		$video_format_config = $this->video_formats[ $format_id ] ?? null;

		if ( ! $video_format_config instanceof Video_Format ) {
			/* translators: %s is the video format ID (ex. 'mp4_720p'). */
			$encode_format->set_error( (string) sprintf( __( 'Video format configuration not found for %s in set_encode_array.', 'video-embed-thumbnail-generator' ), $format_id ) );
			return array();
		}

		$source_for_pathinfo = (string) ( ! empty( $encode_format->get_path() ) ? $encode_format->get_path() : $this->url );
		$path_parts          = pathinfo( $source_for_pathinfo );
		$basename            = (string) ( $path_parts['filename'] ?? 'video' );

		$encode_format = $this->get_encode_dimensions( $encode_format );

		$watermark_flags = (array) $this->get_watermark_flags();
		if ( ! empty( $this->current_temp_watermark_path ) ) {
			$encode_format->set_temp_watermark_path( (string) $this->current_temp_watermark_path );
		}

		$ffmpeg_flags        = (array) $this->get_ffmpeg_flags( $encode_format );
		$ffmpeg_flags_before = (array) $this->get_ffmpeg_flags_before( (array) $watermark_flags );

		$encode_array_after_options = array(
			'-threads',
			(string) ( $this->options['threads'] ?? '0' ),
		);

		if ( ! empty( $watermark_flags['input'] ) && ! empty( $watermark_flags['filter'] ) ) {
			array_push(
				$encode_array_after_options,
				'-filter_complex',
				(string) $watermark_flags['filter']
			);
		}

		$uploads_dir = (string) $this->uploads['path'];
		if ( ! is_dir( $uploads_dir ) ) {
			wp_mkdir_p( $uploads_dir );
		}
		$logfile_name = (string) sanitize_file_name( $basename . '_' . wp_generate_password( 4, false ) . '_encode.txt' );
		$logfile      = (string) ( $uploads_dir . '/' . $logfile_name );

		array_push(
			$encode_array_after_options,
			'-progress',
			$logfile,
			(string) $encode_format->get_path()
		);

		$encode_array = (array) array_merge(
			$ffmpeg_flags_before,
			$ffmpeg_flags,
			$encode_array_after_options
		);

		$dimensions_for_filter = array(
			'width'  => (int) $encode_format->get_encode_width(),
			'height' => (int) $encode_format->get_encode_height(),
		);

		$encode_array = (array) apply_filters( 'videopack_generate_encode_array', $encode_array, (string) $this->encode_input, (string) $encode_format->get_path(), $video_metadata, $format_id, $dimensions_for_filter['width'], $dimensions_for_filter['height'] );

		$encode_array = (array) array_filter(
			$encode_array,
			function ( $value ) {
				return (
					$value === 0
					|| $value === '0'
					|| ( is_string( $value ) && trim( $value ) !== '' )
					|| is_numeric( $value )
				);
			}
		);
		$encode_array = array_values( (array) $encode_array );

		$encode_format->set_encode_array( (array) $encode_array );
		$encode_format->set_logfile( $logfile );

		return (array) $encode_array;
	}

	/**
	 * Generates watermark-related FFmpeg flags if a watermark is configured.
	 *
	 * @return array The watermark flags array.
	 */
	protected function get_watermark_flags() {
		$video_metadata    = $this->get_video_metadata();
		$watermark_options = (array) ( $this->options['ffmpeg_watermark'] ?? array() );
		$watermark_flags   = array(
			'input'  => '',
			'filter' => '',
		);

		if ( ! empty( $watermark_options['url'] ) && $video_metadata instanceof Video_Metadata && (bool) $video_metadata->worked && (int) $video_metadata->actualwidth ) {
			if ( ! empty( $video_metadata->ffmpeg_watermark_url ) && (string) $video_metadata->ffmpeg_watermark_url === (string) $watermark_options['url'] ) {
				return (array) $watermark_flags;
			}
			$watermark_path                    = (string) $watermark_options['url'];
			$this->current_temp_watermark_path = null;

			if ( (bool) filter_var( $watermark_options['url'], FILTER_VALIDATE_URL ) ) {
				$watermark_id = (int) $this->attachment_manager->url_to_id( (string) $watermark_options['url'] );
				if ( $watermark_id > 0 ) {
					$local_watermark_file = (string) get_attached_file( $watermark_id );
					if ( ! empty( $local_watermark_file ) && is_file( $local_watermark_file ) ) {
						$watermark_path = $local_watermark_file;
					} else {
						return $watermark_flags;
					}
				} else {
					if ( ! function_exists( 'download_url' ) ) {
						require_once ABSPATH . 'wp-admin/includes/file.php';
					}
					$temp_watermark_file = download_url( (string) $watermark_options['url'], 15 );

					if ( is_wp_error( $temp_watermark_file ) ) {
						return $watermark_flags;
					} else {
						$watermark_path                    = (string) $temp_watermark_file;
						$this->current_temp_watermark_path = $watermark_path;
					}
				}
			} elseif ( ! file_exists( $watermark_path ) ) {
				return $watermark_flags;
			}

			$watermark_scale_percent = (int) max( 1, min( 100, (int) ( $watermark_options['scale'] ?? 10 ) ) );
			$watermark_width_calc    = (int) round( (int) $video_metadata->actualwidth * ( $watermark_scale_percent / 100 ) );
			$watermark_width_calc    = (int) max( 2, $watermark_width_calc - ( $watermark_width_calc % 2 ) );

			$x_offset_percent = (int) max( 0, min( 100, (int) ( $watermark_options['x'] ?? 5 ) ) );
			$y_offset_percent = (int) max( 0, min( 100, (int) ( $watermark_options['y'] ?? 5 ) ) );

			$overlay_x = ( (string) ( $watermark_options['align'] ?? '' ) === 'right' ) ? 'main_w-overlay_w-' . $x_offset_percent . '*main_w/100' :
						( ( (string) ( $watermark_options['align'] ?? '' ) === 'center' ) ? 'main_w/2-overlay_w/2' : $x_offset_percent . '*main_w/100' );

			$overlay_y = ( (string) ( $watermark_options['valign'] ?? '' ) === 'bottom' ) ? 'main_h-overlay_h-' . $y_offset_percent . '*main_h/100' :
						( ( (string) ( $watermark_options['valign'] ?? '' ) === 'center' ) ? 'main_h/2-overlay_h/2' : $y_offset_percent . '*main_h/100' );

			$watermark_flags['input']  = (string) $watermark_path;
			$watermark_flags['filter'] = (string) ( '[1:v]scale=' . $watermark_width_calc . ':-2[watermark];[0:v][watermark]overlay=' . $overlay_x . ':' . $overlay_y );
		}

		return (array) $watermark_flags;
	}

	/**
	 * Get FFmpeg flags for a specific format.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $encode_format The Encode_Format object.
	 * @return array An array of FFmpeg flags.
	 */
	protected function get_ffmpeg_flags( Encode_Format $encode_format ) {
		$dimensions          = array(
			'width'  => (int) $encode_format->get_encode_width(),
			'height' => (int) $encode_format->get_encode_height(),
		);
		$format_id           = (string) $encode_format->get_format_id();
		$video_format_config = $this->video_formats[ $format_id ] ?? null;

		if ( ! $video_format_config instanceof Video_Format || ! $dimensions['width'] || ! $dimensions['height'] ) {
			return array();
		}

		return (array) $video_format_config->get_codec()->get_codec_ffmpeg_flags( (array) $this->options, (array) $dimensions, (array) $this->get_codecs() );
	}

	/**
	 * Generates FFmpeg flags to be placed before the input file.
	 *
	 * @param array $watermark_flags The watermark flags.
	 * @return array The input FFmpeg flags.
	 */
	protected function get_ffmpeg_flags_before( array $watermark_flags ) {
		$nice_prefix = array();
		if ( strtoupper( (string) substr( PHP_OS, 0, 3 ) ) !== 'WIN' && (bool) ( $this->options['nice'] ?? false ) ) {
			$nice_prefix = array( 'nice' );
		}

		$input_source = (string) $this->encode_input;
		if ( ! empty( $this->options['htaccess_login'] ) && (bool) filter_var( $input_source, FILTER_VALIDATE_URL ) ) {
			if ( strpos( $input_source, 'http://' ) === 0 ) {
				$input_source = (string) substr_replace( $input_source, (string) $this->options['htaccess_login'] . ':' . (string) $this->options['htaccess_password'] . '@', 7, 0 );
			} elseif ( strpos( $input_source, 'https://' ) === 0 ) {
				$input_source = (string) substr_replace( $input_source, (string) $this->options['htaccess_login'] . ':' . (string) $this->options['htaccess_password'] . '@', 8, 0 );
			}
		}

		$ffmpeg_flags_before = (array) array_merge(
			$nice_prefix,
			array(
				$this->ffmpeg_path,
				'-nostats',
				'-hide_banner',
				'-y',
				'-i',
				$input_source,
			)
		);

		if ( ! empty( $watermark_flags['input'] ) && is_file( (string) $watermark_flags['input'] ) ) {
			array_push(
				$ffmpeg_flags_before,
				'-i',
				(string) $watermark_flags['input']
			);
		}

		if ( (bool) ( $this->options['audio_channels'] ?? false ) ) {
			array_push(
				$ffmpeg_flags_before,
				'-ac',
				'2'
			);
		}

		return (array) $ffmpeg_flags_before;
	}

	/**
	 * Retrieve video metadata.
	 *
	 * @return \Videopack\Admin\Encode\Video_Metadata|null Video_Metadata object or null.
	 */
	public function get_video_metadata() {
		if ( empty( $this->video_metadata ) ) {
			$this->set_video_metadata();
		}
		return $this->video_metadata;
	}
 
	/**
	 * Get the video duration in microseconds.
	 *
	 * @return int Video duration.
	 */
	public function get_video_duration() {
		$metadata = $this->get_video_metadata();
		return ( $metadata && $metadata->duration ) ? (int) round( $metadata->duration * 1000000 ) : 0;
	}
 
	/**
	 * Get the video title.
	 *
	 * @return string Video title.
	 */
	public function get_video_title() {
		if ( $this->is_attachment ) {
			return get_the_title( (int) $this->id );
		}
		return (string) basename( $this->url );
	}


	/**
	 * Retrieves the list of available codecs from FFmpeg.
	 *
	 * @return array Map of codec names to support status.
	 */
	public function get_codecs() {
		if ( empty( $this->codecs ) ) {
			$this->set_codecs();
		}
		return (array) $this->codecs;
	}

	/**
	 * Initializes the Video_Metadata object for the current source.
	 *
	 * @return void
	 */
	protected function set_video_metadata() {
		$this->video_metadata = new Video_Metadata( $this->id, (string) $this->encode_input, (bool) $this->is_attachment, (string) $this->ffmpeg_path, $this->options, $this->browser_metadata );
	}

	/**
	 * Performs pre-flight checks for a format. Does NOT queue.
	 *
	 * This method is for checking if a format can be queued.
	 * The actual queuing is handled by Encode_Queue_Controller.
	 *
	 * @param string $format_id The format string (e.g., "mp4_720p").
	 * @return string Status string: 'ok_to_queue', 'already_exists', 'lowres', 'vcodec_unavailable', 'error_invalid_format_key'.
	 */
	public function check_if_can_queue( string $format_id ) {
		$video_format_config = $this->video_formats[ $format_id ] ?? null;
		if ( ! $video_format_config instanceof Video_Format ) {
			return 'error_invalid_format_key';
		}

		$encode_info_obj = new Encode_Info( $this->id, (string) $this->url, $video_format_config, $this->options, $this->format_registry );
		if ( (bool) $encode_info_obj->exists && ! (bool) $video_format_config->get_replaces_original() ) {
			return 'already_exists';
		}

		if ( $this->is_unnecessary_encode( $video_format_config ) ) {
			return 'lowres';
		}

		$codecs    = (array) $this->get_codecs();
		$codec_obj = $video_format_config->get_codec();
		$vcodec    = (string) $codec_obj->get_vcodec( $codecs );

		if ( empty( $codecs ) || ! isset( $codecs[ $vcodec ] ) || ! (bool) $codecs[ $vcodec ] ) {
			return 'vcodec_unavailable';
		}

		$acodec = (string) $codec_obj->get_acodec();
		if ( empty( $codecs ) || ! isset( $codecs[ $acodec ] ) || ! (bool) $codecs[ $acodec ] ) {
			return 'acodec_unavailable';
		}

		return 'ok_to_queue';
	}

	/**
	 * Checks if a format is already queued for this source.
	 *
	 * @param string $format_id The format ID.
	 * @return \Videopack\Admin\Encode\Encode_Format|bool The format object if queued, false otherwise.
	 */
	public function already_queued( string $format_id ) {
		$encode_formats = (array) $this->encode_formats;
		if ( ! empty( $encode_formats ) ) {
			foreach ( $encode_formats as $encode_format_obj ) {
				if ( $encode_format_obj instanceof Encode_Format && (string) $encode_format_obj->get_format_id() === $format_id ) {
					return $encode_format_obj;
				}
			}
		}
		return false;
	}

	/**
	 * Queues a specific video format for encoding.
	 *
	 * This method performs pre-flight checks, inserts the job into the database,
	 * and manages the state of resumable jobs.
	 *
	 * @param string $format_id The ID of the video format to queue (e.g., 'h264_720p').
	 * @param int    $user_id   The ID of the user who initiated the queueing.
	 * @param int    $blog_id   The ID of the blog where the job originated.
	 * @return array An associative array with 'status' ('success' or 'failed') and 'reason' or 'job_id'.
	 */
	public function queue_format( string $format_id, int $user_id, int $blog_id ) {
		global $wpdb;
		$this->ensure_table_exists();

		$is_attachment = is_numeric( $this->id ) && (string) get_post_type( (int) $this->id ) === 'attachment';
		if ( $is_attachment ) {
			$existing_job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE attachment_id = %d AND format_id = %s AND blog_id = %d', $this->queue_table_name, (int) $this->id, (string) $format_id, (int) $blog_id ) );
		} else {
			$existing_job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE input_url = %s AND format_id = %s AND blog_id = %d', $this->queue_table_name, (string) $this->url, (string) $format_id, (int) $blog_id ) );
		}

		if ( ! empty( $existing_job ) ) {
			$existing_job = (object) $existing_job;
			if ( in_array( (string) $existing_job->status, array( 'deleted', 'canceled', 'failed' ), true ) ) {
				$job_id = (int) $existing_job->id;
				$wpdb->update(
					(string) $this->queue_table_name,
					array(
						'status'               => 'queued',
						'user_id'              => (int) $user_id,
						'pid'                  => null,
						'logfile_path'         => null,
						'started_at'           => null,
						'completed_at'         => null,
						'failed_at'            => null,
						'error_message'        => null,
						'output_attachment_id' => null,
						'retry_count'          => (int) ( ( $existing_job->retry_count ?? 0 ) + 1 ),
						'created_at'           => (string) current_time( 'mysql', true ),
						'updated_at'           => (string) current_time( 'mysql', true ),
						'action_id'            => null,
					),
					array( 'id' => $job_id )
				);

				return array(
					'status' => 'success',
					'job_id' => $job_id,
					'reason' => 'requeued',
				);
			} else {
				return array(
					'status' => 'failed',
					'reason' => 'already_queued',
				);
			}
		}

		$can_queue_status = (string) $this->check_if_can_queue( $format_id );
		if ( 'ok_to_queue' !== $can_queue_status ) {
			return array(
				'status' => 'failed',
				'reason' => $can_queue_status,
			);
		}

		$all_video_formats   = (array) $this->format_registry->get_video_formats();
		$video_format_config = $all_video_formats[ $format_id ] ?? null;
		if ( ! $video_format_config instanceof Video_Format ) {
			return array(
				'status' => 'failed',
				'reason' => 'error_invalid_format_key',
			);
		}

		$encode_info_obj = new Encode_Info( $this->id, (string) $this->url, $video_format_config, $this->options, $this->format_registry );

		$job_data = array(
			'blog_id'        => (int) $blog_id,
			'attachment_id'  => $is_attachment ? (int) $this->id : null,
			'input_url'      => (string) $this->url,
			'format_id'      => (string) $format_id,
			'status'         => 'queued',
			'output_path'    => (string) $encode_info_obj->path,
			'output_url'     => (string) $encode_info_obj->url,
			'user_id'        => (int) $user_id,
			'video_title'    => (string) $this->get_video_title(),
			'video_duration' => (int) $this->get_video_duration(),
			'created_at'     => (string) current_time( 'mysql', true ),
			'updated_at'     => (string) current_time( 'mysql', true ),
		);

		$inserted = $wpdb->insert( (string) $this->queue_table_name, $job_data );
		if ( ! $inserted ) {
			return array(
				'status' => 'failed',
				'reason' => 'error_db_insert',
			);
		}
		$job_id = (int) $wpdb->insert_id;

		return array(
			'status' => 'success',
			'job_id' => $job_id,
		);
	}

	/**
	 * Filters and stores the video formats available for the current source.
	 *
	 * @return void
	 */
	protected function set_available_formats() {
		$all_defined_formats = (array) $this->video_formats;
		$available_formats   = array();

		$post_mime_type          = '';
		$source_video_codec_name = '';
		$video_metadata          = $this->get_video_metadata();

		if ( $this->is_attachment && is_numeric( $this->id ) ) {
			$post_mime_type = (string) get_post_mime_type( (int) $this->id );
		} elseif ( ! empty( $this->url ) ) {
			$attachment_meta_util = new Attachment_Meta( $this->options, false );
			$check_mime_type      = (array) $attachment_meta_util->url_mime_type( (string) $this->url, false );
			$post_mime_type       = (string) ( $check_mime_type['type'] ?? '' );
		}

		if ( $video_metadata instanceof Video_Metadata && (bool) $video_metadata->worked ) {
			$source_video_codec_name = (string) $video_metadata->codec;
		}

		$normalized_source_codec = '';
		if ( ! empty( $source_video_codec_name ) ) {
			$normalized_source_codec = (string) strtolower( trim( $source_video_codec_name ) );
			$normalized_source_codec = ( 'hevc' === $normalized_source_codec ) ? 'h265' : $normalized_source_codec;
			$normalized_source_codec = ( 'theora' === $normalized_source_codec ) ? 'ogv' : $normalized_source_codec;
			$normalized_source_codec = ( 'avc1' === $normalized_source_codec ) ? 'h264' : $normalized_source_codec;
			$normalized_source_codec = ( 'vp09' === $normalized_source_codec ) ? 'vp9' : $normalized_source_codec;
			$normalized_source_codec = ( 'vp08' === $normalized_source_codec ) ? 'vp8' : $normalized_source_codec;
		}

		foreach ( $all_defined_formats as $format_key => $video_format_obj ) {
			if ( ! $video_format_obj instanceof Video_Format ) {
				continue;
			}
			$format_key       = (string) $format_key;
			$target_codec_obj = $video_format_obj->get_codec();
			if ( ! $target_codec_obj ) {
				continue;
			}
			$target_mime_type      = (string) $target_codec_obj->get_mime_type();
			$target_codec_id       = (string) $target_codec_obj->get_id();
			$target_resolution_obj = $video_format_obj->get_resolution();
			if ( ! $target_resolution_obj ) {
				continue;
			}
			$target_resolution_id = (string) $target_resolution_obj->get_id();

			$replace_format = (string) ( $this->options['replace_format'] ?? 'none' );
			$is_replacement = false;
			if ( $format_key === $replace_format ) {
				$is_replacement = true;
			} elseif ( strpos( $replace_format, 'same_' ) === 0 ) {
				$replace_res = substr( $replace_format, 5 );
				if ( $target_codec_id === $normalized_source_codec && $target_resolution_id === $replace_res ) {
					$is_replacement = true;
				}
			}

			// If the video will be entirely replaced by a different format, we shouldn't skip any other targets.
			$is_replacing_with_something_else = ( $replace_format !== 'none' && ! $is_replacement );

			if ( ! $is_replacing_with_something_else &&
				! empty( $post_mime_type ) &&
				! empty( $normalized_source_codec ) &&
				$post_mime_type === $target_mime_type &&
				$normalized_source_codec === $target_codec_id &&
				! $is_replacement
			) {
				continue;
			}

			$is_potentially_available = false;
			if ( $is_replacement ) {
				$is_potentially_available = true;
			} elseif ( strpos( $format_key, 'custom_' ) === 0 ) {
				$is_potentially_available = true;
			} elseif ( empty( $this->options['hide_video_formats'] ) ) {
				$is_potentially_available = true;
			} elseif ( isset( $this->options['encode'][ $target_codec_id ]['resolutions'][ $target_resolution_id ] ) &&
					true === (bool) $this->options['encode'][ $target_codec_id ]['resolutions'][ $target_resolution_id ]
			) {
				$is_potentially_available = true;
			}

			if ( ! $is_potentially_available ) {
				continue;
			}

			if ( $is_replacement && ! $video_format_obj->get_replaces_original() ) {
				$video_format_obj = new Video_Format( clone $target_codec_obj, clone $target_resolution_obj, true, true );
			}

			$available_formats[ $format_key ] = $video_format_obj;
		}
		$this->available_formats = (array) $available_formats;
	}

	/**
	 * Detects and stores supported FFmpeg codecs.
	 *
	 * @return void
	 */
	public function set_codecs() {
		$codec_list            = array();
		$ffmpeg_codecs_process = new FFmpeg_Process(
			array(
				(string) $this->ffmpeg_path,
				'-codecs',
			)
		);

		try {
			$ffmpeg_codecs_process->run();
			$codec_output = (string) $ffmpeg_codecs_process->getOutput();
		} catch ( \Exception $e ) {
			$codec_output = '';
		}

		if ( ! empty( $codec_output ) ) {
			$lines           = (array) preg_split( '/\r\n|\r|\n/', (string) $codec_output );
			$parsing_codecs  = false;
			$detected_format = null;

			foreach ( $lines as $line ) {
				$line = (string) $line;
				if ( trim( $line ) === '-------' ) {
					$parsing_codecs = true;
					continue;
				}
				if ( ! $parsing_codecs || empty( trim( $line ) ) ) {
					continue;
				}

				$is_encoder = false;
				$codec_name = '';
				$matched    = false;

				if ( null === $detected_format || 'modern' === $detected_format ) {
					if ( preg_match( '/^\s*([D\.])([E\.])([VASDT\.])([I\.])([L\.])([S\.])\s+([a-zA-Z0-9_\-]+)\s+.*/', $line, $matches ) ) {
						if ( null === $detected_format ) {
							$detected_format = 'modern';
						}
						$is_encoder = ( (string) ( $matches[2] ?? '' ) === 'E' );
						$codec_name = (string) ( $matches[7] ?? '' );
						$matched    = true;
					}
				}

				if ( ! $matched && ( null === $detected_format || 'legacy' === $detected_format ) ) {
					if ( preg_match( '/^\s*([D\.])([E\.])([V\.])([A\.])([S\.])([I\.])([L\.])([S\.])\s+([a-zA-Z0-9_\-]+)\s+.*/', $line, $matches ) ) {
						if ( null === $detected_format ) {
							$detected_format = 'legacy';
						}
						$is_encoder = ( (string) ( $matches[2] ?? '' ) === 'E' );
						$codec_name = (string) ( $matches[9] ?? '' );
						$matched    = true;
					}
				}

				if ( ! $matched ) {
					continue;
				}

				if ( ! empty( $codec_name ) ) {
					if ( $is_encoder ) {
						$codec_list[ (string) $codec_name ] = true;
					} elseif ( ! isset( $codec_list[ (string) $codec_name ] ) ) {
						$codec_list[ (string) $codec_name ] = false;
					}
				}

				if ( preg_match( '/\(encoders: ([^\)]+)\)/', $line, $encoder_matches ) ) {
					$encoder_names = (array) preg_split( '/\s+/', (string) ( $encoder_matches[1] ?? '' ) );
					foreach ( $encoder_names as $encoder_name ) {
						$trimmed_name = (string) trim( (string) $encoder_name );
						if ( ! empty( $trimmed_name ) ) {
							$codec_list[ $trimmed_name ] = true;
						}
					}
				}
			}
		}

		$this->codecs = (array) $codec_list;
	}

	/**
	 * Cancels an active encoding job.
	 *
	 * @param int $job_id The ID of the job to cancel.
	 * @return bool True if canceled or already gone, false otherwise.
	 */
	public function cancel_encoding( int $job_id ) {
		$canceled      = false;
		$encode_format = $this->get_encode_format_by_job_id( (int) $job_id );

		if ( ! $encode_format instanceof Encode_Format ) {
			return false;
		}

		$can_cancel_own_job = ( (int) get_current_user_id() === (int) $encode_format->get_user_id() && current_user_can( 'encode_videos' ) );

		if ( ! ( $can_cancel_own_job || current_user_can( 'edit_others_video_encodes' ) ) ) {
			$encode_format->set_error( (string) __( 'User does not have permission to cancel this encoding job.', 'video-embed-thumbnail-generator' ) );
			$this->save_format( $encode_format );
			return false;
		}

		if ( ! (int) $encode_format->get_pid() || 'encoding' !== (string) $encode_format->get_status() ) {
			return false;
		}

		$pid = (int) $encode_format->get_pid();

		if ( '\\' !== DIRECTORY_SEPARATOR ) {
			if ( function_exists( 'posix_kill' ) && (bool) posix_kill( $pid, 0 ) ) {
				$canceled = (bool) posix_kill( $pid, SIGTERM );
				if ( ! $canceled || ( $canceled && (bool) posix_kill( $pid, 0 ) ) ) {
					sleep( 1 );
					if ( (bool) posix_kill( $pid, 0 ) ) {
						$canceled = (bool) posix_kill( $pid, SIGKILL );
						if ( ! $canceled && (bool) posix_kill( $pid, 0 ) ) {
							$encode_format->set_error( (string) __( 'Failed to kill process with SIGTERM or SIGKILL.', 'video-embed-thumbnail-generator' ) );
						}
					} else {
						$canceled = true;
					}
				}
			} elseif ( function_exists( 'posix_kill' ) && ! (bool) posix_kill( $pid, 0 ) ) {
				$canceled = true;
				/* translators: %d is the process ID. */
				$encode_format->set_error( (string) sprintf( (string) __( 'Process %d not found or no permission to send cancel signal.', 'video-embed-thumbnail-generator' ), $pid ) );
			} else {
				$encode_format->set_error( (string) __( 'posix_kill function not available to cancel process.', 'video-embed-thumbnail-generator' ) );
			}
		} else {
			$check_pid_command = FFmpeg_Process::fromShellCommandline( (string) ( 'tasklist /NH /FI "PID eq ' . (int) $pid . '"' ) );
			try {
				$check_pid_command->run();
				if ( (bool) $check_pid_command->isSuccessful() && strpos( (string) $check_pid_command->getOutput(), (string) $pid ) !== false ) {
					$commandline  = (string) ( 'taskkill /F /T /PID ' . (int) $pid );
					$kill_process = FFmpeg_Process::fromShellCommandline( $commandline );
					try {
						$kill_process->run();
						if ( (bool) $kill_process->isSuccessful() ) {
							$canceled = true;
						} else {
							/* translators: %s is the error output from taskkill. */
							$encode_format->set_error( (string) sprintf( (string) __( 'Taskkill failed: %s', 'video-embed-thumbnail-generator' ), (string) $kill_process->getErrorOutput() ) );
						}
					} catch ( \Exception $e ) {
						/* translators: %s is the exception message. */
						$encode_format->set_error( (string) sprintf( (string) __( 'Exception during taskkill: %s', 'video-embed-thumbnail-generator' ), (string) $e->getMessage() ) );
					}
				} else {
					$canceled = true;
					$encode_format->set_error( (string) __( 'Process not found via tasklist, assuming canceled.', 'video-embed-thumbnail-generator' ) );
				}
			} catch ( \Exception $e ) {
				/* translators: %s is the exception message. */
				$encode_format->set_error( (string) sprintf( (string) __( 'Exception during tasklist check: %s', 'video-embed-thumbnail-generator' ), (string) $e->getMessage() ) );
			}
		}

		if ( $canceled ) {
			$encode_format->set_canceled();
			$this->cleanup_encode_files( $encode_format );
		}

		$this->save_format( $encode_format );
		return (bool) $canceled;
	}

	/**
	 * Ensures that the video_formats array correctly reflects which formats are replacement formats.
	 *
	 * @return void
	 */
	protected function update_formats_replacement_status() {
		foreach ( $this->video_formats as $id => $format ) {
			if ( $format instanceof Video_Format && $this->is_replacement_format( (string) $id ) && ! $format->get_replaces_original() ) {
				$this->video_formats[ $id ] = new Video_Format( clone $format->get_codec(), clone $format->get_resolution(), $format->is_enabled(), true );
			}
		}
	}

	/**
	 * Execute the logic to replace the original attachment with an encoded format.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $replacing_format The encoded format that will replace the original.
	 * @return bool|string True on success, error string on failure.
	 */
	protected function replace_original( Encode_Format $replacing_format ) {
		global $wp_filesystem, $wpdb;

		if ( empty( $GLOBALS['wp_filesystem'] ) ) {
			if ( ! function_exists( 'WP_Filesystem' ) ) {
				require_once ABSPATH . 'wp-admin/includes/file.php';
			}
			if ( ! WP_Filesystem() ) {
				$replacing_format->set_error( (string) __( 'WordPress filesystem initialization failed. Please ensure credentials are set if required.', 'video-embed-thumbnail-generator' ) );
				return false;
			}
		}

		$video_id = (int) $this->id;
		if ( $video_id <= 0 || (string) get_post_type( $video_id ) !== 'attachment' ) {
			$replacing_format->set_error( (string) __( 'Original item is not a valid attachment ID for replacement.', 'video-embed-thumbnail-generator' ) );
			return false;
		}

		$encoded_filepath    = (string) $replacing_format->get_path();
		$format_id           = (string) $replacing_format->get_format_id();
		$video_format_config = $this->video_formats[ $format_id ] ?? null;

		if ( ! $video_format_config instanceof Video_Format ) {
			/* translators: %s is the video format ID (ex. 'mp4_720p'). */
			$replacing_format->set_error( (string) sprintf( (string) __( 'Video format configuration not found for format: %s', 'video-embed-thumbnail-generator' ), $format_id ) );
			return false;
		}
		if ( empty( $encoded_filepath ) || ! $wp_filesystem->exists( $encoded_filepath ) ) {
			/* translators: %s is a file path. */
			$replacing_format->set_error( (string) sprintf( (string) __( 'Encoded file not found at %s.', 'video-embed-thumbnail-generator' ), $encoded_filepath ) );
			return false;
		}

		$original_filepath = (string) get_attached_file( $video_id );
		if ( empty( $original_filepath ) ) {
			$replacing_format->set_error( (string) __( 'Could not retrieve original attachment file path.', 'video-embed-thumbnail-generator' ) );
			return false;
		}

		$path_parts    = (array) pathinfo( $original_filepath );
		$new_container = (string) $video_format_config->get_codec()->get_container();

		$original_url = (string) wp_get_attachment_url( $video_id );
		$new_filename = $original_filepath;
		$new_url      = $original_url;

		if ( (string) ( $path_parts['extension'] ?? '' ) !== $new_container ) {
			$new_filename = (string) ( ( $path_parts['dirname'] ?? '' ) . '/' . ( $path_parts['filename'] ?? '' ) . '.' . $new_container );
			$new_url      = (string) ( dirname( $original_url ) . '/' . ( $path_parts['filename'] ?? '' ) . '.' . $new_container );
		}

		if ( $original_filepath !== $new_filename && is_file( $original_filepath ) ) {
			wp_delete_file( $original_filepath );
		}

		if ( ! $wp_filesystem->move( $encoded_filepath, $new_filename, true ) ) {
			/* translators: %1$s and %2$s are both file paths. */
			$replacing_format->set_error( (string) sprintf( (string) __( 'Failed to move encoded file from %1$s to %2$s.', 'video-embed-thumbnail-generator' ), $encoded_filepath, $new_filename ) );
			return false;
		}

		if ( $original_url !== $new_url ) {
			$results = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT ID, post_content FROM $wpdb->posts WHERE post_content LIKE %s",
					'%' . $wpdb->esc_like( $original_url ) . '%'
				)
			);
			if ( ! empty( $results ) ) {
				foreach ( $results as $result ) {
					$new_post_content = (string) str_replace( $original_url, $new_url, (string) $result->post_content );
					if ( $new_post_content !== (string) $result->post_content ) {
						wp_update_post(
							array(
								'ID'           => (int) $result->ID,
								'post_content' => $new_post_content,
							)
						);
					}
				}
			}
		}

		if ( ! function_exists( 'wp_generate_attachment_metadata' ) ) {
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}
		if ( ! function_exists( 'wp_read_video_metadata' ) ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
		}

		update_attached_file( $video_id, $new_filename );
		$attach_data = (array) wp_generate_attachment_metadata( $video_id, $new_filename );
		wp_update_attachment_metadata( $video_id, $attach_data );

		$new_mime    = (array) wp_check_filetype( $new_filename );
		$post_update = array(
			'ID'             => $video_id,
			'post_mime_type' => (string) ( $new_mime['type'] ?? '' ),
			'guid'           => $new_url,
		);
		wp_update_post( $post_update );

		$attachment_meta_instance             = new \Videopack\Admin\Attachment_Meta( $this->options, $video_id );
		$current_meta                         = (array) $attachment_meta_instance->get();
		$current_meta['original_replaced']    = $format_id;
		$current_meta['ffmpeg_watermark_url'] = ! empty( $this->options['ffmpeg_watermark']['url'] ) ? (string) $this->options['ffmpeg_watermark']['url'] : null;
		$attachment_meta_instance->save( $current_meta );

		do_action( 'videopack_cron_new_attachment', $video_id, 'thumbs' );

		$replacing_format->set_path( $new_filename );
		$replacing_format->set_url( $new_url );

		return true;
	}

	/**
	 * Deletes an encoded format and its associated files.
	 *
	 * @param int  $job_id            The ID of the job to delete.
	 * @param bool $delete_attachment Optional. Whether to delete the WP attachment. Default true.
	 * @return bool True if deletion process attempted, false otherwise.
	 */
	public function delete_format( int $job_id, bool $delete_attachment = true ) {
		$encode_format = $this->get_encode_format_by_job_id( (int) $job_id );

		if ( ! $encode_format instanceof Encode_Format ) {
			return false;
		}

		$can_delete_own_job    = ( (int) get_current_user_id() === (int) $encode_format->get_user_id() && current_user_can( 'encode_videos' ) );
		$can_delete_others_job = (bool) current_user_can( 'edit_others_video_encodes' );

		if ( ! ( $can_delete_own_job || $can_delete_others_job ) ) {
			$encode_format->set_error( (string) __( 'User does not have permission to delete this encoding job.', 'video-embed-thumbnail-generator' ) );
			$this->save_format( $encode_format );
			return false;
		}

		$overall_success = true;
		if ( ! $this->cleanup_encode_files( $encode_format ) ) {
			$overall_success = false;
		}

		$wp_attachment_id = (int) $encode_format->get_id();
		if ( $wp_attachment_id > 0 && (string) get_post_type( $wp_attachment_id ) === 'attachment' ) {
			if ( $wp_attachment_id !== (int) $this->id ) {
				if ( (bool) $delete_attachment ) {
					if ( ! (bool) self::$in_delete_format ) {
						self::$in_delete_format = true;
						$attachment_deleted     = (bool) wp_delete_attachment( $wp_attachment_id, true );
						self::$in_delete_format = false;

						if ( ! $attachment_deleted ) {
							$encode_format->set_error( (string) __( 'Failed to delete WordPress attachment.', 'video-embed-thumbnail-generator' ) );
							$overall_success = false;
						}
					}
				}
			}
		}

		$encode_format->set_status( 'deleted' );
		$encode_format->set_path( null );
		$encode_format->set_url( null );
		$encode_format->set_id( null );
		$encode_format->set_logfile( null );
		$encode_format->set_temp_watermark_path( null );

		$this->save_format( $encode_format );

		return (bool) $overall_success;
	}

	/**
	 * Cleans up files associated with an encoding job.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $encode_format The format object.
	 * @return bool True if all deletions were successful or files didn't exist, false otherwise.
	 */
	protected function cleanup_encode_files( Encode_Format $encode_format ) {
		$success = true;

		$files_to_delete = array(
			(string) $encode_format->get_path(),
			(string) $encode_format->get_logfile(),
			(string) $encode_format->get_temp_watermark_path(),
		);

		foreach ( $files_to_delete as $file_path ) {
			if ( ! empty( $file_path ) && is_file( $file_path ) ) {
				if ( ! (bool) wp_delete_file( $file_path ) ) {
					/* translators: %s is the file path. */
					$encode_format->set_error( (string) sprintf( (string) __( 'Failed to delete file: %s', 'video-embed-thumbnail-generator' ), $file_path ) );
					$success = false;
				}
			}
		}
		return (bool) $success;
	}

	/**
	 * Checks if there are other pending encoding jobs for this source.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $encode_format The current format object.
	 * @return bool True if pending jobs exist, false otherwise.
	 */
	private function has_pending_jobs( Encode_Format $encode_format ) {
		global $wpdb;
		$current_blog_id   = (int) get_current_blog_id();
		$pending_job_count = 0;

		if ( (bool) $this->is_attachment && is_numeric( $this->id ) ) {
			$pending_job_count = (int) $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM %i WHERE attachment_id = %d AND blog_id = %d AND status IN ("encoding", "queued", "processing") AND id != %d',
					(string) $this->queue_table_name,
					(int) $this->id,
					$current_blog_id,
					(int) $encode_format->get_job_id()
				)
			);
		} elseif ( ! empty( $this->url ) ) {
			$pending_job_count = (int) $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM %i WHERE input_url = %s AND blog_id = %d AND status IN ("encoding", "queued", "processing") AND id != %d',
					(string) $this->queue_table_name,
					(string) $this->url,
					$current_blog_id,
					(int) $encode_format->get_job_id()
				)
			);
		}

		return $pending_job_count > 0;
	}

	/**
	 * Replaces the original attachment with the encoded version if authorized.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $encode_format The format object.
	 * @return bool True on success, false otherwise.
	 */
	private function replace_original_attachment( Encode_Format $encode_format ) {
		if ( (bool) $this->has_pending_jobs( $encode_format ) ) {
			$encode_format->set_status( Encode_Format::STATUS_PENDING_REPLACEMENT );
			$this->save_format( $encode_format );
			Debug_Logger::log( 'Setting status to pending_replacement', array( 'job_id' => (int) $encode_format->get_job_id() ) );
			return false;
		}

		$result = $this->replace_original( $encode_format );

		if ( true === $result ) {
			$encode_format->set_status( Encode_Format::STATUS_COMPLETED );
			$this->save_format( $encode_format );
			Debug_Logger::log( 'Successfully replaced original attachment', array( 'job_id' => (int) $encode_format->get_job_id() ) );
			return true;
		}

		$this->save_format( $encode_format );
		return false;
	}

	/**
	 * Creates a new WordPress attachment for the encoded video.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $encode_format The format object.
	 * @return bool True on success, false otherwise.
	 */
	private function create_new_attachment( Encode_Format $encode_format ) {
		$path                = (string) $encode_format->get_path();
		$url                 = (string) $encode_format->get_url();
		$user_id             = (int) $encode_format->get_user_id();
		$format_id           = (string) $encode_format->get_format_id();
		$video_format_config = $this->video_formats[ $format_id ] ?? null;

		$parent_post_id = 0;
		if ( (bool) $this->is_attachment && is_numeric( $this->id ) ) {
			$parent_post_id = (int) $this->id;
		}

		$existing_attachment_id = (int) $this->attachment_manager->url_to_id( $url );

		if ( $existing_attachment_id <= 0 ) {
			$wp_filetype = (array) wp_check_filetype( (string) basename( $path ) );
			$title_base  = (string) ( $parent_post_id ? get_the_title( $parent_post_id ) : get_the_title( (int) $this->id ) );
			$title       = (string) ( $title_base . ' ' . ( $video_format_config instanceof Video_Format ? $video_format_config->get_label() : '' ) );

			$author_id_from_parent = (int) ( $parent_post_id ? get_post_field( 'post_author', $parent_post_id ) : get_current_user_id() );
			$author_id             = $user_id > 0 ? $user_id : $author_id_from_parent;
			if ( $author_id <= 0 ) {
				$author_id = (int) get_current_user_id();
			}

			$attachment_data = array(
				'guid'           => $url,
				'post_mime_type' => (string) ( $wp_filetype['type'] ?? '' ),
				'post_title'     => $title,
				'post_content'   => '',
				'post_status'    => 'inherit',
				'post_author'    => $author_id,
			);

			$new_attachment_id = wp_insert_attachment( $attachment_data, $path, $parent_post_id );

			if ( ! is_wp_error( $new_attachment_id ) && (int) $new_attachment_id > 0 ) {
				$new_attachment_id = (int) $new_attachment_id;
				if ( ! function_exists( 'wp_generate_attachment_metadata' ) ) {
					require_once ABSPATH . 'wp-admin/includes/image.php';
				}
				if ( ! function_exists( 'wp_read_video_metadata' ) ) {
					require_once ABSPATH . 'wp-admin/includes/media.php';
				}
				$attach_meta = (array) wp_generate_attachment_metadata( $new_attachment_id, $path );
				wp_update_attachment_metadata( $new_attachment_id, $attach_meta );

				if ( $new_attachment_id ) {
					$attachment_meta_instance             = new \Videopack\Admin\Attachment_Meta( $this->options, $new_attachment_id );
					$current_meta                         = (array) $attachment_meta_instance->get();
					$current_meta['ffmpeg_watermark_url'] = ! empty( $this->options['ffmpeg_watermark']['url'] ) ? (string) $this->options['ffmpeg_watermark']['url'] : null;
					$attachment_meta_instance->save( $current_meta );
				}

				update_post_meta( $new_attachment_id, '_kgflashmediaplayer-format', $format_id );
				if ( ! (bool) $this->is_attachment && ! empty( $this->url ) ) {
					update_post_meta( $new_attachment_id, '_kgflashmediaplayer-externalurl', (string) $this->url );
				}

				$encode_format->set_id( $new_attachment_id );
				$encode_format->set_status( Encode_Format::STATUS_COMPLETED );
				$this->save_format( $encode_format );
				Debug_Logger::log(
					'Successfully inserted attachment',
					array(
						'job_id'        => (int) $encode_format->get_job_id(),
						'attachment_id' => $new_attachment_id,
					)
				);
				return true;
			}

			$msg_detail = is_wp_error( $new_attachment_id ) ? (string) $new_attachment_id->get_error_message() : (string) __( 'wp_insert_attachment returned 0 or invalid ID.', 'video-embed-thumbnail-generator' );
			/* translators: %s is the error message. */
			$msg = (string) sprintf( (string) __( 'Failed to insert new attachment: %s', 'video-embed-thumbnail-generator' ), $msg_detail );
			$encode_format->set_error( $msg );
			$this->save_format( $encode_format );
			Debug_Logger::log(
				'Failed to insert attachment',
				array(
					'job_id' => (int) $encode_format->get_job_id(),
					'error'  => $msg,
				)
			);
			return false;
		}

		$encode_format->set_id( $existing_attachment_id );
		$encode_format->set_status( Encode_Format::STATUS_COMPLETED );
		$this->save_format( $encode_format );
		Debug_Logger::log(
			'Attachment already exists, marking job completed',
			array(
				'job_id'        => (int) $encode_format->get_job_id(),
				'attachment_id' => $existing_attachment_id,
			)
		);
		return true;
	}

	/**
	 * Orchestrates the insertion of an encoded format into the WordPress media library.
	 *
	 * @param \Videopack\Admin\Encode\Encode_Format $encode_format The format object.
	 * @return bool True on success, false otherwise.
	 */
	public function insert_attachment( Encode_Format $encode_format ) {
		Debug_Logger::log( 'Starting insert_attachment', array( 'job_id' => (int) $encode_format->get_job_id() ) );
		$format_id           = (string) $encode_format->get_format_id();
		$path                = (string) $encode_format->get_path();
		$video_format_config = $this->video_formats[ $format_id ] ?? null;

		if ( ! $video_format_config instanceof Video_Format ) {
			/* translators: %s is the video format ID (ex. 'mp4_720p'). */
			$encode_format->set_error( (string) sprintf( (string) __( 'Video format configuration not found for format: %s', 'video-embed-thumbnail-generator' ), $format_id ) );
			$this->save_format( $encode_format );
			return false;
		}

		if ( empty( $path ) || ! is_file( $path ) ) {
			/* translators: %1$s is the file path, %2$s is the format ID. */
			$encode_format->set_error( (string) sprintf( (string) __( 'Encoded file not found at path: %1$s for format %2$s', 'video-embed-thumbnail-generator' ), $path, $format_id ) );
			$this->save_format( $encode_format );
			return false;
		}

		if ( $this->is_replacement_format( $format_id ) ) {
			return (bool) $this->replace_original_attachment( $encode_format );
		}

		if ( ! (int) $encode_format->get_id() ) {
			return (bool) $this->create_new_attachment( $encode_format );
		}

		if ( (int) $encode_format->get_id() > 0 && is_file( $path ) ) {
			$encode_format->set_status( Encode_Format::STATUS_COMPLETED );
			$this->save_format( $encode_format );
			Debug_Logger::log( 'Attachment ID already set and file exists, marking job completed', array( 'job_id' => (int) $encode_format->get_job_id() ) );
			return true;
		}

		if ( (int) $encode_format->get_id() > 0 && ! is_file( $path ) ) {
			/* translators: %1$d is the attachment ID, %2$s is the file path. */
			$encode_format->set_error( (string) sprintf( (string) __( 'Encoded file is missing for existing attachment ID %1$d at path: %2$s', 'video-embed-thumbnail-generator' ), (int) $encode_format->get_id(), $path ) );
			$this->save_format( $encode_format );
			return false;
		}

		if ( empty( $encode_format->get_error() ) && Encode_Format::STATUS_COMPLETED !== (string) $encode_format->get_status() ) {
			$encode_format->set_error( (string) __( 'An unexpected error occurred during attachment processing.', 'video-embed-thumbnail-generator' ) );
		}
		$this->save_format( $encode_format );
		return false;
	}
}
