<?php
/**
 * Post content video discovery utility.
 *
 * @package Videopack
 */

namespace Videopack\Frontend;

/**
 * Class Video_Finder
 *
 * Utility class to find Videopack videos (blocks and shortcodes) within post content.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Video_Finder {

	/**
	 * Static cache to store findings for the current request.
	 *
	 * @var array
	 */
	private static $cache = array();

	/**
	 * Scans content for all Videopack video instances.
	 *
	 * @param string $content The post content to scan.
	 * @return array Array of attribute arrays.
	 */
	public static function find_all( string $content ): array {
		$cache_key = md5( $content );
		if ( isset( self::$cache[ $cache_key ] ) ) {
			return self::$cache[ $cache_key ];
		}

		$all_videos = array();

		// 1. Process Gutenberg Blocks.
		if ( function_exists( 'parse_blocks' ) ) {
			$blocks     = parse_blocks( $content );
			$all_videos = array_merge( $all_videos, self::extract_from_blocks( $blocks ) );
		}

		// 2. Process Shortcodes.
		$all_videos = array_merge( $all_videos, self::extract_from_shortcodes( (string) $content ) );

		self::$cache[ $cache_key ] = $all_videos;
		return $all_videos;
	}

	/**
	 * Scans content and returns only the first Videopack video instance found.
	 *
	 * @param string $content The post content to scan.
	 * @return array|null The first video's attributes or null if none found.
	 */
	public static function find_first( string $content ): ?array {
		$all = self::find_all( $content );
		return ! empty( $all ) ? $all[0] : null;
	}

	/**
	 * Recursively extracts Videopack attributes from all blocks.
	 *
	 * @param array $blocks The blocks to scan.
	 * @return array The found attributes.
	 */
	protected static function extract_from_blocks( array $blocks ): array {
		$found = array();
		foreach ( $blocks as $block ) {
			if ( 'videopack/videopack-video' === ( $block['blockName'] ?? '' ) ) {
				$found[] = $block['attrs'] ?? array();
			}
			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$found = array_merge( $found, self::extract_from_blocks( $block['innerBlocks'] ) );
			}
		}
		return $found;
	}

	/**
	 * Recursively finds only the first Videopack block.
	 *
	 * @param array $blocks The blocks to scan.
	 * @return array|null The first block's attributes or null if none found.
	 */
	protected static function find_first_block( array $blocks ): ?array {
		foreach ( $blocks as $block ) {
			if ( 'videopack/videopack-video' === ( $block['blockName'] ?? '' ) ) {
				return $block['attrs'] ?? array();
			}
			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$found = self::find_first_block( $block['innerBlocks'] );
				if ( $found ) {
					return $found;
				}
			}
		}
		return null;
	}

	/**
	 * Extracts Videopack attributes from all shortcodes in content.
	 *
	 * @param string $content The content to scan.
	 * @return array The found attributes.
	 */
	protected static function extract_from_shortcodes( string $content ): array {
		$found          = array();
		$shortcode_tags = array( 'videopack', 'VIDEOPACK', 'KGVID', 'FMP' );
		$pattern        = get_shortcode_regex( $shortcode_tags );

		if ( preg_match_all( '/' . $pattern . '/s', $content, $matches ) ) {
			foreach ( $matches[3] as $index => $attr_string ) {
				$found[] = self::parse_shortcode_entry( (string) $attr_string, (string) ( $matches[5][ $index ] ?? '' ) );
			}
		}
		return $found;
	}

	/**
	 * Finds only the first Videopack shortcode in content.
	 *
	 * @param string $content The content to scan.
	 * @return array|null The first shortcode's attributes or null if none found.
	 */
	protected static function find_first_shortcode( string $content ): ?array {
		$shortcode_tags = array( 'videopack', 'VIDEOPACK', 'KGVID', 'FMP' );
		$pattern        = get_shortcode_regex( $shortcode_tags );

		if ( preg_match( '/' . $pattern . '/s', $content, $match ) ) {
			return self::parse_shortcode_entry( (string) $match[3], (string) ( $match[5] ?? '' ) );
		}
		return null;
	}

	/**
	 * Common parser for shortcode attributes.
	 *
	 * @param string|array $attr_string   The attribute string.
	 * @param string       $inner_content The inner content of the shortcode.
	 * @return array The parsed attributes.
	 */
	protected static function parse_shortcode_entry( $attr_string, string $inner_content ): array {
		$atts          = is_string( $attr_string ) ? (array) shortcode_parse_atts( $attr_string ) : array();
		$inner_content = trim( $inner_content );

		if ( empty( $atts['id'] ) && ! empty( $inner_content ) ) {
			if ( is_numeric( $inner_content ) ) {
				$atts['id'] = (int) $inner_content;
			} else {
				$atts['src'] = (string) $inner_content;
			}
		}
		return $atts;
	}
}
