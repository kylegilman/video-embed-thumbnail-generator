<?php
/**
 * Tests for Video_Metadata's constructor cascade -- the order it tries
 * sources in (this plugin's own saved postmeta, then WP core's attachment
 * metadata, then a real `ffmpeg -i` probe, then browser-reported metadata)
 * and how the result gets persisted back. parse_rotation() already has
 * dedicated coverage in VideoMetadataRotationTest; this file covers
 * everything else, previously untested.
 *
 * This environment has no real ffmpeg binary, so every scenario here where
 * postmeta/WP-core metadata don't already resolve things necessarily falls
 * through to a real, unmocked, failing ffmpeg attempt before reaching
 * whatever's being tested -- that's the actual cascade running for real,
 * not a stand-in for it.
 */

use Videopack\Admin\Encode\Video_Metadata;
use Videopack\Admin\Attachment_Meta;

class VideoMetadataTest extends WP_UnitTestCase {

	/**
	 * @var string[] Files created during a test, cleaned up in tear_down().
	 */
	protected $temp_files = array();

	public function tear_down() {
		foreach ( $this->temp_files as $file ) {
			if ( file_exists( $file ) ) {
				wp_delete_file( $file );
			}
		}
		$this->temp_files = array();
		parent::tear_down();
	}

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	/**
	 * Source_Attachment/wp_read_video_metadata() both need a real file on
	 * disk -- the attachment factory only sets postmeta. Plain text content
	 * (rather than a real video) is deliberate: it keeps Attachment_Meta::get()'s
	 * own getID3-based wp_read_video_metadata() fallback from finding
	 * anything either, so results here come only from the sources each test
	 * actually sets up.
	 */
	protected function video_attachment(): int {
		$attachment_id      = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		$attached_file      = get_attached_file( $attachment_id );
		$this->temp_files[] = $attached_file;
		file_put_contents( $attached_file, 'fake video content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		return $attachment_id;
	}

	protected function attachment_meta( int $attachment_id ): Attachment_Meta {
		return new Attachment_Meta( $this->options(), $attachment_id );
	}

	protected function video_metadata( int $id, array $browser_metadata = array() ): Video_Metadata {
		return new Video_Metadata( $id, get_attached_file( $id ), true, 'ffmpeg', $this->options(), $browser_metadata );
	}

	// -----------------------------------------------------------------
	// Source precedence.
	// -----------------------------------------------------------------

	public function test_uses_this_plugins_own_saved_metadata_when_already_complete(): void {
		$id = $this->video_attachment();
		$this->attachment_meta( $id )->save(
			array(
				'worked'       => true,
				'actualwidth'  => 999,
				'actualheight' => 555,
				'codec'        => 'vp9',
				'duration'     => 12.5,
			)
		);

		$metadata = $this->video_metadata( $id );

		$this->assertTrue( $metadata->worked );
		$this->assertSame( 999, $metadata->actualwidth );
		$this->assertSame( 555, $metadata->actualheight );
		$this->assertSame( 'vp9', $metadata->codec );
		$this->assertSame( 12.5, $metadata->duration );
	}

	public function test_falls_back_to_wp_core_metadata_when_complete(): void {
		$id = $this->video_attachment();
		update_post_meta(
			$id,
			'_wp_attachment_metadata',
			array(
				'width'      => 640,
				'height'     => 360,
				'length'     => 30,
				'videocodec' => 'h264',
			)
		);

		$metadata = $this->video_metadata( $id );

		$this->assertTrue( $metadata->worked );
		$this->assertSame( 640, $metadata->actualwidth );
		$this->assertSame( 360, $metadata->actualheight );
		$this->assertSame( 30, $metadata->duration );
		$this->assertSame( 'h264', $metadata->codec );
	}

	/**
	 * The initial WP-core-metadata check requires width, height, AND codec
	 * to short-circuit before ever attempting ffmpeg. But the fallback
	 * check that runs after a real ffmpeg attempt fails only requires
	 * width and height -- codec is allowed to stay empty. Getting that
	 * asymmetry backwards (e.g. requiring codec in both places) would
	 * needlessly force a real ffmpeg attempt even when core already knows
	 * the dimensions, or silently drop known-good dimensions that lack a
	 * codec.
	 */
	public function test_ffmpeg_failure_fallback_accepts_wp_core_dimensions_without_a_codec(): void {
		$id = $this->video_attachment();
		update_post_meta(
			$id,
			'_wp_attachment_metadata',
			array(
				'width'  => 640,
				'height' => 360,
			)
		);

		$metadata = $this->video_metadata( $id );

		$this->assertTrue( $metadata->worked );
		$this->assertSame( 640, $metadata->actualwidth );
		$this->assertSame( 360, $metadata->actualheight );
	}

	public function test_falls_back_to_browser_reported_metadata_when_nothing_else_resolves(): void {
		$id = $this->video_attachment();

		$metadata = $this->video_metadata(
			$id,
			array(
				'actualwidth'  => 320,
				'actualheight' => 240,
				'duration'     => 5.5,
			)
		);

		$this->assertTrue( $metadata->worked );
		$this->assertSame( 320, $metadata->actualwidth );
		$this->assertSame( 240, $metadata->actualheight );
		$this->assertSame( 5.5, $metadata->duration );
	}

	public function test_worked_is_false_when_every_source_comes_up_empty(): void {
		$id = $this->video_attachment();

		$metadata = $this->video_metadata( $id );

		$this->assertFalse( $metadata->worked );
	}

	public function test_a_non_attachment_source_never_touches_postmeta(): void {
		// Must not fatal despite no Attachment_Meta ever being constructed
		// for it (there is no post to attach one to).
		$metadata = new Video_Metadata( 0, 'https://example.test/video.mp4', false, 'ffmpeg', $this->options() );

		$this->assertFalse( $metadata->worked );
	}

	// -----------------------------------------------------------------
	// Persistence back to the attachment.
	// -----------------------------------------------------------------

	public function test_a_successful_resolution_is_saved_back_to_the_attachment(): void {
		$id = $this->video_attachment();

		$this->video_metadata(
			$id,
			array(
				'actualwidth'  => 320,
				'actualheight' => 240,
			)
		);

		$saved = $this->attachment_meta( $id )->get();
		$this->assertTrue( $saved['worked'] );
		$this->assertSame( 320, $saved['actualwidth'] );
		$this->assertSame( 240, $saved['actualheight'] );
	}

	/**
	 * A previously known codec must survive a later attempt that fails to
	 * (re)derive one -- overwriting it with the new attempt's empty result
	 * would silently erase already-good information.
	 */
	public function test_an_existing_saved_codec_survives_a_derivation_that_finds_nothing(): void {
		$id = $this->video_attachment();
		$this->attachment_meta( $id )->save( array( 'codec' => 'h264' ) );

		$this->video_metadata( $id );

		$saved = $this->attachment_meta( $id )->get();
		$this->assertSame( 'h264', $saved['codec'] );
	}
}
