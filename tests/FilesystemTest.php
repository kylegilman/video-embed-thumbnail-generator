<?php
/**
 * Tests for Filesystem -- the can_write_direct() gate used before any code
 * path that writes to disk without going through wp_upload_bits()/etc.
 * Previously completely untested.
 */

use Videopack\Admin\Filesystem;

class FilesystemTest extends WP_UnitTestCase {

	public function tear_down() {
		remove_all_filters( 'filesystem_method' );
		global $wp_filesystem;
		$wp_filesystem = null;
		parent::tear_down();
	}

	public function test_returns_true_when_the_direct_method_is_available(): void {
		add_filter( 'filesystem_method', static fn() => 'direct' );

		$this->assertTrue( Filesystem::can_write_direct( sys_get_temp_dir() ) );

		global $wp_filesystem;
		$this->assertInstanceOf( WP_Filesystem_Direct::class, $wp_filesystem );
	}

	/**
	 * Explicitly forces a non-direct method rather than relying on whatever
	 * this environment's own ambient get_filesystem_method() detection
	 * reports, so the test is deterministic regardless of host/CI
	 * file-ownership setup.
	 */
	public function test_returns_false_when_direct_writing_is_not_available(): void {
		add_filter( 'filesystem_method', static fn() => 'ftpext' );

		$this->assertFalse( Filesystem::can_write_direct( sys_get_temp_dir() ) );
	}
}
