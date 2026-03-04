<?php

namespace Videopack\Frontend;

/**
 * Handles JSON-LD Schema.org markup for videos.
 *
 * This class collects video information from the current post's content (blocks and shortcodes)
 * and provides it to SEO plugins or outputs it as JSON-LD in the head.
 */
class Schema {

	/**
	 * Videopack Options manager class instance.
	 *
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Collected video data for the current page.
	 *
	 * @var array $videos
	 */
	protected $videos = array();

	/**
	 * Constructor.
	 *
	 * @param \Videopack\Admin\Options $options_manager The options manager instance.
	 */
	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
	}

	/**
	 * Initializes the schema collection and determines the output method.
	 * Recommended to be called on 'template_redirect' hook.
	 */
	public function init() {
		if ( ! $this->options['schema'] || ! is_singular() ) {
			return;
		}

		$this->collect_videos();

		if ( empty( $this->videos ) ) {
			return;
		}

		$has_seo_plugin = $this->register_seo_filters();

		// Fallback output if no SEO plugin integration was successful.
		if ( ! $has_seo_plugin ) {
			add_action( 'wp_head', array( $this, 'output_fallback_json_ld' ), 20 );
		}
	}

	/**
	 * Collects video information from the current post's content.
	 */
	protected function collect_videos() {
		global $post;
		if ( ! $post || empty( $post->post_content ) ) {
			return;
		}

		$all_detected_atts = Video_Finder::find_all( $post->post_content );
		foreach ( $all_detected_atts as $atts ) {
			$this->add_video_from_attributes( $atts );
		}

		// Deduplicate videos by contentUrl to avoid double schema on the same video
		$unique_videos = array();
		foreach ( $this->videos as $video ) {
			if ( ! empty( $video['contentUrl'] ) ) {
				$unique_videos[ $video['contentUrl'] ] = $video;
			}
		}
		$this->videos = array_values( $unique_videos );
	}

	/**
	 * Creates a VideoObject and adds it to the collection.
	 *
	 * @param array $atts The block or shortcode attributes.
	 */
	protected function add_video_from_attributes( array $atts ) {
		global $post;
		$source_input = $atts['id'] ?? $atts['src'] ?? null;
		if ( ! $source_input ) {
			return;
		}

		$source = \Videopack\Video_Source\Source_Factory::create( $source_input, $this->options_manager );
		if ( ! $source || ! $source->exists() ) {
			return;
		}

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options_manager );
		$final_atts        = $shortcode_handler->get_final_atts( $atts, $source );

		$upload_date = is_numeric( $source->get_id() ) ? get_the_date( 'c', $source->get_id() ) : ( $post ? get_the_date( 'c', $post->ID ) : gmdate( 'c' ) );

		$video_data = array(
			'@type'        => 'VideoObject',
			'name'         => $final_atts['stats_title'],
			'description'  => ! empty( $final_atts['description'] ) ? $final_atts['description'] : $final_atts['stats_title'],
			'thumbnailUrl' => $final_atts['poster'],
			'uploadDate'   => $upload_date,
			'contentUrl'   => $source->get_url(),
		);

		// Add embedUrl if applicable
		if ( is_numeric( $source->get_id() ) ) {
			$video_data['embedUrl'] = site_url( '/?attachment_id=' . $source->get_id() . '&videopack[enable]=true' );
		}

		$this->videos[] = $video_data;
	}

	/**
	 * Registers filters for popular SEO plugins to integrate Videopack video data.
	 *
	 * @return bool True if at least one SEO plugin integration was attempted.
	 */
	protected function register_seo_filters(): bool {
		$integrated = false;

		// 1. Rank Math
		if ( defined( 'RANK_MATH_VERSION' ) ) {
			add_filter( 'rank_math/json_ld', array( $this, 'rank_math_integration' ), 10, 2 );
			$integrated = true;
		}

		// 2. Yoast SEO
		// Yoast uses a graph-based approach. We add our VideoObjects to the graph.
		if ( defined( 'WPSEO_VERSION' ) ) {
			add_filter( 'wpseo_schema_graph', array( $this, 'yoast_integration' ) );
			$integrated = true;
		}

		// 3. SEOPress
		// SEOPress only provides structured data filters in the Pro version.
		if ( function_exists( 'seopress_init' ) && defined( 'SEOPRESS_PRO_VERSION' ) ) {
			add_filter( 'seopress_schema_json_ld', array( $this, 'seopress_integration' ) );
			$integrated = true;
		}

		// 4. All in One SEO
		if ( defined( 'AIOSEO_VERSION' ) ) {
			add_filter( 'aioseo_schema_output', array( $this, 'aioseo_integration' ) );
			$integrated = true;
		}

		return apply_filters( 'videopack_schema_integrated_with_seo', $integrated, $this->videos );
	}

	/**
	 * Integration for Rank Math.
	 */
	public function rank_math_integration( $data ) {
		if ( ! isset( $data['VideoObject'] ) ) {
			$data['VideoObject'] = array();
		}
		foreach ( $this->videos as $video ) {
			// Rank Math adds @context outside if needed, strip it if present or let them handle it.
			$data['VideoObject'][] = $video;
		}
		return $data;
	}

	/**
	 * Integration for Yoast SEO.
	 */
	public function yoast_integration( $graph ) {
		global $post;
		foreach ( $this->videos as $video ) {
			// Add @context if it's not already there and if Yoast doesn't wrap the whole graph.
			// Actually Yoast prefers pieces without @context if they are in the @graph.
			$video['@context'] = 'https://schema.org';
			$graph[]           = $video;
		}
		return $graph;
	}

	/**
	 * Integration for SEOPress.
	 */
	public function seopress_integration( $data ) {
		foreach ( $this->videos as $video ) {
			$data[] = $video;
		}
		return $data;
	}

	/**
	 * Integration for All in One SEO.
	 */
	public function aioseo_integration( $graphs ) {
		foreach ( $this->videos as $video ) {
			$graphs[] = $video;
		}
		return $graphs;
	}

	/**
	 * Outputs collected video data as standalone JSON-LD scripts in the head.
	 */
	public function output_fallback_json_ld() {
		foreach ( $this->videos as $video ) {
			$video_output = array_merge( array( '@context' => 'https://schema.org' ), $video );
			echo '<script type="application/ld+json">' . wp_json_encode( $video_output ) . '</script>' . "\n";
		}
	}
}
