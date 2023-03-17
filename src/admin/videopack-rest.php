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

class Videopack_Custom_Controller extends WP_REST_Controller {

	public function register_routes() {

		$version   = '1';
		$namespace = 'videopack/v' . $version;

		register_rest_route(
			$namespace,
			'/settings',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'settings' ),
				'permission_callback' => '__return_true',
			),
		);

		register_rest_route(
			$namespace,
			'/thumb',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'thumb_save' ),
					'permission_callback' => function() {
						return current_user_can( 'make_video_thumbnails' );
					},
					'args'                => array(
						'postId' => array(
							'type' => array(
								'number',
								'string',
							),
							'required' => true,
						),
						'thumburl' => array(
							'type' => 'string',
							'required' => true,
						),
						'index' => array(
							'type' => 'number',
							'required' => true,
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'thumb_generate' ),
					'permission_callback' => function() {
						$options = kgvid_get_options();
						return ( current_user_can( 'make_video_thumbnails' ) && $options['ffmpeg_exists'] === 'on' );
					},
					'args'                => array(
						'movieurl' => array(
							'type' => 'string',
							'required' => true,
						),
						'numberofthumbs' => array(
							'type'    => 'number',
							'minimum' => 1,
							'maximum' => 100,
							'default' => 4,
							'required' => true,
						),
						'thumbnumber' => array(
							'type' => 'number',
							'required' => true,
						),
						'thumbnumberplusincreaser' => array(
							'type' => 'number',
							'required' => true,
						),
						'attachmentID' => array(
							'type' => 'number',
							'required' => true,
						),
						'generate_button' => array(
							'type' => 'string',
							'required' => true,
						),
						'thumbtimecode' => array(
							'type' => array(
								'number',
								'string',
							),
							'required' => true,
						),
						'dofirstframe' => array(
							'type' => 'boolean',
							'required' => true,
						),
						'poster' => array(
							'type' => 'string',
						),
						'parent_id' => array(
							'type' => 'number',
						),
					),
				),
			)
		);
		register_rest_route(
			$namespace,
			'/sources',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'video_sources' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'url'    => array(
						'type' => 'string',
					),
					'postId' => array(
						'type' => 'number',
					),
				),
			),
		);
		register_rest_route(
			$namespace,
			'/checkboxes',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'checkboxes' ),
				'permission_callback' => function() {
					return current_user_can( 'upload_files' );
				},
				'args'                => array(
					'url'    => array(
						'type' => 'string',
					),
					'postId' => array(
						'type' => 'number',
					),
				),
			),
		);
		register_rest_route(
			$namespace,
			'/queue/(?P<attachmentID>\w+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'queue_get' ),
					'permission_callback' => function() {
						$options = kgvid_get_options();
						return ( $options['ffmpeg_exists'] === 'on' );
					},
					'args'                => array(
						'attachmentID' => array(
							'type' => 'number',
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'queue_edit' ),
					'permission_callback' => function() {
						$options = kgvid_get_options();
						return ( current_user_can( 'encode_videos' ) && $options['ffmpeg_exists'] === 'on' );
					},
					'args'                => array(
						'movieurl' => array(
							'type' => 'string',
						),
						'attachmentID' => array(
							'type' => 'number',
						),
						'encodeformats' => array(
							'type' => 'object',
							'additionalProperties' => array(
								'type' => 'boolean',
							),
						),
						'parent_id' => array(
							'type' => 'number',
						),
					),
				),
			),
		);
	}

	/**
	 * Recursively generate JSON schema from an array of default options
	 *
	 * @param array $default_options The array of default options.
	 *
	 * @return array The generated JSON schema.
	 */
	public function generate_json_schema( $default_options ) {
		$schema = array();
		foreach ( $default_options as $key => $value ) {
			$type = 'string';
			if ( is_numeric( $value ) ) {
				$type = 'number';
			} elseif ( $value === false || $value === 'on' ) {
				$type = 'boolean';
				if ( $value === 'on' ) {
					$value = true;
				}
			} elseif ( is_array( $value ) ) {
				$type = 'object';
				$value = $this->generate_json_schema( $value );
			}
			$schema[ $key ] = array(
				'type'    => $type,
				'default' => $value,
			);
		}
		return $schema;
	}

	public function clean_array( $dirty_array ) {
		foreach ( $dirty_array as $key => $value ) {
			if ( is_array( $value ) ) {
				$dirty_array[ $key ] = $this->clean_array( $value );
			} elseif ( is_float( $value )
				&& ( is_nan( $value )
					|| is_infinite( $value )
				)
			) {
				$dirty_array[ $key ] = null;
			} elseif ( $key === 'filepath' ) {
				unset( $dirty_array[ $key ] );
			} elseif ( $value === 'checked' || $value === 'on' ) {
				$dirty_array[ $key ] = true;
			}
		}
		return $dirty_array;
	}

	public function settings() {

		$options        = kgvid_get_options();
		$unsafe_options = array(
			'app_path',
			'error_email',
			'encode_array',
			'capabilities',
			'moov_path',
			'ffmpeg_watermark',
			'version',
		);
		foreach ( $unsafe_options as $unsafe_option ) {
			if ( array_key_exists( $unsafe_option, $options ) ) {
				unset( $options[ $unsafe_option ] );
			}
		}
		foreach ( $options as $key => $value ) {
			if ( $value === 'on' ) {
				$options[ $key ] = true;
			}
		}
		return $options;
	}

	public function thumb_generate( $request ) {

		$params   = $request->get_params();
		$response = array();

		$response = kgvid_make_thumbs(
			$params['attachmentID'],
			$params['movieurl'],
			$params['numberofthumbs'],
			$params['thumbnumber'],
			$params['thumbnumberplusincreaser'],
			$params['thumbtimecode'],
			$params['dofirstframe'],
			$params['generate_button'],
		);

		return $response;
	}

	public function thumb_save( $request ) {

		$params = $request->get_params();

		if ( is_numeric( $params['postId'] ) ) {
			$post_name = get_the_title( $params['postId'] );
		} else {
			$post_name = str_replace( 'singleurl_', '', $params['postId'] );
		}
		$response = kgvid_save_thumb(
			$params['postId'],
			$post_name,
			$params['thumburl'],
			intval( $params['index'] ) + 1,
		);

		return $response;
	}

	public function video_sources( $request ) {

		$url = $request->get_param( 'url' );
		if ( ! $url ) {
			return new WP_Error( 'rest_invalid_param', esc_html__( 'Missing Video Url.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}
		$post_id     = $request->get_param( 'postId' );
		$source_info = kgvid_prepare_sources( $url, $post_id );

		return $source_info;
	}

	public function checkboxes( $request ) {

		$params     = $request->get_params();
		$checkboxes = kgvid_generate_encode_checkboxes( $params['url'], $params['postId'], 'attachment' );
		$checkboxes = $this->clean_array( $checkboxes['data'] );
		kgvid_encode_progress();
		return $checkboxes;
	}

	public function queue_get( $request ) {

		$params             = $request->get_params();
		$found              = false;
		$video_encode_queue = kgvid_get_encode_queue();
		$video_encode_queue = $this->clean_array( $video_encode_queue );

		if ( array_key_exists( 'attachmentID', $params ) ) {
			foreach ( $video_encode_queue as $video_key => $video_entry ) {
				if ( $video_entry['attachmentID'] === $params['attachmentID'] ) {
					$video_encode_queue = $video_encode_queue[ $video_key ];
					$found = true;
					break;
				}
			}
			if ( ! $found ) {
				$video_encode_queue = array();
			}
		}

		kgvid_encode_progress();

		return $video_encode_queue;
	}

	public function queue_edit( $request ) {

		$params   = $request->get_params();
		$response = array();

		$response = kgvid_enqueue_videos(
			$params['attachmentID'],
			$params['movieurl'],
			$params['encodeformats'],
			$params['parent_id'],
		);
		kgvid_encode_videos();
		return $response;
	}
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
							'type'                 => 'object',
							'additionalProperties' => array(
								'type' => array(
									'string',
									'boolean',
								),
								'enum' => array(
									'on',
									'notchecked',
									true,
									false,
								),
							),
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

function videopack_register_rest_routes() {
	$controller = new Videopack_Custom_Controller();
	$controller->register_routes();
}
add_action( 'rest_api_init', 'videopack_register_rest_routes' );

function log_all_errors_to_debug_log($code, $message, $data, $wp_error ) {
    error_log( $code . ': ' . $message );
}
//add_action( 'wp_error_added', 'log_all_errors_to_debug_log', 10, 4 );
