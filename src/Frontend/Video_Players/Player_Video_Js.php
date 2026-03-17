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
	 * Registers WordPress hooks for Video.js.
	 */
	public function register_hooks() {

		parent::register_hooks();

		add_filter( 'videopack_video_player_data', array( $this, 'filter_video_vars' ), 10, 2 );
		add_filter( 'videopack_video_player_classes', array( $this, 'filter_video_classes' ), 10, 2 );
		add_filter( 'videopack_player_div_classes', array( $this, 'filter_player_div_classes' ), 10, 2 );
	}

	/**
	 * Registers frontend scripts and styles for Video.js.
	 */
	public function register_scripts() {
		parent::register_scripts();

		wp_register_script( 'video-js', plugins_url( 'video-js/video.min.js', VIDEOPACK_PLUGIN_FILE ), array(), VIDEOPACK_VIDEOJS_VERSION, true );
		wp_register_script( 'video-js-quality-selector', plugins_url( 'video-js/video-quality-selector.js', VIDEOPACK_PLUGIN_FILE ), array( 'video-js' ), VIDEOPACK_VERSION, true );

		$locale         = $this->get_videojs_locale();
		$translations   = array(
			'Quality' => esc_html_x( 'Quality', 'text above list of video resolutions', 'video-embed-thumbnail-generator' ),
			'Full'    => esc_html_x( 'Full', 'Full resolution', 'video-embed-thumbnail-generator' ),
		);
		$inline_script  = sprintf(
			'videojs.addLanguage(\'%s\', %s);',
			$locale,
			wp_json_encode( $translations )
		);
		wp_add_inline_script( 'video-js-quality-selector', (string) $inline_script );

		wp_register_style( 'video-js', plugins_url( 'video-js/video-js.min.css', VIDEOPACK_PLUGIN_FILE ), array(), VIDEOPACK_VIDEOJS_VERSION );

		$js_skins = array(
			'vjs-theme-videopack',
			'kg-video-js-skin',
			'vjs-theme-city',
			'vjs-theme-fantasy',
			'vjs-theme-forest',
			'vjs-theme-sea',
		);
		foreach ( $js_skins as $skin ) {
			wp_register_style( $skin, plugins_url( 'video-js/skins/' . $skin . '.css', VIDEOPACK_PLUGIN_FILE ), array( 'video-js' ), VIDEOPACK_VERSION );
		}
	}

	/**
	 * Filters block metadata to include Video.js dependencies.
	 *
	 * @param array $metadata The block metadata.
	 * @return array The filtered metadata.
	 */
	public function filter_block_metadata( $metadata ) {
		// Add script dependencies.
		$metadata['script'][] = 'video-js';
		$metadata['script'][] = 'video-js-quality-selector';

		// Add style dependencies.
		$metadata['style'][] = 'video-js';
		if ( ! empty( $this->options['skin'] ) && 'default' !== $this->options['skin'] ) {
			$metadata['style'][] = $this->options['skin'];
		}
		return $metadata;
	}

	/**
	 * Enqueues Video.js player-specific scripts and styles.
	 */
	public function enqueue_player_scripts(): void {
		wp_enqueue_script( 'video-js' );
		wp_enqueue_script( 'video-js-quality-selector' );
		wp_enqueue_style( 'video-js' );

		if ( ! empty( $this->options['skin'] ) ) {
			wp_enqueue_style( $this->options['skin'] );
		}

		if ( wp_script_is( 'videojs-l10n', 'registered' ) ) {
			wp_enqueue_script( 'videojs-l10n' );
		}
	}

	/**
	 * Returns the Video.js compatible locale code.
	 *
	 * @return string The locale code.
	 */
	protected function get_videojs_locale() {

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
	public function filter_video_vars( $video_variables, $atts ) {

		$video_variables['nativecontrolsfortouch'] = (bool) ( $atts['nativecontrolsfortouch'] ?? false );
		$video_variables['locale']                 = $this->get_videojs_locale();

		return $video_variables;
	}

	/**
	 * Filters the video element classes for Video.js.
	 *
	 * @param array $classes Existing classes.
	 * @param array $atts    The video player attributes.
	 * @return array Modified classes.
	 */
	public function filter_video_classes( $classes, $atts ): array {

		$classes[] = 'video-js';
		$skin      = $this->options['skin'] ?? 'vjs-default-skin';
		if ( empty( $skin ) ) {
			$skin = 'vjs-default-skin';
		}

		// Allow user to set skin for individual videos using the skin="" attribute.
		$classes[] = $atts['skin'] ?? $skin;

		if ( $this->is_fixed_aspect() ) {
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
	public function filter_player_div_classes( $classes, $atts ): array {
		$default_skin = $this->options['skin'] ?? '';
		$skin         = $atts['skin'] ?? $default_skin;

		if ( ! empty( $skin ) ) {
			$classes[] = $skin;
		}

		return $classes;
	}
}
