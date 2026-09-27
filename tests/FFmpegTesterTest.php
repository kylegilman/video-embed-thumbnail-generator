<?php
/**
 * Tests for FFmpeg_Tester -- the diagnostic "test encode" and "find ffmpeg"
 * checks behind the Settings page's FFmpeg diagnostics. Previously only
 * incidentally referenced (ValidateOptionsTest primes ffmpeg_exists to
 * avoid triggering a real detection pass), never actually exercised.
 *
 * This test environment has no real ffmpeg binary, so every path here
 * necessarily exercises the failure branches -- but that's still a real,
 * unmocked failure (a genuine attempt to proc_open a nonexistent
 * executable), not a stand-in for one. Assertions avoid the exact shell
 * wording ("sh: exec: line 0: ... not found" here), since that text comes
 * from the host shell rather than this codebase and could read differently
 * on another distro/CI image; they check the fields this code itself
 * controls instead.
 */

use Videopack\Admin\Encode\FFmpeg_Tester;
use Videopack\Admin\Formats\Registry;

class FFmpegTesterTest extends WP_UnitTestCase {

	protected function tester(): FFmpeg_Tester {
		$options = get_option( 'videopack_options', array() );
		return new FFmpeg_Tester( $options, new Registry( $options ) );
	}

	// -----------------------------------------------------------------
	// run_test_encode()
	// -----------------------------------------------------------------

	public function test_run_test_encode_rejects_an_unrecognized_format_without_running_anything(): void {
		$result = $this->tester()->run_test_encode( 'not_a_real_format' );

		$this->assertSame( '', $result['command'] );
		$this->assertSame( 'Invalid video format specified.', $result['output'] );
	}

	/**
	 * A valid format really does build and attempt to run a full ffmpeg
	 * command against the plugin's bundled sample video -- it just can't
	 * succeed here without a real ffmpeg binary.
	 */
	public function test_run_test_encode_builds_and_attempts_a_real_command_for_a_valid_format(): void {
		$result = $this->tester()->run_test_encode( 'h264_720' );

		$this->assertStringContainsString( 'ffmpeg', $result['command'] );
		$this->assertStringContainsString( 'Adobestock_469037984.mp4', $result['command'] );
		$this->assertNotSame( '', trim( $result['output'] ) );
	}

	public function test_run_test_encode_cleans_up_its_temporary_files(): void {
		$uploads = wp_upload_dir();
		$before  = glob( trailingslashit( $uploads['path'] ) . 'ffmpeg_test_*' );
		$this->tester()->run_test_encode( 'h264_720' );
		$after = glob( trailingslashit( $uploads['path'] ) . 'ffmpeg_test_*' );

		$this->assertSame( $before, $after );
	}

	// -----------------------------------------------------------------
	// check_ffmpeg_exists()
	// -----------------------------------------------------------------

	public function test_check_ffmpeg_exists_reports_proc_open_as_enabled(): void {
		$this->assertTrue( $this->tester()->check_ffmpeg_exists( '/usr/bin' )['proc_open_enabled'] );
	}

	public function test_check_ffmpeg_exists_is_false_for_a_nonexistent_path(): void {
		$result = $this->tester()->check_ffmpeg_exists( '/usr/bin' );

		$this->assertFalse( $result['ffmpeg_exists'] );
		$this->assertStringContainsString( '/usr/bin', $result['ffmpeg_error'] );
	}

	/**
	 * When the caller pastes the ffmpeg binary's own path (rather than its
	 * containing directory), the first attempt wrongly builds .../ffmpeg/ffmpeg
	 * and fails, so this retries once with the trailing /ffmpeg stripped --
	 * proven here by the actually-attempted path in the real shell failure
	 * output being the corrected single path, not the doubled one. app_path
	 * in the return value still reflects the original input either way,
	 * since that field is only overwritten on a successful detection.
	 */
	public function test_check_ffmpeg_exists_retries_once_when_given_the_binarys_own_path(): void {
		$tester             = $this->tester();
		$result_with_binary = $tester->check_ffmpeg_exists( '/usr/bin/ffmpeg' );
		$result_dir_only    = $tester->check_ffmpeg_exists( '/usr/bin' );

		$this->assertFalse( $result_with_binary['ffmpeg_exists'] );
		$this->assertSame( '/usr/bin/ffmpeg', $result_with_binary['app_path'] );
		$this->assertStringNotContainsString( '/usr/bin/ffmpeg/ffmpeg', implode( '', $result_with_binary['output'] ) );

		// Once corrected, the retry attempts the exact same command as
		// passing the containing directory directly -- same shell error
		// either way, independent of this host's exact shell wording.
		$this->assertSame( $result_dir_only['output'], $result_with_binary['output'] );
	}

	public function test_check_ffmpeg_exists_reports_an_empty_path_distinctly(): void {
		$result = $this->tester()->check_ffmpeg_exists( '' );

		$this->assertFalse( $result['ffmpeg_exists'] );
		$this->assertStringContainsString( '(empty)', $result['ffmpeg_error'] );
	}
}
