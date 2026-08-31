<?php
use Videopack\Frontend\Video_Players\Player_Factory;
use Videopack\Frontend\Video_Players\Player_Video_Js;
use Videopack\Frontend\Video_Players\Player_WordPress_Default;
use Videopack\Frontend\Video_Players\Player;

class PlayerFactoryTest extends WP_UnitTestCase {

	protected function options(): array {
		return get_option( 'videopack_options', array() );
	}

	public function test_video_js_embed_method_returns_player_video_js(): void {
		$this->assertInstanceOf( Player_Video_Js::class, Player_Factory::create( 'Video.js', $this->options() ) );
	}

	public function test_wordpress_default_embed_method_returns_player_wordpress_default(): void {
		$this->assertInstanceOf( Player_WordPress_Default::class, Player_Factory::create( 'WordPress Default', $this->options() ) );
	}

	public function test_unrecognized_embed_method_returns_the_base_player(): void {
		$player = Player_Factory::create( 'SomeUnknownPlayer', $this->options() );

		$this->assertInstanceOf( Player::class, $player );
		$this->assertNotInstanceOf( Player_Video_Js::class, $player );
	}

	/**
	 * Player_Factory::create() used to unconditionally construct a base
	 * Player before the switch statement even ran, then immediately
	 * discard and replace it whenever the switch matched -- which it does
	 * for every real embed method. Since the player-instance counter
	 * (Player::$video_player_id_counter) increments in the constructor and
	 * is shared across all subclasses (declared once on the base class,
	 * never redeclared), the discarded instance's construction still burned
	 * a counter increment, so successive players' IDs skipped by 2 instead
	 * of 1. Moving the default into the switch's own default: arm means
	 * only the player type actually needed is ever constructed.
	 */
	public function test_ids_increment_by_one_for_successive_players(): void {
		$first  = Player_Factory::create( 'Video.js', $this->options() );
		$second = Player_Factory::create( 'Video.js', $this->options() );

		$this->assertSame( 1, (int) $second->get_id() - (int) $first->get_id() );
	}

	public function test_result_is_filterable(): void {
		$sentinel = new Player_Video_Js( $this->options() );
		add_filter(
			'videopack_video_player',
			static function () use ( $sentinel ) {
				return $sentinel;
			}
		);

		$result = Player_Factory::create( 'WordPress Default', $this->options() );
		remove_all_filters( 'videopack_video_player' );

		$this->assertSame( $sentinel, $result );
	}
}
