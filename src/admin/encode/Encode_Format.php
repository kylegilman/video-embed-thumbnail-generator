<?php

namespace Videopack\admin\encode;

class Encode_Format {

	private $format;
	private $status;
	private $path;
	private $url;
	private $user_id;
	private $logfile;
	private $pid;
	private $started;
	private $encode_array;
	private $error;
	private $ended;
	private $progress;

	public function __construct( $format ) {
		$this->format = $format;
	}

	// Helper methods for converting to/from arrays
	public function to_array() {
		return get_object_vars( $this );
	}

	public static function from_array( array $data ) {

		$format = new self( $data['format'] );

		$format->set_status( $format->set_or_null( $data, 'status' ) );
		$format->set_user_id( $format->set_or_null( $data, 'user_id' ) );
		$format->set_url( $format->set_or_null( $data, 'url' ) );
		$format->set_path( $format->set_or_null( $data, 'path' ) );
		$format->set_logfile( $format->set_or_null( $data, 'logfile' ) );
		$format->set_pid( $format->set_or_null( $data, 'pid' ) );
		$format->set_started( $format->set_or_null( $data, 'started' ) );
		$format->set_encode_array( $format->set_or_null( $data, 'encode_array' ) );
		$format->set_error( $format->set_or_null( $data, 'error' ) );
		$format->set_ended( $format->set_or_null( $data, 'ended' ) );
		$format->set_progress();

		return $format;
	}

	protected function set_or_null( array $data, string $key ) {
		if ( isset( $data[ $key ] ) ) {
			return $data[ $key ];
		}
		return null;
	}

	// Getters

	public function get_progress() {
		if ( $this->status === 'encoding' ) {
			if ( $this->logfile
				&& file_exists( $this->logfile )
			) {
				$this->set_progress();
				return $this->progress;
			} else {
				return 'recheck';
			}
		}
	}

	public function get_format() {
		return $this->format;
	}

	public function get_status() {
		$this->set_progress();
		return $this->status;
	}

	public function get_path() {
		return $this->path;
	}

	public function get_url() {
		return $this->url;
	}

	public function get_user_id() {
		return $this->user_id;
	}

	public function get_logfile() {
		return $this->logfile;
	}

	public function get_pid() {
		return $this->pid;
	}

	public function get_started() {
		return $this->started;
	}

	public function get_encode_array() {
		return $this->encode_array;
	}

	public function get_error() {
		return $this->error;
	}

	public function get_ended() {
		return $this->ended;
	}

	// Setters
	public function set_status( string $status ) {
		$allowed = array(
			'queued',
			'encoding',
			'complete',
			'canceled',
			'deleted',
			'error',
		);
		if ( in_array( $status, $allowed ) ) {
			$this->status = $status;
		}
	}

	public function set_user_id( int $user_id ) {
		$this->user_id = $user_id;
	}

	public function set_path( string $path ) {
		$this->path = $path;
	}

	public function set_url( string $url ) {
		$this->url = $url;
	}

	public function set_logfile( string $logfile ) {
		$this->logfile = $logfile;
	}

	public function set_pid( int $pid ) {
		$this->pid = $pid;
	}

	public function set_started( int $started ) {
		$this->started = $started;
	}

	public function set_encode_array( array $encode_array ) {
		$this->encode_array = $encode_array;
	}

	public function set_error( string $error ) {
		$this->set_status( 'error' );
		$this->error = $error;
	}

	public function set_ended( int $ended ) {
		$this->ended = $ended;
	}

	public function set_queued( string $path, string $url, int $user_id ) {
		$this->set_status( 'queued' );
		$this->set_path( $path );
		$this->set_url( $url );
		$this->set_user_id( $user_id );
	}

	public function set_encode_start( int $pid, int $started ) {
		$this->set_status( 'encoding' );
		$this->set_pid( $pid );
		$this->set_started( $started );
	}

	protected function set_progress() {
		if ( $this->status === 'encoding'
			&& $this->logfile
			&& file_exists( $this->logfile )
		) {
			$lines       = array_slice( file( $this->logfile ), -25 );
			$parsed_data = array();

			foreach ( $lines as $line ) {
				if ( trim( $line ) === '' ) {
					continue;
				}

				list( $key, $value ) = explode( '=', trim( $line ), 2 );
				$parsed_data[ $key ] = $value;
			}

			$this->progress = array(
				'frame'       => $this->set_or_null( $parsed_data, 'frame' ),
				'fps'         => $this->set_or_null( $parsed_data, 'fps' ),
				'stream'      => $this->set_or_null( $parsed_data, 'stream' ),
				'bitrate'     => $this->set_or_null( $parsed_data, 'bitrate' ),
				'total_size'  => $this->set_or_null( $parsed_data, 'total_size' ),
				'out_time_us' => $this->set_or_null( $parsed_data, 'out_time_us' ),
				'out_time_ms' => $this->set_or_null( $parsed_data, 'out_time_ms' ),
				'out_time'    => $this->set_or_null( $parsed_data, 'out_time' ),
				'dup_frames'  => $this->set_or_null( $parsed_data, 'dup_frames' ),
				'drop_frames' => $this->set_or_null( $parsed_data, 'drop_frames' ),
				'speed'       => $this->set_or_null( $parsed_data, 'speed' ),
				'progress'    => $this->set_or_null( $parsed_data, 'progress' ),
			);

			if ( $this->progress['progress'] === 'end' ) {
				$this->set_encode_complete();
			} elseif ( time() - filemtime( $this->logfile ) > 60 ) {
				//it's been more than a minute since encoding progress was recorded
				$this->set_error( __( 'Encoding stopped unexpectedly', 'video-embed-thumbnail-generator' ) );
			}
		}
	}

	public function set_encode_complete() {
		$this->set_status( 'complete' );
		$this->set_ended( filemtime( $this->logfile ) );
	}

	public function set_canceled() {
		$this->set_status( 'canceled' );
		if ( current_user_can( 'encode_videos' ) ) {
			wp_delete_file( $this->get_path() );
		}
	}
}
