<?php

namespace Videopack\Video_Source;

class Source_Url extends Source {

	public function __construct(
		string $source,
		\Videopack\Admin\Options $options_manager,
		$format = null,
		$exists = null,
		$parent_id = null
	) {

		if ( $this->validate_source( $source ) ) {
			parent::__construct( $source, 'url', $options_manager, $format, $exists, $parent_id );
		} else {
			throw new \Exception( esc_html__( 'Source is empty.', 'video-embed-thumbnail-generator' ) );
		}
	}

	protected function set_url(): void {
		$this->url = $this->source;
	}

	protected function set_exists(): void {
		$this->exists = $this->url_exists( $this->source );
	}

	protected function set_direct_path(): void {
		$this->direct_path = $this->source;
	}

	protected function set_local(): void {
		$this->local = false;
	}

	protected function set_parent_id(): void {
		$this->get_current_post_id();
	}

	protected function set_title(): void {
		$this->title = basename( $this->source );
	}

	protected function set_mime_type(): void {
		$this->mime_type = mime_content_type( $this->source );
	}

	public function set_metadata(): void {
		$this->metadata = wp_read_video_metadata( $this->source );
	}

	protected function set_child_sources(): void {

		foreach ( $this->video_formats as $format ) {

			$same_directory = $this->find_format_in_same_directory( $format );
			if ( $same_directory ) {
				continue;
			}

			$same_url_directory = $this->find_format_in_same_url_directory( $format, $this->get_parent_id() );
			if ( $same_url_directory ) {
				continue;
			}

			$this->create_source_placeholder( $format );
		}
	}
}
