<?php
/**
 * Tests for FFmpeg_Thumbnails::assign_thumbnail_to_video() -- the piece
 * that runs after a thumbnail image already exists, wiring it up as the
 * video's (and possibly parent's) featured image. Covers two real bugs
 * found by inspection, not previously caught by any test:
 *
 * 1. It wrote the video back-reference to '_videopack-video-id', a key no
 *    other code in the plugin reads -- every actual reader (Attachment_
 *    Media_Library's reparenting/batch-parent-switching, Screens.php's
 *    "hide thumbnails" filter) expects '_kgflashmediaplayer-video-id'.
 *    Auto-generated thumbnails were effectively invisible to all of that.
 * 2. When a video has no parent post yet (e.g. still an unsaved draft in
 *    the block editor at upload time), the legacy plugin scheduled a
 *    WP-Cron retry (Attachment_Media_Library::cron_check_post_parent_handler())
 *    to backfill the parent's featured image once a parent relationship
 *    showed up. That scheduling call was dropped in the 5.0 rewrite,
 *    leaving the (correct, tested) handler permanently unreachable.
 */

use Videopack\Admin\Attachment_Media_Library;
use Videopack\Admin\FFmpeg_Thumbnails;
use Videopack\Admin\Formats\Registry;

class FFmpegThumbnailsAssignmentTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function thumbnails( array $options = array() ): FFmpeg_Thumbnails {
		$options = $this->options( $options );
		return new FFmpeg_Thumbnails( $options, new Registry( $options ) );
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

	protected function create_image( array $extra = array() ): int {
		return self::factory()->attachment->create_object(
			array_merge(
				array(
					'file'           => 'poster.jpg',
					'post_mime_type' => 'image/jpeg',
					'post_status'    => 'inherit',
				),
				$extra
			)
		);
	}

	public function tear_down() {
		_set_cron_array( array() );
		parent::tear_down();
	}

	// -----------------------------------------------------------------
	// Video back-reference key.
	// -----------------------------------------------------------------

	public function test_assign_thumbnail_records_video_id_under_the_key_readers_expect(): void {
		$video_id = $this->create_video();
		$thumb_id = $this->create_image();

		$this->thumbnails()->assign_thumbnail_to_video( $video_id, $thumb_id );

		$this->assertSame( $video_id, (int) get_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', true ) );
		$this->assertSame( '', get_post_meta( $thumb_id, '_videopack-video-id', true ) );
	}

	public function test_assign_thumbnail_video_id_is_findable_by_attachment_media_library(): void {
		$video_id = $this->create_video();
		$thumb_id = $this->create_image( array( 'post_parent' => 0 ) );

		$this->thumbnails()->assign_thumbnail_to_video( $video_id, $thumb_id );

		// This is the real consumer of the back-reference this method
		// writes -- if the key doesn't match, this silently finds nothing.
		$new_parent = self::factory()->post->create();
		( new Attachment_Media_Library( $this->options() ) )->change_thumbnail_parent( $video_id, $new_parent );

		$this->assertSame( $new_parent, get_post( $thumb_id )->post_parent );
	}

	// -----------------------------------------------------------------
	// "No parent yet" cron retry.
	// -----------------------------------------------------------------

	public function test_assign_thumbnail_schedules_retry_when_video_has_no_parent(): void {
		$video_id = $this->create_video(); // No post_parent.
		$thumb_id = $this->create_image();

		$this->thumbnails( array( 'featured' => true ) )->assign_thumbnail_to_video( $video_id, $thumb_id );

		$this->assertNotFalse( wp_next_scheduled( 'videopack_cron_check_post_parent', array( $video_id ) ) );
	}

	public function test_assign_thumbnail_does_not_schedule_retry_when_video_already_has_a_parent(): void {
		$parent_id = self::factory()->post->create();
		$video_id  = $this->create_video( array( 'post_parent' => $parent_id ) );
		$thumb_id  = $this->create_image();

		$this->thumbnails( array( 'featured' => true ) )->assign_thumbnail_to_video( $video_id, $thumb_id );

		$this->assertFalse( wp_next_scheduled( 'videopack_cron_check_post_parent', array( $video_id ) ) );
		$this->assertSame( $thumb_id, get_post_thumbnail_id( $parent_id ) );
	}

	public function test_assign_thumbnail_does_not_schedule_retry_when_not_featured(): void {
		$video_id = $this->create_video();
		$thumb_id = $this->create_image();

		$this->thumbnails( array( 'featured' => false ) )->assign_thumbnail_to_video( $video_id, $thumb_id );

		$this->assertFalse( wp_next_scheduled( 'videopack_cron_check_post_parent', array( $video_id ) ) );
	}

	/**
	 * End-to-end: the scheduled retry actually resolves once a parent
	 * relationship shows up, via the real handler it targets.
	 */
	public function test_scheduled_retry_backfills_parent_thumbnail_once_resolved(): void {
		$video_id = $this->create_video();
		$thumb_id = $this->create_image();

		$this->thumbnails( array( 'featured' => true ) )->assign_thumbnail_to_video( $video_id, $thumb_id );
		$this->assertNotFalse( wp_next_scheduled( 'videopack_cron_check_post_parent', array( $video_id ) ) );

		// The post gets saved/published with this video attached, some time later.
		$parent_id = self::factory()->post->create();
		wp_update_post( array( 'ID' => $video_id, 'post_parent' => $parent_id ) );

		// Simulate the scheduled cron event firing.
		( new Attachment_Media_Library( $this->options() ) )->cron_check_post_parent_handler( $video_id );

		$this->assertSame( $thumb_id, get_post_thumbnail_id( $parent_id ) );
	}
}
