<?php

/**
 * The public AJAX specific functionality of the Videopack plugin.
 *
 * @link       https://www.videopack.video
 *
 * @package    Videopack
 * @subpackage Plugin_Name/public
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */

function kgvid_switch_gallery_page() {

	check_ajax_referer( 'kgvid_frontend_nonce', 'security' );

	if ( isset($_POST['page']) ) { $page_number = kgvid_sanitize_text_field($_POST['page']); }
	else { $page_number = 1; }
	$query_atts = kgvid_sanitize_text_field($_POST['query_atts']);
	$last_video_id = kgvid_sanitize_text_field($_POST['last_video_id']);
	$code = kgvid_gallery_page($page_number, $query_atts, $last_video_id);
	wp_send_json($code);

}
add_action( 'wp_ajax_kgvid_switch_gallery_page', 'kgvid_switch_gallery_page' ); // ajax for logged in users
add_action( 'wp_ajax_nopriv_kgvid_switch_gallery_page', 'kgvid_switch_gallery_page' ); // ajax for not logged in users

function kgvid_count_play() {

	check_ajax_referer( 'kgvid_frontend_nonce', 'security' );

	$post_id = kgvid_sanitize_text_field($_POST['post_id']);
	$event = kgvid_sanitize_text_field($_POST['video_event']);
	$show_views = kgvid_sanitize_text_field($_POST['show_views']);

	if ( $event == "play" ) { $event = "starts"; }
	if ( $event == "end" ) { $event = "completeviews"; }
	if ( is_numeric($event) ) { $event = "play_".$event; }

	$kgvid_postmeta = kgvid_get_attachment_meta($post_id);
	$plays = $kgvid_postmeta[$event];
	if ( !empty($plays) ) { $plays = intval($plays)+1; }
	else { $plays = 1; }
	$kgvid_postmeta[$event] = $plays;
	kgvid_save_attachment_meta($post_id, $kgvid_postmeta);

	if ( $show_views > 0 ) { //only return number of views if they are displayed on the site
		echo esc_html( sprintf( _n( '%s view', '%s views', $plays, 'video-embed-thumbnail-generator'), number_format($plays) ) );
	}
	else { echo ' '; }

	die(); // stop executing script

}
add_action( 'wp_ajax_kgvid_count_play', 'kgvid_count_play' ); // ajax for logged in users
add_action( 'wp_ajax_nopriv_kgvid_count_play', 'kgvid_count_play' ); // ajax for not logged in users
