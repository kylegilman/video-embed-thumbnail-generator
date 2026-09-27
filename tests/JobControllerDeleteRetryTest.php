<?php
/**
 * Tests for Job_Controller::job_delete() and job_retry() -- the two
 * callbacks on this controller with no dedicated coverage anywhere.
 * jobs_create()'s playlist rejection, jobs_list()/jobs_control()/jobs_clear()'s
 * network-scope authorization, and Encode_Queue_Controller::retry_job()/
 * remove_job()'s own ownership/capability gates already have dedicated
 * coverage elsewhere (JobsCreatePlaylistRejectionTest, EncodeQueueNetworkScopeTest,
 * EncodeQueueControllerJobAuthorizationTest) -- this file focuses on what
 * those don't: job_delete()'s force-param routing and job_retry()'s
 * status-gate/REST response shape.
 */

use Videopack\Admin\REST\Job_Controller;
use Videopack\Admin\Encode\Encode_Queue_Controller;
use Videopack\Admin\Formats\Registry;

class JobControllerDeleteRetryTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function controller(): Job_Controller {
		return new Job_Controller( $this->options(), new Registry( $this->options() ) );
	}

	protected function queue_table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'videopack_encoding_queue';
	}

	public function set_up() {
		parent::set_up();
		( new Encode_Queue_Controller( $this->options() ) )->add_table();
		$owner_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $owner_id );
	}

	/**
	 * Inserts a real queue row owned by the current user and returns its id.
	 */
	protected function insert_job( array $overrides = array() ): int {
		global $wpdb;
		$wpdb->insert(
			$this->queue_table_name(),
			array_merge(
				array(
					'blog_id'       => get_current_blog_id(),
					'attachment_id' => 0,
					'input_url'     => 'https://example.test/video.mp4',
					'format_id'     => 'h264_720',
					'status'        => 'completed',
					'user_id'       => get_current_user_id(),
				),
				$overrides
			)
		);
		return (int) $wpdb->insert_id;
	}

	protected function job_row( int $job_id ) {
		global $wpdb;
		return $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name(), $job_id ), ARRAY_A );
	}

	// -----------------------------------------------------------------
	// job_delete()
	// -----------------------------------------------------------------

	public function test_job_delete_returns_404_for_an_unknown_job(): void {
		$request = new WP_REST_Request( 'DELETE', '/videopack/v1/jobs/999999' );
		$request->set_param( 'id', 999999 );

		$result = $this->controller()->job_delete( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
	}

	/**
	 * This route declares no 'force' arg at all -- an absent request param
	 * and an *explicit* false both have to mean something, and the two mean
	 * opposite things here: no param present defaults to a forced
	 * delete_job() (real deletion, cancelling any
	 * active encode first), while only an explicit false/'false' routes to
	 * the softer remove_job() (a plain DB row delete, which is the only one
	 * of the two that fires 'videopack_remove_job'). Verified by watching
	 * which real function actually ran rather than asserting on the return
	 * value alone, since both converge on "the row is gone" for a
	 * completed job either way.
	 */
	public function test_job_delete_defaults_to_a_forced_delete_when_force_is_absent(): void {
		$job_id = $this->insert_job();
		$fired  = false;
		add_action(
			'videopack_remove_job',
			function () use ( &$fired ) {
				$fired = true;
			}
		);

		$request = new WP_REST_Request( 'DELETE', "/videopack/v1/jobs/{$job_id}" );
		$request->set_param( 'id', $job_id );

		$response = $this->controller()->job_delete( $request );
		remove_all_actions( 'videopack_remove_job' );

		$this->assertInstanceOf( WP_REST_Response::class, $response );
		$this->assertTrue( $response->get_data()['deleted'] );
		$this->assertSame( $job_id, $response->get_data()['job_id'] );
		$this->assertFalse( $fired, 'delete_job() (forced path) should not fire remove_job()\'s own action.' );
	}

	public function test_job_delete_uses_a_soft_remove_when_force_is_the_string_false(): void {
		$job_id = $this->insert_job();
		$fired  = false;
		add_action(
			'videopack_remove_job',
			function () use ( &$fired ) {
				$fired = true;
			}
		);

		$request = new WP_REST_Request( 'DELETE', "/videopack/v1/jobs/{$job_id}" );
		$request->set_param( 'id', $job_id );
		$request->set_param( 'force', 'false' );

		$this->controller()->job_delete( $request );
		remove_all_actions( 'videopack_remove_job' );

		$this->assertTrue( $fired, 'force="false" should route to remove_job().' );
	}

	public function test_job_delete_uses_a_soft_remove_when_force_is_boolean_false(): void {
		$job_id = $this->insert_job();
		$fired  = false;
		add_action(
			'videopack_remove_job',
			function () use ( &$fired ) {
				$fired = true;
			}
		);

		$request = new WP_REST_Request( 'DELETE', "/videopack/v1/jobs/{$job_id}" );
		$request->set_param( 'id', $job_id );
		$request->set_param( 'force', false );

		$this->controller()->job_delete( $request );
		remove_all_actions( 'videopack_remove_job' );

		$this->assertTrue( $fired, 'force=false (boolean) should route to remove_job().' );
	}

	public function test_job_delete_soft_remove_actually_removes_the_row(): void {
		$job_id = $this->insert_job();

		$request = new WP_REST_Request( 'DELETE', "/videopack/v1/jobs/{$job_id}" );
		$request->set_param( 'id', $job_id );
		$request->set_param( 'force', 'false' );

		$this->controller()->job_delete( $request );

		$this->assertNull( $this->job_row( $job_id ) );
	}

	public function test_job_delete_response_is_filterable(): void {
		$job_id = $this->insert_job();
		add_filter(
			'videopack_rest_job_delete',
			static function ( $response ) {
				$response->set_data( array( 'overridden' => true ) );
				return $response;
			}
		);

		$request = new WP_REST_Request( 'DELETE', "/videopack/v1/jobs/{$job_id}" );
		$request->set_param( 'id', $job_id );
		$request->set_param( 'force', 'false' );
		$response = $this->controller()->job_delete( $request );
		remove_all_filters( 'videopack_rest_job_delete' );

		$this->assertSame( array( 'overridden' => true ), $response->get_data() );
	}

	// -----------------------------------------------------------------
	// job_retry()
	// -----------------------------------------------------------------

	public function test_job_retry_returns_404_for_an_unknown_job(): void {
		$request = new WP_REST_Request( 'PUT', '/videopack/v1/jobs/999999' );
		$request->set_param( 'id', 999999 );

		$result = $this->controller()->job_retry( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
	}

	public function test_job_retry_rejects_a_non_retryable_status(): void {
		$job_id = $this->insert_job( array( 'status' => 'completed' ) );

		$request = new WP_REST_Request( 'PUT', "/videopack/v1/jobs/{$job_id}" );
		$request->set_param( 'id', $job_id );

		$result = $this->controller()->job_retry( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'videopack_job_not_retryable', $result->get_error_code() );
	}

	public function test_job_retry_succeeds_for_a_failed_job_and_requeues_it(): void {
		$job_id = $this->insert_job( array( 'status' => 'failed' ) );

		$request = new WP_REST_Request( 'PUT', "/videopack/v1/jobs/{$job_id}" );
		$request->set_param( 'id', $job_id );

		$response = $this->controller()->job_retry( $request );

		$this->assertInstanceOf( WP_REST_Response::class, $response );
		$this->assertTrue( $response->get_data()['retried'] );
		$this->assertSame( $job_id, $response->get_data()['job_id'] );
		$this->assertSame( 'queued', $this->job_row( $job_id )['status'] );
	}

	public function test_job_retry_response_is_filterable(): void {
		$job_id = $this->insert_job( array( 'status' => 'failed' ) );
		add_filter(
			'videopack_rest_job_retry',
			static function ( $response ) {
				$response->set_data( array( 'overridden' => true ) );
				return $response;
			}
		);

		$request = new WP_REST_Request( 'PUT', "/videopack/v1/jobs/{$job_id}" );
		$request->set_param( 'id', $job_id );
		$response = $this->controller()->job_retry( $request );
		remove_all_filters( 'videopack_rest_job_retry' );

		$this->assertSame( array( 'overridden' => true ), $response->get_data() );
	}
}
