<?php
/**
 * Tests for Attachment_Media_Library -- featured-image syncing and
 * thumbnail-parent switching. Previously completely untested despite real
 * branching logic: which post gets whose featured image, and which post a
 * generated thumbnail attaches to, both depend on plugin options and prior
 * state in ways easy to silently break. This class's own `?? 'video'`
 * fallbacks (only used if the options array is missing the key entirely --
 * rare, since defaults are always merged in) match Options.php's real
 * 'thumb_parent' default of 'video'. Every test here still sets
 * thumb_parent explicitly rather than relying on the fallback, to keep
 * each test's intent unambiguous.
 */

use Videopack\Admin\Attachment_Media_Library;
use Videopack\Admin\Attachment_Meta;

class AttachmentMediaLibraryTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function library( array $options = array() ): Attachment_Media_Library {
		return new Attachment_Media_Library( $this->options( $options ) );
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

	protected function set_poster( int $video_id, int $poster_id, bool $featured_changed = false ): void {
		$meta = ( new Attachment_Meta( array(), $video_id ) )->get();
		$meta['poster_id']       = $poster_id;
		$meta['poster']          = wp_get_attachment_url( $poster_id );
		$meta['featuredchanged'] = $featured_changed;
		( new Attachment_Meta( array(), $video_id ) )->save( $meta );
	}

	// -----------------------------------------------------------------
	// validate_attachment_updated()
	// -----------------------------------------------------------------

	public function test_validate_attachment_updated_ignores_non_video_attachment(): void {
		$id = $this->create_image();
		$this->library()->validate_attachment_updated( $id );
		$this->assertFalse( (bool) get_post_thumbnail_id( $id ) );
	}

	public function test_validate_attachment_updated_does_nothing_without_a_poster(): void {
		$id = $this->create_video();
		$this->library()->validate_attachment_updated( $id );
		$this->assertFalse( (bool) get_post_thumbnail_id( $id ) );
	}

	public function test_validate_attachment_updated_sets_the_videos_own_thumbnail(): void {
		$id        = $this->create_video();
		$poster_id = $this->create_image();
		$this->set_poster( $id, $poster_id );

		$this->library()->validate_attachment_updated( $id );

		$this->assertSame( $poster_id, get_post_thumbnail_id( $id ) );
	}

	public function test_validate_attachment_updated_sets_parent_thumbnail_when_featured_changed(): void {
		$parent_id = self::factory()->post->create();
		$poster_id = $this->create_image();
		$id        = $this->create_video( array( 'post_parent' => $parent_id ) );
		$this->set_poster( $id, $poster_id, true );

		$this->library( array( 'thumb_parent' => 'post' ) )->validate_attachment_updated( $id );

		$this->assertSame( $poster_id, get_post_thumbnail_id( $parent_id ) );
	}

	public function test_validate_attachment_updated_does_not_touch_parent_thumbnail_when_featured_not_changed(): void {
		$parent_id = self::factory()->post->create();
		$poster_id = $this->create_image();
		$id        = $this->create_video( array( 'post_parent' => $parent_id ) );
		$this->set_poster( $id, $poster_id, false );

		$this->library( array( 'thumb_parent' => 'post' ) )->validate_attachment_updated( $id );

		$this->assertFalse( (bool) get_post_thumbnail_id( $parent_id ) );
	}

	public function test_validate_attachment_updated_reparents_thumbnails_when_thumb_parent_is_post(): void {
		$parent_id = self::factory()->post->create();
		$id        = $this->create_video( array( 'post_parent' => $parent_id ) );
		$thumb_id  = $this->create_image( array( 'post_parent' => 0 ) );
		update_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', $id );

		$this->library( array( 'thumb_parent' => 'post' ) )->validate_attachment_updated( $id );

		$this->assertSame( $parent_id, get_post( $thumb_id )->post_parent );
	}

	public function test_validate_attachment_updated_does_not_reparent_when_thumb_parent_is_video(): void {
		$parent_id = self::factory()->post->create();
		$id        = $this->create_video( array( 'post_parent' => $parent_id ) );
		$thumb_id  = $this->create_image( array( 'post_parent' => 0 ) );
		update_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', $id );

		$this->library( array( 'thumb_parent' => 'video' ) )->validate_attachment_updated( $id );

		$this->assertSame( 0, get_post( $thumb_id )->post_parent );
	}

	// -----------------------------------------------------------------
	// change_thumbnail_parent()
	// -----------------------------------------------------------------

	public function test_change_thumbnail_parent_reparents_linked_thumbnails(): void {
		$id       = $this->create_video();
		$thumb_id = $this->create_image( array( 'post_parent' => 0 ) );
		update_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', $id );

		$new_parent = self::factory()->post->create();
		$this->library()->change_thumbnail_parent( $id, $new_parent );

		$this->assertSame( $new_parent, get_post( $thumb_id )->post_parent );
	}

	public function test_change_thumbnail_parent_falls_back_to_video_id_when_parent_is_empty(): void {
		$id       = $this->create_video();
		$thumb_id = $this->create_image( array( 'post_parent' => 999999 ) );
		update_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', $id );

		$this->library()->change_thumbnail_parent( $id, 0 );

		$this->assertSame( $id, get_post( $thumb_id )->post_parent );
	}

	public function test_change_thumbnail_parent_ignores_unrelated_thumbnails(): void {
		$id             = $this->create_video();
		$unrelated_id   = $this->create_image( array( 'post_parent' => 0 ) );

		$this->library()->change_thumbnail_parent( $id, self::factory()->post->create() );

		$this->assertSame( 0, get_post( $unrelated_id )->post_parent );
	}

	// -----------------------------------------------------------------
	// cron_check_post_parent_handler()
	// -----------------------------------------------------------------

	public function test_cron_check_post_parent_sets_parent_thumbnail_when_missing(): void {
		$parent_id = self::factory()->post->create();
		$poster_id = $this->create_image();
		$id        = $this->create_video( array( 'post_parent' => $parent_id ) );
		set_post_thumbnail( $id, $poster_id );

		$this->library()->cron_check_post_parent_handler( $id );

		$this->assertSame( $poster_id, get_post_thumbnail_id( $parent_id ) );
	}

	public function test_cron_check_post_parent_does_not_overwrite_existing_parent_thumbnail(): void {
		$parent_id       = self::factory()->post->create();
		$existing_poster = $this->create_image();
		$new_poster      = $this->create_image();
		set_post_thumbnail( $parent_id, $existing_poster );
		$id = $this->create_video( array( 'post_parent' => $parent_id ) );
		set_post_thumbnail( $id, $new_poster );

		$this->library()->cron_check_post_parent_handler( $id );

		$this->assertSame( $existing_poster, get_post_thumbnail_id( $parent_id ) );
	}

	public function test_cron_check_post_parent_does_nothing_without_a_parent(): void {
		$poster_id = $this->create_image();
		$id        = $this->create_video();
		set_post_thumbnail( $id, $poster_id );

		// Should not throw for post_parent = 0.
		$this->library()->cron_check_post_parent_handler( $id );

		$this->assertTrue( true );
	}

	public function test_cron_check_post_parent_does_nothing_when_video_has_no_thumbnail(): void {
		$parent_id = self::factory()->post->create();
		$id        = $this->create_video( array( 'post_parent' => $parent_id ) );

		$this->library()->cron_check_post_parent_handler( $id );

		$this->assertFalse( (bool) get_post_thumbnail_id( $parent_id ) );
	}

	// -----------------------------------------------------------------
	// clear_browser_thumb_flag()
	// -----------------------------------------------------------------

	public function test_clear_browser_thumb_flag_clears_on_thumbnail_id_change(): void {
		$id = $this->create_video();
		update_post_meta( $id, '_videopack_needs_browser_thumb', '1' );

		$this->library()->clear_browser_thumb_flag( 0, $id, '_thumbnail_id', 123 );

		$this->assertSame( '', get_post_meta( $id, '_videopack_needs_browser_thumb', true ) );
	}

	public function test_clear_browser_thumb_flag_ignores_unrelated_meta_key(): void {
		$id = $this->create_video();
		update_post_meta( $id, '_videopack_needs_browser_thumb', '1' );

		$this->library()->clear_browser_thumb_flag( 0, $id, '_some_other_key', 123 );

		$this->assertSame( '1', get_post_meta( $id, '_videopack_needs_browser_thumb', true ) );
	}

	// -----------------------------------------------------------------
	// execute_featured_image_action() / execute_switch_parent_action()
	// -----------------------------------------------------------------

	public function test_execute_featured_image_action_sets_thumbnail(): void {
		$parent_id = self::factory()->post->create();
		$poster_id = $this->create_image();

		$this->library()->execute_featured_image_action( $parent_id, $poster_id );

		$this->assertSame( $poster_id, get_post_thumbnail_id( $parent_id ) );
	}

	public function test_execute_switch_parent_action_reparents_and_tracks_video_id_for_post_target(): void {
		$id         = $this->create_video();
		$thumb_id   = $this->create_image( array( 'post_parent' => 0 ) );
		$new_parent = self::factory()->post->create();

		$this->library()->execute_switch_parent_action( $thumb_id, 'post', $new_parent, $id );

		$this->assertSame( $new_parent, get_post( $thumb_id )->post_parent );
		$this->assertSame( $id, (int) get_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', true ) );
	}

	public function test_execute_switch_parent_action_does_not_track_video_id_for_attachment_target(): void {
		$id       = $this->create_video();
		$thumb_id = $this->create_image( array( 'post_parent' => 0 ) );

		$this->library()->execute_switch_parent_action( $thumb_id, 'attachment', $id, $id );

		$this->assertSame( $id, get_post( $thumb_id )->post_parent );
		$this->assertSame( '', get_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', true ) );
	}

	// -----------------------------------------------------------------
	// process_batch_featured()
	// -----------------------------------------------------------------

	public function test_process_batch_featured_schedules_for_video_with_poster_and_parent(): void {
		$parent_id = self::factory()->post->create();
		$poster_id = $this->create_image();
		$id        = $this->create_video( array( 'post_parent' => $parent_id ) );
		$this->set_poster( $id, $poster_id );

		$result = $this->library()->process_batch_featured();

		$this->assertGreaterThanOrEqual( 1, $result['total'] );
		$this->assertNotFalse( as_has_scheduled_action( 'videopack_set_featured_image', array( $parent_id, $poster_id ), 'videopack-featured-images' ) );
	}

	public function test_process_batch_featured_skips_video_without_parent(): void {
		$poster_id = $this->create_image();
		$id        = $this->create_video();
		$this->set_poster( $id, $poster_id );

		$this->library()->process_batch_featured();

		$this->assertFalse( (bool) as_has_scheduled_action( 'videopack_set_featured_image', array( 0, $poster_id ), 'videopack-featured-images' ) );
	}

	public function test_process_batch_featured_skips_video_without_poster(): void {
		$parent_id = self::factory()->post->create();
		$id        = $this->create_video( array( 'post_parent' => $parent_id ) );

		$result = $this->library()->process_batch_featured();

		$this->assertSame( 0, $result['total'] );
	}

	// -----------------------------------------------------------------
	// process_batch_parents()
	// -----------------------------------------------------------------

	public function test_process_batch_parents_targets_video_parent_for_post_mode(): void {
		$parent_id = self::factory()->post->create();
		$id        = $this->create_video( array( 'post_parent' => $parent_id ) );
		$thumb_id  = $this->create_image( array( 'post_parent' => 0 ) );
		update_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', $id );

		$this->library()->process_batch_parents( 'post' );

		$this->assertNotFalse( as_has_scheduled_action( 'videopack_switch_thumbnail_parent', array( $thumb_id, 'post', $parent_id, $id ), 'videopack-parent-switching' ) );
	}

	public function test_process_batch_parents_targets_video_itself_for_attachment_mode(): void {
		$parent_id = self::factory()->post->create();
		$id        = $this->create_video( array( 'post_parent' => $parent_id ) );
		$thumb_id  = $this->create_image( array( 'post_parent' => 0 ) );
		update_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', $id );

		$this->library()->process_batch_parents( 'attachment' );

		$this->assertNotFalse( as_has_scheduled_action( 'videopack_switch_thumbnail_parent', array( $thumb_id, 'attachment', $id, $id ), 'videopack-parent-switching' ) );
	}

	public function test_process_batch_parents_falls_back_to_video_id_when_video_has_no_parent(): void {
		$id       = $this->create_video();
		$thumb_id = $this->create_image( array( 'post_parent' => 0 ) );
		update_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', $id );

		$this->library()->process_batch_parents( 'post' );

		$this->assertNotFalse( as_has_scheduled_action( 'videopack_switch_thumbnail_parent', array( $thumb_id, 'post', $id, $id ), 'videopack-parent-switching' ) );
	}

	public function test_process_batch_parents_skips_thumbnail_with_no_matching_video(): void {
		$thumb_id = $this->create_image( array( 'post_parent' => 0 ) );
		update_post_meta( $thumb_id, '_kgflashmediaplayer-video-id', 999999 );

		$result = $this->library()->process_batch_parents( 'post' );

		$this->assertSame( 0, $result['total'] );
	}
}
