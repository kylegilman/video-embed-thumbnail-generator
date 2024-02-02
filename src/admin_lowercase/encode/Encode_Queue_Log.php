<?php

namespace Videopack\admin\encode;

class Encode_Queue_Log {

	private $log;
	private $video_formats;
	private $user;

	public function __construct() {
		$this->log           = array();
		$this->video_formats = kgvid_video_formats();
		$this->user          = wp_get_current_user();
	}

	public function add_to_log( $action, $format = false ) {

		if ( $format ) {
			$name = $this->video_formats[ $format ]['name'];
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
