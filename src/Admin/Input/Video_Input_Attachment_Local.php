<?php

namespace Videopack\Admin\Input;

class Video_Input_Attachment_Local extends Video_Input {

	protected $meta_manager = null;

	public function __construct(
		int $attachment_id,
		\Videopack\Admin\Options $options_manager,
		$format = null,
		$exists = false
	) {

		if ( $this->validate_source( $attachment_id ) ) {
			parent::__construct( $attachment_id, 'attachment_local', $options_manager, $format, $exists );
			$this->fetch_metadata();
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

	protected function set_url(): void {
		$this->url = wp_get_attachment_url( $this->source );
	}

	protected function set_exists(): void {
		$this->exists = file_exists( get_attached_file( $this->source ) );
	}

	protected function set_direct_path(): void {
		$this->direct_path = get_attached_file( $this->source );
	}

	protected function set_same_server(): void {
		$this->same_server = true;
	}

	protected function set_title(): void {
		$this->title = get_the_title( $this->source );
	}

	protected function set_mime_type(): void {
		$this->mime_type = get_post_mime_type( $this->source );
	}

	protected function set_codec(): void {

		$codecs = $this->options_manager->get_video_codecs();

		if ( isset( $this->metadata['fourcc'] ) ) {
			foreach ( $codecs as $codec ) {
				if ( $codec->get_fourcc() === $this->metadata['fourcc'] ) {
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

	public function fetch_metadata(): void {
		if ( ! $this->meta_manager ) {
			$this->meta_manager = new \Videopack\Admin\Attachment_Meta( $this->options_manager );
		}
		$this->metadata = $this->meta_manager->get( $this->source );
	}

	protected function set_dimensions(): void {

		if ( $this->metadata['width'] ) {
			$this->width = $this->metadata['width'];
		}

		if ( $this->metadata['height'] ) {
			$this->height = $this->metadata['height'];
		}
	}

	protected function set_duration(): void {
		$this->duration = $this->metadata['duration'];
	}

	protected function set_child_sources(): void {

		$children = $this->find_attachment_children();

		foreach ( $this->video_formats as $format => $format_object ) {
			if ( $children ) {
				foreach ( $children as $child ) {
					$meta_format = get_post_meta( $child->ID, '_kgflashmediaplayer-format', true );
					if ( $meta_format === $format ) {
						$this->child_sources[ $format ] = new Video_Input_Attachment_Local(
							$child->ID,
							$this->options_manager,
							$format,
							true
						);
						break;
					}
				}
			}
			$same_directory = $this->is_format_in_same_directory( $format_object->get_suffix() );
			if ( $same_directory ) {
				$this->child_sources[ $format ] = new Video_Input_Attachment_Local(
					$this->source,
					$this->options_manager,
					$format,
					true
				);
			}
		}
	}
}
