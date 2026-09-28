<?php
/**
 * Shortcode.php's own attribute-parsing/rendering pipeline (atts(), do(),
 * get_final_atts()) already has solid coverage in ShortcodeAttributesTest.php
 * and ShortcodeLegacyCompatTest.php. This file covers the WordPress
 * integration points around that pipeline that had no tests at all:
 * get_block_attributes() (the block editor's attribute schema),
 * no_texturize()/add_query_vars() (simple hook callbacks),
 * get_option_atts_keys() (the shared vocabulary Modular_Renderer relies on),
 * generate_attachment_shortcode() (the ?videopack query-var permalink
 * handler), get_attachment_medium_url(), and the core/video and [video]
 * replacement callbacks (replace_video_block(), replace_video_shortcode()).
 */

use Videopack\Frontend\Shortcode;

class ShortcodeIntegrationPointsTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function shortcode( array $option_overrides = array() ): Shortcode {
		return new Shortcode( array_merge( $this->options(), $option_overrides ) );
	}

	protected function video_attachment(): int {
		$file = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4';
		return self::factory()->attachment->create_upload_object( $file );
	}

	public function tear_down() {
		remove_all_filters( 'videopack_block_attributes' );
		parent::tear_down();
	}

	// -----------------------------------------------------------------
	// no_texturize() / add_query_vars() -- simple hook callbacks.
	// -----------------------------------------------------------------

	public function test_no_texturize_adds_all_four_shortcode_tags_and_preserves_existing(): void {
		$result = $this->shortcode()->no_texturize( array( 'gallery' ) );

		$this->assertSame( array( 'gallery', 'KGVID', 'FMP', 'videopack', 'VIDEOPACK' ), $result );
	}

	public function test_add_query_vars_adds_both_videopack_vars_and_preserves_existing(): void {
		$result = $this->shortcode()->add_query_vars( array( 'existing_var' ) );

		$this->assertSame( array( 'existing_var', 'videopack', 'kgvid_video_embed' ), $result );
	}

	// -----------------------------------------------------------------
	// get_option_atts_keys() -- the shared vocabulary Modular_Renderer
	// uses to decide what to echo back into data-settings-cache.
	// -----------------------------------------------------------------

	public function test_option_atts_keys_merges_both_lists_without_duplicates(): void {
		$keys = Shortcode::get_option_atts_keys();

		// 'muted' and 'gallery_title' are declared in BOTH the options_atts
		// and boolean_convert lists -- the whole point of this method is to
		// de-duplicate that overlap.
		$this->assertContains( 'muted', $keys );
		$this->assertContains( 'gallery_title', $keys );
		$this->assertSame( count( $keys ), count( array_unique( $keys ) ), 'must not contain duplicates' );

		// 'gallery' and 'enable_collection_video_limit' only ever appear in
		// boolean_convert, never options_atts -- confirms the merge actually
		// includes both lists, not just one.
		$this->assertContains( 'gallery', $keys );
		$this->assertContains( 'enable_collection_video_limit', $keys );

		// 'width' only ever appears in options_atts.
		$this->assertContains( 'width', $keys );
	}

	// -----------------------------------------------------------------
	// get_block_attributes()
	// -----------------------------------------------------------------

	public function test_block_attributes_includes_the_special_cased_src_and_title(): void {
		$attributes = $this->shortcode()->get_block_attributes();

		$this->assertSame( array( 'type' => 'string', 'default' => '' ), $attributes['src'] );
	}

	public function test_block_attributes_infers_number_type_for_a_numeric_default(): void {
		$attributes = $this->shortcode()->get_block_attributes();

		// grid_columns only ever appears in default_atts (never options_atts),
		// with a default of 3 -- a clean case for the is_numeric() branch.
		$this->assertSame( 'number', $attributes['grid_columns']['type'] );
		$this->assertSame( 3, $attributes['grid_columns']['default'] );
	}

	public function test_block_attributes_infers_boolean_type_for_a_boolean_default(): void {
		// prioritizePostData is a clean, isolated case: a boolean
		// default_atts default that's in neither options_atts nor
		// boolean_convert, so nothing downstream can overwrite the type
		// this first pass infers from is_bool().
		$attributes = $this->shortcode()->get_block_attributes();

		$this->assertSame( 'boolean', $attributes['prioritizePostData']['type'] );
		$this->assertFalse( $attributes['prioritizePostData']['default'] );
	}

	public function test_block_attributes_infers_string_type_for_a_string_default(): void {
		$attributes = $this->shortcode()->get_block_attributes();

		$this->assertSame( 'string', $attributes['orderby']['type'] );
		$this->assertSame( 'menu_order ID', $attributes['orderby']['default'] );
	}

	public function test_block_attributes_pulls_type_and_default_from_a_set_option(): void {
		// gallery_per_page only ever appears in options_atts (never
		// default_atts/boolean_convert), so this exercises the options_atts
		// branch on its own.
		$attributes = $this->shortcode( array( 'gallery_per_page' => 12 ) )->get_block_attributes();

		$this->assertSame( 'number', $attributes['gallery_per_page']['type'] );
		$this->assertSame( 12, $attributes['gallery_per_page']['default'] );
	}

	public function test_block_attributes_excludes_width_and_height_from_having_a_default(): void {
		$attributes = $this->shortcode( array( 'width' => 960 ) )->get_block_attributes();

		$this->assertSame( 'number', $attributes['width']['type'], 'type should still be inferred from the option value' );
		$this->assertArrayNotHasKey( 'default', $attributes['width'], 'width/height are resolved dynamically, not defaulted' );
	}

	public function test_block_attributes_gives_no_default_for_an_options_att_absent_from_options(): void {
		$options = $this->options();
		unset( $options['watermark_x'] );

		$attributes = ( new Shortcode( $options ) )->get_block_attributes();

		$this->assertSame( array( 'type' => 'string' ), $attributes['watermark_x'] );
	}

	public function test_block_attributes_forces_boolean_type_for_boolean_convert_keys(): void {
		// 'gallery' is a default_atts string default ('false') that
		// boolean_convert then forces to a boolean *type* -- without
		// touching the underlying (still-string) default value.
		$attributes = $this->shortcode()->get_block_attributes();

		$this->assertSame( 'boolean', $attributes['gallery']['type'] );
		$this->assertSame( 'false', $attributes['gallery']['default'], 'the raw default_atts value is left untouched, only the type is forced' );
	}

	public function test_block_attributes_overrides_id_type_to_number_or_string(): void {
		$attributes = $this->shortcode()->get_block_attributes();

		$this->assertSame( array( 'number', 'string' ), $attributes['id']['type'] );
	}

	public function test_block_attributes_text_tracks_has_the_expected_shape(): void {
		$attributes = $this->shortcode()->get_block_attributes();

		$this->assertSame( 'array', $attributes['text_tracks']['type'] );
		$this->assertSame( array(), $attributes['text_tracks']['default'] );
		$this->assertArrayHasKey( 'src', $attributes['text_tracks']['items']['properties'] );
	}

	public function test_block_attributes_are_filterable(): void {
		add_filter(
			'videopack_block_attributes',
			static function ( $attributes ) {
				$attributes['my_custom_attr'] = array( 'type' => 'string' );
				return $attributes;
			}
		);

		$attributes = $this->shortcode()->get_block_attributes();

		$this->assertArrayHasKey( 'my_custom_attr', $attributes );
	}

	// -----------------------------------------------------------------
	// get_attachment_medium_url()
	// -----------------------------------------------------------------

	public function test_medium_url_is_empty_for_a_nonexistent_attachment(): void {
		$this->assertSame( '', $this->shortcode()->get_attachment_medium_url( 0 ) );
	}

	public function test_medium_url_is_empty_when_no_medium_size_was_ever_generated(): void {
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'image/jpeg' ) );

		$this->assertSame( '', $this->shortcode()->get_attachment_medium_url( $attachment_id ) );
	}

	public function test_medium_url_resolves_from_generated_attachment_metadata(): void {
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'image/jpeg' ) );
		// wp_attachment_is_image() (which image_downsize() relies on to even
		// consider intermediate sizes) requires get_attached_file() to
		// return something -- i.e. _wp_attached_file must be set -- before
		// it will trust the mime type at all.
		update_post_meta( $attachment_id, '_wp_attached_file', '2024/01/test-image.jpg' );
		update_post_meta(
			$attachment_id,
			'_wp_attachment_metadata',
			array(
				'width'  => 800,
				'height' => 600,
				'file'   => '2024/01/test-image.jpg',
				'sizes'  => array(
					'medium' => array(
						'file'      => 'test-image-300x225.jpg',
						'width'     => 300,
						'height'    => 225,
						'mime-type' => 'image/jpeg',
					),
				),
			)
		);

		$url = $this->shortcode()->get_attachment_medium_url( $attachment_id );

		$this->assertStringContainsString( 'test-image-300x225.jpg', $url );
	}

	// -----------------------------------------------------------------
	// generate_attachment_shortcode()
	// -----------------------------------------------------------------

	public function test_generate_attachment_shortcode_uses_the_explicit_id_over_the_current_post(): void {
		$attachment_id = $this->video_attachment();
		$other_id      = self::factory()->post->create();

		global $post;
		$original = $post;
		$post     = get_post( $other_id );

		$shortcode_string = $this->shortcode()->generate_attachment_shortcode( array( 'id' => $attachment_id ) );

		$post = $original;

		$this->assertStringContainsString( 'id="' . $attachment_id . '"', $shortcode_string );
	}

	public function test_generate_attachment_shortcode_falls_back_to_the_current_global_post(): void {
		$attachment_id = $this->video_attachment();

		global $post;
		$original = $post;
		$post     = get_post( $attachment_id );

		$shortcode_string = $this->shortcode()->generate_attachment_shortcode( array() );

		$post = $original;

		$this->assertStringContainsString( 'id="' . $attachment_id . '"', $shortcode_string );
	}

	public function test_generate_attachment_shortcode_falls_back_to_id_1_with_no_post_context(): void {
		global $post;
		$original = $post;
		$post     = null;

		$shortcode_string = $this->shortcode()->generate_attachment_shortcode( array() );

		$post = $original;

		$this->assertStringContainsString( 'id="1"', $shortcode_string );
	}

	public function test_generate_attachment_shortcode_adds_fullwidth_when_enable_is_true(): void {
		$attachment_id = $this->video_attachment();

		$shortcode_string = $this->shortcode()->generate_attachment_shortcode(
			array(
				'id'     => $attachment_id,
				'enable' => 'true',
			)
		);

		$this->assertStringContainsString( 'fullwidth="true"', $shortcode_string );
	}

	public function test_generate_attachment_shortcode_omits_fullwidth_when_enable_is_not_the_string_true(): void {
		$attachment_id = $this->video_attachment();

		$shortcode_string = $this->shortcode()->generate_attachment_shortcode(
			array(
				'id'     => $attachment_id,
				'enable' => 'false',
			)
		);

		$this->assertStringNotContainsString( 'fullwidth', $shortcode_string );
	}

	public function test_generate_attachment_shortcode_adds_downloadlink_from_saved_attachment_meta(): void {
		$attachment_id = $this->video_attachment();
		( new \Videopack\Admin\Attachment_Meta( $this->options(), $attachment_id ) )->save( array( 'downloadlink' => true ) );

		$shortcode_string = $this->shortcode()->generate_attachment_shortcode( array( 'id' => $attachment_id ) );

		$this->assertStringContainsString( 'downloadlink="true"', $shortcode_string );
	}

	public function test_generate_attachment_shortcode_adds_start_from_the_query_var(): void {
		$attachment_id = $this->video_attachment();

		$shortcode_string = $this->shortcode()->generate_attachment_shortcode(
			array(
				'id'    => $attachment_id,
				'start' => '30',
			)
		);

		$this->assertStringContainsString( 'start="30"', $shortcode_string );
	}

	public function test_generate_attachment_shortcode_adds_autoplay_when_gallery_key_is_present(): void {
		$attachment_id = $this->video_attachment();

		$shortcode_string = $this->shortcode()->generate_attachment_shortcode(
			array(
				'id'      => $attachment_id,
				'gallery' => '', // array_key_exists() check -- value itself is irrelevant.
			)
		);

		$this->assertStringContainsString( 'autoplay="true"', $shortcode_string );
	}

	public function test_generate_attachment_shortcode_wraps_the_attachment_url(): void {
		$attachment_id = $this->video_attachment();
		$url           = wp_get_attachment_url( $attachment_id );

		$shortcode_string = $this->shortcode()->generate_attachment_shortcode( array( 'id' => $attachment_id ) );

		$this->assertStringContainsString( ']' . esc_url( $url ) . '[/videopack]', $shortcode_string );
		$this->assertStringStartsWith( '[videopack', $shortcode_string );
	}

	// -----------------------------------------------------------------
	// overwrite_video_shortcode()
	// -----------------------------------------------------------------

	public function test_overwrite_video_shortcode_leaves_the_default_video_shortcode_alone_when_disabled(): void {
		remove_shortcode( 'video' );
		add_shortcode( 'video', 'wp_video_shortcode' );

		$this->shortcode( array( 'replace_video_shortcode' => false ) )->overwrite_video_shortcode();

		global $shortcode_tags;
		$this->assertSame( 'wp_video_shortcode', $shortcode_tags['video'] );
	}

	public function test_overwrite_video_shortcode_replaces_it_when_enabled(): void {
		remove_shortcode( 'video' );
		add_shortcode( 'video', 'wp_video_shortcode' );

		$shortcode = $this->shortcode( array( 'replace_video_shortcode' => true ) );
		$shortcode->overwrite_video_shortcode();

		global $shortcode_tags;
		$this->assertSame( array( $shortcode, 'replace_video_shortcode' ), $shortcode_tags['video'] );

		remove_shortcode( 'video' );
		add_shortcode( 'video', 'wp_video_shortcode' );
	}

	// -----------------------------------------------------------------
	// replace_video_shortcode() -- the [video]-attribute-to-content
	// precedence used once it's wired in as the [video] callback above.
	// -----------------------------------------------------------------

	public function test_replace_video_shortcode_prefers_mp4_over_a_lower_priority_key(): void {
		$winner = $this->video_attachment();
		$loser  = $this->video_attachment();

		$output = $this->shortcode()->replace_video_shortcode(
			array(
				'ogv' => (string) $loser,
				'mp4' => (string) $winner,
			)
		);

		$this->assertStringContainsString( 'data-post-id="' . $winner . '"', $output );
		$this->assertStringNotContainsString( 'data-post-id="' . $loser . '"', $output );
	}

	public function test_replace_video_shortcode_honors_the_lowest_priority_key_when_its_the_only_one(): void {
		$attachment_id = $this->video_attachment();

		$output = $this->shortcode()->replace_video_shortcode( array( 'flv' => (string) $attachment_id ) );

		$this->assertStringContainsString( 'data-post-id="' . $attachment_id . '"', $output );
	}

	public function test_replace_video_shortcode_falls_back_to_the_original_content_with_no_recognized_key(): void {
		$attachment_id = $this->video_attachment();

		$output = $this->shortcode()->replace_video_shortcode( array(), (string) $attachment_id );

		$this->assertStringContainsString( 'data-post-id="' . $attachment_id . '"', $output );
	}

	// -----------------------------------------------------------------
	// replace_video_block()
	// -----------------------------------------------------------------

	public function test_replace_video_block_passes_through_unchanged_when_the_option_is_disabled(): void {
		$block = array( 'blockName' => 'core/video', 'attrs' => array( 'id' => $this->video_attachment() ) );

		$output = $this->shortcode( array( 'replace_video_block' => false ) )->replace_video_block( '<original-markup>', $block );

		$this->assertSame( '<original-markup>', $output );
	}

	public function test_replace_video_block_passes_through_unrelated_blocks_unchanged(): void {
		$block = array( 'blockName' => 'core/paragraph', 'attrs' => array() );

		$output = $this->shortcode( array( 'replace_video_block' => true ) )->replace_video_block( '<original-markup>', $block );

		$this->assertSame( '<original-markup>', $output );
	}

	public function test_replace_video_block_replaces_a_core_video_block_when_enabled(): void {
		$attachment_id = $this->video_attachment();
		$block         = array( 'blockName' => 'core/video', 'attrs' => array( 'id' => $attachment_id ) );

		$output = $this->shortcode( array( 'replace_video_block' => true ) )->replace_video_block( '<original-markup>', $block );

		$this->assertStringContainsString( 'data-post-id="' . $attachment_id . '"', $output );
		$this->assertStringNotContainsString( '<original-markup>', $output );
	}

	public function test_replace_video_block_maps_the_autoplay_core_attribute_alias(): void {
		$attachment_id = $this->video_attachment();
		// autoPlay (core's own naming), no 'autoplay' key at all -- must be
		// mapped across before reaching the shortcode handler.
		$block = array( 'blockName' => 'core/video', 'attrs' => array( 'id' => $attachment_id, 'autoPlay' => true ) );

		$output = $this->shortcode( array( 'replace_video_block' => true ) )->replace_video_block( '', $block );

		// data-player-vars is a JSON blob inside an HTML attribute, so its
		// quotes are HTML-entity-encoded in the rendered markup.
		$this->assertStringContainsString( '&quot;autoplay&quot;:true', $output );
	}

	public function test_replace_video_block_recovers_a_missing_boolean_attribute_from_the_raw_html(): void {
		$attachment_id = $this->video_attachment();
		// No 'muted' key in attrs at all -- only recoverable from the
		// original block markup's own <video muted> attribute.
		$block         = array( 'blockName' => 'core/video', 'attrs' => array( 'id' => $attachment_id ) );
		$block_content = '<video muted src="x"></video>';

		$output = $this->shortcode( array( 'replace_video_block' => true ) )->replace_video_block( $block_content, $block );

		$this->assertStringContainsString( '&quot;muted&quot;:true', $output );
	}

	public function test_replace_video_block_wraps_output_in_a_figure_with_the_caption_when_present(): void {
		$attachment_id = $this->video_attachment();
		$block         = array(
			'blockName' => 'core/video',
			'attrs'     => array(
				'id'      => $attachment_id,
				'caption' => 'A safe caption',
				'align'   => 'wide',
			),
		);

		$output = $this->shortcode( array( 'replace_video_block' => true ) )->replace_video_block( '', $block );

		$this->assertStringContainsString( '<figure class="wp-block-video alignwide">', $output );
		$this->assertStringContainsString( '<figcaption class="wp-element-caption">A safe caption</figcaption>', $output );
	}

	/**
	 * Regression test: the caption used to be interpolated into the
	 * figcaption raw, with none of this method's other escaping (esc_attr
	 * on the class, esc_url on... elsewhere in the file) applied to it. A
	 * core/video block's caption is block-editor-authored rather than
	 * arbitrary end-user input, but it's still stored post content --
	 * wp_kses_post() is the same sanitization WordPress core, and this
	 * plugin's own Modular_Renderer::render_video_caption(), already use
	 * for caption text, so this brings the two into line.
	 */
	public function test_replace_video_block_sanitizes_the_caption_against_stored_xss(): void {
		$attachment_id = $this->video_attachment();
		$block         = array(
			'blockName' => 'core/video',
			'attrs'     => array(
				'id'      => $attachment_id,
				'caption' => '<script>alert(1)</script>Hello <strong>world</strong>',
			),
		);

		$output = $this->shortcode( array( 'replace_video_block' => true ) )->replace_video_block( '', $block );

		$this->assertStringNotContainsString( '<script>', $output );
		// wp_kses_post() allows safe inline formatting through -- this isn't
		// meant to strip all markup, only markup capable of executing script.
		$this->assertStringContainsString( 'Hello <strong>world</strong>', $output );
	}

	public function test_replace_video_block_omits_the_caption_figure_wrapper_without_a_caption(): void {
		// Modular_Renderer::render_video_container() always wraps its own
		// output in a <figure class="videopack-wrapper ..."> -- that's not
		// what's under test here. What's under test is replace_video_block()'s
		// own, separate wp-block-video figure/figcaption wrapper, which
		// should only be added when a caption attribute is present.
		$attachment_id = $this->video_attachment();
		$block         = array( 'blockName' => 'core/video', 'attrs' => array( 'id' => $attachment_id ) );

		$output = $this->shortcode( array( 'replace_video_block' => true ) )->replace_video_block( '', $block );

		// Not a "wp-block-video" substring check: the container's own
		// unrelated "wp-block-videopack-player-container" class contains
		// that substring too. figcaption is unique to the caption wrapper.
		$this->assertStringNotContainsString( 'figcaption', $output );
		$this->assertStringNotContainsString( '<figure class="wp-block-video', $output );
	}
}
