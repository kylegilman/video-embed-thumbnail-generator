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

		$skin   = $attributes['skin'] ?? 'vjs-theme-videopack';
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( 'Video.js', $this->options, $this->format_registry );
		$player->register_scripts();
		wp_enqueue_style( 'video-js' );
		if ( ! empty( $skin ) ) {
			wp_enqueue_style( (string) $skin );
		}

		$layout          = $attributes['layout'] ?? 'grid';
		$columns         = $attributes['columns'] ?? 3;
		$wrapper_classes = "videopack-collection layout-{$layout} columns-{$columns} {$skin}";
		$total_pages     = (int) $query->max_num_pages;

		$output = '<div class="' . esc_attr( $wrapper_classes ) . '">';

		while ( $query->have_posts() ) {
			$query->the_post();
			$post_id = get_the_ID();

			foreach ( $block->inner_blocks as $inner_block ) {
				if ( 'videopack/video-loop' === $inner_block->name ) {
					$inner_block->context['postId']                = $post_id;
					$inner_block->context['videopack/currentPage'] = $paged;
					$inner_block->context['videopack/totalPages']  = $total_pages;
					$inner_block->context['videopack/skin']        = $skin;

					// Also pass along individual styling attributes to context if they exist.
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
							$inner_block->context[ "videopack/{$att}" ] = $attributes[ $att ];
						}
					}

					$output .= $inner_block->render();
				}
			}
		}
		wp_reset_postdata();

		// Render any blocks that are NOT video-cards (e.g., pagination) after the loop.
		foreach ( $block->inner_blocks as $inner_block ) {
			if ( 'videopack/video-loop' !== $inner_block->name ) {
				$inner_block->context['videopack/currentPage'] = $paged;
				$inner_block->context['videopack/totalPages']  = $total_pages;
				$output .= $inner_block->render();
			}
		}

		$output .= '</div>';

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
		$post_id = $block->context['postId'] ?? get_the_ID();
		if ( ! $post_id ) {
			return '';
		}

		$inner_content = '';
		foreach ( $block->inner_blocks as $inner_block ) {
			$inner_block->context['postId']         = $post_id;
			$inner_block->context['videopack/skin'] = $block->context['videopack/skin'] ?? '';

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
					$inner_block->context[ "videopack/{$att}" ] = $block->context[ "videopack/{$att}" ];
				}
			}

			$inner_content .= $inner_block->render();
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
		$post_id = $block->context['postId'] ?? get_the_ID();
		if ( ! $post_id ) {
			return '';
		}

		$meta          = get_post_meta( $post_id, '_videopack-meta', true );
		$thumbnail_url = $meta['thumbnail'] ?? '';

		if ( ! $thumbnail_url ) {
			// Fallback to WordPress featured image if no Videopack thumb.
			$thumbnail_url = get_the_post_thumbnail_url( $post_id, 'large' );
		}

		if ( ! $thumbnail_url ) {
			return '';
		}

		$link_to       = $attributes['linkTo'] ?? 'none';
		$skin          = $block->context['videopack/skin'] ?? '';
		$inner_content = '';
		foreach ( $block->inner_blocks as $inner_block ) {
			$inner_content .= $inner_block->render();
		}

		$html = sprintf(
			'<div class="videopack-thumbnail-wrapper gallery-thumbnail videopack-gallery-item %s" data-post-id="%d">',
			esc_attr( $skin ),
			(int) $post_id
		);

		if ( 'none' !== $link_to ) {
			$url   = ( 'lightbox' === $link_to ) ? '#' : get_permalink( $post_id );
			$html .= sprintf( '<a href="%s" class="videopack-thumbnail-link %s" data-videopack-link-to="%s">', esc_url( $url ), ( 'lightbox' === $link_to ? 'videopack-lightbox' : '' ), esc_attr( $link_to ) );
		}

		$html .= sprintf( '<img src="%s" alt="" class="videopack-thumbnail" />', esc_url( $thumbnail_url ) );
		$html .= $inner_content;

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
		$post_id = $block->context['postId'] ?? get_the_ID();
		$source  = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry );

		// Normalize boolean context attributes.
		$normalized_context = array();
		foreach ( array( 'downloadlink', 'embeddable', 'showBackground', 'overlay_title' ) as $key ) {
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
		foreach ( array( 'downloadlink', 'embeddable', 'showBackground', 'overlay_title' ) as $key ) {
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
				'isOverlay'              => ( ! isset( $normalized_context['overlay_title'] ) || false !== $normalized_context['overlay_title'] ),
				'overlay_title'          => $normalized_context['overlay_title'] ?? true,
				'title_color'            => $block->context['videopack/title_color'] ?? '',
				'title_background_color' => $block->context['videopack/title_background_color'] ?? '',
				'skin'                   => $block->context['videopack/skin'] ?? '',
				'downloadlink'           => $normalized_context['downloadlink'] ?? false,
				'embeddable'             => $normalized_context['embeddable'] ?? false,
				'textAlign'              => ! empty( $block->context['videopack/textAlign'] ) ? $block->context['videopack/textAlign'] : 'left',
				'showBackground'         => $normalized_context['showBackground'] ?? true,
				'position'               => $block->context['videopack/position'] ?? 'top',
			),
			$attributes
		);

		// If embeddable is on, ensure we have an embedlink.
		if ( ! empty( $merged_attributes['embeddable'] ) && empty( $merged_attributes['embedlink'] ) ) {
			if ( is_numeric( $post_id ) && (int) $post_id > 0 ) {
				$merged_attributes['embedlink'] = (string) add_query_arg( 'videopack[enable]', 'true', (string) get_attachment_link( (int) $post_id ) );
			}
		}

		return Modular_Renderer::render_video_title( (array) $merged_attributes, $source, (string) ( $block->context['postId'] ?? uniqid() ) );
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
		$post_id = $block->context['postId'] ?? get_the_ID();
		$meta    = get_post_meta( $post_id, '_videopack-meta', true );
		if ( empty( $meta ) ) {
			$meta = array();
		}
		$seconds = $meta['duration'] ?? 0;

		if ( ! $seconds ) {
			return '';
		}

		$duration_text = $this->format_duration( (int) $seconds );
		return sprintf( '<div class="videopack-video-duration">%s</div>', esc_html( $duration_text ) );
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
		$post_id = $block->context['postId'] ?? get_the_ID();
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
				'title_color'            => $block->context['videopack/title_color'] ?? '',
				'title_background_color' => $block->context['videopack/title_background_color'] ?? '',
				'skin'                   => $block->context['videopack/skin'] ?? '',
				'textAlign'              => ! empty( $block->context['videopack/textAlign'] ) ? $block->context['videopack/textAlign'] : 'right',
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
			'orderby'        => $attributes['gallery_orderby'] ?? 'date',
			'order'          => $attributes['gallery_order'] ?? 'desc',
		);

		if ( 'menu_order' === $args['orderby'] ) {
			$args['orderby'] = 'date';
		}

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
			$args['include'] = array_map( 'intval', explode( ',', $attributes['gallery_include'] ) );
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
}
