<?php
/**
 * Tests for Encode_Queue_Controller::format_log_message() -- the small
 * helper (formerly its own Encode_Queue_Log class) that turns a
 * queue_format() outcome into a human-readable message for the "Add
 * formats" UI -- and for enqueue_encodes()'s log filtering: only non-success
 * outcomes are surfaced, since a success is already reflected in the
 * returned encode_list/summary count.
 */

use Videopack\Admin\Encode\Encode_Queue_Controller;
use Videopack\Admin\Formats\Registry;

class EncodeQueueLogMessageTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function controller(): Encode_Queue_Controller {
		$options = $this->options();
		return new Encode_Queue_Controller( $options, new Registry( $options ) );
	}

	protected function queue_table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'videopack_encoding_queue';
	}

	public function set_up() {
		parent::set_up();
		( new Encode_Queue_Controller( $this->options() ) )->add_table();
	}

	protected function format_log_message( Encode_Queue_Controller $controller, string $action, $format_id = false ): string {
		$method = new ReflectionMethod( $controller, 'format_log_message' );
		$method->setAccessible( true );
		return $method->invoke( $controller, $action, $format_id );
	}

	protected function format_name( string $format_id ): string {
		$options = $this->options();
		$formats = ( new Registry( $options ) )->get_video_formats();
		return $formats[ $format_id ]->get_name();
	}

	// -----------------------------------------------------------------
	// format_log_message()
	// -----------------------------------------------------------------

	public function test_a_known_format_id_is_resolved_to_its_display_name(): void {
		$message = $this->format_log_message( $this->controller(), 'queued', 'h264_1080' );

		$this->assertStringContainsString( $this->format_name( 'h264_1080' ), $message );
	}

	public function test_an_unknown_format_id_falls_back_to_the_raw_id(): void {
		$message = $this->format_log_message( $this->controller(), 'queued', 'not_a_real_format' );

		$this->assertStringContainsString( 'not_a_real_format', $message );
	}

	public function test_success_and_queued_produce_the_same_message(): void {
		$controller = $this->controller();

		$this->assertSame(
			$this->format_log_message( $controller, 'success', 'h264_1080' ),
			$this->format_log_message( $controller, 'queued', 'h264_1080' )
		);
	}

	public function test_permission_action_ignores_any_passed_format_id(): void {
		$message = $this->format_log_message( $this->controller(), 'permission', 'h264_1080' );

		$this->assertStringNotContainsString( $this->format_name( 'h264_1080' ), $message );
	}

	public function test_an_unrecognized_action_produces_a_generic_message(): void {
		$message = $this->format_log_message( $this->controller(), 'some_action_that_does_not_exist', 'h264_1080' );

		$this->assertNotEmpty( $message );
	}

	public function test_each_action_type_produces_a_distinct_message_for_the_same_format(): void {
		$controller = $this->controller();
		$actions    = array(
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
			$messages[] = $this->format_log_message( $controller, $action, 'h264_1080' );
		}

		$this->assertSame( count( $actions ), count( array_unique( $messages ) ), 'every action should produce a distinct message' );
	}

	// -----------------------------------------------------------------
	// enqueue_encodes() -- only non-success outcomes reach the log.
	// -----------------------------------------------------------------

	protected function attachment_with_metadata( int $width = 1920, int $height = 1080 ): int {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		update_post_meta(
			$attachment_id,
			'_wp_attachment_metadata',
			array(
				'width'      => $width,
				'height'     => $height,
				'length'     => 60.0,
				'videocodec' => 'h264',
			)
		);
		return $attachment_id;
	}

	protected function insert_job( int $attachment_id, string $format_id, string $status = 'queued' ): void {
		global $wpdb;
		$wpdb->insert(
			$this->queue_table_name(),
			array(
				'blog_id'       => get_current_blog_id(),
				'attachment_id' => $attachment_id,
				'input_url'     => 'https://example.com/video.mp4',
				'format_id'     => $format_id,
				'status'        => $status,
				'user_id'       => 0,
			)
		);
	}

	/**
	 * A fresh (never-before-queued) format can't reach 'success' in this
	 * test environment -- check_if_can_queue() requires real FFmpeg codec
	 * availability, which isn't present here. Requeuing a *dead* job
	 * (queue_format()'s other success path, already covered directly in
	 * EncodeAttachmentQueueingTest::test_queue_format_requeues_a_dead_job_in_place)
	 * reaches 'success' without that dependency, so it's used here to get a
	 * real success alongside a real skip in the same enqueue_encodes() call.
	 */
	public function test_a_successful_format_produces_no_log_entry(): void {
		$attachment_id = $this->attachment_with_metadata();
		$this->insert_job( $attachment_id, 'h264_720', 'failed' ); // Dead job -- requeuing it is a success.

		$response = $this->controller()->enqueue_encodes(
			array(
				'id'      => (string) $attachment_id,
				'url'     => 'https://example.com/video.mp4',
				'formats' => array( 'h264_720' ),
			)
		);

		$this->assertCount( 1, $response['encode_list'] );
		$this->assertSame( array(), $response['log'], 'a successfully queued format should not appear in the log' );
	}

	public function test_a_skipped_format_appears_in_the_log_alongside_a_successful_one(): void {
		$attachment_id = $this->attachment_with_metadata();
		$this->insert_job( $attachment_id, 'h264_720', 'failed' ); // Dead job -- requeuing it is a success.
		$this->insert_job( $attachment_id, 'h264_1080', 'queued' ); // Already queued -- will be skipped.

		$response = $this->controller()->enqueue_encodes(
			array(
				'id'      => (string) $attachment_id,
				'url'     => 'https://example.com/video.mp4',
				'formats' => array( 'h264_720', 'h264_1080' ),
			)
		);

		$this->assertCount( 1, $response['encode_list'], 'only the requeued format should be counted as queued' );
		$this->assertCount( 1, $response['log'], 'only the skipped format should produce a log entry' );
		$this->assertStringContainsString( $this->format_name( 'h264_1080' ), $response['log'][0] );
		$this->assertStringNotContainsString( $this->format_name( 'h264_720' ), $response['log'][0] );
	}

	public function test_invalid_args_produce_a_single_log_entry_and_no_results(): void {
		$response = $this->controller()->enqueue_encodes( array( 'id' => '1' ) ); // missing required keys

		$this->assertCount( 1, $response['log'] );
		$this->assertSame( array(), $response['results'] );
	}
}
