<?php
/**
 * HLS (.m3u8) Video Codec Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats\Codecs;

/**
 * Class Video_Codec_Hls
 *
 * Represents an HLS (.m3u8) manifest. Not an encoding target -- Videopack
 * core doesn't generate HLS renditions itself (real adaptive-streaming
 * encoding is a videopack-player-pro feature) -- but registering it lets a
 * directly-embedded or v4-era .m3u8 URL still resolve to a real codec and
 * get served to the player, which already bundles VHS
 * (videojs-http-streaming) and can play it. A manifest has no single
 * video/audio codec of its own, so vcodec/acodec/codecs_att are left
 * blank rather than guessed at.
 */
class Video_Codec_Hls extends Video_Codec {
	/**
	 * Video_Codec_Hls constructor.
	 */
	public function __construct() {
		$properties = array(
			'name'           => 'HLS',
			'label'          => 'HLS',
			'id'             => 'm3u8',
			'container'      => 'm3u8',
			'mime'           => 'application/vnd.apple.mpegurl',
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
