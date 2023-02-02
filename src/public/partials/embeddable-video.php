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

remove_action( 'wp_head', '_admin_bar_bump_cb' ); // don't show the WordPress admin bar if you're logged in
add_filter( 'show_admin_bar', '__return_false' );

if ( ! isset( $kgvid_video_embed ) ) {
	$current_post         = get_post();
	$first_embedded_video = kgvid_get_first_embedded_video( $current_post );
	$kgvid_video_embed    = $first_embedded_video;

	$shortcode = '[videopack';
	if ( ! empty( $kgvid_video_embed['id'] ) ) {
		$shortcode .= ' id="' . $kgvid_video_embed['id'] . '"';
	}
	$shortcode .= ' fullwidth="true"]' . $kgvid_video_embed['url'] . '[/videopack]';
} else {
	$shortcode = kgvid_generate_attachment_shortcode( $kgvid_video_embed );
}

?>
<!DOCTYPE html>
<html style="background-color:transparent;">
<head>
<?php
wp_head();
do_action( 'embed_head' );
?>
<style>body:before, body:after{ content: none; } .kgvid_wrapper { margin:0 !important; }
<?php
if ( array_key_exists( 'gallery', $kgvid_video_embed ) ) {
	?>
	.kgvid_below_video { color:white; } .kgvid_below_video a { color:aaa; }' <?php } ?></style>
</head>
<body class="content" style="margin:0px; font-family: sans-serif; padding:0px; border:none;
<?php
if ( array_key_exists( 'gallery', $kgvid_video_embed ) ) {
	?>
	$html .= 'background-color:black;
	<?php
} else {
	?>
	background-color:transparent; <?php } ?> ">
<?php
echo do_shortcode( $shortcode );
wp_footer();
do_action( 'embed_footer' );
?>
</body>
</html>
<?php
$content_width = $content_width_save; // reset $content_width
