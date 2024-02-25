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

	public function modify_video_shortcode_output( $output ) {

		$dom = new \DOMDocument();

		// Suppress errors due to HTML5 elements like <video> that DOMDocument might not recognize.
		libxml_use_internal_errors( true );
		$dom->loadHTML( mb_convert_encoding( $output, 'HTML-ENTITIES', 'UTF-8' ), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		libxml_clear_errors();

		// Remove the inline style from the outer <div> element.
		$divs = $dom->getElementsByTagName( 'div' );
		foreach ( $divs as $div ) {
			if ( $div->hasAttribute( 'style' ) ) {
				$div->removeAttribute( 'style' );
			}
		}

		// Remove width and height attributes from the <video> tag.
		$videos = $dom->getElementsByTagName( 'video' );
		foreach ( $videos as $video ) {
			$video->removeAttribute( 'width' );
			$video->removeAttribute( 'height' );
		}

		// Remove all existing <source> elements.
		$sources = $dom->getElementsByTagName( 'source' );
		// phpcs:disable Generic.CodeAnalysis.AssignmentInCondition.FoundInWhileCondition -- assignment is intentional.
		while ( $source = $sources->item( 0 ) ) {
		// phpcs:enable Generic.CodeAnalysis.AssignmentInCondition.FoundInWhileCondition

			// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMDocument properties are not snake_case.
			$source->parentNode->removeChild( $source );
			// phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		}

		foreach ( $sources as $source ) {
			$new_source  = $dom->createElement( 'source' );
			$source_type = $source['type'];

			// Append codecs to type if not empty.
			if ( ! empty( $source['codecs'] ) ) {
				$source_type .= '; codecs="' . $source['codecs'] . '"';
			}

			$new_source->setAttribute( 'src', $source['src'] );
			$new_source->setAttribute( 'type', $source_type );

			if ( ! empty( $source['resolution'] ) ) {
				$new_source->setAttribute( 'data-res', $source['resolution'] );
			}

			$videos->item( 0 )->appendChild( $new_source );
		}

		return $dom->saveHTML();
	}

	protected function get_video_code(): string {
		$executed_shortcode = wp_video_shortcode( $this->get_wp_shortcode_atts() );
		return $this->modify_video_shortcode_output( $executed_shortcode );
	}

	protected function get_wp_shortcode_atts(): array {
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
