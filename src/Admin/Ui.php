<?php

namespace Videopack\Admin;

class Ui {

	protected $options_manager;

	/**
	 * Initialize the class.
	 *
	 * @param Options $options_manager The options manager instance.
	 */
	public function __construct( Options $options_manager ) {
		$this->options_manager = $options_manager;
	}

	public function block_init() {
		// Register the block as a dynamic block. The attributes are defined in
		// `block.json` and the front-end output is rendered by the PHP callback.
		register_block_type(
			VIDEOPACK_PLUGIN_DIR . 'admin-ui/build',
			array(
				'render_callback' => array( $this, 'render_videopack_block' ),
			)
		);
	}

	/**
	 * Server-side rendering callback for the Videopack block.
	 *
	 * This function reuses the existing shortcode logic to render the block's
	 * front-end HTML, ensuring a single source of truth for rendering.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block's inner content.
	 * @param \WP_Block $block      The block instance.
	 * @return string The rendered HTML of the block.
	 */
	public function render_videopack_block( $attributes, $content, $block ) {
		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options_manager );
		return $shortcode_handler->do( $attributes, $content );
	}

	/**
	 * Prepares and returns the videopack.settings data for JavaScript.
	 *
	 * @return array The settings data.
	 */
	private function get_videopack_settings_data() {
		// Prepare codec data for localization, making it easier to read and debug.
		$codec_objects = $this->options_manager->get_video_codecs();
		$codecs_data   = array();
		foreach ( $codec_objects as $codec_class ) {
			$codecs_data[] = $codec_class->get_properties();
		}

		// Prepare resolution data for localization, converting the array of objects
		// into a simple associative array for JavaScript.
		$resolution_objects = $this->options_manager->get_video_resolutions();
		$resolutions_data   = array();
		foreach ( $resolution_objects as $resolution ) {
			$resolutions_data[] = array(
				'id'   => $resolution->get_id(),
				'name' => $resolution->get_name(),
			);
		}

		$options = $this->options_manager->get_options();

		return array(
			'url'           => plugins_url( '', VIDEOPACK_PLUGIN_FILE ),
			'codecs'        => $codecs_data,
			'resolutions'   => $resolutions_data,
			'ffmpeg_exists' => $options['ffmpeg_exists'],
			'browser_thumbnails' => $options['browser_thumbnails'],
		);
	}

	/**
	 * Adds the videopack.settings inline script to a given script handle.
	 *
	 * @param string $handle The script handle to attach the inline script to.
	 * @param array  $extra_data Extra data to merge into the settings object.
	 */
	private function add_settings_inline_script( $handle, $extra_data = array() ) {
		$settings_data = $this->get_videopack_settings_data();
		if ( ! empty( $extra_data ) ) {
			$settings_data = array_merge( $settings_data, $extra_data );
		}

		$inline_script = 'if (typeof videopack === "undefined") { videopack = {}; } videopack.settings = ' . wp_json_encode( $settings_data ) . ';';

		wp_add_inline_script(
			$handle,
			$inline_script,
			'before'
		);
	}

	private function enqueue_player_assets() {
		$options = $this->options_manager->get_options();
		$player  = \Videopack\Frontend\Video_Players\Player_Factory::create( $options['embed_method'], $this->options_manager );
		$player->enqueue_styles();
	}

	public function enqueue_block_assets() {
		// The 'editorScript' defined in block.json handles enqueuing the block's script.
		// We only need to register the script translations here.
		wp_set_script_translations( 'videopack-videopack-block-editor-script', 'video-embed-thumbnail-generator' );

		$this->add_settings_inline_script( 'videopack-videopack-block-editor-script' );
		$this->enqueue_player_assets();
	}

	public function enqueue_page_assets( $hook_suffix ) {

		if ( 'settings_page_video_embed_thumbnail_generator_settings' === $hook_suffix ) {
			$script_asset_path = plugin_dir_path( VIDEOPACK_PLUGIN_FILE ) . 'admin-ui/build/settings.asset.php';

			if ( ! file_exists( $script_asset_path ) ) {
				return;
			}

			$script_asset = require $script_asset_path;

			$fs = function_exists( 'videopack_fs' ) ? videopack_fs() : null;
			$freemius_enabled = ( null !== $fs ) && ( $fs->is_registered() || $fs->is_pending_activation() );
			// Manually enqueue Freemius assets so they are available on our React settings page.
			$freemius_dependencies = array();
			$freemius_style_dependencies = array();
			if ( $freemius_enabled ) {
				// Enqueue Freemius styles using the SDK's helper function.
				fs_enqueue_local_style( 'fs-common', '/admin/common.css' );
				fs_enqueue_local_style( 'fs-addons', '/admin/add-ons.css', array( 'fs-common' ) );
				fs_enqueue_local_style( 'fs-account', '/admin/account.css', array( 'fs-common' ) );
				fs_enqueue_local_style( 'fs_dialog_boxes', '/admin/dialog-boxes.css' );

				// Enqueue Freemius scripts using the SDK's helper function.
				fs_enqueue_local_script( 'fs-form', 'jquery.form.js', array( 'jquery' ) );

				// Add Freemius handles to dependency arrays.
				$freemius_dependencies       = array( 'fs-form' );
				$freemius_style_dependencies = array( 'fs-addons', 'fs-account', 'fs_dialog_boxes' );
			}

			wp_enqueue_script(
				'videopack-settings',
				plugins_url( 'admin-ui/build/settings.js', VIDEOPACK_PLUGIN_FILE ),
				array_merge( $script_asset['dependencies'], $freemius_dependencies ),
				$script_asset['version'],
				true
			);
			wp_set_script_translations( 'videopack-settings', 'video-embed-thumbnail-generator' );

			$this->enqueue_player_assets();
			$this->add_settings_inline_script( 'videopack-settings', array( 'freemiusEnabled' => $freemius_enabled ) );

			$settings_css_dependencies = array_merge( array( 'wp-components' ), $freemius_style_dependencies );

			wp_enqueue_style(
				'videopack-settings',
				plugins_url( 'admin-ui/build/settings.css', VIDEOPACK_PLUGIN_FILE ),
				$settings_css_dependencies,
				$script_asset['version']
			);
		}

		if ( 'tools_page_videopack_encode_queue' === $hook_suffix ) {
			$options           = $this->options_manager->get_options();
			$script_asset_path = VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/encode-queue.asset.php';
			$script_asset      = file_exists( $script_asset_path ) ? require $script_asset_path : array(
				'dependencies' => array( 'wp-element', 'wp-i18n', 'wp-components', 'wp-api-fetch', 'wp-data' ),
				'version'      => VIDEOPACK_VERSION,
			);

			wp_enqueue_script(
				'videopack-encode-queue',
				plugins_url( 'admin-ui/build/encode-queue.js', VIDEOPACK_PLUGIN_FILE ),
				$script_asset['dependencies'],
				$script_asset['version'],
				true
			);
			wp_set_script_translations( 'videopack-encode-queue', 'video-embed-thumbnail-generator' );

			wp_enqueue_style(
				'videopack-encode-queue-styles',
				plugins_url( 'admin-ui/build/encode-queue.css', VIDEOPACK_PLUGIN_FILE ),
				array(),
				$script_asset['version']
			);

			// Pass initial data to the React app.
			$inline_script = 'if (typeof videopack === "undefined") { videopack = {}; } videopack.encodeQueueData = ' . wp_json_encode(
				array(
					'initialQueueState' => $options['queue_control'],
					'ffmpegExists'      => $options['ffmpeg_exists'],
				)
			) . ';';

			wp_add_inline_script(
				'videopack-encode-queue',
				$inline_script,
				'before'
			);

		}
	}

	public function enqueue_attachment_details() {

		$script_asset_path = plugin_dir_path( VIDEOPACK_PLUGIN_FILE ) . 'admin-ui/build/attachment-details.asset.php';

		if ( ! file_exists( $script_asset_path ) ) {
			// Fallback to prevent fatal errors if the build file is missing.
			return;
		}

		$script_asset = require $script_asset_path;

		wp_enqueue_script(
			'videopack-attachment-details',
			plugins_url( 'admin-ui/build/attachment-details.js', VIDEOPACK_PLUGIN_FILE ),
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);
		wp_set_script_translations( 'videopack-attachment-details', 'video-embed-thumbnail-generator' );

		$this->add_settings_inline_script( 'videopack-attachment-details' );

		wp_enqueue_style(
			'videopack-attachment-details',
			plugins_url( 'admin-ui/build/attachment-details.css', VIDEOPACK_PLUGIN_FILE ),
			array( 'wp-components' ),
			VIDEOPACK_VERSION
		);
	}
}
