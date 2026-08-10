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
	 * Strips detailed FFmpeg error output from a job/format array unless the
	 * current user has manage_options.
	 *
	 * Encode_Format::set_error() stores its plugin-authored prefix message
	 * with raw, unbounded ffmpeg stderr appended (Encode_Attachment::
	 * start_encode()) -- callers with only encode_videos or upload_files
	 * (both commonly delegated to non-admin roles) shouldn't be able to use
	 * that error text as a file-existence/content oracle by crafting inputs
	 * and reading back what ffmpeg reports about them. A real admin still
	 * sees the full detail, unchanged, for legitimate troubleshooting.
	 *
	 * @param array $item A job or format array, containing 'error' and/or 'error_message' keys if present.
	 * @return array The same array, with those keys redacted for non-admin callers.
	 */
	protected function redact_encode_error_for_response( array $item ): array {
		if ( current_user_can( 'manage_options' ) ) {
			return $item;
		}

		$generic_message = __( 'Encoding failed. Contact a site administrator for details.', 'video-embed-thumbnail-generator' );

		if ( ! empty( $item['error'] ) ) {
			$item['error'] = $generic_message;
		}
		if ( ! empty( $item['error_message'] ) ) {
			$item['error_message'] = $generic_message;
		}

		return $item;
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
