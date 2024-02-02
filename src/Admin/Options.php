<?php

namespace Videopack\Admin;

class Options {

	/**
	 * The single instance of the class.
	 *
	 * @var Videopack
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
	private function __construct() { }

	/**
	 * Returns default options.
	 *
	 * @return array
	 */
	public function get_default() {

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

	public function load_options() {

		$saved_options         = get_option( 'videopack_options', array() );
		$this->default_options = $this->get_default();

		if ( ! $saved_options ) { // this is the first time the plugin has run, or they're reset to defaults
			$options = $this->init_options();
		} else {
			$options = $this->merge_options_with_defaults( $saved_options, $this->default_options );
		}

		if ( $options !== $saved_options ) {
			update_option( 'videopack_options', $options );
		}

		$this->options = $options;
	}

	/**
	 * Initialize the plugin options.
	 */
	private function init_options() {

		$old_options = get_option( 'kgvid_video_embed_options', array() );

		if ( $old_options ) {
			delete_option( 'kgvid_video_embed_options' );
		}

		$this->set_capabilities( $this->default_options['capabilities'] );

		return $this->merge_options_with_defaults( $old_options, $this->default_options );
	}

	public function register_videopack_options() {

		register_setting(
			'videopack_options',
			'videopack_options',
			array(
				'type'              => 'object',
				'sanitize_callback' => array( $this, 'validate_options' ),
				'show_in_rest'      => array(
					'schema' => array(
						'type'       => 'object',
						'properties' => $this->settings_schema( $this->default_options ),
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
					'properties' => $this->settings_schema( $value ),
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

	public function save_default_options() {
		// add default values for options

		if ( $this->options['ffmpeg_exists'] === 'notchecked' ) {

			$ffmpeg_check = $this->check_ffmpeg_exists( $this->options, false );
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
		if ( ! $this->options ) {
			$this->load_options();
		}
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

	public function get_video_formats() {

		$video_formats = array();

		if ( is_array( $this->options['encode'] ) ) {

			$video_resolutions = $this->get_video_resolutions();

			foreach ( $this->options['encode'] as $codec => $codec_details ) {

				$video_formats[ $codec ] = array();

				foreach ( $codec_details['resolutions'] as $resolution => $enabled ) {

					if ( $enabled ) {

						$video_formats[ $codec ][ $resolution ] = $video_resolutions[ $resolution ];
					}
				}
			}
		}

		return $video_formats;
	}

	public function validate_options( $input ) {
		// validate & sanitize input from settings API

		$input = \Videopack\Common\Validate::text_field( $input ); // recursively sanitizes all the settings

		if ( $input['app_path'] != $this->options['app_path'] ) {
			$input = $this->validate_ffmpeg_settings( $input );
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
			$this->set_capabilities( $input['capabilities'] );
		}

		if ( ! array_key_exists( 'transient_cache', $input ) && $this->options['transient_cache'] == true ) {
			(new Cleanup)->delete_transients();
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

	public function validate_ffmpeg_settings( $input ) {

		$ffmpeg_info = $this->check_ffmpeg_exists( $input, false );
		if ( $ffmpeg_info['ffmpeg_exists'] === true ) {
			$input['ffmpeg_exists'] = true;
		}
		$input['app_path'] = $ffmpeg_info['app_path'];

		if ( $ffmpeg_info['proc_open_enabled'] == false ) {
			if ( is_admin() ) {
				add_settings_error( 'video_embed_thumbnail_generator_settings', 'ffmpeg-disabled', esc_html__( 'proc_open is disabled in PHP settings. You can embed existing videos and make thumbnails with compatible browsers, but video encoding will not work. Contact your System Administrator to find out if you can enable proc_open.', 'video-embed-thumbnail-generator' ), 'updated' );
			}
			$input['ffmpeg_exists'] = 'notinstalled';
		} elseif ( $ffmpeg_info['ffmpeg_exists'] === false ) {

			$textarea = '';
			if ( count( $ffmpeg_info['output'] ) > 2 ) {
				$textarea = '<br /><textarea rows="3" cols="70" disabled style="resize: none;">' . esc_textarea( implode( "\n", $ffmpeg_info['output'] ) ) . '</textarea>';
			}
			/* %s is the path to the application. */
			if ( is_admin() ) {
				add_settings_error( 'video_embed_thumbnail_generator_settings', 'ffmpeg-disabled', sprintf( esc_html__( 'FFmpeg is not executing correctly at %s. You can embed existing videos and make thumbnails with compatible browsers, but video encoding is not possible without FFmpeg', 'video-embed-thumbnail-generator' ), esc_html( $input['app_path'] ) ) . '<br /><br />' . esc_html__( 'Error message:', 'video-embed-thumbnail-generator' ) . ' ' . esc_textarea( implode( ' ', array_slice( $ffmpeg_info['output'], -2, 2 ) ) ) . $textarea, 'updated' );
			}
			$input['ffmpeg_exists'] = 'notinstalled';
		}

		return $input;
	}

	public function check_ffmpeg_exists( $options, $save ) {

		$proc_open_enabled = false;
		$ffmpeg_exists     = false;
		$output            = array();
		$function          = '';
		$uploads           = wp_upload_dir();
		$test_path         = rtrim( $options['app_path'], '/' );
		$ffmpeg_thumbnails = new \Videopack\Admin\Thumbnails\FFmpeg_Thumbnails();

		if ( function_exists( 'proc_open' ) ) {

			$proc_open_enabled = true;

			$ffmpeg_test = $ffmpeg_thumbnails->process_thumb(
				plugin_dir_path( __DIR__ ) . 'images/Adobestock_469037984.mp4',
				$uploads['path'] . '/ffmpeg_exists_test.jpg',
				$test_path
			);

			if ( ! file_exists( $uploads['path'] . '/ffmpeg_exists_test.jpg' )
				&& substr( $test_path, -6 ) == 'ffmpeg'
			) { // if FFmpeg has not executed successfully

				$test_path = substr( $test_path, 0, -7 );

				$ffmpeg_test = $ffmpeg_thumbnails->process_thumb(
					plugin_dir_path( __DIR__ ) . 'images/Adobestock_469037984.mp4',
					$uploads['path'] . '/ffmpeg_exists_test.jpg',
					$test_path
				);

			}

			if ( file_exists( $uploads['path'] . '/ffmpeg_exists_test.jpg' ) ) { // FFMEG has executed successfully
				$ffmpeg_exists = true;
				wp_delete_file( $uploads['path'] . '/ffmpeg_exists_test.jpg' );
				$options['app_path'] = $test_path;
			}

			$output = explode( "\n", $ffmpeg_test );

		}

		if ( $save ) {

			if ( $ffmpeg_exists === true ) {
				$options['ffmpeg_exists'] = true;
			} else {
				$options['ffmpeg_exists']      = 'notinstalled';
				$options['browser_thumbnails'] = true; // if FFmpeg isn't around, this should be enabled
			}

			update_option( 'kgvid_video_embed_options', $options );

		}

		$arr = array(
			'proc_open_enabled' => $proc_open_enabled,
			'ffmpeg_exists'     => $ffmpeg_exists,
			'output'            => $output,
			'function'          => $function,
			'app_path'          => $options['app_path'],
		);

		return $arr;
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

	public function set_capabilities( array $capabilities ) {

		$wp_roles = wp_roles();

		if ( is_object( $wp_roles )
			&& property_exists( $wp_roles, 'roles' )
		) {

			foreach ( $this->default_options['capabilities'] as $default_capability => $default_enabled ) {
				if ( is_array( $capabilities )
					&& ! array_key_exists( $default_capability, $capabilities )
				) {
					$capabilities[ $default_capability ] = array();
				}
			}

			foreach ( $capabilities as $capability => $enabled_roles ) {
				foreach ( $wp_roles->roles as $role => $role_info ) { // check all roles
					if ( is_array( $role_info['capabilities'] )
						&& ! array_key_exists( $capability, $role_info['capabilities'] )
						&& array_key_exists( $role, $enabled_roles )
						&& $enabled_roles[ $role ] == true
					) {
						$wp_roles->add_cap( $role, $capability );
					}
					if ( is_array( $role_info['capabilities'] )
						&& array_key_exists( $capability, $role_info['capabilities'] )
						&& ! array_key_exists( $role, $enabled_roles )
					) {
						$wp_roles->remove_cap( $role, $capability );
					}
				}
			}
		}//end if
	}

	public function videopack_get_capable_users( string $capability ) {

		$authorized_users = array();

		if ( is_array( $this->options['capabilities'] )
			&& array_key_exists( $capability, $this->options['capabilities'] )
		) {
			$users = get_users(
				array(
					'role__in' => array_keys( $this->options['capabilities'][ $capability ] ),
				)
			);
			if ( $users ) {
				foreach ( $users as $user ) {
					$authorized_users[ $user->user_login ] = $user->ID;
				}
			}
		}
		return $authorized_users;
	}

	public function merge_options_with_defaults( array $options, array $default_options ) {

		foreach ( $default_options as $key => $value ) {
			// Check if the key exists in $options. If not, set it to the default value
			if ( ! array_key_exists( $key, $options ) ) {
				$options[ $key ] = $value;
			} elseif ( is_array( $value ) && ( ! isset( $options[ $key ] ) || is_array( $options[ $key ] ) ) ) {
				if ( ! isset( $options[ $key ] ) ) {
					$options[ $key ] = array();
				}
				$options[ $key ] = $this->merge_options_with_defaults( $options[ $key ], $value );
			}
			// If the key exists in $options and it's not an array, retain the existing value in $options
		}
		return $options;
	}

	/**
	 * Ensures only one instance of the class is loaded or can be loaded.
	 *
	 * @return Options
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}
}
