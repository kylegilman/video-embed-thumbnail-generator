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

	public function get_legacy_id() {
		if ( $this->codec->get_id() === 'h264' ) {
			return $this->resolution->get_id();
		}
	}

	/**
	 * Get the full string appended to the end of videos with this format.
	 *
	 * @return string
	 */
	public function get_suffix() {

		$suffix = '_' . $this->get_id() . '.' . $this->codec->get_container();
		/**
		 * Filters video format file suffix. Used to determine the naming structure for video formats.
		 * @param string $id    Video format id.
		 * @param \Videopack\Admin\Formats\Codecs\Video_Codec $codec     Video codec object.
		 * @param \Videopack\Admin\Formats\Video_Resolution $resolution Video resolution object.
		 */
		return apply_filters( 'videopack_video_format_suffix', $suffix, $this->codec, $this->resolution );
	}
}
