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
	 * Constructor.
	 *
	 * @param array                             $options         Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry ) {
		$this->options         = $options;
		$this->format_registry = $format_registry;
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
		return array();
	}

	/**
	 * Registers the render callbacks for modular blocks.
	 *
	 * This is historically called from Ui::block_init or a similar early hook.
	 *
	 * @return void
	 */
	public function register_callbacks() {
		$blocks = array(
			'collection'     => 'render_collection',
			'thumbnail'      => 'render_thumbnail',
			'video-title'    => 'render_video_title',
			'video-duration' => 'render_video_duration',
			'view-count'     => 'render_view_count',
			'play-button'    => 'render_play_button',
			'pagination'     => 'render_pagination',
			'video-loop'     => 'render_video_loop',
		);

		foreach ( $blocks as $name => $callback ) {
			add_filter(
				'block_type_metadata_settings',
				function ( $settings, $metadata ) use ( $name, $callback ) {
					if ( ( 'videopack/' . $name ) === $metadata['name'] ) {
						$settings['render_callback'] = array( $this, $callback );
					}
					return $settings;
				},
				10,
				2
			);
		}
	}

	/**
	 * Renders the Collection block.
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
						'play_button_icon_color',
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
			array_merge( $attributes, array( 
				'align'         => $attributes['align'] ?? ( $this->options['gallery_align'] ?? 'wide' ),
				'block_gap'     => $block_gap,
				'wrapper_class' => 'videopack-collection-wrapper',
			) ),
			'<div class="videopack-collection-inner ' . esc_attr( "layout-{$layout} columns-{$columns} {$skin}" ) . '">' . $inner_content . '</div>',
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
				'play_button_icon_color',
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
			'<div class="videopack-video-loop">%s</div>',
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

			$cloned_inner->context['videopack/postId']                         = $post_id;
			$cloned_inner->context['videopack/skin']                 = $skin;
			$cloned_inner->context['videopack/isInsideThumbnail']    = true;
			$cloned_inner->context['videopack/title_color']          = $block->context['videopack/title_color'] ?? '';
			$cloned_inner->context['videopack/title_background_color'] = $block->context['videopack/title_background_color'] ?? '';
			
			$inner_content .= $cloned_inner->render();
		}

		$html = sprintf(
			'<div class="videopack-thumbnail-wrapper gallery-thumbnail videopack-gallery-item %s" data-attachment-id="%d" data-videopack-id="%s" data-videopack-lightbox="%s">',
			esc_attr( $skin ),
			(int) $post_id,
			esc_attr( $block->context['videopack/videopackId'] ?? '' ),
			( 'lightbox' === $link_to ? 'true' : 'false' )
		);

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
		$post_id = $block->context['videopack/postId'] ?? get_the_ID();
		$source  = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry );

		// Normalize boolean context attributes.
		$normalized_context = array();
		foreach ( array( 'downloadlink', 'embedcode', 'showBackground', 'overlay_title' ) as $key ) {
			if ( isset( $block->context[ "videopack/{$key}" ] ) ) {
				$val = $block->context[ "videopack/{$key}" ];
				if ( 'false' === $val || '0' === $val || '' === $val ) {
					$val = false;
				} elseif ( 'true' === $val || '1' === $val ) {
					$val = true;
				}
				$normalized_context[ $key ] = $val;
			}
		}

		// Normalize direct block attributes too.
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

		// Merge context into attributes for the renderer.
		$merged_attributes = array_merge(
			array(
				'isOverlay'              => $attributes['isOverlay'] ?? ( ! empty( $block->context['videopack/isInsideThumbnail'] ) || ! empty( $block->context['videopack/isInsidePlayer'] ) ),
				'overlay_title'          => $normalized_context['overlay_title'] ?? true,
				'title_color'            => $block->context['videopack/title_color'] ?? '',
				'title_background_color' => $block->context['videopack/title_background_color'] ?? '',
				'skin'                   => $block->context['videopack/skin'] ?? '',
				'downloadlink'           => $normalized_context['downloadlink'] ?? false,
				'embedcode'              => $normalized_context['embedcode'] ?? false,
				'textAlign'              => ! empty( $block->context['videopack/textAlign'] ) ? $block->context['videopack/textAlign'] : null,
				'showBackground'         => $normalized_context['showBackground'] ?? true,
				'position'               => $block->context['videopack/position'] ?? null,
				'isInsideThumbnail'      => ! empty( $block->context['videopack/isInsideThumbnail'] ),
			),
			$attributes
		);

		$id = $attributes['id'] ?? ( $post_id ?: '' );

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
		$post_id = $block->context['videopack/postId'] ?? get_the_ID();
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
		$text_align         = $attributes['textAlign'] ?? ( $block->context['videopack/textAlign'] ?? ( $is_inside_thumb ? 'center' : 'left' ) );

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

		if ( 'WordPress Default' === $embed_method ) {
			return '<div class="videopack-play-button mejs-overlay mejs-layer mejs-overlay-play"><div class="mejs-overlay-button" style="width: 80px; height: 80px;"></div></div>';
		}

		return sprintf(
			'<div class="videopack-play-button play-button-container video-js %s vjs-big-play-centered vjs-paused vjs-controls-enabled"><button class="vjs-big-play-button" type="button" aria-disabled="false"><span class="vjs-icon-placeholder" aria-hidden="true"></span><span class="vjs-control-text" aria-live="polite">%s</span></button></div>',
			esc_attr( $skin ),
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
		$post_id = $block->context['videopack/postId'] ?? get_the_ID();
		if ( ! $post_id ) {
			return '';
		}

		$source = \Videopack\Video_Source\Source_Factory::create(
			$post_id,
			$this->options,
			$this->format_registry
		);

		// Merge context into attributes for the renderer.
		$merged_attributes = array_merge(
			array(
				'isOverlay'              => $attributes['isOverlay'] ?? ( ! empty( $block->context['videopack/isInsideThumbnail'] ) || ! empty( $block->context['videopack/isInsidePlayer'] ) ),
				'title_color'            => $block->context['videopack/title_color'] ?? '',
				'title_background_color' => $block->context['videopack/title_background_color'] ?? '',
				'skin'                   => $block->context['videopack/skin'] ?? '',
				'textAlign'              => ! empty( $block->context['videopack/textAlign'] ) ? $block->context['videopack/textAlign'] : null,
				'isInsideThumbnail'      => ! empty( $block->context['videopack/isInsideThumbnail'] ),
			),
			$attributes
		);

		return Modular_Renderer::render_view_count( $source, $merged_attributes );
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
}
