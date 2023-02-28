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

	$thumb_info = videopack_save_canvas_thumb( $raw_png, $post_id, $video_url, $total, $index );

	return $thumb_info;
}

function videopack_prepare_attachment( $response, $attachment, $meta ) {
	$new_meta = array(
		'_kgvid-meta'                   => get_post_meta( $attachment->ID, '_kgvid-meta', true ),
		'_kgflashmediaplayer-poster-id' => get_post_meta( $attachment->ID, '_kgflashmediaplayer-poster-id', true ),
		'_kgflashmediaplayer-poster'    => get_post_meta( $attachment->ID, '_kgflashmediaplayer-poster', true ),
	);
	if ( array_key_exists( 'meta', $response )
		&& is_array( $response['meta'] )
	) {
		$response['meta'] = array_merge( $response['meta'], $new_meta );
	} else {
		$response['meta'] = $new_meta;
	}
	return $response;
}
add_filter( 'wp_prepare_attachment_for_js', 'videopack_prepare_attachment', 10, 3 );

function kgvid_register_attachment_meta() {

	$kgflashmedia_fields = array(
		'poster'       => 'string',
		'poster-id'    => 'number',
		'format'       => 'string',
		'pickedformat' => 'string',
		'video-id'     => 'number',
		'externalurl'  => 'string',
	);

	foreach ( $kgflashmedia_fields as $field_name => $type ) {
		register_post_meta(
			'attachment',
			'_kgflashmediaplayer-' . $field_name,
			array(
				'type'          => $type,
				'single'        => true,
				'show_in_rest'  => true,
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
						'actualheight'        => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'actualwidth'         => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'aspect'              => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'autothumb-error'     => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'completeviews'       => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'downloadlink'        => array(
							'type' => array(
								'string',
								'boolean',
							),
						),
						'duration'            => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'embed'               => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'encode'              => array(
							'type' => 'object',
							'additionalProperties' => true,
						),
						'featured'            => array(
							'type' => array(
								'string',
								'boolean',
							),
						),
						'featuredchanged'     => array(
							'type' => array(
								'string',
								'boolean',
							),
						),
						'forcefirst'          => array(
							'type' => array(
								'string',
								'boolean',
							),
						),
						'gallery_exclude'     => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'gallery_id'          => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'gallery_include'     => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'gallery_order'       => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'gallery_orderby'     => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'gallery_thumb_width' => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'height'              => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'lockaspect'          => array(
							'type' => array(
								'string',
								'boolean',
							),
						),
						'maxheight'   => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'maxwidth'   => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'numberofthumbs'      => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'original_replaced'   => array(
							'type' => array(
								'string',
							),
						),
						'pickedformat'        => array(
							'type' => array(
								'string',
							),
						),
						'play_25'             => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'play_50'             => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'play_75'             => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'poster'   => array(
							'type' => array(
								'string',
							),
						),
						'rotate'              => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'showtitle'           => array(
							'type' => array(
								'string',
								'boolean',
							),
						),
						'starts'              => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'thumbtime'           => array(
							'type' => array(
								'string',
								'number',
							),
						),
						'track'               => array(
							'type' => 'array',
							'items' => array(
								'type' => 'object',
								'properties' => array(
									'src' => array(
										'type' => array(
											'string',
											'number',
										),
									),
									'kind' => array(
										'type' => array(
											'string',
											'number',
										),
									),
									'default' => array(
										'type' => array(
											'string',
											'boolean',
										),
									),
									'srclang' => array(
										'type' => array(
											'string',
											'number',
										),
									),
									'label' => array(
										'type' => array(
											'string',
											'number',
										),
									),
								),
							),
						),
						'url'   => array(
							'type' => array(
								'string',
							),
						),
						'width'               => array(
							'type' => array(
								'string',
								'number',
							),
						),
					),
				),
			),
			'auth_callback' => function() {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}
add_action( 'init', 'kgvid_register_attachment_meta' );

function log_all_errors_to_debug_log($code, $message, $data, $wp_error ) {
    error_log( $code . ': ' . $message );
}

add_action( 'wp_error_added', 'log_all_errors_to_debug_log', 10, 4 );
