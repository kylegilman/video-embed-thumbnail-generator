<?php
/**
 * AV1 Video Codec Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats\Codecs;

/**
 * Class Video_Codec_AV1
 *
 * Represents the AV1 video codec.
 */
class Video_Codec_AV1 extends Video_Codec {
	/**
	 * Video_Codec_AV1 constructor.
	 */
	public function __construct() {
		$properties = array(
			'name'           => 'AV1 MP4',
			'label'          => 'AV1',
			'id'             => 'av1',
			'container'      => 'mp4',
			'mime'           => 'video/mp4',
			'codecs_att'     => 'av01',
			'vcodec'         => array( 'libsvtav1', 'libaom-av1' ),
			'acodec'         => 'aac',
			'rate_control'   => array(
				'crf' => array(
					'min'     => 0,
					'max'     => 63,
					'default' => 35,
				),
				'vbr' => array(
					'default'  => 12.3,
					'constant' => -488.62,
				),
			),
			'default_encode' => false,
		);

		parent::__construct( $properties );
	}
}
