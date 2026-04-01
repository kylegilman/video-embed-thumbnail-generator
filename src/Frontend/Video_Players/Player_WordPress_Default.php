<?php
/**
 * WordPress Default (MediaElement.js) player implementation subclass.
 *
 * @package Videopack
 */

namespace Videopack\Frontend\Video_Players;

/**
 * Class Player_WordPress_Default
 *
 * Handles video player implementation using the WordPress default MediaElement.js library.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend/Video_Players
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Player_WordPress_Default extends Player {

	/**
	 * Whether the hooks for MediaElement.js have been registered.
	 *
	 * @var bool $hooks_registered
	 */
	private static $hooks_registered = false;

	/**
	 * Registers WordPress hooks for MediaElement.js.
	 */
	public function register_hooks() {
		parent::register_hooks();

		if ( ! self::$hooks_registered ) {
			add_filter( 'videopack_video_player_data', array( __CLASS__, 'filter_video_vars' ), 10, 2 );
			self::$hooks_registered = true;
		}
	}

	/**
	 * Returns the handles for MediaElement.js specific styles.
	 *
	 * @return array The style handles.
	 */
	public function get_player_style_handles(): array {
		return array_merge( parent::get_player_style_handles(), array( 'wp-mediaelement' ) );
	}

	/**
	 * Returns the handles for MediaElement.js specific scripts.
	 *
	 * @return array The script handles.
	 */
	public function get_player_script_handles(): array {
		return array( 'wp-mediaelement', 'videopack-mejs' );
	}


	/**
	 * Registers frontend scripts for MediaElement.js.
	 */
	public function register_scripts() {

		parent::register_scripts();

		wp_register_script(
			'videopack-mejs',
			plugins_url( '/src/Frontend/js/videopack-mejs.js', VIDEOPACK_PLUGIN_FILE ),
			array( 'wp-mediaelement' ),
			VIDEOPACK_VERSION,
			true
		);
	}

	/**
	 * Filters block metadata to include MediaElement.js dependencies.
	 *
	 * @param array $metadata The block metadata.
	 * @return array The filtered metadata.
	 */
	public function filter_block_metadata( $metadata ) {
		$metadata = $this->ensure_array_and_append( $metadata, 'script', 'wp-mediaelement' );
		$metadata = $this->ensure_array_and_append( $metadata, 'script', 'videopack-mejs' );
		$metadata = $this->ensure_array_and_append( $metadata, 'style', 'wp-mediaelement' );
		return (array) $metadata;
	}

	/**
	 * Enqueues MediaElement.js player-specific scripts and styles.
	 */
	public function enqueue_player_scripts(): void {
		wp_enqueue_script( 'wp-mediaelement' );
		wp_enqueue_script( 'videopack-mejs' );
		wp_enqueue_style( 'wp-mediaelement' );
	}

	/**
	 * Filters the video variables to include MediaElement.js specific settings.
	 *
	 * @param array $video_variables The array of video variables.
	 * @param array $atts            The video player attributes.
	 * @return array The modified video variables.
	 */
	public static function filter_video_vars( array $video_variables, array $atts ): array {
		$mejs_settings = array(
			'features'              => array( 'playpause', 'progress', 'volume', 'tracks', 'sourcechooser' ),
			'classPrefix'           => 'mejs-',
			'stretching'            => 'responsive',
			'pluginPath'            => includes_url( 'js/mediaelement/', 'relative' ),
			'audioShortcodeLibrary' => 'mediaelement',
			'videoShortcodeLibrary' => 'mediaelement',
		);

		// Add speed feature if enabled.
		if ( ! empty( $atts['playback_rate'] ) ) {
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
	 * @return array Modified classes.
	 */
	protected function get_video_classes(): array {
		$classes   = parent::get_video_classes();
		$classes[] = 'wp-video-shortcode'; // Class that MediaElement.js targets.
		return $classes;
	}
}
