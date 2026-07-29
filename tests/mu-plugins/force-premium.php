<?php
/**
 * Local-dev-only override to exercise premium (Freemius-gated) plugin code
 * paths without a real license, for testing purposes.
 *
 * This file lives under tests/ specifically because build-zip.ps1 stages the
 * distributable ZIP from an explicit include-list that never references
 * tests/ — it is never packaged into a release, regardless of what it
 * contains. It only runs at all when wp-env's mappings config mounts
 * tests/mu-plugins into wp-content/mu-plugins (see .wp-env.json /
 * .wp-env.override.json) — real installs never load it.
 *
 * The plugin bootstrap files themselves are intentionally left completely
 * unmodified. Both videopack-player-pro and videopack-cloud-streaming guard
 * their own licensing wrapper function (videopack_player_pro_is_licensed() /
 * videopack_cloud_streaming_is_licensed()) with function_exists() — the same
 * idiom already used for their Freemius accessor functions. Since mu-plugins
 * load before regular plugins, pre-defining these two functions here to
 * simply return true makes both the top-level bootstrap gate AND every
 * Hook_Subscriber's Premium_Hook_Subscriber_Trait check (which call the same
 * wrapper) see a licensed install, with no bypass conditional ever shipped
 * in the real plugin files.
 *
 * @package Videopack
 */

if ( ! defined( 'VIDEOPACK_FORCE_PREMIUM_FOR_TESTING' ) || ! VIDEOPACK_FORCE_PREMIUM_FOR_TESTING ) {
	return;
}

if ( ! function_exists( 'videopack_player_pro_is_licensed' ) ) {
	function videopack_player_pro_is_licensed() {
		return true;
	}
}

if ( ! function_exists( 'videopack_cloud_streaming_is_licensed' ) ) {
	function videopack_cloud_streaming_is_licensed() {
		return true;
	}
}
