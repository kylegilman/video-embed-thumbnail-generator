<?php

namespace Videopack\Common;

/**
 * Class Debug_Logger
 *
 * Provides utilities for logging performance and debug information.
 */
class Debug_Logger {

	/**
	 * Log a message to the debug log.
	 *
	 * @param string $message The message to log.
	 * @param array  $context Optional context data.
	 */
	public static function log( $message, array $context = array() ) {
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return;
		}

		$log_message = sprintf( '[Videopack] %s', $message );
		if ( ! empty( $context ) ) {
			$log_message .= ' | Context: ' . wp_json_encode( $context );
		}

		error_log( $log_message );
	}

	/**
	 * Log the performance of a callback.
	 *
	 * @param string   $label    The label for the log entry.
	 * @param callable $callback The callback to measure.
	 * @return mixed The result of the callback.
	 */
	public static function measure( $label, callable $callback ) {
		$start_time = microtime( true );
		$start_mem  = memory_get_usage();

		$result = call_user_func( $callback );

		$end_time = microtime( true );
		$end_mem  = memory_get_usage();

		self::log(
			sprintf( 'Performance: %s', $label ),
			array(
				'duration'   => round( $end_time - $start_time, 4 ) . 's',
				'mem_change' => self::format_bytes( $end_mem - $start_mem ),
				'peak_mem'   => self::format_bytes( memory_get_peak_usage() ),
			)
		);

		return $result;
	}

	/**
	 * Format bytes into human-readable format.
	 *
	 * @param int $bytes Bytes to format.
	 * @return string
	 */
	private static function format_bytes( $bytes ) {
		$units  = array( 'B', 'KB', 'MB', 'GB', 'TB' );
		$bytes  = max( $bytes, 0 );
		$pow    = floor( ( $bytes ? log( $bytes ) : 0 ) / log( 1024 ) );
		$pow    = min( $pow, count( $units ) - 1 );
		$bytes /= pow( 1024, $pow );

		return round( $bytes, 2 ) . ' ' . $units[ $pow ];
	}
}
