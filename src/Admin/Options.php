<?php

namespace Videopack\Admin;

/**
 * Loads and maintains all Videopack plugin settings
 */
class Options {

	/**
	 * Video player.
	 * @var string $embed_method
	 */
	public $embed_method = 'Video.js';

	/**
	 * Whether to use a custom template for video output.
	 * @var bool $template
	 */
	public $template = false;

	/**
	 * Enable gentle template failover if the custom template is missing.
	 * @var bool $template_gentle
	 */
	public $template_gentle = true;

	/**
	 * List of enabled video encode formats.
	 * @var array $encode
	 */
	public $encode = array();

	/**
	 * Default video codec to replace the original video file.
	 * @var string $replace_format
	 */
	public $replace_format = 'h264';

	/**
	 * Allow custom video resolutions.
	 * @var bool|int $custom_resolution
	 */
	public $custom_resolution = false;

	/**
	 * Hide child video formats in the Admin area.
	 * @var bool $hide_video_formats
	 */
	public $hide_video_formats = true;

	/**
	 * Hide generated thumbnails in the Admin area.
	 * @var bool $hide_thumbnails
	 */
	public $hide_thumbnails = false;

	/**
	 * Path to the FFmpeg application.
	 * @var string $app_path
	 */
	public $app_path = '';

	/**
	 * Is FFmpeg installed and working.
	 * @var string|bool $ffmpeg_exists
	 */
	public $ffmpeg_exists = 'notchecked';

	/**
	 * Default number of thumbnails to generate.
	 * @var int $generate_thumbs
	 */
	public $generate_thumbs = 4;

	/**
	 * Set generated thumbnail as post's featured thumbnail.
	 * @var bool $featured
	 */
	public $featured = true;

	/**
	 * Parent post type for video thumbnails.
	 * @var string $thumb_parent
	 */
	public $thumb_parent = 'video';

	/**
	 * Criteria for deleting associated media upon video deletion.
	 * @var string $delete_children
	 */
	public $delete_children = 'encoded videos only';

	/**
	 * Default poster image URL for videos.
	 * @var string $poster
	 */
	public $poster = '';

	/**
	 * Watermark image URL.
	 * @var string $watermark
	 */
	public $watermark = '';

	/**
	 * Link target for the watermark.
	 * @var string $watermark_link_to
	 */
	public $watermark_link_to = 'home';

	/**
	 * Custom link target for the watermark.
	 * @var string $watermark_url
	 */
	public $watermark_url = '';

	/**
	 * Overlay video title on the player.
	 * @var bool $overlay_title
	 */
	public $overlay_title = true;

	/**
	 * Enable embedding code overlay on the player.
	 * @var bool $overlay_embedcode
	 */
	public $overlay_embedcode = false;

	/**
	 * Enable a download link for the video.
	 * @var bool $downloadlink
	 */
	public $downloadlink = false;

	/**
	 * Enable single-click download methods.
	 * @var bool $click_download
	 */
	public $click_download = true;

	/**
	 * Show view count below video.
	 * @var bool $view_count
	 */
	public $view_count = false;

	/**
	 * Level of view count tracking. Acceptable values are 'start_complete', 'quarters', 'start', 'none'.
	 * @var string $count_views
	 */
	public $count_views = 'start_complete';

	/**
	 * Allow videos to be embedded on other sites.
	 * @var bool $embeddable
	 */
	public $embeddable = true;

	/**
	 * Allow content on the left and right side of videos.
	 * @var bool $inline
	 */
	public $inline = true;

	/**
	 * Default alignment for the video player. Acceptable values are 'left', 'center', 'right'.
	 * @var string $align
	 */
	public $align = 'left';

	/**
	 * Default width for the video player.
	 * @var int $width
	 */
	public $width = 960;

	/**
	 * Default height for the video player.
	 * @var int $height
	 */
	public $height = 540;

	/**
	 * Fixed aspect ratio setting for the video player. Acceptable values are true, false, and 'vertical'.
	 * @var bool|string $fixed_aspect
	 */
	public $fixed_aspect = 'vertical';

	/**
	 * Width of the gallery thumbnail images.
	 * @var int $gallery_width
	 */
	public $gallery_width = 80;

	/**
	 * Number of columns in video galleries.
	 * @var int $gallery_columns
	 */
	public $gallery_columns = 4;

	/**
	 * Custom content to display at the end of video galleries.
	 * @var string $gallery_end
	 */
	public $gallery_end = '';

	/**
	 * Enable pagination for video galleries.
	 * @var bool $gallery_pagination
	 */
	public $gallery_pagination = false;

	/**
	 * Number of videos per page in galleries.
	 * @var bool $gallery_per_page
	 */
	public $gallery_per_page = false;

	/**
	 * Display titles in video galleries.
	 * @var bool $gallery_title
	 */
	public $gallery_title = true;

	/**
	 * Use native controls for touch devices.
	 * @var bool $nativecontrolsfortouch
	 */
	public $nativecontrolsfortouch = false;

	/**
	 * Show player controls.
	 * @var bool $controls
	 */
	public $controls = true;

	/**
	 * Autoplay videos.
	 * @var bool $autoplay
	 */
	public $autoplay = false;

	/**
	 * Pause other videos when a new video is played.
	 * @var bool $pauseothervideos
	 */
	public $pauseothervideos = true;

	/**
	 * Loop video playback.
	 * @var bool $loop
	 */
	public $loop = false;

	/**
	 * Play videos inline on mobile devices.
	 * @var bool $playsinline
	 */
	public $playsinline = true;

	/**
	 * Initial volume of the video player.
	 * @var float $volume
	 */
	public $volume = 1.0;

	/**
	 * Start videos in muted state.
	 * @var bool $muted
	 */
	public $muted = false;

	/**
	 * Enable GIF mode for videos.
	 * @var bool $gifmode
	 */
	public $gifmode = false;

	/**
	 * Preload setting for videos.
	 * @var string $preload
	 */
	public $preload = 'metadata';

	/**
	 * Enable playback rate control.
	 * @var bool $playback_rate
	 */
	public $playback_rate = false;

	/**
	 * Enable skip buttons in the player.
	 * @var bool $skip_buttons
	 */
	public $skip_buttons = false;

	/**
	 * Time to skip forward in seconds.
	 * @var int $skip_forward
	 */
	public $skip_forward = 10;

	/**
	 * Time to skip backward in seconds.
	 * @var int $skip_backward
	 */
	public $skip_backward = 10;

	/**
	 * Show image at the end of videos.
	 * @var bool $endofvideooverlay
	 */
	public $endofvideooverlay = false;

	/**
	 * Display the poster image at the end of videos.
	 * @var bool $endofvideooverlaysame
	 */
	public $endofvideooverlaysame = false;

	/**
	 * Skin class for the video player.
	 * @var string $skin
	 */
	public $skin = 'kg-video-js-skin';

	/**
	 * Bitrate multiplier for encoding.
	 * @var float $bitrate_multiplier
	 */
	public $bitrate_multiplier = 0.1;

	/**
	 * Audio bitrate for encoding in kbps.
	 * @var int $audio_bitrate
	 */
	public $audio_bitrate = 160;

	/**
	 * Always encode stereo audio.
	 * @var bool $audio_channels
	 */
	public $audio_channels = true;

	/**
	 * Number of threads for video processing.
	 * @var int $threads
	 */
	public $threads = 1;

	/**
	 * Adjust process priority for video encoding.
	 * @var bool $nice
	 */
	public $nice = true;

	/**
	 * Use browser technology to generate thumbnails instead of FFmpeg.
	 * @var bool $browser_thumbnails
	 */
	public $browser_thumbnails = true;

	/**
	 * Rate control method for video encoding.
	 * @var string $rate_control
	 */
	public $rate_control = 'crf';

	/**
	 * H.264 profile for video encoding.
	 * @var string $h264_profile
	 */
	public $h264_profile = 'baseline';

	/**
	 * H.264 level for video encoding.
	 * @var string $h264_level
	 */
	public $h264_level = '3.0';

	/**
	 * Automatically encode videos upon upload.
	 * @var bool $auto_encode
	 */
	public $auto_encode = false;

	/**
	 * Automatically convert GIFs to video upon upload.
	 * @var bool $auto_encode_gif
	 */
	public $auto_encode_gif = false;

	/**
	 * Automatically generate thumbnails for videos.
	 * @var bool $auto_thumb
	 */
	public $auto_thumb = false;

	/**
	 * Number of thumbnails to automatically generate.
	 * @var int $auto_thumb_number
	 */
	public $auto_thumb_number = 1;

	/**
	 * Position within video for automatic thumbnail generation.
	 * @var int $auto_thumb_position
	 */
	public $auto_thumb_position = 50;

	/**
	 * Enable right-click on video player.
	 * @var bool $right_click
	 */
	public $right_click = true;

	/**
	 * Enable video resizing.
	 * @var bool $resize
	 */
	public $resize = true;

	/**
	 * Default video playback resolution. Acceptable values are 'automatic', 'highest', 'lowest'.
	 * @var string $auto_res
	 */
	public $auto_res = 'automatic';

	/**
	 * Enable adjustment for high dpi displays (pixel ratio) when automatically setting playback resolution.
	 * @var bool $pixel_ratio
	 */
	public $pixel_ratio = true;

	/**
	 * Default capabilities required for Videopack functions.
	 * @var array $default_capabilities
	 */
	protected $default_capabilities = array(
		'make_video_thumbnails'     => 'upload_files',
		'encode_videos'             => 'upload_files',
		'edit_others_video_encodes' => 'edit_others_posts',
	);

	/**
	 * Enabled capabilities required for Videopack functions.
	 * @var array $capabilities
	 */
	public $capabilities = array();

	/**
	 * Enable Open Graph tags for videos.
	 * @var bool $open_graph
	 */
	public $open_graph = false;

	/**
	 * Enable Schema.org markup for videos.
	 * @var bool $schema
	 */
	public $schema = true;

	/**
	 * Enable oEmbed provider functionality.
	 * @var bool $oembed_provider
	 */
	public $oembed_provider = false;

	/**
	 * Login for .htaccess protected directories.
	 * @var string $htaccess_login
	 */
	public $htaccess_login = '';

	/**
	 * Password for .htaccess protected directories.
	 * @var string $htaccess_password
	 */
	public $htaccess_password = '';

	/**
	 * Sample codec for video encoding.
	 * @var string $sample_codec
	 */
	public $sample_codec = 'h264';

	/**
	 * Sample resolution for video encoding.
	 * @var string $sample_resolution
	 */
	public $sample_resolution = 360;

	/**
	 * Test FFmpeg encode settings on a vertical video.
	 * @var bool $sample_rotate
	 */
	public $sample_rotate = false;

	/**
	 * Watermark settings for thumbnail generation with FFmpeg.
	 * @var Option_Watermark $ffmpeg_thumb_watermark
	 */
	public $ffmpeg_thumb_watermark;

	/**
	 * Watermark settings for video encoding with FFmpeg.
	 * @var Option_Watermark $ffmpeg_watermark
	 */
	public $ffmpeg_watermark;

	/**
	 * Maximum number of simultaneous video encoding processes.
	 * @var int $simultaneous_encodes
	 */
	public $simultaneous_encodes = 1;

	/**
	 * Email address to receive error notifications.
	 * @var string $error_email
	 */
	public $error_email = 'nobody';

	/**
	 * Always load video player scripts, regardless of post content.
	 * @var bool $alwaysloadscripts
	 */
	public $alwaysloadscripts = false;

	/**
	 * Replace the default WordPress [video] shortcode with the Videopack player.
	 * @var bool $replace_video_shortcode
	 */
	public $replace_video_shortcode = false;

	/**
	 * Default method for inserting videos into posts. Acceptable values are 'Single Video', 'Video Gallery', 'WordPress Default'.
	 * @var string $default_insert
	 */
	public $default_insert = 'Single Video';

	/**
	 * Enable rewriting of attachment URLs.
	 * @var string $rewrite_attachment_url
	 */
	public $rewrite_attachment_url = true;

	/**
	 * Automatically publish posts after video processing.
	 * @var bool $auto_publish_post
	 */
	public $auto_publish_post = false;

	/**
	 * Enable transient caching for URL to Attachment ID lookups.
	 * @var bool $transient_cache
	 */
	public $transient_cache = false;

	/**
	 * Control behavior for video encoding queue. Acceptable values are 'play' and 'pause'
	 * @var string $queue_control
	 */
	public $queue_control = 'play';

	/**
	 * Options array.
	 *
	 * @var array $options
	 */
	protected $options = array();

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

	public function __construct() {}

	/**
	 * Returns default options.
	 *
	 * @return array
	 */
	public function get_default() {

		$default_options = array();

		try {
			// Create a ReflectionClass object for the current class.
			// Using 'static' ensures this works correctly even if the class is extended,
			// and this method is called from the child class (it will reflect the child).
			$reflection = new \ReflectionClass( static::class );

			// Get all public properties of the class.
			$properties = $reflection->getProperties( \ReflectionProperty::IS_PUBLIC );

			// Get default property values (works for properties with explicitly defined defaults).
			$default_property_values = $reflection->getDefaultProperties();

			foreach ( $properties as $property ) {
				$property_name = $property->getName();
				// Ensure the property has a default value defined in getDefaultProperties.
				// This is generally true for public properties with initial values.
				if ( array_key_exists( $property_name, $default_property_values ) ) {
					$default_options[ $property_name ] = $default_property_values[ $property_name ];
				}
			}
		} catch ( \ReflectionException $e ) {
			return array(); // Return empty array on error.
		}

		foreach ( $this->default_capabilities as $videopack_capability => $wp_capability ) {
			$default_options['capabilities'][ $videopack_capability ] = $this->get_roles_with_capability( $wp_capability );
		}

		$default_options['ffmpeg_thumb_watermark'] = new Option_Watermark();
		$default_options['ffmpeg_watermark']       = new Option_Watermark();

		$video_codecs = $this->get_video_codecs();
		$resolutions  = $this->get_video_resolutions();
		foreach ( $video_codecs as $codec ) {
			$default_options['encode'][ $codec->get_id() ]['crf'] = $codec->get_default_crf();
			$default_options['encode'][ $codec->get_id() ]['vbr'] = $codec->get_default_vbr();
			foreach ( $resolutions as $resolution ) {
				if ( $codec->is_default_encode() && $resolution->is_default_encode() ) {
					$default_options['encode'][ $codec->get_id() ]['resolutions'][ $resolution->get_id() ] = true;
				} else {
					$default_options['encode'][ $codec->get_id() ]['resolutions'][ $resolution->get_id() ] = false;
				}
			}
		}

		/**
		 * Filters the default options.
		 * @param array $default_options Array of default options.
		 */
		return apply_filters( 'videopack_default_options', $default_options );
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

		foreach ( $options as $key => $value ) {
			if ( property_exists( $this, $key ) ) {
				$this->$key = $value;
			}
		}
	}

	public function save_options() {
		update_option( 'videopack_options', $options );
	}

	/**
	 * Initialize the plugin options.
	 */
	private function init_options() {

		$old_options = get_option( 'kgvid_video_embed_options', array() );

		if ( $old_options ) {
			delete_option( 'kgvid_video_embed_options' );
		}

		$this->set_capabilities( $this->default_capabilities );

		if ( $this->ffmpeg_exists === 'notchecked' ) {

			$ffmpeg_check = $this->check_ffmpeg_exists( $this->options, false );
			if ( true == $ffmpeg_check['ffmpeg_exists'] ) {
				$options['ffmpeg_exists'] = true;
				$options['app_path']      = $ffmpeg_check['app_path'];
			} else {
				$options['ffmpeg_exists'] = 'notinstalled';
			}
		}

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

		if ( $this->ffmpeg_exists === 'notchecked' ) {

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
			new Formats\Codecs\Video_Codec_H264(),
			new Formats\Codecs\Video_Codec_H265(),
			new Formats\Codecs\Video_Codec_VP9(),
			new Formats\Codecs\Video_Codec_AV1(),
		);

		/**
		 * Filters the available video codecs.
		 * @param \Videopack\Admin\Formats\Codecs\Video_Codec[] $codecs Array of Videopack\Admin\Formats\Codecs\Video_Codec objects.
		 */
		return apply_filters( 'videopack_video_codecs', $codecs );
	}

	/**
	 * Returns supported video resolutions.
	 *
	 * @return array
	 */
	public function get_video_resolutions() {

		$resolutions = array();

		$resolution_properties = array(
			array(
				'id'             => 'fullres',
				'height'         => false,
				'name'           => esc_html__( 'Full Resolution', 'video-embed-thumbnail-generator' ),
				'label'          => false,
				'default_encode' => false,
			),
			array(
				'height'         => 2160,
				'name'           => esc_html__( '4K UHD (2160p)', 'video-embed-thumbnail-generator' ),
				'default_encode' => true,
			),
			array(
				'height'         => 1440,
				'name'           => esc_html__( 'Quad HD (1440p)', 'video-embed-thumbnail-generator' ),
				'default_encode' => false,
			),
			array(
				'height'         => 1080,
				'name'           => esc_html__( 'Full HD (1080p)', 'video-embed-thumbnail-generator' ),
				'default_encode' => true,
			),
			array(
				'height'         => 720,
				'name'           => esc_html__( 'HD (720p)', 'video-embed-thumbnail-generator' ),
				'default_encode' => true,
			),
			array(
				'height'         => 540,
				'name'           => esc_html__( 'HD (540p)', 'video-embed-thumbnail-generator' ),
				'default_encode' => false,
			),
			array(
				'height'         => 480,
				'name'           => esc_html__( 'SD (480p)', 'video-embed-thumbnail-generator' ),
				'default_encode' => true,
			),
			array(
				'height'         => 360,
				'name'           => esc_html__( 'Low Definition (360p)', 'video-embed-thumbnail-generator' ),
				'default_encode' => true,
			),
			array(
				'height'         => 240,
				'name'           => esc_html__( 'Ultra Low Definition (240p)', 'video-embed-thumbnail-generator' ),
				'default_encode' => false,
			),
		);

		if ( $this->custom_resolution ) {
			$resolution_properties[] = array(
				'height'         => $this->custom_resolution,
				/* translators: %s is the height of a custom video resolution. Example: 'Custom (4320p)' */
				'name'           => sprintf( esc_html__( 'Custom (%sp)', 'video-embed-thumbnail-generator' ), strval( $this->custom_resolution ) ),
				'default_encode' => false,
			);
		}

		foreach ( $resolution_properties as $properties ) {
			$resolutions[] = new Formats\Video_Resolution( $properties );
		}

		//sort so highest resolution is first
		usort(
			$resolutions,
			function ( $a, $b ) {
				if ( $a->get_height() == $b->get_height() ) {
					return 0;
				}
				return ( $a->get_height() > $b->get_height() ) ? -1 : 1;
			}
		);

		/**
		 * Filters the available video resolutions.
		 * @param \Videopack\Admin\Formats\Video_Resolution[] $resolutions Array of Videopack\Admin\Formats\Video_Resolution objects.
		 */
		return apply_filters( 'videopack_video_resolutions', $resolutions );
	}

	public function get_video_formats() {

		$video_formats     = array();
		$video_resolutions = $this->get_video_resolutions();
		$video_codecs      = $this->get_video_codecs();

		foreach ( $video_codecs as $codec ) {
			foreach ( $video_resolutions as $resolution ) {
				if ( is_array( $this->options )
					&& isset( $this->encode[ $codec->get_id() ]['resolutions'][ $resolution->get_id() ] )
				) {
					$enabled = $this->encode[ $codec->get_id() ]['resolutions'][ $resolution->get_id() ];
				} else {
					$enabled = false;
				}
				$format                             = new Formats\Video_Format( $codec, $resolution, $enabled );
				$video_formats[ $format->get_id() ] = $format;
			}
		}

		return $video_formats;
	}

	public function validate_options( $input ) {
		// validate & sanitize input from settings API

		$input = \Videopack\Common\Validate::text_field( $input ); // recursively sanitizes all the settings

		if ( $input['app_path'] != $this->app_path ) {
			$input = $this->validate_ffmpeg_settings( $input );
		} else {
			$input['ffmpeg_exists'] = $this->ffmpeg_exists;
		}

		if ( $input['ffmpeg_exists'] === 'notinstalled' ) {
			$input['browser_thumbnails'] = true; // in case a user had FFmpeg installed and disabled it, they can't choose to disable browser thumbnails if it's no longer installed
			$input['auto_encode']        = false;
			$input['auto_encode_gif']    = false;
			$input['auto_thumb']         = false;
		}

		if ( empty( $input['width'] ) ) {
			add_settings_error( 'video_embed_thumbnail_generator_settings', 'width-zero', esc_html__( 'You must enter a value for the maximum video width.', 'video-embed-thumbnail-generator' ) );
			$input['width'] = $this->width;
		}
		if ( empty( $input['height'] ) ) {
			add_settings_error( 'video_embed_thumbnail_generator_settings', 'height-zero', esc_html__( 'You must enter a value for the maximum video height.', 'video-embed-thumbnail-generator' ) );
			$input['height'] = $this->height;
		}
		if ( empty( $input['gallery_width'] ) ) {
			add_settings_error( 'video_embed_thumbnail_generator_settings', 'gallery-width-zero', esc_html__( 'You must enter a value for the maximum gallery video width.', 'video-embed-thumbnail-generator' ) );
			$input['gallery_width'] = $this->gallery_width;
		}

		if ( array_key_exists( 'capabilities', $input ) && is_array( $input['capabilities'] ) && $input['capabilities'] !== $this->capabilities ) {
			$this->set_capabilities( $input['capabilities'] );
		}

		if ( ! array_key_exists( 'transient_cache', $input ) && $this->transient_cache == true ) {
			( new Cleanup() )->delete_transients();
		} //if user is turning off transient cache option

		if ( array_key_exists( 'auto_thumb_number', $input ) ) {
			if ( intval( $this->auto_thumb_number ) == 1 && intval( $input['auto_thumb_number'] ) > 1 ) {
				$input['auto_thumb_position'] = strval( round( intval( $input['auto_thumb_number'] ) * ( intval( $this->auto_thumb_position ) / 100 ) ) );
				if ( $input['auto_thumb_position'] == '0' ) {
					$input['auto_thumb_position'] = '1';
				}
			}
			if ( intval( $this->auto_thumb_number ) > 1 && intval( $input['auto_thumb_number'] ) == 1 ) {
				// round to the nearest 25 but not 100
				$input['auto_thumb_position'] = strval( round( round( intval( $this->auto_thumb_position ) / intval( $this->auto_thumb_number ) * 4 ) / 4 * 100 ) );
				if ( $input['auto_thumb_position'] == '100' ) {
					$input['auto_thumb_position'] = '75';
				}
			}

			if ( intval( $input['auto_thumb_number'] ) > 1 && intval( $input['auto_thumb_position'] ) > intval( $input['auto_thumb_number'] ) ) {
				$input['auto_thumb_position'] = $input['auto_thumb_number'];
			}

			if ( intval( $input['auto_thumb_number'] ) == 0 ) {
				$input['auto_thumb_number'] = $this->auto_thumb_number;
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
			$input['queue_control'] = $this->queue_control;
		}

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
				/* translators: %s is the path to the application. */
				add_settings_error( 'video_embed_thumbnail_generator_settings', 'ffmpeg-disabled', sprintf( esc_html__( 'FFmpeg is not executing correctly at %s. You can embed existing videos and make thumbnails with compatible browsers, but video encoding is not possible without FFmpeg', 'video-embed-thumbnail-generator' ), esc_html( $input['app_path'] ) ) . '<br /><br />' . esc_html__( 'Error message:', 'video-embed-thumbnail-generator' ) . ' ' . esc_textarea( implode( ' ', array_slice( $ffmpeg_info['output'], -2, 2 ) ) ) . $textarea, 'updated' );
			}
			$input['ffmpeg_exists'] = 'notinstalled';
		}

		return $input;
	}

	public function check_ffmpeg_exists( $app_path ) {

		$proc_open_enabled = false;
		$ffmpeg_exists     = false;
		$output            = array();
		$function          = '';
		$uploads           = wp_upload_dir();
		$test_path         = rtrim( $app_path, '/' );
		$ffmpeg_thumbnails = new \Videopack\Admin\Thumbnails\FFmpeg_Thumbnails( $this );

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
				$app_path = $test_path;
			}

			$output = explode( "\n", $ffmpeg_test );

		}

		$arr = array(
			'proc_open_enabled' => $proc_open_enabled,
			'ffmpeg_exists'     => $ffmpeg_exists,
			'output'            => $output,
			'function'          => $function,
			'app_path'          => $app_path,
		);

		return $arr;
	}

	protected function get_roles_with_capability( $capability ) {

		$roles_with_capability = array();
		$wp_roles_instance     = wp_roles();

		// Ensure wp_roles() returned a valid WP_Roles object.
		if ( ! $wp_roles_instance instanceof \WP_Roles ) {
			return $roles_with_capability;
		}

		// Iterate over all registered role names (slugs).
		foreach ( $wp_roles_instance->get_names() as $role_slug => $role_name ) {
			$role_object = $wp_roles_instance->get_role( $role_slug );
			// Check if the role object exists and has the capability.
			if ( $role_object instanceof \WP_Role && $role_object->has_cap( $capability ) ) {
				$roles_with_capability[] = $role_slug;
			}
		}

		return $roles_with_capability;
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

		if ( is_array( $this->capabilities )
			&& array_key_exists( $capability, $this->capabilities )
		) {
			$users = get_users(
				array(
					'role__in' => array_keys( $this->capabilities[ $capability ] ),
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

	public function get_video_player_id() {
		return $this->video_player_id;
	}

	public function increment_video_player_id() {
		++$this->video_player_id;
		return $this->video_player_id;
	}
}
