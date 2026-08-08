<?php
namespace Videopack\Tests;

use PHPUnit\Framework\TestCase;
use Videopack\Admin\Options;

class OptionsHelpersTest extends TestCase {

	public function test_normalize_ffmpeg_status_maps_legacy_values() {
		$this->assertSame( 'available', Options::normalize_ffmpeg_status( 'on' ) );
		$this->assertSame( 'available', Options::normalize_ffmpeg_status( true ) );
		$this->assertSame( 'unavailable', Options::normalize_ffmpeg_status( 'notinstalled' ) );
		$this->assertSame( 'unchecked', Options::normalize_ffmpeg_status( 'notchecked' ) );
		$this->assertSame( 'unchecked', Options::normalize_ffmpeg_status( null ) );
		$this->assertSame( 'unchecked', Options::normalize_ffmpeg_status( 'anything-else' ) );
	}

	public function test_convert_legacy_checkbox_values() {
		$converted = Options::convert_legacy_checkbox_values(
			array(
				'autoplay' => 'on',
				'loop'     => 'false',
				'muted'    => 'off',
				'app_path' => '/usr/bin/ffmpeg',
				'threads'  => 4,
			)
		);

		$this->assertTrue( $converted['autoplay'] );
		$this->assertFalse( $converted['loop'] );
		$this->assertFalse( $converted['muted'] );
		$this->assertSame( '/usr/bin/ffmpeg', $converted['app_path'] );
		$this->assertSame( 4, $converted['threads'] );
	}

	public function test_ffmpeg_exists_raw_treats_unchecked_as_false() {
		$this->assertTrue( Options::ffmpeg_exists_raw( array( 'ffmpeg_exists' => 'available' ) ) );
		$this->assertFalse( Options::ffmpeg_exists_raw( array( 'ffmpeg_exists' => 'unavailable' ) ) );
		$this->assertFalse( Options::ffmpeg_exists_raw( array( 'ffmpeg_exists' => 'unchecked' ) ) );
		$this->assertFalse( Options::ffmpeg_exists_raw( array() ) );
	}

	public function test_set_capabilities_strips_non_string_role_keys() {
		$cleaned = ( new Options() )->set_capabilities(
			array(
				'make_video_thumbnails' => array(
					'administrator' => true,
					0                => true,
					'editor'         => true,
				),
			)
		);

		$this->assertSame(
			array(
				'administrator' => true,
				'editor'        => true,
			),
			$cleaned['make_video_thumbnails']
		);
	}

	public function test_set_capabilities_drops_non_array_capability_values() {
		$cleaned = ( new Options() )->set_capabilities(
			array(
				'make_video_thumbnails' => array( 'administrator' => true ),
				'encode_videos'         => 'not-an-array',
			)
		);

		$this->assertArrayHasKey( 'make_video_thumbnails', $cleaned );
		$this->assertArrayNotHasKey( 'encode_videos', $cleaned );
	}
}
