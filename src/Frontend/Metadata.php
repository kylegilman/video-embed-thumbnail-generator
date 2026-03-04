<?php

namespace Videopack\Frontend;

class Metadata {

	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;
	protected $options;
	protected $attachment_meta;

	public function __construct( \Videopack\Admin\Options $options_manager ) {

		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->attachment_meta = new \Videopack\Admin\Attachment_Meta( $options_manager );
	}

	/**
	 * Detects the first Videopack video in the post content (Block or Shortcode).
	 *
	 * @param \WP_Post $post The post object.
	 * @return array The video attributes and metadata.
	 */
	public function get_first_embedded_video( $post ) {
		if ( ! $post || empty( $post->post_content ) ) {
			return array( 'url' => '' );
		}

		$atts = Video_Finder::find_first( $post->post_content );

		if ( empty( $atts ) ) {
			return array( 'url' => '' );
		}

		$source_input = $atts['id'] ?? $atts['src'] ?? null;
		if ( ! $source_input ) {
			return array( 'url' => '' );
		}

		$source = \Videopack\Video_Source\Source_Factory::create( $source_input, $this->options_manager );
		if ( ! $source || ! $source->exists() ) {
			return array( 'url' => '' );
		}

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options_manager );
		$final_atts        = $shortcode_handler->get_final_atts( $atts, $source );

		$final_atts['url']         = $source->get_url();
		$final_atts['id']          = $source->get_id();
		$final_atts['mime_type']   = $source->get_mime_type();
		$final_atts['description'] = $this->generate_video_description( $final_atts, $post );

		return $final_atts;
	}

	/**
	 * Prints Open Graph metadata to the head of the page.
	 */
	public function print_scripts() {
		if ( ! $this->options['open_graph'] ) {
			return;
		}

		$post = get_post();
		if ( ! $post ) {
			return;
		}

		$video = $this->get_first_embedded_video( $post );
		if ( empty( $video['url'] ) ) {
			return;
		}

		// Disable Jetpack OG tags if present to prevent duplication
		remove_action( 'wp_head', 'jetpack_og_tags' );

		$og_tags = array(
			'og:type'             => 'video.other',
			'og:url'              => get_permalink( $post ),
			'og:title'            => get_the_title( $post ),
			'og:description'      => $video['description'],
			'og:video'            => $video['url'],
			'og:video:secure_url' => str_replace( 'http://', 'https://', $video['url'] ),
			'og:video:type'       => $video['mime_type'],
		);

		if ( ! empty( $video['width'] ) ) {
			$og_tags['og:video:width'] = $video['width'];
		}
		if ( ! empty( $video['height'] ) ) {
			$og_tags['og:video:height'] = $video['height'];
		}

		if ( ! empty( $video['poster'] ) ) {
			$og_tags['og:image']        = $video['poster'];
			$og_tags['og:image:width']  = $video['width'] ?? '';
			$og_tags['og:image:height'] = $video['height'] ?? '';
		}

		echo "\n<!-- Videopack Open Graph Meta Tags -->\n";
		foreach ( $og_tags as $property => $content ) {
			if ( ! empty( $content ) ) {
				printf( '<meta property="%s" content="%s" >' . "\n", esc_attr( $property ), esc_attr( $content ) );
			}
		}
	}

	public function build_paired_attributes( $value, $key ) {
		return $key . '="' . $value . '"';
	}

	public function generate_video_description( $query_atts, $post = false ) {

		if ( array_key_exists( 'description', $query_atts ) && ! empty( $query_atts['description'] ) && $query_atts['description'] != 'false' ) {
			$description = $query_atts['description'];
		} elseif ( array_key_exists( 'description', $query_atts ) && ! empty( $query_atts['caption'] ) && $query_atts['caption'] != 'false' ) {
			$description = $query_atts['caption'];
		} elseif ( $post != false || ( in_the_loop() && ! is_attachment() ) ) {

			if ( $post == false ) {
				$post = get_post();
			}

			$yoast_meta   = get_post_meta( $post->ID, '_yoast_wpseo_metadesc', true ); // try Yoast SEO meta description tag
			$aioseop_meta = get_post_meta( $post->ID, '_aioseop_description', true ); // try All in one SEO Pack meta description tag

			if ( ! empty( $yoast_meta ) ) {
				$description = $yoast_meta;
			} elseif ( ! empty( $aioseop_meta ) ) {
				$description = $aioseop_meta;
			} elseif ( ! empty( $post->post_excerpt ) ) {
				$description = $post->post_excerpt;
			} else {
				$description = wp_trim_words( wp_strip_all_tags( strip_shortcodes( $post->post_content ), true ) );
			}
		}
		if ( empty( $description ) ) {
			$description = esc_html__( 'Video', 'video-embed-thumbnail-generator' );
		}

		return apply_filters( 'videopack_generate_video_description', $description, $query_atts );
	}
}
