<?php
/**
 * Tests for Player_WordPress_Default -- the MediaElement.js-specific
 * feature list/settings building (filter_video_vars()), block metadata
 * dependency injection, style/script handle merging, and video element
 * class building. Previously completely untested.
 */

use Videopack\Frontend\Video_Players\Player_WordPress_Default;

class PlayerWordPressDefaultTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function player(): Player_WordPress_Default {
		return new Player_WordPress_Default( $this->options() );
	}

	protected function invoke_protected( array $atts, string $method ) {
		$player   = $this->player();
		$set_atts = new ReflectionMethod( $player, 'set_atts' );
		$set_atts->setAccessible( true );
		$set_atts->invoke( $player, $atts );

		$reflected = new ReflectionMethod( $player, $method );
		$reflected->setAccessible( true );
		return $reflected->invoke( $player );
	}

	protected function one_source_group(): array {
		return array(
			'h264' => array(
				'sources' => array( array( 'src' => 'video.mp4' ) ),
			),
		);
	}

	protected function two_source_groups(): array {
		return array(
			'h264' => array(
				'sources' => array( array( 'src' => 'video.mp4' ) ),
			),
			'vp9'  => array(
				'sources' => array( array( 'src' => 'video.webm' ) ),
			),
		);
	}

	// -----------------------------------------------------------------
	// filter_video_vars() -- static.
	// -----------------------------------------------------------------

	public function test_base_features_are_always_present(): void {
		$result = Player_WordPress_Default::filter_video_vars( array(), array() );

		$this->assertSame(
			array( 'playpause', 'progress', 'volume', 'tracks', 'fullscreen' ),
			$result['mejs_settings']['features']
		);
	}

	public function test_sourcechooser_is_added_when_more_than_one_source_exists(): void {
		$result = Player_WordPress_Default::filter_video_vars(
			array( 'source_groups' => $this->two_source_groups() ),
			array()
		);

		$this->assertContains( 'sourcechooser', $result['mejs_settings']['features'] );
	}

	public function test_sourcechooser_is_not_added_for_a_single_source(): void {
		$result = Player_WordPress_Default::filter_video_vars(
			array( 'source_groups' => $this->one_source_group() ),
			array()
		);

		$this->assertNotContains( 'sourcechooser', $result['mejs_settings']['features'] );
	}

	public function test_sourcechooser_counts_sources_across_multiple_groups_of_one_each(): void {
		// Two groups with exactly one source each is still 2 total sources,
		// even though no single group alone would trigger it.
		$result = Player_WordPress_Default::filter_video_vars(
			array( 'source_groups' => $this->two_source_groups() ),
			array()
		);

		$this->assertContains( 'sourcechooser', $result['mejs_settings']['features'] );
	}

	public function test_speed_feature_and_speeds_added_only_when_playback_rate_enabled(): void {
		$without = Player_WordPress_Default::filter_video_vars( array(), array( 'playback_rate' => false ) );
		$with    = Player_WordPress_Default::filter_video_vars( array(), array( 'playback_rate' => true ) );

		$this->assertNotContains( 'speed', $without['mejs_settings']['features'] );
		$this->assertArrayNotHasKey( 'speeds', $without['mejs_settings'] );

		$this->assertContains( 'speed', $with['mejs_settings']['features'] );
		$this->assertSame( array( '0.5', '1', '1.25', '1.5', '2' ), $with['mejs_settings']['speeds'] );
	}

	public function test_mejs_settings_shape(): void {
		$result   = Player_WordPress_Default::filter_video_vars( array(), array() );
		$settings = $result['mejs_settings'];

		$this->assertSame( 'mejs-', $settings['classPrefix'] );
		$this->assertSame( 'responsive', $settings['stretching'] );
		$this->assertSame( 'mediaelement', $settings['audioShortcodeLibrary'] );
		$this->assertSame( 'mediaelement', $settings['videoShortcodeLibrary'] );
	}

	public function test_other_video_variables_are_preserved(): void {
		$result = Player_WordPress_Default::filter_video_vars( array( 'existing_key' => 'value' ), array() );

		$this->assertSame( 'value', $result['existing_key'] );
	}

	// -----------------------------------------------------------------
	// filter_block_metadata()
	// -----------------------------------------------------------------

	public function test_block_metadata_appends_scripts_and_style_to_empty_metadata(): void {
		$result = $this->player()->filter_block_metadata( array() );

		$this->assertSame( array( 'mediaelement', 'videopack-mejs' ), $result['script'] );
		$this->assertSame( array( 'wp-mediaelement' ), $result['style'] );
	}

	public function test_block_metadata_preserves_an_existing_script_array(): void {
		$result = $this->player()->filter_block_metadata( array( 'script' => array( 'some-other-script' ) ) );

		$this->assertSame( array( 'some-other-script', 'mediaelement', 'videopack-mejs' ), $result['script'] );
	}

	/**
	 * filter_block_metadata() calls ensure_array_and_append() twice for
	 * 'script' (once for 'mediaelement', once for 'videopack-mejs') -- the
	 * scalar-to-array conversion only happens on the first call; the
	 * second sees an already-converted array and just appends normally.
	 */
	public function test_block_metadata_converts_an_existing_scalar_script_to_an_array(): void {
		$result = $this->player()->filter_block_metadata( array( 'script' => 'some-other-script' ) );

		$this->assertSame( array( 'some-other-script', 'mediaelement', 'videopack-mejs' ), $result['script'] );
	}

	// -----------------------------------------------------------------
	// get_player_style_handles() / get_player_script_handles()
	// -----------------------------------------------------------------

	public function test_style_handles_include_the_base_and_mediaelement_handle(): void {
		$handles = $this->player()->get_player_style_handles();

		$this->assertContains( 'videopack-core', $handles );
		$this->assertContains( 'wp-mediaelement', $handles );
	}

	public function test_script_handles_include_mediaelement_and_videopack_mejs(): void {
		$handles = $this->player()->get_player_script_handles();

		$this->assertContains( 'mediaelement', $handles );
		$this->assertContains( 'videopack-mejs', $handles );
	}

	// -----------------------------------------------------------------
	// get_video_classes()
	// -----------------------------------------------------------------

	public function test_video_classes_include_the_wp_video_shortcode_class(): void {
		$classes = $this->invoke_protected( array(), 'get_video_classes' );

		$this->assertContains( 'videopack-video', $classes );
		$this->assertContains( 'wp-video-shortcode', $classes );
	}
}
