<?php

namespace Videopack\Frontend\Video_Players;

class Meta_Bar {

	public static function output( $atts ) {

		$code  = '<div class="videopack-meta-bar">';
		$code .= $this->title();
		$code .= $this->embed_code();
		$code .= $this->download_link();
		$code .= $this->social_buttons();
		$code .= '</div>';

		return $code;
	}
}
