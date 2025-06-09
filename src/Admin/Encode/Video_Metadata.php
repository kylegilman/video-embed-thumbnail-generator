<?php

namespace Videopack\Admin\Encode;

class Video_Metadata {

	protected $id;
	protected $encode_input;
	protected $is_attachment;
	protected $ffmpeg_path;
	protected $options_manager;

	public $worked;
	public $actualwidth;
	public $actualheight;
	public $duration;
	public $rotate;

	public function __construct(
		$id,
		string $encode_input,
		bool $is_attachment,
		string $ffmpeg_path,
		\Videopack\Admin\Options $options_manager
	) {
		$this->id            = $id;
		$this->encode_input  = $encode_input;
		$this->is_attachment = $is_attachment;
		$this->ffmpeg_path   = $ffmpeg_path;
		$this->options_manager = $options_manager;
		$this->set_video_metadata();
	}

	protected function set_video_metadata() {
		$attachment_meta_instance = null;

		if ( $this->is_attachment ) {
			$attachment_meta_instance = new \Videopack\Admin\Attachment_Meta( $this->options_manager, $this->id );
			$kgvid_postmeta           = $attachment_meta_instance->get(); // get() returns the array

			if ( isset( $kgvid_postmeta['worked'] ) && $kgvid_postmeta['worked']
			) {
				$this->worked       = true;
				$this->actualwidth  = $kgvid_postmeta['actualwidth'] ?? null;
				$this->actualheight = $kgvid_postmeta['actualheight'] ?? null;
				$this->duration     = $kgvid_postmeta['duration'] ?? null;
				$this->rotate       = $kgvid_postmeta['rotate'] ?? '';
				return;
			}
		}

		$result   = null;

		$get_info = new FFmpeg_process(
			array(
				$this->ffmpeg_path,
				'-i',
				$this->encode_input,
			)
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
		}

		if ( $this->is_attachment ) {
			if ( ! $attachment_meta_instance ) {
				$attachment_meta_instance = new \Videopack\Admin\Attachment_Meta( $this->options_manager, $this->id );
			}
			$existing_postmeta = $attachment_meta_instance->get();

			$metadata_to_save = array(
				'worked'       => $this->worked,
				'actualwidth'  => $this->actualwidth,
				'actualheight' => $this->actualheight,
				'duration'     => $this->duration,
				'rotate'       => $this->rotate,
			);
			$merged_meta = array_merge( $existing_postmeta, $metadata_to_save );
			$attachment_meta_instance->save( $merged_meta );
		}
	}
}
