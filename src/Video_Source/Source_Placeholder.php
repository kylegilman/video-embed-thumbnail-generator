<?php
/**
 * Local placeholder video source subclass.
 *
 * @package Videopack
 */

namespace Videopack\Video_Source;

/**
 * Class Source_Placeholder
 *
 * Handles video sources that don't exist yet but have a reserved location (placeholders).
 *
 * @since 5.0.0
 * @package Videopack\Video_Source
 */
class Source_Placeholder extends Source {

	/**
	 * Constructor.
	 *
	 * @param string                                 $source    The placeholder file path.
	 * @param array                                  $options         Videopack options array.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Optional. Videopack video formats registry.
	 * @param string|null                            $format          Optional. Videopack video format ID.
	 * @param bool                                   $exists          Optional. Whether the source exists. Defaults to false.
	 * @param int|null                               $parent_id       Optional. Parent ID (post ID, etc.).
	 *
	 * @throws \Exception If the source path is empty.
	 */
	public function __construct(
		string $source,
		array $options,
		\Videopack\Admin\Formats\Registry $format_registry = null,
		$format = null,
		$exists = false,
		$parent_id = null
	) {

		if ( $this->validate_source( $source ) ) {
			parent::__construct( $source, 'placeholder', $options, $format_registry, $format, $exists, $parent_id );
		} else {
			throw new \Exception( esc_html__( 'Source is empty.', 'video-embed-thumbnail-generator' ) );
		}
	}

	/**
	 * Sets the video metadata.
	 *
	 * @param array|null $metadata Optional. The metadata array.
	 */
	public function set_metadata( array $metadata = null ): void {
		$this->metadata = array(
			'height' => $this->get_resolution(),
			'fourcc' => $this->get_codec() ? $this->get_codec()->get_codecs_att() : '',
		);
	}

	/**
	 * Sets the video URL.
	 */
	protected function set_url(): void {
		$this->url = str_replace( ABSPATH, site_url( '/' ), $this->source );
	}

	/**
	 * Sets whether the video source exists.
	 */
	protected function set_exists(): void {
		$this->exists = false;
	}

	/**
	 * Sets the direct path to the video.
	 */
	protected function set_direct_path(): void {
		$this->direct_path = $this->source;
	}

	/**
	 * Sets whether the video source is local.
	 */
	protected function set_local(): void {
		$this->local = true;
	}

	/**
	 * Placeholder sources cannot have children.
	 */
	protected function set_child_sources(): void {}
}
