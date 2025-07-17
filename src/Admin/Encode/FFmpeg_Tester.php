<?php

namespace Videopack\Admin\Encode;

/**
 * Handles running diagnostic FFmpeg encoding tests.
 */
class FFmpeg_Tester {

	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

	/**
	 * Constructor.
	 *
	 * @param Options $options_manager The Videopack Options manager instance.
	 */
	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
	}

	/**
	 * Runs a sample FFmpeg encoding test to verify setup.
	 *
	 * @param string $format_id The ID of the video format to test (e.g., 'h264_720p').
	 * @param bool   $rotate    Whether to use a rotated sample video.
	 * @return array An associative array containing 'command' (the FFmpeg command executed)
	 *               and 'output' (the FFmpeg process output), or an error message if the format is invalid.
	 */
	public function run_test_encode( string $format_id, bool $rotate ): array {
		$sample_video_path = VIDEOPACK_PLUGIN_DIR . 'src/images/Adobestock_469037984.mp4';
		if ( $rotate === true ) {
			$sample_video_path = VIDEOPACK_PLUGIN_DIR . 'src/images/Adobestock_469037984-rotated.mp4';
		}

		// Create an Encode_Attachment instance for the sample video.
		// The 'sample_test_id' is an arbitrary ID for this test, as it's not a real attachment.
		$encoder = new Encode_Attachment( $this->options_manager, 'sample_test_id', $sample_video_path );

		// Get the video format configuration from options manager to determine output container.
		$video_formats_config = $this->options_manager->get_video_formats();
		$video_format_obj     = $video_formats_config[ $format_id ] ?? null;

		if ( ! $video_format_obj ) {
			// This should ideally be handled by the REST_Controller's validation,
			// but as a safeguard, return an error here.
			return array(
				'command' => '',
				'output'  => __( 'Invalid video format specified.', 'video-embed-thumbnail-generator' ),
			);
		}

		// Determine a temporary output path and URL for the test.
		$uploads_dir        = wp_upload_dir();
		$temp_filename_base = 'ffmpeg_test_' . uniqid() . '_' . sanitize_title( $format_id );
		$temp_output_path   = trailingslashit( $uploads_dir['path'] ) . $temp_filename_base . '.' . $video_format_obj->get_codec()->get_container();
		$temp_output_url    = trailingslashit( $uploads_dir['url'] ) . $temp_filename_base . '.' . $video_format_obj->get_codec()->get_container();

		// Create an Encode_Format object for this specific test and set its temporary paths.
		$encode_format = new Encode_Format( $format_id );
		$encode_format->set_path( $temp_output_path );
		$encode_format->set_url( $temp_output_url );
		$encode_format->set_user_id( get_current_user_id() ); // Set a dummy user ID.

		$encode_array = $encoder->get_encode_array( $encode_format );
		$process      = new FFmpeg_Process( $encode_array );
		try {
			$process->run();
			$output = $process->getErrorOutput();
		} catch ( \Exception $e ) {
			$output = $e->getMessage();
		} finally {
			// Cleanup temporary files regardless of success or failure.
			if ( is_file( $encode_format->get_path() ) ) {
				wp_delete_file( $encode_format->get_path() );
			}
			// The logfile path is set on the encode_format object by get_encode_array.
			if ( $encode_format->get_logfile() && is_file( $encode_format->get_logfile() ) ) {
				wp_delete_file( $encode_format->get_logfile() );
			}
		}

		return array(
			'command' => implode( ' ', $encode_array ),
			'output'  => $output,
		);
	}

	/**
	 * Checks if FFmpeg exists and is executable at the given path.
	 *
	 * @param string $app_path The path to the FFmpeg executable.
	 * @return array An associative array with:
	 *               - 'proc_open_enabled': bool, true if proc_open is enabled.
	 *               - 'ffmpeg_exists': bool|string, true if FFmpeg is found and executable, 'notinstalled' otherwise.
	 *               - 'output': array, output from the FFmpeg test command.
	 *               - 'app_path': string, the validated path to FFmpeg.
	 */
	public function check_ffmpeg_exists( string $app_path ): array {
		$proc_open_enabled = false;
		$ffmpeg_exists     = false;
		$output            = array();
		$uploads           = wp_upload_dir();
		$test_path         = rtrim( (string) $app_path, '/' );
		$ffmpeg_thumbnails = new \Videopack\Admin\Thumbnails\FFmpeg_Thumbnails( $this->options_manager );

		if ( function_exists( 'proc_open' ) ) {
			$proc_open_enabled = true;

			// Use a unique filename for the test to avoid conflicts.
			$test_image_filename = 'ffmpeg_exists_test_' . uniqid() . '.jpg';
			$test_image_path     = $uploads['path'] . '/' . $test_image_filename;

			$ffmpeg_test = $ffmpeg_thumbnails->process_thumb(
				VIDEOPACK_PLUGIN_DIR . 'src/images/Adobestock_469037984.mp4',
				$test_image_path,
				$test_path
			);

			// If the test failed with the initial path, try without the 'ffmpeg' suffix.
			if ( ! file_exists( $test_image_path ) && substr( $test_path, -6 ) === 'ffmpeg' ) {
				$test_path = substr( $test_path, 0, -7 ); // Remove '/ffmpeg'
				$ffmpeg_test = $ffmpeg_thumbnails->process_thumb(
					VIDEOPACK_PLUGIN_DIR . 'src/images/Adobestock_469037984.mp4',
					$test_image_path,
					$test_path
				);
			}

			if ( file_exists( $test_image_path ) ) {
				$ffmpeg_exists = true;
				wp_delete_file( $test_image_path ); // Clean up the test file.
				$app_path = $test_path; // Update app_path to the one that worked.
			}

			$output = explode( "\n", $ffmpeg_test );
		}

		return array(
			'proc_open_enabled' => $proc_open_enabled,
			'ffmpeg_exists'     => $ffmpeg_exists,
			'output'            => $output,
			'app_path'          => $app_path, // Return the potentially updated path.
		);
	}
}
