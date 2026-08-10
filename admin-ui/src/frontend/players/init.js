/**
 * Player discovery/bootstrap: finding `.videopack-player` elements on the
 * page, reading their embedded video variables, and dispatching to the
 * right player-type setup (Video.js classic or MediaElement.js — anything
 * else, e.g. an add-on's own player, just gets the generic post-init setup
 * below).
 *
 * setupVideo() here and loadVideoJS()/setupVideoJSPlayer() (./video-js.js)
 * call into each other — a deliberate circular import between this file
 * and video-js.js. Safe because neither side calls the other at module top
 * level, only from within functions invoked well after both modules have
 * finished loading.
 */

/* global ResizeObserver */

import { setupMetaBar } from '../meta-bar';
import { setupVideoTitle } from '../video-title';
import { resizeVideo } from '../resolution';
import { loadVideoJS, setupVideoJSPlayer } from './video-js';
import { setupMEJSPlayer } from './mejs';

/**
 * Reads a player's own video variables directly off its `.videopack-player`
 * element (embedded server-side as data-player-vars — see Player::
 * get_player_start_html()), rather than looking them up in a separate,
 * ID-keyed global object. The element passed in doesn't have to be the
 * `.videopack-player` div itself; the closest one is used.
 *
 * @param {HTMLElement} el Any element at or inside a `.videopack-player`.
 * @return {object|null} The parsed video variables, or null if absent/invalid.
 */
export function getPlayerVars( el ) {
	const playerEl = el.closest( '.videopack-player' ) || el;
	if ( ! playerEl.dataset.playerVars ) {
		return null;
	}
	try {
		return JSON.parse( playerEl.dataset.playerVars );
	} catch {
		return null;
	}
}

/**
 * Initializes players within a container.
 *
 * @param {HTMLElement|Document} container The container to search for players.
 */
export function initPlayers( container = document ) {
	container.querySelectorAll( '.videopack-player' ).forEach( ( element ) => {
		initPlayer( element );
	} );
}

/**
 * Initializes standalone modular blocks (title overlays on thumbnails, etc.)
 *
 * @param {HTMLElement|Document} container The container to search.
 */
export function initModularBlocks( container = document ) {
	// setupMetaBar() must be called with the share/download wrapper itself,
	// not a broader ancestor container — it reads is-overlay/
	// is-inside-thumbnail/is-inside-title-meta directly off whatever element
	// it's given (for the portal-lift decision), and captures that same
	// element by reference in the share-toggle's click-listener closure (for
	// toggleShare()'s later is-open class toggling). setupMetaBar()'s own
	// per-element dataset guard (videopackMetaInitialized) means only the
	// *first* call for a given button actually attaches its listener, so a
	// broader "does this container have a share/download somewhere inside
	// it" call (an earlier version of this function had one, alongside this
	// loop) would win that race with the wrong element and silently break
	// both of the above — there is no need for such a call now, this loop on
	// its own already reaches every share/download wrapper regardless of
	// ancestor.
	container
		.querySelectorAll(
			'.videopack-download-wrapper, .videopack-share-wrapper'
		)
		.forEach( ( element ) => {
			setupMetaBar( element );
		} );
}

/**
 * Initializes a single player.
 *
 * @param {HTMLElement} playerWrapper The player wrapper element.
 * @return {*} The result of the player-type-specific loader, if any.
 */
export function initPlayer( playerWrapper ) {
	if ( playerWrapper.dataset.videopackInitialized ) {
		return;
	}
	const videoVars = getPlayerVars( playerWrapper );

	if ( ! videoVars ) {
		return;
	}

	if ( videoVars.embed_method === 'Video.js' ) {
		return loadVideoJS( playerWrapper, videoVars );
	} else if ( videoVars.embed_method === 'WordPress Default' ) {
		const container = playerWrapper.querySelector( '.mejs-container' );

		if ( container ) {
			// Already constructed -- e.g. the lightbox/gallery path built
			// this same markup ahead of time.
			setupVideo( playerWrapper, videoVars );
			return;
		}

		// Videopack always constructs its own MediaElementPlayer instance
		// explicitly with this video's own settings (see
		// Player_WordPress_Default::get_player_script_handles()'s docblock
		// for why it doesn't rely on WordPress's own wp-mediaelement.js
		// auto-init) -- no need to wait and check for one showing up first.
		const videoElement = playerWrapper.querySelector( 'video' );
		if (
			! videoElement ||
			typeof window.MediaElementPlayer === 'undefined'
		) {
			return;
		}
		const settings = Object.assign( {}, videoVars.mejs_settings || {} );
		settings.success = () => {
			setupVideo( playerWrapper, videoVars );
		};
		new window.MediaElementPlayer( videoElement, settings );
	} else {
		setupVideo( playerWrapper, videoVars );
	}
}

/**
 * Success callback for MediaElement.js initialization.
 *
 * @param {HTMLElement} mediaElement The media element.
 * @param {HTMLElement} domObject    The original DOM object.
 */
export function onMejsSuccess( mediaElement, domObject ) {
	// domObject is optional in some contexts, fallback to mediaElement
	const target = domObject || mediaElement;
	const playerWrapper = target.closest( '.videopack-player' );
	if ( playerWrapper && ! playerWrapper.dataset.videopackInitialized ) {
		setupVideo( playerWrapper, getPlayerVars( playerWrapper ) );
	}
}

/**
 * Common setup for any player type after initialization.
 *
 * @param {HTMLElement} playerWrapper The player wrapper element.
 * @param {Object}      videoVars     The video variables.
 */
export function setupVideo( playerWrapper, videoVars ) {
	if ( playerWrapper.dataset.videopackInitialized ) {
		return;
	}

	const playerId = playerWrapper.dataset.id;

	// Move watermark and meta into the player.
	const watermark = document.getElementById(
		`video_${ playerId }_watermark`
	);
	if ( watermark ) {
		playerWrapper.prepend( watermark );
		watermark.style.display = 'block';
	}

	const meta = document.getElementById( `video_${ playerId }_meta` );
	if ( meta ) {
		playerWrapper.prepend( meta );
		meta.style.display = 'block';
	}

	// If there's a meta bar, it might have been initialized by initModularBlocks.
	// However, we want the player instance to be the authoritative wrapper for sharing.
	const metaBar = playerWrapper.querySelector( '.videopack-meta-wrapper' );
	if ( metaBar ) {
		// Clear the initialization from the meta bar and let the player handle it.
		delete metaBar.dataset.videopackMetaInitialized;
	}
	setupMetaBar( playerWrapper );

	if ( true !== videoVars.right_click ) {
		playerWrapper.addEventListener( 'contextmenu', ( e ) =>
			e.preventDefault()
		);
	}

	if ( 'vertical' === videoVars.fixed_aspect ) {
		const videoElement = playerWrapper.querySelector( 'video' );
		if ( videoElement ) {
			const checkVertical = () => {
				let isVertical = false;

				if (
					videoElement.videoWidth > 0 &&
					videoElement.videoHeight > 0
				) {
					// Filter out the 100x100 placeholder browsers sometimes report before metadata is ready.
					if (
						videoElement.videoWidth === 100 &&
						videoElement.videoHeight === 100 &&
						videoElement.readyState < 1
					) {
						return;
					}
					isVertical =
						videoElement.videoHeight > videoElement.videoWidth;
				} else {
					// Fallback to database metadata or rotation data.
					isVertical =
						Number( videoVars.height ) >
							Number( videoVars.width ) ||
						[ 90, 270 ].includes( Number( videoVars.rotate ) );
				}

				if ( isVertical ) {
					const ratio = videoVars.default_ratio
						? videoVars.default_ratio.replace( ':', ' / ' )
						: '16 / 9';

					playerWrapper.classList.add( 'videopack-fixed-aspect' );
					playerWrapper.style.aspectRatio = ratio;

					// Important: Apply directly to the video container so MEJS respects the constraint.
					const mejsContainer = playerWrapper.querySelector(
						'.wp-video-container'
					);
					if ( mejsContainer ) {
						mejsContainer.style.aspectRatio = ratio;
					}
				}
			};

			// Check immediately with fallbacks, then re-check when metadata arrives.
			checkVertical();
			if ( videoElement.readyState < 1 ) {
				videoElement.addEventListener(
					'loadedmetadata',
					checkVertical,
					{ once: true }
				);
			}
		}
	}

	if ( videoVars.embed_method === 'Video.js' ) {
		setupVideoJSPlayer( playerWrapper, videoVars );
	} else if ( videoVars.embed_method === 'WordPress Default' ) {
		setupMEJSPlayer( playerWrapper, videoVars );
	} else {
		const video = playerWrapper.querySelector( 'video' );
		if ( video ) {
			setupVideoTitle( playerWrapper, video, videoVars );
		}
	}

	// Resize logic.
	if (
		( videoVars.legacy_dimensions && true === videoVars.resize ) ||
		'automatic' === videoVars.auto_res ||
		window.location.search.includes( 'videopack[enable]=true' )
	) {
		resizeVideo( playerId );

		const target = playerWrapper.parentElement;

		if ( target ) {
			const resizeObserver = new ResizeObserver( () => {
				resizeVideo( playerId );
			} );
			resizeObserver.observe( target );
		}
	}

	playerWrapper.dataset.videopackInitialized = 'true';
}
