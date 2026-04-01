<?php
/**
 * Shortcode and block attribute handler.
 *
 * @package Videopack
 */

namespace Videopack\Frontend;

use Videopack\Common\Hook_Subscriber;

/**
 * Class Shortcode
 *
 * Handles the registration and processing of the [videopack] shortcode and blocks.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Shortcode implements Hook_Subscriber {

	/**
	 * Returns an array of actions to subscribe to.
	 *
	 * @return array
	 */
	public function get_actions(): array {
		return array(
			array(
				'hook'     => 'wp_loaded',
				'callback' => 'overwrite_video_shortcode',
			),
			array(
				'hook'     => 'init',
				'callback' => 'add',
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
				'hook'          => 'render_block',
				'callback'      => 'replace_video_block',
				'priority'      => 10,
				'accepted_args' => 2,
			),
			array(
				'hook'     => 'no_texturize_shortcodes',
				'callback' => 'no_texturize',
			),
			array(
				'hook'     => 'query_vars',
				'callback' => 'add_query_vars',
			),
		);
	}


	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry|null $format_registry
	 */
	protected $format_registry;

	/**
	 * Constructor.
	 *
	 * @param array                                  $options         Plugin options.
	 * @param \Videopack\Admin\Formats\Registry|null $format_registry Optional. Video formats registry.
	 */
	public function __construct( array $options, \Videopack\Admin\Formats\Registry $format_registry = null ) {
		$this->options         = $options;
		$this->format_registry = $format_registry;
	}

	/**
	 * Registers the shortcodes with WordPress.
	 *
	 * @return void
	 */
	public function add() {
		add_shortcode( 'videopack', array( $this, 'do' ) );
		add_shortcode( 'VIDEOPACK', array( $this, 'do' ) );
		add_shortcode( 'FMP', array( $this, 'do' ) );
		add_shortcode( 'KGVID', array( $this, 'do' ) );
	}

	/**
	 * Returns the definitions for shortcode and block attributes.
	 *
	 * @return array The attribute definitions.
	 */
	private function get_attribute_definitions() {
		if ( in_the_loop() ) {
			$post_id = get_the_ID();
		} else {
			$post_id = 0;
		}

		return array(
			'default_atts'    => array(
				'id'                            => null,
				'orderby'                       => 'menu_order ID',
				'order'                         => 'ASC',
				'videos'                        => $this->options['collection_video_limit'] ?? -1,
				'start'                         => '',
				'gallery'                       => 'false',
				'gallery_source'                => 'current',
				'gallery_category'              => '',
				'gallery_tag'                   => '',
				'gallery_orderby'               => 'menu_order ID',
				'gallery_order'                 => 'ASC',
				'gallery_exclude'               => '',
				'gallery_include'               => '',
				'gallery_id'                    => $post_id,
				'caption'                       => '',
				'description'                   => '',
				'track_kind'                    => 'subtitles',
				'track_srclang'                 => substr( (string) get_bloginfo( 'language' ), 0, 2 ),
				'track_src'                     => '',
				'track_label'                   => get_bloginfo( 'language' ),
				'track_default'                 => '',
				'title'                         => '',
				'text_tracks'                   => array(),
				'enable_collection_video_limit' => false,
				'collection_video_limit'        => -1,
				'layout'                        => 'player',
				'grid_metadata'                 => 'thumbnail,duration,title,views,date',
				'grid_link_to'                  => 'post',
				'grid_columns'                  => 3,
			),
			'options_atts'    => array(
				'width',
				'height',
				'legacy_dimensions',
				'fullwidth',
				'fixed_aspect',
				'align',
				'controls',
				'poster',
				'watermark',
				'watermark_link_to',
				'watermark_url',
				'endofvideooverlay',
				'endofvideooverlaysame',
				'loop',
				'autoplay',
				'gifmode',
				'pauseothervideos',
				'playsinline',
				'title_color',
				'title_background_color',
				'play_button_color',
				'play_button_icon_color',
				'control_bar_bg_color',
				'control_bar_color',
				'pagination_color',
				'pagination_background_color',
				'pagination_active_bg_color',
				'pagination_active_color',
				'gallery_pagination',
				'gallery_per_page',
				'gallery_columns',
				'gallery_end',
				'gallery_title',
				'volume',
				'muted',
				'preload',
				'playback_rate',
				'skip_buttons',
				'overlay_title',
				'embedcode',
				'embeddable',
				'view_count',
				'count_views',
				'inline',
				'downloadlink',
				'right_click',
				'resize',
				'auto_res',
				'auto_codec',
				'pixel_ratio',
				'nativecontrolsfortouch',
				'schema',
				'gallery_thumb',
				'gallery_orderby',
				'gallery_order',
				'gallery_source',
				'gallery_include',
				'gallery_exclude',
				'gallery_id',
				'gallery_category',
				'gallery_tag',
				'collection_video_limit',
				'skin',
			),
			'boolean_convert' => array(
				'endofvideooverlaysame',
				'loop',
				'playsinline',
				'autoplay',
				'controls',
				'pauseothervideos',
				'overlay_title',
				'embedcode',
				'embeddable',
				'view_count',
				'inline',
				'resize',
				'downloadlink',
				'muted',
				'playback_rate',
				'fullwidth',
				'gallery_pagination',
				'gallery_title',
				'nativecontrolsfortouch',
				'pixel_ratio',
				'schema',
				'gifmode',
				'right_click',
				'skip_buttons',
				'gallery',
				'enable_collection_video_limit',
			),
		);
	}

	/**
	 * Returns the attributes configured for the block editor.
	 *
	 * @return array The block attributes.
	 */
	public function get_block_attributes(): array {
		$definitions     = (array) $this->get_attribute_definitions();
		$default_atts    = (array) $definitions['default_atts'];
		$options_atts    = (array) $definitions['options_atts'];
		$boolean_convert = (array) $definitions['boolean_convert'];

		$attributes = array();

		// Add 'src' as a special case attribute for the block editor.
		$attributes['src']   = array(
			'type'    => 'string',
			'default' => '',
		);
		$attributes['title'] = array(
			'type'    => 'string',
			'default' => '',
		);

		foreach ( (array) $default_atts as $key => $value ) {
			$type = 'string';
			if ( is_bool( $value ) ) {
				$type = 'boolean';
			} elseif ( is_numeric( $value ) ) {
				$type = 'number';
			}
			$attributes[ (string) $key ] = array(
				'type'    => $type,
				'default' => $value,
			);
		}

		foreach ( (array) $options_atts as $att ) {
			if ( array_key_exists( (string) $att, $this->options ) ) {
				$attributes[ (string) $att ] = array(
					'type' => is_bool( $this->options[ $att ] ) ? 'boolean' : ( is_numeric( $this->options[ $att ] ) ? 'number' : 'string' ),
				);
				// Exclude width and height from defaults so they can be resolved dynamically.
				if ( 'width' !== $att && 'height' !== $att ) {
					$attributes[ (string) $att ]['default'] = $this->options[ $att ];
				}
			} else {
				$attributes[ (string) $att ] = array(
					'type' => 'string',
				);
			}
		}

		foreach ( (array) $boolean_convert as $key ) {
			if ( isset( $attributes[ (string) $key ] ) ) {
				$attributes[ (string) $key ]['type'] = 'boolean';
			} else {
				$attributes[ (string) $key ] = array(
					'type' => 'boolean',
				);
			}
		}

		$attributes['id']['type'] = array( 'number', 'string' );

		$attributes['text_tracks'] = array(
			'type'    => 'array',
			'items'   => array(
				'type'       => 'object',
				'properties' => array(
					'src'     => array( 'type' => 'string' ),
					'kind'    => array( 'type' => 'string' ),
					'srclang' => array( 'type' => 'string' ),
					'label'   => array( 'type' => 'string' ),
					'default' => array( 'type' => 'boolean' ),
				),
			),
			'default' => array(),
		);

		/**
		 * Filter the block attributes.
		 *
		 * @param array $attributes The block attributes.
		 */
		return (array) apply_filters( 'videopack_block_attributes', (array) $attributes );
	}

	/**
	 * Sanitizes and prepares shortcode attributes.
	 *
	 * @param array|string $atts The user-provided attributes.
	 * @return array The prepared attributes.
	 */
	public function atts( $atts ): array {

		$definitions     = (array) $this->get_attribute_definitions();
		$default_atts    = (array) $definitions['default_atts'];
		$options_atts    = (array) $definitions['options_atts'];
		$boolean_convert = (array) $definitions['boolean_convert'];

		$deprecated_atts = array(
			'controlbar'    => 'controls',
			'mute'          => 'muted',
			'gallery_thumb' => 'gallery_columns',
		);

		if ( is_array( $atts ) ) {

			foreach ( (array) $deprecated_atts as $deprecated_att => $new_att ) { // Loop through old atts and convert to new ones.

				if ( array_key_exists( (string) $deprecated_att, $atts ) ) {

					$atts[ (string) $new_att ] = $atts[ (string) $deprecated_att ];

					if ( 'controls' === (string) $new_att ) {

						if ( 'none' === (string) $atts['controls'] ) {
							$atts['controls'] = 'false';
						} else {
							$atts['controls'] = 'true';
						}
					}

					if ( 'gallery_columns' === (string) $new_att ) {
						// Convert thumbnail width to columns per row based on arbitrary 1000px width window.
						$atts['gallery_columns'] = (int) round( 1000 / (int) ( $atts['gallery_columns'] ?? 1 ) );
					}
				}
			}
		}

		$option_defaults = array();
		foreach ( (array) $options_atts as $att ) {
			if ( array_key_exists( (string) $att, $this->options ) ) {
				$option_defaults[ (string) $att ] = $this->options[ $att ];
			}
		}

		$default_atts = (array) array_merge( (array) $default_atts, (array) $option_defaults );
		/**
		 * Filter the default shortcode attributes.
		 *
		 * @param array $default_atts The default attributes.
		 */
		$default_atts = (array) apply_filters( 'videopack_default_shortcode_atts', (array) $default_atts );

		$query_atts = (array) shortcode_atts( (array) $default_atts, (array) $atts, 'videopack' );

		$videopack_query_var = get_query_var( 'videopack' ); // Variables in URL.
		if ( empty( $videopack_query_var ) ) {
			$videopack_query_var = get_query_var( 'kgvid_video_embed' ); // Check the old query variable.
		}

		if ( ! empty( $videopack_query_var ) && is_array( $videopack_query_var ) ) {

			$allowed_query_var_atts = array( // Attributes that can be changed via URL.
				'auto_res',
				'auto_codec',
				'autoplay',
				'controls',
				'default_res',
				'fullwidth',
				'gifmode',
				'height',
				'loop',
				'muted',
				'nativecontrolsfortouch',
				'pixel_ratio',
				'resize',
				'set_volume',
				'start',
				'width',
			);

			/**
			 * Filter the allowed query variable attributes.
			 *
			 * @param array $allowed_query_var_atts The allowed attributes.
			 */
			$allowed_query_var_atts = (array) apply_filters( 'videopack_allowed_query_var_atts', (array) $allowed_query_var_atts );

			foreach ( (array) $videopack_query_var as $key => $value ) {
				if ( in_array( (string) $key, (array) $allowed_query_var_atts, true ) ) {
					$query_atts[ (string) $key ] = $value;
				}
			}
		}

		// Convert boolean-like attributes to booleans.
		foreach ( (array) $boolean_convert as $key ) {
			if ( isset( $query_atts[ (string) $key ] ) ) {
				if ( 'true' === (string) $query_atts[ $key ] || true === $query_atts[ $key ] || '1' === (string) $query_atts[ $key ] || 1 === $query_atts[ $key ] ) {
					$query_atts[ (string) $key ] = true;
				} elseif ( 'false' === (string) $query_atts[ $key ] || false === $query_atts[ $key ] || '0' === (string) $query_atts[ $key ] || 0 === $query_atts[ $key ] ) {
					$query_atts[ (string) $key ] = false;
				} elseif ( is_string( $query_atts[ $key ] ) && 'true' === strtolower( (string) $query_atts[ $key ] ) ) {
					$query_atts[ (string) $key ] = true;
				}
			}
		}

		// Ensure gallery_thumb is always an integer.
		if ( isset( $query_atts['gallery_thumb'] ) ) {
			$query_atts['gallery_thumb'] = (int) $query_atts['gallery_thumb'];
		}

		// Map collection_video_limit -> videos only if it was passed explicitly (e.g. from the block).
		if ( ! empty( $query_atts['enable_collection_video_limit'] ) ) {
			$query_atts['videos'] = (int) ( $query_atts['collection_video_limit'] ?? -1 );
		} elseif ( is_array( $atts ) && array_key_exists( 'enable_collection_video_limit', $atts ) ) {
			// This is a block instance where the toggle is explicitly OFF, so we override to no limit.
			$query_atts['videos'] = -1;
		} elseif ( is_array( $atts ) && isset( $atts['collection_video_limit'] ) ) {
			// This handles legacy shortcodes where only the limit was passed.
			$query_atts['videos'] = (int) $atts['collection_video_limit'];
		}

		if ( (string) ( $query_atts['auto_res'] ?? '' ) === 'true' ) {
			$query_atts['auto_res'] = 'automatic';
		} // If anyone used auto_res in the shortcode before version 4.4.3.
		if ( (string) ( $query_atts['auto_res'] ?? '' ) === 'false' ) {
			$query_atts['auto_res'] = 'highest';
		}
		if ( (string) ( $query_atts['orderby'] ?? '' ) === 'menu_order' ) {
			$query_atts['orderby'] = 'menu_order ID';
		}
		if ( (string) ( $query_atts['gallery_orderby'] ?? '' ) === 'menu_order' ) {
			$query_atts['gallery_orderby'] = 'menu_order ID';
		}
		if ( (string) ( $query_atts['track_default'] ?? '' ) === 'true' ) {
			$query_atts['track_default'] = 'default';
		}
		if ( (string) ( $query_atts['count_views'] ?? '' ) === 'false' ) {
			$query_atts['view_count'] = 'false';
		}

		/**
		 * Filter the sanitized shortcode attributes.
		 *
		 * @param array $query_atts The sanitized attributes.
		 */
		return (array) apply_filters( 'videopack_shortcode_atts', (array) $query_atts );
	}

	/**
	 * Get the final, resolved attributes for a video.
	 *
	 * This method consolidates the logic for determining the final attributes for a video,
	 * merging defaults, user-provided attributes, and data from the video source itself.
	 *
	 * @param array|string                   $atts   The raw shortcode attributes.
	 * @param \Videopack\Video_Source\Source $source The video source object.
	 * @return array The final, resolved attributes.
	 */
	public function get_final_atts( $atts, \Videopack\Video_Source\Source $source ): array {
		$query_atts = (array) $this->atts( $atts );

		// Apply per-video overrides from _videopack-meta.
		// These override the global option defaults but NOT values explicitly
		// set in the shortcode text (which are already in $atts).
		$attachment_id = (string) $source->get_id();
		if ( is_numeric( $attachment_id ) ) {
			$videopack_meta = get_post_meta( (int) $attachment_id, '_videopack-meta', true );
			if ( is_array( $videopack_meta ) && ! empty( $videopack_meta ) ) {
				foreach ( (array) $videopack_meta as $key => $value ) {
					// Only apply if the key exists in $query_atts and was NOT
					// explicitly provided in the shortcode text.
					if ( array_key_exists( (string) $key, (array) $query_atts )
						&& ( ! is_array( $atts ) || ! array_key_exists( (string) $key, $atts ) )
						&& $value !== null
					) {
						$query_atts[ (string) $key ] = $value;
					}
				}
			}
		}

		// Populate shortcode attributes with data from the Source object, if not already set by the user.
		if ( empty( $query_atts['poster'] ) ) {
			$query_atts['poster'] = (string) $source->get_poster();
		}
		if ( empty( $query_atts['title'] ) ) {
			$query_atts['title'] = (string) $source->get_title();
		}
		if ( empty( $query_atts['caption'] ) ) {
			$query_atts['caption'] = (string) $source->get_caption();
		}
		if ( empty( $query_atts['description'] ) ) {
			$query_atts['description'] = (string) $source->get_description();
		}
		// Handle text tracks.
		if ( ! empty( $query_atts['text_tracks'] ) ) {
			// If multiple tracks are defined (e.g., from the block editor), use them.
			$query_atts['tracks'] = (array) $query_atts['text_tracks'];
		} elseif ( ! empty( $query_atts['track_src'] ) ) {
			// If a single track is defined by shortcode attributes, use it.
			$query_atts['tracks'] = array(
				array(
					'kind'    => (string) ( $query_atts['track_kind'] ?? 'subtitles' ),
					'srclang' => (string) ( $query_atts['track_srclang'] ?? 'en' ),
					'src'     => (string) ( $query_atts['track_src'] ?? '' ),
					'label'   => (string) ( $query_atts['track_label'] ?? '' ),
					'default' => (string) ( $query_atts['track_default'] ?? '' ),
				),
			);
		} else {
			// Otherwise, get all tracks from the source's metadata.
			$query_atts['tracks'] = (array) $source->get_tracks();
		}

		$query_atts['starts'] = (int) $source->get_views();

		// Determine if the video is countable (i.e., an attachment).
		$query_atts['countable'] = (bool) is_numeric( $source->get_id() );

		// Set the title for statistics, using the attachment title or URL basename as a fallback.
		if ( empty( $query_atts['stats_title'] ) ) {
			$query_atts['stats_title'] = (string) $source->get_title();
			if ( empty( $query_atts['stats_title'] ) ) {
				$query_atts['stats_title'] = (string) basename( (string) $source->get_url() );
			}
		}

		// Set default dimensions from source if not provided in shortcode or if using global defaults.
		$width  = (int) ( $atts['width'] ?? 0 );
		$height = (int) ( $atts['height'] ?? 0 );

		if ( ( empty( $width ) || $width === (int) ( $this->options['width'] ?? 960 ) ) && (int) $source->get_width() > 0 ) {
			$query_atts['width'] = (int) $source->get_width();
		}
		if ( ( empty( $height ) || $height === (int) ( $this->options['height'] ?? 540 ) ) && (int) $source->get_height() > 0 ) {
			$query_atts['height'] = (int) $source->get_height();
		}

		// Apply GIF mode overrides if enabled.
		if ( (bool) ( $query_atts['gifmode'] ?? false ) === true ) {
			$gifmode_atts = array(
				'muted'        => true,
				'autoplay'     => true,
				'loop'         => true,
				'controls'     => false,
				'title'        => false,
				'embeddable'   => false,
				'downloadlink' => false,
				'playsinline'  => true,
				'view_count'   => false,
			);
			/**
			 * Filter the GIF mode attributes.
			 *
			 * @param array $gifmode_atts The attributes.
			 */
			$gifmode_atts = (array) apply_filters( 'videopack_gifmode_atts', (array) $gifmode_atts );
			$query_atts   = (array) array_merge( (array) $query_atts, (array) $gifmode_atts );
		}

		// Handle endofvideooverlaysame logic.
		if ( ! empty( $query_atts['endofvideooverlaysame'] ) && true === (bool) $query_atts['endofvideooverlaysame'] ) {
			$query_atts['endofvideooverlay'] = (string) ( $query_atts['poster'] ?? '' );
		}

		// Handle fixed_aspect logic.
		if ( ( ! empty( $query_atts['fixed_aspect'] ) && 'vertical' === (string) $query_atts['fixed_aspect'] && (int) ( $query_atts['height'] ?? 0 ) > (int) ( $query_atts['width'] ?? 0 ) )
		|| ( ! empty( $query_atts['fixed_aspect'] ) && true === (bool) $query_atts['fixed_aspect'] )
		) {
			$default_aspect_ratio = (float) ( (int) ( $this->options['height'] ?? 360 ) / (int) ( $this->options['width'] ?? 640 ) );
			$query_atts['height'] = (int) round( (int) ( $query_atts['width'] ?? 640 ) * $default_aspect_ratio );
		}

		// Backward compatibility: if title is "false", disable overlay_title.
		if ( 'false' === (string) ( $query_atts['title'] ?? '' ) ) {
			$query_atts['overlay_title'] = false;
		}

		// Handle responsive width/height and fixed aspect ratio.
		if ( '100%' === (string) ( $query_atts['width'] ?? '' ) ) {
			$query_atts['width']     = (int) ( $this->options['width'] ?? 640 );
			$query_atts['height']    = (int) ( $this->options['height'] ?? 360 );
			$query_atts['fullwidth'] = 'true';
		}

		// Ensure gallery_thumb is always set and is an integer.
		if ( ! isset( $query_atts['gallery_thumb'] ) ) {
			$query_atts['gallery_thumb'] = isset( $this->options['gallery_thumb'] ) ? (int) $this->options['gallery_thumb'] : 200;
		} else {
			$query_atts['gallery_thumb'] = (int) $query_atts['gallery_thumb'];
		}

		return (array) $query_atts;
	}

	/**
	 * Main shortcode handler.
	 *
	 * @param array|string $atts    The shortcode attributes.
	 * @param string       $content The shortcode content (video URL).
	 * @return string The rendered player or gallery HTML.
	 */
	public function do( $atts, $content = '' ) {
		$query_atts = $this->atts( $atts );

		// Handle gallery_source logic to ensure correct gallery_id.
		if ( isset( $query_atts['gallery_source'] ) ) {
			if ( 'current' === $query_atts['gallery_source'] && empty( $query_atts['gallery_id'] ) ) {
				$query_atts['gallery_id'] = get_the_ID();
				if ( ! $query_atts['gallery_id'] && ! is_admin() ) {
					$query_atts['gallery_id'] = get_queried_object_id();
				}
			} elseif ( in_array( $query_atts['gallery_source'], array( 'category', 'tag' ), true ) && empty( $query_atts['gallery_id'] ) ) {
				$query_atts['gallery_id'] = '';
			}
		}

		if ( is_feed() ) {
			return '';
		}

		$is_gallery = isset( $query_atts['gallery'] ) && true === $query_atts['gallery'];
		$is_list    = ! $is_gallery && ( ! empty( $query_atts['id'] ) && strpos( (string) $query_atts['id'], ',' ) !== false );
		$is_query   = ! $is_gallery && empty( $query_atts['id'] ) && empty( $content );

		if ( $is_list || $is_query ) {
			$query_atts['gallery'] = false;
		}

		if ( $is_gallery || $is_list || $is_query ) {
			if ( $is_gallery && isset( $query_atts['gallery_orderby'] ) && 'rand' === (string) $query_atts['gallery_orderby'] ) {
				$query_atts['gallery_orderby'] = 'RAND(' . (string) wp_rand() . ')';
			}

			// If it's a list based on 'id', we map it to 'gallery_include' for the Gallery class.
			if ( $is_list ) {
				$query_atts['gallery_include'] = $query_atts['id'];
			}

			$gallery = new Gallery( $this->options, $this->format_registry );
			$layout  = ( $is_gallery && true === $query_atts['gallery'] ) ? 'gallery' : 'list';
			$page    = 1;
			if ( get_query_var( 'paged' ) ) {
				$page = (int) get_query_var( 'paged' );
			} elseif ( get_query_var( 'page' ) ) {
				$page = (int) get_query_var( 'page' );
			}

			$result = (array) $gallery->collection_page( $page, $query_atts, $layout );
			$code   = (string) $result['html'];
		} else {
			$post_id = get_the_ID();
			if ( ! $post_id && ! is_admin() ) {
				$post_id = get_queried_object_id();
			}

			// Determine the video source based on shortcode attributes or content.
			$source_input = '';
			if ( ! empty( $query_atts['id'] ) ) {
				$source_input = trim( (string) $query_atts['id'] );
			} elseif ( ! empty( $content ) ) {
				$source_input = trim( (string) $content );
				// Workaround for relative video URL.
				if ( substr( $source_input, 0, 1 ) === '/' ) {
					$source_input = (string) get_bloginfo( 'url' ) . $source_input;
				}
			}

			// Create the Source object.
			$source = \Videopack\Video_Source\Source_Factory::create( $source_input, $this->options );

			if ( ! $source || ! $source->exists() ) {
				return '';
			}

			// Get the final, resolved attributes for the video.
			$final_atts = $this->get_final_atts( $atts, $source );

			// Determine the player type based on shortcode attribute or global option.
			$player_type = (string) ( $final_atts['embed_method'] ?? ( $this->options['embed_method'] ?? 'Video.js' ) );
			$player      = \Videopack\Frontend\Video_Players\Player_Factory::create( $player_type, $this->options );

			// Set the source and final attributes on the player instance.
			$player->set_source( $source );
			$player->set_atts( $final_atts );

			// Enqueue player-specific scripts and styles.
			$player->enqueue_scripts();

			// Get the generated HTML code for the video player.
			$code = (string) $player->get_player_code( $final_atts );
		}

		$code = (string) wp_kses( $code, ( new \Videopack\Common\Validate() )->allowed_html() );
		/**
		 * Filter the rendered shortcode output.
		 *
		 * @param string $code       The rendered HTML.
		 * @param array  $query_atts The sanitized attributes.
		 * @param string $content    The shortcode content.
		 */
		return (string) apply_filters( 'videopack_shortcode', $code, $query_atts, $content );
	}

	/**
	 * Prevents WordPress from texturizing the shortcodes (e.g., converting double quotes to smart quotes).
	 *
	 * @param array $shortcodes Existing shortcodes to skip texturizing.
	 * @return array Modified list of shortcodes.
	 */
	public function no_texturize( $shortcodes ): array {
		$shortcodes   = (array) $shortcodes;
		$shortcodes[] = 'KGVID';
		$shortcodes[] = 'FMP';
		$shortcodes[] = 'videopack';
		$shortcodes[] = 'VIDEOPACK';
		return (array) $shortcodes;
	}

	/**
	 * Registers custom query variables.
	 *
	 * @param array $qvars Existing query variables.
	 * @return array Modified list of query variables.
	 */
	public function add_query_vars( $qvars ): array {
		$qvars   = (array) $qvars;
		$qvars[] = 'videopack';
		$qvars[] = 'kgvid_video_embed'; // Old query variable.
		return (array) $qvars;
	}

	/**
	 * Generates a shortcode string for a video attachment.
	 *
	 * @param array|string $videopack_query_var The query variable data.
	 * @return string The generated shortcode.
	 */
	public function generate_attachment_shortcode( $videopack_query_var ) {

		$current_post = get_post();
		$shortcode    = '';

		if ( is_array( $videopack_query_var )
		&& array_key_exists( 'id', $videopack_query_var )
		) {
			$post_id = (int) $videopack_query_var['id'];
		} elseif ( $current_post instanceof \WP_Post ) {
			$post_id = (int) $current_post->ID;
		} else {
			$post_id = 1;
		}

		$videopack_postmeta = ( new \Videopack\Admin\Attachment_Meta( $this->options ) )->get( $post_id );

		if ( is_array( $videopack_query_var )
		&& array_key_exists( 'sample', $videopack_query_var )
		) {
			$url = (string) plugins_url( '/images/Adobestock_469037984.mp4', VIDEOPACK_PLUGIN_FILE );
		} else {
			$url = (string) wp_get_attachment_url( $post_id );
		}

		$shortcode = '[videopack';
		if ( ! empty( $post_id ) ) {
			$shortcode .= ' id="' . esc_attr( (string) $post_id ) . '"';
		}
		if ( is_array( $videopack_query_var )
		&& array_key_exists( 'enable', $videopack_query_var )
		&& 'true' === $videopack_query_var['enable']
		) {
			$shortcode .= ' fullwidth="true"';
		}
		if ( ! empty( $videopack_postmeta['downloadlink'] ) ) {
			$shortcode .= ' downloadlink="true"';
		}
		if ( is_array( $videopack_query_var ) && array_key_exists( 'start', $videopack_query_var ) ) {
			$shortcode .= ' start="' . esc_attr( (string) $videopack_query_var['start'] ) . '"';
		}
		if ( is_array( $videopack_query_var ) && array_key_exists( 'gallery', $videopack_query_var ) ) {
			$shortcode .= ' autoplay="true"';
		}
		if ( is_array( $videopack_query_var ) && array_key_exists( 'sample', $videopack_query_var ) ) {
			if ( ! empty( $this->options['overlay_title'] ) ) {
				$shortcode .= ' title="' . esc_attr_x( 'Sample Video', 'example video', 'video-embed-thumbnail-generator' ) . '"';
			}
			if ( ! empty( $this->options['embedcode'] ) ) {
				$shortcode .= ' embedcode="' . esc_attr__( 'Sample Embed Code', 'video-embed-thumbnail-generator' ) . '"';
			}
			$shortcode .= ' caption="' . esc_attr__( "If text is entered in the attachment's caption field it is displayed here automatically.", 'video-embed-thumbnail-generator' ) . '"';
			if ( ! empty( $this->options['downloadlink'] ) ) {
				$shortcode .= ' downloadlink="true"';
			}
		}

		$shortcode .= ']' . esc_url( $url ) . '[/videopack]';

		return (string) $shortcode;
	}

	/**
	 * Retrieves the medium size thumbnail URL for an attachment.
	 *
	 * @param int $id The attachment ID.
	 * @return string The medium thumbnail URL.
	 */
	public function get_attachment_medium_url( $id ) {

		$medium_array = image_downsize( (int) $id, 'medium' );
		$medium_path  = is_array( $medium_array ) ? (string) $medium_array[0] : '';

		return $medium_path;
	}

	/**
	 * Overwrites the default [video] shortcode if configured.
	 */
	public function overwrite_video_shortcode() {

		if ( ! empty( $this->options['replace_video_shortcode'] ) ) {
			remove_shortcode( 'video' );
			add_shortcode( 'video', array( $this, 'replace_video_shortcode' ) );
		}
	}

	/**
	 * Replaces the default [video] shortcode with Videopack's handler.
	 *
	 * @param array|string $atts    The shortcode attributes.
	 * @param string       $content The shortcode content.
	 * @return string The rendered player HTML.
	 */
	public function replace_video_shortcode( $atts, $content = '' ) {

		$src_atts = array( 'src', 'mp4', 'm4v', 'webm', 'ogv', 'wmv', 'flv' );
		foreach ( $src_atts as $src_key ) {
			if ( is_array( $atts ) && array_key_exists( $src_key, $atts ) ) {
				$content = (string) $atts[ $src_key ];
				break;
			}
		}

		return (string) $this->do( $atts, (string) $content );
	}

	/**
	 * Replaces the default core/video block with Videopack's handler.
	 *
	 * @param string $block_content The block content.
	 * @param array  $block         The full block, including name and attributes.
	 * @return string The rendered player HTML.
	 */
	public function replace_video_block( $block_content, $block ) {

		if ( 'core/video' === (string) ( $block['blockName'] ?? '' ) && ! empty( $this->options['replace_video_block'] ) ) {
			$atts = (array) ( $block['attrs'] ?? array() );

			$id      = $atts['id'] ?? null;
			$content = $atts['src'] ?? '';

			if ( ! empty( $id ) ) {
				$atts['id'] = (int) $id;
			}

			// Fallback: Parse attributes from the original HTML if they are missing from the block attrs array.
			// This is useful for core/video blocks which might not have all attributes in the comment delimiter.
			foreach ( array( 'autoplay', 'muted', 'loop', 'controls', 'playsInline' ) as $attr ) {
				if ( ! isset( $atts[ $attr ] ) && preg_match( '/\s' . $attr . '(?:\s|>|=)/i', $block_content ) ) {
					$atts[ $attr ] = true;
				}
			}

			// Map common core attributes to Videopack equivalents.
			$mapping = array(
				'autoPlay'    => 'autoplay',
				'playsInline' => 'playsinline',
				'mute'        => 'muted',
			);

			foreach ( $mapping as $core_key => $videopack_key ) {
				if ( isset( $atts[ $core_key ] ) && ! isset( $atts[ $videopack_key ] ) ) {
					$atts[ $videopack_key ] = $atts[ $core_key ];
				}
			}

			// Map core 'tracks' to Videopack 'text_tracks'.
			if ( ! empty( $atts['tracks'] ) ) {
				$atts['text_tracks'] = (array) $atts['tracks'];
				unset( $atts['tracks'] );
			}

			// Ensure boolean attributes are actually booleans or mapped strings for the shortcode handler.
			$boolean_atts = array( 'autoplay', 'muted', 'loop', 'controls', 'playsinline' );
			foreach ( $boolean_atts as $att ) {
				if ( array_key_exists( $att, $atts ) ) {
					$atts[ $att ] = (bool) $atts[ $att ] ? 'true' : 'false';
				}
			}

			$player_code = (string) $this->do( $atts, (string) $content );

			// Preserve the caption if it exists, matching the core block structure.
			if ( ! empty( $atts['caption'] ) ) {
				$figure_classes = 'wp-block-video';
				if ( ! empty( $atts['align'] ) ) {
					$figure_classes .= ' align' . (string) $atts['align'];
				}
				if ( ! empty( $atts['className'] ) ) {
					$figure_classes .= ' ' . (string) $atts['className'];
				}

				$player_code = sprintf(
					'<figure class="%1$s">%2$s<figcaption class="wp-element-caption">%3$s</figcaption></figure>',
					esc_attr( $figure_classes ),
					$player_code,
					(string) $atts['caption']
				);
			}

			return $player_code;
		}

		return (string) $block_content;
	}
}
