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
	 * Videopack Options manager class instance.
	 *
	 * @var \Videopack\Admin\Options $options_manager
	 */
	protected $options_manager;

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
	 * @param \Videopack\Admin\Options $options_manager Videopack Options manager class instance.
	 */
	public function __construct( \Videopack\Admin\Options $options_manager ) {

		$this->options_manager = $options_manager;
		$this->options         = $options_manager->get_options();
		$this->attachment_meta = new \Videopack\Admin\Attachment_Meta( $options_manager );
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
			$query_atts['gallery_per_page'] = (int) ( $query_atts['videos'] ?? -1 );
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
			if ( 'category' === (string) $query_atts['gallery_source'] && ! empty( $query_atts['gallery_category'] ) ) {
				$args['cat'] = (int) $query_atts['gallery_category'];
			} elseif ( 'tag' === (string) $query_atts['gallery_source'] && ! empty( $query_atts['gallery_tag'] ) ) {
				$args['tag_id'] = (int) $query_atts['gallery_tag'];
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
		$shortcode = new Shortcode( $this->options_manager );
		$source    = \Videopack\Video_Source\Source_Factory::create( (int) $attachment->ID, $this->options_manager );
		if ( ! $source ) {
			return null;
		}

		// The shortcode class has logic to determine final attributes based on defaults, meta, and shortcode atts.
		// We need to replicate that to get the correct poster, dimensions, etc.
		$single_video_atts = (array) array_merge( (array) $gallery_atts, array( 'id' => (int) $attachment->ID ) );
		$final_atts        = (array) $shortcode->get_final_atts( (array) $single_video_atts, $source );

		$player = Video_Players\Player_Factory::create( (string) $this->options['embed_method'], $this->options_manager );
		$player->set_source( $source );
		$player->set_atts( (array) $final_atts );

		$player_vars               = (array) $player->prepare_video_vars();
		$player_vars['id']         = 'videopack_player_gallery_' . (int) $attachment->ID; // Ensure a unique ID for the player instance.
		$player_vars['sources']    = (array) $player->get_flat_sources();
		$player_vars['poster']     = (string) ( $final_atts['poster'] ?? '' );
		$player_vars['attachment'] = (int) $attachment->ID;
		$player_vars['starts']     = (int) ( $final_atts['starts'] ?? 0 );
		$player_vars['view_count'] = (string) ( $final_atts['view_count'] ?? '' );

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
		?>
		<div class="videopack-gallery-wrapper"
			data-gallery-settings="<?php echo esc_attr( (string) wp_json_encode( (array) $query_atts ) ); ?>"
			<?php if ( ! empty( $query_atts['gallery_columns'] ) && (int) $query_atts['gallery_columns'] > 0 ) : ?>
				style="--gallery-columns: <?php echo esc_attr( (string) $query_atts['gallery_columns'] ); ?>"
			<?php endif; ?>
		>
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
								<div class="play-button-container video-js <?php echo esc_attr( (string) ( $query_atts['skin'] ?? 'kg-video-js-skin' ) ); ?> vjs-big-play-centered vjs-paused vjs-controls-enabled">
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
				<div class="videopack-gallery-pagination">
					<?php echo $this->render_pagination_html( (int) $attachments->max_num_pages, (int) $page_number ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
			<?php endif; ?>

			<!-- Gallery Popup Modal -->
			<div class="videopack-modal-overlay" style="display: none;">
				<div class="videopack-modal-container">
					<button type="button" class="modal-navigation modal-close videopack-icons cross" title="<?php esc_attr_e( 'Close', 'video-embed-thumbnail-generator' ); ?>"></button>
					<button type="button" class="modal-navigation modal-next videopack-icons right-arrow" title="<?php esc_attr_e( 'Next', 'video-embed-thumbnail-generator' ); ?>"></button>
					<button type="button" class="modal-navigation modal-previous videopack-icons left-arrow" title="<?php esc_attr_e( 'Previous', 'video-embed-thumbnail-generator' ); ?>"></button>
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
		ob_start();
		?>
		<button
			class="videopack-pagination-arrow<?php echo ( $current_page > 1 ) ? '' : ' videopack-hidden'; ?>"
			data-page="<?php echo esc_attr( (string) ( $current_page - 1 ) ); ?>"
		>
			<span>&laquo;</span>
		</button>
		<?php for ( $i = 1; $i <= $max_pages; $i++ ) : ?>
			<div class="videopack-page-number-div">
				<button
					data-page="<?php echo esc_attr( (string) $i ); ?>"
					class="videopack-page-number<?php echo ( $i === $current_page ) ? ' current-page' : ''; ?>"
					<?php disabled( $i, $current_page ); ?>
				>
					<span><?php echo esc_html( (string) $i ); ?></span>
				</button>
				<span class="videopack-pagination-separator">
					<?php echo ( $i === $max_pages ) ? '' : '|'; ?>
				</span>
			</div>
		<?php endfor; ?>
		<button
			class="videopack-pagination-arrow<?php echo ( $current_page < $max_pages ) ? '' : ' videopack-hidden'; ?>"
			data-page="<?php echo esc_attr( (string) ( $current_page + 1 ) ); ?>"
		>
			<span>&raquo;</span>
		</button>
		<?php
		return (string) ob_get_clean();
	}
}
