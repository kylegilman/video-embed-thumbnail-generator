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

	public function enqueue_block_assets() {
		// The 'editorScript' defined in block.json handles enqueuing the block's script.
		// We only need to register the script translations here.
		wp_set_script_translations( 'videopack/videopack-block', 'video-embed-thumbnail-generator' );
	}

	public function enqueue_page_assets( $hook_suffix ) {

		if ( 'settings_page_video_embed_thumbnail_generator_settings' === $hook_suffix ) {
			$script_asset_path = plugin_dir_path( VIDEOPACK_PLUGIN_FILE ) . 'admin-ui/build/settings.asset.php';

			if ( ! file_exists( $script_asset_path ) ) {
				return;
			}

			$script_asset = require $script_asset_path;

			wp_enqueue_script(
				'videopack-settings',
				plugins_url( 'admin-ui/build/settings.js', VIDEOPACK_PLUGIN_FILE ),
				$script_asset['dependencies'],
				$script_asset['version'],
				true
			);
			wp_set_script_translations( 'videopack-settings', 'video-embed-thumbnail-generator' );

			wp_localize_script(
				'videopack-settings',
				'videopack',
				array(
					'settings' => array(
						'url'         => plugins_url( '', VIDEOPACK_PLUGIN_FILE ),
						'rest_url'    => rest_url( 'videopack/v1/' ),
						'codecs'      => array_map( fn( $codec_class ) => $codec_class->get_properties(), $this->options_manager->get_video_codecs() ),
						'resolutions' => $this->options_manager->get_video_resolutions(),
						'rest_nonce'  => wp_create_nonce( 'wp_rest' ),
					),
				)
			);

			$settings_css = VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/settings.css';
			wp_enqueue_style(
				'videopack-settings',
				plugins_url( 'admin-ui/build/settings.css', VIDEOPACK_PLUGIN_FILE ),
				array( 'wp-components' ),
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
			wp_localize_script(
				'videopack-encode-queue',
				'videopackEncodeQueueData',
				array(
					'rest_url'          => rest_url( 'videopack/v1/' ),
					'rest_nonce'        => wp_create_nonce( 'wp_rest' ),
					'initialQueueState' => $options['queue_control'],
					'ffmpegExists'      => $options['ffmpeg_exists'],
				)
			);
		}

		// Also load attachment details script on the attachment edit screen.
		$screen = get_current_screen();
		if ( 'attachment' === $screen->id ) {
			$this->enqueue_attachment_details();
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

		wp_enqueue_style(
			'videopack-attachment-details',
			plugins_url( 'admin-ui/build/attachment-details.css', VIDEOPACK_PLUGIN_FILE ),
			array(),
			VIDEOPACK_VERSION
		);
	}
}
