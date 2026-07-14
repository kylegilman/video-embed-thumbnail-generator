<?php

use Videopack\Frontend\Modular_Renderer;

class ModularRendererTest extends WP_UnitTestCase {

	/**
	 * Data provider for testing video duration rendering and formatting.
	 *
	 * Returns arrays of: [attributes, context, expected_html_contains_substrings]
	 */
	public function duration_data_provider() {
		return array(
			// Test 1: Zero seconds should return empty string
			array(
				array( 'seconds' => 0 ),
				array(),
				''
			),
			// Test 2: Standard seconds formatting (MM:SS)
			array(
				array( 'seconds' => 75 ),
				array(),
				'1:15'
			),
			// Test 3: Hour-based formatting (H:MM:SS)
			array(
				array( 'seconds' => 3665 ),
				array(),
				'1:01:05'
			),
			// Test 4: Default class, position, and alignment
			array(
				array( 'seconds' => 90, 'position' => 'top', 'textAlign' => 'right' ),
				array(),
				'class="videopack-video-duration position-top has-text-align-right"'
			),
			// Test 5: Inside thumbnail context (adds badge styles)
			array(
				array( 'seconds' => 90 ),
				array( 'isInsideThumbnail' => true ),
				'class="videopack-video-duration is-overlay is-badge position-top has-text-align-right"'
			),
			// Test 6: Custom theme colors mapping to CSS variables
			array(
				array( 'seconds' => 90 ),
				array( 'isInsideThumbnail' => true, 'title_background_color' => '#ff0000', 'title_color' => '#ffffff' ),
				'style="--videopack-title-background-color: #ff0000;--videopack-title-color: #ffffff"'
			),
		);
	}

	/**
	 * @dataProvider duration_data_provider
	 */
	public function test_render_video_duration( $atts, $context, $expected ) {
		$output = Modular_Renderer::render_video_duration( $atts, $context );

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
				array( 'class="videopack-wrapper', 'videopack-hover-trigger', 'videopack-embed-video-js' )
			),
			// Test 2: Gutenberg Block configuration
			array(
				array(),
				'<video></video>',
				true,
				array(),
				array( 'videopack-video-block-container' )
			),
			// Test 3: Align Center styling triggers auto-margin classes
			array(
				array( 'align' => 'center' ),
				'<video></video>',
				false,
				array(),
				array( 'videopack-wrapper-auto-left', 'videopack-wrapper-auto-right' )
			),
			// Test 4: Real 'WordPress Default' embed method option
			array(
				array( 'embed_method' => 'WordPress Default' ),
				'<video></video>',
				false,
				array(),
				array( 'videopack-embed-wordpress-default' )
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
}
