/**
 * Resize + automatic-resolution + fullscreen handling, and the
 * registerResolutionHandler() extension point add-ons (e.g. Videopack Pro's
 * Video.js v10 player) use to wire their own player into this same
 * resize/fullscreen-triggered mechanism without this file needing any
 * awareness of that player.
 *
 * Depends on window.videopack.getPlayerVars() (now defined in
 * players/init.js) rather than importing it directly — deliberately:
 * players/init.js and players/mejs.js both import resizeVideo from this
 * file to wire up player setup, so importing getPlayerVars() directly back
 * from players/init.js here would add a new circular-import edge. Safe
 * either way, since this is only ever called from event handlers that run
 * well after window.videopack has been fully assembled.
 */

/* global videojs, mejs */

import { groupSourcesByResolution } from './utils';

const resolutionHandlers = {};

/**
 * Registers a handler that setAutomaticResolution() delegates to for an
 * embed_method it has no built-in support for.
 *
 * The handler receives the raw (not devicePixelRatio-scaled)
 * currentWidth/aspectRatio and is responsible for its own player lookup,
 * resolution computation (including applying videoVars.pixel_ratio itself,
 * if relevant), and the actual switch — setAutomaticResolution does
 * nothing further once delegated.
 *
 * @param {string}   embedMethod The exact `embed_method` value to match (e.g. "Video.js v10 Beta").
 * @param {Function} handler     (playerWrapper, videoVars, currentWidth, aspectRatio) => void
 */
export function registerResolutionHandler( embedMethod, handler ) {
	resolutionHandlers[ embedMethod ] = handler;
}

/**
 * Pure calculation: given a container width, the video's aspect ratio,
 * whether pixel-ratio-aware sizing is enabled, the device pixel ratio, and
 * the available resolution groups (see groupSourcesByResolution), returns
 * the resolution string to switch to — the smallest one that still meets
 * the target height, or the smallest available if none do. Returns null
 * when there's nothing to switch between (zero or one resolution).
 *
 * @param {object} args
 * @param {number}  args.containerWidth   The current width of the player's container.
 * @param {number}  args.aspectRatio      The video's aspect ratio (height / width).
 * @param {boolean} args.pixelRatio       Whether pixel-ratio-aware sizing is enabled for this video.
 * @param {number}  args.devicePixelRatio The browser's reported device pixel ratio.
 * @param {Array}   args.resolutionGroups Output of groupSourcesByResolution().
 * @return {string|null} The target resolution, or null.
 */
export function pickTargetResolution( { containerWidth, aspectRatio, pixelRatio, devicePixelRatio, resolutionGroups } ) {
	let targetWidth = containerWidth;
	if ( pixelRatio && devicePixelRatio ) {
		targetWidth *= devicePixelRatio;
	}

	// aspectRatio is height / width.
	const targetHeight = targetWidth * aspectRatio;

	if ( ! resolutionGroups || resolutionGroups.length <= 1 ) {
		return null;
	}

	// resolutionGroups is sorted descending by resolution; find the
	// smallest one that still meets the target height, else fall back to
	// the smallest available.
	const ascending = [ ...resolutionGroups ].reverse();
	const bestGroup = ascending.find( ( g ) => parseInt( g.res, 10 ) >= targetHeight ) || ascending[ ascending.length - 1 ];
	return String( bestGroup.res );
}

/**
 * Pure calculation: decides what width to treat a player's container as
 * being, given its fullscreen/embedding state.
 *
 * A fullscreen element's ancestors don't change size when it goes
 * fullscreen (only the fullscreen element itself is expanded, via
 * browser-native compositing, not real layout) — so a plain
 * parent.offsetWidth measurement would otherwise stay exactly what it was
 * before entering fullscreen. Use the viewport instead whenever this
 * specific player is the one currently fullscreen (or is embedded
 * directly in <body>, e.g. a standalone embedded video).
 *
 * @param {object}  args
 * @param {number}  args.configuredWidth   The video's configured width.
 * @param {boolean} args.fullwidth         Whether the player is set to fill its container.
 * @param {boolean} args.isFullscreen      Whether this player is the one currently fullscreen.
 * @param {boolean} args.parentIsBody      Whether the player's parent element is <body>.
 * @param {number}  args.parentOffsetWidth The player's parent element's offsetWidth.
 * @param {number}  args.viewportWidth     window.innerWidth.
 * @return {number} The width to use.
 */
export function computeResizeWidth( { configuredWidth, fullwidth, isFullscreen, parentIsBody, parentOffsetWidth, viewportWidth } ) {
	let setWidth = configuredWidth;
	let parentWidth;

	if ( isFullscreen || parentIsBody ) {
		parentWidth = viewportWidth;
		setWidth = viewportWidth;
	} else {
		parentWidth = parentOffsetWidth;
		if ( fullwidth ) {
			setWidth = parentWidth;
		}
	}

	if ( parentWidth < setWidth ) {
		setWidth = parentWidth;
	}

	return setWidth;
}

/**
 * Resizes a video player, recalculating automatic resolution if enabled.
 *
 * @param {number} playerId The player ID.
 */
export function resizeVideo( playerId ) {
	const playerWrapper = document.querySelector( `.videopack-player[data-id="${ playerId }"]` );
	if ( ! playerWrapper ) {
		return;
	}
	const videoVars = window.videopack.getPlayerVars( playerWrapper );
	if ( ! videoVars ) {
		return;
	}

	const aspectRatio = Math.round( ( videoVars.height / videoVars.width ) * 1000 ) / 1000;

	const fullscreenEl = document.fullscreenElement || document.webkitFullscreenElement;
	const isThisPlayerFullscreen = !! fullscreenEl && playerWrapper.contains( fullscreenEl );

	const setWidth = computeResizeWidth( {
		configuredWidth: videoVars.width,
		fullwidth: true === videoVars.fullwidth,
		isFullscreen: isThisPlayerFullscreen,
		parentIsBody: playerWrapper.parentElement.tagName === 'BODY',
		parentOffsetWidth: playerWrapper.parentElement.offsetWidth,
		viewportWidth: window.innerWidth,
	} );

	if ( setWidth > 0 && setWidth < 30000 ) {
		if ( 'automatic' === videoVars.auto_res ) {
			setAutomaticResolution( playerId, setWidth, aspectRatio );
		}
	}
}

/**
 * Sets automatic resolution based on player size.
 *
 * @param {number} playerId     The player ID.
 * @param {number} currentWidth The current width of the player.
 * @param {number} aspectRatio  The aspect ratio of the video.
 */
export function setAutomaticResolution( playerId, currentWidth, aspectRatio ) {
	const playerWrapper = document.querySelector( `.videopack-player[data-id="${ playerId }"]` );
	const videoVars = playerWrapper && window.videopack.getPlayerVars( playerWrapper );
	if ( ! videoVars ) {
		return;
	}

	let player = null;

	if ( videoVars.embed_method === 'Video.js' && typeof videojs !== 'undefined' ) {
		player = videojs.getPlayer( `videopack_video_${ playerId }` );
		if ( player ) {
			if ( player.manualResolutionSelected ) {
				return;
			}

			const options = player.options();
			const rsOptions = options.plugins && options.plugins.resolutionSelector;
			const default_res = rsOptions ? rsOptions.default_res : undefined;

			if ( default_res && ! player.dataset.videopackInitialResSet && typeof player.changeRes === 'function' ) {
				player.dataset.videopackInitialResSet = 'true';
				player.changeRes( default_res );
			}
		}
	} else if ( videoVars.embed_method === 'WordPress Default' && typeof window.mejs !== 'undefined' ) {
		const mejsContainer = playerWrapper.querySelector( '.mejs-container' );
		if ( mejsContainer && mejs.players[ mejsContainer.id ] ) {
			player = mejs.players[ mejsContainer.id ];
			if ( player.manualResolutionSelected ) {
				return;
			}
		}
	} else {
		// Not a player type this file knows about directly — hand off
		// entirely to a handler an add-on registered for this exact
		// embed_method via registerResolutionHandler() (above). The
		// handler is fully responsible for its own player lookup,
		// resolution computation, and switch — this file has no further
		// involvement once delegated.
		const handler = resolutionHandlers[ videoVars.embed_method ];
		if ( typeof handler === 'function' ) {
			handler( playerWrapper, videoVars, currentWidth, aspectRatio );
		}
		return;
	}

	if ( ! player ) {
		return;
	}

	// Flatten every source across every codec group into one list —
	// quality selection is resolution-only; codec compatibility is
	// resolved automatically by each player's own native <source> fallback.
	let availableSources = [];
	if ( videoVars.source_groups && Object.keys( videoVars.source_groups ).length > 0 ) {
		availableSources = Object.values( videoVars.source_groups ).flatMap( ( g ) => g.sources || [] );
	} else if ( videoVars.sources ) {
		availableSources = videoVars.sources;
	}

	const resolutionGroups = groupSourcesByResolution( availableSources );
	const targetRes = pickTargetResolution( {
		containerWidth: currentWidth,
		aspectRatio,
		pixelRatio: true === videoVars.pixel_ratio,
		devicePixelRatio: window.devicePixelRatio,
		resolutionGroups,
	} );

	// Nothing to switch between with zero or one resolution — for
	// MediaElement.js in particular, calling changeRes() here would fall
	// through to its legacy single-URL branch (since resolutionCandidates
	// is only populated when the sourcechooser feature is active, which
	// the PHP side only enables for multi-source videos) and try to load
	// the resolution string itself as if it were a source URL.
	if ( targetRes === null ) {
		return;
	}

	// Pass the resolution string to both players' changeRes() — each
	// looks it up against its own per-resolution candidate list and lets
	// the browser's native <source> fallback pick the codec.
	if ( videoVars.embed_method === 'Video.js' && player.changeRes ) {
		if ( player.getCurrentRes() !== targetRes ) {
			player.changeRes( targetRes );
		}
	} else if ( videoVars.embed_method === 'WordPress Default' && player.changeRes ) {
		if ( ! player.getCurrentRes || player.getCurrentRes() !== targetRes ) {
			player.changeRes( targetRes );
		}
	}
}

/**
 * Sets up a single, generic document-level fullscreenchange listener that
 * re-checks automatic resolution for whichever player just entered
 * fullscreen (or all initialized players, on exit) — rather than a
 * per-player-type listener (e.g. Video.js's own player.on('fullscreenchange')),
 * so it covers every embed_method uniformly. Going fullscreen doesn't
 * resize any ancestor element, so a per-player ResizeObserver never fires
 * for it on its own.
 */
export function initFullscreenResizeListener() {
	const handleFullscreenChange = () => {
		const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
		if ( fsEl ) {
			const wrapper = fsEl.closest( '.videopack-player' );
			if ( wrapper && wrapper.dataset.id ) {
				resizeVideo( wrapper.dataset.id );
			}
			return;
		}
		// Exiting fullscreen: re-check every initialized player rather than
		// tracking which one was fullscreen — resizeVideo() is cheap and
		// no-ops when nothing actually changed.
		document.querySelectorAll( '.videopack-player[data-id]' ).forEach( ( wrapper ) => {
			resizeVideo( wrapper.dataset.id );
		} );
	};
	document.addEventListener( 'fullscreenchange', handleFullscreenChange );
	document.addEventListener( 'webkitfullscreenchange', handleFullscreenChange );
}
