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
			this.initModularBlocks();

			// Initialize collections (Gallery, Grid, List) with pagination
			document.querySelectorAll('.videopack-collection-wrapper').forEach((element) => {
				this.initCollection(element);
			});

			// Global lightbox listener for modular blocks
			document.addEventListener('click', (e) => {
				const lightboxTrigger = e.target.closest('[data-videopack-lightbox="true"]');
				if (lightboxTrigger) {
					this.handleGlobalLightboxClick(e, lightboxTrigger);
				}

				const pageLink = e.target.closest('.videopack-pagination .page-numbers, .videopack-pagination-button');
				if (pageLink && !pageLink.classList.contains('current') && !pageLink.disabled) {
					this.handleGlobalPaginationClick(e, pageLink);
				}
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
		 * Initialize standalone modular blocks (title overlays on thumbnails, etc.)
		 *
		 * @since 5.3.0
		 * @param {HTMLElement|Document} container The container to search.
		 */
		initModularBlocks: function (container = document) {
			container.querySelectorAll('.videopack-meta-wrapper, .videopack-thumbnail-wrapper, .videopack-video-watermark').forEach((element) => {
				const shareToggle = element.querySelector('.videopack-share-toggle');
				const downloadLink = element.querySelector('.videopack-download-link');
				if (shareToggle || downloadLink) {
					this.setupMetaBar(element);
				}
			});
		},

		/**
		 * Initialize a single player.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 */
		initPlayer: function (playerWrapper) {
			if (playerWrapper.dataset.videopackInitialized) {
				return;
			}
			let playerId = playerWrapper.dataset.id;
			const videoVars =
				window.videopack.player_data && window.videopack.player_data[`videopack_player_${playerId}`];

			if (!videoVars) {
				return;
			}

			if (videoVars.embed_method === 'Video.js') {
				return this.loadVideoJS(playerWrapper, videoVars);
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
			} else {
				this.setupVideo(playerWrapper, videoVars);
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
				const pid = playerWrapper.dataset.id;
				this.setupVideo(playerWrapper, window.videopack.player_data[`videopack_player_${pid}`]);
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
					if (videoVars.default_res) {
						videojsOptions.plugins.resolutionSelector.default_res = videoVars.default_res;
					} else if (defaultResSource) {
						videojsOptions.plugins.resolutionSelector.default_res = defaultResSource.dataset.res;
					}

					if (videoVars.default_codec) {
						videojsOptions.plugins.resolutionSelector.default_codec = videoVars.default_codec;
					} else if (defaultResSource) {
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
				this.setupVideo(playerWrapper, videoVars);
				return videojs.getPlayer(videoElementId);
			}

			// Return the player instance created by videojs()
			const player = videojs(videoElement, videojsOptions);
			player.ready(() => {
				this.setupVideo(playerWrapper, videoVars);
			});
			return player;
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

			// If there's a meta bar, it might have been initialized by initModularBlocks.
			// However, we want the player instance to be the authoritative wrapper for sharing.
			const metaBar = playerWrapper.querySelector('.videopack-meta-wrapper');
			if (metaBar) {
				// Clear the initialization from the meta bar and let the player handle it.
				delete metaBar.dataset.videopackMetaInitialized;
			}
			this.setupMetaBar(playerWrapper, videoVars);

			if (true !== videoVars.right_click) {
				playerWrapper.addEventListener('contextmenu', (e) => e.preventDefault());
			}

			if ('vertical' === videoVars.fixed_aspect) {
				const videoElement = playerWrapper.querySelector('video');
				if (videoElement) {
					const checkVertical = () => {
						let isVertical = false;

						if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
							// Filter out the 100x100 placeholder browsers sometimes report before metadata is ready.
							if (videoElement.videoWidth === 100 && videoElement.videoHeight === 100 && videoElement.readyState < 1) {
								return;
							}
							isVertical = videoElement.videoHeight > videoElement.videoWidth;
						} else {
							// Fallback to database metadata or rotation data.
							isVertical =
								Number(videoVars.height) > Number(videoVars.width) ||
								[90, 270].includes(Number(videoVars.rotate));
						}

						if (isVertical) {
							const ratio = videoVars.default_ratio ? videoVars.default_ratio.replace(':', ' / ') : '16 / 9';

							playerWrapper.classList.add('videopack-fixed-aspect');
							playerWrapper.style.aspectRatio = ratio;

							// Important: Apply directly to the video container so MEJS respects the constraint.
							const mejsContainer = playerWrapper.querySelector('.wp-video-container');
							if (mejsContainer) {
								mejsContainer.style.aspectRatio = ratio;
							}
						}
					};

					// Check immediately with fallbacks, then re-check when metadata arrives.
					checkVertical();
					if (videoElement.readyState < 1) {
						videoElement.addEventListener('loadedmetadata', checkVertical, { once: true });
					}
				}
			}

			if (videoVars.embed_method === 'Video.js') {
				this.setupVideoJSPlayer(playerWrapper, videoVars);
			} else if (videoVars.embed_method === 'WordPress Default') {
				this.setupMEJSPlayer(playerWrapper, videoVars);
			} else {
				const video = playerWrapper.querySelector('video');
				if (video) {
					this.setupVideoTitle(playerWrapper, video, videoVars);
				}
			}

			// Resize logic.
			if ((videoVars.legacy_dimensions && true === videoVars.resize) || 'automatic' === videoVars.auto_res || window.location.search.includes('videopack[enable]=true')) {
				this.resizeVideo(playerId);

				const target = playerWrapper.parentElement;

				if (target) {
					const resizeObserver = new ResizeObserver(() => {
						this.resizeVideo(playerId);
					});
					resizeObserver.observe(target);
				}
			}

			playerWrapper.dataset.videopackInitialized = 'true';
		},

		/**
		 * Set up the meta bar (share toggle, embed code copying, etc.)
		 *
		 * @since 5.3.0
		 * @param {HTMLElement} wrapper The wrapper containing the icons.
		 * @param {object} videoVars Optional video variables.
		 */
		setupMetaBar: function (wrapper, videoVars) {
			if (wrapper.dataset.videopackMetaInitialized) {
				return;
			}

			const shareToggle = wrapper.querySelector('.videopack-share-toggle');
			if (shareToggle && !shareToggle.dataset.videopackInitialized) {
				shareToggle.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					this.toggleShare(wrapper);
				});
				shareToggle.dataset.videopackInitialized = 'true';

				const clickTrap = wrapper.querySelector('.videopack-click-trap');
				if (clickTrap) {
					clickTrap.addEventListener('click', (e) => {
						e.preventDefault();
						e.stopPropagation();
						this.toggleShare(wrapper);
					});
				}
			}

			// Setup "start at" functionality.
			const embedWrapper = wrapper.querySelector('.videopack-share-container');
			if (embedWrapper) {
				const startAtEnable = embedWrapper.querySelector('.videopack-start-at-enable');
				if (startAtEnable) {
					startAtEnable.addEventListener('change', () => this.setStartAt(wrapper));
				}
				const startAtInput = embedWrapper.querySelector('.videopack-start-at');
				if (startAtInput) {
					startAtInput.addEventListener('change', () => this.changeStartAt(wrapper));
				}
				const embedInput = embedWrapper.querySelector('.videopack-embed-code');
				if (embedInput) {
					embedInput.addEventListener('click', () => embedInput.select());
				}
			}

			const downloadLink = wrapper.querySelector('.videopack-download-link');
			if (downloadLink && downloadLink.hasAttribute('download') && downloadLink.dataset.alt_link) {
				downloadLink.addEventListener('click', (e) => {
					e.preventDefault();
					this.checkDownloadLink(downloadLink);
				});
			}

			wrapper.dataset.videopackMetaInitialized = 'true';
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

				if ('vertical' === videoVars.fixed_aspect && player.videoHeight() > player.videoWidth()) {
					const ratio = videoVars.default_ratio ? videoVars.default_ratio.replace(/\s\/\s/g, ':') : '16:9';
					player.aspectRatio(ratio);
					playerWrapper.classList.add('videopack-fixed-aspect');
				}
			});

			player.on('play', () => {
				player.focus();

				if (videoVars.endofvideooverlay) {
					const overlay = playerWrapper.querySelector('.videopack-end-overlay');
					if (overlay) {
						overlay.classList.remove('is-visible');
					}
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
					const overlay = playerWrapper.querySelector('.videopack-end-overlay');
					if (overlay) {
						overlay.style.backgroundImage = `url(${videoVars.endofvideooverlay})`;
						overlay.classList.add('is-visible');
					}
				}
			});

			player.on('fullscreenchange', () => {
				this.resizeVideo(playerId);
			});

			this.setupVideoTitle(playerWrapper, player, videoVars);
		},

		/**
		 * Setup video title visibility and hover behavior.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 * @param {object}      player        The player instance (Video.js or MEJS).
		 * @param {object}      videoVars     The video variables.
		 */
		setupVideoTitle: function (playerWrapper, player, videoVars) {
			const getMetaElements = () => {
				// Search both inside the player and in the immediate parent (for cases where they aren't moved yet)
				const elements = Array.from(playerWrapper.querySelectorAll('.videopack-video-title, .videopack-meta-wrapper'));
				const parent = playerWrapper.closest('.videopack-wrapper');
				if (parent) {
					Array.from(parent.querySelectorAll('.videopack-video-title, .videopack-meta-wrapper')).forEach((el) => {
						if (!elements.includes(el)) elements.push(el);
					});
				}
				return elements;
			};

			const isMejs = 'WordPress Default' === videoVars.embed_method;
			const video = isMejs ? player.media : (player.tagName === 'VIDEO' ? player : (player.el ? player.el().querySelector('video') : null));

			const showMeta = () => {
				getMetaElements().forEach((el) => el.classList.add('videopack-video-title-visible'));
			};
			const hideMeta = () => {
				getMetaElements().forEach((el) => el.classList.remove('videopack-video-title-visible'));
			};

			if (isMejs && video) {
				video.addEventListener('play', hideMeta);
				video.addEventListener('pause', showMeta);
				video.addEventListener('ended', showMeta);
			} else if (player && !isMejs) {
				if (typeof player.on === 'function') {
					player.on('play', hideMeta);
					player.on('pause', showMeta);
					player.on('ended', showMeta);
				} else if (typeof player.addEventListener === 'function') {
					player.addEventListener('play', hideMeta);
					player.addEventListener('pause', showMeta);
					player.addEventListener('ended', showMeta);
				}
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
					const overlay = playerWrapper.querySelector('.videopack-end-overlay');
					if (overlay) {
						overlay.style.backgroundImage = `url(${videoVars.endofvideooverlay})`;
						overlay.classList.add('is-visible');
					}
					video.addEventListener('seeking', () => {
						if (0 !== video.currentTime) {
							const currentOverlay = playerWrapper.querySelector('.videopack-end-overlay');
							if (currentOverlay) {
								currentOverlay.classList.remove('is-visible');
							}
						}
					}, { once: true });
				}
			});

			this.setupVideoTitle(playerWrapper, player, videoVars);
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
				if (player) {
					if (player.manualResolutionSelected) {
						return;
					}

					const options = player.options();
					const rsOptions = options.plugins && options.plugins.resolutionSelector;
					const default_res = rsOptions ? rsOptions.default_res : undefined;
					const default_codec = rsOptions ? rsOptions.default_codec : undefined;

					if (default_res && !player.dataset.videopackInitialResSet) {
						player.dataset.videopackInitialResSet = 'true';
						player.changeRes(default_res, default_codec);
					}

					if (player.getCurrentCodec) {
						const detectedCodec = player.getCurrentCodec();
						if (detectedCodec) {
							currentCodec = detectedCodec;
						}
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
			const viewCountElement = viewCountWrapper ? viewCountWrapper.querySelector('.videopack-view-count') : null;

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
							views: !!viewCountElement,
						}),
					})
						.then((response) => {
							if (!response.ok) {
								throw new Error(`HTTP error! status: ${response.status}`);
							}
							return response.json();
						})
						.then((data) => {
							if ('play' === event && data.views && viewCountElement) {
								const span = viewCountElement.tagName === 'SPAN' ? viewCountElement : viewCountElement.querySelector('span');
								if (span) {
									span.innerHTML = data.views;
								} else {
									viewCountElement.innerHTML = data.views;
								}
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
			const playerId = playerWrapper.dataset.id || playerWrapper.dataset.postId;
			const videoVars =
				(window.videopack.player_data && window.videopack.player_data[`videopack_player_${playerId}`]) || {};
			const shareIcon = playerWrapper.querySelector('.videopack-icons.share, .videopack-icons.close');
			const embedWrapper = playerWrapper.querySelector('.videopack-share-container');
			const clickTrap = playerWrapper.querySelector('.videopack-click-trap');

			if (!shareIcon || !embedWrapper) {
				return;
			}

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
			// Ensure settings are cached if not already set by the server.
			if (!collectionWrapper.dataset.settingsCache) {
				const settings = JSON.parse(collectionWrapper.dataset.settings || '{}');
				collectionWrapper.dataset.settingsCache = JSON.stringify(settings);
			}

			if (collectionWrapper.dataset.videopackCollectionInitialized) {
				return;
			}

			if (collectionWrapper.classList.contains('videopack-gallery-wrapper')) {
				// Store initial video data order for navigation.
				const initialVideoOrder = [];
				collectionWrapper.querySelectorAll('.videopack-gallery-item').forEach((thumb) => {
					initialVideoOrder.push(thumb.dataset.videopackId || `videopack_player_gallery_${thumb.dataset.attachmentId}`);
				});
				collectionWrapper.dataset.currentVideosOrder = JSON.stringify(initialVideoOrder);
				this.setupGalleryItemScaling(collectionWrapper);
			}

			collectionWrapper.dataset.videopackCollectionInitialized = true;
		},

		initGallery: function (galleryWrapper) {
			this.initCollection(galleryWrapper);
		},

		initList: function (listWrapper) {
			this.initCollection(listWrapper);
		},

		openGalleryPopup: function (videoData, galleryWrapper, videoIndex) {
			const popup = galleryWrapper.classList.contains('videopack-modal-overlay')
				? galleryWrapper
				: galleryWrapper.querySelector('.videopack-modal-overlay');
			const playerContainer = popup.querySelector('.modal-content');
			const gallerySettings = JSON.parse(galleryWrapper.dataset.settingsCache || '{}');
			let skinClass = gallerySettings.skin || '';
			if (skinClass === 'default') {
				skinClass = '';
			}

			// Store a reference to the original wrapper for pagination if needed.
			popup.videopackSourceWrapper = galleryWrapper.videopackSourceWrapper || galleryWrapper;

			// Clean up any previous player.
			this.destroyCurrentGalleryPlayer();
			playerContainer.innerHTML = '';

			// Assign fresh navigation listeners.
			const nextButton = popup.querySelector('.modal-next');
			const prevButton = popup.querySelector('.modal-previous');
			const closeButton = popup.querySelector('.modal-close');

			if (nextButton) {
				nextButton.onclick = (e) => {
					setTimeout(() => {
						this.navigateGalleryPopup(1, galleryWrapper);
					}, 0);
				};
			}
			if (prevButton) {
				prevButton.onclick = (e) => {
					setTimeout(() => {
						this.navigateGalleryPopup(-1, galleryWrapper);
					}, 0);
				};
			}
			if (closeButton) {
				closeButton.onclick = (e) => {
					e.stopPropagation();
					this.closeGalleryPopup(popup);
				};
			}

			// Background click for closing.
			popup.onclick = (e) => {
				if (e.target === popup) {
					this.closeGalleryPopup(popup);
				}
			};

			const attachmentId = videoData.attachment_id;

			// Force autoplay.
			videoData.autoplay = true;

			// Use pre-rendered player HTML.
			let playerHtml =
				videoData.player_html ||
				videoData.full_player_html ||
				(videoData.player_vars &&
					(videoData.player_vars.player_html || videoData.player_vars.full_player_html));

			if (!playerHtml) {
				console.error('Videopack: Could not find player HTML in video data', videoData);
				return;
			}

			playerContainer.innerHTML = playerHtml;

			const playerWrapper = playerContainer.querySelector('.videopack-player');
			if (!playerWrapper) {
				console.error('Videopack: Could not find .videopack-player in injected HTML');
				return;
			}

			// Ensure IDs are unique for the lightbox to prevent DOM clashes with standalone players
			let originalId = playerWrapper.dataset.id;
			// Strip prefix if present, as initPlayer will add it back when looking up data
			let cleanId = originalId.replace('videopack_player_', '');
			const newId = cleanId + '_lightbox';
			playerWrapper.dataset.id = newId;

			const metaWrapper = playerContainer.querySelector(`[id="video_${originalId}_meta"]`);
			if (metaWrapper) {
				metaWrapper.id = `video_${newId}_meta`;
			}

			const watermark = playerContainer.querySelector(`[id="video_${originalId}_watermark"]`);
			if (watermark) {
				watermark.id = `video_${newId}_watermark`;
			}

			const videoElement = playerWrapper.querySelector('video, audio');
			if (videoElement) {
				videoElement.setAttribute('autoplay', 'autoplay');
				if (videoElement.id) {
					videoElement.id = videoElement.id + '_lightbox';
				} else {
					videoElement.id = newId;
				}
				if (skinClass && skinClass !== 'default') {
					videoElement.classList.add(skinClass);
					playerWrapper.classList.add(skinClass);
				}
			}

			const videoElementId = videoElement ? videoElement.id : newId;

			// Map the configuration data to this specific instance ID so initPlayer can find it.
			// initPlayer expects the key to be prefixed with 'videopack_player_'
			window.videopack.player_data = window.videopack.player_data || {};
			window.videopack.player_data['videopack_player_' + newId] = videoData.player_vars || videoData;

			if (videoData.embed_method && videoData.embed_method.startsWith('Video.js')) {
				this.currentGalleryPlayer = this.initPlayer(playerWrapper);

				const checkPlayer = setInterval(() => {
					const player = videojs.getPlayer(videoElementId);
					if (player) {
						clearInterval(checkPlayer);
						this.currentGalleryPlayer = player;
						player.ready(() => {
							if (videoData.autoplay) {
								player.play();
							}
							player.on('ended', () => {
								const galleryEnd = gallerySettings.gallery_end || 'next';
								if (galleryEnd === 'next') {
									setTimeout(() => {
										this.navigateGalleryPopup(1, galleryWrapper);
									}, 0);
								} else if (galleryEnd === 'close') {
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
							setTimeout(() => {
								this.navigateGalleryPopup(1, galleryWrapper);
							}, 0);
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
							setTimeout(() => {
								this.navigateGalleryPopup(1, galleryWrapper);
							}, 0);
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

			if (videoIndex > 0 || currentPage > 1) {
				prevButton.classList.remove('is-disabled');
				prevButton.style.display = 'block';
			} else {
				prevButton.classList.add('is-disabled');
				prevButton.style.display = 'none';
			}
		
			if (videoIndex < videoOrder.length - 1 || currentPage < totalPages) {
				nextButton.classList.remove('is-disabled');
				nextButton.style.display = 'block';
			} else {
				nextButton.classList.add('is-disabled');
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
				try {
					// Prevent events from firing during disposal
					if (typeof this.currentGalleryPlayer.off === 'function') {
						this.currentGalleryPlayer.off();
					}

					// Explicitly disable user activity tracking to prevent "Invalid target" error
					if (typeof this.currentGalleryPlayer.userActive === 'function') {
						this.currentGalleryPlayer.userActive(false);
					}

					// Double-check if already disposed to prevent "classList of null"
					if (!this.currentGalleryPlayer.isDisposed || !this.currentGalleryPlayer.isDisposed()) {
						this.currentGalleryPlayer.dispose();
					}
				} catch (e) {
					// Fail silently or handle disposal error
				}
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
			popup.onclick = null;
			const nextButton = popup.querySelector('.modal-next');
			const prevButton = popup.querySelector('.modal-previous');
			const closeButton = popup.querySelector('.modal-close');

			if (nextButton) nextButton.onclick = null;
			if (prevButton) prevButton.onclick = null;
			if (closeButton) closeButton.onclick = null;

			const content = popup.querySelector('.modal-content');
			if (content) {
				content.innerHTML = '';
			}
		},

		navigateGalleryPopup: function (direction, galleryWrapper) {
			const sourceWrapper = galleryWrapper.videopackSourceWrapper || galleryWrapper;
			const currentIndex = parseInt(galleryWrapper.dataset.currentGalleryVideoIndex, 10);
			const videoOrder = JSON.parse(galleryWrapper.dataset.currentVideosOrder);
			const currentPage = parseInt(galleryWrapper.dataset.currentPage, 10);
			const totalPages = parseInt(galleryWrapper.dataset.totalPages, 10);

			let nextIndex = currentIndex + direction;

			if (nextIndex >= videoOrder.length && currentPage < totalPages) {
				this.loadCollectionPage(currentPage + 1, sourceWrapper, 0); // Load next page and open first video
			} else if (nextIndex < 0 && currentPage > 1) {
				this.loadCollectionPage(currentPage - 1, sourceWrapper, -1); // Load prev page and open last video
			} else if (nextIndex >= 0 && nextIndex < videoOrder.length) {
				// Navigate within the current page
				const nextVideoId = videoOrder[nextIndex];
				let nextVideoData = (window.videopack && window.videopack.player_data) ? window.videopack.player_data[nextVideoId] : null;

				if (!nextVideoData) {
					const prefixedId = `videopack_player_${nextVideoId}`;
					nextVideoData = (window.videopack && window.videopack.player_data) ? window.videopack.player_data[prefixedId] : null;
				}

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
				const nextVideoId = videoOrder[nextIndex];
				let nextVideoData = (window.videopack && window.videopack.player_data) ? window.videopack.player_data[nextVideoId] : null;

				if (!nextVideoData) {
					const prefixedId = `videopack_player_${nextVideoId}`;
					nextVideoData = (window.videopack && window.videopack.player_data) ? window.videopack.player_data[prefixedId] : null;
				}

				if (nextVideoData) {
					this.openGalleryPopup(nextVideoData, galleryWrapper, nextIndex);
				}
			}
		},

		/**
		 * Handles click on a global lightbox trigger.
		 *
		 * @since 5.0.0
		 * @param {Event}       e       The click event.
		 * @param {HTMLElement} trigger The trigger element.
		 */
		handleGlobalLightboxClick: function (e, trigger) {
			e.preventDefault();
			const attachmentId = trigger.dataset.attachmentId;
			const videopackId = trigger.dataset.videopackId;
			
			let videoData = (window.videopack && window.videopack.player_data) ? window.videopack.player_data[videopackId] : null;
			
			// Fallback 1: try prefixed version if raw ID failed.
			if (!videoData) {
				const prefixedId = `videopack_player_${videopackId}`;
				videoData = (window.videopack && window.videopack.player_data) ? window.videopack.player_data[prefixedId] : null;
			}

			// Fallback 2: search for data-attachment-id if explicit ID lookup failed.
			if (!videoData) {
				const fallbackId = `videopack_player_gallery_${attachmentId}`;
				videoData = (window.videopack && window.videopack.player_data) ? window.videopack.player_data[fallbackId] : null;
			}

			if (videoData) {
				const modal = document.getElementById('videopack-global-modal');
				if (modal) {
					// Check if this item belongs to a gallery/collection.
					const collectionWrapper = trigger.closest('.videopack-collection-wrapper');
					let videoOrder = [];
					let clickedIndex = 0;

					if (collectionWrapper) {
						// Existing gallery logic: respect the collection's order and settings.
						const siblingThumbnails = Array.from(collectionWrapper.querySelectorAll('.videopack-gallery-item'));
						siblingThumbnails.forEach((sibling, index) => {
							const sid = sibling.dataset.attachmentId;
							// Rely on the server's videopackId; fallback to standard gallery format if missing.
							const svid = sibling.dataset.videopackId || `videopack_player_gallery_${sid}`;
							videoOrder.push(svid);
							if (sibling === trigger) {
								clickedIndex = index;
							}
						});

						modal.dataset.settingsCache = collectionWrapper.dataset.settings || collectionWrapper.dataset.settingsCache || '{}';
						modal.dataset.totalPages = collectionWrapper.dataset.totalPages || 1;
						modal.dataset.currentPage = collectionWrapper.dataset.currentPage || 1;
					} else {
						// Standalone block logic: look for other top-level blocks as pseudo-gallery.
						const allTriggers = Array.from(document.querySelectorAll('[data-videopack-lightbox="true"]')).filter(t => !t.closest('.videopack-collection-wrapper'));
						allTriggers.forEach((sibling, index) => {
							const sid = sibling.dataset.attachmentId;
							const svid = sibling.dataset.videopackId || `videopack_player_gallery_${sid}`;
							videoOrder.push(svid);
							if (sibling === trigger) {
								clickedIndex = index;
							}
						});

						modal.dataset.settingsCache = JSON.stringify({
							skin: videoData.skin || 'vjs-theme-videopack',
							gallery_end: 'next',
						});
						modal.dataset.totalPages = 1;
						modal.dataset.currentPage = 1;
					}

					modal.dataset.currentVideosOrder = JSON.stringify(videoOrder);
					modal.dataset.currentGalleryVideoIndex = clickedIndex;

					// Store source collection for pagination sync
					modal.videopackSourceWrapper = collectionWrapper;

					// Call the standard gallery popup logic.
					this.openGalleryPopup(videoData, modal, clickedIndex);
				}
			}
		},

		handleCollectionPaginationClick: function (e, collectionWrapper, pageLink) {
			e.preventDefault();
			let page = 1;
			if (pageLink) {
				if (pageLink.dataset.page) {
					page = pageLink.dataset.page;
				} else if (pageLink.tagName === 'A' && pageLink.href) {
					// Extract page from standard WordPress pagination URL
					const url = new URL(pageLink.href, window.location.origin);
					if (url.searchParams.has('paged')) {
						page = url.searchParams.get('paged');
					} else {
						// Match /page/2 or /page/2/
						const match = url.pathname.match(/\/page\/(\d+)\/?$/) || url.pathname.match(/\/page\/(\d+)\//);
						if (match) {
							page = match[1];
						}
					}
				}
			} else {
				// Fallback if pageLink isn't explicitly passed
				const target = e.target.closest('button, a.page-numbers, .videopack-pagination-button');
				if (target && target.dataset.page) {
					page = target.dataset.page;
				}
			}
			
			if (page) {
				this.loadCollectionPage(page, collectionWrapper);
			}
		},

		handleGlobalPaginationClick: function(e) {
			var paginationButton = e.target.closest('.videopack-pagination-button');
			if (!paginationButton) return;

			// Always prevent default if it's a page number link
			if (paginationButton.tagName === 'A' || paginationButton.tagName === 'BUTTON') {
				e.preventDefault();
			}

			// Find the associated collection wrapper
			let collectionWrapper = paginationButton.closest('.videopack-collection-wrapper');
			
			if (!collectionWrapper) {
				// If not inside, look for the closest collection wrapper before this block
				const paginationBlock = paginationButton.closest('.videopack-pagination');
				if (paginationBlock) {
					// Check siblings
					collectionWrapper = paginationBlock.previousElementSibling;
					while (collectionWrapper && !collectionWrapper.classList.contains('videopack-collection-wrapper')) {
						collectionWrapper = collectionWrapper.previousElementSibling;
					}
				}
			}

			if (collectionWrapper) {
				this.handleCollectionPaginationClick(e, collectionWrapper, paginationButton);
			}
		},

		handleGalleryPaginationClick: function (e, galleryWrapper) {
			this.handleCollectionPaginationClick(e, galleryWrapper);
		},

		loadCollectionPage: function (page, collectionWrapper, openVideoAtIndex = null) {
			const settings = collectionWrapper.dataset.settingsCache ? JSON.parse(collectionWrapper.dataset.settingsCache) : {};
			const layout = collectionWrapper.dataset.layout || 'grid';
			


			const grid = collectionWrapper.querySelector('.videopack-collection-inner, .videopack-gallery-items, .videopack-grid-items, .videopack-video-list');
			const pagination = collectionWrapper.querySelector('.videopack-pagination');

			if (grid) {
				grid.style.opacity = 0.5;
			}

			const restUrl = new URL(videopack_l10n.rest_url + 'videopack/v1/video_gallery');

			const postData = new URLSearchParams();
			Object.keys(settings).forEach((key) => {
				if (settings[key] !== null && settings[key] !== false && settings[key] !== '' && typeof settings[key] !== 'undefined') {
					postData.append(key, settings[key]);
				}
			});
			postData.append('page_number', page);
			if (layout && layout !== 'undefined') {
				postData.append('layout', layout);
			}

			fetch(restUrl, {
				method: 'POST',
				body: postData,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})
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
							// Sync datasets back to the modal if it's currently open and linked to this collection
							const modal = document.getElementById('videopack-global-modal');
							if (modal && modal.videopackSourceWrapper === collectionWrapper) {
								modal.dataset.currentPage = page;
								// Re-sync video order for the lightbox
								const newVideoOrder = [];
								const newGrid = newCollectionWrapper.querySelector('.videopack-collection-inner, .videopack-gallery-items, .videopack-grid-items, .videopack-video-list');
								if (newGrid) {
									newGrid.querySelectorAll('.videopack-gallery-item').forEach((thumb) => {
										newVideoOrder.push(thumb.dataset.videopackId || `videopack_player_gallery_${thumb.dataset.attachmentId}`);
									});
									modal.dataset.currentVideosOrder = JSON.stringify(newVideoOrder);
								}
								if (data.max_num_pages) {
									modal.dataset.totalPages = data.max_num_pages;
								}
								if (newCollectionWrapper.dataset.settingsCache) {
									modal.dataset.settingsCache = newCollectionWrapper.dataset.settingsCache;
								}
							}

							const newGrid = newCollectionWrapper.querySelector('.videopack-collection-inner, .videopack-gallery-items, .videopack-grid-items, .videopack-video-list');
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

							// Update global state and navigate if requested
							const newVideoOrder = [];
							const currentGrid = collectionWrapper.querySelector('.videopack-collection-inner, .videopack-gallery-items, .videopack-grid-items, .videopack-video-list');
							if (currentGrid) {
								currentGrid.querySelectorAll('.videopack-gallery-item').forEach((thumb) => {
									newVideoOrder.push(thumb.dataset.videopackId || `videopack_player_gallery_${thumb.dataset.attachmentId}`);
								});
								collectionWrapper.dataset.currentVideosOrder = JSON.stringify(newVideoOrder);
							}

							if (data.videos) {
								data.videos.forEach((video) => {
									if (video.player_vars && video.player_vars.id) {
										window.videopack.player_data[video.player_vars.id] = video.player_vars;
									}
								});
							}

							if (openVideoAtIndex !== null && newVideoOrder.length > 0) {
								const actualIndex = openVideoAtIndex === -1 ? newVideoOrder.length - 1 : openVideoAtIndex;
								const nextVideoId = newVideoOrder[actualIndex];
								const videoToOpen = window.videopack.player_data && (window.videopack.player_data[nextVideoId] || window.videopack.player_data[`videopack_player_gallery_${nextVideoId}`]);
								if (videoToOpen) {
									const targetForPopup = (modal && modal.videopackSourceWrapper === collectionWrapper) ? modal : collectionWrapper;
									this.openGalleryPopup(videoToOpen, targetForPopup, actualIndex);
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
