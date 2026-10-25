<?php
/**
 * H.265's level: the lowest level a video fits within, and the level actually
 * sent to x265.
 *
 * Unlike x264, x265 refuses to encode when the level it is given is too low
 * ("frame rate is out of range for specified level", "picture dimensions are
 * out of range for specified level"), so a configured level that is too small for
 * a video would make the encode fail outright. Expected values are worked out
 * from the specification's Main tier limits (Tables A.8 and A.9) with each
 * dimension rounded up to a multiple of 8 as x265 does, and each was also
 * confirmed against x265 itself: it encodes at the answer and fails one level
 * below.
 */

use Videopack\Admin\Formats\Codecs\Video_Codec_H265;

class VideoCodecH265LevelTest extends WP_UnitTestCase {

	protected function level_for( int $width, int $height, float $frame_rate = 0.0 ): string {
		return Video_Codec_H265::get_minimum_level( $width, $height, $frame_rate );
	}

	protected function params( array $overrides, int $width, int $height, float $frame_rate = 0.0 ): ?string {
		$options = array_merge(
			get_option( 'videopack_options', array() ),
			array(
				'h265_profile' => 'none',
				'h265_level'   => 'none',
			),
			$overrides
		);

		$dimensions = array(
			'width'  => $width,
			'height' => $height,
		);
		if ( $frame_rate ) {
			$dimensions['frame_rate'] = $frame_rate;
		}

		$flags = ( new Video_Codec_H265() )->get_codec_ffmpeg_flags( $options, $dimensions, array() );
		$index = array_search( '-x265-params', $flags, true );

		return false === $index ? null : $flags[ $index + 1 ];
	}

	// -----------------------------------------------------------------
	// get_minimum_level()
	// -----------------------------------------------------------------

	public function test_minimum_level_by_resolution_at_30_fps(): void {
		// 640x360 is 230400 luma samples, 6912000 per second: past level 2's
		// 122880 picture limit, within 2.1's 245760 and 7372800.
		$this->assertSame( '2.1', $this->level_for( 640, 360, 30 ) );
		// 1280x720 is 921600 samples, 27648000 per second: within 3.1's 983040 and 33177600.
		$this->assertSame( '3.1', $this->level_for( 1280, 720, 30 ) );
		// 1920x1080 is 2073600 samples, 62208000 per second: within level 4's 2228224 and 66846720.
		$this->assertSame( '4', $this->level_for( 1920, 1080, 30 ) );
		// 2560x1440 is 3686400 samples, over level 4's picture limit, within 5's 8912896.
		$this->assertSame( '5', $this->level_for( 2560, 1440, 30 ) );
		// 3840x2160 is 8294400 samples, 248832000 per second: within level 5's 267386880.
		$this->assertSame( '5', $this->level_for( 3840, 2160, 30 ) );
	}

	public function test_a_higher_frame_rate_needs_a_higher_level(): void {
		// 921600 * 60 = 55296000 per second: over 3.1's 33177600, within level 4's.
		$this->assertSame( '4', $this->level_for( 1280, 720, 60 ) );
		// 2073600 * 60 = 124416000 per second: over level 4's 66846720, within 4.1's 133693440.
		$this->assertSame( '4.1', $this->level_for( 1920, 1080, 60 ) );
		// 8294400 * 60 = 497664000 per second: over level 5's 267386880, within 5.1's 534773760.
		$this->assertSame( '5.1', $this->level_for( 3840, 2160, 60 ) );
		// 8294400 * 120 = 995328000 per second: within 5.2's 1069547520.
		$this->assertSame( '5.2', $this->level_for( 3840, 2160, 120 ) );
	}

	public function test_a_sample_rate_exactly_at_a_levels_limit_fits_it(): void {
		// 921600 * 36 = 33177600, precisely level 3.1's limit.
		$this->assertSame( '3.1', $this->level_for( 1280, 720, 36 ) );
	}

	public function test_a_fractional_frame_rate_is_used_as_is(): void {
		$this->assertSame( '4', $this->level_for( 1920, 1080, 23.976 ) );
		// 8294400 * 59.94 = 497166336 per second: still over level 5, within 5.1.
		$this->assertSame( '5.1', $this->level_for( 3840, 2160, 59.94 ) );
	}

	public function test_an_unknown_frame_rate_is_assumed_to_be_30(): void {
		$this->assertSame( $this->level_for( 1920, 1080, 30 ), $this->level_for( 1920, 1080 ) );
		$this->assertSame( $this->level_for( 3840, 2160, 30 ), $this->level_for( 3840, 2160, 0 ) );
	}

	public function test_dimensions_are_rounded_up_to_multiples_of_8(): void {
		// 1282x766 is 982012 samples, within 3.1's 983040, but x265 sees 1288x768 =
		// 989184, over it.
		$this->assertSame( '4', $this->level_for( 1282, 766, 25 ) );
	}

	public function test_a_very_wide_frame_is_limited_by_its_longest_side(): void {
		// 3000x240 is only 720000 samples, but a side may not exceed
		// sqrt( MaxLumaPs * 8 ), which is 2804 at level 3.1, so it needs level 4 (4222).
		$this->assertSame( '4', $this->level_for( 3000, 240, 25 ) );
	}

	public function test_a_video_too_big_for_any_level_gets_the_highest_one(): void {
		$this->assertSame( '6.2', $this->level_for( 16384, 8192, 120 ) );
	}

	public function test_8k_fits_level_6_at_30_fps(): void {
		// 33177600 samples, 995328000 per second.
		$this->assertSame( '6', $this->level_for( 7680, 4320, 30 ) );
	}

	// -----------------------------------------------------------------
	// The level actually sent to x265.
	// -----------------------------------------------------------------

	public function test_the_configured_level_is_kept_when_the_video_fits(): void {
		$this->assertSame( 'level-idc=4', $this->params( array( 'h265_level' => '4' ), 1920, 1080, 30 ) );
		$this->assertSame( 'level-idc=4.1', $this->params( array( 'h265_level' => '4.1' ), 1920, 1080 ), 'unknown frame rate' );
	}

	public function test_the_configured_level_is_raised_for_bigger_videos(): void {
		$this->assertSame( 'level-idc=5', $this->params( array( 'h265_level' => '4.1' ), 2560, 1440, 30 ) );
		$this->assertSame( 'level-idc=5', $this->params( array( 'h265_level' => '3' ), 3840, 2160, 30 ) );
	}

	public function test_the_configured_level_is_raised_for_faster_videos(): void {
		$this->assertSame( 'level-idc=4.1', $this->params( array( 'h265_level' => '4' ), 1920, 1080, 60 ) );
		$this->assertSame( 'level-idc=5.1', $this->params( array( 'h265_level' => '5' ), 3840, 2160, 59.94 ) );
	}

	public function test_a_higher_configured_level_is_never_lowered(): void {
		$this->assertSame( 'level-idc=5.1', $this->params( array( 'h265_level' => '5.1' ), 640, 360, 30 ) );
	}

	public function test_no_level_is_sent_when_none_is_configured(): void {
		$this->assertNull( $this->params( array( 'h265_level' => 'none' ), 3840, 2160, 60 ) );
		$this->assertSame( 'profile=main', $this->params( array( 'h265_profile' => 'main', 'h265_level' => 'none' ), 3840, 2160, 60 ) );
	}

	public function test_the_raised_level_is_joined_after_the_profile(): void {
		$this->assertSame(
			'profile=main10:level-idc=5',
			$this->params( array( 'h265_profile' => 'main10', 'h265_level' => '4' ), 2560, 1440, 30 )
		);
	}
}
