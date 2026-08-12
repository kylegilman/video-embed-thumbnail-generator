<?php
/**
 * Tests for Source_Attachment::set_child_sources() (via the public
 * get_child_sources()/get_existing_child_sources()) -- for every
 * registered video format, resolving either a real matching attachment
 * child or a not-yet-encoded placeholder. This is what
 * Player::set_sources() iterates to build the <video>'s alternate-format
 * <source> tags, so a wrong match here means the player either misses a
 * real encoded file or offers a source that doesn't exist.
 */

use Videopack\Admin\Formats\Registry;
use Videopack\Video_Source\Source_Factory;

class SourceChildSourcesTest extends WP_UnitTestCase {

	public function set_up() {
		parent::set_up();
		add_filter( 'videopack_url_exists', '__return_false' );
	}

	public function tear_down() {
		remove_filter( 'videopack_url_exists', '__return_false' );
		parent::tear_down();
	}

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function registry(): Registry {
		return new Registry( $this->options() );
	}

	protected function attachment_source( int $attachment_id, ?string $format = null ) {
		return Source_Factory::create( $attachment_id, $this->options(), $this->registry(), $format );
	}

	public function test_returns_a_not_yet_encoded_placeholder_for_every_registered_format_when_none_exist(): void {
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$source    = $this->attachment_source( $parent_id );

		$children = $source->get_child_sources();

		$this->assertCount( count( $this->registry()->get_video_formats() ), $children );
		$this->assertArrayHasKey( 'h264_720', $children );
		$this->assertFalse( $children['h264_720']->exists() );
	}

	public function test_uses_the_real_matching_attachment_when_one_exists(): void {
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$child_id  = self::factory()->attachment->create_object(
			array(
				'file'           => 'video-720p.mp4',
				'post_mime_type' => 'video/mp4',
				'post_parent'    => $parent_id,
			)
		);
		update_post_meta( $child_id, '_kgflashmediaplayer-format', 'h264_720' );

		$source   = $this->attachment_source( $parent_id );
		$children = $source->get_child_sources();

		$this->assertTrue( $children['h264_720']->exists() );
		$this->assertSame( $child_id, (int) $children['h264_720']->get_id() );

		// An unrelated format has no matching child and stays a placeholder.
		$this->assertFalse( $children['h264_1080']->exists() );
	}

	public function test_get_existing_child_sources_only_returns_formats_that_actually_exist(): void {
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$child_id  = self::factory()->attachment->create_object(
			array(
				'file'           => 'video-720p.mp4',
				'post_mime_type' => 'video/mp4',
				'post_parent'    => $parent_id,
			)
		);
		update_post_meta( $child_id, '_kgflashmediaplayer-format', 'h264_720' );

		$source   = $this->attachment_source( $parent_id );
		$existing = $source->get_existing_child_sources();

		$this->assertCount( 1, $existing );
		$this->assertSame( $child_id, (int) $existing[0]->get_id() );
	}

	public function test_a_source_constructed_with_an_explicit_format_is_not_treated_as_original_and_has_no_children(): void {
		// e.g. one of get_child_sources()'s own results -- constructing a
		// Source directly for a specific format (not the attachment's
		// primary/original source) must not recursively scan for its own
		// children, since is_original() gates set_child_sources().
		$parent_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );
		$source    = $this->attachment_source( $parent_id, 'h264_720' );

		$this->assertFalse( $source->is_original() );
		$this->assertSame( array(), $source->get_child_sources() );
	}
}
