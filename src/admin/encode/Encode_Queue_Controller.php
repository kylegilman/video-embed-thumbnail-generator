<?php

namespace Videopack\admin\encode;

use ActionScheduler;

class Encode_Queue_Controller {

	protected $queue;
	protected $encoding_now;
	protected $queue_log;
	protected $options;

	public function __construct() {
		$this->queue_log = new Encode_Queue_Log();
		$this->options   = kgvid_get_options();
		$this->set_queue();
		$this->set_encoding_now();
		$this->check_encoding();
	}

	public function start_queue() {
		$this->options['queue_control'] = 'play';
		update_option( 'kgvid_video_embed_options', $this->options );
		$this->start_next_job();
	}

	public function pause_queue() {
		$this->options['queue_control'] = 'pause';
		update_option( 'kgvid_video_embed_options', $this->options );
	}

	/**
	 * Schedule the encoding job.
	 *
	 * @param array $formats The formats to encode.
	 */
	public function schedule_job( array $args ) {

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

	protected function store_action_id( int $action_id ) {
		// Get the existing scheduled action IDs from the wp_options table
		$queued_action_ids = get_option( 'videopack_encode_queue', array() );

		// Add the new action ID to the array
		$queued_action_ids[] = $action_id;

		// Update the wp_options entry with the new array of action IDs
		update_option( 'videopack_encode_queue', $queued_action_ids );
	}

	protected function required_keys( array $args, array $required ) {
		if ( is_array( $args ) ) {
			foreach ( $required as $key ) {
				if ( ! array_key_exists( $key, $args ) ) {
					return false;
				}
			}
		}
		return true;
	}

	protected function store_queued_post_id( int $id, string $url ) {
		if ( ! in_array( $id, $this->queue ) ) {
			$this->queue[] = array(
				'id'  => $id,
				'url' => $url,
			);
			$this->save_queue();
		}
	}

	public function check_encoding() {
		$formats  = array();
		$encoding = $this->get_encoding_now();
		if ( ! empty( $encoding ) ) {
			foreach ( $encoding as $key => $args ) {
				$encoder         = new Encode_Attachment( $args['id'], $args['url'] );
				$formats[ $key ] = $encoder->get_formats_by_status( 'encoding' );
				if ( empty( $formats[ $key ] ) ) {
					unset( $this->encoding_now[ $key ] );
					$this->save_encoding_now();
				}
			}
			if ( count( $this->encoding_now ) < $this->options['simultaneous_encodes']
				&& $this->options['queue_control'] === 'play'
			) {
				$this->start_next_job();
			}
		}
		return $formats;
	}

	public function add_to_queue( array $args ) {
		$encoder = new Encode_Attachment( $args['id'], $args['url'] );
		foreach ( $args['formats'] as $format ) {
			$action = $encoder->try_to_queue( $format );
			if ( $action === 'queued' ) {
				$this->store_queued_post_id( $args['id'], $args['url'] );
			}
			$this->queue_log->add_to_log( $action, $format );
		}
		return $this->queue_log->get_log();
	}

	protected function start_next_job() {
		$queue = $this->get_queue();
		if ( ! empty( $queue ) ) {
			foreach ( $queue as $key => $args ) {
				$encoder = new Encode_Attachment( $args['id'], $args['url'] );
				$next    = $encoder->start_next_format();
				if ( ! $next ) {
					unset( $this->queue[ $key ] );
					$this->save_queue();
				}
			}
		}
	}

	protected function get_action_args_by_id( int $action_id ) {
		$action_args = array();

		// Get the scheduled action by ID
		$actions = ActionScheduler::store()->fetch_action( $action_id );

		if ( $actions ) {
			// Get the action arguments
			$action_args = $actions->get_args();
		}

		return $action_args;
	}

	public function get_encoding_now() {
		$this->set_encoding_now();
		return $this->encoding_now;
	}

	public function get_queue() {
		$this->set_queue();
		return $this->queue;
	}

	protected function set_queue() {
		$this->queue = get_option( 'videopack_encode_queue', array() );
	}

	protected function set_encoding_now() {
		$this->encoding_now = get_option( 'videopack_encoding_now', array() );
	}

	protected function save_queue() {
		return update_option( 'videopack_encode_queue', $this->queue );
	}

	protected function save_encoding_now() {
		return update_option( 'videopack_encoding_now', $this->encoding_now );
	}

}
