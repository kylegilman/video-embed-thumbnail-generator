<?php

namespace Videopack\Frontend\Video_Players;

class Player_Factory {

	/**
	 * Create a video player.
	 *
	 * @param string $embed_method The desired embed method (e.g., 'Video.js', 'WordPress Default').
	 * @param \Videopack\Admin\Options $options_manager The options manager.
	 *
	 * @return Player
	 */
	public static function create( string $embed_method, \Videopack\Admin\Options $options_manager ): Player {

		$player = new Player( $options_manager ); // Default to base Player

		switch ( $embed_method ) {
			case 'Video.js':
				$player = new Player_Video_Js( $options_manager );
				break;
			case 'WordPress Default':
				$player = new Player_WordPress_Default( $options_manager );
				break;
		}

		return apply_filters( 'videopack_video_player', $player, $embed_method, $options_manager );
	}
}
