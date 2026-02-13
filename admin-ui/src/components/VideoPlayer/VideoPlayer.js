/* global MediaElementPlayer */

import { useRef, useEffect, useState, useMemo } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import MetaBar from './MetaBar';
import VideoJS from './VideoJs';
import BelowVideo from './BelowVideo';
import './VideoPlayer.scss';

// Make sure to pass isSelected from the block's edit component.
const VideoPlayer = ({ attributes, onReady }) => {
	const decodedAttributes = useMemo(
		() => ({
			...attributes,
			title: attributes.title
				? decodeEntities(attributes.title)
				: attributes.title,
		}),
		[attributes]
	);

	const {
		embed_method = 'Video.js',
		autoplay,
		controls,
		skin,
		loop,
		muted,
		playsinline,
		poster,
		preload,
		src,
		width,
		height,
		start,
		pauseothervideos,
		volume,
		endofvideooverlay,
		auto_res,
		pixel_ratio,
		right_click,
		playback_rate,
		fullwidth,
		sources = [],
		source_groups = {},
	} = decodedAttributes;

	const actualAutoplay = useMemo(() => {
		return autoplay && muted;
	}, [autoplay, muted]);

	const playerRef = useRef(null);
	const wrapperRef = useRef(null);
	const [videoJsOptions, setVideoJsOptions] = useState(null);

	const allSources = useMemo(() => {
		if (Object.keys(source_groups).length > 0) {
			return Object.values(source_groups).flatMap(
				(group) => group.sources
			);
		}
		return sources;
	}, [sources, source_groups]);

	const renderReady = allSources && allSources.length > 0 && allSources[0].src;

	const handlePlay = () => {
		if (wrapperRef.current) {
			wrapperRef.current.classList.remove('meta-bar-visible');
		}
	};

	const handlePause = () => {
		if (wrapperRef.current) {
			wrapperRef.current.classList.add('meta-bar-visible');
		}
	};

	useEffect(() => {
		if (embed_method === 'WordPress Default' && playerRef.current) {
			const player = new MediaElementPlayer(playerRef.current);
			return () => {
				if (player) {
					player.remove();
				}
			};
		}
	}, [embed_method]);

	useEffect(() => {
		if (embed_method === 'Video.js') {
			const options = {
				autoplay: actualAutoplay,
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
				sources: allSources.map((s) => ({
					src: s.src,
					type: s.type,
					resolution: s.resolution,
				})),
			};

			const hasResolutions = allSources.some((s) => s.resolution);

			if (hasResolutions) {
				options.plugins = {
					...options.plugins,
					resolutionSelector: {
						force_types: ['video/mp4'],
						source_groups,
					},
				};
				const defaultResSource = allSources.find((s) => s.default);
				if (defaultResSource) {
					options.plugins.resolutionSelector.default_res =
						defaultResSource.resolution;
				}
			}

			setVideoJsOptions(options);
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
		JSON.stringify(allSources),
		JSON.stringify(source_groups),
		embed_method,
	]);

	const videoSourceElements = () => {
		return allSources.map((source, index) => (
			<source key={index} src={source.src} type={source.type} />
		));
	};

	const GenericPlayer = () => (
		<video
			poster={poster}
			loop={loop}
			autoPlay={actualAutoplay}
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
			if (actualAutoplay) {
				handlePlay();
			}
		});
		player.on('waiting', () => console.log('player is waiting'));
		player.on('dispose', () => console.log('player will dispose'));
	};

	if (!renderReady) {
		return null; // Or a loading spinner
	}

	return (
		<div className="videopack-wrapper meta-bar-visible" ref={wrapperRef}>
			<div className="videopack-player">
				<MetaBar attributes={decodedAttributes} />
				{embed_method === 'Video.js' && videoJsOptions && (
					<VideoJS
						options={videoJsOptions}
						skin={skin}
						onPlay={handlePlay}
						onPause={handlePause}
					/>
				)}
				{embed_method === 'WordPress Default' && (
					<WordPressDefaultPlayer />
				)}
				{embed_method === 'None' && <GenericPlayer />}
			</div>
			<BelowVideo attributes={decodedAttributes} />
		</div>
	);
};

export default VideoPlayer;
