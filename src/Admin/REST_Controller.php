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

/**
 * Class REST_Controller
 *
 * Manages all REST API endpoints for the Videopack plugin.
 *
 * @package Videopack\Admin
 */
class REST_Controller extends \WP_REST_Controller {

	/**
	 * Videopack Options manager class instance.
	 *
	 * @var Options $options_manager
	 */
	protected $options_manager;
	/**
	 * The plugin options array.
	 *
	 * @var array $options
	 */
	protected $options;
	/**
	 * The namespace for the REST API.
	 *
	 * @var string $namespace
	 */
	protected $namespace;

	/**
	 * REST_Controller constructor.
	 *
	 * @param Options $options_manager The options manager instance.
	 */
	public function __construct( Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->namespace       = 'videopack/v1';
	}

	/**
	 * Initializes REST routes.
	 */
	public function add_rest_routes() {
		$this->register_routes();
		$this->add_data_to_rest_response();
	}

	/**
	 * Registers all the REST API routes for the plugin.
	 */
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
					'page'             => array(
						'type' => 'number',
					),
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
					'gallery_exclude'  => array(
						'type' => 'string',
					),
					'gallery_title'    => array(
						'type' => 'string',
					),
					'gallery_thumb'    => array(
						'type' => 'number',
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
						'attachment_id'   => array(
							'type'     => array(
								'number',
								'string',
							),
							'required' => true,
						),
						'thumburl'        => array(
							'type'     => 'string',
							'required' => true,
						),
						'thumbnail_index' => array(
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
						), // The video URL, for context.
						'total_thumbnails'         => array(
							'type'     => 'number',
							'minimum'  => 1,
							'maximum'  => 100,
							'default'  => 4,
							'required' => true,
						), // Total number of thumbs being generated in this batch.
						'thumbnail_index'          => array(
							'type'     => 'number',
							'required' => true,
						), // The 1-based index of the thumbnail to generate.
						'attachment_id'            => array(
							'type'     => 'number',
							'required' => true,
						), // The ID of the source video attachment.
						'generate_button'          => array(
							'type'     => 'string',
							'required' => true,
						),
					),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/thumbs/save_all',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'thumb_save_all' ),
				'permission_callback' => function () {
					return current_user_can( 'make_video_thumbnails' );
				},
				'args'                => array(
					'attachment_id' => array(
						'type'     => 'number',
						'required' => true,
					),
					'thumb_urls'   => array(
						'type'     => 'array',
						'required' => true,
						'items'    => array(
							'type'   => 'string',
							'format' => 'uri',
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
			'/queue/retry/(?P<job_id>\d+)',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'queue_retry' ),
				'permission_callback' => function () {
					return current_user_can( 'encode_videos' );
				},
				'args'                => array(
					'job_id' => array(
						'type'     => 'integer',
						'required' => true,
						'validate_callback' => function ( $param ) {
							return is_numeric( $param ) && $param > 0;
						},
					),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/queue/control',
			array(
				'methods'             => \WP_REST_Server::EDITABLE, // Use EDITABLE for state changes
				'callback'            => array( $this, 'queue_control' ),
				'permission_callback' => function () {
					return current_user_can( 'encode_videos' );
				},
				'args'                => array(
					'action' => array(
						'type'     => 'string',
						'enum'     => array( 'play', 'pause' ),
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/queue/clear',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'queue_clear' ),
				'permission_callback' => function () {
					return current_user_can( 'encode_videos' );
				},
				'args'                => array(
					'type' => array(
						'type'     => 'string',
						'enum'     => array( 'completed', 'all' ),
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
		register_rest_route(
			$this->namespace,
			'/count-play',
			array(
				'methods'             => \WP_REST_Server::CREATABLE, // Use CREATABLE for actions that modify data
				'callback'            => array( $this, 'count_play' ),
				'permission_callback' => '__return_true', // Public endpoint for view counting
				'args'                => array(
					'post_id'     => array(
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
					'video_event' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'show_views'  => array(
						'type'              => 'boolean',
						'default'           => false,
						'sanitize_callback' => 'rest_sanitize_boolean',
					),
				),
			)
		);
	}

	/**
	 * Recursively cleans an array for REST response.
	 *
	 * Removes keys containing 'path', converts 'checked' or true to boolean true,
	 * and sets NaN or infinite float values to null.
	 *
	 * @param array $dirty_array The array to clean.
	 * @return array The cleaned array.
	 */
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

	/**
	 * REST callback to get a safe subset of plugin settings.
	 *
	 * @return array The safe plugin settings.
	 */
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

	/**
	 * REST callback to get the default plugin settings.
	 *
	 * @return array The default plugin settings.
	 */
	public function defaults() {
		$defaults = $this->options_manager->get_default();
		return $defaults;
	}

	/**
	 * REST callback to get all editable roles.
	 *
	 * @return array An array of WordPress roles.
	 */
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

	/**
	 * REST callback to generate a temporary thumbnail from a video.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The REST response with the thumbnail URL or an error.
	 */
	public function thumb_generate( \WP_REST_Request $request ) {

		$ffmpeg_thumbnails = new Thumbnails\FFmpeg_Thumbnails( $this->options_manager );
		$result            = $ffmpeg_thumbnails->generate_single_thumbnail_data(
			$request->get_param( 'attachment_id' ),
			$request->get_param( 'total_thumbnails' ),
			$request->get_param( 'thumbnail_index' ),
			( $request->get_param( 'generate_button' ) === 'random' ) // Whether to use a random offset for the timecode.
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// The result is an array with 'path' and 'url'. The client only needs the URL.
		return new \WP_REST_Response( array( 'real_thumb_url' => $result['url'] ), 200 );
	}

	/**
	 * REST callback to save all generated thumbnails for a video.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response with the results of the save operations.
	 */
	public function thumb_save_all( \WP_REST_Request $request ) {
		$attachment_id = $request->get_param( 'attachment_id' );
		$thumb_urls    = $request->get_param( 'thumb_urls' );

		$thumbnails = new Thumbnails\FFmpeg_Thumbnails( $this->options_manager ); // Use FFmpeg_Thumbnails for saving
		$post_name  = get_the_title( $attachment_id );
		$results    = array();

		foreach ( $thumb_urls as $index => $url ) {
			$results[] = $thumbnails->save( $attachment_id, $post_name, $url, $index + 1 );
		}

		return new \WP_REST_Response( $results, 200 );
	}

	/**
	 * REST callback to save a single thumbnail for a video.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array The response from the save operation.
	 */
	public function thumb_save( \WP_REST_Request $request ) {

		$params     = $request->get_params();
		$attachment_id = $params['attachment_id'];
		$thumbnails = new Thumbnails\FFmpeg_Thumbnails( $this->options_manager ); // Use FFmpeg_Thumbnails for saving

		if ( is_numeric( $attachment_id ) ) {
			$post_name = get_the_title( $attachment_id );
		} else {
			$post_name = str_replace( 'singleurl_', '', $attachment_id );
		}
		$response = $thumbnails->save(
			$attachment_id,
			$post_name,
			$params['thumburl'],
			intval( $params['thumbnail_index'] ) + 1
		);

		return $response;
	}

	/**
	 * REST callback to get recent video attachments.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array An array of attachment IDs.
	 */
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

	/**
	 * REST callback to get video gallery data.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response containing video data and pagination info.
	 */
	public function video_gallery( \WP_REST_Request $request ) {
		$shortcode    = new \Videopack\Frontend\Shortcode( $this->options_manager );
		$gallery      = new \Videopack\Frontend\Gallery( $this->options_manager );
		$gallery_atts = $shortcode->atts( $request->get_params() );
		$page         = $request->get_param( 'page' ) ?: 1;

		$attachments = $gallery->get_gallery_videos( $page, $gallery_atts );
		$videos_data = array();

		if ( $attachments->have_posts() ) {
			foreach ( $attachments->posts as $attachment ) {
				$video_data = $gallery->prepare_video_data_for_js( $attachment, $gallery_atts );
				if ( $video_data ) {
					$videos_data[] = $video_data;
				}
			}
		}

		$response = array(
			'videos'        => $videos_data,
			'max_num_pages' => (int) $attachments->max_num_pages,
			'current_page'  => (int) $page,
		);

		return new \WP_REST_Response( $response, 200 );
	}

	/**
	 * REST callback to get video sources for a player.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error An array of source information or an error.
	 */
	public function video_sources( \WP_REST_Request $request ) {

		$url          = $request->get_param( 'url' );
		$post_id      = $request->get_param( 'id' );
		$source_input = $post_id ?: $url;

		if ( ! $source_input ) {
			return new \WP_Error( 'rest_invalid_param', esc_html__( 'Missing Video URL or ID.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		// Create the Source object.
		$source = \Videopack\Video_Source\Source_Factory::create( $source_input, $this->options_manager );
		if ( ! $source || ! $source->exists() ) {
			return new \WP_Error( 'rest_source_not_found', esc_html__( 'Video source could not be found.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}

		// Create the Player object using the factory.
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $this->options['embed_method'], $this->options_manager );

		// Set the source on the player and get the sources array.
		$player->set_source( $source );
		$source_info = $player->get_sources();

		return $source_info;
	}

	/**
	 * REST callback to get encoding queue information.
	 *
	 * If an ID is provided, it returns the formats for that specific job.
	 * Otherwise, it returns the entire encoding queue.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array The encoding queue data.
	 */
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

	/**
	 * REST callback to add or update an item in the encoding queue.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error The response from the enqueue operation or an error.
	 */
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

	/**
	 * REST callback to retry a failed encoding job.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function queue_retry( \WP_REST_Request $request ) {
		$job_id = (int) $request->get_param( 'job_id' );
		if ( empty( $job_id ) ) {
			return new \WP_Error( 'rest_invalid_param', esc_html__( 'Missing job ID.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		$controller = new Encode\Encode_Queue_Controller( $this->options_manager );
		$result     = $controller->retry_job( $job_id );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new \WP_REST_Response( array( 'status' => 'success' ), 200 );
	}

	/**
	 * REST callback to run a test FFmpeg encode.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error The result of the test encode or an error.
	 */
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

	/**
	 * REST callback to render a video using the wp_video_shortcode function.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return string The HTML output of the video shortcode.
	 */
	public function wp_video( \WP_REST_Request $request ) {
		$params   = $request->get_params();
		$response = wp_video_shortcode( $params );
		return $response;
	}

	/**
	 * Prepares additional Videopack data for an attachment in a REST response.
	 *
	 * @param array $post The post object as an array.
	 * @return array The prepared Videopack data.
	 */
	public function prepare_data_for_rest_response( $post ) {
		$post_id = $post['id'];

		// Create the Source object.
		$source = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options_manager );
		if ( ! $source || ! $source->exists() ) {
			// If source isn't found, return an empty sources array to avoid breaking the REST response.
			return array(
				'srcset'  => wp_get_attachment_image_srcset( $post_id ),
				'sources' => array(),
			);
		}

		// Create the Player object using the factory, set the source, and get the sources array.
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $this->options['embed_method'], $this->options_manager );
		$player->set_source( $source );

		return array(
			'srcset'  => wp_get_attachment_image_srcset( $post_id ),
			'sources' => $player->get_sources(),
		);
	}

	/**
	 * REST callback to count video plays.
	 *
	 * This method increments the view count for a video based on its settings
	 * and the received event. It relies on client-side logic to determine
	 * when a 'play' event should increment the view count (e.g., first play per session).
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function count_play( \WP_REST_Request $request ) {
		$post_id = $request->get_param( 'post_id' );

		// Validate post_id: ensure it's a valid attachment ID.
		if ( ! $post_id || ! is_numeric( $post_id ) || 'attachment' !== get_post_type( $post_id ) ) {
			return new \WP_Error( 'rest_invalid_post_id', esc_html__( 'Invalid post ID.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		$video_event = $request->get_param( 'video_event' );
		$show_views  = $request->get_param( 'show_views' );

		$attachment_meta_manager = new Attachment_Meta( $this->options_manager, $post_id );
		$updated_meta            = $attachment_meta_manager->increment_video_stat( $video_event );

		$response_data = array(
			'status' => 'success',
		);

		// If the client requested the view count, return the 'starts' value.
		// The JS will only update the display on the 'play' event.
		if ( $show_views && isset( $updated_meta['starts'] ) ) {
			$response_data['view_count'] = number_format_i18n( $updated_meta['starts'] );
		}

		return new \WP_REST_Response( $response_data, 200 );
	}

	/**
	 * REST callback to control the encoding queue (play/pause).
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function queue_control( \WP_REST_Request $request ) {
		$action = $request->get_param( 'action' );
		$controller = new Encode\Encode_Queue_Controller( $this->options_manager );

		if ( 'play' === $action ) {
			$controller->start_queue();
		} else {
			$controller->pause_queue();
		}

		// Re-fetch options to get the definite state after controller action.
		$this->options_manager->load_options();
		$current_options = $this->options_manager->get_options();

		return new \WP_REST_Response(
			array(
				'status'      => 'success',
				// translators: %s is 'play' or 'pause'.
				'message'     => sprintf( esc_html__( 'Queue set to %s.', 'video-embed-thumbnail-generator' ), $action ),
				'queue_state' => $current_options['queue_control'],
			),
			200
		);
	}

	/**
	 * REST callback to clear encoding queue jobs.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function queue_clear( \WP_REST_Request $request ) {
		$type = $request->get_param( 'type' ); // 'completed' or 'all'

		$cleanup = new Cleanup(); // Cleanup class has clear_completed_queue method.
		$cleanup->clear_completed_queue( $type );

		return new \WP_REST_Response(
			array(
				'status' => 'success',
				// translators: %s is 'completed' or 'all'.
				'message' => sprintf( esc_html__( 'Queue cleared: %s jobs.', 'video-embed-thumbnail-generator' ), $type ),
			),
			200
		);
	}

	/**
	 * Adds the 'videopack' field to the 'attachment' post type in the REST API.
	 */
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

	/**
	 * Logs detailed information about REST API errors.
	 *
	 * This is a debugging helper.
	 *
	 * @param \WP_REST_Response|\WP_Error $response The REST response or error object.
	 * @param array                       $handler  The handler for the request.
	 * @param \WP_REST_Request            $request  The REST request object.
	 * @return \WP_REST_Response|\WP_Error The original response or error object.
	 */
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

	/**
	 * Logs all errors to the debug log.
	 *
	 * This is a debugging helper.
	 *
	 * @param string $code     Error code.
	 * @param string $message  Error message.
	 * @param mixed  $data     Error data.
	 * @param object $wp_error WP_Error object.
	 */
	public function log_all_errors_to_debug_log( $code, $message, $data, $wp_error ) {
		error_log( $code . ': ' . $message );
	}
}
