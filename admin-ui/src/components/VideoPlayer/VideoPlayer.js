/**
 * Main VideoPlayer component that orchestrates different player engines and UI overlays.
 */

import { useRef, useEffect, useMemo, useCallback } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { applyFilters } from '@wordpress/hooks';
import MetaBar from './MetaBar';
import GenericPlayer from './GenericPlayer';
import VideoJS from './VideoJs';
import WpMejsPlayer from './WpMejsPlayer';
import BelowVideo from './BelowVideo';

const DEFAULT_PLAYERS = {
	'Video.js': VideoJS,
	'WordPress Default': WpMejsPlayer,
	None: GenericPlayer,
};
import './VideoPlayer.scss';

// Make sure to pass isSelected from the block's edit component.
const noop = () => {};

/**
 * VideoPlayer component.
 *
 * @param {Object}   props            Component props.
 * @param {Object}   props.attributes Block attributes.
 * @param {Function} props.onReady    Callback fired when the player engine is ready.
 * @return {Element|null} The rendered component.
 */
const VideoPlayer = ({ attributes, onReady = noop }) => {
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
		playback_rate,
		watermark,
		watermark_styles,
		watermark_link_to,
		fixed_aspect,
		default_ratio,
		play_button_color,
		play_button_icon_color,
		control_bar_bg_color,
		control_bar_color,
		title_color,
		title_background_color,
	} = decodedAttributes;

	const isFixedAspect = useMemo(() => {
		if (fixed_aspect === 'true' || fixed_aspect === true) {
			return true;
		}
		if (
			fixed_aspect === 'vertical' &&
			decodedAttributes.height > decodedAttributes.width
		) {
			return true;
		}
		return false;
	}, [fixed_aspect, decodedAttributes.width, decodedAttributes.height]);

	const aspectRatio = useMemo(() => {
		if (isFixedAspect) {
			return (default_ratio || '16 / 9').replace(/\s\/\s/g, ':');
		}
		if (decodedAttributes.width && decodedAttributes.height) {
			return `${decodedAttributes.width}:${decodedAttributes.height}`;
		}
		return undefined;
	}, [
		isFixedAspect,
		default_ratio,
		decodedAttributes.width,
		decodedAttributes.height,
	]);

	const playerStyles = useMemo(() => {
		const styles = {};
		const config = window.videopack_config || {};
		if (config.mejs_controls_svg) {
			styles['--videopack-mejs-controls-svg'] =
				`url(${config.mejs_controls_svg})`;
		}
		if (play_button_color) {
			styles['--videopack-play-button-color'] = play_button_color;
		}
		if (play_button_icon_color) {
			styles['--videopack-play-button-icon-color'] =
				play_button_icon_color;
		}
		if (control_bar_bg_color) {
			styles['--videopack-control-bar-bg-color'] = control_bar_bg_color;
		}
		if (control_bar_color) {
			styles['--videopack-control-bar-color'] = control_bar_color;
		}
		if (title_color) {
			styles['--videopack-title-color'] = title_color;
		}
		if (title_background_color) {
			styles['--videopack-title-background-color'] =
				title_background_color;
		}

		return styles;
	}, [
		play_button_color,
		play_button_icon_color,
		control_bar_bg_color,
		control_bar_color,
		title_color,
		title_background_color,
	]);

	const innerPlayerStyles = useMemo(() => {
		const styles = {};
		// Apply aspect ratio to the inner player if we know it (fixed or native)
		if (isFixedAspect) {
			styles.aspectRatio = default_ratio || '16 / 9';
		} else if (aspectRatio) {
			styles.aspectRatio = aspectRatio.replace(':', ' / ');
		}
		return styles;
	}, [isFixedAspect, default_ratio, aspectRatio]);

	const wrapperClasses = useMemo(() => {
		const classes = ['videopack-wrapper', 'videopack-meta-bar-visible'];
		if (isFixedAspect || aspectRatio) {
			classes.push('videopack-has-aspect-ratio');
			if (isFixedAspect) {
				classes.push('videopack-fixed-aspect');
			}
		}
		if (play_button_color) {
			classes.push('videopack-has-play-button-color');
		}
		if (play_button_icon_color) {
			classes.push('videopack-has-play-button-icon-color');
		}
		if (control_bar_bg_color) {
			classes.push('videopack-has-control-bar-bg-color');
		}
		if (control_bar_color) {
			classes.push('videopack-has-control-bar-color');
		}
		if (title_color) {
			classes.push('videopack-has-title-color');
		}
		if (title_background_color) {
			classes.push('videopack-has-title-background-color');
		}
		return classes.join(' ');
	}, [
		play_button_color,
		play_button_icon_color,
		control_bar_bg_color,
		control_bar_color,
		title_color,
		title_background_color,
		isFixedAspect,
		aspectRatio,
	]);

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
			volume,
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
			volume,
			playsinline,
			src,
			allSources,
			text_tracks,
			embed_method,
		] // eslint-disable-line react-hooks/exhaustive-deps
	);

	const videoJsOptions = useMemo(() => {
		const isVjs = applyFilters(
			'videopack_is_videojs_player',
			embed_method === 'Video.js',
			embed_method
		);
		if (!isVjs) {
			return null;
		}

		const options = {
			autoplay: actualAutoplay,
			controls,
			fluid: !aspectRatio, // Use fluid if no ratio specified
			fill: !!aspectRatio, // Use fill if we have a ratio (handled by CSS)
			responsive: true,
			aspectRatio,
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
		aspectRatio,
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
		<div className={wrapperClasses} ref={wrapperRef} style={playerStyles}>
			<div
				className={`videopack-player ${skin || ''}`}
				style={innerPlayerStyles}
			>
				<MetaBar
					attributes={decodedAttributes}
					playerRef={playerInstanceRef}
				/>
				{(() => {
					const players = applyFilters(
						'videopack_admin_players',
						DEFAULT_PLAYERS
					);
					const PlayerComponent =
						players[embed_method] || players.None;

					if (embed_method === 'Video.js' && videoJsOptions) {
						return (
							<PlayerComponent
								key={`videojs-${src}`}
								options={videoJsOptions}
								skin={skin}
								onPlay={handlePlay}
								onPause={handlePause}
								onReady={handleVideoPlayerReady}
							/>
						);
					}

					if (embed_method === 'WordPress Default') {
						return (
							<PlayerComponent
								key={`wpvideo-${src}`}
								options={genericPlayerOptions}
								controls={controls}
								actualAutoplay={actualAutoplay}
								onReady={handleMejsReady}
								onPlay={handlePlay}
								playback_rate={playback_rate}
								aspectRatio={aspectRatio}
							/>
						);
					}

					if (embed_method === 'None') {
						return (
							<PlayerComponent
								{...genericPlayerOptions}
								ref={videoRef}
							/>
						);
					}

					// Fallback for custom players
					if (PlayerComponent === GenericPlayer) {
						return (
							<PlayerComponent
								key={`${embed_method}-fallback-${src}`}
								{...genericPlayerOptions}
								ref={videoRef}
							/>
						);
					}
					return (
						<PlayerComponent
							key={`${embed_method}-${src}`}
							options={videoJsOptions || genericPlayerOptions}
							skin={skin}
							attributes={decodedAttributes}
							onPlay={handlePlay}
							onPause={handlePause}
							onReady={handleVideoPlayerReady}
						/>
					);
				})()}
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
