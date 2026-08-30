<?php
/**
 * Tests for Video_Codec_H265 -- its constructor properties and its own
 * get_codec_ffmpeg_flags()/get_cmaf_codec_string() overrides. Its sibling
 * codecs (H264, VP8, VP9, AV1) are covered by VideoCodecFfmpegSelectionTest,
 * but H265 itself was previously completely untested despite having real
 * logic the others don't: appending libx265's `-x265-params` flag built
 * from the h265_profile/h265_level plugin options.
 */

use Videopack\Admin\Formats\Codecs\Video_Codec_H265;

class VideoCodecH265Test extends WP_UnitTestCase {

	protected function codec(): Video_Codec_H265 {
		return new Video_Codec_H265();
	}

	protected function dimensions(): array {
		return array( 'width' => 1920, 'height' => 1080 );
	}

	/**
	 * A realistic plugin options array (real defaults, which already
	 * populate a full per-codec 'encode' config) with the given overrides
	 * -- get_ffmpeg_crf_flags()/get_ffmpeg_vbr_flags() read
	 * $plugin_options['encode'][$codec_id][...] directly, with no fallback
	 * for a missing key, so a minimal hand-built array errors out.
	 */
	protected function plugin_options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	// -----------------------------------------------------------------
	// Constructor properties.
	// -----------------------------------------------------------------

	public function test_basic_identity_properties(): void {
		$codec = $this->codec();

		$this->assertSame( 'h265', $codec->get_id() );
		$this->assertSame( 'H.265', $codec->get_label() );
		$this->assertSame( 'video/mp4', $codec->get_mime_type() );
		$this->assertSame( 'hvc1', $codec->get_codecs_att() );
	}

	public function test_efficiency_is_higher_than_h264_but_lower_than_av1(): void {
		// Independently verifiable ordering: HEVC compresses better than
		// AVC/H.264 but AV1 compresses better still -- this drives which
		// codec group video.js source-selection treats as "best" first.
		$h265 = $this->codec();
		$h264 = new \Videopack\Admin\Formats\Codecs\Video_Codec_H264();
		$av1  = new \Videopack\Admin\Formats\Codecs\Video_Codec_AV1();

		$this->assertGreaterThan( $h264->get_efficiency(), $h265->get_efficiency() );
		$this->assertLessThan( $av1->get_efficiency(), $h265->get_efficiency() );
	}

	public function test_not_a_default_encode_format(): void {
		// H.265 has patent/licensing complications and inconsistent browser
		// support -- it should not be silently enabled by default.
		$this->assertFalse( $this->codec()->is_default_encode() );
	}

	// -----------------------------------------------------------------
	// get_codec_ffmpeg_flags() -- x265-params construction.
	// -----------------------------------------------------------------

	public function test_no_x265_params_flag_when_profile_and_level_are_unset(): void {
		$flags = $this->codec()->get_codec_ffmpeg_flags( $this->plugin_options(), $this->dimensions(), array() );

		$this->assertNotContains( '-x265-params', $flags );
	}

	public function test_no_x265_params_flag_when_both_are_explicitly_none(): void {
		$flags = $this->codec()->get_codec_ffmpeg_flags(
			$this->plugin_options( array( 'h265_profile' => 'none', 'h265_level' => 'none' ) ),
			$this->dimensions(),
			array()
		);

		$this->assertNotContains( '-x265-params', $flags );
	}

	public function test_x265_params_includes_only_profile_when_only_profile_set(): void {
		$flags = $this->codec()->get_codec_ffmpeg_flags(
			$this->plugin_options( array( 'h265_profile' => 'main', 'h265_level' => 'none' ) ),
			$this->dimensions(),
			array()
		);

		$index = array_search( '-x265-params', $flags, true );
		$this->assertNotFalse( $index );
		$this->assertSame( 'profile=main', $flags[ $index + 1 ] );
	}

	public function test_x265_params_includes_only_level_when_only_level_set(): void {
		$flags = $this->codec()->get_codec_ffmpeg_flags(
			$this->plugin_options( array( 'h265_level' => '5.1' ) ),
			$this->dimensions(),
			array()
		);

		$index = array_search( '-x265-params', $flags, true );
		$this->assertNotFalse( $index );
		$this->assertSame( 'level-idc=5.1', $flags[ $index + 1 ] );
	}

	public function test_x265_params_joins_profile_and_level_with_a_colon(): void {
		$flags = $this->codec()->get_codec_ffmpeg_flags(
			$this->plugin_options( array( 'h265_profile' => 'main10', 'h265_level' => '5.1' ) ),
			$this->dimensions(),
			array()
		);

		$index = array_search( '-x265-params', $flags, true );
		$this->assertNotFalse( $index );
		$this->assertSame( 'profile=main10:level-idc=5.1', $flags[ $index + 1 ] );
	}

	public function test_x265_params_appear_after_the_base_class_flags(): void {
		$flags = $this->codec()->get_codec_ffmpeg_flags(
			$this->plugin_options( array( 'h265_profile' => 'main' ) ),
			$this->dimensions(),
			array()
		);

		// Base class flags (acodec/vcodec/-s/-movflags/-tag:v) must all still
		// be present -- H265's override extends, not replaces, the parent.
		$this->assertContains( '-acodec', $flags );
		$this->assertContains( '-vcodec', $flags );
		$this->assertContains( '-tag:v', $flags );
		$this->assertSame( 'hvc1', $flags[ array_search( '-tag:v', $flags, true ) + 1 ] );

		$tag_v_index      = array_search( '-tag:v', $flags, true );
		$x265_params_index = array_search( '-x265-params', $flags, true );
		$this->assertGreaterThan( $tag_v_index, $x265_params_index, '-x265-params must be appended after the base class flags, not interleaved' );
	}

	// -----------------------------------------------------------------
	// get_cmaf_codec_string()
	// -----------------------------------------------------------------

	public function test_cmaf_codec_string(): void {
		$this->assertSame( 'hev1.1.6.L93.B0,mp4a.40.2', $this->codec()->get_cmaf_codec_string() );
	}
}
