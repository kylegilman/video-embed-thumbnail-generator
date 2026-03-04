<?php

namespace Videopack\Video_Source;

class Source_Attachment_Local extends Source {

	protected $meta_manager = null;

	public function __construct(
		$source,
		\Videopack\Admin\Options $options_manager,
		$format = null,
		$exists = false,
		$parent_id = null
	) {
		$attachment_id = is_array( $source ) ? $source['id'] : $source;
		if ( $this->validate_source( $attachment_id ) ) {
			parent::__construct( $source, 'attachment_local', $options_manager, $format, $exists, $parent_id );
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
		$attachment_id = is_array( $this->source ) ? $this->source['id'] : $this->source;
		if ( ! $this->meta_manager ) {
			$this->meta_manager = new \Videopack\Admin\Attachment_Meta( $this->options_manager, $attachment_id );
		}
		$this->metadata = $this->meta_manager->get();
	}

	protected function set_url(): void {
		$attachment_id  = is_array( $this->source ) ? $this->source['id'] : $this->source;
		$original_url   = is_array( $this->source ) ? $this->source['url'] : '';
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
		$this->exists = file_exists( get_attached_file( $this->source ) );
	}

	protected function set_direct_path(): void {
		$this->direct_path = get_attached_file( $this->source );
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
