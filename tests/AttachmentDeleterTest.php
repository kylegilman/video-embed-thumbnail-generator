<?php
/**
 * Tests for Attachment_Deleter::delete_handler() -- cleanup and child
 * reassignment when a video attachment is deleted. Previously completely
 * untested despite real branching logic: which children get deleted
 * outright vs. reassigned to a new master depends on plugin options, and
 * picking the "new master" among surviving children specifically picks
 * the highest-quality remaining encoded format (by registry order), not
 * just any child -- easy to silently break.
 */

use Videopack\Admin\Attachment_Deleter;
use Videopack\Admin\Formats\Registry;

class AttachmentDeleterTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function registry( array $options ): Registry {
		return new Registry( $options );
	}

	protected function deleter( array $options ): Attachment_Deleter {
		return new Attachment_Deleter( $options, $this->registry( $options ) );
	}

	/**
	 * self::factory()->attachment->create_object() defaults to a raw
	 * post_status of 'publish' -- unlike every real attachment, which
	 * WordPress always stores with a raw status of 'inherit' (regardless
	 * of what get_post_status() later resolves that to for an unattached
	 * post). Attachment_Deleter's own lookup query relies on WP_Query's
	 * implicit post_status='inherit' default for post_type=attachment
	 * queries, so a 'publish'-status test fixture silently never matches
	 * it -- explicitly pin 'inherit' here so these tests reflect a real
	 * attachment instead of a factory artifact.
	 */
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

	// -----------------------------------------------------------------
	// Master video deletion -- reassignment (delete_child_encoded=false).
	// -----------------------------------------------------------------

	public function test_deleting_master_reassigns_to_highest_quality_child_when_encoded_children_kept(): void {
		$options       = $this->options( array( 'delete_child_encoded' => false ) );
		$format_ids    = array_keys( $this->registry( $options )->get_video_formats() );
		$this->assertGreaterThanOrEqual( 2, count( $format_ids ), 'Test needs at least two registered formats.' );
		$best_format   = (string) $format_ids[0];
		$second_format = (string) $format_ids[1];

		$master_title = 'Original Master Title';
		$master_id    = $this->create_video( array( 'post_title' => $master_title ) );

		$lower_child = $this->create_video( array( 'post_parent' => $master_id ) );
		update_post_meta( $lower_child, '_kgflashmediaplayer-format', $second_format );

		$best_child = $this->create_video( array( 'post_parent' => $master_id ) );
		update_post_meta( $best_child, '_kgflashmediaplayer-format', $best_format );

		$this->deleter( $options )->delete_handler( $master_id );

		// The highest-quality surviving child becomes the new master: its
		// format meta is stripped, its title is copied from the old
		// master, and its own post_parent moves up to the old master's
		// parent (0, here).
		$this->assertSame( '', get_post_meta( $best_child, '_kgflashmediaplayer-format', true ) );
		$this->assertSame( $master_title, get_post( $best_child )->post_title );
		$this->assertSame( 0, get_post( $best_child )->post_parent );

		// The other surviving child is reparented under the new master.
		$this->assertSame( $best_child, get_post( $lower_child )->post_parent );
	}

	public function test_reassignment_preserves_deleted_masters_own_parent(): void {
		$options     = $this->options( array( 'delete_child_encoded' => false ) );
		$format_ids  = array_keys( $this->registry( $options )->get_video_formats() );
		$best_format = (string) $format_ids[0];

		$grandparent_page = self::factory()->post->create( array( 'post_type' => 'page' ) );
		$master_id         = $this->create_video( array( 'post_parent' => $grandparent_page ) );

		$child = $this->create_video( array( 'post_parent' => $master_id ) );
		update_post_meta( $child, '_kgflashmediaplayer-format', $best_format );

		$this->deleter( $options )->delete_handler( $master_id );

		// The new master takes over the *deleted master's* parent, not 0.
		$this->assertSame( $grandparent_page, get_post( $child )->post_parent );
	}

	// -----------------------------------------------------------------
	// Master video deletion -- outright deletion (the actual defaults).
	// -----------------------------------------------------------------

	public function test_default_options_delete_encoded_children_outright(): void {
		// delete_child_encoded defaults to true.
		$options   = $this->options();
		$master_id = $this->create_video();
		$child_id  = $this->create_video( array( 'post_parent' => $master_id ) );
		update_post_meta( $child_id, '_kgflashmediaplayer-format', 'h264_720p' );

		$this->deleter( $options )->delete_handler( $master_id );

		$this->assertNull( get_post( $child_id ) );
	}

	public function test_default_options_keep_thumbnail_children(): void {
		// delete_child_thumbnails defaults to false.
		$options   = $this->options();
		$master_id = $this->create_video();
		$thumb_id  = $this->create_image( array( 'post_parent' => $master_id ) );

		$this->deleter( $options )->delete_handler( $master_id );

		$this->assertInstanceOf( WP_Post::class, get_post( $thumb_id ) );
		// Reparented to the deleted master's own parent (0) rather than left
		// dangling on a post_parent that no longer exists.
		$this->assertSame( 0, get_post( $thumb_id )->post_parent );
	}

	public function test_delete_child_thumbnails_option_deletes_image_children(): void {
		$options   = $this->options( array( 'delete_child_thumbnails' => true ) );
		$master_id = $this->create_video();
		$thumb_id  = $this->create_image( array( 'post_parent' => $master_id ) );

		$this->deleter( $options )->delete_handler( $master_id );

		$this->assertNull( get_post( $thumb_id ) );
	}

	// -----------------------------------------------------------------
	// Poster/thumbnail image deletion -- clears references on other posts.
	// -----------------------------------------------------------------

	/**
	 * Attachment_Deleter's own cleanup here only ever catches genuinely
	 * pre-migration legacy data (e.g. an old install that hasn't opened
	 * this particular post since upgrading) -- Attachment_Meta's own
	 * get_post_metadata filter lazily migrates _kgflashmediaplayer-poster*
	 * into _videopack-meta (deleting the legacy row) the instant anything
	 * reads it via the normal get_post_meta() API, which in practice
	 * happens long before a poster would ever be deleted. A plain
	 * update_post_meta() call here would trigger that same migration as a
	 * side effect of its own internal existing-value lookup, so this uses
	 * a raw insert to simulate genuinely untouched legacy data instead.
	 * The general, always-reachable case (a poster deleted after its
	 * poster_id has already migrated into _videopack-meta) is covered by
	 * AttachmentMetaMigrationTest::test_stale_poster_id_is_cleared_lazily().
	 */
	public function test_deleting_poster_image_clears_legacy_meta_on_referencing_post(): void {
		global $wpdb;

		$options   = $this->options();
		$poster_id = $this->create_image();
		$video_id  = $this->create_video();

		$wpdb->insert( $wpdb->postmeta, array( 'post_id' => $video_id, 'meta_key' => '_kgflashmediaplayer-poster-id', 'meta_value' => (string) $poster_id ) );
		$wpdb->insert( $wpdb->postmeta, array( 'post_id' => $video_id, 'meta_key' => '_kgflashmediaplayer-poster', 'meta_value' => 'https://example.com/poster.jpg' ) );
		update_post_meta( $video_id, '_thumbnail-id', (string) $poster_id );

		$this->deleter( $options )->delete_handler( $poster_id );

		$this->assertSame( '', (string) $wpdb->get_var( $wpdb->prepare( "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = '_kgflashmediaplayer-poster-id'", $video_id ) ) );
		$this->assertSame( '', (string) $wpdb->get_var( $wpdb->prepare( "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = '_kgflashmediaplayer-poster'", $video_id ) ) );
		$this->assertSame( '', get_post_meta( $video_id, '_thumbnail-id', true ) );
	}

	public function test_deleting_unrelated_image_does_not_throw(): void {
		$options = $this->options();
		$image_id = $this->create_image();

		$this->deleter( $options )->delete_handler( $image_id );

		$this->assertTrue( true ); // Reaching here without a fatal is the assertion.
	}

	// -----------------------------------------------------------------
	// Child format deletion -- must not disturb the parent/other children.
	// -----------------------------------------------------------------

	public function test_deleting_a_child_format_does_not_disturb_siblings_or_parent(): void {
		$options   = $this->options( array( 'delete_child_encoded' => false ) );
		$master_id = $this->create_video();
		$child_id  = $this->create_video( array( 'post_parent' => $master_id ) );
		update_post_meta( $child_id, '_kgflashmediaplayer-format', 'h264_720p' );

		$this->deleter( $options )->delete_handler( $child_id );

		// The master is untouched -- deleting a child format is not
		// "master deletion", so none of the reassignment logic should run.
		$this->assertInstanceOf( WP_Post::class, get_post( $master_id ) );
		$this->assertSame( '', get_post_meta( $master_id, '_kgflashmediaplayer-format', true ) );
	}

	// -----------------------------------------------------------------
	// Transient cleanup -- always runs regardless of the branch taken.
	// -----------------------------------------------------------------

	public function test_deleting_any_video_clears_its_url_transients(): void {
		$options   = $this->options();
		$video_id  = $this->create_video();
		$url       = wp_get_attachment_url( $video_id );

		set_transient( 'kgvid_' . $url, 'cached-value', DAY_IN_SECONDS );
		set_transient( 'videopack_url_cache_' . md5( $url ), 'cached-value', DAY_IN_SECONDS );

		$this->deleter( $options )->delete_handler( $video_id );

		$this->assertFalse( get_transient( 'kgvid_' . $url ) );
		$this->assertFalse( get_transient( 'videopack_url_cache_' . md5( $url ) ) );
	}
}
