<?php
/**
 * Local file video source subclass.
 *
 * @package Videopack
 */

namespace Videopack\Video_Source;

/**
 * Class Source_File
 *
 * Handles video sources that are local files on the server but not necessarily WordPress attachments.
 *
 * @since 5.0.0
 * @package Videopack\Video_Source
 */
class Source_File extends Source {

	/**
	 * Constructor.
	 *
	 * @param string                                 $source    The local file path.
	 * @param array                                  $options         Videopack options array.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Optional. Videopack video formats registry.
	 * @param string|null                            $format          Optional. Videopack video format ID.
	 * @param bool|null                              $exists          Optional. Whether the source exists.
	 * @param int|null                               $parent_id       Optional. Parent ID (post ID, etc.).
	 *
	 * @throws \Exception If the source path is empty.
	 */
	public function __construct(
		string $source,
		array $options,
		\Videopack\Admin\Formats\Registry $format_registry = null,
		$format = null,
		$exists = null,
		$parent_id = null
	) {

		if ( $this->validate_source( $source ) ) {
			parent::__construct( $source, 'file', $options, $format_registry, $format, $exists, $parent_id );
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
		if ( $metadata ) {
			$this->metadata = $metadata;
			return;
		}
		if ( ! function_exists( 'wp_read_video_metadata' ) ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
		}
		$this->metadata = wp_read_video_metadata( $this->source );
	}

	/**
	 * Sets the video URL.
	 */
	protected function set_url(): void {
		$url       = str_replace( ABSPATH, site_url( '/' ), $this->source );
		$this->url = str_replace( ' ', '%20', $url );
	}

	/**
	 * Sets whether the video source exists.
	 */
	protected function set_exists(): void {
		$this->exists = file_exists( $this->source );
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
	 * Sets the child sources.
	 */
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
