<?php
/**
 * Admin UI handler.
 *
 * @package Videopack
 * @subpackage Videopack/Admin
 */

namespace Videopack\Admin;

/**
 * Class Ui
 *
 * Handles the registration of blocks, assets, and UI components for the admin area.
 *
 * This class is responsible for initializing Gutenberg blocks, enqueuing CSS and
 * JavaScript for settings pages and the media library, and providing localization
 * data for the React-based admin interface. It also handles TinyMCE integration
 * for the classic editor.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Admin
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Ui {

	/**
	 * Videopack Options manager class instance.
	 *
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

	/**
	 * Initialize the class.
	 *
	 * @param \Videopack\Admin\Options $options_manager The options manager instance.
	 */
	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
	}

	/**
	 * Registers scripts for the selected video player.
	 *
	 * @return void
	 */
	public function register_scripts() {
		$options = (array) $this->options_manager->get_options();
		$player  = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $options['embed_method'] ?? 'Video.js' ), $this->options_manager );
		$player->register_scripts();
	}

	/**
	 * Initializes Videopack blocks and localizes settings.
	 *
	 * @return void
	 */
	public function block_init() {

		add_filter( 'block_type_metadata', array( $this, 'conditionally_add_assets_to_block_metadata' ) );

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options_manager );
		$block_attributes  = (array) $shortcode_handler->get_block_attributes();

		register_block_type(
			(string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/videopack-video',
			array(
				'render_callback' => array( $this, 'render_videopack_block' ),
				'attributes'      => $block_attributes,
			)
		);

		register_block_type(
			(string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/videopack-gallery',
			array(
				'render_callback' => array( $this, 'render_videopack_block' ),
			)
		);

		register_block_type(
			(string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/videopack-list',
			array(
				'render_callback' => array( $this, 'render_videopack_block' ),
			)
		);

		$this->localize_block_settings( 'videopack-blocks-videopack-video-videopack-video-editor-script' );
		$this->localize_block_settings( 'videopack-blocks-videopack-gallery-videopack-gallery-editor-script' );
		$this->localize_block_settings( 'videopack-blocks-videopack-list-videopack-list-editor-script' );
	}

	/**
	 * Conditionally adds assets to block metadata based on the player type.
	 *
	 * @param array $metadata The block metadata.
	 * @return array The filtered metadata.
	 */
	public function conditionally_add_assets_to_block_metadata( $metadata ) {
		if ( isset( $metadata['name'] )
			&& ( 'videopack/videopack-video' === (string) $metadata['name'] || 'videopack/videopack-gallery' === (string) $metadata['name'] )
		) {
			$options = (array) $this->options_manager->get_options();
			$player  = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $options['embed_method'] ?? 'Video.js' ), $this->options_manager );
			return (array) $player->filter_block_metadata( (array) $metadata );
		}
		return (array) $metadata;
	}

	/**
	 * Server-side rendering callback for the Videopack block.
	 *
	 * @param array    $attributes The block attributes.
	 * @param string   $content    The block's inner content.
	 * @param \WP_Block $block      The block instance.
	 * @return string The rendered HTML of the block.
	 */
	public function render_videopack_block( $attributes, $content, $block ) {
		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options_manager );

		if ( (string) $block->name === 'videopack/videopack-list' ) {
			$attributes['gallery'] = false;
		} elseif ( (string) $block->name === 'videopack/videopack-gallery' ) {
			$attributes['gallery'] = true;
		}

		return '<div ' . (string) get_block_wrapper_attributes() . ' >' . $shortcode_handler->do( (array) $attributes, (string) $content ) . '</div>';
	}

	/**
	 * Prepares and returns the videopack_config data for JavaScript.
	 *
	 * @return array The settings data.
	 */
	public function get_videopack_config_data() {
		$codec_objects = (array) $this->options_manager->get_video_codecs();
		$codecs_data   = array();
		foreach ( $codec_objects as $codec_class ) {
			if ( $codec_class instanceof \Videopack\Admin\Formats\Codecs\Video_Codec ) {
				$codecs_data[] = (array) $codec_class->get_properties();
			}
		}

		$resolution_objects = (array) $this->options_manager->get_video_resolutions();
		$resolutions_data   = array();
		foreach ( $resolution_objects as $resolution ) {
			if ( $resolution instanceof \Videopack\Admin\Formats\Video_Resolution ) {
				$height             = (int) $resolution->get_height();
				$resolutions_data[] = array(
					'id'        => (string) $resolution->get_id(),
					'name'      => (string) $this->options_manager->get_resolution_l10n( (string) $resolution->get_name() ),
					'height'    => $height,
					'width'     => $height ? (int) ceil( $height * 16 / 9 ) : null,
					'is_custom' => (bool) $resolution->is_custom(),
				);
			}
		}

		$options         = (array) $this->options_manager->get_options();
		$global_settings = (array) wp_get_global_settings();

		$fs               = function_exists( 'videopack_fs' ) ? videopack_fs() : null;
		$freemius_enabled = ( null !== $fs ) && ( (bool) $fs->is_registered() || (bool) $fs->is_pending_activation() );

		return array(
			'url'                    => (string) plugins_url( '', VIDEOPACK_PLUGIN_FILE ),
			'codecs'                 => $codecs_data,
			'resolutions'            => $resolutions_data,
			'ffmpeg_exists'          => $options['ffmpeg_exists'] ?? 'notchecked',
			'browser_thumbnails'     => (bool) ( $options['browser_thumbnails'] ?? true ),
			'auto_thumb'             => (bool) ( $options['auto_thumb'] ?? false ),
			'auto_thumb_number'      => (int) ( $options['auto_thumb_number'] ?? 1 ),
			'auto_thumb_position'    => (int) ( $options['auto_thumb_position'] ?? 50 ),
			'ffmpeg_thumb_watermark' => (array) ( $options['ffmpeg_thumb_watermark'] ?? array() ),
			'embed_method'           => (string) ( $options['embed_method'] ?? 'Video.js' ),
			'contentSize'            => $global_settings['layout']['contentSize'] ?? false,
			'wideSize'               => $global_settings['layout']['wideSize'] ?? false,
			'freemiusEnabled'        => $freemius_enabled,
			'isMultisite'            => (bool) is_multisite(),
			'isNetworkAdmin'         => (bool) is_network_admin(),
			'isNetworkActive'        => ( null !== $fs ) && (bool) $fs->is_network_active(),
			'isFfmpegOverridden'     => is_multisite() && (bool) ( \Videopack\Admin\Multisite::get_network_options()['superadmin_only_ffmpeg_settings'] ?? false ),
			'isSuperAdmin'           => (bool) is_super_admin(),
			'rest_url'               => (string) get_rest_url(),
			'rest_url_render'        => (string) get_rest_url( null, 'videopack/v1/render-shortcode' ),
			'postId'                 => (int) get_the_ID(),
		);
	}

	/**
	 * Adds the videopack_config inline script to a given script handle.
	 *
	 * @param string $handle     The script handle to attach the inline script to.
	 * @param array  $extra_data Optional. Extra data to merge into the settings object.
	 * @return void
	 */
	public function localize_block_settings( $handle, $extra_data = array() ) {
		$settings_data = (array) $this->get_videopack_config_data();
		if ( ! empty( $extra_data ) ) {
			$settings_data = (array) array_merge( $settings_data, (array) $extra_data );
		}

		wp_localize_script( (string) $handle, 'videopack_config', $settings_data );
	}

	/**
	 * Enqueues assets for specific admin pages.
	 *
	 * @param string $hook_suffix The current page hook suffix.
	 * @return void
	 */
	public function enqueue_page_assets( $hook_suffix ) {

		if ( 'settings_page_video_embed_thumbnail_generator_settings' === (string) $hook_suffix ) {
			$script_asset_path = (string) plugin_dir_path( VIDEOPACK_PLUGIN_FILE ) . 'admin-ui/build/settings.asset.php';

			if ( ! file_exists( $script_asset_path ) ) {
				return;
			}

			$script_asset = (array) ( require $script_asset_path );

			$fs               = function_exists( 'videopack_fs' ) ? videopack_fs() : null;
			$freemius_enabled = ( null !== $fs ) && ( (bool) $fs->is_registered() || (bool) $fs->is_pending_activation() );

			$freemius_dependencies       = array();
			$freemius_style_dependencies = array();
			if ( $freemius_enabled ) {
				fs_enqueue_local_style( 'fs-common', '/admin/common.css' );
				fs_enqueue_local_style( 'fs-addons', '/admin/add-ons.css', array( 'fs-common' ) );
				fs_enqueue_local_style( 'fs-account', '/admin/account.css', array( 'fs-common' ) );
				fs_enqueue_local_style( 'fs_dialog_boxes', '/admin/dialog-boxes.css' );

				fs_enqueue_local_script( 'fs-form', 'jquery.form.js', array( 'jquery' ) );

				$freemius_dependencies       = array( 'fs-form' );
				$freemius_style_dependencies = array( 'fs-addons', 'fs-account', 'fs_dialog_boxes' );
			}

			$video_js_player = \Videopack\Frontend\Video_Players\Player_Factory::create( 'Video.js', $this->options_manager );
			$video_js_player->register_scripts();
			$video_js_player->enqueue_player_scripts();
			$video_js_player->enqueue_styles();

			$wp_player = \Videopack\Frontend\Video_Players\Player_Factory::create( 'WordPress Default', $this->options_manager );
			$wp_player->register_scripts();
			$wp_player->enqueue_player_scripts();
			$wp_player->enqueue_styles();

			wp_enqueue_script(
				'videopack-settings',
				(string) plugins_url( 'admin-ui/build/settings.js', VIDEOPACK_PLUGIN_FILE ),
				(array) array_merge( (array) $script_asset['dependencies'], $freemius_dependencies ),
				(string) $script_asset['version'],
				true
			);
			wp_set_script_translations( 'videopack-settings', 'video-embed-thumbnail-generator' );

			$this->localize_block_settings( 'videopack-settings' );

			$settings_css_dependencies = (array) array_merge( array( 'wp-components' ), $freemius_style_dependencies );

			wp_enqueue_style(
				'videopack-settings',
				(string) plugins_url( 'admin-ui/build/settings.css', VIDEOPACK_PLUGIN_FILE ),
				$settings_css_dependencies,
				(string) $script_asset['version']
			);
		}

		if ( 'tools_page_videopack_encode_queue' === (string) $hook_suffix ) {
			$options           = (array) $this->options_manager->get_options();
			$script_asset_path = (string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/encode-queue.asset.php';
			$script_asset      = (array) ( file_exists( $script_asset_path ) ? require $script_asset_path : array(
				'dependencies' => array( 'wp-element', 'wp-i18n', 'wp-components', 'wp-api-fetch', 'wp-data' ),
				'version'      => VIDEOPACK_VERSION,
			) );

			wp_enqueue_script(
				'videopack-encode-queue',
				(string) plugins_url( 'admin-ui/build/encode-queue.js', VIDEOPACK_PLUGIN_FILE ),
				(array) $script_asset['dependencies'],
				(string) $script_asset['version'],
				true
			);
			wp_set_script_translations( 'videopack-encode-queue', 'video-embed-thumbnail-generator' );

			wp_enqueue_style(
				'videopack-encode-queue-styles',
				(string) plugins_url( 'admin-ui/build/encode-queue.css', VIDEOPACK_PLUGIN_FILE ),
				array(),
				(string) $script_asset['version']
			);

			$inline_script = 'if (typeof videopack === "undefined") { videopack = {}; } videopack.encodeQueueData = ' . (string) wp_json_encode(
				array(
					'initialQueueState' => (string) ( $options['queue_control'] ?? 'play' ),
					'ffmpegExists'      => $options['ffmpeg_exists'] ?? 'notchecked',
				)
			) . ';';

			wp_add_inline_script( 'videopack-encode-queue', $inline_script, 'before' );

			wp_enqueue_media();
		}
	}

	/**
	 * Enqueues assets for the attachment details screen (meta boxes).
	 *
	 * @return void
	 */
	public function enqueue_attachment_details() {
		$script_asset_path = (string) plugin_dir_path( VIDEOPACK_PLUGIN_FILE ) . 'admin-ui/build/attachment-details.asset.php';

		if ( ! file_exists( $script_asset_path ) ) {
			return;
		}

		$script_asset = (array) ( require $script_asset_path );

		wp_enqueue_script(
			'videopack-attachment-details',
			(string) plugins_url( 'admin-ui/build/attachment-details.js', VIDEOPACK_PLUGIN_FILE ),
			(array) array_merge( (array) $script_asset['dependencies'], array( 'wp-api-fetch', 'wp-url' ) ),
			(string) $script_asset['version'],
			true
		);
		wp_set_script_translations( 'videopack-attachment-details', 'video-embed-thumbnail-generator' );

		$attachment          = new \Videopack\Admin\Attachment( $this->options_manager );
		$pending_attachments = (array) $attachment->get_pending_browser_thumbnails();
		$this->localize_block_settings( 'videopack-attachment-details', array( 'pending_attachments' => $pending_attachments ) );

		wp_enqueue_style(
			'videopack-attachment-details',
			(string) plugins_url( 'admin-ui/build/attachment-details.css', VIDEOPACK_PLUGIN_FILE ),
			array( 'wp-components' ),
			(string) VIDEOPACK_VERSION
		);
	}

	/**
	 * Registers the TinyMCE plugin for Videopack.
	 *
	 * @param array $plugin_array Existing TinyMCE plugins.
	 * @return array Modified TinyMCE plugins.
	 */
	public function register_tinymce_plugin( $plugin_array ) {
		$script_asset_path = (string) plugin_dir_path( VIDEOPACK_PLUGIN_FILE ) . 'admin-ui/build/tinymce.asset.php';
		if ( file_exists( $script_asset_path ) ) {
			$plugin_array['videopack-tinymce'] = (string) plugins_url( 'admin-ui/build/tinymce.js', VIDEOPACK_PLUGIN_FILE );
		}
		return (array) $plugin_array;
	}

	/**
	 * Enqueues assets for TinyMCE visual editor integration.
	 *
	 * @param string $hook_suffix The current page hook suffix.
	 * @return void
	 */
	public function enqueue_tinymce_assets( $hook_suffix ) {
		if ( ! in_array( (string) $hook_suffix, array( 'post.php', 'post-new.php' ), true ) ) {
			return;
		}

		wp_enqueue_script( 'mce-view' );
		wp_enqueue_script( 'wp-util' );
		wp_enqueue_script( 'wp-shortcode' );
		wp_enqueue_media();
		wp_enqueue_script( 'wp-api-fetch' );
		wp_enqueue_script( 'wp-url' );

		$this->localize_block_settings( 'mce-view' );

		add_editor_style( (string) includes_url( 'css/media-views.css' ) );
		add_editor_style( (string) includes_url( 'css/dashicons.css' ) );
		add_editor_style( (string) includes_url( 'js/mediaelement/wp-mediaelement.css' ) );

		$css_url  = (string) plugins_url( 'admin-ui/build/tinymce.css', VIDEOPACK_PLUGIN_FILE );
		$css_path = (string) plugin_dir_path( VIDEOPACK_PLUGIN_FILE ) . 'admin-ui/build/tinymce.css';
		if ( file_exists( $css_path ) ) {
			wp_enqueue_style( 'videopack-tinymce', $css_url, array(), (string) VIDEOPACK_VERSION );
			add_editor_style( $css_url );
		}

		$frontend_css_url  = (string) plugins_url( 'admin-ui/build/frontend-styles.css', VIDEOPACK_PLUGIN_FILE );
		$frontend_css_path = (string) plugin_dir_path( VIDEOPACK_PLUGIN_FILE ) . 'admin-ui/build/frontend-styles.css';
		if ( file_exists( $frontend_css_path ) ) {
			add_editor_style( $frontend_css_url );
		}
	}

	/**
	 * Prints the Underscore template used by TinyMCE.
	 *
	 * @return void
	 */
	public function print_tinymce_template() {
		include (string) VIDEOPACK_PLUGIN_DIR . 'src/Admin/partials/tinymce-template.php';
	}
}
