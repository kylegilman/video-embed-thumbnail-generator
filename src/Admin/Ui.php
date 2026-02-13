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
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $this->options_manager->get_options()['embed_method'], $this->options_manager );
		$player->register_scripts();
	}

	public function block_init() {

		add_filter( 'block_type_metadata', array( $this, 'conditionally_add_assets_to_block_metadata' ) );

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options_manager );
		$block_attributes  = $shortcode_handler->get_block_attributes();

		register_block_type(
			VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/videopack-video',
			array(
				'render_callback' => array( $this, 'render_videopack_block' ),
				'attributes'      => $block_attributes,
			)
		);

		register_block_type(
			VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/videopack-collection',
			array(
				'render_callback' => array( $this, 'render_videopack_block' ),
			)
		);

		$this->localize_block_settings( 'videopack-videopack-video-editor-script' );
		$this->localize_block_settings( 'videopack-videopack-gallery-editor-script' );
	}

	public function conditionally_add_assets_to_block_metadata( $metadata ) {
		if ( isset( $metadata['name'] )
			&& ( 'videopack/videopack-video' === $metadata['name'] || 'videopack/videopack-gallery' === $metadata['name'] )
		) {
			$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $this->options_manager->get_options()['embed_method'], $this->options_manager );
			return $player->filter_block_metadata( $metadata );
		}
		return $metadata;
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
		return '<div ' . get_block_wrapper_attributes() . ' >' . $shortcode_handler->do( $attributes, $content ) . '</div>';
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

		$options         = $this->options_manager->get_options();
		$global_settings = wp_get_global_settings();

		return array(
			'url'                => plugins_url( '', VIDEOPACK_PLUGIN_FILE ),
			'codecs'             => $codecs_data,
			'resolutions'        => $resolutions_data,
			'ffmpeg_exists'      => $options['ffmpeg_exists'],
			'browser_thumbnails' => $options['browser_thumbnails'],
			'auto_thumb'         => $options['auto_thumb'],
			'auto_thumb_number'  => $options['auto_thumb_number'],
			'auto_thumb_position'=> $options['auto_thumb_position'],
			'ffmpeg_thumb_watermark' => $options['ffmpeg_thumb_watermark'],
			'contentSize'        => isset( $global_settings['layout']['contentSize'] ) ? $global_settings['layout']['contentSize'] : false,
			'wideSize'           => isset( $global_settings['layout']['wideSize'] ) ? $global_settings['layout']['wideSize'] : false,
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
			$freemius_dependencies       = array();
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

			// Always enqueue player
			$video_js_player = new \Videopack\Frontend\Video_Players\Player_Video_Js( $this->options_manager );
			$video_js_player->enqueue_player_scripts();
			$video_js_player->enqueue_styles();

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
			array_merge( $script_asset['dependencies'], array( 'wp-api-fetch', 'wp-url' ) ),
			$script_asset['version'],
			true
		);
		wp_set_script_translations( 'videopack-attachment-details', 'video-embed-thumbnail-generator' );

		$this->localize_block_settings( 'videopack-attachment-details' );

		$pending_attachments = $this->get_pending_browser_thumbnails();
		$this->localize_block_settings( 'videopack-attachment-details', array( 'pending_attachments' => $pending_attachments ) );

		wp_enqueue_style(
			'videopack-attachment-details',
			plugins_url( 'admin-ui/build/attachment-details.css', VIDEOPACK_PLUGIN_FILE ),
			array( 'wp-components' ),
			VIDEOPACK_VERSION
		);
	}

	/**
	 * Retrieves a list of attachments that need browser-based thumbnail generation.
	 *
	 * @return array List of attachments with 'id' and 'url'.
	 */
	private function get_pending_browser_thumbnails() {
		$options = $this->options_manager->get_options();

		// Only proceed if browser thumbnails are enabled and user has capability.
		if ( empty( $options['browser_thumbnails'] ) || ! current_user_can( 'make_video_thumbnails' ) ) {
			return array();
		}

		$query = new \WP_Query( array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'posts_per_page' => 20, // Limit to avoid performance issues.
			'meta_query'     => array(
				array(
					'key'   => '_videopack_needs_browser_thumb',
					'value' => '1',
				),
			),
			'fields'         => 'ids',
		) );

		$attachments = array();
		foreach ( $query->posts as $post_id ) {
			$url = wp_get_attachment_url( $post_id );
			if ( $url ) {
				$attachments[] = array(
					'id'  => $post_id,
					'url' => $url,
				);
			}
		}
		return $attachments;
	}
}
