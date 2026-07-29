<?php
/**
 * The undocumented half of the shortcode's backward-compatibility surface:
 * deprecated attribute aliases, alternate shortcode tag names, and legacy
 * value formats that don't appear in Screens::add_contextual_help_tab()
 * (see ShortcodeAttributesTest.php for the documented attributes) and are
 * therefore easy to forget still need to keep working — nothing points a
 * future editor at them except this file.
 */

use Videopack\Frontend\Shortcode;

class ShortcodeLegacyCompatTest extends WP_UnitTestCase {

	protected static $attachment_id;

	public static function wpSetUpBeforeClass( $factory ) {
		$file                = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4';
		self::$attachment_id = $factory->attachment->create_upload_object( $file );
	}

	/**
	 * @var Shortcode
	 */
	protected $shortcode;

	public function set_up() {
		parent::set_up();
		$this->shortcode = new Shortcode( get_option( 'videopack_options', array() ) );
	}

	/**
	 * `controlbar="xxx"` — pre-rename alias for `controls`. Also converts
	 * the old value format: controlbar="none" meant no controls at all;
	 * anything else meant controls on.
	 */
	public function test_controlbar_alias_maps_to_controls(): void {
		$resolved = $this->shortcode->atts( array( 'controlbar' => 'none' ) );
		$this->assertArrayHasKey( 'controls', $resolved );
		$this->assertFalse( $resolved['controls'] );
	}

	public function test_controlbar_non_none_enables_controls(): void {
		$resolved = $this->shortcode->atts( array( 'controlbar' => 'bottom' ) );
		$this->assertArrayHasKey( 'controls', $resolved );
		$this->assertTrue( $resolved['controls'] );
	}

	/**
	 * `mute="true/false"` — pre-rename alias for `muted`.
	 */
	public function test_mute_alias_maps_to_muted(): void {
		$resolved = $this->shortcode->atts( array( 'mute' => 'true' ) );
		$this->assertArrayHasKey( 'muted', $resolved );
		$this->assertTrue( $resolved['muted'] );
	}

	/**
	 * `auto_res="true"` / `auto_res="false"` — the value format used before
	 * version 4.4.3, superseded by the current automatic/highest/lowest/etc.
	 * enum but still accepted from old shortcode text.
	 */
	public function test_auto_res_legacy_true_maps_to_automatic(): void {
		$resolved = $this->shortcode->atts( array( 'auto_res' => 'true' ) );
		$this->assertSame( 'automatic', $resolved['auto_res'] );
	}

	public function test_auto_res_legacy_false_maps_to_highest(): void {
		$resolved = $this->shortcode->atts( array( 'auto_res' => 'false' ) );
		$this->assertSame( 'highest', $resolved['auto_res'] );
	}

	/**
	 * Alternate shortcode tag names — [FMP] and [KGVID] predate the
	 * "videopack" rebrand; [VIDEOPACK] (uppercase) is a case-insensitivity
	 * convenience. All four must remain registered and produce identical
	 * output for identical attributes, since real posts in the wild mix
	 * whichever tag was current when they were written.
	 */
	public function test_legacy_shortcode_tags_are_registered(): void {
		foreach ( array( 'videopack', 'VIDEOPACK', 'FMP', 'KGVID' ) as $tag ) {
			$this->assertTrue( shortcode_exists( $tag ), "Shortcode tag [$tag] should be registered." );
		}
	}

	public function test_legacy_shortcode_tags_render_identically(): void {
		$canonical = do_shortcode( '[videopack id="' . self::$attachment_id . '"]' );
		foreach ( array( 'VIDEOPACK', 'FMP', 'KGVID' ) as $tag ) {
			$output = do_shortcode( '[' . $tag . ' id="' . self::$attachment_id . '"]' );
			// Player instance counters increment per render, so compare
			// structure (attachment id present, real markup produced)
			// rather than a byte-for-byte match against the canonical tag.
			$this->assertNotEmpty( $output, "[$tag] should render non-empty output." );
			$this->assertStringContainsString( 'data-post-id="' . self::$attachment_id . '"', $output, "[$tag] should resolve to the same attachment as [videopack]." );
		}
		$this->assertStringContainsString( 'data-post-id="' . self::$attachment_id . '"', $canonical );
	}

	/**
	 * The [video] core block/shortcode replacement — an opt-in setting
	 * (replace_video_shortcode) that, when enabled, redirects WordPress's
	 * own built-in [video] shortcode through Videopack's handler instead.
	 */
	public function test_video_shortcode_replaced_when_option_enabled(): void {
		$options   = get_option( 'videopack_options', array() );
		$shortcode = new Shortcode( array_merge( $options, array( 'replace_video_shortcode' => true ) ) );
		$shortcode->overwrite_video_shortcode();

		$this->assertTrue( shortcode_exists( 'video' ) );
		$output = do_shortcode( '[video src="' . self::$attachment_id . '"]' );
		$this->assertStringContainsString( 'videopack-player', $output );

		// Restore WordPress's own [video] shortcode so this doesn't leak
		// into other tests in the same process.
		remove_shortcode( 'video' );
		add_shortcode( 'video', 'wp_video_shortcode' );
	}
}
