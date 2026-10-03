<?php
/**
 * An explicitly requested width/height must win over a video's native
 * dimensions even when it happens to equal the site's global default.
 *
 * Player::get_final_width()/get_final_height() already used "was one
 * provided?" for this (see PlayerDimensionsTest), but upstream code pre-filled
 * the global default into the attributes it handed to Player, and
 * Shortcode::get_final_atts() and Gallery::prepare_video_data_for_js() still
 * compared the value against the default -- so a genuine request for
 * exactly the default size was indistinguishable from "never set one" and got
 * replaced by the native size. These tests cover each layer that had to
 * change: Shortcode::atts() no longer defaults width/height, get_final_atts()
 * asks whether one was provided, Blocks no longer merges the options' width/
 * height beneath block attributes (which also kept the default out of the
 * pagination data-settings-cache), and Gallery's own AJAX-path override.
 */

use Videopack\Frontend\Shortcode;
use Videopack\Frontend\Gallery;
use Videopack\Admin\Attachment_Meta;
use Videopack\Admin\Formats\Registry;
use Videopack\Video_Source\Source_Factory;

class ExplicitDimensionsTest extends WP_UnitTestCase {

	/**
	 * Real upload with known native dimensions (4096x2304), shared by the class.
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

	protected function shortcode( array $option_overrides = array() ): Shortcode {
		$options = $this->options( $option_overrides );
		return new Shortcode( $options, new Registry( $options ) );
	}

	protected function source( int $id = 0 ) {
		$options = $this->options();
		return Source_Factory::create( $id ? $id : self::$video_id, $options, new Registry( $options ) );
	}

	/**
	 * Decodes the data-player-vars JSON from the first player in some HTML.
	 */
	protected function player_vars( string $html ): array {
		$this->assertSame( 1, preg_match( '/data-player-vars="([^"]+)"/', $html, $matches ), 'no player rendered' );
		return json_decode( html_entity_decode( $matches[1] ), true );
	}

	// -----------------------------------------------------------------
	// Shortcode::atts() -- no pre-filled default.
	// -----------------------------------------------------------------

	public function test_atts_omits_width_and_height_when_none_were_provided(): void {
		$atts = $this->shortcode()->atts( array() );

		$this->assertArrayNotHasKey( 'width', $atts );
		$this->assertArrayNotHasKey( 'height', $atts );
	}

	public function test_atts_keeps_width_and_height_when_provided_even_if_equal_to_the_default(): void {
		$atts = $this->shortcode( array( 'width' => 960, 'height' => 540 ) )->atts( array( 'width' => '960', 'height' => '540' ) );

		$this->assertSame( '960', $atts['width'] );
		$this->assertSame( '540', $atts['height'] );
	}

	// -----------------------------------------------------------------
	// Shortcode::get_final_atts()
	// -----------------------------------------------------------------

	public function test_final_atts_keep_an_explicit_width_and_height_equal_to_the_global_default(): void {
		$shortcode = $this->shortcode( array( 'width' => 960, 'height' => 540 ) );

		$final = $shortcode->get_final_atts( array( 'id' => self::$video_id, 'width' => 960, 'height' => 540 ), $this->source() );

		$this->assertSame( '960', (string) $final['width'] );
		$this->assertSame( '540', (string) $final['height'] );
	}

	public function test_final_atts_keep_an_explicit_non_default_width(): void {
		$final = $this->shortcode()->get_final_atts( array( 'id' => self::$video_id, 'width' => 640 ), $this->source() );

		$this->assertSame( '640', (string) $final['width'] );
	}

	public function test_final_atts_use_native_dimensions_when_none_were_requested(): void {
		$final = $this->shortcode()->get_final_atts( array( 'id' => self::$video_id ), $this->source() );

		$this->assertSame( 4096, $final['width'] );
		$this->assertSame( 2304, $final['height'] );
	}

	public function test_final_atts_resolve_width_and_height_independently(): void {
		// fixed_aspect is passed explicitly (so a cached per-video meta default can't override it): with the default 'vertical' mode, a
		// requested width smaller than the video's native height makes
		// get_final_atts() treat the pair as portrait and recompute the height
		// from the default ratio, which is a separate rule from this one.
		$final = $this->shortcode()->get_final_atts( array( 'id' => self::$video_id, 'width' => 640, 'fixed_aspect' => 'false' ), $this->source() );

		$this->assertSame( '640', (string) $final['width'], 'the requested width is kept' );
		$this->assertSame( 2304, $final['height'], 'the unrequested height still falls back to native' );
	}

	/**
	 * Source::get_width()/get_height() themselves fall back from probed native
	 * dimensions to the per-video saved size, so that is what an unrequested
	 * dimension resolves to for an attachment without probed metadata.
	 */
	public function test_final_atts_fall_back_to_the_per_video_saved_size_without_native_dimensions(): void {
		$attachment_id = self::factory()->attachment->create_object(
			array(
				'file'           => 'no-such-file.mp4',
				'post_mime_type' => 'video/mp4',
				'post_status'    => 'inherit',
			)
		);
		( new Attachment_Meta( $this->options(), $attachment_id ) )->save( array( 'width' => '800', 'height' => '450' ) );

		$final = $this->shortcode()->get_final_atts( array( 'id' => $attachment_id, 'fixed_aspect' => 'false' ), $this->source( $attachment_id ) );

		$this->assertSame( 800, $final['width'] );
		$this->assertSame( 450, $final['height'] );
	}

	public function test_final_atts_fall_back_to_the_global_default_for_a_source_with_no_dimensions_at_all(): void {
		// A plain URL has no attachment, so no probed or saved dimensions.
		$source = Source_Factory::create( 'https://example.test/remote.mp4', $this->options(), new Registry( $this->options() ) );
		$this->assertSame( 0, $source->get_width(), 'sanity: a bare URL has no dimensions' );

		$final = $this->shortcode( array( 'width' => 1280, 'height' => 720 ) )->get_final_atts( array( 'src' => 'https://example.test/remote.mp4', 'fixed_aspect' => 'false' ), $source );

		$this->assertSame( 1280, (int) $final['width'] );
		$this->assertSame( 720, (int) $final['height'] );
	}

	public function test_final_atts_still_resolve_a_full_width_request(): void {
		$final = $this->shortcode( array( 'width' => 800, 'height' => 450 ) )->get_final_atts(
			array( 'id' => self::$video_id, 'width' => '100%' ),
			$this->source()
		);

		$this->assertSame( 800, $final['width'] );
		$this->assertSame( 450, $final['height'] );
		$this->assertSame( 'true', $final['fullwidth'] );
	}

	// -----------------------------------------------------------------
	// End to end: shortcode and block rendering.
	// -----------------------------------------------------------------

	public function test_rendered_shortcode_keeps_an_explicit_default_sized_request(): void {
		$options = $this->options();

		$vars = $this->player_vars(
			$this->shortcode()->do(
				array(
					'id'     => (string) self::$video_id,
					'width'  => (string) $options['width'],
					'height' => (string) $options['height'],
				)
			)
		);

		$this->assertSame( (int) $options['width'], $vars['width'] );
		$this->assertSame( (int) $options['height'], $vars['height'] );
	}

	public function test_rendered_shortcode_uses_native_dimensions_when_none_requested(): void {
		$vars = $this->player_vars( $this->shortcode()->do( array( 'id' => (string) self::$video_id ) ) );

		$this->assertSame( 4096, $vars['width'] );
		$this->assertSame( 2304, $vars['height'] );
	}

	public function test_rendered_block_keeps_an_explicit_default_sized_width(): void {
		$options = $this->options();
		$markup  = '<!-- wp:videopack/player-container {"id":' . self::$video_id . ',"width":' . (int) $options['width'] . '} -->'
			. '<!-- wp:videopack/player /-->'
			. '<!-- /wp:videopack/player-container -->';

		$vars = $this->player_vars( do_blocks( $markup ) );

		$this->assertSame( (int) $options['width'], $vars['width'] );
	}

	public function test_rendered_block_uses_native_dimensions_when_no_width_is_set(): void {
		$markup = '<!-- wp:videopack/player-container {"id":' . self::$video_id . '} -->'
			. '<!-- wp:videopack/player /-->'
			. '<!-- /wp:videopack/player-container -->';

		$vars = $this->player_vars( do_blocks( $markup ) );

		$this->assertSame( 4096, $vars['width'] );
		$this->assertSame( 2304, $vars['height'] );
	}

	// -----------------------------------------------------------------
	// Pagination data-settings-cache must not echo the default back as
	// if it were an explicit request.
	// -----------------------------------------------------------------

	protected function settings_cache( string $html ): array {
		$this->assertSame( 1, preg_match( '/data-settings-cache="([^"]+)"/', $html, $matches ), 'no data-settings-cache rendered' );
		return json_decode( html_entity_decode( $matches[1] ), true );
	}

	protected function gallery_html( array $extra_atts = array() ): string {
		return $this->shortcode()->do(
			array_merge(
				array(
					'gallery'            => 'true',
					'gallery_source'     => 'all',
					'gallery_pagination' => 'true',
					'gallery_per_page'   => '1',
				),
				$extra_atts
			)
		);
	}

	public function test_settings_cache_does_not_contain_a_default_width_or_height(): void {
		$cache = $this->settings_cache( $this->gallery_html() );

		$this->assertArrayNotHasKey( 'width', $cache );
		$this->assertArrayNotHasKey( 'height', $cache );
	}

	public function test_settings_cache_carries_an_explicitly_requested_width(): void {
		$cache = $this->settings_cache( $this->gallery_html( array( 'width' => '640' ) ) );

		$this->assertSame( '640', (string) $cache['width'] );
	}

	// -----------------------------------------------------------------
	// Gallery::prepare_video_data_for_js() -- the AJAX pagination path.
	// -----------------------------------------------------------------

	protected function gallery( array $options = array() ): Gallery {
		$options = $this->options( $options );
		return new Gallery( $options, new Registry( $options ) );
	}

	public function test_gallery_ajax_data_keeps_an_explicit_width_equal_to_the_global_default(): void {
		$data = $this->gallery( array( 'width' => 960, 'height' => 540 ) )->prepare_video_data_for_js(
			get_post( self::$video_id ),
			array(
				'width'  => 960,
				'height' => 540,
			)
		);

		$this->assertSame( 960, $data['player_vars']['width'] );
		$this->assertSame( 540, $data['player_vars']['height'] );
	}

	public function test_gallery_ajax_data_uses_native_dimensions_when_none_requested(): void {
		$data = $this->gallery()->prepare_video_data_for_js( get_post( self::$video_id ), array() );

		$this->assertSame( 4096, $data['player_vars']['width'] );
		$this->assertSame( 2304, $data['player_vars']['height'] );
	}
}
