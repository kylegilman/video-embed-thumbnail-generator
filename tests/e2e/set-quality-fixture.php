<?php
/**
 * Puts the encoding quality settings into a known state for the settings
 * screen specs: FFmpeg reported as available (the controls are disabled
 * otherwise, and the wp-env container has no FFmpeg), every codec's ABR
 * quality at its default, and H.264 on CRF.
 *
 * The plugin's own sanitizer re-checks FFmpeg on save and would put
 * "unavailable" straight back, so it is detached for this one write.
 *
 * Called via tests/e2e/helpers.js's prepareQualityFixture().
 *
 * Run via: wp-env run cli wp eval-file <plugin-path>/tests/e2e/set-quality-fixture.php
 *
 * @package Videopack
 */

if ( ! defined( 'ABSPATH' ) ) {
	echo "This script must be run via WP-CLI's eval-file, not directly.\n";
	exit( 1 );
}

remove_all_filters( 'sanitize_option_videopack_options' );

$options                  = get_option( 'videopack_options', array() );
$options['ffmpeg_exists'] = 'available';
$options['ffmpeg_error']  = '';

foreach ( (array) ( $options['encode'] ?? array() ) as $codec_id => $codec_settings ) {
	if ( isset( $codec_settings['vbr'] ) ) {
		$options['encode'][ $codec_id ]['vbr'] = 1.0;
	}
}
$options['encode']['h264']['rate_control'] = 'crf';

update_option( 'videopack_options', $options );

WP_CLI::success( 'Quality settings fixture applied.' );
