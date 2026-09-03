<?php
/**
 * Tests for the simple Container -- a shared-instance service locator used
 * to wire up the plugin's core services. Previously completely untested.
 */

use Videopack\Common\Container;

class ContainerTest extends WP_UnitTestCase {

	public function test_get_returns_the_instance_that_was_set(): void {
		$container = new Container();
		$service   = new stdClass();

		$container->set( 'my_service', $service );

		$this->assertSame( $service, $container->get( 'my_service' ) );
	}

	public function test_get_returns_null_for_an_id_that_was_never_set(): void {
		$container = new Container();

		$this->assertNull( $container->get( 'never_set' ) );
	}

	public function test_has_is_false_before_set_and_true_after(): void {
		$container = new Container();

		$this->assertFalse( $container->has( 'my_service' ) );

		$container->set( 'my_service', new stdClass() );

		$this->assertTrue( $container->has( 'my_service' ) );
	}

	public function test_set_overwrites_a_previous_instance_for_the_same_id(): void {
		$container = new Container();
		$first     = new stdClass();
		$second    = new stdClass();

		$container->set( 'my_service', $first );
		$container->set( 'my_service', $second );

		$this->assertSame( $second, $container->get( 'my_service' ) );
	}

	public function test_ids_are_independent_of_each_other(): void {
		$container = new Container();
		$container->set( 'service_a', 'value-a' );

		$this->assertFalse( $container->has( 'service_b' ) );
		$this->assertNull( $container->get( 'service_b' ) );
	}

	public function test_a_falsy_non_null_value_is_still_reported_as_set(): void {
		$container = new Container();
		$container->set( 'my_flag', false );

		$this->assertTrue( $container->has( 'my_flag' ) );
		$this->assertFalse( $container->get( 'my_flag' ) );
	}

	/**
	 * has() is implemented with isset(), which treats an explicitly-stored
	 * null the same as "never set". No current caller in the codebase ever
	 * set()s a null service, so this isn't a reachable bug today -- but it
	 * does mean has() answers "is this a non-null service?" rather than the
	 * more literal "was set() ever called for this id?". Documented here so
	 * a future caller doesn't trip over it.
	 */
	public function test_has_is_false_for_an_explicitly_set_null_value(): void {
		$container = new Container();
		$container->set( 'my_service', null );

		$this->assertFalse( $container->has( 'my_service' ) );
	}
}
