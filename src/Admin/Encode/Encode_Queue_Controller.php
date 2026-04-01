<?php
/**
 * Manages the video encoding queue.
 *
 * @link       https://www.videopack.video
 * @since      5.0.0
 *
 * @package    Videopack
 * @subpackage Videopack/Admin/Encode
 */

namespace Videopack\Admin\Encode;

use ActionScheduler;
use Videopack\Common\Debug_Logger;
use Videopack\Common\Hook_Subscriber;

/**
 * Class Encode_Queue_Controller
 *
 * Manages the video encoding queue, including job dispatching, status tracking,
 * and cleanup of temporary files. It utilizes ActionScheduler for background
 * processing of encoding tasks.
 *
 * @package Videopack
 * @subpackage Videopack/Admin/Encode
 */
class Encode_Queue_Controller implements Hook_Subscriber {

	/**
	 * Local options for the current blog.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $format_registry
	 */
	protected $format_registry;

	/**
	 * Encode queue log instance.
	 *
	 * @var Encode_Queue_Log $queue_log
	 */
	protected $queue_log;

	/**
	 * The name of the database table for the encoding queue.
	 *
	 * @var string $queue_table_name
	 */
	protected $queue_table_name;

	/**
	 * Cache for video durations during a request.
	 *
	 * @var array $video_durations
	 */
	protected $video_durations = array();

	/**
	 * Constructor.
	 *
	 * Initializes the controller, sets up the database table name, and loads options.
	 *
	 * @param array                             $options  Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry = null ) {
		$this->options         = (array) $options;
		$this->format_registry = $format_registry ? $format_registry : new \Videopack\Admin\Formats\Registry( $this->options );
		$this->queue_log       = new Encode_Queue_Log( $this->format_registry );

		global $wpdb;
		if ( is_multisite() && \Videopack\Admin\Multisite::is_videopack_active_for_network() ) {
			$main_site_id           = (int) ( defined( 'BLOG_ID_CURRENT_SITE' ) ? BLOG_ID_CURRENT_SITE : 1 );
			$this->queue_table_name = (string) ( $wpdb->get_blog_prefix( $main_site_id ) . 'videopack_encoding_queue' );
		} else {
			$this->queue_table_name = (string) ( $wpdb->prefix . 'videopack_encoding_queue' );
		}
	}

	/**
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'rest_api_init',
				'callback' => 'start_queue',
			),
			array(
				'hook'     => 'videopack_process_pending_jobs',
				'callback' => 'process_pending_jobs_action',
			),
			array(
				'hook'     => 'videopack_trigger_queue_heartbeat',
				'callback' => 'schedule_immediate_heartbeat',
			),
			array(
				'hook'     => 'videopack_handle_job',
				'callback' => 'handle_job_action',
			),
			array(
				'hook'     => 'videopack_cleanup_queue',
				'callback' => 'clear_completed_queue',
				'priority' => 10,
				'accepted_args' => 2,
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
	 * Ensures the database table exists.
	 */
	public function ensure_table_exists() {
		static $checked = false;
		if ( $checked ) {
			return;
		}

		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $this->queue_table_name ) ) === $this->queue_table_name ) {
			$checked = true;
			return;
		}

		$this->add_table();
		$checked = true;
	}

	/**
	 * Creates or updates the encoding queue database table.
	 */
	public function add_table() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$this->queue_table_name} (
			id BIGINT UNSIGNED AUTO_INCREMENT,
			blog_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
			attachment_id BIGINT UNSIGNED NULL,
			output_attachment_id BIGINT UNSIGNED NULL,
			input_url VARCHAR(1024) NOT NULL,
			format_id VARCHAR(100) NOT NULL,
			status ENUM('queued', 'processing', 'encoding', 'needs_insert', 'pending_replacement', 'completed', 'failed', 'canceled', 'deleted') NOT NULL DEFAULT 'queued',
			output_path VARCHAR(1024) NULL,
			output_url VARCHAR(1024) NULL,
			user_id BIGINT UNSIGNED NULL,
			pid INT NULL,
			logfile_path VARCHAR(1024) NULL,
			action_id BIGINT UNSIGNED NULL,
			video_title VARCHAR(255) NULL,
			video_duration BIGINT UNSIGNED NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			started_at DATETIME NULL,
			completed_at DATETIME NULL,
			failed_at DATETIME NULL,
			error_message TEXT NULL,
			temp_watermark_path VARCHAR(1024) NULL,
			retry_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
			encode_options_hash VARCHAR(32) NULL,
			mailed TINYINT(1) NOT NULL DEFAULT 0,
			PRIMARY KEY  (id),
			KEY idx_blog_id (blog_id),
			KEY idx_attachment_id_blog_id (attachment_id, blog_id),
			KEY idx_input_url_blog_id (input_url(191), blog_id),
			KEY idx_format_id (format_id),
			KEY idx_status_blog_id (status, blog_id),
			KEY idx_action_id (action_id),
			KEY idx_video_title (video_title(191))
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );
	}

	/**
	 * Starts the encoding queue and schedules the heartbeat action.
	 */
	public function start_queue() {
		global $wpdb;
		$this->options['queue_control'] = 'play';
		update_option( 'videopack_options', $this->options );
		// Trigger a one-off action to process any 'queued' items with a short delay to allow batching.
		$this->schedule_immediate_heartbeat();
		// Ensure a recurring heartbeat is scheduled every 5 minutes.
		if ( ! as_has_scheduled_action( 'videopack_process_pending_jobs', array( 'interval' => 300 ), 'videopack_queue_management' ) ) {
			as_schedule_recurring_action( time() + 300, 300, 'videopack_process_pending_jobs', array( 'interval' => 300 ), 'videopack_queue_management' );
		}
	}

	/**
	 * Pauses the encoding queue.
	 */
	public function pause_queue() {
		global $wpdb;
		$this->options['queue_control'] = 'pause';
		update_option( 'videopack_options', $this->options );
	}

	/**
	 * Schedule the encoding job.
	 * Add jobs to the custom DB table video_encoding_queue
	 * and scheduling an ActionScheduler task to handle each job.
	 *
	 * @param array $args {
	 *     Required. An array of arguments.
	 *     @type int|string $id      Attachment ID or unique identifier for external URLs.
	 *     @type string     $url     Input URL of the video.
	 *     @type array      $formats Array of format_id strings to encode.
	 * }
	 * @return array Log of actions taken.
	 */
	public function enqueue_encodes( array $args ) {
		$required = array(
			'id',
			'url',
			'formats',
		);

		if ( ! $this->required_keys( $args, $required ) || ! is_array( $args['formats'] ) || empty( $args['formats'] ) ) {
			$this->queue_log->add_to_log( 'error_invalid_args' );
			return array(
				'log'     => $this->queue_log->get_log(),
				'results' => array(),
			);
		}

		$this->ensure_table_exists();

		$attachment_identifier     = sanitize_text_field( $args['id'] );
		$input_url                 = esc_url_raw( $args['url'] );
		$user_id                   = get_current_user_id();
		$current_blog_id           = get_current_blog_id();
		$encoder                   = new Encode_Attachment( $this->options, $this->format_registry, $attachment_identifier, $input_url );
		$formats_to_encode         = (array) $this->resolve_replacement_formats( $args['formats'], $encoder );
		$results                   = array();
		$successfully_queued_names = array();
		$video_formats_objects     = $this->format_registry->get_video_formats();

		foreach ( $formats_to_encode as $format_to_encode ) {
			$format_id    = sanitize_text_field( $format_to_encode );
			$queue_result = $encoder->queue_format( $format_id, $user_id, $current_blog_id );
			$this->queue_log->add_to_log( $queue_result['reason'] ?? $queue_result['status'], $format_id );
			$results[ $format_id ] = $queue_result;
			if ( isset( $queue_result['status'] ) && 'success' === $queue_result['status'] ) {
				$name                        = ( is_array( $video_formats_objects ) && isset( $video_formats_objects[ $format_id ] ) )
					? $video_formats_objects[ $format_id ]->get_name()
					: $format_id;
				$successfully_queued_names[] = $name;
			}
		}
		// After enqueuing, trigger the queue processor with a short delay.
		$this->schedule_immediate_heartbeat();
		// Ensure a recurring heartbeat is scheduled every 5 minutes.
		if ( ! as_has_scheduled_action( 'videopack_process_pending_jobs', array( 'interval' => 300 ), 'videopack_queue_management' ) ) {
			as_schedule_recurring_action( time() + 300, 300, 'videopack_process_pending_jobs', array( 'interval' => 300 ), 'videopack_queue_management' );
		}

		wp_cache_delete( 'videopack_queue_items_' . $current_blog_id, 'videopack' );
		wp_cache_delete( 'videopack_queue_items_all', 'videopack' );
		return array(
			'log'                => $this->queue_log->get_log(),
			'results'            => $results,
			'new_queue_position' => $this->get_queue_size(),
			'encode_list'        => $successfully_queued_names,
		);
	}

	/**
	 * Get the current size of the active queue.
	 *
	 * @return integer Number of jobs that are queued or processing.
	 */
	public function get_queue_size() {
		$this->ensure_table_exists();
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE status IN (%s, %s, %s)', $this->queue_table_name, Encode_Format::STATUS_QUEUED, Encode_Format::STATUS_PROCESSING, Encode_Format::STATUS_ENCODING ) );
	}

	/**
	 * Checks if all required keys are present in an array.
	 *
	 * @param array $args     The array to check.
	 * @param array $required The list of required keys.
	 * @return bool True if all keys are present, false otherwise.
	 */
	protected function required_keys( array $args, array $required ) {
		foreach ( $required as $key ) {
			if ( ! array_key_exists( $key, $args ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * ActionScheduler callback to handle a specific encoding job based on its current status.
	 *
	 * @param int $job_id The ID of the job in the encoding queue table.
	 */
	public function handle_job_action( $job_id ) {
		$this->ensure_table_exists();
		return Debug_Logger::measure(
			"AS Job Handle: $job_id",
			function () use ( $job_id ) {
				global $wpdb;
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );

				if ( ! $job ) {
					// Log error: job not found.
					return;
				}

				$original_blog_id = false;
				if ( is_multisite() ) {
					$original_blog_id = get_current_blog_id();
					if ( $job['blog_id'] != $original_blog_id ) {
						switch_to_blog( $job['blog_id'] );
					}
				}

				// Re-fetch options in case they changed since constructor.
				// Options should be fetched for the context of $job['blog_id'].
				$this->options = (array) ( new \Videopack\Admin\Options() )->get_options();

				$attachment_id_or_url = ! empty( $job['attachment_id'] ) ? $job['attachment_id'] : $job['input_url'];

				$encoder = new Encode_Attachment( $this->options, $this->format_registry, $attachment_id_or_url, $job['input_url'] );

				switch ( $job['status'] ) {
					case Encode_Format::STATUS_QUEUED:
						// The gatekeeper (process_pending_jobs_action) should prevent this from running if paused, but as a safeguard.
						if ( $this->options['queue_control'] !== 'play' ) {
							as_schedule_single_action( time() + 300, 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' ); // Reschedule if paused.
							return;
						}

						// The queue processor has already checked for capacity. We can proceed.
						// Update job to 'processing'. The `where` clause ensures we only grab it if it's still 'queued'.
						// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
						$updated_rows = $wpdb->update(
							$this->queue_table_name,
							array(
								'status'     => Encode_Format::STATUS_PROCESSING,
								'started_at' => current_time( 'mysql', true ),
							),
							array(
								'id'     => $job_id,
								'status' => Encode_Format::STATUS_QUEUED,
							)
						);

						if ( 0 === $updated_rows ) {
							// This job was already picked up by another process. We can stop.
							return;
						}

						$encode_format_obj = new Encode_Format( $job['format_id'] );
						$encode_format_obj->set_path( $job['output_path'] );
						$encode_format_obj->set_url( $job['output_url'] );
						$encode_format_obj->set_job_id( $job_id );

						$started_format = $encoder->start_encode( $encode_format_obj ); // This starts FFmpeg and updates $encode_format_obj with PID.

						if ( $started_format->get_pid() && $started_format->get_status() === Encode_Format::STATUS_ENCODING ) {
							// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
							$wpdb->update(
								$this->queue_table_name,
								array( // Store PID and logfile path.
									'status'       => Encode_Format::STATUS_ENCODING,
									'pid'          => $started_format->get_pid(),
									'logfile_path' => $started_format->get_logfile(),
								),
								array( 'id' => $job_id )
							);
							as_schedule_single_action( time() + 30, 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );
						} else {
							// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
							$wpdb->update(
								$this->queue_table_name,
								array( // Mark as failed if FFmpeg didn't start.
									'status'        => Encode_Format::STATUS_FAILED,
									'error_message' => 'Failed to start FFmpeg: ' . $started_format->get_error(),
									'failed_at'     => current_time( 'mysql', true ),
								),
								array( 'id' => $job_id )
							);
							$this->send_error_email( $job_id );
						}
						break;

					case Encode_Format::STATUS_ENCODING:
					case Encode_Format::STATUS_PROCESSING:
						$encode_format_obj = Encode_Format::from_array( $job );
						$encode_format_obj->set_status( Encode_Format::STATUS_ENCODING ); // status must be encoding for progress check.

						$progress_status = $encode_format_obj->get_progress(); // This calls set_progress() which updates status.

						if ( $encode_format_obj->get_status() === Encode_Format::STATUS_NEEDS_INSERT ) {
							// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
							$wpdb->update(
								$this->queue_table_name,
								array( // Update status to needs_insert.
									'status'       => Encode_Format::STATUS_NEEDS_INSERT,
									'completed_at' => current_time( 'mysql', true ),
								),
								array( 'id' => $job_id )
							);

							// The encoding finish has freed up a slot!
							// Trigger the gatekeeper to start the next job immediately.
							$this->schedule_immediate_heartbeat();

							// Instead of rescheduling, just handle the insertion now.
							$inserted = $encoder->insert_attachment( $encode_format_obj );

							if ( $inserted ) {
								$update_data = array( 'status' => Encode_Format::STATUS_COMPLETED );
								if ( $encode_format_obj->get_id() ) {
									$update_data['output_attachment_id'] = $encode_format_obj->get_id();
								}
								// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
								$wpdb->update(
									$this->queue_table_name,
									$update_data,
									array( 'id' => $job_id )
								);
								$this->maybe_auto_publish_post( $job['attachment_id'], $job['blog_id'] );
							} elseif ( $encode_format_obj->get_status() === 'pending_replacement' ) {
								// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
								$wpdb->update(
									$this->queue_table_name,
									array( 'status' => 'pending_replacement' ),
									array( 'id' => $job_id )
								);
								as_schedule_single_action( time() + 300, 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );
							} else {
								$error_msg = $encode_format_obj->get_error();
								if ( ! $error_msg ) {
									$error_msg = 'Insert attachment failed.';
								}
								// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
								$wpdb->update(
									$this->queue_table_name,
									array(
										'status'        => Encode_Format::STATUS_FAILED,
										'error_message' => $error_msg,
									),
									array( 'id' => $job_id )
								);
								$this->send_error_email( $job_id );
							}
						} elseif ( $encode_format_obj->get_status() === Encode_Format::STATUS_ERROR ) {
							// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
							$wpdb->update(
								$this->queue_table_name,
								array( // Mark as failed if error during encoding.
									'status'        => Encode_Format::STATUS_FAILED,
									'error_message' => $encode_format_obj->get_error(),
									'failed_at'     => current_time( 'mysql', true ),
								),
								array( 'id' => $job_id )
							);
							$this->send_error_email( $job_id );
							// Freed up an encoding slot!
							$this->schedule_immediate_heartbeat();
						} elseif ( $progress_status === 'recheck' || $encode_format_obj->get_status() === 'encoding' ) {
							// If logfile not found yet, or still encoding, recheck.
							as_schedule_single_action( time() + 30, 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );
						}

						// Terminal state or finishing check.
						if ( in_array( $encode_format_obj->get_status(), array( Encode_Format::STATUS_NEEDS_INSERT, Encode_Format::STATUS_FAILED, Encode_Format::STATUS_COMPLETED, Encode_Format::STATUS_CANCELED ), true ) ) {
							$this->cleanup_temp_files( $job_id );
						}
						break;

					case Encode_Format::STATUS_NEEDS_INSERT:
					case Encode_Format::STATUS_PENDING_REPLACEMENT:
						$encode_format_obj = Encode_Format::from_array( $job );
						$inserted          = $encoder->insert_attachment( $encode_format_obj );

						if ( $inserted ) {
							$update_data = array( 'status' => 'completed' );
							if ( $encode_format_obj->get_id() ) {
								$update_data['output_attachment_id'] = $encode_format_obj->get_id();
							}
							// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
							$wpdb->update(
								$this->queue_table_name,
								$update_data,
								array( 'id' => $job_id )
							);
							$this->maybe_auto_publish_post( $job['attachment_id'], $job['blog_id'] );
						} elseif ( $encode_format_obj->get_status() === 'pending_replacement' ) {
							// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
							$wpdb->update(
								$this->queue_table_name,
								array( 'status' => 'pending_replacement' ),
								array( 'id' => $job_id )
							);
							as_schedule_single_action( time() + 300, 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );
						} else {
							$error_msg = $encode_format_obj->get_error();
							if ( ! $error_msg ) {
								$error_msg = 'Insert attachment failed.';
							}
							// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
							$wpdb->update(
								$this->queue_table_name,
								array(
									'status'        => 'failed',
									'error_message' => $error_msg,
								),
								array( 'id' => $job_id )
							);
							$this->send_error_email( $job_id );
						}

						// After attempting insertion, job should be in a terminal state.
						$this->cleanup_temp_files( $job_id );
						break;

					// 'completed', 'failed', 'canceled' are terminal states, no action needed by default.
				}

				if ( $original_blog_id && $job['blog_id'] != $original_blog_id ) {
					restore_current_blog();
				}

				// Re-fetch the job to get the LATEST status after all processing steps above.
				// This ensures the terminal state check below uses actual DB state, not stale memory.
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$updated_job = $wpdb->get_row( $wpdb->prepare( 'SELECT status, blog_id FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );

				// After handling a job, if it reached a terminal state, try to process the next pending job from the queue.
				if ( $updated_job && in_array( $updated_job['status'], array( Encode_Format::STATUS_COMPLETED, Encode_Format::STATUS_FAILED, Encode_Format::STATUS_CANCELED ), true ) ) {
					$this->schedule_immediate_heartbeat();
				}
				wp_cache_delete( 'videopack_queue_items_' . $job['blog_id'], 'videopack' );
				wp_cache_delete( 'videopack_queue_items_all', 'videopack' );
			}
		);
	}

	/**
	 * Starts the queue and triggers the heartbeat processing.
	 */
	public function play() {
		$this->options['queue_control'] = 'play';
		update_option( 'videopack_options', $this->options );
		$this->process_pending_jobs_action();
	}

	/**
	 * Pauses the queue.
	 */
	public function pause() {
		$this->options['queue_control'] = 'pause';
		update_option( 'videopack_options', $this->options );
	}

	/**
	 * AS Heartbeat: Checks for finished jobs, stuck jobs, and enqueues new jobs if capacity allows.
	 *
	 * This is the core worker that manages the flow of the encoding queue.
	 *
	 * @param array $args Optional arguments passed from ActionScheduler.
	 */
	public function process_pending_jobs_action( $args = array() ) {
		static $last_run = 0;
		if ( time() - $last_run < 2 ) {
			// Throttle slightly to prevent multiple rapid executions in the same batch or during rapid polling.
			return;
		}
		$last_run = time();

		$this->ensure_table_exists();

		Debug_Logger::log( 'AS Heartbeat: process_pending_jobs_action' );
		global $wpdb;

		if ( $this->options['queue_control'] !== 'play' ) {
			return; // Queue is paused.
		}

		// 1. Check active encoding jobs to see if they finished.
		// This ensures that even if ActionScheduler is slow, a heartbeat (like a UI refresh)
		// will advance the status of finished jobs and free up capacity.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectDatabaseQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$active_encodes = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM %i WHERE status IN ('processing', 'encoding')", $this->queue_table_name ), ARRAY_A );
		$status_changed = false;

		if ( ! empty( $active_encodes ) ) {
			foreach ( $active_encodes as $job_data ) {
				$job_id                = $job_data['id'];
				$attachment_identifier = ! empty( $job_data['attachment_id'] ) ? $job_data['attachment_id'] : $job_data['input_url'];
				$encoder               = new Encode_Attachment( $this->options, $this->format_registry, $attachment_identifier, $job_data['input_url'] );
				$encode_format         = Encode_Format::from_array( $job_data );
				$encode_format->get_progress(); // Updates internal status if log says 'end' or if it timed out.

				if ( $encode_format->get_status() !== $job_data['status'] ) {
					$new_status  = $encode_format->get_status();
					$update_data = array(
						'status'     => $new_status,
						'updated_at' => current_time( 'mysql', true ),
					);

					if ( Encode_Format::STATUS_NEEDS_INSERT === $new_status ) {
						$update_data['completed_at'] = current_time( 'mysql', true );
					} elseif ( Encode_Format::STATUS_FAILED === $new_status ) {
						$update_data['failed_at']     = current_time( 'mysql', true );
						$update_data['error_message'] = $encode_format->get_error();
					}

					// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
					$wpdb->update(
						$this->queue_table_name,
						$update_data,
						array( 'id' => $job_id )
					);
					$status_changed = true;

					if ( Encode_Format::STATUS_NEEDS_INSERT === $new_status ) {
						// Trigger immediate handling by the handle_job action.
						as_schedule_single_action( time(), 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );
					} elseif ( Encode_Format::STATUS_FAILED === $new_status ) {
						$this->send_error_email( $job_id );
					}
				}
			}
		}

		// 2. Stuck Job Watchdog: Handle jobs that have been in transition states for too long.
		// Transition states: 'processing', 'encoding', 'needs_insert', 'pending_replacement'.
		// If a job hasn't updated in 5 minutes, something is likely wrong (process crash, server hiccup).
		// We use DATE_SUB(NOW(), ...) to be timezone-agnostic relative to the database record.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$stuck_jobs = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT id, status FROM %i WHERE status IN (%s, %s, %s, %s) AND updated_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
				$this->queue_table_name,
				Encode_Format::STATUS_PROCESSING,
				Encode_Format::STATUS_ENCODING,
				Encode_Format::STATUS_NEEDS_INSERT,
				Encode_Format::STATUS_PENDING_REPLACEMENT
			),
			ARRAY_A
		);

		if ( ! empty( $stuck_jobs ) ) {
			foreach ( $stuck_jobs as $stuck_job ) {
				Debug_Logger::log(
					'Watchdog: Found stuck job',
					array(
						'job_id' => $stuck_job['id'],
						'status' => $stuck_job['status'],
					)
				);
				// Reschedule the job. The handle_job action will check the status and decide how to proceed.
				as_schedule_single_action( time(), 'videopack_handle_job', array( 'job_id' => (int) $stuck_job['id'] ), 'videopack_encode_jobs' );

				// Slightly update updated_at to prevent repeated rescheduling in the same heartbeat.
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$wpdb->update( $this->queue_table_name, array( 'updated_at' => current_time( 'mysql', true ) ), array( 'id' => (int) $stuck_job['id'] ) );
			}
		}

		// 3. Watchdog: Ensure non-terminal jobs that aren't currently encoding/processing.
		// but aren't 'queued' or 'completed' are still being handled.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$pending_system_jobs = $wpdb->get_results( $wpdb->prepare( 'SELECT id FROM %i WHERE status IN (%s, %s)', $this->queue_table_name, Encode_Format::STATUS_NEEDS_INSERT, Encode_Format::STATUS_PENDING_REPLACEMENT ), ARRAY_A );
		if ( ! empty( $pending_system_jobs ) ) {
			foreach ( $pending_system_jobs as $job_row ) {
				$job_id = $job_row['id'];
				if ( ! as_has_scheduled_action( 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' ) ) {
					as_schedule_single_action( time(), 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );
				}
			}
		}

		if ( $status_changed ) {
			wp_cache_delete( 'videopack_queue_items_all', 'videopack' );
		}

		// 2. Capacity Check: Only count active encodes against the simultaneous_encodes limit.
		// 'needs_insert' and 'pending_replacement' are light database operations and shouldn't block NEW encodes.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$encoding_count = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM %i WHERE status IN ('processing', 'encoding')", $this->queue_table_name ) );
		$capacity       = (int) ( $this->options['simultaneous_encodes'] ?? 1 );

		if ( $encoding_count >= $capacity ) {
			return; // Max concurrent encodes reached.
		}

		$needed = $capacity - $encoding_count;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$next_jobs = $wpdb->get_results(
			$wpdb->prepare( 'SELECT id FROM %i WHERE status = %s ORDER BY created_at ASC LIMIT %d', $this->queue_table_name, Encode_Format::STATUS_QUEUED, $needed ),
			ARRAY_A
		);

		if ( ! empty( $next_jobs ) ) {
			foreach ( $next_jobs as $job_row ) {
				$job_id = $job_row['id'];
				// Schedule to handle this specific job.
				$existing_actions = as_get_scheduled_actions(
					array(
						'hook'   => 'videopack_handle_job',
						'args'   => array( 'job_id' => $job_id ),
						'status' => \ActionScheduler_Store::STATUS_PENDING,
					)
				);
				if ( empty( $existing_actions ) ) {
					as_schedule_single_action( time(), 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );
				}
			}
		}
	}

	/**
	 * Schedules the heartbeat action if it's not already scheduled for immediate execution.
	 * This ensures we don't flood the queue with redundant processing actions.
	 */
	public function schedule_immediate_heartbeat() {
		// Use empty array for arguments to distinguish it from the recurring heartbeat.
		// Schedule for 5 seconds from now to prevent flood when multiple jobs update simultaneously.
		if ( ! as_has_scheduled_action( 'videopack_process_pending_jobs', array(), 'videopack_queue_management' ) ) {
			as_schedule_single_action( time() + 5, 'videopack_process_pending_jobs', array(), 'videopack_queue_management' );
		}
	}

	/**
	 * Helper to get the arguments of a scheduled action by its ID.
	 *
	 * @param int $action_id The ID of the scheduled action.
	 * @return array The action arguments.
	 */
	protected function get_action_args_by_id( int $action_id ) {
		$action_args = array();

		// Get the scheduled action by ID.
		$actions = ActionScheduler::store()->fetch_action( $action_id );

		if ( $actions ) {
			// Get the action arguments.
			$action_args = $actions->get_args();
		}

		return $action_args;
	}

	/**
	 * Retrieves all queue items, optionally filtered by blog ID.
	 * Uses internal caching to minimize database queries.
	 *
	 * @param int|null $blog_id Optional blog ID to filter by.
	 * @return array List of queue items.
	 */
	public function get_queue_items( $blog_id = null ) {
		global $wpdb;

		if ( $blog_id ) {
			$cache_key = 'videopack_queue_items_' . $blog_id;
		} else {
			$cache_key = 'videopack_queue_items_all';
		}

		$cached_items = wp_cache_get( $cache_key, 'videopack' );

		if ( false !== $cached_items ) {
			return $cached_items;
		}

		$table = $this->queue_table_name;
		$this->ensure_table_exists();

		if ( null !== $blog_id ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$all_items = $wpdb->get_results(
				$wpdb->prepare( 'SELECT * FROM %i WHERE blog_id = %d ORDER BY created_at ASC', $table, $blog_id ),
				ARRAY_A
			);
		} else {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$all_items = $wpdb->get_results(
				$wpdb->prepare( 'SELECT * FROM %i ORDER BY created_at ASC', $table ),
				ARRAY_A
			);
		}

		wp_cache_set( $cache_key, $all_items, 'videopack', 15 );
		return $all_items;
	}

	/**
	 * Retrieves queue items specifically for a single blog.
	 *
	 * @param int $blog_id The blog ID.
	 * @return array List of queue items.
	 */
	public function get_queue_for_blog( int $blog_id ) {
		return $this->get_queue_items( $blog_id );
	}

	/**
	 * Retrieves all queue items for the entire network.
	 *
	 * @return array List of all queue items.
	 */
	public function get_queue_for_network() {
		// Gets non-terminal jobs for all blogs.
		return $this->get_queue_items( null );
	}

	/**
	 * Deletes a specific encoding job from the queue.
	 * This method handles the logic for finding the job, switching blog context (if multisite),
	 * delegating to Encode_Attachment for actual deletion, and returning the final status.
	 *
	 * @param int  $job_id             The ID of the job to delete.
	 * @param bool $delete_attachment Whether to delete the attachment.
	 * @return array|\WP_Error An array representing the deleted job's final state on success,
	 * or a WP_Error object on failure (e.g., job not found, permission denied).
	 */
	public function delete_job( int $job_id, bool $delete_attachment = true ) {
		global $wpdb;
		$this->ensure_table_exists();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );

		if ( ! $job ) {
			return new \WP_Error( 'videopack_job_not_found', __( 'Encoding job not found.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}

		$original_blog_id = false;
		if ( is_multisite() ) {
			$original_blog_id = get_current_blog_id();
			if ( (int) $job['blog_id'] !== $original_blog_id ) {
				switch_to_blog( (int) $job['blog_id'] );
			}
		}

		try {
			$attachment_id_or_url = ! empty( $job['attachment_id'] ) ? $job['attachment_id'] : $job['input_url'];
			$input_url            = $job['input_url']; // Use input_url from job data.

			// Instantiate Encode_Attachment for the source related to this job.
			$encoder = new Encode_Attachment( $this->options, $this->format_registry, $attachment_id_or_url, $input_url );

			// If the job is currently encoding or processing, cancel it first to kill any active processes.
			if ( in_array( $job['status'], array( Encode_Format::STATUS_ENCODING, Encode_Format::STATUS_PROCESSING ), true ) ) {
				$encoder->cancel_encoding( $job_id );
				// Refresh job data after cancellation.
				$job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );
			}

			// The delete_format method handles capability checks internally based on the job's user_id.
			$success = $encoder->delete_format( $job_id, $delete_attachment );

			// After deletion attempt, re-fetch the job to get its final status and error message.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$updated_job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );

			if ( ! $success ) {
				// If delete_format returned false, it means the initial check failed (e.g., permissions).
				// The error message should be set on the Encode_Format object and saved to the DB.
				$error_message = $updated_job['error_message'] ?? __( 'Failed to delete encoding job due to an unknown error.', 'video-embed-thumbnail-generator' );
				// Check if the error message indicates a permission issue.
				if ( strpos( $error_message, 'User does not have permission' ) !== false ) {
					return new \WP_Error( 'videopack_permission_denied', $error_message, array( 'status' => 403 ) );
				}
				return new \WP_Error( 'videopack_delete_failed', $error_message, array( 'status' => 500 ) );
			}

			return Encode_Format::from_array( $updated_job )->to_array();
		} finally {
			if ( $original_blog_id && (int) $job['blog_id'] !== $original_blog_id ) {
				restore_current_blog();
			}
			wp_cache_delete( 'videopack_queue_items_' . $job['blog_id'], 'videopack' );
			wp_cache_delete( 'videopack_queue_items_all', 'videopack' );
			$this->schedule_immediate_heartbeat();
		}
	}

	/**
	 * Removes a specific encoding job from the queue without deleting the video file.
	 *
	 * @param int $job_id The ID of the job to remove.
	 * @return bool|\WP_Error True on success, WP_Error on failure.
	 */
	public function remove_job( int $job_id ) {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );

		if ( ! $job ) {
			return new \WP_Error( 'videopack_job_not_found', __( 'Encoding job not found.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}

		// Permission check: Only allow users who can encode videos to remove jobs.
		// Also, if it's not their own job, they need 'edit_others_video_encodes' capability.
		$is_own_job = ( (int) $job['user_id'] === get_current_user_id() );
		if ( ! current_user_can( 'encode_videos' ) || ( ! $is_own_job && ! current_user_can( 'edit_others_video_encodes' ) ) ) {
			return new \WP_Error( 'videopack_permission_denied', __( 'You do not have permission to remove this job.', 'video-embed-thumbnail-generator' ), array( 'status' => 403 ) );
		}

		$original_blog_id = false;
		if ( is_multisite() ) {
			$original_blog_id = get_current_blog_id();
			if ( (int) $job['blog_id'] !== $original_blog_id ) {
				switch_to_blog( (int) $job['blog_id'] );
			}
		}

		try {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$delete_result = $wpdb->delete(
				$this->queue_table_name,
				array( 'id' => $job_id ),
				array( '%d' )
			);

			if ( false === $delete_result ) {
				return new \WP_Error( 'videopack_db_error', __( 'Could not remove job from database.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
			}

			// Also cancel any pending ActionScheduler actions for this job.
			as_unschedule_action( 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );

			return true;

		} finally {
			if ( $original_blog_id && (int) $job['blog_id'] !== $original_blog_id ) {
				restore_current_blog();
			}
			wp_cache_delete( 'videopack_queue_items_' . $job['blog_id'], 'videopack' );
			wp_cache_delete( 'videopack_queue_items_all', 'videopack' );
			$this->schedule_immediate_heartbeat();
		}
	}

	/**
	 * Clears jobs from the encoding queue database table.
	 * Supports clearing all jobs, completed jobs, or jobs older than a week.
	 *
	 * @param string $type  The type of clearing to perform ('all', 'completed', or 'weekly').
	 * @param string $scope The scope of the cleanup ('site' or 'network'). Default 'site'.
	 */
	public function clear_completed_queue( $type, $scope = 'site' ) {
		global $wpdb;
		$user_ID         = get_current_user_id();
		$current_blog_id = get_current_blog_id();

		// Get all queue items. We'll filter them based on type and scope in the loop below.
		$all_queue_items = $this->get_queue_items(
			( $scope === 'network' && is_network_admin() ) ? null : $current_blog_id
		);

		if ( empty( $all_queue_items ) || ! is_array( $all_queue_items ) ) {
			return;
		}

		foreach ( $all_queue_items as $job ) {
			$job_id      = $job['id'];
			$job_status  = $job['status'];
			$job_blog_id = (int) $job['blog_id'];
			$job_user_id = (int) $job['user_id'];

			$should_delete = false;

			if ( $type === 'all' ) {
				// If clearing 'all', we attempt to delete all jobs that the user has permission to delete.
				$can_delete_job = (
				( ! is_multisite() || $job_blog_id === $current_blog_id ) ||
				( is_multisite() && is_network_admin() && $scope === 'network' )
				) && (
					current_user_can( 'edit_others_video_encodes' ) ||
					( current_user_can( 'encode_videos' ) && $job_user_id === $user_ID )
				);

				if ( $can_delete_job ) {
					$should_delete = true;
				}
			} elseif ( $type === 'completed' ) {
				// For 'completed' type, we delete jobs that are in a completed/failed/canceled state,
				// and are not subject to the 'scheduled' retention logic.
				if ( in_array( $job_status, array( Encode_Format::STATUS_COMPLETED, Encode_Format::STATUS_FAILED, Encode_Format::STATUS_CANCELED ), true ) ) {
					$keep_for_scheduled = false;
					if ( $type === 'scheduled' ) { // This 'scheduled' type seems to be an internal cleanup.
						$completed_at = strtotime( $job['completed_at'] ?? $job['updated_at'] );
						if ( $completed_at && ( time() - $completed_at < WEEK_IN_SECONDS ) ) {
							$keep_for_scheduled = true;
						}
					}

					// If the job is from another blog in multisite and current user can't manage network, keep it.
					if ( is_multisite() && $job_blog_id !== $current_blog_id && ! current_user_can( 'manage_network' ) ) {
						$keep_for_scheduled = true;
					}

					if ( ! $keep_for_scheduled ) {
						$should_delete = true;
					}
				}
			} elseif ( $type === 'weekly' ) {
				// Clear jobs that were completed more than one week ago.
				if ( in_array( $job_status, array( Encode_Format::STATUS_COMPLETED, Encode_Format::STATUS_FAILED, Encode_Format::STATUS_CANCELED, Encode_Format::STATUS_DELETED ), true ) ) {
					$completed_at = strtotime( $job['completed_at'] ?? $job['updated_at'] );
					if ( $completed_at && ( time() - $completed_at > WEEK_IN_SECONDS ) ) {
						$should_delete = true;
					}
				}
			}

			if ( $should_delete ) {
				// Use remove_job to clear from DB without deleting video files, as per the original intent of 'clear_completed_queue'.
				// which was to clear the queue, not necessarily delete the output files.
				// The 'all' type in the original code did delete files for 'encoding' jobs,
				// but for 'completed' it just removed from queue.
				// Given the new structure, 'delete_job' deletes files, 'remove_job' just removes from DB.
				// I'll use 'remove_job' for 'completed' and 'delete_job' for 'all' if it's an 'encoding' job.
				if ( $type === 'all' && $job_status === 'encoding' ) {
					$this->delete_job( $job_id );
				} else {
					$this->remove_job( $job_id );
				}
			}
		}
		wp_cache_delete( 'videopack_queue_items_' . $current_blog_id, 'videopack' );
		wp_cache_delete( 'videopack_queue_items_all', 'videopack' );
	}

	/**
	 * Retries a failed encoding job.
	 *
	 * @param int $job_id The ID of the job to retry.
	 * @return bool|\WP_Error True on success, WP_Error on failure.
	 */
	public function retry_job( int $job_id ) {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );

		if ( ! $job ) {
			return new \WP_Error( 'videopack_job_not_found', __( 'Encoding job not found.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}

		if ( ! in_array( $job['status'], array( 'failed', 'canceled', 'deleted' ), true ) ) {
			return new \WP_Error( 'videopack_job_not_retryable', __( 'Only failed, canceled, or deleted jobs can be retried.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		// Permission check.
		$is_own_job = ( (int) $job['user_id'] === get_current_user_id() );
		if ( ! current_user_can( 'edit_others_video_encodes' ) && ! ( current_user_can( 'encode_videos' ) && $is_own_job ) ) {
			return new \WP_Error( 'videopack_permission_denied', __( 'You do not have permission to retry this job.', 'video-embed-thumbnail-generator' ), array( 'status' => 403 ) );
		}

		$original_blog_id = false;
		if ( is_multisite() ) {
			$original_blog_id = get_current_blog_id();
			if ( (int) $job['blog_id'] !== $original_blog_id ) {
				switch_to_blog( (int) $job['blog_id'] );
			}
		}

		$update_data = array(
			'status'        => 'queued',
			'error_message' => null,
			'failed_at'     => null,
			'pid'           => null,
			'retry_count'   => (int) $job['retry_count'] + 1,
		);
 
		// If the job was deleted, paths were cleared. We need to restore them.
		if ( empty( $job['output_path'] ) ) {
			$attachment_id_or_url = ! empty( $job['attachment_id'] ) ? $job['attachment_id'] : $job['input_url'];
			$encoder             = new Encode_Attachment( $this->options, $this->format_registry, $attachment_id_or_url, $job['input_url'] );
			$video_formats       = $this->format_registry->get_video_formats();
			$format_id           = $job['format_id'];
 
			if ( isset( $video_formats[ $format_id ] ) ) {
				$video_format_obj    = $video_formats[ $format_id ];
				$attachment_id       = ! empty( $job['attachment_id'] ) ? (int) $job['attachment_id'] : null;
				$encode_info_obj     = new Encode_Info( $attachment_id, (string) $job['input_url'], $video_format_obj, $this->options, $this->format_registry );
				$update_data['output_path'] = (string) $encode_info_obj->path;
				$update_data['output_url']  = (string) $encode_info_obj->url;
			}
		}
 
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$update_result = $wpdb->update(
			$this->queue_table_name,
			$update_data,
			array( 'id' => $job_id )
		);
 
		if ( $original_blog_id && (int) $job['blog_id'] !== $original_blog_id ) {
			restore_current_blog();
		}
 
		if ( false === $update_result ) {
			return new \WP_Error( 'videopack_db_error', __( 'Could not update job status to retry.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		// Trigger a one-off action to process any 'queued' items immediately.
		$this->schedule_immediate_heartbeat();
		wp_cache_delete( 'videopack_queue_items_' . $job['blog_id'], 'videopack' );
		return true;
	}

	/**
	 * Get a translated, human-readable status string.
	 *
	 * @param string $status The status slug.
	 * @return string The translated status.
	 */
	private function get_l10n_status( $status ) {
		$statuses = array(
			'queued'              => __( 'Queued', 'video-embed-thumbnail-generator' ),
			'processing'          => __( 'Processing', 'video-embed-thumbnail-generator' ),
			'needs_insert'        => __( 'Finishing', 'video-embed-thumbnail-generator' ),
			'pending_replacement' => __( 'Pending Replacement', 'video-embed-thumbnail-generator' ),
			'completed'           => __( 'Completed', 'video-embed-thumbnail-generator' ),
			'failed'              => __( 'Failed', 'video-embed-thumbnail-generator' ),
			'canceled'            => __( 'Canceled', 'video-embed-thumbnail-generator' ),
			'deleted'             => __( 'Deleted', 'video-embed-thumbnail-generator' ),
		);
		if ( array_key_exists( $status, $statuses ) ) {
			return $statuses[ $status ];
		}
		return ucfirst( $status );
	}

	/**
	 * Helper to prepare a job object for REST response.
	 *
	 * @param Encode_Format $job The job object.
	 * @return array The prepared job data.
	 */
	public function prepare_job_for_response( $job ) {
		$internal_status = $job->get_status();
		$status          = $internal_status;

		$attachment_id = $job->get_attachment_id();
		$blog_id       = $job->get_blog_id();
		if ( ! $blog_id ) {
			$blog_id = get_current_blog_id();
		}
		$user_id = $job->get_user_id();

		$video_title     = $job->get_video_title();
		$video_duration  = (int) $job->get_video_duration();
		$poster_url      = '';
		$user_name       = '';
		$blog_name       = '';
		$attachment_link = '';
 
		if ( $attachment_id ) {
			$poster_id       = get_post_meta( $attachment_id, '_kgflashmediaplayer-poster-id', true );
			$poster_url      = $poster_id ? wp_get_attachment_image_url( $poster_id, 'thumbnail' ) : get_post_meta( $attachment_id, '_kgflashmediaplayer-poster', true );
			$attachment_link = get_edit_post_link( $attachment_id );
		}
 
		// Ensure duration is set for progress calculation.
		if ( ! $video_duration ) {
			$attachment_key = ! empty( $attachment_id ) ? (string) $attachment_id : $job->get_input_url();
			if ( $attachment_key ) {
				if ( ! isset( $this->video_durations[ $attachment_key ] ) ) {
					$encoder                                  = new Encode_Attachment( $this->options, $this->format_registry, $attachment_id ? $attachment_id : $job->get_input_url(), $job->get_input_url() );
					$metadata                                 = $encoder->get_video_metadata();
					$this->video_durations[ $attachment_key ] = ( $metadata && $metadata->duration ) ? (int) round( $metadata->duration * 1000000 ) : 0;
				}
				if ( $this->video_durations[ $attachment_key ] ) {
					$video_duration = (int) $this->video_durations[ $attachment_key ];
					$job->set_video_duration( $video_duration );
				}
			}
		}


		if ( $user_id ) {
			$user_data = get_userdata( $user_id );
			if ( $user_data ) {
				$user_name = $user_data->display_name;
			}
		}

		if ( is_multisite() ) {
			$blog_details = get_blog_details( $blog_id );
			if ( $blog_details ) {
				$blog_name = $blog_details->blogname;
			}
		}

		$video_formats = $this->format_registry->get_video_formats();
		$format_name   = isset( $video_formats[ $job->get_format_id() ] ) ? $video_formats[ $job->get_format_id() ]->get_short_name() : $job->get_format_id();

		$response = array(
			'id'              => $job->get_job_id(),
			'status'          => $status,
			'status_l10n'     => Encode_Format::get_status_label( $internal_status ),
			'preset'          => $job->get_format_id(),
			'format_name'     => $format_name,
			'output_url'      => $job->get_url(),
			'output_id'       => $job->get_id(), // Attachment ID of the output.
			'error'           => $job->get_error(),
			'created_at'      => $job->get_created_at(),
			'started'         => $job->get_started(),
			'video_title'     => $video_title,
			'video_duration'  => $job->get_video_duration(),
			'user_name'       => $user_name,
			'blog_name'       => $blog_name,
			'poster_url'      => $poster_url,
			'attachment_link' => $attachment_link,
			'attachment_id'   => $attachment_id,
		);

		if ( in_array( $status, array( Encode_Format::STATUS_PROCESSING, Encode_Format::STATUS_ENCODING, Encode_Format::STATUS_NEEDS_INSERT, Encode_Format::STATUS_PENDING_REPLACEMENT ), true ) ) {
			$progress = $job->get_progress();
			if ( is_array( $progress ) ) {
				$response['progress'] = $progress;
			}
		}

		return $response;
	}

	/**
	 * Filters the list of formats to ensure only one replacement format is enqueued.
	 *
	 * @param array             $format_ids List of format IDs requested.
	 * @param Encode_Attachment $encoder    The encoder instance for source context.
	 * @return array Filtered list of format IDs.
	 */
	private function resolve_replacement_formats( array $format_ids, Encode_Attachment $encoder ) {
		$ideal_id              = $encoder->get_ideal_replacement_id();
		$replacement_requested = false;
		$replacement_ids       = array();
		$additional_ids        = array();

		$replace_setting = (string) ( $this->options['replace_format'] ?? 'none' );

		foreach ( $format_ids as $id ) {
			if ( $encoder->is_replacement_format( $id ) ) {
				$replacement_ids[]     = (string) $id;
				$replacement_requested = true;
			} elseif ( $id === $replace_setting || ( strpos( $replace_setting, 'same_' ) === 0 && strpos( $id, substr( $replace_setting, 5 ) ) !== false ) ) {
				// If a format was requested that matches the replacement setting resolution but is an upscale.
				$replacement_requested = true;
			} else {
				$additional_ids[] = (string) $id;
			}
		}

		if ( ! $replacement_requested ) {
			return $format_ids;
		}

		// A replacement was requested. Enforce exactly one replacement format.
		$chosen_replacement = null;

		// 1. Prioritize the ideal replacement format (e.g., 'h264_fullres' if 'h264_1080p' was requested but it's an upscale).
		if ( $ideal_id ) {
			$chosen_replacement = $ideal_id;
		} elseif ( count( $replacement_ids ) > 0 ) {
			// Fallback: Use the first explicitly requested replacement format.
			$chosen_replacement = $replacement_ids[0];
		}

		if ( $chosen_replacement ) {
			return array_merge( $additional_ids, array( $chosen_replacement ) );
		}

		return $additional_ids;
	}

	/**
	 * Get all jobs prepared for REST response.
	 *
	 * @param array $all_items Raw items from get_queue_items.
	 * @param mixed $input Optional filter by attachment ID or URL.
	 * @return array Prepared jobs.
	 */
	public function get_jobs_list_data( array $all_items, $input = null ) {
		// Active Check: Trigger the queue processor to fill any available capacity.
		// This acts as a watchdog heartbeat whenever the queue is viewed.
		// We call it via ActionScheduler instead of directly to prevent flooding logs during rapid polling.
		$this->schedule_immediate_heartbeat();

		$jobs  = array();
		$order = 1;

		foreach ( $all_items as $item ) {
			if ( ! $input || $item['attachment_id'] == $input || $item['input_url'] === $input ) {
				$job_format = Encode_Format::from_array( $item );
				$prepared   = $this->prepare_job_for_response( $job_format );
				if ( ! is_wp_error( $prepared ) ) {
					$prepared['queue_order'] = $order++;
					$jobs[]                  = $prepared;
				}
			}
		}

		return $jobs;
	}

	/**
	 * Get a single job prepared for REST response.
	 *
	 * @param int $job_id The job ID.
	 * @return array|\WP_Error Prepared job data or WP_Error.
	 */
	public function get_job_prepared( int $job_id ) {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$job_data = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );

		if ( ! $job_data ) {
			return new \WP_Error( 'videopack_job_not_found', __( 'Job not found.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}

		$job_obj = Encode_Format::from_array( $job_data );
		return $this->prepare_job_for_response( $job_obj );
	}

	/**
	 * Sends an error email for a failed encoding job.
	 *
	 * @param int $job_id The ID of the failed encoding job.
	 */
	protected function send_error_email( $job_id ) {
		global $wpdb;
		if ( ! is_object( $wpdb ) ) {
			return;
		}
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );

		if ( ! $job || $job['status'] !== 'failed' || ! empty( $job['mailed'] ) ) {
			return;
		}

		$options = (array) $this->options;
		// In multisite, network options are stored in site_option 'videopack_network_options'.
		$network_options = \Videopack\Admin\Multisite::get_network_options();

		$error_email         = $options['error_email'] ?? 'nobody';
		$network_error_email = $network_options['network_error_email'] ?? 'nobody';

		if ( $error_email === 'nobody' && $network_error_email === 'nobody' ) {
			return;
		}

		$mailed     = false;
		$blog_title = get_bloginfo();
		$admin_url  = admin_url();
		$headers    = array( 'Content-Type: text/html; charset=UTF-8' );
		$file_name  = ! empty( $job['attachment_id'] ) ? basename( get_attached_file( $job['attachment_id'] ) ) : basename( $job['input_url'] );
		$error_msg  = $job['error_message'] ?? __( 'Unknown error', 'video-embed-thumbnail-generator' );
		$queue_link = '<a href="' . esc_url( $admin_url . 'tools.php?page=videopack_encode_queue' ) . '">' . esc_html( $blog_title ) . '</a>';

		$subject = __( 'Video Encode Error', 'video-embed-thumbnail-generator' );

		/* translators: %1$s is the error message, %2$s is the filename, %3$s is the website name. */
		$message_body = sprintf( esc_html__( 'Error message "%1$s" while encoding video file %2$s at %3$s', 'video-embed-thumbnail-generator' ), esc_html( $error_msg ), esc_html( $file_name ), $queue_link );

		$user       = null;
		$super_user = null;

		// Determine site-level recipient.
		if ( $error_email === 'encoder' ) {
			if ( ! empty( $job['user_id'] ) ) {
				$user = get_userdata( $job['user_id'] );
			}
		} elseif ( is_numeric( $error_email ) ) {
			$user = get_userdata( (int) $error_email );
		}

		// Determine network-level recipient.
		if ( is_multisite() && $network_error_email !== 'nobody' ) {
			if ( $network_error_email === 'encoder' ) {
				if ( ! empty( $job['user_id'] ) ) {
					$super_user = get_userdata( $job['user_id'] );
				}
			} elseif ( is_numeric( $network_error_email ) ) {
				$super_user = get_userdata( (int) $network_error_email );
			}
		}

		if ( $user instanceof \WP_User ) {
			if ( wp_mail( $user->user_email, $subject, $message_body, $headers ) ) {
				$mailed = true;
			}
		}

		if ( $super_user instanceof \WP_User && $super_user != $user ) {
			$network_info = get_current_site();
			$network_link = '<a href="' . network_admin_url( 'settings.php?page=videopack_network_options' ) . '">' . esc_html( $network_info->site_name ) . '</a>';
			/* translators: %s is a link to the network settings page. */
			$super_message_body = $message_body . ' ' . sprintf( esc_html_x( 'on the %s network.', 'on the [name of multisite network] network.', 'video-embed-thumbnail-generator' ), $network_link );
			if ( wp_mail( $super_user->user_email, $subject, $super_message_body, $headers ) ) {
				$mailed = true;
			}
		}

		if ( $mailed ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->update( $this->queue_table_name, array( 'mailed' => 1 ), array( 'id' => $job_id ) );
		}
	}

	/**
	 * Automatically publish the parent post if all queued jobs for it are completed.
	 *
	 * @param int|null $attachment_id The ID of the original video attachment.
	 * @param int      $blog_id       The blog ID where the job belongs.
	 */
	protected function maybe_auto_publish_post( $attachment_id, $blog_id ) {
		if ( empty( $this->options['auto_publish_post'] ) || empty( $attachment_id ) ) {
			return; // Only proceed if auto_publish_post is turned on and we have an attachment id.
		}

		$video_attachment = get_post( $attachment_id );
		if ( ! $video_attachment || empty( $video_attachment->post_parent ) ) {
			return; // No parent post to publish.
		}

		$parent_id = $video_attachment->post_parent;
		global $wpdb;

		// Get all unique attachment IDs that have pending jobs.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$incomplete_job_attachment_ids = $wpdb->get_col(
			$wpdb->prepare(
				'SELECT DISTINCT attachment_id FROM %i WHERE status IN (%s, %s, %s, %s, %s) AND blog_id = %d AND attachment_id IS NOT NULL',
				$this->queue_table_name,
				Encode_Format::STATUS_QUEUED,
				Encode_Format::STATUS_PROCESSING,
				Encode_Format::STATUS_ENCODING,
				Encode_Format::STATUS_NEEDS_INSERT,
				Encode_Format::STATUS_PENDING_REPLACEMENT,
				$blog_id
			)
		);

		if ( ! empty( $incomplete_job_attachment_ids ) ) {
			// Determine if any of these incomplete jobs belong to attachments that share the same parent_id.
			$ids_string = implode( ',', array_map( 'intval', $incomplete_job_attachment_ids ) );

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$has_sibling_jobs = $wpdb->get_var( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE ID IN ($ids_string) AND post_parent = %d LIMIT 1", $parent_id ) );

			if ( $has_sibling_jobs ) {
				// There's still an active job for the same parent post, so don't publish yet.
				return;
			}
		}

		// All jobs for all attachments on this parent post have completed.
		$parent_post = get_post( $parent_id );
		if ( $parent_post && $parent_post->post_status !== 'publish' ) {
			// Update the post status to 'publish'.
			wp_update_post(
				array(
					'ID'          => $parent_id,
					'post_status' => 'publish',
				)
			);
		}
	}

	/**
	 * Cleans up temporary files (log files and watermarks) associated with a job.
	 *
	 * @param int $job_id The ID of the job whose temp files should be cleaned up.
	 */
	public function cleanup_temp_files( $job_id ) {
		global $wpdb;
		$this->ensure_table_exists();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );

		if ( ! $job ) {
			return;
		}

		$update_data = array();

		// Cleanup FFmpeg log file.
		if ( ! empty( $job['logfile_path'] ) && file_exists( $job['logfile_path'] ) ) {
			wp_delete_file( $job['logfile_path'] );
			$update_data['logfile_path'] = null;
		}

		// Cleanup temporary watermark.
		if ( ! empty( $job['temp_watermark_path'] ) && file_exists( $job['temp_watermark_path'] ) ) {
			wp_delete_file( $job['temp_watermark_path'] );
			$update_data['temp_watermark_path'] = null;
		}

		if ( ! empty( $update_data ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$wpdb->update(
				$this->queue_table_name,
				$update_data,
				array( 'id' => $job_id )
			);
		}
	}
}
