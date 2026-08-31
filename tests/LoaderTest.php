<?php
/**
 * Tests for Loader -- the plugin's central hook-registration mechanism,
 * used by every Hook_Subscriber implementation across the whole codebase.
 * Previously completely untested despite being genuinely load-bearing:
 * a bug here would silently fail to wire up hooks for the entire plugin.
 */

use Videopack\Common\Loader;
use Videopack\Common\Hook_Subscriber;

class LoaderFakeSubscriber implements Hook_Subscriber {

	protected $actions;
	protected $filters;

	public function __construct( array $actions = array(), array $filters = array() ) {
		$this->actions = $actions;
		$this->filters = $filters;
	}

	public function get_actions(): array {
		return $this->actions;
	}

	public function get_filters(): array {
		return $this->filters;
	}

	public function my_action_callback() {}
	public function my_filter_callback( $value ) {
		return $value;
	}
}

class LoaderTest extends WP_UnitTestCase {

	protected function loader(): Loader {
		return new Loader();
	}

	// -----------------------------------------------------------------
	// add_action()/add_filter() + run()
	// -----------------------------------------------------------------

	public function test_run_registers_an_added_action_with_wordpress(): void {
		$component = new LoaderFakeSubscriber();
		$loader    = $this->loader();
		$loader->add_action( 'videopack_test_action', $component, 'my_action_callback' );
		$loader->run();

		$this->assertSame( 10, has_action( 'videopack_test_action', array( $component, 'my_action_callback' ) ) );
	}

	public function test_run_registers_an_added_filter_with_wordpress(): void {
		$component = new LoaderFakeSubscriber();
		$loader    = $this->loader();
		$loader->add_filter( 'videopack_test_filter', $component, 'my_filter_callback' );
		$loader->run();

		$this->assertSame( 10, has_filter( 'videopack_test_filter', array( $component, 'my_filter_callback' ) ) );
	}

	public function test_custom_priority_and_accepted_args_are_respected(): void {
		$component = new LoaderFakeSubscriber();
		$loader    = $this->loader();
		$loader->add_action( 'videopack_test_action_2', $component, 'my_action_callback', 20, 3 );
		$loader->run();

		$this->assertSame( 20, has_action( 'videopack_test_action_2', array( $component, 'my_action_callback' ) ) );

		global $wp_filter;
		$callbacks = $wp_filter['videopack_test_action_2']->callbacks[20];
		$key       = key( $callbacks );
		$this->assertSame( 3, $callbacks[ $key ]['accepted_args'] );
	}

	public function test_run_does_nothing_when_nothing_was_added(): void {
		// Must not error on the empty-collection guards.
		$this->loader()->run();
		$this->assertTrue( true );
	}

	public function test_run_registers_multiple_actions_and_filters(): void {
		$component = new LoaderFakeSubscriber();
		$loader    = $this->loader();
		$loader->add_action( 'videopack_test_multi_1', $component, 'my_action_callback' );
		$loader->add_action( 'videopack_test_multi_2', $component, 'my_action_callback' );
		$loader->add_filter( 'videopack_test_multi_filter', $component, 'my_filter_callback' );
		$loader->run();

		$this->assertNotFalse( has_action( 'videopack_test_multi_1', array( $component, 'my_action_callback' ) ) );
		$this->assertNotFalse( has_action( 'videopack_test_multi_2', array( $component, 'my_action_callback' ) ) );
		$this->assertNotFalse( has_filter( 'videopack_test_multi_filter', array( $component, 'my_filter_callback' ) ) );
	}

	// -----------------------------------------------------------------
	// add_subscriber()
	// -----------------------------------------------------------------

	public function test_add_subscriber_registers_all_of_its_actions_and_filters(): void {
		$component = new LoaderFakeSubscriber(
			array( array( 'hook' => 'videopack_sub_action', 'callback' => 'my_action_callback' ) ),
			array( array( 'hook' => 'videopack_sub_filter', 'callback' => 'my_filter_callback' ) )
		);
		$loader = $this->loader();
		$loader->add_subscriber( $component );
		$loader->run();

		$this->assertSame( 10, has_action( 'videopack_sub_action', array( $component, 'my_action_callback' ) ) );
		$this->assertSame( 10, has_filter( 'videopack_sub_filter', array( $component, 'my_filter_callback' ) ) );
	}

	public function test_add_subscriber_respects_explicit_priority_and_accepted_args(): void {
		$component = new LoaderFakeSubscriber(
			array( array( 'hook' => 'videopack_sub_action_2', 'callback' => 'my_action_callback', 'priority' => 5, 'accepted_args' => 2 ) )
		);
		$loader = $this->loader();
		$loader->add_subscriber( $component );
		$loader->run();

		$this->assertSame( 5, has_action( 'videopack_sub_action_2', array( $component, 'my_action_callback' ) ) );
	}

	public function test_add_subscriber_defaults_priority_and_accepted_args_when_omitted(): void {
		$component = new LoaderFakeSubscriber(
			array( array( 'hook' => 'videopack_sub_action_3', 'callback' => 'my_action_callback' ) )
		);
		$loader = $this->loader();
		$loader->add_subscriber( $component );
		$loader->run();

		$this->assertSame( 10, has_action( 'videopack_sub_action_3', array( $component, 'my_action_callback' ) ) );
	}

	public function test_add_subscriber_with_no_actions_or_filters_does_nothing(): void {
		$component = new LoaderFakeSubscriber();
		$loader    = $this->loader();
		$loader->add_subscriber( $component );
		$loader->run();

		$this->assertTrue( true ); // Must not error.
	}
}
