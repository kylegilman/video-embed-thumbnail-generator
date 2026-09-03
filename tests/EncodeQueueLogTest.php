<?php
/**
 * Tests for Encode_Queue_Log -- accumulating human-readable messages for
 * each outcome of trying to queue a format during batch/single encoding.
 * Previously completely untested.
 */

use Videopack\Admin\Encode\Encode_Queue_Log;
use Videopack\Admin\Formats\Registry;

class EncodeQueueLogTest extends WP_UnitTestCase {

	protected function log(): Encode_Queue_Log {
		$options = get_option( 'videopack_options', array() );
		return new Encode_Queue_Log( new Registry( $options ) );
	}

	protected function format_name( string $format_id ): string {
		$options = get_option( 'videopack_options', array() );
		$formats = ( new Registry( $options ) )->get_video_formats();
		return $formats[ $format_id ]->get_name();
	}

	public function test_get_log_starts_empty(): void {
		$this->assertSame( array(), $this->log()->get_log() );
	}

	public function test_a_known_format_id_is_resolved_to_its_display_name(): void {
		$log = $this->log();
		$log->add_to_log( 'queued', 'h264_1080' );

		$this->assertStringContainsString( $this->format_name( 'h264_1080' ), $log->get_log()[0] );
	}

	public function test_an_unknown_format_id_falls_back_to_the_raw_id(): void {
		$log = $this->log();
		$log->add_to_log( 'queued', 'not_a_real_format' );

		$this->assertStringContainsString( 'not_a_real_format', $log->get_log()[0] );
	}

	public function test_success_and_queued_produce_the_same_message(): void {
		$log = $this->log();
		$log->add_to_log( 'success', 'h264_1080' );
		$log->add_to_log( 'queued', 'h264_1080' );

		$messages = $log->get_log();
		$this->assertSame( $messages[0], $messages[1] );
	}

	public function test_permission_action_ignores_any_passed_format_id(): void {
		$log = $this->log();
		$log->add_to_log( 'permission', 'h264_1080' );

		$this->assertStringNotContainsString( $this->format_name( 'h264_1080' ), $log->get_log()[0] );
	}

	/**
	 * Every switch branch except 'permission' unconditionally builds
	 * "$name . ' ' . $message", so calling one of those actions without a
	 * $format_id leaves a stray leading space. Neither real call site in
	 * Encode_Queue_Controller does this today (the one call with no
	 * $format_id uses 'error_invalid_args', which isn't a known action and
	 * falls through to the name-less default branch), so this isn't a live
	 * bug -- documented here so a future caller doesn't trip over it.
	 */
	public function test_a_named_action_with_no_format_id_leaves_a_leading_space(): void {
		$log = $this->log();
		$log->add_to_log( 'already_queued' );

		$this->assertStringStartsWith( ' ', $log->get_log()[0] );
	}

	public function test_an_unrecognized_action_produces_a_generic_message(): void {
		$log = $this->log();
		$log->add_to_log( 'some_action_that_does_not_exist', 'h264_1080' );

		$this->assertNotEmpty( $log->get_log()[0] );
	}

	public function test_messages_accumulate_in_the_order_they_were_added(): void {
		$log = $this->log();
		$log->add_to_log( 'queued', 'h264_1080' );
		$log->add_to_log( 'already_queued', 'h264_720' );
		$log->add_to_log( 'permission' );

		$this->assertCount( 3, $log->get_log() );
		$this->assertStringContainsString( $this->format_name( 'h264_1080' ), $log->get_log()[0] );
		$this->assertStringContainsString( $this->format_name( 'h264_720' ), $log->get_log()[1] );
	}

	public function test_each_action_type_produces_a_distinct_message_for_the_same_format(): void {
		$actions = array(
			'queued',
			'already_queued',
			'already_exists',
			'lowres',
			'vcodec_unavailable',
			'acodec_unavailable',
			'error_invalid_format_key',
			'error_db_insert',
			'error_scheduling',
		);

		$messages = array();
		foreach ( $actions as $action ) {
			$log = $this->log();
			$log->add_to_log( $action, 'h264_1080' );
			$messages[] = $log->get_log()[0];
		}

		$this->assertSame( count( $actions ), count( array_unique( $messages ) ), 'every action should produce a distinct message' );
	}

	public function test_separate_instances_do_not_share_log_state(): void {
		$log_a = $this->log();
		$log_b = $this->log();

		$log_a->add_to_log( 'queued', 'h264_1080' );

		$this->assertCount( 1, $log_a->get_log() );
		$this->assertCount( 0, $log_b->get_log() );
	}
}
