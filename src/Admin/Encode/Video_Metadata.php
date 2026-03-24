<?php
/**
 * Video Metadata class file.
 *
 * @package Videopack
 * @subpackage Admin/Encode
 */

namespace Videopack\Admin\Encode;

/**
 * Class Video_Metadata
 *
 * Handles extracting and storing video metadata using FFmpeg and WordPress APIs.
 */
class Video_Metadata {

	/**
	 * Attachment ID.
	 *
	 * @var int $id
	 */
	protected $id;

	/**
	 * Input URL or path for encoding.
	 *
	 * @var string $encode_input
	 */
	protected $encode_input;

	/**
	 * Whether the video is a WordPress attachment.
	 *
	 * @var bool $is_attachment
	 */
	protected $is_attachment;

	/**
	 * Path to the FFmpeg executable.
	 *
	 * @var string $ffmpeg_path
	 */
	protected $ffmpeg_path;

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Whether the metadata extraction worked.
	 *
	 * @var bool $worked
	 */
	public $worked;

	/**
	 * Actual width of the video.
	 *
	 * @var int|null $actualwidth
	 */
	public $actualwidth;

	/**
	 * Actual height of the video.
	 *
	 * @var int|null $actualheight
	 */
	public $actualheight;

	/**
	 * Duration of the video in seconds.
	 *
	 * @var float|null $duration
	 */
	public $duration;

	/**
	 * Video codec.
	 *
	 * @var string|null $codec
	 */
	public $codec;

	/**
	 * Rotation of the video.
	 *
	 * @var int|string $rotate
	 */
	public $rotate;

	/**
	 * Watermark URL for FFmpeg.
	 *
	 * @var string|null $ffmpeg_watermark_url
	 */
	public $ffmpeg_watermark_url;
	/**
	 * Format ID that replaced the original video.
	 *
	 * @var string|null $original_replaced
	 */
	public $original_replaced;

	/**
	 * Constructor.
	 *
	 * @param int    $id            Attachment ID.
	 * @param string $encode_input  Input URL or path.
	 * @param bool   $is_attachment Whether it's an attachment.
	 * @param string $ffmpeg_path   Path to FFmpeg.
	 * @param array  $options       Plugin options.
	 */
	public function __construct(
		$id,
		string $encode_input,
		bool $is_attachment,
		string $ffmpeg_path,
		array $options
	) {
		$this->id            = $id;
		$this->encode_input  = $encode_input;
		$this->is_attachment = $is_attachment;
		$this->ffmpeg_path   = $ffmpeg_path;
		$this->options       = $options;
		$this->set_video_metadata();
	}

	/**
	 * Set video metadata by checking postmeta or running FFmpeg.
	 */
	protected function set_video_metadata() {
		$attachment_meta_instance = null;

		if ( $this->is_attachment ) {
			$attachment_meta_instance   = new \Videopack\Admin\Attachment_Meta( $this->options, $this->id );
			$videopack_postmeta         = $attachment_meta_instance->get(); // get() returns the array.
			$this->ffmpeg_watermark_url = $videopack_postmeta['ffmpeg_watermark_url'] ?? null;
			$this->original_replaced    = $videopack_postmeta['original_replaced'] ?? null;

			if ( isset( $videopack_postmeta['worked'] ) && $videopack_postmeta['worked']
			) {
				$this->worked       = true;
				$this->actualwidth  = $videopack_postmeta['actualwidth'] ?? null;
				$this->actualheight = $videopack_postmeta['actualheight'] ?? null;
				$this->duration     = $videopack_postmeta['duration'] ?? null;
				$this->codec        = $videopack_postmeta['codec'] ?? null;
				$this->rotate       = $videopack_postmeta['rotate'] ?? '';
				return;
			}
		}

		$result = null;

		$get_info = new FFmpeg_process(
			array(
				$this->ffmpeg_path,
				'-i',
				$this->encode_input,
			),
			null,
			null,
			null,
			30
		);

		try {
			$get_info->run();
			$output = $get_info->getErrorOutput();
		} catch ( \Exception $e ) {
			$output = $e->getMessage();
		}

			$regex = '/([0-9]{2,4})x([0-9]{2,4})/';

		if ( ! empty( $output ) && preg_match( $regex, $output, $regs ) ) {
			$result = $regs[0];
		}

		if ( ! empty( $result ) ) {

			$this->worked       = true;
			$this->actualwidth  = $regs [1] ? $regs [1] : null;
			$this->actualheight = $regs [2] ? $regs [2] : null;

			// Attempt to parse video codec from FFmpeg output.
			if ( preg_match( '/Stream #\d+:\d+[^:]*: Video: ([a-zA-Z0-9-]+)/', $output, $codec_matches ) ) {
				$this->codec = strtolower( $codec_matches[1] );
			}

			preg_match( '/Duration: (.*?),/', $output, $matches );
			$duration               = $matches[1];
			$movie_duration_hours   = intval( substr( $duration, -11, 2 ) );
			$movie_duration_minutes = intval( substr( $duration, -8, 2 ) );
			$movie_duration_seconds = floatval( substr( $duration, -5 ) );
			$this->duration         = ( $movie_duration_hours * 60 * 60 ) + ( $movie_duration_minutes * 60 ) + $movie_duration_seconds;

			preg_match( '/rotate          : (.*?)\n/', $output, $matches );
			if ( is_array( $matches )
			&& array_key_exists( 1, $matches ) === true
			) {
				$rotate = $matches[1];
			} else {
				$rotate = '0';
			}

			switch ( $rotate ) {
				case '90':
					$this->rotate = 90;
					break;
				case '180':
					$this->rotate = 180;
					break;
				case '270':
					$this->rotate = 270;
					break;
				case '-90':
					$this->rotate = 270;
					break;
				default:
					$this->rotate = '';
					break;
			}
		} else {
			$this->worked = false;
			if ( $this->is_attachment ) {
				$wp_meta = wp_get_attachment_metadata( $this->id );
				if ( is_array( $wp_meta ) && ! empty( $wp_meta['width'] ) && ! empty( $wp_meta['height'] ) ) {
					$this->worked       = true;
					$this->actualwidth  = $wp_meta['width'];
					$this->actualheight = $wp_meta['height'];
					if ( ! empty( $wp_meta['length'] ) ) {
						$this->duration = $wp_meta['length'];
					}
				}
			}
		}

		if ( $this->is_attachment ) {
			if ( ! $attachment_meta_instance ) {
				$attachment_meta_instance = new \Videopack\Admin\Attachment_Meta( $this->options, $this->id );
			}
			$existing_postmeta = $attachment_meta_instance->get();

			$metadata_to_save = array(
				'worked'       => $this->worked,
				'actualwidth'  => $this->actualwidth,
				'actualheight' => $this->actualheight,
				'duration'     => $this->duration,
				// Only add codec if it was derived and not already present or different in existing meta.
				// This ensures we save it if FFmpeg found it and WP didn't, or if it's more specific.
				'codec'        => ( ! empty( $this->codec ) && ( empty( $existing_postmeta['codec'] ) || $existing_postmeta['codec'] !== $this->codec ) ) ? $this->codec : $existing_postmeta['codec'],
				'rotate'       => $this->rotate,
			);

			$merged_meta = array_merge( $existing_postmeta, $metadata_to_save );
			// Ensure 'codec' is explicitly set if it was null and now has a value.
			if ( empty( $existing_postmeta['codec'] ) && ! empty( $this->codec ) ) {
				$merged_meta['codec'] = $this->codec;
			}
			$attachment_meta_instance->save( $merged_meta );
		}
	}
}
