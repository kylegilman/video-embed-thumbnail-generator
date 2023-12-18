<?php

namespace Videopack\admin\codec;

/**
 * Base class for a video codec.
 */
class Video_Codec {
	/**
	 * Codec name.
	 *
	 * @var string
	 */
	protected $name;

	/**
	 * Codec label.
	 *
	 * @var string
	 */
	protected $label;

	/**
	 * Codec unique identifier.
	 *
	 * @var string
	 */
	protected $id;

	/**
	 * Container format.
	 *
	 * @var string
	 */
	protected $container;

	/**
	 * MIME type.
	 *
	 * @var string
	 */
	protected $mime;

	/**
	 * Codec string.
	 *
	 * @var string
	 */
	protected $codecs_string;

	/**
	 * Video codec.
	 *
	 * @var string
	 */
	protected $vcodec;

	/**
	 * Rate control settings.
	 *
	 * @var array
	 */
	protected $rate_control;

	/**
	 * Default encoding flag.
	 *
	 * @var bool
	 */
	protected $default_encode;

	/**
	 * Constructor for Video_Codec.
	 *
	 * @param array $properties Associative array of codec properties and values.
	 */
	public function __construct( array $properties ) {
		$this->name           = $properties['name'] ?? 'Video';
		$this->label          = $properties['label'] ?? 'Video';
		$this->id             = $properties['id'] ?? 'h264';
		$this->container      = $properties['container'] ?? 'mp4';
		$this->mime           = $properties['mime'] ?? 'video/mp4';
		$this->codecs_string  = $properties['codecs_string'] ?? '';
		$this->vcodec         = $properties['vcodec'] ?? 'libx264';
		$this->rate_control   = $properties['rate_control'] ?? array(
			'crf' => array(
				'min'     => 0,
				'max'     => 51,
				'default' => 23,
			),
			'vbr' => array(
				'default'  => 1.0,
				'constant' => 0,
			),
		);
		$this->default_encode = $properties['default_encode'] ?? false;
	}

	/**
	 * Retrieves all codec properties as an associative array.
	 *
	 * @return array Associative array of codec properties.
	 */
	public function get_properties() {
		return array(
			'name'           => $this->name,
			'label'          => $this->label,
			'id'             => $this->id,
			'container'      => $this->container,
			'mime'           => $this->mime,
			'codecs_string'  => $this->codecs_string,
			'vcodec'         => $this->vcodec,
			'rate_control'   => $this->rate_control,
			'default_encode' => $this->default_encode,
		);
	}

	/**
	 * Get the codec name.
	 *
	 * @return string Codec name.
	 */
	public function get_name() {
		return $this->name;
	}

	/**
	 * Get the codec label.
	 *
	 * @return string Codec label.
	 */
	public function get_label() {
		return $this->label;
	}

	/**
	 * Get the codec unique identifier.
	 *
	 * @return string Codec unique identifier.
	 */
	public function get_id() {
		return $this->id;
	}

	/**
	 * Get the container format.
	 *
	 * @return string Container format.
	 */
	public function get_container() {
		return $this->container;
	}

	/**
	 * Get the MIME type.
	 *
	 * @return string MIME type.
	 */
	public function get_mime() {
		return $this->mime;
	}

	/**
	 * Get the codec string.
	 *
	 * @return string Codec string.
	 */
	public function get_codecs_string() {
		return $this->codecs_string;
	}

	/**
	 * Get the video codec.
	 *
	 * @return string Video codec.
	 */
	public function get_vcodec() {
		return $this->vcodec;
	}

	/**
	 * Get the rate control settings.
	 *
	 * @return array Rate control settings.
	 */
	public function get_rate_control() {
		return $this->rate_control;
	}

	/**
	 * Get the default CRF value.
	 *
	 * @return float Rate control settings.
	 */
	public function get_default_crf() {
		return $this->rate_control['rate_control']['crf']['default'];
	}

	/**
	 * Get the default VBR value.
	 *
	 * @return float Rate control settings.
	 */
	public function get_default_vbr() {
		return $this->rate_control['rate_control']['vbr']['default'];
	}

	/**
	 * Get the default encoding flag.
	 *
	 * @return bool Default encoding flag.
	 */
	public function get_default_encode() {
		return $this->default_encode;
	}

	/**
	 * Calculates and returns the bitrate based on width and height.
	 *
	 * @param float $width  The width of the video.
	 * @param float $height The height of the video.
	 * @return float The calculated bitrate.
	 */
	public function get_bitrate( float $width, float $height ) {
		return round(
			( $this->rate_control['vbr']['default']
			* 10 ** ( -3 )
			* $width * $height )
			+ $this->rate_control['vbr']['constant']
		);
	}
}
