import { useRef, useEffect } from '@wordpress/element';
import videojs from 'video.js';

export const VideoJS = (props) => {
	const videoRef = useRef(null);
	const playerRef = useRef(null);
	const { options, onReady, skin } = props;

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
				onReady && onReady(playerRef.current);
			});

			// On subsequent renders, update the existing player.
		} else {
			const player = playerRef.current;
			if (player && !player.isDisposed()) {
				player.autoplay(options.autoplay);
				player.muted(options.muted);
				player.poster(options.poster);
				// Only update src if sources are valid to prevent the error.
				if (options.sources && options.sources.length > 0) {
					player.src(options.sources);
				}
			}
		}
	}, [options, onReady]);

	// Dispose the player when the component unmounts
	useEffect(() => {
		const player = playerRef.current;
		return () => {
			if (player && !player.isDisposed()) {
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
