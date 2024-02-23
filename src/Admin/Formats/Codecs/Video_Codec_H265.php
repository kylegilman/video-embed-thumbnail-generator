<?php

namespace Videopack\Admin\Formats\Codecs;

class Video_Codec_H265 extends Video_Codec {
	public function __construct() {
		$properties = array(
			'name'           => esc_html__( 'H.265/HEVC MP4', 'video-embed-thumbnail-generator' ),
			'label'          => esc_html__( 'H.265', 'video-embed-thumbnail-generator' ),
			'id'             => 'h265',
			'container'      => 'mp4',
			'mime'           => 'video/mp4',
			'codecs_att'     => 'hev1',
			'vcodec'         => 'libx265',
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
}
