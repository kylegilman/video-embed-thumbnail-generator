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
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry $format_registry
	 */
	protected $format_registry;
	
	/**
	 * Rendered duotone slugs to avoid duplicates.
	 *
	 * @var array $rendered_duotones
	 */
	protected static $rendered_duotones = array();

	/**
	 * Initialize the class.
	 *
	 * @param array                             $options         The options array.
	 * @param \Videopack\Admin\Formats\Registry $format_registry The video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry ) {
		$this->options         = $options;
		$this->format_registry = $format_registry;
	}

	/**
	 * Registers scripts for the selected video player.
	 *
	 * @return void
	 */
	public function register_scripts() {
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, $this->format_registry );
		$player->register_scripts();
	}

	/**
	 * Initializes Videopack blocks and localizes settings.
	 *
	 * @return void
	 */
	public function block_init() {

		add_filter( 'block_type_metadata', array( $this, 'conditionally_add_assets_to_block_metadata' ) );

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options );
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
		register_block_type(
			(string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/videopack-grid',
			array(
				'render_callback' => array( $this, 'render_videopack_block' ),
			)
		);

		$this->localize_block_settings( 'videopack-blocks-videopack-video-videopack-video-editor-script' );
		$this->localize_block_settings( 'videopack-blocks-videopack-gallery-videopack-gallery-editor-script' );
		$this->localize_block_settings( 'videopack-blocks-videopack-list-videopack-list-editor-script' );
		$this->localize_block_settings( 'videopack-blocks-videopack-grid-videopack-grid-editor-script' );

		$player_asset_path = (string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/videopack-videoplayer.asset.php';
		if ( file_exists( $player_asset_path ) ) {
			$player_asset = (array) require $player_asset_path;
			wp_register_script(
				'videopack-videoplayer',
				(string) plugins_url( 'admin-ui/build/videopack-videoplayer.js', VIDEOPACK_PLUGIN_FILE ),
				(array) $player_asset['dependencies'],
				(string) $player_asset['version'],
				true
			);
			wp_set_script_translations( 'videopack-videoplayer', 'video-embed-thumbnail-generator' );
			wp_register_style(
				'videopack-videoplayer',
				(string) plugins_url( 'admin-ui/build/videopack-videoplayer.css', VIDEOPACK_PLUGIN_FILE ),
				array(),
				(string) $player_asset['version']
			);
		}

		$gallery_asset_path = (string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/videopack-videogallery.asset.php';
		if ( file_exists( $gallery_asset_path ) ) {
			$gallery_asset = (array) require $gallery_asset_path;
			wp_register_script(
				'videopack-videogallery',
				(string) plugins_url( 'admin-ui/build/videopack-videogallery.js', VIDEOPACK_PLUGIN_FILE ),
				(array) $gallery_asset['dependencies'],
				(string) $gallery_asset['version'],
				true
			);
			wp_set_script_translations( 'videopack-videogallery', 'video-embed-thumbnail-generator' );
			wp_register_style(
				'videopack-videogallery',
				(string) plugins_url( 'admin-ui/build/videopack-videogallery.css', VIDEOPACK_PLUGIN_FILE ),
				array(),
				(string) $gallery_asset['version']
			);
		}
	}

	/**
	 * Enqueues assets for blocks (frontend and editor).
	 *
	 * @return void
	 */
	public function enqueue_block_assets() {
		wp_enqueue_script( 'videopack-videoplayer' );
		wp_enqueue_style( 'videopack-videoplayer' );
	}

	/**
	 * Conditionally adds assets to block metadata based on the player type.
	 *
	 * @param array $metadata The block metadata.
	 * @return array The filtered metadata.
	 */
	public function conditionally_add_assets_to_block_metadata( $metadata ) {
		if ( isset( $metadata['name'] )
			&& in_array( (string) $metadata['name'], array( 'videopack/videopack-video', 'videopack/videopack-gallery', 'videopack/videopack-list', 'videopack/videopack-grid' ), true )
		) {
			$player   = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, $this->format_registry );
			$metadata = (array) $player->filter_block_metadata( (array) $metadata );

			if ( (string) $metadata['name'] === 'videopack/videopack-gallery' ) {
				if ( ! isset( $metadata['editorScript'] ) ) {
					$metadata['editorScript'] = array();
				} elseif ( ! is_array( $metadata['editorScript'] ) ) {
					$metadata['editorScript'] = array( (string) $metadata['editorScript'] );
				}
				$metadata['editorScript'][] = 'videopack-videogallery';

				if ( ! isset( $metadata['editorStyle'] ) ) {
					$metadata['editorStyle'] = array();
				} elseif ( ! is_array( $metadata['editorStyle'] ) ) {
					$metadata['editorStyle'] = array( (string) $metadata['editorStyle'] );
				}
				$metadata['editorStyle'][] = 'videopack-videogallery';

				if ( ! isset( $metadata['style'] ) ) {
					$metadata['style'] = array();
				} elseif ( ! is_array( $metadata['style'] ) ) {
					$metadata['style'] = array( (string) $metadata['style'] );
				}
				$metadata['style'][] = 'videopack-videogallery';
			}

			return (array) $metadata;
		}
		return (array) $metadata;
	}

	/**
	 * Server-side rendering callback for the Videopack block.
	 *
	 * @param array     $attributes The block attributes.
	 * @param string    $content    The block's inner content.
	 * @param \WP_Block $block      The block instance.
	 * @return string The rendered HTML of the block.
	 */
	public function render_videopack_block( $attributes, $content, $block ) {
		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options );

		if ( (string) $block->name === 'videopack/videopack-list' ) {
			$attributes['gallery'] = false;
		} elseif ( (string) $block->name === 'videopack/videopack-gallery' ) {
			$attributes['gallery'] = true;
		} elseif ( (string) $block->name === 'videopack/videopack-video' ) {
			$attributes['videos'] = 1;
		} elseif ( (string) $block->name === 'videopack/videopack-grid' ) {
			$attributes['layout'] = 'grid';
		}

		return '<div ' . (string) get_block_wrapper_attributes() . ' >' . $shortcode_handler->do( (array) $attributes, (string) $content ) . '</div>';
	}

	/**
	 * Prepares and returns the videopack_config data for JavaScript.
	 *
	 * @return array The settings data.
	 */
	public function get_videopack_config_data() {
		$codec_objects = (array) $this->format_registry->get_video_codecs();
		$codecs_data   = array();
		foreach ( $codec_objects as $codec_class ) {
			if ( $codec_class instanceof \Videopack\Admin\Formats\Codecs\Video_Codec ) {
				$codecs_data[] = (array) $codec_class->get_properties();
			}
		}

		$resolution_objects = (array) $this->format_registry->get_video_resolutions();
		$resolutions_data   = array();
		foreach ( $resolution_objects as $resolution ) {
			if ( $resolution instanceof \Videopack\Admin\Formats\Video_Resolution ) {
				$height             = (int) $resolution->get_height();
				$resolutions_data[] = array(
					'id'        => (string) $resolution->get_id(),
					'name'      => (string) $this->format_registry->get_resolution_l10n( (string) $resolution->get_name() ),
					'height'    => $height,
					'width'     => $height ? (int) ceil( $height * 16 / 9 ) : null,
					'is_custom' => (bool) $resolution->is_custom(),
				);
			}
		}

		$options         = $this->options;
		$global_settings = (array) wp_get_global_settings();

		$fs               = function_exists( 'videopack_fs' ) ? videopack_fs() : null;
		$freemius_enabled = ( null !== $fs ) && ( (bool) $fs->is_registered() || (bool) $fs->is_pending_activation() );

		$theme_colors = $global_settings['color']['palette']['theme'] ?? array();
		if ( empty( $theme_colors ) ) {
			$theme_colors = $global_settings['color']['palette']['default'] ?? array();
		}

		// Ensure White and Gray-900 are always available in the palette.
		$theme_colors[] = array(
			'name'  => 'White',
			'slug'  => 'white',
			'color' => '#ffffff',
		);
		$theme_colors[] = array(
			'name'  => 'Gray 900',
			'slug'  => 'gray-900',
			'color' => '#1e1e1e',
		);
		$theme_colors[] = array(
			'name'  => __( 'Transparent', 'video-embed-thumbnail-generator' ),
			'color' => 'transparent',
		);

		$duotone_theme   = $global_settings['color']['duotone']['theme'] ?? array();
		$duotone_default = $global_settings['color']['duotone']['default'] ?? array();

		return array(
			'url'                    => (string) plugins_url( '', VIDEOPACK_PLUGIN_FILE ),
			'codecs'                 => $codecs_data,
			'resolutions'            => $resolutions_data,
			'duotoneTheme'           => $duotone_theme,
			'duotoneDefault'         => $duotone_default,
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
			'replace_preview_video'  => (bool) ( $options['replace_preview_video'] ?? true ),
			'align'                  => (string) ( $options['align'] ?? '' ),
			'postId'                 => (int) get_the_ID(),
			'themeColors'            => $theme_colors,
			'globalStyles'           => function_exists( 'wp_get_global_stylesheet' ) ? wp_get_global_stylesheet() : '',
			'mejs_controls_svg'      => (string) includes_url( 'js/mediaelement/mejs-controls.svg' ),
			'defaults'               => array(
				'title_color'                 => (string) ( $options['title_color'] ?? '' ),
				'title_background_color'      => (string) ( $options['title_background_color'] ?? '' ),
				'pagination_color'            => (string) ( $options['pagination_color'] ?? '' ),
				'pagination_background_color' => (string) ( $options['pagination_background_color'] ?? '' ),
				'pagination_active_bg_color'  => (string) ( $options['pagination_active_bg_color'] ?? '' ),
				'pagination_active_color'     => (string) ( $options['pagination_active_color'] ?? '' ),
				'play_button_color'           => (string) ( $options['play_button_color'] ?? '' ),
				'play_button_icon_color'      => (string) ( $options['play_button_icon_color'] ?? '' ),
				'control_bar_bg_color'        => (string) ( $options['control_bar_bg_color'] ?? '' ),
				'control_bar_color'           => (string) ( $options['control_bar_color'] ?? '' ),
				'width'                       => (int) ( $options['width'] ?? 960 ),
				'height'                      => (int) ( $options['height'] ?? 540 ),
				'fixed_aspect'                => (string) ( $options['fixed_aspect'] ?? 'vertical' ),
				'default_ratio'               => (string) ( (int) ( $options['width'] ?? 960 ) ) . ' / ' . (string) ( (int) ( $options['height'] ?? 540 ) ),
			),
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

			$video_js_player = \Videopack\Frontend\Video_Players\Player_Factory::create( 'Video.js', $this->options, $this->format_registry );
			$video_js_player->register_scripts();
			$video_js_player->enqueue_player_scripts();
			$video_js_player->enqueue_styles();

			$wp_player = \Videopack\Frontend\Video_Players\Player_Factory::create( 'WordPress Default', $this->options, $this->format_registry );
			$wp_player->register_scripts();
			$wp_player->enqueue_player_scripts();
			$wp_player->enqueue_styles();

			wp_enqueue_script(
				'videopack-settings',
				(string) plugins_url( 'admin-ui/build/settings.js', VIDEOPACK_PLUGIN_FILE ),
				(array) array_merge( (array) $script_asset['dependencies'], $freemius_dependencies, array( 'videopack-videoplayer', 'videopack-videogallery' ) ),
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
			$options           = $this->options;
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
			(array) array_merge( (array) $script_asset['dependencies'], array( 'wp-api-fetch', 'wp-url', 'videopack-videoplayer' ) ),
			(string) $script_asset['version'],
			true
		);
		wp_set_script_translations( 'videopack-attachment-details', 'video-embed-thumbnail-generator' );

		$attachment_meta     = new \Videopack\Admin\Attachment_Meta( $this->options );
		$attachment          = new \Videopack\Admin\Attachment( $this->options, $this->format_registry, $attachment_meta );
		$pending_attachments = (array) $attachment->get_pending_browser_thumbnails();
		$this->localize_block_settings( 'videopack-attachment-details', array( 'pending_attachments' => $pending_attachments ) );

		$embed_method = (string) ( $this->options['embed_method'] ?? 'Video.js' );
		$player       = \Videopack\Frontend\Video_Players\Player_Factory::create( $embed_method, $this->options, $this->format_registry );
		$player->register_scripts();
		$player->enqueue_player_scripts();
		$player->enqueue_styles();

		wp_enqueue_style(
			'videopack-attachment-details',
			(string) plugins_url( 'admin-ui/build/attachment-details.css', VIDEOPACK_PLUGIN_FILE ),
			array( 'wp-components', 'videopack-videoplayer' ),
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

	/**
	 * Enqueues a duotone filter SVG to be rendered in the footer.
	 *
	 * @param string $slug The duotone preset slug.
	 * @return void
	 */
	public static function enqueue_duotone_filter( $slug ) {
		if ( empty( $slug ) ) {
			return;
		}

		add_action(
			'wp_footer',
			function () use ( $slug ) {
				echo self::get_duotone_filter_html( $slug ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}
		);
	}

	/**
	 * Returns the HTML (SVG + CSS) for a duotone filter.
	 *
	 * @param string $slug The duotone preset slug.
	 * @return string The HTML string.
	 */
	public static function get_duotone_filter_html( $slug ) {
		if ( empty( $slug ) ) {
			return '';
		}

		// Normalize slug (remove -filter suffix if present) to avoid wp-duotone-slug-filter-filter logic.
		$base_slug = preg_replace( '/-filter$/', '', $slug );

		if ( in_array( $base_slug, self::$rendered_duotones, true ) ) {
			return '';
		}

		$duotone_settings = wp_get_global_settings( array( 'color', 'duotone' ) );
		$presets          = array_merge(
			$duotone_settings['theme'] ?? array(),
			$duotone_settings['default'] ?? array()
		);

		$found_preset = null;
		foreach ( $presets as $preset ) {
			$preset_slug = preg_replace( '/-filter$/', '', $preset['slug'] ?? '' );
			if ( $preset_slug === $base_slug ) {
				$found_preset = $preset;
				break;
			}
		}

		if ( ! $found_preset ) {
			return '';
		}

		self::$rendered_duotones[] = $base_slug;

		$filter_id    = 'wp-duotone-' . $base_slug;
		$filter_class = 'wp-duotone-' . $base_slug . '-filter';

		$html  = self::get_duotone_svg_filter( $found_preset, $filter_id );
		$html .= '<style>.' . esc_attr( $filter_class ) . ' { filter: url(#' . esc_attr( $filter_id ) . '); }</style>';

		return $html;
	}

	/**
	 * Generates the SVG filter string for a duotone preset.
	 *
	 * @param array  $preset    The duotone preset array.
	 * @param string $filter_id The ID to use for the filter element.
	 * @return string The SVG filter string.
	 */
	private static function get_duotone_svg_filter( $preset, $filter_id ) {
		$colors = $preset['colors'] ?? array();

		if ( count( $colors ) < 2 ) {
			return '';
		}

		// Instead of using deprecated WP_Duotone methods which might have platform-specific issues,
		// we use our manual generation to ensure a consistent, non-escaped output.
		$c1 = self::hex_to_rgb( $colors[0] );
		$c2 = self::hex_to_rgb( $colors[1] );

		$r1 = round( $c1['r'] / 255, 3 );
		$r2 = round( $c2['r'] / 255, 3 );
		$g1 = round( $c1['g'] / 255, 3 );
		$g2 = round( $c2['g'] / 255, 3 );
		$b1 = round( $c1['b'] / 255, 3 );
		$b2 = round( $c2['b'] / 255, 3 );

		$output  = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" focusable="false" role="none" style="visibility: hidden; position: absolute; left: -9999px; top: -9999px;">';
		$output .= '<defs>';
		$output .= '<filter id="' . esc_attr( $filter_id ) . '">';
		$output .= '<feColorMatrix color-interpolation-filters="sRGB" type="matrix" values=".299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0" />';
		$output .= '<feComponentTransfer color-interpolation-filters="sRGB">';
		$output .= '<feFuncR type="table" tableValues="' . esc_attr( "$r1 $r2" ) . '" />';
		$output .= '<feFuncG type="table" tableValues="' . esc_attr( "$g1 $g2" ) . '" />';
		$output .= '<feFuncB type="table" tableValues="' . esc_attr( "$b1 $b2" ) . '" />';
		$output .= '<feFuncA type="identity" />';
		$output .= '</feComponentTransfer>';
		$output .= '<feComposite operator="in" in2="SourceGraphic" />';
		$output .= '</filter>';
		$output .= '</defs>';
		$output .= '</svg>';

		return $output;
	}

	/**
	 * Converts hex color to RGB.
	 *
	 * @param string $hex The hex color string.
	 * @return array The RGB array.
	 */
	private static function hex_to_rgb( $hex ) {
		$hex = str_replace( '#', '', $hex );

		if ( 3 === strlen( $hex ) ) {
			$r = hexdec( substr( $hex, 0, 1 ) . substr( $hex, 0, 1 ) );
			$g = hexdec( substr( $hex, 1, 1 ) . substr( $hex, 1, 1 ) );
			$b = hexdec( substr( $hex, 2, 1 ) . substr( $hex, 2, 1 ) );
		} else {
			$r = hexdec( substr( $hex, 0, 2 ) );
			$g = hexdec( substr( $hex, 2, 2 ) );
			$b = hexdec( substr( $hex, 4, 2 ) );
		}

		return array(
			'r' => $r,
			'g' => $g,
			'b' => $b,
		);
	}
}
