<?php

namespace Videopack\Video_Source;

/**
 * Class Video_Source
 * Defines the base class for video input types.
 *
 * @since 5.0.0
 * @package Videopack\Admin\Input
 * @abstract
 * @param string|int $source
 * @param string $type
 * @param \Videopack\Admin\Options $options_manager
 */
abstract class Source {
	/**
	 * Primary source of the video. This could be a URL, attachment ID, or other source.
	 * @var string|int $source
	 */
	protected $source;

	/**
	 * Unique ID of the video source. This could be an attachment ID or other identifier based on filename.
	 * @var string $id
	 */
	protected $id;

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
	 * @var boolean $local
	 */
	protected $local;

	/**
	 * Parent ID. Could be a post ID, attachment ID, or null.
	 * @var int|null $parent_id
	 */
	protected $parent_id;

	/**
	 * Array of parts of the video path. Used for generating thumbnails, encoding video formats, and other file operations.
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
	 * Video resolution.
	 * @var \Videopack\Admin\Formats\Video_Resolution $resolution
	 */
	protected $resolution;

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
	 * Array of \Videopack\Admin\Formats\Video_Source objects.
	 * @var array $child_sources
	 */
	protected $child_sources;

	/**
	 * Video_Source constructor.
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

	abstract public function set_metadata( array $metadata = null ): void;

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

	public function get_id(): string {
		if ( ! $this->id ) {
			$this->set_id();
		}
		return $this->id;
	}

	protected function set_id(): void {
		$sanitized_url = \Videopack\Common\Validate::sanitize_url( $this->url );
		$this->id      = $sanitized_url['singleurl_id'];
	}

	abstract protected function set_url(): void;

	public function get_url(): string {
		if ( ! $this->url ) {
			$this->set_url();
		}
		return $this->url;
	}

	public function get_download_url(): string {
		return $this->get_url();
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

	abstract protected function set_local(): void;

	public function is_local(): bool {
		if ( ! isset( $this->local ) ) {
			$this->set_local();
		}
		return $this->local;
	}

	protected function get_current_post_id(): int {
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

		// No post ID found
		return null;
	}

	protected function set_parent_id(): void {
		$this->get_current_post_id();
	}

	public function get_parent_id(): int {
		if ( ! $this->parent_id ) {
			$this->set_parent_id();
		}
		return $this->parent_id;
	}

	public function get_new_file_path(): string {
		$uploads = wp_upload_dir();
		return $uploads['path'];
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

	protected function set_title(): void {
		$this->title = basename( $this->source );
	}

	public function get_title(): string {
		if ( ! $this->title ) {
			$this->set_title();
		}
		return $this->title;
	}

	protected function set_mime_type(): void {
		if ( $this->get_codec() ) {
			$this->mime_type = $this->get_codec()->get_mime_type();
		} else {
			$this->mime_type = mime_content_type( $this->source );
		}
	}

	public function get_mime_type(): string {
		if ( ! $this->mime_type ) {
			$this->set_mime_type();
		}
		return $this->mime_type;
	}

	public function get_format(): string {
		if ( ! $this->format ) {
			$this->set_format();
		}
		return $this->format;
	}

	protected function set_format(): void {
		$codec      = $this->get_codec();
		$resolution = $this->get_resolution();

		if ( $codec && $resolution ) {
			$formats = $this->options_manager->get_video_formats();
			foreach ( $formats as $format ) {
				if ( $format->get_codec() === $codec && $format->get_resolution() === $resolution ) {
					$this->format = $format->get_id();
					break;
				}
			}
		}
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

	public function get_metadata_codec(): string {
		if ( ! isset( $this->metadata['codec'] ) ) {
			$this->set_metadata_codec();
		}
		return $this->metadata['codec'];
	}

	protected function set_metadata_codec(): void {

		if ( $this->exists() && $this->is_local() ) {
			$video_metadata = wp_read_video_metadata( $this->source );
		}

		if ( isset( $video_metadata['codec'] ) ) {
			$this->metadata['codec'] = $video_metadata['codec'];
		}
	}

	protected function set_codec(): void {

		$codecs = $this->options_manager->get_video_codecs();

		if ( $this->get_format() ) {
			$formats = $this->options_manager->get_video_formats();
			if ( array_key_exists( $this->format, $formats ) ) {
				$this->codec = $formats[ $this->format ]->get_codec();
			}
		} elseif ( $this->get_metadata_codec() ) {
			foreach ( $codecs as $codec ) {
				if ( $codec->get_codecs_att() === $this->get_metadata_codec() ) {
					$this->codec = $codec;
					break;
				}
			}
		} else {
			$codec = $this->get_codec_by_mime_type();
			if ( $codec ) {
				$this->codec = $codec;
			}
		}
	}

	public function get_codec() {
		if ( ! $this->codec ) {
			$this->set_codec();
		}
		return $this->codec;
	}

	protected function set_resolution(): void {

		if ( $this->get_format() ) {
			$formats = $this->options_manager->get_video_formats();
			if ( array_key_exists( $this->format, $formats ) ) {
				$this->resolution = $formats[ $this->format ]->get_resolution();
			}
		} elseif ( $this->get_height() ) {
			$resolutions = $this->options_manager->get_video_resolutions();
			foreach ( $resolutions as $resolution ) {
				if ( $resolution->get_height() === $this->get_height() ) {
					$this->resolution = $resolution;
					break;
				}
			}
		}
	}

	public function get_resolution() {
		if ( ! $this->resolution ) {
			$this->set_resolution();
		}
		return $this->resolution;
	}

	protected function set_dimensions(): void {

		if ( $this->metadata['width'] ) {
			$this->width = $this->metadata['width'];
		}

		if ( $this->metadata['height'] ) {
			$this->height = $this->metadata['height'];
		}
	}

	public function get_dimensions(): array {

		if ( ! $this->width || ! $this->height ) {
			$this->set_dimensions();
		}

		return array(
			'width'  => $this->width,
			'height' => $this->height,
		);
	}

	public function get_width(): int {

		if ( ! $this->width ) {
			$this->set_dimensions();
		}

		return $this->width;
	}

	public function get_height(): int {

		if ( ! $this->height ) {
			$this->set_dimensions();
		}

		return $this->height;
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

	protected function set_duration(): void {
		$this->duration = $this->metadata['duration'];
	}

	public function get_duration(): float {

		if ( ! $this->duration ) {
			$this->set_duration();
		}

		return $this->duration;
	}

	public function get_views(): ?int {
		if ( ! isset( $this->metadata['starts'] ) ) {
			$this->set_metadata();
		}
		return $this->metadata['starts'];
	}

	/**
	 * Get the poster image URL for the video.
	 * @return string
	 */
	public function get_poster(): string {
		return isset( $this->metadata['poster'] ) ? $this->metadata['poster'] : '';
	}

	/**
	 * Get the caption for the video.
	 * @return string
	 */
	public function get_caption(): string {
		return isset( $this->metadata['caption'] ) ? $this->metadata['caption'] : '';
	}

	/**
	 * Get the description for the video.
	 * @return string
	 */
	public function get_description(): string {
		return isset( $this->metadata['description'] ) ? $this->metadata['description'] : '';
	}

	/**
	 * Get the text tracks for the video.
	 * @return array
	 */
	public function get_tracks(): array {
		return isset( $this->metadata['tracks'] ) ? $this->metadata['tracks'] : array();
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

	protected function find_format_in_posts( $posts, \Videopack\Admin\Formats\Video_Format $format ): bool {

		if ( $posts ) {
			foreach ( $posts as $post ) {
				if ( is_a( $post, 'WP_Post' ) ) {
					$meta_format = get_post_meta( $post->ID, '_kgflashmediaplayer-format', true );
					if ( $meta_format === $format->get_id()
						|| $meta_format === $format->get_legacy_id()
					) {
						$this->set_child_source(
							$format->get_id(),
							$post->ID,
							true,
							'attachment_local'
						);
						return true;
					}
				}
			}
		}
		return false;
	}

	protected function find_format_in_same_directory( \Videopack\Admin\Formats\Video_Format $format ) {

		$file = $this->get_no_extension() . $format->get_suffix();
		if ( ! file_exists( $file ) ) {
			$legacy_file = $this->get_no_extension() . $format->get_legacy_suffix();
			if ( file_exists( $legacy_file ) ) {
				$file = $legacy_file;
			}
		}

		if ( file_exists( $file ) ) {

			$attachment_manager = new \Videopack\Admin\Attachment( $this->options_manager );
			$attachment_id      = $attachment_manager->url_to_id( $file );

			if ( $attachment_id ) {
				$this->set_child_source(
					$format->get_id(),
					$attachment_id,
					true,
					'attachment_local'
				);
				return true;
			}

			$this->set_child_source(
				$format->get_id(),
				$file,
				true,
				'file_local'
			);
			return true;
		}

		return false;
	}

	protected function find_format_in_same_url_directory( \Videopack\Admin\Formats\Video_Format $format, $post_id ) {

		$sanitized_url = \Videopack\Common\Validate::sanitize_url( $this->url );
		$potential_url = $this->get_no_extension() . $format->get_suffix();
		$meta_key      = '_videopack-' . $sanitized_url['singleurl_id'] . '-' . $format->get_id();

		$already_checked_url = get_post_meta( $post_id, $meta_key, true );
		if ( empty( $already_checked_url ) ) {
			if ( $this->url_exists( esc_url_raw( str_replace( ' ', '%20', $potential_url ) ) ) ) {
				update_post_meta( $post_id, $meta_key, $potential_url );
				$this->set_child_source(
					$format->get_id(),
					$potential_url,
					true,
					$this->get_parent_id(),
					'url'
				);
				return true;
			} else {
				update_post_meta( $post_id, $meta_key, 'not found' );
			}
		} elseif ( substr( $already_checked_url, 0, 4 ) == 'http' ) { // url already checked
			// if it smells like a URL...
			$this->set_child_source(
				$format->get_id(),
				$already_checked_url,
				true,
				'url'
			);
			return true;
		}
		return false;
	}

	protected function create_source_placeholder( \Videopack\Admin\Formats\Video_Format $format ) {

		$this->set_child_source(
			$format->get_id(),
			$this->get_new_file_path() . $this->get_basename() . $format->get_suffix(),
			false,
			'placeholder'
		);
	}

	protected function url_exists( $url ) {

		$transient_key = 'videopack_url_exists_' . md5( $url );
		$exists        = get_transient( $transient_key );

		if ( $exists ) {
			return true;
		}

		$response = wp_remote_head( $url, array( 'redirection' => 5 ) );

		if ( is_wp_error( $response ) ) {
			return false; // In case of error, consider the URL does not exist
		}

		$response_code = wp_remote_retrieve_response_code( $response );
		$exists        = ( $response_code >= 200 && $response_code < 300 );
		set_transient( $transient_key, $exists, DAY_IN_SECONDS );
		return ( $exists );
	}

	protected function get_codecs_att(): string {
		$codecs = '';
		if ( $this->get_metadata_codec() ) {
			$codecs = $this->get_metadata_codec();
		} elseif ( $this->get_codec() ) {
			$codecs = $this->get_codec()->get_codecs_att();
		}
		return $codecs;
	}

	public function get_video_player_source(): array {

		$video_player_source = array(
			'src'        => $this->get_url(),
			'type'       => $this->get_mime_type(),
			'codecs'     => $this->get_codecs_att(),
			'resolution' => $this->get_resolution(),
		);

		return $video_player_source;
	}

	protected function handle_error( string $error ): void {
		// Error handling logic
	}
}
