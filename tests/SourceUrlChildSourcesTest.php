<?php
/**
 * Tests for Source_Url::set_child_sources() with 'find_formats' enabled --
 * regression coverage for two real bugs found while adding this coverage.
 *
 * A Source_Url is, by construction, always a genuinely different host from
 * this WordPress install (Source_Factory::determine_source_type() converts
 * any same-host URL to a real local path -- Source_File -- before a
 * Source_Url is ever created). Encode_Attachment writes encoded output for
 * a URL-sourced job (no backing attachment) to the local WP uploads
 * directory, since there's no local original to sit next to.
 *
 * - find_format_in_same_directory() (a generic file_exists() check next
 *   to the source's own path) was being used for this, but "same
 *   directory as the source" is meaningless for a source that's never
 *   local -- it was always checking the wrong location. Replaced with a
 *   dedicated find_format_in_uploads_directory().
 * - find_format_in_same_url_directory()'s own, separate check (a sibling
 *   file on the *remote* host) built its candidate URL from
 *   get_no_extension(), which strips the scheme+host for a URL source,
 *   producing a host-relative string wp_safe_remote_head() rejects
 *   outright ("A valid URL was not provided."). Fixed to build from the
 *   source's own get_url() instead.
 */

use Videopack\Admin\Formats\Registry;
use Videopack\Video_Source\Source_Factory;

class SourceUrlChildSourcesTest extends WP_UnitTestCase {

	/**
	 * @var string[] Files created during a test, cleaned up in tear_down().
	 */
	protected $temp_files = array();

	public function set_up() {
		parent::set_up();
		add_filter( 'videopack_url_exists', '__return_false' );
	}

	public function tear_down() {
		remove_filter( 'videopack_url_exists', '__return_false' );
		foreach ( $this->temp_files as $file ) {
			if ( file_exists( $file ) ) {
				wp_delete_file( $file );
			}
		}
		$this->temp_files = array();
		parent::tear_down();
	}

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function url_source( string $url, array $option_overrides = array() ) {
		$options = $this->options( array_merge( array( 'find_formats' => true ), $option_overrides ) );
		return Source_Factory::create( $url, $options, new Registry( $options ) );
	}

	public function test_find_formats_disabled_never_scans_and_returns_only_placeholders(): void {
		$source = Source_Factory::create( 'https://videos.example.test/video.mp4', $this->options( array( 'find_formats' => false ) ) );

		$children = $source->get_child_sources();

		$this->assertFalse( $children['h264_720']->exists() );
	}

	public function test_finds_a_locally_encoded_sibling_in_the_real_uploads_directory(): void {
		$source = $this->url_source( 'https://videos.example.test/video.mp4' );

		// Write a real file at exactly the path
		// find_format_in_uploads_directory() should compute:
		// {uploads}/{basename}{format suffix} -- NOT anywhere under the
		// URL's own path structure.
		$uploads             = wp_upload_dir();
		$expected_path       = untrailingslashit( $uploads['path'] ) . '/' . $source->get_filename() . '-h264_720.mp4';
		$this->temp_files[] = $expected_path;
		file_put_contents( $expected_path, 'fake video content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		$children = $source->get_child_sources();

		$this->assertTrue( $children['h264_720']->exists() );
		$this->assertSame( $expected_path, $children['h264_720']->get_direct_path() );
	}

	public function test_finds_a_remote_sibling_via_the_source_urls_own_directory(): void {
		$expected_url = 'https://videos.example.test/uploads/video-h264_720.mp4';

		$check_remote_only = static function ( $default, $url ) use ( $expected_url ) {
			return $url === $expected_url;
		};
		add_filter( 'videopack_url_exists', $check_remote_only, 10, 2 );

		try {
			$source   = $this->url_source( 'https://videos.example.test/uploads/video.mp4' );
			$children = $source->get_child_sources();
		} finally {
			remove_filter( 'videopack_url_exists', $check_remote_only, 10 );
		}

		$this->assertTrue( $children['h264_720']->exists() );
		$this->assertSame( $expected_url, $children['h264_720']->get_url() );
	}

	public function test_uploads_directory_is_checked_before_the_remote_host(): void {
		// If a local copy exists, the (cheaper, no network round-trip)
		// uploads-directory check should win even if the remote host would
		// also have answered yes.
		add_filter( 'videopack_url_exists', '__return_true' );

		$source              = $this->url_source( 'https://videos.example.test/video.mp4' );
		$uploads             = wp_upload_dir();
		$expected_path       = untrailingslashit( $uploads['path'] ) . '/' . $source->get_filename() . '-h264_720.mp4';
		$this->temp_files[] = $expected_path;
		file_put_contents( $expected_path, 'fake video content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		$children = $source->get_child_sources();

		remove_filter( 'videopack_url_exists', '__return_true' );

		$this->assertSame( $expected_path, $children['h264_720']->get_direct_path() );
	}
}
