<?php
/**
 * The REST specific functionality of the Videopack plugin.
 *
 * @link       https://www.videopack.video
 *
 * @package    Videopack
 * @subpackage Videopack/admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */

function videopack_rest_routes() {
	register_rest_route(
		'videopack/v1',
		'/send-thumb',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'videopack_rest_send_thumb_data',
			'permission_callback' => function() {
				return current_user_can( 'make_video_thumbnails' );
			},
		)
	);
}
add_action( 'rest_api_init', 'videopack_rest_routes' );

function videopack_rest_send_thumb_data( $request ) {

	$raw_png = $request->get_param( 'raw_png' );
	if ( ! $raw_png ) {
		return new WP_Error( 'rest_invalid_param', esc_html__( 'Missing image data.', 'my-textdomain' ), array( 'status' => 400 ) );
	}
	$post_id   = $request->get_param( 'postId' );
	$video_url = $request->get_param( 'url' );
	$total     = 2;
	$index     = $request->get_param( 'index' );

	$thumb_url = videopack_save_canvas_thumb( $raw_png, $post_id, $video_url, $total, $index );

	return esc_url( $thumb_url );
}

function videopack_save_canvas_thumb( $raw_png, $post_id, $video_url, $total, $index ) {

	$uploads       = wp_upload_dir();
	$sanitized_url = kgvid_sanitize_url( $video_url );
	$posterfile    = $sanitized_url['basename'] . '_thumb' . $index;
	wp_mkdir_p( $uploads['path'] . '/thumb_tmp' );
	$tmp_posterpath = $uploads['path'] . '/thumb_tmp/' . $posterfile . '.png';
	$thumb_url      = $uploads['url'] . '/' . $posterfile . '.jpg';

	$editor = kgvid_decode_base64_png( $raw_png, $tmp_posterpath );

	if ( is_wp_error( $editor ) ) { // couldn't open the image. Try the alternate php://input

		$raw_post = file_get_contents( 'php://input' );
		parse_str( $raw_post, $alt_post );
		$editor = kgvid_decode_base64_png( $alt_post['raw_png'], $tmp_posterpath );

	}

	if ( is_wp_error( $editor ) ) {
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
		if ( $total > 1 ) {
			$post_name  = get_the_title( $post_id );
			$thumb_info = kgvid_save_thumb( $post_id, $post_name, $thumb_url, $index );
		}
	}

	kgvid_schedule_cleanup_generated_files( 'thumbs' );

	return $thumb_url;
}

function videopack_prepare_attachment( $response, $attachment, $request ) {

	$response->data['meta']['videopack'] = array(
		'kgvid_postmeta' => kgvid_get_attachment_meta( $attachment->ID ),
		//'encodevideo_info' => kgvid_encodevideo_info( $attachment->url, $attachment->ID ),
		'poster_id' => get_post_meta( $attachment->ID, '_kgflashmediaplayer-poster-id', true ),
		'poster' => get_post_meta( $attachment->ID, '_kgflashmediaplayer-poster', true ),
	);
	return $response;
}
//add_filter( 'rest_prepare_attachment', 'videopack_prepare_attachment', 10, 3 );

function kgvid_register_attachment_meta() {

	$kgflashmedia_fields = array(
		'poster'       => 'video poster URL',
		'poster-id'    => 'video poster ID',
		'format'       => 'video format',
		'pickedformat' => 'picked video format',
		'video-id'     => 'video parent ID',
		'externalurl'  => 'external URL',
	);

	foreach ( $kgflashmedia_fields as $field_name => $description ) {
		register_post_meta(
			'attachment',
			'_kgflashmediaplayer-' . $field_name,
			array(
				'type'         => 'string',
				'description'  => 'Videopack ' . $description,
				'single'       => true,
				'show_in_rest' => true,
				'auth_callback' => function() {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}
	register_post_meta(
		'attachment',
		'_kgvid-meta',
		array(
			'type'         => 'object',
			'description'  => 'Videopack postmeta',
			'single'       => true,
			'show_in_rest' => array(
				'schema' => array(
					'type'  => 'object',
					'properties' => array(
						'numberofthumbs' => array(
							'type' => 'number',
						),
					),
					'additionalProperties' => true,
				),
			),
			'auth_callback' => function() {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}
add_action( 'init', 'kgvid_register_attachment_meta' );
