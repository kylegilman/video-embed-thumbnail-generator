<?php
/**
 * VP8 Video Codec Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats\Codecs;

/**
 * Class Video_Codec_VP8
 *
 * Represents the VP8 video codec.
 */
class Video_Codec_VP8 extends Video_Codec {
	/**
	 * Video_Codec_VP8 constructor.
	 */
	public function __construct() {
		$properties = array(
			'name'           => 'VP8 WEBM',
			'label'          => 'VP8',
			'id'             => 'vp8',
			'container'      => 'webm',
			'mime'           => 'video/webm',
			'codecs_att'     => 'vp08',
			'vcodec'         => 'libvpx',
			'acodec'         => 'libvorbis',
			'rate_control'   => array(
				'crf' => array(
					'min'     => 4,
					'max'     => 63,
					'default' => 10,
				),
				'vbr' => array(
					'default'  => 18.9,
					'constant' => 469,
				),
			),
			'default_encode' => false,
		);

		parent::__construct( $properties );
	}
}
