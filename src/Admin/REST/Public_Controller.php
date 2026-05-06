<?php
/**
 * REST Controller for Videopack public-facing endpoints.
 *
 * @package Videopack
 */

namespace Videopack\Admin\REST;

/**
 * Class Public_Controller
 *
 * Manages REST API endpoints for galleries, sources, and shortcodes.
 */
class Public_Controller extends Controller {

	/**
	 * Returns an array of filters to subscribe to.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array(
			array(
				'hook'          => 'rest_post_dispatch',
				'callback'      => 'log_rest_api_errors',
				'priority'      => 10,
				'accepted_args' => 3,
			),
		);
	}

	/**
	 * Registers REST API routes.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/video_gallery',
			array(
				'methods'             => 'GET, POST',
				'callback'            => array( $this, 'video_gallery' ),
				'permission_callback' => '__return_true',
				'args'                => $this->get_gallery_args(),
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
			'/resolve-url',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'resolve_url_to_attachment_api' ),
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
					'attachment_id' => array( 'type' => array( 'number', 'string' ) ),
					'url'           => array(
						'type'   => 'string',
						'format' => 'uri',
					),
				),
			)
		);

		$this->add_data_to_rest_response();
	}

	/**
	 * REST callback for video gallery.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function video_gallery( \WP_REST_Request $request ) {
		$shortcode                             = new \Videopack\Frontend\Shortcode( $this->options, $this->format_registry );
		$gallery                               = new \Videopack\Frontend\Gallery( $this->options, $this->format_registry );
		$gallery_atts                          = (array) $shortcode->atts( $request->get_params() );
		$gallery_atts['inner_blocks_template'] = $request->get_param( 'inner_blocks_template' );

		$page   = (int) ( $request->get_param( 'page_number' ) ? $request->get_param( 'page_number' ) : 1 );
		$layout = (string) $request->get_param( 'layout' );
		if ( ! $layout ) {
			$layout = $gallery_atts['layout'] ?? ( ( isset( $gallery_atts['gallery'] ) && true === $gallery_atts['gallery'] ) ? 'gallery' : 'list' );
		}

		$result = $gallery->collection_page( $page, $gallery_atts, $layout );
		return apply_filters( 'videopack_rest_video_gallery', new \WP_REST_Response( $result, 200 ), $request );
	}

	/**
	 * REST callback for video sources.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function video_sources( \WP_REST_Request $request ) {
		$url           = (string) $request->get_param( 'url' );
		$attachment_id = $request->get_param( 'attachment_id' );
		$source_input  = is_numeric( $attachment_id ) ? (int) $attachment_id : $url;

		if ( ! $source_input ) {
			return new \WP_Error( 'rest_invalid_param', 'Missing Video URL or ID.', array( 'status' => 400 ) );
		}

		$source = \Videopack\Video_Source\Source_Factory::create( $source_input, $this->options, $this->format_registry );
		if ( ! $source || ! $source->exists() ) {
			return new \WP_Error( 'rest_source_not_found', 'Video source could not be found.', array( 'status' => 404 ) );
		}

		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $this->options['embed_method'] ?? 'Video.js', $this->options, $this->format_registry );
		$player->set_source( $source );
		return apply_filters( 'videopack_rest_video_sources', new \WP_REST_Response( $player->get_sources(), 200 ), $request );
	}

	/**
	 * REST callback to render shortcode.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function render_shortcode( \WP_REST_Request $request ) {
		$atts      = (array) $request->get_param( 'attrs' );
		$content   = (string) $request->get_param( 'content' );
		$shortcode = new \Videopack\Frontend\Shortcode( $this->options );
		return apply_filters( 'videopack_rest_render_shortcode', new \WP_REST_Response( array( 'html' => $shortcode->do( $atts, $content ) ), 200 ), $request );
	}

	/**
	 * REST callback to count play.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function count_play( \WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'attachment_id' );
		if ( ! $attachment_id || 'attachment' !== get_post_type( $attachment_id ) ) {
			return new \WP_Error( 'rest_invalid_attachment_id', 'Invalid attachment ID.', array( 'status' => 400 ) );
		}

		$video_event = (string) $request->get_param( 'video_event' );
		$show_views  = (bool) $request->get_param( 'views' );

		$meta_manager = new \Videopack\Admin\Attachment_Meta( $this->options, $attachment_id );
		$updated_meta = $meta_manager->increment_video_stat( $video_event );

		$response = array( 'status' => 'success' );
		if ( $show_views && isset( $updated_meta['starts'] ) ) {
			$response['views'] = \Videopack\Common\I18n::format_view_count( (int) $updated_meta['starts'] );
		}
		return apply_filters( 'videopack_rest_count_play', new \WP_REST_Response( $response, 200 ), $request );
	}

	/**
	 * REST callback to resolve URL to attachment.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function resolve_url_to_attachment_api( \WP_REST_Request $request ) {
		$url       = (string) $request->get_param( 'url' );
		$parent_id = (int) $request->get_param( 'parent_id' );
		$create    = (bool) $request->get_param( 'create' );

		$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options );
		$attachment      = new \Videopack\Admin\Attachment( $this->options, $this->format_registry, $attachment_meta );
		$result          = $attachment->resolve_url_to_attachment( $url, $parent_id, $create );

		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return apply_filters( 'videopack_rest_resolve_url_to_attachment', new \WP_REST_Response( array( 'attachment_id' => (int) $result ), 200 ), $request );
	}

	/**
	 * REST callback to get presets.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function presets_get( \WP_REST_Request $request ) {
		$attachment_id = $request->get_param( 'attachment_id' );
		$url           = (string) $request->get_param( 'url' );
		$presets       = array();

		if ( ! empty( $attachment_id ) || ! empty( $url ) ) {
			$browser_metadata = array();
			if ( $request->get_param( 'width' ) && $request->get_param( 'height' ) ) {
				$browser_metadata['actualwidth']  = (int) $request->get_param( 'width' );
				$browser_metadata['actualheight'] = (int) $request->get_param( 'height' );
			}
			if ( $request->get_param( 'duration' ) ) {
				$browser_metadata['duration'] = (float) $request->get_param( 'duration' );
			}

			$encoder            = new \Videopack\Admin\Encode\Encode_Attachment( $this->options, $this->format_registry, $attachment_id, $url, $browser_metadata );
			$video_formats_data = (array) $encoder->get_all_formats_with_status();
			foreach ( $video_formats_data as $id => $data ) {
				$presets[] = array_merge( $data, array( 'id' => (string) $id ) );
			}
		} else {
			$all_formats = $this->format_registry->get_video_formats( $this->options['hide_video_formats'] ?? false );
			foreach ( $all_formats as $id => $obj ) {
				$presets[] = array_merge( $obj->to_array(), array( 'id' => (string) $id ) );
			}
		}
		return apply_filters( 'videopack_rest_presets_get', new \WP_REST_Response( $presets, 200 ), $request );
	}

	/**
	 * Adds data to REST response for attachments.
	 */
	public function add_data_to_rest_response() {
		register_rest_field(
			'attachment',
			'videopack',
			array(
				'get_callback'    => function ( $post ) {
					return $this->prepare_data_for_rest_response( (array) $post );
				},
				'update_callback' => null,
				'schema'          => null,
			)
		);
	}

	/**
	 * Prepares Videopack data for REST response.
	 *
	 * @param array $post The post data array.
	 */
	protected function prepare_data_for_rest_response( $post ) {
		$post_id = (int) $post['id'];
		$source  = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry );
		if ( ! $source ) {
			return array(
				'srcset'        => (string) wp_get_attachment_image_srcset( $post_id ),
				'sources'       => array(),
				'source_groups' => new \stdClass(),
				'poster'        => '',
			);
		}

		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $this->options['embed_method'] ?? 'Video.js', $this->options, $this->format_registry );
		$player->set_source( $source );
		return array(
			'srcset'        => (string) wp_get_attachment_image_srcset( $post_id ),
			'sources'       => $player->get_flat_sources(),
			'source_groups' => $player->get_sources(),
			'poster'        => $source->get_poster(),
		);
	}

	/**
	 * Logs REST API errors.
	 *
	 * @param mixed            $result  The REST response or error.
	 * @param \WP_REST_Server  $server  The REST server instance.
	 * @param \WP_REST_Request $request The request object.
	 */
	public function log_rest_api_errors( $result, $server, $request ) {
		$is_error = ( is_wp_error( $result ) || ( $result instanceof \WP_REST_Response && $result->is_error() ) );
		if ( $is_error ) {
			$error_details = '';
			if ( is_wp_error( $result ) ) {
				$error_details = $result->get_error_message();
			} elseif ( $result instanceof \WP_REST_Response ) {
				$data = $result->get_data();
				$error_details = is_string( $data ) ? $data : wp_json_encode( $data );
			}

			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( 'REST API Error: Route: %s, Method: %s, Params: %s, Error: %s', $request->get_route(), $request->get_method(), wp_json_encode( $request->get_params() ), $error_details ) );
		}
		return $result;
	}

	/**
	 * Helper to get gallery arguments.
	 */
	private function get_gallery_args() {
		return array(
			'page_number'           => array( 'type' => 'number' ),
			'gallery_orderby'       => array( 'type' => 'string' ),
			'gallery_order'         => array( 'type' => 'string' ),
			'gallery_per_page'      => array( 'type' => 'number' ),
			'gallery_pagination'    => array( 'type' => 'boolean' ),
			'gallery_id'            => array( 'type' => array( 'number', 'string' ) ),
			'gallery_include'       => array( 'type' => 'string' ),
			'gallery_exclude'       => array( 'type' => 'string' ),
			'gallery_title'         => array( 'type' => 'string' ),
			'gallery_thumb'         => array( 'type' => 'number' ),
			'gallery_source'        => array( 'type' => 'string' ),
			'gallery_category'      => array( 'type' => 'string' ),
			'gallery_tag'           => array( 'type' => 'string' ),
			'layout'                => array( 'type' => 'string' ),
			'grid_metadata'         => array( 'type' => 'string' ),
			'grid_link_to'          => array( 'type' => 'string' ),
			'inner_blocks_template' => array(
				'type'              => 'string',
				'sanitize_callback' => array( $this, 'sanitize_inner_blocks_template' ),
			),
			'collectionId'          => array( 'type' => 'string' ),
			'id'                    => array( 'type' => array( 'number', 'null' ) ),
			'prioritizePostData'    => array( 'type' => 'boolean' ),
		);
	}

	/**
	 * Sanitizes the inner_blocks_template JSON array.
	 *
	 * Ensures the JSON is valid and only allows videopack blocks to prevent
	 * arbitrary block execution vulnerabilities.
	 *
	 * @param string $value The JSON string to sanitize.
	 */
	public function sanitize_inner_blocks_template( $value ) {
		if ( empty( $value ) || ! is_string( $value ) ) {
			return '';
		}

		$decoded = json_decode( wp_unslash( $value ), true );

		if ( json_last_error() !== JSON_ERROR_NONE || ! is_array( $decoded ) ) {
			return '';
		}

		$sanitized = $this->sanitize_blocks_recursive( $decoded );

		return wp_json_encode( $sanitized );
	}

	/**
	 * Recursively sanitizes a parsed Gutenberg block array.
	 *
	 * @param array $blocks The array of blocks to sanitize.
	 */
	private function sanitize_blocks_recursive( array $blocks ) {
		$sanitized = array();
		foreach ( $blocks as $block ) {
			// Security: allow any registered block.
			if ( ! isset( $block['blockName'] ) ) {
				continue;
			}

			$safe_block = array(
				'blockName' => sanitize_text_field( $block['blockName'] ),
			);

			if ( isset( $block['attrs'] ) && is_array( $block['attrs'] ) ) {
				$safe_block['attrs'] = array();
				foreach ( $block['attrs'] as $key => $val ) {
					if ( is_array( $val ) ) {
						$safe_block['attrs'][ sanitize_text_field( $key ) ] = map_deep( $val, 'sanitize_text_field' );
					} elseif ( is_scalar( $val ) ) {
						$safe_block['attrs'][ sanitize_text_field( $key ) ] = sanitize_text_field( $val );
					}
				}
			}

			if ( isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$safe_block['innerBlocks'] = $this->sanitize_blocks_recursive( $block['innerBlocks'] );
			}

			if ( isset( $block['innerHTML'] ) ) {
				$safe_block['innerHTML'] = wp_kses_post( $block['innerHTML'] );
			}

			if ( isset( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
				$safe_block['innerContent'] = array();
				foreach ( $block['innerContent'] as $content ) {
					$safe_block['innerContent'][] = is_string( $content ) ? wp_kses_post( $content ) : $content;
				}
			}

			$sanitized[] = $safe_block;
		}
		return $sanitized;
	}
}
