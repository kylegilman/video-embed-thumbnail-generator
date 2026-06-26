<?php
/**
 * Modular rendering utility for Videopack.
 *
 * @package Videopack
 * @subpackage Videopack/Frontend
 */

namespace Videopack\Frontend;

/**
 * Class Modular_Renderer
 *
 * Provides static methods to render individual modular components like the Video Title
 * and video captions. This allows for code reuse between block render callbacks
 * and shortcode simulation.
 *
 * @since 5.2.0
 */
class Modular_Renderer {
	/**
	 * Helper to normalize boolean-like attributes from shortcodes or blocks.
	 *
	 * @param mixed $val The value to check.
	 * @return bool
	 */
	public static function is_true( $val ) {
		if ( true === $val || 'true' === $val || 1 === $val || '1' === $val || 'on' === $val || 'yes' === $val ) {
			return true;
		}
		return false;
	}

	/**
	 * Renders the video duration badge.
	 *
	 * @param array $atts    Attributes (seconds, position, textAlign).
	 * @param array $context Context (skin, colors).
	 * @return string The rendered HTML.
	 */
	public static function render_video_duration( array $atts, array $context = array() ) {
		$seconds = (int) ( $atts['seconds'] ?? 0 );
		if ( ! $seconds ) {
			return '';
		}

		$duration_text = self::format_duration( $seconds );

		$is_inside_thumb = ! empty( $context['isInsideThumbnail'] );
		$is_overlay      = $is_inside_thumb || ! empty( $context['skin'] );
		$position        = $atts['position'] ?? ( $context['position'] ?? ( $is_inside_thumb ? 'top' : 'bottom' ) );
		$text_align      = $atts['textAlign'] ?? ( $is_inside_thumb ? 'right' : 'left' );

		$class  = 'videopack-video-duration' . ( $is_overlay ? ' is-overlay is-badge' : '' );
		$class .= ' position-' . esc_attr( $position );
		$class .= ' has-text-align-' . esc_attr( $text_align );

		$style_vars = array();
		if ( $is_overlay ) {
			if ( ! empty( $context['title_background_color'] ) ) {
				$style_vars[] = '--videopack-title-background-color: ' . $context['title_background_color'];
			}
			if ( ! empty( $context['title_color'] ) ) {
				$style_vars[] = '--videopack-title-color: ' . $context['title_color'];
			}
		}

		$style = ! empty( $style_vars ) ? ' style="' . esc_attr( implode( ';', $style_vars ) ) . '"' : '';

		return sprintf( '<div class="%s"%s>%s</div>', esc_attr( $class ), $style, esc_html( $duration_text ) );
	}

	/**
	 * Formats seconds into HH:MM:SS or MM:SS.
	 *
	 * @param int $seconds The duration in seconds.
	 * @return string
	 */
	private static function format_duration( $seconds ) {
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
	 * Renders the main video container wrapper.
	 *
	 * @param array  $atts          Block or shortcode attributes.
	 * @param string $inner_content Content to wrap.
	 * @param bool   $is_block      Whether this is being rendered as a block.
	 * @param array  $options       Optional. Global plugin options for fallbacks.
	 * @return string The rendered HTML.
	 */
	public static function render_video_container( array $atts, $inner_content, $is_block = false, $options = array() ) {
		wp_enqueue_style( 'videopack-core' );
		wp_enqueue_script( 'videopack-core' );
		$is_modular_engine = ! empty( $atts['is_modular_engine'] );
		$exclude_hover     = ! empty( $atts['exclude_hover_trigger'] );
		$classes           = array( 'videopack-wrapper' );
		if ( ! $exclude_hover ) {
			$classes[] = 'videopack-hover-trigger';
		}

		if ( $is_block ) {
			$classes[] = 'videopack-video-block-container';
		}

		if ( ! empty( $atts['wrapper_class'] ) ) {
			$classes[] = $atts['wrapper_class'];
		}

		$embed_method = $atts['embed_method'] ?? $options['embed_method'] ?? 'Video.js';
		if ( $embed_method ) {
			$classes[] = 'videopack-embed-' . sanitize_title( (string) $embed_method );
		}

		// Title visibility is now managed by the title/meta bars themselves.

		$align = (string) ( $atts['align'] ?? '' );
		if ( empty( $align ) ) {
			// Fallback to gallery_align for collections, or standard align for players.
			$align = ( ! empty( $atts['wrapper_class'] ) && strpos( $atts['wrapper_class'], 'collection' ) !== false )
				? ( $options['gallery_align'] ?? '' )
				: ( $options['align'] ?? '' );
		}

		if ( (bool) ( $atts['inline'] ?? false ) ) {
			$classes[] = 'videopack-wrapper-inline';
			if ( in_array( $align, array( 'left', 'right' ), true ) ) {
				$classes[] = 'videopack-wrapper-inline-' . $align;
			} elseif ( 'center' === $align ) {
				$classes[] = 'videopack-wrapper-auto-left';
				$classes[] = 'videopack-wrapper-auto-right';
			}
		} elseif ( 'center' === $align || 'aligncenter' === $align ) {
			$classes[] = 'videopack-wrapper-auto-left';
			$classes[] = 'videopack-wrapper-auto-right';
		} elseif ( 'right' === $align || 'alignright' === $align ) {
			$classes[] = 'videopack-wrapper-auto-left';
		}

		// Explicitly add Gutenberg alignment classes for blocks or when using modern alignments.
		if ( ! empty( $align ) ) {
			if ( 0 === strpos( $align, 'align' ) ) {
				$classes[] = $align;
			} else {
				$classes[] = 'align' . $align;
			}
		}

		// We do NOT add the skin class to the outer container anymore to prevent
		// style leakage to non-player elements (like view counts).
		// Overlays like the Title Bar should handle their own skinning from context.

		$style_vars = array();
		$colors     = array(
			'title-color'                 => 'title_color',
			'title-background-color'      => 'title_background_color',
			'play-button-color'           => 'play_button_color',
			'play-button-secondary-color' => 'play_button_secondary_color',
			'control-bar-bg-color'        => 'control_bar_bg_color',
			'control-bar-color'           => 'control_bar_color',
		);

		foreach ( $colors as $variable => $attribute ) {
				$val = array_key_exists( $attribute, $atts ) ? $atts[ $attribute ] : ( $options[ $attribute ] ?? '' );
			if ( ! empty( $val ) ) {
				$show_bg = ! isset( $atts['showBackground'] ) || ( 'false' !== $atts['showBackground'] && '0' !== $atts['showBackground'] && false !== $atts['showBackground'] && '' !== $atts['showBackground'] );

				// Suppress background color variable if showBackground is false.
				if ( 'title-background-color' === $variable && ! $show_bg ) {
					continue;
				}

				$style_vars[] = "--videopack-{$variable}: " . $val;

				if ( 'title-background-color' === $variable ) {
					$classes[] = 'videopack-has-title-background-color';
				} elseif ( 'title-color' === $variable ) {
					$classes[] = 'videopack-has-title-color';
				} elseif ( 'play-button-color' === $variable ) {
					$classes[] = 'videopack-has-play-button-color';
				} elseif ( 'play-button-secondary-color' === $variable ) {
					$classes[] = 'videopack-has-play-button-secondary-color';
				} elseif ( 'control-bar-bg-color' === $variable ) {
					$classes[] = 'videopack-has-control-bar-bg-color';
				} elseif ( 'control-bar-color' === $variable ) {
					$classes[] = 'videopack-has-control-bar-color';
				}
			}
		}

		if ( ! empty( $atts['block_gap'] ) ) {
			$style_vars[] = '--videopack-collection-gap: ' . $atts['block_gap'];
		}

		// Add MEJS controls SVG for mask coloring.
		$style_vars[] = '--videopack-mejs-controls-svg: url("' . esc_url( includes_url( 'js/mediaelement/mejs-controls.svg' ) ) . '")';

		$extra_attrs = array();
		if ( ! empty( $atts['wrapper_class'] ) && strpos( $atts['wrapper_class'], 'collection' ) !== false ) {
			// Ensure we pass back the settings for AJAX pagination.
			// We only include attributes that are relevant to the video query to keep it clean.
			$query_keys     = array(
				'gallery_id',
				'gallery_source',
				'gallery_pagination',
				'gallery_per_page',
				'gallery_include',
				'gallery_exclude',
				'gallery_orderby',
				'gallery_order',
				'gallery_category',
				'gallery_tag',
				'relation',
				'columns',
				'layout',
				'skin',
				'pagination_color',
				'pagination_background_color',
				'pagination_active_bg_color',
				'pagination_active_color',
				'title_color',
				'title_background_color',
				'play_button_color',
				'play_button_secondary_color',
				'control_bar_bg_color',
				'control_bar_color',
				'views',
				'overlay_title',
				'enable_collection_video_limit',
				'collection_video_limit',
				'grid_metadata',
				'grid_link_to',
				'inner_blocks_template',
				'collectionId',
				'gallery_end',
			);
			$query_settings = array();
			foreach ( $query_keys as $key ) {
				if ( isset( $atts[ $key ] ) ) {
					$query_settings[ $key ] = $atts[ $key ];
				}
			}
			$json                               = wp_json_encode( $query_settings );
			$extra_attrs['data-settings-cache'] = $json;
			$extra_attrs['data-layout']         = $atts['layout'] ?? 'grid';
			$extra_attrs['data-total-pages']    = $atts['totalPages'] ?? 1;
			$extra_attrs['data-current-page']   = $atts['currentPage'] ?? 1;
		}

		$data_attrs = '';
		foreach ( $extra_attrs as $key => $val ) {
			$data_attrs .= ' ' . esc_attr( $key ) . '="' . esc_attr( (string) $val ) . '"';
		}

		if ( $is_block ) {
			$wrapper_attrs = get_block_wrapper_attributes(
				array(
					'class' => implode( ' ', $classes ),
					'style' => implode( ';', $style_vars ),
				)
			) . $data_attrs;
		} else {
			$style         = ! empty( $style_vars ) ? ' style="' . esc_attr( implode( ';', $style_vars ) ) . '"' : '';
			$wrapper_attrs = 'class="' . esc_attr( implode( ' ', $classes ) ) . '"' . $style . $data_attrs;
		}

		return sprintf(
			'<figure %s>%s</figure>',
			$wrapper_attrs,
			$inner_content
		);
	}

	/**
	 * Renders the watermark HTML.
	 *
	 * @param array $atts Watermark attributes.
	 * @return string The rendered HTML.
	 */
	public static function render_watermark( array $atts ) {
		// Resolve options if needed for fallbacks.
		$options = get_option( 'videopack_options', array() );

		// Image Source Resolution.
		$watermark = $atts['watermark'] ?? '';
		if ( 'false' === $watermark || '0' === $watermark || empty( $watermark ) ) {
			return '';
		}

		if ( is_numeric( $watermark ) ) {
			$watermark = wp_get_attachment_url( (int) $watermark );
		}

		if ( ! $watermark ) {
			return '';
		}

		// Style Resolution.
		$styles = $atts['watermark_styles'] ?? ( $options['watermark_styles'] ?? array() );
		$scale  = $atts['watermark_scale'] ?? ( $atts['scale'] ?? ( $styles['scale'] ?? 10 ) );
		$align  = $atts['watermark_align'] ?? ( $atts['align'] ?? ( $styles['align'] ?? 'right' ) );
		$valign = $atts['watermark_valign'] ?? ( $atts['valign'] ?? ( $styles['valign'] ?? 'bottom' ) );
		$x      = $atts['watermark_x'] ?? ( $atts['x'] ?? ( $styles['x'] ?? 5 ) );
		$y      = $atts['watermark_y'] ?? ( $atts['y'] ?? ( $styles['y'] ?? 7 ) );

		// Validate alignment to prevent collisions with player/container alignment (e.g. 'wide', 'full').
		if ( ! in_array( $align, array( 'left', 'center', 'right' ), true ) ) {
			$align = $styles['align'] ?? 'right';
		}
		if ( ! in_array( $valign, array( 'top', 'center', 'bottom' ), true ) ) {
			$valign = $styles['valign'] ?? 'bottom';
		}

		// Link Resolution.
		$link_to = $atts['watermark_link_to'] ?? ( $options['watermark_link_to'] ?? 'false' );
		$link    = '';
		$post_id = $atts['postId'] ?? ( $atts['id'] ?? 0 );

		if ( 'home' === $link_to ) {
			$link = get_home_url();
		} elseif ( 'parent' === $link_to && $post_id ) {
			$parent_id = wp_get_post_parent_id( $post_id );
			$link      = $parent_id ? get_permalink( $parent_id ) : get_permalink( $post_id );
		} elseif ( 'attachment' === $link_to && $post_id ) {
			$link = get_permalink( $post_id );
		} elseif ( 'download' === $link_to && $post_id ) {
			$source = \Videopack\Video_Source\Source_Factory::create( (int) $post_id, $options );
			if ( $source ) {
				$link = $source->get_download_url();
			}
		} elseif ( 'custom' === $link_to ) {
			$link = $atts['watermark_url'] ?? ( $options['watermark_url'] ?? '' );
		}

		$style_attrs = array(
			'max-width:' . $scale . '%',
		);

		if ( 'center' === $align ) {
			$style_attrs[] = 'left:50%';
			$style_attrs[] = 'transform:translateX(-50%)';
		} else {
			$style_attrs[] = $align . ':' . $x . '%';
		}

		if ( 'center' === $valign ) {
			$style_attrs[] = 'top:50%';
			$style_attrs[] = ( 'center' === $align ) ? 'transform:translate(-50%, -50%)' : 'transform:translateY(-50%)';
		} else {
			$style_attrs[] = $valign . ':' . $y . '%';
		}

		if ( ! $link ) {
			$style_attrs[] = 'pointer-events:none';
		}

		$style = ' style="' . esc_attr( implode( ';', $style_attrs ) ) . '"';

		$img = sprintf(
			'<img src="%s" alt="%s" style="display:block;width:100%%;height:auto;" />',
			esc_url( $watermark ),
			esc_attr__( 'Watermark', 'video-embed-thumbnail-generator' )
		);

		$skin = $atts['skin'] ?? ( $options['skin'] ?? 'default' );
		$id   = $atts['instance_id'] ?? ( $atts['id'] ?? uniqid() );

		$skin = $atts['skin'] ?? ( $options['skin'] ?? 'default' );
		$id   = $atts['instance_id'] ?? ( $atts['id'] ?? uniqid() );

		if ( $link ) {
			$is_download = 'download' === $link_to;
			$link_attrs  = array();

			if ( $is_download ) {
				$link_attrs[] = 'class="videopack-download-link"';
				$link_attrs[] = 'href="' . esc_url( $source ? $source->get_url() : $link ) . '"';
				$link_attrs[] = 'download';
				$link_attrs[] = 'title="' . esc_attr__( 'Click to download', 'video-embed-thumbnail-generator' ) . '"';
				if ( $source ) {
					$link_attrs[] = 'data-alt_link="' . esc_url( $source->get_download_url() ) . '"';
				}
			} else {
				$link_attrs[] = 'href="' . esc_url( $link ) . '"';
				$link_attrs[] = 'target="_blank"';
				$link_attrs[] = 'rel="noopener"';
			}

			return sprintf(
				'<div id="video_%s_watermark" class="videopack-video-watermark %s"%s><a %s>%s</a></div>',
				esc_attr( (string) $id ),
				esc_attr( $skin ),
				$style,
				implode( ' ', $link_attrs ),
				$img
			);
		}

		return sprintf(
			'<div id="video_%s_watermark" class="videopack-video-watermark %s"%s>%s</div>',
			esc_attr( (string) $id ),
			esc_attr( $skin ),
			$style,
			$img
		);
	}


	/**
	 * Returns the inline SVG code for a given icon type.
	 *
	 * @param string $type The icon type ('eye', 'play', 'playOutline').
	 * @return string The SVG HTML.
	 */
	public static function get_svg_icon( $type ) {
		return Icons::get( $type );
	}

	/**
	 * Renders the Video Title HTML (with optional player overlay icons).
	 *
	 * @param array                          $atts   The block or shortcode attributes.
	 * @param \Videopack\Video_Source\Source $source The video source object.
	 * @param int|string                     $id     Unique ID for this player instance.
	 * @return string The rendered HTML.
	 */
	public static function render_video_title( array $atts, $source, $id ) {
		wp_enqueue_style( 'videopack-core' );
		$options       = get_option( 'videopack_options', array() );
		$inner_content = $atts['inner_content'] ?? '';

		$title = ! empty( $atts['title'] ) ? $atts['title'] : ( $source ? $source->get_title() : '' );
		$tag   = $atts['tagName'] ?? 'h3';

		$is_inside_thumbnail = ! empty( $atts['isInsideThumbnail'] );
		$position            = ! empty( $atts['position'] ) ? $atts['position'] : ( $is_inside_thumbnail ? 'bottom' : 'top' );

		$show_title = ! isset( $atts['overlay_title'] ) || self::is_true( $atts['overlay_title'] );

		// Resolve showBackground from attributes or context.
		$is_overlay      = self::is_true( $atts['isOverlay'] ?? false ) || self::is_true( $atts['is_overlay'] ?? false );
		$show_background = true;
		if ( isset( $atts['showBackground'] ) ) {
			$show_background = self::is_true( $atts['showBackground'] );
		}

		if ( ! $is_overlay ) {
			if ( ! $show_title ) {
				return '';
			}
			$style_attrs = array();
			$text_align  = $atts['textAlign'] ?? 'left';
			if ( ! empty( $atts['title_color'] ) ) {
				$style_attrs[] = 'color:' . $atts['title_color'];
			}
			if ( $show_background && ! empty( $atts['title_background_color'] ) ) {
				$style_attrs[] = 'background-color:' . $atts['title_background_color'];
			}

			// Merge in styles resolved from context/Gutenberg attributes.
			if ( ! empty( $atts['style_vars'] ) ) {
				if ( is_array( $atts['style_vars'] ) ) {
					$style_attrs = array_merge( $style_attrs, $atts['style_vars'] );
				} else {
					$style_attrs[] = $atts['style_vars'];
				}
			}

			$style = ! empty( $style_attrs ) ? ' style="' . esc_attr( implode( ';', array_filter( $style_attrs ) ) ) . '"' : '';
			$class = 'videopack-video-title has-text-align-' . esc_attr( $text_align ) . ( $show_background ? '' : ' has-no-background' );

			if ( ! empty( $atts['wrapper_class'] ) ) {
				$class .= ' ' . $atts['wrapper_class'];
			}

			return '<' . esc_attr( $tag ) . ' class="' . esc_attr( $class ) . '"' . $style . '>' . esc_html( (string) $title ) . '</' . esc_attr( $tag ) . '>';
		}

		// Overlay Mode (Info Bar).
		$text_align        = ! empty( $atts['textAlign'] ) ? $atts['textAlign'] : ( $is_inside_thumbnail ? 'center' : 'left' );
		$title_style_attrs = array();
		if ( ! empty( $atts['title_color'] ) ) {
			$title_style_attrs[] = 'color:' . $atts['title_color'];
		}

		// Merge in styles resolved from context/Gutenberg attributes.
		if ( ! empty( $atts['style_vars'] ) ) {
			if ( is_array( $atts['style_vars'] ) ) {
				$title_style_attrs = array_merge( $title_style_attrs, $atts['style_vars'] );
			} else {
				$title_style_attrs[] = $atts['style_vars'];
			}
		}

		$title_style   = ! empty( $title_style_attrs ) ? ' style="' . esc_attr( implode( ';', array_filter( $title_style_attrs ) ) ) . '"' : '';
		$title_classes = 'videopack-title has-text-align-' . esc_attr( $text_align );

		if ( ! empty( $atts['wrapper_class'] ) ) {
			$title_classes .= ' ' . $atts['wrapper_class'];
		}

		$bg_color         = ! empty( $atts['title_background_color'] ) ? $atts['title_background_color'] : null;
		$skin             = $atts['skin'] ?? ( $options['skin'] ?? 'default' );
		$has_custom_bg    = ! empty( $atts['title_background_color'] );
		$has_custom_color = ! empty( $atts['title_color'] );

		$bar_style  = '';
		$skin_class = ( 'Video.js' === ( $options['embed_method'] ?? 'Video.js' ) ) ? $skin : '';
		$bar_class  = 'videopack-video-title is-overlay videopack-video-title-visible ' . esc_attr( $skin_class ) . ' position-' . esc_attr( $position ) . ( $show_background ? '' : ' has-no-background' );

		if ( $is_inside_thumbnail ) {
			$bar_class .= ' videopack-thumbnail-title';
		}

		if ( $has_custom_bg ) {
			$bar_class .= ' videopack-has-title-background-color';
		}
		if ( $has_custom_color ) {
			$bar_class .= ' videopack-has-title-color';
		}

		$wrapper_style_vars = array();
		if ( $has_custom_color ) {
			$wrapper_style_vars[] = '--videopack-title-color: ' . $atts['title_color'];
		}
		if ( $has_custom_bg ) {
			$wrapper_style_vars[] = '--videopack-title-background-color: ' . $atts['title_background_color'];
		}
		$wrapper_style = ! empty( $wrapper_style_vars ) ? ' style="' . esc_attr( implode( ';', $wrapper_style_vars ) ) . '"' : '';
		$wrapper_class = 'videopack-meta-wrapper videopack-video-title-visible';
		if ( $is_overlay ) {
			$wrapper_class .= ' is-overlay position-' . esc_attr( $position );
		}
		if ( ! empty( $atts['wrapper_class'] ) ) {
			$wrapper_class .= ' ' . $atts['wrapper_class'];
		}

		if ( $is_inside_thumbnail ) {
			$wrapper_class .= ' videopack-thumbnail-title';
		}

		$html  = '<div id="video_' . esc_attr( (string) $id ) . '_meta" class="' . esc_attr( $wrapper_class ) . '" data-id="' . esc_attr( (string) $id ) . '" data-post-id="' . esc_attr( (string) $id ) . '"' . $wrapper_style . '>';
		$html .= '<div class="' . esc_attr( $bar_class ) . '"' . $bar_style . '>' . "\n";

		if ( $show_title ) {
			$title_text = esc_html( (string) $title );
			if ( ! empty( $atts['link_url'] ) ) {
				$title_text = sprintf( '<a href="%s" class="videopack-title-link">%s</a>', esc_url( $atts['link_url'] ), $title_text );
			}
			$html .= '<' . esc_attr( $tag ) . ' class="' . esc_attr( $title_classes ) . '"' . $title_style . '>' . $title_text . '</' . esc_attr( $tag ) . '>' . "\n";
		}

		$html .= '<div class="videopack-meta-icons">';

		if ( ! empty( $inner_content ) ) {
			$html .= $inner_content;
		}
		$html .= '</div>' . "\n";
		$html .= '</div>' . "\n";
		$html .= '</div>' . "\n";

		return $html;
	}

	/**
	 * Format resolution label like video-quality-selector.js res_label.
	 *
	 * @param string|int $resolution Resolution value.
	 * @return string Display label.
	 */
	private static function format_download_resolution_label( $resolution ): string {
		$value = (string) $resolution;
		if ( preg_match( '/^\d+$/', $value ) ) {
			return $value . 'p';
		}
		return $value;
	}

	/**
	 * Get player source_groups for download menu (same grouping as quality selector).
	 *
	 * @param \Videopack\Video_Source\Source         $source          Video source.
	 * @param array                                  $options         Plugin options.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Format registry.
	 * @return array Player source groups.
	 */
	private static function get_player_source_groups_for_download( $source, array $options, $format_registry = null ): array {
		$embed_method = $options['embed_method'] ?? 'Video.js';
		$player       = \Videopack\Frontend\Video_Players\Player_Factory::create( $embed_method, $options, $format_registry );
		$player->set_source( $source );
		$player->set_atts(
			array(
				'auto_res' => $options['auto_res'] ?? 'automatic',
			)
		);
		return $player->get_source_groups();
	}

	/**
	 * Render download menu list items using player source_groups (matches quality selector).
	 *
	 * @param array $source_groups Player source groups.
	 * @return string Menu list HTML.
	 */
	private static function render_download_menu_list( array $source_groups ): string {
		$html = '';

		if ( count( $source_groups ) > 1 ) {
			foreach ( $source_groups as $group_id => $group ) {
				$label   = $group['label'] ?? $group_id;
				$items   = array();
				$sources = $group['sources'] ?? array();
				foreach ( $sources as $source_entry ) {
					$resolution = $source_entry['resolution'] ?? ( $source_entry['data-res'] ?? '' );
					$url        = $source_entry['src'] ?? '';
					if ( empty( $resolution ) || empty( $url ) ) {
						continue;
					}
					$items[] = array(
						'url'   => $url,
						'label' => self::format_download_resolution_label( $resolution ),
					);
				}
				if ( empty( $items ) ) {
					continue;
				}
				usort(
					$items,
					function ( $a, $b ) {
						return (int) preg_replace( '/[^0-9]/', '', $b['label'] ) <=> (int) preg_replace( '/[^0-9]/', '', $a['label'] );
					}
				);
				$html .= '<li class="videopack-download-menu-item videopack-has-submenu">' . "\n";
				$html .= '<button type="button" class="videopack-download-submenu-trigger" aria-expanded="false">' . esc_html( $label ) . '</button>' . "\n";
				$html .= '<ul class="videopack-download-submenu">' . "\n";
				foreach ( $items as $item ) {
					$html .= '<li><a class="videopack-download-link" href="' . esc_url( $item['url'] ) . '" download>' . esc_html( $item['label'] ) . '</a></li>' . "\n";
				}
				$html .= '</ul>' . "\n";
				$html .= '</li>' . "\n";
			}
			return $html;
		}

		$flat_items = array();
		foreach ( $source_groups as $group ) {
			$sources = $group['sources'] ?? array();
			foreach ( $sources as $source_entry ) {
				$resolution = $source_entry['resolution'] ?? ( $source_entry['data-res'] ?? '' );
				$url        = $source_entry['src'] ?? '';
				if ( empty( $resolution ) || empty( $url ) ) {
					continue;
				}
				$flat_items[] = array(
					'url'        => $url,
					'label'      => self::format_download_resolution_label( $resolution ),
					'sort_value' => (int) preg_replace( '/[^0-9]/', '', (string) $resolution ),
				);
			}
		}
		usort(
			$flat_items,
			function ( $a, $b ) {
				return $b['sort_value'] <=> $a['sort_value'];
			}
		);
		foreach ( $flat_items as $item ) {
			$html .= '<li><a class="videopack-download-link" href="' . esc_url( $item['url'] ) . '" download>' . esc_html( $item['label'] ) . '</a></li>' . "\n";
		}

		return $html;
	}

	/**
	 * Renders the download link HTML for a video.
	 *
	 * @param array                                  $atts            Block attributes, including alignment and visibility settings.
	 * @param \Videopack\Video_Source\Source         $source          The video source object.
	 * @param array                                  $options         Optional. Plugin options.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Optional. Format registry.
	 * @return string The rendered HTML.
	 */
	public static function render_download( array $atts, $source, array $options = array(), $format_registry = null ) {
		if ( ! $source ) {
			return '';
		}

		if ( empty( $options ) ) {
			$options = get_option( 'videopack_options', array() );
		}

		$is_inside_title_meta = ! empty( $atts['isInsideTitleMeta'] );
		$is_overlay           = ( ! empty( $atts['isOverlay'] ) || ! empty( $atts['isInsideThumbnail'] ) || ! empty( $atts['isInsidePlayerOverlay'] ) ) && ! $is_inside_title_meta;
		$position             = $atts['position'] ?? 'bottom';
		$text_align           = $atts['textAlign'] ?? 'left';

		$show_icon  = $atts['icon'] ?? true;
		$show_text  = $atts['text'] ?? false;
		$style_type = $atts['styleType'] ?? 'text';
		$mode       = $atts['downloadMode'] ?? 'direct';

		$wrapper_class = 'videopack-download-wrapper videopack-download-block mode-' . esc_attr( $mode );
		if ( $is_inside_title_meta ) {
			$wrapper_class .= ' is-inside-title-meta';
		}
		if ( $is_overlay ) {
			$wrapper_class .= ' is-overlay position-' . esc_attr( $position );
		}
		if ( ! empty( $atts['wrapper_class'] ) ) {
			$wrapper_class .= ' ' . $atts['wrapper_class'];
		}
		$wrapper_class .= ' has-text-align-' . esc_attr( $text_align );

		$style = ! empty( $atts['style_vars'] ) ? ' style="' . esc_attr( $atts['style_vars'] ) . '"' : '';

		$download_svg = Icons::get( 'download', 'download-icon' );

		$trigger_inner = '';
		if ( $show_icon || ( ! $show_icon && ! $show_text ) ) {
			$trigger_inner .= '<span class="videopack-icon-container">' . $download_svg . '</span>' . "\n";
		}
		if ( $show_text ) {
			$trigger_inner .= '<span class="videopack-download-text-label">' . esc_html__( 'Download', 'video-embed-thumbnail-generator' ) . '</span>' . "\n";
		}

		$element_class = 'videopack-icons style-' . esc_attr( $style_type );

		$html = '<div class="' . esc_attr( $wrapper_class ) . '"' . $style . '>' . "\n";

		if ( 'menu' === $mode ) {
			$html         .= '<div class="videopack-download-menu-container">' . "\n";
			$html         .= '<button type="button" class="videopack-download-trigger ' . esc_attr( $element_class ) . '" aria-expanded="false" aria-haspopup="true" title="' . esc_attr__( 'Download Video', 'video-embed-thumbnail-generator' ) . '">' . "\n";
			$html         .= $trigger_inner;
			$html         .= '<span class="videopack-caret">▼</span>' . "\n";
			$html         .= '</button>' . "\n";
			$html         .= '<div class="videopack-download-dropdown-menu">' . "\n";
			$html         .= '<ul>' . "\n";
			$source_groups = self::get_player_source_groups_for_download( $source, $options, $format_registry );
			$html         .= self::render_download_menu_list( $source_groups );
			$html         .= '</ul>' . "\n";
			$html         .= '</div>' . "\n";
			$html         .= '</div>' . "\n";
		} else {
			$link_attributes = array(
				'class="videopack-download-link ' . esc_attr( $element_class ) . '"',
				'href="' . esc_url( $source->get_url() ) . '"',
				'download',
				'data-alt_link="' . esc_url( $source->get_download_url() ) . '"',
				'title="' . esc_attr__( 'Download Video', 'video-embed-thumbnail-generator' ) . '"',
			);
			$link_attributes = apply_filters( 'videopack_download_link_attributes', $link_attributes, $source );
			$html           .= '<a ' . implode( ' ', $link_attributes ) . '>' . "\n";
			$html           .= $trigger_inner;
			$html           .= '</a>' . "\n";
		}

		$html .= '</div>' . "\n";

		return $html;
	}

	/**
	 * Renders the Video Share block.
	 *
	 * @param array                          $atts    Block attributes.
	 * @param \Videopack\Video_Source\Source $source  The video source.
	 * @param string|int                     $id      The player/post instance ID.
	 * @param array                          $options Plugin options.
	 * @return string The rendered HTML.
	 */
	public static function render_share( array $atts, $source, $id, array $options = array() ) {
		if ( ! $source ) {
			return '';
		}

		if ( empty( $options ) ) {
			$options = get_option( 'videopack_options', array() );
		}

		$is_inside_title_meta = ! empty( $atts['isInsideTitleMeta'] );
		$is_inside_thumbnail  = ! empty( $atts['isInsideThumbnail'] );
		$is_overlay           = ( ! empty( $atts['isOverlay'] ) || $is_inside_thumbnail || ! empty( $atts['isInsidePlayerOverlay'] ) ) && ! $is_inside_title_meta;
		$position             = $atts['position'] ?? 'top';
		$text_align           = $atts['textAlign'] ?? ( $is_inside_thumbnail ? 'center' : 'left' );

		$icon_type  = $atts['iconType'] ?? 'share';
		$show_text  = $atts['showText'] ?? false;
		$style_type = $atts['styleType'] ?? 'text';

		$wrapper_class = 'videopack-share-wrapper videopack-share-block';
		if ( $is_inside_title_meta ) {
			$wrapper_class .= ' is-inside-title-meta';
		}
		if ( $is_overlay ) {
			$wrapper_class .= ' is-overlay position-' . esc_attr( $position );
		}
		if ( $is_inside_thumbnail ) {
			$wrapper_class .= ' is-inside-thumbnail';
		}
		if ( ! empty( $atts['wrapper_class'] ) ) {
			$wrapper_class .= ' ' . $atts['wrapper_class'];
		}
		$wrapper_class .= ' has-text-align-' . esc_attr( $text_align );

		$style = ! empty( $atts['style_vars'] ) ? ' style="' . esc_attr( $atts['style_vars'] ) . '"' : '';

		// SVGs definitions.
		$share_svg = Icons::get( 'share', 'share-icon' );
		$close_svg = Icons::get( 'close', 'close-icon' );

		$external_svg    = Icons::get( 'external', 'external-icon' );
		$ios_share_svg   = Icons::get( 'iosShare', 'ios-share-icon' );
		$curve_share_svg = Icons::get( 'curveShare', 'curve-share-icon' );

		$embed_svg = Icons::get( 'embed', 'embed-icon' );

		$icon_content = '';
		if ( 'share' === $icon_type ) {
			$icon_content = '<span class="videopack-icon-container">' . $share_svg . $close_svg . '</span>';
		} elseif ( 'external' === $icon_type ) {
			$icon_content = '<span class="videopack-icon-container">' . $external_svg . '</span>';
		} elseif ( 'iosShare' === $icon_type ) {
			$icon_content = '<span class="videopack-icon-container">' . $ios_share_svg . '</span>';
		} elseif ( 'curveShare' === $icon_type ) {
			$icon_content = '<span class="videopack-icon-container">' . $curve_share_svg . '</span>';
		}

		$trigger_inner = '';
		if ( 'none' !== $icon_type ) {
			$trigger_inner .= $icon_content . "\n";
		}
		if ( $show_text || 'none' === $icon_type ) {
			$margin_style   = ( 'none' !== $icon_type ) ? ' style="margin-left: 4px;"' : '';
			$trigger_inner .= '<span class="videopack-share-text-label"' . $margin_style . '>' . esc_html__( 'Share', 'video-embed-thumbnail-generator' ) . '</span>' . "\n";
		}

		// In overlay mode, the dynamic icon class switches between 'share' and 'close'.
		// If icon is not standard 'share', it still acts as class for querySelector.
		$element_class = 'videopack-share-link videopack-share-toggle videopack-icons style-' . esc_attr( $style_type ) . ' share';

		$embedlink = $atts['embedlink'] ?? '';
		if ( empty( $embedlink ) && $source->get_id() ) {
			$embedlink = add_query_arg( 'videopack[enable]', 'true', get_permalink( $source->get_id() ) );
		}

		$html  = '<div class="' . esc_attr( $wrapper_class ) . '"' . $style . '>' . "\n";
		$html .= '<button type="button" class="' . esc_attr( $element_class ) . '" title="' . esc_attr__( 'Share', 'video-embed-thumbnail-generator' ) . '">' . "\n";
		$html .= $trigger_inner;
		if ( ! $is_overlay && ! $is_inside_title_meta ) {
			$html .= '<span class="videopack-caret">▼</span>' . "\n";
		}
		$html .= '</button>' . "\n";

		// Click trap (used for the overlay popup closing trigger).
		$html .= '<button class="videopack-click-trap"></button>' . "\n";

		// Embed/Share Overlay / Dropdown Markup.
		$title        = $atts['title'] ?? $source->get_title();
		$iframe_title = sprintf(
			/* translators: %s is the video title */
			__( 'Video Player - %s', 'video-embed-thumbnail-generator' ),
			$title
		);
		$allow_policy   = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
		$sandbox_policy = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-forms';

		$embed_code = sprintf(
			'<iframe src="%1$s" width="%2$s" height="%3$s" style="border:0; width:100%%; aspect-ratio:%2$s/%3$s;" allow="%4$s" allowfullscreen credentialless sandbox="%5$s" loading="lazy" title="%6$s" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
			esc_url( $embedlink ),
			esc_attr( (string) ( $atts['width'] ?? 960 ) ),
			esc_attr( (string) ( $atts['height'] ?? 540 ) ),
			esc_attr( $allow_policy ),
			esc_attr( $sandbox_policy ),
			esc_attr( $iframe_title )
		);

		$share_copy_link    = ! isset( $atts['shareCopyLink'] ) || $atts['shareCopyLink'];
		$share_native_share = ! isset( $atts['shareNativeShare'] ) || $atts['shareNativeShare'];
		$share_bluesky      = ! isset( $atts['shareBluesky'] ) || $atts['shareBluesky'];
		$share_threads      = ! isset( $atts['shareThreads'] ) || $atts['shareThreads'];
		$share_facebook     = ! isset( $atts['shareFacebook'] ) || $atts['shareFacebook'];
		$share_reddit       = ! isset( $atts['shareReddit'] ) || $atts['shareReddit'];
		$share_email        = ! isset( $atts['shareEmail'] ) || $atts['shareEmail'];

		$has_services = $share_copy_link || $share_native_share || $share_bluesky || $share_threads || $share_facebook || $share_reddit || $share_email;

		$html .= '<div class="videopack-share-container">' . "\n";

		if ( $has_services ) {
			$html .= '<div class="videopack-share-services-grid">' . "\n";
			if ( $share_copy_link ) {
				$html .= '<button type="button" class="videopack-share-btn videopack-btn-copylink" title="' . esc_attr__( 'Copy Link', 'video-embed-thumbnail-generator' ) . '">' . Icons::get( 'copyLink' ) . '</button>' . "\n";
			}
			if ( $share_native_share ) {
				$grid_share_icon_type = $icon_type;
				if ( 'none' === $grid_share_icon_type ) {
					$grid_share_icon_type = 'share';
				}
				$html .= '<button type="button" class="videopack-share-btn videopack-btn-nativeshare" title="' . esc_attr__( 'Share via Device', 'video-embed-thumbnail-generator' ) . '">' . Icons::get( $grid_share_icon_type ) . '</button>' . "\n";
			}
			if ( $share_bluesky ) {
				$html .= '<button type="button" class="videopack-share-btn videopack-btn-bluesky" title="' . esc_attr__( 'Share on Bluesky', 'video-embed-thumbnail-generator' ) . '">' . Icons::get( 'bluesky' ) . '</button>' . "\n";
			}
			if ( $share_threads ) {
				$html .= '<button type="button" class="videopack-share-btn videopack-btn-threads" title="' . esc_attr__( 'Share on Threads', 'video-embed-thumbnail-generator' ) . '">' . Icons::get( 'threads' ) . '</button>' . "\n";
			}
			if ( $share_facebook ) {
				$html .= '<button type="button" class="videopack-share-btn videopack-btn-facebook" title="' . esc_attr__( 'Share on Facebook', 'video-embed-thumbnail-generator' ) . '">' . Icons::get( 'facebook' ) . '</button>' . "\n";
			}
			if ( $share_reddit ) {
				$html .= '<button type="button" class="videopack-share-btn videopack-btn-reddit" title="' . esc_attr__( 'Share on Reddit', 'video-embed-thumbnail-generator' ) . '">' . Icons::get( 'reddit' ) . '</button>' . "\n";
			}
			if ( $share_email ) {
				$html .= '<button type="button" class="videopack-share-btn videopack-btn-email" title="' . esc_attr__( 'Share via Email', 'video-embed-thumbnail-generator' ) . '">' . Icons::get( 'email' ) . '</button>' . "\n";
			}
			$html .= '</div>' . "\n";
		}

		$html       .= '<span class="videopack-embedcode-container">' . "\n" .
			'<span class="videopack-icons embed">' . "\n" . $embed_svg . "\n" . '</span>' . "\n" .
			'<span>' . esc_html__( 'Embed:', 'video-embed-thumbnail-generator' ) . '</span>' . "\n" .
			'<span><input class="videopack-embed-code" type="text" value="' . esc_attr( $embed_code ) . '" readonly /></span>' . "\n" .
			'</span>' . "\n";
		$start_at_id = 'videopack-start-at-enable-' . $id;
		$html       .= '<span class="videopack-start-at-container">' . "\n" .
			'<input type="checkbox" class="videopack-start-at-enable" id="' . esc_attr( $start_at_id ) . '" />' . "\n" .
			'<label for="' . esc_attr( $start_at_id ) . '">' . esc_html__( 'Start at:', 'video-embed-thumbnail-generator' ) . '</label>' . "\n" .
			'<input type="text" class="videopack-start-at" value="00:00" />' . "\n" .
			'</span>' . "\n";
		$html       .= '</div>' . "\n";

		$html .= '</div>' . "\n";

		return $html;
	}

	/**
	 * Renders the video caption HTML.
	 *
	 * @param string $caption The caption text.
	 * @return string The rendered HTML.
	 */
	public static function render_video_caption( $caption ) {
		if ( empty( $caption ) ) {
			return '';
		}
		return sprintf(
			'<figcaption class="wp-element-caption videopack-video-caption">%s</figcaption>',
			wp_kses_post( (string) $caption )
		);
	}

	/**
	 * Renders the video player engine markup.
	 *
	 * @param \Videopack\Frontend\Video_Players\Player $player         The player instance.
	 * @param array                                    $atts           The player attributes.
	 * @param string                                   $inner_content  The inner block content.
	 * @param array                                    $options        Plugin options.
	 * @return string The rendered HTML.
	 */
	public static function render_player_engine( $player, $atts, $inner_content = '', $options = array() ) {
		$style_vars = array();
		$classes    = array( 'videopack-player-relative-wrapper' );

		$embed_method = $options['embed_method'] ?? 'Video.js';
		if ( ! empty( $atts['skin'] ) && 'Video.js' === $embed_method ) {
			$classes[] = $atts['skin'];
		}

		$colors = array(
			'title-color'                 => 'title_color',
			'title-background-color'      => 'title_background_color',
			'play-button-color'           => 'play_button_color',
			'play-button-secondary-color' => 'play_button_secondary_color',
			'control-bar-bg-color'        => 'control_bar_bg_color',
			'control-bar-color'           => 'control_bar_color',
		);

		foreach ( $colors as $variable => $attribute ) {
			if ( ! empty( $atts[ $attribute ] ) ) {
				$style_vars[] = "--videopack-{$variable}: " . $atts[ $attribute ];
				$classes[]    = "videopack-has-{$variable}";
			}
		}

		// Inject MEJS controls SVG for mask coloring.
		$style_vars[] = '--videopack-mejs-controls-svg: url("' . esc_url( includes_url( 'js/mediaelement/mejs-controls.svg' ) ) . '")';

		return sprintf(
			'<div class="%s" style="%s" data-id="%s">%s%s</div>',
			esc_attr( implode( ' ', array_unique( array_filter( $classes ) ) ) ),
			esc_attr( implode( ';', $style_vars ) ),
			esc_attr( $player->get_id() ),
			$player->get_player_code( $atts ),
			$inner_content
		);
	}



	/**
	 * Renders the view count HTML.
	 *
	 * @param \Videopack\Video_Source\Source $source The video source object.
	 * @param array                          $atts   The block or shortcode attributes.
	 * @return string The rendered HTML.
	 */
	public static function render_view_count( $source, $atts = array() ) {
		wp_enqueue_style( 'videopack-core' );
		if ( ! $source ) {
			return '';
		}
		$views      = $source->get_views();
		$safe_views = (int) $views;

		$show_text  = ! isset( $atts['showText'] ) || true === $atts['showText'] || 'true' === $atts['showText'];
		$icon_type  = $atts['iconType'] ?? 'none';
		$is_overlay = ! empty( $atts['isOverlay'] );
		$is_thumb   = ! empty( $atts['isInsideThumbnail'] );

		$display_value = '';
		if ( $show_text ) {
			$display_value = sprintf(
				/* translators: %s is the formatted number of views */
				_n( '%s view', '%s views', $safe_views, 'video-embed-thumbnail-generator' ),
				number_format_i18n( $safe_views )
			);
		} else {
			$display_value = number_format_i18n( $safe_views );
		}

		$is_thumb    = ! empty( $atts['isInsideThumbnail'] );
		$is_player   = ! empty( $atts['isInsidePlayerContainer'] ) || ! empty( $atts['isInsidePlayerOverlay'] );
		$icon_html   = self::get_svg_icon( $icon_type );
		$text_align  = ! empty( $atts['textAlign'] ) ? $atts['textAlign'] : ( $is_thumb ? 'right' : ( $is_player ? 'right' : 'left' ) );
		$style_attrs = array();

		$has_custom_bg    = ! empty( $atts['title_background_color'] );
		$has_custom_color = ! empty( $atts['title_color'] );

		if ( $has_custom_color ) {
			$style_attrs[] = '--videopack-title-color:' . $atts['title_color'];
			$style_attrs[] = 'color: var(--videopack-title-color)';
		}

		$show_bg = ! isset( $atts['showBackground'] ) || ( 'false' !== $atts['showBackground'] && '0' !== $atts['showBackground'] && false !== $atts['showBackground'] && '' !== $atts['showBackground'] );

		if ( $show_bg && $has_custom_bg ) {
			$style_attrs[] = '--videopack-title-background-color:' . $atts['title_background_color'];
			if ( $is_overlay ) {
				$style_attrs[] = 'background-color: var(--videopack-title-background-color)';
			}
		}

		// Merge in styles resolved from context/Gutenberg attributes.
		if ( ! empty( $atts['style_vars'] ) ) {
			if ( is_array( $atts['style_vars'] ) ) {
				$style_attrs = array_merge( $style_attrs, $atts['style_vars'] );
			} else {
				$style_attrs[] = $atts['style_vars'];
			}
		}

		$style   = ! empty( $style_attrs ) ? ' style="' . esc_attr( implode( ';', array_filter( $style_attrs ) ) ) . '"' : '';
		$classes = 'videopack-view-count has-text-align-' . esc_attr( $text_align );

		if ( ! empty( $atts['wrapper_class'] ) ) {
			$classes .= ' ' . $atts['wrapper_class'];
		}

		if ( $is_overlay ) {
			$classes .= ' is-overlay is-badge';
		} else {
			$classes .= ' is-not-overlay';
		}

		if ( $has_custom_bg ) {
			$classes .= ' videopack-has-title-background-color';
		}
		if ( $has_custom_color ) {
			$classes .= ' videopack-has-title-color';
		}

		return sprintf(
			'<div class="%s"%s>%s<span>%s</span></div>',
			esc_attr( $classes ),
			$style,
			$icon_html,
			$display_value
		);
	}

	/**
	 * Renders a video thumbnail card with an image, link, and inner content.
	 *
	 * @param array  $atts          Thumbnail attributes.
	 * @param string $inner_content Content to render inside the thumbnail overlay.
	 * @param array  $options       Global plugin options.
	 * @param array  $context       Context variables (skin, id, etc.).
	 * @return string The rendered HTML.
	 */
	public static function render_thumbnail( array $atts, $inner_content, $options, $context = array() ) {
		wp_enqueue_style( 'videopack-core' );
		$thumbnail_url = $atts['poster'] ?? ( $context['poster'] ?? '' );
		if ( ! $thumbnail_url ) {
			return '';
		}

		$link_to     = $atts['linkTo'] ?? ( $atts['link_to'] ?? 'none' );
		$skin        = $context['skin'] ?? ( $atts['skin'] ?? ( $options['skin'] ?? 'vjs-theme-videopack' ) );
		$post_id     = $context['postId'] ?? ( $atts['id'] ?? 0 );
		$instance_id = $context['videopackId'] ?? ( $atts['instance_id'] ?? ( $atts['id'] ?? uniqid() ) );

		$style_vars    = array();
		$exclude_hover = ! empty( $atts['exclude_hover_trigger'] ) || ! empty( $context['exclude_hover_trigger'] );
		$classes       = array( 'videopack-thumbnail-wrapper', 'gallery-thumbnail', 'videopack-gallery-item' );
		if ( ! $exclude_hover ) {
			$classes[] = 'videopack-hover-trigger';
		}

		if ( 'Video.js' === ( $options['embed_method'] ?? 'Video.js' ) ) {
			$classes[] = $skin;
		}

		$colors = array(
			'title-color'                 => 'title_color',
			'title-background-color'      => 'title_background_color',
			'play-button-color'           => 'play_button_color',
			'play-button-secondary-color' => 'play_button_secondary_color',
			'control-bar-bg-color'        => 'control_bar_bg_color',
			'control-bar-color'           => 'control_bar_color',
		);

		foreach ( $colors as $variable => $attribute ) {
			$val = $atts[ $attribute ] ?? ( $context[ $attribute ] ?? '' );
			if ( ! empty( $val ) ) {
				$style_vars[] = "--videopack-{$variable}: " . $val;
				$classes[]    = "videopack-has-{$variable}";
			}
		}

		// Inject MEJS controls SVG for mask coloring.
		$style_vars[] = '--videopack-mejs-controls-svg: url("' . esc_url( includes_url( 'js/mediaelement/mejs-controls.svg' ) ) . '")';

		$wrapper_style = ! empty( $style_vars ) ? ' style="' . esc_attr( implode( ';', $style_vars ) ) . '"' : '';
		$wrapper_data  = sprintf(
			' class="%s"%s data-attachment-id="%d" data-videopack-id="%s" data-videopack-lightbox="%s"',
			esc_attr( implode( ' ', array_unique( array_filter( $classes ) ) ) ),
			$wrapper_style,
			(int) $post_id,
			esc_attr( (string) $instance_id ),
			( 'lightbox' === $link_to ? 'true' : 'false' )
		);

		$html = sprintf( '<div%s>', $wrapper_data );

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
	 * Renders a modular play button.
	 *
	 * @param array  $atts    Button attributes (color, etc.).
	 * @param array  $options Global plugin options.
	 * @param string $skin    Current skin class.
	 * @return string The rendered HTML.
	 */
	public static function render_play_button( array $atts, array $options, $skin = '' ) {
		$embed_method = $options['embed_method'] ?? 'Video.js';

		// Map shorthand attributes if present.
		$play_button_color           = $atts['play_button_color'] ?? ( $atts['color'] ?? '' );
		$play_button_secondary_color = $atts['play_button_secondary_color'] ?? ( $atts['secondary_color'] ?? '' );

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
			$classes[]    = 'mejs-overlay mejs-layer mejs-overlay-play play-button-container';
			$style_vars[] = '--videopack-mejs-controls-svg: url("' . esc_url( includes_url( 'js/mediaelement/mejs-controls.svg' ) ) . '")';

			$style = ! empty( $style_vars ) ? ' style="' . esc_attr( implode( ';', $style_vars ) ) . '"' : '';

			return sprintf(
				'<div class="%s"%s><div class="mejs-overlay-button" style="width: 80px; height: 80px;"></div></div>',
				esc_attr( implode( ' ', $classes ) ),
				$style
			);
		}

		$html = apply_filters( 'videopack_play_button_html', null, $atts, $options, $skin );
		if ( null !== $html ) {
			return $html;
		}

		$style = ! empty( $style_vars ) ? ' style="' . esc_attr( implode( ';', $style_vars ) ) . '"' : '';

		return sprintf(
			'<div class="%1$s play-button-container video-js %2$s vjs-big-play-centered vjs-paused vjs-controls-enabled"%3$s><button class="vjs-big-play-button" type="button" aria-disabled="false"><span class="vjs-icon-placeholder" aria-hidden="true"></span><span class="vjs-control-text" aria-live="polite">%4$s</span></button></div>',
			esc_attr( implode( ' ', $classes ) ),
			esc_attr( (string) $skin ),
			$style,
			esc_html__( 'Play Video', 'video-embed-thumbnail-generator' )
		);
	}

	/**
	 * Renders the fully assembled player HTML including overlays like the title and watermark.
	/**
	 * Renders the full player assembly.
	 *
	 * @param \Videopack\Video_Players\Player $player        The player instance.
	 * @param array                           $atts          The video attributes.
	 * @param \Videopack\Video_Source\Source  $source        The video source object.
	 * @param array                           $options       The global plugin options.
	 * @param bool                            $is_block      Optional. Whether this is a block context.
	 * @param string                          $inner_content Optional. Pre-rendered inner block content.
	 * @return string The rendered HTML.
	 */
	public static function render_player_assembly( $player, $atts, $source, $options, $is_block = false, $inner_content = '' ) {
		$player_content = '';

		if ( ! empty( $inner_content ) ) {
			// If we have inner blocks (from Block Editor or simulation), use them.
			// Wrap in relative container to ensure overlays (Title, Watermark, etc.) are positioned correctly.
			$player_content = sprintf( '<div class="videopack-player-relative-wrapper">%s</div>', $inner_content );
		} else {
			// Auto-assembly logic for standalone players/legacy shortcodes.

			// Video Title / Social Bar.
			$title_inner_content = '';
			if ( ! empty( $atts['downloadlink'] ) || ! empty( $options['downloadlink'] ) ) {
				$title_inner_content .= self::render_download(
					array(
						'icon'              => true,
						'text'              => false,
						'styleType'         => 'text',
						'downloadMode'      => 'direct',
						'isInsideTitleMeta' => true,
					),
					$source,
					$options
				);
			}
			if ( ! empty( $atts['embedcode'] ) || ! empty( $options['embedcode'] ) ) {
				$title_inner_content .= self::render_share(
					array(
						'iconType'          => 'share',
						'showText'          => false,
						'styleType'         => 'text',
						'isInsideTitleMeta' => true,
					),
					$source,
					$player->get_id(),
					$options
				);
			}

			$title_atts = array_merge(
				$atts,
				array(
					'isOverlay'     => true,
					'inner_content' => $title_inner_content,
				)
			);
			$player_content .= self::render_video_title( $title_atts, $source, $player->get_id() );

			// Watermark.
			$player_content .= self::render_watermark( $atts + array( 'instance_id' => $player->get_id() ) );

			// Core Player.
			$player_content .= $player->get_player_code( $atts );

			// Wrap in relative container.
			$player_content = sprintf( '<div class="videopack-player-relative-wrapper">%s</div>', $player_content );

			// View Count.
			if ( ! empty( $atts['views'] ) ) {
				$player_content .= self::render_view_count( $source, $atts );
			}

			// Caption.
			if ( ! empty( $atts['caption'] ) ) {
				$player_content .= self::render_video_caption( $atts['caption'] );
			}
		}

		return self::render_video_container( $atts, $player_content, $is_block, $options );
	}

	/**
	 * Renders the pagination HTML for the gallery.
	 *
	 * @param int   $current_page The current active page.
	 * @param int   $total_pages  The maximum number of pages.
	 * @param array $atts         Optional. Attributes for styling.
	 * @return string The rendered HTML.
	 */
	public static function render_pagination( $current_page, $total_pages, $atts = array() ) {
		$total_pages  = (int) $total_pages;
		$current_page = (int) $current_page;

		if ( $total_pages <= 1 ) {
			return '';
		}

		$pages = array();
		if ( $total_pages <= 7 ) {
			for ( $i = 1; $i <= $total_pages; $i++ ) {
				$pages[] = $i;
			}
		} else {
			$pages[] = 1;

			$start = max( 2, $current_page - 1 );
			$end   = min( $total_pages - 1, $current_page + 1 );

			if ( $current_page <= 3 ) {
				$end = 4;
			} elseif ( $current_page >= $total_pages - 2 ) {
				$start = $total_pages - 3;
			}

			if ( $start > 2 ) {
				$pages[] = '...';
			}

			for ( $i = $start; $i <= $end; $i++ ) {
				$pages[] = $i;
			}

			if ( $end < $total_pages - 1 ) {
				$pages[] = '...';
			}

			$pages[] = $total_pages;
		}

		$styles     = array();
		$color_keys = array(
			'pagination_color'            => '--videopack-pagination-color',
			'pagination_background_color' => '--videopack-pagination-bg',
			'pagination_active_color'     => '--videopack-pagination-active-color',
			'pagination_active_bg_color'  => '--videopack-pagination-active-bg',
		);

		foreach ( $color_keys as $attr_key => $css_var ) {
			if ( ! empty( $atts[ $attr_key ] ) ) {
				$styles[] = "$css_var: " . $atts[ $attr_key ];
			}
		}
		$style_attr = ! empty( $styles ) ? ' style="' . esc_attr( implode( '; ', $styles ) ) . '"' : '';

		ob_start();
		?>
		<nav class="videopack-pagination" aria-label="<?php esc_attr_e( 'Pagination', 'video-embed-thumbnail-generator' ); ?>"<?php echo $style_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<ul class="videopack-pagination-list">
				<li class="videopack-pagination-item">
					<button class="prev page-numbers videopack-pagination-button <?php echo $current_page <= 1 ? 'is-hidden videopack-hidden' : ''; ?>" data-page="<?php echo esc_attr( (string) ( $current_page - 1 ) ); ?>" aria-label="<?php esc_attr_e( 'Previous Page', 'video-embed-thumbnail-generator' ); ?>">
						<span class="videopack-pagination-arrow">&lt;</span>
					</button>
				</li>

				<?php foreach ( $pages as $page ) : ?>
					<?php
					$is_active   = (int) $page === $current_page;
					$is_ellipsis = '...' === $page;
					?>
					<li class="videopack-pagination-item">
						<?php if ( $is_ellipsis ) : ?>
							<span class="page-numbers dots is-ellipsis videopack-pagination-button"><?php echo esc_html( (string) $page ); ?></span>
						<?php elseif ( $is_active ) : ?>
							<button aria-current="page" class="page-numbers current is-active videopack-pagination-button"><?php echo esc_html( (string) $page ); ?></button>
						<?php else : ?>
							<button class="page-numbers videopack-pagination-button" data-page="<?php echo esc_attr( (string) $page ); ?>">
								<?php echo esc_html( (string) $page ); ?>
							</button>
						<?php endif; ?>
					</li>
				<?php endforeach; ?>

				<li class="videopack-pagination-item">
					<button class="next page-numbers videopack-pagination-button <?php echo $current_page >= $total_pages ? 'is-hidden videopack-hidden' : ''; ?>" data-page="<?php echo esc_attr( (string) ( $current_page + 1 ) ); ?>" aria-label="<?php esc_attr_e( 'Next Page', 'video-embed-thumbnail-generator' ); ?>">
						<span class="videopack-pagination-arrow">&gt;</span>
					</button>
				</li>
			</ul>
		</nav>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * Recursively compiles a parsed block tree into a structured array for REST/JSON serialization.
	 *
	 * @param array $blocks Array of parsed blocks.
	 * @return array The serialized block tree.
	 */
	public static function serialize_player_container( $blocks ) {
		$serialized = array();
		foreach ( $blocks as $block ) {
			if ( empty( $block['blockName'] ) ) {
				continue;
			}
			$node = array(
				'name'       => $block['blockName'],
				'attributes' => $block['attrs'] ?? array(),
			);
			if ( ! empty( $block['innerBlocks'] ) ) {
				$node['innerBlocks'] = self::serialize_player_container( $block['innerBlocks'] );
			}
			$serialized[] = $node;
		}
		return $serialized;
	}
}
