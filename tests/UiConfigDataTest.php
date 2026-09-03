<?php
/**
 * Tests for Ui::get_videopack_config_data() -- the data localized as
 * `videopack_config` for the block editor. Previously completely untested.
 */

use Videopack\Admin\Ui;
use Videopack\Admin\Formats\Registry;

class UiConfigDataTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function ui( array $options = array() ): Ui {
		$opts = $this->options( $options );
		return new Ui( $opts, new Registry( $opts ) );
	}

	public function test_resolution_width_is_derived_from_height_at_16_by_9(): void {
		$data = $this->ui()->get_videopack_config_data();

		$found_720p = null;
		foreach ( $data['resolutions'] as $resolution ) {
			if ( 720 === $resolution['height'] ) {
				$found_720p = $resolution;
				break;
			}
		}

		$this->assertNotNull( $found_720p, 'a 720p resolution should exist among the built-in resolutions' );
		$this->assertSame( (int) ceil( 720 * 16 / 9 ), $found_720p['width'] );
	}

	public function test_resolution_with_zero_height_has_null_width(): void {
		// Only relevant if a zero/fullres-style height entry exists; if not,
		// this simply confirms no built-in resolution violates the rule.
		$data = $this->ui()->get_videopack_config_data();

		foreach ( $data['resolutions'] as $resolution ) {
			if ( 0 === $resolution['height'] ) {
				$this->assertNull( $resolution['width'] );
			}
		}
	}

	public function test_theme_colors_always_includes_white_gray_and_transparent(): void {
		$data = $this->ui()->get_videopack_config_data();

		$slugs = array_column( $data['themeColors'], 'slug' );
		$this->assertContains( 'white', $slugs );
		$this->assertContains( 'gray-900', $slugs );

		$names = array_column( $data['themeColors'], 'name' );
		$this->assertContains( 'Transparent', $names );
	}

	public function test_ffmpeg_exists_option_is_passed_through(): void {
		$data = $this->ui( array( 'ffmpeg_exists' => 'available' ) )->get_videopack_config_data();

		$this->assertSame( 'available', $data['ffmpeg_exists'] );
		$this->assertSame( 'available', $data['options']['ffmpeg_exists'] );
	}

	public function test_is_super_admin_and_is_network_admin_are_booleans(): void {
		$data = $this->ui()->get_videopack_config_data();

		$this->assertIsBool( $data['isSuperAdmin'] );
		$this->assertIsBool( $data['isNetworkAdmin'] );
	}

	public function test_config_data_is_filterable(): void {
		add_filter(
			'videopack_config_data',
			static function ( $data ) {
				$data['my_custom_key'] = 'custom value';
				return $data;
			}
		);

		$data = $this->ui()->get_videopack_config_data();
		remove_all_filters( 'videopack_config_data' );

		$this->assertSame( 'custom value', $data['my_custom_key'] );
	}

	public function test_transcoding_service_ready_defaults_false_with_no_addon(): void {
		$data = $this->ui()->get_videopack_config_data();

		$this->assertFalse( $data['isTranscodingServiceReady'] );
	}

	public function test_transcoding_service_ready_reflects_the_filter(): void {
		add_filter( 'videopack_transcoding_service_ready', '__return_true' );

		$data = $this->ui()->get_videopack_config_data();
		remove_filter( 'videopack_transcoding_service_ready', '__return_true' );

		$this->assertTrue( $data['isTranscodingServiceReady'] );
	}

	public function test_localize_block_settings_merges_extra_data(): void {
		wp_register_script( 'videopack-test-handle', '', array(), '1.0', true );

		$this->ui()->localize_block_settings( 'videopack-test-handle', array( 'extra_key' => 'extra_value' ) );

		global $wp_scripts;
		$data = $wp_scripts->get_data( 'videopack-test-handle', 'data' );

		$this->assertStringContainsString( 'extra_value', $data );
		$this->assertStringContainsString( 'videopack_config', $data );
	}
}
