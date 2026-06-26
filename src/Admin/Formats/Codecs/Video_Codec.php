<?php
/**
 * Video Codec Base Class
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats\Codecs;

/**
 * Base class for a video codec.
 */
class Video_Codec {
	/**
	 * Codec name.
	 *
	 * @var string
	 */
	protected $name;

	/**
	 * Codec label.
	 *
	 * @var string
	 */
	protected $label;

	/**
	 * Codec unique identifier.
	 *
	 * @var string
	 */
	protected $id;

	/**
	 * Container format.
	 *
	 * @var string
	 */
	protected $container;

	/**
	 * MIME type.
	 *
	 * @var string
	 */
	protected $mime_type;

	/**
	 * Codec string.
	 *
	 * @var string
	 */
	protected $codecs_att;

	/**
	 * Video codec library.
	 *
	 * @var string|array
	 */
	protected $vcodec;

	/**
	 * Audio codec library.
	 *
	 * @var string
	 */
	protected $acodec;

	/**
	 * Rate control settings.
	 *
	 * @var array
	 */
	protected $rate_control;

	/**
	 * Supported rate control methods.
	 *
	 * @var array
	 */
	protected $supported_rate_controls;

	/**
	 * Default encoding flag.
	 *
	 * @var bool
	 */
	protected $default_encode;

	/**
	 * Whether this is a standard video codec.
	 *
	 * @var bool
	 */
	protected $is_video;

	/**
	 * Codec efficiency priority score (higher is more efficient).
	 *
	 * Used to sort play sources so modern, highly efficient codecs (AV1, HEVC)
	 * are prioritized by browsers over legacy fallback codecs (H.264).
	 *
	 * @var int
	 */
	protected $efficiency;

	/**
	 * Constructor for Video_Codec.
	 *
	 * @param array $properties Associative array of codec properties and values.
	 */
	public function __construct( array $properties ) {
		$this->name                    = $properties['name'] ?? 'Video';
		$this->label                   = $properties['label'] ?? 'Video';
		$this->id                      = $properties['id'] ?? 'h264';
		$this->container               = $properties['container'] ?? 'mp4';
		$this->mime_type               = $properties['mime'] ?? 'video/mp4';
		$this->codecs_att              = $properties['codecs_att'] ?? 'avc1';
		$this->efficiency              = $properties['efficiency'] ?? 0;
		$this->vcodec                  = $properties['vcodec'] ?? 'libx264';
		$this->acodec                  = $properties['acodec'] ?? 'aac';
		$this->rate_control            = $properties['rate_control'] ?? array(
			'crf' => array(
				'min'     => 0,
				'max'     => 51,
				'default' => 23,
			),
			'vbr' => array(
				'default'  => 10.0,
				'constant' => 0,
			),
		);
		$this->supported_rate_controls = $properties['supported_rate_controls'] ?? array( 'crf', 'vbr' );
		$this->default_encode          = $properties['default_encode'] ?? false;
		$this->is_video                = $properties['is_video'] ?? true;
	}

	/**
	 * Returns whether this codec produces standard video output.
	 *
	 * @return bool True if video, false otherwise.
	 */
	public function is_video() {
		return $this->is_video;
	}

	/**
	 * Retrieves all codec properties as an associative array.
	 *
	 * @return array Associative array of codec properties.
	 */
	public function get_properties() {
		return array(
			'name'                    => $this->name,
			'label'                   => $this->label,
			'id'                      => $this->id,
			'container'               => $this->container,
			'mime_type'               => $this->mime_type,
			'codecs_att'              => $this->codecs_att,
			'vcodec'                  => $this->vcodec,
			'acodec'                  => $this->acodec,
			'rate_control'            => $this->rate_control,
			'supported_rate_controls' => $this->supported_rate_controls,
			'default_encode'          => $this->default_encode,
		);
	}

	/**
	 * Get the codec name.
	 *
	 * @return string Codec name.
	 */
	public function get_name() {
		return $this->name;
	}

	/**
	 * Get the codec label.
	 *
	 * @return string Codec label.
	 */
	public function get_label() {
		return $this->label;
	}

	/**
	 * Get the codec unique identifier.
	 *
	 * @return string Codec unique identifier.
	 */
	public function get_id() {
		return $this->id;
	}

	/**
	 * Get the container format.
	 *
	 * @return string Container format.
	 */
	public function get_container() {
		return $this->container;
	}

	/**
	 * Get the MIME type.
	 *
	 * @return string MIME type.
	 */
	public function get_mime_type() {
		return $this->mime_type;
	}

	/**
	 * Get the codec efficiency priority score.
	 *
	 * @return int Codec efficiency score.
	 */
	public function get_efficiency(): int {
		return (int) $this->efficiency;
	}

	/**
	 * Get the codec string.
	 *
	 * @return string Codec string.
	 */
	public function get_codecs_att() {
		return $this->codecs_att;
	}

	/**
	 * Get the video codec.
	 *
	 * @param array $codecs Optional. Associative array of available FFmpeg encoders.
	 * @return string Video codec.
	 */
	public function get_vcodec( array $codecs = null ) {
		if ( is_array( $this->vcodec ) ) {
			if ( ! empty( $codecs ) ) {
				foreach ( $this->vcodec as $codec ) {
					if ( ! empty( $codecs[ $codec ] ) ) {
						return $codec;
					}
				}
			}
			return reset( $this->vcodec );
		}
		return $this->vcodec;
	}

	/**
	 * Get the list of preferred AAC encoders.
	 *
	 * @return array List of AAC encoding libraries.
	 */
	protected function aac_encoders() {

		$aac_array = array(
			'libfdk_aac', // Generally highest quality.
			'aac',        // FFmpeg's native AAC encoder.
			'libfaac',
		);

		/**
		 * Filter the preferred FFMPEG AAC encoders.
		 *
		 * @param array $aac_array List of AAC encoding libraries.
		 */
				/**
		 * Filters the supported FFmpeg AAC audio encoders array.
		 *
		 * @since 5.0.0
		 *
		 * @param array $aac_array List of encoder string identifiers (e.g. 'aac', 'libfdk_aac').
		 */
		return apply_filters( 'videopack_aac_encoders', $aac_array );
	}

	/**
	 * Get the audio codec.
	 *
	 * @param array $codecs Optional. Associative array of available FFmpeg encoders.
	 * @return string Audio codec.
	 */
	public function get_acodec( array $codecs = null ) {

		$audio_codec = $this->acodec;

		if ( ! empty( $codecs ) ) {
			if ( $this->acodec == 'aac' ) {
				$aac_array = $this->aac_encoders();
				foreach ( $aac_array as $preferred_aaclib ) {
					if ( ! empty( $codecs[ $preferred_aaclib ] ) && $codecs[ $preferred_aaclib ] === true ) {
						$audio_codec = $preferred_aaclib;
						break;
					}
				}
			} elseif ( $this->acodec == 'libopus'
				&& ( ! array_key_exists( 'libopus', $codecs ) || ! $codecs['libopus'] )
			) {
				$audio_codec = 'libvorbis';
			}
		}
		return $audio_codec;
	}

	/**
	 * Get the rate control settings.
	 *
	 * @return array Rate control settings.
	 */
	public function get_rate_control() {
		return $this->rate_control;
	}

	/**
	 * Get the default CRF value.
	 *
	 * @return float Rate control settings.
	 */
	public function get_default_crf() {
		return $this->rate_control['crf']['default'];
	}

	/**
	 * Get the default VBR value.
	 *
	 * @return float Rate control settings.
	 */
	public function get_default_vbr() {
		return $this->rate_control['vbr']['default'];
	}

	/**
	 * Get the default encoding flag.
	 *
	 * @return bool Default encoding flag.
	 */
	public function is_default_encode() {
		return $this->default_encode;
	}

	/**
	 * Get the supported rate controls.
	 *
	 * @return array Supported rate controls.
	 */
	public function get_supported_rate_controls() {
		return $this->supported_rate_controls;
	}

	/**
	 * Calculates and returns the bitrate based on width and height.
	 *
	 * @param array $dimensions    Associative array with 'width' and 'height'.
	 * @param float $rate_control  Optional. The rate control value.
	 * @return float The calculated bitrate.
	 */
	public function get_bitrate( array $dimensions, $rate_control = null ) {
		return round(
			( ( $rate_control ?? $this->rate_control['vbr']['default'] )
			* 0.0001
			* $dimensions['width'] * $dimensions['height'] )
			+ $this->rate_control['vbr']['constant']
		);
	}

	/**
	 * Get FFmpeg CRF flags for this codec.
	 *
	 * @param array $plugin_options The global plugin options.
	 * @return array An array of FFmpeg flags.
	 */
	protected function get_ffmpeg_crf_flags( array $plugin_options ) {
			$crf_flags   = array();
			$crf_flags[] = '-crf';
			$crf_flags[] = $plugin_options['encode'][ $this->id ]['crf'];
			return $crf_flags;
	}

	/**
	 * Get FFmpeg VBR flags for this codec.
	 *
	 * @param array $plugin_options The global plugin options.
	 * @param array $dimensions     Associative array with 'width' and 'height'.
	 * @return array An array of FFmpeg flags.
	 */
	protected function get_ffmpeg_vbr_flags( $plugin_options, array $dimensions ) {
			$vbr_flags   = array();
			$vbr_flags[] = '-b:v';
			$vbr_flags[] = max( 100, $this->get_bitrate( $dimensions, $plugin_options['encode'][ $this->id ]['vbr'] ) ) . 'k';
			return $vbr_flags;
	}

	/**
	 * Get FFmpeg rate control flags (CRF or VBR) for this codec.
	 *
	 * @param array      $plugin_options The global plugin options.
	 * @param array|null $dimensions     Optional. Associative array with 'width' and 'height'.
	 * @return array An array of FFmpeg flags.
	 */
	protected function get_ffmpeg_rate_control_flags( array $plugin_options, array $dimensions = null ) {
		$rate_control = $plugin_options['encode'][ $this->id ]['rate_control'] ?? $plugin_options['rate_control'];
		if ( 'crf' === $rate_control ) {
			return $this->get_ffmpeg_crf_flags( $plugin_options );
		} elseif ( 'vbr' === $rate_control ) {
			return $this->get_ffmpeg_vbr_flags( $plugin_options, $dimensions );
		}
		return array();
	}

	/**
	 * Get codec-specific FFmpeg flags.
	 *
	 * @param array $plugin_options The global plugin options.
	 * @param array $dimensions     Associative array with 'width' and 'height'.
	 * @param array $codecs Associative array of available FFmpeg encoders.
	 * @return array An array of FFmpeg flags.
	 */
	public function get_codec_ffmpeg_flags( array $plugin_options, array $dimensions, array $codecs ): array {

		$flags   = array();
		$flags[] = '-acodec';
		$flags[] = $this->get_acodec( $codecs );
		$flags[] = '-vcodec';
		$flags[] = $this->get_vcodec( $codecs );

		$flags = array_merge( $flags, $this->get_ffmpeg_rate_control_flags( $plugin_options, $dimensions ) );

		$flags[] = '-s';
		$flags[] = $dimensions['width'] . 'x' . $dimensions['height'];

		if ( $this->container === 'mp4' ) {
			$flags[] = '-movflags';
			$flags[] = 'faststart';

			// Set the video tag for better compatibility, e.g. hvc1 for H.265.
			$flags[] = '-tag:v';
			$flags[] = $this->get_codecs_att();
		}

		return $flags;
	}

	/**
	 * Get the target bitrate for this codec based on plugin options and dimensions.
	 *
	 * @param array $dimensions    Dimensions array.
	 * @param array $plugin_options Plugin options.
	 * @param bool  $alternate      Whether this job should be handled by another service (Cloud, etc).
	 * @return int Target bitrate in kbps.
	 */
	public function get_configured_bitrate( array $dimensions, array $plugin_options, bool $alternate = false ): int {
		$codec_id = $this->get_id();
		$vbr      = $plugin_options['encode'][ $codec_id ]['vbr'] ?? null;
		$vbr      = apply_filters( 'videopack_video_codec_vbr', $vbr, $this, $dimensions, $plugin_options, $alternate );

		return (int) max( 100, $this->get_bitrate( $dimensions, $vbr ) );
	}

	/**
	 * Get the configured rate control mode (crf or vbr).
	 *
	 * @param array $plugin_options Options array.
	 * @param bool  $alternate      Whether this is an alternate (e.g. cloud) encode.
	 * @return string
	 */
	public function get_configured_rate_control_mode( array $plugin_options, bool $alternate = false ): string {
		$codec_id = $this->get_id();
		$mode     = (string) ( $plugin_options['encode'][ $codec_id ]['rate_control'] ?? $plugin_options['rate_control'] ?? 'crf' );
		return (string) apply_filters( 'videopack_video_codec_rate_control_mode', $mode, $this, $plugin_options, $alternate );
	}

	/**
	 * Get the configured quality (CRF) value.
	 *
	 * @param array $plugin_options Options array.
	 * @param bool  $alternate      Whether this is an alternate (e.g. cloud) encode.
	 * @return float
	 */
	public function get_configured_quality( array $plugin_options, bool $alternate = false ): float {
		$codec_id = $this->get_id();
		$crf      = (float) ( $plugin_options['encode'][ $codec_id ]['crf'] ?? $this->get_default_crf() );
		return (float) apply_filters( 'videopack_video_codec_quality', $crf, $this, $plugin_options, $alternate );
	}
}
