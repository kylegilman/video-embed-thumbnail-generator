<?php

namespace Videopack\Admin\Formats;

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
	 * @var \Videopack\Admin\Codec\Video_Codec $codec
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
	 * @param array $properties
	 */
	public function __construct( Codecs\Video_Codec $codec, Video_Resolution $resolution, $enabled = true ) {
		$this->codec      = $codec;
		$this->resolution = $resolution;
		$this->enabled    = $enabled;
	}

	/**
	 * Get the video format name.
	 *
	 * @return string
	 */
	public function get_name() {
		return $this->codec->get_name() . ' ' . $this->resolution->get_name();
	}

	/**
	 * Get the video format label.
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
	 * @return string
	 */
	public function get_suffix() {

		$suffix = '-' . $this->get_id() . '.' . $this->codec->get_container();
		/**
		 * Filters video format file suffix. Used to determine the naming structure for video formats.
		 * @param string $id    Video format id.
		 * @param \Videopack\Admin\Formats\Codecs\Video_Codec $codec     Video codec object.
		 * @param \Videopack\Admin\Formats\Video_Resolution $resolution Video resolution object.
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
}
