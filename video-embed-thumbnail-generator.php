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
 * Version: 4.9
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
 * 6) Includes code adapted from Jean-Marc Amiaud's "Replace WordPress default media icon with preview image"
 * Website: http://www.amiaud.org/tag/video/
 * 7) Includes Eric Martin's SimpleModal
 * Website: http://www.ericmmartin.com/projects/simplemodal/
 * 8) Includes Dominic's Video.js Resolution Selector
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

	require_once __DIR__ . '/vendor/autoload.php';
	require_once __DIR__ . '/src/admin/videopack-freemius.php';
	require_once __DIR__ . '/src/admin/videopack-admin.php';
	require_once __DIR__ . '/src/admin/videopack-ffmpeg.php';
	require_once __DIR__ . '/src/admin/videopack-admin-ajax.php';
	require_once __DIR__ . '/src/public/videopack-public.php';
	require_once __DIR__ . '/src/public/videopack-public-ajax.php';
}

function kgvid_video_embed_activation_hook( $network_wide ) {

	if ( is_multisite() && $network_wide ) { // if activated on the entire network.

		$network_options = get_site_option( 'kgvid_video_embed_network_options' );

		if ( ! is_array( $network_options ) ) {

			$network_options = kgvid_default_network_options();

			$ffmpeg_check = kgvid_check_ffmpeg_exists( $network_options, false );
			if ( true == $ffmpeg_check['ffmpeg_exists'] ) {
				$network_options['ffmpeg_exists'] = 'on';
				$network_options['app_path']      = $ffmpeg_check['app_path'];
			} else {
				$network_options['ffmpeg_exists'] = false; }

			update_site_option( 'kgvid_video_embed_network_options', $network_options );

		}// if network options haven't been set already

	} else { // Running on a single blog.

		$options = kgvid_register_default_options_fn();
		kgvid_set_capabilities( $options['capabilities'] );

	}
}
register_activation_hook( __FILE__, 'kgvid_video_embed_activation_hook' );

function kgvid_cleanup_plugin() {

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

function kgvid_deactivate_plugin( $network_wide ) {

	if ( is_multisite() && $network_wide ) {

		$sites = get_sites();

		if ( is_array( $sites ) ) {

			foreach ( $sites as $site ) {

				switch_to_blog( $site->blog_id );
				kgvid_cleanup_plugin();
				restore_current_blog();

			} // end loop through sites.
		} // end if there are sites.
	} else { // if not network activated.
		kgvid_cleanup_plugin();
	}
}
register_deactivation_hook( __FILE__, 'kgvid_deactivate_plugin' );

function kgvid_register_uninstall_hook() {

	if ( ! function_exists( 'videopack_fs' ) ) {

		register_uninstall_hook( __FILE__, 'kgvid_uninstall_plugin' ); // register WP uninstall instead of Freemius uninstall hook.

	}
}
add_action( 'admin_init', 'kgvid_register_uninstall_hook' );

function kgvid_uninstall_plugin() {

	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	if ( ! is_multisite() ) {
		delete_option( 'kgvid_video_embed_options' );
		delete_option( 'kgvid_video_embed_queue' );
	} else {

		delete_site_option( 'kgvid_video_embed_network_options' );
		delete_site_option( 'kgvid_video_embed_queue' );

		$sites = get_sites();

		if ( is_array( $sites ) ) {

			foreach ( $sites as $site ) {
				delete_blog_option( $site->blog_id, 'kgvid_video_embed_options' );
				delete_blog_option( $site->blog_id, 'kgvid_video_embed_queue' );
			}
		}
	}
}
