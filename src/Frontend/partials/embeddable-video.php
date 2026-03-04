<?php
/**
 * Template for displaying a single embeddable video and nothing else
 *
 * @package Videopack
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( "Can't load this file directly" );
}

global $content_width;
$content_width_save = $content_width;
$content_width      = 4096;

remove_action( 'wp_head', '_admin_bar_bump_cb' ); // Don't show the WordPress admin bar if you're logged in.
add_filter( 'show_admin_bar', '__return_false' );

$options_manager = apply_filters( 'videopack_get_options_manager', null );
if ( ! $options_manager ) {
	$options_manager = new \Videopack\Admin\Options();
	$options_manager->load_options();
}

$shortcode_handler = new \Videopack\Frontend\Shortcode( $options_manager );

if ( ! isset( $kgvid_video_embed ) || ! is_array( $kgvid_video_embed ) ) {
	$current_post         = get_post();
	$metadata             = new \Videopack\Frontend\Metadata( $options_manager );
	$first_embedded_video = $metadata->get_first_embedded_video( $current_post );
	$kgvid_video_embed    = $first_embedded_video;

	$shortcode = '[videopack';
	if ( ! empty( $kgvid_video_embed['id'] ) ) {
		$shortcode .= ' id="' . esc_attr( $kgvid_video_embed['id'] ) . '"';
	}
	$shortcode .= ' fullwidth="true" count_views="false" view_count="false"]' . esc_url( $kgvid_video_embed['url'] ) . '[/videopack]';
} else {
	$shortcode = $shortcode_handler->generate_attachment_shortcode( $kgvid_video_embed );
}

?>
<!DOCTYPE html>
<html style="background-color:transparent;" <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php
wp_head();
do_action( 'embed_head' );
?>
<style>
	body:before, body:after { content: none; }
	.kgvid_wrapper { margin:0 !important; }
	<?php if ( is_array( $kgvid_video_embed ) && array_key_exists( 'gallery', $kgvid_video_embed ) ) : ?>
		.kgvid_below_video { color:white; }
		.kgvid_below_video a { color:#aaa; }
	<?php endif; ?>
</style>
</head>
<body <?php body_class( 'content' ); ?> style="margin:0px; font-family: sans-serif; padding:0px; border:none; <?php echo ( is_array( $kgvid_video_embed ) && array_key_exists( 'gallery', $kgvid_video_embed ) ) ? 'background-color:black;' : 'background-color:transparent;'; ?>">
<?php
echo do_shortcode( $shortcode );
wp_footer();
do_action( 'embed_footer' );
?>
</body>
</html>
<?php
$content_width = $content_width_save; // Reset $content_width.
