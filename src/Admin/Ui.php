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

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options );
		$block_attributes  = (array) $shortcode_handler->get_block_attributes();

		$shortcode_blocks = array( 'videopack-video', 'videopack-gallery', 'videopack-list' );

		register_block_type(
			(string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/videopack-video',
			array(
				'render_callback' => array( $this, 'render_videopack_block' ),
				'attributes'      => $block_attributes,
				'editor_script'   => 'videopack-blocks',
				'editor_style'    => 'videopack-blocks',
			)
		);

		register_block_type(
			(string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/videopack-gallery',
			array(
				'render_callback' => array( $this, 'render_videopack_block' ),
				'editor_script'   => 'videopack-blocks',
				'editor_style'    => 'videopack-blocks',
			)
		);

		register_block_type(
			(string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/videopack-list',
			array(
				'render_callback' => array( $this, 'render_videopack_block' ),
				'editor_script'   => 'videopack-blocks',
				'editor_style'    => 'videopack-blocks',
			)
		);

		// Register modular / inner blocks.
		$modular_blocks = array(
			'collection',
			'play-button',
			'thumbnail',
			'view-count',
			'video-duration',
			'video-title',
			'video-loop',
			'pagination',
			'video-player-engine',
			'video-watermark',
		);

		foreach ( $modular_blocks as $block_name ) {
			$args = array();
			$name = 'videopack/' . $block_name;
			if ( 'videopack/video-title' === $name ) {
				$args['render_callback'] = array( $this, 'render_video_title_block' );
			} elseif ( 'videopack/view-count' === $name ) {
				$args['render_callback'] = array( $this, 'render_view_count_block' );
			} elseif ( 'videopack/video-player-engine' === $name ) {
				$args['render_callback'] = array( $this, 'render_video_player_engine_block' );
			} elseif ( 'videopack/video-watermark' === $name ) {
				$args['render_callback'] = array( $this, 'render_video_watermark_block' );
			}
			register_block_type( (string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/blocks/' . (string) $block_name, $args );
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
			&& in_array( (string) $metadata['name'], array( 'videopack/videopack-video', 'videopack/videopack-gallery', 'videopack/videopack-list', 'videopack/collection', 'videopack/video-player-engine' ), true )
		) {
			$player   = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, $this->format_registry );
			$metadata = (array) $player->filter_block_metadata( (array) $metadata );

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

		// If the block is within a loop (like videopack/video-loop), use the postId from context.
		if ( empty( $attributes['id'] ) && ! empty( $block->context['postId'] ) ) {
			$attributes['id'] = $block->context['postId'];
		}

		// Context inheritance for styling and settings.
		$context_map = array(
			'videopack/skin'                   => 'skin',
			'videopack/view_count'             => 'view_count',
			'videopack/overlay_title'          => 'overlay_title',
			'videopack/title_color'            => 'title_color',
			'videopack/title_background_color' => 'title_background_color',
			'videopack/play_button_color'      => 'play_button_color',
			'videopack/play_button_icon_color' => 'play_button_icon_color',
			'videopack/control_bar_bg_color'   => 'control_bar_bg_color',
			'videopack/control_bar_color'      => 'control_bar_color',
			'videopack/downloadlink'           => 'downloadlink',
			'videopack/embeddable'             => 'embeddable',
			'videopack/showBackground'         => 'showBackground',
		);

		foreach ( $context_map as $context_key => $attr_key ) {
			if ( ! isset( $attributes[ $attr_key ] ) && isset( $block->context[ $context_key ] ) ) {
				$attributes[ $attr_key ] = $block->context[ $context_key ];
			}

			// Normalize boolean-like values for both context-inherited and direct attributes.
			if ( isset( $attributes[ $attr_key ] ) ) {
				$val = $attributes[ $attr_key ];
				if ( 'false' === $val || '0' === $val || '' === $val ) {
					$val = false;
				} elseif ( 'true' === $val || '1' === $val ) {
					$val = true;
				}
				$attributes[ $attr_key ] = $val;
			}
		}

		$inner_content = $content ?: $this->get_inner_blocks_content( $block );

		return Modular_Renderer::render_video_container( (array) $attributes, $inner_content, true );
	}

	/**
	 * Render callback for the Video Player Engine block.
	 *
	 * @param array     $atts    Block attributes.
	 * @param string    $content Block content.
	 * @param \WP_Block $block   The block instance.
	 * @return string Rendered HTML.
	 */
	public function render_video_player_engine_block( array $atts, string $content, $block ): string {
		$atts['is_modular_engine'] = true;

		// Map context to attributes for engine initialization.
		if ( empty( $atts['id'] ) && ! empty( $block->context['postId'] ) ) {
			$atts['id'] = $block->context['postId'];
		}

		$context_map = array(
			'videopack/src'                   => 'src',
			'videopack/skin'                  => 'skin',
			'videopack/autoplay'              => 'autoplay',
			'videopack/controls'              => 'controls',
			'videopack/loop'                  => 'loop',
			'videopack/muted'                 => 'muted',
			'videopack/playsinline'           => 'playsinline',
			'videopack/poster'                => 'poster',
			'videopack/preload'               => 'preload',
			'videopack/volume'                => 'volume',
			'videopack/auto_res'              => 'auto_res',
			'videopack/auto_codec'            => 'auto_codec',
			'videopack/sources'               => 'sources',
			'videopack/source_groups'         => 'source_groups',
			'videopack/text_tracks'           => 'tracks',
			'videopack/playback_rate'         => 'playback_rate',
			'videopack/default_ratio'         => 'default_ratio',
			'videopack/fixed_aspect'          => 'fixed_aspect',
			'videopack/fullwidth'             => 'fullwidth',
			'videopack/play_button_color'      => 'play_button_color',
			'videopack/play_button_icon_color' => 'play_button_icon_color',
			'videopack/control_bar_bg_color'   => 'control_bar_bg_color',
			'videopack/control_bar_color'      => 'control_bar_color',
			'videopack/title_color'            => 'title_color',
			'videopack/title_background_color' => 'title_background_color',
			'videopack/embed_method'           => 'embed_method',
		);

		foreach ( $context_map as $context_key => $attr_key ) {
			if ( ! isset( $atts[ $attr_key ] ) && isset( $block->context[ $context_key ] ) ) {
				$atts[ $attr_key ] = $block->context[ $context_key ];
			}
		}

		$shortcode_handler = new \Videopack\Frontend\Shortcode( $this->options );
		$prepared          = $shortcode_handler->prepare_player( $atts );

		if ( ! $prepared ) {
			return '';
		}

		return sprintf(
			'<div class="videopack-player-relative-wrapper">%s%s</div>',
			$prepared['player']->get_player_code( $prepared['final_atts'] ),
			$content
		);
	}

	/**
	 * Render callback for the Video Watermark block.
	 *
	 * @param array     $atts    Block attributes.
	 * @param string    $content Block content.
	 * @param \WP_Block $block   The block instance.
	 * @return string Rendered HTML.
	 */
	public function render_video_watermark_block( array $atts, string $content, $block ): string {
		$context_map = array(
			'videopack/watermark'         => 'watermark',
			'videopack/watermark_styles'  => 'watermark_styles',
			'videopack/watermark_link_to' => 'watermark_link_to',
			'videopack/watermark_url'     => 'watermark_url',
			'videopack/skin'              => 'skin',
		);

		foreach ( $context_map as $context_key => $attr_key ) {
			if ( ! isset( $atts[ $attr_key ] ) && isset( $block->context[ $context_key ] ) ) {
				$atts[ $attr_key ] = $block->context[ $context_key ];
			}
		}

		return Modular_Renderer::render_watermark( $atts );
	}

	/**
	 * Server-side rendering callback for the videopack/video-title block.
	 *
	 * @param array     $attributes The block attributes.
	 * @param string    $content    The block's inner content.
	 * @param \WP_Block $block      The block instance.
	 * @return string The rendered HTML.
	 */
	public function render_video_title_block( $attributes, $content, $block ) {
		$post_id = $attributes['postId'] ?? get_the_ID();
		$source  = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options );

		// Unique ID for the meta components (share container, etc.).
		$id = $attributes['id'] ?? ( $block->context['postId'] ?? '' );

		// Normalize boolean context attributes.
		$normalized_context = array();
		foreach ( array( 'downloadlink', 'embeddable', 'showBackground', 'overlay_title' ) as $key ) {
			if ( isset( $block->context[ "videopack/{$key}" ] ) ) {
				$val = $block->context[ "videopack/{$key}" ];
				if ( 'false' === $val || '0' === $val || '' === $val ) {
					$val = false;
				} elseif ( 'true' === $val || '1' === $val ) {
					$val = true;
				}
				$normalized_context[ $key ] = $val;
			}
		}

		// Merge context into attributes for the renderer.
		$merged_attributes = array_merge(
			array(
				'isOverlay'              => ( ! isset( $normalized_context['overlay_title'] ) || false !== $normalized_context['overlay_title'] ),
				'overlay_title'          => $normalized_context['overlay_title'] ?? true,
				'title_color'            => $block->context['videopack/title_color'] ?? '',
				'title_background_color' => $block->context['videopack/title_background_color'] ?? '',
				'skin'                   => $block->context['videopack/skin'] ?? '',
				'downloadlink'           => $normalized_context['downloadlink'] ?? false,
				'embeddable'             => $normalized_context['embeddable'] ?? false,
				'textAlign'              => ! empty( $block->context['videopack/textAlign'] ) ? $block->context['videopack/textAlign'] : 'left',
				'showBackground'         => $normalized_context['showBackground'] ?? true,
			),
			$attributes
		);

		// Prioritize context postId over attributes for the actual attachment if needed.
		if ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) {
			if ( ! empty( $block->context['postId'] ) ) {
				$post_id = $block->context['postId'];
				$source  = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options );
			}
		}

		// If embeddable is on, ensure we have an embedlink.
		if ( ! empty( $merged_attributes['embeddable'] ) && empty( $merged_attributes['embedlink'] ) ) {
			if ( is_numeric( $post_id ) && (int) $post_id > 0 ) {
				$merged_attributes['embedlink'] = (string) add_query_arg( 'videopack[enable]', 'true', (string) get_attachment_link( (int) $post_id ) );
			}
		}

		return \Videopack\Frontend\Modular_Renderer::render_video_title( (array) $merged_attributes, $source, $id );
	}

	/**
	 * Server-side rendering callback for the videopack/view-count block.
	 *
	 * @param array     $attributes The block attributes.
	 * @param string    $content    The block's inner content.
	 * @param \WP_Block $block      The block instance.
	 * @return string The rendered HTML.
	 */
	public function render_view_count_block( $attributes, $content, $block ) {
		$source  = null;
		$post_id = $block->context['postId'] ?? get_the_ID();

		if ( $post_id ) {
			$source = \Videopack\Video_Source\Source_Factory::create( $post_id, $this->options );
		}

		// Merge context into attributes for the renderer.
		$merged_attributes = array_merge(
			array(
				'title_color'            => $block->context['videopack/title_color'] ?? '',
				'title_background_color' => $block->context['videopack/title_background_color'] ?? '',
				'skin'                   => $block->context['videopack/skin'] ?? '',
				'textAlign'              => ! empty( $block->context['videopack/textAlign'] ) ? $block->context['videopack/textAlign'] : 'right', // Default to right for view count
			),
			$attributes
		);

		return \Videopack\Frontend\Modular_Renderer::render_view_count( $source, $merged_attributes );
	}

	/**
	 * Gets the inner blocks content for a block.
	 *
	 * @param \WP_Block $block The block instance.
	 * @return string The inner blocks content.
	 */
	protected function get_inner_blocks_content( $block ) {
		$content = '';
		foreach ( $block->inner_blocks as $inner_block ) {
			$content .= $inner_block->render();
		}
		return $content;
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
				'postId'                 => (int) ( is_admin() ? ( $_GET['post'] ?? get_queried_object_id() ?: get_the_ID() ) : get_the_ID() ),
				'themeColors'            => $theme_colors,
				'globalStyles'           => function_exists( 'wp_get_global_stylesheet' ) ? wp_get_global_stylesheet() : '',
				'mejs_controls_svg'      => (string) includes_url( 'js/mediaelement/mejs-controls.svg' ),
				'options'                => $options,
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
					'autoplay'                    => (bool) ( $options['autoplay'] ?? false ),
					'loop'                        => (bool) ( $options['loop'] ?? false ),
					'muted'                       => (bool) ( $options['muted'] ?? false ),
					'controls'                    => (bool) ( $options['controls'] ?? true ),
					'preload'                     => (string) ( $options['preload'] ?? 'metadata' ),
					'playback_rate'               => (bool) ( $options['playback_rate'] ?? false ),
					'playsinline'                 => (bool) ( $options['playsinline'] ?? true ),
					'downloadlink'                => (bool) ( $options['downloadlink'] ?? false ),
					'overlay_title'               => (bool) ( $options['overlay_title'] ?? false ),
					'nativecontrolsfortouch'      => (bool) ( $options['nativecontrolsfortouch'] ?? false ),
					'pauseothervideos'            => (bool) ( $options['pauseothervideos'] ?? true ),
					'right_click'                 => (bool) ( $options['right_click'] ?? false ),
					'auto_res'                    => (string) ( $options['auto_res'] ?? 'automatic' ),
					'auto_codec'                  => (string) ( $options['auto_codec'] ?? 'h264' ),
					'skin'                        => (string) ( $options['skin'] ?? 'vjs-theme-videopack' ),
				),
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
