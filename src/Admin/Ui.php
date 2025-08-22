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

	public function register_scripts() {
		wp_register_script(
			'video-js',
			plugins_url( '', VIDEOPACK_PLUGIN_FILE ) . '/video-js/video.min.js',
			'',
			VIDEOPACK_VIDEOJS_VERSION,
			false
		);

		wp_register_script(
			'video-quality-selector',
			plugins_url( '', VIDEOPACK_PLUGIN_FILE ) . '/video-js/video-quality-selector.js',
			array( 'video-js' ),
			VIDEOPACK_VERSION,
			true
		);

		$locale = $this->get_videojs_locale();
		if ( $locale != 'en' && file_exists( plugin_dir_path( VIDEOPACK_PLUGIN_FILE ) . '/video-js/lang/' . $locale . '.js' ) ) {
			wp_register_script(
				'videojs-l10n',
				plugins_url( '', VIDEOPACK_PLUGIN_FILE ) . '/video-js/lang/' . $locale . '.js',
				array( 'video-js' ),
				VIDEOPACK_VIDEOJS_VERSION,
				true
			);
		}

		wp_register_style(
			'video-js',
			plugins_url( '/video-js/video-js.min.css', VIDEOPACK_PLUGIN_FILE ),
			'',
			VIDEOPACK_VIDEOJS_VERSION
		);

		$options = $this->options_manager->get_options();
		if ( $options['skin'] !== 'default'
			&& file_exists( plugin_dir_path( VIDEOPACK_PLUGIN_FILE ) . '/video-js/skins/' . $options['skin'] . '.css' )
		) {
			wp_register_style(
				'video-js-skin',
				plugins_url( '', VIDEOPACK_PLUGIN_FILE ) . '/video-js/skins/' . $options['skin'] . '.css',
				'',
				VIDEOPACK_VERSION
			);
		}
	}

	public function block_init() {
		register_block_type(
			VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/videopack-video'
		);

		register_block_type(
			VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/videopack-gallery'
		);

		$this->localize_block_settings( 'videopack-videopack-video-editor-script' );
		$this->localize_block_settings( 'videopack-videopack-gallery-editor-script' );
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

	private function get_videojs_locale() {

		$locale = get_locale();

		$locale_conversions = array( // all Video.js language codes are two-character except these
			'pt-BR' => 'pt_BR',
			'pt-PT' => 'pt_PT',
			'zh-CN' => 'zh_CN',
			'zh-TW' => 'zh_TW',
		);

		$matching_locale = array_search( $locale, $locale_conversions );
		if ( $matching_locale !== false ) {
			$locale = $matching_locale;
		} else {
			$locale = substr( $locale, 0, 2 );
		}

		return $locale;
	}

	/**
	 * Prepares and returns the videopack_config data for JavaScript.
	 *
	 * @return array The settings data.
	 */
	private function get_videopack_config_data() {
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
			'url'                => plugins_url( '', VIDEOPACK_PLUGIN_FILE ),
			'codecs'             => $codecs_data,
			'resolutions'        => $resolutions_data,
			'ffmpeg_exists'      => $options['ffmpeg_exists'],
			'browser_thumbnails' => $options['browser_thumbnails'],
		);
	}

	/**
	 * Adds the videopack_config inline script to a given script handle.
	 *
	 * @param string $handle The script handle to attach the inline script to.
	 * @param array  $extra_data Extra data to merge into the settings object.
	 */
	private function localize_block_settings( $handle, $extra_data = array() ) {
		$settings_data = $this->get_videopack_config_data();
		if ( ! empty( $extra_data ) ) {
			$settings_data = array_merge( $settings_data, $extra_data );
		}

		wp_localize_script( $handle, 'videopack_config', $settings_data );
	}

	public function enqueue_page_assets( $hook_suffix ) {

		if ( 'settings_page_video_embed_thumbnail_generator_settings' === $hook_suffix ) {
			$script_asset_path = plugin_dir_path( VIDEOPACK_PLUGIN_FILE ) . 'admin-ui/build/settings.asset.php';

			if ( ! file_exists( $script_asset_path ) ) {
				return;
			}

			$script_asset = require $script_asset_path;

			$fs               = function_exists( 'videopack_fs' ) ? videopack_fs() : null;
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

			$this->localize_block_settings( 'videopack-settings', array( 'freemiusEnabled' => $freemius_enabled ) );

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

		$this->localize_block_settings( 'videopack-attachment-details' );

		wp_enqueue_style(
			'videopack-attachment-details',
			plugins_url( 'admin-ui/build/attachment-details.css', VIDEOPACK_PLUGIN_FILE ),
			array( 'wp-components' ),
			VIDEOPACK_VERSION
		);
	}
}
