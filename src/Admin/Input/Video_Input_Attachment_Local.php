<?php

namespace Videopack\Admin\Input;

class Video_Input_Attachment_Local extends Video_Input {

	protected $meta_manager = null;

	public function __construct( int $attachment_id, \Videopack\Admin\Options $options_manager ) {

		if ( $this->validate_source() ) {
			parent::__construct( $attachment_id, 'attachment_local', $options_manager );
			$this->fetch_metadata();
		} else {
			throw new \Exception( 'Invalid attachment ID.' );
		}
	}

	public function validate_source(): bool {

		if ( ! is_numeric( $this->source )
			|| get_post_type( $this->source ) !== 'attachment'
		) {

			$this->handle_error( 'Invalid attachment ID.' );
			return false;
		}

		return true;
	}

	protected function set_url(): void {
		$this->url = wp_get_attachment_url( $this->source );
	}

	public function get_url(): string {
		if ( ! $this->url ) {
			$this->set_url();
		}
		return $this->url;
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
}
