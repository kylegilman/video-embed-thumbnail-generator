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

use Videopack\Common\Debug_Logger;

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
	 * Cache for video durations during a request.
	 *
	 * @var array $video_durations
	 */
	protected $video_durations = array();

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
	 * Permission check for making video thumbnails.
	 *
	 * @return bool
	 */
	public function make_video_thumbnails_permissions_check() {
		$can = current_user_can( 'make_video_thumbnails' );
		return $can;
	}

	/**
	 * Permission check for encoding videos.
	 *
	 * @return bool
	 */
	public function encode_videos_permissions_check() {
		$can = current_user_can( 'encode_videos' );
		return $can;
	}

	/**
	 * Permission check for getting settings.
	 *
	 * @return bool
	 */
	public function get_settings_permissions_check() {
		$can = current_user_can( 'manage_options' );
		return $can;
	}

	/**
	 * Permission check for updating settings.
	 *
	 * @return bool
	 */
	public function update_settings_permissions_check() {
		$can = current_user_can( 'manage_options' );
		return $can;
	}

	/**
	 * REST callback to get plugin settings.
	 *
	 * @return \WP_REST_Response The settings.
	 */
	public function get_settings() {
		return new \WP_REST_Response( $this->options, 200 );
	}

	/**
	 * REST callback to update plugin settings.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The updated settings.
	 */
	public function update_settings( \WP_REST_Request $request ) {
		$params  = $request->get_params();
		$options = array_merge( $this->options, $params );
		update_option( 'videopack_options', $options );
		$this->options = $options;
		return new \WP_REST_Response( $this->options, 200 );
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
						'type' => array( 'number', 'string' ),
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
					'gallery_source'   => array(
						'type' => 'string',
					),
					'gallery_category' => array(
						'type' => 'string',
					),
					'gallery_tag'      => array(
						'type' => 'string',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/settings',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'get_settings_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'update_settings_permissions_check' ),
					'args'                => $this->get_endpoint_args_for_item_schema( \WP_REST_Server::EDITABLE ),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/defaults',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'thumb_save' ),
					'permission_callback' => array( $this, 'make_video_thumbnails_permissions_check' ),

					'args'                => array(
						'attachment_id'   => array(
							'type'     => array(
								'number',
								'string',
							),
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
						return ( $this->make_video_thumbnails_permissions_check() && $this->options['ffmpeg_exists'] === true );
					},
					'args'                => array(
						'url'              => array(
							'type'     => 'string',
							'required' => true,
						), // The video URL, for context.
						'total_thumbnails' => array(
							'type'     => 'number',
							'minimum'  => 1,
							'maximum'  => 100,
							'default'  => 4,
							'required' => true,
						), // Total number of thumbs being generated in this batch.
						'thumbnail_index'  => array(
							'type'     => 'number',
							'required' => true,
						), // The 1-based index of the thumbnail to generate.
						'attachment_id'    => array(
							'type'     => 'number',
							'required' => true,
						), // The ID of the source video attachment.
						'parent_id'        => array(
							'type'     => 'number',
							'required' => false,
							'default'  => 0,
						), // The ID of the parent post.
						'generate_button'  => array(
							'type'     => 'string',
							'required' => true,
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
			'/sources',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'video_sources' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'url'           => array(
						'type' => 'string',
					),
					'attachment_id' => array(
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
			'/ffmpeg-test',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'ffmpeg_test' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
				'args'                => array(
					'codec'      => array(
						'type' => 'string',
					),
					'resolution' => array(
						'type' => 'string',
					),
					'rotate'     => array(
						'type' => array( 'boolean', 'string' ),
					),
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
					return current_user_can( 'manage_options' );
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
				'methods'             => \WP_REST_Server::CREATABLE, // Use CREATABLE for actions that modify data
				'callback'            => array( $this, 'count_play' ),
				'permission_callback' => '__return_true', // Public endpoint for view counting
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
					'show_views'    => array(
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
			'/thumbs/candidates',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_thumbnail_candidates' ),
				'permission_callback' => array( $this, 'make_video_thumbnails_permissions_check' ),

			)
		);

		register_rest_route(
			$this->namespace,
			'/thumbs/browser-candidates',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_browser_thumbnail_candidates' ),
				'permission_callback' => array( $this, 'make_video_thumbnails_permissions_check' ),

			)
		);

		register_rest_route(
			$this->namespace,
			'/resolve-url',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'resolve_url_to_attachment' ),
				'permission_callback' => function () {
					return current_user_can( 'upload_files' );
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
					'attachment_id' => array(
						'type' => array( 'number', 'string' ),
					),
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
							'items'    => array(
								'type' => 'string',
							),
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
						return is_user_logged_in();
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
						return is_user_logged_in();
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
	 * Recursively cleans an array for REST response.
	 *
	 * Removes keys containing 'path', converts 'checked' or true to boolean true,
	 * and sets NaN or infinite float values to null.
	 *
	 * @param array $dirty_array The array to clean.
	 * @return array The cleaned array.
	 */
	public function clean_array( $dirty_array ) {
		static $depth = 0;

		// Add a depth limit to prevent infinite recursion
		if ( $depth > 20 ) {
			return '(recursion limit reached)';
		}

		++$depth;
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
		--$depth;
		return $dirty_array;
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
	 * REST callback to get the HTML for a Freemius settings page.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The REST response with the page HTML or an error.
	 */
	public function get_freemius_page_html( \WP_REST_Request $request ) {
		if ( ! function_exists( 'videopack_fs' ) ) {
			return new \WP_Error( 'freemius_not_found', 'Freemius SDK not available.', array( 'status' => 500 ) );
		}

		$page_slug = $request->get_param( 'page' );
		$freemius  = videopack_fs();

		ob_start();

		switch ( $page_slug ) {
			case 'account':
				if ( ! is_object( $freemius->get_user() ) ) {
					ob_end_clean();
					return new \WP_Error( 'freemius_no_user', 'Freemius user data not available. This can happen if the plugin is network-activated but not yet opted-in at the network level.', array( 'status' => 403 ) );
				}
				$freemius->_account_page_render();
				break;
			case 'add-ons':
				$freemius->_addons_page_render();
				break;
			default:
				ob_end_clean();
				return new \WP_Error( 'invalid_freemius_page', 'Invalid Freemius page requested.', array( 'status' => 404 ) );
		}

		return new \WP_REST_Response( array( 'html' => ob_get_clean() ), 200 );
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

		$ffmpeg_thumbnails = new FFmpeg_Thumbnails( $this->options_manager );
		$result            = $ffmpeg_thumbnails->generate_single_thumbnail_data(
			$attachment_id,
			$request->get_param( 'total_thumbnails' ),
			$request->get_param( 'thumbnail_index' ),
			( $request->get_param( 'generate_button' ) === 'random' ) // Whether to use a random offset for the timecode.
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// The result is an array with 'path' and 'url'. The client only needs the URL.
		return new \WP_REST_Response(
			array(
				'real_thumb_url' => $result['url'],
				'attachment_id'  => $attachment_id,
			),
			200
		);
	}

	/**
	 * REST callback to save all generated thumbnails for a video.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response with the results of the save operations.
	 */
	public function thumb_save_all( \WP_REST_Request $request ) {

		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$thumb_urls = $request->get_param( 'thumb_urls' );

		$thumbnails     = new FFmpeg_Thumbnails( $this->options_manager ); // Use FFmpeg_Thumbnails for saving
		$post_name      = '';
		$attachment_url = wp_get_attachment_url( $attachment_id );
		if ( $attachment_url ) {
			$post_name = basename( $attachment_url );
			$post_name = pathinfo( $post_name, PATHINFO_FILENAME );
		}
		if ( empty( $post_name ) ) {
			$post_name = html_entity_decode( get_the_title( $attachment_id ), ENT_QUOTES, 'UTF-8' );
		}
		$results = array();

		$parent_id = $request->get_param( 'parent_id' );
		$featured  = $request->get_param( 'featured' );
		foreach ( $thumb_urls as $index => $url ) {
			$res                  = $thumbnails->save( $attachment_id, $post_name, $url, $index + 1, $parent_id, $featured );
			$res['attachment_id'] = $attachment_id;
			$results[]            = $res;
		}

		return new \WP_REST_Response( $results, 200 );
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

		$post_name = $request->get_param( 'post_name' );
		if ( ! empty( $post_name ) ) {
			$post_name = pathinfo( $post_name, PATHINFO_FILENAME );
		}
		$files = $request->get_file_params();

		if ( empty( $files['file'] ) ) {
			return new \WP_Error( 'missing_file', 'No file was uploaded.', array( 'status' => 400 ) );
		}

		$thumbnails = new FFmpeg_Thumbnails( $this->options_manager );
		$response   = $thumbnails->save_from_blob( $attachment_id, $post_name, $files['file'], $request->get_param( 'parent_id' ), $request->get_param( 'featured' ) );

		$response['attachment_id'] = $attachment_id;

		if ( ! $response['thumb_id'] ) {
			return new \WP_Error( 'upload_failed', $response['error'] ?? 'Could not save uploaded thumbnail.', array( 'status' => 500 ) );
		}

		return new \WP_REST_Response( $response, 200 );
	}

	/**
	 * REST callback to save a single thumbnail for a video.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error The response from the save operation.
	 */
	public function thumb_save( \WP_REST_Request $request ) {

		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$params     = $request->get_params();
		$thumbnails = new FFmpeg_Thumbnails( $this->options_manager ); // Use FFmpeg_Thumbnails for saving

		if ( is_numeric( $attachment_id ) ) {
			$post_name      = '';
			$attachment_url = wp_get_attachment_url( $attachment_id );
			if ( $attachment_url ) {
				$post_name = basename( $attachment_url );
				$post_name = pathinfo( $post_name, PATHINFO_FILENAME );
			}
			if ( empty( $post_name ) ) {
				$post_name = html_entity_decode( get_the_title( $attachment_id ), ENT_QUOTES, 'UTF-8' );
			}
		} else {
			$post_name = str_replace( 'singleurl_', '', (string) $attachment_id );
		}

		$thumbnail_index = isset( $params['thumbnail_index'] ) ? intval( $params['thumbnail_index'] ) : false;

		$response = $thumbnails->save(
			$attachment_id,
			$post_name,
			$params['thumburl'],
			$thumbnail_index,
			$params['parent_id'] ?? 0,
			$params['featured'] ?? null
		);

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
		$page         = $request->get_param( 'page_number' ) ? $request->get_param( 'page_number' ) : 1;

		// If filtering by category or tag and no specific gallery_id (post parent) was requested, clear the default ID.
		if ( in_array( $gallery_atts['gallery_source'], array( 'category', 'tag' ), true ) && ! $request->get_param( 'gallery_id' ) ) {
			$gallery_atts['gallery_id'] = '';
		}

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

		$max_num_pages = ( ! empty( $gallery_atts['gallery_pagination'] ) ) ? (int) $attachments->max_num_pages : 1;

		$response = array(
			'videos'        => $videos_data,
			'max_num_pages' => $max_num_pages,
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

		$url           = $request->get_param( 'url' );
		$attachment_id = $request->get_param( 'attachment_id' );
		// Prioritize numeric IDs, otherwise fall back to the URL.
		$source_input = is_numeric( $attachment_id ) ? (int) $attachment_id : $url;
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
	 * REST callback to run a test FFmpeg encode.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array|\WP_Error The result of the test encode or an error.
	 */
	public function ffmpeg_test( \WP_REST_Request $request ) {
		$controller = new Encode\Encode_Queue_Controller( $this->options_manager );
		$codec      = $request->get_param( 'codec' );
		$resolution = $request->get_param( 'resolution' );
		$format     = $codec . '_' . $resolution;
		$rotate     = $request->get_param( 'rotate' ); // Already validated by REST route args.

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
	 * REST callback to render a Videopack shortcode.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The HTML output of the shortcode.
	 */
	public function render_shortcode( \WP_REST_Request $request ) {
		$atts    = $request->get_param( 'attrs' );
		$content = $request->get_param( 'content' );

		// Convert attrs from object to array if needed
		if ( is_object( $atts ) ) {
			$atts = (array) $atts;
		}

		$shortcode = new \Videopack\Frontend\Shortcode( $this->options_manager );
		$response  = $shortcode->do( $atts, $content );

		return new \WP_REST_Response( array( 'html' => $response ), 200 );
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
				'srcset'        => wp_get_attachment_image_srcset( $post_id ),
				'sources'       => array(),
				'source_groups' => new \stdClass(),
			);
		}

		// Create the Player object using the factory, set the source, and get the sources array.
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $this->options['embed_method'], $this->options_manager );
		$player->set_source( $source );

		return array(
			'srcset'        => wp_get_attachment_image_srcset( $post_id ),
			'sources'       => $player->get_flat_sources(),
			'source_groups' => $player->get_sources(),
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
		$attachment_id = $request->get_param( 'attachment_id' );
		// Validate attachment_id: ensure it's a valid attachment ID.
		if ( ! $attachment_id || ! is_numeric( $attachment_id ) || 'attachment' !== get_post_type( $attachment_id ) ) {
			return new \WP_Error( 'rest_invalid_attachment_id', esc_html__( 'Invalid attachment ID.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		$video_event = $request->get_param( 'video_event' );
		$show_views  = $request->get_param( 'show_views' );

		$attachment_meta_manager = new Attachment_Meta( $this->options_manager, $attachment_id );
		$updated_meta            = $attachment_meta_manager->increment_video_stat( $video_event );

		$response_data = array(
			'status' => 'success',
		);

		// If the client requested the view count, return the 'starts' value.
		// The JS will only update the display on the 'play' event.
		if ( $show_views && isset( $updated_meta['starts'] ) ) {
			$response_data['view_count'] = \Videopack\Common\I18n::format_view_count( $updated_meta['starts'] );
		}

		return new \WP_REST_Response( $response_data, 200 );
	}



	/**
	 * Permission callback for batch operations.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return bool True if allowed, false otherwise.
	 */
	public function batch_permissions( $request ) {
		$type = $request->get_param( 'type' );
		switch ( $type ) {
			case 'featured':
			case 'parents':
				return current_user_can( 'manage_options' );
			case 'thumbs':
				return $this->make_video_thumbnails_permissions_check();
			case 'encoding':
				return $this->encode_videos_permissions_check();
			case 'all':
				return current_user_can( 'manage_options' ) && $this->make_video_thumbnails_permissions_check() && $this->encode_videos_permissions_check();
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
			return new \WP_Error( 'as_missing', __( 'Action Scheduler is not available.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		$type   = $request->get_param( 'type' );
		$groups = array(
			'featured' => 'videopack-featured-images',
			'parents'  => 'videopack-parent-switching',
			'thumbs'   => 'videopack-generate-thumbnails',
			'encoding' => 'videopack-batch-enqueue',
		);

		// Clear any existing actions in this group to prevent duplicates/confusion.
		if ( function_exists( 'as_unschedule_all_actions' ) ) {
			as_unschedule_all_actions( '', array(), $groups[ $type ] );
		}

		$attachment = new Attachment( $this->options_manager );
		$result     = array();

		switch ( $type ) {
			case 'featured':
				$result = $attachment->process_batch_featured();
				break;
			case 'parents':
				$target_parent = $request->get_param( 'target_parent' );
				$result        = $attachment->process_batch_parents( $target_parent );
				break;
			case 'thumbs':
				$result = $attachment->process_batch_thumbs();
				break;
			case 'encoding':
				$result = $attachment->process_batch_encoding();
				break;
		}

		if ( empty( $result ) ) {
			return new \WP_Error( 'invalid_type', __( 'Invalid batch type.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		return new \WP_REST_Response( $result, 200 );
	}

	/**
	 * REST callback to get a list of videos that need thumbnails generated.
	 *
	 * @return \WP_REST_Response The list of candidates.
	 */
	public function get_thumbnail_candidates() {
		$attachment = new Attachment( $this->options_manager );
		$results    = $attachment->get_thumbnail_candidates();
		return new \WP_REST_Response( $results, 200 );
	}

	/**
	 * REST callback to get a list of videos that need browser thumbnails generated.
	 *
	 * @return \WP_REST_Response The list of candidates.
	 */
	public function get_browser_thumbnail_candidates() {
		$attachment = new Attachment( $this->options_manager );
		$results    = $attachment->get_pending_browser_thumbnails();
		return new \WP_REST_Response( $results, 200 );
	}

	/**
	 * REST callback to get the progress of a batch process.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 *
	 * @return \WP_REST_Response|\WP_Error The progress data.
	 */
	public function batch_progress( $request ) {
		return Debug_Logger::measure(
			'REST Endpoint: batch_progress',
			function () use ( $request ) {
				$type      = $request->get_param( 'type' );
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

				$response = null;

				if ( 'all' === $type ) {
					$all_counts = array();
					foreach ( $groups as $key => $group ) {
						$counts = $this->get_action_scheduler_progress( $group );
						if ( ! is_wp_error( $counts ) ) {
							$all_counts[ $key ] = $counts;
						}
					}
					$all_counts['browser'] = $this->get_browser_thumbnail_progress();
					$response              = new \WP_REST_Response( $all_counts, 200 );
				} elseif ( 'browser' === $type ) {
					$response = new \WP_REST_Response( $this->get_browser_thumbnail_progress(), 200 );
				} elseif ( isset( $groups[ $type ] ) ) {
					$counts = $this->get_action_scheduler_progress( $groups[ $type ] );

					if ( is_wp_error( $counts ) ) {
						return $counts;
					}

					$response = new \WP_REST_Response( $counts, 200 );
				}

				if ( $response ) {
					set_transient( $cache_key, $response, 10 ); // Cache for 10 seconds
				}

				return $response;
			}
		);
	}

	/**
	 * Helper to get progress for browser thumbnails.
	 *
	 * @return array The progress counts.
	 */
	private function get_browser_thumbnail_progress() {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $wpdb->postmeta WHERE meta_key = %s AND meta_value = %s", '_videopack_needs_browser_thumb', '1' ) );
		return array(
			'pending'     => (int) $count,
			'in-progress' => 0,
			'complete'    => 0,
			'failed'      => 0,
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
	 * Logs REST API errors with request context.
	 *
	 * This function is hooked into `rest_post_dispatch` and will log any WP_Error
	 * responses, providing valuable debugging information including the route,
	 * method, parameters, and the error details.
	 *
	 * @param \WP_REST_Response||\WP_Error $result  Result to send to the client.
	 * @param \WP_REST_Server   $server  Server instance.
	 * @param \WP_REST_Request  $request Request used to generate the response.
	 * @return \WP_REST_Response The unchanged result.
	 */
	public function log_rest_api_errors( $result, $server, $request ) {
		$is_error      = false;
		$error_details = '';

		if ( is_wp_error( $result ) ) {
			$is_error      = true;
			$error_details = wp_json_encode( $result->get_error_data() );
		} elseif ( is_a( $result, 'WP_REST_Response' ) && $result->is_error() ) {
			$is_error      = true;
			$error_details = wp_json_encode( $result->get_data() );
		}

		if ( $is_error ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log(
				sprintf(
					'REST API Error: Route: %s, Method: %s, Params: %s, Error: %s',
					$request->get_route(),
					$request->get_method(),
					wp_json_encode( $request->get_params() ),
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
			return new \WP_Error( 'as_missing', __( 'Action Scheduler is not available.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
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
			$counts[ $key ] = (int) $store->query_actions(
				array(
					'group'  => $group,
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
	 * @return \WP_REST_Response|\WP_Error The response with the attachment ID or an error.
	 */
	public function resolve_url_to_attachment( \WP_REST_Request $request ) {
		$url       = $request->get_param( 'url' );
		$parent_id = $request->get_param( 'parent_id' );
		$parent_id = $parent_id ? (int) $parent_id : 0;
		$create    = $request->get_param( 'create' );
		$create    = $create ? (bool) $create : false;

		$attachment = new Attachment( $this->options_manager );
		$result     = $attachment->resolve_url_to_attachment( $url, $parent_id, $create );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new \WP_REST_Response( array( 'attachment_id' => $result ), 200 );
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
			$url       = $request->get_param( 'url' );
			$parent_id = $request->get_param( 'parent_id' ) ? (int) $request->get_param( 'parent_id' ) : 0;
			if ( $url ) {
				$attachment = new Attachment( $this->options_manager );
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
	 * @return \WP_REST_Response The list of presets.
	 */
	public function presets_get( \WP_REST_Request $request ) {
		$attachment_id = $request->get_param( 'attachment_id' );
		$url           = $request->get_param( 'url' );
		$presets       = array();

		if ( ! empty( $attachment_id ) || ! empty( $url ) ) {
			$encoder            = new Encode\Encode_Attachment( $this->options_manager, $attachment_id, $url );
			$video_formats_data = $encoder->get_all_formats_with_status();

			foreach ( $video_formats_data as $format_id => $format_data ) {
				$presets[] = array(
					'id'                => $format_id,
					'name'              => $format_data['name'],
					'codec'             => $format_data['codec'],
					'container'         => $format_data['codec']['container'],
					'resolution'        => $format_data['resolution'],
					'replaces_original' => $format_data['replaces_original'],
					'label'             => $format_data['label'],
					'status'            => $format_data['status'],
					'status_l10n'       => $format_data['status_l10n'],
					'exists'            => $format_data['exists'],
					'url'               => $format_data['url'] ?? null,
					'progress'          => $format_data['progress'] ?? null,
					'enabled'           => $format_data['enabled'] ?? true,
					'deletable'         => $format_data['deletable'] ?? false,
					'was_picked'        => $format_data['was_picked'] ?? false,
					'is_manual'         => $format_data['was_picked'] ?? false,
					'attachment_id'     => $format_data['id'] ?? null,
					'job_id'            => $format_data['job_id'] ?? null,
					'encoding_now'      => $format_data['encoding_now'] ?? false,
					'video_duration'    => $format_data['video_duration'] ?? null,
					'started'           => $format_data['started'] ?? null,
				);
			}
		} else {
			$all_defined_formats = $this->options_manager->get_video_formats( $this->options['hide_video_formats'] );

			foreach ( $all_defined_formats as $format_id => $video_format_obj ) {
				$format_array = $video_format_obj->to_array();
				// Re-map for standard structure
				$presets[] = array(
					'id'                => $format_id,
					'name'              => $format_array['name'],
					'codec'             => $format_array['codec'],
					'container'         => $format_array['codec']['container'],
					'resolution'        => $format_array['resolution'],
					'replaces_original' => $format_array['replaces_original'],
					'label'             => $format_array['label'],
					'enabled'           => $format_array['enabled'],

				);
			}
		}

		return new \WP_REST_Response( $presets, 200 );
	}

	/**
	 * REST callback to create one or more encoding jobs.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The created jobs.
	 */
	public function jobs_create( \WP_REST_Request $request ) {
		$input     = $request->get_param( 'input' );
		$outputs   = $request->get_param( 'outputs' );
		$parent_id = (int) $request->get_param( 'parent_id' );
		if ( ! $parent_id ) {
			$parent_id = 0;
		}

		$attachment_id = 0;
		$input_url     = '';

		if ( is_numeric( $input ) ) {
			$attachment_id = (int) $input;
			$input_url     = (string) wp_get_attachment_url( $attachment_id );
		} else {
			$input_url = esc_url_raw( $input );
		}

		if ( ! $input_url ) {
			return new \WP_Error( 'invalid_input', __( 'Invalid input URL or attachment ID.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		$queue_controller  = new Encode\Encode_Queue_Controller( $this->options_manager );
		$attachment_or_url = ! empty( $attachment_id ) ? $attachment_id : $input_url;
		$enqueue_args     = array(
			'id'      => $attachment_or_url,
			'url'     => $input_url,
			'formats' => $outputs,
		);

		$result = $queue_controller->enqueue_encodes( $enqueue_args );

		if ( empty( $result['results'] ) ) {
			return new \WP_Error( 'enqueue_failed', __( 'Failed to enqueue any jobs.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		// Re-fetch created jobs because enqueue_encodes might not return everything we need in standard format
		$attachment_or_url_refetch = 0;
		if ( ! empty( $attachment_id ) ) {
			$attachment_or_url_refetch = $attachment_id;
		} else {
			$attachment_or_url_refetch = $input_url;
		}

		$encoder = new Encode\Encode_Attachment( $this->options_manager, $attachment_or_url_refetch, $input_url );
		$formats = $encoder->get_formats();

		$created_jobs = array();
		foreach ( $formats as $format_obj ) {
			if ( in_array( $format_obj->get_format_id(), $outputs, true ) ) {
				$created_jobs[] = $this->prepare_job_for_response( $format_obj );
			}
		}

		$response_data = array_merge(
			$result,
			array(
				'attachment_id' => $attachment_id,
				'jobs'          => $created_jobs,
			)
		);
		return new \WP_REST_Response( $response_data, 201 );
	}

	/**
	 * REST callback to list encoding jobs.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The list of jobs.
	 */
	public function jobs_list( \WP_REST_Request $request ) {
		$input            = $request->get_param( 'input' );
		$queue_controller = new Encode\Encode_Queue_Controller( $this->options_manager );
		$all_items        = $queue_controller->get_queue_items( get_current_blog_id() );

		$jobs = array();
		foreach ( $all_items as $item ) {
			if ( ! $input || $item['attachment_id'] == $input || $item['input_url'] === $input ) {
				$created_job = $this->prepare_job_for_response( Encode\Encode_Format::from_array( $item ) );
				if ( ! is_wp_error( $created_job ) ) {
					$jobs[] = $created_job;
				}
			}
		}

		return new \WP_REST_Response( $jobs, 200 );
	}

	/**
	 * REST callback to control the encoding queue (play/pause).
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The result.
	 */
	public function jobs_control( \WP_REST_Request $request ) {
		$action           = $request->get_param( 'action' );
		$queue_controller = new Encode\Encode_Queue_Controller( $this->options_manager );

		if ( 'play' === $action ) {
			$queue_controller->play();
		} else {
			$queue_controller->pause();
		}

		return new \WP_REST_Response(
			array(
				'message'     => 'play' === $action ? __( 'Queue started.', 'video-embed-thumbnail-generator' ) : __( 'Queue paused.', 'video-embed-thumbnail-generator' ),
				'queue_state' => $action,
			),
			200
		);
	}

	/**
	 * REST callback to clear jobs from the queue.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The result.
	 */
	public function jobs_clear( \WP_REST_Request $request ) {
		$type             = $request->get_param( 'type' );
		$queue_controller = new Encode\Encode_Queue_Controller( $this->options_manager );

		if ( 'completed' === $type ) {
			$queue_controller->clear_completed_queue( 'completed' );
		} else {
			$queue_controller->clear_completed_queue( 'all' );
		}

		return new \WP_REST_Response(
			array(
				'message' => 'completed' === $type ? __( 'Completed jobs cleared.', 'video-embed-thumbnail-generator' ) : __( 'Queue cleared.', 'video-embed-thumbnail-generator' ),
				'cleared' => true,
			),
			200
		);
	}

	/**
	 * REST callback to get a single encoding job.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error The job data.
	 */
	public function job_get( \WP_REST_Request $request ) {
		$id = (int) $request->get_param( 'id' );
		global $wpdb;
		$queue_table = $wpdb->prefix . 'videopack_encoding_queue';
		if ( is_multisite() ) {
			$main_site_id = defined( 'BLOG_ID_CURRENT_SITE' ) ? BLOG_ID_CURRENT_SITE : 1;
			$queue_table  = $wpdb->get_blog_prefix( $main_site_id ) . 'videopack_encoding_queue';
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$job_data = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM %i WHERE id = %d", $queue_table, $id ), ARRAY_A );

		if ( ! $job_data ) {
			return new \WP_Error( 'job_not_found', __( 'Job not found.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}

		$job_obj = Encode\Encode_Format::from_array( $job_data );
		return new \WP_REST_Response( $this->prepare_job_for_response( $job_obj ), 200 );
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
		$queue_controller = new Encode\Encode_Queue_Controller( $this->options_manager );

		// If force is NOT explicitly set to false, we assume it's a permanent deletion (soft job delete, hard attachment delete).
		// If force IS false, we do a hard job delete (remove from DB).
		if ( $force !== 'false' && $force !== false ) {
			$result = $queue_controller->delete_job( $id, true );
		} else {
			$result = $queue_controller->remove_job( $id );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new \WP_REST_Response(
			array(
				'deleted' => true,
				'job_id'  => $id,
				'force'   => ( $force !== 'false' && $force !== false ),
			),
			200
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
		$queue_controller = new Encode\Encode_Queue_Controller( $this->options_manager );

		$result = $queue_controller->retry_job( $id );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new \WP_REST_Response(
			array(
				'retried' => true,
				'job_id'  => $id,
			),
			200
		);
	}

	/**
	 * Helper to prepare a job object for REST response.
	 *
	 * @param Encode\Encode_Format $job The job object.
	 * @return array The prepared job data.
	 */
	protected function prepare_job_for_response( $job ) {
		$internal_status = $job->get_status();
		$status = $internal_status;

		$attachment_id = $job->get_attachment_id();
		$blog_id       = $job->get_blog_id();
		if ( ! $blog_id ) {
			$blog_id = get_current_blog_id();
		}
		$user_id       = $job->get_user_id();

		$video_title     = '';
		$poster_url      = '';
		$user_name       = '';
		$blog_name       = '';
		$attachment_link = '';

		if ( $attachment_id ) {
			$video_title     = get_the_title( $attachment_id );
			$poster_id       = get_post_meta( $attachment_id, '_kgflashmediaplayer-poster-id', true );
			$poster_url      = $poster_id ? wp_get_attachment_image_url( $poster_id, 'thumbnail' ) : get_post_meta( $attachment_id, '_kgflashmediaplayer-poster', true );
			$attachment_link = get_edit_post_link( $attachment_id );
		} elseif ( $job->get_input_url() ) {
			$video_title = basename( $job->get_input_url() );
		}

		// Ensure duration is set for progress calculation
		if ( ! $job->get_video_duration() ) {
			$attachment_key = ! empty( $attachment_id ) ? (string) $attachment_id : $job->get_input_url();
			if ( $attachment_key ) {
				if ( ! isset( $this->video_durations[ $attachment_key ] ) ) {
					$encoder = new Encode\Encode_Attachment( $this->options_manager, $attachment_id ? $attachment_id : $job->get_input_url(), $job->get_input_url() );
					$metadata = $encoder->get_video_metadata();
					$this->video_durations[ $attachment_key ] = ( $metadata && $metadata->duration ) ? (int) round( $metadata->duration * 1000000 ) : 0;
				}
				if ( $this->video_durations[ $attachment_key ] ) {
					$job->set_video_duration( $this->video_durations[ $attachment_key ] );
				}
			}
		}

		if ( $user_id ) {
			$user_data = get_userdata( $user_id );
			if ( $user_data ) {
				$user_name = $user_data->display_name;
			}
		}

		if ( is_multisite() ) {
			$blog_details = get_blog_details( $blog_id );
			if ( $blog_details ) {
				$blog_name = $blog_details->blogname;
			}
		}

		$video_formats = $this->options_manager->get_video_formats();
		$format_name   = isset( $video_formats[ $job->get_format_id() ] ) ? $video_formats[ $job->get_format_id() ]->get_name() : $job->get_format_id();

		$response = array(
			'id'              => $job->get_job_id(),
			'status'          => $status,
			'status_l10n'     => Encode\Encode_Format::get_status_label( $internal_status ),
			'preset'          => $job->get_format_id(),
			'format_name'     => $format_name,
			'output_url'      => $job->get_url(),
			'output_id'       => $job->get_id(), // Attachment ID of the output
			'error'           => $job->get_error(),
			'created_at'      => $job->get_created_at(),
			'started'         => $job->get_started(),
			'video_title'     => $video_title,
			'video_duration'  => $job->get_video_duration(),
			'user_name'       => $user_name,
			'blog_name'       => $blog_name,
			'poster_url'      => $poster_url,
			'attachment_link' => $attachment_link,
			'attachment_id'   => $attachment_id,
		);

		if ( in_array( $status, array( Encode\Encode_Format::STATUS_PROCESSING, Encode\Encode_Format::STATUS_ENCODING, Encode\Encode_Format::STATUS_NEEDS_INSERT, Encode\Encode_Format::STATUS_PENDING_REPLACEMENT ), true ) ) {
			$progress = $job->get_progress();
			if ( is_array( $progress ) ) {
				$response['progress'] = $progress;
			}
		}

		return $response;
	}
}
