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

		return array(
			'resolved' => $resolved,
			'style'    => implode( '; ', $style_vars ),
			'classes'  => implode( ' ', $classes ),
		);
	}
}
