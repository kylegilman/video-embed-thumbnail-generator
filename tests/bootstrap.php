<?php
/**
 * PHPUnit bootstrap file for WordPress Integration Tests.
 *
 * @package Video_Embed_Thumbnail_Generator
 */

// Load Composer autoloader (use require instead of require_once to guarantee returning the ClassLoader object)
$loader = require dirname( __DIR__ ) . '/vendor/autoload.php';

// Dynamically register namespaces for premium add-ons in composer loader if enabled
if ( getenv( 'LOAD_PLAYER_PRO' ) === '1' ) {
	$player_pro_dir = 'C:/Users/kyleg/OneDrive/Documents/Videopack/GitHub/videopack-player-pro';
	if ( file_exists( $player_pro_dir . '/src/' ) ) {
		$loader->addPsr4( 'Videopack\\Player_Pro\\', $player_pro_dir . '/src/' );
	}
}

if ( getenv( 'LOAD_CLOUD_STREAMING' ) === '1' ) {
	$cloud_streaming_dir = 'C:/Users/kyleg/OneDrive/Documents/Videopack/GitHub/videopack-cloud-streaming';
	if ( file_exists( $cloud_streaming_dir . '/src/' ) ) {
		$loader->addPsr4( 'Videopack\\Cloud_Streaming\\', $cloud_streaming_dir . '/src/' );
	}
}

// Disable Freemius SDK during test execution to prevent environment clashes
if ( ! defined( 'VIDEOPACK_FREEMIUS_ENABLED' ) ) {
	define( 'VIDEOPACK_FREEMIUS_ENABLED', false );
}

// Explicitly define path to the relocated wp-tests-config.php configuration file
if ( ! defined( 'WP_TESTS_CONFIG_PATH' ) ) {
	define( 'WP_TESTS_CONFIG_PATH', __DIR__ . '/wp-tests-config.php' );
}

// Define path to the wp-phpunit test library installed via Composer
$_tests_dir = dirname( __DIR__ ) . '/vendor/wp-phpunit/wp-phpunit';

if ( ! file_exists( $_tests_dir . '/includes/bootstrap.php' ) ) {
	echo "Could not find $_tests_dir/includes/bootstrap.php. Make sure wp-phpunit is installed." . PHP_EOL;
	exit( 1 );
}

// Give access to tests_add_filter() database hook.
require_once $_tests_dir . '/includes/functions.php';

/**
 * Manually load the plugin being tested, and optionally load add-ons based on env variables.
 */
function _manually_load_plugin() {
	// Always load the core plugin
	require dirname( __DIR__ ) . '/video-embed-thumbnail-generator.php';

	// Load Player Pro if env variable is set
	if ( getenv( 'LOAD_PLAYER_PRO' ) === '1' ) {
		$player_pro_file = 'C:/Users/kyleg/OneDrive/Documents/Videopack/GitHub/videopack-player-pro/videopack-player-pro.php';
		if ( file_exists( $player_pro_file ) ) {
			require_once $player_pro_file;
		}
	}

	// Load Cloud Streaming if env variable is set
	if ( getenv( 'LOAD_CLOUD_STREAMING' ) === '1' ) {
		$cloud_streaming_file = 'C:/Users/kyleg/OneDrive/Documents/Videopack/GitHub/videopack-cloud-streaming/videopack-cloud-streaming.php';
		if ( file_exists( $cloud_streaming_file ) ) {
			require_once $cloud_streaming_file;
		}
	}
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';
