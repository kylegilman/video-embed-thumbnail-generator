<?php

namespace Videopack\Frontend;

class Shortcode {

	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;
	protected $options;

	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
	}

	public function add() {
		add_shortcode( 'videopack', array( $this, 'do' ) );
		add_shortcode( 'VIDEOPACK', array( $this, 'do' ) );
		add_shortcode( 'FMP', array( $this, 'do' ) );
		add_shortcode( 'KGVID', array( $this, 'do' ) );
	}

	private function get_attribute_definitions() {
		if ( in_the_loop() ) {
			$post_id = get_the_ID();
		} else {
			$post_id = 1;
		}

		return array(
			'default_atts'     => array(
				'id'              => null,
				'orderby'         => 'menu_order ID',
				'order'           => 'ASC',
				'videos'          => -1,
				'start'           => '',
				'gallery'         => 'false',
				'gallery_orderby' => 'menu_order ID',
				'gallery_order'   => 'ASC',
				'gallery_exclude' => '',
				'gallery_include' => '',
				'gallery_id'      => $post_id,
				'caption'         => '',
				'description'     => '',
				'track_kind'      => 'subtitles',
				'track_srclang'   => substr( get_bloginfo( 'language' ), 0, 2 ),
				'track_src'       => '',
				'track_label'     => get_bloginfo( 'language' ),
				'track_default'   => '',
			),
			'options_atts'     => array(
				'width',
				'height',
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
				'skin',
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
				'title',
				'embedcode',
				'embeddable',
				'view_count',
				'count_views',
				'inline',
				'downloadlink',
				'right_click',
				'resize',
				'auto_res',
				'pixel_ratio',
				'nativecontrolsfortouch',
				'schema',
				'gallery_thumb',
			),
			'checkbox_convert' => array(
				'endofvideooverlaysame',
				'loop',
				'playsinline',
				'autoplay',
				'controls',
				'pauseothervideos',
				'title',
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
			),
		);
	}

	public function get_block_attributes() {
		$definitions = $this->get_attribute_definitions();
		$default_atts = $definitions['default_atts'];
		$options_atts = $definitions['options_atts'];
		$checkbox_convert = $definitions['checkbox_convert'];

		$attributes = array();

		// Add 'src' as a special case attribute for the block editor.
		$attributes['src'] = array(
			'type' => 'string',
			'default' => '',
		);

		foreach ( $default_atts as $key => $value ) {
			$type = 'string';
			if ( is_bool( $value ) ) {
				$type = 'boolean';
			} elseif ( is_numeric( $value ) ) {
				$type = 'number';
			}
			$attributes[ $key ] = array(
				'type' => $type,
				'default' => $value,
			);
		}

		foreach ( $options_atts as $att ) {
			if ( array_key_exists( $att, $this->options ) ) {
				$attributes[ $att ] = array(
					'type' => is_bool( $this->options[ $att ] ) ? 'boolean' : ( is_numeric( $this->options[ $att ] ) ? 'number' : 'string' ),
					'default' => $this->options[ $att ],
				);
			} else {
				$attributes[ $att ] = array(
					'type' => 'string',
				);
			}
		}

		foreach ( $checkbox_convert as $key ) {
			if ( isset( $attributes[ $key ] ) ) {
				$attributes[ $key ]['type'] = 'boolean';
			} else {
				$attributes[ $key ] = array(
					'type' => 'boolean',
				);
			}
		}

		$attributes['id']['type'] = array( 'number', 'string' );

		return apply_filters( 'videopack_block_attributes', $attributes );
	}

	public function atts( $atts ) {

		$definitions = $this->get_attribute_definitions();
		$default_atts = $definitions['default_atts'];
		$options_atts = $definitions['options_atts'];
		$checkbox_convert = $definitions['checkbox_convert'];

		$deprecated_atts = array(
			'controlbar'    => 'controls',
			'mute'          => 'muted',
			'gallery_thumb' => 'gallery_columns',
		);

		if ( is_array( $atts ) ) {

			foreach ( $deprecated_atts as $deprecated_att => $new_att ) { // loop through old atts and convert to new ones

				if ( array_key_exists( $deprecated_att, $atts ) ) {

					$atts[ $new_att ] = $atts[ $deprecated_att ];

					if ( $new_att == 'controls' ) {

						if ( $atts['controls'] == 'none' ) {
							$atts['controls'] = 'false';
						} else {
							$atts['controls'] = 'true';
						}
					}

					if ( $new_att === 'gallery_columns' ) {
						//convert thumbnail width to columns per row based on arbitrary 1000px width window
						$atts['gallery_columns'] = round( 1000 / intval( $atts['gallery_columns'] ) );
					}
				}
			}
		}

		$option_defaults = array();
		foreach ( $options_atts as $att ) {
			if ( array_key_exists( $att, $this->options ) ) {
				$option_defaults[ $att ] = $this->options[ $att ];
			}
		}

		$default_atts = array_merge( $default_atts, $option_defaults );
		$default_atts = apply_filters( 'videopack_default_shortcode_atts', $default_atts );

		$query_atts = shortcode_atts( $default_atts, $atts, 'videopack' );

		$kgvid_video_embed_query_var = get_query_var( 'videopack' ); // variables in URL
		if ( empty( $kgvid_video_embed_query_var ) ) {
			$kgvid_video_embed_query_var = get_query_var( 'kgvid_video_embed' ); // check the old query variable
		}

		if ( ! empty( $kgvid_video_embed_query_var ) ) {

			$allowed_query_var_atts = array( // attributes that can be changed via URL
				'auto_res',
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

			$allowed_query_var_atts = apply_filters( 'kgvid_allowed_query_var_atts', $allowed_query_var_atts );

			foreach ( $kgvid_video_embed_query_var as $key => $value ) {
				if ( in_array( $key, $allowed_query_var_atts ) ) {
					$query_atts[ $key ] = $value;
				}
			}
		}

		// Convert boolean-like attributes to booleans
		foreach ( $checkbox_convert as $key ) {
			if ( isset( $query_atts[ $key ] ) && is_string( $query_atts[ $key ] ) ) {
				if ( strtolower( $query_atts[ $key ] ) === 'true' ) {
					$query_atts[ $key ] = true;
				} elseif ( strtolower( $query_atts[ $key ] ) === 'false' ) {
					$query_atts[ $key ] = false;
				}
			}
		}

		// Ensure gallery_thumb is always an integer
		if ( isset( $query_atts['gallery_thumb'] ) ) {
			$query_atts['gallery_thumb'] = intval( $query_atts['gallery_thumb'] );
		}

		if ( $query_atts['auto_res'] == 'true' ) {
			$query_atts['auto_res'] = 'automatic';
		} //if anyone used auto_res in the shortcode before version 4.4.3
		if ( $query_atts['auto_res'] == 'false' ) {
			$query_atts['auto_res'] = 'highest';
		}
		if ( $query_atts['orderby'] == 'menu_order' ) {
			$query_atts['orderby'] = 'menu_order ID';
		}
		if ( $query_atts['track_default'] == 'true' ) {
			$query_atts['track_default'] = 'default';
		}
		if ( $query_atts['count_views'] == 'false' ) {
			$query_atts['view_count'] = 'false';
		}

		return apply_filters( 'videopack_shortcode_atts', $query_atts );
	}

	/**
	 * Get the final, resolved attributes for a video.
	 *
	 * This method consolidates the logic for determining the final attributes for a video,
	 * merging defaults, user-provided attributes, and data from the video source itself.
	 *
	 * @param array                           $atts   The raw shortcode attributes.
	 * @param \Videopack\Video_Source\Source $source The video source object.
	 * @return array The final, resolved attributes.
	 */
	public function get_final_atts( array $atts, \Videopack\Video_Source\Source $source ): array {
		$query_atts = $this->atts( $atts );

		// Populate shortcode attributes with data from the Source object, if not already set by the user.
		if ( empty( $query_atts['poster'] ) ) {
			$query_atts['poster'] = $source->get_poster();
		}
		if ( empty( $query_atts['title'] ) ) {
			$query_atts['title'] = $source->get_title();
		}
		if ( empty( $query_atts['caption'] ) ) {
			$query_atts['caption'] = $source->get_caption();
		}
		if ( empty( $query_atts['description'] ) ) {
			$query_atts['description'] = $source->get_description();
		}
		// Handle text tracks.
		if ( ! empty( $query_atts['track_src'] ) ) {
			// If a single track is defined by shortcode attributes, use it.
			$query_atts['tracks'] = array(
				array(
					'kind'    => $query_atts['track_kind'],
					'srclang' => $query_atts['track_srclang'],
					'src'     => $query_atts['track_src'],
					'label'   => $query_atts['track_label'],
					'default' => $query_atts['track_default'],
				),
			);
		} else {
			// Otherwise, get all tracks from the source's metadata.
			$query_atts['tracks'] = $source->get_tracks();
		}
		if ( empty( $query_atts['view_count'] ) ) {
			$query_atts['view_count'] = $source->get_views();
		}

		// Determine if the video is countable (i.e., an attachment).
		$query_atts['countable'] = is_numeric( $source->get_id() );

		// Set the title for statistics, using the attachment title or URL basename as a fallback.
		if ( empty( $query_atts['stats_title'] ) ) {
			$query_atts['stats_title'] = $source->get_title();
			if ( empty( $query_atts['stats_title'] ) ) {
				$query_atts['stats_title'] = basename( $source->get_url() );
			}
		}

		// Set default dimensions from source if not provided in shortcode.
		if ( empty( $atts['width'] ) && $source->get_width() ) {
			$query_atts['width'] = $source->get_width();
		}
		if ( empty( $atts['height'] ) && $source->get_height() ) {
			$query_atts['height'] = $source->get_height();
		}

		// Apply GIF mode overrides if enabled.
		if ( $query_atts['gifmode'] === true ) {
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
			$gifmode_atts = apply_filters( 'kgvid_gifmode_atts', $gifmode_atts ); // Consider updating filter name.
			$query_atts   = array_merge( $query_atts, $gifmode_atts );
		}

		// Handle responsive width/height and fixed aspect ratio.
		if ( $query_atts['width'] === '100%' ) {
			$query_atts['width']     = $this->options['width'];
			$query_atts['height']    = $this->options['height'];
			$query_atts['fullwidth'] = 'true';
		}

		// Ensure gallery_thumb is always set and is an integer
		if ( ! isset( $query_atts['gallery_thumb'] ) ) {
			$query_atts['gallery_thumb'] = isset( $this->options['gallery_thumb'] ) ? intval( $this->options['gallery_thumb'] ) : 200;
		} else {
			$query_atts['gallery_thumb'] = intval( $query_atts['gallery_thumb'] );
		}

		return $query_atts;
	}

	public function do( $atts, $content = '' ) {

		$query_atts = $this->atts( $atts );

		if ( is_feed() ) {
			return '';
		}

		if ( isset( $query_atts['gallery'] ) && true === $query_atts['gallery'] ) {
			if ( isset( $query_atts['gallery_orderby'] ) && 'rand' === $query_atts['gallery_orderby'] ) {
				$query_atts['gallery_orderby'] = 'RAND(' . rand() . ')';
			}
			$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $this->options['embed_method'], $this->options_manager );
			$player->enqueue_scripts();

			$gallery = new Gallery( $this->options_manager );
			$code    = $gallery->gallery_page( 1, $query_atts );
		} else {
			$post_id = get_the_ID();
			if ( ! $post_id ) {
				$post_id = get_queried_object_id();
			}

			// Determine the video source based on shortcode attributes or content
			$source_input = '';
			if ( ! empty( $query_atts['id'] ) ) {
				$source_input = $query_atts['id'];
			} elseif ( ! empty( $content ) ) {
				// Workaround for relative video URL
				if ( substr( $content, 0, 1 ) === '/' ) {
					$content = get_bloginfo( 'url' ) . $content;
				}
				$source_input = trim( $content );
			} else {
				// If no explicit source, try to find the first video attachment of the current post
				$args              = array(
					'numberposts'    => 1,
					'post_mime_type' => 'video',
					'post_parent'    => $post_id,
					'post_status'    => null,
					'post_type'      => 'attachment', // phpcs:ignore
					'orderby'        => $query_atts['orderby'],
					'order'          => $query_atts['order'],
				);
				$video_attachments = get_posts( $args );
				if ( $video_attachments ) {
					$source_input = $video_attachments[0]->ID;
				} else {
					return ''; // No video source found, return empty
				}
			}

			// Create the Source object
			$source = \Videopack\Video_Source\Source_Factory::create( $source_input, $this->options_manager, null, null, $post_id );

			if ( ! $source || ! $source->exists() ) {
				return ''; // Source not found or doesn't exist
			}

			// Get the final, resolved attributes for the video.
			$query_atts = $this->get_final_atts( $atts, $source );

			// Determine the player type based on shortcode attribute or global option
			if ( isset( $query_atts['embed_method'] ) ) {
				$player_type = $query_atts['embed_method'];
			} else {
				$player_type = $this->options['embed_method'];
			}
			$player = \Videopack\Frontend\Video_Players\Player_Factory::create( $player_type, $this->options_manager );

			// Set the source and final attributes on the player instance
			$player->set_source( $source );
			$player->set_atts( $query_atts );

			// Enqueue player-specific scripts and styles
			// This ensures the correct player's assets are loaded when its shortcode is used.
			$player->enqueue_scripts();

			// Get the generated HTML code for the video player
			$code = $player->get_player_code( $query_atts );
		}

		$code = wp_kses( $code, ( new \Videopack\Common\Validate() )->allowed_html() );

		return apply_filters( 'videopack_shortcode', $code, $query_atts, $content );
	}

	public function no_texturize( $shortcodes ) {
		$shortcodes[] = 'KGVID';
		$shortcodes[] = 'FMP';
		$shortcodes[] = 'videopack';
		$shortcodes[] = 'VIDEOPACK';
		return $shortcodes;
	}

	public function add_query_vars( $qvars ) {
		// add videopack variable for passing information using URL queries
		$qvars[] = 'videopack';
		$qvars[] = 'kgvid_video_embed'; // old query variable
		return $qvars;
	}

	public function generate_attachment_shortcode( $videopack_video_embed ) {

		$post      = get_post();
		$shortcode = '';

		if ( is_array( $videopack_video_embed )
			&& array_key_exists( 'id', $videopack_video_embed )
		) {
			$post_id = $videopack_video_embed['id'];
		} elseif ( $post && property_exists( $post, 'ID' ) ) {
			$post_id = $post->ID;
		} else {
			$post_id = 1;
		}

		$videopack_postmeta = ( new \Videopack\Admin\Attachment_Meta( $this->options_manager ) )->get( $post_id );

		if ( is_array( $videopack_video_embed )
			&& array_key_exists( 'sample', $videopack_video_embed )
		) {
			$url = plugins_url( '/images/Adobestock_469037984.mp4', __DIR__ );
		} else {
			$url = wp_get_attachment_url( $post_id );
		}

		if ( is_array( $videopack_video_embed )
			&& array_key_exists( 'gallery', $videopack_video_embed )
		) {
			$gallery = true;
		} else {
			$gallery = false;
		}

		$shortcode = '[videopack';
		if ( is_array( $videopack_video_embed )
			&& array_key_exists( 'enable', $videopack_video_embed )
			&& $videopack_video_embed['enable'] == 'true'
		) {
			$shortcode .= ' fullwidth="true"';
		}
		if ( $videopack_postmeta['downloadlink'] == true ) {
			$shortcode .= ' downloadlink="true"';
		}
		if ( is_array( $videopack_video_embed ) && array_key_exists( 'start', $videopack_video_embed ) ) {
			$shortcode .= ' start="' . esc_attr( $videopack_video_embed['start'] ) . '"';
		}
		if ( is_array( $videopack_video_embed ) && array_key_exists( 'gallery', $videopack_video_embed ) ) {
			$shortcode .= ' autoplay="true"';
		}
		if ( is_array( $videopack_video_embed ) && array_key_exists( 'sample', $videopack_video_embed ) ) {
			if ( $this->options['overlay_title'] == true ) {
				$shortcode .= ' title="' . esc_attr_x( 'Sample Video', 'example video', 'video-embed-thumbnail-generator' ) . '"';
			}
			if ( $this->options['embedcode'] == true ) {
				$shortcode .= ' embedcode="' . esc_attr__( 'Sample Embed Code', 'video-embed-thumbnail-generator' ) . '"';
			}
			$shortcode .= ' caption="' . esc_attr__( "If text is entered in the attachment's caption field it is displayed here automatically.", 'video-embed-thumbnail-generator' ) . '"';
			if ( $this->options['downloadlink'] == true ) {
				$shortcode .= ' downloadlink="true"';
			}
		}

		$shortcode .= ']' . esc_url( $url ) . '[/videopack]';

		return $shortcode;
	}

	public function get_attachment_medium_url( $id ) {

		$medium_array = image_downsize( $id, 'medium' );
		$medium_path  = $medium_array[0];

		return $medium_path;
	}

	public function overwrite_video_shortcode() {

		if ( $this->options['replace_video_shortcode'] == true ) {
			remove_shortcode( 'video' );
			add_shortcode( 'video', array( $this, 'replace_video_shortcode' ) );
		}
	}

	public function replace_video_shortcode( $atts, $content = '' ) {

		$src_atts = array( 'src', 'mp4', 'm4v', 'webm', 'ogv', 'wmv', 'flv' );
		foreach ( $src_atts as $src_key ) {
			if ( is_array( $atts ) && array_key_exists( $src_key, $atts ) ) {
				$content = $atts[ $src_key ];
				break;
			}
		}

		return $this->do( $atts, $content );
	}
}
