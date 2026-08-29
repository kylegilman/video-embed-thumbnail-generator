<?php
/**
 * Tests for Process_Controller -- batch-processing REST endpoints
 * (/batch/process, /batch/progress). batch_permissions() is the real
 * authorization gate here (per-type capability requirements), and
 * batch_progress() has its own caching/aggregation logic layered on top of
 * Action Scheduler queries. Previously completely untested.
 */

use Videopack\Admin\REST\Process_Controller;

class ProcessControllerTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function controller(): Process_Controller {
		return new Process_Controller( $this->options(), new \Videopack\Admin\Formats\Registry( $this->options() ) );
	}

	public function tear_down() {
		remove_all_filters( 'videopack_batch_permissions' );
		remove_all_filters( 'videopack_rest_browser_thumbnail_progress' );
		remove_all_filters( 'videopack_rest_browser_sprite_progress' );
		parent::tear_down();
	}

	// -----------------------------------------------------------------
	// batch_permissions()
	// -----------------------------------------------------------------

	protected function request_for_type( string $type ): WP_REST_Request {
		$request = new WP_REST_Request( 'POST', '/videopack/v1/batch/process' );
		$request->set_param( 'type', $type );
		return $request;
	}

	public function test_featured_requires_manage_options(): void {
		$subscriber_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber_id );
		$this->assertFalse( $this->controller()->batch_permissions( $this->request_for_type( 'featured' ) ) );

		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );
		$this->assertTrue( $this->controller()->batch_permissions( $this->request_for_type( 'featured' ) ) );
	}

	public function test_parents_requires_manage_options(): void {
		$subscriber_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber_id );
		$this->assertFalse( $this->controller()->batch_permissions( $this->request_for_type( 'parents' ) ) );
	}

	public function test_thumbs_requires_make_video_thumbnails_not_manage_options(): void {
		$user_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		$user    = get_userdata( $user_id );
		$user->add_cap( 'make_video_thumbnails' );
		wp_set_current_user( $user_id );

		$this->assertTrue( $this->controller()->batch_permissions( $this->request_for_type( 'thumbs' ) ) );
	}

	public function test_thumbs_denied_for_manage_options_alone(): void {
		// A capability the 'thumbs' type does NOT check should not
		// authorize it -- proves the switch isn't accidentally falling
		// through to a broader check. Videopack's own capabilities are
		// resolved from the 'capabilities' option (role => bool per
		// videopack capability, Options::filter_user_has_cap()) rather than
		// a user's raw stored capabilities, so remove_cap() on
		// 'make_video_thumbnails' has no effect for a role the option
		// grants it to (administrator, by default) -- a user_has_cap
		// filter exercises the same current_user_can() code path
		// batch_permissions() actually uses.
		$admin_id   = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$force_caps = static function ( $allcaps, $caps, $args, $user ) use ( $admin_id ) {
			if ( (int) $user->ID === $admin_id && ( $args[0] ?? '' ) === 'make_video_thumbnails' ) {
				$allcaps['make_video_thumbnails'] = false;
			}
			return $allcaps;
		};
		add_filter( 'user_has_cap', $force_caps, 20, 4 );
		wp_set_current_user( $admin_id );

		try {
			$this->assertFalse( $this->controller()->batch_permissions( $this->request_for_type( 'thumbs' ) ) );
		} finally {
			remove_filter( 'user_has_cap', $force_caps, 20 );
		}
	}

	public function test_encoding_requires_encode_videos(): void {
		$user_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $user_id );
		$this->assertFalse( $this->controller()->batch_permissions( $this->request_for_type( 'encoding' ) ) );

		$author_id = self::factory()->user->create( array( 'role' => 'author' ) ); // has upload_files -> encode_videos by default mapping.
		wp_set_current_user( $author_id );
		$this->assertTrue( $this->controller()->batch_permissions( $this->request_for_type( 'encoding' ) ) );
	}

	public function test_all_requires_every_capability(): void {
		$user_id = self::factory()->user->create( array( 'role' => 'author' ) ); // encode_videos, but not manage_options/make_video_thumbnails.
		wp_set_current_user( $user_id );
		$this->assertFalse( $this->controller()->batch_permissions( $this->request_for_type( 'all' ) ) );

		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$admin    = get_userdata( $admin_id );
		$admin->add_cap( 'make_video_thumbnails' );
		wp_set_current_user( $admin_id );
		$this->assertTrue( $this->controller()->batch_permissions( $this->request_for_type( 'all' ) ) );
	}

	public function test_unrecognized_type_defaults_to_denied(): void {
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		$this->assertFalse( $this->controller()->batch_permissions( $this->request_for_type( 'not_a_real_type' ) ) );
	}

	public function test_permissions_filterable_for_addon_registered_types(): void {
		// An add-on registering a custom type via videopack_batch_types
		// would otherwise always be denied by the switch's default -- the
		// videopack_batch_permissions filter is how it opts back in.
		add_filter(
			'videopack_batch_permissions',
			static function ( $allowed, $type ) {
				return 'custom_addon_type' === $type ? true : $allowed;
			},
			10,
			2
		);

		$subscriber_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber_id );

		$this->assertTrue( $this->controller()->batch_permissions( $this->request_for_type( 'custom_addon_type' ) ) );
	}

	// -----------------------------------------------------------------
	// batch_process()
	// -----------------------------------------------------------------

	public function test_batch_process_dispatches_featured_and_returns_result(): void {
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		$result = $this->controller()->batch_process( $this->request_for_type( 'featured' ) );

		$this->assertInstanceOf( WP_REST_Response::class, $result );
		$this->assertArrayHasKey( 'total', $result->get_data() );
	}

	public function test_batch_process_result_is_filterable_per_type(): void {
		add_filter(
			'videopack_batch_process_featured',
			static function () {
				return array( 'total' => 'filtered' );
			}
		);

		$result = $this->controller()->batch_process( $this->request_for_type( 'featured' ) );

		$this->assertSame( 'filtered', $result->get_data()['total'] );
	}

	// -----------------------------------------------------------------
	// batch_progress()
	// -----------------------------------------------------------------

	protected function progress_request( string $type ): WP_REST_Request {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/batch/progress' );
		$request->set_param( 'type', $type );
		return $request;
	}

	public function test_progress_for_a_known_group_returns_status_counts(): void {
		$result = $this->controller()->batch_progress( $this->progress_request( 'thumbs' ) );

		$this->assertInstanceOf( WP_REST_Response::class, $result );
		$data = $result->get_data();
		$this->assertArrayHasKey( 'pending', $data );
		$this->assertArrayHasKey( 'in-progress', $data );
		$this->assertArrayHasKey( 'complete', $data );
		$this->assertArrayHasKey( 'failed', $data );
	}

	public function test_progress_result_is_cached_for_subsequent_calls(): void {
		$cache_key = 'videopack_rest_batch_progress_thumbs';
		delete_transient( $cache_key );

		$first = $this->controller()->batch_progress( $this->progress_request( 'thumbs' ) );
		$this->assertNotFalse( get_transient( $cache_key ), 'the response should be cached as a transient' );

		// Prove the cache is actually consulted (not just written) by
		// planting a distinguishable value and confirming it comes back
		// verbatim instead of a freshly computed response.
		$sentinel = new WP_REST_Response( array( 'pending' => 'cached-sentinel' ), 200 );
		set_transient( $cache_key, $sentinel, 10 );

		$second = $this->controller()->batch_progress( $this->progress_request( 'thumbs' ) );

		$this->assertSame( 'cached-sentinel', $second->get_data()['pending'] );
	}

	public function test_progress_for_all_aggregates_every_group_plus_browser_types(): void {
		delete_transient( 'videopack_rest_batch_progress_all' );

		$result = $this->controller()->batch_progress( $this->progress_request( 'all' ) );
		$data   = $result->get_data();

		$this->assertArrayHasKey( 'featured', $data );
		$this->assertArrayHasKey( 'parents', $data );
		$this->assertArrayHasKey( 'thumbs', $data );
		$this->assertArrayHasKey( 'encoding', $data );
		$this->assertArrayHasKey( 'browser', $data );
		$this->assertArrayHasKey( 'browser_sprites', $data );
	}

	public function test_browser_progress_type_is_filterable(): void {
		delete_transient( 'videopack_rest_batch_progress_browser' );
		add_filter(
			'videopack_rest_browser_thumbnail_progress',
			static function () {
				return array(
					'pending'     => 5,
					'in-progress' => 0,
					'complete'    => 0,
					'failed'      => 0,
				);
			}
		);

		$result = $this->controller()->batch_progress( $this->progress_request( 'browser' ) );

		$this->assertSame( 5, $result->get_data()['pending'] );
	}
}
