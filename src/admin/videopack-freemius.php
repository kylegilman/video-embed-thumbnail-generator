<?php
/**
 * The Freemius functionality of the Videopack plugin.
 *
 * @link       https://www.videopack.video
 *
 * @package    Videopack
 * @subpackage Videopack/admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( "Can't load this file directly" );
}

function kgvid_fs_custom_connect_message_on_update(
	$message,
	$user_first_name,
	$product_title,
	$user_login,
	$site_link,
	$freemius_link
) {
	return sprintf(
		esc_html__( 'Hi %1$s', 'video-embed-thumbnail-generator' ) . ',<br>' .
		esc_html__( 'I changed the name of the Video Embed & Thumbnail Generator plugin to Videopack and released the first of what I hope will be several useful premium add-ons. I\'m using %5$s to license and update the add-ons. Please help me improve Videopack. If you opt-in, some data about your usage of Videopack will be sent to %5$s. If you skip this, that\'s okay! Videopack will still work just fine.', 'video-embed-thumbnail-generator' ),
		esc_html( $user_first_name ),
		'<b>' . esc_html( $product_title ) . '</b>',
		'<b>' . esc_html( $user_login ) . '</b>',
		wp_kses_post( $site_link ),
		wp_kses_post( $freemius_link )
	);
}

function kgvid_videopack_fs_loaded() {
	// add Freemius customizations after Freemius is loaded

	if ( function_exists( 'videopack_fs' ) ) {

		videopack_fs()->add_filter( 'connect_message_on_update', 'kgvid_fs_custom_connect_message_on_update', 10, 6 );

		videopack_fs()->override_i18n(
			array(
				'yee-haw' => esc_html__( 'Great', 'video-embed-thumbnail-generator' ),
				'woot'    => esc_html__( 'Great', 'video-embed-thumbnail-generator' ),
			)
		);

		videopack_fs()->add_action( 'after_uninstall', 'kgvid_uninstall_plugin' ); // add uninstall logic

	}
}
add_action( 'videopack_fs_loaded', 'kgvid_videopack_fs_loaded' );

if ( file_exists( dirname( __DIR__, 2 ) . '/vendor/freemius/wordpress-sdk/start.php' ) && ! function_exists( 'videopack_fs' ) ) {
	// Create a helper function for easy SDK access.
	function videopack_fs() {
		global $videopack_fs;

		if ( ! isset( $videopack_fs ) ) {
			// Activate multisite network integration.
			if ( ! defined( 'WP_FS__PRODUCT_7761_MULTISITE' ) ) {
				define( 'WP_FS__PRODUCT_7761_MULTISITE', true );
			}

			// Include Freemius SDK.
			require_once dirname( __DIR__, 2 ) . '/vendor/freemius/wordpress-sdk/start.php';

			$init_options = array(
				'id'             => '7761',
				'slug'           => 'video-embed-thumbnail-generator',
				'navigation'     => 'tabs',
				'type'           => 'plugin',
				'public_key'     => 'pk_c5b15a7a3cd2ec3cc20e012a2a7bf',
				'is_premium'     => false,
				'has_addons'     => true,
				'has_paid_plans' => false,
				'menu'           => array(
					'slug'    => 'video_embed_thumbnail_generator_settings',
					'contact' => false,
					'support' => false,
					'network' => true,
					'parent'  => array(
						'slug' => 'options-general.php',
					),
				),
			);

			if ( fs_is_network_admin() ) {
				$init_options['navigation']     = 'menu';
				$init_options['menu']['parent'] = array(
					'slug' => 'settings.php',
				);
			}

			$videopack_fs = fs_dynamic_init( $init_options );
		}

		return $videopack_fs;
	}

	// Init Freemius.
	videopack_fs();
	// Signal that SDK was initiated.
	do_action( 'videopack_fs_loaded' );
}
