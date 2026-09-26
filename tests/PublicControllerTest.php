<?php
/**
 * Tests for Public_Controller -- the public-facing video_player(),
 * video_sources(), presets_get(), the attachment REST field
 * (prepare_data_for_rest_response()), and log_rest_api_errors()'s
 * namespace filtering. Previously completely untested.
 */

use Videopack\Admin\REST\Public_Controller;
use Videopack\Admin\Formats\Registry;

class PublicControllerTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function controller(): Public_Controller {
		$options = $this->options();
		return new Public_Controller( $options, new Registry( $options ) );
	}

	/**
	 * @var string[] Files created during a test, cleaned up in tear_down().
	 */
	protected $temp_files = array();

	public function tear_down() {
		foreach ( $this->temp_files as $file ) {
			if ( file_exists( $file ) ) {
				wp_delete_file( $file );
			}
		}
		$this->temp_files = array();
		parent::tear_down();
	}

	/**
	 * Source_Attachment::exists() requires the file to actually exist on
	 * disk (get_attached_file() + file_exists()) -- the attachment factory
	 * only sets postmeta, so a real file has to be written for anything
	 * exercising the "source exists" path.
	 */
	protected function video_attachment( array $overrides = array() ): int {
		$attachment_id = self::factory()->attachment->create_object(
			array_merge(
				array(
					'file'           => 'video.mp4',
					'post_mime_type' => 'video/mp4',
				),
				$overrides
			)
		);
		$attached_file       = get_attached_file( $attachment_id );
		$this->temp_files[] = $attached_file;
		file_put_contents( $attached_file, 'fake video content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		return $attachment_id;
	}

	// -----------------------------------------------------------------
	// video_player()
	// -----------------------------------------------------------------

	public function test_video_player_requires_an_id(): void {
		$result = $this->controller()->video_player( new WP_REST_Request( 'GET', '/videopack/v1/player' ) );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_invalid_param', $result->get_error_code() );
		$this->assertSame( 400, $result->get_error_data()['status'] );
	}

	public function test_video_player_404s_for_a_nonexistent_id(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/player' );
		$request->set_param( 'id', 999999999 );

		$result = $this->controller()->video_player( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_source_not_found', $result->get_error_code() );
		$this->assertSame( 404, $result->get_error_data()['status'] );
	}

	public function test_video_player_404s_for_an_attachment_whose_parent_is_not_publicly_viewable(): void {
		$private_post_id = self::factory()->post->create( array( 'post_status' => 'private' ) );
		$attachment_id    = $this->video_attachment( array( 'post_parent' => $private_post_id ) );

		$request = new WP_REST_Request( 'GET', '/videopack/v1/player' );
		$request->set_param( 'id', $attachment_id );

		$result = $this->controller()->video_player( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_source_not_found', $result->get_error_code() );
	}

	public function test_video_player_returns_html_for_a_public_attachment(): void {
		$attachment_id = $this->video_attachment();

		$request = new WP_REST_Request( 'GET', '/videopack/v1/player' );
		$request->set_param( 'id', $attachment_id );

		$response = $this->controller()->video_player( $request );

		$this->assertInstanceOf( WP_REST_Response::class, $response );
		$this->assertSame( 200, $response->get_status() );
		$this->assertArrayHasKey( 'html', $response->get_data() );
	}

	public function test_video_player_response_is_filterable(): void {
		$attachment_id = $this->video_attachment();
		$request       = new WP_REST_Request( 'GET', '/videopack/v1/player' );
		$request->set_param( 'id', $attachment_id );

		add_filter(
			'videopack_rest_video_player',
			static function ( $response ) {
				$response->set_data( array( 'html' => 'overridden' ) );
				return $response;
			}
		);
		$response = $this->controller()->video_player( $request );
		remove_all_filters( 'videopack_rest_video_player' );

		$this->assertSame( array( 'html' => 'overridden' ), $response->get_data() );
	}

	// -----------------------------------------------------------------
	// video_sources()
	// -----------------------------------------------------------------

	public function test_video_sources_requires_a_url_or_attachment_id(): void {
		$result = $this->controller()->video_sources( new WP_REST_Request( 'GET', '/videopack/v1/sources' ) );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_invalid_param', $result->get_error_code() );
	}

	public function test_video_sources_404s_for_a_nonexistent_attachment(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/sources' );
		$request->set_param( 'attachment_id', 999999999 );

		$result = $this->controller()->video_sources( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_source_not_found', $result->get_error_code() );
	}

	public function test_video_sources_404s_for_an_attachment_whose_parent_is_not_publicly_viewable(): void {
		$private_post_id = self::factory()->post->create( array( 'post_status' => 'private' ) );
		$attachment_id    = $this->video_attachment( array( 'post_parent' => $private_post_id ) );

		$request = new WP_REST_Request( 'GET', '/videopack/v1/sources' );
		$request->set_param( 'attachment_id', $attachment_id );

		$result = $this->controller()->video_sources( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_source_not_found', $result->get_error_code() );
	}

	public function test_video_sources_returns_sources_for_a_public_attachment(): void {
		$attachment_id = $this->video_attachment();

		$request = new WP_REST_Request( 'GET', '/videopack/v1/sources' );
		$request->set_param( 'attachment_id', $attachment_id );

		$response = $this->controller()->video_sources( $request );

		$this->assertInstanceOf( WP_REST_Response::class, $response );
		$this->assertSame( 200, $response->get_status() );
	}

	// -----------------------------------------------------------------
	// presets_get()
	// -----------------------------------------------------------------

	public function test_presets_get_includes_id_and_a_null_attachment_id_for_every_enabled_format(): void {
		$options  = $this->options( array( 'replace_format' => 'h264_1080' ) );
		$registry = new Registry( $options );
		$expected_ids = array_keys( $registry->get_video_formats( true ) );

		$controller = new Public_Controller( $options, $registry );
		$response   = $controller->presets_get( new WP_REST_Request( 'GET', '/videopack/v1/presets' ) );
		$data       = $response->get_data();

		$this->assertNotEmpty( $data );
		foreach ( $data as $preset ) {
			$this->assertContains( $preset['id'], $expected_ids );
			$this->assertNull( $preset['attachment_id'] );
		}
	}

	// -----------------------------------------------------------------
	// prepare_data_for_rest_response()
	// -----------------------------------------------------------------

	protected function prepare_data_for_rest_response( Public_Controller $controller, array $post ) {
		$method = new ReflectionMethod( $controller, 'prepare_data_for_rest_response' );
		$method->setAccessible( true );
		return $method->invoke( $controller, $post );
	}

	public function test_prepare_data_returns_full_player_data_for_a_real_video(): void {
		$attachment_id = $this->video_attachment();

		$data = $this->prepare_data_for_rest_response( $this->controller(), array( 'id' => $attachment_id ) );

		$this->assertArrayHasKey( 'sources', $data );
		$this->assertArrayHasKey( 'source_groups', $data );
		$this->assertArrayHasKey( 'views', $data );
		$this->assertArrayHasKey( 'duration', $data );
	}

	/**
	 * Source_Factory::create() never actually returns null in practice --
	 * determine_source_type() always resolves to one of exactly four
	 * types, and Source_Factory::create()'s switch handles all four -- so
	 * prepare_data_for_rest_response()'s own "if ( ! $source )" fallback
	 * is unreachable dead code; a non-attachment post id still resolves to
	 * a real Source_Placeholder instance. This documents that actual
	 * behavior (a placeholder with no real metadata) rather than the
	 * fallback the code appears to guard against, and is also the
	 * regression test for Source::set_duration() -- a placeholder's empty
	 * metadata has no 'duration' key, which used to throw an "Undefined
	 * array key" warning there.
	 */
	public function test_prepare_data_for_a_non_attachment_post_resolves_to_a_placeholder_not_a_fallback(): void {
		$post_id = self::factory()->post->create();

		$data = $this->prepare_data_for_rest_response( $this->controller(), array( 'id' => $post_id ) );

		$this->assertArrayHasKey( 'duration', $data );
		$this->assertSame( 0.0, $data['duration'] );
	}

	// -----------------------------------------------------------------
	// log_rest_api_errors()
	// -----------------------------------------------------------------

	public function test_log_rest_api_errors_ignores_routes_outside_this_plugins_namespace(): void {
		$request = new WP_REST_Request( 'GET', '/some-other-plugin/v1/thing' );
		$result  = new WP_Error( 'some_error', 'boom' );

		$returned = $this->controller()->log_rest_api_errors( $result, rest_get_server(), $request );

		$this->assertSame( $result, $returned );
	}

	public function test_log_rest_api_errors_passes_through_a_non_error_result(): void {
		$request  = new WP_REST_Request( 'GET', '/videopack/v1/presets' );
		$response = new WP_REST_Response( array( 'ok' => true ), 200 );

		$returned = $this->controller()->log_rest_api_errors( $response, rest_get_server(), $request );

		$this->assertSame( $response, $returned );
	}

	public function test_log_rest_api_errors_returns_the_wp_error_unchanged_for_this_plugins_namespace(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/presets' );
		$result  = new WP_Error( 'some_error', 'boom' );

		$returned = $this->controller()->log_rest_api_errors( $result, rest_get_server(), $request );

		$this->assertSame( $result, $returned );
	}
}
