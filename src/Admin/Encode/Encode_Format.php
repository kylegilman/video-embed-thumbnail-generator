<?php
/**
 * Encode Format class file.
 *
 * @package Videopack
 * @subpackage Admin/Encode
 */

namespace Videopack\Admin\Encode;

/**
 * Class Encode_Format
 *
 * Represents a specific encoding job for a video format.
 */
class Encode_Format {

	/**
	 * Status constants.
	 */
	const STATUS_QUEUED              = 'queued';
	const STATUS_PROCESSING          = 'processing';
	const STATUS_ENCODING            = 'encoding';
	const STATUS_NEEDS_INSERT        = 'needs_insert';
	const STATUS_PENDING_REPLACEMENT = 'pending_replacement';
	const STATUS_COMPLETED           = 'completed';
	const STATUS_FAILED              = 'failed';
	const STATUS_CANCELED            = 'canceled';
	const STATUS_DELETED             = 'deleted';
	const STATUS_ERROR               = 'error';
	const STATUS_NOT_ENCODED         = 'not_encoded';

	/**
	 * Format ID.
	 *
	 * @var string $format_id
	 */
	private $format_id;

	/**
	 * Status of the job.
	 *
	 * @var string $status
	 */
	private $status;

	/**
	 * Output path.
	 *
	 * @var string $path
	 */
	private $path;

	/**
	 * Output URL.
	 *
	 * @var string $url
	 */
	private $url;

	/**
	 * User ID who started the job.
	 *
	 * @var int $user_id
	 */
	private $user_id;

	/**
	 * Path to the log file.
	 *
	 * @var string $logfile
	 */
	private $logfile;

	/**
	 * Process ID.
	 *
	 * @var int $pid
	 */
	private $pid;

	/**
	 * Start timestamp.
	 *
	 * @var int $started
	 */
	private $started;

	/**
	 * FFmpeg encode arguments.
	 *
	 * @var array $encode_array
	 */
	private $encode_array;

	/**
	 * Error message.
	 *
	 * @var string $error
	 */
	private $error;

	/**
	 * End timestamp.
	 *
	 * @var int $ended
	 */
	private $ended;

	/**
	 * Progress data.
	 *
	 * @var array $progress
	 */
	private $progress;

	/**
	 * Encoded video width.
	 *
	 * @var int $encode_width
	 */
	private $encode_width;

	/**
	 * Encoded video height.
	 *
	 * @var int $encode_height
	 */
	private $encode_height;

	/**
	 * Attachment ID of the output file.
	 *
	 * @var int $id
	 */
	private $id;

	/**
	 * Job ID from the encoding queue table.
	 *
	 * @var int $job_id
	 */
	private $job_id;

	/**
	 * Temporary path for watermark.
	 *
	 * @var string $temp_watermark_path
	 */
	private $temp_watermark_path;
 
	/**
	 * Video title.
	 *
	 * @var string $video_title
	 */
	private $video_title;


	/**
	 * Total duration of the video in microseconds.
	 *
	 * @var int $video_duration
	 */
	private $video_duration;

	/**
	 * Source attachment ID.
	 *
	 * @var int $attachment_id
	 */
	private $attachment_id;

	/**
	 * Input URL.
	 *
	 * @var string $input_url
	 */
	private $input_url;

	/**
	 * Blog ID (for multisite).
	 *
	 * @var int $blog_id
	 */
	private $blog_id;

	/**
	 * Created at timestamp.
	 *
	 * @var string $created_at
	 */
	private $created_at;

	/**
	 * Updated at timestamp.
	 *
	 * @var string $updated_at
	 */
	private $updated_at;

	/**
	 * Constructor.
	 *
	 * @param string $format_id The ID of the video format.
	 */
	public function __construct( string $format_id ) {
		$this->format_id = $format_id;
	}

	/**
	 * Convert the object to an array.
	 *
	 * @return array
	 */
	public function to_array() {
		$vars = get_object_vars( $this );
		return $vars;
	}

	/**
	 * Create an Encode_Format object from an array of database data.
	 *
	 * @param array $data Database record data.
	 * @return self
	 */
	public static function from_array( array $data ) {

		$format = new self( $data['format_id'] ); // Use 'format_id' from DB.

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

		$format->set_encode_width( $format->set_or_null( $data, 'encode_width' ) );
		$format->set_encode_height( $format->set_or_null( $data, 'encode_height' ) );
		$format->set_job_id( $format->set_or_null( $data, 'id' ) ); // Use 'id' from DB as job_id.
		$format->set_id( $format->set_or_null( $data, 'output_attachment_id' ) );
		$format->set_temp_watermark_path( $format->set_or_null( $data, 'temp_watermark_path' ) );
 
		$format->set_video_title( $format->set_or_null( $data, 'video_title' ) );
		$format->set_video_duration( (int) $format->set_or_null( $data, 'video_duration' ) );
 
		$format->attachment_id = $format->set_or_null( $data, 'attachment_id' );
		$format->input_url     = $format->set_or_null( $data, 'input_url' );
		$format->blog_id       = $format->set_or_null( $data, 'blog_id' );
		$format->created_at    = $format->set_or_null( $data, 'created_at' );
		$format->updated_at    = $format->set_or_null( $data, 'updated_at' );

		return $format;
	}

	/**
	 * Helper method to set a value or null if the key doesn't exist.
	 *
	 * @param array  $data Array of data.
	 * @param string $key  Key to check.
	 * @return mixed|null
	 */
	protected function set_or_null( array $data, string $key ) {
		if ( isset( $data[ $key ] ) ) {
			return $data[ $key ];
		}
		return null;
	}

	/**
	 * Get current progress data.
	 *
	 * @return array|string Returns progress array or 'recheck' if it should be checked again later.
	 */
	public function get_progress() {
		if ( $this->status === self::STATUS_ENCODING
			&& $this->logfile
			&& file_exists( $this->logfile )
		) {
			$this->progress = Encode_Progress::from_log_file( $this->logfile, (int) $this->video_duration, (int) $this->started, (int) $this->job_id )->to_array();
		} elseif ( in_array( $this->status, array( self::STATUS_NEEDS_INSERT, self::STATUS_PENDING_REPLACEMENT, self::STATUS_COMPLETED ), true ) ) {
			// If it's finishing or finished, mock the progress as 100%.
			$this->progress = Encode_Progress::finished( (int) $this->video_duration, (int) $this->started, (int) $this->job_id )->to_array();
		} else {
			return 'recheck';
		}

		if ( is_array( $this->progress ) ) {
			return $this->progress;
		}

		return 'recheck';
	}

	/**
	 * Get the format ID.
	 *
	 * @return string
	 */
	public function get_format_id() {
		return $this->format_id;
	}

	/**
	 * Get the current status.
	 *
	 * @return string
	 */
	public function get_status() {
		$this->set_progress();
		return $this->status;
	}

	/**
	 * Get the output path.
	 *
	 * @return string
	 */
	public function get_path() {
		return $this->path;
	}

	/**
	 * Get the output URL.
	 *
	 * @return string
	 */
	public function get_url() {
		return $this->url;
	}

	/**
	 * Get the user ID.
	 *
	 * @return int
	 */
	public function get_user_id() {
		return $this->user_id;
	}

	/**
	 * Get the logfile path.
	 *
	 * @return string
	 */
	public function get_logfile() {
		return $this->logfile;
	}

	/**
	 * Get the process ID.
	 *
	 * @return int
	 */
	public function get_pid() {
		return $this->pid;
	}

	/**
	 * Get the start timestamp.
	 *
	 * @return int
	 */
	public function get_started() {
		return $this->started;
	}

	/**
	 * Get the FFmpeg encode arguments.
	 *
	 * @return array
	 */
	public function get_encode_array() {
		return $this->encode_array;
	}

	/**
	 * Get the error message.
	 *
	 * @return string
	 */
	public function get_error() {
		return $this->error;
	}

	/**
	 * Get the end timestamp.
	 *
	 * @return int
	 */
	public function get_ended() {
		return $this->ended;
	}

	/**
	 * Get the output attachment ID.
	 *
	 * @return int
	 */
	public function get_id() {
		return $this->id;
	}

	/**
	 * Get the encoded video width.
	 *
	 * @return int
	 */
	public function get_encode_width() {
		return $this->encode_width;
	}

	/**
	 * Get the encoded video height.
	 *
	 * @return int
	 */
	public function get_encode_height() {
		return $this->encode_height;
	}

	/**
	 * Get the job ID.
	 *
	 * @return int
	 */
	public function get_job_id() {
		return $this->job_id;
	}

	/**
	 * Get the temporary watermark path.
	 *
	 * @return string
	 */
	public function get_temp_watermark_path() {
		return $this->temp_watermark_path;
	}

	/**
	 * Get the source attachment ID.
	 *
	 * @return int
	 */
	public function get_attachment_id() {
		return $this->attachment_id;
	}

	/**
	 * Get the input URL.
	 *
	 * @return string
	 */
	public function get_input_url() {
		return $this->input_url;
	}

	/**
	 * Get the blog ID.
	 *
	 * @return int
	 */
	public function get_blog_id() {
		return $this->blog_id;
	}

	/**
	 * Get the creation timestamp.
	 *
	 * @return string
	 */
	public function get_created_at() {
		return $this->created_at;
	}

	/**
	 * Get the update timestamp.
	 *
	 * @return string
	 */
	public function get_updated_at() {
		return $this->updated_at;
	}

	/**
	 * Get the video duration.
	 *
	 * @return int
	 */
	public function get_video_duration() {
		return (int) $this->video_duration;
	}
 
	/**
	 * Get the video title.
	 *
	 * @return string
	 */
	public function get_video_title() {
		return (string) $this->video_title;
	}
 
	/**
	 * Set the video title.
	 *
	 * @param string|null $title Video title.
	 */
	public function set_video_title( ?string $title ) {
		$this->video_title = $title;
	}


	/**
	 * Set the status.
	 *
	 * @param string|null $status Status string.
	 */
	public function set_status( ?string $status ) {
		$allowed = array(
			'queued',
			'processing',
			'encoding',
			'needs_insert',
			'completed',
			'canceled',
			'deleted',
			'pending_replacement',
			'failed',
		);
		if ( in_array( $status, $allowed ) ) {
			$this->status = $status;
		}
	}

	/**
	 * Set the user ID.
	 *
	 * @param int|null $user_id User ID.
	 */
	public function set_user_id( ?int $user_id ) {
		$this->user_id = $user_id;
	}

	/**
	 * Set the output path.
	 *
	 * @param string|null $path Output path.
	 */
	public function set_path( ?string $path ) {
		$this->path = $path;
	}

	/**
	 * Set the output URL.
	 *
	 * @param string|null $url Output URL.
	 */
	public function set_url( ?string $url ) {
		$this->url = $url;
	}

	/**
	 * Set the logfile path.
	 *
	 * @param string|null $logfile Logfile path.
	 */
	public function set_logfile( ?string $logfile ) {
		$this->logfile = $logfile;
	}

	/**
	 * Set the process ID.
	 *
	 * @param int|null $pid Process ID.
	 */
	public function set_pid( ?int $pid ) {
		$this->pid = $pid;
	}

	/**
	 * Set the start timestamp.
	 *
	 * @param int|null $started Start timestamp.
	 */
	public function set_started( ?int $started ) {
		$this->started = $started;
	}

	/**
	 * Set the FFmpeg encode arguments.
	 *
	 * @param array|null $encode_array FFmpeg arguments.
	 */
	public function set_encode_array( ?array $encode_array ) {
		$this->encode_array = $encode_array;
	}

	/**
	 * Set an error message and fail the job.
	 *
	 * @param string|null $error Error message.
	 */
	public function set_error( ?string $error ) {
		$this->set_status( self::STATUS_FAILED );
		$this->error = $error;
	}

	/**
	 * Set the end timestamp.
	 *
	 * @param int|null $ended End timestamp.
	 */
	public function set_ended( ?int $ended ) {
		$this->ended = $ended;
	}

	/**
	 * Set the output attachment ID.
	 *
	 * @param int|null $id Attachment ID.
	 */
	public function set_id( ?int $id ) {
		$this->id = $id;
	}

	/**
	 * Set the encoded video width.
	 *
	 * @param int|null $width Video width.
	 */
	public function set_encode_width( ?int $width ) {
		$this->encode_width = $width;
	}

	/**
	 * Set the encoded video height.
	 *
	 * @param int|null $height Video height.
	 */
	public function set_encode_height( ?int $height ) {
		$this->encode_height = $height;
	}

	/**
	 * Set the job ID.
	 *
	 * @param int|null $job_id Job ID.
	 */
	public function set_job_id( ?int $job_id ) {
		$this->job_id = $job_id;
	}

	/**
	 * Set the temporary watermark path.
	 *
	 * @param string|null $path Temporary watermark path.
	 */
	public function set_temp_watermark_path( ?string $path ) {
		$this->temp_watermark_path = $path;
	}

	/**
	 * Helper method to set common queued properties.
	 *
	 * @param string $path    Output path.
	 * @param string $url     Output URL.
	 * @param int    $user_id User ID.
	 */
	public function set_queued( string $path, string $url, int $user_id ) {
		$this->set_status( self::STATUS_QUEUED );
		$this->set_path( $path );
		$this->set_url( $url );
		$this->set_user_id( $user_id );
	}

	/**
	 * Helper method to set encoding start properties.
	 *
	 * @param int $pid     Process ID.
	 * @param int $started Start timestamp.
	 */
	public function set_encode_start( int $pid, int $started ) {
		$this->set_status( self::STATUS_ENCODING );
		$this->set_pid( $pid );
		$this->set_started( $started );
	}

	/**
	 * Update progress and status from the log file.
	 */
	protected function set_progress() {
		if ( $this->status === self::STATUS_ENCODING
			&& $this->logfile
			&& file_exists( $this->logfile )
		) {
			$progress_obj   = Encode_Progress::from_log_file( $this->logfile, (int) $this->video_duration, (int) $this->started, (int) $this->job_id );
			$this->progress = $progress_obj->to_array();

			if ( isset( $this->progress['progress'] ) && 'end' === $this->progress['progress'] ) {
				$this->set_needs_insert();
			} elseif ( time() - filemtime( $this->logfile ) > 60 ) {
				// it's been more than a minute since encoding progress was recorded.
				$this->set_error( __( 'Encoding stopped unexpectedly', 'video-embed-thumbnail-generator' ) );
			}
		}
	}

	/**
	 * Set the status to needs_insert and record the end time.
	 */
	public function set_needs_insert() {
		$this->set_status( 'needs_insert' );
		$this->set_ended( filemtime( $this->logfile ) );
	}

	/**
	 * Set the video duration.
	 *
	 * @param int $duration Total duration in microseconds.
	 */
	public function set_video_duration( int $duration ) {
		$this->video_duration = $duration;
	}

	/**
	 * Set the status to canceled and delete the partial output file.
	 */
	public function set_canceled() {
		$this->set_status( self::STATUS_CANCELED );
		if ( current_user_can( 'encode_videos' ) ) {
			wp_delete_file( $this->get_path() );
		}
	}

	/**
	 * Get the localized label for a given status.
	 *
	 * @param string $status The internal status string.
	 * @return string The localized status label.
	 */
	public static function get_status_label( $status ) {
		switch ( $status ) {
			case self::STATUS_NOT_ENCODED:
				return __( 'Not Encoded', 'video-embed-thumbnail-generator' );
			case self::STATUS_COMPLETED:
			case 'encoded': // Handle legacy status from old DB rows if they exist.
				return __( 'Completed', 'video-embed-thumbnail-generator' );
			case self::STATUS_QUEUED:
				return __( 'Queued', 'video-embed-thumbnail-generator' );
			case self::STATUS_PROCESSING:
				return __( 'Processing', 'video-embed-thumbnail-generator' );
			case self::STATUS_ENCODING:
				return __( 'Encoding', 'video-embed-thumbnail-generator' );
			case self::STATUS_FAILED:
			case self::STATUS_ERROR:
				return __( 'Failed', 'video-embed-thumbnail-generator' );
			case self::STATUS_CANCELED:
				return __( 'Canceled', 'video-embed-thumbnail-generator' );
			case self::STATUS_DELETED:
				return __( 'Deleted', 'video-embed-thumbnail-generator' );
			case self::STATUS_NEEDS_INSERT:
			case self::STATUS_PENDING_REPLACEMENT:
				return __( 'Finishing', 'video-embed-thumbnail-generator' );
			default:
				return $status;
		}
	}
}
