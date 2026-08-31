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
	 * @param string                                 $embed_method The desired embed method (e.g., 'Video.js', 'WordPress Default').
	 * @param array                                  $options      Videopack options array.
	 * @param \Videopack\Admin\Formats\Registry|null $registry     Optional. Videopack video formats registry.
	 *
	 * @return Player The video player instance.
	 */
	public static function create( string $embed_method, array $options, \Videopack\Admin\Formats\Registry $registry = null ): Player {

		switch ( $embed_method ) {
			case 'Video.js':
				$player = new Player_Video_Js( $options, $registry );
				break;
			case 'WordPress Default':
				$player = new Player_WordPress_Default( $options, $registry );
				break;
			default:
				// Player's constructor increments a static instance counter
				// used for the player's HTML/JS id -- constructing one here
				// unconditionally before the switch (and then discarding it
				// whenever the switch matched) burned an extra id for every
				// real player created.
				$player = new Player( $options, $registry );
				break;
		}

		/**
		 * Filter the video player instance.
		 *
		 * @param Player                                     $player       The video player instance.
		 * @param string                                     $embed_method The embed method.
		 * @param array                                      $options      Videopack options array.
		 * @param \Videopack\Admin\Formats\Registry|null $registry     Videopack video formats registry.
		 */
		return apply_filters( 'videopack_video_player', $player, $embed_method, $options, $registry );
	}
}
