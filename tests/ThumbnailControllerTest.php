<?php
/**
 * Tests for Thumbnail_Controller::thumb_upload_save() and thumb_save() --
 * the two callbacks on this controller with no dedicated coverage anywhere
 * (thumb_generate()'s playlist rejection has its own coverage in
 * ThumbGeneratePlaylistRejectionTest, and get_thumbnail_candidates() is
 * exercised via AttachmentProcessorTest).
 *
 * The real-upload success path of thumb_upload_save() can't be exercised
 * here: FFmpeg_Thumbnails::stage_uploaded_file_as_temp() gates on PHP's own
 * is_uploaded_file()/move_uploaded_file(), which only ever return true for
 * a file that arrived via a genuine HTTP multipart upload -- never true in
 * a CLI test process no matter what's in the $_FILES-shaped array, so only
 * its guard clauses and the resulting failure path are covered.
 *
 * thumb_save() takes thumbnail URLs rather than uploaded files, so its
 * empty-URL short-circuit (FFmpeg_Thumbnails::save() returns immediately
 * without any network access when given an empty thumb_url) is a real,
 * deterministic path worth exercising directly -- including the
 * single-vs-multiple-URLs force_set_poster distinction this controller
 * documents in its own comments.
 */

use Videopack\Admin\REST\Thumbnail_Controller;
use Videopack\Admin\Formats\Registry;
use Videopack\Admin\Attachment_Meta;

class ThumbnailControllerTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function controller(): Thumbnail_Controller {
		return new Thumbnail_Controller( $this->options(), new Registry( $this->options() ) );
	}

	protected function video_attachment( array $overrides = array() ): int {
		return self::factory()->attachment->create_object(
			array_merge(
				array( 'post_mime_type' => 'video/mp4' ),
				$overrides
			)
		);
	}

	// -----------------------------------------------------------------
	// thumb_upload_save()
	// -----------------------------------------------------------------

	public function test_thumb_upload_save_requires_a_file(): void {
		$request = new WP_REST_Request( 'POST', '/videopack/v1/thumbs/upload' );
		$request->set_param( 'attachment_id', 0 );

		$result = $this->controller()->thumb_upload_save( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'missing_file', $result->get_error_code() );
	}

	public function test_thumb_upload_save_blocks_a_user_without_edit_permission_on_the_attachment(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = $this->video_attachment( array( 'post_author' => $owner_id ) );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'subscriber' ) ) );

		$request = new WP_REST_Request( 'POST', '/videopack/v1/thumbs/upload' );
		$request->set_param( 'attachment_id', $attachment_id );
		$request->set_file_params(
			array(
				'file' => array(
					'tmp_name' => '/tmp/fake',
					'name'     => 'thumb.jpg',
				),
			)
		);

		$result = $this->controller()->thumb_upload_save( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_cannot_edit', $result->get_error_code() );
	}

	public function test_thumb_upload_save_fails_for_a_file_that_was_not_really_uploaded(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$attachment_id = $this->video_attachment( array( 'post_author' => $owner_id ) );
		wp_set_current_user( $owner_id );

		$request = new WP_REST_Request( 'POST', '/videopack/v1/thumbs/upload' );
		$request->set_param( 'attachment_id', $attachment_id );
		$request->set_param( 'post_name', 'my-thumb' );
		$request->set_file_params(
			array(
				'file' => array(
					'tmp_name' => '/tmp/fake',
					'name'     => 'thumb.jpg',
					'error'    => 0,
				),
			)
		);

		$result = $this->controller()->thumb_upload_save( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'upload_failed', $result->get_error_code() );
	}

	public function test_thumb_upload_save_requires_a_url_without_an_attachment_id(): void {
		$request = new WP_REST_Request( 'POST', '/videopack/v1/thumbs/upload' );
		$request->set_param( 'attachment_id', 0 );
		$request->set_file_params(
			array(
				'file' => array(
					'tmp_name' => '/tmp/fake',
					'name'     => 'thumb.jpg',
				),
			)
		);

		$result = $this->controller()->thumb_upload_save( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'missing_source', $result->get_error_code() );
	}

	public function test_thumb_upload_save_blocks_a_user_without_edit_permission_on_an_explicit_parent(): void {
		$parent_id = self::factory()->post->create();
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'subscriber' ) ) );

		$request = new WP_REST_Request( 'POST', '/videopack/v1/thumbs/upload' );
		$request->set_param( 'attachment_id', 0 );
		$request->set_param( 'parent_id', $parent_id );
		$request->set_param( 'url', 'https://example.test/video.mp4' );
		$request->set_file_params(
			array(
				'file' => array(
					'tmp_name' => '/tmp/fake',
					'name'     => 'thumb.jpg',
				),
			)
		);

		$result = $this->controller()->thumb_upload_save( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_cannot_edit', $result->get_error_code() );
	}

	// -----------------------------------------------------------------
	// thumb_save()
	// -----------------------------------------------------------------

	public function test_thumb_save_blocks_a_user_without_edit_permission_on_the_attachment(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'author' ) );
		$attachment_id = $this->video_attachment( array( 'post_author' => $owner_id ) );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'subscriber' ) ) );

		$request = new WP_REST_Request( 'POST', '/videopack/v1/thumbs' );
		$request->set_param( 'attachment_id', $attachment_id );
		$request->set_param( 'thumb_urls', array( '' ) );

		$result = $this->controller()->thumb_save( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
	}

	public function test_thumb_save_requires_a_url_without_an_attachment_id(): void {
		$request = new WP_REST_Request( 'POST', '/videopack/v1/thumbs' );
		$request->set_param( 'attachment_id', 0 );
		$request->set_param( 'thumb_urls', array( '' ) );

		$result = $this->controller()->thumb_save( $request );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'missing_source', $result->get_error_code() );
	}

	public function test_thumb_save_returns_one_result_per_thumb_url(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$attachment_id = $this->video_attachment( array( 'post_author' => $owner_id ) );
		wp_set_current_user( $owner_id );

		$request = new WP_REST_Request( 'POST', '/videopack/v1/thumbs' );
		$request->set_param( 'attachment_id', $attachment_id );
		$request->set_param( 'thumb_urls', array( '', '' ) );

		$response = $this->controller()->thumb_save( $request );

		$this->assertInstanceOf( WP_REST_Response::class, $response );
		$this->assertCount( 2, $response->get_data() );
		foreach ( $response->get_data() as $result ) {
			$this->assertSame( $attachment_id, $result['attachment_id'] );
			$this->assertFalse( $result['thumb_id'] );
		}
	}

	/**
	 * A single-item save is the explicit "set this as my poster" case, so an
	 * empty/unresolvable thumbnail clears the existing poster --
	 * FFmpeg_Thumbnails::assign_thumbnail_to_video()'s own documented
	 * behavior for force_set_poster=true with no thumb_id.
	 */
	public function test_thumb_save_with_a_single_empty_url_clears_the_existing_poster(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$attachment_id = $this->video_attachment( array( 'post_author' => $owner_id ) );
		wp_set_current_user( $owner_id );
		$poster_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'image/jpeg' ) );
		( new Attachment_Meta( $this->options(), $attachment_id ) )->set_poster( 'https://example.test/poster.jpg', $poster_id );

		$request = new WP_REST_Request( 'POST', '/videopack/v1/thumbs' );
		$request->set_param( 'attachment_id', $attachment_id );
		$request->set_param( 'thumb_urls', array( '' ) );

		$this->controller()->thumb_save( $request );

		$this->assertSame( 0, ( new Attachment_Meta( $this->options(), $attachment_id ) )->get_poster_id() );
	}

	/**
	 * A multi-item save must not reassign the poster to whichever entry
	 * happens to resolve last -- so an empty/unresolvable entry among
	 * several leaves an existing poster alone.
	 */
	public function test_thumb_save_with_multiple_urls_does_not_touch_an_existing_poster(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$attachment_id = $this->video_attachment( array( 'post_author' => $owner_id ) );
		wp_set_current_user( $owner_id );
		$poster_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'image/jpeg' ) );
		( new Attachment_Meta( $this->options(), $attachment_id ) )->set_poster( 'https://example.test/poster.jpg', $poster_id );

		$request = new WP_REST_Request( 'POST', '/videopack/v1/thumbs' );
		$request->set_param( 'attachment_id', $attachment_id );
		$request->set_param( 'thumb_urls', array( '', '' ) );

		$this->controller()->thumb_save( $request );

		$this->assertSame( $poster_id, ( new Attachment_Meta( $this->options(), $attachment_id ) )->get_poster_id() );
	}

	public function test_thumb_save_response_is_filterable(): void {
		$owner_id      = self::factory()->user->create( array( 'role' => 'administrator' ) );
		$attachment_id = $this->video_attachment( array( 'post_author' => $owner_id ) );
		wp_set_current_user( $owner_id );
		add_filter(
			'videopack_rest_thumb_save',
			static function ( $response ) {
				$response->set_data( array( 'overridden' => true ) );
				return $response;
			}
		);

		$request = new WP_REST_Request( 'POST', '/videopack/v1/thumbs' );
		$request->set_param( 'attachment_id', $attachment_id );
		$request->set_param( 'thumb_urls', array( '' ) );
		$response = $this->controller()->thumb_save( $request );
		remove_all_filters( 'videopack_rest_thumb_save' );

		$this->assertSame( array( 'overridden' => true ), $response->get_data() );
	}
}
