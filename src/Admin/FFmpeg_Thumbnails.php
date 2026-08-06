<?php
/**
 * Admin FFmpeg thumbnails handler.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

/**
 * Class FFmpeg_Thumbnails
 *
 * Handles video thumbnail generation using FFmpeg.
 *
 * This class provides methods for capturing thumbnails from video files at
 * specific timecodes, applying rotations and watermarks, and saving the
 * results to the WordPress Media Library.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class FFmpeg_Thumbnails {

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $format_registry
	 */
	protected $format_registry;

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Constructor.
	 *
	 * @param array                             $options         Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry = null ) {
		$this->options         = $options;
		$this->format_registry = $format_registry ? $format_registry : new \Videopack\Admin\Formats\Registry( $options );
	}

	/**
	 * Processes a thumbnail extraction using FFmpeg.
	 *
	 * @param string      $input          Input file path.
	 * @param string      $output         Output file path.
	 * @param string|bool $ffmpeg_path    Optional. Path to FFmpeg binary.
	 * @param string      $seek           Optional. Timecode to seek to (default '0').
	 * @param array       $rotate_array   Optional. Rotation parameters for FFmpeg.
	 * @param array       $filter_complex Optional. Complex filter parameters for FFmpeg.
	 * @return string Error output from FFmpeg execution.
	 */
	public function process_thumb(
		$input,
		$output,
		$ffmpeg_path = false,
		$seek = '0',
		$rotate_array = array(),
		$filter_complex = array()
	) {
		$input  = (string) $input;
		$output = (string) $output;
		$seek   = (string) $seek;

		if ( '' === $ffmpeg_path ) {
			$ffmpeg_path = 'ffmpeg';
		} elseif ( false === $ffmpeg_path ) {
			$ffmpeg_path = (string) ( $this->options['app_path'] ?? '' ) . '/ffmpeg';
		} else {
			$ffmpeg_path = (string) $ffmpeg_path . '/ffmpeg';
		}

		$before_thumb_options = array(
			(string) $ffmpeg_path,
			'-y',
			'-ss',
			$seek,
			'-i',
			$input,
		);

		if ( ! empty( $filter_complex['input'] ) ) {
			$before_thumb_options[] = '-i';
			$before_thumb_options[] = (string) $filter_complex['input'];
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

		if ( ! empty( $filter_complex['input'] ) && ! empty( $filter_complex['filter'] ) ) {
			$thumb_options[] = '-filter_complex';
			$thumb_options[] = (string) $filter_complex['filter'];
		}

		$thumb_options[] = $output;

		$commandline = (array) array_merge( $before_thumb_options, $thumb_options );
		$process     = new \Videopack\Admin\Encode\FFmpeg_Process( $commandline );

		try {
			$process->run();
			return (string) $process->getErrorOutput();
		} catch ( \Exception $e ) {
			return (string) $e->getMessage();
		}
	}

	/**
	 * Generates a single temporary thumbnail image for a given video.
	 *
	 * @param int|string $source_id        A video attachment ID, or a raw video URL if no attachment exists yet.
	 * @param int        $total_thumbnails The total number of thumbnails being generated in this batch.
	 * @param int        $thumbnail_index  The 1-based index of the thumbnail to generate.
	 * @param bool       $is_random        Whether to use a random offset for the timecode.
	 * @return array|\WP_Error An array with 'path' and 'url' on success, or WP_Error on failure.
	 */
	public function generate_single_thumbnail_data( $source_id, int $total_thumbnails, int $thumbnail_index, bool $is_random ) {
		$source = \Videopack\Video_Source\Source_Factory::create( $source_id, $this->options, $this->format_registry );
		if ( ! $source || ! $source->exists() ) {
			return new \WP_Error( 'file_not_found', (string) __( 'Video file not found.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}

		$input_path     = (string) $source->get_direct_path();
		$is_attachment  = ( $source instanceof \Videopack\Video_Source\Source_Attachment );
		$metadata_id    = $is_attachment ? (int) $source->get_id() : 0;
		$ffmpeg_path    = ! empty( $this->options['app_path'] ) ? (string) $this->options['app_path'] . '/ffmpeg' : 'ffmpeg';
		$video_metadata = new \Videopack\Admin\Encode\Video_Metadata( $metadata_id, $input_path, $is_attachment, (string) $ffmpeg_path, $this->options );

		if ( ! $video_metadata->worked || ! $video_metadata->duration ) {
			return new \WP_Error( 'metadata_failed', (string) __( 'Could not read video metadata.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		// Calculate timecode.
		$timecode = ( ( $thumbnail_index - 0.5 ) / $total_thumbnails ) * (float) $video_metadata->duration;
		if ( $is_random ) {
			$random_max_subtraction = (float) $video_metadata->duration / $total_thumbnails;
			$random_subtraction     = ( wp_rand( 0, 1000000 ) / 1000000 ) * $random_max_subtraction;
			$timecode              -= $random_subtraction;
		}
		$timecode = (float) max( 0.0, round( $timecode, 3 ) );

		return $this->generate_temp_thumbnail( $input_path, $timecode, $video_metadata );
	}

	/**
	 * Generates a single thumbnail for a video at a specific timecode.
	 *
	 * @param int|string $source_id A video attachment ID, or a raw video URL if no attachment exists yet.
	 * @param float      $timecode  The time in seconds to capture the thumbnail from.
	 * @return array|\WP_Error An array with 'path' and 'url' on success, or WP_Error on failure.
	 */
	public function generate_thumbnail_at_timecode( $source_id, float $timecode ) {
		$source = \Videopack\Video_Source\Source_Factory::create( $source_id, $this->options, $this->format_registry );
		if ( ! $source || ! $source->exists() ) {
			return new \WP_Error( 'file_not_found', (string) __( 'Video file not found.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}

		$input_path     = (string) $source->get_direct_path();
		$is_attachment  = ( $source instanceof \Videopack\Video_Source\Source_Attachment );
		$metadata_id    = $is_attachment ? (int) $source->get_id() : 0;
		$ffmpeg_path    = ! empty( $this->options['app_path'] ) ? (string) $this->options['app_path'] . '/ffmpeg' : 'ffmpeg';
		$video_metadata = new \Videopack\Admin\Encode\Video_Metadata( $metadata_id, $input_path, $is_attachment, (string) $ffmpeg_path, $this->options );

		if ( ! $video_metadata->worked ) {
			return new \WP_Error( 'metadata_failed', (string) __( 'Could not read video metadata.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		return $this->generate_temp_thumbnail( $input_path, $timecode, $video_metadata );
	}

	/**
	 * Generates a single thumbnail image from a video at a specific timecode into a temporary directory.
	 *
	 * @param string                                 $input_path     The full path to the input video file.
	 * @param float                                  $timecode       The time in seconds to capture the thumbnail from.
	 * @param \Videopack\Admin\Encode\Video_Metadata $video_metadata The metadata object for the video.
	 * @return array|\WP_Error An array with 'path' and 'url' on success, or WP_Error on failure.
	 */
	protected function generate_temp_thumbnail( string $input_path, float $timecode, \Videopack\Admin\Encode\Video_Metadata $video_metadata ) {
		$uploads = wp_upload_dir();
		$tmp_dir = (string) $uploads['path'] . '/thumb_tmp';
		wp_mkdir_p( $tmp_dir );

		$path_for_info = $input_path;
		if ( \Videopack\Common\Validate::filter_validate_url( $input_path ) ) {
			$path_for_info = (string) wp_parse_url( $input_path, PHP_URL_PATH );
		}
		$sanitized_basename = (string) sanitize_file_name( (string) pathinfo( $path_for_info, PATHINFO_FILENAME ) );
		$unique_id          = (string) uniqid();
		$temp_filename      = "{$sanitized_basename}_thumb_{$unique_id}.jpg";
		$temp_filepath      = $tmp_dir . '/' . $temp_filename;
		$temp_fileurl       = (string) $uploads['url'] . '/thumb_tmp/' . $temp_filename;

		$rotate_strings = (array) $this->rotate_array( $video_metadata->rotate, (int) $video_metadata->actualwidth, (int) $video_metadata->actualheight );
		$filter_complex = (array) $this->filter_complex( $this->options['ffmpeg_thumb_watermark'] ?? array(), (int) $video_metadata->actualheight, true );

		$output = (string) $this->process_thumb(
			$input_path,
			$temp_filepath,
			(string) ( $this->options['app_path'] ?? '' ),
			(string) $timecode,
			(array) ( $rotate_strings['rotate'] ?? array() ),
			$filter_complex
		);

		if ( ! is_file( $temp_filepath ) ) {
			return new \WP_Error( 'thumbnail_generation_failed', (string) __( 'FFmpeg failed to generate the thumbnail.', 'video-embed-thumbnail-generator' ), array( 'output' => $output ) );
		}

		// Schedule cleanup for the temp directory.
		( new \Videopack\Admin\Cleanup() )->schedule( 'thumbs' );

		return array(
			'path' => (string) $temp_filepath,
			'url'  => (string) $temp_fileurl,
		);
	}

	/**
	 * Generates rotation parameters for FFmpeg.
	 *
	 * @param int|bool $rotate Rotation angle.
	 * @param int      $width  Video width.
	 * @param int      $height Video height.
	 * @return array Rotation parameters and metadata.
	 */
	public function rotate_array( $rotate, $width, $height ) {
		$rotate_complex = '';
		$rotate_array   = array();

		if ( false === $rotate ) {
			$rotate = 0;
		}

		switch ( (int) $rotate ) {
			case 90:
				if ( empty( $this->options['ffmpeg_thumb_watermark']['url'] ) ) {
					$rotate_array = array(
						'-vf',
						'transpose=1,scale=' . (int) $height . ':-1',
					);
				} else {
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
				} else {
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
				} else {
					$rotate_complex = 'hflip,vflip[rotate];[rotate]';
				}
				$rotate_array[] = '-metadata:s:v:0';
				$rotate_array[] = 'rotate=0';
				break;

			default:
				break;
		}

		return array(
			'rotate'  => $rotate_array,
			'complex' => $rotate_complex,
			'width'   => (int) $width,
			'height'  => (int) $height,
		);
	}

	/**
	 * Generates a complex filter string for FFmpeg (e.g., for watermarks).
	 *
	 * @param array|false|null $ffmpeg_watermark Watermark settings.
	 * @param int              $movie_height     Video height.
	 * @param bool             $thumb            Optional. Whether this is for a thumbnail (default false).
	 * @return array Filter complex parameters.
	 */
	public function filter_complex( $ffmpeg_watermark, $movie_height, $thumb = false ) {
		$filter_complex = array(
			'input'  => '',
			'filter' => '',
		);

		if ( is_array( $ffmpeg_watermark )
			&& ! empty( $ffmpeg_watermark['url'] )
		) {
			$watermark_height = (string) round( (int) $movie_height * ( (float) ( $ffmpeg_watermark['scale'] ?? 10 ) / 100 ) );

			if ( ( $ffmpeg_watermark['align'] ?? '' ) === 'right' ) {
				$watermark_align = 'main_w-overlay_w-';
			} elseif ( ( $ffmpeg_watermark['align'] ?? '' ) === 'center' ) {
				$watermark_align = 'main_w/2-overlay_w/2-';
			} else {
				$watermark_align = '';
			}

			if ( ( $ffmpeg_watermark['valign'] ?? '' ) === 'bottom' ) {
				$watermark_valign = 'main_h-overlay_h-';
			} elseif ( ( $ffmpeg_watermark['valign'] ?? '' ) === 'center' ) {
				$watermark_valign = 'main_h/2-overlay_h/2-';
			} else {
				$watermark_valign = '';
			}

			$watermark_url = (string) $ffmpeg_watermark['url'];
			if ( \Videopack\Common\Validate::filter_validate_url( $watermark_url ) ) {
				$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options );
				$watermark_id    = (int) ( new \Videopack\Admin\Attachment( $this->options, $this->format_registry, $attachment_meta ) )->url_to_id( $watermark_url );
				if ( $watermark_id ) {
					$watermark_file = (string) get_attached_file( $watermark_id );
					if ( file_exists( $watermark_file ) ) {
						$watermark_url = $watermark_file;
					}
				}
			}

			$watermark_filters = '[1:v]scale=-1:' . $watermark_height . '[watermark];';
			if ( $thumb ) {
				$scale_main_video = '[0:v]scale=iw*sar:ih[scaled];';
			} else {
				$scale_main_video = '[0:v]scale=-2:' . (int) $movie_height . '[scaled];';
			}
			$overlay_watermark = '[scaled][watermark]overlay=' . $watermark_align . 'main_w*' . (string) round( (float) ( $ffmpeg_watermark['x'] ?? 0 ) / 100, 4 ) . ':' . $watermark_valign . 'main_h*' . (string) round( (float) ( $ffmpeg_watermark['y'] ?? 0 ) / 100, 4 );

			$filter_complex['input']  = $watermark_url;
			$filter_complex['filter'] = $watermark_filters . $scale_main_video . $overlay_watermark;

		} elseif ( $thumb ) {
				$filter_complex['filter'] = '[0:v]scale=iw*sar:ih';
		} else {
			$filter_complex['filter'] = '[0:v]scale=-2:' . (int) $movie_height;
		}

		return $filter_complex;
	}

	/**
	 * Moves an uploaded file blob into the thumb_tmp directory and returns its
	 * temporary URL, ready for save() or create_thumbnail_image().
	 *
	 * @param array $file_info The uploaded file data from $_FILES.
	 * @return string|\WP_Error The temporary file URL, or a WP_Error on failure.
	 */
	protected function stage_uploaded_file_as_temp( array $file_info ) {
		if ( ! isset( $file_info['tmp_name'] ) || ! is_uploaded_file( $file_info['tmp_name'] ) ) {
			\Videopack\Common\Debug_Logger::log(
				'stage_uploaded_file_as_temp: invalid upload',
				array(
					'has_tmp_name' => isset( $file_info['tmp_name'] ),
					'tmp_name'     => $file_info['tmp_name'] ?? null,
					'error_code'   => $file_info['error'] ?? null,
				)
			);
			return new \WP_Error( 'no_file', (string) __( 'No file uploaded or invalid upload.', 'video-embed-thumbnail-generator' ) );
		}

		$uploads  = wp_upload_dir();
		$temp_dir = trailingslashit( (string) $uploads['path'] ) . 'thumb_tmp';
		wp_mkdir_p( $temp_dir );
		$temp_file_name = (string) wp_unique_filename( $temp_dir, sanitize_file_name( (string) $file_info['name'] ) );
		$temp_file_path = trailingslashit( $temp_dir ) . $temp_file_name;

		if ( ! move_uploaded_file( (string) $file_info['tmp_name'], $temp_file_path ) ) {
			\Videopack\Common\Debug_Logger::log(
				'stage_uploaded_file_as_temp: move_uploaded_file failed',
				array( 'target' => $temp_file_path )
			);
			return new \WP_Error( 'move_failed', (string) __( 'Failed to move uploaded file.', 'video-embed-thumbnail-generator' ) );
		}

		return trailingslashit( (string) $uploads['url'] ) . 'thumb_tmp/' . $temp_file_name;
	}

	/**
	 * Saves a thumbnail image from an uploaded blob to the Media Library.
	 *
	 * @param int    $attachment_id    The ID of the video attachment.
	 * @param string $post_name        The name of the video post.
	 * @param array  $file_info        The uploaded file data from $_FILES.
	 * @param int    $force_parent_id  Optional. Parent ID to set.
	 * @param bool   $force_featured   Optional. Force featured status.
	 * @param bool   $force_set_poster Optional. Whether to force setting the poster. Default true.
	 * @param string $filename_suffix  Optional. Suffix for the thumbnail filename. Default '_thumb'.
	 * @return array Result with 'thumb_id' and 'error'.
	 */
	public function save_from_blob( $attachment_id, $post_name, $file_info, $force_parent_id = 0, $force_featured = null, $force_set_poster = true, $filename_suffix = '_thumb' ) {
		$temp_file_url = $this->stage_uploaded_file_as_temp( $file_info );
		if ( is_wp_error( $temp_file_url ) ) {
			return array(
				'thumb_id' => false,
				'error'    => $temp_file_url->get_error_message(),
			);
		}

		return $this->save( (int) $attachment_id, (string) $post_name, $temp_file_url, false, (int) $force_parent_id, $force_featured, $force_set_poster, $filename_suffix );
	}

	/**
	 * Resolves/creates a thumbnail image attachment from an uploaded blob,
	 * without any video-poster side effects - the upload-only counterpart to
	 * create_thumbnail_image(), for verifying an upload before a video
	 * attachment exists.
	 *
	 * @param string $post_name       Base filename for the new attachment.
	 * @param string $video_title     Descriptive title used in the attachment description.
	 * @param int    $parent_id       Parent post ID for the new attachment.
	 * @param array  $file_info       The uploaded file data from $_FILES.
	 * @param string $filename_suffix Optional. Suffix for the thumbnail filename. Default '_thumb'.
	 * @return array Result with 'thumb_id' and 'error'/'thumb_url'.
	 */
	public function create_thumbnail_image_from_blob( $post_name, $video_title, $parent_id, $file_info, $filename_suffix = '_thumb' ) {
		$temp_file_url = $this->stage_uploaded_file_as_temp( $file_info );
		if ( is_wp_error( $temp_file_url ) ) {
			return array(
				'thumb_id' => false,
				'error'    => $temp_file_url->get_error_message(),
			);
		}

		return $this->create_thumbnail_image( $temp_file_url, (string) $post_name, (string) $video_title, (int) $parent_id, false, $filename_suffix );
	}

	/**
	 * Saves a thumbnail image to the Media Library.
	 *
	 * A thin wrapper preserving the original combined behavior: resolves the
	 * parent to use (respecting the thumb_parent option), creates/resolves the
	 * thumbnail image, then wires it up as the video's poster. Callers that
	 * need to verify a real thumbnail can be generated *before* a video
	 * attachment exists should call create_thumbnail_image() directly instead
	 * - see Thumbnail_Controller::thumb_save().
	 *
	 * @param int|string      $attachment_id    Video attachment ID.
	 * @param string          $post_name        Video post name.
	 * @param string          $thumb_url        Thumbnail URL (local temp or remote).
	 * @param int|bool        $thumbnail_index  Optional. Index for the thumbnail filename.
	 * @param int             $force_parent_id  Optional. Parent ID to set.
	 * @param bool|string|null $force_featured   Optional. Flag to force featured status.
	 * @param bool|string     $force_set_poster Optional. Whether to force setting the poster. Default true.
	 * @param string          $filename_suffix  Optional. Suffix for the thumbnail filename. Default '_thumb'.
	 * @return array Result of the save operation.
	 */
	public function save( $attachment_id, $post_name, $thumb_url, $thumbnail_index = false, $force_parent_id = 0, $force_featured = null, $force_set_poster = true, $filename_suffix = '_thumb' ) {
		if ( is_string( $force_set_poster ) ) {
			$force_set_poster_lower = strtolower( $force_set_poster );
			$force_set_poster       = ( 'false' !== $force_set_poster_lower && '0' !== $force_set_poster_lower && '' !== $force_set_poster_lower && 'undefined' !== $force_set_poster_lower && 'null' !== $force_set_poster_lower );
		} else {
			$force_set_poster = (bool) $force_set_poster;
		}

		$video = get_post( (int) $attachment_id );

		if ( empty( $thumb_url ) ) {
			$this->assign_thumbnail_to_video( (int) $attachment_id, false, (int) $force_parent_id, $force_featured, $force_set_poster );
			return array(
				'thumb_id'  => false,
				'thumb_url' => '',
			);
		}

		// Preserve the existing parent-resolution: default to the video
		// attachment itself, unless thumb_parent=post, in which case prefer
		// an explicit override or the video's own post_parent.
		$parent_id = (int) $attachment_id;
		if ( ( $this->options['thumb_parent'] ?? 'post' ) === 'post' ) {
			if ( ! empty( $force_parent_id ) ) {
				$parent_id = (int) $force_parent_id;
			} elseif ( $video instanceof \WP_Post && ! empty( $video->post_parent ) ) {
				$parent_id = (int) $video->post_parent;
			}
		}

		// Raw, not get_the_title() -- this becomes another post's post_title
		// below (via $desc), and get_the_title() runs the full the_title
		// filter chain (wptexturize and anything else hooked to it), which
		// shouldn't get baked into a new stored title.
		$video_title        = (string) get_post_field( 'post_title', (int) $attachment_id, 'raw' );
		$fallback_author_id = $video instanceof \WP_Post ? (int) $video->post_author : 0;

		$result = $this->create_thumbnail_image( $thumb_url, $post_name, $video_title, $parent_id, $thumbnail_index, $filename_suffix, $fallback_author_id );

		if ( ! empty( $result['thumb_id'] ) && ! is_wp_error( $result['thumb_id'] ) ) {
			\Videopack\Common\Debug_Logger::log(
				'FFmpeg_Thumbnails::save: assigning thumbnail to video',
				array(
					'attachment_id' => $attachment_id,
					'thumb_id'      => $result['thumb_id'],
					'force_set_poster' => $force_set_poster,
				)
			);
			$this->assign_thumbnail_to_video( (int) $attachment_id, (int) $result['thumb_id'], (int) $force_parent_id, $force_featured, $force_set_poster );
		} else {
			\Videopack\Common\Debug_Logger::log(
				'FFmpeg_Thumbnails::save: create_thumbnail_image did not return a usable thumb_id',
				array(
					'attachment_id' => $attachment_id,
					'result'        => $result,
				)
			);
		}

		return $result;
	}

	/**
	 * Resolves an existing thumbnail image attachment for a URL, or creates a
	 * new one in the Media Library, parented to $parent_id directly. Does not
	 * touch any video's poster/featured-image meta - see
	 * assign_thumbnail_to_video() for that. Safe to call before a video
	 * attachment exists, since it never reads or writes anything keyed by a
	 * video attachment ID.
	 *
	 * @param string       $thumb_url          Thumbnail URL (local temp or remote).
	 * @param string       $post_name          Base filename for the new attachment.
	 * @param string       $video_title        Descriptive title used in the attachment description.
	 * @param int          $parent_id          Parent post ID for the new thumbnail attachment.
	 * @param int|bool     $thumbnail_index    Optional. Index for the thumbnail filename.
	 * @param string       $filename_suffix    Optional. Suffix for the thumbnail filename. Default '_thumb'.
	 * @param int          $fallback_author_id Optional. Author to use if no user is logged in.
	 * @return array Result with 'thumb_id' (int|false|\WP_Error) and 'thumb_url'.
	 */
	public function create_thumbnail_image( $thumb_url, $post_name, $video_title, $parent_id, $thumbnail_index = false, $filename_suffix = '_thumb', $fallback_author_id = 0 ) {
		$user_ID = (int) get_current_user_id();
		$uploads = wp_upload_dir();

		$existing_attachment_id = (int) attachment_url_to_postid( (string) $thumb_url );
		if ( $existing_attachment_id ) {
			// An attachment that already exists keeps its parent - it
			// shouldn't move just because it's being reused as a thumbnail here.
			return array(
				'thumb_id'  => $existing_attachment_id,
				'thumb_url' => (string) $thumb_url,
				'is_new'    => false,
			);
		}

		$final_poster_url = (string) $thumb_url;
		$tmp_prefix         = trailingslashit( (string) $uploads['url'] ) . 'thumb_tmp/';
		$is_local_temp_file = ( 0 === strpos( (string) $thumb_url, $tmp_prefix ) );

		/**
		 * Filters the description type suffix for a generated thumbnail file.
		 *
		 * Default is 'thumbnail'. Allows customizing attachment description metadata.
		 *
		 * @since 5.0.0
		 *
		 * @param string $desc_type       The thumbnail description type label.
		 * @param string $filename_suffix The custom suffix appended to the thumbnail file name.
		 */
		$desc_type = (string) apply_filters( 'videopack_thumb_desc_type', 'thumbnail', $filename_suffix );
		$suffix    = ( 'thumbnail' === $desc_type ) ? esc_html_x( 'thumbnail', 'text appended to newly created attachment titles', 'video-embed-thumbnail-generator' ) : esc_html( $desc_type );
		$desc      = (string) $video_title . ' ' . (string) $suffix;
		if ( $thumbnail_index ) {
			$desc .= ' ' . (string) $thumbnail_index;
		}

		if ( $is_local_temp_file ) {
			$posterfile_basename = (string) pathinfo( (string) $thumb_url, PATHINFO_BASENAME );
			$tmp_posterpath      = (string) $uploads['path'] . '/thumb_tmp/' . $posterfile_basename;

			if ( ! is_file( $tmp_posterpath ) ) {
				\Videopack\Common\Debug_Logger::log(
					'create_thumbnail_image: staged temp file missing',
					array( 'expected_path' => $tmp_posterpath )
				);
				return array(
					'thumb_id'  => false,
					'thumb_url' => (string) $thumb_url,
					'error'     => 'Staged temporary thumbnail file was not found on disk.',
				);
			}

			$base_filename    = (string) sanitize_file_name( (string) $post_name );
			$poster_extension = (string) pathinfo( $posterfile_basename, PATHINFO_EXTENSION );
			$extension        = ! empty( $poster_extension ) ? $poster_extension : 'jpg';

			$index = 1;
			if ( false !== $thumbnail_index && is_numeric( $thumbnail_index ) ) {
				$index = (int) $thumbnail_index;
			}

			$new_filename_base = "{$base_filename}{$filename_suffix}{$index}";
			$final_posterpath  = (string) $uploads['path'] . '/' . $new_filename_base . '.' . $extension;

			$counter = $index;
			while ( $this->thumb_exists( $final_posterpath, (int) $parent_id ) ) {
				++$counter;
				$new_filename_base = "{$base_filename}{$filename_suffix}{$counter}";
				$final_posterpath  = (string) $uploads['path'] . '/' . $new_filename_base . '.' . $extension;
			}

			$final_poster_url = (string) $uploads['url'] . '/' . basename( $final_posterpath );

			$success = copy( $tmp_posterpath, $final_posterpath );
			wp_delete_file( $tmp_posterpath );

			if ( ! $success ) {
				\Videopack\Common\Debug_Logger::log(
					'create_thumbnail_image: copy() to final path failed',
					array(
						'from' => $tmp_posterpath,
						'to'   => $final_posterpath,
					)
				);
				return array(
					'thumb_id'  => false,
					'thumb_url' => (string) $thumb_url,
					'error'     => 'Failed to copy the generated thumbnail into the uploads directory.',
				);
			}

			$wp_filetype = wp_check_filetype( basename( $final_posterpath ), null );
			if ( empty( $wp_filetype['type'] ) ) {
				$wp_filetype['type'] = 'image/jpeg';
			}

			if ( 0 === $user_ID && $fallback_author_id ) {
				$user_ID = (int) $fallback_author_id;
			}

			$attachment = array(
				'guid'           => $final_poster_url,
				'post_mime_type' => (string) $wp_filetype['type'],
				'post_title'     => $desc,
				'post_content'   => '',
				'post_status'    => 'inherit',
				'post_author'    => $user_ID,
			);

			$thumb_id = (int) wp_insert_attachment( $attachment, $final_posterpath, (int) $parent_id );
			if ( ! $thumb_id ) {
				\Videopack\Common\Debug_Logger::log(
					'create_thumbnail_image: wp_insert_attachment returned 0',
					array( 'path' => $final_posterpath )
				);
			}
			require_once ABSPATH . 'wp-admin/includes/image.php';
			$attach_data = wp_generate_attachment_metadata( $thumb_id, $final_posterpath );
			wp_update_attachment_metadata( $thumb_id, $attach_data );
		} else {
			$tmp = (string) download_url( (string) $thumb_url );

			preg_match( '/[^\?]+\.(jpg|JPG|jpe|JPE|jpeg|JPEG|gif|GIF|png|PNG)/', (string) $thumb_url, $matches );
			$file_array['name']     = (string) basename( $matches[0] ?? 'thumbnail.jpg' );
			$file_array['tmp_name'] = $tmp;

			if ( is_wp_error( $tmp ) ) {
				wp_delete_file( (string) $file_array['tmp_name'] );
				return array(
					'thumb_id'  => false,
					'thumb_url' => (string) $thumb_url,
				);
			}

			$thumb_id = media_handle_sideload( $file_array, (int) $parent_id, $desc );

			if ( is_wp_error( $thumb_id ) ) {
				wp_delete_file( (string) $file_array['tmp_name'] );
				return array(
					'thumb_id'  => $thumb_id,
					'thumb_url' => (string) $thumb_url,
				);
			}

			$final_poster_url = (string) wp_get_attachment_url( (int) $thumb_id );
		}

		/**
		 * Filters the final URL of the poster thumbnail after it is successfully saved to the media library.
		 *
		 * Useful for modifying paths, offloading to CDNs, or storing custom thumbnail size versions.
		 *
		 * @since 5.0.0
		 *
		 * @param string $final_poster_url The absolute URL to the saved poster thumbnail image.
		 * @param int    $thumb_id         The attachment ID of the saved thumbnail image.
		 */
		$final_poster_url = apply_filters( 'videopack_post_save_thumb', $final_poster_url, (int) $thumb_id );

		return array(
			'thumb_id'  => $thumb_id,
			'thumb_url' => (string) $final_poster_url,
			'is_new'    => ! is_wp_error( $thumb_id ) && (bool) $thumb_id,
		);
	}

	/**
	 * Wires up an already-resolved thumbnail image as a video attachment's
	 * poster/featured image. If $thumb_id is falsy, clears the video's
	 * existing poster instead (mirrors the previous behavior of save() when
	 * called with an empty thumb_url).
	 *
	 * @param int              $video_attachment_id The video attachment ID.
	 * @param int|false        $thumb_id            The thumbnail image attachment ID, or false to clear.
	 * @param int              $force_parent_id     Optional. If the video is featured, also set this post's featured image.
	 * @param bool|string|null $force_featured      Optional. Flag to force featured status.
	 * @param bool             $force_set_poster    Whether to set/clear this as the video's poster.
	 * @return void
	 */
	public function assign_thumbnail_to_video( $video_attachment_id, $thumb_id, $force_parent_id = 0, $force_featured = null, $force_set_poster = true ) {
		if ( ! is_numeric( $video_attachment_id ) ) {
			return;
		}
		$video_attachment_id      = (int) $video_attachment_id;
		$video                    = get_post( $video_attachment_id );
		$attachment_meta_instance = new \Videopack\Admin\Attachment_Meta( $this->options, $video_attachment_id );

		if ( ! $thumb_id ) {
			if ( $force_set_poster ) {
				$attachment_meta_instance->set_poster( null, null );

				delete_post_thumbnail( $video_attachment_id );
				if ( $video instanceof \WP_Post && ! empty( $video->post_parent ) ) {
					delete_post_thumbnail( (int) $video->post_parent );
				}
			}
			return;
		}

		$current_meta        = $attachment_meta_instance->get();
		$force_featured_bool = null;
		if ( $force_featured !== null ) {
			if ( is_string( $force_featured ) ) {
				$force_featured_bool = ( 'false' !== strtolower( $force_featured ) && '0' !== $force_featured && '' !== $force_featured );
			} else {
				$force_featured_bool = (bool) $force_featured;
			}
		}

		if ( $force_set_poster ) {
			set_post_thumbnail( $video_attachment_id, (int) $thumb_id );
		}

		$is_featured = $force_featured_bool !== null ? $force_featured_bool : (bool) ( $current_meta['featured'] ?? ( $this->options['featured'] ?? true ) );

		if ( $is_featured ) {
			if ( ! empty( $force_parent_id ) ) {
				set_post_thumbnail( (int) $force_parent_id, (int) $thumb_id );
			} elseif ( $video instanceof \WP_Post && ! empty( $video->post_parent ) ) {
				set_post_thumbnail( (int) $video->post_parent, (int) $thumb_id );
			}
		}

		if ( $force_set_poster ) {
			$final_poster_url = (string) wp_get_attachment_url( (int) $thumb_id );
			$attachment_meta_instance->set_poster( $final_poster_url, (int) $thumb_id, $is_featured );
		}
		delete_post_meta( $video_attachment_id, '_videopack_needs_browser_thumb' );
		delete_post_meta( $video_attachment_id, '_videopack_browser_thumb_failed' );

		update_post_meta( (int) $thumb_id, '_videopack-video-id', $video_attachment_id );
	}

	/**
	 * Checks if a thumbnail exists either on the filesystem or in the media library.
	 *
	 * @param string $path      Full filesystem path to the file.
	 * @param int    $parent_id The ID of the parent post or video.
	 * @return bool True if the thumbnail exists.
	 */
	private function thumb_exists( $path, $parent_id ) {
		$exists = file_exists( $path );

		if ( ! $exists && $parent_id > 0 ) {
			$filename = basename( $path );
			$children = get_children(
				array(
					'post_parent' => (int) $parent_id,
					'post_type'   => 'attachment',
				)
			);

			foreach ( $children as $child ) {
				// We use the second parameter of get_attached_file (true) to get the unfiltered path.
				// This allows us to compare the original filename even if the file has been offloaded to the cloud.
				if ( basename( (string) get_attached_file( $child->ID, true ) ) === $filename ) {
					$exists = true;
					break;
				}
			}
		}

		/**
		 * Filters whether a thumbnail exists.
		 *
		 * @param bool   $exists Whether the thumbnail exists.
		 * @param string $path   The file path.
		 */
				/**
		 * Filters whether a thumbnail file actually exists on the filesystem.
		 *
		 * @since 5.0.0
		 *
		 * @param bool   $exists True if the file exists, false otherwise.
		 * @param string $path   The absolute filesystem path being checked.
		 */
		return (bool) apply_filters( 'videopack_thumb_exists', $exists, $path );
	}
}
