<?php
/**
 * Video player factory class.
 *
 * @package Videopack
 */

namespace Videopack\Frontend\Video_Players;

/**
 * Class Player_Factory
 *
 * Creates instances of video player subclasses based on the provided embed method.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend/Video_Players
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Player_Factory {

	/**
	 * Create a video player instance.
	 *
	 * @param string                   $embed_method    The desired embed method (e.g., 'Video.js', 'WordPress Default').
	 * @param \Videopack\Admin\Options $options_manager The options manager instance.
	 *
	 * @return Player The video player instance.
	 */
	public static function create( string $embed_method, \Videopack\Admin\Options $options_manager ): Player {

		$player = new Player( $options_manager ); // Default to base Player.

		switch ( $embed_method ) {
			case 'Video.js':
				$player = new Player_Video_Js( $options_manager );
				break;
			case 'WordPress Default':
				$player = new Player_WordPress_Default( $options_manager );
				break;
		}

		/**
		 * Filter the video player instance.
		 *
		 * @param Player                   $player          The video player instance.
		 * @param string                   $embed_method    The embed method.
		 * @param \Videopack\Admin\Options $options_manager The options manager instance.
		 */
		return apply_filters( 'videopack_video_player', $player, $embed_method, $options_manager );
	}
}
