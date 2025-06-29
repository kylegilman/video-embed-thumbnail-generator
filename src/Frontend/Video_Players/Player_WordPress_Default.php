<?php

namespace Videopack\Frontend\Video_Players;

class Player_WordPress_Default extends Player {

	public function register_hooks() {
		parent::register_hooks();
		add_filter( 'videopack_video_player_data', array( $this, 'filter_video_vars' ), 10, 2 );
	}

	public function register_scripts() {

		parent::register_scripts();

		wp_register_script(
			'mejs_sourcechooser',
			plugins_url( '/js/mejs-source-chooser.js', __FILE__ ),
			array( 'mediaelement' ),
			VIDEOPACK_VERSION,
			true
		);

		wp_register_script(
			'mejs-speed',
			plugins_url( '/js/mejs-speed.js', __FILE__ ),
			array( 'mediaelement' ),
			VIDEOPACK_VERSION,
			true
		);
	}

	public function enqueue_styles() {

		parent::enqueue_styles();

		wp_enqueue_style( 'video-js', plugins_url( '', dirname( __DIR__ ) ) . '/video-js/video-js.min.css', '', VIDEOPACK_VIDEOJS_VERSION ); // gives access to video-js icons for resolution gear selector and social logos
	}

	/**
	 * Filters the video variables to include MediaElement.js specific settings.
	 *
	 * @param array $video_variables The array of video variables.
	 * @param array $atts The shortcode attributes.
	 * @return array
	 */
	public function filter_video_vars( array $video_variables, array $atts ): array {
		$mejs_settings = array(
			'features'    => array( 'playpause', 'progress', 'volume', 'tracks' ),
			'classPrefix' => 'mejs-',
			'stretching'  => 'responsive',
			'pluginPath'  => includes_url( 'js/mediaelement/', 'relative' ),
			'success'     => 'kgvid_mejs_success', // This function needs to be defined somewhere, likely in videopack.js or a custom script.
		);

		// Add sourcechooser feature if multiple sources are available and option is enabled.
		$has_multiple_resolutions = false;
		if ( $this->get_sources() ) {
			$resolutions = array();
			foreach ( $this->get_sources() as $source_data ) {
				if ( isset( $source_data['resolution'] ) ) {
					$resolutions[] = $source_data['resolution'];
				}
			}
			if ( count( array_unique( $resolutions ) ) > 1 ) {
				$has_multiple_resolutions = true;
			}
		}

		if ( $has_multiple_resolutions ) {
			// Ensure mejs_sourcechooser is enqueued.
			wp_enqueue_script( 'mejs_sourcechooser' );
			if ( ! in_array( 'sourcechooser', $mejs_settings['features'], true ) ) {
				$mejs_settings['features'][] = 'sourcechooser';
			}
		}

		// Add speed feature if enabled.
		if ( $atts['playback_rate'] ) {
			wp_enqueue_script( 'mejs-speed' );
			if ( ! in_array( 'speed', $mejs_settings['features'], true ) ) {
				$mejs_settings['features'][] = 'speed';
			}
			$mejs_settings['speeds'] = array( '0.5', '1', '1.25', '1.5', '2' );
		}

		// Always add fullscreen for video.
		if ( ! in_array( 'fullscreen', $mejs_settings['features'], true ) ) {
			$mejs_settings['features'][] = 'fullscreen';
		}

		// Localize MediaElement.js settings.
		wp_localize_script( 'wp-mediaelement', '_wpmejsSettings', $mejs_settings );

		return $video_variables;
	}

	/**
	 * Overrides the parent's get_video_classes to add MediaElement.js specific classes.
	 *
	 * @param array $classes Existing classes.
	 * @return array Modified classes.
	 */
	protected function get_video_classes(): array {
		$classes   = parent::get_video_classes();
		$classes[] = 'wp-video-shortcode'; // Class that MediaElement.js targets
		return $classes;
	}
}
