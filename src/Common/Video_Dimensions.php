<?php

namespace Videopack\Common;

class Video_Dimensions {

	protected $options_manager;
	protected $options;
	protected $id;
	protected $gallery;

	public $width;
	public $height;
	public $actualwidth;
	public $actualheight;

	public function __construct( \Videopack\Admin\Options $options_manager, $id, bool $gallery = false ) {
		$this->options_manager = $options_manager;
		$this->id              = $id;
		$this->options         = $options_manager->get_options();
		$this->gallery         = $gallery;
		$this->set();
	}

	public function set() {

		$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options_manager );
		$video_meta      = wp_get_attachment_metadata( $this->id );
		$kgvid_postmeta  = $attachment_meta->get( $this->id );
		$this->width     = $kgvid_postmeta['width'];
		$this->height    = $kgvid_postmeta['height'];

		// Set actual width and height from video metadata if available, otherwise use options
		$this->actualwidth  = isset( $video_meta['width'] ) ? $video_meta['width'] : $this->options['width'];
		$this->actualheight = isset( $video_meta['height'] ) ? $video_meta['height'] : $this->options['height'];

		// Set width and height if not already set
		if ( empty( $this->width ) ) {
			$this->width = $this->actualwidth;
		}
		if ( empty( $this->height ) ) {
			$this->height = $this->actualheight;
		}

		// Calculate aspect ratio
		if ( $this->width > 0 && $this->height > 0 ) {
			$aspect_ratio = $this->height / $this->width;
		} else {
			$aspect_ratio = $this->options['height'] / $this->options['width'];
		}

		// Adjust dimensions for gallery
		if ( $this->gallery ) {
			if ( ! empty( $this->actualwidth ) ) {
				$this->width = $this->actualwidth;
			}
			if ( $this->width > $this->options['gallery_width'] ) {
				$this->width = $this->options['gallery_width'];
			}
		} elseif ( intval( $this->width ) > intval( $this->options['width'] ) ) {
				$this->width = $this->options['width'];
		}

		// Calculate height based on aspect ratio
		$this->height = round( $this->width * $aspect_ratio );
	}
}
