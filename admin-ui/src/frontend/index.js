/**
 * Videopack Frontend JS — entry point for the 'videopack-core' build.
 *
 * Unmodified passthrough of the former plain-script src/Frontend/js/videopack.js,
 * moved here to run through the admin-ui build pipeline. Will be split into
 * the sibling modules in this directory incrementally; this file is not the
 * final shape.
 *
 * @package
 */

import { initFullscreenResizeListener } from './resolution';
import { initPlayers, initModularBlocks, onMejsSuccess } from './players/init';
import {
	initCollection,
	handleGlobalLightboxClick,
	handleGlobalPaginationClick,
} from './gallery';
import * as publicApi from './public-api';
// Namespace imports of the modules split out of this file so far, purely to
// re-expose their exports on window.videopack below — every function that's
// been extracted was previously a public property on this same object
// (external code, e.g. a theme, could always call window.videopack.toggleShare()
// directly), and losing that silently would be a real regression. Internal
// call sites in this file use the named imports above instead.
import * as utils from './utils';
import * as analytics from './analytics';
import * as metaBar from './meta-bar';
import * as videoTitle from './video-title';
import * as resolution from './resolution';
import * as playerInit from './players/init';
import * as videoJsPlayer from './players/video-js';
import * as mejsPlayer from './players/mejs';
import * as gallery from './gallery';

( function () {
	'use strict';

	/**
	 * Main Videopack object.
	 *
	 * @since 5.0.0
	 */
	const videopack_obj = {
		/**
		 * Initialize video players.
		 *
		 * @since 5.0.0
		 */
		init() {
			initPlayers();
			initModularBlocks();

			// Initialize collections (Gallery, Grid, List) with pagination
			document
				.querySelectorAll( '.videopack-collection-wrapper' )
				.forEach( ( element ) => {
					initCollection( element );
				} );

			// Global lightbox listener for modular blocks
			document.addEventListener( 'click', ( e ) => {
				const lightboxTrigger = e.target.closest(
					'[data-videopack-lightbox="true"]'
				);
				if ( lightboxTrigger ) {
					handleGlobalLightboxClick( e, lightboxTrigger );
				}

				const pageLink = e.target.closest(
					'.videopack-pagination .page-numbers, .videopack-pagination-button'
				);
				if (
					pageLink &&
					! pageLink.classList.contains( 'current' ) &&
					! pageLink.disabled
				) {
					handleGlobalPaginationClick( e, pageLink );
				}
			} );

			// Re-check automatic resolution on entering/exiting fullscreen
			// (see resolution.js for why this needs to be generic/document-level).
			initFullscreenResizeListener();

			// Fallback for MediaElement.js players initialized by other plugins/themes.
			if ( typeof window.mejs !== 'undefined' ) {
				// This is a bit of a hack to catch MEJS players initialized after our script runs.
				const originalSuccess = window.mejs.MepDefaults.success;
				window.mejs.MepDefaults.success = (
					mediaElement,
					domObject,
					player
				) => {
					if ( typeof originalSuccess === 'function' ) {
						originalSuccess( mediaElement, domObject, player );
					}
					onMejsSuccess( mediaElement, domObject, player );
				};

				// WordPress specific settings hook
				window._wpmejsSettings = window._wpmejsSettings || {};
				const originalWpSuccess = window._wpmejsSettings.success;
				window._wpmejsSettings.success = (
					mediaElement,
					domObject,
					player
				) => {
					if ( typeof originalWpSuccess === 'function' ) {
						originalWpSuccess( mediaElement, domObject, player );
					}
					onMejsSuccess( mediaElement, domObject, player );
				};
			}
		},

		// getPlayerVars/initPlayers/initModularBlocks/initPlayer/onMejsSuccess/
		// setupVideo moved to players/init.js. loadVideoJS/setupVideoJSPlayer
		// moved to players/video-js.js. setupMEJSPlayer moved to players/mejs.js.

		// resizeVideo/setAutomaticResolution/registerResolutionHandler/
		// initFullscreenResizeListener moved to resolution.js.

		// sendGoogleAnalytics/videoCounter moved to analytics.js.
		// convertToTimecode/convertFromTimecode moved to utils.js.

		// toggleShare/checkDownloadLink/openPopup/getShareUrl/setStartAt/changeStartAt
		// moved to meta-bar.js.

		// setupGalleryItemScaling/initCollection/initGallery/initList/openGalleryPopup/
		// destroyCurrentGalleryPlayer/disposePlayersInElement/closeGalleryPopup/
		// navigateGalleryPopup/handleGlobalLightboxClick/handleCollectionPaginationClick/
		// handleGlobalPaginationClick/handleGalleryPaginationClick/loadCollectionPage/
		// loadGalleryPage/renderGalleryPagination moved to gallery.js.
	};

	// Expose the videopack object to the global scope, merging with any existing properties (like player_data).
	// `api` is the supported cross-plugin surface (see public-api.js) — never
	// overwritten wholesale, only merged, so a plugin loaded before or after
	// this one can't clobber the other's contribution. utils/analytics/meta-bar
	// are spread in directly (not nested) to match where these functions have
	// always lived on window.videopack, now that they're split into modules.
	window.videopack = Object.assign(
		window.videopack || {},
		utils,
		analytics,
		metaBar,
		videoTitle,
		resolution,
		playerInit,
		videoJsPlayer,
		mejsPlayer,
		gallery,
		videopack_obj,
		{
			api: Object.assign(
				{},
				window.videopack && window.videopack.api,
				publicApi
			),
		}
	);

	document.addEventListener( 'DOMContentLoaded', () =>
		window.videopack.init()
	);
} )();
