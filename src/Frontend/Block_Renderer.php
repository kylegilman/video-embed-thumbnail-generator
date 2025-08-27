<?php

namespace Videopack\Frontend;

class Block_Renderer {

	/**
	 * @var \Videopack\Admin\Options
	 */
	protected $options_manager;

	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
	}

	/**
	 * Server-side rendering callback for the single video block.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block's inner content.
	 * @return string The rendered HTML of the block.
	 */
	public function render_video_block( $attributes, $content ) {
		$post_id = get_the_ID();
		if ( ! $post_id ) {
			$post_id = get_queried_object_id();
		}

		// Determine the video source from block attributes.
		$source_input = '';
		if ( ! empty( $attributes['id'] ) ) {
			$source_input = $attributes['id'];
		} elseif ( ! empty( $attributes['url'] ) ) {
			$source_input = $attributes['url'];
		} else {
			return ''; // No source found.
		}

		// Create the Source object.
		$source = \Videopack\Video_Source\Source_Factory::create( $source_input, $this->options_manager, null, null, $post_id );

		if ( ! $source || ! $source->exists() ) {
			return ''; // Source not found or doesn't exist.
		}

		// Replicate the attribute processing from the legacy shortcode handler for consistency.
		$shortcode_handler = new Shortcode( $this->options_manager );
		$final_atts = $shortcode_handler->get_final_atts( $attributes, $source );

		// Apply GIF mode overrides if enabled.
		if ( ! empty( $final_atts['gifmode'] ) && $final_atts['gifmode'] === true ) {
			$gifmode_atts = array(
				'muted'        => true,
				'autoplay'     => true,
				'loop'         => true,
				'controls'     => false,
				'title'        => false,
				'embeddable'   => false,
				'downloadlink' => false,
				'playsinline'  => true,
				'view_count'   => false,
			);
			$final_atts   = array_merge( $final_atts, $gifmode_atts );
		}

		// Determine the player type.
		$player_type = $final_atts['embed_method'] ?? $this->options_manager->get_options()['embed_method'];
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $player_type, $this->options_manager );

		// Set the source and final attributes on the player instance.
		$player->set_source( $source );
		$player->set_atts( $final_atts );

		// Enqueue player-specific scripts and styles.
		$player->enqueue_scripts();

		// Get the generated HTML code for the video player.
		$code = $player->get_player_code( $final_atts );

		$code = wp_kses( $code, ( new \Videopack\Common\Validate() )->allowed_html() );

		return apply_filters( 'videopack_block_video_html', $code, $final_atts, $content );
	}

	/**
	 * Server-side rendering callback for the gallery block.
	 *
	 * @param array    $attributes The block attributes.
	 * @return string The rendered HTML of the block.
	 */
	public function render_gallery_block( $attributes ) {
		$options = $this->options_manager->get_options();
		$final_atts = array_merge( $options, $attributes );

		if ( isset( $final_atts['gallery_orderby'] ) && 'rand' === $final_atts['gallery_orderby'] ) {
			$final_atts['gallery_orderby'] = 'RAND(' . rand() . ')';
		}

		$gallery = new Gallery( $this->options_manager );
		$code    = $gallery->gallery_page( 1, $final_atts );

		$code = wp_kses( $code, ( new \Videopack\Common\Validate() )->allowed_html() );

		return apply_filters( 'videopack_block_gallery_html', $code, $final_atts );
	}
}