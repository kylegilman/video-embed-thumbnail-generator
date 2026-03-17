<?php
/**
 * Video Format Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats;

use Videopack\Admin\Formats\Codecs\Video_Codec;

/**
 * Class Video_Format
 *
 * Represents a specific combination of a video codec and a resolution.
 */
class Video_Format {
	/**
	 * Video format name.
	 *
	 * @var string
	 */
	protected $name;

	/**
	 * Video format label.
	 *
	 * @var string
	 */
	protected $label;

	/**
	 * Video format unique identifier.
	 *
	 * @var string
	 */
	protected $id;

	/**
	 * Video codec.
	 *
	 * @var \Videopack\Admin\Formats\Codecs\Video_Codec $codec
	 */
	protected $codec;

	/**
	 * Video resolution.
	 *
	 * @var \Videopack\Admin\Formats\Video_Resolution $resolution
	 */
	protected $resolution;

	/**
	 * Is video format enabled in Videopack options?
	 *
	 * @var bool
	 */
	protected $enabled;

	/**
	 * Video_Format constructor.
	 *
	 * @param \Videopack\Admin\Formats\Codecs\Video_Codec $codec      Video codec object.
	 * @param \Videopack\Admin\Formats\Video_Resolution   $resolution Video resolution object.
	 * @param bool                                        $enabled    Whether the format is enabled. Default true.
	 */
	public function __construct( Codecs\Video_Codec $codec, Video_Resolution $resolution, $enabled = true ) {
		$this->codec      = $codec;
		$this->resolution = $resolution;
		$this->enabled    = $enabled;
	}

	/**
	 * Get the video format name (H.264 MP4 Full HD (1080p)).
	 *
	 * @return string
	 */
	public function get_name() {
		return $this->codec->get_name() . ' ' . $this->resolution->get_name();
	}

	/**
	 * Get a shorter version of the video format name (H.264 1080p).
	 *
	 * @return string
	 */
	public function get_short_name() {
		return $this->codec->get_label() . ' ' . $this->resolution->get_label();
	}

	/**
	 * Get the video format label (1080p).
	 *
	 * @return string
	 */
	public function get_label() {
		return $this->resolution->get_label();
	}

	/**
	 * Get the string appended to the end of files of this codec and resolution.
	 *
	 * @return string
	 */
	public function get_id() {
		return $this->codec->get_id() . '_' . $this->resolution->get_id();
	}

	/**
	 * Get the old id used in Videopack version 4
	 *
	 * @return string
	 */
	public function get_legacy_id() {
		if ( $this->codec->get_id() === 'h264' ) {
			if ( $this->resolution->get_height() === 360 ) {
				return 'mobile';
			}
			return $this->resolution->get_id();
		}
		if ( $this->codec->get_id() === 'vp8' ) {
			return 'webm';
		}
		if ( $this->codec->get_id() === 'ogv' ) {
			return 'ogg';
		}
		return false;
	}

	/**
	 * Get the old filename suffix used in Videopack version 4
	 *
	 * @return string
	 */
	public function get_legacy_suffix() {
		if ( $this->codec->get_id() === 'h264' ) {
			return '-' . $this->resolution->get_id() . '.mp4';
		}
		if ( $this->codec->get_id() === 'vp8' ) {
			return '.webm';
		}
		if ( $this->codec->get_id() === 'vp9' ) {
			return '-vp9.webm';
		}
		if ( $this->codec->get_id() === 'ogv' ) {
			return '.ogv';
		}
		return false;
	}

	/**
	 * Get the full string appended to the end of videos with this format.
	 *
	 * @return string The file suffix (e.g., -h264_1080p.mp4)
	 */
	public function get_suffix() {

		$suffix = '-' . $this->get_id() . '.' . $this->codec->get_container();
		/**
		 * Filters video format file suffix. Used to determine the naming structure for video formats.
		 *
		 * @param string                                      $id         Video format id.
		 * @param \Videopack\Admin\Formats\Codecs\Video_Codec $codec      Video codec object.
		 * @param \Videopack\Admin\Formats\Video_Resolution   $resolution Video resolution object.
		 */
		return apply_filters( 'videopack_video_format_suffix', $suffix, $this->codec, $this->resolution );
	}

	/**
	 * Get the video codec.
	 *
	 * @return \Videopack\Admin\Formats\Codecs\Video_Codec
	 */
	public function get_codec() {
		return $this->codec;
	}

	/**
	 * Get the video resolution.
	 *
	 * @return \Videopack\Admin\Formats\Video_Resolution
	 */
	public function get_resolution() {
		return $this->resolution;
	}

	/**
	 * Checks if this video format is intended to replace the original file.
	 *
	 * @return bool True if the format replaces the original, false otherwise.
	 */
	public function get_replaces_original() {
		// A format replaces the original if its resolution ID is 'fullres'.
		return $this->resolution->get_id() === 'fullres';
	}

	/**
	 * Checks if this video format is enabled in the plugin settings.
	 *
	 * @return bool True if enabled, false otherwise.
	 */
	public function is_enabled() {
		return $this->enabled;
	}

	/**
	 * Convert the Video_Format object to an associative array for JSON responses.
	 *
	 * @return array{
	 *     id: string,
	 *     name: string,
	 *     label: string,
	 *     legacy_id: string|false,
	 *     legacy_suffix: string|false,
	 *     suffix: string,
	 *     replaces_original: bool,
	 *     codec: array{
	 *         id: string,
	 *         name: string,
	 *         container: string,
	 *         mime_type: string,
	 *         vcodec: string|array,
	 *         acodec: string,
	 *         default_crf: float,
	 *         default_vbr: float,
	 *         is_default_encode: bool
	 *     },
	 *     resolution: array{
	 *         id: string,
	 *         height: int,
	 *         name: string,
	 *         label: string,
	 *         is_default_encode: bool
	 *     },
	 *     enabled: bool
	 * } An associative array representation of the object.
	 */
	public function to_array() {
		$codec      = $this->get_codec();
		$resolution = $this->get_resolution();

		return array(
			'id'                => $this->get_id(),
			'name'              => $this->get_name(),
			'label'             => $this->get_label(),
			'legacy_id'         => $this->get_legacy_id(),
			'legacy_suffix'     => $this->get_legacy_suffix(),
			'suffix'            => $this->get_suffix(),
			'replaces_original' => $this->get_replaces_original(),
			'codec'             => array(
				'id'                => $codec->get_id(),
				'name'              => $codec->get_name(),
				'container'         => $codec->get_container(),
				'mime_type'         => $codec->get_mime_type(),
				'vcodec'            => $codec->get_vcodec(),
				'acodec'            => $codec->get_acodec(),
				'default_crf'       => $codec->get_default_crf(),
				'default_vbr'       => $codec->get_default_vbr(),
				'is_default_encode' => $codec->is_default_encode(),
			),
			'resolution'        => array(
				'id'                => $resolution->get_id(),
				'height'            => $resolution->get_height(),
				'name'              => $resolution->get_name(),
				'label'             => $resolution->get_label(),
				'is_default_encode' => $resolution->is_default_encode(),
			),
			'enabled'           => $this->is_enabled(),
		);
	}
}
