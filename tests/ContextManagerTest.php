<?php
/**
 * Tests for Context_Manager::resolve() and resolve_show_background() --
 * the shared attribute/context/option precedence resolver every Videopack
 * block uses to decide its actual design settings and CSS output.
 * Previously completely untested despite real, easy-to-silently-break
 * logic: a 3-tier precedence chain where an empty string means something
 * different at each tier, a literal 'inherit' that must NOT be treated as
 * "unset" despite reading as falsy-ish, and per-block-type scoping of
 * which resolved values actually become CSS vars/classes.
 */

use Videopack\Frontend\Context_Manager;

class ContextManagerTest extends WP_UnitTestCase {

	// -----------------------------------------------------------------
	// resolve() -- precedence chain.
	// -----------------------------------------------------------------

	public function test_attribute_value_wins_over_context_and_options(): void {
		$result = Context_Manager::resolve(
			array( 'title_color' => '#111111' ),
			array( 'videopack/title_color' => '#222222' ),
			array( 'title_color' => '#333333' ),
			array()
		);

		$this->assertSame( '#111111', $result['resolved']['title_color'] );
	}

	public function test_context_value_wins_over_options_when_attribute_absent(): void {
		$result = Context_Manager::resolve(
			array(),
			array( 'videopack/title_color' => '#222222' ),
			array( 'title_color' => '#333333' ),
			array()
		);

		$this->assertSame( '#222222', $result['resolved']['title_color'] );
	}

	public function test_options_value_used_when_attribute_and_context_absent(): void {
		$result = Context_Manager::resolve(
			array(),
			array(),
			array( 'title_color' => '#333333' ),
			array()
		);

		$this->assertSame( '#333333', $result['resolved']['title_color'] );
	}

	public function test_falls_back_to_defaults_when_nothing_else_set(): void {
		$result = Context_Manager::resolve( array(), array(), array(), array() );

		// Defaults::get_all()'s real default for title_position.
		$this->assertSame( 'top', $result['resolved']['title_position'] );
	}

	/**
	 * An empty string means "cleared -- defer to the next tier", not a
	 * real value, matching the JS resolver's isValid() check. This is the
	 * exact kind of behavior a refactor could silently invert.
	 */
	public function test_empty_string_attribute_defers_to_context(): void {
		$result = Context_Manager::resolve(
			array( 'title_color' => '' ),
			array( 'videopack/title_color' => '#222222' ),
			array(),
			array()
		);

		$this->assertSame( '#222222', $result['resolved']['title_color'] );
	}

	public function test_empty_string_context_defers_to_options(): void {
		$result = Context_Manager::resolve(
			array(),
			array( 'videopack/title_color' => '' ),
			array( 'title_color' => '#333333' ),
			array()
		);

		$this->assertSame( '#333333', $result['resolved']['title_color'] );
	}

	/**
	 * Unlike an empty string, the literal string 'inherit' (set via the
	 * color picker's distinct "Inherit" control) is a real terminal value
	 * that must flow straight through, not be treated as "cleared".
	 */
	public function test_literal_inherit_is_a_real_value_not_treated_as_cleared(): void {
		$result = Context_Manager::resolve(
			array( 'title_color' => 'inherit' ),
			array( 'videopack/title_color' => '#222222' ),
			array(),
			array( 'title_color' )
		);

		$this->assertSame( 'inherit', $result['resolved']['title_color'] );
		$this->assertStringContainsString( '--videopack-title-color: inherit', $result['style'] );
	}

	// -----------------------------------------------------------------
	// resolve() -- CSS var/class stamping, scoped by $class_keys.
	// -----------------------------------------------------------------

	public function test_resolved_always_contains_the_full_key_set_regardless_of_class_keys(): void {
		$result = Context_Manager::resolve(
			array( 'title_color' => '#111111' ),
			array(),
			array(),
			array() // No class_keys at all.
		);

		// Still present in $resolved for other code to read directly...
		$this->assertSame( '#111111', $result['resolved']['title_color'] );
		// ...but not stamped into style/classes since it's not in class_keys.
		$this->assertSame( '', $result['style'] );
		$this->assertSame( '', $result['classes'] );
	}

	public function test_only_keys_in_class_keys_are_stamped_into_style_and_classes(): void {
		$result = Context_Manager::resolve(
			array(
				'title_color'         => '#111111',
				'play_button_color'   => '#222222',
			),
			array(),
			array(),
			array( 'title_color' ) // play_button_color deliberately excluded.
		);

		$this->assertStringContainsString( '--videopack-title-color: #111111', $result['style'] );
		$this->assertStringNotContainsString( 'play-button-color', $result['style'] );
		$this->assertStringContainsString( 'videopack-has-title-color', $result['classes'] );
		$this->assertStringNotContainsString( 'play-button-color', $result['classes'] );
	}

	public function test_skin_default_value_emits_no_class(): void {
		$result = Context_Manager::resolve(
			array( 'skin' => 'default' ),
			array(),
			array(),
			array( 'skin' )
		);

		$this->assertSame( '', $result['classes'] );
	}

	public function test_skin_non_default_value_emits_raw_class_name(): void {
		$result = Context_Manager::resolve(
			array( 'skin' => 'vjs-theme-fantasy' ),
			array(),
			array(),
			array( 'skin' )
		);

		$this->assertStringContainsString( 'vjs-theme-fantasy', $result['classes'] );
		// Not stamped as a CSS var like other design keys.
		$this->assertSame( '', $result['style'] );
	}

	public function test_array_valued_key_is_resolved_but_excluded_from_css_output(): void {
		$result = Context_Manager::resolve(
			array(),
			array(),
			array( 'watermark_styles' => array( 'scale' => 20, 'align' => 'left' ) ),
			array( 'watermark_styles' )
		);

		$this->assertIsArray( $result['resolved']['watermark_styles'] );
		$this->assertSame( '', $result['style'] );
		$this->assertSame( '', $result['classes'] );
	}

	/**
	 * The returned classes string is deduplicated (array_unique()) --
	 * locks in that guarantee for callers concatenating it with other
	 * class sources, even though this function's own inputs don't
	 * naturally produce a duplicate on their own.
	 */
	public function test_classes_are_deduplicated(): void {
		// A contrived but genuine collision: the skin class and the
		// font-size class happen to produce the identical string.
		$result = Context_Manager::resolve(
			array(
				'fontSize' => 'large',
				'skin'     => 'has-large-font-size',
			),
			array(),
			array(),
			array( 'skin' )
		);
		$classes = array_filter( explode( ' ', $result['classes'] ) );

		$this->assertCount( count( array_unique( $classes ) ), $classes );
		$this->assertSame( 1, substr_count( $result['classes'], 'has-large-font-size' ) );
	}

	// -----------------------------------------------------------------
	// resolve() -- attribute key normalization.
	// -----------------------------------------------------------------

	public function test_camelcase_attribute_keys_are_normalized_to_snake_case(): void {
		$result = Context_Manager::resolve(
			array( 'titleColor' => '#123456' ),
			array(),
			array(),
			array()
		);

		$this->assertSame( '#123456', $result['resolved']['title_color'] );
	}

	public function test_font_size_and_font_family_produce_has_classes(): void {
		$result = Context_Manager::resolve(
			array(
				'fontSize'   => 'large',
				'fontFamily' => 'system',
			),
			array(),
			array(),
			array()
		);

		$this->assertStringContainsString( 'has-large-font-size', $result['classes'] );
		$this->assertStringContainsString( 'has-system-font-family', $result['classes'] );
	}

	// -----------------------------------------------------------------
	// resolve() -- Gutenberg "style" attribute (typography, spacing).
	// -----------------------------------------------------------------

	public function test_style_attribute_as_json_string_is_parsed(): void {
		$style = wp_json_encode( array( 'typography' => array( 'lineHeight' => '1.5' ) ) );

		$result = Context_Manager::resolve( array( 'style' => $style ), array(), array(), array() );

		$this->assertStringContainsString( 'line-height: 1.5', $result['style'] );
	}

	public function test_typography_font_size_preset_becomes_css_var(): void {
		$result = Context_Manager::resolve(
			array( 'style' => array( 'typography' => array( 'fontSize' => 'var:preset|font-size|large' ) ) ),
			array(),
			array(),
			array()
		);

		$this->assertStringContainsString( 'font-size: var(--wp--preset--font-size--large)', $result['style'] );
	}

	public function test_typography_font_size_literal_value_passes_through(): void {
		$result = Context_Manager::resolve(
			array( 'style' => array( 'typography' => array( 'fontSize' => '22px' ) ) ),
			array(),
			array(),
			array()
		);

		$this->assertStringContainsString( 'font-size: 22px', $result['style'] );
	}

	public function test_letter_spacing_passes_through(): void {
		$result = Context_Manager::resolve(
			array( 'style' => array( 'typography' => array( 'letterSpacing' => '0.5px' ) ) ),
			array(),
			array(),
			array()
		);

		$this->assertStringContainsString( 'letter-spacing: 0.5px', $result['style'] );
	}

	public function test_spacing_preset_becomes_css_var_per_direction(): void {
		$result = Context_Manager::resolve(
			array(
				'style' => array(
					'spacing' => array(
						'margin' => array( 'top' => 'var:preset|spacing|50', 'bottom' => '10px' ),
					),
				),
			),
			array(),
			array(),
			array()
		);

		$this->assertStringContainsString( 'margin-top: var(--wp--preset--spacing--50)', $result['style'] );
		$this->assertStringContainsString( 'margin-bottom: 10px', $result['style'] );
	}

	// -----------------------------------------------------------------
	// resolve_show_background()
	// -----------------------------------------------------------------

	public function test_show_background_attribute_true_is_respected(): void {
		$result = Context_Manager::resolve_show_background( array( 'show_background' => true ), array(), array(), false );
		$this->assertTrue( $result );
	}

	/**
	 * An explicit `false` attribute must be respected, not treated as
	 * "unset" just because it's falsy -- the check is against `null`, not
	 * `empty()`.
	 */
	public function test_show_background_attribute_false_is_respected_even_though_falsy(): void {
		$result = Context_Manager::resolve_show_background( array( 'show_background' => false ), array(), array(), true );
		$this->assertFalse( $result );
	}

	public function test_show_background_context_used_when_attribute_absent(): void {
		$result = Context_Manager::resolve_show_background( array(), array( 'videopack/showBackground' => true ), array(), false );
		$this->assertTrue( $result );
	}

	public function test_show_background_option_used_when_attribute_and_context_absent(): void {
		$result = Context_Manager::resolve_show_background( array(), array(), array( 'showBackground' => true ), false );
		$this->assertTrue( $result );
	}

	public function test_show_background_falls_back_to_is_overlay_default(): void {
		$this->assertTrue( Context_Manager::resolve_show_background( array(), array(), array(), true ) );
		$this->assertFalse( Context_Manager::resolve_show_background( array(), array(), array(), false ) );
	}
}
