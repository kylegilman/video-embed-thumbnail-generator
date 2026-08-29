<?php
/**
 * Tests for Sanitize_Url -- parses a video URL into a basename, an
 * extension-stripped URL, and a stable meta-key-safe ID. These aren't just
 * display values: Encode_Info uses `basename` and `noextension` directly to
 * build real filesystem paths and URLs for locating/writing encoded output
 * (Encode_Info.php:289,296,300,362), and Source::set_id() /
 * Video_Source_Finder use `singleurl_id`/`noextension` as the stable
 * identifier for a URL-based (non-attachment) video source.
 */

use Videopack\Admin\Sanitize_Url;

class SanitizeUrlTest extends WP_UnitTestCase {

	// -----------------------------------------------------------------
	// Normal URLs with a recognizable extension.
	// -----------------------------------------------------------------

	public function test_basic_url_extracts_basename_and_noextension(): void {
		$sanitized = new Sanitize_Url( 'https://example.com/videos/my-video.mp4' );

		$this->assertSame( 'my-video', $sanitized->basename );
		$this->assertSame( 'https://example.com/videos/my-video', $sanitized->noextension );
	}

	public function test_query_string_and_fragment_are_stripped_from_noextension(): void {
		$sanitized = new Sanitize_Url( 'https://example.com/videos/my-video.mp4?token=abc123#t=10' );

		$this->assertSame( 'my-video', $sanitized->basename );
		$this->assertSame( 'https://example.com/videos/my-video', $sanitized->noextension );
	}

	public function test_uppercase_extension_is_stripped(): void {
		$sanitized = new Sanitize_Url( 'https://example.com/videos/my-video.MP4' );

		$this->assertSame( 'my-video', $sanitized->basename );
	}

	public function test_basename_is_run_through_sanitize_file_name(): void {
		// sanitize_file_name() strips path-unsafe/special characters like
		// '<', '>' -- confirm that actually happens rather than the
		// basename being passed through as-is. (A literal '?' in the path
		// segment itself, before parsing, would instead be read as the
		// start of the query string -- see the extensionless-fallback tests
		// below for that case.)
		$sanitized = new Sanitize_Url( 'https://example.com/videos/my<video>.mp4' );

		$this->assertStringNotContainsString( '<', $sanitized->basename );
		$this->assertStringNotContainsString( '>', $sanitized->basename );
	}

	public function test_percent_encoded_characters_are_decoded_before_parsing(): void {
		// sanitize_file_name() collapses whitespace into a hyphen, so the
		// decoded space becomes '-' rather than surviving as a literal
		// space -- this still proves the %20 was decoded before sanitizing
		// (an undecoded 'my%20video.mp4' would sanitize to 'my%20video').
		$sanitized = new Sanitize_Url( 'https://example.com/videos/my%20video.mp4' );

		$this->assertSame( 'my-video', $sanitized->basename );
	}

	// -----------------------------------------------------------------
	// singleurl_id
	// -----------------------------------------------------------------

	public function test_singleurl_id_is_meta_key_safe(): void {
		$sanitized = new Sanitize_Url( 'https://example.com/videos/My Video!.mp4' );

		$this->assertMatchesRegularExpression( '/^singleurl_[a-z0-9_-]+$/', $sanitized->singleurl_id );
	}

	public function test_singleurl_id_is_stable_for_the_same_url(): void {
		$first  = new Sanitize_Url( 'https://example.com/videos/my-video.mp4' );
		$second = new Sanitize_Url( 'https://example.com/videos/my-video.mp4' );

		$this->assertSame( $first->singleurl_id, $second->singleurl_id );
	}

	public function test_singleurl_id_differs_for_different_urls(): void {
		$first  = new Sanitize_Url( 'https://example.com/videos/video-one.mp4' );
		$second = new Sanitize_Url( 'https://example.com/videos/video-two.mp4' );

		$this->assertNotSame( $first->singleurl_id, $second->singleurl_id );
	}

	// -----------------------------------------------------------------
	// movieurl
	// -----------------------------------------------------------------

	public function test_movieurl_is_escaped(): void {
		$sanitized = new Sanitize_Url( 'https://example.com/videos/my-video.mp4?a=1&b=2' );

		$this->assertSame( esc_url_raw( 'https://example.com/videos/my-video.mp4?a=1&b=2' ), $sanitized->movieurl );
	}

	// -----------------------------------------------------------------
	// No-extension URLs -- a real, reachable path (e.g. a CDN URL that
	// identifies the file by an opaque ID with no file extension).
	// -----------------------------------------------------------------

	public function test_extensionless_url_falls_back_to_a_basename_without_crashing(): void {
		$sanitized = new Sanitize_Url( 'https://cdn.example.com/v/abc123xyzabc123xyzabc123xyz' );

		$this->assertNotSame( '', $sanitized->basename );
		$this->assertSame( 'https://cdn.example.com/v/abc123xyzabc123xyzabc123xyz', $sanitized->noextension );
	}

	/**
	 * Encode_Info.php uses `basename` directly to build real filesystem
	 * paths for locating/writing encoded output
	 * (`$this->source->get_dirname() . '/' . $this->basename . $suffix`,
	 * Encode_Info.php:289). A user with only `encode_videos` can supply an
	 * arbitrary external URL as encode input (Job_Controller::jobs_create()
	 * -> esc_url_raw( $input )), so an extensionless URL is a genuinely
	 * reachable input here -- this must never let a '/' or '../' segment
	 * from that URL reach a real path unsanitized.
	 */
	public function test_extensionless_url_basename_strips_path_traversal_segments(): void {
		$malicious_url = 'https://example.com/safe/dir/../../evil/x';
		$sanitized     = new Sanitize_Url( $malicious_url );

		// pathinfo() already isolates the last path segment ('x') before
		// sanitize_file_name() ever runs -- the scheme, host, and '../'
		// segments never reach `basename` at all.
		$this->assertSame( 'x', $sanitized->basename );
	}

	public function test_extensionless_url_basename_is_sanitized_like_the_extension_present_branch(): void {
		$sanitized = new Sanitize_Url( 'https://example.com/videos/my<video>' );

		$this->assertStringNotContainsString( '<', $sanitized->basename );
		$this->assertStringNotContainsString( '>', $sanitized->basename );
	}

	public function test_extensionless_local_path_is_handled(): void {
		// wp_parse_url() on a bare local path still returns a usable path,
		// but this exercises the "$parsed_path is empty, fall back to the
		// raw decoded URL" branch for genuinely unparseable input.
		$sanitized = new Sanitize_Url( 'not a url at all' );

		$this->assertSame( 'not a url at all', $sanitized->noextension );
	}

	public function test_empty_url_does_not_error(): void {
		$sanitized = new Sanitize_Url( '' );

		$this->assertSame( '', $sanitized->noextension );
		$this->assertSame( '', $sanitized->basename );
		$this->assertSame( 'singleurl_', $sanitized->singleurl_id );
	}

	// -----------------------------------------------------------------
	// Extension-length edge cases (the regex only strips a 3-4 character
	// extension: /\.[^.\s]{3,4}$/).
	// -----------------------------------------------------------------

	public function test_two_character_extension_is_not_stripped_by_the_noextension_regex(): void {
		// pathinfo() will still report an 'extension' of 'jp' here, so
		// `basename` is sanitized normally, but the noextension regex
		// (3-4 chars only) leaves it untouched -- noextension and basename
		// disagree about whether the extension was removed.
		$sanitized = new Sanitize_Url( 'https://example.com/videos/thumb.jp' );

		$this->assertSame( 'thumb', $sanitized->basename );
		$this->assertSame( 'https://example.com/videos/thumb.jp', $sanitized->noextension, 'the 3-4 char regex does not strip a 2-character extension' );
	}

	public function test_five_character_extension_is_not_stripped(): void {
		$sanitized = new Sanitize_Url( 'https://example.com/videos/video.webm5' );

		$this->assertSame( 'https://example.com/videos/video.webm5', $sanitized->noextension, 'the 3-4 char regex does not strip a 5-character extension' );
	}
}
