<?php
/**
 * Tests for Template -- the_content video-attachment rendering, oEmbed
 * data/template overrides, the attachment-page redirect/download gate,
 * and canonical-redirect cancellation. Previously completely untested
 * despite real branching logic: enable_redirect()'s query-var precedence
 * (including a legacy fallback and an ungated 'sample' escape hatch) is
 * exactly the kind of thing that's easy to silently invert.
 *
 * attachment()'s enable/download branches call exit() and are
 * deliberately not exercised directly here -- that would kill the test
 * process. enable_redirect() (which drives those branches) is fully
 * covered instead, plus the one attachment() path that returns cleanly.
 */

use Videopack\Frontend\Template;

class TemplateTest extends WP_UnitTestCase {

	/**
	 * A real uploaded video attachment, shared across the class.
	 *
	 * @var int
	 */
	protected static $video_id;

	public static function wpSetUpBeforeClass( $factory ) {
		$file           = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4';
		self::$video_id = $factory->attachment->create_upload_object( $file );
	}

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function template( array $options = array() ): Template {
		return new Template( $this->options( $options ) );
	}

	protected function go_to_video_attachment(): void {
		$this->go_to( get_permalink( self::$video_id ) );
	}

	protected function set_videopack_query_var( $value ): void {
		global $wp_query;
		$wp_query->query_vars['videopack'] = $value;
	}

	// -----------------------------------------------------------------
	// enable_redirect()
	// -----------------------------------------------------------------

	public function test_enable_redirect_true_for_video_attachment_with_enable_flag(): void {
		$this->go_to_video_attachment();
		$this->set_videopack_query_var( array( 'enable' => 'true' ) );

		$result = $this->template()->enable_redirect();

		$this->assertIsArray( $result );
		$this->assertSame( 'true', $result['enable'] );
	}

	public function test_enable_redirect_false_without_any_query_var(): void {
		$this->go_to_video_attachment();

		$this->assertFalse( $this->template()->enable_redirect() );
	}

	public function test_enable_redirect_true_for_download_when_click_download_enabled(): void {
		$this->go_to_video_attachment();
		$this->set_videopack_query_var( array( 'download' => 'true' ) );

		$result = $this->template( array( 'click_download' => true ) )->enable_redirect();

		$this->assertIsArray( $result );
	}

	public function test_enable_redirect_false_for_download_when_click_download_disabled(): void {
		$this->go_to_video_attachment();
		$this->set_videopack_query_var( array( 'download' => 'true' ) );

		$result = $this->template( array( 'click_download' => false ) )->enable_redirect();

		$this->assertFalse( $result );
	}

	public function test_enable_redirect_false_for_non_video_attachment(): void {
		$image_id = self::factory()->attachment->create_object( array( 'file' => 'photo.jpg', 'post_mime_type' => 'image/jpeg' ) );
		$this->go_to( get_permalink( $image_id ) );
		$this->set_videopack_query_var( array( 'enable' => 'true' ) );

		$this->assertFalse( $this->template()->enable_redirect() );
	}

	/**
	 * The 'sample' key check is a separate OR branch, not gated by
	 * is_video -- it fires even on a page that isn't a video attachment
	 * at all. Documenting the real, current behavior rather than the
	 * behavior one might assume from the surrounding video-specific logic.
	 */
	public function test_enable_redirect_true_for_sample_key_regardless_of_post_type(): void {
		$page_id = self::factory()->post->create( array( 'post_type' => 'page' ) );
		$this->go_to( get_permalink( $page_id ) );
		$this->set_videopack_query_var( array( 'sample' => '1' ) );

		$this->assertIsArray( $this->template()->enable_redirect() );
	}

	public function test_enable_redirect_falls_back_to_legacy_query_var(): void {
		$this->go_to_video_attachment();
		global $wp_query;
		$wp_query->query_vars['kgvid_video_embed'] = array( 'enable' => 'true' );

		$result = $this->template()->enable_redirect();

		$this->assertIsArray( $result );
		$this->assertSame( 'true', $result['enable'] );
	}

	public function test_enable_redirect_normalizes_a_scalar_query_var_to_enable(): void {
		$this->go_to_video_attachment();
		$this->set_videopack_query_var( 'true' ); // Not an array.

		$result = $this->template()->enable_redirect();

		$this->assertIsArray( $result );
		$this->assertSame( 'true', $result['enable'] );
	}

	// -----------------------------------------------------------------
	// redirect_canonical_attachment()
	// -----------------------------------------------------------------

	public function test_redirect_canonical_cancels_when_attachment_pages_disabled_and_redirect_enabled(): void {
		$this->go_to_video_attachment();
		$this->set_videopack_query_var( array( 'enable' => 'true' ) );
		update_option( 'wp_attachment_pages_enabled', '0' );

		$result = $this->template()->redirect_canonical_attachment( 'https://example.com/redirect-target/', 'https://example.com/requested/' );

		$this->assertSame( 'https://example.com/requested/', $result );

		delete_option( 'wp_attachment_pages_enabled' );
	}

	public function test_redirect_canonical_passes_through_when_attachment_pages_enabled(): void {
		$this->go_to_video_attachment();
		$this->set_videopack_query_var( array( 'enable' => 'true' ) );
		update_option( 'wp_attachment_pages_enabled', '1' );

		$result = $this->template()->redirect_canonical_attachment( 'https://example.com/redirect-target/', 'https://example.com/requested/' );

		$this->assertSame( 'https://example.com/redirect-target/', $result );

		delete_option( 'wp_attachment_pages_enabled' );
	}

	public function test_redirect_canonical_passes_through_when_redirect_not_enabled(): void {
		$this->go_to_video_attachment();
		update_option( 'wp_attachment_pages_enabled', '0' );

		$result = $this->template()->redirect_canonical_attachment( 'https://example.com/redirect-target/', 'https://example.com/requested/' );

		$this->assertSame( 'https://example.com/redirect-target/', $result );

		delete_option( 'wp_attachment_pages_enabled' );
	}

	// -----------------------------------------------------------------
	// attachment() -- only the clean-return path (no exit()).
	// -----------------------------------------------------------------

	public function test_attachment_returns_cleanly_when_redirect_not_enabled(): void {
		$this->go_to_video_attachment();

		$this->template()->attachment();

		$this->assertTrue( true ); // Reaching here without exit()ing is the assertion.
	}

	// -----------------------------------------------------------------
	// filter_video_attachment_content()
	// -----------------------------------------------------------------

	/**
	 * The video player HTML is prepended to whatever $content the filter
	 * actually received -- not a fresh, unfiltered read of the post's own
	 * post_content field, which would throw away whatever wpautop/
	 * wptexturize/etc already did to it earlier in the the_content chain.
	 */
	public function test_filter_video_attachment_content_prepends_player_to_passed_in_content(): void {
		$this->go_to_video_attachment();

		$result = $this->template()->filter_video_attachment_content( '<p>already-filtered content</p>' );

		$this->assertStringContainsString( '<p>already-filtered content</p>', $result );
		$this->assertNotSame( '<p>already-filtered content</p>', $result );
	}

	/**
	 * Real end-to-end check via the actual the_content filter chain (not
	 * a direct call with a hand-built string): multi-paragraph description
	 * text must come out as separate <p> tags (wpautop's normal job),
	 * not collapsed into a single <p> with raw blank lines still inside
	 * it -- which is what re-reading the unfiltered post_content field
	 * and manually wrapping it in one <p> would produce.
	 */
	public function test_filter_video_attachment_content_preserves_multi_paragraph_formatting(): void {
		wp_update_post(
			array(
				'ID'           => self::$video_id,
				'post_content' => "First paragraph.\n\nSecond paragraph.",
			)
		);
		$this->go_to_video_attachment();

		$template = $this->template();
		add_filter( 'the_content', array( $template, 'filter_video_attachment_content' ) );
		$result = apply_filters( 'the_content', get_post( self::$video_id )->post_content );
		remove_filter( 'the_content', array( $template, 'filter_video_attachment_content' ) );

		$this->assertStringContainsString( '<p>First paragraph.</p>', $result );
		$this->assertStringContainsString( '<p>Second paragraph.</p>', $result );
		// Not collapsed into one paragraph with the blank line still embedded.
		$this->assertStringNotContainsString( "First paragraph.\n\nSecond paragraph.", $result );
	}

	public function test_filter_video_attachment_content_ignores_non_video_post(): void {
		$page_id = self::factory()->post->create( array( 'post_type' => 'page' ) );
		$this->go_to( get_permalink( $page_id ) );

		$result = $this->template()->filter_video_attachment_content( 'original content' );

		$this->assertSame( 'original content', $result );
	}

	/**
	 * Guards against embedding the full player into an auto-generated
	 * excerpt -- would be wasteful and produce broken excerpt markup.
	 */
	public function test_filter_video_attachment_content_skips_excerpt_generation(): void {
		$this->go_to_video_attachment();

		add_filter(
			'get_the_excerpt',
			function ( $excerpt ) {
				return ( new Template( $this->options() ) )->filter_video_attachment_content( $excerpt );
			}
		);

		$excerpt = get_the_excerpt( self::$video_id );

		remove_all_filters( 'get_the_excerpt' );

		$this->assertStringNotContainsString( '<p>', (string) $excerpt );
	}

	// -----------------------------------------------------------------
	// change_embed_template()
	// -----------------------------------------------------------------

	public function test_change_embed_template_unchanged_when_oembed_provider_disabled(): void {
		$this->go_to_video_attachment();

		$result = $this->template( array( 'oembed_provider' => false ) )->change_embed_template( 'original-template.php' );

		$this->assertSame( 'original-template.php', $result );
	}

	public function test_change_embed_template_unchanged_without_a_video_in_content(): void {
		$page_id = self::factory()->post->create( array( 'post_content' => '<p>No video here.</p>' ) );
		$this->go_to( get_permalink( $page_id ) );

		$result = $this->template( array( 'oembed_provider' => true ) )->change_embed_template( 'original-template.php' );

		$this->assertSame( 'original-template.php', $result );
	}

	public function test_change_embed_template_replaced_when_video_found_and_provider_enabled(): void {
		$page_id = self::factory()->post->create( array( 'post_content' => '[videopack id="' . self::$video_id . '"]' ) );
		$this->go_to( get_permalink( $page_id ) );

		$result = $this->template( array( 'oembed_provider' => true ) )->change_embed_template( 'original-template.php' );

		$this->assertStringContainsString( 'embeddable-video.php', $result );
	}

	// -----------------------------------------------------------------
	// change_oembed_data()
	// -----------------------------------------------------------------

	public function test_change_oembed_data_unchanged_when_oembed_provider_disabled(): void {
		$page_id = self::factory()->post->create( array( 'post_content' => '[videopack id="' . self::$video_id . '"]' ) );
		$post    = get_post( $page_id );

		$result = $this->template( array( 'oembed_provider' => false ) )->change_oembed_data( array( 'type' => 'rich' ), $post, 640, 360 );

		$this->assertSame( 'rich', $result['type'] );
		$this->assertArrayNotHasKey( 'html', $result );
	}

	public function test_change_oembed_data_populates_video_fields(): void {
		$page_id = self::factory()->post->create( array( 'post_content' => '[videopack id="' . self::$video_id . '"]' ) );
		$post    = get_post( $page_id );

		$result = $this->template( array( 'oembed_provider' => true ) )->change_oembed_data( array( 'type' => 'rich' ), $post, 640, 360 );

		$this->assertSame( 'video', $result['type'] );
		$this->assertSame( '1.0', $result['version'] );
		$this->assertStringContainsString( '<iframe', $result['html'] );
		$this->assertStringContainsString( 'attachment_id=' . self::$video_id, $result['html'] );
	}

	/**
	 * The iframe title is built from the video/post title via sprintf and
	 * echoed into an HTML attribute -- esc_attr() must hold even when the
	 * title contains characters that would otherwise break out of the
	 * attribute.
	 */
	public function test_change_oembed_data_escapes_title_in_iframe_html(): void {
		$page_id = self::factory()->post->create(
			array(
				'post_title'   => 'A "Malicious" <script>alert(1)</script> Title',
				'post_content' => '[videopack id="' . self::$video_id . '"]',
			)
		);
		$post = get_post( $page_id );

		$result = $this->template( array( 'oembed_provider' => true ) )->change_oembed_data( array( 'type' => 'rich' ), $post, 640, 360 );

		$this->assertStringNotContainsString( '<script>alert(1)</script>', $result['html'] );
		$this->assertStringNotContainsString( '"Malicious"', $result['html'] );
	}

	// -----------------------------------------------------------------
	// readfile_chunked()
	// -----------------------------------------------------------------

	protected function write_temp_file( string $contents ): string {
		$path = wp_tempnam( 'videopack-template-test' );
		file_put_contents( $path, $contents );
		return $path;
	}

	public function test_readfile_chunked_returns_false_for_missing_file(): void {
		$result = $this->template()->readfile_chunked( '/nonexistent/path/to/file.mp4' );
		$this->assertFalse( $result );
	}

	/**
	 * readfile_chunked() calls ob_flush()/flush() itself as it streams
	 * (by design, for large-file delivery), which pushes bytes out of any
	 * wrapping ob_start() buffer as it goes rather than leaving them to
	 * collect there -- so the returned byte count (its own independent
	 * tally), not a captured output string, is the reliable thing to
	 * assert here.
	 */
	public function test_readfile_chunked_streams_full_file_and_returns_byte_count(): void {
		$contents = str_repeat( 'a', 1000 );
		$path     = $this->write_temp_file( $contents );

		ob_start();
		$result = $this->template()->readfile_chunked( $path );
		ob_end_clean();

		unlink( $path );

		$this->assertSame( 1000, $result );
	}

	public function test_readfile_chunked_fires_logger_actions_when_logging_enabled(): void {
		$contents = 'small file contents';
		$path     = $this->write_temp_file( $contents );

		add_filter( 'videopack_file_download_logger_start', '__return_true' );
		$logged_complete = null;
		add_action(
			'videopack_file_download_logger_end',
			function ( $log, $complete ) use ( &$logged_complete ) {
				$logged_complete = $complete;
			},
			10,
			2
		);

		ob_start();
		$this->template()->readfile_chunked( $path );
		ob_end_clean();

		remove_filter( 'videopack_file_download_logger_start', '__return_true' );
		remove_all_actions( 'videopack_file_download_logger_end' );
		unlink( $path );

		$this->assertTrue( $logged_complete );
	}
}
