<?php
/**
 * Frontend gallery handler.
 *
 * @package Videopack
 */

namespace Videopack\Frontend;

/**
 * Class Gallery
 *
 * Handles the display and pagination of video galleries on the frontend.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend
 * @author     Kyle Gilman <kylegilman@gmail.com>
 */
class Gallery {
	/**
	 * Video formats registry.
	 *
	 * @var \Videopack\Admin\Formats\Registry|null $format_registry
	 */
	protected $format_registry;

	/**
	 * Plugin options.
	 *
	 * @var array $options
	 */
	protected $options;

	/**
	 * Attachment meta handler.
	 *
	 * @var \Videopack\Admin\Attachment_Meta $attachment_meta
	 */
	protected $attachment_meta;

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
		$this->attachment_meta = new \Videopack\Admin\Attachment_Meta( $options );
	}

	/**
	 * Retrieves the video attachments for a gallery based on query attributes.
	 *
	 * @param int|string $page_number The current page number for pagination.
	 * @param array      $query_atts  The gallery query attributes.
	 * @return \WP_Query The query result.
	 */
	public function get_gallery_videos( $page_number, array $query_atts ) {
		$page_number = (int) $page_number;

		if ( (string) ( $query_atts['gallery_orderby'] ?? '' ) === 'menu_order' ) {
			$query_atts['gallery_orderby'] = 'menu_order ID';
		}
		if ( (bool) ( $query_atts['gallery_pagination'] ?? false ) !== true ) {
			$query_atts['gallery_per_page'] = (int) ( $query_atts['collection_video_limit'] ?? ( $query_atts['videos'] ?? -1 ) );
		} elseif ( (string) ( $query_atts['gallery_per_page'] ?? '' ) === 'false' ) {
			$query_atts['gallery_per_page'] = -1;
		}

		$args = array(
			'post_type'      => 'attachment',
			'orderby'        => (string) ( $query_atts['gallery_orderby'] ?? 'post_date' ),
			'order'          => (string) ( $query_atts['gallery_order'] ?? 'DESC' ),
			'post_mime_type' => 'video',
			'posts_per_page' => (int) ( $query_atts['gallery_per_page'] ?? -1 ),
			'paged'          => (int) $page_number,
			'post_status'    => 'inherit', // Attachments have status 'inherit', not 'published'.
			'post_parent'    => (int) ( $query_atts['gallery_id'] ?? 0 ),
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

		if ( ! empty( $query_atts['gallery_id'] ) ) {
			$args['post_parent'] = (int) $query_atts['gallery_id'];
		} else {
			unset( $args['post_parent'] );
		}

		if ( ! empty( $query_atts['gallery_source'] ) ) {
			$archive_args       = array(
				'post_type'      => 'post', // Adjust if you want to support other post types.
				'fields'         => 'ids',
				'nopaging'       => true,
				'posts_per_page' => -1,
			);
			$has_archive_source = false;

			if ( 'category' === (string) $query_atts['gallery_source'] ) {
				if ( ! empty( $query_atts['gallery_category'] ) ) {
					$archive_args['cat'] = (int) $query_atts['gallery_category'];
					$has_archive_source  = true;
				} elseif ( is_category() ) {
					$archive_args['cat'] = get_queried_object_id();
					$has_archive_source  = true;
				}
			} elseif ( 'tag' === (string) $query_atts['gallery_source'] ) {
				if ( ! empty( $query_atts['gallery_tag'] ) ) {
					$archive_args['tag_id'] = (int) $query_atts['gallery_tag'];
					$has_archive_source     = true;
				} elseif ( is_tag() ) {
					$archive_args['tag_id'] = get_queried_object_id();
					$has_archive_source     = true;
				}
			} elseif ( 'archive' === (string) $query_atts['gallery_source'] ) {
				if ( is_category() ) {
					$archive_args['cat'] = get_queried_object_id();
					$has_archive_source  = true;
				} elseif ( is_tag() ) {
					$archive_args['tag_id'] = get_queried_object_id();
					$has_archive_source     = true;
				} elseif ( is_tax() ) {
					$queried_object = get_queried_object();
					if ( $queried_object instanceof \WP_Term ) {
						$archive_args['tax_query'] = array(
							array(
								'taxonomy' => $queried_object->taxonomy,
								'field'    => 'term_id',
								'terms'    => $queried_object->term_id,
							),
						);
						$has_archive_source        = true;
					}
				}
			}

			if ( $has_archive_source ) {
				$post_ids = get_posts( $archive_args );
				if ( ! empty( $post_ids ) ) {
					$args['post_parent__in'] = $post_ids;
					unset( $args['post_parent'] );
				} else {
					// No posts found, ensure an empty result.
					$args['post__in'] = array( 0 );
					unset( $args['post_parent'] );
				}
			}
		}

		if ( ! empty( $query_atts['gallery_exclude'] ) ) {
			$exclude_arr = (array) wp_parse_id_list( (string) $query_atts['gallery_exclude'] );
			if ( ! empty( $exclude_arr ) ) {
				$args['post__not_in'] = (array) $exclude_arr;
			}
		}

		if ( ! empty( $query_atts['gallery_include'] ) ) {
			$include_arr = (array) wp_parse_id_list( (string) $query_atts['gallery_include'] );
			if ( ! empty( $include_arr ) ) {
				$gallery_per_page = (int) ( $query_atts['gallery_per_page'] ?? -1 );
				if ( $gallery_per_page > 0 && count( (array) $include_arr ) > $gallery_per_page ) {
					$total_pages      = (int) ceil( count( (array) $include_arr ) / $gallery_per_page );
					$offset           = (int) ( ( (int) $page_number - 1 ) * $gallery_per_page );
					$args['post__in'] = (array) array_slice( (array) $include_arr, $offset, $gallery_per_page );
				} else {
					$args['post__in'] = (array) $include_arr;
				}
				unset( $args['paged'] );
				if ( (string) ( $args['orderby'] ?? '' ) === 'menu_order ID' || (string) ( $args['orderby'] ?? '' ) === 'include' ) {
					$args['orderby'] = 'post__in'; // Sort by order of IDs in the gallery_include parameter.
				}
				unset( $args['post_parent'] );
			}
		}

		$attachments = new \WP_Query( (array) $args );

		if ( ! empty( $include_arr ) && isset( $total_pages ) ) {
			$attachments->max_num_pages = (int) $total_pages;
		}

		if ( (bool) $attachments->have_posts() ) {
			return $attachments;
		}

		return new \WP_Query(
			array(
				'post__in' => array( 0 ), // No post has the ID of 0.
			)
		);
	}

	/**
	 * Prepares all necessary data for a single video to be used by the gallery frontend.
	 *
	 * @param \WP_Post $attachment   The video attachment post object.
	 * @param array    $gallery_atts The attributes for the gallery.
	 * @return array|null The prepared data array or null on failure.
	 */
	public function prepare_video_data_for_js( \WP_Post $attachment, array $gallery_atts ): ?array {
		$shortcode = new Shortcode( $this->options );
		$source    = \Videopack\Video_Source\Source_Factory::create( (int) $attachment->ID, $this->options, $this->format_registry );
		if ( ! $source ) {
			return null;
		}

		// The shortcode class has logic to determine final attributes based on defaults, meta, and shortcode atts.
		// We need to replicate that to get the correct poster, dimensions, etc.
		$single_video_atts = (array) array_merge( (array) $gallery_atts, array( 'id' => (int) $attachment->ID ) );
		$final_atts        = (array) $shortcode->get_final_atts( (array) $single_video_atts, $source );

		$player = Video_Players\Player_Factory::create( (string) $this->options['embed_method'], $this->options, $this->format_registry );
		$player->set_id( 'gallery_' . (int) $attachment->ID );
		$player->set_source( $source );
		$player->set_atts(
			array_merge(
				(array) $final_atts,
				array(
					'id'       => (int) $attachment->ID,
					'autoplay' => true,
					'controls' => true,
				)
			)
		);

		$player_vars                     = (array) $player->prepare_video_vars();
		$player_vars['full_player_html'] = $player->get_player_code( $player->get_atts() );
		$player_vars['sources']          = (array) $player->get_flat_sources();
		$player_vars['poster']           = (string) ( $final_atts['poster'] ?? '' );
		$player_vars['attachment']       = (int) $attachment->ID;
		$player_vars['starts']           = (int) ( $final_atts['starts'] ?? 0 );

		$poster_id = (int) get_post_meta( (int) $attachment->ID, '_kgflashmediaplayer-poster-id', true );
		if ( ! $poster_id ) {
			$poster_id = (int) get_post_thumbnail_id( (int) $attachment->ID );
		}

		$poster_url = (string) ( $final_atts['poster'] ?? '' );
		if ( empty( $poster_url ) ) {
			$poster_url = (string) plugins_url( 'src/images/nothumbnail.jpg', VIDEOPACK_PLUGIN_FILE );
		}

		return array(
			'attachment_id' => (int) $attachment->ID,
			'title'         => (string) get_the_title( $attachment ),
			'poster_url'    => (string) $poster_url,
			'poster_srcset' => $poster_id ? (string) wp_get_attachment_image_srcset( (int) $poster_id, 'medium_large' ) : '',
			'player_vars'   => (array) $player_vars,
		);
	}

	/**
	 * Renders the gallery HTML for a specific page.
	 *
	 * @param int|string $page_number The current page number.
	 * @param array      $query_atts  The gallery query attributes.
	 * @return string The rendered HTML.
	 */
	public function gallery_page( $page_number, array $query_atts ) {
		$page_number                = (int) $page_number;
		$query_atts['embed_method'] = (string) ( $this->options['embed_method'] ?? 'Video.js' );
		$attachments                = $this->get_gallery_videos( $page_number, $query_atts );
		$videos_data                = array();

		if ( (bool) $attachments->have_posts() ) {
			foreach ( (array) $attachments->posts as $attachment ) {
				$video_data = (array) $this->prepare_video_data_for_js( $attachment, $query_atts );
				if ( ! empty( $video_data ) ) {
					$videos_data[] = (array) $video_data;
					// Add player vars to the inline script data for the initial page load.
					$script = (string) sprintf(
						'window.videopack = window.videopack || {}; window.videopack.player_data = window.videopack.player_data || {}; window.videopack.player_data["%1$s"] = %2$s;',
						(string) $video_data['player_vars']['id'],
						(string) wp_json_encode( (array) $video_data['player_vars'] )
					);
					wp_add_inline_script( 'videopack-frontend', $script );
				}
			}
		}
		ob_start();

		$classes    = array( 'videopack-gallery-wrapper', 'videopack-collection-wrapper' );
		$style_vars = array();
		if ( ! empty( $query_atts['gallery_columns'] ) && (int) $query_atts['gallery_columns'] > 0 ) {
			$style_vars[] = '--gallery-columns: ' . esc_attr( (string) $query_atts['gallery_columns'] );
		}

		$title_color = ! empty( $query_atts['title_color'] ) ? $query_atts['title_color'] : ( $this->options['title_color'] ?? '' );
		if ( ! empty( $title_color ) ) {
			$style_vars[] = '--videopack-title-color: ' . esc_attr( (string) $title_color );
			$classes[]    = 'videopack-has-title-color';
		}

		$title_bg_color = ! empty( $query_atts['title_background_color'] ) ? $query_atts['title_background_color'] : ( $this->options['title_background_color'] ?? '' );
		if ( ! empty( $title_bg_color ) ) {
			$style_vars[] = '--videopack-title-background-color: ' . esc_attr( (string) $title_bg_color );
			$classes[]    = 'videopack-has-title-background-color';
		}

		$play_button_color = ! empty( $query_atts['play_button_color'] ) ? $query_atts['play_button_color'] : ( $this->options['play_button_color'] ?? '' );
		if ( ! empty( $play_button_color ) ) {
			$style_vars[] = '--videopack-play-button-color: ' . esc_attr( (string) $play_button_color );
			$classes[]    = 'videopack-has-play-button-color';
		}

		$play_button_icon_color = ! empty( $query_atts['play_button_icon_color'] ) ? $query_atts['play_button_icon_color'] : ( $this->options['play_button_icon_color'] ?? '' );
		if ( ! empty( $play_button_icon_color ) ) {
			$style_vars[] = '--videopack-play-button-icon-color: ' . esc_attr( (string) $play_button_icon_color );
			$classes[]    = 'videopack-has-play-button-icon-color';
		}

		$pagination_color = ! empty( $query_atts['pagination_color'] ) ? $query_atts['pagination_color'] : ( $this->options['pagination_color'] ?? '' );
		if ( ! empty( $pagination_color ) ) {
			$style_vars[] = '--videopack-pagination-color: ' . esc_attr( (string) $pagination_color );
		}

		$pagination_bg_color = ! empty( $query_atts['pagination_background_color'] ) ? $query_atts['pagination_background_color'] : ( $this->options['pagination_background_color'] ?? '' );
		if ( ! empty( $pagination_bg_color ) ) {
			$style_vars[] = '--videopack-pagination-bg: ' . esc_attr( (string) $pagination_bg_color );
		}

		$pagination_active_bg_color = ! empty( $query_atts['pagination_active_bg_color'] ) ? $query_atts['pagination_active_bg_color'] : ( $this->options['pagination_active_bg_color'] ?? '' );
		if ( ! empty( $pagination_active_bg_color ) ) {
			$style_vars[] = '--videopack-pagination-active-bg: ' . esc_attr( (string) $pagination_active_bg_color );
		}

		$pagination_active_color = ! empty( $query_atts['pagination_active_color'] ) ? $query_atts['pagination_active_color'] : ( $this->options['pagination_active_color'] ?? '' );
		if ( ! empty( $pagination_active_color ) ) {
			$style_vars[] = '--videopack-pagination-active-color: ' . esc_attr( (string) $pagination_active_color );
		}

		$style_vars[] = '--videopack-mejs-controls-svg: url(' . includes_url( 'js/mediaelement/mejs-controls.svg' ) . ')';

		$html  = '<div class="' . esc_attr( (string) implode( ' ', $classes ) ) . '" ';
		$html .= 'data-videopack-ajax-collection="true" ';
		$html .= 'data-layout="gallery" ';
		$html .= 'data-settings="' . esc_attr( (string) wp_json_encode( $query_atts ) ) . '" ';
		$html .= 'data-current-page="' . esc_attr( (string) $page_number ) . '" ';
		$html .= 'data-total-pages="' . esc_attr( (string) ( $attachments->max_num_pages ?? 1 ) ) . '" ';

		if ( ! empty( $style_vars ) ) {
			$html .= 'style="' . esc_attr( (string) implode( '; ', $style_vars ) ) . '" ';
		}
		$html .= '>';
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		?>
			<div class="videopack-gallery-items"
				<?php if ( ! empty( $query_atts['gallery_columns'] ) && (int) $query_atts['gallery_columns'] > 0 ) : ?>
					style="--gallery-columns: <?php echo esc_attr( (string) $query_atts['gallery_columns'] ); ?>"
				<?php endif; ?>
			>
				<?php foreach ( (array) $videos_data as $video ) : ?>
					<div class="gallery-thumbnail videopack-gallery-item <?php echo esc_attr( (string) ( $query_atts['skin'] ?? '' ) ); ?>" data-attachment-id="<?php echo esc_attr( (string) $video['attachment_id'] ); ?>">
						<div class="gallery-item-clickable-area">
							<img src="<?php echo esc_url( (string) $video['poster_url'] ); ?>"
								<?php
								if ( ! empty( $video['poster_srcset'] ) ) {
									printf( 'srcset="%s"', esc_attr( (string) $video['poster_srcset'] ) );
								}
								?>
								alt="<?php echo esc_attr( (string) $video['title'] ); ?>">
							<?php if ( 'WordPress Default' === (string) ( $this->options['embed_method'] ?? '' ) ) : ?>
								<div class="mejs-overlay mejs-layer mejs-overlay-play">
									<div class="mejs-overlay-button" role="button" tabindex="0" aria-label="<?php esc_attr_e( 'Play', 'video-embed-thumbnail-generator' ); ?>" aria-pressed="false"></div>
								</div>
							<?php else : ?>
								<div class="play-button-container video-js <?php echo esc_attr( (string) ( $query_atts['skin'] ?? 'vjs-theme-videopack' ) ); ?> vjs-big-play-centered vjs-paused vjs-controls-enabled">
									<button class="vjs-big-play-button" type="button" title="<?php esc_attr_e( 'Play Video', 'video-embed-thumbnail-generator' ); ?>" aria-disabled="false">
										<span class="vjs-icon-placeholder" aria-hidden="true"></span>
										<span class="vjs-control-text" aria-live="polite"><?php esc_html_e( 'Play Video', 'video-embed-thumbnail-generator' ); ?></span>
									</button>
								</div>
							<?php endif; ?>
							<?php if ( ! empty( $query_atts['gallery_title'] ) ) : ?>
								<div class="video-title">
									<div class="video-title-background"></div>
									<span class="video-title-text"><?php echo esc_html( (string) $video['title'] ); ?></span>
								</div>
							<?php endif; ?>
						</div>
					</div>
				<?php endforeach; ?>
			</div>

			<?php if ( ! empty( $query_atts['gallery_pagination'] ) && (int) ( $attachments->max_num_pages ?? 1 ) > 1 ) : ?>
				<?php echo $this->render_pagination_html( (int) $attachments->max_num_pages, (int) $page_number ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php endif; ?>

			<!-- Gallery Popup Modal -->
			<div class="videopack-modal-overlay" style="display: none;">
				<div class="videopack-modal-container">
					<button type="button" class="modal-navigation modal-close" title="<?php esc_attr_e( 'Close', 'video-embed-thumbnail-generator' ); ?>">
						<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
							<path d="M13 11.8l6.1-6.1-1.2-1.2-6.1 6.1-6.1-6.1-1.2 1.2 6.1 6.1-6.1 6.1 1.2 1.2 6.1-6.1 6.1 6.1 1.2-1.2-6.1-6.1z"></path>
						</svg>
					</button>
					<button type="button" class="modal-navigation modal-next" title="<?php esc_attr_e( 'Next', 'video-embed-thumbnail-generator' ); ?>">
						<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
							<path d="M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4v-2z"></path>
						</svg>
					</button>
					<button type="button" class="modal-navigation modal-previous" title="<?php esc_attr_e( 'Previous', 'video-embed-thumbnail-generator' ); ?>">
						<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
							<path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20v-2z"></path>
						</svg>
					</button>
					<div class="modal-content">
						<!-- Player will be inserted here by JS -->
					</div>
				</div>
			</div>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * Renders the pagination HTML for the gallery.
	 *
	 * @param int $max_pages    The maximum number of pages.
	 * @param int $current_page The current active page.
	 * @return string The rendered pagination HTML.
	 */
	public function render_pagination_html( $max_pages, $current_page ) {
		$max_pages    = (int) $max_pages;
		$current_page = (int) $current_page;

		if ( $max_pages <= 1 ) {
			return '';
		}

		$pages = array();
		if ( $max_pages <= 7 ) {
			for ( $i = 1; $i <= $max_pages; $i++ ) {
				$pages[] = $i;
			}
		} else {
			$pages[] = 1;

			$start = max( 2, $current_page - 1 );
			$end   = min( $max_pages - 1, $current_page + 1 );

			if ( $current_page <= 3 ) {
				$end = 4;
			} elseif ( $current_page >= $max_pages - 2 ) {
				$start = $max_pages - 3;
			}

			if ( $start > 2 ) {
				$pages[] = '...';
			}

			for ( $i = $start; $i <= $end; $i++ ) {
				$pages[] = $i;
			}

			if ( $end < $max_pages - 1 ) {
				$pages[] = '...';
			}

			$pages[] = $max_pages;
		}

		ob_start();
		?>
		<div class="videopack-pagination">
			<button
				class="videopack-pagination-button <?php echo $current_page <= 1 ? 'videopack-hidden' : ''; ?>"
				data-page="<?php echo esc_attr( (string) ( $current_page - 1 ) ); ?>"
				aria-label="<?php esc_attr_e( 'Previous Page', 'video-embed-thumbnail-generator' ); ?>"
			>
				<span class="videopack-pagination-arrow">&lt;</span>
			</button>

			<?php foreach ( $pages as $page ) : ?>
				<?php
				$is_active   = $page === $current_page;
				$is_ellipsis = '...' === $page;
				$class       = 'videopack-pagination-button';
				if ( $is_active ) {
					$class .= ' is-active';
				}
				if ( $is_ellipsis ) {
					$class .= ' is-ellipsis';
				}
				?>
				<button
					class="<?php echo esc_attr( $class ); ?>"
					<?php disabled( $is_active || $is_ellipsis ); ?>
					data-page="<?php echo esc_attr( (string) $page ); ?>"
				>
					<?php echo esc_html( (string) $page ); ?>
				</button>
			<?php endforeach; ?>

			<button
				class="videopack-pagination-button <?php echo $current_page >= $max_pages ? 'videopack-hidden' : ''; ?>"
				data-page="<?php echo esc_attr( (string) ( $current_page + 1 ) ); ?>"
				aria-label="<?php esc_attr_e( 'Next Page', 'video-embed-thumbnail-generator' ); ?>"
			>
				<span class="videopack-pagination-arrow">&gt;</span>
			</button>
		</div>
		<?php
		return (string) ob_get_clean();
	}
}
