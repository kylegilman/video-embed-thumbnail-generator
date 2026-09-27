<?php
/**
 * Tests for FFmpeg_Process -- the Symfony Process subclass real encoding
 * jobs run through. Its whole reason to exist is the __destruct() override:
 * Symfony's own Process::__destruct() calls $this->stop(0) (SIGTERM, then
 * SIGKILL) on a still-running process, which would kill a real in-progress
 * ffmpeg encode the moment the PHP request that started it ends (e.g. after
 * an async admin-ajax dispatch returns). Previously completely untested.
 */

use Videopack\Admin\Encode\FFmpeg_Process;

class FFmpegProcessTest extends WP_UnitTestCase {

	/**
	 * @var int[] PIDs started during a test, force-killed in tear_down() in
	 * case a test fails before its own cleanup runs.
	 */
	protected $started_pids = array();

	public function tear_down() {
		// The pcntl extension (which defines the SIGKILL constant) isn't
		// available in this environment -- 9 is SIGKILL on every POSIX
		// system this suite runs on.
		foreach ( $this->started_pids as $pid ) {
			if ( posix_kill( $pid, 0 ) ) {
				posix_kill( $pid, 9 );
			}
		}
		$this->started_pids = array();
		parent::tear_down();
	}

	public function test_get_name_identifies_it_as_an_ffmpeg_process(): void {
		$this->assertSame( 'ffmpeg process', ( new FFmpeg_Process( array( 'true' ) ) )->getName() );
	}

	/**
	 * Starts a real background process and forces it out of scope to prove
	 * the process survives -- the actual bug this class exists to prevent.
	 * Symfony's Process holds an internal reference cycle (its I/O pipe
	 * wrapper closes back over $this), so unset() alone only drops it to
	 * PHP's cycle collector rather than triggering __destruct() immediately;
	 * gc_collect_cycles() forces that collection so the assertion isn't
	 * racing an unpredictable GC pass.
	 */
	protected function start_and_destroy_process(): int {
		$process = new FFmpeg_Process( array( 'sleep', '3' ) );
		$process->start();
		$pid                  = $process->getPid();
		$this->started_pids[] = $pid;
		unset( $process );
		gc_collect_cycles();
		return $pid;
	}

	public function test_destructor_does_not_stop_a_still_running_process(): void {
		$pid = $this->start_and_destroy_process();

		$this->assertTrue( posix_kill( $pid, 0 ), 'Process should still be alive after FFmpeg_Process was destroyed.' );
	}
}
