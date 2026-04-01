<?php
/**
 * Template for displaying a video collection (gallery or list).
 *
 * @package Videopack
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( "Can't load this file directly" );
}

/**
 * Expected variables in scope:
 *
 * @var \Videopack\Frontend\Gallery $this          The Gallery instance.
 * @var string                       $layout       Layout type ('gallery' or 'list').
 * @var array                        $query_atts   Sanitized shortcode/block attributes.
 * @var int                          $page_number  Current page number.
 * @var int                          $max_num_pages Total number of pages.
 * @var array                        $videos_data  Prepared video data for display.
 */

$classes    = array( 'videopack-collection-wrapper' );
$classes[]  = 'gallery' === $layout ? 'videopack-gallery-wrapper' : 'videopack-list-wrapper';
$style_vars = array();

if ( 'gallery' === $layout && ! empty( $query_atts['gallery_columns'] ) && (int) $query_atts['gallery_columns'] > 0 ) {
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


?>
<div class="<?php echo esc_attr( (string) implode( ' ', $classes ) ); ?>"
	data-videopack-ajax-collection="true"
	data-layout="<?php echo esc_attr( (string) $layout ); ?>"
	data-settings="<?php echo esc_attr( (string) wp_json_encode( $query_atts ) ); ?>"
	data-current-page="<?php echo esc_attr( (string) $page_number ); ?>"
	data-total-pages="<?php echo esc_attr( (string) $max_num_pages ); ?>"
	<?php if ( ! empty( $style_vars ) ) : ?>
		style="<?php echo esc_attr( (string) implode( '; ', $style_vars ) ); ?>"
	<?php endif; ?>
>
	<?php if ( 'gallery' === $layout ) : ?>
		<div class="videopack-gallery-items"
			<?php if ( ! empty( $query_atts['gallery_columns'] ) && (int) $query_atts['gallery_columns'] > 0 ) : ?>
				style="--gallery-columns: <?php echo esc_attr( (string) $query_atts['gallery_columns'] ); ?>"
			<?php endif; ?>
		>
			<?php foreach ( (array) $videos_data as $video ) : ?>
				<div class="gallery-thumbnail videopack-gallery-item <?php echo esc_attr( (string) ( $query_atts['skin'] ?? '' ) ); ?>" data-attachment-id="<?php echo esc_attr( (string) $video['attachment_id'] ); ?>" data-videopack-id="<?php echo esc_attr( (string) $video['player_vars']['id'] ); ?>">
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
						<?php elseif ( 'None' === (string) ( $this->options['embed_method'] ?? '' ) ) : ?>
							<div class="play-button-container videopack-none">
								<svg class="videopack-none-play-button" viewbox="0 0 100 100" title="<?php esc_attr_e( 'Play Video', 'video-embed-thumbnail-generator' ); ?>">
									<circle class="play-button-circle" cx="50" cy="50" r="45" />
									<polygon class="play-button-triangle" points="40,30 70,50 40,70" />
								</svg>
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
	<?php else : ?>
		<div class="videopack-video-list">
			<?php foreach ( (array) $videos_data as $video ) : ?>
				<div class="videopack-list-item">
					<?php echo $video['player_vars']['full_player_html']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $query_atts['gallery_pagination'] ) && $max_num_pages > 1 ) : ?>
		<?php echo $this->render_pagination_html( $max_num_pages, $page_number ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	<?php endif; ?>

	<?php if ( 'gallery' === $layout ) : ?>
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
	<?php endif; ?>
</div>
