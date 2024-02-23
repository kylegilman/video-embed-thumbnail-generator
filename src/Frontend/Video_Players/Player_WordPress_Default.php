<?php

namespace Videopack\Frontend\Video_Players;

class Player_WordPress_Default extends Player {

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

		wp_enqueue_style( 'video-js', plugins_url( '', dirname( __DIR__ ) ) . '/video-js/video-js.min.css', '', $this->options['videojs_version'] ); // gives access to video-js icons for resolution gear selector and social logos
	}

	protected function video(): string {
		$executed_shortcode = wp_video_shortcode( $this->wp_shortcode_atts() );
		return $executed_shortcode;
	}

	protected function wp_shortcode_atts(): array {
		$shortcode_atts = array(
			'src'      => strtok( $this->get_main_source_url(), '?' ), // remove query string
			'poster'   => $this->get_poster(),
			'loop'     => $this->atts['loop'],
			'autoplay' => $this->atts['autoplay'],
			'muted'    => $this->atts['muted'],
			'preload'  => $this->atts['preload'],
		);
		return $shortcode_atts;
	}
}
