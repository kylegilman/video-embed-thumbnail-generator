<?php
/**
 * PHPStan Bootstrap File
 *
 * Defines global plugin constants for static analysis.
 *
 * @package Videopack
 */

define( 'VIDEOPACK_BASENAME', 'video-embed-thumbnail-generator/video-embed-thumbnail-generator.php' );
define( 'VIDEOPACK_PLUGIN_FILE', dirname( __DIR__ ) . '/video-embed-thumbnail-generator.php' );
define( 'VIDEOPACK_PLUGIN_DIR', dirname( __DIR__ ) . '/' );
define( 'VIDEOPACK_VERSION', '5.0' );
define( 'VIDEOPACK_VIDEOJS_VERSION', '8.23.7' );
define( 'VIDEOPACK_FREEMIUS_ENABLED', true );

if ( ! class_exists( 'Freemius' ) ) {
	class Freemius {
		public function override_i18n( $arg ) {}
		public function add_filter( $tag, $function_to_add = null, $priority = 10, $accepted_args = 1 ) {}
		public function add_action( $tag, $function_to_add = null, $priority = 10, $accepted_args = 1 ) {}
		public function get_user() {}
		public function _account_page_render() {}
		public function _addons_page_render() {}
		public function is_pending_activation() {}
		public function is_registered() {}
		public function is_network_active() {}
	}
}

if ( ! function_exists( 'fs_is_network_admin' ) ) {
	function fs_is_network_admin() {
		return false;
	}
}

if ( ! class_exists( 'ActionScheduler' ) ) {
	class ActionScheduler {
		public static function store() {
			return new class {
				public function fetch_action( $action_id ) {
					return new class {
						public function get_args() {
							return array();
						}
					};
				}
			};
		}
	}
}

if ( ! class_exists( 'ActionScheduler_Store' ) ) {
	class ActionScheduler_Store {
		const STATUS_PENDING  = 'pending';
		const STATUS_RUNNING  = 'running';
		const STATUS_COMPLETE = 'complete';
		const STATUS_FAILED   = 'failed';

		public static function instance() {
			return new self();
		}
	}
}

if ( ! function_exists( 'as_has_scheduled_action' ) ) {
	function as_has_scheduled_action( $hook, $args = array(), $group = '' ) {
		return false;
	}
}

if ( ! function_exists( 'as_schedule_recurring_action' ) ) {
	function as_schedule_recurring_action( $timestamp, $interval_in_seconds, $hook, $args = array(), $group = '', $unique = false ) {
		return 0;
	}
}

if ( ! function_exists( 'as_schedule_single_action' ) ) {
	function as_schedule_single_action( $timestamp, $hook, $args = array(), $group = '', $unique = false ) {
		return 0;
	}
}

if ( ! function_exists( 'as_get_scheduled_actions' ) ) {
	function as_get_scheduled_actions( $args = array(), $return_format = 'ids' ) {
		return array();
	}
}

if ( ! function_exists( 'as_unschedule_action' ) ) {
	function as_unschedule_action( $hook, $args = array(), $group = '' ) {
		return false;
	}
}

if ( ! function_exists( 'as_enqueue_async_action' ) ) {
	function as_enqueue_async_action( $hook, $args = array(), $group = '', $unique = false ) {
		return 0;
	}
}
