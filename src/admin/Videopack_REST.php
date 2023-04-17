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

namespace Videopack\admin;

class Videopack_REST extends \WP_REST_Controller {

	protected $namespace;
	protected $options;

	public function __construct() {
		$this->namespace = 'videopack/v1';
		$this->options   = kgvid_get_options();
	}

	public function register_routes() {

		register_rest_route(
			$this->namespace,
			'/settings',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'settings' ),
				'permission_callback' => '__return_true',
			),
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
			),
		);

		register_rest_route(
			$this->namespace,
			'/thumb',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
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
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'thumb_generate' ),
					'permission_callback' => function() {
						return ( current_user_can( 'make_video_thumbnails' ) && $this->options['ffmpeg_exists'] === true );
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
			$this->namespace,
			'/sources',
			array(
				'methods'             => \WP_REST_Server::READABLE,
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
			$this->namespace,
			'/checkboxes',
			array(
				'methods'             => \WP_REST_Server::READABLE,
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
			$this->namespace,
			'/queue/(?P<id>\w+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'queue_get' ),
					'permission_callback' => function() {
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
					'permission_callback' => function() {
						return ( current_user_can( 'encode_videos' ) && $this->options['ffmpeg_exists'] === true );
					},
					'args'                => array(
						'url' => array(
							'type' => 'string',
						),
						'id' => array(
							'type' => 'number',
						),
						'formats' => array(
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
			if ( array_key_exists( $unsafe_option, $this->options ) ) {
				unset( $this->options[ $unsafe_option ] );
			}
		}
		foreach ( $this->options as $key => $value ) {
			if ( $value === true ) {
				$this->options[ $key ] = true;
			}
		}
		return $this->options;
	}

	public function formats( \WP_REST_Request $request ) {
		$params = $request->get_params();
		if ( array_key_exists( 'id', $params ) ) {
			$encoder       = new encode\Encode_Attachment( $params['id'] );
			$video_formats = $encoder->get_available_formats();
			foreach ( $video_formats as $format => $format_info ) {
				$encode_info              = $encoder->get_encode_info( $format );
				$video_formats[ $format ] = array_merge( $format_info, $encode_info );
			}
		} else {
			$video_formats = kgvid_video_formats();
		}
		$video_formats = $this->clean_array( $video_formats );
		return $video_formats;
	}

	public function thumb_generate( \WP_REST_Request $request ) {

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

	public function thumb_save( \WP_REST_Request $request ) {

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

	public function video_sources( \WP_REST_Request $request ) {

		$url = $request->get_param( 'url' );
		if ( ! $url ) {
			return new \WP_Error( 'rest_invalid_param', esc_html__( 'Missing Video Url.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}
		$post_id     = $request->get_param( 'postId' );
		$source_info = kgvid_prepare_sources( $url, $post_id );

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

		/* $params             = $request->get_params();
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

		return $video_encode_queue; */

		$params = $request->get_params();
		if ( array_key_exists( 'id', $params ) ) {
			$encoder = new encode\Encode_Attachment( $params['id'] );
			return $encoder->get_formats_array();
		} else {
			$controller = new encode\Encode_Queue_Controller();
			return $controller->get_full_queue_array();
		}
	}

	public function queue_edit( \WP_REST_Request $request ) {

		/* $params   = $request->get_params();
		$response = array();

		$response = kgvid_enqueue_videos(
			$params['attachmentID'],
			$params['movieurl'],
			$params['encodeformats'],
			$params['parent_id'],
		);
		kgvid_encode_videos();
		return $response; */

		$params     = $request->get_params();
		$controller = new encode\Encode_Queue_Controller();
		$args       = array(
			'id'      => $params['id'],
			'url'     => $params['url'],
			'formats' => $params['formats'],
		);
		$response   = $controller->add_to_queue( $args );
		return $response;
	}
}
