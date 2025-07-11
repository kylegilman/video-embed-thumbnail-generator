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

	public function clear_completed_queue( $type, $scope = 'site' ) {

		$user_ID = get_current_user_id();

		$video_encode_queue = kgvid_get_encode_queue();

		if ( ! empty( $video_encode_queue )
			&& is_array( $video_encode_queue )
		) {

			$video_encode_queue  = array_reverse( $video_encode_queue );
			$keep                = array();
			$cleared_video_queue = array();

			foreach ( $video_encode_queue as $video_key => $queue_entry ) {

				if ( array_key_exists( 'encode_formats', $queue_entry ) && ! empty( $queue_entry['encode_formats'] ) ) {

					foreach ( $queue_entry['encode_formats'] as $format => $value ) {

						if ( $value['status'] == 'encoding' ) { // if it's not completed yet

							if ( $type != 'all' ) {
								$keep[ $video_key ] = true;
							} elseif ( ! is_multisite()
								|| ( is_network_admin() && $scope === 'network' )
								|| ( array_key_exists( 'blog_id', $queue_entry ) && $queue_entry['blog_id'] === get_current_blog_id() )
							) {
								kgvid_cancel_encode( $video_key, $format );
								if ( array_key_exists( 'filepath', $value ) && file_exists( $value['filepath'] ) ) {
									wp_delete_file( $value['filepath'] );
								}
							} else {
								$keep[ $video_key ] = true;
							}
						}

						if ( ( $type == 'manual' && $value['status'] === 'queued' )
							|| ( $type == 'queued' && $value['status'] === 'Encoding Complete' )
							|| ( $type == 'scheduled' && $value['status'] === 'queued' )
						) {
							$keep[ $video_key ] = true;
						}

						if ( $type == 'scheduled'
							&& $value['status'] == 'Encoding Complete'
							&& array_key_exists( 'ended', $value )
						) {
							if ( count( $keep ) < 50 && time() - intval( $value['ended'] ) < WEEK_IN_SECONDS ) { // if there are fewer than 50 entries left in the queue and it finished less than a week ago
								$keep[ $video_key ] = true;
							}
						}

						if ( is_multisite() && $type != 'scheduled' && current_user_can( 'encode_videos' ) &&
							(
								( $scope == 'site' && array_key_exists( 'blog_id', $queue_entry ) && $queue_entry['blog_id'] != get_current_blog_id() )
								|| ( ! current_user_can( 'edit_others_video_encodes' ) && $user_ID != $queue_entry['user_id'] )
								|| ( $scope != 'site' && ! current_user_can( 'manage_network' ) )
							)
						) { // only clear entries from current blog
							$keep[ $video_key ] = true;
							break;
						}
					}
				}
			}
			$keep = array_reverse( $keep );
			foreach ( $keep as $video_key => $value ) {
				$cleared_video_queue[] = $video_encode_queue[ $video_key ];
			}
			$cleared_video_queue = array_merge( $cleared_video_queue );

			if ( ! empty( $cleared_video_queue )
				&& ! wp_next_scheduled( 'kgvid_cleanup_queue', array( 'scheduled' ) )
			) {
				wp_schedule_single_event( time() + DAY_IN_SECONDS, 'kgvid_cleanup_queue', array( 'scheduled' ) );
			}

			kgvid_save_encode_queue( $cleared_video_queue );

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
