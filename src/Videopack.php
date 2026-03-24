<?php
/**
 * The file that defines the core plugin class.
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://www.videopack.video
 * @since      1.0.0
 *
 * @package    Videopack
 * @subpackage Videopack/includes
 */

namespace Videopack;

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
	 * @var      Common\Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The options manager instance.
	 *
	 * @since 5.0.0
	 * @access protected
	 * @var    Admin\Options    $options_manager    The options manager.
	 */
	protected $options_manager;

	/**
	 * Unique ID counter for video player instances.
	 *
	 * @var int $video_player_id
	 */
	protected static $video_player_id = 0;

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
	 * Load the options manager.
	 *
	 * @since    5.0.0
	 * @access   private
	 */
	private function load_options_manager() {

		$options_manager = new Admin\Options();

		/**
		 * Allows replacement of the Options class.
		 *
		 * @param Admin\Options $options_manager The options manager instance.
		 */
		$this->options_manager = apply_filters( 'videopack_options_manager', $options_manager );
	}

	/**
	 * Callback for the 'videopack_get_options_manager' filter.
	 *
	 * Returns the initialized Options manager instance.
	 *
	 * @return Admin\Options The initialized options manager.
	 */
	public function get_options_manager_instance() {
		return $this->options_manager;
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
		$this->loader->add_filter( 'videopack_get_options_manager', $this, 'get_options_manager_instance', 10, 1 );
		$this->loader->add_action( 'admin_init', $this->options_manager, 'register_videopack_options' );
		$this->loader->add_action( 'rest_api_init', $this->options_manager, 'register_videopack_options' );

		$admin_assets = new Admin\Assets( $this->options_manager->get_options() );
		$this->loader->add_action( 'wp_enqueue_media', $admin_assets, 'enqueue_videopack_scripts' );
		$this->loader->add_action( 'admin_enqueue_scripts', $admin_assets, 'maybe_enqueue_videopack_scripts' );

		$attachment_meta = new Admin\Attachment_Meta( $this->options_manager->get_options() );
		$this->loader->add_action( 'init', $attachment_meta, 'register' );
		$this->loader->add_filter( 'rest_prepare_attachment', $attachment_meta, 'filter_rest_response_meta', 10, 3 );

		$plugin_attachment = new Admin\Attachment( $this->options_manager->get_options(), $this->options_manager->get_formats_registry(), $attachment_meta );
		$this->loader->add_action( 'delete_attachment', $plugin_attachment, 'delete_video_attachment' );
		$this->loader->add_action( 'add_attachment', $plugin_attachment, 'add_attachment_handler' );
		$this->loader->add_action( 'videopack_process_new_attachment', $plugin_attachment, 'process_new_attachment_action', 10, 1 );
		$this->loader->add_action( 'videopack_cron_check_post_parent', $plugin_attachment, 'cron_check_post_parent_handler' );
		$this->loader->add_action( 'edit_attachment', $plugin_attachment, 'validate_attachment_updated' );
		$this->loader->add_filter( 'mime_types', $plugin_attachment, 'add_mime_types' );
		$this->loader->add_filter( 'wp_get_attachment_url', $plugin_attachment, 'filter_attachment_url', 10, 2 );
		$this->loader->add_filter( 'get_attached_file', $plugin_attachment, 'filter_attached_file', 10, 2 );
		$this->loader->add_action( 'wp_read_video_metadata', $plugin_attachment, 'add_extra_video_metadata', 10, 4 );
		$this->loader->add_action( 'updated_post_meta', $plugin_attachment, 'clear_browser_thumb_flag', 10, 4 );
		$this->loader->add_action( 'added_post_meta', $plugin_attachment, 'clear_browser_thumb_flag', 10, 4 );
		$this->loader->add_action( 'videopack_set_featured_image', $plugin_attachment, 'execute_featured_image_action', 10, 2 );
		$this->loader->add_action( 'videopack_switch_thumbnail_parent', $plugin_attachment, 'execute_switch_parent_action', 10, 4 );
		$this->loader->add_action( 'videopack_generate_thumbnail', $plugin_attachment, 'generate_thumbnails_with_ffmpeg', 10, 1 );
		$this->loader->add_action( 'videopack_batch_enqueue_video', $plugin_attachment, 'execute_batch_enqueue_action', 10, 1 );

		$encode_queue_controller = new Admin\Encode\Encode_Queue_Controller( $this->options_manager->get_options(), $this->options_manager->get_formats_registry() );
		$this->loader->add_action( 'rest_api_init', $encode_queue_controller, 'start_queue' );
		$this->loader->add_action( 'videopack_process_pending_jobs', $encode_queue_controller, 'process_pending_jobs_action' );
		$this->loader->add_action( 'videopack_handle_job', $encode_queue_controller, 'handle_job_action' );
		$this->loader->add_action( 'videopack_cleanup_queue', $encode_queue_controller, 'clear_completed_queue', 10, 2 );

		$plugin_cleanup = new Admin\Cleanup();
		$this->loader->add_action( 'init', $plugin_cleanup, 'schedule_weekly_cleanup' );

		$this->loader->add_action( 'videopack_cleanup_generated_thumbnails', $plugin_cleanup, 'cleanup_generated_thumbnails_handler' );

		$edit_posts = new Admin\Edit_Posts( $this->options_manager->get_options(), $this->options_manager->get_formats_registry() );
		$this->loader->add_filter( 'media_send_to_editor', $edit_posts, 'modify_media_insert', 10, 3 );
		$this->loader->add_action( 'media_upload_tabs', $edit_posts, 'add_embedurl_tab' );
		$this->loader->add_action( 'media_upload_embedurl', $edit_posts, 'embedurl_handle' );
		$this->loader->add_action( 'media_upload_embedgallery', $edit_posts, 'embedurl_handle' );
		$this->loader->add_action( 'media_upload_embedlist', $edit_posts, 'embedurl_handle' );

		if ( Admin\Multisite::is_videopack_active_for_network() ) {
			$multisite = new Admin\Multisite( $this->options_manager->get_options() );
			$this->loader->add_action( 'init', $multisite, 'init' );
			$this->loader->add_action( 'wpmu_new_blog', $multisite, 'add_new_blog' );
			$this->loader->add_filter( 'network_admin_plugin_action_links_' . VIDEOPACK_BASENAME, $multisite, 'network_admin_action_links' );
			$this->loader->add_action( 'network_admin_menu', $multisite, 'add_network_settings_page' );
			$this->loader->add_action( 'network_admin_menu', $multisite, 'add_network_queue_page' );
		}

		$rest_controller = new Admin\REST_Controller( $this->options_manager->get_options(), $this->options_manager->get_formats_registry() );
		$this->loader->add_action( 'rest_api_init', $rest_controller, 'add_rest_routes' );
		$this->loader->add_filter( 'rest_post_dispatch', $rest_controller, 'log_rest_api_errors', 10, 3 );

		$admin_screens = new Admin\Screens( $this->options_manager->get_options(), $this->options_manager->get_formats_registry() );
		$this->loader->add_filter( 'plugin_action_links_' . VIDEOPACK_BASENAME, $admin_screens, 'plugin_action_links' );
		$this->loader->add_filter( 'plugin_row_meta', $admin_screens, 'plugin_meta_links', 10, 2 );
		$this->loader->add_action( 'in_plugin_update_message-' . VIDEOPACK_BASENAME, $admin_screens, 'upgrade_notification' );
		$this->loader->add_action( 'admin_menu', $admin_screens, 'add_settings_page' );
		$this->loader->add_action( 'admin_menu', $admin_screens, 'add_encode_queue_page' );
		$this->loader->add_action( 'manage_media_columns', $admin_screens, 'add_video_columns' );
		$this->loader->add_action( 'manage_media_custom_column', $admin_screens, 'add_video_column_content', 10, 2 );
		$this->loader->add_filter( 'wp_prepare_attachment_for_js', $admin_screens, 'prepare_attachment_for_js', 10, 3 );
		$this->loader->add_action( 'pre_get_posts', $admin_screens, 'hide_video_children' );
		$this->loader->add_action( 'restrict_manage_posts', $admin_screens, 'add_media_filter_dropdown' );
		$this->loader->add_filter( 'media_view_settings', $admin_screens, 'add_grid_media_filter' );
		$this->loader->add_filter( 'ajax_query_attachments_args', $admin_screens, 'filter_ajax_query_attachments' );
		$this->loader->add_action( 'wp_redirect', $admin_screens, 'upload_page_change_thumbnail_parent' );
		$this->loader->add_action( 'admin_head-post.php', $admin_screens, 'add_contextual_help_tab' );
		$this->loader->add_action( 'admin_head-post-new.php', $admin_screens, 'add_contextual_help_tab' );
		$this->loader->add_action( 'add_meta_boxes', $admin_screens, 'add_meta_boxes' );
		$this->loader->add_filter( 'query_vars', $admin_screens, 'add_query_vars' );

		// Admin UI (Block, React Settings, Media Library Enhancements) hooks.
		$admin_ui = new Admin\Ui( $this->options_manager->get_options(), $this->options_manager->get_formats_registry() );
		$this->loader->add_action( 'init', $admin_ui, 'register_scripts' );
		$this->loader->add_action( 'init', $admin_ui, 'block_init' );
		$this->loader->add_action( 'enqueue_block_assets', $admin_ui, 'enqueue_block_assets' );
		$this->loader->add_action( 'admin_enqueue_scripts', $admin_ui, 'enqueue_page_assets' );
		$this->loader->add_action( 'wp_enqueue_media', $admin_ui, 'enqueue_attachment_details' );
		$this->loader->add_action( 'edit_attachment', $admin_screens, 'save_meta_box_data' );

		// TinyMCE Classic Editor integration hooks.
		$this->loader->add_filter( 'mce_external_plugins', $admin_ui, 'register_tinymce_plugin' );
		$this->loader->add_action( 'admin_footer-post.php', $admin_ui, 'print_tinymce_template' );
		$this->loader->add_action( 'admin_footer-post-new.php', $admin_ui, 'print_tinymce_template' );
		$this->loader->add_action( 'admin_enqueue_scripts', $admin_ui, 'enqueue_tinymce_assets' );
	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_frontend_hooks() {

		$options_array   = $this->options_manager->get_options();
		$format_registry = $this->options_manager->get_formats_registry();

		$frontend_metadata = new Frontend\Metadata( $options_array, $format_registry );
		$this->loader->add_action( 'wp_head', $frontend_metadata, 'print_scripts' );

		$frontend_shortcode = new Frontend\Shortcode( $options_array, $format_registry );
		$this->loader->add_action( 'wp_loaded', $frontend_shortcode, 'overwrite_video_shortcode' );
		$this->loader->add_action( 'init', $frontend_shortcode, 'add' );
		$this->loader->add_filter( 'render_block', $frontend_shortcode, 'replace_video_block', 10, 2 );
		$this->loader->add_filter( 'no_texturize_shortcodes', $frontend_shortcode, 'no_texturize' );
		$this->loader->add_filter( 'query_vars', $frontend_shortcode, 'add_query_vars' );

		$frontend_schema = new Frontend\Schema( $options_array, $format_registry );
		$this->loader->add_action( 'template_redirect', $frontend_schema, 'init' );

		$frontend_template = new Frontend\Template( $options_array, $format_registry );
		$this->loader->add_filter( 'oembed_response_data', $frontend_template, 'change_oembed_data', 11, 4 );
		$this->loader->add_filter( 'embed_template', $frontend_template, 'change_embed_template' );
		$this->loader->add_filter( 'the_content', $frontend_template, 'filter_video_attachment_content' );
		$this->loader->add_action( 'redirect_canonical', $frontend_template, 'redirect_canonical_attachment', 10, 2 );
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
	 * Returns the loader instance.
	 *
	 * @since     1.0.0
	 * @return    Common\Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}
}
