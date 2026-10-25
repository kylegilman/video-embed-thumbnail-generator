<?php
/**
 * VP8 Video Codec Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats\Codecs;

/**
 * Class Video_Codec_VP8
 *
 * Represents the VP8 video codec.
 */
class Video_Codec_VP8 extends Video_Codec {
	/**
	 * Video_Codec_VP8 constructor.
	 */
	public function __construct() {
		$properties = array(
			'name'           => 'VP8 WEBM',
			'label'          => 'VP8',
			'id'             => 'vp8',
			'container'      => 'webm',
			'mime'           => 'video/webm',
			'codecs_att'     => 'vp08',
			'efficiency'     => 10,
			'vcodec'         => 'libvpx',
			'acodec'         => 'libvorbis',
			'rate_control'   => array(
				'crf' => array(
					'min'     => 4,
					'max'     => 63,
					'default' => 10,
				),
				'vbr' => array(
					'default'     => 1.0,
					'coefficient' => 0.004404,
					'exponent'    => 0.92,
				),
			),
			'default_encode' => false,
		);

		parent::__construct( $properties );
	}

	/**
	 * Returns the CMAF/HLS codec string for VP8.
	 *
	 * @return string The codec string.
	 */
	public function get_cmaf_codec_string() {
		return 'vp08.00.10.08,mp4a.40.2';
	}

	/**
	 * Returns CRF flags with the bitrate ceiling libvpx requires.
	 *
	 * The libvpx VP8 encoder ignores -crf unless -b:v is also given: without it every
	 * CRF value produces byte-identical output. With it, -crf sets the quality
	 * and -b:v acts as the maximum bitrate. The ceiling is three times the
	 * codec's default bitrate for the output size, so it stays out of the way of
	 * the quality the CRF asks for and only stops a runaway.
	 *
	 * @param array      $plugin_options The global plugin options.
	 * @param array|null $dimensions     Optional. Associative array with 'width' and 'height'.
	 * @return array An array of FFmpeg flags.
	 */
	protected function get_ffmpeg_crf_flags( array $plugin_options, array $dimensions = null ) {
		$dimensions = $dimensions ?? array(
			'width'  => 1920,
			'height' => 1080,
		);

		$flags   = parent::get_ffmpeg_crf_flags( $plugin_options, $dimensions );
		$flags[] = '-b:v';
		$flags[] = round( $this->get_bitrate( $dimensions ) * 3 ) . 'k';

		return $flags;
	}
}
