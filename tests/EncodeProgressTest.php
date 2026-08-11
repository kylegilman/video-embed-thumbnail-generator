<?php
/**
 * Tests for Encode_Progress::from_log_file() -- parses FFmpeg's own
 * `-progress` key=value log output (as written to a file by the running
 * encode) into the percent/elapsed/remaining data the admin queue UI
 * polls. Never tested before; log parsing is exactly the kind of code
 * where an off-by-one in a byte offset or a wrong unit-conversion
 * heuristic silently produces a wrong percentage instead of an error.
 */

use Videopack\Admin\Encode\Encode_Progress;

class EncodeProgressTest extends WP_UnitTestCase {

	/**
	 * @var string[] Temp files created during the test, cleaned up in tear_down().
	 */
	protected $temp_files = array();

	public function tear_down() {
		foreach ( $this->temp_files as $file ) {
			if ( file_exists( $file ) ) {
				wp_delete_file( $file );
			}
		}
		$this->temp_files = array();
		parent::tear_down();
	}

	protected function log_file( string $contents ): string {
		$file               = (string) tempnam( sys_get_temp_dir(), 'videopack-progress-test-' );
		$this->temp_files[] = $file;
		file_put_contents( $file, $contents ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		return $file;
	}

	protected function progress_block( array $fields ): string {
		$defaults = array(
			'frame'       => '100',
			'fps'         => '25.00',
			'stream'      => '0:0',
			'bitrate'     => '1000.0kbits/s',
			'total_size'  => '125000',
			'out_time_us' => '4000000',
			'out_time_ms' => '4000000',
			'out_time'    => '00:00:04.000000',
			'dup_frames'  => '0',
			'drop_frames' => '0',
			'speed'       => '1.02x',
			'progress'    => 'continue',
		);
		$fields = array_merge( $defaults, $fields );
		$lines  = array();
		foreach ( $fields as $key => $value ) {
			$lines[] = "{$key}={$value}";
		}
		return implode( "\n", $lines ) . "\n";
	}

	// -----------------------------------------------------------------

	public function test_missing_log_file_returns_default_zero_progress(): void {
		$progress = Encode_Progress::from_log_file( '/tmp/videopack-does-not-exist-' . wp_generate_password( 12, false ) . '.txt', 8000000 );

		$data = $progress->to_array();
		$this->assertSame( 0, $data['percent'] );
		$this->assertNull( $data['out_time_us'] );
	}

	public function test_empty_log_file_returns_default_zero_progress(): void {
		$file     = $this->log_file( '' );
		$progress = Encode_Progress::from_log_file( $file, 8000000 );

		$this->assertSame( 0, $progress->to_array()['percent'] );
	}

	public function test_parses_a_normal_progress_block_into_percent(): void {
		$file = $this->log_file( $this->progress_block( array( 'out_time_us' => '4000000' ) ) );
		// 8,000,000us total duration, 4,000,000us elapsed -- 50%.
		$progress = Encode_Progress::from_log_file( $file, 8000000 );

		$data = $progress->to_array();
		$this->assertSame( 50.0, $data['percent'] );
		$this->assertSame( '100', $data['frame'] );
		$this->assertSame( '1.02x', $data['speed'] );
	}

	public function test_na_values_are_skipped_and_out_time_ms_used_instead(): void {
		$file = $this->log_file(
			$this->progress_block(
				array(
					'out_time_us' => 'N/A',
					'out_time_ms' => '4000', // A normal millisecond value.
				)
			)
		);
		// video_duration is 8,000,000us == 8000ms; out_time_ms(4000) is not
		// larger than 8000 * 1.5 = 12000, so it's treated as real
		// milliseconds and multiplied by 1000 -> 4,000,000us -> 50%.
		$progress = Encode_Progress::from_log_file( $file, 8000000 );

		$this->assertSame( 50.0, $progress->to_array()['percent'] );
	}

	public function test_out_time_ms_field_holding_microseconds_is_detected_by_magnitude(): void {
		$file = $this->log_file(
			$this->progress_block(
				array(
					'out_time_us' => 'N/A',
					// Some FFmpeg versions mislabel microseconds as
					// out_time_ms. 4,000,000 is far larger than
					// (8000ms * 1.5) = 12000, so it must be interpreted
					// directly as microseconds, not multiplied by 1000
					// (which would wildly overshoot 100%).
					'out_time_ms' => '4000000',
				)
			)
		);
		$progress = Encode_Progress::from_log_file( $file, 8000000 );

		$this->assertSame( 50.0, $progress->to_array()['percent'] );
	}

	public function test_all_na_values_leave_percent_at_zero(): void {
		$file = $this->log_file(
			$this->progress_block(
				array(
					'out_time_us' => 'N/A',
					'out_time_ms' => 'N/A',
				)
			)
		);
		$progress = Encode_Progress::from_log_file( $file, 8000000 );

		$this->assertSame( 0, $progress->to_array()['percent'] );
	}

	public function test_zero_duration_never_divides_by_zero_and_leaves_percent_at_zero(): void {
		$file     = $this->log_file( $this->progress_block( array( 'out_time_us' => '4000000' ) ) );
		$progress = Encode_Progress::from_log_file( $file, 0 );

		$this->assertSame( 0, $progress->to_array()['percent'] );
	}

	public function test_percent_never_exceeds_100_even_if_out_time_overshoots_duration(): void {
		$file     = $this->log_file( $this->progress_block( array( 'out_time_us' => '9000000' ) ) );
		$progress = Encode_Progress::from_log_file( $file, 8000000 );

		// min(100, round(...)) -- when the rounded value exceeds 100, PHP's
		// min() returns the literal int 100, not a float, since that's the
		// smaller of the two operands' actual values/types.
		$this->assertSame( 100, $progress->to_array()['percent'] );
	}

	public function test_reads_the_most_recent_progress_block_when_the_log_has_several(): void {
		// FFmpeg appends a new block on every -progress interval, so a
		// real log accumulates many. Pad the first block well past the
		// 8192-byte tail window from_log_file() reads, so parsing must
		// pick up the LAST block's values, not the first's.
		$first_block  = $this->progress_block(
			array(
				'out_time_us' => '1000000', // Would be 12.5% if wrongly used.
				'bitrate'     => str_pad( '500.0kbits/s', 9000, 'x' ),
			)
		);
		$second_block = $this->progress_block( array( 'out_time_us' => '6000000' ) ); // 75%.

		$file     = $this->log_file( $first_block . $second_block );
		$progress = Encode_Progress::from_log_file( $file, 8000000 );

		$this->assertSame( 75.0, $progress->to_array()['percent'] );
	}

	public function test_elapsed_and_remaining_are_estimated_from_started_timestamp(): void {
		// 10 seconds elapsed at 50% -> total estimated 20s -> ~10s remaining.
		$file     = $this->log_file( $this->progress_block( array( 'out_time_us' => '4000000' ) ) );
		$progress = Encode_Progress::from_log_file( $file, 8000000, time() - 10 );

		$data = $progress->to_array();
		$this->assertGreaterThanOrEqual( 9, $data['elapsed'] );
		$this->assertLessThanOrEqual( 11, $data['elapsed'] );
		$this->assertGreaterThanOrEqual( 8, $data['remaining'] );
		$this->assertLessThanOrEqual( 12, $data['remaining'] );
	}

	public function test_finished_helper_returns_complete_state_without_a_log_file(): void {
		$progress = Encode_Progress::finished( 8000000, time() - 30, 42 );

		$data = $progress->to_array();
		$this->assertSame( 100.0, $data['percent'] );
		$this->assertSame( 'end', $data['progress'] );
		$this->assertSame( 42, $data['job_id'] );
	}
}
