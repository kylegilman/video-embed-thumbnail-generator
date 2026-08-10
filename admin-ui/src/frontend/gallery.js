/**
 * Gallery / collection (Gallery, Grid, List) system: lightbox popup,
 * AJAX-driven pagination, and the scaling/teardown helpers they depend on.
 *
 * The heaviest remaining writer through the public-api.js player_data
 * contract (setPlayerData/getPlayerData) — extracted last in the migration
 * so everything it depends on (players/init.js, meta-bar.js, public-api.js)
 * is already stable and tested.
 */

/* global videojs, videopack_config, videopack_l10n */

import { getPlayerData, setPlayerData, buildKeyFromId } from './public-api';
import { initPlayer, initPlayers, setupVideo } from './players/init';
import { setupMetaBar } from './meta-bar';

// The lightbox/gallery popup's currently-active player instance. Was
// `this.currentGalleryPlayer` on the shared videopack_obj (so, in effect,
// `window.videopack.currentGalleryPlayer`) — kept as module-local state
// instead, since nothing outside this file (checked the base plugin's PHP
// and the pro plugin's JS) ever reads or writes that property directly.
let currentGalleryPlayer = null;

/**
 * Setup scaling for gallery item play buttons.
 *
 * @since 5.0.0
 * @param {HTMLElement} container The container to search for gallery items.
 */
export function setupGalleryItemScaling( container ) {
	if ( typeof ResizeObserver === 'undefined' ) {
		return;
	}

	const ro = new ResizeObserver( ( entries ) => {
		entries.forEach( ( entry ) => {
			const clickableArea = entry.target;
			const button = clickableArea.querySelector( '.mejs-overlay-button' );
			if ( button ) {
				const containerWidth = entry.contentRect.width;
				const desiredButtonWidth = containerWidth * 0.25;
				const initialButtonWidth = 80;
				const finalButtonWidth = Math.min( desiredButtonWidth, 90 );
				const scale = finalButtonWidth / initialButtonWidth;
				button.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
			}
		} );
	} );

	container.querySelectorAll( '.videopack-gallery-item .gallery-item-clickable-area' ).forEach( ( area ) => {
		if ( area.querySelector( '.mejs-overlay-button' ) ) {
			ro.observe( area );
		}
	} );
}

/**
 * Initialize a single collection (Gallery, Grid, or List).
 * @param {HTMLElement} collectionWrapper The collection wrapper element.
 */
export function initCollection( collectionWrapper ) {
	// Ensure settings are cached if not already set by the server.
	if ( ! collectionWrapper.dataset.settingsCache ) {
		const settings = JSON.parse( collectionWrapper.dataset.settings || '{}' );
		collectionWrapper.dataset.settingsCache = JSON.stringify( settings );
	}

	if ( collectionWrapper.dataset.videopackCollectionInitialized ) {
		return;
	}

	if ( collectionWrapper.classList.contains( 'videopack-gallery-wrapper' ) ) {
		// Store initial video data order for navigation.
		const initialVideoOrder = [];
		collectionWrapper.querySelectorAll( '.videopack-gallery-item' ).forEach( ( thumb ) => {
			initialVideoOrder.push( thumb.dataset.videopackId || `videopack_player_gallery_${ thumb.dataset.attachmentId }` );
		} );
		collectionWrapper.dataset.currentVideosOrder = JSON.stringify( initialVideoOrder );
		setupGalleryItemScaling( collectionWrapper );
	}

	collectionWrapper.dataset.videopackCollectionInitialized = true;
}

export function initGallery( galleryWrapper ) {
	initCollection( galleryWrapper );
}

export function initList( listWrapper ) {
	initCollection( listWrapper );
}

export function openGalleryPopup( videoData, galleryWrapper, videoIndex ) {
	const popup = galleryWrapper.classList.contains( 'videopack-modal-overlay' )
		? galleryWrapper
		: galleryWrapper.querySelector( '.videopack-modal-overlay' );
	const playerContainer = popup.querySelector( '.modal-content' );
	const gallerySettings = JSON.parse( galleryWrapper.dataset.settingsCache || '{}' );
	let skinClass = gallerySettings.skin || '';
	if ( skinClass === 'default' ) {
		skinClass = '';
	}

	// Store a reference to the original wrapper for pagination if needed.
	popup.videopackSourceWrapper = galleryWrapper.videopackSourceWrapper || galleryWrapper;

	// Clean up any previous player.
	destroyCurrentGalleryPlayer();
	playerContainer.innerHTML = '';

	// Assign fresh navigation listeners.
	const nextButton = popup.querySelector( '.modal-next' );
	const prevButton = popup.querySelector( '.modal-previous' );
	const closeButton = popup.querySelector( '.modal-close' );

	if ( nextButton ) {
		nextButton.onclick = ( e ) => {
			setTimeout( () => {
				navigateGalleryPopup( 1, galleryWrapper );
			}, 0 );
		};
	}
	if ( prevButton ) {
		prevButton.onclick = ( e ) => {
			setTimeout( () => {
				navigateGalleryPopup( -1, galleryWrapper );
			}, 0 );
		};
	}
	if ( closeButton ) {
		closeButton.onclick = ( e ) => {
			e.stopPropagation();
			closeGalleryPopup( popup );
		};
	}

	// Background click for closing.
	popup.onclick = ( e ) => {
		if ( e.target === popup ) {
			closeGalleryPopup( popup );
		}
	};

	const attachmentId = videoData.attachment_id;

	// Force autoplay.
	videoData.autoplay = true;

	// Use pre-rendered player HTML.
	const initInjectedPlayer = ( playerHtml ) => {
		playerContainer.innerHTML = playerHtml;

		const playerWrapper = playerContainer.querySelector( '.videopack-player' );
		if ( ! playerWrapper ) {
			console.error( 'Videopack: Could not find .videopack-player in injected HTML' );
			return;
		}

		// Ensure IDs are unique for the lightbox to prevent DOM clashes with standalone players
		let originalId = playerWrapper.dataset.id;
		// Strip prefix if present, as initPlayer will add it back when looking up data
		let cleanId = originalId.replace( 'videopack_player_', '' );
		const newId = cleanId + '_lightbox';
		playerWrapper.dataset.id = newId;

		const metaWrapper = playerContainer.querySelector( `[id="video_${ originalId }_meta"]` );
		if ( metaWrapper ) {
			metaWrapper.id = `video_${ newId }_meta`;
		}

		const watermark = playerContainer.querySelector( `[id="video_${ originalId }_watermark"]` );
		if ( watermark ) {
			watermark.id = `video_${ newId }_watermark`;
		}

		const videoElement = playerWrapper.querySelector( 'video, audio' );
		if ( videoElement ) {
			videoElement.setAttribute( 'autoplay', 'autoplay' );
			if ( videoElement.id ) {
				videoElement.id = videoElement.id + '_lightbox';
			} else {
				videoElement.id = newId;
			}
			if ( skinClass && skinClass !== 'default' ) {
				videoElement.classList.add( skinClass );
				playerWrapper.classList.add( skinClass );
			}
		}

		const videoElementId = videoElement ? videoElement.id : newId;

		// Map the configuration data to this specific instance ID so initPlayer can find it.
		setPlayerData( buildKeyFromId( newId ), videoData.player_vars || videoData );

		if ( videoData.embed_method && videoData.embed_method.startsWith( 'Video.js' ) ) {
			currentGalleryPlayer = initPlayer( playerWrapper );

			const checkPlayer = setInterval( () => {
				const player = window.videojs ? window.videojs.getPlayer( videoElementId ) : null;
				if ( player ) {
					clearInterval( checkPlayer );
					currentGalleryPlayer = player;
					player.ready( () => {
						if ( videoData.autoplay ) {
							player.play();
						}
						player.on( 'ended', () => {
							const galleryEnd = gallerySettings.gallery_end || 'next';
							if ( galleryEnd === 'next' ) {
								setTimeout( () => {
									navigateGalleryPopup( 1, galleryWrapper );
								}, 0 );
							} else if ( galleryEnd === 'close' ) {
								closeGalleryPopup( popup );
							}
						} );
					} );
				}
			}, 100 );
		} else if ( videoData.embed_method === 'WordPress Default' && typeof window.MediaElementPlayer !== 'undefined' ) {
			const videoVars = videoData.player_vars || videoData;
			const settings = Object.assign( {}, videoVars.mejs_settings || {} );
			settings.success = ( mediaElement, domObject, player ) => {
				currentGalleryPlayer = player;
				if ( ! playerWrapper.dataset.videopackInitialized ) {
					setupVideo( playerWrapper, videoData );
				}
				// Explicit play(), matching the Video.js branch above —
				// don't rely solely on the native autoplay attribute
				// surviving MEJS's own DOM wrapping of the element.
				if ( videoData.autoplay ) {
					mediaElement.play();
				}
				mediaElement.addEventListener( 'ended', () => {
					if ( gallerySettings.gallery_end === 'next' ) {
						setTimeout( () => {
							navigateGalleryPopup( 1, galleryWrapper );
						}, 0 );
					}
					if ( gallerySettings.gallery_end === 'close' ) {
						closeGalleryPopup( popup );
					}
				} );
			};
			// Ensure video has an ID
			if ( videoElement ) {
				if ( ! videoElement.id ) {
					videoElement.id = 'wp_mep_' + newId;
				}
				// Catch play interruption AbortError to prevent uncaught console exceptions
				const originalPlay = videoElement.play;
				videoElement.play = function () {
					const promise = originalPlay.apply( this, arguments );
					if ( promise !== undefined ) {
						promise.catch( ( error ) => {
							if ( error.name !== 'AbortError' && error.name !== 'NotAllowedError' ) {
								console.error( error );
							}
						} );
					}
					return promise;
				};
			}
			currentGalleryPlayer = new window.MediaElementPlayer( videoElement, settings );
		} else {
			if ( ! playerWrapper.dataset.videopackInitialized ) {
				setupVideo( playerWrapper, videoData );
			}
			if ( videoElement ) {
				currentGalleryPlayer = videoElement;
				videoElement.addEventListener( 'ended', () => {
					if ( gallerySettings.gallery_end === 'next' ) {
						setTimeout( () => {
							navigateGalleryPopup( 1, galleryWrapper );
						}, 0 );
					}
					if ( gallerySettings.gallery_end === 'close' ) {
						closeGalleryPopup( popup );
					}
				} );
			}
		}

		// Re-initialize share interaction for the injected HTML
		setupMetaBar( playerContainer );
	};

	let playerHtml =
		videoData.player_html ||
		videoData.full_player_html ||
		( videoData.player_vars &&
			( videoData.player_vars.player_html || videoData.player_vars.full_player_html ) );

	if ( playerHtml ) {
		initInjectedPlayer( playerHtml );
	} else if ( window.videopack_config && window.videopack_config.rest_url ) {
		const loadingKey = 'videopack-spin';
		const keyframes = `@keyframes ${ loadingKey } { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
		playerContainer.innerHTML = `<style>${ keyframes }</style><div class="videopack-loading-spinner" style="margin: auto; display: block; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: ${ loadingKey } 1s linear infinite;"></div>`;

		// Safety-net fallback only (pre-embedded HTML is missing for
		// some reason) — always built from global Player Settings
		// server-side, so the only input needed is the video's id.
		const restUrl = videopack_config.rest_url + 'videopack/v1/player?id=' + attachmentId;

		fetch( restUrl, {
			headers: { 'X-WP-Nonce': videopack_config.nonce },
		} ).then( ( r ) => r.json() ).then( ( data ) => {
			if ( data && data.html ) {
				initInjectedPlayer( data.html );
			} else {
				playerContainer.innerHTML = '<p style="color:white;text-align:center;">' + ( typeof videopack_l10n !== 'undefined' && videopack_l10n.errorLoadingPlayer ? videopack_l10n.errorLoadingPlayer : 'Error loading player.' ) + '</p>';
			}
		} ).catch( ( e ) => {
			playerContainer.innerHTML = '<p style="color:white;text-align:center;">' + ( typeof videopack_l10n !== 'undefined' && videopack_l10n.errorLoadingPlayer ? videopack_l10n.errorLoadingPlayer : 'Error loading player.' ) + '</p>';
		} );
	} else {
		console.error( 'Videopack: Could not find player HTML and REST URL is missing', videoData );
	}

	galleryWrapper.dataset.currentGalleryAttachmentId = attachmentId;
	galleryWrapper.dataset.currentGalleryVideoIndex = videoIndex;

	popup.classList.add( 'is-visible' );
	popup.style.display = 'flex';

	// Update nav buttons visibility
	const videoOrder = JSON.parse( galleryWrapper.dataset.currentVideosOrder );
	const totalPages = parseInt( galleryWrapper.dataset.totalPages, 10 );
	const currentPage = parseInt( galleryWrapper.dataset.currentPage, 10 );

	if ( videoIndex > 0 || currentPage > 1 ) {
		prevButton.classList.remove( 'is-disabled' );
		prevButton.style.display = 'block';
	} else {
		prevButton.classList.add( 'is-disabled' );
		prevButton.style.display = 'none';
	}

	if ( videoIndex < videoOrder.length - 1 || currentPage < totalPages ) {
		nextButton.classList.remove( 'is-disabled' );
		nextButton.style.display = 'block';
	} else {
		nextButton.classList.add( 'is-disabled' );
		nextButton.style.display = 'none';
	}
}

/**
 * Safely destroy the current gallery player instance.
 * Handles Video.js and MediaElement.js players.
 */
export function destroyCurrentGalleryPlayer() {
	if ( ! currentGalleryPlayer ) {
		return;
	}

	// Grab a reference to the underlying <video>/<audio> now, before
	// disposal — used at the very end of this function to force-abort
	// any still-in-flight network request for it. Deliberately not
	// acted on yet: doing this *before* the player-specific cleanup
	// below (e.g. stripping its src ahead of MEJS's own .pause())
	// previously made that cleanup throw partway through — silently,
	// since it's wrapped in try/catch — which skipped .remove()
	// entirely and left the old video playing in the background.
	let outgoingMediaEl = null;
	try {
		outgoingMediaEl = typeof currentGalleryPlayer.el === 'function'
			? currentGalleryPlayer.el().querySelector( 'video, audio' )
			: currentGalleryPlayer.node;
	} catch ( e ) {
		outgoingMediaEl = null;
	}

	// For Video.js players
	if ( typeof currentGalleryPlayer.dispose === 'function' ) {
		// dispose() alone doesn't reliably remove this player's own entry
		// from Video.js's global players registry (see disposePlayersInElement's
		// comment for how this was confirmed) — grab the id first so the
		// entry can be explicitly deleted after disposal.
		let playerId = null;
		try {
			playerId = typeof currentGalleryPlayer.id === 'function' ? currentGalleryPlayer.id() : null;
		} catch {
			playerId = null;
		}

		try {
			// Prevent events from firing during disposal
			if ( typeof currentGalleryPlayer.off === 'function' ) {
				currentGalleryPlayer.off();
			}

			// Explicitly disable user activity tracking to prevent "Invalid target" error
			if ( typeof currentGalleryPlayer.userActive === 'function' ) {
				currentGalleryPlayer.userActive( false );
			}

			// Double-check if already disposed to prevent "classList of null"
			if ( ! currentGalleryPlayer.isDisposed || ! currentGalleryPlayer.isDisposed() ) {
				currentGalleryPlayer.dispose();
			}
		} catch ( e ) {
			// Fail silently or handle disposal error
		}

		if ( playerId && typeof videojs !== 'undefined' && videojs.players ) {
			delete videojs.players[ playerId ];
		}
	} else if ( typeof currentGalleryPlayer.remove === 'function' ) {
		// For MediaElement.js players
		try {
			// Prevent MEJS from crashing during removal due to async resize events.
			if ( currentGalleryPlayer.setPlayerSize ) {
				currentGalleryPlayer.setPlayerSize = function () {};
			}
			if ( currentGalleryPlayer.setControlsSize ) {
				currentGalleryPlayer.setControlsSize = function () {};
			}
			if ( typeof currentGalleryPlayer.pause === 'function' ) {
				currentGalleryPlayer.pause();
			}
			currentGalleryPlayer.remove();
		} catch ( e ) {
			// Ignore errors from MediaElement.js cleanup.
		}
		// Ensure player instance is removed from global registry.
		if ( currentGalleryPlayer.id && window.mejs && window.mejs.players && window.mejs.players[ currentGalleryPlayer.id ] ) {
			delete window.mejs.players[ currentGalleryPlayer.id ];
		}
	} else if ( typeof currentGalleryPlayer.pause === 'function' ) {
		// Fallback for other player types
		currentGalleryPlayer.pause();
	}

	// Now that the player's own teardown has run, force-abort any
	// network activity still in flight on the underlying element.
	// Merely removing a <video>/<audio> element from the DOM (which
	// openGalleryPopup does right after this call, via
	// playerContainer.innerHTML = '') doesn't reliably cancel an
	// in-flight media fetch — the old video's download can keep
	// running in the background, competing with the next video for
	// the browser's per-origin connection limit and bandwidth, and
	// delaying its playback start.
	try {
		if ( outgoingMediaEl ) {
			outgoingMediaEl.pause();
			outgoingMediaEl.querySelectorAll( 'source' ).forEach( ( s ) => s.removeAttribute( 'src' ) );
			outgoingMediaEl.removeAttribute( 'src' );
			outgoingMediaEl.load();
		}
	} catch ( e ) {
		// Best-effort only.
	}

	currentGalleryPlayer = null;
}

/**
 * Safely disposes every Video.js player instance whose DOM element lives
 * inside a given container. Needed before replacing a gallery grid's
 * innerHTML wholesale (e.g. AJAX pagination) — a raw innerHTML swap
 * bypasses Video.js's own teardown, so without this, disposed-or-not,
 * the underlying DOM is simply gone out from under the Player object.
 *
 * Confirmed empirically (via videojs.getPlayers() inspection after
 * pagination) that calling .dispose() alone is not enough here: it nulls
 * out the player's tech_ but does not reliably remove the player's own
 * entry from Video.js's global players registry in this version/timing
 * scenario. That leaves a zombie entry — .dispose() ran, tech is gone,
 * but videojs.getPlayers() still returns it — which is exactly what a
 * later, unrelated player's 'play' handler crashes on when it iterates
 * videojs.getPlayers() (e.g. for pauseothervideos) and calls a method
 * like .paused() on it. So the entry is explicitly deleted from the
 * registry too, the same way this file already does for MediaElement.js
 * players in destroyCurrentGalleryPlayer().
 *
 * @since 5.4.0
 * @param {HTMLElement} container The element about to have its content replaced.
 */
export function disposePlayersInElement( container ) {
	if ( ! container || typeof videojs === 'undefined' || typeof videojs.getPlayers !== 'function' ) {
		return;
	}
	const players = videojs.getPlayers();
	Object.keys( players ).forEach( ( id ) => {
		const player = players[ id ];
		if ( ! player || typeof player.el !== 'function' ) {
			return;
		}
		let el;
		try {
			el = player.el();
		} catch {
			el = null;
		}
		// Even if .el() no longer resolves (already torn down some other
		// way), still remove the registry entry below rather than leaving
		// it behind — only skip entirely when we can positively tell this
		// player belongs to a *different*, still-live container.
		if ( el && ! container.contains( el ) ) {
			return;
		}
		try {
			if ( typeof player.off === 'function' ) {
				player.off();
			}
			// Explicitly disable user activity tracking to prevent "Invalid target" error.
			if ( typeof player.userActive === 'function' ) {
				player.userActive( false );
			}
			if ( ! player.isDisposed || ! player.isDisposed() ) {
				player.dispose();
			}
		} catch {
			// Fail silently — the element is being discarded regardless.
		}
		if ( videojs.players ) {
			delete videojs.players[ id ];
		}
	} );
}

export function closeGalleryPopup( popup ) {
	destroyCurrentGalleryPlayer();
	popup.classList.remove( 'is-visible' );
	popup.onclick = null;
	const nextButton = popup.querySelector( '.modal-next' );
	const prevButton = popup.querySelector( '.modal-previous' );
	const closeButton = popup.querySelector( '.modal-close' );

	if ( nextButton ) nextButton.onclick = null;
	if ( prevButton ) prevButton.onclick = null;
	if ( closeButton ) closeButton.onclick = null;

	const content = popup.querySelector( '.modal-content' );
	if ( content ) {
		content.innerHTML = '';
	}
}

export function navigateGalleryPopup( direction, galleryWrapper ) {
	const sourceWrapper = galleryWrapper.videopackSourceWrapper || galleryWrapper;
	const currentIndex = parseInt( galleryWrapper.dataset.currentGalleryVideoIndex, 10 );
	const videoOrder = JSON.parse( galleryWrapper.dataset.currentVideosOrder );
	const currentPage = parseInt( galleryWrapper.dataset.currentPage, 10 );
	const totalPages = parseInt( galleryWrapper.dataset.totalPages, 10 );

	let nextIndex = currentIndex + direction;

	if ( nextIndex >= videoOrder.length && currentPage < totalPages ) {
		loadCollectionPage( currentPage + 1, sourceWrapper, 0 ); // Load next page and open first video
	} else if ( nextIndex < 0 && currentPage > 1 ) {
		loadCollectionPage( currentPage - 1, sourceWrapper, -1 ); // Load prev page and open last video
	} else if ( nextIndex >= 0 && nextIndex < videoOrder.length ) {
		// Navigate within the current page
		const nextVideoId = videoOrder[ nextIndex ];
		let nextVideoData = getPlayerData( nextVideoId ) || null;

		if ( ! nextVideoData ) {
			nextVideoData = getPlayerData( buildKeyFromId( nextVideoId ) ) || null;
		}

		if ( nextVideoData ) {
			openGalleryPopup( nextVideoData, galleryWrapper, nextIndex );
		}
	} else {
		// This case handles wrapping on single-page galleries or at the ends of a multi-page gallery
		if ( nextIndex < 0 ) {
			nextIndex = videoOrder.length - 1;
		} else if ( nextIndex >= videoOrder.length ) {
			nextIndex = 0;
		}
		const nextVideoId = videoOrder[ nextIndex ];
		let nextVideoData = getPlayerData( nextVideoId ) || null;

		if ( ! nextVideoData ) {
			nextVideoData = getPlayerData( buildKeyFromId( nextVideoId ) ) || null;
		}

		if ( nextVideoData ) {
			openGalleryPopup( nextVideoData, galleryWrapper, nextIndex );
		}
	}
}

/**
 * Handles click on a global lightbox trigger.
 *
 * @since 5.0.0
 * @param {Event}       e       The click event.
 * @param {HTMLElement} trigger The trigger element.
 */
export function handleGlobalLightboxClick( e, trigger ) {
	e.preventDefault();
	const attachmentId = trigger.dataset.attachmentId;
	const videopackId = trigger.dataset.videopackId;

	let videoData = getPlayerData( videopackId ) || null;

	// Fallback 1: try prefixed version if raw ID failed.
	if ( ! videoData ) {
		videoData = getPlayerData( buildKeyFromId( videopackId ) ) || null;
	}

	// Fallback 2: search for data-attachment-id if explicit ID lookup failed.
	if ( ! videoData ) {
		videoData = getPlayerData( `videopack_player_gallery_${ attachmentId }` ) || null;
	}

	if ( videoData ) {
		const modal = document.getElementById( 'videopack-global-modal' );
		if ( modal ) {
			// Check if this item belongs to a gallery/collection.
			const collectionWrapper = trigger.closest( '.videopack-collection-wrapper' );
			let videoOrder = [];
			let clickedIndex = 0;

			if ( collectionWrapper ) {
				// Existing gallery logic: respect the collection's order and settings.
				const siblingThumbnails = Array.from( collectionWrapper.querySelectorAll( '.videopack-gallery-item' ) );
				siblingThumbnails.forEach( ( sibling, index ) => {
					const sid = sibling.dataset.attachmentId;
					// Rely on the server's videopackId; fallback to standard gallery format if missing.
					const svid = sibling.dataset.videopackId || `videopack_player_gallery_${ sid }`;
					videoOrder.push( svid );
					if ( sibling === trigger ) {
						clickedIndex = index;
					}
				} );

				modal.dataset.settingsCache = collectionWrapper.dataset.settings || collectionWrapper.dataset.settingsCache || '{}';
				modal.dataset.totalPages = collectionWrapper.dataset.totalPages || 1;
				modal.dataset.currentPage = collectionWrapper.dataset.currentPage || 1;
			} else {
				// Standalone block logic: look for other top-level blocks as pseudo-gallery.
				const allTriggers = Array.from( document.querySelectorAll( '[data-videopack-lightbox="true"]' ) ).filter( ( t ) => ! t.closest( '.videopack-collection-wrapper' ) );
				allTriggers.forEach( ( sibling, index ) => {
					const sid = sibling.dataset.attachmentId;
					const svid = sibling.dataset.videopackId || `videopack_player_gallery_${ sid }`;
					videoOrder.push( svid );
					if ( sibling === trigger ) {
						clickedIndex = index;
					}
				} );

				modal.dataset.settingsCache = JSON.stringify( {
					skin: videoData.skin || 'vjs-theme-videopack',
					gallery_end: 'next',
				} );
				modal.dataset.totalPages = 1;
				modal.dataset.currentPage = 1;
			}

			modal.dataset.currentVideosOrder = JSON.stringify( videoOrder );
			modal.dataset.currentGalleryVideoIndex = clickedIndex;

			// Store source collection for pagination sync
			modal.videopackSourceWrapper = collectionWrapper;

			// Call the standard gallery popup logic.
			openGalleryPopup( videoData, modal, clickedIndex );
		}
	}
}

export function handleCollectionPaginationClick( e, collectionWrapper, pageLink ) {
	e.preventDefault();
	let page = 1;
	if ( pageLink ) {
		if ( pageLink.dataset.page ) {
			page = pageLink.dataset.page;
		} else if ( pageLink.tagName === 'A' && pageLink.href ) {
			// Extract page from standard WordPress pagination URL
			const url = new URL( pageLink.href, window.location.origin );
			if ( url.searchParams.has( 'paged' ) ) {
				page = url.searchParams.get( 'paged' );
			} else {
				// Match /page/2 or /page/2/
				const match = url.pathname.match( /\/page\/(\d+)\/?$/ ) || url.pathname.match( /\/page\/(\d+)\// );
				if ( match ) {
					page = match[ 1 ];
				}
			}
		}
	} else {
		// Fallback if pageLink isn't explicitly passed
		const target = e.target.closest( 'button, a.page-numbers, .videopack-pagination-button' );
		if ( target && target.dataset.page ) {
			page = target.dataset.page;
		}
	}

	if ( page ) {
		loadCollectionPage( page, collectionWrapper );
	}
}

export function handleGlobalPaginationClick( e ) {
	var paginationButton = e.target.closest( '.videopack-pagination-button' );
	if ( ! paginationButton ) return;

	// Always prevent default if it's a page number link
	if ( paginationButton.tagName === 'A' || paginationButton.tagName === 'BUTTON' ) {
		e.preventDefault();
	}

	// Find the associated collection wrapper
	let collectionWrapper = paginationButton.closest( '.videopack-collection-wrapper' );

	if ( ! collectionWrapper ) {
		// If not inside, look for the closest collection wrapper before this block
		const paginationBlock = paginationButton.closest( '.videopack-pagination' );
		if ( paginationBlock ) {
			// Check siblings
			collectionWrapper = paginationBlock.previousElementSibling;
			while ( collectionWrapper && ! collectionWrapper.classList.contains( 'videopack-collection-wrapper' ) ) {
				collectionWrapper = collectionWrapper.previousElementSibling;
			}
		}
	}

	if ( collectionWrapper ) {
		handleCollectionPaginationClick( e, collectionWrapper, paginationButton );
	}
}

export function handleGalleryPaginationClick( e, galleryWrapper ) {
	handleCollectionPaginationClick( e, galleryWrapper );
}

export function loadCollectionPage( page, collectionWrapper, openVideoAtIndex = null ) {
	const settings = collectionWrapper.dataset.settingsCache ? JSON.parse( collectionWrapper.dataset.settingsCache ) : {};
	const layout = collectionWrapper.dataset.layout || 'grid';

	const grid = collectionWrapper.querySelector( '.videopack-collection-inner, .videopack-gallery-items, .videopack-grid-items, .videopack-video-list' );
	// A collection can have more than one pagination block (e.g. one
	// above the loop, one below) — all of them need to stay in sync.
	const paginations = collectionWrapper.querySelectorAll( '.videopack-pagination' );

	if ( grid ) {
		grid.style.opacity = 0.5;
	}

	const restUrl = new URL( videopack_config.rest_url + 'videopack/v1/video_gallery' );

	const postData = new URLSearchParams();
	Object.keys( settings ).forEach( ( key ) => {
		if ( settings[ key ] !== null && settings[ key ] !== false && settings[ key ] !== '' && typeof settings[ key ] !== 'undefined' ) {
			postData.append( key, settings[ key ] );
		}
	} );
	postData.append( 'page_number', page );
	if ( layout && layout !== 'undefined' ) {
		postData.append( 'layout', layout );
	}

	fetch( restUrl, {
		method: 'POST',
		body: postData,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	} )
		.then( ( response ) => response.json() )
		.then( ( data ) => {
			// A WP_Error response (e.g. rest_gallery_instance_not_found) is
			// still valid JSON, just without an `html` key -- degrade
			// gracefully by leaving the current page displayed rather than
			// throwing, but surface it for debugging.
			if ( ! data.html && data.code ) {
				console.warn( 'Gallery pagination request failed:', data.code, data.message );
			}
			if ( data.html ) {
				if ( data.videos ) {
					data.videos.forEach( ( video ) => {
						if ( video.player_vars && video.player_vars.id ) {
							setPlayerData( video.player_vars.id, video.player_vars );
						}
					} );
				}
				const tempDiv = document.createElement( 'div' );
				tempDiv.innerHTML = data.html;

				const newCollectionWrapper = tempDiv.querySelector( '.videopack-collection-wrapper' );
				if ( newCollectionWrapper ) {
					// Sync datasets back to the modal if it's currently open and linked to this collection
					const modal = document.getElementById( 'videopack-global-modal' );
					if ( modal && modal.videopackSourceWrapper === collectionWrapper ) {
						modal.dataset.currentPage = page;
						// Re-sync video order for the lightbox
						const newVideoOrder = [];
						const newGrid = newCollectionWrapper.querySelector( '.videopack-collection-inner, .videopack-gallery-items, .videopack-grid-items, .videopack-video-list' );
						if ( newGrid ) {
							newGrid.querySelectorAll( '.videopack-gallery-item' ).forEach( ( thumb ) => {
								newVideoOrder.push( thumb.dataset.videopackId || `videopack_player_gallery_${ thumb.dataset.attachmentId }` );
							} );
							modal.dataset.currentVideosOrder = JSON.stringify( newVideoOrder );
						}
						if ( data.max_num_pages ) {
							modal.dataset.totalPages = data.max_num_pages;
						}
						if ( newCollectionWrapper.dataset.settingsCache ) {
							modal.dataset.settingsCache = newCollectionWrapper.dataset.settingsCache;
						}
					}

					const newGrid = newCollectionWrapper.querySelector( '.videopack-collection-inner, .videopack-gallery-items, .videopack-grid-items, .videopack-video-list' );
					const newPaginations = newCollectionWrapper.querySelectorAll( '.videopack-pagination' );

					if ( grid && newGrid ) {
						disposePlayersInElement( grid );
						grid.innerHTML = newGrid.innerHTML;
					}
					if ( paginations.length ) {
						// Fallback: look for pagination in the returned HTML if none were found in the wrapper.
						const sourcePaginations = newPaginations.length ? newPaginations : tempDiv.querySelectorAll( '.videopack-pagination' );
						paginations.forEach( ( paginationEl, index ) => {
							const newPaginationEl = sourcePaginations[ index ];
							paginationEl.innerHTML = newPaginationEl ? newPaginationEl.innerHTML : '';
						} );
					}

					collectionWrapper.dataset.currentPage = page;
					if ( data.max_num_pages ) {
						collectionWrapper.dataset.totalPages = data.max_num_pages;
					}
					initPlayers( collectionWrapper ); // Initialize any new players
					initCollection( collectionWrapper ); // Re-initialize elements and listeners

					// Update global state and navigate if requested
					const newVideoOrder = [];
					const currentGrid = collectionWrapper.querySelector( '.videopack-collection-inner, .videopack-gallery-items, .videopack-grid-items, .videopack-video-list' );
					if ( currentGrid ) {
						currentGrid.querySelectorAll( '.videopack-gallery-item' ).forEach( ( thumb ) => {
							newVideoOrder.push( thumb.dataset.videopackId || `videopack_player_gallery_${ thumb.dataset.attachmentId }` );
						} );
						collectionWrapper.dataset.currentVideosOrder = JSON.stringify( newVideoOrder );
					}

					if ( data.videos ) {
						data.videos.forEach( ( video ) => {
							if ( video.player_vars && video.player_vars.id ) {
								setPlayerData( video.player_vars.id, video.player_vars );
							}
						} );
					}

					if ( openVideoAtIndex !== null && newVideoOrder.length > 0 ) {
						const actualIndex = openVideoAtIndex === -1 ? newVideoOrder.length - 1 : openVideoAtIndex;
						const nextVideoId = newVideoOrder[ actualIndex ];
						const videoToOpen = getPlayerData( nextVideoId ) || getPlayerData( `videopack_player_gallery_${ nextVideoId }` );
						if ( videoToOpen ) {
							const targetForPopup = ( modal && modal.videopackSourceWrapper === collectionWrapper ) ? modal : collectionWrapper;
							openGalleryPopup( videoToOpen, targetForPopup, actualIndex );
						}
					}
				}
			}
			if ( grid ) {
				grid.style.opacity = 1;
			}
		} )
		.catch( ( error ) => {
			console.error( 'Error loading collection page:', error );
			if ( grid ) {
				grid.style.opacity = 1;
			}
		} );
}

export function loadGalleryPage( page, galleryWrapper, openVideoAtIndex = null ) {
	loadCollectionPage( page, galleryWrapper, openVideoAtIndex );
}

export function renderGalleryPagination( maxPages, currentPage, pagination ) {
	if ( ! pagination ) {
		return;
	}
	pagination.innerHTML = '';
}
