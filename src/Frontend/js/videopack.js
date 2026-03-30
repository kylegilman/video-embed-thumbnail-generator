/**
 * Videopack Frontend JS.
 *
 * @package Video-Embed-Thumbnail-Generator
 */

/* global videojs, mejs, videopack_l10n, gtag, ga, __gaTracker, _gaq */

(function () {
	'use strict';

	/**
	 * Main Videopack object.
	 *
	 * @since 5.0.0
	 */
	const videopack_obj = {

		/**
		 * Initialize video players.
		 *
		 * @since 5.0.0
		 */
		init: function () {
			this.initPlayers();

			// Initialize collections (Gallery, Grid, List) with pagination
			document.querySelectorAll('.videopack-collection-wrapper').forEach((element) => {
				this.initCollection(element);
			});


			// Fallback for MediaElement.js players initialized by other plugins/themes.
			if (typeof window.mejs !== 'undefined') {
				// This is a bit of a hack to catch MEJS players initialized after our script runs.
				const originalSuccess = window.mejs.MepDefaults.success;
				window.mejs.MepDefaults.success = (mediaElement, domObject, player) => {
					if (typeof originalSuccess === 'function') {
						originalSuccess(mediaElement, domObject, player);
					}
					this.onMejsSuccess(mediaElement, domObject, player);
				};

				// WordPress specific settings hook
				window._wpmejsSettings = window._wpmejsSettings || {};
				const originalWpSuccess = window._wpmejsSettings.success;
				window._wpmejsSettings.success = (mediaElement, domObject, player) => {
					if (typeof originalWpSuccess === 'function') {
						originalWpSuccess(mediaElement, domObject, player);
					}
					this.onMejsSuccess(mediaElement, domObject, player);
				};
			}
		},

		/**
		 * Initialize players within a container.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement|Document} container The container to search for players.
		 */
		initPlayers: function (container = document) {
			container.querySelectorAll('.videopack-player').forEach((element) => {
				this.initPlayer(element);
			});
		},

		/**
		 * Initialize a single player.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 */
		initPlayer: function (playerWrapper) {
			let playerId = playerWrapper.dataset.id;

			// Handle gallery player IDs which have a prefix.
			if (String(playerId).startsWith('gallery_')) {
				playerId = `gallery_${playerId.split('_')[1]}`;
			}
			const videoVars = window.videopack.player_data && window.videopack.player_data[`videopack_player_${playerId}`];

			if (!videoVars) {
				return;
			}

			if (videoVars.embed_method === 'Video.js') {
				this.loadVideoJS(playerWrapper, videoVars);
			} else if (videoVars.embed_method === 'WordPress Default') {
				const checkMejs = () => {
					const container = playerWrapper.querySelector('.mejs-container');

					if (container) {
						this.setupVideo(playerWrapper, videoVars);
					} else {
						// If still no container, MEJS hasn't initialized yet.
						// We rely on onMejsSuccess, but as a last resort, check again in 1s.
						setTimeout(() => {
							if (!playerWrapper.dataset.videopackInitialized) {
								const secondCheck = playerWrapper.querySelector('.mejs-container');
								if (secondCheck) {

									this.setupVideo(playerWrapper, videoVars);
								}
							}
						}, 1000);
					}
				};
				checkMejs();
			}
		},

		/**
		 * Success callback for MediaElement.js initialization.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} mediaElement The media element.
		 * @param {HTMLElement} domObject    The original DOM object.
		 * @param {object}      player       The MediaElementPlayer instance.
		 */
		onMejsSuccess: function (mediaElement, domObject, player) {
			// domObject is optional in some contexts, fallback to mediaElement
			const target = domObject || mediaElement;
			const playerWrapper = target.closest('.videopack-player');
			if (playerWrapper && !playerWrapper.dataset.videopackInitialized && window.videopack.player_data) {
				this.setupVideo(playerWrapper, window.videopack.player_data[`videopack_player_${playerWrapper.dataset.id}`]);
			}
		},

		/**
		 * Load and initialize a Video.js player.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 * @param {object} videoVars      The video variables.
		 */
		loadVideoJS: function (playerWrapper, videoVars) {
			const playerId = playerWrapper.dataset.id;
			const videoElement = playerWrapper.querySelector('video');

			if (!videoElement) {
				return;
			}
			const videoElementId = videoElement.id;

			const videojsOptions = {
				language: videoVars.locale,
				responsive: true,
				userActions: { hotkeys: true },
			};

			if (true === videoVars.autoplay) {
				videojsOptions.autoplay = 'any';
			}

			if (videoVars.legacy_dimensions) {
				videojsOptions.fluid = (true === videoVars.resize || true === videoVars.fullwidth);
			} else {
				videojsOptions.fluid = true;
			}

			if (videojsOptions.fluid && videoVars.legacy_dimensions && videoVars.width && (typeof videoVars.width !== 'string' || -1 === videoVars.width.indexOf('%')) && videoVars.height && videoVars.fixed_aspect) {
				videojsOptions.aspectRatio = `${videoVars.width}:${videoVars.height}`;
			}

			if (true === videoVars.nativecontrolsfortouch) {
				videojsOptions.nativeControlsForTouch = true;
			}

			if (true === videoVars.playback_rate) {
				videojsOptions.playbackRates = [0.5, 1, 1.25, 1.5, 2];
			}

			if (videoVars.skip_buttons && videoVars.skip_buttons.forward && videoVars.skip_buttons.backward) {
				videojsOptions.controlBar = {
					skipButtons: {
						forward: Number(videoVars.skip_buttons.forward),
						backward: Number(videoVars.skip_buttons.backward),
					},
				};
			}

			const sources = Array.from(videoElement.querySelectorAll('source'));
			const hasResolutions = sources.some((s) => s.dataset.res);
			const source_groups = videoVars.source_groups || {};

			if (hasResolutions || (source_groups && Object.keys(source_groups).length > 1)) {
				if (videojs.VERSION.split('.')[0] >= 5) {
					videojsOptions.plugins = videojsOptions.plugins || {};
					videojsOptions.plugins.resolutionSelector = {
						force_types: ['video/mp4'],
						source_groups: source_groups,
					};
					const defaultResSource = sources.find((s) => '1' === s.dataset.default_res);
					if (defaultResSource) {
						videojsOptions.plugins.resolutionSelector.default_res = defaultResSource.dataset.res;
						for (const groupId in source_groups) {
							if (source_groups[groupId].sources.some((s) => s.src === defaultResSource.src)) {
								videojsOptions.plugins.resolutionSelector.default_codec = groupId;
								break;
							}
						}
					}
				} else {
					// eslint-disable-next-line no-console
					console.warn('Videopack: Video.js version ' + videojs.VERSION + ' is loaded by another application. Resolution selection is not compatible with this older version and has been disabled.');
				}
			}

			if (videojs.getPlayer(videoElementId)) {
				videojs.getPlayer(videoElementId).dispose();
			}

			videojs(videoElement, videojsOptions).ready(() => {
				this.setupVideo(playerWrapper, videoVars);
			});
		},

		/**
		 * Common setup for any player type after initialization.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 * @param {object} videoVars The video variables.
		 */
		setupVideo: function (playerWrapper, videoVars) {

			if (playerWrapper.dataset.videopackInitialized) {
				return;
			}

			const playerId = playerWrapper.dataset.id;

			// Move watermark and meta into the player.
			const watermark = document.getElementById(`video_${playerId}_watermark`);
			if (watermark) {
				playerWrapper.prepend(watermark);
				watermark.style.display = 'block';
			}

			const meta = document.getElementById(`video_${playerId}_meta`);
			if (meta) {
				playerWrapper.prepend(meta);
				meta.style.display = 'block';
			}

			// Setup share functionality.
			const shareIcon = playerWrapper.querySelector('.videopack-icons.share');
			if (shareIcon) {
				shareIcon.addEventListener('click', () => this.toggleShare(playerWrapper));
				playerWrapper.querySelector('.videopack-click-trap').addEventListener('click', () => this.toggleShare(playerWrapper));
			}

			if (true !== videoVars.right_click) {
				playerWrapper.addEventListener('contextmenu', (e) => e.preventDefault());
			}

			// Setup "start at" functionality.
			const embedWrapper = playerWrapper.querySelector('.videopack-share-container');
			if (embedWrapper) {
				embedWrapper.querySelector('.videopack-start-at-enable').addEventListener('change', () => this.setStartAt(playerWrapper));
				embedWrapper.querySelector('.videopack-start-at').addEventListener('change', () => this.changeStartAt(playerWrapper));
			}

			const downloadLink = playerWrapper.querySelector('.videopack-download-link');
			if (downloadLink && downloadLink.hasAttribute('download') && downloadLink.dataset.alt_link) {
				downloadLink.addEventListener('click', (e) => {
					e.preventDefault();
					this.checkDownloadLink(downloadLink);
				});
			}

			if ('vertical' === videoVars.fixed_aspect) {
				const videoElement = playerWrapper.querySelector('video');
				if (videoElement) {
					const checkVertical = () => {
						if (videoElement.videoHeight > videoElement.videoWidth) {
							playerWrapper.parentElement.classList.add('videopack-fixed-aspect');
							playerWrapper.parentElement.style.aspectRatio = videoVars.default_ratio;
						}
					};
					if (videoElement.readyState >= 1) {
						checkVertical();
					} else {
						videoElement.addEventListener('loadedmetadata', checkVertical, { once: true });
					}
				}
			}

			if (videoVars.embed_method === 'Video.js') {
				this.setupVideoJSPlayer(playerWrapper, videoVars);
			} else if (videoVars.embed_method === 'WordPress Default') {
				this.setupMEJSPlayer(playerWrapper, videoVars);
			}

			// Resize logic.
			if ((videoVars.legacy_dimensions && true === videoVars.resize) || 'automatic' === videoVars.auto_res || window.location.search.includes('videopack[enable]=true')) {
				this.resizeVideo(playerId);

				const target = playerWrapper.parentElement;

				if (!target) {
					return;
				}

				let resizeId;
				const debouncedResize = () => {
					clearTimeout(resizeId);
					resizeId = setTimeout(() => this.resizeVideo(playerId), 200);
				};

				const resizeObserver = new ResizeObserver(debouncedResize);
				resizeObserver.observe(target);

				// Cleanup observer on player disposal.
				if (videoVars.embed_method === 'Video.js') {
					const player = videojs.getPlayer('videopack_video_' + playerId);
					if (player) {
						player.on('dispose', () => {
							resizeObserver.disconnect();
						});
					}
				}
				// Note: MediaElement.js cleanup is not added to avoid complexity without a clear dispose event.
			}

			playerWrapper.dataset.videopackInitialized = true;
		},

		/**
		 * Setup for a Video.js player.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 * @param {object} videoVars The video variables.
		 */
		setupVideoJSPlayer: function (playerWrapper, videoVars) {
			const playerId = playerWrapper.dataset.id;
			const videoElement = playerWrapper.querySelector('video');

			if (!videoElement) {
				return;
			}

			const player = videojs.getPlayer(videoElement.id);

			if (!player) {
				return;
			}

			// Move watermark inside video element for proper positioning.
			const watermark = document.getElementById(`video_${playerId}_watermark`);
			if (watermark) {
				player.el().appendChild(watermark);
			}

			// Touch device checks.
			if (videojs.browser.TOUCH_ENABLED) {
				if (true === videoVars.nativecontrolsfortouch && videojs.browser.IS_ANDROID) {
					player.bigPlayButton.hide();
				}
				if (!player.controls() && !player.muted()) {
					player.controls(true);
				}
			}

			player.on('loadedmetadata', () => {
				const played = playerWrapper.dataset.played || 'not played';

				if ('not played' === played) {
					// Set default captions/subtitles.
					const trackElements = player.options_.tracks;
					if (trackElements) {
						player.textTracks().tracks_.forEach((track, index) => {
							if (trackElements[index] && trackElements[index].default && 'showing' !== track.mode) {
								track.mode = 'showing';
							}
						});
					}

					if (videoVars.start) {
						player.currentTime(this.convertFromTimecode(videoVars.start));
					}
				}

				if (videoVars.set_volume) {
					player.volume(videoVars.set_volume);
				}

				if (true === videoVars.autoplay && player.paused()) {
					const promise = player.play();
					if ('undefined' !== typeof promise) {
						promise.catch(() => {
							// Autoplay was prevented.
						});
					}
				}
			});

			player.on('play', () => {
				player.focus();

				if (videoVars.endofvideooverlay) {
					player.posterImage.el().style.display = 'none';
				}

				if (true === videoVars.pauseothervideos) {
					const players = videojs.getPlayers();
					for (const otherPlayerId in players) {
						if (players.hasOwnProperty(otherPlayerId)) {
							const otherPlayer = players[otherPlayerId];
							if (otherPlayer && player.id() !== otherPlayer.id() && !otherPlayer.paused() && !otherPlayer.autoplay()) {
								otherPlayer.pause();
							}
						}
					}
				}

				this.videoCounter(playerId, 'play');

				player.on('timeupdate', () => {
					const percent = Math.round((player.currentTime() / player.duration()) * 100);
					if (!playerWrapper.dataset['25'] && percent >= 25 && percent < 50) {
						playerWrapper.dataset['25'] = true;
						this.videoCounter(playerId, '25');
					} else if (!playerWrapper.dataset['50'] && percent >= 50 && percent < 75) {
						playerWrapper.dataset['50'] = true;
						this.videoCounter(playerId, '50');
					} else if (!playerWrapper.dataset['75'] && percent >= 75 && percent < 100) {
						playerWrapper.dataset['75'] = true;
						this.videoCounter(playerId, '75');
					}
					this.setStartAt(playerWrapper);
				});
			});

			player.on('pause', () => {
				this.videoCounter(playerId, 'pause');
			});
			player.on('seeked', () => this.videoCounter(playerId, 'seek'));
			player.on('ended', () => {
				if (!playerWrapper.dataset.end) {
					playerWrapper.dataset.end = true;
					this.videoCounter(playerId, 'end');
				}
				setTimeout(() => {
					if (player.loadingSpinner && player.loadingSpinner.el()) {
						player.loadingSpinner.el().style.display = 'none';
					}
				}, 250);

				if (videoVars.endofvideooverlay) {
					const posterImage = player.posterImage.el();
					if (posterImage) {
						posterImage.style.backgroundImage = `url(${videoVars.endofvideooverlay})`;
						posterImage.style.display = 'block';
					}
				}
			});

			player.on('fullscreenchange', () => {
				this.resizeVideo(playerId);
			});

			this.setupMetaBar(playerWrapper, player, videoVars);
		},

		/**
		 * Setup meta bar visibility and hover behavior.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 * @param {object}      player        The player instance (Video.js or MEJS).
		 * @param {object}      videoVars     The video variables.
		 */
		setupMetaBar: function (playerWrapper, player, videoVars) {
			const playerId = playerWrapper.dataset.id;
			const wrapper = playerWrapper.closest('.videopack-wrapper');



			if (!wrapper) {
				return;
			}

			const isMejs = 'WordPress Default' === videoVars.embed_method;
			const video = isMejs ? player.media : player.el().querySelector('video');



			const showMeta = () => {
				wrapper.classList.add('videopack-meta-bar-visible');
			};
			const hideMeta = () => {
				wrapper.classList.remove('videopack-meta-bar-visible');
			};

			if (isMejs && video) {
				video.addEventListener('play', hideMeta);
				video.addEventListener('pause', showMeta);
				video.addEventListener('ended', showMeta);
			} else if (player && !isMejs) {
				player.on('play', hideMeta);
				player.on('pause', showMeta);
				player.on('ended', showMeta);
			}
		},

		/**
		 * Setup for a MediaElement.js player.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 * @param {object} videoVars The video variables.
		 */
		setupMEJSPlayer: function (playerWrapper, videoVars) {
			const playerId = playerWrapper.dataset.id;
			const video = playerWrapper.querySelector('video');
			const mejsContainer = playerWrapper.querySelector('.mejs-container');
			const mejsId = mejsContainer ? mejsContainer.id : null;



			if (!video || !mejsId || !mejs.players[mejsId]) {
				return;
			}

			const player = mejs.players[mejsId];

			// Move watermark.
			const watermark = document.getElementById(`video_${playerId}_watermark`);
			if (watermark) {
				playerWrapper.querySelector('.mejs-container').append(watermark);
			}

			const played = playerWrapper.dataset.played || 'not played';
			if ('not played' === played) {
				// Default captions.
				if (player.tracks && player.tracks.length > 0) {
					const defaultTrack = document.querySelector(`#${mejsId} track[default]`);
					if (defaultTrack) {
						const defaultLang = defaultTrack.getAttribute('srclang').toLowerCase();
						const trackToSet = player.tracks.find((t) => t.srclang === defaultLang);
						if (trackToSet) {
							player.setTrack(trackToSet.trackId);
						}
					}
				}

				if (videoVars.start) {
					video.setCurrentTime(this.convertFromTimecode(videoVars.start));
				}
			}

			const onLoadedMetadata = () => {
				this.resizeVideo(playerId);
				if (videoVars.set_volume) {
					video.volume = videoVars.set_volume;
				}
				if (true === videoVars.muted) {
					video.setMuted(true);
				}
				if (false === videoVars.pauseothervideos) {
					player.options.pauseOtherPlayers = false;
				}
			};

			video.addEventListener('loadedmetadata', onLoadedMetadata);

			if (video.readyState >= 1) {
				onLoadedMetadata();
			}

			video.addEventListener('play', () => {
				document.getElementById(mejsId).focus();
				this.videoCounter(playerId, 'play');

				video.addEventListener('timeupdate', () => {
					const percent = Math.round((video.currentTime / video.duration) * 100);
					if (!playerWrapper.dataset['25'] && percent >= 25 && percent < 50) {
						playerWrapper.dataset['25'] = true;
						this.videoCounter(playerId, '25');
					} else if (!playerWrapper.dataset['50'] && percent >= 50 && percent < 75) {
						playerWrapper.dataset['50'] = true;
						this.videoCounter(playerId, '50');
					} else if (!playerWrapper.dataset['75'] && percent >= 75 && percent < 100) {
						playerWrapper.dataset['75'] = true;
						this.videoCounter(playerId, '75');
					}
					this.setStartAt(playerWrapper);
				});
			});

			video.addEventListener('pause', () => {
				this.videoCounter(playerId, 'pause');
			});
			video.addEventListener('seeked', () => this.videoCounter(playerId, 'seek'));

			video.addEventListener('ended', () => {
				if (!playerWrapper.dataset.end) {
					playerWrapper.dataset.end = true;
					this.videoCounter(playerId, 'end');
				}
				if (videoVars.endofvideooverlay) {
					const poster = playerWrapper.querySelector('.mejs-poster');
					if (poster) {
						poster.style.backgroundImage = `url(${videoVars.endofvideooverlay})`;
						poster.style.display = 'block';
					}
					video.addEventListener('seeking', () => {
						if (0 !== video.currentTime) {
							if (poster) {
								poster.style.display = 'none';
							}
						}
					}, { once: true });
				}
			});

			this.setupMetaBar(playerWrapper, player, videoVars);
		},

		/**
		 * Resize video player.
		 *
		 * @since 5.0.0
		 * @param {number} playerId The player ID.
		 */
		resizeVideo: function (playerId) {
			const playerWrapper = document.querySelector(`.videopack-player[data-id="${playerId}"]`);
			if (!playerWrapper) {
				return;
			}
			const videoVars = this.player_data[`videopack_player_${playerId}`];
			if (!videoVars) {
				return;
			}

			let setWidth = videoVars.width;
			const setHeight = videoVars.height;
			const aspectRatio = Math.round((setHeight / setWidth) * 1000) / 1000;
			const wrapperParent = playerWrapper.parentElement;

			let parentWidth;
			if (wrapperParent.tagName === 'BODY') { // Embedded video
				parentWidth = window.innerWidth;
				setWidth = window.innerWidth;
			} else {
				parentWidth = wrapperParent.offsetWidth;
				if (true === videoVars.fullwidth) {
					setWidth = parentWidth;
				}
			}

			if (parentWidth < setWidth) {
				setWidth = parentWidth;
			}

			if (setWidth > 0 && setWidth < 30000) {
				// Automatic resolution switching logic
				if ('automatic' === videoVars.auto_res) {
					this.setAutomaticResolution(playerId, setWidth, aspectRatio);
				}
			}
		},

		/**
		 * Set automatic resolution based on player size.
		 *
		 * @since 5.0.0
		 * @param {number} playerId    The player ID.
		 * @param {number} currentWidth The current width of the player.
		 * @param {number} aspectRatio The aspect ratio of the video.
		 */
		setAutomaticResolution: function (playerId, currentWidth, aspectRatio) {
			const videoVars = this.player_data[`videopack_player_${playerId}`];
			if (!videoVars) {
				return;
			}

			let targetWidth = currentWidth;
			if (true === videoVars.pixel_ratio && window.devicePixelRatio) {
				targetWidth *= window.devicePixelRatio;
			}

			// aspectRatio is height / width.
			const targetHeight = targetWidth * aspectRatio;

			let currentCodec = videoVars.auto_codec;

			if (videoVars.source_groups && !videoVars.source_groups[currentCodec]) {
				const groupIds = Object.keys(videoVars.source_groups);
				if (groupIds.length === 1) {
					currentCodec = groupIds[0];
				} else if (videoVars.source_groups['h264']) {
					currentCodec = 'h264';
				} else if (groupIds.length > 0) {
					currentCodec = groupIds[0];
				}
			}

			let player = null;

			// Determine current codec and player instance
			if (videoVars.embed_method === 'Video.js' && typeof videojs !== 'undefined') {
				player = videojs.getPlayer(`videopack_video_${playerId}`);
				if (player && player.getCurrentCodec) {
					const detectedCodec = player.getCurrentCodec();
					if (detectedCodec) {
						currentCodec = detectedCodec;
					}
				}
			} else if (videoVars.embed_method === 'WordPress Default' && typeof window.mejs !== 'undefined') {
				// For MEJS, check the selected radio button in the source chooser
				const playerWrapper = document.querySelector(`.videopack-player[data-id="${playerId}"]`);
				const mejsContainer = playerWrapper ? playerWrapper.querySelector('.mejs-container') : null;
				if (mejsContainer && mejs.players[mejsContainer.id]) {
					player = mejs.players[mejsContainer.id];
					if (player.manualResolutionSelected) {
						return;
					}
					// We can infer codec from the currently selected source if we had a way to map it back,
					// but for now, we rely on auto_codec or the structure of source_groups.
					// If the user manually switched codecs, MEJS doesn't explicitly store "currentCodec".
					// So we check if we stored it, otherwise we try to respect auto_codec if supported,
					// or fallback to the current source's codec.
					if (videoVars.source_groups) {
						if (player.currentCodec) {
							currentCodec = player.currentCodec;
						} else {
							let autoCodecSupported = false;
							if (currentCodec && videoVars.source_groups[currentCodec] && player.media && typeof player.media.canPlayType === 'function') {
								const testSource = videoVars.source_groups[currentCodec].sources[0];
								if (testSource && player.media.canPlayType(testSource.type) !== '') {
									autoCodecSupported = true;
								}
							}

							if (!autoCodecSupported) {
								const currentSrc = player.getSrc();
								for (const groupId in videoVars.source_groups) {
									if (videoVars.source_groups[groupId].sources.some((s) => s.src === currentSrc)) {
										currentCodec = groupId;
										break;
									}
								}
							}
						}
					}
				}
			}

			let availableSources = [];
			if (videoVars.source_groups && videoVars.source_groups[currentCodec]) {
				availableSources = videoVars.source_groups[currentCodec].sources;
			} else if (videoVars.sources) {
				availableSources = videoVars.sources;
			}

			if (!availableSources.length) {
				return;
			}

			// Filter and sort sources by resolution (ascending)
			const resSources = availableSources.filter((s) => s.resolution || s['data-res']);
			resSources.sort((a, b) => parseInt(a.resolution || a['data-res'], 10) - parseInt(b.resolution || b['data-res'], 10));

			if (!resSources.length) {
				return;
			}

			// Find the best fit: the first source with height >= targetHeight
			let bestSource = resSources.find((s) => parseInt(s.resolution || s['data-res'], 10) >= targetHeight);

			// If all are smaller, use the largest available
			if (!bestSource) {
				bestSource = resSources[resSources.length - 1];
			}

			// Switch resolution if needed
			if (videoVars.embed_method === 'Video.js' && player && player.changeRes) {
				const targetRes = bestSource.resolution || bestSource['data-res'];
				if (player.getCurrentRes() !== targetRes) {
					player.changeRes(targetRes, currentCodec);
				}
			} else if (videoVars.embed_method === 'WordPress Default' && player && player.changeRes) {
				player.changeRes(bestSource.src, currentCodec);
			}
		},

		/**
		 * Send event to Google Analytics.
		 *
		 * @since 5.0.0
		 * @param {string} event The event name.
		 * @param {string} label The event label.
		 */
		sendGoogleAnalytics: function (event, label) {
			if ('undefined' !== typeof gtag) {
				gtag('event', event, { event_category: 'Videos', event_label: label });
			} else if ('undefined' !== typeof ga) {
				ga('send', 'event', 'Videos', event, label);
			} else if ('undefined' !== typeof __gaTracker) {
				__gaTracker('send', 'event', 'Videos', event, label);
			} else if ('undefined' !== typeof _gaq) {
				_gaq.push(['_trackEvent', 'Videos', event, label]);
			}
		},

		/**
		 * Count video plays and send data to server.
		 *
		 * @since 5.0.0
		 * @param {number} playerId The player ID.
		 * @param {string} event    The video event (play, pause, etc.).
		 */
		videoCounter: function (playerId, event) {
			const playerWrapper = document.querySelector(`.videopack-player[data-id="${playerId}"]`);
			if (!playerWrapper) {
				return;
			}
			const videoVars = this.player_data[`videopack_player_${playerId}`];

			if (!videoVars) {
				return;
			}

			const viewCountWrapper = playerWrapper.closest('.videopack-wrapper');
			const viewCountElement = viewCountWrapper ? viewCountWrapper.querySelector('.videopack-viewcount') : null;

			let changed = false;
			const played = playerWrapper.dataset.played || 'not played';

			if ('play' === event) {
				if ('not played' === played) { // Play start
					if (videoVars.countable) {
						changed = true;
					}
					playerWrapper.dataset.played = 'played';
					this.sendGoogleAnalytics(videopack_l10n.playstart, videoVars.title);
				} else { // Resume
					this.sendGoogleAnalytics(videopack_l10n.resume, videoVars.title);
				}
			} else if (['seek', 'pause', 'end'].includes(event)) {
				if ('end' === event && videoVars.countable) {
					changed = true;
				}
				this.sendGoogleAnalytics(videopack_l10n[event], videoVars.title);
			} else if (!isNaN(event)) { // Quarter-play
				if (videoVars.countable) {
					changed = true;
				}
				this.sendGoogleAnalytics(`${event}%`, videoVars.title);
			}

			if (changed && false !== videoVars.count_views) {
				const countCondition = videoVars.count_views === 'quarters' ||
					(videoVars.count_views === 'start_complete' && ('play' === event || 'end' === event)) ||
					(videoVars.count_views === 'start' && 'play' === event);

				if (countCondition) {
					fetch(`${videopack_l10n.rest_url}videopack/v1/count-play`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							attachment_id: videoVars.attachment_id,
							video_event: event,
							show_views: !!viewCountElement,
						}),
					})
						.then((response) => {
							if (!response.ok) {
								throw new Error(`HTTP error! status: ${response.status}`);
							}
							return response.json();
						})
						.then((data) => {
							if ('play' === event && data.view_count && viewCountElement) {
								viewCountElement.innerHTML = data.view_count;
							}
						})
						.catch((error) => {
							console.error('Videopack REST API Error:', error);
						});
				}
			}
		},

		/**
		 * Convert time in seconds to timecode string.
		 *
		 * @since 5.0.0
		 * @param {number} time Time in seconds.
		 * @return {string} Formatted timecode.
		 */
		convertToTimecode: function (time) {
			const minutes = Math.floor(time / 60);
			let seconds = Math.round((time - (minutes * 60)) * 100) / 100;
			let timeDisplay = '';

			timeDisplay += minutes < 10 ? `0${minutes}` : minutes;
			timeDisplay += ':';
			timeDisplay += seconds < 10 ? `0${seconds}` : seconds;

			return timeDisplay;
		},

		/**
		 * Convert timecode string to seconds.
		 *
		 * @since 5.0.0
		 * @param {string} timecode Timecode string.
		 * @return {number} Time in seconds.
		 */
		convertFromTimecode: function (timecode) {
			const timecodeArray = timecode.split(':').reverse();
			let totalSeconds = 0;

			if (timecodeArray[0]) {
				totalSeconds += parseFloat(timecodeArray[0]);
			}
			if (timecodeArray[1]) {
				totalSeconds += parseFloat(timecodeArray[1]) * 60;
			}
			if (timecodeArray[2]) {
				totalSeconds += parseFloat(timecodeArray[2]) * 3600;
			}

			return totalSeconds;
		},

		/**
		 * Toggle the share/embed section.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 */
		toggleShare: function (playerWrapper) {
			const videoVars = this.player_data[`videopack_player_${playerWrapper.dataset.id}`];
			const shareIcon = playerWrapper.querySelector('.videopack-icons.share, .videopack-icons.close');
			const embedWrapper = playerWrapper.querySelector('.videopack-share-container');
			const clickTrap = playerWrapper.querySelector('.videopack-click-trap');

			const isShareActive = shareIcon.classList.contains('close');

			if (isShareActive) {
				shareIcon.classList.remove('close');
				shareIcon.classList.add('share');
				embedWrapper.classList.remove('is-visible');
				clickTrap.classList.remove('is-visible');
			} else {
				shareIcon.classList.remove('share');
				shareIcon.classList.add('close');
				embedWrapper.classList.add('is-visible');
				clickTrap.classList.add('is-visible');
				this.setStartAt(playerWrapper);
			}

			if (videoVars.embed_method === 'Video.js') {
				const playerId = playerWrapper.dataset.id;
				const player = videojs.getPlayer(`videopack_video_${playerId}`);
				if (player) {
					player.pause();
					const controls = player.hasStarted() ? player.controlBar.el() : player.bigPlayButton.el();
					if (isShareActive) {
						controls.style.display = '';
					} else {
						controls.style.display = 'none';
					}
				}
			} else if (videoVars.embed_method === 'WordPress Default') {
				const video = playerWrapper.querySelector('video');
				if (video) {
					video.pause();
				}
				const overlayButton = playerWrapper.querySelector('.mejs-overlay-button');
				if (overlayButton) {
					overlayButton.style.display = overlayButton.style.display === 'none' ? '' : 'none';
				}
			}
		},

		/**
		 * Check if a download link is valid, otherwise use the alternative.
		 *
		 * @since 5.0.0
		 * @param {HTMLAnchorElement} downloadLink The download link element.
		 */
		checkDownloadLink: async function (downloadLink) {
			const url = downloadLink.href;
			const altUrl = downloadLink.dataset.alt_link;

			try {
				const response = await fetch(url, { method: 'HEAD' });
				if (!response.ok) {
					throw new Error('Response not OK');
				}
				const link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', '');
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} catch (error) {
				if (altUrl) {
					window.location.href = altUrl;
				} else {
					// Optional: handle case where direct download fails and there's no altUrl
					console.error('Download failed and no alternative link available.');
				}
			}
		},

		/**
		 * Set the "start at" time in the embed code from the current video time.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 */
		setStartAt: function (playerWrapper) {
			const embedWrapper = playerWrapper.querySelector('.videopack-share-container');
			if (!embedWrapper) {
				return;
			}
			const checkbox = embedWrapper.querySelector('.videopack-start-at-enable');
			if (checkbox && checkbox.checked && embedWrapper.classList.contains('is-visible')) {
				const videoVars = this.player_data[`videopack_player_${playerWrapper.dataset.id}`];
				let currentTime = 0;

				if (videoVars.embed_method === 'Video.js') {
					const playerId = playerWrapper.dataset.id;
					const player = videojs.getPlayer(`videopack_video_${playerId}`);
					if (player) {
						currentTime = player.currentTime();
					}
				} else if (videoVars.embed_method === 'WordPress Default') {
					const video = playerWrapper.querySelector('video');
					if (video) {
						currentTime = video.currentTime;
					}
				}

				embedWrapper.querySelector('.videopack-start-at').value = this.convertToTimecode(Math.floor(currentTime));
			}

			if (embedWrapper.classList.contains('is-visible')) {
				this.changeStartAt(playerWrapper);
			}
		},

		/**
		 * Update the embed code with the "start at" time.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 */
		changeStartAt: function (playerWrapper) {
			const embedWrapper = playerWrapper.querySelector('.videopack-share-container');
			const embedCodeTextarea = embedWrapper.querySelector('.videopack-embed-code');
			const embedCode = embedCodeTextarea.value;

			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = embedCode;
			const iframe = tempDiv.querySelector('iframe');
			if (!iframe) {
				return;
			}

			let src = iframe.getAttribute('src');
			if (!src) {
				return;
			}

			src = src.replace(/&?videopack\[start\]=[^&]*/, '');
			src = src.replace(/\?&/, '?').replace(/\?$/, '');

			if (embedWrapper.querySelector('.videopack-start-at-enable').checked) {
				const startTime = embedWrapper.querySelector('.videopack-start-at').value;
				if (startTime) {
					const separator = src.includes('?') ? '&' : '?';
					src += `${separator}videopack[start]=${encodeURIComponent(startTime)}`;
				}
			}

			iframe.setAttribute('src', src);
			embedCodeTextarea.value = iframe.outerHTML;
		},

		/**
		 * ============================================================================
		 * Gallery Functions
		 * ============================================================================
		 */

		/**
		 * Setup scaling for gallery item play buttons.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} container The container to search for gallery items.
		 */
		setupGalleryItemScaling: function (container) {
			if (typeof ResizeObserver === 'undefined') {
				return;
			}

			const ro = new ResizeObserver((entries) => {
				entries.forEach((entry) => {
					const clickableArea = entry.target;
					const button = clickableArea.querySelector('.mejs-overlay-button');
					if (button) {
						const containerWidth = entry.contentRect.width;
						const desiredButtonWidth = containerWidth * 0.25;
						const initialButtonWidth = 80;
						const finalButtonWidth = Math.min(desiredButtonWidth, 90);
						const scale = finalButtonWidth / initialButtonWidth;
						button.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
					}
				});
			});

			container.querySelectorAll('.videopack-gallery-item .gallery-item-clickable-area').forEach((area) => {
				if (area.querySelector('.mejs-overlay-button')) {
					ro.observe(area);
				}
			});
		},

		/**
		 * Initialize a single collection (Gallery, Grid, or List).
		 * @param {HTMLElement} collectionWrapper The collection wrapper element.
		 */
		initCollection: function (collectionWrapper) {
			if (collectionWrapper.dataset.videopackCollectionInitialized) {
				return;
			}

			const settings = JSON.parse(collectionWrapper.dataset.settings || '{}');
			collectionWrapper.dataset.settingsCache = JSON.stringify(settings);

			if (collectionWrapper.classList.contains('videopack-gallery-wrapper')) {
				// Store initial video data order for navigation.
				const initialVideoOrder = [];
				collectionWrapper.querySelectorAll('.videopack-gallery-item').forEach((thumb) => {
					initialVideoOrder.push(String(thumb.dataset.attachmentId));
				});
				collectionWrapper.dataset.currentVideosOrder = JSON.stringify(initialVideoOrder);
				this.setupGalleryItemScaling(collectionWrapper);
			}

			if (collectionWrapper.dataset.videopackInitialized) {
				return;
			}
			collectionWrapper.dataset.videopackInitialized = 'true';

			const pagination = collectionWrapper.querySelector('.videopack-pagination');
			if (pagination && !collectionWrapper.dataset.totalPages) {
				const pageButtons = pagination.querySelectorAll('.videopack-pagination-button:not([aria-label])');
				if (pageButtons.length > 0) {
					collectionWrapper.dataset.totalPages = pageButtons.length;
				}
			}

			// Event Listeners
			collectionWrapper.addEventListener('click', (e) => {
				if (collectionWrapper.classList.contains('videopack-gallery-wrapper')) {
					const clickableArea = e.target.closest('.gallery-item-clickable-area');
					if (clickableArea) {
						this.handleGalleryThumbnailClick(e, collectionWrapper);
					}
				}

				const pageLink = e.target.closest('.videopack-pagination a.page-numbers, .videopack-pagination button');
				if (pageLink && !pageLink.disabled && !pageLink.classList.contains('current') && !pageLink.classList.contains('current-page')) {
					this.handleCollectionPaginationClick(e, collectionWrapper, pageLink);
				}
			});

			const popup = collectionWrapper.querySelector('.videopack-modal-overlay');
			if (popup) {
				popup.addEventListener('click', (e) => {
					if (e.target.closest('.modal-close') || e.target === popup) {
						this.closeGalleryPopup(popup);
					} else if (e.target.closest('.modal-next')) {
						this.navigateGalleryPopup(1, collectionWrapper);
					} else if (e.target.closest('.modal-previous')) {
						this.navigateGalleryPopup(-1, collectionWrapper);
					}
				});
			}

			collectionWrapper.dataset.videopackCollectionInitialized = true;
		},

		initGallery: function (galleryWrapper) {
			this.initCollection(galleryWrapper);
		},

		handleGalleryThumbnailClick: function (e, galleryWrapper) {
			e.preventDefault();
			const galleryItem = e.target.closest('.videopack-gallery-item');
			const attachmentId = galleryItem.dataset.attachmentId;
			const videoOrder = JSON.parse(galleryWrapper.dataset.currentVideosOrder);
			const videoIndex = videoOrder.indexOf(String(attachmentId));

			const videoData = window.videopack.player_data && window.videopack.player_data[`videopack_player_gallery_${attachmentId}`];

			if (videoData) {
				this.openGalleryPopup(videoData, galleryWrapper, videoIndex);
			}
		},

		openGalleryPopup: function (videoData, galleryWrapper, videoIndex) {
			const popup = galleryWrapper.querySelector('.videopack-modal-overlay');
			const playerContainer = popup.querySelector('.modal-content');
			const gallerySettings = JSON.parse(galleryWrapper.dataset.settingsCache || '{}');
			let skinClass = gallerySettings.skin || 'vjs-default-skin';
			if (skinClass === 'default') {
				skinClass = 'vjs-default-skin';
			}

			// Clean up any previous player.
			this.destroyCurrentGalleryPlayer();
			playerContainer.innerHTML = '';

			const playerId = videoData.id; // This is 'videopack_player_gallery_XXX'
			const attachmentId = videoData.attachment_id;
			const posterAttr = videoData.poster ? `poster="${videoData.poster}"` : '';

			// Force autoplay for gallery popup.
			videoData.autoplay = true;

			// Use pre-rendered player HTML from PHP to ensure consistency
			const playerHtml = videoData.full_player_html || videoData.player_html;
			playerContainer.innerHTML = playerHtml;

			const playerWrapper = playerContainer.querySelector('.videopack-player');
			const videoElement = playerWrapper.querySelector('video');
			const videoElementId = videoElement ? videoElement.id : playerId;

			if (videoData.embed_method && videoData.embed_method.startsWith('Video.js')) {
				this.initPlayer(playerWrapper);

				const checkPlayer = setInterval(() => {
					const player = videojs.getPlayer(videoElementId);
					if (player) {
						clearInterval(checkPlayer);
						this.currentGalleryPlayer = player;
						player.ready(() => {
							player.on('ended', () => {
								if (gallerySettings.gallery_end === 'next') {
									this.navigateGalleryPopup(1, galleryWrapper);
								}
								if (gallerySettings.gallery_end === 'close') {
									this.closeGalleryPopup(popup);
								}
							});
						});
					}
				}, 100);
			} else if (videoData.embed_method === 'WordPress Default' && typeof window.MediaElementPlayer !== 'undefined') {
				const settings = Object.assign({}, window._wpmejsSettings || {});
				settings.success = (mediaElement, domObject, player) => {
					this.currentGalleryPlayer = player;
					if (!playerWrapper.dataset.videopackInitialized) {
						this.setupVideo(playerWrapper, videoData);
					}
					mediaElement.addEventListener('ended', () => {
						if (gallerySettings.gallery_end === 'next') {
							this.navigateGalleryPopup(1, galleryWrapper);
						}
						if (gallerySettings.gallery_end === 'close') {
							this.closeGalleryPopup(popup);
						}
					});
				};
				new MediaElementPlayer(videoElement, settings);
			} else {
				this.setupVideo(playerWrapper, videoData);
				if (videoElement) {
					this.currentGalleryPlayer = videoElement;
					videoElement.addEventListener('ended', () => {
						if (gallerySettings.gallery_end === 'next') {
							this.navigateGalleryPopup(1, galleryWrapper);
						}
						if (gallerySettings.gallery_end === 'close') {
							this.closeGalleryPopup(popup);
						}
					});
				}
			}

			galleryWrapper.dataset.currentGalleryAttachmentId = attachmentId;
			galleryWrapper.dataset.currentGalleryVideoIndex = videoIndex;

			popup.classList.add('is-visible');
			popup.style.display = 'flex';

			// Update nav buttons visibility
			const videoOrder = JSON.parse(galleryWrapper.dataset.currentVideosOrder);
			const totalPages = parseInt(galleryWrapper.dataset.totalPages, 10);
			const currentPage = parseInt(galleryWrapper.dataset.currentPage, 10);

			const prevButton = popup.querySelector('.modal-previous');
			const nextButton = popup.querySelector('.modal-next');

			if (videoIndex > 0 || currentPage > 1) {
				prevButton.style.display = 'block';
			} else {
				prevButton.style.display = 'none';
			}

			if (videoIndex < videoOrder.length - 1 || currentPage < totalPages) {
				nextButton.style.display = 'block';
			} else {
				nextButton.style.display = 'none';
			}
		},

		/**
		 * Safely destroy the current gallery player instance.
		 * Handles Video.js and MediaElement.js players.
		 */
		destroyCurrentGalleryPlayer: function () {
			if (!this.currentGalleryPlayer) {
				return;
			}

			// For Video.js players
			if (typeof this.currentGalleryPlayer.dispose === 'function') {
				// Prevent events from firing during disposal
				if (typeof this.currentGalleryPlayer.off === 'function') {
					this.currentGalleryPlayer.off();
				}
				this.currentGalleryPlayer.dispose();
			} else if (typeof this.currentGalleryPlayer.remove === 'function') {
				// For MediaElement.js players
				try {
					// Prevent MEJS from crashing during removal due to async resize events.
					if (this.currentGalleryPlayer.setPlayerSize) {
						this.currentGalleryPlayer.setPlayerSize = function () { };
					}
					if (this.currentGalleryPlayer.setControlsSize) {
						this.currentGalleryPlayer.setControlsSize = function () { };
					}
					if (typeof this.currentGalleryPlayer.pause === 'function') {
						this.currentGalleryPlayer.pause();
					}
					this.currentGalleryPlayer.remove();
				} catch (e) {
					// Ignore errors from MediaElement.js cleanup.
				}
				// Ensure player instance is removed from global registry.
				if (this.currentGalleryPlayer.id && window.mejs && window.mejs.players && window.mejs.players[this.currentGalleryPlayer.id]) {
					delete window.mejs.players[this.currentGalleryPlayer.id];
				}
			} else if (typeof this.currentGalleryPlayer.pause === 'function') {
				// Fallback for other player types
				this.currentGalleryPlayer.pause();
			}

			this.currentGalleryPlayer = null;
		},

		closeGalleryPopup: function (popup) {
			this.destroyCurrentGalleryPlayer();
			popup.classList.remove('is-visible');
			popup.style.display = 'none';
			const content = popup.querySelector('.modal-content');
			if (content) {
				content.innerHTML = '';
			}
		},

		navigateGalleryPopup: function (direction, galleryWrapper) {
			const currentIndex = parseInt(galleryWrapper.dataset.currentGalleryVideoIndex, 10);
			const videoOrder = JSON.parse(galleryWrapper.dataset.currentVideosOrder);
			const currentPage = parseInt(galleryWrapper.dataset.currentPage, 10);
			const totalPages = parseInt(galleryWrapper.dataset.totalPages, 10);

			let nextIndex = currentIndex + direction;

			if (nextIndex >= videoOrder.length && currentPage < totalPages) {
				// Go to next page
				this.loadGalleryPage(currentPage + 1, galleryWrapper, 0); // Load next page and open first video
			} else if (nextIndex < 0 && currentPage > 1) {
				// Go to previous page
				this.loadGalleryPage(currentPage - 1, galleryWrapper, -1); // Load prev page and open last video
			} else if (nextIndex >= 0 && nextIndex < videoOrder.length) {
				// Navigate within the current page
				const nextAttachmentId = videoOrder[nextIndex];
				const nextVideoData = window.videopack.player_data && window.videopack.player_data[`videopack_player_gallery_${nextAttachmentId}`];

				if (nextVideoData) {
					this.openGalleryPopup(nextVideoData, galleryWrapper, nextIndex);
				}
			} else {
				// This case handles wrapping on single-page galleries or at the ends of a multi-page gallery
				if (nextIndex < 0) {
					nextIndex = videoOrder.length - 1;
				} else if (nextIndex >= videoOrder.length) {
					nextIndex = 0;
				}
				const nextAttachmentId = videoOrder[nextIndex];
				const nextVideoData = window.videopack.player_data && window.videopack.player_data[`videopack_player_gallery_${nextAttachmentId}`];

				if (nextVideoData) {
					this.openGalleryPopup(nextVideoData, galleryWrapper, nextIndex);
				}
			}
		},

		handleCollectionPaginationClick: function (e, collectionWrapper, pageLink) {
			e.preventDefault();
			let page = 1;
			if (pageLink) {
				if (pageLink.dataset.page) {
					page = pageLink.dataset.page;
				} else if (pageLink.href) {
					// Extract page from standard WordPress pagination URL
					const url = new URL(pageLink.href, window.location.origin);
					if (url.searchParams.has('paged')) {
						page = url.searchParams.get('paged');
					} else {
						const match = url.pathname.match(/\/page\/(\d+)/);
						if (match) {
							page = match[1];
						}
					}
				}
			} else {
				// Fallback if pageLink isn't explicitly passed
				const target = e.target.closest('button, a.page-numbers');
				if (target && target.dataset.page) {
					page = target.dataset.page;
				}
			}
			
			if (page) {
				this.loadCollectionPage(page, collectionWrapper);
			}
		},

		handleGalleryPaginationClick: function (e, galleryWrapper) {
			this.handleCollectionPaginationClick(e, galleryWrapper);
		},

		loadCollectionPage: function (page, collectionWrapper, openVideoAtIndex = null) {
			const settings = JSON.parse(collectionWrapper.dataset.settingsCache);
			const layout = collectionWrapper.dataset.layout;
			const grid = collectionWrapper.querySelector('.videopack-gallery-items, .videopack-grid-items, .videopack-video-list');
			const pagination = collectionWrapper.querySelector('.videopack-pagination');

			if (grid) {
				grid.style.opacity = 0.5;
			}

			const restUrl = new URL(videopack_l10n.rest_url + 'videopack/v1/video_gallery');

			Object.keys(settings).forEach((key) => {
				if (settings[key] !== null && settings[key] !== false && settings[key] !== '') {
					restUrl.searchParams.append(key, settings[key]);
				}
			});
			restUrl.searchParams.append('page_number', page);
			restUrl.searchParams.append('layout', layout);

			fetch(restUrl)
				.then((response) => response.json())
				.then((data) => {
					if (data.html) {
						if (data.videos && window.videopack) {
							window.videopack.player_data = window.videopack.player_data || {};
							data.videos.forEach((video) => {
								if (video.player_vars && video.player_vars.id) {
									window.videopack.player_data[video.player_vars.id] = video.player_vars;
								}
							});
						}
						const tempDiv = document.createElement('div');
						tempDiv.innerHTML = data.html;

						const newCollectionWrapper = tempDiv.querySelector('.videopack-collection-wrapper');
						if (newCollectionWrapper) {
							const newGrid = newCollectionWrapper.querySelector('.videopack-gallery-items, .videopack-grid-items, .videopack-video-list');
							const newPagination = newCollectionWrapper.querySelector('.videopack-pagination');

							if (grid && newGrid) {
								grid.innerHTML = newGrid.innerHTML;
							}
							if (pagination && newPagination) {
								pagination.innerHTML = newPagination.innerHTML;
							} else if (pagination) {
								// Fallback: look for pagination in the returned HTML if not in the wrapper
								const altNewPagination = tempDiv.querySelector('.videopack-pagination');
								if (altNewPagination) {
									pagination.innerHTML = altNewPagination.innerHTML;
								} else {
									pagination.innerHTML = '';
								}
							}

							collectionWrapper.dataset.currentPage = page;
							if (data.max_num_pages) {
								collectionWrapper.dataset.totalPages = data.max_num_pages;
							}
							this.initPlayers(collectionWrapper); // Initialize any new players
							this.initCollection(collectionWrapper); // Re-initialize elements and listeners

							// Update global state if it's a gallery
							if (layout === 'gallery') {
								const newVideoOrder = [];
								newGrid.querySelectorAll('.videopack-gallery-item').forEach((thumb) => {
									newVideoOrder.push(String(thumb.dataset.attachmentId));
								});
								collectionWrapper.dataset.currentVideosOrder = JSON.stringify(newVideoOrder);

								if (data.videos) {
									data.videos.forEach((video) => {
										if (video.player_vars && video.player_vars.id) {
											window.videopack.player_data[video.player_vars.id] = video.player_vars;
										}
									});
								}

								if (openVideoAtIndex !== null) {
									const actualIndex = openVideoAtIndex === -1 ? newVideoOrder.length - 1 : openVideoAtIndex;
									const nextAttachmentId = newVideoOrder[actualIndex];
									const videoToOpen = window.videopack.player_data && window.videopack.player_data[`videopack_player_gallery_${nextAttachmentId}`];
									if (videoToOpen) {
										this.openGalleryPopup(videoToOpen, collectionWrapper, actualIndex);
									}
								}
							}
						}
					}
					if (grid) {
						grid.style.opacity = 1;
					}
				})
				.catch((error) => {
					console.error('Error loading collection page:', error);
					if (grid) {
						grid.style.opacity = 1;
					}
				});
		},

		loadGalleryPage: function (page, galleryWrapper, openVideoAtIndex = null) {
			this.loadCollectionPage(page, galleryWrapper, openVideoAtIndex);
		},

		renderGalleryPagination: function (maxPages, currentPage, pagination) {
			if (!pagination) {
				return;
			}
			pagination.innerHTML = '';
		},

	};

	// Expose the videopack object to the global scope, merging with any existing properties (like player_data).
	window.videopack = Object.assign(window.videopack || {}, videopack_obj);

	document.addEventListener('DOMContentLoaded', () => window.videopack.init());
}());
