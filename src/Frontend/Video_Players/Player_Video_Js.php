<?php

namespace Videopack\Frontend\Video_Players;

class Player_Video_Js extends Player {

	public function register_hooks() {

		parent::register_hooks();

		add_filter( 'videopack_video_player_data', array( $this, 'filter_video_vars' ), 10, 2 );
		add_filter( 'videopack_video_player_classes', array( $this, 'filter_video_classes' ), 10, 2 );
	}

	public function register_scripts() {

		wp_register_script(
			'video-js',
			plugins_url( '', dirname( __DIR__ ) ) . '/video-js/video.min.js',
			'',
			VIDEOPACK_VIDEOJS_VERSION,
			true
		);

		wp_register_script(
			'video-quality-selector',
			plugins_url( '', dirname( __DIR__ ) ) . '/video-js/video-quality-selector.js',
			array( 'video-js' ),
			VIDEOPACK_VERSION,
			true
		);

		$locale = $this->get_videojs_locale();
		if ( $locale != 'en' && file_exists( plugin_dir_path( dirname( __DIR__ ) ) . '/video-js/lang/' . $locale . '.js' ) ) {
			wp_register_script(
				'videojs-l10n',
				plugins_url( '', dirname( __DIR__ ) ) . '/video-js/lang/' . $locale . '.js',
				array( 'video-js' ),
				VIDEOPACK_VIDEOJS_VERSION,
				true
			);
		}

		parent::register_scripts();
	}

	public function enqueue_styles() {

		parent::enqueue_styles();

		wp_enqueue_style(
			'video-js',
			plugins_url( '', dirname( __DIR__ ) ) . '/video-js/video-js.min.css',
			'',
			VIDEOPACK_VIDEOJS_VERSION
		);

		if ( $this->options['skin'] !== 'default'
			&& file_exists( plugin_dir_path( dirname( __DIR__ ) ) . '/video-js/skins/' . $this->options['skin'] . '.css' )
		) {
			wp_enqueue_style(
				'video-js-kg-skin',
				plugins_url( '', dirname( __DIR__ ) ) . '/video-js/skins/' . $this->options['skin'] . '.css',
				'',
				VIDEOPACK_VERSION
			);
		}
	}

	public function enqueue_scripts(): void {

		wp_enqueue_script( 'video-js' );
		wp_enqueue_script( 'videojs-l10n' );

		if ( $this->options['alwaysloadscripts'] == true ) {
			wp_enqueue_script( 'video-quality-selector' );
		}

		parent::enqueue_scripts();
	}

	public function get_videopack_script_dependencies(): array {

		$videopack_script_dependencies   = parent::get_videopack_script_dependencies();
		$videopack_script_dependencies[] = 'video-js';
		return $videopack_script_dependencies;
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
