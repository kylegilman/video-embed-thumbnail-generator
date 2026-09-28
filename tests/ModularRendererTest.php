<?php
/**
 * This file also covers is_true(), get_svg_icon(), render_video_caption(),
 * render_view_count(), and render_pagination() -- previously untested
 * methods on this large (~1500 line), mostly-static-HTML-builder class.
 * The remaining render_*() methods (render_watermark, render_video_title,
 * render_download, render_share, render_player_engine, render_thumbnail,
 * render_play_button, render_standalone_player_assembly, and the private
 * download-menu helpers) are still untested -- this file doesn't attempt
 * to cover the whole class, just adds the methods with real,
 * independently-derivable logic that were easy wins alongside the
 * pre-existing render_video_duration()/render_video_container() coverage.
 */

use Videopack\Frontend\Modular_Renderer;
use Videopack\Admin\Attachment_Meta;
use Videopack\Video_Source\Source_Factory;
use Videopack\Admin\Formats\Registry;

class ModularRendererTest extends WP_UnitTestCase {

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
}
