<?php

namespace Videopack\Admin\Formats\Codecs;

class Video_Codec_H265 extends Video_Codec {
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
					'default'  => 1.04,
					'constant' => 258,
				),
			),
			'default_encode' => false,
		);

		parent::__construct( $properties );
	}

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
