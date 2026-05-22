<?php
/**
 * Utility for discovering video attachments.
 *
 * @package Videopack
 */

namespace Videopack\Common;

/**
 * Handles the discovery of video attachments with static caching.
 */
class Video_Discovery {

	/**
	 * Request-level cache for video discoveries to eliminate duplicate DB queries.
	 *
	 * @var array<int, int|null>
	 */
	private static $discovery_cache = array();

	/**
	 * Discovers the first valid video attachment child for a given post ID.
	 *
	 * @param int $post_id The parent post ID.
	 * @return int|null The attachment ID or null if not found.
	 */
	public static function get_first_video_child( $post_id ) {
		$post_id = (int) $post_id;
		if ( ! $post_id ) {
			return null;
		}

		if ( ! isset( self::$discovery_cache[ $post_id ] ) ) {
			$args     = array(
				'post_type'      => 'attachment',
				'post_mime_type' => 'video',
				'post_status'    => 'inherit',
				'posts_per_page' => 1,
				'post_parent'    => $post_id,
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

			self::$discovery_cache[ $post_id ] = ! empty( $children ) ? (int) $children[0] : null;
		}

		return self::$discovery_cache[ $post_id ];
	}

	/**
	 * Clears the static cache. Useful for testing or when attachments change.
	 *
	 * @return void
	 */
	public static function clear_cache() {
		self::$discovery_cache = array();
	}
}
