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

namespace Videopack\Admin;

class REST_Controller extends \WP_REST_Controller {

	/**
	 * Videopack Options manager class instance
	 * @var Options $options_manager
	 */
	protected $options_manager;
	protected $options;
	protected $namespace;
	protected $uploads;

	public function __construct( Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->namespace       = 'videopack/v1';
		$this->uploads         = wp_upload_dir();
	}


	public function add_rest_routes() {
		$this->register_routes();
		$this->add_data_to_rest_response();
	}

	public function register_routes() {

		register_rest_route(
			$this->namespace,
			'/recent_videos',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'recent_videos' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'posts' => array(
						'type' => 'number',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/video_gallery',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'video_gallery' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'gallery_orderby'  => array(
						'type' => 'string',
					),
					'gallery_order'    => array(
						'type' => 'string',
					),
					'gallery_per_page' => array(
						'type' => 'number',
					),
					'gallery_id'       => array(
						'type' => 'number',
					),
					'gallery_include'  => array(
						'type' => 'string',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/settings',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'settings' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			$this->namespace,
			'/defaults',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'defaults' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			$this->namespace,
			'/roles',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'roles' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' ) && current_user_can( 'edit_users' );
				},
			)
		);

		register_rest_route(
			$this->namespace,
			'/formats/(?P<id>\w+)',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'formats' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'id' => array(
						'type' => 'number',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/formats',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'formats' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			$this->namespace,
			'/thumbs',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'thumb_save' ),
					'permission_callback' => function () {
						return current_user_can( 'make_video_thumbnails' );
					},
					'args'                => array(
						'postId'   => array(
							'type'     => array(
								'number',
								'string',
							),
							'required' => true,
						),
						'thumburl' => array(
							'type'     => 'string',
							'required' => true,
						),
						'index'    => array(
							'type'     => 'number',
							'required' => true,
						),
					),
				),
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'thumb_generate' ),
					'permission_callback' => function () {
						return ( current_user_can( 'make_video_thumbnails' ) && $this->options['ffmpeg_exists'] === true );
					},
					'args'                => array(
						'movieurl'                 => array(
							'type'     => 'string',
							'required' => true,
						),
						'numberofthumbs'           => array(
							'type'     => 'number',
							'minimum'  => 1,
							'maximum'  => 100,
							'default'  => 4,
							'required' => true,
						),
						'thumbnumber'              => array(
							'type'     => 'number',
							'required' => true,
						),
						'thumbnumberplusincreaser' => array(
							'type'     => 'number',
							'required' => true,
						),
						'attachmentID'             => array(
							'type'     => 'number',
							'required' => true,
						),
						'generate_button'          => array(
							'type'     => 'string',
							'required' => true,
						),
						'thumbtimecode'            => array(
							'type'     => array(
								'number',
								'string',
							),
							'required' => true,
						),
						'dofirstframe'             => array(
							'type'     => 'boolean',
							'required' => true,
						),
						'poster'                   => array(
							'type' => 'string',
						),
						'parent_id'                => array(
							'type' => 'number',
						),
					),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/sources',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'video_sources' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'url' => array(
						'type' => 'string',
					),
					'id'  => array(
						'type' => array(
							'number',
							'string',
						),
					),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/checkboxes',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'checkboxes' ),
				'permission_callback' => function () {
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
			)
		);
		register_rest_route(
			$this->namespace,
			'/queue/(?P<id>\w+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'queue_get' ),
					'permission_callback' => function () {
						return ( $this->options['ffmpeg_exists'] === true );
					},
					'args'                => array(
						'id' => array(
							'type' => 'number',
						),
					),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'queue_edit' ),
					'permission_callback' => function () {
						return ( current_user_can( 'encode_videos' ) && $this->options['ffmpeg_exists'] === true );
					},
					'args'                => array(
						'url'       => array(
							'type' => 'string',
						),
						'id'        => array(
							'type' => 'number',
						),
						'formats'   => array(
							'type'                 => 'object',
							'additionalProperties' => array(
								'type' => 'boolean',
							),
						),
						'parent_id' => array(
							'type' => 'number',
						),
					),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/ffmpeg-test/(?P<format>\w+)',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'ffmpeg_test' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
				'args'                => array(
					'format' => array(
						'type' => 'string',
					),
					'rotate' => array(
						'type' => array( 'boolean', 'string' ),
					),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/wp-video',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'wp_video' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'src'      => array(
						'type' => 'string',
					),
					'poster'   => array(
						'type' => 'string',
					),
					'loop'     => array(
						'type' => array( 'string', 'boolean' ),
					),
					'autoplay' => array(
						'type' => array( 'string', 'boolean' ),
					),
					'preload'  => array(
						'type' => 'string',
					),
					'width'    => array(
						'type' => array( 'string', 'number' ),
					),
					'height'   => array(
						'type' => array( 'string', 'number' ),
					),
				),
			)
		);
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
			} elseif ( strpos( $key, 'path' ) !== false ) {
				unset( $dirty_array[ $key ] );
			} elseif ( $value === 'checked' || $value === true ) {
				$dirty_array[ $key ] = true;
			}
		}
		return $dirty_array;
	}

	public function settings() {
		$all_options  = $this->options;
		$safe_options = array();

		// Define keys that should not be exposed via this REST endpoint.
		$unsafe_keys = array(
			'app_path',
			'error_email',
			'capabilities',
			'ffmpeg_watermark',
			'ffmpeg_thumb_watermark',
			'htaccess_login',
			'htaccess_password',
		);

		foreach ( $all_options as $key => $value ) {
			if ( ! in_array( $key, $unsafe_keys, true ) ) {
				$safe_options[ $key ] = $value;
			}
		}
		return $safe_options;
	}

	public function defaults() {
		$defaults = $this->options_manager->get_default();
		return $defaults;
	}

	public function roles() {
		if ( ! function_exists( 'get_editable_roles' ) ) {
			require_once ABSPATH . 'wp-admin/includes/user.php';
		}
		$roles = get_editable_roles();
		return $roles;
	}

	public function formats( \WP_REST_Request $request ) {
		$params = $request->get_params();
		if ( array_key_exists( 'id', $params )
			&& get_post_type( $params['id'] ) === 'attachment'
		) {
			$encoder       = new encode\Encode_Attachment( $this->options_manager, $params['id'] );
			$video_formats = $encoder->get_available_formats();
			foreach ( $video_formats as $format => $format_info ) {
				$encode_info              = $encoder->get_encode_info( $format );
				$video_formats[ $format ] = array_merge( $format_info, $encode_info );
			}
		} else {
			$unsorted_video_formats = $this->options_manager->get_video_formats();
			foreach ( $unsorted_video_formats as $format => $format_info ) {
				$format_info['format'] = $format;
				$video_formats[]       = $format_info;
			}
		}
		$video_formats = $this->clean_array( $video_formats );
		return $video_formats;
	}

	public function thumb_generate( \WP_REST_Request $request ) {

		$params            = $request->get_params();
		$response          = array();
		$ffmpeg_thumbnails = new Thumbnails\FFmpeg_Thumbnails( $this->options_manager );

		$response = $ffmpeg_thumbnails->make(
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

	public function thumb_save( \WP_REST_Request $request ) {

		$params     = $request->get_params();
		$thumbnails = new Thumbnails\Thumbnails( $this->options_manager );

		if ( is_numeric( $params['postId'] ) ) {
			$post_name = get_the_title( $params['postId'] );
		} else {
			$post_name = str_replace( 'singleurl_', '', $params['postId'] );
		}
		$response = $thumbnails->save(
			$params['postId'],
			$post_name,
			$params['thumburl'],
			intval( $params['index'] ) + 1,
		);

		return $response;
	}

	public function recent_videos( \WP_REST_Request $request ) {

		$response = array();

		$args = array(
			'post_type'      => 'attachment',
			'orderby'        => 'post_date',
			'order'          => 'DESC',
			'post_mime_type' => 'video',
			'posts_per_page' => $request->get_param( 'posts' ),
			'post_status'    => 'published',
			'fields'         => 'ids',
			'meta_query'     => array(
				'relation' => 'AND',
				array(
					'key'     => '_kgflashmediaplayer-externalurl',
					'compare' => 'NOT EXISTS',
				),
				array(
					'key'     => '_kgflashmediaplayer-format',
					'compare' => 'NOT EXISTS',
				),
			),
		);

		$attachment_ids = new \WP_Query( $args );

		if ( $attachment_ids->have_posts() ) {
			$response = $attachment_ids->posts;
		}

		return $response;
	}

	public function video_gallery( \WP_REST_Request $request ) {

		$response    = array();
		$shortcode   = new \Videopack\Frontend\Shortcode( $this->options_manager );
		$query_atts  = $shortcode->atts( $request->get_params() );
		$gallery     = new \Videopack\Frontend\Gallery( $this->options_manager );
		$attachments = $gallery->get_gallery_videos( $request->get_param( 'page' ), $query_atts );

		if ( $attachments->have_posts() ) {

			$json_posts = array_map(
				function ( $post ) {
					$post_data                         = wp_prepare_attachment_for_js( $post );
					$post_data['image']['id']          = get_post_thumbnail_id( $post );
					$post_data['image']['srcset']      = wp_get_attachment_image_srcset( $post_data['image']['id'] );
					$post_data['videopack']['sources'] = $this->video_player->prepare_sources( wp_get_attachment_url( $post->ID ), $post->ID );
					return $post_data;
				},
				$attachments->posts
			);

			$response = array(
				'posts'         => $json_posts,
				'max_num_pages' => $attachments->max_num_pages,
			);
		}

		return $response;
	}

	public function video_sources( \WP_REST_Request $request ) {

		$url = $request->get_param( 'url' );
		if ( ! $url ) {
			return new \WP_Error( 'rest_invalid_param', esc_html__( 'Missing Video Url.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}
		$post_id     = $request->get_param( 'id' );
		$source_info = $this->video_player->prepare_sources( $url, $post_id );

		return $source_info;
	}

	public function checkboxes( \WP_REST_Request $request ) {

		$params     = $request->get_params();
		$checkboxes = kgvid_generate_encode_checkboxes( $params['url'], $params['postId'], 'attachment' );
		$checkboxes = $this->clean_array( $checkboxes['data'] );
		kgvid_encode_progress();
		return $checkboxes;
	}

	public function queue_get( \WP_REST_Request $request ) {

		$params = $request->get_params();
		if ( array_key_exists( 'id', $params ) ) {
			$encoder = new Encode\Encode_Attachment( $this->options_manager, $params['id'] );
			return $encoder->get_formats_array();
		} else {
			$controller = new Encode\Encode_Queue_Controller( $this->options_manager );
			return $controller->get_full_queue_array();
		}
	}

	public function queue_edit( \WP_REST_Request $request ) {

		$params     = $request->get_params();
		$controller = new Encode\Encode_Queue_Controller( $this->options_manager );
		$args       = array(
			'id'      => $params['id'],
			'url'     => $params['url'],
			'formats' => $params['formats'],
		);
		$response   = $controller->add_to_queue( $args );
		return $response;
	}

	public function ffmpeg_test( \WP_REST_Request $request ) {
		$format = $request->get_param( 'format' );
		$rotate = $request->get_param( 'rotate' );
		if ( $rotate === true ) {
			$url = plugin_dir_path( __DIR__ ) . 'images/sample-video-rotated-h264.mp4';
		} else {
			$url = plugin_dir_path( __DIR__ ) . 'images/sample-video-h264.mp4';
		}
		$attachment    = new encode\Encode_Attachment( $this->options_manager, 'sample', $url );
		$encode_info   = $attachment->get_encode_info( $format );
		$encode_format = new encode\Encode_Format( $format );
		$encode_format->set_queued(
			$encode_info['path'],
			$encode_info['url'],
			get_current_user_id()
		);
		$encode_array = $attachment->get_encode_array( $encode_format );
		$process      = new encode\FFmpeg_Process( $encode_array );
		try {
			$process->run();
			$output = $process->getErrorOutput();
		} catch ( \Exception $e ) {
			$output = $e->getMessage();
		}

		if ( is_file( $encode_format->get_path() ) ) {
			wp_delete_file( $encode_format->get_path() );
		}
		if ( is_file( $encode_format->get_logfile() ) ) {
			wp_delete_file( $encode_format->get_logfile() );
		}

		$response = array(
			'command' => implode( ' ', $encode_array ),
			'output'  => $output,
		);
		return $response;
	}

	public function wp_video( \WP_REST_Request $request ) {
		$params   = $request->get_params();
		$response = wp_video_shortcode( $params );
		return $response;
	}

	public function prepare_data_for_rest_response( $post ) {
		$url = wp_get_attachment_url( $post['id'] );
		return array(
			'srcset'  => wp_get_attachment_image_srcset( $post['id'] ),
			'sources' => $this->video_player->prepare_sources( $url, $post['id'] ),
		);
	}

	public function add_data_to_rest_response() {
		register_rest_field(
			'attachment',
			'videopack',
			array(
				'get_callback'    => function ( $post ) {
					return $this->prepare_data_for_rest_response( $post );
				},
				'update_callback' => null,
				'schema'          => null,
			)
		);
	}

	public function log_detailed_rest_errors( $response, $handler, $request ) {
		if ( is_wp_error( $response ) && $response->has_errors() ) {
			$error_data = $response->get_error_data();
			if ( isset( $error_data['status'] ) && $error_data['status'] === 400 && $response->get_error_code() === 'rest_additional_properties_forbidden' ) {
				error_log( 'REST Request Error:' );
				error_log( 'Path: ' . $request->get_route() );
				error_log( 'Method: ' . $request->get_method() );
				error_log( 'Parameters: ' . json_encode( $request->get_params() ) );
				error_log( 'Error Message: ' . $response->get_error_message() );
			}
		}
		return $response;
	}
	//add_action( 'rest_request_after_callbacks', 'log_detailed_rest_errors', 10, 3 );

	public function log_all_errors_to_debug_log( $code, $message, $data, $wp_error ) {
		error_log( $code . ': ' . $message );
	}
}
