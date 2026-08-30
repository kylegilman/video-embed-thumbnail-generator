<?php
/**
 * Tests for Registry::get_video_resolutions()'s custom resolution height
 * floor. The 'custom_resolution' setting has no enforced minimum in its
 * schema or the settings UI -- without flooring it here, a stray value
 * like 1 would reach Video_Resolution::calculate_bounded_dimensions() as
 * $max_h_for_format, whose even-pixel flooring rounds 1 back up to 2,
 * silently exceeding the requested height (see VideoResolutionTest's
 * test_even_flooring_can_push_height_above_a_max_height_of_one()).
 */

use Videopack\Admin\Formats\Registry;

class RegistryCustomResolutionTest extends WP_UnitTestCase {

	protected function registry( array $overrides = array() ): Registry {
		$options = array_merge(
			get_option( 'videopack_options', array() ),
			array( 'enable_custom_resolution' => true ),
			$overrides
		);
		return new Registry( $options );
	}

	protected function custom_resolution( Registry $registry ) {
		foreach ( $registry->get_video_resolutions() as $resolution ) {
			if ( $resolution->is_custom() ) {
				return $resolution;
			}
		}
		return null;
	}

	public function test_custom_resolution_height_is_used_as_is_when_reasonable(): void {
		$custom = $this->custom_resolution( $this->registry( array( 'custom_resolution' => 900 ) ) );

		$this->assertNotNull( $custom );
		$this->assertSame( 900, $custom->get_height() );
	}

	public function test_custom_resolution_height_floors_to_two_when_set_too_low(): void {
		$custom = $this->custom_resolution( $this->registry( array( 'custom_resolution' => 1 ) ) );

		$this->assertSame( 2, $custom->get_height() );
	}

	public function test_custom_resolution_height_floors_to_two_when_negative(): void {
		$custom = $this->custom_resolution( $this->registry( array( 'custom_resolution' => -50 ) ) );

		$this->assertSame( 2, $custom->get_height() );
	}

	public function test_no_custom_resolution_present_when_disabled(): void {
		$custom = $this->custom_resolution( $this->registry( array( 'enable_custom_resolution' => false, 'custom_resolution' => 1 ) ) );

		$this->assertNull( $custom );
	}
}
