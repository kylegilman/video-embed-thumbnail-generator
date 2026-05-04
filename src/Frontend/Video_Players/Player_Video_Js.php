<?php
/**
 * Video.js player implementation subclass.
 *
 * @package Videopack
 */

namespace Videopack\Frontend\Video_Players;

/**
 * Class Player_Video_Js
 *
 * Handles video player implementation using the Video.js library.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend/Video_Players
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Player_Video_Js extends Player {

	/**
	 * Whether the hooks for Video.js have been registered.
	 *
	 * @var bool $hooks_registered
	 */
	private static $hooks_registered = false;

	/**
	 * Registers WordPress hooks for Video.js.
	 */
	public function register_hooks() {

		parent::register_hooks();

		if ( ! self::$hooks_registered ) {
			add_filter( 'videopack_video_player_data', array( __CLASS__, 'filter_video_vars' ), 10, 2 );
			add_filter( 'videopack_video_player_classes', array( __CLASS__, 'filter_video_classes' ), 10, 2 );
			add_filter( 'videopack_player_div_classes', array( __CLASS__, 'filter_player_div_classes' ), 10, 2 );
			self::$hooks_registered = true;
		}
	}

	/**
	 * Returns the handles for Video.js specific styles.
	 *
	 * @return array The style handles.
	 */
	public function get_player_style_handles(): array {
		return array_merge( parent::get_player_style_handles(), array( 'video-js' ) );
	}

	/**
	 * Returns the handles for Video.js specific scripts.
	 *
	 * @return array The script handles.
	 */
	public function get_player_script_handles(): array {
		return array( 'video-js', 'video-js-quality-selector' );
	}


	/**
	 * Registers frontend scripts and styles for Video.js.
	 */
	public function register_scripts() {
		parent::register_scripts();

		wp_register_script( 'video-js', plugins_url( 'video-js/video.min.js', VIDEOPACK_PLUGIN_FILE ), array(), VIDEOPACK_VIDEOJS_VERSION, true );
		wp_register_script( 'video-js-quality-selector', plugins_url( 'video-js/video-quality-selector.js', VIDEOPACK_PLUGIN_FILE ), array( 'video-js' ), VIDEOPACK_VERSION, true );

		$locale        = self::get_videojs_locale();
		$translations  = array(
			'Quality' => esc_html_x( 'Quality', 'text above list of video resolutions', 'video-embed-thumbnail-generator' ),
			'Full'    => esc_html_x( 'Full', 'Full resolution', 'video-embed-thumbnail-generator' ),
		);
		$inline_script = sprintf(
			'videojs.addLanguage(\'%s\', %s);',
			$locale,
			wp_json_encode( $translations )
		);
		wp_add_inline_script( 'video-js-quality-selector', (string) $inline_script );

		wp_register_style( 'video-js', plugins_url( 'video-js/video-js.min.css', VIDEOPACK_PLUGIN_FILE ), array(), VIDEOPACK_VIDEOJS_VERSION );
	}

	/**
	 * Filters block metadata to include Video.js dependencies.
	 *
	 * @param array $metadata The block metadata.
	 * @return array The filtered metadata.
	 */
	public function filter_block_metadata( $metadata ) {
		// Add script dependencies.
		$metadata = $this->ensure_array_and_append( $metadata, 'script', 'video-js' );
		$metadata = $this->ensure_array_and_append( $metadata, 'script', 'video-js-quality-selector' );

		// Add style dependencies.
		$metadata = $this->ensure_array_and_append( $metadata, 'style', 'video-js' );

		return (array) $metadata;
	}


	/**
	 * Enqueues Video.js player-specific scripts and styles.
	 */
	public function enqueue_player_scripts(): void {
		wp_enqueue_script( 'video-js' );
		wp_enqueue_script( 'video-js-quality-selector' );
		wp_enqueue_style( 'video-js' );

		if ( wp_script_is( 'videojs-l10n', 'registered' ) ) {
			wp_enqueue_script( 'videojs-l10n' );
		}
	}

	/**
	 * Enqueues all available skins for Video.js.
	 *
	 * DEPRECATED: Skins are now consolidated into the main plugin stylesheet.
	 */
	public function enqueue_all_skins(): void {
		// No-op.
	}

	/**
	 * Returns the Video.js compatible locale code.
	 *
	 * @return string The locale code.
	 */
	protected static function get_videojs_locale() {

		$locale = get_locale();

		$locale_conversions = array( // All Video.js language codes are two-character except these.
			'pt-BR' => 'pt_BR',
			'pt-PT' => 'pt_PT',
			'zh-CN' => 'zh_CN',
			'zh-TW' => 'zh_TW',
		);

		$matching_locale = array_search( $locale, $locale_conversions, true );
		if ( $matching_locale !== false ) {
			$locale = $matching_locale;
		} else {
			$locale = substr( $locale, 0, 2 );
		}

		return (string) $locale;
	}

	/**
	 * Filters video variables to include Video.js specific settings.
	 *
	 * @param array $video_variables The array of video variables.
	 * @param array $atts            The video player attributes.
	 * @return array The modified video variables.
	 */
	public static function filter_video_vars( $video_variables, $atts ) {

		$video_variables['nativecontrolsfortouch'] = (bool) ( $atts['nativecontrolsfortouch'] ?? false );
		$video_variables['locale']                 = self::get_videojs_locale();

		return $video_variables;
	}

	/**
	 * Filters the video element classes for Video.js.
	 *
	 * @param array $classes Existing classes.
	 * @param array $atts    The video player attributes.
	 * @return array Modified classes.
	 */
	public static function filter_video_classes( $classes, $atts ): array {

		$classes[] = 'video-js';
		$skin      = $atts['skin'] ?? '';
		if ( empty( $skin ) ) {
			$skin = '';
		}

		// Video.js themes in Videopack usually expect centering by default.
		$classes[] = 'vjs-big-play-centered';

		// Allow user to set skin for individual videos using the skin="" attribute.
		$classes[] = $skin;

		// Note: is_fixed_aspect() check removed here because it's an instance method.
		// However, fixed aspect handling is already done in Player::get_wrapper_start_html()
		// and Player::prepare_video_vars(). If vjs-fill is needed, it can be added here
		// if we can determine fixed_aspect from $atts.
		if ( ! empty( $atts['fixed_aspect'] ) ) {
			$classes[] = 'vjs-fill';
		}

		return $classes;
	}

	/**
	 * Filters the player wrapper div classes for Video.js.
	 *
	 * @param array $classes Existing classes.
	 * @param array $atts    The video player attributes.
	 * @return array Modified classes.
	 */
	public static function filter_player_div_classes( $classes, $atts ): array {
		$skin = $atts['skin'] ?? '';

		if ( ! empty( $skin ) ) {
			$classes[] = $skin;
		}

		return $classes;
	}
}
