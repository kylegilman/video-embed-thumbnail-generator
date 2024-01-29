<?php

namespace Videopack\Frontend;

class Assets {

	protected $options;

	public function __construct() {

		$this->options = \Videopack\Admin\Options::get_instance()->get_options();
	}

	public function enqueue_shortcode_scripts() {

		if ( substr( $this->options['embed_method'], 0, 8 ) === 'Video.js' ) {

				wp_enqueue_script( 'video-js' );
				wp_enqueue_script( 'videojs-l10n' );

			if ( $this->options['alwaysloadscripts'] == true ) {
				wp_enqueue_script( 'video-quality-selector' );
			}
		}

		do_action( 'videopack_enqueue_shortcode_scripts' );

		wp_enqueue_script( 'videopack' );
	}

	public function enqueue_assets() {

		$videopack_script_dependencies = array( 'jquery' );

		// Video.js styles

		if ( substr( $this->options['embed_method'], 0, 8 ) === 'Video.js' ) {

			$videopack_script_dependencies[] = 'video-js';

			if ( $this->options['embed_method'] == 'Video.js v7' ) {

				$videojs_register = array(
					'version' => '7.21.5',
					'path'    => 'v7',
				);

			}
			if ( $this->options['embed_method'] == 'Video.js v8' ) {

				$videojs_register = array(
					'version' => $this->options['videojs_version'],
					'path'    => 'v8',
				);

			}

			wp_register_script( 'video-js', plugins_url( '', dirname( __DIR__ ) ) . '/video-js/' . $videojs_register['path'] . '/video.min.js', '', $videojs_register['version'], true );
			wp_register_script( 'video-quality-selector', plugins_url( '', dirname( __DIR__ ) ) . '/video-js/' . $videojs_register['path'] . '/video-quality-selector.js', array( 'video-js' ), VIDEOPACK_VERSION, true );
			wp_enqueue_style( 'video-js', plugins_url( '', dirname( __DIR__ ) ) . '/video-js/' . $videojs_register['path'] . '/video-js.min.css', '', $videojs_register['version'] );
			if ( $this->options['js_skin'] !== 'default'
				&& file_exists( plugin_dir_path( dirname( __DIR__ ) ) . '/video-js/v8/skins/' . $this->options['js_skin'] . '.css' )
			) {
				wp_enqueue_style( 'video-js-kg-skin', plugins_url( '', dirname( __DIR__ ) ) . '/video-js/v8/skins/' . $this->options['js_skin'] . '.css', '', VIDEOPACK_VERSION );
			}

			$locale = $this->get_videojs_locale();
			if ( $locale != 'en' && file_exists( plugin_dir_path( dirname( __DIR__ ) ) . '/video-js/' . $videojs_register['path'] . '/lang/' . $locale . '.js' ) ) {
				wp_register_script( 'videojs-l10n', plugins_url( '', dirname( __DIR__ ) ) . '/video-js/' . $videojs_register['path'] . '/lang/' . $locale . '.js', array( 'video-js' ), $videojs_register['version'], true );
			}
		}

		wp_register_script( 'videopack', plugins_url( '/js/videopack.js', __FILE__ ), $videopack_script_dependencies, VIDEOPACK_VERSION, true );

		wp_localize_script(
			'videopack',
			'videopack_l10n',
			array(
				'ajaxurl'    => admin_url( 'admin-ajax.php', is_ssl() ? 'admin' : 'http' ),
				'ajax_nonce' => wp_create_nonce( 'videopack_frontend_nonce' ),
				'playstart'  => esc_html_x( 'Play Start', 'noun for Google Analytics event', 'video-embed-thumbnail-generator' ),
				'pause'      => esc_html_x( 'Pause', 'noun for Google Analytics event', 'video-embed-thumbnail-generator' ),
				'resume'     => esc_html_x( 'Resume', 'noun for Google Analytics event', 'video-embed-thumbnail-generator' ),
				'seek'       => esc_html_x( 'Seek', 'noun for Google Analytics event', 'video-embed-thumbnail-generator' ),
				'end'        => esc_html_x( 'Complete View', 'noun for Google Analytics event', 'video-embed-thumbnail-generator' ),
				'next'       => esc_html_x( 'Next', 'button text to play next video', 'video-embed-thumbnail-generator' ),
				'previous'   => esc_html_x( 'Previous', 'button text to play previous video', 'video-embed-thumbnail-generator' ),
				'quality'    => esc_html_x( 'Quality', 'text above list of video resolutions', 'video-embed-thumbnail-generator' ),
				'fullres'    => esc_html_x( 'Full', 'Full resolution', 'video-embed-thumbnail-generator' ),
			)
		);

		if ( $this->options['embed_method'] == 'WordPress Default' ) {

			wp_register_script( 'mejs_sourcechooser', plugins_url( '/js/mejs-source-chooser.js', __FILE__ ), array( 'mediaelement' ), VIDEOPACK_VERSION, true );

			wp_register_script( 'mejs-speed', plugins_url( '/js/mejs-speed.js', __FILE__ ), array( 'mediaelement' ), VIDEOPACK_VERSION, true );

			wp_enqueue_style( 'video-js', plugins_url( '', dirname( __DIR__ ) ) . '/video-js/v8/video-js.min.css', '', $this->options['videojs_version'] ); // gives access to video-js icons for resolution gear selector and social logos

		}

		// plugin-related frontend styles, requires video-js
		if ( $this->options['embed_method'] != 'None' ) {
			if ( $this->options['embed_method'] === 'Video.js v7' ) {
				wp_enqueue_style( 'videopack_styles', plugins_url( '/css/videopack-styles-v7.css', __FILE__ ), array( 'video-js' ), VIDEOPACK_VERSION );
			} else {
				wp_enqueue_style( 'videopack_styles', plugins_url( '/css/videopack-styles.css', __FILE__ ), array( 'video-js' ), VIDEOPACK_VERSION );
			}
		}

		if ( $this->options['alwaysloadscripts'] == true ) {
			$this->enqueue_shortcode_scripts();
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
}
