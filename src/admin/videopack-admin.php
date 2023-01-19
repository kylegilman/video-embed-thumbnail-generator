<?php
/**
 * The admin specific functionality of the Videopack plugin.
 *
 * @link       https://www.videopack.video
 *
 * @package    Videopack
 * @subpackage Videopack/admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */

function kgvid_default_options_fn() {

	$upload_capable      = kgvid_check_if_capable( 'upload_files' );
	$edit_others_capable = kgvid_check_if_capable( 'edit_others_posts' );

	$options = array(
		'version'                 => '4.8.3',
		'videojs_version'         => '7.20.3',
		'embed_method'            => 'Video.js v7',
		'template'                => false,
		'template_gentle'         => 'on',
		'replace_format'          => 'fullres',
		'custom_format'           => array(
			'format' => 'h264',
			'width'  => '',
			'height' => '',
		),
		'hide_video_formats'      => 'on',
		'app_path'                => '/usr/local/bin',
		'video_app'               => 'ffmpeg',
		'ffmpeg_exists'           => 'notchecked',
		'video_bitrate_flag'      => false,
		'ffmpeg_vpre'             => false,
		'ffmpeg_old_rotation'     => false,
		'ffmpeg_auto_rotate'      => 'on',
		'nostdin'                 => false,
		'moov'                    => 'movflag',
		'generate_thumbs'         => 4,
		'featured'                => 'on',
		'thumb_parent'            => 'video',
		'delete_children'         => 'encoded videos only',
		'titlecode'               => '<strong>',
		'poster'                  => '',
		'watermark'               => '',
		'watermark_link_to'       => 'home',
		'watermark_url'           => '',
		'overlay_title'           => 'on',
		'overlay_embedcode'       => false,
		'twitter_button'          => false,
		'twitter_username'        => kgvid_get_jetpack_twitter_username(),
		'facebook_button'         => false,
		'downloadlink'            => false,
		'click_download'          => 'on',
		'view_count'              => false,
		'count_views'             => 'start_complete',
		'embeddable'              => 'on',
		'inline'                  => false,
		'align'                   => 'left',
		'width'                   => '640',
		'height'                  => '360',
		'minimum_width'           => false,
		'fullwidth'               => 'on',
		'fixed_aspect'            => 'vertical',
		'gallery_width'           => '960',
		'gallery_thumb'           => '250',
		'gallery_thumb_aspect'    => 'on',
		'gallery_end'             => '',
		'gallery_pagination'      => false,
		'gallery_per_page'        => false,
		'gallery_title'           => 'on',
		'nativecontrolsfortouch'  => false,
		'controls'                => 'on',
		'autoplay'                => false,
		'pauseothervideos'        => 'on',
		'loop'                    => false,
		'playsinline'             => 'on',
		'volume'                  => 1,
		'muted'                   => false,
		'gifmode'                 => false,
		'preload'                 => 'metadata',
		'playback_rate'           => false,
		'endofvideooverlay'       => false,
		'endofvideooverlaysame'   => '',
		'skin'                    => 'kg-video-js-skin',
		'js_skin'                 => 'kg-video-js-skin',
		'custom_attributes'       => '',
		'bitrate_multiplier'      => 0.1,
		'h264_CRF'                => '23',
		'webm_CRF'                => '10',
		'ogv_CRF'                 => '6',
		'audio_bitrate'           => 160,
		'audio_channels'          => 'on',
		'threads'                 => 1,
		'nice'                    => 'on',
		'browser_thumbnails'      => 'on',
		'rate_control'            => 'crf',
		'h264_profile'            => 'baseline',
		'h264_level'              => '3.0',
		'auto_encode'             => false,
		'auto_encode_gif'         => false,
		'auto_thumb'              => false,
		'auto_thumb_number'       => 1,
		'auto_thumb_position'     => 50,
		'right_click'             => 'on',
		'resize'                  => 'on',
		'auto_res'                => 'automatic',
		'pixel_ratio'             => 'on',
		'capabilities'            => array(
			'make_video_thumbnails'     => $upload_capable,
			'encode_videos'             => $upload_capable,
			'edit_others_video_encodes' => $edit_others_capable,
		),
		'open_graph'              => false,
		'schema'                  => 'on',
		'twitter_card'            => false,
		'oembed_provider'         => false,
		'oembed_security'         => false,
		'htaccess_login'          => '',
		'htaccess_password'       => '',
		'sample_format'           => 'mobile',
		'sample_rotate'           => false,
		'ffmpeg_thumb_watermark'  => array(
			'url'    => '',
			'scale'  => '50',
			'align'  => 'center',
			'valign' => 'center',
			'x'      => '0',
			'y'      => '0',
		),
		'ffmpeg_watermark'        => array(
			'url'    => '',
			'scale'  => '9',
			'align'  => 'right',
			'valign' => 'bottom',
			'x'      => '6',
			'y'      => '5',
		),
		'simultaneous_encodes'    => 1,
		'error_email'             => 'nobody',
		'alwaysloadscripts'       => false,
		'replace_video_shortcode' => false,
		'rewrite_attachment_url'  => 'on',
		'auto_publish_post'       => false,
		'transient_cache'         => false,
		'queue_control'           => 'play',
	);

	$video_formats = kgvid_video_formats();
	foreach ( $video_formats as $format => $format_stats ) {
		if ( array_key_exists( 'default_encode', $format_stats )
			&& $format_stats['default_encode'] === 'on'
		) {
			$options['encode'][ $format ] = $format_stats['default_encode'];
		}
	}

	return apply_filters( 'kgvid_default_options', $options );
}

function kgvid_default_network_options() {

	$default_options = kgvid_default_options_fn();

	$network_options = array(
		'app_path'                        => $default_options['app_path'],
		'video_app'                       => $default_options['video_app'],
		'moov'                            => $default_options['moov'],
		'video_bitrate_flag'              => $default_options['video_bitrate_flag'],
		'ffmpeg_vpre'                     => $default_options['ffmpeg_vpre'],
		'nice'                            => $default_options['nice'],
		'threads'                         => $default_options['threads'],
		'ffmpeg_exists'                   => $default_options['ffmpeg_exists'],
		'default_capabilities'            => $default_options['capabilities'],
		'superadmin_only_ffmpeg_settings' => false,
		'simultaneous_encodes'            => $default_options['simultaneous_encodes'],
		'network_error_email'             => $default_options['error_email'],
		'queue_control'                   => $default_options['queue_control'],
	);

	return $network_options;
}

function is_videopack_active_for_network() {

	if ( ! is_multisite() ) {
		return false;
	}

	$plugins = get_site_option( 'active_sitewide_plugins' );
	if ( isset( $plugins[ VIDEOPACK_BASENAME ] ) ) {
		return true;
	}

	return false;
}

function kgvid_get_options() {

	$options = get_option( 'kgvid_video_embed_options' );

	if ( is_videopack_active_for_network() ) {
		$network_options = get_site_option( 'kgvid_video_embed_network_options' );
		if ( ! is_array( $options ) ) {
			$options = kgvid_default_options_fn();
		}
		if ( is_array( $network_options ) ) {
			if ( ! fs_is_network_admin() && $network_options['queue_control'] == 'play' && $options['queue_control'] == 'pause' ) {
				$network_options['queue_control'] = 'pause'; // allows local queue to pause while network queue continues.
			}
			$options = array_merge( $options, $network_options );
		}
	}

	return $options;
}

function kgvid_filter_validate_url( $uri ) {
	// multibyte compatible check if string is a URL.

	$res = filter_var( $uri, FILTER_VALIDATE_URL );

	if ( $res ) {
		return $res;
	}
	// Check if it has unicode chars.
	$l = mb_strlen( $uri );

	if ( $l !== strlen( $uri ) ) {

		// Replace wide chars by “X”.
		$s = str_repeat( ' ', $l );
		for ( $i = 0; $i < $l; ++$i ) {
			$ch       = mb_substr( $uri, $i, 1 );
			$s [ $i ] = strlen( $ch ) > 1 ? 'X' : $ch;
		}
		// Re-check now.
		$res = filter_var( $s, FILTER_VALIDATE_URL );
		if ( $res ) {
			$uri = $res;
			return 1;
		}
	}
}

function kgvid_sanitize_text_field( $text_field ) {
	// recursively sanitizes user input.
	$old_field = $text_field;

	if ( is_array( $text_field ) ) {

		foreach ( $text_field as $key => &$value ) {
			if ( is_array( $value ) ) {
				$value = kgvid_sanitize_text_field( $value );
			} elseif ( $key === 'titlecode' ) {
				// special case for the titlecode Videopack setting.
					$value = wp_kses_post( $value );
			} elseif ( kgvid_filter_validate_url( $value ) ) { // if it's a URL.
				$value = sanitize_url( $value );
			} else {
				$value = sanitize_text_field( $value );
			}
		}
	} elseif ( kgvid_filter_validate_url( $text_field ) ) { // not an array.

		// if it's a URL.
			$text_field = sanitize_url( $text_field );
	} else {
		$text_field = sanitize_text_field( $text_field );
	}//end if

	return $text_field;
}

function kgvid_sanitize_url( $movieurl ) {

	$movieurl        = rawurldecode( $movieurl );
	$movie_extension = pathinfo( wp_parse_url( $movieurl, PHP_URL_PATH ), PATHINFO_EXTENSION );

	if ( empty( $movie_extension ) ) {
		$sanitized_url['noextension'] = $movieurl;
		$sanitized_url['basename']    = substr( $movieurl, -20 );
	} else {
		$movieurl                     = strtok( $movieurl, '?' );
		$sanitized_url['noextension'] = preg_replace( '/\\.[^.\\s]{3,4}$/', '', $movieurl );
		$sanitized_url['basename']    = sanitize_file_name( basename( $movieurl ) );
		$sanitized_url['basename']    = str_replace( '.' . $movie_extension, '', $sanitized_url['basename'] );
	}

	$sanitized_url['singleurl_id'] = 'singleurl_' . preg_replace( '/[^a-zA-Z0-9]/', '_', $sanitized_url['basename'] );
	$sanitized_url['movieurl']     = esc_url_raw( str_replace( ' ', '%20', $movieurl ) );

	return $sanitized_url;
}

function kgvid_get_jetpack_twitter_username() {

	$jetpack_options                = get_option( 'jetpack_options' );
	$jetpack_twitter_cards_site_tag = get_option( 'jetpack-twitter-cards-site-tag' );
	if ( is_array( $jetpack_options )
		&& array_key_exists( 'publicize_connections', $jetpack_options )
		&& array_key_exists( 'twitter', $jetpack_options['publicize_connections'] )
		&& array_key_exists( 'external_name', $jetpack_options['publicize_connections']['twitter'] )
		&& ! empty( $jetpack_options['publicize_connections']['twitter']['external_name'] )
	) {
		$twitter_username = $jetpack_options['publicize_connections']['twitter']['external_name'];
	} elseif ( ! empty( $jetpack_twitter_cards_site_tag ) ) {
		$twitter_username = $jetpack_twitter_cards_site_tag;
	} else {
		$twitter_username = '';
	}

	return $twitter_username;
}

function kgvid_get_attachment_meta( $post_id ) {

	$options = kgvid_get_options();

	$kgvid_postmeta = get_post_meta( $post_id, '_kgvid-meta', true );

	$meta_key_array = array(
		'embed'               => 'Single Video',
		'width'               => '',
		'height'              => '',
		'actualwidth'         => '',
		'actualheight'        => '',
		'downloadlink'        => $options['downloadlink'],
		'track'               => '',
		'starts'              => '0',
		'play_25'             => '0',
		'play_50'             => '0',
		'play_75'             => '0',
		'completeviews'       => '0',
		'pickedformat'        => '',
		'encode'              => $options['encode'],
		'rotate'              => '',
		'autothumb-error'     => '',
		'numberofthumbs'      => $options['generate_thumbs'],
		'randomize'           => '',
		'forcefirst'          => '',
		'featured'            => $options['featured'],
		'thumbtime'           => '',
		'lockaspect'          => 'on',
		'showtitle'           => '',
		'gallery_thumb_width' => $options['gallery_thumb'],
		'gallery_exclude'     => '',
		'gallery_include'     => '',
		'gallery_orderby'     => '',
		'gallery_order'       => '',
		'gallery_id'          => '',
		'duration'            => '',
		'aspect'              => '',
		'original_replaced'   => '',
	);

	if ( empty( $kgvid_postmeta ) ) {

		$kgvid_postmeta = array();

		$embed = get_post_meta( $post_id, '_kgflashmediaplayer-embed', true ); // this was always saved if you modified the attachment.

		if ( ! empty( $embed ) ) { // old meta values exist

			foreach ( $meta_key_array as $key => $value ) { // read old meta keys and delete them
				$kgvid_postmeta[ $key ] = get_post_meta( $post_id, '_kgflashmediaplayer-' . $key, true );
				if ( $kgvid_postmeta[ $key ] === 'checked' ) {
					$kgvid_postmeta[ $key ] = 'on';
				}
				delete_post_meta( $post_id, '_kgflashmediaplayer-' . $key );
			}

			foreach ( $kgvid_postmeta as $key => $value ) {
				if ( $value === null ) {
					unset( $kgvid_postmeta[ $key ] ); // remove empty elements
				}
			}

			kgvid_save_attachment_meta( $post_id, $kgvid_postmeta );

		}

		$old_meta_encode_keys = array(
			'encodefullres',
			'encode1080',
			'encode720',
			'encode480',
			'encodemobile',
			'encodewebm',
			'encodeogg',
			'encodecustom',
		);

		$old_meta_exists = false;

		foreach ( $old_meta_encode_keys as $old_key ) {
			if ( array_key_exists( $old_key, $kgvid_postmeta ) ) {
				$format                              = str_replace( 'encode', '', $old_key );
				$kgvid_postmeta['encode'][ $format ] = $kgvid_postmeta[ $old_key ];
				unset( $kgvid_postmeta[ $old_key ] );
				$old_meta_exists = true;
			}
		}

		if ( $old_meta_exists ) {
			kgvid_save_attachment_meta( $post_id, $kgvid_postmeta );
		}
	}//end if

	$kgvid_postmeta = array_merge( $meta_key_array, $kgvid_postmeta ); // make sure all keys are set

	return apply_filters( 'kgvid_attachment_meta', $kgvid_postmeta );
}

function kgvid_save_attachment_meta( $post_id, $kgvid_postmeta ) {

	if ( is_array( $kgvid_postmeta ) ) {

		$options            = kgvid_get_options();
		$kgvid_old_postmeta = kgvid_get_attachment_meta( $post_id );
		$kgvid_postmeta     = array_merge( $kgvid_old_postmeta, $kgvid_postmeta ); // make sure all keys are saved

		foreach ( $kgvid_postmeta as $key => $meta ) { // don't save if it's the same as the default values or empty

			if ( ( array_key_exists( $key, $options ) && $meta == $options[ $key ] )
				|| ( ! is_array( $kgvid_postmeta[ $key ] ) && strlen( $kgvid_postmeta[ $key ] ) == 0
					&& ( ( array_key_exists( $key, $options ) && strlen( $options[ $key ] ) == 0 )
					|| ! array_key_exists( $key, $options ) )
				)
			) {
				unset( $kgvid_postmeta[ $key ] );
			}
		}

		update_post_meta( $post_id, '_kgvid-meta', $kgvid_postmeta );

	}
}

function kgvid_get_encode_queue() {

	if ( is_videopack_active_for_network() ) {
		$video_encode_queue = get_site_option( 'kgvid_video_embed_queue' );
	} else {
		$video_encode_queue = get_option( 'kgvid_video_embed_queue' );
	}

	return $video_encode_queue;
}

function kgvid_save_encode_queue( $video_encode_queue ) {

	if ( is_videopack_active_for_network() ) {
		update_site_option( 'kgvid_video_embed_queue', $video_encode_queue );
	} else {
		update_option( 'kgvid_video_embed_queue', $video_encode_queue );
	}
}

function kgvid_video_formats( $return_replace = false, $return_customs = true, $return_dontembeds = true ) {

	$options = get_option( 'kgvid_video_embed_options' );

	$video_formats = array(
		'fullres' => array(
			'name'           => esc_html__( 'same resolution H.264', 'video-embed-thumbnail-generator' ),
			'label'          => esc_html_x( 'Full', 'Full resolution', 'video-embed-thumbnail-generator' ),
			'width'          => INF,
			'height'         => INF,
			'type'           => 'h264',
			'extension'      => 'mp4',
			'mime'           => 'video/mp4',
			'suffix'         => '-fullres.mp4',
			'vcodec'         => 'libx264',
			'default_encode' => false,
		),
		'1080'    => array(
			'name'           => '1080p H.264',
			'label'          => '1080p',
			'width'          => 1920,
			'height'         => 1080,
			'type'           => 'h264',
			'extension'      => 'mp4',
			'mime'           => 'video/mp4',
			'suffix'         => '-1080.mp4',
			'old_suffix'     => '-1080.m4v',
			'vcodec'         => 'libx264',
			'default_encode' => 'on',
		),
		'720'     => array(
			'name'           => '720p H.264',
			'label'          => '720p',
			'width'          => 1280,
			'height'         => 720,
			'type'           => 'h264',
			'extension'      => 'mp4',
			'mime'           => 'video/mp4',
			'suffix'         => '-720.mp4',
			'old_suffix'     => '-720.m4v',
			'vcodec'         => 'libx264',
			'default_encode' => 'on',
		),
		'480'     => array(
			'name'           => '480p H.264',
			'label'          => '480p',
			'width'          => 854,
			'height'         => 480,
			'type'           => 'h264',
			'extension'      => 'mp4',
			'mime'           => 'video/mp4',
			'suffix'         => '-480.mp4',
			'old_suffix'     => '-480.m4v',
			'vcodec'         => 'libx264',
			'default_encode' => 'on',
		),
		'mobile'  => array(
			'name'           => '360p H.264',
			'label'          => '360p',
			'width'          => 640,
			'height'         => 360,
			'type'           => 'h264',
			'extension'      => 'mp4',
			'suffix'         => '-360.mp4',
			'mime'           => 'video/mp4',
			'old_suffix'     => '-ipod.m4v',
			'vcodec'         => 'libx264',
			'default_encode' => 'on',
		),
		'webm'    => array(
			'name'           => 'WEBM VP8',
			'label'          => 'WEBM VP8',
			'width'          => INF,
			'height'         => INF,
			'type'           => 'webm',
			'extension'      => 'webm',
			'mime'           => 'video/webm',
			'suffix'         => '.webm',
			'vcodec'         => 'libvpx',
			'default_encode' => false,
		),
		'vp9'     => array(
			'name'           => 'WEBM VP9',
			'label'          => 'WEBM VP9',
			'width'          => INF,
			'height'         => INF,
			'type'           => 'vp9',
			'extension'      => 'webm',
			'mime'           => 'video/webm',
			'suffix'         => '-vp9.webm',
			'vcodec'         => 'libvpx-vp9',
			'default_encode' => false,
		),
		'ogg'     => array(
			'name'           => 'OGV',
			'label'          => 'OGV',
			'width'          => INF,
			'height'         => INF,
			'type'           => 'ogv',
			'extension'      => 'ogv',
			'mime'           => 'video/ogg',
			'suffix'         => '.ogv',
			'vcodec'         => 'libtheora',
			'default_encode' => false,
		),
	);

	if ( $return_customs ) {

		$video_formats = $video_formats + array(
			'custom_h264' => array(
				'name'           => esc_html__( 'Custom MP4', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( 'Custom MP4', 'video-embed-thumbnail-generator' ),
				'width'          => 0,
				'height'         => 0,
				'type'           => 'h264',
				'extension'      => 'mp4',
				'mime'           => 'video/mp4',
				'suffix'         => '-custom.mp4',
				'vcodec'         => 'libx264',
				'default_encode' => false,
			),
			'custom_webm' => array(
				'name'           => esc_html__( 'Custom WEBM', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( 'Custom WEBM', 'video-embed-thumbnail-generator' ),
				'width'          => 0,
				'height'         => 0,
				'type'           => 'webm',
				'extension'      => 'webm',
				'mime'           => 'video/webm',
				'suffix'         => '-custom.webm',
				'vcodec'         => 'libvpx',
				'default_encode' => false,
			),
			'custom_vp9'  => array(
				'name'           => esc_html__( 'Custom VP9 WEBM', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( 'Custom VP9 WEBM', 'video-embed-thumbnail-generator' ),
				'width'          => 0,
				'height'         => 0,
				'type'           => 'vp9',
				'extension'      => 'webm',
				'mime'           => 'video/webm',
				'suffix'         => '-customvp9.webm',
				'vcodec'         => 'libvpx-vp9',
				'default_encode' => false,
			),
			'custom_ogg'  => array(
				'name'           => esc_html__( 'Custom OGV', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( 'Custom OGV', 'video-embed-thumbnail-generator' ),
				'width'          => 0,
				'height'         => 0,
				'type'           => 'ogv',
				'extension'      => 'ogv',
				'mime'           => 'video/ogv',
				'suffix'         => '-custom.ogv',
				'vcodec'         => 'libtheora',
				'default_encode' => false,
			),
		);
	}//end if

	if ( is_array( $options ) && is_array( $options['custom_format'] ) && ( ! empty( $options['custom_format']['width'] ) || ! empty( $options['custom_format']['height'] ) ) ) {
		$video_formats['custom'] = $options['custom_format'];
		unset( $video_formats[ 'custom_' . $options['custom_format']['format'] ] );
	}

	if ( is_array( $options ) && isset( $options['replace_format'] ) ) {

		$video_formats['fullres'] = array(
			/* translators: %s is the name of a video format */
			'name'      => sprintf( esc_html__( 'Replace original with %s', 'video-embed-thumbnail-generator' ), $video_formats[ $options['replace_format'] ]['name'] ),
			'width'     => $video_formats[ $options['replace_format'] ]['width'],
			'height'    => $video_formats[ $options['replace_format'] ]['height'],
			'type'      => $video_formats[ $options['replace_format'] ]['type'],
			'extension' => $video_formats[ $options['replace_format'] ]['extension'],
			'mime'      => $video_formats[ $options['replace_format'] ]['mime'],
			'suffix'    => '-fullres.' . $video_formats[ $options['replace_format'] ]['extension'],
			'vcodec'    => $video_formats[ $options['replace_format'] ]['vcodec'],
		);

		if ( ! $return_replace && $options['replace_format'] != 'fullres' ) {
			unset( $video_formats[ $options['replace_format'] ] );
		}
	}

	return apply_filters( 'kgvid_video_formats', $video_formats, $return_replace, $return_customs, $return_dontembeds );
}

function kgvid_register_default_options_fn() {
	// add default values for options

	$options = kgvid_get_options();

	if ( ! is_array( $options ) ) {

		$options = kgvid_default_options_fn();

		$ffmpeg_check = kgvid_check_ffmpeg_exists( $options, false );
		if ( true == $ffmpeg_check['ffmpeg_exists'] ) {
			$options['ffmpeg_exists'] = 'on';
			$options['app_path']      = $ffmpeg_check['app_path'];
		} else {
			$options['ffmpeg_exists'] = 'notinstalled';
		}

		update_option( 'kgvid_video_embed_options', $options );

	}

	return $options;
}

function kgvid_add_new_blog( $blog_id ) {

	switch_to_blog( $blog_id );

	$network_options = get_site_option( 'kgvid_video_embed_network_options' );
	kgvid_set_capabilities( $network_options['default_capabilities'] );

	restore_current_blog();
}
add_action( 'wpmu_new_blog', 'kgvid_add_new_blog' );

function kgvid_plugin_action_links( $links ) {

	$links[] = '<a href="' . get_admin_url( null, 'options-general.php?page=video_embed_thumbnail_generator_settings' ) . '">' . esc_html__( 'Settings', 'video-embed-thumbnail-generator' ) . '</a>';
	return $links;
}
add_filter( 'plugin_action_links_' . VIDEOPACK_BASENAME, 'kgvid_plugin_action_links' );

function kgvid_plugin_network_action_links( $links ) {

	$links[] = '<a href="' . network_admin_url() . 'settings.php?page=video_embed_thumbnail_generator_settings">' . esc_html__( 'Network Settings', 'video-embed-thumbnail-generator' ) . '</a>';
	return $links;
}
add_filter( 'network_admin_plugin_action_links_' . VIDEOPACK_BASENAME, 'kgvid_plugin_network_action_links' );

function kgvid_plugin_meta_links( $links, $file ) {

	if ( $file == VIDEOPACK_BASENAME ) {
		return array_merge(
			$links,
			array( '<a href="https://www.videopack.video/donate/">Donate</a>' )
		);
	}
	return $links;
}
add_filter( 'plugin_row_meta', 'kgvid_plugin_meta_links', 10, 2 );

// add plugin upgrade notification
function kgvid_showUpgradeNotification( $currentPluginMetadata, $newPluginMetadata ) {
	// check "upgrade_notice"
	if ( isset( $newPluginMetadata->upgrade_notice ) && strlen( trim( $newPluginMetadata->upgrade_notice ) ) > 0 ) {
		printf(
			'<div class="update-message">%s</div>',
			wpautop( $newPluginMetadata->upgrade_notice )
		);
	}
}
add_action( 'in_plugin_update_message-video-embed-thumbnail-generator/video-embed-thumbnail-generator.php', 'kgvid_showUpgradeNotification', 10, 2 );

function kgvid_check_if_capable( $capability ) {

	$wp_roles = wp_roles();

	$capable = array();

	if ( is_object( $wp_roles ) && property_exists( $wp_roles, 'roles' ) ) {

		foreach ( $wp_roles->roles as $role => $role_info ) {
			if ( is_array( $role_info['capabilities'] )
				&& array_key_exists( $capability, $role_info['capabilities'] )
				&& $role_info['capabilities'][ $capability ] == 1
			) {
				$capable[ $role ] = 'on';
			} else {
				$capable[ $role ] = false;
			}
		}
	}
	return $capable;
}

function kgvid_set_capabilities( $capabilities ) {

	$wp_roles = wp_roles();

	if ( is_object( $wp_roles ) && property_exists( $wp_roles, 'roles' ) ) {

		$default_options = kgvid_default_options_fn();

		foreach ( $default_options['capabilities'] as $default_capability => $default_enabled ) {
			if ( is_array( $capabilities ) && ! array_key_exists( $default_capability, $capabilities ) ) {
				$capabilities[ $default_capability ] = array();
			}
		}

		foreach ( $capabilities as $capability => $enabled_roles ) {
			foreach ( $wp_roles->roles as $role => $role_info ) { // check all roles
				if ( is_array( $role_info['capabilities'] ) && ! array_key_exists( $capability, $role_info['capabilities'] ) && array_key_exists( $role, $enabled_roles ) && $enabled_roles[ $role ] == 'on' ) {
					$wp_roles->add_cap( $role, $capability );
				}
				if ( is_array( $role_info['capabilities'] ) && array_key_exists( $capability, $role_info['capabilities'] ) && ! array_key_exists( $role, $enabled_roles ) ) {
					$wp_roles->remove_cap( $role, $capability );
				}
			}
		}
	}//end if
}

function kgvid_set_transient_name( $url ) {

	$url = str_replace( ' ', '', $url ); // in case a url with spaces got through
	// Get the path or the original size image by slicing the widthxheight off the end and adding the extension back.
	$search_url = preg_replace( '/-\d+x\d+(\.(?:png|jpg|gif))$/i', '.' . pathinfo( $url, PATHINFO_EXTENSION ), $url );
	if ( strlen( $search_url ) > 166 ) {
		$search_url = substr( $search_url, -162 );
	} //transients can't be more than 172 characters long. Including 'kgvid_' the URL has to be 162 characters or fewer

	return $search_url;
}

function kgvid_url_to_id( $url ) {

	global $wpdb;
	$options       = kgvid_get_options();
	$post_id       = false;
	$video_formats = kgvid_video_formats();
	$search_url    = kgvid_set_transient_name( $url );

	if ( $options['transient_cache'] == 'on' ) {
		$post_id = get_transient( 'kgvid_' . $search_url );
	}

	if ( $post_id === false ) {

		$post_id = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT post_id
				FROM $wpdb->postmeta
				WHERE meta_key = '_wp_attached_file'
				AND meta_value LIKE RIGHT(%s, CHAR_LENGTH(meta_value))
				AND LENGTH(meta_value) > 0",
				array(
					$search_url,
				)
			)
		);

		if ( ! $post_id && $options['ffmpeg_exists'] === 'on'
			&& $video_formats['fullres']['extension'] !== pathinfo( $url, PATHINFO_EXTENSION )
		) {
			$search_url = str_replace( pathinfo( $url, PATHINFO_EXTENSION ), $video_formats['fullres']['extension'], $url );
			$post_id    = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT post_id
					FROM $wpdb->postmeta
					WHERE meta_key = '_wp_attached_file'
					AND meta_value LIKE RIGHT(%s, CHAR_LENGTH(meta_value))
					AND LENGTH(meta_value) > 0",
					array(
						$search_url,
					)
				)
			);
			if ( $post_id ) {
				$kgvid_postmeta = kgvid_get_attachment_meta( $post_id );
			}
			if ( ! isset( $kgvid_postmeta )
				|| ! is_array( $kgvid_postmeta )
				|| ( is_array( $kgvid_postmeta )
					&& ! array_key_exists( 'original_replaced', $kgvid_postmeta )
				)
			) {
				$post_id = null;
			}
		}

		if ( $options['transient_cache'] === 'on' ) {
			if ( ! $post_id ) {
				$post_id = 'not found'; // don't save a transient value that could evaluate as false
			}

			set_transient( 'kgvid_' . $search_url, $post_id, MONTH_IN_SECONDS );
		}
	}//end if

	if ( $post_id === 'not found' ) {
		$post_id = null;
	}

	return $post_id;
}

function kgvid_is_animated_gif( $filename ) {

	$fh = @fopen( $filename, 'rb' );

	if ( ! $fh ) {
		return false;
	}
	$count = 0;
	// an animated gif contains multiple "frames", with each frame having a
	// header made up of:
	// * a static 4-byte sequence (\x00\x21\xF9\x04)
	// * 4 variable bytes
	// * a static 2-byte sequence (\x00\x2C) (some variants may use \x00\x21 ?)

	// We read through the file til we reach the end of the file, or we've found
	// at least 2 frame headers
	while ( ! feof( $fh ) && $count < 2 ) {
		$chunk  = fread( $fh, 1024 * 100 ); // read 100kb at a time
		$count += preg_match_all( '#\x00\x21\xF9\x04.{4}\x00(\x2C|\x21)#s', $chunk, $matches );
	}

	fclose( $fh );
	return $count > 1;
}

function kgvid_is_video( $post ) {

	if ( $post && is_object( $post ) && property_exists( $post, 'post_mime_type' ) ) {

		if ( $post->post_mime_type == 'image/gif' ) {
			$moviefile   = get_attached_file( $post->ID );
			$is_animated = kgvid_is_animated_gif( $moviefile );
		} else {
			$is_animated = false;
		}

		if ( substr( $post->post_mime_type, 0, 5 ) === 'video'
			&& ( empty( $post->post_parent )
				|| ( strpos( get_post_mime_type( $post->post_parent ), 'video' ) === false
					&& get_post_meta( $post->ID, '_kgflashmediaplayer-externalurl', true ) == ''
				)
			)
			|| $is_animated
		) { // if the attachment is a video with no parent or if it has a parent the parent is not a video and the video doesn't have the externalurl post meta

			return true;

		}
	}

	return false;
}

function kgvid_url_exists( $url ) {

	$ssl_context_options = array(
		'ssl' => array(
			'verify_peer'      => false,
			'verify_peer_name' => false,
		),
	);
	$ssl_context         = stream_context_create( $ssl_context_options );

	$hdrs = @get_headers( $url, 0, $ssl_context );

	return is_array( $hdrs ) ? preg_match( '/^HTTP\\/\\d+\\.\\d+\\s+2\\d\\d\\s+.*$/', $hdrs[0] ) : false;
}

function kgvid_add_mime_types( $existing_mimes ) {

	$existing_mimes['mpd']  = 'application/dash+xml';
	$existing_mimes['m3u8'] = 'application/vnd.apple.mpegurl';

	return $existing_mimes;
}
add_filter( 'mime_types', 'kgvid_add_mime_types' );

function kgvid_url_mime_type( $url, $post_id = false ) {

	$mime_info = wp_check_filetype( strtok( $url, '?' ) );

	if ( array_key_exists( 'type', $mime_info ) && empty( $mime_info['type'] ) ) { // wp unable to determine mime type

		$mime_info = '';

		if ( $post_id != false ) {

			$sanitized_url = kgvid_sanitize_url( $url );
			$mime_info     = get_post_meta( $post_id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-mime', true );

		}

		if ( empty( $mime_info ) ) {

			$mime_type     = '';
			$url_extension = '';

			$context_options = array(
				'ssl'  => array(
					'verify_peer'      => false,
					'verify_peer_name' => false,
				),
				'http' => array(
					'method' => 'HEAD',
				),
			);

			$context = stream_context_create( $context_options );

			$fp = fopen( $url, 'r', false, $context );

			if ( $fp ) {

				$metadata = stream_get_meta_data( $fp );
				fclose( $fp );

				$headers = $metadata['wrapper_data'];

				foreach ( $headers as $line ) {
					if ( strtok( $line, ':' ) == 'Content-Type' ) {
							$parts     = explode( ':', $line );
							$mime_type = trim( $parts[1] );
					}
				}

				if ( ! empty( $mime_type ) ) {
					$wp_mime_types = wp_get_mime_types();
					foreach ( $wp_mime_types as $extension => $type ) {
						if ( $type == $mime_type ) {
							$url_extension = $extension;
							if ( strpos( $url_extension, '|' ) !== false ) {
								$extensions    = explode( '|', $url_extension );
								$url_extension = $extensions[0];
							}
							break;
						}
					}
				}

				$mime_info         = array();
				$mime_info['type'] = $mime_type;
				$mime_info['ext']  = $url_extension;

				if ( $post_id != false ) {
					$mime_info = update_post_meta( $post_id, '_kgflashmediaplayer-' . $sanitized_url['singleurl_id'] . '-mime', $mime_info );
				}
			}//end if
		}//end if
	}//end if

	return $mime_info;
}

function kgvid_is_empty_dir( $dir ) {
	$dh = @opendir( $dir );
	if ( $dh ) {
		while ( $file = readdir( $dh ) ) {
			if ( $file != '.' && $file != '..' ) {
				closedir( $dh );
				return false;
			}
		}
		closedir( $dh );
		return true;
	} else {
		return false; // whatever the reason is : no such dir, not a dir, not readable
	}
}

function kgvid_rrmdir( $dir ) {
	if ( is_dir( $dir ) ) {
		$objects = scandir( $dir );
		foreach ( $objects as $object ) {
			if ( $object != '.' && $object != '..' ) {
				if ( filetype( $dir . '/' . $object ) == 'dir' ) {
					kgvid_rrmdir( $dir . '/' . $object );
				} else {
					unlink( $dir . '/' . $object );
				}
			}
		}
		reset( $objects );
		rmdir( $dir );
	}
}

function kgvid_build_paired_attributes( $value, $key ) {
	return $key . '="' . $value . '"';
}

function enqueue_kgvid_script() {
	// loads plugin-related scripts in the admin area

	if ( ! wp_script_is( 'kgvid_video_plugin_admin', 'enqueued' ) ) {

		$options = kgvid_get_options();

		wp_enqueue_script( 'kgvid_video_plugin_admin', plugins_url( '/js/videopack-admin.js', __FILE__ ), array( 'jquery' ), $options['version'], true );
		wp_enqueue_style( 'video_embed_thumbnail_generator_style', plugins_url( '/css/videopack-styles-admin.css', __FILE__ ), '', $options['version'] );

		wp_localize_script(
			'kgvid_video_plugin_admin',
			'kgvidL10n',
			array(
				'ajax_nonce'           => wp_create_nonce( 'kgvid_admin_nonce' ),
				'wait'                 => esc_html_x( 'Wait', 'please wait', 'video-embed-thumbnail-generator' ),
				'hidevideo'            => esc_html__( 'Hide video...', 'video-embed-thumbnail-generator' ),
				'choosefromvideo'      => esc_html__( 'Choose from video...', 'video-embed-thumbnail-generator' ),
				'cantloadvideo'        => esc_html__( 'Can\'t load video', 'video-embed-thumbnail-generator' ),
				/* translators: %1$s is the name of the video encoding application (usually FFMPEG). %2$s is the path to the application. */
				'cantmakethumbs'       => sprintf( esc_html__( 'Error: unable to load video in browser for thumbnail generation and %1$s not found at %2$s', 'video-embed-thumbnail-generator' ), esc_html( strtoupper( $options['video_app'] ) ), esc_html( $options['app_path'] ) ),
				'choosethumbnail'      => esc_html__( 'Choose Thumbnail:', 'video-embed-thumbnail-generator' ),
				'saveallthumbnails'    => esc_html__( 'Save All Thumbnails', 'video-embed-thumbnail-generator' ),
				'saving'               => esc_html__( 'Saving...', 'video-embed-thumbnail-generator' ),
				'loading'              => esc_html__( 'Loading...', 'video-embed-thumbnail-generator' ),
				'generate'             => esc_html__( 'Generate', 'video-embed-thumbnail-generator' ),
				'randomize'            => esc_html__( 'Randomize', 'video-embed-thumbnail-generator' ),
				/* translators: %s is the name of the video encoding application (usually FFMPEG). */
				'ffmpegnotfound'       => sprintf( esc_html__( '%s not found', 'video-embed-thumbnail-generator' ), esc_html( strtoupper( $options['video_app'] ) ) ),
				'pleasevalidurl'       => esc_html__( 'Please enter a valid video URL', 'video-embed-thumbnail-generator' ),
				'deletemessage'        => esc_html__( "You are about to permanently delete the encoded video.\n 'Cancel' to stop, 'OK' to delete.", 'video-embed-thumbnail-generator' ),
				'saved'                => esc_html__( 'Saved.', 'video-embed-thumbnail-generator' ),
				'runningtest'          => esc_html__( 'Running test...', 'video-embed-thumbnail-generator' ),
				'ffmpegrequired'       => esc_html__( 'FFMPEG or LIBAV required for these functions.', 'video-embed-thumbnail-generator' ),
				'featuredwarning'      => esc_html__( "You are about to set all existing video thumbnails previously generated by this plugin as the featured images for their posts. There is no 'undo' button, so proceed at your own risk.", 'video-embed-thumbnail-generator' ),
				'autothumbnailwarning' => esc_html__( "You are about to create thumbnails for every video in your Media Library that doesn't already have one. This might take a long time. There is no 'undo' button, so proceed at your own risk.\n\nNumber of videos without thumbnails: ", 'video-embed-thumbnail-generator' ),
				'autoencodewarning'    => esc_html__( "You are about to add every video in your Media Library to the video encode queue if it hasn't already been encoded. This might take a long time.", 'video-embed-thumbnail-generator' ),
				'nothumbstomake'       => esc_html__( 'No files generated. All videos are processed already.', 'video-embed-thumbnail-generator' ),
				'cancel_ok'            => esc_html__( "'Cancel' to stop, 'OK' to proceed.", 'video-embed-thumbnail-generator' ),
				'processing'           => esc_html__( 'Processing...', 'video-embed-thumbnail-generator' ),
				'parentwarning_posts'  => esc_html__( 'You are about to set all existing video thumbnails previously generated by this plugin as attachments of their posts rather than their associated videos. Proceed at your own risk.', 'video-embed-thumbnail-generator' ),
				'parentwarning_videos' => esc_html__( 'You are about to set all existing video thumbnails previously generated by this plugin as attachments of their videos rather than their associated posts. Proceed at your own risk.', 'video-embed-thumbnail-generator' ),
				'clearqueuedwarning'   => esc_html__( 'You are about to clear all videos not yet encoded.', 'video-embed-thumbnail-generator' ),
				'clearallwarning'      => esc_html__( 'You are about to clear all videos currently encoding, not yet encoded, completed successfully, and completed with errors.', 'video-embed-thumbnail-generator' ),
				'complete'             => esc_html__( 'Complete', 'video-embed-thumbnail-generator' ),
				'tracktype'            => esc_html__( 'Track type:', 'video-embed-thumbnail-generator' ),
				'subtitles'            => esc_html__( 'subtitles', 'video-embed-thumbnail-generator' ),
				'captions'             => esc_html__( 'captions', 'video-embed-thumbnail-generator' ),
				'chapters'             => esc_html__( 'chapters', 'video-embed-thumbnail-generator' ),
				'choosetextfile'       => esc_html__( 'Choose a Text File', 'video-embed-thumbnail-generator' ),
				'settracksource'       => esc_html__( 'Set as track source', 'video-embed-thumbnail-generator' ),
				'choosefromlibrary'    => esc_html__( 'Choose from Library', 'video-embed-thumbnail-generator' ),
				'languagecode'         => esc_html__( 'Language code:', 'video-embed-thumbnail-generator' ),
				'label'                => esc_html_x( 'Label:', 'noun', 'video-embed-thumbnail-generator' ),
				'trackdefault'         => esc_html__( 'Default:', 'video-embed-thumbnail-generator' ),
				'custom'               => esc_html_x( 'Custom', 'Custom format', 'video-embed-thumbnail-generator' ),
				'clearingcache'        => esc_html__( 'Clearing URL cache...', 'video-embed-thumbnail-generator' ),
				'queue_pause'          => esc_html__( 'Pause the queue. Any videos currently encoding will complete.', 'video-embed-thumbnail-generator' ),
				'queue_paused'         => esc_html__( 'Queue is paused. Press play button at top of screen to start.', 'video-embed-thumbnail-generator' ),
				'queue_play'           => esc_html__( 'Start encoding', 'video-embed-thumbnail-generator' ),
				'nothing_to_encode'    => esc_html__( 'Nothing to encode', 'video-embed-thumbnail-generator' ),
				'canceling'            => esc_html__( 'Canceling', 'video-embed-thumbnail-generator' ),
				'canceled'             => esc_html__( 'Canceled', 'video-embed-thumbnail-generator' ),
				'elapsed'              => esc_html__( 'Elapsed:', 'video-embed-thumbnail-generator' ),
				'remaining'            => esc_html__( 'Remaining:', 'video-embed-thumbnail-generator' ),
				'fps'                  => esc_html_x( 'FPS:', 'Frames per second', 'video-embed-thumbnail-generator' ),
				'encoding_complete'    => esc_html__( 'Encoding Complete', 'video-embed-thumbnail-generator' ),
				'encoding'             => esc_html__( 'Encoding', 'video-embed-thumbnail-generator' ),
				'deleted'              => esc_html__( 'Deleted', 'video-embed-thumbnail-generator' ),
				'not_deleted'          => esc_html__( 'Unable to delete file', 'video-embed-thumbnail-generator' ),
				'not_saved'            => esc_html__( 'Error: No settings saved.', 'video-embed-thumbnail-generator' ),
			)
		);
	}//end if
}
add_action( 'wp_enqueue_media', 'enqueue_kgvid_script' ); // always enqueue scripts if media elements are loaded

function maybe_enqueue_kgvid_script( $hook_suffix ) {

	if ( $hook_suffix === 'settings_page_video_embed_thumbnail_generator_settings'
		|| $hook_suffix === 'tools_page_kgvid_video_encoding_queue'
		|| $hook_suffix === 'settings_page_kgvid_network_video_encoding_queue'
	) {
		enqueue_kgvid_script();
	}
}
add_action( 'admin_enqueue_scripts', 'maybe_enqueue_kgvid_script' ); // only enqueue scripts on settings page or encode queue

function kgvid_add_network_settings_page() {
	add_submenu_page( 'settings.php', esc_html_x( 'Videopack', 'Settings page title', 'video-embed-thumbnail-generator' ), esc_html_x( 'Videopack', 'Settings page title in admin sidebar', 'video-embed-thumbnail-generator' ), 'manage_network_options', 'video_embed_thumbnail_generator_settings', 'kgvid_network_settings_page' );
}
add_action( 'network_admin_menu', 'kgvid_add_network_settings_page' );

function kgvid_validate_network_settings( $input ) {

	$options         = get_site_option( 'kgvid_video_embed_network_options' );
	$default_options = kgvid_default_network_options();

	$input = kgvid_sanitize_text_field( $input ); // recursively sanitizes all the settings

	if ( $input['app_path'] != $options['app_path'] || $input['video_app'] != $options['video_app'] ) {
		$input = kgvid_validate_ffmpeg_settings( $input );
	} else {
		$input['ffmpeg_exists'] = $options['ffmpeg_exists'];
	}

	// load all settings and make sure they get a value of false if they weren't entered into the form
	foreach ( $default_options as $key => $value ) {
		if ( ! array_key_exists( $key, $input ) ) {
			$input[ $key ] = false;
		}
	}

	if ( ! $input['queue_control'] ) { // don't reset queue control when saving settings
		$input['queue_control'] = $options['queue_control'];
	}

	return $input;
}

function kgvid_network_settings_page() {

	if ( isset( $_POST['kgvid_settings_security'] )
		&& isset( $_POST['action'] )
	) {
		$nonce = kgvid_sanitize_text_field( wp_unslash( $_POST['kgvid_settings_security'] ) );
		if ( ! isset( $nonce )
			|| ! wp_verify_nonce( $nonce, 'video-embed-thumbnail-generator-nonce' )
		) {
			die;
		}

		if ( isset( $_POST['action'] ) ) {
			$action = kgvid_sanitize_text_field( wp_unslash( $_POST['action'] ) );
		} else {
			$action = false;
		}
		if ( isset( $_POST['video-embed-thumbnail-generator-reset'] ) ) {
			$reset = true;
		} else {
			$reset = false;
		}

		if ( $action === 'update_kgvid_network_settings' ) {

			if ( $reset ) {
				// reset button pressed
				$default_network_options = kgvid_default_network_options();
				$options_updated         = update_site_option( 'kgvid_video_embed_network_options', $default_network_options );
				add_settings_error( 'video_embed_thumbnail_generator_settings', 'options-reset', esc_html__( 'Videopack network settings reset to default values.', 'video-embed-thumbnail-generator' ), 'updated' );
			} else { // save button pressed
				if ( isset( $_POST['kgvid_video_embed_options'] ) ) {
					$input = kgvid_sanitize_text_field( wp_unslash( $_POST['kgvid_video_embed_options'] ) );
				}
				$validated_options = kgvid_validate_network_settings( $input );
				$options_updated   = update_site_option( 'kgvid_video_embed_network_options', $validated_options );
			}
		}
	}

	include __DIR__ . '/partials/network-settings-page.php';
}

function kgvid_superadmin_capabilities_callback() {

	$network_options = get_site_option( 'kgvid_video_embed_network_options' );
	/* translators: %s is the name of the video encoding application (usually FFMPEG). */
	echo '<input ' . checked( $network_options['superadmin_only_ffmpeg_settings'], 'on', false ) . " id='superadmin_only_ffmpeg_settings' name='kgvid_video_embed_options[superadmin_only_ffmpeg_settings]' type='checkbox' /> <label for='superadmin_only_ffmpeg_settings'>" . sprintf( esc_html_x( 'Can access %s settings tab.', 'Can access FFMPEG settings tab', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_html( strtoupper( $network_options['video_app'] ) ) . '</strong>' ) . '</label>';
	/* translators: %s is the name of the video encoding application (usually FFMPEG). */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'Only Super admins will be allowed to view and modify %s settings.', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_html( strtoupper( $network_options['video_app'] ) ) . '</strong>' ) ) );
	echo "\n\t";

	echo "<div class='kgvid_video_app_required'>";
	echo esc_html__( 'Email all encoding errors on the network to:', 'video-embed-thumbnail-generator' ) . " <select id='network_error_email' name='kgvid_video_embed_options[network_error_email]'>";
	$network_super_admins = get_super_admins();
	if ( $network_super_admins ) {
		$authorized_users = array();
		foreach ( $network_super_admins as $network_super_admin ) {
			$user                                     = get_user_by( 'login', $network_super_admin );
			$authorized_users[ $network_super_admin ] = $user->ID;
		}
	}
	$items = array_merge(
		array(
			__( 'Nobody', 'video-embed-thumbnail-generator' ) => 'nobody',
			__( 'User who initiated encoding', 'video-embed-thumbnail-generator' ) => 'encoder',
		),
		$authorized_users
	);
	foreach ( $items as $name => $value ) {
		$selected = ( $network_options['network_error_email'] === $value ) ? 'selected="selected"' : '';
		echo "<option value='" . esc_attr( $value ) . "' " . esc_attr( $selected ) . '>' . esc_html( $name ) . '</option>';
	}
	echo '</select>';
	/* translators: %s is the name of the video encoding application (usually FFMPEG). */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'Can also be set on individual sites if the %s settings tab isn\'t disabled.', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_html( strtoupper( $network_options['video_app'] ) ) . '</strong>' ) ) );
	echo "</div>\n\t";
}

function kgvid_add_settings_page() {
	add_options_page( esc_html_x( 'Videopack', 'Settings page title', 'video-embed-thumbnail-generator' ), esc_html_x( 'Videopack', 'Settings page title in admin sidebar', 'video-embed-thumbnail-generator' ), 'manage_options', 'video_embed_thumbnail_generator_settings', 'kgvid_settings_page' );
}
add_action( 'admin_menu', 'kgvid_add_settings_page' );

function kgvid_settings_page() {
	wp_enqueue_media();
	$options         = kgvid_get_options();
	$network_options = get_site_option( 'kgvid_video_embed_network_options' );
	$video_app       = $options['video_app'];
	if ( $video_app === 'avconv' ) {
		$video_app = 'libav';
	}

	include __DIR__ . '/partials/settings-page.php';
}

function kgvid_video_embed_options_init() {

	function kgvid_do_settings_sections( $page ) {
		global $wp_settings_sections, $wp_settings_fields;

		if ( ! isset( $wp_settings_sections[ $page ] ) ) {
			return;
		}

		foreach ( (array) $wp_settings_sections[ $page ] as $section ) {
			if ( $section['title'] ) {
				echo "<h2 id='header_" . esc_attr( $section['id'] ) . "'>" . esc_html( $section['title'] ) . "</h2>\n";
			}

			if ( $section['callback'] ) {
				call_user_func( $section['callback'], $section );
			}

			if ( ! isset( $wp_settings_fields ) || ! isset( $wp_settings_fields[ $page ] ) || ! isset( $wp_settings_fields[ $page ][ $section['id'] ] ) ) {
				continue;
			}
			echo '<table class="form-table" id="table_' . esc_attr( $section['id'] ) . '">';
			do_settings_fields( $page, $section['id'] );
			echo '</table>';
		}
	}

	register_setting( 'kgvid_video_embed_options', 'kgvid_video_embed_options', 'kgvid_video_embed_options_validate' );

	add_settings_section( 'kgvid_video_embed_playback_settings', esc_html__( 'Default Video Playback Settings', 'video-embed-thumbnail-generator' ), 'kgvid_plugin_playback_settings_section_callback', 'video_embed_thumbnail_generator_settings' );
	add_settings_section( 'kgvid_video_embed_plugin_settings', esc_html__( 'Plugin Settings', 'video-embed-thumbnail-generator' ), 'kgvid_plugin_settings_section_callback', 'video_embed_thumbnail_generator_settings' );
	add_settings_section( 'kgvid_video_embed_encode_settings', esc_html__( 'Video Encoding Settings', 'video-embed-thumbnail-generator' ), 'kgvid_encode_settings_section_callback', 'video_embed_thumbnail_generator_settings' );
	add_settings_section( 'kgvid_video_embed_encode_test_settings', esc_html__( 'Video Encoding Test', 'video-embed-thumbnail-generator' ), 'kgvid_encode_settings_section_callback', 'video_embed_thumbnail_generator_settings' );

	add_settings_field( 'poster', esc_html__( 'Default thumbnail:', 'video-embed-thumbnail-generator' ), 'kgvid_poster_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_playback_settings', array( 'label_for' => 'poster' ) );
	add_settings_field( 'endofvideooverlay', esc_html__( 'End of video image:', 'video-embed-thumbnail-generator' ), 'kgvid_endofvideooverlay_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_playback_settings' );
	add_settings_field( 'watermark', esc_html__( 'Watermark overlay:', 'video-embed-thumbnail-generator' ), 'kgvid_watermark_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_playback_settings', array( 'label_for' => 'watermark' ) );
	add_settings_field( 'align', esc_html__( 'Video alignment:', 'video-embed-thumbnail-generator' ), 'kgvid_align_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_playback_settings', array( 'label_for' => 'align' ) );
	add_settings_field( 'resize', esc_html__( 'Automatically adjust videos:', 'video-embed-thumbnail-generator' ), 'kgvid_resize_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_playback_settings', array( 'label_for' => 'resize' ) );
	add_settings_field( 'dimensions', esc_html__( 'Video dimensions:', 'video-embed-thumbnail-generator' ), 'kgvid_dimensions_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_playback_settings', array( 'label_for' => 'width' ) );
	add_settings_field( 'gallery_options', esc_html__( 'Video gallery:', 'video-embed-thumbnail-generator' ), 'kgvid_video_gallery_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_playback_settings', array( 'label_for' => 'gallery_width' ) );
	add_settings_field( 'controls', esc_html__( 'Video controls:', 'video-embed-thumbnail-generator' ), 'kgvid_controls_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_playback_settings', array( 'label_for' => 'controls' ) );
	add_settings_field( 'js_skin', esc_html_x( 'Skin class:', 'CSS class for video skin', 'video-embed-thumbnail-generator' ), 'kgvid_js_skin_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_playback_settings', array( 'label_for' => 'js_skin' ) );
	add_settings_field( 'custom_attributes', esc_html__( 'Custom attributes:', 'video-embed-thumbnail-generator' ), 'kgvid_custom_attributes_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_playback_settings', array( 'label_for' => 'custom_attributes' ) );

	add_settings_field( 'security', esc_html__( 'Video sharing:', 'video-embed-thumbnail-generator' ), 'kgvid_security_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'right_click' ) );
	add_settings_field( 'performance', esc_html__( 'Performance:', 'video-embed-thumbnail-generator' ), 'kgvid_performance_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'count_views' ) );
	add_settings_field( 'replacevideoshortcode', esc_html__( 'Replace video shortcode:', 'video-embed-thumbnail-generator' ), 'kgvid_replace_video_shortcode_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'replace_video_shortcode' ) );
	add_settings_field( 'rewrite_attachment_url', esc_html__( 'Attachment URL Rewriting:', 'video-embed-thumbnail-generator' ), 'kgvid_rewrite_attachment_url_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'rewrite_attachment_url' ) );
	add_settings_field( 'generate_thumbs', esc_html__( 'Default number of thumbnails to generate:', 'video-embed-thumbnail-generator' ), 'kgvid_generate_thumbs_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'generate_thumbs' ) );
	add_settings_field( 'featured', esc_html__( 'Featured image:', 'video-embed-thumbnail-generator' ), 'kgvid_featured_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'featured' ) );
	add_settings_field( 'thumb_parent', esc_html__( 'Attach thumbnails to:', 'video-embed-thumbnail-generator' ), 'kgvid_thumb_parent_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'thumb_parent' ) );
	add_settings_field( 'user_roles', esc_html__( 'User capabilities:', 'video-embed-thumbnail-generator' ), 'kgvid_user_roles_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'user_roles' ) );
	add_settings_field( 'delete_children', esc_html__( 'Delete associated attachments:', 'video-embed-thumbnail-generator' ), 'kgvid_delete_children_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'delete_children' ) );
	add_settings_field( 'titlecode', esc_html__( 'Video title text HTML formatting:', 'video-embed-thumbnail-generator' ), 'kgvid_titlecode_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'titlecode' ) );
	add_settings_field( 'template', esc_html__( 'Attachment page design:', 'video-embed-thumbnail-generator' ), 'kgvid_template_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_plugin_settings', array( 'label_for' => 'template' ) );

	if ( ! is_plugin_active_for_network( plugin_basename( 'video_embed_thumbnail_generator_settings' ) ) ) {
		add_settings_field( 'app_path', esc_html__( 'Path to applications folder on server:', 'video-embed-thumbnail-generator' ), 'kgvid_app_path_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'app_path' ) );
		add_settings_field( 'video_app', esc_html__( 'Application for thumbnails & encoding:', 'video-embed-thumbnail-generator' ), 'kgvid_video_app_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'video_app' ) );
	}

	add_settings_field( 'browser_thumbnails', esc_html__( 'Enable in-browser thumbnails:', 'video-embed-thumbnail-generator' ), 'kgvid_browser_thumbnails_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'browser_thumbnails' ) );
	add_settings_field( 'encode_formats', esc_html__( 'Default video encode formats:', 'video-embed-thumbnail-generator' ), 'kgvid_encode_formats_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings' );
	add_settings_field( 'automatic', esc_html__( 'Do automatically on upload:', 'video-embed-thumbnail-generator' ), 'kgvid_automatic_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'auto_encode' ) );
	add_settings_field( 'automatic_encoded', esc_html__( 'Do automatically on completed encoding:', 'video-embed-thumbnail-generator' ), 'kgvid_automatic_completed_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'auto_publish_post' ) );
	add_settings_field( 'old_videos', esc_html__( 'For previously uploaded videos:', 'video-embed-thumbnail-generator' ), 'kgvid_old_video_buttons_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings' );
	add_settings_field( 'error_email', esc_html__( 'Email encoding errors to:', 'video-embed-thumbnail-generator' ), 'kgvid_error_email_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'error_email' ) );
	add_settings_field( 'htaccess', esc_html__( 'htaccess login:', 'video-embed-thumbnail-generator' ), 'kgvid_htaccess_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'htaccess_username' ) );
	add_settings_field( 'ffmpeg_thumb_watermark', esc_html__( 'Add watermark to thumbnails:', 'video-embed-thumbnail-generator' ), 'kgvid_ffmpeg_thumb_watermark_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'ffmpeg_thumb_watermark' ) );
	add_settings_field( 'ffmpeg_watermark', esc_html__( 'Add watermark to encoded files:', 'video-embed-thumbnail-generator' ), 'kgvid_ffmpeg_watermark_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'ffmpeg_watermark' ) );
	if ( ! is_plugin_active_for_network( plugin_basename( 'video_embed_thumbnail_generator_settings' ) ) ) {
		add_settings_field( 'moov', esc_html__( 'Method to fix encoded H.264 headers for streaming:', 'video-embed-thumbnail-generator' ), 'kgvid_moov_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'moov' ) );
	}
	add_settings_field( 'rate_control', esc_html__( 'Encode quality control method:', 'video-embed-thumbnail-generator' ), 'kgvid_rate_control_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'rate_control' ) );
	add_settings_field( 'CRFs', esc_html__( 'Constant Rate Factors (CRF):', 'video-embed-thumbnail-generator' ), 'kgvid_CRF_options_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'h264_CRF' ) );
	add_settings_field( 'bitrate_multiplier', esc_html__( 'Average Bit Rate:', 'video-embed-thumbnail-generator' ), 'kgvid_average_bitrate_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'bitrate_multiplier' ) );
	add_settings_field( 'h264_profile', esc_html__( 'H.264 profile:', 'video-embed-thumbnail-generator' ), 'kgvid_h264_profile_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'h264_profile' ) );
	add_settings_field( 'audio_options', esc_html__( 'Audio:', 'video-embed-thumbnail-generator' ), 'kgvid_audio_options_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'audio_bitrate' ) );

	if ( ! is_plugin_active_for_network( plugin_basename( 'video_embed_thumbnail_generator_settings' ) ) ) {
		add_settings_field( 'ffmpeg_options', esc_html__( 'FFMPEG legacy options:', 'video-embed-thumbnail-generator' ), 'kgvid_ffmpeg_options_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'video_bitrate_flag' ) );
		add_settings_field( 'execution', esc_html_x( 'Execution:', 'program execution options', 'video-embed-thumbnail-generator' ), 'kgvid_execution_options_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_settings', array( 'label_for' => 'threads' ) );
	}

	add_settings_field( 'test_ffmpeg', esc_html__( 'Test FFMPEG:', 'video-embed-thumbnail-generator' ), 'kgvid_test_ffmpeg_options_callback', 'video_embed_thumbnail_generator_settings', 'kgvid_video_embed_encode_test_settings' );
}
add_action( 'admin_init', 'kgvid_video_embed_options_init' );

function kgvid_generate_settings_select_html( $option_name, $options, $items, $class_attr = '', $onchange = '' ) {

	$selector_html = "<select id='" . esc_attr( $option_name ) . "' name='kgvid_video_embed_options[" . esc_attr( $option_name ) . "]'";
	if ( ! empty( $class_attr ) ) {
		$selector_html .= " class='" . esc_attr( $class_attr ) . "'";
	}
	if ( ! empty( $onchange ) ) {
		$selector_html .= " onchange='" . esc_attr( $onchange ) . "'";
	}
	$selector_html .= '>';
	foreach ( $items as $name => $value ) {
		$selector_html .= "<option value='" . esc_attr( $value ) . "'" . selected( $options[ $option_name ], $value, false ) . '>' . esc_html( $name ) . '</option>';
	}
	$selector_html .= '</select>';

	return $selector_html;
}

function kgvid_tooltip_html( $tooltip_text ) {

	$tooltip_html = "<span class='kgvid_tooltip wp-ui-text-highlight'><span class='kgvid_tooltip_classic'>" . $tooltip_text . '</span></span><br />';

	return $tooltip_html;
}

// callback functions generating HTML for the settings form

function kgvid_plugin_playback_settings_section_callback() {

	$options = kgvid_get_options();

	if ( $options['embeddable'] !== 'on' ) {
		$embed_disabled = true;
		if ( $options['overlay_embedcode'] === 'on' || $options['open_graph'] === 'on' ) {
			$options['overlay_embedcode'] = false;
			$options['open_graph']        = false;
			update_option( 'kgvid_video_embed_options', $options );
		}
	} else {
		$embed_disabled = false;
	}

	$players = array(
		'Video.js v7'                                   => 'Video.js v7',
		'Video.js v5 (' . esc_html__( 'deprecated', 'video-embed-thumbnail-generator' ) . ')' => 'Video.js',
		__( 'WordPress Default', 'video-embed-thumbnail-generator' ) => 'WordPress Default',
		__( 'None', 'video-embed-thumbnail-generator' ) => 'None',
	);

	$items = apply_filters( 'kgvid_available_video_players', $players );

	echo "<table class='form-table' id='table_kgvid_video_embed_embed_method'><tbody><tr valign='middle'><th scope='row'><label for='embed_method'>" . esc_html__( 'Video player:', 'video-embed-thumbnail-generator' ) . '</label></th><td>';
	echo wp_kses( kgvid_generate_settings_select_html( 'embed_method', $options, $items, 'affects_player', 'kgvid_hide_plugin_settings();' ), kgvid_allowed_html( 'admin' ) );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Video.js version 7 is the default player. You can also choose the WordPress Default Mediaelement.js player which may already be skinned to match your theme. Selecting "None" will disable all plugin-related CSS and JS on the front end.', 'video-embed-thumbnail-generator' ) ) );
	echo "</td></tr></tbody></table>\n";

	$sampleheight = intval( $options['height'] ) + 50;
	echo "<div class='kgvid_setting_nearvid' style='width:" . esc_attr( $options['width'] ) . "px;'>";
	echo "<div id='kgvid_above_sample_vid'>";
	echo "<span><input class='affects_player' " . checked( $options['overlay_title'], 'on', false ) . " id='overlay_title' name='kgvid_video_embed_options[overlay_title]' type='checkbox' /><label for='overlay_title'>" . esc_html__( 'Overlay video title', 'video-embed-thumbnail-generator' ) . '</label></span>';
	echo "<span><input class='affects_player' " . checked( $options['downloadlink'], 'on', false ) . " id='downloadlink' name='kgvid_video_embed_options[downloadlink]' type='checkbox' /> <label for='downloadlink'>" . esc_html__( 'Show download link', 'video-embed-thumbnail-generator' ) . '</label></span>';
	echo '<span><span>' . esc_html__( 'Sharing:', 'video-embed-thumbnail-generator' ) . '</span><br>';
	echo "<input class='affects_player' " . checked( $options['overlay_embedcode'], 'on', false ) . " id='overlay_embedcode' name='kgvid_video_embed_options[overlay_embedcode]' type='checkbox' " . disabled( $embed_disabled, true, false ) . "/> <label for='overlay_embedcode'>" . esc_html__( 'Embed code', 'video-embed-thumbnail-generator' ) . '</label><br>';
	echo "<input class='affects_player' " . checked( $options['twitter_button'], 'on', false ) . " id='twitter_button' name='kgvid_video_embed_options[twitter_button]' type='checkbox' onchange='kgvid_hide_plugin_settings();' /> <label for='twitter_button'>" . esc_html__( 'Twitter button', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Enter your Twitter username in the Video Sharing section below.', 'video-embed-thumbnail-generator' ) ) );
	echo "<input class='affects_player' " . checked( $options['facebook_button'], 'on', false ) . " id='facebook_button' name='kgvid_video_embed_options[facebook_button]' type='checkbox' /> <label for='facebook_button'>" . esc_html__( 'Facebook button', 'video-embed-thumbnail-generator' ) . '</label></span></div>';
	$iframeurl = site_url( '/' ) . '?videopack[enable]=true&videopack[sample]=true';
	echo "<iframe id='kgvid_samplevideo' style='border:2px;' src='" . esc_attr( $iframeurl ) . "' scrolling='no' width='" . esc_attr( $options['width'] ) . "' height='" . esc_attr( $sampleheight ) . "'></iframe>";
	echo "<div style='float:right;'><input class='affects_player' " . checked( $options['view_count'], 'on', false ) . " id='view_count' name='kgvid_video_embed_options[view_count]' type='checkbox' /> <label for='view_count'>" . esc_html__( 'Show view count', 'video-embed-thumbnail-generator' ) . '</label></div>';
	echo "<hr style='width:100%;'></div>\n\t";
}

function kgvid_plugin_settings_section_callback() { }

function kgvid_poster_callback() {
	$options = kgvid_get_options();
	echo "<input class='regular-text affects_player' id='poster' name='kgvid_video_embed_options[poster]' type='text' value='" . esc_attr( $options['poster'] ) . "' /> <button id='pick-thumbnail' class='button' type='button' data-choose='" . esc_html__( 'Choose a Thumbnail', 'video-embed-thumbnail-generator' ) . "' data-update='" . esc_attr__( 'Set as video thumbnail', 'video-embed-thumbnail-generator' ) . "' data-change='poster' onclick='kgvid_pick_image(this);'>" . esc_html__( 'Choose from Library', 'video-embed-thumbnail-generator' ) . "</button>\n\t";
}

function kgvid_endofvideooverlay_callback() {
	$options = kgvid_get_options();
	echo "<input class='affects_player' " . checked( $options['endofvideooverlaysame'], 'on', false ) . " id='endofvideooverlaysame' name='kgvid_video_embed_options[endofvideooverlaysame]' type='checkbox' /> <label for='endofvideooverlaysame'>" . esc_html__( 'Display thumbnail image again when video ends.', 'video-embed-thumbnail-generator' ) . '</label><br />';
	echo "<input class='regular-text affects_player' id='endofvideooverlay' name='kgvid_video_embed_options[endofvideooverlay]' " . disabled( $options['endofvideooverlaysame'], 'on', false ) . " type='text' value='" . esc_attr( $options['endofvideooverlay'] ) . "' /> <button id='pick-endofvideooverlay' class='button' type='button' data-choose='" . esc_attr__( 'Choose End of Video Image', 'video-embed-thumbnail-generator' ) . "' data-update='" . esc_attr__( 'Set as end of video image', 'video-embed-thumbnail-generator' ) . "' data-change='endofvideooverlay' onclick='kgvid_pick_image(this);'>" . esc_html__( 'Choose from Library', 'video-embed-thumbnail-generator' ) . '</button><br />';
	echo esc_html__( 'Display alternate image when video ends.', 'video-embed-thumbnail-generator' ) . "<small>\n\t";
}

function kgvid_watermark_callback() {
	$options = kgvid_get_options();
	echo esc_html__( 'Image:', 'video-embed-thumbnail-generator' ) . " <input class='regular-text affects_player' id='watermark' name='kgvid_video_embed_options[watermark]' type='text' value='" . esc_attr( $options['watermark'] ) . "' /> <button id='pick-watermark' class='button' type='button' data-choose='" . esc_attr__( 'Choose a Watermark', 'video-embed-thumbnail-generator' ) . "' data-update='" . esc_attr__( 'Set as watermark', 'video-embed-thumbnail-generator' ) . "' data-change='watermark' onclick='kgvid_pick_image(this);'>" . esc_html__( 'Choose from Library', 'video-embed-thumbnail-generator' ) . '</button><br />';
	echo esc_html__( 'Link to:', 'video-embed-thumbnail-generator' ) . ' ';
	$items = array(
		__( 'Home page', 'video-embed-thumbnail-generator' ) => 'home',
		__( 'Parent post', 'video-embed-thumbnail-generator' ) => 'parent',
		__( 'Video attachment page', 'video-embed-thumbnail-generator' ) => 'attachment',
		__( 'Download video', 'video-embed-thumbnail-generator' ) => 'download',
		__( 'Custom URL', 'video-embed-thumbnail-generator' ) => 'custom',
		__( 'None', 'video-embed-thumbnail-generator' ) => 'false',
	);

	echo wp_kses( kgvid_generate_settings_select_html( 'watermark_link_to', $options, $items, 'affects_player', 'kgvid_hide_watermark_url(this);' ), kgvid_allowed_html( 'admin' ) );
	echo "\n\t";
	echo ' <input ';
	if ( $options['watermark_link_to'] != 'custom' ) {
		echo "style='display:none;' ";
		$options['watermark_url'] = '';
	}
	echo "class='regular-text affects_player' id='watermark_url' name='kgvid_video_embed_options[watermark_url]' type='text' value='" . esc_attr( $options['watermark_url'] ) . "' />\n\t";
}

function kgvid_align_callback() {
	$options = kgvid_get_options();
	$items   = array(
		__( 'left', 'video-embed-thumbnail-generator' )   => 'left',
		__( 'center', 'video-embed-thumbnail-generator' ) => 'center',
		__( 'right', 'video-embed-thumbnail-generator' )  => 'right',
	);
	echo wp_kses( kgvid_generate_settings_select_html( 'align', $options, $items ), kgvid_allowed_html( 'admin' ) );
	echo "\n\t";
}

function kgvid_resize_callback() {
	$options       = kgvid_get_options();
	$video_formats = kgvid_video_formats();
	echo "<div id='resize_div'><input " . checked( $options['resize'], 'on', false ) . " id='resize' name='kgvid_video_embed_options[resize]' type='checkbox' /> <label for='resize'>" . esc_html__( 'Make video player responsive.', 'video-embed-thumbnail-generator' ) . '</label><br /></div>';
	$items = array(
		__( 'automatic', 'video-embed-thumbnail-generator' ) => 'automatic',
		__( 'highest', 'video-embed-thumbnail-generator' ) => 'highest',
		__( 'lowest', 'video-embed-thumbnail-generator' )  => 'lowest',
	);
	foreach ( $video_formats as $format => $format_stats ) {
		if ( $format_stats['type'] == 'h264' && ! empty( $format_stats['label'] ) ) {
			$items[ $format_stats['label'] ] = $format_stats['label'];
		}
	}
	echo esc_html__( 'Default playback resolution', 'video-embed-thumbnail-generator' ) . ' ';
	echo wp_kses( kgvid_generate_settings_select_html( 'auto_res', $options, $items, '', 'kgvid_hide_plugin_settings()' ), kgvid_allowed_html( 'admin' ) );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'If multiple H.264 resolutions for a video are available, you can choose to load the highest or lowest available resolution by default, automatically select the resolution based on the size of the video window, or indicate a particular resolution to use every time.', 'video-embed-thumbnail-generator' ) ) );
	echo "<p id='pixel_ratio_p'><input " . checked( $options['pixel_ratio'], 'on', false ) . " id='pixel_ratio' name='kgvid_video_embed_options[pixel_ratio]' type='checkbox' /><label for='pixel_ratio'>" . esc_html__( 'Use display pixel ratio for resolution calculation.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Most modern mobile devices and some very high-resolution desktop displays (what Apple calls a Retina display) use a pixel ratio to calculate the size of their viewport. Using the pixel ratio can result in a higher resolution being selected on mobile devices than on desktop devices. Because these devices actually have extremely high resolutions, and in a responsive design the video player usually takes up more of the screen than on a desktop browser, this is not a mistake, but your users might prefer to use less mobile data.', 'video-embed-thumbnail-generator' ) ) );
	echo "</p>\n\t";
}

function kgvid_dimensions_callback() {
	$options = kgvid_get_options();
	echo '<input ' . checked( $options['fullwidth'], 'on', false ) . " id='fullwidth' name='kgvid_video_embed_options[fullwidth]' type='checkbox' /> <label for='fullwidth'>" . esc_html__( 'Set all videos to expand to 100% of their containers.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Enabling this will ignore any other width settings and set the width of the video to the width of the container it\'s in.', 'video-embed-thumbnail-generator' ) ) );
	echo esc_html__( 'Default Width:', 'video-embed-thumbnail-generator' ) . " <input class='small-text affects_player' id='width' name='kgvid_video_embed_options[width]' type='text' value='" . esc_attr( $options['width'] ) . "' /> " . esc_html__( 'Height:', 'video-embed-thumbnail-generator' ) . " <input class='small-text affects_player' id='height' name='kgvid_video_embed_options[height]' type='text' value='" . esc_attr( $options['height'] ) . "' /><br />";
	$items  = array(
		__( 'no', 'video-embed-thumbnail-generator' )  => 'false',
		__( 'vertical', 'video-embed-thumbnail-generator' ) => 'vertical',
		__( 'all', 'video-embed-thumbnail-generator' ) => 'true',
	);
	$select = kgvid_generate_settings_select_html( 'fixed_aspect', $options, $items );
	/* translators: %s is html code for a drop-down select input */
	echo sprintf( esc_html__( 'Constrain %s videos to default aspect ratio.', 'video-embed-thumbnail-generator' ), wp_kses_post( $select ) );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'When set to "no," the video player will automatically adjust to the aspect ratio of the video, but in some cases a fixed aspect ratio is required, and vertical videos often fit better on the page when shown in a shorter window.', 'video-embed-thumbnail-generator' ) ) );
	echo '<input ' . checked( $options['minimum_width'], 'on', false ) . " id='minimum_width' name='kgvid_video_embed_options[minimum_width]' type='checkbox' /> <label for='minimum_width'>" . esc_html__( 'Enlarge lower resolution videos to max width.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Usually if a video\'s resolution is less than the max width, the video player is set to the actual width of the video. Enabling this will always set the same width regardless of the quality of the video. When necessary you can override by setting the dimensions manually.', 'video-embed-thumbnail-generator' ) ) );
	echo '<input ' . checked( $options['inline'], 'on', false ) . " id='inline' name='kgvid_video_embed_options[inline]' type='checkbox' /> <label for='inline'>" . esc_html__( 'Allow other content on the same line as the video.', 'video-embed-thumbnail-generator' ) . "</label>\n\t";
}

function kgvid_video_gallery_callback() {
	$options = kgvid_get_options();
	echo esc_html__( 'Maximum popup width:', 'video-embed-thumbnail-generator' ) . " <input class='small-text' id='gallery_width' name='kgvid_video_embed_options[gallery_width]' type='text' value='" . esc_attr( $options['gallery_width'] ) . "' /><br />";
	echo esc_html__( 'Thumbnail width:', 'video-embed-thumbnail-generator' ) . " <input class='small-text' id='gallery_thumb' name='kgvid_video_embed_options[gallery_thumb]' type='text' value='" . esc_attr( $options['gallery_thumb'] ) . "' /><br />";
	echo ' <input ' . checked( $options['gallery_thumb_aspect'], 'on', false ) . " id='gallery_thumb_aspect' name='kgvid_video_embed_options[gallery_thumb_aspect]' type='checkbox' /> <label for='gallery_thumb_aspect'>" . esc_html__( 'Constrain all gallery thumbnails to default video aspect ratio.', 'video-embed-thumbnail-generator' ) . '</label><br>';
	$items = array();
	$items = array(
		__( 'Stop, but leave popup window open', 'video-embed-thumbnail-generator' ) => '',
		__( 'Autoplay next video in the gallery', 'video-embed-thumbnail-generator' ) => 'next',
		__( 'Close popup window', 'video-embed-thumbnail-generator' ) => 'close',
	);
	echo wp_kses( kgvid_generate_settings_select_html( 'gallery_end', $options, $items ), kgvid_allowed_html( 'admin' ) );
	echo ' ' . esc_html__( 'when current gallery video finishes.', 'video-embed-thumbnail-generator' ) . '<br />';
	echo ' <input ' . checked( $options['gallery_pagination'], 'on', false ) . " id='gallery_pagination' name='kgvid_video_embed_options[gallery_pagination]' onchange='kgvid_hide_paginate_gallery_setting(this)' type='checkbox' /> <label for='gallery_pagination'>" . esc_html__( 'Paginate video galleries.', 'video-embed-thumbnail-generator' ) . '</label> ';
	echo '<span ';
	if ( $options['gallery_pagination'] != 'on' ) {
		echo "style='display:none;' ";
	}
	echo "id='gallery_per_page_span'><input class='small-text' id='gallery_per_page' name='kgvid_video_embed_options[gallery_per_page]' type='text' value='" . esc_attr( $options['gallery_per_page'] ) . "' /> " . esc_html__( 'videos per gallery page.', 'video-embed-thumbnail-generator' ) . '</span><br />';
	echo ' <input ' . checked( $options['gallery_title'], 'on', false ) . " id='gallery_title' name='kgvid_video_embed_options[gallery_title]' type='checkbox' /> <label for='gallery_title'>" . esc_html__( 'Show video title overlay on thumbnails.', 'video-embed-thumbnail-generator' ) . "</label>\n\t";
}

function kgvid_controls_callback() {
	$options = kgvid_get_options();

	echo "<input class='affects_player' " . checked( $options['controls'], 'on', false ) . " id='controls' name='kgvid_video_embed_options[controls]' type='checkbox' /> <label for='controls'>" . esc_html__( 'Enable player controls.', 'video-embed-thumbnail-generator' ) . "</label><br />\n\t";

	echo "<input class='affects_player' " . checked( $options['nativecontrolsfortouch'], 'on', false ) . " id='nativecontrolsfortouch' name='kgvid_video_embed_options[nativecontrolsfortouch]' type='checkbox' /> <label for='nativecontrolsfortouch'>" . esc_html__( 'Show native controls on mobile devices.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Disable Video.js styling and show the built-in video controls on mobile devices. This will disable the resolution selection button.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";

	echo "<input class='affects_player' " . checked( $options['autoplay'], 'on', false ) . " id='autoplay' name='kgvid_video_embed_options[autoplay]' type='checkbox' /> <label for='autoplay'>" . esc_html__( 'Autoplay.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Most browsers will only autoplay videos if the video starts muted.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";

	echo "<input class='affects_player' " . checked( $options['loop'], 'on', false ) . " id='loop' name='kgvid_video_embed_options[loop]' type='checkbox' /> <label for='loop'>" . esc_html__( 'Loop.', 'video-embed-thumbnail-generator' ) . "</label><br />\n\t";

	echo "<input class='affects_player' " . checked( $options['playsinline'], 'on', false ) . " id='playsinline' name='kgvid_video_embed_options[playsinline]' type='checkbox' /> <label for='playsinline'>" . esc_html__( 'Play inline on iPhones instead of fullscreen.', 'video-embed-thumbnail-generator' ) . "</label><br />\n\t";

	echo "<input class='affects_player' " . checked( $options['gifmode'], 'on', false ) . " id='gifmode' name='kgvid_video_embed_options[gifmode]' type='checkbox' /> <label for='gifmode'>" . esc_html__( 'GIF Mode.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Videos behave like animated GIFs. autoplay, muted, loop, and playsinline will be enabled. Controls and other overlays will be disabled.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";

	echo "<input class='affects_player' " . checked( $options['playback_rate'], 'on', false ) . " id='playback_rate' name='kgvid_video_embed_options[playback_rate]' type='checkbox' /> <label for='playback_rate'>" . esc_html__( 'Enable variable playback rates.', 'video-embed-thumbnail-generator' ) . "</label><br>\n\t";

	echo '<input ' . checked( $options['pauseothervideos'], 'on', false ) . " id='pauseothervideos' name='kgvid_video_embed_options[pauseothervideos]' type='checkbox' /> <label for='pauseothervideos'>" . esc_html__( 'Pause other videos on page when starting a new video.', 'video-embed-thumbnail-generator' ) . "</label><br />\n\t";

	$items = array();
	for ( $percent = 0; $percent <= 1.05; $percent = $percent + 0.05 ) {
		/* translators: %d%% is a percentage */
		$items[ sprintf( esc_html_x( '%d%%', 'a list of percentages. eg: 15%', 'video-embed-thumbnail-generator' ), round( $percent * 100 ) ) ] = strval( $percent );
	}
	echo esc_html__( 'Volume:', 'video-embed-thumbnail-generator' ) . ' ';
	echo wp_kses( kgvid_generate_settings_select_html( 'volume', $options, $items, 'affects_player' ), kgvid_allowed_html( 'admin' ) );
	echo "<input class='affects_player' " . checked( $options['muted'], 'on', false ) . " id='muted' name='kgvid_video_embed_options[muted]' type='checkbox' /> <label for='muted'>" . esc_html__( 'Muted.', 'video-embed-thumbnail-generator' ) . "</label><br />\n\t";

	$items = array(
		__( 'metadata', 'video-embed-thumbnail-generator' ) => 'metadata',
		__( 'auto', 'video-embed-thumbnail-generator' ) => 'auto',
		__( 'none', 'video-embed-thumbnail-generator' ) => 'none',
	);
	echo esc_html__( 'Preload:', 'video-embed-thumbnail-generator' ) . ' ';
	echo wp_kses( kgvid_generate_settings_select_html( 'preload', $options, $items, 'affects_player' ), kgvid_allowed_html( 'admin' ) );
	echo wp_kses_post( kgvid_tooltip_html( esc_html_x( 'Controls how much of a video to load before the user starts playback. Mobile browsers never preload any video information. Selecting "metadata" will load the height and width and format information along with a few seconds of the video in some desktop browsers. "Auto" will preload nearly a minute of video in most desktop browsers. "None" will prevent all data from preloading.', 'Suggest not translating the words in quotation marks', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
}

function kgvid_js_skin_callback() {
	$options = kgvid_get_options();
	/* translators: %s is '<code>kg-video-js</code>' */
	echo "<input class='regular-text code affects_player' id='js_skin' name='kgvid_video_embed_options[js_skin]' type='text' value='" . esc_attr( $options['js_skin'] ) . "' /><br /><em><small>" . sprintf( esc_html__( 'Use %s for a nice, circular play button. Leave blank for the default square play button.', 'video-embed-thumbnail-generator' ) . " <a href='https://codepen.io/heff/pen/EarCt'>" . esc_html__( 'Or build your own CSS skin.', 'video-embed-thumbnail-generator' ), '<code>kg-video-js-skin</code>' ) . "</a></small></em>\n\t";
}

function kgvid_custom_attributes_callback() {
	$options = kgvid_get_options();
	/* translators: %s is '<code>orderby="title" order="DESC" startparam="start"</code>' */
	echo "<input class='regular-text code affects_player' id='custom_attributes' name='kgvid_video_embed_options[custom_attributes]' type='text' value='" . esc_attr( $options['custom_attributes'] ) . "' /><br /><em><small>" . sprintf( esc_html__( 'Space-separated list to add to all videos. Example: %s', 'video-embed-thumbnail-generator' ), '<code>orderby="title" order="DESC" startparam="start"</code>' ) . "</small></em>\n\t";
}

function kgvid_security_callback() {
	$options = kgvid_get_options();

	if ( $options['embeddable'] !== 'on' ) {
		$embed_disabled = true;
	} else {
		$embed_disabled = false;
	}

	echo "<input class='affects_player' " . checked( $options['embeddable'], 'on', false ) . " id='embeddable' name='kgvid_video_embed_options[embeddable]' type='checkbox' onclick='kgvid_embeddable_switch(this.checked);' /> <label for='embeddable'>" . esc_html__( 'Allow users to embed your videos on other sites.', 'video-embed-thumbnail-generator' ) . '</label><br />';
	echo '<input ' . checked( $options['open_graph'], 'on', false ) . " id='open_graph' name='kgvid_video_embed_options[open_graph]' type='checkbox'";
	if ( $embed_disabled ) {
		echo " disabled='disabled' title='" . esc_attr__( 'Embedding disabled', 'video-embed-thumbnail-generator' ) . "'";
	}
	echo " /> <label for='open_graph'>" . esc_html_x( 'Enable Facebook Open Graph video tags.', '"Open Graph" is a proper noun and might not need translation', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Facebook and some other social media sites will use these tags to embed the first video in your post. Your video must be served via https in order to be embedded directly in Facebook and playback is handled by the unstyled built-in browser player. No statistics will be recorded for videos embedded this way and Open Graph tags generated by Jetpack will be disabled on pages with videos.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
	echo '<input ' . checked( $options['schema'], 'on', false ) . " id='schema' name='kgvid_video_embed_options[schema]' type='checkbox'";
	if ( $embed_disabled ) {
		echo " disabled='disabled' title='" . esc_attr__( 'Embedding disabled', 'video-embed-thumbnail-generator' ) . "'";
	}
	echo " /> <label for='schema'>" . esc_html__( 'Enable Schema.org structured data markup for search engines.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Helps your videos appear in video searches on Google, Yahoo, and Bing.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
	echo '<input ' . checked( $options['twitter_card'], 'on', false ) . " id='twitter_card' name='kgvid_video_embed_options[twitter_card]' type='checkbox'";
	if ( $embed_disabled ) {
		echo " disabled='disabled' title='" . esc_attr__( 'Embedding disabled', 'video-embed-thumbnail-generator' ) . "'";
	}
	echo " onchange='kgvid_hide_plugin_settings();' /> <label for='twitter_card'>" . esc_html__( 'Enable Twitter Cards.', 'video-embed-thumbnail-generator' ) . '</label>';
	/* translators: %1$s is an opening <a> tag and %2$s is a closing </a> tag */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'Generates metadata for "player" Twitter Cards that will show a thumbnail and playable video in Twitter. Disables Jetpack Twitter metadata on any page with a video. Your site must have https enabled and you must request whitelist approval for your site using the %1$sTwitter card validator%2$s. Don\'t worry if your player card doesn\'t render. Twitter will most likely approve your request.', 'video-embed-thumbnail-generator' ), '<a href="https://cards-dev.twitter.com/validator">', '</a>' ) ) );
	echo "\n\t";
	echo "<div id='twitter_username_div' style='margin:0px;'><input class='regular-text' id='twitter_username' style='width: 100px;' name='kgvid_video_embed_options[twitter_username]' type='text' value='" . esc_attr( $options['twitter_username'] ) . "' /> <label for='twitter_username'>" . esc_html__( 'Twitter username', 'video-embed-thumbnail-generator' ) . '</label></div>';
	echo "<input class='affects_player' " . checked( $options['right_click'], 'on', false ) . " id='right_click' name='kgvid_video_embed_options[right_click]' type='checkbox' /> <label for='right_click'>" . esc_html__( 'Allow right-clicking on videos.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'We can\'t prevent a user from simply saving the downloaded video file from the browser\'s cache, but disabling right-clicking will make it more difficult for casual users to save your videos.', 'video-embed-thumbnail-generator' ) ) );
	echo '<input ' . checked( $options['click_download'], 'on', false ) . " id='click_download' name='kgvid_video_embed_options[click_download]' type='checkbox' /> <label for='click_download'>" . esc_html__( 'Allow single-click download link for videos.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'The plugin creates a one-click method for users who want to allow easy video downloading, but if some of your videos are hidden or private, depending on the methods you use, someone who guesses a video\'s WordPress database ID could potentially use the method to download videos they might not otherwise have access to.', 'video-embed-thumbnail-generator' ) ) );
	echo '<input ' . checked( $options['oembed_provider'], 'on', false ) . " id='oembed_provider' name='kgvid_video_embed_options[oembed_provider]' type='checkbox'";
	if ( $embed_disabled ) {
		echo " disabled='disabled' title='" . esc_attr__( 'Embedding disabled', 'video-embed-thumbnail-generator' ) . "'";
	}
	echo " /> <label for='oembed_provider'>" . esc_html_x( 'Change oEmbed to video instead of WordPress default photo/excerpt.', '"oEmbed" is a proper noun and might not need translation', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Allows users of other websites to embed your videos using just the post URL rather than the full iframe embed code, much like Vimeo or YouTube. However, most social media sites (including Facebook & Twitter) will not show videos through oEmbed unless your link is https. In order to display the video properly, this will also remove some of the security features included in the built-in WordPress oEmbed system.', 'video-embed-thumbnail-generator' ) ) );
	echo '<input ' . checked( $options['oembed_security'], 'on', false ) . " id='oembed_security' name='kgvid_video_embed_options[oembed_security]' type='checkbox' /> <label for='oembed_security'>" . esc_html_x( 'Enable oEmbeds from unknown providers.', '"oEmbed" is a proper noun and might not need translation', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Allows your own users to embed content from any oEmbed provider. User must have the "unfiltered_html" capability which is limited to Administrators and Editors by default.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
}

function kgvid_performance_callback() {
	$options = kgvid_get_options();

	echo '<input ' . checked( $options['transient_cache'], 'on', false ) . " id='transient_cache' name='kgvid_video_embed_options[transient_cache]' type='checkbox' /> <label for='transient_cache'>" . esc_html__( 'Use experimental URL cache.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'The plugin uses an uncached query to convert URLs to WordPress post IDs which can signficantly slow down sites with large numbers of videos. Caching the results of the query as a transient in the database can speed up loading time significantly, but will also add a lot of entries to your database. All transients are deleted on plugin deactivation.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";

	echo "<p><button id='clear_transient_cache' class='button' type='button' onclick='kgvid_clear_transient_cache();'>" . esc_html__( 'Clear URL cache', 'video-embed-thumbnail-generator' ) . '</button>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( "Recommended if your site's URL has changed.", 'video-embed-thumbnail-generator' ) ) );
	echo '</p>';

	$items  = array(
		__( 'start, 25%, 50%, 75%, and complete', 'video-embed-thumbnail-generator' ) => 'quarters',
		__( 'start and complete', 'video-embed-thumbnail-generator' ) => 'start_complete',
		__( 'start', 'video-embed-thumbnail-generator' ) => 'start',
		__( 'no', 'video-embed-thumbnail-generator' )    => 'false',
	);
	$select = wp_kses( kgvid_generate_settings_select_html( 'count_views', $options, $items ), kgvid_allowed_html( 'admin' ) );
	/* translators: %s is a drop-down select input that has options like 'start and complete' or 'no' */
	echo sprintf( esc_html__( 'Record %s views in the WordPress database.', 'video-embed-thumbnail-generator' ), wp_kses_post( $select ) );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Recording views in the database requires writing to the database, which can overload a server getting a lot of views. To speed up page loading, only enable the level of view counting you need. If Google Analytics is loaded, quarter event tracking is always recorded because Google servers can handle it.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";

	echo '<input ' . checked( $options['alwaysloadscripts'], 'on', false ) . " id='alwaysloadscripts' name='kgvid_video_embed_options[alwaysloadscripts]' type='checkbox' /> <label for='alwaysloadscripts'>" . esc_html__( 'Always load plugin-related JavaScripts.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( "Usually the plugin's JavaScripts are only loaded if a video is present on the page. AJAX page loading can cause errors because the JavaScripts aren't loaded with the video content. Enabling this option will make sure the JavaScripts are always loaded.", 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
}

function kgvid_replace_video_shortcode_callback() {
	$options = kgvid_get_options();
	echo '<input ' . checked( $options['replace_video_shortcode'], 'on', false ) . " id='replace_video_shortcode' name='kgvid_video_embed_options[replace_video_shortcode]' type='checkbox' /> <label for='replace_video_shortcode'>" . esc_html__( 'Override any existing WordPress built-in "[video]" shortcodes.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( "If you have posts or theme files that make use of the built-in WordPress video shortcode, the plugin can override them with this plugin's embedded video player.", 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
}

function kgvid_rewrite_attachment_url_callback() {
	$options = kgvid_get_options();
	echo '<input ' . checked( $options['rewrite_attachment_url'], 'on', false ) . " id='rewrite_attachment_url' name='kgvid_video_embed_options[rewrite_attachment_url]' type='checkbox' /> <label for='rewrite_attachment_url'>" . esc_html__( 'Allow rewriting of WordPress attachment URLs.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'If your videos are hosted on a CDN, WordPress might return incorrect URLs for attachments in the Media Library. Disable this setting if the plugin is changing your URLs to local files instead of the CDN.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
}

function kgvid_generate_thumbs_callback() {
	$options = kgvid_get_options();
	echo "<input class='small-text' id='generate_thumbs' name='kgvid_video_embed_options[generate_thumbs]' maxlength='2' type='text' value='" . esc_attr( $options['generate_thumbs'] ) . "' />\n\t";
}

function kgvid_featured_callback() {
	$options = kgvid_get_options();
	echo '<input ' . checked( $options['featured'], 'on', false ) . " id='featured' name='kgvid_video_embed_options[featured]' type='checkbox' /> <label for='featured'>" . esc_html__( 'Set generated video thumbnails as featured images.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'If your theme uses the featured image meta tag, this will automatically set a video\'s parent post\'s featured image to the most recently saved thumbnail image.', 'video-embed-thumbnail-generator' ) ) );
	echo "<button class='button' type='button' onclick='kgvid_set_all_featured();'>" . esc_html_x( 'Set all as featured', 'implied "Set all thumbnails as featured"', 'video-embed-thumbnail-generator' ) . '</button>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'If you\'ve generated thumbnails before enabling this option, this will set all existing thumbnails as featured images. Be careful!', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
}

function kgvid_user_roles_callback( $page_scope = 'site' ) {
	$wp_roles = wp_roles();

	$options                 = kgvid_get_options();
	$capabilities_checkboxes = array();
	$capabilities            = array(
		'make_video_thumbnails'     => esc_html__( 'Can make thumbnails', 'video-embed-thumbnail-generator' ),
		'encode_videos'             => esc_html__( 'Can encode videos', 'video-embed-thumbnail-generator' ),
		'edit_others_video_encodes' => esc_html__( 'Can view & modify other users encoded videos', 'video-embed-thumbnail-generator' ),
	);
	foreach ( $capabilities as $capability => $capability_name ) {
		$capabilities_checkboxes[] = "<div class='kgvid_user_roles'><strong>" . $capability_name . ':</strong><br>';

		if ( is_object( $wp_roles ) && property_exists( $wp_roles, 'roles' ) ) {

			foreach ( $wp_roles->roles as $role => $role_info ) {

				$capability_enabled = false;
				if ( $page_scope === 'network' ) {
					$option_name = 'default_capabilities';
					if ( array_key_exists( 'default_capabilities', $options )
					&& array_key_exists( $capability, $options['default_capabilities'] )
					&& array_key_exists( $role, $options['default_capabilities'][ $capability ] )
					&& $options['default_capabilities'][ $capability ][ $role ] == 'on' ) {
						$capability_enabled = true;
					}
				} else {
					$option_name = 'capabilities';
					if ( is_array( $wp_roles->roles[ $role ]['capabilities'] ) && array_key_exists( $capability, $wp_roles->roles[ $role ]['capabilities'] )
					&& $wp_roles->roles[ $role ]['capabilities'][ $capability ] == 1 ) {
						$capability_enabled = true;
					}
				}
				$capabilities_checkboxes[] = "<input type='checkbox' " . checked( $capability_enabled, true, false ) . " id='capability-" . esc_attr( $capability ) . '-' . esc_attr( $role ) . "' name='kgvid_video_embed_options[" . esc_attr( $option_name ) . '][' . esc_attr( $capability ) . '][' . esc_attr( $role ) . "]'> <label for='capability-" . esc_attr( $capability ) . '-' . esc_attr( $role ) . "'>" . esc_html( translate_user_role( $role_info['name'] ) ) . '</label><br>';

			}//end foreach
		}//end if

		$capabilities_checkboxes[] = '</div>';

	}//end foreach
	echo wp_kses( implode( '', $capabilities_checkboxes ) . "\n\t", kgvid_allowed_html('admin') );
}

function kgvid_thumb_parent_callback() {
	$options = kgvid_get_options();
	$items   = array(
		__( 'post', 'video_embed_thumbnail_generator_settings' ) => 'post',
		__( 'video', 'video_embed_thumbnail_generator_settings' ) => 'video',
	);
	echo wp_kses( kgvid_generate_settings_select_html( 'thumb_parent', $options, $items ), kgvid_allowed_html( 'admin' ) );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'This depends on your theme. Thumbnails generated by the plugin can be saved as children of the video attachment or the post. Some themes use an image attached to a post instead of the built-in featured image meta tag. Version 3.x of this plugin saved all thumbnails as children of the video.', 'video-embed-thumbnail-generator' ) ) );
	echo "<button class='button' type='button' onclick='kgvid_switch_parents();'>" . esc_html__( 'Set all parents', 'video-embed-thumbnail-generator' ) . '</button>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'If you\'ve generated thumbnails before changing this option, this will set all existing thumbnails as children of your currently selected option.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
}

function kgvid_delete_children_callback() {
	$options = kgvid_get_options();
	$items   = array(
		__( 'none', 'video-embed-thumbnail-generator' ) => 'none',
		__( 'all', 'video-embed-thumbnail-generator' )  => 'all',
		__( 'encoded videos only', 'video-embed-thumbnail-generator' ) => 'encoded videos only',
	);
	echo wp_kses( kgvid_generate_settings_select_html( 'delete_children', $options, $items ), kgvid_allowed_html( 'admin' ) );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'If you delete the original video you can choose to delete all associated attachments (thumbnails & videos) or keep the thumbnail.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
}

function kgvid_titlecode_callback() {
	$options = kgvid_get_options();
	echo "<input class='regular-text code' id='titlecode' name='kgvid_video_embed_options[titlecode]' type='text' value='" . esc_attr( $options['titlecode'] ) . "' />";
	/* translators: %s is a list of sample HTML tags */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'HTML tag applied to titles inserted above the video. Examples: %s. Corresponding closing tags will be applied to the end of the title automatically.', 'video-embed-thumbnail-generator' ), "&lt;strong&gt;, &lt;em&gt;, &lt;H2&gt;, &lt;span class='videotitle'&gt;" ) ) );
	echo "\n\t";
}

function kgvid_template_callback() {
	$options = kgvid_get_options();
	$items   = array(
		__( 'Match plugin settings', 'video-embed-thumbnail-generator' ) => 'gentle',
		__( 'WordPress default', 'video-embed-thumbnail-generator' ) => 'none',
		__( 'Video only (deprecated)', 'video-embed-thumbnail-generator' ) => 'old',
	);
	echo wp_kses( kgvid_generate_settings_select_html( 'template', $options, $items ), kgvid_allowed_html( 'admin' ) );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'The plugin can filter your media attachment page to display videos using your chosen settings, or completely replace your attachment template to show only the video. If you were one of the few people using iframe embed codes before version 4.0 of this plugin then you should continue to use "Video only" but otherwise it\'s not recommended.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
}

function kgvid_encode_settings_section_callback() {
	if ( is_plugin_active_for_network( VIDEOPACK_BASENAME ) ) {
		$options = kgvid_get_options();
		echo "<input type='hidden' id='app_path' data-ffmpeg_exists='" . esc_attr( $options['ffmpeg_exists'] ) . "' name='kgvid_video_embed_options[app_path]' value='" . esc_attr( $options['app_path'] ) . "'>";
		echo "<input type='hidden' id='video_app' name='kgvid_video_embed_options[video_app]' value='" . esc_attr( strtoupper( $options['video_app'] ) ) . "'>";
	}
}

function kgvid_app_path_callback() {
	$options = kgvid_get_options();

	echo "<input class='affects_ffmpeg regular-text code' id='app_path' data-ffmpeg_exists='" . esc_attr( $options['ffmpeg_exists'] ) . "' name='kgvid_video_embed_options[app_path]' type='text' value='" . esc_attr( $options['app_path'] ) . "' />";
	/* translators: %1$s is the name of the video encoding application (usually FFMPEG). %2$s is '<code>/usr/local/bin</code>'. */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'This should be the folder where applications are installed on your server, not a direct path to an application, so it doesn\'t usually end with %1$s. Example: %2$s.', 'video-embed-thumbnail-generator' ), "<code><strong class='video_app_name'>" . esc_html( strtoupper( $options['video_app'] ) ) . '</strong></code>', '<code>/usr/local/bin</code>' ) ) );
	echo "\n\t";
}

function kgvid_video_app_callback() {
	$options = kgvid_get_options();

	$items = array(
		'FFMPEG' => 'ffmpeg',
		__( 'LIBAV (deprecated)', 'video_embed_thumbnail_generator_settings' ) => 'avconv',
	);
	echo wp_kses( kgvid_generate_settings_select_html( 'video_app', $options, $items, 'affects_ffmpeg', 'kgvid_hide_ffmpeg_settings();' ), kgvid_allowed_html( 'admin' ) );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'FFMPEG split into two separate branches in 2011. The new branch was called LIBAV and executed using "avconv" instead of "ffmpeg." The LIBAV project was later abandoned and Videopack will not be adding any new features to support it.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";
}

function kgvid_browser_thumbnails_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";
	/* translators: %s is the name of the video encoding application (usually FFMPEG). */
	echo '<input' . checked( $options['browser_thumbnails'], 'on', false ) . " id='browser_thumbnails' name='kgvid_video_embed_options[browser_thumbnails]' type='checkbox'" . disabled( empty( $options['ffmpeg_thumb_watermark']['url'] ), false, false ) . "/> <label for='browser_thumbnails'>" . sprintf( esc_html__( 'When possible, use the browser\'s built-in video capabilities to make thumbnails instead of %s.', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_attr( strtoupper( $options['video_app'] ) ) . '</strong>' ) . "</label>\n\t";
	echo '</div>';
}

function kgvid_encode_formats_callback() {
	$options       = kgvid_get_options();
	$video_formats = kgvid_video_formats( true, false );
	foreach ( $video_formats as $format => $format_stats ) {
		$items[ $format ] = $format_stats['name'];
	}
	$items['fullres'] = __( 'same resolution H.264', 'video-embed-thumbnail-generator' );
	$items['custom']  = __( 'Custom', 'video-embed-thumbnail-generator' );
	$items            = array_flip( $items );

	echo "<div class='kgvid_video_app_required'>";
	echo '<input ' . checked( is_array( $options['encode'] ) && array_key_exists( 'fullres', $options['encode'] ) && $options['encode']['fullres'] == 'on', true, false ) . " id='encode_fullres' name='kgvid_video_embed_options[encode][fullres]' type='checkbox' /> <label for='encode_fullres'>" . esc_html__( 'Replace original with', 'video-embed-thumbnail-generator' ) . ' ';
	echo wp_kses( kgvid_generate_settings_select_html( 'replace_format', $options, $items, 'affects_ffmpeg', 'kgvid_change_replace_format();' ), kgvid_allowed_html( 'admin' ) );

	echo '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'If you have FFMPEG/LIBAV and the proper libraries installed, you can choose to replace your uploaded video with your preferred format, and also transcode into several additional formats depending on the resolution of your original source. Different browsers have different playback capabilities. All desktop browsers can play H.264, and all modern mobile devices can play at least 360p H.264. If you create multiple H.264 resolutions, the highest resolution supported by the device will be served up automatically. The plugin will not upconvert your video, so if you upload a 720p video, it will not waste your time creating a 1080p version. There was a time when it seemed like a good idea to provide OGV or WEBM for some desktop browsers, but I no longer recommend encoding OGV or WEBM VP8. WEBM VP9 is a new technology and requires a version of FFMPEG or LIBAV newer than October 2013. Most browsers except Safari currently support it.', 'video-embed-thumbnail-generator' ) ) );

	if ( array_key_exists( 'fullres', $video_formats ) ) {
		unset( $video_formats['fullres'] );
	}
	if ( array_key_exists( 'custom', $video_formats ) ) {
		unset( $video_formats['custom'] );
	}

	foreach ( $video_formats as $format => $format_stats ) {
		echo '<input ' . checked( is_array( $options['encode'] ) && array_key_exists( $format, $options['encode'] ) && $options['encode'][ $format ] == 'on', true, false ) . " id='encode_" . esc_attr( $format ) . "' name='kgvid_video_embed_options[encode][" . esc_attr( $format ) . "]' type='checkbox' /> <label for='encode_" . esc_attr( $format ) . "'>" . esc_html( $format_stats['name'] ) . '</label><br />';
	}

	echo '<input ' . checked( is_array( $options['encode'] ) && array_key_exists( 'custom', $options['encode'] ), true, false ) . " id='encode_custom' name='kgvid_video_embed_options[encode][custom]' type='checkbox' /> <label for='encode_custom'>" . esc_html__( 'Custom', 'video-embed-thumbnail-generator' );
	$items = array(
		'H.264'    => 'h264',
		'WEBM VP8' => 'webm',
		'WEBM VP9' => 'vp9',
		'OGV'      => 'ogg',
	);
	echo " <select id='custom_format_type' name='kgvid_video_embed_options[custom_format][format]' class='affects_ffmpeg'>";
	foreach ( $items as $name => $value ) {
		echo "<option value='" . esc_attr( $value ) . "'" . selected( $options['custom_format']['format'], $value, false ) . '>' . esc_html( $name ) . '</option>';
	}
	echo '</select> ';
	echo "<small>Width: <input id='custom_format_width' name='kgvid_video_embed_options[custom_format][width]' class='small-text affects_ffmpeg kgvid_custom_format' value='" . esc_attr( $options['custom_format']['width'] ) . "' /> Height: <input id='custom_format_height' name='kgvid_video_embed_options[custom_format][height]' class='small-text affects_ffmpeg kgvid_custom_format' value='" . esc_attr( $options['custom_format']['height'] ) . "' /></small></label><br />";
	echo '<br><input ' . checked( $options['hide_video_formats'], 'on', false ) . " id='hide_video_formats' name='kgvid_video_embed_options[hide_video_formats]' type='checkbox' /> <label for='hide_video_formats'>" . esc_html__( 'Only show video formats selected above on attachment pages and encode queue.', 'video-embed-thumbnail-generator' );
	echo "</div>\n\t";
}

function kgvid_generate_auto_thumb_label() {
	// for localization and switching between 1 and many thumbnails
	$options = kgvid_get_options();
	if ( intval( $options['auto_thumb_number'] ) == 1 ) {
		$items             = array(
			'0'  => '0',
			'25' => '25',
			'50' => '50',
			'75' => '75',
		);
		$percentage_select = wp_kses( kgvid_generate_settings_select_html( 'auto_thumb_position', $options, $items ), kgvid_allowed_html( 'admin' ) );
	} else {
		$percentage_select = "<input id='auto_thumb_position' name='kgvid_video_embed_options[auto_thumb_position]' class='small-text' type='text' value='" . esc_attr( $options['auto_thumb_position'] ) . "' maxlength='3'>";
	}
	$auto_thumb_number_input = "<input id='auto_thumb_number' name='kgvid_video_embed_options[auto_thumb_number]' class='small-text' type='text' value='" . esc_attr( $options['auto_thumb_number'] ) . "' maxlength='3'>";
	/* translators: %1$s is a number. %2$s is a percentage if %1$s is 1 and a number if %1$s is greater than one */
	$code = sprintf( esc_html( _n( 'Generate %1$s thumbnail from %2$s%% of the way through the video.', 'Generate %1$s thumbnails and set #%2$s as the main image.', intval( $options['auto_thumb_number'] ), 'video-embed-thumbnail-generator' ) ), $auto_thumb_number_input, $percentage_select );

	return $code;
}

function kgvid_automatic_callback() {
	$options       = kgvid_get_options();
	$video_formats = kgvid_video_formats();

	echo "<div class='kgvid_video_app_required'>";
	echo '<input ' . checked( $options['auto_encode'], 'on', false ) . " id='auto_encode' name='kgvid_video_embed_options[auto_encode]' type='checkbox' /> <label for='auto_encode'>" . esc_html__( 'Encode formats selected above.', 'video-embed-thumbnail-generator' ) . '</label><br />';
	/* translators: %s is a video format */
	echo '<input ' . checked( $options['auto_encode_gif'], 'on', false ) . " id='auto_encode_gif' name='kgvid_video_embed_options[auto_encode_gif]' type='checkbox' /> <label for='auto_encode_gif'>" . sprintf( esc_html__( 'Convert animated GIFs to %s.', 'video-embed-thumbnail-generator' ), '<span class="kgvid_replace_format">' . esc_html( strtoupper( $video_formats['fullres']['type'] ) ) . '</span>' ) . '</label><br />';
	$auto_thumb_label = kgvid_generate_auto_thumb_label();
	echo '<input ' . checked( $options['auto_thumb'], 'on', false ) . " id='auto_thumb' name='kgvid_video_embed_options[auto_thumb]' type='checkbox' /> <label id='auto_thumb_label' for='auto_thumb'>" . wp_kses_post( $auto_thumb_label ) . ' </label><br>';
	echo "</div>\n\t";
}

function kgvid_automatic_completed_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";
	echo '<input ' . checked( $options['auto_publish_post'], 'on', false ) . " id='auto_publish_post' name='kgvid_video_embed_options[auto_publish_post]' type='checkbox' /> <label for='auto_publish_post'>" . esc_html__( "Publish video's parent post.", 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'If all videos in the encode queue attached to a draft post are completed, the draft post will be automatically published.', 'video-embed-thumbnail-generator' ) ) );
	echo "</div>\n\t";
}

function kgvid_old_video_buttons_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";
	echo "<p><button id='generate_old_thumbs_button' class='button' type='button' onclick='kgvid_auto_generate_old(\"thumbs\");'>" . esc_html__( 'Generate thumbnails', 'video-embed-thumbnail-generator' ) . '</button>';
	/* translators: %1$s is the name of the video encoding application (usually FFMPEG). */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'Use %s to automatically generate thumbnails for every video in the Media Library that doesn\'t already have them. Uses the automatic thumbnail settings above. This could take a very long time if you have a lot of videos. Proceed with caution!', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_html( strtoupper( $options['video_app'] ) ) . '</strong>' ) ) );
	echo "<p><button id='generate_old_encode_button' class='button' type='button' onclick='kgvid_auto_generate_old(\"encode\");'>" . esc_html__( 'Encode videos', 'video-embed-thumbnail-generator' ) . '</button>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Add every video in the Media Library to the encode queue if it hasn\'t already been encoded. Uses the default encode formats chosen above.', 'video-embed-thumbnail-generator' ) ) );
	echo "</div>\n\t";
}

function kgvid_error_email_callback() {
	$options          = kgvid_get_options();
	$authorized_users = array();
	echo "<div class='kgvid_video_app_required'>";

	if ( is_array( $options['capabilities'] && array_key_exists( 'edit_others_video_encodes', $options['capabilities'] ) ) ) {
		$users = get_users( array( 'role__in' => array_keys( $options['capabilities']['edit_others_video_encodes'] ) ) );
		if ( $users ) {
			$authorized_users = array();
			foreach ( $users as $user ) {
				$authorized_users[ $user->user_login ] = $user->ID;
			}
		}
	}
	$items = array_merge(
		array(
			__( 'Nobody', 'video-embed-thumbnail-generator' ) => 'nobody',
			__( 'User who initiated encoding', 'video-embed-thumbnail-generator' ) => 'encoder',
		),
		$authorized_users
	);
	echo wp_kses( kgvid_generate_settings_select_html( 'error_email', $options, $items ), kgvid_allowed_html( 'admin' ) );
	echo "</div>\n\t";
}

function kgvid_htaccess_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";
	echo "<table class='kgvid_htaccess'><tbody><tr><td>" . esc_html__( 'Username:', 'video-embed-thumbnail-generator' ) . "</td><td><input class='regular-text affects_ffmpeg' id='htaccess_login' name='kgvid_video_embed_options[htaccess_login]' type='text' value='" . esc_attr( $options['htaccess_login'] ) . "' /></td></tr>";
	echo '<tr><td>' . esc_html__( 'Password:', 'video-embed-thumbnail-generator' ) . "</td><td><input class='regular-text affects_ffmpeg' id='htaccess_password' name='kgvid_video_embed_options[htaccess_password]' type='text' value='" . esc_attr( $options['htaccess_password'] ) . "' />";
	/* translators: %1$s is the name of the video encoding application (usually FFMPEG). */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'If your videos are htaccess protected, %s will access them using these credentials.', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_attr( strtoupper( $options['video_app'] ) ) . '</strong>' ) ) );
	echo '</td></tr></tbody></table>';
	echo "</div>\n\t";
}

function kgvid_ffmpeg_thumb_watermark_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";
	echo "<p><input class='regular-text affects_ffmpeg_thumb_watermark' id='ffmpeg_thumb_watermark_url' name='kgvid_video_embed_options[ffmpeg_thumb_watermark][url]' type='text' value='" . esc_attr( $options['ffmpeg_thumb_watermark']['url'] ) . "' /> <span id='pick-ffmpeg-watermark' class='button' data-choose='" . esc_attr__( 'Choose a Watermark', 'video-embed-thumbnail-generator' ) . "' data-update='" . esc_attr__( 'Set as thumbnail watermark', 'video-embed-thumbnail-generator' ) . "' data-change='ffmpeg_thumb_watermark_url' onclick='kgvid_pick_image(this);'>" . esc_html__( 'Choose from Library', 'video-embed-thumbnail-generator' ) . "</span></p>\n\t";
	/* translators: %s%% is a percentage */
	echo '<p>' . sprintf( esc_html__( 'Scale: %s%% of video covered by the watermark.', 'video-embed-thumbnail-generator' ), "<input class='small-text affects_ffmpeg_thumb_watermark' id='ffmpeg_thumb_watermark_scale' name='kgvid_video_embed_options[ffmpeg_thumb_watermark][scale]' type='text' value='" . esc_attr( $options['ffmpeg_thumb_watermark']['scale'] ) . "' maxlength='3' />" ) . '</p>';
	$items = array(
		__( 'left', 'video-embed-thumbnail-generator' )  => 'left',
		_x( 'center', 'horizontal center', 'video-embed-thumbnail-generator' ) => 'center',
		__( 'right', 'video-embed-thumbnail-generator' ) => 'right',
	);
	echo '<p>' . esc_html__( 'Horizontal align:', 'video-embed-thumbnail-generator' );
	echo " <select id='ffmpeg_thumb_watermark_align' name='kgvid_video_embed_options[ffmpeg_thumb_watermark][align]' class='affects_ffmpeg_thumb_watermark'>";
	foreach ( $items as $name => $value ) {
		echo "<option value='" . esc_attr( $value ) . "'" . selected( $options['ffmpeg_thumb_watermark']['align'], $value, false ) . '>' . esc_html( $name ) . '</option>';
	}
	echo '</select> ';
	esc_html_e( 'offset', 'video-embed-thumbnail-generator' );
	echo " <input class='small-text affects_ffmpeg_thumb_watermark' id='ffmpeg_thumb_watermark_x' name='kgvid_video_embed_options[ffmpeg_thumb_watermark][x]' type='text' value='" . esc_attr( $options['ffmpeg_thumb_watermark']['x'] ) . "' maxlength='3' />%</p>";
	echo '<p>' . esc_html__( 'Vertical align:', 'video-embed-thumbnail-generator' );
	echo " <select id='ffmpeg_thumb_watermark_valign' name='kgvid_video_embed_options[ffmpeg_thumb_watermark][valign]' class='affects_ffmpeg_thumb_watermark'>";
	$items = array(
		__( 'top', 'video-embed-thumbnail-generator' )    => 'top',
		_x( 'center', 'vertical center', 'video-embed-thumbnail-generator' ) => 'center',
		__( 'bottom', 'video-embed-thumbnail-generator' ) => 'bottom',
	);
	foreach ( $items as $name => $value ) {
		echo "<option value='" . esc_attr( $value ) . "'" . selected( $options['ffmpeg_thumb_watermark']['valign'], $value, false ) . '>' . esc_html( $name ) . '</option>';
	}
	echo '</select> ';
	esc_html_e( 'offset', 'video-embed-thumbnail-generator' );
	echo " <input class='small-text affects_ffmpeg_thumb_watermark' id='ffmpeg_thumb_watermark_y' name='kgvid_video_embed_options[ffmpeg_thumb_watermark][y]' type='text' value='" . esc_attr( $options['ffmpeg_thumb_watermark']['y'] ) . "' maxlength='3' />%";
	echo "</p>\n\t";
	echo "<div id='ffmpeg_thumb_watermark_example'></div>";
	echo "</div>\n\t";
}

function kgvid_ffmpeg_watermark_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";
	echo "<p><input class='regular-text affects_ffmpeg' id='ffmpeg_watermark_url' name='kgvid_video_embed_options[ffmpeg_watermark][url]' type='text' value='" . esc_attr( $options['ffmpeg_watermark']['url'] ) . "' /> <span id='pick-ffmpeg-watermark' class='button' data-choose='" . esc_attr__( 'Choose a Watermark', 'video-embed-thumbnail-generator' ) . "' data-update='" . esc_attr__( 'Set as watermark', 'video-embed-thumbnail-generator' ) . "' data-change='ffmpeg_watermark_url' onclick='kgvid_pick_image(this);'>" . esc_html__( 'Choose from Library', 'video-embed-thumbnail-generator' ) . "</span></p>\n\t";
	/* translators: %s%% is a percentage */
	echo '<p>' . sprintf( esc_html__( 'Scale: %s%% of video covered by the watermark.', 'video-embed-thumbnail-generator' ), "<input class='small-text affects_ffmpeg' id='ffmpeg_watermark_scale' name='kgvid_video_embed_options[ffmpeg_watermark][scale]' type='text' value='" . esc_attr( $options['ffmpeg_watermark']['scale'] ) . "' maxlength='3' />" ) . '</p>';
	$items = array(
		__( 'left', 'video-embed-thumbnail-generator' )  => 'left',
		_x( 'center', 'horizontal center', 'video-embed-thumbnail-generator' ) => 'center',
		__( 'right', 'video-embed-thumbnail-generator' ) => 'right',
	);
	echo '<p>' . esc_html__( 'Horizontal align:', 'video-embed-thumbnail-generator' );
	echo " <select id='ffmpeg_watermark_align' name='kgvid_video_embed_options[ffmpeg_watermark][align]' class='affects_ffmpeg'>";
	foreach ( $items as $name => $value ) {
		echo "<option value='" . esc_attr( $value ) . "'" . selected( $options['ffmpeg_watermark']['align'], $value, false ) . '>' . esc_html( $name ) . '</option>';
	}
	echo '</select> ';
	esc_html_e( 'offset', 'video-embed-thumbnail-generator' );
	echo " <input class='small-text affects_ffmpeg' id='ffmpeg_watermark_x' name='kgvid_video_embed_options[ffmpeg_watermark][x]' type='text' value='" . esc_attr( $options['ffmpeg_watermark']['x'] ) . "' maxlength='3' />%</p>";
	echo '<p>' . esc_html__( 'Vertical align:', 'video-embed-thumbnail-generator' );
	echo " <select id='ffmpeg_watermark_valign' name='kgvid_video_embed_options[ffmpeg_watermark][valign]' class='affects_ffmpeg'>";
	$items = array(
		__( 'top', 'video-embed-thumbnail-generator' )    => 'top',
		_x( 'center', 'vertical center', 'video-embed-thumbnail-generator' ) => 'center',
		__( 'bottom', 'video-embed-thumbnail-generator' ) => 'bottom',
	);
	foreach ( $items as $name => $value ) {
		$selected = ( $options['ffmpeg_watermark']['valign'] == $value ) ? 'selected="selected"' : '';
		echo "<option value='" . esc_attr( $value ) . "'" . selected( $options['ffmpeg_watermark']['valign'], $value, false ) . '>' . esc_html( $name ) . '</option>';
	}
	echo '</select> ';
	esc_html_e( 'offset', 'video-embed-thumbnail-generator' );
	echo " <input class='small-text affects_ffmpeg' id='ffmpeg_watermark_y' name='kgvid_video_embed_options[ffmpeg_watermark][y]' type='text' value='" . esc_attr( $options['ffmpeg_watermark']['y'] ) . "' maxlength='3' />%";
	echo "</p>\n\t";
	echo "<div id='ffmpeg_watermark_example'></div>";
	echo "</div>\n\t";
}

function kgvid_moov_callback() {
	$options = kgvid_get_options();
	if ( empty( $options['moov_path'] ) ) {
		$options['moov_path'] = $options['app_path'];
	}
	echo "<div class='kgvid_video_app_required'>";
	$items = array(
		__( 'none', 'video-embed-thumbnail-generator' ) => 'none',
		'movflags faststart'                            => 'movflag',
		'qt-faststart'                                  => 'qt-faststart',
		'MP4Box'                                        => 'MP4Box',
	);
	echo wp_kses( kgvid_generate_settings_select_html( 'moov', $options, $items, 'affects_ffmpeg', 'kgvid_moov_setting();' ), kgvid_allowed_html( 'admin' ) );
	/* translators: %1$s is the name of the video encoding application (usually FFMPEG). */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'By default %1$s places moov atoms at the end of H.264 encoded files, which forces the entire file to download before playback can start and can prevent Flash players from playing them at all. Since approximately October 2012 %1$s can fix the problem at the end of the encoding process by using the option `movflags faststart`. This is the easiest and fastest way to correct the problem, but older versions of %1$s will not work if you select the movflags option. If you can\'t update to a new version of %1$s, select qt-faststart or MP4Box which will run after encoding is finished if they are installed on your server.', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_html( strtoupper( $options['video_app'] ) ) . '</strong>' ) ) );
	/* translators: %1$s is the name of the video encoding application (usually FFMPEG). */
	echo "<p id='moov_path_p'>" . sprintf( esc_html__( 'Path to %s:', 'video-embed-thumbnail-generator' ), "<span class='kgvid_moov_option'>" . esc_html( $options['moov'] ) . '</span>' ) . " <input class='regular-text code affects_ffmpeg' id='moov_path' name='kgvid_video_embed_options[moov_path]' type='text' value='" . esc_attr( $options['moov_path'] ) . "' /></p>";
	echo "</div>\n\t";
}

function kgvid_rate_control_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";

	$items = array(
		__( 'Constant Rate Factor', 'video-embed-thumbnail-generator' ) => 'crf',
		__( 'Average Bit Rate', 'video-embed-thumbnail-generator' ) => 'abr',
	);
	echo wp_kses( kgvid_generate_settings_select_html( 'rate_control', $options, $items, 'affects_ffmpeg', 'kgvid_hide_ffmpeg_settings();' ), kgvid_allowed_html( 'admin' ) );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Constant Rate Factor (CRF) attempts to maintain a particular quality output for the entire video and only uses bits the encoder determines are necessary. Average Bit Rate is similar to the method used in older versions of this plugin. If CRF is selected, WEBM encoding will also use the ABR setting to set a max bit rate 25% higher than the ABR. Without a max bit rate setting WEBM files are terrible quality. VP9 CRF and bitrates are set using a formula based on resolution that approximates <a href="https://developers.google.com/media/vp9/bitrate-modes/">Google\'s recommended VOD values</a>.', 'video-embed-thumbnail-generator' ) ) );
	echo "</div>\n\t";
}

function kgvid_CRF_options_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";
	for ( $i = 0; $i <= 51; $i++ ) {
		$items[ $i ] = $i;
	}
	echo wp_kses( kgvid_generate_settings_select_html( 'h264_CRF', $options, $items, 'affects_ffmpeg' ), kgvid_allowed_html( 'admin' ) );
	echo ' H.264';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Lower values are higher quality. 18 is considered visually lossless. Default is 23.', 'video-embed-thumbnail-generator' ) ) );

	$items = array();
	for ( $i = 4; $i <= 63; $i++ ) {
		$items[ $i ] = $i;
	}
	echo wp_kses( kgvid_generate_settings_select_html( 'webm_CRF', $options, $items, 'affects_ffmpeg' ), kgvid_allowed_html( 'admin' ) );
	echo ' WEBM VP8';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Lower values are higher quality. Default is 10.', 'video-embed-thumbnail-generator' ) ) );
	echo "\n\t";

	$items = array();
	for ( $i = 1; $i <= 10; $i++ ) {
		$items[ $i ] = $i;
	}
	echo wp_kses( kgvid_generate_settings_select_html( 'ogv_CRF', $options, $items, 'affects_ffmpeg' ), kgvid_allowed_html( 'admin' ) );
	echo ' OGV (qscale)';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Higher values are higher quality. Default is 6.', 'video-embed-thumbnail-generator' ) ) );
	echo "</div>\n\t";
}

function kgvid_average_bitrate_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";
	for ( $i = 0.01; $i <= 0.31; $i = $i + 0.01 ) {
		$items[ strval( $i ) ] = strval( $i );
	}
	echo wp_kses( kgvid_generate_settings_select_html( 'bitrate_multiplier', $options, $items, 'affects_ffmpeg', 'kgvid_set_bitrate_display();' ), kgvid_allowed_html( 'admin' ) );
	echo ' ' . esc_html__( 'bits per pixel.', 'video-embed-thumbnail-generator' );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Default is 0.1', 'video-embed-thumbnail-generator' ) ) );
	echo "<span class='kgvid_gray_text'>1080p = <span id='1080_bitrate'>" . esc_html( round( floatval( $options['bitrate_multiplier'] ) * 1920 * 1080 * 30 / 1024 ) ) . '</span> kbps<br />';
	echo "720p = <span id='720_bitrate'>" . esc_html( round( floatval( $options['bitrate_multiplier'] ) * 1280 * 720 * 30 / 1024 ) ) . '</span> kbps<br />';
	echo "360p = <span id='360_bitrate'>" . esc_html( round( floatval( $options['bitrate_multiplier'] ) * 640 * 360 * 30 / 1024 ) ) . '</span> kbps</span>';
	echo "</div>\n\t";
}

function kgvid_h264_profile_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";
	$items = array(
		__( 'none', 'video-embed-thumbnail-generator' ) => 'none',
		'baseline'                                      => 'baseline',
		'main'                                          => 'main',
		'high'                                          => 'high',
		'high10'                                        => 'high10',
		'high422'                                       => 'high422',
		'high444'                                       => 'high444',
	);
	echo wp_kses( kgvid_generate_settings_select_html( 'h264_profile', $options, $items, 'affects_ffmpeg' ), kgvid_allowed_html( 'admin' ) );
	echo ' ' . esc_html_x( 'profile', 'H.264 profile. Might not need translation', 'video-embed-thumbnail-generator' );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Lower profiles will slightly increase file sizes. This mostly depends on your need for compatability with Android devices. Main profile seems to work on all recent phones. High profile is not recommended for mobile or Flash compatibility, and anything above high is designed for professional video and probably incompatible with consumer devices. Older versions of FFMPEG might ignore this setting altogether.', 'video-embed-thumbnail-generator' ) ) );
	$items = array(
		__( 'none', 'video-embed-thumbnail-generator' ) => 'none',
		'1'                                             => '1',
		'1.1'                                           => '1.1',
		'1.2'                                           => '1.2',
		'1.3'                                           => '1.3',
		'2'                                             => '2',
		'2.1'                                           => '2.1',
		'2.2'                                           => '2.2',
		'3'                                             => '3',
		'3.1'                                           => '3.1',
		'3.2'                                           => '3.2',
		'4'                                             => '4',
		'4.1'                                           => '4.1',
		'4.2'                                           => '4.2',
		'5'                                             => '5',
		'5.1'                                           => '5.1',
	);
	echo wp_kses( kgvid_generate_settings_select_html( 'h264_level', $options, $items, 'affects_ffmpeg' ), kgvid_allowed_html( 'admin' ) );
	echo ' ' . esc_html_x( 'level', 'H.264 level. Might not need translation', 'video-embed-thumbnail-generator' );
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( '3.0 is default. Lower levels will lower maximum bit rates and decoding complexity. This mostly depends on your need for compatability with mobile devices. Older versions of FFMPEG might ignore this setting altogether.', 'video-embed-thumbnail-generator' ) ) );
	echo "</div>\n\t";
}

function kgvid_audio_options_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";
	$items = array( 32, 64, 96, 112, 128, 160, 192, 224, 256, 320 );
	$items = array_combine( $items, $items ); // copy keys to values
	echo wp_kses( kgvid_generate_settings_select_html( 'audio_bitrate', $options, $items, 'affects_ffmpeg' ), kgvid_allowed_html( 'admin' ) );
	echo ' kbps<br />';
	echo "<input class='affects_ffmpeg' " . checked( $options['audio_channels'], 'on', false ) . " id='audio_channels' name='kgvid_video_embed_options[audio_channels]' type='checkbox' /> <label for='audio_channels'>" . esc_html__( 'Always output stereo audio.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo "</div>\n\t";
}

function kgvid_ffmpeg_options_callback() {
	$options = kgvid_get_options();
	echo "<div class='kgvid_video_app_required'>";
	echo "<input class='affects_ffmpeg' onchange='if(jQuery(\"#ffmpeg_vpre\").attr(\"checked\")==\"checked\"){jQuery(\"#video_bitrate_flag\").attr(\"checked\", \"checked\"); jQuery(\"#nostdin\").removeAttr(\"checked\");}' " . checked( $options['video_bitrate_flag'], 'on', false ) . " id='video_bitrate_flag' name='kgvid_video_embed_options[video_bitrate_flag]' type='checkbox' /> <label for='video_bitrate_flag'>" . esc_html__( 'Enable legacy FFMPEG "-b" and "-ba" bitrate flags.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Enable if your installed version of FFMPEG is old enough that you can\'t use the newer -b:v flags. It may cause newer versions of FFMPEG to fail.', 'video-embed-thumbnail-generator' ) ) );
	echo "<input class='affects_ffmpeg' onchange='if(jQuery(\"#ffmpeg_vpre\").attr(\"checked\")==\"checked\"){jQuery(\"#video_bitrate_flag\").attr(\"checked\", \"checked\"); jQuery(\"#nostdin\").removeAttr(\"checked\");}' " . checked( $options['ffmpeg_vpre'], 'on', false ) . " id='ffmpeg_vpre' name='kgvid_video_embed_options[ffmpeg_vpre]' type='checkbox' /> <label for='ffmpeg_vpre'>" . esc_html__( 'Enable legacy libx264 parameters.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Enable if your installed version of FFMPEG is old enough that libx264 requires additional configuration to operate. This should help if you can encode WEBM or OGV files but H264/Mobile files fail. It could cause newer versions of FFMPEG to fail.', 'video-embed-thumbnail-generator' ) ) );
	echo "<input class='affects_ffmpeg' " . checked( $options['ffmpeg_auto_rotate'], 'on', false ) . " id='ffmpeg_auto_rotate' name='kgvid_video_embed_options[ffmpeg_auto_rotate]' type='checkbox' /> <label for='ffmpeg_auto_rotate'>" . esc_html__( 'Enable automatic FFMPEG rotation.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Recent versions of FFMPEG will automatically rotate mobile videos when necessary. Disable if your version of FFMPEG is old enough that vertical videos don\'t rotate correctly.', 'video-embed-thumbnail-generator' ) ) );
	echo "<input class='affects_ffmpeg' " . checked( $options['ffmpeg_old_rotation'], 'on', false ) . " id='ffmpeg_old_rotation' name='kgvid_video_embed_options[ffmpeg_old_rotation]' type='checkbox' /> <label for='ffmpeg_old_rotation'>" . esc_html__( 'Enable legacy FFMPEG rotation method.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Enable if vertical videos shot on mobile devices don\'t rotate correctly or generate errors. If legacy libx264 paramaters are necessary, rotation won\'t work at all.', 'video-embed-thumbnail-generator' ) ) );
	echo "<input class='affects_ffmpeg' " . checked( $options['nostdin'], 'on', false ) . " id='nostdin' name='kgvid_video_embed_options[nostdin]' type='checkbox' /> <label for='nostdin'>" . esc_html__( 'Disable stdin.', 'video-embed-thumbnail-generator' ) . '</label>';
	echo wp_kses_post( kgvid_tooltip_html( esc_html__( 'Turn off this checkbox if your installed version of FFMPEG is old enough that it does not recognize the nostdin flag.', 'video-embed-thumbnail-generator' ) ) );
	echo "</div>\n\t";
}

function kgvid_execution_options_callback() {
	$options = kgvid_get_options();

	echo "<div class='kgvid_video_app_required'>";
	for ( $i = 1; $i <= 5; $i++ ) {
		$items[ $i ] = $i;
	}
	echo wp_kses( kgvid_generate_settings_select_html( 'simultaneous_encodes', $options, $items ), kgvid_allowed_html( 'admin' ) );
	echo ' ' . esc_html__( 'Simultaneous encodes.', 'video-embed-thumbnail-generator' );
	/* translators: %1$s is the name of the video encoding application (usually FFMPEG). */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'Increasing the number will allow %1$s to encode more than one file at a time, but may lead to %1$s monopolizing system resources.', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_html( strtoupper( $options['video_app'] ) ) . '</strong>' ) ) );

	$items = array(); // reset items before iterating again
	for ( $i = 0; $i <= 16; $i++ ) {
		$items[ $i ] = $i;
	}
	echo wp_kses( kgvid_generate_settings_select_html( 'threads', $options, $items, 'affects_ffmpeg' ), kgvid_allowed_html( 'admin' ) );
	echo ' ' . esc_html_x( 'threads', 'CPU threads. Might not need translating', 'video-embed-thumbnail-generator' );
	/* translators: %1$s is the name of the video encoding application (usually FFMPEG). */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'Default is 1, which limits encoding speed but prevents encoding from using too many system resources. Selecting 0 will allow %1$s to optimize the number of threads or you can set the number manually. This may lead to %1$s monopolizing system resources.', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_html( strtoupper( $options['video_app'] ) ) . '</strong>' ) ) );

	echo '<input ' . checked( $options['nice'], 'on', false ) . " id='nice' name='kgvid_video_embed_options[nice]' class='affects_ffmpeg' type='checkbox' /> <label for='nice'>" . esc_html_x( 'Run', 'execute program', 'video-embed-thumbnail-generator' ) . '  <code>nice</code>.</label>';
	/* translators: %1$s is the name of the video encoding application (usually FFMPEG). */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'Tells %1$s to run at a lower priority to avoid monopolizing system resources.', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_html( strtoupper( $options['video_app'] ) ) . '</strong>' ) ) );
	echo '</div>';
}

function kgvid_test_ffmpeg_options_callback( $scope = 'site' ) {

	$options       = kgvid_get_options();
	$video_formats = kgvid_video_formats( false, false );
	$encode_array  = array();

	if ( $options['ffmpeg_exists'] == 'on' ) {

		if ( ! isset( $video_formats[ $options['sample_format'] ] ) ) {
			$options['sample_format'] = 'mobile';
			update_option( 'kgvid_video_embed_options', $options );
		}

		$movie_info = kgvid_get_video_dimensions( plugin_dir_path( __DIR__ ) . 'images/sample-video-h264.mp4' );

		if ( $movie_info['worked'] ) {

			$uploads = wp_upload_dir();

			$encode_dimensions = kgvid_set_encode_dimensions( $movie_info, $video_formats[ $options['sample_format'] ] );
			if ( empty( $options['sample_rotate'] ) ) {
				$input = plugin_dir_path( __DIR__ ) . 'images/sample-video-h264.mp4';
			} else {
				$input = plugin_dir_path( __DIR__ ) . 'images/sample-video-rotated-h264.mp4';
			}
			$encode_array = kgvid_generate_encode_array( $input, $uploads['path'] . '/sample-video-h264' . $video_formats[ $options['sample_format'] ]['suffix'], $movie_info, $options['sample_format'], $encode_dimensions['width'], $encode_dimensions['height'], intval( $options['sample_rotate'] ) );
			$encode_array = kgvid_generate_encode_array( $input, $uploads['path'] . '/sample-video-h264' . $video_formats[ $options['sample_format'] ]['suffix'], $movie_info, $options['sample_format'], $encode_dimensions['width'], $encode_dimensions['height'], intval( $options['sample_rotate'] ) );

		} else {
			$options['ffmpeg_exists'] = false;
		}
	}//end if

	if ( ! empty( $encode_array ) && is_array( $encode_array ) ) {
		$encode_string_implode = implode( ' ', $encode_array );
	} else {
		$encode_string_implode = '';
	}

	$display_div = '';
	if ( $options['ffmpeg_exists'] != 'on' ) {
		$display_div = " style='display:none;'";
	}

	$video_formats['fullres']['name'] = esc_html__( 'Replace', 'video-embed-thumbnail-generator' );
	if ( array_key_exists( 'custom', $video_formats )
	&& array_key_exists( 'name', $video_formats['custom'] )
	) {
		$video_formats['custom']['name'] = esc_html__( 'Custom', 'video-embed-thumbnail-generator' );
	}

	$sample_format_select = "<select id='sample_format' name='kgvid_video_embed_options[sample_format]' class='affects_ffmpeg'>";
	foreach ( $video_formats as $format => $format_stats ) {
		$sample_format_select .= "<option value='" . esc_attr( $format ) . "'" . selected( $options['sample_format'], $format, false ) . '>' . esc_html( $format_stats['name'] ) . '</option>';
	}
	$sample_format_select .= '</select>';
	/* translators: %1$s is the name of the video encoding application (usually FFMPEG). */
	echo "<div id='ffmpeg_sample_div'" . esc_attr( $display_div ) . '><p>' . sprintf( esc_html__( 'Sample %2$s encode command', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_html( strtoupper( $options['video_app'] ) ) . '</strong>', wp_kses_post( $sample_format_select ) ) . '<br>';
	echo '<input ' . checked( $options['sample_rotate'], 90, false ) . " id='sample_rotate' name='kgvid_video_embed_options[sample_rotate]' class='affects_ffmpeg affects_ffmpeg_thumb_watermark' value='90' type='checkbox' /> <label for='sample_rotate'>" . esc_html__( 'Test video rotation.', 'video-embed-thumbnail-generator' ) . '</label>';
	/* translators: %1$s\'s is the name of the video encoding application (usually FFMPEG's). */
	echo wp_kses_post( kgvid_tooltip_html( sprintf( esc_html__( 'Tests %1$s\'s ability to rotate vertical videos shot on mobile devices.', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_html( strtoupper( $options['video_app'] ) ) . '</strong>' ) ) );
	echo "<textarea id='ffmpeg_h264_sample' class='ffmpeg_sample_code code' cols='100' rows='5' wrap='soft' readonly='yes'>" . esc_textarea( $encode_string_implode ) . '</textarea></p>';
	/* translators: %1$s is the name of the video encoding application (usually FFMPEG). */
	echo '<p>' . sprintf( esc_html__( '%s test output:', 'video-embed-thumbnail-generator' ), "<strong class='video_app_name'>" . esc_html( strtoupper( $options['video_app'] ) ) . '</strong>' ) . "<br /><textarea id='ffmpeg_output' class='ffmpeg_sample_code code' cols='100' rows='20' wrap='soft' readonly='yes'></textarea><br>" . sprintf( esc_html__( 'For help interpreting this output, %stry our Wiki page on Github', 'video-embed-thumbnail-generator' ), "<a href='https://github.com/kylegilman/video-embed-thumbnail-generator/wiki/Interpreting-FFMPEG-or-LIBAV-messages'>" ) . "</a>.</p></div>\n\t";
}

// end of settings page callback functions

function kgvid_init_plugin() {

	global $wpdb;

	load_plugin_textdomain( 'video-embed-thumbnail-generator', false, dirname( VIDEOPACK_BASENAME ) . '/languages' );

	if ( is_videopack_active_for_network() ) {

		$network_options = get_site_option( 'kgvid_video_embed_network_options' );

		if ( ! is_array( $network_options ) ) { // if the network options haven't been set yet

			switch_to_blog( 1 );
			$options         = get_option( 'kgvid_video_embed_options' );
			$network_options = kgvid_default_network_options();
			if ( is_array( $options ) ) {
				$network_options                         = array_intersect_key( $network_options, $options ); // copy options from main blog to network
				$network_options['default_capabilities'] = $options['capabilities'];
				if ( ! array_key_exists( 'simultaneous_encodes', $network_options ) ) {
					$network_options['simultaneous_encodes'] = 1;
				}
			}
			restore_current_blog();

			if ( ! isset( $network_options['ffmpeg_exists'] ) || $network_options['ffmpeg_exists'] == 'notchecked' ) {
				$ffmpeg_info = kgvid_check_ffmpeg_exists( $network_options, false );
				if ( $ffmpeg_info['ffmpeg_exists'] == true ) {
					$network_options['ffmpeg_exists'] = 'on';
				}
				$network_options['app_path'] = $ffmpeg_info['app_path'];
			}
			update_site_option( 'kgvid_video_embed_network_options', $network_options );

		}//end setting initial network options
		else { // network options introduced in version 4.3 exist already

			$network_options_old = $network_options;

			if ( ! array_key_exists( 'superadmin_only_ffmpeg_settings', $network_options ) ) {
				$default_network_options                            = kgvid_default_network_options();
				$network_options['superadmin_only_ffmpeg_settings'] = $default_network_options['superadmin_only_ffmpeg_settings'];
			}

			if ( ! array_key_exists( 'network_error_email', $network_options ) ) {
				$network_options['network_error_email'] = 'nobody';
			}

			if ( $network_options_old != $network_options ) {
				update_site_option( 'kgvid_video_embed_network_options', $network_options );
			}
		}

		$network_queue = get_site_option( 'kgvid_video_embed_queue' );

		if ( is_array( $network_options ) && array_key_exists( 'ffmpeg_exists', $network_options ) && 'on' == $network_options['ffmpeg_exists']
		&& false === $network_queue ) { // if the network queue hasn't been set yet

			$sites = get_sites();

			if ( is_array( $sites ) ) {
				$network_queue = array();
				foreach ( $sites as $site ) {
					$site_queue = get_blog_option( $site->blog_id, 'kgvid_video_embed_queue' );
					if ( is_array( $site_queue ) ) {
						foreach ( $site_queue as $index => $entry ) {
							$site_queue[ $index ]['blog_id'] = $site->blog_id;
						}
						$network_queue = array_merge( $network_queue, $site_queue );
						delete_blog_option( $site->blog_id, 'kgvid_video_embed_queue' );
					}
				}//end loop through sites
				array_multisort( $network_queue );
				update_site_option( 'kgvid_video_embed_queue', $network_queue );
			}
		}//end copying site queues to network

		$local_options = get_option( 'kgvid_video_embed_options' );

		if ( empty( $local_options ) ) {

			$options = kgvid_default_options_fn();
			$updated = update_option( 'kgvid_video_embed_options', $options );
			kgvid_set_capabilities( $network_options['default_capabilities'] );

		}
	}//end network activation setup

	$options         = kgvid_get_options();
	$options_old     = $options; // save the values that are in the db
	$default_options = kgvid_default_options_fn();

	if ( empty( $options ) ) { // run if the new settings don't exist yet (before version 3.0)

		$options = array();

		$old_setting_equivalents = array(
			'width'             => 'wp_FMP_width',
			'height'            => 'wp_FMP_height',
			'controlbar_style'  => 'wp_FMP_controlbar_style',
			'poster'            => 'wp_FMP_poster',
			'endofvideooverlay' => 'wp_FMP_endofvideooverlay',
			'autohide'          => 'wp_FMP_autohide',
			'autoplay'          => 'wp_FMP_autoplay',
			'loop'              => 'wp_FMP_loop',
			'playbutton'        => 'wp_FMP_playbutton',
			'stream_type'       => 'wp_FMP_stream_type',
			'scale_mode'        => 'wp_FMP_scale_mode',
			'bgcolor'           => 'wp_FMP_bgcolor',
			'configuration'     => 'wp_FMP_configuration',
			'skin'              => 'wp_FMP_skin',
			'app_path'          => 'wp_FMP_ffmpeg',
			'ffmpeg_exists'     => 'wp_FMP_ffmpeg_exists',
			'encode_mobile'     => 'wp_FMP_encodemobile',
			'encode_ogg'        => 'wp_FMP_encodeogg',
			'encode_webm'       => 'wp_FMP_encodewebm',
			'ffmpeg_vpre'       => 'wp_FMP_vpre',
			'template'          => 'wp_FMP_template',
			'titlecode'         => 'wp_FMP_titlecode',
		);

		foreach ( $old_setting_equivalents as $new_setting => $old_setting ) { // apply any old settings to the new database entry then delete them
			$old_setting_value = get_option( $old_setting, 'no_setting' );
			if ( $old_setting_value != 'no_setting' ) {
				if ( $old_setting_value == 'true' ) {
					$old_setting_value = 'on';
				}
				$options[ $new_setting ] = $old_setting_value;
				delete_option( $old_setting );
			}
		}
		$wpdb->query( "DELETE FROM $wpdb->options WHERE option_name LIKE 'wp_FMP%'" );

		foreach ( $default_options as $key => $value ) { // apply default values for any settings that didn't exist before
			if ( ! array_key_exists( $key, $options ) ) {
				$options[ $key ] = $value;
			}
		}

		update_option( 'kgvid_video_embed_options', $options );

	} else { // user is already upgraded to version 3.0, but needs the extra options introduced in later versions
		if ( $options['version'] < 3.1 ) {
			$options['version'] = 3.1;
			if ( $options['ffmpeg_vpre'] == 'on' ) {
				$options['video_bitrate_flag'] = 'on';
			} //if user has ffmpeg_vpre turned on, they need the old bitrate flags too
			else {
				$options['video_bitrate_flag'] = false;
			}
			$options['watermark'] = '';
		}
		if ( $options['version'] < 4.0 ) {
			$options['version']           = 4.0;
			$options['overlay_title']     = false;
			$options['overlay_embedcode'] = false;
			$options['view_count']        = false;
			$options['align']             = 'left';
			$options['featured']          = 'on';
			$options['thumb_parent']      = 'video';
			$options['delete_children']   = 'encoded videos only';
			if ( $options['template'] == 'on' ) {
				$options['template'] = 'old';
			} else {
				$options['template'] = 'gentle';
			}
			$checkbox_convert = array( 'autohide', 'endofvideooverlaysame', 'playbutton', 'loop', 'autoplay' );
			foreach ( $checkbox_convert as $option ) {
				if ( $options[ $option ] == 'true' ) {
					$options[ $option ] = 'on';
				} //some checkboxes were incorrectly set to "true" in older versions
			}
			if ( wp_next_scheduled( 'kgvid_cleanup_queue' ) != false ) { // kgvid_cleanup_queue needs an argument!
				wp_clear_scheduled_hook( 'kgvid_cleanup_queue' );
				wp_schedule_event( time() + DAY_IN_SECONDS, 'daily', 'kgvid_cleanup_queue', array( 'scheduled' ) );
			}
		}
		if ( $options['version'] < 4.1 ) {
			$options['version']    = 4.1;
			$options['embeddable'] = 'on';
			$options['inline']     = 'on';
		}
		if ( $options['version'] < 4.2 ) {
			$options['version']             = 4.2;
			$options['bitrate_multiplier']  = 0.1;
			$options['h264_CRF']            = 23;
			$options['webm_CRF']            = 10;
			$options['ogv_CRF']             = 6;
			$options['audio_bitrate']       = 160;
			$options['threads']             = 1;
			$options['nice']                = 'on';
			$options['browser_thumbnails']  = 'on';
			$options['rate_control']        = 'abr';
			$options['h264_profile']        = 'none';
			$options['h264_level']          = 'none';
			$options['encode_fullres']      = false;
			$options['auto_encode']         = false;
			$options['auto_thumb']          = false;
			$options['auto_thumb_position'] = 50;
			$options['right_click']         = 'on';
			$options['resize']              = 'on';
			$options['htaccess_login']      = '';
			$options['htaccess_password']   = '';
			$options['minimum_width']       = false;

			$options['endofvideooverlaysame'] = $options['endOfVideoOverlaySame'];
			unset( $options['endOfVideoOverlaySame'] );
			$options['endofvideooverlay'] = $options['endOfVideoOverlay'];
			unset( $options['endOfVideoOverlaySame'] );

			$upload_capable                                   = kgvid_check_if_capable( 'upload_files' );
			$options['capabilities']['make_video_thumbnails'] = $upload_capable;
			$options['capabilities']['encode_videos']         = $upload_capable;
			kgvid_set_capabilities( $options['capabilities'] );

			if ( array_key_exists( 'embeddable', $options ) && $options['embeddable'] != 'on' ) {
				$options['open_graph'] = false;
			} else {
				$options['open_graph'] = 'on';
			}
		}
		if ( $options['version'] < 4.25 ) {
			$options['version'] = 4.25;
			kgvid_check_ffmpeg_exists( $options, true );
		}
		if ( $options['version'] < 4.3 ) {

			$options['version']              = 4.3;
			$options['preload']              = 'metadata';
			$options['sample_format']        = 'mobile';
			$options['ffmpeg_watermark']     = array(
				'url'    => '',
				'scale'  => '9',
				'align'  => 'right',
				'valign' => 'bottom',
				'x'      => '6',
				'y'      => '5',
			);
			$options['auto_thumb_number']    = 1;
			$options['simultaneous_encodes'] = 1;
			$options['downloadlink']         = false;

			$edit_others_capable                                  = kgvid_check_if_capable( 'edit_others_posts' );
			$options['capabilities']['edit_others_video_encodes'] = $edit_others_capable;
			kgvid_set_capabilities( $options['capabilities'] );

		}
		if ( $options['version'] < 4.301 ) {
			$options['version'] = 4.301;
			if ( ! array_key_exists( 'capabilities', $options ) ) { // fix bug in 4.3 that didn't create capabilties for single installs
				$options['capabilities'] = $default_options['capabilities'];
			}
			kgvid_set_capabilities( $options['capabilities'] );
		}

		if ( $options['version'] < 4.303 ) {
			$options['version']           = 4.303;
			$options['volume']            = 1;
			$options['mute']              = false;
			$options['custom_attributes'] = '';
		}
		if ( $options['version'] < 4.304 ) {
			$options['version']     = 4.304;
			$options['gallery_end'] = '';
		}
		if ( $options['version'] < 4.4 ) {
			$options['version']        = 4.4;
			$options['moov_path']      = $options['app_path'];
			$options['replace_format'] = 'fullres';
			$options['custom_format']  = array(
				'format' => 'h264',
				'width'  => '',
				'height' => '',
			);
			$options['nostdin']        = false;
			$options['fullwidth']      = false;
			$options['auto_res']       = 'on';
		}
		if ( $options['version'] < 4.5 ) {
			$options['version'] = 4.5;
			if ( $options['auto_res'] == 'on' ) {
				$options['auto_res'] = 'automatic';
			} else {
				$options['auto_res'] = 'highest';
			}
			$options['watermark_link_to']   = 'none';
			$options['watermark_url']       = '';
			$options['encode_vp9']          = false;
			$options['gallery_pagination']  = false;
			$options['gallery_per_page']    = false;
			$options['gallery_title']       = 'on';
			$options['oembed_provider']     = 'on';
			$options['oembed_security']     = false;
			$options['ffmpeg_old_rotation'] = 'on';
			$options['click_download']      = 'on';
		}

		if ( $options['version'] < 4.6 ) {
			$options['version'] = 4.6;
			if ( ! array_key_exists( 'nativecontrolsfortouch', $options ) ) {
				$options['nativecontrolsfortouch'] = 'on';
			}
			$options['facebook_button']  = false;
			$options['sample_rotate']    = false;
			$options['twitter_button']   = false;
			$options['twitter_card']     = false;
			$options['schema']           = 'on';
			$options['error_email']      = 'nobody';
			$options['auto_encode_gif']  = false;
			$options['pixel_ratio']      = 'on';
			$options['twitter_username'] = kgvid_get_jetpack_twitter_username();
		}

		if ( version_compare( $options['version'], '4.6.8', '<' ) ) {
			$options['version'] = '4.6.8';
			if ( $options['embed_method'] === 'WordPress Default' ) {
				$options['pauseothervideos'] = 'on';
			} else {
				$options['pauseothervideos'] = false;
			}
			$options['alwaysloadscripts'] = false;
		}

		if ( version_compare( $options['version'], '4.6.14', '<' ) ) {
			$options['version']            = '4.6.14';
			$options['fixed_aspect']       = 'false';
			$options['count_views']        = 'all';
			$options['ffmpeg_auto_rotate'] = false;
		}

		if ( version_compare( $options['version'], '4.6.16', '<' ) ) {
			$options['version']       = '4.6.16';
			$options['playback_rate'] = false;
			if ( $options['count_views'] == 'all' ) {
				$options['count_views'] = 'quarters';
			}
		}

		if ( version_compare( $options['version'], '4.6.20', '<' ) ) {
			$options['version']            = '4.6.20';
			$options['encode_480']         = false;
			$options['hide_video_formats'] = false;
		}

		if ( version_compare( $options['version'], '4.6.21', '<' ) ) {
			$options['version']                = '4.6.21';
			$options['gallery_thumb_aspect']   = false;
			$options['ffmpeg_thumb_watermark'] = array(
				'url'    => '',
				'scale'  => '50',
				'align'  => 'center',
				'valign' => 'center',
				'x'      => '0',
				'y'      => '0',
			);
		}

		if ( version_compare( $options['version'], '4.6.22', '<' ) ) {
			$options['version'] = '4.6.22';
			$video_formats      = kgvid_video_formats();
			foreach ( $video_formats as $format => $format_stats ) {
				if ( array_key_exists( 'encode_' . $format, $options ) && $options[ 'encode_' . $format ] == 'on' ) {
					$options['encode'][ $format ] = $options[ 'encode_' . $format ];
				}
			}
		}

		if ( version_compare( $options['version'], '4.6.23', '<' ) ) {
			$options['version']                 = '4.6.23';
			$options['replace_video_shortcode'] = false;
		}

		if ( version_compare( $options['version'], '4.6.26', '<' ) ) {
			$options['version']                = '4.6.26';
			$options['rewrite_attachment_url'] = 'on';
		}

		if ( version_compare( $options['version'], '4.6.28', '<' ) ) {
			$options['version']     = '4.6.28';
			$options['playsinline'] = 'on';
		}

		if ( version_compare( $options['version'], '4.7', '<' ) ) {
			$options['version'] = '4.7';
			if ( $options['embed_method'] == 'Strobe Media Playback'
				|| $options['embed_method'] == 'JW Player'
			) { // change removed video players to new Video.js player
				$options['embed_method'] = 'Video.js v7';
			}
			$options['controls'] = $options['controlbar_style']; // convert 'controlbar_style' option to 'controls' to match HTML5 convention
			unset( $options['controlbar_style'] );
			if ( $options['controls'] == 'none' ) {
				$options['controls'] = false;
			} else {
				$options['controls'] = 'on';
			}
			$options['muted'] = $options['mute']; // convert 'mute' option to 'muted' to match HTML5 convention
			unset( $options['mute'] );
			$options['auto_publish_post'] = false;
			$options['transient_cache']   = false;
			$options['videojs_version']   = $default_options['videojs_version'];
			$options['queue_control']     = 'play';
			$options['gifmode']           = false;
			$options['audio_channels']    = false;
		}

		if ( version_compare( $options['version'], '4.8', '<' ) ) {
			$options['version'] = '4.8';
			kgvid_check_ffmpeg_exists( $options, true ); // recheck because so much about executing FFMPEG has changed
		}

		if ( $options['version'] != $default_options['version'] ) {
			$options['version'] = $default_options['version'];
		}
		if ( $options !== $options_old ) {
			update_option( 'kgvid_video_embed_options', $options );
		}
	}
}
add_action( 'init', 'kgvid_init_plugin' );

function kgvid_video_embed_options_validate( $input ) {
	// validate & sanitize input from settings form

	$input           = kgvid_sanitize_text_field( $input ); // recursively sanitizes all the settings
	$options         = kgvid_get_options();
	$default_options = kgvid_default_options_fn();

	if ( isset( $_POST['video-embed-thumbnail-generator-reset'] ) && isset( $_POST['kgvid_settings_security'] ) ) {

		$nonce = kgvid_sanitize_text_field( wp_unslash( $_POST['kgvid_settings_security'] ) );
		if ( ! wp_verify_nonce( $nonce, 'video-embed-thumbnail-generator-nonce' ) ) {
			die();
		} else {
			$reset = true;
		}
	} else {
		$reset = false;
	}

	if ( $reset ) {
		$input = $default_options;
		add_settings_error( 'video_embed_thumbnail_generator_settings', 'options-reset', esc_html__( 'Videopack settings reset to default values.', 'video-embed-thumbnail-generator' ), 'updated' );
	}

	if ( $input['app_path'] != $options['app_path']
	|| strtoupper( $input['video_app'] ) != strtoupper( $options['video_app'] )
	) {
		$input = kgvid_validate_ffmpeg_settings( $input );
	} else {
		$input['ffmpeg_exists'] = $options['ffmpeg_exists'];
	}

	if ( $input['ffmpeg_exists'] == 'notinstalled' ) {
		$input['browser_thumbnails'] = 'on'; // in case a user had FFMPEG installed and disabled it, they can't choose to disable browser thumbnails if it's no longer installed
		$input['auto_encode']        = false;
		$input['auto_encode_gif']    = false;
		$input['auto_thumb']         = false;
	}

	if ( $input['ffmpeg_thumb_watermark']['url'] != '' ) { // can't use browser thumbnails with ffmpeg watermark
		$input['browser_thumbnails'] = false;
	}

	if ( empty( $input['width'] ) ) {
		add_settings_error( 'video_embed_thumbnail_generator_settings', 'width-zero', esc_html__( 'You must enter a value for the maximum video width.', 'video-embed-thumbnail-generator' ) );
		$input['width'] = $options['width'];
	}
	if ( empty( $input['height'] ) ) {
		add_settings_error( 'video_embed_thumbnail_generator_settings', 'height-zero', esc_html__( 'You must enter a value for the maximum video height.', 'video-embed-thumbnail-generator' ) );
		$input['height'] = $options['height'];
	}
	if ( empty( $input['gallery_width'] ) ) {
		add_settings_error( 'video_embed_thumbnail_generator_settings', 'gallery-width-zero', esc_html__( 'You must enter a value for the maximum gallery video width.', 'video-embed-thumbnail-generator' ) );
		$input['gallery_width'] = $options['gallery_width'];
	}

	if ( array_key_exists( 'capabilities', $input ) && is_array( $input['capabilities'] ) && $input['capabilities'] !== $options['capabilities'] ) {
		kgvid_set_capabilities( $input['capabilities'] );
	}

	if ( ! array_key_exists( 'transient_cache', $input ) && $options['transient_cache'] == 'on' ) {
		kgvid_delete_transients();
	} //if user is turning off transient cache option

	if ( is_array( $input['custom_format'] )
		&& ( ! empty( $input['custom_format']['width'] )
			|| ! empty( $input['custom_format']['height'] )
		)
	) {

		$video_formats = kgvid_video_formats();

		$input['custom_format']['name'] = 'Custom';
		if ( ! empty( $input['custom_format']['height'] ) ) {
			$input['custom_format']['name'] .= ' ' . $input['custom_format']['height'] . 'p';
			$input['custom_format']['label'] = $input['custom_format']['height'] . 'p';
		} else {
			$input['custom_format']['name'] .= ' ' . $input['custom_format']['width'] . ' width';
			$approx_height                   = round( intval( $input['custom_format']['width'] ) * 0.5625 );
			if ( $approx_height % 2 != 0 ) {
				--$approx_height;
			} //make sure it's an even number
			$input['custom_format']['label'] = $approx_height . 'p';
		}
		if ( $input['custom_format']['format'] == 'h264' ) {
			$input['custom_format']['name']     .= ' H.264';
			$input['custom_format']['type']      = 'h264';
			$input['custom_format']['extension'] = 'mp4';
			$input['custom_format']['mime']      = 'video/mp4';
			$input['custom_format']['vcodec']    = 'libx264';
		} else {
			$input['custom_format']['name']     .= ' ' . strtoupper( $input['custom_format']['format'] );
			$input['custom_format']['type']      = $video_formats[ $input['custom_format']['format'] ]['type'];
			$input['custom_format']['extension'] = $video_formats[ $input['custom_format']['format'] ]['extension'];
			$input['custom_format']['mime']      = $video_formats[ $input['custom_format']['format'] ]['mime'];
			$input['custom_format']['vcodec']    = $video_formats[ $input['custom_format']['format'] ]['vcodec'];
		}

		$input['custom_format']['suffix'] = '-custom.' . $input['custom_format']['extension'];

		$input['custom_format']['default_encode'] = 'on';

	} // if the custom format has been set
	elseif ( $input['sample_format'] == 'custom' ) {

			$input['sample_format'] = 'mobile';
	}

	if ( array_key_exists( 'auto_thumb_number', $input ) ) {
		if ( intval( $options['auto_thumb_number'] ) == 1 && intval( $input['auto_thumb_number'] ) > 1 ) {
			$input['auto_thumb_position'] = strval( round( intval( $input['auto_thumb_number'] ) * ( intval( $options['auto_thumb_position'] ) / 100 ) ) );
			if ( $input['auto_thumb_position'] == '0' ) {
				$input['auto_thumb_position'] = '1';
			}
		}
		if ( intval( $options['auto_thumb_number'] ) > 1 && intval( $input['auto_thumb_number'] ) == 1 ) {
			// round to the nearest 25 but not 100
			$input['auto_thumb_position'] = strval( round( round( intval( $options['auto_thumb_position'] ) / intval( $options['auto_thumb_number'] ) * 4 ) / 4 * 100 ) );
			if ( $input['auto_thumb_position'] == '100' ) {
				$input['auto_thumb_position'] = '75';
			}
		}

		if ( intval( $input['auto_thumb_number'] ) > 1 && intval( $input['auto_thumb_position'] ) > intval( $input['auto_thumb_number'] ) ) {
			$input['auto_thumb_position'] = $input['auto_thumb_number'];
		}

		if ( intval( $input['auto_thumb_number'] ) == 0 ) {
			$input['auto_thumb_number'] = $options['auto_thumb_number'];
		}
	}

	// load all settings and make sure they get a value of false if they weren't entered into the form
	foreach ( $default_options as $key => $value ) {
		if ( ! array_key_exists( $key, $input ) ) {
			$input[ $key ] = false;
		}
	}

	if ( $input['embeddable'] == false ) {
		$input['overlay_embedcode'] = false;
	}

	if ( ! $input['queue_control'] ) { // don't reset queue control when saving settings
		$input['queue_control'] = $options['queue_control'];
	}

	// since this isn't user selectable it has to be re-entered every time
	$input['version']         = $default_options['version'];
	$input['videojs_version'] = $default_options['videojs_version'];

	return $input;
}

function kgvid_cron_check_post_parent_handler( $post_id ) {

	$post               = get_post( $post_id );
	$video_thumbnail_id = get_post_thumbnail_id( $post_id );
	$post_thumbnail_id  = get_post_thumbnail_id( $post->post_parent );

	if ( ! empty( $post->post_parent ) && ! empty( $video_thumbnail_id ) && empty( $post_thumbnail_id ) ) {
		set_post_thumbnail( $post->post_parent, $video_thumbnail_id );
	}
}
add_action( 'kgvid_cron_check_post_parent', 'kgvid_cron_check_post_parent_handler' );

function kgvid_change_thumbnail_parent( $post_id, $parent_id ) {

	$args       = array(
		'post_type'      => 'attachment',
		'post_mime_type' => 'image',
		'numberposts'    => '-1',
		'meta_key'       => '_kgflashmediaplayer-video-id',
		'meta_value'     => $post_id,
	);
	$thumbnails = get_posts( $args ); // find all thumbnail children of the video in the database

	if ( $thumbnails ) {

		foreach ( $thumbnails as $thumbnail ) {

			if ( $thumbnail->post_parent != $parent_id ) {

				if ( empty( $parent_id ) ) {
					$thumbnail->post_parent = $post_id;
				} else { // parent post exists
					$thumbnail->post_parent = $parent_id;
				}

				wp_update_post( $thumbnail );
			}
		}//end loop through thumbnails
	}//end if thumbnails
}

function kgvid_upload_page_change_thumbnail_parent( $location ) {

	if (
		( ! is_admin()
			&& ! check_admin_referer( 'bulk-media' )
		)
		|| ! function_exists( 'get_current_screen' )
	) {
		return $location;
	}

	$current_screen = get_current_screen();
	$options        = kgvid_get_options();

	if ( 'upload' === $current_screen->id
		&& isset( $_GET['media'] )
		&& is_array( $_GET['media'] )
		&& $options['thumb_parent'] === 'post'
	) {
		$media = kgvid_sanitize_text_field( wp_unslash( $_GET['media'] ) );
		if ( isset( $_GET['found_post_id'] ) ) {
			$parent_id = (int) kgvid_sanitize_text_field( wp_unslash( $_GET['found_post_id'] ) );
		} else {
			$parent_id = 0;
		}

		foreach ( $media as $post_id ) {

			kgvid_change_thumbnail_parent( $post_id, $parent_id );

			if ( $options['featured'] == 'on' && ! has_post_thumbnail( $parent_id ) ) {
				$featured_id = get_post_meta( $post_id, '_kgflashmediaplayer-poster-id', true );
				if ( ! empty( $featured_id ) ) {
					set_post_thumbnail( $parent_id, $featured_id );
				}
			}
		}//end loop through modified attachments
	}//end if changed parent

	return $location;
}
add_filter( 'wp_redirect', 'kgvid_upload_page_change_thumbnail_parent' ); // when attachment parent is manually changed on the Media Library page

function kgvid_validate_post_updated( $post_id ) {

	$options  = kgvid_get_options();
	$post     = get_post( $post_id );
	$is_video = kgvid_is_video( $post );

	if ( $is_video ) {

		if ( $options['thumb_parent'] == 'post' ) {
			kgvid_change_thumbnail_parent( $post_id, $post->post_parent );
		}

		if ( $options['featured'] == 'on' ) {
			$featured_id = get_post_meta( $post_id, '_kgflashmediaplayer-poster-id', true );
			if ( ! empty( $featured_id ) && get_post_thumbnail_id( $post->post_parent ) != $featured_id ) {
				set_post_thumbnail( $post->post_parent, $featured_id );
			}
		}
	}
}
add_action( 'edit_attachment', 'kgvid_validate_post_updated' );

/**
 * Adding our custom fields to the $form_fields array
 *
 * @param array  $form_fields
 * @param object $post
 * @return array
 */
function kgvid_image_attachment_fields_to_edit( $form_fields, $post ) {

	$options  = kgvid_get_options();
	$is_video = kgvid_is_video( $post );

	if ( $is_video ) {

		wp_enqueue_media(); // allows using the media modal in the Media Library
		wp_enqueue_script( 'kgvid_video_plugin_admin' );
		wp_enqueue_style( 'video_embed_thumbnail_generator_style' );

		$user_ID        = get_current_user_id();
		$movieurl       = wp_get_attachment_url( $post->ID );
		$moviefile      = get_attached_file( $post->ID );
		$kgvid_postmeta = kgvid_get_attachment_meta( $post->ID );
		$created_time   = time() - get_post_time( 'U', true, $post->ID );

		if ( $user_ID == $post->post_author || current_user_can( 'edit_others_posts' ) ) {
			$readonly          = '';
			$security_disabled = '';
		} else {
			$readonly          = ' readonly';
			$security_disabled = ' disabled';
		}

		$form_fields['kgflashmediaplayer-url']['input'] = 'hidden';
		$form_fields['kgflashmediaplayer-url']['value'] = esc_url( $movieurl );

		$video_aspect     = null;
		$dimensions_saved = false;
		$video_meta       = wp_get_attachment_metadata( $post->ID );
		if ( is_array( $video_meta )
			&& array_key_exists( 'width', $video_meta )
			&& array_key_exists( 'height', $video_meta )
		) {
			$video_aspect = $video_meta['height'] / $video_meta['width'];
		}
		if ( ! empty( $kgvid_postmeta['width'] )
			&& ! empty( $kgvid_postmeta['height'] )
		) {
			if ( empty( $video_aspect ) ) {
				$video_aspect = $kgvid_postmeta['height'] / $kgvid_postmeta['width'];
			}
			$dimensions_saved = true;
		}

		$dimension_words = array( 'width', 'height' );
		$max             = array();
		$set             = array();

		foreach ( $dimension_words as $dimension ) {

			$max[ $dimension ] = $options[ $dimension ];
			if ( $dimensions_saved ) {
				$set[ $dimension ] = $kgvid_postmeta[ $dimension ];
			} elseif ( $dimension == 'width'
				&& $options['minimum_width'] == 'on'
			) {
				$set[ $dimension ] = $max[ $dimension ];
			} elseif ( is_array( $video_meta )
				&& array_key_exists( $dimension, $video_meta )
				&& intval( $video_meta[ $dimension ] ) <= intval( $max[ $dimension ] )
			) {
				$set[ $dimension ] = $video_meta[ $dimension ];
			} else {
				$set[ $dimension ] = $max[ $dimension ];
			}
			if ( ! $dimensions_saved ) {
				$kgvid_postmeta[ $dimension ] = $set[ $dimension ];
			}

			$form_fields[ 'kgflashmediaplayer-max' . $dimension ]['input'] = 'hidden';
			$form_fields[ 'kgflashmediaplayer-max' . $dimension ]['value'] = esc_attr( $max[ $dimension ] );

		}

		$form_fields['kgflashmediaplayer-aspect']['input'] = 'hidden';
		$form_fields['kgflashmediaplayer-aspect']['value'] = esc_attr( round( $set['height'] / $set['width'], 5 ) );

		$nonce = wp_create_nonce( 'video-embed-thumbnail-generator-nonce' );
		$form_fields['kgflashmediaplayer-security']['input'] = 'hidden';
		$form_fields['kgflashmediaplayer-security']['value'] = $nonce;

		if ( $post->post_mime_type != 'image/gif' ) {
			$form_fields['views']['label'] = esc_html__( 'Video Stats', 'video-embed-thumbnail-generator' );
			$form_fields['views']['input'] = 'html';
			/* translators: %1$s%2$d%3$s is '<strong>', a number, '</strong>' */
			$form_fields['views']['html']  = sprintf( esc_html( _n( '%1$s%2$d%3$s Play', '%1$s%2$d%3$s Plays', intval( $kgvid_postmeta['starts'] ), 'video-embed-thumbnail-generator' ) ), '<strong>', esc_html( intval( $kgvid_postmeta['starts'] ) ), '</strong>' ) . '<span class="kgvid-reveal-thumb-video" onclick="kgvid_reveal_video_stats(' . esc_attr( $post->ID ) . ')" id="show-video-stats-' . esc_attr( $post->ID ) . '"><br /><a class="kgvid-show-video">(' . esc_html__( 'More...', 'video-embed-thumbnail-generator' ) . ')</a></span><div style="display:none;" id="video-' . esc_attr( $post->ID ) . '-stats">' .
			esc_html( intval( $kgvid_postmeta['play_25'] ) ) . ' ' . esc_html__( '25%', 'video-embed-thumbnail-generator' ) .
			'<br /><strong>' . esc_html( intval( $kgvid_postmeta['play_50'] ) ) . '</strong> ' . esc_html__( '50%', 'video-embed-thumbnail-generator' ) .
			'<br /><strong>' . esc_html( intval( $kgvid_postmeta['play_75'] ) ) . '</strong> ' . esc_html__( '75%', 'video-embed-thumbnail-generator' ) .
			'<br />';
			/* translators: %1$s%2$d%3$s is '<strong>', a number, '</strong>' */
			$form_fields['views']['html'] .= sprintf( esc_html( _n( '%1$s%2$d%3$s Complete View', '%1$s%2$d%3$s Complete Views', intval( $kgvid_postmeta['completeviews'] ), 'video-embed-thumbnail-generator' ) ), '<strong>', esc_html( intval( $kgvid_postmeta['completeviews'] ) ), '</strong>' ) .
			'<p>' . esc_html__( 'Video ID:', 'video-embed-thumbnail-generator' ) . ' ' . esc_attr( $post->ID ) . '</p></div>';

			// ** Thumbnail section **//

			$thumbnail_url = get_post_meta( $post->ID, '_kgflashmediaplayer-poster', true );
			$thumbnail_id  = get_post_meta( $post->ID, '_kgflashmediaplayer-poster-id', true );
			if ( is_ssl() ) {
				$thumbnail_url = str_replace( 'http:', 'https:', $thumbnail_url );
			}

			$thumbnail_html = '';
			if ( ! empty( $kgvid_postmeta['autothumb-error'] ) && empty( $thumbnail_url ) ) {
				$thumbnail_html = '<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box">' . wp_kses_post( $kgvid_postmeta['autothumb-error'] ) . '</div>';
			} elseif ( ! empty( $thumbnail_url ) ) {
				$thumbnail_html = '<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box"><img width="200" data-thumb_id="' . esc_attr( $thumbnail_id ) . '" src="' . esc_attr( $thumbnail_url ) . '?' . rand() . '"></div>';
			}

			$choose_from_video_content = '';
			$generate_content          = '';
			$thumbnail_timecode        = '';

			if ( ! isset( $options['ffmpeg_exists'] ) || $options['ffmpeg_exists'] == 'notchecked' ) {
				kgvid_check_ffmpeg_exists( $options, true );
			}

			$ffmpeg_disabled_text = '';

			$update_script = '';
			if ( $options['ffmpeg_exists'] === 'on'
				&& $options['auto_thumb'] === 'on'
				&& ! $thumbnail_url
				&& $created_time < 60
			) {
				$thumbnail_html = '<div class="kgvid_thumbnail_box kgvid_chosen_thumbnail_box kgvid_redraw_thumbnail_box" style="height:112px;"><span>' . esc_html__( 'Loading thumbnail...' ) . '</span></div>';
			}

			if ( empty( $security_disabled ) && current_user_can( 'make_video_thumbnails' ) ) {

				if ( ! empty( $kgvid_postmeta['thumbtime'] ) ) {
					$kgvid_postmeta['numberofthumbs'] = '1';
				}

				$args             = array(
					'mime_type' => 'image/jpeg',
					'methods'   => array(
						'save',
					),
				);
				$img_editor_works = wp_image_editor_supports( $args );

				$moviefiletype  = pathinfo( $movieurl, PATHINFO_EXTENSION );
				$h264compatible = array( 'mp4', 'mov', 'm4v' );
				if ( $moviefiletype == 'mov' || $moviefiletype == 'm4v' ) {
					$moviefiletype = 'mp4';
				}

				$video_formats    = kgvid_video_formats();
				$encodevideo_info = kgvid_encodevideo_info( $movieurl, $post->ID );
				if ( in_array( $moviefiletype, $h264compatible ) ) {
					$encodevideo_info['original']['exists']   = true;
					$encodevideo_info['original']['encoding'] = false;
					$encodevideo_info['original']['url']      = $movieurl;
					$video_formats                            = array( 'original' => array( 'mime' => 'video/' . $moviefiletype ) ) + $video_formats;
				} else {
					$encodevideo_info['original']['exists'] = false;
				}

				$sources = array();

				foreach ( $video_formats as $format => $format_stats ) {
					if ( $format !== 'original'
						&& $encodevideo_info[ $format ]['url'] === $movieurl
					) {
						unset( $sources['original'] );
					}
					if ( $encodevideo_info[ $format ]['exists']
						&& $encodevideo_info[ $format ]['encoding'] == false
					) {
						$sources[ $format ] = '<source src="' . esc_attr( $encodevideo_info[ $format ]['url'] ) . '" type="' . esc_attr( $format_stats['mime'] ) . '">';
					}
				}

				if ( $img_editor_works ) {
					$choose_from_video_content = '<div class="kgvid_thumbnail_box kgvid-tabs-content" id="thumb-video-' . esc_attr( $post->ID ) . '-container">
						<div class="kgvid-reveal-thumb-video" onclick="kgvid_reveal_thumb_video(' . esc_attr( $post->ID ) . ')" id="show-thumb-video-' . esc_attr( $post->ID ) . '"><span class="kgvid-right-arrow"></span><span class="kgvid-show-video">' . esc_html__( 'Choose from video...', 'video-embed-thumbnail-generator' ) . '</span></div>
						<div style="display:none;" id="thumb-video-' . esc_attr( $post->ID ) . '-player">
							<video playsinline crossorigin="anonymous" muted preload="none" class="kgvid-thumb-video" width="200" data-allowed="' . esc_attr( $options['browser_thumbnails'] ) . '" onloadedmetadata="kgvid_thumb_video_loaded(\'' . esc_attr( $post->ID ) . '\');" id="thumb-video-' . esc_attr( $post->ID ) . '">' .
							wp_kses_post( implode( "\n", $sources ) ) . '
							</video>
							<div class="kgvid-video-controls" tabindex="0">
								<div class="kgvid-play-pause"></div>
								<div class="kgvid-seek-bar">
									<div class="kgvid-play-progress"></div>
									<div class="kgvid-seek-handle"></div></div>
							</div>
							<span id="manual-thumbnail" class="button" onclick="kgvid_thumb_video_manual(' . esc_attr( $post->ID ) . ');">Use this frame</span>
						</div>
					</div>';
				} else {
					$choose_from_video_content = '<div class="kgvid_thumbnail_box">Thumbnail selection requires GD or Imagick PHP libraries.</div>';
				}
				$generate_content = '<div id="generate-thumb-' . esc_attr( $post->ID ) . '-container" class="kgvid-tabs-content" data-ffmpeg="' . esc_attr( $options['ffmpeg_exists'] ) . '">
				<input id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-numberofthumbs" name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-numberofthumbs]" type="text" value="' . esc_attr( $kgvid_postmeta['numberofthumbs'] ) . '" maxlength="2" style="width:35px;text-align:center;" onchange="kgvid_disable_thumb_buttons(\'' . esc_attr( $post->ID ) . '\', \'onchange\');document.getElementById(\'attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-thumbtime\').value =\'\';" ' . esc_attr( $ffmpeg_disabled_text . $readonly ) . '/>
				<input type="button" id="attachments-' . esc_attr( $post->ID ) . '-thumbgenerate" class="button" value="' . esc_attr_x( 'Generate', 'Button text. Implied "Generate thumbnails"', 'video-embed-thumbnail-generator' ) . '" name="thumbgenerate" onclick="kgvid_generate_thumb(' . esc_attr( $post->ID ) . ', \'generate\');" ' . esc_attr( $ffmpeg_disabled_text ) . '/>
				<input type="button" id="attachments-' . esc_attr( $post->ID ) . '-thumbrandomize" class="button" value="' . esc_attr_x( 'Randomize', 'Button text. Implied "Randomize thumbnail generation"', 'video-embed-thumbnail-generator' ) . '" name="thumbrandomize" onclick="kgvid_generate_thumb(' . esc_attr( $post->ID ) . ', \'random\');" ' . esc_attr( $ffmpeg_disabled_text ) . '/>
				<span style="white-space:nowrap;"><input type="checkbox" id="attachments-' . esc_attr( $post->ID ) . '-firstframe" name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-forcefirst]" onchange="document.getElementById(\'attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-thumbtime\').value =\'\';" ' . checked( $kgvid_postmeta['forcefirst'], 'on', false ) . ' ' . esc_attr( $ffmpeg_disabled_text . $readonly ) . '/> <label for="attachments-' . esc_attr( $post->ID ) . '-firstframe">' . esc_html__( 'Force 1st frame thumbnail', 'video-embed-thumbnail-generator' ) . '</label></span></div>';

				$thumbnail_timecode = esc_html__( 'Thumbnail timecode:', 'video-embed-thumbnail-generator' ) . ' <input name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-thumbtime]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-thumbtime" type="text" value="' . esc_attr( $kgvid_postmeta['thumbtime'] ) . '" style="width:60px;"' . esc_attr( $readonly ) . '><br>';

			}

			$form_fields['kgflashmediaplayer-autothumb-error']['input'] = 'hidden';
			$form_fields['kgflashmediaplayer-autothumb-error']['value'] = esc_attr( $kgvid_postmeta['autothumb-error'] );

			$form_fields['generator']['label'] = esc_html_x( 'Thumbnails', 'Header for thumbnail section', 'video-embed-thumbnail-generator' );
			$form_fields['generator']['input'] = 'html';
			$form_fields['generator']['html']  = $choose_from_video_content . '
			' . $generate_content . '
			' . $thumbnail_timecode . '
			<div id="attachments-' . esc_attr( $post->ID ) . '-thumbnailplaceholder" style="position:relative;">' . $thumbnail_html . '</div>';
			if ( empty( $security_disabled ) ) {
				$form_fields['generator']['html'] .= '<span id="pick-thumbnail" class="button" style="margin:10px 0;" data-choose="' . esc_attr__( 'Choose a Thumbnail', 'video-embed-thumbnail-generator' ) . '" data-update="' . esc_attr__( 'Set as video thumbnail', 'video-embed-thumbnail-generator' ) . '" data-change="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-poster" onclick="kgvid_pick_image(this);">' . esc_html__( 'Choose from Library', 'video-embed-thumbnail-generator' ) . '</span><br />
				<input type="checkbox" id="attachments-' . esc_attr( $post->ID ) . '-featured" name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-featured]" ' . checked( $kgvid_postmeta['featured'], 'on', false ) . ' ' . $ffmpeg_disabled_text . '/> <label for="attachments-' . esc_attr( $post->ID ) . '-featured">' . esc_html__( 'Set thumbnail as featured image', 'video-embed-thumbnail-generator' ) . '</label>';
			}

			$form_fields['generator']['html'] .= $update_script;

			if ( empty( $security_disabled ) ) {
				$form_fields['kgflashmediaplayer-poster']['label'] = esc_html__( 'Thumbnail URL', 'video-embed-thumbnail-generator' );
				$form_fields['kgflashmediaplayer-poster']['value'] = esc_url( get_post_meta( $post->ID, '_kgflashmediaplayer-poster', true ) );
				/* translators: %s is an <a> tag */
				$form_fields['kgflashmediaplayer-poster']['helps'] = '<small>' . sprintf( esc_html__( 'Leave blank to use %sdefault thumbnail', 'video-embed-thumbnail-generator' ), "<a href='options-general.php?page=video_embed_thumbnail_generator_settings' target='_blank'>" ) . '</a>.</small>';
			}

			$form_fields['kgflashmediaplayer-dimensions']['label'] = esc_html__( 'Video Embed Dimensions', 'video-embed-thumbnail-generator' );
			$form_fields['kgflashmediaplayer-dimensions']['input'] = 'html';
			$form_fields['kgflashmediaplayer-dimensions']['html']  = esc_html__( 'Width:', 'video-embed-thumbnail-generator' ) . ' <input name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-width]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-width" type="text" value="' . esc_attr( $kgvid_postmeta['width'] ) . '" style="width:50px;" data-minimum="' . esc_attr( $options['minimum_width'] ) . '" onchange="kgvid_set_dimension(' . esc_attr( $post->ID ) . ', \'height\', this.value);" onkeyup="kgvid_set_dimension(' . esc_attr( $post->ID ) . ', \'height\', this.value);"' . $readonly . '> ' . esc_html__( 'Height:', 'video-embed-thumbnail-generator' ) . '
			<input name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-height]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-height" type="text" value="' . esc_attr( $kgvid_postmeta['height'] ) . '" style="width:50px;" onchange="kgvid_set_dimension(' . esc_attr( $post->ID ) . ', \'width\', this.value);" onkeyup="kgvid_set_dimension(' . esc_attr( $post->ID ) . ', \'width\', this.value);"' . $readonly . '> <br />
			<input type="checkbox" name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-lockaspect]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-lockaspect" onclick="kgvid_set_aspect(' . esc_attr( $post->ID ) . ', this.checked);" ' . checked( $kgvid_postmeta['lockaspect'], 'on', false ) . $security_disabled . '>
			<label for="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-lockaspect"><small>' . esc_html__( 'Lock to aspect ratio', 'video-embed-thumbnail-generator' ) . '</small></label>';
			/* translators: %s is an <a> tag */
			$form_fields['kgflashmediaplayer-dimensions']['helps'] = '<small>' . sprintf( esc_html__( 'Leave blank to use %sdefault dimensions', 'video-embed-thumbnail-generator' ), "<a href='options-general.php?page=video_embed_thumbnail_generator_settings' target='_blank'>" ) . '</a>.</small>';

		} //end if not GIF

		$checkboxes = kgvid_generate_encode_checkboxes( $movieurl, $post->ID, 'attachment' );

		$form_fields['kgflashmediaplayer-encode']['label'] = esc_html__( 'Additional Formats', 'video-embed-thumbnail-generator' );
		$form_fields['kgflashmediaplayer-encode']['input'] = 'html';
		$form_fields['kgflashmediaplayer-encode']['html']  = $checkboxes['checkboxes'];

		if ( $post->post_mime_type != 'image/gif' ) {

			$tracks_html = '';
			if ( is_array( $kgvid_postmeta['track'] ) ) {
				foreach ( $kgvid_postmeta['track'] as $track => $track_attribute ) {
					if ( ! empty( $kgvid_postmeta['track'][ $track ]['src'] ) ) {
						$items             = array(
							__( 'subtitles', 'video-embed-thumbnail-generator' ) => 'subtitles',
							__( 'captions', 'video-embed-thumbnail-generator' ) => 'captions',
							__( 'chapters', 'video-embed-thumbnail-generator' ) => 'chapters',
						);
						$track_type_select = '<select name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-track][' . esc_attr( $track ) . '][kind]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-track_' . esc_attr( $track ) . '_kind]"' . esc_attr( $security_disabled ) . '>';
						foreach ( $items as $name => $value ) {
							$selected           = ( $kgvid_postmeta['track'][ $track ]['kind'] == $value ) ? ' selected="selected"' : '';
							$track_type_select .= "<option value='" . esc_attr( $value ) . "'" . $selected . '>' . esc_html( $name ) . '</option>';
						}
						$track_type_select .= '</select>';

						if ( ! array_key_exists( 'default', $kgvid_postmeta['track'][ $track ] ) ) {
							$kgvid_postmeta['track'][ $track ]['default'] = false;
						}

						$tracks_html .= '<div id="kgflashmediaplayer-' . esc_attr( $post->ID ) . '-trackdiv-' . esc_attr( $track ) . '" class="kgvid_thumbnail_box kgvid_track_box"><strong>' . esc_html_x( 'Track', 'captions track', 'video-embed-thumbnail-generator' ) . ' ' . esc_attr( strval( $track + 1 ) ) . '</strong>';
						if ( empty( $security_disabled ) ) {
							$tracks_html .= '<span class="kgvid_track_box_removeable" data-trackid="' . esc_attr( $track ) . '" onclick="jQuery(this).siblings(\'input\').val(\'\').attr(\'checked\', \'\').trigger(\'change\');">X</span>';
						}
						$tracks_html .= '<br />' . __( 'Track type:', 'video-embed-thumbnail-generator' ) . ' ' . $track_type_select . '<br />';
						if ( empty( $security_disabled ) ) {
							$tracks_html .= '<span id="pick-track' . esc_attr( $track ) . '" class="button" style="margin:10px 0;" data-choose="' . esc_attr__( 'Choose a Text File', 'video-embed-thumbnail-generator' ) . '" data-update="' . esc_html__( 'Set as track source', 'video-embed-thumbnail-generator' ) . '" data-change="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-track_' . esc_attr( $track ) . '_src" onclick="kgvid_pick_attachment(this);">' . esc_html__( 'Choose from Library', 'video-embed-thumbnail-generator' ) . '</span><br />';
						}
						$tracks_html .= 'URL: <input name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-track][' . esc_attr( $track ) . '][src]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-track_' . esc_attr( $track ) . '_src" type="text" value="' . esc_attr( $kgvid_postmeta['track'][ $track ]['src'] ) . '" class="text" style="width:180px;"' . $readonly . '><br />
						' . esc_html_x( 'Language code:', 'two-letter code indicating track\'s language', 'video-embed-thumbnail-generator' ) . ' <input name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-track][' . esc_attr( $track ) . '][srclang]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-track_' . esc_attr( $track ) . '_srclang" type="text" value="' . esc_attr( $kgvid_postmeta['track'][ $track ]['srclang'] ) . '" maxlength="2" style="width:40px;"' . $readonly . '><br />
						' . esc_html__( 'Label:', 'video-embed-thumbnail-generator' ) . ' <input name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-track][' . esc_attr( $track ) . '][label]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-track_' . esc_attr( $track ) . '_label" type="text" value="' . esc_attr( $kgvid_postmeta['track'][ $track ]['label'] ) . '" class="text" style="width:172px;"' . $readonly . '><br />
						' . esc_html__( 'Default:', 'video-embed-thumbnail-generator' ) . '<input ' . checked( $kgvid_postmeta['track'][ $track ]['default'], 'default', false ) . ' name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-track][' . esc_attr( $track ) . '][default]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-track_' . esc_attr( $track ) . '_default" type="checkbox" value="default"' . $security_disabled . '></div>';
					}
				}
			}

			$form_fields['kgflashmediaplayer-track']['label'] = esc_html__( 'Subtitles & Captions', 'video-embed-thumbnail-generator' );
			$form_fields['kgflashmediaplayer-track']['input'] = 'html';
			$form_fields['kgflashmediaplayer-track']['html']  = '<div id="kgflashmediaplayer-' . esc_attr( $post->ID ) . '-trackdiv">' . $tracks_html . '</div>';
			if ( empty( $security_disabled ) ) {
				$form_fields['kgflashmediaplayer-track']['html'] .= '<span class="button" id="kgflashmediaplayer-add_track" onclick="kgvid_add_subtitles(' . esc_attr( $post->ID ) . ')">' . esc_html__( 'Add track', 'video-embed-thumbnail-generator' ) . '</span>';
			}

			$items            = array(
				__( 'Single Video', 'video-embed-thumbnail-generator' ) => 'Single Video',
				__( 'Video Gallery', 'video-embed-thumbnail-generator' ) => 'Video Gallery',
				__( 'WordPress Default', 'video-embed-thumbnail-generator' ) => 'WordPress Default',
			);
			$shortcode_select = '<select name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-embed]" id="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-embed]">';
			foreach ( $items as $name => $value ) {
				$selected          = ( $kgvid_postmeta['embed'] == $value ) ? 'selected="selected"' : '';
				$shortcode_select .= "<option value='" . esc_attr( $value ) . "' $selected>" . esc_html( $name ) . '</option>';
			}
			$shortcode_select .= '</select>';

			$form_fields['kgflashmediaplayer-options']['label'] = esc_html__( 'Video Embed Options', 'video-embed-thumbnail-generator' );
			$form_fields['kgflashmediaplayer-options']['input'] = 'html';
			$form_fields['kgflashmediaplayer-options']['html']  = '<input type="checkbox" name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-showtitle]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-showtitle" ' . checked( $kgvid_postmeta['showtitle'], 'on', false ) . $security_disabled . '>
			<label for="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-showtitle">' . esc_html__( 'Insert title above video', 'video-embed-thumbnail-generator' ) . '</label><br />
			<input type="checkbox" name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-downloadlink]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-downloadlink" ' . checked( $kgvid_postmeta['downloadlink'], 'on', false ) . $security_disabled . '>
			<label for="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-downloadlink">' . esc_html__( 'Show download icon', 'video-embed-thumbnail-generator' ) . '<em><small><br />' . esc_html__( 'Makes it easier for users to download file.', 'video-embed-thumbnail-generator' ) . '</em></small></label><br />
			<label for="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-embed">' . esc_html_x( 'Insert', 'verb', 'video-embed-thumbnail-generator' ) . '</label>
			' . wp_kses( $shortcode_select, kgvid_allowed_html( 'admin' ) );

			if ( $kgvid_postmeta['embed'] == 'Video Gallery' ) {

				if ( empty( $kgvid_postmeta['gallery_id'] ) ) {
					$kgvid_postmeta['gallery_id'] = $post->post_parent;
				}

				$items                  = array( 'menu_order', 'title', 'post_date', 'rand', 'ID' );
				$gallery_orderby_select = '<select name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-gallery_orderby]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-gallery_orderby">';
				foreach ( $items as $item ) {
					$selected                = ( $kgvid_postmeta['gallery_orderby'] == $item ) ? 'selected="selected"' : '';
					$gallery_orderby_select .= "<option value='" . esc_attr( $item ) . "' $selected>" . esc_html( $item ) . '</option>';
				}
				$gallery_orderby_select .= '</select>';

				$items                = array( 'ASC', 'DESC' );
				$gallery_order_select = '<select name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-gallery_order]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-gallery_order">';
				foreach ( $items as $item ) {
					$selected              = ( $kgvid_postmeta['gallery_order'] == $item ) ? 'selected="selected"' : '';
					$gallery_order_select .= "<option value='" . esc_attr( $item ) . "' $selected>" . esc_html( $item ) . '</option>';
				}
				$gallery_order_select .= '</select>';

				$form_fields['kgflashmediaplayer-gallery']['label'] = esc_html__( 'Gallery Settings (all optional)', 'video-embed-thumbnail-generator' );
				$form_fields['kgflashmediaplayer-gallery']['input'] = 'html';
				$form_fields['kgflashmediaplayer-gallery']['html']  = '<input name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-gallery_thumb_width]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-gallery_thumb_width" type ="text" value="' . esc_attr( $kgvid_postmeta['gallery_thumb_width'] ) . '" class="kgvid_50_width"> <label for="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-gallery_thumb_width">' . esc_html__( 'Thumbnail Width', 'video-embed-thumbnail-generator' ) . '</label><br />
				' . $gallery_orderby_select . ' ' . __( 'Order By', 'video-embed-thumbnail-generator' ) . '<br />
				' . $gallery_order_select . ' ' . __( 'Sort Order', 'video-embed-thumbnail-generator' ) . '<br />
				<input name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-gallery_exclude]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-gallery_exclude" type ="text" value="' . esc_attr( $kgvid_postmeta['gallery_exclude'] ) . '" class="kgvid_50_width"> <label for="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-gallery_exclude">' . esc_html__( 'Exclude', 'video-embed-thumbnail-generator' ) . '</label><br />
				<input name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-gallery_include]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-gallery_include" type ="text" value="' . esc_attr( $kgvid_postmeta['gallery_include'] ) . '" class="kgvid_50_width"> <label for="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-gallery_include">' . esc_html__( 'Include', 'video-embed-thumbnail-generator' ) . '</label><br />
				<input name="attachments[' . esc_attr( $post->ID ) . '][kgflashmediaplayer-gallery_id]" id="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-gallery_id" type ="text" value="' . esc_attr( $kgvid_postmeta['gallery_id'] ) . '" class="kgvid_50_width"> <label for="attachments-' . esc_attr( $post->ID ) . '-kgflashmediaplayer-gallery_id">' . esc_html__( 'Post ID', 'video-embed-thumbnail-generator' ) . '</label>
				';

			} //if video gallery
		} //if not GIF
	} //only add fields if attachment is the right kind of video
	return $form_fields;
}
add_filter( 'attachment_fields_to_edit', 'kgvid_image_attachment_fields_to_edit', 10, 2 );

function kgvid_add_video_stats_column( $cols ) {
	// add Video Stats column to media library

	$cols['video_stats'] = esc_html__( 'Video Stats', 'video-embed-thumbnail-generator' );
	return $cols;
}
add_filter( 'manage_media_columns', 'kgvid_add_video_stats_column' );

function kgvid_video_stats_column_data( $column_name, $id ) {

	if ( $column_name == 'video_stats' ) {

		$kgvid_postmeta = kgvid_get_attachment_meta( $id );
		if ( is_array( $kgvid_postmeta ) && array_key_exists( 'starts', $kgvid_postmeta ) && intval( $kgvid_postmeta['starts'] ) > 0 ) {
			/* translators: Start refers to the number of times a video has been started */
			wp_kses_post( printf( esc_html( _n( '%1$s%2$d%3$s Play', '%1$s%2$d%3$s Plays', intval( $kgvid_postmeta['starts'] ), 'video-embed-thumbnail-generator' ) ), '<strong>', esc_html( intval( $kgvid_postmeta['starts'] ) ), '</strong>' ) );
			echo '<br><strong>' . esc_html( intval( $kgvid_postmeta['play_25'] ) ) . '</strong> 25%' .
			'<br><strong>' . esc_html( intval( $kgvid_postmeta['play_50'] ) ) . '</strong> 50%' .
			'<br><strong>' . esc_html( intval( $kgvid_postmeta['play_75'] ) ) . '</strong> 75%<br>';
			/* translators: %1$s%2$d%3$s is '<strong>', a number, '</strong>' */
			printf( esc_html( _n( '%1$s%2$d%3$s Complete View', '%1$s%2$d%3$s Complete Views', intval( $kgvid_postmeta['completeviews'] ), 'video-embed-thumbnail-generator' ) ), '<strong>', esc_html( $kgvid_postmeta['completeviews'] ), '</strong>' );

		}
	}
}
add_action( 'manage_media_custom_column', 'kgvid_video_stats_column_data', 10, 2 );

function kgvid_hide_video_children( $wp_query_obj ) {

	if ( is_admin()
		&& is_array( $wp_query_obj->query_vars )
		&& ( array_key_exists( 'post_type', $wp_query_obj->query_vars ) && $wp_query_obj->query_vars['post_type'] == 'attachment' ) // only deal with attachments
		&& ! array_key_exists( 'post_mime_type', $wp_query_obj->query_vars ) // show children when specifically displaying videos
		&& ( array_key_exists( 'posts_per_page', $wp_query_obj->query_vars ) && $wp_query_obj->query_vars['posts_per_page'] > 0 ) // hide children only when showing paged content (makes sure that -1 will actually return all attachments)
	) {

		$meta_query = $wp_query_obj->get( 'meta_query' );
		if ( ! is_array( $meta_query ) ) {
			$meta_query = array();
		}
		$meta_query[] = array(
			'key'     => '_kgflashmediaplayer-format',
			'compare' => 'NOT EXISTS',
		);
		$wp_query_obj->set(
			'meta_query',
			$meta_query
		);

	}//end if
}
add_action( 'pre_get_posts', 'kgvid_hide_video_children' );

function kgvid_decode_base64_png( $raw_png, $tmp_posterpath ) {

	$raw_png     = str_replace( 'data:image/png;base64,', '', $raw_png );
	$raw_png     = str_replace( 'data:image/jpeg;base64,', '', $raw_png );
	$raw_png     = str_replace( ' ', '+', $raw_png );
	$decoded_png = base64_decode( $raw_png );
	$success     = file_put_contents( $tmp_posterpath, $decoded_png );
	$editor      = wp_get_image_editor( $tmp_posterpath );

	return $editor;
}

function kgvid_save_thumb( $post_id, $post_name, $thumb_url, $index = false ) {

	$user_ID = get_current_user_id();
	$options = kgvid_get_options();
	$uploads = wp_upload_dir();

	$posterfile       = pathinfo( $thumb_url, PATHINFO_BASENAME );
	$tmp_posterpath   = $uploads['path'] . '/thumb_tmp/' . $posterfile;
	$final_posterpath = $uploads['path'] . '/' . $posterfile;

	if ( is_file( $final_posterpath ) ) {

		$old_thumb_id = attachment_url_to_postid( $thumb_url );

		if ( ! $old_thumb_id ) { // should be there but check if it was so big it was scaled down
			$old_thumb_id = attachment_url_to_postid( str_replace( '.jpg', '-scaled.jpg', $thumb_url ) );
		}

		if ( $old_thumb_id ) {

			$existing_posterpath = wp_get_original_image_path( $old_thumb_id );

			if ( is_file( $tmp_posterpath )
				&& abs( filemtime( $tmp_posterpath ) - filemtime( $existing_posterpath ) ) > 10 // file modified time more than 10 seconds different
				&& abs( filesize( $tmp_posterpath ) - filesize( $existing_posterpath ) ) > 100 // filesize is more than 100 bytes different means it's probably a different image
			) {

				$posterfile_noextension = pathinfo( $thumb_url, PATHINFO_FILENAME );

				$thumb_index = $index;
				if ( $thumb_index === false ) {
					$thumb_index = substr( $posterfile_noextension, strpos( $posterfile_noextension, '_thumb' ) + 6 );
				}

				if ( $thumb_index === false ) { // nothing after "_thumb"
					$thumb_index        = 1;
					$posterfile_noindex = $posterfile_noextension;
				} else {
					$posterfile_noindex = str_replace( '_thumb' . $thumb_index, '_thumb', $posterfile_noextension );
					$thumb_index        = intval( $thumb_index );
					++$thumb_index;
				}

				while ( is_file( $uploads['path'] . '/' . $posterfile_noindex . $thumb_index . '.jpg' ) ) {
					++$thumb_index; // increment the filename until we get one that doesn't exist
				}

				$final_posterpath = $uploads['path'] . '/' . $posterfile_noindex . $thumb_index . '.jpg';
				$thumb_url        = $uploads['url'] . '/' . $posterfile_noindex . $thumb_index . '.jpg';

			} else { // if a new thumbnail was just entered that's exactly the same as the old one, use the old one

				$arr = array(
					'thumb_id'  => $old_thumb_id,
					'thumb_url' => $thumb_url,
				);
				return $arr;

			}
		}
	}

	$success = false;
	if ( ! is_file( $final_posterpath ) && is_file( $tmp_posterpath ) ) { // if the file doesn't already exist and the tmp one does
		$success = copy( $tmp_posterpath, $final_posterpath );
	}

	// insert the $thumb_url into the media library if it does not already exist

	if ( $success ) { // new file was copied into uploads directory

		unlink( $tmp_posterpath );

		$desc = $post_name . ' ' . esc_html_x( 'thumbnail', 'text appended to newly created thumbnail titles', 'video-embed-thumbnail-generator' );
		if ( $index ) {
			$desc .= ' ' . $index;
		}

		// is image in uploads directory?
		$upload_dir = wp_upload_dir();

		$video = get_post( $post_id );
		if ( $options['thumb_parent'] === 'post' ) {
			if ( ! empty( $video->post_parent ) ) {
				$post_id = $video->post_parent;
			}
		}

		if ( false !== strpos( $thumb_url, $upload_dir['baseurl'] ) ) {
			$wp_filetype = wp_check_filetype( basename( $thumb_url ), null );
			if ( $user_ID == 0 ) {
				$user_ID = $video->post_author;
			}

			$attachment = array(
				'guid'           => $thumb_url,
				'post_mime_type' => $wp_filetype['type'],
				'post_title'     => $desc,
				'post_content'   => '',
				'post_status'    => 'inherit',
				'post_author'    => $user_ID,
			);

			$thumb_id = wp_insert_attachment( $attachment, $final_posterpath, $post_id );
			// you must first include the image.php file
			// for the function wp_generate_attachment_metadata() to work
			require_once ABSPATH . 'wp-admin/includes/image.php';
			$attach_data = wp_generate_attachment_metadata( $thumb_id, $final_posterpath );
			wp_update_attachment_metadata( $thumb_id, $attach_data );
		} else { // not in uploads so we'll have to sideload it
			$tmp = download_url( $thumb_url );

			// Set variables for storage
			// fix file filename for query strings
			preg_match( '/[^\?]+\.(jpg|JPG|jpe|JPE|jpeg|JPEG|gif|GIF|png|PNG)/', $thumb_url, $matches );
			$file_array['name']     = basename( $matches[0] );
			$file_array['tmp_name'] = $tmp;

			// If error storing temporarily, unlink
			if ( is_wp_error( $tmp ) ) {
				@unlink( $file_array['tmp_name'] );
				$file_array['tmp_name'] = '';
			}

			// do the validation and storage stuff
			$thumb_id = media_handle_sideload( $file_array, $post_id, $desc );

			// If error storing permanently, unlink
			if ( is_wp_error( $thumb_id ) ) {
				@unlink( $file_array['tmp_name'] );
				$arr = array(
					'thumb_id'  => $thumb_id,
					'thumb_url' => $thumb_url,
				);
				return $arr;
			}

			if ( $local_src === wp_get_attachment_url( $thumb_id ) ) {
				update_post_meta( $post_id, '_kgflashmediaplayer-poster', $local_src );
			}
		} //end sideload

		$thumb_id = intval( $thumb_id );
		update_post_meta( $post_id, '_kgflashmediaplayer-poster-id', $thumb_id );
		update_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', $video->ID );

	} //end copied new file into uploads directory
	else {
		$thumb_id = false;
	}

	$arr = array(
		'thumb_id'  => $thumb_id,
		'thumb_url' => $thumb_url,
	);
	return $arr;
}


/**
 * @param array $post
 * @param array $attachment
 * @return array
 */
function kgvid_video_attachment_fields_to_save( $post, $attachment ) {
	// $attachment part of the form $_POST ($_POST[attachments][postID])
	// $post attachments wp post array - will be saved after returned
	// $post['post_type'] == 'attachment'
	static $flag = 0;

	if ( ! empty( $post['ID'] ) && isset( $attachment['kgflashmediaplayer-url'] ) && $flag < 1 ) {

		$options    = kgvid_get_options();
		$attachment = kgvid_sanitize_text_field( $attachment );

		$thumb_id = '';
		if ( isset( $attachment['kgflashmediaplayer-poster'] ) ) {

			$thumb_url = $attachment['kgflashmediaplayer-poster'];

			if ( ! empty( $thumb_url ) ) {

				$thumb_info = kgvid_save_thumb( $post['ID'], $post['post_title'], $thumb_url );
				$thumb_id   = $thumb_info['thumb_id'];
				$thumb_url  = $thumb_info['thumb_url'];

				if ( $thumb_id ) {
					update_post_meta( $post['ID'], '_kgflashmediaplayer-poster-id', $thumb_id );
				}
			}

			if ( empty( $thumb_url ) ) {
				delete_post_meta( $post['ID'], '_kgflashmediaplayer-poster' );
				delete_post_meta( $post['ID'], '_kgflashmediaplayer-poster-id' );
				delete_post_thumbnail( $post['ID'] );
			} else {

				update_post_meta( $post['ID'], '_kgflashmediaplayer-poster', $thumb_url );

				if ( empty( $thumb_id ) ) { // we're not saving a new thumbnail
					$poster_id = get_post_meta( $post['ID'], '_kgflashmediaplayer-poster-id', true );
					if ( empty( $poster_id ) ) { // the poster_id meta was accidentally deleted
						$thumb_url_id = attachment_url_to_postid( $thumb_url );
						if ( $thumb_url_id ) {
							update_post_meta( $post['ID'], '_kgflashmediaplayer-poster-id', $thumb_url_id );
						}
					}
				}
			}
		}

		if ( isset( $attachment['kgflashmediaplayer-featured'] ) ) {

			if ( ! empty( $thumb_id ) ) {

				if ( isset( $_POST['action'] )
					&& $_POST['action'] === 'save-attachment-compat'
					&& isset( $_POST['post_id'] )
					&& isset( $_REQUEST['id'] )
				) { // if this is in the media modal
					$id = absint( $_REQUEST['id'] );
					check_ajax_referer( 'update-post_' . $id, 'nonce' );
					$post_parent = kgvid_sanitize_text_field( wp_unslash( $_POST['post_id'] ) );
				} elseif ( is_array( $post )
					&& array_key_exists( 'post_parent', $post )
				) {
					$post_parent = $post['post_parent'];
				}

				if ( isset( $post_parent ) ) {
					set_post_thumbnail( $post_parent, $thumb_id );
				} else {
					$attachment['kgflashmediaplayer-noparent'] = true;
				}
			}
		}

		if ( ! empty( $thumb_id ) ) { // always set the video's featured image regardless of the plugin setting
			set_post_thumbnail( $post['ID'], $thumb_id );
		}

		$video_formats = kgvid_video_formats( false, false );
		foreach ( $video_formats as $format => $format_stats ) {
			if ( ! isset( $attachment['kgflashmediaplayer-encode'][ $format ] ) ) {
				if ( is_array( $options['encode'] ) && ! array_key_exists( $format, $options['encode'] ) ) {
					$attachment['kgflashmediaplayer-encode'][ $format ] = 'false';
				} else {
					$attachment['kgflashmediaplayer-encode'][ $format ] = 'notchecked';
				}
			}
		}

		$checkboxes = array(
			'lockaspect',
			'forcefirst',
			'featured',
			'showtitle',
			'downloadlink',
		); // make sure unchecked checkbox values are saved
		foreach ( $checkboxes as $checkbox ) {
			if ( ! isset( $attachment[ 'kgflashmediaplayer-' . $checkbox ] ) ) {
				$attachment[ 'kgflashmediaplayer-' . $checkbox ] = 'false';
			}
		}

		if ( isset( $attachment['kgflashmediaplayer-track'] ) && is_array( $attachment['kgflashmediaplayer-track'] ) ) {
			foreach ( $attachment['kgflashmediaplayer-track'] as $track => $track_attribute ) {
				if ( ! array_key_exists( 'default', $track_attribute ) ) {
					$attachment['kgflashmediaplayer-track'][ $track ]['default'] = '';
				}
			}
		}

		$kgvid_postmeta = array();

		foreach ( $attachment as $kgflashmediaplayer_key => $value ) {
			if ( strpos( $kgflashmediaplayer_key, 'kgflashmediaplayer-' ) !== false && $kgflashmediaplayer_key != 'kgflashmediaplayer-security' ) {
				$key                    = str_replace( 'kgflashmediaplayer-', '', $kgflashmediaplayer_key );
				$kgvid_postmeta[ $key ] = $value;
			}
		}

		kgvid_save_attachment_meta( $post['ID'], $kgvid_postmeta );

	}
	++$flag;
	return $post;
}
add_filter( 'attachment_fields_to_save', 'kgvid_video_attachment_fields_to_save', null, 2 );

function kgvid_modify_media_insert( $html, $attachment_id, $attachment ) {

	$mime_type = get_post_mime_type( $attachment_id );

	if ( substr( $mime_type, 0, 5 ) == 'video' ) {

		$options = kgvid_get_options();

		$kgvid_postmeta = kgvid_get_attachment_meta( $attachment_id );

		if ( $kgvid_postmeta['embed'] == 'Single Video' ) {
			$html                        = '';
			$kgvid_postmeta['url']       = wp_get_attachment_url( $attachment_id );
			$kgvid_postmeta['title']     = get_the_title( $attachment_id );
			$kgvid_postmeta['poster']    = get_post_meta( $attachment_id, '_kgflashmediaplayer-poster', true );
			$kgvid_postmeta['poster-id'] = get_post_meta( $attachment_id, '_kgflashmediaplayer-poster-id', true );

			if ( $kgvid_postmeta['showtitle'] == 'on' ) {
				$titlecode = html_entity_decode( stripslashes( $options['titlecode'] ) );
				if ( substr( $titlecode, 0, 1 ) != '<' ) {
					$titlecode = '<' . wp_kses_post( $titlecode );
				}
				if ( substr( $titlecode, -1, 1 ) != '>' ) {
					$titlecode .= '>';
				}
				$endtitlecode       = str_replace( '<', '</', $titlecode );
				$endtitlecode_array = explode( ' ', $endtitlecode );
				if ( substr( $endtitlecode_array[0], -1 ) != '>' ) {
					$endtitlecode = $endtitlecode_array[0] . '>';
				}
				$html .= $titlecode . '<span itemprop="name">' . esc_html( $kgvid_postmeta['title'] ) . '</span>' . wp_kses_post( $endtitlecode ) . '<br />';
			}

			$html .= '[videopack id="' . esc_attr( $attachment_id ) . '"';
			if ( ! empty( $kgvid_postmeta['poster'] ) && empty( $kgvid_postmeta['poster-id'] ) ) {
				$html .= ' poster="' . esc_url( $kgvid_postmeta['poster'] ) . '"';
			}

			$insert_shortcode_atts = apply_filters(
				'kgvid_insert_shortcode_atts',
				array(
					'width',
					'height',
				)
			);

			foreach ( $insert_shortcode_atts as $att ) {
				if ( array_key_exists( $att, $kgvid_postmeta ) && ! empty( $kgvid_postmeta[ $att ] ) ) {
					$html .= ' ' . esc_attr( $att ) . '="' . esc_attr( $kgvid_postmeta[ $att ] ) . '"';
				}
			}

			$html .= ']' . esc_url( $kgvid_postmeta['url'] ) . '[/videopack]<br />';
		} //if embed code is enabled

		if ( $kgvid_postmeta['embed'] == 'Video Gallery' ) {

			$post      = get_post( $attachment_id );
			$parent_id = $post->post_parent;

			$html  = '';
			$html .= '[videopack gallery="true"';
			if ( ! empty( $kgvid_postmeta['gallery_thumb'] )
				&& $kgvid_postmeta['gallery_thumb'] != $options['gallery_thumb']
			) {
				$html .= ' gallery_thumb="' . esc_attr( $kgvid_postmeta['gallery_thumb'] ) . '"';
			}
			if ( ! empty( $kgvid_postmeta['gallery_exclude'] ) ) {
				$html .= ' gallery_exclude="' . esc_attr( $kgvid_postmeta['gallery_exclude'] ) . '"';
			}
			if ( ! empty( $kgvid_postmeta['gallery_include'] ) ) {
				$html .= ' gallery_include="' . esc_attr( $kgvid_postmeta['gallery_include'] ) . '"';
			}
			if ( ! empty( $kgvid_postmeta['gallery_orderby'] )
				&& $kgvid_postmeta['gallery_orderby'] != 'menu_order'
			) {
				$html .= ' gallery_orderby="' . esc_attr( $kgvid_postmeta['gallery_orderby'] ) . '"';
			}
			if ( ! empty( $kgvid_postmeta['gallery_order'] )
				&& $kgvid_postmeta['gallery_order'] != 'ASC'
			) {
				$html .= ' gallery_order="' . esc_attr( $kgvid_postmeta['gallery_order'] ) . '"';
			}
			if ( ! empty( $kgvid_postmeta['gallery_id'] )
				&& $kgvid_postmeta['gallery_id'] != $parent_id
			) {
				$html .= ' gallery_id="' . esc_attr( $kgvid_postmeta['gallery_id'] ) . '"';
			}
			$html .= '][/videopack]';
		}
	}

	return $html;
}
add_filter( 'media_send_to_editor', 'kgvid_modify_media_insert', 10, 3 );

function kgvid_embedurl_menu( $tabs ) {
	$newtab = array( 'embedurl' => esc_html_x( 'Embed Video from URL', 'Title in "Add Media" popup sidebar', 'video-embed-thumbnail-generator' ) );
	if ( is_array( $tabs ) ) {
		return array_merge( $tabs, $newtab );
	} else {
		return $newtab;
	}
}
add_filter( 'media_upload_tabs', 'kgvid_embedurl_menu' );

function kgvid_media_embedurl_process() {

	$options = kgvid_get_options();
	enqueue_kgvid_script();

	if ( ! isset( $options['ffmpeg_exists'] ) || $options['ffmpeg_exists'] == 'notchecked' ) {
		kgvid_check_ffmpeg_exists( $options, true );
		$options = kgvid_get_options();
	}

	$checkboxes    = kgvid_generate_encode_checkboxes( '', 'singleurl', 'attachment' );
	$maxheight = $options['height'];
	$maxwidth  = $options['width'];

	media_upload_header();
	include __DIR__ . '/partials/embed-url-page.php';
} //end media_embedurl_process

function kgvid_embedurl_handle() {
	return wp_iframe( 'kgvid_media_embedurl_process' );
}
add_action( 'media_upload_embedurl', 'kgvid_embedurl_handle' );

function kgvid_generate_old( $type ) {

	$queue = get_option( 'kgvid_video_embed_cms_switch' );

	if ( is_array( $queue )
		&& array_key_exists( 'generating_old_' . $type, $queue )
		&& is_array( $queue[ 'generating_old_' . $type ] )
	) {

		$x = 1;
		foreach ( $queue[ 'generating_old_' . $type ] as $video_id ) {

			kgvid_schedule_attachment_processing( $video_id, $type, $x );

			unset( $queue[ 'generating_old_' . $type ][ $video_id ] );
			update_option( 'kgvid_video_embed_cms_switch', $queue );
			++$x;
		}
		unset( $queue[ 'generating_old_' . $type ] );
		if ( empty( $queue ) ) {
			delete_option( 'kgvid_video_embed_cms_switch' );
		} else {
			update_option( 'kgvid_video_embed_cms_switch', $queue );
		}
	}
}

function kgvid_delete_video_attachment( $video_id ) {

	if ( strpos( get_post_mime_type( $video_id ), 'video' ) !== false
		|| get_post_meta( $video_id, '_kgflashmediaplayer-format', true )
	) { // only do this for videos or other child formats

		$parent_post        = get_post( $video_id );
		$options            = kgvid_get_options();
		$video_encode_queue = kgvid_get_encode_queue();
		$parent_id          = get_post( $video_id )->post_parent;
		$wp_attached_file   = get_post_meta( $video_id, '_wp_attached_file', true );

		if ( ! empty( $video_encode_queue ) ) { // remove any encode queue entry related to this attachment
			foreach ( $video_encode_queue as $video_key => $video_entry ) {
				if ( $video_entry['attachmentID'] == $video_id ) {

					foreach ( $video_entry['encode_formats'] as $format => $value ) {
						if ( $value['status'] == 'encoding' ) {
							kgvid_cancel_encode( $video_key, $format );
							if ( file_exists( $value['filepath'] ) ) {
								unlink( $value['filepath'] );
							}
						}
					}

					unset( $video_encode_queue[ $video_key ] );
					sort( $video_encode_queue );
					kgvid_save_encode_queue( $video_encode_queue );
					break;
				}//if the video is an original format
				if ( $video_entry['attachmentID'] == $parent_id
					|| get_post_meta( $video_id, '_kgflashmediaplayer-externalurl', true ) == $video_entry['movieurl']
				) {
					foreach ( $video_entry['encode_formats'] as $format => $value ) {
						if ( array_key_exists( 'filepath', $value ) ) {
							if ( strpos( $value['filepath'], $wp_attached_file ) !== false ) {
								$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status'] = 'deleted';
								kgvid_save_encode_queue( $video_encode_queue );
								break;
							}//if the format has filepath information
						}//if the encoded child format is in the database
					}//loop through formats
				}//if the video is a child format
			}
		}

		$args  = array(
			'post_parent' => $video_id,
			'post_type'   => 'attachment',
			'numberposts' => '-1',
		);
		$posts = get_posts( $args ); // find all children of the video in the database
		if ( $posts ) {
			$formats = array();
			foreach ( $posts as $post ) {
				wp_update_post(
					array(
						'ID'          => $post->ID,
						'post_parent' => $parent_id,
					)
				); // set post_parent field to the original video's post_parent
				if ( $options['delete_children'] != 'none' ) {
					if ( $options['delete_children'] == 'all' ) {
						wp_delete_attachment( $post->ID, true );
					} elseif ( strpos( $post->post_mime_type, 'video' ) !== false ) {
						wp_delete_attachment( $post->ID, true );
					} //only delete videos
				} elseif ( strpos( $post->post_mime_type, 'video' ) !== false ) {
						$format = get_post_meta( $post->ID, '_kgflashmediaplayer-format', true );
					if ( $format ) {
						$formats[ $format ] = $post->ID;
					}
				}
			}//end loop
			if ( $options['delete_children'] == 'none' ) { // find a child to be the new master video
				$video_formats = kgvid_video_formats();
				foreach ( $video_formats as $format => $format_stats ) {
					if ( array_key_exists( $format, $formats ) ) {
						$new_master = $formats[ $format ];
						unset( $formats[ $format ] );
						delete_post_meta( $new_master, '_kgflashmediaplayer-format' ); // master videos don't have the child format meta info
						wp_update_post(
							array(
								'ID'         => $new_master,
								'post_title' => get_the_title( $video_id ),
							)
						); // set the new master's title to the old master's title
						foreach ( $formats as $child_id ) {
							wp_update_post(
								array(
									'ID'          => $child_id,
									'post_parent' => $new_master,
								)
							); // set all the other children as the new master's child
						}
						break; // stop after the highest quality format;
					}
				}
			}
		} //end if there are any children
	} //end if video or other child format

	elseif ( strpos( get_post_mime_type( $video_id ), 'image' ) !== false ) {
		$args  = array(
			'numberposts' => '-1',
			'post_type'   => 'attachment',
			'meta_key'    => '_kgflashmediaplayer-poster-id',
			'meta_value'  => $video_id,
		);
		$posts = get_posts( $args ); // find all posts that have this thumbnail ID in their meta
		if ( $posts ) {
			foreach ( $posts as $post ) {
				delete_post_meta( $post->ID, '_kgflashmediaplayer-poster-id' );
				delete_post_meta( $post->ID, '_thumbnail-id' );
				delete_post_meta( $post->ID, '_kgflashmediaplayer-poster' );
			}
		}
	}

	$transient_name = kgvid_set_transient_name( wp_get_attachment_url( $video_id ) );
	delete_transient( 'kgvid_' . $transient_name );
}
add_action( 'delete_attachment', 'kgvid_delete_video_attachment' );

function kgvid_add_contextual_help_tab() {

	$false_code = '<code>"false"</code>';
	/* translators: %s is '<code>"false"</code>' */
	get_current_screen()->add_help_tab(
		array(
			'id'      => 'kgvid-help-tab',
			'title'   => esc_html__( 'Videopack Shortcode Reference', 'video-embed-thumbnail-generator' ),
			'content' => '<p><strong>' . esc_html__( 'Use these optional attributes in the [videopack] shortcode:', 'video-embed-thumbnail-generator' ) . '</strong></p>
<ul><li><code>id="xxx"</code> ' . esc_html__( 'video attachment ID (instead of using a URL).', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>videos="x"</code> ' . esc_html__( 'number of attached videos to display if no URL or ID is given.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>orderby="menu_order/title/post_date/rand/ID"</code> ' . esc_html__( 'criteria for sorting attached videos if no URL or ID is given.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>order="ASC/DESC"</code> ' . esc_html__( 'sort order.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>poster="https://www.example.com/image.jpg"</code> ' . esc_html__( 'sets the thumbnail.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>endofvideooverlay="https://www.example.com/end_image.jpg"</code> ' . esc_html__( 'sets the image shown when the video ends.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>width="xxx"</code></li>
<li><code>height="xxx"</code></li>
<li><code>fullwidth="true/false"</code> ' . esc_html__( 'set video to always expand to fill its container.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>fixed_aspect="false/vertical/true"</code> ' . esc_html__( 'set video to conform to the default aspect ratio. Vertical applies only if the video height is greater than the width.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>align="left/right/center"</code></li>
<li><code>inline="true/false"</code> ' . esc_html__( 'allow other content on the same line as the video', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>volume="0.x"</code> ' . esc_html__( 'pre-sets the volume for unusually loud videos. Value between 0 and 1.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>muted="true/false"</code> ' . esc_html__( 'Mutes the audio.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>controls="true/false"</code> ' . esc_html__( 'Enables video controls.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>loop="true/false"</code></li>
<li><code>autoplay="true/false"</code></li>
<li><code>playsinline="true/false"</code> ' . esc_html__( 'Play inline on iPhones instead of fullscreen.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>gifmode="true/false"</code> ' . esc_html__( 'Videos behave like animated GIFs. autoplay, muted, loop, and playsinline will be enabled. Controls and other overlays will be disabled.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>pauseothervideos="true/false"</code> ' . esc_html__( 'video will pause other videos on the page when it starts playing.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>preload="metadata/auto/none"</code> ' . esc_html__( 'indicate how much of the video should be loaded when the page loads.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>start="mm:ss"</code> ' . esc_html__( 'video will start playing at this timecode.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>watermark="https://www.example.com/image.png"</code> ' . sprintf( esc_html__( 'or %s to disable.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
<li><code>watermark_link_to="home/parent/attachment/download/false"</code></li>
<li><code>watermark_url="https://www.example.com/"</code> ' . sprintf( esc_html__( 'or %s to disable. If this is set, it will override the watermark_link_to setting.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
<li><code>title="Video Title"</code> ' . sprintf( esc_html__( 'or %s to disable.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
<li><code>embeddable="true/false"</code> ' . esc_html__( 'enable or disable video embedding and sharing icons.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>embedcode="html code"</code> ' . sprintf( esc_html__( 'changes text displayed in the embed code overlay in order to provide a custom method for embedding a video or %s to disable.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
<li><code>view_count="true/false"</code> ' . esc_html__( 'turns the view count on or off.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>count_views="quarters/start_complete/start/false"</code> ' . esc_html__( 'sets the level of video view counting.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>caption="Caption"</code> ' . esc_html__( 'text that is displayed below the video (not subtitles or closed captioning)', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>description="Description"</code> ' . esc_html__( 'Used for metadata only.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>downloadlink="true/false"</code> ' . esc_html__( 'shows a download icon overlay to make it easier for users to save the video file to their computers.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>right_click="true/false"</code> ' . esc_html__( 'allow or disable right-clicking on the video player.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>resize="true/false"</code> ' . esc_html__( 'allow or disable responsive resizing.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>auto_res="automatic/highest/lowest/1080p/720p/360p/custom"</code> ' . esc_html__( 'specify the video resolution when the page loads.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>pixel_ratio="true/false"</code> ' . esc_html__( 'account for high-density (retina) displays when choosing automatic video resolution.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>schema="true/false"</code> ' . esc_html__( 'allow or disable Schema.org search engine metadata.', 'video-embed-thumbnail-generator' ) . '</li></ul>

<p><strong>' . esc_html__( 'These options will add a subtitle/caption track.', 'video-embed-thumbnail-generator' ) . '</strong></p>
<ul><li><code>track_src="http://www.example.com/subtitles.vtt_.txt"</code> ' . esc_html__( 'URL of the WebVTT file.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>track_kind=subtitles/captions/chapters</code></li>
<li><code>track_srclang=xx</code> ' . esc_html__( 'the track\'s two-character language code (en, fr, es, etc)', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>track_label="Track Label"</code> ' . esc_html__( 'text that will be shown to the user when selecting the track.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>track_default="default"</code> ' . esc_html__( 'track is enabled by default.', 'video-embed-thumbnail-generator' ) . '</li></ul>

<p><strong>' . esc_html__( 'These options will only affect Video.js playback', 'video-embed-thumbnail-generator' ) . '</strong></p>
<ul><li><code>skin="example-css-class"</code> ' . sprintf( esc_html__( 'Completely change the look of the video player. %sInstructions here.', 'video-embed-thumbnail-generator' ), '<a href="http://codepen.io/heff/pen/EarCt">' ) . '</a></li>
<li><code>nativecontrolsfortouch="true/false"</code> ' . esc_html__( 'enables or disables native controls on touchscreen devices.', 'video-embed-thumbnail-generator' ) . '</li>
</ul>

<p><strong>' . esc_html__( 'These options are available for video galleries (options work the same as standard WordPress image galleries)', 'video-embed-thumbnail-generator' ) . '</p></strong>
<ul><li><code>gallery="true"</code> ' . esc_html__( 'turns on the gallery', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>gallery_thumb="xxx"</code> ' . esc_html__( 'width in pixels to display gallery thumbnails', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>gallery_exclude="15"</code> ' . esc_html__( 'comma separated video attachment IDs. Excludes the videos from the gallery.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>gallery_include="65"</code> ' . esc_html__( 'comma separated video attachment IDs. Includes only these videos in the gallery. Please note that include and exclude cannot be used together.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>gallery_orderby="menu_order/title/post_date/rand/ID"</code> ' . esc_html__( 'criteria for sorting the gallery', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>gallery_order="ASC/DESC"</code> ' . esc_html__( 'sort order', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>gallery_id="241"</code> ' . esc_html__( 'post ID to display a gallery made up of videos associated with a different post.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>gallery_end="close/next"</code> ' . esc_html__( 'either close the pop-up or start playing the next video when the current video finishes playing.', 'video-embed-thumbnail-generator' ) . '</li>
<li><code>gallery_per_page="xx"</code> ' . sprintf( esc_html__( 'or %s to disable pagination. Number of video thumbnails to show on each gallery page.', 'video-embed-thumbnail-generator' ), $false_code ) . '</li>
<li><code>gallery_title="true/false"</code> ' . esc_html__( 'display the title overlay on gallery thumbnails.', 'video-embed-thumbnail-generator' ) . '</li></ul>',
		)
	);
}
add_action( 'admin_head-post.php', 'kgvid_add_contextual_help_tab' );
add_action( 'admin_head-post-new.php', 'kgvid_add_contextual_help_tab' );

function kgvid_save_post( $post_id ) {

	$options = kgvid_get_options();

	if ( ! wp_is_post_revision( $post_id ) && ! wp_is_post_autosave( $post_id )
		&& ( $options['open_graph'] == 'on' || $options['twitter_card'] == 'on' )
	) {
		// render the post when it's saved in case there's a do_shortcode call in it so open graph metadata makes it into wp_head()
		$response = wp_remote_get( get_permalink( $post_id ), array( 'blocking' => false ) );

	}
}
add_action( 'save_post', 'kgvid_save_post' );

function kgvid_delete_transients() {

	global $wpdb;

	delete_expired_transients();

	$t = esc_sql( '_transient_timeout_kgvid%' );

	$transients = $wpdb->get_col(
		$wpdb->prepare(
			"SELECT option_name
			FROM $wpdb->options
			WHERE option_name LIKE %s",
			$t
		)
	);

	if ( $transients && is_array( $transients ) ) {
		foreach ( $transients as $transient ) {

			// Strip away the WordPress prefix in order to arrive at the transient key.
			$key = str_replace( '_transient_timeout_', '', $transient );

			// Now that we have the key, use WordPress core to the delete the transient.
			delete_transient( $key );

		}
	}
}
