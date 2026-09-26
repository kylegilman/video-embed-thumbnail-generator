<?php
/**
 * Tests for Cleanup -- deleting Videopack's own transients, scheduling the
 * one-off "delete stale thumb_tmp files in an hour" event, the recurring
 * weekly cleanup queue action, and actually removing the thumb_tmp
 * directory. Previously completely untested.
 */

use Videopack\Admin\Cleanup;

class CleanupTest extends WP_UnitTestCase {

	protected function cleanup(): Cleanup {
		return new Cleanup();
	}

	public function tear_down() {
		wp_clear_scheduled_hook( 'videopack_cleanup_generated_thumbnails' );
		if ( class_exists( 'ActionScheduler' ) && function_exists( 'as_unschedule_all_actions' ) ) {
			as_unschedule_all_actions( 'videopack_cleanup_queue' );
		}
		remove_all_filters( 'filesystem_method' );
		parent::tear_down();
	}

	/**
	 * can_write_direct() relies on get_filesystem_method()'s own permission
	 * detection, which in this container reports FTP is required (likely a
	 * file-ownership mismatch between the PHP process and the mounted
	 * volume) -- forcing the 'direct' method here is the standard WordPress
	 * way to bypass that detection, and still exercises a real filesystem
	 * write via WP_Filesystem_Direct, not a mock.
	 */
	protected function force_direct_filesystem_method(): void {
		add_filter( 'filesystem_method', static fn() => 'direct' );
	}

	// -----------------------------------------------------------------
	// delete_transients()
	// -----------------------------------------------------------------

	public function test_deletes_transients_with_the_kgvid_prefix(): void {
		set_transient( 'kgvid_test_transient', 'value', HOUR_IN_SECONDS );

		$this->cleanup()->delete_transients();

		$this->assertFalse( get_transient( 'kgvid_test_transient' ) );
	}

	public function test_deletes_transients_with_the_videopack_prefix(): void {
		set_transient( 'videopack_test_transient', 'value', HOUR_IN_SECONDS );

		$this->cleanup()->delete_transients();

		$this->assertFalse( get_transient( 'videopack_test_transient' ) );
	}

	public function test_leaves_unrelated_transients_alone(): void {
		set_transient( 'some_other_plugins_transient', 'value', HOUR_IN_SECONDS );

		$this->cleanup()->delete_transients();

		$this->assertSame( 'value', get_transient( 'some_other_plugins_transient' ) );

		delete_transient( 'some_other_plugins_transient' );
	}

	// -----------------------------------------------------------------
	// schedule()
	// -----------------------------------------------------------------

	public function test_schedule_thumbs_schedules_a_single_future_event(): void {
		$this->cleanup()->schedule( 'thumbs' );

		$timestamp = wp_next_scheduled( 'videopack_cleanup_generated_thumbnails' );
		$this->assertNotFalse( $timestamp );
		$this->assertGreaterThan( time(), $timestamp );
	}

	public function test_schedule_thumbs_reschedules_rather_than_duplicating(): void {
		$cleanup = $this->cleanup();
		$cleanup->schedule( 'thumbs' );
		$first_timestamp = wp_next_scheduled( 'videopack_cleanup_generated_thumbnails' );

		// Force real wall-clock separation so a reschedule is actually
		// observable as a different timestamp, not just coincidentally equal.
		sleep( 1 );
		$cleanup->schedule( 'thumbs' );
		$second_timestamp = wp_next_scheduled( 'videopack_cleanup_generated_thumbnails' );

		$this->assertNotSame( $first_timestamp, $second_timestamp );

		// Only one event should exist, not two competing schedules.
		$crons          = _get_cron_array();
		$matching_count = 0;
		foreach ( $crons as $cron ) {
			if ( isset( $cron['videopack_cleanup_generated_thumbnails'] ) ) {
				++$matching_count;
			}
		}
		$this->assertSame( 1, $matching_count );
	}

	public function test_schedule_ignores_an_unrecognized_argument(): void {
		$this->cleanup()->schedule( 'not_a_real_type' );

		$this->assertFalse( wp_next_scheduled( 'videopack_cleanup_generated_thumbnails' ) );
	}

	// -----------------------------------------------------------------
	// schedule_weekly_cleanup()
	// -----------------------------------------------------------------

	public function test_schedule_weekly_cleanup_schedules_the_recurring_action(): void {
		if ( ! class_exists( 'ActionScheduler' ) ) {
			$this->markTestSkipped( 'Action Scheduler is not loaded.' );
		}
		as_unschedule_all_actions( 'videopack_cleanup_queue' );

		$this->cleanup()->schedule_weekly_cleanup();

		$this->assertNotFalse( as_next_scheduled_action( 'videopack_cleanup_queue' ) );
	}

	public function test_schedule_weekly_cleanup_does_not_duplicate_an_existing_pending_action(): void {
		if ( ! class_exists( 'ActionScheduler' ) ) {
			$this->markTestSkipped( 'Action Scheduler is not loaded.' );
		}
		as_unschedule_all_actions( 'videopack_cleanup_queue' );
		$cleanup = $this->cleanup();
		$cleanup->schedule_weekly_cleanup();

		$pending_before = \ActionScheduler::store()->query_actions(
			array(
				'hook'   => 'videopack_cleanup_queue',
				'status' => \ActionScheduler_Store::STATUS_PENDING,
			)
		);

		$cleanup->schedule_weekly_cleanup();

		$pending_after = \ActionScheduler::store()->query_actions(
			array(
				'hook'   => 'videopack_cleanup_queue',
				'status' => \ActionScheduler_Store::STATUS_PENDING,
			)
		);

		$this->assertSame( count( $pending_before ), count( $pending_after ) );
		$this->assertNotEmpty( $pending_after );
	}

	// -----------------------------------------------------------------
	// cleanup_generated_thumbnails_handler()
	// -----------------------------------------------------------------

	public function test_cleanup_handler_removes_the_thumb_tmp_directory(): void {
		$this->force_direct_filesystem_method();
		$uploads  = wp_upload_dir();
		$tmp_dir  = untrailingslashit( (string) $uploads['path'] ) . '/thumb_tmp';
		wp_mkdir_p( $tmp_dir );
		file_put_contents( $tmp_dir . '/leftover.jpg', 'fake image content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		$this->assertDirectoryExists( $tmp_dir );

		$this->cleanup()->cleanup_generated_thumbnails_handler();

		$this->assertDirectoryDoesNotExist( $tmp_dir );
	}

	public function test_cleanup_handler_does_not_error_when_the_directory_does_not_exist(): void {
		$this->force_direct_filesystem_method();
		$uploads = wp_upload_dir();
		$tmp_dir = untrailingslashit( (string) $uploads['path'] ) . '/thumb_tmp';
		if ( is_dir( $tmp_dir ) ) {
			rmdir( $tmp_dir ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_rmdir
		}

		$this->cleanup()->cleanup_generated_thumbnails_handler();

		$this->assertDirectoryDoesNotExist( $tmp_dir );
	}
}
