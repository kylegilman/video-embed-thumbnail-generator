import { useRef, useEffect, } from '@wordpress/element';
import videojs from 'video.js';

export const VideoJS = ( props ) => {

	const videoRef = useRef(null);
	const playerRef = useRef(null);
	const { options, onReady, skin } = props;

	useEffect( () => {

		// Make sure Video.js player is only initialized once
		if ( ! playerRef.current ) {
		// The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
		const videoElement = document.createElement("video-js");

		videoElement.classList.add( 'video-js' );
		videoRef.current.appendChild(videoElement);

		const player = playerRef.current = videojs( videoElement, options, () => {
			videojs.log( 'player is ready' );
			onReady && onReady(player);
		} );

		// You could update an existing player in the `else` block here
		// on prop change, for example:
		} else {
			const player = playerRef.current;

			player.autoplay(options.autoplay);
			player.muted(options.muted);
			player.volume(options.volume);
			player.src(options.sources);
			player.poster(options.poster);
			player.loop(options.loop);
			player.controls(options.controls);
			player.preload(options.preload);
			player.src(options.sources);
			player.playbackRates(options.playbackRates);
		}
	}, [options, videoRef]);

	// Dispose the Video.js player when the functional component unmounts
	useEffect(() => {
		const player = playerRef.current;

		return () => {
			if ( player && ! player.isDisposed() ) {
				player.dispose();
				playerRef.current = null;
			}
		};
	}, [playerRef] );

	return (
		<div data-vjs-player>
			<div
				ref={ videoRef }
				className={ skin === 'default' ? null : skin }
			/>
		</div>
	);
}

export default VideoJS;
