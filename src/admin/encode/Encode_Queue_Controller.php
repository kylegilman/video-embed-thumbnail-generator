<?php

namespace Videopack\admin\encode;

use ActionScheduler;

class Encode_Queue_Controller {

	private $queue;
	private $encoding_now;
	private $queue_log;

	public function __construct() {
		$this->queue_log = new Encode_Queue_Log();
		$this->load_queue();
	}

	protected function load_queue() {
		$this->queue        = get_option( 'videopack_encode_queue', array() );
		$this->encoding_now = get_option( 'videopack_encoding_now', array() );
	}

	protected function save_queue() {
		return update_option( 'videopack_encode_queue', $this->queue );
	}

		/**
	 * Schedule the encoding job.
	 *
	 * @param array $formats The formats to encode.
	 */
	public function schedule_job( $args ) {

		$required = array(
			'id',
			'url',
			'formats',
		);

		if ( $this->required_keys( $args, $required ) ) {

			$args      = kgvid_sanitize_text_field( $args );
			$action_id = as_enqueue_async_action(
				array( __CLASS__, 'add_to_queue' ),
				$args,
				'videopack',
			);

		}

		// Store the scheduled action's ID in your custom option
		//$this->store_action_id( $action_id );
	}

	protected function store_action_id( $action_id ) {
		// Get the existing scheduled action IDs from the wp_options table
		$queued_action_ids = get_option( 'videopack_encode_queue', array() );

		// Add the new action ID to the array
		$queued_action_ids[] = $action_id;

		// Update the wp_options entry with the new array of action IDs
		update_option( 'videopack_encode_queue', $queued_action_ids );
	}

	protected function required_keys( $args, $required ) {
		if ( is_array( $args ) ) {
			foreach ( $required as $key ) {
				if ( ! array_key_exists( $key, $args ) ) {
					return false;
				}
			}
		}
		return true;
	}

	protected function store_queued_post_id( $id, $url ) {
		if ( ! in_array( $id, $this->queue ) ) {
			$this->queue[] = array(
				'id'  => $id,
				'url' => $url,
			);
			$this->save_queue();
		}
	}

	public function check_queue() {
		if ( ! empty( $this->encoding_now ) ) {
			foreach ( $this->encoding_now as $key => $args ) {
				$encoder = new Encode_Attachment( $args['id'], $args['url'] );
				if ( $encoder->get_encoding_formats() ) {

				}
			}
		}
	}

	public function add_to_queue( $args ) {
		if ( current_user_can( 'encode_videos' ) ) {
			$encoder = new Encode_Attachment( $args['id'], $args['url'] );
			foreach ( $args['formats'] as $format ) {
				$action = $encoder->try_to_queue( $format );
				if ( $action === 'queued' ) {
					$this->store_queued_post_id( $args['id'], $args['url'] );
				}
				$this->queue_log->add_to_log( $action, $format );
			}
		} else {
			$this->queue_log->add_to_log( 'permission' );
		}
		return $this->queue_log->get_log();
	}

	public function start_next_job() {

	}

	protected function get_action_args_by_id( $action_id ) {
		$action_args = array();

		// Get the scheduled action by ID
		$actions = ActionScheduler::store()->fetch_action( $action_id );

		if ( $actions ) {
			// Get the action arguments
			$action_args = $actions->get_args();
		}

		return $action_args;
	}

	public static function from_action_id( $action_id ) {
		$args = self::get_action_args_by_id( $action_id );
		if ( $args ) {
			$id  = $args['id'];
			$url = $args['url'];
			return new static( $id, $url );
		}
		return false;
	}

}
