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
	 * Returns an array of actions to subscribe to.
	 *
	 * Play/view counting fires on every video play — frequent enough that
	 * it uses admin-ajax rather than a REST route (see ajax_count_play()),
	 * so it's registered here rather than via register_routes().
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array_merge(
			parent::get_actions(),
			array(
				array(
					'hook'     => 'wp_ajax_count_play',
					'callback' => 'ajax_count_play',
				),
				array(
					'hook'     => 'wp_ajax_nopriv_count_play',
					'callback' => 'ajax_count_play',
				),
			)
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
				'permission_callback' => array( $this, 'public_permissions' ),
				'args'                => $this->get_gallery_args(),
			)
		);

		register_rest_route(
			$this->namespace,
			'/player',
			array(
				// A safety-net fallback only — the lightbox's normal path
				// pre-embeds a player built by this exact same shared
				// function server-side, so no round trip here in the common
				// case. Always built from global Player Settings (never a
				// per-instance template), so the only real input is `id`.
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'video_player' ),
				'permission_callback' => array( $this, 'public_permissions' ),
				'args'                => array(
					'id' => array( 'type' => array( 'number', 'string' ) ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/sources',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'video_sources' ),
				'permission_callback' => array( $this, 'public_permissions' ),
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
				'permission_callback' => array( $this, 'public_permissions' ),
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
			'/presets',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'presets_get' ),
				'permission_callback' => 'is_user_logged_in',
			)
		);

		register_rest_route(
			$this->namespace,
			'/global-styles',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_global_styles' ),
				'permission_callback' => 'is_user_logged_in',
			)
		);

		$this->add_data_to_rest_response();
	}

	/**
	 * Callback to return compiled global theme styles for player previews.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_global_styles() {
		$css = function_exists( 'wp_get_global_stylesheet' ) ? (string) wp_get_global_stylesheet() : '';
		return new \WP_REST_Response( array( 'css' => $css ), 200 );
	}

	/**
	 * REST callback for assembling a standalone video player.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function video_player( \WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );
		if ( ! $id ) {
			return new \WP_Error( 'rest_invalid_param', 'Missing Video ID.', array( 'status' => 400 ) );
		}

		$first_child = \Videopack\Common\Video_Discovery::get_first_video_child( $id );
		$post_id     = $first_child ? $first_child : (int) $id;
		$source      = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry );

		if ( ! $source || ! $source->exists() ) {
			return new \WP_Error( 'rest_source_not_found', 'Video source could not be found.', array( 'status' => 404 ) );
		}

		// This endpoint is only ever a safety-net fallback — the normal path
		// pre-embeds a player built by this exact same shared function (see
		// Blocks::render_collection()/render_thumbnail()), so opening the
		// lightbox doesn't need a round trip here at all. No collection
		// instance is known here, so no design overrides — global Player
		// Settings only, same as the pre-embedded path defaults to anyway.
		$html = \Videopack\Frontend\Modular_Renderer::render_standalone_player_assembly(
			$post_id,
			array(),
			$this->options
		);

		$response = array( 'html' => $html );

		return apply_filters( 'videopack_rest_video_player', new \WP_REST_Response( $response, 200 ), $request );
	}

	/**
	 * REST callback for video gallery.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function video_gallery( \WP_REST_Request $request ) {
		$shortcode    = new \Videopack\Frontend\Shortcode( $this->options, $this->format_registry );
		$gallery      = new \Videopack\Frontend\Gallery( $this->options, $this->format_registry );
		$gallery_atts = (array) $shortcode->atts( $request->get_params() );

		$page   = (int) ( $request->get_param( 'page_number' ) ? $request->get_param( 'page_number' ) : 1 );
		$layout = (string) $request->get_param( 'layout' );
		if ( ! $layout ) {
			$layout = $gallery_atts['layout'] ?? ( ( isset( $gallery_atts['gallery'] ) && true === $gallery_atts['gallery'] ) ? 'gallery' : 'list' );
		}
		$skip_html = filter_var( $request->get_param( 'skip_html' ), FILTER_VALIDATE_BOOLEAN );

		$result = $gallery->collection_page( $page, $gallery_atts, $layout, $skip_html );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
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
	 * Admin-ajax callback to count a video play/view event, for both
	 * logged-in and logged-out visitors (wp_ajax_count_play /
	 * wp_ajax_nopriv_count_play). Deliberately not a REST route: this
	 * fires on every video play, and admin-ajax skips rest_api_init and
	 * the REST server's route-matching/schema/permission-callback
	 * overhead, while still running at the same point in the request
	 * lifecycle (after `init`) as a REST call would — so any other
	 * security/rate-limiting plugin on the site gets the same chance to
	 * inspect the request first.
	 */
	public function ajax_count_play() {
		check_ajax_referer( 'videopack_count_play', 'security' );

		$attachment_id = isset( $_POST['attachment_id'] ) ? absint( wp_unslash( $_POST['attachment_id'] ) ) : 0;
		if ( ! $attachment_id || 'attachment' !== get_post_type( $attachment_id ) ) {
			wp_send_json_error( array( 'message' => 'Invalid attachment ID.' ), 400 );
		}

		$video_event = isset( $_POST['video_event'] ) ? sanitize_text_field( wp_unslash( $_POST['video_event'] ) ) : '';
		$show_views  = ! empty( $_POST['show_views'] );

		$meta_manager = new \Videopack\Admin\Attachment_Meta( $this->options, $attachment_id );
		$updated_meta = $meta_manager->increment_video_stat( $video_event );

		$response = array( 'status' => 'success' );
		if ( $show_views && isset( $updated_meta['starts'] ) ) {
			$response['views'] = \Videopack\Common\I18n::format_view_count( (int) $updated_meta['starts'] );
		}
		wp_send_json_success( apply_filters( 'videopack_count_play_response', $response, $attachment_id, $video_event ) );
	}

	/**
	 * REST callback to get presets.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function presets_get( \WP_REST_Request $request ) {
		$presets     = array();
		$all_formats = (array) $this->format_registry->get_video_formats( true );
		foreach ( $all_formats as $id => $obj ) {
			$data      = (array) $obj->to_array();
			$presets[] = array_merge(
				$data,
				array(
					'id'            => (string) $id,
					'attachment_id' => null,
				)
			);
		}
				/**
		 * Filters the REST response listing active resolution/codec presets.
		 *
		 * @since 5.0.0
		 *
		 * @param \WP_REST_Response $response The REST response.
		 * @param \WP_REST_Request  $request  The REST request.
		 */
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

		$response = array(
			'srcset'        => (string) wp_get_attachment_image_srcset( $post_id ),
			'sources'       => $player->get_flat_sources(),
			'source_groups' => $player->get_sources(),
			'poster'        => $source->get_poster(),
			'views'         => $source->get_views(),
			'duration'      => $source->get_duration(),
		);

		return $response;
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
				$data          = $result->get_data();
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
			'collectionId'          => array( 'type' => 'string' ),
			'collection_post_id'    => array( 'type' => array( 'number', 'null' ) ),
			'id'                    => array( 'type' => array( 'number', 'null' ) ),
			'prioritizePostData'    => array( 'type' => 'boolean' ),
		);
	}
}
