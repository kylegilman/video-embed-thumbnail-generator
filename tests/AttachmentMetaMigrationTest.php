<?php
/**
 * Tests for Attachment_Meta migration and view count preservation when upgrading from 4.10.6 to 5.0.
 */

use Videopack\Admin\Attachment_Meta;

class AttachmentMetaMigrationTest extends WP_UnitTestCase {

	protected static $attachment_id;

	public static function wpSetUpBeforeClass( $factory ) {
		$file                = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4';
		self::$attachment_id = $factory->attachment->create_upload_object( $file );
	}

	public function set_up() {
		parent::set_up();
		delete_post_meta( self::$attachment_id, '_kgvid-meta' );
		delete_post_meta( self::$attachment_id, '_videopack-meta' );
		delete_post_meta( self::$attachment_id, '_kgflashmediaplayer-poster' );
		delete_post_meta( self::$attachment_id, '_kgflashmediaplayer-poster-id' );
	}

	/**
	 * Test that legacy _kgvid-meta view counts are migrated to _videopack-meta on get().
	 */
	public function test_legacy_kgvid_meta_views_migration_on_get(): void {
		$legacy_meta = array(
			'embed'         => 'Single Video',
			'starts'        => '42',
			'play_25'       => '25',
			'play_50'       => '15',
			'play_75'       => '10',
			'completeviews' => '8',
		);
		update_post_meta( self::$attachment_id, '_kgvid-meta', $legacy_meta );

		$meta_handler = new Attachment_Meta( array(), self::$attachment_id );
		$meta         = $meta_handler->get();

		$this->assertSame( 42, (int) $meta['starts'] );
		$this->assertSame( 25, (int) $meta['play_25'] );
		$this->assertSame( 15, (int) $meta['play_50'] );
		$this->assertSame( 10, (int) $meta['play_75'] );
		$this->assertSame( 8, (int) $meta['completeviews'] );

		// Verify _kgvid-meta was deleted and _videopack-meta was persisted.
		$this->assertEmpty( get_post_meta( self::$attachment_id, '_kgvid-meta', true ) );
		$persisted_new_meta = get_post_meta( self::$attachment_id, '_videopack-meta', true );
		$this->assertIsArray( $persisted_new_meta );
		$this->assertSame( '42', (string) $persisted_new_meta['starts'] );
	}

	/**
	 * Test that REST API meta updates via merge_meta_value() preserve legacy _kgvid-meta views.
	 */
	public function test_merge_meta_value_preserves_legacy_views(): void {
		$legacy_meta = array(
			'starts'        => '100',
			'play_25'       => '80',
			'completeviews' => '50',
		);
		update_post_meta( self::$attachment_id, '_kgvid-meta', $legacy_meta );

		$meta_handler = new Attachment_Meta( array(), self::$attachment_id );
		$post_obj     = get_post( self::$attachment_id );

		// Simulate a REST API update (e.g. updating 'muted' setting before get() was ever called)
		$incoming_rest_value = array( 'muted' => true );
		$success             = $meta_handler->merge_meta_value( $incoming_rest_value, $post_obj, '_videopack-meta', null );

		$this->assertTrue( $success );

		// Verify that legacy view statistics were migrated and not lost when merging
		$meta = $meta_handler->get();
		$this->assertSame( 100, (int) $meta['starts'] );
		$this->assertSame( 80, (int) $meta['play_25'] );
		$this->assertSame( 50, (int) $meta['completeviews'] );
		$this->assertTrue( $meta['muted'] );
	}

	/**
	 * Test increment_video_stat() for both player events and direct schema field names.
	 */
	public function test_increment_video_stat_standardized(): void {
		$legacy_meta = array(
			'starts'        => 5,
			'play_25'       => 3,
			'completeviews' => 1,
		);
		update_post_meta( self::$attachment_id, '_kgvid-meta', $legacy_meta );

		$meta_handler = new Attachment_Meta( array(), self::$attachment_id );

		// Increment using player event alias 'play'
		$updated = $meta_handler->increment_video_stat( 'play' );
		$this->assertSame( 6, (int) $updated['starts'] );

		// Increment using direct meta field name 'starts'
		$updated = $meta_handler->increment_video_stat( 'starts' );
		$this->assertSame( 7, (int) $updated['starts'] );

		// Increment using player event alias 'end'
		$updated = $meta_handler->increment_video_stat( 'end' );
		$this->assertSame( 2, (int) $updated['completeviews'] );

		// Increment using direct meta field name 'completeviews'
		$updated = $meta_handler->increment_video_stat( 'completeviews' );
		$this->assertSame( 3, (int) $updated['completeviews'] );
	}

	/**
	 * Test that legacy _kgflashmediaplayer-poster* postmeta keys are migrated to _videopack-meta and deleted.
	 */
	public function test_legacy_poster_keys_migration_and_filter_interception(): void {
		// A real attachment ID, not an arbitrary number -- get()'s stale
		// poster_id self-heal (see test_stale_poster_id_is_cleared_lazily)
		// would otherwise clear a poster_id that was never a real attachment.
		$poster_id = self::factory()->attachment->create_object( array( 'file' => 'poster.jpg', 'post_mime_type' => 'image/jpeg' ) );

		update_post_meta( self::$attachment_id, '_kgflashmediaplayer-poster', 'https://example.com/poster.jpg' );
		update_post_meta( self::$attachment_id, '_kgflashmediaplayer-poster-id', $poster_id );

		$meta_handler = new Attachment_Meta( array(), self::$attachment_id );
		$meta         = $meta_handler->get();

		$this->assertSame( 'https://example.com/poster.jpg', $meta['poster'] );
		$this->assertSame( $poster_id, $meta['poster_id'] );

		// Physical DB keys should be deleted
		$raw_poster_url = get_post_meta( self::$attachment_id, '_kgflashmediaplayer-poster', true );

		// Hook up the filter subscriber
		add_filter( 'get_post_metadata', array( $meta_handler, 'filter_legacy_post_metadata' ), 10, 4 );

		// Querying legacy key via get_post_meta should return value via filter hook
		$filtered_poster_url = get_post_meta( self::$attachment_id, '_kgflashmediaplayer-poster', true );
		$filtered_poster_id  = get_post_meta( self::$attachment_id, '_kgflashmediaplayer-poster-id', true );

		$this->assertSame( 'https://example.com/poster.jpg', $filtered_poster_url );
		$this->assertSame( $poster_id, (int) $filtered_poster_id );
	}

	/**
	 * A poster_id referencing a deleted attachment must be cleared lazily
	 * on the next read -- Attachment_Deleter's own delete-time cleanup
	 * can't reach it, since by the time a poster is actually deleted, its
	 * reference already lives in _videopack-meta rather than the legacy
	 * _kgflashmediaplayer-poster-id key that cleanup searches for (see
	 * AttachmentDeleterTest's docblock for why).
	 */
	public function test_stale_poster_id_is_cleared_lazily(): void {
		$deleted_poster_id = self::$attachment_id + 999999; // Guaranteed not to exist.

		$meta_handler = new Attachment_Meta( array(), self::$attachment_id );
		$meta_handler->set_poster( 'https://example.com/poster.jpg', $deleted_poster_id );

		// A fresh instance forces a real re-read from postmeta rather than
		// the process-lifetime cache set_poster() just populated. The
		// cleared values equal the schema defaults, so save() correctly
		// omits them from the persisted array entirely rather than writing
		// out explicit nulls -- these getter calls are what prove the
		// self-heal took effect, not the raw persisted shape.
		$fresh_handler = new Attachment_Meta( array(), self::$attachment_id );
		$this->assertSame( 0, $fresh_handler->get_poster_id() );
		// 'poster' is cleared alongside poster_id -- every real write path
		// sets it to that same attachment's own URL, so a stale poster_id
		// means the URL is just as stale; get_poster_url() would otherwise
		// keep serving a broken link to the deleted attachment.
		$this->assertSame( '', $fresh_handler->get_poster_url() );
	}

	/**
	 * A poster_id referencing a real, still-existing attachment must
	 * survive the same self-healing check unchanged.
	 */
	public function test_valid_poster_id_is_not_cleared(): void {
		$real_poster_id = self::factory()->attachment->create_object( array( 'file' => 'poster.jpg', 'post_mime_type' => 'image/jpeg' ) );

		$meta_handler = new Attachment_Meta( array(), self::$attachment_id );
		$meta_handler->set_poster( 'https://example.com/poster.jpg', $real_poster_id );

		$fresh_handler = new Attachment_Meta( array(), self::$attachment_id );
		$this->assertSame( $real_poster_id, $fresh_handler->get_poster_id() );
	}

	/**
	 * Test get_poster_url(), get_poster_id(), and set_poster() helper methods on Attachment_Meta.
	 */
	public function test_poster_helper_methods(): void {
		// A real attachment ID, not an arbitrary number -- see
		// test_stale_poster_id_is_cleared_lazily().
		$poster_id = self::factory()->attachment->create_object( array( 'file' => 'poster.jpg', 'post_mime_type' => 'image/jpeg' ) );

		$meta_handler = new Attachment_Meta( array(), self::$attachment_id );

		// Set poster image. get_poster_url() prioritizes the real
		// attachment's own URL over the stored 'poster' string once
		// poster_id resolves to a real attachment.
		$meta_handler->set_poster( 'https://example.com/new-poster.jpg', $poster_id );
		$this->assertSame( (string) wp_get_attachment_url( $poster_id ), $meta_handler->get_poster_url() );
		$this->assertSame( $poster_id, $meta_handler->get_poster_id() );

		// Clear poster image
		$meta_handler->set_poster( null, null );
		$this->assertSame( '', $meta_handler->get_poster_url() );
		$this->assertSame( 0, $meta_handler->get_poster_id() );
	}
}
