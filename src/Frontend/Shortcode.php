<?php

namespace Videopack\Frontend;

class Shortcode {

	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;
	protected $options;
	protected $player;

	public function __construct( \Videopack\Admin\Options $options_manager ) {
		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->player          = \Videopack\Frontend\Video_Players\Player_Factory::create( $options_manager );
	}

	public function add() {
		add_shortcode( 'videopack', array( $this, 'do' ) );
		add_shortcode( 'VIDEOPACK', array( $this, 'do' ) );
		add_shortcode( 'FMP', array( $this, 'do' ) );
		add_shortcode( 'KGVID', array( $this, 'do' ) );
	}

	public function atts( $atts ) {

		if ( in_the_loop() ) {
			$post_id = get_the_ID();
		} else {
			$post_id = 1;
		}

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

		$default_atts = array(
			'id'              => '',
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
		);

		$options_atts = array(
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
		);

		foreach ( $options_atts as $att ) {
			if ( array_key_exists( $att, $this->options ) ) {
				$default_atts[ $att ] = $this->options[ $att ];
			}
		}

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

		$checkbox_convert = array(
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
		);
		foreach ( $checkbox_convert as $query ) {
			if ( $query_atts[ $query ] == true ) {
				$query_atts[ $query ] = 'true';
			}
			if ( $query_atts[ $query ] == false ) {
				$query_atts[ $query ] = 'false';
			}
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

	public function do( $atts, $content = '' ) {

		$code       = '';
		$query_atts = '';

		if ( ! is_feed() ) {

			if ( substr( $this->options['embed_method'], 0, 8 ) !== 'Video.js' ) {
				$this->player->enqueue_scripts();
			}

			$post_id = get_the_ID();
			if ( $post_id == false ) {
				$post_id = get_queried_object_id();
			}

			$query_atts = $this->atts( $atts );

			if ( $query_atts['gallery'] != 'true' ) { // if this is not a pop-up gallery

				$code = ( new Video_Players\Player( $this->options_manager ) )->single_video_code( $query_atts, $atts, $content, $post_id );

			} else { // if gallery

				static $kgvid_gallery_id = 0;
				$gallery_query_index     = array(
					'gallery_orderby',
					'gallery_order',
					'gallery_id',
					'gallery_include',
					'gallery_exclude',
					'gallery_thumb',
					'view_count',
					'gallery_end',
					'gallery_pagination',
					'gallery_per_page',
					'gallery_title',
				);
				$gallery_query_atts      = array();
				foreach ( $gallery_query_index as $index ) {
					$gallery_query_atts[ $index ] = $query_atts[ $index ];
				}

				if ( $gallery_query_atts['gallery_orderby'] == 'rand' ) {
					$gallery_query_atts['gallery_orderby'] = 'RAND(' . rand() . ')'; // use the same seed on every page load
				}

				$aligncode = '';
				if ( $query_atts['align'] == 'left' ) {
					$aligncode = ' kgvid_textalign_left';
				}
				if ( $query_atts['align'] == 'center' ) {
					$aligncode = ' kgvid_textalign_center';
				}
				if ( $query_atts['align'] == 'right' ) {
					$aligncode = ' kgvid_textalign_right';
				}

				$code .= '<div class="kgvid_gallerywrapper' . esc_attr( $aligncode ) . '" id="kgvid_gallery_' . esc_attr( $kgvid_gallery_id ) . '" data-query_atts="' . esc_attr( wp_json_encode( $gallery_query_atts ) ) . '">';
				$code .= ( new Gallery( $this->options_manager ) )->gallery_page( 1, $gallery_query_atts );
				$code .= '</div>'; // end wrapper div

				++$kgvid_gallery_id;

			} //if gallery

			if ( substr( $this->options['embed_method'], 0, 8 ) === 'Video.js' ) {
				$this->player->enqueue_scripts();
			}
		} //if not feed

		$code = wp_kses( $code, ( new \Videopack\Common\Validate() )->allowed_html() );

		return apply_filters( 'kgvid_shortcode', $code, $query_atts, $content );
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

	public function generate_attachment_shortcode( $kgvid_video_embed ) {

		$post      = get_post();
		$shortcode = '';

		if ( is_array( $kgvid_video_embed )
			&& array_key_exists( 'id', $kgvid_video_embed )
		) {
			$post_id = $kgvid_video_embed['id'];
		} elseif ( $post && property_exists( $post, 'ID' ) ) {
			$post_id = $post->ID;
		} else {
			$post_id = 1;
		}

		$kgvid_postmeta = ( new \Videopack\Admin\Attachment_Meta( $this->options_manager ) )->get( $post_id );

		if ( is_array( $kgvid_video_embed )
			&& array_key_exists( 'sample', $kgvid_video_embed )
		) {
			$url = plugins_url( '/images/Adobestock_469037984.mp4', __DIR__ );
		} else {
			$url = wp_get_attachment_url( $post_id );
		}

		if ( is_array( $kgvid_video_embed )
			&& array_key_exists( 'gallery', $kgvid_video_embed )
		) {
			$gallery = true;
		} else {
			$gallery = false;
		}

		$shortcode = '[videopack';
		if ( is_array( $kgvid_video_embed )
			&& array_key_exists( 'enable', $kgvid_video_embed )
			&& $kgvid_video_embed['enable'] == 'true'
		) {
			$shortcode .= ' fullwidth="true"';
		}
		if ( $kgvid_postmeta['downloadlink'] == true ) {
			$shortcode .= ' downloadlink="true"';
		}
		if ( is_array( $kgvid_video_embed ) && array_key_exists( 'start', $kgvid_video_embed ) ) {
			$shortcode .= ' start="' . esc_attr( $kgvid_video_embed['start'] ) . '"';
		}
		if ( is_array( $kgvid_video_embed ) && array_key_exists( 'gallery', $kgvid_video_embed ) ) {
			$shortcode .= ' autoplay="true"';
		}
		if ( is_array( $kgvid_video_embed ) && array_key_exists( 'sample', $kgvid_video_embed ) ) {
			if ( $this->options['overlay_title'] == true ) {
				$shortcode .= ' title="' . esc_attr_x( 'Sample Video', 'example video', 'video-embed-thumbnail-generator' ) . '"';
			}
			if ( $this->options['overlay_embedcode'] == true ) {
				$shortcode .= ' embedcode="' . esc_attr__( 'Sample Embed Code', 'video-embed-thumbnail-generator' ) . '"';
			}
			$shortcode .= ' caption="' . esc_attr__( 'If text is entered in the attachment\'s caption field it is displayed here automatically.', 'video-embed-thumbnail-generator' ) . '"';
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
