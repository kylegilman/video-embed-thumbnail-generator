<?php
/**
 * Video_Codec's encoding-parameter logic: the bitrate formula, the
 * rate-control (CRF/VBR) flag assembly, encoder selection against what FFmpeg
 * reports as available, and the get_configured_*() resolvers that layer
 * per-codec options over global ones and expose filters for add-ons.
 *
 * This is what decides the quality flags on every encode, and none of it had
 * a direct test (the existing codec tests cover container/mime/identity and
 * Ogg's registry behavior). Expected values are derived by hand from the
 * codec definitions: bitrate = round( vbr * 0.0001 * width * height +
 * constant ), e.g. H.264 at 1280x720 is 18.9 * 0.0001 * 921600 + 469 =
 * 2210.824 -> 2211.
 */

use Videopack\Admin\Formats\Codecs\Video_Codec;
use Videopack\Admin\Formats\Codecs\Video_Codec_AV1;
use Videopack\Admin\Formats\Codecs\Video_Codec_H264;
use Videopack\Admin\Formats\Codecs\Video_Codec_H265;
use Videopack\Admin\Formats\Codecs\Video_Codec_VP9;

class VideoCodecEncodingTest extends WP_UnitTestCase {

	public function tear_down() {
		remove_all_filters( 'videopack_aac_encoders' );
		remove_all_filters( 'videopack_video_codec_vbr' );
		remove_all_filters( 'videopack_video_codec_rate_control_mode' );
		remove_all_filters( 'videopack_video_codec_quality' );
		parent::tear_down();
	}

	protected function dims( int $width, int $height ): array {
		return array(
			'width'  => $width,
			'height' => $height,
		);
	}

	// -----------------------------------------------------------------
	// Construction and plain accessors.
	// -----------------------------------------------------------------

	public function test_a_bare_codec_gets_h264_style_defaults(): void {
		$codec = new Video_Codec( array() );

		$this->assertSame( 'h264', $codec->get_id() );
		$this->assertSame( 'mp4', $codec->get_container() );
		$this->assertSame( 'video/mp4', $codec->get_mime_type() );
		$this->assertSame( 'libx264', $codec->get_vcodec() );
		$this->assertSame( 'aac', $codec->get_acodec() );
		$this->assertSame( array( 'crf', 'vbr' ), $codec->get_supported_rate_controls() );
		$this->assertSame( 23, $codec->get_default_crf() );
		$this->assertSame( 10.0, $codec->get_default_vbr() );
		$this->assertFalse( $codec->is_default_encode() );
		$this->assertTrue( $codec->is_video() );
		$this->assertTrue( $codec->is_encodable() );
		$this->assertSame( 0, $codec->get_efficiency() );
	}

	public function test_properties_use_the_constructors_mime_key_and_expose_it_as_mime_type(): void {
		$codec = new Video_Codec(
			array(
				'id'   => 'custom',
				'mime' => 'video/x-custom',
			)
		);

		$properties = $codec->get_properties();

		$this->assertSame( 'video/x-custom', $properties['mime_type'] );
		$this->assertArrayNotHasKey( 'mime', $properties );
		$this->assertSame( 'custom', $properties['id'] );
	}

	public function test_concrete_codecs_expose_their_own_rate_control_defaults(): void {
		$h264 = new Video_Codec_H264();
		$h265 = new Video_Codec_H265();

		$this->assertSame( 23, $h264->get_default_crf() );
		$this->assertSame( 18.9, $h264->get_default_vbr() );
		$this->assertTrue( $h264->is_default_encode(), 'H.264 is the one codec encoded by default' );
		$this->assertSame( 28, $h265->get_default_crf() );
		$this->assertSame( 10.4, $h265->get_default_vbr() );
		$this->assertFalse( $h265->is_default_encode() );
		$this->assertSame( 258, $h265->get_rate_control()['vbr']['constant'] );
	}

	// -----------------------------------------------------------------
	// get_bitrate()
	// -----------------------------------------------------------------

	public function test_bitrate_uses_the_codecs_default_vbr_when_none_is_given(): void {
		$this->assertSame( 2211.0, ( new Video_Codec_H264() )->get_bitrate( $this->dims( 1280, 720 ) ) );
	}

	public function test_bitrate_uses_a_supplied_rate_control_value(): void {
		// 10 * 0.0001 * 921600 + 469 = 1390.6.
		$this->assertSame( 1391.0, ( new Video_Codec_H264() )->get_bitrate( $this->dims( 1280, 720 ), 10 ) );
	}

	public function test_bitrate_scales_with_the_pixel_count(): void {
		// 18.9 * 0.0001 * 230400 + 469 = 904.456.
		$this->assertSame( 904.0, ( new Video_Codec_H264() )->get_bitrate( $this->dims( 640, 360 ) ) );
	}

	public function test_bitrate_applies_a_negative_constant(): void {
		// AV1: 12.3 * 0.0001 * 2073600 - 488.62 = 2061.908.
		$this->assertSame( 2062.0, ( new Video_Codec_AV1() )->get_bitrate( $this->dims( 1920, 1080 ) ) );
	}

	public function test_bitrate_for_a_small_video_with_a_negative_constant_is_itself_negative(): void {
		// AV1: 12.3 * 0.0001 * 76800 - 488.62 = -394.156. get_bitrate() is the raw
		// formula; the flag builders and get_configured_bitrate() clamp it.
		$this->assertSame( -394.0, ( new Video_Codec_AV1() )->get_bitrate( $this->dims( 320, 240 ) ) );
	}

	// -----------------------------------------------------------------
	// get_vcodec() / get_acodec() -- choosing among available encoders.
	// -----------------------------------------------------------------

	public function test_a_single_vcodec_is_returned_regardless_of_what_is_available(): void {
		$codec = new Video_Codec_H264();

		$this->assertSame( 'libx264', $codec->get_vcodec() );
		$this->assertSame( 'libx264', $codec->get_vcodec( array( 'libx265' => true ) ) );
	}

	public function test_an_array_vcodec_picks_the_first_available_encoder(): void {
		$codec = new Video_Codec_AV1(); // array( 'libsvtav1', 'libaom-av1' ).

		$this->assertSame( 'libsvtav1', $codec->get_vcodec( array( 'libsvtav1' => true, 'libaom-av1' => true ) ) );
		$this->assertSame( 'libaom-av1', $codec->get_vcodec( array( 'libaom-av1' => true ) ), 'falls to the second when only it exists' );
	}

	public function test_an_array_vcodec_falls_back_to_the_first_when_none_is_available_or_none_is_known(): void {
		$codec = new Video_Codec_AV1();

		$this->assertSame( 'libsvtav1', $codec->get_vcodec( array( 'libx264' => true ) ) );
		$this->assertSame( 'libsvtav1', $codec->get_vcodec( array() ) );
		$this->assertSame( 'libsvtav1', $codec->get_vcodec() );
	}

	public function test_aac_prefers_libfdk_aac_then_the_native_encoder(): void {
		$codec = new Video_Codec_H264();

		$this->assertSame( 'libfdk_aac', $codec->get_acodec( array( 'libfdk_aac' => true, 'aac' => true ) ) );
		$this->assertSame( 'aac', $codec->get_acodec( array( 'libfdk_aac' => false, 'aac' => true ) ) );
	}

	public function test_aac_only_counts_an_encoder_reported_as_exactly_true(): void {
		$codec = new Video_Codec_H264();

		// A merely truthy value is not "available" -- the check is === true.
		$this->assertSame( 'aac', $codec->get_acodec( array( 'libfdk_aac' => 1, 'libfaac' => 'yes' ) ) );
	}

	public function test_aac_stays_aac_when_no_preferred_encoder_is_available_or_nothing_is_known(): void {
		$codec = new Video_Codec_H264();

		$this->assertSame( 'aac', $codec->get_acodec( array( 'libx264' => true ) ) );
		$this->assertSame( 'aac', $codec->get_acodec( array() ) );
		$this->assertSame( 'aac', $codec->get_acodec() );
	}

	public function test_the_aac_encoder_preference_order_is_filterable(): void {
		add_filter(
			'videopack_aac_encoders',
			static function () {
				return array( 'aac', 'libfdk_aac' );
			}
		);

		$codec = new Video_Codec_H264();

		$this->assertSame( 'aac', $codec->get_acodec( array( 'libfdk_aac' => true, 'aac' => true ) ) );
	}

	public function test_opus_falls_back_to_vorbis_when_libopus_is_unavailable(): void {
		$codec = new Video_Codec_VP9(); // acodec libopus.

		$this->assertSame( 'libopus', $codec->get_acodec( array( 'libopus' => true ) ) );
		$this->assertSame( 'libvorbis', $codec->get_acodec( array( 'libopus' => false ) ) );
		$this->assertSame( 'libvorbis', $codec->get_acodec( array( 'libx264' => true ) ), 'not listed at all counts as unavailable' );
	}

	public function test_opus_is_left_alone_when_availability_is_unknown(): void {
		$this->assertSame( 'libopus', ( new Video_Codec_VP9() )->get_acodec() );
		$this->assertSame( 'libopus', ( new Video_Codec_VP9() )->get_acodec( array() ) );
	}

	// -----------------------------------------------------------------
	// get_codec_ffmpeg_flags()
	// -----------------------------------------------------------------

	public function test_h264_crf_flags_are_assembled_in_order(): void {
		$options = array(
			'rate_control' => 'crf',
			'encode'       => array( 'h264' => array( 'crf' => 20, 'vbr' => 18.9 ) ),
		);

		$flags = ( new Video_Codec_H264() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array( 'aac' => true ) );

		$this->assertSame(
			array( '-acodec', 'aac', '-vcodec', 'libx264', '-crf', 20, '-s', '1280x720', '-movflags', 'faststart', '-tag:v', 'avc1' ),
			$flags
		);
	}

	public function test_h264_vbr_flags_use_the_computed_bitrate_in_kilobits(): void {
		$options = array(
			'rate_control' => 'vbr',
			'encode'       => array( 'h264' => array( 'crf' => 23, 'vbr' => 18.9 ) ),
		);

		$flags = ( new Video_Codec_H264() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array( 'aac' => true ) );

		$this->assertSame(
			array( '-acodec', 'aac', '-vcodec', 'libx264', '-b:v', '2211k', '-s', '1280x720', '-movflags', 'faststart', '-tag:v', 'avc1' ),
			$flags
		);
	}

	public function test_a_codecs_own_rate_control_choice_overrides_the_global_one(): void {
		$options = array(
			'rate_control' => 'crf',
			'encode'       => array( 'h264' => array( 'crf' => 23, 'vbr' => 18.9, 'rate_control' => 'vbr' ) ),
		);

		$flags = ( new Video_Codec_H264() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array() );

		$this->assertContains( '-b:v', $flags );
		$this->assertNotContains( '-crf', $flags );
	}

	public function test_an_unrecognized_rate_control_mode_adds_no_rate_flags(): void {
		$options = array(
			'rate_control' => 'abr',
			'encode'       => array( 'h264' => array( 'crf' => 23, 'vbr' => 18.9 ) ),
		);

		$flags = ( new Video_Codec_H264() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array() );

		$this->assertNotContains( '-crf', $flags );
		$this->assertNotContains( '-b:v', $flags );
	}

	public function test_vbr_never_goes_below_100_kilobits_even_when_the_formula_is_negative(): void {
		$options = array(
			'rate_control' => 'vbr',
			'encode'       => array( 'av1' => array( 'crf' => 35, 'vbr' => 12.3 ) ),
		);

		// 320x240 AV1 computes to -394; the flag is clamped to 100k.
		$flags = ( new Video_Codec_AV1() )->get_codec_ffmpeg_flags( $options, $this->dims( 320, 240 ), array() );

		$this->assertSame( '100k', $flags[ array_search( '-b:v', $flags, true ) + 1 ] );
	}

	public function test_mp4_codecs_get_faststart_and_the_codec_tag_but_webm_does_not(): void {
		$options = array(
			'rate_control' => 'crf',
			'encode'       => array(
				'h265' => array( 'crf' => 28 ),
				'vp9'  => array( 'crf' => 31 ),
			),
		);

		$h265 = ( new Video_Codec_H265() )->get_codec_ffmpeg_flags( $options, $this->dims( 640, 360 ), array() );
		$vp9  = ( new Video_Codec_VP9() )->get_codec_ffmpeg_flags( $options, $this->dims( 640, 360 ), array( 'libopus' => true ) );

		$this->assertSame( array( '-movflags', 'faststart', '-tag:v', 'hvc1' ), array_slice( $h265, -4 ), 'HEVC needs the hvc1 tag to play in Safari' );
		$this->assertSame(
			array( '-acodec', 'libopus', '-vcodec', 'libvpx-vp9', '-crf', 31, '-s', '640x360' ),
			$vp9,
			'a WebM output has no mp4-only flags'
		);
	}

	public function test_flags_use_the_available_audio_and_video_encoders(): void {
		$options = array(
			'rate_control' => 'crf',
			'encode'       => array( 'av1' => array( 'crf' => 35 ) ),
		);

		$flags = ( new Video_Codec_AV1() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array( 'libaom-av1' => true, 'libfdk_aac' => true ) );

		$this->assertSame( 'libfdk_aac', $flags[1] );
		$this->assertSame( 'libaom-av1', $flags[3] );
	}

	// -----------------------------------------------------------------
	// get_configured_bitrate()
	// -----------------------------------------------------------------

	public function test_configured_bitrate_uses_the_codecs_option_and_returns_an_int(): void {
		$options = array( 'encode' => array( 'h264' => array( 'vbr' => 10 ) ) );

		$this->assertSame( 1391, ( new Video_Codec_H264() )->get_configured_bitrate( $this->dims( 1280, 720 ), $options ) );
	}

	public function test_configured_bitrate_falls_back_to_the_codec_default_without_an_option(): void {
		$this->assertSame( 2211, ( new Video_Codec_H264() )->get_configured_bitrate( $this->dims( 1280, 720 ), array() ) );
	}

	public function test_configured_bitrate_is_clamped_to_at_least_100(): void {
		$this->assertSame( 100, ( new Video_Codec_AV1() )->get_configured_bitrate( $this->dims( 320, 240 ), array() ) );
	}

	public function test_configured_bitrate_vbr_is_filterable_and_receives_its_context(): void {
		$seen = array();
		add_filter(
			'videopack_video_codec_vbr',
			static function ( $vbr, $codec, $dimensions, $options, $alternate ) use ( &$seen ) {
				$seen = compact( 'vbr', 'codec', 'dimensions', 'options', 'alternate' );
				return 5;
			},
			10,
			5
		);
		$options = array( 'encode' => array( 'h264' => array( 'vbr' => 10 ) ) );
		$codec   = new Video_Codec_H264();

		// 5 * 0.0001 * 921600 + 469 = 929.8.
		$bitrate = $codec->get_configured_bitrate( $this->dims( 1280, 720 ), $options, true );

		$this->assertSame( 930, $bitrate );
		$this->assertSame( 10, $seen['vbr'], 'the filter sees the configured value' );
		$this->assertSame( $codec, $seen['codec'] );
		$this->assertSame( $this->dims( 1280, 720 ), $seen['dimensions'] );
		$this->assertSame( $options, $seen['options'] );
		$this->assertTrue( $seen['alternate'] );
	}

	// -----------------------------------------------------------------
	// get_configured_rate_control_mode() / get_configured_quality()
	// -----------------------------------------------------------------

	public function test_rate_control_mode_prefers_the_codec_then_the_global_then_crf(): void {
		$codec = new Video_Codec_H264();

		$this->assertSame( 'vbr', $codec->get_configured_rate_control_mode( array( 'rate_control' => 'crf', 'encode' => array( 'h264' => array( 'rate_control' => 'vbr' ) ) ) ) );
		$this->assertSame( 'vbr', $codec->get_configured_rate_control_mode( array( 'rate_control' => 'vbr' ) ) );
		$this->assertSame( 'crf', $codec->get_configured_rate_control_mode( array() ) );
	}

	public function test_rate_control_mode_is_filterable(): void {
		add_filter(
			'videopack_video_codec_rate_control_mode',
			static function ( $mode, $codec, $options, $alternate ) {
				return $alternate ? 'vbr' : $mode;
			},
			10,
			4
		);
		$codec = new Video_Codec_H264();

		$this->assertSame( 'crf', $codec->get_configured_rate_control_mode( array(), false ) );
		$this->assertSame( 'vbr', $codec->get_configured_rate_control_mode( array(), true ) );
	}

	public function test_configured_quality_uses_the_codecs_crf_as_a_float(): void {
		$options = array( 'encode' => array( 'h264' => array( 'crf' => 18 ) ) );

		$this->assertSame( 18.0, ( new Video_Codec_H264() )->get_configured_quality( $options ) );
	}

	public function test_configured_quality_falls_back_to_the_codec_default_crf(): void {
		$this->assertSame( 23.0, ( new Video_Codec_H264() )->get_configured_quality( array() ) );
		$this->assertSame( 28.0, ( new Video_Codec_H265() )->get_configured_quality( array() ) );
	}

	public function test_configured_quality_is_filterable(): void {
		add_filter(
			'videopack_video_codec_quality',
			static function ( $crf, $codec, $options, $alternate ) {
				return $alternate ? 30.5 : $crf;
			},
			10,
			4
		);
		$codec = new Video_Codec_H264();

		$this->assertSame( 23.0, $codec->get_configured_quality( array(), false ) );
		$this->assertSame( 30.5, $codec->get_configured_quality( array(), true ) );
	}
}
