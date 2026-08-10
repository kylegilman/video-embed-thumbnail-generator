<?php
/**
 * Tests for Options::validate_options() -- the sanitize_callback for the
 * main settings form/REST endpoint. This is the single choke point every
 * settings save passes through, so bugs here are high-blast-radius.
 */

use Videopack\Admin\Options;

class ValidateOptionsTest extends WP_UnitTestCase {

	public function set_up() {
		parent::set_up();
		delete_option( 'videopack_options' );
	}

	/**
	 * Primes $this->options (the "current, already-saved" state
	 * validate_options() compares/falls back to) with the given overrides
	 * merged onto real defaults, via a real save -- not by reaching into
	 * the object directly. ffmpeg_exists defaults to 'available' (not the
	 * real default 'unchecked') so tests don't accidentally trigger a real
	 * FFmpeg_Tester detection pass -- validate_options() re-checks
	 * unconditionally whenever ffmpeg_exists === 'unchecked', regardless of
	 * whether app_path changed.
	 */
	protected function options_primed_with( array $overrides ): Options {
		$options_handler = new Options();
		$defaults        = $options_handler->get_default();
		$options_handler->save_options(
			array_merge( $defaults, array( 'ffmpeg_exists' => 'available' ), $overrides )
		);
		return $options_handler;
	}

	/**
	 * A full, safe $input array matching the primed state (same app_path
	 * and a non-'unchecked' ffmpeg_exists), so calling validate_options()
	 * on it exercises the "nothing FFmpeg-related changed" path rather
	 * than a real detection pass.
	 */
	protected function safe_input( Options $options_handler, array $overrides = array() ): array {
		return array_merge(
			$options_handler->get_default(),
			array( 'ffmpeg_exists' => 'available' ),
			$overrides
		);
	}

	/**
	 * Regression test for a real bug: any default key missing from the
	 * submitted input used to be forced to `false`, not its actual default
	 * or previous value -- silently breaking any non-boolean setting (e.g.
	 * embed_method, a string) omitted from a partial or stale submission.
	 */
	public function test_missing_non_boolean_keys_fall_back_to_default_not_false() {
		$options_handler = $this->options_primed_with( array() );

		$input = $this->safe_input( $options_handler );
		unset( $input['embed_method'] );
		unset( $input['skin'] );

		$result = $options_handler->validate_options( $input );

		$this->assertSame( 'Video.js', $result['embed_method'] );
		$this->assertNotFalse( $result['skin'] );
		$this->assertIsString( $result['skin'] );
	}

	/**
	 * A genuinely partial update (only one key submitted, as a REST client
	 * might send) must preserve every other previously-saved, non-default
	 * value -- not reset the rest of the settings to factory defaults.
	 */
	public function test_partial_input_preserves_previously_saved_non_default_values() {
		$options_handler = $this->options_primed_with(
			array(
				'width'  => 720,
				'height' => 405,
				'poster' => 'https://example.com/custom-poster.jpg',
			)
		);

		$result = $options_handler->validate_options( array( 'width' => 800 ) );

		$this->assertSame( 800, (int) $result['width'] );
		$this->assertSame( 405, (int) $result['height'] );
		$this->assertSame( 'https://example.com/custom-poster.jpg', $result['poster'] );
	}

	/**
	 * A key that doesn't exist in get_default() at all (e.g. a setting
	 * removed in a later version, resubmitted by a stale client) must still
	 * be stripped, even though missing keys now fall back to
	 * $this->options instead of raw defaults. This works because
	 * $this->options is itself always pruned to exactly get_default()'s
	 * keys by load_options()/mark_defaults_ready() before validate_options()
	 * can run in real usage -- simulated here via reflection to flip
	 * defaults_ready, since a hand-constructed Options instance in a test
	 * never goes through that hook lifecycle.
	 */
	public function test_setting_removed_from_defaults_is_still_stripped_even_if_resubmitted() {
		$options_handler = $this->options_primed_with( array() );

		$reflection               = new ReflectionClass( $options_handler );
		$defaults_ready_property = $reflection->getProperty( 'defaults_ready' );
		$defaults_ready_property->setAccessible( true );
		$defaults_ready_property->setValue( $options_handler, true );

		$input                            = $this->safe_input( $options_handler );
		$input['legacy_removed_setting'] = 'stale-client-resubmit';

		$result = $options_handler->validate_options( $input );

		$this->assertArrayNotHasKey( 'legacy_removed_setting', $result );
	}

	public function test_auto_thumb_position_scales_up_when_number_increases_from_one() {
		$options_handler = $this->options_primed_with(
			array(
				'auto_thumb_number'   => 1,
				'auto_thumb_position' => 50,
			)
		);

		$input                       = $this->safe_input( $options_handler );
		$input['auto_thumb_number'] = 4;

		$result = $options_handler->validate_options( $input );

		// round(4 * (50/100)) = 2
		$this->assertSame( '2', (string) $result['auto_thumb_position'] );
	}

	public function test_auto_thumb_position_never_lands_on_zero() {
		$options_handler = $this->options_primed_with(
			array(
				'auto_thumb_number'   => 1,
				'auto_thumb_position' => 1,
			)
		);

		$input                       = $this->safe_input( $options_handler );
		$input['auto_thumb_number'] = 2;

		$result = $options_handler->validate_options( $input );

		// round(2 * (1/100)) = 0, which must be forced up to 1.
		$this->assertSame( '1', (string) $result['auto_thumb_position'] );
	}

	public function test_auto_thumb_position_rounds_down_to_multiple_of_25_when_number_returns_to_one() {
		$options_handler = $this->options_primed_with(
			array(
				'auto_thumb_number'   => 4,
				'auto_thumb_position' => 2,
			)
		);

		$input                       = $this->safe_input( $options_handler );
		$input['auto_thumb_number'] = 1;

		$result = $options_handler->validate_options( $input );

		// round(round(2/4*4)/4*100) = round(round(2)/4*100) = round(50) = 50
		$this->assertSame( '50', (string) $result['auto_thumb_position'] );
	}

	public function test_auto_thumb_position_100_is_forced_down_to_75() {
		$options_handler = $this->options_primed_with(
			array(
				'auto_thumb_number'   => 3,
				'auto_thumb_position' => 3,
			)
		);

		$input                       = $this->safe_input( $options_handler );
		$input['auto_thumb_number'] = 1;

		$result = $options_handler->validate_options( $input );

		// round(round(3/3*4)/4*100) = round(round(4)/4*100) = round(100) = 100 -> forced to 75.
		$this->assertSame( '75', (string) $result['auto_thumb_position'] );
	}

	public function test_auto_thumb_position_is_clamped_to_the_new_thumbnail_count() {
		$options_handler = $this->options_primed_with(
			array(
				'auto_thumb_number'   => 5,
				'auto_thumb_position' => 5,
			)
		);

		$input                         = $this->safe_input( $options_handler );
		$input['auto_thumb_number']   = 3;
		$input['auto_thumb_position'] = 8;

		$result = $options_handler->validate_options( $input );

		$this->assertSame( 3, (int) $result['auto_thumb_position'] );
	}

	public function test_auto_thumb_number_of_zero_falls_back_to_the_previous_value() {
		$options_handler = $this->options_primed_with( array( 'auto_thumb_number' => 4 ) );

		$input                       = $this->safe_input( $options_handler );
		$input['auto_thumb_number'] = 0;

		$result = $options_handler->validate_options( $input );

		$this->assertSame( 4, (int) $result['auto_thumb_number'] );
	}

	public function test_empty_width_falls_back_to_previous_value_and_registers_a_settings_error() {
		$options_handler = $this->options_primed_with( array( 'width' => 720 ) );

		$input          = $this->safe_input( $options_handler );
		$input['width'] = 0;

		$result = $options_handler->validate_options( $input );

		$this->assertSame( 720, (int) $result['width'] );

		$errors      = get_settings_errors( 'video_embed_thumbnail_generator_settings' );
		$error_codes = wp_list_pluck( $errors, 'code' );
		$this->assertContains( 'width-zero', $error_codes );
	}

	public function test_empty_height_falls_back_to_previous_value_and_registers_a_settings_error() {
		$options_handler = $this->options_primed_with( array( 'height' => 480 ) );

		$input           = $this->safe_input( $options_handler );
		$input['height'] = 0;

		$result = $options_handler->validate_options( $input );

		$this->assertSame( 480, (int) $result['height'] );

		$errors      = get_settings_errors( 'video_embed_thumbnail_generator_settings' );
		$error_codes = wp_list_pluck( $errors, 'code' );
		$this->assertContains( 'height-zero', $error_codes );
	}

	public function test_capabilities_are_sanitized_through_set_capabilities() {
		$options_handler = $this->options_primed_with( array() );

		$input                 = $this->safe_input( $options_handler );
		$input['capabilities'] = array(
			'make_video_thumbnails' => array(
				'administrator' => true,
				0               => true, // Non-string key -- must be stripped by set_capabilities().
			),
		);

		$result = $options_handler->validate_options( $input );

		// The non-string key is gone; any role omitted from the submission
		// (editor, author, contributor, subscriber) is filled back in from
		// the real per-role default rather than being dropped, since
		// 'capabilities' merges recursively too, same as any other nested
		// default.
		$this->assertArrayNotHasKey( 0, $result['capabilities']['make_video_thumbnails'] );
		$this->assertTrue( $result['capabilities']['make_video_thumbnails']['administrator'] );
		$this->assertSame(
			$options_handler->get_default()['capabilities']['make_video_thumbnails']['editor'],
			$result['capabilities']['make_video_thumbnails']['editor']
		);
	}

	public function test_collection_video_limit_of_zero_is_coerced_to_unlimited() {
		$options_handler = $this->options_primed_with( array() );

		$input                            = $this->safe_input( $options_handler );
		$input['collection_video_limit'] = 0;

		$result = $options_handler->validate_options( $input );

		$this->assertSame( -1, (int) $result['collection_video_limit'] );
	}

	public function test_wordpress_default_embed_method_forces_the_matching_skin() {
		$options_handler = $this->options_primed_with( array() );

		$input                 = $this->safe_input( $options_handler );
		$input['embed_method'] = 'WordPress Default';

		$result = $options_handler->validate_options( $input );

		$this->assertSame( 'vjs-theme-videopack', $result['skin'] );
	}

	public function test_disabling_embeddable_also_disables_embedcode() {
		$options_handler = $this->options_primed_with( array() );

		$input                = $this->safe_input( $options_handler );
		$input['embeddable'] = false;
		$input['embedcode']  = true;

		$result = $options_handler->validate_options( $input );

		$this->assertFalse( $result['embedcode'] );
	}

	public function test_auto_encode_is_disabled_when_no_transcoding_capability_is_ready() {
		$options_handler = $this->options_primed_with( array( 'ffmpeg_exists' => 'unavailable' ) );

		$input                  = $this->safe_input( $options_handler, array( 'ffmpeg_exists' => 'unavailable' ) );
		$input['auto_encode']   = true;

		$result = $options_handler->validate_options( $input );

		$this->assertFalse( $result['auto_encode'] );
	}

	public function test_empty_queue_control_falls_back_to_the_previous_value() {
		$options_handler = $this->options_primed_with( array( 'queue_control' => 'pause' ) );

		$input                  = $this->safe_input( $options_handler );
		$input['queue_control'] = '';

		$result = $options_handler->validate_options( $input );

		$this->assertSame( 'pause', $result['queue_control'] );
	}
}
