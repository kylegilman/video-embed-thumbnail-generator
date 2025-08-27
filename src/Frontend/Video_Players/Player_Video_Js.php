<?php

namespace Videopack\Frontend\Video_Players;

class Player_Video_Js extends Player {

	public function register_hooks() {

		parent::register_hooks();

		add_filter( 'videopack_video_player_data', array( $this, 'filter_video_vars' ), 10, 2 );
		add_filter( 'videopack_video_player_classes', array( $this, 'filter_video_classes' ), 10, 2 );
	}

	public function register_scripts() {
		parent::register_scripts();

		wp_register_script( 'video-js', plugins_url( 'video-js/video.min.js', VIDEOPACK_PLUGIN_FILE ), array(), VIDEOPACK_VIDEOJS_VERSION, true );
		wp_register_style( 'video-js', plugins_url( 'video-js/video-js.min.css', VIDEOPACK_PLUGIN_FILE ), array(), VIDEOPACK_VIDEOJS_VERSION );

		$js_skins = array(
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

	public function filter_block_metadata( $metadata ) {
		// Add script dependencies.
		$metadata['script'][] = 'video-js';

		// Add style dependencies.
		$metadata['style'][] = 'video-js';
		if ( ! empty( $this->options['skin'] ) && 'default' !== $this->options['skin'] ) {
			$metadata['style'][] = $this->options['skin'];
		}
		return $metadata;
	}

	public function enqueue_player_scripts(): void {
		wp_enqueue_script( 'video-js' );
		wp_enqueue_style( 'video-js' );

		if ( ! empty( $this->options['skin'] ) ) {
			wp_enqueue_style( $this->options['skin'] );
		}

		if ( wp_script_is( 'videojs-l10n', 'registered' ) ) {
			wp_enqueue_script( 'videojs-l10n' );
		}
	}

	protected function get_videojs_locale() {

		$locale = get_locale();

		$locale_conversions = array( // all Video.js language codes are two-character except these
			'pt-BR' => 'pt_BR',
			'pt-PT' => 'pt_PT',
			'zh-CN' => 'zh_CN',
			'zh-TW' => 'zh_TW',
		);

		$matching_locale = array_search( $locale, $locale_conversions );
		if ( $matching_locale !== false ) {
			$locale = $matching_locale;
		} else {
			$locale = substr( $locale, 0, 2 );
		}

		return $locale;
	}

	public function filter_video_vars( $video_variables, $atts ) {

		$video_variables['nativecontrolsfortouch'] = $atts['nativecontrolsfortouch'];
		$video_variables['locale']                 = $this->get_videojs_locale();

		return $video_variables;
	}

	public function filter_video_classes( $classes, $atts ): array {

		$classes[] = 'video-js';
		$skin      = $this->options['skin'] ?? 'vjs-default-skin';
		if ( empty( $skin ) ) {
			$skin = 'vjs-default-skin';
		}

		// Allow user to set skin for individual videos using the skin="" attribute.
		$classes[] = $atts['skin'] ?? $skin;

		return $classes;
	}
}
