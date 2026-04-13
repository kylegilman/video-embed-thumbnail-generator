<?php
/**
 * Block Patterns handler.
 *
 * @package Videopack
 * @subpackage Videopack/Admin
 */

namespace Videopack\Admin;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Patterns
 *
 * Registers block patterns for Videopack.
 */
class Patterns implements Hook_Subscriber {

	/**
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'init',
				'callback' => 'register_patterns',
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
	 * Registers Videopack block patterns.
	 *
	 * @return void
	 */
	public function register_patterns() {
		register_block_pattern_category(
			'videopack',
			array( 'label' => __( 'Videopack', 'video-embed-thumbnail-generator' ) )
		);

		// Video Grid Pattern.
		register_block_pattern(
			'videopack/video-grid',
			array(
				'title'       => __( 'Video Grid', 'video-embed-thumbnail-generator' ),
				'description' => __( 'A responsive grid of videos with titles and view counts.', 'video-embed-thumbnail-generator' ),
				'categories'  => array( 'videopack' ),
				'content'     => '<!-- wp:videopack/collection {"layout":"grid","columns":3,"gallery_per_page":6} -->
<!-- wp:videopack/thumbnail {"linkTo":"lightbox"} -->
<!-- wp:videopack/play-button /-->
<!-- wp:videopack/video-duration /-->
<!-- /wp:videopack/thumbnail -->
<!-- wp:videopack/video-title {"tagName":"h3"} /-->
<!-- wp:videopack/view-count /-->
<!-- wp:videopack/pagination /-->
<!-- /wp:videopack/collection -->',
			)
		);

		// Video List Pattern.
		register_block_pattern(
			'videopack/video-list',
			array(
				'title'       => __( 'Video List', 'video-embed-thumbnail-generator' ),
				'description' => __( 'A vertical list of videos with titles and view counts.', 'video-embed-thumbnail-generator' ),
				'categories'  => array( 'videopack' ),
				'content'     => '<!-- wp:videopack/collection {"layout":"list","gallery_per_page":5} -->
<!-- wp:videopack/thumbnail {"linkTo":"lightbox"} -->
<!-- wp:videopack/play-button /-->
<!-- wp:videopack/video-duration /-->
<!-- /wp:videopack/thumbnail -->
<!-- wp:videopack/video-title {"tagName":"h3"} /-->
<!-- wp:videopack/view-count /-->
<!-- wp:videopack/pagination /-->
<!-- /wp:videopack/collection -->',
			)
		);

		// Video Gallery Pattern (Lightbox).
		register_block_pattern(
			'videopack/video-gallery',
			array(
				'title'       => __( 'Video Gallery', 'video-embed-thumbnail-generator' ),
				'description' => __( 'A responsive grid of video thumbnails with lightboxes.', 'video-embed-thumbnail-generator' ),
				'categories'  => array( 'videopack' ),
				'content'     => '<!-- wp:videopack/collection {"layout":"grid","columns":4,"gallery_per_page":12} -->
<!-- wp:videopack/thumbnail {"linkTo":"lightbox"} -->
<!-- /wp:videopack/thumbnail -->
<!-- /wp:videopack/collection -->',
			)
		);
	}
}
