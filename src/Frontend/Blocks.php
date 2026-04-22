<?php
/**
 * Modular Blocks rendering handler.
 *
 * @package Videopack
 * @subpackage Videopack/Frontend
 */

namespace Videopack\Frontend;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Blocks
 *
 * Handles server-side rendering for Videopack modular blocks.
 */
class Blocks implements Hook_Subscriber {

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $format_registry
	 */
	protected $format_registry;

	/**
	 * Instance counter for unique element IDs.
	 *
	 * @var int $instance_counter
	 */
	public static $instance_counter = 0;

	/**
	 * Constructor.
	 *
	 * @param array                             $options         Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry ) {
		$this->options         = $options;
		$this->format_registry = $format_registry;

		// Inject render callbacks via metadata filter as early as possible.
		add_filter( 'block_type_metadata_settings', array( $this, 'inject_render_callbacks' ), 10, 2 );
	}

	/**
	 * Injects render callbacks into block settings based on metadata names.
	 *
	 * @param array $settings Block settings.
	 * @param array $metadata Block metadata.
	 * @return array Modified settings.
	 */
	public function inject_render_callbacks( $settings, $metadata ) {
		$block_map = array(
			'videopack/videopack-video'     => 'render_player',
			'videopack/video-player-engine' => 'render_player_engine',
			'videopack/video-watermark'     => 'render_video_watermark',
			'videopack/collection'          => 'render_collection',
			'videopack/thumbnail'           => 'render_thumbnail',
			'videopack/video-title'         => 'render_video_title',
			'videopack/video-duration'      => 'render_video_duration',
			'videopack/view-count'          => 'render_view_count',
			'videopack/play-button'         => 'render_play_button',
			'videopack/pagination'          => 'render_pagination',
			'videopack/video-loop'          => 'render_video_loop',
			'videopack/video-caption'       => 'render_video_caption',
		);

		$name = $metadata['name'] ?? '';
		if ( isset( $block_map[ $name ] ) && method_exists( $this, $block_map[ $name ] ) ) {
			$settings['render_callback'] = array( $this, $block_map[ $name ] );
		}

		return $settings;
	}

	/**
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'init',
				'callback' => 'register_callbacks',
			),
			array(
				'hook'     => 'wp_footer',
				'callback' => 'render_global_modal',
			),
		);
	}

	/**
	 * Returns an array of filters to subscribe to.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array(
			array(
				'hook'     => 'render_block_context',
				'callback' => 'filter_render_block_context',
				'priority' => 10,
				'accepted_args'     => 2,
			),
		);
	}

	/**
	 * Registers the render callbacks for modular blocks.
	 *
	 * This is historically called from Ui::block_init or a similar early hook.
	 *
	 * @return void
	 */
	public function register_callbacks() {
		// No-op: Callbacks are now injected via constructor filter to prevent race conditions with Admin\Ui.
	}

	/**
	 * Generic player renderer for the main Videopack block.
	 *
	 * @param array $attributes Block attributes.
	 * @param string $content Block content.
	 * @param \WP_Block $block The block instance.
	 * @return string Rendered HTML.
	 */
	public function render_player( $attributes, $content, $block ) {
		self::$instance_counter++;
		$instance_id = 'vp_' . self::$instance_counter;
		
		$block->context['videopack/instanceId']          = $instance_id;
		$block->context['videopack/isInsidePlayerBlock'] = true;

		$post_id = $attributes['postId'] ?? ( $attributes['id'] ?? ( $block->context['videopack/postId'] ?? null ) );
		
		// If no ID is provided, only fallback to get_the_ID() if we are on an attachment page.
		if ( ! $post_id ) {
			if ( is_attachment() ) {
				$post_id = get_the_ID();
			} else {
				// Search for a video ID in the block content if possible, or just fail gracefully.
				// For now, if no ID is found, Source_Factory will handle the null.
			}
		}

		if ( $post_id ) {
			$block->context['videopack/postId'] = (int) $post_id;
		}

		$source = $post_id ? \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry ) : null;

		// The context is now handled globally via filter_render_block_context.
		// We only need to resolve the poster for the container if missing.
		$attributes['poster'] = ! empty( $attributes['poster'] ) ? $attributes['poster'] : ( $source ? $source->get_poster() : ( $this->options['poster'] ?? '' ) );

		if ( empty( $attributes['title'] ) && $source ) {
			$attributes['title'] = $source->get_title();
		}

		// Propagate watermark settings.
		$block->context['videopack/watermark']         = $attributes['watermark'] ?? ( $this->options['watermark'] ?? '' );
		$block->context['videopack/watermark_styles']  = $attributes['watermark_styles'] ?? ( $this->options['watermark_styles'] ?? array() );
		$block->context['videopack/watermark_link_to'] = $attributes['watermark_link_to'] ?? ( $this->options['watermark_link_to'] ?? 'false' );

		// Propagate media context if present.
		if ( ! empty( $attributes['poster'] ) ) {
			$block->context['videopack/poster'] = $attributes['poster'];
		}
		if ( ! empty( $attributes['src'] ) ) {
			$block->context['videopack/src'] = $attributes['src'];
		}

		return Modular_Renderer::render_video_container( $attributes, $content, true, $this->options );
	}

	/**
	 * Renders the Video Player Engine block.
	 *
	 * @param array $attributes Block attributes.
	 * @param string $content Block content.
	 * @param \WP_Block $block The block instance.
	 * @return string Rendered HTML.
	 */
	public function render_player_engine( $attributes, $content, $block ) {
		$post_id = $attributes['postId'] ?? ( $attributes['id'] ?? ( $block->context['videopack/postId'] ?? get_the_ID() ) );
		
		// Safety check: skip rendering if we can't find a valid video ID.
		if ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) {
			return '';
		}

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options, $this->format_registry );
		$merged_attributes = array_merge( $this->get_context_attributes( $block->context ), $attributes, array( 'id' => $post_id ) );
		$player            = $shortcode_handler->prepare_player( $merged_attributes );

		if ( ! $player ) {
			return '';
		}

		// Ensure children know they are inside a player engine.
		$block->context['videopack/isInsidePlayer'] = true;

		return Modular_Renderer::render_player_engine( $player['player'], $player['final_atts'], $content, $this->options );
	}

	/**
	 * Renders a collection block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_collection( $attributes, $content, $block ) {
		// Handle pagination from URL if not explicitly set.
		$paged = get_query_var( 'paged' ) ? (int) get_query_var( 'paged' ) : ( get_query_var( 'page' ) ? (int) get_query_var( 'page' ) : 1 );
		if ( ! empty( $attributes['currentPage'] ) ) {
			$paged = (int) $attributes['currentPage'];
		}

		$query_args = $this->build_query_args( $attributes, $paged );
		$query      = new \WP_Query( $query_args );

		if ( ! $query->have_posts() ) {
			return '';
		}

		$skin   = $attributes['skin'] ?? ( $this->options['skin'] ?? 'vjs-theme-videopack' );
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( 'Video.js', $this->options, $this->format_registry );
		$player->register_scripts();
		wp_enqueue_style( 'video-js' );
		wp_enqueue_style( 'videopack-frontend' );
		if ( ! empty( $skin ) ) {
			wp_enqueue_style( (string) $skin );
		}

		$layout          = $attributes['layout'] ?? 'grid';
		$columns         = $attributes['columns'] ?? 3;
		$total_pages     = (int) $query->max_num_pages;
		$inner_content   = '';

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options, $this->format_registry );

		$collection_players = array();
		$gallery_instance   = ++\Videopack\Admin\Ui::$instance_counter;

		while ( $query->have_posts() ) {
			$query->the_post();
			$post_id = get_the_ID();

			foreach ( $block->inner_blocks as $inner_block ) {
				if ( 'videopack/video-loop' === $inner_block->name ) {
					// Clone the block to ensure an isolated state for each loop iteration.
					$cloned_block = clone $inner_block;

					\Videopack\Admin\Ui::$instance_counter++;
					$cloned_block->context['videopack/instanceId'] = 'vp_' . \Videopack\Admin\Ui::$instance_counter;

					$cloned_block->context['videopack/postId']                = $post_id;
					$cloned_block->context['videopack/isInLoop']    = true;
					$cloned_block->context['videopack/currentPage'] = $paged;
					$cloned_block->context['videopack/totalPages']  = $total_pages;
					$cloned_block->context['videopack/skin']        = $skin;
					$cloned_block->context['videopack/galleryId']   = $gallery_instance;

					// Pass along individual styling attributes to context.
					$style_atts = array(
						'title_color',
						'title_background_color',
						'play_button_color',
						'play_button_secondary_color',
						'control_bar_bg_color',
						'control_bar_color',
					);
					foreach ( $style_atts as $att ) {
						if ( ! empty( $attributes[ $att ] ) ) {
							$cloned_block->context[ "videopack/{$att}" ] = $attributes[ $att ];
						}
					}

					$prepared = $shortcode_handler->prepare_player( array( 'id' => $post_id ) );

					if ( $prepared ) {
						$player      = $prepared['player'];
						$player_vars = $player->prepare_video_vars();
						$player_id   = 'videopack_player_gallery_' . $post_id . '_' . $gallery_instance;
						$player_vars['id'] = $player_id;

						// Add the missing player HTML for the lightbox.
						$player_vars['full_player_html'] = \Videopack\Frontend\Modular_Renderer::render_player_assembly( $player, $prepared['final_atts'], $prepared['source'], $this->options );
						$player_vars['player_html']      = $player_vars['full_player_html'];

						$collection_players[ $player_id ] = $player_vars;
						$cloned_block->context['videopack/videopackId'] = $player_id;

						// Always set these keys (even to empty strings) to prevent inheritance from the page context.
						$cloned_block->context['videopack/poster']  = $prepared['final_atts']['poster'] ?? '';
						$cloned_block->context['videopack/src']     = $prepared['final_atts']['src'] ?? '';
						$cloned_block->context['videopack/sources'] = $prepared['final_atts']['sources'] ?? array();
						$cloned_block->context['videopack/title']   = $prepared['final_atts']['title'] ?? '';
					}

					$inner_content .= $cloned_block->render();
				}
			}
		}

		if ( ! empty( $collection_players ) ) {
			$script = sprintf(
				'window.videopack = window.videopack || {}; window.videopack.player_data = window.videopack.player_data || {}; Object.assign(window.videopack.player_data, %s);',
				wp_json_encode( $collection_players )
			);
			wp_add_inline_script( 'videopack-frontend', $script );
		}
		$block_gap = $attributes['style']['spacing']['blockGap'] ?? '';
		if ( $block_gap && is_string( $block_gap ) && 0 === strpos( $block_gap, 'var:preset|spacing|' ) ) {
			$block_gap = str_replace( array( 'var:preset|spacing|', '|' ), array( 'var(--wp--preset--spacing--', '--' ), $block_gap ) . ')';
		}

		$output = Modular_Renderer::render_video_container(
			array_merge( $this->options, $attributes, array( 
				'align'         => $attributes['align'] ?? ( $this->options['gallery_align'] ?? 'wide' ),
				'block_gap'     => $block_gap,
				'wrapper_class' => 'videopack-collection-wrapper',
			) ),
			'<div class="videopack-collection-inner ' . esc_attr( "layout-{$layout} columns-{$columns}" ) . '">' . $inner_content . '</div>',
			true
		);

		wp_reset_postdata();

		// Render any blocks that are NOT video-cards (e.g., pagination) after the loop.
		foreach ( $block->inner_blocks as $inner_block ) {
			if ( 'videopack/video-loop' !== $inner_block->name ) {
				$inner_block->context['videopack/currentPage'] = $paged;
				$inner_block->context['videopack/totalPages']  = $total_pages;
				$output .= $inner_block->render();
			}
		}

		return $output;
	}

	/**
	 * Renders the Video Loop block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_video_loop( $attributes, $content, $block ) {
		$post_id = $block->context['videopack/postId'] ?? get_the_ID();
		if ( ! $post_id ) {
			return '';
		}

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options, $this->format_registry );
		$inner_content = '';

		$loop_players = array();
		$gallery_instance = $block->context['videopack/galleryId'] ?? ++\Videopack\Admin\Ui::$instance_counter;

		foreach ( $block->inner_blocks as $inner_block ) {
			// Clone the block to ensure an isolated state for each loop iteration.
			$cloned_block = clone $inner_block;

			\Videopack\Admin\Ui::$instance_counter++;
			$cloned_block->context['videopack/instanceId'] = 'vp_' . \Videopack\Admin\Ui::$instance_counter;

			$cloned_block->context['videopack/postId']               = $post_id;
			$cloned_block->context['videopack/isInLoop']   = true;
			$cloned_block->context['videopack/skin']       = $block->context['videopack/skin'] ?? '';

			// Pass styling context down to children.
			$style_atts = array(
				'title_color',
				'title_background_color',
				'play_button_color',
				'play_button_secondary_color',
				'control_bar_bg_color',
				'control_bar_color',
			);
			foreach ( $style_atts as $att ) {
				if ( ! empty( $block->context[ "videopack/{$att}" ] ) ) {
					$cloned_block->context[ "videopack/{$att}" ] = $block->context[ "videopack/{$att}" ];
				}
			}
			
			// Resolve robust media data using existing Shortcode logic.
			$prepared = $shortcode_handler->prepare_player( array( 'id' => $post_id ) );

			if ( $prepared ) {
				$player_vars = $prepared['player']->prepare_video_vars();
				$player_id   = 'videopack_player_gallery_' . $post_id . '_' . $gallery_instance;
				$player_vars['id'] = $player_id;

				$loop_players[ $player_id ] = $player_vars;
				$cloned_block->context['videopack/videopackId'] = $player_id;
			
				// Always set these keys (even to empty strings) to prevent inheritance from the page context.
				$cloned_block->context['videopack/poster']  = $prepared['final_atts']['poster'] ?? '';
				$cloned_block->context['videopack/src']     = $prepared['final_atts']['src'] ?? '';
				$cloned_block->context['videopack/sources'] = $prepared['final_atts']['sources'] ?? array();
				$cloned_block->context['videopack/title']   = $prepared['final_atts']['title'] ?? '';
			}

			$inner_content .= $cloned_block->render();
		}

		if ( ! empty( $loop_players ) ) {
			$script = sprintf(
				'window.videopack = window.videopack || {}; window.videopack.player_data = window.videopack.player_data || {}; Object.assign(window.videopack.player_data, %s);',
				wp_json_encode( $loop_players )
			);
			wp_add_inline_script( 'videopack-frontend', $script );
		}

		return sprintf(
			'<figure class="videopack-video-loop">%s</figure>',
			$inner_content
		);
	}

	/**
	 * Renders the Thumbnail block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_thumbnail( $attributes, $content, $block ) {
		$post_id = $block->context['videopack/postId'] ?? get_the_ID();
		if ( ! $post_id ) {
			return '';
		}

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options, $this->format_registry );
		$prepared          = $shortcode_handler->prepare_player( array( 'id' => $post_id ) );
		$thumbnail_url     = $prepared['final_atts']['poster'] ?? '';

		if ( ! $thumbnail_url ) {
			return '';
		}

		$link_to       = $attributes['linkTo'] ?? 'none';
		$skin          = $block->context['videopack/skin'] ?? '';
		$inner_content = '';

		foreach ( $block->inner_blocks as $inner_block ) {
			// Deep Clone: Clone each inner block to ensure context modification does not pollute 
			// shared block objects in memory (which causes the "Sticky Poster" leak).
			$cloned_inner = clone $inner_block;

			$cloned_inner->context['videopack/postId']            = $post_id;
			$cloned_inner->context['videopack/skin']              = $skin;
			$cloned_inner->context['videopack/isInsideThumbnail'] = true;

			// Propagate all style attributes down to inner blocks.
			$propagated_atts = array(
				'title_color',
				'title_background_color',
				'play_button_color',
				'play_button_secondary_color',
				'control_bar_bg_color',
				'control_bar_color',
			);

			foreach ( $propagated_atts as $att ) {
				$cloned_inner->context[ "videopack/{$att}" ] = $block->context[ "videopack/{$att}" ] ?? '';
			}
			
			$inner_content .= $cloned_inner->render();
		}

		$effective_atts = array_merge( $this->options, $block->context, $attributes );
		$style_vars     = array();
		$classes        = array( 'videopack-thumbnail-wrapper', 'gallery-thumbnail', 'videopack-gallery-item', $skin );

		$colors = array(
			'title-color'            => 'title_color',
			'title-background-color' => 'title_background_color',
			'play-button-color'           => 'play_button_color',
			'play-button-secondary-color' => 'play_button_secondary_color',
			'control-bar-bg-color'        => 'control_bar_bg_color',
			'control-bar-color'           => 'control_bar_color',
		);

		foreach ( $colors as $variable => $attribute ) {
			if ( ! empty( $effective_atts[ $attribute ] ) ) {
				$style_vars[] = "--videopack-{$variable}: " . $effective_atts[ $attribute ];
				$classes[]    = "videopack-has-{$variable}";
			}
		}

		// Inject MEJS controls SVG for mask coloring.
		$style_vars[] = '--videopack-mejs-controls-svg: url("' . esc_url( includes_url( 'js/mediaelement/mejs-controls.svg' ) ) . '")';

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class'                   => implode( ' ', array_unique( array_filter( $classes ) ) ),
				'style'                   => implode( ';', $style_vars ),
				'data-attachment-id'      => (int) $post_id,
				'data-videopack-id'       => esc_attr( $block->context['videopack/videopackId'] ?? '' ),
				'data-videopack-lightbox' => ( 'lightbox' === $link_to ? 'true' : 'false' ),
			)
		);

		$html = sprintf( '<div %s>', $wrapper_attributes );

		if ( 'none' !== $link_to ) {
			$url   = ( 'lightbox' === $link_to ) ? '#' : get_permalink( $post_id );
			$html .= sprintf( '<a href="%s" class="videopack-thumbnail-link %s" data-videopack-link-to="%s">', esc_url( $url ), ( 'lightbox' === $link_to ? 'videopack-lightbox' : '' ), esc_attr( $link_to ) );
		}

		$html .= sprintf( '<img src="%s" alt="" class="videopack-thumbnail" />', esc_url( $thumbnail_url ) );
		$html .= '<div class="videopack-inner-blocks-container">' . $inner_content . '</div>';

		if ( 'none' !== $link_to ) {
			$html .= '</a>';
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Renders the Video Title block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_video_title( $attributes, $content, $block ) {
		$post_id = $attributes['postId'] ?? ( $attributes['id'] ?? ( $block->context['videopack/postId'] ?? get_the_ID() ) );
		
		// Safety check: ensure we have a valid, positive ID.
		if ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) {
			return '';
		}

		$source = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry );

		$context_attributes = $this->get_context_attributes( $block->context );
		
		// Normalize direct block attributes for booleans since they might come as strings from Gutenberg.
		foreach ( array( 'downloadlink', 'embedcode', 'showBackground', 'overlay_title' ) as $key ) {
			if ( isset( $attributes[ $key ] ) ) {
				$val = $attributes[ $key ];
				if ( 'false' === $val || '0' === $val || '' === $val ) {
					$val = false;
				} elseif ( 'true' === $val || '1' === $val ) {
					$val = true;
				}
				$attributes[ $key ] = $val;
			}
		}

		// Filter out null or empty string attributes to allow context fallbacks to work.
		// We DO NOT filter out 'false' here because that represents an explicit user override.
		$filtered_attributes = array_filter( (array) $attributes, function( $v ) { return ! is_null( $v ) && '' !== $v; } );

		// Merge context into attributes for the renderer.
		$merged_attributes = array_merge(
			$context_attributes,
			array(
				'isOverlay'              => $attributes['isOverlay'] ?? ( ! empty( $block->context['videopack/isInsideThumbnail'] ) || ! empty( $block->context['videopack/isInsidePlayer'] ) ),
				'isInsideThumbnail'      => ! empty( $block->context['videopack/isInsideThumbnail'] ),
				'isInsidePlayer'         => ! empty( $block->context['videopack/isInsidePlayer'] ),
			),
			$filtered_attributes
		);

		$id = $attributes['id'] ?? ( (string) $post_id ?: '' );

		// If embedcode is on, ensure we have an embedlink.
		if ( ! empty( $merged_attributes['embedcode'] ) && empty( $merged_attributes['embedlink'] ) ) {
			if ( is_numeric( $post_id ) && (int) $post_id > 0 ) {
				$merged_attributes['embedlink'] = (string) add_query_arg( 'videopack[enable]', 'true', (string) get_attachment_link( (int) $post_id ) );
			}
		}

		return Modular_Renderer::render_video_title( (array) $merged_attributes, $source, (string) ( $block->context['videopack/postId'] ?? uniqid() ) );
	}

	/**
	 * Renders the Video Duration block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_video_duration( $attributes, $content, $block ) {
		$post_id = $attributes['postId'] ?? ( $attributes['id'] ?? ( $block->context['videopack/postId'] ?? get_the_ID() ) );
		
		// Safety check: ensure we have a valid, positive ID.
		if ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) {
			return '';
		}

		$meta    = get_post_meta( $post_id, '_videopack-meta', true );
		if ( empty( $meta ) ) {
			$meta = array();
		}
		$seconds = $meta['duration'] ?? 0;

		if ( ! $seconds ) {
			return '';
		}

		$duration_text      = $this->format_duration( (int) $seconds );
		$is_inside_thumb    = ! empty( $block->context['videopack/isInsideThumbnail'] );
		$is_overlay         = $is_inside_thumb || ( ! empty( $block->context['videopack/postId'] ) && ! empty( $block->context['videopack/skin'] ) );
		
		$position           = $attributes['position'] ?? ( $block->context['videopack/position'] ?? ( $is_inside_thumb ? 'top' : 'bottom' ) );
		$is_inside_thumb    = ! empty( $block->context['videopack/isInsideThumbnail'] );
		$is_inside_player   = ! empty( $block->context['videopack/isInsidePlayerBlock'] );
		$text_align         = ! empty( $attributes['textAlign'] ) ? $attributes['textAlign'] : ( $is_inside_thumb ? 'center' : ( $is_inside_player ? 'right' : 'left' ) );

		$class              = 'videopack-video-duration' . ( $is_overlay ? ' is-overlay is-badge' : '' );
		$class             .= ' position-' . esc_attr( $position );
		$class             .= ' has-text-align-' . esc_attr( $text_align );
		$style_vars         = array();
		
		if ( $is_overlay ) {
			if ( ! empty( $block->context['videopack/title_background_color'] ) ) {
				$style_vars[] = '--videopack-title-background-color: ' . $block->context['videopack/title_background_color'];
			}
			if ( ! empty( $block->context['videopack/title_color'] ) ) {
				$style_vars[] = '--videopack-title-color: ' . $block->context['videopack/title_color'];
			}
		}

		$style = ! empty( $style_vars ) ? ' style="' . esc_attr( implode( ';', $style_vars ) ) . '"' : '';

		return sprintf( '<div class="%s"%s>%s</div>', esc_attr( $class ), $style, esc_html( $duration_text ) );
	}

	/**
	 * Renders the Play Button block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_play_button( $attributes, $content, $block ) {
		$skin         = $block->context['videopack/skin'] ?? '';
		$embed_method = $this->options['embed_method'] ?? 'Video.js';

		// Resolve effective colors by checking attributes (leaf override) -> context (container override) -> options (global default).
		$play_button_color           = $attributes['play_button_color'] ?? ( $block->context['videopack/play_button_color'] ?? ( $this->options['play_button_color'] ?? '' ) );
		$play_button_secondary_color = $attributes['play_button_secondary_color'] ?? ( $block->context['videopack/play_button_secondary_color'] ?? ( $this->options['play_button_secondary_color'] ?? '' ) );

		$classes    = array( 'videopack-play-button' );
		$style_vars = array();

		if ( ! empty( $play_button_color ) ) {
			$classes[]    = 'videopack-has-play-button-color';
			$style_vars[] = '--videopack-play-button-color: ' . $play_button_color;
		}
		if ( ! empty( $play_button_secondary_color ) ) {
			$classes[]    = 'videopack-has-play-button-secondary-color';
			$style_vars[] = '--videopack-play-button-secondary-color: ' . $play_button_secondary_color;
		}

		if ( 'WordPress Default' === $embed_method ) {
			$classes[]    = 'mejs-overlay mejs-layer mejs-overlay-play';
			$style_vars[] = '--videopack-mejs-controls-svg: url("' . esc_url( includes_url( 'js/mediaelement/mejs-controls.svg' ) ) . '")';

			$style = ! empty( $style_vars ) ? ' style="' . esc_attr( implode( ';', $style_vars ) ) . '"' : '';

			return sprintf(
				'<div class="%s"%s><div class="mejs-overlay-button" style="width: 80px; height: 80px;"></div></div>',
				esc_attr( implode( ' ', $classes ) ),
				$style
			);
		}

		$style = ! empty( $style_vars ) ? ' style="' . esc_attr( implode( ';', $style_vars ) ) . '"' : '';

		return sprintf(
			'<div class="%1$s play-button-container video-js %2$s vjs-big-play-centered vjs-paused vjs-controls-enabled"%3$s><button class="vjs-big-play-button" type="button" aria-disabled="false"><span class="vjs-icon-placeholder" aria-hidden="true"></span><span class="vjs-control-text" aria-live="polite">%4$s</span></button></div>',
			esc_attr( implode( ' ', $classes ) ),
			esc_attr( $skin ),
			$style,
			esc_html__( 'Play Video', 'video-embed-thumbnail-generator' )
		);
	}

	/**
	 * Renders the View Count block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_view_count( $attributes, $content, $block ) {
		$post_id = $attributes['postId'] ?? ( $attributes['id'] ?? ( $block->context['videopack/postId'] ?? get_the_ID() ) );

		// Safety check: ensure we have a valid, positive ID.
		if ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) {
			return '';
		}

		$source = \Videopack\Video_Source\Source_Factory::create(
			$post_id,
			$this->options,
			$this->format_registry
		);

		// Filter out null attributes to allow context fallbacks to work.
		$filtered_attributes = array_filter( (array) $attributes, function( $v ) { return ! is_null( $v ); } );

		// Resolve attributes with context-aware defaults.
		$merged_attributes = array_merge( 
			$this->get_context_attributes( $block->context ), 
			$filtered_attributes, 
			array(
				'isOverlay'              => $attributes['isOverlay'] ?? ( ! empty( $block->context['videopack/isInsideThumbnail'] ) || ! empty( $block->context['videopack/isInsidePlayer'] ) ),
				'isInsideThumbnail'      => ! empty( $block->context['videopack/isInsideThumbnail'] ),
				'isInsidePlayer'         => ! empty( $block->context['videopack/isInsidePlayer'] ),
				'textAlign'              => $attributes['textAlign'] ?? ( $block->context['videopack/textAlign'] ?? null ),
				'title_color'            => $block->context['videopack/title_color'] ?? $attributes['title_color'] ?? '',
				'title_background_color' => $block->context['videopack/title_background_color'] ?? $attributes['title_background_color'] ?? '',
				'skin'                   => $block->context['videopack/skin'] ?? $attributes['skin'] ?? '',
			) 
		);

		return Modular_Renderer::render_view_count( $source, $merged_attributes );
	}

	/**
	 * Renders the Video Watermark block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_video_watermark( $attributes, $content, $block ) {
		$merged_attributes = array_merge(
			array(
				'watermark'         => $block->context['videopack/watermark'] ?? '',
				'watermark_styles'  => $block->context['videopack/watermark_styles'] ?? array(),
				'watermark_link_to' => $block->context['videopack/watermark_link_to'] ?? '',
				'skin'              => $block->context['videopack/skin'] ?? '',
			),
			$attributes
		);

		return Modular_Renderer::render_watermark( $merged_attributes );
	}

	/**
	 * Renders the Pagination block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_pagination( $attributes, $content, $block ) {
		$current_page = $block->context['videopack/currentPage'] ?? 1;
		$total_pages  = $block->context['videopack/totalPages'] ?? 1;

		if ( $total_pages <= 1 ) {
			return '';
		}

		$links = paginate_links(
			array(
				'current'   => $current_page,
				'total'     => $total_pages,
				'type'      => 'array',
				'prev_next' => true,
			)
		);

		if ( ! $links ) {
			return '';
		}

		$html = '<nav class="videopack-pagination"><ul class="videopack-pagination-list">';
		foreach ( $links as $link ) {
			$html .= sprintf( '<li class="videopack-pagination-item">%s</li>', $link );
		}
		$html .= '</ul></nav>';

		return $html;
	}

	/**
	 * Renders the Video Caption block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_video_caption( $attributes, $content, $block ) {
		// Priority: Block Attribute > Context inheritance.
		$caption = $attributes['caption'] ?? ( $block->context['videopack/caption'] ?? '' );
		return Modular_Renderer::render_video_caption( $caption );
	}

	/**
	 * Formats seconds into HH:MM:SS or MM:SS.
	 */
	private function format_duration( $seconds ) {
		if ( ! $seconds ) return '0:00';
		$h = floor( $seconds / 3600 );
		$m = floor( ( $seconds % 3600 ) / 60 );
		$s = $seconds % 60;
		if ( $h > 0 ) {
			return sprintf( '%d:%02d:%02d', $h, $m, $s );
		}
		return sprintf( '%d:%02d', $m, $s );
	}

	/**
	 * Builds WP_Query args from block attributes.
	 */
	private function build_query_args( $attributes, $paged = 1 ) {
		$per_page = $attributes['gallery_per_page'] ?? 10;
		$args     = array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'video',
			'post_status'    => 'inherit',
			'posts_per_page' => $per_page,
			'paged'          => $paged,
			'orderby'        => $attributes['gallery_orderby'] ?? 'menu_order',
			'order'          => $attributes['gallery_order'] ?? 'asc',
		);

		$source = $attributes['gallery_source'] ?? 'current';

		if ( 'current' === $source ) {
			// We handle the parent post in the gallery/collection context.
			// For a block, 'current' usually means the post it's embedded in.
			// However, attachments have their own IDs.
			// We rely on the global $post if not specified.
			$args['post_parent'] = get_the_ID();
		} elseif ( 'custom' === $source && ! empty( $attributes['gallery_id'] ) ) {
			$args['post_parent'] = $attributes['gallery_id'];
		} elseif ( 'manual' === $source && ! empty( $attributes['gallery_include'] ) ) {
			$args['post__in'] = array_map( 'intval', explode( ',', $attributes['gallery_include'] ) );
			$args['orderby'] = 'post__in';
		} elseif ( 'category' === $source && ! empty( $attributes['gallery_category'] ) ) {
			$args['category_name'] = $attributes['gallery_category'];
		} elseif ( 'tag' === $source && ! empty( $attributes['gallery_tag'] ) ) {
			$args['tag'] = $attributes['gallery_tag'];
		}

		if ( ! empty( $attributes['gallery_exclude'] ) ) {
			$args['post__not_in'] = array_map( 'intval', explode( ',', $attributes['gallery_exclude'] ) );
		}

		return (array) apply_filters( 'videopack_collection_query_args', $args, $attributes );
	}

	/**
	 * Renders the global lightbox modal in the footer.
	 *
	 * This ensures that modular blocks and decentralized galleries have a valid
	 * target for the lightbox to open into.
	 *
	 * @return void
	 */
	public function render_global_modal() {
		// Only render if we are on the frontend.
		if ( is_admin() ) {
			return;
		}
		?>
		<!-- Videopack Global Modal -->
		<div class="videopack-modal-overlay" id="videopack-global-modal" style="display: none;">
			<div class="videopack-modal-container">
				<button type="button" class="modal-navigation modal-close" title="<?php esc_attr_e( 'Close', 'video-embed-thumbnail-generator' ); ?>">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
						<path d="m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z"></path>
					</svg>
				</button>
				<button type="button" class="modal-navigation modal-next" title="<?php esc_attr_e( 'Next', 'video-embed-thumbnail-generator' ); ?>">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
						<path d="M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4v-2z"></path>
					</svg>
				</button>
				<button type="button" class="modal-navigation modal-previous" title="<?php esc_attr_e( 'Previous', 'video-embed-thumbnail-generator' ); ?>">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
						<path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z"></path>
					</svg>
				</button>
				<div class="modal-content">
					<!-- Player will be inserted here by JS -->
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Filters the block context to inject global plugin defaults for Videopack attributes.
	 *
	 * This ensures that child blocks correctly inherit global settings when the parent block
	 * uses the default (unspecified) value, while still allowing explicit per-block overrides.
	 *
	 * @param array $context The block context.
	 * @param array $block   The block being rendered.
	 * @return array Modified context.
	 */
	public function filter_render_block_context( $context, $block ) {
		$block_name = $block['blockName'] ?? '';
		if ( strpos( $block_name, 'videopack/' ) !== 0 ) {
			return $context;
		}

		// List of attributes that provide context and their global fallbacks.
		// We prioritize: 1. Value already in context, 2. Parent block attribute, 3. Global option.
		$fallbacks = array(
			'videopack/downloadlink'   => array( 'attr' => 'downloadlink', 'global' => Modular_Renderer::is_true( $this->options['downloadlink'] ?? false ) ),
			'videopack/embedcode'      => array( 'attr' => 'embedcode', 'global' => Modular_Renderer::is_true( $this->options['embedcode'] ?? false ) ),
			'videopack/overlay_title'  => array( 'attr' => 'overlay_title', 'global' => Modular_Renderer::is_true( $this->options['overlay_title'] ?? true ) ),
			'videopack/showBackground' => array( 'attr' => 'showBackground', 'global' => Modular_Renderer::is_true( $this->options['showBackground'] ?? true ) ),
			'videopack/views'          => array( 'attr' => 'views', 'global' => Modular_Renderer::is_true( $this->options['views'] ?? false ) ),
			'videopack/skin'           => array( 'attr' => 'skin', 'global' => $this->options['skin'] ?? 'vjs-theme-videopack' ),
			'videopack/postId'         => array( 'attr' => 'id', 'global' => null ),
			'videopack/poster'         => array( 'attr' => 'poster', 'global' => null ),
			'videopack/watermark'      => array( 'attr' => 'watermark', 'global' => $this->options['watermark'] ?? '' ),
			'videopack/watermark_link_to' => array( 'attr' => 'watermark_link_to', 'global' => $this->options['watermark_link_to'] ?? 'false' ),
			'videopack/watermark_styles'  => array( 'attr' => 'watermark_styles', 'global' => array() ),
		);

		foreach ( $fallbacks as $context_key => $config ) {
			$attr_key = $config['attr'];
			$global   = $config['global'];

			if ( ! isset( $context[ $context_key ] ) || null === $context[ $context_key ] ) {
				// Check if the parent block (if this is a child) or current block has the attribute.
				if ( isset( $block['attrs'][ $attr_key ] ) ) {
					$context[ $context_key ] = $block['attrs'][ $attr_key ];
				} else {
					$context[ $context_key ] = $global;
				}
			}
		}

		return $context;
	}

	/**
	 * Extracts Videopack-specific context into a flat attributes array with boolean normalization and global fallbacks.
	 *
	 * @param array $context The block context.
	 * @return array Extracted attributes.
	 */
	private function get_context_attributes( $context ) {
		$attributes = array();
		foreach ( (array) $context as $key => $value ) {
			if ( strpos( $key, 'videopack/' ) === 0 ) {
				$attr_key = substr( $key, 10 );
				$val      = $value;

				// Normalize booleans that might come as strings from Gutenberg context.
				if ( in_array( $attr_key, array( 'downloadlink', 'embedcode', 'showBackground', 'overlay_title', 'autoplay', 'controls', 'loop', 'muted', 'playsinline', 'playback_rate', 'fullwidth' ), true ) ) {
					$val = Modular_Renderer::is_true( $val );
				}

				$attributes[ $attr_key ] = $val;
			}
		}

		// Apply global fallbacks for design attributes if they were not provided by context or are empty.
		// This ensures children inherit from global settings when the parent block doesn't explicitly override them.
		$design_keys = array(
			'skin'                        => $this->options['skin'] ?? 'vjs-theme-videopack',
			'downloadlink'                => Modular_Renderer::is_true( $this->options['downloadlink'] ?? false ),
			'embedcode'                   => Modular_Renderer::is_true( $this->options['embedcode'] ?? false ),
			'autoplay'                    => Modular_Renderer::is_true( $this->options['autoplay'] ?? false ),
			'controls'                    => Modular_Renderer::is_true( $this->options['controls'] ?? true ),
			'loop'                        => Modular_Renderer::is_true( $this->options['loop'] ?? false ),
			'muted'                       => Modular_Renderer::is_true( $this->options['muted'] ?? false ),
			'playsinline'                 => Modular_Renderer::is_true( $this->options['playsinline'] ?? false ),
			'playback_rate'               => Modular_Renderer::is_true( $this->options['playback_rate'] ?? false ),
			'volume'                      => (float) ( $this->options['volume'] ?? 1.0 ),
			'play_button_color'           => $this->options['play_button_color'] ?? '',
			'play_button_secondary_color' => $this->options['play_button_secondary_color'] ?? '',
			'title_color'                 => $this->options['title_color'] ?? '',
			'title_background_color'      => $this->options['title_background_color'] ?? '',
			'control_bar_bg_color'        => $this->options['control_bar_bg_color'] ?? '',
			'control_bar_color'           => $this->options['control_bar_color'] ?? '',
			'overlay_title'               => Modular_Renderer::is_true( $this->options['overlay_title'] ?? true ),
			'showBackground'              => Modular_Renderer::is_true( $this->options['showBackground'] ?? true ),
			'views'                       => Modular_Renderer::is_true( $this->options['views'] ?? false ),
			'watermark'                   => $this->options['watermark'] ?? '',
			'watermark_styles'            => $this->options['watermark_styles'] ?? array(),
			'watermark_link_to'           => $this->options['watermark_link_to'] ?? 'false',
			'width'                       => (int) ( $this->options['width'] ?? 960 ),
			'height'                      => (int) ( $this->options['height'] ?? 540 ),
		);

		foreach ( $design_keys as $key => $fallback ) {
			// If the attribute is not set, or is an empty string, we allow the fallback to take over.
			// We no longer force-overwrite 'false' because we need to respect explicit user overrides.
			$val = $attributes[ $key ] ?? null;
			if ( ! isset( $attributes[ $key ] ) || '' === $val || null === $val ) {
				$attributes[ $key ] = $fallback;
			}
		}

		return $attributes;
	}
}
