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
			id BIGINT UNSIGNED AUTO_INCREMENT,
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
			PRIMARY KEY  (id),
			KEY idx_blog_id (blog_id),
			KEY idx_attachment_id_blog_id (attachment_id, blog_id),
			KEY idx_input_url_blog_id (input_url(191), blog_id),
			KEY idx_format_id (format_id),
			KEY idx_status_blog_id (status, blog_id),
			KEY idx_action_id (action_id)
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
		$required = array(
			'id',
			'url',
			'formats',
		);

		if ( ! $this->required_keys( $args, $required ) || ! is_array( $args['formats'] ) || empty( $args['formats'] ) ) {
			$this->queue_log->add_to_log( 'error_invalid_args' );
			return $this->queue_log->get_log();
		}

		$attachment_identifier = sanitize_text_field( $args['id'] );
		$input_url             = esc_url_raw( $args['url'] );
		$user_id               = get_current_user_id();
		$current_blog_id       = get_current_blog_id();

		$encoder = new Encode_Attachment( $this->options_manager, $attachment_identifier, $input_url );
		foreach ( $args['formats'] as $format_to_encode ) {
			$format_id = sanitize_text_field( $format_to_encode );
			$queue_result = $encoder->queue_format( $format_id, $user_id, $current_blog_id );
			$this->queue_log->add_to_log( $queue_result['reason'] ?? $queue_result['status'], $format_id );
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

	/**
	 * Deletes a specific encoding job from the queue.
	 * This method handles the logic for finding the job, switching blog context (if multisite),
	 * delegating to Encode_Attachment for actual deletion, and returning the final status.
	 *
	 * @param int $job_id The ID of the job to delete.
	 * @return array|\WP_Error An array representing the deleted job's final state on success,
	 * or a WP_Error object on failure (e.g., job not found, permission denied).
	 */
	public function delete_job( int $job_id ) {
		global $wpdb;

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
			$encoder = new Encode_Attachment( $this->options_manager, $attachment_id_or_url, $input_url );

			// The delete_format method handles capability checks internally based on the job's user_id.
			$success = $encoder->delete_format( $job_id );

			// After deletion attempt, re-fetch the job to get its final status and error message.
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
		}
	}

	/**
	 * Retries a failed encoding job.
	 *
	 * @param int $job_id The ID of the job to retry.
	 * @return bool|\WP_Error True on success, WP_Error on failure.
	 */
	public function retry_job( int $job_id ) {
		global $wpdb;

		$job = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name, $job_id ), ARRAY_A );

		if ( ! $job ) {
			return new \WP_Error( 'videopack_job_not_found', __( 'Encoding job not found.', 'video-embed-thumbnail-generator' ), array( 'status' => 404 ) );
		}

		if ( 'failed' !== $job['status'] ) {
			return new \WP_Error( 'videopack_job_not_failed', __( 'Only failed jobs can be retried.', 'video-embed-thumbnail-generator' ), array( 'status' => 400 ) );
		}

		// Permission check
		$is_own_job = ( (int) $job['user_id'] === get_current_user_id() );
		if ( ! current_user_can( 'edit_others_video_encodes' ) && ! ( current_user_can( 'encode_videos' ) && $is_own_job ) ) {
			return new \WP_Error( 'videopack_permission_denied', __( 'You do not have permission to retry this job.', 'video-embed-thumbnail-generator' ), array( 'status' => 403 ) );
		}

		$update_result = $wpdb->update(
			$this->queue_table_name,
			array(
				'status'        => 'queued',
				'error_message' => null,
				'failed_at'     => null,
				'pid'           => null,
				'retry_count'   => (int) $job['retry_count'] + 1,
			),
			array( 'id' => $job_id )
		);

		if ( false === $update_result ) {
			return new \WP_Error( 'videopack_db_error', __( 'Could not update job status to retry.', 'video-embed-thumbnail-generator' ), array( 'status' => 500 ) );
		}

		// Trigger a one-off action to process any 'queued' items immediately.
		as_schedule_single_action( time(), 'videopack_process_pending_jobs', array(), 'videopack_queue_management' );

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
			'needs_insert'        => __( 'Finalizing', 'video-embed-thumbnail-generator' ),
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
	 * Get all queue items with details sanitized based on user permissions and context.
	 * This is used for the main queue view page.
	 *
	 * @return array An array of all queue items.
	 */
	public function get_full_queue_array() {
		// Get all jobs, regardless of status. Pass an empty array to get_queue_items to bypass default status filtering.
		$all_jobs = $this->get_queue_items( null, array() );

		if ( empty( $all_jobs ) ) {
			return array();
		}

		// Pre-fetch user capabilities to avoid repeated calls in loop.
		$current_user_id   = get_current_user_id();
		$can_edit_others   = current_user_can( 'edit_others_video_encodes' );
		$can_encode_videos = current_user_can( 'encode_videos' );
		$all_formats       = $this->options_manager->get_video_formats();
		$attachment_meta   = new \Videopack\Admin\Attachment_Meta( $this->options_manager );
		$processed_jobs    = array();

		foreach ( $all_jobs as $job ) {
			// Determine if the current user can edit this specific job.
			$is_own_job       = ( (int) $job['user_id'] === $current_user_id );
			$job['can_edit'] = ( $can_edit_others || ( $can_encode_videos && $is_own_job ) );

			// Add extra data for the React UI.
			if ( ! empty( $job['attachment_id'] ) ) {
				$job['video_title'] = get_the_title( $job['attachment_id'] );
				$poster_id          = get_post_thumbnail_id( $job['attachment_id'] );
				if ( ! $poster_id ) {
					$videopack_meta = $attachment_meta->get( $job['attachment_id'] );
					$poster_id      = $videopack_meta['poster_id'] ?? null;
				}
				$job['poster_url'] = $poster_id ? wp_get_attachment_image_url( $poster_id, 'thumbnail' ) : '';
			} else {
				$job['video_title'] = basename( $job['input_url'] );
				$job['poster_url']  = ''; // No poster for external URLs yet.
			}

			if ( isset( $all_formats[ $job['format_id'] ] ) ) {
				$job['format_name'] = $all_formats[ $job['format_id'] ]->get_name();
			} else {
				$job['format_name'] = $job['format_id'];
			}

			$job['status_l10n'] = $this->get_l10n_status( $job['status'] );

			$processed_jobs[] = $job;
		}

		// Super admins can see everything, always, regardless of context.
		if ( current_user_can( 'manage_network' ) ) {
			return $processed_jobs;
		}

		// For non-super-admins, we need to sanitize jobs from other blogs.
		$current_blog_id = get_current_blog_id();
		$sanitized_jobs  = array();

		foreach ( $processed_jobs as $job ) {
			if ( (int) $job['blog_id'] === $current_blog_id ) {
				// This job belongs to the current site, show all details.
				$sanitized_jobs[] = $job;
			} else {
				// This job is from another site, show only non-sensitive data.
				$sanitized_jobs[] = array(
					'id'                  => $job['id'],
					'blog_id'             => $job['blog_id'],
					'attachment_id'       => null,
					'input_url'           => __( 'Job from another site', 'video-embed-thumbnail-generator' ),
					'format_id'           => $job['format_id'],
					'status'              => $job['status'],
					'output_path'         => null,
					'output_url'          => null,
					'user_id'             => null,
					'pid'                 => null,
					'logfile_path'        => null,
					'action_id'           => null,
					'created_at'          => $job['created_at'],
					'updated_at'          => $job['updated_at'],
					'started_at'          => $job['started_at'],
					'completed_at'        => $job['completed_at'],
					'failed_at'           => $job['failed_at'],
					'error_message'       => null,
					'temp_watermark_path' => null,
					'retry_count'         => $job['retry_count'],
					'encode_options_hash' => null,
					'can_edit'            => false, // Non-super-admins can never edit jobs on other sites.
				);
			}
		}

		return $sanitized_jobs;
	}
}
