<?php
/**
 * Tests for Source::get_mime_type()/get_codec()/get_preferred_codecs() --
 * the mime-type-to-codec resolution used whenever a source has no format
 * explicitly set and no stored metadata codec (e.g. a bare external URL).
 * Getting this wrong picks the wrong codec object for a source, which
 * feeds into player codec-support decisions and encode format matching.
 *
 * Uses Source_Url so mime-type detection goes through wp_check_filetype()
 * on the URL's extension rather than a real file probe. url_exists() is
 * short-circuited via the 'videopack_url_exists' filter Video_Source_Finder
 * already supports, so nothing here makes a real network request.
 */

use Videopack\Admin\Formats\Registry;
use Videopack\Video_Source\Source_Factory;

class SourceCodecMimeTypeTest extends WP_UnitTestCase {

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

	protected function url_source( string $url ) {
		return Source_Factory::create( $url, $this->options(), $this->registry() );
	}

	// -----------------------------------------------------------------
	// get_preferred_codecs()
	// -----------------------------------------------------------------

	public function test_get_preferred_codecs_returns_the_documented_defaults(): void {
		$source = $this->url_source( 'https://videos.example.test/video.mp4' );

		$this->assertSame(
			array(
				'video/mp4'  => 'h264',
				'video/webm' => 'vp9',
			),
			$source->get_preferred_codecs()
		);
	}

	public function test_get_preferred_codecs_respects_the_videopack_preferred_codecs_filter(): void {
		$override = static function ( array $preferred ) {
			$preferred['video/mp4'] = 'h265';
			return $preferred;
		};
		add_filter( 'videopack_preferred_codecs', $override );

		try {
			$source = $this->url_source( 'https://videos.example.test/video.mp4' );
			$this->assertSame( 'h265', $source->get_preferred_codecs()['video/mp4'] );
		} finally {
			remove_filter( 'videopack_preferred_codecs', $override );
		}
	}

	// -----------------------------------------------------------------
	// get_codec() -- via mime-type resolution (get_codec_by_mime_type()).
	// -----------------------------------------------------------------

	public function test_mp4_url_resolves_to_the_preferred_h264_codec(): void {
		$source = $this->url_source( 'https://videos.example.test/video.mp4' );

		$this->assertNotNull( $source->get_codec() );
		$this->assertSame( 'h264', $source->get_codec()->get_id() );
	}

	public function test_webm_url_resolves_to_the_preferred_vp9_codec(): void {
		$source = $this->url_source( 'https://videos.example.test/video.webm' );

		$this->assertNotNull( $source->get_codec() );
		$this->assertSame( 'vp9', $source->get_codec()->get_id() );
	}

	public function test_mp4_codec_choice_follows_the_preferred_codecs_filter_override(): void {
		// video/mp4 has three candidate codecs (h264, h265, av1) -- without
		// the filter override the tie goes to h264 (the default preference);
		// this proves the override is actually consulted, not just present.
		$override = static function ( array $preferred ) {
			$preferred['video/mp4'] = 'h265';
			return $preferred;
		};
		add_filter( 'videopack_preferred_codecs', $override );

		try {
			$source = $this->url_source( 'https://videos.example.test/video.mp4' );
			$this->assertSame( 'h265', $source->get_codec()->get_id() );
		} finally {
			remove_filter( 'videopack_preferred_codecs', $override );
		}
	}

	public function test_unrecognized_extension_resolves_to_no_codec(): void {
		$source = $this->url_source( 'https://videos.example.test/video.xyz' );

		$this->assertNull( $source->get_codec() );
	}

	// -----------------------------------------------------------------
	// get_mime_type()
	// -----------------------------------------------------------------

	public function test_get_mime_type_resolves_from_the_url_extension(): void {
		$this->assertSame( 'video/mp4', $this->url_source( 'https://videos.example.test/video.mp4' )->get_mime_type() );
		$this->assertSame( 'video/webm', $this->url_source( 'https://videos.example.test/video.webm' )->get_mime_type() );
	}

	public function test_get_mime_type_ignores_a_query_string(): void {
		$source = $this->url_source( 'https://videos.example.test/video.mp4?token=abc123&t=5' );

		$this->assertSame( 'video/mp4', $source->get_mime_type() );
	}

	public function test_get_mime_type_is_empty_for_an_unrecognized_extension(): void {
		$source = $this->url_source( 'https://videos.example.test/video.xyz' );

		$this->assertSame( '', $source->get_mime_type() );
	}
}
