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
}
