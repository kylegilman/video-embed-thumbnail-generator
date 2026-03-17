<?php
/**
 * JSON-LD Schema.org markup for videos.
 *
 * @package Videopack
 */

namespace Videopack\Frontend;

/**
 * Class Schema
 *
 * Handles JSON-LD Schema.org markup for videos.
 *
 * This class collects video information from the current post's content (blocks and shortcodes)
 * and provides it to SEO plugins or outputs it as JSON-LD in the head.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend
 * @author     Kyle Gilman <kylegilman@gmail.com>
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
	 *
	 * Recommended to be called on 'template_redirect' hook.
	 *
	 * @return void
	 */
	public function init() {
		if ( empty( $this->options['schema'] ) || ! (bool) is_singular() ) {
			return;
		}

		$this->collect_videos();

		if ( empty( $this->videos ) ) {
			return;
		}

		$has_seo_plugin = (bool) $this->register_seo_filters();

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

		// Deduplicate videos by contentUrl to avoid double schema on the same video.
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
	 * @return void
	 */
	protected function add_video_from_attributes( array $atts ) {
		$source_input = $atts['id'] ?? $atts['src'] ?? null;
		if ( ! $source_input ) {
			return;
		}

		$source = \Videopack\Video_Source\Source_Factory::create( $source_input, $this->options_manager );
		if ( ! $source || ! (bool) $source->exists() ) {
			return;
		}

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options_manager );
		$final_atts        = (array) $shortcode_handler->get_final_atts( (array) $atts, $source );

		$upload_date = (string) ( is_numeric( $source->get_id() ) ? get_the_date( 'c', (int) $source->get_id() ) : ( get_post() instanceof \WP_Post ? get_the_date( 'c', (int) get_the_ID() ) : gmdate( 'c' ) ) );

		$video_data = array(
			'@type'        => 'VideoObject',
			'name'         => (string) ( $final_atts['stats_title'] ?? '' ),
			'description'  => ! empty( $final_atts['description'] ) ? (string) $final_atts['description'] : (string) ( $final_atts['stats_title'] ?? '' ),
			'thumbnailUrl' => (string) ( $final_atts['poster'] ?? '' ),
			'uploadDate'   => (string) $upload_date,
			'contentUrl'   => (string) $source->get_url(),
		);

		// Add embedUrl if applicable.
		if ( is_numeric( $source->get_id() ) ) {
			$video_data['embedUrl'] = (string) site_url( '/?attachment_id=' . (int) $source->get_id() . '&videopack[enable]=true' );
		}

		$this->videos[] = (array) $video_data;
	}

	/**
	 * Registers filters for popular SEO plugins to integrate Videopack video data.
	 *
	 * @return bool True if at least one SEO plugin integration was attempted.
	 */
	protected function register_seo_filters(): bool {
		$integrated = false;

		// 1. Rank Math.
		if ( defined( 'RANK_MATH_VERSION' ) ) {
			add_filter( 'rank_math/json_ld', array( $this, 'rank_math_integration' ), 10, 2 );
			$integrated = true;
		}

		// 2. Yoast SEO.
		// Yoast uses a graph-based approach. We add our VideoObjects to the graph.
		if ( defined( 'WPSEO_VERSION' ) ) {
			add_filter( 'wpseo_schema_graph', array( $this, 'yoast_integration' ) );
			$integrated = true;
		}

		// 3. SEOPress.
		// SEOPress only provides structured data filters in the Pro version.
		if ( function_exists( 'seopress_init' ) && defined( 'SEOPRESS_PRO_VERSION' ) ) {
			add_filter( 'seopress_schema_json_ld', array( $this, 'seopress_integration' ) );
			$integrated = true;
		}

		// 4. All in One SEO.
		if ( defined( 'AIOSEO_VERSION' ) ) {
			add_filter( 'aioseo_schema_output', array( $this, 'aioseo_integration' ) );
			$integrated = true;
		}

		/**
		 * Filter the SEO integration status.
		 *
		 * @param bool  $integrated Whether an SEO plugin was integrated.
		 * @param array $videos     The collected video data.
		 */
		return (bool) apply_filters( 'videopack_schema_integrated_with_seo', $integrated, $this->videos );
	}

	/**
	 * Integration for Rank Math SEO plugin.
	 *
	 * @param array $data Existing Rank Math Schema data.
	 * @return array Modified Schema data.
	 */
	public function rank_math_integration( array $data ) {
		if ( ! isset( $data['VideoObject'] ) ) {
			$data['VideoObject'] = array();
		}
		foreach ( (array) $this->videos as $video ) {
			$data['VideoObject'][] = (array) $video;
		}
		return (array) $data;
	}

	/**
	 * Integration for Yoast SEO plugin.
	 *
	 * @param array $graph Existing Yoast Schema graph.
	 * @return array Modified Schema graph.
	 */
	public function yoast_integration( array $graph ) {
		foreach ( (array) $this->videos as $video ) {
			$video['@context'] = 'https://schema.org';
			$graph[]           = (array) $video;
		}
		return (array) $graph;
	}

	/**
	 * Integration for SEOPress SEO plugin.
	 *
	 * @param array $data Existing SEOPress Schema data.
	 * @return array Modified Schema data.
	 */
	public function seopress_integration( array $data ) {
		foreach ( (array) $this->videos as $video ) {
			$data[] = (array) $video;
		}
		return (array) $data;
	}

	/**
	 * Integration for All in One SEO plugin.
	 *
	 * @param array $graphs Existing AIOSEO Schema graphs.
	 * @return array Modified Schema graphs.
	 */
	public function aioseo_integration( array $graphs ) {
		foreach ( (array) $this->videos as $video ) {
			$graphs[] = (array) $video;
		}
		return (array) $graphs;
	}

	/**
	 * Outputs collected video data as standalone JSON-LD scripts in the head.
	 *
	 * @return void
	 */
	public function output_fallback_json_ld() {
		foreach ( (array) $this->videos as $video ) {
			$video_output = (array) array_merge( array( '@context' => 'https://schema.org' ), (array) $video );
			echo '<script type="application/ld+json">' . wp_json_encode( (array) $video_output ) . '</script>' . "\n";
		}
	}
}
