<?php

namespace Videopack\Admin\Formats;

class Video_Resolution {

	/**
	 * Video resolution description. ex. '4K UHD (2160p)'
	 *
	 * @var string
	 */
	protected $name;

	/**
	 * Video resolution label. Used in video player resolution selector menus.
	 *
	 * @var string
	 */
	protected $label;

	/**
	 * Video resolution unique identifier.
	 *
	 * @var string
	 */
	protected $id;

	/**
	 * Is video resolution enabled by default.
	 *
	 * @var bool
	 */
	protected $default_encode;

	/**
	 * Video resolution height.
	 *
	 * @var int
	 */
	protected $height;

	public function __construct( $properties ) {
		$this->height         = $properties['height'];
		$this->name           = $properties['name'];
		$this->default_encode = $properties['default_encode'];

		if ( isset( $properties['label'] ) ) {
			$this->label = $properties['label'];
		} else {
			$this->label = $this->id . 'p';
		}

		if ( isset( $properties['id'] ) ) {
			$this->id = $properties['id'];
		} else {
			$this->id = intval( $this->height );
		}
	}

	/**
	 * Get the video resolution name.
	 *
	 * @return string
	 */
	public function get_name() {
		return $this->name;
	}

	/**
	 * Get the video resolution label.
	 *
	 * @return string
	 */
	public function get_label() {
		return $this->label;
	}

	/**
	 * Get the video resolution unique identifier.
	 *
	 * @return string
	 */
	public function get_id() {
		return $this->id;
	}

	/**
	 * Is video resolution enabled by default.
	 *
	 * @return bool
	 */
	public function is_default_encode() {
		return $this->default_encode;
	}

	/**
	 * Get the video height.
	 *
	 * @return string
	 */
	public function get_height() {
		return $this->height;
	}
}
