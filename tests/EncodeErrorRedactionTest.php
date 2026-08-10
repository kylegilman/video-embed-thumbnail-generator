<?php
/**
 * Tests for Controller::redact_encode_error_for_response() and its wiring
 * into Job_Controller and Attachment_Controller. FFmpeg's raw, unbounded
 * stderr output ends up in job/format 'error'/'error_message' fields
 * (Encode_Attachment::start_encode()) -- these must be redacted to a
 * generic message for any REST caller who isn't a real site admin, since
 * a merely encode_videos/upload_files-capable (but non-admin) user could
 * otherwise use crafted inputs and the returned error text as a
 * file-existence/content oracle against the server's filesystem.
 */

use Videopack\Admin\REST\Job_Controller;
use Videopack\Admin\REST\Attachment_Controller;

class EncodeErrorRedactionTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function queue_table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'videopack_encoding_queue';
	}

	public function set_up() {
		parent::set_up();
		$queue_controller = new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options() );
		$queue_controller->ensure_table_exists();
	}

	// -----------------------------------------------------------------
	// Controller::redact_encode_error_for_response() -- direct unit tests
	// -----------------------------------------------------------------

	protected function invoke_redact( array $item ) {
		$controller = new class( array(), null ) extends \Videopack\Admin\REST\Controller {
			public function register_routes() {}
			public function public_redact( array $item ): array {
				return $this->redact_encode_error_for_response( $item );
			}
		};
		return $controller->public_redact( $item );
	}

	public function test_admin_sees_full_error_detail() {
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		$result = $this->invoke_redact(
			array(
				'error'         => 'FFmpeg failed. No such file or directory: /etc/passwd',
				'error_message' => 'FFmpeg failed. No such file or directory: /etc/passwd',
			)
		);

		$this->assertSame( 'FFmpeg failed. No such file or directory: /etc/passwd', $result['error'] );
		$this->assertSame( 'FFmpeg failed. No such file or directory: /etc/passwd', $result['error_message'] );
	}

	public function test_non_admin_sees_generic_message_instead_of_raw_detail() {
		$author_id = self::factory()->user->create( array( 'role' => 'author' ) );
		wp_set_current_user( $author_id );

		$result = $this->invoke_redact(
			array(
				'error'         => 'FFmpeg failed. No such file or directory: /etc/passwd',
				'error_message' => 'FFmpeg failed. No such file or directory: /etc/passwd',
			)
		);

		$this->assertStringNotContainsString( '/etc/passwd', $result['error'] );
		$this->assertStringNotContainsString( '/etc/passwd', $result['error_message'] );
		$this->assertNotEmpty( $result['error'] );
	}

	public function test_logged_out_visitor_sees_generic_message() {
		wp_set_current_user( 0 );

		$result = $this->invoke_redact( array( 'error' => 'Invalid data found when processing input, path: /var/www/wp-config.php' ) );

		$this->assertStringNotContainsString( 'wp-config.php', $result['error'] );
	}

	public function test_empty_or_missing_error_fields_are_left_alone() {
		$author_id = self::factory()->user->create( array( 'role' => 'author' ) );
		wp_set_current_user( $author_id );

		$result = $this->invoke_redact( array( 'status' => 'completed' ) );
		$this->assertArrayNotHasKey( 'error', $result );

		$result_empty = $this->invoke_redact( array( 'error' => '' ) );
		$this->assertSame( '', $result_empty['error'] );
	}

	// -----------------------------------------------------------------
	// Job_Controller::jobs_list() -- end-to-end, real queue row
	// -----------------------------------------------------------------

	public function test_jobs_list_redacts_error_for_non_admin_but_not_for_admin() {
		global $wpdb;
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'sensitive-test.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);

		$wpdb->insert(
			$this->queue_table_name(),
			array(
				'blog_id'       => get_current_blog_id(),
				'attachment_id' => $attachment_id,
				'input_url'     => 'https://example.com/sensitive-test.mp4',
				'format_id'     => 'h264_720p',
				'status'        => 'failed',
				'error_message' => 'FFmpeg failed. No such file or directory: /etc/shadow',
			)
		);

		$controller = new Job_Controller( $this->options(), new \Videopack\Admin\Formats\Registry( $this->options() ) );
		$request    = new WP_REST_Request( 'GET', '/videopack/v1/jobs' );
		$request->set_param( 'input', $attachment_id );

		$author_id = self::factory()->user->create( array( 'role' => 'author' ) );
		wp_set_current_user( $author_id );
		$non_admin_response = $controller->jobs_list( $request );
		$non_admin_jobs      = $non_admin_response->get_data();

		$this->assertNotEmpty( $non_admin_jobs );
		$this->assertStringNotContainsString( '/etc/shadow', $non_admin_jobs[0]['error'] );

		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );
		$admin_response = $controller->jobs_list( $request );
		$admin_jobs      = $admin_response->get_data();

		$this->assertStringContainsString( '/etc/shadow', $admin_jobs[0]['error'] );
	}
}
