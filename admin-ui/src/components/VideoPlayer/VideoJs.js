/**
 * A React wrapper for the Video.js player library.
 */

/* global videojs */

import { useRef, useEffect } from '@wordpress/element';

/**
 * Video.js React component.
 *
 * Uses setTimeout(fn, 0) to defer initialization to the next event loop tick.
 * This handles both React Strict Mode (cleanup cancels the timer) and the
 * WordPress Block Editor iframe migration (the container is in the correct
 * document by the time the timer fires).
 *
 * @param {Object}   props         Component props.
 * @param {Object}   props.options Video.js player options.
 * @param {string}   props.skin    CSS class name for the player skin.
 * @param {Function} props.onPlay  Callback for the play event.
 * @param {Function} props.onPause Callback for the pause event.
 * @param {Function} props.onReady Callback fired once the player is ready.
 */
export const VideoJS = (props) => {
	const videoRef = useRef(null);
	const playerRef = useRef(null);
	const { options, skin, onPlay, onPause, onReady } = props;
	const previousSkinRef = useRef(skin);
	const previousPluginsRef = useRef(options?.plugins);

	useEffect(() => {
		let initTimer;
		const player = playerRef.current;
		// When plugins change (e.g. resolution selector added after entity
		// record resolves), initialize the plugin on the existing player
		// rather than disposing. Disposing triggers a setTimeout reinit,
		// but by then the container is disconnected from the iframe.
		if (
			player &&
			!player.isDisposed() &&
			JSON.stringify(previousPluginsRef.current) !==
			JSON.stringify(options.plugins)
		) {
			previousPluginsRef.current = options.plugins;

			if (
				options.plugins &&
				typeof player.resolutionSelector === 'function'
			) {
				try {
					// Update sources first so the plugin sees all resolutions.
					if (options.sources && options.sources.length > 0) {
						const currentSrc = player.currentSrc();
						const newSrc = options.sources[0].src;
						if (currentSrc !== newSrc) {
							player.src(options.sources);
						}
					}
					player.resolutionSelector(
						options.plugins.resolutionSelector
					);
				} catch (e) {
					console.warn('Video.js plugin update error:', e);
				}
			}
		}

		// On initial render (or after dispose), wait for sources to be available before initializing.
		if (!player) {
			// Wrap initialization in a timeout to handle React Strict Mode double-mounts.
			// This ensures we don't init a player if the component is immediately unmounted.

			initTimer = setTimeout(() => {

				if (
					!options ||
					!options.sources ||
					options.sources.length === 0
				) {
					return; // Don't initialize until sources are ready.
				}

				if (!videoRef.current) {
					return;
				}

				// Ensure the container is empty before creating a new player.
				while (videoRef.current.firstChild) {
					videoRef.current.removeChild(videoRef.current.firstChild);
				}

				const videoElement = document.createElement('video');
				videoElement.className = `video-js ${skin || ''} vjs-big-play-centered`;
				videoElement.setAttribute('playsinline', '');

				videoRef.current.appendChild(videoElement);

				playerRef.current = videojs(videoElement, options, function () {
					if (onReady) {
						onReady(this);
					}
					this.on('play', onPlay);
					this.on('pause', onPause);
				});
			}, 0);
		} else if (player && !player.isDisposed()) {
			player.ready(function () {
				// Safeguard against missing tech (e.g. failed to load source)
				if (!player.tech(true)) {
					return;
				}

				// Update existing player options
				player.autoplay(options.autoplay);
				player.loop(options.loop);
				player.muted(options.muted);
				player.volume(options.volume);
				player.poster(options.poster);
				player.controls(options.controls);
				player.playbackRates(
					options.playback_rate ? [0.5, 1, 1.25, 1.5, 2] : []
				);
				player.preload(options.preload);

				if (previousSkinRef.current !== skin) {
					if (previousSkinRef.current) {
						player.removeClass(previousSkinRef.current);
					}
					if (skin) {
						player.addClass(skin);
					}
					previousSkinRef.current = skin;
				}

				// Only update src if it has actually changed to prevent reloading
				if (options.sources && options.sources.length > 0) {
					const currentSrc = player.currentSrc();
					const newSrc = options.sources[0].src;
					if (currentSrc !== newSrc) {
						player.src(options.sources);
					}
				}

				// Update tracks if they changed
				if (options.tracks) {
					const remoteTracks = player.remoteTextTracks();
					const currentTracks = [];
					for (let i = 0; i < remoteTracks.length; i++) {
						currentTracks.push({
							src: remoteTracks[i].src,
							kind: remoteTracks[i].kind,
							srclang: remoteTracks[i].language,
							label: remoteTracks[i].label,
							default: remoteTracks[i].default,
						});
					}

					if (
						JSON.stringify(currentTracks) !==
						JSON.stringify(options.tracks)
					) {
						// Remove old remote tracks
						for (let i = remoteTracks.length - 1; i >= 0; i--) {
							player.removeRemoteTextTrack(remoteTracks[i]);
						}
						// Add new ones
						options.tracks.forEach((track) => {
							player.addRemoteTextTrack(track, false);
						});
					}
				}
			});
		}

		return () => {
			clearTimeout(initTimer);
		};
	}, [options, skin, onPlay, onPause, onReady]);

	// Dispose the player when the component unmounts
	useEffect(() => {
		return () => {
			if (playerRef.current && !playerRef.current.isDisposed()) {
				playerRef.current.off('play', onPlay);
				playerRef.current.off('pause', onPause);
				playerRef.current.dispose();
				playerRef.current = null;
			}
		};
	}, [onPause, onPlay]);

	return (
		<div
			data-vjs-player
			ref={videoRef}
			style={{ width: '100%', height: '100%' }}
		/>
	);
};

export default VideoJS;
