/* global videojs */

import { useRef, useEffect } from '@wordpress/element';

export const VideoJS = (props) => {
	const videoRef = useRef(null);
	const playerRef = useRef(null);
	const { options, skin, onPlay, onPause } = props;

	useEffect(() => {
		// On initial render, wait for sources to be available before initializing.
		if (!playerRef.current) {
			if (!options || !options.sources || options.sources.length === 0) {
				return; // Don't initialize until sources are ready.
			}

			const videoElement = videoRef.current;
			if (!videoElement) {
				return;
			}

			playerRef.current = videojs(videoElement, options, () => {
				playerRef.current.on('play', onPlay);
				playerRef.current.on('pause', onPause);
			});

			// On subsequent renders, update the existing player.
		} else {
			const player = playerRef.current;
			if (player && !player.isDisposed()) {
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

				// Only update src if sources are valid to prevent error.
				if (options.sources && options.sources.length > 0) {
					player.src(options.sources);
				}
			}
		}
	}, [options]);

	// Dispose the player when the component unmounts
	useEffect(() => {
		const player = playerRef.current;
		return () => {
			if (player && !player.isDisposed()) {
				player.off('play', onPlay);
				player.off('pause', onPause);
				player.dispose();
				playerRef.current = null;
			}
		};
	}, []);

	return (
		<div data-vjs-player>
			<video ref={videoRef} className={`video-js ${skin}`} />
		</div>
	);
};

export default VideoJS;
