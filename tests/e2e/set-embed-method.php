<?php
/**
 * Switches the site's global embed_method option (the "Player Settings"
 * choice of Video.js / WordPress Default / a pro-plugin player like
 * "Video.js v10 Beta"), so a Playwright spec can pick which player renders
 * the shared single-video fixture page before running its assertions.
 *
 * Called via tests/e2e/helpers.js's setEmbedMethod(), which writes the
 * target method to the sibling .embed-method file (not a CLI argument —
 * see that function's docblock for why) before running this script.
 *
 * Run via: wp-env run cli wp eval-file <plugin-path>/tests/e2e/set-embed-method.php
 *
 * @package Videopack
 */

if ( ! defined( 'ABSPATH' ) ) {
	echo "This script must be run via WP-CLI's eval-file, not directly.\n";
	exit( 1 );
}

$method_file = __DIR__ . '/.embed-method';
if ( ! file_exists( $method_file ) ) {
	WP_CLI::error( 'Missing ' . $method_file . ' — call setEmbedMethod() from tests/e2e/helpers.js instead of running this directly.' );
}

$method = trim( (string) file_get_contents( $method_file ) );
if ( ! $method ) {
	WP_CLI::error( 'Empty embed_method in ' . $method_file );
}

$options                 = get_option( 'videopack_options', array() );
$options['embed_method'] = $method;
update_option( 'videopack_options', $options );

WP_CLI::success( "embed_method set to: $method" );
