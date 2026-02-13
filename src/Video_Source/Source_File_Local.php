<?php

namespace Videopack\Video_Source;

class Source_File_Local extends Source {

	public function __construct(
		string $source,
		\Videopack\Admin\Options $options_manager,
		$format = null,
		$exists = null,
		$parent_id = null
	) {

		if ( $this->validate_source( $source ) ) {
			parent::__construct( $source, 'file_local', $options_manager, $format, $exists, $parent_id );
		} else {
			throw new \Exception( esc_html__( 'Source is empty.', 'video-embed-thumbnail-generator' ) );
		}
	}

	public function set_metadata( array $metadata = null ): void {
		if ( $metadata ) {
			$this->metadata = $metadata;
			return;
		}
		if ( ! function_exists( 'wp_read_video_metadata' ) ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
		}
		$this->metadata = wp_read_video_metadata( $this->source );
	}

	protected function set_url(): void {
		$url = str_replace( ABSPATH, site_url( '/' ), $this->source );
		$this->url = str_replace( ' ', '%20', $url );
	}

	protected function set_exists(): void {
		$this->exists = file_exists( $this->source );
	}

	protected function set_direct_path(): void {
		$this->direct_path = $this->source;
	}

	protected function set_local(): void {
		$this->local = true;
	}

	protected function set_child_sources(): void {

		foreach ( $this->video_formats as $format ) {

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
