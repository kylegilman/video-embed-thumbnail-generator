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
		if ( (
			$query_atts['gallery_pagination'] != true
				&& empty( $query_atts['gallery_per_page'] )
			)
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
				if ( $query_atts['gallery_per_page'] > 0 && count( $include_arr ) > $query_atts['gallery_per_page'] ) {
					$total_pages      = ceil( count( $include_arr ) / $query_atts['gallery_per_page'] );
					$offset           = ( $page_number - 1 ) * $query_atts['gallery_per_page'];
					$args['post__in'] = array_slice( $include_arr, $offset, $query_atts['gallery_per_page'] );
				} else {
					$args['post__in'] = $include_arr;
				}
				unset( $args['paged'] );
				if ( $args['orderby'] == 'menu_order ID' ) {
					$args['orderby'] = 'post__in'; // sort by order of IDs in the gallery_include parameter
				}
				unset( $args['post_parent'] );
			}
		}

		$attachments = new \WP_Query( $args );

		if ( ! empty( $include_arr ) && isset( $total_pages ) ) {
			$attachments->max_num_pages = $total_pages;
		}

		if ( $attachments->have_posts() ) {
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
	 * @param \WP_Post $attachment The video attachment post object.
	 * @param array    $gallery_atts The attributes for the gallery.
	 * @return array|null The prepared data array or null on failure.
	 */
	public function prepare_video_data_for_js( \WP_Post $attachment, array $gallery_atts ): ?array {
		$shortcode = new Shortcode( $this->options_manager );
		$source    = \Videopack\Video_Source\Source_Factory::create( $attachment->ID, $this->options_manager );
		if ( ! $source ) {
			return null;
		}

		// The shortcode class has logic to determine final attributes based on defaults, meta, and shortcode atts.
		// We need to replicate that to get the correct poster, dimensions, etc.
		$single_video_atts = array_merge( $gallery_atts, array( 'id' => $attachment->ID ) );
		$final_atts        = $shortcode->get_final_atts( $single_video_atts, $source );

		$player = Video_Players\Player_Factory::create( $this->options['embed_method'], $this->options_manager );
		$player->set_source( $source );
		$player->set_atts( $final_atts );

		$player_vars               = $player->prepare_video_vars();
		$player_vars['id']         = 'videopack_player_gallery_' . $attachment->ID; // Ensure a unique ID for the player instance.
		$player_vars['sources']    = $player->get_sources();
		$player_vars['poster']     = $final_atts['poster'];
		$player_vars['attachment'] = $attachment->ID;

		$poster_id = get_post_meta( $attachment->ID, '_kgflashmediaplayer-poster-id', true );
		if ( ! $poster_id ) {
			$poster_id = get_post_thumbnail_id( $attachment->ID );
		}

		return array(
			'attachment_id' => $attachment->ID,
			'title'         => get_the_title( $attachment ),
			'poster_url'    => $final_atts['poster'],
			'poster_srcset' => $poster_id ? wp_get_attachment_image_srcset( $poster_id, 'medium_large' ) : '',
			'player_vars'   => $player_vars,
		);
	}

	public function gallery_page( $page_number, $query_atts, $last_video_id = 0 ) {
		$attachments = $this->get_gallery_videos( $page_number, $query_atts );
		$videos_data = array();

		if ( $attachments->have_posts() ) {
			foreach ( $attachments->posts as $attachment ) {
				$video_data = $this->prepare_video_data_for_js( $attachment, $query_atts );
				if ( $video_data ) {
					$videos_data[] = $video_data;
					// Add player vars to the inline script data for the initial page load.
					$script = sprintf(
						'window.Videopack = window.Videopack || {}; window.Videopack.player_data = window.Videopack.player_data || {}; window.Videopack.player_data["%1$s"] = %2$s;',
						$video_data['player_vars']['id'],
						wp_json_encode( $video_data['player_vars'] )
					);
					wp_add_inline_script( 'videopack', $script );
				}
			}
		}
		ob_start();
		?>
		<div class="videopack-gallery-wrapper" data-gallery-settings="<?php echo esc_attr( wp_json_encode( $query_atts ) ); ?>">
			<div class="videopack-gallery-grid">
				<?php foreach ( $videos_data as $video ) : ?>
					<div class="videopack-gallery-thumbnail" data-attachment-id="<?php echo esc_attr( $video['attachment_id'] ); ?>">
						<a href="#">
							<img src="<?php echo esc_url( $video['poster_url'] ); ?>"
								<?php
								if ( ! empty( $video['poster_srcset'] ) ) {
									printf( 'srcset="%s"', esc_attr( $video['poster_srcset'] ) );
								}
								?>
								alt="<?php echo esc_attr( $video['title'] ); ?>">
							<div class="videopack-gallery-play-button"></div>
							<?php if ( 'true' === $query_atts['gallery_title'] ) : ?>
								<div class="videopack-gallery-title-overlay">
									<span><?php echo esc_html( $video['title'] ); ?></span>
								</div>
							<?php endif; ?>
						</a>
					</div>
				<?php endforeach; ?>
			</div>

			<div class="videopack-gallery-pagination">
				<?php echo $this->render_pagination_html( $attachments->max_num_pages, $page_number ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>

			<!-- Gallery Popup Modal -->
			<div class="videopack-gallery-popup" style="display: none;">
				<div class="videopack-gallery-popup-overlay"></div>
				<div class="videopack-gallery-popup-content">
					<button class="videopack-gallery-popup-close">&times;</button>
					<div class="videopack-gallery-player-container">
						<!-- Player will be inserted here by JS -->
					</div>
					<button class="videopack-gallery-popup-prev">&larr;</button>
					<button class="videopack-gallery-popup-next">&rarr;</button>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	public function render_pagination_html( $max_pages, $current_page ) {
		if ( $max_pages <= 1 ) {
			return '';
		}
		ob_start();
		?>
		<span class="videopack-gallery-pagination-arrow prev" <?php echo ( 1 === $current_page ) ? 'style="visibility:hidden;"' : ''; ?>>
			<a href="#" data-page="<?php echo esc_attr( $current_page - 1 ); ?>">&larr;</a>
		</span>
		<?php for ( $i = 1; $i <= $max_pages; $i++ ) : ?>
			<?php if ( $i === $current_page ) : ?>
				<span class="videopack-gallery-pagination-selected"><?php echo esc_html( $i ); ?></span>
			<?php else : ?>
				<span class="videopack-gallery-page-number">
					<a href="#" data-page="<?php echo esc_attr( $i ); ?>"><?php echo esc_html( $i ); ?></a>
				</span>
			<?php endif; ?>
		<?php endfor; ?>
		<span class="videopack-gallery-pagination-arrow next" <?php echo ( $current_page === $max_pages ) ? 'style="visibility:hidden;"' : ''; ?>>
			<a href="#" data-page="<?php echo esc_attr( $current_page + 1 ); ?>">&rarr;</a>
		</span>
		<?php
		return ob_get_clean();
	}
}
