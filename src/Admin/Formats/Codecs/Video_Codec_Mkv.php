<?php
/**
 * Matroska Video Codec Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats\Codecs;

/**
 * Class Video_Codec_Mkv
 *
 * Represents the Matroska (.mkv) container. Not an encoding target (see
 * is_encodable below) -- registered so a directly-uploaded .mkv video, or
 * a v4-era one, still resolves to a real codec and gets served to the
 * player instead of being silently dropped for having no matching codec.
 * A .mkv's actual video/audio codec varies, so vcodec/acodec/codecs_att
 * are left blank rather than guessed at.
 */
class Video_Codec_Mkv extends Video_Codec {
	/**
	 * Video_Codec_Mkv constructor.
	 */
	public function __construct() {
		$properties = array(
			'name'           => 'Matroska',
			'label'          => 'MKV',
			'id'             => 'mkv',
			'container'      => 'mkv',
			'mime'           => 'video/x-matroska',
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
