<?php

namespace Videopack\Admin\Encode;

use ActionScheduler;

class Encode_Queue_Controller {

	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;
	protected $options;
	protected $queue_log;
	protected $queue_table_name;

	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $this->options_manager->get_options();
		$this->queue_log       = new Encode_Queue_Log( $this->options_manager ); // Pass options_manager

		global $wpdb;
		if ( is_multisite() ) {
			$main_site_id           = defined( 'BLOG_ID_CURRENT_SITE' ) ? BLOG_ID_CURRENT_SITE : 1;
			$this->queue_table_name = $wpdb->get_blog_prefix( $main_site_id ) . 'videopack_encoding_queue';
		} else {
			$this->queue_table_name = $wpdb->prefix . 'videopack_encoding_queue';
		}
		$this->add_table();
	}

	private function add_table() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$this->queue_table_name} (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			blog_id BIGINT UNSIGNED NOT NULL DEFAULT 1,
			attachment_id BIGINT UNSIGNED NULL,
			input_url VARCHAR(1024) NOT NULL,
			format_id VARCHAR(100) NOT NULL,
			status ENUM('queued', 'processing', 'needs_insert', 'pending_replacement', 'completed', 'failed', 'canceled', 'deleted') NOT NULL DEFAULT 'queued',
			output_path VARCHAR(1024) NULL,
			output_url VARCHAR(1024) NULL,
			user_id BIGINT UNSIGNED NULL,
			pid INT NULL,
			logfile_path VARCHAR(1024) NULL,
			action_id BIGINT UNSIGNED NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			started_at DATETIME NULL,
			completed_at DATETIME NULL,
			failed_at DATETIME NULL,
			error_message TEXT NULL,
			temp_watermark_path VARCHAR(1024) NULL,
			retry_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
			encode_options_hash VARCHAR(32) NULL,
			INDEX idx_blog_id (blog_id),
			INDEX idx_attachment_id_blog_id (attachment_id, blog_id),
			INDEX idx_input_url_blog_id (input_url(191), blog_id),
			INDEX idx_format_id (format_id),
			INDEX idx_status_blog_id (status, blog_id),
			INDEX idx_action_id (action_id)
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );
	}

	public function start_queue() {
		$this->options['queue_control'] = 'play';
		$this->options_manager->save_options( $this->options );
		// Optionally, trigger a one-off action to process any 'queued' items.
		as_schedule_single_action( time(), 'videopack_process_pending_jobs', array(), 'videopack_queue_management' );
	}

	public function pause_queue() {
		$this->options['queue_control'] = 'pause';
		$this->options_manager->save_options( $this->options );
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
		global $wpdb;

		$required = array(
			'id',
			'url',
			'formats',
		);

		if ( ! $this->required_keys( $args, $required ) || ! is_array( $args['formats'] ) ) {
			$this->queue_log->add_to_log( 'error_invalid_args' );
			return $this->queue_log->get_log();
		}

		$attachment_identifier = sanitize_text_field( $args['id'] );
		$input_url             = esc_url_raw( $args['url'] );
		$user_id               = get_current_user_id();
		$current_blog_id       = get_current_blog_id();

		// Instantiate Encode_Attachment once to perform pre-flight checks for all formats.
		// This also initializes video metadata and available codecs if not already done.
		$encoder = new Encode_Attachment( $this->options_manager, $attachment_identifier, $input_url );

		foreach ( $args['formats'] as $format_to_encode ) {
			$format_id = sanitize_text_field( $format_to_encode );

			// Perform pre-flight checks using Encode_Attachment
			$can_queue_status = $encoder->check_if_can_queue( $format_id );

			if ( 'ok_to_queue' === $can_queue_status ) {
				// Get Video_Format config (needed for Encode_Info)
				$all_video_formats   = $this->options_manager->get_video_formats();
				$video_format_config = $all_video_formats[ $format_id ] ?? null;

				// This check should ideally be redundant if check_if_can_queue worked,
				// but as a safeguard:
				if ( ! $video_format_config ) {
					$this->queue_log->add_to_log( 'error_invalid_format_key', $format_id );
					continue;
				}

				$is_attachment   = is_numeric( $attachment_identifier ) && get_post_type( $attachment_identifier ) === 'attachment';
				$encode_info_obj = new Encode_Info( $attachment_identifier, $input_url, $is_attachment, $video_format_config );

				$job_data = array(
					'blog_id'       => $current_blog_id,
					'attachment_id' => $is_attachment ? (int) $attachment_identifier : null,
					'input_url'     => $input_url,
					'format_id'     => $format_id,
					'status'        => 'queued',
					'output_path'   => $encode_info_obj->path,
					'output_url'    => $encode_info_obj->url,
					'user_id'       => $user_id,
					'created_at'    => current_time( 'mysql', true ),
					'updated_at'    => current_time( 'mysql', true ),
				);

				$inserted = $wpdb->insert( $this->queue_table_name, $job_data );

				if ( $inserted ) {
					$job_id    = $wpdb->insert_id;
					$action_id = as_schedule_single_action( time(), 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );
					if ( $action_id ) {
						$wpdb->update(
							$this->queue_table_name,
							array( 'action_id' => $action_id ),
							array( 'id' => $job_id )
						);
						$this->queue_log->add_to_log( 'queued', $format_id );
					} else {
						$wpdb->update(
							$this->queue_table_name,
							array(
								'status'        => 'failed',
								'error_message' => 'Failed to schedule ActionScheduler task.',
							),
							array( 'id' => $job_id )
						);
						$this->queue_log->add_to_log( 'error_scheduling', $format_id );
					}
				} else {
					$this->queue_log->add_to_log( 'error_db_insert', $format_id );
				}
			} else {
				// Log the reason why it wasn't queued based on $can_queue_status
				// e.g., 'already_exists', 'lowres', 'vcodec_unavailable', etc.
				$this->queue_log->add_to_log( $can_queue_status, $format_id );
			}
		}
		return $this->queue_log->get_log();
	}

	protected function required_keys( array $args, array $required ) {
		foreach ( $required as $key ) {
			if ( ! array_key_exists( $key, $args ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * ActionScheduler callback to handle a specific encoding job.
	 *
	 * @param int $job_id The ID of the job from the custom DB table.
	 */
	public function handle_job_action( $job_id ) {
		global $wpdb;
		$job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );

		if ( ! $job ) {
			// Log error: job not found
			return;
		}

		$original_blog_id = false;
		if ( is_multisite() ) {
			$original_blog_id = get_current_blog_id();
			if ( $job['blog_id'] != $original_blog_id ) {
				switch_to_blog( $job['blog_id'] );
			}
		}

		// Re-fetch options in case they changed since constructor
		// Options should be fetched for the context of $job['blog_id']
		$this->options = $this->options_manager->get_options(); // Options manager loads for current blog context

		$attachment_id_or_url = ! empty( $job['attachment_id'] ) ? $job['attachment_id'] : $job['input_url'];

		$encoder = new Encode_Attachment( $this->options_manager, $attachment_id_or_url, $job['input_url'] );

		switch ( $job['status'] ) {
			case 'queued':
				if ( $this->options['queue_control'] !== 'play' ) {
					as_schedule_single_action( time() + 300, 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' ); // Reschedule if paused
					return;
				}

				$processing_count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE status = %s', $this->queue_table_name, 'processing' ) );
				if ( $processing_count >= (int) ( $this->options['simultaneous_encodes'] ?? 1 ) ) {
					as_schedule_single_action( time() + 120, 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' ); // Reschedule if limit reached
					return;
				}

				// Update job to 'processing'
				$wpdb->update(
					$this->queue_table_name,
					array( // Update status to processing
						'status'     => 'processing',
						'started_at' => current_time( 'mysql', true ),
					),
					array( 'id' => $job_id )
				);

				$encode_format_obj = new Encode_Format( $job['format_id'] );
				$encode_format_obj->set_path( $job['output_path'] );
				$encode_format_obj->set_url( $job['output_url'] );

				$started_format = $encoder->start_encode( $encode_format_obj ); // This starts FFmpeg and updates $encode_format_obj with PID

				if ( $started_format->get_pid() && $started_format->get_status() === 'encoding' ) {
					$wpdb->update(
						$this->queue_table_name,
						array( // Store PID and logfile path
							'pid'          => $started_format->get_pid(),
							'logfile_path' => $started_format->get_logfile(),
						),
						array( 'id' => $job_id )
					);
					as_schedule_single_action( time() + 60, 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );
				} else {
					$wpdb->update(
						$this->queue_table_name,
						array( // Mark as failed if FFmpeg didn't start
							'status'        => 'failed',
							'error_message' => 'Failed to start FFmpeg: ' . $started_format->get_error(),
							'failed_at' => current_time( 'mysql', true ),
						),
						array( 'id' => $job_id )
					);
				}
				break;

			case 'processing':
				// This part also requires Encode_Format to be aware of the DB job or be populated from it.
				$encode_format_obj = new Encode_Format( $job['format_id'] );
				$encode_format_obj->set_status( 'encoding' ); // Critical for get_progress()
				$encode_format_obj->set_logfile( $job['logfile_path'] );
				$encode_format_obj->set_pid( $job['pid'] );
				$encode_format_obj->set_path( $job['output_path'] ); // Needed for cancel_encoding if it checks path

				$progress_status = $encode_format_obj->get_progress(); // This calls set_progress() which updates status

				if ( $encode_format_obj->get_status() === 'needs_insert' ) {
					$wpdb->update(
						$this->queue_table_name,
						array( // Update status to needs_insert
							'status' => 'needs_insert',
							'completed_at' => current_time( 'mysql', true ),
						),
						array( 'id' => $job_id )
					);
					as_schedule_single_action( time(), 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' ); // Process insertion immediately
				} elseif ( $encode_format_obj->get_status() === 'error' ) {
					$wpdb->update(
						$this->queue_table_name,
						array( // Mark as failed if error during encoding
							'status' => 'failed',
							'error_message' => $encode_format_obj->get_error(),
							'failed_at' => current_time( 'mysql', true ),
						),
						array( 'id' => $job_id )
					);
				} elseif ( $progress_status === 'recheck' || $encode_format_obj->get_status() === 'encoding' ) {
					// If logfile not found yet, or still encoding, recheck.
					as_schedule_single_action( time() + 60, 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' );
				}

				// Cleanup temporary watermark if job is now in a terminal state
				if ( ( $encode_format_obj->get_status() === 'needs_insert' || $encode_format_obj->get_status() === 'failed' )
					&& ! empty( $job['temp_watermark_path'] )
					&& file_exists( $job['temp_watermark_path'] )
				) {
					wp_delete_file( $job['temp_watermark_path'] );
					// clear the path from DB:
					$wpdb->update(
						$this->queue_table_name,
						array( 'temp_watermark_path' => null ), // Clear temp watermark path
						array( 'id' => $job_id )
					);
				}
				break;

			case 'needs_insert':
			case 'pending_replacement': // Treat same as needs_insert for now, insert_attachment handles the logic
				$encode_format_obj = new Encode_Format( $job['format_id'] );
				$encode_format_obj->set_path( $job['output_path'] );
				$encode_format_obj->set_url( $job['output_url'] );
				$encode_format_obj->set_user_id( $job['user_id'] );
				// insert_attachment needs the Video_Format config to check get_replaces_original()
				// and to get other Encode_Format objects for the same attachment (this part is tricky with DB)

				// For insert_attachment to work correctly with the 'pending_replacement' logic,
				// it needs to query the DB for other jobs related to $job['attachment_id'] or $job['input_url'].
				// This is a significant change from its current post_meta based approach.
				// For now, we'll assume a simplified call.
				$inserted = $encoder->insert_attachment( $encode_format_obj ); // This method needs heavy refactoring for DB.

				if ( $inserted || $encode_format_obj->get_status() === 'complete' ) { // insert_attachment might set status to complete
					$wpdb->update(
						$this->queue_table_name,
						array( // Mark as completed
							'status' => 'completed',
							'completed_at' => current_time( 'mysql', true ),
						),
						array( 'id' => $job_id )
					);
				} elseif ( $encode_format_obj->get_status() === 'pending_replacement' ) {
					$wpdb->update(
						$this->queue_table_name,
						array( 'status' => 'pending_replacement' ), // Mark as pending replacement
						array( 'id' => $job_id )
					);
					as_schedule_single_action( time() + 300, 'videopack_handle_job', array( 'job_id' => $job_id ), 'videopack_encode_jobs' ); // Recheck later
				} else {
					$error_msg = $encode_format_obj->get_error() ? $encode_format_obj->get_error() : 'Insert attachment failed.';
					$wpdb->update(
						$this->queue_table_name,
						array( // Mark as failed if insertion failed
							'status' => 'failed',
							'error_message' => $error_msg,
							'failed_at' => current_time( 'mysql', true ),
						),
						array( 'id' => $job_id )
					);
				}
				break;

				// 'completed', 'failed', 'canceled' are terminal states, no action needed by default.
		}

		if ( $original_blog_id && $job['blog_id'] != $original_blog_id ) {
			restore_current_blog();
		}

		// After handling a job, try to process the next pending job from the queue.
		as_schedule_single_action( time() + 10, 'videopack_process_pending_jobs', array(), 'videopack_queue_management' );
	}

	/**
	 * ActionScheduler callback to pick up the next 'queued' job.
	 */
	public function process_pending_jobs_action() {
		global $wpdb;
		if ( $this->options['queue_control'] !== 'play' ) {
			return; // Queue is paused
		}

		$processing_count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE status = %s', $this->queue_table_name, 'processing' ) );
		if ( $processing_count >= (int) ( $this->options['simultaneous_encodes'] ?? 1 ) ) {
			return; // Max concurrent jobs reached
		}

		$next_job = $wpdb->get_row(
			$wpdb->prepare( 'SELECT id FROM %i WHERE status = %s ORDER BY created_at ASC LIMIT 1', $this->queue_table_name, 'queued' ),
			ARRAY_A
		);

		if ( $next_job && isset( $next_job['id'] ) ) {
			// Schedule to handle this specific job.
			// Check if an action for this job_id with status 'queued' is already scheduled to avoid duplicates.
			$existing_actions = as_get_scheduled_actions(
				array(
					'hook'   => 'videopack_handle_job',
					'args'   => array( 'job_id' => $next_job['id'] ),
					'status' => \ActionScheduler_Store::STATUS_PENDING,
				)
			);
			if ( empty( $existing_actions ) ) {
				as_schedule_single_action( time(), 'videopack_handle_job', array( 'job_id' => $next_job['id'] ), 'videopack_encode_jobs' );
			}
		}
	}

	protected function get_action_args_by_id( int $action_id ) {
		$action_args = array();

		// Get the scheduled action by ID
		$actions = ActionScheduler::store()->fetch_action( $action_id );

		if ( $actions ) {
			// Get the action arguments
			$action_args = $actions->get_args();
		}

		return $action_args;
	}

	/**
	 * Get queue items.
	 *
	 * @param int|null $blog_id Optional. Blog ID to filter by. If null, returns for all blogs (network admin).
	 * @param array $statuses Optional. Array of statuses to include. Defaults to non-terminal.
	 * @return array
	 */
	public function get_queue_items( $blog_id = null, $statuses = null ) {
		global $wpdb;

		if ( null !== $blog_id ) {
			$all_items = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i WHERE blog_id = %d ORDER BY created_at ASC', $this->queue_table_name, $blog_id ), ARRAY_A );
		} else {
			$all_items = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i ORDER BY created_at ASC', $this->queue_table_name ), ARRAY_A );
		}

		if ( empty( $all_items ) ) {
			return array();
		}

		$filter_statuses = $statuses ?? array( 'queued', 'processing', 'needs_insert', 'pending_replacement' );

		if ( ! empty( $filter_statuses ) ) {
			$all_items = array_filter(
				$all_items,
				function ( $item ) use ( $filter_statuses ) {
					return isset( $item['status'] ) && in_array( $item['status'], $filter_statuses, true );
				}
			);
		}

		return array_values( $all_items ); // Re-index array after filtering
	}

	public function get_queue_for_blog( int $blog_id ) {
		return $this->get_queue_items( $blog_id );
	}

	public function get_queue_for_network() {
		// Gets non-terminal jobs for all blogs
		return $this->get_queue_items( null );
	}
}
