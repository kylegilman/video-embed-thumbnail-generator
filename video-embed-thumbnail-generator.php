<?php
/**
 * Plugin Name
 *
 * @package           Videopack
 * @author            Kyle Gilman
 * @copyright         2023 Kyle Gilman
 * @license           GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name: Videopack
 * Plugin URI: https://www.videopack.video/
 * Description: Makes video thumbnails, allows resolution switching, and embeds responsive self-hosted videos and galleries.
 * Version: 5.0
 * Author: Kyle Gilman
 * Author URI: https://www.kylegilman.net/
 * Text Domain: video-embed-thumbnail-generator
 * Domain Path: /languages
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * 1) Includes code adapted from Joshua Eldridge's Flash Media Player Plugin
 *    Website: http://wordpress.org/extend/plugins/flash-video-player/
 * 2) Includes code adapted from Gary Cao's Make Shortcodes User-Friendly tutorial
 *    Website: http://www.wphardcore.com/2010/how-to-make-shortcodes-user-friendly/
 * 3) Includes code adapted from Justin Gable's "Modifying WordPress' Default Method for Inserting Media"
 *    Website: http://justingable.com/2008/10/03/modifying-wordpress-default-method-for-inserting-media/
 * 4) Includes Video-JS Player
 * Website: http://www.videojs.com/
 * License: http://www.gnu.org/licenses/lgpl.html
 * 5) Includes code adapted from Kathy Darling's custom solution for saving thumbnails
 * Website: http://www.kathyisawesome.com/
 * 6) Includes Dominic's Video.js Resolution Selector
 * Website: https://github.com/dominic-p/videojs-resolution-selector
 *
 * =Translators=
 * Spanish: Andrew Kurtis, Webhostinghub http://www.webhostinghub.com/
 * French: F.R. "Friss" Ferry, friss.designs@gmail.com
 * Bulgarian: Emil Georgiev, svinqvmraka@gmail.com
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( "Can't load this file directly" );
} else {

	if ( ! defined( 'VIDEOPACK_BASENAME' ) ) {
		define( 'VIDEOPACK_BASENAME', plugin_basename( __FILE__ ) );
	}
	if ( ! defined( 'VIDEOPACK_VERSION' ) ) {
		define( 'VIDEOPACK_VERSION', '5.0' );
	}

	require __DIR__ . '/vendor/autoload.php';
}

function videopack_fs_loaded() {
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
add_action( 'videopack_fs_loaded', 'videopack_fs_loaded' );

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

function videopack_cleanup_plugin() {

	$options = kgvid_default_options_fn();

	wp_clear_scheduled_hook( 'kgvid_cleanup_queue', array( 'scheduled' ) );
	wp_clear_scheduled_hook( 'kgvid_cleanup_generated_thumbnails' );
	kgvid_cleanup_generated_thumbnails_handler(); //run this now because cron won't do it later

	kgvid_delete_transients(); //clear URL cache
	delete_transient( 'kgvid_new_attachment_transient' );
	delete_option( 'kgvid_video_embed_cms_switch' );

	$wp_roles = wp_roles();
	if ( is_object( $wp_roles )
		&& property_exists( $wp_roles, 'roles' )
		&& is_array( $options )
		&& array_key_exists( 'capabilities', $options )
		) {
		foreach ( $options['capabilities'] as $capability => $roles ) {
			foreach ( $wp_roles->roles as $role => $role_info ) {
				$wp_roles->remove_cap( $role, $capability );
			}
		}
	}
}

function videopack_deactivate_plugin( $network_wide ) {

	if ( is_multisite() && $network_wide ) {

		$sites = get_sites();

		if ( is_array( $sites ) ) {

			foreach ( $sites as $site ) {

				switch_to_blog( $site->blog_id );
				videopack_cleanup_plugin();
				restore_current_blog();

			} // end loop through sites.
		} // end if there are sites.
	} else { // if not network activated.
		videopack_cleanup_plugin();
	}
}
register_deactivation_hook( __FILE__, 'videopack_deactivate_plugin' );

function videopack_register_uninstall_hook() {

	if ( ! function_exists( 'videopack_fs' ) ) {

		register_uninstall_hook( __FILE__, 'videopack_uninstall_plugin' ); // register WP uninstall instead of Freemius uninstall hook.

	}
}
add_action( 'admin_init', 'videopack_register_uninstall_hook' );

function videopack_uninstall_plugin() {

	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	if ( ! is_multisite() ) {
		delete_option( 'videopack_options' );
		delete_option( 'kgvid_video_embed_queue' );

		global $wpdb;
		$table_name = $wpdb->prefix . 'videopack_encoding_queue';
		$wpdb->query( $wpdb->prepare( 'DROP TABLE IF EXISTS %s', $table_name ) );

	} else {

		delete_site_option( 'kgvid_video_embed_network_options' );
		delete_site_option( 'kgvid_video_embed_queue' );

		$sites = get_sites();

		if ( is_array( $sites ) ) {

			foreach ( $sites as $site ) {
				delete_blog_option( $site->blog_id, 'videopack_options' );
				delete_blog_option( $site->blog_id, 'kgvid_video_embed_queue' );
			}
		}
	}
}

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_videopack() {

	$plugin = new Videopack\Videopack();
	$plugin->run();
}
run_videopack();
