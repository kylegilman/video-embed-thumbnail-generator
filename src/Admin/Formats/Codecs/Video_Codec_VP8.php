<?php

namespace Videopack\Admin\Formats\Codecs;

class Video_Codec_VP8 extends Video_Codec {
	public function __construct() {
		$properties = array(
			'name'           => 'VP8 WEBM',
			'label'          => 'VP8',
			'id'             => 'vp8',
			'container'      => 'webm',
			'mime'           => 'video/webm',
			'codecs_att'     => 'vp8',
			'vcodec'         => 'libvpx',
			'acodec'         => 'libvorbis',
			'rate_control'   => array(
				'crf' => array(
					'min'     => 4,
					'max'     => 63,
					'default' => 10,
				),
				'vbr' => array(
					'default'  => 1.89,
					'constant' => 469,
				),
			),
			'default_encode' => false,
		);

		parent::__construct( $properties );
	}
}
