<?php
/**
 * The REST specific functionality of the Videopack plugin.
 *
 * @link       https://www.videopack.video
 *
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */

namespace Videopack\Admin;

/**
 * Class REST_Controller
 *
 * Manages all REST API endpoints for the Videopack plugin.
 *
 * This class handles registration and execution of REST API routes for
 * settings management, thumbnail generation, video encoding jobs,
 * gallery data, and various batch operations. It integrates with
 * Action Scheduler and WordPress core REST API functionality.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class REST_Controller extends \WP_REST_Controller {

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
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $format_registry
	 */
	protected $format_registry;

	/**
	 * REST_Controller constructor.
	 *
	 * @param array                             $options         Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry = null ) {
		$this->options         = $options;
		$this->format_registry = $format_registry;
		$this->namespace       = 'videopack/v1';
	}

	/**
	 * Permission check for making video thumbnails.
	 *
	 * @return bool True if the user has required capabilities.
	 */
	public function make_video_thumbnails_permissions_check() {
		return (bool) current_user_can( 'make_video_thumbnails' );
	}

	/**
	 * Permission check for encoding videos.
	 *
	 * @return bool True if the user has required capabilities.
	 */
	public function encode_videos_permissions_check() {
		return (bool) current_user_can( 'encode_videos' );
	}

	/**
	 * Permission check for updating settings.
	 *
	 * @return bool True if the user has required capabilities.
	 */
	public function update_settings_permissions_check() {
		return (bool) current_user_can( 'manage_options' );
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
			'/video_gallery',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'video_gallery' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'page_number'        => array( 'type' => 'number' ),
					'gallery_orderby'    => array( 'type' => 'string' ),
					'gallery_order'      => array( 'type' => 'string' ),
					'gallery_per_page'   => array( 'type' => 'number' ),
					'gallery_pagination' => array( 'type' => 'boolean' ),
					'gallery_id'         => array( 'type' => array( 'number', 'string' ) ),
					'gallery_include'    => array( 'type' => 'string' ),
					'gallery_exclude'    => array( 'type' => 'string' ),
					'gallery_title'      => array( 'type' => 'string' ),
					'gallery_thumb'      => array( 'type' => 'number' ),
					'gallery_source'     => array( 'type' => 'string' ),
					'gallery_category'   => array( 'type' => 'string' ),
					'gallery_tag'        => array( 'type' => 'string' ),
					'layout'             => array( 'type' => 'string' ),
					'prioritizePostData' => array( 
						'type'              => 'boolean',
						'sanitize_callback' => 'rest_sanitize_boolean',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/settings',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'update_settings_permissions_check' ),
					'args'                => (array) $this->get_endpoint_args_for_item_schema( \WP_REST_Server::EDITABLE ),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/settings/defaults',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'defaults' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			$this->namespace,
			'/settings/cache',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'clear_cache' ),
				'permission_callback' => array( $this, 'update_settings_permissions_check' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/thumbs',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'thumb_save' ),
					'permission_callback' => array( $this, 'update_settings_permissions_check' ),
					'args'                => array(
						'attachment_id'   => array(
							'type'     => array( 'number', 'string' ),
							'required' => true,
						),
						'parent_id'       => array(
							'type'     => 'number',
							'required' => false,
							'default'  => 0,
						),
						'url'             => array(
							'type'     => 'string',
							'required' => false,
						),
						'thumburl'        => array(
							'type'     => 'string',
							'required' => true,
						),
						'thumbnail_index' => array(
							'type'     => 'number',
							'required' => false,
						),
						'featured'        => array(
							'type'     => 'boolean',
							'required' => false,
						),
					),
				),
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'thumb_generate' ),
					'permission_callback' => function () {
						return (bool) ( $this->make_video_thumbnails_permissions_check() && (bool) ( $this->options['ffmpeg_exists'] ?? false ) && 'notinstalled' !== ( $this->options['ffmpeg_exists'] ?? '' ) );
					},
					'args'                => array(
						'url'              => array(
							'type'     => 'string',
							'required' => true,
						),
						'total_thumbnails' => array(
							'type'     => 'number',
							'minimum'  => 1,
							'maximum'  => 100,
							'default'  => 4,
							'required' => false,
						),
						'thumbnail_index'  => array(
							'type'     => 'number',
							'required' => false,
						),
						'attachment_id'    => array(
							'type'     => 'number',
							'required' => true,
						),
						'parent_id'        => array(
							'type'     => 'number',
							'required' => false,
							'default'  => 0,
						),
						'generate_button'  => array(
							'type'     => 'string',
							'required' => true,
						),
						'time'             => array(
							'type'     => 'number',
							'required' => false,
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/thumbs/upload',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'thumb_upload_save' ),
				'permission_callback' => array( $this, 'make_video_thumbnails_permissions_check' ),
				'args'                => array(
					'attachment_id' => array(
						'type'     => 'number',
						'required' => true,
					),
					'parent_id'     => array(
						'type'     => 'number',
						'required' => false,
						'default'  => 0,
					),
					'url'           => array(
						'type'     => 'string',
						'required' => false,
					),
					'post_name'     => array(
						'type'     => 'string',
						'required' => true,
					),
					'featured'      => array(
						'type'     => 'boolean',
						'required' => false,
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
				'permission_callback' => array( $this, 'make_video_thumbnails_permissions_check' ),
				'args'                => array(
					'attachment_id' => array(
						'type'     => 'number',
						'required' => true,
					),
					'parent_id'     => array(
						'type'     => 'number',
						'required' => false,
						'default'  => 0,
					),
					'url'           => array(
						'type'     => 'string',
						'required' => false,
					),
					'thumb_urls'    => array(
						'type'     => 'array',
						'required' => true,
						'items'    => array(
							'type'   => 'string',
							'format' => 'uri',
						),
					),
					'featured'      => array(
						'type'     => 'boolean',
						'required' => false,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/thumbs/candidates',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_thumbnail_candidates' ),
				'permission_callback' => array( $this, 'make_video_thumbnails_permissions_check' ),
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
					'url'           => array( 'type' => 'string' ),
					'attachment_id' => array( 'type' => array( 'number', 'string' ) ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/ffmpeg-test',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'ffmpeg_test' ),
				'permission_callback' => function () {
					return (bool) current_user_can( 'manage_options' );
				},
				'args'                => array(
					'codec'      => array( 'type' => 'string' ),
					'resolution' => array( 'type' => 'string' ),
					'rotate'     => array( 'type' => array( 'boolean', 'string' ) ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/freemius/(?P<page>[\w-]+)',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_freemius_page_html' ),
				'permission_callback' => function () {
					return (bool) current_user_can( 'manage_options' );
				},
				'args'                => array(
					'page' => array(
						'type'     => 'string',
						'required' => true,
						'enum'     => array( 'account', 'add-ons' ),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/render-shortcode',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'render_shortcode' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'attrs'   => array(
						'type'     => 'object',
						'required' => false,
					),
					'content' => array(
						'type'     => 'string',
						'required' => false,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/count-play',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'count_play' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'attachment_id' => array(
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
					'video_event'   => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'views'    => array(
						'type'              => 'boolean',
						'default'           => false,
						'sanitize_callback' => 'rest_sanitize_boolean',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/batch/process',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'batch_process' ),
				'permission_callback' => array( $this, 'batch_permissions' ),
				'args'                => array(
					'type' => array(
						'required' => true,
						'type'     => 'string',
						'enum'     => array( 'featured', 'parents', 'thumbs', 'encoding' ),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/batch/progress',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'batch_progress' ),
				'permission_callback' => array( $this, 'batch_permissions' ),
				'args'                => array(
					'type' => array(
						'required' => true,
						'type'     => 'string',
						'enum'     => array( 'featured', 'parents', 'thumbs', 'encoding', 'all', 'browser' ),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/resolve-url',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'resolve_url_to_attachment' ),
				'permission_callback' => function () {
					return (bool) current_user_can( 'upload_files' );
				},
				'args'                => array(
					'url'       => array(
						'type'     => 'string',
						'required' => true,
						'format'   => 'uri',
					),
					'parent_id' => array(
						'type'     => 'number',
						'required' => false,
						'default'  => 0,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/presets',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'presets_get' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'attachment_id' => array( 'type' => array( 'number', 'string' ) ),
					'url'           => array(
						'type'   => 'string',
						'format' => 'uri',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/jobs',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'jobs_create' ),
					'permission_callback' => array( $this, 'encode_videos_permissions_check' ),
					'args'                => array(
						'input'     => array(
							'type'     => array( 'string', 'number' ),
							'required' => true,
						),
						'outputs'   => array(
							'type'     => 'array',
							'required' => true,
							'items'    => array( 'type' => 'string' ),
						),
						'parent_id' => array(
							'type'     => 'number',
							'required' => false,
							'default'  => 0,
						),
					),
				),
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'jobs_list' ),
					'permission_callback' => function () {
						return (bool) is_user_logged_in();
					},
					'args'                => array(
						'input' => array(
							'type'     => array( 'string', 'number' ),
							'required' => false,
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/jobs/control',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'jobs_control' ),
				'permission_callback' => array( $this, 'encode_videos_permissions_check' ),
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
			'/jobs/clear',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'jobs_clear' ),
				'permission_callback' => array( $this, 'encode_videos_permissions_check' ),
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
			'/jobs/(?P<id>\d+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'job_get' ),
					'permission_callback' => function () {
						return (bool) is_user_logged_in();
					},
				),
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'job_delete' ),
					'permission_callback' => array( $this, 'encode_videos_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'job_retry' ),
					'permission_callback' => array( $this, 'encode_videos_permissions_check' ),
				),
			)
		);
	}

	/**
	 * REST callback to update plugin settings.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The updated settings.
	 */
	public function update_settings( \WP_REST_Request $request ) {
		$params  = (array) $request->get_params();
		$options = (array) array_merge( $this->options, $params );
		update_option( 'videopack_options', $options );
		$this->options = $options;

		return apply_filters( 'videopack_rest_update_settings', new \WP_REST_Response( $this->options, 200 ), $request );
	}

	/**
	 * REST callback to get the default plugin settings.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response object.
	 */
	public function defaults( \WP_REST_Request $request ) {
		$option_manager = new \Videopack\Admin\Options();
		$defaults       = (array) $option_manager->get_default();

		return apply_filters( 'videopack_rest_defaults', new \WP_REST_Response( $defaults, 200 ), $request );
	}

	/**
	 * REST callback to clear all plugin transients.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response object.
	 */
	public function clear_cache( \WP_REST_Request $request ) {
		$cleanup = new \Videopack\Admin\Cleanup();
		$cleanup->delete_transients();

		return apply_filters( 'videopack_rest_clear_cache', new \WP_REST_Response( array( 'success' => true ), 200 ), $request );
	}

	/**
	 * REST callback to get the HTML for a Freemius settings page.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The REST response with the page HTML or an error.
	 */
	public function get_freemius_page_html( \WP_REST_Request $request ) {
		if ( ! function_exists( 'videopack_fs' ) ) {
			return new \WP_Error( 'freemius_not_found', (string) __( 'Freemius SDK not available.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		$page_slug = (string) $request->get_param( 'page' );
		$freemius  = videopack_fs();

		ob_start();

		switch ( $page_slug ) {
			case 'account':
				if ( ! is_object( $freemius->get_user() ) ) {
					ob_end_clean();
					return new \WP_Error( 'freemius_no_user', (string) __( 'Freemius user data not available. This can happen if the plugin is network-activated but not yet opted-in at the network level.', 'video-embed-thumbnail-generator' ), array( 'status' => 403 ) );
				}
				$freemius->_account_page_render();
				break;
			case 'add-ons':
				$freemius->_addons_page_render();
				break;
			default:
				ob_end_clean();
				return new \WP_Error( 'invalid_freemius_page', (string) __( 'Invalid Freemius page requested.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}

		return apply_filters( 'videopack_rest_get_freemius_page_html', new \WP_REST_Response( array( 'html' => ob_get_clean() ), 200 ), $request );
	}

	/**
	 * REST callback to generate a temporary thumbnail from a video.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The REST response with the thumbnail URL or an error.
	 */
	public function thumb_generate( \WP_REST_Request $request ) {
		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$ffmpeg_thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );
		$time              = $request->get_param( 'time' );

		if ( ! is_null( $time ) ) {
			$result = $ffmpeg_thumbnails->generate_thumbnail_at_timecode( (int) $attachment_id, (float) $time );
		} else {
			$result = $ffmpeg_thumbnails->generate_single_thumbnail_data(
				(int) $attachment_id,
				(int) $request->get_param( 'total_thumbnails' ),
				(int) $request->get_param( 'thumbnail_index' ),
				( $request->get_param( 'generate_button' ) === 'random' )
			);
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return apply_filters(
			'videopack_rest_thumb_generate',
			new \WP_REST_Response(
				array(
					'real_thumb_url' => (string) ( $result['url'] ?? '' ),
					'attachment_id'  => (int) $attachment_id,
				),
				200
			),
			$request
		);
	}

	/**
	 * REST callback to save all generated thumbnails for a video.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The REST response with the results.
	 */
	public function thumb_save_all( \WP_REST_Request $request ) {
		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$thumb_urls     = (array) $request->get_param( 'thumb_urls' );
		$thumbnails     = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );
		$post_name      = '';
		$attachment_url = (string) wp_get_attachment_url( (int) $attachment_id );
		if ( $attachment_url ) {
			$post_name = (string) pathinfo( (string) basename( $attachment_url ), PATHINFO_FILENAME );
		}
		if ( empty( $post_name ) ) {
			$post_name = (string) html_entity_decode( (string) get_the_title( (int) $attachment_id ), ENT_QUOTES, 'UTF-8' );
		}
		$results = array();

		$parent_id = (int) $request->get_param( 'parent_id' );
		$featured  = $request->get_param( 'featured' );
		foreach ( $thumb_urls as $index => $url ) {
			$res                  = (array) $thumbnails->save( (int) $attachment_id, $post_name, (string) $url, (int) $index + 1, $parent_id, $featured );
			$res['attachment_id'] = (int) $attachment_id;
			$results[]            = $res;
		}

		return apply_filters( 'videopack_rest_thumb_save_all', new \WP_REST_Response( $results, 200 ), $request );
	}

	/**
	 * REST callback to save a thumbnail from a direct file upload.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The response.
	 */
	public function thumb_upload_save( $request ) {
		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$post_name = (string) $request->get_param( 'post_name' );
		if ( ! empty( $post_name ) ) {
			$post_name = (string) pathinfo( $post_name, PATHINFO_FILENAME );
		}
		$files = (array) $request->get_file_params();

		if ( empty( $files['file'] ) ) {
			return new \WP_Error( 'missing_file', (string) __( 'No file was uploaded.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		$thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );
		$response   = (array) $thumbnails->save_from_blob( (int) $attachment_id, $post_name, (array) $files['file'], (int) $request->get_param( 'parent_id' ), $request->get_param( 'featured' ) );

		$response['attachment_id'] = (int) $attachment_id;

		if ( empty( $response['thumb_id'] ) ) {
			return new \WP_Error( 'upload_failed', (string) ( $response['error'] ?? __( 'Could not save uploaded thumbnail.', 'video-embed-thumbnail-generator' ) ), array( 'status' => 500 ) );
		}

		return apply_filters( 'videopack_rest_thumb_upload_save', new \WP_REST_Response( $response, 200 ), $request );
	}

	/**
	 * REST callback to save a single thumbnail for a video.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The REST response with the result or an error.
	 */
	public function thumb_save( \WP_REST_Request $request ) {
		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$params     = (array) $request->get_params();
		$thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );

		if ( is_numeric( $attachment_id ) ) {
			$post_name      = '';
			$attachment_url = (string) wp_get_attachment_url( (int) $attachment_id );
			if ( $attachment_url ) {
				$post_name = (string) pathinfo( (string) basename( $attachment_url ), PATHINFO_FILENAME );
			}
			if ( empty( $post_name ) ) {
				$post_name = (string) html_entity_decode( (string) get_the_title( (int) $attachment_id ), ENT_QUOTES, 'UTF-8' );
			}
		} else {
			$post_name = (string) str_replace( 'singleurl_', '', (string) $attachment_id );
		}

		$thumbnail_index = isset( $params['thumbnail_index'] ) ? (int) $params['thumbnail_index'] : false;

		$response = (array) $thumbnails->save(
			$attachment_id,
			$post_name,
			(string) ( $params['thumburl'] ?? '' ),
			$thumbnail_index,
			(int) ( $params['parent_id'] ?? 0 ),
			$params['featured'] ?? null
		);

		return apply_filters( 'videopack_rest_thumb_save', new \WP_REST_Response( $response, 200 ), $request );
	}

	/**
	 * REST callback to get video gallery data.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response object.
	 */
	public function video_gallery( \WP_REST_Request $request ) {
		$shortcode    = new \Videopack\Frontend\Shortcode( $this->options, $this->format_registry );
		$gallery      = new \Videopack\Frontend\Gallery( $this->options, $this->format_registry );
		$gallery_atts = (array) $shortcode->atts( (array) $request->get_params() );
		$page         = (int) ( $request->get_param( 'page_number' ) ? $request->get_param( 'page_number' ) : 1 );
		$layout = (string) $request->get_param( 'layout' );
		if ( ! $layout ) {
			$layout = ( isset( $gallery_atts['gallery'] ) && true === $gallery_atts['gallery'] ) ? 'gallery' : 'list';
		}

		if ( in_array( (string) $gallery_atts['gallery_source'], array( 'category', 'tag' ), true ) && ! $request->get_param( 'gallery_id' ) ) {
			$gallery_atts['gallery_id'] = '';
		}

		$attachments   = $gallery->get_gallery_videos( $page, $gallery_atts );
		$videos_data   = array();
		$max_num_pages = (int) ( $attachments->max_num_pages ?? 1 );

		if ( $attachments instanceof \WP_Query && $attachments->have_posts() ) {
			foreach ( $attachments->posts as $attachment ) {
				$video_data = (array) $gallery->prepare_video_data_for_js( $attachment, $gallery_atts );
				if ( ! empty( $video_data ) ) {
					$videos_data[] = $video_data;
				}
			}
		}

		$result = (array) $gallery->collection_page( $page, $gallery_atts, $layout );

		$response = array(
			'videos'        => (array) $result['videos'],
			'max_num_pages' => (int) $result['max_num_pages'],
			'current_page'  => (int) $result['current_page'],
			'html'          => (string) $result['html'],
		);

		return apply_filters( 'videopack_rest_video_gallery', new \WP_REST_Response( $response, 200 ), $request );
	}

	/**
	 * REST callback to get video sources for a player.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The REST response object.
	 */
	public function video_sources( \WP_REST_Request $request ) {
		$url           = (string) $request->get_param( 'url' );
		$attachment_id = $request->get_param( 'attachment_id' );
		$source_input  = is_numeric( $attachment_id ) ? (int) $attachment_id : $url;

		if ( ! $source_input ) {
			return new \WP_Error( 'rest_invalid_param', (string) __( 'Missing Video URL or ID.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		$source = \Videopack\Video_Source\Source_Factory::create( $source_input, $this->options, $this->format_registry );
		$videopack_data = array(
			'srcset'        => (string) wp_get_attachment_image_srcset( (int) $attachment_id ),
			'sources'       => array(),
			'source_groups' => new \stdClass(),
			'poster'        => '',
		);

		if ( ! $source ) {
			return $videopack_data;
		}

		if ( ! $source->exists() ) {
			return new \WP_Error( 'rest_source_not_found', (string) __( 'Video source could not be found.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}

		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, $this->format_registry );
		$player->set_source( $source );
		$source_info = (array) $player->get_sources();

		return apply_filters( 'videopack_rest_video_sources', new \WP_REST_Response( $source_info, 200 ), $request );
	}

	/**
	 * REST callback to run a test FFmpeg encode.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The REST response object.
	 */
	public function ffmpeg_test( \WP_REST_Request $request ) {
		$codec      = (string) $request->get_param( 'codec' );
		$resolution = (string) $request->get_param( 'resolution' );
		$format     = $codec . '_' . $resolution;
		$rotate     = (bool) $request->get_param( 'rotate' );

		$tester = new \Videopack\Admin\Encode\FFmpeg_Tester( $this->options, $this->format_registry );
		$result = (array) $tester->run_test_encode( $format, $rotate );

		if ( isset( $result['output'] ) && strpos( (string) $result['output'], (string) __( 'Invalid video format specified.', 'video-embed-thumbnail-generator' ) ) !== false ) {
			return new \WP_Error( 'rest_invalid_format', (string) $result['output'], array( 'status' => 400 ) );
		}

		return apply_filters( 'videopack_rest_ffmpeg_test', new \WP_REST_Response( $result, 200 ), $request );
	}

	/**
	 * REST callback to render a Videopack shortcode.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response object.
	 */
	public function render_shortcode( \WP_REST_Request $request ) {
		$atts    = $request->get_param( 'attrs' );
		$content = (string) $request->get_param( 'content' );

		if ( is_object( $atts ) ) {
			$atts = (array) $atts;
		}

		$shortcode = new \Videopack\Frontend\Shortcode( $this->options );
		$response  = (string) $shortcode->do( (array) $atts, $content );

		return apply_filters( 'videopack_rest_render_shortcode', new \WP_REST_Response( array( 'html' => $response ), 200 ), $request );
	}

	/**
	 * Prepares additional Videopack data for an attachment in a REST response.
	 *
	 * @param array $post The post object data.
	 * @return array The prepared Videopack data.
	 */
	public function prepare_data_for_rest_response( $post ) {
		$post_id = (int) $post['id'];

		$source = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry );
		if ( ! $source ) {
			return array(
				'srcset'        => (string) wp_get_attachment_image_srcset( $post_id ),
				'sources'       => array(),
				'source_groups' => new \stdClass(),
				'poster'        => '',
			);
		}

		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, $this->format_registry );
		$player->set_source( $source );

		return array(
			'srcset'        => (string) wp_get_attachment_image_srcset( $post_id ),
			'sources'       => (array) $player->get_flat_sources(),
			'source_groups' => (array) $player->get_sources(),
			'poster'        => $source->get_poster(),
		);
	}

	/**
	 * REST callback to count video plays.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The REST response object.
	 */
	public function count_play( \WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'attachment_id' );
		if ( ! $attachment_id || 'attachment' !== get_post_type( $attachment_id ) ) {
			return new \WP_Error( 'rest_invalid_attachment_id', (string) __( 'Invalid attachment ID.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		$video_event = (string) $request->get_param( 'video_event' );
		$show_views  = (bool) $request->get_param( 'views' );

		$attachment_meta_manager = new \Videopack\Admin\Attachment_Meta( $this->options, $attachment_id );
		$updated_meta            = (array) $attachment_meta_manager->increment_video_stat( $video_event );

		$response_data = array( 'status' => 'success' );
		if ( $show_views && isset( $updated_meta['starts'] ) ) {
			$response_data['views'] = (string) \Videopack\Common\I18n::format_view_count( (int) $updated_meta['starts'] );
		}

		return apply_filters( 'videopack_rest_count_play', new \WP_REST_Response( $response_data, 200 ), $request );
	}

	/**
	 * Permission callback for batch operations.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return bool True if allowed.
	 */
	public function batch_permissions( $request ) {
		$type = (string) $request->get_param( 'type' );
		switch ( $type ) {
			case 'featured':
			case 'parents':
				return (bool) current_user_can( 'manage_options' );
			case 'thumbs':
				return (bool) $this->make_video_thumbnails_permissions_check();
			case 'encoding':
				return (bool) $this->encode_videos_permissions_check();
			case 'all':
				return (bool) ( current_user_can( 'manage_options' ) && $this->make_video_thumbnails_permissions_check() && $this->encode_videos_permissions_check() );
		}
		return false;
	}

	/**
	 * REST callback to start a batch process.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The response.
	 */
	public function batch_process( $request ) {
		if ( ! function_exists( 'as_enqueue_async_action' ) ) {
			return new \WP_Error( 'as_missing', (string) __( 'Action Scheduler is not available.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		$type   = (string) $request->get_param( 'type' );
		$groups = array(
			'featured' => 'videopack-featured-images',
			'parents'  => 'videopack-parent-switching',
			'thumbs'   => 'videopack-generate-thumbnails',
			'encoding' => 'videopack-batch-enqueue',
		);

		if ( isset( $groups[ $type ] ) && function_exists( 'as_unschedule_all_actions' ) ) {
			as_unschedule_all_actions( '', array(), $groups[ $type ] );
		}

		$attachment = new \Videopack\Admin\Attachment( $this->options, $this->format_registry, new \Videopack\Admin\Attachment_Meta( $this->options ) );
		$result     = array();

		switch ( $type ) {
			case 'featured':
				$result = (array) $attachment->process_batch_featured();
				break;
			case 'parents':
				$result = (array) $attachment->process_batch_parents( (int) $request->get_param( 'target_parent' ) );
				break;
			case 'thumbs':
				$result = (array) $attachment->process_batch_thumbs();
				break;
			case 'encoding':
				$result = (array) $attachment->process_batch_encoding();
				break;
		}

		if ( empty( $result ) ) {
			return new \WP_Error( 'invalid_type', (string) __( 'Invalid batch type.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		return apply_filters( 'videopack_rest_batch_process', new \WP_REST_Response( $result, 200 ), $request );
	}

	/**
	 * REST callback to get a list of videos that need thumbnails generated.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The list of candidates.
	 */
	public function get_thumbnail_candidates( \WP_REST_Request $request ) {
		$attachment = new \Videopack\Admin\Attachment( $this->options, $this->format_registry, new \Videopack\Admin\Attachment_Meta( $this->options ) );
		$results    = (array) $attachment->get_thumbnail_candidates();
		return apply_filters( 'videopack_rest_get_thumbnail_candidates', new \WP_REST_Response( $results, 200 ), $request );
	}

	/**
	 * REST callback to get the progress of a batch process.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The progress data.
	 */
	public function batch_progress( $request ) {
		return \Videopack\Common\Debug_Logger::measure(
			'REST Endpoint: batch_progress',
			function () use ( $request ) {
				$type      = (string) $request->get_param( 'type' );
				$cache_key = 'videopack_rest_batch_progress_' . $type;
				$cached    = get_transient( $cache_key );
				if ( false !== $cached ) {
					return $cached;
				}

				$groups = array(
					'featured' => 'videopack-featured-images',
					'parents'  => 'videopack-parent-switching',
					'thumbs'   => 'videopack-generate-thumbnails',
					'encoding' => 'videopack-batch-enqueue',
				);

				$counts = array();
				if ( 'all' === $type ) {
					foreach ( $groups as $key => $group ) {
						$res = $this->get_action_scheduler_progress( $group );
						if ( ! is_wp_error( $res ) ) {
							$counts[ $key ] = $res;
						}
					}
					$counts['browser'] = (array) apply_filters(
						'videopack_rest_browser_thumbnail_progress',
						array(
							'pending'     => 0,
							'in-progress' => 0,
							'complete'    => 0,
							'failed'      => 0,
						)
					);
				} elseif ( 'browser' === $type ) {
					$counts = (array) apply_filters(
						'videopack_rest_browser_thumbnail_progress',
						array(
							'pending'     => 0,
							'in-progress' => 0,
							'complete'    => 0,
							'failed'      => 0,
						)
					);
				} elseif ( isset( $groups[ $type ] ) ) {
					$counts = $this->get_action_scheduler_progress( $groups[ $type ] );
					if ( is_wp_error( $counts ) ) {
						return $counts;
					}
				}

				$response = new \WP_REST_Response( (array) $counts, 200 );
				set_transient( $cache_key, $response, 10 );

				return apply_filters( 'videopack_rest_batch_progress', $response, $request );
			}
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
					return (array) $this->prepare_data_for_rest_response( (array) $post );
				},
				'update_callback' => null,
				'schema'          => null,
			)
		);
	}

	/**
	 * Logs REST API errors with request context.
	 *
	 * @param \WP_REST_Response|\WP_Error $result Result to send to the client.
	 * @param \WP_REST_Server             $server Server instance.
	 * @param \WP_REST_Request            $request Request object.
	 * @return \WP_REST_Response The result.
	 */
	public function log_rest_api_errors( $result, $server, $request ) {
		$is_error      = false;
		$error_details = '';

		if ( is_wp_error( $result ) ) {
			$is_error      = true;
			$error_details = (string) wp_json_encode( $result->get_error_data() );
		} elseif ( $result instanceof \WP_REST_Response && $result->is_error() ) {
			$is_error      = true;
			$error_details = (string) wp_json_encode( $result->get_data() );
		}

		if ( $is_error ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log(
				sprintf(
					'REST API Error: Route: %s, Method: %s, Params: %s, Error: %s',
					(string) $request->get_route(),
					(string) $request->get_method(),
					(string) wp_json_encode( (array) $request->get_params() ),
					$error_details
				)
			);
		}

		return $result;
	}

	/**
	 * Helper to get progress for a specific Action Scheduler group.
	 *
	 * @param string $group The Action Scheduler group.
	 * @return array|\WP_Error The progress counts or error.
	 */
	private function get_action_scheduler_progress( $group ) {
		if ( ! class_exists( 'ActionScheduler_Store' ) ) {
			return new \WP_Error( 'as_missing', (string) __( 'Action Scheduler is not available.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		$store    = \ActionScheduler_Store::instance();
		$statuses = array(
			'pending'     => \ActionScheduler_Store::STATUS_PENDING,
			'in-progress' => \ActionScheduler_Store::STATUS_RUNNING,
			'complete'    => \ActionScheduler_Store::STATUS_COMPLETE,
			'failed'      => \ActionScheduler_Store::STATUS_FAILED,
		);
		$counts   = array();

		foreach ( $statuses as $key => $status ) {
			$counts[ (string) $key ] = (int) $store->query_actions(
				array(
					'group'  => (string) $group,
					'status' => $status,
				),
				'count'
			);
		}

		return $counts;
	}

	/**
	 * REST callback to resolve a URL to an attachment ID.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The REST response object.
	 */
	public function resolve_url_to_attachment( \WP_REST_Request $request ) {
		$url       = (string) $request->get_param( 'url' );
		$parent_id = (int) ( $request->get_param( 'parent_id' ) ? $request->get_param( 'parent_id' ) : 0 );
		$create    = (bool) $request->get_param( 'create' );

		$attachment = new \Videopack\Admin\Attachment( $this->options, $this->format_registry, new \Videopack\Admin\Attachment_Meta( $this->options ) );
		$result     = $attachment->resolve_url_to_attachment( $url, $parent_id, $create );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return apply_filters( 'videopack_rest_resolve_url_to_attachment', new \WP_REST_Response( array( 'attachment_id' => (int) $result ), 200 ), $request );
	}

	/**
	 * Ensures we have a valid attachment ID, creating one from a URL if necessary.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return int|\WP_Error The attachment ID or a WP_Error on failure.
	 */
	protected function ensure_attachment_id( \WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'attachment_id' );

		if ( 0 === $attachment_id ) {
			$url       = (string) $request->get_param( 'url' );
			$parent_id = (int) ( $request->get_param( 'parent_id' ) ? $request->get_param( 'parent_id' ) : 0 );
			if ( $url ) {
				$attachment = new \Videopack\Admin\Attachment( $this->options, $this->format_registry, new \Videopack\Admin\Attachment_Meta( $this->options ) );
				$resolved   = $attachment->resolve_url_to_attachment( $url, $parent_id, true );
				if ( is_wp_error( $resolved ) ) {
					return $resolved;
				}
				return (int) $resolved;
			}
		}
		return $attachment_id;
	}

	/**
	 * REST callback to get encoding presets (video formats).
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response object.
	 */
	public function presets_get( \WP_REST_Request $request ) {
		$attachment_id = $request->get_param( 'attachment_id' );
		$url           = (string) $request->get_param( 'url' );
		$width         = $request->get_param( 'width' );
		$height        = $request->get_param( 'height' );
		$duration      = $request->get_param( 'duration' );
		$presets       = array();

		if ( ! empty( $attachment_id ) || ! empty( $url ) ) {
			$browser_metadata = array();
			if ( ! empty( $width ) && ! empty( $height ) ) {
				$browser_metadata['actualwidth']  = (int) $width;
				$browser_metadata['actualheight'] = (int) $height;
			}
			if ( ! empty( $duration ) ) {
				$browser_metadata['duration'] = (float) $duration;
			}

			$encoder            = new \Videopack\Admin\Encode\Encode_Attachment( $this->options, $this->format_registry, $attachment_id, $url, $browser_metadata );
			$video_formats_data = (array) $encoder->get_all_formats_with_status();

			foreach ( $video_formats_data as $format_id => $format_data ) {
				$presets[] = array(
					'id'                => (string) $format_id,
					'name'              => (string) ( $format_data['name'] ?? '' ),
					'codec'             => (array) ( $format_data['codec'] ?? array() ),
					'container'         => (string) ( $format_data['codec']['container'] ?? '' ),
					'resolution'        => (array) ( $format_data['resolution'] ?? array() ),
					'replaces_original' => (bool) ( $format_data['replaces_original'] ?? false ),
					'label'             => (string) ( $format_data['label'] ?? '' ),
					'status'            => (string) ( $format_data['status'] ?? '' ),
					'status_l10n'       => (string) ( $format_data['status_l10n'] ?? '' ),
					'exists'            => (bool) ( $format_data['exists'] ?? false ),
					'url'               => $format_data['url'] ?? null,
					'progress'          => $format_data['progress'] ?? null,
					'enabled'           => (bool) ( $format_data['enabled'] ?? true ),
					'deletable'         => (bool) ( $format_data['deletable'] ?? false ),
					'was_picked'        => (bool) ( $format_data['was_picked'] ?? false ),
					'is_manual'         => (bool) ( $format_data['was_picked'] ?? false ),
					'attachment_id'     => $format_data['id'] ?? null,
					'job_id'            => $format_data['job_id'] ?? null,
					'encoding_now'      => (bool) ( $format_data['encoding_now'] ?? false ),
					'video_duration'    => $format_data['video_duration'] ?? null,
					'started'           => $format_data['started'] ?? null,
				);
			}
		} else {
			$all_defined_formats = (array) $this->format_registry->get_video_formats( (bool) ( $this->options['hide_video_formats'] ?? false ) );
			foreach ( $all_defined_formats as $format_id => $video_format_obj ) {
				if ( ! $video_format_obj instanceof \Videopack\Admin\Formats\Video_Format ) {
					continue;
				}
				$format_array = (array) $video_format_obj->to_array();
				$presets[]    = array(
					'id'                => (string) $format_id,
					'name'              => (string) ( $format_array['name'] ?? '' ),
					'codec'             => (array) ( $format_array['codec'] ?? array() ),
					'container'         => (string) ( $format_array['codec']['container'] ?? '' ),
					'resolution'        => (array) ( $format_array['resolution'] ?? array() ),
					'replaces_original' => (bool) ( $format_array['replaces_original'] ?? false ),
					'label'             => (string) ( $format_array['label'] ?? '' ),
					'enabled'           => (bool) ( $format_array['enabled'] ?? true ),
				);
			}
		}

		return apply_filters( 'videopack_rest_presets_get', new \WP_REST_Response( $presets, 200 ), $request );
	}

	/**
	 * REST callback to create one or more encoding jobs.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The REST response object.
	 */
	public function jobs_create( \WP_REST_Request $request ) {
		$input     = $request->get_param( 'input' );
		$outputs   = (array) $request->get_param( 'outputs' );
		$parent_id = (int) ( $request->get_param( 'parent_id' ) ? $request->get_param( 'parent_id' ) : 0 );

		$attachment_id = 0;
		$input_url     = '';

		if ( is_numeric( $input ) ) {
			$attachment_id = (int) $input;
			$input_url     = (string) wp_get_attachment_url( $attachment_id );
		} else {
			$input_url = (string) esc_url_raw( (string) $input );
		}

		if ( ! $input_url ) {
			return new \WP_Error( 'invalid_input', (string) __( 'Invalid input URL or attachment ID.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		$queue_controller  = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );
		$attachment_or_url = ! empty( $attachment_id ) ? $attachment_id : $input_url;
		$enqueue_args      = array(
			'id'      => $attachment_or_url,
			'url'     => $input_url,
			'formats' => $outputs,
		);

		$result = (array) $queue_controller->enqueue_encodes( $enqueue_args );

		if ( empty( $result['results'] ) ) {
			return new \WP_Error( 'enqueue_failed', (string) __( 'Failed to enqueue any jobs.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		$created_jobs = (array) $queue_controller->get_jobs_list_data( (array) $queue_controller->get_queue_items( (int) get_current_blog_id() ), $attachment_id ? $attachment_id : $input_url );

		return apply_filters(
			'videopack_rest_jobs_create',
			new \WP_REST_Response(
				array_merge(
					$result,
					array(
						'attachment_id' => $attachment_id,
						'jobs'          => $created_jobs,
					)
				),
				201
			),
			$request
		);
	}

	/**
	 * REST callback to list encoding jobs.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response with the list of jobs.
	 */
	public function jobs_list( \WP_REST_Request $request ) {
		$input            = $request->get_param( 'input' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );
		$jobs             = (array) $queue_controller->get_jobs_list_data( (array) $queue_controller->get_queue_items( (int) get_current_blog_id() ), $input );

		return apply_filters( 'videopack_rest_jobs_list', new \WP_REST_Response( $jobs, 200 ), $request );
	}

	/**
	 * REST callback to control the encoding queue (play/pause).
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response object.
	 */
	public function jobs_control( \WP_REST_Request $request ) {
		$action           = (string) $request->get_param( 'action' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );

		if ( 'play' === $action ) {
			$queue_controller->play();
		} else {
			$queue_controller->pause();
		}

		return apply_filters(
			'videopack_rest_jobs_control',
			new \WP_REST_Response(
				array(
					'message'     => 'play' === $action ? (string) __( 'Queue started.', 'video-embed-thumbnail-generator' ) : (string) __( 'Queue paused.', 'video-embed-thumbnail-generator' ),
					'queue_state' => $action,
				),
				200
			),
			$request
		);
	}

	/**
	 * REST callback to clear jobs from the queue.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response object.
	 */
	public function jobs_clear( \WP_REST_Request $request ) {
		$type             = (string) $request->get_param( 'type' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );

		$queue_controller->clear_completed_queue( 'completed' === $type ? 'completed' : 'all' );

		return apply_filters(
			'videopack_rest_jobs_clear',
			new \WP_REST_Response(
				array(
					'message' => 'completed' === $type ? (string) __( 'Completed jobs cleared.', 'video-embed-thumbnail-generator' ) : (string) __( 'Queue cleared.', 'video-embed-thumbnail-generator' ),
					'cleared' => true,
				),
				200
			),
			$request
		);
	}

	/**
	 * REST callback to get a single encoding job.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The job data.
	 */
	public function job_get( \WP_REST_Request $request ) {
		$id               = (int) $request->get_param( 'id' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );
		$prepared         = $queue_controller->get_job_prepared( $id );

		if ( is_wp_error( $prepared ) ) {
			return $prepared;
		}

		return apply_filters( 'videopack_rest_job_get', new \WP_REST_Response( (array) $prepared, 200 ), $request );
	}

	/**
	 * REST callback to delete an encoding job.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The result.
	 */
	public function job_delete( \WP_REST_Request $request ) {
		$id               = (int) $request->get_param( 'id' );
		$force            = $request->get_param( 'force' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );

		if ( 'false' !== $force && false !== $force ) {
			$result = $queue_controller->delete_job( $id, true );
		} else {
			$result = $queue_controller->remove_job( $id );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return apply_filters(
			'videopack_rest_job_delete',
			new \WP_REST_Response(
				array(
					'deleted' => true,
					'job_id'  => $id,
					'force'   => ( 'false' !== $force && false !== $force ),
				),
				200
			),
			$request
		);
	}

	/**
	 * REST callback to retry an encoding job.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The result.
	 */
	public function job_retry( \WP_REST_Request $request ) {
		$id               = (int) $request->get_param( 'id' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );

		$result = $queue_controller->retry_job( $id );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return apply_filters(
			'videopack_rest_job_retry',
			new \WP_REST_Response(
				array(
					'retried' => true,
					'job_id'  => $id,
				),
				200
			),
			$request
		);
	}
}
