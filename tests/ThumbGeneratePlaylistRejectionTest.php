<?php
/**
 * Tests for Thumbnail_Controller::thumb_generate()'s playlist/manifest
 * rejection. A third, independent entry point into the same underlying
 * ffmpeg probe as Job_Controller::jobs_create() and Attachment_Controller::
 * formats_get() -- generate_thumbnail_at_timecode()/
 * generate_single_thumbnail_data() construct a Video_Metadata, which runs
 * `ffmpeg -i <url>` directly against whatever the source resolves to, and
 * this route is gated only by can_make_thumbnails() (commonly delegated to
 * non-admin roles).
 */

use Videopack\Admin\REST\Thumbnail_Controller;

class ThumbGeneratePlaylistRejectionTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function controller(): Thumbnail_Controller {
		return new Thumbnail_Controller( $this->options(), new \Videopack\Admin\Formats\Registry( $this->options() ) );
	}

	public function set_up() {
		parent::set_up();
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );
	}

	public function test_raw_url_playlist_is_rejected(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/thumbs' );
		$request->set_param( 'url', 'https://example.com/video/master.m3u8' );
		$request->set_param( 'attachment_id', 0 );
		$request->set_param( 'total_thumbnails', 4 );
		$request->set_param( 'generate_button', 'manual' );

		$result = $this->controller()->thumb_generate( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'unsupported_input_type', $result->get_error_code() );
	}

	public function test_directly_uploaded_manifest_attachment_is_rejected(): void {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'master.m3u8',
				'post_mime_type' => 'application/vnd.apple.mpegurl',
			)
		);

		$request = new WP_REST_Request( 'GET', '/videopack/v1/thumbs' );
		$request->set_param( 'attachment_id', $attachment_id );
		$request->set_param( 'total_thumbnails', 4 );
		$request->set_param( 'generate_button', 'manual' );

		$result = $this->controller()->thumb_generate( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'unsupported_input_type', $result->get_error_code() );
	}

	public function test_missing_source_still_returns_its_own_error_not_playlist_error(): void {
		// No url, no attachment_id -- confirms the new check doesn't
		// misfire and mask the pre-existing "missing_source" validation.
		$request = new WP_REST_Request( 'GET', '/videopack/v1/thumbs' );
		$request->set_param( 'attachment_id', 0 );
		$request->set_param( 'total_thumbnails', 4 );
		$request->set_param( 'generate_button', 'manual' );

		$result = $this->controller()->thumb_generate( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'missing_source', $result->get_error_code() );
	}
}
