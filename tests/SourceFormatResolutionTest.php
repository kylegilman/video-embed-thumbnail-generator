<?php
/**
 * Tests for Source::get_format()/is_original() -- resolving a source's own
 * Videopack format ID (e.g. 'h264_720') by matching its detected codec and
 * resolution against the registered format list, when no format was
 * already assigned at construction.
 *
 * Regression coverage for a real bug: the match used to compare codec
 * *objects* with strict identity (===). Registry::get_video_codecs() has
 * no caching, so every call -- including the one get_video_formats() makes
 * internally to build each Video_Format's own codec -- constructs brand
 * new Video_Codec instances. Two calls representing the same codec were
 * therefore never the same object, so the match could never succeed and
 * get_format() always fell back to 'original', regardless of the source's
 * actual codec/resolution. Fixed to compare codec IDs instead.
 */

use Videopack\Admin\Formats\Registry;
use Videopack\Video_Source\Source_Factory;

class SourceFormatResolutionTest extends WP_UnitTestCase {

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

	protected function url_source_with_dimensions( string $url, int $width, int $height ) {
		$source = Source_Factory::create( $url, $this->options(), $this->registry() );
		$source->set_metadata( array( 'width' => $width, 'height' => $height ) );
		return $source;
	}

	public function test_resolves_to_the_matching_format_id_for_its_codec_and_resolution(): void {
		$source = $this->url_source_with_dimensions( 'https://videos.example.test/video.mp4', 1280, 720 );

		$this->assertSame( 'h264_720', $source->get_format() );
		$this->assertFalse( $source->is_original() );
	}

	/**
	 * Regression test for the second bug found alongside the codec-identity
	 * one: set_format() used to read the raw $this->resolution property
	 * instead of calling get_resolution(), so calling get_format() as the
	 * very first thing on a freshly constructed source (with nothing else
	 * having incidentally triggered resolution computation first) silently
	 * skipped the whole lookup and fell back to 'original', while calling
	 * get_resolution() first made it work. Both call orders must resolve
	 * identically.
	 */
	public function test_resolves_correctly_even_when_get_format_is_called_before_anything_else(): void {
		$source = $this->url_source_with_dimensions( 'https://videos.example.test/video.mp4', 1280, 720 );

		// get_format() first -- nothing else has touched codec/resolution yet.
		$this->assertSame( 'h264_720', $source->get_format() );
	}

	public function test_resolves_correctly_for_a_different_codec_and_resolution(): void {
		$source = $this->url_source_with_dimensions( 'https://videos.example.test/video.webm', 1920, 1080 );

		$this->assertSame( 'vp9_1080', $source->get_format() );
		$this->assertFalse( $source->is_original() );
	}

	public function test_falls_back_to_original_when_the_resolution_matches_no_defined_format(): void {
		// 800px tall isn't one of the registry's defined resolutions.
		$source = $this->url_source_with_dimensions( 'https://videos.example.test/video.mp4', 1422, 800 );

		$this->assertSame( 'original', $source->get_format() );
		$this->assertTrue( $source->is_original() );
	}

	public function test_falls_back_to_original_when_there_is_no_dimension_metadata_at_all(): void {
		$source = Source_Factory::create( 'https://videos.example.test/video.mp4', $this->options(), $this->registry() );

		$this->assertSame( 'original', $source->get_format() );
		$this->assertTrue( $source->is_original() );
	}

	public function test_falls_back_to_original_when_the_mime_type_resolves_to_no_codec(): void {
		$source = $this->url_source_with_dimensions( 'https://videos.example.test/video.xyz', 1280, 720 );

		$this->assertSame( 'original', $source->get_format() );
		$this->assertTrue( $source->is_original() );
	}

	public function test_an_explicitly_assigned_format_is_used_as_is_without_running_the_lookup(): void {
		$source = Source_Factory::create(
			'https://videos.example.test/video.mp4',
			$this->options(),
			$this->registry(),
			'h264_1080'
		);

		$this->assertSame( 'h264_1080', $source->get_format() );
		$this->assertFalse( $source->is_original() );
	}
}
