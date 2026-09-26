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
 * encoding is a videopack-cloud-streaming feature) -- but registering it
 * lets a directly-embedded or v4-era .m3u8 URL still resolve to a real
 * codec and get served to the player, which already bundles VHS
 * (videojs-http-streaming) and can play it. A manifest has no single
 * video/audio codec of its own, so vcodec/acodec/codecs_att are left
 * blank rather than guessed at.
 *
 * Mime is 'application/x-mpegURL', not the newer IANA-registered
 * 'application/vnd.apple.mpegurl' (both are valid per RFC 8216) -- matching
 * videopack-cloud-streaming's own 'upload_mimes' registration, the more
 * common convention in the wider ecosystem, and what its encoding
 * pipeline actually produces. Source::get_codec_by_mime_type() needs an
 * exact string match, so this and Attachment::add_mime_types() must
 * always agree with whatever cloud-streaming (or any future adaptive-
 * streaming add-on) uses.
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
			'mime'           => 'application/x-mpegURL',
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
