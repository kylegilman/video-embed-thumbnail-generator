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
		} elseif ( file_exists( $source ) ) {
			return array( $source, 'file_local' );
		} elseif ( \Videopack\Common\Validate::filter_validate_url( $source ) ) {
			$attachment_id = ( new \Videopack\Admin\Attachment( $options_manager ) )->url_to_id( $source );
			if ( $attachment_id ) {
				return array( $attachment_id, 'attachment_local' );
			}
			return array( $source, 'url' );
		}
		return array( $source, 'placeholder' );
	}
}
