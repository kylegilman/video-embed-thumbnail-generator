<?php

namespace Videopack\Admin\Formats\Codecs;

class Video_Codec_VP9 extends Video_Codec {
	public function __construct() {
		$properties = array(
			'name'           => esc_html__( 'VP9 WEBM', 'video-embed-thumbnail-generator' ),
			'label'          => esc_html__( 'VP9', 'video-embed-thumbnail-generator' ),
			'id'             => 'vp9',
			'container'      => 'webm',
			'mime'           => 'video/webm',
			'codecs_att'     => 'vp9',
			'vcodec'         => 'libvpx-vp9',
			'acodec'         => 'libopus',
			'rate_control'   => array(
				'crf' => array(
					'min'     => 0,
					'max'     => 63,
					'default' => 31,
				),
				'vbr' => array(
					'default'  => 1.47,
					'constant' => -121.63,
				),
			),
			'default_encode' => false,
		);

		parent::__construct( $properties );
	}

	protected function get_ffmpeg_vbr_flags( $plugin_options, array $dimensions ) {
		$average_bitrate = max( 100, $this->get_bitrate( $dimensions, $plugin_options['encode'][ $this->id ]['vbr'] ) );

		$vbr_flags   = array();
		$vbr_flags[] = '-b:v';
		$vbr_flags[] = $average_bitrate . 'k';
		$vbr_flags[] = '-minrate';
		$vbr_flags[] = round( $average_bitrate * .5 ) . 'k';
		$vbr_flags[] = '-maxrate';
		$vbr_flags[] = round( $average_bitrate * 1.45 ) . 'k';

		return $vbr_flags;
	}
}
