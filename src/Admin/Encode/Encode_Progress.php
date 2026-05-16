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
			\Videopack\Common\Debug_Logger::log( 'Encode_Progress: Log file not found', array( 'file' => $log_file ) );
			return $progress;
		}

		$fsize = @filesize( $log_file );
		\Videopack\Common\Debug_Logger::log( 'Encode_Progress: File check', array( 'file' => $log_file, 'size' => $fsize ) );

		if ( $fsize === 0 ) {
			\Videopack\Common\Debug_Logger::log( 'Encode_Progress: Log file is empty', array( 'file' => $log_file ) );
			return $progress;
		}

		$handle      = @fopen( $log_file, 'r' );
		$parsed_data = array();
		if ( $handle ) {
			\Videopack\Common\Debug_Logger::log( 'Encode_Progress: Handle opened', array( 'job_id' => $job_id ) );
			// Read enough to catch several FFmpeg progress blocks.
			$read_len = min( $fsize, 8192 );
			if ( $read_len > 0 ) {
				@fseek( $handle, -$read_len, SEEK_END );
				$content = @fread( $handle, $read_len );
				
				\Videopack\Common\Debug_Logger::log( 'Encode_Progress: Content read', array( 'len' => strlen( (string) $content ) ) );

				// Handle mixed line endings (Windows FFmpeg often uses \r).
				$content = preg_replace( '/\r\n|\r|\n/', "\n", (string) $content );
				$lines   = explode( "\n", $content );
				
				// Skip the first partial line if we didn't read from the start.
				if ( $fsize > $read_len ) {
					array_shift( $lines );
				}
				
				foreach ( $lines as $line ) {
					$line = trim( $line );
					if ( strpos( $line, '=' ) !== false ) {
						list( $key, $value ) = explode( '=', $line, 2 );
						$key   = trim( $key );
						$value = trim( $value );
						if ( $value !== 'N/A' ) {
							$parsed_data[ $key ] = $value;
						}
					}
				}
				
				if ( empty( $parsed_data['out_time_us'] ) && empty( $parsed_data['out_time_ms'] ) ) {
					\Videopack\Common\Debug_Logger::log( 'Encode_Progress: No time data found in parsed lines', array(
						'job_id'      => $job_id,
						'line_count'  => count( $lines ),
						'last_line'   => end( $lines ),
					) );
				}
			}
			@fclose( $handle );
		} else {
			\Videopack\Common\Debug_Logger::log( 'Encode_Progress: FOPEN FAILED', array( 'file' => $log_file ) );
		}

		$progress->update_from_parsed_data( $parsed_data );
		$progress->calculate();

		if ( ! empty( $parsed_data ) ) {
			\Videopack\Common\Debug_Logger::log( 'Encode_Progress: Parsed results', array(
				'job_id' => $job_id,
				'time'   => $parsed_data['out_time_us'] ?? 'N/A',
				'percent' => $progress->data['percent']
			) );
		}

		// Diagnostic logging if we have data but no time.
		if ( ! empty( $parsed_data ) && $progress->data['percent'] === 0 && ! is_numeric( $progress->data['out_time_us'] ) ) {
			\Videopack\Common\Debug_Logger::log( 'Encode_Progress: Numeric time missing in parsed data', array(
				'keys' => array_keys( $parsed_data ),
				'last_line' => end( $lines ) ?: 'N/A',
				'file_size' => $fsize
			) );
		}

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
		if ( $this->data['video_duration'] > 0 ) {
			$out_time_us = 0;
			$raw_us      = $this->data['out_time_us'] ?? 'N/A';
			$raw_ms      = $this->data['out_time_ms'] ?? 'N/A';

			if ( is_numeric( $raw_us ) ) {
				$out_time_us = (int) $raw_us;
			} elseif ( is_numeric( $raw_ms ) ) {
				$ms_val = (int) $raw_ms;
				// Some FFmpeg versions report microseconds in the out_time_ms field.
				// If the value is larger than the duration (in ms), it's likely microseconds.
				if ( $ms_val > ( $this->data['video_duration'] / 1000 ) * 1.5 ) {
					$out_time_us = $ms_val;
				} else {
					$out_time_us = $ms_val * 1000;
				}
			} else {
				\Videopack\Common\Debug_Logger::log( 'Encode_Progress: No numeric time found', array( 
					'out_time_us' => $raw_us, 
					'out_time_ms' => $raw_ms 
				) );
			}

			if ( $out_time_us > 0 ) {
				$this->data['percent'] = min( 100, round( ( $out_time_us / $this->data['video_duration'] ) * 100, 2 ) );
			}
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
