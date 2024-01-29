<?php

namespace Videopack\Frontend;

class Metadata {

	protected $options;
	protected $attachment_meta;

	public function __construct() {
		$this->options         = \Videopack\Admin\Options::get_instance()->get_options();
		$this->attachment_meta = new \Videopack\Admin\Attachment_Meta();
	}

	public function get_first_embedded_video( $post ) {

		$url        = '';
		$attributes = array();

		$first_embedded_video_meta = get_post_meta( $post->ID, '_kgvid_first_embedded_video', true );

		if ( ! empty( $first_embedded_video_meta ) ) {

			if ( is_array( $first_embedded_video_meta['atts'] ) ) {
				$dataattributes = array_map( array( $this, 'build_paired_attributes' ), array_values( $first_embedded_video_meta['atts'] ), array_keys( $first_embedded_video_meta['atts'] ) );

				$dataattributes = ' ' . implode( ' ', $dataattributes );
			} else {
				$dataattributes = $first_embedded_video_meta['atts'];
			}

			$shortcode_text = '[videopack' . $dataattributes . ']' . $first_embedded_video_meta['content'] . '[/videopack]';

		} else {
			$shortcode_text = $post->post_content;
		}

		$pattern = get_shortcode_regex();
		preg_match_all( '/' . $pattern . '/s', $shortcode_text, $matches );

		if ( is_array( $matches )
			&& array_key_exists( 2, $matches )
			&& array_key_exists( 5, $matches )
			&& ( in_array( 'videopack', $matches[2] )
				|| in_array( 'VIDEOPACK', $matches[2] )
				|| in_array( 'KGVID', $matches[2] )
				|| in_array( 'FMP', $matches[2] )
			)
		) { // if videopack, KGVID, or FMP shortcode is in posts on this page.

			if ( isset( $matches ) ) {

				$shortcode_names = array(
					'videopack',
					'VIDEOPACK',
					'KGVID',
					'FMP',
				);

				$first_key = false;
				foreach ( $shortcode_names as $shortcode ) {
					$first_key = array_search( $shortcode, $matches[2] );
					if ( $first_key !== false ) {
						break;
					}
				}

				if ( $first_key !== false ) {

					$url = '';

					if ( array_key_exists( 3, $matches ) ) {
						$attributes = shortcode_parse_atts( $matches[3][ $first_key ] );
					}

					if ( is_array( $attributes )
						&& array_key_exists( 'id', $attributes )
					) {
						$url = wp_get_attachment_url( $attributes['id'] );
						//end if there's an ID attribute
					} elseif ( ! empty( $matches[5][ $first_key ] ) ) { // there's a URL but no ID

						$url = $matches[5][ $first_key ];
						if ( ! is_array( $attributes ) ) {
							$attributes = array();
						}
						$attributes['id'] = ( new \Videopack\Admin\Attachment() )->url_to_id( $matches[5][ $first_key ] );

					} elseif (
						( is_array( $attributes )
							&& ! array_key_exists( 'id', $attributes )
						)
						|| empty( $attributes )
					) {

						$args             = array(
							'numberposts'    => 1,
							'post_mime_type' => 'video',
							'post_parent'    => $post->ID,
							'post_status'    => null,
							'post_type'      => 'attachment',
						);
						$video_attachment = get_posts( $args );

						if ( $video_attachment ) {
							if ( empty( $attributes ) ) {
								$attributes = array();
							}
							$attributes['id'] = $video_attachment[0]->ID;
							$url              = wp_get_attachment_url( $attributes['id'] );
						}
						//end if no URL or ID attribute
					}
					//if there's a KGVID shortcode in the post
				}
				//end if there's a shortcode in the post
			} elseif ( is_attachment() ) {
				$attributes['id']  = $post->ID;
				$attributes['url'] = wp_get_attachment_url( $post->ID );
			}

			if ( is_array( $attributes )
				&& array_key_exists( 'id', $attributes )
			) {

				$kgvid_postmeta           = $this->attachment_meta->get( $attributes['id'] );
				$kgvid_postmeta['poster'] = get_post_meta( $attributes['id'], '_kgflashmediaplayer-poster', true );
				$dimensions               = \Videopack\Common\Video_Dimensions::get( $attributes['id'] );
				$attributes               = array_merge( $dimensions, array_filter( $kgvid_postmeta ), $attributes );

			}
		}

		if ( ! is_array( $attributes ) ) {
			$attributes = array();
		}

		$attributes['url'] = $url;
		return $attributes;
	}

	public function print_scripts() {

		global $wp_query;
		if ( ! isset( $wp_query ) ) {
			return false;
		}

		if ( ! empty( $wp_query->posts )
			&& is_array( $wp_query->posts )
		) {
			foreach ( $wp_query->posts as $post ) {
				$first_embedded_video = $this->get_first_embedded_video( $post );
				if ( ! empty( $first_embedded_video['url'] ) ) { // if KGVID or FMP shortcode is in posts on this page.

					if ( $this->options['open_graph'] == true ) {

						remove_action( 'wp_head', 'jetpack_og_tags' );
						echo '<meta property="og:url" content="' . esc_url( get_permalink( $post ) ) . '" >' . "\n";
						echo '<meta property="og:title" content="' . esc_attr( get_the_title( $post ) ) . '" >' . "\n";
						echo '<meta property="og:description" content="' . esc_attr( $this->generate_video_description( $first_embedded_video, $post ) ) . '" >' . "\n";
						echo '<meta property="og:video" content="' . esc_url( $first_embedded_video['url'] ) . '" >' . "\n";
						$secure_url = str_replace( 'http://', 'https://', $first_embedded_video['url'] );
						echo '<meta property="og:video:secure_url" content="' . esc_url( $secure_url ) . '" >' . "\n";
						$mime_type_check = $this->attachment_meta->url_mime_type( $first_embedded_video['url'], $post->ID );
						echo '<meta property="og:video:type" content="' . esc_attr( $mime_type_check['type'] ) . '" >' . "\n";

						if ( array_key_exists( 'width', $first_embedded_video ) ) {
							echo '<meta property="og:video:width" content="' . esc_attr( $first_embedded_video['width'] ) . '" >' . "\n";
							if ( array_key_exists( 'height', $first_embedded_video ) ) {
								echo '<meta property="og:video:height" content="' . esc_attr( $first_embedded_video['height'] ) . '" >' . "\n";
							}
						}

						if ( array_key_exists( 'poster', $first_embedded_video ) ) {
							echo '<meta property="og:image" content="' . esc_url( $first_embedded_video['poster'] ) . '" >' . "\n";
							if ( array_key_exists( 'width', $first_embedded_video ) ) {
								echo '<meta property="og:image:width" content="' . esc_attr( $first_embedded_video['width'] ) . '" >' . "\n";
								if ( array_key_exists( 'height', $first_embedded_video ) ) {
									echo '<meta property="og:image:height" content="' . esc_attr( $first_embedded_video['height'] ) . '" >' . "\n";
								}
							}
						}
					}

					if ( $this->options['twitter_card'] == true
						&& array_key_exists( 'id', $first_embedded_video )
						&& ! empty( $first_embedded_video['id'] )
					) {

						add_filter( 'jetpack_disable_twitter_cards', '__return_true', 99 );

						echo '<meta name="twitter:card" content="player">' . "\n";
						if ( ! empty( $this->options['twitter_username'] ) ) {
							echo '<meta name="twitter:site" content="@' . esc_attr( $this->options['twitter_username'] ) . '">' . "\n";
						}
						echo '<meta name="twitter:title" content="' . esc_attr( $post->post_title ) . '">' . "\n";
						echo '<meta name="twitter:description" content="' . esc_attr( substr( $this->generate_video_description( $first_embedded_video, $post ), 0, 200 ) ) . '">' . "\n";
						if ( array_key_exists( 'poster', $first_embedded_video ) ) {
							echo '<meta name="twitter:image" content="' . esc_url( str_replace( 'http://', 'https://', $first_embedded_video['poster'] ) ) . '">' . "\n";
						}
						echo '<meta name="twitter:player" content="' . esc_url( str_replace( 'http://', 'https://', get_post_embed_url( $first_embedded_video['id'] ) ) ) . '">' . "\n";
						if ( array_key_exists( 'width', $first_embedded_video ) ) {
							echo '<meta name="twitter:player:width" content="' . esc_attr( $first_embedded_video['width'] ) . '">' . "\n";
						}
						if ( array_key_exists( 'height', $first_embedded_video ) ) {
							echo '<meta name="twitter:player:height" content="' . esc_attr( $first_embedded_video['height'] ) . '">' . "\n";
						}

						$encodevideo_info = kgvid_encodevideo_info( $first_embedded_video['url'], $first_embedded_video['id'] );
						$twitter_stream   = false;
						if ( array_key_exists( 'mobile', $encodevideo_info ) && $encodevideo_info['mobile']['exists'] ) {
							$twitter_stream = $encodevideo_info['mobile']['url'];
						} elseif ( get_post_mime_type( $first_embedded_video['id'] ) == 'video/mp4' ) {
							$twitter_stream = $first_embedded_video['url'];
						}
						if ( $twitter_stream ) {
							echo '<meta name="twitter:player:stream" content="' . esc_url( str_replace( 'http://', 'https://', $twitter_stream ) ) . '">' . "\n";
							echo '<meta name="twitter:player:stream:content_type" content="video/mp4; codecs=&quot;avc1.42E01E1, mp4a.40.2&quot;">' . "\n";
						}
					}

					break; // end execution after the first video embedded using the shortcode

				}//end if shortcode is in post or is attachment
			}//end post loop
		}//end if posts
	}

	public function build_paired_attributes( $value, $key ) {
		return $key . '="' . $value . '"';
	}

	public function generate_video_description( $query_atts, $post = false ) {

		if ( array_key_exists( 'description', $query_atts ) && ! empty( $query_atts['description'] ) && $query_atts['description'] != 'false' ) {
			$description = $query_atts['description'];
		} elseif ( array_key_exists( 'description', $query_atts ) && ! empty( $query_atts['caption'] ) && $query_atts['caption'] != 'false' ) {
			$description = $query_atts['caption'];
		} elseif ( $post != false || ( in_the_loop() && ! is_attachment() ) ) {

			if ( $post == false ) {
				$post = get_post();
			}

			$yoast_meta   = get_post_meta( $post->ID, '_yoast_wpseo_metadesc', true ); // try Yoast SEO meta description tag
			$aioseop_meta = get_post_meta( $post->ID, '_aioseop_description', true ); // try All in one SEO Pack meta description tag

			if ( ! empty( $yoast_meta ) ) {
				$description = $yoast_meta;
			} elseif ( ! empty( $aioseop_meta ) ) {
				$description = $aioseop_meta;
			} elseif ( ! empty( $post->post_excerpt ) ) {
				$description = $post->post_excerpt;
			} else {
				$description = wp_trim_words( wp_strip_all_tags( strip_shortcodes( $post->post_content ), true ) );
			}
		}
		if ( empty( $description ) ) {
			$description = esc_html__( 'Video', 'video-embed-thumbnail-generator' );
		}

		return apply_filters( 'videopack_generate_video_description', $description, $query_atts );
	}

	public function clear_first_embedded_video_meta() {

		global $kgvid_video_id;
		$post = get_post();

		if ( $kgvid_video_id == null && $post ) { // there's no Videopack video on this page
			$first_embedded_video_meta = get_post_meta( $post->ID, '_kgvid_first_embedded_video', true );
			if ( ! empty( $first_embedded_video_meta ) ) {
				delete_post_meta( $post->ID, '_kgvid_first_embedded_video' );
			}
		}
	}
}
