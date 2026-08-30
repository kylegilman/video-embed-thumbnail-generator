<?php
/**
 * Tests for Video_Resolution -- constructor defaults/derivation, and
 * calculate_bounded_dimensions(), the "fuzzy resolution" scaling algorithm
 * that determines the actual pixel dimensions of every encoded video
 * output (its only caller is Encode_Attachment::get_encode_dimensions(),
 * which feeds the real ffmpeg output size). Previously completely
 * untested despite being real, load-bearing math.
 */

use Videopack\Admin\Formats\Video_Resolution;

class VideoResolutionTest extends WP_UnitTestCase {

	// -----------------------------------------------------------------
	// Constructor defaults / derived properties.
	// -----------------------------------------------------------------

	public function test_label_defaults_to_height_plus_p_when_not_given(): void {
		$resolution = new Video_Resolution(
			array(
				'height'         => 720,
				'name'           => '720p HD',
				'default_encode' => true,
			)
		);

		$this->assertSame( '720p', $resolution->get_label() );
	}

	public function test_id_defaults_to_height_as_string_when_not_given(): void {
		$resolution = new Video_Resolution(
			array(
				'height'         => 1080,
				'name'           => '1080p Full HD',
				'default_encode' => true,
			)
		);

		$this->assertSame( '1080', $resolution->get_id() );
	}

	public function test_explicit_label_and_id_are_preserved(): void {
		$resolution = new Video_Resolution(
			array(
				'height'         => 0,
				'name'           => 'Full Resolution',
				'default_encode' => true,
				'label'          => 'Original',
				'id'             => 'fullres',
			)
		);

		$this->assertSame( 'Original', $resolution->get_label() );
		$this->assertSame( 'fullres', $resolution->get_id() );
	}

	public function test_constructor_defaults_for_optional_properties(): void {
		$resolution = new Video_Resolution(
			array(
				'height'         => 480,
				'name'           => '480p',
				'default_encode' => false,
			)
		);

		$this->assertFalse( $resolution->is_custom() );
		$this->assertSame( array(), $resolution->get_allowed_codecs() );
		$this->assertTrue( $resolution->is_video() );
		$this->assertTrue( $resolution->is_standard() );
		$this->assertFalse( $resolution->is_default_encode() );
	}

	public function test_set_height_only_applies_when_height_not_already_set(): void {
		$resolution = new Video_Resolution(
			array(
				'height'         => 720,
				'name'           => '720p',
				'default_encode' => true,
			)
		);

		$resolution->set_height( 1080 );

		$this->assertSame( 720, $resolution->get_height(), 'set_height() must not override an already-set height' );
	}

	public function test_set_height_applies_when_height_is_falsy(): void {
		$resolution = new Video_Resolution(
			array(
				'height'         => 0,
				'name'           => 'Custom',
				'default_encode' => true,
			)
		);

		$resolution->set_height( 540 );

		$this->assertSame( 540, $resolution->get_height() );
	}

	// -----------------------------------------------------------------
	// calculate_bounded_dimensions() -- concrete illustrative cases.
	// -----------------------------------------------------------------

	public function test_standard_16_9_downscale(): void {
		$result = Video_Resolution::calculate_bounded_dimensions( 1920, 1080, 720 );

		$this->assertSame( array( 'width' => 1280, 'height' => 720 ), $result );
	}

	public function test_zero_max_height_passes_through_unscaled_but_still_evens_dimensions(): void {
		$result = Video_Resolution::calculate_bounded_dimensions( 1921, 1081, 0 );

		$this->assertSame( array( 'width' => 1920, 'height' => 1080 ), $result );
	}

	public function test_never_upscales_beyond_source_dimensions(): void {
		$result = Video_Resolution::calculate_bounded_dimensions( 640, 360, 1080 );

		$this->assertSame( array( 'width' => 640, 'height' => 360 ), $result );
	}

	public function test_portrait_source_is_bounded_by_its_own_narrower_width(): void {
		// 1080x1920 (9:16 portrait) bounded to a 720 max height: the target
		// format height is reached at a width of 405 (far narrower than the
		// 16:9 box's 1280), so that's the binding constraint.
		$result = Video_Resolution::calculate_bounded_dimensions( 1080, 1920, 720 );

		$this->assertSame( 720, $result['height'] );
		$this->assertSame( 404, $result['width'], 'rounds 405 down to the nearest even width' );
	}

	public function test_ultrawide_source_is_bounded_by_the_16_9_box_not_its_own_aspect(): void {
		// A 3.2:1 ultrawide source bounded to "720p": scaling to exactly
		// 720 tall at its own aspect would need width 2304, but the format's
		// 16:9 box caps width at 1280 first, yielding a shorter-than-720
		// output rather than an excessively wide one.
		$result = Video_Resolution::calculate_bounded_dimensions( 3840, 1200, 720 );

		$this->assertSame( 1280, $result['width'] );
		$this->assertSame( 400, $result['height'] );
	}

	public function test_square_source_is_bounded_by_the_target_height(): void {
		$result = Video_Resolution::calculate_bounded_dimensions( 1000, 1000, 720 );

		$this->assertSame( array( 'width' => 720, 'height' => 720 ), $result );
	}

	public function test_exact_match_is_idempotent(): void {
		$result = Video_Resolution::calculate_bounded_dimensions( 1280, 720, 720 );

		$this->assertSame( array( 'width' => 1280, 'height' => 720 ), $result );
	}

	public function test_invalid_source_dimensions_floor_to_the_minimum_of_two(): void {
		// The passthrough branch keeps 0x0 as-is, but the even-flooring
		// step at the end (max(2, ...)) still applies unconditionally.
		$this->assertSame(
			array( 'width' => 2, 'height' => 2 ),
			Video_Resolution::calculate_bounded_dimensions( 0, 0, 720 )
		);
	}

	public function test_negative_dimensions_never_go_below_the_even_floor_of_two(): void {
		$result = Video_Resolution::calculate_bounded_dimensions( -100, -50, 720 );

		$this->assertSame( 2, $result['width'] );
		$this->assertSame( 2, $result['height'] );
	}

	// -----------------------------------------------------------------
	// calculate_bounded_dimensions() -- invariants that must hold for any
	// realistic input, regardless of the exact numbers (guards against the
	// double-rounding overflow the height > max_h_for_format reclamp branch
	// exists to catch, and confirms dimensions are always even).
	// -----------------------------------------------------------------

	public function bounded_dimensions_invariant_provider(): array {
		$cases = array();
		$sources = array(
			array( 1920, 1080 ),
			array( 1080, 1920 ),
			array( 3840, 2160 ),
			array( 4096, 2304 ),
			array( 640, 480 ),
			array( 3, 2 ),
			array( 16, 9 ),
			array( 641, 361 ),
			array( 1000, 563 ),
			array( 999, 1001 ),
		);
		// 1 is deliberately excluded here -- see
		// test_even_flooring_can_push_height_above_a_max_height_of_one()
		// below, which documents that specific, narrow edge case on its
		// own rather than as a data-set failure in this general sweep.
		$max_heights = array( 2, 3, 4, 57, 100, 240, 360, 480, 720, 1080, 2160 );

		foreach ( $sources as $source ) {
			foreach ( $max_heights as $max_h ) {
				$cases[ "{$source[0]}x{$source[1]}@{$max_h}" ] = array( $source[0], $source[1], $max_h );
			}
		}
		return $cases;
	}

	/**
	 * @dataProvider bounded_dimensions_invariant_provider
	 */
	public function test_height_never_exceeds_the_requested_max_height( int $source_w, int $source_h, int $max_h ): void {
		$result = Video_Resolution::calculate_bounded_dimensions( $source_w, $source_h, $max_h );

		$this->assertLessThanOrEqual( $max_h, $result['height'] );
	}

	/**
	 * @dataProvider bounded_dimensions_invariant_provider
	 */
	public function test_dimensions_never_exceed_source_dimensions( int $source_w, int $source_h, int $max_h ): void {
		$result = Video_Resolution::calculate_bounded_dimensions( $source_w, $source_h, $max_h );

		$this->assertLessThanOrEqual( $source_w, $result['width'] );
		$this->assertLessThanOrEqual( $source_h, $result['height'] );
	}

	/**
	 * @dataProvider bounded_dimensions_invariant_provider
	 */
	public function test_dimensions_are_always_even( int $source_w, int $source_h, int $max_h ): void {
		$result = Video_Resolution::calculate_bounded_dimensions( $source_w, $source_h, $max_h );

		$this->assertSame( 0, $result['width'] % 2 );
		$this->assertSame( 0, $result['height'] % 2 );
	}

	/**
	 * The even-dimension floor (`max( 2, $height - ( $height % 2 ) )`) is
	 * applied *after* height has already been clamped to
	 * $max_h_for_format, with no check that flooring back up to the
	 * minimum of 2 doesn't exceed that clamp. For $max_h_for_format === 1,
	 * height is set to 1 (an odd number below the floor), and
	 * `max( 2, 1 - 1 )` raises it to 2 -- one pixel taller than requested,
	 * for every source resolution tested.
	 *
	 * This has no real caller currently supplying 1 (the smallest built-in
	 * resolution is 240p), but `custom_resolution` (Registry.php:152, the
	 * "Custom Resolution Height" plugin setting) is a plain, unvalidated
	 * number with no minimum enforced in the schema or the settings UI
	 * (EncodingSettings.js's TextControl has no `min` attribute) -- an
	 * admin typing "1" there would reach this exact path for real encodes.
	 *
	 * This test documents the current behavior rather than asserting a
	 * fix, pending a decision on the correct remediation (e.g. enforcing a
	 * sane minimum on the setting, or having calculate_bounded_dimensions()
	 * re-clamp after flooring).
	 */
	public function test_even_flooring_can_push_height_above_a_max_height_of_one(): void {
		$result = Video_Resolution::calculate_bounded_dimensions( 1920, 1080, 1 );

		$this->assertSame( 2, $result['height'], 'documents that the result exceeds the requested max_h_for_format of 1' );
	}
}
