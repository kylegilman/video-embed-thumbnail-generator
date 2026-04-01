<?php
/**
 * Admin cleanup handler.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

use Videopack\Common\Hook_Subscriber;

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
class Cleanup implements Hook_Subscriber {

	/**
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'videopack_cleanup_generated_thumbnails',
				'callback' => 'cleanup_generated_thumbnails_handler',
			),
			array(
				'hook'     => 'init',
				'callback' => 'schedule_weekly_cleanup',
			),
		);
	}

	/**
	 * Returns an array of filters to subscribe to.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array();
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
	 * Schedules a cleanup event for temporary thumbnails.
	 *
	 * @param string $arg The type of cleanup (only 'thumbs' is supported).
	 */
	public function schedule( $arg ) {
		$arg = (string) $arg;

		if ( 'thumbs' === $arg ) {
			$timestamp = wp_next_scheduled( 'videopack_cleanup_generated_thumbnails' );
			if ( $timestamp ) {
				wp_unschedule_event( $timestamp, 'videopack_cleanup_generated_thumbnails' );
			}
			wp_schedule_single_event( time() + 3600, 'videopack_cleanup_generated_thumbnails' );
		}
	}

	/**
	 * Schedules the weekly cleanup action if not already scheduled.
	 * Fires on the 'init' hook to ensure Action Scheduler is loaded.
	 *
	 * @since 5.0.0
	 */
	public function schedule_weekly_cleanup() {
		if ( ! class_exists( 'ActionScheduler' ) ) {
			return;
		}

		if ( ! \ActionScheduler::store()->query_actions(
			array(
				'hook'   => 'videopack_cleanup_queue',
				'status' => \ActionScheduler_Store::STATUS_PENDING,
			)
		) ) {
			as_schedule_recurring_action(
				time(),
				WEEK_IN_SECONDS,
				'videopack_cleanup_queue',
				array(
					'type' => 'weekly',
				),
				'videopack_queue_management'
			);
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

		$transients = $wpdb->get_col(
			"SELECT option_name
			FROM $wpdb->options
			WHERE option_name LIKE '_transient_timeout_kgvid%'
			OR option_name LIKE '_transient_timeout_videopack%'"
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
