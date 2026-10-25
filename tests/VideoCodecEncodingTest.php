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
 * codec definitions: bitrate = round( coefficient * pixels^exponent *
 * frame rate factor * quality ), floored at 50 kbps, e.g. H.264 at 1280x720
 * is 0.004404 * 921600^0.92 = 1352.8 -> 1353.
 */

use Videopack\Admin\Formats\Codecs\Video_Codec;
use Videopack\Admin\Formats\Codecs\Video_Codec_AV1;
use Videopack\Admin\Formats\Codecs\Video_Codec_H264;
use Videopack\Admin\Formats\Codecs\Video_Codec_H265;
use Videopack\Admin\Formats\Codecs\Video_Codec_VP8;
use Videopack\Admin\Formats\Codecs\Video_Codec_VP9;

class VideoCodecEncodingTest extends WP_UnitTestCase {

	public function tear_down() {
		remove_all_filters( 'videopack_aac_encoders' );
		remove_all_filters( 'videopack_video_codec_vbr' );
		remove_all_filters( 'videopack_video_codec_rate_control_mode' );
		remove_all_filters( 'videopack_video_codec_quality' );
		parent::tear_down();
	}

	protected function dims( int $width, int $height, float $frame_rate = 0.0 ): array {
		$dims = array(
			'width'  => $width,
			'height' => $height,
		);
		if ( $frame_rate ) {
			$dims['frame_rate'] = $frame_rate;
		}
		return $dims;
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
		$this->assertSame( 1.0, $codec->get_default_vbr() );
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
		$this->assertSame( 1.0, $h264->get_default_vbr() );
		$this->assertTrue( $h264->is_default_encode(), 'H.264 is the one codec encoded by default' );
		$this->assertSame( 28, $h265->get_default_crf() );
		$this->assertSame( 1.0, $h265->get_default_vbr() );
		$this->assertFalse( $h265->is_default_encode() );
		$this->assertSame( 0.027695, $h265->get_rate_control()['vbr']['coefficient'] );
		$this->assertSame( 0.744, $h265->get_rate_control()['vbr']['exponent'] );
	}

	// -----------------------------------------------------------------
	// get_bitrate()
	// -----------------------------------------------------------------

	public function test_bitrate_uses_the_codecs_default_quality_when_none_is_given(): void {
		// 0.004404 * 921600^0.92 = 1352.8.
		$this->assertSame( 1353.0, ( new Video_Codec_H264() )->get_bitrate( $this->dims( 1280, 720 ) ) );
	}

	public function test_bitrate_scales_linearly_with_the_quality_setting(): void {
		$codec = new Video_Codec_H264();

		// 1352.8 * 1.5 = 2029.2 and 1352.8 * 0.5 = 676.4.
		$this->assertSame( 2029.0, $codec->get_bitrate( $this->dims( 1280, 720 ), 1.5 ) );
		$this->assertSame( 676.0, $codec->get_bitrate( $this->dims( 1280, 720 ), 0.5 ) );
	}

	public function test_bitrate_grows_slower_than_the_pixel_count(): void {
		$codec = new Video_Codec_H264();

		// 0.004404 * 230400^0.92 = 377.7 and 0.004404 * 2073600^0.92 = 2852.6.
		$this->assertSame( 378.0, $codec->get_bitrate( $this->dims( 640, 360 ) ) );
		$this->assertSame( 2853.0, $codec->get_bitrate( $this->dims( 1920, 1080 ) ) );
	}

	public function test_each_codec_follows_its_own_efficiency_curve(): void {
		$dims = $this->dims( 1920, 1080 );

		// 0.027695 * px^0.744, 0.033981 * px^0.734 and 0.005214 * px^0.86.
		$this->assertSame( 1387.0, ( new Video_Codec_H265() )->get_bitrate( $dims ) );
		$this->assertSame( 1471.0, ( new Video_Codec_VP9() )->get_bitrate( $dims ) );
		$this->assertSame( 1411.0, ( new Video_Codec_AV1() )->get_bitrate( $dims ) );
	}

	public function test_small_videos_get_a_real_bitrate_not_a_clamped_one(): void {
		// The old formula's negative constants pushed AV1 and VP9 to a 100 kbps
		// floor at small sizes; the power law stays positive.
		// AV1: 0.005214 * 76800^0.86 = 82.9. VP9: 0.033981 * 76800^0.734 = 130.9.
		$this->assertSame( 83.0, ( new Video_Codec_AV1() )->get_bitrate( $this->dims( 320, 240 ) ) );
		$this->assertSame( 131.0, ( new Video_Codec_VP9() )->get_bitrate( $this->dims( 320, 240 ) ) );
	}

	public function test_bitrate_never_drops_below_the_minimum(): void {
		// 1352.8 * 0.01 = 13.5, raised to the 50 kbps guard.
		$this->assertSame( 50.0, ( new Video_Codec_H264() )->get_bitrate( $this->dims( 1280, 720 ), 0.01 ) );
	}

	public function test_high_frame_rate_sources_get_one_and_a_half_times_the_bitrate(): void {
		$codec = new Video_Codec_H264();

		// 1352.8 * 1.5 = 2029.2.
		$this->assertSame( 2029.0, $codec->get_bitrate( $this->dims( 1280, 720, 60 ) ) );
		$this->assertSame( 2029.0, $codec->get_bitrate( $this->dims( 1280, 720, 50 ) ) );
		$this->assertSame( 2029.0, $codec->get_bitrate( $this->dims( 1280, 720, 48 ) ), '48 fps is the first high frame rate' );
	}

	public function test_normal_and_unknown_frame_rates_get_the_base_bitrate(): void {
		$codec = new Video_Codec_H264();

		$this->assertSame( 1353.0, $codec->get_bitrate( $this->dims( 1280, 720, 47.9 ) ) );
		$this->assertSame( 1353.0, $codec->get_bitrate( $this->dims( 1280, 720, 30 ) ) );
		$this->assertSame( 1353.0, $codec->get_bitrate( $this->dims( 1280, 720, 24 ) ) );
		$this->assertSame( 1353.0, $codec->get_bitrate( $this->dims( 1280, 720 ) ), 'no frame rate known' );
	}

	public function test_frame_rate_and_quality_multiply_together(): void {
		// 0.004404 * 2073600^0.92 = 2852.6, times 2 for quality and 1.5 for frame rate = 8557.7.
		$this->assertSame( 8558.0, ( new Video_Codec_H264() )->get_bitrate( $this->dims( 1920, 1080, 60 ), 2 ) );
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
			'encode'       => array( 'h264' => array( 'crf' => 20, 'vbr' => 1.0 ) ),
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
			'encode'       => array( 'h264' => array( 'crf' => 23, 'vbr' => 1.0 ) ),
		);

		$flags = ( new Video_Codec_H264() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array( 'aac' => true ) );

		$this->assertSame(
			array( '-acodec', 'aac', '-vcodec', 'libx264', '-b:v', '1353k', '-s', '1280x720', '-movflags', 'faststart', '-tag:v', 'avc1' ),
			$flags
		);
	}

	public function test_a_codecs_own_rate_control_choice_overrides_the_global_one(): void {
		$options = array(
			'rate_control' => 'crf',
			'encode'       => array( 'h264' => array( 'crf' => 23, 'vbr' => 1.0, 'rate_control' => 'vbr' ) ),
		);

		$flags = ( new Video_Codec_H264() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array() );

		$this->assertContains( '-b:v', $flags );
		$this->assertNotContains( '-crf', $flags );
	}

	public function test_an_unrecognized_rate_control_mode_adds_no_rate_flags(): void {
		$options = array(
			'rate_control' => 'abr',
			'encode'       => array( 'h264' => array( 'crf' => 23, 'vbr' => 1.0 ) ),
		);

		$flags = ( new Video_Codec_H264() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array() );

		$this->assertNotContains( '-crf', $flags );
		$this->assertNotContains( '-b:v', $flags );
	}

	public function test_vbr_never_goes_below_the_minimum_bitrate(): void {
		$options = array(
			'rate_control' => 'vbr',
			'encode'       => array( 'h264' => array( 'crf' => 23, 'vbr' => 0.01 ) ),
		);

		// 1352.8 * 0.01 = 13.5, raised to the 50 kbps guard.
		$flags = ( new Video_Codec_H264() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array() );

		$this->assertSame( '50k', $flags[ array_search( '-b:v', $flags, true ) + 1 ] );
	}

	public function test_vbr_flags_use_a_high_frame_rate_sources_higher_bitrate(): void {
		$options = array(
			'rate_control' => 'vbr',
			'encode'       => array( 'h264' => array( 'crf' => 23, 'vbr' => 1.0 ) ),
		);

		$flags = ( new Video_Codec_H264() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720, 59.94 ), array() );

		$this->assertSame( '2029k', $flags[ array_search( '-b:v', $flags, true ) + 1 ] );
	}

	public function test_vp9_vbr_flags_add_min_and_max_rate_around_the_average(): void {
		$options = array(
			'rate_control' => 'vbr',
			'encode'       => array( 'vp9' => array( 'crf' => 31, 'vbr' => 1.0 ) ),
		);

		$flags = ( new Video_Codec_VP9() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array( 'libopus' => true ) );

		// 0.033981 * 921600^0.734 = 811.4; min is half and max is 1.45x.
		$this->assertSame(
			array( '-acodec', 'libopus', '-vcodec', 'libvpx-vp9', '-b:v', '811k', '-minrate', '406k', '-maxrate', '1176k', '-s', '1280x720' ),
			$flags
		);
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

	/**
	 * libvpx ignores -crf without -b:v (verified: CRF 4 and 30 gave identical
	 * output on FFmpeg 5.1.2 and 8.0.1), so VP8 must always send a ceiling.
	 * The ceiling is 3x the codec's rounded bitrate: 3 * 1353 = 4059 at 1280x720.
	 */
	public function test_vp8_crf_flags_include_a_bitrate_ceiling(): void {
		$options = array(
			'rate_control' => 'crf',
			'encode'       => array( 'vp8' => array( 'crf' => 12 ) ),
		);

		$flags = ( new Video_Codec_VP8() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array( 'libvorbis' => true ) );

		$this->assertSame(
			array( '-acodec', 'libvorbis', '-vcodec', 'libvpx', '-crf', 12, '-b:v', '4059k', '-s', '1280x720' ),
			$flags
		);
	}

	public function test_vp8_crf_ceiling_is_independent_of_the_vbr_setting(): void {
		$options = array(
			'rate_control' => 'crf',
			'encode'       => array( 'vp8' => array( 'crf' => 12, 'vbr' => 1 ) ),
		);

		$flags = ( new Video_Codec_VP8() )->get_codec_ffmpeg_flags( $options, $this->dims( 1280, 720 ), array( 'libvorbis' => true ) );

		$this->assertSame( '4059k', $flags[ array_search( '-b:v', $flags, true ) + 1 ] );
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
		$options = array( 'encode' => array( 'h264' => array( 'vbr' => 0.5 ) ) );

		$this->assertSame( 676, ( new Video_Codec_H264() )->get_configured_bitrate( $this->dims( 1280, 720 ), $options ) );
	}

	public function test_configured_bitrate_falls_back_to_the_codec_default_without_an_option(): void {
		$this->assertSame( 1353, ( new Video_Codec_H264() )->get_configured_bitrate( $this->dims( 1280, 720 ), array() ) );
	}

	public function test_configured_bitrate_is_at_least_the_minimum(): void {
		$options = array( 'encode' => array( 'h264' => array( 'vbr' => 0.01 ) ) );

		$this->assertSame( 50, ( new Video_Codec_H264() )->get_configured_bitrate( $this->dims( 1280, 720 ), $options ) );
	}

	public function test_configured_bitrate_accounts_for_the_source_frame_rate(): void {
		$this->assertSame( 2029, ( new Video_Codec_H264() )->get_configured_bitrate( $this->dims( 1280, 720, 60 ), array() ) );
	}

	public function test_configured_bitrate_vbr_is_filterable_and_receives_its_context(): void {
		$seen = array();
		add_filter(
			'videopack_video_codec_vbr',
			static function ( $vbr, $codec, $dimensions, $options, $alternate ) use ( &$seen ) {
				$seen = compact( 'vbr', 'codec', 'dimensions', 'options', 'alternate' );
				return 0.5;
			},
			10,
			5
		);
		$options = array( 'encode' => array( 'h264' => array( 'vbr' => 2.0 ) ) );
		$codec   = new Video_Codec_H264();

		// The filter's 0.5 replaces the configured 2.0: 1352.8 * 0.5 = 676.4.
		$bitrate = $codec->get_configured_bitrate( $this->dims( 1280, 720 ), $options, true );

		$this->assertSame( 676, $bitrate );
		$this->assertSame( 2.0, $seen['vbr'], 'the filter sees the configured value' );
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
