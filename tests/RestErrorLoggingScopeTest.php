<?php
/**
 * Tests for Public_Controller::log_rest_api_errors()'s route scoping.
 * rest_post_dispatch fires for every REST request on the site, not just
 * this plugin's own routes -- without the namespace check, this would log
 * full raw request params (potentially passwords, tokens, PII) from any
 * other plugin's failed REST endpoint into the PHP error log.
 *
 * This whole logging mechanism is debug-only and slated for removal
 * before release (see the DEBUG LOGGING comments on the method itself) --
 * this test exists to make sure the scoping doesn't regress while it's
 * still around.
 */

use Videopack\Admin\REST\Public_Controller;

class RestErrorLoggingScopeTest extends WP_UnitTestCase {

	/**
	 * @var string
	 */
	protected $original_error_log;

	/**
	 * @var string
	 */
	protected $temp_log_file;

	protected function controller(): Public_Controller {
		$options = get_option( 'videopack_options', array() );
		return new Public_Controller( $options, new \Videopack\Admin\Formats\Registry( $options ) );
	}

	public function set_up() {
		parent::set_up();
		$this->original_error_log = (string) ini_get( 'error_log' );
		$this->temp_log_file      = (string) tempnam( sys_get_temp_dir(), 'videopack-rest-log-test-' );
		ini_set( 'error_log', $this->temp_log_file ); // phpcs:ignore WordPress.PHP.IniSet.Risky, WordPress.PHP.DiscouragedPHPFunctions.runtime_configuration_ini_set
	}

	public function tear_down() {
		ini_set( 'error_log', $this->original_error_log ); // phpcs:ignore WordPress.PHP.IniSet.Risky, WordPress.PHP.DiscouragedPHPFunctions.runtime_configuration_ini_set
		if ( file_exists( $this->temp_log_file ) ) {
			wp_delete_file( $this->temp_log_file );
		}
		parent::tear_down();
	}

	public function test_errors_from_other_plugins_routes_are_not_logged(): void {
		$request = new WP_REST_Request( 'POST', '/some-other-plugin/v1/login' );
		$request->set_param( 'password', 'super-secret-value' );
		$result = new WP_Error( 'rest_forbidden', 'Invalid credentials.', array( 'status' => 403 ) );

		$this->controller()->log_rest_api_errors( $result, null, $request );

		$log_contents = (string) file_get_contents( $this->temp_log_file );
		$this->assertStringNotContainsString( 'some-other-plugin', $log_contents );
		$this->assertStringNotContainsString( 'super-secret-value', $log_contents );
	}

	public function test_errors_from_this_plugins_own_routes_are_still_logged(): void {
		$request = new WP_REST_Request( 'POST', '/videopack/v1/jobs' );
		$result  = new WP_Error( 'unsupported_input_type', 'Playlist/manifest URLs are not supported.', array( 'status' => 400 ) );

		$this->controller()->log_rest_api_errors( $result, null, $request );

		$log_contents = (string) file_get_contents( $this->temp_log_file );
		$this->assertStringContainsString( '/videopack/v1/jobs', $log_contents );
		$this->assertStringContainsString( 'Playlist/manifest URLs are not supported.', $log_contents );
	}

	public function test_non_error_results_are_returned_unchanged_and_not_logged(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/presets' );
		$result  = new WP_REST_Response( array( 'ok' => true ), 200 );

		$returned = $this->controller()->log_rest_api_errors( $result, null, $request );

		$this->assertSame( $result, $returned );
		$this->assertSame( '', (string) file_get_contents( $this->temp_log_file ) );
	}
}
