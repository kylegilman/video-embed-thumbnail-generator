<?php
/**
 * Tests for Edit_Posts::modify_media_insert() -- building the [videopack]
 * shortcode the Classic Editor inserts when a video attachment is sent
 * from the media library, and add_embedurl_tab(). Previously completely
 * untested.
 */

use Videopack\Admin\Edit_Posts;
use Videopack\Admin\Attachment_Meta;
use Videopack\Admin\Formats\Registry;

class EditPostsMediaInsertTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function edit_posts( array $options = array() ): Edit_Posts {
		$opts = $this->options( $options );
		return new Edit_Posts( $opts, new Registry( $opts ) );
	}

	protected function video_attachment(): int {
		return self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
	}

	protected function save_meta( int $attachment_id, array $meta, array $options = array() ): void {
		( new Attachment_Meta( $this->options( $options ), $attachment_id ) )->save( $meta );
	}

	// -----------------------------------------------------------------
	// Non-video / passthrough behavior.
	// -----------------------------------------------------------------

	public function test_non_video_attachment_html_is_returned_unchanged(): void {
		$attachment_id = self::factory()->attachment->create_object(
			array( 'file' => 'photo.jpg', 'post_mime_type' => 'image/jpeg' )
		);

		$html = $this->edit_posts()->modify_media_insert( '<img src="photo.jpg" />', $attachment_id, array() );

		$this->assertSame( '<img src="photo.jpg" />', $html );
	}

	/**
	 * Attachment_Meta::get_defaults()'s own 'embed' default resolves to
	 * $options['default_insert'] (itself 'Single Video' by default), so a
	 * video attachment with no explicit override still takes the Single
	 * Video branch, not the passthrough one.
	 */
	public function test_a_video_with_no_explicit_embed_choice_still_builds_a_single_video_shortcode(): void {
		$attachment_id = $this->video_attachment();

		$html = $this->edit_posts()->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringStartsWith( '[videopack id="' . $attachment_id . '"]', $html );
	}

	// -----------------------------------------------------------------
	// 'Single Video' embed.
	// -----------------------------------------------------------------

	public function test_single_video_shortcode_wraps_the_sources_url(): void {
		$attachment_id = $this->video_attachment();
		$this->save_meta( $attachment_id, array( 'embed' => 'Single Video' ) );

		$html = $this->edit_posts()->modify_media_insert( '<original/>', $attachment_id, array() );
		$url  = wp_get_attachment_url( $attachment_id );

		$this->assertSame( '[videopack id="' . $attachment_id . '"]' . esc_url( $url ) . '[/videopack]<br />', $html );
	}

	public function test_poster_is_included_when_set_without_a_dedicated_poster_attachment(): void {
		$attachment_id = $this->video_attachment();
		$this->save_meta(
			$attachment_id,
			array(
				'embed'  => 'Single Video',
				'poster' => 'https://example.test/poster.jpg',
			)
		);

		$html = $this->edit_posts()->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringContainsString( 'poster="https://example.test/poster.jpg"', $html );
	}

	public function test_poster_is_omitted_when_a_dedicated_poster_id_exists(): void {
		$poster_id     = self::factory()->attachment->create_object( array( 'file' => 'poster.jpg', 'post_mime_type' => 'image/jpeg' ) );
		$attachment_id = $this->video_attachment();
		$this->save_meta(
			$attachment_id,
			array(
				'embed'     => 'Single Video',
				'poster'    => 'https://example.test/poster.jpg',
				'poster_id' => $poster_id,
			)
		);

		$html = $this->edit_posts()->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringNotContainsString( 'poster=', $html );
	}

	public function test_width_and_height_are_omitted_when_legacy_dimensions_is_disabled(): void {
		$attachment_id = $this->video_attachment();
		$this->save_meta(
			$attachment_id,
			array( 'embed' => 'Single Video', 'width' => 1920, 'height' => 1080 ),
			array( 'legacy_dimensions' => false )
		);

		$html = $this->edit_posts( array( 'legacy_dimensions' => false ) )->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringNotContainsString( 'width=', $html );
		$this->assertStringNotContainsString( 'height=', $html );
	}

	public function test_width_and_height_are_included_when_legacy_dimensions_is_enabled_and_differ_from_site_defaults(): void {
		$attachment_id = $this->video_attachment();
		$options       = array( 'legacy_dimensions' => true, 'width' => 960, 'height' => 540 );
		$this->save_meta( $attachment_id, array( 'embed' => 'Single Video', 'width' => 1920, 'height' => 1080 ), $options );

		$html = $this->edit_posts( $options )->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringContainsString( 'width="1920"', $html );
		$this->assertStringContainsString( 'height="1080"', $html );
	}

	public function test_width_and_height_are_omitted_when_equal_to_site_defaults_even_with_legacy_dimensions_enabled(): void {
		$attachment_id = $this->video_attachment();
		$options       = array( 'legacy_dimensions' => true, 'width' => 960, 'height' => 540 );
		$this->save_meta( $attachment_id, array( 'embed' => 'Single Video', 'width' => 960, 'height' => 540 ), $options );

		$html = $this->edit_posts( $options )->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringNotContainsString( 'width=', $html );
		$this->assertStringNotContainsString( 'height=', $html );
	}

	public function test_send_to_editor_url_filter_is_applied(): void {
		$attachment_id = $this->video_attachment();
		$this->save_meta( $attachment_id, array( 'embed' => 'Single Video' ) );

		add_filter(
			'videopack_send_to_editor_url',
			static function () {
				return 'https://cdn.example.test/custom.mp4';
			}
		);
		$html = $this->edit_posts()->modify_media_insert( '<original/>', $attachment_id, array() );
		remove_all_filters( 'videopack_send_to_editor_url' );

		$this->assertStringContainsString( 'https://cdn.example.test/custom.mp4', $html );
	}

	public function test_insert_shortcode_atts_filter_can_add_attributes(): void {
		$attachment_id = $this->video_attachment();
		$this->save_meta( $attachment_id, array( 'embed' => 'Single Video' ) );

		add_filter(
			'videopack_insert_shortcode_atts',
			static function ( $atts ) {
				$atts['autoplay'] = 'true';
				return $atts;
			}
		);
		$html = $this->edit_posts()->modify_media_insert( '<original/>', $attachment_id, array() );
		remove_all_filters( 'videopack_insert_shortcode_atts' );

		$this->assertStringContainsString( 'autoplay="true"', $html );
	}

	// -----------------------------------------------------------------
	// 'Video Gallery' embed.
	// -----------------------------------------------------------------

	public function test_gallery_shortcode_base_form(): void {
		$attachment_id = $this->video_attachment();
		$this->save_meta( $attachment_id, array( 'embed' => 'Video Gallery' ) );

		$html = $this->edit_posts()->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertSame( '[videopack gallery="true"][/videopack]', $html );
	}

	public function test_gallery_columns_included_only_when_different_from_default(): void {
		$attachment_id = $this->video_attachment();
		$options       = array( 'gallery_columns' => 3 );
		$this->save_meta( $attachment_id, array( 'embed' => 'Video Gallery', 'gallery_columns' => 5 ), $options );

		$html = $this->edit_posts( $options )->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringContainsString( 'gallery_columns="5"', $html );
	}

	public function test_gallery_columns_omitted_when_equal_to_default(): void {
		$attachment_id = $this->video_attachment();
		$options       = array( 'gallery_columns' => 3 );
		$this->save_meta( $attachment_id, array( 'embed' => 'Video Gallery', 'gallery_columns' => 3 ), $options );

		$html = $this->edit_posts( $options )->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringNotContainsString( 'gallery_columns=', $html );
	}

	public function test_gallery_exclude_and_include_are_included_when_set(): void {
		$attachment_id = $this->video_attachment();
		$this->save_meta( $attachment_id, array( 'embed' => 'Video Gallery', 'gallery_exclude' => '5,6', 'gallery_include' => '1,2' ) );

		$html = $this->edit_posts()->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringContainsString( 'gallery_exclude="5,6"', $html );
		$this->assertStringContainsString( 'gallery_include="1,2"', $html );
	}

	public function test_gallery_orderby_and_order_included_only_when_different_from_defaults(): void {
		$attachment_id = $this->video_attachment();
		$this->save_meta( $attachment_id, array( 'embed' => 'Video Gallery', 'gallery_orderby' => 'title', 'gallery_order' => 'desc' ) );

		$html = $this->edit_posts()->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringContainsString( 'gallery_orderby="title"', $html );
		$this->assertStringContainsString( 'gallery_order="desc"', $html );
	}

	public function test_gallery_id_included_only_when_different_from_the_attachments_own_parent(): void {
		$parent_post_id = self::factory()->post->create();
		$other_id       = self::factory()->post->create();
		$attachment_id  = self::factory()->attachment->create_object(
			array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4', 'post_parent' => $parent_post_id )
		);
		$this->save_meta( $attachment_id, array( 'embed' => 'Video Gallery', 'gallery_id' => $other_id ) );

		$html = $this->edit_posts()->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringContainsString( 'gallery_id="' . $other_id . '"', $html );
	}

	public function test_gallery_id_omitted_when_equal_to_the_attachments_own_parent(): void {
		$parent_post_id = self::factory()->post->create();
		$attachment_id  = self::factory()->attachment->create_object(
			array( 'file' => 'video.mp4', 'post_mime_type' => 'video/mp4', 'post_parent' => $parent_post_id )
		);
		$this->save_meta( $attachment_id, array( 'embed' => 'Video Gallery', 'gallery_id' => $parent_post_id ) );

		$html = $this->edit_posts()->modify_media_insert( '<original/>', $attachment_id, array() );

		$this->assertStringNotContainsString( 'gallery_id=', $html );
	}

	// -----------------------------------------------------------------
	// add_embedurl_tab()
	// -----------------------------------------------------------------

	public function test_add_embedurl_tab_adds_all_three_tabs_and_preserves_existing(): void {
		$tabs = $this->edit_posts()->add_embedurl_tab( array( 'type' => 'From URL' ) );

		$this->assertSame( 'From URL', $tabs['type'] );
		$this->assertArrayHasKey( 'embedurl', $tabs );
		$this->assertArrayHasKey( 'embedgallery', $tabs );
		$this->assertArrayHasKey( 'embedlist', $tabs );
	}
}
