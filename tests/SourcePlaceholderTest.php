<?php
/**
 * Tests for Source_Placeholder -- a reserved-but-not-yet-encoded output
 * slot (e.g. an h264_720 format that hasn't been generated yet). Previously
 * completely untested despite real, independently-verifiable behavior:
 * converting a server filesystem path into a public URL, and deriving
 * metadata (height/codec) from the reserved format rather than from a real
 * file that doesn't exist yet.
 */

use Videopack\Video_Source\Source_Placeholder;
use Videopack\Admin\Formats\Registry;

class SourcePlaceholderTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function registry(): Registry {
		return new Registry( $this->options() );
	}

	protected function placeholder( string $path, ?string $format = 'h264_720' ): Source_Placeholder {
		return new Source_Placeholder( $path, $this->options(), $this->registry(), $format );
	}

	// -----------------------------------------------------------------
	// set_url() -- ABSPATH -> site URL conversion.
	// -----------------------------------------------------------------

	public function test_url_converts_a_path_under_abspath_to_a_public_url(): void {
		$path   = ABSPATH . 'wp-content/uploads/2024/01/video-720.mp4';
		$source = $this->placeholder( $path );

		$this->assertSame( site_url( '/' ) . 'wp-content/uploads/2024/01/video-720.mp4', $source->get_url() );
	}

	/**
	 * str_replace() with no match in the subject returns the subject
	 * unchanged -- a placeholder path that isn't actually under ABSPATH
	 * (shouldn't normally happen, since placeholders are always built from
	 * a real upload-directory path, but nothing enforces it) would produce
	 * a "URL" that's just the raw filesystem path, not a real URL.
	 */
	public function test_url_for_a_path_outside_abspath_is_returned_unchanged(): void {
		$path   = '/some/other/disk/video-720.mp4';
		$source = $this->placeholder( $path );

		$this->assertSame( $path, $source->get_url() );
	}

	// -----------------------------------------------------------------
	// Identity: placeholders never exist, are always local, never have
	// their own children.
	// -----------------------------------------------------------------

	public function test_placeholder_never_exists(): void {
		$this->assertFalse( $this->placeholder( ABSPATH . 'video-720.mp4' )->exists() );
	}

	public function test_placeholder_is_always_local(): void {
		$this->assertTrue( $this->placeholder( ABSPATH . 'video-720.mp4' )->is_local() );
	}

	public function test_placeholder_has_no_child_sources(): void {
		$this->assertSame( array(), $this->placeholder( ABSPATH . 'video-720.mp4' )->get_child_sources() );
	}

	public function test_direct_path_is_the_raw_source_path(): void {
		$path = ABSPATH . 'wp-content/uploads/2024/01/video-720.mp4';
		$this->assertSame( $path, $this->placeholder( $path )->get_direct_path() );
	}

	public function test_empty_path_throws(): void {
		$this->expectException( \Exception::class );
		$this->placeholder( '' );
	}

	// -----------------------------------------------------------------
	// Metadata is derived from the reserved format, not a real file, and
	// -- unlike its siblings -- never populated until something needs it.
	// -----------------------------------------------------------------

	public function test_metadata_is_empty_until_something_asks_for_it(): void {
		// Source_Attachment's constructor eagerly calls set_metadata();
		// Source_Placeholder's does not, and Source::get_metadata() is not
		// itself lazy (it just returns whatever's already there) -- so a
		// freshly constructed placeholder reports no metadata at all until
		// set_metadata() is called (directly, or via Source::get_views()'s
		// own lazy call).
		$source = $this->placeholder( ABSPATH . 'video-720.mp4', 'h264_720' );

		$this->assertSame( array(), $source->get_metadata() );
	}

	public function test_get_views_lazily_populates_metadata_and_reports_zero(): void {
		$source = $this->placeholder( ABSPATH . 'video-720.mp4', 'h264_720' );

		$this->assertSame( 0, $source->get_views() );
	}

	/**
	 * Unlike other Source_* subclasses, get_metadata() is never lazy for a
	 * placeholder on its own -- the constructor doesn't call set_metadata(),
	 * and Source::get_metadata() just returns whatever's already there. It
	 * only gets populated when something that needs it triggers it, e.g.
	 * Source::get_views() lazily calling set_metadata() when
	 * metadata['starts'] isn't set yet (real code path any Source subclass
	 * can hit, not placeholder-specific), so tests call it explicitly here.
	 */
	public function test_metadata_height_matches_the_reserved_formats_resolution(): void {
		$source = $this->placeholder( ABSPATH . 'video-720.mp4', 'h264_720' );
		$source->set_metadata();

		$this->assertSame( 720, $source->get_metadata()['height'] );
	}

	public function test_metadata_fourcc_matches_the_reserved_formats_codec(): void {
		$source = $this->placeholder( ABSPATH . 'video-720.mp4', 'h264_720' );
		$source->set_metadata();

		$this->assertSame( 'avc1', $source->get_metadata()['fourcc'] );
	}

	/**
	 * Every sibling Source subclass's set_metadata() uses the passed-in
	 * $metadata array when one is given (e.g. Source_Url's, used
	 * throughout SourceFormatResolutionTest to inject real
	 * actualwidth/actualheight). Source_Placeholder's ignores it entirely
	 * and always recomputes from the reserved format instead -- consistent
	 * with there being no real file to describe, but worth documenting
	 * since it's a real behavioral difference from its siblings.
	 */
	public function test_set_metadata_ignores_an_explicitly_passed_array(): void {
		$source = $this->placeholder( ABSPATH . 'video-720.mp4', 'h264_720' );

		$source->set_metadata( array( 'height' => 999, 'fourcc' => 'ignored' ) );

		$this->assertSame( 720, $source->get_metadata()['height'] );
		$this->assertSame( 'avc1', $source->get_metadata()['fourcc'] );
	}
}
