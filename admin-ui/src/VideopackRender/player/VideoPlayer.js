import { useRef, useEffect, useState, useCallback } from '@wordpress/element';
import { __, _x, _n, sprintf } from '@wordpress/i18n';
import MetaBar from './MetaBar';
import VideoJS from './VideoJs';
import BelowVideo from './BelowVideo';

const VideoPlayer = ({ attributes, onReady }) => {
	const {
		embed_method,
		autoplay,
		controls,
		id,
		skin,
		loop,
		muted,
		playsinline,
		poster,
		preload,
		src,
		width,
		height,
		count_views,
		start,
		pauseothervideos,
		volume,
		endofvideooverlay,
		auto_res,
		pixel_ratio,
		right_click,
		playback_rate,
		fullwidth,
		view_count,
		caption,
		sources = [],
	} = attributes;

	const playerRef = useRef(null);
	const [videoJsOptions, setVideoJsOptions] = useState(null);
	const [metaBarVisible, setMetaBarVisible] = useState(true);

	const renderReady = sources && sources.length > 0 && sources[0].src;

	useEffect(() => {
		if (embed_method === 'WordPress Default' && playerRef.current) {
			const player = new MediaElementPlayer(playerRef.current);
			return () => {
				if (player) {
					player.remove();
				}
			};
		}
	}, [embed_method, playerRef.current]);

	useEffect(() => {
		if (embed_method === 'Video.js') {
			setVideoJsOptions({
				autoplay,
				controls,
				fluid: true,
				responsive: true,
				muted,
				preload,
				poster,
				loop,
				playsinline,
				volume,
				playbackRates: playback_rate ? [0.5, 1, 1.25, 1.5, 2] : [],
				sources: sources.map((s) => ({ src: s.src, type: s.type })),
				userActions: { click: false },
			});
		}
	}, [
		autoplay,
		controls,
		muted,
		preload,
		poster,
		loop,
		playsinline,
		volume,
		playback_rate,
		JSON.stringify(sources),
		embed_method,
	]);

	const videoSourceElements = () => {
		return sources.map((source, index) => (
			<source key={index} src={source.src} type={source.type} />
		));
	};

	const GenericPlayer = () => (
		<video
			poster={poster}
			loop={loop}
			autoPlay={autoplay}
			preload={preload}
			controls={controls}
			muted={muted}
			playsInline={playsinline}
			width="100%"
			height="100%"
			className={
				embed_method === 'WordPress Default'
					? 'wp-video-shortcode'
					: null
			}
			ref={playerRef}
		>
			{videoSourceElements()}
			<a href={src}>{src}</a>
		</video>
	);

	const WordPressDefaultPlayer = () => (
		<div className="wp-video">
			<GenericPlayer />
		</div>
	);

	const handleVideoPlayerReady = (player) => {
		playerRef.current = player;
		player.on('loadedmetadata', () => {
			if (embed_method === 'Video.js') {
				onReady(player.el().firstChild);
			} else {
				onReady(player);
			}
		});
		player.on('waiting', () => console.log('player is waiting'));
		player.on('dispose', () => console.log('player will dispose'));
	};

	if (!renderReady) {
		return null; // Or a loading spinner
	}

	return (
		<div className="videopack-wrapper">
			<div className="videopack-player">
				<MetaBar
					attributes={attributes}
					metaBarVisible={metaBarVisible}
				/>
				{embed_method === 'Video.js' && videoJsOptions && (
					<VideoJS
						options={videoJsOptions}
						onReady={handleVideoPlayerReady}
						skin={skin}
					/>
				)}
				{embed_method === 'WordPress Default' && (
					<WordPressDefaultPlayer onReady={handleVideoPlayerReady} />
				)}
				{embed_method === 'None' && (
					<GenericPlayer onReady={handleVideoPlayerReady} />
				)}
			</div>
			<BelowVideo attributes={attributes} />
		</div>
	);
};

export default VideoPlayer;
