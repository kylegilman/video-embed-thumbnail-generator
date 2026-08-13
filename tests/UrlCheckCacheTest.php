<?php
/**
 * Tests for the remote-URL existence-check cache introspection/clearing
 * added for an admin UI "refresh" control: Video_Source_Finder's
 * has_cached_url_check()/clear_cached_url_check(), Encode_Info's
 * checked_url/url_check_cached properties, and
 * Encode_Attachment::get_all_formats_with_status()/clear_cached_url_checks()
 * surfacing them. Unlike Cleanup::delete_transients() (a SQL LIKE scan
 * against wp_options, which finds nothing if an external object cache is
 * active), these operate on a specific known transient key via
 * get_transient()/delete_transient(), which work correctly regardless of
 * the caching backend.
 *
 * Real caching (not just an override) has to be exercised via WP core's
 * own pre_http_request short-circuit, not the 'videopack_url_exists'
 * filter -- that filter returns before url_exists() ever reaches its own
 * set_transient() call, so it can answer "does this URL exist" without
 * ever actually caching anything.
 */

use Videopack\Admin\Encode\Encode_Attachment;
use Videopack\Admin\Encode\Encode_Queue_Controller;
use Videopack\Admin\Formats\Registry;
use Videopack\Video_Source\Video_Source_Finder;

class UrlCheckCacheTest extends WP_UnitTestCase {

	public function set_up() {
		parent::set_up();
		( new Encode_Queue_Controller( $this->options() ) )->add_table();
	}

	public function tear_down() {
		remove_all_filters( 'videopack_url_exists' );
		remove_all_filters( 'pre_http_request' );
		parent::tear_down();
	}

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function registry(): Registry {
		return new Registry( $this->options() );
	}

	protected function url_encoder( string $url ): Encode_Attachment {
		return new Encode_Attachment( $this->options(), $this->registry(), 0, $url );
	}

	/**
	 * Short-circuits wp_safe_remote_head() with a fake "not found" response
	 * -- unlike the 'videopack_url_exists' filter, this lets url_exists()'s
	 * real response-handling and set_transient() call run, so a genuine
	 * cache entry gets created.
	 */
	protected function fake_http_404(): void {
		add_filter(
			'pre_http_request',
			static function () {
				return array(
					'headers'  => array(),
					'body'     => '',
					'response' => array(
						'code'    => 404,
						'message' => 'Not Found',
					),
				);
			}
		);
	}

	// -----------------------------------------------------------------
	// Video_Source_Finder primitives.
	// -----------------------------------------------------------------

	public function test_has_cached_url_check_is_false_before_any_check_ran(): void {
		$this->assertFalse( Video_Source_Finder::has_cached_url_check( 'https://videos.example.test/never-checked.mp4' ) );
	}

	public function test_has_cached_url_check_is_true_after_url_exists_ran(): void {
		$this->fake_http_404();
		$url = 'https://videos.example.test/checked-once.mp4';

		Video_Source_Finder::url_exists( $url );

		$this->assertTrue( Video_Source_Finder::has_cached_url_check( $url ) );
	}

	public function test_clear_cached_url_check_removes_it(): void {
		$this->fake_http_404();
		$url = 'https://videos.example.test/to-be-cleared.mp4';
		Video_Source_Finder::url_exists( $url );
		$this->assertTrue( Video_Source_Finder::has_cached_url_check( $url ) );

		Video_Source_Finder::clear_cached_url_check( $url );

		$this->assertFalse( Video_Source_Finder::has_cached_url_check( $url ) );
	}

	// -----------------------------------------------------------------
	// Encode_Attachment::get_all_formats_with_status() surfacing.
	// -----------------------------------------------------------------

	public function test_url_check_cached_is_false_on_the_first_status_check(): void {
		$this->fake_http_404();
		$encoder = $this->url_encoder( 'https://videos.example.test/first-check.mp4' );

		$formats = $encoder->get_all_formats_with_status();

		// Nothing was cached yet when this call started -- even though the
		// call itself just populated the cache as a side effect.
		$this->assertFalse( $formats['h264_720']['url_check_cached'] );
		$this->assertNotEmpty( $formats['h264_720']['checked_url'] );
	}

	public function test_url_check_cached_is_true_on_a_second_status_check(): void {
		$this->fake_http_404();
		$url = 'https://videos.example.test/second-check.mp4';

		$this->url_encoder( $url )->get_all_formats_with_status();
		$formats = $this->url_encoder( $url )->get_all_formats_with_status();

		$this->assertTrue( $formats['h264_720']['url_check_cached'] );
	}

	// -----------------------------------------------------------------
	// Encode_Attachment::clear_cached_url_checks().
	// -----------------------------------------------------------------

	public function test_clear_cached_url_checks_clears_everything_for_the_source(): void {
		$this->fake_http_404();
		$url = 'https://videos.example.test/to-clear-all.mp4';

		// Populate the cache for every enabled format.
		$this->url_encoder( $url )->get_all_formats_with_status();

		$cleared = $this->url_encoder( $url )->clear_cached_url_checks();
		$this->assertGreaterThan( 0, $cleared );

		// Now a fresh status check should report nothing cached again.
		$formats = $this->url_encoder( $url )->get_all_formats_with_status();
		$this->assertFalse( $formats['h264_720']['url_check_cached'] );
	}

	public function test_clear_cached_url_checks_returns_zero_when_nothing_was_ever_checked(): void {
		$encoder = $this->url_encoder( 'https://videos.example.test/never-touched.mp4' );

		$this->assertSame( 0, $encoder->clear_cached_url_checks() );
	}
}
