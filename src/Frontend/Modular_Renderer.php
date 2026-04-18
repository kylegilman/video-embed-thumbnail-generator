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
	 * Renders the main video container wrapper.
	 *
	 * @param array  $atts          Block or shortcode attributes.
	 * @param string $inner_content Content to wrap.
	 * @param bool   $is_block      Whether this is being rendered as a block.
	 * @return string The rendered HTML.
	 */
	public static function render_video_container( array $atts, $inner_content, $is_block = false ) {
		wp_enqueue_style( 'videopack-frontend' );
		$is_modular_engine = ! empty( $atts['is_modular_engine'] );
		$classes           = array( 'videopack-wrapper' );

		if ( $is_block ) {
			$classes[] = 'videopack-video-block-container';
		}

		if ( ! empty( $atts['wrapper_class'] ) ) {
			$classes[] = $atts['wrapper_class'];
		}

		if ( ! empty( $atts['skin'] ) ) {
			$classes[] = $atts['skin'];
		}

		if ( self::is_true( $atts['overlay_title'] ?? false ) || self::is_true( $atts['downloadlink'] ?? false ) ) {
			$classes[] = 'videopack-video-title-visible';
		}

		if ( (bool) ( $atts['inline'] ?? false ) ) {
			$classes[] = 'videopack-wrapper-inline';
			$align     = (string) ( $atts['align'] ?? '' );
			if ( in_array( $align, array( 'left', 'right' ), true ) ) {
				$classes[] = 'videopack-wrapper-inline-' . $align;
			} elseif ( 'center' === $align ) {
				$classes[] = 'videopack-wrapper-auto-left';
				$classes[] = 'videopack-wrapper-auto-right';
			}
		} elseif ( 'center' === (string) ( $atts['align'] ?? '' ) ) {
			$classes[] = 'videopack-wrapper-auto-left';
			$classes[] = 'videopack-wrapper-auto-right';
		} elseif ( 'right' === (string) ( $atts['align'] ?? '' ) ) {
			$classes[] = 'videopack-wrapper-auto-left';
		}

		// Explicitly add Gutenberg alignment classes for blocks to support dynamic fallbacks.
		if ( $is_block && ! empty( $atts['align'] ) ) {
			$classes[] = 'align' . $atts['align'];
		}

		$style_vars = array();
		$colors     = array(
			'title-color'            => 'title_color',
			'title-background-color' => 'title_background_color',
			'play-button-color'      => 'play_button_color',
			'play-button-icon-color' => 'play_button_icon_color',
			'control-bar-bg-color'   => 'control_bar_bg_color',
			'control-bar-color'      => 'control_bar_color',
		);

		foreach ( $colors as $variable => $attribute ) {
			if ( ! empty( $atts[ $attribute ] ) ) {
				$show_bg = ! isset( $atts['showBackground'] ) || ( 'false' !== $atts['showBackground'] && '0' !== $atts['showBackground'] && false !== $atts['showBackground'] && '' !== $atts['showBackground'] );

				// Suppress background color variable if showBackground is false.
				if ( 'title-background-color' === $variable && ! $show_bg ) {
					continue;
				}

				$style_vars[] = "--videopack-{$variable}: " . $atts[ $attribute ];

				if ( 'title-background-color' === $variable ) {
					$classes[] = 'videopack-has-title-background-color';
				} elseif ( 'title-color' === $variable ) {
					$classes[] = 'videopack-has-title-color';
				} elseif ( 'play-button-color' === $variable ) {
					$classes[] = 'videopack-has-play-button-color';
				} elseif ( 'play-button-icon-color' === $variable ) {
					$classes[] = 'videopack-has-play-button-icon-color';
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
		$style_vars[] = '--videopack-mejs-controls-svg: url(' . includes_url( 'js/mediaelement/mejs-controls.svg' ) . ')';

		$wrapper_attrs = '';
		if ( $is_block ) {
			$wrapper_attrs = get_block_wrapper_attributes(
				array(
					'class' => implode( ' ', $classes ),
					'style' => implode( ';', $style_vars ),
				)
			);
		} else {
			$style         = ! empty( $style_vars ) ? ' style="' . esc_attr( implode( ';', $style_vars ) ) . '"' : '';
			$wrapper_attrs = 'class="' . esc_attr( implode( ' ', $classes ) ) . '"' . $style;
		}

		return sprintf(
			'<div %s>%s</div>',
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

		if ( 'home' === $link_to ) {
			$link = get_home_url();
		} elseif ( 'custom' === $link_to ) {
			$link = $atts['watermark_url'] ?? ( $options['watermark_url'] ?? '' );
		}

		$style_attrs = array(
			'position:absolute',
			'max-width:' . $scale . '%',
			'width:100%',
			'height:auto',
			'z-index:10',
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

		if ( $link ) {
			return sprintf(
				'<div id="video_%s_watermark" class="videopack-video-watermark %s"%s><a href="%s" target="_blank" rel="noopener">%s</a></div>',
				esc_attr( (string) $id ),
				esc_attr( $skin ),
				$style,
				esc_url( $link ),
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
		switch ( $type ) {
			case 'eye':
				return '<svg class="videopack-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="16" width="16"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
			case 'play':
				return '<svg class="videopack-icon-svg" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>';
			case 'playOutline':
				return '<svg class="videopack-icon-svg" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5v14l11-7z" fill="none" /></svg>';
			default:
				return '';
		}
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
		wp_enqueue_style( 'videopack-frontend' );
		$options      = get_option( 'videopack_options', array() );
		$downloadlink = self::is_true( $atts['downloadlink'] ?? ( $options['downloadlink'] ?? false ) );
		$embedcode    = self::is_true( $atts['embedcode'] ?? ( $options['embedcode'] ?? false ) );
		$title        = ! empty( $atts['title'] ) ? $atts['title'] : ( $source ? $source->get_title() : '' );
		$tag          = $atts['tagName'] ?? 'h3';
		
		$is_inside_thumbnail = ! empty( $atts['isInsideThumbnail'] );
		$position            = ! empty( $atts['position'] ) ? $atts['position'] : ( $is_inside_thumbnail ? 'bottom' : 'top' );

		$show_title = ! isset( $atts['overlay_title'] ) || self::is_true( $atts['overlay_title'] );
		// Normalize showBackground from attributes or context.
		$is_overlay      = self::is_true( $atts['isOverlay'] ?? false ) || self::is_true( $atts['is_overlay'] ?? false );
		$show_background = true;
		if ( isset( $atts['showBackground'] ) ) {
			$show_background = self::is_true( $atts['showBackground'] );
		}

		// Resolve Embed Link.
		$embedlink = $atts['embedlink'] ?? '';
		if ( empty( $embedlink ) && $embedcode && $source && $source->get_id() ) {
			$embedlink = add_query_arg( 'videopack[enable]', 'true', get_permalink( $source->get_id() ) );
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
			$style = ! empty( $style_attrs ) ? ' style="' . esc_attr( implode( ';', $style_attrs ) ) . '"' : '';
			$class = 'videopack-video-title has-text-align-' . esc_attr( $text_align ) . ( $show_background ? '' : ' has-no-background' );
			return '<' . esc_attr( $tag ) . ' class="' . esc_attr( $class ) . '"' . $style . '>' . esc_html( (string) $title ) . '</' . esc_attr( $tag ) . '>';
		}

		// Overlay Mode (Info Bar).
		$has_embed    = $embedcode && ! empty( $embedlink );
		$share_svg    = '<svg class="videopack-icon-svg share-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 11.8l6.1-4.5c.1.4.4.7.9.7h2c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v.4l-6.4 4.8c-.2-.1-.4-.2-.6-.2H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h2c.2 0 .4-.1.6-.2l6.4 4.8v.4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2c-.5 0-.8.3-.9.7L9 12.2v-.4z" /></svg>';
		$close_svg    = '<svg class="videopack-icon-svg close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z" /></svg>';
		$download_svg = '<svg class="videopack-icon-svg download-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 11.3l-1-1.1-4 4V3h-1.5v11.3L7 10.2l-1 1.1 6.2 5.8 5.8-5.8zm.5 3.7v3.5h-13V15H4v5h16v-5h-1.5z" /></svg>';
		$embed_svg    = '<svg class="videopack-icon-svg embed-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.8 10.7l-4.3-4.3-1.1 1.1 4.3 4.3c.1.1.1.3 0 .4l-4.3 4.3 1.1 1.1 4.3-4.3c.7-.8.7-1.9 0-2.6zM4.2 11.8l4.3-4.3-1-1-4.3 4.3c-.7.7-.7 1.8 0 2.5l4.3 4.3 1.1-1.1-4.3-4.3c-.2-.1-.2-.3-.1-.4z" /></svg>';

		$text_align        = ! empty( $atts['textAlign'] ) ? $atts['textAlign'] : ( $is_inside_thumbnail ? 'center' : 'left' );
		$title_style_attrs = array();
		if ( ! empty( $atts['title_color'] ) ) {
			$title_style_attrs[] = 'color:' . $atts['title_color'];
		}
		$title_style = ! empty( $title_style_attrs ) ? ' style="' . esc_attr( implode( ';', $title_style_attrs ) ) . '"' : '';
		$title_classes = 'videopack-title has-text-align-' . esc_attr( $text_align );

		$bg_color          = ! empty( $atts['title_background_color'] ) ? $atts['title_background_color'] : null;
		$skin              = $atts['skin'] ?? ( $options['skin'] ?? 'default' );
		$has_custom_bg     = ! empty( $atts['title_background_color'] );
		$has_custom_color  = ! empty( $atts['title_color'] );
		
		$bar_style = ( $show_background && $bg_color ) ? ' style="background-color:' . esc_attr( $bg_color ) . '"' : '';
		$bar_class = 'videopack-video-title is-overlay ' . esc_attr( $skin ) . ' position-' . esc_attr( $position ) . ( $show_background ? '' : ' has-no-background' );
		
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

		$html  = '<div id="video_' . esc_attr( (string) $id ) . '_meta" class="videopack-meta-wrapper"' . $wrapper_style . '>';
		$html .= '<div class="' . esc_attr( $bar_class ) . '"' . $bar_style . '>' . "\n";

		if ( $show_title ) {
			$html .= '<' . esc_attr( $tag ) . ' class="' . esc_attr( $title_classes ) . '"' . $title_style . '>' . esc_html( (string) $title ) . '</' . esc_attr( $tag ) . '>' . "\n";
		}

		$html .= '<div class="videopack-meta-icons">';

		if ( $has_embed ) {
			$html .= '<button type="button" class="videopack-meta-bar-button videopack-share-toggle" title="' . esc_attr__( 'Share', 'video-embed-thumbnail-generator' ) . '">' . "\n";
			$html .= '<span class="videopack-icons share">' . "\n";
			$html .= '<span class="videopack-icon-container">' . $share_svg . $close_svg . '</span>' . "\n";
			$html .= '</span>' . "\n";
			$html .= '</button>' . "\n";
		}

		if ( $downloadlink && $source ) {
			$download_attributes = 'class="videopack-download-link" href="' . esc_attr( $source->get_download_url() ) . '" download title="' . esc_attr__( 'Click to download', 'video-embed-thumbnail-generator' ) . '"';
			$html               .= '<a ' . $download_attributes . '>' . "\n";
			$html               .= '<span class="videopack-icons download">' . "\n" . $download_svg . "\n" . '</span>' . "\n";
			$html               .= '</a>' . "\n";
		}
		$html .= '</div>' . "\n";
		$html .= '</div>' . "\n";

		if ( $has_embed ) {
			$html .= '<button class="videopack-click-trap"></button>' . "\n";
			$html .= '<div class="videopack-share-container">' . "\n";
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
			$html .= '<span class="videopack-embedcode-container">' . "\n" .
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
			$html .= '</div>' . "\n";
		}

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
		return '<p class="wp-element-caption">' . esc_html( (string) $caption ) . '</p>';
	}

	/**
	 * Renders the view count HTML.
	 *
	 * @param \Videopack\Video_Source\Source $source The video source object.
	 * @param array                          $atts   The block or shortcode attributes.
	 * @return string The rendered HTML.
	 */
	public static function render_view_count( $source, $atts = array() ) {
		wp_enqueue_style( 'videopack-frontend' );
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

		$icon_html   = self::get_svg_icon( $icon_type );
		$text_align  = ! empty( $atts['textAlign'] ) ? $atts['textAlign'] : ( $is_thumb ? 'center' : 'left' );
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

		$style   = ! empty( $style_attrs ) ? ' style="' . esc_attr( implode( ';', $style_attrs ) ) . '"' : '';
		$classes = 'videopack-view-count has-text-align-' . esc_attr( $text_align ) . ( $is_overlay ? ' is-overlay is-badge' : '' );
		
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
	 * Renders the fully assembled player HTML including overlays like the title and watermark.
	 *
	 * @param \Videopack\Video_Players\Player $player   The player instance.
	 * @param array                           $atts     The video attributes.
	 * @param \Videopack\Video_Source\Source  $source   The video source object.
	 * @param array                           $options  The global plugin options.
	 * @return string The rendered HTML.
	 */
	public static function render_player_assembly( $player, $atts, $source, $options ) {
		$player_content = '';

		// Video Title / Social Bar.
		$title_atts = array_merge( $atts, array( 'isOverlay' => true ) );
		$player_content .= self::render_video_title( $title_atts, $source, $player->get_id() );

		// Watermark.
		$player_content .= self::render_watermark( $atts + array( 'instance_id' => $player->get_id() ) );

		// Core Player.
		$player_content .= $player->get_player_code( $atts );
		
		// Wrap in relative container.
		$inner_content = sprintf( '<div class="videopack-player-relative-wrapper">%s</div>', $player_content );

		// View Count.
		if ( ! empty( $atts['views'] ) ) {
			$inner_content .= self::render_view_count( $source, $atts );
		}

		// Caption.
		if ( ! empty( $atts['caption'] ) ) {
			$inner_content .= self::render_video_caption( $atts['caption'] );
		}

		return self::render_video_container( $atts, $inner_content );
	}

}
