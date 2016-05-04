<?php
/*
Plugin Name: Video Embed & Thumbnail Generator
Plugin URI: http://www.kylegilman.net/2011/01/18/video-embed-thumbnail-generator-wordpress-plugin/
Description: Generates thumbnails, HTML5-compliant videos, and embed codes for locally hosted videos. Requires FFMPEG or LIBAV for encoding.
Version: 4.6.3
Author: Kyle Gilman
Author URI: http://www.kylegilman.net/
Text Domain: video-embed-thumbnail-generator
Domain Path: /languages

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
	GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

1) Includes Strobe Media Playback Flash Player
   Website: http://osmf.org/strobe_mediaplayback.html
   License: http://creativecommons.org/licenses/by-nc/3.0/
2) Includes code adapted from Joshua Eldridge's Flash Media Player Plugin
   Website: http://wordpress.org/extend/plugins/flash-video-player/
3) Includes code adapted from Gary Cao's Make Shortcodes User-Friendly tutorial
   Website: http://www.wphardcore.com/2010/how-to-make-shortcodes-user-friendly/
4) Includes code adapted from Justin Gable's "Modifying Wordpress' Default Method for Inserting Media"
   Website: http://justingable.com/2008/10/03/modifying-wordpress-default-method-for-inserting-media/
5) Includes Video-JS Player
	Website: http://www.videojs.com/
	License: http://www.gnu.org/licenses/lgpl.html
6) Includes code adapted from Kathy Darling's custom solution for saving thumbnails
	Website: http://www.kathyisawesome.com/
7) Includes code adapted from Jean-Marc Amiaud's "Replace WordPress default media icon with preview image"
	Website: http://www.amiaud.org/tag/video/
8) Includes Eric Martin's SimpleModal
	Website: http://www.ericmmartin.com/projects/simplemodal/
9) Includes Dominic's Video.js Resolution Selector
	Website: https://github.com/dominic-p/videojs-resolution-selector

=Translators=
Spanish: Andrew Kurtis, Webhostinghub http://www.webhostinghub.com/
French: F.R. "Friss" Ferry, friss.designs@gmail.com
Bulgarian: Emil Georgiev, svinqvmraka@gmail.com

*/

if ( ! defined( 'WPINC' ) )
	die( "Can't load this file directly" );

function kgvid_default_options_fn() {

	$upload_capable = kgvid_check_if_capable('upload_files');
	$edit_others_capable = kgvid_check_if_capable('edit_others_posts');

	$options = array(
		"version" => 4.603,
		"embed_method" => "Video.js",
		"jw_player_id" => "",
		"template" => false,
		"template_gentle" => "on",
		"replace_format" => "fullres",
		"encode_fullres" => false,
		"encode_1080" => "on",
		"encode_720" => "on",
		"encode_mobile" => "on",
		"encode_webm" => false,
		"encode_vp9" => false,
		"encode_ogg" => false,
		"encode_custom" => false,
		"custom_format" => array(
			'format' => 'h264',
			'width' => '',
			'height' => ''
		),
		"app_path" => "/usr/local/bin",
		"video_app"  => "ffmpeg",
		"ffmpeg_exists" =>"notchecked",
		"video_bitrate_flag" => false,
		"ffmpeg_vpre" => false,
		"ffmpeg_old_rotation" => false,
		"nostdin" => false,
		"moov" => "none",
		"generate_thumbs" => 4,
		"featured" => "on",
		"thumb_parent" => "video",
		"delete_children" => "encoded videos only",
		"titlecode" => "<strong>",
		"poster" => "",
		"watermark" => "",
		"watermark_link_to" => "home",
		"watermark_url" => "",
		"overlay_title" => "on",
		"overlay_embedcode" => false,
		"twitter_button" => false,
		"twitter_username" => kgvid_get_jetpack_twitter_username(),
		"facebook_button" => false,
		"downloadlink" => false,
		"click_download" => "on",
		"view_count" => false,
		"embeddable" => "on",
		"inline" => false,
		"align" => "left",
		"width" => "640",
		"height" => "360",
		"minimum_width" => false,
		"fullwidth" => "on",
		"gallery_width" => "960",
		"gallery_thumb" => "250",
		"gallery_end" => "",
		"gallery_pagination" => false,
		"gallery_per_page" => false,
		"gallery_title" => "on",
		"nativecontrolsfortouch" => false,
		"controlbar_style" => "docked",
		"autoplay" => false,
		"loop" => false,
		"volume" => 1,
		"mute" => false,
		"preload" => "metadata",
		"endofvideooverlay" => false,
		"endofvideooverlaysame" => "",
		"bgcolor" => "",
		"configuration" => "",
		"skin" => plugins_url("", __FILE__)."/flash/skin/kg_skin.xml",
		"js_skin" => "kg-video-js-skin",
		"custom_attributes" => "",
		"stream_type" => "liveOrRecorded",
		"scale_mode" => "letterbox",
		"autohide" => "on",
		"playbutton" => "on",
		"bitrate_multiplier" => 0.1,
		"h264_CRF" => "23",
		"webm_CRF" => "10",
		"ogv_CRF" => "6",
		"audio_bitrate" => 160,
		"threads" => 1,
		"nice" => "on",
		"browser_thumbnails" => "on",
		"rate_control" => "crf",
		"h264_profile" => "baseline",
		"h264_level" => "3.0",
		"auto_encode" => false,
		"auto_encode_gif" => false,
		"auto_thumb" => false,
		"auto_thumb_number" => 1,
		"auto_thumb_position" => 50,
		"right_click" => "on",
		"resize" => "on",
		"auto_res" => "automatic",
		"pixel_ratio" => "on",
		"capabilities" => array(
			"make_video_thumbnails" => $upload_capable,
			"encode_videos" => $upload_capable,
			"edit_others_video_encodes" => $edit_others_capable
		),
		"open_graph" => false,
		"schema" => "on",
		"twitter_card" => false,
		"oembed_provider" => false,
		"oembed_security" => false,
		"htaccess_login" => "",
		"htaccess_password" => "",
		"sample_format" => "mobile",
		"sample_rotate" => false,
		"ffmpeg_watermark" => array(
			"url" => "",
			"scale" => "9",
			"align" => "right",
			"valign"=> "bottom",
			"x" => "6",
			"y" => "5"
		),
		"simultaneous_encodes" => 1,
		"error_email" => "nobody"
	);

	return $options;

}

function kgvid_default_network_options() {

	$default_options = kgvid_default_options_fn();

	$network_options = array(
		'app_path' => $default_options['app_path'],
		'video_app' => $default_options['video_app'],
		'moov' => $default_options['moov'],
		'video_bitrate_flag' => $default_options['video_bitrate_flag'],
		'ffmpeg_vpre' => $default_options['ffmpeg_vpre'],
		'nice' => $default_options['nice'],
		'threads' => $default_options['threads'],
		'ffmpeg_exists' => $default_options['ffmpeg_exists'],
		'default_capabilities' => $default_options['capabilities'],
		'superadmin_only_ffmpeg_settings' => false,
		'simultaneous_encodes' => $default_options['simultaneous_encodes'],
		'network_error_email' => $default_options['error_email']
	);

	return $network_options;

}

function kgvid_get_options() {

	$options = get_option('kgvid_video_embed_options');

	if ( function_exists( 'is_plugin_active_for_network' ) && is_plugin_active_for_network( plugin_basename(__FILE__) ) ) {
		$network_options = get_site_option('kgvid_video_embed_network_options');
		if ( is_array($network_options) ) { $options = array_merge($options, $network_options); }
	}

	return $options;

}

function kgvid_get_jetpack_twitter_username() {

	$jetpack_options = get_option('jetpack_options');
	$jetpack_twitter_cards_site_tag = get_option('jetpack-twitter-cards-site-tag');
	if ( is_array($jetpack_options)
		&& array_key_exists('publicize_connections', $jetpack_options)
		&& array_key_exists('twitter', $jetpack_options['publicize_connections'])
		&& array_key_exists('external_name', $jetpack_options['publicize_connections']['twitter'])
		&& !empty($jetpack_options['publicize_connections']['twitter']['external_name'])
	) {
		$twitter_username = $jetpack_options['publicize_connections']['twitter']['external_name'];
	}
	elseif ( !empty($jetpack_twitter_cards_site_tag) ) {
		$twitter_username = $jetpack_twitter_cards_site_tag;
	}
	else { $twitter_username = ''; }

	return $twitter_username;

}

function kgvid_get_attachment_meta($post_id) {

	$options = kgvid_get_options();

	$kgvid_postmeta = get_post_meta($post_id, "_kgvid-meta", true);

	$meta_key_array = array(
		'embed' => 'Single Video',
		'width' => '',
		'height' => '',
		'actualwidth' => '',
		'actualheight' => '',
		'downloadlink' => $options['downloadlink'],
		'track' => '',
		'starts' => '0',
		'completeviews' => '0',
		'pickedformat' => '',
		'encodefullres' => '',
		'encode1080' => '',
		'encode720' => '',
		'encodemobile' => '',
		'encodewebm' => '',
		'encodeogg' => '',
		'encodecustom_h264' => '',
		'encodecustom_webm' => '',
		'encodecustom_ogg' => '',
		'encodecustom' => '',
		'rotate' => '',
		'autothumb-error' => '',
		'numberofthumbs' => $options['generate_thumbs'],
		'randomize' => '',
		'forcefirst' => '',
		'featured' => $options['featured'],
		'thumbtime' => '',
		'lockaspect' => 'on',
		'showtitle' => '',
		'gallery_thumb_width' => $options['gallery_thumb'],
		'gallery_exclude' => '',
		'gallery_include' => '',
		'gallery_orderby' => '',
		'gallery_order' => '',
		'gallery_id' => '',
		'duration' => '',
		'aspect' => '',
		'original_replaced' => ''
	);

	if ( $kgvid_postmeta == '' ) {

		$kgvid_postmeta = array();

		$embed = get_post_meta($post_id, "_kgflashmediaplayer-embed", true); //this was always saved if you modified the attachment

		if ( !empty($embed) ) { //old meta values exist

			foreach ( $meta_key_array as $key => $value ) { //read old meta keys and delete them
				$kgvid_postmeta[$key] = get_post_meta($post_id, "_kgflashmediaplayer-".$key, true);
				if ( $kgvid_postmeta[$key] == 'checked' ) { $kgvid_postmeta[$key] = 'on'; }
				delete_post_meta($post_id, "_kgflashmediaplayer-".$key);
			}

			foreach ( $kgvid_postmeta as $key => $value ) {
				if ( $value === null ) {
					unset( $kgvid_postmeta[ $meta ] ); //remove empty elements
				}
			}

			kgvid_save_attachment_meta($post_id, $kgvid_postmeta);

		}

	}

	$kgvid_postmeta = array_merge($meta_key_array, $kgvid_postmeta); //make sure all keys are set

	return $kgvid_postmeta;

}

function kgvid_save_attachment_meta($post_id, $kgvid_postmeta) {

	if ( is_array($kgvid_postmeta) ) {

		$options = kgvid_get_options();
		$kgvid_old_postmeta = kgvid_get_attachment_meta($post_id);
		$kgvid_postmeta = array_merge($kgvid_old_postmeta, $kgvid_postmeta); //make sure all keys are saved

		foreach ( $kgvid_postmeta as $key => $meta ) { //don't save if it's the same as the default values or empty

			if ( (array_key_exists($key, $options) && $meta == $options[$key])
				|| (!is_array($kgvid_postmeta[$key]) && strlen($kgvid_postmeta[$key]) == 0)
			) { unset($kgvid_postmeta[$key]); }

		}

		update_post_meta($post_id, "_kgvid-meta", $kgvid_postmeta);

	}

}

function kgvid_get_encode_queue() {

	if ( defined( 'DOING_CRON' ) ) { //unlike AJAX, cron doesn't load plugin.php
		require_once( ABSPATH . '/wp-admin/includes/plugin.php' );
	}

	if ( function_exists( 'is_plugin_active_for_network' ) && is_plugin_active_for_network( plugin_basename(__FILE__) ) ) {
		$video_encode_queue = get_site_option('kgvid_video_embed_queue');
	}
	else { $video_encode_queue = get_option('kgvid_video_embed_queue'); }

	return $video_encode_queue;

}

function kgvid_save_encode_queue($video_encode_queue) {

	if ( function_exists( 'is_plugin_active_for_network' ) && is_plugin_active_for_network( plugin_basename(__FILE__) ) ) {
		update_site_option('kgvid_video_embed_queue', $video_encode_queue);
	}
	else { update_option('kgvid_video_embed_queue', $video_encode_queue); }

}

function kgvid_video_formats( $return_replace = false, $return_customs = true ) {

	$options = kgvid_get_options();

	$video_formats = array(
		"fullres" => array(
			"name" => __("same resolution H.264", 'video-embed-thumbnail-generator'),
			"label" => __('Full', 'video-embed-thumbnail-generator'),
			"width" => INF,
			"height" => INF,
			"type" => "h264",
			"extension" => "mp4",
			"mime" => "video/mp4",
			"suffix" => "-fullres.mp4",
			"vcodec" => "libx264"
		),
		"1080" => array(
			"name" => "1080p H.264",
			"label" => '1080p',
			"width" => 1920,
			"height" => 1080,
			"type" => "h264",
			"extension" => "mp4",
			"mime" => "video/mp4",
			"suffix" => "-1080.mp4",
			"old_suffix" => "-1080.m4v",
			"vcodec" => "libx264"
		),
		"720" => array(
			"name" => "720p H.264",
			"label" => '720p',
			"width" => 1280,
			"height" => 720,
			"type" => "h264",
			"extension" => "mp4",
			"mime" => "video/mp4",
			"suffix" => "-720.mp4",
			"old_suffix" => "-720.m4v",
			"vcodec" => "libx264"
		),
		"mobile" => array(
			"name" => "360p H.264",
			"label" => '360p',
			"width" => 640,
			"height" => 480,
			"type" => "h264",
			"extension" => "mp4",
			"suffix" => "-360.mp4",
			"mime" => "video/mp4",
			"old_suffix" => "-ipod.m4v",
			"vcodec" => "libx264"
		),
		"webm" => array(
			"name" => "WEBM",
			"label" => 'WEBM',
			"width" => INF,
			"height" => INF,
			"type" => "webm",
			"extension" => "webm",
			"mime" => "video/webm",
			"suffix" => ".webm",
			"vcodec" => "libvpx"
		),
		"vp9" => array(
			"name" => "WEBM VP9",
			"label" => 'WEBM VP9',
			"width" => INF,
			"height" => INF,
			"type" => "webm",
			"extension" => "webm",
			"mime" => "video/webm",
			"suffix" => "-vp9.webm",
			"vcodec" => "libvpx-vp9"
		),
		"ogg" => array(
			"name" => "OGV",
			"label" => 'OGV',
			"width" => INF,
			"height" => INF,
			"type" => "ogv",
			"extension" => "ogv",
			"mime" => "video/ogg",
			"suffix" => ".ogv",
			"vcodec" => "libtheora"
		)
	);

	if ( $return_customs ) {

		$video_formats = $video_formats + array(
			"custom_h264" => array(
				"name" => __('Custom MP4', 'video-embed-thumbnail-generator'),
				"label" => __('Custom MP4', 'video-embed-thumbnail-generator'),
				"width" => 0,
				"height" => 0,
				"type" => "h264",
				"extension" => "mp4",
				"mime" => "video/mp4",
				"suffix" => "-custom.mp4",
				"vcodec" => "libx264"
			),
			"custom_webm" => array(
				"name" => __('Custom WEBM', 'video-embed-thumbnail-generator'),
				"label" => __('Custom WEBM', 'video-embed-thumbnail-generator'),
				"width" => 0,
				"height" => 0,
				"type" => "webm",
				"extension" => "webm",
				"mime" => "video/webm",
				"suffix" => "-custom.webm",
				"vcodec" => "libvpx"
			),
			"custom_ogg" => array(
				"name" => __('Custom OGV', 'video-embed-thumbnail-generator'),
				"label" => __('Custom OGV', 'video-embed-thumbnail-generator'),
				"width" => 0,
				"height" => 0,
				"type" => "ogv",
				"extension" => "ogv",
				"mime" => "video/ogv",
				"suffix" => "-custom.ogv",
				"vcodec" => "libtheora"
			)
		);
	}

	if ( is_array($options['custom_format']) && ( !empty($options['custom_format']['width']) || !empty($options['custom_format']['height']) ) ) {
		$video_formats['custom'] = $options['custom_format'];
		unset($video_formats['custom_'.$options['custom_format']['format']]);
	}

	$video_formats['fullres'] = array(
		'name' => sprintf( __("Replace original with %s", 'video-embed-thumbnail-generator'), $video_formats[$options['replace_format']]['name'] ),
		'width' => $video_formats[$options['replace_format']]['width'],
		'height' => $video_formats[$options['replace_format']]['height'],
		'type' => $video_formats[$options['replace_format']]['type'],
		'extension' => $video_formats[$options['replace_format']]['extension'],
		'mime' => $video_formats[$options['replace_format']]['mime'],
		'suffix' => '-fullres.'.$video_formats[$options['replace_format']]['extension'],
		'vcodec' => $video_formats[$options['replace_format']]['vcodec']
	);

	if ( !$return_replace && $options['replace_format'] != 'fullres' ) { unset($video_formats[$options['replace_format']]); }

	return $video_formats;

}

function kgvid_register_default_options_fn() { //add default values for options

	$options = kgvid_get_options();

    if( !is_array($options) ) {

		$options = kgvid_default_options_fn();

		$ffmpeg_check = kgvid_check_ffmpeg_exists($options, false);
		if ( true == $ffmpeg_check['ffmpeg_exists'] ) {
			$options['ffmpeg_exists'] = 'on';
			$options['app_path'] = $ffmpeg_check['app_path'];
		}
		else { $options['ffmpeg_exists'] = false; }

		update_option('kgvid_video_embed_options', $options);

	}

	return $options;

}

function kgvid_video_embed_activation_hook( $network_wide ) {

	if ( is_multisite() && $network_wide ) { // if activated on the entire network

		$network_options = get_site_option( 'kgvid_video_embed_network_options' );

		if( !is_array($network_options) ) {

			$network_options = kgvid_default_network_options();

			$ffmpeg_check = kgvid_check_ffmpeg_exists($network_options, false);
			if ( true == $ffmpeg_check['ffmpeg_exists'] ) {
				$network_options['ffmpeg_exists'] = 'on';
				$network_options['app_path'] = $ffmpeg_check['app_path'];
			}
			else { $network_options['ffmpeg_exists'] = false; }

			update_site_option('kgvid_video_embed_network_options', $network_options);

			$current_blog_id = get_current_blog_id();
			$sites = wp_get_sites();

			if ( is_array($sites) ) {

				foreach ( $sites as $site ) {

					switch_to_blog($site['blog_id']);

					$options = get_option('kgvid_video_embed_options');

					if ( !is_array($options) ) {
						kgvid_register_default_options_fn();
						kgvid_set_capabilities($network_options['default_capabilities']);
					}

				}//end loop through sites

				switch_to_blog($current_blog_id);

			}//if there are existing sites to set

		}// if network options haven't been set already

	}
	else { // Running on a single blog

		$options = kgvid_register_default_options_fn();
		kgvid_set_capabilities($options['capabilities']);

	}

}
register_activation_hook(__FILE__, 'kgvid_video_embed_activation_hook');

function kgvid_add_new_blog($blog_id) {

	switch_to_blog($blog_id);

	$network_options = get_site_option( 'kgvid_video_embed_network_options' );
	kgvid_set_capabilities($network_options['default_capabilities']);

	restore_current_blog();

}
add_action( 'wpmu_new_blog', 'kgvid_add_new_blog' );

function kgvid_plugin_action_links($links) {

	$links[] = '<a href="'.get_admin_url(null, "options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php").'">'.__('Settings', 'video-embed-thumbnail-generator').'</a>';
	return $links;

}
add_filter("plugin_action_links_".plugin_basename(__FILE__), 'kgvid_plugin_action_links' );

function kgvid_plugin_network_action_links($links) {

	$links[] = '<a href="'.network_admin_url().'settings.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php">'.__('Network Settings', 'video-embed-thumbnail-generator').'</a>';
	return $links;

}
add_filter("network_admin_plugin_action_links_".plugin_basename(__FILE__), 'kgvid_plugin_network_action_links' );

function kgvid_load_text_domain() {

	load_plugin_textdomain( 'video-embed-thumbnail-generator', false, basename(dirname(__FILE__)).'/languages/' );

}
add_action('plugins_loaded', 'kgvid_load_text_domain');


function kgvid_plugin_meta_links( $links, $file ) {

	$plugin = plugin_basename(__FILE__);

	if ( $file == $plugin ) {
		return array_merge(
			$links,
			array( '<a href="http://www.kylegilman.net/plugin-donation/">Donate</a>' )
		);
	}
	return $links;

}
add_filter( 'plugin_row_meta', 'kgvid_plugin_meta_links', 10, 2 );

// add plugin upgrade notification
function kgvid_showUpgradeNotification($currentPluginMetadata, $newPluginMetadata){
   // check "upgrade_notice"
   if (isset($newPluginMetadata->upgrade_notice) && strlen(trim($newPluginMetadata->upgrade_notice)) > 0){
        echo '<p style="background-color: #d54e21; padding: 10px; color: #f9f9f9; margin-top: 10px"><strong>Upgrade Notice:</strong> ';
        echo esc_html($newPluginMetadata->upgrade_notice), '</p>';
   }
}
add_action('in_plugin_update_message-video-embed-thumbnail-generator/video-embed-thumbnail-generator.php', 'kgvid_showUpgradeNotification', 10, 2);

function kgvid_check_if_capable($capability) {
	global $wp_roles;
	$capable = array();

	if ( is_object($wp_roles) && property_exists($wp_roles, 'roles') ) {

		foreach ( $wp_roles->roles as $role => $role_info ) {
			if ( is_array($role_info['capabilities']) && array_key_exists($capability, $role_info['capabilities']) && $role_info['capabilities'][$capability] == 1 ) {
				$capable[$role] = "on";
			}
			else { $capable[$role] = false; }
		}

	}
	return $capable;
}

function kgvid_set_capabilities($capabilities) {

	global $wp_roles;

	if ( is_object($wp_roles) && property_exists($wp_roles, 'roles') ) {

		$default_options = kgvid_default_options_fn();

		foreach ( $default_options['capabilities'] as $default_capability => $default_enabled ) {
			if ( is_array($capabilities) && !array_key_exists($default_capability, $capabilities) ) {
				$capabilities[$default_capability] = array();
			}
		}

		foreach ( $capabilities as $capability => $enabled_roles ) {
			foreach ( $wp_roles->roles as $role => $role_info ) { //check all roles
				if ( is_array($role_info['capabilities']) && !array_key_exists($capability, $role_info['capabilities']) && array_key_exists($role, $enabled_roles) && $enabled_roles[$role] == "on" ) {
					$wp_roles->add_cap( $role, $capability );
				}
				if ( is_array($role_info['capabilities']) && array_key_exists($capability, $role_info['capabilities']) && !array_key_exists($role, $enabled_roles) ) {
					$wp_roles->remove_cap( $role, $capability );
				}
			}
		}

	}//end if $wp_roles defined

}

function kgvid_aac_encoders() {

	$aac_array = array("libfdk_aac", "libfaac", "aac", "libvo_aacenc");
	return apply_filters('kgvid_aac_encoders', $aac_array);

}

function kgvid_add_upload_mimes ( $existing_mimes=array() ) {

	// allows uploading .webm videos
	$existing_mimes['webm'] = 'video/webm';
	$existing_mimes['vtt'] = 'text/vtt';
	return $existing_mimes;

}
add_filter('upload_mimes', 'kgvid_add_upload_mimes');

function kgvid_url_to_id($url) {

	global $wpdb;
	$post_id = false;
	$uploads = wp_upload_dir();

	$url = str_replace(' ', '', $url); //in case a url with spaces got through
	// Get the path or the original size image by slicing the widthxheight off the end and adding the extension back
 	$search_url = preg_replace( '/-\d+x\d+(\.(?:png|jpg|gif))$/i', '.' . pathinfo($url, PATHINFO_EXTENSION), $url );

	$post_id = (int)$wpdb->get_var( $wpdb->prepare( "SELECT post_id FROM $wpdb->postmeta WHERE meta_key = '_wp_attached_file' AND meta_value LIKE RIGHT('%s', CHAR_LENGTH(meta_value))", $search_url ) );

	if ( $post_id ) { return $post_id; }
	else { return false; }

}

function kgvid_is_animated_gif($filename) {
    if(!($fh = @fopen($filename, 'rb')))
        return false;
    $count = 0;
    //an animated gif contains multiple "frames", with each frame having a
    //header made up of:
    // * a static 4-byte sequence (\x00\x21\xF9\x04)
    // * 4 variable bytes
    // * a static 2-byte sequence (\x00\x2C) (some variants may use \x00\x21 ?)

    // We read through the file til we reach the end of the file, or we've found
    // at least 2 frame headers
    while(!feof($fh) && $count < 2) {
        $chunk = fread($fh, 1024 * 100); //read 100kb at a time
        $count += preg_match_all('#\x00\x21\xF9\x04.{4}\x00(\x2C|\x21)#s', $chunk, $matches);
   }

    fclose($fh);
    return $count > 1;
}

function kgvid_is_video($post) {

	if ( $post->post_mime_type == 'image/gif' ) {
		$moviefile = get_attached_file($post->ID);
		$is_animated = kgvid_is_animated_gif($moviefile);
	}
	else { $is_animated = false; }

	if ( substr($post->post_mime_type, 0, 5) == 'video'	&&
		( empty($post->post_parent)
		|| (strpos(get_post_mime_type( $post->post_parent ), 'video') === false && get_post_meta($post->ID, '_kgflashmediaplayer-externalurl', true) == '' )
		)
		|| $is_animated
	) { //if the attachment is a video with no parent or if it has a parent the parent is not a video and the video doesn't have the externalurl post meta

		return true;

	}
	else {
		return false;
	}

}

function kgvid_url_exists($url) {
    $hdrs = @get_headers($url);
    return is_array($hdrs) ? preg_match('/^HTTP\\/\\d+\\.\\d+\\s+2\\d\\d\\s+.*$/',$hdrs[0]) : false;
}

function kgvid_is_empty_dir($dir)
{
    if ($dh = @opendir($dir))
    {
        while ($file = readdir($dh))
        {
            if ($file != '.' && $file != '..') {
                closedir($dh);
                return false;
            }
        }
        closedir($dh);
        return true;
    }
    else return false; // whatever the reason is : no such dir, not a dir, not readable
}

function kgvid_rrmdir($dir) {
   if (is_dir($dir)) {
     $objects = scandir($dir);
     foreach ($objects as $object) {
       if ($object != "." && $object != "..") {
         if (filetype($dir."/".$object) == "dir") kgvid_rrmdir($dir."/".$object); else unlink($dir."/".$object);
       }
     }
     reset($objects);
     rmdir($dir);
   }
}

function kvid_readfile_chunked($file, $retbytes=TRUE) { //sends large files in chunks so PHP doesn't timeout

	$chunksize = 1 * (1024 * 1024);
	$buffer = '';
	$cnt =0;

	$handle = fopen($file, 'r');
	if ($handle === FALSE) { return FALSE; }

	while (!feof($handle)) {

		$buffer = fread($handle, $chunksize);
		echo $buffer;
		ob_flush();
		flush();

		if ($retbytes) { $cnt += strlen($buffer); }
	}

	$status = fclose($handle);

	if ($retbytes AND $status) { return $cnt; }

	return $status;

}

function kgvid_get_attachment_medium_url( $id )
{
    $medium_array = image_downsize( $id, 'medium' );
    $medium_path = $medium_array[0];

    return $medium_path;
}

function kgvid_backwards_compatible($post_id) {

	global $wp_version;
	$field_id = array();

	if ( $wp_version < 3.5 ) {
		$field_id['poster'] = 'attachments['. $post_id .'][kgflashmediaplayer-poster]';
		$field_id['thumbtime'] = 'attachments['. $post_id .'][kgflashmediaplayer-thumbtime]';
	}
	else {
		$field_id['poster'] = 'attachments-'. $post_id .'-kgflashmediaplayer-poster';
		$field_id['thumbtime'] = 'attachments-'. $post_id .'-kgflashmediaplayer-thumbtime';
	}
	return $field_id;

}

function kgvid_sanitize_url($movieurl) {
	$movieurl = rawurldecode($movieurl);
	$movieurl = strtok($movieurl,'?');
	$movie_extension = pathinfo(parse_url($movieurl, PHP_URL_PATH), PATHINFO_EXTENSION);
	$sanitized_url['noextension'] = preg_replace("/\\.[^.\\s]{3,4}$/", "", $movieurl);
	$sanitized_url['basename'] = sanitize_file_name(basename($movieurl,'.'.$movie_extension));;
	$sanitized_url['singleurl_id'] = "singleurl_".preg_replace('/[^a-zA-Z0-9]/', '_', $sanitized_url['basename']);
	$sanitized_url['movieurl'] = esc_url_raw(str_replace(" ", "%20", $movieurl));
	return $sanitized_url;
}

function kgvid_ajax_sanitize_url() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$movieurl = $_POST['movieurl'];
	$sanitized_url = kgvid_sanitize_url($movieurl);
	echo json_encode($sanitized_url);
	die();

}
add_action('wp_ajax_kgvid_sanitize_url', 'kgvid_ajax_sanitize_url');

function kgvid_check_ffmpeg_exists($options, $save) {
	$exec_enabled = false;
	$ffmpeg_exists = false;
	$output = array();
	$function = "";
	$uploads = wp_upload_dir();

	$exec_available = true;
	if (ini_get('safe_mode')) {
		$exec_available = false;
	} else {
		$d = ini_get('disable_functions');
		$s = ini_get('suhosin.executor.func.blacklist');
		if ("$d$s") {
			$array = preg_split('/,\s*/', "$d,$s");
			if (in_array('exec', $array)) {
				$exec_available = false;
			}
		}
	}

	if($exec_available) {
		if (function_exists('escapeshellcmd')) {
			$exec_enabled = true;
			$test_path = rtrim($options['app_path'], '/');
			$cmd = escapeshellcmd($test_path.'/'.$options['video_app'].' -i "'.plugin_dir_path(__FILE__).'images/sample-video-h264.mp4" -vframes 1 -f mjpeg '.$uploads['path'].'/ffmpeg_exists_test.jpg').' 2>&1';
			exec ( $cmd, $output, $returnvalue );
		}
		else { $function = "ESCAPESHELLCMD"; }
	}
	else { $function = "EXEC"; }

	if ( $exec_enabled == true ) {

		if ( !file_exists($uploads['path'].'/ffmpeg_exists_test.jpg') ) { //if FFMPEG has not executed successfully
			$test_path = substr($test_path, 0, -strlen($options['video_app'])-1 );
			$cmd = escapeshellcmd($test_path.'/'.$options['video_app'].' -i "'.plugin_dir_path(__FILE__).'images/sample-video-h264.mp4" -vframes 1 -f mjpeg '.$uploads['path'].'/ffmpeg_exists_test.jpg');
			exec ( $cmd );
		}

		if ( file_exists($uploads['path'].'/ffmpeg_exists_test.jpg') ) { //FFMEG has executed successfully
			$ffmpeg_exists = true;
			unlink($uploads['path'].'/ffmpeg_exists_test.jpg');
			$options['app_path'] = $test_path;
		}

	}

	if ( $save ) {

		if ( $ffmpeg_exists == true ) { $options['ffmpeg_exists'] = "on"; }
		else {
			$options['ffmpeg_exists'] = "notinstalled";
			$options['browser_thumbnails'] = "on"; //if FFMPEG isn't around, this should be enabled
		}

		update_option('kgvid_video_embed_options', $options);

	}

	$arr = array (
		"exec_enabled"=>$exec_enabled,
		"ffmpeg_exists"=>$ffmpeg_exists,
		"output"=>$output,
		"function"=>$function,
		"app_path"=>$options['app_path']
	);
	return $arr;
}

function kgvid_set_video_dimensions($id, $gallery = false) {

	$options = kgvid_get_options();
	$moviefile = get_attached_file( $id );
	$video_meta = wp_get_attachment_metadata( $id );
	$kgvid_postmeta = kgvid_get_attachment_meta($id);

	if ( is_array($video_meta) && array_key_exists('width', $video_meta) ) { $kgvid_postmeta['actualwidth'] = $video_meta['width']; }
	if ( empty($kgvid_postmeta['width']) ) { $kgvid_postmeta['width'] = $kgvid_postmeta['actualwidth']; }

	if ( is_array($video_meta) && array_key_exists('height', $video_meta) ) { $kgvid_postmeta['actualheight'] = $video_meta['height']; }
	if ( empty($kgvid_postmeta['height']) ) { $kgvid_postmeta['height'] = $kgvid_postmeta['actualheight']; }

	if ( !empty($kgvid_postmeta['width']) && !empty($kgvid_postmeta['height']) ) { $aspect_ratio = $kgvid_postmeta['height']/$kgvid_postmeta['width']; }
	else { $aspect_ratio = $options['height']/$options['width']; }

	if ( $gallery ) {
		if ( !empty($kgvid_postmeta['actualwidth']) ) { $kgvid_postmeta['width'] = $kgvid_postmeta['actualwidth']; }
		if ( intval($kgvid_postmeta['width']) > intval($options['gallery_width']) ) { $kgvid_postmeta['width'] = $options['gallery_width']; }
	}
	else {
		if ( intval($kgvid_postmeta['width']) > intval($options['width']) || $options['minimum_width'] == "on" ) { $kgvid_postmeta['width'] = $options['width']; }
	}

	$kgvid_postmeta['height'] = round(intval($kgvid_postmeta['width'])*$aspect_ratio);

	$dimensions = array( 'width' => strval($kgvid_postmeta['width']), 'height' => strval($kgvid_postmeta['height']), 'actualwidth' => strval($kgvid_postmeta['actualwidth']), 'actualheight' => strval($kgvid_postmeta['actualheight']) );

	return $dimensions;

}

function kgvid_set_encode_dimensions($movie_info, $format_stats) {

	if ( empty($format_stats['width']) || is_infinite($format_stats['width']) ) { $format_stats['width'] = $movie_info['width']; }
	if ( empty($format_stats['height']) || is_infinite($format_stats['height']) ) { $format_stats['height'] = $movie_info['height']; }

	if ( intval($movie_info['width']) > $format_stats['width'] ) { $encode_movie_width = $format_stats['width']; }
	else { $encode_movie_width = $movie_info['width']; }
	$encode_movie_height = strval(round(floatval($movie_info['height']) / floatval($movie_info['width']) * $encode_movie_width));
	if ($encode_movie_height % 2 != 0) { $encode_movie_height--; } //if it's odd, decrease by 1 to make sure it's an even number

	if ( intval($encode_movie_height) > $format_stats['height'] ) {
		$encode_movie_height = $format_stats['height'];
		$encode_movie_width = strval(round(floatval($movie_info['width']) / floatval($movie_info['height']) * $encode_movie_height));
	}
	if ($encode_movie_width % 2 != 0) { $encode_movie_width--; } //if it's odd, decrease by 1 to make sure it's an even number

	$arr = array( 'width' => $encode_movie_width, 'height' => $encode_movie_height );
	return $arr;

}

function kgvid_encodevideo_info($movieurl, $postID) {

	$options = kgvid_get_options();

	$uploads = wp_upload_dir();
	$video_formats = kgvid_video_formats();
	$sanitized_url = kgvid_sanitize_url($movieurl);
	$movieurl = $sanitized_url['movieurl'];
	$moviefile = '';

	$encodevideo_info['moviefilebasename'] = $sanitized_url['basename'];
	$encodevideo_info['encodepath'] = $uploads['path'];


	if ( get_post_type($postID) == "attachment" ) { //if it's an attachment, not from URL
		$moviefile = get_attached_file($postID);
		$path_parts = pathinfo($moviefile);
		$encodevideo_info['encodepath'] = $path_parts['dirname']."/";
		$encodevideo_info['sameserver'] = true;
		$args = array(
			'numberposts' => '-1',
			'post_parent' => $postID,
			'post_type' => 'attachment',
			'post_mime_type' => 'video'
		);
	}
	elseif ($moviefile == '' || !is_file($moviefile) ) {

		$url_parts = parse_url($uploads['url']);
		if ( is_array($url_parts) && array_key_exists('host', $url_parts) && strpos($movieurl, $url_parts['host']) !== false ) { //if we're on the same server
			$encodevideo_info['sameserver'] = true;
			$decodedurl = urldecode($movieurl);
			$parsed_url= parse_url($decodedurl);
			$fileinfo = pathinfo($decodedurl);
			$parsed_url['extension'] = $fileinfo['extension'];
			$parsed_url['filename'] = $fileinfo['basename'];
			$parsed_url['localpath'] = $_SERVER['DOCUMENT_ROOT'].$parsed_url['path'];
			// just in case there is a double slash created when joining document_root and path
			$parsed_url['localpath'] = preg_replace('/\/\//', '/', $parsed_url['localpath']);

			$encodevideo_info['encodepath'] = rtrim($parsed_url['localpath'], $parsed_url['filename']);
		}
		else { $encodevideo_info['sameserver'] = false; }

		$args = array(
			'numberposts' => '-1',
			'post_type' => 'attachment',
			'meta_key' => '_kgflashmediaplayer-externalurl',
			'meta_value' => $sanitized_url['movieurl'],
			'post_mime_type' => 'video'
		);

	}
	$children = get_posts( $args );

	foreach ( $video_formats as $format => $format_stats ) { //loop through each format

		$encodevideo_info[$format]['exists'] = false;
		$encodevideo_info[$format]['writable'] = false;

		//start with the new database info before checking other locations

		if ( $children ) {
			foreach ( $children as $child ) {
				$mime_type = get_post_mime_type($child->ID);
				$wp_attached_file = get_attached_file($child->ID);
				$video_meta = wp_get_attachment_metadata( $child->ID );
				$meta_format = get_post_meta($child->ID, '_kgflashmediaplayer-format', true);
				if ( $meta_format == $format || ( substr($wp_attached_file, -strlen($format_stats['suffix'])) == $format_stats['suffix'] && $meta_format == false )  ) {
					$encodevideo_info[$format]['url'] = wp_get_attachment_url($child->ID);
					$encodevideo_info[$format]['filepath'] = $wp_attached_file;
					$encodevideo_info[$format]['id'] = $child->ID;
					$encodevideo_info[$format]['exists'] = true;
					$encodevideo_info[$format]['writable'] = true;
					if ( is_array($video_meta) && array_key_exists('width', $video_meta) ) {
						$encodevideo_info[$format]['width'] = $video_meta['width'];
					}
					if ( is_array($video_meta) && array_key_exists('height', $video_meta) ) {
						$encodevideo_info[$format]['height'] = $video_meta['height'];
					}
					continue 2; //skip rest of children loop and format loop
				}
			}
		}

		//if the format's not in the database, check these places

		if ( array_key_exists('old_suffix', $format_stats) ) { $old_suffix = $format_stats['old_suffix']; }
		else { $old_suffix = $format_stats['suffix']; }
		$potential_locations = array(
			"same_directory" => array(
				'url' => $sanitized_url['noextension'].$format_stats['suffix'],
				'filepath' => $encodevideo_info['encodepath'].$encodevideo_info['moviefilebasename'].$format_stats['suffix'] ),
			"same_directory_old_suffix" => array(
				'url' => $sanitized_url['noextension'].$old_suffix,
				'filepath' => $encodevideo_info['encodepath'].$encodevideo_info['moviefilebasename'].$old_suffix ),
			"html5encodes" => array(
				'url' => $uploads['baseurl']."/html5encodes/".$encodevideo_info['moviefilebasename'].$old_suffix,
				'filepath' => $uploads['basedir']."/html5encodes/".$encodevideo_info['moviefilebasename'].$old_suffix ),
		);
		if ( !array_key_exists('old_suffix', $format_stats) ) { unset($potential_locations['same_directory_old_suffix']); }
		if ( $format == 'mobile' ) {
			$potential_locations['480p'] = array(
				'url' => $sanitized_url['noextension'].'-480.mp4',
				'filepath' => $encodevideo_info['encodepath'].$encodevideo_info['moviefilebasename'].'-480.mp4'
			);
		}

		foreach ( $potential_locations as $name => $location ) {

			if ( file_exists($location['filepath']) ) {
				$encodevideo_info[$format]['exists'] = true;
				$encodevideo_info[$format]['url'] = $location['url'];
				$encodevideo_info[$format]['filepath'] = $location['filepath'];
				if ( is_writable($location['filepath']) ) { $encodevideo_info[$format]['writable'] = true; }
				break;
			}
			elseif ( !empty($postID) && !$encodevideo_info['sameserver'] && $name != "html5encodes" ) { //last resort if it's not on the same server, check url_exists

				$already_checked_url = get_post_meta($postID, '_kgflashmediaplayer-'.$sanitized_url['singleurl_id'].'-'.$format, true);
				if ( empty($already_checked_url) ) {
					if ( kgvid_url_exists(esc_url_raw(str_replace(" ", "%20", $location['url']))) ) {
						$encodevideo_info[$format]['exists'] = true;
						$encodevideo_info[$format]['url'] = $location['url'];
						update_post_meta($postID, '_kgflashmediaplayer-'.$sanitized_url['singleurl_id'].'-'.$format, $encodevideo_info[$format]['url']);
					}
					else {
						update_post_meta($postID, '_kgflashmediaplayer-'.$sanitized_url['singleurl_id'].'-'.$format, 'not found');
					}
				}
				else { //url already checked
					if ( substr($already_checked_url, 0, 4) == 'http' ) { //if it smells like a URL...
						$encodevideo_info[$format]['exists'] = true;
						$encodevideo_info[$format]['url'] = $already_checked_url;
					}
				}
			}//end if not on same server
		}//end potential locations loop

		if ( !$encodevideo_info[$format]['exists'] ) {
			if ( get_post_type($postID) == "attachment" && is_writeable($encodevideo_info['encodepath']) ) {
				$encodevideo_info[$format]['url'] = $sanitized_url['noextension'].$format_stats['suffix'];
				$encodevideo_info[$format]['filepath'] = $encodevideo_info['encodepath'].$encodevideo_info['moviefilebasename'].$format_stats['suffix'];
			}
			else {
				$encodevideo_info[$format]['url'] = $uploads['url'].'/'.$encodevideo_info['moviefilebasename'].$format_stats['suffix'];
				$encodevideo_info[$format]['filepath'] = $uploads['path'].'/'.$encodevideo_info['moviefilebasename'].$format_stats['suffix'];
			}
		}

	}//end format loop

	return apply_filters('kgvid_encodevideo_info', $encodevideo_info, $movieurl, $postID);
}

/**
* Get the dimensions of a video file
*
* @param unknown_type $video
* @return array(width,height)
* @author Jamie Scott
*/
function kgvid_get_video_dimensions($video = false) {
	$options = kgvid_get_options();
	$ffmpegPath = $options['app_path']."/".$options['video_app'];
	$movie_info = array();

	$video = str_replace("https://", "http://",  $video);

	if ( strpos($video, 'http://') === 0 ) { //if it's a URL
		$video_id = kgvid_url_to_id($video);
		if ( $video_id ) {
			$video_path = get_attached_file($video_id);
			if ( file_exists($video_path) ) { $video = $video_path; }
		}
		else { //not in the database
			if ( !empty($options['htaccess_login']) && strpos($video, 'http://') === 0 ) {
				$video = substr_replace($video, $options['htaccess_login'].':'.$options['htaccess_password'].'@', 7, 0);
			}
		}
	}

	$command = escapeshellcmd($ffmpegPath . ' -i "' . $video . '"');
	$command = $command.' 2>&1';
	exec ( $command, $output );
	$lastline = end($output);
	$lastline = prev($output)."<br />".$lastline;
	$movie_info['output'] = addslashes($lastline);
	$output = implode("\n", $output);
	$regex = "/([0-9]{2,4})x([0-9]{2,4})/";
	if (preg_match($regex, $output, $regs)) { $result = $regs[0]; }
	else {	$result = ""; }

	if ( !empty($result) ) {
		$movie_info['worked'] = true;
		$movie_info['width'] = $regs [1] ? $regs [1] : null;
		$movie_info['height'] = $regs [2] ? $regs [2] : null;
		preg_match('/Duration: (.*?),/', $output, $matches);
		$duration = $matches[1];
		$movie_duration_hours = intval(substr($duration, -11, 2));
		$movie_duration_minutes = intval(substr($duration, -8, 2));
		$movie_duration_seconds = floatval(substr($duration, -5));
		$movie_info['duration'] = ($movie_duration_hours * 60 * 60) + ($movie_duration_minutes * 60) + $movie_duration_seconds;

		preg_match('/rotate          : (.*?)\n/', $output, $matches);
		if ( $options['ffmpeg_vpre'] == false && is_array($matches) && array_key_exists(1, $matches) == true ) { $rotate = $matches[1]; }
		else { $rotate = "0"; }

		switch ($rotate) {
			case "90": $movie_info['rotate'] = 90; break;
			case "180": $movie_info['rotate'] = 180; break;
			case "270": $movie_info['rotate'] = 270; break;
			case "-90": $movie_info['rotate'] = 270; break;
			default: $movie_info['rotate'] = ""; break;
		}

		$command = escapeshellcmd($ffmpegPath . ' -i "' . $video . '" -codecs');
		$command = $command.' 2>&1';
		exec ( $command, $output );
		$output = implode("\n", $output);
		$configuration = array();
		$video_lib_array = array('libtheora', 'libvorbis', 'libvpx', 'libvpx-vp9', 'libx264');
		$aac_array = kgvid_aac_encoders();
		$lib_list = array_merge($video_lib_array, $aac_array);
		foreach ($lib_list as $lib) {
			if ( strpos($output, $lib) !== false ) { $movie_info['configuration'][$lib] = "true"; }
			else { $movie_info['configuration'][$lib] = "false"; }
		}

	}
	else {
		$movie_info['worked'] = false;
	}

	return apply_filters('kgvid_get_video_dimensions', $movie_info, $video);
}

function kgvid_generate_flashvars($content, $query_atts, $encodevideo_info, $id) {

	$flashvars = array();
	$moviefiletype = pathinfo($content, PATHINFO_EXTENSION);
	$flashcompatible = array("flv", "f4v", "mp4", "mov", "m4v");

	if ( in_array($moviefiletype, $flashcompatible) ) { //if the original video is Flash video player compatible
		$flashvars['src'] = urlencode($content);
		$flash_source_found = true;
	}
	else {
		$flash_source_found = false;
		$video_formats = kgvid_video_formats();
		foreach ($video_formats as $format => $format_stats) { //check if there's an H.264 format available and pick the highest quality one
			if ( $encodevideo_info[$format]["exists"] && $format_stats['type'] == "mp4" ) {
				$flashvars['src'] = urlencode(trim($encodevideo_info[$format]['url']));
				$flash_source_found = true;
				break;
			}
		}
	}
	if ( $flash_source_found ) {

		if($query_atts["poster"] != '') { $flashvars['poster'] = urlencode(trim($query_atts["poster"])); }
		if($query_atts["endofvideooverlay"] != '') { $flashvars['endofvideooverlay'] = urlencode(trim($query_atts["endofvideooverlay"])); }
		if($query_atts["controlbar"] != '') { $flashvars['controlBarMode'] = $query_atts["controlbar"];	}
		if($query_atts["autohide"] != '') { $flashvars['controlBarAutoHide'] = $query_atts["autohide"]; }
		if($query_atts["playbutton"] != '') { $flashvars['playButtonOverlay'] = $query_atts["playbutton"]; }
		if($query_atts["loop"] != '') {	$flashvars['loop'] = $query_atts["loop"]; }
		if($query_atts["autoplay"] != '') { $flashvars['autoPlay'] = $query_atts["autoplay"]; }
		if($query_atts["streamtype"] != '') { $flashvars['streamType'] = $query_atts["streamtype"];	}
		if($query_atts["scalemode"] != '') { $flashvars['scaleMode'] = $query_atts["scalemode"]; }
		if($query_atts["backgroundcolor"] != '') { $flashvars['backgroundColor'] = $query_atts["backgroundcolor"]; }
		if($query_atts["configuration"] != '') { $flashvars['configuration'] = urlencode($query_atts["configuration"]); }
		if($query_atts["skin"] != '') { $flashvars['skin'] = urlencode($query_atts["skin"]); }
		$flashvars['verbose'] = 'true';
		$flashvars['javascriptCallbackFunction'] = "function(id){kgvid_strobemedia_callback(".$id.");}"; //this is necessary to turn on the js API

		$params = array(
			'wmode' => 'opaque',
			'allowfullscreen' => 'true',
			'allowScriptAccess' => 'always',
			'base' => plugins_url("", __FILE__).'/flash/'
		);
	}

	$arr = array( 'flashvars' => $flashvars, 'params' => $params, 'flash_source_found' => $flash_source_found );
	return $arr;

}


function kgvid_generate_encode_string($input, $output, $movie_info, $format, $width, $height, $rotate) {

	$options = kgvid_get_options();
	$libraries = $movie_info['configuration'];
	$encode_string = strtoupper($options['video_app'])." not found";

	if ( $options['ffmpeg_exists'] == "on" ) {

		$video_formats = kgvid_video_formats();

		if ( $options['video_app'] == "avconv" || $options['video_bitrate_flag'] != "on" ) {
			$video_bitrate_flag = "b:v";
			$audio_bitrate_flag = "b:a";
			$profile_flag = "profile:v";
			$level_flag = "level:v";
			$qscale_flag = "q:v";
		}

		else {
			$video_bitrate_flag = "b";
			$audio_bitrate_flag = "ab";
			$profile_flag = "profile";
			$level_flag = "level";
			$qscale_flag = "qscale";
		}

		if ( $options['rate_control'] == "crf" ) {
			$crf_option = $video_formats[$format]['type'].'_CRF';
			$crf_flag = "crf";
			if ( $video_formats[$format]['type'] == 'ogv' ) { $crf_flag = $qscale_flag; } //ogg doesn't do CRF
			$rate_control_flag = " -".$crf_flag." ".$options[$crf_option];
		}
		else {
			$rate_control_flag = " -".$video_bitrate_flag." ".round(floatval($options['bitrate_multiplier'])*$width*$height*30/1024)."k";
		}

		if ( $rotate === false || $options['ffmpeg_vpre'] == "on" ) { $rotate = ""; }
		switch ($rotate) { //if it's a sideways mobile video

			case 90:
				if ( empty($options['ffmpeg_watermark']['url']) ) {
					$rotate = ' -vf "transpose=1"';
				}
				else {
					$rotate = '';
					$rotate_complex = 'transpose=1[rotate];[rotate]';
				}

				if ( $options['video_bitrate_flag'] == "on" || $options['ffmpeg_old_rotation'] == "on" ) {
					$rotate .= " -metadata rotate=0";
				}
				else {
					$rotate .= " -metadata:s:v:0 rotate=0";
					$width ^= $height ^= $width ^= $height; //swap height & width
				}

				break;

			case 270:

				if ( empty($options['ffmpeg_watermark']['url']) ) {
					$rotate = ' -vf "transpose=2"';
				}
				else {
					$rotate = '';
					$rotate_complex = 'transpose=2[rotate];[rotate]';
				}

				if ( $options['video_bitrate_flag'] == "on" || $options['ffmpeg_old_rotation'] == "on" ) {
					$rotate .= " -metadata rotate=0";
				}
				else {
					$rotate .= " -metadata:s:v:0 rotate=0";
					$width ^= $height ^= $width ^= $height; //swap height & width
				}

				break;

			case 180:

				if ( empty($options['ffmpeg_watermark']['url']) ) {
					$rotate = ' -vf "hflip,vflip"';
				}
				else {
					$rotate = '';
					$rotate_complex = 'hflip,vflip[rotate];[rotate]';
				}

				if ( $options['video_bitrate_flag'] == "on" || $options['ffmpeg_old_rotation'] == "on" ) { $rotate .= " -metadata rotate=0"; }
				else { $rotate .= " -metadata:s:v:0 rotate=0"; }

				break;

			default:
				$rotate = '';
				$rotate_complex = '';
				break;
		}

		if ( $options['ffmpeg_watermark']['url'] != "" ) {

			$watermark_width = strval(round(intval($movie_info['width'])*(intval($options['ffmpeg_watermark']['scale'])/100)));

			if ( $options['ffmpeg_watermark']['align'] == 'right' ) {
				$watermark_align = "main_w-overlay_w-";
			}
			elseif ( $options['ffmpeg_watermark']['align'] == 'center' ) {
				$watermark_align = "main_w/2-overlay_w/2-";
			}
			else { $watermark_align = ""; } //left justified

			if ( $options['ffmpeg_watermark']['valign'] == 'bottom' ) {
				$watermark_valign = "main_h-overlay_h-";
			}
			elseif ( $options['ffmpeg_watermark']['valign'] == 'center' ) {
				$watermark_valign = "main_h/2-overlay_h/2-";
			}
			else { $watermark_valign = ""; } //top justified

			$options['ffmpeg_watermark']['url'] = str_replace("https://", "http://",  $options['ffmpeg_watermark']['url']);
			if ( strpos($options['ffmpeg_watermark']['url'], 'http://') === 0 ) {
				$watermark_id = false;
				$watermark_id = kgvid_url_to_id($options['ffmpeg_watermark']['url']);
				if ( $watermark_id ) {
					$watermark_file = get_attached_file($watermark_id);
					if ( file_exists($watermark_file) ) { $options['ffmpeg_watermark']['url'] = $watermark_file; }
				}
			}

			$watermark_input = '-i "'.$options['ffmpeg_watermark']['url'].'" ';
			$watermark_filter = ' -filter_complex "[1:v]scale='.$watermark_width.':-1[watermark];[0:v]'.$rotate_complex.'[watermark]overlay='.$watermark_align.'main_w*'.round($options['ffmpeg_watermark']['x']/100, 3).':'.$watermark_valign.'main_w*'.round($options['ffmpeg_watermark']['y']/100, 3).'"';
		}
		else {
			$watermark_input = "";
			$watermark_filter = "";
		}

		if ( $video_formats[$format]['type'] == 'h264' ) {

			$aac_array = kgvid_aac_encoders();
			foreach ( $aac_array as $aaclib ) { //cycle through available AAC encoders in order of quality
				if ( $libraries[$aaclib] == "true" ) { break; }
			}
			if ( $aaclib == "aac" ) { $aaclib = "aac -strict experimental"; } //the built-in aac encoder is considered experimental

			$vpre_flags = "";
			if ( $options['ffmpeg_vpre'] == 'on' ) { $vpre_flags = ' -coder 0 -flags +loop -cmp +chroma -partitions +parti8x8+parti4x4+partp8x8+partb8x8 -me_method hex -subq 6 -me_range 16 -g 250 -keyint_min 25 -sc_threshold 40 -i_qfactor 0.71 -b_strategy 1 -qcomp 0.6 -qmin 10 -qmax 51 -qdiff 4 -bf 0 -refs 1 -trellis 1 -flags2 +bpyramid+mixed_refs-wpred-dct8x8+fastpskip -wpredp 0 -rc_lookahead 30 -maxrate 10000000 -bufsize 10000000'; }

			$movflags = "";
			if ( $options['moov'] == "movflag" ) {
				$movflags = " -movflags faststart";
			}

			$profile_text = "";
			if ( $options['h264_profile'] != "none" ) {
				$profile_text = " -".$profile_flag." ".$options['h264_profile'];
				if ( $options['h264_profile'] != "high422" && $options['h264_profile'] != "high444" ) {
					$profile_text .= " -pix_fmt yuv420p"; //makes sure output is converted to 4:2:0
				}
			}

			$level_text = "";
			if ( $options['h264_level'] != "none" ) {
				$level_text = " -".$level_flag." ".round(floatval($options['h264_level'])*10);
			}

			$ffmpeg_options = "-acodec ".$aaclib." -".$audio_bitrate_flag." ".$options['audio_bitrate']."k -s ".$width."x".$height." -vcodec libx264".$vpre_flags.$movflags.$profile_text.$level_text;

		}
		else { //if it's not H.264 the settings are basically the same
			$ffmpeg_options = "-acodec libvorbis -".$audio_bitrate_flag." ".$options['audio_bitrate']."k -s ".$width."x".$height." -vcodec ".$video_formats[$format]['vcodec'];
			if ( $video_formats[$format]['type'] == 'webm' && $options['rate_control'] == "crf" ) {
				$ffmpeg_options .= " -".$video_bitrate_flag." ".round(floatval($options['bitrate_multiplier'])*1.25*$width*$height*30/1024)."k"; //set a max bitrate 25% larger than the ABR. Otherwise libvpx goes way too low.
			}
		}

		$nice = "";
		$sys = strtoupper(PHP_OS); // Get OS Name
		if( substr($sys,0,3) != "WIN" && $options['nice'] == "on" ) { $nice = "nice "; }

		if ( !empty($options['htaccess_login']) && strpos($input, 'http://') === 0 ) {
			$input = substr_replace($input, $options['htaccess_login'].':'.$options['htaccess_password'].'@', 7, 0);
		}

		$nostdin = "";
		if ( $options['nostdin'] == "on" && $options['video_app'] == 'ffmpeg' ) { $nostdin = " -nostdin"; }

		$encode_string = array();
		$encode_string[1] = $nice.$options['app_path']."/".$options['video_app'].$nostdin.' -y -i "'.$input.'" '.$watermark_input.$ffmpeg_options.$rate_control_flag.$rotate." -threads ".$options['threads'];
		$encode_string[2] = $watermark_filter;
		$encode_string[3] = ' "'.$output.'"';

		$options['encode_string'] = $encode_string;
		update_option('kgvid_video_embed_options', $options);

	} //if FFMPEG is found

	return apply_filters('kgvid_generate_encode_string', $encode_string, $input, $output, $movie_info, $format, $width, $height, $rotate);

}

class kgvid_Process{

    private $pid;
    private $command;

    public function __construct($cl=false){
        if ($cl != false){
            $this->command = $cl;
            $this->runCom();
        }
    }
    private function runCom(){
		$sys = strtoupper(PHP_OS); // Get OS Name
		if(substr($sys,0,3) == "WIN") { $this->OS = "windows"; }
		else { $this->OS = "linux";	}

		$command = $this->command;
		if ($this->OS != "windows") {
			exec($command ,$op);
			$this->output = $op;
			$this->pid = (int)$op[0];
		}
		else {
			proc_close(proc_open ('start /B '.$command, array(), $foo));
		}
    }

    public function setPid($pid){
        $this->pid = $pid;
    }

    public function getPid(){
        return $this->pid;
    }

    public function status(){
        $command = 'ps -p '.$this->pid;
        exec($command,$op);
        if (!isset($op[1]))return false;
        else return true;
    }

    public function start(){
        if ($this->command != '')$this->runCom();
        else return true;
    }

    public function stop(){
        $command = 'kill '.$this->pid;
        exec($command);
        if ($this->status() == false)return true;
        else return false;
    }
}// class Process

function kgvid_video_embed_enqueue_scripts() {

	$options = kgvid_get_options();

	//Video.js styles
	if ( $options['embed_method'] == "Video.js" || $options['embed_method'] == "Strobe Media Playback" ) {
		wp_enqueue_style( 'video-js', plugins_url("", __FILE__).'/video-js/video-js.css', '', '5.5.3' );
		if ( $options['js_skin'] == 'kg-video-js-skin' ){ wp_enqueue_style( 'video-js-kg-skin', plugins_url("", __FILE__).'/video-js/kg-video-js-skin.css', '', $options['version'] ); }
	}

	//plugin-related frontend styles, requires dashicons
	wp_enqueue_style( 'kgvid_video_styles', plugins_url("/css/kgvid_styles.css", __FILE__), array( 'dashicons' ), $options['version'] );

}
add_action('wp_enqueue_scripts', 'kgvid_video_embed_enqueue_scripts', 12);

function enqueue_kgvid_script() { //loads plugin-related scripts in the admin area

	if ( !wp_script_is('kgvid_video_plugin_admin', 'enqueued') ) {

		$options = kgvid_get_options();

		wp_enqueue_script( 'kgvid_video_plugin_admin', plugins_url('/js/kgvid_video_plugin_admin.js', __FILE__), array('jquery'), $options['version'], true );
		wp_enqueue_style( 'video_embed_thumbnail_generator_style', plugins_url('/css/video-embed-thumbnail-generator_admin.css', __FILE__), '', $options['version'] );

		wp_localize_script( 'kgvid_video_plugin_admin', 'kgvidL10n', array(
				'wait' => _x('Wait', 'please wait', 'video-embed-thumbnail-generator'),
				'hidevideo' => __('Hide video...', 'video-embed-thumbnail-generator'),
				'choosefromvideo' => __('Choose from video...', 'video-embed-thumbnail-generator'),
				'cantloadvideo' => __('Can\'t load video', 'video-embed-thumbnail-generator'),
				'choosethumbnail' => __('Choose Thumbnail:', 'video-embed-thumbnail-generator'),
				'saveallthumbnails' => __('Save All Thumbnails', 'video-embed-thumbnail-generator'),
				'saving' => __('Saving...', 'video-embed-thumbnail-generator'),
				'loading' => __('Loading...', 'video-embed-thumbnail-generator'),
				'generate' => __('Generate', 'video-embed-thumbnail-generator'),
				'randomize' => __('Randomize', 'video-embed-thumbnail-generator'),
				'ffmpegnotfound' => sprintf( __('%s not found', 'video-embed-thumbnail-generator'), strtoupper($options['video_app']) ),
				'validurlalert' => __("Please enter a URL that points to a valid video file. Video sharing sites are not supported by this plugin.\nTo embed from YouTube, Vimeo, etc, just paste the link directly into the post window and WordPress will handle the rest.", 'video-embed-thumbnail-generator'),
				'pleasevalidurl' => __('Please enter a valid video URL', 'video-embed-thumbnail-generator'),
				'deletemessage' => __("You are about to permanently delete the encoded video.\n 'Cancel' to stop, 'OK' to delete.", 'video-embed-thumbnail-generator'),
				'saved' => __('Saved.', 'video-embed-thumbnail-generator'),
				'runningtest' => __('Running test...', 'video-embed-thumbnail-generator'),
				'ffmpegrequired' => __('FFMPEG or LIBAV required for these functions.', 'video-embed-thumbnail-generator'),
				'featuredwarning' => __("You are about to set all existing video thumbnails previously generated by this plugin as the featured images for their posts. There is no 'undo' button, so proceed at your own risk.", 'video-embed-thumbnail-generator'),
				'autothumbnailwarning' => __("You are about to create thumbnails for every video in your Media Library that doesn't already have one. This might take a long time. There is no 'undo' button, so proceed at your own risk.\n\nNumber of videos without thumbnails: ", 'video-embed-thumbnail-generator'),
				'autoencodewarning' => __("You are about to add every video in your Media Library to the video encode queue if it hasn't already been encoded. This might take a long time.", 'video-embed-thumbnail-generator'),
				'nothumbstomake' => __("No thumbnails generated. All videos have thumbnails already.", 'video-embed-thumbnail-generator'),
				'cancel_ok' => __("'Cancel' to stop, 'OK' to proceed.", 'video-embed-thumbnail-generator'),
				'processing' => __('Processing...', 'video-embed-thumbnail-generator'),
				'parentwarning_posts' => __("You are about to set all existing video thumbnails previously generated by this plugin as attachments of their posts rather than their associated videos. Proceed at your own risk.", 'video-embed-thumbnail-generator'),
				'parentwarning_videos' => __("You are about to set all existing video thumbnails previously generated by this plugin as attachments of their videos rather than their associated posts. Proceed at your own risk.", 'video-embed-thumbnail-generator'),
				'clearqueuedwarning' => __("You are about to clear all videos not yet encoded.", 'video-embed-thumbnail-generator'),
				'clearallwarning' => __("You are about to clear all videos currently encoding, not yet encoded, completed successfully, and completed with errors.", 'video-embed-thumbnail-generator'),
				'complete' => __('Complete', 'video-embed-thumbnail-generator'),
				'tracktype' => __('Track type:', 'video-embed-thumbnail-generator'),
				'subtitles' => __('subtitles', 'video-embed-thumbnail-generator'),
				'captions' => __('captions', 'video-embed-thumbnail-generator'),
				'chapters' => __('chapters', 'video-embed-thumbnail-generator'),
				'choosetextfile' => __('Choose a Text File', 'video-embed-thumbnail-generator'),
				'settracksource' => __('Set as track source', 'video-embed-thumbnail-generator'),
				'choosefromlibrary' => __('Choose from Library', 'video-embed-thumbnail-generator'),
				'languagecode' => __('Language code:', 'video-embed-thumbnail-generator'),
				'label' => _x('Label:', 'noun', 'video-embed-thumbnail-generator'),
				'trackdefault' => __('Default:', 'video-embed-thumbnail-generator'),
				'custom' => _x('Custom', 'Custom format', 'video-embed-thumbnail-generator')
		) );
	}

}
add_action('admin_enqueue_scripts', 'enqueue_kgvid_script');
add_action('wp_enqueue_media', 'enqueue_kgvid_script');

function kgvid_get_first_embedded_video( $post ) {

	$url = '';
	$attributes = array();

	$first_embedded_video_meta = get_post_meta($post->ID, '_kgvid_first_embedded_video', true);

	if ( !empty($first_embedded_video_meta) ) {

		if ( is_array($first_embedded_video_meta['atts']) ) {
			$dataattributes = array_map(function($value, $key) {
				return $key.'="'.$value.'"';
			}, array_values($first_embedded_video_meta['atts']), array_keys($first_embedded_video_meta['atts']));

			$dataattributes = ' '.implode(' ', $dataattributes);
		}
		else { $dataattributes = $first_embedded_video_meta['atts']; }

		$shortcode_text = '[KGVID'.$dataattributes.']'.$first_embedded_video_meta['content'].'[/KGVID]';

	}
	else { $shortcode_text = $post->post_content; }

	$pattern = get_shortcode_regex();
	preg_match_all( '/'. $pattern .'/s', $shortcode_text, $matches );

	if ( is_array($matches)
		&& array_key_exists( 2, $matches ) && array_key_exists( 5, $matches )
		&& ( in_array( 'KGVID', $matches[2] ) || in_array( 'FMP', $matches[2] ) )
	) { //if KGVID or FMP shortcode is in posts on this page.

		if ( isset($matches) ) {

			$first_key = array_search('KGVID', $matches[2]);
			if ( $first_key === false ) { $first_key = array_search('FMP', $matches[2]); }

			if ( $first_key !== false ) {

				$attributes = array();
				$url = "";

				if ( array_key_exists( 3, $matches ) ) {
					$attributes = shortcode_parse_atts($matches[3][$first_key]);
				}

				if ( !empty($matches[5][$first_key]) ) { //there's a URL

					$url = $matches[5][$first_key];
					$attributes['id'] = kgvid_url_to_id($matches[5][$first_key]);

				}//if there's a URL

				elseif ( is_array($attributes) && array_key_exists( 'id', $attributes ) ) {
					$url = wp_get_attachment_url($attributes['id']);
				}//if there's no URL but there's an ID attribute

				elseif ( ( is_array($attributes) && !array_key_exists( 'id', $attributes ) )
						|| empty($attributes)
				) {

					$post_id = $post->ID;

					$args = array(
						'numberposts' => 1,
						'post_mime_type' => 'video',
						'post_parent' => $post_id,
						'post_status' => null,
						'post_type' => 'attachment'
					);
					$video_attachment = get_posts($args);

					if ( $video_attachment ) {
						$attributes['id'] = $video_attachment[0]->ID;
						$url = wp_get_attachment_url($attributes['id']);
					}

				}//if no URL or ID attribute

			}//if there's a KGVID shortcode in the post
		}//if there's a shortcode in the post
		elseif ( is_attachment() ) {
			$attributes['id'] = $post->ID;
			$attributes['url'] = wp_get_attachment_url($post->ID);
		}

		if ( array_key_exists( 'id', $attributes ) ) {

			$kgvid_postmeta = kgvid_get_attachment_meta($attributes['id']);
			$kgvid_postmeta['poster'] = get_post_meta($attributes['id'], "_kgflashmediaplayer-poster", true);
			$dimensions = kgvid_set_video_dimensions($attributes['id']);
			$attributes = array_merge($dimensions, array_filter($kgvid_postmeta), $attributes);

		}

	}

	$attributes['url'] = $url;
	return $attributes;

}

function kgvid_video_embed_print_scripts() {

	global $wp_query;
	global $wpdb;
	global $wp_version;
    $posts = $wp_query->posts;
	$pattern = get_shortcode_regex();
	$options = kgvid_get_options();

	//echo '<script type="text/javascript">document.createElement(\'video\');document.createElement(\'audio\');</script>'."\n";

	if ( !empty($posts) && is_array($posts) ) {
		foreach ( $posts as $post ) {
			$first_embedded_video = kgvid_get_first_embedded_video( $post );
			if ( !empty($first_embedded_video['url']) ) { //if KGVID or FMP shortcode is in posts on this page.

				if ( $options['open_graph'] == "on" ) {

					remove_action('wp_head','jetpack_og_tags');
					echo '<meta property="og:url" content="'.esc_attr(get_permalink($post)).'" />'."\n";
					echo '<meta property="og:title" content="'.esc_attr(get_the_title($post)).'" />'."\n";
					echo '<meta property="og:description" content="'.esc_attr(kgvid_generate_video_description($first_embedded_video, $post)).'" />'."\n";
					echo '<meta property="og:video" content="'.$first_embedded_video['url'].'" />'."\n";
					$secure_url = str_replace('http://', 'https://', $first_embedded_video['url']);
					echo '<meta property="og:video:secure_url" content="'.$secure_url.'" />'."\n";
					$mime_type_check = wp_check_filetype($first_embedded_video['url']);
					echo '<meta property="og:video:type" content="'.$mime_type_check['type'].'" />'."\n";

					if ( array_key_exists( 'width', $first_embedded_video ) ) {
						echo '<meta property="og:video:width" content="'.$first_embedded_video['width'].'" />'."\n";
						if ( array_key_exists( 'height', $first_embedded_video ) ) {
							echo '<meta property="og:video:height" content="'.$first_embedded_video['height'].'" />'."\n";
						}
					}

					if ( array_key_exists( 'poster', $first_embedded_video) ) {
						echo '<meta property="og:image" content="'.$first_embedded_video['poster'].'" />'."\n";
						if ( array_key_exists( 'width', $first_embedded_video ) ) {
						echo '<meta property="og:image:width" content="'.$first_embedded_video['width'].'" />'."\n";
						if ( array_key_exists( 'height', $first_embedded_video ) ) {
							echo '<meta property="og:image:height" content="'.$first_embedded_video['height'].'" />'."\n";
						}
					}
					}

				}

				if ( $options['twitter_card'] == "on" && array_key_exists('id', $first_embedded_video) && !empty($first_embedded_video['id']) ) {

					add_filter( 'jetpack_disable_twitter_cards', '__return_true', 99 );

					echo '<meta name="twitter:card" content="player">'."\n";
					if ( !empty($options['twitter_username']) ) { echo '<meta name="twitter:site" content="@'.esc_attr($options['twitter_username']).'">'."\n"; }
					echo '<meta name="twitter:title" content="'.esc_attr($post->post_title).'">'."\n";
					echo '<meta name="twitter:description" content="'.substr(esc_attr(kgvid_generate_video_description($first_embedded_video, $post)), 0, 200).'">'."\n";
					if ( array_key_exists('poster', $first_embedded_video) ) {
						echo '<meta name="twitter:image" content="'.esc_attr(str_replace('http://', 'https://', $first_embedded_video['poster'])).'">'."\n";
					}
					echo '<meta name="twitter:player" content="'.esc_attr(str_replace('http://', 'https://', get_attachment_link($first_embedded_video['id']))).'?kgvid_video_embed%5Benable%5D=true'.'">'."\n";
					if ( array_key_exists( 'width', $first_embedded_video ) ) {
						echo '<meta name="twitter:player:width" content="'.esc_attr($first_embedded_video['width']).'">'."\n";
					}
					if ( array_key_exists( 'height', $first_embedded_video ) ) {
						echo '<meta name="twitter:player:height" content="'.esc_attr($first_embedded_video['height']).'">'."\n";
					}

					$encodevideo_info = kgvid_encodevideo_info($first_embedded_video['url'], $first_embedded_video['id']);
					$twitter_stream = false;
					if ( array_key_exists('mobile', $encodevideo_info) && $encodevideo_info['mobile']['exists'] ) {
						$twitter_stream = $encodevideo_info['mobile']['url'];
					}
					elseif ( get_post_mime_type($first_embedded_video['id']) == 'video/mp4' ) {
						$twitter_stream = $first_embedded_video['url'];
					}
					if ( $twitter_stream ) {
						echo '<meta name="twitter:player:stream" content="'.esc_attr(str_replace('http://', 'https://', $twitter_stream)).'">'."\n";
						echo '<meta name="twitter:player:stream:content_type" content="video/mp4; codecs=&quot;avc1.42E01E1, mp4a.40.2&quot;">'."\n";
					}


				}

				if ( $wp_version < 4.4 && array_key_exists( 'id', $first_embedded_video ) && $options['oembed_provider'] == "on" && is_singular() ) {

					echo '<link rel="alternate" type="application/json+oembed" href="' . site_url('/?kgvid_video_embed[oembed]=json&amp;kgvid_video_embed[post_id]=' .$first_embedded_video['id']).'" />'."\n";
					echo '<link rel="alternate" type="application/xml+oembed" href="' . site_url('/?kgvid_video_embed[oembed]=xml&amp;kgvid_video_embed[post_id]='.$first_embedded_video['id']).'" />'."\n";

				}

				break; //end execution after the first video embedded using the shortcode

			}//end if shortcode is in post or is attachment
		}//end post loop
	}//end if posts

}
add_action('wp_head', 'kgvid_video_embed_print_scripts', 9 );

function kgvid_change_oembed_data( $data, $post, $width, $height ) {

	$options = kgvid_get_options();

	$first_embedded_video = kgvid_get_first_embedded_video( $post );

	if ( !empty($data) && !empty($first_embedded_video['url']) && $options['oembed_provider'] == "on" ) {

		$data['type'] = 'video';

		if ( !empty($first_embedded_video['poster']) ) { $data['thumbnail_url'] = $first_embedded_video['poster']; }

	}

	return apply_filters('kgvid_change_oembed_data', $data, $post, $width, $height );

}
if ( function_exists('get_oembed_response_data') ) { add_filter( 'oembed_response_data', 'kgvid_change_oembed_data', 11, 4 ); }

function kgvid_change_oembed_iframe_url ( $embed_url, $post ) {

	$options = kgvid_get_options();

	if ( $options['oembed_provider'] == "on" ) {

		$first_embedded_video = kgvid_get_first_embedded_video( $post );

		if ( array_key_exists( 'id', $first_embedded_video ) ) {

			$embed_url = site_url('/')."?attachment_id=".$first_embedded_video['id']."&amp;kgvid_video_embed[enable]=true";

		}

	}

	return apply_filters('kgvid_change_oembed_iframe_url', $embed_url, $post);

}
if ( function_exists('get_post_embed_url') ) { add_filter( 'post_embed_url', 'kgvid_change_oembed_iframe_url', 11, 2 ); } //added in WP version 4.4

function kgvid_change_oembed_html($output, $post, $width, $height) {

	$output = preg_replace('/<blockquote(.*)<\/script>/s', '', $output);

	return $output;

}
if ( function_exists('get_post_embed_html') ) { add_filter( 'embed_html', 'kgvid_change_oembed_html', 11, 4 ); } //added in WP version 4.4

/* function kgvid_replace_oembed_content($template) {

	$options = kgvid_get_options();

	if ( $options['oembed_provider'] == "on" ) {

		global $post;
		if ( $post ) { $first_embedded_video = kgvid_get_first_embedded_video( $post ); }
		if ( $first_embedded_video && !empty($first_embedded_video['id']) && basename($template) == 'embed.php' ) {
			$template = plugin_dir_path( __FILE__ ) . 'includes/embed.php';
		}
    }

    return $template;

}
add_filter( 'template_include', 'kgvid_replace_oembed_content', 99 ); */

function kgvid_enqueue_shortcode_scripts() {

	$options = kgvid_get_options();

	if ( $options['embed_method'] == "Video.js" || $options['embed_method'] == "Strobe Media Playback" ) {
			wp_enqueue_script( 'video-quality-selector', plugins_url("", __FILE__).'/video-js/video-quality-selector.js', array('video-js'), $options['version'], true );
			wp_enqueue_script( 'video-js', plugins_url("", __FILE__).'/video-js/video.js', '', '5.5.3', true );
			add_action('wp_footer', 'kgvid_print_videojs_footer', 99);
		}

		if ( $options['embed_method'] == "Strobe Media Playback" ) {
			wp_enqueue_script( 'swfobject' );
		}

	if ( !wp_script_is('kgvid_video_embed', 'enqueued') ) {

		wp_enqueue_script( 'kgvid_video_embed', plugins_url("/js/kgvid_video_embed.js", __FILE__), array('jquery'), $options['version'], true );

		wp_localize_script( 'kgvid_video_embed', 'kgvidL10n_frontend', array(
			'ajaxurl' => admin_url( 'admin-ajax.php', is_ssl() ? 'admin' : 'http' ),
			'ajax_nonce' => wp_create_nonce('kgvid_frontend_nonce'),
			'playstart' => _x("Play Start", 'noun for Google Analytics event', 'video-embed-thumbnail-generator'),
			'completeview' => _x("Complete View", 'noun for Google Analytics event', 'video-embed-thumbnail-generator'),
			'next' => _x("Next", 'button text to play next video', 'video-embed-thumbnail-generator'),
			'previous' => _x("Previous", 'button text to play previous video', 'video-embed-thumbnail-generator'),
			'quality' => _x("Quality", 'text above list of video resolutions', 'video-embed-thumbnail-generator')
		) );

	}

}

function kgvid_print_videojs_footer() { //called by the shortcode if Video.js is used

	echo '<script type="text/javascript">if(typeof videojs !== "undefined") { videojs.options.flash.swf = "'.plugins_url("", __FILE__).'/video-js/video-js.swf?5.0.1"; }</script>'."\n";

}

function kgvid_gallery_page($page_number, $query_atts, $last_video_id = 0) {

	$options = kgvid_get_options();
	global $kgvid_video_id;
	if ( !$kgvid_video_id ) { $kgvid_video_id = $last_video_id + 1; }

	$code = '';

	if ( $query_atts['gallery_orderby'] == 'menu_order' ) { $query_atts['gallery_orderby'] = 'menu_order ID'; }
	if ( $options['gallery_pagination'] != 'on' && empty($query_atts['gallery_per_page']) || $query_atts['gallery_per_page'] == 'false' ) { $query_atts['gallery_per_page'] = -1; }

	$args = array(
		'post_type' => 'attachment',
		'orderby' => $query_atts['gallery_orderby'],
		'order' => $query_atts['gallery_order'],
		'post_mime_type' => 'video',
		'posts_per_page' => $query_atts['gallery_per_page'],
		'paged' => $page_number,
		'post_status' => 'published',
		'post_parent' => $query_atts['gallery_id']
	);

	if ( !empty($query_atts['gallery_exclude']) ) {
		$exclude_arr = wp_parse_id_list($query_atts['gallery_exclude']);
		if ( !empty($exclude_arr) ) {
			$args['post__not_in'] = $exclude_arr;
		}
	}

	if ( !empty($query_atts['gallery_include']) ) {
		$include_arr = wp_parse_id_list($query_atts['gallery_include']);
		if ( !empty($include_arr) ) {
			$args['post__in'] = $include_arr;
			unset($args['post_parent']);
		}
	}

	$attachments = new WP_Query($args);

	if ( $attachments->have_posts() ) {

		foreach ( $attachments->posts as $attachment ) {

			$thumbnail_url = get_post_meta($attachment->ID, "_kgflashmediaplayer-poster", true);
			$poster_id = get_post_meta($attachment->ID, '_kgflashmediaplayer-poster-id', true);
			if ( !empty($poster_id) ) {
				$thumbnail_url = wp_get_attachment_url($poster_id);
				if ( intval($query_atts['gallery_thumb']) <= get_option('medium_size_h') ) {
					$poster_post = get_post($poster_id);
					if ( $poster_post->guid == $thumbnail_url ) {
						$thumbnail_url = kgvid_get_attachment_medium_url($poster_id);
					} //use the "medium" size image if available
				}
			}
			if (!$thumbnail_url) { $thumbnail_url = $options['poster']; } //use the default poster if no thumbnail set
			if (!$thumbnail_url) { $thumbnail_url = plugins_url('/images/nothumbnail.jpg', __FILE__);} //use the blank image if no other option

			if ( empty($query_atts['caption']) ) { $query_atts['caption'] = $attachment->post_excerpt; }
			$below_video = 0;
			if ( !empty($query_atts['caption']) ) { $below_video = 1; }
			$kgvid_postmeta = kgvid_get_attachment_meta( $attachment->ID );

			$play_button_html = '';

			if ( $options['embed_method'] == "WordPress Default" ) {

				$library = apply_filters( 'wp_video_shortcode_library', 'mediaelement' );
				if ( 'mediaelement' === $library && did_action( 'init' ) ) {
					wp_enqueue_style( 'wp-mediaelement' );
					wp_enqueue_script( 'wp-mediaelement' );
				}

				$play_button_class = "mejs-overlay-button";
				$play_scale = strval( round(intval($query_atts["gallery_thumb"])/400,2) );
				$play_translate = 5;
			}

			else {
				$play_button_class = "vjs-big-play-button";
				$play_scale = strval( round(intval($query_atts["gallery_thumb"])/600,2) );
				$play_translate = 30;
			}

			$play_button_html = '<div class="'.esc_attr($options['js_skin']).'" ><div class="'.$play_button_class.'" style="-webkit-transform: scale('.$play_scale.') translateY(-'.$play_translate.'px); -o-transform: scale('.$play_scale.') translateY(-'.$play_translate.'px); -ms-transform: scale('.$play_scale.') translateY(-'.$play_translate.'px); transform: scale('.$play_scale.') translateY(-'.$play_translate.'px);"><span></span></div></div>';

			$dimensions = kgvid_set_video_dimensions($attachment->ID, true);

			$atts = array(
				'autoplay' => 'true',
				'id' => $attachment->ID,
				'width' => $dimensions['width'],
				'height' => $dimensions['height']
			);
			if ( $kgvid_postmeta['downloadlink'] == "on" ) { $atts['downloadlink'] = "true"; }

			$popup_atts = kgvid_shortcode_atts($atts);
			if ( in_the_loop() ) { $post_id = get_the_ID(); }
			else { $post_id = 1; }
			$content = '';
			$popup_code = kgvid_single_video_code($popup_atts, $atts, $content, $post_id);

			preg_match('/data-kgvid_video_vars=.*? /', $popup_code, $video_vars);
			$popup_code = str_replace(array("\r", "\n", "\t", $video_vars[0]), "", $popup_code);

			if ( $options['js_skin'] == "" ) { $options['js_skin'] = "vjs-default-skin"; }
			if ( is_array($query_atts) && array_key_exists('skin', $query_atts) ) {
				$options['js_skin'] = $query_atts['skin']; //allows user to set skin for individual videos using the skin="" attribute
			}

			$code .= '<div class="kgvid_video_gallery_thumb" onclick="kgvid_SetVideo(\'kgvid_'.strval($kgvid_video_id-1).'\')" id="kgvid_video_gallery_thumb_kgvid_'.strval($kgvid_video_id-1).'" data-id="kgvid_'.strval($kgvid_video_id-1).'" data-width="'.esc_attr($dimensions['width']).'" data-height="'.esc_attr($dimensions['height']).'" data-meta="'.esc_attr($below_video).'" data-gallery_end="'.esc_attr($query_atts['gallery_end']).'" data-popupcode="'.esc_html($popup_code).'" '.$video_vars[0].'" style="max-width:'.$query_atts["gallery_thumb"].'px"><img src="'.esc_attr($thumbnail_url).'" alt="'.esc_attr($attachment->post_title).'">'.$play_button_html;

			if ( $query_atts['gallery_title'] == 'true' ) { $code .= '<div class="titlebackground"><div class="videotitle">'.$attachment->post_title.'</div></div>'; }

			$code .= '</div>'."\n\t\t\t";


		} //end attachment loop

		if ( $attachments->max_num_pages > 1 ) {

			$code .= '<div class="kgvid_gallery_pagination">';
			$code .= '<span class="kgvid_gallery_pagination_arrow"';
			if ( $page_number == 1 ) { $code .= ' style="visibility:hidden;"'; }
			$code .= ' onclick="kgvid_switch_gallery_page(jQuery(this).siblings(\'.kgvid_gallery_pagination_selected\').prev(), \'none\');"><a href="javascript:void(0)" title="'.__('Previous', 'video-embed-thumbnail-generator').'">&larr;</a></span> ';
			for ( $x = 1; $x <= $attachments->max_num_pages; $x++ ) {
				if ( $x == $page_number ) { $code .= '<span class="kgvid_gallery_pagination_selected">'.$x.'</span> '; }
				else { $code .= '<span onclick="kgvid_switch_gallery_page(this, \'none\');"><a href="javascript:void(0)">'.$x.'</a></span> '; }
			}
			$code .= '<span class="kgvid_gallery_pagination_arrow"';
			if ( $page_number == $attachments->max_num_pages ) { $code .= ' style="visibility:hidden;"'; }
			$code .= ' onclick="kgvid_switch_gallery_page(jQuery(this).siblings(\'.kgvid_gallery_pagination_selected\').next(), \'none\');"><a href="javascript:void(0)" title="'.__('Next', 'video-embed-thumbnail-generator').'">&rarr;</a></span>';
			$code .= '</div>';

		}

	} //if there are attachments

	return apply_filters('kgvid_gallery_page', $code, $kgvid_video_id);

}

function kgvid_switch_gallery_page() {

	check_ajax_referer( 'kgvid_frontend_nonce', 'security' );

	if ( isset($_POST['page']) ) { $page_number = $_POST['page']; }
	else { $page_number = 1; }
	$query_atts = $_POST['query_atts'];
	$last_video_id = $_POST['last_video_id'];
	$code = kgvid_gallery_page($page_number, $query_atts, $last_video_id);
	echo json_encode($code);
	die();

}
add_action( 'wp_ajax_kgvid_switch_gallery_page', 'kgvid_switch_gallery_page' ); // ajax for logged in users
add_action( 'wp_ajax_nopriv_kgvid_switch_gallery_page', 'kgvid_switch_gallery_page' ); // ajax for not logged in users

function kgvid_generate_video_description($query_atts, $post = false) {

	if ( array_key_exists('description', $query_atts) && !empty($query_atts['description']) && $query_atts['description'] != "false" ) {
		$description = $query_atts['description'];
	}
	elseif ( array_key_exists('description', $query_atts) && !empty($query_atts['caption']) && $query_atts['caption'] != "false" ) {
		$description = $query_atts['caption'];
	}
	elseif ( $post != false || ( in_the_loop() && !is_attachment() ) ) {

		if ( $post == false ) { global $post; }

		$yoast_meta = get_post_meta( $post->ID, '_yoast_wpseo_metadesc', true ); //try Yoast SEO meta description tag
		$aioseop_meta = get_post_meta( $post->ID, '_aioseop_description', true ); //try All in one SEO Pack meta description tag

		if ( !empty($yoast_meta) ) {
			$description = $yoast_meta;
		}
		elseif ( !empty($aioseop_meta) ) {
			$description = $aioseop_meta;
		}
		elseif ( !empty($post->post_excerpt) ) {
			$description = $post->post_excerpt;
		}
		else {
			$description = wp_trim_words(strip_tags(strip_shortcodes($post->post_content)));
		}
	}
	if ( empty($description) ) { $description = __('Video', 'video-embed-thumbnail-generator'); }

	return apply_filters('kgvid_generate_video_description', $description, $query_atts);

}

function kgvid_single_video_code($query_atts, $atts, $content, $post_id) {

	global $content_width;
	$content_width_save = $content_width;

	global $kgvid_video_id;
	if ( !$kgvid_video_id ) { $kgvid_video_id = 0; }

	$options = kgvid_get_options();
	$code = "";
	$id_array = array();
	$video_formats = kgvid_video_formats();
	$compatible = array("flv", "f4v", "mp4", "mov", "m4v", "ogv", "ogg", "webm");
	$h264compatible = array("mp4", "mov", "m4v");

	if ( empty($content) ) {
		if ( !empty($query_atts["id"]) ) {
			$id_array[0] = $query_atts["id"];
		}
		elseif ( $post_id != 1 ) {
			$args = array(
				'numberposts' => $query_atts['videos'],
				'post_mime_type' => 'video',
				'post_parent' => $post_id,
				'post_status' => null,
				'post_type' => 'attachment',
				'orderby' => $query_atts['orderby'],
				'order' => $query_atts['order']
			);
			$video_attachments = get_posts($args);
			if ( $video_attachments ) {
				foreach ( $video_attachments as $video ) {
					$id_array[] = $video->ID;
				}
			}
			else { return; } //if there are no video children of the current post
		}
		else { return; } //if there's no post ID and no $content
	}
	else { // $content is a URL
		// workaround for relative video URL (contributed by Lee Fernandes)
		if(substr($content, 0, 1) == '/') $content = get_bloginfo('url').$content;
		$content = trim($content);
		$id_array[0] = kgvid_url_to_id($content);
	}

	$original_content = $content;

	foreach ( $id_array as $id ) { //loop through videos

		$div_suffix = 'kgvid_'.strval($kgvid_video_id);

		$query_atts = kgvid_shortcode_atts($atts); //reset values so they can be different with multiple videos
		$content = $original_content;
		$sources = array();
		$mp4already = false;
		$dimensions = array();

		if ( $query_atts['gallery'] == 'false' && $kgvid_video_id === 0 && $post_id != 1 ) {
			$first_embedded_video['atts'] = $atts;
			$first_embedded_video['content'] = $content;
			$first_embedded_video_meta = get_post_meta($post_id, '_kgvid_first_embedded_video', true);
			if ( $first_embedded_video_meta != $first_embedded_video ) {
				update_post_meta($post_id, '_kgvid_first_embedded_video', $first_embedded_video);
			}
		}

		if ( !empty($id) ) { //if the video is an attachment in the WordPress db

			$attachment_url = wp_get_attachment_url($id);
			if ( $attachment_url == false ) { echo "Invalid video ID"; continue; }
			$exempt_cdns = array('amazonaws.com', 'rackspace.com', 'netdna-cdn.com', 'nexcess-cdn.net', 'limelight.com'); //don't replace URLs that point to CDNs
			$exempt_url = false;
			foreach ( $exempt_cdns as $exempt_cdn ) {
				if ( strpos($content, $exempt_cdn) !== false ) {
					$exempt_url = true;
				}
			}
			if ( !$exempt_url ) { $content = $attachment_url; }

			$encodevideo_info = kgvid_encodevideo_info($content, $id);
			$attachment_info = get_post( $id );
			$kgvid_postmeta = kgvid_get_attachment_meta($id);

			$dimensions = kgvid_set_video_dimensions($id);

			if ( empty($atts['width']) ) {
				$query_atts['width'] = $dimensions['width'];
				$query_atts['height'] = $dimensions['height'];
			}

			$poster_id = get_post_meta($id, '_kgflashmediaplayer-poster-id', true);
			if ( !empty($poster_id) ) {
				$poster_image_src = wp_get_attachment_image_src($poster_id, 'full');
				$query_atts['poster'] = $poster_image_src[0];
				if ( strpos($query_atts['width'], '%') === false && intval($query_atts['width']) <= get_option('medium_size_h') ) {
					$query_atts['poster'] = kgvid_get_attachment_medium_url($poster_id);
				}
			}

			if ( $query_atts['title'] == "true" ) {
				$query_atts['title'] = $attachment_info->post_title;
				$stats_title = $query_atts['title'];
			}
			else { $stats_title = $attachment_info->post_title; }
			if ( empty($query_atts['caption']) ) { $query_atts['caption'] = trim($attachment_info->post_excerpt); }
			if ( empty($query_atts['description']) ) { $query_atts['description'] = trim($attachment_info->post_content); }

			$countable = true;
		}
		else { //video is not in the database

			$encodevideo_info = kgvid_encodevideo_info($content, $post_id); //send the id of the post the video's embedded in
			if ( $query_atts['title'] == "true" ) {
				$query_atts['title'] = "false";
			}
			$stats_title = basename($content);
			if ( $query_atts['embedcode'] == "true" ) {
				$query_atts['embedcode'] = "false"; //can't use embed code with videos that are not in the database
			}

			$countable = false;
		}

		$mime_type_check = wp_check_filetype($content);
		if ( in_array($mime_type_check['ext'], $h264compatible) ) {
			$format_type = "h264";
			$mime_type = "video/mp4";
		}
		else {
			$format_type = $mime_type_check['ext'];
			$mime_type = $mime_type_check['type'];
		}

		unset($video_formats['fullres']);
		$video_formats = array('original' => array( "type" => $format_type, "mime" => $mime_type, "name" => "Full", "label" => "Full" ) ) + $video_formats;

		if ( in_array($mime_type_check['ext'], $compatible) ) {

			$encodevideo_info["original"]["exists"] = true;
			$encodevideo_info["original"]["url"] = $content;

			if ( is_array($dimensions) && array_key_exists('actualheight', $dimensions) ) {
				$video_formats['original']['label'] = $dimensions['actualheight'].'p';
				$video_formats['original']['height'] = $dimensions['actualheight'];
				$encodevideo_info["original"]["height"] = $dimensions['actualheight'];
			}

		}
		else { $encodevideo_info["original"]["exists"] = false; }

		if($query_atts["endofvideooverlaysame"] == "true") { $query_atts["endofvideooverlay"] = $query_atts["poster"]; }

		if ( $options['embed_method'] == "Strobe Media Playback" ) {

			$flash_settings = kgvid_generate_flashvars($content, $query_atts, $encodevideo_info, $div_suffix);

		} //if Strobe Media Playback

		if ( $query_atts['inline'] == "true" ) {
			$aligncode = ' kgvid_wrapper_inline';
			if ( $query_atts['align'] == "left" ) { $aligncode .= ' kgvid_wrapper_inline_left'; }
			if ( $query_atts['align'] == "center" ) { $aligncode .= ' kgvid_wrapper_auto_left kgvid_wrapper_auto_right'; }
			if ( $query_atts['align'] == "right" ) { $aligncode .= ' kgvid_wrapper_inline_right'; }
		}
		else {
			if ( $query_atts['align'] == "left" ) { $aligncode = ''; }
			if ( $query_atts['align'] == "center" ) { $aligncode = ' kgvid_wrapper_auto_left kgvid_wrapper_auto_right'; }
			if ( $query_atts['align'] == "right" ) { $aligncode = ' kgvid_wrapper_auto_left'; }
		}

		if ( ( $query_atts['title'] != "false" && $options['embed_method'] != "JW Player" )
			|| $query_atts['embedcode'] != "false"
			|| $query_atts['downloadlink'] == "true"
			||  $options['twitter_button'] == 'on'
			||  $options['facebook_button'] == 'on'
		) { //generate content overlaid on video
			$kgvid_meta = true;
		}
		else { $kgvid_meta = false; }

		$video_variables = array(
			'id' => $div_suffix,
			'attachment_id' => $id,
			'player_type' => str_replace(' ', '', $options['embed_method']),
			'width' => $query_atts['width'],
			'height' => $query_atts['height'],
			'fullwidth' => $query_atts['fullwidth'],
			'countable' => $countable,
			'autoplay' => $query_atts['autoplay'],
			'set_volume' => $query_atts['volume'],
			'mute' => $query_atts['mute'],
			'meta' => $kgvid_meta,
			'endofvideooverlay' => $query_atts['endofvideooverlay'],
			'resize' => $query_atts['resize'],
			'auto_res' => $query_atts['auto_res'],
			'pixel_ratio' => $query_atts['pixel_ratio'],
			'right_click' => $query_atts['right_click']
		);

		if ( $options['embed_method'] == "Video.js" || $options['embed_method'] == "Strobe Media Playback" ) {

			$locale = get_locale();

			$enable_resolutions_plugin = false;
			$x = 20;
			$h264_resolutions = array();

			foreach ($video_formats as $format => $format_stats) {
				if ( $format != "original" && $encodevideo_info[$format]["url"] == $content ) { unset($sources['original']); }
				if ( $encodevideo_info[$format]["exists"] ) {

					if ( array_key_exists('height', $encodevideo_info[$format]) && $format_stats['type'] == 'h264' ) {
						$source_key = $encodevideo_info[$format]['height'];
						$format_stats['label'] = $encodevideo_info[$format]['height'].'p';
					}
					else { $source_key = $x; }

					$sources[$source_key] = "\t\t\t\t\t".'<source src="'.esc_attr($encodevideo_info[$format]["url"]).'?id='.$kgvid_video_id.'" type="'.$format_stats["mime"].'"';
					if ( $format == 'vp9' ) { $sources[$source_key] .= ' codecs="vp9, vorbis"'; }
					if ( $format_stats['type'] == 'h264' ) {
						$sources[$source_key] .= ' data-res="'.$format_stats['label'].'"';
						if ( $mp4already ) { //there is more than one resolution available
							$enable_resolutions_plugin = true;
						}
						$mp4already = true;
						$h264_resolutions[] = $format_stats['label'];
					}
					else { $sources[$source_key] .= ' data-res="'.$format_stats['name'].'"'; }
					$sources[$source_key] .= '>'."\n";
				}
			$x--;
			}
			krsort($sources);
			natsort($h264_resolutions);

			$video_variables['nativecontrolsfortouch'] = $query_atts['nativecontrolsfortouch'];
			$video_variables['locale'] = substr($locale, 0, 2);

			if ( $enable_resolutions_plugin ) {
				$video_variables['enable_resolutions_plugin'] = "true";
				if ( $query_atts["auto_res"] == "highest" ) { $video_variables['default_res'] = end($h264_resolutions); }
				if ( $query_atts["auto_res"] == "lowest" ) { $video_variables['default_res'] = reset($h264_resolutions); }
				elseif ( in_array($query_atts["auto_res"], $h264_resolutions) ) { $video_variables['default_res'] = $query_atts["auto_res"]; }
				else { $video_variables['default_res'] = false; }
			}
			else { $video_variables['enable_resolutions_plugin'] = false; }

		}

		if ( $options['embed_method'] == "Strobe Media Playback" && $flash_settings['flash_source_found'] ) {

			$video_variables['swfurl'] = plugins_url('', __FILE__)."/flash/StrobeMediaPlayback.swf";
			$video_variables['expressinstallswfurl'] = plugins_url("", __FILE__)."/flash/expressInstall.swf";
			$video_variables['flashvars'] = $flash_settings['flashvars'];
			$video_variables['params'] = $flash_settings['params'];

		} //if Strobe Media

		$code .= '<div id="kgvid_'.$div_suffix.'_wrapper" class="kgvid_wrapper'.$aligncode.'">'."\n\t\t\t";
		$code .= '<div id="video_'.$div_suffix.'_div" class="fitvidsignore kgvid_videodiv" data-id="'.$div_suffix.'" data-kgvid_video_vars="'.esc_attr(json_encode($video_variables)).'" ';
		if ( $query_atts["schema"] == "true" ) {
			$code .= 'itemprop="video" itemscope itemtype="https://schema.org/VideoObject">';
			if ( $query_atts["poster"] != '' ) { $code .= '<meta itemprop="thumbnailUrl" content="'.esc_attr($query_atts["poster"]).'" />'; }
			if ( !empty($id) && $options['embeddable'] == "on" ) { $schema_embedURL = site_url('/')."?attachment_id=".$id."&amp;kgvid_video_embed[enable]=true"; }
			else { $schema_embedURL = $content; }
			$code .= '<meta itemprop="embedUrl" content="'.esc_attr($schema_embedURL).'" />';
			$code .= '<meta itemprop="contentUrl" content="'.$content.'" />';

			if ( !empty($query_atts['title']) && $query_atts['title'] != "false" ) { $code .= '<meta itemprop="name" content="'.esc_attr($query_atts['title']).'" />'; }
			elseif ( in_the_loop() && !is_attachment() ) {
				global $post;
				if ( !empty($post->post_title) ) { $code .= '<meta itemprop="name" content="'.esc_attr($post->post_title).'" />'; }
			}

			$description = kgvid_generate_video_description($query_atts);

			$code .= '<meta itemprop="description" content="'.esc_attr($description).'" />';

			if ( !empty($id) ) { $upload_date = get_the_date('c', $id); }
			elseif ( $post_id != 1 ) { $upload_date = get_the_date('c', $post_id); }
			else { $upload_date = current_time('c'); }
			$code .= '<meta itemprop="uploadDate" content="'.esc_attr($upload_date).'" />';
		}
		else { $code .= '>'; } //schema disabled

		$track_keys = array('kind', 'srclang', 'src', 'label', 'default');
		if ( !isset($kgvid_postmeta) || ( is_array($kgvid_postmeta) && !is_array($kgvid_postmeta['track']) ) ) {
			$kgvid_postmeta['track'] = array();
			$kgvid_postmeta['track'][0] = array ( 'kind' => '', 'srclang' => '', 'src' => '', 'label' => '',  'default' => '');
		}
		foreach ( $track_keys as $key ) {
			if ( empty($kgvid_postmeta['track'][0][$key]) ) { $kgvid_postmeta['track'][0][$key] = $query_atts['track_'.$key]; }
		}

		$track_code = "";
		if ( !empty($kgvid_postmeta['track'][0]['src']) ) {
			foreach ( $kgvid_postmeta['track'] as $track => $track_attribute ) {
				foreach ( $track_attribute as $attribute => $value ) {
					if ( empty($value) ) { $track_attribute[$attribute] = $query_atts['track_'.$attribute]; }
				}

				if ( $options['embed_method'] == "WordPress Default" && $track_attribute['kind'] == 'captions' ) { $track_attribute['kind'] = 'subtitles'; }
				$track_code .= "<track id='".$div_suffix."_text_".$track."' kind='".esc_attr($track_attribute['kind'])."' src='".esc_attr($track_attribute['src'])."' srclang='".esc_attr($track_attribute['srclang'])."' label='".esc_attr($track_attribute['label'])."' ".$track_attribute['default']." />";
			}
		}

		if ( $options['embed_method'] == "WordPress Default" ) {

			$enable_resolutions_plugin = false;
			$x = 20;
			$h264_resolutions = array();
			$attr = array();

			foreach ($video_formats as $format => $format_stats) {

				if ( $format != "original" && $encodevideo_info[$format]["url"] == $content ) { unset($sources['original']); }

				if ( $encodevideo_info[$format]["exists"] ) {

					if ( array_key_exists('height', $encodevideo_info[$format]) && $format_stats['type'] == 'h264' ) {
						$source_key = $encodevideo_info[$format]['height'];
						$format_stats['label'] = $encodevideo_info[$format]['height'].'p';
					}
					else { $source_key = $x; }

					$sources[$source_key] = '<source src="'.esc_attr($encodevideo_info[$format]["url"]).'?id='.$kgvid_video_id.'" type="'.$format_stats["mime"].'"';
					if ( $format == 'vp9' ) { $sources[$source_key] .= ' codecs="vp9, vorbis"'; }
					if ( $format_stats['type'] == 'h264' ) {
						$sources[$source_key] .= ' data-res="'.$format_stats['label'].'"';
						if ( $mp4already ) { //there is more than one resolution available
							$enable_resolutions_plugin = true;
						}
						$h264_resolutions[] = $format_stats['label'];
					}
					else { $sources[$source_key] .= ' data-res="'.$format_stats['name'].'"'; }

					if ( $format_stats['type'] != "h264" || !$mp4already ) { //build wp_video_shortcode attributes. Sources will be replaced later
						$shortcode_type = wp_check_filetype( $encodevideo_info[$format]["url"], wp_get_mime_types() );
						$attr[$shortcode_type['ext']] = $encodevideo_info[$format]["url"];
						if ( $format_stats['type'] == "h264" ) {
							$mp4already = true;
						}
					}
				}
			$x--;
			}
			krsort($sources);
			natsort($h264_resolutions);

			if ( $enable_resolutions_plugin ) {

				$default_key = false;

				if ( $query_atts["auto_res"] == "highest" ) {
					$res_label = end($h264_resolutions);
				}
				elseif ( $query_atts["auto_res"] == "lowest" ) {
					$res_label = reset($h264_resolutions);
				}
				elseif ( in_array($query_atts["auto_res"], $h264_resolutions) ) {
					$res_label = $query_atts["auto_res"];
				}
				else { $res_label = false; }

				foreach ( $sources as $key => $source ) {
					if ( strpos($source, 'data-res="'.$res_label.'"') !== false ) { $default_key = $key; }
				}

				if ( $default_key !== false )  { $sources[$default_key] .= ' data-default_res="true"'; }

			}

			if ( $query_atts["poster"] != '' ) { $attr['poster'] = esc_attr($query_atts["poster"]); }
			if ( $query_atts["loop"] == 'true') { $attr['loop'] = "true"; }
			if ( $query_atts["autoplay"] == 'true') { $attr['autoplay'] = "true"; }
			$attr['preload'] = $options['preload'];
			$attr['width'] = $query_atts['width'];
			$attr['height'] = $query_atts['height'];

			if ( $enable_resolutions_plugin && !wp_script_is('mejs_sourcechooser', 'enqueued') ) {
				wp_enqueue_script( 'mejs_sourcechooser', plugins_url( 'js/mep-feature-sourcechooser.js', __FILE__ ), array( 'mediaelement' ), $options['version'], true );
				wp_localize_script( 'wp-mediaelement', '_wpmejsSettings', array(
					'features' => array( 'playpause', 'progress', 'volume', 'tracks', 'sourcechooser', 'fullscreen' ),
					'pluginPath' => includes_url( 'js/mediaelement/', 'relative' ),
					'success' => 'kgvid_mejs_success'
				) );
			}
			elseif ( $kgvid_video_id === 0 ) {
				wp_localize_script( 'wp-mediaelement', '_wpmejsSettings', array(
					'features' => array( 'playpause', 'progress', 'volume', 'tracks', 'fullscreen' ),
					'pluginPath' => includes_url( 'js/mediaelement/', 'relative' ),
					'success' => 'kgvid_mejs_success'
				) );
			}

			$content_width = $query_atts['width'];
			if ( function_exists('wp_video_shortcode') ) { $executed_shortcode = wp_video_shortcode($attr); }
			else { $executed_shortcode = 'WordPress video shortcode function does not exist.'; }
			$content_width = $content_width_save;

			if ( $enable_resolutions_plugin ) {
				$executed_shortcode = preg_replace( '/<source .*<a /', implode(' />', $sources).' /><a ', $executed_shortcode );
			}
			if ( !empty($track_code) ) {
				$executed_shortcode = preg_replace( '/<a /', $track_code.'<a ', $executed_shortcode );
			}

			$code .= $executed_shortcode;
		}

		if ( $options['embed_method'] == "JW Player" ) {

			if ( class_exists('JWP6_Shortcode') ) {

				$x = 0;
				foreach ($video_formats as $format => $format_stats) {
					if ( $format != "original" && $encodevideo_info[$format]["url"] == $content ) { unset($sources['original']); }
					if ( $encodevideo_info[$format]["exists"] ) {
						if ( array_key_exists('height', $encodevideo_info[$format]) ) {
							$source_key = $encodevideo_info[$format]['height'];
							$format_stats['label'] = $encodevideo_info[$format]['height'].'p';
						}
						else { $source_key = $x; }

						$sources[$source_key] = '{ file:\''.esc_attr($encodevideo_info[$format]["url"]).'\', label:\''.$format_stats['label'].'\'';
						if ( $format == "original" ) { $sources[$source_key] .= ', default:\'true\''; }
						$sources[$source_key] .= '}';
						$x++;
					}
				}
				krsort($sources);

				$jw_tracks = array();
				if ( !empty($kgvid_postmeta['track'][0]['src']) ) {
					foreach ( $kgvid_postmeta['track'] as $track => $track_attribute ) {
						foreach ( $track_attribute as $attribute => $value ) {
							if ( empty($value) ) { $track_attribute[$attribute] = $query_atts['track_'.$attribute]; }
						}
						$default_text = '';
						if ( $track_attribute['default'] == 'default' ) { $default_text = ', \'default\': true'; }
						$jw_tracks[] = '{ file:\''.esc_attr($track_attribute['src']).'\', kind:\''.esc_attr($track_attribute['kind']).'\', label:\''.esc_attr($track_attribute['label']).'\''.$default_text.'}';
					}
				}

				$jw_shortcode = "[jwplayer ";
				$jw_shortcode .= 'sources="'.implode(',', $sources).'" ';
				$jw_shortcode .= 'tracks="'.implode(',', $jw_tracks).'" ';
				if ( $query_atts["poster"] != '' ) { $jw_shortcode .= 'image="'.esc_attr($query_atts["poster"]).'" '; }
				if ( $query_atts["loop"] == 'true' ) { $jw_shortcode .= 'repeat="true" '; }
				if ( $query_atts["autoplay"] == 'true' ) { $jw_shortcode .= 'autostart="true" '; }
				if ( $query_atts["controlbar"] == 'none') { $jw_shortcode .= 'controls="false" '; }
				if ( $query_atts['title'] != "false" ) { $jw_shortcode .= ' title="'.$query_atts['title'].'" '; }
				if ( $query_atts['jw_player_id'] != "") {
					$jw_player_config = get_option('jwp6_player_config_'.$query_atts['jw_player_id']);
					if ( !empty($jw_player_config) ) { $jw_shortcode .= ' player="'.$query_atts['jw_player_id'].'" '; }
				}

				if ( !empty($query_atts['custom_atts']) && is_array($query_atts['custom_atts']) ) {
					foreach ( $query_atts['custom_atts'] as $jw_param => $jw_setting ) {
						$jw_shortcode .= ' '.$jw_param.'="'.$jw_setting.'" ';
					}
				}

				$jw_shortcode = trim($jw_shortcode);
				$jw_shortcode .= ']';

				//this is JW Player's hack for executing without registering a WP shortcode
				$tag_regex = '/(.?)\[(jwplayer)\b(.*?)(?:(\/))?\](?:(.+?)\[\/\2\])?(.?)/s';
				$executed_shortcode = preg_replace_callback($tag_regex,  array("JWP6_Shortcode", "tag_parser"), $jw_shortcode);

				$code .= $executed_shortcode;

			}// if class exists
			else { $options['embed_method'] = "Video.js"; }

		}

		if ( $options['embed_method'] == "Video.js" || $options['embed_method'] == "Strobe Media Playback" ) {

			$code .= "\n\t\t\t\t".'<video id="video_'.$div_suffix.'" ';
			if ( $query_atts["loop"] == 'true') { $code .= 'loop '; }
			if ( $query_atts["autoplay"] == 'true') { $code .= 'autoplay '; }
			if ( $query_atts["controlbar"] != 'none') { $code .= 'controls '; }
			$code .= 'preload="'.$options['preload'].'" ';
			if ( $query_atts["poster"] != '' ) { $code .= 'poster="'.esc_attr($query_atts["poster"]).'" '; }
			$code .= 'width="'.$query_atts["width"].'" height="'.esc_attr($query_atts["height"]).'"';
			if ( $options['js_skin'] == "" ) { $options['js_skin'] = "vjs-default-skin"; }
			if ( is_array($atts) && array_key_exists('skin', $atts) ) {
				$options['js_skin'] = $atts['skin']; //allows user to set skin for individual videos using the skin="" attribute
			}
			$code .= ' class="fitvidsignore '.esc_attr('video-js '.$options['js_skin']).'">'."\n";

			$code .= implode("", $sources); //add the <source> tags created earlier
			$code .= $track_code; //if there's a text track
			$code .= "\t\t\t\t</video>\n";

		}
		$code .= "\t\t\t</div>\n";
		$show_views = false;
		if ( ( !empty($id) && $query_atts['view_count'] == "true" ) || !empty($query_atts['caption']) || $content == plugins_url('/images/sample-video-h264.mp4', __FILE__) ) { //generate content below the video
			if ( is_array($kgvid_postmeta) && array_key_exists('starts', $kgvid_postmeta) ) { $view_count = number_format(intval($kgvid_postmeta['starts'])); }
			else { $view_count = "0"; }
			if ( $content == plugins_url('/images/sample-video-h264.mp4', __FILE__) ) { $view_count = "XX"; }
			if ( $query_atts['view_count'] == "true" ) { $show_views = true; }
			if ( !empty($query_atts['caption']) || $show_views || $query_atts['downloadlink'] == "true" ) {
				$code .= "\t\t\t".'<div class="kgvid_below_video" id="video_'.$div_suffix.'_below">';
				if ( $show_views ) { $code .= '<div class="kgvid-viewcount" id="video_'.$div_suffix.'_viewcount">'.sprintf( _n( '%s view', '%s views', intval(str_replace(',', '', $view_count)) , 'video-embed-thumbnail-generator'), $view_count ).'</div>'; }
				if ( !empty($query_atts['caption']) ) {
					$code .= '<div class="kgvid-caption" id="video_'.$div_suffix.'_caption">'.$query_atts['caption'].'</div>';
				}
				$code .= '</div>';
			}
		}

		if ( $kgvid_meta == true ) { //generate content overlaid on video
			$code .= "\t\t\t<div style=\"display:none;\" id=\"video_".$div_suffix."_meta\" class=\"kgvid_video_meta kgvid_video_meta_hover ";
			if ( $query_atts['title'] != "false" && $options['embed_method'] != "JW Player" ) {
				$show_title = true;
				$code .= "\">";
			}
			else {
				$show_title = false;
				if ( $options['embed_method'] == "JW Player" ) { $code .= "kgvid_jwplayer_meta "; }
				$code .= "kgvid_no_title_meta\">";
			} //no title

			$code .= "\n\t\t\t\t<span class='kgvid_meta_icons'>";

			if ( $query_atts['downloadlink'] == "true" ) {
				$forceable = false;
				if ( !empty($id) && $options['click_download'] == 'on' ) {
					$filepath = get_attached_file($id);
					if ( file_exists($filepath) ) {
						$forceable = true;
						$download_code = '<a href="'.site_url('/').'?attachment_id='.$id.'&kgvid_video_embed[download]=true" title="'.__('Click to download', 'video-embed-thumbnail-generator').'">';
					}
				}
				if ( !$forceable ) { $download_code = '<a href="'.$content.'" title="'.__('Right-click or ctrl-click to download', 'video-embed-thumbnail-generator').'">'; }
				$download_code .= '<span class="dashicons dashicons-download"></span></a>';
			}
			else { $download_code = ''; }

			if ( $query_atts['embedcode'] != "false" || $options['twitter_button'] == 'on' || $options['facebook_button'] == 'on' ) {

				$embed_code = "\t\t\t\t<span id='kgvid_".$div_suffix."_shareicon' class='dashicons dashicons-share' onclick='kgvid_share_icon_click(\"".$div_suffix."\");'></span>\n";
				$embed_code .= "\t\t\t\t<div id='click_trap_".$div_suffix."' class='kgvid_click_trap'></div><div id='video_".$div_suffix."_embed' class='kgvid_share_container";
				if ( $show_title == false ) { $embed_code .= " kgvid_no_title_meta"; }
				$embed_code .= "'><div class='kgvid_share_icons'>";
				if ( $query_atts['embedcode'] != "false" ) {
					if ( $query_atts['embedcode'] == "true" ) { $iframeurl = site_url('/')."?attachment_id=".$id."&amp;kgvid_video_embed[enable]=true"; }
					else { $iframeurl = $query_atts['embedcode']; }
					$iframecode = "<iframe allowfullscreen src='".$iframeurl."' frameborder='0' scrolling='no' width='".esc_attr($query_atts['width'])."' height='".esc_attr($query_atts["height"])."'></iframe>";
					$iframecode = apply_filters('kgvid_embedcode', $iframecode, $iframeurl, $id, $query_atts);
					$embed_code .= "<span class='dashicons dashicons-editor-code'></span><span>"._x('Embed:', 'precedes code for embedding video', 'video-embed-thumbnail-generator')." </span><input type='text' value='".esc_attr($iframecode)."' onClick='this.select();'></span>";
				} //embed code

				if ( $options['twitter_button'] == 'on' || $options['facebook_button'] == 'on' ) {

					$embed_code .= "<div class='kgvid_social_icons'>";
					if ( in_the_loop() ) { $permalink = get_permalink(); }
					elseif ( !empty($id) ) { $permalink = get_attachment_link($id); }
					else { $permalink = $content; }

					if ( $options['twitter_button'] == 'on' ) {
						$embed_code .= "<a href='https://twitter.com/share?text=".urlencode($query_atts['title'])."&url=".urlencode($permalink);
						if ( !empty($options['twitter_username']) ) { $embed_code .= "&via=".urlencode($options['twitter_username']); }
						$embed_code .= "' onclick='window.open(this.href, \"\", \"menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=260,width=600\");return false;'><span class='dashicons dashicons-twitter'></span></a>";
					}

					if ( $options['facebook_button'] == 'on' ) {
						$embed_code .= "&nbsp;<a href='https://www.facebook.com/sharer/sharer.php?u=".urlencode($permalink)."' onclick='window.open(this.href, \"\", \"menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=260,width=600\");return false;'><span class='kgvid_facebook_icon_holder'><span class='dashicons dashicons-facebook'></span></span></a>";
					}

					$embed_code .= "</div>";

				}

				$embed_code .= "</div></div>\n";
			}
			else { $embed_code = ''; }

			if ( $options['embed_method'] != "JW Player" ) {
				$code .= $download_code.$embed_code;
			}
			else {
				$code .= $embed_code.$download_code;
			}

			$code .= "</span>";
			if ( $show_title == true ) { $code .= "\n\t\t\t\t<span id='video_".$div_suffix."_title' class='kgvid_title'>".$query_atts['title']."</span>\n"; }
			$code .= "</div>\n";
		}

		if ( !empty($query_atts["watermark"]) && $query_atts["watermark"] != "false" ) {
			$watermark_id = kgvid_url_to_id($query_atts["watermark"]);
			if ( $watermark_id ) { $query_atts["watermark"] = wp_get_attachment_url($watermark_id); }
			$code .= "<div style=\"display:none;\" id='video_".$div_suffix."_watermark' class='kgvid_watermark'>";
			if ( !empty($query_atts["watermark_url"]) && $query_atts["watermark_link_to"] != 'custom' ) { $query_atts["watermark_link_to"] = 'custom'; }
			if ( $query_atts['watermark_link_to'] != 'false' && $query_atts["watermark_url"] != 'false' ) {
				$watermark_link = true;
				switch ( $query_atts['watermark_link_to'] ) {

					case 'home':
						$watermark_href = get_home_url();
					break;

					case 'parent':
						if ( !empty($id) && is_object($attachment_info) && array_key_exists('post_parent', $attachment_info) && !empty($attachment_info->post_parent) ) {
							$watermark_href = get_permalink($attachment_info->post_parent);
						}
						else { $watermark_href = get_home_url(); }
					break;

					case 'attachment':
						if ( !empty($id) ) {
							$watermark_href = get_permalink($id);
						}
						else { $watermark_href = get_home_url(); }
					break;

					case 'download':
						if ( !empty($id) ) {
							$watermark_href = site_url('/').'?attachment_id='.$id.'&kgvid_video_embed[download]=true';
						}
						else { $watermark_href = $content; }
					break;

					case 'custom':
					$watermark_href = $query_atts["watermark_url"];
					break;

				}
				$code .= "<a target='_parent' href='".$watermark_href."'>";
			}
			else { $watermark_link = false; }
			$code .= "<img src='".esc_attr($query_atts["watermark"])."' alt='watermark'>";
			if ( $watermark_link ) { $code .= "</a>"; }
			$code .= "</div>";
		} //generate watermark
		$code .= "\t\t</div>"; //end kgvid_XXXX_wrapper div

		$kgvid_video_id++;

	} //end id_array loop

	return apply_filters('kgvid_single_video_code', $code, $query_atts, $atts, $content, $post_id);

}

function kgvid_shortcode_atts($atts) {

	$options = kgvid_get_options();

	if ( in_the_loop() ) { $post_id = get_the_ID(); }
	else { $post_id = 1; }

	$default_atts = array(
		'id' => '',
		'orderby' => 'menu_order ID',
		'order' => 'ASC',
		'videos' => -1,
		'width' => $options['width'],
		'height' => $options['height'],
		'fullwidth' => $options['fullwidth'],
		'align' => $options['align'],
		'controlbar' => $options['controlbar_style'],
		'autohide' => $options['autohide'],
		'poster' => $options['poster'],
		'watermark' => $options['watermark'],
		'watermark_link_to' => $options['watermark_link_to'],
		'watermark_url' => $options['watermark_url'],
		'endofvideooverlay' => $options['endofvideooverlay'],
		'endofvideooverlaysame' => $options['endofvideooverlaysame'],
		'playbutton' => $options['playbutton'],
		'loop' => $options['loop'],
		'autoplay' => $options['autoplay'],
		'streamtype' => $options['stream_type'],
		'scalemode' => $options['scale_mode'],
		'backgroundcolor' => $options['bgcolor'],
		'configuration' => $options['configuration'],
		'skin' => $options['skin'],
		'gallery' => 'false',
		'gallery_per_page' => $options['gallery_per_page'],
		'gallery_thumb' => $options['gallery_thumb'],
		'gallery_orderby' => 'menu_order ID',
		'gallery_order' => 'ASC',
		'gallery_exclude' => '',
		'gallery_include' => '',
		'gallery_id' => $post_id,
		'gallery_end' => $options['gallery_end'],
		'gallery_title' => $options['gallery_title'],
		'volume' => $options['volume'],
		'mute' => $options['mute'],
		'title' => $options['overlay_title'],
		'embedcode' => $options['overlay_embedcode'],
		'view_count' => $options['view_count'],
		'caption' => '',
		'description' => '',
		'inline' => $options['inline'],
		'downloadlink' => $options['downloadlink'],
		'right_click' => $options['right_click'],
		'resize' => $options['resize'],
		'auto_res' => $options['auto_res'],
		'pixel_ratio' => $options['pixel_ratio'],
		'nativecontrolsfortouch' => $options['nativecontrolsfortouch'],
		'jw_player_id' => $options['jw_player_id'],
		'schema' => $options['schema'],
		'track_kind' => 'subtitles',
		'track_srclang' => substr(get_bloginfo('language'), 0, 2),
		'track_src' => '',
		'track_label' => get_bloginfo('language'),
		'track_default' => ''
	);

	$custom_atts_return = array();
	if ( !empty($options['custom_attributes']) ) {
		preg_match_all('/(\w+)\s*=\s*(["\'])((?:(?!\2).)*)\2/', $options['custom_attributes'], $custom_atts, PREG_SET_ORDER);
		if ( !empty($custom_atts) && is_array($custom_atts) ) {
			foreach ( $custom_atts as $custom_att ) {
				if ( array_key_exists($custom_att[1], $default_atts) ) {
					$default_atts[$custom_att[1]] = $custom_att[3];
				}
				else { $default_atts['custom_atts'][$custom_att[1]] = $custom_att[3]; }
			}
		}
	}

	$query_atts = shortcode_atts($default_atts, $atts, 'KGVID');

	$checkbox_convert = array (
		"autohide",
		"endofvideooverlaysame",
		"playbutton",
		"loop",
		"autoplay",
		"title",
		"embedcode",
		"view_count",
		"inline",
		"resize",
		"downloadlink",
		"mute",
		"fullwidth",
		"gallery_title",
		"nativecontrolsfortouch",
		"pixel_ratio",
		"schema"
	);
	foreach ( $checkbox_convert as $query ) {
		if ( $query_atts[$query] == "on" ) { $query_atts[$query] = "true"; }
		if ( $query_atts[$query] == false ) { $query_atts[$query] = "false"; }
	}

	if ( $query_atts['auto_res'] == 'true' ) { $query_atts['auto_res'] = 'automatic'; } //if anyone used auto_res in the shortcode before version 4.4.3
	if ( $query_atts['auto_res'] == 'false' ) { $query_atts['auto_res'] = 'highest'; }
	if ( $query_atts['orderby'] == 'menu_order' ) { $query_atts['orderby'] = 'menu_order ID'; }
	if ( $query_atts['track_default'] == 'true' ) { $query_atts['track_default'] = 'default'; }

	return apply_filters('kgvid_shortcode_atts', $query_atts);

}

function KGVID_shortcode($atts, $content = ''){

	$code = "";
	if ( !is_feed() ) {

		$options = kgvid_get_options();

		kgvid_enqueue_shortcode_scripts();

		if ( in_the_loop() ) { $post_id = get_the_ID(); }
		else { $post_id = 1; }

		$query_atts = kgvid_shortcode_atts($atts);

		if ( $query_atts["gallery"] != "true" ) { //if this is not a pop-up gallery

			$code = kgvid_single_video_code($query_atts, $atts, $content, $post_id);

		} //if not gallery

		else { //if gallery

			static $kgvid_gallery_id = 0;
			$gallery_query_index = array(
				'gallery_orderby',
				'gallery_order',
				'gallery_id',
				'gallery_include',
				'gallery_exclude',
				'gallery_thumb',
				'caption',
				'gallery_end',
				'gallery_per_page',
				'gallery_title'
			);
			$gallery_query_atts = array();
			foreach($gallery_query_index as $index) { $gallery_query_atts[$index] = $query_atts[$index]; };

			wp_enqueue_script( 'simplemodal', plugins_url("/js/jquery.simplemodal.1.4.5.min.js", __FILE__), '', '1.4.5', true );

			if ( $query_atts['align'] == "left" ) { $aligncode = ' kgvid_textalign_left'; }
			if ( $query_atts['align'] == "center" ) { $aligncode = ' kgvid_textalign_center'; }
			if ( $query_atts['align'] == "right" ) { $aligncode = ' kgvid_textalign_right'; }
			if ( $query_atts['inline'] == "true" ) { $aligncode .= ' kgvid_wrapper_inline'; }

			$code .= '<div class="kgvid_gallerywrapper'.$aligncode.'" id="kgvid_gallery_'.$kgvid_gallery_id.'">';
			$code .= kgvid_gallery_page(1, $gallery_query_atts);
			$code .= '</div>'; //end wrapper div

			wp_localize_script( 'kgvid_video_embed', 'kgvid_video_gallery_query_'.$kgvid_gallery_id, $gallery_query_atts ); //add popup video code in footer

			$kgvid_gallery_id++;

		} //if gallery

	} //if not feed

	return apply_filters('KGVID_shortcode', $code, $query_atts, $content);

}
add_shortcode('FMP', 'KGVID_shortcode');
add_shortcode('KGVID', 'KGVID_shortcode');


function kgvid_no_texturize_shortcode($shortcodes){
    $shortcodes[] = 'KGVID';
    $shortcodes[] = 'FMP';
    return $shortcodes;
}
add_filter( 'no_texturize_shortcodes', 'kgvid_no_texturize_shortcode' );

function kgvid_update_child_format() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$video_id = $_POST['video_id'];
	$parent_id = $_POST['parent_id'];
	$format = $_POST['format'];
	if ( isset($_POST['blog_id']) ) { $blog_id = $_POST['blog_id']; }
	else { $blog_id = false; }

	if ( !empty($blog_id) && $blog_id != 'false' ) { switch_to_blog($blog_id); }

	$video_encode_queue = kgvid_get_encode_queue();

	if ( $video_encode_queue ) {

		foreach ( $video_encode_queue as $video_key => $video_entry ) {
			if ( !empty($video_entry['attachmentID']) && $video_entry['attachmentID'] == $parent_id
				&& ( array_key_exists('blog_id', $video_entry) && $video_entry['blog_id'] == $blog_id  || $blog_id == 'false' )
				&& array_key_exists('encode_formats', $video_entry)
				&& array_key_exists($format, $video_entry['encode_formats'])
				&& array_key_exists('status', $video_entry['encode_formats'][$format])
			) {
				$video_encode_queue[$video_key]['encode_formats'][$format]['status'] = 'notchecked';
				kgvid_save_encode_queue($video_encode_queue);
				break;
			}
		}

	}

	$post = get_post($video_id);
	update_post_meta( $video_id, '_kgflashmediaplayer-format', $format );
	update_post_meta( $video_id, '_kgflashmediaplayer-pickedformat', $post->post_parent ); //save the original parent
	$post->post_parent = $parent_id;
	wp_update_post($post);

	if ( !empty($blog_id) && $blog_id != 'false' ) { restore_current_blog(); }

	die();

}
add_action('wp_ajax_kgvid_update_child_format', 'kgvid_update_child_format');

function kgvid_clear_child_format() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$video_id = $_POST['video_id'];
	if ( isset($_POST['blog_id']) ) { $blog_id = $_POST['blog_id']; }
	else { $blog_id = false; }

	if ( $blog_id ) { switch_to_blog($blog_id); }

	delete_post_meta( $video_id, '_kgflashmediaplayer-format' );
	$old_parent = get_post_meta( $video_id, '_kgflashmediaplayer-pickedformat', true );
	delete_post_meta( $video_id, '_kgflashmediaplayer-pickedformat' );
	$post = get_post($video_id);
	if ( is_string( get_post_status( $old_parent ) ) ) { $post->post_parent = $old_parent; }
	wp_update_post($post);

	if ( $blog_id ) { restore_current_blog(); }

	die();

}
add_action('wp_ajax_kgvid_clear_child_format', 'kgvid_clear_child_format');

function kgvid_update_encode_queue() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if ( isset( $_POST['page'] ) ) { $page = $_POST['page']; }
	else { die(); }

	$video_encode_queue = kgvid_get_encode_queue();

	if ( !empty($video_encode_queue) ) {

		foreach ( $video_encode_queue as $video_key => $video_entry ) {

			if ( $page == 'attachment' && array_key_exists('blog_id', $video_entry) && get_current_blog_id() != $video_entry['blog_id'] ) { //remove all entries from other blogs on attachment pages
				unset($video_encode_queue[$video_key]);
				continue;
			}

			if ( !empty($video_entry['movieurl']) && !empty($video_entry['attachmentID']) ) {
				$encodevideo_info = kgvid_encodevideo_info($video_entry['movieurl'], $video_entry['attachmentID']);
			}

			foreach ( $video_entry['encode_formats'] as $format => $value ) {

				if ( !array_key_exists('lastline', $value) ) { $value['lastline'] = ''; }

				$video_encode_queue[$video_key]['encode_formats'][$format]['meta_array'] = kgvid_encode_format_meta($encodevideo_info, $video_key, $format, $value['status'], $value['lastline'], $video_entry['attachmentID'], $video_entry['movieurl'], $page);

			}

		}

	}//if there's a queue

	$arr = array( 'queue' => $video_encode_queue );

	echo json_encode($arr);

	die();

}
add_action('wp_ajax_kgvid_update_encode_queue', 'kgvid_update_encode_queue');

function kgvid_encode_format_meta( $encodevideo_info, $video_key, $format, $status, $lastline, $post_id, $movieurl, $page ) {

	$options = kgvid_get_options();

	$encodeset = "false";
	$checked = "";
	$meta = "";
	$disabled = "";
	$child_id = "";
	$something_to_encode = false;
	$encoding_now = false;
	$time_to_wait = 5000;
	$user_delete_capability = false;

	if ( is_multisite() ) { $blog_id = get_current_blog_id(); }
	else { $blog_id = false; }

	if ( get_post_type($post_id) == "attachment" ) {
		$kgvid_postmeta = kgvid_get_attachment_meta($post_id);
		if ( array_key_exists('encode'.$format, $kgvid_postmeta) ) { $encodeset = $kgvid_postmeta['encode'.$format]; }
		else { $encodeset = 'false'; }
		$post = get_post($post_id);
		$current_user = wp_get_current_user();
		if ( $post && ( $current_user->ID == $post->post_author )
			|| ( current_user_can('edit_others_video_encodes') )
		) {
			$user_delete_capability = true;
		}

	}
	if ( $encodeset == "false" && strpos($format, 'custom_') === false ) { $encodeset = $options['encode_'.$format]; }

	if ( $encodeset == "on" || $status == "queued" ) { $checked = 'checked'; }

	if ( $status != "notchecked" ) { //File is in queue
		$meta = ' <strong>'.ucfirst($status).'</strong>';
		if ( $status == "error" && !empty($lastline) ) {
			$meta .= ': <span class="kgvid_warning">'.stripslashes($lastline)."</span>";
		}
	}

	if ( !empty($encodevideo_info) ) {

		if ( $encodevideo_info[$format]['exists'] ) { //if the video file exists

			if ( array_key_exists('id', $encodevideo_info[$format]) ) {
				$child_id = $encodevideo_info[$format]['id'];
				$was_picked = get_post_meta( $child_id, '_kgflashmediaplayer-pickedformat', true );
			}
			else { $was_picked = false; }

			if ( $status != "encoding" ) { // not currently encoding

				if ( $status == "notchecked" ) {
					if ( $was_picked != false ) { $meta = ' <strong>Set: '.basename($encodevideo_info[$format]['filepath']).'</strong>'; }
					else { $meta = ' <strong>Encoded</strong>'; }
				}
				if ( $status != "canceling" ) {

					if ( $encodevideo_info[$format]['writable']
					&& current_user_can('encode_videos')
					&& $user_delete_capability == true
					&& $format != "fullres" ) {
						if ( $was_picked != false ) {
							$meta .= '<a id="unpick-'.$post_id.'-'.$format.'" class="kgvid_delete-format" onclick="kgvid_clear_video(\''.$movieurl.'\', \''.$post_id.'\', \''.$child_id.'\', \''.$blog_id.'\');" href="javascript:void(0)">'.__('Clear Format', 'video-embed-thumbnail-generator').'</a>';
						}
						else {
							$meta .= '<a id="delete-'.$post_id.'-'.$format.'" class="kgvid_delete-format" onclick="kgvid_delete_video(\''.$movieurl.'\', \''.$post_id.'\', \''.$format.'\', \''.$child_id.'\', \''.$blog_id.'\');" href="javascript:void(0)">'.__('Delete Permanently', 'video-embed-thumbnail-generator').'</a>';
						}
					}
				}
				$disabled = ' disabled title="Format already exists"';
				$checked = '';
			}
		}
		else {

			$something_to_encode = true;

		} //if the video file doesn't exist, there's something to encode
	}

	if ( $status == "encoding" ) {
		$encoding_now = true;
		$disabled = ' disabled title="'.__('Currently encoding', 'video-embed-thumbnail-generator').'"';
		$checked = 'checked';
		$progress = kgvid_encode_progress($video_key, $format, $page);
		$meta = $progress['embed_display'];
		$time_to_wait = $progress['time_to_wait'];
	}

	if ( $status == "Encoding Complete" ) {
		$disabled = ' disabled title="'.__('Format already exists', 'video-embed-thumbnail-generator').'"';
		$checked = '';
	}

	if ( $checked == '' ) { $something_to_encode = true; }

	if ( !current_user_can('encode_videos') ) {
		$disabled = ' disabled title="'.__('You don\'t have permission to encode videos', 'video-embed-thumbnail-generator').'"';
		$something_to_encode = false;
	}

	$meta_array = array( 'checked' => $checked, 'disabled' => $disabled, 'meta' => $meta, 'time_to_wait'=> $time_to_wait, 'something_to_encode' => $something_to_encode, 'encoding_now' => $encoding_now, 'blog_id' => $blog_id );

	return $meta_array;

}

function kgvid_ajax_generate_encode_checkboxes() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	$movieurl = $_POST['movieurl'];
	$post_id = $_POST['post_id'];
	$page = $_POST['page'];
	if ( isset($_POST['blog_id']) ) { $blog_id = $_POST['blog_id']; }
	else { $blog_id = false; }

	if (isset($_POST['encodeformats'])) {
		$encode_checked = $_POST['encodeformats'];
		$kgvid_postmeta = kgvid_get_attachment_meta($post_id);
		foreach ( $encode_checked as $format => $checked ) {
			if ( $checked == "true" ) { $kgvid_postmeta['encode'.$format] = 'on'; }
			else {$kgvid_postmeta['encode'.$format] = 'notchecked'; }
		}
		kgvid_save_attachment_meta($post_id, $kgvid_postmeta);
	}

	$checkboxes = kgvid_generate_encode_checkboxes($movieurl, $post_id, $page, $blog_id);
	echo json_encode($checkboxes);
	die();

}
add_action('wp_ajax_kgvid_generate_encode_checkboxes', 'kgvid_ajax_generate_encode_checkboxes');

function kgvid_generate_encode_checkboxes($movieurl, $post_id, $page, $blog_id = false) {

	global $user_ID;

	$options = kgvid_get_options();
	$video_encode_queue = kgvid_get_encode_queue();
	$video_formats = kgvid_video_formats();

	$video_queued = false;
	$something_to_encode = false;
	$encoding_now = false;
	$encode_disabled = "";
	$post_mime_type = "";
	$actualwidth = "1921";
	$actualheight = "1081";
	$encodevideo_info = array();
	$is_attachment = false;

	if ( !empty($blog_id) && $blog_id != 'false' ) {
		switch_to_blog($blog_id);
		$blog_name_text = '['.$blog_id.']';
		$blog_id_text = $blog_id.'-';
	}
	else {
		$blog_name_text = '';
		$blog_id_text = '';
	}

	if ( !empty($movieurl) ) {

		$encodevideo_info = kgvid_encodevideo_info($movieurl, $post_id);
		$sanitized_url = kgvid_sanitize_url($movieurl);
		$movieurl = $sanitized_url['movieurl'];
		if ( get_post_type($post_id) == "attachment" ) { //if the video is in the database
			$is_attachment = true;
			$kgvid_postmeta = kgvid_get_attachment_meta($post_id);
			$post_mime_type = get_post_mime_type($post_id);
			$dimensions = kgvid_set_video_dimensions($post_id);
			$actualwidth = $dimensions['actualwidth'];
			$actualheight = $dimensions['actualheight'];
			$post = get_post($post_id);
		}
		else { //video's not in the database
			$is_attachment = false;
			unset($video_formats['fullres']);

			$check_mime_type = wp_check_filetype($movieurl);
			$post_mime_type = $check_mime_type['type'];

			if ( !empty($video_encode_queue) ) {
				foreach ($video_encode_queue as $video_key => $video_entry) {
					if ( $video_entry['movieurl'] == $movieurl ) {
						if ( is_array($video_entry) && array_key_exists('movie_info', $video_entry) ) {
							$actualwidth = $video_entry['movie_info']['width'];
							$actualheight = $video_entry['movie_info']['height'];
						}
						break;
					}
				}
			reset($video_encode_queue);
			}

		}
		if ( $post_mime_type == "video/m4v" || $post_mime_type == "video/quicktime" ) { $post_mime_type = "video/mp4"; }

	}//if movieurl is set
	else {
		$encode_disabled = ' disabled title="'.__('Please enter a valid video URL', 'video-embed-thumbnail-generator').'"';
		unset($video_formats['fullres']);
		unset($video_formats['custom_h264']);
		unset($video_formats['custom_webm']);
		unset($video_formats['custom_ogg']);
	}

	if ( $options['ffmpeg_exists'] == "notinstalled" ) {
		$ffmpeg_disabled_text = 'disabled="disabled" title="'.sprintf( _x('%1$s not found at %2$s', 'ex: FFMPEG not found at /usr/local/bin', 'video-embed-thumbnail-generator'), strtoupper($options['video_app']), $options['app_path']).'"';
	}
	else { $ffmpeg_disabled_text = ""; }

	if ( ($is_attachment && $user_ID != $post->post_author && !current_user_can('edit_others_video_encodes') ) || !current_user_can('encode_videos') ) {
		$ffmpeg_disabled_text = ' disabled title="'.__('Insufficient priveleges to encode this video', 'video-embed-thumbnail-generator').'"';
		$security_disabled = true;
	}
	else { $security_disabled = false; }

	$video_key = false;
	if ( !empty($video_encode_queue) && !empty($movieurl) ) {
		foreach ($video_encode_queue as $video_key => $video_entry) {
			if ( $video_entry['movieurl'] == $movieurl ) {
				foreach ( $video_entry['encode_formats'] as $format => $value ) {
					if ( !array_key_exists($format, $video_formats) && $value['status'] != 'notchecked' ) {
						$video_formats[$format]['name'] = $value['name'];
						if ( array_key_exists('filepath', $value) && file_exists($value['filepath']) ) {
							$encodevideo_info[$format]['exists'] = true;
							if ( is_writable($value['filepath']) ) { $encodevideo_info[$format]['writable'] = true; }
							else { $encodevideo_info[$format]['writable'] = false; }
						}
						else {
							$encodevideo_info[$format]['exists'] = false;
							$encodevideo_info[$format]['writable'] = false;
						}
						$video_formats[$format]['status'] = $value['status'];
					}
					elseif ( array_key_exists($format, $video_formats) ) { //don't recreate any formats that were previously unset
						$video_formats[$format]['status'] = $value['status'];
					}
					if ( array_key_exists('lastline', $video_entry['encode_formats'][$format]) ) {
						$video_formats[$format]['lastline'] = $video_entry['encode_formats'][$format]['lastline'];
					}
				}
				$video_queued = true;
				break;
			}
		}
	}

	if ( $post_mime_type == 'image/gif' ) {
		$fullres_only = array('fullres');
		$video_formats = array_intersect_key($video_formats, array_flip($fullres_only));
	}

	$checkboxes = '<div id="attachments-'.$blog_id_text.$post_id.'-kgflashmediaplayer-encodeboxes" class="kgvid_checkboxes_section"><ul>';

	foreach ( $video_formats as $format => $format_stats ) {

		if ( strpos($post_mime_type, $format) !== false ) { continue; } //skip webm or ogv checkbox if the video is webm or ogv

		if ( empty($movieurl) ) { $disabled[$format] = ' disabled title="Please enter a valid video URL"'; }

		if ( !array_key_exists('status', $format_stats) ) { $format_stats['status'] = "notchecked"; } //if this video isn't in the queue

		if ( $format_stats['status'] == "lowres" ||
			(
				$actualheight != "" && ($format == "1080" || $format == "720") &&
				(
					( strpos($post_mime_type, "mp4") !== false && $actualheight <= $format_stats['height'] ) ||
					( strpos($post_mime_type, "mp4") === false && $actualheight < $format_stats['height'] )
				)
			)
		) { continue; } //if the format is bigger than the original video, skip the checkbox

		if ( !empty($encodevideo_info) && !$encodevideo_info[$format]['exists'] && strpos($format, 'custom_') === 0 ) { continue; } //skip custom formats that don't exist

		if ( $format == 'fullres' ) {

			if ( $encodevideo_info['fullres']['exists'] == true && $format_stats['status'] != "encoding" ) {
				unlink($encodevideo_info[$format]['filepath']);
				$encodevideo_info['fullres']['exists'] = false;
			}

			if ( isset($kgvid_postmeta)
				&& array_key_exists('original_replaced', $kgvid_postmeta)
				&& $kgvid_postmeta['original_replaced'] == $options['replace_format']
			) {
				$format_stats['name'] = sprintf( _x('%s again', 'Replace original with full resolution format again', 'video-embed-thumbnail-generator'), $format_stats['name']);
			}

		}

		if ( !array_key_exists('lastline', $format_stats) ) { $format_stats['lastline'] = ''; }
		$meta_array = kgvid_encode_format_meta($encodevideo_info, $video_key, $format, $format_stats['status'], $format_stats['lastline'], $post_id, $movieurl, $page);

		if ( $meta_array['something_to_encode'] == true ) { $something_to_encode = true; }
		if ( $meta_array['encoding_now'] == true ) { $encoding_now = true; }

		$checkboxes .= "\n\t\t\t".'<li><input class="kgvid_encode_checkbox" type="checkbox" id="attachments-'.$blog_id_text.$post_id.'-kgflashmediaplayer-encode'.$format.'" name="attachments'.$blog_name_text.'['.$post_id.'][kgflashmediaplayer-encode'.$format.']" '.$meta_array['checked'].' '.$ffmpeg_disabled_text.$meta_array['disabled'].'> <label for="attachments-'.$blog_id_text.$post_id.'-kgflashmediaplayer-encode'.$format.'">'.$format_stats['name'].'</label> <span id="attachments-'.$blog_id_text.$post_id.'-kgflashmediaplayer-meta'.$format.'" class="kgvid_format_meta">'.$meta_array['meta'].'</span>';

		if ( !$security_disabled && $is_attachment && empty($meta_array['disabled']) && $format != 'fullres' && $page != 'queue' ) { $checkboxes .= "<span id='pick-".$post_id."-".$format."' class='button-secondary kgvid_encode_checkbox_button' data-choose='".sprintf( __('Choose %s', 'video-embed-thumbnail-generator'), $format_stats['name'] )."' data-update='".sprintf( __('Set as %s', 'video-embed-thumbnail-generator'), $format_stats['name'] )."' onclick='kgvid_pick_format(this, \"".$post_id."\", \"".esc_attr($format_stats['mime'])."\", \"".$format."\", \"".esc_attr($movieurl)."\", \"".$blog_id."\");'>".__('Choose from Library', 'video-embed-thumbnail-generator')."</span>";
		}
		$checkboxes .= '</li>';

	}//end format loop

	$checkboxes .= '</ul>';

	if ( $something_to_encode == false ) {
		$encode_disabled = ' disabled title="'.__('Nothing to encode', 'video-embed-thumbnail-generator').'" style="display:none;"';
	}

	if ( $page == "queue" ) {
		$button_text = _x('Update', 'Button text', 'video-embed-thumbnail-generator');
		$checkboxes .= "\n\t\t\t".'<input type="hidden" name="attachments'.$blog_name_text.'['.$post_id.'][kgflashmediaplayer-url]" value="'.$movieurl.'">';
	}
	else { $button_text = _x('Encode selected', 'Button text', 'video-embed-thumbnail-generator'); }

	$checkboxes .= '<input type="button" id="attachments-'.$blog_id_text.$post_id.'-kgflashmediaplayer-encode" name="attachments'.$blog_name_text.'['.$post_id.'][kgflashmediaplayer-encode]" class="button-secondary" value="'.$button_text.'" onclick="kgvid_enqueue_video_encode(\''.$post_id.'\', \''.$blog_id.'\');" '.$ffmpeg_disabled_text.$encode_disabled.'/><div style="display:block;" id="attachments-'.$blog_id_text.$post_id.'-encodeplaceholder"></div>';

	if ( $page != "queue" ) {
		$checkboxes .= '<small><em>'.__('Generates additional video formats compatible with most mobile & HTML5-compatible browsers', 'video-embed-thumbnail-generator').'</em></small>';
	}

	if ( $video_queued == true ) {
		while ( count($video_formats) > 0 ) {
			$last_format = array_pop( $video_formats );
			if ( array_key_exists('status', $last_format) && $last_format['status'] != "notchecked" ) { break; } //get the final queued format
		}

		if ( !$encoding_now && ($last_format['status'] == "queued" || $last_format['status'] == "canceling") ) {
			$checkboxes .= '<script type="text/javascript">percent_timeout = setTimeout(function(){ kgvid_redraw_encode_checkboxes("'.$video_entry['movieurl'].'", "'.$video_entry['attachmentID'].'", "'.$page.'", "'.$blog_id.'") }, 5000); jQuery(\'#wpwrap\').data("KGVIDCheckboxTimeout", percent_timeout);</script>';
		}

		if ( $encoding_now ) {
			$checkboxes .= '<script type="text/javascript">percent_timeout = setTimeout(function(){ kgvid_update_encode_queue() }, 5000);</script>';
		}
	}
	$checkboxes .= '</div>'; //close encodeboxes div

	if ( !empty($blog_id) && $blog_id != 'false' ) { restore_current_blog(); }

	$arr = array('checkboxes'=>$checkboxes, 'encoding'=>$encoding_now );

	return $arr;
}

function kgvid_generate_queue_table_header() {

	$table_headers = array( _x('Order', 'noun, column header', 'video-embed-thumbnail-generator'),
		_x('User', 'username, column header', 'video-embed-thumbnail-generator'),
		_x('Thumbnail', 'noun, column header', 'video-embed-thumbnail-generator'),
		_x('File', 'noun, column header', 'video-embed-thumbnail-generator'),
		_x('Formats', 'noun, column header', 'video-embed-thumbnail-generator'),
		_x('Actions', 'noun, column header', 'video-embed-thumbnail-generator')
	);

	if ( is_network_admin() ) {
		array_splice( $table_headers, 2, 0, array( _x('Site', 'multisite site name, column header', 'video-embed-thumbnail-generator') ) );
	}

	$code = "<tr>";
	foreach ( $table_headers as $header ) {
		$code .= "<th>".$header."</th>";
	}
	$code .= "</tr>\n";

	return $code;

}

function kgvid_generate_queue_table( $scope = 'site' ) {

	$html = "";
	$current_user = wp_get_current_user();
	$video_encode_queue = kgvid_get_encode_queue();
	$nonce = wp_create_nonce('video-embed-thumbnail-generator-nonce');

	$crons = _get_cron_array();

	if ( $crons ) {
		foreach ( $crons as $timestamp => $cron_job ) {
			if ( is_array($cron_job) && array_key_exists('kgvid_cron_new_attachment', $cron_job) ) {
				foreach ( $cron_job['kgvid_cron_new_attachment'] as $id => $cron_info ) {
					if ( is_array($cron_info) && array_key_exists('args', $cron_info) ) {
						$post = get_post($cron_info['args'][0]);
						if ( $post ) {
							$video_encode_queue[] = array(
								'attachmentID' => $post->ID,
								'parent_id' => $post->post_parent,
								'movieurl' => wp_get_attachment_url( $post->ID ),
								'encode_formats' => 'temp'
							);
						}
					}
				}
			}
		}
	}

	if ( is_network_admin() || 'network' == $scope ) { $total_columns = 8; }
	else { $total_columns = 7; }

	if ( !empty($video_encode_queue) ) {

		$video_formats = kgvid_video_formats();
		$currently_encoding = array();
		$queued = array();

		$html .= "<input type='hidden' name='attachments[kgflashmediaplayer-security]' value='".$nonce."' />";

		foreach ( $video_encode_queue as $order => $video_entry ) {

			if ( array_key_exists('blog_id', $video_entry) ) {

				$blog_id = $video_entry['blog_id'];
				$blog_name_text = '['.$blog_id.']';
				$blog_id_text = $blog_id.'-';

				$same_blog = true;

				if ( $video_entry['blog_id'] == get_current_blog_id() ) {
					$same_blog = true;
				}
				else {
					$same_blog = false;
					if ( is_network_admin() || $scope == "network" ) { switch_to_blog($blog_id); }
				}

			}
			else {
				$blog_id = false;
				$blog_name_text = '';
				$blog_id_text = '';
				$same_blog = true;
			}

			$html .= "\t<tr id='tr-".$blog_id_text.$video_entry['attachmentID']."'";

			if ( is_array($video_entry['encode_formats']) ) {
				foreach ( $video_formats as $format => $format_stats ) {

					if ( array_key_exists($format, $video_entry['encode_formats']) && array_key_exists('status', $video_entry['encode_formats'][$format]) ) {

						if ( $video_entry['encode_formats'][$format]['status'] == "encoding" ) {
							$currently_encoding[$order] = true;
							break;
						}
						else if ( $video_entry['encode_formats'][$format]['status'] == "queued" ) {
							$queued[$order] = true;
						}
						else {
							if ( !array_key_exists($order, $currently_encoding) ) { $currently_encoding[$order] = false; }
							if ( !array_key_exists($order, $queued) ) { $queued[$order] = false; }
						}

					}
				}
			}
			else {
				$currently_encoding[$order] = false;
				$queued[$order] = false;
			}

			if ( $currently_encoding[$order] ) { $html .= " class='currently_encoding' "; }
			elseif ( $queued[$order] ) { $html .= " class='kgvid_queued' "; }
			else { $html .= " class='kgvid_complete' "; }

			$html .= ">";

			//Order
			$html .= "<td id='td-".$blog_id_text.$video_entry['attachmentID']."'>".strval(intval($order)+1)."</td>\n";

			//User
			$post = get_post( $video_entry['attachmentID'] );

			if ( ( is_network_admin() || 'network' == $scope )
				|| ( $same_blog && $post && $current_user->ID == $post->post_author )
				|| ( current_user_can('edit_others_video_encodes') && $same_blog )
			) {

				if ( array_key_exists('user_id', $video_entry) && !empty($video_entry['user_id']) ) {
					$user = get_userdata($video_entry['user_id']);
					$html .= "<td>".$user->display_name."</td>\n";
				}
				elseif ( $post )  {
					$user = get_userdata( $post->post_author );
					$html .= "<td>".$user->display_name."</td>\n";
				}
				else { $html .= "<td></td>\n"; }

				//Site
				if ( (is_network_admin() || 'network' == $scope) && $blog_id ) {
					$blog_details = get_bloginfo();
					$html .= "<td><a href='".get_admin_url($blog_id)."'>".$blog_details."</a><input type='hidden' name='attachments[blog_id][".$video_entry['attachmentID']."]' value='".$blog_id."'></td>\n";
				}

				//Thumbnail
				$thumbnail_url = get_post_meta($video_entry['attachmentID'], "_kgflashmediaplayer-poster", true);
				$thumbnail_html = "";
				if ($thumbnail_url != "" ) {
					$thumbnail_html = '<img width="100" src="'.$thumbnail_url.'">';
				}

				//File
				if ( $post && $post->post_type == "attachment" ) {
					$moviefilepath = get_attached_file($video_entry['attachmentID']);
					$attachmentlink = get_admin_url()."post.php?post=".$video_entry['attachmentID']."&action=edit";
				}
				else {
					$moviefilepath = $video_entry['movieurl'];
					$attachmentlink = $video_entry['movieurl'];
				}
				$html .= "\t\t\t\t\t<td><a href='".$attachmentlink."'> ".$thumbnail_html."</a></td>\n";
				$path_info = pathinfo($moviefilepath);
				$file_name =  basename($moviefilepath,'.'.$path_info['extension']);
				$html .= "\t\t\t\t\t<td><a href='".$attachmentlink."'>".urldecode($file_name)."</a><input type='hidden' name='attachments".$blog_name_text."[".$video_entry['attachmentID']."][kgflashmediaplayer-url]' value='".$video_entry['movieurl']."'></td>\n";

				//Formats
				$html .= "\t\t\t\t\t<td class='queue_encode_formats' id='formats_".$video_entry['attachmentID']."'>";
				$html .= "<input type='hidden' id='attachments-".$blog_id_text.$video_entry['attachmentID']."-kgflashmediaplayer-security' name='attachments".$blog_name_text."[".$video_entry['attachmentID']."][kgflashmediaplayer-security]' value='".$nonce."' />";

				if ( is_array($video_entry['encode_formats']) ) { $checkboxes = kgvid_generate_encode_checkboxes($video_entry['movieurl'], $video_entry['attachmentID'], 'queue', $blog_id); }
				else { $checkboxes = array('checkboxes' => __('Please wait while this video is automatically added to the queue...', 'video-embed-thumbnail-generator') ); }
				$html .= $checkboxes['checkboxes'];
				$html .= "</td>\n";

				//Actions
				$html .= "\t\t\t\t\t<td>";
				$html .= "<a id='clear-".$blog_id_text.$video_entry['attachmentID']."' class='submitdelete' href='javascript:void(0)' onclick='kgvid_encode_queue(\"delete\", ".$order.", ".$video_entry['attachmentID'].", \"".$blog_id."\")'";
				if ( $currently_encoding[$order] ) { $html .= " style='display:none;'"; }
				$html .= ">Clear</a>";

			}//end if current user can see this stuff
			elseif ( $same_blog == false ) {
				$html .= "<td colspan='".strval($total_columns-1)."'><strong class='kgvid_queue_message'>".__("Other site's video", 'video-embed-thumbnail-generator')."</strong></td>";
			}
			else {
				$html .= "<td colspan='".strval($total_columns-1)."'><strong class='kgvid_queue_message'>".__("Other user's video", 'video-embed-thumbnail-generator')."</strong></td>";
			}
			$html .= "</td></tr>\n";

			if ( (is_network_admin() || 'network' == $scope) && $blog_id ) { restore_current_blog(); }

		}
	}

	if ( empty($html) || $html == "<input type='hidden' name='attachments[kgflashmediaplayer-security]' value='".$nonce."' />" ) { $html = "\t<tr><td colspan='".strval($total_columns)."'><strong class='kgvid_queue_message'>".__('Queue is empty', 'video-embed-thumbnail-generator')."</strong></td></tr>\n"; }

return $html;

}

function kgvid_add_FFMPEG_Queue_Page() {
	$options = kgvid_get_options();
	if ( $options['ffmpeg_exists'] == "on" ) { //only add the queue page if FFMPEG is installed
		add_submenu_page('tools.php', _x('Video Embed & Thumbnail Generator Encoding Queue', 'Tools page title', 'video-embed-thumbnail-generator'), _x('Video Encode Queue', 'Title in admin sidebar', 'video-embed-thumbnail-generator'), 'encode_videos', 'kgvid_video_encoding_queue', 'kgvid_FFMPEG_Queue_Page');
	}
}
add_action('admin_menu', 'kgvid_add_FFMPEG_Queue_Page');

function kgvid_add_network_queue_page() {
	if ( function_exists( 'is_plugin_active_for_network' ) && is_plugin_active_for_network( plugin_basename(__FILE__) ) ) {
		add_submenu_page('settings.php', _x('Video Embed & Thumbnail Generator Encoding Queue', 'Tools page title', 'video-embed-thumbnail-generator'), _x('Network Video Encode Queue', 'Title in network admin sidebar', 'video-embed-thumbnail-generator'), 'manage_network', 'kgvid_network_video_encoding_queue', 'kgvid_FFMPEG_Queue_Page');
	}
}
add_action('network_admin_menu', 'kgvid_add_network_queue_page');

function kgvid_FFMPEG_Queue_Page() {

	wp_enqueue_media();

?>
	<div class="wrap">
		<div id="icon-tools" class="icon32"><br /></div>
		<h1><?php _e('Video Embed & Thumbnail Generator Encoding Queue', 'video-embed-thumbnail-generator') ?></h1>
		<p></p>
		<form method="post" action="tools.php?page=kgvid_video_encoding_queue">
		<?php wp_nonce_field('video-embed-thumbnail-generator-nonce','video-embed-thumbnail-generator-nonce'); ?>

		<table class="widefat" id="kgvid_encode_queue_table">
			<thead>
				<?php echo kgvid_generate_queue_table_header(); ?>
			</thead>
			<tfoot>
				<?php echo kgvid_generate_queue_table_header(); ?>
			</tfoot>
			<tbody class="rows">
				<?php echo kgvid_generate_queue_table(); ?>
			</tbody>
		</table>
		<p>
			<?php if ( current_user_can('edit_others_video_encodes') ) { echo "<div class='attachment-info'><div class='actions'><a href='javascript:void(0)' onclick='kgvid_encode_queue(\"clear_completed\", 0, 0);'>". __('Clear All Completed', 'video-embed-thumbnail-generator') ."</a> | <a href='javascript:void(0)' onclick='kgvid_encode_queue(\"clear_queued\", 0, 0, \"\");'>". __('Clear All Queued', 'video-embed-thumbnail-generator') ."</a> | <a href='javascript:void(0)' onclick='kgvid_encode_queue(\"clear_all\", 0, 0, \"\");'>". __('Clear All', 'video-embed-thumbnail-generator') ."</a></div></div>"; } ?>
		</p>
		</form>
	</div>
<?php

kgvid_encode_videos();

}

function kgvid_add_network_settings_page() {
		add_submenu_page('settings.php', _x('Video Embed & Thumbnail Generator', 'Settings page title', 'video-embed-thumbnail-generator'), _x('Video Embed & Thumbnail Generator', 'Settings page title in admin sidebar', 'video-embed-thumbnail-generator'), 'manage_network_options', __FILE__, 'kgvid_network_settings_page' );
}
add_action('network_admin_menu', 'kgvid_add_network_settings_page');

function kgvid_validate_network_settings($input) {

	$options = get_site_option( 'kgvid_video_embed_network_options' );
	$default_options = kgvid_default_network_options();

	if ( $input['app_path'] != $options['app_path'] || $input['video_app'] != $options['video_app'] ) {
		$input = kgvid_validate_ffmpeg_settings($input);
	}
	else { $input['ffmpeg_exists'] = $options['ffmpeg_exists']; }

	// load all settings and make sure they get a value of false if they weren't entered into the form
	foreach ( $default_options as $key => $value ) {
		if ( !array_key_exists($key, $input) ) { $input[$key] = false; }
	}

	return $input;

}

function kgvid_network_settings_page() {

	$network_options = get_site_option( 'kgvid_video_embed_network_options' );

	if (isset($_POST['action']) && $_POST['action'] == 'update_kgvid_network_settings') {

		$nonce = $_POST['kgvid_settings_security'];
		if ( ! wp_verify_nonce( $nonce, 'video-embed-thumbnail-generator-nonce' ) ) { die; }
		else {

			if (isset ($_POST["video-embed-thumbnail-generator-reset"])) { //reset button pressed
				$default_network_options = kgvid_default_network_options();
				$options_updated = update_site_option( 'kgvid_video_embed_network_options', $default_network_options );
				add_settings_error( __FILE__, "options-reset", __("Video Embed & Thumbnail Generator network settings reset to default values.", 'video-embed-thumbnail-generator'), "updated" );
			}
			else { //save button pressed
				$input = $_POST['kgvid_video_embed_options'];
				$validated_options = kgvid_validate_network_settings($input);
				$options_updated = update_site_option( 'kgvid_video_embed_network_options', $validated_options );
			}
		}

	}

	?>
	<div class="wrap">
		<div class="icon32" id="icon-options-general"><br></div>
		<h1>Video Embed & Thumbnail Generator Network Settings</h1>
		<?php settings_errors( __FILE__ ); ?>
		<form method="post">
		<input type="hidden" name="action" value="update_kgvid_network_settings" />
		<input type="hidden" name="kgvid_settings_security" id="kgvid_settings_security" value="<?php echo wp_create_nonce('video-embed-thumbnail-generator-nonce'); ?>">
		<table class='form-table'>
			<tbody>
				<tr valign='middle'>
					<th scope='row'><label for='app_path'><?php _e('Path to applications on the server:', 'video-embed-thumbnail-generator'); ?></label></th>
					<td><?php kgvid_app_path_callback(); ?></td>
				</tr>
					<th scope='row'><label for='video_app'><?php _e('Application for thumbnails & encoding:', 'video-embed-thumbnail-generator'); ?></label></th>
					<td><?php kgvid_video_app_callback(); ?></td>
				</tr>
				<tr>
					<th scope='row'><label for='moov'><?php _e('Method to fix encoded H.264 headers for streaming:', 'video-embed-thumbnail-generator'); ?></label></th>
					<td><?php kgvid_moov_callback(); ?></td>
				</tr>
				<tr>
					<th scope='row'><label for='video_bitrate_flag'><?php _e('FFMPEG legacy options:', 'video-embed-thumbnail-generator'); ?></label></th>
					<td><?php kgvid_ffmpeg_options_callback(); ?></td>
				</tr>
				<tr>
					<th scope='row'><label for='video_app'><?php _e('Execution:', 'video-embed-thumbnail-generator'); ?></label></th>
					<td><?php kgvid_execution_options_callback(); ?></td>
				</tr>
				<tr>
					<th scope='row'><label><?php _e('User capabilties for new sites:', 'video-embed-thumbnail-generator'); ?></label></th>
					<td><?php kgvid_user_roles_callback('network'); ?></td>
				</tr>
				<tr>
					<th scope='row'><label><?php _e('Super Admins only:', 'video-embed-thumbnail-generator'); ?></label></th>
					<td><?php kgvid_superadmin_capabilities_callback(); ?></td>
				</tr>
			</tbody>
		</table>
		<p class='submit'>
   		   <?php submit_button(__('Save Changes', 'video-embed-thumbnail-generator'), 'primary', 'kgvid_submit', false, array( 'onclick' => "jQuery('form :disabled').prop('disabled', false);" ) ); ?>
   		   <?php submit_button(__('Reset Options', 'video-embed-thumbnail-generator'), 'secondary', 'video-embed-thumbnail-generator-reset', false); ?>
   		</p>
   		</form>
   		<div class="kgvid-donate-box wp-core-ui wp-ui-highlight">
		<span><?php _e('If you\'re getting some use out of this plugin, please consider donating a few dollars to support its future development.', 'video-embed-thumbnail-generator') ?></span>
		<a href="http://www.kylegilman.net/plugin-donation/"><img alt="Donate" src="https://www.paypal.com/en_US/i/btn/btn_donateCC_LG.gif"></a>
		</div>
		<script type='text/javascript'>
				jQuery(document).ready(function() {
						kgvid_hide_plugin_settings();
						kgvid_moov_setting();
						jQuery('form :input').change(function() {
							kgvid_save_plugin_settings(this);
						});
					}
				);
		</script>
	</div>
	<?php
}

function kgvid_superadmin_capabilities_callback() {

	$network_options = get_site_option('kgvid_video_embed_network_options');
	echo "<input ".checked( $network_options['superadmin_only_ffmpeg_settings'], "on", false )." id='superadmin_only_ffmpeg_settings' name='kgvid_video_embed_options[superadmin_only_ffmpeg_settings]' type='checkbox' /> <label for='superadmin_only_ffmpeg_settings'>".sprintf( _x('Access %s settings tab.', 'Access FFMPEG settings tab', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($network_options['video_app'])."</strong>" )."</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__( sprintf( 'Only Super admins will be allowed to view and modify %s settings.', "<strong class='video_app_name'>".strtoupper($network_options['video_app'])."</strong>" ), 'video-embed-thumbnail-generator' )."</span></a><br>\n\t";

	echo "<div class='kgvid_video_app_required'>";
	echo __('Email all encoding errors on the network to:', 'video-embed-thumbnail-generator')." <select id='network_error_email' name='kgvid_video_embed_options[network_error_email]'>";
	$network_super_admins = get_super_admins();
	if ( $network_super_admins ) {
		$authorized_users = array();
		foreach ( $network_super_admins as $network_super_admin ) {
			$user = get_user_by('login', $network_super_admin);
			$authorized_users[$network_super_admin] = $user->ID;
		}
	}
	$items = array_merge( array(
		__('Nobody', 'video-embed-thumbnail-generator') => 'nobody',
		__('User who initiated encoding', 'video-embed-thumbnail-generator') => 'encoder'
		), $authorized_users
	);
	foreach($items as $name=>$value) {
		$selected = ($network_options['network_error_email']==$value) ? 'selected="selected"' : '';
		echo "<option value='$value' $selected>$name</option>";
	}
	echo "</select> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __( 'Can also be set on individual sites if the %s settings tab isn\'t disabled.' , 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($network_options['video_app'])."</strong>" )."</a></span>";
	echo "</div>\n\t";

}

function kgvid_add_settings_page() {
		add_options_page( _x('Video Embed & Thumbnail Generator', 'Settings page title', 'video-embed-thumbnail-generator'), _x('Video Embed & Thumbnail Generator', 'Settings page title in admin sidebar', 'video-embed-thumbnail-generator'), 'manage_options', __FILE__, 'kgvid_settings_page' );
}
add_action('admin_menu', 'kgvid_add_settings_page');

function kgvid_settings_page() {
	wp_enqueue_media();
	$options = kgvid_get_options();
	$network_options = get_site_option('kgvid_video_embed_network_options');
	$video_app = $options['video_app'];
	if ( $video_app == "avconv" ) { $video_app = "libav"; }
	?>
	<div class="wrap">
		<div class="icon32" id="icon-options-general"><br></div>
		<h1>Video Embed & Thumbnail Generator</h1>
		<?php if ( !is_multisite()
			|| ( function_exists( 'is_plugin_active_for_network' ) && is_plugin_active_for_network( plugin_basename(__FILE__) ) && $options['ffmpeg_exists'] == "on" && is_array($network_options) && (is_super_admin() || $network_options['superadmin_only_ffmpeg_settings'] == false) )
			) { ?>
		<h2 class="nav-tab-wrapper">
			<a href="#general" id="general_tab" class="nav-tab" onclick="kgvid_switch_settings_tab('general');"><?php _ex('General', 'Adjective, tab title', 'video-embed-thumbnail-generator') ?></a>
			<a href="#encoding" id="encoding_tab" class="nav-tab" onclick="kgvid_switch_settings_tab('encoding');"><?php printf( _x('%s Settings', 'FFMPEG Settings, tab title', 'video-embed-thumbnail-generator'), "<span class='video_app_name'>".strtoupper($video_app)."</span>" ); ?></a>
		</h2>
		<?php } ?>
		<form method="post" action="options.php">
		<?php settings_fields('kgvid_video_embed_options'); ?>
		<input type="hidden" id="kgvid_settings_security" value="<?php echo wp_create_nonce('video-embed-thumbnail-generator-nonce'); ?>">
		<?php do_settings_sections(__FILE__); ?>
     	<p class='submit'>
   		   <?php submit_button(__('Save Changes', 'video-embed-thumbnail-generator'), 'primary', 'kgvid_submit', false, array( 'onclick' => "jQuery('form :disabled').prop('disabled', false);" ) ); ?>
   		   <?php submit_button(__('Reset Options', 'video-embed-thumbnail-generator'), 'secondary', 'video-embed-thumbnail-generator-reset', false); ?>
   		</p>
		</form>
		<div class="kgvid-donate-box wp-core-ui wp-ui-highlight">
		<span><?php _e('If you\'re getting some use out of this plugin, please consider donating a few dollars to support its future development.', 'video-embed-thumbnail-generator') ?></span>
		<a href="http://www.kylegilman.net/plugin-donation/"><img alt="Donate" src="https://www.paypal.com/en_US/i/btn/btn_donateCC_LG.gif"></a>
		</form>
		</div>
		<script type='text/javascript'>
			jQuery(document).ready(function() {
					kgvid_switch_settings_tab(document.URL.substr(document.URL.indexOf('#')+1));
					jQuery('form :input').change(function() {
  						kgvid_save_plugin_settings(this);
					});
				}
			);
		</script>
	</div>
<?php
}

function kgvid_video_embed_options_init() {

	//check for network options in 'admin_init' because is_plugin_active_for_network is not defined in 'init' hook
	if ( function_exists( 'is_plugin_active_for_network' ) && is_plugin_active_for_network( plugin_basename(__FILE__) ) ) {

		$network_options = get_site_option( 'kgvid_video_embed_network_options' );

		if( !is_array($network_options) ) { //if the network options haven't been set yet

			switch_to_blog(1);
			$options = get_option('kgvid_video_embed_options');
			$network_options = kgvid_default_network_options();
			if ( is_array($options) ) {
				$network_options = array_intersect_key($network_options, $options); //copy options from main blog to network
				$network_options['default_capabilities'] = $options['capabilities'];
				if ( !array_key_exists('simultaneous_encodes', $network_options) ) { $network_options['simultaneous_encodes'] = 1; }
			}
			restore_current_blog();

			if ( !isset($network_options['ffmpeg_exists']) || $network_options['ffmpeg_exists'] == "notchecked" ) {
				$ffmpeg_info = kgvid_check_ffmpeg_exists($network_options, false);
				if ( $ffmpeg_info['ffmpeg_exists'] == true ) { $network_options['ffmpeg_exists'] = "on"; }
				$network_options['app_path'] = $ffmpeg_info['app_path'];
			}
			update_site_option('kgvid_video_embed_network_options', $network_options);

		}//end setting initial network options
		else { //network options introduced in version 4.3 exist already

			$network_options_old = $network_options;

			if ( !array_key_exists('superadmin_only_ffmpeg_settings', $network_options) ) {
				$default_network_options = kgvid_default_network_options();
				$network_options['superadmin_only_ffmpeg_settings'] = $default_network_options['superadmin_only_ffmpeg_settings'];
			}

			if ( !array_key_exists('network_error_email', $network_options) ) {
				$network_options['network_error_email'] = 'nobody';
			}

			if ( $network_options_old != $network_options ) {
				update_site_option('kgvid_video_embed_network_options', $network_options);
			}

		}


		$network_queue = get_site_option('kgvid_video_embed_queue');

		if ( is_array($network_options) && array_key_exists('ffmpeg_exists', $network_options) && 'on' == $network_options['ffmpeg_exists']
 		&& false === $network_queue ) { //if the network queue hasn't been set yet

			$sites = wp_get_sites();

			if ( is_array($sites) ) {
				$network_queue = array();
				foreach ( $sites as $site ) {

					$site_queue = get_blog_option($site['blog_id'], 'kgvid_video_embed_queue');
					if ( is_array($site_queue) ) {
						foreach ( $site_queue as $index => $entry ) {
							$site_queue[$index]['blog_id'] = $site['blog_id'];
						}
						$network_queue = array_merge($network_queue, $site_queue);
						delete_blog_option($site['blog_id'], 'kgvid_video_embed_queue');
					}

				}//end loop through sites
				array_multisort($network_queue);
				update_site_option( 'kgvid_video_embed_queue', $network_queue );
			}

		}//end copying site queues to network
	}//end network activation setup

	register_setting('kgvid_video_embed_options', 'kgvid_video_embed_options', 'kgvid_video_embed_options_validate' );

	$options = kgvid_get_options();

	add_settings_section('kgvid_video_embed_playback_settings', __('Default Video Playback Settings', 'video-embed-thumbnail-generator'), 'kgvid_plugin_playback_settings_section_callback', __FILE__);
	add_settings_section('kgvid_video_embed_flash_settings', __('The following options will only affect Flash playback', 'video-embed-thumbnail-generator'), 'kgvid_plugin_flash_settings_section_callback', __FILE__);
	add_settings_section('kgvid_video_embed_plugin_settings', __('Plugin Settings', 'video-embed-thumbnail-generator'), 'kgvid_plugin_settings_section_callback', __FILE__);
	add_settings_section('kgvid_video_embed_encode_settings', __('Video Encoding Settings', 'video-embed-thumbnail-generator'), 'kgvid_encode_settings_section_callback', __FILE__);

	add_settings_field('poster', __('Default thumbnail:', 'video-embed-thumbnail-generator'), 'kgvid_poster_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'poster' ) );
	add_settings_field('endofvideooverlay', __('End of video image:', 'video-embed-thumbnail-generator'), 'kgvid_endofvideooverlay_callback', __FILE__, 'kgvid_video_embed_playback_settings' );
	add_settings_field('watermark', __('Watermark overlay:', 'video-embed-thumbnail-generator'), 'kgvid_watermark_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'watermark' ) );
	add_settings_field('align', __('Video alignment:', 'video-embed-thumbnail-generator'), 'kgvid_align_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'align' ) );
	add_settings_field('resize', __('Automatically adjust videos:', 'video-embed-thumbnail-generator'), 'kgvid_resize_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'resize' ) );
	add_settings_field('dimensions', __('Max embedded video dimensions:', 'video-embed-thumbnail-generator'), 'kgvid_dimensions_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'width' ) );
	add_settings_field('gallery_options', __('Video gallery:', 'video-embed-thumbnail-generator'), 'kgvid_video_gallery_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'gallery_width' ) );
	add_settings_field('controlbar_style', __('Video controls:', 'video-embed-thumbnail-generator'), 'kgvid_controlbar_style_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'controlbar_style' ) );
	add_settings_field('autoplay', __('Autoplay:', 'video-embed-thumbnail-generator'), 'kgvid_autoplay_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'autoplay' ) );
	add_settings_field('loop', _x('Loop:', 'verb', 'video-embed-thumbnail-generator'), 'kgvid_loop_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'loop' ) );
	add_settings_field('audio', __('Volume:', 'video-embed-thumbnail-generator'), 'kgvid_audio_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'volume' ) );
	add_settings_field('preload', __('Preload:', 'video-embed-thumbnail-generator'), 'kgvid_preload_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'preload' ) );
	add_settings_field('js_skin', _x('Skin class:', 'CSS class for video skin', 'video-embed-thumbnail-generator'), 'kgvid_js_skin_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'js_skin' ) );
	add_settings_field('nativecontrolsfortouch', __('Native controls:', 'video-embed-thumbnail-generator'), 'kgvid_nativecontrolsfortouch_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'nativecontrolsfortouch' ) );
	add_settings_field('custom_attributes', __('Custom attributes:', 'video-embed-thumbnail-generator'), 'kgvid_custom_attributes_callback', __FILE__, 'kgvid_video_embed_playback_settings', array( 'label_for' => 'custom_attributes' ) );

	add_settings_field('bgcolor', __('Background color:', 'video-embed-thumbnail-generator'), 'kgvid_bgcolor_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'bgcolor' ) );
	add_settings_field('configuration', __('XML configuration file:', 'video-embed-thumbnail-generator'), 'kgvid_configuration_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'configuration' ) );
	add_settings_field('skin', __('Video skin file:', 'video-embed-thumbnail-generator'), 'kgvid_skin_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'skin' ) );
	add_settings_field('stream_type', __('Video stream type:', 'video-embed-thumbnail-generator'), 'kgvid_stream_type_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'stream_type' ) );
	add_settings_field('scale_mode', __('Video scale mode:', 'video-embed-thumbnail-generator'), 'kgvid_scale_mode_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'scale_mode' ) );
	add_settings_field('autohide', __('Autohide:', 'video-embed-thumbnail-generator'), 'kgvid_autohide_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'autohide' ) );
	add_settings_field('playbutton', __('Play button overlay:', 'video-embed-thumbnail-generator'), 'kgvid_playbutton_callback', __FILE__, 'kgvid_video_embed_flash_settings', array( 'label_for' => 'playbutton' ) );

	add_settings_field('generate_thumbs', __('Default number of thumbnails to generate:', 'video-embed-thumbnail-generator'), 'kgvid_generate_thumbs_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'generate_thumbs' ) );
	add_settings_field('security', __('Video sharing:', 'video-embed-thumbnail-generator'), 'kgvid_security_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'right_click' ) );
	add_settings_field('featured', __('Featured image:', 'video-embed-thumbnail-generator'), 'kgvid_featured_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'featured' ) );
	add_settings_field('thumb_parent', __('Attach thumbnails to:', 'video-embed-thumbnail-generator'), 'kgvid_thumb_parent_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'thumb_parent' ) );
	add_settings_field('user_roles', __('User capabilities:', 'video-embed-thumbnail-generator'), 'kgvid_user_roles_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'user_roles' ) );
	add_settings_field('delete_children', __('Delete associated attachments:', 'video-embed-thumbnail-generator'), 'kgvid_delete_children_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'delete_children' ) );
	add_settings_field('titlecode', __('Video title text HTML formatting:', 'video-embed-thumbnail-generator'), 'kgvid_titlecode_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'titlecode' ) );
	add_settings_field('template', __('Attachment page design:', 'video-embed-thumbnail-generator'), 'kgvid_template_callback', __FILE__, 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'template' ) );

	if ( !is_plugin_active_for_network( plugin_basename(__FILE__) ) ) {
		add_settings_field('app_path', __('Path to applications folder on server:', 'video-embed-thumbnail-generator'), 'kgvid_app_path_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'app_path' ) );
		add_settings_field('video_app', __('Application for thumbnails & encoding:', 'video-embed-thumbnail-generator'), 'kgvid_video_app_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'video_app' ) );
	}

	add_settings_field('browser_thumbnails', __('Enable in-browser thumbnails:', 'video-embed-thumbnail-generator'), 'kgvid_browser_thumbnails_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'browser_thumbnails' ) );
	add_settings_field('encode_formats', __('Default video encode formats:', 'video-embed-thumbnail-generator'), 'kgvid_encode_formats_callback', __FILE__, 'kgvid_video_embed_encode_settings');
	add_settings_field('automatic', __('Do automatically on upload:', 'video-embed-thumbnail-generator'), 'kgvid_automatic_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'auto_encode' ) );
	add_settings_field('old_videos', __('For previously uploaded videos:', 'video-embed-thumbnail-generator'), 'kgvid_old_video_buttons_callback', __FILE__, 'kgvid_video_embed_encode_settings' );
	add_settings_field('error_email', __('Email encoding errors to:', 'video-embed-thumbnail-generator'), 'kgvid_error_email_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'error_email' ) );
	add_settings_field('htaccess', __('htaccess login:', 'video-embed-thumbnail-generator'), 'kgvid_htaccess_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'htaccess_username' ) );
	add_settings_field('ffmpeg_watermark', __('Add watermark to encoded files:', 'video-embed-thumbnail-generator'), 'kgvid_ffmpeg_watermark_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'ffmpeg_watermark' ) );
	if ( !is_plugin_active_for_network( plugin_basename(__FILE__) ) ) {
		add_settings_field('moov', __('Method to fix encoded H.264 headers for streaming:', 'video-embed-thumbnail-generator'), 'kgvid_moov_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'moov' ) );
	}
	add_settings_field('rate_control', __('Encode quality control method:', 'video-embed-thumbnail-generator'), 'kgvid_rate_control_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'rate_control' ) );
	add_settings_field('CRFs', __('Constant Rate Factors (CRF):', 'video-embed-thumbnail-generator'), 'kgvid_CRF_options_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'h264_CRF' ) );
	add_settings_field('bitrate_multiplier', __('Average Bit Rate:', 'video-embed-thumbnail-generator'), 'kgvid_average_bitrate_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'bitrate_multiplier' ) );
	add_settings_field('h264_profile', __('H.264 profile:', 'video-embed-thumbnail-generator'), 'kgvid_h264_profile_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'h264_profile' ) );
	add_settings_field('audio_bitrate', __('Audio bit rate:', 'video-embed-thumbnail-generator'), 'kgvid_audio_bitrate_options_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'audio_bitrate' ) );

	if ( !is_plugin_active_for_network( plugin_basename(__FILE__) ) ) {
		add_settings_field('ffmpeg_options', __('FFMPEG legacy options:', 'video-embed-thumbnail-generator'), 'kgvid_ffmpeg_options_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'video_bitrate_flag' ) );
		add_settings_field('execution', _x('Execution:', 'program execution options', 'video-embed-thumbnail-generator'), 'kgvid_execution_options_callback', __FILE__, 'kgvid_video_embed_encode_settings', array( 'label_for' => 'threads' ) );
	}

	add_settings_field('test_ffmpeg', __('Test FFMPEG:', 'video-embed-thumbnail-generator'), 'kgvid_test_ffmpeg_options_callback', __FILE__, 'kgvid_video_embed_encode_settings' );

}
add_action('admin_init', 'kgvid_video_embed_options_init' );

//callback functions generating HTML for the settings form

	function kgvid_plugin_playback_settings_section_callback() {

		global $wp_version;
		$options = kgvid_get_options();
		if ( $options['embeddable'] != "on" ) {
			$embed_disabled = "disabled='disabled'";
			if ( $options['overlay_embedcode'] == "on" || $options['open_graph'] == "on" ) {
				$options['overlay_embedcode'] = false;
				$options['open_graph'] = false;
				update_option('kgvid_video_embed_options', $options);
			}
		}
		else { $embed_disabled = ""; }

		$players["Video.js"] = "Video.js";
		if ( $wp_version >= 3.6 ) { $players[__("WordPress Default", 'video-embed-thumbnail-generator')] = "WordPress Default"; }

		//add the JW Player if available
		$jw_player_select = "";
		if ( class_exists('JWP6_Shortcode') ) {
			$players["JW Player"] = "JW Player 6";
			$jw_players = get_option('jwp6_players');
			if ( count($jw_players) > 1 ) {
				$jw_player_select = " <div style='display:none;' id='jw_player_id_select'><select class='affects_player' onchange='kgvid_hide_plugin_settings();' id='jw_player_id' name='kgvid_video_embed_options[jw_player_id]'>";
				foreach( $jw_players as $jw_player_id ) {
					$selected = ($options['jw_player_id']==$jw_player_id) ? 'selected="selected"' : '';
					$jw_player_config = get_option('jwp6_player_config_'.$jw_player_id);
					if ( is_array($jw_player_config)
					&& array_key_exists('description', $jw_player_config)
					&& !empty($jw_player_config['description']) ) { $jw_player_config_description = $jw_player_config['description']; }
					else { $jw_player_config_description = $jw_player_id; }
					$jw_player_select .= "<option value='$jw_player_id' $selected>".stripcslashes($jw_player_config_description)."</option>";
				}
				$jw_player_select .= "</select> ".__('JW Player player', 'video-embed-thumbnail-generator')."</div>";
			}
		}

		$players["Strobe Media Playback ".__('(deprecated)', 'video-embed-thumbnail-generator')] = "Strobe Media Playback";

		echo "<table class='form-table'><tbody><tr valign='middle'><th scope='row'><label for='embed_method'>".__('Video player:', 'video-embed-thumbnail-generator')."</label></th><td><select class='affects_player' onchange='kgvid_hide_plugin_settings();' id='embed_method' name='kgvid_video_embed_options[embed_method]'>";
		foreach($players as $name => $value) {
			$selected = ($options['embed_method']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Video.js is the default player. Users running WordPress 3.6 or higher can choose the WordPress Default Mediaelement.js player which may already be skinned to match your theme. If the JW Player WordPress plugin is active it should be available as a video player. In the past this plugin used Adobe\'s Strobe Media Playback Flash player, which hasn\'t been updated since 2011 and is not recommended. It should still work, but new plugin functions are not guaranteed to be compatible.', 'video-embed-thumbnail-generator')."</span></span>".$jw_player_select."</td></tr></tbody></table>\n";

		$sampleheight = intval($options['height']) + 50;
		echo "<div class='kgvid_setting_nearvid' style='width:".$options['width']."px;'>";
		echo "<div id='#kgvid_above_sample_vid'>";
		echo "<span><input class='affects_player' ".checked( $options['overlay_title'], "on", false )." id='overlay_title' name='kgvid_video_embed_options[overlay_title]' type='checkbox' /><label for='overlay_title'>".__('Overlay video title', 'video-embed-thumbnail-generator')."</label></span>";
		echo "<span><input class='affects_player' ".checked( $options['downloadlink'], "on", false )." id='downloadlink' name='kgvid_video_embed_options[downloadlink]' type='checkbox' /> <label for='downloadlink'>".__('Show download link', 'video-embed-thumbnail-generator')."</label></span>";
		echo "<span><span>".__('Sharing:','video-embed-thumbnail-generator')."</span><br>";
		echo "<input class='affects_player' ".checked( $options['overlay_embedcode'], "on", false )." id='overlay_embedcode' name='kgvid_video_embed_options[overlay_embedcode]' type='checkbox' ".$embed_disabled."/> <label for='overlay_embedcode'>".__('Embed code', 'video-embed-thumbnail-generator')."</label><br>";
		echo "<input class='affects_player' ".checked( $options['twitter_button'], "on", false )." id='twitter_button' name='kgvid_video_embed_options[twitter_button]' type='checkbox' onchange='kgvid_hide_plugin_settings();' /> <label for='twitter_button'>".__('Twitter button', 'video-embed-thumbnail-generator')."</label><span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Enter your Twitter username in the Video Sharing section below.', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<input class='affects_player' ".checked( $options['facebook_button'], "on", false )." id='facebook_button' name='kgvid_video_embed_options[facebook_button]' type='checkbox' /> <label for='facebook_button'>".__('Facebook button', 'video-embed-thumbnail-generator')."</label></span></div>";
		$iframeurl = site_url('/')."?kgvid_video_embed[enable]=true&kgvid_video_embed[sample]=true";
		echo "<iframe id='kgvid_samplevideo' style='border:2px;' src='".$iframeurl."' scrolling='no' width='".$options['width']."' height='".$sampleheight."'></iframe>";
		echo "<div style='float:right;'><input class='affects_player' ".checked( $options['view_count'], "on", false )." id='view_count' name='kgvid_video_embed_options[view_count]' type='checkbox' /> <label for='view_count'>".__('Show view count', 'video-embed-thumbnail-generator')."</label></div>";
		echo "<hr style='width:100%;'></div>\n\t";
	}
	function kgvid_plugin_flash_settings_section_callback() { }
	function kgvid_plugin_settings_section_callback() { }

	function kgvid_poster_callback() {
		$options = kgvid_get_options();
		echo "<input class='regular-text affects_player' id='poster' name='kgvid_video_embed_options[poster]' type='text' value='".$options['poster']."' /> <span id='pick-thumbnail' class='button-secondary' data-choose='".__('Choose a Thumbnail', 'video-embed-thumbnail-generator')."' data-update='".__('Set as video thumbnail', 'video-embed-thumbnail-generator')."' data-change='poster' onclick='kgvid_pick_image(this);'>".__('Choose from Library', 'video-embed-thumbnail-generator')."</span>\n\t";
	}

	function kgvid_endofvideooverlay_callback() {
		$options = kgvid_get_options();
		echo "<input class='affects_player' ".checked( $options['endofvideooverlaysame'], "on", false )." id='endofvideooverlaysame' name='kgvid_video_embed_options[endofvideooverlaysame]' type='checkbox' /> <label for='endofvideooverlaysame'>".__('Display thumbnail image again when video ends.', 'video-embed-thumbnail-generator')."</label><br />";
		echo "<input class='regular-text affects_player' id='endofvideooverlay' name='kgvid_video_embed_options[endofvideooverlay]' ".disabled( $options['endofvideooverlaysame'], "true", false )." type='text' value='".$options['endofvideooverlay']."' /> <span id='pick-endofvideooverlay' class='button-secondary' data-choose='".__('Choose End of Video Image', 'video-embed-thumbnail-generator')."' data-update='".__('Set as end of video image', 'video-embed-thumbnail-generator')."' data-change='endofvideooverlay' onclick='kgvid_pick_image(this);'>".__('Choose from Library', 'video-embed-thumbnail-generator')."</span><br />";
		echo __('Display alternate image when video ends.', 'video-embed-thumbnail-generator')."<small>\n\t";
	}

	function kgvid_watermark_callback() {
		$options = kgvid_get_options();
		echo __('Image:', 'video-embed-thumbnail-generator')." <input class='regular-text affects_player' id='watermark' name='kgvid_video_embed_options[watermark]' type='text' value='".$options['watermark']."' /> <span id='pick-watermark' class='button-secondary' data-choose='".__('Choose a Watermark', 'video-embed-thumbnail-generator')."' data-update='".__('Set as watermark', 'video-embed-thumbnail-generator')."' data-change='watermark' onclick='kgvid_pick_image(this);'>".__('Choose from Library', 'video-embed-thumbnail-generator')."</span><br />";
		echo __('Link to:', 'video-embed-thumbnail-generator').' ';
		$items = array(
			__("Home page", 'video-embed-thumbnail-generator') => "home",
			__("Parent post", 'video-embed-thumbnail-generator') => "parent",
			__("Video attachment page", 'video-embed-thumbnail-generator') => "attachment",
			__("Download video", 'video-embed-thumbnail-generator') => "download",
			__("Custom URL", 'video-embed-thumbnail-generator') => "custom",
			__("None", 'video-embed-thumbnail-generator') => "false"
		);

		echo "<select class='affects_player' onchange='kgvid_hide_watermark_url(this);' id='watermark_link_to' name='kgvid_video_embed_options[watermark_link_to]'>";
		foreach($items as $name => $value) {
			$selected = ($options['watermark_link_to']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select>\n\t";
		echo " <input ";
		if ( $options['watermark_link_to'] != 'custom' ) {
			echo "style='display:none;' ";
			$options['watermark_url'] = '';
		}
		echo "class='regular-text affects_player' id='watermark_url' name='kgvid_video_embed_options[watermark_url]' type='text' value='".$options['watermark_url']."' />\n\t";
	}

	function kgvid_align_callback() {
		$options = kgvid_get_options();
		$items = array(__("left", 'video-embed-thumbnail-generator') => "left", __("center", 'video-embed-thumbnail-generator') => "center", __("right", 'video-embed-thumbnail-generator') => "right");
		echo "<select id='align' name='kgvid_video_embed_options[align]'>";
		foreach($items as $name => $value) {
			$selected = ($options['align']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select>\n\t";
	}

	function kgvid_resize_callback() {
		$options = kgvid_get_options();
		$video_formats = kgvid_video_formats();
		echo "<div id='resize_div'><input ".checked( $options['resize'], "on", false )." id='resize' name='kgvid_video_embed_options[resize]' type='checkbox' /> <label for='resize'>".__('Make video player responsive.', 'video-embed-thumbnail-generator')."</label><br /></div>";
		$items = array( __("automatic", 'video-embed-thumbnail-generator'), __("highest", 'video-embed-thumbnail-generator'), __("lowest", 'video-embed-thumbnail-generator') );
		foreach ( $video_formats as $format => $format_stats ) {
			if ( $format_stats['type'] == 'h264' && !empty($format_stats['label']) ) {
				$items[] = $format_stats['label'];
			}
		}
		echo __('Default playback resolution', 'video-embed-thumbnail-generator')." <select id='auto_res' name='kgvid_video_embed_options[auto_res]' onchange='kgvid_hide_plugin_settings()'>";
		foreach( $items as $name ) {
			$selected = ($options['auto_res']==$name) ? 'selected="selected"' : '';
			echo "<option value='$name' $selected>$name</option>";
		}
		echo "</select> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('If multiple H.264 resolutions for a video are available, you can choose to load the highest or lowest available resolution by default, automatically select the resolution based on the size of the video window, or indicate a particular resolution to use every time.', 'video-embed-thumbnail-generator')."</span></span>";
		echo "<p id='pixel_ratio_p'><input ".checked( $options['pixel_ratio'], "on", false )." id='pixel_ratio' name='kgvid_video_embed_options[pixel_ratio]' type='checkbox' /><label for='pixel_ratio'>".__('Use display pixel ratio for resolution calculation', 'video-embed-thumbnail-generator')."</label><span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Most modern mobile devices and some very high-resolution desktop displays (what Apple calls a Retina display) use a pixel ratio to calculate the size of their viewport. Using the pixel ratio can result in a higher resolution being selected on mobile devices than on desktop devices. Because these devices actually have extremely high resolutions, and in a responsive design the video player usually takes up more of the screen than on a desktop browser, this is not a mistake, but your users might prefer to use less mobile data.', 'video-embed-thumbnail-generator')."</span></span></p>\n\t";

	}

	function kgvid_dimensions_callback() {
		$options = kgvid_get_options();
		echo __('Width:', 'video-embed-thumbnail-generator')." <input class='small-text affects_player' id='width' name='kgvid_video_embed_options[width]' type='text' value='".$options['width']."' /> ".__('Height:', 'video-embed-thumbnail-generator')." <input class='small-text affects_player' id='height' name='kgvid_video_embed_options[height]' type='text' value='".$options['height']."' /><br />";
		echo "<input ".checked( $options['minimum_width'], "on", false )." id='minimum_width' name='kgvid_video_embed_options[minimum_width]' type='checkbox' /> <label for='minimum_width'>".__('Enlarge lower resolution videos to max width.', 'video-embed-thumbnail-generator')."</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Usually if a video\'s resolution is less than the max width, the video player is set to the actual width of the video. Enabling this will always set the same width regardless of the quality of the video. When necessary you can override by setting the dimensions manually.', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<input ".checked( $options['fullwidth'], "on", false )." id='fullwidth' name='kgvid_video_embed_options[fullwidth]' type='checkbox' /> <label for='fullwidth'>".__('Set all videos to expand to 100% of their containers.', 'video-embed-thumbnail-generator')."</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Enabling this will ignore any other width settings and set the width of the video to the width of the container it\'s in.', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<input ".checked( $options['inline'], "on", false )." id='inline' name='kgvid_video_embed_options[inline]' type='checkbox' /> <label for='inline'>".__('Allow other content on the same line as the video.', 'video-embed-thumbnail-generator')."</label>\n\t";
	}

	function kgvid_video_gallery_callback() {
		$options = kgvid_get_options();
		echo __('Maximum popup width:', 'video-embed-thumbnail-generator')." <input class='small-text' id='gallery_width' name='kgvid_video_embed_options[gallery_width]' type='text' value='".$options['gallery_width']."' /><br />";
		echo __('Thumbnail width:', 'video-embed-thumbnail-generator')." <input class='small-text' id='gallery_thumb' name='kgvid_video_embed_options[gallery_thumb]' type='text' value='".$options['gallery_thumb']."' /><br />";

		$items = array();
		$items = array(
			__('Stop, but leave popup window open', 'video-embed-thumbnail-generator') => "",
			__('Autoplay next video in the gallery', 'video-embed-thumbnail-generator') => "next",
			__('Close popup window', 'video-embed-thumbnail-generator') => "close");
		echo "<select id='gallery_end' name='kgvid_video_embed_options[gallery_end]'>";
		foreach($items as $name => $value) {
			$selected = ($options['gallery_end']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> ". __('when current gallery video finishes.', 'video-embed-thumbnail-generator')."<br />";
		echo " <input ".checked( $options['gallery_pagination'], "on", false )." id='gallery_pagination' name='kgvid_video_embed_options[gallery_pagination]' onchange='kgvid_hide_paginate_gallery_setting(this)' type='checkbox' /> <label for='gallery_pagination'>".__('Paginate video galleries.', 'video-embed-thumbnail-generator')."</label> ";
		echo "<span ";
		if ( $options['gallery_pagination'] != 'on' ) { echo "style='display:none;' "; }
		echo "id='gallery_per_page_span'><input class='small-text' id='gallery_per_page' name='kgvid_video_embed_options[gallery_per_page]' type='text' value='".$options['gallery_per_page']."' /> ".__('videos per gallery page.', 'video-embed-thumbnail-generator')."</span><br />";
		echo " <input ".checked( $options['gallery_title'], "on", false )." id='gallery_title' name='kgvid_video_embed_options[gallery_title]' type='checkbox' /> <label for='gallery_title'>".__('Show video title overlay on thumbnails.', 'video-embed-thumbnail-generator')."</label>\n\t";

	}

	function kgvid_controlbar_style_callback() {
		$options = kgvid_get_options();
		$items = array();
		$items[__("docked", 'video-embed-thumbnail-generator')] = "docked";
		if ( $options['embed_method'] == "Strobe Media Playback" ) { $items[__("floating", 'video-embed-thumbnail-generator')] = "floating"; }
		$items[__("none", 'video-embed-thumbnail-generator')] = "none";
		echo "<select class='affects_player' id='controlbar_style' name='kgvid_video_embed_options[controlbar_style]'>";
		foreach($items as $name => $value) {
			$selected = ($options['controlbar_style']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select>\n\t";
	}

	function kgvid_autoplay_callback() {
		$options = kgvid_get_options();
		echo "<input class='affects_player' ".checked( $options['autoplay'], "on", false )." id='autoplay' name='kgvid_video_embed_options[autoplay]' type='checkbox' /> <label for='autoplay'>".__('Play automatically when page loads.', 'video-embed-thumbnail-generator')."</label>\n\t";
	}

	function kgvid_loop_callback() {
		$options = kgvid_get_options();
		echo "<input class='affects_player' ".checked( $options['loop'], "on", false )." id='loop' name='kgvid_video_embed_options[loop]' type='checkbox' /> <label for='loop'>".__('Loop to beginning when video ends.', 'video-embed-thumbnail-generator')."</label>\n\t";
	}

	function kgvid_audio_callback() {
		$options = kgvid_get_options();
		$items = array();
		$percent = 0;
		for ( $percent = 0; $percent <= 1.05; $percent = $percent + 0.05 ) {
			$items[sprintf( _x('%d%%', 'a list of percentages. eg: 15%', 'video-embed-thumbnail-generator'), round($percent*100) )] = strval($percent);
		}
		echo "<select class='affects_player' id='volume' name='kgvid_video_embed_options[volume]'>";
		foreach($items as $name=>$value) {
			$selected = ($options['volume']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <input class='affects_player' ".checked( $options['mute'], "on", false )." id='mute' name='kgvid_video_embed_options[mute]' type='checkbox' /> <label for='mute'>".__('Mute', 'video-embed-thumbnail-generator')."</label>\n\t";

	}

	function kgvid_preload_callback() {
		$options = kgvid_get_options();
		$items = array(
			__('metadata', 'video-embed-thumbnail-generator') => "metadata",
			__('auto', 'video-embed-thumbnail-generator') => "auto",
			__('none', 'video-embed-thumbnail-generator') => "none");
		echo "<select class='affects_player' id='preload' name='kgvid_video_embed_options[preload]'>";
		foreach($items as $name=>$value) {
			$selected = ($options['preload']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select><span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>"._x('Controls how much of a video to load before the user starts playback. Mobile browsers never preload any video information. Selecting "metadata" will load the height and width and format information along with a few seconds of the video in some desktop browsers. "Auto" will preload nearly a minute of video in most desktop browsers. "None" will prevent all data from preloading.', 'Suggest not translating the words in quotation marks', 'video-embed-thumbnail-generator')."</span></span>\n\t";
	}

	function kgvid_js_skin_callback() {
		$options = kgvid_get_options();
		echo "<input class='regular-text code affects_player' id='js_skin' name='kgvid_video_embed_options[js_skin]' type='text' value='".$options['js_skin']."' /><br /><em><small>".sprintf( __('Use %s for a nice, circular play button. Leave blank for the default square play button.', 'video-embed-thumbnail-generator')." <a href='http://videojs.com/docs/skins/'>".__('Or build your own CSS skin.', 'video-embed-thumbnail-generator'), '<code>kg-video-js-skin</code>')."</a></small></em>\n\t";
	}

	function kgvid_nativecontrolsfortouch_callback() {
		$options = kgvid_get_options();
		echo "<input class='affects_player' ".checked( $options['nativecontrolsfortouch'], "on", false )." id='nativecontrolsfortouch' name='kgvid_video_embed_options[nativecontrolsfortouch]' type='checkbox' /> <label for='nativecontrolsfortouch'>".__('Show native controls on mobile devices.', 'video-embed-thumbnail-generator')."</label><span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Disable Video.js styling and show the built-in video controls on mobile devices. This will disable the resolution selection button.', 'video-embed-thumbnail-generator')."</span></span>\n\t";
	}

	function kgvid_custom_attributes_callback() {
		$options = kgvid_get_options();
		echo "<input class='regular-text code affects_player' id='custom_attributes' name='kgvid_video_embed_options[custom_attributes]' type='text' value='".$options['custom_attributes']."' /><br /><em><small>".sprintf( __('Space-separated list to add to all videos. Example: %s', 'video-embed-thumbnail-generator'), '<code>orderby="title" order="DESC" startparam="start"</code>' )."</small></em>\n\t";
	}

	function kgvid_bgcolor_callback() {
		$options = kgvid_get_options();
		echo "<input class='small-text affects_player' id='bgcolor' name='kgvid_video_embed_options[bgcolor]' maxlength='7' type='text' value='".$options['bgcolor']."' /> #rrggbb\n\t";
	}

	function kgvid_configuration_callback() {
		$options = kgvid_get_options();
		echo "<input class='regular-text affects_player' id='configuration' name='kgvid_video_embed_options[configuration]' type='text' value='".$options['configuration']."' />\n\t";
	}

	function kgvid_skin_callback() {
		$options = kgvid_get_options();
		echo "<input class='regular-text affects_player' id='skin' name='kgvid_video_embed_options[skin]' type='text' value='".$options['skin']."' /><br /><em><small>".sprintf( __('Use %s for a modern, circular play button.', 'video-embed-thumbnail-generator'), "<code>".plugins_url("", __FILE__)."/flash/skin/kgvid_skin.xml</code>" )."<br /> ".__('Leave blank for the off-center square play button.', 'video-embed-thumbnail-generator')."</small></em>\n\t";
	}

	function kgvid_stream_type_callback() {
		$options = kgvid_get_options();
		$items = array(
			__('liveOrRecorded', 'video-embed-thumbnail-generator') => "liveOrRecorded",
			__('live', 'video-embed-thumbnail-generator') => "live",
			__('recorded', 'video-embed-thumbnail-generator') => "recorded",
			__('dvr', 'video-embed-thumbnail-generator') => "dvr");
		echo "<select class='affects_player' id='stream_type' name='kgvid_video_embed_options[stream_type]'>";
		foreach($items as $name=>$value) {
			$selected = ($options['stream_type']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select>\n\t";
	}

	function kgvid_scale_mode_callback() {
		$options = kgvid_get_options();
		$items = array(
			__("letterbox", 'video-embed-thumbnail-generator') => "letterbox",
			__("none", 'video-embed-thumbnail-generator') => "none",
			__("stretch", 'video-embed-thumbnail-generator') => "stretch",
			__("zoom", 'video-embed-thumbnail-generator') => "zoom"
		);
		echo "<select class='affects_player' id='scale_mode' name='kgvid_video_embed_options[scale_mode]'>";
		foreach($items as $name=>$value) {
			$selected = ($options['scale_mode']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select>\n\t";
	}

	function kgvid_autohide_callback() {
		$options = kgvid_get_options();
		echo "<input ".checked( $options['autohide'], "on", false )." id='autohide' name='kgvid_video_embed_options[autohide]' type='checkbox' /> <label for='autohide'>".__('Autohide controlbar.', 'video-embed-thumbnail-generator')."</label>\n\t";
	}

	function kgvid_playbutton_callback() {
		$options = kgvid_get_options();
		echo "<input class='affects_player' ".checked( $options['playbutton'], "on", false )." id='playbutton' name='kgvid_video_embed_options[playbutton]' type='checkbox' /> <label for='playbutton'>".__('Overlay play button on poster frame.', 'video-embed-thumbnail-generator')."</label>\n\t";
	}

	function kgvid_generate_thumbs_callback() {
		$options = kgvid_get_options();
		echo "<input class='small-text' id='generate_thumbs' name='kgvid_video_embed_options[generate_thumbs]' maxlength='2' type='text' value='".strval($options['generate_thumbs'])."' />\n\t";
	}

	function kgvid_security_callback() {
		$options = kgvid_get_options();

		if ( $options['embeddable'] != "on" ) { $embed_disabled = " disabled='disabled' title='".__('Embedding disabled', 'video-embed-thumbnail-generator')."'"; }
		else { $embed_disabled = ""; }

		echo "<input class='affects_player' ".checked( $options['embeddable'], "on", false )." id='embeddable' name='kgvid_video_embed_options[embeddable]' type='checkbox' onclick='kgvid_embeddable_switch(this.checked);' /> <label for='embeddable'>".__('Allow users to embed your videos on other sites.', 'video-embed-thumbnail-generator')."</label><br />";
		echo "<input ".checked( $options['open_graph'], "on", false )." id='open_graph' name='kgvid_video_embed_options[open_graph]' type='checkbox'".$embed_disabled." /> <label for='open_graph'>"._x('Enable Facebook Open Graph video tags.', '"Open Graph" is a proper noun and might not need translation', 'video-embed-thumbnail-generator')."</label><span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Facebook and some other social media sites will use these tags to embed the first video in your post. Your video must be served via https in order to be embedded directly in Facebook and playback is handled by the unstyled built-in browser player. No statistics will be recorded for videos embedded this way and Open Graph tags generated by Jetpack will be disabled on pages with videos.', 'video-embed-thumbnail-generator')."</span></span><br />\n\t";
		echo "<input ".checked( $options['schema'], "on", false )." id='schema' name='kgvid_video_embed_options[schema]' type='checkbox'".$embed_disabled." /> <label for='schema'>".__('Enable Schema.org structured data markup for search engines.', 'video-embed-thumbnail-generator')."</label><span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Helps your videos appear in video searches on Google, Yahoo, and Bing.', 'video-embed-thumbnail-generator')."</span></span><br />\n\t";
		echo "<input ".checked( $options['twitter_card'], "on", false )." id='twitter_card' name='kgvid_video_embed_options[twitter_card]' type='checkbox'".$embed_disabled." onchange='kgvid_hide_plugin_settings();' /> <label for='twitter_card'>".__('Enable Twitter Cards.', 'video-embed-thumbnail-generator')."</label><span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __('Generates metadata for "player" Twitter Cards that will show a thumbnail and playable video in Twitter. Disables Jetpack Twitter metadata on any page with a video. Your site must have https enabled and you must request whitelist approval for your site using the %1$sTwitter card validator%2$s. Don\'t worry if your player card doesn\'t render. Twitter will most likely approve your request.', 'video-embed-thumbnail-generator'), '<a href="https://cards-dev.twitter.com/validator">', '</a>')."</span></span><br />\n\t";
		echo "<div id='twitter_username_div' style='margin:0px;'><input class='regular-text' id='twitter_username' style='width: 100px;' name='kgvid_video_embed_options[twitter_username]' type='text' value='".$options['twitter_username']."' /> <label for='twitter_username'>".__('Twitter username', 'video-embed-thumbnail-generator')."</label></div>";
		echo "<input class='affects_player' ".checked( $options['right_click'], "on", false )." id='right_click' name='kgvid_video_embed_options[right_click]' type='checkbox' /> <label for='right_click'>".__('Allow right-clicking on videos.', 'video-embed-thumbnail-generator')."</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('We can\'t prevent a user from simply saving the downloaded video file from the browser\'s cache, but disabling right-clicking will make it more difficult for casual users to save your videos.', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<input ".checked( $options['click_download'], "on", false )." id='click_download' name='kgvid_video_embed_options[click_download]' type='checkbox' /> <label for='click_download'>".__('Allow single-click download link for videos.', 'video-embed-thumbnail-generator')."</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('The plugin creates a one-click method for users who want to allow easy video downloading, but if some of your videos are hidden or private, depending on the methods you use, someone who guesses a video\'s WordPress database ID could potentially use the method to download videos they might not otherwise have access to.', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<input ".checked( $options['oembed_provider'], "on", false )." id='oembed_provider' name='kgvid_video_embed_options[oembed_provider]' type='checkbox'".$embed_disabled." /> <label for='oembed_provider'>"._x('Change oEmbed to video instead of WordPress default photo/excerpt.', '"oEmbed" is a proper noun and might not need translation', 'video-embed-thumbnail-generator')."</label><span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Allows users of other websites to embed your videos using just the post URL rather than the full iframe embed code, much like Vimeo or YouTube. However, most social media sites (including Facebook & Twitter) will not show videos through oEmbed unless your link is https. In order to display the video properly, this will also remove some of the security features included in the built-in WordPress oEmbed system.', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<input ".checked( $options['oembed_security'], "on", false )." id='oembed_security' name='kgvid_video_embed_options[oembed_security]' type='checkbox' /> <label for='oembed_security'>"._x('Enable oEmbeds from unknown providers.', '"oEmbed" is a proper noun and might not need translation', 'video-embed-thumbnail-generator')."</label><span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Allows your own users to embed content from any oEmbed provider. User must have the "unfiltered_html" capability which is limited to Administrators and Editors by default.', 'video-embed-thumbnail-generator')."</span></span><br />\n\t";
	}

	function kgvid_featured_callback() {
		$options = kgvid_get_options();
		echo "<input ".checked( $options['featured'], "on", false )." id='featured' name='kgvid_video_embed_options[featured]' type='checkbox' /> <label for='featured'>".__('Set generated video thumbnails as featured images.', 'video-embed-thumbnail-generator')."</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('If your theme uses the featured image meta tag, this will automatically set a video\'s parent post\'s featured image to the most recently saved thumbnail image.', 'video-embed-thumbnail-generator')."</span></span><br /> <a class='button-secondary' href='javascript:void(0);' onclick='kgvid_set_all_featured();'>"._x('Set all as featured', 'implied "Set all thumbnails as featured"', 'video-embed-thumbnail-generator')."</a> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('If you\'ve generated thumbnails before enabling this option, this will set all existing thumbnails as featured images. Be careful!', 'video-embed-thumbnail-generator')."</span></span>\n\t";
	}

	function kgvid_user_roles_callback($page_scope = 'site') {
		global $wp_roles;
		$options = kgvid_get_options();
		$capabilities_checkboxes = array();
		$capabilities = array( 'make_video_thumbnails'=>__('Can make thumbnails', 'video-embed-thumbnail-generator'), 'encode_videos'=>__('Can encode videos', 'video-embed-thumbnail-generator'), 'edit_others_video_encodes' => __('Can view & modify other users encoded videos', 'video-embed-thumbnail-generator') );
		foreach ( $capabilities as $capability => $capability_name ) {
			$capabilities_checkboxes[] = "<div class='kgvid_user_roles'><strong>".$capability_name.":</strong><br>";

			if ( is_object($wp_roles) && property_exists($wp_roles, 'roles') ) {

				foreach ( $wp_roles->roles as $role => $role_info ) {

					$capability_enabled = false;
					if ( $page_scope == 'network' ) {
						$option_name = 'default_capabilities';
						if ( array_key_exists('default_capabilities', $options)
						&& array_key_exists($capability, $options['default_capabilities'])
						&& array_key_exists($role, $options['default_capabilities'][$capability])
						&& $options['default_capabilities'][$capability][$role] == "on" ) {
							$capability_enabled = true;
						}
					}
					else {
						$option_name = 'capabilities';
						if ( is_array($wp_roles->roles[$role]['capabilities']) && array_key_exists($capability, $wp_roles->roles[$role]['capabilities'])
						&& $wp_roles->roles[$role]['capabilities'][$capability] == 1 ) {
							$capability_enabled = true;
						}
					}
					$capabilities_checkboxes[] = "<input type='checkbox' ".checked( $capability_enabled, true, false )." id='capability-".$capability."-".$role."' name='kgvid_video_embed_options[".$option_name."][".$capability."][".$role."]'> <label for='capability-".$capability."-".$role."'>".translate_user_role($role_info['name'])."</label><br>";

				} //role loop

			}

			$capabilities_checkboxes[] = "</div>";
		}// capability loop
		echo implode("", $capabilities_checkboxes)."\n\t";
	}

	function kgvid_thumb_parent_callback() {
		$options = kgvid_get_options();
		$items = array("post", "video");
		echo "<select id='thumb_parent' name='kgvid_video_embed_options[thumb_parent]'>";
		foreach($items as $item) {
			$selected = ($options['thumb_parent']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('This depends on your theme. Thumbnails generated by the plugin can be saved as children of the video attachment or the post. Some themes use an image attached to a post instead of the built-in featured image meta tag. Version 3.x of this plugin saved all thumbnails as children of the video.', 'video-embed-thumbnail-generator')."</span></span><br /> <a class='button-secondary' href='javascript:void(0);' onclick='kgvid_switch_parents();'>".__('Set all parents', 'video-embed-thumbnail-generator')."</a> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('If you\'ve generated thumbnails before changing this option, this will set all existing thumbnails as children of your currently selected option.', 'video-embed-thumbnail-generator')."</span></span>\n\t";
	}

	function kgvid_delete_children_callback() {
		$options = kgvid_get_options();
		$items = array(
			__('none', 'video-embed-thumbnail-generator') => "none",
			__('all', 'video-embed-thumbnail-generator') => "all",
			__('encoded videos only', 'video-embed-thumbnail-generator') => "encoded videos only");
		echo "<select id='delete_children' name='kgvid_video_embed_options[delete_children]'>";
		foreach($items as $name => $value) {
			$selected = ($options['delete_children']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('If you delete the original video you can choose to delete all associated attachments (thumbnails & videos) or keep the thumbnail.', 'video-embed-thumbnail-generator')."</span></span>\n\t";
	}

	function kgvid_titlecode_callback() {
		$options = kgvid_get_options();
		echo "<input class='regular-text code' id='titlecode' name='kgvid_video_embed_options[titlecode]' type='text' value='".htmlentities(stripslashes($options['titlecode']))."' /> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __('HTML tag applied to titles inserted above the video. Examples: %s. Corresponding closing tags will be applied to the end of the title automatically.', 'video-embed-thumbnail-generator'), "&lt;strong&gt;, &lt;em&gt;, &lt;H2&gt;, &lt;span class='videotitle'&gt;")."</span></span>\n\t";
	}

	function kgvid_template_callback() {
		$options = kgvid_get_options();
		$items = array(__("Match plugin settings", 'video-embed-thumbnail-generator')=>"gentle", __("WordPress default", 'video-embed-thumbnail-generator')=>"none", __("Video only (deprecated)", 'video-embed-thumbnail-generator')=>"old");
		echo "<select id='template' name='kgvid_video_embed_options[template]'>";
		foreach($items as $name => $value) {
			$selected = ($options['template']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('The plugin can filter your media attachment page to display videos using your chosen settings, or completely replace your attachment template to show only the video. If you were one of the few people using iframe embed codes before version 4.0 of this plugin then you should continue to use "Video only" but otherwise it\'s not recommended.', 'video-embed-thumbnail-generator')."</span></span>\n\t";
	}

	function kgvid_encode_settings_section_callback() {
		if ( is_plugin_active_for_network( plugin_basename(__FILE__) ) ) {
			$options = kgvid_get_options();
			echo "<input type='hidden' id='app_path' data-ffmpeg_exists='".$options['ffmpeg_exists']."' name='kgvid_video_embed_options[app_path]' value='".$options['app_path']."'>";
			echo "<input type='hidden' id='video_app' name='kgvid_video_embed_options[video_app]' value='".strtoupper($options['video_app'])."'>";
		}
	}

	function kgvid_app_path_callback() {
		$options = kgvid_get_options();
		//if ( is_plugin_active_for_network( plugin_basename(__FILE__) ) ) { $options = get_site_option( 'kgvid_video_embed_network_options' ); }
		echo "<input class='affects_ffmpeg regular-text code' id='app_path' data-ffmpeg_exists='".$options['ffmpeg_exists']."' name='kgvid_video_embed_options[app_path]' type='text' value='".$options['app_path']."' /><span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __('This should be the folder where applications are installed on your server, not a direct path to an application, so it doesn\'t usually end with %1$s. Example: %2$s.', 'video-embed-thumbnail-generator'), "<code><strong class='video_app_name'>".strtoupper($options['video_app'])."</strong></code>", "<code>/usr/local/bin</code>" )."\n\t";
	}

	function kgvid_video_app_callback() {
		$options = kgvid_get_options();
		//if ( is_plugin_active_for_network( plugin_basename(__FILE__) ) ) { $options = get_site_option( 'kgvid_video_embed_network_options' ); }
		echo "<select onchange='kgvid_hide_ffmpeg_settings();' class='affects_ffmpeg' id='video_app' name='kgvid_video_embed_options[video_app]'>";
		$items = array("FFMPEG"=>"ffmpeg", "LIBAV"=>"avconv");
		foreach($items as $name => $value) {
			$selected = ($options['video_app']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('FFMPEG split into two separate branches in 2011. The new branch is called LIBAV and executes using "avconv" instead of "ffmpeg." Both are still actively developed and FFMPEG frequently incorporates LIBAV features. Debian & Ubuntu users probably have LIBAV installed.', 'video-embed-thumbnail-generator')."</span></span>\n\t";
	}

	function kgvid_browser_thumbnails_callback() {
		$options = kgvid_get_options();
		echo "<div class='kgvid_video_app_required'>";
		echo "<input ".checked( $options['browser_thumbnails'], "on", false )." id='browser_thumbnails' name='kgvid_video_embed_options[browser_thumbnails]' type='checkbox' /> <label for='browser_thumbnails'>".sprintf( __('When possible, use the browser\'s built-in video capabilities to make thumbnails instead of %s.', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>")."</label>\n\t";
		echo "</div>";
	}

	function kgvid_encode_formats_callback() {
		$options = kgvid_get_options();
		$video_formats = kgvid_video_formats(true, false);
		foreach ($video_formats as $format => $format_stats) {
			$items[$format] = $format_stats['name'];
		}
		$items['fullres'] = __('same resolution H.264', 'video-embed-thumbnail-generator');
		$items['custom'] = __('Custom', 'video-embed-thumbnail-generator');

		echo "<div class='kgvid_video_app_required'>";
		echo "<input ".checked( $options['encode_fullres'], "on", false )." id='encode_fullres' name='kgvid_video_embed_options[encode_fullres]' type='checkbox' /> <label for='encode_fullres'>".__('Replace original with', 'video-embed-thumbnail-generator');

		echo " <select id='replace_format' name='kgvid_video_embed_options[replace_format]' class='affects_ffmpeg' onchange='kgvid_change_replace_format();'>";
		foreach($items as $value=>$name) {
			$selected = ($options['replace_format']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> ";


		echo "</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('If you have FFMPEG/LIBAV and the proper libraries installed, you can choose to replace your uploaded video with your preferred format, and also transcode into as many as seven additional formats depending on the resolution of your original source. Different browsers have different playback capabilities. Most desktop browsers can play H.264, and all modern mobile devices can play at least 360p H.264. If you create multiple H.264 resolutions, the highest resolution supported by the device will be served up automatically. The plugin will not upconvert your video, so if you upload a 720p video, it will not waste your time creating a 1080p version. There was a time when it seemed like a good idea to provide OGV or WEBM for some desktop browsers, but even Firefox allows H.264 playback on most operating systems now. I no longer recommend encoding OGV or WEBM unless you expect a large number of no-Flash sticklers visiting your site. WEBM VP9 is a new technology and requires a version of FFMPEG or LIBAV newer than October 2013.', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<input ".checked( $options['encode_1080'], "on", false )." id='encode_1080' name='kgvid_video_embed_options[encode_1080]' type='checkbox' /> <label for='encode_1080'>1080p H.264 <small><em>".__('(iPhone 4s+, iPad 2+, modern Android, Windows Phone 8, Chrome, Safari, IE 9+, Firefox)', 'video-embed-thumbnail-generator')."</em></small></label><br />";
		echo "<input ".checked( $options['encode_720'], "on", false )." id='encode_720' name='kgvid_video_embed_options[encode_720]' type='checkbox' /> <label for='encode_720'>720p H.264 <small><em>".__('(iPhone 4+, iPad, most Android, Chrome, Safari, IE 9+, Firefox)', 'video-embed-thumbnail-generator')."</em></small></label><br />";
		echo "<input ".checked( $options['encode_mobile'], "on", false )." id='encode_mobile' name='kgvid_video_embed_options[encode_mobile]' type='checkbox' /> <label for='encode_mobile'>360p H.264 <small><em>(iOS, Android, Windows Phone 7+, Chrome, Safari, IE 9+, Firefox)</em></small></label><br />";
		echo "<input ".checked( $options['encode_webm'], "on", false )." id='encode_webm' name='kgvid_video_embed_options[encode_webm]' type='checkbox' /> <label for='encode_webm'>WEBM <small><em>(Firefox, Chrome, Android 2.3+, Opera)</em></small></label><br />";
		echo "<input ".checked( $options['encode_vp9'], "on", false )." id='encode_vp9' name='kgvid_video_embed_options[encode_vp9]' type='checkbox' /> <label for='encode_vp9'>WEBM VP9 <small><em>(Firefox, Chrome, Opera)</em></small></label><br />";
		echo "<input ".checked( $options['encode_ogg'], "on", false )." id='encode_ogg' name='kgvid_video_embed_options[encode_ogg]' type='checkbox' /> <label for='encode_ogg'>OGV <small><em>(Firefox, Chrome, Android 2.3+, Opera)</em></small></label><br />";
		echo "<input ".checked( $options['encode_custom'], "on", false )." id='encode_custom' name='kgvid_video_embed_options[encode_custom]' type='checkbox' /> <label for='encode_custom'>Custom";
		$items = array( "H.264" => "h264" , "WEBM" => "webm", "OGV" => "ogg" );
		echo " <select id='custom_format_type' name='kgvid_video_embed_options[custom_format][format]' class='affects_ffmpeg'>";
		foreach($items as $name=>$value) {
			$selected = ($options['custom_format']['format']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> ";
		echo "<small>Width: <input id='custom_format_width' name='kgvid_video_embed_options[custom_format][width]' class='small-text affects_ffmpeg kgvid_custom_format' value='".$options['custom_format']['width']."' /> Height: <input id='custom_format_height' name='kgvid_video_embed_options[custom_format][height]' class='small-text affects_ffmpeg kgvid_custom_format' value='".$options['custom_format']['height']."' /></small></label>";
		echo "</div>\n\t";
	}

	function kgvid_generate_auto_thumb_label() { //for localization and switching between 1 and many thumbnails
		$options = kgvid_get_options();
		if ( intval($options['auto_thumb_number']) == 1 ) {
			$items = array(0, 25, 50, 75);
			$percentage_select = "<select id='auto_thumb_position' name='kgvid_video_embed_options[auto_thumb_position]'>";
			foreach($items as $item) {
				$selected = ($options['auto_thumb_position']==$item) ? 'selected="selected"' : '';
				$percentage_select .= "<option value='$item' $selected>$item</option>";
			}
			$percentage_select .=  "</select>";
		}
		else { $percentage_select = "<input id='auto_thumb_position' name='kgvid_video_embed_options[auto_thumb_position]' class='small-text' type='text' value='".$options['auto_thumb_position']."' maxlength='3'>"; }
		$auto_thumb_number_input = "<input id='auto_thumb_number' name='kgvid_video_embed_options[auto_thumb_number]' class='small-text' type='text' value='".$options['auto_thumb_number']."' maxlength='3'>";

		$code = sprintf( _n('Generate %1$s thumbnail from %2$s%% of the way through the video.', 'Generate %1$s thumbnails and set #%2$s as the main image.', intval($options['auto_thumb_number']), 'video-embed-thumbnail-generator'), $auto_thumb_number_input, $percentage_select );

		return $code;
	}

	function kgvid_automatic_callback() {
		$options = kgvid_get_options();
		$video_formats = kgvid_video_formats();
		echo "<div class='kgvid_video_app_required'>";
		echo "<input ".checked( $options['auto_encode'], "on", false )." id='auto_encode' name='kgvid_video_embed_options[auto_encode]' type='checkbox' /> <label for='auto_encode'>".__('Encode formats selected above.', 'video-embed-thumbnail-generator')."</label><br />";
		echo "<input ".checked( $options['auto_encode_gif'], "on", false )." id='auto_encode_gif' name='kgvid_video_embed_options[auto_encode_gif]' type='checkbox' /> <label for='auto_encode_gif'>".sprintf( __('Convert animated GIFs to %s.', 'video-embed-thumbnail-generator'), '<span class="kgvid_replace_format">'.strtoupper($video_formats['fullres']['type']).'</span>')."</label><br />";
		if ( intval($options['auto_thumb_number']) == 1 ) {
			$items = array(0, 25, 50, 75);
			$percentage_select = "<select id='auto_thumb_position' name='kgvid_video_embed_options[auto_thumb_position]'>";
			foreach($items as $item) {
				$selected = ($options['auto_thumb_position']==$item) ? 'selected="selected"' : '';
				$percentage_select .= "<option value='$item' $selected>$item</option>";
			}
			$percentage_select .=  "</select>";
		}
		else { $percentage_select = "<input id='auto_thumb_position' name='kgvid_video_embed_options[auto_thumb_position]' class='small-text' type='text' value='".$options['auto_thumb_position']."' maxlength='3'>"; }
		$auto_thumb_number_input = "<input id='auto_thumb_number' name='kgvid_video_embed_options[auto_thumb_number]' class='small-text' type='text' value='".$options['auto_thumb_number']."' maxlength='3'>";
		$auto_thumb_label = kgvid_generate_auto_thumb_label();
		echo "<input ".checked( $options['auto_thumb'], "on", false )." id='auto_thumb' name='kgvid_video_embed_options[auto_thumb]' type='checkbox' /> <label id='auto_thumb_label' for='auto_thumb'>".$auto_thumb_label." </label><br>";
		echo "</div>\n\t";
	}

	function kgvid_old_video_buttons_callback() {
		$options = kgvid_get_options();
		echo "<div class='kgvid_video_app_required'>";
		echo "<p><a id='generate_old_thumbs_button' class='button-secondary' href='javascript:void(0);' onclick='kgvid_auto_generate_old(\"thumbs\");'>".__('Generate thumbnails', 'video-embed-thumbnail-generator')."</a> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __('Use %s to automatically generate thumbnails for every video in the Media Library that doesn\'t already have them. Uses the automatic thumbnail settings above. This could take a very long time if you have a lot of videos. Proceed with caution!', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>" )."</span></span></p>";
		echo "<p><a id='generate_old_encode_button' class='button-secondary' href='javascript:void(0);' onclick='kgvid_auto_generate_old(\"encode\");'>".__('Encode videos', 'video-embed-thumbnail-generator')."</a> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __('Add every video in the Media Library to the encode queue if it hasn\'t already been encoded. Uses the default encode formats chosen above.', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>" )."</span></span></p>";
		echo "</div>\n\t";
	}

	function kgvid_error_email_callback() {
		$options = kgvid_get_options();
		echo "<div class='kgvid_video_app_required'>";
		echo " <select id='error_email' name='kgvid_video_embed_options[error_email]'>";
		$users = get_users( array( 'role__in' => array_keys($options['capabilities']['edit_others_video_encodes']) ) );
		if ( $users ) {
			$authorized_users = array();
			foreach ( $users as $user ) {
				$authorized_users[$user->user_login] = $user->ID;
			}
		}
		$items = array_merge( array(
			__('Nobody', 'video-embed-thumbnail-generator') => 'nobody',
			__('User who initiated encoding', 'video-embed-thumbnail-generator') => 'encoder'
			), $authorized_users
		);
		foreach($items as $name=>$value) {
			$selected = ($options['error_email']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select>";
		echo "</div>\n\t";
	}

	function kgvid_htaccess_callback() {
		$options = kgvid_get_options();
		echo "<div class='kgvid_video_app_required'>";
		echo "<table class='kgvid_htaccess'><tbody><tr><td>".__('Username:', 'video-embed-thumbnail-generator')."</td><td><input class='regular-text affects_ffmpeg' id='htaccess_login' name='kgvid_video_embed_options[htaccess_login]' type='text' value='".$options['htaccess_login']."' /></td></tr>";
		echo "<tr><td>".__('Password:', 'video-embed-thumbnail-generator')."</td><td><input class='regular-text affects_ffmpeg' id='htaccess_password' name='kgvid_video_embed_options[htaccess_password]' type='text' value='".$options['htaccess_password']."' /> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __('If your videos are htaccess protected, %s will access them using these credentials.', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>" )."</span></span></td></tr></tbody></table>";
		echo "</div>\n\t";
	}

	function kgvid_ffmpeg_watermark_callback() {
		$options = kgvid_get_options();
		echo "<div class='kgvid_video_app_required'>";
		echo "<p><input class='regular-text affects_ffmpeg' id='ffmpeg_watermark_url' name='kgvid_video_embed_options[ffmpeg_watermark][url]' type='text' value='".$options['ffmpeg_watermark']['url']."' /> <span id='pick-ffmpeg-watermark' class='button-secondary' data-choose='".__('Choose a Watermark', 'video-embed-thumbnail-generator')."' data-update='".__('Set as watermark', 'video-embed-thumbnail-generator')."' data-change='ffmpeg_watermark_url' onclick='kgvid_pick_image(this);'>".__('Choose from Library', 'video-embed-thumbnail-generator')."</span></p>\n\t";
		echo "<p>".sprintf( __('Scale: %s%% of video covered by the watermark.', 'video-embed-thumbnail-generator'), "<input class='small-text affects_ffmpeg' id='ffmpeg_watermark_scale' name='kgvid_video_embed_options[ffmpeg_watermark][scale]' type='text' value='".$options['ffmpeg_watermark']['scale']."' maxlength='3' />" )."</p>";
		$items = array(__("left", 'video-embed-thumbnail-generator')=>"left", _x("center", "horizontal center", 'video-embed-thumbnail-generator')=>"center", __("right", 'video-embed-thumbnail-generator')=>"right");
		echo "<p>".__('Horizontal align:', 'video-embed-thumbnail-generator');
		echo " <select id='ffmpeg_watermark_align' name='kgvid_video_embed_options[ffmpeg_watermark][align]' class='affects_ffmpeg'>";
		foreach($items as $name=>$value) {
			$selected = ($options['ffmpeg_watermark']['align']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> ";
		_e('offset', 'video-embed-thumbnail-generator');
		echo " <input class='small-text affects_ffmpeg' id='ffmpeg_watermark_x' name='kgvid_video_embed_options[ffmpeg_watermark][x]' type='text' value='".$options['ffmpeg_watermark']['x']."' maxlength='3' />%</p>";
		echo "<p>".__('Vertical align:', 'video-embed-thumbnail-generator');
		echo " <select id='ffmpeg_watermark_valign' name='kgvid_video_embed_options[ffmpeg_watermark][valign]' class='affects_ffmpeg'>";
		$items = array(__("top", 'video-embed-thumbnail-generator')=>"top", _x("center", "vertical center", 'video-embed-thumbnail-generator')=>"center", __("bottom", 'video-embed-thumbnail-generator')=>"bottom");
		foreach($items as $name=>$value) {
			$selected = ($options['ffmpeg_watermark']['valign']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> ";
		_e('offset', 'video-embed-thumbnail-generator');
		echo " <input class='small-text affects_ffmpeg' id='ffmpeg_watermark_y' name='kgvid_video_embed_options[ffmpeg_watermark][y]' type='text' value='".$options['ffmpeg_watermark']['y']."' maxlength='3' />%";
		echo "</p>\n\t";
		echo "<div id='ffmpeg_watermark_example'></div>";
		echo "</div>\n\t";
	}

	function kgvid_moov_callback() {
		$options = kgvid_get_options();
		if ( empty($options['moov_path']) ) { $options['moov_path'] = $options['app_path']; }
		echo "<div class='kgvid_video_app_required'>";
		$items = array(__("none", 'video-embed-thumbnail-generator')=>"none", "movflags faststart"=>"movflag", "qt-faststart"=>"qt-faststart", "MP4Box"=>"MP4Box");
		echo "<select onchange='kgvid_moov_setting()' id='moov' name='kgvid_video_embed_options[moov]' class='affects_ffmpeg'>";
		foreach($items as $name => $value) {
			$selected = ($options['moov']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __('By default %1$s places moov atoms at the end of H.264 encoded files, which forces the entire file to download before playback can start and can prevent Flash players from playing them at all. Since approximately October 2012 %1$s can fix the problem at the end of the encoding process by using the option `movflags faststart`. This is the easiest and fastest way to correct the problem, but older versions of %1$s will not work if you select the movflags option. If you can\'t update to a new version of %1$s, select qt-faststart or MP4Box which will run after encoding is finished if they are installed on your server.', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>")."</span></span>";
		echo "<p id='moov_path_p'>".sprintf( __('Path to %s:', 'video-embed-thumbnail-generator'), "<span class='kgvid_moov_option'>".$options['moov']."</span>")." <input class='regular-text code affects_ffmpeg' id='moov_path' name='kgvid_video_embed_options[moov_path]' type='text' value='".$options['moov_path']."' /></p>";
		echo "</div>\n\t";
	}

	function kgvid_rate_control_callback() {
		$options = kgvid_get_options();
		echo "<div class='kgvid_video_app_required'>";
		echo "<select id='rate_control' name='kgvid_video_embed_options[rate_control]' onchange='kgvid_hide_ffmpeg_settings();' class='affects_ffmpeg'>";
		$items = array("Constant Rate Factor"=>"crf", "Average Bit Rate"=>"abr");
		foreach($items as $name => $value) {
			$selected = ($options['rate_control']==$value) ? 'selected="selected"' : '';
			echo "<option value='$value' $selected>$name</option>";
		}
		echo "</select> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Constant Rate Factor (CRF) attempts to maintain a particular quality output for the entire video and only uses bits the encoder determines are necessary. Average Bit Rate is similar to the method used in older versions of this plugin. If CRF is selected, WEBM encoding will also use the ABR setting to set a max bit rate 25% higher than the ABR. Without a max bit rate setting WEBM files are terrible quality.', 'video-embed-thumbnail-generator')."</span></span>";
		echo "</div>\n\t";
	}

	function kgvid_CRF_options_callback() {
		$options = kgvid_get_options();
		echo "<div class='kgvid_video_app_required'>";
		echo "<select id='h264_CRF' name='kgvid_video_embed_options[h264_CRF]' class='affects_ffmpeg'>";
		for ($i = 0; $i <= 51; $i++ ) {
			$selected = ($options['h264_CRF']==$i) ? 'selected="selected"' : '';
			echo "<option value='".$i."' $selected>".$i."</option>";
		}
		echo "</select> H.264 <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Lower values are higher quality. 18 is considered visually lossless. Default is 23.', 'video-embed-thumbnail-generator')."</span></span><br />";

		echo "<select id='webm_CRF' name='kgvid_video_embed_options[webm_CRF]' class='affects_ffmpeg'>";
		for ($i = 4; $i <= 63; $i++ ) {
			$selected = ($options['webm_CRF']==$i) ? 'selected="selected"' : '';
			echo "<option value='".$i."' $selected>".$i."</option>";
		}
		echo "</select> WEBM <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Lower values are higher quality. Default is 10.', 'video-embed-thumbnail-generator')."</span></span><br />\n\t";

		echo "<select id='ogv_CRF' name='kgvid_video_embed_options[ogv_CRF]' class='affects_ffmpeg'>";
		for ($i = 1; $i <= 10; $i++ ) {
			$selected = ($options['ogv_CRF']==$i) ? 'selected="selected"' : '';
			echo "<option value='".$i."' $selected>".$i."</option>";
		}
		echo "</select> OGV (qscale) <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Higher values are higher quality. Default is 6.', 'video-embed-thumbnail-generator')."</span></span>";
		echo "</div>\n\t";
	}

	function kgvid_average_bitrate_callback() {
		$options = kgvid_get_options();
		echo "<div class='kgvid_video_app_required'>";
		echo "<select onchange='kgvid_set_bitrate_display();' id='bitrate_multiplier' name='kgvid_video_embed_options[bitrate_multiplier]' class='affects_ffmpeg'>";
		for ($i = 0.01; $i <= 0.31; $i=$i+0.01 ) {
			$selected = ($options['bitrate_multiplier']==strval($i)) ? 'selected="selected"' : '';
			echo "<option value='$i' $selected>$i</option>";
		}
		echo "</select> ".__('bits per pixel.', 'video-embed-thumbnail-generator')." <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Default is 0.1', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<span class='kgvid_gray_text'>1080p = <span id='1080_bitrate'>".round(floatval($options['bitrate_multiplier'])*1920*1080*30/1024)."</span> kbps<br />";
		echo "720p = <span id='720_bitrate'>".round(floatval($options['bitrate_multiplier'])*1280*720*30/1024)."</span> kbps<br />";
		echo "360p = <span id='360_bitrate'>".round(floatval($options['bitrate_multiplier'])*640*360*30/1024)."</span> kbps</span>";
		echo "</div>\n\t";
	}

	function kgvid_h264_profile_callback() {
		$options = kgvid_get_options();
		echo "<div class='kgvid_video_app_required'>";
		echo "<select id='h264_profile' name='kgvid_video_embed_options[h264_profile]' class='affects_ffmpeg'>";
		$items = array("none", "baseline", "main", "high", "high10", "high422", "high444");
		foreach($items as $item) {
			$selected = ($options['h264_profile']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> "._x('profile', 'H.264 profile. Might not need translation', 'video-embed-thumbnail-generator')." <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Lower profiles will slightly increase file sizes. This mostly depends on your need for compatability with Android devices. Main profile seems to work on recent phones, although officially Android only supports baseline. High profile is not recommended for mobile or Flash compatibility, and anything above high is designed for professional video and probably incompatible with consumer devices. Older versions of FFMPEG might ignore this setting altogether.', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<select id='h264_level' name='kgvid_video_embed_options[h264_level]' class='affects_ffmpeg'>";
		$items = array("none", "1", "1.1", "1.2", "1.3", "2", "2.1", "2.2", "3", "3.1", "3.2", "4", "4.1", "4.2", "5", "5.1");
		foreach($items as $item) {
			$selected = ($options['h264_level']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> "._x('level', 'H.264 level. Might not need translation', 'video-embed-thumbnail-generator')." <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('3.0 is default. Lower levels will lower maximum bit rates and decoding complexity. This mostly depends on your need for compatability with mobile devices. Older versions of FFMPEG might ignore this setting altogether.', 'video-embed-thumbnail-generator')."</span></span>";
		echo "</div>\n\t";
	}

	function kgvid_audio_bitrate_options_callback() {
		$options = kgvid_get_options();
		echo "<div class='kgvid_video_app_required'>";
		$items = array(32, 64, 96, 112, 128, 160, 192, 224, 256, 320);
		echo "<select id='audio_bitrate' name='kgvid_video_embed_options[audio_bitrate]' class='affects_ffmpeg'>";
		foreach($items as $item) {
			$selected = ($options['audio_bitrate']==$item) ? 'selected="selected"' : '';
			echo "<option value='$item' $selected>$item</option>";
		}
		echo "</select> kbps";
		echo "</div>\n\t";
	}

	function kgvid_ffmpeg_options_callback() {
		$options = kgvid_get_options();
		echo "<div class='kgvid_video_app_required'>";
		echo "<input class='affects_ffmpeg' onchange='if(jQuery(\"#ffmpeg_vpre\").attr(\"checked\")==\"checked\"){jQuery(\"#video_bitrate_flag\").attr(\"checked\", \"checked\"); jQuery(\"#nostdin\").removeAttr(\"checked\");}' ".checked( $options['video_bitrate_flag'], "on", false )." id='video_bitrate_flag' name='kgvid_video_embed_options[video_bitrate_flag]' type='checkbox' /> <label for='video_bitrate_flag'>".__('Enable legacy FFMPEG "-b" and "-ba" bitrate flags.', 'video-embed-thumbnail-generator')."</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Enable if your installed version of FFMPEG is old enough that you can\'t use the newer -b:v flags (Dreamhost users must turn this on). It may cause newer versions of FFMPEG to fail.', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<input class='affects_ffmpeg' onchange='if(jQuery(\"#ffmpeg_vpre\").attr(\"checked\")==\"checked\"){jQuery(\"#video_bitrate_flag\").attr(\"checked\", \"checked\"); jQuery(\"#nostdin\").removeAttr(\"checked\");}' ".checked( $options['ffmpeg_vpre'], "on", false )." id='ffmpeg_vpre' name='kgvid_video_embed_options[ffmpeg_vpre]' type='checkbox' /> <label for='ffmpeg_vpre'>".__('Enable legacy libx264 parameters.', 'video-embed-thumbnail-generator')."</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Enable if your installed version of FFMPEG is old enough that libx264 requires additional configuration to operate (Dreamhost users must turn this on). This should help if you can encode WEBM or OGV files but H264/Mobile files fail. It could cause newer versions of FFMPEG to fail.', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<input class='affects_ffmpeg' ".checked( $options['ffmpeg_old_rotation'], "on", false )." id='ffmpeg_old_rotation' name='kgvid_video_embed_options[ffmpeg_old_rotation]' type='checkbox' /> <label for='ffmpeg_old_rotation'>".__('Enable legacy FFMPEG rotation method.', 'video-embed-thumbnail-generator')."</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Enable if vertical videos shot on mobile devices don\'t rotate correctly or generate errors. If legacy libx264 paramaters are necessary, rotation won\'t work at all.', 'video-embed-thumbnail-generator')."</span></span><br />";
		echo "<input class='affects_ffmpeg' ".checked( $options['nostdin'], "on", false )." id='nostdin' name='kgvid_video_embed_options[nostdin]' type='checkbox' /> <label for='nostdin'>".__('Disable stdin.', 'video-embed-thumbnail-generator')."</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".__('Turn off this checkbox if your installed version of FFMPEG is old enough that it does not recognize the nostdin flag (Dreamhost users must turn this off).', 'video-embed-thumbnail-generator')."</span></span>";
		echo "</div>\n\t";
	}

	function kgvid_execution_options_callback() {
		$options = kgvid_get_options();

		echo "<div class='kgvid_video_app_required'>";
		echo "<select id='simultaneous_encodes' name='kgvid_video_embed_options[simultaneous_encodes]'>";
		for ($i = 1; $i <= 5; $i++ ) {
			$selected = ($options['simultaneous_encodes']==$i) ? 'selected="selected"' : '';
			echo "<option value='".$i."' $selected>".$i."</option>";
		}
		echo "</select> ".__('Simultaneous encodes.', 'video-embed-thumbnail-generator')." <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __('Increasing the number will allow %1$s to encode more than one file at a time, but may lead to %1$s monopolizing system resources.', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>" )."</span></span><br />";

		echo "<select id='threads' name='kgvid_video_embed_options[threads]' class='affects_ffmpeg'>";
		for ($i = 0; $i <= 16; $i++ ) {
			$selected = ($options['threads']==$i) ? 'selected="selected"' : '';
			echo "<option value='".$i."' $selected>".$i."</option>";
		}
		echo "</select> "._x('threads', 'CPU threads. Might not need translating', 'video-embed-thumbnail-generator')." <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __('Default is 1, which limits encoding speed but prevents encoding from using too many system resources. Selecting 0 will allow %1$s to optimize the number of threads or you can set the number manually. This may lead to %1$s monopolizing system resources.', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>" )."</span></span><br />";

		echo "<input ".checked( $options['nice'], "on", false )." id='nice' name='kgvid_video_embed_options[nice]' class='affects_ffmpeg' type='checkbox' /> <label for='nice'>"._x('Run', 'execute program', 'video-embed-thumbnail-generator')."  <code>nice</code>.</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __('Tells %1$s to run at a lower priority to avoid monopolizing system resources.', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>" )."</span></span>";
		echo "</div>";

	}

	function kgvid_test_ffmpeg_options_callback( $scope = 'site' ) {

		$options = kgvid_get_options();
		$video_formats = kgvid_video_formats(false, false);
		$encode_string = "";
		if ( $options['ffmpeg_exists'] == "on" ) {

			$movie_info = kgvid_get_video_dimensions(plugin_dir_path(__FILE__)."images/sample-video-h264.mp4");
			$uploads = wp_upload_dir();
			$encode_dimensions = kgvid_set_encode_dimensions($movie_info, $video_formats[$options['sample_format']]);
			$encode_string = kgvid_generate_encode_string(plugin_dir_path(__FILE__)."images/sample-video-h264.mp4", $uploads['path']."/sample-video-h264".$video_formats[$options['sample_format']]['suffix'], $movie_info, $options['sample_format'], $encode_dimensions['width'], $encode_dimensions['height'], intval($options['sample_rotate']));
		}

		if ( is_array($encode_string) ) { $encode_string_implode = implode('' , $encode_string); }
		else { $encode_string_implode = ''; }

		$display_div = "";
		if ( $options['ffmpeg_exists'] != "on" ) { $display_div = " style='display:none;'"; }

		$video_formats['fullres']['name'] = __('Replace', 'video-embed-thumbnail-generator');
		if ( array_key_exists('custom', $video_formats) && array_key_exists('name', $video_formats['custom']) )  { $video_formats['custom']['name'] = __('Custom', 'video-embed-thumbnail-generator'); }

		$sample_format_select = "<select id='sample_format' name='kgvid_video_embed_options[sample_format]' class='affects_ffmpeg'>";
		foreach ( $video_formats as $format => $format_stats ) {
			$selected = ($options['sample_format']==$format) ? 'selected="selected"' : '';
			$sample_format_select .= "<option value='$format' $selected>".$format_stats['name']."</option>";
		}
		$sample_format_select .= "</select>";

		echo "<div id='ffmpeg_sample_div'".$display_div."><p>".sprintf( __('Sample %2$s encode command', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>", $sample_format_select)."<br>";
		echo "<input ".checked( $options['sample_rotate'], 90, false )." id='sample_rotate' name='kgvid_video_embed_options[sample_rotate]' class='affects_ffmpeg' value='90' type='checkbox' /> <label for='sample_rotate'>".__('Test video rotation.', 'video-embed-thumbnail-generator')."</label> <span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>".sprintf( __('Tests %1$s\'s ability to rotate vertical videos shot on mobile devices.', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>" )."</span></span><br /><textarea id='ffmpeg_h264_sample' class='ffmpeg_sample_code code' cols='100' rows='5' wrap='soft' readonly='yes'>".$encode_string_implode."</textarea></p>";
		echo "<p>".sprintf( __('%s test output:', 'video-embed-thumbnail-generator'), "<strong class='video_app_name'>".strtoupper($options['video_app'])."</strong>")."<br /><textarea id='ffmpeg_output' class='ffmpeg_sample_code code' cols='100' rows='20' wrap='soft' readonly='yes'></textarea><br>".sprintf( __('For help interpreting this output, %s try our Wiki page on Github', 'video-embed-thumbnail-generator'), "<a href='https://github.com/kylegilman/video-embed-thumbnail-generator/wiki/Interpreting-FFMPEG-or-LIBAV-messages'>")."</a>.</p></div>\n\t";
	}

//end of settings page callback functions

function kgvid_update_settings() {

	global $wpdb;

	$options = kgvid_get_options();
	$options_old = $options; //save the values that are in the db
	$default_options = kgvid_default_options_fn();

	if ( empty($options) ) { // run if the new settings don't exist yet (before version 3.0)

		$options = array();

		$old_setting_equivalents = array (
			"width"=>"wp_FMP_width",
			"height"=>"wp_FMP_height",
			"controlbar_style"=>"wp_FMP_controlbar_style",
			"poster"=>"wp_FMP_poster",
			"endofvideooverlay"=>"wp_FMP_endofvideooverlay",
			"autohide"=>"wp_FMP_autohide",
			"autoplay"=>"wp_FMP_autoplay",
			"loop"=>"wp_FMP_loop",
			"playbutton"=>"wp_FMP_playbutton",
			"stream_type"=>"wp_FMP_stream_type",
			"scale_mode"=>"wp_FMP_scale_mode",
			"bgcolor"=>"wp_FMP_bgcolor",
			"configuration"=>"wp_FMP_configuration",
			"skin"=>"wp_FMP_skin",
			"app_path"=>"wp_FMP_ffmpeg",
			"ffmpeg_exists"=>"wp_FMP_ffmpeg_exists",
			"encode_mobile"=>"wp_FMP_encodemobile",
			"encode_ogg"=>"wp_FMP_encodeogg",
			"encode_webm"=>"wp_FMP_encodewebm",
			"ffmpeg_vpre"=>"wp_FMP_vpre",
			"template"=>"wp_FMP_template",
			"titlecode"=>"wp_FMP_titlecode");

		foreach ($old_setting_equivalents as $new_setting => $old_setting) { //apply any old settings to the new database entry then delete them
			$old_setting_value = get_option($old_setting, "no_setting");
			if ( $old_setting_value != "no_setting" ) {
				if ( $old_setting_value == "true" ) { $old_setting_value = "on"; }
				$options[$new_setting] = $old_setting_value;
				delete_option($old_setting);
			}
		}
		$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE 'wp_FMP%'" );

		foreach ( $default_options as $key => $value ) { //apply default values for any settings that didn't exist before
			if ( !array_key_exists($key, $options) ) { $options[$key] = $value; }
		}

		update_option('kgvid_video_embed_options', $options);
	}

	else { //user is already upgraded to version 3.0, but needs the extra options introduced in later versions
		if ( $options['version'] < 3.1 ) {
			$options['version'] = 3.1;
			if ( $options['ffmpeg_vpre'] == "on" ) { $options['video_bitrate_flag'] = "on"; } //if user has ffmpeg_vpre turned on, they need the old bitrate flags too
			else { $options['video_bitrate_flag'] = false; }
			$options['watermark'] = "";
		}
		if ( $options['version'] < 4.0 ) {
			$options['version'] = 4.0;
			$options['overlay_title'] = false;
			$options['overlay_embedcode'] = false;
			$options['view_count'] = false;
			$options['align'] = "left";
			$options['featured'] = "on";
			$options['thumb_parent'] = "video";
			$options['delete_children'] = "encoded videos only";
			if ( $options['template'] == "on" ) { $options['template'] = "old"; }
			else { $options['template'] = "gentle"; }
			$checkbox_convert = array ( "autohide", "endofvideooverlaysame", "playbutton", "loop", "autoplay" );
			foreach ( $checkbox_convert as $option ) {
				if ( $options[$option] == "true" ) { $options[$option] = "on"; } //some checkboxes were incorrectly set to "true" in older versions
			}
			if ( wp_next_scheduled('kgvid_cleanup_queue') != false ) { //kgvid_cleanup_queue needs an argument!
				wp_clear_scheduled_hook('kgvid_cleanup_queue');
				wp_schedule_event( time()+86400, 'daily', 'kgvid_cleanup_queue', array ( 'scheduled' ) );
			}

		}
		if ( $options['version'] < 4.1 ) {
			$options['version'] = 4.1;
			$options['embeddable'] = "on";
			$options['inline'] = "on";
		}
		if ( $options['version'] < 4.2 ) {
			$options['version'] = 4.2;
			$options["bitrate_multiplier"] = 0.1;
			$options["h264_CRF"] = 23;
			$options["webm_CRF"] = 10;
			$options["ogv_CRF"] = 6;
			$options["audio_bitrate"] = 160;
			$options["threads"] = 1;
			$options["nice"] = "on";
			$options["browser_thumbnails"] = "on";
			$options["rate_control"] = "abr";
			$options["h264_profile"] = "none";
			$options["h264_level"] = "none";
			$options["encode_fullres"] = false;
			$options["auto_encode"] = false;
			$options["auto_thumb"] = false;
			$options["auto_thumb_position"] = 50;
			$options["right_click"] = "on";
			$options["resize"] = "on";
			$options["htaccess_login"] = "";
			$options["htaccess_password"] = "";
			$options["minimum_width"] = false;

			$options["endofvideooverlaysame"] = $options["endOfVideoOverlaySame"];
			unset($options["endOfVideoOverlaySame"]);
			$options["endofvideooverlay"] = $options["endOfVideoOverlay"];
			unset($options["endOfVideoOverlaySame"]);

			$upload_capable = kgvid_check_if_capable('upload_files');
			$options["capabilities"]["make_video_thumbnails"] = $upload_capable;
			$options["capabilities"]["encode_videos"] = $upload_capable;
			kgvid_set_capabilities($options["capabilities"]);

			if ( array_key_exists('embeddable', $options) && $options['embeddable'] != "on" ) { $options['open_graph'] = false; }
			else { $options['open_graph'] = "on"; }

		}
		if ( $options['version'] < 4.25 ) {
			$options['version'] = 4.25;
			kgvid_check_ffmpeg_exists($options, true);
		}
		if ( $options['version'] < 4.3 ) {

			$options['version'] = 4.3;
			$options['jw_player_id'] = '';
			$options['preload'] = "metadata";
			$options['sample_format'] = "mobile";
			$options['ffmpeg_watermark'] = array("url" => "", "scale" => "9", "align" => "right", "valign"=> "bottom", "x" => "6", "y" => "5");
			$options['auto_thumb_number'] = 1;
			$options['simultaneous_encodes'] = 1;
			$options['downloadlink'] = false;

			$edit_others_capable = kgvid_check_if_capable('edit_others_posts');
			$options["capabilities"]["edit_others_video_encodes"] = $edit_others_capable;
			kgvid_set_capabilities($options["capabilities"]);

		}
		if ( $options['version'] < 4.301 ) {
			$options['version'] = 4.301;
			if ( !array_key_exists('capabilities', $options ) ) { //fix bug in 4.3 that didn't create capabilties for single installs
				$options['capabilities'] = $default_options['capabilities'];
			}
			kgvid_set_capabilities($options['capabilities']);
		}

		if ( $options['version'] < 4.303 ) {
			$options['version'] = 4.303;
			$options['volume'] = 1;
			$options['mute'] = false;
			$options['custom_attributes'] = '';
		}
		if ( $options['version'] < 4.304 ) {
			$options['version'] = 4.304;
			$options['gallery_end'] = "";
		}
		if ( $options['version'] < 4.4 ) {
			$options['version'] = 4.4;
			$options['moov_path'] = $options['app_path'];
			$options['replace_format'] = 'fullres';
			$options['custom_format'] = array(
				'format' => 'h264',
				'width' => '',
				'height' => ''
			);
			$options['nostdin'] = false;
			$options['fullwidth'] = false;
			$options['auto_res'] = 'on';
		}
		if ( $options['version'] < 4.5 ) {
			$options['version'] = 4.5;
			if ( $options['auto_res'] == 'on' ) { $options['auto_res'] = 'automatic'; }
			else { $options['auto_res'] = 'highest'; }
			$options['watermark_link_to'] = 'none';
			$options['watermark_url'] = '';
			$options['encode_vp9'] = false;
			$options['gallery_pagination'] = false;
			$options['gallery_per_page'] = false;
			$options['gallery_title'] = "on";
			$options['oembed_provider'] = "on";
			$options['oembed_security'] = false;
			$options['ffmpeg_old_rotation'] = "on";
			$options['click_download'] = "on";
		}
		if ( $options['version'] < 4.6 ) {
			$options['version'] = 4.6;
			if ( !array_key_exists('nativecontrolsfortouch', $options) ) { $options['nativecontrolsfortouch'] = "on"; }
			$options['facebook_button'] = false;
			$options['sample_rotate'] = false;
			$options['twitter_button'] = false;
			$options['twitter_card'] = false;
			$options['schema'] = 'on';
			$options['error_email'] = 'nobody';
			$options['auto_encode_gif'] = false;
			$options['pixel_ratio'] = 'on';
			$options['twitter_username'] = kgvid_get_jetpack_twitter_username();

		}

		if ( $options['version'] != $default_options['version'] ) { $options['version'] = $default_options['version']; }
		if ( $options !== $options_old ) { update_option('kgvid_video_embed_options', $options); }
	}

}
add_action('init', 'kgvid_update_settings' );

function kgvid_validate_ffmpeg_settings($input) {

	$ffmpeg_info = kgvid_check_ffmpeg_exists($input, false);
	if ( $ffmpeg_info['ffmpeg_exists'] == true ) { $input['ffmpeg_exists'] = "on"; }
	$input['app_path'] = $ffmpeg_info['app_path'];

	if ( $ffmpeg_info['exec_enabled'] == false ) {
		add_settings_error( __FILE__, "ffmpeg-disabled", sprintf( __('%1$s is disabled in PHP settings. You can embed existing videos and make thumbnails with compatible browsers, but video encoding will not work. Contact your System Administrator to find out if you can enable %1$s.', 'video-embed-thumbnail-generator'), $ffmpeg_info['function']), "updated");
		$input['ffmpeg_exists'] = "notinstalled";
	}
	elseif ( $ffmpeg_info['ffmpeg_exists'] == false ) {

		$textarea = '';
		if ( count($ffmpeg_info['output']) > 2 ) { $textarea = '<br /><textarea rows="3" cols="70" disabled style="resize: none;">'.implode($ffmpeg_info['output'], "\n").'</textarea>'; }

		add_settings_error( __FILE__, "ffmpeg-disabled", sprintf( __('%1$s is not executing correctly at %2$s. You can embed existing videos and make thumbnails with compatible browsers, but video encoding is not possible without %1$s.', 'video-embed-thumbnail-generator'), strtoupper($input['video_app']), $input['app_path'] ).'<br /><br />'.__('Error message:', 'video-embed-thumbnail-generator').' '.implode(array_slice($ffmpeg_info['output'], -2, 2), " ").$textarea, "updated");
		$input['ffmpeg_exists'] = "notinstalled";
	}

	return $input;

}

function kgvid_video_embed_options_validate($input) { //validate & sanitize input from settings form

	$options = kgvid_get_options();
	$default_options = kgvid_default_options_fn();

	if (isset ($_POST["video-embed-thumbnail-generator-reset"])) {
		$input = $default_options;
		add_settings_error( __FILE__, "options-reset", __("Video Embed & Thumbnail Generator settings reset to default values.", 'video-embed-thumbnail-generator'), "updated" );
	}

	if ( $input['app_path'] != $options['app_path'] || strtoupper($input['video_app']) != strtoupper($options['video_app']) ) {
		$input = kgvid_validate_ffmpeg_settings($input);
	}
	else { $input['ffmpeg_exists'] = $options['ffmpeg_exists']; }

	if ( $input['ffmpeg_exists'] == "notinstalled" ) { $input['browser_thumbnails'] = "on"; } //in case a user had FFMPEG installed and disabled it, they can't choose to disable browser thumbnails if it's no longer installed

	if ( empty($input['width']) ) {
		add_settings_error( __FILE__, "width-zero", __("You must enter a value for the maximum video width.", 'video-embed-thumbnail-generator') );
		$input['width'] = $options['width'];
	}
	if ( empty($input['height']) ) {
		add_settings_error( __FILE__, "height-zero", __("You must enter a value for the maximum video height.", 'video-embed-thumbnail-generator') );
		$input['height'] = $options['height'];
	}
	if ( empty($input['gallery_width']) ) {
		add_settings_error( __FILE__, "gallery-width-zero", __("You must enter a value for the maximum gallery video width.", 'video-embed-thumbnail-generator') );
		$input['gallery_width'] = $options['gallery_width'];
	}

	if ( $input['capabilities'] !== $options['capabilities'] ) { kgvid_set_capabilities($input['capabilities']); }

	$input['titlecode'] =  wp_kses_post( $input['titlecode'] );

	if ( is_array($input['custom_format']) && ( !empty($input['custom_format']['width']) || !empty($input['custom_format']['height']) ) ) {

		$video_formats = kgvid_video_formats();

		$input['custom_format']['name'] = 'Custom';
		if ( !empty($input['custom_format']['height']) ) {
			$input['custom_format']['name'] .= ' '.$input['custom_format']['height'].'p';
			$input['custom_format']['label'] = $input['custom_format']['height'].'p';
		}
		else {
			$input['custom_format']['name'] .= ' '.$input['custom_format']['width'].' width';
			$approx_height = round(intval($input['custom_format']['width'])*0.5625);
			if ($approx_height % 2 != 0) { $approx_height--; } //make sure it's an even number
			$input['custom_format']['label'] = $approx_height.'p';
		}
		if ( $input['custom_format']['format'] == 'h264' ) {
			$input['custom_format']['name'] .= ' H.264';
			$input['custom_format']['extension'] = 'mp4';
			$input['custom_format']['mime'] = 'video/mp4';
			$input['custom_format']['vcodec'] = 'libx264';
		}
		else {
			$input['custom_format']['name'] .= ' '.strtoupper($input['custom_format']['format']);
			$input['custom_format']['extension'] = $video_formats[$input['custom_format']['format']]['extension'];
			$input['custom_format']['mime'] = $video_formats[$input['custom_format']['format']]['mime'];
			$input['custom_format']['vcodec'] = $video_formats[$input['custom_format']['format']]['vcodec'];
			if ( $input['custom_format']['format'] == 'ogg' ) { $input['custom_format']['type'] = 'ogv'; }
		}
		if ( $input['custom_format']['format'] == 'ogg' ) { $input['custom_format']['type'] = 'ogv'; }
		else { $input['custom_format']['type'] = $input['custom_format']['format']; }
		$input['custom_format']['suffix'] = '-custom.'.$input['custom_format']['extension'];

	} // if the custom format has been set
	else {

		if ( $input['sample_format'] == 'custom' ) { $input['sample_format'] = 'mobile'; }

	}

	if ( intval($options['auto_thumb_number']) == 1 && intval($input['auto_thumb_number']) > 1 ) {
		$input['auto_thumb_position'] = strval ( round( intval($input['auto_thumb_number']) * (intval($options['auto_thumb_position'])/100) ) );
		if ( $input['auto_thumb_position'] == "0" ) {
			$input['auto_thumb_position'] = "1";
		}
	}
	if ( intval($options['auto_thumb_number']) > 1 && intval($input['auto_thumb_number']) == 1 ) {
		//round to the nearest 25 but not 100
		$input['auto_thumb_position'] = strval( round( round( intval($options['auto_thumb_position'])/intval($options['auto_thumb_number']) * 4 ) / 4 * 100 ) );
		if ( $input['auto_thumb_position'] == "100" ) {
			$input['auto_thumb_position'] = "75";
		}
	}

	if ( intval($input['auto_thumb_number']) > 1 && intval($input['auto_thumb_position']) > intval($input['auto_thumb_number']) ) {
		$input['auto_thumb_position'] = $input['auto_thumb_number'];
	}

	if ( intval($input['auto_thumb_number']) == 0 ) {
		$input['auto_thumb_number'] = $options['auto_thumb_number'];
	}

	 // load all settings and make sure they get a value of false if they weren't entered into the form
	foreach ( $default_options as $key => $value ) {
		if ( !array_key_exists($key, $input) ) { $input[$key] = false; }
	}

	if ( $input['embeddable'] == false ) { $input['overlay_embedcode'] = false; }

	$input['version'] = $default_options['version']; //since this isn't user selectable it has to be re-entered every time

	return $input;
}

function kgvid_ajax_save_settings() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if ( current_user_can('manage_options') ) {

		$setting = $_POST['setting'];
		$value = $_POST['value'];
		parse_str($_POST['all_settings'], $all_settings);
		$error_message = "";
		$encode_string = array();
		$auto_thumb_label = "";
		global $wp_settings_errors;

		if ( function_exists( 'is_plugin_active_for_network' ) && is_plugin_active_for_network( plugin_basename(__FILE__) ) && !array_key_exists('embed_method', $all_settings['kgvid_video_embed_options']) ) {
			$validated_options = kgvid_validate_network_settings($all_settings['kgvid_video_embed_options']);
			$options_updated = update_site_option('kgvid_video_embed_network_options', $validated_options);
		}
		else { //single site on the network
			$validated_options = kgvid_video_embed_options_validate($all_settings['kgvid_video_embed_options']);
			$options_updated = update_option('kgvid_video_embed_options', $validated_options);

			if ( $validated_options['ffmpeg_exists'] == "on" ) {
				$movie_info = kgvid_get_video_dimensions(plugin_dir_path(__FILE__)."images/sample-video-h264.mp4");
				$uploads = wp_upload_dir();
				$video_formats = kgvid_video_formats();
				$encode_dimensions = kgvid_set_encode_dimensions($movie_info, $video_formats[$validated_options['sample_format']]);
				$encode_string = kgvid_generate_encode_string(plugin_dir_path(__FILE__)."images/sample-video-h264.mp4", $uploads['path']."/sample-video-h264".$video_formats[$validated_options['sample_format']]['suffix'], $movie_info, $validated_options['sample_format'], $encode_dimensions['width'], $encode_dimensions['height'], intval($validated_options['sample_rotate']));
				$auto_thumb_label = kgvid_generate_auto_thumb_label();
			}
		}

		if ( !empty($wp_settings_errors) ) { $error_message = $wp_settings_errors[0]['message']; }

		if ( strpos($setting, 'capability') !== false || strpos($setting, 'default_capabilities') !== false || strpos($setting, 'ffmpeg_watermark') !== false || strpos($setting, 'custom_format') !== false ) { $validated_options[$setting] = $value; }

		$arr = array ( "error_message" => $error_message, "validated_value" => $validated_options[$setting], "ffmpeg_exists" => $validated_options['ffmpeg_exists'], "encode_string" => implode('', $encode_string), "app_path" => $validated_options['app_path'], "auto_thumb_label" => $auto_thumb_label );
		echo json_encode($arr);
		die();
	}
}
add_action('wp_ajax_kgvid_save_settings', 'kgvid_ajax_save_settings');

function kgvid_add_attachment_handler($post_id) {

	$options = kgvid_get_options();
	$filename = get_attached_file($post_id);

	if ( $options['auto_encode'] == "on" ||  $options['auto_thumb'] == "on" ) {

		$post = get_post($post_id);
		$is_video = kgvid_is_video($post);

		if ( $is_video ) {

			wp_schedule_single_event( time() + rand(0,10), 'kgvid_cron_new_attachment', array($post_id) );
			$transient = get_transient( 'kgvid_new_attachment_transient' ); //error checking to avoid race conditions when using Add From Server
			if ( is_array($transient) ) { $transient[] = $post_id; }
			else { $transient = array($post_id); }
			set_transient( 'kgvid_new_attachment_transient', $transient, DAY_IN_SECONDS );

		}

	}

}
add_action('add_attachment', 'kgvid_add_attachment_handler');

function kgvid_cron_new_attachment_handler($post_id, $force = false) {

	$options = kgvid_get_options();
	if ( $force == 'thumbs' ) { $options['auto_encode'] = false; }
	if ( $force == 'encode' ) { $options['auto_thumb'] = false; }

	$post = get_post($post_id);
	$movieurl = wp_get_attachment_url($post_id);
	$filepath = get_attached_file($post_id);
	$is_animated = kgvid_is_animated_gif($filepath);

	if ( $post && $post->post_mime_type != 'image/gif' && ( $force == 'thumbs' || $options['auto_thumb'] == "on" ) ) {

		$thumb_output = array();
		$thumb_id = array();
		$numberofthumbs = intval($options['auto_thumb_number']);

		if ( $numberofthumbs == 1 ) {

			switch ( $options['auto_thumb_position'] ) {
				case 0:
					$imaginary_numberofthumbs = 1;
					$iincreaser = 1;
					$thumbtimecode = "firstframe";
					$dofirstframe = true;
					break;
				case 25:
					$imaginary_numberofthumbs = 8;
					$iincreaser = 4;
					$thumbtimecode = "";
					$dofirstframe = false;
					break;
				case 50:
					$imaginary_numberofthumbs = 8;
					$iincreaser = 8;
					$thumbtimecode = "";
					$dofirstframe = false;
					break;
				case 75:
					$imaginary_numberofthumbs = 8;
					$iincreaser = 12;
					$thumbtimecode = "";
					$dofirstframe = false;
					break;
			}

			$thumb_output[1] = kgvid_make_thumbs($post_id, $movieurl, $imaginary_numberofthumbs, 1, $iincreaser, $thumbtimecode, $dofirstframe, 'generate');
			$thumb_key = 1;

		}//end if just one auto_thumb

		if ( $numberofthumbs > 1 ) {

			$thumb_key = intval($options['auto_thumb_position']);

			$i = 1;
			$increaser = 0;
			$iincreaser = 0;
			while ( $i <= $numberofthumbs ) {
				$iincreaser = $i + $increaser;
				$thumb_output[$i] = kgvid_make_thumbs($post_id, $movieurl, $numberofthumbs, $i, $iincreaser, '', false, 'generate');
				if ( $thumb_output[$i]['lastthumbnumber'] == 'break' ) {
					$thumb_key = $i;
					break;
				}
				$increaser++;
				$i++;
			}

		}//end if more than one auto_thumb

		foreach ( $thumb_output as $key=>$output ) {

			if ( $thumb_output[$key]['lastthumbnumber'] != 'break' ) {
				if ( $numberofthumbs == 1 ) { $index = false; }
				else { $index = $key; }
				$thumb_id[$key] = kgvid_save_thumb($post_id, $post->post_title, $thumb_output[$key]['thumb_url'], $index);
			}//end if there wasn't an error
			else {
				$kgvid_postmeta = kgvid_get_attachment_meta($post_id);
				$kgvid_postmeta['autothumb-error'] = $thumb_output[$thumb_key]['embed_display'];
				kgvid_save_attachment_meta($post_id, $kgvid_postmeta);
			}

		}//end loop through generated thumbnails to save them in the database

		if ( !empty($thumb_id[$thumb_key]) ) {
			$thumb_output[$thumb_key]['thumb_url'] = wp_get_attachment_url($thumb_id[$thumb_key]);
			update_post_meta($post_id, '_kgflashmediaplayer-poster', $thumb_output[$thumb_key]['thumb_url']);
			update_post_meta($post_id, '_kgflashmediaplayer-poster-id', $thumb_id[$thumb_key]);
			set_post_thumbnail($post_id, $thumb_id[$thumb_key]);
			if( $options['featured'] == "on" ) {
				if ( !empty($thumb_id[$thumb_key]) && !empty($post->post_parent) ) { set_post_thumbnail($post->post_parent, $thumb_id[$thumb_key]); }
			}
		}//end setting main thumbnail

	}//end if auto_thumb is on

	if ( $post && ( $force == 'encode' || $options['auto_encode'] == "on" )
		&& ( !$is_animated || $options['auto_encode_gif'] == "on" )
	) {

		$video_formats = kgvid_video_formats();
		$kgvid_postmeta = kgvid_get_attachment_meta($post_id);
		$extension = pathinfo($filepath, PATHINFO_EXTENSION);
		$something_to_encode = false;
		$encode_checked = array();

		if ( substr(basename($filepath, '.'.$extension), -10) == '-noreplace'
			|| ( array_key_exists('original_replaced', $kgvid_postmeta) && $kgvid_postmeta['original_replaced'] == $options['replace_format'] )
		) {
			$options['encode_fullres'] = false;
		}

		if ( $post->post_mime_type == 'image/gif' ) {
			$fullres_only = array('fullres');
			$video_formats = array_intersect_key($video_formats, array_flip($fullres_only));
		}

		foreach ( $video_formats as $format => $format_stats ) {

			if ( array_key_exists('encode_'.$format, $options) && $options['encode_'.$format] == "on" ) {
				$encode_checked[$format] = "true";
				$something_to_encode = true;
			}

			else { $encode_checked[$format] = "notchecked"; }

		}

		if ( $something_to_encode ) {
			$output = kgvid_enqueue_videos($post_id, $movieurl, $encode_checked, $post->post_parent);
			$output = kgvid_encode_videos();

		}

	}//end if auto_encode

}
add_action('kgvid_cron_new_attachment', 'kgvid_cron_new_attachment_handler');

function kgvid_change_thumbnail_parent( $post_id, $parent_id ) {

	$args = array(
		'post_type' => 'attachment',
		'post_mime_type' => 'image',
		'numberposts' => '-1',
		'meta_key' => '_kgflashmediaplayer-video-id',
		'meta_value' => $post_id,
	);
	$thumbnails = get_posts( $args ); //find all thumbnail children of the video in the database

	if ( $thumbnails ) {

		foreach ( $thumbnails as $thumbnail ) {

			if ( $thumbnail->post_parent != $parent_id )  {

				if ( empty($parent_id) ) {
					$thumbnail->post_parent = $post_id;
				}

				else { //parent post exists
					$thumbnail->post_parent = $parent_id;
				}

				wp_update_post( $thumbnail );
			}

		}//end loop through thumbnails

	}//end if thumbnails

}

function kgvid_upload_page_change_thumbnail_parent( $location ) {

	if( ! is_admin() ) { return $location; }

	global $pagenow;
	$options = kgvid_get_options();

    if ( 'upload.php' == $pagenow
    	&& isset( $_REQUEST['media'] )
    	&& is_array( $_REQUEST['media'] )
    	&& $options['thumb_parent'] == 'post'
    ) {

        if ( isset( $_REQUEST['found_post_id'] ) )  { $parent_id = (int) $_REQUEST['found_post_id']; }
        else { $parent_id = 0; }

		foreach ( $_REQUEST['media'] as $post_id ) {

			kgvid_change_thumbnail_parent( $post_id, $parent_id );

			if ( $options['featured'] == 'on' && !has_post_thumbnail( $parent_id ) ) {
				$featured_id = get_post_meta($post_id, '_kgflashmediaplayer-poster-id', true);
				if ( !empty($featured_id) ) {
					set_post_thumbnail($parent_id, $featured_id);
				}
			}

		}//end loop through modified attachments

    }//end if changed parent

	return $location;

}
add_filter( 'wp_redirect', 'kgvid_upload_page_change_thumbnail_parent' ); //when attachment parent is manually changed on the Media Library page

function kgvid_validate_post_updated( $post_id ) {

	$options = kgvid_get_options();
	$post = get_post($post_id);
	$is_video = kgvid_is_video($post);

	if ( $is_video ) {

		if ( $options['thumb_parent'] == 'post' ) {
			kgvid_change_thumbnail_parent( $post_id, $post->post_parent );
		}

		if ( $options['featured'] == 'on' && !has_post_thumbnail( $post->post_parent ) ) {
			$featured_id = get_post_meta($post_id, '_kgflashmediaplayer-poster-id', true);
			if ( !empty($featured_id) ) {
				set_post_thumbnail($post->post_parent, $featured_id);
			}
		}
	}

}
add_action( 'edit_attachment', 'kgvid_validate_post_updated' );

/**
 * Adding our custom fields to the $form_fields array
 *
 * @param array $form_fields
 * @param object $post
 * @return array
 */
function kgvid_image_attachment_fields_to_edit($form_fields, $post) {

	$options = kgvid_get_options();
	$is_video = kgvid_is_video($post);

	if ( $is_video ) {

		wp_enqueue_media(); //allows using the media modal in the Media Library
		wp_enqueue_script( 'kgvid_video_plugin_admin' );
		wp_enqueue_style( 'video_embed_thumbnail_generator_style' );

		global $user_ID;

		$field_id = kgvid_backwards_compatible($post->ID);
		$movieurl = wp_get_attachment_url($post->ID);
		$moviefile = get_attached_file($post->ID);
		$kgvid_postmeta = kgvid_get_attachment_meta($post->ID);
		$created_time = time()-get_post_time('U', true, $post->ID);

		if ( $user_ID == $post->post_author || current_user_can('edit_others_posts') ) {
			$readonly = '';
			$security_disabled = '';
		}
		else {
			$readonly = ' readonly';
			$security_disabled = ' disabled';
		}

		$form_fields["kgflashmediaplayer-url"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-url"]["value"] = $movieurl;

		$video_aspect = NULL;
		$dimensions_saved = false;
		$video_meta = wp_get_attachment_metadata( $post->ID );
		if ( is_array($video_meta) && array_key_exists('width', $video_meta) && array_key_exists('height', $video_meta) ) { $video_aspect = $video_meta['height']/$video_meta['width']; }
		if ( !empty($kgvid_postmeta['width']) && !empty($kgvid_postmeta['height']) ) {
			if ( empty($video_aspect) ) { $video_aspect = $kgvid_postmeta['height']/$kgvid_postmeta['width']; }
			$dimensions_saved = true;
		}

		$dimension_words = array('width', 'height');
		$max = array();
		$set = array();

		foreach ( $dimension_words as $dimension ) {

			$max[$dimension] = $options[$dimension];
			if ( $dimensions_saved ) { $set[$dimension] = $kgvid_postmeta[$dimension]; }
			elseif ( $dimension == 'width' && $options['minimum_width'] == "on" ) { $set[$dimension] = $max[$dimension]; }
			else {
				if ( is_array($video_meta) && array_key_exists($dimension, $video_meta) && intval($video_meta[$dimension]) <= intval($max[$dimension]) ) { $set[$dimension] = $video_meta[$dimension]; }
				else { $set[$dimension] = $max[$dimension]; }
			}
			if ( !$dimensions_saved ) { $kgvid_postmeta[$dimension] = $set[$dimension]; }

			$form_fields["kgflashmediaplayer-max".$dimension]["input"] = "hidden";
			$form_fields["kgflashmediaplayer-max".$dimension]["value"] = $max[$dimension];

		}

		$form_fields["kgflashmediaplayer-aspect"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-aspect"]["value"] = round($set['height']/$set['width'], 5);

		$nonce = wp_create_nonce('video-embed-thumbnail-generator-nonce');
		$form_fields["kgflashmediaplayer-security"]["input"] = "hidden";
		$form_fields["kgflashmediaplayer-security"]["value"] = $nonce;

		if ( $post->post_mime_type != 'image/gif' ) {
			$form_fields["views"]["label"] = __('Video Stats', 'video-embed-thumbnail-generator');
			$form_fields["views"]["input"] = "html";
			$form_fields["views"]["html"] = sprintf( _n('%d Start', '%d Starts', intval($kgvid_postmeta['starts']), 'video-embed-thumbnail-generator'), intval($kgvid_postmeta['starts']) ).', '.sprintf( _n('%d Complete View', '%d Complete Views', intval($kgvid_postmeta['completeviews']), 'video-embed-thumbnail-generator'), intval($kgvid_postmeta['completeviews']) ).'<br />'.__('Video ID:', 'video-embed-thumbnail-generator').' '.$post->ID;

			// ** Thumbnail section **//

			$thumbnail_url = get_post_meta($post->ID, "_kgflashmediaplayer-poster", true);
			if ( is_ssl() ) { $thumbnail_url = str_replace('http:', 'https:', $thumbnail_url); }

			$thumbnail_html = "";
			if ( !empty($kgvid_postmeta['autothumb-error']) && empty($thumbnail_url) ) {
				$thumbnail_html = '<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box">'.$kgvid_postmeta['autothumb-error'].'</div>';
			}
			elseif ( !empty($thumbnail_url) ) {
				$thumbnail_html = '<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box"><img width="200" src="'.$thumbnail_url.'"></div>';
			}

			$choose_from_video_content = "";
			$generate_content = "";
			$thumbnail_timecode = "";

			if ( !isset($options['ffmpeg_exists']) || $options['ffmpeg_exists'] == "notchecked" ) {
					kgvid_check_ffmpeg_exists($options, true);
				}
			if ( $options['ffmpeg_exists'] == "notinstalled" ) { $ffmpeg_disabled_text = 'disabled="disabled" title="'.sprintf( __('%1$s not found at %2$s and unable to load video in browser for thumbnail generation.', 'video-embed-thumbnail-generator'), strtoupper($options['video_app']), $options['app_path'] ).'"'; }
			else { $ffmpeg_disabled_text = ""; }

			$update_script = "";
			if ( $options['ffmpeg_exists'] == "on" && $options['auto_thumb'] == "on" && !$thumbnail_url && $created_time < 60 ) {
				$update_script = '<script type="text/javascript">jQuery(document).ready(function() { setTimeout(function(){ kgvid_redraw_thumbnail_box("'.$post->ID.'") }, 5000); });</script>';
				$thumbnail_html = '<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box" style="height:112px;"><span style="margin-top: 45px;
	display: inline-block;">Loading thumbnail...</span></div>';
			}

			if ( empty($security_disabled) && current_user_can('make_video_thumbnails') ) {

				if ( !empty($kgvid_postmeta['thumbtime']) ) { $kgvid_postmeta['numberofthumbs'] = "1"; }

				$args = array(
					'mime_type' => 'image/jpeg',
					'methods' => array(
						'save'
					)
				);
				$img_editor_works = wp_image_editor_supports($args);

				$moviefiletype = pathinfo($movieurl, PATHINFO_EXTENSION);
				$h264compatible = array("mp4", "mov", "m4v");
				if ( $moviefiletype == "mov" || $moviefiletype == "m4v" ) { $moviefiletype = "mp4"; }

				$video_formats = kgvid_video_formats();
				$encodevideo_info = kgvid_encodevideo_info($movieurl, $post->ID);
				if ( in_array($moviefiletype, $h264compatible) ) {
					$encodevideo_info["original"]["exists"] = true;
					$encodevideo_info["original"]["url"] = $movieurl;
					$video_formats = array( "original" => array("mime" => "video/".$moviefiletype) ) + $video_formats;
				}
				else { $encodevideo_info["original"]["exists"] = false; }

				$sources = array();

				foreach ($video_formats as $format => $format_stats) {
					if ( $format != "original" && $encodevideo_info[$format]["url"] == $movieurl ) { unset($sources['original']); }
					if ( $encodevideo_info[$format]["exists"] ) { $sources[$format] = '<source src="'.$encodevideo_info[$format]["url"].'" type="'.$format_stats["mime"].'">'; }
				}

				if ( $img_editor_works ) {
					$choose_from_video_content = '<div style="display:none;" class="kgvid_thumbnail_box kgvid-tabs-content" id="thumb-video-'.$post->ID.'-container">
						<div class="kgvid-reveal-thumb-video" onclick="kgvid_reveal_thumb_video('.$post->ID.')" id="show-thumb-video-'.$post->ID.'"><span class="kgvid-right-arrow"></span><span class="kgvid-show-video">'.__('Choose from video...', 'video-embed-thumbnail-generator').'</span></div>
						<div style="display:none;" id="thumb-video-'.$post->ID.'-player">
							<video crossorigin="anonymous" preload="metadata" class="kgvid-thumb-video" width="200" data-allowed="'.$options['browser_thumbnails'].'" onloadedmetadata="kgvid_thumb_video_loaded(\''.$post->ID.'\');" id="thumb-video-'.$post->ID.'" controls>'.
							implode("\n", $sources).'
							</video>
							<div class="kgvid-video-controls">
								<div class="kgvid-play-pause"></div>
								<div class="kgvid-seek-bar">
									<div class="kgvid-play-progress"></div>
									<div class="kgvid-seek-handle"></div></div>
							</div>
							<span id="manual-thumbnail" class="button-secondary" onclick="kgvid_thumb_video_manual('.$post->ID.');">Use this frame</span>
						</div>
					</div>';
				}
				else {
					$choose_from_video_content = '<div class="kgvid_thumbnail_box">Thumbnail selection requires GD or Imagick PHP libraries.</div>';
				}
				$generate_content = '<div id="generate-thumb-'.$post->ID.'-container" class="kgvid-tabs-content">
				<input id="attachments-'. $post->ID .'-kgflashmediaplayer-numberofthumbs" name="attachments['.$post->ID.'][kgflashmediaplayer-numberofthumbs]" type="text" value="'.$kgvid_postmeta['numberofthumbs'].'" maxlength="2" style="width:35px;text-align:center;" onchange="kgvid_disable_thumb_buttons(\''.$post->ID.'\', \'onchange\');document.getElementById(\''.$field_id['thumbtime'].'\').value =\'\';" '.$ffmpeg_disabled_text.$readonly.'/>
				<input type="button" id="attachments-'. $post->ID .'-thumbgenerate" class="button-secondary" value="'._x('Generate', 'Button text. Implied "Generate thumbnails"', 'video-embed-thumbnail-generator').'" name="thumbgenerate" onclick="kgvid_generate_thumb('. $post->ID .', \'generate\');" '.$ffmpeg_disabled_text.'/>
				<input type="button" id="attachments-'. $post->ID .'-thumbrandomize" class="button-secondary" value="'._x('Randomize', 'Button text. Implied "Randomize thumbnail generation"', 'video-embed-thumbnail-generator').'" name="thumbrandomize" onclick="kgvid_generate_thumb('. $post->ID .', \'random\');" '.$ffmpeg_disabled_text.'/>
				<span style="white-space:nowrap;"><input type="checkbox" id="attachments-'. $post->ID .'-firstframe" name="attachments['.$post->ID.'][kgflashmediaplayer-forcefirst]" onchange="document.getElementById(\''.$field_id['thumbtime'].'\').value =\'\';" '.checked( $kgvid_postmeta['forcefirst'], 'on', false ).' '.$ffmpeg_disabled_text.$readonly.'/> <label for="attachments-'. $post->ID .'-firstframe">'.__('Force 1st frame thumbnail', 'video-embed-thumbnail-generator').'</label></span></div>';

				$thumbnail_timecode = __('Thumbnail timecode:', 'video-embed-thumbnail-generator').' <input name="attachments['. $post->ID .'][kgflashmediaplayer-thumbtime]" id="attachments-'. $post->ID .'-kgflashmediaplayer-thumbtime" type="text" value="'. $kgvid_postmeta['thumbtime'] .'" style="width:60px;"'.$readonly.'><br>';

			}


			$form_fields["kgflashmediaplayer-autothumb-error"]["input"] = "hidden";
			$form_fields["kgflashmediaplayer-autothumb-error"]["value"] = $kgvid_postmeta['autothumb-error'];


			$form_fields["generator"]["label"] = _x("Thumbnails", 'Header for thumbnail section', 'video-embed-thumbnail-generator');
			$form_fields["generator"]["input"] = "html";
			$form_fields["generator"]["html"] = $choose_from_video_content.'
			'.$generate_content.'
			'.$thumbnail_timecode.'
			<div id="attachments-'.$post->ID.'-thumbnailplaceholder" style="position:relative;">'. $thumbnail_html .'</div>';
			if ( empty($security_disabled) ) {
				$form_fields["generator"]["html"] .= '<span id="pick-thumbnail" class="button-secondary" style="margin:10px 0;" data-choose="'.__('Choose a Thumbnail', 'video-embed-thumbnail-generator').'" data-update="'.__('Set as video thumbnail', 'video-embed-thumbnail-generator').'" data-change="attachments-'. $post->ID .'-kgflashmediaplayer-poster" onclick="kgvid_pick_image(this);">'.__('Choose from Library', 'video-embed-thumbnail-generator').'</span><br />
				<input type="checkbox" id="attachments-'. $post->ID .'-featured" name="attachments['.$post->ID.'][kgflashmediaplayer-featured]" '.checked( $kgvid_postmeta['featured'], 'on', false ).' '.$ffmpeg_disabled_text.'/> <label for="attachments-'. $post->ID .'-featured">'.__('Set thumbnail as featured image', 'video-embed-thumbnail-generator').'</label>';
			}

			$form_fields["generator"]["html"] .= $update_script;

			if ( empty($security_disabled) ) {
				$form_fields["kgflashmediaplayer-poster"]["label"] = __("Thumbnail URL", 'video-embed-thumbnail-generator');
				$form_fields["kgflashmediaplayer-poster"]["value"] = get_post_meta($post->ID, "_kgflashmediaplayer-poster", true);
				$form_fields["kgflashmediaplayer-poster"]["helps"] = "<small>".sprintf( __('Leave blank to use %sdefault thumbnail', 'video-embed-thumbnail-generator'), "<a href='options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php' target='_blank'>" )."</a>.</small>";
			}

			$form_fields["kgflashmediaplayer-dimensions"]["label"] = __("Video Embed Dimensions", 'video-embed-thumbnail-generator');
			$form_fields["kgflashmediaplayer-dimensions"]["input"] = "html";
			$form_fields["kgflashmediaplayer-dimensions"]["html"] = __('Width:', 'video-embed-thumbnail-generator').' <input name="attachments['. $post->ID .'][kgflashmediaplayer-width]" id="attachments-'. $post->ID .'-kgflashmediaplayer-width" type="text" value="'.$kgvid_postmeta['width'].'" style="width:50px;" data-minimum="'.$options['minimum_width'].'" onchange="kgvid_set_dimension('.$post->ID.', \'height\', this.value);" onkeyup="kgvid_set_dimension('.$post->ID.', \'height\', this.value);"'.$readonly.'> '.__('Height:', 'video-embed-thumbnail-generator').'
			<input name="attachments['. $post->ID .'][kgflashmediaplayer-height]" id="attachments-'. $post->ID .'-kgflashmediaplayer-height" type="text" value="'.$kgvid_postmeta['height'].'" style="width:50px;" onchange="kgvid_set_dimension('.$post->ID.', \'width\', this.value);" onkeyup="kgvid_set_dimension('.$post->ID.', \'width\', this.value);"'.$readonly.'> <br />
			<input type="checkbox" name="attachments['. $post->ID .'][kgflashmediaplayer-lockaspect]" id="attachments-'. $post->ID .'-kgflashmediaplayer-lockaspect" onclick="kgvid_set_aspect('.$post->ID.', this.checked);" '.checked( $kgvid_postmeta['lockaspect'], 'on', false ).$security_disabled.'>
			<label for="attachments-'. $post->ID .'-kgflashmediaplayer-lockaspect"><small>'.__('Lock to aspect ratio', 'video-embed-thumbnail-generator').'</small></label>';
			$form_fields["kgflashmediaplayer-dimensions"]["helps"] = "<small>".sprintf( __('Leave blank to use %sdefault dimensions', 'video-embed-thumbnail-generator'), "<a href='options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php' target='_blank'>" )."</a>.</small>";

		} //end if not GIF

		$checkboxes = kgvid_generate_encode_checkboxes($movieurl, $post->ID, "attachment");

		$form_fields["kgflashmediaplayer-encode"]["label"] = __("Additional Formats", 'video-embed-thumbnail-generator');
		$form_fields["kgflashmediaplayer-encode"]["input"] = "html";
		$form_fields["kgflashmediaplayer-encode"]["html"] = $checkboxes['checkboxes'];

		if ( $options['ffmpeg_exists'] == "on" && $options['auto_encode'] == "on" && $created_time < 60 ) {
			$form_fields["kgflashmediaplayer-encode"]["html"] .= '<script type="text/javascript">jQuery(document).ready(function() { percent_timeout = setTimeout(function(){ kgvid_redraw_encode_checkboxes("'.$movieurl.'", "'.$post->ID.'", "attachment", "") }, 5000); jQuery(\'#wpwrap\').data("KGVIDCheckboxTimeout", percent_timeout); });</script>';
		}


		if ( $post->post_mime_type != 'image/gif' ) {

			$tracks_html = '';
			if ( is_array($kgvid_postmeta['track']) ) {
				foreach ( $kgvid_postmeta['track'] as $track => $track_attribute ) {
					if ( !empty($kgvid_postmeta['track'][$track]['src']) ) {
						$items = array(__("subtitles", 'video-embed-thumbnail-generator')=>"subtitles", __("captions", 'video-embed-thumbnail-generator')=>"captions", __("chapters", 'video-embed-thumbnail-generator')=>"chapters");
						$track_type_select = '<select name="attachments['.$post->ID.'][kgflashmediaplayer-track]['.$track.'][kind]" id="attachments-'.$post->ID.'-kgflashmediaplayer-track_'.$track.'_kind]"'.$security_disabled.'>';
						foreach($items as $name=>$value) {
							$selected = ($kgvid_postmeta['track'][$track]['kind']==$value) ? ' selected="selected"' : '';
							$track_type_select .= "<option value='$value'".$selected.">$name</option>";
						}
						$track_type_select .= "</select>";

						if ( !array_key_exists( 'default', $kgvid_postmeta['track'][$track] ) ) { $kgvid_postmeta['track'][$track]['default'] = false; }

						$tracks_html .= '<div id="kgflashmediaplayer-'.$post->ID.'-trackdiv-'.$track.'" class="kgvid_thumbnail_box kgvid_track_box"><strong>'._x('Track', 'captions track', 'video-embed-thumbnail-generator').' '.strval($track+1).'</strong>';
						if ( empty($security_disabled) ) {
							$tracks_html .= '<span class="kgvid_track_box_removeable" data-trackid="'.$track.'" onclick="jQuery(this).siblings(\'input\').val(\'\').attr(\'checked\', \'\').change();">X</span>';
						}
						$tracks_html .= '<br />'.__('Track type:', 'video-embed-thumbnail-generator').' '.$track_type_select.'<br />';
						if ( empty($security_disabled) ) {
							$tracks_html .= '<span id="pick-track'.$track.'" class="button-secondary" style="margin:10px 0;" data-choose="'.__('Choose a Text File', 'video-embed-thumbnail-generator').'" data-update="'.__('Set as track source', 'video-embed-thumbnail-generator').'" data-change="attachments-'. $post->ID .'-kgflashmediaplayer-track_'.$track.'_src" onclick="kgvid_pick_attachment(this);">'.__('Choose from Library', 'video-embed-thumbnail-generator').'</span><br />';
						}
						$tracks_html .= 'URL: <input name="attachments['. $post->ID .'][kgflashmediaplayer-track]['.$track.'][src]" id="attachments-'. $post->ID .'-kgflashmediaplayer-track_'.$track.'_src" type="text" value="'.$kgvid_postmeta['track'][$track]['src'].'" class="text" style="width:180px;"'.$readonly.'><br />
						'._x('Language code:', 'two-letter code indicating track\'s language', 'video-embed-thumbnail-generator').' <input name="attachments['. $post->ID .'][kgflashmediaplayer-track]['.$track.'][srclang]" id="attachments-'. $post->ID .'-kgflashmediaplayer-track_'.$track.'_srclang" type="text" value="'.$kgvid_postmeta['track'][$track]['srclang'].'" maxlength="2" style="width:40px;"'.$readonly.'><br />
						'.__('Label:', 'video-embed-thumbnail-generator').' <input name="attachments['. $post->ID .'][kgflashmediaplayer-track]['.$track.'][label]" id="attachments-'. $post->ID .'-kgflashmediaplayer-track_'.$track.'_label" type="text" value="'.$kgvid_postmeta['track'][$track]['label'].'" class="text" style="width:172px;"'.$readonly.'><br />
						'.__('Default:', 'video-embed-thumbnail-generator').'<input '.checked($kgvid_postmeta['track'][$track]['default'], 'default', false).' name="attachments['. $post->ID .'][kgflashmediaplayer-track]['.$track.'][default]" id="attachments-'. $post->ID .'-kgflashmediaplayer-track_'.$track.'_default" type="checkbox" value="default"'.$security_disabled.'></div>';
					}
				}
			}

			$form_fields["kgflashmediaplayer-track"]["label"] = __("Subtitles & Captions", 'video-embed-thumbnail-generator');
			$form_fields["kgflashmediaplayer-track"]["input"] = "html";
			$form_fields["kgflashmediaplayer-track"]["html"] = '<div id="kgflashmediaplayer-'.$post->ID.'-trackdiv">'.$tracks_html.'</div>';
			if ( empty($security_disabled) ) {
				$form_fields["kgflashmediaplayer-track"]["html"] .= '<span class="button-secondary" id="kgflashmediaplayer-add_track" onclick="kgvid_add_subtitles('.$post->ID.')">'.__('Add track', 'video-embed-thumbnail-generator').'</span>';
			}

			$items = array(__("Single Video", 'video-embed-thumbnail-generator')=>"Single Video", __("Video Gallery", 'video-embed-thumbnail-generator')=>"Video Gallery", __("WordPress Default", 'video-embed-thumbnail-generator')=>"WordPress Default");
			$shortcode_select = '<select name="attachments['.$post->ID.'][kgflashmediaplayer-embed]" id="attachments['.$post->ID.'][kgflashmediaplayer-embed]">';
			foreach($items as $name=>$value) {
				$selected = ($kgvid_postmeta['embed']==$value) ? 'selected="selected"' : '';
				$shortcode_select .= "<option value='$value' $selected>$name</option>";
			}
			$shortcode_select .= "</select>";

			$form_fields["kgflashmediaplayer-options"]["label"] = __("Video Embed Options", 'video-embed-thumbnail-generator');
			$form_fields["kgflashmediaplayer-options"]["input"] = "html";
			$form_fields["kgflashmediaplayer-options"]["html"] = '<input type="checkbox" name="attachments['.$post->ID.'][kgflashmediaplayer-showtitle]" id="attachments-'.$post->ID.'-kgflashmediaplayer-showtitle" '.checked( $kgvid_postmeta['showtitle'], 'on', false ).$security_disabled.'>
			<label for="attachments-'.$post->ID.'-kgflashmediaplayer-showtitle">'.__('Insert title above video', 'video-embed-thumbnail-generator').'</label><br />
			<input type="checkbox" name="attachments['.$post->ID.'][kgflashmediaplayer-downloadlink]" id="attachments-'.$post->ID.'-kgflashmediaplayer-downloadlink" '.checked( $kgvid_postmeta['downloadlink'], 'on', false ).$security_disabled.'>
			<label for="attachments-'.$post->ID.'-kgflashmediaplayer-downloadlink">'.__('Show download icon', 'video-embed-thumbnail-generator').'<em><small><br />'.__('Makes it easier for users to download file.', 'video-embed-thumbnail-generator').'</em></small></label><br />
			<label for="attachments-'.$post->ID.'-kgflashmediaplayer-embed">'._x('Insert', 'verb', 'video-embed-thumbnail-generator').'</label>
			'.$shortcode_select.'
			<script type="text/javascript">jQuery(document).ready(function(){kgvid_hide_standard_wordpress_display_settings('.$post->ID.');});</script>';

			if ( $kgvid_postmeta['embed'] == "Video Gallery" ) {

				if ( empty($kgvid_postmeta['gallery_id']) ) { $kgvid_postmeta['gallery_id'] = $post->post_parent; }

				$items = array("menu_order", "title", "post_date", "rand", "ID");
				$gallery_orderby_select = '<select name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_orderby]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_orderby">';
				foreach($items as $item) {
					$selected = ($kgvid_postmeta['gallery_orderby']==$item) ? 'selected="selected"' : '';
					$gallery_orderby_select .= "<option value='$item' $selected>$item</option>";
				}
				$gallery_orderby_select .= "</select>";

				$items = array("ASC", "DESC");
				$gallery_order_select = '<select name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_order]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_order">';
				foreach($items as $item) {
					$selected = ($kgvid_postmeta['gallery_order']==$item) ? 'selected="selected"' : '';
					$gallery_order_select .= "<option value='$item' $selected>$item</option>";
				}
				$gallery_order_select .= "</select>";

				$form_fields["kgflashmediaplayer-gallery"]["label"] = __("Gallery Settings (all optional)", 'video-embed-thumbnail-generator');
				$form_fields["kgflashmediaplayer-gallery"]["input"] = "html";
				$form_fields["kgflashmediaplayer-gallery"]["html"] = '<input name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_thumb_width]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_thumb_width" type ="text" value="'.$kgvid_postmeta['gallery_thumb_width'].'" class="kgvid_50_width"> <label for="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_thumb_width">'.__('Thumbnail Width', 'video-embed-thumbnail-generator').'</label><br />
				'.$gallery_orderby_select.' '.__('Order By', 'video-embed-thumbnail-generator').'<br />
				'.$gallery_order_select.' '.__('Sort Order', 'video-embed-thumbnail-generator').'<br />
				<input name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_exclude]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_exclude" type ="text" value="'.$kgvid_postmeta['gallery_exclude'].'" class="kgvid_50_width"> <label for="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_exclude">'.__('Exclude', 'video-embed-thumbnail-generator').'</label><br />
				<input name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_include]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_include" type ="text" value="'.$kgvid_postmeta['gallery_include'].'" class="kgvid_50_width"> <label for="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_include">'.__('Include', 'video-embed-thumbnail-generator').'</label><br />
				<input name="attachments['.$post->ID.'][kgflashmediaplayer-gallery_id]" id="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_id" type ="text" value="'.$kgvid_postmeta['gallery_id'].'" class="kgvid_50_width"> <label for="attachments-'.$post->ID.'-kgflashmediaplayer-gallery_id">'.__('Post ID', 'video-embed-thumbnail-generator').'</label>
				';

			} //if video gallery
		} //if not GIF
	} //only add fields if attachment is the right kind of video
return $form_fields;
}
// attach our function to the correct hook
add_filter("attachment_fields_to_edit", "kgvid_image_attachment_fields_to_edit", null, 2);

function kgvid_add_video_stats_column($cols) { //add Video Stats column to media library

	$cols['video_stats'] = __("Video Stats", 'video-embed-thumbnail-generator');
	return $cols;

}
add_filter( 'manage_media_columns', 'kgvid_add_video_stats_column' );

function kgvid_video_stats_column_data( $column_name, $id ) {

	if ( $column_name == 'video_stats' ) {

		$kgvid_postmeta = kgvid_get_attachment_meta($id);
		if ( is_array($kgvid_postmeta) && array_key_exists('starts', $kgvid_postmeta) && intval($kgvid_postmeta['starts']) > 0 ) {
			/* translators: Start refers to the number of times a video has been started */
			printf( _n('%d Start', '%d Starts', intval($kgvid_postmeta['starts']), 'video-embed-thumbnail-generator'), intval($kgvid_postmeta['starts']) );
			echo '<br>';
			printf( _n('%d Complete View', '%d Complete Views', intval($kgvid_postmeta['completeviews']), 'video-embed-thumbnail-generator'), intval($kgvid_postmeta['completeviews']) );
		}
	}

}
add_action( 'manage_media_custom_column', 'kgvid_video_stats_column_data', 10, 2 );

function kgvid_hide_video_children($wp_query_obj) {

	if ( is_admin()
		&& is_array($wp_query_obj->query_vars)
		&& ( array_key_exists('post_type', $wp_query_obj->query_vars) && $wp_query_obj->query_vars['post_type'] == 'attachment' ) //only deal with attachments
		&& !array_key_exists('post_mime_type', $wp_query_obj->query_vars) //show children when specifically displaying videos
		&& ( array_key_exists('posts_per_page', $wp_query_obj->query_vars) && $wp_query_obj->query_vars['posts_per_page'] > 0 ) //hide children only when showing paged content (makes sure that -1 will actually return all attachments)
	) {
		$wp_query_obj->set(
			'meta_query',
			array(
				array(
					'key' => '_kgflashmediaplayer-format',
					'compare' => 'NOT EXISTS'
				)
			)
		);

	}//end if

}
add_action('pre_get_posts','kgvid_hide_video_children');

function kgvid_change_video_icon($icon, $mime, $post_id) {

	$post = get_post($post_id);
	$kgvid_postmeta = kgvid_get_attachment_meta($post_id);

	if ( substr($mime, 0, 5) == 'video' ) {

		if ( !empty($post->post_parent) && strpos(get_post_mime_type( $post->post_parent ), 'video') !== false
		|| get_post_meta($post->ID, '_kgflashmediaplayer-externalurl', true) != '' ) {
			$post_id = $post->post_parent; //use post parent if this is a child video or encoded from an external url
		}
		$poster_id = get_post_meta($post_id, '_kgflashmediaplayer-poster-id', true);
		if ( !empty($poster_id) ) {
			$poster_src = wp_get_attachment_image_src( $poster_id, 'thumbnail' );
			if ( is_ssl() ) { $poster_src[0] = str_replace( "http:", "https:", $poster_src[0] ); }
			global $_current_video_icon_dir;
			$_current_video_icon_dir =  dirname($poster_src[0]);
			// - Return your icon path
			return $poster_src[0].'?kgvid';
		}
	}
	return $icon;
}
add_filter('wp_mime_type_icon', 'kgvid_change_video_icon', 10, 3);

function kgvid_video_icon_dir($dir) {

	global $_current_video_icon_dir;
	if(!empty($_current_video_icon_dir))
	{
			$var = $_current_video_icon_dir;
			$_current_video_icon_dir = null; //reset icon_dir if there's no thumbnail set
			return $var;
	}
	return $dir;

}
add_filter('icon_dir', 'kgvid_video_icon_dir');

function kgvid_decode_base64_png($raw_png, $tmp_posterpath) {

	$raw_png = str_replace('data:image/png;base64,', '', $raw_png);
	$raw_png = str_replace('data:image/jpeg;base64,', '', $raw_png);
	$raw_png = str_replace(' ', '+', $raw_png);
	$decoded_png = base64_decode($raw_png);
	$success = file_put_contents($tmp_posterpath, $decoded_png);
	$editor = wp_get_image_editor( $tmp_posterpath );

	return $editor;

}

function kgvid_ajax_save_html5_thumb() {

	if ( current_user_can('make_video_thumbnails') ) {
		check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
		$uploads = wp_upload_dir();
		$post_id = $_POST['postID'];
		$raw_png = $_POST['raw_png'];
		$video_url = $_POST['url'];
		$movieoffset = $_POST['offset'];
		$total = $_POST['total'];
		$index = $_POST['index']+1;

		$posterfile = sanitize_file_name(pathinfo($video_url, PATHINFO_FILENAME)).'_thumb'.$movieoffset;
		if (!file_exists($uploads['path'].'/thumb_tmp')) { mkdir($uploads['path'].'/thumb_tmp'); }
		$tmp_posterpath = $uploads['path'].'/thumb_tmp/'.$posterfile.'.png';
		$thumb_url = $uploads['url'].'/'.$posterfile.'.jpg';

		$editor = kgvid_decode_base64_png($raw_png, $tmp_posterpath);

		if ( is_wp_error($editor) ) { //couldn't open the image. Try the alternate php://input

			$raw_post = file_get_contents("php://input");
			parse_str($raw_post, $alt_post);
			$editor = kgvid_decode_base64_png($alt_post['raw_png'], $tmp_posterpath);

		}

		if ( is_wp_error($editor) ) {
			$thumb_url = '';
		}
		else {
			$thumb_dimensions = $editor->get_size();
			if ( $thumb_dimensions ) {
				$kgvid_postmeta = kgvid_get_attachment_meta($post_id);
				$kgvid_postmeta['actualwidth'] = $thumb_dimensions['width'];
				$kgvid_postmeta['actualheight'] = $thumb_dimensions['height'];
				kgvid_save_attachment_meta($post_id, $kgvid_postmeta);
			}
			$editor->set_quality( 90 );
			$new_image_info = $editor->save( $uploads['path'].'/thumb_tmp/'.$posterfile.'.jpg', 'image/jpeg' );
			unlink($tmp_posterpath);
			if ( $total > 1 ) {
				$post_name = get_the_title($post_id);
				$thumb_id = kgvid_save_thumb($post_id, $post_name, $thumb_url, $index);
			}
		}

		kgvid_schedule_cleanup_generated_files('thumbs');
		echo ($thumb_url);
	}

	die();

}
add_action('wp_ajax_kgvid_save_html5_thumb', 'kgvid_ajax_save_html5_thumb');

function kgvid_ajax_save_thumb() {

	if ( current_user_can('make_video_thumbnails') ) {
		check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
		$post_id = $_POST['post_id'];
		$thumb_url = $_POST['thumburl'];
		if ( isset($_POST['index']) ) { $index = $_POST['index']+1; }
		else { $index = false; }

		if ( is_numeric($post_id) ) {
			$post_name = get_the_title($post_id);
		}
		else { $post_name = str_replace('singleurl_','', $post_id); }

		$thumb_id = kgvid_save_thumb($post_id, $post_name, $thumb_url, $index);

		echo $thumb_id;
	}

	die();

}
add_action('wp_ajax_kgvid_save_thumb', 'kgvid_ajax_save_thumb');

function kgvid_save_thumb($post_id, $post_name, $thumb_url, $index=false) {

	global $user_ID;

	$options = kgvid_get_options();
	$uploads = wp_upload_dir();

	$posterfile = pathinfo($thumb_url, PATHINFO_BASENAME);
	$tmp_posterpath = $uploads['path'].'/thumb_tmp/'.$posterfile;
	$final_posterpath = $uploads['path'].'/'.$posterfile;

	$success = false;
	if ( !is_file($final_posterpath) ) { //if the file doesn't already exist
		if ( is_file($tmp_posterpath) ) {
			$success = copy($tmp_posterpath, $final_posterpath);
		}
	}

	//insert the $thumb_url into the media library if it does not already exist

	usleep(250000);

	$exploded_url = explode($uploads['baseurl'].'/', $thumb_url);
	$relative_upload_path = array_pop($exploded_url);

	$args = array(
		'numberposts' => '-1',
		'post_type' => 'attachment',
		'meta_key' => '_wp_attached_file',
		'meta_value' => $relative_upload_path
	);

	$posts = get_posts($args);

	if ( $posts ) { $thumb_id = $posts[0]->ID; }

	elseif ( $success ) { //no existing post with this filename

		$desc = $post_name . ' '._x('thumbnail', 'text appended to newly created thumbnail titles', 'video-embed-thumbnail-generator');
		if ( $index ) { $desc .= ' '.$index; }

		//is image in uploads directory?
		$upload_dir = wp_upload_dir();

		$video = get_post($post_id);
		if ( $options['thumb_parent'] == "post" ) {
			if ( !empty($video->post_parent) ) { $post_id = $video->post_parent; }
		}

		if ( FALSE !== strpos( $thumb_url, $upload_dir['baseurl'] ) ) {
			$wp_filetype = wp_check_filetype(basename($thumb_url), null );
			$filename = preg_replace('/\.[^.]+$/', '', basename($thumb_url));
			if ( $user_ID == 0 ) { $user_ID = $video->post_author; }


			/*$file_array = array(
				'name' => basename($posterfile),
				'tmp_name' => $tmp_posterpath,
			);

			//$return = apply_filters( 'wp_handle_upload', array( 'file' => $uploads['path'].'/'.$posterfile, 'url' => $thumb_url, 'type' => $wp_filetype['type'] ), 'sideload' );
			//$thumb_id = media_handle_sideload( $file_array, $post_id, $desc );*/

			$attachment = array(
			   'guid' => $thumb_url,
			   'post_mime_type' => $wp_filetype['type'],
			   'post_title' => $desc,
			   'post_content' => '',
			   'post_status' => 'inherit',
			   'post_author' => $user_ID
			);

			$thumb_id = wp_insert_attachment( $attachment, $uploads['path'].'/'.$posterfile, $post_id );
			//you must first include the image.php file
			//for the function wp_generate_attachment_metadata() to work
			require_once(ABSPATH . 'wp-admin/includes/image.php');
			$attach_data = wp_generate_attachment_metadata( $thumb_id, $uploads['path'].'/'.$posterfile );
			wp_update_attachment_metadata( $thumb_id, $attach_data );
		}
		else { //not in uploads so we'll have to sideload it
			$tmp = download_url( $thumb_url );

			// Set variables for storage
			// fix file filename for query strings
			preg_match('/[^\?]+\.(jpg|JPG|jpe|JPE|jpeg|JPEG|gif|GIF|png|PNG)/', $thumb_url, $matches);
			$file_array['name'] = basename($matches[0]);
			$file_array['tmp_name'] = $tmp;

			// If error storing temporarily, unlink
			if ( is_wp_error( $tmp ) ) {
				@unlink($file_array['tmp_name']);
				$file_array['tmp_name'] = '';
			}

			// do the validation and storage stuff
			$thumb_id = media_handle_sideload( $file_array, $post_id, $desc );

			// If error storing permanently, unlink
			if ( is_wp_error($thumb_id) ) {
				@unlink($file_array['tmp_name']);
				return $thumb_id;
			}

			if ( $local_src = wp_get_attachment_url( $thumb_id ) ) {
				update_post_meta($post_id, '_kgflashmediaplayer-poster', $local_src);
			}

		} //end sideload

		$thumb_id = intval( $thumb_id );
		update_post_meta($post_id, '_kgflashmediaplayer-poster-id', $thumb_id);
		update_post_meta($thumb_id, '_kgflashmediaplayer-video-id', $video->ID);

	}//end else no existing db entry

	if( !empty($thumb_id) && !is_wp_error($thumb_id) ) {

		return $thumb_id;

	}

}

function kgvid_ajax_redraw_thumbnail_box() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	$post_id = $_POST['post_id'];
	$kgvid_postmeta = kgvid_get_attachment_meta($post_id);
	$poster_id = get_post_meta($post_id, "_kgflashmediaplayer-poster-id", true);
	$thumbnail_size_url = "";
	if ( !empty($poster_id) ) {
		$thumbnail_src = wp_get_attachment_image_src($poster_id, 'thumbnail');
		if ( is_array($thumbnail_src) && array_key_exists(0, $thumbnail_src) ) { $thumbnail_size_url = $thumbnail_src[0]; }
	}
	$response['thumb_url'] = get_post_meta($post_id, "_kgflashmediaplayer-poster", true);
	$response['thumbnail_size_url'] = $thumbnail_size_url;
	$response['thumb_error'] = $kgvid_postmeta['autothumb-error'];
	echo json_encode($response);
	die();

}
add_action('wp_ajax_kgvid_redraw_thumbnail_box', 'kgvid_ajax_redraw_thumbnail_box');

    /**
     * @param array $post
     * @param array $attachment
     * @return array
     */
function kgvid_video_attachment_fields_to_save($post, $attachment) {
	// $attachment part of the form $_POST ($_POST[attachments][postID])
	// $post attachments wp post array - will be saved after returned
	//     $post['post_type'] == 'attachment'
	static $flag = 0;

	if( !empty($post['ID']) && isset($attachment['kgflashmediaplayer-url']) && $flag < 1 ) {

		$options = kgvid_get_options();

		$thumb_id = "";
		if( isset($attachment['kgflashmediaplayer-poster']) ) {

			$thumb_url = $attachment['kgflashmediaplayer-poster'];
			$old_thumb_url = get_post_meta($post['ID'], '_kgflashmediaplayer-poster', true);

			if ( !empty($thumb_url) && $old_thumb_url != $thumb_url ) {
				$thumb_id = kgvid_save_thumb($post['ID'], $post['post_title'], $thumb_url);
				if ( $thumb_id ) {
					$thumb_url = wp_get_attachment_url($thumb_id);
					update_post_meta($post['ID'], '_kgflashmediaplayer-poster-id', $thumb_id);
				}
			}

			if ( empty($thumb_url) ) {
				delete_post_meta($post['ID'], '_kgflashmediaplayer-poster');
				delete_post_meta($post['ID'], '_kgflashmediaplayer-poster-id');
				delete_post_thumbnail($post['ID']);
			}
			else {

				update_post_meta($post['ID'], '_kgflashmediaplayer-poster', $thumb_url);

				if ( empty($thumb_id) ) { //we're not saving a new thumbnail
					$poster_id = get_post_meta($post['ID'], '_kgflashmediaplayer-poster-id', true);
					if ( empty($poster_id) ) { //the poster_id meta was accidentally deleted
						$thumb_url_id = kgvid_url_to_id($thumb_url);
						if ( $thumb_url_id ) { update_post_meta($post['ID'], '_kgflashmediaplayer-poster-id', $thumb_url_id); }
					}
				}

			}

		}

		if( isset($attachment['kgflashmediaplayer-featured']) ) {

			if ( !empty($thumb_id) ) {

				if ( isset($_POST['action']) && $_POST['action'] == 'save-attachment-compat' && isset($_POST['post_id']) ) { //if this is in the media modal
					$post_parent = $_POST['post_id'];
				}
				elseif ( is_array($post) && array_key_exists('post_parent', $post) ) {
					$post_parent = $post['post_parent'];
				}

				if ( isset($post_parent) ) {
					set_post_thumbnail($post_parent, $thumb_id);
				}

			}
		}

		if ( !empty($thumb_id) ) { //always set the video's featured image regardless of the plugin setting
			set_post_thumbnail($post['ID'], $thumb_id);
		}

		$video_formats = kgvid_video_formats(false, false);
		foreach ( $video_formats as $format => $format_stats ) {
			if( !isset($attachment['kgflashmediaplayer-encode'.$format]) ) {
				if ( $options['encode_'.$format] == false ) { $attachment['kgflashmediaplayer-encode'.$format] = "false"; }
				else { $attachment['kgflashmediaplayer-encode'.$format] = "notchecked"; }
			}
		}

		$checkboxes = array( 'lockaspect', 'featured', 'showtitle', 'downloadlink' ); //make sure unchecked checkbox values are saved
		foreach ( $checkboxes as $checkbox ) {
			if( !isset($attachment['kgflashmediaplayer-'.$checkbox]) ) { $attachment['kgflashmediaplayer-'.$checkbox] = "false"; }
		}

		if ( isset( $attachment['kgflashmediaplayer-track'] ) && is_array( $attachment['kgflashmediaplayer-track'] ) ) {
			foreach ( $attachment['kgflashmediaplayer-track'] as $track => $track_attribute ) {
				if ( !array_key_exists('default', $track_attribute) ) { $attachment['kgflashmediaplayer-track'][ $track ]['default'] = ''; }
			}
		}

		$kgvid_postmeta = array();

		foreach ( $attachment as $kgflashmediaplayer_key => $value ) {
			if ( strpos($kgflashmediaplayer_key, 'kgflashmediaplayer-') !== false && $kgflashmediaplayer_key != 'kgflashmediaplayer-security' ) {
				$key = str_replace('kgflashmediaplayer-', '', $kgflashmediaplayer_key);
				$kgvid_postmeta[$key] = $value;
			}
		}

		kgvid_save_attachment_meta($post['ID'], $kgvid_postmeta);

	}
	$flag++;
	return $post;
}
add_filter("attachment_fields_to_save", "kgvid_video_attachment_fields_to_save", null, 2);

class kgInsertMedia {
  //class constructor
  function kgInsertMedia () {
    add_filter('media_send_to_editor', array($this, 'kgmodifyMediaInsert') , 10, 3);
  }
  //function that does the modifying
  function kgmodifyMediaInsert($html, $attachment_id, $attachment) {

	$mime_type = get_post_mime_type($attachment_id);

	if ( substr($mime_type, 0, 5) == 'video' ) {

		$options = kgvid_get_options();

		$kgvid_postmeta = kgvid_get_attachment_meta($attachment_id);

		if ( $kgvid_postmeta['embed'] == "Single Video" ) {
			$html = "";
			$kgvid_postmeta['url'] = wp_get_attachment_url($attachment_id);
			$kgvid_postmeta['title'] = get_the_title($attachment_id);
			$kgvid_postmeta['poster'] = get_post_meta($attachment_id, "_kgflashmediaplayer-poster", true);
			$kgvid_postmeta['poster-id'] = get_post_meta($attachment_id, "_kgflashmediaplayer-poster-id", true);

			if ($kgvid_postmeta['showtitle'] == "on" ) {
			$titlecode = html_entity_decode(stripslashes($options['titlecode']));
			if ( substr($titlecode, 0, 1) != '<' ) { $titlecode = '<'.$titlecode; }
			if ( substr($titlecode, -1, 1) != '>' ) { $titlecode .= '>'; }
			$endtitlecode = str_replace("<", "</", $titlecode);
			$endtitlecode_array = explode(' ', $endtitlecode);
			if ( substr($endtitlecode_array[0], -1) != ">" ) { $endtitlecode = $endtitlecode_array[0].">"; }
			$html .= $titlecode.'<span itemprop="name">'.$kgvid_postmeta["title"].'</span>'.$endtitlecode.'<br />';
		}

			$html .= '[KGVID';
			if ( !empty($kgvid_postmeta['poster']) && empty($kgvid_postmeta['poster-id']) ) { $html .= ' poster="'.$kgvid_postmeta["poster"].'"'; }
			if ( !empty($kgvid_postmeta['width']) ) { $html .= ' width="'.$kgvid_postmeta["width"].'"'; }
			if ( !empty($kgvid_postmeta['height']) ) { $html .= ' height="'.$kgvid_postmeta["height"].'"'; }
			$html .= ']'.$kgvid_postmeta["url"].'[/KGVID]<br />';
		} //if embed code is enabled

		if ($kgvid_postmeta['embed'] == "Video Gallery" ) {

			$post = get_post($attachment_id);
			$parent_id = $post->post_parent;

			$html = "";
			$html .= '[KGVID gallery="true"';
			if ( !empty($kgvid_postmeta['gallery_thumb']) && $kgvid_postmeta['gallery_thumb'] != $options['gallery_thumb'] ) { $html .= ' gallery_thumb="'.$kgvid_postmeta["gallery_thumb"].'"'; }
			if ( !empty($kgvid_postmeta['gallery_exclude']) ) { $html .= ' gallery_exclude="'.$kgvid_postmeta["gallery_exclude"].'"'; }
			if ( !empty($kgvid_postmeta['gallery_include']) ) { $html .= ' gallery_include="'.$kgvid_postmeta["gallery_include"].'"'; }
			if ( !empty($kgvid_postmeta['gallery_orderby']) && $kgvid_postmeta['gallery_orderby'] != "menu_order" ) { $html .= ' gallery_orderby="'.$kgvid_postmeta["gallery_orderby"].'"'; }
			if ( !empty($kgvid_postmeta['gallery_order']) && $kgvid_postmeta['gallery_order'] != "ASC" ) { $html .= ' gallery_order="'.$kgvid_postmeta["gallery_order"].'"'; }
			if ( !empty($kgvid_postmeta['gallery_id']) && $kgvid_postmeta['gallery_id'] != $parent_id ) { $html .= ' gallery_id="'.$kgvid_postmeta["gallery_id"].'"'; }
			$html .= '][/KGVID]';
		}

    }

    return $html;

  }//end function
}
//instantiate the class
$kgIM = new kgInsertMedia();

function kgvid_embedurl_menu($tabs) {
	$newtab = array( 'embedurl' => _x('Embed Video from URL', 'Title in "Add Media" popup sidebar', 'video-embed-thumbnail-generator') );
	if (is_array($tabs) ) { return array_merge($tabs, $newtab); }
	else { return $newtab; }
}
add_filter('media_upload_tabs', 'kgvid_embedurl_menu');

function kgvid_media_embedurl_process() {

	$options = kgvid_get_options();

	if ( !isset($options['ffmpeg_exists']) || $options['ffmpeg_exists'] == "notchecked" ) {
		kgvid_check_ffmpeg_exists($options, true);
		$options = kgvid_get_options();
	}

	$video_formats = kgvid_video_formats();
	$checkboxes = kgvid_generate_encode_checkboxes("", "singleurl", "attachment");

	$maxheight = $options['height'];
	$maxwidth = $options['width'];

	media_upload_header();
	?>
	<form class="media-upload-form type-form validate" id="kgvid-form" enctype="multipart/form-data" method="post" action="">

	<div id="media-items">
	<div class="media-item media-blank">
	<table id="kgflashmediaplayer-table" class="describe">
	<tbody>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label for="videotitle"><?php _e('Video Title', 'video-embed-thumbnail-generator'); ?></label></span></th>
					<td class="field"><input type="text" id="videotitle" name="videotitle" value="" size="50" />
					<p class="help"><small><?php _e('Add an optional header above the video.', 'video-embed-thumbnail-generator'); ?></small></p></td>
				</tr>
				<tr>
					<th valign="top" scope="row" class="label"><label for="attachments-singleurl-kgflashmediaplayer-url">Video URL</label></th>
					<td class="field"><input type="text" id="attachments-singleurl-kgflashmediaplayer-url" name="attachments[singleurl][kgflashmediaplayer-url]" value="" size="50" onchange="kgvid_set_singleurl();"/>
					<p class="help"><small><?php _e('Specify the URL of the video file.', 'video-embed-thumbnail-generator'); ?></small></p></td>
				</tr>
				<?php if ( current_user_can('make_video_thumbnails') ) { ?>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label><?php _e('Thumbnails', 'video-embed-thumbnail-generator') ?></label></span></th>
					<td class="field">
						<input id="attachments-singleurl-kgflashmediaplayer-numberofthumbs" type="text" value="<?php echo $options['generate_thumbs']; ?>" maxlength="2" size="4" style="width:35px;text-align:center;" title="<?php _e('Number of Thumbnails', 'video-embed-thumbnail-generator') ?>" onchange="document.getElementById('attachments-singleurl-kgflashmediaplayer-thumbtime').value='';" />
						<input type="button" id="attachments-singleurl-thumbgenerate" class="button-secondary" value="<?php _e('Generate', 'video-embed-thumbnail-generator') ?>" name="thumbgenerate" onclick="kgvid_generate_thumb('singleurl', 'generate');" disabled title="<?php _e('Please enter a valid video URL', 'video-embed-thumbnail-generator') ?>" />
						<input type="button" id="attachments-singleurl-thumbrandomize" class="button-secondary" value="<?php _e('Randomize', 'video-embed-thumbnail-generator') ?>" name="thumbrandomize" onclick="kgvid_generate_thumb('singleurl', 'random');" disabled title="<?php _e('Please enter a valid video URL', 'video-embed-thumbnail-generator') ?>" />
						<input type="checkbox" id="attachments-singleurl-firstframe" onchange="document.getElementById('attachments-singleurl-kgflashmediaplayer-thumbtime').value ='';" /><label for="attachments-singleurl-firstframe"><?php _e('Force 1st Frame Thumbnail', 'video-embed-thumbnail-generator') ?></label><br>
						<div id="attachments-singleurl-thumbnailplaceholder"></div>
						<span><?php _e('Thumbnail timecode:', 'video-embed-thumbnail-generator') ?></span> <input name="attachments[singleurl][kgflashmediaplayer-thumbtime]" id="attachments-singleurl-kgflashmediaplayer-thumbtime" type="text" value="" style="width:60px;"><br>
						<input type="checkbox" <?php echo checked( $options["featured"], "on", false ); ?> id="attachments-singleurl-featured" name="attachments[singleurl][kgflashmediaplayer-featured]" /> <?php _e('Set thumbnail as featured image', 'video-embed-thumbnail-generator') ?>
					</td>
				</tr>
				<?php } ?>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label for="attachments-singleurl_kgflashmediaplayer_poster"><?php _e('Thumbnail URL', 'video-embed-thumbnail-generator') ?></label></span></th>
					<td class="field"><input type="text" name="attachments[singleurl][kgflashmediaplayer-poster]" id="attachments-singleurl-kgflashmediaplayer-poster" value="" size="50" />
					<p class="help"><small><?php printf( __('Leave blank to use %sdefault thumbnail', 'video-embed-thumbnail-generator'), '<a href="options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php" target="_blank">' ) ?></a>.</small></p></td>
				</tr>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label for="attachments-singleurl-kgflashmediaplayer-width"><?php _e('Dimensions', 'video-embed-thumbnail-generator') ?></label></span></th>
					<td class="field"><?php _e('Width:', 'video-embed-thumbnail-generator') ?> <input name="attachments[singleurl][kgflashmediaplayer-width]" type="text" value="<?php echo $maxwidth; ?>" id="attachments-singleurl-kgflashmediaplayer-width" type="text" class="kgvid_50_width" onchange="kgvid_set_dimension('singleurl', 'height', this.value);" onkeyup="kgvid_set_dimension('singleurl', 'height', this.value);"> <?php _e('Height:', 'video-embed-thumbnail-generator') ?> <input name="attachments[singleurl][kgflashmediaplayer-height]" id="attachments-singleurl-kgflashmediaplayer-height" type="text" value="<?php echo $maxheight; ?>" class="kgvid_50_width" onchange="kgvid_set_dimension('singleurl', 'width', this.value);" onkeyup="kgvid-set-dimension('singleurl', 'width', this.value);"> <input type="checkbox" name="attachments[singleurl][kgflashmediaplayer-lockaspect]" id="attachments-singleurl-kgflashmediaplayer-lockaspect" onclick="kgvid_set_aspect('singleurl', this.checked);" checked> <label id="singleurl-lockaspect-label" for="attachments-singleurl-kgflashmediaplayer-lockaspect"><small><?php _e('Lock to Aspect Ratio', 'video-embed-thumbnail-generator') ?></small></label>
					<p class="help"><small><?php printf( __('Leave blank to use %sdefault dimensions', 'video-embed-thumbnail-generator'), '<a href="options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php" target="_blank">' ) ?></a>.</small></p></td>
				</tr>
				<?php if ( current_user_can('encode_videos') ) { ?>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label for="html5"><?php _e('Additional Formats', 'video-embed-thumbnail-generator') ?></span></label></th>
					<td><?php echo $checkboxes['checkboxes']; ?></td>
				</tr>
				<?php } ?>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label><?php _e('Subtitles & Captions', 'video-embed-thumbnail-generator') ?></span></label></th>
					<td><div id="kgflashmediaplayer-singleurl-trackdiv" class="kgvid_thumbnail_box kgvid_track_box"><?php _e('Track type:', 'video-embed-thumbnail-generator') ?><select name="attachments[singleurl][kgflashmediaplayer-track][kind]" id="attachments-singleurl-kgflashmediaplayer-track_kind"><option value="subtitles"><?php _e('subtitles', 'video-embed-thumbnail-generator') ?></option><option value="captions"><?php _e('captions', 'video-embed-thumbnail-generator') ?></option><option value="chapters"><?php _e('chapters', 'video-embed-thumbnail-generator') ?></option></select><br />URL: <input name="attachments[singleurl][kgflashmediaplayer-track][src]" id="attachments-singleurl-kgflashmediaplayer-track_src" type="text" value="" class="text"><br /><?php _e('Language code:', 'video-embed-thumbnail-generator') ?> <input name="attachments[singleurl][kgflashmediaplayer-track][srclang]" id="attachments-singleurl-kgflashmediaplayer-track_srclang" type="text" value="" maxlength="2" style="width:40px;"><br /><?php _e('Label:', 'video-embed-thumbnail-generator') ?> <input name="attachments[singleurl][kgflashmediaplayer-track][label]" id="attachments-singleurl-kgflashmediaplayer-track_label" type="text" value="" class="text"><br /><?php _e('Default:', 'video-embed-thumbnail-generator') ?> <input name="attachments[singleurl][kgflashmediaplayer-track][default]" id="attachments-singleurl-kgflashmediaplayer-track_default" type="checkbox" value="default"></div></td>
				<tr>
					<th valign="top" scope="row" class="label"><span class="alignleft"><label>Options</span></label></th>
					<td><input type="checkbox" <?php echo checked( $options["downloadlink"], "on", false ); ?> name="downloadlink" id="downloadlink" value="true" class="field" /><label for="downloadlink"><?php _e('Show download icon', 'video-embed-thumbnail-generator') ?><br /><small></em><?php _e('Makes it easier for users to download video file', 'video-embed-thumbnail-generator') ?></em></small></label></td>
				</tr>
				<tr class="submit">
					<td></td>
					<td>
						<input type="button" onclick="kgvid_insert_shortcode();" name="insertonlybutton" id="insertonlybutton" class="button" value="<?php _e('Insert into Post', 'video-embed-thumbnail-generator') ?>" disabled title="<?php _e('Please enter a valid video URL', 'video-embed-thumbnail-generator') ?>" />
					</td>
				</tr>
	</tbody></table>
	</div>
	</div>

	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-security]' id='attachments-singleurl-kgflashmediaplayer-security' value='<?php echo wp_create_nonce('video-embed-thumbnail-generator-nonce'); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-maxwidth]' id='attachments-singleurl-kgflashmediaplayer-maxwidth' value='<?php echo($maxwidth); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-maxheight]' id='attachments-singleurl-kgflashmediaplayer-maxheight' value='<?php echo($maxheight); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-aspect]' id='attachments-singleurl-kgflashmediaplayer-aspect' value='<?php echo(round($maxheight/$maxwidth, 3)); ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-titlecode]' id='attachments-singleurl-kgflashmediaplayer-titlecode' value='<?php echo $options['titlecode']; ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-titlecode]' id='attachments-singleurl-kgflashmediaplayer-titlecode' value='<?php echo $options['titlecode']; ?>' />
	<input type='hidden' name='attachments[singleurl][kgflashmediaplayer-ffmpegexists]' id='attachments-singleurl-kgflashmediaplayer-ffmpegexists' value='<?php echo $options['ffmpeg_exists']; ?>' />
	</form>

	<?php
} //end media_embedurl_process

function kgvid_embedurl_handle() {
    return wp_iframe( 'kgvid_media_embedurl_process' );
}
add_action('media_upload_embedurl', 'kgvid_embedurl_handle');

function kgvid_parameter_queryvars( $qvars ) { //add kgvid_video_embed variable for passing information using URL queries
	$qvars[] = 'kgvid_video_embed';
	return $qvars;
}
add_filter('query_vars', 'kgvid_parameter_queryvars' );

function kgvid_generate_attachment_shortcode($kgvid_video_embed) {

	global $post;
	global $wp_query;
	$options = kgvid_get_options();
	$kgvid_postmeta = kgvid_get_attachment_meta($post->ID);

	if ( is_array($kgvid_video_embed) && array_key_exists('sample', $kgvid_video_embed) ) { $url = plugins_url('/images/sample-video-h264.mp4', __FILE__); }
	else { $url = wp_get_attachment_url($post->ID); }

	$poster = get_post_meta($post->ID, "_kgflashmediaplayer-poster", true);

	if ( is_array($kgvid_video_embed) && array_key_exists('gallery', $kgvid_video_embed) ) { $gallery = true; }
	else { $gallery = false; }

	$dimensions = kgvid_set_video_dimensions($post->ID, $gallery);

	$shortcode = '[KGVID';
	if ( $poster !="" ) { $shortcode .= ' poster="'.$poster.'"'; }
	if ( !empty($dimensions['width']) ) { $shortcode .= ' width="'.$dimensions['width'].'"'; }
	if ( !empty($dimensions['height']) ) { $shortcode .= ' height="'.$dimensions['height'].'"'; }
	if ( is_array($kgvid_video_embed) && array_key_exists('enable', $kgvid_video_embed) && $kgvid_video_embed['enable'] == 'true' )  { $shortcode .= ' fullwidth="true"'; }
	if ( $kgvid_postmeta['downloadlink'] == "on" ) { $shortcode .= ' downloadlink="true"'; }
	if (is_array($kgvid_video_embed) && array_key_exists('gallery', $kgvid_video_embed)) { $shortcode .= ' autoplay="true"'; }
	if (is_array($kgvid_video_embed) && array_key_exists('sample', $kgvid_video_embed)) {
		if ( $options['overlay_title'] == "on" ) { $shortcode .= ' title="'._x('Sample Video', 'example video', 'video-embed-thumbnail-generator').'"'; }
		if ( $options['overlay_embedcode'] == "on" ) { $shortcode .= ' embedcode="'.__('Sample Embed Code', 'video-embed-thumbnail-generator').'"'; }
		$shortcode .= ' caption="'.__('If text is entered in the attachment\'s caption field it is displayed here automatically.', 'video-embed-thumbnail-generator').'"';
		if ( $options['downloadlink'] == "on" ) { $shortcode .= ' downloadlink="true"'; }
	}
	//else { $shortcode .= ' view_count="false"'; }
	$shortcode .= ']'.$url.'[/KGVID]';

	return $shortcode;

}

function kgvid_filter_video_attachment_content($content) {

	global $post;
	$options = kgvid_get_options();

	if ( $options['template'] == "gentle" && strpos($post->post_mime_type, "video") !== false ) {
		$kgvid_video_embed = array(); //no query set
		$content = kgvid_generate_attachment_shortcode($kgvid_video_embed);
		$content .= '<p>'.$post->post_content.'</p>';
	}
	return $content;
}
add_filter( 'the_content', 'kgvid_filter_video_attachment_content' );

function kgvid_generate_embeddable_video( $kgvid_video_embed ) {

	global $content_width;
	$content_width_save = $content_width;
	$content_width = 2048;

	remove_action('wp_head', '_admin_bar_bump_cb'); //don't show the WordPress admin bar if you're logged in
	add_filter( 'show_admin_bar', '__return_false' );

	$shortcode = kgvid_generate_attachment_shortcode($kgvid_video_embed);

	$html = '<html style="background-color:transparent;"><head>';
	ob_start();
	wp_head();
	$html .= ob_get_clean();
	$html .= '<style>body:before, body:after{ content: none; } .kgvid_wrapper { margin:0 !important; }';
	if ( array_key_exists('gallery', $kgvid_video_embed) ) { $html .= ' .kgvid_below_video { color:white; } .kgvid_below_video a { color:aaa; }'; }
	$html .= '</style>';
	$html .= '</head><body class="content" style="margin:0px; font-family: sans-serif; padding:0px; border:none;';
	if ( array_key_exists('gallery', $kgvid_video_embed) ) { $html .= 'background-color:black; '; }
	else { $html .= 'background-color:transparent; '; }
	$html .= '">';
	$html .= do_shortcode( $shortcode );
	ob_start();
	wp_footer();
	$html .= ob_get_clean();
	$html .= '</body></html>';
	$content_width = $content_width_save; //reset $content_width

	return apply_filters('kgvid_generate_embeddable_video', $html, $kgvid_video_embed);

}

function kgvid_video_attachment_template() {

	global $post;
	global $wp_query;
	global $content_width;

	$options = kgvid_get_options();

	$kgvid_video_embed = array ( 'enable' => 'false' ); //turned off by default
	if ( is_object($wp_query) && isset($wp_query->query_vars['kgvid_video_embed']) ) { $kgvid_video_embed = $wp_query->query_vars['kgvid_video_embed']; }
	if ( $options['template'] == "old" ) { $kgvid_video_embed['enable'] = 'true'; } //regardless of any query settings, if we're using the old method it's turned on
	if ( (!is_array($kgvid_video_embed) && $kgvid_video_embed == "true") ) { $kgvid_video_embed = array ( 'enable' => 'true' ); } //maintain backwards compatibility

	if ( $options['embeddable'] == 'false' && !array_key_exists('sample', $kgvid_video_embed) && !array_key_exists('gallery', $kgvid_video_embed) ) { $kgvid_video_embed['enable'] = 'false'; }

	if ( is_array($kgvid_video_embed) && array_key_exists('enable', $kgvid_video_embed) && $kgvid_video_embed['enable'] == 'true'
		&& ( ( is_object($post) && array_key_exists('post_mime_type', $post) && strpos($post->post_mime_type, 'video') !== false ) || array_key_exists('sample', $kgvid_video_embed) )
		) {

		$html = kgvid_generate_embeddable_video( $kgvid_video_embed );

		echo $html;

		exit;
	}

	if ( is_array($kgvid_video_embed)
		&& array_key_exists('download', $kgvid_video_embed)
		&& $kgvid_video_embed['download'] == 'true'
		&& is_object($post)
		&& strpos($post->post_mime_type,"video") !== false
		&& $options['click_download'] == 'on'
	) {

		$filepath = get_attached_file($post->ID);
		$filetype = wp_check_filetype( $filepath );
		if ( ! isset($filetype['type'])) { $filetype['type'] = 'application/octet-stream'; }

		// Generate the server headers
		if (strpos($_SERVER['HTTP_USER_AGENT'], "MSIE") !== FALSE) {
			header('Content-Type: "'.$filetype['type'].'"');
			header('Content-Disposition: attachment; filename="'.basename($filepath).'"');
			header('Expires: 0');
			header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
			header("Content-Transfer-Encoding: binary");
			header('Pragma: public');
			header("Content-Length: ".filesize($filepath));
		}
		else {
			header('Content-Type: "'.$filetype['type'].'"');
			header('Content-Disposition: attachment; filename="'.basename($filepath).'"');
			header("Content-Transfer-Encoding: binary");
			header('Expires: 0');
			header('Pragma: no-cache');
			header("Content-Length: ".filesize($filepath));
		}

		kvid_readfile_chunked($filepath);
		exit;
	}

	if ( $options['oembed_provider'] == "on" && is_array($kgvid_video_embed) && array_key_exists('oembed', $kgvid_video_embed) && array_key_exists('post_id', $kgvid_video_embed) ) {

		$post = get_post($kgvid_video_embed['post_id']);

		if (!$post) {
			status_header(404);
			wp_die("Not found");
		}

		$dimensions = kgvid_set_video_dimensions($post->ID);
		$thumbnail_url = get_post_meta($post->ID, "_kgflashmediaplayer-poster", true);
		$author = get_userdata($post->post_author);

		$oembed_provider_data = array(
			'version' => '1.0',
			'provider_name' => get_bloginfo('name'),
			'provider_url' => home_url(),
			'author_name' => $author->display_name,
			'author_url' => get_author_posts_url($author->ID, $author->nicename),
			'title' => $post->post_title,
			'type' => 'video',
			'width' => $dimensions['width'],
			'height' => $dimensions['height'],
			'thumbnail_url' => $thumbnail_url,
			'thumbnail_width' => $dimensions['width'],
			'thumbnail_height' => $dimensions['height'],
			'html' => "<iframe allowfullscreen src='".site_url('/')."?attachment_id=".$post->ID."&amp;kgvid_video_embed[enable]=true' frameborder='0' scrolling='no' width='".esc_attr($dimensions['width'])."' height='".esc_attr($dimensions['height'])."'></iframe>"
		);

		if ( $kgvid_video_embed['oembed'] == 'json' ) {

			header('Content-Type: application/json; charset=' . get_bloginfo('charset'), true);
			$json = json_encode($oembed_provider_data);
			echo $json;
			exit;

		}

		if ( $kgvid_video_embed['oembed'] == 'xml' ) {

			header('Content-Type: text/xml; charset=' . get_bloginfo('charset'), true);

			// render xml-output
			echo '<?xml version="1.0" encoding="' . get_bloginfo('charset') . '" ?>';
			echo '<oembed>';
			foreach ( $oembed_provider_data as $element => $value ) {
			  echo '<' . $element . '>' . esc_html($value) . '</' . $element . '>';
			}
			echo '</oembed>';
			exit;
		}

	}

}
add_action('template_redirect', 'kgvid_video_attachment_template');

function kgvid_enable_oembed_discover() {

	$options = kgvid_get_options();

	if ( $options['oembed_security'] == "on" ) {

		return true;

	}

	else { return false; }
}
add_filter( 'embed_oembed_discover', 'kgvid_enable_oembed_discover' );

/* function kgvid_serve_secure_video_files($wp) {
	if ( array_key_exists('kgvid_video_embed', $wp->query_vars) && array_key_exists('id', $wp->query_vars['kgvid_video_embed']) && array_key_exists('format', $wp->query_vars['kgvid_video_embed']) && array_key_exists('token', $wp->query_vars['kgvid_video_embed']) ) {
		$kgvid_video_embed = $wp->query_vars['kgvid_video_embed'];
		if ( $kgvid_video_embed['format'] == "original" ) { $video_id = $kgvid_video_embed['id']; }
		else { $video_id = get_post_meta($kgvid_video_embed['id'], '_kgflashmediaplayer-format', $kgvid_video_embed['format'] ); }
		$url = wp_get_attachment_url($video_id);
		$type = get_post_mime_type($video_id);

		header('Location: ' .$url);
		header('Content-type: '.$type);
		exit(0);
	}
}
add_action('parse_request', 'kgvid_serve_secure_video_files'); */

function kgvid_cleanup_generated_logfiles_handler($logfile) {
	$lastmodified = "";
	if ( file_exists($logfile) ) { $lastmodified = filemtime($logfile); }
		if ( $lastmodified != false ) {
			if ( time() - $lastmodified > 120 ) { unlink($logfile); }
			else {
				$timestamp = wp_next_scheduled( 'kgvid_cleanup_generated_logfiles' );
				wp_unschedule_event($timestamp, 'kgvid_cleanup_generated_logfiles' );
				$args = array('logfile'=>$logfile);
				wp_schedule_single_event(time()+600, 'kgvid_cleanup_generated_logfiles', $args);
			}
		}
}
add_action('kgvid_cleanup_generated_logfiles','kgvid_cleanup_generated_logfiles_handler');

function kgvid_cleanup_generated_thumbnails_handler() {
	$uploads = wp_upload_dir();
	kgvid_rrmdir($uploads['path'].'/thumb_tmp'); //remove the whole tmp file directory
}
add_action('kgvid_cleanup_generated_thumbnails','kgvid_cleanup_generated_thumbnails_handler');

function kgvid_schedule_cleanup_generated_files($arg) { //schedules deleting all tmp thumbnails or logfiles if no files are generated in an hour

	if ( $arg == 'thumbs' ) {
		$timestamp = wp_next_scheduled( 'kgvid_cleanup_generated_thumbnails' );
		wp_unschedule_event($timestamp, 'kgvid_cleanup_generated_thumbnails' );
		wp_schedule_single_event(time()+3600, 'kgvid_cleanup_generated_thumbnails');
	}

	else {
		$timestamp = wp_next_scheduled( 'kgvid_cleanup_generated_logfiles' );
		wp_unschedule_event($timestamp, 'kgvid_cleanup_generated_logfiles' );
		$args = array('logfile'=>$arg);
		wp_schedule_single_event(time()+600, 'kgvid_cleanup_generated_logfiles', $args);
	}

}

function kgvid_make_thumbs($postID, $movieurl, $numberofthumbs, $i, $iincreaser, $thumbtimecode, $dofirstframe, $generate_button) {

	$options = kgvid_get_options();
	$ffmpegPath = $options['app_path']."/".$options['video_app'];
	$uploads = wp_upload_dir();

	if ( get_post_type($postID) == "attachment" ) {
		$moviefilepath = get_attached_file($postID);
		if ( !file_exists($moviefilepath) ) {
			$moviefilepath = esc_url_raw(str_replace(" ", "%20", $movieurl));
			$moviefilepath = str_replace("https://", "http://",  $moviefilepath);
		}

		$kgvid_postmeta = kgvid_get_attachment_meta($postID);
		$keys = array( 'width' => 'actualwidth', 'height' => 'actualheight', 'duration' => 'duration', 'rotate' => 'rotate' );

		if ( empty($kgvid_postmeta['duration']) ) {
			$movie_info = kgvid_get_video_dimensions($moviefilepath);
			foreach ( $keys as $info => $meta ) {
				if ( !empty($movie_info[$info]) ) { $kgvid_postmeta[$meta] = $movie_info[$info]; }
			}
			kgvid_save_attachment_meta($postID, $kgvid_postmeta);
		}
		else { //post meta is already set
			$movie_info = array();
			foreach ( $keys as $info => $meta ) {
				$movie_info[$info] = $kgvid_postmeta[$meta];
			}
			$movie_info['worked'] = true;
		}
	}
	else {
		$moviefilepath = esc_url_raw(str_replace(" ", "%20", $movieurl));
		$moviefilepath = str_replace("https://", "http://",  $moviefilepath);
		$movie_info = kgvid_get_video_dimensions($moviefilepath);
	}

	if ($movie_info['worked'] == true) { //if FFMPEG was able to open the file

		$movie_extension = pathinfo(parse_url($movieurl, PHP_URL_PATH), PATHINFO_EXTENSION);
		$moviefilebasename = sanitize_file_name(basename($movieurl,'.'.$movie_extension));
		$thumbnailfilebase = $uploads['url']."/thumb_tmp/".$moviefilebasename;

		$movie_width = $movie_info['width'];
		$movie_height = $movie_info['height'];

		if (!file_exists($uploads['path'].'/thumb_tmp')) { mkdir($uploads['path'].'/thumb_tmp'); }

		if ( $movie_info['rotate'] === false || $options['ffmpeg_vpre'] == "on" ) { $movie_info['rotate'] = ""; }
		switch ($movie_info['rotate']) { //if it's a sideways mobile video
			case 90:
			case 270:
				$movie_width ^= $movie_height ^= $movie_width ^= $movie_height; //swap height & width
				break;
		}

		$thumbnailheight = strval(round(floatval($movie_height) / floatval($movie_width) * 200));

		$jpgpath = $uploads['path']."/thumb_tmp/";

		$movieoffset = round((floatval($movie_info['duration']) * $iincreaser) / ($numberofthumbs * 2), 2);
		if ( $movieoffset > floatval($movie_info['duration']) ) {
			$movieoffset = floatval($movie_info['duration']);
		}

		if ($generate_button == "random") { //adjust offset random amount
			$movieoffset = $movieoffset - rand(0, round(intval($movie_info['duration']) / $numberofthumbs));
			if ($movieoffset < 0) { $movieoffset = "0"; }
		}

		if ($thumbtimecode) { //if a specific thumbnail timecode is set
			if ($thumbtimecode == "firstframe") { $thumbtimecode = "0"; }
			$timecode_array = explode(":", $thumbtimecode);
			$timecode_array = array_reverse($timecode_array);
			if ( array_key_exists(1, $timecode_array) ) { $timecode_array[1] = $timecode_array[1] * 60; }
			if ( array_key_exists(2, $timecode_array) ) { $timecode_array[2] = $timecode_array[2] * 3600; }
			$thumbtimecode = array_sum($timecode_array);
			$movieoffset = $thumbtimecode;
			$i = $numberofthumbs + 1;
		}

		if ($dofirstframe == "true" && $i == 1) {
			$movieoffset = "0";
		}

		$thumbnailfilename[$i] = $jpgpath.$moviefilebasename."_thumb".round($movieoffset).".jpg";
		$thumbnailfilename[$i] = str_replace(" ", "_", $thumbnailfilename[$i]);

		if ( !empty($options['htaccess_login']) && strpos($moviefilepath, 'http://') === 0 ) {
			$moviefilepath = substr_replace($moviefilepath, $options['htaccess_login'].':'.$options['htaccess_password'].'@', 7, 0);
		}

		$ffmpeg_options = '-y -ss '.round($movieoffset).' -i "'.$moviefilepath.'"'.$movie_info['rotate'].' -qscale 1 -vframes 1 -f mjpeg "'.$thumbnailfilename[$i].'"';

		$thumbnailurl = $thumbnailfilebase."_thumb".round($movieoffset).'.jpg';
		$thumbnailurl = str_replace(" ", "_", $thumbnailurl);

		exec(escapeshellcmd($ffmpegPath." ".$ffmpeg_options));
		if ( is_file($thumbnailfilename[$i]) )
		kgvid_schedule_cleanup_generated_files('thumbs');

		$thumbnaildisplaycode = '<div class="kgvid_thumbnail_select" name="attachments['.$postID.'][thumb'.$i.']" id="attachments-'.$postID.'-thumb'.$i.'"><label for="kgflashmedia-'.$postID.'-thumbradio'.$i.'"><img src="'.$thumbnailurl.'?'.rand().'" width="200" height="'.$thumbnailheight.'" class="kgvid_thumbnail"></label><br /><input type="radio" name="attachments['.$postID.'][thumbradio_'.$postID.']" id="kgflashmedia-'.$postID.'-thumbradio'.$i.'" value="'.str_replace('/thumb_tmp/', '/', $thumbnailurl).'" onchange="kgvid_select_thumbnail(this.value, \''.$postID.'\', '.$movieoffset.', jQuery(this).parent().find(\'img\')[0]);"></div>';

		$i++;

		$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "movie_width"=>$movie_width, "movie_height"=>$movie_height, "lastthumbnumber"=>$i, "movieoffset"=>$movieoffset, "thumb_url"=>str_replace('/thumb_tmp/', '/', $thumbnailurl) );

		return $arr;

	}//if ffmpeg can open movie

	else {
		$thumbnaildisplaycode = "<strong>".__('Can\'t open movie file.', 'video-embed-thumbnail-generator')."</strong><br />".$movie_info['output'];
		$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "embed_display"=>$thumbnaildisplaycode, "lastthumbnumber"=>"break" );
		return $arr;
	} //can't open movie

}

function kgvid_enqueue_videos($postID, $movieurl, $encode_checked, $parent_id, $blog_id = false) {

	if ( !empty($blog_id) && $blog_id != 'false' ) {  switch_to_blog( $blog_id ); }

	$options = kgvid_get_options();
	$ffmpegPath = $options['app_path']."/".$options['video_app'];
	$uploads = wp_upload_dir();

	$embed_display = "";
	$start_encoding = false;
	$encode_these = array();
	$encode_list = array();
	$embeddable = array("flv", "f4v", "mp4", "mov", "m4v", "ogv", "ogg", "webm");
	$h264extensions = array("mp4", "m4v", "mov");
	$video_formats = kgvid_video_formats(false, false);
	$sanitized_url = kgvid_sanitize_url($movieurl);
	$movieurl = $sanitized_url['movieurl'];
	$post_type = get_post_type($postID);
	if ( $post_type == "attachment" ) { $filepath = get_attached_file($postID); }
	else { $filepath = $movieurl; }
	$movie_info = kgvid_get_video_dimensions($filepath);

	if ($movie_info['worked'] == true) { //if FFMPEG was able to open the file

		$movie_width = $movie_info['width'];
		$movie_height = $movie_info['height'];

		if ( $post_type == "attachment" ) { //if the video is in the database

			$kgvid_postmeta = kgvid_get_attachment_meta($postID);
			$keys = array( 'width' => 'actualwidth', 'height' => 'actualheight', 'duration' => 'duration', 'rotate' => 'rotate' );
			foreach ( $keys as $info => $meta ) {
				$kgvid_postmeta[$meta] = $movie_info[$info];
			}

		}

		$encodevideo_info = kgvid_encodevideo_info($movieurl, $postID);

		foreach ( $video_formats as $format => $format_stats ) {
			if ( array_key_exists($format, $encode_checked) && $encode_checked[$format] == "true" ) {
				if ( !$encodevideo_info[$format]['exists'] ) {
					if ( ($format == "1080" && $movie_height <= 1080) || ($format == "720" && $movie_height <= 720) ) {
						$movie_extension = pathinfo($movieurl, PATHINFO_EXTENSION);
						if ( $encode_checked['fullres'] == "true" || in_array($movie_extension, $h264extensions) || $movie_height < intval($format) ) {
							$encode_formats[$format]['status'] = "lowres";
						} //skip if the resolution of an existing video is lower than the HD format
					}
					else {
						$encode_formats[$format]['status'] = "queued";
						$encode_formats[$format]['name'] = $format_stats['name'];
						$encode_list[$format] = $format_stats['name'];
						if ( isset($kgvid_postmeta) ) {	$kgvid_postmeta['encode'.$format] = 'on'; }
					}
				} // if video doesn't already exist
				else { $encode_formats[$format]['status'] = "encoded"; }
			} // if user wants to encode format
			else {
				$encode_formats[$format]['status'] = "notchecked";
				if ( isset($kgvid_postmeta) ) {	$kgvid_postmeta['encode'.$format] = 'notchecked'; }
			}
		}//end loop through video formats

		if ( isset($kgvid_postmeta) ) { kgvid_save_attachment_meta($postID, $kgvid_postmeta); }

		if ( !empty($encode_list) ) { //if there's anything to encode

			$video_encode_queue = kgvid_get_encode_queue();
			if ( empty($parent_id) && $post_type == "attachment"  ) { $parent_id = get_post($postID)->post_parent; }
			$current_user_id = get_current_user_id();
			if ( $current_user_id == 0 && $post_type == "attachment" ) { $current_user_id = get_post($postID)->post_author; }

			$queue_entry = array (
				'attachmentID' => $postID,
				'parent_id' => $parent_id,
				'movieurl' => $movieurl,
				'encode_formats'=> $encode_formats,
				'movie_info' => $movie_info,
				'user_id' => $current_user_id
			);
			if ( function_exists( 'is_plugin_active_for_network' ) && is_plugin_active_for_network( plugin_basename(__FILE__) ) ) {
				$queue_entry['blog_id'] = get_current_blog_id();
			}

			$already_queued = false;
			if ( !empty($video_encode_queue ) ) {
				foreach ($video_encode_queue as $index => $entry) {
					if ( $entry['movieurl'] == $movieurl ) {
						$already_queued = $index;
						foreach ( $entry['encode_formats'] as $format => $value ) {

							if ( $value['status'] == "queued" && array_key_exists($format, $encode_list) ) {
								unset($encode_list[$format]);
							}

							if ( $value['status'] == "encoding" || $encode_checked[$format] != "true" ) {
								$queue_entry['encode_formats'][$format] = $entry['encode_formats'][$format];
							} //don't edit queue entry for anything that's currently encoding or not checked

							if ( $parent_id == "check" ) {
								$parent_id = $entry['parent_id'];
								$queue_entry['parent_id'] = $entry['parent_id'];
							}

						}//loop through formats

						if ( array_key_exists('blog_id', $entry) ) { //reset the ids in case this is the network queue
							$queue_entry['parent_id'] = $entry['parent_id'];
							$queue_entry['blog_id'] = $entry['blog_id'];
						}

					}//url matches existing queue entry
				}//loop through queue
			}//if there's already a queue

			$imploded_encode_list = implode(", " , $encode_list);

			if ( $already_queued !== false ) {
				$video_encode_queue[$already_queued] = $queue_entry;
				kgvid_save_encode_queue($video_encode_queue);
				$existing_queue_position = strval(intval($already_queued)+1);
				if ( !empty($encode_list) ) { $embed_display = "<strong>".sprintf( __('%1$s updated in existing queue entry in position %2$s.', 'video-embed-thumbnail-generator'), $imploded_encode_list, $existing_queue_position )." </strong>"; }
				else { $embed_display = "<strong>".sprintf( __('Video is already queued in position %s.', 'video-embed-thumbnail-generator'), $existing_queue_position )." </strong>"; }
			}
			else {
				$video_encode_queue[] = $queue_entry;
				kgvid_save_encode_queue($video_encode_queue);
				$queue_position = intval(key( array_slice( $video_encode_queue, -1, 1, TRUE ) ));
				$new_queue_position = strval(intval($queue_position)+1);
				if ( $queue_position == 0 ) { $embed_display = "<strong>".__('Starting', 'video-embed-thumbnail-generator')." ".strtoupper($options['video_app'])."... </strong>"; }
				else { $embed_display = "<strong>".sprintf( __('%1$s added to queue in position %2$s.', 'video-embed-thumbnail-generator'), $imploded_encode_list, $new_queue_position )." </strong>";
				}
			}
		} //if any video formats don't already exist, add to queue
		else {
			$embed_display = "<strong>".__('Nothing to encode.', 'video-embed-thumbnail-generator')."</strong>";
			$transient = get_transient( 'kgvid_new_attachment_transient' );
			if ( is_array($transient) && in_array($postID, $transient) ) {
				$key = array_search($postID, $transient);
				unset($transient[$key]);
				if ( empty($transient) ) { delete_transient( 'kgvid_new_attachment_transient' ); }
				else { set_transient( 'kgvid_new_attachment_transient', $transient, DAY_IN_SECONDS ); }
			}
		}

		$replaceoptions = "";
		$originalselect = "";

		$transient = get_transient( 'kgvid_new_attachment_transient' ); //error checking to avoid race conditions when using Add From Server

		if ( is_array($transient) ) {

			$video_encode_queue = kgvid_get_encode_queue();

			if ( $video_encode_queue ) {
				foreach ( $video_encode_queue as $index => $entry ) {
					$key = array_search($entry['attachmentID'], $transient);
					if ( $key !== false ) {
						unset($transient[$key]);
					}
				}
			}

			if ( !empty($transient) ) {
				foreach ( $transient as $id ) {
					$cron_scheduled = wp_next_scheduled( 'kgvid_cron_new_attachment', array($id) );
					if ( $cron_scheduled ) { continue; }
					else { wp_schedule_single_event( time() + rand(0,10), 'kgvid_cron_new_attachment', array($id) ); }
				}
			}

		}

		if ( empty($transient) ) { delete_transient( 'kgvid_new_attachment_transient' ); }
		else { set_transient( 'kgvid_new_attachment_transient', $transient, DAY_IN_SECONDS ); }

		$arr = array ( "embed_display"=>$embed_display );

		if ( !empty($blog_id) && $blog_id != 'false' ) { restore_current_blog(); }

		return $arr;

	}
	else {

		$thumbnaildisplaycode = "<strong>".__('Can\'t open movie file.', 'video-embed-thumbnail-generator')."</strong><br />".$movie_info['output'];
		$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "embed_display"=>$thumbnaildisplaycode, "lastthumbnumber"=>"break" );

		if ( !empty($blog_id) && $blog_id != 'false' ) { restore_current_blog(); }

		return $arr;

	} //can't open movie

}

function kgivd_save_singleurl_poster($parent_id, $poster, $movieurl, $set_featured) { //called by the "Embed Video from URL" tab when submitting

		$sanitized_url = kgvid_sanitize_url($movieurl);
		if ( !empty($poster) ) { $thumb_id = kgvid_save_thumb($parent_id, $sanitized_url['basename'], $poster); }
		if ( !empty($thumb_id) && $set_featured == "on" ) {
			set_post_thumbnail($parent_id, $thumb_id);
		}

}//if submit

function kgvid_callffmpeg() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	$options = kgvid_get_options();

	if (isset($_POST['attachmentID'])) { $postID = $_POST['attachmentID']; }
	if (isset($_POST['movieurl'])) { $movieurl = $_POST['movieurl']; }
	if (isset($_POST['numberofthumbs'])) { $numberofthumbs = $_POST['numberofthumbs']; }
	if (isset($_POST['thumbnumber'])) { $i = $_POST['thumbnumber']; }
	if (isset($_POST['thumbnumberplusincreaser'])) { $iincreaser = $_POST['thumbnumberplusincreaser']; }
	if (isset($_POST['thumbtimecode'])) { $thumbtimecode = $_POST['thumbtimecode']; }
	if (isset($_POST['dofirstframe'])) { $dofirstframe = $_POST['dofirstframe']; }
	if (isset($_POST['generate_button'])) { $generate_button = $_POST['generate_button']; }

	if (isset($_POST['encodeformats'])) { $encode_checked = $_POST['encodeformats']; }
	if (isset($_POST['blog_id'])) { $blog_id = $_POST['blog_id']; }
	else { $blog_id = false; }

	if (isset($_POST['poster'])) { $poster = $_POST['poster']; }
	if (isset($_POST['parent_id'])) { $parent_id = $_POST['parent_id']; }
	if ( !isset($parent_id) ) {	$parent_id = "check"; }
	if ( isset($_POST['set_featured']) ) { $set_featured = $_POST['set_featured']; }

	if (isset($_POST['ffmpeg_action'])) { $action = $_POST['ffmpeg_action']; }

	if ( $options['ffmpeg_exists'] == true ) {

		if ( $action == "generate" && current_user_can('make_video_thumbnails') ) {
			$arr = kgvid_make_thumbs($postID, $movieurl, $numberofthumbs, $i, $iincreaser, $thumbtimecode, $dofirstframe, $generate_button);
			echo json_encode($arr);
		}
		if ( $action == "enqueue" && current_user_can('encode_videos') ) {
			$arr = kgvid_enqueue_videos($postID, $movieurl, $encode_checked, $parent_id, $blog_id);
			echo json_encode($arr);
		}
		if ( $action == "submit" && current_user_can('make_video_thumbnails') ) { kgivd_save_singleurl_poster($parent_id, $poster, $movieurl, $set_featured); }
	}
	else {
			$thumbnaildisplaycode = '<strong>'.sprintf( __('Error: %1$s not found. Verify that %1$s is installed at %2$s and check the %3$sapplication path plugin setting', 'video-embed-thumbnail-generator'), strtoupper($options["video_app"]), $options["app_path"], '<a href="options-general.php?page=video-embed-thumbnail-generator/video-embed-thumbnail-generator.php">' ).'</a>.</strong>' ;
			$arr = array ( "thumbnaildisplaycode"=>$thumbnaildisplaycode, "embed_display"=>$thumbnaildisplaycode, "lastthumbnumber"=>"break" );
			echo json_encode($arr);
	}//no ffmpeg
	die(); // this is required to return a proper result
}
add_action('wp_ajax_kgvid_callffmpeg', 'kgvid_callffmpeg');

function kgvid_encode_videos() {

	$options = kgvid_get_options();

	$embed_display = "";
	$video = array();
	$video_key = "";
	$queued_format = "";
	$encoding = array();
	$start_encoding = array();
	$encode_string = array();
	$uploads = wp_upload_dir();
	$movie_info = array("width"=>"", "height"=>"");
	$video_encode_queue = kgvid_get_encode_queue();
	$video_formats = kgvid_video_formats();

	if ( !empty($video_encode_queue) ) {

		$x = $options['simultaneous_encodes'];

		foreach ( $video_encode_queue as $video_key => $queue_entry ) { //search the queue for any encoding video
			foreach ( $queue_entry['encode_formats'] as $format => $value ) {
				if ( $value['status'] == "encoding" ) {
					$video[] = $video_encode_queue[$video_key];
					$encoding[] = array('key'=>$video_encode_queue[$video_key], 'value' => $value);
					$x--;
					if ( 0 == $x ) { break 2; }
				}
			}
		}

		if ( count($encoding) < intval($options['simultaneous_encodes']) ) {
			$x = count($encoding);
			foreach ( $video_encode_queue as $video_key => $queue_entry ) {
				foreach ( $queue_entry['encode_formats'] as $format => $value ) {
					if ( $value['status'] == "queued" ) {
						$start_encoding[] = array('video_key' => $video_key, 'queued_format' => $format );
						$x++;
						if ( $x == intval($options['simultaneous_encodes']) ) { break 2; }
					}
				}
			}
		}

		if ( !empty($start_encoding) ) {

			foreach( $start_encoding as $key => $queue_info ) {

				extract($queue_info, EXTR_OVERWRITE);
				$video = $video_encode_queue[$video_key];

				if ( array_key_exists('blog_id', $video) ) { switch_to_blog( $video['blog_id'] ); }

				$ffmpegPath = $options['app_path']."/".$options['video_app'];
				$moviefilepath = '';
				if ( get_post_type($video['attachmentID']) == "attachment" ) { $moviefilepath = get_attached_file($video['attachmentID']); }
				elseif ( empty($moviefilepath) || !file_exists($moviefilepath) ) {
					$moviefilepath = str_replace(" ", "%20", esc_url_raw($video['movieurl']));
					$moviefilepath = str_replace("https://", "http://",  $moviefilepath);
				}

				$movie_info = $video['movie_info'];
				$encodevideo_info = kgvid_encodevideo_info($video['movieurl'], $video['attachmentID']);

				$logfile = "";
				$processPID = "";
				$serverOS = "";
				$ffmpeg_options = "";

				$aac_array = kgvid_aac_encoders();
				$aac_available = false;
				foreach ( $aac_array as $aaclib ) { //cycle through available AAC encoders in order of quality
					if ( $movie_info['configuration'][$aaclib] == "true" ) { $aac_available = true; break; }
				}

				foreach( $video_formats as $format => $format_stats ) {

					if ( $queued_format == $format ) {

						$encode_dimensions = kgvid_set_encode_dimensions($movie_info, $format_stats);

						if ( $format_stats['type'] == "h264" ) {
							if ( $movie_info['configuration']['libx264'] == "true" && $aac_available ) {

								if ( ! $encodevideo_info[$format]['exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info[$format]['filepath']) < 24576) ) {

									$encode_string = kgvid_generate_encode_string($moviefilepath, $encodevideo_info[$format]['filepath'], $movie_info, $queued_format, $encode_dimensions['width'], $encode_dimensions['height'], $movie_info['rotate']);

								}//if file doesn't already exist
								else {
									$embed_display = sprintf( __('%s already encoded', 'video-embed-thumbnail-generator'), $format_stats['name'] );
									$video_encode_queue[$video_key]['encode_formats'][$format]['status'] = 'Encoding Complete';
								}
								break; //don't bother looping through the rest if we already found the format
							}//if the x264 library and an aac library is enabled
							else {
								$lastline = sprintf( __('%s missing library libx264 required for H.264 encoding', 'video-embed-thumbnail-generator'), strtoupper($options['video_app']) );
								if ( !$aac_available ) {
									array_pop($aac_array); //get rid of the built-in "aac" encoder since it can't really be "installed"
									$lastaac = array_pop($aac_array);
									$aac_list = implode(", ", $aac_array);
									$aac_list .= ", ".__('or', 'video-embed-thumbnail-generator')." ".$lastaac;
									$lastline .= " ".sprintf( __('and missing an AAC encoding library. Please install and enable libx264 and %s', 'video-embed-thumbnail-generator'), $aac_list );
								}
								$video_encode_queue[$video_key]['encode_formats'][$format]['status'] = "error";
								$video_encode_queue[$video_key]['encode_formats'][$format]['lastline'] = $lastline;
								$embed_display = __("Missing libraries", 'video-embed-thumbnail-generator');
							}
						}


						if ( $format_stats['type'] == "webm" || $format_stats['type'] == "ogv" ) { //if it's not H.264 they both work essentially the same
							if ( ! $encodevideo_info[$queued_format]['exists'] || ($encodevideo_info['sameserver'] && filesize($encodevideo_info[$queued_format]['filepath']) < 24576) ) {
								if ( $movie_info['configuration']['libvorbis'] == "true" && $movie_info['configuration'][$video_formats[$queued_format]['vcodec']] == "true" ) {

									$encode_string = kgvid_generate_encode_string($moviefilepath, $encodevideo_info[$queued_format]['filepath'], $movie_info, $queued_format, $encode_dimensions['width'], $encode_dimensions['height'], $movie_info['rotate']);
									$embed_display = sprintf( __('Encoding %s', 'video-embed-thumbnail-generator'), $video_formats[$queued_format]['name'] );
								}//if the necessary libraries are enabled
								else {
									$missing_libraries = array();
									if($movie_info['configuration']['libvorbis'] == 'false') { $missing_libraries[] = 'libvorbis'; }
									if($movie_info['configuration'][$video_formats[$queued_format]['vcodec']] == 'false') { $missing_libraries[] = $video_formats[$queued_format]['vcodec']; }
									$lastline = sprintf( __('%1$s missing library %2$s required for %3$s encoding.', 'video-embed-thumbnail-generator'), strtoupper($options['video_app']), implode(', ', $missing_libraries), $video_formats[$queued_format]['name']);
									$video_encode_queue[$video_key]['encode_formats'][$queued_format]['status'] = "error";
									$video_encode_queue[$video_key]['encode_formats'][$queued_format]['lastline'] = $lastline;
									$embed_display = __("Missing libraries", 'video-embed-thumbnail-generator');
								}
							}//if file doesn't already exist
							else { $embed_display = sprintf( __('%s already encoded.', 'video-embed-thumbnail-generator'), $video_formats[$queued_format]['vcodec'] ); }

						}//if webm or ogg format is queued

					}//if format is chosen for encoding

				}//format loop

				if ( !empty($encode_string) ) {

					$logfile = $uploads['path'].'/'.str_replace(" ", "_", $encodevideo_info['moviefilebasename']).'_'.$queued_format.'_'.sprintf("%04s",mt_rand(1, 1000)).'_encode.txt';

					$cmd = escapeshellcmd($encode_string[1]).$encode_string[2].escapeshellcmd($encode_string[3]);

					if ( !empty($cmd) ) { $cmd = $cmd.' > "'.$logfile.'" 2>&1 & echo $!'; }

					else {
						$arr = array ( "embed_display"=>"<span class='kgvid_warning'>".__("Error: Command 'escapeshellcmd' is disabled on your server.", 'video-embed-thumbnail-generator')."</span>" );
						return $arr;
					}
					$process = new kgvid_Process($cmd);

					sleep(1);

					$processPID = $process->getPid();
					$serverOS = $process->OS;

					$args = array('logfile'=>$logfile);
					wp_schedule_single_event(time()+600, 'kgvid_cleanup_generated_logfiles', $args);
					if ( !wp_next_scheduled('kgvid_cleanup_queue', array ( 'scheduled' )) ) {
						wp_schedule_event( time()+86400, 'daily', 'kgvid_cleanup_queue', array ( 'scheduled' ) );
					}

					$video_encode_queue[$video_key]['encode_formats'][$queued_format] = array (
						'name' => $video_formats[$queued_format]['name'],
						'status' => 'encoding',
						'filepath' => $encodevideo_info[$queued_format]['filepath'],
						'url' => $encodevideo_info[$queued_format]['url'],
						'logfile' => $logfile,
						'PID' => $processPID,
						'OS' => $serverOS,
						'started' => time()
					);

				} //end if there's stuff to encode

			}//end loop

			kgvid_save_encode_queue($video_encode_queue);

		} //if there's a format to encode

	} //if there's a queue
	$arr = array ( "embed_display"=>"<strong>".$embed_display."</strong>", "video_key"=>$video_key, "format"=>$queued_format, "actualwidth"=>$movie_info['width'], "actualheight"=>$movie_info['height'] );

	if ( array_key_exists('blog_id', $video) ) { restore_current_blog(); }

	return $arr;

}

function kgvid_ajax_encode_videos() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$arr = kgvid_encode_videos();
	echo json_encode($arr);
	die();

}
add_action('wp_ajax_kgvid_ajax_encode_videos', 'kgvid_ajax_encode_videos');

function kgvid_test_ffmpeg() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$options = kgvid_get_options();
	$uploads = wp_upload_dir();
	$video_formats = kgvid_video_formats();
	$suffix = $video_formats[$options['sample_format']]['suffix'];

	$encode_string = $options['encode_string'];
	$cmd = escapeshellcmd($encode_string[1]).$encode_string[2].escapeshellcmd($encode_string[3]);
	exec ( $cmd.' 2>&1', $output );
	$arr['output'] = implode("\n", $output);

	if ( file_exists($uploads['path']."/sample-video-h264".$suffix) ) {

		if ( $options['moov'] == "qt-faststart" || $options['moov'] == "MP4Box" ) {
			$arr['output'] .= kgvid_fix_moov_atom($uploads['path']."/sample-video-h264".$suffix);
		}

		if ( !empty($options['ffmpeg_watermark']['url']) ) {
			if (!file_exists($uploads['path'].'/thumb_tmp')) { mkdir($uploads['path'].'/thumb_tmp'); }
			$cmd = escapeshellcmd($options['app_path'].'/'.$options['video_app'].' -y -i "'.$uploads['path']."/sample-video-h264".$suffix.'" -qscale 1 -vframes 1 -f mjpeg '.$uploads['path'].'/thumb_tmp/watermark_test.jpg');
			kgvid_schedule_cleanup_generated_files('thumbs');
			exec ( $cmd );
			if ( file_exists($uploads['path'].'/thumb_tmp/watermark_test.jpg') ) {
				$arr['watermark_preview'] = $uploads['url'].'/thumb_tmp/watermark_test.jpg';
			}
		}

		unlink($uploads['path']."/sample-video-h264".$suffix);

	}

	echo json_encode($arr);
	die;

}
add_action('wp_ajax_kgvid_test_ffmpeg', 'kgvid_test_ffmpeg');

function kgvid_encode_progress($video_key, $format, $page) {

	$video_encode_queue = kgvid_get_encode_queue();
	$time_to_wait = 5000; //default 5 seconds between checking encode progress

	if ( is_array($video_encode_queue) && array_key_exists($video_key, $video_encode_queue) ) {

		$video_entry = $video_encode_queue[$video_key];

		if ( array_key_exists('blog_id', $video_entry) ) {
			$blog_id = $video_entry['blog_id'];
			switch_to_blog($blog_id);
		}
		else { $blog_id = false; }

		$script_function = 'kgvid_redraw_encode_checkboxes("'.$video_entry['movieurl'].'", "'.$video_entry['attachmentID'].'", "'.$page.'", "'.$blog_id.'")';

		if ( is_array($video_entry['encode_formats'][$format]) && array_key_exists('logfile', $video_entry['encode_formats'][$format]) ) {

			$pid = $video_entry['encode_formats'][$format]['PID'];
			$logfile = $video_entry['encode_formats'][$format]['logfile'];
			$started = $video_entry['encode_formats'][$format]['started'];
			$movie_duration = $video_entry['movie_info']['duration'];
			$filepath = $video_entry['encode_formats'][$format]['filepath'];
			$embed_display = "";
			$percent_done = "";
			$time_remaining = "";
			$other_message = "";
			$logfilecontents = "";
			$lastline = "";

			if ( $video_entry['encode_formats'][$format]['status'] != "Encoding Complete" ) {

				if ( is_file($logfile) ) {

					$fp = fopen($logfile, 'r');
					$c = '';
					$read = '';
					$offset = -1;
					$lines = 2;
					if ( substr(strtoupper(PHP_OS),0,3) == "WIN" ) { $lines = 4; }
					while ( $lines && fseek($fp, $offset, SEEK_END) >= 0 ) {
						$c = fgetc($fp);
						if( $c == "\n" || $c == "\r" ) {
							$lines--;
						}
						$read .= $c;
						$offset--;
					}
					fclose($fp);
					$lastline = strrev(rtrim($read,"\n\r"));

					$last_match = "";
					$time_matches = "";
					$video_matches = "";
					$libx264_matches = "";
					$fps_matches = "";
					$fps_match = "";
					$basename = "";

					preg_match('/time=(.*?) /', $lastline, $time_matches);

					if ( is_array($time_matches) && array_key_exists(1, $time_matches) != true ) { //if something other than the regular FFMPEG encoding output check for these
						preg_match('/video:(.*?) /', $lastline, $video_matches);
						preg_match('/libx264 (.*?) /', $lastline, $libx264_matches);
						preg_match('/aac (.*?) /', $lastline, $aac_matches);
						$queue_match = preg_match('/queue on closing/', $lastline);
					}

					if ( is_array($time_matches) && array_key_exists(1, $time_matches) == true ) { //still encoding

						if ( strpos($time_matches[1], ':') !== false ) {
							$current_hours = intval(substr($time_matches[1], -11, 2));
							$current_minutes = intval(substr($time_matches[1], -8, 2));
							$current_seconds = intval(substr($time_matches[1], -5, 2));
							$current_seconds = ($current_hours * 60 * 60) + ($current_minutes * 60) + $current_seconds;
						}
						else { $current_seconds = $time_matches[1]; }

						$percent_done = intval($current_seconds)/intval($movie_duration);
						$time_elapsed = time() - $started;
						if ( $percent_done != 0 ) { $time_remaining = date('H:i:s', round($time_elapsed / $percent_done) - $time_elapsed); }
						else $time_remaining = "unknown";
						$percent_done = round($percent_done*100);
						if ( $percent_done < 20 ) { $percent_done_text = ""; }
						else { $percent_done_text = strval($percent_done)."%"; }

						preg_match('/fps=\s?(.*?) /', $lastline, $fps_matches);
						if ( is_array($fps_matches) && array_key_exists(1, $fps_matches) == true ) {
							if ( $fps_matches[1] != 0 ) { $fps_match = $fps_matches[1]; }
							else {  $fps_match = "10"; }
						}
						else {  $fps_match = "10"; }
						$time_to_wait = strval(max(round(40000/intval($fps_match)), 1000)); //wait at least 1 second
						if ( intval($time_to_wait) > 10000 ) { //wait no more than 10 seconds
							$time_to_wait = 10000;
						}

						$args = array($video_key, $format, $page);
						wp_schedule_single_event(time()+60, 'kgvid_cron_queue_check', $args);

						$embed_display = '<strong>'.__('Encoding', 'video-embed-thumbnail-generator').'</strong><br /><div class="kgvid_meter"><div class="kgvid_meter_bar" style="width:'.$percent_done.'%;"><div class="kgvid_meter_text">'.$percent_done_text.'</div></div></div>';

						if ( current_user_can('encode_videos') && $pid ) {
							$embed_display .= '<a href="javascript:void(0);" class="kgvid_cancel_button" id="attachments-'.$video_entry["attachmentID"].'-kgflashmediaplayer-cancelencode" onclick="kgvid_cancel_encode('.$pid.', \''.$video_entry["attachmentID"].'\', \''.$video_key.'\', \''.$format.'\', \''.$blog_id.'\');">'.__('Cancel', 'video-embed-thumbnail-generator').'</a>';
						}

						$embed_display .= '<div class="kgvid_encoding_small_text"><small>'.__('Elapsed:', 'video-embed-thumbnail-generator').' '.date('H:i:s',$time_elapsed).'. '.__('Remaining:', 'video-embed-thumbnail-generator').' '.$time_remaining.'. '._x('FPS:', 'Frames per second', 'video-embed-thumbnail-generator').' '.$fps_match.'</small></div>';
					}
					elseif ( time() - $started < 10 || ( file_exists($filepath) && time() - filemtime($filepath) < 10 ) ) { //not enough time has passed, so check again later
						$args = array($video_key, $format, $page);
						$embed_display = '<strong>'.__('Encoding', 'video-embed-thumbnail-generator').'</strong>';
						$time_to_wait = 1000;
						wp_schedule_single_event(time()+60, 'kgvid_cron_queue_check', $args);
					}
					elseif (
						( is_array($video_matches) && array_key_exists(1, $video_matches) == true )
						|| ( is_array($libx264_matches) && array_key_exists(1, $libx264_matches) == true )
						|| ( is_array($aac_matches) && array_key_exists(1, $aac_matches) == true )
						|| ( $queue_match )
					) { //encoding complete

						$percent_done = 100;
						$ended = filemtime($logfile);
						$time_elapsed = $ended - $started;
						$time_remaining = "0";
						$fps_match = "10";
						if ( is_array($libx264_matches) && array_key_exists(1, $libx264_matches) ) {
							$moov_output = kgvid_fix_moov_atom($filepath);
						} //fix the moov atom if the file was encoded by libx264
						$video_encode_queue[$video_key]['encode_formats'][$format]['status'] = "Encoding Complete";
						$video_encode_queue[$video_key]['encode_formats'][$format]['ended'] = $ended;
						$video_encode_queue[$video_key]['encode_formats'][$format]['lastline'] = $lastline;

						kgvid_save_encode_queue($video_encode_queue);

						if ( $format != "fullres" ) {

							//insert the encoded video as a child attachment of the original video, or post if external original
							if ( get_post_type($video_entry['attachmentID']) == "attachment" ) { //if the original video is in the database set that as parent
								$parent_id = $video_entry['attachmentID'];
								$title = get_the_title($video_entry['attachmentID']);
							}
							else { //otherwise set the post as the parent
								$parent_id = $video_entry['parent_id'];
								$sanitized_url = kgvid_sanitize_url($video_entry['movieurl']);
								$title = $sanitized_url['basename'];
							}

							global $user_ID;
							$video_id = kgvid_url_to_id($video_encode_queue[$video_key]['encode_formats'][$format]['url']);
							if ( !$video_id ) {
								$wp_filetype = wp_check_filetype(basename($filepath), null );

								$title .= " ".$video_entry['encode_formats'][$format]['name'];

								if ( $user_ID == 0 ) {
									$parent_post = get_post($parent_id);
									$user_ID = $parent_post->post_author;
								}

								$attachment = array(
								   'guid' => $video_entry['encode_formats'][$format]['url'],
								   'post_mime_type' => $wp_filetype['type'],
								   'post_title' => $title,
								   'post_content' => '',
								   'post_status' => 'inherit',
								   'post_author' => $user_ID
								);

								$new_id = wp_insert_attachment( $attachment, $filepath, $parent_id );
								// you must first include the image.php file
								// for the function wp_generate_attachment_metadata() to work and media.php for wp_read_video_metadata() in WP 3.6+
								require_once(ABSPATH . 'wp-admin/includes/image.php');
								global $wp_version;
								if ( $wp_version >= 3.6 ) { require_once(ABSPATH . 'wp-admin/includes/media.php'); }
								require_once(ABSPATH . 'wp-admin/includes/media.php');
								$attach_data = wp_generate_attachment_metadata( $new_id, $filepath );
								wp_update_attachment_metadata( $new_id, $attach_data );
								update_post_meta( $new_id, '_kgflashmediaplayer-format', $format );
								if ( get_post_type($video_entry['attachmentID']) == false ) { update_post_meta( $new_id, '_kgflashmediaplayer-externalurl', $video_entry['movieurl'] ); } //connect new video to external url
							}
						}

						//finish inserting attachment

						$embed_display = '<strong>'.__('Encoding Complete', 'video-embed-thumbnail-generator').'</strong>';

						$next_video = kgvid_encode_videos(); //start the next queued video
						if ( !empty($next_video['format']) ) { //if there's something to encode, schedule cron
							$args = array($next_video['video_key'], $next_video['format'], $page);
							wp_schedule_single_event(time()+60, 'kgvid_cron_queue_check', $args);
						}

						if ( (empty($next_video['format']) || $next_video['video_key'] != $video_key) && $video_encode_queue[$video_key]['encode_formats']['fullres']['status'] == "Encoding Complete" ) { //if there's nothing left to encode in this video and we've encoded the fullres
							$new_movie_url = kgvid_replace_video( $video_key, 'fullres' );
							$script_function = 'kgvid_redraw_encode_checkboxes("'.$new_movie_url.'", "'.$video_entry['attachmentID'].'", "'.$page.'", "'.$blog_id.'")';

							$embed_display = '<strong>'.__('Encoding Complete', 'video-embed-thumbnail-generator').'</strong>';

						}//fullres encoding complete

					}//encoding complete

					else { //there was an unexpected output and the encoded file hasn't been modified in more than 10 seconds

						if ( strpos($lastline, "signal 15") !== false ) { //if the encoding was intentionally canceled
							$lastline = __("Encoding was canceled.", 'video-embed-thumbnail-generator');
						}
						$video_encode_queue[$video_key]['encode_formats'][$format]['status'] = "canceled";

					}

				} //if logfile
				else {

					$video_encode_queue[$video_key]['encode_formats'][$format]['status'] = "error";
					$lastline = __("No log file", 'video-embed-thumbnail-generator');

				}

				if ( $video_encode_queue[$video_key]['encode_formats'][$format]['status'] == "error" || $video_encode_queue[$video_key]['encode_formats'][$format]['status'] == "canceled" ) {

					$video_encode_queue[$video_key]['encode_formats'][$format]['lastline'] = addslashes($lastline);

					$embed_display = '<strong>'.__('Error:', 'video-embed-thumbnail-generator').' </strong><span class="kgvid_warning">'.stripslashes($lastline).'.</span>';

					if ( $video_encode_queue[$video_key]['encode_formats'][$format]['status'] == "error" ) {

						$options = kgvid_get_options();

						if ( ( $options['error_email'] != 'nobody'
								|| ( array_key_exists('network_error_email', $options) && $options['network_error_email'] != 'nobody' )
							)
							&& !array_key_exists('mailed', $video_encode_queue[$video_key]['encode_formats'][$format])
						) {
							$mailed = false;
							$blog_title = get_bloginfo();
							$admin_url = get_admin_url();
							$user = false;
							$super_user = false;

							if ( $options['error_email'] == 'encoder'
								|| ( array_key_exists('network_error_email', $options) && $options['network_error_email'] == 'encoder' )
							) {
								if ( !empty($video_encode_queue[$video_key]['user_id']) ) {
									$user = get_userdata( $video_encode_queue[$video_key]['user_id'] );
								}
							}
							elseif( is_numeric($options['error_email']) ) {
								$user = get_userdata($options['error_email']);
							}

							if ( array_key_exists('network_error_email', $options) && is_numeric($options['network_error_email']) ) {
								$super_user = get_userdata($options['network_error_email']);
							}

							$headers = array('Content-Type: text/html; charset=UTF-8');

							if ( $user instanceof WP_User ) {
								$mailed = wp_mail(
									$user->user_email,
									__('Video Encode Error', 'video-embed-thumbnail-generator'),
									sprintf( _x('Error message "%1$s" while encoding video file %2$s at %3$s', '1 is the error message, 2 is the filename, 3 is the website name.', 'video-embed-thumbnail-generator'), $video_encode_queue[$video_key]['encode_formats'][$format]['lastline'], basename($video_encode_queue[$video_key]['encode_formats'][$format]['filepath']), '<a href="'.$admin_url.'/tools.php?page=kgvid_video_encoding_queue">'.$blog_title.'</a>' ),
									$headers
								);
							}

							if ( $super_user instanceof WP_User && $super_user != $user ) {
								$network_info = get_current_site();
								$mailed = wp_mail(
									$super_user->user_email,
									__('Video Encode Error', 'video-embed-thumbnail-generator'),
									sprintf( _x('Error message "%1$s" while encoding video file %2$s at %3$s', '1 is the error message, 2 is the filename, 3 is the website name.', 'video-embed-thumbnail-generator'), $video_encode_queue[$video_key]['encode_formats'][$format]['lastline'], basename($video_encode_queue[$video_key]['encode_formats'][$format]['filepath']), '<a href="'.$admin_url.'/tools.php?page=kgvid_video_encoding_queue">'.$blog_title.'</a>' ).' '.sprintf( _x('on the %s network.', 'on the [name of multisite network] network.', 'video-embed-thumbnail-generator'), '<a href="'.network_admin_url("settings.php?page=kgvid_network_video_encoding_queue").'">'.$network_info->site_name.'</a>' ),
									$headers
								);
							}

							if ( $mailed ) { $video_encode_queue[$video_key]['encode_formats'][$format]['mailed'] = true; }
						}

					}

					kgvid_save_encode_queue($video_encode_queue);

					$next_video = kgvid_encode_videos(); //start the next queued video
					if ( !empty($next_video['format']) ) {
						$args = array($next_video['video_key'], $next_video['format'], $page);
						wp_schedule_single_event(time()+60, 'kgvid_cron_queue_check', $args);
					}
				}

			}//if not completed
			else { $embed_display = "<strong>".ucwords($video_encode_queue[$video_key]['encode_formats'][$format]['status'])."</strong>"; }
		} //if there's a queue and the video is encoding

		else { $embed_display = "<strong>".__('Waiting...', 'video-embed-thumbnail-generator')."</strong>"; }

		$arr = array ( 'embed_display' => $embed_display, 'time_to_wait' => $time_to_wait );

		if ( $blog_id ) { restore_current_blog(); }

		return $arr;

	}//end if queue entry exists

}
add_action('kgvid_cron_queue_check', 'kgvid_encode_progress', 10, 3);

function kgvid_ajax_encode_progress() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$video_key = $_POST['video_key'];
	$format = $_POST['format'];
	$page = $_POST['page'];
	$progress = kgvid_encode_progress($video_key, $format, $page);
	echo json_encode($progress);
	die();

}
add_action('wp_ajax_kgvid_encode_progress', 'kgvid_ajax_encode_progress');

function kgvid_replace_video( $video_key, $format ) {

	$options = kgvid_get_options();
	$video_encode_queue = kgvid_get_encode_queue();
	$video_formats = kgvid_video_formats();
	$encoded_filename = $video_encode_queue[$video_key]['encode_formats'][$format]['filepath'];
	$video_id = $video_encode_queue[$video_key]['attachmentID'];
	$replace = true;

	if ( !empty($video_encode_queue) ) {
		foreach ( $video_encode_queue[$video_key]['encode_formats'] as $encoding_format => $value ) { //make sure there isn't another encoding process using this original video
			if ( $value['status'] == "encoding" || $value['status'] == "queued" ) {
				$replace = false;
			}
		}//end loop
	}

	if ( $replace = false ) {
		wp_schedule_single_event(time()+60, 'kgvid_cron_replace_video_check', array($video_key, $format) );
		return $video_encode_queue[$video_key]['movieurl'];
	}
	else {

		$original_filename = get_attached_file($video_id);
		$path_parts = pathinfo($original_filename);

		if ( $path_parts['extension'] != $video_formats[$format]['extension'] ) {
			$new_filename = str_replace("-fullres", "", $encoded_filename);
			$sanitized_url = kgvid_sanitize_url($video_encode_queue[$video_key]['movieurl']);
			$new_url = $sanitized_url['noextension'].".".$video_formats[$format]['extension'];
			$video_encode_queue[$video_key]['movieurl'] = $new_url;
			global $wpdb;
			$query = $wpdb->prepare( "SELECT ID FROM $wpdb->posts WHERE `post_content` LIKE '%%%s%%'", $sanitized_url['basename'].".".$path_parts['extension'] ); //find posts that use the old filename
			$results = $wpdb->get_results($query);
			if ( $results ) {
				foreach ( $results as $result ) {
					$post = get_post($result->ID);
					$post->post_content = str_replace($sanitized_url['noextension'].".".$path_parts['extension'], $new_url, $post->post_content);
					wp_update_post($post);
				}
			}
		}
		else {
			if ( strpos($original_filename, 'http') !== false ) {  $original_filename = str_replace("-fullres", "", $encoded_filename); }
			$new_filename = $original_filename;
			$new_url = $video_encode_queue[$video_key]['movieurl'];
		}

		if ( file_exists($encoded_filename) ) {
			rename($encoded_filename, $new_filename);
			if ( file_exists($original_filename) && $original_filename != $new_filename ) { unlink($original_filename); }

			if ( get_post_mime_type($video_id) == 'image/gif' ) {
				$was_gif = true;
				$gif_metadata = wp_get_attachment_metadata($video_id);
				if ( array_key_exists( 'sizes', $gif_metadata) ) {
					$uploads = wp_upload_dir();
					foreach ( $gif_metadata['sizes'] as $size => $info ) {
						$size_filename = $uploads['path'].'/'.$info['file'];
						if ( file_exists($size_filename) ) { unlink($size_filename); }
					}
				}
			}
		}
		$video_encode_queue[$video_key]['encode_formats'][$format]['url'] = $new_url;


		if ( $video_encode_queue[$video_key]['movie_info']['rotate'] != "" ) { //if the video needed rotating
			$video_encode_queue[$video_key]['movie_info']['rotate'] = ""; //clear rotation because we've just fixed that problem
			$kgvid_postmeta = kgvid_get_attachment_meta($video_encode_queue[$video_key]['attachmentID']);
			$kgvid_postmeta['rotate'] = '';
			kgvid_save_attachment_meta($video_encode_queue[$video_key]['attachmentID'], $kgvid_postmeta);

			$setwidth = $video_encode_queue[$video_key]['movie_info']['width'];
			$setheight = $video_encode_queue[$video_key]['movie_info']['height'];
			if ( intval($setwidth) > intval($setheight) ) {  //swap the width and height meta if it hasn't already been done
				$kgvid_postmeta['actualwidth'] = $video_encode_queue[$video_key]['movie_info']['height'];
				$kgvid_postmeta['width'] = $setheight;
				$video_encode_queue[$video_key]['movie_info']['width'] = $video_encode_queue[$video_key]['movie_info']['height'];

				$kgvid_postmeta['actualheight'] = $video_encode_queue[$video_key]['movie_info']['width'];
				$kgvid_postmeta['height'] = $setwidth;
				$video_encode_queue[$video_key]['movie_info']['height'] = $video_encode_queue[$video_key]['movie_info']['width'];
			}

			kgvid_save_attachment_meta($video_encode_queue[$video_key]['attachmentID'], $kgvid_postmeta);
		}

		kgvid_save_encode_queue($video_encode_queue);

		// you must first include the image.php file
		// for the function wp_generate_attachment_metadata() to work and media.php for wp_read_video_metadata() in WP 3.6+
		require_once(ABSPATH . 'wp-admin/includes/image.php');
		global $wp_version;
		if ( $wp_version >= 3.6 ) { require_once(ABSPATH . 'wp-admin/includes/media.php'); }
		$attach_data = wp_generate_attachment_metadata( $video_id, $new_filename );
		wp_update_attachment_metadata( $video_id, $attach_data );
		update_attached_file( $video_id, $new_filename );

		$new_mime = wp_check_filetype( $new_filename );
		$post = get_post($video_id);
		$new_guid = str_replace( $path_parts['extension'], $new_mime['ext'], $post->guid );

		if ( $new_guid != $post->guid ) {
			$post->guid = $new_guid;
			global $wpdb;
			$guid_change = $wpdb->update( $wpdb->posts, //can't use wp_update_post because it won't change GUID
				array(
					'guid' => $new_guid
				),
				array( 'ID' => $video_id ),
				array( '%s', '%s' ),
				array( '%d' )
			);
			clean_post_cache( $video_id ); //otherwise wp_update_post will get the cached version of the post and the old GUID
		}

		$post_update = array('ID' => $video_id, 'post_mime_type' => $new_mime['type']);
		wp_update_post($post_update);

		$kgvid_postmeta = kgvid_get_attachment_meta($video_id);
		$kgvid_postmeta['original_replaced'] = $options['replace_format'];
		kgvid_save_attachment_meta($video_id, $kgvid_postmeta);

		if ( $options['auto_thumb'] == 'on' && isset($was_gif) ) { kgvid_cron_new_attachment_handler($video_id, 'thumbs'); }

		return $new_url;

	}//end replace true

}
add_action('kgvid_cron_replace_video_check', 'kgvid_replace_video', 10, 2);

function kgvid_clear_completed_queue($type, $scope = 'site') {

	global $user_ID;

	$video_encode_queue = kgvid_get_encode_queue();

	if ( !empty($video_encode_queue) ) {

		$keep = array();
		$cleared_video_queue = array();

		foreach ( $video_encode_queue as $video_key => $queue_entry ) {
			if ( !empty($queue_entry['encode_formats']) ) {
				foreach ( $queue_entry['encode_formats'] as $format => $value ) {
					if ( $value['status'] == "encoding" ) { //if it's not completed yet
						if ( $type != "all" ) { $keep[$video_key] = true; }
						elseif ( (is_network_admin() && $scope == 'network')
							|| (array_key_exists('blog_id', $queue_entry) && $queue_entry['blog_id'] == get_current_blog_id())
						) {
							if ( array_key_exists( 'PID', $value ) && intval($value['PID']) > 0 ) {
								posix_kill($value['PID'], 15);
							}
							if ( array_key_exists( 'filepath', $value ) && file_exists($value['filepath']) ) {
								unlink($value['filepath']);
							}
						}
						else { $keep[$video_key] = true; }
					}
					if ( ($type == "manual" && $value['status'] == "queued")
						|| ($type == "queued" && $value['status'] == "Encoding Complete")
					) {
						$keep[$video_key] = true;
					}
					if ( $type == "scheduled" && $value['status'] == "Encoding Complete" ) {
						if ( time() - intval($value['ended']) < 604800 ) { //if it finished less than a week ago
							$keep[$video_key] = true;
						}
					}
					if ( ( $scope == 'site' && array_key_exists('blog_id', $queue_entry) && $queue_entry['blog_id'] != get_current_blog_id() )
						|| ( !current_user_can('edit_others_video_encodes') && $user_ID != $queue_entry['user_id'] )
						|| !current_user_can('encode_videos')
						|| ( $scope != 'site' && !current_user_can('manage_network') )
					) { //only clear entries from current blog
						$keep[$video_key] = true;
						break;
					}
				}
			}
		}

		foreach ( $keep as $video_key => $value ) {
			$cleared_video_queue[] = $video_encode_queue[$video_key];
		}
		$cleared_video_queue = array_merge($cleared_video_queue);

		kgvid_save_encode_queue($cleared_video_queue);

	}
}
add_action('kgvid_cleanup_queue','kgvid_clear_completed_queue');

function kgvid_ajax_clear_completed_queue() {

	if ( current_user_can('encode_videos') ) {
		check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
		$scope = $_POST['scope'];
		$type = $_POST['type'];
		kgvid_clear_completed_queue($type, $scope);
		$table = kgvid_generate_queue_table($scope);
		echo ($table);
		die();
	}

}
add_action('wp_ajax_kgvid_clear_completed_queue', 'kgvid_ajax_clear_completed_queue');

function kgvid_ajax_clear_queue_entry() {

	if ( current_user_can('encode_videos') ) {
		check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
		$video_key = $_POST['index'];
		$scope = $_POST['scope'];
		$video_encode_queue = kgvid_get_encode_queue();
		if ( is_array($video_encode_queue) && array_key_exists($video_key, $video_encode_queue) ) {
			unset($video_encode_queue[$video_key]);
			$video_encode_queue = array_merge($video_encode_queue);
		}
		kgvid_save_encode_queue($video_encode_queue);

		$table = kgvid_generate_queue_table($scope);
		echo ($table);
		die();
	}

}
add_action('wp_ajax_kgvid_clear_queue_entry', 'kgvid_ajax_clear_queue_entry');

function kgvid_cleanup_queue_handler() {
	kgvid_clear_completed_queue('scheduled');
}
add_action('kgvid_cleanup_queue', 'kgvid_cleanup_queue_handler');

function kgvid_fix_moov_atom($filepath) {

	$options = kgvid_get_options();
	$output = "";

	if ( $options['moov'] == "qt-faststart" || $options['moov'] == "MP4Box" ) {

		$output = "\n".__('Fixing moov atom for streaming', 'video-embed-thumbnail-generator');

		if ( !empty($options['moov_path']) ) { $options['app_path'] = $options['moov_path']; }

		if ( $options['moov'] == 'qt-faststart' && file_exists($filepath) ) {
			$faststart_tmp_file = str_replace('.mp4', '-faststart.mp4', $filepath);
			$cmd = escapeshellcmd($options['app_path']."/".$options['moov']." ".$filepath." ".$faststart_tmp_file)." 2>&1";
			$output .= "\n".$cmd."\n";
			exec($cmd, $qtfaststart_output, $returnvalue);
			$output .= implode("\n", $qtfaststart_output);
			if ( file_exists($faststart_tmp_file) ) {
				unlink($filepath);
				rename($faststart_tmp_file, $filepath);
			}
		}//if qt-faststart is selected

		if ( $options['moov'] == 'MP4Box' ) {
			$cmd = escapeshellcmd($options['app_path']."/".$options['moov']." -inter 500 ".$filepath)." 2>&1";
			$output .= "\n".$cmd."\n";
			exec($cmd, $mp4box_output, $returnvalue);
			$output .= implode("\n", $mp4box_output);
		}//if MP4Box is selected

	}//if there is an application selected for fixing moov atoms on libx264-encoded files.

	return $output;

}

function kgvid_cancel_encode() {

	if ( current_user_can('encode_videos') ) {
		check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

		if (isset($_POST['kgvid_pid'])) {
			$kgvid_pid = $_POST['kgvid_pid'];
			if ( intval($kgvid_pid) > 0 ) {
				posix_kill($kgvid_pid, 15);
			}
			$video_key = $_POST['video_key'];
			$format = $_POST['format'];
			$video_encode_queue = kgvid_get_encode_queue();
			$video_encode_queue[$video_key]['encode_formats'][$format]['status'] = "canceling";
			kgvid_save_encode_queue($video_encode_queue);
		}
		die(); // this is required to return a proper result
	}

}
add_action('wp_ajax_kgvid_cancel_encode', 'kgvid_cancel_encode');

function kgvid_ajax_delete_video() {

	if ( current_user_can('encode_videos') ) {
		check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
		$deleted = false;
		$attachment_id = "";
		if ( isset($_POST['movieurl']) ) { $movieurl = $_POST['movieurl']; }
		if ( isset($_POST['postid']) ) { $post_id = $_POST['postid']; }
		if ( isset($_POST['format']) ) { $format = $_POST['format']; }
		if ( isset($_POST['childid']) ) { $attachment_id = $_POST['childid']; }
		if ( isset($_POST['blogid']) ) { $blog_id = $_POST['blogid']; }
		else { $blog_id = false; }

		if ( empty($attachment_id) ) { //if there's no post_meta giving us the attachment to delete
			$encodevideo_info = kgvid_encodevideo_info($movieurl, $post_id);
			if ( is_file($encodevideo_info[$format]['filepath']) ) {
					$deleted = unlink($encodevideo_info[$format]['filepath']);
			}
		}
		else {
			if ( $blog_id ) { switch_to_blog($blog_id); }
			$deleted = wp_delete_attachment($attachment_id);
			if ( !empty($deleted) ) { $deleted = true; }
			if ( $blog_id ) { restore_current_blog(); }
		}
		echo($deleted);
		die();
	}

}
add_action('wp_ajax_kgvid_delete_video', 'kgvid_ajax_delete_video');

function kgvid_delete_video_attachment($video_id) {

	if ( strpos(get_post_mime_type( $video_id ), 'video') !== false ) { //only do this for videos
		$parent_post = get_post($video_id);
		$options = kgvid_get_options();
		$video_encode_queue = kgvid_get_encode_queue();
		$parent_id = get_post($video_id)->post_parent;
		$wp_attached_file = get_post_meta($video_id, '_wp_attached_file', true);

		if ( !empty($video_encode_queue) ) { //remove any encode queue entry related to this attachment
			foreach ($video_encode_queue as $video_key => $video_entry) {
				if ( $video_entry['attachmentID'] == $video_id ) {

					foreach ( $video_entry['encode_formats'] as $format => $value ) {
						if ( $value['status'] == "encoding" ) {
							if ( intval($value['PID']) > 0 ) { posix_kill($value['PID'], 15); }
							if ( file_exists($value['filepath']) ) { unlink($value['filepath']); }
						}
					}

					unset($video_encode_queue[$video_key]);
					sort($video_encode_queue);
					kgvid_save_encode_queue($video_encode_queue);
					break;
				}//if the video is an original format
				if ( $video_entry['attachmentID'] == $parent_id || get_post_meta($video_id, '_kgflashmediaplayer-externalurl', true) == $video_entry['movieurl'] ) {
					foreach ( $video_entry['encode_formats'] as $format => $value ) {
						if ( array_key_exists('filepath', $value) ) {
							if ( strpos($value['filepath'], $wp_attached_file) !== false ) {
								$video_encode_queue[$video_key]['encode_formats'][$format]['status'] = "deleted";
								kgvid_save_encode_queue($video_encode_queue);
								break;
							}//if the format has filepath information
						}//if the encoded child format is in the database
					}//loop through formats
				}//if the video is a child format
			}
		}

		$args = array(
			'post_parent' => $video_id,
			'post_type' => 'attachment',
			'numberposts' => '-1'
		);
		$posts = get_posts( $args ); //find all children of the video in the database
		if ($posts) {
			$formats = array();
			foreach ($posts as $post) {
				wp_update_post( array( 'ID' => $post->ID, 'post_parent' => $parent_id ) ); //set post_parent field to the original video's post_parent
				if ( $options['delete_children'] != 'none' ) {
					if ( $options['delete_children'] == 'all' ) { wp_delete_attachment($post->ID, true); }
					else if ( strpos($post->post_mime_type, 'video') !== false ) { wp_delete_attachment($post->ID, true); } //only delete videos
				}
				else {
					if ( strpos($post->post_mime_type, 'video') !== false ) {
						$format = get_post_meta($post->ID, '_kgflashmediaplayer-format', true);
						if ( $format ) { $formats[$format] = $post->ID; }
					}
				}
			}//end loop
			if ( $options['delete_children'] == 'none' ) { //find a child to be the new master video
				$video_formats = kgvid_video_formats();
				foreach ( $video_formats as $format => $format_stats ) {
					if ( array_key_exists($format, $formats) ) {
						$new_master = $formats[$format];
						unset($formats[$format]);
						delete_post_meta($new_master, '_kgflashmediaplayer-format'); //master videos don't have the child format meta info
						wp_update_post( array( 'ID' => $new_master, 'post_title' => get_the_title($video_id) ) ); //set the new master's title to the old master's title
						foreach ( $formats as $child_id ) {
							wp_update_post( array( 'ID' => $child_id, 'post_parent' => $new_master ) ); //set all the other children as the new master's child
						}
						break; //stop after the highest quality format;
					}
				}
			}
		}//end if there are any children
    }//end if video

	elseif ( strpos(get_post_mime_type( $video_id ), 'image') !== false ) {
		$args = array(
			'numberposts' => '-1',
			'post_type' => 'attachment',
			'meta_key' => '_kgflashmediaplayer-poster-id',
			'meta_value' => $video_id
		);
		$posts = get_posts( $args ); //find all posts that have this thumbnail ID in their meta
		if ( $posts ) {
			foreach ($posts as $post) {
				delete_post_meta($post->ID, '_kgflashmediaplayer-poster-id');
				delete_post_meta($post->ID, '_thumbnail-id');
				delete_post_meta($post->ID, '_kgflashmediaplayer-poster');
			}
		}
	}
}
add_action('delete_attachment', 'kgvid_delete_video_attachment');

function kgvid_get_set_featured() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	$args = array(
		'post_type' => null,
		'numberposts' => -1,
		'meta_key' => '_kgflashmediaplayer-poster-id'
	);
	$videoposts = get_posts( $args );

	if ( $videoposts ) {
		foreach ($videoposts as $post) {
			if ( $post->post_type == "attachment" ) { $post_id = $post->post_parent; }
			else { $post_id = $post->ID; }
			$poster_id = get_post_meta($post->ID, "_kgflashmediaplayer-poster-id", true);
			if ( !empty($post_id) && !empty($poster_id) ) { $posts[$post_id] = $poster_id; }
		}//end loop
	}//end if posts

	$cms_switch_queue = get_option('kgvid_video_embed_cms_switch');
	$cms_switch_queue['set_featured'] = $posts;
	update_option('kgvid_video_embed_cms_switch', $cms_switch_queue);
	echo count($posts);
	die;
}
add_action('wp_ajax_kgvid_get_set_featured', 'kgvid_get_set_featured');

function kgvid_set_featured() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$queue = get_option('kgvid_video_embed_cms_switch');
	if ( $queue['set_featured'] ) {
		foreach ( $queue['set_featured'] as $post_id => $poster_id ) {
			set_post_thumbnail($post_id, $poster_id);
			unset($queue['switching_parents'][$post_id]);
			update_option('kgvid_video_embed_cms_switch', $queue);
		}
		unset($queue['set_featured']);
		if ( empty($queue) ) { delete_option('kgvid_video_embed_cms_switch'); }
		else { update_option('kgvid_video_embed_cms_switch', $queue); }
	}
	die;
}
add_action('wp_ajax_kgvid_set_featured', 'kgvid_set_featured');

function kgvid_get_switch_parents() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$new_parent = 'post';
	if (isset($_POST['parent'])) { $new_parent = $_POST['parent']; }
	$children = array();

	if ( $new_parent == 'post' ) {

		$args = array(
			'orderby' => 'post_date',
			'order' => 'ASC',
			'post_type' => 'attachment',
			'numberposts' => -1,
			'post_mime_type' => 'video'
		);
		$attachments = get_posts( $args );

		if ( $attachments ) {
			foreach ( $attachments as $post ) {
				if ( !empty($post->post_parent) ) { //if the video is attached to a post
					$args = array(
						'orderby' => 'post_date',
						'order' => 'ASC',
						'post_parent' => $post->ID,
						'post_type' => 'attachment',
						'post_mime_type' => 'image',
						'numberposts' => -1
					);
					$thumbnails = get_posts( $args );
					if ( $thumbnails ) {
						foreach ( $thumbnails as $thumbnail ) {
							$children[$thumbnail->ID] = array( 'post_parent' => $post->post_parent, 'video_id' => $post->ID );
						}
					}//end if there are children
				}//end if it has a parent
			}//end loop
		}//end if posts
	}//end if new parent is post

	if ( $new_parent == 'video' ) {

		$args = array(
			'orderby' => 'post_date',
			'order' => 'ASC',
			'post_type' => 'attachment',
			'post_mime_type' => 'image',
			'meta_key' => '_kgflashmediaplayer-video-id',
			'numberposts' => -1
		);
		$thumbnails = get_posts( $args );

		if ( $thumbnails ) {
			foreach ($thumbnails as $thumbnail) {
				$video_id = get_post_meta($thumbnail->ID, '_kgflashmediaplayer-video-id', true);
				$children[$thumbnail->ID] = array( 'post_parent' => false, 'video_id' => $video_id );
			}
		}
	}
	$cms_switch_queue = get_option('kgvid_video_embed_cms_switch');
	$cms_switch_queue['switching_parents'] = $children;
	update_option('kgvid_video_embed_cms_switch', $cms_switch_queue);
	echo count($children);
	die;
}
add_action('wp_ajax_kgvid_get_switch_parents', 'kgvid_get_switch_parents');

function kgvid_switch_parents() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$queue = get_option('kgvid_video_embed_cms_switch');
	if ( is_array($queue) && array_key_exists('switching_parents', $queue) && $queue['switching_parents'] ) {
		$new_parent = 'post';
		if (isset($_POST['parent'])) { $new_parent = $_POST['parent']; }
		if ( is_array($queue) && array_key_exists('switching_parents', $queue) && is_array($queue['switching_parents']) ) {
			foreach ( $queue['switching_parents'] as $thumbnail_id => $thumbnail ) {
				if ( $new_parent == 'post' ) {
					wp_update_post( array( 'ID' => $thumbnail_id, 'post_parent' => $thumbnail['post_parent'] ) );
					update_post_meta($thumbnail_id, '_kgflashmediaplayer-video-id', $thumbnail['video_id']);
				}

				if ( $new_parent == 'video' ) {
					wp_update_post( array( 'ID' => $thumbnail_id, 'post_parent' => $thumbnail['video_id'] ) );
				}
				unset($queue['switching_parents'][$thumbnail_id]);
				update_option('kgvid_video_embed_cms_switch', $queue);
			}
			unset($queue['switching_parents']);
		}
		if ( empty($queue) ) { delete_option('kgvid_video_embed_cms_switch'); }
		else { update_option('kgvid_video_embed_cms_switch', $queue); }
	}
	die;
}
add_action('wp_ajax_kgvid_switch_parents', 'kgvid_switch_parents');


function kgvid_get_generating_old() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if (isset($_POST['type'])) { $type = $_POST['type']; }
	$attachments = array();

	if ( $type == 'thumbs' ) {

		$args = array(
			'orderby' => 'post_date',
			'order' => 'ASC',
			'post_type' => 'attachment',
			'post_mime_type' => 'video',
			'meta_query' => array(
				'relation' => 'OR',
				array(
					'key' => '_kgflashmediaplayer-poster',
					'value' => ''
				),
				array(
					'key' => '_kgflashmediaplayer-poster',
					'compare' => 'NOT EXISTS',
					'value' => 'completely'
				)
			),
			'numberposts' => -1
		);

	}

	if ( $type == 'encode' ) {

		$args = array(
			'orderby' => 'post_date',
			'order' => 'ASC',
			'post_type' => 'attachment',
			'post_mime_type' => 'video',
			'numberposts' => -1
		);

	}

	$videos = get_posts( $args );

	if ( $videos ) {
		foreach ($videos as $video) {
			$is_child_format = get_post_meta($video->ID, '_kgflashmediaplayer-format', true); //check if video is a child format
			if ( !$is_child_format ) {
				$attachments[] = $video->ID;
			}
		}
	}

	if ( $attachments ) {
		$cms_switch_queue = get_option('kgvid_video_embed_cms_switch');
		$cms_switch_queue['generating_old_'.$type] = $attachments;
		update_option('kgvid_video_embed_cms_switch', $cms_switch_queue);
	}
	echo count($attachments);
	die;
}
add_action('wp_ajax_kgvid_get_generating_old', 'kgvid_get_generating_old');

function kgvid_generating_old() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	if (isset($_POST['type'])) { $type = $_POST['type']; }
	$queue = get_option('kgvid_video_embed_cms_switch');
	if ( is_array($queue) && array_key_exists('generating_old_'.$type, $queue) && is_array($queue['generating_old_'.$type]) ) {

		foreach ( $queue['generating_old_'.$type] as $video_id ) {

			kgvid_cron_new_attachment_handler($video_id, $type);

			unset($queue['generating_old_'.$type][$video_id]);
			update_option('kgvid_video_embed_cms_switch', $queue);
		}
		unset($queue['generating_old_'.$type]);
		if ( empty($queue) ) { delete_option('kgvid_video_embed_cms_switch'); }
		else { update_option('kgvid_video_embed_cms_switch', $queue); }
	}
	die;
}
add_action('wp_ajax_kgvid_generating_old', 'kgvid_generating_old');

function kgvid_update_cms_progress() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$remaining = 0;
	if (isset($_POST['cms_type'])) { $type = $_POST['cms_type']; }
	if (isset($_POST['total'])) { $total = $_POST['total']; }
	$queue = get_option('kgvid_video_embed_cms_switch');
	if ( is_array($queue) && array_key_exists($type, $queue) ) {
		$remaining = count($queue[$type]);
	}
	echo $remaining;
	die;

}
add_action('wp_ajax_kgvid_update_cms_progress', 'kgvid_update_cms_progress');

function kgvid_count_play() {

	check_ajax_referer( 'kgvid_frontend_nonce', 'security' );

	$post_id = $_POST['post_id'];
	$event = $_POST['video_event'];
	if ( $event == "play" ) { $event = "starts"; }
	if ( $event == "end" ) { $event = "completeviews"; }
	$kgvid_postmeta = kgvid_get_attachment_meta($post_id);
	$plays = $kgvid_postmeta[$event];
	if ( !empty($plays) ) { $plays = intval($plays)+1; }
	else { $plays = 1; }
	$kgvid_postmeta[$event] = $plays;
	kgvid_save_attachment_meta($post_id, $kgvid_postmeta);
	echo number_format(intval($plays));
	die(); // stop executing script

}
add_action( 'wp_ajax_kgvid_count_play', 'kgvid_count_play' ); // ajax for logged in users
add_action( 'wp_ajax_nopriv_kgvid_count_play', 'kgvid_count_play' ); // ajax for not logged in users

function kgvid_add_contextual_help_tab() {

	$false_code = '<code>"false"</code>';

	get_current_screen()->add_help_tab( array(
        'id'        => 'kgvid-help-tab',
        'title'     => __( 'Video Embed & Thumbnail Generator Shortcode Reference' , 'video-embed-thumbnail-generator'),
        'content'   => '<p><strong>'.__('Use these optional attributes in the [KGVID] shortcode:', 'video-embed-thumbnail-generator').'</strong></p>
<ul><li><code>id="xxx"</code> '.__('video attachment ID (instead of using a URL).', 'video-embed-thumbnail-generator').'</li>
<li><code>videos="x"</code> '.__('number of attached videos to display if no URL or ID is given.', 'video-embed-thumbnail-generator').'</li>
<li><code>orderby="menu_order/title/post_date/rand/ID"</code> '.__('criteria for sorting attached videos if no URL or ID is given.', 'video-embed-thumbnail-generator').'</li>
<li><code>order="ASC/DESC"</code> '.__('sort order.', 'video-embed-thumbnail-generator').'</li>
<li><code>poster="http://www.example.com/image.jpg"</code> '.__('sets the thumbnail.', 'video-embed-thumbnail-generator').'</li>
<li><code>endofvideooverlay="http://www.example.com/end_image.jpg</code> '.__('sets the image shown when the video ends.', 'video-embed-thumbnail-generator').'</li>
<li><code>width="xxx"</code></li>
<li><code>height="xxx"</code></li>
<li><code>fullwidth="true/false"</code> '.__('set video to always expand to fill its container.', 'video-embed-thumbnail-generator').'</li>
<li><code>align="left/right/center"</code></li>
<li><code>inline="true/false"</code> '.__('allow other content on the same line as the video', 'video-embed-thumbnail-generator').'</li>
<li><code>volume="0.x"</code> '.__('pre-sets the volume for unusually loud videos. Value between 0 and 1.', 'video-embed-thumbnail-generator').'</li>
<li><code>mute="true/false"</code> '.__('sets the mute button on or off.', 'video-embed-thumbnail-generator').'</li>
<li><code>controlbar="docked/floating/none"</code> '.__('sets the controlbar position. "Floating" option only works with Strobe Media Playback.', 'video-embed-thumbnail-generator').'</li>
<li><code>loop="true/false"</code></li>
<li><code>autoplay="true/false"</code></li>
<li><code>watermark="http://www.example.com/image.png"</code> '.sprintf( __('or %s to disable.', 'video-embed-thumbnail-generator'), $false_code ).'</li>
<li><code>watermark_link_to=home/parent/attachment/download/false"</code></li>
<li><code>watermark_url="http://www.example.com/"</code> '.sprintf( __('or %s to disable. If this is set, it will override the watermark_link_to setting.', 'video-embed-thumbnail-generator'), $false_code ).'</li>
<li><code>title="Video Title"</code> '.sprintf( __('or %s to disable.', 'video-embed-thumbnail-generator'), $false_code ).'</li>
<li><code>embedcode="html code"</code> '.sprintf( __('changes text displayed in the embed code overlay in order to provide a custom method for embedding a video or %s to disable.', 'video-embed-thumbnail-generator'), $false_code ).'</li>
<li><code>view_count="true/false"</code> '.__('turns the view count on or off.', 'video-embed-thumbnail-generator').'</li>
<li><code>caption="Caption"</code> '.__('text that is displayed below the video (not subtitles or closed captioning)', 'video-embed-thumbnail-generator').'</li>
<li><code>description="Description"</code> '.__('Used for metadata only.', 'video-embed-thumbnail-generator').'</li>
<li><code>downloadlink="true/false"</code> '.__('generates a link below the video to make it easier for users to save the video file to their computers.', 'video-embed-thumbnail-generator').'</li>
<li><code>right_click="true/false"</code> '.__('allow or disable right-clicking on the video player.', 'video-embed-thumbnail-generator').'</li>
<li><code>resize="true/false"</code> '.__('allow or disable responsive resizing.', 'video-embed-thumbnail-generator').'</li>
<li><code>auto_res="automatic/highest/lowest/1080p/720p/360p/custom"</code> '.__('specify the video resolution when the page loads.', 'video-embed-thumbnail-generator').'</li>
<li><code>pixel_ratio="true/false"</code> '.__('account for high-density (retina) displays when choosing automatic video resolution.', 'video-embed-thumbnail-generator').'</li>
<li><code>schema="true/false"</code> '.__('allow or disable Schema.org search engine metadata.', 'video-embed-thumbnail-generator').'</li></ul>

<p><strong>'.__('These options will add a subtitle/caption track.', 'video-embed-thumbnail-generator').'</strong></p>
<ul><li><code>track_src="http://www.example.com/subtitles.vtt_.txt"</code> '.__('URL of the WebVTT file.', 'video-embed-thumbnail-generator').'</li>
<li><code>track_kind=subtitles/captions/chapters</code></li>
<li><code>track_srclang=xx</code> '.__('the track\'s two-character language code (en, fr, es, etc)', 'video-embed-thumbnail-generator').'</li>
<li><code>track_label="Track Label"</code> '.__('text that will be shown to the user when selecting the track.', 'video-embed-thumbnail-generator').'</li>
<li><code>track_default="default"</code> '.__('track is enabled by default.', 'video-embed-thumbnail-generator').'</li></ul>

<p><strong>'.__('These options will only affect Video.js playback', 'video-embed-thumbnail-generator').'</strong></p>
<ul><li><code>skin="example-css-class"</code> '.sprintf( __('Completely change the look of the video player. %sInstructions here.', 'video-embed-thumbnail-generator'), '<a href="https://github.com/zencoder/video-js/blob/master/docs/skins.md">' ).'</a></li>
<li><code>nativecontrolsfortouch="true/false"</code> '.__('enables or disables native controls on touchscreen devices.', 'video-embed-thumbnail-generator').'</li>
</ul>

<p><strong>'.__('These options will only affect Flash playback in Strobe Media Playback video elements. They will have no effect on other players.', 'video-embed-thumbnail-generator').'</p></strong>
<ul><li><code>autohide="true/false"</code> '.__('specify whether to autohide the control bar after a few seconds.', 'video-embed-thumbnail-generator').'</li>
<li><code>playbutton="true/false"</code> '.__('turns the big play button overlay in the middle of the video on or off.', 'video-embed-thumbnail-generator').'</li>
<li><code>streamtype="live/recorded/DVR"</code> '.__('I honestly don\'t know what this is for.', 'video-embed-thumbnail-generator').'</li>
<li><code>scalemode="letterbox/none/stretch/zoom"</code> '.__('If the video display size isn\'t the same as the video file, this determines how the video will be scaled.', 'video-embed-thumbnail-generator').'</li>
<li><code>backgroundcolor="'.__('#rrggbb', 'video-embed-thumbnail-generator').'"</code> '.__('set the background color to whatever hex code you want.', 'video-embed-thumbnail-generator').'</li>
<li><code>configuration="http://www.example.com/config.xml"</code> '.__('Lets you specify all these flashvars in an XML file.', 'video-embed-thumbnail-generator').'</li>
<li><code>skin="http://www.example.com/skin.xml"</code> '.sprintf( __('Completely change the look of the video player. %sInstructions here.', 'video-embed-thumbnail-generator'), '<a href="http://www.longtailvideo.com/support/jw-player/jw-player-for-flash-v5/14/building-skins">' ).'</a></li></ul>

<p><strong>'.__('These options are available for video galleries (options work the same as standard WordPress image galleries)', 'video-embed-thumbnail-generator').'</p></strong>
<ul><li><code>gallery="true"</code> '.__('turns on the gallery', 'video-embed-thumbnail-generator').'</li>
<li><code>gallery_thumb="xxx"</code> '.__('width in pixels to display gallery thumbnails', 'video-embed-thumbnail-generator').'</li>
<li><code>gallery_exclude="15"</code> '.__('comma separated video attachment IDs. Excludes the videos from the gallery.', 'video-embed-thumbnail-generator').'</li>
<li><code>gallery_include="65"</code> '.__('comma separated video attachment IDs. Includes only these videos in the gallery. Please note that include and exclude cannot be used together.', 'video-embed-thumbnail-generator').'</li>
<li><code>gallery_orderby="menu_order/title/post_date/rand/ID"</code> '.__('criteria for sorting the gallery', 'video-embed-thumbnail-generator').'</li>
<li><code>gallery_order="ASC/DESC"</code> '.__('sort order', 'video-embed-thumbnail-generator').'</li>
<li><code>gallery_id="241"</code> '.__('post ID to display a gallery made up of videos associated with a different post.', 'video-embed-thumbnail-generator').'</li>
<li><code>gallery_end="close/next"</code> '.__('either close the pop-up or start playing the next video when the current video finishes playing.', 'video-embed-thumbnail-generator').'</li>
<li><code>gallery_per_page="xx"</code> '.sprintf( __('or %s to disable pagination. Number of video thumbnails to show on each gallery page.', 'video-embed-thumbnail-generator'), $false_code).'</li>
<li><code>gallery_title="true/false"</code> '.__('display the title overlay on gallery thumbnails.', 'video-embed-thumbnail-generator').'</li></ul>'
    ) );

}
add_action( 'admin_head-post.php', 'kgvid_add_contextual_help_tab' );
add_action( 'admin_head-post-new.php', 'kgvid_add_contextual_help_tab' );

function kgvid_save_post($post_id) {

	$options = kgvid_get_options();

	if ( $options['open_graph'] == "on" ) {
		//render the post when it's saved in case there's a do_shortcode call in it so open graph metadata makes it into wp_head()
		$response = wp_remote_get( get_permalink($post_id), array('blocking' => false) );
	}

}
add_action( 'save_post', 'kgvid_save_post' );

function kgvid_clear_first_embedded_video_meta() {

	global $kgvid_video_id;
	global $post;

	if ( $kgvid_video_id == null && $post ) {
		$first_embedded_video_meta = get_post_meta($post->ID, '_kgvid_first_embedded_video', true);
		if ( !empty($first_embedded_video_meta) ) {
			delete_post_meta($post->ID, '_kgvid_first_embedded_video');
		}
	}
}
add_action( 'wp_footer', 'kgvid_clear_first_embedded_video_meta', 12 );

function kgvid_clear_cron_and_roles() {

	$options = kgvid_default_options_fn();
	wp_clear_scheduled_hook('kgvid_cleanup_queue', array( 'scheduled' ) );
	wp_clear_scheduled_hook('kgvid_cleanup_generated_thumbnails');
	kgvid_cleanup_generated_thumbnails_handler(); //run this now because cron won't do it later
	global $wp_roles;
	if ( is_object($wp_roles) && property_exists($wp_roles, 'roles') ) {
		foreach ( $options['capabilities'] as $capability => $roles ) {
			foreach ( $wp_roles->roles as $role => $role_info ) {
				$wp_roles->remove_cap( $role, $capability );
			}
		}
	}
}

function kgvid_deactivate_plugin( $network_wide ) {

	if ( is_multisite() && $network_wide ) {

		$current_blog_id = get_current_blog_id();
		$sites = wp_get_sites();

		if ( is_array($sites) ) {

			foreach ( $sites as $site ) {

				switch_to_blog($site['blog_id']);
				kgvid_clear_cron_and_roles();

			}//end loop through sites

			switch_to_blog($current_blog_id);

		}//end if there are sites

	}//end if network activated

	else { //if not network activated
		kgvid_clear_cron_and_roles();
	}
}
register_deactivation_hook( __FILE__, 'kgvid_deactivate_plugin' );

?>
