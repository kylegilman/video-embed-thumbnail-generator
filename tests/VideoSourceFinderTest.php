<?php
/**
 * Tests for Video_Source_Finder::find_attachment_children() and
 * find_format_in_posts() -- the matching logic that decides which
 * attachment is "the 720p version of this video", both for playback
 * (Source::get_child_sources()) and for encode dedup (Encode_Info uses
 * this same matching to decide whether a format already exists). A wrong
 * match here means either serving the wrong file or the encode queue
 * thinking a format exists when it doesn't (or vice versa).
 */

use Videopack\Admin\Formats\Registry;
use Videopack\Admin\Formats\Video_Format;
use Videopack\Video_Source\Source_Factory;
use Videopack\Video_Source\Video_Source_Finder;

class VideoSourceFinderTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function registry(): Registry {
		return new Registry( $this->options() );
	}

	protected function video_format( string $codec_id, string $res_id ): Video_Format {
		$registry = $this->registry();
		return new Video_Format( $registry->get_codec( $codec_id ), $registry->get_resolution( $res_id ) );
	}

	// -----------------------------------------------------------------
	// find_attachment_children() -- numeric source (an attachment ID).
	// -----------------------------------------------------------------

	public function test_finds_a_direct_child_via_post_parent(): void {
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$child_id  = self::factory()->attachment->create_object(
			array(
				'file'           => 'video-720p.mp4',
				'post_mime_type' => 'video/mp4',
				'post_parent'    => $parent_id,
			)
		);

		$source   = Source_Factory::create( $parent_id, $this->options(), $this->registry() );
		$children = Video_Source_Finder::find_attachment_children( $source );

		$this->assertCount( 1, $children );
		$this->assertSame( $child_id, $children[0]->ID );
	}

	public function test_finds_a_child_linked_only_via_legacy_meta_key(): void {
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		// Not a real post_parent relationship -- only the legacy meta link.
		$child_id  = self::factory()->attachment->create_object( array( 'file' => 'video-720p.mp4', 'post_mime_type' => 'video/mp4' ) );
		update_post_meta( $child_id, '_kgflashmediaplayer-parent', (string) $parent_id );

		$source   = Source_Factory::create( $parent_id, $this->options(), $this->registry() );
		$children = Video_Source_Finder::find_attachment_children( $source );

		$this->assertCount( 1, $children );
		$this->assertSame( $child_id, $children[0]->ID );
	}

	public function test_a_child_matched_by_both_post_parent_and_meta_is_returned_only_once(): void {
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$child_id  = self::factory()->attachment->create_object(
			array(
				'file'           => 'video-720p.mp4',
				'post_mime_type' => 'video/mp4',
				'post_parent'    => $parent_id,
			)
		);
		update_post_meta( $child_id, '_kgflashmediaplayer-parent', (string) $parent_id );

		$source   = Source_Factory::create( $parent_id, $this->options(), $this->registry() );
		$children = Video_Source_Finder::find_attachment_children( $source );

		$this->assertCount( 1, $children );
	}

	public function test_an_unrelated_attachment_is_not_matched(): void {
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		self::factory()->attachment->create_object( array( 'file' => 'unrelated.mp4', 'post_mime_type' => 'video/mp4' ) );

		$source   = Source_Factory::create( $parent_id, $this->options(), $this->registry() );
		$children = Video_Source_Finder::find_attachment_children( $source );

		$this->assertSame( array(), $children );
	}

	public function test_returns_empty_array_when_no_children_exist(): void {
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );

		$source   = Source_Factory::create( $parent_id, $this->options(), $this->registry() );
		$children = Video_Source_Finder::find_attachment_children( $source );

		$this->assertSame( array(), $children );
	}

	// -----------------------------------------------------------------
	// find_attachment_children() -- non-numeric source (a remote URL).
	// -----------------------------------------------------------------

	public function test_finds_attachments_linked_to_a_remote_url_via_externalurl_meta(): void {
		$url        = 'https://videos.example.test/original.mp4';
		$matched_id = self::factory()->attachment->create_object( array( 'file' => 'copy.mp4', 'post_mime_type' => 'video/mp4' ) );
		update_post_meta( $matched_id, '_kgflashmediaplayer-externalurl', $url );

		self::factory()->attachment->create_object( array( 'file' => 'other.mp4', 'post_mime_type' => 'video/mp4' ) ); // Unrelated.

		$source   = Source_Factory::create( $url, $this->options(), $this->registry() );
		$children = Video_Source_Finder::find_attachment_children( $source );

		$this->assertCount( 1, $children );
		$this->assertSame( $matched_id, $children[0]->ID );
	}

	public function test_url_lookup_matches_regardless_of_percent_encoding(): void {
		$raw_url     = 'https://videos.example.test/my video.mp4';
		$encoded_url = 'https://videos.example.test/my%20video.mp4';

		$matched_id = self::factory()->attachment->create_object( array( 'file' => 'copy.mp4', 'post_mime_type' => 'video/mp4' ) );
		update_post_meta( $matched_id, '_kgflashmediaplayer-externalurl', esc_url_raw( $raw_url ) );

		$source   = Source_Factory::create( $encoded_url, $this->options(), $this->registry() );
		$children = Video_Source_Finder::find_attachment_children( $source );

		$this->assertCount( 1, $children );
		$this->assertSame( $matched_id, $children[0]->ID );
	}

	// -----------------------------------------------------------------
	// find_format_in_posts()
	// -----------------------------------------------------------------

	public function test_find_format_in_posts_matches_on_current_format_id(): void {
		$format    = $this->video_format( 'h264', '720' );
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$child_id  = self::factory()->attachment->create_object( array( 'file' => 'video-720p.mp4', 'post_mime_type' => 'video/mp4' ) );
		update_post_meta( $child_id, '_kgflashmediaplayer-format', $format->get_id() );

		$posts  = array( get_post( $child_id ) );
		$source = Source_Factory::create( $parent_id, $this->options(), $this->registry() );

		$found = Video_Source_Finder::find_format_in_posts( $posts, $format, $source );

		$this->assertTrue( $found );
		$child_sources = $source->get_child_sources();
		$this->assertArrayHasKey( $format->get_id(), $child_sources );
		$this->assertSame( $child_id, (int) $child_sources[ $format->get_id() ]->get_id() );
	}

	public function test_find_format_in_posts_returns_false_when_no_post_matches(): void {
		$format    = $this->video_format( 'h264', '720' );
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$other_id  = self::factory()->attachment->create_object( array( 'file' => 'other.mp4', 'post_mime_type' => 'video/mp4' ) );
		update_post_meta( $other_id, '_kgflashmediaplayer-format', 'h264_1080' ); // A different format.

		$posts  = array( get_post( $other_id ) );
		$source = Source_Factory::create( $parent_id, $this->options(), $this->registry() );

		$this->assertFalse( Video_Source_Finder::find_format_in_posts( $posts, $format, $source ) );

		// Read the raw child_sources property directly rather than through
		// get_child_sources() -- that getter lazily re-scans for children
		// via a completely different code path (Source_Attachment's own
		// set_child_sources()) whenever it's empty, which would exercise
		// unrelated matching logic instead of confirming what
		// find_format_in_posts() itself did (nothing).
		$reflection = new ReflectionProperty( $source, 'child_sources' );
		$reflection->setAccessible( true );
		$this->assertArrayNotHasKey( $format->get_id(), $reflection->getValue( $source ) );
	}

	public function test_find_format_in_posts_ignores_non_wp_post_entries(): void {
		$format    = $this->video_format( 'h264', '720' );
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$source    = Source_Factory::create( $parent_id, $this->options(), $this->registry() );

		// Malformed input (e.g. an ID instead of a WP_Post) must not fatal.
		$this->assertFalse( Video_Source_Finder::find_format_in_posts( array( 123, 'not-a-post' ), $format, $source ) );
	}
}
