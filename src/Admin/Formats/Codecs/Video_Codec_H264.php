<?php
/**
 * H.264 Video Codec Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats\Codecs;

/**
 * Class Video_Codec_H264
 *
 * Represents the H.264 video codec.
 */
class Video_Codec_H264 extends Video_Codec {
	/**
	 * Video_Codec_H264 constructor.
	 */
	public function __construct() {
		$properties = array(
			'name'           => 'H.264 MP4',
			'label'          => 'H.264',
			'id'             => 'h264',
			'container'      => 'mp4',
			'mime'           => 'video/mp4',
			'codecs_att'     => 'avc1',
			'efficiency'     => 20,
			'vcodec'         => 'libx264',
			'acodec'         => 'aac',
			'rate_control'   => array(
				'crf' => array(
					'min'     => 0,
					'max'     => 51,
					'default' => 23,
					'labels'  => array(
						18 => '18: visually lossless',
					),
				),
				'vbr' => array(
					'default'     => 1.0,
					'coefficient' => 0.004404,
					'exponent'    => 0.92,
				),
			),
			'default_encode' => true,
		);

		parent::__construct( $properties );
	}

	/**
	 * Limits of each H.264 level from the specification (Table A-1): the highest
	 * macroblock rate (macroblocks per second) and frame size (macroblocks per
	 * frame) it allows. A macroblock is a 16x16 pixel block. Ordered lowest first.
	 * Levels are strings because PHP would turn keys like '3' into integers.
	 */
	const LEVEL_LIMITS = array(
		array( '1', 1485, 99 ),
		array( '1.1', 3000, 396 ),
		array( '1.2', 6000, 396 ),
		array( '1.3', 11880, 396 ),
		array( '2', 11880, 396 ),
		array( '2.1', 19800, 792 ),
		array( '2.2', 20250, 1620 ),
		array( '3', 40500, 1620 ),
		array( '3.1', 108000, 3600 ),
		array( '3.2', 216000, 5120 ),
		array( '4', 245760, 8192 ),
		array( '4.1', 245760, 8192 ),
		array( '4.2', 522240, 8704 ),
		array( '5', 589824, 22080 ),
		array( '5.1', 983040, 36864 ),
		array( '5.2', 2073600, 36864 ),
		array( '6', 4177920, 139264 ),
		array( '6.1', 8355840, 139264 ),
		array( '6.2', 16711680, 139264 ),
	);

	/**
	 * Frame rate assumed for the level calculation when the source's is unknown.
	 */
	const ASSUMED_FRAME_RATE = 30;

	/**
	 * Finds the lowest H.264 level a video of this size and frame rate fits within.
	 *
	 * Declaring a level lower than the stream needs makes it non-conformant, and
	 * x264 warns that the frame size, DPB and macroblock rate exceed it.
	 *
	 * @param int   $width      Video width in pixels.
	 * @param int   $height     Video height in pixels.
	 * @param float $frame_rate Frame rate; ASSUMED_FRAME_RATE when 0 or unknown.
	 * @return string The level, such as '4.1'. The highest level when none is enough.
	 */
	public static function get_minimum_level( int $width, int $height, float $frame_rate = 0.0 ): string {
		$mb_width  = (int) ceil( $width / 16 );
		$mb_height = (int) ceil( $height / 16 );
		$mb_frame  = $mb_width * $mb_height;
		$mb_rate   = $mb_frame * ( $frame_rate > 0 ? $frame_rate : self::ASSUMED_FRAME_RATE );

		foreach ( self::LEVEL_LIMITS as $limits ) {
			list( $level, $max_mb_rate, $max_mb_frame ) = $limits;

			// The specification also caps each dimension at sqrt( MaxFS * 8 ) macroblocks.
			$max_mb_dimension = sqrt( $max_mb_frame * 8 );

			if ( $mb_frame <= $max_mb_frame && $mb_rate <= $max_mb_rate && $mb_width <= $max_mb_dimension && $mb_height <= $max_mb_dimension ) {
				return $level;
			}
		}

		return self::LEVEL_LIMITS[ count( self::LEVEL_LIMITS ) - 1 ][0];
	}

	/**
	 * Picks the level to declare: the configured level, raised if this video is
	 * too large or fast for it.
	 *
	 * @param string $configured The configured level.
	 * @param array  $dimensions Associative array with 'width' and 'height', and optionally 'frame_rate'.
	 * @return string The level to use.
	 */
	protected function get_effective_level( string $configured, array $dimensions ): string {
		$required = self::get_minimum_level( (int) $dimensions['width'], (int) $dimensions['height'], (float) ( $dimensions['frame_rate'] ?? 0 ) );

		return version_compare( $required, $configured, '>' ) ? $required : $configured;
	}

	/**
	 * Get codec-specific FFmpeg flags for H.264.
	 *
	 * @param array $plugin_options The global plugin options.
	 * @param array $dimensions     Associative array with 'width' and 'height', and optionally the source's 'frame_rate'.
	 * @param array $codecs         Associative array of available FFmpeg encoders.
	 * @return array An array of FFmpeg flags.
	 */
	public function get_codec_ffmpeg_flags( array $plugin_options, array $dimensions, array $codecs ): array {
		$flags = parent::get_codec_ffmpeg_flags( $plugin_options, $dimensions, $codecs );

		if ( ! empty( $plugin_options['h264_profile'] ) && $plugin_options['h264_profile'] !== 'none' ) {
			$flags[] = '-profile:v';
			$flags[] = $plugin_options['h264_profile'];

			// yuv420p is generally required for broad compatibility with baseline, main, high profiles.
			// High422 and High444 support other pixel formats.
			if ( $plugin_options['h264_profile'] !== 'high422' && $plugin_options['h264_profile'] !== 'high444' ) {
				$flags[] = '-pix_fmt';
				$flags[] = 'yuv420p';
			}
		}

		if ( ! empty( $plugin_options['h264_level'] ) && $plugin_options['h264_level'] != 'none' ) {
			// The configured level is a minimum: larger or faster videos need a higher
			// one to be conformant.
			$flags[] = '-level:v';
			$flags[] = $this->get_effective_level( (string) $plugin_options['h264_level'], $dimensions );
		}

		return $flags;
	}

	/**
	 * Returns the CMAF/HLS codec string for H.264.
	 *
	 * @return string The codec string.
	 */
	public function get_cmaf_codec_string() {
		$options = get_option( 'videopack_options', array() );
		$profile = $options['h264_profile'] ?? 'high';
		$level   = $options['h264_level'] ?? '4.0';

		$profiles = array(
			'baseline' => '4200',
			'main'     => '4D00',
			'high'     => '6400',
		);

		$levels = array(
			'3.0' => '1E',
			'3.1' => '1F',
			'4.0' => '28',
			'4.1' => '29',
			'4.2' => '2A',
			'5.0' => '32',
			'5.1' => '33',
			'5.2' => '34',
		);

		$p = $profiles[ $profile ] ?? '6400';
		$l = $levels[ (string) $level ] ?? '28';

		return 'avc1.' . $p . $l . ',mp4a.40.2';
	}
}
