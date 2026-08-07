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

		// Computes and injects videopack/* context ahead of child rendering
		// (see inject_videopack_context()'s docblock for why this can't be
		// done from inside render_player()/render_player_engine() instead).
		add_filter( 'render_block_context', array( $this, 'inject_videopack_context' ), 10, 2 );
	}

	/**
	 * Computes the dynamic videopack/* context that videopack/player-container's
	 * descendants (player, title, view-count, download, share, watermark)
	 * rely on to resolve which video — and which of its resolved attributes
	 * (title, caption, poster, width, height, etc.) — they're rendering for.
	 *
	 * This can't be done by mutating $block->context inside render_player()'s
	 * render_callback body (which the code used to attempt) — WP_Block
	 * constructs every inner block, using the context available at that
	 * point, BEFORE the parent's own render_callback ever runs; a
	 * render_callback-body mutation happens strictly after all descendants
	 * have already rendered, so it never reaches them. The render_block_context
	 * filter, by contrast, fires while a block's own available context is
	 * still being assembled — early enough for descendants to actually see it.
	 *
	 * Forwards player-container's own resolved attributes into context
	 * generically (as videopack/{key}), rather than hand-picking which ones
	 * matter — an earlier version of this method did exactly that and
	 * missed title/caption/poster/width/height, silently dropping them for
	 * every shortcode-rendered video (Shortcode::atts() always fully
	 * resolves every recognized attribute — including falling back to the
	 * site's global options — onto player-container's own attributes before
	 * serializing it, so nothing here is untrusted or unbounded data; it's
	 * the same values already used to render player-container itself).
	 *
	 * @param array $context      The block's available context so far.
	 * @param array $parsed_block The parsed block about to render.
	 * @return array Modified context.
	 */
	public function inject_videopack_context( $context, $parsed_block ) {
		$name = $parsed_block['blockName'] ?? '';

		if ( 'videopack/player-container' === $name ) {
			$attributes = (array) ( $parsed_block['attrs'] ?? array() );
			$post_id    = $this->get_effective_attachment_id( $attributes, $context );

			if ( $post_id ) {
				$context['videopack/postId']       = (int) $post_id;
				$context['videopack/attachmentId'] = (int) $post_id;
			}

			foreach ( $attributes as $key => $value ) {
				$context[ "videopack/{$key}" ] = $value;
			}

			// A real block-editor-authored player-container can omit an
			// attribute entirely when it matches its declared default —
			// unlike the shortcode-simulation path, which always resolves
			// every attribute explicitly — so videopack/watermark's one
			// consumer (the videopack/watermark child block) still needs an
			// options-level fallback for the case the generic forward above
			// doesn't cover.
			if ( ! array_key_exists( 'watermark', $attributes ) ) {
				$context['videopack/watermark'] = $this->options['watermark'] ?? '';
			}
			if ( ! array_key_exists( 'watermark_styles', $attributes ) ) {
				$context['videopack/watermark_styles'] = $this->options['watermark_styles'] ?? array();
			}
			if ( ! array_key_exists( 'watermark_link_to', $attributes ) ) {
				$context['videopack/watermark_link_to'] = $this->options['watermark_link_to'] ?? 'false';
			}

			$context['videopack/isInsidePlayerContainer'] = true;
		} elseif ( 'videopack/player' === $name ) {
			$context['videopack/isInsidePlayerOverlay'] = true;
		}

		return $context;
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
			'videopack/download'         => 'render_download',
			'videopack/share'            => 'render_share',
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
			// Broad check for video types, including HLS manifests and transcoded GIFs.
			if ( 0 === strpos( $mime, 'video/' ) || 'image/gif' === $mime || 'application/x-mpegurl' === $mime || 'application/vnd.apple.mpegurl' === $mime ) {
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
			$discovered_id = \Videopack\Common\Video_Discovery::get_first_video_child( $post_id );
			if ( $discovered_id ) {
				return $discovered_id;
			}
		}

		// Final fallback: if we have an explicit ID but discovery found nothing,
		// return the original ID and let the player attempt to handle it.
		return $is_explicit ? $post_id : null;
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
		// Honor an instance id supplied by the caller (e.g. a synthetic
		// assembly built by Modular_Renderer::render_standalone_player_assembly()
		// that needs its rendered player to match an already-computed
		// player_data key) instead of always minting a fresh one — otherwise
		// this counter and the caller's own id-generation are two unrelated
		// sequences that never agree.
		$instance_id = $attributes['instanceId'] ?? null;
		if ( ! $instance_id ) {
			++self::$instance_counter;
			$instance_id = 'vp_' . self::$instance_counter;
		}

		$block->context['videopack/instanceId']              = $instance_id;
		$block->context['videopack/isInsidePlayerContainer'] = true;

		$post_id = $this->get_effective_attachment_id( $attributes, $block->context );

		if ( $post_id ) {
			$block->context['videopack/postId'] = (int) $post_id;
		}

		$source = $post_id ? \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry ) : null;

		$settings          = Context_Manager::resolve(
			$attributes,
			$block->context,
			$this->options,
			array( 'skin', 'control_bar_bg_color', 'control_bar_color', 'play_button_color', 'play_button_secondary_color' )
		);
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
		$settings          = Context_Manager::resolve(
			$attributes,
			$block->context,
			$this->options,
			array( 'skin', 'control_bar_bg_color', 'control_bar_color', 'play_button_color', 'play_button_secondary_color' )
		);

		// Pull every resolved attribute player-container forwarded into
		// context (see Blocks::inject_videopack_context()) generically,
		// rather than through a hand-picked list — a hand-picked list here
		// silently dropped width/height/title/caption, then separately
		// autoplay/muted/loop/controls/and most of the rest of the
		// playback-behavior attributes, each only discovered once a test
		// happened to check that specific one. This is the same
		// already-fully-trusted data described in that method's docblock;
		// the keys below are excluded only because they're structural
		// (computed once above, or merged separately) rather than
		// resolved shortcode/block attributes in their own right.
		$structural_context_keys = array(
			'postId',
			'attachmentId',
			'instanceId',
			'isInsidePlayerOverlay',
			'isInsidePlayerContainer',
			'watermark',
			'watermark_styles',
			'watermark_link_to',
		);
		$context_content = array();
		foreach ( $block->context as $context_key => $context_value ) {
			if ( 0 !== strpos( $context_key, 'videopack/' ) ) {
				continue;
			}
			$key = substr( $context_key, strlen( 'videopack/' ) );
			if ( in_array( $key, $structural_context_keys, true ) ) {
				continue;
			}
			$context_content[ $key ] = $context_value;
		}

		$merged_attributes = array_merge(
			$this->options,
			$settings['resolved'],
			$context_content,
			$attributes,
			array(
				'id'         => is_numeric( $post_id ) ? (int) $post_id : 0,
				// Carry the instance id assigned by the enclosing player-container
				// (render_player()) through to prepare_player(), so the Player
				// object's own get_id() (and therefore its rendered data-id)
				// matches the videopack_player_{instanceId} key used everywhere
				// else metadata for this same render is looked up.
				'instanceId' => $block->context['videopack/instanceId'] ?? null,
			)
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
		// page_number only, deliberately not falling back to currentPage: the
		// latter is a persisted block attribute, so a page an editor happened
		// to be previewing when they saved the post would otherwise become
		// every visitor's default landing page. page_number is never saved —
		// it's only ever set explicitly by AJAX pagination requests (see
		// Gallery::collection_page()) — so it's naturally absent on a normal
		// page load and correctly present during pagination.
		$paged = (int) ( $attributes['page_number'] ?? 1 );

		// Record the current post ID so it can be carried in data-settings-cache
		// for AJAX pagination requests — Gallery::get_gallery_videos() needs it
		// to resolve a "current post" gallery_source there, since get_the_ID()
		// (which works fine on this initial render) has no post context to fall
		// back on inside a REST request.
		if ( empty( $attributes['id'] ) ) {
			$attributes['id'] = get_the_ID();
		}

		$has_pagination = false;
		foreach ( $block->inner_blocks as $inner_block ) {
			if ( 'videopack/pagination' === $inner_block->name ) {
				$has_pagination = true;
				break;
			}
		}
		$attributes['gallery_pagination'] = $has_pagination;

		$instance_id   = $attributes['instanceId'] ?? ( 'vp_' . \Videopack\Admin\Ui::$instance_counter++ );
		$collection_id = $attributes['collectionId'] ?? ( 'vp_' . \Videopack\Admin\Ui::$instance_counter++ );

		$attributes['instanceId']                          = $instance_id;
		$attributes['collectionId']                        = $collection_id;
		self::$collection_metadata_cache[ $collection_id ] = array();

		$gallery_handler = new Gallery( $this->options, $this->format_registry );
		$query           = $gallery_handler->get_gallery_videos( $paged, $attributes );

		if ( ! $query->have_posts() ) {
			return '';
		}

		$total_pages = (int) $query->max_num_pages;
		$skin        = $attributes['skin'] ?? ( $this->options['skin'] ?? 'vjs-theme-videopack' );

		// Resolve any template overrides from inner blocks (e.g. thumbnail or player hover effects).
		$shared_attrs_schema = (array) apply_filters( 'videopack_shared_attributes', array() );
		if ( ! empty( $shared_attrs_schema ) && count( $block->inner_blocks ) > 0 ) {
			$template_overrides = $this->find_inner_block_attributes(
				$block->inner_blocks,
				array( 'videopack/thumbnail', 'videopack/player' ),
				array_keys( $shared_attrs_schema )
			);
			foreach ( $template_overrides as $key => $val ) {
				if ( ! empty( $val ) && 'global' !== $val ) {
					$attributes[ $key ] = $val;
				}
			}
		}

		$settings              = Context_Manager::resolve( $attributes, $block->context, $this->options, array( 'skin' ) );
		$normalized_attributes = array_merge( $this->options, $attributes, $settings['resolved'] );

		// 1. Pre-fetch and cache metadata for all videos in this page of the
		// collection — including a pre-built full_player_html for the
		// lightbox, via the same real block-rendering function used
		// everywhere else, so opening the lightbox never needs a REST round
		// trip (see Modular_Renderer::render_standalone_player_assembly()).
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

			// Must match the "videopack_player_" + this string convention
			// used for this same item's window.videopack.player_data key
			// (see render_thumbnail()'s $videopack_id) so the rendered
			// player's own data-id can be used to look its metadata back up.
			$gallery_instance_id                = "gallery_{$attachment_id}_{$collection_id}";
			$item_metadata['full_player_html'] = \Videopack\Frontend\Modular_Renderer::render_standalone_player_assembly(
				$attachment_id,
				$settings['resolved'],
				$this->options,
				$gallery_instance_id
			);
			$item_metadata['player_html']      = $item_metadata['full_player_html'];

			self::$collection_metadata_cache[ $collection_id ][ $attachment_id ] = $item_metadata;
		}

		// 2. Render content. Non-loop children (e.g. pagination) render before
		// or after the loop's own wrapper based on where they're actually
		// positioned relative to it, so e.g. a pagination block placed above
		// the loop and another below it each stay on their own side, rather
		// than always ending up after the loop regardless of position.
		$before_loop_content = '';
		$loop_content        = '';
		$after_loop_content  = '';
		$seen_loop           = false;

		// We render the 'videopack/loop' block once, passing the query results to it.
		$post_ids = wp_list_pluck( $query->posts, 'ID' );
		foreach ( $block->inner_blocks as $inner_block ) {
			$cloned_block                                   = clone $inner_block;
			$cloned_block->context['videopack/currentPage'] = $paged;
			$cloned_block->context['videopack/totalPages']  = $total_pages;

			if ( 'videopack/loop' === $inner_block->name ) {
				$seen_loop = true;

				$cloned_block->context['videopack/queryPosts']           = $post_ids;
				$cloned_block->context['videopack/collectionId']         = $collection_id;
				$cloned_block->context['videopack/collectionAttributes'] = $normalized_attributes;
				$cloned_block->context['videopack/videoToPostMapping']   = $gallery_handler->video_to_post_mapping;
				$cloned_block->context['videopack/prioritizePostData']   = ! empty( $attributes['prioritizePostData'] );
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
				continue;
			}

			if ( $seen_loop ) {
				$after_loop_content .= $cloned_block->render();
			} else {
				$before_loop_content .= $cloned_block->render();
			}
		}

		$layout  = $attributes['layout'] ?? 'grid';
		$columns = (int) ( $attributes['columns'] ?? 3 );

		$block_gap = $attributes['style']['spacing']['blockGap'] ?? '';
		if ( $block_gap && is_string( $block_gap ) && 0 === strpos( $block_gap, 'var:preset|spacing|' ) ) {
			$block_gap = str_replace( array( 'var:preset|spacing|', '|' ), array( 'var(--wp--preset--spacing--', '--' ), $block_gap ) . ')';
		}

		// Collection's own direct children (loop + pagination) — Gallery::
		// collection_page() reads this same key to rebuild the entire
		// collection's block markup for AJAX-paginated pages, so it needs
		// this outer level of the tree, not the loop's per-item structure.
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
			$before_loop_content . '<div class="videopack-collection-inner">' . $loop_content . '</div>' . $after_loop_content,
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
		$settings   = Context_Manager::resolve( $attributes, $block->context, $this->options, array( 'skin' ) );
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
		$settings   = Context_Manager::resolve(
			$attributes,
			$block->context,
			$this->options,
			array( 'skin', 'play_button_color', 'play_button_secondary_color', 'aspect_ratio' )
		);
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

		// Detect if we need to re-run player preparation because of block-level design overrides.
		$force_refresh = false;
		if ( $player_data ) {
			$force_refresh_keys = (array) apply_filters( 'videopack_force_refresh_keys', array() );
			foreach ( $force_refresh_keys as $key ) {
				$local_val  = $attributes[ $key ] ?? 'global';
				$cached_val = $player_data[ $key ] ?? 'global';
				if ( 'global' !== $local_val && $local_val !== $cached_val ) {
					$force_refresh = true;
					break;
				}
			}
		}

		if ( ! $player_data || $force_refresh ) {
			$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options, $this->format_registry );
			$prep_atts         = array_merge(
				$attributes,
				array(
					'id'           => $post_id,
					'collectionId' => $collection_id,
					'instanceId'   => $instance_id,
				)
			);
			$prepared          = $shortcode_handler->prepare_player( $prep_atts );

			if ( $prepared ) {
				$player      = $prepared['player'];
				$player_data = $player->prepare_video_vars();

				// Same shared assembly function as Blocks::render_collection(),
				// always built from global options.
				if ( ! isset( $player_data['full_player_html'] ) ) {
					$player_data['full_player_html'] = \Videopack\Frontend\Modular_Renderer::render_standalone_player_assembly(
						$post_id,
						$settings['resolved'],
						$this->options,
						$collection_id ? "gallery_{$post_id}_{$collection_id}" : $instance_id
					);
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

		$classes = array( 'videopack-thumbnail-wrapper', 'gallery-thumbnail', 'videopack-gallery-item' );
		if ( 'auto' === ( $settings['resolved']['aspect_ratio'] ?? '' ) ) {
			// "Native" mode has no fixed ratio to reserve space with, so the
			// overlay stack (Title/Play-button/etc.) can't just fill 100% of
			// a wrapper whose own height depends on a still-loading image —
			// see Thumbnail.scss's `.has-native-aspect-ratio` for the CSS
			// Grid layout that sidesteps that circular sizing problem.
			$classes[] = 'has-native-aspect-ratio';
		}
		$classes = (array) apply_filters( 'videopack_thumbnail_wrapper_classes', $classes, $settings['resolved'], $attributes );
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
				'data-attachment-id'      => (string) $post_id,
				'data-videopack-id'       => esc_attr( $videopack_id ),
				'data-videopack-lightbox' => ( 'lightbox' === $link_to ? 'true' : 'false' ),
			)
		);

		$html = Modular_Renderer::render_thumbnail(
			array(
				'poster'             => $thumbnail_url,
				'linkTo'             => $link_to,
				'wrapper_attributes' => $wrapper_attributes,
			),
			$inner_content,
			$post_id
		);

		return apply_filters( 'videopack_render_thumbnail', $html, $post_id, $attributes );
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

		// usePostTitle has no default in block.json, so an untouched block
		// simply omits it here -- that's what lets it inherit the Loop's
		// prioritizePostData setting. An explicit true/false (the block's own
		// toggle was set directly) always wins over it, in either direction.
		// videopack/parentPostId is the video's real attached-post id, set
		// unconditionally whenever one exists (regardless of the Loop's
		// prioritizePostData toggle) -- see Blocks::render_video_loop(). Using
		// it here (rather than the prioritizePostData-gated `postId`) means a
		// single Title block's own override works on its own, without
		// requiring the whole Loop to be switched into post-data mode.
		$use_post_title = isset( $attributes['usePostTitle'] )
			? (bool) $attributes['usePostTitle']
			: ! empty( $block->context['videopack/prioritizePostData'] );

		if ( $use_post_title ) {
			$parent_post_id  = $block->context['videopack/parentPostId'] ?? 0;
			$display_post_id = $parent_post_id ? $parent_post_id : ( $block->context['postId'] ?? get_the_ID() );
			if ( (int) $display_post_id !== (int) $post_id || ! empty( $attributes['usePostTitle'] ) ) {
				$attributes['title'] = get_the_title( (int) $display_post_id );
			}
		}

		if ( ! empty( $attributes['linkToPost'] ) ) {
			$parent_post_id         = $block->context['videopack/parentPostId'] ?? 0;
			$link_post_id           = $parent_post_id ? $parent_post_id : ( $block->context['postId'] ?? get_the_ID() );
			$attributes['link_url'] = get_permalink( (int) $link_post_id );
		}

		// Pull content attributes from context if not in attributes.
		// showBackground is resolved separately below via the shared helper
		// (attribute -> context -> global option -> true), rather than a
		// bare context passthrough here, so the global-option fallback step
		// isn't silently skipped.
		$content_keys    = array( 'title', 'caption', 'src', 'overlay_title' );
		$context_content = array();
		foreach ( $content_keys as $ck ) {
			if ( isset( $block->context[ "videopack/{$ck}" ] ) ) {
				$context_content[ $ck ] = $block->context[ "videopack/{$ck}" ];
			}
		}

		$is_overlay       = $attributes['isOverlay'] ?? ( ! empty( $block->context['videopack/isInsideThumbnail'] ) || ! empty( $block->context['videopack/isInsidePlayerOverlay'] ) );
		$show_background = Context_Manager::resolve_show_background( $attributes, $block->context, $this->options, (bool) $is_overlay );

		$display_id = is_numeric( $post_id ) ? (int) $post_id : ( $block->context['videopack/src'] ?? 0 );
		$source     = \Videopack\Video_Source\Source_Factory::create( $display_id, $this->options, $this->format_registry );
		$settings   = Context_Manager::resolve(
			$attributes,
			$block->context,
			$this->options,
			array( 'skin', 'title_color', 'title_background_color' )
		);

		// Merge context and resolved attributes. $attributes is deliberately
		// only merged once here, filtered to non-empty values — so the
		// title block's own attribute wins when it's meaningfully set, but
		// otherwise defers to $context_content (e.g. a shortcode's explicit
		// title="..." override, bridged in via videopack/title context).
		// An earlier version also merged $attributes unfiltered ahead of
		// this, which unconditionally clobbered $context_content with the
		// block's *empty* declared default before this filtered layer ever
		// got a chance to run — silently dropping every such override.
		$merged_attributes = array_merge(
			$settings['resolved'],
			$context_content,
			array(
				'isOverlay'               => $is_overlay,
				'isInsideThumbnail'       => ! empty( $block->context['videopack/isInsideThumbnail'] ),
				'isInsidePlayerOverlay'   => ! empty( $block->context['videopack/isInsidePlayerOverlay'] ),
				'isInsidePlayerContainer' => ! empty( $block->context['videopack/isInsidePlayerContainer'] ),
			),
			array_filter(
				(array) $attributes,
				function ( $v ) {
					return ! is_null( $v ) && '' !== $v; }
			),
			// Always wins over the raw $attributes merge above -- the raw
			// value could be an unnormalized string/boolean-ish value from
			// serialization, where resolve_show_background() has already
			// applied the correct attribute -> context -> option -> true
			// precedence and normalized the result to a real boolean.
			array( 'showBackground' => $show_background )
		);

		// If embedcode is on, ensure we have an embedlink.
		if ( ! empty( $merged_attributes['embedcode'] ) && empty( $merged_attributes['embedlink'] ) ) {
			$merged_attributes['embedlink'] = (string) add_query_arg( 'videopack[enable]', 'true', (string) get_attachment_link( (int) $post_id ) );
		}

		return Modular_Renderer::render_video_title(
			array_merge(
				$merged_attributes,
				array(
					'wrapper_class'           => $settings['classes'] . ' videopack-video-title-block',
					'style_vars'              => $settings['style'],
					'inner_content'           => $content,
					'context_colors_resolved' => true,
				)
			),
			$source,
			(string) ( $block->context['videopack/instanceId'] ?? ( $block->context['videopack/postId'] ?? $post_id ) )
		);
	}

	/**
	 * Renders the Video Download block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_download( $attributes, $content, $block ) {
		$post_id = $this->get_effective_attachment_id( $attributes, $block->context );
		if ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) {
			return '';
		}

		$is_inside_thumb = ! empty( $block->context['videopack/isInsideThumbnail'] );

		$source = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry );
		if ( ! $source ) {
			return '';
		}

		$settings          = Context_Manager::resolve(
			$attributes,
			$block->context,
			$this->options,
			array( 'title_color', 'title_background_color' )
		);
		$merged_attributes = array_merge( $attributes, $settings['resolved'] );

		$is_inside_title            = ! empty( $block->context['videopack/isInsideTitleMeta'] );
		$is_inside_player_container = ! empty( $block->context['videopack/isInsidePlayerContainer'] );
		$is_inside_player_overlay   = ! empty( $block->context['videopack/isInsidePlayerOverlay'] );
		$is_overlay                 = ( $is_inside_thumb || $is_inside_player_overlay ) && ! $is_inside_title;

		$html = Modular_Renderer::render_download(
			array_merge(
				$merged_attributes,
				array(
					'wrapper_class'           => $settings['classes'],
					'style_vars'              => $settings['style'],
					'isInsideTitleMeta'       => $is_inside_title,
					'isInsidePlayerContainer' => $is_inside_player_container,
					'isInsidePlayerOverlay'   => $is_inside_player_overlay,
					'isInsideThumbnail'       => $is_inside_thumb,
					'showBackground'          => Context_Manager::resolve_show_background( $attributes, $block->context, $this->options, $is_overlay ),
				)
			),
			$source,
			$this->options,
			$this->format_registry
		);

		return apply_filters( 'videopack_render_download', $html, $post_id, $attributes, $block );
	}

	/**
	 * Renders the Video Share block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block inner content.
	 * @param \WP_Block $block      Block instance.
	 * @return string Rendered HTML.
	 */
	public function render_share( $attributes, $content, $block ) {
		$post_id = $this->get_effective_attachment_id( $attributes, $block->context );
		if ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) {
			return '';
		}

		$source = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options, $this->format_registry );
		if ( ! $source ) {
			return '';
		}

		$settings          = Context_Manager::resolve(
			$attributes,
			$block->context,
			$this->options,
			array( 'title_color', 'title_background_color' )
		);
		$merged_attributes = array_merge( $attributes, $settings['resolved'] );

		$is_inside_thumb            = ! empty( $block->context['videopack/isInsideThumbnail'] );
		$is_inside_title            = ! empty( $block->context['videopack/isInsideTitleMeta'] );
		$is_inside_player_container = ! empty( $block->context['videopack/isInsidePlayerContainer'] );
		$is_inside_player_overlay   = ! empty( $block->context['videopack/isInsidePlayerOverlay'] );
		$is_overlay                 = ( $is_inside_thumb || $is_inside_player_overlay ) && ! $is_inside_title;

		$html = Modular_Renderer::render_share(
			array_merge(
				$merged_attributes,
				array(
					'wrapper_class'           => $settings['classes'],
					'style_vars'              => $settings['style'],
					'isInsideTitleMeta'       => $is_inside_title,
					'isInsidePlayerContainer' => $is_inside_player_container,
					'isInsidePlayerOverlay'   => $is_inside_player_overlay,
					'isInsideThumbnail'       => $is_inside_thumb,
					'showBackground'          => Context_Manager::resolve_show_background( $attributes, $block->context, $this->options, $is_overlay ),
				)
			),
			$source,
			(string) ( $block->context['videopack/instanceId'] ?? ( $block->context['videopack/postId'] ?? $post_id ) ),
			$this->options
		);

		return apply_filters( 'videopack_render_share', $html, $post_id, $attributes, $block );
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

		$settings = Context_Manager::resolve(
			$attributes,
			$block->context,
			$this->options,
			array( 'title_color', 'title_background_color' )
		);

		$is_inside_thumb          = ! empty( $block->context['videopack/isInsideThumbnail'] );
		$is_inside_player_overlay = ! empty( $block->context['videopack/isInsidePlayerOverlay'] );
		$is_overlay               = $is_inside_thumb || $is_inside_player_overlay;

		return Modular_Renderer::render_video_duration(
			array(
				'seconds'                 => (int) $seconds,
				'position'                => $attributes['position'] ?? ( $block->context['videopack/position'] ?? null ),
				'textAlign'               => $attributes['textAlign'] ?? null,
				'isInsideThumbnail'       => $is_inside_thumb,
				'isInsidePlayerOverlay'   => $is_inside_player_overlay,
				'isInsidePlayerContainer' => ! empty( $block->context['videopack/isInsidePlayerContainer'] ),
				'showBackground'          => Context_Manager::resolve_show_background( $attributes, $block->context, $this->options, $is_overlay ),
				'wrapper_class'           => $settings['classes'],
				'style_vars'              => $settings['style'],
			)
		);
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
		$settings = Context_Manager::resolve(
			$attributes,
			$block->context,
			$this->options,
			array( 'play_button_color', 'play_button_secondary_color' )
		);

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
		$settings = Context_Manager::resolve(
			$attributes,
			$block->context,
			$this->options,
			array( 'title_color', 'title_background_color' )
		);

		$is_overlay = $attributes['isOverlay'] ?? ( ! empty( $block->context['videopack/isInsideThumbnail'] ) || ! empty( $block->context['videopack/isInsidePlayerOverlay'] ) );

		$merged_attributes = array_merge(
			$settings['resolved'],
			array_filter(
				(array) $attributes,
				function ( $v ) {
					return ! is_null( $v ); }
			),
			array(
				'isOverlay'               => $is_overlay,
				'isInsideThumbnail'       => ! empty( $block->context['videopack/isInsideThumbnail'] ),
				'isInsidePlayerOverlay'   => ! empty( $block->context['videopack/isInsidePlayerOverlay'] ),
				'isInsidePlayerContainer' => ! empty( $block->context['videopack/isInsidePlayerContainer'] ),
				'textAlign'               => $attributes['textAlign'] ?? ( $block->context['videopack/textAlign'] ?? null ),
				'showBackground'          => Context_Manager::resolve_show_background( $attributes, $block->context, $this->options, (bool) $is_overlay ),
				'wrapper_class'           => $settings['classes'] . ' videopack-view-count-block',
				'style_vars'              => $settings['style'],
				// Tells render_view_count() that title_color/title_background_color
				// were already resolved into wrapper_class/style_vars above, so it
				// shouldn't also build its own copy from the raw attributes.
				'context_colors_resolved' => true,
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
		$settings          = Context_Manager::resolve( $attributes, $block->context, $this->options, array() );
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

		$settings          = Context_Manager::resolve(
			$attributes,
			$block->context,
			$this->options,
			array( 'pagination_color', 'pagination_active_color' )
		);
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
	 * Recursively finds attributes inside inner blocks.
	 *
	 * @param \WP_Block_List $inner_blocks   The inner blocks.
	 * @param array          $target_names   Block names to match.
	 * @param array          $attribute_keys Attribute keys to extract.
	 * @return array The found attributes.
	 */
	private function find_inner_block_attributes( \WP_Block_List $inner_blocks, array $target_names, array $attribute_keys ) {
		$found = array();
		foreach ( $inner_blocks as $inner_block ) {
			if ( in_array( $inner_block->name, $target_names, true ) ) {
				foreach ( $attribute_keys as $key ) {
					if ( isset( $inner_block->attributes[ $key ] ) ) {
						$found[ $key ] = $inner_block->attributes[ $key ];
					}
				}
			}
			if ( count( $inner_block->inner_blocks ) > 0 ) {
				$nested = $this->find_inner_block_attributes( $inner_block->inner_blocks, $target_names, $attribute_keys );
				$found  = array_merge( $nested, $found );
			}
		}
		return $found;
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

		if ( ! $this->page_has_lightbox_content() ) {
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
	 * Determines whether the current page's content could actually open the
	 * global lightbox modal, by scanning the post(s) about to be displayed for
	 * a Collection/Gallery block (which defaults its grid_link_to to
	 * 'lightbox') or an explicit link_to/linkTo/grid_link_to value of
	 * 'lightbox' on a thumbnail or the legacy shortcode, or by the site's
	 * alwaysloadscripts setting (content injected via AJAX page loading after
	 * the initial page render needs this container to already exist in the DOM,
	 * the same reason that setting forces core CSS/JS to always load).
	 *
	 * A false positive here just leaves a small hidden, empty <div> in the
	 * footer, so this deliberately over-detects rather than risk silently
	 * breaking a real lightbox gallery with a false negative.
	 *
	 * @return bool
	 */
	protected function page_has_lightbox_content(): bool {
		if ( ! empty( $this->options['alwaysloadscripts'] ) ) {
			return true;
		}

		// Modular_Renderer::render_thumbnail() sets this the moment it
		// actually renders a lightbox trigger (linkTo="lightbox"), for
		// every rendering path alike — block-authored or shortcode-
		// simulated. render_global_modal() runs on wp_footer, after all
		// main content (where that render happens) has already output, so
		// by the time this is checked the flag reflects the real page.
		//
		// Previously this guessed from $wp_query->posts' raw post_content
		// instead (checking for the literal '<!-- wp:videopack/collection'
		// block comment or the substring 'lightbox'), which missed every
		// shortcode-built gallery: a [videopack gallery="true"] shortcode's
		// stored post_content contains neither — that markup only exists
		// after do_shortcode() expands it at render time — so the global
		// modal never rendered and the lightbox silently had no target to
		// open into.
		return Modular_Renderer::$rendered_lightbox_trigger;
	}
}
