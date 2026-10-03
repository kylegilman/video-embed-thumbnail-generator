<?php
/**
 * Tests for Gallery::get_gallery_videos() (the query builder behind every
 * gallery/collection: source selection, include/exclude, pagination
 * slicing, derivative-format exclusion, parent mapping),
 * prepare_video_data_for_js() and render_pagination_html().
 * collection_page()'s security-sensitive template resolution is covered in
 * GalleryCollectionSecurityTest.php.
 */

use Videopack\Frontend\Gallery;
use Videopack\Frontend\Modular_Renderer;
use Videopack\Admin\Formats\Registry;

class GalleryTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function gallery( array $options = array() ): Gallery {
		$options = $this->options( $options );
		return new Gallery( $options, new Registry( $options ) );
	}

	protected function video( array $extra = array() ): int {
		return self::factory()->attachment->create_object(
			array_merge(
				array(
					'file'           => 'video.mp4',
					'post_mime_type' => 'video/mp4',
					'post_status'    => 'inherit',
				),
				$extra
			)
		);
	}

	protected function ids( WP_Query $query ): array {
		return array_map( 'intval', wp_list_pluck( $query->posts, 'ID' ) );
	}

	// -----------------------------------------------------------------
	// get_gallery_videos() -- source selection.
	// -----------------------------------------------------------------

	public function test_explicit_gallery_id_limits_results_to_that_posts_videos(): void {
		$parent = self::factory()->post->create();
		$mine   = $this->video( array( 'post_parent' => $parent ) );
		$this->video( array( 'post_parent' => self::factory()->post->create() ) );

		$query = $this->gallery()->get_gallery_videos( 1, array( 'gallery_id' => $parent, 'gallery_per_page' => -1 ) );

		$this->assertSame( array( $mine ), $this->ids( $query ) );
	}

	public function test_all_and_recent_sources_ignore_the_parent_post(): void {
		$a = $this->video( array( 'post_parent' => self::factory()->post->create() ) );
		$b = $this->video();

		foreach ( array( 'all', 'recent' ) as $source ) {
			$query = $this->gallery()->get_gallery_videos( 1, array( 'gallery_source' => $source, 'gallery_per_page' => -1 ) );
			$ids   = $this->ids( $query );
			$this->assertContains( $a, $ids, "source={$source}" );
			$this->assertContains( $b, $ids, "source={$source}" );
		}
	}

	public function test_custom_source_without_an_id_returns_nothing(): void {
		$this->video( array( 'post_parent' => self::factory()->post->create() ) );

		$query = $this->gallery()->get_gallery_videos( 1, array( 'gallery_source' => 'custom', 'gallery_per_page' => -1 ) );

		$this->assertSame( array(), $this->ids( $query ) );
	}

	public function test_current_source_uses_the_current_post_in_the_loop(): void {
		$parent = self::factory()->post->create();
		$mine   = $this->video( array( 'post_parent' => $parent ) );
		$this->video( array( 'post_parent' => self::factory()->post->create() ) );
		$this->go_to( get_permalink( $parent ) );

		$query = $this->gallery()->get_gallery_videos( 1, array( 'gallery_source' => 'current', 'gallery_per_page' => -1 ) );

		$this->assertSame( array( $mine ), $this->ids( $query ) );
	}

	public function test_category_source_scopes_to_videos_of_posts_in_that_category(): void {
		$cat     = self::factory()->category->create();
		$in_cat  = self::factory()->post->create();
		wp_set_post_categories( $in_cat, array( $cat ) );
		$other   = self::factory()->post->create();
		$mine    = $this->video( array( 'post_parent' => $in_cat ) );
		$this->video( array( 'post_parent' => $other ) );

		$query = $this->gallery()->get_gallery_videos(
			1,
			array(
				'gallery_source'   => 'category',
				'gallery_category' => $cat,
				'gallery_per_page' => -1,
			)
		);

		$this->assertSame( array( $mine ), $this->ids( $query ) );
	}

	public function test_category_source_without_a_category_returns_nothing(): void {
		$this->video( array( 'post_parent' => self::factory()->post->create() ) );

		$query = $this->gallery()->get_gallery_videos( 1, array( 'gallery_source' => 'category', 'gallery_per_page' => -1 ) );

		$this->assertSame( array(), $this->ids( $query ) );
	}

	public function test_tag_source_scopes_to_videos_of_posts_with_that_tag(): void {
		$tag    = self::factory()->tag->create();
		$tagged = self::factory()->post->create();
		wp_set_post_tags( $tagged, array( $tag ) );
		$mine = $this->video( array( 'post_parent' => $tagged ) );
		$this->video( array( 'post_parent' => self::factory()->post->create() ) );

		$query = $this->gallery()->get_gallery_videos(
			1,
			array(
				'gallery_source'   => 'tag',
				'gallery_tag'      => $tag,
				'gallery_per_page' => -1,
			)
		);

		$this->assertSame( array( $mine ), $this->ids( $query ) );
	}

	// -----------------------------------------------------------------
	// get_gallery_videos() -- filtering.
	// -----------------------------------------------------------------

	public function test_derivative_encoded_formats_are_excluded(): void {
		$parent     = self::factory()->post->create();
		$original   = $this->video( array( 'post_parent' => $parent ) );
		$derivative = $this->video( array( 'post_parent' => $parent ) );
		update_post_meta( $derivative, '_kgflashmediaplayer-format', 'h264_720' );

		$query = $this->gallery()->get_gallery_videos( 1, array( 'gallery_id' => $parent, 'gallery_per_page' => -1 ) );

		$this->assertSame( array( $original ), $this->ids( $query ) );
	}

	public function test_non_video_attachments_are_excluded(): void {
		$parent = self::factory()->post->create();
		$video  = $this->video( array( 'post_parent' => $parent ) );
		self::factory()->attachment->create_object(
			array(
				'file'           => 'pic.jpg',
				'post_mime_type' => 'image/jpeg',
				'post_parent'    => $parent,
			)
		);

		$query = $this->gallery()->get_gallery_videos( 1, array( 'gallery_id' => $parent, 'gallery_per_page' => -1 ) );

		$this->assertSame( array( $video ), $this->ids( $query ) );
	}

	public function test_gallery_exclude_removes_listed_ids(): void {
		$parent = self::factory()->post->create();
		$keep   = $this->video( array( 'post_parent' => $parent ) );
		$drop   = $this->video( array( 'post_parent' => $parent ) );

		$query = $this->gallery()->get_gallery_videos(
			1,
			array(
				'gallery_id'       => $parent,
				'gallery_exclude'  => (string) $drop,
				'gallery_per_page' => -1,
			)
		);

		$this->assertSame( array( $keep ), $this->ids( $query ) );
	}

	public function test_gallery_include_returns_those_ids_in_the_order_given_regardless_of_parent(): void {
		$a = $this->video( array( 'post_parent' => self::factory()->post->create() ) );
		$b = $this->video();
		$c = $this->video( array( 'post_parent' => self::factory()->post->create() ) );

		$query = $this->gallery()->get_gallery_videos(
			1,
			array(
				'gallery_include'  => "{$c},{$a},{$b}",
				'gallery_orderby'  => 'menu_order',
				'gallery_per_page' => -1,
			)
		);

		$this->assertSame( array( $c, $a, $b ), $this->ids( $query ) );
	}

	public function test_gallery_include_paginates_by_slicing_the_id_list(): void {
		$ids = array( $this->video(), $this->video(), $this->video(), $this->video(), $this->video() );
		$atts = array(
			'gallery_include'    => implode( ',', $ids ),
			'gallery_orderby'    => 'menu_order',
			'gallery_per_page'   => 2,
			'gallery_pagination' => true,
		);

		$page1 = $this->gallery()->get_gallery_videos( 1, $atts );
		$page3 = $this->gallery()->get_gallery_videos( 3, $atts );

		$this->assertSame( array( $ids[0], $ids[1] ), $this->ids( $page1 ) );
		$this->assertSame( 3, (int) $page1->max_num_pages, '5 ids at 2 per page is 3 pages' );
		$this->assertSame( array( $ids[4] ), $this->ids( $page3 ) );
	}

	public function test_current_source_with_no_post_context_does_not_return_every_video_on_the_site(): void {
		$this->video( array( 'post_parent' => self::factory()->post->create() ) );
		$this->video( array( 'post_parent' => self::factory()->post->create() ) );
		// go_to() leaves a real global $post behind, so clear it to get a
		// genuinely falsy get_the_ID().
		$GLOBALS['post'] = null;

		$query = $this->gallery()->get_gallery_videos( 1, array( 'gallery_source' => 'current', 'gallery_per_page' => -1 ) );

		$this->assertSame( array(), $this->ids( $query ), 'a "current post" gallery with no current post should be empty, not site-wide' );
	}

	public function test_gallery_include_with_pagination_off_returns_everything_on_one_page(): void {
		$ids  = array( $this->video(), $this->video(), $this->video() );
		$atts = array(
			'gallery_include'    => implode( ',', $ids ),
			'gallery_orderby'    => 'menu_order',
			'gallery_per_page'   => 2,
			'gallery_pagination' => false,
		);

		$query = $this->gallery()->get_gallery_videos( 1, $atts );

		$this->assertSame( $ids, $this->ids( $query ) );
	}

	public function test_gallery_include_treats_the_string_false_pagination_from_rest_as_off(): void {
		$ids  = array( $this->video(), $this->video(), $this->video() );
		$atts = array(
			'gallery_include'    => implode( ',', $ids ),
			'gallery_orderby'    => 'menu_order',
			'gallery_per_page'   => 2,
			'gallery_pagination' => 'false',
		);

		$query = $this->gallery()->get_gallery_videos( 1, $atts );

		$this->assertSame( $ids, $this->ids( $query ) );
	}

	// -----------------------------------------------------------------
	// get_gallery_videos() -- ordering / paging / limits.
	// -----------------------------------------------------------------

	public function test_per_page_and_page_number_are_honored(): void {
		$parent = self::factory()->post->create();
		$ids    = array();
		for ( $i = 0; $i < 5; $i++ ) {
			$ids[] = $this->video( array( 'post_parent' => $parent, 'menu_order' => $i ) );
		}
		$atts = array(
			'gallery_id'         => $parent,
			'gallery_orderby'    => 'menu_order',
			'gallery_order'      => 'asc',
			'gallery_per_page'   => 2,
			'gallery_pagination' => true,
		);

		$page2 = $this->gallery()->get_gallery_videos( 2, $atts );

		$this->assertSame( array( $ids[2], $ids[3] ), $this->ids( $page2 ) );
		$this->assertSame( 3, (int) $page2->max_num_pages );
	}

	public function test_without_pagination_the_video_limit_becomes_the_per_page_count(): void {
		$parent = self::factory()->post->create();
		for ( $i = 0; $i < 4; $i++ ) {
			$this->video( array( 'post_parent' => $parent, 'menu_order' => $i ) );
		}

		$query = $this->gallery()->get_gallery_videos(
			1,
			array(
				'gallery_id'         => $parent,
				'gallery_pagination' => false,
				'videos'             => 3,
				'gallery_orderby'    => 'menu_order',
			)
		);

		$this->assertCount( 3, $query->posts );
	}

	public function test_gallery_order_controls_direction(): void {
		$parent = self::factory()->post->create();
		$first  = $this->video( array( 'post_parent' => $parent, 'menu_order' => 1 ) );
		$second = $this->video( array( 'post_parent' => $parent, 'menu_order' => 2 ) );
		$base   = array(
			'gallery_id'       => $parent,
			'gallery_orderby'  => 'menu_order',
			'gallery_per_page' => -1,
		);

		$asc  = $this->gallery()->get_gallery_videos( 1, array_merge( $base, array( 'gallery_order' => 'asc' ) ) );
		$desc = $this->gallery()->get_gallery_videos( 1, array_merge( $base, array( 'gallery_order' => 'desc' ) ) );

		$this->assertSame( array( $first, $second ), $this->ids( $asc ) );
		$this->assertSame( array( $second, $first ), $this->ids( $desc ) );
	}

	public function test_no_matches_returns_an_empty_query(): void {
		$query = $this->gallery()->get_gallery_videos(
			1,
			array(
				'gallery_id'       => self::factory()->post->create(),
				'gallery_per_page' => -1,
			)
		);

		$this->assertFalse( $query->have_posts() );
	}

	public function test_video_to_post_mapping_is_filled_from_each_videos_parent(): void {
		$parent = self::factory()->post->create();
		$video  = $this->video( array( 'post_parent' => $parent ) );
		$gallery = $this->gallery();

		$gallery->get_gallery_videos( 1, array( 'gallery_id' => $parent, 'gallery_per_page' => -1 ) );

		$this->assertSame( $parent, $gallery->video_to_post_mapping[ $video ] );
	}

	// -----------------------------------------------------------------
	// render_pagination_html()
	// -----------------------------------------------------------------

	public function test_render_pagination_html_delegates_to_the_modular_renderer(): void {
		$this->assertSame( Modular_Renderer::render_pagination( 2, 5 ), $this->gallery()->render_pagination_html( 5, 2 ) );
	}

	public function test_render_pagination_html_is_empty_for_a_single_page(): void {
		$this->assertSame( '', $this->gallery()->render_pagination_html( 1, 1 ) );
	}

	// -----------------------------------------------------------------
	// prepare_video_data_for_js()
	// -----------------------------------------------------------------

	protected function real_video_post(): WP_Post {
		$file = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4'; // Native 4096x2304.
		$id   = self::factory()->attachment->create_upload_object( $file );
		return get_post( $id );
	}

	public function test_prepare_video_data_returns_the_core_fields_for_a_post(): void {
		$post = $this->real_video_post();

		$data = $this->gallery()->prepare_video_data_for_js( $post, array() );

		$this->assertSame( $post->ID, $data['attachment_id'] );
		$this->assertSame( get_the_title( $post ), $data['title'] );
		$this->assertSame( $post->ID, $data['player_vars']['attachment_id'] );
		$this->assertSame( 'true', wp_parse_args( (string) wp_parse_url( $data['embed_url'], PHP_URL_QUERY ) )['videopack']['enable'] );
		$this->assertSame( $data['embed_url'], $data['player_vars']['embed_url'] );
	}

	public function test_prepare_video_data_parent_id_comes_from_the_mapping(): void {
		$post    = $this->real_video_post();
		$gallery = $this->gallery();
		$gallery->video_to_post_mapping[ $post->ID ] = 123;

		$data = $gallery->prepare_video_data_for_js( $post, array() );

		$this->assertSame( 123, $data['parent_id'] );
	}

	public function test_prepare_video_data_forces_autoplay_for_a_gallery_layout(): void {
		$post = $this->real_video_post();

		$gallery_data = $this->gallery()->prepare_video_data_for_js( $post, array( 'gallery' => true ), 'gallery' );
		$list_data    = $this->gallery()->prepare_video_data_for_js( $post, array( 'gallery' => true ), 'list' );

		$this->assertTrue( $gallery_data['player_vars']['autoplay'], 'lightbox playback should start automatically' );
		$this->assertFalse( $list_data['player_vars']['autoplay'] );
	}

	public function test_prepare_video_data_maps_camel_case_colors_for_the_player(): void {
		$post = $this->real_video_post();

		$data = $this->gallery()->prepare_video_data_for_js( $post, array( 'titleColor' => '#ff0000' ) );

		$this->assertSame( '#ff0000', $data['player_vars']['title_color'] );
	}

	public function test_prepare_video_data_uses_native_dimensions_when_none_requested(): void {
		$post = $this->real_video_post();

		$data = $this->gallery()->prepare_video_data_for_js( $post, array() );

		$this->assertSame( 4096, $data['player_vars']['width'] );
		$this->assertSame( 2304, $data['player_vars']['height'] );
	}

	public function test_prepare_video_data_includes_the_view_count_from_meta(): void {
		$post = $this->real_video_post();
		( new \Videopack\Admin\Attachment_Meta( $this->options(), $post->ID ) )->save( array( 'starts' => 7 ) );

		$data = $this->gallery()->prepare_video_data_for_js( $post, array() );

		$this->assertSame( 7, $data['player_vars']['starts'] );
	}
}
