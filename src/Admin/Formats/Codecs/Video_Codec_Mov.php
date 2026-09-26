<?php
/**
 * QuickTime Video Codec Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats\Codecs;

/**
 * Class Video_Codec_Mov
 *
 * Represents the QuickTime (.mov) container. Not an encoding target (see
 * is_encodable below) -- registered so a directly-uploaded .mov video, or
 * a v4-era one, still resolves to a real codec and gets served to the
 * player instead of being silently dropped for having no matching codec.
 * A .mov's actual video/audio codec varies, so vcodec/acodec/codecs_att
 * are left blank rather than guessed at.
 */
class Video_Codec_Mov extends Video_Codec {
	/**
	 * Video_Codec_Mov constructor.
	 */
	public function __construct() {
		$properties = array(
			'name'           => 'QuickTime',
			'label'          => 'MOV',
			'id'             => 'mov',
			'container'      => 'mov',
			'mime'           => 'video/quicktime',
			'codecs_att'     => '',
			'efficiency'     => 0,
			'vcodec'         => '',
			'acodec'         => '',
			'default_encode' => false,
			'is_encodable'   => false,
		);

		parent::__construct( $properties );
	}
}
