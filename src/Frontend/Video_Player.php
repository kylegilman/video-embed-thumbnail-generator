<?php

namespace Videopack\Frontend;

use Videopack\Admin\Attachment;

class Video_Player {

	protected $options;
	protected $shortcode;

	public function __construct() {
		$this->options = \Videopack\Admin\Options::get_instance()->get_options();
		$this->shortcode = new \Videopack\Frontend\Shortcode();
	}

	public function compatible_extensions() {

		$compatible = array(
			'mp4',
			'mov',
			'm4v',
			'ogv',
			'ogg',
			'webm',
			'mkv',
			'mpd',
			'm3u8',
		);

		return apply_filters( 'videopack_compatible_extensions', $compatible );
	}

	public function prepare_sources( $content, $id, $block_id = false ) {

		global $kgvid_video_id;

		$enable_resolutions_plugin = false;
		$x                         = 20;
		$h264_resolutions          = array();
		$mp4already                = false;
		$video_formats             = kgvid_video_formats( false, true, false );
		$encodevideo_info          = kgvid_encodevideo_info( $content, $id );

		if ( is_numeric( $id ) ) {
			$dimensions = \Videopack\Common\Video_Dimensions::get( $id );
		} else {
			$dimensions = false;
		}

		$video_formats  = kgvid_video_formats( false, true, false );
		$compatible     = $this->compatible_extensions();
		$h264compatible = array(
			'mp4',
			'mov',
			'm4v',
			'mkv',
		);

		if ( $block_id !== false ) {
			$player_id = $block_id;
		} else {
			$player_id = $kgvid_video_id;
		}

		$mime_type_check = ( new \Videopack\Admin\Attachment_Meta() )->url_mime_type( $content, $id );
		if ( is_array( $mime_type_check ) && in_array( $mime_type_check['ext'], $h264compatible ) ) {
			$format_type = 'h264';
			$mime_type   = 'video/mp4';
		} else {
			$format_type = $mime_type_check['ext'];
			$mime_type   = $mime_type_check['type'];
		}

		unset( $video_formats['fullres'] );
		$video_formats = array(
			'original' => array(
				'type'  => $format_type,
				'mime'  => $mime_type,
				'name'  => 'Full',
				'label' => esc_html_x( 'Full', 'Full resolution', 'video-embed-thumbnail-generator' ),
			),
		) + $video_formats;

		if ( in_array( $mime_type_check['ext'], $compatible ) ) {

			$encodevideo_info['original']['exists'] = true;
			$encodevideo_info['original']['url']    = $content;

			if ( is_array( $dimensions )
				&& array_key_exists( 'actualheight', $dimensions )
				&& ! empty( $dimensions['actualheight'] )
			) {
				$video_formats['original']['label']     = $dimensions['actualheight'] . 'p';
				$video_formats['original']['height']    = $dimensions['actualheight'];
				$encodevideo_info['original']['height'] = $dimensions['actualheight'];
			}
		} else {
			$encodevideo_info['original']['exists'] = false;
		}
		$encodevideo_info['original']['encoding'] = false;

		if ( is_admin() && defined( 'DOING_AJAX' ) && DOING_AJAX ) {

			foreach ( $video_formats as $format => $format_stats ) {

				if ( array_key_exists( $format, $encodevideo_info ) && is_array( $encodevideo_info[ $format ] ) && array_key_exists( 'url', $encodevideo_info[ $format ] ) ) {
					$encodevideo_info[ $format ]['url'] = set_url_scheme( $encodevideo_info[ $format ]['url'] );
				}
			}
		}

		foreach ( $video_formats as $format => $format_stats ) {
			if ( $format != 'original'
				&& $encodevideo_info[ $format ]['url'] == $content
			) {
				continue; // don't double up on non-H.264 video sources
			}
			if ( $encodevideo_info[ $format ]['exists']
				&& $encodevideo_info[ $format ]['encoding'] == false
			) {

				if ( array_key_exists( 'height', $encodevideo_info[ $format ] ) && $format_stats['type'] == 'h264' ) {
					$source_key            = $encodevideo_info[ $format ]['height'];
					if ( $this->options['embed_method'] == 'WordPress Default' ) {
						$format_stats['label'] = $encodevideo_info[ $format ]['height'] . 'p';
					} else {
						$format_stats['label'] = str_replace( $format_stats['height'], $encodevideo_info[ $format ]['height'], $format_stats['label'] );
					}
				} else {
					$source_key = $x;
				}

				if ( strpos( $encodevideo_info[ $format ]['url'], '?' ) === false ) { // if there isn't already a query string in this URL
					$encodevideo_info[ $format ]['url'] = $encodevideo_info[ $format ]['url'] . '?id=' . $player_id;
				}
				$sources_data[ $source_key ]['src'] = esc_url( $encodevideo_info[ $format ]['url'] );
				$sources_data[ $source_key ]['type'] = esc_attr( $format_stats['mime'] );
				if ( $format == 'vp9' ) {
					$sources_data[ $source_key ]['codecs'] = 'vp9, vorbis';
				}
				if ( $format_stats['type'] == 'h264' ) {
					$sources_data[ $source_key ]['res'] = esc_attr( $format_stats['label'] );
					if ( $mp4already ) { // there is more than one resolution available
						$enable_resolutions_plugin = true;
					}
					$h264_resolutions[] = $format_stats['label'];
				} else {
					$sources_data[ $source_key ]['res'] = esc_attr( $format_stats['name'] );
				}

				if ( $this->options['embed_method'] == 'WordPress Default'
					&& (
						$format_stats['type'] != 'h264'
						|| ! $mp4already
					)
				) { // build wp_video_shortcode attributes. Sources will be replaced later
					$shortcode_type                 = kgvid_url_mime_type( $encodevideo_info[ $format ]['url'], $id );
					$attr[ $shortcode_type['ext'] ] = $encodevideo_info[ $format ]['url'];
				}
				if ( $format_stats['type'] == 'h264' ) {
					$mp4already = true;
				}
			}
			--$x;
		}
		krsort( $sources_data );
		natsort( $h264_resolutions );

		$ffmpeg_settings = array(
			'ffmpeg_exists'      => $this->options['ffmpeg_exists'] === true ? true : false,
			'browser_thumbnails' => $this->options['browser_thumbnails'] === true ? true : false,
		);

		return array(
			'sources_data'              => $sources_data,
			'h264_resolutions'          => $h264_resolutions,
			'enable_resolutions_plugin' => $enable_resolutions_plugin,
			'ffmpeg_settings'           => $ffmpeg_settings,
		);
	}

	public function prepare_video_vars( $query_atts, $id, $block_id = false ) {

		global $kgvid_video_id;

		if ( $block_id === false ) {
			$div_suffix = 'kgvid_' . strval( $kgvid_video_id );
		} else {
			$div_suffix = 'kgvid_' . strval( $block_id );
		}

		if (
			( $query_atts['title'] != 'false'
				|| $query_atts['embedcode'] != 'false'
				|| $query_atts['downloadlink'] == 'true'
				|| $this->options['twitter_button'] == true
				|| $this->options['facebook_button'] == true
			)
			&& $this->options['embed_method'] != 'None'
		) { // generate content overlaid on video
			$kgvid_meta = true;
		} else {
			$kgvid_meta = false;
		}

		$video_variables = array(
			'id'                => $div_suffix,
			'attachment_id'     => $id,
			'player_type'       => $this->options['embed_method'],
			'width'             => $query_atts['width'],
			'height'            => $query_atts['height'],
			'fullwidth'         => $query_atts['fullwidth'],
			'countable'         => $query_atts['countable'],
			'count_views'       => $query_atts['count_views'],
			'start'             => $query_atts['start'],
			'autoplay'          => $query_atts['autoplay'],
			'pauseothervideos'  => $query_atts['pauseothervideos'],
			'set_volume'        => $query_atts['volume'],
			'muted'             => $query_atts['muted'],
			'meta'              => $kgvid_meta,
			'endofvideooverlay' => $query_atts['endofvideooverlay'],
			'resize'            => $query_atts['resize'],
			'auto_res'          => $query_atts['auto_res'],
			'pixel_ratio'       => $query_atts['pixel_ratio'],
			'right_click'       => $query_atts['right_click'],
			'playback_rate'     => $query_atts['playback_rate'],
			'title'             => $query_atts['stats_title'],
		);

		if ( substr( $this->options['embed_method'], 0, 8 ) === 'Video.js'
			|| $this->options['embed_method'] === 'None'
		) {
			$video_variables['nativecontrolsfortouch'] = $query_atts['nativecontrolsfortouch'];
			$video_variables['locale']                 = kgvid_get_videojs_locale();
		}

		return apply_filters( 'kgvid_video_variables', $video_variables, $query_atts );
	}

	public function single_video_code( $query_atts, $atts, $content, $post_id ) {

		global $content_width;
		$content_width_save = $content_width;

		global $kgvid_video_id;
		if ( ! $kgvid_video_id ) {
			$kgvid_video_id = 0;
		}

		$code          = '';
		$id_array      = array();

		if ( ! empty( $query_atts['id'] ) ) {
			$id_array[0] = $query_atts['id'];
		} elseif ( empty( $content ) ) {

			if ( $post_id != 0 ) {
				$args              = array(
					'numberposts'    => $query_atts['videos'],
					'post_mime_type' => 'video',
					'post_parent'    => $post_id,
					'post_status'    => null,
					'post_type'      => 'attachment',
					'orderby'        => $query_atts['orderby'],
					'order'          => $query_atts['order'],
				);
				$video_attachments = get_posts( $args );
				if ( $video_attachments ) {
					foreach ( $video_attachments as $video ) {
						$id_array[] = $video->ID;
					}
				} else {
					return;
				} //if there are no video children of the current post
			} else {
				return;
			} //if there's no post ID and no $content
		} else { // $content is a URL
			// workaround for relative video URL (contributed by Lee Fernandes)
			if ( substr( $content, 0, 1 ) == '/' ) {
				$content = get_bloginfo( 'url' ) . $content;
			}
			$content     = apply_filters( 'kgvid_filter_url', trim( $content ) );
			$id_array[0] = ( new \Videopack\Admin\Attachment() )->url_to_id( $content );
		}

		$original_content = $content;

		foreach ( $id_array as $id ) { // loop through videos

			$query_atts = $this->shortcode->atts( $atts ); // reset values so they can be different with multiple videos
			$content    = $original_content;
			$dimensions = array();

			if ( $query_atts['gallery'] == 'false'
				&& $kgvid_video_id === 0
				&& $post_id != 0
			) {
				$first_embedded_video['atts']    = $atts;
				$first_embedded_video['content'] = $content;
				$first_embedded_video_meta       = get_post_meta( $post_id, '_kgvid_first_embedded_video', true );
				if ( $first_embedded_video_meta != $first_embedded_video ) {
					update_post_meta( $post_id, '_kgvid_first_embedded_video', $first_embedded_video );
				}
			}

			if ( ! empty( $id ) ) { // if the video is an attachment in the WordPress db

				$attachment_url = wp_get_attachment_url( $id );
				if ( $attachment_url == false ) {
					esc_html_e( 'Invalid video ID', 'video-embed-thumbnail-generator' );
					continue;
				}

				if ( $this->options['rewrite_attachment_url'] == true ) {

					$rewrite_url = true;

					// in case user doesn't know about this setting still check manually for popular CDNs like we used to
					$exempt_cdns = array(
						'amazonaws.com',
						'rackspace.com',
						'netdna-cdn.com',
						'nexcess-cdn.net',
						'limelight.com',
						'digitaloceanspaces.com',
					); // don't replace URLs that point to CDNs
					foreach ( $exempt_cdns as $exempt_cdn ) {
						if ( strpos( $content, $exempt_cdn ) !== false ) {
							$rewrite_url = false;
						}
					}
				} else {
					$rewrite_url = false;
				}
				if ( $rewrite_url || $content == '' ) {
					$content = $attachment_url;
				}

				$attachment_info = get_post( $id );
				$kgvid_postmeta  = ( new \Videopack\Admin\Attachment_Meta() )->get( $id );

				$dimensions = ( new \Videopack\Common\Video_Dimensions() )->get( $id );

				if ( empty( $atts['width'] ) ) {
					$query_atts['width']  = $dimensions['width'];
					$query_atts['height'] = $dimensions['height'];
				}

				$poster_id = get_post_meta( $id, '_kgflashmediaplayer-poster-id', true );
				if ( ! empty( $poster_id ) ) {
					$poster_image_src     = wp_get_attachment_image_src( $poster_id, 'full' );
					$query_atts['poster'] = $poster_image_src[0];
					if ( strpos( $query_atts['width'], '%' ) === false
						&& $query_atts['resize'] == 'false'
						&& $query_atts['fullwidth'] == 'false'
						&& intval( $query_atts['width'] ) <= get_option( 'medium_size_h' )
					) {
						$query_atts['poster'] = $this->shortcode->get_attachment_medium_url( $poster_id );
					}
				}

				if ( is_admin() && defined( 'DOING_AJAX' ) && DOING_AJAX ) {

					if ( $query_atts['poster'] ) {
						$query_atts['poster'] = set_url_scheme( $query_atts['poster'] );
					}
				}

				if ( $query_atts['title'] == 'true' ) {
					$query_atts['title']       = $attachment_info->post_title;
					$query_atts['stats_title'] = $query_atts['title'];
				} else {
					$query_atts['stats_title'] = $attachment_info->post_title;
				}
				if ( empty( $query_atts['caption'] ) ) {
					$query_atts['caption'] = trim( $attachment_info->post_excerpt );
				}
				if ( empty( $query_atts['description'] ) ) {
					$query_atts['description'] = trim( $attachment_info->post_content );
				}

				$query_atts['countable'] = true;
				$id_for_sources = $id;

			} else { // video is not in the database

				$id_for_sources = $post_id; // send the id of the post the video's embedded in
				if ( $query_atts['title'] == 'true' ) {
					$query_atts['title'] = 'false';
				}
				$query_atts['stats_title'] = basename( $content );
				if ( $query_atts['embedcode'] == 'true' ) {
					$query_atts['embedcode'] = 'false'; // can't use embed code with videos that are not in the database
				}

				$query_atts['countable'] = false;
			}

			if ( $query_atts['endofvideooverlaysame'] == 'true' ) {
				$query_atts['endofvideooverlay'] = $query_atts['poster'];
			}

			if ( $query_atts['inline'] == 'true' ) {
				$aligncode = ' kgvid_wrapper_inline';
				if ( $query_atts['align'] == 'left' ) {
					$aligncode .= ' kgvid_wrapper_inline_left';
				}
				if ( $query_atts['align'] == 'center' ) {
					$aligncode .= ' kgvid_wrapper_auto_left kgvid_wrapper_auto_right';
				}
				if ( $query_atts['align'] == 'right' ) {
					$aligncode .= ' kgvid_wrapper_inline_right';
				}
			} else {
				$aligncode = '';
				if ( $query_atts['align'] == 'center' ) {
					$aligncode = ' kgvid_wrapper_auto_left kgvid_wrapper_auto_right';
				}
				if ( $query_atts['align'] == 'right' ) {
					$aligncode = ' kgvid_wrapper_auto_left';
				}
			}

			if ( $query_atts['width'] == '100%' ) {
				$query_atts['width']     = $this->options['width'];
				$query_atts['height']    = $this->options['height'];
				$query_atts['fullwidth'] = 'true';
			}

			if ( ( $query_atts['fixed_aspect'] == 'vertical' && $query_atts['height'] > $query_atts['width'] )
				|| $query_atts['fixed_aspect'] == 'true'
			) {

				$default_aspect_ratio = intval( $this->options['height'] ) / intval( $this->options['width'] );
				$query_atts['height'] = round( intval( $query_atts['width'] ) * $default_aspect_ratio );

			}

			if ( $query_atts['gifmode'] == 'true' ) {
				$gifmode_atts = array(
					'muted'        => 'true',
					'autoplay'     => 'true',
					'loop'         => 'true',
					'controls'     => 'false',
					'title'        => 'false',
					'embeddable'   => 'false',
					'downloadlink' => 'false',
					'playsinline'  => 'true',
					'view_count'   => 'false',
				);

				$gifmode_atts = apply_filters( 'kgvid_gifmode_atts', $gifmode_atts );

				foreach ( $gifmode_atts as $gifmode_key => $gifmode_value ) {
					$query_atts[ $gifmode_key ] = $gifmode_value;
				}
			}

			$video_variables = $this->prepare_video_vars( $query_atts, $id );
			$source_info     = $this->prepare_sources( $content, $id_for_sources );

			if ( $this->options['embed_method'] === 'Video.js v8'
				&& $query_atts['skip_buttons'] == 'true'
			) {
				$video_variables['skip_buttons'] = array(
					'forward'  => $this->options['skip_forward'],
					'backward' => $this->options['skip_backward'],
				);
			}

			if ( substr( $this->options['embed_method'], 0, 8 ) === 'Video.js'
				|| $this->options['embed_method'] == 'None'
			) {

				if ( $source_info['enable_resolutions_plugin'] ) {
					$video_variables['enable_resolutions_plugin'] = 'true';
					if ( wp_script_is( 'kgvid_video_embed', 'enqueued' ) ) {
						wp_dequeue_script( 'kgvid_video_embed' ); // ensure that the video-quality-selector script is loaded before videopack.js
					}
					wp_enqueue_script( 'video-quality-selector' );

					if ( $query_atts['auto_res'] == 'highest' ) {
						$video_variables['default_res'] = end( $h264_resolutions );
					}
					if ( $query_atts['auto_res'] == 'lowest' ) {
						$video_variables['default_res'] = reset( $source_info['h264_resolutions'] );
					} elseif ( in_array( $query_atts['auto_res'], $source_info['h264_resolutions'] ) ) {
						$video_variables['default_res'] = $query_atts['auto_res'];
					} else {
						$video_variables['default_res'] = false;
					}

					$default_key = intval( $video_variables['default_res'] );
					if ( $video_variables['default_res']
						&& array_key_exists( $default_key, $source_info['sources_data'] )
					) {
						$default_source = $source_info['sources_data'][ $default_key ];
						unset( $source_info['sources_data'][ $default_key ] );
						$source_info['sources_data'] = array( $default_key => $default_source ) + $source_info['sources_data'];
					}
				} else {
					$video_variables['enable_resolutions_plugin'] = false;
				}
			} //if Video.js

			if ( $this->options['embed_method'] == 'WordPress Default' ) {
				if ( $source_info['enable_resolutions_plugin'] ) {

					$default_key = false;

					if ( $query_atts['auto_res'] == 'highest' ) {
						$res_label = end( $h264_resolutions );
					} elseif ( $query_atts['auto_res'] == 'lowest' ) {
						$res_label = reset( $h264_resolutions );
					} elseif ( in_array( $query_atts['auto_res'], $source_info['h264_resolutions'] ) ) {
						$res_label = $query_atts['auto_res'];
					} else {
						$res_label = false;
					}

					foreach ( $source_info['sources_data'] as $key => $source ) {
						if ( array_key_exists( 'res', $source )
							&& $source['res'] === $res_label
						) {
							$default_key = $key;
						}
					}

					if ( $default_key !== false ) {
						$source_info['sources_data'][ $default_key ]['default_res'] = 'true';
					}
				}
			}

			$source_code = '';
			foreach ( $source_info['sources_data'] as $key => $source ) {
				$source_code .= '<source src="' . $source['src'] . '" type="' . $source['type'] . '"';
				if ( array_key_exists( 'codecs', $source ) ) {
					$source_code .= ' codecs="' . $source['codecs'] . '"';
				}
				if ( array_key_exists( 'res', $source ) ) {
					$source_code .= ' data-res="' . $source['res'] . '"';
				}
				if ( array_key_exists( 'default_res', $source ) ) {
					$source_code .= ' data-default_res="' . $source['default_res'] . '"';
				}
				$source_code .= '>';
			}

			$code .= '<div id="kgvid_' . esc_attr( $video_variables['id'] ) . '_wrapper" class="kgvid_wrapper';
			$code .= $aligncode . '">' . "\n\t\t\t";
			$code .= '<div id="video_' . esc_attr( $video_variables['id'] ) . '_div" class="fitvidsignore kgvid_videodiv" data-id="' . esc_attr( $video_variables['id'] ) . '" data-kgvid_video_vars="' . esc_attr( wp_json_encode( $video_variables ) ) . '" ';
			if ( $query_atts['schema'] == 'true' ) {
				$code .= 'itemprop="video" itemscope itemtype="https://schema.org/VideoObject">';
				if ( $query_atts['poster'] != '' ) {
					$code .= '<meta itemprop="thumbnailUrl" content="' . esc_url( $query_atts['poster'] ) . '" >';
				}
				if ( ! empty( $id )
					&& $query_atts['embeddable'] == 'true'
				) {
					$schema_embedurl = site_url( '/' ) . '?attachment_id=' . $id . '&amp;videopack[enable]=true';
				} else {
					$schema_embedurl = $content;
				}
				$code .= '<meta itemprop="embedUrl" content="' . esc_url( $schema_embedurl ) . '" >';
				$code .= '<meta itemprop="contentUrl" content="' . esc_url( $content ) . '" >';
				$code .= '<meta itemprop="name" content="' . esc_attr( $query_atts['stats_title'] ) . '" >';

				$description = ( new Metadata() )->generate_video_description( $query_atts );

				$code .= '<meta itemprop="description" content="' . esc_attr( $description ) . '" >';

				if ( ! empty( $id ) ) {
					$upload_date = get_the_date( 'c', $id );
				} elseif ( $post_id != 0 ) {
					$upload_date = get_the_date( 'c', $post_id );
				} else {
					$upload_date = current_time( 'c' );
				}
				$code .= '<meta itemprop="uploadDate" content="' . esc_attr( $upload_date ) . '" >';
			} else {
				$code .= '>';
			} //schema disabled

			$track_keys = array( 'kind', 'srclang', 'src', 'label', 'default' );
			if (
				! isset( $kgvid_postmeta )
				|| ( is_array( $kgvid_postmeta )
					&& ! is_array( $kgvid_postmeta['track'] )
				)
			) {
				$kgvid_postmeta['track']    = array();
				$kgvid_postmeta['track'][0] = array(
					'kind'    => '',
					'srclang' => '',
					'src'     => '',
					'label'   => '',
					'default' => '',
				);
			}
			foreach ( $track_keys as $key ) {
				if ( empty( $kgvid_postmeta['track'][0][ $key ] ) ) {
					$kgvid_postmeta['track'][0][ $key ] = $query_atts[ 'track_' . $key ];
				}
			}

			$track_code = '';
			if ( ! empty( $kgvid_postmeta['track'][0]['src'] ) ) {
				foreach ( $kgvid_postmeta['track'] as $track => $track_attribute ) {
					foreach ( $track_attribute as $attribute => $value ) {
						if ( empty( $value ) ) {
							$track_attribute[ $attribute ] = $query_atts[ 'track_' . $attribute ];
						}
					}

					if ( $this->options['embed_method'] == 'WordPress Default'
						&& $track_attribute['kind'] == 'captions'
					) {
						$track_attribute['kind'] = 'subtitles';
					}
					$track_code .= "<track id='" . esc_attr( $video_variables['id'] ) . '_text_' . esc_attr( $track ) . "' kind='" . esc_attr( $track_attribute['kind'] ) . "' src='" . esc_url( $track_attribute['src'] ) . "' srclang='" . esc_attr( $track_attribute['srclang'] ) . "' label='" . esc_attr( $track_attribute['label'] ) . "' " . esc_attr( $track_attribute['default'] ) . ' >';
				}
			}

			if ( $this->options['embed_method'] == 'WordPress Default' ) {

				if ( $query_atts['poster'] != '' ) {
					$attr['poster'] = $query_atts['poster'];
				}
				if ( $query_atts['loop'] == 'true' ) {
					$attr['loop'] = 'true';
				}
				if ( $query_atts['autoplay'] == 'true' ) {
					$attr['autoplay'] = 'true';
				}
				$attr['preload'] = $query_atts['preload'];
				$attr['width']   = $query_atts['width'];
				$attr['height']  = $query_atts['height'];

				$localize = false;

				$wpmejssettings = array(
					'features'    => array( 'playpause', 'progress', 'volume', 'tracks' ),
					'classPrefix' => 'mejs-',
					'stretching'  => 'responsive',
					'pluginPath'  => includes_url( 'js/mediaelement/', 'relative' ),
					'success'     => 'kgvid_mejs_success',
				);

				if ( $source_info['enable_resolutions_plugin']
					&& ! wp_script_is( 'mejs_sourcechooser', 'enqueued' )
				) {
					wp_enqueue_script( 'mejs_sourcechooser' );
					array_push( $wpmejssettings['features'], 'sourcechooser' );
					$localize = true;
				}

				if ( $kgvid_video_id === 0 ) {
					$localize = true;
				}

				if ( $query_atts['playback_rate'] == 'true' ) {
					array_push( $wpmejssettings['features'], 'speed' );
					$wpmejssettings['speeds'] = array( '0.5', '1', '1.25', '1.5', '2' );
					wp_enqueue_script( 'mejs-speed' );
				}

				array_push( $wpmejssettings['features'], 'fullscreen' );

				if ( $localize ) {
					wp_localize_script( 'wp-mediaelement', '_wpmejsSettings', $wpmejssettings );
				}

				$content_width      = $query_atts['width'];
				$executed_shortcode = wp_video_shortcode( $attr );
				$content_width      = $content_width_save;

				$executed_shortcode = preg_replace( '/<source .*<a /', implode( ' />', $sources ) . ' /><a ', $executed_shortcode );

				if ( ! empty( $track_code ) ) {
					$executed_shortcode = preg_replace( '/<a /', $track_code . '<a ', $executed_shortcode );
				}

				$code .= $executed_shortcode;
			}

			if ( substr( $this->options['embed_method'], 0, 8 ) === 'Video.js'
				|| $this->options['embed_method'] == 'None'
			) {

				$code .= "\n\t\t\t\t" . '<video id="video_' . esc_attr( $video_variables['id'] ) . '" ';
				if ( $query_atts['playsinline'] == 'true' ) {
					$code .= 'playsinline ';
				}
				if ( $query_atts['loop'] == 'true' ) {
					$code .= 'loop ';
				}
				if ( $query_atts['autoplay'] == 'true' ) {
					$code .= 'autoplay ';
				}
				if ( $query_atts['controls'] != 'false' ) {
					$code .= 'controls ';
				}
				if ( $query_atts['muted'] == 'true' ) {
					$code .= 'muted ';
				}
				$code .= 'preload="' . esc_attr( $query_atts['preload'] ) . '" ';
				if ( $query_atts['poster'] != '' ) {
					$code .= 'poster="' . esc_url( $query_atts['poster'] ) . '" ';
				}
				if ( $this->options['embed_method'] != 'None' ) {
					$code .= 'width="' . esc_attr( $query_atts['width'] ) . '" height="' . esc_attr( $query_atts['height'] ) . '"';
				} else {
					$code .= 'width="100%"';
				}

				if ( $this->options['embed_method'] != 'None' ) {
					if ( $this->options['js_skin'] == '' ) {
						$this->options['js_skin'] = 'vjs-default-skin';
					}
					if ( is_array( $atts ) && array_key_exists( 'skin', $atts ) ) {
						$this->options['js_skin'] = $atts['skin']; // allows user to set skin for individual videos using the skin="" attribute
					}
					$code .= ' class="fitvidsignore ' . esc_attr( 'video-js ' . $this->options['js_skin'] ) . '">' . "\n";
				} else {
					$code .= ' class="fitvidsignore">' . "\n";
				}

				$code .= "\t\t\t\t\t" . $source_code . "\n";
				$code .= $track_code; // if there's a text track
				$code .= "\t\t\t\t</video>\n";

			}
			$code      .= "\t\t\t</div>\n";
			$show_views = false;
			if (
				(
					! empty( $id )
					&& $query_atts['view_count'] == 'true'
				)
				|| ! empty( $query_atts['caption'] )
				|| $content == plugins_url( '/images/Adobestock_469037984.mp4', __DIR__ )
			) { // generate content below the video
				if ( is_array( $kgvid_postmeta ) && array_key_exists( 'starts', $kgvid_postmeta ) ) {
					$view_count = number_format( intval( $kgvid_postmeta['starts'] ) );
				} else {
					$view_count               = '0';
					$kgvid_postmeta['starts'] = 0;
				}
				if ( $content == plugins_url( '/images/Adobestock_469037984.mp4', __DIR__ ) ) {
					$view_count = 'XX';
				}
				if ( $query_atts['view_count'] == 'true' ) {
					$show_views = true;
				}
				if ( ! empty( $query_atts['caption'] )
					|| $show_views
				) {
					$code .= "\t\t\t" . '<div class="kgvid_below_video" id="video_' . esc_attr( $video_variables['id'] ) . '_below">';
					if ( $show_views ) {
						/* translators: %s is a number */
						$code .= '<div class="kgvid-viewcount" id="video_' . esc_attr( $video_variables['id'] ) . '_viewcount">' . esc_html( sprintf( _n( '%s view', '%s views', intval( $kgvid_postmeta['starts'] ), 'video-embed-thumbnail-generator' ), $view_count ) ) . '</div>';
					}
					if ( ! empty( $query_atts['caption'] ) ) {
						$code .= '<div class="kgvid-caption" id="video_' . esc_attr( $video_variables['id'] ) . '_caption">' . wp_kses_post( $query_atts['caption'] ) . '</div>';
					}
					$code .= '</div>';
				}
			}

			if ( $video_variables['meta'] == true ) { // generate content overlaid on video
				$code .= "\t\t\t" . '<div id="video_' . esc_attr( $video_variables['id'] ) . '_meta" class="kgvid_video_meta kgvid_video_meta_hover ';
				if ( $query_atts['title'] != 'false' ) {
					$show_title = true;
					$code      .= '">';
				} else {
					$show_title = false;
					$code      .= 'kgvid_no_title_meta">';
				} //no title

				$code .= "\n\t\t\t\t<span class='kgvid_meta_icons'>";

				if ( $query_atts['downloadlink'] == 'true' ) {
					$download_link = apply_filters( 'videopack_download_link', $content );
					$download_code = "\t\t\t\t\t" . '<a class="kgvid-download-link" href="' . esc_attr( $download_link ) . '" title="' . esc_attr__( 'Click to download', 'video-embed-thumbnail-generator' ) . '" download';
					if ( $this->options['click_download'] === 'on'
						&& ! empty( $id )
					) {
						$filepath = get_attached_file( $id );
						if ( file_exists( $filepath ) ) {
							$download_code .= ' data-alt_link="' . esc_attr( site_url( '/' ) . '?attachment_id=' . $id . '&videopack&#91;download&#93;=true' ) . '"';
						}
					}
					$download_code .= '>';
					$download_code .= '<span class="kgvid-icons kgvid-icon-download"></span></a>';
				} else {
					$download_code = '';
				}

				if ( $query_atts['embeddable'] == 'true'
					&& ( $query_atts['embedcode'] != 'false'
						|| $this->options['twitter_button'] == true
						|| $this->options['facebook_button'] == true
					)
				) {

					$embed_code  = "\t\t\t\t<span id='kgvid_" . esc_attr( $video_variables['id'] ) . "_shareicon' class='vjs-icon-share' onclick='kgvid_share_icon_click(\"" . esc_attr( $video_variables['id'] ) . "\");'></span>\n";
					$embed_code .= "\t\t\t\t<div id='click_trap_" . esc_attr( $video_variables['id'] ) . "' class='kgvid_click_trap'></div><div id='video_" . esc_attr( $video_variables['id'] ) . "_embed' class='kgvid_share_container";
					if ( $show_title == false ) {
						$embed_code .= ' kgvid_no_title_meta';
					}
					$embed_code .= "'><div class='kgvid_share_icons'>";
					if ( $query_atts['embedcode'] != 'false' ) {
						if ( $query_atts['embedcode'] == 'true' ) {
							$iframeurl = site_url( '/' ) . '?attachment_id=' . esc_attr( $id ) . '&amp;videopack[enable]=true';
						} else {
							$iframeurl = $query_atts['embedcode'];
						}
						$iframecode  = "<iframe src='" . esc_attr( $iframeurl ) . "' frameborder='0' scrolling='no' width='" . esc_attr( $query_atts['width'] ) . "' height='" . esc_attr( $query_atts['height'] ) . " allowfullscreen allow='autoplay; fullscreen'></iframe>";
						$iframecode  = apply_filters( 'kgvid_embedcode', $iframecode, $iframeurl, $id, $query_atts );
						$embed_code .= "<span class='kgvid_embedcode_container'><span class='kgvid-icons kgvid-icon-embed'></span>
						<span>" . esc_html_x( 'Embed:', 'precedes code for embedding video', 'video-embed-thumbnail-generator' ) . " </span><span><input class='kgvid_embedcode' type='text' value='" . esc_attr( $iframecode ) . "' onClick='this.select();'></span> <span class='kgvid_start_time'><input type='checkbox' class='kgvid_start_at_enable' onclick='kgvid_set_start_at(\"" . esc_attr( $video_variables['id'] ) . "\")'> " . esc_html__( 'Start at:', 'video-embed-thumbnail-generator' ) . " <input type='text' class='kgvid_start_at' onkeyup='kgvid_change_start_at(\"" . esc_attr( $video_variables['id'] ) . "\")'></span></span>";
					} //embed code

					if ( $this->options['twitter_button'] == true || $this->options['facebook_button'] == true ) {

						$embed_code .= "<div class='kgvid_social_icons'>";
						if ( in_the_loop() ) {
							$permalink = get_permalink();
						} elseif ( ! empty( $id ) ) {
							$permalink = get_attachment_link( $id );
						} else {
							$permalink = $content;
						}

						if ( $this->options['twitter_button'] == true ) {
							$embed_code .= "<a title='" . esc_attr__( 'Share on Twitter', 'video-embed-thumbnail-generator' ) . "' href='" . esc_url( 'https://twitter.com/share?text=' . rawurlencode( $query_atts['title'] ) . '&url=' . rawurlencode( $permalink ) );
							if ( ! empty( $this->options['twitter_username'] ) ) {
								$embed_code .= '&via=' . esc_attr( rawurlencode( $this->options['twitter_username'] ) );
							}
							$embed_code .= "' onclick='window.open(this.href, \"\", \"menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=260,width=600\");return false;'><span class='vjs-icon-twitter'></span></a>";
						}

						if ( $this->options['facebook_button'] == true ) {
							$embed_code .= "&nbsp;<a title='" . esc_attr__( 'Share on Facebook', 'video-embed-thumbnail-generator' ) . "' href='" . esc_url( 'https://www.facebook.com/sharer/sharer.php?u=' . rawurlencode( $permalink ) ) . "' onclick='window.open(this.href, \"\", \"menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=260,width=600\");return false;'><span class='vjs-icon-facebook'></span></a>";
						}

						$embed_code .= '</div>';

					}

					$embed_code .= "</div></div>\n";
				} else {
					$embed_code = '';
				}

				$code .= $embed_code . $download_code;

				$code .= '</span>';
				if ( $show_title == true ) {
					$code .= "\n\t\t\t\t<span id='video_" . esc_attr( $video_variables['id'] ) . "_title' class='kgvid_title'>" . esc_attr( $query_atts['title'] ) . "</span>\n";
				}
				$code .= "</div>\n";
			}

			if ( ! empty( $query_atts['watermark'] )
				&& $query_atts['watermark'] != 'false'
				&& $this->options['embed_method'] != 'None'
			) {
				$watermark_id = ( new Attachment() )->url_to_id( $query_atts['watermark'] );
				if ( $watermark_id ) {
					$query_atts['watermark'] = wp_get_attachment_url( $watermark_id );
				}
				if ( is_admin() && defined( 'DOING_AJAX' ) && DOING_AJAX ) {
					if ( $query_atts['watermark'] ) {
						$query_atts['watermark'] = set_url_scheme( $query_atts['watermark'] );
					}
				}
				$code .= "<div style=\"display:none;\" id='video_" . esc_attr( $video_variables['id'] ) . "_watermark' class='kgvid_watermark'>";
				if ( ! empty( $query_atts['watermark_url'] )
					&& $query_atts['watermark_link_to'] != 'custom'
				) {
					$query_atts['watermark_link_to'] = 'custom';
				}
				if ( $query_atts['watermark_link_to'] != 'false'
					&& $query_atts['watermark_url'] != 'false'
				) {
					$watermark_link = true;
					switch ( $query_atts['watermark_link_to'] ) {

						case 'home':
							$watermark_href = get_home_url();
							break;

						case 'parent':
							if ( ! empty( $id )
								&& is_object( $attachment_info )
								&& property_exists( $attachment_info, 'post_parent' )
								&& ! empty( $attachment_info->post_parent ) ) {
								$watermark_href = get_permalink( $attachment_info->post_parent );
							} else {
								$watermark_href = get_home_url();
							}
							break;

						case 'attachment':
							if ( ! empty( $id ) ) {
								$watermark_href = get_permalink( $id );
							} else {
								$watermark_href = get_home_url();
							}
							break;

						case 'download':
							$watermark_href = $content;
							break;

						case 'custom':
							$watermark_href = $query_atts['watermark_url'];
							break;

					}
					$code .= "<a target='_parent' href='" . esc_attr( $watermark_href ) . "'";
					if ( $query_atts['watermark_link_to'] === 'download' ) {
						$code .= ' download';
					}
					$code .= '>';
				} else {
					$watermark_link = false;
				}
				$code .= "<img src='" . esc_attr( $query_atts['watermark'] ) . "' alt='" . esc_attr__( 'watermark', 'video-embed-thumbnail-generator' ) . "'>";
				if ( $watermark_link ) {
					$code .= '</a>';
				}
				$code .= '</div>';
			} //generate watermark
			$code .= "\t\t</div>"; // end kgvid_XXXX_wrapper div

			++$kgvid_video_id;

		} //end id_array loop

		return apply_filters( 'kgvid_single_video_code', $code, $query_atts, $atts, $content, $post_id );
	}
}
