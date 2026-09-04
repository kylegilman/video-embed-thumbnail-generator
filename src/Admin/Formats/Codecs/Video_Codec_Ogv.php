<?php
/**
 * Ogg Theora Video Codec Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats\Codecs;

/**
 * Class Video_Codec_Ogv
 *
 * Represents the Ogg Theora video codec. Videopack v4 offered this as an
 * encoding target; v5 no longer does (see is_encodable below), but sites
 * with a directly-uploaded .ogv/.ogg video, or a v4-encoded Ogg Theora
 * child file, still need this registered so those files resolve to a real
 * codec and actually get served to the player instead of being silently
 * dropped for having no matching codec.
 */
class Video_Codec_Ogv extends Video_Codec {
	/**
	 * Video_Codec_Ogv constructor.
	 */
	public function __construct() {
		$properties = array(
			'name'           => 'Ogg Theora',
			'label'          => 'Ogg',
			'id'             => 'ogv',
			'container'      => 'ogv',
			'mime'           => 'video/ogg',
			'codecs_att'     => 'theora',
			'efficiency'     => 0,
			'vcodec'         => 'libtheora',
			'acodec'         => 'libvorbis',
			'default_encode' => false,
			'is_encodable'   => false,
		);

		parent::__construct( $properties );
	}
}
