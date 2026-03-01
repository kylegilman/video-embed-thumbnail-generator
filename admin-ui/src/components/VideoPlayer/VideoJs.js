/* global videojs */

import { useRef, useEffect } from '@wordpress/element';

export const VideoJS = (props) => {
	const videoRef = useRef(null);
	const playerRef = useRef(null);
	const { options, skin, onPlay, onPause } = props;
	const previousSkinRef = useRef(skin);
	const previousPluginsRef = useRef(options?.plugins);

	useEffect(() => {
		let initTimer;
		let player = playerRef.current;

		// Check if plugins options changed (e.g. default resolution/codec).
		// If so, dispose of the player so it can be re-initialized with new options.
		if (
			player &&
			JSON.stringify(previousPluginsRef.current) !==
				JSON.stringify(options.plugins)
		) {
			player.dispose();
			playerRef.current = null;
			player = null;
			previousPluginsRef.current = options.plugins;
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
					this.on('play', onPlay);
					this.on('pause', onPause);
				});
			}, 0);
		} else if (player && !player.isDisposed()) {
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
		}

		return () => {
			clearTimeout(initTimer);
		};
	}, [options, skin, onPlay, onPause]);

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
	}, []);

	return (
		<div
			data-vjs-player
			ref={videoRef}
			style={{ width: '100%', height: '100%' }}
		/>
	);
};

export default VideoJS;
