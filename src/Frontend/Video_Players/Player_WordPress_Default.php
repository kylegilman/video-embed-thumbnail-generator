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
	 * Depends on the raw 'mediaelement' handle rather than 'wp-mediaelement'
	 * deliberately: 'wp-mediaelement' bundles WordPress's own auto-init scan
	 * (wp.mediaelement.initialize(), wp-includes/js/mediaelement/
	 * wp-mediaelement.js), which shares a single global settings object
	 * across every standalone player it constructs on the page — so two
	 * videos with different playback_rate/sourcechooser needs would
	 * incorrectly get the same feature set. Videopack always constructs its
	 * own MediaElementPlayer instances explicitly (players/init.js) with
	 * correct per-video settings instead, so it only needs the underlying
	 * library, never the auto-init wrapper. 'wp-mediaelement' the
	 * *stylesheet* (get_player_style_handles() below) is unrelated and
	 * stays -- that's the actual WordPress-native player styling this
	 * player mode exists to use.
	 *
	 * @return array The script handles.
	 */
	public function get_player_script_handles(): array {
		return array_merge( array( 'mediaelement', 'videopack-mejs' ), parent::get_player_script_handles() );
	}


	/**
	 * Registers frontend scripts for MediaElement.js.
	 */
	public function register_scripts() {

		parent::register_scripts();
	}

	/**
	 * Filters block metadata to include MediaElement.js dependencies.
	 *
	 * @param array $metadata The block metadata.
	 * @return array The filtered metadata.
	 */
	public function filter_block_metadata( $metadata ) {
		$metadata = $this->ensure_array_and_append( $metadata, 'script', 'mediaelement' );
		$metadata = $this->ensure_array_and_append( $metadata, 'script', 'videopack-mejs' );
		$metadata = $this->ensure_array_and_append( $metadata, 'style', 'wp-mediaelement' );
		return (array) $metadata;
	}

	/**
	 * Filters the video variables to include MediaElement.js specific settings.
	 *
	 * @param array $video_variables The array of video variables.
	 * @param array $atts            The video player attributes.
	 * @return array The modified video variables.
	 */
	public static function filter_video_vars( array $video_variables, array $atts ): array {
		$features = array( 'playpause', 'progress', 'volume', 'tracks' );

		$total_sources = 0;
		if ( ! empty( $video_variables['source_groups'] ) && is_array( $video_variables['source_groups'] ) ) {
			foreach ( $video_variables['source_groups'] as $group ) {
				if ( ! empty( $group['sources'] ) && is_array( $group['sources'] ) ) {
					$total_sources += count( $group['sources'] );
				}
			}
		}

		if ( $total_sources > 1 ) {
			$features[] = 'sourcechooser';
		}

		$mejs_settings = array(
			'features'              => $features,
			'classPrefix'           => 'mejs-',
			'stretching'            => 'responsive',
			'pluginPath'            => includes_url( 'js/mediaelement/', 'relative' ),
			'audioShortcodeLibrary' => 'mediaelement',
			'videoShortcodeLibrary' => 'mediaelement',
		);

		// Add speed feature if enabled.
		if ( ! empty( $atts['playback_rate'] ) ) {
			$mejs_settings['features'][] = 'speed';
			$mejs_settings['speeds'] = array( '0.5', '1', '1.25', '1.5', '2' );
		}

		// Always add fullscreen for video.
		$mejs_settings['features'][] = 'fullscreen';

		// The per-video settings (used by our own explicit
		// MediaElementPlayer construction — the lightbox/gallery path,
		// which always builds its own player rather than relying on
		// WordPress's native auto-init) stay scoped to just this video's
		// own feature list; no need for other videos' features on an
		// instance that doesn't need them.
		// Only ever consumed via this per-video mejs_settings, by our own
		// explicit MediaElementPlayer construction (players/init.js) --
		// there's no shared global to also populate since we don't rely on
		// WordPress's native per-page auto-init (see get_player_script_handles()).
		$video_variables['mejs_settings'] = $mejs_settings;

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
