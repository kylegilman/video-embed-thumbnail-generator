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

$classes      = array( 'videopack-collection-wrapper' );
$classes[]    = 'gallery' === $layout ? 'videopack-gallery-wrapper' : 'videopack-list-wrapper';
$embed_method = $this->options['embed_method'] ?? 'Video.js';
$style_vars   = array();

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
}

$play_button_secondary_color = ! empty( $query_atts['play_button_secondary_color'] ) ? $query_atts['play_button_secondary_color'] : ( $this->options['play_button_secondary_color'] ?? '' );
if ( ! empty( $play_button_secondary_color ) ) {
	$style_vars[] = '--videopack-play-button-secondary-color: ' . esc_attr( (string) $play_button_secondary_color );
	$classes[]    = 'videopack-has-play-button-secondary-color';
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

if ( 'WordPress Default' === $embed_method ) {
	$style_vars[] = '--videopack-mejs-controls-svg: url(' . includes_url( 'js/mediaelement/mejs-controls.svg' ) . ')';
}


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
				<?php include __DIR__ . '/gallery-item.php'; ?>
			<?php endforeach; ?>
		</div>
	<?php else : ?>
		<div class="videopack-video-list">
			<?php foreach ( (array) $videos_data as $video ) : ?>
				<div class="videopack-list-item">
					<?php echo wp_kses( $video['player_vars']['full_player_html'], ( new \Videopack\Common\Validate() )->allowed_html() ); ?>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>

	<?php if ( ! empty( $query_atts['gallery_pagination'] ) && $max_num_pages > 1 ) : ?>
		<?php echo wp_kses( $this->render_pagination_html( $max_num_pages, $page_number ), ( new \Videopack\Common\Validate() )->allowed_html() ); ?>
	<?php endif; ?>
</div>
