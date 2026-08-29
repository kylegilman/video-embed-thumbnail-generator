<?php
/**
 * Tests for Video_Finder -- scans post content for Videopack video
 * instances (both the `videopack/player-container` block and the
 * `[videopack]`/`[VIDEOPACK]`/`[KGVID]`/`[FMP]` shortcode aliases).
 * find_first() feeds Metadata::get_first_embedded_video() (og:video meta
 * tags), and find_all() feeds Schema::get_json_ld() (JSON-LD VideoObject
 * markup) -- both trust whatever this class decides is "first" or "all".
 */

use Videopack\Frontend\Video_Finder;

class VideoFinderTest extends WP_UnitTestCase {

	// -----------------------------------------------------------------
	// Blocks.
	// -----------------------------------------------------------------

	public function test_finds_a_single_block_by_attachment_id(): void {
		$content = '<!-- wp:videopack/player-container {"id":42} /-->';

		$result = Video_Finder::find_all( $content );

		$this->assertCount( 1, $result );
		$this->assertSame( 42, $result[0]['id'] );
	}

	public function test_finds_multiple_top_level_blocks(): void {
		$content = '<!-- wp:videopack/player-container {"id":1} /-->' .
			'<!-- wp:paragraph --><p>text</p><!-- /wp:paragraph -->' .
			'<!-- wp:videopack/player-container {"id":2} /-->';

		$result = Video_Finder::find_all( $content );

		$this->assertCount( 2, $result );
		$this->assertSame( 1, $result[0]['id'] );
		$this->assertSame( 2, $result[1]['id'] );
	}

	public function test_finds_a_block_nested_inside_another_block(): void {
		$content = '<!-- wp:group --><div class="wp-block-group">' .
			'<!-- wp:videopack/player-container {"id":7} /-->' .
			'</div><!-- /wp:group -->';

		$result = Video_Finder::find_all( $content );

		$this->assertCount( 1, $result );
		$this->assertSame( 7, $result[0]['id'] );
	}

	public function test_ignores_non_videopack_blocks(): void {
		$content = '<!-- wp:paragraph --><p>just text</p><!-- /wp:paragraph -->';

		$this->assertSame( array(), Video_Finder::find_all( $content ) );
	}

	// -----------------------------------------------------------------
	// Shortcodes.
	// -----------------------------------------------------------------

	public function test_finds_a_shortcode_with_an_id_attribute(): void {
		$result = Video_Finder::find_all( '[videopack id="42"]' );

		$this->assertCount( 1, $result );
		$this->assertSame( '42', $result[0]['id'] );
	}

	public function test_shortcode_with_numeric_inner_content_becomes_id(): void {
		$result = Video_Finder::find_all( '[videopack]42[/videopack]' );

		$this->assertCount( 1, $result );
		$this->assertSame( 42, $result[0]['id'] );
	}

	public function test_shortcode_with_non_numeric_inner_content_becomes_src(): void {
		$result = Video_Finder::find_all( '[videopack]https://example.com/video.mp4[/videopack]' );

		$this->assertCount( 1, $result );
		$this->assertSame( 'https://example.com/video.mp4', $result[0]['src'] );
	}

	public function test_explicit_id_attribute_wins_over_inner_content(): void {
		$result = Video_Finder::find_all( '[videopack id="5"]https://example.com/other.mp4[/videopack]' );

		$this->assertSame( '5', $result[0]['id'] );
		$this->assertArrayNotHasKey( 'src', $result[0] );
	}

	public function test_self_closing_shortcode_is_still_parsed(): void {
		$result = Video_Finder::find_all( '[videopack id="5"]' );

		$this->assertCount( 1, $result );
		$this->assertSame( '5', $result[0]['id'] );
	}

	/**
	 * @dataProvider shortcode_alias_provider
	 */
	public function test_all_shortcode_aliases_are_recognized( string $tag ): void {
		$result = Video_Finder::find_all( "[$tag id=\"9\"]" );

		$this->assertCount( 1, $result );
		$this->assertSame( '9', $result[0]['id'] );
	}

	public function shortcode_alias_provider(): array {
		return array(
			'lowercase videopack' => array( 'videopack' ),
			'uppercase VIDEOPACK' => array( 'VIDEOPACK' ),
			'legacy KGVID'        => array( 'KGVID' ),
			'legacy FMP'          => array( 'FMP' ),
		);
	}

	public function test_multiple_shortcodes_are_all_found_in_order(): void {
		$content = '[videopack id="1"] some text [videopack id="2"]';

		$result = Video_Finder::find_all( $content );

		$this->assertCount( 2, $result );
		$this->assertSame( '1', $result[0]['id'] );
		$this->assertSame( '2', $result[1]['id'] );
	}

	public function test_unrelated_shortcode_is_ignored(): void {
		$this->assertSame( array(), Video_Finder::find_all( '[gallery ids="1,2,3"]' ) );
	}

	// -----------------------------------------------------------------
	// Mixed content / find_first() / no-match cases.
	// -----------------------------------------------------------------

	public function test_empty_content_finds_nothing(): void {
		$this->assertSame( array(), Video_Finder::find_all( '' ) );
		$this->assertNull( Video_Finder::find_first( '' ) );
	}

	public function test_find_first_returns_null_when_nothing_found(): void {
		$this->assertNull( Video_Finder::find_first( '<p>no videos here</p>' ) );
	}

	public function test_find_first_returns_the_only_match(): void {
		$result = Video_Finder::find_first( '[videopack id="42"]' );

		$this->assertSame( '42', $result['id'] );
	}

	/**
	 * Blocks and shortcodes are found via two separate passes -- find_all()
	 * must interleave them by each match's real position in $content, not
	 * just concatenate "all blocks" then "all shortcodes", or find_first()
	 * (Metadata::get_first_embedded_video(), used for og:video meta tags)
	 * would silently pick the wrong video for any post mixing the two
	 * (e.g. a raw shortcode left in a Custom HTML block alongside a real
	 * Videopack block).
	 */
	public function test_find_first_respects_actual_document_order_when_a_shortcode_precedes_a_block(): void {
		$content = '[videopack id="1"]' . // appears first in the raw content
			'<!-- wp:videopack/player-container {"id":2} /-->'; // appears second

		$result = Video_Finder::find_first( $content );

		$this->assertSame( '1', $result['id'] );
	}

	public function test_find_first_respects_actual_document_order_when_a_block_precedes_a_shortcode(): void {
		$content = '<!-- wp:videopack/player-container {"id":2} /-->' . // appears first
			'[videopack id="1"]'; // appears second

		$result = Video_Finder::find_first( $content );

		$this->assertSame( 2, $result['id'] );
	}

	public function test_find_all_interleaves_blocks_and_shortcodes_by_position(): void {
		$content = '[videopack id="1"]' .
			'<!-- wp:videopack/player-container {"id":2} /-->' .
			'[videopack id="3"]';

		$result = Video_Finder::find_all( $content );

		$this->assertCount( 3, $result );
		$this->assertSame( '1', $result[0]['id'] );
		$this->assertSame( 2, $result[1]['id'] );
		$this->assertSame( '3', $result[2]['id'] );
	}

	// -----------------------------------------------------------------
	// Per-content caching.
	// -----------------------------------------------------------------

	public function test_different_content_strings_are_cached_independently(): void {
		$first_content  = '[videopack id="1"]';
		$second_content = '[videopack id="2"]';

		// Call in an order designed to catch a cache-key collision: prime
		// both, then re-read the first one to confirm it wasn't clobbered.
		$first_result  = Video_Finder::find_all( $first_content );
		$second_result = Video_Finder::find_all( $second_content );
		$first_again   = Video_Finder::find_all( $first_content );

		$this->assertSame( '1', $first_result[0]['id'] );
		$this->assertSame( '2', $second_result[0]['id'] );
		$this->assertSame( $first_result, $first_again );
	}
}
