<?php

namespace Videopack\Video_Source;

class Source_Attachment_Local extends Source {

	protected $meta_manager = null;

	public function __construct(
		int $attachment_id,
		\Videopack\Admin\Options $options_manager,
		$format = null,
		$exists = false
	) {

		if ( $this->validate_source( $attachment_id ) ) {
			parent::__construct( $attachment_id, 'attachment_local', $options_manager, $format, $exists );
			$this->set_metadata();
		} else {
			throw new \Exception( 'Invalid attachment ID.' );
		}
	}

	public function validate_source( $attachment_id ): bool {

		if ( ! is_numeric( $attachment_id )
			|| get_post_type( $attachment_id ) !== 'attachment'
		) {
			$this->handle_error( 'Invalid attachment ID.' );
			return false;
		}

		return true;
	}

	public function set_source_id(): void {
		$this->source_id = $this->source;
	}

	public function set_metadata( array $metadata = null ): void {
		if ( $metadata ) {
			$this->metadata = $metadata;
			return;
		}
		if ( ! $this->meta_manager ) {
			$this->meta_manager = new \Videopack\Admin\Attachment_Meta( $this->options_manager );
		}
		$this->metadata = $this->meta_manager->get( $this->source );
	}

	protected function set_url(): void {
		$this->url = wp_get_attachment_url( $this->source );
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

			$same_directory = $this->find_format_in_same_directory( $format );
			if ( $same_directory ) {
				continue;
			}

			$this->create_source_placeholder( $format );
		}
	}
}
