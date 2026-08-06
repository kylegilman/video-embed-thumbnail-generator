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
						return (bool) ( $this->can_make_thumbnails()
							&& \Videopack\Admin\Options::is_transcoding_capability_ready( $this->options ) );
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
	 * Never creates a video attachment: given a real attachment_id it operates
	 * on that attachment as before, but given only a url it probes and
	 * generates directly from the URL, leaving attachment creation to
	 * thumb_save() once a thumbnail has actually been verified to work.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function thumb_generate( \WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'attachment_id' );
		$parent_id     = (int) $request->get_param( 'parent_id' );

		if ( $attachment_id ) {
			$can_edit = $this->ensure_can_set_thumbnail( $attachment_id, 0, false );
			if ( is_wp_error( $can_edit ) ) {
				return $can_edit;
			}
			$source_id = $attachment_id;
		} else {
			$url = (string) $request->get_param( 'url' );
			if ( ! $url ) {
				return new \WP_Error( 'missing_source', __( 'No attachment or URL provided.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
			}
			if ( $parent_id && ! current_user_can( 'edit_post', $parent_id ) ) {
				return new \WP_Error( 'rest_cannot_edit', __( 'You do not have permission to edit the target post.', 'video-embed-thumbnail-generator' ), array( 'status' => 403 ) );
			}
			$source_id = $url;
		}

		$ffmpeg_thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );

		$time = $request->get_param( 'time' );

		if ( ! is_null( $time ) ) {
			$result = $ffmpeg_thumbnails->generate_thumbnail_at_timecode( $source_id, (float) $time );
		} else {
			$result = $ffmpeg_thumbnails->generate_single_thumbnail_data(
				$source_id,
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
					'attachment_id'  => $attachment_id,
				),
				200
			),
			$request
		);
	}

	/**
	 * REST callback to save thumbnail from upload.
	 *
	 * With an existing attachment_id, behavior is unchanged. With only a url,
	 * verifies the upload actually saves as a real image before creating the
	 * video attachment - see thumb_save() for the same pattern.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function thumb_upload_save( \WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'attachment_id' );
		$parent_id     = (int) $request->get_param( 'parent_id' );

		$post_name = (string) $request->get_param( 'post_name' );
		if ( ! empty( $post_name ) ) {
			$post_name = pathinfo( $post_name, PATHINFO_FILENAME );
		}

		$files = $request->get_file_params();
		if ( empty( $files['file'] ) ) {
			\Videopack\Common\Debug_Logger::log( 'thumb_upload_save: no file in request', array( 'attachment_id' => $attachment_id ) );
			return new \WP_Error( 'missing_file', 'No file was uploaded.', array( 'status' => 400 ) );
		}

		$thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );

		if ( $attachment_id ) {
			\Videopack\Common\Debug_Logger::log(
				'thumb_upload_save: starting',
				array(
					'attachment_id' => $attachment_id,
					'parent_id'     => $parent_id,
					'file_name'     => $files['file']['name'] ?? null,
					'file_size'     => $files['file']['size'] ?? null,
					'file_error'    => $files['file']['error'] ?? null,
				)
			);

			$can_edit = $this->ensure_can_set_thumbnail( $attachment_id, $parent_id );
			if ( is_wp_error( $can_edit ) ) {
				\Videopack\Common\Debug_Logger::log(
					'thumb_upload_save: permission check failed',
					array(
						'attachment_id' => $attachment_id,
						'error'         => $can_edit->get_error_message(),
					)
				);
				return $can_edit;
			}

			$response = (array) $thumbnails->save_from_blob( $attachment_id, $post_name, (array) $files['file'], $parent_id, $request->get_param( 'featured' ), $request->get_param( 'set_poster' ), $request->get_param( 'filename_suffix' ) );

			$response['attachment_id'] = $attachment_id;
			if ( empty( $response['thumb_id'] ) ) {
				\Videopack\Common\Debug_Logger::log(
					'thumb_upload_save: save_from_blob failed',
					array(
						'attachment_id' => $attachment_id,
						'error'         => $response['error'] ?? 'Could not save uploaded thumbnail.',
					)
				);
				return new \WP_Error( 'upload_failed', $response['error'] ?? 'Could not save uploaded thumbnail.', array( 'status' => 500 ) );
			}

			\Videopack\Common\Debug_Logger::log(
				'thumb_upload_save: success',
				array(
					'attachment_id' => $attachment_id,
					'thumb_id'      => $response['thumb_id'],
				)
			);

			return apply_filters( 'videopack_rest_thumb_upload_save', new \WP_REST_Response( $response, 200 ), $request );
		}

		$url = (string) $request->get_param( 'url' );
		if ( ! $url ) {
			return new \WP_Error( 'missing_source', __( 'No attachment or URL provided.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}
		if ( $parent_id && ! current_user_can( 'edit_post', $parent_id ) ) {
			return new \WP_Error( 'rest_cannot_edit', __( 'You do not have permission to edit the target post.', 'video-embed-thumbnail-generator' ), array( 'status' => 403 ) );
		}

		// Raw, not get_the_title() -- this becomes the new thumbnail's
		// post_title, and get_the_title() runs the full the_title filter
		// chain (wptexturize and anything else hooked to it), which
		// shouldn't get baked into a new stored title.
		$video_title = $parent_id ? (string) get_post_field( 'post_title', $parent_id, 'raw' ) : $post_name;

		$response = (array) $thumbnails->create_thumbnail_image_from_blob( $post_name, $video_title, $parent_id, (array) $files['file'], $request->get_param( 'filename_suffix' ) );

		if ( empty( $response['thumb_id'] ) || is_wp_error( $response['thumb_id'] ) ) {
			$response['attachment_id'] = 0;
			return new \WP_Error( 'upload_failed', $response['error'] ?? 'Could not save uploaded thumbnail.', array( 'status' => 500 ) );
		}

		// The upload verified - a real image was saved. Now create the video
		// attachment and hand the thumbnail over to it.
		$attachment_meta     = new \Videopack\Admin\Attachment_Meta( $this->options );
		$attachment_manager  = new \Videopack\Admin\Attachment( $this->options, $this->format_registry, $attachment_meta );
		$video_attachment_id = $attachment_manager->resolve_url_to_attachment( $url, $parent_id, true );
		if ( is_wp_error( $video_attachment_id ) ) {
			return $video_attachment_id;
		}
		$video_attachment_id = (int) $video_attachment_id;

		if ( ! empty( $response['is_new'] ) ) {
			wp_update_post(
				array(
					'ID'          => (int) $response['thumb_id'],
					'post_parent' => $video_attachment_id,
				)
			);
		}
		$thumbnails->assign_thumbnail_to_video( $video_attachment_id, (int) $response['thumb_id'], $parent_id, $request->get_param( 'featured' ), (bool) $request->get_param( 'set_poster' ) );

		$response['attachment_id'] = $video_attachment_id;

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
	 * With an existing attachment_id, behavior is unchanged. With only a url,
	 * verifies at least one thumbnail can actually be generated from it
	 * before creating the video attachment, so an unauthorized or invalid
	 * request leaves nothing behind in the media library.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function thumb_save( \WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'attachment_id' );
		$parent_id     = (int) $request->get_param( 'parent_id' );
		$thumb_urls    = (array) $request->get_param( 'thumb_urls' );
		$featured      = $request->get_param( 'featured' );
		$thumbnails    = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );
		// Only the explicit "set this one as my poster" case (a single thumbnail)
		// should reassign the active poster; a multi-item save persists candidates
		// as media library attachments without silently reassigning it to whichever
		// one happens to be last in the array.
		$force_set_poster = ( count( $thumb_urls ) === 1 );

		if ( $attachment_id ) {
			$can_edit = $this->ensure_can_set_thumbnail( $attachment_id, $parent_id );
			if ( is_wp_error( $can_edit ) ) {
				return $can_edit;
			}

			$attachment_url = (string) wp_get_attachment_url( $attachment_id );
			$post_name      = $attachment_url ? pathinfo( basename( $attachment_url ), PATHINFO_FILENAME ) : get_the_title( $attachment_id );

			$results = array();
			foreach ( $thumb_urls as $index => $url ) {
				$res                  = (array) $thumbnails->save( $attachment_id, $post_name, (string) $url, (int) $index + 1, $parent_id, $featured, $force_set_poster );
				$res['attachment_id'] = $attachment_id;
				$results[]            = $res;
			}

			return apply_filters( 'videopack_rest_thumb_save', new \WP_REST_Response( $results, 200 ), $request );
		}

		$url = (string) $request->get_param( 'url' );
		if ( ! $url ) {
			return new \WP_Error( 'missing_source', __( 'No attachment or URL provided.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}
		if ( $parent_id && ! current_user_can( 'edit_post', $parent_id ) ) {
			return new \WP_Error( 'rest_cannot_edit', __( 'You do not have permission to edit the target post.', 'video-embed-thumbnail-generator' ), array( 'status' => 403 ) );
		}

		$post_name   = pathinfo( basename( $url ), PATHINFO_FILENAME );
		// Raw, not get_the_title() -- this becomes the new thumbnail's
		// post_title, and get_the_title() runs the full the_title filter
		// chain (wptexturize and anything else hooked to it), which
		// shouldn't get baked into a new stored title.
		$video_title = $parent_id ? (string) get_post_field( 'post_title', $parent_id, 'raw' ) : $post_name;

		$results        = array();
		$created_thumbs = array();
		foreach ( $thumb_urls as $index => $thumb_url ) {
			$res = (array) $thumbnails->create_thumbnail_image( (string) $thumb_url, $post_name, $video_title, $parent_id, (int) $index + 1 );
			if ( ! empty( $res['thumb_id'] ) && ! is_wp_error( $res['thumb_id'] ) ) {
				$created_thumbs[] = array(
					'thumb_id' => (int) $res['thumb_id'],
					'is_new'   => ! empty( $res['is_new'] ),
				);
			}
			$res['attachment_id'] = 0;
			$results[]             = $res;
		}

		if ( empty( $created_thumbs ) ) {
			// Nothing generated successfully, so the URL wasn't a real,
			// processable video - create nothing and report the per-item
			// errors back to the caller.
			return apply_filters( 'videopack_rest_thumb_save', new \WP_REST_Response( $results, 200 ), $request );
		}

		// At least one thumbnail is real - the video is real. Now create the
		// video attachment and hand the thumbnail(s) over to it.
		$attachment_meta      = new \Videopack\Admin\Attachment_Meta( $this->options );
		$attachment_manager   = new \Videopack\Admin\Attachment( $this->options, $this->format_registry, $attachment_meta );
		$video_attachment_id  = $attachment_manager->resolve_url_to_attachment( $url, $parent_id, true );
		if ( is_wp_error( $video_attachment_id ) ) {
			return $video_attachment_id;
		}
		$video_attachment_id = (int) $video_attachment_id;

		foreach ( $created_thumbs as $created_thumb ) {
			// Only reparent thumbnails create_thumbnail_image() actually
			// created here - one that already existed keeps its parent,
			// same rule as for video attachments (resolve_url_to_attachment()).
			if ( $created_thumb['is_new'] ) {
				wp_update_post(
					array(
						'ID'          => $created_thumb['thumb_id'],
						'post_parent' => $video_attachment_id,
					)
				);
			}
			$thumbnails->assign_thumbnail_to_video( $video_attachment_id, $created_thumb['thumb_id'], $parent_id, $featured, $force_set_poster );
		}

		foreach ( $results as &$res ) {
			$res['attachment_id'] = $video_attachment_id;
		}
		unset( $res );

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
