<?php
/**
 * Local attachment video source subclass.
 *
 * @package Videopack
 */

namespace Videopack\Video_Source;

/**
 * Class Source_Attachment
 *
 * Handles video sources that are WordPress attachments stored locally (or on a remote storage provider via hybrid attachment).
 *
 * @since 5.0.0
 * @package Videopack\Video_Source
 */
class Source_Attachment extends Source {

	/**
	 * Attachment metadata manager.
	 *
	 * @var \Videopack\Admin\Attachment_Meta|null $meta_manager
	 */
	protected $meta_manager = null;

	/**
	 * Constructor.
	 *
	 * @param int|string|array                       $source          The attachment ID, or an array containing the 'id' (and optional 'url').
	 * @param array                                  $options         Videopack options array.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Optional. Videopack video formats registry.
	 * @param string|null                            $format          Optional. Videopack video format ID.
	 * @param bool|null                              $exists          Optional. Whether the source exists.
	 * @param int|null                               $parent_id       Optional. Parent ID (post ID, etc.).
	 *
	 * @throws \Exception If the attachment ID is invalid.
	 */
	public function __construct(
		$source,
		array $options,
		\Videopack\Admin\Formats\Registry $format_registry = null,
		$format = null,
		$exists = null,
		$parent_id = null
	) {
		$attachment_id = is_array( $source ) ? $source['id'] : $source;
		if ( $this->validate_source( $attachment_id ) ) {
			parent::__construct( $source, 'attachment', $options, $format_registry, $format, $exists, $parent_id );
			$this->set_id();
			$this->set_metadata();
		} else {
			throw new \Exception( 'Invalid attachment ID.' );
		}
	}

	/**
	 * Validates the attachment ID.
	 *
	 * @param string|int $attachment_id The attachment ID.
	 * @return bool True if valid, false otherwise.
	 */
	public function validate_source( $attachment_id ): bool {

		if ( ! is_numeric( $attachment_id )
			|| get_post_type( (int) $attachment_id ) !== 'attachment'
		) {
			$this->handle_error( 'Invalid attachment ID.' );
			return false;
		}

		return true;
	}

	/**
	 * Sets the source ID.
	 */
	public function set_id(): void {
		$this->id = is_array( $this->source ) ? $this->source['id'] : $this->source;
	}

	/**
	 * Sets the video metadata.
	 *
	 * @param array|null $metadata Optional. The metadata array.
	 */
	public function set_metadata( ?array $metadata = null ): void {
		if ( $metadata ) {
			$this->metadata = $metadata;
			return;
		}
		$attachment_id = $this->get_id();
		if ( ! $this->meta_manager ) {
			$this->meta_manager = new \Videopack\Admin\Attachment_Meta( $this->options, (int) $attachment_id );
		}
		$this->metadata = $this->meta_manager->get();
	}

	/**
	 * Sets the video URL.
	 */
	protected function set_url(): void {
		$attachment_id = is_array( $this->source ) ? $this->source['id'] : $this->source;

		// Check for remote attachment URL (hybrid source).
		$external_url = $this->metadata['url'] ?? null;
		if ( $external_url ) {
			$this->url = $external_url;
			return;
		}

		$this->url = wp_get_attachment_url( $attachment_id );
	}

	/**
	 * Sets whether the video source exists.
	 */
	protected function set_exists(): void {
		$external_url      = $this->metadata['url'] ?? null;
		$is_remote         = (bool) ( $this->metadata['is_remote'] ?? false );
		$is_remote_storage = (bool) apply_filters( 'videopack_source_is_cloud', false, $this->metadata, $this );

		if ( $external_url || $is_remote || $is_remote_storage ) {
			$this->exists = true; // Assume it exists if it's a remote URL or marked as remote.
			return;
		}

		$filepath = get_attached_file( (int) $this->id );
		if ( $filepath && file_exists( $filepath ) ) {
			$this->exists = true;
			return;
		}

		// Fallback for remote-offloaded attachments.
		// If the attachment URL is different from the local upload URL structure, or if a filter says so.
		$this->exists = (bool) apply_filters( 'videopack_attachment_exists', false, (int) $this->id );

		if ( ! $this->exists ) {
			$attachment_url = wp_get_attachment_url( (int) $this->id );
			$uploads        = wp_upload_dir();
			if ( $attachment_url && strpos( $attachment_url, $uploads['baseurl'] ) === false ) {
				$this->exists = true;
			}
		}
	}

	/**
	 * Sets the direct path to the video.
	 */
	protected function set_direct_path(): void {
		$external_url      = $this->metadata['url'] ?? null;
		$is_remote         = (bool) ( $this->metadata['is_remote'] ?? false );
		$is_remote_storage = (bool) apply_filters( 'videopack_source_is_cloud', false, $this->metadata, $this );

		if ( $external_url || $is_remote || $is_remote_storage ) {
			$this->direct_path = (string) ( $external_url ? $external_url : $this->get_url() );
			return;
		}
		$filepath = get_attached_file( (int) $this->id );
		if ( $filepath && file_exists( $filepath ) ) {
			$this->direct_path = $filepath;
		} else {
			$this->direct_path = $this->get_url();
		}
	}

	/**
	 * Sets whether the video source is local.
	 */
	protected function set_local(): void {
		$is_remote_storage = (bool) apply_filters( 'videopack_source_is_cloud', false, $this->metadata, $this );
		$this->local       = ! $is_remote_storage;
	}

	/**
	 * Sets the parent ID.
	 */
	protected function set_parent_id(): void {
		$parent_id = wp_get_post_parent_id( (int) $this->get_id() );
		if ( ! $parent_id ) {
			$parent_id = $this->get_current_post_id();
		}
		$this->parent_id = $parent_id;
	}

	/**
	 * Sets the descriptive title of the video.
	 */
	protected function set_title(): void {
		$this->title = get_the_title( (int) $this->get_id() );
	}

	/**
	 * Sets the MIME type of the video.
	 */
	protected function set_mime_type(): void {
		$this->mime_type = get_post_mime_type( (int) $this->get_id() );

		// For remote attachments, post_mime_type might be empty or generic.
		// If we have an external URL, double check the file extension.
		if ( empty( $this->mime_type ) || 'video/mp4' === $this->mime_type ) {
			$external_url = $this->metadata['url'] ?? null;
			if ( $external_url ) {
				$filetype = wp_check_filetype( $external_url );
				if ( ! empty( $filetype['type'] ) ) {
					$this->mime_type = $filetype['type'];
				}
			}
		}
	}

	/**
	 * Get the poster image URL for the video with fallbacks.
	 *
	 * Order of priority:
	 * 1. poster_id in _videopack-meta
	 * 2. _thumbnail_id (featured image) on the attachment itself
	 * 3. legacy _kgflashmediaplayer-poster-id
	 * 4. poster URL in _videopack-meta
	 * 5. legacy _kgflashmediaplayer-poster URL
	 *
	 * @return string The poster image URL.
	 */
	public function get_poster(): string {
		$poster_url = '';

		// 1. Check for poster defined in attachment metadata via Attachment_Meta helper.
		$attachment_meta = new \Videopack\Admin\Attachment_Meta( array(), (int) $this->id );
		$poster_url      = $attachment_meta->get_poster_url();
		if ( $poster_url ) {
			return (string) apply_filters( 'videopack_source_get_poster', $poster_url, $this );
		}

		// 2. Check for featured image (_thumbnail_id) on the attachment itself.
		$thumbnail_id = get_post_thumbnail_id( (int) $this->id );
		if ( ! empty( $thumbnail_id ) ) {
			$poster_url = wp_get_attachment_url( (int) $thumbnail_id );
			if ( $poster_url ) {
				return (string) apply_filters( 'videopack_source_get_poster', $poster_url, $this );
			}
		}

		// 5. Fallback to original GIF itself if mime type is image/gif.
		if ( 'image/gif' === get_post_mime_type( (int) $this->id ) ) {
			$poster_url = wp_get_attachment_url( (int) $this->id );
			if ( $poster_url ) {
				return (string) apply_filters( 'videopack_source_get_poster', $poster_url, $this );
			}
		}

		return (string) apply_filters( 'videopack_source_get_poster', '', $this );
	}

	/**
	 * Sets the child sources.
	 */
	protected function set_child_sources(): void {

		$children = $this->find_attachment_children();

		foreach ( $this->video_formats as $format ) {

			$child = $this->find_format_in_posts( $children, $format );
			if ( $child ) {
				continue;
			}

			if ( $this->options['find_formats'] ) {
				$same_directory = $this->find_format_in_same_directory( $format );
				if ( $same_directory ) {
					continue;
				}
			}

			$this->create_source_placeholder( $format );
		}
	}

	/**
	 * Get the download URL for the video.
	 *
	 * Uses the Videopack download redirect to force download via PHP.
	 *
	 * @return string The download URL.
	 */
	public function get_download_url(): string {
		$url = (string) add_query_arg( 'videopack[download]', 'true', get_permalink( (int) $this->get_id() ) );
		return (string) apply_filters( 'videopack_attachment_get_download_url', $url, $this );
	}
}
