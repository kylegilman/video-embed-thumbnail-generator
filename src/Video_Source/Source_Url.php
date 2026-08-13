<?php
/**
 * Remote URL video source subclass.
 *
 * @package Videopack
 */

namespace Videopack\Video_Source;

/**
 * Class Source_Url
 *
 * Handles video sources that are remote URLs.
 *
 * @since 5.0.0
 * @package Videopack\Video_Source
 */
class Source_Url extends Source {

	/**
	 * Constructor.
	 *
	 * @param string                                 $source    The remote video URL.
	 * @param array                                  $options         Videopack options array.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Optional. Videopack video formats registry.
	 * @param string|null                            $format          Optional. Videopack video format ID.
	 * @param bool|null                              $exists          Optional. Whether the source exists.
	 * @param int|null                               $parent_id       Optional. Parent ID (post ID, etc.).
	 *
	 * @throws \Exception If the source URL is empty.
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
			parent::__construct( $source, 'url', $options, $format_registry, $format, $exists, $parent_id );
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
		}
	}

	/**
	 * Sets the video URL.
	 */
	protected function set_url(): void {
		$this->url = $this->source;
	}

	/**
	 * Sets whether the video source exists.
	 */
	protected function set_exists(): void {
		$this->exists = $this->url_exists( $this->source );
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
		$this->local = false;
	}

	/**
	 * Sets the child sources.
	 *
	 * A Source_Url is, by construction, always a genuinely different host
	 * from this WordPress install (Source_Factory::determine_source_type()
	 * converts any same-host URL to a real local path -- Source_File --
	 * before a Source_Url is ever created), so "same directory as this
	 * source" only makes sense as a check against that *remote* host
	 * (find_format_in_same_url_directory()). A separate, distinct scenario
	 * -- an encoded alternate format for a URL-sourced job, which
	 * Encode_Attachment writes to the local WP uploads directory since
	 * there's no local original to sit next to (see Encode_Info's
	 * set_default_url_and_path() fallback for a source with no attachment
	 * ID) -- is checked explicitly via find_format_in_uploads_directory(),
	 * not the generic same-directory check the other Source subclasses use.
	 */
	protected function set_child_sources(): void {

		foreach ( $this->video_formats as $format ) {

			if ( $this->options['find_formats'] ) {
				if ( $this->find_format_in_uploads_directory( $format ) ) {
					continue;
				}
				$same_url_directory = $this->find_format_in_same_url_directory( $format, $this->get_parent_id() );
				if ( $same_url_directory ) {
					continue;
				}
			}

			$this->create_source_placeholder( $format );
		}
	}
}
