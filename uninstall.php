<?php
	if ( !defined( 'WP_UNINSTALL_PLUGIN' ) ) { exit(); }

	if ( !is_multisite() ) {
    	delete_option('kgvid_video_embed_options');
    	delete_option('kgvid_video_embed_queue');
    }
    else {

    	delete_site_option( 'kgvid_video_embed_network_options' );
    	delete_site_option( 'kgvid_video_embed_queue' );

    	$sites = wp_get_sites();

    	if ( is_array($sites) ) {

			foreach ( $sites as $site ) {
				delete_blog_option( $site['blog_id'], 'kgvid_video_embed_options' );
				delete_blog_option( $site['blog_id'], 'kgvid_video_embed_queue');
			}
		}
    }
?>
