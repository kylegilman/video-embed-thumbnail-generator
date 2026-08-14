<?php
/**
 * Tests for Player_Video_Js -- the video.js-specific filters and locale
 * handling layered on top of the base Player class. Previously completely
 * untested despite real logic: the locale-format conversion (WordPress's
 * underscore locale codes to video.js's hyphenated ones) and the class-
 * building filters that end up straight in an esc_attr()'d HTML attribute
 * with no further filtering of the array in between.
 */

use Videopack\Frontend\Video_Players\Player_Video_Js;

class PlayerVideoJsTest extends WP_UnitTestCase {

	protected function get_locale( string $locale ): string {
		$method = new ReflectionMethod( Player_Video_Js::class, 'get_videojs_locale' );
		$method->setAccessible( true );

		add_filter( 'locale', function () use ( $locale ) {
			return $locale;
		} );
		$result = $method->invoke( null );
		remove_all_filters( 'locale' );

		return $result;
	}

	// -----------------------------------------------------------------
	// get_videojs_locale() -- WP underscore format -> video.js hyphenated.
	// -----------------------------------------------------------------

	public function test_locale_pt_br_converts_to_hyphenated_form(): void {
		$this->assertSame( 'pt-BR', $this->get_locale( 'pt_BR' ) );
	}

	public function test_locale_zh_cn_converts_to_hyphenated_form(): void {
		$this->assertSame( 'zh-CN', $this->get_locale( 'zh_CN' ) );
	}

	public function test_locale_falls_back_to_first_two_characters(): void {
		$this->assertSame( 'fr', $this->get_locale( 'fr_FR' ) );
		$this->assertSame( 'de', $this->get_locale( 'de_DE' ) );
	}

	public function test_locale_en_us_truncates_to_en(): void {
		$this->assertSame( 'en', $this->get_locale( 'en_US' ) );
	}

	// -----------------------------------------------------------------
	// filter_video_vars()
	// -----------------------------------------------------------------

	public function test_filter_video_vars_always_includes_locale(): void {
		$result = Player_Video_Js::filter_video_vars( array(), array() );

		$this->assertArrayHasKey( 'locale', $result );
	}

	public function test_filter_video_vars_omits_skip_buttons_when_not_requested(): void {
		$result = Player_Video_Js::filter_video_vars( array(), array( 'skip_buttons' => false ) );

		$this->assertArrayNotHasKey( 'skip_buttons', $result );
	}

	public function test_filter_video_vars_includes_skip_buttons_from_options_when_requested(): void {
		update_option( 'videopack_options', array_merge( get_option( 'videopack_options', array() ), array( 'skip_forward' => 15, 'skip_backward' => 5 ) ) );

		$result = Player_Video_Js::filter_video_vars( array(), array( 'skip_buttons' => true ) );

		$this->assertSame( array( 'forward' => 15, 'backward' => 5 ), $result['skip_buttons'] );
	}

	// -----------------------------------------------------------------
	// filter_video_classes() / filter_player_div_classes()
	// -----------------------------------------------------------------

	public function test_filter_video_classes_always_includes_base_classes(): void {
		$result = Player_Video_Js::filter_video_classes( array(), array() );

		$this->assertContains( 'video-js', $result );
		$this->assertContains( 'vjs-big-play-centered', $result );
	}

	public function test_filter_video_classes_includes_skin_when_set(): void {
		$result = Player_Video_Js::filter_video_classes( array(), array( 'skin' => 'vjs-theme-fantasy' ) );

		$this->assertContains( 'vjs-theme-fantasy', $result );
	}

	/**
	 * Callers implode() this array directly into an esc_attr()'d class
	 * attribute with no further filtering -- an empty skin must not push
	 * a blank element in (which would leave a stray double space in the
	 * rendered HTML).
	 */
	public function test_filter_video_classes_does_not_add_blank_entry_for_empty_skin(): void {
		$result = Player_Video_Js::filter_video_classes( array(), array() );

		$this->assertNotContains( '', $result );
	}

	public function test_filter_video_classes_adds_fill_class_for_fixed_aspect(): void {
		$result = Player_Video_Js::filter_video_classes( array(), array( 'fixed_aspect' => true ) );

		$this->assertContains( 'vjs-fill', $result );
	}

	public function test_filter_video_classes_omits_fill_class_without_fixed_aspect(): void {
		$result = Player_Video_Js::filter_video_classes( array(), array() );

		$this->assertNotContains( 'vjs-fill', $result );
	}

	public function test_filter_player_div_classes_includes_skin_when_set(): void {
		$result = Player_Video_Js::filter_player_div_classes( array(), array( 'skin' => 'vjs-theme-fantasy' ) );

		$this->assertContains( 'vjs-theme-fantasy', $result );
	}

	public function test_filter_player_div_classes_omits_empty_skin(): void {
		$result = Player_Video_Js::filter_player_div_classes( array(), array() );

		$this->assertSame( array(), $result );
	}
}
