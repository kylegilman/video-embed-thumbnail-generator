<?php
/**
 * Tests for Encode_Attachment::queue_format()'s dedup/requeue gate and
 * cancel_encoding()'s authorization/precondition guards -- plus the small
 * metadata-derived getters (get_normalized_source_codec(), get_video_duration(),
 * get_video_title()). queue_format() is the one place that decides whether a
 * request becomes a new DB row, silently no-ops as "already queued", or
 * resurrects a dead job -- getting that gate wrong means either duplicate
 * jobs or a request that's silently dropped. cancel_encoding() is only
 * exercised up to (never past) the point where it would send a real
 * process signal, since a real signal could hit an unrelated live PID.
 */

use Videopack\Admin\Encode\Encode_Attachment;
use Videopack\Admin\Encode\Encode_Format;
use Videopack\Admin\Encode\Encode_Queue_Controller;
use Videopack\Admin\Formats\Registry;

class EncodeAttachmentQueueingTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function queue_table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'videopack_encoding_queue';
	}

	public function set_up() {
		parent::set_up();
		( new Encode_Queue_Controller( $this->options() ) )->add_table();
	}

	protected function attachment_with_metadata( int $width, int $height, string $codec = 'h264', float $length = 60.0 ): int {
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
				'length'     => $length,
				'videocodec' => $codec,
			)
		);
		return $attachment_id;
	}

	protected function encoder( int $attachment_id, array $options = array() ): Encode_Attachment {
		$options  = $this->options( $options );
		$registry = new Registry( $options );
		return new Encode_Attachment( $options, $registry, $attachment_id );
	}

	protected function insert_job( int $attachment_id, string $format_id, array $overrides = array() ): int {
		global $wpdb;
		$wpdb->insert(
			$this->queue_table_name(),
			array_merge(
				array(
					'blog_id'       => get_current_blog_id(),
					'attachment_id' => $attachment_id,
					'input_url'     => 'https://example.com/video.mp4',
					'format_id'     => $format_id,
					'status'        => 'queued',
					'user_id'       => 0,
				),
				$overrides
			)
		);
		return (int) $wpdb->insert_id;
	}

	protected function job_row( int $job_id ) {
		global $wpdb;
		return $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->queue_table_name(), $job_id ) );
	}

	// -----------------------------------------------------------------
	// queue_format() -- dedup / requeue gate
	// -----------------------------------------------------------------

	public function test_queue_format_rejects_when_an_active_job_already_exists(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$job_id        = $this->insert_job( $attachment_id, 'h264_720', array( 'status' => 'queued' ) );
		$encoder       = $this->encoder( $attachment_id );

		$result = $encoder->queue_format( 'h264_720', 1, get_current_blog_id() );

		$this->assertSame( array( 'status' => 'failed', 'reason' => 'already_queued' ), $result );

		// No new row was inserted, and the existing one is untouched.
		global $wpdb;
		$count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE attachment_id = %d', $this->queue_table_name(), $attachment_id ) );
		$this->assertSame( 1, $count );
		$this->assertSame( 'queued', $this->job_row( $job_id )->status );
	}

	public function test_queue_format_rejects_when_an_active_processing_job_already_exists(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$this->insert_job( $attachment_id, 'h264_720', array( 'status' => 'processing' ) );
		$encoder = $this->encoder( $attachment_id );

		$result = $encoder->queue_format( 'h264_720', 1, get_current_blog_id() );

		$this->assertSame( 'failed', $result['status'] );
		$this->assertSame( 'already_queued', $result['reason'] );
	}

	/**
	 * @dataProvider requeueable_statuses
	 */
	public function test_queue_format_requeues_a_dead_job_in_place( string $dead_status ): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$job_id        = $this->insert_job(
			$attachment_id,
			'h264_720',
			array(
				'status'       => $dead_status,
				'retry_count'  => 2,
				'error_message' => 'previous failure',
			)
		);
		$encoder = $this->encoder( $attachment_id );

		$result = $encoder->queue_format( 'h264_720', 5, get_current_blog_id() );

		$this->assertSame( 'success', $result['status'] );
		$this->assertSame( 'requeued', $result['reason'] );
		$this->assertSame( $job_id, $result['job_id'] );

		// Same row reused (id unchanged), not a second row inserted.
		global $wpdb;
		$count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE attachment_id = %d', $this->queue_table_name(), $attachment_id ) );
		$this->assertSame( 1, $count );

		$row = $this->job_row( $job_id );
		$this->assertSame( 'queued', $row->status );
		$this->assertSame( 3, (int) $row->retry_count );
		$this->assertSame( 5, (int) $row->user_id );
		$this->assertNull( $row->error_message );
	}

	public function requeueable_statuses(): array {
		return array(
			'deleted'  => array( 'deleted' ),
			'canceled' => array( 'canceled' ),
			'failed'   => array( 'failed' ),
		);
	}

	public function test_queue_format_merges_extra_meta_on_requeue(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$job_id        = $this->insert_job(
			$attachment_id,
			'h264_720',
			array(
				'status'     => 'failed',
				'extra_meta' => wp_json_encode( array( 'cloud_job_id' => 'abc123' ) ),
			)
		);
		$encoder = $this->encoder( $attachment_id );

		$encoder->queue_format( 'h264_720', 1, get_current_blog_id(), array( 'retry_source' => 'admin_ui' ) );

		$row           = $this->job_row( $job_id );
		$merged_meta   = json_decode( (string) $row->extra_meta, true );
		$this->assertSame( 'abc123', $merged_meta['cloud_job_id'] );
		$this->assertSame( 'admin_ui', $merged_meta['retry_source'] );
	}

	public function test_queue_format_rejects_new_job_for_invalid_format_id(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id );

		$result = $encoder->queue_format( 'not_a_real_format_id', 1, get_current_blog_id() );

		$this->assertSame( array( 'status' => 'failed', 'reason' => 'error_invalid_format_key' ), $result );

		global $wpdb;
		$count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE attachment_id = %d', $this->queue_table_name(), $attachment_id ) );
		$this->assertSame( 0, $count );
	}

	public function test_queue_format_rejects_new_job_that_would_be_an_upscale(): void {
		$attachment_id = $this->attachment_with_metadata( 640, 360, 'h264' );
		$encoder       = $this->encoder( $attachment_id );

		$result = $encoder->queue_format( 'h264_1080', 1, get_current_blog_id() );

		$this->assertSame( array( 'status' => 'failed', 'reason' => 'lowres' ), $result );
	}

	// -----------------------------------------------------------------
	// cancel_encoding() -- guards only; never reaches real process-signal
	// code (that branch requires pid set AND status === 'encoding').
	// -----------------------------------------------------------------

	public function test_cancel_encoding_returns_false_for_unknown_job(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$encoder       = $this->encoder( $attachment_id );

		$this->assertFalse( $encoder->cancel_encoding( 999999 ) );
	}

	public function test_cancel_encoding_blocks_non_owner_without_edit_others(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$other_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$job_id        = $this->insert_job(
			$attachment_id,
			'h264_720',
			array(
				'status'  => 'encoding',
				'pid'     => 12345,
				'user_id' => $owner_id,
			)
		);
		$encoder = $this->encoder( $attachment_id );

		$other = get_userdata( $other_id );
		$other->add_cap( 'encode_videos' );
		wp_set_current_user( $other_id );

		$this->assertFalse( $encoder->cancel_encoding( $job_id ) );
		$this->assertStringContainsString( 'does not have permission', (string) $this->job_row( $job_id )->error_message );
	}

	public function test_cancel_encoding_returns_false_when_job_has_no_pid(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$job_id        = $this->insert_job(
			$attachment_id,
			'h264_720',
			array(
				'status'  => 'encoding',
				'pid'     => 0,
				'user_id' => $owner_id,
			)
		);
		$encoder = $this->encoder( $attachment_id );

		$owner = get_userdata( $owner_id );
		$owner->add_cap( 'encode_videos' );
		wp_set_current_user( $owner_id );

		$this->assertFalse( $encoder->cancel_encoding( $job_id ) );
	}

	public function test_cancel_encoding_returns_false_when_job_is_not_actively_encoding(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		$job_id        = $this->insert_job(
			$attachment_id,
			'h264_720',
			array(
				'status'  => 'completed',
				'pid'     => 12345,
				'user_id' => $owner_id,
			)
		);
		$encoder = $this->encoder( $attachment_id );

		$owner = get_userdata( $owner_id );
		$owner->add_cap( 'encode_videos' );
		wp_set_current_user( $owner_id );

		$this->assertFalse( $encoder->cancel_encoding( $job_id ) );
	}

	// -----------------------------------------------------------------
	// Small metadata-derived getters.
	// -----------------------------------------------------------------

	public function test_get_normalized_source_codec_maps_ffmpeg_names_to_canonical_ids(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'hevc' );
		$encoder       = $this->encoder( $attachment_id );

		$this->assertSame( 'h265', $encoder->get_normalized_source_codec() );
	}

	public function test_get_normalized_source_codec_returns_null_when_metadata_never_resolved(): void {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		$encoder = $this->encoder( $attachment_id );

		$this->assertNull( $encoder->get_normalized_source_codec() );
	}

	public function test_get_video_duration_converts_seconds_to_microseconds(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264', 90.0 );
		$encoder       = $this->encoder( $attachment_id );

		$this->assertSame( 90000000, $encoder->get_video_duration() );
	}

	public function test_get_video_title_uses_the_post_title_for_attachments(): void {
		$attachment_id = $this->attachment_with_metadata( 1920, 1080, 'h264' );
		wp_update_post(
			array(
				'ID'         => $attachment_id,
				'post_title' => 'My Test Video',
			)
		);
		$encoder = $this->encoder( $attachment_id );

		$this->assertSame( 'My Test Video', $encoder->get_video_title() );
	}
}
