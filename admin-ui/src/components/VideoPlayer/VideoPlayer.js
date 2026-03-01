/* global MediaElementPlayer */

import { useRef, useEffect, useState, useMemo } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import MetaBar from './MetaBar';
import GenericPlayer from './GenericPlayer';
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
		embed_method,
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
		auto_codec,
		pixel_ratio,
		right_click,
		playback_rate,
		fullwidth,
		watermark,
		watermark_styles,
		watermark_link_to,
		watermark_url,
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

	const genericPlayerOptions = useMemo(
		() => ({
			poster,
			loop,
			autoPlay: actualAutoplay,
			preload,
			controls,
			muted,
			playsInline: playsinline,
			sources: allSources,
			src,
		}),
		[
			poster,
			loop,
			actualAutoplay,
			preload,
			controls,
			muted,
			playsinline,
			allSources,
			src,
		]
	);

	const renderReady =
		allSources && allSources.length > 0 && allSources[0].src;

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
						default_res: auto_res,
						default_codec: auto_codec,
					},
				};
			}

			setVideoJsOptions(options);
		}
	}, [
		autoplay,
		controls,
		muted,
		preload,
		auto_res,
		auto_codec,
		poster,
		loop,
		playsinline,
		volume,
		playback_rate,
		JSON.stringify(allSources),
		JSON.stringify(source_groups),
		embed_method,
	]);

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
			css.transform = css.transform ? 'translate(-50%, -50%)' : 'translateY(-50%)';
			css.marginTop = `${-y}%`;
		}
		return css;
	};

	const watermarkStyle = getWatermarkStyle();

	return (
		<div
			className={"videopack-wrapper meta-bar-visible"}
			ref={wrapperRef}
		>
			<div className={`videopack-player ${skin || ''}`}>
				<MetaBar attributes={decodedAttributes} playerRef={playerRef} />
				{embed_method === 'Video.js' && videoJsOptions && (
					<VideoJS
						options={videoJsOptions}
						skin={skin}
						onPlay={handlePlay}
						onPause={handlePause}
					/>
				)}
				{embed_method === 'WordPress Default' && (
					<div className="wp-video">
						<GenericPlayer
							{...genericPlayerOptions}
							className={'wp-video-shortcode'}
							ref={playerRef}
						/>
					</div>
				)}
				{embed_method === 'None' && (
					<GenericPlayer {...genericPlayerOptions} ref={playerRef} />
				)}
				{watermark && (
					<div className="videopack-watermark">
						{watermark_link_to &&
						watermark_link_to !== 'false' &&
						watermark_link_to !== 'None' ? (
							<a href="#" onClick={(e) => e.preventDefault()}>
								<img src={watermark} alt="watermark" style={watermarkStyle} />
							</a>
						) : (
							<img src={watermark} alt="watermark" style={watermarkStyle} />
						)}
					</div>
				)}
			</div>
			<BelowVideo attributes={decodedAttributes} />
		</div>
	);
};

export default VideoPlayer;
