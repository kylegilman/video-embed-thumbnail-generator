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
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { applyFilters } from '@wordpress/hooks';
import { getEffectiveValue } from '../../utils/context';
import GenericPlayer from './GenericPlayer.js';
import VideoJS from './VideoJs.js';
import WpMejsPlayer from './WpMejsPlayer.js';

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
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Object}   props.context       Inherited block context.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {boolean}  props.isSelected    Whether the block is selected.
 * @param {boolean}  props.hideStaticOverlays Whether to hide site-wide static overlays (watermark, title).
 * @param {Function} props.onReady       Callback fired when the player engine is ready.
 * @param {Object}   props.children      Child components (InnerBlocks).
 * @return {Element|null} The rendered component.
 */
const VideoPlayer = ({
	attributes,
	context = {},
	setAttributes = noop,
	onReady = noop,
	isSelected = false,
	hideStaticOverlays = false,
	children,
}) => {
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
		const { src } = attributes || {};
		if (src !== detectedDimensions.src) {
			setDetectedDimensions({
				width: null,
				height: null,
				src,
			});
		}
	}, [attributes, detectedDimensions.src]);

	// Handle external restart requests
	useEffect(() => {
		if (attributes?.restartCount > 0) {
			resetPlayer();
		}
	}, [attributes?.restartCount, resetPlayer]);

	const onMetadataLoaded = useCallback(
		(dimensions) => {
			if (
				dimensions.width === detectedDimensions.width &&
				dimensions.height === detectedDimensions.height &&
				attributes.src === detectedDimensions.src
			) {
				return;
			}
			setDetectedDimensions({
				...dimensions,
				src: attributes.src,
			});
		},
		[detectedDimensions, attributes.src, setDetectedDimensions]
	);

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
	} = decodedAttributes;

	const source_groups = useMemo(() => {
		// If we have valid groups, use them (handle empty array vs object)
		if (incomingSourceGroups && !Array.isArray(incomingSourceGroups) && Object.keys(incomingSourceGroups).length > 0) {
			return incomingSourceGroups;
		}

		// Fallback: Group flat sources by codec
		if (incomingSources.length > 0) {
			const groups = {};
			incomingSources.forEach((s) => {
				const codec = s.codec || 'h264';
				if (!groups[codec]) {
					groups[codec] = { sources: [], label: codec.toUpperCase() };
				}
				groups[codec].sources.push(s);
			});
			return groups;
		}

		return {};
	}, [incomingSourceGroups, incomingSources]);


	const raw_embed_method = getEffectiveValue('embed_method', attributes, context);
	const embed_method = raw_embed_method || videopack_config?.embed_method || 'Video.js';
	const skin = getEffectiveValue('skin', attributes, context);
	const play_button_color = getEffectiveValue('play_button_color', attributes, context);
	const play_button_secondary_color = getEffectiveValue('play_button_secondary_color', attributes, context);
	const control_bar_bg_color = getEffectiveValue('control_bar_bg_color', attributes, context);
	const control_bar_color = getEffectiveValue('control_bar_color', attributes, context);
	const title_color = getEffectiveValue('title_color', attributes, context);
	const title_background_color = getEffectiveValue('title_background_color', attributes, context);

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
				Number(decodedAttributes.height) >
					Number(decodedAttributes.width) ||
				[90, 270].includes(Number(decodedAttributes.rotate));
		}

		return vertical;
	}, [
		detectedDimensions.width,
		detectedDimensions.height,
		decodedAttributes.width,
		decodedAttributes.height,
		decodedAttributes.rotate,
	]);

	const isFixedAspect = useMemo(() => {
		const verticalFixed =
			decodedAttributes.fixed_aspect === 'vertical' && isVertical;
		const alwaysFixed = decodedAttributes.fixed_aspect === 'always';

		return (
			(alwaysFixed || verticalFixed) &&
			(decodedAttributes.fullwidth !== true || verticalFixed)
		);
	}, [
		decodedAttributes.fixed_aspect,
		decodedAttributes.fullwidth,
		isVertical,
	]);

	const aspectRatio = useMemo(() => {
		let ratio;
		if (isFixedAspect) {
			ratio = (default_ratio || '16 / 9').replace(/\s\/\s/g, ':');
		} else if (detectedDimensions.width && detectedDimensions.height) {
			// If we have browser-detected dimensions and they aren't forced to fixed, use them
			ratio = `${detectedDimensions.width}:${detectedDimensions.height}`;
		} else if (decodedAttributes.width && decodedAttributes.height) {
			ratio = `${decodedAttributes.width}:${decodedAttributes.height}`;
		}

		return ratio;
	}, [
		isFixedAspect,
		default_ratio,
		detectedDimensions.width,
		detectedDimensions.height,
		decodedAttributes.width,
		decodedAttributes.height,
	]);

	const playerStyles = useMemo(() => {
		const styles = {};
		const config = window.videopack_config || {};
		const mejsSvgPath = config.mejs_controls_svg || (typeof window !== 'undefined' ? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg` : '');

		if (embed_method === 'WordPress Default' && mejsSvgPath) {
			styles['--videopack-mejs-controls-svg'] = `url("${mejsSvgPath}")`;
		}
		if (play_button_color) {
			styles['--videopack-play-button-color'] = play_button_color;
		}
		if (play_button_secondary_color) {
			styles['--videopack-play-button-secondary-color'] =
				play_button_secondary_color;
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
		play_button_secondary_color,
		control_bar_bg_color,
		control_bar_color,
		title_color,
		title_background_color,
		embed_method,
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
		const classes = ['videopack-video-block-container', 'videopack-wrapper', 'videopack-video-title-visible'];
		if (embed_method === 'Video.js' && skin) {
			classes.push(skin);
		}
		if (isFixedAspect || aspectRatio) {
			classes.push('videopack-has-aspect-ratio');
			if (isFixedAspect) {
				classes.push('videopack-is-fixed-aspect');
			}
		}
		if (play_button_color) {
			classes.push('videopack-has-play-button-color');
		}
		if (play_button_secondary_color) {
			classes.push('videopack-has-play-button-secondary-color');
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
		play_button_secondary_color,
		control_bar_bg_color,
		control_bar_color,
		title_color,
		title_background_color,
		isFixedAspect,
		aspectRatio,
		skin,
		embed_method,
	]);

	const actualAutoplay = useMemo(() => {
		return autoplay;
	}, [autoplay]);

	const videoRef = useRef(null);

	const finalizedSources = useMemo(() => {
		// Priority 1: Sources from groups
		if (Object.keys(source_groups).length > 0) {
			const groupedSources = Object.values(source_groups).flatMap(g => g.sources || []);
			if (groupedSources.length > 0) return groupedSources.filter(s => s && s.src);
		}

		// Priority 2: Flat sources array
		if (incomingSources && incomingSources.length > 0) {
			return incomingSources.filter(s => s && s.src);
		}

		// Priority 3: Primary src attribute
		if (src) {
			return [{ src, type: 'video/mp4' }];
		}

		return [];
	}, [source_groups, incomingSources, src]);

	const uniqueKey = useMemo(() => {
		const sourceStr = (finalizedSources || [])
			.map((s) => (s && typeof s === 'object' ? s.src : String(s || '')))
			.join(',');
		return `${skin}-${actualAutoplay}-${loop}-${muted}-${preload}-${sourceStr}-${Object.keys(source_groups).join(',')}`;
	}, [skin, actualAutoplay, loop, muted, preload, finalizedSources, source_groups]);

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
			finalizedSources,
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
		const hasResolutions = finalizedSources.some((s) => s.resolution || s['data-res']);
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
		finalizedSources,
		source_groups,
		text_tracks,
		aspectRatio,
	]); // eslint-disable-line react-hooks/exhaustive-deps

	const handlePlay = useCallback(() => {
		if (wrapperRef.current) {
			wrapperRef.current.classList.remove(
				'videopack-video-title-visible'
			);
		}
	}, []);

	const handlePause = useCallback(() => {
		if (wrapperRef.current) {
			wrapperRef.current.classList.add('videopack-video-title-visible');
		}
	}, []);

	const onReadyRef = useRef(onReady);
	useEffect(() => {
		onReadyRef.current = onReady;
	}, [onReady]);

	useEffect(() => {
		if (typeof window !== 'undefined' && attributes.id) {
			window.videopack = window.videopack || {};
			window.videopack.player_data = window.videopack.player_data || {};
			window.videopack.player_data[`videopack_player_${attributes.id}`] = {
				source_groups,
			};
		}
	}, [attributes.id, source_groups]);

	const handleVideoPlayerReady = useCallback(
		(player) => {
			player.on('loadedmetadata', () => {
				if (onReadyRef.current) {
					if (embed_method === 'Video.js') {
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
		[embed_method, actualAutoplay, handlePlay]
	);

	const handleMejsReady = useCallback((player) => {
		if (onReadyRef.current) {
			onReadyRef.current(player);
		}
	}, []);

	const renderReady = src || (finalizedSources && finalizedSources.length > 0);

	if (!renderReady) {
		return null; // Or a loading spinner
	}

	return (
		<div className={wrapperClasses} ref={wrapperRef} style={playerStyles}>
			<div
				className={`videopack-player ${
					embed_method === 'Video.js' ? skin || '' : ''
				}`}
				style={{ ...innerPlayerStyles, position: 'relative' }}
				data-id={attributes.id}
			>
				{/* Overlays and interactive elements move outside player div for better layout control */}
				{(() => {
					const PlayerComponent = players[embed_method] || players.None;

					if (embed_method === 'Video.js' && videoJsOptions) {
						return (
							<PlayerComponent
								key={`videojs-${src}-${resetKey}-${uniqueKey}-${
									attributes.restartCount || 0
								}`}
								options={videoJsOptions}
								skin={skin}
								onPlay={handlePlay}
								onPause={handlePause}
								onReady={handleVideoPlayerReady}
								onMetadataLoaded={onMetadataLoaded}
							/>
						);
					}

					if (embed_method === 'WordPress Default') {
						return (
							<PlayerComponent
								key={`wpvideo-${src}-${resetKey}-${uniqueKey}-${
									attributes.restartCount || 0
								}`}
								options={genericPlayerOptions}
								controls={controls}
								actualAutoplay={actualAutoplay}
								onReady={handleMejsReady}
								onPlay={handlePlay}
								playback_rate={playback_rate}
								aspectRatio={aspectRatio}
								onMetadataLoaded={onMetadataLoaded}
								source_groups={source_groups}
							/>
						);
					}

					return (
						<PlayerComponent
							key={`${embed_method}-${src}-${resetKey}-${uniqueKey}-${
								attributes.restartCount || 0
							}`}
							options={
								PlayerComponent === VideoJS ||
								PlayerComponent === WpMejsPlayer
									? videoJsOptions || genericPlayerOptions
									: undefined
							}
							{...(PlayerComponent === GenericPlayer
								? genericPlayerOptions
								: {})}
							skin={skin}
							onPlay={handlePlay}
							onPause={handlePause}
							onReady={handleVideoPlayerReady}
							onMetadataLoaded={onMetadataLoaded}
							source_groups={source_groups}
						/>
					);
				})()}
				{children}
			</div>
		</div>
	);
};

export default VideoPlayer;
