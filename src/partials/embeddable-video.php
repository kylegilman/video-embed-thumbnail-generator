<?php
/**
 * Template for displaying a single embeddable video and nothing else
 */

 if ( ! defined( 'ABSPATH' ) ) {
	die( "Can't load this file directly" );
}

?>
<!DOCTYPE html>
<html style="background-color:transparent;">
<head>
<?php wp_head(); ?>
<style>body:before, body:after{ content: none; } .kgvid_wrapper { margin:0 !important; } <?php if ( array_key_exists('gallery', $kgvid_video_embed) ) { ?> .kgvid_below_video { color:white; } .kgvid_below_video a { color:aaa; }' <?php } ?></style>
</head>
<body class="content" style="margin:0px; font-family: sans-serif; padding:0px; border:none; <?php if ( array_key_exists('gallery', $kgvid_video_embed) ) { ?> $html .= 'background-color:black; <?php } else { ?> background-color:transparent; <?php } ?> ">
<?php echo do_shortcode( $shortcode );
wp_footer(); ?>
</body>
</html>
<?php
