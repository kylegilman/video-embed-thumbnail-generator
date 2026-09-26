<?php
/**
 * Tests for Settings_Controller -- REST endpoints for default settings,
 * clearing the transient cache, the FFmpeg test-encode diagnostic, and
 * Freemius account/add-ons page HTML. Previously completely untested.
 */

use Videopack\Admin\REST\Settings_Controller;
use Videopack\Admin\Formats\Registry;

class SettingsControllerTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function controller(): Settings_Controller {
		return new Settings_Controller( $this->options(), new Registry( $this->options() ) );
	}

	public function set_up() {
		parent::set_up();
		do_action( 'rest_api_init' );
	}

	// -----------------------------------------------------------------
	// register_routes()
	// -----------------------------------------------------------------

	public function test_registers_all_expected_routes(): void {
		$routes = rest_get_server()->get_routes();

		$this->assertArrayHasKey( '/videopack/v1/settings/defaults', $routes );
		$this->assertArrayHasKey( '/videopack/v1/settings/cache', $routes );
		$this->assertArrayHasKey( '/videopack/v1/ffmpeg-test', $routes );
		$this->assertArrayHasKey( '/videopack/v1/freemius/(?P<page>[\w-]+)', $routes );
	}

	public function test_defaults_route_is_publicly_readable(): void {
		$route = rest_get_server()->get_routes()['/videopack/v1/settings/defaults'][0];

		$this->assertTrue( $route['methods'][ WP_REST_Server::READABLE ] ?? false );
		$this->assertSame( '__return_true', $route['permission_callback'] );
	}

	public function test_cache_route_requires_manage_options(): void {
		$route = rest_get_server()->get_routes()['/videopack/v1/settings/cache'][0];

		$this->assertIsArray( $route['permission_callback'] );
		$this->assertSame( 'can_manage_options', $route['permission_callback'][1] );
	}

	// -----------------------------------------------------------------
	// defaults()
	// -----------------------------------------------------------------

	public function test_defaults_returns_the_real_option_defaults(): void {
		$request  = new WP_REST_Request( 'GET', '/videopack/v1/settings/defaults' );
		$response = $this->controller()->defaults( $request );
		$expected = ( new \Videopack\Admin\Options() )->get_default();

		$this->assertInstanceOf( WP_REST_Response::class, $response );
		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( $expected, $response->get_data() );
	}

	public function test_defaults_response_is_filterable(): void {
		add_filter(
			'videopack_rest_defaults',
			static function ( $response ) {
				$response->set_data( array( 'overridden' => true ) );
				return $response;
			}
		);

		$response = $this->controller()->defaults( new WP_REST_Request( 'GET', '/videopack/v1/settings/defaults' ) );
		remove_all_filters( 'videopack_rest_defaults' );

		$this->assertSame( array( 'overridden' => true ), $response->get_data() );
	}

	// -----------------------------------------------------------------
	// clear_cache()
	// -----------------------------------------------------------------

	public function test_clear_cache_deletes_videopack_transients_and_reports_success(): void {
		set_transient( 'videopack_test_transient', 'value', HOUR_IN_SECONDS );

		$response = $this->controller()->clear_cache( new WP_REST_Request( 'DELETE', '/videopack/v1/settings/cache' ) );

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( array( 'success' => true ), $response->get_data() );
		$this->assertFalse( get_transient( 'videopack_test_transient' ) );
	}

	// -----------------------------------------------------------------
	// ffmpeg_test()
	// -----------------------------------------------------------------

	public function test_ffmpeg_test_rejects_an_unrecognized_format_without_needing_ffmpeg(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/ffmpeg-test' );
		$request->set_param( 'codec', 'not_a_real_codec' );
		$request->set_param( 'resolution', 'not_a_real_resolution' );

		$result = $this->controller()->ffmpeg_test( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_invalid_format', $result->get_error_code() );
		$this->assertSame( 400, $result->get_error_data()['status'] );
	}

	// -----------------------------------------------------------------
	// get_freemius_page_html()
	// -----------------------------------------------------------------

	public function test_freemius_page_html_rejects_a_page_not_in_the_known_set(): void {
		if ( ! function_exists( 'videopack_fs' ) ) {
			$this->markTestSkipped( 'Freemius SDK not loaded in this environment.' );
		}

		$request = new WP_REST_Request( 'GET', '/videopack/v1/freemius/not-a-real-page' );
		$request->set_param( 'page', 'not-a-real-page' );

		$result = $this->controller()->get_freemius_page_html( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_freemius_page', $result->get_error_code() );
		$this->assertSame( 404, $result->get_error_data()['status'] );
	}

	public function test_freemius_page_html_account_requires_a_connected_user(): void {
		if ( ! function_exists( 'videopack_fs' ) ) {
			$this->markTestSkipped( 'Freemius SDK not loaded in this environment.' );
		}
		if ( is_object( videopack_fs()->get_user() ) ) {
			$this->markTestSkipped( 'This environment already has a connected Freemius user.' );
		}

		$request = new WP_REST_Request( 'GET', '/videopack/v1/freemius/account' );
		$request->set_param( 'page', 'account' );

		$result = $this->controller()->get_freemius_page_html( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'freemius_no_user', $result->get_error_code() );
		$this->assertSame( 403, $result->get_error_data()['status'] );
	}
}
