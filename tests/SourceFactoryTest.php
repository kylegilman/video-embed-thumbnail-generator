<?php
/**
 * Tests for Source_Factory::create()'s dispatch and, more importantly,
 * determine_source_type()'s security-relevant path containment: a
 * same-host URL or bare local path is only ever treated as a real 'file'
 * source if, after resolving any '.'/'..' segments, it still sits inside
 * ABSPATH -- otherwise it must fall back to a 'placeholder' rather than
 * letting a caller read/reference an arbitrary path outside the WordPress
 * install (e.g. "/etc/passwd"). Previously completely untested.
 */

use Videopack\Admin\Formats\Registry;
use Videopack\Video_Source\Source_Factory;
use Videopack\Video_Source\Source_Attachment;
use Videopack\Video_Source\Source_File;
use Videopack\Video_Source\Source_Url;
use Videopack\Video_Source\Source_Placeholder;

class SourceFactoryTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function registry(): Registry {
		return new Registry( $this->options() );
	}

	protected function determine_source_type( $source ): array {
		$method = new ReflectionMethod( Source_Factory::class, 'determine_source_type' );
		$method->setAccessible( true );
		return $method->invoke( null, $source, $this->options(), $this->registry() );
	}

	protected function normalize_path( string $path ): string {
		$method = new ReflectionMethod( Source_Factory::class, 'normalize_path' );
		$method->setAccessible( true );
		return $method->invoke( null, $path );
	}

	// -----------------------------------------------------------------
	// create() -- dispatch to the right Source subclass.
	// -----------------------------------------------------------------

	public function test_create_with_an_explicit_source_type_dispatches_directly(): void {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);

		$source = Source_Factory::create( $attachment_id, $this->options(), $this->registry(), null, null, null, 'attachment' );

		$this->assertInstanceOf( Source_Attachment::class, $source );
	}

	public function test_create_returns_null_for_an_unrecognized_explicit_source_type(): void {
		$source = Source_Factory::create( 'anything', $this->options(), $this->registry(), null, null, null, 'not_a_real_type' );

		$this->assertNull( $source );
	}

	public function test_create_lets_the_videopack_source_class_filter_short_circuit(): void {
		$placeholder = new \stdClass();
		add_filter(
			'videopack_source_class',
			static function () use ( $placeholder ) {
				return $placeholder;
			}
		);

		$source = Source_Factory::create( 'https://videos.example.test/video.mp4', $this->options() );
		remove_all_filters( 'videopack_source_class' );

		$this->assertSame( $placeholder, $source );
	}

	// -----------------------------------------------------------------
	// determine_source_type() -- non-URL/path inputs.
	// -----------------------------------------------------------------

	public function test_numeric_id_of_a_real_attachment_is_attachment_type(): void {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);

		list( , $type ) = $this->determine_source_type( (string) $attachment_id );

		$this->assertSame( 'attachment', $type );
	}

	public function test_numeric_id_with_no_matching_attachment_is_a_placeholder(): void {
		list( , $type ) = $this->determine_source_type( '999999999' );

		$this->assertSame( 'placeholder', $type );
	}

	public function test_array_with_a_real_attachment_id_is_attachment_type(): void {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);

		list( $instance_source, $type ) = $this->determine_source_type( array( 'id' => $attachment_id ) );

		$this->assertSame( 'attachment', $type );
		$this->assertSame( $attachment_id, $instance_source['id'] );
	}

	public function test_array_with_no_matching_attachment_id_is_a_placeholder(): void {
		list( , $type ) = $this->determine_source_type( array( 'id' => 999999999 ) );

		$this->assertSame( 'placeholder', $type );
	}

	// -----------------------------------------------------------------
	// determine_source_type() -- URLs.
	// -----------------------------------------------------------------

	/**
	 * url_to_id() resolves via WP core's attachment_url_to_postid(), which
	 * only ever matches a URL against the *local* site's own uploads
	 * baseurl (see the project_url_to_id_cross_host_matching memory) --
	 * not via '_kgflashmediaplayer-externalurl' meta, which is a
	 * completely separate lookup used elsewhere (Video_Source_Finder's
	 * child-matching). A URL under this site's own uploads directory is
	 * the only kind that resolves to 'attachment' here.
	 */
	public function test_a_url_under_this_sites_own_uploads_directory_is_attachment_type(): void {
		$matched_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'copy.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		$url        = wp_get_attachment_url( $matched_id );

		list( $instance_source, $type ) = $this->determine_source_type( $url );

		$this->assertSame( 'attachment', $type );
		$this->assertSame( $matched_id, $instance_source['id'] );
	}

	/**
	 * The inverse of the above: a URL under this site's own uploads
	 * baseurl but with no matching attachment falls through instead of
	 * ever being mistaken for one.
	 */
	public function test_a_url_under_uploads_with_no_matching_attachment_is_not_attachment_type(): void {
		$uploads = wp_upload_dir();
		$url     = untrailingslashit( (string) $uploads['baseurl'] ) . '/no-such-file.mp4';

		list( , $type ) = $this->determine_source_type( $url );

		$this->assertNotSame( 'attachment', $type );
	}

	public function test_a_different_host_url_is_url_type(): void {
		list( , $type ) = $this->determine_source_type( 'https://videos.example.test/video.mp4' );

		$this->assertSame( 'url', $type );
	}

	public function test_a_same_host_url_pointing_inside_abspath_is_file_type(): void {
		$url = site_url( '/wp-content/uploads/video.mp4' );

		list( $instance_source, $type ) = $this->determine_source_type( $url );

		$this->assertSame( 'file', $type );
		$this->assertSame( trailingslashit( ABSPATH ) . 'wp-content/uploads/video.mp4', $instance_source );
	}

	/**
	 * Security check: a same-host URL that resolves (after collapsing '..'
	 * segments) to somewhere outside ABSPATH must never be treated as a
	 * real local file -- it falls back to a placeholder instead of letting
	 * a caller reference an arbitrary path on the server.
	 */
	public function test_a_same_host_url_escaping_abspath_via_dot_dot_is_a_placeholder(): void {
		$url = site_url( '/wp-content/uploads/../../../../etc/passwd' );

		list( , $type ) = $this->determine_source_type( $url );

		$this->assertSame( 'placeholder', $type );
	}

	public function test_a_same_host_url_with_dot_dot_that_still_resolves_inside_abspath_is_file_type(): void {
		$url = site_url( '/wp-content/uploads/2024/../video.mp4' );

		list( $instance_source, $type ) = $this->determine_source_type( $url );

		$this->assertSame( 'file', $type );
		$this->assertSame( trailingslashit( ABSPATH ) . 'wp-content/uploads/video.mp4', $instance_source );
	}

	public function test_a_same_host_url_percent_encoded_to_hide_traversal_is_still_contained(): void {
		$url = site_url() . '/wp-content/uploads/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/passwd';

		list( , $type ) = $this->determine_source_type( $url );

		$this->assertSame( 'placeholder', $type );
	}

	// -----------------------------------------------------------------
	// determine_source_type() -- bare local paths (not URLs).
	// -----------------------------------------------------------------

	public function test_a_bare_existing_path_inside_abspath_is_file_type(): void {
		$path = trailingslashit( ABSPATH ) . 'wp-load.php'; // A real file that ships with every WP install.

		list( $instance_source, $type ) = $this->determine_source_type( $path );

		$this->assertSame( 'file', $type );
		$this->assertSame( $path, $instance_source );
	}

	public function test_a_bare_nonexistent_path_is_a_placeholder(): void {
		list( , $type ) = $this->determine_source_type( trailingslashit( ABSPATH ) . 'this-file-does-not-exist.mp4' );

		$this->assertSame( 'placeholder', $type );
	}

	/**
	 * Security check for the non-URL branch: an absolute path outside
	 * ABSPATH, even one that genuinely exists on disk, must never be
	 * treated as a real local file.
	 */
	public function test_a_bare_existing_path_outside_abspath_is_a_placeholder(): void {
		list( , $type ) = $this->determine_source_type( '/etc/hostname' );

		$this->assertSame( 'placeholder', $type );
	}

	// -----------------------------------------------------------------
	// normalize_path() -- the containment logic in isolation.
	// -----------------------------------------------------------------

	public function test_normalize_path_collapses_dot_dot_segments(): void {
		$this->assertSame( '/a/c', $this->normalize_path( '/a/b/../c' ) );
	}

	public function test_normalize_path_collapses_dot_segments(): void {
		$this->assertSame( '/a/b', $this->normalize_path( '/a/./b' ) );
	}

	public function test_normalize_path_cannot_go_above_root(): void {
		$this->assertSame( '/bar', $this->normalize_path( '/foo/../../bar' ) );
	}

	public function test_normalize_path_preserves_a_relative_path_as_relative(): void {
		$this->assertSame( 'a/c', $this->normalize_path( 'a/b/../c' ) );
	}

	public function test_normalize_path_normalizes_backslashes_to_forward_slashes(): void {
		$this->assertSame( '/a/b', $this->normalize_path( '\\a\\b' ) );
	}
}
