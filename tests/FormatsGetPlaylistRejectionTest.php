<?php
/**
 * Tests for Attachment_Controller::formats_get()'s playlist/manifest
 * rejection. This is a separate entry point from Job_Controller::
 * jobs_create() into the same underlying ffmpeg probe (Video_Metadata
 * runs `ffmpeg -i <url>` directly against whichever URL resolves as the
 * encode input), reachable via the weaker upload_files capability rather
 * than encode_videos -- and it can be reached either via an explicit `url`
 * request param, or via an attachment ID whose own resolved URL is a
 * playlist (e.g. a directly-uploaded .m3u8/.mpd, both allowed upload mimes
 * per Attachment::add_mime_types()).
 */

use Videopack\Admin\REST\Attachment_Controller;

class FormatsGetPlaylistRejectionTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function controller(): Attachment_Controller {
		return new Attachment_Controller( $this->options(), new \Videopack\Admin\Formats\Registry( $this->options() ) );
	}

	public function set_up() {
		parent::set_up();
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		// add_table() (dbDelta-based, idempotent) rather than
		// ensure_table_exists() -- the latter caches its existence check in
		// a method-static variable that persists across test classes within
		// the same PHPUnit process.
		( new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options() ) )->add_table();
	}

	public function test_explicit_url_param_playlist_is_rejected(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/attachment/0/formats' );
		$request->set_param( 'id', 0 );
		$request->set_param( 'url', 'https://example.com/video/master.m3u8' );

		$result = $this->controller()->formats_get( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'unsupported_input_type', $result->get_error_code() );
	}

	public function test_directly_uploaded_manifest_attachment_is_rejected_by_resolved_url(): void {
		// Mirrors a real upload: the core plugin registers m3u8/mpd as
		// allowed upload mimes (Attachment::add_mime_types()), so a user
		// can genuinely have an attachment whose own URL is a manifest,
		// with no `url` request param involved at all.
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'master.m3u8',
				'post_mime_type' => 'application/vnd.apple.mpegurl',
			)
		);

		$request = new WP_REST_Request( 'GET', "/videopack/v1/attachment/{$attachment_id}/formats" );
		$request->set_param( 'id', $attachment_id );

		$result = $this->controller()->formats_get( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'unsupported_input_type', $result->get_error_code() );
	}

	public function test_normal_video_attachment_is_not_rejected(): void {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'real-video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);

		$request = new WP_REST_Request( 'GET', "/videopack/v1/attachment/{$attachment_id}/formats" );
		$request->set_param( 'id', $attachment_id );

		$result = $this->controller()->formats_get( $request );

		if ( is_wp_error( $result ) ) {
			$this->assertNotSame( 'unsupported_input_type', $result->get_error_code() );
		} else {
			$this->assertInstanceOf( WP_REST_Response::class, $result );
		}
	}
}
