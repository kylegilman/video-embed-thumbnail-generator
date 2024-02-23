<?php

namespace Videopack\Video_Source;

class Source_Placeholder_Local extends Source {

	public function __construct(
		string $source,
		\Videopack\Admin\Options $options_manager,
		$format = null,
		$exists = false,
		$parent_id = null
	) {

		if ( $this->validate_source( $source ) ) {
			parent::__construct( $source, 'placeholder_local', $options_manager, $format, $exists, $parent_id );
		} else {
			throw new \Exception( esc_html__( 'Source is empty.', 'video-embed-thumbnail-generator' ) );
		}
	}

	public function set_metadata( array $metadata = null ): void {
		$this->metadata = array(
			'height' => $this->get_resolution()->get_height(),
			'fourcc' => $this->get_codec()->get_codecs_att(),
		);
	}


	protected function set_url(): void {
		$this->url = str_replace( ABSPATH, site_url( '/' ), $this->source );
	}

	protected function set_exists(): void {
		$this->exists = false;
	}

	protected function set_direct_path(): void {
		$this->direct_path = $this->source;
	}

	protected function set_local(): void {
		$this->local = true;
	}

	/**
	 * Placeholder sources cannot have children.
	 */
	protected function set_child_sources(): void {}
}
