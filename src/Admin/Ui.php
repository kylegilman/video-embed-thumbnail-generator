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

			$script_asset_path = __DIR__ . '/build/settings.asset.php';
			$settings_js       = 'build/settings.js';
			$script_asset      = require $script_asset_path;

			wp_enqueue_script(
				'videopack-settings',
				plugins_url( $settings_js, __FILE__ ),
				$script_asset['dependencies'],
				$script_asset['version'],
				true
			);
			wp_set_script_translations( 'videopack-settings', 'video-embed-thumbnail-generator' );

			$codecs      = $this->options_manager->get_video_codecs();
			$codec_array = array();
			foreach ( $codecs as $codec => $codec_class ) {
				$codec_array[ $codec ] = $codec_class->get_properties();
			}
			$inline_data = 'var videopack = videopack || {};
			videopack.settings = ' . wp_json_encode(
				array(
					'url'         => plugins_url( dirname( VIDEOPACK_BASENAME ) ),
					'codecs'      => $codec_array,
					'resolutions' => $this->options_manager->get_video_resolutions(),
				)
			) . ';';
			wp_add_inline_script( 'videopack-settings', $inline_data );

			$settings_css = 'build/settings.css';
			wp_enqueue_style(
				'videopack-settings',
				plugins_url( $settings_css, __FILE__ ),
				array( 'wp-components' ),
				filemtime( __DIR__ . '/$settings_css' )
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
				array( 'wp-components' ),
				$script_asset['version']
			);

			// Pass initial data to the React app.
			wp_localize_script(
				'videopack-encode-queue',
				'videopackEncodeQueueData',
				array(
					'restUrl' => rest_url( 'videopack/v1/' ),
					'nonce' => wp_create_nonce( 'wp_rest' ),
					'initialQueueState' => $options['queue_control'],
					'ffmpegExists' => $options['ffmpeg_exists'],
				)
			);
		}
	}

	public function enqueue_attachment_details() {

		$script_asset_path     = __DIR__ . '/build/attachment-details.asset.php';
		$attachment_details_js = 'build/attachment-details.js';
		$script_asset          = require $script_asset_path;

		wp_enqueue_script(
			'videopack-attachment-details',
			plugins_url( $attachment_details_js, __FILE__ ),
			$script_asset['dependencies'],
			$script_asset['version'],
			true
		);
		wp_set_script_translations( 'attachment-details', 'video-embed-thumbnail-generator' );

		$attachment_details_css = 'build/attachment-details.css';
		wp_enqueue_style(
			'videopack-attachment-details',
			plugins_url( $attachment_details_css, __FILE__ ),
			array( 'wp-components' ),
			filemtime( __DIR__ . '/$attachment_details_css' )
		);
	}
}
