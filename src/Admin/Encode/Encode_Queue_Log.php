<?php

namespace Videopack\admin\encode;

class Encode_Queue_Log {
	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

	private $log;

	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->log             = array();
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
			case 'success': // Keep 'success' as an alias for 'queued' for robustness
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
				$log_message = __( 'User does not have permission to encode videos', 'video-embed-thumbnail-generator' );
				break;
			case 'lowres':
				$log_message = $name . ' ' . __( 'is lower resolution than the target and was skipped', 'video-embed-thumbnail-generator' );
				break;
			case 'vcodec_unavailable':
				$log_message = $name . ' ' . __( 'requires a video codec that is not available', 'video-embed-thumbnail-generator' );
				break;
			case 'acodec_unavailable':
				$log_message = $name . ' ' . __( 'requires an audio codec that is not available', 'video-embed-thumbnail-generator' );
				break;
			case 'error_invalid_format_key':
				$log_message = $name . ' ' . __( 'is not a valid format', 'video-embed-thumbnail-generator' );
				break;
			case 'error_db_insert':
				$log_message = $name . ' ' . __( 'could not be added to the database', 'video-embed-thumbnail-generator' );
				break;
			case 'error_scheduling':
				$log_message = $name . ' ' . __( 'could not be scheduled', 'video-embed-thumbnail-generator' );
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
