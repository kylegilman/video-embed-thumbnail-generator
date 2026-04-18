<?php
/**
 * The file that defines the core plugin class.
 *
 * @link       https://www.videopack.video
 * @since      1.0.0
 *
 * @package    Videopack
 * @subpackage Videopack/includes
 */

namespace Videopack;

use Videopack\Common\Container;
use Videopack\Common\Loader;
use Videopack\Common\I18n;
use Videopack\Admin\Options;
use Videopack\Admin\Assets;
use Videopack\Admin\Attachment_Meta;
use Videopack\Admin\Attachment;
use Videopack\Admin\Attachment_Deleter;
use Videopack\Admin\Attachment_Processor;
use Videopack\Admin\Attachment_Media_Library;
use Videopack\Admin\Encode\Encode_Queue_Controller;
use Videopack\Admin\Cleanup;
use Videopack\Admin\Edit_Posts;
use Videopack\Admin\Multisite;
use Videopack\Admin\REST\Settings_Controller;
use Videopack\Admin\REST\Thumbnail_Controller;
use Videopack\Admin\REST\Job_Controller;
use Videopack\Admin\REST\Process_Controller;
use Videopack\Admin\REST\Public_Controller;
use Videopack\Admin\Screens;
use Videopack\Admin\Ui;
use Videopack\Frontend\Metadata;
use Videopack\Frontend\Shortcode;
use Videopack\Frontend\Schema;
use Videopack\Frontend\Template;
use Videopack\Frontend\Blocks;

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * @since      1.0.0
 * @package    Videopack
 * @subpackage Videopack/includes
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Videopack {

	/**
	 * The loader that's responsible for maintaining and registering all hooks.
	 *
	 * @var Common\Loader $loader
	 */
	protected $loader;

	/**
	 * The dependency injection container.
	 *
	 * @var Common\Container $container
	 */
	protected $container;

	/**
	 * Unique ID counter for video player instances.
	 *
	 * @var int $video_player_id
	 */
	protected static $video_player_id = 0;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {
		$this->loader    = new Loader();
		$this->container = new Container();

		$this->set_locale();
		$this->initialize_services();
		$this->register_subscribers();
	}

	/**
	 * Define the locale for this plugin for internationalization.
	 */
	private function set_locale() {
		$plugin_i18n = new I18n();
		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );
	}

	/**
	 * Initializes core services and stores them in the container.
	 */
	private function initialize_services() {
		$options_manager = new Options();
		/**
		 * Allows replacement of the Options class.
		 *
		 * @param Options $options_manager The options manager instance.
		 */
		$options_manager = apply_filters( 'videopack_options_manager', $options_manager );
		$this->container->set( Options::class, $options_manager );

		$options         = (array) $options_manager->get_options();
		$format_registry = $options_manager->get_formats_registry();
		$attachment_meta = new Attachment_Meta( $options );

		$this->container->set( Attachment_Meta::class, $attachment_meta );
		$this->container->set( 'options', $options );
		$this->container->set( 'format_registry', $format_registry );

		// Legacy filter support.
		$this->loader->add_filter( 'videopack_get_options_manager', $this, 'get_options_manager_instance' );
	}

	/**
	 * Returns the initialized Options manager instance.
	 *
	 * @return Options The initialized options manager.
	 */
	public function get_options_manager_instance() {
		return $this->container->get( Options::class );
	}

	/**
	 * Registers all Hook_Subscriber components with the loader.
	 */
	private function register_subscribers() {
		$options         = $this->container->get( 'options' );
		$format_registry = $this->container->get( 'format_registry' );
		$attachment_meta = $this->container->get( Attachment_Meta::class );

		// Admin Components.
		$this->loader->add_subscriber( $this->container->get( Options::class ) );
		$this->loader->add_subscriber( new Assets( $options ) );
		$this->loader->add_subscriber( $attachment_meta );
		$this->loader->add_subscriber( new Attachment( $options, $format_registry, $attachment_meta ) );
		$this->loader->add_subscriber( new Attachment_Deleter( $options, $format_registry ) );
		$this->loader->add_subscriber( new Attachment_Processor( $options, $format_registry ) );
		$this->loader->add_subscriber( new Attachment_Media_Library( $options, $format_registry ) );
		$this->loader->add_subscriber( new Encode_Queue_Controller( $options, $format_registry ) );
		$this->loader->add_subscriber( new Cleanup() );
		$this->loader->add_subscriber( new Edit_Posts( $options, $format_registry ) );
		$this->loader->add_subscriber( new Screens( $options, $format_registry ) );
		$this->loader->add_subscriber( new Blocks( $options, $format_registry ) );
		$this->loader->add_subscriber( new Ui( $options, $format_registry ) );

		if ( Multisite::is_videopack_active_for_network() ) {
			$this->loader->add_subscriber( new Multisite( $options ) );
		}

		// REST Controllers.
		$this->loader->add_subscriber( new Settings_Controller( $options, $format_registry ) );
		$this->loader->add_subscriber( new Thumbnail_Controller( $options, $format_registry ) );
		$this->loader->add_subscriber( new Job_Controller( $options, $format_registry ) );
		$this->loader->add_subscriber( new Process_Controller( $options, $format_registry ) );
		$this->loader->add_subscriber( new Public_Controller( $options, $format_registry ) );

		// Frontend Components.
		$this->loader->add_subscriber( new Metadata( $options, $format_registry ) );
		$this->loader->add_subscriber( new Shortcode( $options, $format_registry ) );
		$this->loader->add_subscriber( new Schema( $options, $format_registry ) );
		$this->loader->add_subscriber( new Template( $options, $format_registry ) );
	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * Returns the loader instance.
	 *
	 * @return Common\Loader Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Get the container instance.
	 *
	 * @return Common\Container
	 */
	public function get_container() {
		return $this->container;
	}
}
