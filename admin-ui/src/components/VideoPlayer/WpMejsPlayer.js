/* global jQuery */
import { useEffect, useRef } from '@wordpress/element';

/**
 * Isolated MediaElement.js Player component.
 * Manually manages the video element to prevent DOM conflicts with React.
 */
/**
 * WpMejsPlayer component.
 *
 * @param {Object}   props                Component props.
 * @param {Object}   props.options        Player options (sources, tracks, poster, etc.).
 * @param {boolean}  props.controls       Whether to enable native controls.
 * @param {boolean}  props.actualAutoplay Whether to autoplay the video.
 * @param {Function} props.onReady        Callback fired when MEJS is ready.
 * @param {Function} props.onPlay         Callback fired on play event.
 * @param {boolean}  props.playback_rate  Whether to enable playback rate controls.
 * @return {Element} The rendered component.
 */
const WpMejsPlayer = (props) => {
	const { options, controls, actualAutoplay, aspectRatio, source_groups } =
		props;

	const playerRef = useRef(null);
	const containerRef = useRef(null);
	const propsRef = useRef(props);
	const reportedSrcRef = useRef(null);
	const uniqueKey = JSON.stringify({
		src: options.src,
		poster: options.poster,
		sources: options.sources,
		tracks: options.tracks,
		controls,
		actualAutoplay,
		source_groups,
		option_source_groups: options.source_groups,
	});

	useEffect(() => {
		let isMounted = true;
		let timeoutId = null;

		const cleanupPlayer = () => {
			if (playerRef.current) {
				try {
					if (typeof playerRef.current.remove === 'function') {
						// Neuter sizing methods before removal to prevent async crashes
						// during the destruction process (mediaelement-and-player.js:4416).
						if (
							typeof playerRef.current.setPlayerSize ===
							'function'
						) {
							playerRef.current.setPlayerSize = () => {};
						}
						if (
							typeof playerRef.current.setControlsSize ===
							'function'
						) {
							playerRef.current.setControlsSize = () => {};
						}
						playerRef.current.remove();
					}
				} catch {
					// Ignore
				}
				playerRef.current = null;
			}
		};

		// Use a delay to handle Strict Mode and iframe context migration.
		// The 100ms timeout defers to a later tick, allowing DOM shuffling to settle.
		timeoutId = setTimeout(() => {
			const container = containerRef.current;
			if (
				!isMounted ||
				!container ||
				!container.ownerDocument.body.contains(container)
			) {
				return;
			}

			// Clean up any stale DOM.
			container.innerHTML = '';

			const {
				options: curOptions,
				controls: curControls,
				actualAutoplay: curAutoplay,
				onReady: curOnReady,
				onPlay: curOnPlay,
				onPause: curOnPause,
				onEnded: curOnEnded,
				playback_rate: curPlaybackRate,
			} = propsRef.current;

			if (
				!curOptions ||
				!curOptions.sources ||
				curOptions.sources.length === 0
			) {
				return;
			}

			try {
				const videoElement =
					container.ownerDocument.createElement('video');
				videoElement.className = 'wp-video-shortcode videopack-video';
				videoElement.setAttribute('playsinline', '');
				videoElement.setAttribute('width', '100%');
				videoElement.setAttribute('height', '100%');

				if (curOptions.poster) {
					videoElement.setAttribute('poster', curOptions.poster);
				}
				if (curOptions.loop) {
					videoElement.setAttribute('loop', 'true');
				}
				if (curOptions.preload) {
					videoElement.setAttribute('preload', curOptions.preload);
				}

				const shouldBeMuted =
					!!curOptions.muted || !!curOptions.actualAutoplay;
				if (shouldBeMuted) {
					videoElement.setAttribute('muted', 'muted');
					videoElement.muted = true;
				}

				curOptions.sources.forEach((s) => {
					const source =
						container.ownerDocument.createElement('source');
					source.src = s.src;
					source.type = s.type;
					if (s.resolution) {
						source.setAttribute('data-res', s.resolution);
					}
					if (s.default_res) {
						source.setAttribute('data-default_res', s.default_res);
					}
					videoElement.appendChild(source);
				});

				if (curOptions.tracks) {
					curOptions.tracks.forEach((t) => {
						const track =
							container.ownerDocument.createElement('track');
						track.src = t.src;
						track.kind = t.kind;
						track.srclang = t.srclang;
						track.label = t.label;
						if (t.default) {
							track.setAttribute('default', 'true');
						}
						videoElement.appendChild(track);
					});
				}

				container.appendChild(videoElement);

				const mejsOptions = {
					pluginPath: '/wp-includes/js/mediaelement/',
					source_groups: source_groups || options.source_groups,
					// Matches Player_WordPress_Default::filter_video_vars()'s
					// base feature list (no 'current'/'duration' -- the real
					// frontend never builds a time-elapsed/remaining display),
					// only including 'sourcechooser' when there's more than
					// one source to choose between (same $total_sources > 1
					// gate that method uses). Always built fresh here --
					// unlike the real frontend, this preview has no
					// per-video PHP-rendered settings to start from, only
					// its own live props.
					features: [
						'playpause',
						'progress',
						'tracks',
						...(curOptions.sources.length > 1
							? ['sourcechooser']
							: []),
						'volume',
						'fullscreen',
					],
				};

				if (!mejsOptions.stretching) {
					mejsOptions.stretching = 'responsive';
				}
				mejsOptions.videoWidth = '100%';
				mejsOptions.videoHeight = '100%';

				mejsOptions.startVolume =
					curOptions.volume !== undefined &&
					curOptions.volume !== null
						? curOptions.volume
						: 0.8;
				mejsOptions.startMuted = shouldBeMuted;

				if (!curControls) {
					mejsOptions.features = [];
					mejsOptions.controls = false;
				}

				if (curPlaybackRate) {
					// Insert right after 'volume' (matching the real
					// frontend's feature order in
					// Player_WordPress_Default.php) rather than pushing to
					// the end, which would place it after fullscreen
					// instead.
					const volumeIndex = mejsOptions.features.indexOf('volume');
					if (volumeIndex === -1) {
						mejsOptions.features.push('speed');
					} else {
						mejsOptions.features.splice(
							volumeIndex + 1,
							0,
							'speed'
						);
					}
				}

				const onPlayHandler = (e) => {
					if (typeof curOnPlay === 'function') {
						curOnPlay(e);
					}
				};
				const onPauseHandler = (e) => {
					if (typeof curOnPause === 'function') {
						curOnPause(e);
					}
				};
				const onEndedHandler = (e) => {
					if (typeof curOnEnded === 'function') {
						curOnEnded(e);
					}
				};

				const autoPlayHandler = () => {
					if (curAutoplay && playerRef.current) {
						try {
							playerRef.current.play();
						} catch {
							// Browser blocked autoplay
						}
					}
				};

				mejsOptions.success = (media, domNode, player) => {
					if (!isMounted) {
						return;
					}
					playerRef.current = player;
					media.addEventListener('play', onPlayHandler);
					media.addEventListener('pause', onPauseHandler);
					media.addEventListener('ended', onEndedHandler);

					if (curOnReady) {
						if (typeof curOnReady === 'function') {
							curOnReady(player);
						} else if (curOnReady.current) {
							curOnReady.current(player);
						}
					}

					// Small delay to allow DOM normalization before sizing.
					setTimeout(() => {
						const targetPlayer = playerRef.current;

						if (
							!targetPlayer ||
							!targetPlayer.media ||
							!isMounted
						) {
							return;
						}

						// MEJS player instance container can be a jQuery object or a DOM node.
						// We must ensure it's a raw Node before calling .contains()
						let containerElement =
							targetPlayer.container ||
							targetPlayer.media?.container;

						if (containerElement && containerElement.get) {
							containerElement = containerElement.get(0);
						} else if (
							containerElement &&
							containerElement.jquery &&
							containerElement[0]
						) {
							containerElement = containerElement[0];
						}

						const isAttached =
							containerElement &&
							container.ownerDocument.body.contains(
								containerElement
							);

						if (
							targetPlayer &&
							targetPlayer.media && // Stricter guard: instance must have media
							containerElement &&
							isAttached &&
							typeof targetPlayer.setPlayerSize === 'function'
						) {
							// Guard against MEJS internal crash if videoWidth/Height are not yet loaded.
							// mediaelement-and-player.js:4416 accesses videoWidth of undefined in setResponsiveMode.
							// Note: readyState >= 1 does NOT guarantee videoWidth is populated on the MEJS wrapper.
							// We check both the renderer wrapper (media) and the native node (domNode).
							try {
								const mediaWidth =
									(media && media.videoWidth) ||
									(domNode && domNode.videoWidth) ||
									(media && media.width) ||
									(domNode && domNode.width) ||
									0;

								const mediaHeight =
									(media && media.videoHeight) ||
									(domNode && domNode.videoHeight) ||
									(media && media.height) ||
									(domNode && domNode.height) ||
									0;

								const isRealSizing =
									mediaWidth > 0 &&
									(mediaWidth !== 100 ||
										mediaHeight !== 100 ||
										media?.readyState >= 1);

								if (isRealSizing) {
									try {
										targetPlayer.setPlayerSize();
										targetPlayer.setControlsSize();

										const {
											onMetadataLoaded:
												curOnMetadataLoaded,
										} = propsRef.current;

										if (
											typeof curOnMetadataLoaded ===
												'function' &&
											reportedSrcRef.current !==
												options.src
										) {
											reportedSrcRef.current =
												options.src;
											curOnMetadataLoaded({
												width: mediaWidth,
												height: mediaHeight,
											});
										}
									} catch {
										targetPlayer.setPlayerSize();
									}
								} else {
									const sizeOnMetadata = () => {
										try {
											if (
												isMounted &&
												targetPlayer &&
												targetPlayer.media &&
												typeof targetPlayer.setPlayerSize ===
													'function'
											) {
												const currentWidth =
													targetPlayer.media
														.videoWidth ||
													(domNode &&
														domNode.videoWidth) ||
													targetPlayer.media.width ||
													(domNode && domNode.width);

												const currentHeight =
													targetPlayer.media
														.videoHeight ||
													(domNode &&
														domNode.videoHeight) ||
													targetPlayer.media.height ||
													(domNode && domNode.height);

												const isRealMetadataSizing =
													currentWidth > 0 &&
													(currentWidth !== 100 ||
														currentHeight !== 100 ||
														targetPlayer.media
															?.readyState >= 1);

												if (isRealMetadataSizing) {
													targetPlayer.setPlayerSize();
													targetPlayer.setControlsSize();

													const {
														onMetadataLoaded:
															curOnMetadataLoaded,
													} = propsRef.current;

													if (
														typeof curOnMetadataLoaded ===
															'function' &&
														reportedSrcRef.current !==
															options.src
													) {
														reportedSrcRef.current =
															options.src;
														curOnMetadataLoaded({
															width: currentWidth,
															height: currentHeight,
														});
													}
												}
											}
										} catch {
											// Silence metadata errors
										}

										if (media) {
											media.removeEventListener(
												'loadedmetadata',
												sizeOnMetadata
											);
										}
									};
									media.addEventListener(
										'loadedmetadata',
										sizeOnMetadata
									);
								}
							} catch {
								// Silence dimension detection errors
							}
						}
					}, 150);

					media.addEventListener('canplay', autoPlayHandler);
				};

				const $videoElement = jQuery(videoElement);
				// Stricter check before init
				if (
					isMounted &&
					container.ownerDocument.body.contains(container)
				) {
					$videoElement.mediaelementplayer(mejsOptions);
				}
			} catch {
				// Silence init errors
			}
		}, 100);

		return () => {
			isMounted = false;
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			cleanupPlayer();
		};
	}, [uniqueKey, options.src, options.source_groups, source_groups]);

	// Reactive updates for volume and muted without recreating the player.
	useEffect(() => {
		const media = playerRef.current;
		const shouldBeMuted = !!options.muted || !!actualAutoplay;
		if (media && typeof media.setMuted === 'function') {
			media.setMuted(shouldBeMuted);
		}
	}, [options.muted, actualAutoplay]);

	useEffect(() => {
		const media = playerRef.current;
		if (
			media &&
			typeof media.setVolume === 'function' &&
			options.volume !== undefined &&
			options.volume !== null
		) {
			media.setVolume(options.volume);
		}
	}, [options.volume]);

	// Unlike muted/volume, MEJS's player class doesn't delegate a "loop"
	// property/method of its own -- confirmed against the vendored library
	// (wp-includes/js/mediaelement/mediaelement.js): 'loop' is one of the
	// generic html5media properties MEJS auto-generates a getter/setter for
	// on player.media specifically (assignGettersSetters), not on the player
	// object itself. So this has to go through player.media.loop, not
	// player.loop directly -- unlike preload/playback_rate (handled via a
	// forced remount in VideoPlayer.js instead), it needs no full rebuild.
	useEffect(() => {
		const media = playerRef.current?.media;
		if (media) {
			media.loop = !!options.loop;
		}
	}, [options.loop]);

	return (
		<div
			className={`wp-video-container${
				!controls ? ' videopack-no-controls' : ''
			}`}
			ref={containerRef}
			style={{
				width: '100%',
				aspectRatio: aspectRatio
					? aspectRatio.replace(':', ' / ')
					: undefined,
			}}
		/>
	);
};

export default WpMejsPlayer;
