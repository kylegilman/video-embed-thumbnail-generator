<?php
/**
 * Encode Queue Log class file.
 *
 * @package Videopack
 * @subpackage Admin/Encode
 */

namespace Videopack\Admin\Encode;

/**
 * Class Encode_Queue_Log
 *
 * Handles the accumulation of log messages during the encoding queue process.
 */
class Encode_Queue_Log {

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $format_registry
	 */
	protected $format_registry;

	/**
	 * Internal log storage.
	 *
	 * @var array $log
	 */
	private $log;

	/**
	 * Constructor.
	 *
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 */
	public function __construct( \Videopack\Admin\Formats\Registry $format_registry ) {
		$this->format_registry = $format_registry;
		$this->log             = array();
	}

	/**
	 * Add a message to the log based on a specific action and format.
	 *
	 * @param string      $action    The action result (e.g., 'success', 'already_queued').
	 * @param string|bool $format_id The ID of the video format, or false if not applicable.
	 */
	public function add_to_log( $action, $format_id = false ) {

		if ( $format_id ) {
			$video_formats_objects = $this->format_registry->get_video_formats();
			// Ensure $video_formats_objects is an array and the key exists.
			$name = ( is_array( $video_formats_objects ) && isset( $video_formats_objects[ $format_id ] ) )
					? $video_formats_objects[ $format_id ]->get_name()
					: $format_id;
		} else {
			$name = '';
		}

		switch ( $action ) {
			case 'success': // Keep 'success' as an alias for 'queued' for robustness.
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

	/**
	 * Get the full log of messages.
	 *
	 * @return array
	 */
	public function get_log() {
		return $this->log;
	}
}
