<?php
/**
 * Video source factory class.
 *
 * @package Videopack
 */

namespace Videopack\Video_Source;

/**
 * Class Source_Factory
 *
 * Creates instances of Video Source subclasses based on the provided source data.
 *
 * @since 5.0.0
 * @package Videopack\Video_Source
 */
class Source_Factory {

	/**
	 * Creates a Video Source instance.
	 *
	 * @param string|int|array                       $source      The video source (URL, attachment ID, path, or array).
	 * @param array                                  $options     Videopack options array.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Optional. Videopack video formats registry.
	 * @param string|null                            $format          Optional. Videopack video format ID.
	 * @param bool|null                              $exists          Optional. Whether the source exists.
	 * @param int|null                               $parent_id       Optional. Parent ID (post ID, etc.).
	 * @param string|null                            $source_type     Optional. Explicitly specify the source type.
	 * @return Source|null The video source instance or null if not found.
	 */
	public static function create(
		$source,
		array $options,
		\Videopack\Admin\Formats\Registry $format_registry = null,
		$format = null,
		$exists = null,
		$parent_id = null,
		?string $source_type = null
	) {
		$instance_source = $source;

		if ( ! $format_registry ) {
			$format_registry = new \Videopack\Admin\Formats\Registry( $options );
		}

		if ( ! $source_type ) {
			list( $instance_source, $source_type ) = self::determine_source_type( $source, $options, $format_registry );
		}

		/**
		 * Allow modification of the source type or direct overriding of the instance creation
		 * for custom source types.
		 *
		 * @param Source|null                                $video_source_instance The video source instance.
		 * @param mixed                                      $source                The video source.
		 * @param array                                      $options               The options array.
		 * @param \Videopack\Admin\Formats\Registry|null $format_registry              The video formats registry.
		 * @param string                                     $format                The video format.
		 * @param bool                                       $exists                Whether the source exists.
		 * @param int|null                                   $parent_id             The parent ID.
		 * @param string                                     $source_type           The source type.
		 */
		$video_source_instance = apply_filters( 'videopack_source_class', null, $source, $options, $format_registry, $format, $exists, $parent_id, $source_type );

		if ( null !== $video_source_instance ) {
			return $video_source_instance;
		}

		switch ( $source_type ) {
			case 'attachment_local':
				return new Source_Attachment_Local( $instance_source, $options, $format_registry, $format, $exists, $parent_id );
			case 'file_local':
				return new Source_File_Local( $instance_source, $options, $format_registry, $format, $exists, $parent_id );
			case 'url':
				return new Source_Url( $instance_source, $options, $format_registry, $format, $exists, $parent_id );
			case 'placeholder':
				return new Source_Placeholder_Local( $instance_source, $options, $format_registry, $format, false, $parent_id );
		}

		return null;
	}

	/**
	 * Determines the source type based on the provided source data.
	 *
	 * @param mixed                             $source   The video source.
	 * @param array                             $options  The options array.
	 * @param \Videopack\Admin\Formats\Registry $format_registry The format registry.
	 * @return array {
	 *     @type mixed  $instance_source The internal source representation.
	 *     @type string $source_type     The determined source type.
	 * }
	 */
	protected static function determine_source_type( $source, array $options, \Videopack\Admin\Formats\Registry $format_registry ) {

		if ( is_numeric( $source ) && get_post_type( $source ) === 'attachment' ) {
			return array( $source, 'attachment_local' );
		}

		if ( \Videopack\Common\Validate::filter_validate_url( $source ) ) {
			// First, try to resolve it to an attachment ID. This is the most specific case.
			$attachment_manager = new \Videopack\Admin\Attachment( $options, $format_registry, new \Videopack\Admin\Attachment_Meta( $options ) );
			$attachment_id      = $attachment_manager->url_to_id( $source );
			if ( $attachment_id ) {
				return array(
					array(
						'id'  => $attachment_id,
						'url' => $source,
					),
					'attachment_local',
				);
			}

			// Next, check if it's a URL pointing to a local file by comparing hosts.
			// This is more reliable than file_exists() because the file might not exist yet
			// (e.g., when checking for alternative formats).
			$site_url_parts = wp_parse_url( site_url() );
			$url_parts      = wp_parse_url( $source );

			if ( isset( $url_parts['host'] ) && $url_parts['host'] === $site_url_parts['host'] ) {
				// It's a local URL. Convert to a server path.
				$path = str_replace( site_url( '/' ), trailingslashit( ABSPATH ), $source );
				return array( urldecode( $path ), 'file_local' );
			}

			// If all else fails for a URL, it's a remote URL.
			return array( $source, 'url' );
		}

		if ( file_exists( $source ) ) {
			return array( $source, 'file_local' );
		}

		return array( $source, 'placeholder' );
	}
}
