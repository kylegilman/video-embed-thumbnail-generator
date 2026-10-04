<?php
/**
 * End-to-end check, through the real shortcode -> Collection block render, of
 * how many videos a gallery shows with pagination on and off.
 *
 * With pagination off a gallery used to be silently capped at
 * gallery_per_page (6 by default, and Shortcode::atts() always fills it from
 * the options) with no pagination controls to reach the rest, and a `videos`
 * limit was ignored. The query-level behavior is covered in GalleryTest; this
 * guards the whole rendered path, including the attribute round trip through
 * block markup.
 */

use Videopack\Admin\Formats\Registry;
use Videopack\Frontend\Shortcode;

class GalleryPaginationRenderTest extends WP_UnitTestCase {

	/**
	 * Real uploads (a gallery only renders videos whose files exist).
	 *
	 * @var int[]
	 */
	protected static $video_ids = array();

	public static function wpSetUpBeforeClass( $factory ) {
		$file = dirname( __DIR__ ) . '/src/images/Adobestock_287460179.mp4';
		for ( $i = 0; $i < 4; $i++ ) {
			self::$video_ids[] = $factory->attachment->create_upload_object( $file );
		}
	}

	/**
	 * Renders a gallery shortcode with a per-page of 2, so 4 videos exceed it.
	 */
	protected function render( array $atts ): string {
		$options = array_merge( get_option( 'videopack_options', array() ), array( 'gallery_per_page' => 2 ) );
		$handler = new Shortcode( $options, new Registry( $options ) );

		return $handler->do(
			array_merge(
				array(
					'gallery'         => 'true',
					'gallery_source'  => 'all',
					'gallery_orderby' => 'menu_order',
				),
				$atts
			)
		);
	}

	protected function item_count( string $html ): int {
		return substr_count( $html, 'class="videopack-collection-item"' );
	}

	public function test_pagination_off_renders_every_video_not_just_one_pages_worth(): void {
		$html = $this->render( array( 'gallery_pagination' => 'false' ) );

		$this->assertSame( 4, $this->item_count( $html ) );
		$this->assertStringNotContainsString( 'videopack-pagination', $html );
	}

	public function test_pagination_off_renders_only_the_videos_limit_when_one_is_set(): void {
		$html = $this->render( array( 'gallery_pagination' => 'false', 'videos' => '3' ) );

		$this->assertSame( 3, $this->item_count( $html ) );
	}

	public function test_pagination_on_renders_one_page_and_the_controls(): void {
		$html = $this->render( array( 'gallery_pagination' => 'true' ) );

		$this->assertSame( 2, $this->item_count( $html ) );
		$this->assertStringContainsString( 'videopack-pagination', $html );
	}
}
