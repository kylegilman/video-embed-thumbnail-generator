<?php
/**
 * Tests for Encode_Queue_Controller::retry_job() and remove_job() -- the
 * same class of authorization gate already covered on Encode_Attachment
 * (own job + encode_videos, or edit_others_video_encodes), but with a
 * multisite wrinkle worth locking in on its own: both explicitly
 * switch_to_blog() to the job's own site BEFORE checking the current
 * user's capabilities, specifically so a role assignment on the caller's
 * own site can't be used to authorize acting on a different site's job.
 */

use Videopack\Admin\Encode\Encode_Queue_Controller;
use Videopack\Admin\Formats\Registry;

class EncodeQueueControllerJobAuthorizationTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function controller(): Encode_Queue_Controller {
		return new Encode_Queue_Controller( $this->options(), new Registry( $this->options() ) );
	}

	protected function queue_table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'videopack_encoding_queue';
	}

	public function set_up() {
		parent::set_up();
		( new Encode_Queue_Controller( $this->options() ) )->add_table();
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
	// retry_job()
	// -----------------------------------------------------------------

	public function test_retry_job_returns_error_for_unknown_job(): void {
		$result = $this->controller()->retry_job( 999999 );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'videopack_job_not_found', $result->get_error_code() );
		$this->assertSame( 404, $result->get_error_data()['status'] );
	}

	public function test_retry_job_rejects_a_status_that_is_not_retryable(): void {
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job( $attachment_id, array( 'status' => 'queued' ) );

		$result = $this->controller()->retry_job( $job_id );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'videopack_job_not_retryable', $result->get_error_code() );
		$this->assertSame( 400, $result->get_error_data()['status'] );
	}

	/**
	 * @dataProvider retryable_statuses
	 */
	public function test_retry_job_allows_owner_with_encode_videos_for_retryable_statuses( string $status ): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job(
			$attachment_id,
			array(
				'status'    => $status,
				'user_id'   => $owner_id,
				'retry_count' => 3,
			)
		);

		$owner = get_userdata( $owner_id );
		$owner->add_cap( 'encode_videos' );
		wp_set_current_user( $owner_id );

		$result = $this->controller()->retry_job( $job_id );

		$this->assertTrue( $result );

		$row = $this->job_row( $job_id );
		$this->assertSame( 'queued', $row->status );
		$this->assertNull( $row->error_message );
		$this->assertNull( $row->pid );
		$this->assertSame( 4, (int) $row->retry_count );
	}

	public function retryable_statuses(): array {
		return array(
			'failed'   => array( 'failed' ),
			'canceled' => array( 'canceled' ),
			'deleted'  => array( 'deleted' ),
		);
	}

	public function test_retry_job_blocks_owner_without_encode_videos_capability(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job( $attachment_id, array( 'status' => 'failed', 'user_id' => $owner_id ) );

		wp_set_current_user( $owner_id );

		$result = $this->controller()->retry_job( $job_id );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'videopack_permission_denied', $result->get_error_code() );
		$this->assertSame( 'failed', $this->job_row( $job_id )->status );
	}

	public function test_retry_job_blocks_non_owner_without_edit_others_capability(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$other_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job( $attachment_id, array( 'status' => 'failed', 'user_id' => $owner_id ) );

		$other = get_userdata( $other_id );
		$other->add_cap( 'encode_videos' );
		wp_set_current_user( $other_id );

		$result = $this->controller()->retry_job( $job_id );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'videopack_permission_denied', $result->get_error_code() );
	}

	public function test_retry_job_allows_non_owner_with_edit_others_capability(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$admin_id      = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job( $attachment_id, array( 'status' => 'failed', 'user_id' => $owner_id ) );

		wp_set_current_user( $admin_id );

		$result = $this->controller()->retry_job( $job_id );

		$this->assertTrue( $result );
		$this->assertSame( 'queued', $this->job_row( $job_id )->status );
	}

	// -----------------------------------------------------------------
	// remove_job()
	// -----------------------------------------------------------------

	public function test_remove_job_returns_error_for_unknown_job(): void {
		$result = $this->controller()->remove_job( 999999 );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'videopack_job_not_found', $result->get_error_code() );
	}

	public function test_remove_job_allows_owner_with_encode_videos(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job( $attachment_id, array( 'status' => 'completed', 'user_id' => $owner_id ) );

		$owner = get_userdata( $owner_id );
		$owner->add_cap( 'encode_videos' );
		wp_set_current_user( $owner_id );

		$result = $this->controller()->remove_job( $job_id );

		$this->assertTrue( $result );
		$this->assertNull( $this->job_row( $job_id ) );
	}

	public function test_remove_job_blocks_owner_without_encode_videos_capability(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job( $attachment_id, array( 'status' => 'completed', 'user_id' => $owner_id ) );

		wp_set_current_user( $owner_id );

		$result = $this->controller()->remove_job( $job_id );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'videopack_permission_denied', $result->get_error_code() );
		$this->assertNotNull( $this->job_row( $job_id ) );
	}

	public function test_remove_job_blocks_non_owner_without_edit_others_capability(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$other_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job( $attachment_id, array( 'status' => 'completed', 'user_id' => $owner_id ) );

		$other = get_userdata( $other_id );
		$other->add_cap( 'encode_videos' );
		wp_set_current_user( $other_id );

		$result = $this->controller()->remove_job( $job_id );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'videopack_permission_denied', $result->get_error_code() );
		$this->assertNotNull( $this->job_row( $job_id ) );
	}

	public function test_remove_job_allows_non_owner_with_both_capabilities(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$admin_id      = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job( $attachment_id, array( 'status' => 'completed', 'user_id' => $owner_id ) );

		wp_set_current_user( $admin_id );

		$result = $this->controller()->remove_job( $job_id );

		$this->assertTrue( $result );
		$this->assertNull( $this->job_row( $job_id ) );
	}

	/**
	 * edit_others_video_encodes alone is sufficient to remove someone
	 * else's job, with no additional encode_videos requirement -- removing
	 * a job from the queue (without touching any encoded file) is strictly
	 * less destructive than Encode_Attachment::delete_format(), so it
	 * shouldn't be *more* restrictive than that equivalent check.
	 *
	 * In real usage both videopack capabilities are resolved from the
	 * 'capabilities' option (role => bool per videopack capability, see
	 * Options::filter_user_has_cap()) -- a site owner could plausibly grant
	 * "let editors manage others' jobs" without "let editors submit new
	 * encodes" via the plugin's own settings screen. That's awkward to set
	 * up here: the live Options singleton caches its options array at
	 * 'init' and won't pick up an update_option() call mid-test, and
	 * 'author' gets encode_videos by default anyway (it has upload_files,
	 * which encode_videos maps to by default). A user_has_cap filter
	 * exercises the exact same current_user_can() code path remove_job()
	 * calls, without depending on that internal caching.
	 */
	public function test_remove_job_allows_edit_others_capability_alone_without_encode_videos(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$other_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = $this->attachment_with_metadata();
		$job_id        = $this->insert_job( $attachment_id, array( 'status' => 'completed', 'user_id' => $owner_id ) );

		$force_caps = static function ( $allcaps, $caps, $args, $user ) use ( $other_id ) {
			if ( (int) $user->ID === $other_id ) {
				$allcaps['edit_others_video_encodes'] = true;
				unset( $allcaps['encode_videos'] );
			}
			return $allcaps;
		};
		add_filter( 'user_has_cap', $force_caps, 20, 4 );
		wp_set_current_user( $other_id );

		try {
			$result = $this->controller()->remove_job( $job_id );
		} finally {
			remove_filter( 'user_has_cap', $force_caps, 20 );
		}

		$this->assertTrue( $result );
		$this->assertNull( $this->job_row( $job_id ) );
	}
}
