<?php
/**
 * The admin AJAX specific functionality of the Videopack plugin.
 *
 * @link       https://www.videopack.video
 *
 * @package    Videopack
 * @subpackage Videopack/admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */

function kgvid_ajax_heartbeat( array $response, array $data ) {

	if ( ! empty( $data['kgvid_encode_check'] ) ) {
		kgvid_encode_videos();
	}

	return $response;
}
add_filter( 'heartbeat_received', 'kgvid_ajax_heartbeat', 10, 2 );

function kgvid_ajax_sanitize_url() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	if ( isset( $_POST['movieurl'] ) ) {
		$movieurl = kgvid_sanitize_text_field( wp_unslash( $_POST['movieurl'] ) );
	}
	$sanitized_url = kgvid_sanitize_url( $movieurl );
	wp_send_json( $sanitized_url );
}
add_action( 'wp_ajax_kgvid_sanitize_url', 'kgvid_ajax_sanitize_url' );

function kgvid_update_child_format() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	if ( isset( $_POST['video_id'] ) ) {
		$video_id = kgvid_sanitize_text_field( wp_unslash( $_POST['video_id'] ) );
	}
	if ( isset( $_POST['parent_id'] ) ) {
		$parent_id = kgvid_sanitize_text_field( wp_unslash( $_POST['parent_id'] ) );
	}
	if ( isset( $_POST['format'] ) ) {
		$format = kgvid_sanitize_text_field( wp_unslash( $_POST['format'] ) );
	}
	if ( isset( $_POST['blog_id'] ) ) {
		$blog_id = kgvid_sanitize_text_field( wp_unslash( $_POST['blog_id'] ) );
	} else {
		$blog_id = false;
	}

	if ( ! empty( $blog_id ) && $blog_id !== 'false' ) {
		switch_to_blog( $blog_id );
	}

	$video_encode_queue = kgvid_get_encode_queue();

	if ( $video_encode_queue ) {

		foreach ( $video_encode_queue as $video_key => $video_entry ) {
			if ( ! empty( $video_entry['attachmentID'] )
				&& $video_entry['attachmentID'] === $parent_id
				&& ( array_key_exists( 'blog_id', $video_entry )
					&& $video_entry['blog_id'] === $blog_id
					|| $blog_id == 'false'
				)
				&& array_key_exists( 'encode_formats', $video_entry )
				&& array_key_exists( $format, $video_entry['encode_formats'] )
				&& array_key_exists( 'status', $video_entry['encode_formats'][ $format ] )
			) {
				$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['status'] = 'notchecked';
				kgvid_save_encode_queue( $video_encode_queue );
				break;
			}
		}
	}

	$post = get_post( $video_id );
	update_post_meta( $video_id, '_kgflashmediaplayer-format', $format );
	update_post_meta( $video_id, '_kgflashmediaplayer-pickedformat', $post->post_parent ); // save the original parent.
	$post->post_parent = $parent_id;
	wp_update_post( $post );

	if ( ! empty( $blog_id ) && $blog_id != 'false' ) {
		restore_current_blog();
	}

	echo true;
	die();
}
add_action( 'wp_ajax_kgvid_update_child_format', 'kgvid_update_child_format' );

function kgvid_clear_child_format() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	if ( isset( $_POST['video_id'] ) ) {
			$video_id = kgvid_sanitize_text_field( wp_unslash( $_POST['video_id'] ) );
	}
	if ( isset( $_POST['blog_id'] ) ) {
		$blog_id = kgvid_sanitize_text_field( wp_unslash( $_POST['blog_id'] ) );
	} else {
		$blog_id = false;
	}

	if ( $blog_id ) {
		switch_to_blog( $blog_id );
	}

	delete_post_meta( $video_id, '_kgflashmediaplayer-format' );
	$old_parent = get_post_meta( $video_id, '_kgflashmediaplayer-pickedformat', true );
	delete_post_meta( $video_id, '_kgflashmediaplayer-pickedformat' );
	$post = get_post( $video_id );
	if ( is_string( get_post_status( $old_parent ) ) ) {
		$post->post_parent = $old_parent;
	}
	wp_update_post( $post );

	if ( $blog_id ) {
		restore_current_blog();
	}

	echo true;
	die();
}
add_action( 'wp_ajax_kgvid_clear_child_format', 'kgvid_clear_child_format' );

function kgvid_update_encode_queue() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if ( isset( $_POST['page'] ) ) {
		$page = kgvid_sanitize_text_field( wp_unslash( $_POST['page'] ) );
	} else {
		die();
	}

	$options            = kgvid_get_options();
	$video_encode_queue = kgvid_get_encode_queue();

	if ( ! empty( $video_encode_queue )
		&& is_array( $video_encode_queue )
	) {

		foreach ( $video_encode_queue as $video_key => $video_entry ) {

			if ( $page === 'attachment'
				&& array_key_exists( 'blog_id', $video_entry )
				&& get_current_blog_id() !== $video_entry['blog_id']
			) { // remove all entries from other blogs on attachment pages

				unset( $video_encode_queue[ $video_key ] );
				continue;

			}

			$switched_blogs = false;

			if ( $page === 'network_queue'
				&& array_key_exists( 'blog_id', $video_entry )
				&& get_current_blog_id() !== $video_entry['blog_id']
			) {
				switch_to_blog( $video_entry['blog_id'] );
				$switched_blogs = true;
			}

			if ( array_key_exists( 'blog_id', $video_entry ) ) {
				$video_entry['blog_id'] = false;
			}

			if ( ! empty( $video_entry['movieurl'] )
				&& ! empty( $video_entry['attachmentID'] )
			) {
				$encodevideo_info = kgvid_encodevideo_info( $video_entry['movieurl'], $video_entry['attachmentID'] );
			}

			foreach ( $video_entry['encode_formats'] as $format => $value ) {

				if ( ! array_key_exists( 'lastline', $value ) ) {
					$value['lastline'] = '';
				}

				$video_encode_queue[ $video_key ]['encode_formats'][ $format ]['meta_array'] = kgvid_encode_format_meta( $encodevideo_info, $video_key, $format, $value['status'], $value['lastline'], $video_entry['attachmentID'], $video_entry['movieurl'] );

			}

			if ( $switched_blogs ) {
				restore_current_blog();
			}
		}
	}//if there's a queue

	$arr = array(
		'queue'         => $video_encode_queue,
		'queue_control' => esc_html( $options['queue_control'] ),
	);

	wp_send_json( $arr );
}
add_action( 'wp_ajax_kgvid_update_encode_queue', 'kgvid_update_encode_queue' );

function kgvid_ajax_generate_encode_checkboxes() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if ( isset( $_POST['movieurl'] ) ) {
			$movieurl = kgvid_sanitize_text_field( wp_unslash( $_POST['movieurl'] ) );
	}
	if ( isset( $_POST['post_id'] ) ) {
			$post_id = kgvid_sanitize_text_field( wp_unslash( $_POST['post_id'] ) );
	}
	if ( isset( $_POST['page'] ) ) {
			$page = kgvid_sanitize_text_field( wp_unslash( $_POST['page'] ) );
	}
	if ( isset( $_POST['blog_id'] ) ) {
		$blog_id = kgvid_sanitize_text_field( wp_unslash( $_POST['blog_id'] ) );
	} else {
		$blog_id = false;
	}

	if ( isset( $_POST['encodeformats'] ) ) {
		$encode_checked = kgvid_sanitize_text_field( wp_unslash( $_POST['encodeformats'] ) );
		$kgvid_postmeta = kgvid_get_attachment_meta( $post_id );
		foreach ( $encode_checked as $format => $checked ) {
			if ( $checked === 'true' ) {
				$kgvid_postmeta['encode'][ $format ] = true;
			} else {
				$kgvid_postmeta['encode'][ $format ] = 'notchecked';
			}
		}
		kgvid_save_attachment_meta( $post_id, $kgvid_postmeta );
	}

	$checkboxes               = kgvid_generate_encode_checkboxes( $movieurl, $post_id, $page, $blog_id );
	$checkboxes['checkboxes'] = wp_kses( $checkboxes['checkboxes'], kgvid_allowed_html( 'admin' ) );
	$checkboxes['encoding']   = esc_html( $checkboxes['encoding'] );

	wp_send_json( $checkboxes );
}
add_action( 'wp_ajax_kgvid_generate_encode_checkboxes', 'kgvid_ajax_generate_encode_checkboxes' );

function kgvid_ajax_save_settings() {

	$arr = false;

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if ( current_user_can( 'manage_options' ) ) {

		global $wp_settings_errors;

		if ( isset( $_POST['setting'] ) ) {
			$setting = kgvid_sanitize_text_field( wp_unslash( $_POST['setting'] ) );
		}
		if ( isset( $_POST['name'] ) ) {
			$name = kgvid_sanitize_text_field( wp_unslash( $_POST['name'] ) );
		}
		if ( isset( $_POST['value'] ) ) {
			$value = kgvid_sanitize_text_field( wp_unslash( $_POST['value'] ) );
		}
		if ( isset( $_POST['all_settings'] ) ) {
			$all_settings_string = wp_kses_data( wp_unslash( $_POST['all_settings'] ) );
		}
		parse_str( html_entity_decode( $all_settings_string ), $all_settings );
		$all_settings = kgvid_sanitize_text_field( $all_settings );

		$error_message    = '';
		$encode_array     = array();
		$auto_thumb_label = '';

		if ( ! empty( $all_settings )
			&& is_array( $all_settings )
			&& array_key_exists( 'kgvid_video_embed_options', $all_settings )
		) {

			if ( is_videopack_active_for_network()
				&& ! array_key_exists( 'embed_method', $all_settings['kgvid_video_embed_options'] )
			) {

				$validated_options = kgvid_validate_network_settings( $all_settings['kgvid_video_embed_options'] );
				$options_updated   = update_site_option( 'kgvid_video_embed_network_options', $validated_options );

			} else { // single site on the network

				$validated_options = kgvid_video_embed_options_validate( $all_settings['kgvid_video_embed_options'] );

				$options_updated = update_option( 'kgvid_video_embed_options', $validated_options );

				if ( $validated_options['ffmpeg_exists'] === true ) {

					$movie_info        = kgvid_get_video_dimensions( plugin_dir_path( __DIR__ ) . 'images/Adobestock_469037984.mp4' );
					$uploads           = wp_upload_dir();
					$video_formats     = kgvid_video_formats();
					$encode_dimensions = kgvid_set_encode_dimensions( $movie_info, $video_formats[ $validated_options['sample_format'] ] );
					if ( empty( $validated_options['sample_rotate'] ) ) {

						$input = plugin_dir_path( __DIR__ ) . 'images/Adobestock_469037984.mp4';

					} else {

						$input = plugin_dir_path( __DIR__ ) . 'images/Adobestock_469037984-rotated.mp4';

					}

					$encode_array = kgvid_generate_encode_array( $input, $uploads['path'] . '/Adobestock_469037984' . $video_formats[ $validated_options['sample_format'] ]['suffix'], $movie_info, $validated_options['sample_format'], $encode_dimensions['width'], $encode_dimensions['height'], intval( $validated_options['sample_rotate'] ) );

					$auto_thumb_label = kgvid_generate_auto_thumb_label();

				}
			}

			//check if the option is a nested array
			$trimmed_name = str_replace( 'kgvid_video_embed_options', '', $name );
			preg_match_all( '/\[([^\]]+)\]/', $trimmed_name, $matches );
			if ( $matches && count( $matches[1] ) > 1 ) {
				$validated_value = $validated_options;
				foreach ( $matches[1] as $key ) {
					if ( isset( $validated_value[ $key ] ) ) {
						$validated_value = $validated_value[ $key ];
					} else {
						$validated_value = $value;
					}
				}
			} else {
				$validated_value = $validated_options[ $setting ];
			}

			if ( ! empty( $wp_settings_errors ) ) {
				$error_message = $wp_settings_errors[0]['message'];
			}

			$allowed_html = array(
				'input'  => array(
					'id'        => array(),
					'name'      => array(),
					'class'     => array(),
					'type'      => array(),
					'value'     => array(),
					'maxlength' => array(),
				),
				'select' => array(
					'id'    => array(),
					'name'  => array(),
					'class' => array(),
				),
				'option' => array(
					'value'    => array(),
					'selected' => array(),
				),
			);

			$arr = array(
				'error_message'    => wp_kses_post( $error_message ),
				'validated_value'  => wp_kses_post( $validated_value ),
				'ffmpeg_exists'    => esc_html( $validated_options['ffmpeg_exists'] ),
				'encode_string'    => trim( implode( ' ', $encode_array ) ),
				'app_path'         => esc_attr( $validated_options['app_path'] ),
				'auto_thumb_label' => wp_kses( $auto_thumb_label, $allowed_html ),
			);

		}
	}

	wp_send_json( $arr );
}
add_action( 'wp_ajax_kgvid_save_settings', 'kgvid_ajax_save_settings' );

function kgvid_ajax_save_html5_thumb() {

	$thumb_info = array(
		'thumb_id'  => false,
		'thumb_url' => false,
	);

	if ( current_user_can( 'make_video_thumbnails' ) ) {

		check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

		if ( isset( $_POST['postID'] ) ) {
			$post_id = kgvid_sanitize_text_field( wp_unslash( $_POST['postID'] ) );
		}
		if ( isset( $_POST['raw_png'] ) ) {
			$raw_png = kgvid_sanitize_text_field( wp_unslash( $_POST['raw_png'] ) );
		}
		if ( isset( $_POST['url'] ) ) {
			$video_url = kgvid_sanitize_text_field( wp_unslash( $_POST['url'] ) );
		}
		if ( isset( $_POST['total'] ) ) {
			$total = kgvid_sanitize_text_field( wp_unslash( $_POST['total'] ) );
		}
		if ( isset( $_POST['index'] ) ) {
			$index = intval( kgvid_sanitize_text_field( wp_unslash( $_POST['index'] ) ) ) + 1;
		}

		$sanitized_url = kgvid_sanitize_url( $video_url );
		$posterfile    = $sanitized_url['basename'] . '_thumb' . $index;
		wp_mkdir_p( $uploads['path'] . '/thumb_tmp' );
		$tmp_posterpath = $uploads['path'] . '/thumb_tmp/' . $posterfile . '.png';
		$thumb_url      = $uploads['url'] . '/' . $posterfile . '.jpg';

		$editor = kgvid_decode_base64_png( $raw_png, $tmp_posterpath );

		if ( $editor === false || is_wp_error( $editor ) ) { // couldn't open the image. Try the alternate php://input

			$raw_post = file_get_contents( 'php://input' );
			parse_str( $raw_post, $alt_post );
			$editor = kgvid_decode_base64_png( $alt_post['raw_png'], $tmp_posterpath );

		}

		if ( $editor === false || is_wp_error( $editor ) ) {
			$thumb_url = false;
		} else {
			$thumb_dimensions = $editor->get_size();
			if ( $thumb_dimensions ) {
				$kgvid_postmeta                 = kgvid_get_attachment_meta( $post_id );
				$kgvid_postmeta['actualwidth']  = $thumb_dimensions['width'];
				$kgvid_postmeta['actualheight'] = $thumb_dimensions['height'];
				kgvid_save_attachment_meta( $post_id, $kgvid_postmeta );
			}
			$editor->set_quality( 90 );
			$new_image_info = $editor->save( $uploads['path'] . '/thumb_tmp/' . $posterfile . '.jpg', 'image/jpeg' );
			wp_delete_file( $tmp_posterpath ); // delete png

			$post_name  = get_the_title( $post_id );
			$thumb_info = kgvid_save_thumb( $post_id, $post_name, $thumb_url, $index );

		}

		kgvid_schedule_cleanup_generated_files( 'thumbs' );

	}

	wp_send_json( $thumb_info );
}
add_action( 'wp_ajax_kgvid_save_html5_thumb', 'kgvid_ajax_save_html5_thumb' );

function kgvid_ajax_save_thumb() {

	$thumb_info['thumb_id'] = false;

	if ( current_user_can( 'make_video_thumbnails' ) ) {
		check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
		if ( isset( $_POST['post_id'] ) ) {
			$post_id = kgvid_sanitize_text_field( wp_unslash( $_POST['post_id'] ) );
		}
		if ( isset( $_POST['thumburl'] ) ) {
			$thumb_url = kgvid_sanitize_text_field( wp_unslash( $_POST['thumburl'] ) );
		}
		if ( isset( $_POST['index'] ) ) {
			$index = intval( kgvid_sanitize_text_field( wp_unslash( $_POST['index'] ) ) ) + 1;
		} else {
			$index = false;
		}

		if ( is_numeric( $post_id ) ) {
			$post_name = get_the_title( $post_id );
		} else {
			$post_name = str_replace( 'singleurl_', '', $post_id );
		}

		$thumb_info = kgvid_save_thumb( $post_id, $post_name, $thumb_url, $index );

	}

	wp_send_json( $thumb_info );
}
add_action( 'wp_ajax_kgvid_save_thumb', 'kgvid_ajax_save_thumb' );

function kgvid_ajax_redraw_thumbnail_box() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if ( isset( $_POST['post_id'] ) ) {
		$post_id = kgvid_sanitize_text_field( wp_unslash( $_POST['post_id'] ) );
	}
	$kgvid_postmeta     = kgvid_get_attachment_meta( $post_id );
	$poster_id          = get_post_meta( $post_id, '_kgflashmediaplayer-poster-id', true );
	$thumbnail_size_url = '';
	if ( ! empty( $poster_id ) ) {
		$thumbnail_src = wp_get_attachment_image_src( $poster_id, 'thumbnail' );
		if ( is_array( $thumbnail_src ) && array_key_exists( 0, $thumbnail_src ) ) {
			$thumbnail_size_url = $thumbnail_src[0];
		}
	}

	$response = array(
		'thumb_url'          => esc_url( get_post_meta( $post_id, '_kgflashmediaplayer-poster', true ) ),
		'thumbnail_size_url' => esc_url( $thumbnail_size_url ),
		'thumb_error'        => wp_kses_post( $kgvid_postmeta['autothumb-error'] ),
		'thumb_id'           => esc_html( $poster_id ),
	);
	wp_send_json( $response );
}
add_action( 'wp_ajax_kgvid_redraw_thumbnail_box', 'kgvid_ajax_redraw_thumbnail_box' );

function kgvid_test_ffmpeg() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	$options       = kgvid_get_options();
	$uploads       = wp_upload_dir();
	$video_formats = kgvid_video_formats();
	$suffix        = $video_formats[ $options['sample_format'] ]['suffix'];

	if ( array_key_exists( 'encode_array', $options ) && is_array( $options['encode_array'] ) ) {

		$process = new Kylegilman\VideoEmbedThumbnailGenerator\FFMPEG_Process( $options['encode_array'] );

		try {
			$process->run();
			$output = $process->getErrorOutput();
		} catch ( \Exception $e ) {
			$output = 'Error: ' . $e->getMessage();
		}

		$arr['output'] = esc_textarea( $output );

		if ( file_exists( $uploads['path'] . '/Adobestock_469037984' . $suffix ) ) {

			if ( $options['moov'] == 'qt-faststart' || $options['moov'] == 'MP4Box' ) {
				$arr['output'] .= kgvid_fix_moov_atom( $uploads['path'] . '/Adobestock_469037984' . $suffix );
			}

			if ( ! empty( $options['ffmpeg_watermark']['url'] ) ) {

				wp_mkdir_p( $uploads['path'] . '/thumb_tmp' );

				$random_timecode = wp_rand( 0, 1092 ) / 1000;
				$watermark_test  = kgvid_process_thumb(
					$uploads['path'] . '/Adobestock_469037984' . $suffix,
					$uploads['path'] . '/thumb_tmp/watermark_test.jpg',
					false,
					$random_timecode
				);

				kgvid_schedule_cleanup_generated_files( 'thumbs' );

				if ( file_exists( $uploads['path'] . '/thumb_tmp/watermark_test.jpg' ) ) {
					$arr['watermark_preview'] = $uploads['url'] . '/thumb_tmp/watermark_test.jpg';
				}
			}

			wp_delete_file( $uploads['path'] . '/Adobestock_469037984' . $suffix );

		}
	} else {
		/* translators: %s is the path to FFmpeg. */
		$arr['output'] = sprintf( esc_html__( 'FFmpeg is not executing correctly at %s. You can embed existing videos and make thumbnails with compatible browsers, but video encoding is not possible without FFmpeg.', 'video-embed-thumbnail-generator' ), esc_html( $options['app_path'] ) );
	}

	wp_send_json( $arr );
}
add_action( 'wp_ajax_kgvid_test_ffmpeg', 'kgvid_test_ffmpeg' );

function kgvid_test_ffmpeg_thumb_watermark() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	$random_timecode = wp_rand( 0, 1092 ) / 1000;
	$thumb           = kgvid_make_thumbs( 'singleurl', plugin_dir_path( __DIR__ ) . 'images/Adobestock_469037984.mp4', 1, 1, 1, $random_timecode, false, 'generate' );

	if ( array_key_exists( 'real_thumb_url', $thumb ) ) {
		echo esc_url( $thumb['real_thumb_url'] );
	} else {
		echo false;
	}

	die;
}
add_action( 'wp_ajax_kgvid_test_ffmpeg_thumb_watermark', 'kgvid_test_ffmpeg_thumb_watermark' );

function kgvid_callffmpeg() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	$options = kgvid_get_options();

	if ( isset( $_POST['attachmentID'] ) ) {
		$post_id = kgvid_sanitize_text_field( wp_unslash( $_POST['attachmentID'] ) );
	}
	if ( isset( $_POST['movieurl'] ) ) {
		$movieurl = kgvid_sanitize_text_field( wp_unslash( $_POST['movieurl'] ) );
	}
	if ( isset( $_POST['numberofthumbs'] ) ) {
		$numberofthumbs = kgvid_sanitize_text_field( wp_unslash( $_POST['numberofthumbs'] ) );
	}
	if ( isset( $_POST['thumbnumber'] ) ) {
		$i = kgvid_sanitize_text_field( wp_unslash( $_POST['thumbnumber'] ) );
	}
	if ( isset( $_POST['thumbnumberplusincreaser'] ) ) {
		$iincreaser = kgvid_sanitize_text_field( wp_unslash( $_POST['thumbnumberplusincreaser'] ) );
	}
	if ( isset( $_POST['thumbtimecode'] ) ) {
		$thumbtimecode = kgvid_sanitize_text_field( wp_unslash( $_POST['thumbtimecode'] ) );
	}
	if ( isset( $_POST['dofirstframe'] ) ) {
		$dofirstframe = kgvid_sanitize_text_field( wp_unslash( $_POST['dofirstframe'] ) );
	}
	if ( isset( $_POST['generate_button'] ) ) {
		$generate_button = kgvid_sanitize_text_field( wp_unslash( $_POST['generate_button'] ) );
	}
	if ( isset( $_POST['encodeformats'] ) ) {
		$encode_checked = kgvid_sanitize_text_field( wp_unslash( $_POST['encodeformats'] ) );
	}
	if ( isset( $_POST['blog_id'] ) ) {
		$blog_id = kgvid_sanitize_text_field( wp_unslash( $_POST['blog_id'] ) );
	} else {
		$blog_id = false;
	}
	if ( isset( $_POST['poster'] ) ) {
		$poster = kgvid_sanitize_text_field( wp_unslash( $_POST['poster'] ) );
	}
	if ( isset( $_POST['parent_id'] ) ) {
		$parent_id = kgvid_sanitize_text_field( wp_unslash( $_POST['parent_id'] ) );
	}
	if ( ! isset( $parent_id ) ) {
		$parent_id = 'check';
	}
	if ( isset( $_POST['set_featured'] ) ) {
		$set_featured = kgvid_sanitize_text_field( wp_unslash( $_POST['set_featured'] ) );
	}
	if ( isset( $_POST['ffmpeg_action'] ) ) {
		$action = kgvid_sanitize_text_field( wp_unslash( $_POST['ffmpeg_action'] ) );
	}

	if ( $options['ffmpeg_exists'] === true ) {

		if ( $action === 'generate' && current_user_can( 'make_video_thumbnails' ) ) {

			$arr = kgvid_make_thumbs( $post_id, $movieurl, $numberofthumbs, $i, $iincreaser, $thumbtimecode, $dofirstframe, $generate_button );

		}
		if ( $action === 'enqueue' && current_user_can( 'encode_videos' ) ) {

			$arr = kgvid_enqueue_videos( $post_id, $movieurl, $encode_checked, $parent_id, $blog_id );

		}
		if ( $action === 'submit' && current_user_can( 'make_video_thumbnails' ) ) {

			kgivd_save_singleurl_poster( $parent_id, $poster, $movieurl, $set_featured );
			$arr = array( 'submit' );

		}
	} else {
		/* translators: %1$s is the path to FFmpeg. %2$s is non-visible HTML that starts a link */
		$thumbnaildisplaycode = '<strong>' . wp_kses_post( sprintf( esc_html__( 'Error: FFmpeg not found. Verify that FFmpeg is installed at %1$s and check the %2$sapplication path plugin setting', 'video-embed-thumbnail-generator' ), esc_html( $options['app_path'] ), '<a href="options-general.php?page=video_embed_thumbnail_generator_settings">' ) ) . '</a>.</strong>';

		$arr = array(
			'thumbnaildisplaycode' => $thumbnaildisplaycode,
			'embed_display'        => $thumbnaildisplaycode,
			'lastthumbnumber'      => 'break',
		);

	}//no ffmpeg

	wp_send_json( $arr );
}
add_action( 'wp_ajax_kgvid_callffmpeg', 'kgvid_callffmpeg' );

function kgvid_ajax_encode_videos() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$arr = kgvid_encode_videos();
	wp_send_json( $arr );
}
add_action( 'wp_ajax_kgvid_ajax_encode_videos', 'kgvid_ajax_encode_videos' );

function kgvid_ajax_clear_completed_queue() {

	$table = false;

	if ( current_user_can( 'encode_videos' ) ) {

		check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
		if ( isset( $_POST['scope'] ) ) {
			$scope = kgvid_sanitize_text_field( wp_unslash( $_POST['scope'] ) );
		}
		if ( isset( $_POST['type'] ) ) {
			$type = kgvid_sanitize_text_field( wp_unslash( $_POST['type'] ) );
		}
		kgvid_clear_completed_queue( $type, $scope );
		$table = kgvid_generate_queue_table( $scope );

	}

	echo wp_kses( $table, kgvid_allowed_html( 'admin' ) );
	die();
}
add_action( 'wp_ajax_kgvid_clear_completed_queue', 'kgvid_ajax_clear_completed_queue' );

function kgvid_ajax_clear_queue_entry() {

	$table = false;

	if ( current_user_can( 'encode_videos' ) ) {

		check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
		if ( isset( $_POST['index'] ) ) {
			$video_key = kgvid_sanitize_text_field( wp_unslash( $_POST['index'] ) );
		}
		if ( isset( $_POST['scope'] ) ) {
			$scope = kgvid_sanitize_text_field( wp_unslash( $_POST['scope'] ) );
		}
		$video_encode_queue = kgvid_get_encode_queue();
		if ( is_array( $video_encode_queue ) && array_key_exists( $video_key, $video_encode_queue ) ) {
			unset( $video_encode_queue[ $video_key ] );
			$video_encode_queue = array_merge( $video_encode_queue );
		}
		kgvid_save_encode_queue( $video_encode_queue );

		$table = kgvid_generate_queue_table( $scope );

	}

	echo wp_kses( $table, kgvid_allowed_html( 'admin' ) );
	die();
}
add_action( 'wp_ajax_kgvid_clear_queue_entry', 'kgvid_ajax_clear_queue_entry' );

function kgvid_ajax_cancel_encode() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	$canceled = false;

	if ( isset( $_POST['video_key'] ) ) {

		$video_key = kgvid_sanitize_text_field( wp_unslash( $_POST['video_key'] ) );

		if ( isset( $_POST['format'] ) ) {
			$format = kgvid_sanitize_text_field( wp_unslash( $_POST['format'] ) );
		}

		$canceled = kgvid_cancel_encode( $video_key, $format );

	}

	echo esc_html( $canceled );
	die();
}
add_action( 'wp_ajax_kgvid_cancel_encode', 'kgvid_ajax_cancel_encode' );

function kgvid_queue_control() {

	$success = false;
	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if ( isset( $_POST['command'] ) && current_user_can( 'edit_others_video_encodes' ) ) {

		$command = kgvid_sanitize_text_field( wp_unslash( $_POST['command'] ) );
		if ( isset( $_POST['scope'] ) ) {
			$scope = kgvid_sanitize_text_field( wp_unslash( $_POST['scope'] ) );
		}

		if ( $scope === 'site' ) {

			$options                  = kgvid_get_options();
			$options['queue_control'] = $command;
			$success                  = update_option( 'kgvid_video_embed_options', $options );

		}

		if ( $scope === 'network' ) {

			$network_options                  = get_site_option( 'kgvid_video_embed_network_options' );
			$network_options['queue_control'] = $command;
			$success                          = update_site_option( 'kgvid_video_embed_network_options', $network_options );

		}

		if ( $command === 'play' ) {
			kgvid_encode_videos();
		}
	}

	echo esc_html( $success );
	die();
}
add_action( 'wp_ajax_kgvid_queue_control', 'kgvid_queue_control' );

function kgvid_ajax_delete_video() {

	$deleted = false;

	if ( current_user_can( 'encode_videos' ) ) {

		check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

		$deleted       = false;
		$attachment_id = false;
		$format        = false;

		if ( isset( $_POST['movieurl'] ) ) {
			$movieurl = kgvid_sanitize_text_field( wp_unslash( $_POST['movieurl'] ) );
		}
		if ( isset( $_POST['format'] ) ) {
			$format = kgvid_sanitize_text_field( wp_unslash( $_POST['format'] ) );
		}
		if ( isset( $_POST['childid'] ) ) {
			$attachment_id = kgvid_sanitize_text_field( wp_unslash( $_POST['childid'] ) );
		}
		if ( isset( $_POST['blogid'] ) ) {
			$blog_id = kgvid_sanitize_text_field( wp_unslash( $_POST['blogid'] ) );
		} else {
			$blog_id = false;
		}

		if ( $attachment_id
			&& $format
			&& get_post_meta( $attachment_id, '_kgflashmediaplayer-format', true ) === $format
		) {
			if ( $blog_id ) {
				switch_to_blog( $blog_id );
			}
			$deleted = wp_delete_attachment( $attachment_id, true );
			if ( ! empty( $deleted ) ) {
				$deleted = true;
			}
			if ( $blog_id ) {
				restore_current_blog();
			}
		}

		$transient_name = kgvid_set_transient_name( $movieurl );
		delete_transient( 'kgvid_' . $transient_name );

	}

	echo esc_html( $deleted );
	die();
}
add_action( 'wp_ajax_kgvid_delete_video', 'kgvid_ajax_delete_video' );

function kgvid_get_set_featured() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	$args       = array(
		'post_type'   => null,
		'numberposts' => -1,
		'meta_key'    => '_kgflashmediaplayer-poster-id',
	);
	$videoposts = get_posts( $args );

	if ( $videoposts ) {
		foreach ( $videoposts as $post ) {
			if ( $post->post_type === 'attachment' ) {
				$post_id = $post->post_parent;
			} else {
				$post_id = $post->ID;
			}
			$poster_id = get_post_meta( $post->ID, '_kgflashmediaplayer-poster-id', true );
			if ( ! empty( $post_id ) && ! empty( $poster_id ) ) {
				$posts[ $post_id ] = $poster_id;
			}
		}//end loop
	}//end if posts

	$cms_switch_queue                 = get_option( 'kgvid_video_embed_cms_switch' );
	$cms_switch_queue['set_featured'] = $posts;
	update_option( 'kgvid_video_embed_cms_switch', $cms_switch_queue );

	echo esc_html( count( $posts ) );
	die;
}
add_action( 'wp_ajax_kgvid_get_set_featured', 'kgvid_get_set_featured' );

function kgvid_set_featured() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$queue = get_option( 'kgvid_video_embed_cms_switch' );
	if ( $queue['set_featured'] ) {
		foreach ( $queue['set_featured'] as $post_id => $poster_id ) {
			set_post_thumbnail( $post_id, $poster_id );
			unset( $queue['switching_parents'][ $post_id ] );
			update_option( 'kgvid_video_embed_cms_switch', $queue );
		}
		unset( $queue['set_featured'] );
		if ( empty( $queue ) ) {
			delete_option( 'kgvid_video_embed_cms_switch' );
		} else {
			update_option( 'kgvid_video_embed_cms_switch', $queue );
		}
	}

	echo true;
	die;
}
add_action( 'wp_ajax_kgvid_set_featured', 'kgvid_set_featured' );

function kgvid_get_switch_parents() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$new_parent = 'post';
	if ( isset( $_POST['parent'] ) ) {
		$new_parent = kgvid_sanitize_text_field( wp_unslash( $_POST['parent'] ) );
	}
	$children = array();

	if ( $new_parent === 'post' ) {
		$args        = array(
			'orderby'        => 'post_date',
			'order'          => 'ASC',
			'post_type'      => 'attachment',
			'numberposts'    => -1,
			'post_mime_type' => 'video',
		);
		$attachments = get_posts( $args );

		if ( $attachments ) {
			foreach ( $attachments as $post ) {
				if ( ! empty( $post->post_parent ) ) { // if the video is attached to a post
					$args       = array(
						'orderby'        => 'post_date',
						'order'          => 'ASC',
						'post_parent'    => $post->ID,
						'post_type'      => 'attachment',
						'post_mime_type' => 'image',
						'numberposts'    => -1,
					);
					$thumbnails = get_posts( $args );
					if ( $thumbnails ) {
						foreach ( $thumbnails as $thumbnail ) {
							$children[ $thumbnail->ID ] = array(
								'post_parent' => $post->post_parent,
								'video_id'    => $post->ID,
							);
						}
					}//end if there are children
				}//end if it has a parent
			}//end loop
		}//end if posts
	}//end if new parent is post

	if ( $new_parent === 'video' ) {

		$args       = array(
			'orderby'        => 'post_date',
			'order'          => 'ASC',
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'meta_key'       => '_kgflashmediaplayer-video-id',
			'numberposts'    => -1,
		);
		$thumbnails = get_posts( $args );

		if ( $thumbnails ) {
			foreach ( $thumbnails as $thumbnail ) {
				$video_id                   = get_post_meta( $thumbnail->ID, '_kgflashmediaplayer-video-id', true );
				$children[ $thumbnail->ID ] = array(
					'post_parent' => false,
					'video_id'    => $video_id,
				);
			}
		}
	}

	$cms_switch_queue                      = get_option( 'kgvid_video_embed_cms_switch' );
	$cms_switch_queue['switching_parents'] = $children;
	update_option( 'kgvid_video_embed_cms_switch', $cms_switch_queue );

	echo count( $children );
	die;
}
add_action( 'wp_ajax_kgvid_get_switch_parents', 'kgvid_get_switch_parents' );

function kgvid_switch_parents() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$queue = get_option( 'kgvid_video_embed_cms_switch' );
	if ( is_array( $queue ) && array_key_exists( 'switching_parents', $queue ) && $queue['switching_parents'] ) {
		$new_parent = 'post';
		if ( isset( $_POST['parent'] ) ) {
			$new_parent = kgvid_sanitize_text_field( wp_unslash( $_POST['parent'] ) );
		}
		if ( is_array( $queue ) && array_key_exists( 'switching_parents', $queue ) && is_array( $queue['switching_parents'] ) ) {
			foreach ( $queue['switching_parents'] as $thumbnail_id => $thumbnail ) {
				if ( $new_parent == 'post' ) {
					wp_update_post(
						array(
							'ID'          => $thumbnail_id,
							'post_parent' => $thumbnail['post_parent'],
						)
					);
					update_post_meta( $thumbnail_id, '_kgflashmediaplayer-video-id', $thumbnail['video_id'] );
				}

				if ( $new_parent == 'video' ) {
					wp_update_post(
						array(
							'ID'          => $thumbnail_id,
							'post_parent' => $thumbnail['video_id'],
						)
					);
				}
				unset( $queue['switching_parents'][ $thumbnail_id ] );
				update_option( 'kgvid_video_embed_cms_switch', $queue );
			}
			unset( $queue['switching_parents'] );
		}
		if ( empty( $queue ) ) {
			delete_option( 'kgvid_video_embed_cms_switch' );
		} else {
			update_option( 'kgvid_video_embed_cms_switch', $queue );
		}
	}

	echo true;
	die;
}
add_action( 'wp_ajax_kgvid_switch_parents', 'kgvid_switch_parents' );


function kgvid_get_generating_old() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if ( isset( $_POST['type'] ) ) {
		$type = kgvid_sanitize_text_field( wp_unslash( $_POST['type'] ) );
	}
	$args        = array();
	$attachments = array();

	if ( $type === 'thumbs' && current_user_can( 'make_video_thumbnails' ) ) {

		$args = array(
			'orderby'        => 'post_date',
			'order'          => 'ASC',
			'post_type'      => 'attachment',
			'post_mime_type' => 'video',
			'meta_query'     => array(
				'relation' => 'OR',
				array(
					'key'   => '_kgflashmediaplayer-poster',
					'value' => '',
				),
				array(
					'key'     => '_kgflashmediaplayer-poster',
					'compare' => 'NOT EXISTS',
				),
			),
			'numberposts'    => -1,
		);

	}

	if ( $type == 'encode' && current_user_can( 'encode_videos' ) ) {

		$args = array(
			'orderby'        => 'post_date',
			'order'          => 'ASC',
			'post_type'      => 'attachment',
			'post_mime_type' => 'video',
			'numberposts'    => -1,
		);

	}

	$args = apply_filters( 'kgvid_get_generating_old', $args, $type );

	$videos = get_posts( $args );

	if ( $videos ) {
		foreach ( $videos as $video ) {
			$is_child_format = get_post_meta( $video->ID, '_kgflashmediaplayer-format', true ); // check if video is a child format
			if ( ! $is_child_format ) {
				$attachments[] = $video->ID;
			}
		}
	}

	if ( $attachments ) {
		$cms_switch_queue                              = get_option( 'kgvid_video_embed_cms_switch' );
		$cms_switch_queue[ 'generating_old_' . $type ] = $attachments;
		update_option( 'kgvid_video_embed_cms_switch', $cms_switch_queue );
	}

	echo esc_html( count( $attachments ) );
	die;
}
add_action( 'wp_ajax_kgvid_get_generating_old', 'kgvid_get_generating_old' );

function kgvid_generating_old() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if ( isset( $_POST['type'] ) ) {
		$type = kgvid_sanitize_text_field( wp_unslash( $_POST['type'] ) );
	}

	kgvid_generate_old( $type );

	echo true;
	die;
}
add_action( 'wp_ajax_kgvid_generating_old', 'kgvid_generating_old' );

function kgvid_update_cms_progress() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );
	$remaining = 0;
	if ( isset( $_POST['cms_type'] ) ) {
		$type = kgvid_sanitize_text_field( wp_unslash( $_POST['cms_type'] ) );
	}
	$queue = get_option( 'kgvid_video_embed_cms_switch' );
	if ( is_array( $queue )
		&& array_key_exists( $type, $queue )
	) {
		$remaining = count( $queue[ $type ] );
		if ( $remaining > 0
			&& ( $type === 'thumbs' || $type === 'encode' )
		) {
			kgvid_generate_old( $type );
		}
	}
	echo absint( $remaining );
	die;
}
add_action( 'wp_ajax_kgvid_update_cms_progress', 'kgvid_update_cms_progress' );

function kgvid_ajax_clear_transient_cache() {

	check_ajax_referer( 'video-embed-thumbnail-generator-nonce', 'security' );

	if ( current_user_can( 'manage_options' ) ) {

		kgvid_delete_transients();
		echo true;

	} else {
		echo false;
	}

	die();
}
add_action( 'wp_ajax_kgvid_clear_transient_cache', 'kgvid_ajax_clear_transient_cache' );
