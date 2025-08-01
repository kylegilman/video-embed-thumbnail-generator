<?php

namespace Videopack\Admin\Encode;

class Encode_Format {

	private $format_id;
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
	private $encode_width;
	private $encode_height;
	private $id;
	private $job_id; // ID from the wp_videopack_encoding_queue table
	private $temp_watermark_path;
	private $video_duration; // Total duration of the video in microseconds

	public function __construct( string $format_id ) {
		$this->format_id = $format_id;
	}

	// Helper methods for converting to/from arrays
	public function to_array() {
		$vars = get_object_vars( $this );
		return $vars;
	}

	public static function from_array( array $data ) {

		$format = new self( $data['format_id'] ); // Use 'format_id' from DB

		$format->set_status( $format->set_or_null( $data, 'status' ) );
		$format->set_user_id( $format->set_or_null( $data, 'user_id' ) );
		$format->set_url( $format->set_or_null( $data, 'output_url' ) );
		$format->set_path( $format->set_or_null( $data, 'output_path' ) );
		$format->set_logfile( $format->set_or_null( $data, 'logfile_path' ) );
		$format->set_pid( $format->set_or_null( $data, 'pid' ) );

		$started_at = $format->set_or_null( $data, 'started_at' );
		if ( $started_at ) {
			$format->set_started( strtotime( $started_at ) );
		}

		$format->set_encode_array( $format->set_or_null( $data, 'encode_array' ) );

		$error_message = $format->set_or_null( $data, 'error_message' );
		if ( ! empty( $error_message ) ) {
			$format->set_error( $error_message );
		}

		$completed_at = $format->set_or_null( $data, 'completed_at' );
		if ( $completed_at ) {
			$format->set_ended( strtotime( $completed_at ) );
		}

		$format->set_progress();
		$format->set_encode_width( $format->set_or_null( $data, 'encode_width' ) );
		$format->set_encode_height( $format->set_or_null( $data, 'encode_height' ) );
		$format->set_job_id( $format->set_or_null( $data, 'id' ) ); // Use 'id' from DB as job_id
		$format->set_id( $format->set_or_null( $data, 'output_attachment_id' ) );
		$format->set_temp_watermark_path( $format->set_or_null( $data, 'temp_watermark_path' ) );

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
		if ( $this->status === 'encoding'
			&& $this->logfile
			&& file_exists( $this->logfile )
		) {
			$this->set_progress();
			return $this->progress;
		} else {
			return 'recheck';
		}
	}

	public function get_format_id() {
		return $this->format_id;
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

	public function get_id() {
		return $this->id;
	}

	public function get_encode_width() {
		return $this->encode_width;
	}

	public function get_encode_height() {
		return $this->encode_height;
	}

	public function get_job_id() {
		return $this->job_id;
	}

	public function get_temp_watermark_path() {
		return $this->temp_watermark_path;
	}

	public function set_status( ?string $status ) {
		$allowed = array(
			'queued',
			'encoding',
			'needs_insert',
			'completed',
			'canceled',
			'deleted',
			'pending_replacement',
			'error',
		);
		if ( in_array( $status, $allowed ) ) {
			$this->status = $status;
		}
	}

	public function set_user_id( ?int $user_id ) {
		$this->user_id = $user_id;
	}

	public function set_path( ?string $path ) {
		$this->path = $path;
	}

	public function set_url( ?string $url ) {
		$this->url = $url;
	}

	public function set_logfile( ?string $logfile ) {
		$this->logfile = $logfile;
	}

	public function set_pid( ?int $pid ) {
		$this->pid = $pid;
	}

	public function set_started( ?int $started ) {
		$this->started = $started;
	}

	public function set_encode_array( ?array $encode_array ) {
		$this->encode_array = $encode_array;
	}

	public function set_error( ?string $error ) {
		$this->set_status( 'error' );
		$this->error = $error;
	}

	public function set_ended( ?int $ended ) {
		$this->ended = $ended;
	}

	public function set_id( ?int $id ) {
		$this->id = $id;
	}

	public function set_encode_width( ?int $width ) {
		$this->encode_width = $width;
	}

	public function set_encode_height( ?int $height ) {
		$this->encode_height = $height;
	}

	public function set_job_id( ?int $job_id ) {
		$this->job_id = $job_id;
	}

	public function set_temp_watermark_path( ?string $path ) {
		$this->temp_watermark_path = $path;
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
				'percent'     => 0, // Initialize percent
			);

			if ( ! empty( $this->video_duration ) && isset( $this->progress['out_time_us'] ) ) {
				$out_time_us               = (int) $this->progress['out_time_us'];
				$this->progress['percent'] = min( 100, round( ( $out_time_us / $this->video_duration ) * 100, 2 ) );
			}

			if ( isset( $this->progress['progress'] ) && 'end' === $this->progress['progress'] ) {
				$this->set_needs_insert();
			} elseif ( time() - filemtime( $this->logfile ) > 60 ) {
				//it's been more than a minute since encoding progress was recorded
				$this->set_error( __( 'Encoding stopped unexpectedly', 'video-embed-thumbnail-generator' ) );
			}
		}
	}

	public function set_needs_insert() {
		$this->set_status( 'needs_insert' );
		$this->set_ended( filemtime( $this->logfile ) );
	}

	public function set_video_duration( int $duration ) {
		$this->video_duration = $duration;
	}

	public function set_canceled() {
		$this->set_status( 'canceled' );
		if ( current_user_can( 'encode_videos' ) ) {
			wp_delete_file( $this->get_path() );
		}
	}
}
