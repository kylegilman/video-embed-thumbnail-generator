<?php
/**
 * Tests for Debug_Logger -- format_bytes()'s human-readable byte formatting
 * and measure()'s callback-timing wrapper. Previously completely untested.
 */

use Videopack\Common\Debug_Logger;

class DebugLoggerTest extends WP_UnitTestCase {

	protected function format_bytes( $bytes ): string {
		$method = new ReflectionMethod( Debug_Logger::class, 'format_bytes' );
		$method->setAccessible( true );
		return $method->invoke( null, $bytes );
	}

	// -----------------------------------------------------------------
	// format_bytes()
	// -----------------------------------------------------------------

	public function test_zero_bytes(): void {
		$this->assertSame( '0 B', $this->format_bytes( 0 ) );
	}

	public function test_bytes_under_a_kilobyte_stay_in_bytes(): void {
		$this->assertSame( '512 B', $this->format_bytes( 512 ) );
	}

	public function test_exactly_one_kilobyte(): void {
		$this->assertSame( '1 KB', $this->format_bytes( 1024 ) );
	}

	public function test_one_and_a_half_kilobytes(): void {
		$this->assertSame( '1.5 KB', $this->format_bytes( 1536 ) );
	}

	public function test_exactly_one_megabyte(): void {
		$this->assertSame( '1 MB', $this->format_bytes( 1024 * 1024 ) );
	}

	public function test_exactly_one_gigabyte(): void {
		$this->assertSame( '1 GB', $this->format_bytes( 1024 * 1024 * 1024 ) );
	}

	public function test_caps_at_terabytes_rather_than_an_undefined_unit(): void {
		// 1024^5 bytes would be a petabyte, one unit past the largest
		// defined ('TB') -- confirms the $pow clamp keeps it in TB instead
		// of producing an undefined array index.
		$this->assertStringEndsWith( ' TB', $this->format_bytes( 1024 ** 5 ) );
	}

	/**
	 * measure()'s mem_change can be genuinely negative (memory usage
	 * dropping between the start and end of a callback, e.g. from garbage
	 * collection) -- format_bytes() clamps negative input to 0 via
	 * max( $bytes, 0.0 ), so any decrease in memory is reported identically
	 * to "no change" rather than showing the actual negative delta. This
	 * test documents that current behavior rather than asserting a fix.
	 */
	public function test_negative_bytes_are_clamped_to_zero_rather_than_shown_as_negative(): void {
		$this->assertSame( '0 B', $this->format_bytes( -2048 ) );
	}

	// -----------------------------------------------------------------
	// measure()
	// -----------------------------------------------------------------

	public function test_measure_returns_the_callbacks_result(): void {
		$result = Debug_Logger::measure(
			'test',
			static function () {
				return 'callback result';
			}
		);

		$this->assertSame( 'callback result', $result );
	}

	public function test_measure_actually_invokes_the_callback(): void {
		$called = false;

		Debug_Logger::measure(
			'test',
			static function () use ( &$called ) {
				$called = true;
			}
		);

		$this->assertTrue( $called );
	}

	public function test_measure_propagates_the_callbacks_return_value_type(): void {
		$result = Debug_Logger::measure(
			'test',
			static function () {
				return array( 'a', 'b', 'c' );
			}
		);

		$this->assertSame( array( 'a', 'b', 'c' ), $result );
	}

	// -----------------------------------------------------------------
	// log()
	// -----------------------------------------------------------------

	public function test_log_does_not_throw_regardless_of_wp_debug_state(): void {
		// Whichever way WP_DEBUG is actually configured in this
		// environment, log() must never itself throw or fatal.
		Debug_Logger::log( 'test message', array( 'key' => 'value' ) );
		Debug_Logger::log( 'test message with backtrace', array(), true );
		$this->assertTrue( true );
	}
}
