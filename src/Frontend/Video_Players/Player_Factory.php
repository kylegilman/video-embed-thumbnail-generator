<?php

namespace Videopack\Frontend\Video_Players;

class Player_Factory {

	/**
	 * Create a video player.
	 *
	 * @param \Videopack\Admin\Options $options_manager The options manager.
	 *
	 * @return Player
	 */
	public static function create( \Videopack\Admin\Options $options_manager ): Player {
		$player  = null;
		$options = $options_manager->get_options();

		switch ( $options_manager->embed_method ) {
			case 'Video.js v8':
				$player = new Player_Video_Js( $options_manager );
				break;
			case 'WordPress Default':
				$player = new Player_WordPress_Default( $options_manager );
				break;
		}

		return apply_filters( 'videopack_video_player', $player, $options_manager );
	}
}
