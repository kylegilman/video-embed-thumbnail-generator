<?php

namespace Videopack\Admin\Formats\Codecs;

class Video_Codec_H264 extends Video_Codec {
	public function __construct() {
		$properties = array(
			'name'           => esc_html__( 'H.264 MP4', 'video-embed-thumbnail-generator' ),
			'label'          => esc_html__( 'H.264', 'video-embed-thumbnail-generator' ),
			'id'             => 'h264',
			'container'      => 'mp4',
			'mime'           => 'video/mp4',
			'fourcc'         => 'avc1',
			'vcodec'         => 'libx264',
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
}
