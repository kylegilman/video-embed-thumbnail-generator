import { useRef, useEffect } from '@wordpress/element';
import videojs from 'video.js';

export const VideoJS = (props) => {
	const videoRef = useRef(null);
	const playerRef = useRef(null);
	const { options, onReady, skin } = props;

	useEffect(() => {
		// Make sure we have a video element and sources
		if (!videoRef.current || !options.sources || options.sources.length === 0) {
			return;
		}

		// Initialize the player
		const player = videojs(videoRef.current, options, () => {
			onReady && onReady(player);
		});
		playerRef.current = player;

		// When the component unmounts, dispose the player
		return () => {
			if (playerRef.current && !playerRef.current.isDisposed()) {
				playerRef.current.dispose();
				playerRef.current = null;
			}
		};
	}, [JSON.stringify(options)]); // Use JSON.stringify to deep-compare the options object

	return (
		<div data-vjs-player>
			<div ref={videoRef} className={`video-js ${skin}`} />
		</div>
	);
};

export default VideoJS;