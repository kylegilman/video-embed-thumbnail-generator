<?php
/**
 * Tests for Icons::get() -- retrieving raw SVG markup by name and injecting
 * extra CSS classes into the root element. Previously completely untested.
 */

use Videopack\Frontend\Icons;

class IconsTest extends WP_UnitTestCase {

	public function test_returns_the_raw_svg_for_a_known_icon(): void {
		$svg = Icons::get( 'download' );

		$this->assertStringStartsWith( '<svg', $svg );
		$this->assertStringContainsString( 'class="videopack-icon-svg"', $svg );
	}

	public function test_returns_empty_string_for_an_unknown_icon(): void {
		$this->assertSame( '', Icons::get( 'not-a-real-icon' ) );
	}

	public function test_extra_classes_are_appended_to_the_root_class_attribute(): void {
		$svg = Icons::get( 'download', 'my-extra-class' );

		$this->assertStringContainsString( 'class="videopack-icon-svg my-extra-class"', $svg );
	}

	public function test_no_extra_classes_leaves_the_class_attribute_unchanged(): void {
		$with_empty = Icons::get( 'download', '' );
		$without    = Icons::get( 'download' );

		$this->assertSame( $without, $with_empty );
	}

	public function test_extra_classes_are_escaped(): void {
		$svg = Icons::get( 'download', '"><script>alert(1)</script>' );

		$this->assertStringNotContainsString( '<script>', $svg );
	}

	/**
	 * get()'s extra-class injection works by a literal string replace of
	 * 'class="videopack-icon-svg' -- every icon in the map must actually
	 * contain that exact substring once, or extra classes would silently
	 * fail to be added for that icon. This guards the whole icon set
	 * against a future addition that doesn't follow the convention.
	 */
	public function test_every_icon_supports_extra_class_injection(): void {
		$reflection = new ReflectionProperty( Icons::class, 'icons' );
		$reflection->setAccessible( true );
		$icons = $reflection->getValue();

		$this->assertNotEmpty( $icons );

		foreach ( array_keys( $icons ) as $icon_name ) {
			$svg = Icons::get( $icon_name, 'test-class' );
			$this->assertStringContainsString( 'test-class', $svg, "icon '{$icon_name}' did not receive the extra class" );
		}
	}

	public function test_every_icon_is_well_formed_svg_markup(): void {
		$reflection = new ReflectionProperty( Icons::class, 'icons' );
		$reflection->setAccessible( true );
		$icons = $reflection->getValue();

		foreach ( $icons as $icon_name => $svg ) {
			$this->assertStringStartsWith( '<svg', $svg, "icon '{$icon_name}' does not start with <svg" );
			$this->assertStringEndsWith( '</svg>', $svg, "icon '{$icon_name}' does not end with </svg>" );
			$this->assertStringContainsString( 'aria-hidden="true"', $svg, "icon '{$icon_name}' is missing aria-hidden" );
		}
	}
}
