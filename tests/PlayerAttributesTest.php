<?php
/**
 * Tests for Player's <video>-element attribute/class building:
 * get_video_classes(), get_boolean_video_attributes(),
 * get_string_video_attributes(), and get_track_elements(). Previously
 * completely untested.
 */

use Videopack\Frontend\Video_Players\Player_Video_Js;

class PlayerAttributesTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function invoke( array $atts, string $method ) {
		$player = new Player_Video_Js( $this->options() );
		$set_atts = new ReflectionMethod( $player, 'set_atts' );
		$set_atts->setAccessible( true );
		$set_atts->invoke( $player, $atts );

		$reflected = new ReflectionMethod( $player, $method );
		$reflected->setAccessible( true );
		return $reflected->invoke( $player );
	}

	// -----------------------------------------------------------------
	// get_video_classes()
	// -----------------------------------------------------------------

	public function test_video_classes_always_includes_the_base_class(): void {
		$this->assertContains( 'videopack-video', $this->invoke( array(), 'get_video_classes' ) );
	}

	public function test_video_classes_is_filterable(): void {
		add_filter(
			'videopack_video_player_classes',
			static function ( $classes ) {
				$classes[] = 'my-custom-class';
				return $classes;
			}
		);

		$classes = $this->invoke( array(), 'get_video_classes' );
		remove_all_filters( 'videopack_video_player_classes' );

		$this->assertContains( 'my-custom-class', $classes );
	}

	// -----------------------------------------------------------------
	// get_boolean_video_attributes() -- an HTML boolean attribute must be
	// present when true and absent otherwise; a real PHP bool is required
	// (strict === true), which holds in practice because both real input
	// paths already deliver one: Shortcode's boolean_convert list covers
	// 'autoplay'/'controls'/'loop'/'muted'/'playsinline' for the shortcode
	// path, and Gutenberg block attributes decode typed JSON booleans
	// natively for the block path.
	// -----------------------------------------------------------------

	public function test_boolean_attribute_present_when_true(): void {
		$this->assertSame( array( 'autoplay' ), $this->invoke( array( 'autoplay' => true ), 'get_boolean_video_attributes' ) );
	}

	public function test_boolean_attribute_absent_when_false(): void {
		$this->assertSame( array(), $this->invoke( array( 'autoplay' => false ), 'get_boolean_video_attributes' ) );
	}

	public function test_boolean_attribute_absent_when_not_set(): void {
		$this->assertSame( array(), $this->invoke( array(), 'get_boolean_video_attributes' ) );
	}

	/**
	 * A truthy but non-boolean value (e.g. an unconverted shortcode string
	 * "1"/"true") is deliberately NOT treated as enabling the attribute --
	 * only a real PHP `true` does, since this check is strict (===).
	 */
	public function test_boolean_attribute_absent_for_a_truthy_string(): void {
		$this->assertSame( array(), $this->invoke( array( 'autoplay' => '1' ), 'get_boolean_video_attributes' ) );
		$this->assertSame( array(), $this->invoke( array( 'autoplay' => 'true' ), 'get_boolean_video_attributes' ) );
	}

	public function test_multiple_boolean_attributes_all_included(): void {
		$result = $this->invoke(
			array(
				'autoplay'    => true,
				'controls'    => true,
				'loop'        => true,
				'muted'       => true,
				'playsinline' => true,
			),
			'get_boolean_video_attributes'
		);

		$this->assertSame( array( 'autoplay', 'controls', 'loop', 'muted', 'playsinline' ), $result );
	}

	public function test_unrecognized_attribute_names_are_never_included(): void {
		$this->assertSame( array(), $this->invoke( array( 'onclick' => true ), 'get_boolean_video_attributes' ) );
	}

	// -----------------------------------------------------------------
	// get_string_video_attributes()
	// -----------------------------------------------------------------

	public function test_string_attribute_rendered_as_key_value_pair(): void {
		$result = $this->invoke( array( 'preload' => 'auto' ), 'get_string_video_attributes' );

		$this->assertSame( array( 'preload="auto"' ), $result );
	}

	public function test_string_attribute_value_is_escaped(): void {
		$result = $this->invoke( array( 'preload' => '"><script>alert(1)</script>' ), 'get_string_video_attributes' );

		$this->assertSame( array( 'preload="' . esc_attr( '"><script>alert(1)</script>' ) . '"' ), $result );
		$this->assertStringNotContainsString( '<script>', $result[0] );
	}

	public function test_empty_string_attribute_is_omitted(): void {
		$this->assertSame( array(), $this->invoke( array( 'preload' => '' ), 'get_string_video_attributes' ) );
	}

	public function test_unrecognized_string_attribute_names_are_never_included(): void {
		$this->assertSame( array(), $this->invoke( array( 'onclick' => 'alert(1)' ), 'get_string_video_attributes' ) );
	}

	public function test_string_video_attributes_is_filterable(): void {
		add_filter(
			'videopack_video_player_string_attributes',
			static function ( $atts ) {
				$atts[] = 'data-custom="1"';
				return $atts;
			}
		);

		$result = $this->invoke( array( 'preload' => 'auto' ), 'get_string_video_attributes' );
		remove_all_filters( 'videopack_video_player_string_attributes' );

		$this->assertContains( 'data-custom="1"', $result );
	}

	// -----------------------------------------------------------------
	// get_track_elements()
	// -----------------------------------------------------------------

	public function test_track_with_src_is_rendered(): void {
		$result = $this->invoke(
			array( 'tracks' => array( array( 'src' => 'https://example.com/captions.vtt', 'kind' => 'captions' ) ) ),
			'get_track_elements'
		);

		$this->assertStringContainsString( '<track', $result );
		$this->assertStringContainsString( 'src="https://example.com/captions.vtt"', $result );
		$this->assertStringContainsString( 'kind="captions"', $result );
	}

	public function test_track_without_src_is_skipped(): void {
		$result = $this->invoke(
			array( 'tracks' => array( array( 'kind' => 'captions' ) ) ),
			'get_track_elements'
		);

		$this->assertSame( '', $result );
	}

	public function test_multiple_tracks_are_all_rendered(): void {
		$result = $this->invoke(
			array(
				'tracks' => array(
					array( 'src' => 'https://example.com/en.vtt', 'srclang' => 'en' ),
					array( 'src' => 'https://example.com/fr.vtt', 'srclang' => 'fr' ),
				),
			),
			'get_track_elements'
		);

		$this->assertStringContainsString( 'en.vtt', $result );
		$this->assertStringContainsString( 'fr.vtt', $result );
	}

	public function test_track_attribute_keys_and_values_are_escaped(): void {
		$result = $this->invoke(
			array(
				'tracks' => array(
					array( 'src' => 'https://example.com/en.vtt', 'label' => '"><script>alert(1)</script>' ),
				),
			),
			'get_track_elements'
		);

		$this->assertStringNotContainsString( '<script>', $result );
	}

	public function test_no_tracks_renders_nothing(): void {
		$this->assertSame( '', $this->invoke( array(), 'get_track_elements' ) );
	}
}
