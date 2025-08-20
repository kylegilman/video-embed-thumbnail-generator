import { useRef } from '@wordpress/element';
import MetaBar from './MetaBar';
import VideoJS from './VideoJs';
import BelowVideo from './BelowVideo';

const VideoPlayer = ({ attributes, onReady }) => {
	const {
		embed_method,
		skin,
		sources = [],
	} = attributes;

	const playerRef = useRef(null);

	const renderReady = sources && sources.length > 0 && sources[0].src;

	if (!renderReady) {
		return null; // Or a loading spinner
	}

	const handleVideoPlayerReady = (player) => {
		playerRef.current = player;
		// You can add other onReady logic here if needed in the future
		console.log(player);
		onReady(player);
	};

	const GenericPlayer = () => (
		<video
			poster={attributes.poster}
			loop={attributes.loop}
			autoPlay={attributes.autoplay}
			preload={attributes.preload}
			controls={attributes.controls}
			muted={attributes.muted}
			playsInline={attributes.playsinline}
			width="100%"
			height="100%"
			ref={playerRef}
		>
			{sources.map((source, index) => (
				<source key={index} src={source.src} type={source.type} />
			))}
			<a href={sources[0].src}>{sources[0].src}</a>
		</video>
	);

	const WordPressDefaultPlayer = () => (
		<div className="wp-video">
			<GenericPlayer />
		</div>
	);

	let playerComponent = null;

	if (embed_method === 'Video.js') {
		const videoJsOptions = {
			autoplay: attributes.autoplay,
			controls: attributes.controls,
			fluid: true,
			responsive: true,
			muted: attributes.muted,
			preload: attributes.preload,
			poster: attributes.poster,
			loop: attributes.loop,
			playsinline: attributes.playsinline,
			volume: attributes.volume,
			playbackRates: attributes.playback_rate ? [0.5, 1, 1.25, 1.5, 2] : [],
			sources: sources.map((s) => ({
				src: s.src,
					type: s.type,
					resolution: s.resolution,
			})),
			userActions: { click: false },
		};
		playerComponent = <VideoJS options={videoJsOptions} onReady={handleVideoPlayerReady} skin={skin} />;
	} else if (embed_method === 'WordPress Default') {
		playerComponent = <WordPressDefaultPlayer />;
	} else if (embed_method === 'None') {
		playerComponent = <GenericPlayer />;
	}

	return (
		<div className="videopack-wrapper">
			<div className="videopack-player">
				<MetaBar attributes={attributes} />
				{playerComponent}
			</div>
			<BelowVideo attributes={attributes} />
		</div>
	);
};

export default VideoPlayer;
