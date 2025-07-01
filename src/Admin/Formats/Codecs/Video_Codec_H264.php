<?php

namespace Videopack\Admin\Formats\Codecs;

class Video_Codec_H264 extends Video_Codec {
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
				),
				'vbr' => array(
					'default'  => 1.89,
					'constant' => 469,
				),
			),
			'default_encode' => true,
		);

		parent::__construct( $properties );
	}

	public function get_codec_ffmpeg_flags( array $plugin_options, array $dimensions, array $codecs ) {
		$flags = parent::get_codec_ffmpeg_flags( $plugin_options, $dimensions, $codecs );

		if ( ! empty( $plugin_options['h264_profile'] ) && $plugin_options['h264_profile'] !== 'none' ) {
			$flags = '-profile:v';
			$flags = $plugin_options['h264_profile'];

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
