<?php
/**
 * Tests for Video_Metadata::parse_rotation() -- extracting display rotation
 * from `ffmpeg -i` stderr output.
 *
 * Historically this only matched the legacy `rotate` metadata tag. Newer
 * encoders (and newer FFmpeg builds) increasingly express rotation solely
 * via a `displaymatrix` side-data line, with no `rotate` tag present at all.
 * Missing that case means server-generated thumbnails come out sideways
 * with no error. This suite locks in both sources plus their precedence.
 */

use Videopack\Admin\Encode\Video_Metadata;

class VideoMetadataRotationTest extends WP_UnitTestCase {

	public function test_no_rotation_metadata_returns_empty_string() {
		$output = "Stream #0:0: Video: h264, yuv420p, 1920x1080, 30 fps\n";
		$this->assertSame( '', Video_Metadata::parse_rotation( $output ) );
	}

	public function test_legacy_rotate_tag_90() {
		$output = "    Side data:\n    rotate          : 90\n";
		$this->assertSame( 90, Video_Metadata::parse_rotation( $output ) );
	}

	public function test_legacy_rotate_tag_negative_90_normalizes_to_270() {
		$output = "    Side data:\n    rotate          : -90\n";
		$this->assertSame( 270, Video_Metadata::parse_rotation( $output ) );
	}

	public function test_legacy_rotate_tag_180() {
		$output = "    Side data:\n    rotate          : 180\n";
		$this->assertSame( 180, Video_Metadata::parse_rotation( $output ) );
	}

	/**
	 * A file with no `rotate` tag at all, only a displaymatrix side-data
	 * entry -- the case the legacy-only regex used to miss entirely.
	 */
	public function test_displaymatrix_only_rotation_of_negative_90_maps_to_90() {
		$output = "  Side data:\n    displaymatrix: rotation of -90.00 degrees\n";
		$this->assertSame( 90, Video_Metadata::parse_rotation( $output ) );
	}

	public function test_displaymatrix_only_rotation_of_90_maps_to_270() {
		$output = "  Side data:\n    displaymatrix: rotation of 90.00 degrees\n";
		$this->assertSame( 270, Video_Metadata::parse_rotation( $output ) );
	}

	public function test_displaymatrix_only_rotation_of_180() {
		$output = "  Side data:\n    displaymatrix: rotation of 180.00 degrees\n";
		$this->assertSame( 180, Video_Metadata::parse_rotation( $output ) );
	}

	public function test_displaymatrix_only_rotation_of_0_returns_empty_string() {
		$output = "  Side data:\n    displaymatrix: rotation of 0.00 degrees\n";
		$this->assertSame( '', Video_Metadata::parse_rotation( $output ) );
	}

	/**
	 * When both are present, the explicit `rotate` tag wins -- it's the
	 * more direct signal and what the pre-existing behavior relied on.
	 */
	public function test_rotate_tag_takes_precedence_over_displaymatrix() {
		$output = "    rotate          : 90\n    displaymatrix: rotation of 180.00 degrees\n";
		$this->assertSame( 90, Video_Metadata::parse_rotation( $output ) );
	}
}
