<?php

namespace Videopack;

/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://www.kylegilman.net
 * @since      1.0.0
 *
 * @package    Videopack
 * @subpackage Videopack/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    Videopack
 * @subpackage Videopack/includes
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Videopack {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Videopack_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $version    The current version of the plugin.
	 */
	protected $version;

	/**
	 * The options manager instance.
	 *
	 * @since 5.0.0
	 * @access protected
	 * @var    Admin\Options    $options_manager    The options manager.
	 */
	protected $options_manager;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {
		if ( defined( 'VIDEOPACK_VERSION' ) ) {
			$this->version = VIDEOPACK_VERSION;
		} else {
			$this->version = '5.0.0';
		}
		$this->plugin_name = 'videopack';

		$this->load_loader();
		$this->set_locale();
		$this->load_options_manager();
		$this->define_admin_hooks();
		$this->define_frontend_hooks();
	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - Videopack_Loader. Orchestrates the hooks of the plugin.
	 * - Videopack_i18n. Defines internationalization functionality.
	 * - Videopack_Admin. Defines all hooks for the admin area.
	 * - Videopack_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_loader() {

		$this->loader = new Common\Loader();
	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the Videopack_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function set_locale() {

		$plugin_i18n = new Common\I18n();

		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );
	}

	/**
	 * Load the options manager instance.
	 *
	 * @since    5.0.0
	 * @access   private
	 */
	private function load_options_manager() {

		$this->options_manager = new Admin\Options();
	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks() {

		$this->loader->add_action( 'init', $this->options_manager, 'load_options' );
		$this->loader->add_action( 'admin_init', $this->options_manager, 'register_videopack_options' );
		$this->loader->add_action( 'rest_api_init', $this->options_manager, 'register_videopack_options' );

		$admin_assets = new Admin\Assets( $this->options_manager );
		$this->loader->add_action( 'wp_enqueue_media', $admin_assets, 'enqueue_videopack_scripts' );
		$this->loader->add_action( 'admin_enqueue_scripts', $admin_assets, 'maybe_enqueue_videopack_scripts' );

		$attachment_meta = new Admin\Attachment_Meta( $this->options_manager );
		$this->loader->add_action( 'init', $attachment_meta, 'register' );
		$this->loader->add_action( 'wp_read_video_metadata', $attachment_meta, 'add_extra_video_metadata', 10, 4 );

		$plugin_attachment = new Admin\Attachment( $this->options_manager );
		$this->loader->add_action( 'delete_attachment', $plugin_attachment, 'delete_video_attachment' );
		$this->loader->add_action( 'add_attachment', $plugin_attachment, 'add_attachment_handler' );
		$this->loader->add_action( 'videopack_cron_new_attachment', $plugin_attachment, 'cron_new_attachment_handler', 10, 2 );
		$this->loader->add_action( 'videopack_cron_check_post_parent', $plugin_attachment, 'cron_check_post_parent_handler' );
		$this->loader->add_action( 'edit_attachment', $plugin_attachment, 'validate_attachment_updated' );
		$this->loader->add_filter( 'mime_types', $plugin_attachment, 'add_mime_types' );

		$plugin_cleanup = new Admin\Cleanup();
		$this->loader->add_action( 'videopack_cleanup_generated_logfiles', $plugin_cleanup, 'cleanup_generated_logfiles_handler' );
		$this->loader->add_action( 'videopack_cleanup_generated_thumbnails', $plugin_cleanup, 'cleanup_generated_thumbnails_handler' );
		$this->loader->add_action( 'videopack_cleanup_queue', $plugin_cleanup, 'clear_completed_queue', 10, 2 );

		$edit_posts = new Admin\Edit_Posts( $this->options_manager );
		$this->loader->add_filter( 'media_send_to_editor', $edit_posts, 'modify_media_insert', 10, 3 );
		$this->loader->add_action( 'media_upload_tabs', $edit_posts, 'add_embedurl_tab' );
		$this->loader->add_action( 'media_upload_embedurl', $edit_posts, 'embedurl_handle' );
		$this->loader->add_action( 'save_post', $edit_posts, 'render_post' );

		if ( Admin\Multisite::is_videopack_active_for_network() ) {
			$multisite = new Admin\Multisite( $this->options_manager );
			$this->loader->add_action( 'wpmu_new_blog', $multisite, 'add_new_blog' );
			$this->loader->add_filter( 'network_admin_plugin_action_links_' . VIDEOPACK_BASENAME, $multisite, 'network_admin_action_links' );
			$this->loader->add_action( 'network_admin_menu', $multisite, 'add_network_settings_page' );
			$this->loader->add_action( 'network_admin_menu', $multisite, 'add_network_queue_page' );
		}

		$rest_controller = new Admin\REST_Controller( $this->options_manager );
		$this->loader->add_action( 'rest_api_init', $rest_controller, 'add_rest_routes' );
		$this->loader->add_action( 'wp_error_added', $rest_controller, 'log_all_errors_to_debug_log', 10, 4 );

		$admin_screens = new Admin\Screens( $this->options_manager );
		$this->loader->add_filter( 'plugin_action_links_' . VIDEOPACK_BASENAME, $admin_screens, 'plugin_action_links' );
		$this->loader->add_filter( 'plugin_row_meta', $admin_screens, 'plugin_meta_links', 10, 2 );
		$this->loader->add_action( 'in_plugin_update_message-' . VIDEOPACK_BASENAME, $admin_screens, 'upgrade_notification' );
		$this->loader->add_action( 'admin_menu', $admin_screens, 'add_settings_page' );
		$this->loader->add_action( 'admin_menu', $admin_screens, 'add_encode_queue_page' );
		$this->loader->add_action( 'manage_media_columns', $admin_screens, 'add_video_stats_column' );
		$this->loader->add_action( 'manage_media_custom_column', $admin_screens, 'add_video_stats_column_content', 10, 2 );
		$this->loader->add_action( 'pre_get_posts', $admin_screens, 'hide_video_children' );
		$this->loader->add_action( 'wp_redirect', $admin_screens, 'upload_page_change_thumbnail_parent' );
		$this->loader->add_action( 'admin_head-post.php', $admin_screens, 'add_contextual_help_tab' );
		$this->loader->add_action( 'admin_head-post-new.php', $admin_screens, 'add_contextual_help_tab' );
	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_frontend_hooks() {

		$frontend_player = Frontend\Video_Players\Player_Factory::create( $this->options_manager );
		$frontend_player->register_hooks();

		$frontend_metadata = new Frontend\Metadata( $this->options_manager );
		$this->loader->add_action( 'wp_head', $frontend_metadata, 'print_scripts' );
		$this->loader->add_action( 'wp_footer', $frontend_metadata, 'clear_first_embedded_video_meta', 12 );

		$frontend_shortcode = new Frontend\Shortcode( $this->options_manager );
		$this->loader->add_action( 'wp_loaded', $frontend_shortcode, 'overwrite_video_shortcode' );
		$this->loader->add_action( 'init', $frontend_shortcode, 'add' );
		$this->loader->add_filter( 'no_texturize_shortcodes', $frontend_shortcode, 'no_texturize' );
		$this->loader->add_filter( 'query_vars', $frontend_shortcode, 'add_query_vars' );

		$frontend_template = new Frontend\Template( $this->options_manager );
		$this->loader->add_filter( 'oembed_response_data', $frontend_template, 'change_oembed_data', 11, 4 );
		$this->loader->add_filter( 'embed_template', $frontend_template, 'change_embed_template' );
		$this->loader->add_filter( 'the_content', $frontend_template, 'filter_video_attachment_content' );
		$this->loader->add_action( 'redirect_canonical', $frontend_template, 'redirect_canonical_attachment' );
		$this->loader->add_action( 'template_redirect', $frontend_template, 'attachment' );
	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     1.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @return    Videopack_Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @since     1.0.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}
}
