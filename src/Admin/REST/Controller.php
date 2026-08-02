<?php
/**
 * Base REST Controller for Videopack.
 *
 * @package Videopack
 */

namespace Videopack\Admin\REST;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Controller
 *
 * Provides shared functionality for Videopack REST controllers.
 */
abstract class Controller extends \WP_REST_Controller implements Hook_Subscriber {

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $format_registry
	 */
	protected $format_registry;

	/**
	 * REST namespace.
	 *
	 * @var string $namespace
	 */
	protected $namespace = 'videopack/v1';

	/**
	 * Constructor.
	 *
	 * @param array                             $options         Plugin options.
	 * @param \Videopack\Admin\Formats\Registry $format_registry Video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry = null ) {
		$this->options         = $options;
		$this->format_registry = $format_registry;
	}

	/**
	 * Default implementation for getting actions.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'rest_api_init',
				'callback' => 'register_routes',
			),
		);
	}

	/**
	 * Default implementation for getting filters.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array();
	}

	/**
	 * Permission check for making video thumbnails.
	 *
	 * @return bool
	 */
	public function can_make_thumbnails() {
		return current_user_can( 'make_video_thumbnails' );
	}

	/**
	 * Permission check for encoding videos.
	 *
	 * @return bool
	 */
	public function can_encode_videos() {
		return current_user_can( 'encode_videos' );
	}

	/**
	 * Permission check for managing options.
	 *
	 * @return bool
	 */
	public function can_manage_options() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Permissions callback for public routes.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return bool
	 */
	public function public_permissions( \WP_REST_Request $request ): bool {
				/**
		 * Filters public access permission for Videopack public REST endpoints.
		 *
		 * @since 5.0.0
		 *
		 * @param bool             $allowed Whether access is allowed.
		 * @param \WP_REST_Request $request The REST request.
		 */
		return (bool) apply_filters( 'videopack_rest_public_permission', true, $request );
	}
}
