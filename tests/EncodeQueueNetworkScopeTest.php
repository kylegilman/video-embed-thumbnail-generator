<?php
/**
 * Tests for completing the Network Video Encode Queue page: the `scope`
 * REST param (Job_Controller::jobs_list()/jobs_control()/jobs_clear()),
 * network-wide job listing and data resolution
 * (Encode_Queue_Controller::prepare_job_for_response()), cross-blog
 * retention in clear_completed_queue(), and the network queue page's
 * visibility gate (Multisite::network_queue_page_should_show()).
 */

use Videopack\Admin\REST\Job_Controller;
use Videopack\Admin\Encode\Encode_Queue_Controller;
use Videopack\Admin\Multisite;

class EncodeQueueNetworkScopeTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function job_controller(): Job_Controller {
		return new Job_Controller( $this->options(), new \Videopack\Admin\Formats\Registry( $this->options() ) );
	}

	protected function queue_controller(): Encode_Queue_Controller {
		return new Encode_Queue_Controller( $this->options() );
	}

	protected function queue_table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'videopack_encoding_queue';
	}

	public function set_up() {
		parent::set_up();
		$this->queue_controller()->add_table();
	}

	public function tear_down() {
		remove_all_filters( 'videopack_network_addon_capabilities' );
		delete_site_option( 'videopack_network_options' );
		parent::tear_down();
	}

	protected function attachment_with_metadata( int $width = 1920, int $height = 1080 ): int {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		update_post_meta(
			$attachment_id,
			'_wp_attachment_metadata',
			array(
				'width'      => $width,
				'height'     => $height,
				'length'     => 60.0,
				'videocodec' => 'h264',
			)
		);
		return $attachment_id;
	}

	protected function insert_job( int $attachment_id, array $overrides = array() ): int {
		global $wpdb;
		$wpdb->insert(
			$this->queue_table_name(),
			array_merge(
				array(
					'blog_id'       => get_current_blog_id(),
					'attachment_id' => $attachment_id,
					'input_url'     => 'https://example.com/video.mp4',
					'format_id'     => 'h264_720',
					'status'        => 'failed',
					'user_id'       => 0,
					'output_path'   => '/tmp/existing-output.mp4',
					'retry_count'   => 0,
				),
				$overrides
			)
		);
		return (int) $wpdb->insert_id;
	}

	protected function job_row( int $job_id ) {
		global $wpdb;
		return $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name(), $job_id ) );
	}

	// -----------------------------------------------------------------
	// Job_Controller: scope=network authorization.
	// -----------------------------------------------------------------

	public function test_jobs_list_network_scope_rejected_without_manage_network(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'scope=network is only meaningful under real multisite; run via npm run test:php:multisite.' );
		}

		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$request = new WP_REST_Request( 'GET', '/videopack/v1/jobs' );
		$request->set_param( 'scope', 'network' );

		$result = $this->job_controller()->jobs_list( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'videopack_permission_denied', $result->get_error_code() );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}

	public function test_jobs_control_network_scope_rejected_without_manage_network(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'scope=network is only meaningful under real multisite; run via npm run test:php:multisite.' );
		}

		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$request = new WP_REST_Request( 'POST', '/videopack/v1/jobs/control' );
		$request->set_param( 'action', 'pause' );
		$request->set_param( 'scope', 'network' );

		$result = $this->job_controller()->jobs_control( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'videopack_permission_denied', $result->get_error_code() );
	}

	public function test_jobs_clear_network_scope_rejected_without_manage_network(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'scope=network is only meaningful under real multisite; run via npm run test:php:multisite.' );
		}

		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$request = new WP_REST_Request( 'DELETE', '/videopack/v1/jobs/clear' );
		$request->set_param( 'type', 'completed' );
		$request->set_param( 'scope', 'network' );

		$result = $this->job_controller()->jobs_clear( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'videopack_permission_denied', $result->get_error_code() );
	}

	public function test_jobs_list_network_scope_returns_jobs_from_more_than_one_blog(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Requires real multisite; run via npm run test:php:multisite.' );
		}

		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		grant_super_admin( $admin_id );
		wp_set_current_user( $admin_id );

		$other_blog_id = self::factory()->blog->create();
		$attachment_id = $this->attachment_with_metadata();
		$this->insert_job( $attachment_id, array( 'status' => 'failed' ) );
		$this->insert_job( $attachment_id, array( 'status' => 'failed', 'blog_id' => $other_blog_id ) );

		$request = new WP_REST_Request( 'GET', '/videopack/v1/jobs' );
		$request->set_param( 'scope', 'network' );

		$result = $this->job_controller()->jobs_list( $request );

		$this->assertInstanceOf( WP_REST_Response::class, $result );
		$blog_ids = array_unique( array_column( (array) $result->get_data(), 'blog_name' ) );
		$this->assertGreaterThan( 1, count( $blog_ids ), 'jobs from more than one blog should be present' );
	}

	public function test_jobs_control_network_scope_writes_network_option_not_site_option(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Requires real multisite; run via npm run test:php:multisite.' );
		}

		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		grant_super_admin( $admin_id );
		wp_set_current_user( $admin_id );

		update_option( 'videopack_options', array_merge( $this->options(), array( 'queue_control' => 'play' ) ) );
		update_site_option( 'videopack_network_options', array( 'queue_control' => 'play' ) );

		$request = new WP_REST_Request( 'POST', '/videopack/v1/jobs/control' );
		$request->set_param( 'action', 'pause' );
		$request->set_param( 'scope', 'network' );

		$result = $this->job_controller()->jobs_control( $request );

		$this->assertInstanceOf( WP_REST_Response::class, $result );

		$network_options = Multisite::get_network_options();
		$this->assertSame( 'pause', $network_options['queue_control'] );

		$site_options = get_option( 'videopack_options' );
		$this->assertSame( 'play', $site_options['queue_control'], 'network-scoped pause must not touch the per-site option' );
	}

	// -----------------------------------------------------------------
	// clear_completed_queue(): cross-blog retention.
	// -----------------------------------------------------------------

	public function test_clear_completed_queue_keeps_other_blogs_completed_jobs_under_site_scope(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Requires real multisite; run via npm run test:php:multisite.' );
		}

		$other_blog_id = self::factory()->blog->create();
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job( $attachment_id, array( 'status' => 'completed', 'blog_id' => $other_blog_id ) );

		$this->queue_controller()->clear_completed_queue( 'completed', 'site' );

		$this->assertNotNull( $this->job_row( $job_id ), 'a different blog\'s completed job must be kept under site scope' );
	}

	public function test_clear_completed_queue_removes_other_blogs_completed_jobs_under_network_scope(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Requires real multisite; run via npm run test:php:multisite.' );
		}

		// The 'completed' branch's cross-blog retention gate checks
		// current_user_can( 'manage_network' ) directly rather than
		// re-deriving it from $scope (REST already enforces that scope=
		// network requires manage_network before this is ever reached) --
		// so exercising the "should delete" path here needs a real
		// manage_network user, not just the scope argument.
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		grant_super_admin( $admin_id );
		wp_set_current_user( $admin_id );

		$other_blog_id = self::factory()->blog->create();
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job( $attachment_id, array( 'status' => 'completed', 'blog_id' => $other_blog_id ) );

		$this->queue_controller()->clear_completed_queue( 'completed', 'network' );

		$this->assertNull( $this->job_row( $job_id ), 'a different blog\'s completed job must be removed under network scope' );
	}

	// -----------------------------------------------------------------
	// prepare_job_for_response(): cross-blog data resolution.
	// -----------------------------------------------------------------

	public function test_job_list_data_resolves_cross_blog_attachment_fields_correctly(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Requires real multisite (switch_to_blog() is undefined otherwise); run via npm run test:php:multisite.' );
		}

		// get_edit_post_link() requires edit capability on the post in
		// question -- an anonymous current user (the test default) always
		// gets an empty link back regardless of which blog is active, which
		// would be indistinguishable from a real cross-blog resolution bug.
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		grant_super_admin( $admin_id );
		wp_set_current_user( $admin_id );

		$other_blog_id = self::factory()->blog->create();

		switch_to_blog( $other_blog_id );
		$parent_id     = self::factory()->post->create( array( 'post_title' => 'Other Blog Parent Post' ) );
		$attachment_id = $this->attachment_with_metadata();
		restore_current_blog();

		$job_id = $this->insert_job(
			$attachment_id,
			array(
				'status'    => 'completed',
				'blog_id'   => $other_blog_id,
				'parent_id' => $parent_id,
			)
		);

		$queue_controller = $this->queue_controller();
		$jobs             = $queue_controller->get_jobs_list_data( array( (array) $this->job_row( $job_id ) ) );

		$this->assertCount( 1, $jobs );
		$this->assertSame( 'Other Blog Parent Post', $jobs[0]['parent_title'], 'parent_title must resolve against the job\'s own blog, not the caller\'s' );
		$this->assertNotEmpty( $jobs[0]['attachment_link'], 'attachment_link must resolve against the job\'s own blog' );
		$this->assertSame( get_current_blog_id(), get_current_blog_id(), 'sanity: still on the original blog' );
	}

	public function test_job_list_data_restores_original_blog_after_cross_blog_resolution(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Requires real multisite; run via npm run test:php:multisite.' );
		}

		$other_blog_id     = self::factory()->blog->create();
		$attachment_id     = $this->attachment_with_metadata();
		$job_id            = $this->insert_job( $attachment_id, array( 'status' => 'completed', 'blog_id' => $other_blog_id ) );
		$original_blog_id  = get_current_blog_id();

		$this->queue_controller()->get_jobs_list_data( array( (array) $this->job_row( $job_id ) ) );

		$this->assertSame( $original_blog_id, get_current_blog_id() );
	}

	// -----------------------------------------------------------------
	// Multisite::network_queue_page_should_show()
	// -----------------------------------------------------------------

	public function test_network_queue_page_shown_when_ffmpeg_available_network_wide(): void {
		update_site_option( 'videopack_network_options', array( 'ffmpeg_exists' => 'available' ) );

		$multisite = new Multisite( $this->options() );

		$this->assertTrue( $multisite->network_queue_page_should_show() );
	}

	public function test_network_queue_page_hidden_when_no_ffmpeg_and_no_addon_capability(): void {
		update_site_option( 'videopack_network_options', array( 'ffmpeg_exists' => 'unavailable' ) );

		$multisite = new Multisite( $this->options() );

		$this->assertFalse( $multisite->network_queue_page_should_show() );
	}

	public function test_network_queue_page_shown_when_addon_reports_capability_without_ffmpeg(): void {
		update_site_option( 'videopack_network_options', array( 'ffmpeg_exists' => 'unavailable' ) );
		add_filter(
			'videopack_network_addon_capabilities',
			static function ( $capabilities ) {
				$capabilities[] = 'cloud_encoding';
				return $capabilities;
			}
		);

		$multisite = new Multisite( $this->options() );

		$this->assertTrue( $multisite->network_queue_page_should_show() );
	}
}
