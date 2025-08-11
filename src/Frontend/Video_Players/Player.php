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
			'videopack',
			plugins_url( '/src/Frontend/js/videopack.js', VIDEOPACK_PLUGIN_FILE ),
			$this->get_videopack_script_dependencies(),
			VIDEOPACK_VERSION,
			true
		);

		wp_localize_script(
			'videopack',
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
				'quality'    => esc_html_x( 'Quality', 'text above list of video resolutions', 'video-embed-thumbnail-generator' ),
				'fullres'    => esc_html_x( 'Full', 'Full resolution', 'video-embed-thumbnail-generator' ),
			)
		);

		if ( $this->options['alwaysloadscripts'] == true ) {
			$this->enqueue_scripts();
		}
	}

	public function enqueue_styles() {
		wp_enqueue_style( 'videopack_styles', plugins_url( '/admin-ui/build/frontend-styles.css', VIDEOPACK_PLUGIN_FILE ), array(), VIDEOPACK_VERSION );
	}

	public function get_videopack_script_dependencies(): array {
		return array( 'jquery' );
	}

	public function enqueue_scripts(): void {
		do_action( 'videopack_enqueue_player_scripts' );
		wp_enqueue_script( 'videopack' );
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

		$sources = array();

		if ( $this->get_source()->is_compatible() ) {
			$sources[ $this->get_source()->get_format() ] = $this->get_source()->get_video_player_source();
		}

		if ( $this->get_source()->get_child_sources() ) {
			foreach ( $this->get_source()->get_child_sources() as $child_source ) {
				if ( $child_source->exists() && $child_source->is_compatible() ) {
					$sources[ $child_source->get_format() ] = $child_source->get_video_player_source();
				}
			}
		}

		$this->sources = array_values( $sources );
	}

	public function get_main_source_url(): string {
		if ( ! $this->sources && $this->get_source() ) {
			$this->set_sources();
		}
		if ( isset( $this->sources[0]['src'] ) ) {
			return $this->sources[0]['src'];
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
			'player_type'       => $this->options['embed_method'],
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
			'pixel_ratio'       => $this->atts['pixel_ratio'],
			'right_click'       => $this->atts['right_click'],
			'playback_rate'     => $this->atts['playback_rate'],
			'title'             => $this->atts['stats_title'],
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
			'window.Videopack = window.Videopack || {}; window.Videopack.player_data = window.Videopack.player_data || {}; window.Videopack.player_data["videopack_player_%1$s"] = %2$s;',
			$this->get_id(),
			wp_json_encode( $video_vars )
		);

		// The 'videopack' script is already registered, so we can add our instance-specific data to it.
		wp_add_inline_script( 'videopack', $script );

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
			$this->atts['title'] !== false
			|| $this->atts['embedcode'] !== false
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

		$meta_bar = '<div class="videopack-meta-bar is-visible">';
		if ( $this->atts['title'] !== false ) {
			$meta_bar .= '<span class="videopack-title">' . esc_html( $this->atts['title'] ) . '</span>';
		}
		$meta_bar .= '<span class="videopack-meta-icons">';
		if ( $this->has_embed_meta() ) {
			$meta_bar .= '<button class="vjs-icon-share"></button>';
		}
		$meta_bar .= '<a class="download-link" href="' . $this->source->get_download_url() . '" download title="' . esc_attr__( 'Click to download', 'video-embed-thumbnail-generator' ) . '"></a>';

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
			$alignclass = ' videopack-wrapper-auto-left videopack-wrapper-auto-right';
		} elseif ( 'right' === $this->atts['align'] ) {
			$alignclass = ' videopack-wrapper-auto-left';
		}

		$html  = '<div id="videopack_player_' . $this->get_id() . '_wrapper" class="videopack-wrapper' . $alignclass . '">';
		$html .= '<div class="videopack-player" data-id="' . esc_attr( $this->get_id() ) . '">';
		$html .= $this->get_schema_markup();
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

		foreach ( $this->get_sources() as $source ) {
			$source_elements .= '<source src="' . $source['src'] . '" type="' . $source['type'];
			if ( ! empty( $source['codecs'] ) ) {
				$source_elements .= '; codecs=' . $source['codecs'];
			}
			$source_elements .= '"';
			$source_elements .= $this->get_source_atts( $source );
			$source_elements .= ' />';
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
				$track_elements .= '/>';
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
			$source = $this->get_source();
			if ( $source ) {
				$view_count = $source->get_views();
			}
			$below_video .= '<span class="videopack-view-count">' . esc_html( $this->get_source()->get_views() ) . '</span>';
		}
		if ( ! empty( $this->atts['caption'] ) ) {
			$below_video .= '<p class="videopack-caption">' . esc_html( $this->atts['caption'] ) . '</p>';
		}
		$below_video .= '</div>';
		return $below_video;
	}

	protected function get_schema_markup(): string {
		if ( ! $this->atts['schema'] ) {
			return '';
		}

		$source = $this->get_source();
		if ( ! $source ) {
			return '';
		}

		$html = '<span itemprop="video" itemscope itemtype="https://schema.org/VideoObject">';
		if ( ! empty( $this->atts['poster'] ) ) {
			$html .= '<meta itemprop="thumbnailUrl" content="' . esc_url( $this->atts['poster'] ) . '" >';
		}

		if ( $this->atts['embeddable'] && is_numeric( $source->get_id() ) ) {
			$embed_url = site_url( '/?attachment_id=' . $source->get_id() . '&amp;videopack[enable]=true' );
		} else {
			$embed_url = $source->get_url();
		}

		$html .= '<meta itemprop="embedUrl" content="' . esc_url( $embed_url ) . '" >';
		$html .= '<meta itemprop="contentUrl" content="' . esc_url( $source->get_url() ) . '" >';
		$html .= '<meta itemprop="name" content="' . esc_attr( $this->atts['stats_title'] ) . '" >';
		$html .= '<meta itemprop="description" content="' . esc_attr( $this->atts['description'] ) . '" >';
		$html .= '<meta itemprop="uploadDate" content="' . esc_attr( get_the_date( 'c', $source->get_id() ) ) . '" >';
		$html .= '</span>';

		return $html;
	}

	protected function get_watermark_code(): string {
		if ( empty( $this->atts['watermark'] ) ) {
			return '';
		}

		$html = '<div style="display:none;" id="video_' . esc_attr( $this->get_id() ) . '_watermark" class="videopack-watermark">';

		$link_to = $this->atts['watermark_link_to'] ?? 'false';
		$url     = $this->atts['watermark_url'] ?? '';

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

		$html .= '<img src="' . esc_url( $this->atts['watermark'] ) . '" alt="' . esc_attr__( 'watermark', 'video-embed-thumbnail-generator' ) . '">';

		if ( 'false' !== $link_to ) {
			$html .= '</a>';
		}

		$html .= '</div>';

		return $html;
	}
}
