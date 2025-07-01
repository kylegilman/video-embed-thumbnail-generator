<?php

namespace Videopack\Admin\Formats\Codecs;

class Video_Codec_AV1 extends Video_Codec {
	public function __construct() {
		$properties = array(
			'name'           => 'AV1 WEBM',
			'label'          => 'AV1',
			'id'             => 'av1',
			'container'      => 'webm',
			'mime'           => 'video/webm',
			'codecs_att'     => 'av01',
			'vcodec'         => 'libaom-av1',
			'acodec'         => 'aac',
			'rate_control'   => array(
				'crf' => array(
					'min'     => 0,
					'max'     => 63,
					'default' => 31,
				),
				'vbr' => array(
					'default'  => 1.23,
					'constant' => -488.62,
				),
			),
			'default_encode' => false,
		);

		parent::__construct( $properties );
	}
}
