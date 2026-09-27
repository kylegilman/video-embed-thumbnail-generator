<?php
/**
 * Tests for Attachment_Controller -- resolving/registering external video
 * URLs, clearing a source's cached URL-existence checks, reporting whether
 * the master source's own reachability check is cached, and deleting a
 * single encoded format. formats_get()'s playlist/manifest rejection
 * already has dedicated coverage in FormatsGetPlaylistRejectionTest; this
 * covers everything else, previously untested.
 */

use Videopack\Admin\REST\Attachment_Controller;
use Videopack\Admin\Formats\Registry;

class AttachmentControllerTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function controller(): Attachment_Controller {
		return new Attachment_Controller( $this->options(), new Registry( $this->options() ) );
	}

	public function set_up() {
		parent::set_up();
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		( new WP_User( $admin_id ) )->add_cap( 'encode_videos' );
		wp_set_current_user( $admin_id );
		( new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options() ) )->add_table();
	}

	// -----------------------------------------------------------------
	// register_routes()
	// -----------------------------------------------------------------

	public function test_registers_all_expected_routes(): void {
		do_action( 'rest_api_init' );
		$this->controller()->register_routes();
		$routes = rest_get_server()->get_routes();

		$this->assertArrayHasKey( '/videopack/v1/attachment/register-url', $routes );
		$this->assertArrayHasKey( '/videopack/v1/attachment/(?P<id>\d+)/formats', $routes );
		$this->assertArrayHasKey( '/videopack/v1/attachment/(?P<id>\d+)/format/(?P<format_id>[a-zA-Z0-9_-]+)', $routes );
		$this->assertArrayHasKey( '/videopack/v1/attachment/(?P<id>\d+)/cache', $routes );
		$this->assertArrayHasKey( '/videopack/v1/attachment/(?P<id>\d+)/source-status', $routes );
	}

	// -----------------------------------------------------------------
	// register_url()
	// -----------------------------------------------------------------

	protected function register_url_request( string $url, int $parent_id = 0, bool $create = false ): WP_REST_Request {
		$request = new WP_REST_Request( 'POST', '/videopack/v1/attachment/register-url' );
		$request->set_param( 'url', $url );
		$request->set_param( 'parent_id', $parent_id );
		$request->set_param( 'create', $create );
		return $request;
	}

	public function test_register_url_rejects_a_missing_url(): void {
		$result = $this->controller()->register_url( $this->register_url_request( '' ) );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'missing_url', $result->get_error_code() );
	}

	public function test_register_url_returns_an_existing_matching_attachment_without_duplicating_it(): void {
		$url           = 'https://example.test/video.mp4';
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'video/mp4' ) );
		update_post_meta( $attachment_id, '_kgflashmediaplayer-externalurl', $url );

		$response = $this->controller()->register_url( $this->register_url_request( $url ) );

		$this->assertSame( $attachment_id, $response->get_data()['attachment_id'] );
	}

	public function test_register_url_with_create_false_and_no_match_resolves_to_zero(): void {
		$response = $this->controller()->register_url( $this->register_url_request( 'https://example.test/unregistered.mp4' ) );

		$this->assertSame( 0, $response->get_data()['attachment_id'] );
	}

	public function test_register_url_with_create_true_creates_a_new_remote_attachment(): void {
		$url = 'https://example.test/brand-new-video.mp4';

		$response = $this->controller()->register_url( $this->register_url_request( $url, 0, true ) );

		$attachment_id = $response->get_data()['attachment_id'];
		$this->assertGreaterThan( 0, $attachment_id );
		$this->assertSame( $url, get_post_meta( $attachment_id, '_kgflashmediaplayer-externalurl', true ) );
	}

	public function test_register_url_response_is_filterable(): void {
		add_filter(
			'videopack_rest_register_url',
			static function ( $response ) {
				$response->set_data( array( 'overridden' => true ) );
				return $response;
			}
		);
		$response = $this->controller()->register_url( $this->register_url_request( 'https://example.test/video.mp4' ) );
		remove_all_filters( 'videopack_rest_register_url' );

		$this->assertSame( array( 'overridden' => true ), $response->get_data() );
	}

	// -----------------------------------------------------------------
	// clear_cache_rest()
	// -----------------------------------------------------------------

	public function test_clear_cache_rest_reports_zero_cleared_for_a_source_with_nothing_cached(): void {
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'video/mp4' ) );

		$request = new WP_REST_Request( 'DELETE', "/videopack/v1/attachment/{$attachment_id}/cache" );
		$request->set_param( 'id', $attachment_id );

		$response = $this->controller()->clear_cache_rest( $request );

		$this->assertTrue( $response->get_data()['success'] );
		$this->assertSame( 0, $response->get_data()['cleared'] );
	}

	// -----------------------------------------------------------------
	// source_status_rest()
	// -----------------------------------------------------------------

	public function test_source_status_rest_is_false_with_no_id_or_url(): void {
		$request  = new WP_REST_Request( 'GET', '/videopack/v1/attachment/0/source-status' );
		$response = $this->controller()->source_status_rest( $request );

		$this->assertFalse( $response->get_data()['url_check_cached'] );
	}

	public function test_source_status_rest_is_false_for_a_local_attachment(): void {
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'video/mp4' ) );

		$request = new WP_REST_Request( 'GET', "/videopack/v1/attachment/{$attachment_id}/source-status" );
		$request->set_param( 'id', $attachment_id );

		$response = $this->controller()->source_status_rest( $request );

		$this->assertFalse( $response->get_data()['url_check_cached'] );
	}

	public function test_source_status_rest_is_false_for_an_uncached_remote_url(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/attachment/0/source-status' );
		$request->set_param( 'id', 0 );
		$request->set_param( 'url', 'https://example.test/never-checked.mp4' );

		$response = $this->controller()->source_status_rest( $request );

		$this->assertFalse( $response->get_data()['url_check_cached'] );
	}

	// -----------------------------------------------------------------
	// delete_format_by_id_rest()
	// -----------------------------------------------------------------

	public function test_delete_format_by_id_rest_requires_both_params(): void {
		$request = new WP_REST_Request( 'DELETE', '/videopack/v1/attachment/1/format/h264_720' );
		$request->set_param( 'id', 0 );
		$request->set_param( 'format_id', '' );

		$result = $this->controller()->delete_format_by_id_rest( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_invalid_param', $result->get_error_code() );
	}

	/**
	 * No formal job record and no file on disk -- Encode_Attachment::delete_format_by_id()
	 * treats this as an idempotent no-op success (there was nothing to
	 * delete, but nothing failed either), not an error.
	 */
	public function test_delete_format_by_id_rest_succeeds_as_a_noop_when_there_is_nothing_to_delete(): void {
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'video/mp4' ) );

		$request = new WP_REST_Request( 'DELETE', "/videopack/v1/attachment/{$attachment_id}/format/h264_720" );
		$request->set_param( 'id', $attachment_id );
		$request->set_param( 'format_id', 'h264_720' );

		$result = $this->controller()->delete_format_by_id_rest( $request );

		$this->assertInstanceOf( WP_REST_Response::class, $result );
		$this->assertTrue( $result->get_data()['success'] );
	}

	public function test_delete_format_by_id_rest_fails_for_an_unregistered_format_id(): void {
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'video/mp4' ) );

		$request = new WP_REST_Request( 'DELETE', "/videopack/v1/attachment/{$attachment_id}/format/not_a_real_format" );
		$request->set_param( 'id', $attachment_id );
		$request->set_param( 'format_id', 'not_a_real_format' );

		$result = $this->controller()->delete_format_by_id_rest( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_delete_failed', $result->get_error_code() );
	}

	/**
	 * No formal queue job record for this format -- delete_format_by_id()
	 * falls back to resolving the real on-disk path via Encode_Info and
	 * deleting that file directly.
	 */
	public function test_delete_format_by_id_rest_deletes_a_real_file_with_no_formal_job_record(): void {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
				'post_author'    => get_current_user_id(),
			)
		);
		$attached_file = get_attached_file( $attachment_id );
		file_put_contents( $attached_file, 'fake video content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		$registry      = new Registry( $this->options() );
		$format        = $registry->get_video_formats()['h264_720'];
		$sanitized_url = new \Videopack\Admin\Sanitize_Url( wp_get_attachment_url( $attachment_id ) );
		$encoded_path  = trailingslashit( dirname( $attached_file ) ) . $sanitized_url->basename . $format->get_suffix();
		file_put_contents( $encoded_path, 'fake encoded video' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		$request = new WP_REST_Request( 'DELETE', "/videopack/v1/attachment/{$attachment_id}/format/h264_720" );
		$request->set_param( 'id', $attachment_id );
		$request->set_param( 'format_id', 'h264_720' );

		$response = $this->controller()->delete_format_by_id_rest( $request );

		$this->assertInstanceOf( WP_REST_Response::class, $response );
		$this->assertTrue( $response->get_data()['success'] );
		$this->assertFileDoesNotExist( $encoded_path );

		wp_delete_file( $attached_file );
	}
}
