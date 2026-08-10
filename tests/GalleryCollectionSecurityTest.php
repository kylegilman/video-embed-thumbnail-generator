<?php
/**
 * Regression coverage for the video_gallery REST pagination security fix:
 * the client must never be able to inject an arbitrary block tree, while a
 * real, saved Collection block instance (identified by its persisted
 * collectionId) must still resolve its genuinely custom content, and the
 * [videopack] shortcode's own template must keep full atts parity.
 */

use Videopack\Frontend\Blocks;
use Videopack\Frontend\Gallery;
use Videopack\Frontend\Shortcode;

class GalleryCollectionSecurityTest extends WP_UnitTestCase {

	/**
	 * A real uploaded video attachment, needed so the collection's video
	 * query (Gallery::get_gallery_videos()) actually returns a result --
	 * Blocks::render_collection() returns '' early on an empty query,
	 * regardless of inner_blocks content, so any test asserting on rendered
	 * wrapper markup needs at least one real match. Referencing it via
	 * 'gallery_include' (a real, documented shortcode/block attribute --
	 * see Gallery.php's gallery_include handling, which unsets the
	 * post_parent filter explicitly) guarantees a match regardless of
	 * gallery_id/parent, the same mechanism ShortcodeAttributesTest already
	 * relies on.
	 *
	 * @var int
	 */
	protected static $attachment_id;

	public static function wpSetUpBeforeClass( $factory ) {
		$file                = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4';
		self::$attachment_id = $factory->attachment->create_upload_object( $file );
	}

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	// -----------------------------------------------------------------
	// Blocks::locate_collection_inner_blocks()
	// -----------------------------------------------------------------

	public function test_locate_finds_instance_by_id_including_non_videopack_block() {
		$post_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:videopack/collection {"collectionId":"vp_abc123"} -->' .
					'<!-- wp:videopack/loop -->' .
					'<!-- wp:core/paragraph --><p>Custom editorial content</p><!-- /wp:core/paragraph -->' .
					'<!-- /wp:videopack/loop -->' .
					'<!-- /wp:videopack/collection -->',
			)
		);

		$result = Blocks::locate_collection_inner_blocks( $post_id, 'vp_abc123' );

		// serialize_blocks() renders core/* blocks using WP's namespace-
		// omitted shorthand ('wp:paragraph', not 'wp:core/paragraph').
		$this->assertStringContainsString( 'wp:paragraph', $result );
		$this->assertStringContainsString( 'Custom editorial content', $result );
	}

	public function test_locate_selects_correct_instance_among_multiple() {
		$post_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:videopack/collection {"collectionId":"vp_first"} --><!-- wp:videopack/loop --><!-- wp:core/paragraph --><p>First</p><!-- /wp:core/paragraph --><!-- /wp:videopack/loop --><!-- /wp:videopack/collection -->' .
					'<!-- wp:videopack/collection {"collectionId":"vp_second"} --><!-- wp:videopack/loop --><!-- wp:core/paragraph --><p>Second</p><!-- /wp:core/paragraph --><!-- /wp:videopack/loop --><!-- /wp:videopack/collection -->',
			)
		);

		$result = Blocks::locate_collection_inner_blocks( $post_id, 'vp_second' );

		$this->assertStringContainsString( 'Second', $result );
		$this->assertStringNotContainsString( 'First', $result );
	}

	public function test_locate_returns_empty_string_for_unknown_id() {
		$post_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:videopack/collection {"collectionId":"vp_real"} --><!-- wp:videopack/loop --><!-- /wp:videopack/loop --><!-- /wp:videopack/collection -->',
			)
		);

		$this->assertSame( '', Blocks::locate_collection_inner_blocks( $post_id, 'vp_does_not_exist' ) );
	}

	public function test_locate_returns_empty_string_when_post_has_no_collection_blocks() {
		$post_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:paragraph --><p>Nothing here</p><!-- /wp:paragraph -->',
			)
		);

		$this->assertSame( '', Blocks::locate_collection_inner_blocks( $post_id, 'vp_anything' ) );
	}

	public function test_locate_returns_empty_string_for_nonexistent_post() {
		$this->assertSame( '', Blocks::locate_collection_inner_blocks( 999999, 'vp_anything' ) );
	}

	public function test_locate_returns_empty_string_for_draft_post_even_with_matching_id() {
		$post_id = self::factory()->post->create(
			array(
				'post_status'  => 'draft',
				'post_content' => '<!-- wp:videopack/collection {"collectionId":"vp_secret"} --><!-- wp:videopack/loop --><!-- wp:core/paragraph --><p>Should not leak</p><!-- /wp:core/paragraph --><!-- /wp:videopack/loop --><!-- /wp:videopack/collection -->',
			)
		);

		$this->assertSame( '', Blocks::locate_collection_inner_blocks( $post_id, 'vp_secret' ) );
	}

	public function test_locate_resolves_through_reusable_block_reference() {
		$reusable_id = self::factory()->post->create(
			array(
				'post_type'    => 'wp_block',
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:videopack/collection {"collectionId":"vp_nested"} --><!-- wp:videopack/loop --><!-- wp:core/paragraph --><p>Inside a reusable block</p><!-- /wp:core/paragraph --><!-- /wp:videopack/loop --><!-- /wp:videopack/collection -->',
			)
		);

		$post_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => sprintf( '<!-- wp:block {"ref":%d} /-->', $reusable_id ),
			)
		);

		$result = Blocks::locate_collection_inner_blocks( $post_id, 'vp_nested' );

		$this->assertStringContainsString( 'Inside a reusable block', $result );
	}

	public function test_locate_finds_instance_in_block_based_widget() {
		update_option(
			'widget_block',
			array(
				2 => array(
					'content' => '<!-- wp:videopack/collection {"collectionId":"vp_widget_instance"} --><!-- wp:videopack/loop --><!-- wp:core/paragraph --><p>Widget area content</p><!-- /wp:core/paragraph --><!-- /wp:videopack/loop --><!-- /wp:videopack/collection -->',
				),
			)
		);

		$result = Blocks::locate_collection_inner_blocks( null, 'vp_widget_instance' );

		$this->assertStringContainsString( 'Widget area content', $result );

		delete_option( 'widget_block' );
	}

	// -----------------------------------------------------------------
	// Gallery::collection_page()
	// -----------------------------------------------------------------

	public function test_collection_page_uses_trusted_lookup_when_collection_id_matches_saved_instance() {
		$post_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:videopack/collection {"collectionId":"vp_trusted"} --><!-- wp:videopack/loop --><!-- wp:core/paragraph --><p>Trusted arbitrary block</p><!-- /wp:core/paragraph --><!-- /wp:videopack/loop --><!-- /wp:videopack/collection -->',
			)
		);

		$gallery = new Gallery( $this->options() );
		$result  = $gallery->collection_page(
			1,
			array(
				'collectionId'       => 'vp_trusted',
				'collection_post_id' => $post_id,
				// Guarantees the shared fixture attachment matches --
				// render_collection() returns '' early on an empty video
				// query, independent of which inner_blocks source is in play.
				'gallery_include'    => (string) self::$attachment_id,
			)
		);

		$this->assertIsArray( $result );
		$this->assertStringContainsString( 'Trusted arbitrary block', $result['html'] );
	}

	public function test_collection_page_returns_wp_error_when_collection_id_cannot_be_located() {
		$gallery = new Gallery( $this->options() );
		$result  = $gallery->collection_page(
			1,
			array(
				'collectionId'       => 'vp_nonexistent',
				'collection_post_id' => 0,
			)
		);

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_gallery_instance_not_found', $result->get_error_code() );
	}

	public function test_collection_page_rebuilds_from_atts_with_full_parity_when_collection_id_absent() {
		$gallery = new Gallery( $this->options() );
		$result  = $gallery->collection_page(
			1,
			array(
				'layout'          => 'list',
				'downloadlink'    => true,
				'embedcode'       => true,
				'watermark'       => 'https://example.com/w.png',
				'gallery_include' => (string) self::$attachment_id,
			),
			'list'
		);

		// do_blocks() fully renders the template into final markup, so this
		// asserts on the rendered output (matching the pattern
		// ShortcodeAttributesTest already uses), not raw block comments.
		$this->assertIsArray( $result );
		$this->assertStringContainsString( 'videopack-download-link', $result['html'] );
		$this->assertStringContainsString( 'videopack-share', $result['html'] );
		$this->assertStringContainsString( 'videopack-video-watermark', $result['html'] );
	}

	public function test_collection_page_ignores_legacy_inner_blocks_template_and_forged_id() {
		$other_post_id = self::factory()->post->create(
			array(
				'post_status'  => 'publish',
				'post_content' => '<!-- wp:videopack/collection {"collectionId":"vp_unrelated"} --><!-- wp:videopack/loop --><!-- wp:core/paragraph --><p>Should never appear</p><!-- /wp:core/paragraph --><!-- /wp:videopack/loop --><!-- /wp:videopack/collection -->',
			)
		);

		$gallery = new Gallery( $this->options() );
		$result  = $gallery->collection_page(
			1,
			array(
				// No collectionId submitted -- this is the shortcode-style
				// path. A legacy inner_blocks_template and an unrelated id
				// are both structurally unread now, not merely unvalidated.
				'inner_blocks_template' => wp_json_encode(
					array(
						array(
							'blockName' => 'core/shortcode',
							'attrs'     => array(),
							'innerHTML' => '[malicious]',
						),
					)
				),
				'id'                    => $other_post_id,
				'gallery_include'       => (string) self::$attachment_id,
			)
		);

		$this->assertIsArray( $result );
		$this->assertStringNotContainsString( 'core/shortcode', $result['html'] );
		$this->assertStringNotContainsString( 'Should never appear', $result['html'] );
	}

	// -----------------------------------------------------------------
	// Public_Controller: dead sanitizer code actually removed
	// -----------------------------------------------------------------

	public function test_sanitize_methods_no_longer_exist() {
		$this->assertFalse( method_exists( \Videopack\Admin\REST\Public_Controller::class, 'sanitize_inner_blocks_template' ) );
		$this->assertFalse( method_exists( \Videopack\Admin\REST\Public_Controller::class, 'sanitize_blocks_recursive' ) );
	}

	public function test_get_gallery_args_no_longer_declares_inner_blocks_template() {
		$reflection = new ReflectionClass( \Videopack\Admin\REST\Public_Controller::class );
		$method     = $reflection->getMethod( 'get_gallery_args' );
		$method->setAccessible( true );

		$controller = $reflection->newInstanceWithoutConstructor();
		$args       = $method->invoke( $controller );

		$this->assertArrayNotHasKey( 'inner_blocks_template', $args );
		$this->assertArrayHasKey( 'collection_post_id', $args );
	}

	// -----------------------------------------------------------------
	// Shortcode::build_default_inner_blocks() extraction sanity
	// -----------------------------------------------------------------

	public function test_build_default_inner_blocks_grid_layout() {
		$result = Shortcode::build_default_inner_blocks(
			array(
				'gallery_title' => true,
				'showDuration'  => true,
			),
			true
		);

		$this->assertStringContainsString( 'wp:videopack/thumbnail', $result );
		$this->assertStringContainsString( 'wp:videopack/play-button', $result );
		$this->assertStringContainsString( 'wp:videopack/title', $result );
		$this->assertStringContainsString( 'wp:videopack/duration', $result );
	}

	public function test_build_default_inner_blocks_list_layout_with_downloadlink() {
		$result = Shortcode::build_default_inner_blocks(
			array(
				'downloadlink' => true,
				'embedcode'    => true,
				'watermark'    => 'https://example.com/w.png',
				'view_count'   => true,
			),
			false
		);

		$this->assertStringContainsString( 'wp:videopack/player-container', $result );
		$this->assertStringContainsString( 'wp:videopack/download', $result );
		$this->assertStringContainsString( 'wp:videopack/share', $result );
		$this->assertStringContainsString( 'wp:videopack/watermark', $result );
		$this->assertStringContainsString( 'wp:videopack/view-count', $result );
	}

	public function test_shortcode_do_still_produces_matching_output_for_gallery() {
		$shortcode = new Shortcode( $this->options() );
		$output    = $shortcode->do(
			array(
				'gallery'         => 'true',
				'gallery_include' => (string) self::$attachment_id,
			)
		);

		$this->assertStringContainsString( 'videopack-collection-wrapper', $output );
	}
}
