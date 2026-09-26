<?php
/**
 * DASH (.mpd) Video Codec Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats\Codecs;

/**
 * Class Video_Codec_Dash
 *
 * Represents an MPEG-DASH (.mpd) manifest. Not an encoding target --
 * Videopack core doesn't generate DASH renditions itself (real
 * adaptive-streaming encoding is a videopack-player-pro feature) -- but
 * registering it lets a directly-embedded or v4-era .mpd URL still
 * resolve to a real codec and get served to the player, which already
 * bundles VHS (videojs-http-streaming) and can play it. A manifest has no
 * single video/audio codec of its own, so vcodec/acodec/codecs_att are
 * left blank rather than guessed at.
 */
class Video_Codec_Dash extends Video_Codec {
	/**
	 * Video_Codec_Dash constructor.
	 */
	public function __construct() {
		$properties = array(
			'name'           => 'DASH',
			'label'          => 'DASH',
			'id'             => 'mpd',
			'container'      => 'mpd',
			'mime'           => 'application/dash+xml',
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
