<?php

namespace Videopack\admin\encode;

class Encode_Queue_Log {
	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

	private $log;
	private $user;

	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->log             = array();
		$this->user            = wp_get_current_user();
	}

	public function add_to_log( $action, $format_id = false ) {

		if ( $format_id ) {
			$video_formats_objects = $this->options_manager->get_video_formats();
			// Ensure $video_formats_objects is an array and the key exists
			$name = ( is_array( $video_formats_objects ) && isset( $video_formats_objects[ $format_id ] ) )
					? $video_formats_objects[ $format_id ]->get_name()
					: $format_id;
		} else {
			$name = '';
		}

		switch ( $action ) {
			case 'queued':
				$log_message = $name . ' ' . __( 'added to queue', 'video-embed-thumbnail-generator' );
				break;
			case 'already_queued':
				$log_message = $name . ' ' . __( 'already queued', 'video-embed-thumbnail-generator' );
				break;
			case 'already_exists':
				$log_message = $name . ' ' . __( 'already exists', 'video-embed-thumbnail-generator' );
				break;
			case 'permission':
				/* translators: %s is user login */
				$log_message = sprintf( __( 'User %s does not have permission to encode videos', 'video-embed-thumbnail-generator' ), $this->user->user_login );
				break;
			default:
				$log_message = __( 'unexpected error', 'video-embed-thumbnail-generator' );
		}
		$this->log[] = $log_message;
	}

	public function get_log() {
		return $this->log;
	}
}
