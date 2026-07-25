/**
 * Loading and setup for a Video.js (classic/v8) player.
 *
 * setupVideo() (players/init.js) and setupVideoJSPlayer()/loadVideoJS()
 * (here) call into each other — a deliberate circular import between this
 * file and init.js. Safe because neither side calls the other at module
 * top level, only from within functions invoked well after both modules
 * have finished loading.
 */

/* global videojs */

import { convertFromTimecode } from '../utils';
import { videoCounter } from '../analytics';
import { setStartAt } from '../meta-bar';
import { setupVideoTitle } from '../video-title';
import { setupVideo } from './init';

/**
 * Loads and initializes a Video.js player.
 *
 * @param {HTMLElement} playerWrapper The player wrapper element.
 * @param {object}      videoVars     The video variables.
 * @return {object|undefined} The Video.js player instance, if created.
 */
export function loadVideoJS( playerWrapper, videoVars ) {
	const videoElement = playerWrapper.querySelector( 'video' );

	if ( ! videoElement ) {
		return;
	}
	const videoElementId = videoElement.id;

	const videojsOptions = {
		language: videoVars.locale,
		responsive: true,
		userActions: { hotkeys: true },
	};

	if ( true === videoVars.autoplay ) {
		videojsOptions.autoplay = 'any';
	}

	if ( videoVars.legacy_dimensions ) {
		videojsOptions.fluid = ( true === videoVars.resize || true === videoVars.fullwidth );
	} else {
		videojsOptions.fluid = true;
	}

	if ( videojsOptions.fluid && videoVars.legacy_dimensions && videoVars.width && ( typeof videoVars.width !== 'string' || -1 === videoVars.width.indexOf( '%' ) ) && videoVars.height && videoVars.fixed_aspect ) {
		videojsOptions.aspectRatio = `${ videoVars.width }:${ videoVars.height }`;
	}

	if ( true === videoVars.nativecontrolsfortouch ) {
		videojsOptions.nativeControlsForTouch = true;
	}

	if ( true === videoVars.playback_rate ) {
		videojsOptions.playbackRates = [ 0.5, 1, 1.25, 1.5, 2 ];
	}

	if ( videoVars.skip_buttons && videoVars.skip_buttons.forward && videoVars.skip_buttons.backward ) {
		videojsOptions.controlBar = {
			skipButtons: {
				forward: Number( videoVars.skip_buttons.forward ),
				backward: Number( videoVars.skip_buttons.backward ),
			},
		};
	}

	const activeSources = Array.from( videoElement.querySelectorAll( 'source' ) );

	const hasResolutions = activeSources.some( ( s ) => s.dataset.res );
	const hasAdaptive = activeSources.some( ( s ) => s.type && ( s.type.startsWith( 'application/x-mpegURL' ) || s.type.startsWith( 'application/dash+xml' ) ) );
	const source_groups = videoVars.source_groups || {};

	if ( typeof videojs.getPlugin === 'function' && videojs.getPlugin( 'resolutionSelector' ) && ( ( hasResolutions && activeSources.length > 1 ) || hasAdaptive || ( source_groups && Object.keys( source_groups ).length > 1 ) ) ) {
		if ( videojs.VERSION.split( '.' )[ 0 ] >= 5 ) {
			videojsOptions.plugins = videojsOptions.plugins || {};
			videojsOptions.plugins.resolutionSelector = {
				force_types: [ 'video/mp4' ],
				source_groups,
			};
			const defaultResSource = activeSources.find( ( s ) => '1' === s.dataset.default_res );
			if ( videoVars.default_res ) {
				videojsOptions.plugins.resolutionSelector.default_res = videoVars.default_res;
			} else if ( defaultResSource ) {
				videojsOptions.plugins.resolutionSelector.default_res = defaultResSource.dataset.res;
			}
		} else {
			// eslint-disable-next-line no-console
			console.warn( 'Videopack: Video.js version ' + videojs.VERSION + ' is loaded by another application. Resolution selection is not compatible with this older version and has been disabled.' );
		}
	}

	if ( videojs.getPlayer( videoElementId ) ) {
		console.log( '[Videopack Debug] Player already exists for:', videoElementId );
		setupVideo( playerWrapper, videoVars );
		return videojs.getPlayer( videoElementId );
	}

	// Return the player instance created by videojs()
	const player = videojs( videoElement, videojsOptions );

	player.ready( () => {
		console.log( '[Videopack Debug] Video.js Player is ready. Proceeding with setup.' );
		setupVideo( playerWrapper, videoVars );
	} );
	return player;
}

/**
 * Sets up a Video.js player, once Video.js has constructed it.
 *
 * @param {HTMLElement} playerWrapper The player wrapper element.
 * @param {object}      videoVars     The video variables.
 */
export function setupVideoJSPlayer( playerWrapper, videoVars ) {
	const playerId = playerWrapper.dataset.id;
	const videoElement = playerWrapper.querySelector( 'video' );

	if ( ! videoElement ) {
		return;
	}

	const player = videojs.getPlayer( videoElement.id );

	if ( ! player ) {
		return;
	}

	// Move watermark inside video element for proper positioning.
	const watermark = document.getElementById( `video_${ playerId }_watermark` );
	if ( watermark ) {
		player.el().appendChild( watermark );
	}

	// Touch device checks.
	if ( videojs.browser.TOUCH_ENABLED ) {
		if ( true === videoVars.nativecontrolsfortouch && videojs.browser.IS_ANDROID ) {
			player.bigPlayButton.hide();
		}
		if ( ! player.controls() && ! player.muted() ) {
			player.controls( true );
		}
	}

	player.on( 'loadedmetadata', () => {
		const played = playerWrapper.dataset.played || 'not played';

		if ( 'not played' === played ) {
			// Set default captions/subtitles.
			const trackElements = player.options_.tracks;
			if ( trackElements ) {
				player.textTracks().tracks_.forEach( ( track, index ) => {
					if ( trackElements[ index ] && trackElements[ index ].default && 'showing' !== track.mode ) {
						track.mode = 'showing';
					}
				} );
			}

			if ( videoVars.start ) {
				player.currentTime( convertFromTimecode( videoVars.start ) );
			}
		}

		if ( videoVars.set_volume ) {
			player.volume( videoVars.set_volume );
		}

		if ( true === videoVars.autoplay && player.paused() ) {
			const promise = player.play();
			if ( 'undefined' !== typeof promise ) {
				promise.catch( () => {
					// Autoplay was prevented.
				} );
			}
		}

		if ( 'vertical' === videoVars.fixed_aspect && player.videoHeight() > player.videoWidth() ) {
			const ratio = videoVars.default_ratio ? videoVars.default_ratio.replace( /\s\/\s/g, ':' ) : '16:9';
			player.aspectRatio( ratio );
			playerWrapper.classList.add( 'videopack-fixed-aspect' );
		}
	} );

	player.on( 'play', () => {
		player.focus();

		if ( videoVars.endofvideooverlay ) {
			const overlay = playerWrapper.querySelector( '.videopack-end-overlay' );
			if ( overlay ) {
				overlay.classList.remove( 'is-visible' );
			}
		}

		if ( true === videoVars.pauseothervideos ) {
			const players = videojs.getPlayers();
			for ( const otherPlayerId in players ) {
				if ( players.hasOwnProperty( otherPlayerId ) ) {
					const otherPlayer = players[ otherPlayerId ];
					// A disposed player can linger in this registry as a
					// "zombie" entry (dispose() nulls its tech but doesn't
					// always remove the registry entry itself — see
					// disposePlayersInElement's comment for how this was
					// confirmed empirically) — calling .paused() on one
					// throws (its tech is gone), which previously crashed
					// this handler whenever a stale entry from a just-closed
					// lightbox player hadn't been fully cleaned up yet.
					if (
						otherPlayer &&
						( ! otherPlayer.isDisposed || ! otherPlayer.isDisposed() ) &&
						player.id() !== otherPlayer.id() &&
						! otherPlayer.paused() &&
						! otherPlayer.autoplay()
					) {
						otherPlayer.pause();
					}
				}
			}
		}

		videoCounter( playerId, 'play' );

		player.on( 'timeupdate', () => {
			const percent = Math.round( ( player.currentTime() / player.duration() ) * 100 );
			if ( ! playerWrapper.dataset[ '25' ] && percent >= 25 && percent < 50 ) {
				playerWrapper.dataset[ '25' ] = true;
				videoCounter( playerId, '25' );
			} else if ( ! playerWrapper.dataset[ '50' ] && percent >= 50 && percent < 75 ) {
				playerWrapper.dataset[ '50' ] = true;
				videoCounter( playerId, '50' );
			} else if ( ! playerWrapper.dataset[ '75' ] && percent >= 75 && percent < 100 ) {
				playerWrapper.dataset[ '75' ] = true;
				videoCounter( playerId, '75' );
			}
			setStartAt( playerWrapper );
		} );
	} );

	player.on( 'pause', () => {
		videoCounter( playerId, 'pause' );
	} );
	player.on( 'seeked', () => videoCounter( playerId, 'seek' ) );
	player.on( 'ended', () => {
		if ( ! playerWrapper.dataset.end ) {
			playerWrapper.dataset.end = true;
			videoCounter( playerId, 'end' );
		}
		setTimeout( () => {
			if ( player.loadingSpinner && player.loadingSpinner.el() ) {
				player.loadingSpinner.el().style.display = 'none';
			}
		}, 250 );

		if ( videoVars.endofvideooverlay ) {
			const overlay = playerWrapper.querySelector( '.videopack-end-overlay' );
			if ( overlay ) {
				overlay.style.backgroundImage = `url(${ videoVars.endofvideooverlay })`;
				overlay.classList.add( 'is-visible' );
			}
		}
	} );

	// Fullscreen-triggered automatic-resolution recalculation is handled
	// generically for every player type by the document-level
	// 'fullscreenchange' listener (see resolution.js's
	// initFullscreenResizeListener()).

	setupVideoTitle( playerWrapper, player, videoVars );
}
