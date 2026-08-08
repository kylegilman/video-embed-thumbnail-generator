<?php
/**
 * Tests for Options migration from 4.10.6 to 5.0.
 */

use Videopack\Admin\Options;

class OptionsMigrationTest extends WP_UnitTestCase {

	public function set_up() {
		parent::set_up();
		delete_option( 'kgvid_video_embed_options' );
		delete_option( 'videopack_options' );
	}

	/**
	 * Test that 4.10.6 format selections map correctly to 5.0 codec/resolution options matrix.
	 */
	public function test_legacy_encoding_options_migration(): void {
		$old_options = array(
			'embed_method'    => 'Video.js v8',
			'generate_thumbs' => 6,
			'js_skin'         => 'vjs-theme-custom',
			'encode'          => array(
				'fullres' => 'on',
				'1080'    => 'on',
				'720'     => 'on',
				'480'     => 'off',
				'mobile'  => 'off',
				'webm'    => 'on',
			),
			'app_path'        => '',
		);
		update_option( 'kgvid_video_embed_options', $old_options );

		$options_handler = new Options();
		$options_handler->load_options();
		$loaded_options = $options_handler->get_options();

		// Verify 4.10.6 option keys were migrated
		$this->assertSame( 6, $loaded_options['total_thumbnails'] );
		$this->assertSame( 'vjs-theme-custom', $loaded_options['skin'] );
		$this->assertSame( 'Video.js', $loaded_options['embed_method'] );

		// Verify encoding resolution mapping
		$this->assertTrue( $loaded_options['encode']['h264']['resolutions']['fullres'] );
		$this->assertTrue( $loaded_options['encode']['h264']['resolutions']['1080'] );
		$this->assertTrue( $loaded_options['encode']['h264']['resolutions']['720'] );
		$this->assertFalse( $loaded_options['encode']['h264']['resolutions']['480'] );
		$this->assertFalse( $loaded_options['encode']['h264']['resolutions']['360'] );
		$this->assertTrue( $loaded_options['encode']['vp8']['enabled'] );

		// Verify empty string app_path was preserved as empty string (not boolean false)
		$this->assertSame( '', $loaded_options['app_path'] );

		// Verify the old option row was actually deleted from the database.
		// get_option() itself can't be used to check this: Options registers a
		// default_option_kgvid_video_embed_options fallback (see
		// test_legacy_option_filter_fallback) so third parties that still read
		// the legacy option name keep getting a usable array instead of false,
		// even once the row is gone -- that's by design, not a leak.
		global $wpdb;
		$this->assertNull(
			$wpdb->get_var(
				$wpdb->prepare(
					"SELECT option_id FROM {$wpdb->options} WHERE option_name = %s",
					'kgvid_video_embed_options'
				)
			)
		);
	}

	/**
	 * Test that every real legacy 'ffmpeg_exists' shape migrates to the new 3-value enum.
	 */
	public function test_legacy_ffmpeg_exists_migration(): void {
		$cases = array(
			'on legacy shape'           => array( 'on', 'available' ),
			'notinstalled legacy shape' => array( 'notinstalled', 'unavailable' ),
			'notchecked legacy shape'   => array( 'notchecked', 'unchecked' ),
			'pre-4.9.5 bare true shape' => array( true, 'available' ),
		);

		foreach ( $cases as $label => $case ) {
			list( $legacy_value, $expected ) = $case;

			delete_option( 'kgvid_video_embed_options' );
			delete_option( 'videopack_options' );

			update_option(
				'kgvid_video_embed_options',
				array(
					'app_path'      => '/usr/bin/ffmpeg',
					'ffmpeg_exists' => $legacy_value,
				)
			);

			$options_handler = new Options();
			$options_handler->load_options();
			$loaded_options = $options_handler->get_options();

			$this->assertSame( $expected, $loaded_options['ffmpeg_exists'], "Failed for case: {$label}" );
		}
	}

	/**
	 * Test that legacy checkbox strings ('on'/'false') migrate to real booleans,
	 * not the raw truthy string 'false'.
	 */
	public function test_legacy_checkbox_values_migration(): void {
		update_option(
			'kgvid_video_embed_options',
			array(
				'app_path' => '',
				'autoplay' => 'on',
				'loop'     => 'false',
			)
		);

		$options_handler = new Options();
		$options_handler->load_options();
		$loaded_options = $options_handler->get_options();

		$this->assertTrue( $loaded_options['autoplay'] );
		$this->assertFalse( $loaded_options['loop'] );
	}

	/**
	 * Test option_kgvid_video_embed_options filter fallback for legacy get_option calls.
	 */
	public function test_legacy_option_filter_fallback(): void {
		$options_handler = new Options();
		$options_handler->save_options( array( 'embed_method' => 'Video.js' ) );

		// Hook subscriber filter
		add_filter( 'option_kgvid_video_embed_options', array( $options_handler, 'filter_legacy_options' ) );

		$legacy_get = get_option( 'kgvid_video_embed_options' );
		$this->assertIsArray( $legacy_get );
		$this->assertSame( 'Video.js', $legacy_get['embed_method'] );
	}
}
