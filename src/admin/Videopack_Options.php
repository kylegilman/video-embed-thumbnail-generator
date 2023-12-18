<?php

namespace Videopack\admin;

class Videopack_Options {

	/**
	 * The single instance of the class.
	 *
	 * @var Videopack_Options
	 */
	private static $instance = null;

	/**
	 * Options array.
	 *
	 * @var array
	 */
	protected $options = array();

	/**
	 * Default options array.
	 *
	 * @var array
	 */
	protected $default_options = array();

	/**
	 * A private constructor; prevents direct creation of object.
	 */
	private function __construct() {
		$this->init_options();
	}

	/**
	 * Initialize the plugin options.
	 */
	private function init_options() {
		$options               = get_option( 'videopack_options' );
		$this->default_options = $this->set_default_options();
		$options               = $this->recursive_intersect_key( $options, $this->default_options );
		$options               = array_merge( $this->default_options, $options );
		$this->options         = $options;
	}

	public function register_setting() {

		$schema                 = $this->settings_schema( $this->default_options );
		$schema['encode_array'] = array(
			'type'    => 'array',
			'items'   => array(
				'type' => 'string',
			),
			'default' => array(),
		);

		register_setting(
			'videopack_options',
			'videopack_options',
			array(
				'type'              => 'object',
				'sanitize_callback' => array( $this, 'validate_options' ),
				'show_in_rest'      => array(
					'schema' => array(
						'type'       => 'object',
						'properties' => $schema,
					),
				),
			)
		);
	}

	protected function settings_schema( array $options ) {

		$schema = array();
		foreach ( $options as $option => $value ) {
			$att_type = 'string';
			if ( $value === 'on' ) {
				$value = true;
			}
			if ( $value === 'true' || $value === 'false' ) {
				$value = filter_var( $value, FILTER_VALIDATE_BOOLEAN );
			}
			if ( is_bool( $value )
				|| $option === 'ffmpeg_exists'
			) {
				$att_type = array( 'boolean', 'string' );
			}
			if ( is_numeric( $value ) ) {
				if ( is_string( $value ) ) {
					if ( filter_var( $value, FILTER_VALIDATE_INT )
						|| $value === '0'
					) {
						$value = intval( $value );
					} else {
						$value = floatval( $value );
					}
				}
				$att_type = array( 'number', 'string' );
			}
			if ( is_array( $value ) && ! empty( $value ) ) {
				$schema[ $option ] = array(
					'type'       => 'object',
					'properties' => kgvid_settings_schema( $value ),
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
	 * Returns default options.
	 *
	 * @return array
	 */
	protected function set_default_options() {

		$upload_capable      = $this->check_if_capable( 'upload_files' );
		$edit_others_capable = $this->check_if_capable( 'edit_others_posts' );

		$options = array(
			'videojs_version'         => '8.6.1',
			'embed_method'            => 'Video.js v8',
			'template'                => false,
			'template_gentle'         => true,
			'replace_format'          => 'h264',
			'custom_resolution'       => false,
			'hide_video_formats'      => true,
			'hide_thumbnails'         => false,
			'app_path'                => '',
			'ffmpeg_exists'           => 'notchecked',
			'generate_thumbs'         => 4,
			'featured'                => true,
			'thumb_parent'            => 'video',
			'delete_children'         => 'encoded videos only',
			'poster'                  => '',
			'watermark'               => '',
			'watermark_link_to'       => 'home',
			'watermark_url'           => '',
			'overlay_title'           => true,
			'overlay_embedcode'       => false,
			'facebook_button'         => false,
			'downloadlink'            => false,
			'click_download'          => true,
			'view_count'              => false,
			'count_views'             => 'start_complete',
			'embeddable'              => true,
			'inline'                  => false,
			'align'                   => 'left',
			'width'                   => '640',
			'height'                  => '360',
			'minimum_width'           => false,
			'fullwidth'               => true,
			'fixed_aspect'            => 'vertical',
			'gallery_width'           => 80,
			'gallery_columns'         => 4,
			'gallery_end'             => '',
			'gallery_pagination'      => false,
			'gallery_per_page'        => false,
			'gallery_title'           => true,
			'nativecontrolsfortouch'  => false,
			'controls'                => true,
			'autoplay'                => false,
			'pauseothervideos'        => true,
			'loop'                    => false,
			'playsinline'             => true,
			'volume'                  => 1,
			'muted'                   => false,
			'gifmode'                 => false,
			'preload'                 => 'metadata',
			'playback_rate'           => false,
			'skip_buttons'            => false,
			'skip_forward'            => 10,
			'skip_backward'           => 10,
			'endofvideooverlay'       => false,
			'endofvideooverlaysame'   => false,
			'skin'                    => 'kg-video-js-skin',
			'js_skin'                 => 'kg-video-js-skin',
			'custom_attributes'       => '',
			'bitrate_multiplier'      => 0.1,
			'h264_CRF'                => '23',
			'audio_bitrate'           => 160,
			'audio_channels'          => true,
			'threads'                 => 1,
			'nice'                    => true,
			'browser_thumbnails'      => true,
			'rate_control'            => 'crf',
			'h264_profile'            => 'baseline',
			'h264_level'              => '3.0',
			'auto_encode'             => false,
			'auto_encode_gif'         => false,
			'auto_thumb'              => false,
			'auto_thumb_number'       => 1,
			'auto_thumb_position'     => 50,
			'right_click'             => true,
			'resize'                  => true,
			'auto_res'                => 'automatic',
			'pixel_ratio'             => true,
			'capabilities'            => array(
				'make_video_thumbnails'     => $upload_capable,
				'encode_videos'             => $upload_capable,
				'edit_others_video_encodes' => $edit_others_capable,
			),
			'open_graph'              => false,
			'schema'                  => true,
			'twitter_card'            => false,
			'oembed_provider'         => false,
			'htaccess_login'          => '',
			'htaccess_password'       => '',
			'sample_format'           => 'mobile',
			'sample_rotate'           => false,
			'ffmpeg_thumb_watermark'  => array(
				'url'    => '',
				'scale'  => '50',
				'align'  => 'center',
				'valign' => 'center',
				'x'      => '0',
				'y'      => '0',
			),
			'ffmpeg_watermark'        => array(
				'url'    => '',
				'scale'  => '9',
				'align'  => 'right',
				'valign' => 'bottom',
				'x'      => '6',
				'y'      => '5',
			),
			'simultaneous_encodes'    => 1,
			'error_email'             => 'nobody',
			'alwaysloadscripts'       => false,
			'replace_video_shortcode' => false,
			'default_insert'          => 'Single Video',
			'rewrite_attachment_url'  => 'on',
			'auto_publish_post'       => false,
			'transient_cache'         => false,
			'queue_control'           => 'play',
			'encode_array'            => array(),
		);

		$video_codecs = $this->get_video_codecs();
		$resolutions  = $this->get_video_resolutions();
		foreach ( $video_codecs as $codec ) {
			$options['encode'][ $codec->get_id() ]['crf'] = $codec->get_default_crf();
			$options['encode'][ $codec->get_id() ]['vbr'] = $codec->get_default_vbr();
			foreach ( $resolutions as $resolution => $resolution_details ) {
				if ( $codec->get_default_encode() && $resolution_details['default_encode'] ) {
					$options['encode'][ $codec->get_id() ]['resolutions'][ $resolution ] = true;
				} else {
					$options['encode'][ $codec->get_id() ]['resolutions'][ $resolution ] = false;
				}
			}
		}

		return apply_filters( 'videopack_default_options', $options );
	}

	public function save_default_options() {
		// add default values for options

		if ( $this->options === 'notchecked' ) {

			$ffmpeg_check = kgvid_check_ffmpeg_exists( $options, false );
			if ( true == $ffmpeg_check['ffmpeg_exists'] ) {
				$options['ffmpeg_exists'] = true;
				$options['app_path']      = $ffmpeg_check['app_path'];
			} else {
				$options['ffmpeg_exists'] = 'notinstalled';
			}

		}

		update_option( 'videopack_options', $options );

	}

	/**
	 * Returns all options.
	 *
	 * @return array
	 */
	public function get_options() {
		return $this->options;
	}

	/**
	 * Returns available video codecs.
	 *
	 * @return array
	 */
	public function get_video_codecs() {

		$codecs = array(
			new codec\Video_Codec_H264(),
			new codec\Video_Codec_H265(),
			new codec\Video_Codec_VP9(),
			new codec\Video_Codec_AV1(),
		);

		return apply_filters( 'videopack_video_codecs', $codecs );
	}

	/**
	 * Returns supported video resolutions.
	 *
	 * @return array
	 */
	public function get_video_resolutions() {
		$resolutions = array(
			2160 => array(
				'name'           => esc_html__( '4K UHD (2160p)', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( '2160p', 'video-embed-thumbnail-generator' ),
				'default_encode' => true,
			),
			1440 => array(
				'name'           => esc_html__( 'Quad HD (1440p)', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( '1440p', 'video-embed-thumbnail-generator' ),
				'default_encode' => false,
			),
			1080 => array(
				'name'           => esc_html__( 'Full HD (1080p)', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( '1080p', 'video-embed-thumbnail-generator' ),
				'default_encode' => true,
			),
			720  => array(
				'name'           => esc_html__( 'HD (720p)', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( '720p', 'video-embed-thumbnail-generator' ),
				'default_encode' => true,
			),
			540  => array(
				'name'           => esc_html__( 'HD (540p)', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( '540p', 'video-embed-thumbnail-generator' ),
				'default_encode' => false,
			),
			480  => array(
				'name'           => esc_html__( 'SD (480p)', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( '480p', 'video-embed-thumbnail-generator' ),
				'default_encode' => true,
			),
			360  => array(
				'name'           => esc_html__( 'Low Definition (360p)', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( '360p', 'video-embed-thumbnail-generator' ),
				'default_encode' => true,
			),
			240  => array(
				'name'           => esc_html__( 'Ultra Low Definition (240p)', 'video-embed-thumbnail-generator' ),
				'label'          => esc_html__( '240p', 'video-embed-thumbnail-generator' ),
				'default_encode' => false,
			),
		);

		if ( is_array( $this->options ) && $this->options['custom_resolution'] ) {
			$resolutions[ $this->options['custom_resolution'] ] = array(
				/* translators: %s is the height of a video. Example: 'Custom (1080p)' */
				'name'           => sprintf( esc_html__( 'Custom (%sp)', 'video-embed-thumbnail-generator' ), strval( $this->options['custom_resolution'] ) ),
				/* translators: %s is the height of a video. Example: '1080p' */
				'label'          => sprintf( esc_html__( '%sp', 'video-embed-thumbnail-generator' ), strval( $this->options['custom_resolution'] ) ),
				'default_encode' => false,
			);
		}

		krsort( $resolutions );

		return apply_filters( 'videopack_video_resolutions', $resolutions );
	}

	public function validate_options( $input ) {
		// validate & sanitize input from settings API

		$input = kgvid_sanitize_text_field( $input ); // recursively sanitizes all the settings

		if ( $input['app_path'] != $this->options['app_path'] ) {
			$input = kgvid_validate_ffmpeg_settings( $input );
		} else {
			$input['ffmpeg_exists'] = $this->options['ffmpeg_exists'];
		}

		if ( $input['ffmpeg_exists'] === 'notinstalled' ) {
			$input['browser_thumbnails'] = true; // in case a user had FFmpeg installed and disabled it, they can't choose to disable browser thumbnails if it's no longer installed
			$input['auto_encode']        = false;
			$input['auto_encode_gif']    = false;
			$input['auto_thumb']         = false;
		}

		if ( empty( $input['width'] ) ) {
			add_settings_error( 'video_embed_thumbnail_generator_settings', 'width-zero', esc_html__( 'You must enter a value for the maximum video width.', 'video-embed-thumbnail-generator' ) );
			$input['width'] = $this->options['width'];
		}
		if ( empty( $input['height'] ) ) {
			add_settings_error( 'video_embed_thumbnail_generator_settings', 'height-zero', esc_html__( 'You must enter a value for the maximum video height.', 'video-embed-thumbnail-generator' ) );
			$input['height'] = $this->options['height'];
		}
		if ( empty( $input['gallery_width'] ) ) {
			add_settings_error( 'video_embed_thumbnail_generator_settings', 'gallery-width-zero', esc_html__( 'You must enter a value for the maximum gallery video width.', 'video-embed-thumbnail-generator' ) );
			$input['gallery_width'] = $this->options['gallery_width'];
		}

		if ( array_key_exists( 'capabilities', $input ) && is_array( $input['capabilities'] ) && $input['capabilities'] !== $this->options['capabilities'] ) {
			kgvid_set_capabilities( $input['capabilities'] );
		}

		if ( ! array_key_exists( 'transient_cache', $input ) && $this->options['transient_cache'] == true ) {
			kgvid_delete_transients();
		} //if user is turning off transient cache option

		if ( array_key_exists( 'auto_thumb_number', $input ) ) {
			if ( intval( $this->options['auto_thumb_number'] ) == 1 && intval( $input['auto_thumb_number'] ) > 1 ) {
				$input['auto_thumb_position'] = strval( round( intval( $input['auto_thumb_number'] ) * ( intval( $this->options['auto_thumb_position'] ) / 100 ) ) );
				if ( $input['auto_thumb_position'] == '0' ) {
					$input['auto_thumb_position'] = '1';
				}
			}
			if ( intval( $this->options['auto_thumb_number'] ) > 1 && intval( $input['auto_thumb_number'] ) == 1 ) {
				// round to the nearest 25 but not 100
				$input['auto_thumb_position'] = strval( round( round( intval( $this->options['auto_thumb_position'] ) / intval( $this->options['auto_thumb_number'] ) * 4 ) / 4 * 100 ) );
				if ( $input['auto_thumb_position'] == '100' ) {
					$input['auto_thumb_position'] = '75';
				}
			}

			if ( intval( $input['auto_thumb_number'] ) > 1 && intval( $input['auto_thumb_position'] ) > intval( $input['auto_thumb_number'] ) ) {
				$input['auto_thumb_position'] = $input['auto_thumb_number'];
			}

			if ( intval( $input['auto_thumb_number'] ) == 0 ) {
				$input['auto_thumb_number'] = $this->options['auto_thumb_number'];
			}
		}

		// load all settings and make sure they get a value of false if they weren't entered into the form
		foreach ( $this->default_options as $key => $value ) {
			if ( ! array_key_exists( $key, $input ) ) {
				$input[ $key ] = false;
			}
		}

		if ( $input['embeddable'] == false ) {
			$input['overlay_embedcode'] = false;
		}

		if ( ! $input['queue_control'] ) { // don't reset queue control when saving settings
			$input['queue_control'] = $this->options['queue_control'];
		}

		// since this isn't user selectable it has to be re-entered every time
		$input['videojs_version'] = $this->default_options['videojs_version'];

		$this->options = $input;

		return $input;
	}

	protected function check_if_capable( $capability ) {

		$wp_roles = wp_roles();
		$capable  = array();

		if ( is_object( $wp_roles ) && property_exists( $wp_roles, 'roles' ) ) {

			foreach ( $wp_roles->roles as $role => $role_info ) {
				if ( is_array( $role_info['capabilities'] )
					&& array_key_exists( $capability, $role_info['capabilities'] )
					&& $role_info['capabilities'][ $capability ] == 1
				) {
					$capable[ $role ] = true;
				} else {
					$capable[ $role ] = false;
				}
			}
		}

		return $capable;
	}

	protected function set_capabilities( $capabilities ) {

		$wp_roles = wp_roles();

		if ( is_object( $wp_roles ) && property_exists( $wp_roles, 'roles' ) ) {

			foreach ( $this->default_options['capabilities'] as $default_capability => $default_enabled ) {
				if ( is_array( $capabilities ) && ! array_key_exists( $default_capability, $capabilities ) ) {
					$capabilities[ $default_capability ] = array();
				}
			}

			foreach ( $capabilities as $capability => $enabled_roles ) {
				foreach ( $wp_roles->roles as $role => $role_info ) { // check all roles
					if ( is_array( $role_info['capabilities'] ) && ! array_key_exists( $capability, $role_info['capabilities'] ) && array_key_exists( $role, $enabled_roles ) && $enabled_roles[ $role ] == true ) {
						$wp_roles->add_cap( $role, $capability );
					}
					if ( is_array( $role_info['capabilities'] ) && array_key_exists( $capability, $role_info['capabilities'] ) && ! array_key_exists( $role, $enabled_roles ) ) {
						$wp_roles->remove_cap( $role, $capability );
					}
				}
			}
		}//end if
	}

	/**
	 * Recursively intersects keys of two arrays.
	 *
	 * @param array $options_array Array to be filtered.
	 * @param array $default_array Default array with keys to keep.
	 * @return array Filtered array.
	 */
	protected function recursive_intersect_key( $options_array, $default_array ) {

		$result = array();

		foreach ( $default_array as $key => $value ) {
			if ( array_key_exists( $key, $options_array ) ) {
				if ( is_array( $options_array[ $key ] ) && is_array( $value ) ) {
					// Recursive call if both elements are arrays
					$result[ $key ] = $this->recursive_intersect_key( $options_array[ $key ], $value );
				} else {
					// Direct assignment if not arrays
					$result[ $key ] = $options_array[ $key ];
				}
			}
		}

		return $result;
	}

	/**
	 * Ensures only one instance of the class is loaded or can be loaded.
	 *
	 * @return Videopack_Options
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

}
