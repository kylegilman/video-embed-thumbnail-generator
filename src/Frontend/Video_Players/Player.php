<?php
/**
 * Video player base class.
 *
 * @package Videopack
 */

namespace Videopack\Frontend\Video_Players;

/**
 * Class Player
 *
 * Base class for all video player implementations in Videopack.
 * Handles common functionality like script registration, attribute processing, and HTML generation.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend/Video_Players
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Player {


	/**
	 * Videopack Options manager instance.
	 *
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

	/**
	 * Videopack options array.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Video player attributes.
	 *
	 * @var array $atts
	 */
	protected $atts;

	/**
	 * Unique ID for this player instance.
	 *
	 * @var int $player_id
	 */
	protected $player_id;

	/**
	 * Full source object, including child sources.
	 *
	 * @var \Videopack\Video_Source\Source $source
	 */
	protected $source;

	/**
	 * Array of sources for the video player.
	 *
	 * @var array $sources
	 */
	protected $sources;

	/**
	 * Whether the frontend script has been localized.
	 *
	 * @var bool $script_localized
	 */
	private static $script_localized = false;

	/**
	 * Constructor.
	 *
	 * @param \Videopack\Admin\Options $options_manager Videopack Options manager instance.
	 */
	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->player_id       = $options_manager->increment_video_player_id();
		$this->register_hooks();
	}

	/**
	 * Registers WordPress hooks.
	 */
	public function register_hooks() {
		add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );
	}

	/**
	 * Registers frontend scripts and localizes data.
	 */
	public function register_scripts() {

		wp_register_script(
			'videopack-frontend',
			plugins_url( '/src/Frontend/js/videopack.js', VIDEOPACK_PLUGIN_FILE ),
			$this->get_videopack_script_dependencies(),
			VIDEOPACK_VERSION,
			true
		);

		if ( ! self::$script_localized ) {
			wp_localize_script(
				'videopack-frontend',
				'videopack_l10n',
				array(
					'rest_url'   => rest_url(),
					'ajaxurl'    => admin_url( 'admin-ajax.php', is_ssl() ? 'admin' : 'http' ),
					'ajax_nonce' => wp_create_nonce( 'videopack_frontend_nonce' ),
					'playstart'  => esc_html_x( 'Play Start', 'noun for Google Analytics event', 'video-embed-thumbnail-generator' ),
					'pause'      => esc_html_x( 'Pause', 'noun for Google Analytics event', 'video-embed-thumbnail-generator' ),
					'resume'     => esc_html_x( 'Resume', 'noun for Google Analytics event', 'video-embed-thumbnail-generator' ),
					'seek'       => esc_html_x( 'Seek', 'noun for Google Analytics event', 'video-embed-thumbnail-generator' ),
					'end'        => esc_html_x( 'Complete View', 'noun for Google Analytics event', 'video-embed-thumbnail-generator' ),
					'next'       => esc_html_x( 'Next', 'button text to play next video', 'video-embed-thumbnail-generator' ),
					'previous'   => esc_html_x( 'Previous', 'button text to play previous video', 'video-embed-thumbnail-generator' ),
				)
			);
			self::$script_localized = true;
		}

		if ( $this->options['alwaysloadscripts'] == true ) {
			$this->enqueue_scripts();
		}
	}

	/**
	 * Filters block metadata for the video player.
	 *
	 * @param array $metadata The block metadata.
	 * @return array The filtered metadata.
	 */
	public function filter_block_metadata( $metadata ) {
		return $metadata;
	}

	/**
	 * Enqueues frontend styles.
	 */
	public function enqueue_styles() {
		if ( ! has_block( 'videopack/videopack-video' ) ) {
			wp_enqueue_style( 'videopack_styles', plugins_url( '/admin-ui/build/frontend-styles.css', VIDEOPACK_PLUGIN_FILE ), array(), VIDEOPACK_VERSION );
		}
	}

	/**
	 * Returns script dependencies for the frontend script.
	 *
	 * @return array Array of script handles.
	 */
	public function get_videopack_script_dependencies(): array {
		return array( 'jquery' );
	}

	/**
	 * Enqueues frontend scripts.
	 */
	public function enqueue_scripts(): void {
		$this->enqueue_player_scripts();
		wp_enqueue_script( 'videopack-frontend' );
	}

	/**
	 * Enqueues player-specific scripts.
	 *
	 * This method is intended to be overridden by child classes.
	 */
	public function enqueue_player_scripts(): void {
		// This method is intended to be overridden by child classes.
	}

	/**
	 * Returns the main video source object.
	 *
	 * @return \Videopack\Video_Source\Source|null The source object or null.
	 */
	public function get_source(): ?\Videopack\Video_Source\Source {
		if ( $this->source instanceof \Videopack\Video_Source\Source ) {
			return $this->source;
		}
		return null;
	}

	/**
	 * Sets the main video source object.
	 *
	 * @param \Videopack\Video_Source\Source $source The source object.
	 */
	public function set_source( \Videopack\Video_Source\Source $source ) {
		$this->source = $source;
	}

	/**
	 * Initializes the video source object from attributes.
	 *
	 * It uses the Source_Factory to create the correct type of Source object.
	 */
	protected function init_source_from_atts(): void {
		$source_identifier = $this->atts['src'] ?? $this->atts['id'] ?? null;

		if ( ! $source_identifier ) {
			return;
		}

		$source_object = \Videopack\Video_Source\Source_Factory::create(
			$source_identifier,
			$this->options_manager
		);

		if ( $source_object ) {
			$this->set_source( $source_object );
		}
	}

	/**
	 * Sets the video player attributes.
	 *
	 * @param array $atts The attributes array.
	 */
	public function set_atts( array $atts ): void {
		$this->atts = $atts;
	}

	/**
	 * Returns the player ID.
	 *
	 * @return int The player ID.
	 */
	public function get_id(): int {
		return $this->player_id;
	}

	/**
	 * Returns the processed sources for the player.
	 *
	 * @return array|null The sources array or null.
	 */
	public function get_sources(): ?array {
		if ( ! $this->sources && $this->get_source() ) {
			$this->set_sources();
		}
		return $this->sources;
	}

	/**
	 * Processes and groups video sources.
	 */
	protected function set_sources(): void {
		$grouped_sources = array();
		$auto_codec      = $this->atts['auto_codec'] ?? 'h264';
		$auto_res        = $this->atts['auto_res'] ?? 'automatic';

		// Process the main source.
		$main_source = $this->get_source();

		if ( $main_source && $main_source->exists() && $main_source->is_compatible() ) {
			$codec     = $main_source->get_codec();
			$mime_type = $main_source->get_mime_type();
			if ( $codec ) {
				$codec_id = $codec->get_id();
				if ( ! isset( $grouped_sources[ $codec_id ] ) ) {
					$grouped_sources[ $codec_id ] = array(
						'label'   => $codec->get_label(),
						'sources' => array(),
					);
				}
				$source_data                               = $main_source->get_video_player_source();
				$grouped_sources[ $codec_id ]['sources'][] = $source_data;
			}
		}

		// Process child sources.
		$child_sources = $main_source ? $main_source->get_child_sources() : array();
		foreach ( $child_sources as $child_source ) {
			if ( $child_source && $child_source->exists() && $child_source->is_compatible() ) {
				$codec = $child_source->get_codec();
				if ( $codec ) {
					$codec_id = $codec->get_id();
					if ( ! isset( $grouped_sources[ $codec_id ] ) ) {
						$grouped_sources[ $codec_id ] = array(
							'label'   => $codec->get_label(),
							'sources' => array(),
						);
					}
					$grouped_sources[ $codec_id ]['sources'][] = $child_source->get_video_player_source();
				}
			}
		}

		if ( ! isset( $grouped_sources[ $auto_codec ] ) && ! empty( $grouped_sources ) ) {
			if ( count( $grouped_sources ) === 1 ) {
				reset( $grouped_sources );
				$auto_codec = key( $grouped_sources );
			} elseif ( isset( $grouped_sources['h264'] ) ) {
				$auto_codec = 'h264';
			} else {
				reset( $grouped_sources );
				$auto_codec = key( $grouped_sources );
			}
		}

		// Sort groups so the auto_codec comes first.
		if ( isset( $grouped_sources[ $auto_codec ] ) ) {
			$preferred_group = $grouped_sources[ $auto_codec ];
			unset( $grouped_sources[ $auto_codec ] );
			$grouped_sources = array_merge( array( $auto_codec => $preferred_group ), $grouped_sources );
		}

		// Mark default resolution and sort sources within groups.
		foreach ( $grouped_sources as $codec_id => &$group ) {
			$sources = $group['sources'];

			// Sort sources by resolution (descending).
			usort(
				$sources,
				function ( $a, $b ) {
					$res_a = isset( $a['resolution'] ) ? (int) $a['resolution'] : 0;
					$res_b = isset( $b['resolution'] ) ? (int) $b['resolution'] : 0;
					return $res_b - $res_a;
				}
			);

			// Mark default resolution.
			foreach ( $sources as &$source ) {
				$is_default = false;
				if ( $codec_id === $auto_codec ) {
					if ( 'highest' === $auto_res && $source === $sources[0] ) {
						$is_default = true;
					} elseif ( 'lowest' === $auto_res && $source === $sources[ count( $sources ) - 1 ] ) {
						$is_default = true;
					} elseif ( isset( $source['resolution'] ) && (string) $source['resolution'] === (string) $auto_res ) {
						$is_default = true;
					}
				}

				if ( $is_default ) {
					$source['default_res'] = '1';
				}
			}

			$group['sources'] = $sources;
		}

		$this->sources = $grouped_sources;
	}

	/**
	 * Returns a flat array of all sources.
	 *
	 * @return array Flat sources array.
	 */
	public function get_flat_sources(): array {
		$flat_sources  = array();
		$codec_sources = $this->get_sources();

		if ( is_array( $codec_sources ) ) {
			foreach ( $codec_sources as $codec_data ) {
				if ( isset( $codec_data['sources'] ) && is_array( $codec_data['sources'] ) ) {
					$flat_sources = array_merge( $flat_sources, $codec_data['sources'] );
				}
			}
		}
		return $flat_sources;
	}

	/**
	 * Returns the URL of the first source.
	 *
	 * @return string The main source URL.
	 */
	public function get_main_source_url(): string {
		if ( ! $this->sources && $this->get_source() ) {
			$this->set_sources();
		}
		$flat_sources = $this->get_flat_sources();
		if ( isset( $flat_sources[0]['src'] ) ) {
			return $flat_sources[0]['src'];
		}
		return '';
	}

	/**
	 * Returns the poster image URL.
	 *
	 * @return string The poster URL.
	 */
	public function get_poster(): string {
		return (string) ( $this->atts['poster'] ?? '' );
	}

	/**
	 * Prepares data for the JavaScript player.
	 *
	 * @return array The video data array.
	 */
	public function prepare_video_vars(): array {

		$video_variables = array(
			'id'                => 'videopack_player_' . $this->get_id(),
			'attachment_id'     => $this->get_source() ? $this->get_source()->get_id() : 0,
			'embed_method'      => $this->options['embed_method'],
			'width'             => $this->atts['width'],
			'height'            => $this->atts['height'],
			'fullwidth'         => $this->atts['fullwidth'],
			'countable'         => $this->atts['countable'],
			'count_views'       => $this->atts['count_views'],
			'start'             => $this->atts['start'],
			'autoplay'          => $this->atts['autoplay'],
			'pauseothervideos'  => $this->atts['pauseothervideos'],
			'set_volume'        => $this->atts['volume'],
			'muted'             => $this->atts['muted'],
			'endofvideooverlay' => $this->atts['endofvideooverlay'],
			'auto_res'          => $this->atts['auto_res'],
			'auto_codec'        => $this->atts['auto_codec'],
			'pixel_ratio'       => $this->atts['pixel_ratio'],
			'right_click'       => $this->atts['right_click'],
			'playback_rate'     => $this->atts['playback_rate'],
			'title'             => $this->atts['stats_title'],
			'source_groups'     => $this->get_sources(),
			'fixed_aspect'      => $this->atts['fixed_aspect'],
			'default_ratio'     => $this->get_fixed_aspect_ratio(),
			'tracks'            => $this->atts['tracks'] ?? array(),
			'legacy_dimensions' => $this->atts['legacy_dimensions'],
			'resize'            => $this->atts['resize'],
		);

		return apply_filters( 'videopack_video_player_data', $video_variables, $this->atts );
	}

	/**
	 * Generates the full HTML code for the video player.
	 *
	 * @param array $atts The player attributes.
	 * @return string The player HTML.
	 */
	public function get_player_code( $atts ): string {

		$this->set_atts( $atts );
		$this->init_source_from_atts();

		if ( ! $this->get_source() ) {
			// Return an empty string or an error message if no valid source was found.
			// This prevents fatal errors if methods are called on a null source object.
			return '';
		}

		$video_vars = $this->prepare_video_vars();
		$script     = sprintf(
			'window.videopack = window.videopack || {}; window.videopack.player_data = window.videopack.player_data || {}; window.videopack.player_data["videopack_player_%1$s"] = %2$s;',
			$this->get_id(),
			wp_json_encode( $video_vars )
		);

		// The 'videopack' script is already registered, so we can add our instance-specific data to it.
		wp_add_inline_script( 'videopack-frontend', $script );

		$player_code = $this->get_wrapper_start_html();

		if ( $this->has_meta_bar() ) {
			$player_code .= $this->get_meta_bar_code();
		}
		$player_code .= $this->get_video_code();
		$player_code .= $this->get_watermark_code();
		if ( $this->has_below_video() ) {
			$player_code .= $this->get_below_video_code();
		}
		$player_code .= $this->get_wrapper_end_html();

		return apply_filters( 'videopack_video_player_code', $player_code, $this->atts );
	}

	/**
	 * Checks if the player should display the meta bar.
	 *
	 * @return bool True if meta bar should be visible, false otherwise.
	 */
	protected function has_meta_bar(): bool {
		return apply_filters(
			'videopack_video_player_has_meta_bar',
			(bool) ( $this->atts['overlay_title'] ?? false )
			|| ( ( $this->atts['embeddable'] ?? false ) && ( $this->atts['embedcode'] ?? false ) !== false )
			|| ( $this->atts['downloadlink'] ?? false ) === true,
			$this->atts
		);
	}

	/**
	 * Checks if the player has embed metadata.
	 *
	 * @return bool True if embed metadata is available, false otherwise.
	 */
	protected function has_embed_meta(): bool {
		return apply_filters(
			'videopack_video_player_has_embed_meta',
			(bool) ( $this->atts['embeddable'] ?? false )
			&& ( $this->atts['embedcode'] ?? false ) !== false,
			$this->atts
		);
	}

	/**
	 * Generates the HTML code for the meta bar.
	 *
	 * @return string The meta bar HTML.
	 */
	protected function get_meta_bar_code(): string {

		$has_embed      = $this->has_embed_meta();
		$no_title_class = ( $this->atts['overlay_title'] ?? false ) ? '' : ' no-title';

		$meta_bar  = '<div class="videopack-meta-bar' . esc_attr( $no_title_class ) . '">';
		$meta_bar .= '<span class="videopack-meta-icons">';

		if ( $has_embed ) {
			$meta_bar .= '<button type="button" class="videopack-icons share"></button>';
		}

		if ( $this->atts['downloadlink'] ) {
			$download_attributes = 'class="videopack-download-link" href="' . esc_attr( $this->source->get_download_url() ) . '" download title="' . esc_attr__( 'Click to download', 'video-embed-thumbnail-generator' ) . '"';

			if ( ! empty( $this->options['click_download'] ) && $this->source instanceof \Videopack\Video_Source\Source_Attachment_Local && $this->source->exists() ) {
				$alt_link             = site_url( '/?attachment_id=' . $this->source->get_id() . '&videopack[download]=true' );
				$download_attributes .= ' data-alt_link="' . esc_attr( $alt_link ) . '"';
			}

			$meta_bar .= '<a ' . $download_attributes . '><span class="videopack-icons download"></span></a>';
		}
		$meta_bar .= '</span>';

		if ( $this->atts['overlay_title'] ) {
			$meta_bar .= '<span class="videopack-title">' . esc_html( (string) $this->atts['title'] ) . '</span>';
		}
		$meta_bar .= '</div>';

		if ( $has_embed ) {
			$meta_bar .= '<button class="videopack-click-trap"></button>';
			$meta_bar .= '<div class="videopack-share-container' . esc_attr( $no_title_class ) . '">';

			$embed_id = $this->source->get_id();
			if ( is_numeric( $embed_id ) ) {
				$embed_url = add_query_arg( 'videopack[enable]', 'true', get_attachment_link( $embed_id ) );
			} else {
				$embed_url = $this->source->get_url();
			}

			$iframe_title = sprintf(
				/* translators: %s is the video title */
				__( 'Video Player - %s', 'video-embed-thumbnail-generator' ),
				( $this->atts['title'] ?? '' ) ? $this->atts['title'] : $this->source->get_title()
			);

			$embed_code = sprintf(
				'<iframe src="%1$s" width="%2$s" height="%3$s" style="border:0;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy" title="%4$s" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
				esc_url( $embed_url ),
				esc_attr( (string) $this->atts['width'] ),
				esc_attr( (string) $this->atts['height'] ),
				esc_attr( $iframe_title )
			);

			$meta_bar .= '<span class="videopack-embedcode-container"><span class="videopack-icons embed"></span><span>' . esc_html__( 'Embed:', 'video-embed-thumbnail-generator' ) . '</span><span><input class="videopack-embed-code" type="text" value="' . esc_attr( $embed_code ) . '" readonly /></span></span>';

			$start_at_id = 'videopack-start-at-enable-' . $this->get_id();
			$meta_bar   .= '<span class="videopack-start-at-container">' .
				'<input type="checkbox" class="videopack-start-at-enable" id="' . esc_attr( $start_at_id ) . '" />' .
				'<label for="' . esc_attr( $start_at_id ) . '">' . esc_html__( 'Start at:', 'video-embed-thumbnail-generator' ) . '</label>' .
				'<input type="text" class="videopack-start-at" value="00:00" />' .
				'</span>';

			$meta_bar .= '</div>';
		}

		return apply_filters( 'videopack_video_player_meta_bar', $meta_bar, $this->atts );
	}

	/**
	 * Generates the starting HTML for the player wrapper.
	 *
	 * @return string The starting wrapper HTML.
	 */
	protected function get_wrapper_start_html(): string {
		$alignclass = '';
		if ( $this->atts['inline'] ) {
			$alignclass .= ' videopack-wrapper-inline';
			if ( in_array( $this->atts['align'], array( 'left', 'right' ), true ) ) {
				$alignclass .= ' videopack-wrapper-inline-' . $this->atts['align'];
			} elseif ( 'center' === $this->atts['align'] ) {
				$alignclass .= ' videopack-wrapper-auto-left videopack-wrapper-auto-right';
			}
		} elseif ( 'center' === $this->atts['align'] ) {
				$alignclass .= ' videopack-wrapper-auto-left videopack-wrapper-auto-right';
		} elseif ( 'right' === $this->atts['align'] ) {
			$alignclass .= ' videopack-wrapper-auto-left';
		}

		$meta_bar_class = $this->has_meta_bar() ? ' videopack-meta-bar-visible' : '';
		$style_attrs    = array();

		if ( $this->is_fixed_aspect() ) {
			$alignclass   .= ' videopack-fixed-aspect';
			$style_attrs[] = 'aspect-ratio: ' . esc_attr( $this->get_fixed_aspect_ratio() );
		}

		if ( $this->atts['legacy_dimensions'] ) {
			if ( $this->atts['fullwidth'] ) {
				$style_attrs[] = 'width: 100%';
			} elseif ( $this->atts['width'] ) {
				$style_attrs[] = 'width: ' . esc_attr( (string) $this->atts['width'] ) . ( is_numeric( $this->atts['width'] ) ? 'px' : '' );
				$style_attrs[] = 'max-width: 100%';
			}
		}

		$style = '';
		if ( ! empty( $style_attrs ) ) {
			$style = ' style="' . implode( '; ', $style_attrs ) . ';"';
		}

		$html           = '<div id="videopack_player_' . $this->get_id() . '_wrapper" class="videopack-wrapper' . $alignclass . $meta_bar_class . '"' . $style . '>';
		$player_classes = apply_filters( 'videopack_player_div_classes', array( 'videopack-player' ), $this->atts );
		$html          .= '<div class="' . esc_attr( implode( ' ', $player_classes ) ) . '" data-id="' . esc_attr( $this->get_id() ) . '">';
		return $html;
	}

	/**
	 * Generates the ending HTML for the player wrapper.
	 *
	 * @return string The ending wrapper HTML.
	 */
	protected function get_wrapper_end_html(): string {
		return '</div></div>';
	}

	/**
	 * Generates the HTML code for the video element.
	 *
	 * @return string The video element HTML.
	 */
	protected function get_video_code(): string {

		$video = '';

		if ( $this->get_source() ) {
			$video .= '<video id="videopack_video_' . $this->get_id() . '" ';
			$video .= 'class="' . esc_attr( implode( ' ', $this->get_video_classes() ) ) . '" ';
			$video .= esc_attr( implode( ' ', $this->get_boolean_video_attributes() ) ) . ' ';
			$video .= implode( ' ', $this->get_string_video_attributes() ) . ' ';
			$video .= '" >';

			$video .= $this->get_source_elements();
			$video .= $this->get_track_elements();

			$video .= '</video>';
		}

		return apply_filters( 'videopack_video_player_code', $video, $this->atts );
	}

	/**
	 * Returns the HTML classes for the video element.
	 *
	 * @return array Array of HTML classes.
	 */
	protected function get_video_classes(): array {
		$classes = array(
			'videopack-video',
		);

		return apply_filters( 'videopack_video_player_classes', $classes, $this->atts );
	}

	/**
	 * Returns the boolean attributes for the video element.
	 *
	 * @return array Array of boolean attribute names.
	 */
	protected function get_boolean_video_attributes(): array {
		$attribute_names = array(
			'autoplay',
			'controls',
			'loop',
			'muted',
			'playsinline',
		);

		$enabled_attributes = array();
		foreach ( $attribute_names as $attribute_name ) {
			if ( ( $this->atts[ $attribute_name ] ?? false ) === true ) {
				$enabled_attributes[] = $attribute_name;
			}
		}
		return $enabled_attributes;
	}

	/**
	 * Returns the string attributes for the video element.
	 *
	 * @return array Array of string attribute key-value pairs.
	 */
	protected function get_string_video_attributes(): array {

		$attribute_names = array(
			'poster',
			'preload',
			'height',
			'width',
		);

		$string_video_atts = array();
		foreach ( $attribute_names as $attribute_name ) {
			if ( ! empty( $this->atts[ $attribute_name ] ) ) {
				$string_video_atts[] = $attribute_name . '="' . esc_attr( (string) $this->atts[ $attribute_name ] ) . '"';
			}
		}
		return $string_video_atts;
	}

	/**
	 * Generates HTML source elements for the video.
	 *
	 * @return string The source elements HTML.
	 */
	protected function get_source_elements(): string {
		$source_elements = '';

		foreach ( $this->get_flat_sources() as $source ) {
			$source_elements .= '<source src="' . $source['src'] . '" type="' . $source['type'];
			// Only include the codecs parameter for H.264 (avc1), as browsers are lenient with it.
			// For other formats (HEVC, VP9, AV1), the simple FourCC code is insufficient and causes playback failures in Chrome.
			if ( ! empty( $source['codecs'] ) && 'avc1' === $source['codecs'] ) {
				$source_elements .= '; codecs=' . $source['codecs'];
			}
			$source_elements .= '"';
			$source_elements .= $this->get_source_atts( $source );
			$source_elements .= ' >';
		}

		return apply_filters( 'videopack_video_player_sources', $source_elements, $this->atts );
	}

	/**
	 * Returns additional attributes for a source element.
	 *
	 * @param array $source The source data.
	 * @return string The source attributes HTML.
	 */
	protected function get_source_atts( array $source ): string {
		$atts = '';
		if ( ! empty( $source['resolution'] ) ) {
			$atts .= ' data-res="' . $source['resolution'] . '"';
		}
		if ( ! empty( $source['default_res'] ) ) {
			$atts .= ' data-default_res="' . $source['default_res'] . '"';
		}
		return apply_filters( 'videopack_video_player_source_attributes', $atts, $source, $this->atts );
	}

	/**
	 * Generates HTML track elements for the video.
	 *
	 * @return string The track elements HTML.
	 */
	protected function get_track_elements(): string {
		$track_elements = '';
		if ( ! empty( $this->atts['tracks'] ) && is_array( $this->atts['tracks'] ) ) {
			foreach ( $this->atts['tracks'] as $track_attributes ) {
				if ( empty( $track_attributes['src'] ) ) {
					continue;
				}
				$track_elements .= '<track ';
				foreach ( $track_attributes as $key => $value ) {
					$track_elements .= esc_attr( $key ) . '="' . esc_attr( $value ) . '" ';
				}
				$track_elements .= '>';
			}
		}

		return apply_filters( 'videopack_video_player_tracks', $track_elements, $this->atts );
	}

	/**
	 * Checks if the player should display content below the video.
	 *
	 * @return bool True if content should be visible, false otherwise.
	 */
	protected function has_below_video(): bool {
		return apply_filters(
			'videopack_video_player_has_below_video',
			( ! empty( $this->atts['caption'] )
			|| (bool) ( $this->atts['view_count'] ?? false )
			),
			$this->atts
		);
	}

	/**
	 * Generates the HTML code for content below the video.
	 *
	 * @return string The below-video HTML.
	 */
	protected function get_below_video_code(): string {
		$below_video = '<div class="videopack-below-video">';
		if ( $this->atts['view_count'] ) {
			$source     = $this->get_source();
			$view_count = $source ? $source->get_views() : '';
			if ( ! empty( $view_count ) ) {
				/* translators: %s is the number of times a video has been played */
				$below_video .= '<span class="videopack-viewcount">' . esc_html( \Videopack\Common\I18n::format_view_count( $view_count ) ) . '</span>';
			}
		}
		if ( ! empty( $this->atts['caption'] ) ) {
			$below_video .= '<p class="videopack-caption">' . esc_html( (string) $this->atts['caption'] ) . '</p>';
		}
		$below_video .= '</div>';
		return $below_video;
	}

	/**
	 * Generates the HTML code for the watermark.
	 *
	 * @return string The watermark HTML.
	 */
	protected function get_watermark_code(): string {
		if ( empty( $this->atts['watermark'] ) ) {
			return '';
		}

		$all_defaults = $this->options_manager->get_default();
		$defaults     = $all_defaults['watermark_styles'];

		$styles = array_merge( $defaults, $this->options['watermark_styles'] ?? array() );
		$style  = '';

		// Only apply inline styles if they differ from defaults.
		if ( (string) $styles['scale'] !== (string) $defaults['scale']
		|| $styles['align'] !== $defaults['align']
		|| $styles['valign'] !== $defaults['valign']
		|| (string) $styles['x'] !== (string) $defaults['x']
		|| (string) $styles['y'] !== (string) $defaults['y']
		) {
			$style = 'max-width: ' . $styles['scale'] . '%; width: 100%; height: auto; position: absolute;';

			if ( 'left' === $styles['align'] ) {
				$style .= ' left: ' . $styles['x'] . '%;';
			} elseif ( 'right' === $styles['align'] ) {
				$style .= ' right: ' . $styles['x'] . '%;';
			} else {
				$style .= ' left: 50%; transform: translateX(-50%); margin-left: -' . $styles['x'] . '%;';
			}

			if ( 'top' === $styles['valign'] ) {
				$style .= ' top: ' . $styles['y'] . '%;';
			} elseif ( 'bottom' === $styles['valign'] ) {
				$style .= ' bottom: ' . $styles['y'] . '%;';
			} else {
				if ( 'center' === $styles['align'] ) {
					// If both are center, combine transform.
					$style = str_replace( 'transform: translateX(-50%);', 'transform: translate(-50%, -50%);', $style );
				} else {
					$style .= ' top: 50%; transform: translateY(-50%);';
				}
				$style .= ' margin-top: -' . $styles['y'] . '%;';
			}

			$style = ' style="' . esc_attr( $style ) . '"';
		}

		$html = '<div id="video_' . esc_attr( (string) $this->get_id() ) . '_watermark" class="videopack-watermark">';

		$link_to = $this->atts['watermark_link_to'] ?? 'false';
		$url     = $this->atts['watermark_url'] ?? '';

		if ( 'Custom URL' === $link_to ) {
			$link_to = 'custom';
		}
		if ( 'None' === $link_to ) {
			$link_to = 'false';
		}

		if ( 'false' !== $link_to ) {
			$href = '#';
			switch ( $link_to ) {
				case 'home':
					$href = get_home_url();
					break;
				case 'parent':
					$href = $this->source->get_parent_id() ? get_permalink( $this->source->get_parent_id() ) : get_home_url();
					break;
				case 'attachment':
					$href = is_numeric( $this->source->get_id() ) ? get_permalink( $this->source->get_id() ) : get_home_url();
					break;
				case 'download':
					$href = $this->source->get_download_url();
					break;
				case 'custom':
					$href = $url;
					break;
			}
			$html .= '<a target="_parent" href="' . esc_url( (string) $href ) . '"' . ( 'download' === $link_to ? ' download' : '' ) . '>';
		}

		$html .= '<img src="' . esc_url( (string) $this->atts['watermark'] ) . '" alt="' . esc_attr__( 'watermark', 'video-embed-thumbnail-generator' ) . '"' . $style . '>';

		if ( 'false' !== $link_to ) {
			$html .= '</a>';
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Checks if the player has a fixed aspect ratio.
	 *
	 * @return bool True if fixed aspect ratio is enabled, false otherwise.
	 */
	protected function is_fixed_aspect(): bool {
		if ( empty( $this->atts['fixed_aspect'] ) || 'false' === $this->atts['fixed_aspect'] ) {
			return false;
		}
		if ( 'true' === $this->atts['fixed_aspect'] || true === $this->atts['fixed_aspect'] ) {
			return true;
		}
		return false;
	}

	/**
	 * Returns the fixed aspect ratio string.
	 *
	 * @return string The aspect ratio (e.g., "16 / 9").
	 */
	protected function get_fixed_aspect_ratio(): string {
		$width  = (int) $this->options['width'];
		$height = (int) $this->options['height'];
		if ( $width > 0 && $height > 0 ) {
			return "$width / $height";
		}
		return '16 / 9';
	}
}
