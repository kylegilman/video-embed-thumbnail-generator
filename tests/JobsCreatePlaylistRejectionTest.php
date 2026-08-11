<?php
/**
 * Tests for Job_Controller::jobs_create()'s playlist/manifest rejection.
 * HLS/DASH/Smooth Streaming/HDS playlist URLs are not a genuinely
 * supported encode input (the plugin's presets expect one discrete video
 * file), and accepting them is also the specific mechanism that lets
 * ffmpeg's playlist demuxers make secondary, attacker-chosen requests
 * embedded in the fetched content (a real, historically-exploited class of
 * ffmpeg SSRF -- e.g. CVE-2016-1897, CVE-2023-6603).
 */

use Videopack\Admin\REST\Job_Controller;

class JobsCreatePlaylistRejectionTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function controller(): Job_Controller {
		return new Job_Controller( $this->options(), new \Videopack\Admin\Formats\Registry( $this->options() ) );
	}

	public function set_up() {
		parent::set_up();
		$admin_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $admin_id );

		// add_table() (dbDelta-based, idempotent) rather than
		// ensure_table_exists() -- the latter caches its existence check in
		// a method-static variable that persists across test classes within
		// the same PHPUnit process, so it can short-circuit here based on
		// another class's earlier call.
		( new \Videopack\Admin\Encode\Encode_Queue_Controller( $this->options() ) )->add_table();
	}

	public function playlist_url_provider(): array {
		return array(
			'HLS playlist'                => array( 'https://example.com/video/master.m3u8' ),
			'legacy HLS playlist'         => array( 'https://example.com/video/master.m3u' ),
			'DASH manifest'               => array( 'https://example.com/video/manifest.mpd' ),
			'Smooth Streaming manifest'   => array( 'https://example.com/video/manifest.ism' ),
			'Smooth Streaming isml'       => array( 'https://example.com/video/manifest.isml' ),
			'HDS manifest'                => array( 'https://example.com/video/manifest.f4m' ),
			'uppercase extension'         => array( 'https://example.com/video/MASTER.M3U8' ),
			'extension with query string' => array( 'https://example.com/video/master.m3u8?token=abc123' ),
		);
	}

	/**
	 * @dataProvider playlist_url_provider
	 */
	public function test_playlist_urls_are_rejected( string $url ): void {
		$request = new WP_REST_Request( 'POST', '/videopack/v1/jobs' );
		$request->set_param( 'input', $url );
		$request->set_param( 'outputs', array( 'h264_720p' ) );

		$result = $this->controller()->jobs_create( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'unsupported_input_type', $result->get_error_code() );
	}

	public function test_normal_video_url_is_not_rejected_by_playlist_check(): void {
		$request = new WP_REST_Request( 'POST', '/videopack/v1/jobs' );
		$request->set_param( 'input', 'https://example.com/video/real-video.mp4' );
		$request->set_param( 'outputs', array( 'h264_720p' ) );

		$result = $this->controller()->jobs_create( $request );

		if ( is_wp_error( $result ) ) {
			$this->assertNotSame( 'unsupported_input_type', $result->get_error_code() );
		} else {
			$this->assertInstanceOf( WP_REST_Response::class, $result );
		}
	}

	public function test_extensionless_url_is_not_rejected_by_playlist_check(): void {
		// Signed/presigned CDN URLs commonly have no extension at all --
		// these must still pass through, not be treated as playlists.
		$request = new WP_REST_Request( 'POST', '/videopack/v1/jobs' );
		$request->set_param( 'input', 'https://cdn.example.com/v/abc123xyz?token=signed' );
		$request->set_param( 'outputs', array( 'h264_720p' ) );

		$result = $this->controller()->jobs_create( $request );

		if ( is_wp_error( $result ) ) {
			$this->assertNotSame( 'unsupported_input_type', $result->get_error_code() );
		} else {
			$this->assertInstanceOf( WP_REST_Response::class, $result );
		}
	}
}
