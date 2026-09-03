<?php
/**
 * Tests for Video_Discovery::get_first_video_child() -- finding a post's
 * first *original* video attachment child, deliberately excluding encoded
 * output children (which carry '_kgflashmediaplayer-format' meta), plus
 * its request-level caching. Previously completely untested.
 */

use Videopack\Common\Video_Discovery;

class VideoDiscoveryTest extends WP_UnitTestCase {

	public function tear_down() {
		Video_Discovery::clear_cache();
		parent::tear_down();
	}

	public function test_zero_post_id_returns_null_without_querying(): void {
		$this->assertNull( Video_Discovery::get_first_video_child( 0 ) );
	}

	public function test_post_with_no_children_returns_null(): void {
		$post_id = self::factory()->post->create();

		$this->assertNull( Video_Discovery::get_first_video_child( $post_id ) );
	}

	public function test_finds_a_video_attachment_child(): void {
		$post_id  = self::factory()->post->create();
		$video_id = self::factory()->attachment->create_object(
			array(
				'post_parent'    => $post_id,
				'post_mime_type' => 'video/mp4',
				'file'           => 'video.mp4',
			)
		);

		$this->assertSame( $video_id, Video_Discovery::get_first_video_child( $post_id ) );
	}

	public function test_ignores_non_video_attachment_children(): void {
		$post_id = self::factory()->post->create();
		self::factory()->attachment->create_object(
			array(
				'post_parent'    => $post_id,
				'post_mime_type' => 'image/jpeg',
				'file'           => 'photo.jpg',
			)
		);

		$this->assertNull( Video_Discovery::get_first_video_child( $post_id ) );
	}

	/**
	 * An encoded output child (e.g. the h264_480 version of an original
	 * upload) carries '_kgflashmediaplayer-format' meta identifying which
	 * format it is -- this must be excluded so callers get the original
	 * video, not one of its own encoded outputs.
	 */
	public function test_excludes_encoded_format_children(): void {
		$post_id = self::factory()->post->create();
		$encoded_id = self::factory()->attachment->create_object(
			array(
				'post_parent'    => $post_id,
				'post_mime_type' => 'video/mp4',
				'file'           => 'video-h264_480.mp4',
			)
		);
		update_post_meta( $encoded_id, '_kgflashmediaplayer-format', 'h264_480' );

		$this->assertNull( Video_Discovery::get_first_video_child( $post_id ) );
	}

	public function test_finds_the_original_even_when_encoded_siblings_exist(): void {
		$post_id    = self::factory()->post->create();
		$original_id = self::factory()->attachment->create_object(
			array(
				'post_parent'    => $post_id,
				'post_mime_type' => 'video/mp4',
				'file'           => 'video.mp4',
				'menu_order'     => 0,
			)
		);
		$encoded_id = self::factory()->attachment->create_object(
			array(
				'post_parent'    => $post_id,
				'post_mime_type' => 'video/mp4',
				'file'           => 'video-h264_480.mp4',
				'menu_order'     => 1,
			)
		);
		update_post_meta( $encoded_id, '_kgflashmediaplayer-format', 'h264_480' );

		$this->assertSame( $original_id, Video_Discovery::get_first_video_child( $post_id ) );
	}

	public function test_returns_the_lowest_menu_order_when_multiple_originals_exist(): void {
		$post_id = self::factory()->post->create();
		self::factory()->attachment->create_object(
			array( 'post_parent' => $post_id, 'post_mime_type' => 'video/mp4', 'file' => 'second.mp4', 'menu_order' => 5 )
		);
		$first_id = self::factory()->attachment->create_object(
			array( 'post_parent' => $post_id, 'post_mime_type' => 'video/mp4', 'file' => 'first.mp4', 'menu_order' => 1 )
		);

		$this->assertSame( $first_id, Video_Discovery::get_first_video_child( $post_id ) );
	}

	public function test_only_matches_children_of_the_given_post(): void {
		$post_id       = self::factory()->post->create();
		$other_post_id = self::factory()->post->create();
		self::factory()->attachment->create_object(
			array( 'post_parent' => $other_post_id, 'post_mime_type' => 'video/mp4', 'file' => 'video.mp4' )
		);

		$this->assertNull( Video_Discovery::get_first_video_child( $post_id ) );
	}

	// -----------------------------------------------------------------
	// Request-level caching.
	// -----------------------------------------------------------------

	public function test_result_is_cached_across_repeated_calls(): void {
		$post_id = self::factory()->post->create();

		// First call caches "null" (no children yet).
		$this->assertNull( Video_Discovery::get_first_video_child( $post_id ) );

		// A new matching child now exists, but the cached "null" should
		// still be returned without clearing the cache first.
		self::factory()->attachment->create_object(
			array( 'post_parent' => $post_id, 'post_mime_type' => 'video/mp4', 'file' => 'video.mp4' )
		);

		$this->assertNull( Video_Discovery::get_first_video_child( $post_id ), 'a cached null result must not be silently refreshed' );
	}

	public function test_clear_cache_allows_a_fresh_lookup(): void {
		$post_id = self::factory()->post->create();
		$this->assertNull( Video_Discovery::get_first_video_child( $post_id ) );

		$video_id = self::factory()->attachment->create_object(
			array( 'post_parent' => $post_id, 'post_mime_type' => 'video/mp4', 'file' => 'video.mp4' )
		);
		Video_Discovery::clear_cache();

		$this->assertSame( $video_id, Video_Discovery::get_first_video_child( $post_id ) );
	}

	public function test_cache_is_scoped_per_post_id(): void {
		$post_id_a = self::factory()->post->create();
		$post_id_b = self::factory()->post->create();
		$video_b   = self::factory()->attachment->create_object(
			array( 'post_parent' => $post_id_b, 'post_mime_type' => 'video/mp4', 'file' => 'video.mp4' )
		);

		$this->assertNull( Video_Discovery::get_first_video_child( $post_id_a ) );
		$this->assertSame( $video_b, Video_Discovery::get_first_video_child( $post_id_b ) );
	}
}
