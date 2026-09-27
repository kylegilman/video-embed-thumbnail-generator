<?php
/**
 * Tests for Assets -- admin-side script/style registration and enqueuing,
 * the frontend page-content scan that gates conditional asset loading, and
 * the late wp_footer safety net for styles enqueued too late for wp_head.
 * Previously completely untested.
 *
 * Three of this class's methods -- page_needs_video_assets(),
 * localize_videopack_config(), and bootstrap_block_editor_definitions() --
 * each memoize their result in a
 * function-local `static` variable -- which, in PHP, is shared across every
 * instance and every call to that method for the lifetime of the process,
 * not per-object. A PHPUnit run executes all test methods in one process,
 * so the first call to any of these methods anywhere in the suite would
 * otherwise permanently freeze the result for every later test. Tests that
 * exercise their real branching logic run with @runInSeparateProcess to get
 * a fresh process (and therefore a fresh static) each time.
 */

use Videopack\Admin\Assets;
use Videopack\Admin\Formats\Registry;

class AssetsTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function assets( array $overrides = array() ): Assets {
		return new Assets( $this->options( $overrides ) );
	}

	protected function page_needs_video_assets( Assets $assets ): bool {
		$method = new ReflectionMethod( $assets, 'page_needs_video_assets' );
		$method->setAccessible( true );
		return $method->invoke( $assets );
	}

	// -----------------------------------------------------------------
	// get_actions() / get_filters()
	// -----------------------------------------------------------------

	public function test_get_actions_declares_only_real_callback_methods(): void {
		$assets = $this->assets();
		foreach ( $assets->get_actions() as $action ) {
			$this->assertArrayHasKey( 'hook', $action );
			$this->assertArrayHasKey( 'callback', $action );
			$this->assertTrue(
				method_exists( $assets, $action['callback'] ),
				"Assets::{$action['callback']}() does not exist (declared for hook '{$action['hook']}')"
			);
		}
	}

	public function test_get_filters_declares_only_real_callback_methods(): void {
		$assets = $this->assets();
		foreach ( $assets->get_filters() as $filter ) {
			$this->assertArrayHasKey( 'hook', $filter );
			$this->assertArrayHasKey( 'callback', $filter );
			$this->assertTrue(
				method_exists( $assets, $filter['callback'] ),
				"Assets::{$filter['callback']}() does not exist (declared for hook '{$filter['hook']}')"
			);
		}
	}

	public function test_get_actions_registers_register_assets_early_on_init(): void {
		$actions = $this->assets()->get_actions();
		$match   = current(
			array_filter(
				$actions,
				static function ( $action ) {
					return 'register_assets' === $action['callback'];
				}
			)
		);

		$this->assertSame( 'init', $match['hook'] );
		$this->assertSame( 5, $match['priority'] );
	}

	public function test_get_filters_exposes_page_needs_video_assets_for_addons(): void {
		$filters = $this->assets()->get_filters();
		$match   = current(
			array_filter(
				$filters,
				static function ( $filter ) {
					return 'videopack_page_needs_video_assets' === $filter['hook'];
				}
			)
		);

		$this->assertSame( 'filter_page_needs_video_assets', $match['callback'] );
	}

	// -----------------------------------------------------------------
	// filter_page_needs_video_assets()
	// -----------------------------------------------------------------

	/**
	 * An already-true value must short-circuit before page_needs_video_assets()
	 * is ever called -- verified by never touching its once-per-process cache
	 * here, which a real invocation would permanently pin to a value for
	 * every later test in this process.
	 */
	public function test_filter_page_needs_video_assets_short_circuits_when_already_true(): void {
		$this->assertTrue( $this->assets()->filter_page_needs_video_assets( true ) );
	}

	/**
	 * Proves the false branch really delegates rather than being hardcoded.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_filter_page_needs_video_assets_delegates_when_false(): void {
		$this->assertFalse( $this->assets()->filter_page_needs_video_assets( false ) );
	}

	// -----------------------------------------------------------------
	// page_needs_video_assets()
	// -----------------------------------------------------------------

	/**
	 * A non-video attachment page should not trigger video assets.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_page_needs_video_assets_is_false_for_a_plain_non_video_attachment_page(): void {
		$image_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'image.jpg',
				'post_mime_type' => 'image/jpeg',
			)
		);
		$this->go_to( (string) get_attachment_link( $image_id ) );

		$this->assertFalse( $this->page_needs_video_assets( $this->assets() ) );
	}

	/**
	 * Embed (oEmbed) responses always need the player.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_page_needs_video_assets_is_true_for_an_embed_request(): void {
		global $wp_query;
		$wp_query->is_embed = true;

		$this->assertTrue( $this->page_needs_video_assets( $this->assets() ) );
	}

	/**
	 * An attachment page for the video itself needs the player.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_page_needs_video_assets_is_true_for_a_video_attachment_page(): void {
		$video_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'video.mp4',
				'post_mime_type' => 'video/mp4',
			)
		);
		$this->go_to( (string) get_attachment_link( $video_id ) );

		$this->assertTrue( $this->page_needs_video_assets( $this->assets() ) );
	}

	/**
	 * A Videopack block comment is detected independently of has_shortcode().
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_page_needs_video_assets_is_true_for_a_videopack_block_comment(): void {
		self::factory()->post->create( array( 'post_content' => '<!-- wp:videopack/player {"id":1} /-->' ) );
		$this->go_to( home_url( '/' ) );

		$this->assertTrue( $this->page_needs_video_assets( $this->assets() ) );
	}

	/**
	 * The plugin's own shortcode always counts.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_page_needs_video_assets_is_true_for_the_videopack_shortcode(): void {
		self::factory()->post->create( array( 'post_content' => '[videopack id="1"]' ) );
		$this->go_to( home_url( '/' ) );

		$this->assertTrue( $this->page_needs_video_assets( $this->assets() ) );
	}

	/**
	 * Core's plain [video] shortcode only counts when this plugin has taken
	 * it over via the replace_video_shortcode option.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_page_needs_video_assets_ignores_a_plain_video_shortcode_by_default(): void {
		self::factory()->post->create( array( 'post_content' => '[video src="video.mp4"]' ) );
		$this->go_to( home_url( '/' ) );

		$this->assertFalse( $this->page_needs_video_assets( $this->assets() ) );
	}

	/**
	 * The opt-in counterpart of the test above.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_page_needs_video_assets_counts_the_video_shortcode_when_the_option_is_enabled(): void {
		self::factory()->post->create( array( 'post_content' => '[video src="video.mp4"]' ) );
		$this->go_to( home_url( '/' ) );

		$assets = $this->assets( array( 'replace_video_shortcode' => true ) );

		$this->assertTrue( $this->page_needs_video_assets( $assets ) );
	}

	// -----------------------------------------------------------------
	// register_assets()
	// -----------------------------------------------------------------

	public function test_register_assets_registers_the_core_frontend_script(): void {
		$this->assets()->register_assets();

		$this->assertTrue( wp_script_is( 'videopack-core', 'registered' ) );
		$this->assertTrue( wp_style_is( 'videopack-core', 'registered' ) );
	}

	public function test_register_assets_does_not_set_translations_on_frontend_runtime_bundles(): void {
		global $wp_scripts;
		$this->assets()->register_assets();

		$this->assertFalse( isset( $wp_scripts->registered['videopack-core']->textdomain ) );
	}

	public function test_register_assets_sets_translations_on_admin_bundles(): void {
		global $wp_scripts;
		$this->assets()->register_assets();

		$this->assertSame( 'video-embed-thumbnail-generator', $wp_scripts->registered['videopack-settings']->textdomain );
	}

	public function test_register_assets_gives_the_media_library_bundle_its_extra_wp_media_dependencies(): void {
		global $wp_scripts;
		$this->assets()->register_assets();

		$deps = $wp_scripts->registered['videopack-media-library']->deps;
		$this->assertContains( 'media-views', $deps );
		$this->assertContains( 'media-models', $deps );
		$this->assertContains( 'media-editor', $deps );
	}

	// -----------------------------------------------------------------
	// print_late_enqueued_player_styles()
	// -----------------------------------------------------------------

	/**
	 * Uses its own dedicated handle registered as 'videopack-core' -- $wp_styles
	 * isn't reset between test methods in this suite, so two tests both
	 * printing the real 'videopack-core' handle would leak "done" state from
	 * whichever ran first.
	 */
	public function test_print_late_enqueued_player_styles_prints_a_pending_enqueued_style(): void {
		add_filter(
			'videopack_video_player',
			function () {
				return new class( $this->options() ) extends \Videopack\Frontend\Video_Players\Player {
					public function get_player_style_handles(): array {
						return array( 'test-pending-style' );
					}
				};
			}
		);
		wp_register_style( 'test-pending-style', false );
		wp_enqueue_style( 'test-pending-style' );

		$this->assertTrue( wp_style_is( 'test-pending-style', 'enqueued' ) );
		$this->assertFalse( wp_style_is( 'test-pending-style', 'done' ) );

		$this->assets()->print_late_enqueued_player_styles();
		remove_all_filters( 'videopack_video_player' );

		$this->assertTrue( wp_style_is( 'test-pending-style', 'done' ) );
	}

	public function test_print_late_enqueued_player_styles_ignores_a_style_that_was_never_enqueued(): void {
		add_filter(
			'videopack_video_player',
			function () {
				return new class( $this->options() ) extends \Videopack\Frontend\Video_Players\Player {
					public function get_player_style_handles(): array {
						return array( 'test-never-enqueued-style' );
					}
				};
			}
		);
		wp_register_style( 'test-never-enqueued-style', false );

		$this->assets()->print_late_enqueued_player_styles();
		remove_all_filters( 'videopack_video_player' );

		$this->assertFalse( wp_style_is( 'test-never-enqueued-style', 'done' ) );
	}

	// -----------------------------------------------------------------
	// localize_videopack_config() (private, exercised via its public callers)
	// -----------------------------------------------------------------

	/**
	 * The admin-context payload carries a full settings-UI config, not the
	 * lean frontend shape.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_admin_enqueue_assets_localizes_the_admin_config_shape(): void {
		set_current_screen( 'settings_page_video_embed_thumbnail_generator_settings' );
		$this->assets()->enqueue_admin_assets( 'settings_page_video_embed_thumbnail_generator_settings' );

		global $wp_scripts;
		$data = $wp_scripts->get_data( 'videopack-core', 'data' );

		$this->assertStringContainsString( 'var videopack_config', (string) $data );
		$this->assertStringNotContainsString( 'count_play_nonce', (string) $data );
	}

	/**
	 * The frontend-context payload carries the play-count/REST shape, not
	 * the admin settings-UI config.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_register_player_scripts_localizes_the_frontend_config_shape(): void {
		$this->assets()->register_player_scripts();

		global $wp_scripts;
		$data = $wp_scripts->get_data( 'videopack-core', 'data' );

		$this->assertStringContainsString( 'count_play_nonce', (string) $data );
		$this->assertStringContainsString( 'rest_url', (string) $data );
	}

	// -----------------------------------------------------------------
	// bootstrap_block_editor_definitions() (private, exercised via a caller)
	// -----------------------------------------------------------------

	/**
	 * Makes real block previews (useBlockPreview) work on the Media Library
	 * Attachment Details screen, which core never bootstraps on its own.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_enqueue_media_library_assets_attaches_the_block_bootstrap_inline_script(): void {
		$this->assets()->enqueue_media_library_assets();

		global $wp_scripts;
		$before = $wp_scripts->get_data( 'videopack-media-library', 'before' );

		$this->assertNotEmpty( $before );
		$this->assertStringContainsString( 'unstable__bootstrapServerSideBlockDefinitions', implode( '', (array) $before ) );
	}
}
