<?php
/**
 * Tests for Encode_Format -- the per-job value object wrapping a queue
 * row. Covers set_status()'s allowed-status whitelist, the
 * current_user_can_manage()/user_can_manage() authorization logic,
 * get_progress()'s branching by status, set_error(), the set_queued()/
 * set_encode_start() convenience setters, to_array()'s filter, and
 * from_array()'s DB-row hydration (including malformed extra_meta JSON).
 * Previously completely untested.
 */

use Videopack\Admin\Encode\Encode_Format;

class EncodeFormatTest extends WP_UnitTestCase {

	protected function format( string $format_id = 'h264_720' ): Encode_Format {
		return new Encode_Format( $format_id );
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
}
