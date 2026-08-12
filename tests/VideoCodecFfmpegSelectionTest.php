<?php
/**
 * Tests for Video_Codec::get_vcodec()/get_acodec() -- picking the actual
 * FFmpeg encoder library to invoke for a codec, given the map of what this
 * server's FFmpeg build actually supports (Encode_Attachment::get_codecs(),
 * parsed from `ffmpeg -codecs`). Encode_Attachment::check_if_can_queue()
 * uses these to decide 'vcodec_unavailable'/'acodec_unavailable', so
 * picking the wrong encoder here means either queuing a job that will fail
 * at encode time, or wrongly refusing to queue one that would have worked.
 */

use Videopack\Admin\Formats\Codecs\Video_Codec_AV1;
use Videopack\Admin\Formats\Codecs\Video_Codec_H264;
use Videopack\Admin\Formats\Codecs\Video_Codec_VP8;
use Videopack\Admin\Formats\Codecs\Video_Codec_VP9;

class VideoCodecFfmpegSelectionTest extends WP_UnitTestCase {

	// -----------------------------------------------------------------
	// get_vcodec()
	// -----------------------------------------------------------------

	public function test_a_string_vcodec_is_returned_unchanged_regardless_of_available_codecs(): void {
		$h264 = new Video_Codec_H264();

		$this->assertSame( 'libx264', $h264->get_vcodec() );
		$this->assertSame( 'libx264', $h264->get_vcodec( array( 'libx264' => false ) ) );
	}

	public function test_array_vcodec_defaults_to_the_first_candidate_when_no_codecs_given(): void {
		$av1 = new Video_Codec_AV1();

		$this->assertSame( 'libsvtav1', $av1->get_vcodec() );
	}

	public function test_array_vcodec_defaults_to_the_first_candidate_when_none_are_available(): void {
		$av1 = new Video_Codec_AV1();

		$this->assertSame( 'libsvtav1', $av1->get_vcodec( array( 'libsvtav1' => false, 'libaom-av1' => false ) ) );
	}

	public function test_array_vcodec_picks_the_first_available_candidate_in_preference_order(): void {
		$av1 = new Video_Codec_AV1();

		// Both available -- preference order (libsvtav1 first) wins.
		$this->assertSame( 'libsvtav1', $av1->get_vcodec( array( 'libsvtav1' => true, 'libaom-av1' => true ) ) );
	}

	public function test_array_vcodec_falls_back_to_a_later_candidate_when_the_preferred_one_is_unavailable(): void {
		$av1 = new Video_Codec_AV1();

		$this->assertSame( 'libaom-av1', $av1->get_vcodec( array( 'libsvtav1' => false, 'libaom-av1' => true ) ) );
	}

	// -----------------------------------------------------------------
	// get_acodec()
	// -----------------------------------------------------------------

	public function test_acodec_is_returned_unchanged_when_no_codecs_given(): void {
		$h264 = new Video_Codec_H264();

		$this->assertSame( 'aac', $h264->get_acodec() );
	}

	public function test_aac_prefers_libfdk_aac_when_available(): void {
		$h264 = new Video_Codec_H264();

		$this->assertSame(
			'libfdk_aac',
			$h264->get_acodec( array( 'libfdk_aac' => true, 'aac' => true ) )
		);
	}

	public function test_aac_falls_back_to_plain_aac_when_libfdk_aac_is_unavailable(): void {
		$h264 = new Video_Codec_H264();

		$this->assertSame(
			'aac',
			$h264->get_acodec( array( 'libfdk_aac' => false, 'aac' => true ) )
		);
	}

	public function test_aac_stays_the_default_when_none_of_the_preferred_encoders_are_present(): void {
		$h264 = new Video_Codec_H264();

		$this->assertSame( 'aac', $h264->get_acodec( array( 'libx264' => true ) ) );
	}

	public function test_aac_preference_order_respects_the_videopack_aac_encoders_filter(): void {
		$override = static function () {
			return array( 'libfaac' );
		};
		add_filter( 'videopack_aac_encoders', $override );

		try {
			$h264 = new Video_Codec_H264();
			// libfdk_aac being available is irrelevant now -- it's no
			// longer in the (filtered) preference list at all.
			$this->assertSame(
				'aac',
				$h264->get_acodec( array( 'libfdk_aac' => true ) )
			);
			$this->assertSame(
				'libfaac',
				$h264->get_acodec( array( 'libfdk_aac' => true, 'libfaac' => true ) )
			);
		} finally {
			remove_filter( 'videopack_aac_encoders', $override );
		}
	}

	public function test_libopus_falls_back_to_libvorbis_when_libopus_key_is_missing(): void {
		$vp9 = new Video_Codec_VP9();

		$this->assertSame( 'libvorbis', $vp9->get_acodec( array( 'libvpx-vp9' => true ) ) );
	}

	public function test_libopus_falls_back_to_libvorbis_when_explicitly_unavailable(): void {
		$vp9 = new Video_Codec_VP9();

		$this->assertSame( 'libvorbis', $vp9->get_acodec( array( 'libopus' => false ) ) );
	}

	public function test_libopus_is_kept_when_available(): void {
		$vp9 = new Video_Codec_VP9();

		$this->assertSame( 'libopus', $vp9->get_acodec( array( 'libopus' => true ) ) );
	}

	public function test_an_acodec_that_is_neither_aac_nor_libopus_is_never_substituted(): void {
		$vp8 = new Video_Codec_VP8();

		$this->assertSame( 'libvorbis', $vp8->get_acodec( array( 'libvorbis' => false ) ) );
	}
}
