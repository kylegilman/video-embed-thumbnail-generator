<?php
/**
 * REST Controller for Videopack settings.
 *
 * @package Videopack
 */

namespace Videopack\Admin\REST;

/**
 * Class Settings_Controller
 *
 * Manages REST API endpoints for plugin settings, defaults, and cache.
 */
class Settings_Controller extends Controller {

	/**
	 * Registers REST API routes for settings.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/settings',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'can_manage_options' ),
					'args'                => $this->get_settings_args(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/settings/defaults',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'defaults' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			$this->namespace,
			'/settings/cache',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'clear_cache' ),
				'permission_callback' => array( $this, 'can_manage_options' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/ffmpeg-test',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'ffmpeg_test' ),
				'permission_callback' => array( $this, 'can_manage_options' ),
				'args'                => array(
					'codec'      => array( 'type' => 'string' ),
					'resolution' => array( 'type' => 'string' ),
					'rotate'     => array( 'type' => array( 'boolean', 'string' ) ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/freemius/(?P<page>[\w-]+)',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_freemius_page_html' ),
				'permission_callback' => array( $this, 'can_manage_options' ),
				'args'                => array(
					'page' => array(
						'type'     => 'string',
						'required' => true,
						'enum'     => array( 'account', 'add-ons' ),
					),
				),
			)
		);
	}

	/**
	 * REST callback to update plugin settings.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The updated settings.
	 */
	public function update_settings( \WP_REST_Request $request ) {
		$params  = $request->get_params();
		$options = array_merge( $this->options, $params );
		update_option( 'videopack_options', $options );
		$this->options = $options;

		return apply_filters( 'videopack_rest_update_settings', new \WP_REST_Response( $this->options, 200 ), $request );
	}

	/**
	 * REST callback to get default settings.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response object.
	 */
	public function defaults( \WP_REST_Request $request ) {
		$option_manager = new \Videopack\Admin\Options();
		$defaults       = $option_manager->get_default();

		return apply_filters( 'videopack_rest_defaults', new \WP_REST_Response( $defaults, 200 ), $request );
	}

	/**
	 * REST callback to clear transiet cache.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response object.
	 */
	public function clear_cache( \WP_REST_Request $request ) {
		$cleanup = new \Videopack\Admin\Cleanup();
		$cleanup->delete_transients();

		return apply_filters( 'videopack_rest_clear_cache', new \WP_REST_Response( array( 'success' => true ), 200 ), $request );
	}

	/**
	 * REST callback for FFmpeg test encode.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function ffmpeg_test( \WP_REST_Request $request ) {
		$codec      = (string) $request->get_param( 'codec' );
		$resolution = (string) $request->get_param( 'resolution' );
		$format     = $codec . '_' . $resolution;
		$rotate     = (bool) $request->get_param( 'rotate' );

		$tester = new \Videopack\Admin\Encode\FFmpeg_Tester( $this->options, $this->format_registry );
		$result = $tester->run_test_encode( $format, $rotate );

		if ( isset( $result['output'] ) && strpos( (string) $result['output'], 'Invalid video format' ) !== false ) {
			return new \WP_Error( 'rest_invalid_format', (string) $result['output'], array( 'status' => 400 ) );
		}

		return apply_filters( 'videopack_rest_ffmpeg_test', new \WP_REST_Response( $result, 200 ), $request );
	}

	/**
	 * REST callback to get Freemius page HTML.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error HTML or error.
	 */
	public function get_freemius_page_html( \WP_REST_Request $request ) {
		if ( ! function_exists( 'videopack_fs' ) ) {
			return new \WP_Error( 'freemius_not_found', 'Freemius SDK not available.', array( 'status' => 500 ) );
		}

		$page_slug = (string) $request->get_param( 'page' );
		$freemius  = videopack_fs();

		ob_start();
		switch ( $page_slug ) {
			case 'account':
				if ( ! is_object( $freemius->get_user() ) ) {
					ob_end_clean();
					return new \WP_Error( 'freemius_no_user', 'Freemius user data not available.', array( 'status' => 403 ) );
				}
				$freemius->_account_page_render();
				break;
			case 'add-ons':
				$freemius->_addons_page_render();
				break;
			default:
				ob_end_clean();
				return new \WP_Error( 'invalid_freemius_page', 'Invalid Freemius page.', array( 'status' => 404 ) );
		}

		return apply_filters( 'videopack_rest_get_freemius_page_html', new \WP_REST_Response( array( 'html' => ob_get_clean() ), 200 ), $request );
	}

	/**
	 * Helper to get settings arguments from schema.
	 *
	 * @return array
	 */
	private function get_settings_args() {
		return array(); // Placeholder for specific schema if needed.
	}
}
