<?php

namespace Videopack\Common;

class Video_Dimensions {

	private function __construct() { }

	public static function get( $id, $gallery = false ) {

		$options         = \Videopack\Admin\Options::get_instance()->get_options();
		$attachment_meta = new \Videopack\Admin\Attachment_Meta();
		$video_meta      = wp_get_attachment_metadata( $id );
		$kgvid_postmeta  = $attachment_meta->get( $id );

		// Set actual width and height from video metadata if available, otherwise use options
		$kgvid_postmeta['actualwidth']  = isset( $video_meta['width'] ) ? $video_meta['width'] : $options['width'];
		$kgvid_postmeta['actualheight'] = isset( $video_meta['height'] ) ? $video_meta['height'] : $options['height'];

		// Set width and height if not already set
		if ( empty( $kgvid_postmeta['width'] ) ) {
			$kgvid_postmeta['width'] = $kgvid_postmeta['actualwidth'];
		}
		if ( empty( $kgvid_postmeta['height'] ) ) {
			$kgvid_postmeta['height'] = $kgvid_postmeta['actualheight'];
		}

		// Calculate aspect ratio
		if ( $kgvid_postmeta['width'] > 0 && $kgvid_postmeta['height'] > 0 ) {
			$aspect_ratio = $kgvid_postmeta['height'] / $kgvid_postmeta['width'];
		} else {
			$aspect_ratio = $options['height'] / $options['width'];
		}

		// Adjust dimensions for gallery
		if ( $gallery ) {
			if ( ! empty( $kgvid_postmeta['actualwidth'] ) ) {
				$kgvid_postmeta['width'] = $kgvid_postmeta['actualwidth'];
			}
			if ( $kgvid_postmeta['width'] > $options['gallery_width'] ) {
				$kgvid_postmeta['width'] = $options['gallery_width'];
			}
		} elseif ( intval( $kgvid_postmeta['width'] ) > intval( $options['width'] )
			|| $options['minimum_width'] === true
		) {
				$kgvid_postmeta['width'] = $options['width'];
		}

		// Calculate height based on aspect ratio
		$kgvid_postmeta['height'] = round( $kgvid_postmeta['width'] * $aspect_ratio );

		// Prepare dimensions for return
		$dimensions = array(
			'width'        => strval( $kgvid_postmeta['width'] ),
			'height'       => strval( $kgvid_postmeta['height'] ),
			'actualwidth'  => strval( $kgvid_postmeta['actualwidth'] ),
			'actualheight' => strval( $kgvid_postmeta['actualheight'] ),
		);

		return $dimensions;
	}
}
