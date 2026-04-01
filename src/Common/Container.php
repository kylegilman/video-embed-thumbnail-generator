<?php
/**
 * Simple Dependency Injection Container.
 *
 * @package Videopack
 */

namespace Videopack\Common;

/**
 * Class Container
 *
 * Maintains shared instances of core plugin services.
 *
 * @since 5.0.0
 */
class Container {

	/**
	 * Shared instances.
	 *
	 * @var array
	 */
	protected $services = array();

	/**
	 * Adds a service instance to the container.
	 *
	 * @param string $id       The service identifier.
	 * @param mixed  $instance The service instance.
	 * @return void
	 */
	public function set( $id, $instance ) {
		$this->services[ $id ] = $instance;
	}

	/**
	 * Retrieves a service instance from the container.
	 *
	 * @param string $id The service identifier.
	 * @return mixed|null The service instance or null if not found.
	 */
	public function get( $id ) {
		return $this->services[ $id ] ?? null;
	}

	/**
	 * Checks if a service exists in the container.
	 *
	 * @param string $id The service identifier.
	 * @return bool
	 */
	public function has( $id ) {
		return isset( $this->services[ $id ] );
	}
}
