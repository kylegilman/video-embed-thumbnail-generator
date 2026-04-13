<?php
/**
 * Admin options handler.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Options
 *
 * Loads, maintains, and validates all Videopack plugin settings.
 *
 * This class serves as the central manager for plugin options, handling
 * defaults, migrations from legacy versions, multisite overrides,
 * capabilities management, and integration with the WordPress Settings API
 * and REST API.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Options implements Hook_Subscriber {

	/**
	 * Default capabilities required for Videopack functions.
	 *
	 * @var array $default_capabilities
	 */
	protected $default_capabilities = array(
		'make_video_thumbnails'     => 'upload_files',
		'encode_videos'             => 'upload_files',
		'edit_others_video_encodes' => 'edit_others_posts',
	);

	/**
	 * Options array.
	 *
	 * @var array $options
	 */
	protected $options = array();

	/**
	 * Merged Options array (local + network).
	 *
	 * @var array $merged_options
	 */
	protected $merged_options = array();

	/**
	 * Default options array.
	 *
	 * @var array $default_options
	 */
	protected $default_options = array();

	/**
	 * Video player ID.
	 *
	 * @var int $video_player_id
	 */
	protected $video_player_id = 0;

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $formats_registry
	 */
	protected $formats_registry;

	/**
	 * Constructor.
	 */
	public function __construct() {}

	/**
	 * Returns an array of actions to register.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'init',
				'callback' => 'load_options',
			),
			array(
				'hook'     => 'admin_init',
				'callback' => 'register_videopack_options',
			),
			array(
				'hook'     => 'rest_api_init',
				'callback' => 'register_videopack_options',
			),
		);
	}

	/**
	 * Returns an array of filters to register.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array();
	}

	/**
	 * Returns default options.
	 *
	 * @return array Default options array.
	 */
	public function get_default() {
		$default_options = array(
			// General Settings.
			'embed_method'                  => 'Video.js',
			'hide_video_formats'            => true,
			'hide_thumbnails'               => false,
			'delete_child_thumbnails'       => false,
			'delete_child_encoded'          => true,
			'thumb_parent'                  => 'video',

			// FFmpeg & Encoding Settings.
			'app_path'                      => '',
			'ffmpeg_exists'                 => 'notchecked',
			'ffmpeg_error'                  => '',
			'replace_format'                => 'h264',
			'enable_custom_resolution'      => false,
			'custom_resolution'             => 900,
			'encode'                        => array(),
			'ffmpeg_watermark'              => array(
				'url'    => '',
				'scale'  => '50',
				'align'  => 'center',
				'valign' => 'center',
				'x'      => '0',
				'y'      => '0',
			),
			'ffmpeg_thumb_watermark'        => array(
				'url'    => '',
				'scale'  => '50',
				'align'  => 'center',
				'valign' => 'center',
				'x'      => '0',
				'y'      => '0',
			),
			'audio_bitrate'                 => 160,
			'audio_channels'                => true,
			'threads'                       => 1,
			'nice'                          => true,
			'h264_profile'                  => 'main',
			'h264_level'                    => '4.1',
			'h265_profile'                  => 'none',
			'h265_level'                    => 'none',
			'simultaneous_encodes'          => 1,
			'error_email'                   => 'nobody',
			'queue_control'                 => 'play',

			// Thumbnail Settings.
			'total_thumbnails'              => 4,
			'featured'                      => true,
			'browser_thumbnails'            => true,

			// Automation Settings.
			'auto_encode'                   => false,
			'auto_encode_gif'               => false,
			'auto_thumb'                    => false,
			'auto_thumb_number'             => 1,
			'auto_thumb_position'           => 50,
			'auto_publish_post'             => false,

			// Player Appearance & Behavior.
			'poster'                        => '',
			'watermark'                     => '',
			'watermark_styles'              => array(
				'scale'  => '10',
				'align'  => 'right',
				'valign' => 'bottom',
				'x'      => '5',
				'y'      => '7',
			),
			'watermark_link_to'             => 'home',
			'watermark_url'                 => '',
			'overlay_title'                 => true,
			'embedcode'                     => false,
			'downloadlink'                  => false,
			'click_download'                => true,
			'view_count'                    => false,
			'count_views'                   => 'start_complete',
			'embeddable'                    => true,
			'inline'                        => false,
			'align'                         => '',
			'width'                         => 960,
			'height'                        => 540,
			'legacy_dimensions'             => false,
			'fullwidth'                     => true,
			'fixed_aspect'                  => 'vertical',
			'skin'                          => 'vjs-theme-videopack',
			'right_click'                   => true,
			'resize'                        => true,
			'play_button_color'             => '',
			'play_button_icon_color'        => '',
			'control_bar_bg_color'          => '',
			'control_bar_color'             => '',

			// Player Controls & Playback.
			'nativecontrolsfortouch'        => false,
			'controls'                      => true,
			'autoplay'                      => false,
			'pauseothervideos'              => true,
			'loop'                          => false,
			'playsinline'                   => true,
			'volume'                        => 1.0,
			'muted'                         => false,
			'gifmode'                       => false,
			'preload'                       => 'metadata',
			'playback_rate'                 => false,
			'skip_buttons'                  => false,
			'skip_forward'                  => 10,
			'skip_backward'                 => 10,
			'endofvideooverlay'             => '',
			'endofvideooverlaysame'         => false,
			'auto_res'                      => 'automatic',
			'auto_codec'                    => 'h264',
			'pixel_ratio'                   => true,
			'find_formats'                  => false,

			// Gallery Settings.
			'gallery_orderby'               => 'menu_order',
			'enable_collection_video_limit' => false,
			'collection_video_limit'        => -1,
			'gallery_order'                 => 'asc',
			'gallery_columns'               => 3,
			'gallery_end'                   => '',
			'gallery_pagination'            => false,
			'gallery_per_page'              => 6,
			'gallery_title'                 => true,
			'gallery_align'                 => '',
			'title_color'                   => '',
			'title_background_color'        => '',
			'pagination_color'              => '',
			'pagination_background_color'   => '',
			'pagination_active_bg_color'    => '',
			'pagination_active_color'       => '',

			// Integration & Advanced.
			'capabilities'                  => array(),
			'open_graph'                    => false,
			'schema'                        => true,
			'oembed_provider'               => false,
			'htaccess_login'                => '',
			'htaccess_password'             => '',
			'alwaysloadscripts'             => false,
			'replace_video_shortcode'       => false,
			'replace_video_block'           => false,
			'replace_preview_video'         => true,
			'default_insert'                => 'Single Video',
			'rewrite_attachment_url'        => true,

			// Testing & Debug.
			'sample_codec'                  => 'h264',
			'sample_resolution'             => 360,
			'sample_rotate'                 => false,
		);

		foreach ( $this->default_capabilities as $videopack_capability => $wp_capability ) {
			$enabled_roles = (array) array_keys( $this->get_roles_with_capability( (string) $wp_capability ) );
			$default_options['capabilities'][ (string) $videopack_capability ] = (array) $this->get_all_roles_with_capability( $enabled_roles );
		}

		$registry     = new Formats\Registry( array() );
		$video_codecs = (array) $registry->get_video_codecs();
		$resolutions  = (array) $registry->get_video_resolutions();
		foreach ( $video_codecs as $codec ) {
			if ( ! $codec instanceof \Videopack\Admin\Formats\Codecs\Video_Codec ) {
				continue;
			}
			$codec_id                                      = (string) $codec->get_id();
			$default_options['encode'][ $codec_id ]['crf'] = (int) $codec->get_default_crf();
			$supported_rate_controls                       = (array) $codec->get_supported_rate_controls();
			$default_options['encode'][ $codec_id ]['rate_control'] = (string) ( $supported_rate_controls[0] ?? 'crf' );
			$default_options['encode'][ $codec_id ]['vbr']          = (int) $codec->get_default_vbr();
			$default_options['encode'][ $codec_id ]['enabled']      = (bool) $codec->is_default_encode();

			foreach ( $resolutions as $resolution ) {
				if ( ! $resolution instanceof \Videopack\Admin\Formats\Video_Resolution ) {
					continue;
				}
				$res_id = (string) $resolution->get_id();
				$default_options['encode'][ $codec_id ]['resolutions'][ $res_id ] = (bool) ( $codec->is_default_encode() && $resolution->is_default_encode() );
			}
		}

		return (array) apply_filters( 'videopack_default_options', $default_options );
	}

	/**
	 * Loads options from the database and initializes them if necessary.
	 */
	public function load_options() {
		$saved_options         = get_option( 'videopack_options' );
		$this->default_options = (array) $this->get_default();
		$this->options         = $this->default_options; // Prevent recursion if child objects call back into get_options().

		if ( false === $saved_options ) {
			$options = (array) $this->init_options( $this->default_options );
		} else {
			$options = (array) $this->merge_options_with_defaults( (array) $saved_options, $this->default_options );
		}

		if ( $options !== $saved_options ) {
			update_option( 'videopack_options', $options );
		}

		$this->options = $options;

		$this->formats_registry = new Formats\Registry( $this->options );

		do_action( 'videopack_options_loaded', $this );
	}

	/**
	 * Saves options to the database.
	 *
	 * @param array|null $options_to_save Optional. Options to save.
	 */
	public function save_options( array $options_to_save = null ) {
		$options_to_save = $options_to_save ?? $this->options;

		update_option( 'videopack_options', $options_to_save );

		if ( $options_to_save !== $this->options ) {
			$this->options = $options_to_save;
			if ( $this->formats_registry ) {
				$this->formats_registry = new Formats\Registry( $this->options );
			}
		}

		$this->merged_options = array();
	}

	/**
	 * Initialize the plugin options.
	 *
	 * @param array $current_default_options The current set of default options.
	 * @return array The initialized options array.
	 */
	private function init_options( array $current_default_options ) {
		$options_to_init = $current_default_options;
		$old_options     = get_option( 'kgvid_video_embed_options', array() );

		if ( is_array( $old_options ) && ! empty( $old_options ) ) {
			unset( $old_options['videojs_version'], $old_options['twitter_button'], $old_options['twitter_username'], $old_options['facebook_button'], $old_options['sample_format'] );

			if ( isset( $old_options['generate_thumbs'] ) ) {
				$old_options['total_thumbnails'] = (int) $old_options['generate_thumbs'];
				unset( $old_options['generate_thumbs'] );
			}

			if ( isset( $old_options['js_skin'] ) ) {
				$old_options['skin'] = (string) $old_options['js_skin'];
				unset( $old_options['js_skin'] );
			}

			if ( isset( $old_options['embed_method'] ) && 'Video.js v8' === $old_options['embed_method'] ) {
				$old_options['embed_method'] = 'Video.js';
			}

			if ( isset( $old_options['align'] ) && 'left' === $old_options['align'] ) {
				$old_options['align'] = 'none';
			}

			if ( isset( $old_options['overlay_embedcode'] ) ) {
				$old_options['embedcode'] = (bool) $old_options['overlay_embedcode'];
				unset( $old_options['overlay_embedcode'] );
			}

			$old_options['find_formats'] = true;

			if ( isset( $old_options['custom_format']['format'] ) ) {
				$format = (string) $old_options['custom_format']['format'];
				$height = (string) $old_options['custom_format']['height'];
				if ( ! isset( $options_to_init['encode'][ $format ] ) ) {
					$options_to_init['encode'][ $format ] = array( 'resolutions' => array() );
				}
				$options_to_init['encode'][ $format ]['resolutions'][ $height ] = true;

				$options_to_init['enable_custom_resolution'] = true;
				$options_to_init['custom_resolution']        = (int) $height;
				unset( $old_options['custom_format'] );
			}

			if ( isset( $old_options['rate_control'] ) ) {
				$registry     = new Formats\Registry( array() );
				$video_codecs = (array) $registry->get_video_codecs();
				foreach ( $video_codecs as $codec ) {
					$codec_id = (string) $codec->get_id();
					if ( in_array( (string) $old_options['rate_control'], (array) $codec->get_supported_rate_controls(), true ) ) {
						$options_to_init['encode'][ $codec_id ]['rate_control'] = (string) $old_options['rate_control'];
					}
				}
				unset( $old_options['rate_control'] );
			}

			unset( $old_options['bitrate_multiplier'] );

			if ( isset( $old_options['h264_CRF'] ) ) {
				$options_to_init['encode']['h264']['crf'] = (int) $old_options['h264_CRF'];
				unset( $old_options['h264_CRF'] );
			}
			if ( isset( $old_options['webm_CRF'] ) ) {
				$options_to_init['encode']['vp8']['crf'] = (int) $old_options['webm_CRF'];
				unset( $old_options['webm_CRF'] );
			}
			unset( $old_options['ogv_CRF'] );

			if ( isset( $old_options['delete_children'] ) ) {
				$options_to_init['delete_child_thumbnails'] = ( 'all' === $old_options['delete_children'] );
				$options_to_init['delete_child_encoded']    = ( 'all' === $old_options['delete_children'] || 'encoded videos only' === $old_options['delete_children'] );
				unset( $old_options['delete_children'] );
			}

			if ( isset( $old_options['gallery_thumb'] ) ) {
				$options_to_init['gallery_columns'] = (int) round( 1500 / (int) $old_options['gallery_thumb'] );
				unset( $old_options['gallery_thumb'] );
			}

			$options_to_init['legacy_dimensions'] = true;

			foreach ( $old_options as $key => &$value ) {
				if ( 'on' === $value ) {
					$value = true;
				} elseif ( 'off' === $value || '' === $value ) {
					$value = false;
				}
			}

			$options_to_init = (array) $this->merge_options_with_defaults( (array) $old_options, $options_to_init );
			delete_option( 'kgvid_video_embed_options' );
		}

		$this->set_capabilities( (array) ( $options_to_init['capabilities'] ?? array() ) );

		if ( ( $options_to_init['ffmpeg_exists'] ?? 'notchecked' ) === 'notchecked' ) {
			$ffmpeg_tester = new \Videopack\Admin\Encode\FFmpeg_Tester( $options_to_init );
			$ffmpeg_check  = $ffmpeg_tester->check_ffmpeg_exists( (string) ( $options_to_init['app_path'] ?? '' ) );
			if ( true === $ffmpeg_check['ffmpeg_exists'] ) {
				$options_to_init['ffmpeg_exists'] = true;
				$options_to_init['app_path']      = (string) $ffmpeg_check['app_path'];
				$options_to_init['ffmpeg_error']  = '';
			} else {
				$options_to_init['ffmpeg_exists'] = 'notinstalled';
				$options_to_init['ffmpeg_error']  = (string) $ffmpeg_check['ffmpeg_error'];
			}
		}

		return $options_to_init;
	}

	/**
	 * Filters options for REST API exposure, removing sensitive data for non-admins.
	 *
	 * @return array Filtered options.
	 */
	public function filter_options_for_rest() {
		$all_options = (array) $this->get_options();

		if ( current_user_can( 'manage_options' ) ) {
			return $all_options;
		}

		$unsafe_keys = array(
			'app_path',
			'error_email',
			'ffmpeg_watermark',
			'ffmpeg_thumb_watermark',
			'htaccess_login',
			'htaccess_password',
		);

		$safe_options = $all_options;
		foreach ( $unsafe_keys as $key ) {
			unset( $safe_options[ $key ] );
		}

		return $safe_options;
	}

	/**
	 * Registers Videopack settings with WordPress.
	 */
	public function register_videopack_options() {
		register_setting(
			'videopack_options',
			'videopack_options',
			array(
				'type'              => 'object',
				'sanitize_callback' => array( $this, 'validate_options' ),
				'show_in_rest'      => array(
					'schema'       => array(
						'type'       => 'object',
						'properties' => $this->settings_schema( (array) $this->get_default() ),
					),
					'get_callback' => array( $this, 'filter_options_for_rest' ),
				),
			)
		);
	}

	/**
	 * Generates a JSON-LD inspired schema for settings.
	 *
	 * @param array $options Options array to generate schema for.
	 * @return array The schema definition.
	 */
	public function settings_schema( array $options ) {
		$schema = array();

		foreach ( $options as $option => $value ) {
			$option = (string) $option;

			if ( in_array( $option, array( 'ffmpeg_thumb_watermark', 'ffmpeg_watermark', 'watermark_styles' ), true ) ) {
				$schema[ $option ] = array(
					'type'       => 'object',
					'properties' => array(
						'url'    => array( 'type' => 'string' ),
						'scale'  => array( 'type' => array( 'string', 'number' ) ),
						'align'  => array( 'type' => 'string' ),
						'valign' => array( 'type' => 'string' ),
						'x'      => array( 'type' => array( 'string', 'number' ) ),
						'y'      => array( 'type' => array( 'string', 'number' ) ),
					),
					'default'    => $value,
				);
				continue;
			}

			$att_type = 'string';
			if ( is_bool( $value ) || 'ffmpeg_exists' === $option ) {
				$att_type = array( 'boolean', 'string' );
			} elseif ( is_numeric( $value ) ) {
				$att_type = array( 'number', 'string' );
			}

			if ( is_array( $value ) ) {
				$schema[ $option ] = array(
					'type'                 => 'object',
					'properties'           => $this->settings_schema( (array) $value ),
					'additionalProperties' => true,
				);
			} else {
				$schema[ $option ] = array(
					'type'    => $att_type,
					'default' => $value,
				);
			}
		}
		return $schema;
	}

	/**
	 * Saves default options to the database.
	 */
	public function save_default_options() {
		$options_to_save = (array) $this->get_default();

		if ( ( $options_to_save['ffmpeg_exists'] ?? 'notchecked' ) === 'notchecked' ) {
			$ffmpeg_tester = new \Videopack\Admin\Encode\FFmpeg_Tester( $options_to_save );
			$ffmpeg_check  = $ffmpeg_tester->check_ffmpeg_exists( (string) ( $options_to_save['app_path'] ?? '' ) );
			if ( true === $ffmpeg_check['ffmpeg_exists'] ) {
				$options_to_save['ffmpeg_exists'] = true;
				$options_to_save['app_path']      = (string) $ffmpeg_check['app_path'];
				$options_to_save['ffmpeg_error']  = '';
			} else {
				$options_to_save['ffmpeg_exists'] = 'notinstalled';
				$options_to_save['ffmpeg_error']  = (string) $ffmpeg_check['ffmpeg_error'];
			}
		}

		update_option( 'videopack_options', $options_to_save );
		$this->load_options();
	}

	/**
	 * Returns all options.
	 *
	 * @return array The associative array of all Videopack options.
	 */
	public function get_options() {
		if ( empty( $this->options ) ) {
			$this->load_options();
		}

		if ( ! empty( $this->merged_options ) ) {
			return $this->merged_options;
		}

		$options = (array) $this->options;

		if ( \Videopack\Admin\Multisite::is_videopack_active_for_network() ) {
			$network_options = get_site_option( 'videopack_network_options' );

			if ( is_array( $network_options ) ) {
				if ( ! is_network_admin() && ( $network_options['queue_control'] ?? 'play' ) === 'play' && ( $options['queue_control'] ?? 'play' ) === 'pause' ) {
					$network_options['queue_control'] = 'pause';
				}
				$options = (array) array_merge( $options, $network_options );
			}
		}

		$this->merged_options = $options;

		// Ensure registry is using merged options.
		if ( $this->formats_registry ) {
			$this->formats_registry = new Formats\Registry( $this->merged_options );
		}

		return $options;
	}

	/**
	 * Returns the video formats registry instance.
	 *
	 * @return \Videopack\Admin\Formats\Registry
	 */
	public function get_formats_registry() {
		if ( ! $this->formats_registry ) {
			$this->formats_registry = new Formats\Registry( $this->get_options() );
		}
		return $this->formats_registry;
	}

	/**
	 * Returns available video codecs.
	 *
	 * @return \Videopack\Admin\Formats\Codecs\Video_Codec[] Array of codec objects.
	 */
	public function get_video_codecs() {
		return $this->get_formats_registry()->get_video_codecs();
	}

	/**
	 * Returns supported video resolutions.
	 *
	 * @return \Videopack\Admin\Formats\Video_Resolution[] Array of resolution objects.
	 */
	public function get_video_resolutions() {
		return $this->get_formats_registry()->get_video_resolutions();
	}

	/**
	 * Returns translated video resolution name.
	 *
	 * @param string $name The resolution name.
	 * @return string Translated name.
	 */
	public function get_resolution_l10n( $name ) {
		return $this->get_formats_registry()->get_resolution_l10n( $name );
	}

	/**
	 * Gets all available video formats.
	 *
	 * @param bool $hide_formats Optional. Whether to hide disabled formats (default false).
	 * @return \Videopack\Admin\Formats\Video_Format[] Available video formats.
	 */
	public function get_video_formats( $hide_formats = false ) {
		return $this->get_formats_registry()->get_video_formats( $hide_formats );
	}

	/**
	 * Sanitizes options recursively based on schema.
	 *
	 * @param mixed $input             Input to sanitize.
	 * @param array $schema_properties Optional. Schema properties for validation.
	 * @return mixed Sanitized input.
	 */
	public function sanitize_options_recursively( $input, $schema_properties = array() ) {
		return \Videopack\Common\Sanitizer::sanitize_options_recursively( $input, $schema_properties );
	}

	/**
	 * Validates options before saving them to the database.
	 *
	 * @param array $input The raw input options.
	 * @return array The validated options.
	 */
	public function validate_options( $input ) {
		if ( is_multisite() && ! is_super_admin() && \Videopack\Admin\Multisite::is_videopack_active_for_network() ) {
			$network_options = (array) \Videopack\Admin\Multisite::get_network_options();

			$input['simultaneous_encodes'] = $network_options['simultaneous_encodes'] ?? $input['simultaneous_encodes'];
			$input['threads']              = $network_options['threads'] ?? $input['threads'];
			$input['nice']                 = $network_options['nice'] ?? $input['nice'];
			$input['app_path']             = $network_options['app_path'] ?? $input['app_path'];
			$input['ffmpeg_exists']        = $network_options['ffmpeg_exists'] ?? $input['ffmpeg_exists'];

			if ( ! empty( $network_options['superadmin_only_ffmpeg_settings'] ) ) {
				$encoding_keys = array( 'hide_video_formats', 'error_email', 'ffmpeg_watermark', 'audio_bitrate', 'audio_channels', 'auto_encode', 'auto_encode_gif', 'auto_publish_post' );
				foreach ( $encoding_keys as $key ) {
					if ( isset( $this->options[ (string) $key ] ) ) {
						$input[ (string) $key ] = $this->options[ (string) $key ];
					}
				}

				if ( isset( $this->options['encode'] ) && is_array( $this->options['encode'] ) ) {
					$sanitized_encode = (array) $this->options['encode'];
					if ( isset( $input['encode'] ) && is_array( $input['encode'] ) ) {
						foreach ( $input['encode'] as $codec => $codec_settings ) {
							if ( isset( $codec_settings['enabled'] ) ) {
								$sanitized_encode[ (string) $codec ]['enabled'] = (bool) $codec_settings['enabled'];
							}
						}
					}
					$input['encode'] = $sanitized_encode;
				}
			}
		}

		$schema = (array) $this->settings_schema( (array) $this->get_default() );
		$input  = (array) \Videopack\Common\Sanitizer::sanitize_options_recursively( (array) $input, $schema );

		$ffmpeg_tester = new \Videopack\Admin\Encode\FFmpeg_Tester( $this->options, $this->get_formats_registry() );
		if ( (string) ( $input['app_path'] ?? '' ) !== (string) ( $this->options['app_path'] ?? '' ) || ( $input['ffmpeg_exists'] ?? '' ) === 'notchecked' ) {
			$input = (array) $this->validate_ffmpeg_settings( $input, $ffmpeg_tester );
		} else {
			$input['ffmpeg_exists'] = $this->options['ffmpeg_exists'] ?? 'notchecked';
			$input['ffmpeg_error']  = (string) ( $this->options['ffmpeg_error'] ?? '' );
		}

		if ( 'notinstalled' === ( $input['ffmpeg_exists'] ?? '' ) ) {
			$input['browser_thumbnails'] = true;
			$input['auto_encode']        = false;
			$input['auto_encode_gif']    = false;
		}

		if ( empty( $input['width'] ) ) {
			add_settings_error( 'video_embed_thumbnail_generator_settings', 'width-zero', (string) __( 'You must enter a value for the maximum video width.', 'video-embed-thumbnail-generator' ) );
			$input['width'] = (int) ( $this->options['width'] ?? 960 );
		}
		if ( empty( $input['height'] ) ) {
			add_settings_error( 'video_embed_thumbnail_generator_settings', 'height-zero', (string) __( 'You must enter a value for the maximum video height.', 'video-embed-thumbnail-generator' ) );
			$input['height'] = (int) ( $this->options['height'] ?? 540 );
		}

		if ( isset( $input['capabilities'] ) && is_array( $input['capabilities'] ) ) {
			if ( $input['capabilities'] !== ( $this->options['capabilities'] ?? array() ) ) {
				$input['capabilities'] = (array) $this->set_capabilities( $input['capabilities'] );
			}
		}

		if ( isset( $input['auto_thumb_number'] ) ) {
			$old_num = (int) ( $this->options['auto_thumb_number'] ?? 1 );
			$new_num = (int) $input['auto_thumb_number'];
			if ( 1 === $old_num && $new_num > 1 ) {
				$input['auto_thumb_position'] = (string) round( $new_num * ( (int) ( $this->options['auto_thumb_position'] ?? 50 ) / 100 ) );
				if ( '0' === $input['auto_thumb_position'] ) {
					$input['auto_thumb_position'] = '1';
				}
			} elseif ( $old_num > 1 && 1 === $new_num ) {
				$input['auto_thumb_position'] = (string) round( round( (int) ( $this->options['auto_thumb_position'] ?? 1 ) / $old_num * 4 ) / 4 * 100 );
				if ( '100' === $input['auto_thumb_position'] ) {
					$input['auto_thumb_position'] = '75';
				}
			}

			if ( $new_num > 1 && (int) $input['auto_thumb_position'] > $new_num ) {
				$input['auto_thumb_position'] = (string) $new_num;
			}
			if ( 0 === $new_num ) {
				$input['auto_thumb_number'] = $old_num;
			}
		}

		foreach ( $this->default_options as $key => $value ) {
			if ( ! array_key_exists( (string) $key, $input ) ) {
				$input[ (string) $key ] = false;
			}
		}

		if ( empty( $input['embeddable'] ) ) {
			$input['embedcode'] = false;
		}

		if ( isset( $input['collection_video_limit'] ) && 0 === (int) $input['collection_video_limit'] ) {
			$input['collection_video_limit'] = -1;
		}

		if ( empty( $input['queue_control'] ) ) {
			$input['queue_control'] = (string) ( $this->options['queue_control'] ?? 'play' );
		}

		if ( isset( $input['embed_method'] ) && 'WordPress Default' === $input['embed_method'] ) {
			$input['skin'] = 'vjs-theme-videopack';
		}

		$this->options = (array) $input;
		return $input;
	}

	/**
	 * Validates FFmpeg settings.
	 *
	 * @param array                                 $input         Raw input options.
	 * @param \Videopack\Admin\Encode\FFmpeg_Tester $ffmpeg_tester FFmpeg tester instance.
	 * @return array Validated input options.
	 */
	public function validate_ffmpeg_settings( array $input, \Videopack\Admin\Encode\FFmpeg_Tester $ffmpeg_tester ) {
		$ffmpeg_info = (array) $ffmpeg_tester->check_ffmpeg_exists( (string) ( $input['app_path'] ?? '' ) );

		if ( true === $ffmpeg_info['ffmpeg_exists'] ) {
			$input['ffmpeg_exists'] = true;
			$input['ffmpeg_error']  = '';
		} else {
			$input['ffmpeg_exists'] = 'notinstalled';
			$input['ffmpeg_error']  = (string) $ffmpeg_info['ffmpeg_error'];
		}

		$input['app_path'] = (string) $ffmpeg_info['app_path'];

		return (array) $input;
	}

	/**
	 * Gets WordPress roles that have a specific capability.
	 *
	 * @param string $capability The capability to check.
	 * @return array Roles with the capability.
	 */
	protected function get_roles_with_capability( $capability ) {
		$roles_with_capability = array();
		$wp_roles_instance     = wp_roles();

		if ( ! $wp_roles_instance instanceof \WP_Roles ) {
			return $roles_with_capability;
		}

		foreach ( (array) $wp_roles_instance->get_names() as $role_slug => $role_name ) {
			$role_object = $wp_roles_instance->get_role( (string) $role_slug );
			if ( $role_object instanceof \WP_Role && $role_object->has_cap( (string) $capability ) ) {
				$roles_with_capability[ (string) $role_slug ] = true;
			}
		}

		return $roles_with_capability;
	}

	/**
	 * Gets all roles and whether they have a specific capability.
	 *
	 * @param array $enabled_roles Roles that should have the capability.
	 * @return array All roles with boolean values indicating cap status.
	 */
	protected function get_all_roles_with_capability( $enabled_roles ) {
		$all_roles         = array();
		$wp_roles_instance = wp_roles();

		if ( ! $wp_roles_instance instanceof \WP_Roles ) {
			return $all_roles;
		}

		foreach ( (array) $wp_roles_instance->get_names() as $role_slug => $role_name ) {
			$all_roles[ (string) $role_slug ] = in_array( (string) $role_slug, (array) $enabled_roles, true );
		}

		return $all_roles;
	}

	/**
	 * Sets plugin capabilities for WordPress roles.
	 *
	 * @param array $capabilities The capabilities to set.
	 * @return array The cleaned capabilities.
	 */
	public function set_capabilities( array $capabilities ): array {
		$wp_roles               = wp_roles();
		$plugin_capability_keys = (array) array_keys( $this->default_capabilities );

		$clean_capabilities = array();
		foreach ( $capabilities as $capability => $roles ) {
			if ( is_array( $roles ) ) {
				$clean_capabilities[ (string) $capability ] = (array) array_filter(
					$roles,
					function ( $key ) {
						return is_string( $key );
					},
					ARRAY_FILTER_USE_KEY
				);
			}
		}

		if ( $wp_roles instanceof \WP_Roles ) {
			foreach ( (array) $wp_roles->roles as $role => $role_info ) {
				foreach ( $plugin_capability_keys as $capability ) {
					$enabled_roles          = (array) ( $clean_capabilities[ (string) $capability ] ?? array() );
					$has_capability         = ! empty( $role_info['capabilities'][ (string) $capability ] );
					$should_have_capability = ! empty( $enabled_roles[ (string) $role ] );

					if ( $should_have_capability && ! $has_capability ) {
						$wp_roles->add_cap( (string) $role, (string) $capability );
					} elseif ( ! $should_have_capability && $has_capability ) {
						$wp_roles->remove_cap( (string) $role, (string) $capability );
					}
				}
			}
		}
		return $clean_capabilities;
	}

	/**
	 * Merges saved options with default options.
	 *
	 * @param array $options         Saved options.
	 * @param array $default_options Default options.
	 * @return array Merged options.
	 */
	public function merge_options_with_defaults( array $options, array $default_options ) {
		foreach ( (array) array_keys( $options ) as $key ) {
			if ( ! array_key_exists( (string) $key, $default_options ) ) {
				unset( $options[ (string) $key ] );
			}
		}

		foreach ( $default_options as $key => $value ) {
			$key = (string) $key;
			if ( ! array_key_exists( $key, $options ) ) {
				$options[ $key ] = $value;
			} elseif ( is_array( $value ) ) {
				if ( ! isset( $options[ $key ] ) || ! is_array( $options[ $key ] ) ) {
					$options[ $key ] = $value;
				} else {
					$options[ $key ] = (array) $this->merge_options_with_defaults( (array) $options[ $key ], $value );
				}
			}
		}
		return (array) $options;
	}

	/**
	 * Gets the current video player ID.
	 *
	 * @return int The player ID.
	 */
	public function get_video_player_id() {
		return (int) $this->video_player_id;
	}

	/**
	 * Increments and returns the video player ID.
	 *
	 * @return int The new player ID.
	 */
	public function increment_video_player_id() {
		++$this->video_player_id;
		return (int) $this->video_player_id;
	}
}
