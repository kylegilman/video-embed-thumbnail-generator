<?php

namespace Videopack\Video_Source;

class Source_Attachment_Local extends Source {

	protected $meta_manager = null;

	public function __construct(
		$source,
		\Videopack\Admin\Options $options_manager,
		$format = null,
		$exists = null,
		$parent_id = null
	) {
		$attachment_id = is_array( $source ) ? $source['id'] : $source;
		if ( $this->validate_source( $attachment_id ) ) {
			parent::__construct( $source, 'attachment_local', $options_manager, $format, $exists, $parent_id );
			$this->set_id();
			$this->set_metadata();
		} else {
			throw new \Exception( 'Invalid attachment ID.' );
		}
	}

	public function validate_source( $attachment_id ): bool {

		if ( ! is_numeric( $attachment_id )
			|| get_post_type( (int) $attachment_id ) !== 'attachment'
		) {
			$this->handle_error( 'Invalid attachment ID.' );
			return false;
		}

		return true;
	}

	public function set_id(): void {
		$this->id = is_array( $this->source ) ? $this->source['id'] : $this->source;
	}

	public function set_metadata( ?array $metadata = null ): void {
		if ( $metadata ) {
			$this->metadata = $metadata;
			return;
		}
		$attachment_id = $this->get_id();
		if ( ! $this->meta_manager ) {
			$this->meta_manager = new \Videopack\Admin\Attachment_Meta( $this->options_manager, $attachment_id );
		}
		$this->metadata = $this->meta_manager->get();
	}

	protected function set_url(): void {
		$attachment_id = is_array( $this->source ) ? $this->source['id'] : $this->source;
		$original_url  = is_array( $this->source ) ? $this->source['url'] : '';

		// 1. Check for remote attachment URL (hybrid source)
		$external_url = get_post_meta( $attachment_id, '_kgflashmediaplayer-externalurl', true );
		if ( $external_url ) {
			$this->url = $external_url;
			return;
		}

		// 2. Fallback to standard attachment URL logic
		$attachment_url = wp_get_attachment_url( $attachment_id );

		if ( ! empty( $original_url ) ) {
			$rewrite_url = (bool) $this->options['rewrite_attachment_url'];

			if ( $rewrite_url ) {
				$exempt_cdns = array(
					'amazonaws.com',
					'rackspace.com',
					'netdna-cdn.com',
					'nexcess-cdn.net',
					'limelight.com',
					'digitaloceanspaces.com',
				);
				/**
				 * Filter the list of CDN domains exempt from URL rewriting.
				 * @param array $exempt_cdns Array of CDN domains.
				 */
				$exempt_cdns = apply_filters( 'videopack_exempt_cdns', $exempt_cdns );

				foreach ( $exempt_cdns as $exempt_cdn ) {
					if ( strpos( $original_url, $exempt_cdn ) !== false ) {
						$rewrite_url = false;
						break;
					}
				}
			}

			if ( ! $rewrite_url ) {
				$this->url = $original_url;
				return;
			}
		}

		$this->url = $attachment_url;
	}

	protected function set_exists(): void {
		$external_url = get_post_meta( $this->id, '_kgflashmediaplayer-externalurl', true );
		if ( $external_url ) {
			$this->exists = true; // Assume it exists if it's a remote URL we've resolved
			return;
		}
		$this->exists = file_exists( get_attached_file( $this->id ) );
	}

	protected function set_direct_path(): void {
		$external_url = get_post_meta( $this->id, '_kgflashmediaplayer-externalurl', true );
		if ( $external_url ) {
			$this->direct_path = $external_url;
			return;
		}
		$this->direct_path = get_attached_file( $this->id );
	}

	protected function set_local(): void {
		$this->local = true;
	}

	protected function set_parent_id(): void {
		$parent_id = wp_get_post_parent_id( $this->source );
		if ( ! $parent_id ) {
			$parent_id = $this->get_current_post_id();
		}
		$this->parent_id = $parent_id;
	}

	protected function set_title(): void {
		$this->title = get_the_title( $this->source );
	}

	protected function set_mime_type(): void {
		$this->mime_type = get_post_mime_type( $this->source );

		// For remote attachments, post_mime_type might be empty or generic.
		// If we have an external URL, double check the file extension.
		if ( empty( $this->mime_type ) || 'video/mp4' === $this->mime_type ) {
			$external_url = get_post_meta( $this->id, '_kgflashmediaplayer-externalurl', true );
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
	 * @return string
	 */
	public function get_poster(): string {
		// 1. Check primary metadata (already merged from _videopack-meta)
		if ( ! empty( $this->metadata['poster'] ) ) {
			return $this->metadata['poster'];
		}

		// 2. Fallback to legacy field if not already migrated
		$legacy_poster = get_post_meta( $this->id, '_kgflashmediaplayer-poster', true );
		if ( ! empty( $legacy_poster ) ) {
			return $legacy_poster;
		}

		// 3. Fallback to featured image (_thumbnail_id)
		$thumbnail_id = get_post_thumbnail_id( $this->id );
		if ( $thumbnail_id ) {
			$thumbnail_url = wp_get_attachment_url( $thumbnail_id );
			if ( $thumbnail_url ) {
				return $thumbnail_url;
			}
		}

		return '';
	}

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
}
