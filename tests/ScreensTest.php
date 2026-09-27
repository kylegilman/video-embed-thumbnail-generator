<?php
/**
 * Tests for Screens -- admin menu/page registration, media library columns
 * and filters, the attachment meta box save path, and the "which video
 * children does the Media Library show" query logic. Previously only
 * incidentally referenced (in doc comments of other test files), never
 * actually exercised.
 *
 * Scope note: this class is large (~800 lines, ~25 public methods). This
 * file covers the methods with real conditional logic and the ones most
 * prone to silent regressions (hide_video_children()'s query building,
 * filter_ajax_query_attachments(), save_meta_box_data()'s guards). Purely
 * static HTML dumps (add_contextual_help_tab()'s shortcode reference) are
 * already covered elsewhere (ShortcodeAttributesTest/ShortcodeLegacyCompatTest
 * document its content) and are not re-tested here. redirect_freemius_submenus()
 * calls `exit` on its redirecting branch, which would kill the test runner,
 * so only its non-redirecting guard branches are covered.
 */

use Videopack\Admin\Screens;
use Videopack\Admin\Formats\Registry;
use Videopack\Admin\Attachment_Meta;

class ScreensTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function screens( array $option_overrides = array() ): Screens {
		$options = $this->options( $option_overrides );
		return new Screens( $options, new Registry( $options ) );
	}

	public function tear_down() {
		set_current_screen( 'front' );
		$_GET     = array();
		$_POST    = array();
		$_REQUEST = array();
		remove_all_filters( 'posts_where' );
		parent::tear_down();
	}

	// -----------------------------------------------------------------
	// get_actions() / get_filters()
	// -----------------------------------------------------------------

	public function test_get_actions_declares_only_real_callback_methods(): void {
		$screens = $this->screens();
		foreach ( $screens->get_actions() as $action ) {
			$this->assertTrue(
				method_exists( $screens, $action['callback'] ),
				"Screens::{$action['callback']}() does not exist (declared for hook '{$action['hook']}')"
			);
		}
	}

	public function test_get_filters_declares_only_real_callback_methods(): void {
		$screens = $this->screens();
		foreach ( $screens->get_filters() as $filter ) {
			$this->assertTrue(
				method_exists( $screens, $filter['callback'] ),
				"Screens::{$filter['callback']}() does not exist (declared for hook '{$filter['hook']}')"
			);
		}
	}

	// -----------------------------------------------------------------
	// hide_freemius_submenu_items()
	// -----------------------------------------------------------------

	public function test_hide_freemius_submenu_items_always_returns_false(): void {
		$this->assertFalse( $this->screens()->hide_freemius_submenu_items( true, 'anything' ) );
	}

	// -----------------------------------------------------------------
	// redirect_freemius_submenus() -- non-redirecting guard branches only.
	// -----------------------------------------------------------------

	public function test_redirect_freemius_submenus_does_nothing_off_the_settings_screens(): void {
		global $pagenow;
		$pagenow      = 'edit.php';
		$_GET['page'] = 'video_embed_thumbnail_generator_settings-general';

		// No exception/exit means it returned early, as expected off options-general.php/settings.php.
		$this->screens()->redirect_freemius_submenus();
		$this->addToAssertionCount( 1 );
	}

	public function test_redirect_freemius_submenus_does_nothing_for_an_unrelated_page(): void {
		global $pagenow;
		$pagenow      = 'options-general.php';
		$_GET['page'] = 'some-other-plugin-page';

		$this->screens()->redirect_freemius_submenus();
		$this->addToAssertionCount( 1 );
	}

	// -----------------------------------------------------------------
	// plugin_action_links() / plugin_meta_links()
	// -----------------------------------------------------------------

	public function test_plugin_action_links_appends_a_settings_link(): void {
		$links = $this->screens()->plugin_action_links( array( '<a href="#">Existing</a>' ) );

		$this->assertCount( 2, $links );
		$this->assertStringContainsString( 'page=video_embed_thumbnail_generator_settings', $links[1] );
	}

	public function test_plugin_meta_links_appends_a_donate_link_only_for_this_plugin(): void {
		$screens = $this->screens();

		$matching = $screens->plugin_meta_links( array( 'Existing' ), VIDEOPACK_BASENAME );
		$this->assertCount( 2, $matching );
		$this->assertStringContainsString( 'videopack.video/donate', $matching[1] );

		$other = $screens->plugin_meta_links( array( 'Existing' ), 'some-other-plugin/some-other-plugin.php' );
		$this->assertSame( array( 'Existing' ), $other );
	}

	// -----------------------------------------------------------------
	// upgrade_notification()
	// -----------------------------------------------------------------

	public function test_upgrade_notification_prints_the_notice_when_present(): void {
		$plugin_data              = new stdClass();
		$new_data                 = new stdClass();
		$new_data->upgrade_notice = 'Important upgrade notice.';

		ob_start();
		$this->screens()->upgrade_notification( $plugin_data, $new_data );
		$output = ob_get_clean();

		$this->assertStringContainsString( 'Important upgrade notice.', $output );
		$this->assertStringContainsString( 'update-message', $output );
	}

	public function test_upgrade_notification_prints_nothing_when_absent(): void {
		$plugin_data              = new stdClass();
		$new_data                 = new stdClass();
		$new_data->upgrade_notice = '   ';

		ob_start();
		$this->screens()->upgrade_notification( $plugin_data, $new_data );
		$output = ob_get_clean();

		$this->assertSame( '', $output );
	}

	// -----------------------------------------------------------------
	// add_settings_page() / add_encode_queue_page() / add_meta_boxes()
	// -----------------------------------------------------------------

	public function test_add_settings_page_registers_a_real_options_submenu_entry(): void {
		self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );

		$this->screens()->add_settings_page();

		global $submenu;
		$slugs = array_column( $submenu['options-general.php'], 2 );
		$this->assertContains( 'video_embed_thumbnail_generator_settings', $slugs );
	}

	public function test_add_encode_queue_page_registers_a_real_tools_submenu_entry(): void {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		( new WP_User( $user_id ) )->add_cap( 'encode_videos' );
		wp_set_current_user( $user_id );

		$this->screens()->add_encode_queue_page();

		global $submenu;
		$slugs = array_column( $submenu['tools.php'], 2 );
		$this->assertContains( 'videopack_encode_queue', $slugs );
	}

	public function test_add_meta_boxes_registers_a_real_meta_box_for_attachments(): void {
		$this->screens()->add_meta_boxes();

		global $wp_meta_boxes;
		$this->assertArrayHasKey( 'videopack-meta-box', $wp_meta_boxes['attachment']['normal']['high'] );
	}

	// -----------------------------------------------------------------
	// add_video_columns() / add_query_vars() / add_grid_media_filter()
	// -----------------------------------------------------------------

	public function test_add_video_columns_adds_the_video_stats_column(): void {
		$cols = $this->screens()->add_video_columns( array( 'title' => 'Title' ) );

		$this->assertArrayHasKey( 'video_stats', $cols );
		$this->assertArrayHasKey( 'title', $cols );
	}

	public function test_add_query_vars_adds_both_videopack_vars(): void {
		$vars = $this->screens()->add_query_vars( array( 'existing' ) );

		$this->assertContains( 'videopack_filter', $vars );
		$this->assertContains( 'videopack_parent_id', $vars );
	}

	public function test_add_grid_media_filter_adds_both_mime_type_entries(): void {
		$settings = $this->screens()->add_grid_media_filter( array( 'mimeTypes' => array() ) );

		$this->assertArrayHasKey( 'videopack_child_formats', $settings['mimeTypes'] );
		$this->assertArrayHasKey( 'videopack_remote_videos', $settings['mimeTypes'] );
	}

	// -----------------------------------------------------------------
	// filter_ajax_query_attachments()
	// -----------------------------------------------------------------

	public function test_filter_ajax_query_attachments_maps_child_formats_mime_type(): void {
		$query = $this->screens()->filter_ajax_query_attachments( array( 'post_mime_type' => 'videopack_child_formats' ) );

		$this->assertSame( 'video', $query['post_mime_type'] );
		$this->assertSame( 'only_children', $query['videopack_filter'] );
	}

	public function test_filter_ajax_query_attachments_maps_remote_videos_mime_type(): void {
		$query = $this->screens()->filter_ajax_query_attachments( array( 'post_mime_type' => 'videopack_remote_videos' ) );

		$this->assertSame( 'video', $query['post_mime_type'] );
		$this->assertSame( 'only_remote', $query['videopack_filter'] );
	}

	public function test_filter_ajax_query_attachments_leaves_an_unrelated_mime_type_alone(): void {
		$query = $this->screens()->filter_ajax_query_attachments( array( 'post_mime_type' => 'image/jpeg' ) );

		$this->assertSame( 'image/jpeg', $query['post_mime_type'] );
		$this->assertArrayNotHasKey( 'videopack_filter', $query );
	}

	public function test_filter_ajax_query_attachments_ignores_post_data_without_a_valid_nonce(): void {
		$_POST['query'] = array( 'videopack_parent_id' => '42' );

		$query = $this->screens()->filter_ajax_query_attachments( array() );

		$this->assertArrayNotHasKey( 'videopack_parent_id', $query );
	}

	public function test_filter_ajax_query_attachments_reads_post_data_with_a_valid_nonce(): void {
		// check_ajax_referer() reads from $_REQUEST, which PHP only builds
		// from $_GET/$_POST once at bootstrap -- setting $_POST alone here,
		// mid-process, doesn't reach it.
		$_REQUEST['query-attachments-nonce'] = wp_create_nonce( 'query-attachments' );
		$_POST['query']                      = array(
			'videopack_parent_id' => '42',
			'videopack_filter'    => 'show_children',
		);

		$query = $this->screens()->filter_ajax_query_attachments( array() );

		$this->assertSame( 42, $query['videopack_parent_id'] );
		$this->assertSame( 'show_children', $query['videopack_filter'] );
	}

	// -----------------------------------------------------------------
	// prepare_attachment_for_js()
	// -----------------------------------------------------------------

	public function test_prepare_attachment_for_js_rewrites_filename_and_url_for_an_external_video(): void {
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'video/mp4' ) );
		update_post_meta( $attachment_id, '_kgflashmediaplayer-externalurl', 'https://example.test/remote/video.mp4' );

		$response = $this->screens()->prepare_attachment_for_js(
			array(
				'filename' => 'original.mp4',
				'url'      => 'https://this-site.test/wp-content/uploads/original.mp4',
			),
			get_post( $attachment_id ),
			array()
		);

		$this->assertStringContainsString( 'video.mp4', $response['filename'] );
		$this->assertSame( 'https://example.test/remote/video.mp4', $response['url'] );
	}

	public function test_prepare_attachment_for_js_leaves_a_local_attachment_unchanged(): void {
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'video/mp4' ) );

		$response = $this->screens()->prepare_attachment_for_js(
			array(
				'filename' => 'original.mp4',
				'url'      => 'https://this-site.test/wp-content/uploads/original.mp4',
			),
			get_post( $attachment_id ),
			array()
		);

		$this->assertSame( 'original.mp4', $response['filename'] );
	}

	// -----------------------------------------------------------------
	// filter_still_gifs_sql()
	// -----------------------------------------------------------------

	public function test_filter_still_gifs_sql_scopes_gifs_to_ones_with_a_video_child(): void {
		global $wpdb;
		add_filter( 'posts_where', array( $this->screens(), 'filter_still_gifs_sql' ) );

		$where = $this->screens()->filter_still_gifs_sql( "AND {$wpdb->posts}.post_mime_type = 'image/gif'" );

		$this->assertStringContainsString( 'SELECT DISTINCT post_parent', $where );
		$this->assertStringContainsString( "post_mime_type LIKE 'video/%'", $where );
	}

	public function test_filter_still_gifs_sql_removes_itself_after_running_once(): void {
		$screens = $this->screens();
		add_filter( 'posts_where', array( $screens, 'filter_still_gifs_sql' ) );

		$screens->filter_still_gifs_sql( 'AND 1=1' );

		$this->assertFalse( has_filter( 'posts_where', array( $screens, 'filter_still_gifs_sql' ) ) );
	}

	public function test_filter_still_gifs_sql_leaves_unrelated_where_clauses_alone(): void {
		$where = $this->screens()->filter_still_gifs_sql( 'AND 1=1' );

		$this->assertSame( 'AND 1=1', $where );
	}

	// -----------------------------------------------------------------
	// hide_video_children()
	// -----------------------------------------------------------------

	protected function query_with_vars( array $vars ): WP_Query {
		$query = new WP_Query();
		$query->parse_query( $vars );
		return $query;
	}

	public function test_hide_video_children_does_nothing_outside_the_admin(): void {
		$query = $this->query_with_vars( array( 'post_type' => 'attachment' ) );

		$this->screens()->hide_video_children( $query );

		$this->assertSame( '', $query->get( 'meta_query' ) );
	}

	public function test_hide_video_children_does_nothing_for_a_non_attachment_query(): void {
		set_current_screen( 'upload' );
		$query = $this->query_with_vars( array( 'post_type' => 'post' ) );

		$this->screens()->hide_video_children( $query );

		$this->assertSame( '', $query->get( 'meta_query' ) );
	}

	public function test_hide_video_children_does_nothing_without_upload_files_capability(): void {
		set_current_screen( 'upload' );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'subscriber' ) ) );
		$query = $this->query_with_vars( array( 'post_type' => 'attachment' ) );

		$this->screens()->hide_video_children( $query );

		$this->assertSame( '', $query->get( 'meta_query' ) );
	}

	public function test_hide_video_children_hides_child_formats_by_default(): void {
		set_current_screen( 'upload' );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		$query = $this->query_with_vars(
			array(
				'post_type'      => 'attachment',
				'posts_per_page' => 20,
			)
		);

		$this->screens()->hide_video_children( $query );

		$meta_query = $query->get( 'meta_query' );
		$this->assertSame( 'AND', $meta_query['relation'] );
		$this->assertContains(
			array(
				'key'     => '_kgflashmediaplayer-format',
				'compare' => 'NOT EXISTS',
			),
			$meta_query
		);
	}

	public function test_hide_video_children_only_children_filter_shows_only_children(): void {
		set_current_screen( 'upload' );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		$_GET['videopack_filter'] = 'only_children';
		$query                    = $this->query_with_vars( array( 'post_type' => 'attachment' ) );

		$this->screens()->hide_video_children( $query );

		$meta_query = $query->get( 'meta_query' );
		$this->assertContains(
			array(
				'key'     => '_kgflashmediaplayer-format',
				'compare' => 'EXISTS',
			),
			$meta_query
		);
	}

	public function test_hide_video_children_only_remote_filter_scopes_to_remote_videos(): void {
		set_current_screen( 'upload' );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		$_GET['videopack_filter'] = 'only_remote';
		$query                    = $this->query_with_vars( array( 'post_type' => 'attachment' ) );

		$this->screens()->hide_video_children( $query );

		$meta_query = $query->get( 'meta_query' );
		$this->assertTrue( $this->meta_query_has_key( $meta_query, '_kgflashmediaplayer-externalurl' ) );
	}

	/**
	 * Searches a meta_query array (which can nest OR/AND sub-groups one
	 * level deep) for a clause matching the given meta key.
	 */
	protected function meta_query_has_key( array $meta_query, string $key ): bool {
		foreach ( $meta_query as $clause ) {
			if ( ! is_array( $clause ) ) {
				continue;
			}
			if ( ( $clause['key'] ?? null ) === $key ) {
				return true;
			}
			if ( $this->meta_query_has_key( $clause, $key ) ) {
				return true;
			}
		}
		return false;
	}

	public function test_hide_video_children_show_children_requires_a_parent_id(): void {
		set_current_screen( 'upload' );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		$_GET['videopack_filter'] = 'show_children';
		$query                    = $this->query_with_vars( array( 'post_type' => 'attachment' ) );

		$this->screens()->hide_video_children( $query );

		$this->assertSame( '', $query->get( 'meta_query' ) );
	}

	public function test_hide_video_children_show_children_with_a_parent_id_scopes_to_that_parent(): void {
		set_current_screen( 'upload' );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		$parent_id = self::factory()->post->create();
		$query     = $this->query_with_vars(
			array(
				'post_type'           => 'attachment',
				'videopack_parent_id' => $parent_id,
			)
		);

		$this->screens()->hide_video_children( $query );

		$meta_query = $query->get( 'meta_query' );
		$found      = false;
		foreach ( $meta_query as $clause ) {
			if ( is_array( $clause ) && isset( $clause['relation'] ) && 'OR' === $clause['relation'] ) {
				foreach ( $clause as $sub_clause ) {
					if ( is_array( $sub_clause ) && ( $sub_clause['key'] ?? null ) === '_kgflashmediaplayer-parent' ) {
						$this->assertSame( (string) $parent_id, (string) $sub_clause['value'] );
						$found = true;
					}
				}
			}
		}
		$this->assertTrue( $found );
	}

	// -----------------------------------------------------------------
	// add_media_filter_dropdown()
	// -----------------------------------------------------------------

	public function test_add_media_filter_dropdown_renders_on_the_upload_screen(): void {
		set_current_screen( 'upload' );

		ob_start();
		$this->screens()->add_media_filter_dropdown();
		$output = ob_get_clean();

		$this->assertStringContainsString( 'name="videopack_filter"', $output );
	}

	public function test_add_media_filter_dropdown_renders_nothing_off_the_upload_screen(): void {
		set_current_screen( 'edit-post' );

		ob_start();
		$this->screens()->add_media_filter_dropdown();
		$output = ob_get_clean();

		$this->assertSame( '', $output );
	}

	// -----------------------------------------------------------------
	// save_meta_box_data()
	// -----------------------------------------------------------------

	protected function attachment_with_meta_saved( array $overrides = array() ): array {
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'video/mp4' ) );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );

		$_POST['videopack_meta_box_nonce'] = wp_create_nonce( 'videopack_save_meta_box' );
		$_POST['videopack_meta_json']      = wp_json_encode( array_merge( array( 'gallery_orderby' => 'title' ), $overrides ) );

		return array( $attachment_id );
	}

	public function test_save_meta_box_data_ignores_a_missing_nonce(): void {
		$attachment_id = self::factory()->attachment->create_object( array( 'post_mime_type' => 'video/mp4' ) );
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		$_POST['videopack_meta_json'] = wp_json_encode( array( 'gallery_orderby' => 'title' ) );

		$this->screens()->save_meta_box_data( $attachment_id );

		$this->assertNotSame( 'title', ( new Attachment_Meta( $this->options(), $attachment_id ) )->get()['gallery_orderby'] ?? null );
	}

	public function test_save_meta_box_data_ignores_a_user_without_edit_permission(): void {
		list( $attachment_id ) = $this->attachment_with_meta_saved();
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'subscriber' ) ) );

		$this->screens()->save_meta_box_data( $attachment_id );

		$this->assertNotSame( 'title', ( new Attachment_Meta( $this->options(), $attachment_id ) )->get()['gallery_orderby'] ?? null );
	}

	public function test_save_meta_box_data_saves_sanitized_meta_with_valid_nonce_and_permission(): void {
		list( $attachment_id ) = $this->attachment_with_meta_saved();

		$this->screens()->save_meta_box_data( $attachment_id );

		$this->assertSame( 'title', ( new Attachment_Meta( $this->options(), $attachment_id ) )->get()['gallery_orderby'] );
	}
}
