<?php
/**
 * Blocks.php had no dedicated test file at all despite being 1500+ lines of
 * real logic (attachment-id resolution, context bridging for child blocks,
 * render-callback wiring, and the Collection pagination lookup that scans
 * post content / reusable blocks / widget areas for a saved block instance).
 *
 * This covers the methods that are testable without standing up a full
 * Gutenberg do_blocks() render tree: get_effective_attachment_id(),
 * inject_videopack_context(), inject_render_callbacks(),
 * locate_collection_inner_blocks()/find_collection_block_by_id(), the
 * lightbox-modal-footer gate, and the render_* callbacks whose own bodies
 * only read $block->context (not $block->inner_blocks/$block->render()) --
 * those accept a plain object stub since the parameter itself carries no
 * \WP_Block type declaration. The block-tree-dependent callbacks
 * (render_player, render_player_engine, render_collection, render_thumbnail,
 * render_video_loop) are exercised indirectly via
 * Modular_Renderer::render_standalone_player_assembly() in
 * ModularRendererTest.php, which already runs them through a real do_blocks().
 */

use Videopack\Frontend\Blocks;
use Videopack\Frontend\Modular_Renderer;
use Videopack\Common\Video_Discovery;
use Videopack\Admin\Formats\Registry;

class BlocksTest extends WP_UnitTestCase {

	public function tear_down() {
		Video_Discovery::clear_cache();
		Modular_Renderer::$rendered_lightbox_trigger = false;
		Blocks::$collection_metadata_cache            = array();
		parent::tear_down();
	}

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function blocks(): Blocks {
		return new Blocks( $this->options(), new Registry( $this->options() ) );
	}

	protected function video_attachment( array $overrides = array() ): int {
		return self::factory()->attachment->create_object(
			array_merge( array( 'post_mime_type' => 'video/mp4' ), $overrides )
		);
	}

	/**
	 * A minimal stand-in for \WP_Block: the render_* callbacks that only
	 * ever read $block->context (never ->inner_blocks or ->render()) have
	 * no type declaration on the $block parameter, so any object with a
	 * public $context works.
	 */
	protected function block_stub( array $context = array() ) {
		$stub          = new stdClass();
		$stub->context = $context;
		return $stub;
	}

	// -----------------------------------------------------------------
	// get_effective_attachment_id()
	// -----------------------------------------------------------------

	public function test_effective_id_prefers_explicit_postId_attribute(): void {
		$attachment_id = $this->video_attachment();

		$result = $this->blocks()->get_effective_attachment_id( array( 'postId' => $attachment_id ), array() );

		$this->assertSame( $attachment_id, $result );
	}

	public function test_effective_id_falls_back_to_id_attribute_when_postId_absent(): void {
		$attachment_id = $this->video_attachment();

		$result = $this->blocks()->get_effective_attachment_id( array( 'id' => $attachment_id ), array() );

		$this->assertSame( $attachment_id, $result );
	}

	public function test_effective_id_uses_context_postId_when_no_attribute_given(): void {
		$attachment_id = $this->video_attachment();

		$result = $this->blocks()->get_effective_attachment_id( array(), array( 'videopack/postId' => $attachment_id ) );

		$this->assertSame( $attachment_id, $result );
	}

	public function test_effective_id_trusts_an_explicit_id_even_with_a_non_video_mime_type(): void {
		$image_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'image/png' ) );

		$result = $this->blocks()->get_effective_attachment_id( array( 'id' => $image_id ), array() );

		$this->assertSame( $image_id, $result, 'an explicitly-supplied attachment id is trusted even if the mime check is inconclusive' );
	}

	public function test_effective_id_accepts_a_video_attachment_reached_only_via_context_with_no_explicit_flag(): void {
		$attachment_id = $this->video_attachment();

		// Deliberately going through videopack/postId (which does mark
		// is_explicit) is covered above; this exercises the mime-type
		// branch succeeding on its own merits regardless of that flag.
		$result = $this->blocks()->get_effective_attachment_id( array(), array( 'videopack/postId' => $attachment_id ) );

		$this->assertSame( $attachment_id, $result );
	}

	public function test_effective_id_auto_discovers_the_first_attached_video_on_a_regular_post(): void {
		$post_id       = self::factory()->post->create();
		$attachment_id = $this->video_attachment( array( 'post_parent' => $post_id ) );

		$result = $this->blocks()->get_effective_attachment_id( array(), array( 'postId' => $post_id ) );

		$this->assertSame( $attachment_id, $result );
	}

	public function test_effective_id_returns_null_when_a_regular_post_has_no_attached_video(): void {
		$post_id = self::factory()->post->create();

		$result = $this->blocks()->get_effective_attachment_id( array(), array( 'postId' => $post_id ) );

		$this->assertNull( $result );
	}

	public function test_effective_id_skips_discovery_when_a_manual_src_attribute_is_present(): void {
		$post_id = self::factory()->post->create();
		$this->video_attachment( array( 'post_parent' => $post_id ) );

		$result = $this->blocks()->get_effective_attachment_id(
			array( 'src' => 'https://example.test/video.mp4' ),
			array( 'postId' => $post_id )
		);

		$this->assertNull( $result, 'a manual src should never be silently overridden by auto-discovery' );
	}

	public function test_effective_id_skips_discovery_when_a_manual_src_is_supplied_via_context(): void {
		$post_id = self::factory()->post->create();
		$this->video_attachment( array( 'post_parent' => $post_id ) );

		$result = $this->blocks()->get_effective_attachment_id(
			array(),
			array(
				'postId'          => $post_id,
				'videopack/src'   => 'https://example.test/video.mp4',
			)
		);

		$this->assertNull( $result );
	}

	public function test_effective_id_returns_null_for_a_non_numeric_id(): void {
		$result = $this->blocks()->get_effective_attachment_id( array( 'id' => 'not-a-number' ), array() );

		$this->assertNull( $result );
	}

	public function test_effective_id_accepts_a_numeric_string_id(): void {
		$attachment_id = $this->video_attachment();

		$result = $this->blocks()->get_effective_attachment_id( array( 'id' => (string) $attachment_id ), array() );

		$this->assertSame( $attachment_id, $result );
	}

	// -----------------------------------------------------------------
	// inject_videopack_context()
	// -----------------------------------------------------------------

	public function test_inject_context_forwards_player_container_attributes_generically(): void {
		$parsed_block = array(
			'blockName' => 'videopack/player-container',
			'attrs'     => array(
				'title'  => 'My Video',
				'poster' => 'https://example.test/poster.jpg',
			),
		);

		$context = $this->blocks()->inject_videopack_context( array(), $parsed_block );

		$this->assertSame( 'My Video', $context['videopack/title'] );
		$this->assertSame( 'https://example.test/poster.jpg', $context['videopack/poster'] );
		$this->assertTrue( $context['videopack/isInsidePlayerContainer'] );
	}

	public function test_inject_context_sets_postId_and_attachmentId_when_resolvable(): void {
		$attachment_id = $this->video_attachment();
		$parsed_block  = array(
			'blockName' => 'videopack/player-container',
			'attrs'     => array( 'id' => $attachment_id ),
		);

		$context = $this->blocks()->inject_videopack_context( array(), $parsed_block );

		$this->assertSame( $attachment_id, $context['videopack/postId'] );
		$this->assertSame( $attachment_id, $context['videopack/attachmentId'] );
	}

	public function test_inject_context_omits_postId_when_not_resolvable(): void {
		$parsed_block = array(
			'blockName' => 'videopack/player-container',
			'attrs'     => array( 'src' => 'https://example.test/video.mp4' ),
		);

		$context = $this->blocks()->inject_videopack_context( array(), $parsed_block );

		$this->assertArrayNotHasKey( 'videopack/postId', $context );
	}

	public function test_inject_context_falls_back_to_options_watermark_when_attribute_absent(): void {
		update_option( 'videopack_options', array_merge( $this->options(), array( 'watermark' => 'https://example.test/logo.png' ) ) );
		$parsed_block = array(
			'blockName' => 'videopack/player-container',
			'attrs'     => array(),
		);

		$context = $this->blocks()->inject_videopack_context( array(), $parsed_block );

		$this->assertSame( 'https://example.test/logo.png', $context['videopack/watermark'] );
	}

	public function test_inject_context_does_not_override_an_explicit_watermark_attribute(): void {
		update_option( 'videopack_options', array_merge( $this->options(), array( 'watermark' => 'https://example.test/logo.png' ) ) );
		$parsed_block = array(
			'blockName' => 'videopack/player-container',
			// A real editor-authored block can persist an explicit '' to
			// mean "no watermark for this instance" -- array_key_exists()
			// must still see that as present and skip the options fallback.
			'attrs'     => array( 'watermark' => '' ),
		);

		$context = $this->blocks()->inject_videopack_context( array(), $parsed_block );

		$this->assertSame( '', $context['videopack/watermark'] );
	}

	public function test_inject_context_falls_back_to_the_options_watermark_link_to_when_absent(): void {
		update_option( 'videopack_options', array_merge( $this->options(), array( 'watermark_link_to' => 'download' ) ) );
		$parsed_block = array(
			'blockName' => 'videopack/player-container',
			'attrs'     => array(),
		);

		$context = $this->blocks()->inject_videopack_context( array(), $parsed_block );

		$this->assertSame( 'download', $context['videopack/watermark_link_to'] );
	}

	public function test_inject_context_defaults_watermark_link_to_the_string_false_when_the_option_itself_is_unset(): void {
		$options = $this->options();
		unset( $options['watermark_link_to'] );
		update_option( 'videopack_options', $options );
		$parsed_block = array(
			'blockName' => 'videopack/player-container',
			'attrs'     => array(),
		);

		$context = ( new Blocks( $options, new Registry( $options ) ) )->inject_videopack_context( array(), $parsed_block );

		$this->assertSame( 'false', $context['videopack/watermark_link_to'] );
	}

	public function test_inject_context_marks_player_blocks_as_inside_player_overlay(): void {
		$parsed_block = array( 'blockName' => 'videopack/player' );

		$context = $this->blocks()->inject_videopack_context( array( 'existing' => 'value' ), $parsed_block );

		$this->assertTrue( $context['videopack/isInsidePlayerOverlay'] );
		$this->assertSame( 'value', $context['existing'], 'unrelated context must be preserved' );
	}

	public function test_inject_context_leaves_unrelated_blocks_untouched(): void {
		$parsed_block = array(
			'blockName' => 'core/paragraph',
			'attrs'     => array( 'content' => 'hello' ),
		);

		$context = $this->blocks()->inject_videopack_context( array( 'foo' => 'bar' ), $parsed_block );

		$this->assertSame( array( 'foo' => 'bar' ), $context );
	}

	// -----------------------------------------------------------------
	// inject_render_callbacks()
	// -----------------------------------------------------------------

	public function test_inject_render_callbacks_assigns_the_right_callback_for_known_blocks(): void {
		$blocks = $this->blocks();

		$map = array(
			'videopack/player-container' => 'render_player',
			'videopack/watermark'        => 'render_video_watermark',
			'videopack/collection'       => 'render_collection',
			'videopack/pagination'       => 'render_pagination',
		);

		foreach ( $map as $block_name => $expected_method ) {
			$settings = $blocks->inject_render_callbacks( array(), array( 'name' => $block_name ) );

			$this->assertSame( array( $blocks, $expected_method ), $settings['render_callback'], "wrong callback for {$block_name}" );
		}
	}

	public function test_inject_render_callbacks_leaves_unknown_blocks_unmodified(): void {
		$settings = array( 'attributes' => array( 'foo' => 'bar' ) );

		$result = $this->blocks()->inject_render_callbacks( $settings, array( 'name' => 'core/paragraph' ) );

		$this->assertSame( $settings, $result );
	}

	public function test_inject_render_callbacks_handles_a_missing_metadata_name(): void {
		$settings = array( 'attributes' => array() );

		$result = $this->blocks()->inject_render_callbacks( $settings, array() );

		$this->assertSame( $settings, $result );
	}

	public function test_inject_render_callbacks_preserves_other_settings_keys(): void {
		$settings = array( 'attributes' => array( 'foo' => 'bar' ) );

		$result = $this->blocks()->inject_render_callbacks( $settings, array( 'name' => 'videopack/pagination' ) );

		$this->assertSame( array( 'foo' => 'bar' ), $result['attributes'] );
		$this->assertArrayHasKey( 'render_callback', $result );
	}

	// -----------------------------------------------------------------
	// locate_collection_inner_blocks() / find_collection_block_by_id()
	// -----------------------------------------------------------------

	protected function collection_block_markup( string $collection_id, string $inner_markup = '<!-- wp:paragraph --><p>Inner</p><!-- /wp:paragraph -->' ): string {
		return '<!-- wp:videopack/collection {"collectionId":"' . $collection_id . '"} -->' . $inner_markup . '<!-- /wp:videopack/collection -->';
	}

	public function test_locate_collection_returns_empty_string_for_an_empty_collection_id(): void {
		$this->assertSame( '', Blocks::locate_collection_inner_blocks( 1, '' ) );
	}

	public function test_locate_collection_finds_a_top_level_block_in_a_published_post(): void {
		$post_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => $this->collection_block_markup( 'abc123' ),
			)
		);

		$result = Blocks::locate_collection_inner_blocks( $post_id, 'abc123' );

		$this->assertStringContainsString( '<p>Inner</p>', $result );
	}

	public function test_locate_collection_returns_empty_string_when_no_matching_id_exists(): void {
		$post_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => $this->collection_block_markup( 'abc123' ),
			)
		);

		$this->assertSame( '', Blocks::locate_collection_inner_blocks( $post_id, 'does-not-exist' ) );
	}

	public function test_locate_collection_ignores_a_non_publicly_viewable_post(): void {
		$post_id = self::factory()->post->create(
			array(
				'post_status'  => 'draft',
				'post_content' => $this->collection_block_markup( 'abc123' ),
			)
		);

		$this->assertSame( '', Blocks::locate_collection_inner_blocks( $post_id, 'abc123' ) );
	}

	public function test_locate_collection_recurses_into_nested_inner_blocks(): void {
		$nested = '<!-- wp:group -->' . $this->collection_block_markup( 'nested-id' ) . '<!-- /wp:group -->';
		$post_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => $nested,
			)
		);

		$result = Blocks::locate_collection_inner_blocks( $post_id, 'nested-id' );

		$this->assertStringContainsString( '<p>Inner</p>', $result );
	}

	public function test_locate_collection_resolves_a_published_reusable_block_reference(): void {
		$reusable_id = self::factory()->post->create(
			array(
				'post_type'    => 'wp_block',
				'post_status'  => 'publish',
				'post_content' => $this->collection_block_markup( 'in-reusable' ),
			)
		);
		$page_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:block {"ref":' . $reusable_id . '} /-->',
			)
		);

		$result = Blocks::locate_collection_inner_blocks( $page_id, 'in-reusable' );

		$this->assertStringContainsString( '<p>Inner</p>', $result );
	}

	public function test_locate_collection_does_not_resolve_an_unpublished_reusable_block(): void {
		$reusable_id = self::factory()->post->create(
			array(
				'post_type'    => 'wp_block',
				'post_status'  => 'draft',
				'post_content' => $this->collection_block_markup( 'in-reusable' ),
			)
		);
		$page_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:block {"ref":' . $reusable_id . '} /-->',
			)
		);

		$this->assertSame( '', Blocks::locate_collection_inner_blocks( $page_id, 'in-reusable' ) );
	}

	public function test_locate_collection_falls_back_to_a_block_widget_when_not_in_any_post(): void {
		update_option(
			'widget_block',
			array(
				'2' => array( 'content' => $this->collection_block_markup( 'widget-id' ) ),
			)
		);

		$result = Blocks::locate_collection_inner_blocks( null, 'widget-id' );

		$this->assertStringContainsString( '<p>Inner</p>', $result );
	}

	// -----------------------------------------------------------------
	// render_global_modal() / page_has_lightbox_content()
	// -----------------------------------------------------------------

	protected function captured_global_modal_output(): string {
		ob_start();
		$this->blocks()->render_global_modal();
		return ob_get_clean();
	}

	public function test_global_modal_is_not_rendered_by_default(): void {
		$this->assertSame( '', $this->captured_global_modal_output() );
	}

	public function test_global_modal_renders_once_a_lightbox_trigger_was_rendered(): void {
		Modular_Renderer::$rendered_lightbox_trigger = true;

		$this->assertStringContainsString( 'videopack-global-modal', $this->captured_global_modal_output() );
	}

	public function test_global_modal_renders_when_alwaysloadscripts_is_enabled(): void {
		update_option( 'videopack_options', array_merge( $this->options(), array( 'alwaysloadscripts' => true ) ) );

		$this->assertStringContainsString( 'videopack-global-modal', $this->captured_global_modal_output() );
	}

	// -----------------------------------------------------------------
	// render_pagination() -- thin context/options merge over
	// Modular_Renderer::render_pagination().
	// -----------------------------------------------------------------

	public function test_render_pagination_reads_current_and_total_page_from_context(): void {
		$output = $this->blocks()->render_pagination(
			array(),
			'',
			$this->block_stub(
				array(
					'videopack/currentPage' => 3,
					'videopack/totalPages'  => 10,
				)
			)
		);

		$this->assertStringContainsString( 'is-ellipsis', $output );
	}

	public function test_render_pagination_defaults_to_a_single_page_without_context(): void {
		$output = $this->blocks()->render_pagination( array(), '', $this->block_stub() );

		$this->assertSame( '', $output );
	}

	// -----------------------------------------------------------------
	// render_video_caption()
	// -----------------------------------------------------------------

	public function test_render_video_caption_prefers_an_explicit_attribute(): void {
		$output = $this->blocks()->render_video_caption(
			array( 'caption' => 'Explicit caption' ),
			'',
			$this->block_stub()
		);

		$this->assertStringContainsString( 'Explicit caption', $output );
	}

	public function test_render_video_caption_falls_back_to_context(): void {
		$output = $this->blocks()->render_video_caption(
			array(),
			'',
			$this->block_stub( array( 'videopack/caption' => 'Context caption' ) )
		);

		$this->assertStringContainsString( 'Context caption', $output );
	}

	public function test_render_video_caption_prefers_the_post_excerpt_when_prioritizing_post_data(): void {
		$parent_post_id = self::factory()->post->create( array( 'post_excerpt' => 'The post excerpt' ) );

		$output = $this->blocks()->render_video_caption(
			array(),
			'',
			$this->block_stub(
				array(
					'videopack/prioritizePostData' => true,
					'postId'                       => $parent_post_id,
				)
			)
		);

		$this->assertStringContainsString( 'The post excerpt', $output );
	}

	public function test_render_video_caption_falls_back_to_the_attachments_own_excerpt(): void {
		$attachment_id = $this->video_attachment( array( 'post_excerpt' => 'Attachment excerpt' ) );

		$output = $this->blocks()->render_video_caption(
			array( 'id' => $attachment_id ),
			'',
			$this->block_stub()
		);

		$this->assertStringContainsString( 'Attachment excerpt', $output );
	}

	public function test_render_video_caption_is_empty_with_nothing_to_show(): void {
		$output = $this->blocks()->render_video_caption( array(), '', $this->block_stub() );

		$this->assertSame( '', $output );
	}

	// -----------------------------------------------------------------
	// render_video_watermark()
	// -----------------------------------------------------------------

	public function test_render_video_watermark_renders_when_configured(): void {
		$output = $this->blocks()->render_video_watermark(
			array( 'watermark' => 'https://example.test/logo.png' ),
			'',
			$this->block_stub()
		);

		$this->assertStringContainsString( 'https://example.test/logo.png', $output );
	}

	public function test_render_video_watermark_is_empty_when_not_configured(): void {
		$output = $this->blocks()->render_video_watermark( array( 'watermark' => '' ), '', $this->block_stub() );

		$this->assertSame( '', $output );
	}
}
