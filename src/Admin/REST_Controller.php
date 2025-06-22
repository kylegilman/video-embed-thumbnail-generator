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

	public function __construct( Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->namespace       = 'videopack/v1';
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
			array( // This route handles specific attachment IDs.
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
				'args'                => array(
					'url' => array( // This route handles video URLs.
						'type'   => 'string',
						'format' => 'uri',
					),
				),
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
						'url'                      => array(
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
			'/queue/(?P<job_id>\d+)',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'queue_delete' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
				'args'                => array(
					'job_id' => array(
						'type' => 'integer',
						'required' => true,
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
						return current_user_can( 'encode_videos' );
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

	/**
	 * REST callback to get video formats and their encoding status for a specific attachment or URL.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return array|\WP_Error Array of format data on success, or WP_Error object on failure.
	 */
	public function formats( \WP_REST_Request $request ) {
		$params              = $request->get_params();
		$encoder             = null;
		$video_formats_data  = array();
		$all_defined_formats = $this->options_manager->get_video_formats(); // These are Video_Format objects.

		if ( ! empty( $params['id'] ) && get_post_type( $params['id'] ) === 'attachment' ) {
			$encoder = new encode\Encode_Attachment( $this->options_manager, (int) $params['id'] );
		} elseif ( ! empty( $params['url'] ) ) {
			$input_url     = esc_url_raw( $params['url'] );
			$sanitized_url = new Sanitize_Url( $input_url );
			// For external URLs, the 'id' parameter in Encode_Attachment constructor is used for internal tracking (like singleurl_id).
			$encoder = new encode\Encode_Attachment( $this->options_manager, $sanitized_url->singleurl_id, $input_url );
		}

		if ( $encoder ) {
			// Specific video requested: get its encoding jobs (Encode_Format objects from the DB).
			$encoded_jobs = $encoder->get_formats(); // Returns array of Encode_Format objects.

			foreach ( $all_defined_formats as $format_id => $video_format_obj ) {
				$format_array           = $video_format_obj->to_array();
				$format_array['status'] = 'not_encoded'; // Default status if no job found.

				// Find if there's an existing job for this format.
				$matching_encode_format = null;
				foreach ( $encoded_jobs as $job_obj ) {
					if ( $job_obj->get_format_id() === $format_id ) {
						$matching_encode_format = $job_obj;
						break;
					}
				}

				if ( $matching_encode_format ) {
					// Merge with data from the Encode_Format object (the job).
					$job_data_array = $matching_encode_format->to_array();
					$format_array   = array_merge( $format_array, $job_data_array );
				}
				$video_formats_data[] = $format_array;
			}
		} else {
			// No specific video: return all defined formats with their default properties.
			foreach ( $all_defined_formats as $format_id => $video_format_obj ) {
				$format_array           = $video_format_obj->to_array();
				$format_array['status'] = 'defined'; // Indicate it's just a definition.
				$video_formats_data[]   = $format_array;
			}
		}

		return $this->clean_array( $video_formats_data );
	}

	public function thumb_generate( \WP_REST_Request $request ) {

		$params            = $request->get_params();
		$response          = array();
		$ffmpeg_thumbnails = new Thumbnails\FFmpeg_Thumbnails( $this->options_manager );

		$response = $ffmpeg_thumbnails->make(
			$params['attachmentID'],
			$params['url'],
			$params['numberofthumbs'],
			$params['thumbnumber'],
			$params['thumbnumberplusincreaser'],
			$params['thumbtimecode'],
			$params['dofirstframe'],
			$params['generate_button']
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
			intval( $params['index'] ) + 1
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

		$params = $request->get_params();
		// Filter formats to only include those explicitly marked for encoding.
		$formats_to_enqueue = array_keys(
			array_filter(
				$params['formats'],
				function ( $value ) {
					return (bool) $value;
				}
			)
		);

		$controller = new Encode\Encode_Queue_Controller( $this->options_manager );
		$video_url  = $params['url'] ?? null;
		if ( empty( $video_url ) ) {
			return new \WP_Error( 'rest_invalid_param', esc_html__( 'Missing video URL.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}
		$args     = array(
			'id'      => $params['id'],
			'url'     => $video_url,
			'formats' => $formats_to_enqueue,
		);
		$response = $controller->enqueue_encodes( $args );
		return $response;
	}

	/**
	 * REST callback to delete an encoding queue job.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function queue_delete( \WP_REST_Request $request ) {
		$job_id = (int) $request->get_param( 'job_id' );
		if ( empty( $job_id ) ) {
			return new \WP_Error( 'rest_invalid_param', esc_html__( 'Missing job ID.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		$controller = new Encode\Encode_Queue_Controller( $this->options_manager );
		$result     = $controller->delete_job( $job_id );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Clean array to remove paths before sending to UI.
		$response_data = $this->clean_array( $result );
		return new \WP_REST_Response( $response_data, 200 );
	}

	public function ffmpeg_test( \WP_REST_Request $request ) {
		$format = $request->get_param( 'format' ); // Already validated by REST route args.
		$rotate = $request->get_param( 'rotate' ); // Already validated by REST route args.

		$tester = new encode\FFmpeg_Tester( $this->options_manager ); // FFmpeg_Tester now handles the check_ffmpeg_exists logic.
		$result = $tester->run_test_encode( $format, (bool) $rotate );

		// If the FFmpeg_Tester returns an invalid format message, convert it to a WP_Error.
		if ( isset( $result['output'] ) && strpos( $result['output'], __( 'Invalid video format specified.', 'video-embed-thumbnail-generator' ) ) !== false ) {
			return new \WP_Error( 'rest_invalid_format', $result['output'], array( 'status' => 400 ) );
		}

		return $result;
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
