<?php

namespace Videopack\Admin\Input;

class Video_Input_Factory {

	public static function create( $input, $options_manager ) {

		list( $input, $input_type ) = self::determine_input_type( $input, $options_manager );

		// Allow modification of the input type or direct overriding of the instance creation
		$video_input_instance = apply_filters( 'videopack_input_class', null, $input, $input_type );

		if ( null !== $video_input_instance ) {
			return $video_input_instance;
		}

		switch ( $input_type ) {
			case 'attachment_local':
				return new Video_Input_Attachment_Local( $input, $options_manager );
			case 'external_url':
				return new Video_Input_Url( $input, $options_manager );
		}

		return null;
	}

	protected static function determine_input_type( $input, $options_manager ) {

		if ( is_numeric( $input ) && get_post_type( $input ) === 'attachment' ) {

			return array( $input, 'attachment_local' );
		} elseif ( \Videopack\Common\Validate::filter_validate_url( $input ) ) {

			$attachment_id = ( new \Videopack\Admin\Attachment( $options_manager ) )->url_to_id( $input );

			if ( $attachment_id ) {

				return array( $attachment_id, 'attachment_local' );
			}

			return array( $input, 'external_url' );
		}

		return array( $input, 'unknown' );
	}
}
