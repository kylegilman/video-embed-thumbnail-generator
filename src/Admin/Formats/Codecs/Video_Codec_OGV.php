<?php

namespace Videopack\Admin\Formats\Codecs;

class Video_Codec_OGV extends Video_Codec {
	public function __construct() {
		$properties = array(
			'name'           => 'OGV',
			'label'          => 'OGV',
			'id'             => 'ogv',
			'container'      => 'ogv',
			'mime'           => 'video/ogg',
			'codecs_att'     => 'theora',
			'vcodec'         => 'libtheora',
			'acodec'         => 'libvorbis',
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

	protected function get_ffmpeg_crf_flags( array $plugin_options ) {
			$crf_flags   = array();
			$crf_flags[] = '-q:v';
			$crf_flags[] = $plugin_options['encode'][ $this->id ]['crf'];
			return $crf_flags;
	}
}
