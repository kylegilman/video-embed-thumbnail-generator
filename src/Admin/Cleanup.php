<?php

namespace Videopack\Admin;

class Cleanup {

	public function cleanup_generated_logfiles_handler( $logfile ) {

		$lastmodified = '';

		if ( strpos( $logfile, '_encode.txt' ) !== false
			&& file_exists( $logfile )
		) {
			$lastmodified = filemtime( $logfile );
		}
		if ( $lastmodified != false ) {
			if ( time() - $lastmodified > 120 ) {
				wp_delete_file( $logfile );
			} else {
				$timestamp = wp_next_scheduled( 'videopack_cleanup_generated_logfiles' );
				wp_unschedule_event( $timestamp, 'videopack_cleanup_generated_logfiles' );
				$args = array( 'logfile' => $logfile );
				wp_schedule_single_event( time() + 600, 'videopack_cleanup_generated_logfiles', $args );
			}
		}
	}

	public function cleanup_generated_thumbnails_handler() {

		$uploads = wp_upload_dir();

		if ( Filesystem::can_write_direct( $uploads['path'] . '/thumb_tmp' ) ) {
			global $wp_filesystem;
			$wp_filesystem->rmdir( $uploads['path'] . '/thumb_tmp', true ); // remove the whole tmp file directory
		}
	}

	public function schedule( $arg ) {
		// schedules deleting all tmp thumbnails or logfiles if no files are generated in an hour

		if ( $arg == 'thumbs' ) {
			$timestamp = wp_next_scheduled( 'videopack_cleanup_generated_thumbnails' );
			wp_unschedule_event( $timestamp, 'videopack_cleanup_generated_thumbnails' );
			wp_schedule_single_event( time() + 3600, 'videopack_cleanup_generated_thumbnails' );
		} else {
			$timestamp = wp_next_scheduled( 'videopack_cleanup_generated_logfiles' );
			wp_unschedule_event( $timestamp, 'videopack_cleanup_generated_logfiles' );
			$args = array( 'logfile' => $arg );
			wp_schedule_single_event( time() + 600, 'videopack_cleanup_generated_logfiles', $args );
		}
	}

	public function delete_transients() {

		global $wpdb;

		delete_expired_transients();

		$t = esc_sql( '_transient_timeout_kgvid%' );

		$transients = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT option_name
				FROM $wpdb->options
				WHERE option_name LIKE %s",
				$t
			)
		);

		if ( $transients && is_array( $transients ) ) {
			foreach ( $transients as $transient ) {

				// Strip away the WordPress prefix in order to arrive at the transient key.
				$key = str_replace( '_transient_timeout_', '', $transient );

				// Now that we have the key, use WordPress core to the delete the transient.
				delete_transient( $key );

			}
		}
	}
}
