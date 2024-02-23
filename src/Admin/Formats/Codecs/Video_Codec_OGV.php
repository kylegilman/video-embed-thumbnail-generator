<?php

namespace Videopack\Admin\Formats\Codecs;

class Video_Codec_OGV extends Video_Codec {
	public function __construct() {
		$properties = array(
			'name'           => esc_html__( 'OGV', 'video-embed-thumbnail-generator' ),
			'label'          => esc_html__( 'OGV', 'video-embed-thumbnail-generator' ),
			'id'             => 'ogv',
			'container'      => 'ogv',
			'mime'           => 'video/ogg',
			'codecs_att'     => 'theora',
			'vcodec'         => 'libtheora',
			'rate_control'   => array(
				'crf' => array(
					'min'     => 0,
					'max'     => 10,
					'default' => 6,
				),
				'vbr' => array(
					'default'  => false,
					'constant' => false,
				),
			),
			'default_encode' => false,
		);

		parent::__construct( $properties );
	}
}
