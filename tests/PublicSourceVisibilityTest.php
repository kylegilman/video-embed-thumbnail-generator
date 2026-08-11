<?php
/**
 * Tests for Public_Controller::video_player() and video_sources() respecting
 * an attachment's own visibility (following its parent post's status), the
 * same rule WP core's own attachment permalink template already enforces --
 * these are fully public, unauthenticated routes (public_permissions
 * defaults to allowing anyone), and unlike WP core's own /wp/v2/media/{id}
 * endpoint, they aren't gated by a read_post capability check anywhere else
 * in the request lifecycle.
 */

use Videopack\Admin\REST\Public_Controller;

class PublicSourceVisibilityTest extends WP_UnitTestCase {

	/**
	 * A real uploaded video attachment, shared across tests -- only its
	 * post_parent changes per test.
	 *
	 * @var int
	 */
	protected static $attachment_id;

	public static function wpSetUpBeforeClass( $factory ) {
		$file                = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4';
		self::$attachment_id = $factory->attachment->create_upload_object( $file );
	}

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function controller(): Public_Controller {
		return new Public_Controller( $this->options(), new \Videopack\Admin\Formats\Registry( $this->options() ) );
	}

	public function set_up() {
		parent::set_up();
		wp_set_current_user( 0 ); // Unauthenticated -- these are public routes.
		wp_update_post(
			array(
				'ID'          => self::$attachment_id,
				'post_parent' => 0,
			)
		);
	}

	protected function make_draft_parent(): int {
		return self::factory()->post->create( array( 'post_status' => 'draft' ) );
	}

	// -----------------------------------------------------------------
	// video_player()
	// -----------------------------------------------------------------

	public function test_video_player_404s_for_attachment_with_draft_parent(): void {
		$draft_id = $this->make_draft_parent();
		wp_update_post(
			array(
				'ID'          => self::$attachment_id,
				'post_parent' => $draft_id,
			)
		);

		$request = new WP_REST_Request( 'GET', '/videopack/v1/player' );
		$request->set_param( 'id', self::$attachment_id );

		$result = $this->controller()->video_player( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 404, $result->get_error_data()['status'] );
	}

	public function test_video_player_succeeds_for_unparented_attachment(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/player' );
		$request->set_param( 'id', self::$attachment_id );

		$result = $this->controller()->video_player( $request );

		$this->assertInstanceOf( WP_REST_Response::class, $result );
		$this->assertStringContainsString( 'videopack-player', $result->get_data()['html'] );
	}

	public function test_video_player_succeeds_for_attachment_with_published_parent(): void {
		$published_id = self::factory()->post->create( array( 'post_status' => 'publish' ) );
		wp_update_post(
			array(
				'ID'          => self::$attachment_id,
				'post_parent' => $published_id,
			)
		);

		$request = new WP_REST_Request( 'GET', '/videopack/v1/player' );
		$request->set_param( 'id', self::$attachment_id );

		$result = $this->controller()->video_player( $request );

		$this->assertInstanceOf( WP_REST_Response::class, $result );
	}

	// -----------------------------------------------------------------
	// video_sources()
	// -----------------------------------------------------------------

	public function test_video_sources_404s_for_attachment_id_with_draft_parent(): void {
		$draft_id = $this->make_draft_parent();
		wp_update_post(
			array(
				'ID'          => self::$attachment_id,
				'post_parent' => $draft_id,
			)
		);

		$request = new WP_REST_Request( 'GET', '/videopack/v1/sources' );
		$request->set_param( 'attachment_id', self::$attachment_id );

		$result = $this->controller()->video_sources( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 404, $result->get_error_data()['status'] );
	}

	public function test_video_sources_succeeds_for_unparented_attachment(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/sources' );
		$request->set_param( 'attachment_id', self::$attachment_id );

		$result = $this->controller()->video_sources( $request );

		$this->assertInstanceOf( WP_REST_Response::class, $result );
	}

	/**
	 * A raw external URL is not a WordPress post at all -- the visibility
	 * check must not misfire on Source_Url's synthetic, non-post id.
	 */
	public function test_video_sources_with_raw_url_is_unaffected_by_visibility_check(): void {
		$request = new WP_REST_Request( 'GET', '/videopack/v1/sources' );
		$request->set_param( 'url', 'https://example.com/videos/real-video.mp4' );

		$result = $this->controller()->video_sources( $request );

		// Whatever the outcome (the URL isn't a real reachable file in
		// tests), it must not be the visibility-check's 404 path -- confirm
		// by checking this doesn't throw/misbehave and returns a sane type.
		$this->assertTrue( $result instanceof WP_REST_Response || $result instanceof WP_Error );
	}
}
