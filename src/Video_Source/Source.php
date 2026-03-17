<?php
/**
 * Video source base class.
 *
 * @package Videopack
 */

namespace Videopack\Video_Source;

use Videopack\Video_Source\Video_Source_Finder;

/**
 * Class Source
 *
 * Defines the base class for video input types.
 *
 * @since 5.0.0
 * @package Videopack\Video_Source
 * @abstract
 */
abstract class Source {

	/**
	 * Primary source of the video. This could be a URL, attachment ID, or other source.
	 *
	 * @var string|int $source
	 */
	protected $source;

	/**
	 * Unique ID of the video source. This could be an attachment ID or other identifier based on filename.
	 *
	 * @var string $id
	 */
	protected $id;

	/**
	 * Videopack Options manager class instance.
	 *
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options = array();

	/**
	 * Array of \Videopack\Admin\Formats\Video_Format objects.
	 *
	 * @var array $video_formats
	 */
	protected $video_formats = array();

	/**
	 * Videopack video format ID.
	 *
	 * @var string $format
	 */
	protected $format;

	/**
	 * Video type. ex. 'attachment_local', 'attachment_remote', 'url', etc.
	 *
	 * @var string $type
	 */
	protected $type;

	/**
	 * URL of the video.
	 *
	 * @var string $url
	 */
	protected $url;

	/**
	 * Most direct path to the video. This could be a local file path, URL, or other source.
	 *
	 * @var string $direct_path
	 */
	protected $direct_path;

	/**
	 * Is the video source on the same server as the WordPress installation?
	 *
	 * @var boolean $local
	 */
	protected $local;

	/**
	 * Parent ID. Could be a post ID, attachment ID, or null.
	 *
	 * @var int|null $parent_id
	 */
	protected $parent_id;

	/**
	 * Array of parts of the video path.
	 *
	 * Used for generating thumbnails, encoding video formats, and other file operations.
	 *
	 * @var array $path_parts {
	 *     @type string $dirname
	 *     @type string $basename
	 *     @type string $extension
	 *     @type string $filename
	 *     @type string $no_extension
	 * }
	 */
	protected $path_parts;

	/**
	 * Descriptive title of the video.
	 *
	 * @var string $title
	 */
	protected $title;

	/**
	 * MIME type of the video.
	 *
	 * @var string $mime_type
	 */
	protected $mime_type;

	/**
	 * Video Codec.
	 *
	 * @var \Videopack\Admin\Formats\Codecs\Video_Codec $codec
	 */
	protected $codec;

	/**
	 * Video resolution.
	 *
	 * @var int $resolution
	 */
	protected $resolution;

	/**
	 * Video width.
	 *
	 * @var int $width
	 */
	protected $width = 0;

	/**
	 * Video height.
	 *
	 * @var int $height
	 */
	protected $height = 0;

	/**
	 * Video aspect ratio.
	 *
	 * @var float $aspect_ratio
	 */
	protected $aspect_ratio = 0.5625;

	/**
	 * Video duration in seconds.
	 *
	 * @var int $duration
	 */
	protected $duration;

	/**
	 * Video metadata.
	 *
	 * @var array $metadata
	 */
	protected $metadata = array();

	/**
	 * Does the video source exist?
	 *
	 * @var boolean $exists
	 */
	protected $exists;

	/**
	 * Is the video source compatible with Videopack?
	 *
	 * @var bool $compatible
	 */
	protected $compatible;

	/**
	 * Array of \Videopack\Admin\Formats\Video_Source objects.
	 *
	 * @var array $child_sources
	 */
	protected $child_sources = array();

	/**
	 * Constructor.
	 *
	 * @param string|int               $source          Primary source of the video (URL, attachment ID, etc.).
	 * @param string                   $type            Video type (e.g., 'attachment_local', 'url').
	 * @param \Videopack\Admin\Options $options_manager Videopack Options manager class instance.
	 * @param string|null              $format          Optional. Videopack video format ID.
	 * @param bool|null                $exists          Optional. Whether the source exists.
	 * @param int|null                 $parent_id       Optional. Parent ID (post ID, etc.).
	 */
	public function __construct(
		$source,
		string $type,
		\Videopack\Admin\Options $options_manager,
		$format = null,
		$exists = null,
		$parent_id = null
	) {
		$this->source          = $source;
		$this->type            = $type;
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->video_formats   = $this->options_manager->get_video_formats();
		$this->format          = $format;
		$this->exists          = $exists;
		$this->parent_id       = $parent_id;
	}

	/**
	 * Returns the plugin options.
	 *
	 * @return array The options array.
	 */
	public function get_options(): array {
		return $this->options;
	}

	/**
	 * Returns the Options manager instance.
	 *
	 * @return \Videopack\Admin\Options The options manager instance.
	 */
	public function get_options_manager(): \Videopack\Admin\Options {
		return $this->options_manager;
	}

	/**
	 * Sets the video metadata.
	 *
	 * @param array|null $metadata Optional. The metadata array.
	 */
	abstract public function set_metadata( array $metadata = null ): void;

	/**
	 * Validates the video source.
	 *
	 * @param string|int $source The video source.
	 * @return bool True if valid, false otherwise.
	 */
	protected function validate_source( $source ): bool {

		if ( empty( $source ) ) {

			$this->handle_error( esc_html__( 'Source is empty.', 'video-embed-thumbnail-generator' ) );
			return false;
		}

		return true;
	}

	/**
	 * Returns the primary source.
	 *
	 * @return string|int The video source.
	 */
	public function get_source() {
		if ( is_array( $this->source ) ) {
			return $this->source['id'] ?? '';
		}
		return $this->source;
	}

	/**
	 * Sets the primary source.
	 *
	 * @param string $source The video source.
	 */
	protected function set_source( string $source ): void {
		$this->source = $source;
	}

	/**
	 * Returns the source ID.
	 *
	 * @return string The source ID.
	 */
	public function get_id(): string {
		if ( ! $this->id ) {
			$this->set_id();
		}
		return $this->id;
	}

	/**
	 * Sets the source ID based on URL.
	 */
	protected function set_id(): void {
		$sanitized_url = new \Videopack\Admin\Sanitize_Url( $this->url );
		$this->id      = $sanitized_url->singleurl_id;
	}

	/**
	 * Sets the video URL.
	 */
	abstract protected function set_url(): void;

	/**
	 * Returns the video URL.
	 *
	 * @return string The video URL.
	 */
	public function get_url(): string {
		if ( ! $this->url ) {
			$this->set_url();
		}
		return $this->url;
	}

	/**
	 * Returns the video download URL.
	 *
	 * @return string The download URL.
	 */
	public function get_download_url(): string {
		return $this->get_url();
	}

	/**
	 * Sets whether the video source exists.
	 */
	abstract protected function set_exists(): void;

	/**
	 * Checks if the video source exists.
	 *
	 * @return bool True if it exists, false otherwise.
	 */
	public function exists(): bool {
		if ( $this->exists === null ) {
			$this->set_exists();
		}
		return $this->exists;
	}

	/**
	 * Helper function to check if a URL exists.
	 *
	 * @param string $url The URL to check.
	 * @return bool True if the URL exists, false otherwise.
	 */
	public function url_exists( $url ) {
		return Video_Source_Finder::url_exists( $url );
	}

	/**
	 * Sets the direct path to the video.
	 */
	abstract protected function set_direct_path(): void;

	/**
	 * Returns the direct path to the video.
	 *
	 * @return string The direct path.
	 */
	public function get_direct_path(): string {
		if ( ! $this->direct_path ) {
			$this->set_direct_path();
		}
		return $this->direct_path;
	}

	/**
	 * Sets whether the video source is local.
	 */
	abstract protected function set_local(): void;

	/**
	 * Checks if the video source is local.
	 *
	 * @return bool True if local, false otherwise.
	 */
	public function is_local(): bool {
		if ( ! isset( $this->local ) ) {
			$this->set_local();
		}
		return $this->local;
	}

	/**
	 * Returns the current post ID based on context.
	 *
	 * @return int|null The post ID or null if not found.
	 */
	protected function get_current_post_id(): ?int {
		$post = get_post();
		if ( is_a( $post, 'WP_Post' ) ) {
			return $post->ID;
		}

		if ( ! is_admin() ) {
			$queried_object_id = get_queried_object_id();
			if ( ! empty( $queried_object_id ) ) {
				return $queried_object_id;
			}
		}

		/* No post ID found. */
		return null;
	}

	/**
	 * Sets the parent ID based on the current post/query context.
	 */
	protected function set_parent_id(): void {
		$this->parent_id = $this->get_current_post_id();
	}

	/**
	 * Returns the parent ID.
	 *
	 * @return int|null The parent ID.
	 */
	public function get_parent_id(): ?int {
		if ( ! $this->parent_id ) {
			$this->set_parent_id();
		}
		return $this->parent_id;
	}

	/**
	 * Returns the upload directory path for new files.
	 *
	 * @return string The upload directory path.
	 */
	public function get_new_file_path(): string {
		$uploads = wp_upload_dir();
		return $uploads['path'];
	}

	/**
	 * Sets the path parts array.
	 */
	protected function set_path_parts(): void {
		$direct_path = $this->get_direct_path();

		// For remote URLs, strip query strings and fragments before pathinfo.
		$path_for_info = $direct_path;
		if ( filter_var( $direct_path, FILTER_VALIDATE_URL ) ) {
			$path_for_info = wp_parse_url( $direct_path, PHP_URL_PATH );
		}

		$pathinfo = pathinfo( $path_for_info );

		$path_parts = array(
			'dirname'      => $pathinfo['dirname'] ?? '.',
			'basename'     => sanitize_file_name( $pathinfo['basename'] ?? '' ),
			'extension'    => $pathinfo['extension'] ?? '',
			'filename'     => sanitize_file_name( $pathinfo['filename'] ?? '' ),
			'no_extension' => '',
		);

		// If we only have a dirname, ensure it's not null before concatenation.
		$dirname  = $path_parts['dirname'];
		$filename = $path_parts['filename'];

		$path_parts['no_extension'] = $dirname . '/' . $filename;

		$this->path_parts = $path_parts;
	}

	/**
	 * Returns the directory name of the video file.
	 *
	 * @return string The directory name.
	 */
	public function get_dirname(): string {
		if ( ! $this->path_parts ) {
			$this->set_path_parts();
		}
		return (string) ( $this->path_parts['dirname'] ?? '' );
	}

	/**
	 * Returns the base name of the video file.
	 *
	 * @return string The base name.
	 */
	public function get_basename(): string {
		if ( ! $this->path_parts ) {
			$this->set_path_parts();
		}
		return (string) ( $this->path_parts['basename'] ?? '' );
	}

	/**
	 * Returns the extension of the video file.
	 *
	 * @return string The extension.
	 */
	public function get_extension(): string {
		if ( ! $this->path_parts ) {
			$this->set_path_parts();
		}
		return $this->path_parts['extension'];
	}

	/**
	 * Returns the filename without extension.
	 *
	 * @return string The filename.
	 */
	public function get_filename(): string {
		if ( ! $this->path_parts ) {
			$this->set_path_parts();
		}
		return $this->path_parts['filename'];
	}

	/**
	 * Returns the full path without extension.
	 *
	 * @return string The path without extension.
	 */
	public function get_no_extension(): string {
		if ( ! $this->path_parts ) {
			$this->set_path_parts();
		}
		return $this->path_parts['no_extension'];
	}

	/**
	 * Sets whether the video is compatible with Videopack.
	 */
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
		 *
		 * @param array $compatible Array of compatible video extensions.
		 */
		$compatible = apply_filters( 'videopack_compatible_extensions', $compatible );

		$this->compatible = in_array( $this->get_extension(), $compatible, true );
	}

	/**
	 * Checks if the video is compatible with Videopack.
	 *
	 * @return bool True if compatible, false otherwise.
	 */
	public function is_compatible(): bool {
		if ( ! isset( $this->compatible ) ) {
			$this->set_compatible();
		}
		return $this->compatible;
	}

	/**
	 * Sets the descriptive title of the video.
	 */
	protected function set_title(): void {
		$filename    = basename( $this->source );
		$path_parts  = pathinfo( $filename );
		$title       = $path_parts['filename'];
		$this->title = str_replace( '-', ' ', $title );
	}

	/**
	 * Returns the video title.
	 *
	 * @return string The title.
	 */
	public function get_title(): string {
		if ( ! $this->title ) {
			$this->set_title();
		}
		return $this->title;
	}

	/**
	 * Sets the MIME type of the video.
	 */
	protected function set_mime_type(): void {
		if ( $this->codec ) {
			$this->mime_type = $this->codec->get_mime_type();
			return;
		}

		if ( $this->is_local() && $this->exists() ) {
			$this->mime_type = mime_content_type( $this->get_direct_path() );
		} else {
			// For remote files, or local files that don't exist (placeholders).
			$filetype = wp_check_filetype( $this->get_url() );
			if ( ! empty( $filetype['type'] ) ) {
				$this->mime_type = $filetype['type'];
			}
		}
	}

	/**
	 * Returns the video MIME type.
	 *
	 * @return string The MIME type.
	 */
	public function get_mime_type(): string {
		if ( ! $this->mime_type ) {
			$this->set_mime_type();
		}
		return $this->mime_type ?? '';
	}

	/**
	 * Returns the Videopack video format ID.
	 *
	 * @return string The format ID.
	 */
	public function get_format(): string {
		if ( ! $this->format ) {
			$this->set_format();
		}
		return $this->format;
	}

	/**
	 * Sets the Videopack video format ID based on codec and resolution.
	 */
	protected function set_format(): void {
		$codec = $this->get_codec();

		if ( $codec && $this->resolution ) {
			$formats = $this->options_manager->get_video_formats();
			foreach ( $formats as $format ) {
				if ( $format->get_codec() === $codec && $format->get_resolution() === $this->resolution ) {
					$this->format = $format->get_id();
					break;
				}
			}
		}

		if ( ! $this->format ) {
			$this->format = 'original';
		}
	}

	/**
	 * Returns the preferred codecs for each mime type.
	 *
	 * @return array The preferred codecs array.
	 */
	public function get_preferred_codecs(): array {
		$preferred_codecs = array(
			'video/mp4'  => 'h264',
			'video/webm' => 'vp9',
		);

		/**
		 * Filter preferred video codecs for a mime type. Since multiple codecs can be available for a mime type,
		 * this filter can change or provide a preferred codec for a mime type.
		 *
		 * @param array $preferred_codecs Array of preferred video codecs.
		 * @return array
		 * @since 5.0.0
		 */
		return apply_filters( 'videopack_preferred_codecs', $preferred_codecs );
	}

	/**
	 * Determines the codec by MIME type.
	 *
	 * @return \Videopack\Admin\Formats\Codecs\Video_Codec|bool Codec object or false.
	 */
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
				// Only one available codec with the same MIME type.
				return $same_mime_type[0];
			} elseif ( count( $same_mime_type ) > 1 ) {
				// Multiple available codecs with the same MIME type.
				$preferred_codecs = $this->get_preferred_codecs();
				if ( array_key_exists( $this->get_mime_type(), $preferred_codecs ) ) {
					foreach ( $same_mime_type as $codec_candidate ) {
						if ( $preferred_codecs[ $this->get_mime_type() ] === $codec_candidate->get_id() ) {
							return $codec_candidate;
						}
					}
				}

				// Fallback to the first available codec if no preferred one is found or defined.
				return $same_mime_type[0];
			}
		}
		return false;
	}

	/**
	 * Returns the codec from metadata.
	 *
	 * @return string The codec string.
	 */
	public function get_metadata_codec(): string {
		if ( ! isset( $this->metadata['codec'] ) ) {
			$this->set_metadata_codec();
		}
		return (string) ( $this->metadata['codec'] ?? '' );
	}

	/**
	 * Sets the codec from metadata.
	 */
	protected function set_metadata_codec(): void {

		if ( $this->exists() && $this->is_local() ) {
			if ( ! function_exists( 'wp_read_video_metadata' ) ) {
				require_once ABSPATH . 'wp-admin/includes/media.php';
			}
			$video_metadata = wp_read_video_metadata( $this->source );
		}

		if ( isset( $video_metadata['codec'] ) ) {
			$this->metadata['codec'] = $video_metadata['codec'];
		}
	}

	/**
	 * Sets the video codec.
	 */
	protected function set_codec(): void {

		$codecs = $this->options_manager->get_video_codecs();

		if ( $this->format ) {
			$formats = $this->options_manager->get_video_formats();
			if ( array_key_exists( $this->format, $formats ) ) {
				$this->codec = $formats[ $this->format ]->get_codec();
			}
		}

		if ( ! $this->codec && $this->get_metadata_codec() ) {
			foreach ( $codecs as $codec ) {
				if ( $codec->get_codecs_att() === $this->get_metadata_codec() ) {
					$this->codec = $codec;
					break;
				}
			}
		}

		if ( ! $this->codec ) {
			$codec = $this->get_codec_by_mime_type();
			if ( $codec ) {
				$this->codec = $codec;
			}
		}
	}

	/**
	 * Returns the video codec.
	 *
	 * @return \Videopack\Admin\Formats\Codecs\Video_Codec|null The codec object or null.
	 */
	public function get_codec() {
		if ( ! $this->codec ) {
			$this->set_codec();
		}
		return $this->codec;
	}

	/**
	 * Sets the video resolution.
	 */
	protected function set_resolution(): void {

		if ( $this->format ) {
			$formats = $this->options_manager->get_video_formats();
			if ( array_key_exists( $this->format, $formats ) ) {
				$resolution_object = $formats[ $this->format ]->get_resolution();
				if ( $resolution_object ) {
					$this->resolution = $resolution_object->get_height();
				}
			}
		} elseif ( $this->get_height() ) {
			$resolutions = $this->options_manager->get_video_resolutions();
			foreach ( $resolutions as $resolution ) {
				if ( $resolution->get_height() === $this->get_height() ) {
					$this->resolution = $resolution->get_height();
					break;
				}
			}
		}
	}

	/**
	 * Returns the video resolution.
	 *
	 * @return int|null The resolution height.
	 */
	public function get_resolution() {
		if ( ! $this->resolution ) {
			$this->set_resolution();
		}
		return $this->resolution;
	}

	/**
	 * Sets the video dimensions.
	 */
	protected function set_dimensions(): void {

		if ( ! empty( $this->metadata['actualwidth'] ) ) {
			$this->width = $this->metadata['actualwidth'];
		} elseif ( ! empty( $this->metadata['width'] ) ) {
			$this->width = $this->metadata['width'];
		}

		if ( ! empty( $this->metadata['actualheight'] ) ) {
			$this->height = $this->metadata['actualheight'];
		} elseif ( ! empty( $this->metadata['height'] ) ) {
			$this->height = $this->metadata['height'];
		}
	}

	/**
	 * Returns the video dimensions.
	 *
	 * @return array {
	 *     @type int $width
	 *     @type int $height
	 * }
	 */
	public function get_dimensions(): array {

		if ( ! $this->width || ! $this->height ) {
			$this->set_dimensions();
		}

		return array(
			'width'  => $this->width,
			'height' => $this->height,
		);
	}

	/**
	 * Returns the video width.
	 *
	 * @return int The width.
	 */
	public function get_width(): int {

		if ( ! $this->width ) {
			$this->set_dimensions();
		}

		return $this->width;
	}

	/**
	 * Returns the video height.
	 *
	 * @return int The height.
	 */
	public function get_height(): int {

		if ( ! $this->height ) {
			$this->set_dimensions();
		}

		return $this->height;
	}

	/**
	 * Sets the video aspect ratio.
	 */
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

	/**
	 * Returns the video aspect ratio.
	 *
	 * @return float The aspect ratio.
	 */
	public function get_aspect_ratio(): float {

		$this->set_aspect_ratio();
		return $this->aspect_ratio;
	}

	/**
	 * Sets the video duration.
	 */
	protected function set_duration(): void {
		$this->duration = $this->metadata['duration'];
	}

	/**
	 * Returns the video duration.
	 *
	 * @return float The duration.
	 */
	public function get_duration(): float {

		if ( ! $this->duration ) {
			$this->set_duration();
		}

		return $this->duration;
	}

	/**
	 * Returns the video view count.
	 *
	 * @return int|null The view count.
	 */
	public function get_views(): ?int {
		if ( ! isset( $this->metadata['starts'] ) ) {
			$this->set_metadata();
		}
		return isset( $this->metadata['starts'] ) ? (int) $this->metadata['starts'] : 0;
	}

	/**
	 * Get the poster image URL for the video.
	 *
	 * @return string The poster image URL.
	 */
	public function get_poster(): string {
		return isset( $this->metadata['poster'] ) ? $this->metadata['poster'] : '';
	}

	/**
	 * Get the caption for the video.
	 *
	 * @return string The video caption.
	 */
	public function get_caption(): string {
		return isset( $this->metadata['caption'] ) ? $this->metadata['caption'] : '';
	}

	/**
	 * Get the description for the video.
	 *
	 * @return string The video description.
	 */
	public function get_description(): string {
		return isset( $this->metadata['description'] ) ? $this->metadata['description'] : '';
	}

	/**
	 * Get the text tracks for the video.
	 *
	 * @return array The text tracks.
	 */
	public function get_tracks(): array {
		if ( isset( $this->metadata['track'] ) ) {
			return $this->metadata['track'];
		}
		return isset( $this->metadata['tracks'] ) ? $this->metadata['tracks'] : array();
	}

	/**
	 * Checks if the source is the original video.
	 *
	 * @return bool True if original, false otherwise.
	 */
	public function is_original(): bool {
		return $this->get_format() === 'original';
	}

	/**
	 * Returns all configured video formats.
	 *
	 * @return array Array of formats.
	 */
	public function get_video_formats(): array {
		return $this->video_formats;
	}

	/**
	 * Returns all child sources.
	 *
	 * @return array Array of child sources.
	 */
	public function get_child_sources(): array {

		if ( $this->is_original() && empty( $this->child_sources ) ) {
			$this->set_child_sources();
		}
		return $this->child_sources;
	}

	/**
	 * Returns existing child sources.
	 *
	 * @return array Array of existing child sources.
	 */
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

	/**
	 * Sets the child sources.
	 */
	abstract protected function set_child_sources(): void;

	/**
	 * Sets a specific child source.
	 *
	 * @param string $format_id   The format ID.
	 * @param mixed  $source      The video source.
	 * @param bool   $exists      Whether the source exists.
	 * @param string $source_type The source type.
	 */
	public function set_child_source( string $format_id, $source, bool $exists, string $source_type ): void {
		$this->child_sources[ $format_id ] = Source_Factory::create(
			$source,
			$this->options_manager,
			$format_id,
			$exists,
			$this->get_parent_id(),
			$source_type
		);
	}

	/**
	 * Finds attachment children.
	 *
	 * @return array Array of found attachment IDs.
	 */
	protected function find_attachment_children(): array {
		return Video_Source_Finder::find_attachment_children( $this );
	}

	/**
	 * Finds a format in a list of posts.
	 *
	 * @param array                                 $posts  The posts to search.
	 * @param \Videopack\Admin\Formats\Video_Format $format The format to find.
	 * @return bool True if found, false otherwise.
	 */
	protected function find_format_in_posts( $posts, \Videopack\Admin\Formats\Video_Format $format ): bool {

		return Video_Source_Finder::find_format_in_posts( $posts, $format, $this );
	}

	/**
	 * Finds a format in the same directory as the source.
	 *
	 * @param \Videopack\Admin\Formats\Video_Format $format The format to find.
	 * @return bool|string The found path or false.
	 */
	protected function find_format_in_same_directory( \Videopack\Admin\Formats\Video_Format $format ) {

		return Video_Source_Finder::find_format_in_same_directory( $format, $this );
	}

	/**
	 * Finds a format in the same URL directory as the source.
	 *
	 * @param \Videopack\Admin\Formats\Video_Format $format  The format to find.
	 * @param int                                   $post_id The post ID.
	 * @return bool|string The found URL or false.
	 */
	protected function find_format_in_same_url_directory( \Videopack\Admin\Formats\Video_Format $format, $post_id ) {

		return Video_Source_Finder::find_format_in_same_url_directory( $format, $this, $post_id );
	}

	/**
	 * Creates a placeholder for a video source.
	 *
	 * @param \Videopack\Admin\Formats\Video_Format $format The format for which to create a placeholder.
	 */
	protected function create_source_placeholder( \Videopack\Admin\Formats\Video_Format $format ) {

		$this->set_child_source(
			$format->get_id(),
			$this->get_new_file_path() . $this->get_basename() . $format->get_suffix(),
			false,
			'placeholder'
		);
	}

	/**
	 * Returns the codec attribute string.
	 *
	 * @return string The codec string.
	 */
	protected function get_codecs_att(): string {
		$codecs = '';
		if ( $this->get_metadata_codec() ) {
			$codecs = $this->get_metadata_codec();
		} elseif ( $this->get_codec() ) {
			$codecs = $this->get_codec()->get_codecs_att();
		}
		return $codecs;
	}

	/**
	 * Returns video player source information.
	 *
	 * @return array {
	 *     @type string $src
	 *     @type string $type
	 *     @type string $codecs
	 *     @type int    $resolution
	 * }
	 */
	public function get_video_player_source(): array {

		$video_player_source = array(
			'src'        => $this->get_url(),
			'type'       => $this->get_mime_type(),
			'codecs'     => $this->get_codecs_att(),
			'resolution' => $this->get_resolution(),
		);

		return $video_player_source;
	}

	/**
	 * Handles an error.
	 *
	 * @param string $error The error message.
	 */
	protected function handle_error( string $error ): void {
		// Error handling logic.
	}
}
