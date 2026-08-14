<?php
/**
 * Tests for Multisite -- network-wide option merging, validation, the
 * local-option override precedence, and the is_multisite() gates that
 * control whether any of this ever runs at all. Previously completely
 * untested despite real logic.
 *
 * This file runs under both phpunit.xml (single-site) and
 * phpunit-multisite.xml (real multisite -- see that file's own comment
 * for why: switch_to_blog()/restore_current_blog() are only defined once
 * WordPress core loads its multisite files, so code that depends on them,
 * e.g. add_new_blog(), can't be meaningfully exercised any other way).
 * Tests whose whole point is a specific is_multisite() branch
 * self-skip when run under the environment that can't reach that branch,
 * rather than asserting something that isn't actually being tested.
 */

use Videopack\Admin\Multisite;

class MultisiteTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function multisite( array $options = array() ): Multisite {
		return new Multisite( $this->options( $options ) );
	}

	public function tear_down() {
		delete_site_option( 'videopack_network_options' );
		delete_site_option( 'kgvid_video_embed_network_options' );
		parent::tear_down();
	}

	// -----------------------------------------------------------------
	// is_multisite() guards.
	// -----------------------------------------------------------------

	public function test_get_actions_empty_when_not_multisite(): void {
		if ( is_multisite() ) {
			$this->markTestSkipped( 'Only meaningful under phpunit.xml (single-site); run via npm run test:php.' );
		}
		$this->assertSame( array(), $this->multisite()->get_actions() );
	}

	public function test_get_actions_populated_when_multisite(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Requires real multisite; run via npm run test:php:multisite.' );
		}
		$hooks = array_column( $this->multisite()->get_actions(), 'hook' );

		$this->assertContains( 'init', $hooks );
		$this->assertContains( 'wpmu_new_blog', $hooks );
	}

	public function test_get_filters_empty_when_not_multisite(): void {
		if ( is_multisite() ) {
			$this->markTestSkipped( 'Only meaningful under phpunit.xml (single-site); run via npm run test:php.' );
		}
		$this->assertSame( array(), $this->multisite()->get_filters() );
	}

	public function test_get_filters_populated_when_multisite(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Requires real multisite; run via npm run test:php:multisite.' );
		}
		$hooks = array_column( $this->multisite()->get_filters(), 'hook' );

		$this->assertContains( 'network_admin_plugin_action_links_' . VIDEOPACK_BASENAME, $hooks );
	}

	public function test_is_network_active_false_when_not_network_activated(): void {
		// True even under real multisite: this plugin isn't network-activated
		// in the test environment, only "regular"-activated (see
		// _manually_load_plugin() in tests/bootstrap.php).
		$this->assertFalse( $this->multisite()->is_network_active() );
	}

	public function test_is_videopack_active_for_network_false_when_not_network_activated(): void {
		$this->assertFalse( Multisite::is_videopack_active_for_network() );
	}

	// -----------------------------------------------------------------
	// get_default_network_settings_structure()
	// -----------------------------------------------------------------

	public function test_default_network_settings_includes_expected_keys(): void {
		$defaults = $this->multisite()->get_default_network_settings_structure();

		$this->assertArrayHasKey( 'app_path', $defaults );
		$this->assertArrayHasKey( 'ffmpeg_exists', $defaults );
		$this->assertArrayHasKey( 'simultaneous_encodes', $defaults );
		$this->assertArrayHasKey( 'default_capabilities', $defaults );
		$this->assertArrayHasKey( 'queue_control', $defaults );
	}

	public function test_default_network_settings_are_filterable(): void {
		add_filter(
			'videopack_default_network_settings',
			function ( $defaults ) {
				$defaults['custom_key'] = 'custom_value';
				return $defaults;
			}
		);

		$defaults = $this->multisite()->get_default_network_settings_structure();

		remove_all_filters( 'videopack_default_network_settings' );

		$this->assertSame( 'custom_value', $defaults['custom_key'] );
	}

	// -----------------------------------------------------------------
	// get_options() / get_network_options() / save_options()
	// -----------------------------------------------------------------

	public function test_save_options_persists_to_site_option(): void {
		$multisite = $this->multisite();
		$multisite->save_options( array( 'threads' => 4 ) );

		$this->assertSame( array( 'threads' => 4 ), get_site_option( 'videopack_network_options' ) );
		$this->assertSame( array( 'threads' => 4 ), Multisite::get_network_options() );
	}

	public function test_save_options_defaults_to_current_network_options_when_none_given(): void {
		update_site_option( 'videopack_network_options', array( 'threads' => 2 ) );
		$multisite = $this->multisite();

		$multisite->save_options();

		$this->assertSame( array( 'threads' => 2 ), get_site_option( 'videopack_network_options' ) );
	}

	// -----------------------------------------------------------------
	// override_local_options() -- network settings win over local ones
	// for the controlled subset of keys.
	// -----------------------------------------------------------------

	public function test_override_local_options_passes_through_non_array_input(): void {
		update_site_option( 'videopack_network_options', array( 'threads' => 8 ) );
		$multisite = $this->multisite();

		$this->assertSame( 'not-an-array', $multisite->override_local_options( 'not-an-array' ) );
	}

	public function test_override_local_options_passes_through_when_no_network_options_set(): void {
		$multisite = $this->multisite();
		$local     = array( 'threads' => 1 );

		$this->assertSame( $local, $multisite->override_local_options( $local ) );
	}

	public function test_override_local_options_network_value_wins_over_local(): void {
		update_site_option(
			'videopack_network_options',
			array(
				'simultaneous_encodes' => 5,
				'threads'              => 8,
				'nice'                 => false,
				'app_path'             => '/network/ffmpeg',
				'ffmpeg_exists'        => 'available',
			)
		);
		$multisite = $this->multisite();

		$result = $multisite->override_local_options(
			array(
				'simultaneous_encodes' => 1,
				'threads'              => 1,
				'nice'                 => true,
				'app_path'             => '/local/ffmpeg',
				'ffmpeg_exists'        => 'unchecked',
			)
		);

		$this->assertSame( 5, $result['simultaneous_encodes'] );
		$this->assertSame( 8, $result['threads'] );
		$this->assertFalse( $result['nice'] );
		$this->assertSame( '/network/ffmpeg', $result['app_path'] );
		$this->assertSame( 'available', $result['ffmpeg_exists'] );
	}

	public function test_override_local_options_leaves_unrelated_keys_untouched(): void {
		update_site_option( 'videopack_network_options', array( 'threads' => 8 ) );
		$multisite = $this->multisite();

		$result = $multisite->override_local_options( array( 'threads' => 1, 'watermark' => 'my-watermark' ) );

		$this->assertSame( 'my-watermark', $result['watermark'] );
	}

	public function test_override_local_options_is_filterable(): void {
		update_site_option( 'videopack_network_options', array( 'threads' => 8 ) );
		$multisite = $this->multisite();

		add_filter(
			'videopack_override_local_options',
			function ( $options ) {
				$options['custom_override'] = true;
				return $options;
			}
		);
		$result = $multisite->override_local_options( array( 'threads' => 1 ) );
		remove_all_filters( 'videopack_override_local_options' );

		$this->assertTrue( $result['custom_override'] );
	}

	// -----------------------------------------------------------------
	// validate_network_settings()
	// -----------------------------------------------------------------

	public function test_validate_network_settings_preserves_ffmpeg_exists_when_app_path_unchanged(): void {
		update_site_option( 'videopack_network_options', array( 'app_path' => '/usr/bin', 'ffmpeg_exists' => 'available' ) );
		$multisite = $this->multisite();

		$result = $multisite->validate_network_settings( array( 'app_path' => '/usr/bin' ) );

		$this->assertSame( 'available', $result['ffmpeg_exists'] );
	}

	public function test_validate_network_settings_revalidates_ffmpeg_when_app_path_changes(): void {
		update_site_option( 'videopack_network_options', array( 'app_path' => '/usr/bin', 'ffmpeg_exists' => 'available' ) );
		$multisite = $this->multisite();

		$result = $multisite->validate_network_settings( array( 'app_path' => '/different/path' ) );

		// A changed, unverified path can't still claim "available" --
		// validate_ffmpeg_settings() re-checks it (results in
		// 'unavailable' or 'unchecked' depending on environment, but
		// never the stale 'available' claim).
		$this->assertNotSame( 'available', $result['ffmpeg_exists'] );
	}

	public function test_validate_network_settings_fills_missing_keys_with_false(): void {
		$multisite = $this->multisite();

		$result = $multisite->validate_network_settings( array() );

		$this->assertFalse( $result['nice'] );
	}

	public function test_validate_network_settings_falls_back_queue_control_when_empty(): void {
		update_site_option( 'videopack_network_options', array( 'queue_control' => 'disabled' ) );
		$multisite = $this->multisite();

		$result = $multisite->validate_network_settings( array( 'queue_control' => '' ) );

		$this->assertSame( 'disabled', $result['queue_control'] );
	}

	// -----------------------------------------------------------------
	// add_new_blog()
	// -----------------------------------------------------------------

	public function test_add_new_blog_does_nothing_without_default_capabilities(): void {
		update_site_option( 'videopack_network_options', array() ); // No default_capabilities key.
		$multisite = $this->multisite();

		// Should not throw for a nonexistent blog ID when there's nothing to propagate.
		$multisite->add_new_blog( 999999 );

		$this->assertTrue( true );
	}

	/**
	 * switch_to_blog()/restore_current_blog() (which add_new_blog() calls
	 * for a non-empty default_capabilities) are only defined once
	 * WordPress core loads its multisite files -- run under
	 * phpunit-multisite.xml (npm run test:php:multisite), not the default
	 * single-site config.
	 */
	public function test_add_new_blog_sets_capabilities_on_new_site_when_configured(): void {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Requires real multisite (switch_to_blog() is undefined otherwise); run via npm run test:php:multisite.' );
		}

		update_site_option(
			'videopack_network_options',
			array( 'default_capabilities' => array( 'administrator' => array( 'encode_videos' => true ) ) )
		);
		$multisite = $this->multisite();

		$new_blog_id = self::factory()->blog->create();
		$multisite->add_new_blog( $new_blog_id );

		switch_to_blog( $new_blog_id );
		$site_options = get_option( 'videopack_options' );
		restore_current_blog();

		$this->assertArrayHasKey( 'capabilities', $site_options );
	}
}
