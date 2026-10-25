<?php
/**
 * Sets the ffmpeg_exists option ('available' or 'unavailable') so a Playwright
 * spec can check how the settings screen behaves with and without an encoder.
 *
 * Called via tests/e2e/helpers.js's setFfmpegStatus(), which writes the target
 * status to the sibling .ffmpeg-status file (not a CLI argument -- see
 * setEmbedMethod()'s docblock for why) before running this script.
 *
 * The plugin's own sanitizer re-checks FFmpeg on save and would put the real
 * (unavailable) answer straight back, so it is detached for this one write.
 *
 * Run via: wp-env run cli wp eval-file <plugin-path>/tests/e2e/set-ffmpeg-status.php
 *
 * @package Videopack
 */

if ( ! defined( 'ABSPATH' ) ) {
	echo "This script must be run via WP-CLI's eval-file, not directly.
";
	exit( 1 );
}

$status_file = __DIR__ . '/.ffmpeg-status';
if ( ! file_exists( $status_file ) ) {
	WP_CLI::error( 'Missing ' . $status_file . ' -- call setFfmpegStatus() from tests/e2e/helpers.js instead of running this directly.' );
}

$status = trim( (string) file_get_contents( $status_file ) );
if ( ! in_array( $status, array( 'available', 'unavailable' ), true ) ) {
	WP_CLI::error( 'Unexpected ffmpeg status in ' . $status_file . ': ' . $status );
}

remove_all_filters( 'sanitize_option_videopack_options' );

$options                  = get_option( 'videopack_options', array() );
$options['ffmpeg_exists'] = $status;
update_option( 'videopack_options', $options );

WP_CLI::success( "ffmpeg_exists set to: $status" );
