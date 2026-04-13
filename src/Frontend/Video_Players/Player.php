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
	 * Unique ID counter for video player instances.
	 *
	 * @var int $video_player_id_counter
	 */
	protected static $video_player_id_counter = 0;

	/**
	 * Videopack options array.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Videopack video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry|null $format_registry
	 */
	protected $format_registry;

	/**
	 * Video player attributes.
	 *
	 * @var array $atts
	 */
	protected $atts;

	/**
	 * Unique ID for this player instance.
	 *
	 * @var int|string $player_id
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
	 * Default resolution value for initial load.
	 *
	 * @var string $default_res
	 */
	protected $default_res = '';

	/**
	 * Default codec group ID for initial load.
	 *
	 * @var string $default_codec
	 */
	protected $default_codec = '';

	/**
	 * Whether the frontend script has been localized.
	 *
	 * @var bool $script_localized
	 */
	private static $script_localized = false;

	/**
	 * Constructor.
	 *
	 * @param array                                  $options         Videopack options array.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Optional. Videopack video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry = null ) {
		$this->options = $options;
		if ( ! $format_registry ) {
			$format_registry = new \Videopack\Admin\Formats\Registry( $options );
		}
		$this->format_registry = $format_registry;

		++self::$video_player_id_counter;
		$this->player_id = (string) ( $this->options['id'] ?? self::$video_player_id_counter );

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
	 * Ensures a metadata field is an array and appends a value.
	 *
	 * @param array  $metadata The block metadata.
	 * @param string $key      The key to check ('script' or 'style').
	 * @param string $value    The value to append.
	 * @return array The modified metadata.
	 */
	protected function ensure_array_and_append( $metadata, $key, $value ) {
		if ( ! isset( $metadata[ $key ] ) ) {
			$metadata[ $key ] = array( $value );
		} elseif ( is_array( $metadata[ $key ] ) ) {
			$metadata[ $key ][] = $value;
		} else {
			$metadata[ $key ] = array( (string) $metadata[ $key ], $value );
		}
		return (array) $metadata;
	}

	/**
	 * Returns the player attributes.
	 *
	 * @return array The player attributes.
	 */
	public function get_atts(): array {
		return (array) $this->atts;
	}

	/**
	 * Returns the handles for player-specific styles.
	 *
	 * @return array The style handles.
	 */
	public function get_player_style_handles(): array {
		return array( 'videopack-frontend' );
	}

	/**
	 * Returns the handles for player-specific scripts.
	 *
	 * @return array The script handles.
	 */
	public function get_player_script_handles(): array {
		return array();
	}


	/**
	 * Enqueues frontend styles.
	 */
	public function enqueue_styles() {
		wp_enqueue_style( 'videopack-frontend' );
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
			$this->options,
			$this->format_registry
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
	 * @return int|string The player ID.
	 */
	public function get_id(): string {
		return (string) $this->player_id;
	}

	/**
	 * Sets the player ID manually.
	 *
	 * @param int|string $id The player ID.
	 */
	public function set_id( $id ) {
		$this->player_id = $id;
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
		$auto_codec      = (string) ( $this->atts['auto_codec'] ?? 'h264' );
		$auto_res        = (string) ( $this->atts['auto_res'] ?? 'automatic' );

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
			if ( $codec_id === $auto_codec ) {
				$target_val = (int) preg_replace( '/[^0-9]/', '', (string) $auto_res );

				if ( 'highest' === $auto_res ) {
					$sources[0]['default_res'] = '1';
					$this->default_res         = (string) ( $sources[0]['resolution'] ?? '' );
					$this->default_codec       = (string) $codec_id;
				} elseif ( 'lowest' === $auto_res ) {
					$sources[ count( $sources ) - 1 ]['default_res'] = '1';
					$this->default_res                               = (string) ( $sources[ count( $sources ) - 1 ]['resolution'] ?? '' );
					$this->default_codec                             = (string) $codec_id;
				} elseif ( $target_val > 0 ) {
					// Find best fit: smallest resolution >= target.
					// Since sources are sorted DESC, we find the last one that is >= target.
					$best_fit_index = 0;
					foreach ( $sources as $index => $s ) {
						$s_val = (int) preg_replace( '/[^0-9]/', '', (string) ( $s['resolution'] ?? '' ) );
						if ( $s_val >= $target_val ) {
							$best_fit_index = $index;
						}
					}
					$sources[ $best_fit_index ]['default_res'] = '1';
					$this->default_res                         = (string) ( $sources[ $best_fit_index ]['resolution'] ?? '' );
					$this->default_codec                       = (string) $codec_id;
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
			'id'                          => (string) ( 'videopack_player_' . $this->get_id() ),
			'attachment_id'               => (int) ( $this->get_source() ? $this->get_source()->get_id() : 0 ),
			'embed_method'                => (string) ( $this->options['embed_method'] ?? 'Video.js' ),
			'width'                       => (int) $this->get_final_width(),
			'height'                      => (int) $this->get_final_height(),
			'fullwidth'                   => (bool) ( $this->atts['fullwidth'] ?? false ),
			'countable'                   => (bool) ( $this->atts['countable'] ?? false ),
			'count_views'                 => $this->atts['count_views'] ?? false,
			'start'                       => (int) ( $this->atts['start'] ?? 0 ),
			'autoplay'                    => (bool) ( $this->atts['autoplay'] ?? false ),
			'pauseothervideos'            => (bool) ( $this->atts['pauseothervideos'] ?? true ),
			'set_volume'                  => (float) ( $this->atts['volume'] ?? 1.0 ),
			'muted'                       => (bool) ( $this->atts['muted'] ?? false ),
			'endofvideooverlay'           => (string) ( $this->atts['endofvideooverlay'] ?? '' ),
			'auto_res'                    => (string) ( $this->atts['auto_res'] ?? 'automatic' ),
			'auto_codec'                  => (string) ( $this->atts['auto_codec'] ?? 'h264' ),
			'pixel_ratio'                 => (bool) ( $this->atts['pixel_ratio'] ?? false ),
			'right_click'                 => (bool) ( $this->atts['right_click'] ?? false ),
			'playback_rate'               => (bool) ( $this->atts['playback_rate'] ?? false ),
			'title'                       => (string) ( $this->atts['stats_title'] ?? '' ),
			'source_groups'               => (array) $this->get_sources(),
			'default_res'                 => (string) $this->default_res,
			'default_codec'               => (string) $this->default_codec,
			'fixed_aspect'                => (string) ( $this->atts['fixed_aspect'] ?? 'vertical' ),
			'default_ratio'               => (string) $this->get_fixed_aspect_ratio(),
			'tracks'                      => (array) ( $this->atts['tracks'] ?? array() ),
			'legacy_dimensions'           => (bool) ( $this->atts['legacy_dimensions'] ?? false ),
			'resize'                      => (bool) ( $this->atts['resize'] ?? true ),
			'title_color'                 => (string) ( $this->atts['title_color'] ?? '' ),
			'title_background_color'      => (string) ( $this->atts['title_background_color'] ?? '' ),
			'play_button_color'           => (string) ( $this->atts['play_button_color'] ?? '' ),
			'play_button_icon_color'      => (string) ( $this->atts['play_button_icon_color'] ?? '' ),
			'control_bar_bg_color'        => (string) ( $this->atts['control_bar_bg_color'] ?? '' ),
			'control_bar_color'           => (string) ( $this->atts['control_bar_color'] ?? '' ),
			'pagination_color'            => (string) ( $this->atts['pagination_color'] ?? '' ),
			'pagination_background_color' => (string) ( $this->atts['pagination_background_color'] ?? '' ),
			'pagination_active_bg_color'  => (string) ( $this->atts['pagination_active_bg_color'] ?? '' ),
			'caption'                     => (string) ( $this->atts['caption'] ?? '' ),
			'view_count'                  => (bool) ( $this->atts['view_count'] ?? false ),
			'view_count_text'             => $this->get_source() ? \Videopack\Common\I18n::format_view_count( $this->get_source()->get_views() ) : '',
			'rotate'                      => (int) ( $this->get_source() ? $this->get_source()->get_rotate() : 0 ),
			'skin'                        => (string) ( $this->atts['skin'] ?? ( $this->options['skin'] ?? 'vjs-theme-videopack' ) ),
		);

		return apply_filters( 'videopack_video_player_data', $video_variables, $this->atts );
	}

	/**
	 * Generates the full HTML code for the video player.
	 *
	 * @param array  $atts          The player attributes.
	 * @param string $inner_content Optional. Pre-rendered HTML for modular components (InnerBlocks).
	 * @return string The player HTML.
	 */
	public function get_player_code( $atts, $inner_content = '' ): string {

		$this->set_atts( $atts );
		$this->init_source_from_atts();

		if ( ! $this->get_source() ) {
			// Return an empty string or an error message if no valid source was found.
			return '';
		}

		$video_vars = $this->prepare_video_vars();

		if ( ! is_admin() && ! empty( $video_vars['id'] ) ) {
			$script = (string) sprintf(
				'window.videopack = window.videopack || {}; window.videopack.player_data = window.videopack.player_data || {}; window.videopack.player_data["%1$s"] = %2$s;',
				(string) $video_vars['id'],
				(string) wp_json_encode( (array) $video_vars )
			);
			wp_add_inline_script( 'videopack-frontend', $script );
		}

		$player_code  = '';
		$player_code .= $this->get_player_start_html() . "\n";

		if ( ! empty( $inner_content ) ) {
			$player_code .= $inner_content . "\n";
		}

		$player_code .= $this->get_video_code() . "\n";

		if ( ! empty( $this->atts['endofvideooverlay'] ) ) {
			$player_code .= '<div class="videopack-end-overlay"></div>' . "\n";
		}

		$player_code .= $this->get_player_end_html() . "\n";

		return apply_filters( 'videopack_video_player_code', $player_code, $this->atts );
	}


	/**
	 * Generates the HTML for the player div start tag.
	 *
	 * @return string The player div start HTML.
	 */
	protected function get_player_start_html(): string {
		$player_classes = apply_filters( 'videopack_player_div_classes', array( 'videopack-player' ), $this->atts );

		return '<div class="' . esc_attr( implode( ' ', $player_classes ) ) . '" data-id="' . esc_attr( $this->get_id() ) . '">';
	}

	/**
	 * Generates the HTML for the player components closing tag.
	 *
	 * @return string The player components closing HTML.
	 */
	protected function get_player_end_html(): string {
		return '</div>' . "\n";
	}

	/**
	 * Generates the HTML for the video element.
	 *
	 * @return string The video element HTML.
	 */
	protected function get_video_code(): string {

		$video = '';

		if ( $this->get_source() ) {
			$video .= '<video id="videopack_video_' . $this->get_id() . '" ';
			$video .= 'class="' . esc_attr( implode( ' ', $this->get_video_classes() ) ) . '" ';
			$video .= implode( ' ', $this->get_boolean_video_attributes() ) . ' ';
			$video .= implode( ' ', $this->get_string_video_attributes() );
			$video .= ' >' . "\n";

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
			$source_elements .= ' >' . "\n";
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
				$track_elements .= '>' . "\n";
			}
		}

		return apply_filters( 'videopack_video_player_tracks', $track_elements, $this->atts );
	}



	/**
	 * Checks if the player has a fixed aspect ratio.
	 *
	 * @return bool True if fixed aspect ratio is enabled, false otherwise.
	 */
	protected function is_fixed_aspect(): bool {
		$fixed_aspect = (string) ( $this->atts['fixed_aspect'] ?? 'false' );

		if ( 'false' === $fixed_aspect || 'none' === $fixed_aspect ) {
			return false;
		}

		if ( 'true' === $fixed_aspect || true === ( $this->atts['fixed_aspect'] ?? false ) ) {
			return true;
		}

		if ( 'vertical' === $fixed_aspect ) {
			$source = $this->get_source();
			if ( $source ) {
				return $source->get_height() > $source->get_width();
			}
		}

		return false;
	}

	/**
	 * Returns the final resolved width for the video player.
	 *
	 * @return int The resolved width.
	 */
	protected function get_final_width(): int {
		$width = (int) ( $this->atts['width'] ?? 0 );
		if ( $width <= 0 ) {
			$width = (int) ( $this->options['width'] ?? 960 );
		}

		$source = $this->get_source();
		if ( $source ) {
			$native_width = (int) $source->get_width();
			// If the current width is the global default, and the source has real native dimensions, use them.
			if ( $width === (int) ( $this->options['width'] ?? 960 ) && $native_width > 0 ) {
				$width = $native_width;
			}
		}

		return $width;
	}

	/**
	 * Returns the final resolved height for the video player.
	 *
	 * @return int The resolved height.
	 */
	protected function get_final_height(): int {
		$height = (int) ( $this->atts['height'] ?? 0 );
		if ( $height <= 0 ) {
			$height = (int) ( $this->options['height'] ?? 540 );
		}

		$source = $this->get_source();
		if ( $source ) {
			$native_height = (int) $source->get_height();
			// If the current height is the global default, and the source has real native dimensions, use them.
			if ( $height === (int) ( $this->options['height'] ?? 540 ) && $native_height > 0 ) {
				$height = $native_height;
			}
		}

		return $height;
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
