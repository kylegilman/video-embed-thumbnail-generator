<?php
/**
 * H.264's level: the lowest level a video fits within, and the level actually
 * sent to the encoder.
 *
 * The configured level used to be sent to x264 as-is, so the shipped default of
 * 4.1 mislabeled anything bigger or faster than it allows (x264 warns about the
 * frame size, DPB and macroblock rate for 1440p and 2160p, and for 1080p at
 * 50-60 fps). Expected values are worked out from the specification's limits
 * (Table A-1) -- macroblocks are 16x16 pixels, rounded up in each direction --
 * and each boundary here was also confirmed against x264 itself, which warns one
 * level below the answer and is silent at it.
 */

use Videopack\Admin\Formats\Codecs\Video_Codec_H264;

class VideoCodecH264LevelTest extends WP_UnitTestCase {

	protected function level_for( int $width, int $height, float $frame_rate = 0.0 ): string {
		return Video_Codec_H264::get_minimum_level( $width, $height, $frame_rate );
	}

	protected function flags( string $configured_level, int $width, int $height, float $frame_rate = 0.0 ): array {
		$options = array(
			'rate_control' => 'crf',
			'h264_profile' => 'main',
			'h264_level'   => $configured_level,
			'encode'       => array( 'h264' => array( 'crf' => 23, 'vbr' => 1.0 ) ),
		);

		$dimensions = array(
			'width'  => $width,
			'height' => $height,
		);
		if ( $frame_rate ) {
			$dimensions['frame_rate'] = $frame_rate;
		}

		return ( new Video_Codec_H264() )->get_codec_ffmpeg_flags( $options, $dimensions, array( 'aac' => true ) );
	}

	protected function declared_level( array $flags ) {
		$index = array_search( '-level:v', $flags, true );
		return false === $index ? null : $flags[ $index + 1 ];
	}

	// -----------------------------------------------------------------
	// get_minimum_level()
	// -----------------------------------------------------------------

	public function test_minimum_level_by_resolution_at_30_fps(): void {
		// 640x360 is 40x23 = 920 macroblocks, 27600 per second: past 2.2's 20250, so 3.
		$this->assertSame( '3', $this->level_for( 640, 360, 30 ) );
		// 1280x720 is 3600 macroblocks, 108000 per second: exactly 3.1's limits.
		$this->assertSame( '3.1', $this->level_for( 1280, 720, 30 ) );
		// 1920x1080 is 120x68 = 8160 macroblocks, 244800 per second: within 4's 245760.
		$this->assertSame( '4', $this->level_for( 1920, 1080, 30 ) );
		// 2560x1440 is 160x90 = 14400 macroblocks, over 4.2's 8704, so 5.
		$this->assertSame( '5', $this->level_for( 2560, 1440, 30 ) );
		// 3840x2160 is 240x135 = 32400 macroblocks, 972000 per second: within 5.1's 983040.
		$this->assertSame( '5.1', $this->level_for( 3840, 2160, 30 ) );
	}

	public function test_a_higher_frame_rate_needs_a_higher_level(): void {
		$this->assertSame( '3.2', $this->level_for( 1280, 720, 60 ) );
		// 8160 * 60 = 489600 per second: over level 4's 245760, within 4.2's 522240.
		$this->assertSame( '4.2', $this->level_for( 1920, 1080, 60 ) );
		$this->assertSame( '5.1', $this->level_for( 2560, 1440, 60 ) );
		// 32400 * 60 = 1944000 per second: over 5.1's 983040, within 5.2's 2073600.
		$this->assertSame( '5.2', $this->level_for( 3840, 2160, 60 ) );
	}

	public function test_a_fractional_frame_rate_is_used_as_is(): void {
		// 23.976 fps: 8160 * 23.976 = 195644 per second, but the frame size alone
		// (8160 macroblocks, over 3.2's 5120) already needs level 4.
		$this->assertSame( '4', $this->level_for( 1920, 1080, 23.976 ) );
	}

	public function test_an_unknown_frame_rate_is_assumed_to_be_30(): void {
		$this->assertSame( $this->level_for( 1920, 1080, 30 ), $this->level_for( 1920, 1080 ) );
		$this->assertSame( $this->level_for( 3840, 2160, 30 ), $this->level_for( 3840, 2160, 0 ) );
	}

	public function test_dimensions_are_rounded_up_to_whole_macroblocks(): void {
		// 1366 wide is 86 macroblocks, not 85.4: 86x45 = 3870 is over 3.1's 3600.
		$this->assertSame( '3.2', $this->level_for( 1366, 720, 30 ) );
	}

	public function test_a_very_wide_frame_is_limited_by_its_longest_side(): void {
		// 5120x100 is only 320x7 = 2240 macroblocks, but a side may not exceed
		// sqrt( MaxFS * 8 ) macroblocks (264 at level 4.2), so it needs level 5 (420).
		$this->assertSame( '5', $this->level_for( 5120, 100, 30 ) );
	}

	public function test_a_video_too_big_for_any_level_gets_the_highest_one(): void {
		$this->assertSame( '6.2', $this->level_for( 16384, 8192, 120 ) );
	}

	public function test_8k_fits_level_6_at_30_fps(): void {
		// 480x270 = 129600 macroblocks, 3888000 per second.
		$this->assertSame( '6', $this->level_for( 7680, 4320, 30 ) );
	}

	// -----------------------------------------------------------------
	// The level actually sent to the encoder.
	// -----------------------------------------------------------------

	public function test_the_shipped_default_is_kept_when_the_video_fits(): void {
		$this->assertSame( '4.1', $this->declared_level( $this->flags( '4.1', 1920, 1080, 30 ) ) );
		$this->assertSame( '4.1', $this->declared_level( $this->flags( '4.1', 1280, 720, 30 ) ) );
		$this->assertSame( '4.1', $this->declared_level( $this->flags( '4.1', 1920, 1080 ) ), 'unknown frame rate' );
	}

	public function test_the_configured_level_is_raised_for_bigger_videos(): void {
		$this->assertSame( '5', $this->declared_level( $this->flags( '4.1', 2560, 1440, 30 ) ) );
		$this->assertSame( '5.1', $this->declared_level( $this->flags( '4.1', 3840, 2160, 30 ) ) );
	}

	public function test_the_configured_level_is_raised_for_faster_videos(): void {
		$this->assertSame( '4.2', $this->declared_level( $this->flags( '4.1', 1920, 1080, 60 ) ) );
		$this->assertSame( '5.2', $this->declared_level( $this->flags( '4.1', 3840, 2160, 59.94 ) ) );
	}

	public function test_a_higher_configured_level_is_never_lowered(): void {
		$this->assertSame( '5.2', $this->declared_level( $this->flags( '5.2', 640, 360, 30 ) ) );
		$this->assertSame( '4.2', $this->declared_level( $this->flags( '4.2', 1920, 1080, 30 ) ) );
	}

	public function test_no_level_is_sent_when_none_is_configured(): void {
		$this->assertNull( $this->declared_level( $this->flags( 'none', 3840, 2160, 60 ) ) );
	}

	public function test_the_level_flag_follows_the_profile_flags(): void {
		$flags = $this->flags( '4.1', 1280, 720, 30 );

		$this->assertSame(
			array( '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-level:v', '4.1' ),
			array_slice( $flags, -6 )
		);
	}
}
