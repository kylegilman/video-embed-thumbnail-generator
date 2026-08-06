<?php
/**
 * Centralized context resolution for Videopack blocks.
 *
 * @package Videopack
 * @subpackage Videopack/Frontend
 */

namespace Videopack\Frontend;

use Videopack\Common\Defaults;

/**
 * Class Context_Manager
 *
 * Handles the resolution of design attributes from local overrides, block context,
 * and global defaults. Generates CSS classes and style variables.
 */
class Context_Manager {

	/**
	 * Resolves design settings for a block.
	 *
	 * @param array $attributes Block attributes.
	 * @param array $context    Block context.
	 * @param array $options    Global plugin options.
	 * @param array $class_keys Subset of $design_keys whose resolved values should
	 *                          become videopack-has-{key} classes / --videopack-{key}
	 *                          CSS vars in the returned classes/style strings. $resolved
	 *                          always contains the full $design_keys set regardless —
	 *                          other code reads $resolved[...] directly for logic, not
	 *                          just markup, so only the stamping is scoped per block type.
	 * @return array {
	 *     @type array  $resolved Resolved attribute values.
	 *     @type string $style    CSS style string.
	 *     @type string $classes  CSS classes string.
	 * }
	 */
	public static function resolve( array $attributes, array $context, array $options, array $class_keys ) {
		$defaults = Defaults::get_all( $options );

		$design_keys = array(
			'skin',
			'title_color',
			'title_background_color',
			'play_button_color',
			'play_button_secondary_color',
			'control_bar_bg_color',
			'control_bar_color',
			'watermark',
			'watermark_styles',
			'watermark_link_to',
			'watermark_align',
			'watermark_valign',
			'watermark_scale',
			'watermark_x',
			'watermark_y',
			'pagination_color',
			'pagination_background_color',
			'pagination_active_bg_color',
			'pagination_active_color',
			'exclude_hover_trigger',
			'title_position',
			'hover_effect',
			'aspect_ratio',
		);

		$resolved   = array();
		$style_vars = array();
		$classes    = array();

		// Normalize attributes to snake_case (Gutenberg often sends camelCase).
		$normalized_attributes = array();
		foreach ( $attributes as $key => $val ) {
			$snake_key                           = strtolower( preg_replace( '/(?<!^)[A-Z]/', '_$0', (string) $key ) );
			$normalized_attributes[ $snake_key ] = $val;
		}

		// Handle Gutenberg Typography Classes (Presets).
		$font_size   = $normalized_attributes['font_size'] ?? ( $attributes['fontSize'] ?? null );
		$font_family = $normalized_attributes['font_family'] ?? ( $attributes['fontFamily'] ?? null );
		if ( ! empty( $font_size ) ) {
			$classes[] = 'has-' . $font_size . '-font-size';
		}
		if ( ! empty( $font_family ) ) {
			$classes[] = 'has-' . $font_family . '-font-family';
		}

		foreach ( $design_keys as $key ) {
			$context_key = "videopack/{$key}";

			// An empty string means "cleared -- defer to context/global",
			// matching the JS resolver's isValid() check in
			// admin-ui/src/utils/context.js; it is NOT a terminal value.
			// The literal string 'inherit' (set via the color picker's
			// distinct "Inherit" control, as opposed to "Clear") IS a real
			// terminal value here -- it flows straight through as
			// `--videopack-{key}: inherit`, which browsers resolve as the
			// `inherit` keyword once substituted into `color: var(...)`.
			$value = null;
			if ( array_key_exists( $key, $normalized_attributes ) && '' !== $normalized_attributes[ $key ] ) {
				$value = $normalized_attributes[ $key ];
			} elseif ( array_key_exists( $context_key, $context ) && '' !== $context[ $context_key ] ) {
				$value = $context[ $context_key ];
			} else {
				$value = $options[ $key ] ?? ( $defaults[ $key ] ?? null );
			}

			$resolved[ $key ] = $value;

			if ( ! empty( $value ) && in_array( $key, $class_keys, true ) ) {
				if ( 'skin' === $key ) {
					if ( 'default' !== $value ) {
						$classes[] = $value;
					}
				} elseif ( is_scalar( $value ) ) {
						$css_key      = str_replace( '_', '-', $key );
						$style_vars[] = "--videopack-{$css_key}: {$value}";
						$classes[]    = "videopack-has-{$css_key}";
				}
			}
		}

		// Handle Gutenberg "style" attribute (typography, spacing, etc).
		$style_attr = $normalized_attributes['style'] ?? ( $attributes['style'] ?? null );
		if ( ! empty( $style_attr ) ) {
			if ( is_string( $style_attr ) ) {
				$decoded = json_decode( $style_attr, true );
				if ( is_array( $decoded ) ) {
					$style_attr = $decoded;
				}
			}

			if ( is_array( $style_attr ) ) {
				// Typography Support.
				if ( ! empty( $style_attr['typography'] ) ) {
					foreach ( $style_attr['typography'] as $type_key => $type_val ) {
						if ( 'fontSize' === $type_key ) {
							if ( preg_match( '/^var:preset\|font-size\|(.*)$/', (string) $type_val, $matches ) ) {
								$style_vars[] = 'font-size: var(--wp--preset--font-size--' . $matches[1] . ')';
							} else {
								$style_vars[] = 'font-size: ' . $type_val;
							}
						} elseif ( 'lineHeight' === $type_key ) {
							$style_vars[] = 'line-height: ' . $type_val;
						} elseif ( 'letterSpacing' === $type_key ) {
							$style_vars[] = 'letter-spacing: ' . $type_val;
						}
					}
				}

				// Spacing Support (Margin/Padding).
				if ( ! empty( $style_attr['spacing'] ) ) {
					foreach ( $style_attr['spacing'] as $space_key => $space_vals ) {
						if ( is_array( $space_vals ) ) {
							foreach ( $space_vals as $dir => $val ) {
								if ( preg_match( '/^var:preset\|spacing\|(.*)$/', (string) $val, $matches ) ) {
									$val = 'var(--wp--preset--spacing--' . $matches[1] . ')';
								}
								$style_vars[] = "{$space_key}-{$dir}: {$val}";
							}
						}
					}
				}
			}
		}

		return array(
			'resolved' => $resolved,
			'style'    => implode( '; ', $style_vars ),
			'classes'  => implode( ' ', array_unique( $classes ) ),
		);
	}

	/**
	 * Resolves whether an overlay/badge block's background should show.
	 *
	 * A boolean control flag rather than a color/string value, so it's
	 * resolved separately from resolve()'s $design_keys loop (which is
	 * built around emitting `--videopack-{key}: {value}` CSS vars for
	 * scalar values, not a plain show/hide flag). Precedence: the block's
	 * own attribute (if explicitly set) -> inherited context
	 * (videopack/showBackground) -> the global option -> $is_overlay itself.
	 * A background bar makes sense by default when it's actually a bar/badge
	 * overlaid on a video or thumbnail; a standalone block (plain text/icon
	 * in normal page flow, not overlaid on anything) defaults to no
	 * background box instead.
	 *
	 * @param array $attributes Block attributes.
	 * @param array $context    Block context.
	 * @param array $options    Global plugin options.
	 * @param bool  $is_overlay Whether this block is currently rendering as
	 *                          an overlay/badge. Used only as the final
	 *                          fallback default.
	 * @return bool Whether the background should show.
	 */
	public static function resolve_show_background( array $attributes, array $context, array $options, bool $is_overlay = true ): bool {
		$normalized_attributes = array();
		foreach ( $attributes as $key => $val ) {
			$snake_key                           = strtolower( preg_replace( '/(?<!^)[A-Z]/', '_$0', (string) $key ) );
			$normalized_attributes[ $snake_key ] = $val;
		}

		if ( array_key_exists( 'show_background', $normalized_attributes ) && null !== $normalized_attributes['show_background'] ) {
			return \Videopack\Frontend\Modular_Renderer::is_true( $normalized_attributes['show_background'] );
		}
		if ( array_key_exists( 'videopack/showBackground', $context ) ) {
			return \Videopack\Frontend\Modular_Renderer::is_true( $context['videopack/showBackground'] );
		}
		if ( isset( $options['showBackground'] ) ) {
			return \Videopack\Frontend\Modular_Renderer::is_true( $options['showBackground'] );
		}
		return $is_overlay;
	}
}
