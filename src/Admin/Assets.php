<?php
/**
 * Admin assets handler.
 *
 * @package Videopack
 */

namespace Videopack\Admin;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Assets
 *
 * Handles admin-side script and style registration and enqueuing.
 *
 * This class manages the enqueuing of CSS and JavaScript assets required
 * for the plugin's administrative interfaces, including settings pages,
 * the encoding queue, and various UI components.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Assets implements Hook_Subscriber {
	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Constructor.
	 *
	 * @param array $options Plugin options.
	 */
	public function __construct( array $options ) {

		$this->options = $options;
	}

	/**
	 * Returns an array of actions to register.
	 *
	 * @return array
	 */
	/**
	 * Returns an array of actions to register.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'init',
				'callback' => 'register_assets',
				'priority' => 5,
			),
			array(
				'hook'     => 'wp_enqueue_scripts',
				'callback' => 'register_player_scripts',
			),
			array(
				'hook'     => 'admin_enqueue_scripts',
				'callback' => 'enqueue_admin_assets',
			),
			array(
				'hook'     => 'wp_enqueue_media',
				'callback' => 'enqueue_media_library_assets',
			),
			array(
				'hook'     => 'enqueue_block_assets',
				'callback' => 'enqueue_block_frontend_assets',
			),

		);
	}

	/**
	 * Returns an array of filters to register.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array();
	}

	/**
	 * Registers all consolidated JavaScript and CSS assets.
	 */
	public function register_assets() {
		$build_dir = (string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/';
		$build_url = (string) plugins_url( 'admin-ui/build/', VIDEOPACK_PLUGIN_FILE );

		$assets = array(
			'videopack-blocks'         => 'blocks',
			'videopack-admin-screens'  => 'admin-screens',
			'videopack-media-library'  => 'media-library',
			'videopack-classic-editor' => 'classic-editor',
			'videopack-frontend'       => 'videopack',
		);

		foreach ( $assets as $handle => $filename ) {
			$asset_file = (string) $build_dir . (string) $filename . '.asset.php';
			if ( file_exists( $asset_file ) ) {
				$asset  = (array) require $asset_file;
				$player = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, new Formats\Registry( $this->options ) );
				$player->register_scripts();

				$player_script_deps = array();
				$player_style_deps  = array();

				if ( in_array( (string) $handle, array( 'videopack-blocks', 'videopack-admin-screens', 'videopack-media-library' ), true ) ) {
					$player_script_deps = (array) $player->get_player_script_handles();
					$player_style_deps  = (array) $player->get_player_style_handles();
				}

				wp_register_script(
					(string) $handle,
					(string) $build_url . (string) $filename . '.js',
					array_unique( array_merge( (array) $asset['dependencies'], $handle === 'videopack-media-library' ? array( 'media-views', 'media-models', 'media-editor' ) : array(), $player_script_deps ) ),
					(string) $asset['version'],
					true
				);
				wp_set_script_translations( (string) $handle, 'video-embed-thumbnail-generator' );

				if ( file_exists( (string) $build_dir . (string) $filename . '.css' ) ) {
					wp_register_style(
						(string) $handle,
						(string) $build_url . (string) $filename . '.css',
						(array) $player_style_deps,
						(string) $asset['version']
					);
				}
			}
		}

		// Shared config for all Videopack scripts.
		$this->localize_videopack_config();
	}

	/**
	 * Localizes the global videopack_config object.
	 */
	private function localize_videopack_config() {
		// This logic was moved from Ui.php to centralize configuration.
		$ui          = new Ui( $this->options, new Formats\Registry( $this->options ) );
		$config_data = (array) $ui->get_videopack_config_data();

		$handles = array(

			'videopack-blocks',
			'videopack-admin-screens',
			'videopack-media-library',
			'videopack-classic-editor',
			'videopack-frontend',
		);

		foreach ( $handles as $handle ) {
			wp_localize_script( (string) $handle, 'videopack_config', $config_data );
		}
	}
	/**
	 * Registers player scripts on the frontend.
	 */
	public function register_player_scripts() {
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, new Formats\Registry( $this->options ) );
		$player->register_scripts();
	}

	/**
	 * Enqueues assets for the blocks on the frontend.
	 */
	public function enqueue_block_frontend_assets() {
		wp_enqueue_style( 'videopack-blocks' );
	}


	/**
	 * Enqueues assets for various admin screens.
	 *
	 * @param string $hook_suffix The current admin page hook.
	 */
	public function enqueue_admin_assets( $hook_suffix ) {
		// Settings & Queue Pages.
		if ( in_array( (string) $hook_suffix, array( 'settings_page_video_embed_thumbnail_generator_settings', 'tools_page_videopack_encode_queue', 'settings_page_videopack_network_encoding_queue' ), true ) ) {
			wp_enqueue_script( 'videopack-admin-screens' );
			wp_enqueue_style( 'videopack-admin-screens' );

			// Enqueue player for previews.
			$this->enqueue_player_assets();
		}

		// Classic Editor TinyMCE Plugin (Main Host Page).
		if ( in_array( (string) $hook_suffix, array( 'post.php', 'post-new.php' ), true ) && ! ( function_exists( 'use_block_editor_for_post' ) && use_block_editor_for_post( get_post() ) ) ) {
			wp_enqueue_script( 'videopack-classic-editor' );

			// Add editor styles for TinyMCE previews.
			add_editor_style( (string) includes_url( 'css/media-views.css' ) );
			add_editor_style( (string) includes_url( 'js/mediaelement/mediaelementplayer-legacy.min.css' ) );
			add_editor_style( (string) includes_url( 'js/mediaelement/wp-mediaelement.css' ) );

			$player        = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, new Formats\Registry( $this->options ) );
			$style_handles = array_merge( array( 'videopack-frontend', 'videopack-classic-editor' ), $player->get_player_style_handles() );

			global $wp_styles;
			foreach ( $style_handles as $handle ) {
				if ( isset( $wp_styles->registered[ $handle ] ) ) {
					$src = $wp_styles->registered[ $handle ]->src;
					if ( $src ) {
						add_editor_style( $src );
					}
				}
			}
		}
	}

	/**
	 * Helper to enqueue player assets in admin.
	 */
	private function enqueue_player_assets() {
		// Always enqueue both supported players on preview pages to support live switching.
		foreach ( array( 'Video.js', 'WordPress Default' ) as $method ) {
			$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $method, $this->options, new Formats\Registry( $this->options ) );
			$player->register_scripts();
			$player->enqueue_scripts();
			$player->enqueue_styles();

			// If Video.js, also enqueue all skins for live preview updates on settings page.
			if ( 'Video.js' === $method && method_exists( $player, 'enqueue_all_skins' ) ) {
				$player->enqueue_all_skins();
			}
		}
	}

	/**
	 * Enqueues assets for the media library.
	 */
	public function enqueue_media_library_assets() {
		wp_enqueue_script( 'videopack-media-library' );
		wp_enqueue_style( 'videopack-media-library' );
		$this->enqueue_player_assets();
	}

	/**
	 * Enqueues base plugin scripts and styles.
	 */
	public function enqueue_videopack_scripts() {
		wp_enqueue_script( 'videopack-frontend' );
		wp_enqueue_style( 'videopack-frontend' );
	}

	/**
	 * Enqueues assets for the classic editor (tabs and TinyMCE).
	 */
	public function enqueue_classic_editor_assets() {
		wp_enqueue_script( 'videopack-classic-editor' );
		wp_enqueue_style( 'videopack-classic-editor' );

		// Add editor styles for TinyMCE previews.
		add_editor_style( (string) includes_url( 'css/media-views.css' ) );
		add_editor_style( (string) includes_url( 'js/mediaelement/mediaelementplayer-legacy.min.css' ) );
		add_editor_style( (string) includes_url( 'js/mediaelement/wp-mediaelement.css' ) );

		$player        = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, new Formats\Registry( $this->options ) );
		$style_handles = array_merge( array( 'videopack-frontend', 'videopack-classic-editor' ), $player->get_player_style_handles() );

		global $wp_styles;
		foreach ( $style_handles as $handle ) {
			if ( isset( $wp_styles->registered[ $handle ] ) ) {
				$src = $wp_styles->registered[ $handle ]->src;
				if ( $src ) {
					add_editor_style( $src );
				}
			}
		}

		$this->enqueue_player_assets();
	}

	/**
	 * Enqueues assets for generalized admin screens (settings, queue).
	 */
	public function enqueue_admin_screens_assets() {
		wp_enqueue_script( 'videopack-admin-screens' );
		wp_enqueue_style( 'videopack-admin-screens' );
		$this->enqueue_player_assets();
	}
}
