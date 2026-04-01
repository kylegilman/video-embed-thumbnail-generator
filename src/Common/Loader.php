<?php
/**
 * Orchestrates the hooks of the plugin.
 *
 * @package Videopack
 */

namespace Videopack\Common;

/**
 * Class Loader
 *
 * Register all actions and filters for the plugin.
 *
 * Maintains a list of all hooks that are registered throughout
 * the plugin, and register them with the WordPress API. Call the
 * run function to execute the list of actions and filters.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Common
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Loader {

	/**
	 * The array of actions registered with WordPress.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      array    $actions    The actions registered with WordPress to fire when the plugin loads.
	 */
	protected $actions;

	/**
	 * The array of filters registered with WordPress.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      array    $filters    The filters registered with WordPress to fire when the plugin loads.
	 */
	protected $filters;

	/**
	 * Initialize the collections used to maintain the actions and filters.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {

		$this->actions = (array) array();
		$this->filters = (array) array();
	}

	/**
	 * Add a new action to the collection to be registered with WordPress.
	 *
	 * @since 1.0.0
	 *
	 * @param string $hook          The name of the WordPress action that is being registered.
	 * @param object $component     A reference to the instance of the object on which the action is defined.
	 * @param string $callback      The name of the function definition on the $component.
	 * @param int    $priority      Optional. The priority at which the function should be fired. Default is 10.
	 * @param int    $accepted_args Optional. The number of arguments that should be passed to the $callback. Default is 1.
	 * @return void
	 */
	public function add_action( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
		$this->actions = (array) $this->add( (array) $this->actions, (string) $hook, $component, (string) $callback, (int) $priority, (int) $accepted_args );
	}

	/**
	 * Add a new filter to the collection to be registered with WordPress.
	 *
	 * @since 1.0.0
	 *
	 * @param string $hook          The name of the WordPress filter that is being registered.
	 * @param object $component     A reference to the instance of the object on which the filter is defined.
	 * @param string $callback      The name of the function definition on the $component.
	 * @param int    $priority      Optional. The priority at which the function should be fired. Default is 10.
	 * @param int    $accepted_args Optional. The number of arguments that should be passed to the $callback. Default is 1.
	 * @return void
	 */
	public function add_filter( $hook, $component, $callback, $priority = 10, $accepted_args = 1 ) {
		$this->filters = (array) $this->add( (array) $this->filters, (string) $hook, $component, (string) $callback, (int) $priority, (int) $accepted_args );
	}

	/**
	 * Registers a component's hooks via the Hook_Subscriber interface.
	 *
	 * @since 5.0.0
	 *
	 * @param Hook_Subscriber $component The component to register.
	 * @return void
	 */
	public function add_subscriber( Hook_Subscriber $component ) {
		foreach ( $component->get_actions() as $action ) {
			$this->add_action(
				$action['hook'],
				$component,
				$action['callback'],
				$action['priority'] ?? 10,
				$action['accepted_args'] ?? 1
			);
		}

		foreach ( $component->get_filters() as $filter ) {
			$this->add_filter(
				$filter['hook'],
				$component,
				$filter['callback'],
				$filter['priority'] ?? 10,
				$filter['accepted_args'] ?? 1
			);
		}
	}

	/**
	 * A utility function that is used to register the actions and hooks into a single
	 * collection.
	 *
	 * @since 1.0.0
	 *
	 * @param array  $hooks         The collection of hooks that is being registered (that is, actions or filters).
	 * @param string $hook          The name of the WordPress filter that is being registered.
	 * @param object $component     A reference to the instance of the object on which the filter is defined.
	 * @param string $callback      The name of the function definition on the $component.
	 * @param int    $priority      The priority at which the function should be fired.
	 * @param int    $accepted_args The number of arguments that should be passed to the $callback.
	 * @return array The collection of actions and filters registered with WordPress.
	 */
	private function add( array $hooks, $hook, $component, $callback, $priority, $accepted_args ) {

		$hooks[] = array(
			'hook'          => (string) $hook,
			'component'     => $component,
			'callback'      => (string) $callback,
			'priority'      => (int) $priority,
			'accepted_args' => (int) $accepted_args,
		);

		return (array) $hooks;
	}

	/**
	 * Register the filters and actions with WordPress.
	 *
	 * @since    1.0.0
	 * @return void
	 */
	public function run() {

		if ( ! empty( $this->filters ) ) {
			foreach ( (array) $this->filters as $hook ) {
				add_filter( (string) $hook['hook'], array( $hook['component'], (string) $hook['callback'] ), (int) $hook['priority'], (int) $hook['accepted_args'] );
			}
		}

		if ( ! empty( $this->actions ) ) {
			foreach ( (array) $this->actions as $hook ) {
				add_action( (string) $hook['hook'], array( $hook['component'], (string) $hook['callback'] ), (int) $hook['priority'], (int) $hook['accepted_args'] );
			}
		}
	}
}
