<?php

/**
 * The public-facing functionality of the Videopack plugin.
 *
 * @link       https://www.videopack.video
 *
 * @package    Videopack
 * @subpackage Plugin_Name/public
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */

 if ( ! defined( 'ABSPATH' ) ) {
	die( "Can't load this file directly" );
}

function kgvid_allowed_html() {

	$allowed_html = wp_kses_allowed_html('post');

	$kgvid_allowed_html = array(
		'div' => array(
			'class' => true,
			'style' => true,
			'id' => true,
			'data-*' => true,
			'itemprop' => true,
			'itemscope' => true,
			'itemtype' => true,
			'onclick' => true,
		),
		'span' => array(
			'id' => true,
			'class' => true,
			'onclick' => true,
			'style' => true,
		),
		'meta' => array(
			'itemprop' => true,
			'content' => true,
		),
		'video' => array(
			'class' => true,
			'id' => true,
			'width' => true,
			'height' => true,
			'poster' => true,
			'preload' => true,
			'controls' => true,
			'autoplay' => true,
			'loop' => true,
			'muted' => true,
			'src' => true,
			'playsinline' => true,
		),
		'source' => array(
			'src' => true,
			'data-res' => true,
			'type' => true,
		),
		'track' => array(
			'id',
			'kind',
			'src',
			'srclang',
			'label',
			'default',
		),
		'a' => array(
			'href' => true,
			'title' => true,
			'onclick' => true,
			'target' => true,
		),
		'input' => array(
			'class' => true,
			'type' => true,
			'value' => true,
			'onclick' => true,
			'onkeyup' => true,
		),
		'img' => array(
			'src' => true,
			'srcset' => true,
			'alt' => true,
		),
		'button' => array(
			'class' => true,
			'style' => true,
		),
	);

	$allowed_html = kgvid_array_merge_recursive_overwrite($allowed_html, $kgvid_allowed_html);

	add_filter('safe_style_css', 'kgvid_safe_css');

	return $allowed_html;

}

function kgvid_safe_css($styles) {

	$styles[] = 'display'; //allow styles in the shortcode code that only have 'display'
	$styles[] = 'visibility';

	return $styles;

}


function kgvid_array_merge_recursive_overwrite($array1, $array2) {
    foreach ($array2 as $key => $value) {
        if (array_key_exists($key, $array1) && is_array($value)) {
            $array1[$key] = kgvid_array_merge_recursive_overwrite($array1[$key], $array2[$key]);
        } else {
            $array1[$key] = $value;
        }
    }
    return $array1;
}

function kgvid_get_videojs_locale() {

	$options = kgvid_get_options();
	$locale = get_locale();

	$locale_conversions = array( //all Video.js language codes are two-character except these
		'pt-BR' => 'pt_BR',
		'pt-PT' => 'pt_PT',
		'zh-CN' => 'zh_CN',
		'zh-TW' => 'zh_TW'
	);
	if ( $options['embed_method'] == "Video.js" ) { //v5 doesn't have pt-PT
		$locale_conversions['pt-BR'] = 'pt_PT';
	}

	$matching_locale = array_search($locale, $locale_conversions);
	if ( $matching_locale !== false ) {
		$locale = $matching_locale;
	}
	else {
		$locale = substr($locale, 0, 2);
	}

	return $locale;

}

function kvid_readfile_chunked($file, $retbytes=TRUE) { //sends large files in chunks so PHP doesn't timeout

	$chunksize = 1 * (1024 * 1024);
	$buffer = '';
	$cnt = 0;

	$handle = fopen($file, 'r');
	if ($handle === FALSE) { return FALSE; }

	$download_log = apply_filters( 'kg_file_download_logger_start', false );

	$output_resource = fopen( 'php://output', 'w' );

	while (!feof($handle)) {

		$buffer = fread($handle, $chunksize);
		fwrite( $output_resource, $buffer );
		if ( ob_get_length() ) {
			ob_flush();
			flush();
		}

		if ($retbytes) { $cnt += strlen($buffer); }

	}

	$status = fclose($handle);

	if ( $download_log ) {
		if ( $cnt == filesize($file) ) {
			$complete = true;
		}
		else {
			$complete = false;
		}
		do_action( 'kg_file_download_logger_end', $download_log, $complete );
	}

	if ($retbytes AND $status) { return $cnt; }

	return $status;

}

function kgvid_get_attachment_medium_url( $id ) {

    $medium_array = image_downsize( $id, 'medium' );
    $medium_path = $medium_array[0];

    return $medium_path;
}

function kgvid_video_embed_enqueue_styles() {

	$options = kgvid_get_options();
	$kgvid_video_embed_script_dependencies = array('jquery');

	//Video.js styles

	if ( $options['embed_method'] == "Video.js" ||  $options['embed_method'] == "Video.js v7" ) {

		$kgvid_video_embed_script_dependencies[] = 'video-js';

		if ( $options['embed_method'] == "Video.js" ) {

			$videojs_register = array(
				'version' => '5.20.5',
				'path' => 'v5'
			);

		}
		if ( $options['embed_method'] == "Video.js v7" ) {

			$videojs_register = array(
				'version' => $options['videojs_version'],
				'path' => 'v7'
			);

		}

		wp_register_script( 'video-js', plugins_url("", __FILE__).'/js/video-js/'.$videojs_register['path'].'/video.min.js', '', $videojs_register['version'], true );
		wp_register_script( 'video-quality-selector', plugins_url("", __FILE__).'/js/video-js/'.$videojs_register['path'].'/video-quality-selector.js', array('video-js'), $options['version'], true );
		wp_enqueue_style( 'video-js', plugins_url("", __FILE__).'/js/video-js/'.$videojs_register['path'].'/video-js.min.css', '', $videojs_register['version'] );
		if ( $options['js_skin'] == 'kg-video-js-skin' ){ wp_enqueue_style( 'video-js-kg-skin', plugins_url("", __FILE__).'/js/video-js/'.$videojs_register['path'].'/kg-video-js-skin.css', '', $options['version'] ); }

		$locale = kgvid_get_videojs_locale();
		if ( $locale != 'en' && file_exists(plugin_dir_path(__FILE__).'/js/video-js/'.$videojs_register['path'].'/lang/'.$locale.'.js')) {
			wp_register_script( 'videojs-l10n', plugins_url("", __FILE__).'/js/video-js/'.$videojs_register['path'].'/lang/'.$locale.'.js', array('video-js'), $videojs_register['version'], true );
		}

	}

	wp_register_script( 'kgvid_video_embed', plugins_url("/js/videopack.js", __FILE__), $kgvid_video_embed_script_dependencies, $options['version'], true );

	wp_localize_script( 'kgvid_video_embed', 'kgvidL10n_frontend', array(
		'ajaxurl' => admin_url( 'admin-ajax.php', is_ssl() ? 'admin' : 'http' ),
		'ajax_nonce' => wp_create_nonce('kgvid_frontend_nonce'),
		'playstart' => esc_html_x("Play Start", 'noun for Google Analytics event', 'video-embed-thumbnail-generator'),
		'pause' => esc_html_x("Pause", 'noun for Google Analytics event', 'video-embed-thumbnail-generator'),
		'resume' => esc_html_x("Resume", 'noun for Google Analytics event', 'video-embed-thumbnail-generator'),
		'seek' => esc_html_x("Seek", 'noun for Google Analytics event', 'video-embed-thumbnail-generator'),
		'end' => esc_html_x("Complete View", 'noun for Google Analytics event', 'video-embed-thumbnail-generator'),
		'next' => esc_html_x("Next", 'button text to play next video', 'video-embed-thumbnail-generator'),
		'previous' => esc_html_x("Previous", 'button text to play previous video', 'video-embed-thumbnail-generator'),
		'quality' => esc_html_x("Quality", 'text above list of video resolutions', 'video-embed-thumbnail-generator'),
		'fullres' => esc_html_x("Full", 'Full resolution', 'video-embed-thumbnail-generator')
	) );

	wp_register_script( 'simplemodal', plugins_url('/js/jquery.simplemodal.1.4.5.min.js', __FILE__), '', '1.4.5', true );

	if ( $options['embed_method'] == "WordPress Default" ) {

		wp_register_script( 'mejs_sourcechooser', plugins_url( '/js/mejs-source-chooser.js', __FILE__ ), array( 'mediaelement' ), $options['version'], true );

		wp_register_script( 'mejs-speed', plugins_url( '/js/mejs-speed.js', __FILE__ ), array( 'mediaelement' ), $options['version'], true );

		wp_enqueue_style( 'video-js', plugins_url("", __FILE__).'/js/video-js/v7/video-js.min.css', '', $options['videojs_version'] ); //gives access to video-js icons for resolution gear selector and social logos

	}

	//plugin-related frontend styles, requires video-js
	if ( $options['embed_method'] != 'None' ) {
		wp_enqueue_style( 'kgvid_video_styles', plugins_url("/css/videopack-styles.css", __FILE__), array( 'video-js' ), $options['version'] );
	}

	if ( $options['alwaysloadscripts'] == 'on' ) {
		kgvid_enqueue_shortcode_scripts();
		wp_enqueue_script( 'simplemodal', plugins_url("/js/jquery.simplemodal.1.4.5.min.js", __FILE__), '', '1.4.5', true );
	}

}
add_action('wp_enqueue_scripts', 'kgvid_video_embed_enqueue_styles', 12);

function kgvid_get_first_embedded_video( $post ) {

	$url = '';
	$attributes = array();

	$first_embedded_video_meta = get_post_meta($post->ID, '_kgvid_first_embedded_video', true);

	if ( !empty($first_embedded_video_meta) ) {

		if ( is_array($first_embedded_video_meta['atts']) ) {
			$dataattributes = array_map('kgvid_build_paired_attributes', array_values($first_embedded_video_meta['atts']), array_keys($first_embedded_video_meta['atts']));

			$dataattributes = ' '.implode(' ', $dataattributes);
		}
		else { $dataattributes = $first_embedded_video_meta['atts']; }

		$shortcode_text = '[videopack'.$dataattributes.']'.$first_embedded_video_meta['content'].'[/videopack]';

	}
	else { $shortcode_text = $post->post_content; }

	$pattern = get_shortcode_regex();
	preg_match_all( '/'. $pattern .'/s', $shortcode_text, $matches );

	if ( is_array($matches)
		&& array_key_exists( 2, $matches ) && array_key_exists( 5, $matches )
		&& ( in_array( 'videopack', $matches[2] )
			|| in_array( 'VIDEOPACK', $matches[2] )
			|| in_array( 'KGVID', $matches[2] )
			|| in_array( 'FMP', $matches[2] )
		)
	) { //if videopack, KGVID, or FMP shortcode is in posts on this page.

		if ( isset($matches) ) {

			$shortcode_names = array('videopack',
				'VIDEOPACK',
				'KGVID',
				'FMP'
			);

			foreach ($shortcode_names as $shortcode ) {
				$first_key = array_search($shortcode, $matches[2]);
				if ( $first_key !== false ) {
					break;
				}
			}

			if ( $first_key !== false ) {

				$url = "";

				if ( array_key_exists( 3, $matches ) ) {
					$attributes = shortcode_parse_atts($matches[3][$first_key]);
				}

				if ( is_array($attributes) && array_key_exists( 'id', $attributes ) ) {
					$url = wp_get_attachment_url($attributes['id']);
				}//if there's an ID attribute

				elseif ( !empty($matches[5][$first_key]) ) { //there's a URL but no ID

					$url = $matches[5][$first_key];
					if ( !is_array($attributes) ) {
						$attributes = array();
					}
					$attributes['id'] = kgvid_url_to_id($matches[5][$first_key]);

				}

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
						if ( empty($attributes) ) {
							$attributes = array();
						}
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

		if ( is_array($attributes) && array_key_exists( 'id', $attributes ) ) {

			$kgvid_postmeta = kgvid_get_attachment_meta($attributes['id']);
			$kgvid_postmeta['poster'] = get_post_meta($attributes['id'], "_kgflashmediaplayer-poster", true);
			$dimensions = kgvid_set_video_dimensions($attributes['id']);
			$attributes = array_merge($dimensions, array_filter($kgvid_postmeta), $attributes);

		}

	}

	if ( !is_array($attributes) ) {
		$attributes = array();
	}

	$attributes['url'] = $url;
	return $attributes;

}

function kgvid_video_embed_print_scripts() {

	global $wpdb;

    $posts = get_posts();
	$pattern = get_shortcode_regex();
	$options = kgvid_get_options();

	if ( !empty($posts) && is_array($posts) ) {
		foreach ( $posts as $post ) {
			$first_embedded_video = kgvid_get_first_embedded_video( $post );
			if ( !empty($first_embedded_video['url']) ) { //if KGVID or FMP shortcode is in posts on this page.

				if ( $options['open_graph'] == "on" ) {

					remove_action('wp_head','jetpack_og_tags');
					echo '<meta property="og:url" content="'.esc_url(get_permalink($post)).'" >'."\n";
					echo '<meta property="og:title" content="'.esc_attr(get_the_title($post)).'" >'."\n";
					echo '<meta property="og:description" content="'.esc_attr(kgvid_generate_video_description($first_embedded_video, $post)).'" >'."\n";
					echo '<meta property="og:video" content="'.esc_url($first_embedded_video['url']).'" >'."\n";
					$secure_url = str_replace('http://', 'https://', $first_embedded_video['url']);
					echo '<meta property="og:video:secure_url" content="'.esc_url($secure_url).'" >'."\n";
					$mime_type_check = kgvid_url_mime_type($first_embedded_video['url'], $post->ID);
					echo '<meta property="og:video:type" content="'.esc_attr($mime_type_check['type']).'" >'."\n";

					if ( array_key_exists( 'width', $first_embedded_video ) ) {
						echo '<meta property="og:video:width" content="'.esc_attr($first_embedded_video['width']).'" >'."\n";
						if ( array_key_exists( 'height', $first_embedded_video ) ) {
							echo '<meta property="og:video:height" content="'.esc_attr($first_embedded_video['height']).'" >'."\n";
						}
					}

					if ( array_key_exists( 'poster', $first_embedded_video) ) {
						echo '<meta property="og:image" content="'.esc_url($first_embedded_video['poster']).'" >'."\n";
						if ( array_key_exists( 'width', $first_embedded_video ) ) {
						echo '<meta property="og:image:width" content="'.esc_attr($first_embedded_video['width']).'" >'."\n";
						if ( array_key_exists( 'height', $first_embedded_video ) ) {
							echo '<meta property="og:image:height" content="'.esc_attr($first_embedded_video['height']).'" >'."\n";
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
						echo '<meta name="twitter:image" content="'.esc_url(str_replace('http://', 'https://', $first_embedded_video['poster'])).'">'."\n";
					}
					echo '<meta name="twitter:player" content="'.esc_url(str_replace('http://', 'https://', get_attachment_link($first_embedded_video['id']))).'?videopack[enable]=true'.'">'."\n";
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
						echo '<meta name="twitter:player:stream" content="'.esc_url(str_replace('http://', 'https://', $twitter_stream)).'">'."\n";
						echo '<meta name="twitter:player:stream:content_type" content="video/mp4; codecs=&quot;avc1.42E01E1, mp4a.40.2&quot;">'."\n";
					}


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

			$embed_url = esc_url(site_url('/')."?attachment_id=".$first_embedded_video['id']."&amp;kgvid_video_embed[enable]=true");

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

function kgvid_enqueue_shortcode_scripts() {

	$options = kgvid_get_options();

	if ( $options['embed_method'] == "Video.js" || $options['embed_method'] == "Video.js v7" ) {

			wp_enqueue_script( 'video-js' );
			wp_enqueue_script( 'videojs-l10n' );

			if ( $options['alwaysloadscripts'] == 'on' ) {
				wp_enqueue_script( 'video-quality-selector' );
			}

	}

	do_action( 'kgvid_enqueue_shortcode_scripts' );

	wp_enqueue_script( 'kgvid_video_embed' );

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
			if ( $args['orderby'] == 'menu_order ID' ) {
				$args['orderby'] = 'post__in'; //sort by order of IDs in the gallery_include parameter
			}
			unset($args['post_parent']);
		}
	}

	$attachments = new WP_Query($args);

	if ( $attachments->have_posts() ) {

		foreach ( $attachments->posts as $attachment ) {

			$thumbnail_url = get_post_meta($attachment->ID, "_kgflashmediaplayer-poster", true);
			$poster_id = get_post_meta($attachment->ID, '_kgflashmediaplayer-poster-id', true);
			$thumbnail_srcset = false;

			if ( !empty($poster_id) ) {
				$thumbnail_url = wp_get_attachment_url($poster_id);
				$thumbnail_srcset = wp_get_attachment_image_srcset($poster_id);
				if ( intval($query_atts['gallery_thumb']) <= get_option('medium_size_h') ) {
					$poster_post = get_post($poster_id);
					if ( $poster_post->guid == $thumbnail_url ) {
						$thumbnail_url = kgvid_get_attachment_medium_url($poster_id);
					} //use the "medium" size image if available
				}
			}
			if (!$thumbnail_url) { $thumbnail_url = $options['poster']; } //use the default poster if no thumbnail set
			if (!$thumbnail_url) { $thumbnail_url = plugins_url('/images/nothumbnail.jpg', dirname(__FILE__));} //use the blank image if no other option

			if ( is_admin() && defined( 'DOING_AJAX' ) && DOING_AJAX ) {

				if ( $thumbnail_url ) { $thumbnail_url = set_url_scheme($thumbnail_url); }

			}

			$below_video = 0;
			if ( !empty($attachment->post_excerpt) || $query_atts['view_count'] == "true" ) { $below_video = 1; }

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

			$play_button_html = '<div class="'.esc_attr($options['js_skin']).'" ><button class="'.esc_attr($play_button_class).'" style="-webkit-transform: scale('.esc_attr($play_scale).') translateY(-'.esc_attr($play_translate).'px); -o-transform: scale('.esc_attr($play_scale).') translateY(-'.esc_attr($play_translate).'px); -ms-transform: scale('.esc_attr($play_scale).') translateY(-'.esc_attr($play_translate).'px); transform: scale('.esc_attr($play_scale).') translateY(-'.esc_attr($play_translate).'px);"></button></div>';

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
			preg_match('/data-kgvid_video_vars=".*?"/', $popup_code, $video_vars);
			$popup_code = str_replace(array("\r", "\n", "\t", $video_vars[0]), "", $popup_code);

			if ( $options['js_skin'] == "" ) { $options['js_skin'] = "vjs-default-skin"; }
			if ( is_array($query_atts) && array_key_exists('skin', $query_atts) ) {
				$options['js_skin'] = $query_atts['skin']; //allows user to set skin for individual videos using the skin="" attribute
			}

			$code .= '<div class="kgvid_video_gallery_thumb" onclick="kgvid_SetVideo(\'kgvid_'.esc_attr($kgvid_video_id-1).'\')" id="kgvid_video_gallery_thumb_kgvid_'.strval($kgvid_video_id-1).'" data-id="kgvid_'.esc_attr($kgvid_video_id-1).'" data-width="'.esc_attr($dimensions['width']).'" data-height="'.esc_attr($dimensions['height']).'" data-meta="'.esc_attr($below_video).'" data-gallery_end="'.esc_attr($query_atts['gallery_end']).'" data-popupcode="'.esc_attr($popup_code).'" '.$video_vars[0].' style="width:'.esc_attr($query_atts["gallery_thumb"]).'px;';

			if ( $query_atts['gallery_thumb_aspect'] == "true" ) {
				$code .= ' height:'.esc_attr(round($options["height"]/$options["width"]*$query_atts["gallery_thumb"])).'px;';
			}

			$code .= '"><img';
			if ( !empty($thumbnail_srcset) ) {
				$code .= ' srcset="'.esc_attr($thumbnail_srcset).'"';
			}
			$code .= ' src="'.esc_url($thumbnail_url).'"';
			$code .= ' alt="'.esc_attr($attachment->post_title).'">'.$play_button_html;

			if ( $query_atts['gallery_title'] == 'true' ) { $code .= '<div class="titlebackground"><div class="videotitle">'.esc_html($attachment->post_title).'</div></div>'; }

			$code .= '</div>'."\n\t\t\t";


		} //end attachment loop

		if ( $attachments->max_num_pages > 1 ) {

			$code .= '<div class="kgvid_gallery_pagination">';
			$code .= '<span class="kgvid_gallery_pagination_arrow"';
			if ( $page_number == 1 ) { $code .= ' style="visibility:hidden;"'; }
			$code .= ' onclick="kgvid_switch_gallery_page(jQuery(this).siblings(\'.kgvid_gallery_pagination_selected\').prev(), \'none\');" title="'.esc_attr__('Previous', 'video-embed-thumbnail-generator').'">&larr;</span> ';
			for ( $x = 1; $x <= $attachments->max_num_pages; $x++ ) {
				if ( $x == $page_number ) { $code .= '<span class="kgvid_gallery_pagination_selected">'.$x.'</span> '; }
				else { $code .= '<span class="kgvid_gallery_page_number" onclick="kgvid_switch_gallery_page(this, \'none\');">'.esc_html($x).'</span> '; }
			}
			$code .= '<span class="kgvid_gallery_pagination_arrow"';
			if ( $page_number == $attachments->max_num_pages ) { $code .= ' style="visibility:hidden;"'; }
			$code .= ' onclick="kgvid_switch_gallery_page(jQuery(this).siblings(\'.kgvid_gallery_pagination_selected\').next(), \'none\');" title="'.esc_attr__('Next', 'video-embed-thumbnail-generator').'">&rarr;</span>';
			$code .= '</div>';

		}

	} //if there are attachments

	return apply_filters('kgvid_gallery_page', $code, $kgvid_video_id);

}

function kgvid_generate_video_description($query_atts, $post = false) {

	if ( array_key_exists('description', $query_atts) && !empty($query_atts['description']) && $query_atts['description'] != "false" ) {
		$description = $query_atts['description'];
	}
	elseif ( array_key_exists('description', $query_atts) && !empty($query_atts['caption']) && $query_atts['caption'] != "false" ) {
		$description = $query_atts['caption'];
	}
	elseif ( $post != false || ( in_the_loop() && !is_attachment() ) ) {

		if ( $post == false ) { $post = get_post(); }

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
	if ( empty($description) ) { $description = esc_html__('Video', 'video-embed-thumbnail-generator'); }

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
	$video_formats = kgvid_video_formats(false, true, false);
	$compatible = array("mp4", "mov", "m4v", "ogv", "ogg", "webm", "mpd", "m3u8");
	$h264compatible = array("mp4", "mov", "m4v");

	if ( !empty($query_atts["id"]) ) {
		$id_array[0] = $query_atts["id"];
	}
	else {

		if ( empty($content) ) {

			if ( $post_id != 0 ) {
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
			$content = apply_filters('kgvid_filter_url', trim($content));
			$id_array[0] = kgvid_url_to_id($content);
		}

	}

	$original_content = $content;

	foreach ( $id_array as $id ) { //loop through videos

		$div_suffix = 'kgvid_'.strval($kgvid_video_id);

		$query_atts = kgvid_shortcode_atts($atts); //reset values so they can be different with multiple videos
		$content = $original_content;
		$sources = array();
		$mp4already = false;
		$dimensions = array();

		if ( $query_atts['gallery'] == 'false' && $kgvid_video_id === 0 && $post_id != 0 ) {
			$first_embedded_video['atts'] = $atts;
			$first_embedded_video['content'] = $content;
			$first_embedded_video_meta = get_post_meta($post_id, '_kgvid_first_embedded_video', true);
			if ( $first_embedded_video_meta != $first_embedded_video ) {
				update_post_meta($post_id, '_kgvid_first_embedded_video', $first_embedded_video);
			}
		}

		if ( !empty($id) ) { //if the video is an attachment in the WordPress db

			$attachment_url = wp_get_attachment_url($id);
			if ( $attachment_url == false ) {
				esc_html_e("Invalid video ID", 'video-embed-thumbnail-generator');
				continue;
			}

			if ( $options['rewrite_attachment_url'] == 'on' ) {

				$rewrite_url = true;

				//in case user doesn't know about this setting still check manually for popular CDNs like we used to
				$exempt_cdns = array(
					'amazonaws.com',
					'rackspace.com',
					'netdna-cdn.com',
					'nexcess-cdn.net',
					'limelight.com',
					'digitaloceanspaces.com'
				); //don't replace URLs that point to CDNs
				foreach ( $exempt_cdns as $exempt_cdn ) {
					if ( strpos($content, $exempt_cdn) !== false ) {
						$rewrite_url = false;
					}
				}

			}
			else {
				$rewrite_url = false;
			}
			if ( $rewrite_url || $content == '' ) { $content = $attachment_url; }

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
				if ( strpos($query_atts['width'], '%') === false
					&& $query_atts['resize'] == 'false'
					&& $query_atts['fullwidth'] == 'false'
					&& intval($query_atts['width']) <= get_option('medium_size_h')
				) {
					$query_atts['poster'] = kgvid_get_attachment_medium_url($poster_id);
				}
			}

			if ( is_admin() && defined( 'DOING_AJAX' ) && DOING_AJAX ) {

				if ( $query_atts['poster'] ) { $query_atts['poster'] = set_url_scheme($query_atts['poster']); }

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

		$mime_type_check = kgvid_url_mime_type($content, $post_id);
		if ( is_array($mime_type_check) && in_array($mime_type_check['ext'], $h264compatible) ) {
			$format_type = "h264";
			$mime_type = "video/mp4";
		}
		else {
			$format_type = $mime_type_check['ext'];
			$mime_type = $mime_type_check['type'];
		}

		unset($video_formats['fullres']);
		$video_formats = array(
			'original' => array(
				"type" => $format_type,
				"mime" => $mime_type,
				"name" => "Full",
				"label" => esc_html_x("Full", 'Full resolution', 'video-embed-thumbnail-generator')
				)
			) + $video_formats;

		if ( in_array($mime_type_check['ext'], $compatible) ) {

			$encodevideo_info["original"]["exists"] = true;
			$encodevideo_info["original"]["url"] = $content;

			if ( is_array($dimensions) && array_key_exists('actualheight', $dimensions) && !empty($dimensions['actualheight']) ) {
				$video_formats['original']['label'] = $dimensions['actualheight'].'p';
				$video_formats['original']['height'] = $dimensions['actualheight'];
				$encodevideo_info["original"]["height"] = $dimensions['actualheight'];
			}

		}
		else { $encodevideo_info["original"]["exists"] = false; }
		$encodevideo_info["original"]["encoding"] = false;

		if ( is_admin() && defined( 'DOING_AJAX' ) && DOING_AJAX ) {

			foreach ( $video_formats as $format => $format_stats ) {

				if ( array_key_exists($format, $encodevideo_info) && is_array($encodevideo_info[$format]) && array_key_exists('url', $encodevideo_info[$format]) ) {
					$encodevideo_info[$format]['url'] = set_url_scheme($encodevideo_info[$format]['url']);
				}

			}

		}

		if($query_atts["endofvideooverlaysame"] == "true") { $query_atts["endofvideooverlay"] = $query_atts["poster"]; }

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

		if (
			( $query_atts['title'] != "false"
			|| $query_atts['embedcode'] != "false"
			|| $query_atts['downloadlink'] == "true"
			||  $options['twitter_button'] == 'on'
			||  $options['facebook_button'] == 'on'
			)
			&& $options['embed_method'] != 'None'
		) { //generate content overlaid on video
			$kgvid_meta = true;
		}
		else { $kgvid_meta = false; }

		if ( $query_atts['width'] == "100%" ) {
			$query_atts['width'] = $options['width'];
			$query_atts['height'] = $options['height'];
			$query_atts['fullwidth'] = "true";
		}

		if ( ( $query_atts['fixed_aspect'] == 'vertical' && $query_atts['height'] > $query_atts['width'] )
			|| $query_atts['fixed_aspect'] == 'true'
		) {

			$default_aspect_ratio = intval($options['height']) / intval($options['width']);
			$query_atts['height'] = round($query_atts['width'] * $default_aspect_ratio);

		}

		if ( $query_atts['gifmode'] == "true" ) {
			$gifmode_atts = array(
				'muted' => 'true',
				'autoplay' => 'true',
				'loop' => 'true',
				'controls' => 'false',
				'title' => 'false',
				'embeddable' => 'false',
				'downloadlink' => 'false',
				'playsinline' => 'true'
			);

			$gifmode_atts = apply_filters('kgvid_gifmode_atts', $gifmode_atts);

			foreach ( $gifmode_atts as $gifmode_key => $gifmode_value ) {
				$query_atts[$gifmode_key] = $gifmode_value;
			}
		}

		$video_variables = array(
			'id' => $div_suffix,
			'attachment_id' => $id,
			'player_type' => $options['embed_method'],
			'width' => $query_atts['width'],
			'height' => $query_atts['height'],
			'fullwidth' => $query_atts['fullwidth'],
			'countable' => $countable,
			'count_views' => $query_atts['count_views'],
			'start' => $query_atts['start'],
			'autoplay' => $query_atts['autoplay'],
			'pauseothervideos' => $query_atts['pauseothervideos'],
			'set_volume' => $query_atts['volume'],
			'muted' => $query_atts['muted'],
			'meta' => $kgvid_meta,
			'endofvideooverlay' => $query_atts['endofvideooverlay'],
			'resize' => $query_atts['resize'],
			'auto_res' => $query_atts['auto_res'],
			'pixel_ratio' => $query_atts['pixel_ratio'],
			'right_click' => $query_atts['right_click'],
			'playback_rate' => $query_atts['playback_rate'],
			'title' => $stats_title
		);
		$video_variables = apply_filters('kgvid_video_variables', $video_variables, $query_atts, $encodevideo_info);

		if ( $options['embed_method'] == "Video.js"
			|| $options['embed_method'] == "Video.js v7"
			|| $options['embed_method'] == "None"
		) {

			$enable_resolutions_plugin = false;
			$x = 20;
			$h264_resolutions = array();

			foreach ($video_formats as $format => $format_stats) {
				if ( $format != "original" && $encodevideo_info[$format]["url"] == $content ) {
					continue; //don't double up on non-H.264 video sources
				}
				if ( $encodevideo_info[$format]["exists"]
					&& $encodevideo_info[$format]['encoding'] == false
				) {

					if ( array_key_exists('height', $encodevideo_info[$format]) && $format_stats['type'] == 'h264' ) {
						$source_key = $encodevideo_info[$format]['height'];
						$format_stats['label'] = str_replace($format_stats['height'], $encodevideo_info[$format]['height'], $format_stats['label']);
					}
					else { $source_key = $x; }

					if ( strpos($encodevideo_info[$format]["url"], '?') === false )  { //if there isn't already a query string in this URL
						$encodevideo_info[$format]["url"] = $encodevideo_info[$format]["url"].'?id='.$kgvid_video_id;
					}

					$sources[$source_key] = "\t\t\t\t\t".'<source src="'.esc_url($encodevideo_info[$format]["url"]).'" type="'.esc_attr($format_stats["mime"]).'"';
					if ( $format == 'vp9' ) { $sources[$source_key] .= ' codecs="vp9, vorbis"'; }
					if ( $format_stats['type'] == 'h264' ) {
						$sources[$source_key] .= ' data-res="'.esc_attr($format_stats['label']).'"';
						if ( $mp4already ) { //there is more than one resolution available
							$enable_resolutions_plugin = true;
						}
						$mp4already = true;
						$h264_resolutions[] = $format_stats['label'];
					}
					else { $sources[$source_key] .= ' data-res="'.esc_attr($format_stats['name']).'"'; }
					$sources[$source_key] .= '>'."\n";
				}
			$x--;
			}
			krsort($sources);
			natsort($h264_resolutions);

			$video_variables['nativecontrolsfortouch'] = $query_atts['nativecontrolsfortouch'];
			$video_variables['locale'] = kgvid_get_videojs_locale();

			if ( $enable_resolutions_plugin ) {
				$video_variables['enable_resolutions_plugin'] = "true";
				if ( wp_script_is('kgvid_video_embed', 'enqueued') ) {
					wp_dequeue_script('kgvid_video_embed'); //ensure that the video-quality-selector script is loaded before videopack.js
				}
				wp_enqueue_script( 'video-quality-selector' );
				if ( $query_atts["auto_res"] == "highest" ) { $video_variables['default_res'] = end($h264_resolutions); }
				if ( $query_atts["auto_res"] == "lowest" ) { $video_variables['default_res'] = reset($h264_resolutions); }
				elseif ( in_array($query_atts["auto_res"], $h264_resolutions) ) { $video_variables['default_res'] = $query_atts["auto_res"]; }
				else { $video_variables['default_res'] = false; }

				$default_key = intval($video_variables['default_res']);

				if ( $video_variables['default_res'] && array_key_exists($default_key, $sources) ) {
					$default_source = $sources[$default_key];
					unset($sources[$default_key]);
					$sources = array($default_key => $default_source) + $sources;
				}

			}
			else { $video_variables['enable_resolutions_plugin'] = false; }

		} //if Video.js

		$code .= '<div id="kgvid_'.esc_attr($div_suffix).'_wrapper" class="kgvid_wrapper';
		$code .= $aligncode.'">'."\n\t\t\t";
		$code .= '<div id="video_'.esc_attr($div_suffix).'_div" class="fitvidsignore kgvid_videodiv" data-id="'.esc_attr($div_suffix).'" data-kgvid_video_vars="'.esc_attr(wp_json_encode($video_variables)).'" ';
		if ( $query_atts["schema"] == "true" ) {
			$code .= 'itemprop="video" itemscope itemtype="https://schema.org/VideoObject">';
			if ( $query_atts["poster"] != '' ) { $code .= '<meta itemprop="thumbnailUrl" content="'.esc_url($query_atts["poster"]).'" >'; }
			if ( !empty($id) && $query_atts['embeddable'] == "true" ) { $schema_embedURL = site_url('/')."?attachment_id=".$id."&amp;kgvid_video_embed[enable]=true"; }
			else { $schema_embedURL = $content; }
			$code .= '<meta itemprop="embedUrl" content="'.esc_url($schema_embedURL).'" >';
			$code .= '<meta itemprop="contentUrl" content="'.esc_url($content).'" >';
			$code .= '<meta itemprop="name" content="'.esc_attr($stats_title).'" >';

			$description = kgvid_generate_video_description($query_atts);

			$code .= '<meta itemprop="description" content="'.esc_attr($description).'" >';

			if ( !empty($id) ) { $upload_date = get_the_date('c', $id); }
			elseif ( $post_id != 0 ) { $upload_date = get_the_date('c', $post_id); }
			else { $upload_date = current_time('c'); }
			$code .= '<meta itemprop="uploadDate" content="'.esc_attr($upload_date).'" >';
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
				$track_code .= "<track id='".esc_attr($div_suffix)."_text_".esc_attr($track)."' kind='".esc_attr($track_attribute['kind'])."' src='".esc_url($track_attribute['src'])."' srclang='".esc_attr($track_attribute['srclang'])."' label='".esc_attr($track_attribute['label'])."' ".esc_attr($track_attribute['default'])." >";
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

					$sources[$source_key] = '<source src="'.esc_url($encodevideo_info[$format]["url"]).'?id='.$kgvid_video_id.'" type="'.esc_attr($format_stats["mime"]).'"';
					if ( $format == 'vp9' ) { $sources[$source_key] .= ' codecs="vp9, vorbis"'; }
					if ( $format_stats['type'] == 'h264' ) {
						$sources[$source_key] .= ' data-res="'.esc_attr($format_stats['label']).'"';
						if ( $mp4already ) { //there is more than one resolution available
							$enable_resolutions_plugin = true;
						}
						$h264_resolutions[] = $format_stats['label'];
					}
					else { $sources[$source_key] .= ' data-res="'.esc_attr($format_stats['name']).'"'; }

					if ( $format_stats['type'] != "h264" || !$mp4already ) { //build wp_video_shortcode attributes. Sources will be replaced later
						$shortcode_type = kgvid_url_mime_type($encodevideo_info[$format]["url"], $post_id);
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
					if ( strpos($source, 'data-res="'.esc_attr($res_label).'"') !== false ) { $default_key = $key; }
				}

				if ( $default_key !== false )  {
					$sources[$default_key] .= ' data-default_res="true"';
				}

			}

			if ( $query_atts["poster"] != '' ) { $attr['poster'] = $query_atts["poster"]; }
			if ( $query_atts["loop"] == 'true') { $attr['loop'] = "true"; }
			if ( $query_atts["autoplay"] == 'true') { $attr['autoplay'] = "true"; }
			$attr['preload'] = $query_atts['preload'];
			$attr['width'] = $query_atts['width'];
			$attr['height'] = $query_atts['height'];

			$localize = false;

			$wpmejssettings = array(
				'features' => array( 'playpause', 'progress', 'volume', 'tracks' ),
				'classPrefix' => 'mejs-',
				'stretching' => 'responsive',
				'pluginPath' => includes_url( 'js/mediaelement/', 'relative' ),
				'success' => 'kgvid_mejs_success'
			);

			if ( $enable_resolutions_plugin && !wp_script_is('mejs_sourcechooser', 'enqueued') ) {
				wp_enqueue_script( 'mejs_sourcechooser' );
				array_push($wpmejssettings['features'], 'sourcechooser');
				$localize = true;
			}

			if ( $kgvid_video_id === 0 ) {
				$localize = true;
			}

			if ( $query_atts['playback_rate'] == 'true' ) {
				array_push($wpmejssettings['features'], 'speed');
				$wpmejssettings['speeds'] = array('0.5', '1', '1.25', '1.5', '2');
				wp_enqueue_script( 'mejs-speed' );
			}

			array_push($wpmejssettings['features'], 'fullscreen');

			if ( $localize ) {
				wp_localize_script( 'wp-mediaelement', '_wpmejsSettings', $wpmejssettings );
			}

			$content_width = $query_atts['width'];
			$executed_shortcode = wp_video_shortcode($attr);
			$content_width = $content_width_save;

			if ( $enable_resolutions_plugin ) {
				$executed_shortcode = preg_replace( '/<source .*<a /', implode(' />', $sources).' /><a ', $executed_shortcode );
			}

			if ( !empty($track_code) ) {
				$executed_shortcode = preg_replace( '/<a /', $track_code.'<a ', $executed_shortcode );
			}

			$code .= $executed_shortcode;
		}

		if ( $options['embed_method'] == "Video.js"
			|| $options['embed_method'] == "Video.js v7"
			|| $options['embed_method'] == "None"
		) {

			$code .= "\n\t\t\t\t".'<video id="video_'.esc_attr($div_suffix).'" ';
			if ( $query_atts["playsinline"] == 'true' ) { $code .= 'playsinline '; }
			if ( $query_atts["loop"] == 'true') { $code .= 'loop '; }
			if ( $query_atts["autoplay"] == 'true') { $code .= 'autoplay '; }
			if ( $query_atts["controls"] != 'false') { $code .= 'controls '; }
			if ( $query_atts["muted"] == 'true' ) { $code .= 'muted '; }
			$code .= 'preload="'.esc_attr($query_atts['preload']).'" ';
			if ( $query_atts["poster"] != '' ) { $code .= 'poster="'.esc_url($query_atts["poster"]).'" '; }
			if ( $options['embed_method'] != "None" ) {
				$code .= 'width="'.esc_attr($query_atts["width"]).'" height="'.esc_attr($query_atts["height"]).'"';
			}
			else {
				$code .= 'width="100%"';
			}

			if (  $options['embed_method'] != "None" ) {
				if ( $options['js_skin'] == "" ) { $options['js_skin'] = "vjs-default-skin"; }
				if ( is_array($atts) && array_key_exists('skin', $atts) ) {
					$options['js_skin'] = $atts['skin']; //allows user to set skin for individual videos using the skin="" attribute
				}
				$code .= ' class="fitvidsignore '.esc_attr('video-js '.$options['js_skin']).'">'."\n";
			}
			else {
				$code .= ' class="fitvidsignore">'."\n";
			}

			$code .= implode("", $sources); //add the <source> tags created earlier
			$code .= $track_code; //if there's a text track
			$code .= "\t\t\t\t</video>\n";

		}
		$code .= "\t\t\t</div>\n";
		$show_views = false;
		if ( ( !empty($id) && $query_atts['view_count'] == "true" ) || !empty($query_atts['caption']) || $content == plugins_url('/images/sample-video-h264.mp4', dirname(__FILE__)) ) { //generate content below the video
			if ( is_array($kgvid_postmeta) && array_key_exists('starts', $kgvid_postmeta) ) {
				$view_count = number_format(intval($kgvid_postmeta['starts']));
			}
			else {
				$view_count = "0";
				$kgvid_postmeta['starts'] = 0;
			}
			if ( $content == plugins_url('/images/sample-video-h264.mp4', dirname(__FILE__)) ) { $view_count = "XX"; }
			if ( $query_atts['view_count'] == "true" ) { $show_views = true; }
			if ( !empty($query_atts['caption']) || $show_views || $query_atts['downloadlink'] == "true" ) {
				$code .= "\t\t\t".'<div class="kgvid_below_video" id="video_'.esc_attr($div_suffix).'_below">';
				if ( $show_views ) { $code .= '<div class="kgvid-viewcount" id="video_'.esc_attr($div_suffix).'_viewcount">'.esc_html( sprintf( _n( '%s view', '%s views', intval($kgvid_postmeta['starts']), 'video-embed-thumbnail-generator'), $view_count ) ).'</div>'; }
				if ( !empty($query_atts['caption']) ) {
					$code .= '<div class="kgvid-caption" id="video_'.esc_attr($div_suffix).'_caption">'.wp_kses_post($query_atts['caption']).'</div>';
				}
				$code .= '</div>';
			}
		}

		if ( $kgvid_meta == true ) { //generate content overlaid on video
			$code .= "\t\t\t<div style=\"display:none;\" id=\"video_".esc_attr($div_suffix)."_meta\" class=\"kgvid_video_meta kgvid_video_meta_hover ";
			if ( $query_atts['title'] != "false" ) {
				$show_title = true;
				$code .= "\">";
			}
			else {
				$show_title = false;
				$code .= "kgvid_no_title_meta\">";
			} //no title

			$code .= "\n\t\t\t\t<span class='kgvid_meta_icons'>";

			if ( $query_atts['downloadlink'] == "true" ) {
				$forceable = false;
				if ( !empty($id) && $options['click_download'] == 'on' ) {
					$filepath = get_attached_file($id);
					if ( file_exists($filepath) ) {
						$forceable = true;
						$download_code = "\t\t\t\t\t".'<a href="'.esc_attr($content).'" title="'.esc_attr__('Click to download', 'video-embed-thumbnail-generator').'" download>';
					}
				}
				if ( !$forceable ) { $download_code = '<a href="'.esc_attr($content).'" title="'.esc_attr__('Right-click or ctrl-click to download', 'video-embed-thumbnail-generator').'">'; }
				$download_code .= '<span class="kgvid-icons kgvid-icon-download"></span></a>';
			}
			else { $download_code = ''; }

			if ( $query_atts['embeddable'] == 'true'
				&& ( $query_atts['embedcode'] != "false"
					|| $options['twitter_button'] == 'on'
					|| $options['facebook_button'] == 'on'
				)
			) {

				$embed_code = "\t\t\t\t<span id='kgvid_".esc_attr($div_suffix)."_shareicon' class='vjs-icon-share' onclick='kgvid_share_icon_click(\"".esc_attr($div_suffix)."\");'></span>\n";
				$embed_code .= "\t\t\t\t<div id='click_trap_".esc_attr($div_suffix)."' class='kgvid_click_trap'></div><div id='video_".esc_attr($div_suffix)."_embed' class='kgvid_share_container";
				if ( $show_title == false ) { $embed_code .= " kgvid_no_title_meta"; }
				$embed_code .= "'><div class='kgvid_share_icons'>";
				if ( $query_atts['embedcode'] != "false" ) {
					if ( $query_atts['embedcode'] == "true" ) { $iframeurl = site_url('/')."?attachment_id=".esc_attr($id)."&amp;videopack[enable]=true"; }
					else { $iframeurl = $query_atts['embedcode']; }
					$iframecode = "<iframe src='".esc_attr($iframeurl)."' frameborder='0' scrolling='no' width='".esc_attr($query_atts['width'])."' height='".esc_attr($query_atts["height"])." allowfullscreen allow='autoplay; fullscreen'></iframe>";
					$iframecode = apply_filters('kgvid_embedcode', $iframecode, $iframeurl, $id, $query_atts);
					$embed_code .= "<span class='kgvid_embedcode_container'><span class='kgvid-icons kgvid-icon-embed'></span>
					<span>" . esc_html_x('Embed:', 'precedes code for embedding video', 'video-embed-thumbnail-generator') . " </span><span><input class='kgvid_embedcode' type='text' value='".esc_attr($iframecode)."' onClick='this.select();'></span> <span class='kgvid_start_time'><input type='checkbox' class='kgvid_start_at_enable' onclick='kgvid_set_start_at(\"".esc_attr($div_suffix)."\")'> ".esc_html__('Start at:', 'video-embed-thumbnail-generator')." <input type='text' class='kgvid_start_at' onkeyup='kgvid_change_start_at(\"".esc_attr($div_suffix)."\")'></span></span>";
				} //embed code

				if ( $options['twitter_button'] == 'on' || $options['facebook_button'] == 'on' ) {

					$embed_code .= "<div class='kgvid_social_icons'>";
					if ( in_the_loop() ) { $permalink = get_permalink(); }
					elseif ( !empty($id) ) { $permalink = get_attachment_link($id); }
					else { $permalink = $content; }

					if ( $options['twitter_button'] == 'on' ) {
						$embed_code .= "<a title='".esc_attr__('Share on Twitter', 'video-embed-thumbnail-generator')."' href='".esc_url("https://twitter.com/share?text=".urlencode($query_atts['title'])."&url=".urlencode($permalink));
						if ( !empty($options['twitter_username']) ) { $embed_code .= "&via=".esc_attr(urlencode($options['twitter_username'])); }
						$embed_code .= "' onclick='window.open(this.href, \"\", \"menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=260,width=600\");return false;'><span class='vjs-icon-twitter'></span></a>";
					}

					if ( $options['facebook_button'] == 'on' ) {
						$embed_code .= "&nbsp;<a title='".esc_attr__('Share on Facebook', 'video-embed-thumbnail-generator')."' href='".esc_url("https://www.facebook.com/sharer/sharer.php?u=".urlencode($permalink))."' onclick='window.open(this.href, \"\", \"menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=260,width=600\");return false;'><span class='vjs-icon-facebook'></span></a>";
					}

					$embed_code .= "</div>";

				}

				$embed_code .= "</div></div>\n";
			}
			else { $embed_code = ''; }

			$code .= $embed_code.$download_code;

			$code .= "</span>";
			if ( $show_title == true ) { $code .= "\n\t\t\t\t<span id='video_".esc_attr($div_suffix)."_title' class='kgvid_title'>".esc_attr($query_atts['title'])."</span>\n"; }
			$code .= "</div>\n";
		}

		if ( !empty($query_atts["watermark"])
			&& $query_atts["watermark"] != "false"
			&& $options['embed_method'] != "None"
		) {
			$watermark_id = kgvid_url_to_id($query_atts["watermark"]);
			if ( $watermark_id ) { $query_atts["watermark"] = wp_get_attachment_url($watermark_id); }
			if ( is_admin() && defined( 'DOING_AJAX' ) && DOING_AJAX ) {
				if ( $query_atts["watermark"] ) { $query_atts["watermark"] = set_url_scheme($query_atts["watermark"]); }
			}
			$code .= "<div style=\"display:none;\" id='video_".esc_attr($div_suffix)."_watermark' class='kgvid_watermark'>";
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
						$watermark_href = $content;
					break;

					case 'custom':
					$watermark_href = $query_atts["watermark_url"];
					break;

				}
				$code .= "<a target='_parent' href='".esc_attr($watermark_href)."'";
				if ( $query_atts['watermark_link_to'] == 'download' ) {
					$code .= " download";
				}
				$code .= ">";
			}
			else { $watermark_link = false; }
			$code .= "<img src='".esc_attr($query_atts["watermark"])."' alt='".esc_attr__('watermark', 'video-embed-thumbnail-generator')."'>";
			if ( $watermark_link ) { $code .= "</a>"; }
			$code .= "</div>";
		} //generate watermark
		$code .= "\t\t</div>"; //end kgvid_XXXX_wrapper div

		$kgvid_video_id++;

	} //end id_array loop

	return apply_filters('kgvid_single_video_code', $code, $query_atts, $atts, $content, $post_id);

}

function kgvid_overwrite_shortcode() {

	$options = kgvid_get_options();
	if ($options['replace_video_shortcode'] == 'on') {
		remove_shortcode('video');
		add_shortcode('video', 'kgvid_replace_video_shortcode');
	}

}
add_action('wp_loaded', 'kgvid_overwrite_shortcode');

function kgvid_replace_video_shortcode( $atts, $content = '' ) {

	$src_atts = array('src', 'mp4', 'm4v', 'webm', 'ogv', 'wmv', 'flv');
	foreach ( $src_atts as $src_key ) {
		if ( is_array($atts) && array_key_exists($src_key, $atts) ) {
			$content = $atts[$src_key];
			break;
		}
	}

	return KGVID_shortcode($atts, $content);

}

function kgvid_shortcode_atts($atts) {

	$options = kgvid_get_options();

	if ( in_the_loop() ) { $post_id = get_the_ID(); }
	else { $post_id = 1; }

	$deprecated_atts = array(
		'controlbar' => 'controls',
		'mute' => 'muted'
	);

	if ( is_array($atts) ) {

		foreach( $deprecated_atts as $deprecated_att => $new_att ) { //loop through old atts and convert to new ones

			if ( array_key_exists($deprecated_att, $atts) ) {

				$atts[$new_att] = $atts[$deprecated_att];

				if ( $new_att == 'controls' ) {

					if ( $atts['controls'] == 'none' ) {
						$atts['controls'] = 'false';
					}
					else {
						$atts['controls'] = 'true';
					}

				}

			}

		}

	}

	$default_atts = array(
		'id' => '',
		'orderby' => 'menu_order ID',
		'order' => 'ASC',
		'videos' => -1,
		'width' => $options['width'],
		'height' => $options['height'],
		'fullwidth' => $options['fullwidth'],
		'fixed_aspect' => $options['fixed_aspect'],
		'align' => $options['align'],
		'controls' => $options['controls'],
		'poster' => $options['poster'],
		'start' => '',
		'preload' => $options['preload'],
		'watermark' => $options['watermark'],
		'watermark_link_to' => $options['watermark_link_to'],
		'watermark_url' => $options['watermark_url'],
		'endofvideooverlay' => $options['endofvideooverlay'],
		'endofvideooverlaysame' => $options['endofvideooverlaysame'],
		'loop' => $options['loop'],
		'autoplay' => $options['autoplay'],
		'gifmode' => $options['gifmode'],
		'pauseothervideos' => $options['pauseothervideos'],
		'playsinline' => $options['playsinline'],
		'skin' => $options['js_skin'],
		'gallery' => 'false',
		'gallery_per_page' => $options['gallery_per_page'],
		'gallery_thumb' => $options['gallery_thumb'],
		'gallery_thumb_aspect' => $options['gallery_thumb_aspect'],
		'gallery_orderby' => 'menu_order ID',
		'gallery_order' => 'ASC',
		'gallery_exclude' => '',
		'gallery_include' => '',
		'gallery_id' => $post_id,
		'gallery_end' => $options['gallery_end'],
		'gallery_title' => $options['gallery_title'],
		'volume' => $options['volume'],
		'muted' => $options['muted'],
		'preload' => $options['preload'],
		'playback_rate' => $options['playback_rate'],
		'title' => $options['overlay_title'],
		'embedcode' => $options['overlay_embedcode'],
		'embeddable' => $options['embeddable'],
		'view_count' => $options['view_count'],
		'count_views' => $options['count_views'],
		'caption' => '',
		'description' => '',
		'inline' => $options['inline'],
		'downloadlink' => $options['downloadlink'],
		'right_click' => $options['right_click'],
		'resize' => $options['resize'],
		'auto_res' => $options['auto_res'],
		'pixel_ratio' => $options['pixel_ratio'],
		'nativecontrolsfortouch' => $options['nativecontrolsfortouch'],
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

	$default_atts = apply_filters('kgvid_default_shortcode_atts', $default_atts);

	$query_atts = shortcode_atts($default_atts, $atts, 'videopack');

	$kgvid_video_embed_query_var = get_query_var('videopack'); //variables in URL
	if ( empty($kgvid_video_embed_query_var) ) {
		$kgvid_video_embed_query_var = get_query_var('kgvid_video_embed'); //check the old query variable
	}

	if ( !empty($kgvid_video_embed_query_var) ) {

		$allowed_query_var_atts = array( //attributes that can be changed via URL
			'auto_res',
			'autoplay',
			'controls',
			'default_res',
			'fullwidth',
			'gifmode',
			'height',
			'loop',
			'muted',
			'nativecontrolsfortouch',
			'pixel_ratio',
			'resize',
			'set_volume',
			'start',
			'width',
		);

		$allowed_query_var_atts = apply_filters('kgvid_allowed_query_var_atts', $allowed_query_var_atts);

		foreach ( $kgvid_video_embed_query_var as $key => $value ) {
			if ( in_array($key, $allowed_query_var_atts) ) {
				$query_atts[$key] = $value;
			}
		}

	}

	$checkbox_convert = array (
		"endofvideooverlaysame",
		"loop",
		"playsinline",
		"autoplay",
		"controls",
		"pauseothervideos",
		"title",
		"embedcode",
		"embeddable",
		"view_count",
		"inline",
		"resize",
		"downloadlink",
		"muted",
		"playback_rate",
		"fullwidth",
		"gallery_thumb_aspect",
		"gallery_title",
		"nativecontrolsfortouch",
		"pixel_ratio",
		"schema",
		"gifmode",
	);
	foreach ( $checkbox_convert as $query ) {
		if ( $query_atts[$query] == "on" ) { $query_atts[$query] = "true"; }
		if ( $query_atts[$query] == false ) { $query_atts[$query] = "false"; }
	}

	if ( $query_atts['auto_res'] == 'true' ) { $query_atts['auto_res'] = 'automatic'; } //if anyone used auto_res in the shortcode before version 4.4.3
	if ( $query_atts['auto_res'] == 'false' ) { $query_atts['auto_res'] = 'highest'; }
	if ( $query_atts['orderby'] == 'menu_order' ) { $query_atts['orderby'] = 'menu_order ID'; }
	if ( $query_atts['track_default'] == 'true' ) { $query_atts['track_default'] = 'default'; }
	if ( $query_atts['count_views'] == 'false' ) { $query_atts['view_count'] = 'false'; }

	return apply_filters('kgvid_shortcode_atts', $query_atts);

}

function KGVID_shortcode($atts, $content = '') {

	$code = "";
	$query_atts = "";

	if ( !is_feed() ) {

		$options = kgvid_get_options();
		if ( $options['embed_method'] != 'Video.js' && $options['embed_method'] != 'Video.js v7' ) { kgvid_enqueue_shortcode_scripts(); }

		$post_id = get_the_ID();
		if ( $post_id == false ) {
			$post_id = get_queried_object_id();
		}

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
				'gallery_thumb_aspect',
				'view_count',
				'gallery_end',
				'gallery_per_page',
				'gallery_title'
			);
			$gallery_query_atts = array();
			foreach($gallery_query_index as $index) { $gallery_query_atts[$index] = $query_atts[$index]; };

			if ( $gallery_query_atts['gallery_orderby'] == 'rand' ) {
				$gallery_query_atts['gallery_orderby'] = 'RAND('.rand().')'; //use the same seed on every page load
			}

			wp_enqueue_script( 'simplemodal' );

			if ( $query_atts['align'] == "left" ) { $aligncode = ' kgvid_textalign_left'; }
			if ( $query_atts['align'] == "center" ) { $aligncode = ' kgvid_textalign_center'; }
			if ( $query_atts['align'] == "right" ) { $aligncode = ' kgvid_textalign_right'; }

			$code .= '<div class="kgvid_gallerywrapper'.esc_attr($aligncode).'" id="kgvid_gallery_'.esc_attr($kgvid_gallery_id).'" data-query_atts="'.esc_attr(wp_json_encode($gallery_query_atts)).'">';
			$code .= kgvid_gallery_page(1, $gallery_query_atts);
			$code .= '</div>'; //end wrapper div

			$kgvid_gallery_id++;

		} //if gallery

		if ( $options['embed_method'] == 'Video.js' || $options['embed_method'] == 'Video.js v7' ) { kgvid_enqueue_shortcode_scripts(); }

	} //if not feed

	$code = wp_kses($code, kgvid_allowed_html());

	return apply_filters('KGVID_shortcode', $code, $query_atts, $content);

}
add_shortcode('FMP', 'KGVID_shortcode');
add_shortcode('KGVID', 'KGVID_shortcode');
add_shortcode('videopack', 'KGVID_shortcode');
add_shortcode('VIDEOPACK', 'KGVID_shortcode');

function kgvid_no_texturize_shortcode($shortcodes){
    $shortcodes[] = 'KGVID';
    $shortcodes[] = 'FMP';
	$shortcodes[] = 'videopack';
	$shortcodes[] = 'VIDEOPACK';
    return $shortcodes;
}
add_filter( 'no_texturize_shortcodes', 'kgvid_no_texturize_shortcode' );

function kgvid_parameter_queryvars( $qvars ) { //add videopack variable for passing information using URL queries
	$qvars[] = 'videopack';
	$qvars[] = 'kgvid_video_embed'; //old query variable
	return $qvars;
}
add_filter('query_vars', 'kgvid_parameter_queryvars' );

function kgvid_generate_attachment_shortcode($kgvid_video_embed) {

	$post = get_post();
	$shortcode = '';

	if ( $post && property_exists($post, 'ID') ) {
		$post_id = $post->ID;
	}
	else {
		$post_id = 1;
	}

	$options = kgvid_get_options();
	$kgvid_postmeta = kgvid_get_attachment_meta($post_id);

	if ( is_array($kgvid_video_embed) && array_key_exists('sample', $kgvid_video_embed) ) { $url = plugins_url('/images/sample-video-h264.mp4', dirname(__FILE__)); }
	else { $url = wp_get_attachment_url($post_id); }

	$poster = get_post_meta($post_id, "_kgflashmediaplayer-poster", true);

	if ( is_array($kgvid_video_embed) && array_key_exists('gallery', $kgvid_video_embed) ) { $gallery = true; }
	else { $gallery = false; }

	$dimensions = kgvid_set_video_dimensions($post_id, $gallery);

	$shortcode = '[videopack';
	if ( $poster !="" ) { $shortcode .= ' poster="'.$poster.'"'; }
	if ( !empty($dimensions['width']) ) { $shortcode .= ' width="'.esc_attr($dimensions['width']).'"'; }
	if ( !empty($dimensions['height']) ) { $shortcode .= ' height="'.esc_attr($dimensions['height']).'"'; }
	if ( is_array($kgvid_video_embed) && array_key_exists('enable', $kgvid_video_embed) && $kgvid_video_embed['enable'] == 'true' )  { $shortcode .= ' fullwidth="true"'; }
	if ( $kgvid_postmeta['downloadlink'] == "on" ) { $shortcode .= ' downloadlink="true"'; }
	if ( is_array($kgvid_video_embed) && array_key_exists('start', $kgvid_video_embed) ) {
		$shortcode .= ' start="'.esc_attr($kgvid_video_embed['start']).'"';
	}
	if ( is_array($kgvid_video_embed) && array_key_exists('gallery', $kgvid_video_embed) ) {
		$shortcode .= ' autoplay="true"';
	}
	if ( is_array($kgvid_video_embed) && array_key_exists('sample', $kgvid_video_embed) ) {
		if ( $options['overlay_title'] == "on" ) { $shortcode .= ' title="'.esc_attr_x('Sample Video', 'example video', 'video-embed-thumbnail-generator').'"'; }
		if ( $options['overlay_embedcode'] == "on" ) { $shortcode .= ' embedcode="'.esc_attr__('Sample Embed Code', 'video-embed-thumbnail-generator').'"'; }
		$shortcode .= ' caption="'.esc_attr__('If text is entered in the attachment\'s caption field it is displayed here automatically.', 'video-embed-thumbnail-generator').'"';
		if ( $options['downloadlink'] == "on" ) { $shortcode .= ' downloadlink="true"'; }
	}

	$shortcode .= ']'.esc_url($url).'[/videopack]';

	return $shortcode;

}

function kgvid_filter_video_attachment_content($content) {

	$post = get_post();
	$options = kgvid_get_options();

	if ( $options['template'] == "gentle" && isset($post) && strpos($post->post_mime_type, "video") !== false ) {
		$kgvid_video_embed = array(); //no query set
		$content = kgvid_generate_attachment_shortcode($kgvid_video_embed);
		$content .= '<p>'.$post->post_content.'</p>';
	}
	return $content;
}
add_filter( 'the_content', 'kgvid_filter_video_attachment_content' );

function kgvid_video_attachment_template() {

	$post = get_post();
	$options = kgvid_get_options();
	$kgvid_video_embed = get_query_var('videopack');


	if ( empty($kgvid_video_embed) ) {
		$kgvid_video_embed = get_query_var('kgvid_video_embed');
	}
	if ( empty($kgvid_video_embed) ) {
		$kgvid_video_embed = array ( 'enable' => 'false' ); //turned off by default
	}

	if ( $options['template'] == "old" ) { $kgvid_video_embed['enable'] = 'true'; } //regardless of any query settings, if we're using the old method it's turned on
	if ( (!is_array($kgvid_video_embed) && $kgvid_video_embed == "true") ) { $kgvid_video_embed = array ( 'enable' => 'true' ); } //maintain backwards compatibility

	if ( $options['embeddable'] == 'false' && !array_key_exists('sample', $kgvid_video_embed) && !array_key_exists('gallery', $kgvid_video_embed) ) { $kgvid_video_embed['enable'] = 'false'; }

	if ( is_array($kgvid_video_embed)
		&& array_key_exists('enable', $kgvid_video_embed)
		&& $kgvid_video_embed['enable'] == 'true'
		&& ( ( is_object($post)
				&& property_exists($post, 'post_mime_type')
				&& strpos($post->post_mime_type, 'video') !== false
			)
			|| array_key_exists('sample', $kgvid_video_embed)
		)
	) {

		global $content_width;
		$content_width_save = $content_width;
		$content_width = 4096;

		remove_action('wp_head', '_admin_bar_bump_cb'); //don't show the WordPress admin bar if you're logged in
		add_filter( 'show_admin_bar', '__return_false' );

		$shortcode = kgvid_generate_attachment_shortcode($kgvid_video_embed);

		include dirname(__FILE__) . '/partials/embeddable-video.php';

		$content_width = $content_width_save; //reset $content_width

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
		$user_agent = sanitize_text_field($_SERVER['HTTP_USER_AGENT']);

		// Generate the server headers
		if (strpos($user_agent, "MSIE") !== FALSE) {
			header('Content-Type: "'.esc_attr($filetype['type']).'"');
			header('Content-Disposition: attachment; filename="'.esc_attr(basename($filepath)).'"');
			header('Expires: 0');
			header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
			header("Content-Transfer-Encoding: binary");
			header('Pragma: public');
			header("Content-Length: ".esc_attr(filesize($filepath)));
		}
		else {
			header('Content-Type: "'.esc_attr($filetype['type']).'"');
			header('Content-Disposition: attachment; filename="'.esc_attr(basename($filepath)).'"');
			header("Content-Transfer-Encoding: binary");
			header('Expires: 0');
			header('Pragma: no-cache');
			header("Content-Length: ".esc_attr(filesize($filepath)));
		}

		kvid_readfile_chunked($filepath);
		exit;
	}

	if ( $options['oembed_provider'] == "on"
		&& is_array($kgvid_video_embed)
		&& array_key_exists('oembed', $kgvid_video_embed)
		&& array_key_exists('post_id', $kgvid_video_embed)
	) {

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
			'width' => esc_attr($dimensions['width']),
			'height' => esc_attr($dimensions['height']),
			'thumbnail_url' => esc_url($thumbnail_url),
			'thumbnail_width' => esc_attr($dimensions['width']),
			'thumbnail_height' => esc_attr($dimensions['height']),
			'html' => "<iframe allowfullscreen src='".site_url('/')."?attachment_id=".$post->ID."&amp;videopack[enable]=true' frameborder='0' scrolling='no' width='".esc_attr($dimensions['width'])."' height='".esc_attr($dimensions['height'])."'></iframe>"
		);

		if ( $kgvid_video_embed['oembed'] == 'json' ) {

			header('Content-Type: application/json; charset=' . get_bloginfo('charset'), true);
			echo wp_json_encode($oembed_provider_data);
			exit;

		}

		if ( $kgvid_video_embed['oembed'] == 'xml' ) {

			header('Content-Type: text/xml; charset=' . get_bloginfo('charset'), true);

			// render xml-output
			echo '<?xml version="1.0" encoding="' . get_bloginfo('charset') . '" ?>';
			echo '<oembed>';
			foreach ( $oembed_provider_data as $element => $value ) {
			  echo '<' . esc_attr($element) . '>' . esc_html($value) . '</' . esc_attr($element) . '>';
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

function kgvid_clear_first_embedded_video_meta() {

	global $kgvid_video_id;
	$post = get_post();

	if ( $kgvid_video_id == null && $post ) { //there's no Videopack video on this page
		$first_embedded_video_meta = get_post_meta($post->ID, '_kgvid_first_embedded_video', true);
		if ( !empty($first_embedded_video_meta) ) {
			delete_post_meta($post->ID, '_kgvid_first_embedded_video');
		}
	}
}
add_action( 'wp_footer', 'kgvid_clear_first_embedded_video_meta', 12 );
