/**
 * Setup for a MediaElement.js player, once WordPress/MEJS has constructed it.
 */

/* global mejs */

import { convertFromTimecode } from '../utils';
import { videoCounter } from '../analytics';
import { setStartAt } from '../meta-bar';
import { setupVideoTitle } from '../video-title';
import { resizeVideo } from '../resolution';

/**
 * Sets up a MediaElement.js player.
 *
 * @param {HTMLElement} playerWrapper The player wrapper element.
 * @param {Object}      videoVars     The video variables.
 */
export function setupMEJSPlayer( playerWrapper, videoVars ) {
	const playerId = playerWrapper.dataset.id;
	const video = playerWrapper.querySelector( 'video' );
	const mejsContainer = playerWrapper.querySelector( '.mejs-container' );
	const mejsId = mejsContainer ? mejsContainer.id : null;

	if ( ! video || ! mejsId || ! mejs.players[ mejsId ] ) {
		return;
	}

	const player = mejs.players[ mejsId ];

	// Move watermark.
	const watermark = document.getElementById(
		`video_${ playerId }_watermark`
	);
	if ( watermark ) {
		playerWrapper.querySelector( '.mejs-container' ).append( watermark );
	}

	const played = playerWrapper.dataset.played || 'not played';
	if ( 'not played' === played ) {
		// Default captions.
		if ( player.tracks && player.tracks.length > 0 ) {
			const defaultTrack = document.querySelector(
				`#${ mejsId } track[default]`
			);
			if ( defaultTrack ) {
				const defaultLang = defaultTrack
					.getAttribute( 'srclang' )
					.toLowerCase();
				const trackToSet = player.tracks.find(
					( t ) => t.srclang === defaultLang
				);
				if ( trackToSet ) {
					player.setTrack( trackToSet.trackId );
				}
			}
		}

		if ( videoVars.start ) {
			video.setCurrentTime( convertFromTimecode( videoVars.start ) );
		}
	}

	const onLoadedMetadata = () => {
		resizeVideo( playerId );
		if ( videoVars.set_volume ) {
			video.volume = videoVars.set_volume;
		}
		if ( true === videoVars.muted ) {
			video.setMuted( true );
		}
		if ( false === videoVars.pauseothervideos ) {
			player.options.pauseOtherPlayers = false;
		}
	};

	video.addEventListener( 'loadedmetadata', onLoadedMetadata );

	if ( video.readyState >= 1 ) {
		onLoadedMetadata();
	}

	video.addEventListener( 'play', () => {
		document.getElementById( mejsId ).focus();
		videoCounter( playerId, 'play' );

		video.addEventListener( 'timeupdate', () => {
			const percent = Math.round(
				( video.currentTime / video.duration ) * 100
			);
			if (
				! playerWrapper.dataset[ '25' ] &&
				percent >= 25 &&
				percent < 50
			) {
				playerWrapper.dataset[ '25' ] = true;
				videoCounter( playerId, '25' );
			} else if (
				! playerWrapper.dataset[ '50' ] &&
				percent >= 50 &&
				percent < 75
			) {
				playerWrapper.dataset[ '50' ] = true;
				videoCounter( playerId, '50' );
			} else if (
				! playerWrapper.dataset[ '75' ] &&
				percent >= 75 &&
				percent < 100
			) {
				playerWrapper.dataset[ '75' ] = true;
				videoCounter( playerId, '75' );
			}
			setStartAt( playerWrapper );
		} );
	} );

	video.addEventListener( 'pause', () => {
		videoCounter( playerId, 'pause' );
	} );
	video.addEventListener( 'seeked', () => videoCounter( playerId, 'seek' ) );

	video.addEventListener( 'ended', () => {
		if ( ! playerWrapper.dataset.end ) {
			playerWrapper.dataset.end = true;
			videoCounter( playerId, 'end' );
		}
		if ( videoVars.endofvideooverlay ) {
			const overlay = playerWrapper.querySelector(
				'.videopack-end-overlay'
			);
			if ( overlay ) {
				overlay.style.backgroundImage = `url(${ videoVars.endofvideooverlay })`;
				overlay.classList.add( 'is-visible' );
			}
			video.addEventListener(
				'seeking',
				() => {
					if ( 0 !== video.currentTime ) {
						const currentOverlay = playerWrapper.querySelector(
							'.videopack-end-overlay'
						);
						if ( currentOverlay ) {
							currentOverlay.classList.remove( 'is-visible' );
						}
					}
				},
				{ once: true }
			);
		}
	} );

	setupVideoTitle( playerWrapper, player, videoVars );
}
