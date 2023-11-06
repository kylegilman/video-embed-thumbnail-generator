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
	protected $uploads;

	public function __construct() {
		$this->namespace = 'videopack/v1';
		$this->options   = kgvid_get_options();
		$this->uploads   = wp_upload_dir();
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
					'gallery_id'   => array(
						'type' => 'number',
					),
					'gallery_include' => array(
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
				'permission_callback' => function() {
					return current_user_can( 'manage_options' ) && current_user_can( 'edit_users' );
				},
			)
		);

		register_rest_route(
			$this->namespace,
			'/users',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'users' ),
				'permission_callback' => function() {
					return current_user_can( 'manage_options' );
				},
				'args'                => array(
					'capability' => array(
						'type' => 'string',
						'enum' => array(
							'make_video_thumbnails',
							'encode_videos',
							'edit_others_video_encodes',
						),
					),
				),
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
			)
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
		register_rest_route(
			$this->namespace,
			'/ffmpeg-test/(?P<format>\w+)',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'ffmpeg_test' ),
				'permission_callback' => function() {
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
					'src'           => array(
						'type' => 'string',
					),
					'poster'        => array(
						'type' => 'string',
					),
					'loop'          => array(
						'type' => array( 'string', 'boolean' ),
					),
					'autoplay'      => array(
						'type' => array( 'string', 'boolean' ),
					),
					'preload'       => array(
						'type' => 'string',
					),
					'width'         => array(
						'type' => array( 'string', 'number' ),
					),
					'height'        => array(
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

	public function defaults() {
		$defaults = kgvid_default_options_fn();
		return $defaults;
	}

	public function roles() {
		if ( ! function_exists( 'get_editable_roles' ) ) {
			require_once ABSPATH . 'wp-admin/includes/user.php';
		}
		$roles = get_editable_roles();
		return $roles;
	}

	public function users( \WP_REST_Request $request ) {
		$capability       = $request->get_param( 'capability' );
		$authorized_users = array();
		if ( is_array( $this->options['capabilities'] )
			&& array_key_exists( $capability, $this->options['capabilities'] )
		) {
			$users = get_users(
				array(
					'role__in' => array_keys( $this->options['capabilities'][ $capability ] ),
				)
			);
			if ( $users ) {
				foreach ( $users as $user ) {
					$authorized_users[ $user->user_login ] = $user->ID;
				}
			}
		}
		return $authorized_users;
	}

	public function formats( \WP_REST_Request $request ) {
		$params = $request->get_params();
		if ( array_key_exists( 'id', $params )
			&& get_post_type( $params['id'] ) === 'attachment'
		) {
			$encoder       = new encode\Encode_Attachment( $params['id'] );
			$video_formats = $encoder->get_available_formats();
			foreach ( $video_formats as $format => $format_info ) {
				$encode_info              = $encoder->get_encode_info( $format );
				$video_formats[ $format ] = array_merge( $format_info, $encode_info );
			}
		} else {
			$unsorted_video_formats = kgvid_video_formats();
			foreach ( $unsorted_video_formats as $format => $format_info ) {
				$format_info['format'] = $format;
				$video_formats[]       = $format_info;
			}
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
			'meta_query' => array(
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

		$response   = array();
		$query_atts = kgvid_shortcode_atts( $request->get_params() );

		$args = array(
			'post_type'      => 'attachment',
			'orderby'        => $query_atts['gallery_orderby'],
			'order'          => $query_atts['gallery_order'],
			'post_mime_type' => 'video',
			'posts_per_page' => $query_atts['gallery_per_page'],
			'paged'          => $request->get_param( 'page_number' ),
			'post_status'    => 'published',
			'post_parent'    => $query_atts['gallery_id'],
			'meta_query' => array(
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

		if ( ! empty( $query_atts['gallery_exclude'] ) ) {
			$exclude_arr = wp_parse_id_list( $query_atts['gallery_exclude'] );
			if ( ! empty( $exclude_arr ) ) {
				$args['post__not_in'] = $exclude_arr;
			}
		}

		if ( ! empty( $query_atts['gallery_include'] ) ) {
			$include_arr = wp_parse_id_list( $query_atts['gallery_include'] );
			if ( ! empty( $include_arr ) ) {
				$args['post__in'] = $include_arr;
				if ( $args['orderby'] == 'menu_order ID' ) {
					$args['orderby'] = 'post__in'; // sort by order of IDs in the gallery_include parameter
				}
				unset( $args['post_parent'] );
			}
		}

		$attachments = new \WP_Query( $args );

		if ( $attachments->have_posts() ) {

			$json_posts = array_map(
				function( $post ) {
					$post_data                         = wp_prepare_attachment_for_js( $post );
					$post_data['image']['id']          = get_post_thumbnail_id( $post );
					$post_data['image']['srcset']      = wp_get_attachment_image_srcset( $post_data['image']['id'] );
					$post_data['videopack']['sources'] = kgvid_prepare_sources( wp_get_attachment_url( $post->ID ), $post->ID );
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

	public function ffmpeg_test( \WP_REST_Request $request ) {
		$format = $request->get_param( 'format' );
		$rotate = $request->get_param( 'rotate' );
		if ( $rotate === true ) {
			$url = plugin_dir_path( __DIR__ ) . 'images/sample-video-rotated-h264.mp4';
		} else {
			$url = plugin_dir_path( __DIR__ ) . 'images/sample-video-h264.mp4';
		}
		$attachment    = new encode\Encode_Attachment( 'sample', $url );
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
			'sources' => kgvid_prepare_sources( $url, $post['id'] ),
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
}
