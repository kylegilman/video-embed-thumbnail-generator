<?php
/**
 * Tests for Source::set_path_parts() (get_dirname/get_basename/
 * get_extension/get_filename/get_no_extension) and is_compatible() --
 * pure string parsing off a source's URL/path, and the extension
 * allow-list that gates whether Player::set_sources() treats a source as
 * playable at all.
 */

use Videopack\Admin\Formats\Registry;
use Videopack\Video_Source\Source_Factory;

class SourcePathAndCompatibilityTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function url_source( string $url ) {
		return Source_Factory::create( $url, $this->options(), new Registry( $this->options() ) );
	}

	// -----------------------------------------------------------------
	// set_path_parts() -- dirname/basename/extension/filename/no_extension.
	// -----------------------------------------------------------------

	public function test_extracts_extension_and_filename_from_a_plain_url(): void {
		$source = $this->url_source( 'https://videos.example.test/path/video.mp4' );

		$this->assertSame( 'mp4', $source->get_extension() );
		$this->assertSame( 'video', $source->get_filename() );
		$this->assertSame( 'video.mp4', $source->get_basename() );
	}

	public function test_extension_and_filename_ignore_a_query_string(): void {
		$source = $this->url_source( 'https://videos.example.test/path/video.mp4?token=abc123&t=5' );

		$this->assertSame( 'mp4', $source->get_extension() );
		$this->assertSame( 'video', $source->get_filename() );
	}

	public function test_dirname_reflects_the_urls_path(): void {
		$source = $this->url_source( 'https://videos.example.test/uploads/2024/video.mp4' );

		$this->assertSame( '/uploads/2024', $source->get_dirname() );
	}

	public function test_no_extension_combines_dirname_and_filename(): void {
		$source = $this->url_source( 'https://videos.example.test/uploads/2024/video.mp4' );

		$this->assertSame( '/uploads/2024/video', $source->get_no_extension() );
	}

	public function test_filename_and_basename_are_sanitized(): void {
		$source = $this->url_source( 'https://videos.example.test/My Video File.mp4' );

		$this->assertSame( 'My-Video-File', $source->get_filename() );
		$this->assertSame( 'My-Video-File.mp4', $source->get_basename() );
	}

	// -----------------------------------------------------------------
	// is_compatible()
	// -----------------------------------------------------------------

	/**
	 * @dataProvider compatible_extensions
	 */
	public function test_recognizes_compatible_extensions( string $extension ): void {
		$source = $this->url_source( "https://videos.example.test/video.{$extension}" );

		$this->assertTrue( $source->is_compatible() );
	}

	public function compatible_extensions(): array {
		return array(
			'mp4'  => array( 'mp4' ),
			'webm' => array( 'webm' ),
			'mov'  => array( 'mov' ),
			'ogv'  => array( 'ogv' ),
			'mkv'  => array( 'mkv' ),
			'm3u8' => array( 'm3u8' ),
			'mpd'  => array( 'mpd' ),
		);
	}

	public function test_rejects_an_unrecognized_extension(): void {
		$source = $this->url_source( 'https://videos.example.test/video.avi' );

		$this->assertFalse( $source->is_compatible() );
	}

	public function test_compatibility_check_ignores_a_query_string(): void {
		$source = $this->url_source( 'https://videos.example.test/video.mp4?token=abc123' );

		$this->assertTrue( $source->is_compatible() );
	}

	public function test_respects_the_videopack_compatible_extensions_filter(): void {
		$override = static function ( array $extensions ) {
			return array_diff( $extensions, array( 'mp4' ) );
		};
		add_filter( 'videopack_compatible_extensions', $override );

		try {
			$source = $this->url_source( 'https://videos.example.test/video.mp4' );
			$this->assertFalse( $source->is_compatible() );
		} finally {
			remove_filter( 'videopack_compatible_extensions', $override );
		}
	}
}
