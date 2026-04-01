<?php
/**
 * Hook Subscriber interface.
 *
 * @package Videopack
 */

namespace Videopack\Common;

/**
 * Interface Hook_Subscriber
 *
 * Each component that registers its own hooks should implement this interface.
 *
 * @since 5.0.0
 */
interface Hook_Subscriber {

	/**
	 * Returns an array of actions that the component wishes to subscribe to.
	 *
	 * Each entry should be an array with the following format:
	 * [
	 *     'hook'          => string,
	 *     'callback'      => string|callable,
	 *     'priority'      => int (optional, default 10),
	 *     'accepted_args' => int (optional, default 1)
	 * ]
	 *
	 * @return array
	 */
	public function get_actions(): array;

	/**
	 * Returns an array of filters that the component wishes to subscribe to.
	 *
	 * Each entry should be an array with the following format:
	 * [
	 *     'hook'          => string,
	 *     'callback'      => string|callable,
	 *     'priority'      => int (optional, default 10),
	 *     'accepted_args' => int (optional, default 1)
	 * ]
	 *
	 * @return array
	 */
	public function get_filters(): array;
}
