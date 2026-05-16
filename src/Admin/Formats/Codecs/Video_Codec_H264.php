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
					'default'  => 18.9,
					'constant' => 469,
				),
			),
			'default_encode' => true,
		);

		parent::__construct( $properties );
	}

	/**
	 * Get codec-specific FFmpeg flags for H.264.
	 *
	 * @param array $plugin_options The global plugin options.
	 * @param array $dimensions     Associative array with 'width' and 'height'.
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
			$flags[] = '-level:v';
			$flags[] = $plugin_options['h264_level'];
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
