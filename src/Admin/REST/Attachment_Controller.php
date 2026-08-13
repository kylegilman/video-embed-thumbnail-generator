<?php
/**
 * REST Controller for Videopack attachment operations.
 *
 * @package Videopack
 */

namespace Videopack\Admin\REST;

/**
 * Class Attachment_Controller
 *
 * Manages REST API endpoints for resolving, checking format status, and deleting attachment formats.
 */
class Attachment_Controller extends Controller {

	/**
	 * Registers REST API routes for attachments.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/attachment/register-url',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'register_url' ),
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
					'create'    => array(
						'type'     => 'boolean',
						'required' => false,
						'default'  => false,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/attachment/(?P<id>\d+)/formats',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'formats_get' ),
				'permission_callback' => function () {
					return current_user_can( 'upload_files' );
				},
				'args'                => array(
					'id'  => array(
						'type'     => 'integer',
						'required' => true,
					),
					'url' => array(
						'type'     => 'string',
						'required' => false,
						'format'   => 'uri',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/attachment/(?P<id>\d+)/format/(?P<format_id>[a-zA-Z0-9_-]+)',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_format_by_id_rest' ),
				'permission_callback' => array( $this, 'can_encode_videos' ),
				'args'                => array(
					'id'        => array(
						'type'     => 'integer',
						'required' => true,
					),
					'format_id' => array(
						'type'     => 'string',
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/attachment/(?P<id>\d+)/cache',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'clear_cache_rest' ),
				'permission_callback' => array( $this, 'can_encode_videos' ),
				'args'                => array(
					'id'  => array(
						'type'     => 'integer',
						'required' => true,
					),
					'url' => array(
						'type'     => 'string',
						'required' => false,
						'format'   => 'uri',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/attachment/(?P<id>\d+)/source-status',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'source_status_rest' ),
				'permission_callback' => function () {
					return current_user_can( 'upload_files' );
				},
				'args'                => array(
					'id'  => array(
						'type'     => 'integer',
						'required' => true,
					),
					'url' => array(
						'type'     => 'string',
						'required' => false,
						'format'   => 'uri',
					),
				),
			)
		);
	}

	/**
	 * REST callback to resolve/register URL to attachment.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function register_url( \WP_REST_Request $request ) {
		$url       = (string) $request->get_param( 'url' );
		$parent_id = (int) $request->get_param( 'parent_id' );
		$create    = (bool) $request->get_param( 'create' );

		$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options );
		$attachment      = new \Videopack\Admin\Attachment( $this->options, $this->format_registry, $attachment_meta );
		$result          = $attachment->resolve_url_to_attachment( $url, $parent_id, $create );

		if ( is_wp_error( $result ) ) {
			return $result;
		}
				/**
		 * Filters the REST response after registering an external video URL.
		 *
		 * @since 5.0.0
		 *
		 * @param \WP_REST_Response $response The REST response.
		 * @param \WP_REST_Request  $request  The REST request.
		 */
		return apply_filters( 'videopack_rest_register_url', new \WP_REST_Response( array( 'attachment_id' => (int) $result ), 200 ), $request );
	}

	/**
	 * REST callback to get attachment formats and statuses.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function formats_get( \WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'id' );
		$url           = (string) $request->get_param( 'url' );
		$presets       = array();

		// Nothing identifies a source at all -- Encode_Attachment/Encode_Info
		// would go on to call Source_Factory::create() with an empty value,
		// which falls through to Source_Placeholder and throws.
		if ( ! $attachment_id && ! $url ) {
			return new \WP_Error( 'rest_invalid_param', 'Missing attachment ID or URL.', array( 'status' => 400 ) );
		}

		// Video_Metadata (constructed inside Encode_Attachment below) runs
		// `ffmpeg -i <url>` directly against whichever of these resolves to
		// the encode input -- reject a playlist/manifest here too, same as
		// Job_Controller::jobs_create(), since this is a separate path to
		// the same ffmpeg invocation and gated by the weaker upload_files
		// capability rather than encode_videos.
		if ( self::is_playlist_manifest_url( $url ) || self::is_playlist_manifest_url( (string) wp_get_attachment_url( $attachment_id ) ) ) {
			return new \WP_Error( 'unsupported_input_type', 'Playlist/manifest URLs (HLS, DASH, etc.) are not supported as encode input.', array( 'status' => 400 ) );
		}

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
			$presets[] = $this->redact_encode_error_for_response(
				array_merge(
					$data,
					array(
						'id'            => (string) $id,
						'attachment_id' => $data['id'] ?? null,
					)
				)
			);
		}
				/**
		 * Filters the REST response returning list of transcoded format video links.
		 *
		 * @since 5.0.0
		 *
		 * @param \WP_REST_Response $response The REST response.
		 * @param \WP_REST_Request  $request  The REST request.
		 */
		return apply_filters( 'videopack_rest_attachment_formats_get', new \WP_REST_Response( $presets, 200 ), $request );
	}

	/**
	 * REST callback to clear cached remote-URL existence-check results for
	 * all of a source's formats -- see Encode_Attachment::clear_cached_url_checks().
	 * Unlike formats_get(), this never constructs Video_Metadata (no
	 * ffmpeg invocation), since Encode_Attachment::get_video_metadata() is
	 * never called on this path -- only the per-format Encode_Info lookups
	 * clear_cached_url_checks() itself performs.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response
	 */
	public function clear_cache_rest( \WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'id' );
		$url           = (string) $request->get_param( 'url' );

		$encoder = new \Videopack\Admin\Encode\Encode_Attachment( $this->options, $this->format_registry, $attachment_id, $url );
		$cleared = $encoder->clear_cached_url_checks();

		/**
		 * Filters the REST response after clearing a source's cached
		 * remote-URL existence checks.
		 *
		 * @since 5.0.0
		 *
		 * @param \WP_REST_Response $response The REST response.
		 * @param \WP_REST_Request  $request  The REST request.
		 */
		return apply_filters(
			'videopack_rest_attachment_clear_cache',
			new \WP_REST_Response(
				array(
					'success' => true,
					'cleared' => $cleared,
				),
				200
			),
			$request
		);
	}

	/**
	 * REST callback to check whether a source's own master-URL
	 * reachability check (Source_Url::set_exists(), which gates whether
	 * Player::set_sources() renders a player at all) is currently cached --
	 * kept separate from formats_get()'s response (which is about encoded
	 * alternate formats, a different concern) rather than adding a field
	 * there.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response
	 */
	public function source_status_rest( \WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'id' );
		$url           = (string) $request->get_param( 'url' );

		// Nothing identifies a source at all -- Source_Factory::create()
		// would fall through to Source_Placeholder, whose constructor
		// throws on an empty source.
		$cached = false;
		if ( '' !== $url || $attachment_id > 0 ) {
			// Mirrors Player::init_source_from_atts()'s own precedence (a
			// populated URL over an attachment ID), since that's what a real
			// page load resolves this source to.
			$source = \Videopack\Video_Source\Source_Factory::create(
				'' !== $url ? $url : $attachment_id,
				$this->options,
				$this->format_registry
			);

			$cached = $source instanceof \Videopack\Video_Source\Source_Url
				&& \Videopack\Video_Source\Video_Source_Finder::has_cached_url_check( $source->get_url() );
		}

		/**
		 * Filters the REST response reporting a source's cached master-URL
		 * reachability-check status.
		 *
		 * @since 5.0.0
		 *
		 * @param \WP_REST_Response $response The REST response.
		 * @param \WP_REST_Request  $request  The REST request.
		 */
		return apply_filters(
			'videopack_rest_attachment_source_status',
			new \WP_REST_Response( array( 'url_check_cached' => $cached ), 200 ),
			$request
		);
	}

	/**
	 * REST callback to delete a specific format by ID.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function delete_format_by_id_rest( \WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'id' );
		$format_id     = (string) $request->get_param( 'format_id' );

		if ( ! $attachment_id || ! $format_id ) {
			return new \WP_Error( 'rest_invalid_param', 'Missing attachment ID or format ID.', array( 'status' => 400 ) );
		}

		$encoder = new \Videopack\Admin\Encode\Encode_Attachment( $this->options, $this->format_registry, $attachment_id );
		$result  = $encoder->delete_format_by_id( $format_id );

		if ( ! $result ) {
			return new \WP_Error( 'rest_delete_failed', 'Failed to delete the specified format or permission denied.', array( 'status' => 500 ) );
		}

				/**
		 * Filters the REST response after deleting a specific video format attachment.
		 *
		 * @since 5.0.0
		 *
		 * @param \WP_REST_Response $response The REST response.
		 * @param \WP_REST_Request  $request  The REST request.
		 */
		return apply_filters( 'videopack_rest_delete_format_by_id', new \WP_REST_Response( array( 'success' => $result ), 200 ), $request );
	}
}
