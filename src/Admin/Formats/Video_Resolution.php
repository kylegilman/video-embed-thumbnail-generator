<?php
/**
 * Video Resolution Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats;

/**
 * Class Video_Resolution
 *
 * Represents a video resolution (e.g., 1080p, 720p, etc.)
 */
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

	/**
	 * Is this a custom resolution.
	 *
	 * @var bool
	 */
	protected $is_custom;

	/**
	 * List of codec IDs allowed for this resolution. If empty, all codecs are allowed.
	 *
	 * @var array
	 */
	protected $allowed_codecs = array();

	/**
	 * Whether this is a standard video resolution.
	 *
	 * @var bool
	 */
	protected $is_video;

	/**
	 * Whether this is a standard playback resolution.
	 *
	 * @var bool
	 */
	protected $is_standard;

	/**
	 * Video_Resolution constructor.
	 *
	 * @param array $properties {
	 *     height: int,
	 *     name: string,
	 *     default_encode: bool,
	 *     is_custom?: bool,
	 *     label?: string,
	 *     id?: string,
	 *     allowed_codecs?: array,
	 *     is_video?: bool,
	 *     is_standard?: bool
	 * } Associative array of resolution properties.
	 */
	public function __construct( $properties ) {
		$this->height         = $properties['height'];
		$this->name           = $properties['name'];
		$this->default_encode = $properties['default_encode'];
		$this->is_custom      = $properties['is_custom'] ?? false;
		$this->allowed_codecs = (array) ( $properties['allowed_codecs'] ?? array() );
		$this->is_video       = $properties['is_video'] ?? true;
		$this->is_standard    = $properties['is_standard'] ?? true;

		if ( isset( $properties['label'] ) ) {
			$this->label = $properties['label'];
		} else {
			$this->label = $this->height . 'p';
		}

		if ( isset( $properties['id'] ) ) {
			$this->id = $properties['id'];
		} else {
			$this->id = strval( $this->height );
		}
	}

	/**
	 * Returns whether this is a standard video resolution.
	 *
	 * @return bool True if video, false otherwise.
	 */
	public function is_video() {
		return $this->is_video;
	}

	/**
	 * Returns whether this is a standard playback resolution.
	 *
	 * @return bool True if standard playback, false otherwise.
	 */
	public function is_standard() {
		return $this->is_standard;
	}

	/**
	 * Get the list of allowed codecs for this resolution.
	 *
	 * @return array|null Array of codec IDs, or null if allowed for all.
	 */
	public function get_allowed_codecs() {
		return $this->allowed_codecs;
	}

	/**
	 * Set the list of allowed codecs for this resolution.
	 *
	 * @param array|null $codecs Array of codec IDs, or null for all.
	 * @return void
	 */
	public function set_allowed_codecs( $codecs ) {
		$this->allowed_codecs = $codecs;
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
	 * @return int The height in pixels.
	 */
	public function get_height() {
		return (int) $this->height;
	}

	/**
	 * Is this a custom resolution.
	 *
	 * @return bool
	 */
	public function is_custom() {
		return $this->is_custom;
	}

	/**
	 * Set the height of the resolution if not already set.
	 *
	 * @param int|string $height The height to set.
	 */
	public function set_height( $height ) {
		if ( ! $this->height ) {
			$this->height = intval( $height );
		}
		if ( ! $this->label ) {
			$this->label = $height . 'p';
		}
	}

	/**
	 * Calculates the output dimensions for a given source dimension and target format height,
	 * respecting a 16:9 bounding box (fuzzy resolution logic) and ensuring even numbers.
	 *
	 * @param int $source_w        The source video width.
	 * @param int $source_h        The source video height.
	 * @param int $max_h_for_format The target format height (e.g. 1080). Pass 0 or null for full resolution.
	 * @return array {width: int, height: int} The calculated dimensions.
	 */
	public static function calculate_bounded_dimensions( int $source_w, int $source_h, $max_h_for_format ) {
		$max_h_for_format = (int) $max_h_for_format;

		if ( ! $max_h_for_format || $source_w <= 0 || $source_h <= 0 ) {
			$width  = $source_w;
			$height = $source_h;
		} else {
			// Maximum dimensions bounded by a 16:9 box for the target format height.
			$max_w_for_format = (int) round( $max_h_for_format * ( 16 / 9 ) );

			$target_w_for_max_h = (int) round( ( $source_w / $source_h ) * $max_h_for_format );

			$width = (int) min( $source_w, $max_w_for_format, $target_w_for_max_h );

			$height = (int) round( ( $source_h / $source_w ) * $width );

			if ( $height > $max_h_for_format ) {
				$height = $max_h_for_format;
				$width  = (int) round( ( $source_w / $source_h ) * $height );
			}
		}

		// Ensure even dimensions (required by almost all encoders).
		$width  = (int) max( 2, $width - ( $width % 2 ) );
		$height = (int) max( 2, $height - ( $height % 2 ) );

		return array(
			'width'  => $width,
			'height' => $height,
		);
	}
}
