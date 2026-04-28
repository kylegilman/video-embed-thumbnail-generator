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
	 * @return array {
	 *     @type array  $resolved Resolved attribute values.
	 *     @type string $style    CSS style string.
	 *     @type string $classes  CSS classes string.
	 * }
	 */
	public static function resolve( $attributes, $context, $options ) {
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
			'pagination_color',
			'pagination_background_color',
			'pagination_active_bg_color',
			'pagination_active_color',
		);

		$resolved   = array();
		$style_vars = array();
		$classes    = array();

		// Normalize attributes to snake_case (Gutenberg often sends camelCase).
		$normalized_attributes = array();
		if ( is_array( $attributes ) ) {
			foreach ( $attributes as $key => $val ) {
				$snake_key                           = strtolower( preg_replace( '/(?<!^)[A-Z]/', '_$0', (string) $key ) );
				$normalized_attributes[ $snake_key ] = $val;
			}
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

			$value = null;
			if ( array_key_exists( $key, $normalized_attributes ) ) {
				$value = $normalized_attributes[ $key ];
			} elseif ( array_key_exists( $context_key, $context ) ) {
				$value = $context[ $context_key ];
			} else {
				$value = $options[ $key ] ?? ( $defaults[ $key ] ?? null );
			}

			$resolved[ $key ] = $value;

			if ( ! empty( $value ) ) {
				if ( 'skin' === $key ) {
					if ( 'default' !== $value ) {
						$classes[] = $value;
					}
				} else {
					if ( is_scalar( $value ) ) {
						$css_key      = str_replace( '_', '-', $key );
						$style_vars[] = "--videopack-{$css_key}: {$value}";
						$classes[]    = "videopack-has-{$css_key}";
					}
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
			'style'    => implode( '; ', array_filter( $style_vars ) ),
			'classes'  => implode( ' ', array_unique( array_filter( $classes ) ) ),
		);
	}
}
