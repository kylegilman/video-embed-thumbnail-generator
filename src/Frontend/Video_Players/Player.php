<?php

namespace Videopack\Frontend\Video_Players;

class Player {


	/**
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

	/**
	 * @var array $options
	 */
	protected $options;

	/**
	 * @var array $atts
	 */
	protected $atts;

	/**
	 * @var int $player_id
	 */
	protected $player_id;

	/**
	 * Full source object, including child sources
	 * @var \Videopack\Video_Source\Source $source
	 */
	protected $source;

	/**
	 * Array of sources for the video player
	 * @var array $sources
	 */
	protected $sources;

	/**
	 * @var bool $script_localized
	 */
	private static $script_localized = false;

	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->player_id       = $options_manager->increment_video_player_id();
		$this->register_hooks();
	}

	public function register_hooks() {
		add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );
	}

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

	public function filter_block_metadata( $metadata ) {
		return $metadata;
	}

	public function enqueue_styles() {
		if ( ! has_block( 'videopack/videopack-video' ) ) {
			wp_enqueue_style( 'videopack_styles', plugins_url( '/admin-ui/build/frontend-styles.css', VIDEOPACK_PLUGIN_FILE ), array(), VIDEOPACK_VERSION );
		}
	}

	public function get_videopack_script_dependencies(): array {
		return array( 'jquery' );
	}

	public function enqueue_scripts(): void {
		$this->enqueue_player_scripts();
		wp_enqueue_script( 'videopack-frontend' );
	}

	public function enqueue_player_scripts(): void {
		// This method is intended to be overridden by child classes.
	}

	public function get_source(): ?\Videopack\Video_Source\Source {
		if ( $this->source instanceof \Videopack\Video_Source\Source ) {
			return $this->source;
		}
		return null;
	}

	public function set_source( \Videopack\Video_Source\Source $source ) {
		$this->source = $source;
	}

	/**
	 * Initializes the video source object from attributes.
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

	public function set_atts( array $atts ): void {
		$this->atts = $atts;
	}

	public function get_id(): int {
		return $this->player_id;
	}

	public function get_sources(): ?array {
		if ( ! $this->sources && $this->get_source() ) {
			$this->set_sources();
		}
		return $this->sources;
	}

	protected function set_sources(): void {
		$grouped_sources = array();
		$auto_codec      = $this->atts['auto_codec'] ?? 'h264';
		$auto_res        = $this->atts['auto_res'] ?? 'automatic';

		// Process the main source
		$main_source = $this->get_source();
		if ( $main_source && $main_source->exists() && $main_source->is_compatible() ) {
			$codec = $main_source->get_codec();
			if ( $codec ) {
				$codec_id = $codec->get_id();
				if ( ! isset( $grouped_sources[ $codec_id ] ) ) {
					$grouped_sources[ $codec_id ] = array(
						'label'   => $codec->get_label(),
						'sources' => array(),
					);
				}
				$grouped_sources[ $codec_id ]['sources'][] = $main_source->get_video_player_source();
			}
		}

		// Process child sources
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

		// Sort groups so the auto_codec comes first
		if ( isset( $grouped_sources[ $auto_codec ] ) ) {
			$preferred_group = $grouped_sources[ $auto_codec ];
			unset( $grouped_sources[ $auto_codec ] );
			$grouped_sources = array_merge( array( $auto_codec => $preferred_group ), $grouped_sources );
		}

		// Mark default resolution and sort sources within groups
		foreach ( $grouped_sources as $codec_id => &$group ) {
			$sources = $group['sources'];

			// Sort sources by resolution (descending)
			usort(
				$sources,
				function ( $a, $b ) {
					$res_a = isset( $a['resolution'] ) ? (int) $a['resolution'] : 0;
					$res_b = isset( $b['resolution'] ) ? (int) $b['resolution'] : 0;
					return $res_b - $res_a;
				}
			);

			// Mark default resolution
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

	public function get_poster(): string {
		return $this->atts['poster'];
	}

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
		);

		return apply_filters( 'videopack_video_player_data', $video_variables, $this->atts );
	}

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

	protected function has_meta_bar(): bool {
		return apply_filters(
			'videopack_video_player_has_meta_bar',
			$this->atts['overlay_title']
			|| ( $this->atts['embeddable'] && $this->atts['embedcode'] !== false )
			|| $this->atts['downloadlink'] === true,
			$this->atts
		);
	}

	protected function has_embed_meta(): bool {
		return apply_filters(
			'videopack_video_player_has_embed_meta',
			$this->atts['embeddable']
			&& $this->atts['embedcode'] !== false,
			$this->atts
		);
	}

	protected function get_meta_bar_code(): string {

		$has_embed      = $this->has_embed_meta();
		$no_title_class = $this->atts['overlay_title'] ? '' : ' no-title';

		$meta_bar  = '<div class="videopack-meta-bar' . esc_attr( $no_title_class ) . '">';
		$meta_bar .= '<span class="meta-icons">';

		if ( $has_embed ) {
			$meta_bar .= '<button type="button" class="videopack-icons share"></button>';
		}

		if ( $this->atts['downloadlink'] ) {
			$download_attributes = 'class="download-link" href="' . esc_attr( $this->source->get_download_url() ) . '" download title="' . esc_attr__( 'Click to download', 'video-embed-thumbnail-generator' ) . '"';

			if ( ! empty( $this->options['click_download'] ) && $this->source instanceof \Videopack\Video_Source\Source_Attachment_Local && $this->source->exists() ) {
				$alt_link             = site_url( '/?attachment_id=' . $this->source->get_id() . '&videopack[download]=true' );
				$download_attributes .= ' data-alt_link="' . esc_attr( $alt_link ) . '"';
			}

			$meta_bar .= '<a ' . $download_attributes . '><span class="videopack-icons download"></span></a>';
		}
		$meta_bar .= '</span>';

		if ( $this->atts['overlay_title'] ) {
			$meta_bar .= '<span class="title">' . esc_html( $this->atts['title'] ) . '</span>';
		}
		$meta_bar .= '</div>';

		if ( $has_embed ) {
			$meta_bar .= '<button class="click-trap"></button>';
			$meta_bar .= '<div class="share-container' . esc_attr( $no_title_class ) . '">';

			$embed_url = '';
			if ( is_numeric( $this->source->get_id() ) ) {
				$embed_url = site_url( '/?attachment_id=' . $this->source->get_id() . '&videopack[enable]=true' );
			} else {
				$embed_url = $this->source->get_url();
			}

			$embed_code = '<iframe src="' . esc_url( $embed_url ) . '" width="' . esc_attr( $this->atts['width'] ) . '" height="' . esc_attr( $this->atts['height'] ) . '" frameborder="0" allowfullscreen></iframe>';

			$meta_bar .= '<span class="embedcode-container"><span class="videopack-icons embed"></span><span>' . esc_html__( 'Embed:', 'video-embed-thumbnail-generator' ) . '</span><span><input class="embedcode videopack-embed-code" type="text" value="' . esc_attr( $embed_code ) . '" readonly /></span></span>';

			$start_at_id = 'videopack-start-at-enable-' . $this->get_id();
			$meta_bar   .= '<span class="videopack-start-at-container">' .
				'<input type="checkbox" class="videopack-start-at-enable" id="' . esc_attr( $start_at_id ) . '" /> ' .
				'<label for="' . esc_attr( $start_at_id ) . '">' . esc_html__( 'Start at:', 'video-embed-thumbnail-generator' ) . '</label> ' .
				'<input type="text" class="videopack-start-at" value="00:00" />' .
				'</span>';

			$meta_bar .= '</div>';
		}

		return apply_filters( 'videopack_video_player_meta_bar', $meta_bar, $this->atts );
	}

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

		$meta_bar_class = $this->has_meta_bar() ? ' meta-bar-visible' : '';
		$style_attrs    = array();

		if ( $this->is_fixed_aspect() ) {
			$alignclass   .= ' videopack-fixed-aspect';
			$style_attrs[] = 'aspect-ratio: ' . esc_attr( $this->get_fixed_aspect_ratio() );
		}

		if ( $this->atts['legacy_dimensions'] ) {
			if ( $this->atts['fullwidth'] ) {
				$style_attrs[] = 'width: 100%';
			} elseif ( $this->atts['width'] ) {
				$style_attrs[] = 'width: ' . esc_attr( $this->atts['width'] ) . ( is_numeric( $this->atts['width'] ) ? 'px' : '' );
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

	protected function get_wrapper_end_html(): string {
		return '</div></div>';
	}

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

	protected function get_video_classes(): array {
		$classes = array(
			'videopack-video',
		);

		return apply_filters( 'videopack_video_player_classes', $classes, $this->atts );
	}

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
			if ( $this->atts[ $attribute_name ] === true ) {
				$enabled_attributes[] = $attribute_name;
			}
		}
		return $enabled_attributes;
	}

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
				$string_video_atts[] = $attribute_name . '="' . esc_attr( $this->atts[ $attribute_name ] ) . '"';
			}
		}
		return $string_video_atts;
	}

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

	protected function has_below_video(): bool {
		return apply_filters(
			'videopack_video_player_has_below_video',
			( ! empty( $this->atts['caption'] )
			|| $this->atts['view_count']
			),
			$this->atts
		);
	}

	protected function get_below_video_code(): string {
		$below_video = '<div class="videopack-below-video">';
		if ( $this->atts['view_count'] ) {
			$source     = $this->get_source();
			$view_count = $source ? $source->get_views() : '';
			if ( ! empty( $view_count ) ) {
				/* translators: %s is the number of times a video has been played */
				$below_video .= '<span class="viewcount">' . esc_html( \Videopack\Common\I18n::format_view_count( $view_count ) ) . '</span>';
			}
		}
		if ( ! empty( $this->atts['caption'] ) ) {
			$below_video .= '<p class="caption">' . esc_html( $this->atts['caption'] ) . '</p>';
		}
		$below_video .= '</div>';
		return $below_video;
	}

	protected function get_watermark_code(): string {
		if ( empty( $this->atts['watermark'] ) ) {
			return '';
		}

		$all_defaults = $this->options_manager->get_default();
		$defaults     = $all_defaults['watermark_styles'];

		$styles = array_merge( $defaults, $this->options['watermark_styles'] ?? array() );
		$style  = '';

		// Only apply inline styles if they differ from defaults.
		if ( $styles['scale'] != $defaults['scale']
		|| $styles['align'] !== $defaults['align']
		|| $styles['valign'] !== $defaults['valign']
		|| $styles['x'] != $defaults['x']
		|| $styles['y'] != $defaults['y']
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

		$html = '<div id="video_' . esc_attr( $this->get_id() ) . '_watermark" class="videopack-watermark">';

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
			$html .= '<a target="_parent" href="' . esc_url( $href ) . '"' . ( 'download' === $link_to ? ' download' : '' ) . '>';
		}

		$html .= '<img src="' . esc_url( $this->atts['watermark'] ) . '" alt="' . esc_attr__( 'watermark', 'video-embed-thumbnail-generator' ) . '"' . $style . '>';

		if ( 'false' !== $link_to ) {
			$html .= '</a>';
		}

		$html .= '</div>';

		return $html;
	}

	protected function is_fixed_aspect(): bool {
		if ( empty( $this->atts['fixed_aspect'] ) || 'false' === $this->atts['fixed_aspect'] ) {
			return false;
		}
		if ( 'true' === $this->atts['fixed_aspect'] || true === $this->atts['fixed_aspect'] ) {
			return true;
		}
		return false;
	}

	protected function get_fixed_aspect_ratio(): string {
		$width  = (int) $this->options['width'];
		$height = (int) $this->options['height'];
		if ( $width > 0 && $height > 0 ) {
			return "$width / $height";
		}
		return '16 / 9';
	}
}
