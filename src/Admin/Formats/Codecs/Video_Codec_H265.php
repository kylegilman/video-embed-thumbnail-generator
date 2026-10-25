<?php
/**
 * H.265/HEVC Video Codec Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats\Codecs;

/**
 * Class Video_Codec_H265
 *
 * Represents the H.265/HEVC video codec.
 */
class Video_Codec_H265 extends Video_Codec {
	/**
	 * Video_Codec_H265 constructor.
	 */
	public function __construct() {
		$properties = array(
			'name'           => 'H.265/HEVC MP4',
			'label'          => 'H.265',
			'id'             => 'h265',
			'container'      => 'mp4',
			'mime'           => 'video/mp4',
			'codecs_att'     => 'hvc1',
			'efficiency'     => 40,
			'vcodec'         => 'libx265',
			'acodec'         => 'aac',
			'rate_control'   => array(
				'crf' => array(
					'min'     => 0,
					'max'     => 51,
					'default' => 28,
				),
				'vbr' => array(
					'default'     => 1.0,
					'coefficient' => 0.027695,
					'exponent'    => 0.744,
				),
			),
			'default_encode' => false,
		);

		parent::__construct( $properties );
	}

	/**
	 * Limits of each H.265 (HEVC) level on the Main tier, from the specification
	 * (Tables A.8 and A.9): the largest picture (luma samples per frame) and the
	 * highest luma sample rate (luma samples per second) it allows. Ordered lowest
	 * first. Levels are strings because PHP would turn keys like '3' into integers.
	 */
	const LEVEL_LIMITS = array(
		array( '1', 36864, 552960 ),
		array( '2', 122880, 3686400 ),
		array( '2.1', 245760, 7372800 ),
		array( '3', 552960, 16588800 ),
		array( '3.1', 983040, 33177600 ),
		array( '4', 2228224, 66846720 ),
		array( '4.1', 2228224, 133693440 ),
		array( '5', 8912896, 267386880 ),
		array( '5.1', 8912896, 534773760 ),
		array( '5.2', 8912896, 1069547520 ),
		array( '6', 35651584, 1069547520 ),
		array( '6.1', 35651584, 2139095040 ),
		array( '6.2', 35651584, 4278190080 ),
	);

	/**
	 * Frame rate assumed for the level calculation when the source's is unknown.
	 */
	const ASSUMED_FRAME_RATE = 30;

	/**
	 * Finds the lowest H.265 level a video of this size and frame rate fits within.
	 *
	 * Unlike x264, x265 refuses to encode at all when the level is too low ("picture
	 * dimensions are out of range for specified level"). It rounds each dimension up
	 * to a multiple of 8 before checking, so this does too.
	 *
	 * @param int   $width      Video width in pixels.
	 * @param int   $height     Video height in pixels.
	 * @param float $frame_rate Frame rate; ASSUMED_FRAME_RATE when 0 or unknown.
	 * @return string The level, such as '4.1'. The highest level when none is enough.
	 */
	public static function get_minimum_level( int $width, int $height, float $frame_rate = 0.0 ): string {
		$aligned_width  = (int) ceil( $width / 8 ) * 8;
		$aligned_height = (int) ceil( $height / 8 ) * 8;
		$picture_size   = $aligned_width * $aligned_height;
		$sample_rate    = $picture_size * ( $frame_rate > 0 ? $frame_rate : self::ASSUMED_FRAME_RATE );

		foreach ( self::LEVEL_LIMITS as $limits ) {
			list( $level, $max_picture_size, $max_sample_rate ) = $limits;

			// The specification also caps each dimension at sqrt( MaxLumaPs * 8 ).
			$max_dimension = sqrt( $max_picture_size * 8 );

			if ( $picture_size <= $max_picture_size && $sample_rate <= $max_sample_rate && $aligned_width <= $max_dimension && $aligned_height <= $max_dimension ) {
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
	 * Get codec-specific FFmpeg flags for H.265.
	 *
	 * @param array $plugin_options The global plugin options.
	 * @param array $dimensions     Associative array with 'width' and 'height', and optionally the source's 'frame_rate'.
	 * @param array $codecs         Associative array of available FFmpeg encoders.
	 * @return array An array of FFmpeg flags.
	 */
	public function get_codec_ffmpeg_flags( array $plugin_options, array $dimensions, array $codecs ): array {
		$flags = parent::get_codec_ffmpeg_flags( $plugin_options, $dimensions, $codecs );

		$x265_params = array();

		if ( ! empty( $plugin_options['h265_profile'] ) && $plugin_options['h265_profile'] !== 'none' ) {
			$x265_params[] = 'profile=' . $plugin_options['h265_profile'];
		}

		if ( ! empty( $plugin_options['h265_level'] ) && $plugin_options['h265_level'] !== 'none' ) {
			// The configured level is a minimum: larger or faster videos need a higher
			// one, or x265 will not encode them.
			$x265_params[] = 'level-idc=' . $this->get_effective_level( (string) $plugin_options['h265_level'], $dimensions );
		}

		if ( ! empty( $x265_params ) ) {
			$flags[] = '-x265-params';
			$flags[] = implode( ':', $x265_params );
		}

		return $flags;
	}

	/**
	 * Returns the CMAF/HLS codec string for H.265.
	 *
	 * @return string The codec string.
	 */
	public function get_cmaf_codec_string() {
		return 'hev1.1.6.L93.B0,mp4a.40.2';
	}
}
