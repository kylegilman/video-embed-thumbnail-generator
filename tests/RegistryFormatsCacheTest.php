<?php
/**
 * Regression test for a Registry::get_video_formats() bug: its result used
 * to be memoized in a `static` variable declared inside the method, which
 * in PHP is shared by every Registry instance in the process -- not scoped
 * to `$this`. Two Registry objects built with different `replace_format`
 * options (e.g. different blogs in a multisite batch job, or simply two
 * instances within one PHPUnit run) would silently share one instance's
 * cached format list, so `Video_Format::get_replaces_original()` could
 * report the wrong format as "replaces original" for every Registry after
 * the first one built in that process.
 */

use Videopack\Admin\Formats\Registry;

class RegistryFormatsCacheTest extends WP_UnitTestCase {

	public function test_get_video_formats_reflects_each_instances_own_replace_format_setting(): void {
		$options_a = array_merge( get_option( 'videopack_options', array() ), array( 'replace_format' => 'none' ) );
		$registry_a = new Registry( $options_a );
		$formats_a  = $registry_a->get_video_formats();

		$this->assertFalse( $formats_a['h264_1080']->get_replaces_original() );

		$options_b  = array_merge( get_option( 'videopack_options', array() ), array( 'replace_format' => 'h264_1080' ) );
		$registry_b = new Registry( $options_b );
		$formats_b  = $registry_b->get_video_formats();

		$this->assertTrue( $formats_b['h264_1080']->get_replaces_original() );
		// A different format on the same (now-stale-if-cached) instance must
		// still report false -- only the configured one replaces original.
		$this->assertFalse( $formats_b['h264_720']->get_replaces_original() );

		// Calling get_video_formats() again on the first, unrelated instance
		// must still reflect its own original setting, not instance B's.
		$this->assertFalse( $registry_a->get_video_formats()['h264_1080']->get_replaces_original() );
	}

	public function test_get_video_formats_reflects_a_changed_replace_format_across_separate_instances_in_sequence(): void {
		// Three instances in a row, alternating which format replaces the
		// original -- proves there's no "first call wins" stickiness left.
		$settings = array( 'h264_720', 'h264_1080', 'none' );

		foreach ( $settings as $replace_format ) {
			$options  = array_merge( get_option( 'videopack_options', array() ), array( 'replace_format' => $replace_format ) );
			$registry = new Registry( $options );
			$formats  = $registry->get_video_formats();

			foreach ( array( 'h264_720', 'h264_1080' ) as $format_id ) {
				$expected = ( $format_id === $replace_format );
				$this->assertSame( $expected, $formats[ $format_id ]->get_replaces_original(), "format {$format_id} with replace_format={$replace_format}" );
			}
		}
	}
}
