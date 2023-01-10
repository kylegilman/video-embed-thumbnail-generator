<?php
/**
 * Template for displaying a single embeddable video
 */
global $content_width;
$content_width_save = $content_width;
$content_width = 4096;
global $post;
global $wp_query;

if ( is_object($wp_query) && isset($wp_query->query_vars['videopack']) ) {
    $kgvid_video_embed = $wp_query->query_vars['videopack'];
}
elseif ( is_object($wp_query) && isset($wp_query->query_vars['kgvid_video_embed']) ) {
    $kgvid_video_embed = $wp_query->query_vars['kgvid_video_embed'];
}

$kgvid_video_embed['enable'] = 'true';

$shortcode = kgvid_generate_attachment_shortcode($kgvid_video_embed);

?>
<html style="background-color:transparent;"><head>
<?php wp_head(); ?>
<style>body:before, body:after{ content: none; } .kgvid_wrapper { margin:0 !important; } <?php if ( array_key_exists('gallery', $kgvid_video_embed) ) { ?> .kgvid_below_video { color:white; } .kgvid_below_video a { color:aaa; }' <?php } ?></style>
</head><body class="content" style="margin:0px; font-family: sans-serif; padding:0px; border:none; <?php if ( array_key_exists('gallery', $kgvid_video_embed) ) { ?> $html .= 'background-color:black; <?php } else { ?> background-color:transparent; <?php } ?> ">
<?php echo do_shortcode( $shortcode );
wp_footer();
?>
</body></html>
<?php $content_width = $content_width_save; //reset $content_width
