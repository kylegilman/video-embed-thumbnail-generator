<?php
/**
 * Tests for Player::get_final_width()/get_final_height() (the resolved
 * player dimensions embedded in data-player-vars and used for the actual
 * <video width/height> attributes) and the related is_fixed_aspect()/
 * get_fixed_aspect_ratio(). Previously completely untested despite being
 * the exact logic that decides what size a video actually renders at.
 */

use Videopack\Frontend\Video_Players\Player_Video_Js;

class PlayerDimensionsTest extends WP_UnitTestCase {

	/**
	 * A real uploaded video attachment (4096x2304, confirmed via its own
	 * probed metadata), shared across the class.
	 *
	 * @var int
	 */
	protected static $video_id;

	public static function wpSetUpBeforeClass( $factory ) {
		$file           = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4';
		self::$video_id = $factory->attachment->create_upload_object( $file );
	}

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	/**
	 * Renders a real player and returns the decoded data-player-vars JSON,
	 * which is the actual channel these resolved values reach the frontend
	 * through (Player::prepare_video_vars()'s 'width'/'height' keys).
	 */
	protected function render_video_vars( array $atts, array $options = array() ): array {
		$player = new Player_Video_Js( $this->options( $options ) );
		$html   = $player->get_player_code( $atts );

		preg_match( '/data-player-vars="([^"]+)"/', $html, $matches );
		$this->assertNotEmpty( $matches, 'player did not render (no data-player-vars found) -- check the fixture/atts used' );

		return json_decode( html_entity_decode( $matches[1] ), true );
	}

	// -----------------------------------------------------------------
	// No source at all -- pure atts/options fallback chain.
	// -----------------------------------------------------------------

	public function test_no_source_no_atts_falls_back_to_option_defaults(): void {
		$player = new Player_Video_Js( $this->options() );
		$player->get_player_code( array() ); // No source resolvable -> get_source() stays null.

		$method = new ReflectionMethod( $player, 'get_final_width' );
		$method->setAccessible( true );
		$this->assertSame( 960, $method->invoke( $player ) );

		$method = new ReflectionMethod( $player, 'get_final_height' );
		$method->setAccessible( true );
		$this->assertSame( 540, $method->invoke( $player ) );
	}

	// -----------------------------------------------------------------
	// Real source, no explicit width/height in atts -- native dimensions
	// should be used instead of the (unrelated) global default.
	// -----------------------------------------------------------------

	public function test_native_dimensions_used_when_atts_do_not_specify_width_or_height(): void {
		$vars = $this->render_video_vars( array( 'id' => self::$video_id ) );

		$this->assertSame( 4096, $vars['width'] );
		$this->assertSame( 2304, $vars['height'] );
	}

	public function test_explicit_non_default_width_is_respected_over_native_dimensions(): void {
		$vars = $this->render_video_vars( array( 'id' => self::$video_id, 'width' => 640 ) );

		$this->assertSame( 640, $vars['width'] );
	}

	/**
	 * get_final_width()/get_final_height() must detect "was width
	 * explicitly set?" by whether $atts actually provided a usable value,
	 * not by whether the resolved width happens to equal the global
	 * default -- otherwise an explicit request for exactly the site's own
	 * default width (960, coincidentally or deliberately, e.g. restoring
	 * it after trying something else) would be indistinguishable from
	 * "never set one" and get silently overridden by the source's native
	 * width instead.
	 */
	public function test_explicit_width_matching_the_global_default_is_respected(): void {
		$vars = $this->render_video_vars( array( 'id' => self::$video_id, 'width' => 960 ) );

		$this->assertSame( 960, $vars['width'] );
	}

	public function test_explicit_height_matching_the_global_default_is_respected(): void {
		$vars = $this->render_video_vars( array( 'id' => self::$video_id, 'height' => 540 ) );

		$this->assertSame( 540, $vars['height'] );
	}

	public function test_customized_global_default_still_falls_back_correctly_without_a_source(): void {
		$player = new Player_Video_Js( $this->options( array( 'width' => 1200, 'height' => 675 ) ) );
		$player->get_player_code( array() );

		$width_method = new ReflectionMethod( $player, 'get_final_width' );
		$width_method->setAccessible( true );
		$height_method = new ReflectionMethod( $player, 'get_final_height' );
		$height_method->setAccessible( true );

		$this->assertSame( 1200, $width_method->invoke( $player ) );
		$this->assertSame( 675, $height_method->invoke( $player ) );
	}

	// -----------------------------------------------------------------
	// is_fixed_aspect()
	// -----------------------------------------------------------------

	protected function is_fixed_aspect( Player_Video_Js $player ): bool {
		$method = new ReflectionMethod( $player, 'is_fixed_aspect' );
		$method->setAccessible( true );
		return $method->invoke( $player );
	}

	public function test_fixed_aspect_false_string_is_false(): void {
		$player = new Player_Video_Js( $this->options() );
		$player->get_player_code( array( 'fixed_aspect' => 'false' ) );

		$this->assertFalse( $this->is_fixed_aspect( $player ) );
	}

	public function test_fixed_aspect_none_string_is_false(): void {
		$player = new Player_Video_Js( $this->options() );
		$player->get_player_code( array( 'fixed_aspect' => 'none' ) );

		$this->assertFalse( $this->is_fixed_aspect( $player ) );
	}

	public function test_fixed_aspect_true_string_is_true(): void {
		$player = new Player_Video_Js( $this->options() );
		$player->get_player_code( array( 'fixed_aspect' => 'true' ) );

		$this->assertTrue( $this->is_fixed_aspect( $player ) );
	}

	public function test_fixed_aspect_boolean_true_is_true(): void {
		$player = new Player_Video_Js( $this->options() );
		$player->get_player_code( array( 'fixed_aspect' => true ) );

		$this->assertTrue( $this->is_fixed_aspect( $player ) );
	}

	public function test_fixed_aspect_vertical_with_landscape_source_is_false(): void {
		// The real fixture is 4096x2304 -- landscape (width > height).
		$player = new Player_Video_Js( $this->options() );
		$player->get_player_code( array( 'id' => self::$video_id, 'fixed_aspect' => 'vertical' ) );

		$this->assertFalse( $this->is_fixed_aspect( $player ) );
	}

	public function test_fixed_aspect_defaults_to_false_with_no_source(): void {
		$player = new Player_Video_Js( $this->options() );
		$player->get_player_code( array( 'fixed_aspect' => 'vertical' ) ); // No resolvable source.

		$this->assertFalse( $this->is_fixed_aspect( $player ) );
	}

	// -----------------------------------------------------------------
	// get_fixed_aspect_ratio() -- always derived from options, not atts.
	// -----------------------------------------------------------------

	public function test_fixed_aspect_ratio_uses_configured_option_dimensions(): void {
		$player = new Player_Video_Js( $this->options( array( 'width' => 1200, 'height' => 675 ) ) );
		$method = new ReflectionMethod( $player, 'get_fixed_aspect_ratio' );
		$method->setAccessible( true );

		$this->assertSame( '1200 / 675', $method->invoke( $player ) );
	}

	public function test_fixed_aspect_ratio_falls_back_to_16_9_when_dimensions_are_zero(): void {
		$player = new Player_Video_Js( $this->options( array( 'width' => 0, 'height' => 0 ) ) );
		$method = new ReflectionMethod( $player, 'get_fixed_aspect_ratio' );
		$method->setAccessible( true );

		$this->assertSame( '16 / 9', $method->invoke( $player ) );
	}
}
