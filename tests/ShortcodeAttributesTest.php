<?php
/**
 * Backward-compatibility net for the [videopack] shortcode: every attribute
 * documented in Screens::add_contextual_help_tab() (the reference 10,000+
 * live sites actually read) must keep parsing/rendering the way it does
 * today. A refactor that silently drops, renames, or re-types one of these
 * is exactly the kind of regression this file exists to catch — see
 * ShortcodeLegacyCompatTest.php for the *undocumented* legacy aliases,
 * which are even easier to forget and lose.
 */

use Videopack\Frontend\Shortcode;

class ShortcodeAttributesTest extends WP_UnitTestCase {

	/**
	 * A real uploaded video attachment, shared across the class — only the
	 * rendering-level assertions (test_renders_*) need it; the parsing-level
	 * ones (test_attribute_parses) don't touch the database at all.
	 *
	 * @var int
	 */
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
	 * Data provider covering every attribute documented in the shortcode
	 * reference help tab.
	 *
	 * Returns arrays of: [shortcode atts, resolved key, expected value].
	 */
	public function attribute_data_provider(): array {
		return array(
			// --- Single-video attributes ---
			'videos passthrough'                  => array( array( 'videos' => '5' ), 'videos', '5' ),
			'orderby passthrough'                 => array( array( 'orderby' => 'title' ), 'orderby', 'title' ),
			'orderby menu_order alias'            => array( array( 'orderby' => 'menu_order' ), 'orderby', 'menu_order ID' ),
			'order passthrough'                   => array( array( 'order' => 'DESC' ), 'order', 'DESC' ),
			'poster passthrough'                  => array( array( 'poster' => 'https://example.com/x.jpg' ), 'poster', 'https://example.com/x.jpg' ),
			'endofvideooverlay passthrough'       => array( array( 'endofvideooverlay' => 'https://example.com/end.jpg' ), 'endofvideooverlay', 'https://example.com/end.jpg' ),
			'width passthrough'                   => array( array( 'width' => '640' ), 'width', '640' ),
			'height passthrough'                  => array( array( 'height' => '360' ), 'height', '360' ),
			'fullwidth true'                       => array( array( 'fullwidth' => 'true' ), 'fullwidth', true ),
			'fullwidth false'                      => array( array( 'fullwidth' => 'false' ), 'fullwidth', false ),
			'fixed_aspect vertical'               => array( array( 'fixed_aspect' => 'vertical' ), 'fixed_aspect', 'vertical' ),
			'align passthrough'                   => array( array( 'align' => 'center' ), 'align', 'center' ),
			'inline true'                          => array( array( 'inline' => 'true' ), 'inline', true ),
			'volume passthrough'                  => array( array( 'volume' => '0.5' ), 'volume', '0.5' ),
			'muted true'                           => array( array( 'muted' => 'true' ), 'muted', true ),
			'controls false'                       => array( array( 'controls' => 'false' ), 'controls', false ),
			'loop true'                            => array( array( 'loop' => 'true' ), 'loop', true ),
			'autoplay true'                        => array( array( 'autoplay' => 'true' ), 'autoplay', true ),
			'playsinline true'                     => array( array( 'playsinline' => 'true' ), 'playsinline', true ),
			'skip_buttons true'                    => array( array( 'skip_buttons' => 'true' ), 'skip_buttons', true ),
			'gifmode true'                          => array( array( 'gifmode' => 'true' ), 'gifmode', true ),
			'pauseothervideos true'               => array( array( 'pauseothervideos' => 'true' ), 'pauseothervideos', true ),
			'preload passthrough'                  => array( array( 'preload' => 'auto' ), 'preload', 'auto' ),
			'start passthrough'                    => array( array( 'start' => '01:30' ), 'start', '01:30' ),
			'watermark passthrough'                => array( array( 'watermark' => 'https://example.com/w.png' ), 'watermark', 'https://example.com/w.png' ),
			'watermark_link_to passthrough'       => array( array( 'watermark_link_to' => 'download' ), 'watermark_link_to', 'download' ),
			'watermark_url passthrough'            => array( array( 'watermark_url' => 'https://example.com/' ), 'watermark_url', 'https://example.com/' ),
			'title passthrough'                    => array( array( 'title' => 'My Video' ), 'title', 'My Video' ),
			'embeddable true'                      => array( array( 'embeddable' => 'true' ), 'embeddable', true ),
			'embedcode custom text'               => array( array( 'embedcode' => 'Get the code' ), 'embedcode', 'Get the code' ),
			'view_count true'                      => array( array( 'view_count' => 'true' ), 'view_count', true ),
			'view_count false'                     => array( array( 'view_count' => 'false' ), 'view_count', false ),
			'count_views passthrough'             => array( array( 'count_views' => 'quarters' ), 'count_views', 'quarters' ),
			'caption passthrough'                  => array( array( 'caption' => 'A caption' ), 'caption', 'A caption' ),
			'description passthrough'              => array( array( 'description' => 'A description' ), 'description', 'A description' ),
			'downloadlink true'                    => array( array( 'downloadlink' => 'true' ), 'downloadlink', true ),
			'right_click false'                    => array( array( 'right_click' => 'false' ), 'right_click', false ),
			'resize false'                          => array( array( 'resize' => 'false' ), 'resize', false ),
			'auto_res passthrough'                 => array( array( 'auto_res' => '720p' ), 'auto_res', '720p' ),
			'pixel_ratio true'                      => array( array( 'pixel_ratio' => 'true' ), 'pixel_ratio', true ),
			'schema false'                          => array( array( 'schema' => 'false' ), 'schema', false ),

			// --- Subtitle/caption track attributes ---
			'track_src passthrough'                => array( array( 'track_src' => 'https://example.com/s.vtt' ), 'track_src', 'https://example.com/s.vtt' ),
			'track_kind passthrough'               => array( array( 'track_kind' => 'captions' ), 'track_kind', 'captions' ),
			'track_srclang passthrough'            => array( array( 'track_srclang' => 'fr' ), 'track_srclang', 'fr' ),
			'track_label passthrough'              => array( array( 'track_label' => 'French' ), 'track_label', 'French' ),
			'track_default passthrough'            => array( array( 'track_default' => 'default' ), 'track_default', 'default' ),

			// --- Video.js-only attributes ---
			'skin passthrough'                     => array( array( 'skin' => 'vjs-theme-city' ), 'skin', 'vjs-theme-city' ),

			// --- Gallery attributes ---
			'gallery true'                          => array( array( 'gallery' => 'true' ), 'gallery', true ),
			'gallery_exclude passthrough'          => array( array( 'gallery_exclude' => '15' ), 'gallery_exclude', '15' ),
			'gallery_include passthrough'          => array( array( 'gallery_include' => '65' ), 'gallery_include', '65' ),
			'gallery_orderby passthrough'          => array( array( 'gallery_orderby' => 'title' ), 'gallery_orderby', 'title' ),
			'gallery_orderby menu_order alias'    => array( array( 'gallery_orderby' => 'menu_order' ), 'gallery_orderby', 'menu_order ID' ),
			'gallery_order passthrough'            => array( array( 'gallery_order' => 'DESC' ), 'gallery_order', 'DESC' ),
			'gallery_id passthrough'               => array( array( 'gallery_id' => '241' ), 'gallery_id', '241' ),
			'gallery_end passthrough'              => array( array( 'gallery_end' => 'close' ), 'gallery_end', 'close' ),
			'gallery_per_page numeric string'     => array( array( 'gallery_per_page' => '12' ), 'gallery_per_page', '12' ),
			'gallery_per_page false disables'     => array( array( 'gallery_per_page' => 'false' ), 'gallery_per_page', 'false' ),
			'gallery_title false'                  => array( array( 'gallery_title' => 'false' ), 'gallery_title', false ),
		);
	}

	/**
	 * @dataProvider attribute_data_provider
	 */
	public function test_attribute_parses( array $atts, string $key, $expected ): void {
		$resolved = $this->shortcode->atts( $atts );
		$this->assertArrayHasKey( $key, $resolved, "Attribute '$key' should be a recognized shortcode attribute — if this fails, it's been dropped from Shortcode::atts()'s default/options attribute lists." );
		$this->assertSame( $expected, $resolved[ $key ] );
	}

	/**
	 * `id="xxx"` — the attribute the whole shortcode is built around.
	 */
	public function test_id_attribute_resolves_to_attachment(): void {
		$output = $this->shortcode->do( array( 'id' => (string) self::$attachment_id ) );
		$this->assertStringContainsString( 'data-post-id="' . self::$attachment_id . '"', $output );
		$this->assertStringContainsString( 'attachment_id&quot;:' . self::$attachment_id, $output );
	}

	/**
	 * `width`/`height` — must actually reach the rendered <video> element,
	 * not just survive attribute parsing.
	 */
	public function test_width_and_height_render(): void {
		$output = $this->shortcode->do(
			array(
				'id'     => (string) self::$attachment_id,
				'width'  => '640',
				'height' => '360',
			)
		);
		$this->assertStringContainsString( 'width="640"', $output );
		$this->assertStringContainsString( 'height="360"', $output );
	}

	/**
	 * `title="Video Title"` and `title="false"` (documented shorthand to
	 * disable the title overlay entirely).
	 */
	public function test_title_attribute_renders(): void {
		$output = $this->shortcode->do(
			array(
				'id'    => (string) self::$attachment_id,
				'title' => 'My Custom Title',
			)
		);
		$this->assertStringContainsString( 'My Custom Title', $output );
	}

	public function test_title_false_disables_title_overlay(): void {
		$output = $this->shortcode->do(
			array(
				'id'    => (string) self::$attachment_id,
				'title' => 'false',
			)
		);
		$this->assertStringNotContainsString( 'videopack-video-title', $output );
	}

	/**
	 * title="false" only suppresses the title text/background — the title
	 * block's own wrapper still has to render when downloadlink or
	 * embedcode is enabled, since (in the current block structure) those
	 * icon overlays are nested inside that same wrapper, not rendered
	 * independently of it.
	 */
	public function test_title_false_still_shows_download_icon(): void {
		$output = $this->shortcode->do(
			array(
				'id'           => (string) self::$attachment_id,
				'title'        => 'false',
				'downloadlink' => 'true',
			)
		);
		// 'videopack-title' (the text element's own class) must be absent,
		// even though 'videopack-video-title' (the wrapper bar) is still
		// present — they're deliberately different classes.
		$this->assertStringNotContainsString( 'videopack-title has-text-align', $output );
		$this->assertStringContainsString( 'videopack-download-link', $output );
	}

	/**
	 * `caption="Caption"` — displayed below the video.
	 */
	public function test_caption_renders(): void {
		$output = $this->shortcode->do(
			array(
				'id'      => (string) self::$attachment_id,
				'caption' => 'A test caption',
			)
		);
		$this->assertStringContainsString( 'A test caption', $output );
	}

	/**
	 * `downloadlink="true"` — shows a download icon/link.
	 */
	public function test_downloadlink_renders_download_element(): void {
		$output = $this->shortcode->do(
			array(
				'id'           => (string) self::$attachment_id,
				'downloadlink' => 'true',
			)
		);
		$this->assertStringContainsString( 'videopack-download', $output );
	}

	public function test_downloadlink_false_omits_download_element(): void {
		$output = $this->shortcode->do(
			array(
				'id'           => (string) self::$attachment_id,
				'downloadlink' => 'false',
			)
		);
		$this->assertStringNotContainsString( 'videopack-download-link', $output );
	}

	/**
	 * `view_count="true"` — shows the view count badge.
	 */
	public function test_view_count_true_renders_view_count_element(): void {
		$output = $this->shortcode->do(
			array(
				'id'         => (string) self::$attachment_id,
				'view_count' => 'true',
			)
		);
		$this->assertStringContainsString( 'videopack-view-count', $output );
	}

	/**
	 * `poster="..."` — overrides the thumbnail image.
	 */
	public function test_poster_overrides_thumbnail(): void {
		$output = $this->shortcode->do(
			array(
				'id'     => (string) self::$attachment_id,
				'poster' => 'https://example.com/custom-poster.jpg',
			)
		);
		$this->assertStringContainsString( 'custom-poster.jpg', $output );
	}

	/**
	 * `embeddable="false"` — disables embed/share icons.
	 */
	public function test_embeddable_false_disables_share_ui(): void {
		$output = $this->shortcode->do(
			array(
				'id'         => (string) self::$attachment_id,
				'embeddable' => 'false',
			)
		);
		$this->assertStringNotContainsString( 'videopack-share', $output );
	}

	/**
	 * `align="center"` — must reach the wrapper's classes.
	 */
	public function test_align_center_renders_centering_classes(): void {
		$output = $this->shortcode->do(
			array(
				'id'    => (string) self::$attachment_id,
				'align' => 'center',
			)
		);
		$this->assertStringContainsString( 'videopack-wrapper-auto-left', $output );
		$this->assertStringContainsString( 'videopack-wrapper-auto-right', $output );
	}

	/**
	 * `gallery="true"` — switches to the gallery/collection rendering path
	 * entirely (a different code path than a single video, so worth its
	 * own smoke test rather than trusting attribute parsing alone).
	 */
	public function test_gallery_true_renders_collection_markup(): void {
		$output = $this->shortcode->do(
			array(
				'gallery'         => 'true',
				'gallery_include' => (string) self::$attachment_id,
			)
		);
		$this->assertStringContainsString( 'videopack-collection-wrapper', $output );
		$this->assertStringContainsString( 'videopack-gallery-item', $output );
	}

	/**
	 * `gallery_thumb="150"` — legacy alias for the newer `gallery_columns`
	 * attribute, converted from a pixel width to a column count. Covered
	 * here (not ShortcodeLegacyCompatTest.php) because gallery_thumb is
	 * itself still documented in the current help tab, unlike the other
	 * legacy aliases.
	 */
	public function test_gallery_thumb_converts_to_gallery_columns(): void {
		$resolved = $this->shortcode->atts( array( 'gallery_thumb' => '100' ) );
		$this->assertArrayHasKey( 'gallery_columns', $resolved );
		$this->assertSame( 10, $resolved['gallery_columns'] ); // round(1000 / 100).
	}
}
