<?php
/**
 * Debug logging utility.
 *
 * @package Videopack
 */

namespace Videopack\Common;

/**
 * Class Debug_Logger
 *
 * Provides utilities for logging performance and debug information.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Common
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Debug_Logger {

	/**
	 * Log a message to the debug log.
	 *
	 * @param string $message The message to log.
	 * @param array  $context Optional context data.
	 * @return void
	 */
	public static function log( $message, array $context = array() ) {
		if ( ! defined( 'WP_DEBUG' ) || ! (bool) WP_DEBUG ) {
			return;
		}

		$log_message = (string) sprintf( '[Videopack] %s', (string) $message );
		if ( ! empty( $context ) ) {
			$log_message .= ' | Context: ' . (string) wp_json_encode( (array) $context );
		}

		error_log( $log_message ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
	}

	/**
	 * Log the performance of a callback.
	 *
	 * @param string   $label    The label for the log entry.
	 * @param callable $callback The callback to measure.
	 * @return mixed The result of the callback.
	 */
	public static function measure( $label, callable $callback ) {
		$start_time = (float) microtime( true );
		$start_mem  = (int) memory_get_usage();

		$result = call_user_func( $callback );

		$end_time = (float) microtime( true );
		$end_mem  = (int) memory_get_usage();

		self::log(
			(string) sprintf( 'Performance: %s', (string) $label ),
			array(
				'duration'   => (string) ( round( (float) ( $end_time - $start_time ), 4 ) . 's' ),
				'mem_change' => (string) self::format_bytes( (int) ( $end_mem - $start_mem ) ),
				'peak_mem'   => (string) self::format_bytes( (int) memory_get_peak_usage() ),
			)
		);

		return $result;
	}

	/**
	 * Format bytes into human-readable format.
	 *
	 * @param int $bytes Bytes to format.
	 * @return string The formatted string.
	 */
	private static function format_bytes( $bytes ) {
		$units = array( 'B', 'KB', 'MB', 'GB', 'TB' );
		$bytes = (float) max( (float) $bytes, 0.0 );
		$pow   = (int) floor( ( (float) $bytes > 0.0 ? log( (float) $bytes ) : 0.0 ) / log( 1024.0 ) );
		$pow   = (int) min( $pow, count( $units ) - 1 );
		$val   = (float) ( $bytes / pow( 1024.0, $pow ) );

		return (string) ( round( $val, 2 ) . ' ' . $units[ $pow ] );
	}
}
