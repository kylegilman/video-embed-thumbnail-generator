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
			'vcodec'         => 'libx265',
			'acodec'         => 'aac',
			'rate_control'   => array(
				'crf' => array(
					'min'     => 0,
					'max'     => 51,
					'default' => 28,
				),
				'vbr' => array(
					'default'  => 10.4,
					'constant' => 258,
				),
			),
			'default_encode' => false,
		);

		parent::__construct( $properties );
	}

	/**
	 * Get codec-specific FFmpeg flags for H.265.
	 *
	 * @param array $plugin_options The global plugin options.
	 * @param array $dimensions     Associative array with 'width' and 'height'.
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
			$x265_params[] = 'level-idc=' . $plugin_options['h265_level'];
		}

		if ( ! empty( $x265_params ) ) {
			$flags[] = '-x265-params';
			$flags[] = implode( ':', $x265_params );
		}

		return $flags;
	}
}
