<?php

namespace Videopack\Admin;

use Videopack\Common\Validate;

class Multisite {

	/**
	 * Videopack Options manager class instance
	 * @var Options $options_manager
	 */
	protected $options_manager;
	/**
	 * Holds the network-wide specific options.
	 * @var array $network_options
	 */
	protected $network_options;
	/**
	 * Holds the structure and default values for network-specific settings.
	 * @var array $default_network_settings_structure
	 */
	protected $default_network_options;
	/**
	 * Holds the plugin-wide default options.
	 * @var array $default_options
	 */
	protected $default_options;

	public function __construct( Options $options_manager ) {
		$this->options_manager         = $options_manager;
		$this->default_options         = $options_manager->get_default();
		$this->default_network_options = $this->get_default_network_settings_structure();
		$this->network_options         = get_site_option( 'videopack_network_options', array() );
	}

	public function get_default_network_settings_structure() {
		$network_defaults = array(
			'app_path'                        => $this->default_options['app_path'],
			'ffmpeg_exists'                   => $this->default_options['ffmpeg_exists'],
			'simultaneous_encodes'            => $this->default_options['simultaneous_encodes'],
			'threads'                         => $this->default_options['threads'],
			'nice'                            => $this->default_options['nice'],
			'default_capabilities'            => $this->default_options['capabilities'],
			'superadmin_only_ffmpeg_settings' => false,
			'network_error_email'             => $this->default_options['error_email'],
			'queue_control'                   => $this->default_options['queue_control'],
		);

		return $network_defaults;
	}

	public function init() {
		$new_options_key = 'videopack_network_options';
		$old_options_key = 'kgvid_video_embed_network_options';

		$current_network_options = get_site_option( $new_options_key, false );

		if ( false === $current_network_options ) { // New key doesn't exist
			$old_network_options = get_site_option( $old_options_key, false );

			if ( false !== $old_network_options && is_array( $old_network_options ) ) {
				// Old key exists, migrate from it
				$network_options_to_save = $this->options_manager->merge_options_with_defaults( $old_network_options, $this->default_network_options );
				// Ensure ffmpeg_exists is re-checked if it was 'notchecked' in old options
				if ( ( $network_options_to_save['ffmpeg_exists'] ?? 'notchecked' ) === 'notchecked' ) {
					$ffmpeg_info                              = $this->options_manager->check_ffmpeg_exists( $network_options_to_save['app_path'] ?? '' );
					$network_options_to_save['ffmpeg_exists'] = $ffmpeg_info['ffmpeg_exists'] ? true : 'notinstalled';
					$network_options_to_save['app_path']      = $ffmpeg_info['app_path'];
				}
				update_site_option( $new_options_key, $network_options_to_save );
				delete_site_option( $old_options_key ); // Delete old key after successful migration
				$this->network_options = $network_options_to_save;
			} else {
				// Neither new nor old key exists (fresh install scenario for network options)
				$network_options_to_save = $this->default_network_options;

				// Try to get main site's single-site options for potential initial population
				switch_to_blog( 1 );
				$main_site_options = get_option( 'videopack_options', array() );
				if ( empty( $main_site_options ) ) { // Fallback to old single-site key if new one is empty
					$main_site_options = get_option( 'kgvid_video_embed_options', array() );
				}
				restore_current_blog();

				if ( is_array( $main_site_options ) && ! empty( $main_site_options ) ) {
					foreach ( $this->default_network_options as $key => $default_value ) {
						if ( isset( $main_site_options[ $key ] ) ) {
							$network_options_to_save[ $key ] = $main_site_options[ $key ];
						}
					}
					if ( isset( $main_site_options['capabilities'] ) ) {
						$network_options_to_save['default_capabilities'] = $main_site_options['capabilities'];
					}
				}

				// Initial FFmpeg check
				if ( ( $network_options_to_save['ffmpeg_exists'] ?? 'notchecked' ) === 'notchecked' ) {
					$ffmpeg_info = $this->options_manager->check_ffmpeg_exists( $network_options_to_save['app_path'] ?? '' );
					$network_options_to_save['ffmpeg_exists'] = $ffmpeg_info['ffmpeg_exists'] ? true : 'notinstalled';
					$network_options_to_save['app_path']      = $ffmpeg_info['app_path'];
				}
				update_site_option( $new_options_key, $network_options_to_save );
				$this->network_options = $network_options_to_save;
			}
		} else {
			// Network options exist (under new key), merge them with current defaults to add any new settings
			$updated_network_options = $this->options_manager->merge_options_with_defaults( $current_network_options, $this->default_network_options );
			if ( $updated_network_options !== $current_network_options ) {
				update_site_option( $new_options_key, $updated_network_options );
			}
			$this->network_options = $updated_network_options;
		}

		// Initialize local options on the main site if they are empty
		$local_options = get_option( 'videopack_options' ); // Use new single-site option key

		if ( empty( $local_options ) ) {
			$main_site_defaults = $this->options_manager->get_default();
			// Override the 'capabilities' in main_site_defaults with network's default_capabilities
			if ( isset( $this->network_options['default_capabilities'] ) ) {
				$main_site_defaults['capabilities'] = $this->network_options['default_capabilities'];
			}
			update_option( 'videopack_options', $main_site_defaults );
			// Ensure capabilities are set on the main site based on network defaults
			if ( isset( $this->network_options['default_capabilities'] ) ) {
				$this->options_manager->set_capabilities( $this->network_options['default_capabilities'] );
			}
		}
		// Add hook for REST API routes
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	public static function is_videopack_active_for_network() {

		if ( ! is_multisite() ) {
			return false;
		}

		$plugins = get_site_option( 'active_sitewide_plugins' );
		if ( isset( $plugins[ VIDEOPACK_BASENAME ] ) ) {
			return true;
		}

		return false;
	}

	public function add_new_blog( $blog_id ) {

		switch_to_blog( $blog_id );

		$this->options_manager->set_capabilities( $this->network_options['default_capabilities'] ?? $this->default_network_options['default_capabilities'] );

		restore_current_blog();
	}

	public function network_admin_action_links( $links ) {

		$links[] = '<a href="' . network_admin_url() . 'settings.php?page=video_embed_thumbnail_generator_settings">' . esc_html__( 'Network Settings', 'video-embed-thumbnail-generator' ) . '</a>';
		return $links;
	}

	public function add_network_settings_page() {
		$page_hook_suffix = add_submenu_page(
			'settings.php',
			esc_html_x( 'Videopack', 'Settings page title', 'video-embed-thumbnail-generator' ),
			esc_html_x( 'Videopack', 'Settings page title in admin sidebar', 'video-embed-thumbnail-generator' ),
			'manage_network_options',
			'video_embed_thumbnail_generator_settings',
			array( $this, 'network_settings_page_react_root' ) // Changed callback
		);
		// Hook to enqueue assets for the React page
		add_action( 'admin_print_styles-' . $page_hook_suffix, array( $this, 'enqueue_network_settings_assets' ) );
		add_action( 'admin_print_scripts-' . $page_hook_suffix, array( $this, 'enqueue_network_settings_assets' ) );
	}

	public function add_network_queue_page() {
		if ( $this->is_videopack_active_for_network() && ( $this->network_options['ffmpeg_exists'] ?? false ) === true ) {
			add_submenu_page(
				'settings.php',
				esc_html_x( 'Videopack Encoding Queue', 'Tools page title', 'video-embed-thumbnail-generator' ),
				esc_html_x( 'Network Video Encode Queue', 'Title in network admin sidebar', 'video-embed-thumbnail-generator' ),
				'manage_network',
				'kgvid_network_video_encoding_queue',
				'kgvid_ffmpeg_queue_page'
			);
		}
	}

	public function validate_network_settings( $input ) {

		$options = $this->network_options; // Current network options
		$input   = Validate::text_field( $input ); // Recursively sanitizes all the settings

		if ( $input['app_path'] != $options['app_path'] ) {
			$input = $this->options_manager->validate_ffmpeg_settings( $input );
		} else {
			$input['ffmpeg_exists'] = $options['ffmpeg_exists'];
		}

		// load all settings and make sure they get a value of false if they weren't entered into the form
		foreach ( $this->get_default_network_settings_structure() as $key => $value ) {
			if ( ! array_key_exists( $key, $input ) ) {
				$input[ $key ] = false;
			}
		}

		if ( ! $input['queue_control'] ) { // don't reset queue control when saving settings
			$input['queue_control'] = $options['queue_control'];
		}

		return $input;
	}

	/**
	 * Outputs the root div for the React Network Settings page.
	 */
	public function network_settings_page_react_root() {
		echo '<div id="videopack-network-settings-root"></div>';
	}

	/**
	 * Enqueues assets for the React Network Settings page.
	 */
	public function enqueue_network_settings_assets() {
		// Assuming you have a separate build for network settings or can reuse the main settings page build
		// Adjust the script/style handles and paths as necessary.
		wp_enqueue_script(
			'videopack-network-settings-page',
			plugins_url( '../videopack-block/build/network-settings.js', __DIR__ ), // Example path
			array( 'wp-api', 'wp-i18n', 'wp-components', 'wp-element', 'wp-data' ),
			VIDEOPACK_VERSION,
			true
		);

		wp_enqueue_style(
			'videopack-network-settings-page-styles',
			plugins_url( '../videopack-block/build/network-settings.css', __DIR__ ), // Example path
			array( 'wp-components' ),
			VIDEOPACK_VERSION
		);

		// Pass network settings and defaults to the script
		wp_localize_script(
			'videopack-network-settings-page',
			'videopackNetworkSettings',
			array(
				'settings' => $this->network_options,
				'defaults' => $this->get_default_network_settings_structure(),
				'schema'   => $this->options_manager->settings_schema( $this->get_default_network_settings_structure() ),
				'nonce'    => wp_create_nonce( 'wp_rest' ),
				'rest_url' => rest_url( 'videopack/v1/network/settings' ),
			)
		);
	}

	/**
	 * Registers REST API routes for network settings.
	 */
	public function register_rest_routes() {
		register_rest_route(
			'videopack/v1',
			'/network/settings',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_network_settings_rest' ),
					'permission_callback' => function () {
						return current_user_can( 'manage_network_options' );
					},
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE, // Handles POST, PUT, PATCH
					'callback'            => array( $this, 'update_network_settings_rest' ),
					'permission_callback' => function () {
						return current_user_can( 'manage_network_options' );
					},
					'args'                => $this->options_manager->settings_schema( $this->get_default_network_settings_structure() ),
				),
			)
		);

		register_rest_route(
			'videopack/v1',
			'/network/settings/defaults',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_default_network_settings_rest' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_network_options' );
				},
			)
		);
	}

	/**
	 * REST API callback to get network settings.
	 * @return \WP_REST_Response
	 */
	public function get_network_settings_rest() {
		return new \WP_REST_Response( $this->network_options, 200 );
	}

	/**
	 * REST API callback to get default network settings.
	 * @return \WP_REST_Response
	 */
	public function get_default_network_settings_rest() {
		return new \WP_REST_Response( $this->get_default_network_settings_structure(), 200 );
	}

	/**
	 * REST API callback to update network settings.
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function update_network_settings_rest( \WP_REST_Request $request ) {
		$params = $request->get_params();
		// If 'kgvid_video_embed_options' is the key sent from React (matching the old form structure)
		// or if settings are sent at the root of the params.
		$input_settings = $params['videopack_network_settings'] ?? $params;

		$validated_options = $this->validate_network_settings( $input_settings );

		// Merge with existing to ensure no settings are lost if not all are passed
		$new_options = array_merge( $this->network_options, $validated_options );

		update_site_option( 'videopack_network_options', $new_options );
		$this->network_options = $new_options; // Update internal state

		// If default capabilities changed, update them for the main site.
		if ( isset( $new_options['default_capabilities'] ) ) {
			$this->options_manager->set_capabilities( $new_options['default_capabilities'] );
		}

		return new \WP_REST_Response( $this->network_options, 200 );
	}
}
