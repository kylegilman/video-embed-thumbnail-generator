<?php
/**
 * Tests for Defaults::get_all() -- the single source of truth for global
 * player/gallery defaults and their option-array fallbacks. Previously
 * completely untested. A pure function of its $options argument, so every
 * expectation here is derived from the class's own stated purpose rather
 * than by reading its implementation.
 */

use Videopack\Common\Defaults;

class DefaultsTest extends WP_UnitTestCase {

	public function test_defaults_with_no_options(): void {
		$defaults = Defaults::get_all( array() );

		$this->assertSame( 960, $defaults['width'] );
		$this->assertSame( 540, $defaults['height'] );
		$this->assertFalse( $defaults['autoplay'] );
		$this->assertFalse( $defaults['muted'] );
		$this->assertTrue( $defaults['controls'] );
		$this->assertSame( 'metadata', $defaults['preload'] );
		$this->assertTrue( $defaults['playsinline'] );
		$this->assertSame( 'vjs-theme-videopack', $defaults['skin'] );
		$this->assertSame( 'Video.js', $defaults['embed_method'] );
		$this->assertSame( -1, $defaults['collection_video_limit'] );
		$this->assertFalse( $defaults['enable_collection_video_limit'] );
		$this->assertSame( 6, $defaults['gallery_per_page'] );
	}

	public function test_default_ratio_is_derived_from_default_width_and_height(): void {
		$defaults = Defaults::get_all( array() );

		$this->assertSame( '960 / 540', $defaults['default_ratio'] );
	}

	public function test_default_ratio_reflects_overridden_width_and_height(): void {
		$defaults = Defaults::get_all(
			array(
				'width'  => 1280,
				'height' => 720,
			)
		);

		$this->assertSame( '1280 / 720', $defaults['default_ratio'] );
	}

	public function test_scalar_options_override_their_defaults(): void {
		$defaults = Defaults::get_all(
			array(
				'width'        => 640,
				'height'       => 360,
				'autoplay'     => true,
				'muted'        => true,
				'aspect_ratio' => '4/3',
				'preload'      => 'auto',
			)
		);

		$this->assertSame( 640, $defaults['width'] );
		$this->assertSame( 360, $defaults['height'] );
		$this->assertTrue( $defaults['autoplay'] );
		$this->assertTrue( $defaults['muted'] );
		$this->assertSame( '4/3', $defaults['aspect_ratio'] );
		$this->assertSame( 'auto', $defaults['preload'] );
	}

	/**
	 * width/height fall back with '??', which only triggers on a missing
	 * key -- an explicitly-set falsy value like 0 is preserved as-is. This
	 * differs from skin/embed_method/watermark below, which use empty()
	 * checks instead.
	 */
	public function test_an_explicit_zero_width_is_preserved_not_defaulted(): void {
		$defaults = Defaults::get_all( array( 'width' => 0 ) );

		$this->assertSame( 0, $defaults['width'] );
	}

	/**
	 * skin/embed_method fall back on empty(), not isset() -- an explicitly
	 * empty string still resets to the built-in default rather than
	 * rendering blank. Documented here since it's a meaningfully different
	 * contract from most of the other fields in this class.
	 */
	public function test_an_explicitly_empty_skin_falls_back_to_the_default(): void {
		$defaults = Defaults::get_all( array( 'skin' => '' ) );

		$this->assertSame( 'vjs-theme-videopack', $defaults['skin'] );
	}

	public function test_an_explicitly_empty_embed_method_falls_back_to_the_default(): void {
		$defaults = Defaults::get_all( array( 'embed_method' => '' ) );

		$this->assertSame( 'Video.js', $defaults['embed_method'] );
	}

	public function test_a_non_empty_skin_override_is_used(): void {
		$defaults = Defaults::get_all( array( 'skin' => 'vjs-theme-city' ) );

		$this->assertSame( 'vjs-theme-city', $defaults['skin'] );
	}

	// -----------------------------------------------------------------
	// Watermark styles -- nested under $options['watermark_styles'].
	// -----------------------------------------------------------------

	public function test_watermark_style_defaults_with_no_options(): void {
		$defaults = Defaults::get_all( array() );

		$this->assertSame( 10, $defaults['watermark_scale'] );
		$this->assertSame( 'right', $defaults['watermark_align'] );
		$this->assertSame( 'bottom', $defaults['watermark_valign'] );
		$this->assertSame( 5.0, $defaults['watermark_x'] );
		$this->assertSame( 7.0, $defaults['watermark_y'] );
	}

	public function test_watermark_styles_are_overridable(): void {
		$defaults = Defaults::get_all(
			array(
				'watermark_styles' => array(
					'scale'  => 25,
					'align'  => 'left',
					'valign' => 'top',
					'x'      => 12.5,
					'y'      => 3.5,
				),
			)
		);

		$this->assertSame( 25, $defaults['watermark_scale'] );
		$this->assertSame( 'left', $defaults['watermark_align'] );
		$this->assertSame( 'top', $defaults['watermark_valign'] );
		$this->assertSame( 12.5, $defaults['watermark_x'] );
		$this->assertSame( 3.5, $defaults['watermark_y'] );
	}

	/**
	 * watermark_x/y use isset(), not empty() -- an explicit 0 (a legitimate
	 * "flush against the edge" offset) is preserved, unlike
	 * watermark_scale below where an explicit 0 falls back to the default.
	 * The scale slider's own minimum is 1, so a scale of 0 is not reachable
	 * through the UI today -- documented here as a latent quirk, not a bug.
	 */
	public function test_an_explicit_zero_watermark_offset_is_preserved(): void {
		$defaults = Defaults::get_all(
			array( 'watermark_styles' => array( 'x' => 0.0 ) )
		);

		$this->assertSame( 0.0, $defaults['watermark_x'] );
	}

	public function test_an_explicit_zero_watermark_scale_falls_back_to_the_default(): void {
		$defaults = Defaults::get_all(
			array( 'watermark_styles' => array( 'scale' => 0 ) )
		);

		$this->assertSame( 10, $defaults['watermark_scale'] );
	}

	// -----------------------------------------------------------------
	// Gallery / collection settings.
	// -----------------------------------------------------------------

	public function test_gallery_and_collection_settings_are_overridable(): void {
		$defaults = Defaults::get_all(
			array(
				'gallery_pagination'            => true,
				'gallery_per_page'              => 12,
				'enable_collection_video_limit' => true,
				'collection_video_limit'        => 5,
			)
		);

		$this->assertTrue( $defaults['gallery_pagination'] );
		$this->assertSame( 12, $defaults['gallery_per_page'] );
		$this->assertTrue( $defaults['enable_collection_video_limit'] );
		$this->assertSame( 5, $defaults['collection_video_limit'] );
	}
}
