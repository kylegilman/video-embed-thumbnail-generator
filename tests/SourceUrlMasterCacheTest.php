<?php
/**
 * Tests for the master-URL (not per-format) reachability cache: whether
 * Encode_Attachment::clear_cached_url_checks() also clears
 * Source_Url::set_exists()'s own cached check (which gates whether
 * Player::set_sources() renders a player at all for a page visitor), and
 * Attachment_Controller::source_status_rest()'s reporting of it.
 *
 * This only applies when the source resolves to a genuine Source_Url --
 * confirmed via Source_Url.php's own class, since Source_Factory::
 * determine_source_type() resolves a same-host URL to a Source_File and
 * a bare attachment ID to a Source_Attachment, neither of which caches a
 * URL check at all. A hybrid attachment's own external URL doesn't
 * resolve back to it via Attachment::url_to_id() (WP core's
 * attachment_url_to_postid() only matches the site's own uploads
 * directory), so Player::init_source_from_atts() preferring a populated
 * URL over an attachment ID means a real page load for a hybrid
 * attachment resolves to Source_Url, not Source_Attachment.
 */

use Videopack\Admin\Encode\Encode_Attachment;
use Videopack\Admin\Encode\Encode_Queue_Controller;
use Videopack\Admin\Formats\Registry;
use Videopack\Admin\REST\Attachment_Controller;
use Videopack\Video_Source\Video_Source_Finder;

class SourceUrlMasterCacheTest extends WP_UnitTestCase {

	public function set_up() {
		parent::set_up();
		( new Encode_Queue_Controller( $this->options() ) )->add_table();
	}

	public function tear_down() {
		remove_all_filters( 'pre_http_request' );
		parent::tear_down();
	}

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function registry(): Registry {
		return new Registry( $this->options() );
	}

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

	protected function controller(): Attachment_Controller {
		return new Attachment_Controller( $this->options(), $this->registry() );
	}

	public function test_clear_cached_url_checks_also_clears_the_master_url(): void {
		$url = 'https://videos.example.test/master-cache-clear.mp4';

		$this->fake_http_404();
		Video_Source_Finder::url_exists( $url ); // Populates the cache, as a real page load would.
		$this->assertTrue( Video_Source_Finder::has_cached_url_check( $url ) );

		$encoder = new Encode_Attachment( $this->options(), $this->registry(), 0, $url );
		$encoder->clear_cached_url_checks();

		$this->assertFalse( Video_Source_Finder::has_cached_url_check( $url ) );
	}

	public function test_clear_cached_url_checks_returns_zero_when_master_url_was_never_checked(): void {
		$encoder = new Encode_Attachment( $this->options(), $this->registry(), 0, 'https://videos.example.test/never-checked-master.mp4' );

		$this->assertSame( 0, $encoder->clear_cached_url_checks() );
	}

	public function test_source_status_reports_not_cached_before_any_check(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/attachment/0/source-status' );
		$request->set_param( 'id', 0 );
		$request->set_param( 'url', 'https://videos.example.test/status-uncached.mp4' );

		$response = $this->controller()->source_status_rest( $request );

		$this->assertFalse( $response->get_data()['url_check_cached'] );
	}

	public function test_source_status_reports_cached_after_a_real_check(): void {
		$url = 'https://videos.example.test/status-cached.mp4';
		$this->fake_http_404();
		Video_Source_Finder::url_exists( $url );

		$request = new WP_REST_Request( 'GET', '/videopack/v1/attachment/0/source-status' );
		$request->set_param( 'id', 0 );
		$request->set_param( 'url', $url );

		$response = $this->controller()->source_status_rest( $request );

		$this->assertTrue( $response->get_data()['url_check_cached'] );
	}

	public function test_clear_cached_url_checks_does_not_throw_with_no_id_and_no_url(): void {
		// Reproduces a real bug: the "Re-check source URL" control can fire
		// with an empty id/url pair (e.g. a stale/unresolved block
		// attribute), which previously made Source_Factory::create() fall
		// through to Source_Placeholder, whose constructor throws on an
		// empty source -- an uncaught exception, i.e. a 500 error.
		$encoder = new Encode_Attachment( $this->options(), $this->registry(), 0, '' );

		$this->assertSame( 0, $encoder->clear_cached_url_checks() );
	}

	public function test_source_status_does_not_throw_with_no_id_and_no_url(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/attachment/0/source-status' );
		$request->set_param( 'id', 0 );
		$request->set_param( 'url', '' );

		$response = $this->controller()->source_status_rest( $request );

		$this->assertFalse( $response->get_data()['url_check_cached'] );
	}

	public function test_formats_get_rejects_no_id_and_no_url_instead_of_crashing(): void {
		// Reproduces a real bug found via direct REST calls (not reachable
		// through AdditionalFormats.js today, which always guards on `src`
		// before calling -- but the route itself had no such guard):
		// Encode_Info's constructor calls Source_Factory::create() with no
		// guard of its own, so an empty id+url pair reached Source_Placeholder,
		// whose constructor throws on an empty source -- an uncaught
		// exception, i.e. a 500 error, instead of a clean 400.
		$request = new WP_REST_Request( 'GET', '/videopack/v1/attachment/0/formats' );
		$request->set_param( 'id', 0 );

		$response = $this->controller()->formats_get( $request );

		$this->assertWPError( $response );
		$this->assertSame( 400, $response->get_error_data()['status'] );
	}

	public function test_source_status_is_never_cached_for_a_real_attachment_id_alone(): void {
		// Even if this attachment ID's own URL happens to have a cached
		// check under some other key, resolving by ID alone (no url param)
		// produces a Source_Attachment, not a Source_Url -- it has no URL
		// check of its own to report.
		$attachment_id = self::factory()->attachment->create_object( array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4' ) );

		$request = new WP_REST_Request( 'GET', "/videopack/v1/attachment/{$attachment_id}/source-status" );
		$request->set_param( 'id', $attachment_id );

		$response = $this->controller()->source_status_rest( $request );

		$this->assertFalse( $response->get_data()['url_check_cached'] );
	}
}
