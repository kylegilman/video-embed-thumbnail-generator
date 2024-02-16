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
			'fourcc'         => 'vp09',
			'vcodec'         => 'libvpx-vp9',
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
}
