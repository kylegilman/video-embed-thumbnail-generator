<?php
/**
 * Admin UI handler.
 *
 * @package Videopack
 * @subpackage Videopack/Admin
 */

namespace Videopack\Admin;

use Videopack\Common\Hook_Subscriber;
use Videopack\Frontend\Modular_Renderer;

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
class Ui implements Hook_Subscriber {

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
	 * Unique instance counter for rendering blocks.
	 *
	 * @var int $instance_counter
	 */
	public static $instance_counter = 0;

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
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'init',
				'callback' => 'block_init',
			),
			array(
				'hook'     => 'admin_print_footer_scripts',
				'callback' => 'print_tinymce_template',
			),
		);
	}

	/**
	 * Returns an array of filters to subscribe to.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array(
			array(
				'hook'     => 'action_scheduler_enable_recreate_data_store',
				'callback' => 'suppress_action_scheduler_warning',
			),
			array(
				'hook'     => 'block_type_metadata',
				'callback' => 'conditionally_add_assets_to_block_metadata',
			),
			array(
				'hook'     => 'block_type_metadata',
				'callback' => 'register_videopack_block_context',
			),
			array(
				'hook'     => 'mce_external_plugins',
				'callback' => 'register_tinymce_plugin',
			),
		);
	}

	/**
	 * Handle false positive ActionScheduler "missing tables" warning caused by case-sensitivity mismatches on some systems (e.g., Windows).
	 *
	 * @param bool $enable Whether to enable recreation of data store.
	 * @return bool
	 */
	public function suppress_action_scheduler_warning( $enable ) {
		global $wpdb;
		$table_list = array(
			'actionscheduler_actions',
			'actionscheduler_logs',
			'actionscheduler_groups',
			'actionscheduler_claims',
		);

		$found_tables       = (array) $wpdb->get_col( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->prefix . 'actionscheduler%' ) );
		$found_tables_lower = array_map( 'strtolower', $found_tables );

		$all_exist = true;
		foreach ( $table_list as $table_name ) {
			if ( ! in_array( strtolower( $wpdb->prefix . $table_name ), $found_tables_lower, true ) ) {
				$all_exist = false;
				break;
			}
		}

		if ( $all_exist ) {
			if ( class_exists( 'ActionScheduler_DataController' ) && ! \ActionScheduler_DataController::is_migration_complete() ) {
				\ActionScheduler_DataController::mark_migration_complete();
			}
			return false; // Tables exist (case-insensitively), so suppress the warning.
		}

		return $enable; // Tables are truly missing, let ActionScheduler handle it.
	}

	/**
	 * Initializes Videopack blocks.
	 *
	 * @return void
	 */
	public function block_init() {
		register_block_type( (string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/player-container' );

		// Register modular / inner blocks.
		$modular_blocks = array(
			'collection',
			'play-button',
			'thumbnail',
			'view-count',
			'duration',
			'title',
			'loop',
			'pagination',
			'player',
			'watermark',
			'caption',
		);

		foreach ( $modular_blocks as $block_name ) {
			// We register the block types here, but we NO LONGER specify render_callbacks.
			// The consolidated Videopack\Frontend\Blocks class now handles all rendering 
			// via the block_type_metadata_settings filter for maximum architectural parity.
			register_block_type( (string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/' . (string) $block_name );
		}
	}

	/**
	 * Conditionally adds assets to block metadata based on the player type.
	 *
	 * @param array $metadata The block metadata.
	 * @return array The filtered metadata.
	 */
	public function conditionally_add_assets_to_block_metadata( $metadata ) {
		if ( isset( $metadata['name'] )
			&& in_array( (string) $metadata['name'], array( 'videopack/player-container', 'videopack/collection', 'videopack/player' ), true )
		) {
			$player   = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, $this->format_registry );
			$metadata = (array) $player->filter_block_metadata( (array) $metadata );

			return (array) $metadata;
		}
		return (array) $metadata;
	}

	/**
	 * Dynamically injects shared attributes and context mapping into block metadata.
	 *
	 * @param array $metadata The block metadata.
	 * @return array The filtered metadata.
	 */
	public function register_videopack_block_context( $metadata ) {
		if ( ! isset( $metadata['name'] ) || strpos( (string) $metadata['name'], 'videopack/' ) !== 0 ) {
			return $metadata;
		}

		$shared_attributes = array(
			'skin'                        => array( 'type' => 'string' ),
			'title_color'                 => array( 'type' => 'string' ),
			'title_background_color'      => array( 'type' => 'string' ),
			'play_button_color'           => array( 'type' => 'string' ),
			'play_button_secondary_color' => array( 'type' => 'string' ),
			'control_bar_bg_color'        => array( 'type' => 'string' ),
			'control_bar_color'           => array( 'type' => 'string' ),
			'pagination_color'            => array( 'type' => 'string' ),
			'pagination_background_color' => array( 'type' => 'string' ),
			'pagination_active_bg_color'  => array( 'type' => 'string' ),
			'pagination_active_color'     => array( 'type' => 'string' ),
			'sources'                     => array( 'type' => 'array' ),
			'source_groups'               => array( 'type' => 'object' ),
		);

		$provides_context = array(
			'videopack/skin'                        => 'skin',
			'videopack/title_color'                 => 'title_color',
			'videopack/title_background_color'      => 'title_background_color',
			'videopack/play_button_color'           => 'play_button_color',
			'videopack/play_button_secondary_color' => 'play_button_secondary_color',
			'videopack/control_bar_bg_color'        => 'control_bar_bg_color',
			'videopack/control_bar_color'           => 'control_bar_color',
			'videopack/pagination_color'            => 'pagination_color',
			'videopack/pagination_background_color' => 'pagination_background_color',
			'videopack/pagination_active_bg_color'  => 'pagination_active_bg_color',
			'videopack/pagination_active_color'     => 'pagination_active_color',
			'videopack/sources'                     => 'sources',
			'videopack/source_groups'               => 'source_groups',
		);

		// Only map these to providesContext if the block actually has the attribute.
		// Otherwise, Gutenberg will provide 'undefined' and potentially shadow 
		// manual BlockContextProvider values.
		$metadata_attributes = isset( $metadata['attributes'] ) ? $metadata['attributes'] : array();
		$mappings = array(
			'videopack/postId'       => 'id',
			'videopack/attachmentId' => 'id',
			'videopack/isStandalone' => 'isStandalone',
			'videopack/postType'     => 'postType',
		);

		// Only map content attributes to providesContext on the frontend.
		// In the editor, we handle these manually via VideopackContextBridge 
		// to allow for hydration of 'lean' blocks.
		if ( ! is_admin() ) {
			$mappings['videopack/src']     = 'src';
			$mappings['videopack/poster']  = 'poster';
			$mappings['videopack/title']   = 'title';
			$mappings['videopack/caption'] = 'caption';
		}

		// Add general mappings for attributes that might exist on any block
		$mappings['videopack/isInsidePlayerOverlay'] = 'isInsidePlayerOverlay';
		$mappings['videopack/isInsidePlayerContainer'] = 'isInsidePlayerContainer';
		$mappings['videopack/isInsideThumbnail'] = 'isInsideThumbnail';
		
		foreach ( $mappings as $context_key => $attr_name ) {
			if ( isset( $metadata_attributes[ $attr_name ] ) ) {
				$provides_context[ $context_key ] = $attr_name;
			}
		}

		$uses_context = array_merge( 
			array_keys( $provides_context ),
			array(
				'videopack/postId',
				'videopack/attachmentId',
				'videopack/postType',
				'videopack/isStandalone',
				'videopack/prioritizePostData',
				'videopack/isInsideThumbnail',
				'videopack/isInsidePlayerOverlay',
				'videopack/isInsidePlayerContainer',
				'videopack/src',
				'videopack/poster',
				'videopack/title',
				'videopack/caption',
				'videopack/width',
				'videopack/height',
				'videopack/autoplay',
				'videopack/controls',
				'videopack/loop',
				'videopack/muted',
				'videopack/playsinline',
				'videopack/preload',
				'videopack/volume',
				'videopack/auto_res',
				'videopack/auto_codec',
				'videopack/sources',
				'videopack/source_groups',
				'videopack/text_tracks',
				'videopack/playback_rate',
				'videopack/downloadlink',
				'videopack/embedcode',
				'videopack/embedlink',
				'videopack/showCaption',
				'videopack/showBackground',
				'videopack/title_position',
				'videopack/restartCount',
				'videopack/textAlign',
				'videopack/position',
				'videopack/totalPages',
				'videopack/currentPage',
			)
		);

		// Blocks that get shared attributes injected
		$receives_shared_attributes = array(
			'videopack/collection',
			'videopack/player-container',
			'videopack/loop',
		);

		// Blocks that USE context (Children/Internal)
		$consumers = array(
			'videopack/loop',
			'videopack/thumbnail',
			'videopack/title',
			'videopack/duration',
			'videopack/view-count',
			'videopack/play-button',
			'videopack/pagination',
			'videopack/player',
			'videopack/watermark',
			'videopack/caption',
		);

		if ( in_array( $metadata['name'], $receives_shared_attributes, true ) ) {
			$metadata['attributes'] = array_merge( $metadata_attributes, $shared_attributes );
			// If it receives shared attributes, it should provide them to children
			$metadata['providesContext'] = array_merge( $metadata['providesContext'] ?? array(), $provides_context );
		} else {
			// For all other blocks, only provide context for attributes they natively possess
			if ( ! empty( $provides_context ) ) {
				// Strip out design context if this block doesn't natively have those attributes
				$native_provides = array();
				foreach ( $provides_context as $context_key => $attr_name ) {
					if ( isset( $metadata_attributes[ $attr_name ] ) ) {
						$native_provides[ $context_key ] = $attr_name;
					}
				}
				if ( ! empty( $native_provides ) ) {
					$metadata['providesContext'] = array_merge( $metadata['providesContext'] ?? array(), $native_provides );
				}
			}
		}

		if ( in_array( $metadata['name'], $consumers, true ) ) {
			$metadata['usesContext'] = array_values( array_unique( array_merge( $metadata['usesContext'] ?? array(), $uses_context ) ) );
		}

		return $metadata;
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

		return (array) apply_filters(
			'videopack_config_data',
			array(
				'url'                    => (string) plugins_url( '', VIDEOPACK_PLUGIN_FILE ),
				'codecs'                 => $codecs_data,
				'resolutions'            => $resolutions_data,
				'ffmpeg_exists'          => is_bool( $options['ffmpeg_exists'] ?? null ) ? $options['ffmpeg_exists'] : ( ( 'true' === ( $options['ffmpeg_exists'] ?? '' ) || 1 === (int) ( $options['ffmpeg_exists'] ?? 0 ) ) ? true : ( $options['ffmpeg_exists'] ?? 'notchecked' ) ),
				'browser_thumbnails'     => (bool) ( $options['browser_thumbnails'] ?? true ),
				'auto_thumb'             => (bool) ( $options['auto_thumb'] ?? false ),
				'auto_thumb_number'      => (int) ( $options['auto_thumb_number'] ?? 1 ),
				'auto_thumb_position'    => (int) ( $options['auto_thumb_position'] ?? 50 ),
				'ffmpeg_thumb_watermark' => (array) ( $options['ffmpeg_thumb_watermark'] ?? array() ),
				'embed_method'           => (string) ( ! empty( $options['embed_method'] ) ? $options['embed_method'] : 'Video.js' ),
				'watermark'              => (string) ( ! empty( $options['watermark'] ) ? $options['watermark'] : '' ),
				'skin'                   => (string) ( ! empty( $options['skin'] ) ? $options['skin'] : 'vjs-theme-videopack' ),
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
				'postId'                 => (int) ( is_admin() ? ( $_GET['post'] ?? get_queried_object_id() ?: get_the_ID() ) : get_the_ID() ),
				'videopack/postId'       => (int) ( is_admin() ? ( $_GET['post'] ?? get_queried_object_id() ?: get_the_ID() ) : get_the_ID() ),
				'themeColors'            => $theme_colors,
				'globalStyles'           => function_exists( 'wp_get_global_stylesheet' ) ? wp_get_global_stylesheet() : '',
				'mejs_controls_svg'      => (string) includes_url( 'js/mediaelement/mejs-controls.svg' ),
				'options'                => $options,
				'defaults'               => \Videopack\Common\Defaults::get_all( $options ),
				'classic_embed_nonce'    => wp_create_nonce( 'videopack_classic_embed' ),
			)
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
	 * Registers the TinyMCE plugin for Videopack.
	 *
	 * @param array $plugin_array Existing TinyMCE plugins.
	 * @return array Modified TinyMCE plugins.
	 */
	public function register_tinymce_plugin( $plugin_array ) {
		// We no longer load tinymce.js as a TinyMCE plugin because it has complex React dependencies.
		// Instead, we enqueue it as a standard WordPress script in Assets.php.
		return (array) $plugin_array;
	}

	/**
	 * Output the TinyMCE templates.
	 *
	 * @return void
	 */
	public function print_tinymce_template() {
		include (string) VIDEOPACK_PLUGIN_DIR . 'src/Admin/partials/tinymce-template.php';
	}
}
