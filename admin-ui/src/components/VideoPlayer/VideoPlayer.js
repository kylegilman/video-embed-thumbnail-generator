import { useRef, useEffect, useMemo, useCallback } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import MetaBar from './MetaBar';
import GenericPlayer from './GenericPlayer';
import VideoJS from './VideoJs';
import WpMejsPlayer from './WpMejsPlayer';
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
		embed_method,
		autoplay,
		controls = true,
		skin,
		loop,
		muted,
		playsinline,
		poster,
		preload,
		src,
		volume,
		auto_res,
		auto_codec,
		sources = [],
		source_groups = {},
		text_tracks = [],
		inline,
		playback_rate,
		watermark,
		watermark_styles,
		watermark_link_to,
		fixed_aspect,
		default_ratio,
	} = decodedAttributes;

	const actualAutoplay = useMemo(() => {
		return autoplay;
	}, [autoplay]);

	const videoRef = useRef(null);
	const playerInstanceRef = useRef(null);
	const wrapperRef = useRef(null);

	const allSources = useMemo(() => {
		if (Object.keys(source_groups).length > 0) {
			return Object.values(source_groups).flatMap(
				(group) => group.sources
			);
		}
		return sources;
	}, [sources, source_groups]);

	const genericPlayerOptions = useMemo(
		() => ({
			poster,
			loop,
			preload,
			controls: !!controls,
			muted,
			playsInline: playsinline,
			className: 'videopack-video',
			sources: allSources,
			src,
			tracks: text_tracks,
			autoPlay:
				embed_method === 'WordPress Default' ? false : actualAutoplay,
		}),
		[
			poster,
			loop,
			actualAutoplay,
			preload,
			controls,
			muted,
			playsinline,
			src,
			allSources,
			text_tracks,
			embed_method,
		] // eslint-disable-line react-hooks/exhaustive-deps
	);

	const videoJsOptions = useMemo(() => {
		if (embed_method !== 'Video.js') {
			return null;
		}

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
			tracks: text_tracks.map((t) => ({
				src: t.src,
				kind: t.kind,
				srclang: t.srclang,
				label: t.label,
				default: t.default,
			})),
		};

		const hasResolutions = allSources.some((s) => s.resolution);

		if (hasResolutions) {
			options.plugins = {
				...options.plugins,
				resolutionSelector: {
					force_types: ['video/mp4'],
					source_groups,
					default_res: auto_res,
					default_codec: auto_codec,
				},
			};
		}

		return options;
	}, [
		embed_method,
		actualAutoplay,
		controls,
		muted,
		preload,
		poster,
		loop,
		playback_rate,
		playsinline,
		volume,
		auto_res,
		auto_codec,
		allSources,
		source_groups,
		text_tracks,
	]); // eslint-disable-line react-hooks/exhaustive-deps

	const renderReady =
		allSources && allSources.length > 0 && allSources[0].src;

	const handlePlay = useCallback(() => {
		if (wrapperRef.current) {
			wrapperRef.current.classList.remove('videopack-meta-bar-visible');
		}
	}, []);

	const handlePause = useCallback(() => {
		if (wrapperRef.current) {
			wrapperRef.current.classList.add('videopack-meta-bar-visible');
		}
	}, []);

	const onReadyRef = useRef(onReady);
	useEffect(() => {
		onReadyRef.current = onReady;
	}, [onReady]);

	const handleVideoPlayerReady = useCallback(
		(player) => {
			playerInstanceRef.current = player;
			player.on('loadedmetadata', () => {
				if (onReady) {
					if (embed_method === 'Video.js') {
						onReady(player.el().firstChild);
					} else {
						onReady(player);
					}
				}
				if (actualAutoplay) {
					handlePlay();
				}
			});
		},
		[embed_method, actualAutoplay, onReady, handlePlay]
	);

	const handleMejsReady = useCallback(
		(player) => {
			playerInstanceRef.current = player;
			if (onReady) {
				onReady(player);
			}
		},
		[onReady]
	);

	if (!renderReady) {
		return null; // Or a loading spinner
	}

	const getWatermarkStyle = () => {
		const defaults = {
			scale: 10,
			align: 'right',
			valign: 'bottom',
			x: 5,
			y: 7,
		};

		const styles = { ...defaults, ...watermark_styles };

		// Check if styles differ from defaults
		if (
			Number(styles.scale) === defaults.scale &&
			styles.align === defaults.align &&
			styles.valign === defaults.valign &&
			Number(styles.x) === defaults.x &&
			Number(styles.y) === defaults.y
		) {
			return null;
		}

		const css = {
			maxWidth: `${styles.scale}%`,
			width: '100%',
			height: 'auto',
			position: 'absolute',
		};

		const x = styles.x || 0;
		const y = styles.y || 0;

		if (styles.align === 'left') {
			css.left = `${x}%`;
		} else if (styles.align === 'right') {
			css.right = `${x}%`;
		} else {
			css.left = '50%';
			css.transform = 'translateX(-50%)';
			css.marginLeft = `${-x}%`;
		}

		if (styles.valign === 'top') {
			css.top = `${y}%`;
		} else if (styles.valign === 'bottom') {
			css.bottom = `${y}%`;
		} else {
			css.top = '50%';
			css.transform = css.transform
				? 'translate(-50%, -50%)'
				: 'translateY(-50%)';
			css.marginTop = `${-y}%`;
		}
		return css;
	};

	const watermarkStyle = getWatermarkStyle();

	return (
		<div className={`videopack-wrapper videopack-meta-bar-visible`} ref={wrapperRef}>
			<div className={`videopack-player ${skin || ''}`}>
				<MetaBar
					attributes={decodedAttributes}
					playerRef={playerInstanceRef}
				/>
				{embed_method === 'Video.js' && videoJsOptions && (
					<VideoJS
						key={`videojs-${src}`}
						options={videoJsOptions}
						skin={skin}
						onPlay={handlePlay}
						onPause={handlePause}
						onReady={handleVideoPlayerReady}
					/>
				)}
				{embed_method === 'WordPress Default' && (
					<WpMejsPlayer
						key={`wpvideo-${src}`}
						options={genericPlayerOptions}
						controls={controls}
						actualAutoplay={actualAutoplay}
						onReady={handleMejsReady}
						onPlay={handlePlay}
						playback_rate={playback_rate}
					/>
				)}
				{embed_method === 'None' && (
					<GenericPlayer {...genericPlayerOptions} ref={videoRef} />
				)}
				{watermark && (
					<div className="videopack-watermark">
						{watermark_link_to &&
							watermark_link_to !== 'false' &&
							watermark_link_to !== 'None' ? (
							<a
								href="#videopack-watermark-link"
								className="videopack-watermark-link"
								onClick={(e) => e.preventDefault()}
							>
								<img
									src={watermark}
									alt="watermark"
									style={watermarkStyle}
								/>
							</a>
						) : (
							<img
								src={watermark}
								alt="watermark"
								style={watermarkStyle}
							/>
						)}
					</div>
				)}
			</div>
			<BelowVideo attributes={decodedAttributes} />
		</div>
	);
};

export default VideoPlayer;
