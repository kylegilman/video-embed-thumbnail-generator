<?php

namespace Videopack\Frontend;

use WP_Hook;

class Gallery {
	/**
	 * Videopack Options manager class instance
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;
	protected $options;
	protected $attachment_meta;

	public function __construct( \Videopack\Admin\Options $options_manager ) {

		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->attachment_meta = new \Videopack\Admin\Attachment_Meta( $options_manager );
	}

	public function get_gallery_videos( $page_number, $query_atts ) {

		if ( $query_atts['gallery_orderby'] == 'menu_order' ) {
			$query_atts['gallery_orderby'] = 'menu_order ID';
		}
		if ( $query_atts['gallery_pagination'] != true
			&& empty( $query_atts['gallery_per_page'] )
			|| $query_atts['gallery_per_page'] == 'false'
		) {
			$query_atts['gallery_per_page'] = -1;
		}

		$args = array(
			'post_type'      => 'attachment',
			'orderby'        => $query_atts['gallery_orderby'],
			'order'          => $query_atts['gallery_order'],
			'post_mime_type' => 'video',
			'posts_per_page' => $query_atts['gallery_per_page'],
			'paged'          => $page_number,
			'post_status'    => 'published',
			'post_parent'    => $query_atts['gallery_id'],
			'meta_query'     => array(
				'relation' => 'AND',
				array(
					'key'     => '_kgflashmediaplayer-externalurl',
					'compare' => 'NOT EXISTS',
				),
				array(
					'key'     => '_kgflashmediaplayer-format',
					'compare' => 'NOT EXISTS',
				),
			),
		);

		if ( ! empty( $query_atts['gallery_exclude'] ) ) {
			$exclude_arr = wp_parse_id_list( $query_atts['gallery_exclude'] );
			if ( ! empty( $exclude_arr ) ) {
				$args['post__not_in'] = $exclude_arr;
			}
		}

		if ( ! empty( $query_atts['gallery_include'] ) ) {
			$include_arr = wp_parse_id_list( $query_atts['gallery_include'] );
			if ( ! empty( $include_arr ) ) {
				$args['post__in'] = $include_arr;
				if ( $args['orderby'] == 'menu_order ID' ) {
					$args['orderby'] = 'post__in'; // sort by order of IDs in the gallery_include parameter
				}
				unset( $args['post_parent'] );
			}
		}

		$attachments = new \WP_Query( $args );

		if ( $attachments->have_posts() ) {
			return $attachments;
		}

		return new \WP_Query(
			array(
				'post__in' => array( 0 ), // No post has the ID of 0.
			)
		);
	}

	public function gallery_page( $page_number, $query_atts, $last_video_id = 0 ) {

		global $kgvid_video_id;
		if ( ! $kgvid_video_id ) {
			$kgvid_video_id = $last_video_id + 1;
		}

		$code = '';

		$attachments = $this->get_gallery_videos( $page_number, $query_atts );

		if ( $attachments->have_posts() ) {

			foreach ( $attachments->posts as $attachment ) {

				$thumbnail_url    = get_post_meta( $attachment->ID, '_kgflashmediaplayer-poster', true );
				$poster_id        = get_post_meta( $attachment->ID, '_kgflashmediaplayer-poster-id', true );
				$thumbnail_srcset = false;

				if ( ! empty( $poster_id ) ) {
					$thumbnail_url    = wp_get_attachment_url( $poster_id );
					$thumbnail_srcset = wp_get_attachment_image_srcset( $poster_id );
					if ( intval( $query_atts['gallery_thumb'] ) <= get_option( 'medium_size_h' ) ) {
						$thumbnail_url = ( new Shortcode( $this->options_manager ) )->get_attachment_medium_url( $poster_id );
						//use the "medium" size image if available
					}
				}
				if ( ! $thumbnail_url ) {
					$thumbnail_url = $this->options['poster'];
				} //use the default poster if no thumbnail set
				if ( ! $thumbnail_url ) {
					$thumbnail_url = plugins_url( '/images/nothumbnail.jpg', __DIR__ );} //use the blank image if no other option

				if ( is_admin() && defined( 'DOING_AJAX' ) && DOING_AJAX ) {
					if ( $thumbnail_url ) {
						$thumbnail_url = set_url_scheme( $thumbnail_url );
					}
				}

				$below_video = 0;
				if ( ! empty( $attachment->post_excerpt )
					|| $query_atts['view_count'] == 'true'
				) {
					$below_video = 1;
				}

				$kgvid_postmeta = $this->attachment_meta->get( $attachment->ID );

				$play_button_html = '';

				if ( $this->options['embed_method'] == 'WordPress Default' ) {

					$library = apply_filters( 'wp_video_shortcode_library', 'mediaelement' );
					if ( 'mediaelement' === $library && did_action( 'init' ) ) {
						wp_enqueue_style( 'wp-mediaelement' );
						wp_enqueue_script( 'wp-mediaelement' );
					}

					$play_button_class = 'mejs-overlay-button';
					$play_scale        = strval( round( intval( $query_atts['gallery_thumb'] ) / 400, 2 ) );
					$play_translate    = 5;
				} else {
					$play_button_class = 'vjs-big-play-button';
					$play_scale        = strval( round( intval( $query_atts['gallery_thumb'] ) / 600, 2 ) );
					$play_translate    = 30;
				}

				$play_button_html = '<div class="' . esc_attr( $this->options['skin'] ) . '" ><button type="button" class="' . esc_attr( $play_button_class ) . '" style="-webkit-transform: scale(' . esc_attr( $play_scale ) . ') translateY(-' . esc_attr( $play_translate ) . 'px); -o-transform: scale(' . esc_attr( $play_scale ) . ') translateY(-' . esc_attr( $play_translate ) . 'px); -ms-transform: scale(' . esc_attr( $play_scale ) . ') translateY(-' . esc_attr( $play_translate ) . 'px); transform: scale(' . esc_attr( $play_scale ) . ') translateY(-' . esc_attr( $play_translate ) . 'px);"></button></div>';

				$dimensions = new \Videopack\Common\Video_Dimensions( $this->options_manager, $attachment->ID, true );

				$atts = array(
					'id'     => $attachment->ID,
					'width'  => $dimensions->width,
					'height' => $dimensions->height,
				);
				if ( $kgvid_postmeta['downloadlink'] == true ) {
					$atts['downloadlink'] = 'true';
				}

				$popup_atts = kgvid_shortcode_atts( $atts );
				if ( in_the_loop() ) {
					$post_id = get_the_ID();
				} else {
					$post_id = 1;
				}
				$content    = '';
				$player     = Video_Players\Player_Factory::create( $this->options_manager );
				$popup_code = $player->single_video_code( $popup_atts, $atts, $content, $post_id );
				preg_match( '/data-kgvid_video_vars=".*?"/', $popup_code, $video_vars );
				$popup_code = str_replace( array( "\r", "\n", "\t", $video_vars[0] ), '', $popup_code );

				if ( $this->options['skin'] == '' ) {
					$this->options['skin'] = 'vjs-default-skin';
				}
				if ( is_array( $query_atts ) && array_key_exists( 'skin', $query_atts ) ) {
					$this->options['skin'] = $query_atts['skin']; // allows user to set skin for individual videos using the skin="" attribute
				}

				$code .= '<div class="kgvid_video_gallery_thumb" onclick="kgvid_SetVideo(\'kgvid_' . esc_attr( $kgvid_video_id - 1 ) . '\')" id="kgvid_video_gallery_thumb_kgvid_' . strval( $kgvid_video_id - 1 ) . '" data-id="kgvid_' . esc_attr( $kgvid_video_id - 1 ) . '" data-width="' . esc_attr( $dimensions->width ) . '" data-height="' . esc_attr( $dimensions->height ) . '" data-meta="' . esc_attr( $below_video ) . '" data-gallery_end="' . esc_attr( $query_atts['gallery_end'] ) . '" data-popupcode="' . esc_attr( $popup_code ) . '" ' . $video_vars[0] . ' style="width:' . esc_attr( $query_atts['gallery_thumb'] ) . 'px;';

				$code .= '"><img';
				if ( ! empty( $thumbnail_srcset ) ) {
					$code .= ' srcset="' . esc_attr( $thumbnail_srcset ) . '"';
				}
				$code .= ' src="' . esc_url( $thumbnail_url ) . '"';
				$code .= ' alt="' . esc_attr( $attachment->post_title ) . '">' . $play_button_html;

				if ( $query_atts['gallery_title'] == 'true' ) {
					$code .= '<div class="titlebackground"><div class="videotitle">' . esc_html( $attachment->post_title ) . '</div></div>';
				}

				$code .= '</div>' . "\n\t\t\t";

			} //end attachment loop

			if ( $attachments->max_num_pages > 1 ) {

				$code .= '<div class="kgvid_gallery_pagination">';
				$code .= '<span class="kgvid_gallery_pagination_arrow"';
				if ( $page_number == 1 ) {
					$code .= ' style="visibility:hidden;"';
				}
				$code .= ' onclick="kgvid_switch_gallery_page(jQuery(this).siblings(\'.kgvid_gallery_pagination_selected\').prev(), \'none\');" title="' . esc_attr__( 'Previous', 'video-embed-thumbnail-generator' ) . '">&larr;</span> ';
				for ( $x = 1; $x <= $attachments->max_num_pages; $x++ ) {
					if ( $x == $page_number ) {
						$code .= '<span class="kgvid_gallery_pagination_selected">' . $x . '</span> ';
					} else {
						$code .= '<span class="kgvid_gallery_page_number" onclick="kgvid_switch_gallery_page(this, \'none\');">' . esc_html( $x ) . '</span> ';
					}
				}
				$code .= '<span class="kgvid_gallery_pagination_arrow"';
				if ( $page_number == $attachments->max_num_pages ) {
					$code .= ' style="visibility:hidden;"';
				}
				$code .= ' onclick="kgvid_switch_gallery_page(jQuery(this).siblings(\'.kgvid_gallery_pagination_selected\').next(), \'none\');" title="' . esc_attr__( 'Next', 'video-embed-thumbnail-generator' ) . '">&rarr;</span>';
				$code .= '</div>';

			}
		} //if there are attachments

		return apply_filters( 'kgvid_gallery_page', $code, $kgvid_video_id );
	}
}
