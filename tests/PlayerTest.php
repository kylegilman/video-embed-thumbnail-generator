<?php
/**
 * Tests for the base Player class -- previously only exercised indirectly
 * (through do_shortcode()/do_blocks() output assertions in other test
 * files), never directly. Covers get_final_width()/get_final_height()'s
 * "was it explicitly set" vs. "does it equal the default" distinction
 * (the subtlety called out in that method's own docblock comment),
 * get_fixed_aspect_ratio(), and get_video_code()'s attribute assembly --
 * including the strict `=== true` boolean check and the fact that the
 * <video> tag's own width/height attributes come from the raw, unresolved
 * $atts rather than the same resolved values sent to JS via
 * data-player-vars.
 *
 * Note: get_video_classes()/prepare_video_vars() run through filters
 * (videopack_video_player_classes, videopack_video_player_data) that
 * Player_Video_Js registers process-wide the first time any such player is
 * constructed -- unavoidable once other tests in the same PHPUnit run have
 * done so. Assertions here check for expected substrings/values rather
 * than asserting an exact class list or exact key set, so they don't
 * depend on whether those filters happen to already be registered.
 */

use Videopack\Frontend\Video_Players\Player;
use Videopack\Admin\Formats\Registry;
use Videopack\Video_Source\Source_Factory;

class PlayerTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	protected function player( array $option_overrides = array() ): Player {
		$options = $this->options( $option_overrides );
		return new Player( $options, new Registry( $options ) );
	}

	/**
	 * Real, known dimensions (4096x2304) -- native metadata read by a real
	 * ffprobe run, same fixture other test files already rely on.
	 */
	protected function video_attachment(): int {
		$file = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4';
		return self::factory()->attachment->create_upload_object( $file );
	}

	protected function source_for( int $attachment_id, array $options = array() ) {
		$options = $this->options( $options );
		return Source_Factory::create( $attachment_id, $options, new Registry( $options ) );
	}

	// -----------------------------------------------------------------
	// get_final_width() / get_final_height() (via prepare_video_vars())
	// -----------------------------------------------------------------

	public function test_explicit_dimensions_win_even_when_they_equal_the_global_default(): void {
		$attachment_id = $this->video_attachment(); // native 4096x2304 -- different from both.
		$player        = $this->player( array( 'width' => 960, 'height' => 540 ) );
		$player->set_atts( array( 'width' => 960, 'height' => 540 ) );
		$player->set_source( $this->source_for( $attachment_id ) );

		$vars = $player->prepare_video_vars();

		$this->assertSame( 960, $vars['width'] );
		$this->assertSame( 540, $vars['height'] );
	}

	public function test_dimensions_fall_back_to_the_sources_native_size_when_atts_omit_them(): void {
		$attachment_id = $this->video_attachment();
		$player        = $this->player();
		$player->set_atts( array() ); // No width/height key at all.
		$player->set_source( $this->source_for( $attachment_id ) );

		$vars = $player->prepare_video_vars();

		$this->assertSame( 4096, $vars['width'] );
		$this->assertSame( 2304, $vars['height'] );
	}

	public function test_dimensions_fall_back_to_the_global_option_defaults_without_a_source(): void {
		$player = $this->player( array( 'width' => 800, 'height' => 450 ) );
		$player->set_atts( array() );

		$vars = $player->prepare_video_vars();

		$this->assertSame( 800, $vars['width'] );
		$this->assertSame( 450, $vars['height'] );
	}

	public function test_an_explicit_zero_dimension_is_treated_as_not_set(): void {
		$attachment_id = $this->video_attachment();
		$player        = $this->player();
		$player->set_atts( array( 'width' => 0, 'height' => 0 ) );
		$player->set_source( $this->source_for( $attachment_id ) );

		$vars = $player->prepare_video_vars();

		$this->assertSame( 4096, $vars['width'], 'a falsy 0 should fall through to the source, not be treated as an explicit request for 0' );
		$this->assertSame( 2304, $vars['height'] );
	}

	// -----------------------------------------------------------------
	// get_fixed_aspect_ratio() (via prepare_video_vars()['default_ratio'])
	// -----------------------------------------------------------------

	public function test_default_ratio_uses_the_options_dimensions(): void {
		$player = $this->player( array( 'width' => 1920, 'height' => 1080 ) );
		$player->set_atts( array() );

		$this->assertSame( '1920 / 1080', $player->prepare_video_vars()['default_ratio'] );
	}

	public function test_default_ratio_falls_back_to_16_9_without_option_dimensions(): void {
		$player = $this->player( array( 'width' => 0, 'height' => 0 ) );
		$player->set_atts( array() );

		$this->assertSame( '16 / 9', $player->prepare_video_vars()['default_ratio'] );
	}

	// -----------------------------------------------------------------
	// get_player_code() -- boolean video attributes.
	// -----------------------------------------------------------------

	public function test_boolean_attributes_are_only_included_when_strictly_true(): void {
		$attachment_id = $this->video_attachment();
		$player        = $this->player();

		$html = $player->get_player_code(
			array(
				'id'          => $attachment_id,
				'autoplay'    => true,
				'controls'    => true,
				'loop'        => 'true', // Truthy string, not a real boolean -- must NOT count.
				'muted'       => false,
				'playsinline' => true,
			)
		);

		// The four checked attribute names are always emitted in this fixed
		// order (autoplay, controls, loop, muted, playsinline) -- loop and
		// muted are excluded, so the three enabled ones end up contiguous.
		$this->assertStringContainsString( 'autoplay controls playsinline', $html );
	}

	public function test_boolean_attributes_are_omitted_entirely_when_none_are_true(): void {
		$attachment_id = $this->video_attachment();
		$player        = $this->player();

		$html = $player->get_player_code( array( 'id' => $attachment_id ) );

		foreach ( array( 'autoplay', 'controls', 'loop', 'muted', 'playsinline' ) as $attr ) {
			$this->assertDoesNotMatchRegularExpression( '/[" ]' . $attr . '[" >]/', $html, "unexpected {$attr} attribute" );
		}
	}

	// -----------------------------------------------------------------
	// get_player_code() -- string video attributes come from the RAW
	// atts, not the same resolved dimensions sent to JS.
	// -----------------------------------------------------------------

	public function test_string_attributes_use_the_raw_atts_value_not_the_resolved_dimensions(): void {
		$attachment_id = $this->video_attachment(); // native 4096x2304.
		$player        = $this->player();

		// No width/height in atts -- prepare_video_vars() (JS data) would
		// resolve these to the source's native 4096x2304, but the <video>
		// tag's own width/height HTML attributes are built directly from
		// $atts, which has neither key set at all.
		$html = $player->get_player_code( array( 'id' => $attachment_id ) );

		$this->assertStringContainsString( '&quot;width&quot;:4096', $html, 'sanity: JS data does resolve the dimension' );
		$this->assertDoesNotMatchRegularExpression( '/<video[^>]*\swidth="/', $html, 'the <video> tag itself should have no width attribute when atts never set one' );
	}

	public function test_string_attributes_are_rendered_when_explicitly_set(): void {
		$attachment_id = $this->video_attachment();
		$player        = $this->player();

		$html = $player->get_player_code(
			array(
				'id'     => $attachment_id,
				'width'  => 640,
				'height' => 360,
				'poster' => 'https://example.test/poster.jpg',
			)
		);

		$this->assertStringContainsString( 'width="640"', $html );
		$this->assertStringContainsString( 'height="360"', $html );
		$this->assertStringContainsString( 'poster="https://example.test/poster.jpg"', $html );
	}

	public function test_empty_string_attributes_are_omitted(): void {
		$attachment_id = $this->video_attachment();
		$player        = $this->player();

		$html = $player->get_player_code(
			array(
				'id'     => $attachment_id,
				'poster' => '',
			)
		);

		$this->assertStringNotContainsString( 'poster=', $html );
	}
}
