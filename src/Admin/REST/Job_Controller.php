<?php
/**
 * REST Controller for Videopack encoding jobs.
 *
 * @package Videopack
 */

namespace Videopack\Admin\REST;

/**
 * Class Job_Controller
 *
 * Manages REST API endpoints for Action Scheduler encoding jobs.
 */
class Job_Controller extends Controller {

	/**
	 * Registers REST API routes for jobs.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/jobs',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'jobs_create' ),
					'permission_callback' => array( $this, 'can_encode_videos' ),
					'args'                => array(
						'input'     => array(
							'type'     => array( 'string', 'number' ),
							'required' => true,
						),
						'outputs'   => array(
							'type'     => 'array',
							'required' => true,
							'items'    => array( 'type' => 'string' ),
						),
						'parent_id' => array(
							'type'     => 'number',
							'required' => false,
							'default'  => 0,
						),
					),
				),
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'jobs_list' ),
					'permission_callback' => 'is_user_logged_in',
					'args'                => array(
						'input' => array(
							'type'     => array( 'string', 'number' ),
							'required' => false,
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/jobs/control',
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'jobs_control' ),
				'permission_callback' => array( $this, 'can_encode_videos' ),
				'args'                => array(
					'action' => array(
						'type'     => 'string',
						'enum'     => array( 'play', 'pause' ),
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/jobs/clear',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'jobs_clear' ),
				'permission_callback' => array( $this, 'can_encode_videos' ),
				'args'                => array(
					'type' => array(
						'type'     => 'string',
						'enum'     => array( 'completed', 'all' ),
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/jobs/(?P<id>\d+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'job_get' ),
					'permission_callback' => 'is_user_logged_in',
				),
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'job_delete' ),
					'permission_callback' => array( $this, 'can_encode_videos' ),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'job_retry' ),
					'permission_callback' => array( $this, 'can_encode_videos' ),
				),
			)
		);
	}

	/**
	 * REST callback to create encoding jobs.
	 */
	public function jobs_create( \WP_REST_Request $request ) {
		$input     = $request->get_param( 'input' );
		$outputs   = (array) $request->get_param( 'outputs' );
		$attachment_id = is_numeric( $input ) ? (int) $input : 0;
		$input_url     = $attachment_id ? (string) wp_get_attachment_url( $attachment_id ) : (string) esc_url_raw( (string) $input );

		if ( ! $input_url ) {
			return new \WP_Error( 'invalid_input', 'Invalid input URL or attachment ID.', array( 'status' => 400 ) );
		}

		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );
		$result = $queue_controller->enqueue_encodes( array( 'id' => $attachment_id ?: $input_url, 'url' => $input_url, 'formats' => $outputs ) );

		if ( empty( $result['results'] ) ) {
			return new \WP_Error( 'enqueue_failed', 'Failed to enqueue any jobs.', array( 'status' => 500 ) );
		}

		$created_jobs = $queue_controller->get_jobs_list_data( $queue_controller->get_queue_items( get_current_blog_id() ), $attachment_id ?: $input_url );
		return apply_filters( 'videopack_rest_jobs_create', new \WP_REST_Response( array_merge( $result, array( 'attachment_id' => $attachment_id, 'jobs' => $created_jobs ) ), 201 ), $request );
	}

	/**
	 * REST callback to list jobs.
	 */
	public function jobs_list( \WP_REST_Request $request ) {
		$input            = $request->get_param( 'input' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );
		$jobs             = (array) $queue_controller->get_jobs_list_data( (array) $queue_controller->get_queue_items( (int) get_current_blog_id() ), $input );
		return apply_filters( 'videopack_rest_jobs_list', new \WP_REST_Response( $jobs, 200 ), $request );
	}

	/**
	 * REST callback to control queue.
	 */
	public function jobs_control( \WP_REST_Request $request ) {
		$action           = (string) $request->get_param( 'action' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );

		if ( 'play' === $action ) {
			$queue_controller->play();
		} else {
			$queue_controller->pause();
		}

		return apply_filters( 'videopack_rest_jobs_control', new \WP_REST_Response( array( 'queue_state' => $action ), 200 ), $request );
	}

	/**
	 * REST callback to clear jobs.
	 */
	public function jobs_clear( \WP_REST_Request $request ) {
		$type             = (string) $request->get_param( 'type' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );
		$queue_controller->clear_completed_queue( 'completed' === $type ? 'completed' : 'all' );

		return apply_filters( 'videopack_rest_jobs_clear', new \WP_REST_Response( array( 'cleared' => true ), 200 ), $request );
	}

	/**
	 * REST callback to get a job.
	 */
	public function job_get( \WP_REST_Request $request ) {
		$id               = (int) $request->get_param( 'id' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );
		$prepared         = $queue_controller->get_job_prepared( $id );
		if ( is_wp_error( $prepared ) ) {
			return $prepared;
		}
		return apply_filters( 'videopack_rest_job_get', new \WP_REST_Response( (array) $prepared, 200 ), $request );
	}

	/**
	 * REST callback to delete a job.
	 */
	public function job_delete( \WP_REST_Request $request ) {
		$id               = (int) $request->get_param( 'id' );
		$force            = $request->get_param( 'force' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );

		if ( 'false' !== $force && false !== $force ) {
			$result = $queue_controller->delete_job( $id, true );
		} else {
			$result = $queue_controller->remove_job( $id );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return apply_filters( 'videopack_rest_job_delete', new \WP_REST_Response( array( 'deleted' => true, 'job_id' => $id ), 200 ), $request );
	}

	/**
	 * REST callback to retry a job.
	 */
	public function job_retry( \WP_REST_Request $request ) {
		$id               = (int) $request->get_param( 'id' );
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options, $this->format_registry );
		$result           = $queue_controller->retry_job( $id );

		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return apply_filters( 'videopack_rest_job_retry', new \WP_REST_Response( array( 'retried' => true, 'job_id' => $id ), 200 ), $request );
	}
}
