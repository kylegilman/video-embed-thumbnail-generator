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
		'_kgvid-meta' => kgvid_get_attachment_meta( $attachment->ID ),
		//'encodevideo_info' => kgvid_encodevideo_info( $attachment->url, $attachment->ID ),
		'_kgflashmediaplayer-poster-id' => get_post_meta( $attachment->ID, '_kgflashmediaplayer-poster-id', true ),
		'_kgflashmediaplayer-poster' => get_post_meta( $attachment->ID, '_kgflashmediaplayer-poster', true ),
	);
	$response['meta'] = array_merge( $response['meta'], $new_meta );
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
						array(
							'align'                  => array(
								'type' => 'string',
							),
							'autoplay'               => array(
								'type' => array( 'boolean, string' ),
							),
							'caption'                => array(
								'type' => 'string',
							),
							'controls'               => array(
								'type' => array( 'boolean, string' ),
							),
							'description'            => array(
								'type' => 'string',
							),
							'downloadlink'           => array(
								'type' => array( 'boolean, string' ),
							),
							'embedcode'              => array(
								'type' => array( 'boolean, string' ),
							),
							'embeddable'             => array(
								'type' => array( 'boolean, string' ),
							),
							'endofvideooverlay'      => array(
								'type' => 'string',
							),
							'endofvideooverlaysame'  => array(
								'type' => array( 'boolean, string' ),
							),
							'fixed_aspect'           => array(
								'type' => 'string',
							),
							'fullwidth'              => array(
								'type' => array( 'boolean, string' ),
							),
							'gallery'                => array(
								'type' => array( 'boolean, string' ),
							),
							'gallery_end'            => array(
								'type' => 'string',
							),
							'gallery_exclude'        => array(
								'type' => 'string',
							),
							'gallery_id'             => array(
								'type' => 'string',
							),
							'gallery_include'        => array(
								'type' => 'string',
							),
							'gallery_order'          => array(
								'type' => 'string',
							),
							'gallery_orderby'        => array(
								'type' => 'string',
							),
							'gallery_pagination'     => array(
								'type' => array( 'boolean, string' ),
							),
							'gallery_per_page'       => array(
								'type' => 'number',
							),
							'gallery_thumb'          => array(
								'type' => 'number',
							),
							'gallery_thumb_aspect'   => array(
								'type' => array( 'boolean, string' ),
							),
							'height'                 => array(
								'type' => 'number',
							),
							'id'                     => array(
								'type' => 'number',
							),
							'inline'                 => array(
								'type' => array( 'boolean, string' ),
							),
							'loop'                   => array(
								'type' => array( 'boolean, string' ),
							),
							'muted'                  => array(
								'type' => array( 'boolean, string' ),
							),
							'nativecontrolsfortouch' => array(
								'type' => array( 'boolean, string' ),
							),
							'order'                  => array(
								'type' => 'string',
							),
							'orderby'                => array(
								'type' => 'string',
							),
							'pauseothervideos'       => array(
								'type' => array( 'boolean, string' ),
							),
							'pixel_ratio'            => array(
								'type' => array( 'boolean, string' ),
							),
							'playback_rate'          => array(
								'type' => array( 'boolean, string' ),
							),
							'playsinline'            => array(
								'type' => array( 'boolean, string' ),
							),
							'poster'                 => array(
								'type' => 'string',
							),
							'preload'                => array(
								'type' => 'string',
							),
							'resize'                 => array(
								'type' => array( 'boolean, string' ),
							),
							'right_click' => array(
								'type' => array( 'boolean, string' ),
							),
							'schema' => array(
								'type' => array( 'boolean, string' ),
							),
							'skin' => array(
								'type' => 'string',
							),
							'start' => array(
								'type' => 'string',
							),
							'title' => array(
								'type' => 'string',
							),
							'track_default' => array(
								'type' => array( 'boolean, string' ),
							),
							'track_kind' => array(
								'type' => 'string',
							),
							'track_label' => array(
								'type' => 'string',
							),
							'track_src' => array(
								'type' => 'string',
							),
							'track_srclang' => array(
								'type' => 'string',
							),
							'videos' => array(
								'type' => 'number',
							),
							'view_count' => array(
								'type' => array( 'boolean, string' ),
							),
							'volume' => array(
								'type' => 'number',
							),
							'watermark' => array(
								'type' => 'string',
							),
							'watermark_link_to' => array(
								'type' => 'string',
							),
							'watermark_url' => array(
								'type' => 'string',
							),
							'width' => array(
								'type' => 'number',
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
