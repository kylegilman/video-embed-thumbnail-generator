<?php
/**
 * E2E fixture content seed script.
 *
 * Run via: npm run e2e:seed
 * (wraps: wp-env run cli wp eval-file tests/e2e/seed.php)
 *
 * Idempotent — safe to re-run. Looks up existing attachments/pages by title/
 * slug instead of creating duplicates, so re-seeding after `wp-env start`
 * (which persists its database volume between runs) doesn't pile up content.
 *
 * Which player actually renders the single-video page is controlled by the
 * global 'embed_method' option, switched per spec file via
 * tests/e2e/helpers.js — this script only creates the content, once.
 *
 * @package Videopack
 */

if ( ! defined( 'ABSPATH' ) ) {
	echo "This script must be run via WP-CLI's eval-file, not directly.\n";
	exit( 1 );
}

/**
 * Imports a video from src/images/ as a media attachment, reusing an
 * existing attachment of the same title if one is already present.
 *
 * @param string $filename Filename under src/images/.
 * @param string $title    Attachment title to look up/create by.
 * @return int Attachment ID.
 */
function videopack_e2e_import_video( string $filename, string $title ): int {
	$existing = get_posts(
		array(
			'post_type'      => 'attachment',
			'post_status'    => 'inherit',
			'title'          => $title,
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);
	if ( ! empty( $existing ) ) {
		return (int) $existing[0];
	}

	$path = dirname( __DIR__, 2 ) . '/src/images/' . $filename;
	if ( ! file_exists( $path ) ) {
		WP_CLI::error( "Fixture video not found: $path" );
	}

	$upload = wp_upload_bits( $title . '.mp4', null, (string) file_get_contents( $path ) );
	if ( ! empty( $upload['error'] ) ) {
		WP_CLI::error( 'Upload failed for ' . $title . ': ' . $upload['error'] );
	}

	$attachment_id = wp_insert_attachment(
		array(
			'post_mime_type' => 'video/mp4',
			'post_title'     => $title,
			'post_status'    => 'inherit',
		),
		$upload['file']
	);

	require_once ABSPATH . 'wp-admin/includes/image.php';
	wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $upload['file'] ) );

	return (int) $attachment_id;
}

/**
 * Creates or updates a page by slug, so re-running this script updates
 * content in place rather than creating duplicate pages.
 *
 * @param string $slug    Page slug.
 * @param string $title   Page title.
 * @param string $content Page content (shortcode markup).
 * @return int Page ID.
 */
function videopack_e2e_upsert_page( string $slug, string $title, string $content ): int {
	$existing = get_page_by_path( $slug, OBJECT, 'page' );
	$post_arr = array(
		'post_title'   => $title,
		'post_name'    => $slug,
		'post_content' => $content,
		'post_status'  => 'publish',
		'post_type'    => 'page',
	);
	if ( $existing ) {
		$post_arr['ID'] = $existing->ID;
		wp_update_post( $post_arr );
		return (int) $existing->ID;
	}
	return (int) wp_insert_post( $post_arr );
}

// --- Single video page (used by the Video.js classic, MEJS, and v10 specs —
// each switches the global embed_method option before visiting this page). ---
//
// The video's title/slug is deliberately NOT the same string as the page's
// slug below ('videopack-e2e-single') — WordPress's get_page_by_path()
// (used by videopack_e2e_upsert_page()'s idempotency check) does not
// reliably respect its own $post_type filter when a non-page post shares
// the exact same slug: on a real run here it returned the attachment
// instead of no-match, and the subsequent wp_update_post() call — believing
// it was updating an existing PAGE — silently converted the video
// attachment itself into the page (post_type, post_content, and all).

$single_video_id = videopack_e2e_import_video( 'Adobestock_287460179.mp4', 'videopack-e2e-single-source' );

videopack_e2e_upsert_page(
	'videopack-e2e-single',
	'Videopack E2E - Single Video',
	sprintf(
		'[videopack id="%d" downloadlink="true" embedcode="true" view_count="true"]',
		$single_video_id
	)
);

// --- Gallery page: 6 attachments (3 copies of each sample video) with
// gallery_per_page=2, so pagination has 3 pages to click through. ---

$gallery_source_files = array( 'Adobestock_287460179.mp4', 'Adobestock_469037984.mp4' );
$gallery_ids          = array();

foreach ( $gallery_source_files as $filename ) {
	for ( $copy = 1; $copy <= 3; $copy++ ) {
		$title          = sprintf( '%s (e2e gallery %d)', $filename, $copy );
		$gallery_ids[] = videopack_e2e_import_video( $filename, $title );
	}
}

videopack_e2e_upsert_page(
	'videopack-e2e-gallery',
	'Videopack E2E - Gallery',
	sprintf(
		'[videopack gallery="true" gallery_include="%s" gallery_pagination="true" gallery_per_page="2"]',
		implode( ',', $gallery_ids )
	)
);

// --- Behavioral attributes page: several independent [videopack] shortcode
// instances, each isolated in its own #test-* container so a Playwright
// spec can scope queries to exactly one without disturbing the others.
// Covers the handful of documented attributes whose correctness is
// genuinely JS-behavioral (autoplay actually autoplaying, right_click
// actually blocking the context menu, etc.) rather than just HTML shape —
// see tests/ShortcodeAttributesTest.php for everything else. ---

videopack_e2e_upsert_page(
	'videopack-e2e-behavioral',
	'Videopack E2E - Behavioral Attributes',
	implode(
		"\n",
		array(
			sprintf( '<div id="test-autoplay-muted">[videopack id="%d" autoplay="true" muted="true" controls="false"]</div>', $single_video_id ),
			sprintf( '<div id="test-loop">[videopack id="%d" loop="true" controls="false"]</div>', $single_video_id ),
			sprintf( '<div id="test-pauseothervideos-a">[videopack id="%d" pauseothervideos="true" instanceId="e2e_pause_a"]</div>', $single_video_id ),
			sprintf( '<div id="test-pauseothervideos-b">[videopack id="%d" pauseothervideos="true" instanceId="e2e_pause_b"]</div>', $single_video_id ),
			sprintf( '<div id="test-skip-buttons">[videopack id="%d" skip_buttons="true"]</div>', $single_video_id ),
			sprintf( '<div id="test-right-click-disabled">[videopack id="%d" right_click="false"]</div>', $single_video_id ),
		)
	)
);

WP_CLI::success( 'Videopack E2E fixture content ready.' );
