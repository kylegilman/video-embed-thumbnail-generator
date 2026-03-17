<?php
/**
 * Admin cleanup handler.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

/**
 * Class Cleanup
 *
 * Handles temporary file and transient deletion.
 *
 * This class provides methods for cleaning up generated log files, temporary
 * thumbnail directories, and plugin-specific transients to maintain a clean
 * filesystem and database.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Cleanup {

	/**
	 * Handler for cleaning up generated log files.
	 *
	 * @param string $logfile Path to the log file.
	 */
	public function cleanup_generated_logfiles_handler( $logfile ) {
		$logfile      = (string) $logfile;
		$lastmodified = false;

		if ( strpos( $logfile, '_encode.txt' ) !== false
			&& file_exists( $logfile )
		) {
			$lastmodified = filemtime( $logfile );
		}

		if ( false !== $lastmodified ) {
			if ( time() - $lastmodified > 120 ) {
				wp_delete_file( $logfile );
			} else {
				$timestamp = wp_next_scheduled( 'videopack_cleanup_generated_logfiles' );
				if ( $timestamp ) {
					wp_unschedule_event( $timestamp, 'videopack_cleanup_generated_logfiles' );
				}
				$args = array( 'logfile' => $logfile );
				wp_schedule_single_event( time() + 600, 'videopack_cleanup_generated_logfiles', $args );
			}
		}
	}

	/**
	 * Handler for cleaning up generated temporary thumbnails.
	 */
	public function cleanup_generated_thumbnails_handler() {
		$uploads = wp_upload_dir();

		if ( \Videopack\Admin\Filesystem::can_write_direct( (string) $uploads['path'] . '/thumb_tmp' ) ) {
			global $wp_filesystem;
			if ( $wp_filesystem instanceof \WP_Filesystem_Base ) {
				$wp_filesystem->rmdir( (string) $uploads['path'] . '/thumb_tmp', true ); // Remove the whole tmp file directory.
			}
		}
	}

	/**
	 * Schedules a cleanup event.
	 *
	 * @param string $arg The type of cleanup ('thumbs' or a logfile path).
	 */
	public function schedule( $arg ) {
		$arg = (string) $arg;

		if ( 'thumbs' === $arg ) {
			$timestamp = wp_next_scheduled( 'videopack_cleanup_generated_thumbnails' );
			if ( $timestamp ) {
				wp_unschedule_event( $timestamp, 'videopack_cleanup_generated_thumbnails' );
			}
			wp_schedule_single_event( time() + 3600, 'videopack_cleanup_generated_thumbnails' );
		} else {
			$timestamp = wp_next_scheduled( 'videopack_cleanup_generated_logfiles' );
			if ( $timestamp ) {
				wp_unschedule_event( $timestamp, 'videopack_cleanup_generated_logfiles' );
			}
			$args = array( 'logfile' => $arg );
			wp_schedule_single_event( time() + 600, 'videopack_cleanup_generated_logfiles', $args );
		}
	}

	/**
	 * Deletes all Videopack-related transients.
	 */
	public function delete_transients() {
		global $wpdb;

		if ( function_exists( 'delete_expired_transients' ) ) {
			delete_expired_transients();
		}

		$search_pattern = esc_sql( '_transient_timeout_kgvid%' );

		$transients = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT option_name
				FROM $wpdb->options
				WHERE option_name LIKE %s",
				$search_pattern
			)
		);

		if ( is_array( $transients ) ) {
			foreach ( $transients as $transient ) {
				// Strip away the WordPress prefix in order to arrive at the transient key.
				$key = (string) str_replace( '_transient_timeout_', '', (string) $transient );

				// Now that we have the key, use WordPress core to delete the transient.
				delete_transient( $key );
			}
		}
	}
}
