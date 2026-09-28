<?php
/**
 * Tests for Encode_Format -- the per-job value object wrapping a queue
 * row. Covers set_status()'s allowed-status whitelist, the
 * current_user_can_manage()/user_can_manage() authorization logic,
 * get_progress()'s branching by status, set_error(), the set_queued()/
 * set_encode_start() convenience setters, to_array()'s filter,
 * from_array()'s DB-row hydration (including malformed extra_meta JSON),
 * get_status_label()/get_status_label_static()'s status-to-label map,
 * is_pid_alive(), and set_progress()'s log-file-driven state transitions
 * (success once 95%+ is reached, "terminated prematurely" below that, the
 * stale-logfile-plus-dead-process failure path, and its grace period).
 * Previously completely untested.
 */

use Videopack\Admin\Encode\Encode_Format;

class EncodeFormatTest extends WP_UnitTestCase {

	/**
	 * @var string[] Temp files created during a test, cleaned up in tear_down().
	 */
	protected $temp_files = array();

	public function tear_down() {
		foreach ( $this->temp_files as $file ) {
			if ( file_exists( $file ) ) {
				wp_delete_file( $file );
			}
		}
		$this->temp_files = array();
		parent::tear_down();
	}

	protected function format( string $format_id = 'h264_720' ): Encode_Format {
		return new Encode_Format( $format_id );
	}

	/**
	 * Writes an FFmpeg `-progress` style log file (same key=value format
	 * Encode_Progress::from_log_file() parses) and returns its path.
	 */
	protected function log_file( array $fields ): string {
		$defaults = array(
			'out_time_us' => '0',
			'progress'    => 'continue',
		);
		$fields             = array_merge( $defaults, $fields );
		$lines              = array();
		foreach ( $fields as $key => $value ) {
			$lines[] = "{$key}={$value}";
		}
		$file               = (string) tempnam( sys_get_temp_dir(), 'videopack-format-test-' );
		$this->temp_files[] = $file;
		file_put_contents( $file, implode( "\n", $lines ) . "\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		return $file;
	}

	// -----------------------------------------------------------------
	// set_status() -- allowed-status whitelist.
	// -----------------------------------------------------------------

	public function test_set_status_accepts_a_whitelisted_status(): void {
		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_ENCODING );

		$this->assertSame( Encode_Format::STATUS_ENCODING, $format->get_status() );
	}

	public function test_set_status_ignores_an_unrecognized_status(): void {
		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_QUEUED );

		$format->set_status( 'not_a_real_status' );

		$this->assertSame( Encode_Format::STATUS_QUEUED, $format->get_status() );
	}

	/**
	 * STATUS_ERROR/STATUS_NOT_ENCODED/STATUS_REMOTE_EXISTS exist as class
	 * constants but are deliberately absent from this whitelist -- they're
	 * UI-summary-only values assigned directly into a plain array in
	 * Encode_Attachment::get_formats_status(), never through this setter,
	 * so this isn't a live bug. Documented here so it isn't mistaken for
	 * one later.
	 */
	public function test_set_status_ignores_the_display_only_status_constants(): void {
		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_QUEUED );

		$format->set_status( Encode_Format::STATUS_ERROR );

		$this->assertSame( Encode_Format::STATUS_QUEUED, $format->get_status() );
	}

	public function test_set_status_whitelist_is_filterable(): void {
		add_filter(
			'videopack_allowed_job_statuses',
			static function ( $statuses ) {
				$statuses[] = 'my_custom_status';
				return $statuses;
			}
		);
		$format = $this->format();
		$format->set_status( 'my_custom_status' );
		remove_all_filters( 'videopack_allowed_job_statuses' );

		$this->assertSame( 'my_custom_status', $format->get_status() );
	}

	// -----------------------------------------------------------------
	// current_user_can_manage() / user_can_manage()
	// -----------------------------------------------------------------

	public function test_owner_with_own_capability_can_manage(): void {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$format = $this->format();
		$format->set_user_id( $user_id );

		$this->assertTrue( $format->current_user_can_manage() );
	}

	public function test_non_owner_without_others_capability_cannot_manage(): void {
		$owner_id     = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$non_owner_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $non_owner_id );

		$format = $this->format();
		$format->set_user_id( $owner_id );

		$this->assertFalse( $format->current_user_can_manage() );
	}

	public function test_non_owner_with_others_capability_can_manage_regardless_of_ownership(): void {
		$owner_id     = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		$non_owner_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $non_owner_id );

		$format = $this->format();
		$format->set_user_id( $owner_id );

		$this->assertTrue( $format->current_user_can_manage() );
	}

	public function test_owner_without_own_capability_cannot_manage(): void {
		$user_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $user_id );

		$format = $this->format();
		$format->set_user_id( $user_id );

		$this->assertFalse( $format->current_user_can_manage() );
	}

	public function test_user_can_manage_static_form_matches_instance_form(): void {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$this->assertTrue( Encode_Format::user_can_manage( $user_id ) );
	}

	// -----------------------------------------------------------------
	// get_progress()
	// -----------------------------------------------------------------

	public function test_get_progress_returns_recheck_for_a_queued_job(): void {
		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_QUEUED );

		$this->assertSame( 'recheck', $format->get_progress() );
	}

	public function test_get_progress_computes_percent_and_speed_for_an_encoding_job_with_no_logfile(): void {
		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_ENCODING );
		$format->set_progress_percent( 50 );
		$format->set_started( time() - 10 );
		$format->set_video_duration( 20000000 ); // 20 seconds, in microseconds.

		$progress = $format->get_progress();

		$this->assertIsArray( $progress );
		$this->assertSame( 50, $progress['percent'] );
		$this->assertSame( Encode_Format::STATUS_ENCODING, $progress['status'] );
	}

	public function test_get_progress_reports_finished_for_a_completed_job(): void {
		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_COMPLETED );
		$format->set_video_duration( 5000000 );

		$progress = $format->get_progress();

		$this->assertSame( 100.0, $progress['percent'] );
		$this->assertSame( 'end', $progress['progress'] );
	}

	public function test_get_progress_is_filterable(): void {
		add_filter(
			'videopack_encode_format_progress',
			static function () {
				return 'overridden';
			}
		);
		$progress = $this->format()->get_progress();
		remove_all_filters( 'videopack_encode_format_progress' );

		$this->assertSame( 'overridden', $progress );
	}

	// -----------------------------------------------------------------
	// set_error()
	// -----------------------------------------------------------------

	public function test_set_error_marks_the_job_failed_and_records_the_message(): void {
		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_ENCODING );

		$format->set_error( 'Something went wrong' );

		$this->assertSame( Encode_Format::STATUS_FAILED, $format->get_status() );
		$this->assertSame( 'Something went wrong', $format->get_error() );
	}

	// -----------------------------------------------------------------
	// set_queued() / set_encode_start()
	// -----------------------------------------------------------------

	public function test_set_queued_sets_status_path_url_and_user(): void {
		$format = $this->format();
		$format->set_queued( '/tmp/out.mp4', 'https://example.test/out.mp4', 42 );

		$this->assertSame( Encode_Format::STATUS_QUEUED, $format->get_status() );
		$this->assertSame( '/tmp/out.mp4', $format->get_path() );
		$this->assertSame( 'https://example.test/out.mp4', $format->get_url() );
		$this->assertSame( 42, $format->get_user_id() );
	}

	public function test_set_encode_start_sets_status_pid_and_started(): void {
		$format = $this->format();
		$started = time();
		$format->set_encode_start( 12345, $started );

		$this->assertSame( Encode_Format::STATUS_ENCODING, $format->get_status() );
		$this->assertSame( 12345, $format->get_pid() );
		$this->assertSame( $started, $format->get_started() );
	}

	// -----------------------------------------------------------------
	// to_array()
	// -----------------------------------------------------------------

	public function test_to_array_includes_extra_meta_and_is_filterable(): void {
		$format = $this->format();
		$format->set_meta_value( 'retry_source', 'admin_ui' );

		$array = $format->to_array();
		$this->assertSame( array( 'retry_source' => 'admin_ui' ), $array['extra_meta'] );

		add_filter(
			'videopack_encode_format_to_array',
			static function ( $vars ) {
				$vars['injected'] = true;
				return $vars;
			}
		);
		$filtered = $format->to_array();
		remove_all_filters( 'videopack_encode_format_to_array' );

		$this->assertTrue( $filtered['injected'] );
	}

	// -----------------------------------------------------------------
	// from_array()
	// -----------------------------------------------------------------

	public function test_from_array_hydrates_basic_fields(): void {
		$format = Encode_Format::from_array(
			array(
				'format_id'   => 'h264_1080',
				'id'          => 55,
				'status'      => 'queued',
				'user_id'     => 7,
				'output_url'  => 'https://example.test/video.mp4',
				'output_path' => '/tmp/video.mp4',
				'video_title' => 'My Video',
			)
		);

		$this->assertSame( 'h264_1080', $format->get_format_id() );
		$this->assertSame( 55, $format->get_job_id() );
		$this->assertSame( 'queued', $format->get_status() );
		$this->assertSame( 7, $format->get_user_id() );
		$this->assertSame( 'https://example.test/video.mp4', $format->get_url() );
		$this->assertSame( '/tmp/video.mp4', $format->get_path() );
		$this->assertSame( 'My Video', $format->get_video_title() );
	}

	public function test_from_array_converts_date_strings_to_timestamps(): void {
		$format = Encode_Format::from_array(
			array(
				'format_id'     => 'h264_720',
				'started_at'    => '2024-01-15 10:00:00',
				'completed_at'  => '2024-01-15 10:05:00',
			)
		);

		$this->assertSame( strtotime( '2024-01-15 10:00:00' ), $format->get_started() );
		$this->assertSame( strtotime( '2024-01-15 10:05:00' ), $format->get_ended() );
	}

	public function test_from_array_decodes_valid_extra_meta_json(): void {
		$format = Encode_Format::from_array(
			array(
				'format_id'  => 'h264_720',
				'extra_meta' => wp_json_encode( array( 'retry_source' => 'admin_ui' ) ),
			)
		);

		$this->assertSame( 'admin_ui', $format->get_meta_value( 'retry_source' ) );
	}

	public function test_from_array_tolerates_malformed_extra_meta_json(): void {
		$format = Encode_Format::from_array(
			array(
				'format_id'  => 'h264_720',
				'extra_meta' => 'not valid json{{{',
			)
		);

		$this->assertSame( array(), $format->get_extra_meta() );
	}

	public function test_from_array_defaults_missing_keys_to_null(): void {
		$format = Encode_Format::from_array( array( 'format_id' => 'h264_720' ) );

		$this->assertNull( $format->get_pid() );
		$this->assertNull( $format->get_logfile() );
	}

	// -----------------------------------------------------------------
	// get_status_label() / get_status_label_static()
	// -----------------------------------------------------------------

	public function test_status_label_maps_known_statuses_to_localized_text(): void {
		$this->assertSame( 'Queued', Encode_Format::get_status_label_static( Encode_Format::STATUS_QUEUED ) );
		$this->assertSame( 'Completed', Encode_Format::get_status_label_static( Encode_Format::STATUS_COMPLETED ) );
		$this->assertSame( 'Failed', Encode_Format::get_status_label_static( Encode_Format::STATUS_FAILED ) );
		$this->assertSame( 'Failed', Encode_Format::get_status_label_static( Encode_Format::STATUS_ERROR ), 'error and failed share the same label' );
	}

	public function test_status_label_treats_the_legacy_encoded_status_as_completed(): void {
		$this->assertSame( 'Completed', Encode_Format::get_status_label_static( 'encoded' ) );
	}

	public function test_status_label_falls_back_to_the_raw_status_string_when_unrecognized(): void {
		$this->assertSame( 'some_unknown_status', Encode_Format::get_status_label_static( 'some_unknown_status' ) );
	}

	public function test_status_label_handles_a_null_status(): void {
		$this->assertSame( '', Encode_Format::get_status_label_static( null ) );
	}

	public function test_status_label_is_filterable(): void {
		add_filter(
			'videopack_status_label',
			static function ( $label, $status ) {
				return 'queued' === $status ? 'Custom Queued Label' : $label;
			},
			10,
			2
		);

		$label = Encode_Format::get_status_label_static( Encode_Format::STATUS_QUEUED );
		remove_all_filters( 'videopack_status_label' );

		$this->assertSame( 'Custom Queued Label', $label );
	}

	public function test_instance_status_label_reads_its_own_status_and_is_separately_filterable(): void {
		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_ENCODING );

		add_filter(
			'videopack_encode_format_status_label',
			static function ( $label, Encode_Format $instance ) {
				return $label . ' (' . $instance->get_format_id() . ')';
			},
			10,
			2
		);

		$label = $format->get_status_label();
		remove_all_filters( 'videopack_encode_format_status_label' );

		$this->assertSame( 'Encoding (h264_720)', $label );
	}

	// -----------------------------------------------------------------
	// is_pid_alive()
	// -----------------------------------------------------------------

	public function test_is_pid_alive_is_false_with_no_pid_set(): void {
		$this->assertFalse( $this->format()->is_pid_alive() );
	}

	public function test_is_pid_alive_is_true_for_the_current_process(): void {
		$format = $this->format();
		$format->set_pid( getmypid() );

		$this->assertTrue( $format->is_pid_alive() );
	}

	public function test_is_pid_alive_is_false_for_an_implausible_pid(): void {
		// Not PHP_INT_MAX: posix_kill() takes a C int, so PHP_INT_MAX wraps
		// to -1, which is kill()'s special "broadcast to every signalable
		// process" pid and (as the test-runner's own user) returns true.
		// 999999 is outside any real PID range without hitting that case.
		$format = $this->format();
		$format->set_pid( 999999 );

		$this->assertFalse( $format->is_pid_alive() );
	}

	// -----------------------------------------------------------------
	// set_progress() (exercised via get_status()/get_progress(), both of
	// which call it) -- the log-file-driven status transitions.
	// -----------------------------------------------------------------

	public function test_reaching_the_end_of_the_log_at_high_percent_marks_the_job_needing_insert(): void {
		$logfile = $this->log_file(
			array(
				'out_time_us' => '9800000',
				'progress'    => 'end',
			)
		);
		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_ENCODING );
		$format->set_logfile( $logfile );
		$format->set_video_duration( 10000000 ); // 10s; 9.8s/10s = 98%.
		$format->set_started( time() - 5 );

		$status = $format->get_status();

		$this->assertSame( Encode_Format::STATUS_NEEDS_INSERT, $status );
		$this->assertSame( filemtime( $logfile ), $format->get_ended() );
	}

	public function test_reaching_the_end_of_the_log_below_95_percent_is_treated_as_a_premature_failure(): void {
		$logfile = $this->log_file(
			array(
				'out_time_us' => '5000000',
				'progress'    => 'end',
			)
		);
		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_ENCODING );
		$format->set_logfile( $logfile );
		$format->set_video_duration( 10000000 ); // 10s; 5s/10s = 50%.
		$format->set_started( time() - 5 );

		$status = $format->get_status();

		$this->assertSame( Encode_Format::STATUS_FAILED, $status );
		$this->assertSame( 'Encoding process terminated prematurely.', $format->get_error() );
	}

	public function test_reaching_the_end_of_the_log_with_no_duration_metadata_still_succeeds(): void {
		$logfile = $this->log_file(
			array(
				'out_time_us' => '1000000',
				'progress'    => 'end',
			)
		);
		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_ENCODING );
		$format->set_logfile( $logfile );
		$format->set_video_duration( 0 ); // No duration metadata at all.
		$format->set_started( time() - 5 );

		$status = $format->get_status();

		$this->assertSame( Encode_Format::STATUS_NEEDS_INSERT, $status, 'a low percent should not block success when duration is unknown' );
	}

	public function test_a_stale_logfile_with_a_dead_process_is_marked_failed(): void {
		$logfile = $this->log_file( array( 'out_time_us' => '2000000' ) ); // 'continue', not 'end'.
		touch( $logfile, time() - 400 ); // last written 400s ago, past the 300s timeout.

		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_ENCODING );
		$format->set_logfile( $logfile );
		$format->set_video_duration( 10000000 );
		$format->set_started( time() - 400 );
		$format->set_pid( 999999 ); // Guaranteed not alive (see note above).

		$status = $format->get_status();

		$this->assertSame( Encode_Format::STATUS_FAILED, $status );
		$this->assertSame( 'Encoding stopped unexpectedly', $format->get_error() );
	}

	public function test_a_stale_logfile_is_not_failed_while_the_process_is_still_alive(): void {
		$logfile = $this->log_file( array( 'out_time_us' => '2000000' ) );
		touch( $logfile, time() - 400 );

		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_ENCODING );
		$format->set_logfile( $logfile );
		$format->set_video_duration( 10000000 );
		$format->set_started( time() - 400 );
		$format->set_pid( getmypid() ); // Alive -- this test process itself.

		$status = $format->get_status();

		$this->assertSame( Encode_Format::STATUS_ENCODING, $status, 'still-running processes should not be failed just for a stale logfile' );
	}

	public function test_a_brand_new_empty_logfile_is_given_a_grace_period_before_timing_out(): void {
		$logfile = $this->log_file( array() );
		file_put_contents( $logfile, '' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents -- force it empty.

		$format = $this->format();
		$format->set_status( Encode_Format::STATUS_ENCODING );
		$format->set_logfile( $logfile );
		$format->set_video_duration( 10000000 );
		$format->set_started( time() - 5 ); // Well within the 30s grace period.
		$format->set_pid( 999999 ); // Would otherwise fail immediately if checked (see note above).

		$status = $format->get_status();

		$this->assertSame( Encode_Format::STATUS_ENCODING, $status, 'an empty, brand-new logfile should not be treated as stale yet' );
		$this->assertNull( $format->get_error() );
	}
}
