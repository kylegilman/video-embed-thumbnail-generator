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
			$presets[] = array_merge(
				$data,
				array(
					'id'            => (string) $id,
					'attachment_id' => $data['id'] ?? null,
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

		if ( is_wp_error( $result ) ) {
			return $result;
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
