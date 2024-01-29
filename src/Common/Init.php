<?php

namespace Videopack\Common;

class Init {

	public function load_options() {
		$multisite = new \Videopack\Admin\Multisite();
		if ( $multisite->is_videopack_active_for_network() ) {
			$multisite->init();
		}//end network activation setup

		$videopack_options = \Videopack\Admin\Options::get_instance();
	}
}
