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
				'hook'     => 'wp_footer',
				'callback' => 'print_late_enqueued_player_styles',
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
				'hook'     => 'enqueue_block_editor_assets',
				'callback' => 'localize_block_editor_config',
			),
		);
	}

	/**
	 * Returns an array of filters to register.
	 *
	 * @return array
	 */
	public function get_filters(): array {
		return array(
			array(
				'hook'     => 'videopack_page_needs_video_assets',
				'callback' => 'filter_page_needs_video_assets',
			),
		);
	}

	/**
	 * Exposes page_needs_video_assets() as a filter so add-ons (e.g. player-pro)
	 * can gate their own frontend asset enqueuing on the same page-content scan
	 * instead of loading unconditionally.
	 *
	 * @param bool $needs_assets Value passed in by the caller (or an earlier filter).
	 * @return bool
	 */
	public function filter_page_needs_video_assets( $needs_assets ): bool {
		return (bool) $needs_assets || $this->page_needs_video_assets();
	}

	/**
	 * Registers all consolidated JavaScript and CSS assets.
	 */
	public function register_assets() {
		$build_dir = (string) VIDEOPACK_PLUGIN_DIR . 'admin-ui/build/';
		$build_url = (string) plugins_url( 'admin-ui/build/', VIDEOPACK_PLUGIN_FILE );

		$assets = array(
			'videopack-core'             => 'videopack-core',
			'videopack-settings'         => 'settings',
			'videopack-settings-network' => 'settings-network',
			'videopack-encode-queue'     => 'encode-queue',
			'videopack-media-library'    => 'media-library',
			'videopack-classic-editor'   => 'classic-editor',
		);

		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, new Formats\Registry( $this->options ) );
		$player->register_scripts();

		foreach ( $assets as $handle => $filename ) {
			$asset_file = (string) $build_dir . (string) $filename . '.asset.php';
			if ( file_exists( $asset_file ) ) {
				$asset = (array) require $asset_file;

				$player_script_deps = array();
				$player_style_deps  = array();

				$player_script_deps = array_diff( (array) $player->get_player_script_handles(), array( (string) $handle ) );
				$player_style_deps  = array_diff( (array) $player->get_player_style_handles(), array( (string) $handle ) );

				if ( 'videopack-core' !== $handle ) {
					// wp-blocks is required explicitly (not just left to each
					// bundle's own auto-detected dependencies) because
					// bootstrap_block_editor_definitions() attaches an inline
					// script to these handles that calls wp.blocks directly —
					// it needs to be loaded regardless of whether the bundle's
					// own JS happens to import anything from @wordpress/blocks.
					wp_register_script(
						(string) $handle,
						(string) $build_url . (string) $filename . '.js',
						array_unique( array_merge( array( 'videopack-core', 'wp-blocks' ), (array) $asset['dependencies'], $handle === 'videopack-media-library' ? array( 'media-views', 'media-models', 'media-editor' ) : array(), $player_script_deps ) ),
						(string) $asset['version'],
						true
					);
					wp_set_script_translations( (string) $handle, 'video-embed-thumbnail-generator' );
				}

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

	}

	/**
	 * Localizes the global videopack_config object.
	 */
	private function localize_videopack_config() {
		static $localized = false;
		if ( $localized ) {
			return;
		}
		$localized = true;

		if ( is_admin() ) {
			$ui          = new Ui( $this->options, new Formats\Registry( $this->options ) );
			$config_data = (array) $ui->get_videopack_config_data();
			wp_localize_script( 'videopack-core', 'videopack_config', $config_data );
		} else {
			$frontend_config = array(
				'rest_url' => (string) get_rest_url(),
				'nonce'    => wp_create_nonce( 'wp_rest' ),
			);
			wp_localize_script( 'videopack-core', 'videopack_config', $frontend_config );
		}
	}

	/**
	 * Localizes the global videopack_config object specifically for the block editor.
	 */
	public function localize_block_editor_config() {
		$ui          = new Ui( $this->options, new Formats\Registry( $this->options ) );
		$config_data = (array) $ui->get_videopack_config_data();

		// Localize to wp-blocks as it's a safe base handle for all blocks.
		wp_localize_script( 'wp-blocks', 'videopack_config', $config_data );

		// Enqueue Video.js and all available skins to support live switching in the editor.
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( 'Video.js', $this->options, new Formats\Registry( $this->options ) );
		$player->register_scripts();
		$player->enqueue_player_scripts();
		$player->enqueue_styles();

		if ( method_exists( $player, 'enqueue_all_skins' ) ) {
			$player->enqueue_all_skins();

			// Inject into Gutenberg iframe in the correct order:
			// base video-js styles MUST come before any skin stylesheets,
			// otherwise skins get overridden by the base styles and produce
			// doubled icons or incorrect rendering.
			global $wp_styles;
			if ( isset( $wp_styles->registered['video-js'] ) ) {
				add_editor_style( $wp_styles->registered['video-js']->src );
			}
		}
	}

	public function register_player_scripts() {
		$player = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, new Formats\Registry( $this->options ) );
		// Handles the alwaysloadscripts case internally (enqueues scripts + styles).
		$player->register_scripts();

		// Independently, if this page's content actually contains a Videopack
		// block or shortcode, enqueue now so styles land in <head> without FOUC.
		// Harmless/idempotent if alwaysloadscripts already triggered this above.
		if ( $this->page_needs_video_assets() ) {
			$player->enqueue_scripts();
		}

		$this->localize_videopack_config();
	}

	/**
	 * Determines whether the current frontend request needs Videopack's player
	 * assets, by scanning the raw content of the post(s) about to be displayed
	 * (available before wp_head fires) for a Videopack block or shortcode,
	 * without waiting for that content to actually render.
	 *
	 * This only catches content stored directly in a post's post_content. Videos
	 * injected via widgets, template parts, page builders, or another plugin's
	 * do_shortcode() call are not detected here; those rely on the
	 * alwaysloadscripts setting, or are still caught late (with a brief flash of
	 * unstyled content) by print_late_enqueued_player_styles() at wp_footer.
	 *
	 * @return bool
	 */
	protected function page_needs_video_assets(): bool {
		static $needs_assets = null;

		if ( null !== $needs_assets ) {
			return $needs_assets;
		}

		$needs_assets = false;

		if ( is_embed() ) {
			$needs_assets = true;
			return $needs_assets;
		}

		if ( is_attachment() ) {
			$attachment = get_queried_object();
			if ( $attachment instanceof \WP_Post && wp_attachment_is( 'video', $attachment ) ) {
				$needs_assets = true;
				return $needs_assets;
			}
		}

		$shortcode_tags = array( 'videopack', 'VIDEOPACK', 'FMP', 'KGVID' );
		if ( ! empty( $this->options['replace_video_shortcode'] ) ) {
			$shortcode_tags[] = 'video';
		}

		global $wp_query;
		$posts = ( $wp_query instanceof \WP_Query ) ? (array) $wp_query->posts : array();

		foreach ( $posts as $post ) {
			if ( ! ( $post instanceof \WP_Post ) || empty( $post->post_content ) ) {
				continue;
			}

			if ( false !== strpos( $post->post_content, '<!-- wp:videopack/' ) ) {
				$needs_assets = true;
				break;
			}

			foreach ( $shortcode_tags as $tag ) {
				if ( has_shortcode( $post->post_content, $tag ) ) {
					$needs_assets = true;
					break 2;
				}
			}
		}

		return $needs_assets;
	}

	/**
	 * Safety net for content the early page-content scan couldn't detect
	 * (widgets, template parts, page builders). If a player actually rendered
	 * (via Player::get_player_code()) and enqueued its styles too late for
	 * wp_head to print them, print them now.
	 *
	 * wp_print_styles() does not itself check whether a handle was enqueued
	 * when given an explicit handle list — it will print any registered
	 * handle you pass it. So we must filter down to handles that are actually
	 * enqueued-but-not-yet-printed ourselves, or this would force these styles
	 * to load on every page regardless of content.
	 */
	public function print_late_enqueued_player_styles() {
		$player  = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, new Formats\Registry( $this->options ) );
		$handles = array_merge( array( 'videopack-core' ), (array) $player->get_player_style_handles() );

		$pending = array_filter(
			$handles,
			function ( $handle ) {
				return wp_style_is( $handle, 'enqueued' ) && ! wp_style_is( $handle, 'done' );
			}
		);

		if ( $pending ) {
			wp_print_styles( $pending );
		}
	}

	/**
	 * Makes real Gutenberg block previews (via useBlockPreview/createBlock)
	 * work correctly on admin pages that don't load the real post editor.
	 *
	 * WordPress core only runs wp.blocks.unstable__bootstrapServerSideBlockDefinitions()
	 * from four places: the post editor (edit-form-blocks.php), the Site
	 * Editor, the Widgets screen, and the Customizer's widgets panel. None of
	 * Classic Editor, the Settings page, or the Media Library Attachment
	 * Details screen are among them, so most Videopack blocks' registerBlockType()
	 * calls (which only pass {icon, edit, save} locally, relying on this
	 * bootstrap for attributes/context/supports) would otherwise register
	 * with an empty schema on those pages. This injects the same bootstrap
	 * core already uses elsewhere, sourced from the same server-side block
	 * registry (Ui::block_init() registers every Videopack block
	 * unconditionally on every page load, so this is safe to call anywhere).
	 *
	 * More than one of this method's call sites can legitimately fire on the
	 * same page load (e.g. the Settings page also calls wp_enqueue_media()
	 * for its own image pickers, triggering enqueue_media_library_assets()
	 * too) — a static guard keeps this large inline script from being
	 * printed more than once per request regardless of which handle it
	 * ends up attached to; it only needs to run once per page either way.
	 *
	 * @param string $script_handle The script handle to attach the inline bootstrap to (must already be enqueued).
	 */
	private function bootstrap_block_editor_definitions( string $script_handle ) {
		static $bootstrapped = false;
		if ( $bootstrapped ) {
			return;
		}

		if ( ! function_exists( 'get_block_editor_server_block_settings' ) ) {
			return;
		}
		$bootstrapped = true;

		// get_block_editor_server_block_settings() returns every registered
		// block type — 100+ core blocks plus anything else active, not just
		// Videopack's own — since none of these three pages need to preview
		// anything but Videopack blocks, narrow it down before encoding.
		$block_settings = array_filter(
			(array) get_block_editor_server_block_settings(),
			static function ( $block_name ) {
				return 0 === strpos( (string) $block_name, 'videopack/' );
			},
			ARRAY_FILTER_USE_KEY
		);

		// Must run BEFORE $script_handle's own file, not after (the default
		// position): @wordpress/blocks' addUnprocessedBlockType() thunk calls
		// processBlockType() synchronously, exactly once, the moment
		// registerBlockType() is called — it requires a non-empty `title`,
		// which for most of our blocks (all except player-container, the one
		// block whose index.js spreads the full block.json ...metadata
		// locally) only exists in this bootstrapped server data, not in the
		// local {icon, edit, save} settings. If the bootstrap hasn't run yet,
		// processBlockType() warns (silently, since @wordpress/warning is a
		// no-op in production builds) and returns undefined — and there is no
		// later retry once bootstrapped data does arrive, so the block never
		// gets registered at all.
		wp_add_inline_script(
			$script_handle,
			'wp.blocks.unstable__bootstrapServerSideBlockDefinitions(' . wp_json_encode( $block_settings, JSON_HEX_TAG | JSON_UNESCAPED_SLASHES ) . ');',
			'before'
		);
	}

	/**
	 * Enqueues assets for various admin screens.
	 *
	 * @param string $hook_suffix The current admin page hook.
	 */
	public function enqueue_admin_assets( $hook_suffix ) {
		$is_settings_page     = 'settings_page_video_embed_thumbnail_generator_settings' === (string) $hook_suffix;
		$is_encode_queue_page = in_array( (string) $hook_suffix, array( 'tools_page_videopack_encode_queue', 'settings_page_videopack_network_encoding_queue' ), true );

		// Settings page — needs the full block-preview machinery (live
		// Player/Gallery previews), so it's the only one of these that gets
		// the block-definition bootstrap and player assets.
		if ( $is_settings_page ) {
			wp_enqueue_script( 'videopack-settings' );
			wp_enqueue_style( 'videopack-settings' );
			wp_enqueue_style( 'videopack-core' );
			$this->bootstrap_block_editor_definitions( 'videopack-settings' );
			$this->enqueue_player_assets();
		}

		// Encode Queue pages (site + network) — just a data table, no block
		// previews or a live player, so this is a much lighter bundle.
		if ( $is_encode_queue_page ) {
			wp_enqueue_script( 'videopack-encode-queue' );
			wp_enqueue_style( 'videopack-encode-queue' );
			wp_enqueue_style( 'videopack-core' );
		}

		if ( $is_settings_page || $is_encode_queue_page ) {
			// Enqueue Freemius admin page styles if Freemius is enabled.
			if ( function_exists( 'videopack_fs' ) && function_exists( 'fs_enqueue_local_style' ) ) {
				fs_enqueue_local_style( 'fs_common', '/admin/common.css' );
				fs_enqueue_local_style( 'fs_dialog_boxes', '/admin/dialog-boxes.css' );
				fs_enqueue_local_style( 'fs_account', '/admin/account.css' );
				fs_enqueue_local_style( 'fs_addons', '/admin/add-ons.css' );
				fs_enqueue_local_style( 'fs_connect', '/admin/connect.css' );
			}
		}

		// Classic Editor TinyMCE Plugin (Main Host Page).
		if ( in_array( (string) $hook_suffix, array( 'post.php', 'post-new.php' ), true ) && ! ( function_exists( 'use_block_editor_for_post' ) && use_block_editor_for_post( get_post() ) ) ) {
			wp_enqueue_script( 'videopack-classic-editor' );
			wp_enqueue_style( 'videopack-classic-editor' );
			$this->bootstrap_block_editor_definitions( 'videopack-classic-editor' );

			// Add editor styles for TinyMCE previews.
			add_editor_style( (string) includes_url( 'css/media-views.css' ) );
			add_editor_style( (string) includes_url( 'js/mediaelement/mediaelementplayer-legacy.min.css' ) );
			add_editor_style( (string) includes_url( 'js/mediaelement/wp-mediaelement.css' ) );

			$player        = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, new Formats\Registry( $this->options ) );
			$style_handles = array_merge( array( 'videopack-core', 'videopack-classic-editor' ), $player->get_player_style_handles() );

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
		$this->localize_videopack_config();
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

	public function enqueue_media_library_assets() {
		wp_enqueue_script( 'videopack-media-library' );
		wp_enqueue_style( 'videopack-media-library' );
		$this->bootstrap_block_editor_definitions( 'videopack-media-library' );
		$this->enqueue_player_assets();
		$this->localize_videopack_config();
	}

	/**
	 * Enqueues base plugin scripts and styles.
	 */
	public function enqueue_videopack_scripts() {
		wp_enqueue_script( 'videopack-core' );
		wp_enqueue_style( 'videopack-core' );
	}

	/**
	 * Enqueues assets for the classic editor (tabs and TinyMCE).
	 */
	public function enqueue_classic_editor_assets() {
		wp_enqueue_script( 'videopack-classic-editor' );
		wp_enqueue_style( 'videopack-classic-editor' );
		$this->bootstrap_block_editor_definitions( 'videopack-classic-editor' );

		// Add editor styles for TinyMCE previews.
		add_editor_style( (string) includes_url( 'css/media-views.css' ) );
		add_editor_style( (string) includes_url( 'js/mediaelement/mediaelementplayer-legacy.min.css' ) );
		add_editor_style( (string) includes_url( 'js/mediaelement/wp-mediaelement.css' ) );

		$player        = \Videopack\Frontend\Video_Players\Player_Factory::create( (string) ( $this->options['embed_method'] ?? 'Video.js' ), $this->options, new Formats\Registry( $this->options ) );
		$style_handles = array_merge( array( 'videopack-core', 'videopack-classic-editor' ), $player->get_player_style_handles() );

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
	 * Enqueues assets for the network (multisite) Settings page. No block
	 * previews or a live player here — settings-network.js is plain form
	 * controls only.
	 */
	public function enqueue_settings_network_assets() {
		wp_enqueue_script( 'videopack-settings-network' );
		wp_enqueue_style( 'videopack-settings-network' );
	}

	/**
	 * Enqueues assets for the network (multisite) Encode Queue page. Same
	 * bundle as the single-site Encode Queue page — just a data table, no
	 * block previews or a live player.
	 */
	public function enqueue_network_encode_queue_assets() {
		wp_enqueue_script( 'videopack-encode-queue' );
		wp_enqueue_style( 'videopack-encode-queue' );
	}
}
