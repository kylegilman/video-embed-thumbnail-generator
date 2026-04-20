<?php
/**
 * Template for a single gallery item (thumbnail).
 *
 * @package Videopack
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( "Can't load this file directly" );
}

/**
 * Expected variables in scope:
 *
 * @var array  $video      The video data (title, poster_url, attachment_id, player_vars).
 * @var array  $query_atts The collection/block settings (skin, gallery_title).
 * @var string $embed_method The current embed method from options.
 */

$embed_method   = $embed_method ?? 'Video.js';
$skin           = ! empty( $query_atts['skin'] ) ? $query_atts['skin'] : 'vjs-theme-videopack';
$id             = ! empty( $video['player_vars']['id'] ) ? $video['player_vars']['id'] : 'videopack_player_gallery_' . ( $video['attachment_id'] ?? 0 );
$has_title      = ! empty( $query_atts['showTitleOverlay'] ) || ! empty( $query_atts['gallery_title'] );
$show_duration  = ! empty( $query_atts['showDuration'] ) && ! empty( $video['duration'] );
$attachment_id  = ! empty( $video['attachment_id'] ) ? $video['attachment_id'] : 0;
$title_position = ! empty( $query_atts['titlePosition'] ) ? $query_atts['titlePosition'] : 'bottom';

$title_classes = array( 'video-title' );
if ( 'bottom' !== $title_position ) {
	$title_classes[] = 'position-' . (string) $title_position;
}

$classes = array( 'gallery-thumbnail', 'videopack-gallery-item', (string) $skin );
if ( ! empty( $video['has_custom_colors'] ) ) {
	$classes[] = 'videopack-has-custom-colors';
}

$wrapper_attrs = array(
	'class'               => implode( ' ', $classes ),
	'data-attachment-id'  => (string) $attachment_id,
	'data-videopack-id'   => (string) $id,
	'data-videopack-lightbox' => 'true',
);

if ( ! empty( $video['wrapper_style'] ) ) {
	$wrapper_attrs['style'] = $video['wrapper_style'];
}

// If we have external wrapper attributes (like block attributes from WordPress), they come as a string.
$extra_attrs = ! empty( $item_wrapper_attributes ) ? $item_wrapper_attributes : '';

?>
<?php
$opening_tag = '<div ';
foreach ( $wrapper_attrs as $key => $val ) {
	// Only print if the attribute isn't already in $extra_attrs (very simple check for class)
	if ( 'class' === $key && strpos( $extra_attrs, 'class="' ) !== false ) {
		continue; 
	}
	$opening_tag .= sprintf( '%s="%s" ', esc_attr( (string) $key ), esc_attr( (string) $val ) );
}
$opening_tag .= (string) $extra_attrs . '>';

echo wp_kses( $opening_tag, ( new \Videopack\Common\Validate() )->allowed_html() );
?>
	<div class="gallery-item-clickable-area">
		<img src="<?php echo esc_url( (string) $video['poster_url'] ); ?>"
			<?php
			if ( ! empty( $video['poster_srcset'] ) ) {
				printf( 'srcset="%s"', esc_attr( (string) $video['poster_srcset'] ) );
			}
			?>
			alt="<?php echo esc_attr( (string) $video['title'] ); ?>">

		<?php if ( 'WordPress Default' === $embed_method ) : ?>
			<div class="mejs-overlay mejs-layer mejs-overlay-play">
				<div class="mejs-overlay-button" role="button" tabindex="0" aria-label="<?php esc_attr_e( 'Play', 'video-embed-thumbnail-generator' ); ?>" aria-pressed="false"></div>
			</div>
		<?php elseif ( 'None' === $embed_method ) : ?>
			<div class="play-button-container videopack-none">
				<svg class="videopack-none-play-button" viewbox="0 0 100 100" title="<?php esc_attr_e( 'Play Video', 'video-embed-thumbnail-generator' ); ?>">
					<circle class="play-button-circle" cx="50" cy="50" r="45" />
					<polygon class="play-button-triangle" points="40,30 70,50 40,70" />
				</svg>
			</div>
		<?php else : ?>
			<div class="play-button-container video-js <?php echo esc_attr( (string) $skin ); ?> vjs-big-play-centered vjs-paused vjs-controls-enabled">
				<button class="vjs-big-play-button" type="button" title="<?php esc_attr_e( 'Play Video', 'video-embed-thumbnail-generator' ); ?>" aria-disabled="false">
					<span class="vjs-icon-placeholder" aria-hidden="true"></span>
					<span class="vjs-control-text" aria-live="polite"><?php esc_html_e( 'Play Video', 'video-embed-thumbnail-generator' ); ?></span>
				</button>
			</div>
		<?php endif; ?>

		<?php if ( $show_duration ) : ?>
			<span class="videopack-grid-duration"><?php echo esc_html( (string) $video['duration'] ); ?></span>
		<?php endif; ?>

		<?php if ( $has_title ) : ?>
			<div class="<?php echo esc_attr( implode( ' ', $title_classes ) ); ?>">
				<div class="video-title-background"></div>
				<span class="video-title-text"><?php echo esc_html( (string) $video['title'] ); ?></span>
			</div>
		<?php endif; ?>
	</div>
</div>
