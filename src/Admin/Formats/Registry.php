<?php
/**
 * Video formats registry.
 *
 * @package Videopack
 */

namespace Videopack\Admin\Formats;

/**
 * Class Registry
 *
 * Central registry for video codecs, resolutions, and formats.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin/Formats
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Registry {

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Constructor.
	 *
	 * @param array $options Plugin options.
	 */
	public function __construct( array $options ) {
		$this->options = $options;
	}

	/**
	 * Returns available video codecs.
	 *
	 * @return \Videopack\Admin\Formats\Codecs\Video_Codec[] Array of codec objects.
	 */
	public function get_video_codecs() {
		$codecs = array(
			new Codecs\Video_Codec_H264(),
			new Codecs\Video_Codec_H265(),
			new Codecs\Video_Codec_VP8(),
			new Codecs\Video_Codec_VP9(),
			new Codecs\Video_Codec_AV1(),
		);

		return (array) apply_filters( 'videopack_video_codecs', $codecs );
	}

	/**
	 * Returns supported video resolutions.
	 *
	 * @return \Videopack\Admin\Formats\Video_Resolution[] Array of resolution objects.
	 */
	public function get_video_resolutions() {
		$resolutions = array();

		$resolution_properties = array(
			array(
				'id'             => 'fullres',
				'height'         => false,
				'name'           => 'Full Resolution',
				'label'          => 'Replace original (Full Resolution)',
				'default_encode' => false,
			),
			array(
				'height'         => 2160,
				'name'           => '4k UHD (2160p)',
				'default_encode' => true,
			),
			array(
				'height'         => 1440,
				'name'           => 'Quad HD (1440p)',
				'default_encode' => false,
			),
			array(
				'height'         => 1080,
				'name'           => 'Full HD (1080p)',
				'default_encode' => true,
			),
			array(
				'height'         => 720,
				'name'           => 'HD (720p)',
				'default_encode' => true,
			),
			array(
				'height'         => 540,
				'name'           => 'HD (540p)',
				'default_encode' => false,
			),
			array(
				'height'         => 480,
				'name'           => 'SD (480p)',
				'default_encode' => true,
			),
			array(
				'height'         => 360,
				'name'           => 'Low Def (360p)',
				'default_encode' => true,
			),
			array(
				'height'         => 240,
				'name'           => 'Ultra Low Def (240p)',
				'default_encode' => false,
			),
		);

		if ( ! empty( $this->options['enable_custom_resolution'] ) ) {
			$custom_height           = (int) ( $this->options['custom_resolution'] ?? 900 );
			$resolution_properties[] = array(
				'height'         => $custom_height,
				'name'           => 'Custom',
				'default_encode' => false,
				'is_custom'      => true,
			);
		}

		foreach ( $resolution_properties as $properties ) {
			$resolutions[] = new Video_Resolution( (array) $properties );
		}

		usort(
			$resolutions,
			function ( $a, $b ) {
				if ( 'fullres' === $a->get_id() ) {
					return -1;
				}
				if ( 'fullres' === $b->get_id() ) {
					return 1;
				}
				if ( (int) $a->get_height() === (int) $b->get_height() ) {
					return 0;
				}
				return ( (int) $a->get_height() > (int) $b->get_height() ) ? -1 : 1;
			}
		);

		return (array) apply_filters( 'videopack_video_resolutions', $resolutions );
	}

	/**
	 * Returns a specific video resolution by its ID.
	 *
	 * @param string $res_id The resolution ID to retrieve.
	 * @return \Videopack\Admin\Formats\Video_Resolution|null The resolution object if found, null otherwise.
	 */
	public function get_resolution( $res_id ) {
		$resolutions = $this->get_video_resolutions();
		foreach ( $resolutions as $resolution ) {
			if ( (string) $resolution->get_id() === (string) $res_id ) {
				return $resolution;
			}
		}

		return null;
	}

	/**
	 * Returns translated video resolution name.
	 *
	 * @param string $name The resolution name.
	 * @return string Translated name.
	 */
	public function get_resolution_l10n( $name ) {
		switch ( (string) $name ) {
			case 'Full Resolution':
				return (string) esc_html__( 'Full Resolution', 'video-embed-thumbnail-generator' );
			case 'Replace original (Full Resolution)':
				return (string) esc_html__( 'Replace original (Full Resolution)', 'video-embed-thumbnail-generator' );
			case '4k UHD (2160p)':
				return (string) esc_html__( '4k UHD (2160p)', 'video-embed-thumbnail-generator' );
			case 'Quad HD (1440p)':
				return (string) esc_html__( 'Quad HD (1440p)', 'video-embed-thumbnail-generator' );
			case 'Full HD (1080p)':
				return (string) esc_html__( 'Full HD (1080p)', 'video-embed-thumbnail-generator' );
			case 'HD (720p)':
				return (string) esc_html__( 'HD (720p)', 'video-embed-thumbnail-generator' );
			case 'HD (540p)':
				return (string) esc_html__( 'HD (540p)', 'video-embed-thumbnail-generator' );
			case 'SD (480p)':
				return (string) esc_html__( 'SD (480p)', 'video-embed-thumbnail-generator' );
			case 'Low Def (360p)':
				return (string) esc_html__( 'Low Def (360p)', 'video-embed-thumbnail-generator' );
			case 'Ultra Low Def (240p)':
				return (string) esc_html__( 'Ultra Low Def (240p)', 'video-embed-thumbnail-generator' );
			case 'Custom':
				if ( ! empty( $this->options['enable_custom_resolution'] ) ) {
					$custom_height = (int) ( $this->options['custom_resolution'] ?? 900 );
					return sprintf( /* translators: %s: Custom resolution height (e.g. 900). */ (string) esc_html__( 'Custom (%sp)', 'video-embed-thumbnail-generator' ), (string) $custom_height );
				}
				return (string) esc_html__( 'Custom', 'video-embed-thumbnail-generator' );
			default:
				return (string) apply_filters( 'videopack_resolution_l10n', $name );
		}
	}

	/**
	 * Gets all available video formats.
	 *
	 * @param bool $hide_formats Optional. Whether to hide disabled formats (default false).
	 * @return \Videopack\Admin\Formats\Video_Format[] Available video formats.
	 */
	public function get_video_formats( $hide_formats = false ) {
		$video_formats     = array();
		$video_resolutions = (array) $this->get_video_resolutions();
		$video_codecs      = (array) $this->get_video_codecs();
		$replace_format    = (string) ( $this->options['replace_format'] ?? 'none' );

		foreach ( $video_codecs as $codec ) {
			$codec_id = (string) $codec->get_id();
			if ( $hide_formats && ! empty( $this->options['hide_video_formats'] ) && empty( $this->options['encode'][ $codec_id ]['enabled'] ) ) {
				continue;
			}
			foreach ( $video_resolutions as $resolution ) {
				$res_id    = (string) $resolution->get_id();
				$format_id = $codec_id . '_' . $res_id;

				// Determine if this specific format replaces the original.
				$replaces_original = ( $format_id === $replace_format );

				// A format is enabled if explicitly checked in options OR if it is the designated replacement format.
				$enabled = (bool) ( $this->options['encode'][ $codec_id ]['resolutions'][ $res_id ] ?? false );
				if ( $format_id === $replace_format ) {
					$enabled = true;
				}

				$format                                      = new Video_Format( $codec, $resolution, $enabled, $replaces_original );
				$video_formats[ (string) $format->get_id() ] = $format;
			}
		}

		return $video_formats;
	}
}
