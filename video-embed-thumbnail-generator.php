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
 * Version: 4.10.3
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
		define( 'VIDEOPACK_VERSION', '4.10.3' );
	}
	if ( ! defined( 'VIDEOPACK_FREEMIUS_ENABLED' ) ) {
		define( 'VIDEOPACK_FREEMIUS_ENABLED', true );
	}

	$required_files = array(
		'/vendor/autoload.php',
		'/src/admin/videopack-admin.php',
		'/src/admin/videopack-ffmpeg.php',
		'/src/admin/videopack-admin-ajax.php',
		'/src/public/videopack-public.php',
		'/src/public/videopack-public-ajax.php',
	);

	$missing_files = array_filter(
		$required_files,
		function ( $file ) {
			return ! file_exists( __DIR__ . $file );
		}
	);

	if ( ! empty( $missing_files ) ) {
		if ( isset( $_GET['activate'] ) ) {
			unset( $_GET['activate'] );
		}
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
		deactivate_plugins( VIDEOPACK_BASENAME );
		add_action(
			'admin_notices',
			function () use ( $missing_files ) {
				?>
				<div class="notice notice-error is-dismissible">
					<p><?php esc_html_e( 'Videopack has been deactivated due to missing plugin files:', 'video-embed-thumbnail-generator' ); ?></p>
					<ul>
						<?php foreach ( $missing_files as $file ) : ?>
							<li><em><?php echo esc_html( dirname( VIDEOPACK_BASENAME ) . $file ); ?></em></li>
						<?php endforeach; ?>
					</ul>
				</div>
				<?php
			}
		);

		return; // Stop further execution of the plugin
	}

	foreach ( $required_files as $file ) {
		require_once __DIR__ . $file;
	}
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
	delete_transient( 'videopack_cron_error' );
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

function kgvid_videopack_fs_loaded() {
	// add Freemius customizations after Freemius is loaded

	if ( function_exists( 'videopack_fs' ) ) {

		videopack_fs()->override_i18n(
			array(
				'yee-haw' => esc_html__( 'Great', 'video-embed-thumbnail-generator' ),
				'woot'    => esc_html__( 'Great', 'video-embed-thumbnail-generator' ),
			)
		);
	}
}
add_action( 'videopack_fs_loaded', 'kgvid_videopack_fs_loaded' );

if ( VIDEOPACK_FREEMIUS_ENABLED && file_exists( __DIR__ . '/vendor/freemius/wordpress-sdk/start.php' ) && ! function_exists( 'videopack_fs' ) ) {
	// Create a helper function for easy SDK access.
	function videopack_fs() {
		global $videopack_fs;

		if ( ! isset( $videopack_fs ) ) {
			// Activate multisite network integration.
			if ( ! defined( 'WP_FS__PRODUCT_7761_MULTISITE' ) ) {
				define( 'WP_FS__PRODUCT_7761_MULTISITE', true );
			}

			// Include Freemius SDK.
			require_once __DIR__ . '/vendor/freemius/wordpress-sdk/start.php';

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

	videopack_fs()->add_action( 'after_uninstall', 'kgvid_uninstall_plugin' ); // add uninstall logic
}
