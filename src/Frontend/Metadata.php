<?php
/**
 * Frontend metadata handler.
 *
 * @package Videopack
 */

namespace Videopack\Frontend;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Metadata
 *
 * Handles the generation and display of metadata (Open Graph, etc.) for videos.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Metadata implements Hook_Subscriber {

	/**
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'wp_head',
				'callback' => 'print_scripts',
			),
		);
	}

	/**
	 * Returns an array of filters to subscribe to.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array();
	}

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry|null $format_registry
	 */
	protected $format_registry;

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Attachment meta handler.
	 *
	 * @var \Videopack\Admin\Attachment_Meta $attachment_meta
	 */
	protected $attachment_meta;

	/**
	 * Constructor.
	 *
	 * @param array                                  $options         Videopack options array.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Optional. Videopack video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry = null ) {

		$this->options = $options;
		if ( ! $format_registry ) {
			$format_registry = new \Videopack\Admin\Formats\Registry( $options );
		}
		$this->format_registry = $format_registry;
		$this->attachment_meta = new \Videopack\Admin\Attachment_Meta( $options );
	}

	/**
	 * Detects the first Videopack video in the post content (Block or Shortcode).
	 *
	 * @param \WP_Post|null $post The post object.
	 * @return array The video attributes and metadata.
	 */
	public function get_first_embedded_video( $post ) {
		if ( ! $post || empty( $post->post_content ) ) {
			return array( 'url' => '' );
		}

		$atts = (array) Video_Finder::find_first( (string) $post->post_content );

		if ( empty( $atts ) ) {
			return array( 'url' => '' );
		}

		$source_input = $atts['id'] ?? $atts['src'] ?? null;
		if ( ! $source_input ) {
			return array( 'url' => '' );
		}

		$source = \Videopack\Video_Source\Source_Factory::create( $source_input, $this->options, $this->format_registry );
		if ( ! $source || ! (bool) $source->exists() ) {
			return array( 'url' => '' );
		}

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options );
		$final_atts        = (array) $shortcode_handler->get_final_atts( (array) $atts, $source );

		$final_atts['url']         = (string) $source->get_url();
		$final_atts['id']          = (string) $source->get_id();
		$final_atts['mime_type']   = (string) $source->get_mime_type();
		$final_atts['description'] = (string) $this->generate_video_description( (array) $final_atts, $post );

		return (array) $final_atts;
	}

	/**
	 * Prints Open Graph metadata to the head of the page.
	 *
	 * @return void
	 */
	public function print_scripts() {
		if ( ! (bool) ( $this->options['open_graph'] ?? false ) ) {
			return;
		}

		$post = get_post();
		if ( ! $post instanceof \WP_Post ) {
			return;
		}

		$video = (array) $this->get_first_embedded_video( $post );
		if ( empty( $video['url'] ) ) {
			return;
		}

		// Disable Jetpack OG tags if present to prevent duplication.
		remove_action( 'wp_head', 'jetpack_og_tags' );

		$og_tags = array(
			'og:type'             => 'video.other',
			'og:url'              => (string) get_permalink( $post ),
			'og:title'            => (string) get_the_title( $post ),
			'og:description'      => (string) ( $video['description'] ?? '' ),
			'og:video'            => (string) $video['url'],
			'og:video:secure_url' => (string) str_replace( 'http://', 'https://', (string) $video['url'] ),
			'og:video:type'       => (string) ( $video['mime_type'] ?? '' ),
		);

		if ( ! empty( $video['width'] ) ) {
			$og_tags['og:video:width'] = (string) $video['width'];
		}
		if ( ! empty( $video['height'] ) ) {
			$og_tags['og:video:height'] = (string) $video['height'];
		}

		if ( ! empty( $video['poster'] ) ) {
			$og_tags['og:image']        = (string) $video['poster'];
			$og_tags['og:image:width']  = (string) ( $video['width'] ?? '' );
			$og_tags['og:image:height'] = (string) ( $video['height'] ?? '' );
		}

		echo "\n<!-- Videopack Open Graph Meta Tags -->\n";
		foreach ( (array) $og_tags as $property => $content ) {
			if ( ! empty( $content ) ) {
				printf( '<meta property="%s" content="%s" >' . "\n", esc_attr( (string) $property ), esc_attr( (string) $content ) );
			}
		}
	}

	/**
	 * Builds paired attributes (key="value").
	 *
	 * @param string $value The attribute value.
	 * @param string $key   The attribute key.
	 * @return string The formatted attribute string.
	 */
	public function build_paired_attributes( $value, $key ) {
		return $key . '="' . $value . '"';
	}

	/**
	 * Generates a description for a video.
	 *
	 * @param array         $query_atts The video attributes.
	 * @param \WP_Post|bool $post       Optional. The post object.
	 * @return string The generated description.
	 */
	public function generate_video_description( array $query_atts, $post = false ) {

		$description = '';

		if ( array_key_exists( 'description', $query_atts ) && ! empty( $query_atts['description'] ) && 'false' !== (string) $query_atts['description'] ) {
			$description = (string) $query_atts['description'];
		} elseif ( array_key_exists( 'caption', $query_atts ) && ! empty( $query_atts['caption'] ) && 'false' !== (string) $query_atts['caption'] ) {
			$description = (string) $query_atts['caption'];
		} elseif ( false !== $post || ( (bool) in_the_loop() && ! (bool) is_attachment() ) ) {

			if ( false === $post ) {
				$post = get_post();
			}

			if ( $post instanceof \WP_Post ) {
				$yoast_meta   = get_post_meta( (int) $post->ID, '_yoast_wpseo_metadesc', true ); // Try Yoast SEO meta description tag.
				$aioseop_meta = get_post_meta( (int) $post->ID, '_aioseop_description', true );   // Try All in one SEO Pack meta description tag.

				if ( ! empty( $yoast_meta ) ) {
					$description = (string) $yoast_meta;
				} elseif ( ! empty( $aioseop_meta ) ) {
					$description = (string) $aioseop_meta;
				} elseif ( ! empty( $post->post_excerpt ) ) {
					$description = (string) $post->post_excerpt;
				} else {
					$description = (string) wp_trim_words( (string) wp_strip_all_tags( (string) strip_shortcodes( (string) $post->post_content ), true ) );
				}
			}
		}

		if ( empty( $description ) ) {
			$description = (string) esc_html__( 'Video', 'video-embed-thumbnail-generator' );
		}

		/**
		 * Filters the generated video description.
		 *
		 * @param string $description The generated description.
		 * @param array  $query_atts  The video attributes.
		 */
		return (string) apply_filters( 'videopack_generate_video_description', (string) $description, (array) $query_atts );
	}
}
