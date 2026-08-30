<?php
/**
 * Tests for Player::get_source_elements()/get_source_atts() -- the raw
 * HTML-string-concatenation building each <source> element. Previously
 * built src/type/codecs with no escaping at all: PHP's own
 * FILTER_VALIDATE_URL (used by Common\Validate::filter_validate_url() to
 * decide whether a string is treated as a remote URL video source) accepts
 * a URL containing an unescaped '"', so a [videopack src="..."] shortcode
 * or block pointing at such a URL could break out of the src="..."
 * attribute and inject arbitrary HTML into every page that renders it --
 * confirmed both in isolation (this file) and against the currently-
 * shipping 4.10.6 branch, which already escaped this correctly
 * (`esc_url( $source_url )` / `esc_attr( $format_stats['mime'] )` in
 * src/public/videopack-public.php) before the 5.0 rewrite of this class
 * dropped it.
 */

use Videopack\Frontend\Video_Players\Player_Video_Js;

class PlayerSourceEscapingTest extends WP_UnitTestCase {

	protected function options( array $overrides = array() ): array {
		return array_merge( get_option( 'videopack_options', array() ), $overrides );
	}

	public function tear_down() {
		remove_all_filters( 'videopack_url_exists' );
		parent::tear_down();
	}

	/**
	 * Confirms the underlying premise: PHP's own URL validator (what this
	 * plugin uses to decide "is this string a valid remote video URL")
	 * accepts a URL containing an unescaped double-quote, so the injection
	 * payload used below is a genuinely reachable input, not a contrived
	 * one bypassing normal validation.
	 */
	public function test_filter_validate_url_accepts_an_unescaped_quote_in_the_query_string(): void {
		$malicious = 'https://evil.example.com/v.mp4?x="><script>alert(1)</script>';

		$this->assertTrue( \Videopack\Common\Validate::filter_validate_url( $malicious ) );
	}

	public function test_source_url_with_embedded_quote_does_not_break_out_of_the_src_attribute(): void {
		add_filter( 'videopack_url_exists', '__return_true' );

		$malicious_url = 'https://evil.example.com/v.mp4?x="><script>alert(document.domain)</script>';

		$player = new Player_Video_Js( $this->options() );
		$html   = $player->get_player_code( array( 'src' => $malicious_url ) );

		$this->assertNotEmpty( $html, 'sanity: a source should actually have been rendered for this assertion to mean anything' );
		$this->assertStringNotContainsString( '<script>alert(document.domain)</script>', $html );
		$this->assertStringContainsString( esc_url( $malicious_url ), $html );
	}

	public function test_source_type_with_embedded_quote_is_escaped(): void {
		$html = $this->render_source_elements(
			array(
				array(
					'src'  => 'https://example.com/v.mp4',
					'type' => 'video/mp4" onmouseover="alert(1)',
				),
			)
		);

		$this->assertStringNotContainsString( 'onmouseover="alert(1)"', $html );
	}

	public function test_source_codecs_with_embedded_quote_is_escaped_without_double_encoding_the_delimiters(): void {
		$html = $this->render_source_elements(
			array(
				array(
					'src'    => 'https://example.com/v.mp4',
					'type'   => 'video/mp4',
					'codecs' => 'avc1.42E01E" onmouseover="alert(1)',
				),
			)
		);

		$this->assertStringNotContainsString( 'onmouseover="alert(1)"', $html );
		// The literal &quot; delimiters around the codecs parameter (required
		// MIME-type syntax) must survive as single entities, not become
		// double-escaped &amp;quot; from esc_attr() running on the already-
		// concatenated string instead of the raw codecs value alone.
		$this->assertStringContainsString( 'codecs=&quot;', $html );
		$this->assertStringNotContainsString( '&amp;quot;', $html );
	}

	public function test_source_resolution_and_default_res_are_escaped(): void {
		$html = $this->render_source_elements(
			array(
				array(
					'src'         => 'https://example.com/v.mp4',
					'type'        => 'video/mp4',
					'resolution'  => '720" onmouseover="alert(1)',
					'default_res' => '1" onmouseover="alert(2)',
				),
			)
		);

		$this->assertStringNotContainsString( 'onmouseover="alert(1)"', $html );
		$this->assertStringNotContainsString( 'onmouseover="alert(2)"', $html );
	}

	/**
	 * Invokes the protected get_source_elements()/get_source_atts() pair
	 * directly via the videopack_video_player_html_sources filter, which
	 * lets a caller substitute the flat sources list outright -- avoids
	 * needing a real Source object (network calls, attachment fixtures)
	 * just to exercise this pure string-building logic.
	 */
	protected function render_source_elements( array $sources ): string {
		add_filter( 'videopack_url_exists', '__return_true' );
		add_filter(
			'videopack_video_player_html_sources',
			static function () use ( $sources ) {
				return $sources;
			}
		);

		$player = new Player_Video_Js( $this->options() );
		$html   = $player->get_player_code( array( 'src' => 'https://example.com/placeholder.mp4' ) );

		remove_all_filters( 'videopack_video_player_html_sources' );

		return $html;
	}
}
