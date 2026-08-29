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

		$found = array();

		// 1. Process Gutenberg Blocks.
		if ( function_exists( 'parse_blocks' ) ) {
			$blocks = parse_blocks( $content );
			$found  = array_merge( $found, self::extract_from_blocks( $blocks, $content ) );
		}

		// 2. Process Shortcodes.
		$found = array_merge( $found, self::extract_from_shortcodes( (string) $content ) );

		// Blocks and shortcodes are found in two separate passes above, so
		// without this, every block would always end up ordered ahead of
		// every shortcode regardless of which one actually appears first in
		// $content -- sort by each match's real position instead, so
		// find_first() (used for og:video meta tags) genuinely returns
		// whichever video comes first in the document.
		usort(
			$found,
			static function ( $a, $b ) {
				return $a['pos'] <=> $b['pos'];
			}
		);

		$all_videos = array_map(
			static function ( $item ) {
				return $item['atts'];
			},
			$found
		);

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
	 * Recursively extracts Videopack attributes from all blocks, alongside
	 * each match's real position in $content (needed by find_all() to
	 * interleave block and shortcode matches in actual document order).
	 *
	 * @param array  $blocks  The blocks to scan.
	 * @param string $content The full original content, used to locate each
	 *                        matched block's position.
	 * @return array Array of array{pos: int, atts: array}.
	 */
	protected static function extract_from_blocks( array $blocks, string $content ): array {
		$found = array();
		foreach ( $blocks as $block ) {
			if ( 'videopack/player-container' === ( $block['blockName'] ?? '' ) ) {
				$pos     = strpos( $content, serialize_block( $block ) );
				$found[] = array(
					// A block whose position can't be located (e.g. its
					// re-serialized form doesn't exactly match $content)
					// sorts after every position-known match rather than
					// breaking the sort or being dropped.
					'pos'  => false !== $pos ? $pos : PHP_INT_MAX,
					'atts' => $block['attrs'] ?? array(),
				);
			}
			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$found = array_merge( $found, self::extract_from_blocks( $block['innerBlocks'], $content ) );
			}
		}
		return $found;
	}

	/**
	 * Extracts Videopack attributes from all shortcodes in content,
	 * alongside each match's real position in $content.
	 *
	 * @param string $content The content to scan.
	 * @return array Array of array{pos: int, atts: array}.
	 */
	protected static function extract_from_shortcodes( string $content ): array {
		$found          = array();
		$shortcode_tags = array( 'videopack', 'VIDEOPACK', 'KGVID', 'FMP' );
		$pattern        = get_shortcode_regex( $shortcode_tags );

		if ( preg_match_all( '/' . $pattern . '/s', $content, $matches, PREG_OFFSET_CAPTURE ) ) {
			foreach ( $matches[3] as $index => $attr_match ) {
				$found[] = array(
					'pos'  => (int) $matches[0][ $index ][1],
					'atts' => self::parse_shortcode_entry( (string) $attr_match[0], (string) ( $matches[5][ $index ][0] ?? '' ) ),
				);
			}
		}
		return $found;
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
