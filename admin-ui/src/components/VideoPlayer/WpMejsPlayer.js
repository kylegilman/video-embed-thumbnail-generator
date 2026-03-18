/* global MediaElementPlayer */
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
	const {
		options,
		controls,
		actualAutoplay,
		onReady,
		onPlay,
		playback_rate,
	} = props;

	const containerRef = useRef(null);
	const playerRef = useRef(null);
	const propsRef = useRef(props);

	// Keep propsRef current so the effect always reads the latest callbacks.
	useEffect(() => {
		propsRef.current = props;
	});

	useEffect(() => {
		let isMounted = true;
		let timeoutId = null;

		const cleanupPlayer = () => {
			if (playerRef.current) {

				try {
					if (typeof playerRef.current.remove === 'function') {
						playerRef.current.remove();
					}
				} catch (e) {
					// Ignore
				}
				playerRef.current = null;
			}
		};

		// Use a delay to handle Strict Mode and iframe context migration.
		// The 0ms timeout defers to the next tick, allowing DOM shuffling to settle.
		timeoutId = setTimeout(() => {
			const container = containerRef.current;
			if (!container || !isMounted) {

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
				playback_rate: curPlaybackRate,
			} = propsRef.current;

			if (!curOptions || !curOptions.sources || curOptions.sources.length === 0) {

				return;
			}



			try {
				const videoElement = container.ownerDocument.createElement('video');
				videoElement.className = 'wp-video-shortcode videopack-video';
				videoElement.setAttribute('playsinline', '');

				if (curOptions.poster) {
					videoElement.setAttribute('poster', curOptions.poster);
				}
				if (curOptions.loop) {
					videoElement.setAttribute('loop', 'true');
				}
				if (curOptions.preload) {
					videoElement.setAttribute('preload', curOptions.preload);
				}
				if (curOptions.muted) {
					videoElement.setAttribute('muted', 'true');
				}

				curOptions.sources.forEach((s) => {
					const source = container.ownerDocument.createElement('source');
					source.src = s.src;
					source.type = s.type;
					videoElement.appendChild(source);
				});

				if (curOptions.tracks) {
					curOptions.tracks.forEach((t) => {
						const track = container.ownerDocument.createElement('track');
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

				const mejsSettings = window._wpmejsSettings || {};
				const mejsOptions = {
					...mejsSettings,
					pluginPath: '/wp-includes/js/mediaelement/',
				};
				delete mejsOptions.stretching;

				mejsOptions.success = (media) => {
					if (!isMounted) {
						return;
					}

					playerRef.current = media;

					// Fix onReady check (it's often a function, not a ref)
					if (curOnReady) {
						if (typeof curOnReady === 'function') {
							curOnReady(media);
						} else if (curOnReady.current) {
							curOnReady.current(media);
						}
					}

					setTimeout(() => {
						if (isMounted && typeof media.setPlayerSize === 'function') {
							media.setPlayerSize();
							media.setControlsSize();
						}
					}, 100);

					if (curAutoplay) {
						const autoPlayHandler = () => {
							const playPromise = media.play();
							if (playPromise && typeof playPromise.catch === 'function') {
								playPromise.catch((e) => {
									if (e.name !== 'AbortError') {
										console.warn('Autoplay prevented:', e);
									}
								});
							}
							media.removeEventListener('canplay', autoPlayHandler);
						};

						if (media.readyState >= 3) {
							autoPlayHandler();
						} else {
							media.addEventListener('canplay', autoPlayHandler);
						}
					}

					if (curOnPlay) {
						media.addEventListener('play', curOnPlay);
					}
				};

				mejsOptions.videoWidth = '100%';
				mejsOptions.videoHeight = '100%';

				if (!curControls) {
					mejsOptions.features = [];
					mejsOptions.controls = false;
				}

				if (curPlaybackRate) {
					if (!mejsOptions.features) {
						mejsOptions.features = ['playpause', 'progress', 'volume', 'tracks', 'sourcechooser'];
					}
					if (!mejsOptions.features.includes('speed')) {
						mejsOptions.features.push('speed');
					}
					mejsOptions.speeds = ['0.5', '1', '1.25', '1.5', '2'];
				}

				new MediaElementPlayer(videoElement, mejsOptions);
			} catch (e) {
				console.error('MEJS INIT ERROR:', e);
			}
		}, 0);

		return () => {

			isMounted = false;
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			cleanupPlayer();
		};
	}, [options, controls, actualAutoplay, onReady, onPlay, playback_rate]);

	return (
		<div
			className={`wp-video-container${!controls ? ' videopack-no-controls' : ''}`}
			ref={containerRef}
		/>
	);
};

export default WpMejsPlayer;
