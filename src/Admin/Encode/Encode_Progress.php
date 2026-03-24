<?php
/**
 * Encode Progress class file.
 *
 * @package Videopack
 * @subpackage Admin/Encode
 */

namespace Videopack\Admin\Encode;

/**
 * Standardizes encoding progress data and provides calculation and parsing methods.
 */
class Encode_Progress {

	/**
	 * Progress data array.
	 *
	 * @var array
	 */
	private $data = array(
		'frame'          => null,
		'fps'            => null,
		'stream'         => null,
		'bitrate'        => null,
		'total_size'     => null,
		'out_time_us'    => null,
		'out_time_ms'    => null,
		'out_time'       => null,
		'dup_frames'     => null,
		'drop_frames'    => null,
		'speed'          => null,
		'progress'       => null,
		'percent'        => 0,
		'elapsed'        => 0,
		'remaining'      => null,
		'video_duration' => 0,
		'started'        => 0,
		'job_id'         => 0,
	);

	/**
	 * Create an Encode_Progress object from an FFmpeg progress log file.
	 *
	 * @param string $log_file Path to the log file.
	 * @param int    $duration Total video duration in microseconds.
	 * @param int    $started  Start timestamp.
	 * @param int    $job_id   Job ID.
	 * @return self
	 */
	public static function from_log_file( string $log_file, int $duration = 0, int $started = 0, int $job_id = 0 ) {
		$progress = new self();
		$progress->set_video_duration( $duration );
		$progress->set_started( $started );
		$progress->set_job_id( $job_id );

		if ( ! file_exists( $log_file ) ) {
			return $progress;
		}

		$handle      = fopen( $log_file, 'r' );
		$parsed_data = array();
		if ( $handle ) {
			$fsize    = filesize( $log_file );
			$read_len = min( $fsize, 4096 );
			if ( $read_len > 0 ) {
				fseek( $handle, -$read_len, SEEK_END );
				$content = fread( $handle, $read_len );
				$lines   = explode( "\n", $content );
				// Skip the first partial line if we didn't read from the start.
				if ( $fsize > $read_len ) {
					array_shift( $lines );
				}
				foreach ( $lines as $line ) {
					$line = trim( $line );
					if ( strpos( $line, '=' ) !== false ) {
						list( $key, $value ) = explode( '=', $line, 2 );
						$parsed_data[ $key ] = trim( $value );
					}
				}
			}
			fclose( $handle );
		}

		$progress->update_from_parsed_data( $parsed_data );
		$progress->calculate();

		return $progress;
	}

	/**
	 * Create an Encode_Progress object for a finished/finishing state.
	 *
	 * @param int $duration Total video duration in microseconds.
	 * @param int $started  Start timestamp.
	 * @param int $job_id   Job ID.
	 * @return self
	 */
	public static function finished( int $duration = 0, int $started = 0, int $job_id = 0 ) {
		$progress = new self();
		$progress->set_percent( 100 );
		$progress->set_progress_text( 'end' );
		$progress->set_video_duration( $duration );
		$progress->set_started( $started );
		$progress->set_job_id( $job_id );
		$progress->calculate();
		return $progress;
	}

	/**
	 * Update internal data from parsed log lines.
	 *
	 * @param array $parsed_data Array of key=value pairs from the log.
	 */
	private function update_from_parsed_data( array $parsed_data ) {
		$map = array(
			'frame'       => 'frame',
			'fps'         => 'fps',
			'stream'      => 'stream',
			'bitrate'     => 'bitrate',
			'total_size'  => 'total_size',
			'out_time_us' => 'out_time_us',
			'out_time_ms' => 'out_time_ms',
			'out_time'    => 'out_time',
			'dup_frames'  => 'dup_frames',
			'drop_frames' => 'drop_frames',
			'speed'       => 'speed',
			'progress'    => 'progress',
		);

		foreach ( $map as $parsed_key => $data_key ) {
			if ( isset( $parsed_data[ $parsed_key ] ) ) {
				$this->data[ $data_key ] = $parsed_data[ $parsed_key ];
			}
		}
	}

	/**
	 * Perform calculations for percent, elapsed, and remaining time.
	 */
	public function calculate() {
		// Percent.
		if ( $this->data['video_duration'] > 0 && isset( $this->data['out_time_us'] ) ) {
			$out_time_us           = (int) $this->data['out_time_us'];
			$this->data['percent'] = min( 100, round( ( $out_time_us / $this->data['video_duration'] ) * 100, 2 ) );
		}

		// Elapsed.
		$elapsed = 0;
		if ( $this->data['started'] ) {
			$elapsed = time() - $this->data['started'];
		}
		$this->data['elapsed'] = $elapsed;

		// Remaining.
		$this->data['remaining'] = null;
		if ( $this->data['percent'] > 0 && $elapsed > 0 ) {
			$total_estimated_time    = $elapsed / ( $this->data['percent'] / 100 );
			$this->data['remaining'] = max( 0, round( $total_estimated_time - $elapsed ) );
		}
	}

	/**
	 * Set the total video duration.
	 *
	 * @param int $duration Total video duration in microseconds.
	 */
	public function set_video_duration( int $duration ) {
		$this->data['video_duration'] = $duration;
	}

	/**
	 * Set the start timestamp.
	 *
	 * @param int $started Start timestamp.
	 */
	public function set_started( int $started ) {
		$this->data['started'] = $started;
	}

	/**
	 * Set the job ID.
	 *
	 * @param int $job_id Job ID.
	 */
	public function set_job_id( int $job_id ) {
		$this->data['job_id'] = $job_id;
	}

	/**
	 * Set the completion percentage.
	 *
	 * @param float $percent Percentage value.
	 */
	public function set_percent( float $percent ) {
		$this->data['percent'] = $percent;
	}

	/**
	 * Set the progress text.
	 *
	 * @param string $text Progress status text (e.g., 'end').
	 */
	public function set_progress_text( string $text ) {
		$this->data['progress'] = $text;
	}

	/**
	 * Get the progress data as an array.
	 *
	 * @return array
	 */
	public function to_array() {
		return $this->data;
	}
}
