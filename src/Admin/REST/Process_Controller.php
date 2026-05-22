<?php
/**
 * REST Controller for Videopack batch processes.
 *
 * @package Videopack
 */

namespace Videopack\Admin\REST;

/**
 * Class Process_Controller
 *
 * Manages REST API endpoints for batch processing and progress tracking.
 */
class Process_Controller extends Controller {

	/**
	 * Registers REST API routes for batch processes.
	 */
	public function register_routes() {
		$batch_types    = apply_filters( 'videopack_batch_types', array( 'featured', 'parents', 'thumbs', 'encoding' ) );
		$progress_types = array_merge( $batch_types, array( 'all', 'browser' ) );

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
						'enum'     => $batch_types,
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
						'enum'     => $progress_types,
					),
				),
			)
		);
	}

	/**
	 * Permission callback for batch operations.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function batch_permissions( $request ) {
		$type    = (string) $request->get_param( 'type' );
		$allowed = false;
		switch ( $type ) {
			case 'featured':
			case 'parents':
				$allowed = $this->can_manage_options();
				break;
			case 'thumbs':
				$allowed = $this->can_make_thumbnails();
				break;
			case 'encoding':
				$allowed = $this->can_encode_videos();
				break;
			case 'all':
				$allowed = $this->can_manage_options() && $this->can_make_thumbnails() && $this->can_encode_videos();
				break;
		}
		return apply_filters( 'videopack_batch_permissions', $allowed, $type, $request );
	}

	/**
	 * REST callback to start a batch process.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function batch_process( $request ) {
		if ( ! function_exists( 'as_enqueue_async_action' ) ) {
			return new \WP_Error( 'as_missing', 'Action Scheduler is not available.', array( 'status' => 500 ) );
		}

		$type   = (string) $request->get_param( 'type' );
		$groups = apply_filters(
			'videopack_batch_groups',
			array(
				'featured' => 'videopack-featured-images',
				'parents'  => 'videopack-parent-switching',
				'thumbs'   => 'videopack-generate-thumbnails',
				'encoding' => 'videopack-batch-enqueue',
			)
		);

		if ( isset( $groups[ $type ] ) && function_exists( 'as_unschedule_all_actions' ) ) {
			as_unschedule_all_actions( '', array(), $groups[ $type ] );
		}

		$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options );
		$result          = array();

		switch ( $type ) {
			case 'featured':
				$attachment = new \Videopack\Admin\Attachment_Media_Library( $this->options, $this->format_registry, $attachment_meta );
				$result     = $attachment->process_batch_featured();
				break;
			case 'parents':
				$attachment = new \Videopack\Admin\Attachment_Media_Library( $this->options, $this->format_registry, $attachment_meta );
				$result     = $attachment->process_batch_parents( (string) $request->get_param( 'target_parent' ) );
				break;
			case 'thumbs':
				$attachment = new \Videopack\Admin\Attachment_Processor( $this->options, $this->format_registry, $attachment_meta );
				$result     = $attachment->process_batch_thumbs();
				break;
			case 'encoding':
				$attachment = new \Videopack\Admin\Attachment_Processor( $this->options, $this->format_registry, $attachment_meta );
				$result     = $attachment->process_batch_encoding();
				break;
		}

		$result = apply_filters( "videopack_batch_process_{$type}", $result, $request, $this );

		if ( empty( $result ) ) {
			return new \WP_Error( 'invalid_type', 'Invalid batch type.', array( 'status' => 400 ) );
		}

		return apply_filters( 'videopack_rest_batch_process', new \WP_REST_Response( $result, 200 ), $request );
	}

	/**
	 * REST callback for batch progress.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 */
	public function batch_progress( $request ) {
		$type      = (string) $request->get_param( 'type' );
		$cache_key = 'videopack_rest_batch_progress_' . $type;
		$cached    = get_transient( $cache_key );
		if ( false !== $cached ) {
			return $cached;
		}

		$groups = apply_filters(
			'videopack_batch_groups',
			array(
				'featured' => 'videopack-featured-images',
				'parents'  => 'videopack-parent-switching',
				'thumbs'   => 'videopack-generate-thumbnails',
				'encoding' => 'videopack-batch-enqueue',
			)
		);

		$counts = array();
		if ( 'all' === $type ) {
			foreach ( $groups as $key => $group ) {
				$res = $this->get_as_progress( $group );
				if ( ! is_wp_error( $res ) ) {
					$counts[ $key ] = $res;
				}
			}
			$counts['browser'] = (array) apply_filters(
				'videopack_rest_browser_thumbnail_progress',
				array(
					'pending'     => 0,
					'in-progress' => 0,
					'complete'    => 0,
					'failed'      => 0,
				)
			);
		} elseif ( 'browser' === $type ) {
			$counts = (array) apply_filters(
				'videopack_rest_browser_thumbnail_progress',
				array(
					'pending'     => 0,
					'in-progress' => 0,
					'complete'    => 0,
					'failed'      => 0,
				)
			);
		} elseif ( isset( $groups[ $type ] ) ) {
			$counts = $this->get_as_progress( $groups[ $type ] );
			if ( is_wp_error( $counts ) ) {
				return $counts;
			}
		}

		$response = new \WP_REST_Response( (array) $counts, 200 );
		set_transient( $cache_key, $response, 10 );

		return apply_filters( 'videopack_rest_batch_progress', $response, $request );
	}

	/**
	 * Helper to get Action Scheduler progress.
	 *
	 * @param string $group The Action Scheduler group name.
	 */
	private function get_as_progress( $group ) {
		if ( ! class_exists( 'ActionScheduler_Store' ) ) {
			return new \WP_Error( 'as_missing', 'Action Scheduler is not available.', array( 'status' => 500 ) );
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
}
