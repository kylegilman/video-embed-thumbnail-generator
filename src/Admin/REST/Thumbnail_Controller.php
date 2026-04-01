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
					'permission_callback' => array( $this, 'can_manage_options' ),
					'args'                => array(
						'attachment_id'   => array(
							'type'     => array( 'number', 'string' ),
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
						return (bool) ( $this->can_make_thumbnails() && (bool) ( $this->options['ffmpeg_exists'] ?? false ) && 'notinstalled' !== ( $this->options['ffmpeg_exists'] ?? '' ) );
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
				'permission_callback' => array( $this, 'can_make_thumbnails' ),
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
			'/thumbs/candidates',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_thumbnail_candidates' ),
				'permission_callback' => array( $this, 'can_make_thumbnails' ),
			)
		);
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

		$ffmpeg_thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );
		$time              = $request->get_param( 'time' );

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

		if ( is_wp_error( $result ) ) {
			return $result;
		}

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
	 * REST callback to save all generated thumbnails.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function thumb_save_all( \WP_REST_Request $request ) {
		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$thumb_urls     = (array) $request->get_param( 'thumb_urls' );
		$thumbnails     = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );
		$attachment_url = (string) wp_get_attachment_url( (int) $attachment_id );
		$post_name      = $attachment_url ? pathinfo( basename( $attachment_url ), PATHINFO_FILENAME ) : get_the_title( (int) $attachment_id );

		$results   = array();
		$parent_id = (int) $request->get_param( 'parent_id' );
		$featured  = $request->get_param( 'featured' );

		foreach ( $thumb_urls as $index => $url ) {
			$res                  = (array) $thumbnails->save( (int) $attachment_id, $post_name, (string) $url, (int) $index + 1, $parent_id, $featured );
			$res['attachment_id'] = (int) $attachment_id;
			$results[]            = $res;
		}

		return apply_filters( 'videopack_rest_thumb_save_all', new \WP_REST_Response( $results, 200 ), $request );
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

		$post_name = (string) $request->get_param( 'post_name' );
		if ( ! empty( $post_name ) ) {
			$post_name = pathinfo( $post_name, PATHINFO_FILENAME );
		}

		$files = $request->get_file_params();
		if ( empty( $files['file'] ) ) {
			return new \WP_Error( 'missing_file', 'No file was uploaded.', array( 'status' => 400 ) );
		}

		$thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );
		$response   = (array) $thumbnails->save_from_blob( (int) $attachment_id, $post_name, (array) $files['file'], (int) $request->get_param( 'parent_id' ), $request->get_param( 'featured' ) );

		$response['attachment_id'] = (int) $attachment_id;
		if ( empty( $response['thumb_id'] ) ) {
			return new \WP_Error( 'upload_failed', $response['error'] ?? 'Could not save uploaded thumbnail.', array( 'status' => 500 ) );
		}

		return apply_filters( 'videopack_rest_thumb_upload_save', new \WP_REST_Response( $response, 200 ), $request );
	}

	/**
	 * REST callback to save single thumbnail.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function thumb_save( \WP_REST_Request $request ) {
		$attachment_id = $this->ensure_attachment_id( $request );
		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$params     = $request->get_params();
		$thumbnails = new \Videopack\Admin\FFmpeg_Thumbnails( $this->options );

		if ( is_numeric( $attachment_id ) ) {
			$attachment_url = (string) wp_get_attachment_url( (int) $attachment_id );
			$post_name      = $attachment_url ? pathinfo( basename( $attachment_url ), PATHINFO_FILENAME ) : get_the_title( (int) $attachment_id );
		} else {
			$post_name = str_replace( 'singleurl_', '', (string) $attachment_id );
		}

		$response = (array) $thumbnails->save(
			$attachment_id,
			$post_name,
			(string) ( $params['thumburl'] ?? '' ),
			$params['thumbnail_index'] ?? false,
			(int) ( $params['parent_id'] ?? 0 ),
			$params['featured'] ?? null
		);

		return apply_filters( 'videopack_rest_thumb_save', new \WP_REST_Response( $response, 200 ), $request );
	}

	/**
	 * REST callback to get thumbnail candidates.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response
	 */
	public function get_thumbnail_candidates( \WP_REST_Request $request ) {
		$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options );
		$attachment      = new \Videopack\Admin\Attachment_Processor( $this->options, $this->format_registry, $attachment_meta );
		$results         = $attachment->get_thumbnail_candidates();
		return apply_filters( 'videopack_rest_get_thumbnail_candidates', new \WP_REST_Response( $results, 200 ), $request );
	}
}
