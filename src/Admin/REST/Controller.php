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
	 * Ensures a valid attachment ID, creating one from URL if needed.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return int|\WP_Error
	 */
	protected function ensure_attachment_id( \WP_REST_Request $request ) {
		$attachment_id = (int) $request->get_param( 'attachment_id' );

		if ( 0 === $attachment_id ) {
			$url       = $request->get_param( 'url' );
			$parent_id = (int) $request->get_param( 'parent_id' );
			if ( $url ) {
				$attachment_meta = new \Videopack\Admin\Attachment_Meta( $this->options );
				$attachment      = new \Videopack\Admin\Attachment( $this->options, $this->format_registry, $attachment_meta );
				$resolved        = $attachment->resolve_url_to_attachment( $url, $parent_id, true );
				if ( is_wp_error( $resolved ) ) {
					return $resolved;
				}
				return (int) $resolved;
			}
		}
		return $attachment_id;
	}
}
