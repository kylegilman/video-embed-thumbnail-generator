<?php
/**
 * REST Controller for Videopack thumbnails.
 *
 * @package Videopack
 */

namespace Videopack\Admin\REST;

/**
 * Class Thumbnail_Controller
 *
 * Manages REST API endpoints for video thumbnails.
 */
class Thumbnail_Controller extends Controller {

	/**
	 * Registers REST API routes for thumbnails.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/thumbs',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'thumb_save' ),
					'permission_callback' => array( $this, 'can_make_thumbnails' ),
					'args'                => array(
						'attachment_id' => array(
							'type'     => array( 'number', 'string' ),
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
				),
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'thumb_generate' ),
					'permission_callback' => function () {
						$ffmpeg_exists = (bool) $this->options['ffmpeg_exists'] && 'notinstalled' !== $this->options['ffmpeg_exists'];
						$is_cloud_ready = apply_filters(
							/** This filter is documented in src/Admin/Ui.php */
							'videopack_transcoding_service_ready',
							false
						);
						return (bool) ( $this->can_make_thumbnails() && ( apply_filters(
							/** This filter is documented in src/Admin/Options.php */
							'videopack_ffmpeg_exists',
							$ffmpeg_exists
						) || $is_cloud_ready ) );
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
				'permission_callback' => array( $this, 'can_make_thumbnails' ),
				'args'                => array(
					'attachment_id'   => array(
						'type'     => 'number',
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
					'post_name'       => array(
						'type'     => 'string',
						'required' => true,
					),
					'featured'        => array(
						'type'     => 'boolean',
						'required' => false,
					),
					'set_poster'      => array(
						'type'     => 'boolean',
						'required' => false,
						'default'  => true,
					),
					'filename_suffix' => array(
						'type'     => 'string',
						'required' => false,
						'default'  => '_thumb',
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
				'permission_callback' => array( $this, 'can_make_thumbnails' ),
			)
		);
	}

	/**
	 * Verifies the current user can edit the attachment and, if applicable,
	 * the post whose featured image would be set (either an explicit
	 * parent_id or the attachment's own post_parent). set_post_thumbnail()
	 * performs no capability check of its own, and the blanket
	 * can_make_thumbnails()/can_manage_options() permission_callback on
	 * these routes isn't scoped to a specific post.
	 *
	 * @param int  $attachment_id       The attachment ID.
	 * @param int  $parent_id           Optional. An explicit parent post ID.
	 * @param bool $check_parent_target Whether to also check the resolved
	 *                                   parent-post target; skip for endpoints
	 *                                   that never set a parent's thumbnail.
	 * @return true|\WP_Error
	 */
	protected function ensure_can_set_thumbnail( int $attachment_id, int $parent_id = 0, bool $check_parent_target = true ) {
		if ( ! current_user_can( 'edit_post', $attachment_id ) ) {
			return new \WP_Error( 'rest_cannot_edit', __( 'You do not have permission to edit this attachment.', 'video-embed-thumbnail-generator' ), array( 'status' => 403 ) );
		}

		if ( ! $check_parent_target ) {
			return true;
		}

		$effective_parent_id = $parent_id;
		if ( ! $effective_parent_id ) {
			$attachment_post = get_post( $attachment_id );
			if ( $attachment_post instanceof \WP_Post && ! empty( $attachment_post->post_parent ) ) {
				$effective_parent_id = (int) $attachment_post->post_parent;
			}
		}

		if ( $effective_parent_id && ! current_user_can( 'edit_post', $effective_parent_id ) ) {
			return new \WP_Error( 'rest_cannot_edit', __( 'You do not have permission to edit the target post.', 'video-embed-thumbnail-generator' ), array( 'status' => 403 ) );
		}

		return true;
	}

	/**
	 * REST callback to generate temporary thumbnails.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function thumb_generate( \WP_REST_Request $request ) {
		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$can_edit = $this->ensure_can_set_thumbnail( (int) $attachment_id, 0, false );
		if ( is_wp_error( $can_edit ) ) {
			return $can_edit;
		}

		$ffmpeg_thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );

		$time = $request->get_param( 'time' );

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

		// Fallback to Cloud Transcoding (handled via filter in premium add-ons).
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		/**
		 * Filters the REST response after successfully generating a temporary thumbnail.
		 *
		 * @since 5.0.0
		 *
		 * @param \WP_REST_Response $response The REST response.
		 * @param \WP_REST_Request  $request  The REST request.
		 */
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
	 * REST callback to save thumbnail from upload.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function thumb_upload_save( \WP_REST_Request $request ) {
		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$can_edit = $this->ensure_can_set_thumbnail( (int) $attachment_id, (int) $request->get_param( 'parent_id' ) );
		if ( is_wp_error( $can_edit ) ) {
			return $can_edit;
		}

		$post_name = (string) $request->get_param( 'post_name' );
		if ( ! empty( $post_name ) ) {
			$post_name = pathinfo( $post_name, PATHINFO_FILENAME );
		}

		$files = $request->get_file_params();
		if ( empty( $files['file'] ) ) {
			return new \WP_Error( 'missing_file', 'No file was uploaded.', array( 'status' => 400 ) );
		}

		$thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );
		$response = (array) $thumbnails->save_from_blob( (int) $attachment_id, $post_name, (array) $files['file'], (int) $request->get_param( 'parent_id' ), $request->get_param( 'featured' ), $request->get_param( 'set_poster' ), $request->get_param( 'filename_suffix' ) );

		$response['attachment_id'] = (int) $attachment_id;
		if ( empty( $response['thumb_id'] ) ) {
			return new \WP_Error( 'upload_failed', $response['error'] ?? 'Could not save uploaded thumbnail.', array( 'status' => 500 ) );
		}

				/**
		 * Filters the REST response after successfully saving an uploaded thumbnail.
		 *
		 * @since 5.0.0
		 *
		 * @param \WP_REST_Response $response The REST response.
		 * @param \WP_REST_Request  $request  The REST request.
		 */
		return apply_filters( 'videopack_rest_thumb_upload_save', new \WP_REST_Response( $response, 200 ), $request );
	}

	/**
	 * REST callback to save one or more generated thumbnails.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function thumb_save( \WP_REST_Request $request ) {
		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$parent_id = (int) $request->get_param( 'parent_id' );
		$can_edit  = $this->ensure_can_set_thumbnail( (int) $attachment_id, $parent_id );
		if ( is_wp_error( $can_edit ) ) {
			return $can_edit;
		}

		$thumb_urls     = (array) $request->get_param( 'thumb_urls' );
		$thumbnails     = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );
		$attachment_url = (string) wp_get_attachment_url( (int) $attachment_id );
		$post_name      = $attachment_url ? pathinfo( basename( $attachment_url ), PATHINFO_FILENAME ) : get_the_title( (int) $attachment_id );

		$results  = array();
		$featured = $request->get_param( 'featured' );
		// Only the explicit "set this one as my poster" case (a single thumbnail)
		// should reassign the active poster; a multi-item save persists candidates
		// as media library attachments without silently reassigning it to whichever
		// one happens to be last in the array.
		$force_set_poster = ( count( $thumb_urls ) === 1 );

		foreach ( $thumb_urls as $index => $url ) {
			$res                  = (array) $thumbnails->save( (int) $attachment_id, $post_name, (string) $url, (int) $index + 1, $parent_id, $featured, $force_set_poster );
			$res['attachment_id'] = (int) $attachment_id;
			$results[]            = $res;
		}

				/**
		 * Filters the REST response after successfully saving one or more generated thumbnails.
		 *
		 * @since 5.0.0
		 *
		 * @param \WP_REST_Response $response The REST response.
		 * @param \WP_REST_Request  $request  The REST request.
		 */
		return apply_filters( 'videopack_rest_thumb_save', new \WP_REST_Response( $results, 200 ), $request );
	}

	/**
	 * REST callback to get thumbnail candidates.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public function get_thumbnail_candidates( \WP_REST_Request $request ) {
		$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options );
		$attachment      = new \Videopack\Admin\Attachment_Processor( $this->options, $this->format_registry );
		$results         = $attachment->get_thumbnail_candidates();
		/**
		 * Filters the REST response containing the list of videos that need thumbnails.
		 *
		 * @since 5.0.0
		 *
		 * @param \WP_REST_Response $response The REST response.
		 * @param \WP_REST_Request  $request  The REST request.
		 */
		return apply_filters( 'videopack_rest_get_thumbnail_candidates', new \WP_REST_Response( $results, 200 ), $request );
	}
}
