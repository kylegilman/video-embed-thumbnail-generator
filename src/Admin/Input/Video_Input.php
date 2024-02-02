<?php

namespace Videopack\Admin\Input;

/**
 * Class Video_Input
 * Defines the base class for video input types.
 *
 * @since 5.0.0
 * @package Videopack\Admin\Input
 * @abstract
 * @param string|int $source
 * @param string $type
 * @param \Videopack\Admin\Options $options_manager
 */
abstract class Video_Input {
	/**
	 * Primary source of the video. This could be a URL, attachment ID, or other source.
	 * @var string|int $source
	 */
	protected $source;

	/**
	 * URL of the video.
	 * @var string $url
	 */
	protected $url;

	/**
	 * Most direct path to the video. This could be a local file path, URL, or other source.
	 * @var string $filepath
	 */
	protected $filepath;

	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options|null $options_manager
	 */
	protected $options_manager = null;

	/**
	 * @var array $options
	 */
	protected $options = array();

	/**
	 * @var string $type
	 */
	protected $type;

	/**
	 * @var int $width
	 */
	protected $width = 0;

	/**
	 * @var int $height
	 */
	protected $height = 0;

	/**
	 * @var float $aspect_ratio
	 */
	protected $aspect_ratio = 0.5625;

	/**
	 * @var int $duration
	 */
	protected $duration;

	/**
	 * @var array
	 */
	protected $metadata = array();

	public function __construct( $source, string $type, \Videopack\Admin\Options $options_manager ) {
		$this->source          = $source;
		$this->type            = $type;
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
	}

	abstract protected function fetch_metadata();

	protected function validate_source(): bool {

		if ( empty( $this->source ) ) {

			$this->handle_error( esc_html__( 'Source is empty.', 'video-embed-thumbnail-generator' ) );
			return false;
		}

		return true;
	}

	public function get_source(): string {
		return $this->source;
	}

	protected function set_source( string $source ): void {
		$this->source = $source;
	}

	abstract protected function set_dimensions();

	public function get_dimensions(): array {

		if ( ! $this->width || ! $this->height ) {
			$this->set_dimensions();
		}

		return array(
			'width'  => $this->width,
			'height' => $this->height,
		);
	}

	protected function set_aspect_ratio(): void {

		if ( empty( $this->width ) || empty( $this->height ) ) {
			$this->set_dimensions();
		}

		if ( ! empty( $this->width ) && ! empty( $this->height ) ) {
			$this->aspect_ratio = $this->height / $this->width;
		} else {
			$this->aspect_ratio = $this->options['height'] / $this->options['width'];
		}
	}

	public function get_aspect_ratio(): float {

		$this->set_aspect_ratio();
		return $this->aspect_ratio;
	}

	protected function handle_error( string $error ): void {
		// Error handling logic
	}
}
