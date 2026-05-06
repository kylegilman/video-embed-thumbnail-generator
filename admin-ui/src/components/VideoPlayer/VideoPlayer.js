/**
 * Main VideoPlayer component that orchestrates different player engines and UI overlays.
 */

import {
	useRef,
	useEffect,
	useMemo,
	useCallback,
	useState,
} from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import useVideopackContext from '../../hooks/useVideopackContext';
import GenericPlayer from './GenericPlayer.js';
import VideoJS from './VideoJs.js';
import WpMejsPlayer from './WpMejsPlayer.js';
import CustomDuotoneFilter from '../Duotone/CustomDuotoneFilter';

const DEFAULT_PLAYERS = {
	'Video.js': VideoJS,
	'WordPress Default': WpMejsPlayer,
	None: GenericPlayer,
};

// Make sure to pass isSelected from the block's edit component.
const noop = () => {};

/**
 * VideoPlayer component.
 *
 * @param {Object}   props                    Component props.
 * @param {Object}   props.attributes         Block attributes.
 * @param {Object}   props.context            Inherited block context.
 * @param {Function} props.setAttributes      Function to update block attributes.
 * @param {boolean}  props.isSelected         Whether the block is selected.
 * @param {boolean}  props.hideStaticOverlays Whether to hide site-wide static overlays (watermark, title).
 * @param {Function} props.onReady            Callback fired when the player engine is ready.
 * @param {Object}   props.children           Child components (InnerBlocks).
 * @return {Element|null} The rendered component.
 */
const VideoPlayer = ({
	attributes = {},
	context = {},
	onReady = noop,
	children,
	// Catch-all for non-DOM attributes that might leak from settings/block spreading
	...otherProps
}) => {
	// Standardize attributes to ensure all block-level settings are here
	const blockAttributes = useMemo(
		() => ({
			...attributes,
			// If props are passed directly (e.g. from BlockPreview spreading), prioritize them
			...otherProps,
		}),
		[attributes, otherProps]
	);

	// Use unified context hook for all design and behavior resolution
	const {
		resolved,
		style: contextStyles,
		classes: contextClasses,
	} = useVideopackContext(blockAttributes, context);

	const wrapperRef = useRef(null);
	const [detectedDimensions, setDetectedDimensions] = useState({
		width: null,
		height: null,
		src: null, // Track which src these dimensions are for
	});

	const [resetKey, setResetKey] = useState(0);

	const resetPlayer = useCallback(() => {
		setResetKey((prev) => prev + 1);
	}, []);

	// Reset dimensions when src changes
	useEffect(() => {
		const { src } = blockAttributes || {};
		if (src !== detectedDimensions.src) {
			setDetectedDimensions({
				width: null,
				height: null,
				src,
			});
		}
	}, [blockAttributes, detectedDimensions.src]);

	// Handle external restart requests
	useEffect(() => {
		if (blockAttributes?.restartCount > 0) {
			resetPlayer();
		}
	}, [blockAttributes?.restartCount, resetPlayer]);

	const onMetadataLoaded = useCallback(
		(dimensions) => {
			if (
				dimensions.width === detectedDimensions.width &&
				dimensions.height === detectedDimensions.height &&
				blockAttributes.src === detectedDimensions.src
			) {
				return;
			}
			setDetectedDimensions({
				...dimensions,
				src: blockAttributes.src,
			});
		},
		[detectedDimensions, blockAttributes.src, setDetectedDimensions]
	);

	const {
		autoplay,
		controls = true,
		loop,
		muted,
		playsinline,
		poster,
		preload,
		src,
		volume,
		auto_res,
		auto_codec,
		sources: incomingSources = [],
		source_groups: incomingSourceGroups = {},
		text_tracks = [],
		playback_rate,
		default_ratio,
		// Design settings resolved from context
		skin,
		embed_method = 'Video.js',
		duotone,
		fixed_aspect,
		fullwidth,
		loopDuotoneId,
	} = resolved;

	const source_groups = useMemo(() => {
		// If we have valid groups, use them (handle empty array vs object)
		if (
			incomingSourceGroups &&
			!Array.isArray(incomingSourceGroups) &&
			Object.keys(incomingSourceGroups).length > 0
		) {
			return incomingSourceGroups;
		}

		// Fallback: Group flat sources by codec
		if (incomingSources.length > 0) {
			const groups = {};
			incomingSources.forEach((s) => {
				const codec = s.codec || s.codecs || 'h264';
				if (!groups[codec]) {
					groups[codec] = { sources: [], label: codec.toUpperCase() };
				}
				groups[codec].sources.push(s);
			});
			return groups;
		}

		return {};
	}, [incomingSourceGroups, incomingSources]);

	const final_embed_method = embed_method;
	const final_skin = skin;

	// Duotone resolution
	const final_duotone = blockAttributes?.style?.color?.duotone || duotone;
	const instanceId = useMemo(() => {
		return `vp-player-${Math.random().toString(36).substr(2, 9)}`;
	}, []);

	let resolvedDuotoneClass = '';

	if (loopDuotoneId) {
		resolvedDuotoneClass = loopDuotoneId;
	} else if (
		typeof final_duotone === 'string' &&
		final_duotone.startsWith('var:preset|duotone|')
	) {
		resolvedDuotoneClass = `wp-duotone-${final_duotone.split('|').pop()}`;
	} else if (Array.isArray(final_duotone)) {
		resolvedDuotoneClass = `videopack-custom-duotone-${instanceId}`;
	}

	const players = useMemo(
		() => applyFilters('videopack_admin_players', DEFAULT_PLAYERS),
		[]
	);

	const isVertical = useMemo(() => {
		let vertical = false;
		// Use browser-detected dimensions if available
		if (detectedDimensions.width && detectedDimensions.height) {
			vertical = detectedDimensions.height > detectedDimensions.width;
		} else {
			// Fallback to database metadata
			vertical =
				Number(resolved.height) > Number(resolved.width) ||
				[90, 270].includes(Number(resolved.rotate));
		}

		return vertical;
	}, [
		detectedDimensions.width,
		detectedDimensions.height,
		resolved.width,
		resolved.height,
		resolved.rotate,
	]);

	const isFixedAspect = useMemo(() => {
		const verticalFixed = fixed_aspect === 'vertical' && isVertical;
		const alwaysFixed = fixed_aspect === 'always';

		return (
			(alwaysFixed || verticalFixed) &&
			(fullwidth !== true || verticalFixed)
		);
	}, [fixed_aspect, fullwidth, isVertical]);

	const aspectRatio = useMemo(() => {
		let ratio;
		if (isFixedAspect) {
			ratio = (default_ratio || '16 / 9').replace(/\s\/\s/g, ':');
		} else if (detectedDimensions.width && detectedDimensions.height) {
			// If we have browser-detected dimensions and they aren't forced to fixed, use them
			ratio = `${detectedDimensions.width}:${detectedDimensions.height}`;
		} else if (resolved.width && resolved.height) {
			ratio = `${resolved.width}:${resolved.height}`;
		}

		return ratio;
	}, [
		isFixedAspect,
		default_ratio,
		detectedDimensions.width,
		detectedDimensions.height,
		resolved.width,
		resolved.height,
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

	const playerStyles = useMemo(() => {
		const styles = { ...contextStyles };
		const config = window.videopack_config || {};
		const mejsSvgPath =
			config.mejs_controls_svg ||
			(typeof window !== 'undefined'
				? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg`
				: '');
		if (final_embed_method === 'WordPress Default' && mejsSvgPath) {
			styles['--videopack-mejs-controls-svg'] = `url("${mejsSvgPath}")`;
		}

		return styles;
	}, [final_embed_method, contextStyles]);

	const wrapperClasses = useMemo(() => {
		const classes = [
			...(typeof contextClasses === 'string'
				? contextClasses.split(' ').filter(Boolean)
				: contextClasses),
			'videopack-video-block-container',
			'videopack-wrapper',
		];

		if (isFixedAspect || aspectRatio) {
			classes.push('videopack-has-aspect-ratio');
			if (isFixedAspect) {
				classes.push('videopack-is-fixed-aspect');
			}
		}

		if (resolvedDuotoneClass && !loopDuotoneId) {
			classes.push(resolvedDuotoneClass);
		}

		// Ensure unique classes and join
		return [...new Set(classes)].join(' ');
	}, [
		contextClasses,
		final_embed_method,
		isFixedAspect,
		aspectRatio,
		resolvedDuotoneClass,
		loopDuotoneId,
	]);

	const actualAutoplay = useMemo(() => {
		return autoplay;
	}, [autoplay]);

	const finalizedSources = useMemo(() => {
		// Priority 1: Sources from groups
		if (Object.keys(source_groups).length > 0) {
			const groupedSources = Object.values(source_groups).flatMap(
				(g) => g.sources || []
			);
			if (groupedSources.length > 0) {
				return groupedSources.filter((s) => s && s.src);
			}
		}

		// Priority 2: Flat sources array
		if (incomingSources && incomingSources.length > 0) {
			return incomingSources.filter((s) => s && s.src);
		}

		// Priority 3: Primary src attribute
		if (src) {
			return [{ src, type: 'video/mp4' }];
		}

		return [];
	}, [source_groups, incomingSources, src]);

	const uniqueKey = useMemo(() => {
		if (blockAttributes.id) {
			return `${blockAttributes.id}-${JSON.stringify(source_groups)}`;
		}
		return Math.random().toString(36).substr(2, 9);
	}, [blockAttributes.id, source_groups, final_embed_method]);

	const genericPlayerOptions = useMemo(
		() => ({
			poster,
			loop,
			preload,
			controls: !!controls,
			muted,
			playsInline: playsinline,
			className: 'videopack-video',
			sources: finalizedSources,
			src,
			tracks: text_tracks,
			volume,
			autoPlay:
				final_embed_method === 'WordPress Default'
					? false
					: actualAutoplay,
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
			finalizedSources,
			text_tracks,
			final_embed_method,
		]
	);

	const videoJsOptions = useMemo(() => {
		const isVjs = applyFilters(
			'videopack_is_videojs_player',
			final_embed_method === 'Video.js',
			final_embed_method
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
			sources: finalizedSources.map((s) => ({
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

		options.source_groups = source_groups;

		const hasMultipleSources = finalizedSources.length > 1;
		const hasResolutions = finalizedSources.some(
			(s) => s.resolution || s['data-res']
		);
		const hasMultipleCodecs = Object.keys(source_groups).length > 1;

		if (hasResolutions || hasMultipleCodecs || hasMultipleSources) {
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
		final_embed_method,
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
		finalizedSources,
		source_groups,
		text_tracks,
		aspectRatio,
	]);

	const handlePlay = useCallback(() => {
		console.log('VideoPlayer: handlePlay triggered');
		if (wrapperRef.current) {

			const elements = Array.from(
				wrapperRef.current.querySelectorAll(
					'.videopack-video-title, .videopack-meta-wrapper, .videopack-video-title-block, .videopack-video-title-wrapper'
				)
			);
			const parent = wrapperRef.current.parentElement?.closest(
				'.videopack-wrapper'
			);
			if (parent) {
				Array.from(
					parent.querySelectorAll(
						'.videopack-video-title, .videopack-meta-wrapper, .videopack-video-title-block, .videopack-video-title-wrapper'
					)
				).forEach((el) => {
					if (!elements.includes(el)) {
						elements.push(el);
					}
				});
			}

			elements.forEach((el) =>
				el.classList.remove('videopack-video-title-visible')
			);
		}
	}, []);

	const handlePause = useCallback(() => {
		console.log('VideoPlayer: handlePause triggered');
		if (wrapperRef.current) {

			const elements = Array.from(
				wrapperRef.current.querySelectorAll(
					'.videopack-video-title, .videopack-meta-wrapper, .videopack-video-title-block, .videopack-video-title-wrapper'
				)
			);
			const parent = wrapperRef.current.parentElement?.closest(
				'.videopack-wrapper'
			);
			if (parent) {
				Array.from(
					parent.querySelectorAll(
						'.videopack-video-title, .videopack-meta-wrapper, .videopack-video-title-block, .videopack-video-title-wrapper'
					)
				).forEach((el) => {
					if (!elements.includes(el)) {
						elements.push(el);
					}
				});
			}

			elements.forEach((el) =>
				el.classList.add('videopack-video-title-visible')
			);
		}
	}, []);

	const handleEnded = useCallback(() => {
		handlePause();
	}, [handlePause]);

	const onReadyRef = useRef(onReady);
	useEffect(() => {
		onReadyRef.current = onReady;
	}, [onReady]);

	useEffect(() => {
		if (typeof window !== 'undefined' && blockAttributes.id) {
			window.videopack = window.videopack || {};
			window.videopack.player_data = window.videopack.player_data || {};
			window.videopack.player_data[
				`videopack_player_${blockAttributes.id}`
			] = {
				source_groups,
			};
		}
	}, [blockAttributes.id, source_groups]);

	const handleVideoPlayerReady = useCallback(
		(player) => {
			player.on('loadedmetadata', () => {
				if (onReadyRef.current) {
					if (final_embed_method === 'Video.js') {
						onReadyRef.current(player.el().firstChild);
					} else {
						onReadyRef.current(player);
					}
				}
				if (actualAutoplay) {
					handlePlay();
				}
			});
		},
		[final_embed_method, actualAutoplay, handlePlay]
	);

	const handleMejsReady = useCallback((player) => {
		if (onReadyRef.current) {
			onReadyRef.current(player);
		}
	}, []);

	const renderReady =
		src || (finalizedSources && finalizedSources.length > 0);

	if (!renderReady) {
		return null; // Or a loading spinner
	}

	return (
		<div
			className={wrapperClasses}
			ref={wrapperRef}
			style={playerStyles}
			id={instanceId}
		>
			<div
				className={`videopack-player ${
					final_embed_method === 'Video.js' ? final_skin || '' : ''
				} ${!loopDuotoneId && resolvedDuotoneClass ? resolvedDuotoneClass : ''}`}
				style={{ ...innerPlayerStyles, position: 'relative' }}
				data-id={blockAttributes.id}
			>
				{/* Overlays and interactive elements move outside player div for better layout control */}
				{(() => {
					const PlayerComponent =
						players[final_embed_method] || players.None;

					if (final_embed_method === 'Video.js') {
						return (
							<PlayerComponent
								key={`videojs-${src}-${resetKey}-${uniqueKey}-${
									blockAttributes.restartCount || 0
								}`}
								options={videoJsOptions}
								skin={final_skin}
								onPlay={handlePlay}
								onPause={handlePause}
								onEnded={handleEnded}
								onReady={handleVideoPlayerReady}
								onMetadataLoaded={onMetadataLoaded}
							/>
						);
					}

					if (final_embed_method === 'WordPress Default') {
						return (
							<PlayerComponent
								key={`wpvideo-${src}-${resetKey}-${uniqueKey}-${
									blockAttributes.restartCount || 0
								}`}
								options={genericPlayerOptions}
								controls={controls}
								actualAutoplay={actualAutoplay}
								onReady={handleMejsReady}
								onPlay={handlePlay}
								onPause={handlePause}
								onEnded={handleEnded}
								playback_rate={playback_rate}
								aspectRatio={aspectRatio}
								onMetadataLoaded={onMetadataLoaded}
								source_groups={source_groups}
							/>
						);
					}

					return (
						<PlayerComponent
							key={`${final_embed_method}-${src}-${resetKey}-${uniqueKey}-${
								blockAttributes.restartCount || 0
							}`}
							options={videoJsOptions || genericPlayerOptions}
							{...(PlayerComponent === GenericPlayer
								? genericPlayerOptions
								: {})}
							skin={final_skin}
							onPlay={handlePlay}
							onPause={handlePause}
							onEnded={handleEnded}
							onReady={handleVideoPlayerReady}
							onMetadataLoaded={onMetadataLoaded}
							source_groups={source_groups}
						/>
					);
				})()}
				{Array.isArray(final_duotone) &&
					resolvedDuotoneClass &&
					!loopDuotoneId && (
						<>
							<CustomDuotoneFilter
								colors={final_duotone}
								id={resolvedDuotoneClass}
							/>
							<style>
								{`
								.${resolvedDuotoneClass} .vjs-poster:not(.vjs-poster .vjs-poster),
								.${resolvedDuotoneClass} .mejs-poster:not(.mejs-poster .mejs-poster),
								#${instanceId} .vjs-poster:not(.vjs-poster .vjs-poster),
								#${instanceId} .mejs-poster:not(.mejs-poster .mejs-poster) {
									filter: url(#${resolvedDuotoneClass}) !important;
								}
								#${instanceId} {
									filter: none !important;
								}
							`}
							</style>
						</>
					)}
				{children}
			</div>
		</div>
	);
};

export default VideoPlayer;
