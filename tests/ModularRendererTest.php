<?php
/**
 * Every public/private method on Modular_Renderer now has coverage here:
 * is_true(), get_svg_icon(), render_video_caption(), render_view_count(),
 * render_pagination(), render_watermark(), format_download_resolution_label(),
 * render_download_menu_list(), render_download()/render_share()'s null-source
 * guard, render_thumbnail(), render_play_button(), format_duration(),
 * render_video_title(), render_player_engine(),
 * get_player_source_groups_for_download() (a real Player against a real
 * source), and render_standalone_player_assembly() (real do_blocks()
 * rendering of a real player-container block tree, checking which optional
 * blocks -- title, download, share, view-count, watermark -- get included
 * under which options), alongside the pre-existing
 * render_video_duration()/render_video_container() coverage.
 */

use Videopack\Frontend\Modular_Renderer;
use Videopack\Admin\Attachment_Meta;
use Videopack\Video_Source\Source_Factory;
use Videopack\Admin\Formats\Registry;

class ModularRendererTest extends WP_UnitTestCase {

	public function tear_down() {
		Modular_Renderer::$rendered_lightbox_trigger = false;
		remove_all_filters( 'videopack_play_button_html' );
		foreach ( $this->temp_files_for_assembly as $file ) {
			if ( file_exists( $file ) ) {
				wp_delete_file( $file );
			}
		}
		$this->temp_files_for_assembly = array();
		parent::tear_down();
	}

	/**
	 * Data provider for testing video duration rendering and formatting.
	 *
	 * Returns arrays of: [attributes, expected_html_contains_substring]
	 *
	 * Note: Modular_Renderer::render_video_duration() takes a single, already
	 * resolved $atts array — resolving design context (colors, wrapper classes)
	 * from block/shortcode context is Blocks.php's responsibility, so
	 * style_vars/wrapper_class here are passed pre-built, not derived.
	 */
	public function duration_data_provider() {
		return array(
			// Test 1: Zero seconds should return empty string
			array(
				array( 'seconds' => 0 ),
				'',
			),
			// Test 2: Standard seconds formatting (MM:SS)
			array(
				array( 'seconds' => 75 ),
				'1:15',
			),
			// Test 3: Hour-based formatting (H:MM:SS)
			array(
				array( 'seconds' => 3665 ),
				'1:01:05',
			),
			// Test 4: Default class, position, and alignment
			array(
				array(
					'seconds'   => 90,
					'position'  => 'top',
					'textAlign' => 'right',
				),
				'class="videopack-video-duration-block videopack-video-duration position-top has-text-align-right"',
			),
			// Test 5: Inside thumbnail context (adds badge styles)
			array(
				array(
					'seconds'           => 90,
					'isInsideThumbnail' => true,
				),
				'class="videopack-video-duration-block videopack-video-duration is-overlay is-badge position-top has-text-align-right"',
			),
			// Test 6: Pre-resolved style_vars are passed through as-is
			array(
				array(
					'seconds'           => 90,
					'isInsideThumbnail' => true,
					'style_vars'        => '--videopack-title-background-color: #ff0000;--videopack-title-color: #ffffff',
				),
				'style="--videopack-title-background-color: #ff0000;--videopack-title-color: #ffffff"',
			),
		);
	}

	/**
	 * @dataProvider duration_data_provider
	 */
	public function test_render_video_duration( $atts, $expected ) {
		$output = Modular_Renderer::render_video_duration( $atts );

		if ( empty( $expected ) ) {
			$this->assertEmpty( $output );
		} else {
			$this->assertStringContainsString( $expected, $output );
		}
	}

	/**
	 * Data provider for testing the wrapper video container layout CSS classes.
	 *
	 * Returns arrays of: [attributes, inner_content, is_block, options, expected_classes]
	 */
	public function container_data_provider() {
		return array(
			// Test 1: Default configuration
			array(
				array(),
				'<video></video>',
				false,
				array(),
				array( 'class="videopack-wrapper', 'videopack-hover-trigger', 'videopack-embed-video-js' ),
			),
			// Test 2: Gutenberg Block configuration
			array(
				array(),
				'<video></video>',
				true,
				array(),
				array( 'videopack-video-block-container' ),
			),
			// Test 3: Align Center styling triggers auto-margin classes
			array(
				array( 'align' => 'center' ),
				'<video></video>',
				false,
				array(),
				array( 'videopack-wrapper-auto-left', 'videopack-wrapper-auto-right' ),
			),
			// Test 4: Real 'WordPress Default' embed method option
			array(
				array( 'embed_method' => 'WordPress Default' ),
				'<video></video>',
				false,
				array(),
				array( 'videopack-embed-wordpress-default' ),
			),
		);
	}

	/**
	 * @dataProvider container_data_provider
	 */
	public function test_render_video_container( $atts, $content, $is_block, $options, $expected_classes ) {
		if ( $is_block ) {
			// Set a dummy block context to prevent get_block_wrapper_attributes() from throwing null pointer errors
			WP_Block_Supports::$block_to_render = array(
				'blockName' => 'videopack/player',
				'attrs'     => array(),
			);
		}

		$output = Modular_Renderer::render_video_container( $atts, $content, $is_block, $options );

		if ( $is_block ) {
			WP_Block_Supports::$block_to_render = null; // Clean up context
		}

		foreach ( $expected_classes as $class ) {
			$this->assertStringContainsString( $class, $output );
		}
	}

	// -----------------------------------------------------------------
	// is_true()
	// -----------------------------------------------------------------

	public function truthy_value_provider(): array {
		return array(
			array( true ),
			array( 'true' ),
			array( 1 ),
			array( '1' ),
			array( 'on' ),
			array( 'yes' ),
		);
	}

	/**
	 * @dataProvider truthy_value_provider
	 */
	public function test_is_true_recognizes_truthy_shortcode_values( $value ): void {
		$this->assertTrue( Modular_Renderer::is_true( $value ) );
	}

	public function falsy_value_provider(): array {
		return array(
			array( false ),
			array( 'false' ),
			array( 0 ),
			array( '0' ),
			array( '' ),
			array( null ),
			array( 'off' ),
			array( 'no' ),
			array( 2 ),
		);
	}

	/**
	 * @dataProvider falsy_value_provider
	 */
	public function test_is_true_rejects_everything_else( $value ): void {
		$this->assertFalse( Modular_Renderer::is_true( $value ) );
	}

	// -----------------------------------------------------------------
	// get_svg_icon()
	// -----------------------------------------------------------------

	public function test_get_svg_icon_returns_a_real_icons_svg(): void {
		$this->assertStringContainsString( '<svg', Modular_Renderer::get_svg_icon( 'download' ) );
	}

	public function test_get_svg_icon_returns_empty_string_for_an_unknown_type(): void {
		$this->assertSame( '', Modular_Renderer::get_svg_icon( 'not_a_real_icon' ) );
	}

	// -----------------------------------------------------------------
	// render_video_caption()
	// -----------------------------------------------------------------

	public function test_render_video_caption_returns_empty_string_for_an_empty_caption(): void {
		$this->assertSame( '', Modular_Renderer::render_video_caption( '' ) );
	}

	public function test_render_video_caption_wraps_a_real_caption_in_a_figcaption(): void {
		$output = Modular_Renderer::render_video_caption( 'A caption with <script>alert(1)</script>' );

		$this->assertStringContainsString( '<figcaption', $output );
		$this->assertStringContainsString( 'A caption with', $output );
		$this->assertStringNotContainsString( '<script>', $output );
	}

	// -----------------------------------------------------------------
	// render_view_count()
	// -----------------------------------------------------------------

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function video_source_with_views( int $views ) {
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'video/mp4' ) );
		( new Attachment_Meta( $this->options(), $attachment_id ) )->save( array( 'starts' => $views ) );
		$options = $this->options();
		return Source_Factory::create( $attachment_id, $options, new Registry( $options ) );
	}

	public function test_render_view_count_returns_empty_string_without_a_source(): void {
		$this->assertSame( '', Modular_Renderer::render_view_count( null ) );
	}

	public function test_render_view_count_shows_the_singular_form_for_one_view(): void {
		$output = Modular_Renderer::render_view_count( $this->video_source_with_views( 1 ) );

		$this->assertStringContainsString( '1 view<', $output );
	}

	public function test_render_view_count_shows_the_plural_form_for_multiple_views(): void {
		$output = Modular_Renderer::render_view_count( $this->video_source_with_views( 5 ) );

		$this->assertStringContainsString( '5 views<', $output );
	}

	public function test_render_view_count_hides_the_text_label_when_show_text_is_false(): void {
		$output = Modular_Renderer::render_view_count( $this->video_source_with_views( 5 ), array( 'showText' => false ) );

		$this->assertStringContainsString( '<span>5</span>', $output );
	}

	// -----------------------------------------------------------------
	// render_pagination()
	// -----------------------------------------------------------------

	public function test_render_pagination_is_empty_for_zero_or_one_page(): void {
		$this->assertSame( '', Modular_Renderer::render_pagination( 1, 0 ) );
		$this->assertSame( '', Modular_Renderer::render_pagination( 1, 1 ) );
	}

	public function test_render_pagination_lists_every_page_with_no_ellipsis_at_seven_or_fewer_pages(): void {
		$output = Modular_Renderer::render_pagination( 4, 7 );

		$this->assertStringNotContainsString( 'is-ellipsis', $output );
		for ( $page = 1; $page <= 7; $page++ ) {
			$this->assertMatchesRegularExpression( '/>\s*' . $page . '\s*<\/(button|span)>/', $output );
		}
	}

	/**
	 * With more than 7 pages and the current page near the start, the
	 * window keeps pages 1-4 plus the last page, collapsing the rest
	 * behind a single trailing ellipsis.
	 */
	public function test_render_pagination_windows_near_the_start(): void {
		$output = Modular_Renderer::render_pagination( 1, 10 );

		$this->assertSame( 1, substr_count( $output, 'is-ellipsis' ) );
		foreach ( array( 1, 2, 3, 4, 10 ) as $page ) {
			$this->assertMatchesRegularExpression( '/data-page="' . $page . '"|aria-current="page"[^>]*>\s*' . $page . '\s*</', $output );
		}
		foreach ( array( 5, 6, 7, 8, 9 ) as $page ) {
			$this->assertDoesNotMatchRegularExpression( '/data-page="' . $page . '"/', $output );
		}
	}

	/**
	 * Symmetric case: current page near the end keeps the last 4 pages
	 * plus page 1, with the ellipsis leading instead of trailing.
	 */
	public function test_render_pagination_windows_near_the_end(): void {
		$output = Modular_Renderer::render_pagination( 10, 10 );

		$this->assertSame( 1, substr_count( $output, 'is-ellipsis' ) );
		foreach ( array( 1, 7, 8, 9, 10 ) as $page ) {
			$this->assertMatchesRegularExpression( '/data-page="' . $page . '"|aria-current="page"[^>]*>\s*' . $page . '\s*</', $output );
		}
		foreach ( array( 2, 3, 4, 5, 6 ) as $page ) {
			$this->assertDoesNotMatchRegularExpression( '/data-page="' . $page . '"/', $output );
		}
	}

	/**
	 * A middle current page gets two ellipses -- one on each side of its
	 * own small window.
	 */
	public function test_render_pagination_windows_around_a_middle_page_with_two_ellipses(): void {
		$output = Modular_Renderer::render_pagination( 5, 10 );

		$this->assertSame( 2, substr_count( $output, 'is-ellipsis' ) );
		foreach ( array( 1, 4, 5, 6, 10 ) as $page ) {
			$this->assertMatchesRegularExpression( '/data-page="' . $page . '"|aria-current="page"[^>]*>\s*' . $page . '\s*</', $output );
		}
		foreach ( array( 2, 3, 7, 8, 9 ) as $page ) {
			$this->assertDoesNotMatchRegularExpression( '/data-page="' . $page . '"/', $output );
		}
	}

	public function test_render_pagination_hides_the_previous_button_on_the_first_page(): void {
		$output = Modular_Renderer::render_pagination( 1, 10 );

		$this->assertMatchesRegularExpression( '/prev page-numbers videopack-pagination-button is-hidden/', $output );
		$this->assertDoesNotMatchRegularExpression( '/next page-numbers videopack-pagination-button is-hidden/', $output );
	}

	public function test_render_pagination_hides_the_next_button_on_the_last_page(): void {
		$output = Modular_Renderer::render_pagination( 10, 10 );

		$this->assertMatchesRegularExpression( '/next page-numbers videopack-pagination-button is-hidden/', $output );
		$this->assertDoesNotMatchRegularExpression( '/prev page-numbers videopack-pagination-button is-hidden/', $output );
	}

	// -----------------------------------------------------------------
	// render_watermark()
	// -----------------------------------------------------------------

	public function test_render_watermark_is_empty_without_a_watermark_value(): void {
		$this->assertSame( '', Modular_Renderer::render_watermark( array() ) );
	}

	public function watermark_disabled_value_provider(): array {
		return array( array( 'false' ), array( '0' ), array( '' ) );
	}

	/**
	 * @dataProvider watermark_disabled_value_provider
	 */
	public function test_render_watermark_is_empty_for_explicit_disable_values( $value ): void {
		$this->assertSame( '', Modular_Renderer::render_watermark( array( 'watermark' => $value ) ) );
	}

	public function test_render_watermark_is_empty_for_a_nonexistent_attachment_id(): void {
		$this->assertSame( '', Modular_Renderer::render_watermark( array( 'watermark' => 999999999 ) ) );
	}

	public function test_render_watermark_resolves_a_numeric_attachment_id_to_its_url(): void {
		$image_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'watermark.png',
				'post_mime_type' => 'image/png',
			)
		);

		$output = Modular_Renderer::render_watermark( array( 'watermark' => $image_id ) );

		$this->assertStringContainsString( esc_url( (string) wp_get_attachment_url( $image_id ) ), $output );
	}

	public function test_render_watermark_uses_a_plain_url_as_is(): void {
		$output = Modular_Renderer::render_watermark( array( 'watermark' => 'https://example.test/logo.png' ) );

		$this->assertStringContainsString( 'https://example.test/logo.png', $output );
	}

	/**
	 * An alignment value that collides with player/container alignment
	 * keywords (e.g. Gutenberg's "wide"/"full") must fall back to the
	 * default rather than being used as a CSS position value.
	 */
	public function test_render_watermark_falls_back_to_default_alignment_for_an_invalid_value(): void {
		$output = Modular_Renderer::render_watermark(
			array(
				'watermark'       => 'https://example.test/logo.png',
				'watermark_align' => 'wide',
			)
		);

		$this->assertStringNotContainsString( 'wide:', $output );
		$this->assertStringContainsString( 'right:', $output );
	}

	public function test_render_watermark_links_home_when_link_to_is_home(): void {
		$output = Modular_Renderer::render_watermark(
			array(
				'watermark'         => 'https://example.test/logo.png',
				'watermark_link_to' => 'home',
			)
		);

		$this->assertStringContainsString( esc_url( get_home_url() ), $output );
	}

	public function test_render_watermark_links_a_custom_url(): void {
		$output = Modular_Renderer::render_watermark(
			array(
				'watermark'         => 'https://example.test/logo.png',
				'watermark_link_to' => 'custom',
				'watermark_url'     => 'https://example.test/custom-link',
			)
		);

		$this->assertStringContainsString( 'https://example.test/custom-link', $output );
	}

	public function test_render_watermark_links_the_attachments_own_post_for_link_to_attachment(): void {
		$post_id = self::factory()->post->create();

		$output = Modular_Renderer::render_watermark(
			array(
				'watermark'         => 'https://example.test/logo.png',
				'watermark_link_to' => 'attachment',
				'postId'            => $post_id,
			)
		);

		$this->assertStringContainsString( esc_url( (string) get_permalink( $post_id ) ), $output );
	}

	/**
	 * The watermark_link_to option defaults to 'home' (Options::get_default()),
	 * so the no-link case has to opt out of that default explicitly.
	 */
	public function test_render_watermark_has_no_pointer_events_disabled_style_without_a_link(): void {
		$output = Modular_Renderer::render_watermark(
			array(
				'watermark'         => 'https://example.test/logo.png',
				'watermark_link_to' => 'false',
			)
		);

		$this->assertStringContainsString( 'pointer-events:none', $output );
	}

	public function test_render_watermark_omits_pointer_events_disabled_style_with_a_link(): void {
		$output = Modular_Renderer::render_watermark(
			array(
				'watermark'         => 'https://example.test/logo.png',
				'watermark_link_to' => 'home',
			)
		);

		$this->assertStringNotContainsString( 'pointer-events:none', $output );
	}

	// -----------------------------------------------------------------
	// format_download_resolution_label() (private)
	// -----------------------------------------------------------------

	protected function format_download_resolution_label( $resolution ): string {
		$method = new ReflectionMethod( Modular_Renderer::class, 'format_download_resolution_label' );
		$method->setAccessible( true );
		return $method->invoke( null, $resolution );
	}

	public function test_format_download_resolution_label_appends_p_to_a_purely_numeric_value(): void {
		$this->assertSame( '1080p', $this->format_download_resolution_label( '1080' ) );
		$this->assertSame( '1080p', $this->format_download_resolution_label( 1080 ) );
	}

	public function test_format_download_resolution_label_leaves_a_non_numeric_value_unchanged(): void {
		$this->assertSame( 'audio', $this->format_download_resolution_label( 'audio' ) );
		$this->assertSame( '4k', $this->format_download_resolution_label( '4k' ) );
	}

	// -----------------------------------------------------------------
	// render_download_menu_list() (private)
	// -----------------------------------------------------------------

	protected function render_download_menu_list( array $source_groups ): string {
		$method = new ReflectionMethod( Modular_Renderer::class, 'render_download_menu_list' );
		$method->setAccessible( true );
		return $method->invoke( null, $source_groups );
	}

	public function test_render_download_menu_list_sorts_a_single_group_by_resolution_descending(): void {
		$html = $this->render_download_menu_list(
			array(
				'mp4' => array(
					'sources' => array(
						array(
							'resolution' => '360',
							'src'        => 'https://example.test/360.mp4',
						),
						array(
							'resolution' => '1080',
							'src'        => 'https://example.test/1080.mp4',
						),
						array(
							'resolution' => '720',
							'src'        => 'https://example.test/720.mp4',
						),
					),
				),
			)
		);

		$this->assertSame(
			array( '1080p', '720p', '360p' ),
			array_values( $this->extract_ordered( $html, '/videopack-download-link[^>]*>([^<]+)</' ) )
		);
	}

	public function test_render_download_menu_list_skips_entries_missing_a_resolution_or_url(): void {
		$html = $this->render_download_menu_list(
			array(
				'mp4' => array(
					'sources' => array(
						array(
							'resolution' => '720',
							'src'        => '',
						),
						array(
							'resolution' => '',
							'src'        => 'https://example.test/720.mp4',
						),
						array(
							'resolution' => '480',
							'src'        => 'https://example.test/480.mp4',
						),
					),
				),
			)
		);

		$this->assertStringContainsString( '480p', $html );
		$this->assertStringNotContainsString( '720p', $html );
	}

	public function test_render_download_menu_list_builds_submenus_for_multiple_groups(): void {
		$html = $this->render_download_menu_list(
			array(
				'h264' => array(
					'label'   => 'MP4',
					'sources' => array(
						array(
							'resolution' => '1080',
							'src'        => 'https://example.test/1080.mp4',
						),
					),
				),
				'vp9'  => array(
					'label'   => 'WebM',
					'sources' => array(
						array(
							'resolution' => '720',
							'src'        => 'https://example.test/720.webm',
						),
					),
				),
			)
		);

		$this->assertStringContainsString( 'has-submenu', $html );
		$this->assertStringContainsString( '>MP4<', $html );
		$this->assertStringContainsString( '>WebM<', $html );
	}

	/**
	 * Extracts, in document order, the text captured by the given regex's
	 * single capture group across every match in $html.
	 */
	protected function extract_ordered( string $html, string $pattern ): array {
		preg_match_all( $pattern, $html, $matches );
		return $matches[1] ?? array();
	}

	// -----------------------------------------------------------------
	// render_download() / render_share() -- null-source guard.
	// -----------------------------------------------------------------

	public function test_render_download_is_empty_without_a_source(): void {
		$this->assertSame( '', Modular_Renderer::render_download( array(), null ) );
	}

	public function test_render_share_is_empty_without_a_source(): void {
		$this->assertSame( '', Modular_Renderer::render_share( array(), null, 1 ) );
	}

	// -----------------------------------------------------------------
	// render_thumbnail()
	// -----------------------------------------------------------------

	public function test_render_thumbnail_falls_back_to_the_default_image_without_a_poster(): void {
		$post_id = self::factory()->post->create();

		$output = Modular_Renderer::render_thumbnail( array(), '', $post_id );

		$this->assertStringContainsString( 'nothumbnail.jpg', $output );
	}

	public function test_render_thumbnail_uses_the_given_poster(): void {
		$post_id = self::factory()->post->create();

		$output = Modular_Renderer::render_thumbnail( array( 'poster' => 'https://example.test/poster.jpg' ), '', $post_id );

		$this->assertStringContainsString( 'https://example.test/poster.jpg', $output );
	}

	public function test_render_thumbnail_renders_no_link_wrapper_when_link_to_is_none(): void {
		$post_id = self::factory()->post->create();

		$output = Modular_Renderer::render_thumbnail( array( 'linkTo' => 'none' ), '', $post_id );

		$this->assertStringNotContainsString( '<a ', $output );
	}

	public function test_render_thumbnail_links_to_the_lightbox_and_sets_the_trigger_flag(): void {
		$post_id = self::factory()->post->create();
		$this->assertFalse( Modular_Renderer::$rendered_lightbox_trigger );

		$output = Modular_Renderer::render_thumbnail( array( 'linkTo' => 'lightbox' ), '', $post_id );

		$this->assertStringContainsString( 'videopack-lightbox', $output );
		$this->assertStringContainsString( 'href="#"', $output );
		$this->assertTrue( Modular_Renderer::$rendered_lightbox_trigger );
	}

	public function test_render_thumbnail_links_to_the_parent_post_when_present(): void {
		$parent_id = self::factory()->post->create();
		$child_id  = self::factory()->post->create( array( 'post_parent' => $parent_id ) );

		$output = Modular_Renderer::render_thumbnail( array( 'linkTo' => 'parent' ), '', $child_id );

		$this->assertStringContainsString( esc_url( (string) get_permalink( $parent_id ) ), $output );
	}

	public function test_render_thumbnail_links_to_its_own_permalink_when_no_parent(): void {
		$post_id = self::factory()->post->create();

		$output = Modular_Renderer::render_thumbnail( array( 'linkTo' => 'parent' ), '', $post_id );

		$this->assertStringContainsString( esc_url( (string) get_permalink( $post_id ) ), $output );
	}

	// -----------------------------------------------------------------
	// render_play_button()
	// -----------------------------------------------------------------

	public function test_render_play_button_uses_the_mejs_overlay_for_wordpress_default(): void {
		$output = Modular_Renderer::render_play_button( array(), array( 'embed_method' => 'WordPress Default' ) );

		$this->assertStringContainsString( 'mejs-overlay-play', $output );
	}

	public function test_render_play_button_uses_the_video_js_big_play_button_by_default(): void {
		$output = Modular_Renderer::render_play_button( array(), array( 'embed_method' => 'Video.js' ) );

		$this->assertStringContainsString( 'vjs-big-play-button', $output );
	}

	public function test_render_play_button_applies_custom_colors(): void {
		$output = Modular_Renderer::render_play_button( array( 'color' => '#ff0000' ), array( 'embed_method' => 'Video.js' ) );

		$this->assertStringContainsString( '--videopack-play-button-color: #ff0000', $output );
		$this->assertStringContainsString( 'videopack-has-play-button-color', $output );
	}

	public function test_render_play_button_respects_a_filter_override(): void {
		add_filter(
			'videopack_play_button_html',
			static function () {
				return '<div class="custom-play-button"></div>';
			}
		);

		$output = Modular_Renderer::render_play_button( array(), array( 'embed_method' => 'Video.js' ) );

		$this->assertSame( '<div class="custom-play-button"></div>', $output );
	}

	// -----------------------------------------------------------------
	// format_duration() (private)
	// -----------------------------------------------------------------

	public function test_format_duration_of_zero_returns_zero_colon_double_zero(): void {
		$method = new ReflectionMethod( Modular_Renderer::class, 'format_duration' );
		$method->setAccessible( true );

		$this->assertSame( '0:00', $method->invoke( null, 0 ) );
	}

	// -----------------------------------------------------------------
	// render_video_title()
	// -----------------------------------------------------------------

	protected function video_source_titled( string $title ) {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'post_mime_type' => 'video/mp4',
				'post_title'     => $title,
			)
		);
		$options       = $this->options();
		return Source_Factory::create( $attachment_id, $options, new Registry( $options ) );
	}

	public function test_render_video_title_falls_back_to_the_sources_own_title(): void {
		$output = Modular_Renderer::render_video_title( array(), $this->video_source_titled( 'My Video Title' ), 1 );

		$this->assertStringContainsString( 'My Video Title', $output );
	}

	public function test_render_video_title_prefers_an_explicit_title_attribute(): void {
		$output = Modular_Renderer::render_video_title( array( 'title' => 'Explicit Title' ), $this->video_source_titled( 'Source Title' ), 1 );

		$this->assertStringContainsString( 'Explicit Title', $output );
		$this->assertStringNotContainsString( 'Source Title', $output );
	}

	public function test_render_video_title_hides_the_title_when_overlay_title_is_false(): void {
		$output = Modular_Renderer::render_video_title(
			array(
				'title'         => 'Hidden Title',
				'overlay_title' => false,
			),
			null,
			1
		);

		$this->assertSame( '', $output );
	}

	public function test_render_video_title_wraps_the_title_in_a_link_when_link_url_is_set(): void {
		$output = Modular_Renderer::render_video_title(
			array(
				'title'    => 'Linked Title',
				'link_url' => 'https://example.test/post',
			),
			null,
			1
		);

		$this->assertStringContainsString( '<a href="https://example.test/post"', $output );
		$this->assertStringContainsString( 'Linked Title', $output );
	}

	public function test_render_video_title_non_overlay_mode_uses_the_given_tag(): void {
		$output = Modular_Renderer::render_video_title(
			array(
				'title'   => 'Tagged',
				'tagName' => 'h5',
			),
			null,
			1
		);

		$this->assertStringContainsString( '<h5', $output );
		$this->assertStringContainsString( '</h5>', $output );
	}

	/**
	 * Overlay mode renders a distinct "info bar" structure -- a wrapper div
	 * plus a separate inner bar div -- rather than the plain heading tag
	 * non-overlay mode uses.
	 */
	public function test_render_video_title_overlay_mode_renders_the_info_bar_structure(): void {
		$output = Modular_Renderer::render_video_title(
			array(
				'title'     => 'Overlay Title',
				'isOverlay' => true,
			),
			null,
			42
		);

		$this->assertStringContainsString( 'videopack-meta-wrapper', $output );
		$this->assertStringContainsString( 'is-overlay', $output );
		$this->assertStringContainsString( 'video_42_meta', $output );
		$this->assertStringContainsString( 'Overlay Title', $output );
	}

	// -----------------------------------------------------------------
	// render_player_engine()
	// -----------------------------------------------------------------

	protected function bare_player(): \Videopack\Frontend\Video_Players\Player {
		$options = $this->options();
		return new \Videopack\Frontend\Video_Players\Player( $options, new Registry( $options ) );
	}

	public function test_render_player_engine_uses_the_default_wrapper_class(): void {
		$output = Modular_Renderer::render_player_engine( $this->bare_player(), array() );

		$this->assertStringContainsString( 'videopack-player-relative-wrapper', $output );
	}

	public function test_render_player_engine_applies_a_custom_color_as_a_css_variable(): void {
		$output = Modular_Renderer::render_player_engine( $this->bare_player(), array( 'title_color' => '#123456' ), '', array( 'embed_method' => 'Video.js' ) );

		$this->assertStringContainsString( '--videopack-title-color: #123456', $output );
		$this->assertStringContainsString( 'videopack-has-title-color', $output );
	}

	public function test_render_player_engine_adds_the_skin_class_only_for_video_js(): void {
		$video_js_output   = Modular_Renderer::render_player_engine( $this->bare_player(), array( 'skin' => 'my-skin' ), '', array( 'embed_method' => 'Video.js' ) );
		$wp_default_output = Modular_Renderer::render_player_engine( $this->bare_player(), array( 'skin' => 'my-skin' ), '', array( 'embed_method' => 'WordPress Default' ) );

		$this->assertStringContainsString( 'my-skin', $video_js_output );
		$this->assertStringNotContainsString( 'my-skin', $wp_default_output );
	}

	public function test_render_player_engine_injects_the_mejs_controls_svg_variable_for_wordpress_default(): void {
		$output = Modular_Renderer::render_player_engine( $this->bare_player(), array(), '', array( 'embed_method' => 'WordPress Default' ) );

		$this->assertStringContainsString( '--videopack-mejs-controls-svg:', $output );
	}

	// -----------------------------------------------------------------
	// get_player_source_groups_for_download() (private)
	// -----------------------------------------------------------------

	public function test_get_player_source_groups_for_download_returns_a_real_source_group_for_the_video(): void {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		$attached_file = get_attached_file( $attachment_id );
		file_put_contents( $attached_file, 'fake video content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		$options = $this->options();
		$source  = Source_Factory::create( $attachment_id, $options, new Registry( $options ) );

		$method = new ReflectionMethod( Modular_Renderer::class, 'get_player_source_groups_for_download' );
		$method->setAccessible( true );
		$groups = $method->invoke( null, $source, $options, new Registry( $options ) );

		$this->assertArrayHasKey( 'h264', $groups );
		$this->assertStringContainsString( wp_get_attachment_url( $attachment_id ), $groups['h264']['sources'][0]['src'] );

		wp_delete_file( $attached_file );
	}

	// -----------------------------------------------------------------
	// render_standalone_player_assembly()
	// -----------------------------------------------------------------

	protected function video_attachment_for_assembly(): int {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		$attached_file = get_attached_file( $attachment_id );
		file_put_contents( $attached_file, 'fake video content' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		$this->temp_files_for_assembly[] = $attached_file;
		return $attachment_id;
	}

	/**
	 * @var string[]
	 */
	protected $temp_files_for_assembly = array();

	protected function render_assembly( int $attachment_id, array $option_overrides = array() ): string {
		$options = array_merge( $this->options(), $option_overrides );
		update_option( 'videopack_options', $options );
		return Modular_Renderer::render_standalone_player_assembly( $attachment_id, array(), $options );
	}

	public function test_render_standalone_player_assembly_includes_the_video_and_default_title(): void {
		$attachment_id = $this->video_attachment_for_assembly();

		$output = $this->render_assembly( $attachment_id );

		$this->assertStringContainsString( wp_get_attachment_url( $attachment_id ), $output );
		$this->assertStringContainsString( 'videopack-video-title', $output );
	}

	public function test_render_standalone_player_assembly_omits_the_title_when_disabled(): void {
		$attachment_id = $this->video_attachment_for_assembly();

		$output = $this->render_assembly(
			$attachment_id,
			array(
				'overlay_title' => false,
				'downloadlink'  => false,
				'embedcode'     => false,
			)
		);

		$this->assertStringNotContainsString( 'videopack-video-title', $output );
	}

	public function test_render_standalone_player_assembly_includes_a_download_link_when_enabled(): void {
		$attachment_id = $this->video_attachment_for_assembly();

		$output = $this->render_assembly( $attachment_id, array( 'downloadlink' => true ) );

		$this->assertStringContainsString( 'videopack-download-wrapper', $output );
	}

	public function test_render_standalone_player_assembly_includes_share_when_enabled(): void {
		$attachment_id = $this->video_attachment_for_assembly();

		$output = $this->render_assembly( $attachment_id, array( 'embedcode' => true ) );

		$this->assertStringContainsString( 'videopack-share-wrapper', $output );
	}

	public function test_render_standalone_player_assembly_includes_view_count_when_enabled(): void {
		$attachment_id = $this->video_attachment_for_assembly();

		$output = $this->render_assembly( $attachment_id, array( 'view_count' => true ) );

		$this->assertStringContainsString( 'videopack-view-count', $output );
	}

	public function test_render_standalone_player_assembly_omits_view_count_when_disabled(): void {
		$attachment_id = $this->video_attachment_for_assembly();

		$output = $this->render_assembly( $attachment_id, array( 'view_count' => false ) );

		$this->assertStringNotContainsString( 'videopack-view-count', $output );
	}

	// Note: this method also conditionally includes a 'videopack/watermark'
	// block when $options['watermark'] is set, but that block's registered
	// render callback (in Blocks.php, not this class) is the one responsible
	// for resolving $options['watermark'] into the block's own attrs before
	// calling Modular_Renderer::render_watermark() -- render_watermark()
	// itself only ever reads $atts['watermark'], with no options fallback.
	// Verifying the watermark actually appears here would really be testing
	// that cross-class wiring, not this method's own "which blocks get
	// included" logic (already demonstrated by the download/share/view-count
	// cases above), so it's left uncovered here.
}
