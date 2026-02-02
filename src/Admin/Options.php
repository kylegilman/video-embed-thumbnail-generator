<?php

namespace Videopack\Admin;

/**
 * Loads and maintains all Videopack plugin settings
 */
class Options {

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

		$default_options = array(
			// General Settings.
			'embed_method'            => 'Video.js', // Video player to use.
			'template'                => false, // Whether to use a custom template for video output.
			'template_gentle'         => true, // Enable gentle template failover if the custom template is missing.
			'hide_video_formats'      => true, // List only enabled default video formats in the Admin area.
			'hide_thumbnails'         => false, // Hide generated thumbnails in the Admin area.
			'delete_children'         => 'encoded videos only', // Criteria for deleting associated media upon video deletion ('none', 'encoded videos only', 'all').
			'thumb_parent'            => 'video', // Parent post type for video thumbnails ('video', 'post').
			'transient_cache'         => false, // Enable transient caching for URL to Attachment ID lookups.

			// FFmpeg & Encoding Settings.
			'app_path'                => '', // Path to the FFmpeg application.
			'ffmpeg_exists'           => 'notchecked', // Is FFmpeg installed and working ('notchecked', true, 'notinstalled').
			'ffmpeg_error'            => '', // User-friendly error message if FFmpeg isn't working.
			'replace_format'          => 'h264', // Default video codec to replace the original video file if 'fullres' encode is enabled.
			'custom_resolution'       => false, // Allow custom video resolutions (height in pixels or false).
			'encode'                  => array(), // List of enabled video encode formats and settings (Populated dynamically).
			'ffmpeg_watermark'        => array( // Watermark settings for video encoding with FFmpeg.
				'url'    => '', // Watermark image URL.
				'scale'  => '50', // Watermark scale (percentage of video height).
				'align'  => 'center', // Horizontal alignment ('left', 'center', 'right').
				'valign' => 'center', // Vertical alignment ('top', 'center', 'bottom').
				'x'      => '0', // Horizontal offset (pixels).
				'y'      => '0', // Vertical offset (pixels).
			),
			'ffmpeg_thumb_watermark'  => array( // Watermark settings for thumbnail generation with FFmpeg.
				'url'    => '', // Watermark image URL.
				'scale'  => '50', // Watermark scale (percentage of video height).
				'align'  => 'center', // Horizontal alignment ('left', 'center', 'right').
				'valign' => 'center', // Vertical alignment ('top', 'center', 'bottom').
				'x'      => '0', // Horizontal offset (pixels).
				'y'      => '0', // Vertical offset (pixels).
			),
			'audio_bitrate'           => 160, // Audio bitrate for encoding in kbps.
			'audio_channels'          => true, // Always encode stereo audio (if source is stereo or mono).
			'threads'                 => 1, // Number of threads for video processing with FFmpeg.
			'nice'                    => true, // Adjust process priority for video encoding (lower priority).
			'h264_profile'            => 'main', // H.264 profile for video encoding.
			'h264_level'              => '4.1', // H.264 level for video encoding.
			'simultaneous_encodes'    => 1, // Maximum number of simultaneous video encoding processes.
			'error_email'             => 'nobody', // Email address to receive error notifications ('nobody', 'encoder', or user login).
			'queue_control'           => 'play', // Control behavior for video encoding queue ('play', 'pause').

			// Thumbnail Settings.
			'total_thumbnails'        => 4, // Default total_thumbnails to generate when manually creating.
			'featured'                => true, // Set generated thumbnail as post's featured thumbnail.
			'browser_thumbnails'      => true, // Use browser technology to generate thumbnails instead of FFmpeg if FFmpeg is unavailable.

			// Automation Settings.
			'auto_encode'             => false, // Automatically encode videos upon upload.
			'auto_encode_gif'         => false, // Automatically convert animated GIFs to video upon upload.
			'auto_thumb'              => false, // Automatically generate thumbnails for videos upon upload.
			'auto_thumb_number'       => 1, // Number of thumbnails to automatically generate.
			'auto_thumb_position'     => 50, // Position within video for automatic thumbnail generation (percentage or frame number if auto_thumb_number > 1).
			'auto_publish_post'       => false, // Automatically publish posts after video processing is complete.

			// Player Appearance & Behavior.
			'poster'                  => '', // Default poster image URL for videos.
			'watermark'               => '', // Player overlay watermark image URL.
			'watermark_link_to'       => 'home', // Link target for the player watermark ('home', 'parent', 'attachment', 'download', 'false', or custom URL).
			'watermark_url'           => '', // Custom link target URL for the player watermark (overrides watermark_link_to if set).
			'overlay_title'           => true, // Overlay video title on the player.
			'embedcode'               => false, // Enable embedding code overlay on the player.
			'downloadlink'            => false, // Enable a download link/icon for the video.
			'click_download'          => true, // Enable single-click download methods (if downloadlink is true).
			'view_count'              => false, // Show view count below video.
			'count_views'             => 'start_complete', // Level of view count tracking ('start_complete', 'quarters', 'start', 'none').
			'embeddable'              => true, // Allow videos to be embedded on other sites.
			'inline'                  => true, // Allow content on the left and right side of videos (CSS float).
			'align'                   => '', // Default alignment for the video player ('', 'wide', 'full', 'left', 'center', 'right').
			'width'                   => 960, // Default width for the video player in pixels.
			'height'                  => 540, // Default height for the video player in pixels.
			'fullwidth'               => true, // Expand video players to the full width of their container.
			'fixed_aspect'            => 'vertical', // Fixed aspect ratio setting for the video player (true, false, 'vertical').
			'skin'                    => 'kg-video-js-skin', // Skin class for the Video.js player.
			'right_click'             => true, // Enable right-click context menu on video player.
			'resize'                  => true, // Enable responsive video resizing.

			// Player Controls & Playback.
			'nativecontrolsfortouch'  => false, // Use native browser controls for touch devices instead of custom player controls.
			'controls'                => true, // Show player controls.
			'autoplay'                => false, // Autoplay videos on load.
			'pauseothervideos'        => true, // Pause other videos on the page when a new video is played.
			'loop'                    => false, // Loop video playback.
			'playsinline'             => true, // Play videos inline on mobile devices (especially iOS).
			'volume'                  => 1.0, // Initial volume of the video player (0.0 to 1.0).
			'muted'                   => false, // Start videos in muted state.
			'gifmode'                 => false, // Enable GIF-like behavior (autoplay, muted, loop, playsinline, no controls).
			'preload'                 => 'metadata', // Preload setting for videos ('metadata', 'auto', 'none').
			'playback_rate'           => false, // Enable playback rate control in the player.
			'skip_buttons'            => false, // Enable skip forward/backward buttons in the player.
			'skip_forward'            => 10, // Time to skip forward in seconds.
			'skip_backward'           => 10, // Time to skip backward in seconds.
			'endofvideooverlay'       => false, // Show an image overlay at the end of videos.
			'endofvideooverlaysame'   => false, // Display the poster image at the end of videos if endofvideooverlay is true.
			'auto_res'                => 'automatic', // Default video playback resolution ('automatic', 'highest', 'lowest', or specific like '1080p').
			'pixel_ratio'             => true, // Enable adjustment for high DPI displays (retina) when auto_res is 'automatic'.
			'find_formats'            => false, // Automatically look for other codecs and resolutions based on the video filename.

			// Gallery Settings.
			'gallery_columns'         => 4, // Number of columns in video galleries.
			'gallery_end'             => '', // Custom content to display at the end of video galleries ('close', 'next', or custom HTML).
			'gallery_pagination'      => false, // Enable pagination for video galleries.
			'gallery_per_page'        => 6, // Number of videos per page in galleries (false for no pagination, or integer).
			'gallery_title'           => true, // Display titles on video gallery thumbnails.

			// Integration & Advanced.
			'capabilities'            => array(), // Enabled capabilities required for Videopack functions (Populated dynamically).
			'open_graph'              => false, // Enable Open Graph meta tags for videos.
			'schema'                  => true, // Enable Schema.org (JSON-LD) markup for videos.
			'oembed_provider'         => false, // Enable oEmbed provider functionality for Videopack videos.
			'htaccess_login'          => '', // Login username for .htaccess protected directories (if FFmpeg needs to access files there).
			'htaccess_password'       => '', // Login password for .htaccess protected directories.
			'alwaysloadscripts'       => false, // Always load video player scripts, regardless of whether a video is detected on the page.
			'replace_video_shortcode' => false, // Replace the default WordPress [video] shortcode with the Videopack player.
			'default_insert'          => 'Single Video', // Default method for inserting videos into posts from Media Library ('Single Video', 'Video Gallery', 'WordPress Default').
			'rewrite_attachment_url'  => true, // Enable rewriting of attachment URLs to point to the video attachment page.

			// Testing & Debug.
			'sample_codec'            => 'h264', // Sample codec for FFmpeg testing on settings page.
			'sample_resolution'       => 360, // Sample resolution (height) for FFmpeg testing on settings page.
			'sample_rotate'           => false, // Test FFmpeg encode settings on a sample vertical video.
		);

		foreach ( $this->default_capabilities as $videopack_capability => $wp_capability ) {
			$enabled_roles = array_keys( $this->get_roles_with_capability( $wp_capability ) );
			$default_options['capabilities'][ $videopack_capability ] = $this->get_all_roles_with_capability( $enabled_roles );
		}

		$video_codecs = $this->get_video_codecs();
		$resolutions  = $this->get_video_resolutions();
		foreach ( $video_codecs as $codec ) {
			$default_options['encode'][ $codec->get_id() ]['crf'] = $codec->get_default_crf();
			$supported_rate_controls = $codec->get_supported_rate_controls();
			$default_options['encode'][ $codec->get_id() ]['rate_control'] = $supported_rate_controls[0];
			$default_options['encode'][ $codec->get_id() ]['vbr'] = $codec->get_default_vbr();
			$default_options['encode'][ $codec->get_id() ]['enabled'] = $codec->is_default_encode();
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

		$saved_options         = get_option( 'videopack_options' ); // will be false if not set
		$this->default_options = $this->get_default();

		if ( false === $saved_options ) { // this is the first time the plugin has run, or they're reset to defaults
			// Set the options to default before initializing to prevent recursion
			$this->options = $this->default_options;
			$options       = $this->init_options( $this->default_options );
		} else {
			$options = $this->merge_options_with_defaults( (array) $saved_options, $this->default_options );
		}

		if ( $options !== $saved_options ) {
			update_option( 'videopack_options', $options );
		}

		$this->options = $options;

		/**
		 * Fires after the Videopack options have been loaded and processed.
		 * The $this->options property and public properties are now populated.
		 */
		do_action( 'videopack_options_loaded', $this );
	}

	public function save_options( array $options_to_save = null ) {
		// Use the provided array if available, otherwise use the internal array
		$options_to_save = $options_to_save ?? $this->options;

		update_option( 'videopack_options', $options_to_save );

		if ( $options_to_save !== $this->options ) {
			$this->options = $options_to_save;
		}
	}

	/**
	 * Initialize the plugin options.
	 * @param array $current_default_options The current set of default options (including from add-ons).
	 * @return array The initialized options array.
	 */
	private function init_options( array $current_default_options ) {

		$options_to_init = $current_default_options;
		$old_options     = get_option( 'kgvid_video_embed_options', array() );

		if ( $old_options ) {
			// Unset obsolete keys
			unset( $old_options['videojs_version'] );
			unset( $old_options['twitter_button'] );
			unset( $old_options['twitter_username'] );
			unset( $old_options['facebook_button'] );
			unset( $old_options['sample_format'] );
			unset( $old_options['sample_rotate'] );

			// Migrate generate_thumbs to total_thumbnails
			if ( isset( $old_options['generate_thumbs'] ) ) {
				$old_options['total_thumbnails'] = $old_options['generate_thumbs'];
				unset( $old_options['generate_thumbs'] );
			}

			// Migrate js_skin to skin
			if ( isset( $old_options['js_skin'] ) ) {
				$old_options['skin'] = $old_options['js_skin'];
				unset( $old_options['js_skin'] );
			}

			// Migrate overlay_embedcode to embedcode
			if ( isset( $old_options['overlay_embedcode'] ) ) {
				$old_options['embedcode'] = $old_options['overlay_embedcode'];
				unset( $old_options['overlay_embedcode'] );
			}

			// Add find_formats set to true to preserve behavior from the old version
			$old_options['find_formats'] = true;

			// Migrate custom_format to encode array
			if ( isset( $old_options['custom_format']['format'] ) ) {
				$format = $old_options['custom_format']['format'];
				$height = $old_options['custom_format']['height'];
				if ( ! isset( $options_to_init['encode'][ $format ] ) ) {
					$options_to_init['encode'][ $format ] = array( 'resolutions' => array() );
				}
				$options_to_init['encode'][ $format ]['resolutions'][ $height ] = true;
				unset( $old_options['custom_format'] );
			}

			// Migrate global rate_control to per-codec settings
			if ( isset( $old_options['rate_control'] ) ) {
				$video_codecs = $this->get_video_codecs();
				foreach ( $video_codecs as $codec ) {
					$codec_id = $codec->get_id();
					if ( in_array( $old_options['rate_control'], $codec->get_supported_rate_controls(), true ) ) {
						$options_to_init['encode'][ $codec_id ]['rate_control'] = $old_options['rate_control'];
					}
				}
				unset( $old_options['rate_control'] );
			}

			unset( $old_options['bitrate_multiplier'] );

			// Migrate CRF values
			if ( isset( $old_options['h264_CRF'] ) ) {
				$options_to_init['encode']['h264']['crf'] = $old_options['h264_CRF'];
				unset( $old_options['h264_CRF'] );
			}
			if ( isset( $old_options['webm_CRF'] ) ) {
				$options_to_init['encode']['vp8']['crf'] = $old_options['webm_CRF'];
				unset( $old_options['webm_CRF'] );
			}
			if ( isset( $old_options['ogv_CRF'] ) ) {
				// OGV is no longer supported, so we just unset it.
				unset( $old_options['ogv_CRF'] );
			}

			// Convert boolean-like strings to booleans
			foreach ( $old_options as $key => &$value ) {
				if ( $value === 'on' ) {
					$value = true;
				} elseif ( $value === 'off' || $value === '' ) {
					$value = false;
				}
			}

			// Merge old options into the new structure, respecting new defaults for missing keys.
			$options_to_init = $this->merge_options_with_defaults( (array) $old_options, $options_to_init );
			delete_option( 'kgvid_video_embed_options' );
		}

		// Set capabilities based on the potentially merged old options or new defaults.
		$this->set_capabilities( $options_to_init['capabilities'] );

		if ( $options_to_init['ffmpeg_exists'] === 'notchecked' ) {
			$ffmpeg_tester = new Encode\FFmpeg_Tester( $this ); // Pass $this (Options instance) to the tester.
			$ffmpeg_check  = $ffmpeg_tester->check_ffmpeg_exists( $options_to_init['app_path'] );
			if ( true === $ffmpeg_check['ffmpeg_exists'] ) {
				$options_to_init['ffmpeg_exists'] = true;
				$options_to_init['app_path']      = $ffmpeg_check['app_path'];
				$options_to_init['ffmpeg_error']  = '';
			} else {
				$options_to_init['ffmpeg_exists'] = 'notinstalled';
				$options_to_init['ffmpeg_error']  = $ffmpeg_check['ffmpeg_error'];
			}
		}

		return $options_to_init;
	}

	public function filter_options_for_rest() {
		$all_options = $this->get_options();

		if ( current_user_can( 'manage_options' ) ) {
			return $all_options;
		}

		// Define keys that should not be exposed via this REST endpoint for non-admins.
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
			if ( isset( $safe_options[ $key ] ) ) {
				unset( $safe_options[ $key ] );
			}
		}

		return $safe_options;
	}

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
						'properties' => $this->settings_schema( $this->get_default() ), // Schema based on all defaults.
					),
					'get_callback' => array( $this, 'filter_options_for_rest' ),
				),
			)
		);
	}

	public function settings_schema( array $options ) {

		$schema = array();

		foreach ( $options as $option => $value ) {
			$att_type = 'string';

			// Handle specific known object-like array structures first
			if ( $option === 'ffmpeg_thumb_watermark' || $option === 'ffmpeg_watermark' ) {
				$schema[ $option ] = array(
					'type'       => 'object',
					'properties' => array(
						'url'    => array( 'type' => 'string' ),
						'scale'  => array( 'type' => array( 'string', 'number' ) ), // string because form values can be strings
						'align'  => array( 'type' => 'string' ),
						'valign' => array( 'type' => 'string' ),
						'x'      => array( 'type' => array( 'string', 'number' ) ),
						'y'      => array( 'type' => array( 'string', 'number' ) ),
					),
					'default'    => $value, // Default is the array itself
				);
				continue;
			}

			if ( is_bool( $value )
				|| $option === 'ffmpeg_exists' // ffmpeg_exists can be bool or string 'notchecked'/'notinstalled'
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

			if ( is_array( $value ) ) { // For other generic arrays/objects
				$schema[ $option ] = array(
					'type'                 => 'object',
					'properties'           => $this->settings_schema( $value ),
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

	public function save_default_options() {

		$options_to_save = $this->get_default(); // Get all defaults, including from add-ons

		if ( $options_to_save['ffmpeg_exists'] === 'notchecked' ) {
			$ffmpeg_tester = new Encode\FFmpeg_Tester( $this ); // Pass $this (Options instance) to the tester.
			$ffmpeg_check  = $ffmpeg_tester->check_ffmpeg_exists( $options_to_save['app_path'] );
			if ( true === $ffmpeg_check['ffmpeg_exists'] ) {
				$options_to_save['ffmpeg_exists'] = true;
				$options_to_save['app_path']      = $ffmpeg_check['app_path'];
				$options_to_save['ffmpeg_error']  = '';
			} else {
				$options_to_save['ffmpeg_exists'] = 'notinstalled';
				$options_to_save['ffmpeg_error']  = $ffmpeg_check['ffmpeg_error'];
			}
		}

		update_option( 'videopack_options', $options_to_save );
		$this->load_options(); // Reload options after saving defaults
	}

	/**
	 * Returns all options.
	 *
	 * @return array{
	 *   embed_method: string,
	 *   template: bool,
	 *   template_gentle: bool,
	 *   hide_video_formats: bool,
	 *   hide_thumbnails: bool,
	 *   delete_children: string,
	 *   thumb_parent: string,
	 *   transient_cache: bool,
	 *   app_path: string,
	 *   ffmpeg_exists: string|bool,
	 *   ffmpeg_error: string,
	 *   replace_format: string,
	 *   custom_resolution: int|bool,
	 *   encode: array<string, array{crf: int, vbr: int, resolutions: array<string|int, bool>}>,
	 *   audio_bitrate: int,
	 *   audio_channels: bool,
	 *   threads: int,
	 *   nice: bool,
	 *   h264_profile: string,
	 *   h264_level: string,
	 *   simultaneous_encodes: int,
	 *   error_email: string,
	 *   queue_control: string,
	 *   generate_thumbs: int,
	 *   featured: bool,
	 *   browser_thumbnails: bool,
	 *   ffmpeg_thumb_watermark: array{url: string, scale: string|int, align: string, valign: string, x: string|int, y: string|int},
	 *   auto_encode: bool,
	 *   auto_encode_gif: bool,
	 *   auto_thumb: bool,
	 *   auto_thumb_number: int,
	 *   auto_thumb_position: int,
	 *   auto_publish_post: bool,
	 *   poster: string,
	 *   watermark: string,
	 *   ffmpeg_watermark: array{url: string, scale: string|int, align: string, valign: string, x: string|int, y: string|int},
	 *   watermark_link_to: string,
	 *   watermark_url: string,
	 *   overlay_title: bool,
	 *   embedcode: bool,
	 *   downloadlink: bool,
	 *   click_download: bool,
	 *   view_count: bool,
	 *   count_views: string,
	 *   embeddable: bool,
	 *   inline: bool,
	 *   align: string,
	 *   width: int,
	 *   height: int,
	 *   fixed_aspect: string|bool,
	 *   skin: string,
	 *   right_click: bool,
	 *   resize: bool,
	 *   nativecontrolsfortouch: bool,
	 *   controls: bool,
	 *   autoplay: bool,
	 *   pauseothervideos: bool,
	 *   loop: bool,
	 *   playsinline: bool,
	 *   volume: float,
	 *   muted: bool,
	 *   gifmode: bool,
	 *   preload: string,
	 *   playback_rate: bool,
	 *   skip_buttons: bool,
	 *   skip_forward: int,
	 *   skip_backward: int,
	 *   endofvideooverlay: bool,
	 *   endofvideooverlaysame: bool,
	 *   auto_res: string,
	 *   pixel_ratio: bool,
	 *   find_formats: bool,
	 *   gallery_columns: int,
	 *   gallery_end: string,
	 *   gallery_pagination: bool,
	 *   gallery_per_page: int,
	 *   gallery_title: bool,
	 *   capabilities: array<string, array<string>>,
	 *   open_graph: bool,
	 *   schema: bool,
	 *   oembed_provider: bool,
	 *   htaccess_login: string,
	 *   htaccess_password: string,
	 *   alwaysloadscripts: bool,
	 *   replace_video_shortcode: bool,
	 *   default_insert: string,
	 *   rewrite_attachment_url: bool,
	 *   sample_codec: string,
	 *   sample_resolution: int,
	 *   sample_rotate: bool
	 * } The associative array of all Videopack options.
	 */
	public function get_options() {
		// Ensure options are loaded if accessed before 'init' hook (where load_options is typically called)
		if ( empty( $this->options ) ) {
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
			new Formats\Codecs\Video_Codec_VP8(),
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
				'name'           => 'Full Resolution',
				'label'          => 'Replace with full resolution',
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
				'name'           => 'Low Definition (360p)',
				'default_encode' => true,
			),
			array(
				'height'         => 240,
				'name'           => 'Ultra Low Definition (240p)',
				'default_encode' => false,
			),
		);

		if ( $this->options['custom_resolution'] ?? false ) {
			$resolution_properties[] = array(
				'height'         => $this->options['custom_resolution'],
				'name'           => 'Custom',
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
				if ( 'fullres' === $a->get_id() ) {
					return -1;
				}
				if ( 'fullres' === $b->get_id() ) {
					return 1;
				}
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

	/**
	 * Returns translated video resolution name.
	 *
	 * @param string $name The resolution name.
	 * @return string
	 */
	public function get_resolution_l10n( $name ) {
		switch ( $name ) {
			case 'Full Resolution':
				return esc_html__( 'Full Resolution', 'video-embed-thumbnail-generator' );
			case 'Replace with full resolution':
				return esc_html__( 'Replace with full resolution', 'video-embed-thumbnail-generator' );
			case '4k UHD (2160p)':
				return esc_html__( '4K UHD (2160p)', 'video-embed-thumbnail-generator' );
			case 'Quad HD (1440p)':
				return esc_html__( 'Quad HD (1440p)', 'video-embed-thumbnail-generator' );
			case 'Full HD (1080p)':
				return esc_html__( 'Full HD (1080p)', 'video-embed-thumbnail-generator' );
			case 'HD (720p)':
				return esc_html__( 'HD (720p)', 'video-embed-thumbnail-generator' );
			case 'HD (540p)':
				return esc_html__( 'HD (540p)', 'video-embed-thumbnail-generator' );
			case 'SD (480p)':
				return esc_html__( 'SD (480p)', 'video-embed-thumbnail-generator' );
			case 'Low Definition (360p)':
				return esc_html__( 'Low Definition (360p)', 'video-embed-thumbnail-generator' );
			case 'Ultra Low Definition (240p)':
				return esc_html__( 'Ultra Low Definition (240p)', 'video-embed-thumbnail-generator' );
			case 'Custom':
				if ( $this->options['custom_resolution'] ?? false ) {
					/* translators: %s is the height of a custom video resolution. Example: 'Custom (4320p)' */
					return sprintf( esc_html__( 'Custom (%sp)', 'video-embed-thumbnail-generator' ), strval( $this->options['custom_resolution'] ) );
				}
				return esc_html__( 'Custom', 'video-embed-thumbnail-generator' );
			default:
				return apply_filters( 'videopack_resolution_l10n', $name );
		}
	}

	public function get_video_formats( $hide_formats = false ) {

		$video_formats     = array();
		$video_resolutions = $this->get_video_resolutions();
		$video_codecs      = $this->get_video_codecs();

		foreach ( $video_codecs as $codec ) {
			if ( $hide_formats && $this->options['hide_video_formats'] && ! $this->options['encode'][ $codec->get_id() ]['enabled'] ) {
				continue;
			}
			foreach ( $video_resolutions as $resolution ) {
				if ( is_array( $this->options )
					&& isset( $this->options['encode'][ $codec->get_id() ]['resolutions'][ $resolution->get_id() ] )
				) {
					$enabled = $this->options['encode'][ $codec->get_id() ]['resolutions'][ $resolution->get_id() ];
				} else {
					$enabled = false;
				}
				$format                             = new Formats\Video_Format( $codec, $resolution, $enabled );
				$video_formats[ $format->get_id() ] = $format;
			}
		}

		return $video_formats;
	}

	private function sanitize_options_recursively( $input, $schema_properties = array() ) {
		if ( ! is_array( $input ) ) {
			// For non-array values, sanitize as a string.
			return sanitize_text_field( $input );
		}

		$sanitized_input = array();

		foreach ( $input as $key => $value ) {
			if ( ! isset( $schema_properties[ $key ] ) ) {
				// This option is not in the schema.
				if ( is_array( $value ) ) {
					// If it's an array, recurse into it without a schema.
					$sanitized_input[ $key ] = $this->sanitize_options_recursively( $value );
				} else {
					// Otherwise, sanitize it as a text field.
					$sanitized_input[ $key ] = sanitize_text_field( $value );
				}
				continue;
			}

			$property_schema = $schema_properties[ $key ];
			$type            = is_array( $property_schema['type'] ) ? $property_schema['type'][0] : $property_schema['type'];

			switch ( $type ) {
				case 'object':
					if ( is_array( $value ) ) {
						$sub_properties = $property_schema['properties'] ?? array();
						$sanitized_input[ $key ] = $this->sanitize_options_recursively( $value, $sub_properties );
					} else {
						// Value is not an array, but schema expects an object. Sanitize as text.
						$sanitized_input[ $key ] = sanitize_text_field( $value );
					}
					break;
				case 'boolean':
					$sanitized_input[ $key ] = rest_sanitize_boolean( $value );
					break;
				case 'number':
					if ( is_numeric( $value ) ) {
						if ( strpos( (string) $value, '.' ) === false ) {
							$sanitized_input[ $key ] = intval( $value );
						} else {
							$sanitized_input[ $key ] = floatval( $value );
						}
					} else {
						$sanitized_input[ $key ] = 0;
					}
					break;
				case 'string':
					// The value could be an array from the form, so we can't just cast to string.
					if ( is_string( $value ) ) {
						$sanitized_input[ $key ] = sanitize_text_field( $value );
					} elseif ( is_numeric( $value ) || is_bool( $value ) ) {
						$sanitized_input[ $key ] = sanitize_text_field( (string) $value );
					} else {
						// It's some other type like an array that should be a string.
						// We'll sanitize it as a text field, which will result in 'Array'.
						// This is not ideal, but it's safe.
						$sanitized_input[ $key ] = sanitize_text_field( $value );
					}
					break;
				default:
					// Fallback for unknown types.
					if ( is_array( $value ) ) {
						$sanitized_input[ $key ] = $this->sanitize_options_recursively( $value );
					} else {
						$sanitized_input[ $key ] = sanitize_text_field( $value );
					}
			}
		}

		return $sanitized_input;
	}

	public function validate_options( $input ) {
		// validate & sanitize input from settings API
		$schema = $this->settings_schema( $this->get_default() );
		$input  = $this->sanitize_options_recursively( $input, $schema );

		$ffmpeg_tester = new Encode\FFmpeg_Tester( $this ); // Pass $this (Options instance) to the tester.
		// Use $this->options for current values, not public properties.
		if ( $input['app_path'] !== $this->options['app_path'] || ( isset( $input['ffmpeg_exists'] ) && 'notchecked' === $input['ffmpeg_exists'] ) ) {
			$input = $this->validate_ffmpeg_settings( $input, $ffmpeg_tester );
		} else {
			$input['ffmpeg_exists'] = $this->options['ffmpeg_exists'];
			$input['ffmpeg_error']  = $this->options['ffmpeg_error'];
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

		if ( array_key_exists( 'capabilities', $input ) && is_array( $input['capabilities'] ) ) {
			if ( $input['capabilities'] !== $this->options['capabilities'] ) {
				$input['capabilities'] = $this->set_capabilities( $input['capabilities'] );
			}
		}

		if ( ! array_key_exists( 'transient_cache', $input ) && $this->options['transient_cache'] == true ) {
			( new Cleanup() )->delete_transients();
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
			$input['embedcode'] = false;
		}

		if ( ! $input['queue_control'] ) { // don't reset queue control when saving settings
			$input['queue_control'] = $this->options['queue_control'];
		}

		$this->options = $input;

		return $input;
	}

	public function validate_ffmpeg_settings( array $input, Encode\FFmpeg_Tester $ffmpeg_tester ) {

		$ffmpeg_info = $ffmpeg_tester->check_ffmpeg_exists( $input['app_path'] );

		if ( true === $ffmpeg_info['ffmpeg_exists'] ) {
			$input['ffmpeg_exists'] = true;
			$input['ffmpeg_error']  = ''; // Clear any previous error on success.
		} else {
			$input['ffmpeg_exists'] = 'notinstalled';
			$input['ffmpeg_error']  = $ffmpeg_info['ffmpeg_error'];
		}

		$input['app_path'] = $ffmpeg_info['app_path'];

		return $input;
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
				$roles_with_capability[ $role_slug ] = true;
			}
		}

		return $roles_with_capability;
	}

	protected function get_all_roles_with_capability( $enabled_roles ) {

		$all_roles         = array();
		$wp_roles_instance = wp_roles();

		// Ensure wp_roles() returned a valid WP_Roles object.
		if ( ! $wp_roles_instance instanceof \WP_Roles ) {
			return $all_roles;
		}

		// Iterate over all registered role names (slugs).
		foreach ( $wp_roles_instance->get_names() as $role_slug => $role_name ) {
			$all_roles[ $role_slug ] = in_array($role_slug, $enabled_roles);
		}

		return $all_roles;
	}

	public function set_capabilities( array $capabilities ): array {

		$wp_roles              = wp_roles();
		$plugin_capability_keys = array_keys( $this->default_capabilities );

		// First, ensure the capabilities array is clean and only contains role slugs as keys.
		$clean_capabilities = array();
		foreach ( $capabilities as $capability => $roles ) {
			if ( is_array( $roles ) ) {
				$clean_capabilities[ $capability ] = array_filter(
					$roles,
					function ( $key ) {
						return is_string( $key );
					},
					ARRAY_FILTER_USE_KEY
				);
			}
		}

		// Iterate through each role and update its capabilities.
		foreach ( $wp_roles->roles as $role => $role_info ) {
			// Iterate over all plugin capabilities
			foreach ( $plugin_capability_keys as $capability ) {
				$enabled_roles          = $clean_capabilities[ $capability ] ?? [];
				$has_capability         = isset( $role_info['capabilities'][ $capability ] ) && $role_info['capabilities'][ $capability ];
				$should_have_capability = ! empty( $enabled_roles[ $role ] );

				if ( $should_have_capability && ! $has_capability ) {
					// The role should have the capability but doesn't.
					$wp_roles->add_cap( $role, $capability );
				} elseif ( ! $should_have_capability && $has_capability ) {
					error_log($role . ' should not have ' . $capability);
					// The role shouldn't have the capability but does.
					$wp_roles->remove_cap( $role, $capability );
				}
			}
		}
		return $clean_capabilities;
	}

	public function merge_options_with_defaults( array $options, array $default_options ) {

		// Remove obsolete options not present in the new defaults.
		foreach ( array_keys( $options ) as $key ) {
			if ( ! array_key_exists( $key, $default_options ) ) {
				unset( $options[ $key ] );
			}
		}

		foreach ( $default_options as $key => $value ) {
			// Check if the key exists in $options. If not, set it to the default value
			if ( ! array_key_exists( $key, $options ) ) {
				$options[ $key ] = $value; // Add missing option with its default
			} elseif ( is_array( $value ) ) { // If default is an array
				if ( ! isset( $options[ $key ] ) || ! is_array( $options[ $key ] ) ) {
					// If saved option is not set, or is not an array (type mismatch),
					// overwrite with the default array structure.
					// This ensures that if a default expects an array (e.g., for 'encode' or 'capabilities'),
					// it will be an array, preventing errors if a scalar was somehow saved previously.
					$options[ $key ] = $value;
				} else {
					// Both are arrays, recurse.
					$options[ $key ] = $this->merge_options_with_defaults( $options[ $key ], $value );
				}
			}
			// If default is not an array, and key exists in options, retain the existing value in $options (scalar or object).
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
