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
			'/defaults',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'defaults' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			$this->namespace,
			'/formats/(?P<attachment_id>\d+)',
			array( // This route handles specific attachment IDs.
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'formats' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'attachment_id' => array(
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
					),
				),
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'thumb_generate' ),
					'permission_callback' => function () {
						return ( current_user_can( 'make_video_thumbnails' ) && $this->options['ffmpeg_exists'] === true );
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
				'permission_callback' => function () {
					return current_user_can( 'make_video_thumbnails' );
				},
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
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/queue/remove/(?P<job_id>\d+)',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'queue_remove' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
				'args'                => array(
					'job_id' => array(
						'type'     => 'integer',
						'required' => true,
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
						'type'     => 'integer',
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
						'type'              => 'integer',
						'required'          => true,
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
			'/queue',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'queue_get' ),
				'permission_callback' => function () {
					return ( $this->options['ffmpeg_exists'] === true );
				},
			)
		);

		register_rest_route(
			$this->namespace,
			'/queue/(?P<attachment_id>\w+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'queue_get' ),
					'permission_callback' => function () {
						return ( $this->options['ffmpeg_exists'] === true );
					},
					'args'                => array(
						'attachment_id' => array(
							'type' => array( 'number', 'string' ),
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
				'permission_callback' => function () {
					return current_user_can( 'make_video_thumbnails' );
				},
			)
		);
		register_rest_route(
			$this->namespace,
			'/thumbs/browser-candidates',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_browser_thumbnail_candidates' ),
				'permission_callback' => function () {
					return current_user_can( 'make_video_thumbnails' );
				},
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
	 * REST callback to get video formats and their encoding status for a specific attachment or URL.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return array|\WP_Error Array of format data on success, or WP_Error object on failure.
	 */
	public function formats( \WP_REST_Request $request ) {
		$params             = $request->get_params();
		$encoder            = null;
		$video_formats_data = array();

		// Determine if a specific video is being requested by ID or URL.
		if ( ! empty( $params['attachment_id'] ) && get_post_type( $params['attachment_id'] ) === 'attachment' ) {
			$encoder = new encode\Encode_Attachment( $this->options_manager, (int) $params['attachment_id'] );
		} elseif ( ! empty( $params['url'] ) ) {
			$input_url     = esc_url_raw( $params['url'] );
			$sanitized_url = new Sanitize_Url( $input_url );
			$encoder       = new encode\Encode_Attachment( $this->options_manager, $sanitized_url->singleurl_id, $input_url );
		}

		if ( $encoder ) {
			// If a specific video is requested, delegate to Encode_Attachment to get status for all formats.
			$video_formats_data = $encoder->get_all_formats_with_status();
		} else {
			// No specific video: return all defined formats with their default properties.
			$all_defined_formats = $this->options_manager->get_video_formats( $this->options['hide_video_formats'] );
			foreach ( $all_defined_formats as $format_id => $video_format_obj ) {
				$format_array                     = $video_format_obj->to_array();
				$format_array['status']           = 'defined'; // Indicate it's just a definition.
				$video_formats_data[ $format_id ] = $format_array;
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

		foreach ( $thumb_urls as $index => $url ) {
			$res                  = $thumbnails->save( $attachment_id, $post_name, $url, $index + 1 );
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
		$response   = $thumbnails->save_from_blob( $attachment_id, $post_name, $files['file'] );

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
	 * @return array The response from the save operation.
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
			$post_name = str_replace( 'singleurl_', '', $attachment_id );
		}

		$thumbnail_index = isset( $params['thumbnail_index'] ) ? intval( $params['thumbnail_index'] ) : false;

		$response = $thumbnails->save(
			$attachment_id,
			$post_name,
			$params['thumburl'],
			$thumbnail_index
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
	 * REST callback to get encoding queue information.
	 *
	 * If an ID is provided, it returns the formats for that specific job.
	 * Otherwise, it returns the entire encoding queue.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return array The encoding queue data.
	 */
	public function queue_get( \WP_REST_Request $request ) {
		return Debug_Logger::measure(
			'REST Endpoint: queue_get',
			function () use ( $request ) {
				$params = $request->get_params();
				if ( array_key_exists( 'attachment_id', $params ) ) {
					$encoder = new Encode\Encode_Attachment( $this->options_manager, $params['attachment_id'] );
					return $encoder->get_formats_array();
				} else {
					$cache_key = 'videopack_rest_queue_all';
					$cached    = get_transient( $cache_key );
					if ( false !== $cached ) {
						return $cached;
					}

					$controller = new Encode\Encode_Queue_Controller( $this->options_manager );
					$queue      = $controller->get_full_queue_array();

					set_transient( $cache_key, $queue, 15 ); // Cache for 15 seconds to throttle rapid polling
					return $queue;
				}
			}
		);
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

		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$controller = new Encode\Encode_Queue_Controller( $this->options_manager );
		$video_url  = $params['url'] ?? null;
		if ( empty( $video_url ) ) {
			return new \WP_Error( 'rest_invalid_param', esc_html__( 'Missing video URL.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}
		$args                      = array(
			'id'      => $attachment_id,
			'url'     => $video_url,
			'formats' => $formats_to_enqueue,
		);
		$response                  = $controller->enqueue_encodes( $args );
		$response['attachment_id'] = $attachment_id;

		// Check if any of the results have a 'failed' status
		$has_failures = false;
		foreach ( $response['results'] as $result ) {
			if ( isset( $result['status'] ) && 'failed' === $result['status'] ) {
				$has_failures = true;
				break;
			}
		}

		if ( $has_failures ) {
			return new \WP_Error(
				'enqueue_failed',
				__( 'One or more formats failed to enqueue.', 'video-embed-thumbnail-generator' ),
				array(
					'status'  => 400,
					'details' => $response['log'], // Send the detailed log back to the client
				)
			);
		}

		delete_transient( 'videopack_rest_queue_all' );

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
		delete_transient( 'videopack_rest_queue_all' );
		return new \WP_REST_Response( $response_data, 200 );
	}

	/**
	 * REST callback to remove an encoding queue job without deleting the video file.
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function queue_remove( \WP_REST_Request $request ) {
		$job_id = (int) $request->get_param( 'job_id' );
		if ( empty( $job_id ) ) {
			return new \WP_Error( 'rest_invalid_param', esc_html__( 'Missing job ID.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		$controller = new Encode\Encode_Queue_Controller( $this->options_manager );
		$result     = $controller->remove_job( $job_id ); // Assuming a new method remove_job

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		delete_transient( 'videopack_rest_queue_all' );

		return new \WP_REST_Response(
			array(
				'status'  => 'success',
				'message' => __( 'Job removed from queue.' ),
			),
			200
		);
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

		delete_transient( 'videopack_rest_queue_all' );
		return new \WP_REST_Response( array( 'status' => 'success' ), 200 );
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
	 * REST callback to control the encoding queue (play/pause).
	 *
	 * @param \WP_REST_Request $request Full details about the request.
	 * @return \WP_REST_Response|\WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function queue_control( \WP_REST_Request $request ) {
		$action     = $request->get_param( 'action' );
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
		$type = $request->get_param( 'type' ); // completed or all

		$encode_queue_controller = new Encode\Encode_Queue_Controller( $this->options_manager );
		$encode_queue_controller->clear_completed_queue( $type );

		delete_transient( 'videopack_rest_queue_all' );

		return new \WP_REST_Response(
			array(
				'status'  => 'success',
				// translators: %s is 'completed' or 'all'.
				'message' => sprintf( esc_html__( 'Queue cleared: %s jobs.', 'video-embed-thumbnail-generator' ), $type ),
			),
			200
		);
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
				return current_user_can( 'make_video_thumbnails' );
			case 'encoding':
				return current_user_can( 'encode_videos' );
			case 'all':
				return current_user_can( 'manage_options' ) && current_user_can( 'make_video_thumbnails' ) && current_user_can( 'encode_videos' );
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
		$parent_id = $request->get_param( 'parent_id' ) ? (int) $request->get_param( 'parent_id' ) : 0;
		$create    = $request->get_param( 'create' ) ? (bool) $request->get_param( 'create' ) : false;

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
}
