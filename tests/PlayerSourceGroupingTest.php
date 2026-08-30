<?php
/**
 * Tests for Player::set_sources()/get_source_groups() -- grouping sources
 * by codec (sorted by codec efficiency, most efficient first), sorting
 * sources within each group by resolution (descending), and the
 * auto_res-driven default_res selection ('highest'/'lowest'/a numeric
 * target's "smallest resolution that still meets it" best-fit search).
 * Previously completely untested despite being real, independently
 * specifiable selection logic that decides which resolution actually
 * autoplays for a visitor.
 */

use Videopack\Frontend\Video_Players\Player_Video_Js;
use Videopack\Video_Source\Source_Factory;

/**
 * Minimal test double: a real Source_Url (so codec/resolution detection
 * runs through the real Video_Codec/Registry matching logic, not a hand-
 * rolled stub) whose child sources are injected directly, avoiding the
 * need for real encoded attachment fixtures just to test the grouping/
 * sorting/default_res algorithm itself.
 */
class PlayerSourceGroupingTestDouble extends \Videopack\Video_Source\Source_Url {
	protected $test_children = array();

	public function set_test_children( array $children ): void {
		$this->test_children = $children;
	}

	public function get_child_sources(): array {
		return $this->test_children;
	}
}

class PlayerSourceGroupingTest extends WP_UnitTestCase {

	public function set_up() {
		parent::set_up();
		add_filter( 'videopack_url_exists', '__return_true' );
	}

	public function tear_down() {
		remove_all_filters( 'videopack_url_exists' );
		parent::tear_down();
	}

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	protected function registry(): \Videopack\Admin\Formats\Registry {
		return new \Videopack\Admin\Formats\Registry( $this->options() );
	}

	/**
	 * @param string $url    Distinct URL (its extension determines the
	 *                       detected codec: .webm -> vp9, .mp4 -> h264).
	 * @param int    $width  Actual detected width.
	 * @param int    $height Actual detected height.
	 */
	protected function source_with_dimensions( string $url, int $width, int $height ) {
		$source = Source_Factory::create( $url, $this->options(), $this->registry() );
		$source->set_metadata( array( 'actualwidth' => $width, 'actualheight' => $height ) );
		return $source;
	}

	/**
	 * Builds a Player with one vp9 source (the "main" one, resolution
	 * $vp9_resolutions[0]) plus additional vp9 child resolutions and a
	 * single h264 child, matching the fixture every test in this file
	 * shares: vp9 (efficiency 30) must sort ahead of h264 (efficiency 20)
	 * as the "first" (most efficient) group.
	 */
	protected function player_with_sources( array $vp9_resolutions, string $auto_res = 'automatic' ): Player_Video_Js {
		$main = new PlayerSourceGroupingTestDouble( 'https://videos.example.test/video-0.webm', $this->options(), $this->registry() );
		$main->set_metadata( array( 'actualwidth' => $vp9_resolutions[0][0], 'actualheight' => $vp9_resolutions[0][1] ) );

		$children = array();
		foreach ( array_slice( $vp9_resolutions, 1 ) as $i => $dims ) {
			$children[] = $this->source_with_dimensions( "https://videos.example.test/video-vp9-{$i}.webm", $dims[0], $dims[1] );
		}
		$children[] = $this->source_with_dimensions( 'https://videos.example.test/video.mp4', 1280, 720 );
		$main->set_test_children( $children );

		$player = new Player_Video_Js( $this->options() );
		$player->set_atts( array( 'auto_res' => $auto_res ) );
		$player->set_source( $main );

		return $player;
	}

	// -----------------------------------------------------------------
	// Grouping by codec, sorted by efficiency (most efficient first).
	// -----------------------------------------------------------------

	public function test_groups_are_ordered_by_codec_efficiency_most_efficient_first(): void {
		$player = $this->player_with_sources( array( array( 1920, 1080 ) ) );

		$codec_ids = array_keys( $player->get_source_groups() );

		$this->assertSame( array( 'vp9', 'h264' ), $codec_ids, 'vp9 (efficiency 30) must sort ahead of h264 (efficiency 20)' );
	}

	public function test_sources_within_a_group_are_sorted_by_resolution_descending(): void {
		$player = $this->player_with_sources( array( array( 1280, 720 ), array( 1920, 1080 ), array( 854, 480 ) ) );

		$resolutions = array_column( $player->get_source_groups()['vp9']['sources'], 'resolution' );

		$this->assertSame( array( 1080, 720, 480 ), $resolutions );
	}

	// -----------------------------------------------------------------
	// default_res selection -- only within the first (most efficient) group.
	// -----------------------------------------------------------------

	public function test_auto_res_highest_selects_the_largest_resolution(): void {
		$player = $this->player_with_sources( array( array( 1280, 720 ), array( 1920, 1080 ), array( 854, 480 ) ), 'highest' );
		$player->get_source_groups();

		$method = new ReflectionProperty( $player, 'default_res' );
		$method->setAccessible( true );

		$this->assertSame( '1080', $method->getValue( $player ) );
	}

	public function test_auto_res_lowest_selects_the_smallest_resolution(): void {
		$player = $this->player_with_sources( array( array( 1280, 720 ), array( 1920, 1080 ), array( 854, 480 ) ), 'lowest' );
		$player->get_source_groups();

		$method = new ReflectionProperty( $player, 'default_res' );
		$method->setAccessible( true );

		$this->assertSame( '480', $method->getValue( $player ) );
	}

	public function test_auto_res_target_selects_smallest_resolution_meeting_or_exceeding_it(): void {
		// Target 720: 480 doesn't qualify, 720 exactly qualifies and is the
		// smallest of the qualifying resolutions (720, 1080).
		$player = $this->player_with_sources( array( array( 1280, 720 ), array( 1920, 1080 ), array( 854, 480 ) ), '720p' );
		$player->get_source_groups();

		$method = new ReflectionProperty( $player, 'default_res' );
		$method->setAccessible( true );

		$this->assertSame( '720', $method->getValue( $player ) );
	}

	/**
	 * When no available resolution meets the requested target, the
	 * best-fit search (which only ever advances $best_fit_index forward
	 * through the descending-sorted list when a candidate still qualifies)
	 * never moves off its initial value of 0 -- the highest available
	 * resolution -- rather than, say, falling back to the lowest or
	 * leaving no default set at all.
	 */
	public function test_auto_res_target_higher_than_any_available_resolution_falls_back_to_the_highest(): void {
		$player = $this->player_with_sources( array( array( 1280, 720 ), array( 1920, 1080 ), array( 854, 480 ) ), '4320p' );
		$player->get_source_groups();

		$method = new ReflectionProperty( $player, 'default_res' );
		$method->setAccessible( true );

		$this->assertSame( '1080', $method->getValue( $player ) );
	}

	public function test_automatic_auto_res_sets_no_default_resolution(): void {
		$player = $this->player_with_sources( array( array( 1280, 720 ), array( 1920, 1080 ) ), 'automatic' );
		$player->get_source_groups();

		$method = new ReflectionProperty( $player, 'default_res' );
		$method->setAccessible( true );

		$this->assertSame( '', $method->getValue( $player ) );
	}

	public function test_the_selected_default_res_source_is_flagged_in_its_group(): void {
		$player = $this->player_with_sources( array( array( 1280, 720 ), array( 1920, 1080 ) ), 'highest' );

		$sources = $player->get_source_groups()['vp9']['sources'];
		$this->assertSame( '1', $sources[0]['default_res'] );
		$this->assertArrayNotHasKey( 'default_res', $sources[1] );
	}

	public function test_default_res_selection_is_scoped_to_the_first_group_only(): void {
		// h264 is the second (less efficient) group here -- 'highest' must
		// not also flag anything inside it.
		$player = $this->player_with_sources( array( array( 1280, 720 ), array( 1920, 1080 ) ), 'highest' );

		$h264_sources = $player->get_source_groups()['h264']['sources'];
		foreach ( $h264_sources as $source ) {
			$this->assertArrayNotHasKey( 'default_res', $source );
		}
	}
}
