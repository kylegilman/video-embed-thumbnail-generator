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
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

	/**
	 * @var array $options
	 */
	protected $options = array();

	/**
	 * Array of \Videopack\Admin\Formats\Video_Format objects.
	 * @var array $video_formats
	 */
	protected $video_formats = array();

	/**
	 * Videopack video format ID.
	 * @var string $format
	 */
	protected $format;

	/**
	 * Video type. ex. 'attachment_local', 'attachment_remote', 'url', etc.
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
	 * Is the video source on the same server as the WordPress installation?
	 * @var boolean $same_server
	 */
	protected $same_server;

	/**
	 * Array of parts of the video path. Used for generating thumbnails, encoding video formats, and other file operations.
	 * @var array $path_parts {
	 *     @type string $dirname
	 *     @type string $basename
	 *     @type string $extension
	 *     @type string $filename
	 * }
	 */
	protected $path_parts;

	/**
	 * Descriptive title of the video.
	 * @var string $name
	 */
	protected $title;

	/**
	 * MIME type of the video.
	 * @var string $mime_type
	 */
	protected $mime_type;

	/**
	 * Video Codec.
	 * @var \Videopack\Admin\Formats\Codecs\Video_Codec $codec
	 */
	protected $codec;

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

	/**
	 * Does the video source exist?
	 * @var boolean $exists
	 */
	protected $exists;

	/**
	 * Is the video source compatible with Videopack?
	 * @var bool $compatible
	 */
	protected $compatible;

	/**
	 * Array of \Videopack\Admin\Formats\Video_Input objects.
	 * @var array $child_sources
	 */
	protected $child_sources;

	/**
	 * Video_Input constructor.
	 *
	 * @param string|int $source
	 * @param string $type
	 * @param \Videopack\Admin\Options $options_manager
	 * @param string|null $format Videopack video format ID.
	 * @param bool|null $exists
	 */

	public function __construct(
		$source,
		string $type,
		\Videopack\Admin\Options $options_manager,
		$format = null,
		$exists = null
	) {
		$this->source          = $source;
		$this->type            = $type;
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->video_formats   = $this->options_manager->get_video_formats();
		$this->format          = $format;
		$this->exists          = $exists;
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

	abstract protected function set_exists(): void;

	public function exists(): bool {
		if ( $this->exists === null ) {
			$this->set_exists();
		}
		return $this->exists;
	}

	abstract protected function set_direct_path(): void;

	public function get_direct_path(): string {
		if ( ! $this->direct_path ) {
			$this->set_direct_path();
		}
		return $this->direct_path;
	}

	abstract protected function set_same_server(): void;

	public function is_same_server(): bool {
		if ( ! isset( $this->same_server ) ) {
			$this->set_same_server();
		}
		return $this->same_server;
	}

	protected function set_path_parts(): void {

		$pathinfo   = pathinfo( $this->get_direct_path() );
		$path_parts = array(
			'dirname'   => $pathinfo['dirname'],
			'basename'  => sanitize_file_name( $pathinfo['basename'] ),
			'extension' => $pathinfo['extension'],
			'filename'  => sanitize_file_name( $pathinfo['filename'] ),
		);

		$path_parts['no_extension'] = $pathinfo['dirname'] . '/' . $pathinfo['filename'];

		$this->path_parts = $path_parts;
	}

	public function get_dirname(): string {
		if ( ! $this->path_parts ) {
			$this->set_path_parts();
		}
		return $this->path_parts['dirname'];
	}

	public function get_basename(): string {
		if ( ! $this->path_parts ) {
			$this->set_path_parts();
		}
		return $this->path_parts['basename'];
	}

	public function get_extension(): string {
		if ( ! $this->path_parts ) {
			$this->set_path_parts();
		}
		return $this->path_parts['extension'];
	}

	public function get_filename(): string {
		if ( ! $this->path_parts ) {
			$this->set_path_parts();
		}
		return $this->path_parts['filename'];
	}

	public function get_no_extension(): string {
		if ( ! $this->path_parts ) {
			$this->set_path_parts();
		}
		return $this->path_parts['no_extension'];
	}

	protected function set_compatible(): void {

		$compatible = array(
			'mp4',
			'mov',
			'm4v',
			'ogv',
			'ogg',
			'webm',
			'mkv',
			'mpd',
			'm3u8',
		);

		/**
		 * Filter the list of Videopack-compatible video extensions.
		 * @param array $compatible Array of compatible video extensions.
		 */
		$compatible = apply_filters( 'videopack_compatible_extensions', $compatible );

		$this->compatible = in_array( $this->get_extension(), $compatible, true );
	}

	public function is_compatible(): bool {
		if ( ! isset( $this->compatible ) ) {
			$this->set_compatible();
		}
		return $this->compatible;
	}

	abstract protected function set_title(): void;

	public function get_title(): string {
		if ( ! $this->title ) {
			$this->set_title();
		}
		return $this->title;
	}

	abstract protected function set_mime_type(): void;

	public function get_mime_type(): string {
		if ( ! $this->mime_type ) {
			$this->set_mime_type();
		}
		return $this->mime_type;
	}

	public function get_preferred_codecs(): array {
		$preferred_codecs = array(
			'video/mp4'  => 'h264',
			'video/webm' => 'vp9',
		);
		/**
		 * Filter preferred video codecs for a mime type. Since multiple codecs can be available for a mime type,
		 * this filter can change or provide a preferred codec for a mime type.
		 * @param array $preferred_codecs Array of preferred video codecs.
		 * @return array
		 * @since 5.0.0
		 */
		return apply_filters( 'videopack_preferred_codecs', $preferred_codecs );
	}

	protected function get_codec_by_mime_type() {

		if ( $this->get_mime_type() ) {
			$codecs         = $this->options_manager->get_video_codecs();
			$same_mime_type = array();
			foreach ( $codecs as $codec ) {
				if ( $codec->get_mime_type() === $this->get_mime_type() ) {
					$same_mime_type[] = $codec;
				}
			}

			if ( count( $same_mime_type ) === 1 ) {
				//only one available codec with the same mime type
				return $same_mime_type[0];
			} elseif ( count( $same_mime_type ) > 1 ) {
				//multiple available codecs with the same mime type
				$preferred_codecs = $this->get_preferred_codecs();
				if ( array_key_exists( $this->get_mime_type(), $preferred_codecs )
					&& $preferred_codecs[ $this->get_mime_type() ] === $codec->get_id()
				) {
					return $codec;
				}
			}
		}
		return false;
	}

	abstract protected function set_codec(): void;

	public function get_codec(): \Videopack\Admin\Formats\Codecs\Video_Codec {
		if ( ! $this->codec ) {
			$this->set_codec();
		}
		return $this->codec;
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

	public function is_original(): bool {
		return $this->format === 'original';
	}

	public function get_video_formats(): array {
		return $this->video_formats;
	}

	public function get_child_sources(): array {

		if ( $this->is_original() && empty( $this->child_sources ) ) {
			$this->set_child_sources();
		}
		return $this->child_sources;
	}

	public function get_existing_child_sources(): array {

		$existing_child_sources = array();

		if ( $this->is_original() && empty( $this->child_sources ) ) {
			$this->set_child_sources();
		}

		if ( $this->get_child_sources() ) {
			foreach ( $this->get_child_sources() as $child_source ) {
				if ( $child_source->exists() ) {
					$existing_child_sources[] = $child_source;
				}
			}
		}

		return $existing_child_sources;
	}

	abstract protected function set_child_sources(): void;

	protected function find_attachment_children(): array {
		if ( is_numeric( $this->source ) ) {
			$args = array(
				'numberposts' => -1,
				'post_parent' => $this->source,
				'post_type'   => 'attachment',
			);

			return get_posts( $args );
		}

		return array();
	}

	protected function find_attachment_by_externalurl_meta_key(): array {
		$args = array(
			'numberposts' => -1,
			'post_type'   => 'attachment',
			'meta_key'    => '_kgflashmediaplayer-externalurl',
			'meta_value'  => esc_url_raw( rawurldecode( $this->url ) ),
		);

		return get_posts( $args );
	}


	protected function is_format_in_same_directory( string $suffix ) {
		$file = $this->get_no_extension() . $suffix;
		if ( file_exists( $file ) ) {
			return $file;
		}
		return false;
	}

	public function get_video_player_source(): array {

		$video_player_source = array(
			'src'   => $this->get_url(),
			'type'  => $this->get_mime_type(),
			'codec' => '',
		);

		if ( $this->get_codec() ) {
			$video_player_source['codec'] = $this->get_codec()->get_fourcc();
		}

		return $video_player_source;
	}

	protected function handle_error( string $error ): void {
		// Error handling logic
	}
}
