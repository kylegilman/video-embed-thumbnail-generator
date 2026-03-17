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
}
