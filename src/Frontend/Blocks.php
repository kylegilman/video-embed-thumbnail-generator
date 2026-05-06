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
	 * Cache for prepared player metadata during collection rendering.
	 *
	 * @var array
	 */
	public static $collection_metadata_cache = array();

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
			'videopack/player-container' => 'render_player',
			'videopack/player'           => 'render_player_engine',
			'videopack/watermark'        => 'render_video_watermark',
			'videopack/collection'       => 'render_collection',
			'videopack/thumbnail'        => 'render_thumbnail',
			'videopack/title'            => 'render_video_title',
			'videopack/duration'         => 'render_video_duration',
			'videopack/view-count'       => 'render_view_count',
			'videopack/play-button'      => 'render_play_button',
			'videopack/pagination'       => 'render_pagination',
			'videopack/loop'             => 'render_video_loop',
			'videopack/caption'          => 'render_video_caption',
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
		// No-op: Callbacks are now injected via constructor filter to prevent race conditions with Admin\Ui.
	}

	/**
	 * Resolves the final attachment ID for a block, handling auto-discovery if needed.
	 *
	 * @param array $attributes Block attributes.
	 * @param array $context    Block context.
	 * @return int|null The resolved attachment ID.
	 */
	public function get_effective_attachment_id( $attributes, $context ) {
		// 1. Explicit ID in attributes.
		$post_id     = $attributes['postId'] ?? ( $attributes['id'] ?? null );
		$is_explicit = ! empty( $post_id );

		// 2. ID from Videopack context (passed by parent blocks).
		if ( ! $post_id ) {
			$post_id = $context['videopack/postId'] ?? null;
			if ( $post_id ) {
				$is_explicit = true;
			}
		}

		// 3. Fallback to current post ID (standard WordPress context).
		if ( ! $post_id ) {
			// If we have a manual src (either in attributes or inherited via context),
			// we should skip discovery to avoid overriding an external URL.
			if ( ! empty( $attributes['src'] ) || ! empty( $context['videopack/src'] ) ) {
				return null;
			}

			$post_id = $context['postId'] ?? get_the_ID();
		}

		if ( ! $post_id || ! is_numeric( $post_id ) ) {
			return null;
		}

		$post_id   = (int) $post_id;
		$post_type = get_post_type( $post_id );
		$mime      = strtolower( trim( (string) get_post_mime_type( $post_id ) ) );

		// 4. If it's an attachment, validate and return it.
		if ( 'attachment' === $post_type ) {
			// Broad check for video types, including HLS manifests.
			if ( 0 === strpos( $mime, 'video/' ) || 'application/x-mpegurl' === $mime || 'application/vnd.apple.mpegurl' === $mime ) {
				return $post_id;
			}

			// If it's an explicit attachment ID, we trust it even if the mime check is inconclusive.
			if ( $is_explicit ) {
				return $post_id;
			}
		}

		// 5. If it's a regular post (or we fell through), try to find the first attached video.
		// We only perform auto-discovery if the ID refers to a non-attachment post.
		if ( $post_type && 'attachment' !== $post_type ) {
			$discovered_id = $this->get_first_video_child( $post_id );
			if ( $discovered_id ) {
				return $discovered_id;
			}
		}

		// Final fallback: if we have an explicit ID but discovery found nothing,
		// return the original ID and let the player attempt to handle it.
		return $is_explicit ? $post_id : null;
	}

	/**
	 * Retrieves the ID of the first video attachment for a given post.
	 *
	 * @param int $post_id The parent post ID.
	 * @return int|null The video attachment ID or null if not found.
	 */
	protected function get_first_video_child( $post_id ) {
		$args = array(
			'post_type'      => 'attachment',
			'post_mime_type' => 'video',
			'post_status'    => 'inherit',
			'posts_per_page' => 1,
			'post_parent'    => (int) $post_id,
			'fields'         => 'ids',
			'orderby'        => 'menu_order ID',
			'order'          => 'ASC',
			'meta_query'     => array(
				array(
					'key'     => '_kgflashmediaplayer-format',
					'compare' => 'NOT EXISTS',
				),
			),
		);

		$children = get_posts( $args );
		return ! empty( $children ) ? (int) $children[0] : null;
	}

	/**
	 * Generic player renderer for the main Videopack block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content Block content.
	 * @param \WP_Block $block The block instance.
	 * @return string Rendered HTML.
	 */
	public function render_player( $attributes, $content, $block ) {
		++self::$instance_counter;
		$instance_id = 'vp_' . self::$instance_counter;

		$block->context['videopack/instanceId']              = $instance_id;
		$block->context['videopack/isInsidePlayerContainer'] = true;

		$post_id = $this->get_effective_attachment_id( $attributes, $block->context );

		if ( $post_id ) {
			$block->context['videopack/postId'] = (int) $post_id;
		}

		$source = $post_id ? \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry ) : null;

		$settings          = Context_Manager::resolve( $attributes, $block->context, $this->options );
		$merged_attributes = array_merge( $attributes, $settings['resolved'] );

		// Propagate watermark settings (these are not part of the standard design context yet).
		$block->context['videopack/watermark']         = $attributes['watermark'] ?? ( $this->options['watermark'] ?? '' );
		$block->context['videopack/watermark_styles']  = $attributes['watermark_styles'] ?? ( $this->options['watermark_styles'] ?? array() );
		$block->context['videopack/watermark_link_to'] = $attributes['watermark_link_to'] ?? ( $this->options['watermark_link_to'] ?? 'false' );

		return Modular_Renderer::render_video_container(
			array_merge(
				$merged_attributes,
				array(
					'wrapper_class' => $settings['classes'],
					'style_vars'    => $settings['style'],
				)
			),
			$content,
			true,
			$this->options
		);
	}

	/**
	 * Renders the Video Player Engine block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content Block content.
	 * @param \WP_Block $block The block instance.
	 * @return string Rendered HTML.
	 */
	public function render_player_engine( $attributes, $content, $block ) {
		$post_id = $this->get_effective_attachment_id( $attributes, $block->context );

		// Safety check: skip rendering if we have neither a valid ID nor a manual source.
		if ( ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) && empty( $attributes['src'] ) && empty( $block->context['videopack/src'] ) ) {
			return '';
		}

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options, $this->format_registry );
		$settings          = Context_Manager::resolve( $attributes, $block->context, $this->options );

		// Pull content attributes from context if not in attributes (essential for external URLs).
		$content_keys    = array( 'src', 'poster', 'title', 'caption' );
		$context_content = array();
		foreach ( $content_keys as $ck ) {
			if ( isset( $block->context[ "videopack/{$ck}" ] ) ) {
				$context_content[ $ck ] = $block->context[ "videopack/{$ck}" ];
			}
		}

		$merged_attributes = array_merge(
			$this->options,
			$settings['resolved'],
			$context_content,
			$attributes,
			array( 'id' => is_numeric( $post_id ) ? (int) $post_id : 0 )
		);
		$player            = $shortcode_handler->prepare_player( $merged_attributes );

		if ( ! $player ) {
			return '';
		}

		// Ensure children know they are inside a player engine and have the correct video context.
		$block->context['videopack/isInsidePlayerOverlay'] = true;
		$block->context['videopack/postId']                = (int) $post_id;
		$block->context['videopack/attachmentId']          = (int) $post_id;

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
		$paged = (int) ( $attributes['page_number'] ?? ( $attributes['currentPage'] ?? 1 ) );

		$has_pagination = false;
		foreach ( $block->inner_blocks as $inner_block ) {
			if ( 'videopack/pagination' === $inner_block->name ) {
				$has_pagination = true;
				break;
			}
		}
		$attributes['gallery_pagination'] = $has_pagination;

		$instance_id = $attributes['instanceId'] ?? 'vp_' . \Videopack\Admin\Ui::$instance_counter;
		if ( ! isset( $attributes['instanceId'] ) ) {
			++\Videopack\Admin\Ui::$instance_counter;
			$instance_id = 'vp_' . \Videopack\Admin\Ui::$instance_counter;
		}
		$collection_id                                     = $attributes['collectionId'] ?? ( 'vp_' . \Videopack\Admin\Ui::$instance_counter++ );
		$attributes['collectionId']                        = $collection_id;
		self::$collection_metadata_cache[ $collection_id ] = array();

		$gallery_handler = new Gallery( $this->options, $this->format_registry );
		$query           = $gallery_handler->get_gallery_videos( $paged, $attributes );

		if ( ! $query->have_posts() ) {
			return '';
		}

		$total_pages = (int) $query->max_num_pages;
		$skin        = $attributes['skin'] ?? ( $this->options['skin'] ?? 'vjs-theme-videopack' );

		$settings              = Context_Manager::resolve( $attributes, $block->context, $this->options );
		$normalized_attributes = array_merge( $this->options, $attributes, $settings['resolved'] );

		// 1. Pre-fetch and cache metadata for all videos in this page of the collection.
		$embed_method = $this->options['embed_method'] ?? 'Video.js';
		foreach ( $query->posts as $attachment ) {
			$attachment_id = $attachment->ID;
			$player        = \Videopack\Frontend\Video_Players\Player_Factory::create( $embed_method, $this->options, $this->format_registry );
			$source        = \Videopack\Video_Source\Source_Factory::create( $attachment_id, $this->options, $this->format_registry );
			$player->set_source( $source );

			// Lightbox always needs controls and title.
			$lightbox_atts = array_merge(
				$normalized_attributes,
				array(
					'id'            => $attachment_id,
					'controls'      => true,
					'overlay_title' => true,
				)
			);
			$player->set_atts( $lightbox_atts );

			$item_metadata = $player->prepare_video_vars();

			// Generate the full assembly (including title overlay, play button, etc).
			$item_metadata['full_player_html'] = \Videopack\Frontend\Modular_Renderer::render_player_assembly( $player, $lightbox_atts, $source, $this->options );
			$item_metadata['player_html']      = $item_metadata['full_player_html'];

			self::$collection_metadata_cache[ $collection_id ][ $attachment_id ] = $item_metadata;
		}

		// 2. Render content.
		$loop_content  = '';
		$other_content = '';

		// We render the 'videopack/loop' block once, passing the query results to it.
		$post_ids = wp_list_pluck( $query->posts, 'ID' );
		foreach ( $block->inner_blocks as $inner_block ) {
			if ( 'videopack/loop' === $inner_block->name ) {
				$cloned_block = clone $inner_block;

				$cloned_block->context['videopack/queryPosts']           = $post_ids;
				$cloned_block->context['videopack/collectionId']         = $collection_id;
				$cloned_block->context['videopack/collectionAttributes'] = $normalized_attributes;
				$cloned_block->context['videopack/videoToPostMapping']   = $gallery_handler->video_to_post_mapping;
				$cloned_block->context['videopack/prioritizePostData']   = ! empty( $attributes['prioritizePostData'] );
				$cloned_block->context['videopack/currentPage']          = $paged;
				$cloned_block->context['videopack/totalPages']           = $total_pages;
				$cloned_block->context['videopack/skin']                 = $skin;
				$cloned_block->context['videopack/layout']               = $normalized_attributes['layout'] ?? 'grid';
				$cloned_block->context['videopack/columns']              = $normalized_attributes['columns'] ?? 3;
				// Pass resolved design context down.
				foreach ( $settings['resolved'] as $key => $val ) {
					if ( ! empty( $val ) ) {
						$cloned_block->context[ "videopack/{$key}" ] = $val;
					}
				}

				$loop_content .= $cloned_block->render();
			}
		}

		// Render non-loop blocks (like pagination).
		foreach ( $block->inner_blocks as $inner_block ) {
			if ( 'videopack/loop' !== $inner_block->name ) {
				$cloned_block                                   = clone $inner_block;
				$cloned_block->context['videopack/currentPage'] = $paged;
				$cloned_block->context['videopack/totalPages']  = $total_pages;
				$other_content                                 .= $cloned_block->render();
			}
		}

		$layout  = $attributes['layout'] ?? 'grid';
		$columns = (int) ( $attributes['columns'] ?? 3 );

		$block_gap = $attributes['style']['spacing']['blockGap'] ?? '';
		if ( $block_gap && is_string( $block_gap ) && 0 === strpos( $block_gap, 'var:preset|spacing|' ) ) {
			$block_gap = str_replace( array( 'var:preset|spacing|', '|' ), array( 'var(--wp--preset--spacing--', '--' ), $block_gap ) . ')';
		}

		$inner_blocks_template = '';
		if ( function_exists( 'serialize_blocks' ) ) {
			$template_data = array();
			foreach ( $block->inner_blocks as $inner_block ) {
				$template_data[] = $inner_block->parsed_block;
			}
			$inner_blocks_template = wp_json_encode( $template_data );
		}

		$output = Modular_Renderer::render_video_container(
			array_merge(
				$this->options,
				$attributes,
				array(
					'align'                 => $attributes['align'] ?? ( $this->options['gallery_align'] ?? 'wide' ),
					'block_gap'             => $block_gap,
					'wrapper_class'         => 'videopack-collection-wrapper',
					'inner_blocks_template' => $inner_blocks_template,
					'totalPages'            => $total_pages,
					'currentPage'           => $paged,
					'exclude_hover_trigger' => true,
				)
			),
			'<div class="videopack-collection-inner">' . $loop_content . '</div>' . $other_content,
			true
		);

		wp_reset_postdata();

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
		$settings   = Context_Manager::resolve( $attributes, $block->context, $this->options );
		$attributes = array_merge( $this->options, $attributes, $settings['resolved'] );

		$post_ids = $block->context['videopack/queryPosts'] ?? array();
		if ( empty( $post_ids ) ) {
			$post_id = $block->context['videopack/postId'] ?? get_the_ID();
			if ( $post_id ) {
				$post_ids = array( $post_id );
			} else {
				return '';
			}
		}

		$inner_content = '';

		foreach ( $post_ids as $post_id ) {
			$item_content = '';

			global $post;
			$original_post = $post;
			// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			$post = get_post( $post_id );
			if ( $post ) {
				setup_postdata( $post );
			}

			// Prepare the context for this specific loop item.
			$parent_post_id = $block->context['videopack/videoToPostMapping'][ (int) $post_id ] ?? null;
			$prioritize     = ! empty( $block->context['videopack/prioritizePostData'] );

			$item_context = array_merge(
				$block->context,
				array(
					'postId'                 => ( $prioritize && $parent_post_id ) ? (int) $parent_post_id : (int) $post_id,
					'postType'               => ( $prioritize && $parent_post_id ) ? get_post_type( $parent_post_id ) : 'attachment',
					'videopack/postId'       => (int) $post_id,
					'videopack/parentPostId' => (int) $parent_post_id,
					'videopack/isInLoop'     => true,
					'videopack/instanceId'   => 'vp_' . \Videopack\Admin\Ui::$instance_counter++,
				)
			);

			foreach ( $block->inner_blocks as $inner_block ) {
				if ( empty( $inner_block->name ) ) {
					$item_content .= $inner_block->render();
					continue;
				}

				// Re-instantiate the block with the new context, just like core Query Loop / Post Template does.
				// This ensures that dynamic blocks and bindings resolve correctly for the new ID.
				$parsed_block = $inner_block->parsed_block;
				// Ensure inner blocks don't use a hardcoded ID from the editor template, forcing them to use the loop context.
				unset( $parsed_block['attrs']['id'], $parsed_block['attrs']['postId'] );

				$new_block = new \WP_Block(
					$parsed_block,
					$item_context
				);

				$item_content .= $new_block->render();
			}

			wp_reset_postdata();
			// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			$post = $original_post;

			$inner_content .= '<div class="videopack-collection-item">' . $item_content . '</div>';
		}

		$layout     = $block->context['videopack/layout'] ?? 'grid';
		$columns    = $block->context['videopack/columns'] ?? 3;
		$classes    = array( 'videopack-video-loop', "layout-{$layout}", "columns-{$columns}", $settings['classes'] );
		$style_vars = array( $settings['style'] );

		if ( ! empty( $columns ) ) {
			$style_vars[] = '--videopack-collection-columns: ' . $columns;
		}

		$style = ! empty( array_filter( $style_vars ) ) ? ' style="' . esc_attr( implode( ';', array_filter( $style_vars ) ) ) . '"' : '';

		return sprintf(
			'<div class="%s"%s><div class="videopack-collection-grid">%s</div></div>',
			esc_attr( implode( ' ', $classes ) ),
			$style,
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
		$settings   = Context_Manager::resolve( $attributes, $block->context, $this->options );
		$attributes = array_merge( $this->options, $attributes, $settings['resolved'] );

		$post_id = $this->get_effective_attachment_id( $attributes, $block->context );
		if ( ! $post_id ) {
			return '';
		}

		$collection_id = $block->context['videopack/collectionId'] ?? null;
		$instance_id   = $block->context['videopack/instanceId'] ?? null;

		if ( ! $collection_id && ! $instance_id ) {
			$source = \Videopack\Video_Source\Source_Factory::create( (int) $post_id, $this->options );
			if ( ! $source || ! $source->exists() ) {
				return '';
			}
		}

		$instance_id  = $instance_id ?? ( 'vp_' . \Videopack\Admin\Ui::$instance_counter++ );
		$videopack_id = $collection_id ? "videopack_player_gallery_{$post_id}_{$collection_id}" : "videopack_player_{$instance_id}";

		$player_data = null;
		if ( $collection_id && isset( self::$collection_metadata_cache[ $collection_id ][ $post_id ] ) ) {
			$player_data = self::$collection_metadata_cache[ $collection_id ][ $post_id ];
		}

		if ( ! $player_data ) {
			$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options, $this->format_registry );
			$prepared          = $shortcode_handler->prepare_player( array_merge( $attributes, array( 'id' => $post_id ) ) );

			if ( $prepared ) {
				$player      = $prepared['player'];
				$player_data = $player->prepare_video_vars();

				if ( ! isset( $player_data['full_player_html'] ) ) {
					$player_data['full_player_html'] = $player->get_player_code( array_merge( $attributes, array( 'id' => $post_id ) ) );
				}
				if ( ! isset( $player_data['player_html'] ) ) {
					$player_data['player_html'] = $player_data['full_player_html'];
				}
			}
		}

		if ( $player_data ) {
			$player_data['id'] = $videopack_id;
			$script            = sprintf(
				'window.videopack = window.videopack || {}; window.videopack.player_data = window.videopack.player_data || {}; window.videopack.player_data["%s"] = %s;',
				esc_js( $videopack_id ),
				wp_json_encode( $player_data )
			);
			wp_add_inline_script( 'videopack-core', $script );
		}

		$thumbnail_url = $player_data['poster'] ?? ( $attributes['poster'] ?? '' );
		$link_to       = $attributes['linkTo'] ?? 'none';

		if ( ! $thumbnail_url ) {
			return '';
		}

		$inner_content = '';
		foreach ( $block->inner_blocks as $inner_block ) {
			$cloned_inner                                    = clone $inner_block;
			$cloned_inner->context['videopack/postId']       = $post_id;
			$cloned_inner->context['postId']                 = $block->context['postId'] ?? (int) $post_id;
			$cloned_inner->context['postType']               = $block->context['postType'] ?? 'attachment';
			$cloned_inner->context['videopack/parentPostId'] = $block->context['videopack/parentPostId'] ?? null;
			$cloned_inner->context['videopack/isInsideThumbnail'] = true;

			foreach ( $settings['resolved'] as $key => $val ) {
				if ( ! empty( $val ) ) {
					$cloned_inner->context[ "videopack/{$key}" ] = $val;
				}
			}

			$inner_content .= $cloned_inner->render();
		}

		$exclude_hover = ! empty( $settings['resolved']['exclude_hover_trigger'] );
		$classes       = array( 'videopack-thumbnail-wrapper', 'gallery-thumbnail', 'videopack-gallery-item' );
		if ( ! $exclude_hover ) {
			$classes[] = 'videopack-hover-trigger';
		}
		$classes[] = $settings['classes'];

		if ( 'none' !== $link_to ) {
			$classes[] = 'has-link';
		}
		$style_vars   = array( $settings['style'] );
		$style_vars[] = '--videopack-mejs-controls-svg: url("' . esc_url( includes_url( 'js/mediaelement/mejs-controls.svg' ) ) . '")';

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class'                   => implode( ' ', array_unique( array_filter( $classes ) ) ),
				'style'                   => implode( ';', array_filter( $style_vars ) ),
				'data-attachment-id'      => (int) $post_id,
				'data-videopack-id'       => esc_attr( $videopack_id ),
				'data-videopack-lightbox' => ( 'lightbox' === $link_to ? 'true' : 'false' ),
			)
		);

		$html = sprintf( '<div %s>', $wrapper_attributes );

		if ( 'none' !== $link_to ) {
			$url   = 'lightbox' === $link_to ? '#' : ( 'parent' === $link_to ? ( wp_get_post_parent_id( $post_id ) ? get_permalink( wp_get_post_parent_id( $post_id ) ) : get_permalink( $post_id ) ) : get_permalink( $post_id ) );
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
		$post_id = $this->get_effective_attachment_id( $attributes, $block->context );

		// Safety check: skip rendering if we have neither a valid ID nor a manual title.
		if ( ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) && empty( $attributes['title'] ) && empty( $block->context['videopack/title'] ) ) {
			return '';
		}

		if ( ! empty( $block->context['videopack/prioritizePostData'] ) || ! empty( $attributes['usePostTitle'] ) ) {
			$display_post_id = $block->context['postId'] ?? get_the_ID();
			if ( (int) $display_post_id !== (int) $post_id || ! empty( $attributes['usePostTitle'] ) ) {
				$attributes['title'] = get_the_title( (int) $display_post_id );
			}
		}

		if ( ! empty( $attributes['linkToPost'] ) ) {
			$link_post_id           = $block->context['postId'] ?? get_the_ID();
			$attributes['link_url'] = get_permalink( (int) $link_post_id );
		}

		// Pull content attributes from context if not in attributes.
		$content_keys    = array( 'title', 'caption', 'src' );
		$context_content = array();
		foreach ( $content_keys as $ck ) {
			if ( isset( $block->context[ "videopack/{$ck}" ] ) ) {
				$context_content[ $ck ] = $block->context[ "videopack/{$ck}" ];
			}
		}

		$display_id = is_numeric( $post_id ) ? (int) $post_id : ( $block->context['videopack/src'] ?? 0 );
		$source     = \Videopack\Video_Source\Source_Factory::create( $display_id, $this->options, $this->format_registry );
		$settings   = Context_Manager::resolve( $attributes, $block->context, $this->options );

		// Merge context and resolved attributes.
		$merged_attributes = array_merge(
			$settings['resolved'],
			$context_content,
			$attributes,
			array(
				'isOverlay'               => $attributes['isOverlay'] ?? ( ! empty( $block->context['videopack/isInsideThumbnail'] ) || ! empty( $block->context['videopack/isInsidePlayerOverlay'] ) ),
				'isInsideThumbnail'       => ! empty( $block->context['videopack/isInsideThumbnail'] ),
				'isInsidePlayerOverlay'   => ! empty( $block->context['videopack/isInsidePlayerOverlay'] ),
				'isInsidePlayerContainer' => ! empty( $block->context['videopack/isInsidePlayerContainer'] ),
			),
			array_filter(
				(array) $attributes,
				function ( $v ) {
					return ! is_null( $v ) && '' !== $v; }
			)
		);

		// If embedcode is on, ensure we have an embedlink.
		if ( ! empty( $merged_attributes['embedcode'] ) && empty( $merged_attributes['embedlink'] ) ) {
			$merged_attributes['embedlink'] = (string) add_query_arg( 'videopack[enable]', 'true', (string) get_attachment_link( (int) $post_id ) );
		}

		return Modular_Renderer::render_video_title(
			array_merge(
				$merged_attributes,
				array(
					'wrapper_class' => $settings['classes'] . ' videopack-video-title-block',
					'style_vars'    => $settings['style'],
				)
			),
			$source,
			(string) ( $block->context['videopack/instanceId'] ?? ( $block->context['videopack/postId'] ?? $post_id ) )
		);
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
		$post_id = $this->get_effective_attachment_id( $attributes, $block->context );
		if ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) {
			return '';
		}

		$meta_manager = new \Videopack\Admin\Attachment_Meta( $this->options, $post_id );
		$meta         = $meta_manager->get();
		$seconds      = $meta['duration'] ?? 0;
		if ( ! $seconds ) {
			return '';
		}

		$settings = Context_Manager::resolve( $attributes, $block->context, $this->options );

		$duration_text            = $this->format_duration( (int) $seconds );
		$is_inside_thumb          = ! empty( $block->context['videopack/isInsideThumbnail'] );
		$is_inside_player_overlay = ! empty( $block->context['videopack/isInsidePlayerOverlay'] );
		$is_overlay               = $is_inside_thumb || $is_inside_player_overlay;

		$position                   = $attributes['position'] ?? ( $block->context['videopack/position'] ?? ( $is_inside_thumb ? 'top' : 'bottom' ) );
		$is_inside_player_container = ! empty( $block->context['videopack/isInsidePlayerContainer'] );
		$text_align                 = ! empty( $attributes['textAlign'] ) ? $attributes['textAlign'] : ( $is_inside_thumb ? 'right' : ( $is_inside_player_container ? 'right' : 'left' ) );

		$class  = 'videopack-video-duration-block videopack-video-duration' . ( $is_overlay ? ' is-overlay is-badge' : '' );
		$class .= ' ' . $settings['classes'];
		$class .= ' position-' . esc_attr( $position );
		$class .= ' has-text-align-' . esc_attr( $text_align );

		return sprintf( '<div class="%s" style="%s">%s</div>', esc_attr( $class ), esc_attr( $settings['style'] ), esc_html( $duration_text ) );
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
		$settings = Context_Manager::resolve( $attributes, $block->context, $this->options );

		$merged_attributes = array_merge(
			$attributes,
			$settings['resolved'],
			array(
				'wrapper_class' => $settings['classes'],
				'style_vars'    => $settings['style'],
			)
		);

		return Modular_Renderer::render_play_button( $merged_attributes, $this->options, $merged_attributes['skin'] );
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
		$post_id = $this->get_effective_attachment_id( $attributes, $block->context );
		if ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) {
			return '';
		}

		$source   = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry );
		$settings = Context_Manager::resolve( $attributes, $block->context, $this->options );

		$merged_attributes = array_merge(
			$settings['resolved'],
			array_filter(
				(array) $attributes,
				function ( $v ) {
					return ! is_null( $v ); }
			),
			array(
				'isOverlay'               => $attributes['isOverlay'] ?? ( ! empty( $block->context['videopack/isInsideThumbnail'] ) || ! empty( $block->context['videopack/isInsidePlayerOverlay'] ) ),
				'isInsideThumbnail'       => ! empty( $block->context['videopack/isInsideThumbnail'] ),
				'isInsidePlayerOverlay'   => ! empty( $block->context['videopack/isInsidePlayerOverlay'] ),
				'isInsidePlayerContainer' => ! empty( $block->context['videopack/isInsidePlayerContainer'] ),
				'textAlign'               => $attributes['textAlign'] ?? ( $block->context['videopack/textAlign'] ?? null ),
				'wrapper_class'           => $settings['classes'] . ' videopack-view-count-block',
				'style_vars'              => $settings['style'],
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
		$settings          = Context_Manager::resolve( $attributes, $block->context, $this->options );
		$merged_attributes = array_merge(
			$this->options,
			$settings['resolved'],
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

		$settings          = Context_Manager::resolve( $attributes, $block->context, $this->options );
		$merged_attributes = array_merge(
			$this->options,
			$settings['resolved'],
			$attributes
		);

		return Modular_Renderer::render_pagination( $current_page, $total_pages, $merged_attributes );
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
		$post_id = $this->get_effective_attachment_id( $attributes, $block->context );

		// Priority: Block Attribute > Context inheritance.
		$caption = $attributes['caption'] ?? ( $block->context['videopack/caption'] ?? '' );

		if ( ! empty( $block->context['videopack/prioritizePostData'] ) ) {
			$display_post_id = $block->context['postId'] ?? ( $block->context['videopack/postId'] ?? null );
			if ( $display_post_id ) {
				$post_excerpt = get_the_excerpt( (int) $display_post_id );
				if ( ! empty( $post_excerpt ) ) {
					$caption = $post_excerpt;
				}
			}
		}

		if ( empty( $caption ) && $post_id ) {
			$video_post = get_post( $post_id );
			$caption    = $video_post->post_excerpt ?? '';
		}

		return Modular_Renderer::render_video_caption( $caption );
	}

	/**
	 * Formats seconds into HH:MM:SS or MM:SS.
	 *
	 * @param int $seconds The number of seconds.
	 */
	private function format_duration( $seconds ) {
		if ( ! $seconds ) {
			return '0:00';
		}
		$h = floor( $seconds / 3600 );
		$m = floor( ( $seconds % 3600 ) / 60 );
		$s = $seconds % 60;
		if ( $h > 0 ) {
			return sprintf( '%d:%02d:%02d', $h, $m, $s );
		}
		return sprintf( '%d:%02d', $m, $s );
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
