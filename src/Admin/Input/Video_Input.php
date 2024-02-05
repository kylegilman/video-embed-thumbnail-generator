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
	 * Array of video sources. Includes URLs and other metadata.
	 * @var array $sources
	 */
	protected $sources;

	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

	/**
	 * @var array $options
	 */
	protected $options = array();

	/**
	 * @var string $type
	 */
	protected $type;

	/**
	 * URL of the video.
	 * @var string $url
	 */
	protected $url;

	/**
	 * Most direct path to the video. This could be a local file path, URL, or other source.
	 * @var string $direct_path
	 */
	protected $direct_path;

	/**
	 * Basename of the video file. Used for generating thumbnails, encoding video formats, and other file operations.
	 * @var string $basename
	 */
	protected $basename;

	/**
	 * Descriptive title of the video.
	 * @var string $name
	 */
	protected $post_title;

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

	protected function validate_source( $source ): bool {

		if ( empty( $source ) ) {

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

	abstract protected function set_url(): void;

	public function get_url(): string {
		if ( ! $this->url ) {
			$this->set_url();
		}
		return $this->url;
	}

	abstract protected function set_direct_path(): void;

	public function get_direct_path(): string {
		if ( ! $this->direct_path ) {
			$this->set_direct_path();
		}
		return $this->direct_path;
	}

	abstract protected function set_basename(): void;

	public function get_basename(): string {
		if ( ! $this->basename ) {
			$this->set_basename();
		}
		return $this->basename;
	}

	abstract protected function set_post_title(): void;

	public function get_post_title(): string {
		if ( ! $this->post_title ) {
			$this->set_post_title();
		}
		return $this->post_title;
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

	abstract protected function set_duration(): void;

	public function get_duration(): float {

		if ( ! $this->duration ) {
			$this->set_duration();
		}

		return $this->duration;
	}

	protected function handle_error( string $error ): void {
		// Error handling logic
	}
}
