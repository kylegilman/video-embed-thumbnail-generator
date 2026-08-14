<?php
/**
 * Tests for Attachment_Processor -- the intake counterpart to
 * Attachment_Deleter, deciding what happens to a newly-uploaded video
 * (auto-encode, auto-thumbnail) based on plugin options. Previously
 * completely untested despite real branching logic: skipping child
 * transcoded formats, distinguishing animated from static GIFs, and
 * building the candidate lists batch operations rely on are all easy to
 * silently break.
 */

use Videopack\Admin\Attachment_Processor;
use Videopack\Admin\Formats\Registry;

class AttachmentProcessorTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function registry( array $options ): Registry {
		return new Registry( $options );
	}

	protected function processor( array $options = array() ): Attachment_Processor {
		$options = $this->options( $options );
		return new Attachment_Processor( $options, $this->registry( $options ) );
	}

	protected function queue_table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'videopack_encoding_queue';
	}

	public function set_up() {
		parent::set_up();
		( new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options() ) )->add_table();
	}

	protected function queued_format_ids( int $attachment_id ): array {
		global $wpdb;
		return $wpdb->get_col( $wpdb->prepare( "SELECT format_id FROM {$this->queue_table_name()} WHERE attachment_id = %d", $attachment_id ) );
	}

	protected function create_video( array $extra = array() ): int {
		return self::factory()->attachment->create_object(
			array_merge(
				array(
					'file'           => 'video.mp4',
					'post_mime_type' => 'video/mp4',
					'post_status'    => 'inherit',
				),
				$extra
			)
		);
	}

	protected function is_video( Attachment_Processor $processor, $post ): bool {
		$method = new ReflectionMethod( Attachment_Processor::class, 'is_video' );
		$method->setAccessible( true );
		return (bool) $method->invoke( $processor, $post );
	}

	protected function is_animated_gif( Attachment_Processor $processor, string $filename ): bool {
		$method = new ReflectionMethod( Attachment_Processor::class, 'is_animated_gif' );
		$method->setAccessible( true );
		return (bool) $method->invoke( $processor, $filename );
	}

	// -----------------------------------------------------------------
	// is_video()
	// -----------------------------------------------------------------

	public function test_is_video_true_for_video_mime_type(): void {
		$id = $this->create_video();
		$this->assertTrue( $this->is_video( $this->processor(), get_post( $id ) ) );
	}

	public function test_is_video_true_for_gif_mime_type(): void {
		$id = self::factory()->attachment->create_object( array( 'file' => 'anim.gif', 'post_mime_type' => 'image/gif' ) );
		$this->assertTrue( $this->is_video( $this->processor(), get_post( $id ) ) );
	}

	public function test_is_video_false_for_other_image_mime_type(): void {
		$id = self::factory()->attachment->create_object( array( 'file' => 'photo.jpg', 'post_mime_type' => 'image/jpeg' ) );
		$this->assertFalse( $this->is_video( $this->processor(), get_post( $id ) ) );
	}

	public function test_is_video_accepts_numeric_id_as_well_as_post_object(): void {
		$id = $this->create_video();
		$this->assertTrue( $this->is_video( $this->processor(), $id ) );
	}

	public function test_is_video_false_for_nonexistent_post(): void {
		$this->assertFalse( $this->is_video( $this->processor(), 999999 ) );
	}

	// -----------------------------------------------------------------
	// is_animated_gif() -- real byte-level file parsing.
	// -----------------------------------------------------------------

	protected function write_temp_gif( string $bytes ): string {
		$path = wp_tempnam( 'videopack-test.gif' );
		file_put_contents( $path, $bytes );
		return $path;
	}

	/**
	 * Minimal single-frame GIF (no Graphic Control Extension repeated,
	 * i.e. no second frame marker) -- a 1x1 transparent GIF, base64-decoded.
	 */
	protected function static_gif_bytes(): string {
		return base64_decode( 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7' );
	}

	public function test_is_animated_gif_false_for_static_gif(): void {
		$path = $this->write_temp_gif( $this->static_gif_bytes() );
		$this->assertFalse( $this->is_animated_gif( $this->processor(), $path ) );
		unlink( $path );
	}

	public function test_is_animated_gif_false_for_nonexistent_file(): void {
		$this->assertFalse( $this->is_animated_gif( $this->processor(), '/nonexistent/path/to/file.gif' ) );
	}

	// -----------------------------------------------------------------
	// process_new_attachment_action() -- gating and branch selection.
	// -----------------------------------------------------------------

	public function test_child_format_attachments_are_skipped_entirely(): void {
		$id = $this->create_video();
		update_post_meta( $id, '_kgflashmediaplayer-format', 'h264_720p' );

		$this->processor( array( 'auto_encode' => true ) )->process_new_attachment_action( $id );

		$this->assertSame( array(), $this->queued_format_ids( $id ) );
	}

	public function test_nonexistent_post_does_not_throw(): void {
		$this->processor( array( 'auto_encode' => true, 'auto_thumb' => true ) )->process_new_attachment_action( 999999 );
		$this->assertTrue( true ); // Reaching here without a fatal is the assertion.
	}

	public function test_auto_encode_disabled_queues_nothing(): void {
		$id = $this->create_video();
		$this->processor( array( 'auto_encode' => false ) )->process_new_attachment_action( $id );
		$this->assertSame( array(), $this->queued_format_ids( $id ) );
	}

	/**
	 * check_if_can_queue()'s codec-availability gate normally shells out to
	 * a real ffmpeg binary (Encode_Attachment::set_codecs()) -- not
	 * available in this test environment, and not what this test cares
	 * about anyway (that's ffmpeg integration, not this class's own
	 * branching logic). videopack_get_codecs lets every registered
	 * codec's encoder report available without needing one.
	 */
	protected function fake_all_codecs_available(): void {
		add_filter(
			'videopack_get_codecs',
			static function () {
				return array_fill_keys(
					array( 'libx264', 'libx265', 'libvpx', 'libvpx-vp9', 'libsvtav1', 'libaom-av1', 'libfdk_aac', 'aac', 'libfaac', 'libvorbis', 'libopus' ),
					true
				);
			}
		);
	}

	public function test_auto_encode_enabled_queues_enabled_formats_for_a_real_video(): void {
		$this->fake_all_codecs_available();

		$id      = $this->create_video();
		$options = $this->options( array( 'auto_encode' => true ) );
		$registry = $this->registry( $options );
		$enabled_formats = array_filter( $registry->get_video_formats(), fn( $f ) => $f->is_enabled() );
		$this->assertNotEmpty( $enabled_formats, 'Test needs at least one enabled format.' );

		( new Attachment_Processor( $options, $registry ) )->process_new_attachment_action( $id );

		$queued = $this->queued_format_ids( $id );
		$this->assertNotEmpty( $queued );
		foreach ( $queued as $format_id ) {
			$this->assertArrayHasKey( $format_id, $enabled_formats );
		}
	}

	public function test_non_animated_gif_is_not_encoded_even_with_auto_encode_gif(): void {
		$id = self::factory()->attachment->create_object( array( 'file' => 'anim.gif', 'post_mime_type' => 'image/gif' ) );
		// Point the attached file at a real static GIF so is_animated_gif() gets a real read.
		update_attached_file( $id, $this->write_temp_gif( $this->static_gif_bytes() ) );

		$this->processor( array( 'auto_encode' => true, 'auto_encode_gif' => true ) )->process_new_attachment_action( $id );

		$this->assertSame( array(), $this->queued_format_ids( $id ) );
	}

	public function test_gif_is_not_encoded_when_auto_encode_gif_disabled(): void {
		$id = self::factory()->attachment->create_object( array( 'file' => 'anim.gif', 'post_mime_type' => 'image/gif' ) );
		$this->processor( array( 'auto_encode' => true, 'auto_encode_gif' => false ) )->process_new_attachment_action( $id );
		$this->assertSame( array(), $this->queued_format_ids( $id ) );
	}

	// -----------------------------------------------------------------
	// add_attachment_handler() -- the auto_encode/auto_thumb gate before
	// anything is scheduled at all.
	// -----------------------------------------------------------------

	public function test_add_attachment_handler_schedules_nothing_when_both_options_disabled(): void {
		$id = $this->create_video();
		$this->processor( array( 'auto_encode' => false, 'auto_thumb' => false ) )->add_attachment_handler( $id );
		$this->assertFalse( (bool) as_has_scheduled_action( 'videopack_process_new_attachment', array( 'post_id' => $id ), 'videopack-attachments' ) );
	}

	public function test_add_attachment_handler_schedules_for_a_real_video_when_auto_encode_enabled(): void {
		$id = $this->create_video();
		$this->processor( array( 'auto_encode' => true ) )->add_attachment_handler( $id );
		$this->assertNotFalse( as_has_scheduled_action( 'videopack_process_new_attachment', array( 'post_id' => $id ), 'videopack-attachments' ) );
	}

	public function test_add_attachment_handler_schedules_nothing_for_a_non_video(): void {
		$id = self::factory()->attachment->create_object( array( 'file' => 'photo.jpg', 'post_mime_type' => 'image/jpeg' ) );
		$this->processor( array( 'auto_encode' => true, 'auto_thumb' => true ) )->add_attachment_handler( $id );
		$this->assertFalse( (bool) as_has_scheduled_action( 'videopack_process_new_attachment', array( 'post_id' => $id ), 'videopack-attachments' ) );
	}

	// -----------------------------------------------------------------
	// Thumbnail-candidate / batch-encoding candidate discovery.
	// -----------------------------------------------------------------

	public function test_get_thumbnail_candidates_includes_video_without_poster_or_format(): void {
		$id = $this->create_video();
		$candidates = $this->processor()->get_thumbnail_candidates();
		$this->assertContains( $id, array_column( $candidates, 'id' ) );
	}

	/**
	 * The exclusion check is keyed on WP core's own featured-image meta
	 * (_thumbnail_id), not either Videopack poster meta key. Every real
	 * poster-setting code path -- current (FFmpeg_Thumbnails::
	 * assign_thumbnail_to_video() -> Attachment_Meta::set_poster(), paired
	 * with set_post_thumbnail()) and every one going back to the plugin's
	 * earliest releases -- has always kept _thumbnail_id in sync with the
	 * poster (see docs/public/docs/migration/v5-upgrade.md), so this is a
	 * safe, reliable signal that doesn't depend on which meta format a
	 * given attachment's poster happens to be stored in.
	 */
	public function test_get_thumbnail_candidates_excludes_video_with_thumbnail_id_set(): void {
		$id        = $this->create_video();
		$poster_id = self::factory()->attachment->create_object( array( 'file' => 'poster.jpg', 'post_mime_type' => 'image/jpeg' ) );
		set_post_thumbnail( $id, $poster_id );

		$candidates = $this->processor()->get_thumbnail_candidates();

		$this->assertNotContains( $id, array_column( $candidates, 'id' ) );
	}

	/**
	 * The legacy _kgflashmediaplayer-poster key alone (with no
	 * _thumbnail_id) doesn't prove a real attachment thumbnail exists --
	 * e.g. it can hold an external URL. Un-migrated legacy data like this
	 * correctly stays a candidate rather than being trusted at face value.
	 */
	public function test_get_thumbnail_candidates_ignores_legacy_poster_key_alone(): void {
		$id = $this->create_video();
		update_post_meta( $id, '_kgflashmediaplayer-poster', 'https://example.com/poster.jpg' );

		$candidates = $this->processor()->get_thumbnail_candidates();

		$this->assertContains( $id, array_column( $candidates, 'id' ) );
	}

	/**
	 * Mirrors the real modern poster-assignment path (FFmpeg_Thumbnails::
	 * assign_thumbnail_to_video()), which always pairs the two -- this is
	 * what used to be missed before the _thumbnail_id-based fix.
	 */
	public function test_get_thumbnail_candidates_excludes_video_with_modern_poster(): void {
		$id         = $this->create_video();
		$poster_id  = self::factory()->attachment->create_object( array( 'file' => 'poster.jpg', 'post_mime_type' => 'image/jpeg' ) );
		( new \Videopack\Admin\Attachment_Meta( array(), $id ) )->set_poster( wp_get_attachment_url( $poster_id ), $poster_id );
		set_post_thumbnail( $id, $poster_id );

		$candidates = $this->processor()->get_thumbnail_candidates();

		$this->assertNotContains( $id, array_column( $candidates, 'id' ) );
	}

	public function test_get_thumbnail_candidates_excludes_child_format_attachment(): void {
		$id = $this->create_video();
		update_post_meta( $id, '_kgflashmediaplayer-format', 'h264_720p' );
		$candidates = $this->processor()->get_thumbnail_candidates();
		$this->assertNotContains( $id, array_column( $candidates, 'id' ) );
	}

	public function test_process_batch_thumbs_schedules_nothing_without_ffmpeg(): void {
		$this->create_video();
		$result = $this->processor( array( 'ffmpeg_exists' => 'unavailable' ) )->process_batch_thumbs();
		$this->assertSame( 0, $result['total'] );
	}

	public function test_process_batch_encoding_finds_video_without_format_meta(): void {
		$id = $this->create_video();
		$result = $this->processor()->process_batch_encoding();
		$this->assertGreaterThanOrEqual( 1, $result['total'] );
		$this->assertNotFalse( as_has_scheduled_action( 'videopack_batch_enqueue_video', array( $id ), 'videopack-batch-enqueue' ) );
	}

	public function test_process_batch_encoding_excludes_child_format_attachment(): void {
		$id = $this->create_video();
		update_post_meta( $id, '_kgflashmediaplayer-format', 'h264_720p' );
		$this->processor()->process_batch_encoding();
		$this->assertFalse( (bool) as_has_scheduled_action( 'videopack_batch_enqueue_video', array( $id ), 'videopack-batch-enqueue' ) );
	}
}
