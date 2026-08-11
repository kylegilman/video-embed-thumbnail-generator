<?php
/**
 * Tests for Encode_Attachment::delete_format()'s authorization gate --
 * a job may only be deleted by its own owner (with encode_videos) or by
 * anyone with edit_others_video_encodes. This is a real, independent
 * capability check (separate from the REST layer's own permission_callback
 * on Job_Controller::job_delete()), and worth locking in directly since
 * Encode_Attachment is otherwise untested.
 */

use Videopack\Admin\Encode\Encode_Attachment;
use Videopack\Admin\Encode\Encode_Queue_Controller;
use Videopack\Admin\Formats\Registry;

class EncodeAttachmentDeleteAuthorizationTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function queue_table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'videopack_encoding_queue';
	}

	public function set_up() {
		parent::set_up();
		( new Encode_Queue_Controller( $this->options() ) )->add_table();
	}

	/**
	 * Inserts a real queue row and returns its job id, along with an
	 * Encode_Attachment constructed after the insert (so its constructor's
	 * own set_encode_formats() picks the row up).
	 *
	 * @return array{0: Encode_Attachment, 1: int} [$encoder, $job_id]
	 */
	protected function encoder_with_job( int $attachment_id, int $owner_user_id ): array {
		global $wpdb;
		$wpdb->insert(
			$this->queue_table_name(),
			array(
				'blog_id'       => get_current_blog_id(),
				'attachment_id' => $attachment_id,
				'input_url'     => 'https://example.com/video.mp4',
				'format_id'     => 'h264_720p',
				'status'        => 'completed',
				'user_id'       => $owner_user_id,
			)
		);
		$job_id = (int) $wpdb->insert_id;

		$options  = $this->options();
		$registry = new Registry( $options );
		$encoder  = new Encode_Attachment( $options, $registry, $attachment_id );

		return array( $encoder, $job_id );
	}

	protected function job_error_message( int $job_id ): string {
		global $wpdb;
		return (string) $wpdb->get_var( $wpdb->prepare( 'SELECT error_message FROM %i WHERE id = %d', $this->queue_table_name(), $job_id ) );
	}

	public function test_owner_with_encode_videos_capability_is_not_blocked(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		list( $encoder, $job_id ) = $this->encoder_with_job( $attachment_id, $owner_id );

		$owner = get_userdata( $owner_id );
		$owner->add_cap( 'encode_videos' );
		wp_set_current_user( $owner_id );

		$encoder->delete_format( $job_id );

		$this->assertStringNotContainsString( 'does not have permission', $this->job_error_message( $job_id ) );
	}

	public function test_owner_without_encode_videos_capability_is_blocked(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'subscriber' ) ); // No encode_videos.
		$attachment_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		list( $encoder, $job_id ) = $this->encoder_with_job( $attachment_id, $owner_id );

		wp_set_current_user( $owner_id );

		$result = $encoder->delete_format( $job_id );

		$this->assertFalse( $result );
		$this->assertStringContainsString( 'does not have permission', $this->job_error_message( $job_id ) );
	}

	public function test_non_owner_without_edit_others_capability_is_blocked(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$other_id      = self::factory()->user->create( array( 'role' => 'author' ) ); // Has encode_videos, but doesn't own this job.
		$attachment_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		list( $encoder, $job_id ) = $this->encoder_with_job( $attachment_id, $owner_id );

		$other = get_userdata( $other_id );
		$other->add_cap( 'encode_videos' );
		wp_set_current_user( $other_id );

		$result = $encoder->delete_format( $job_id );

		$this->assertFalse( $result );
		$this->assertStringContainsString( 'does not have permission', $this->job_error_message( $job_id ) );
	}

	public function test_non_owner_with_edit_others_capability_is_not_blocked(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$admin_id      = self::factory()->user->create( array( 'role' => 'administrator' ) ); // Has edit_others_video_encodes.
		$attachment_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		list( $encoder, $job_id ) = $this->encoder_with_job( $attachment_id, $owner_id );

		wp_set_current_user( $admin_id );

		$encoder->delete_format( $job_id );

		$this->assertStringNotContainsString( 'does not have permission', $this->job_error_message( $job_id ) );
	}

	// -----------------------------------------------------------------
	// delete_format_by_id() -- separate authorization gate for the
	// "no formal job record" path (a preset with a resolvable file but no
	// queue row -- checks the attachment's own post_author instead).
	// -----------------------------------------------------------------

	public function test_delete_format_by_id_blocks_non_owner_without_edit_others(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$other_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
				'post_author'    => $owner_id,
			)
		);

		$options  = $this->options();
		$registry = new Registry( $options );
		$encoder  = new Encode_Attachment( $options, $registry, $attachment_id );

		$real_format_id = (string) array_key_first( $registry->get_video_formats() );

		wp_set_current_user( $other_id );

		$this->assertFalse( $encoder->delete_format_by_id( $real_format_id ) );
	}

	public function test_delete_format_by_id_allows_owner(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
				'post_author'    => $owner_id,
			)
		);

		$options  = $this->options();
		$registry = new Registry( $options );
		$encoder  = new Encode_Attachment( $options, $registry, $attachment_id );

		$real_format_id = (string) array_key_first( $registry->get_video_formats() );

		wp_set_current_user( $owner_id );

		// No real encoded file exists on disk in this test, so the method
		// still returns true (nothing to delete) rather than false for an
		// unrelated reason -- what matters here is that it isn't blocked
		// by the permission check specifically.
		$this->assertTrue( $encoder->delete_format_by_id( $real_format_id ) );
	}

	/**
	 * Unlike the other tests here, 'author' isn't used for the owner --
	 * that role gets encode_videos by default (it has upload_files, which
	 * encode_videos maps to), which would mask the bug this test exists to
	 * catch: this path used to authorize the post's own author regardless
	 * of whether they had encode_videos at all, unlike
	 * Encode_Attachment::delete_format()'s equivalent check on a formal
	 * job record. A subscriber has neither capability nor role-default
	 * access, so ownership alone must not be enough.
	 */
	public function test_delete_format_by_id_blocks_owner_without_encode_videos_capability(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
				'post_author'    => $owner_id,
			)
		);

		$options  = $this->options();
		$registry = new Registry( $options );
		$encoder  = new Encode_Attachment( $options, $registry, $attachment_id );

		$real_format_id = (string) array_key_first( $registry->get_video_formats() );

		wp_set_current_user( $owner_id );

		$this->assertFalse( $encoder->delete_format_by_id( $real_format_id ) );
	}
}
