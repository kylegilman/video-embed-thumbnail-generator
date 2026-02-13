<?php

namespace Videopack\Video_Source;

class Source_Factory {

	public static function create(
		$source,
		\Videopack\Admin\Options $options_manager,
		$format = null,
		$exists = null,
		$parent_id = null,
		string $source_type = null
	) {

		$instance_source = $source;

		if ( ! $source_type ) {
			list( $instance_source, $source_type ) = self::determine_source_type( $source, $options_manager );
		}

		/**
		 * Allow modification of the source type or direct overriding of the instance creation
		 * for custom source types.
		 * @param Source|null $video_source_instance
		 * @param mixed       $source                 attachment ID, file path, URL, etc.
		 * @param Options     $options_manager
		 * @param string      $format
		 * @param bool        $exists
		 * @param int|null    $parent_id
		 * @param string      $source_type            as determined by the factory
		 */
		$video_source_instance = apply_filters( 'videopack_source_class', null, $source, $options_manager, $format, $exists, $parent_id, $source_type );

		if ( null !== $video_source_instance ) {
			return $video_source_instance;
		}

		switch ( $source_type ) {
			case 'attachment_local':
				return new Source_Attachment_Local( $instance_source, $options_manager, $format, $exists, $parent_id );
			case 'file_local':
				return new Source_File_Local( $instance_source, $options_manager, $format, $exists, $parent_id );
			case 'url':
				return new Source_Url( $instance_source, $options_manager, $format, $exists, $parent_id );
			case 'placeholder':
				return new Source_Placeholder_Local( $instance_source, $options_manager, $format, false, $parent_id );
		}

		return null;
	}

	protected static function determine_source_type( $source, \Videopack\Admin\Options $options_manager ) {

		if ( is_numeric( $source ) && get_post_type( $source ) === 'attachment' ) {
			return array( $source, 'attachment_local' );
		}

		if ( \Videopack\Common\Validate::filter_validate_url( $source ) ) {
			// First, try to resolve it to an attachment ID. This is the most specific case.
			$attachment_id = ( new \Videopack\Admin\Attachment( $options_manager ) )->url_to_id( $source );
			if ( $attachment_id ) {
				return array( $attachment_id, 'attachment_local' );
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
