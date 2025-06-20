<?php

namespace Videopack\Frontend\Video_Players;

abstract class Player {

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
	}

	public function register_hooks() {
		add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );
	}

	public function register_scripts() {

		wp_register_script(
			'videopack',
			plugins_url( '/js/videopack.js', __FILE__ ),
			$this->get_videopack_script_dependencies(),
			VIDEOPACK_VERSION,
			true
		);

		wp_localize_script(
			'videopack',
			'videopack_l10n',
			array(
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

		if ( $this->options_manager->alwaysloadscripts == true ) {
			$this->enqueue_scripts();
		}
	}

	public function enqueue_styles() {
		wp_enqueue_style( 'videopack_styles', plugins_url( '/css/videopack-styles.css', __FILE__ ), array( 'video-js' ), VIDEOPACK_VERSION );
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

	protected function prepare_video_vars(): array {

		$video_variables = array(
			'id'                => 'videopack_player_' . $this->get_id(),
			'attachment_id'     => $this->get_source() ? $this->get_source()->get_id() : 0,
			'player_type'       => $this->options_manager->embed_method,
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

		$player_code  = '<div class="videopack-wrapper>';
		$player_code .= '<div class="videopack-player">';
		if ( $this->has_meta_bar() ) {
			$player_code .= $this->get_meta_bar_code();
		}
		$player_code .= $this->get_video_code();
		$player_code .= '</div>';
		if ( $this->has_below_video() ) {
			$player_code .= $this->get_below_video_code();
		}
		$player_code .= '</div>';

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
		$meta_bar .= '<span class="meta-icons">';
		if ( $this->has_embed_meta() ) {
			$meta_bar .= '<button class="vjs-icon-share"></button>';
		}
		$meta_bar .= '<a class="download-link" href="' . $this->source->get_download_url() . '" download title="' . esc_attr__( 'Click to download', 'video-embed-thumbnail-generator' ) . '"></a>';

		return apply_filters( 'videopack_video_player_meta_bar', $meta_bar, $this->atts );
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
		return '';
	}

	public function single_video_code( $query_atts, $atts, $content, $post_id ) {

		global $content_width;
		$content_width_save = $content_width;

		global $kgvid_video_id;
		if ( ! $kgvid_video_id ) {
			$kgvid_video_id = 0;
		}

		$code     = '';
		$id_array = array();

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
			$id_array[0] = ( new \Videopack\Admin\Attachment( $this->options_manager ) )->url_to_id( $content );
		}

		$original_content = $content;

		foreach ( $id_array as $id ) { // loop through videos

			$query_atts = $this->shortcode->atts( $atts ); // reset values so they can be different with multiple videos
			$content    = $original_content;
			unset( $dimensions );

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

				if ( $this->options_manager->rewrite_attachment_url == true ) {

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

				$dimensions = new \Videopack\Common\Video_Dimensions( $this->options_manager, $id );

				if ( empty( $atts['width'] ) ) {
					$query_atts['width']  = $dimensions->width;
					$query_atts['height'] = $dimensions->height;
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
				$id_for_sources          = $id;

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
				$query_atts['width']     = $this->options_manager->width;
				$query_atts['height']    = $this->options_manager->height;
				$query_atts['fullwidth'] = 'true';
			}

			if ( ( $query_atts['fixed_aspect'] == 'vertical' && $query_atts['height'] > $query_atts['width'] )
				|| $query_atts['fixed_aspect'] == 'true'
			) {

				$default_aspect_ratio = intval( $this->options_manager->height ) / intval( $this->options_manager->width );
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

			if ( $this->options_manager->embed_method === 'Video.js'
				&& $query_atts['skip_buttons'] == 'true'
			) {
				$video_variables['skip_buttons'] = array(
					'forward'  => $this->options_manager->skip_forward,
					'backward' => $this->options_manager->skip_backward,
				);
			}

			if ( substr( $this->options_manager->embed_method, 0, 8 ) === 'Video.js'
				|| $this->options_manager->embed_method == 'None'
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

			if ( $this->options_manager->embed_method == 'WordPress Default' ) {
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

					if ( $this->options_manager->embed_method == 'WordPress Default'
						&& $track_attribute['kind'] == 'captions'
					) {
						$track_attribute['kind'] = 'subtitles';
					}
					$track_code .= "<track id='" . esc_attr( $video_variables['id'] ) . '_text_' . esc_attr( $track ) . "' kind='" . esc_attr( $track_attribute['kind'] ) . "' src='" . esc_url( $track_attribute['src'] ) . "' srclang='" . esc_attr( $track_attribute['srclang'] ) . "' label='" . esc_attr( $track_attribute['label'] ) . "' " . esc_attr( $track_attribute['default'] ) . ' >';
				}
			}

			if ( $this->options_manager->embed_method == 'WordPress Default' ) {

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

			if ( substr( $this->options_manager->embed_method, 0, 8 ) === 'Video.js'
				|| $this->options_manager->embed_method == 'None'
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
				if ( $this->options_manager->embed_method != 'None' ) {
					$code .= 'width="' . esc_attr( $query_atts['width'] ) . '" height="' . esc_attr( $query_atts['height'] ) . '"';
				} else {
					$code .= 'width="100%"';
				}

				if ( $this->options_manager->embed_method != 'None' ) {
					if ( $this->options_manager->skin == '' ) {
						$this->options_manager->skin = 'vjs-default-skin';
					}
					if ( is_array( $atts ) && array_key_exists( 'skin', $atts ) ) {
						$this->options_manager->skin = $atts['skin']; // allows user to set skin for individual videos using the skin="" attribute
					}
					$code .= ' class="fitvidsignore ' . esc_attr( 'video-js ' . $this->options_manager->skin ) . '">' . "\n";
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
					if ( $this->options_manager->click_download === 'on'
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
					&& $query_atts['embedcode'] != 'false'
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
				&& $this->options_manager->embed_method != 'None'
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
