<?php
/**
 * Admin multisite handler.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

/**
 * Class Multisite
 *
 * Handles network-wide settings and operations for WordPress Multisite.
 *
 * This class manages network-specific options, overrides for site-specific
 * settings, migration of legacy network options, and integration with the
 * WordPress REST API for network management.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Multisite {

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
	 * Holds the network-wide specific options.
	 *
	 * @var array $network_options
	 */
	protected $network_options;

	/**
	 * Holds the structure and default values for network-specific settings.
	 *
	 * @var array $default_network_options
	 */
	protected $default_network_options;

	/**
	 * Holds the plugin-wide default options.
	 *
	 * @var array $default_options
	 */
	protected $default_options;

	/**
	 * Constructor.
	 *
	 * @param array $options Plugin options.
	 */
	public function __construct( array $options ) {
		$this->options                 = $options;
		$this->format_registry         = new Formats\Registry( $this->options );
		$this->default_options         = (array) ( new Options() )->get_default();
		$this->default_network_options = (array) $this->get_default_network_settings_structure();
		$this->network_options         = (array) get_site_option( 'videopack_network_options', array() );

		$this->init();
	}

	/**
	 * Gets the default network settings structure.
	 *
	 * @return array Default network settings.
	 */
	public function get_default_network_settings_structure() {
		return array(
			'app_path'                        => (string) ( $this->default_options['app_path'] ?? '' ),
			'ffmpeg_exists'                   => $this->default_options['ffmpeg_exists'] ?? 'notchecked',
			'simultaneous_encodes'            => (int) ( $this->default_options['simultaneous_encodes'] ?? 1 ),
			'threads'                         => (int) ( $this->default_options['threads'] ?? 1 ),
			'nice'                            => (bool) ( $this->default_options['nice'] ?? true ),
			'default_capabilities'            => (array) ( $this->default_options['capabilities'] ?? array() ),
			'superadmin_only_ffmpeg_settings' => false,
			'network_error_email'             => (string) ( $this->default_options['error_email'] ?? '' ),
			'queue_control'                   => (string) ( $this->default_options['queue_control'] ?? 'enabled' ),
		);
	}

	/**
	 * Returns network options.
	 *
	 * @return array Network options.
	 */
	public function get_options() {
		return (array) $this->network_options;
	}

	/**
	 * Returns network options statically.
	 *
	 * @return array Network options.
	 */
	public static function get_network_options() {
		return (array) get_site_option( 'videopack_network_options', array() );
	}

	/**
	 * Saves network options.
	 *
	 * @param array|null $options_to_save Optional. Options to save.
	 */
	public function save_options( array $options_to_save = null ) {
		$options_to_save = $options_to_save ?? $this->network_options;
		update_site_option( 'videopack_network_options', $options_to_save );

		if ( $options_to_save !== $this->network_options ) {
			$this->network_options = $options_to_save;
		}
	}

	/**
	 * Initializes multisite hooks and performs migrations.
	 */
	public function init() {
		// Apply capabilities to new sites.
		add_action( 'wpmu_new_blog', array( $this, 'add_new_blog' ) );

		// Add filter to override site-specific options with network settings if network activated.
		if ( $this->is_network_active() ) {
			add_filter( 'option_videopack_options', array( $this, 'override_local_options' ) );
			add_filter( 'default_option_videopack_options', array( $this, 'override_local_options' ) );
		}

		$new_options_key = 'videopack_network_options';
		$old_options_key = 'kgvid_video_embed_network_options';

		$current_network_options = get_site_option( $new_options_key, false );

		if ( false === $current_network_options ) {
			$old_network_options = get_site_option( $old_options_key, false );

			if ( is_array( $old_network_options ) && ! empty( $old_network_options ) ) {
				$options_instance        = new \Videopack\Admin\Options();
				$network_options_to_save = $options_instance->merge_options_with_defaults( $old_network_options, $this->default_network_options );

				if ( ( $network_options_to_save['ffmpeg_exists'] ?? 'notchecked' ) === 'notchecked' ) {
					$ffmpeg_tester                            = new \Videopack\Admin\Encode\FFmpeg_Tester( $this->options, $this->format_registry );
					$ffmpeg_info                              = $ffmpeg_tester->check_ffmpeg_exists( (string) ( $network_options_to_save['app_path'] ?? '' ) );
					$network_options_to_save['ffmpeg_exists'] = $ffmpeg_info['ffmpeg_exists'] ? true : 'notinstalled';
					$network_options_to_save['app_path']      = (string) $ffmpeg_info['app_path'];
				}
				update_site_option( $new_options_key, $network_options_to_save );
				delete_site_option( $old_options_key );
				$this->network_options = $network_options_to_save;
			} else {
				$network_options_to_save = $this->default_network_options;

				switch_to_blog( 1 );
				$main_site_options = get_option( 'videopack_options', array() );
				if ( empty( $main_site_options ) ) {
					$main_site_options = get_option( 'kgvid_video_embed_options', array() );
				}
				restore_current_blog();

				if ( is_array( $main_site_options ) && ! empty( $main_site_options ) ) {
					foreach ( $this->default_network_options as $key => $default_value ) {
						if ( isset( $main_site_options[ (string) $key ] ) ) {
							$network_options_to_save[ (string) $key ] = $main_site_options[ (string) $key ];
						}
					}
					if ( isset( $main_site_options['capabilities'] ) ) {
						$network_options_to_save['default_capabilities'] = (array) $main_site_options['capabilities'];
					}
				}

				if ( ( $network_options_to_save['ffmpeg_exists'] ?? 'notchecked' ) === 'notchecked' ) {
					$ffmpeg_tester                            = new \Videopack\Admin\Encode\FFmpeg_Tester( $this->options, $this->format_registry );
					$ffmpeg_info                              = $ffmpeg_tester->check_ffmpeg_exists( (string) ( $network_options_to_save['app_path'] ?? '' ) );
					$network_options_to_save['ffmpeg_exists'] = $ffmpeg_info['ffmpeg_exists'] ? true : 'notinstalled';
					$network_options_to_save['app_path']      = (string) $ffmpeg_info['app_path'];
				}
				update_site_option( $new_options_key, $network_options_to_save );
				$this->network_options = $network_options_to_save;
			}
		} else {
			$options_instance        = new \Videopack\Admin\Options();
			$updated_network_options = $options_instance->merge_options_with_defaults( (array) $current_network_options, $this->default_network_options );
			if ( $updated_network_options !== $current_network_options ) {
				update_site_option( $new_options_key, $updated_network_options );
			}
			$this->network_options = $updated_network_options;
		}

		// Initialize local options on the main site if they are empty.
		$local_options = get_option( 'videopack_options' );

		if ( empty( $local_options ) ) {
			$main_site_defaults = (array) ( new Options() )->get_default();
			if ( isset( $this->network_options['default_capabilities'] ) ) {
				$main_site_defaults['capabilities'] = (array) $this->network_options['default_capabilities'];
			}
			update_option( 'videopack_options', $main_site_defaults );
			if ( isset( $this->network_options['default_capabilities'] ) ) {
				( new Options() )->set_capabilities( (array) $this->network_options['default_capabilities'] );
			}
		}

		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	/**
	 * Checks if Videopack is active for the network.
	 *
	 * @return bool True if network active, false otherwise.
	 */
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

	/**
	 * Adds action links to the network admin plugins page.
	 *
	 * @param array $links The existing links.
	 * @return array The updated links.
	 */
	public function network_admin_action_links( $links ) {
		$links[] = '<a href="' . (string) network_admin_url( 'settings.php?page=video_embed_thumbnail_generator_settings' ) . '">' . (string) esc_html__( 'Network Settings', 'video-embed-thumbnail-generator' ) . '</a>';
		return (array) $links;
	}

	/**
	 * Adds the network settings page to the sidebar.
	 */
	public function add_network_settings_page() {
		$page_hook_suffix = (string) add_submenu_page(
			'settings.php',
			(string) esc_html_x( 'Videopack', 'Settings page title', 'video-embed-thumbnail-generator' ),
			(string) esc_html_x( 'Videopack', 'Settings page title in admin sidebar', 'video-embed-thumbnail-generator' ),
			'manage_network_options',
			'video_embed_thumbnail_generator_settings',
			array( $this, 'network_settings_page_react_root' )
		);

		add_action( 'admin_print_styles-' . $page_hook_suffix, array( $this, 'enqueue_network_settings_assets' ) );
		add_action( 'admin_print_scripts-' . $page_hook_suffix, array( $this, 'enqueue_network_settings_assets' ) );
	}

	/**
	 * Adds the network queue page to the sidebar.
	 */
	public function add_network_queue_page() {
		if ( $this->is_videopack_active_for_network() && true === ( $this->network_options['ffmpeg_exists'] ?? false ) ) {
			$page_hook_suffix = (string) add_submenu_page(
				'settings.php',
				(string) esc_html_x( 'Videopack Encoding Queue', 'Tools page title', 'video-embed-thumbnail-generator' ),
				(string) esc_html_x( 'Network Video Encode Queue', 'Title in network admin sidebar', 'video-embed-thumbnail-generator' ),
				'manage_network',
				'kgvid_network_video_encoding_queue',
				array( $this, 'network_queue_page_react_root' )
			);
			add_action( 'admin_print_styles-' . $page_hook_suffix, array( $this, 'enqueue_network_queue_assets' ) );
			add_action( 'admin_print_scripts-' . $page_hook_suffix, array( $this, 'enqueue_network_queue_assets' ) );
		}
	}

	/**
	 * Validates network settings input.
	 *
	 * @param array $input The raw input.
	 * @return array The validated input.
	 */
	public function validate_network_settings( $input ) {
		$options = (array) $this->network_options;
		$schema  = (array) ( new Options() )->settings_schema( (array) $this->get_default_network_settings_structure() );
		$input   = (array) \Videopack\Common\Sanitizer::sanitize_options_recursively( (array) $input, $schema );

		if ( (string) ( $input['app_path'] ?? '' ) !== (string) ( $options['app_path'] ?? '' ) ) {
			$input = (array) ( new Options() )->validate_ffmpeg_settings( (array) $input, new \Videopack\Admin\Encode\FFmpeg_Tester( $this->options, $this->format_registry ) );
		} else {
			$input['ffmpeg_exists'] = $options['ffmpeg_exists'] ?? 'notchecked';
		}

		foreach ( $this->get_default_network_settings_structure() as $key => $value ) {
			if ( ! array_key_exists( (string) $key, $input ) ) {
				$input[ (string) $key ] = false;
			}
		}

		if ( empty( $input['queue_control'] ) ) {
			$input['queue_control'] = $options['queue_control'] ?? 'enabled';
		}

		return (array) $input;
	}

	/**
	 * Outputs the root div for the React Network Settings page.
	 */
	public function network_settings_page_react_root() {
		echo '<div id="videopack-network-settings-root"></div>';
	}

	/**
	 * Outputs the root div for the React Network Queue page.
	 */
	public function network_queue_page_react_root() {
		echo '<div id="videopack-network-queue-root"></div>';
	}

	/**
	 * Enqueues assets for the React Network Settings page.
	 */
	public function enqueue_network_settings_assets() {
		wp_enqueue_script(
			'videopack-settings-network',
			(string) plugins_url( '../admin-ui/build/settings-network.js', __DIR__ ),
			array( 'wp-api', 'wp-i18n', 'wp-components', 'wp-element', 'wp-data' ),
			VIDEOPACK_VERSION,
			true
		);

		wp_enqueue_style(
			'videopack-settings-network-styles',
			(string) plugins_url( '../admin-ui/build/settings-network.css', __DIR__ ),
			array( 'wp-components' ),
			VIDEOPACK_VERSION
		);

		wp_localize_script(
			'videopack-settings-network',
			'videopackNetworkSettings',
			array(
				'settings' => (array) $this->network_options,
				'defaults' => (array) $this->get_default_network_settings_structure(),
				'schema'   => (array) ( new Options() )->settings_schema( (array) $this->get_default_network_settings_structure() ),
				'nonce'    => (string) wp_create_nonce( 'wp_rest' ),
				'rest_url' => (string) rest_url( 'videopack/v1/network/settings' ),
			)
		);
	}

	/**
	 * Enqueues assets for the React Network Queue page.
	 */
	public function enqueue_network_queue_assets() {
		wp_enqueue_script(
			'videopack-encode-queue',
			(string) plugins_url( '../admin-ui/build/encode-queue.js', __DIR__ ),
			array( 'wp-api', 'wp-i18n', 'wp-components', 'wp-element', 'wp-data' ),
			VIDEOPACK_VERSION,
			true
		);

		wp_enqueue_style(
			'videopack-encode-queue-styles',
			(string) plugins_url( '../admin-ui/build/encode-queue.css', __DIR__ ),
			array( 'wp-components' ),
			VIDEOPACK_VERSION
		);

		$inline_script = 'if (typeof videopack === "undefined") { videopack = {}; } videopack.encodeQueueData = ' . (string) wp_json_encode(
			array(
				'initialQueueState' => $this->network_options['queue_control'] ?? 'enabled',
				'ffmpegExists'      => $this->network_options['ffmpeg_exists'] ?? false,
				'isNetwork'         => true,
			)
		) . ';';

		wp_add_inline_script(
			'videopack-encode-queue',
			$inline_script,
			'before'
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
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_network_settings_rest' ),
					'permission_callback' => function () {
						return current_user_can( 'manage_network_options' );
					},
					'args'                => (array) ( new Options() )->settings_schema( (array) $this->get_default_network_settings_structure() ),
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
	 *
	 * @return \WP_REST_Response The REST response object.
	 */
	public function get_network_settings_rest() {
		return new \WP_REST_Response( (array) $this->network_options, 200 );
	}

	/**
	 * REST API callback to get default network settings.
	 *
	 * @return \WP_REST_Response The REST response object.
	 */
	public function get_default_network_settings_rest() {
		return new \WP_REST_Response( (array) $this->get_default_network_settings_structure(), 200 );
	}

	/**
	 * REST API callback to update network settings.
	 *
	 * @param \WP_REST_Request $request The REST request object.
	 * @return \WP_REST_Response The REST response object.
	 */
	public function update_network_settings_rest( \WP_REST_Request $request ) {
		$params         = (array) $request->get_params();
		$input_settings = (array) ( $params['videopack_network_settings'] ?? $params );

		$validated_options = (array) $this->validate_network_settings( $input_settings );

		$new_options = (array) array_merge( (array) $this->network_options, $validated_options );

		update_site_option( 'videopack_network_options', $new_options );
		$this->network_options = $new_options;

		if ( isset( $new_options['default_capabilities'] ) ) {
			( new Options() )->set_capabilities( (array) $new_options['default_capabilities'] );
		}

		return new \WP_REST_Response( $this->network_options, 200 );
	}

	/**
	 * Sets default user capabilities for newly created sites.
	 *
	 * @param int $blog_id The ID of the newly created blog.
	 */
	public function add_new_blog( $blog_id ) {
		if ( empty( $this->network_options['default_capabilities'] ) ) {
			return;
		}

		switch_to_blog( (int) $blog_id );

		( new Options() )->set_capabilities( (array) $this->network_options['default_capabilities'] );

		$site_options = get_option( 'videopack_options', array() );
		if ( empty( $site_options ) ) {
			$site_options = (array) ( new Options() )->get_default();
		}
		$site_options['capabilities'] = (array) $this->network_options['default_capabilities'];
		update_option( 'videopack_options', $site_options );

		restore_current_blog();
	}

	/**
	 * Checks if the plugin is active for the network.
	 *
	 * @return bool True if network active.
	 */
	public function is_network_active() {
		if ( ! is_multisite() ) {
			return false;
		}

		if ( ! function_exists( 'is_plugin_active_for_network' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		return (bool) is_plugin_active_for_network( VIDEOPACK_BASENAME );
	}

	/**
	 * Overrides site-specific options with network settings.
	 *
	 * @param array $options Site-specific options.
	 * @return array Modified options.
	 */
	public function override_local_options( $options ) {
		if ( ! is_array( $options ) || empty( $this->network_options ) ) {
			return $options;
		}

		$options['simultaneous_encodes'] = (int) ( $this->network_options['simultaneous_encodes'] ?? $options['simultaneous_encodes'] ?? 1 );
		$options['threads']              = (int) ( $this->network_options['threads'] ?? $options['threads'] ?? 1 );
		$options['nice']                 = (bool) ( $this->network_options['nice'] ?? $options['nice'] ?? true );

		$options['app_path']      = (string) ( $this->network_options['app_path'] ?? $options['app_path'] ?? '' );
		$options['ffmpeg_exists'] = $this->network_options['ffmpeg_exists'] ?? $options['ffmpeg_exists'] ?? 'notchecked';

		return (array) $options;
	}
}
