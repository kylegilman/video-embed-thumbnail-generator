'use strict';

/**
 * ============================================================================
 * Video.js Quality Selector Plugin
 * ============================================================================
 */
if ('undefined' !== typeof window.videojs && 'undefined' === typeof window.videojs.getPlugin('resolutionSelector')) {
	(function (videojs) {
		// Globally propagate query parameters for private HLS/DASH bucket playback using Video.js (VHS)
		if (videojs.Vhs && videojs.Vhs.xhr && typeof videojs.Vhs.xhr.beforeRequest !== 'function') {
			videojs.Vhs.xhr.beforeRequest = function (options) {
				const players = videojs.getPlayers();
				let queryString = '';
				for (const id in players) {
					const p = players[id];
					if (p && !p.isDisposed()) {
						const src = p.currentSrc();
						if (src && src.includes('?')) {
							if (src.includes('Signature=') || src.includes('Expires=')) {
								queryString = src.substring(src.indexOf('?') + 1);
								break;
							}
						}
					}
				}

				if (queryString && options.uri && !options.uri.includes('Signature=') && !options.uri.includes('Expires=')) {
					const separator = options.uri.includes('?') ? '&' : '?';
					options.uri += separator + queryString;
				}
				return options;
			};
		}

		const methods = {
			res_label: function (res) {
				if (res === 'Auto') { return res; }
				return (/^\d+$/.test(res)) ? res + 'p' : res;
			},
			/**
			 * Groups a flat sources array (which may span multiple
			 * codec/format groups) by resolution. When a resolution is
			 * offered by more than one codec, all candidates are kept — the
			 * browser's native <source> fallback picks and, if needed,
			 * retries the next one on an actual load failure, rather than us
			 * guessing from a one-shot canPlayType() capability check.
			 * Candidates already arrive ordered by codec efficiency (most
			 * efficient first) from Player::set_sources() server-side, so
			 * that order is preserved as-is.
			 *
			 * @param {Array} sources All sources across every codec group.
			 * @return {Object} Map of resolution -> array of candidate sources for that resolution.
			 */
			group_sources_by_resolution: function (sources) {
				const byRes = {};
				sources.forEach((s) => {
					const res = s.resolution || s['data-res'];
					if (!res) { return; }
					if (!byRes[res]) { byRes[res] = []; }
					byRes[res].push(s);
				});
				return byRes;
			},
		};

		// Add default english translations
		videojs.addLanguage('en', {
			'Quality': 'Quality',
			'Full': 'Full',
			'Auto': 'Auto',
		});

		const MenuItem = videojs.getComponent('MenuItem');

		class ResolutionMenuItem extends MenuItem {
			call_count = 0;

			constructor(player, options) {
				let label = methods.res_label(options.res);
				if (options.res === 'Auto' && player.activeHlsRes) {
					label = player.localize('Auto') + ` (${player.activeHlsRes}p)`;
				}
				options.label = label;
				options.selected = (options.res.toString() === player.getCurrentRes().toString());

				super(player, options);

				this.resolution = options.res;

				this.on(['click', 'tap'], this.onClick);

				this.on(player, 'changeRes', () => {
					let is_selected_now = false;
					const is_hls = player.qualityLevels && player.qualityLevels().length > 0;

					if (is_hls) {
						if (player.getCurrentRes() === 'Auto') {
							is_selected_now = (this.resolution === 'Auto');
							if (this.resolution === 'Auto' && player.activeHlsRes) {
								this.updateLabel(player.localize('Auto') + ` (${player.activeHlsRes}p)`);
							} else if (this.resolution === 'Auto') {
								this.updateLabel(player.localize('Auto'));
							}
						} else {
							is_selected_now = (this.resolution.toString() === player.getCurrentRes().toString());
							if (this.resolution === 'Auto') {
								this.updateLabel(player.localize('Auto'));
							}
						}
					} else {
						is_selected_now = this.resolution.toString() === player.getCurrentRes().toString();
					}

					this.selected(is_selected_now);
					this.call_count = 0;
				});
			}

			updateLabel(text) {
				const textEl = this.el().querySelector('.vjs-menu-item-text');
				if (textEl) {
					textEl.innerHTML = text;
				} else {
					this.el().innerHTML = text;
				}
			}

			onClick() {
				if (this.call_count > 0) { return; }
				this.player().manualResolutionSelected = true;
				this.player().changeRes(this.resolution);
				this.call_count++;
			}
		}

		class ResolutionTitleMenuItem extends MenuItem {
			constructor(player, options) {
				super(player, options);
				this.off('click');
			}
		}

		const MenuButton = videojs.getComponent('MenuButton');

		class ResolutionSelector extends MenuButton {
			constructor(player, options) {
				player.availableRes = options.available_res;
				options.name = 'resolutionSelector';
				super(player, options);
				this.on('mouseenter', this.updateMenuAlignment);
				this.on('click', this.updateMenuAlignment);
			}

			updateMenuAlignment() {
				const menu = this.menu;
				if (!menu) { return; }

				const menuEl = menu.el();
				const buttonEl = this.el();
				const playerEl = this.player().el();

				// Reset alignment
				menuEl.classList.remove('vjs-menu-align-right', 'vjs-menu-align-left');

				// Wait for it to be visible to get dimensions
				window.requestAnimationFrame(() => {
					const menuRect = menuEl.getBoundingClientRect();
					const playerRect = playerEl.getBoundingClientRect();

					if (menuRect.right > playerRect.right) {
						menuEl.classList.add('vjs-menu-align-right');
					} else if (menuRect.left < playerRect.left) {
						menuEl.classList.add('vjs-menu-align-left');
					}
				});
			}

			buildCSSClass() {
				return 'vjs-res-button ' + super.buildCSSClass();
			}

			createItems() {
				const player = this.player();
				const items = [];

				// 1. Native HLS/DASH Support via qualityLevels
				if (player.qualityLevels && player.qualityLevels().length > 0) {
					const levels = player.qualityLevels();
					items.push(new ResolutionMenuItem(player, { res: 'Auto', selectable: true }));

					let resMap = {};
					for (let i = 0; i < levels.length; i++) {
						let height = levels[i].height;
						if (height && !resMap[height]) {
							resMap[height] = true;
							items.push(new ResolutionMenuItem(player, { res: height, selectable: true }));
						}
					}

					items.sort((a, b) => {
						if (a.resolution === 'Auto') return -1;
						if (b.resolution === 'Auto') return 1;
						return parseInt(b.resolution, 10) - parseInt(a.resolution, 10);
					});

					items.unshift(new ResolutionTitleMenuItem(player, {
						el: videojs.dom.createEl('li', {
							className: 'vjs-menu-title vjs-res-menu-title',
							innerHTML: player.localize('Quality'),
						}),
					}));
					return items;
				}

				// 2. Static Source Swapping — flat list of resolutions.
				// Codec compatibility for a given resolution is already
				// resolved automatically when player.availableRes was built.
				for (const current_res in player.availableRes) {
					if ('length' === current_res) {
						continue;
					}
					items.push(new ResolutionMenuItem(player, { res: current_res, selectable: true }));
				}

				items.sort((a, b) => {
					if ('undefined' === typeof a.resolution) {
						return -1;
					} else if (a.resolution === player.localize('Full')) {
						return -1;
					} else if (b.resolution === player.localize('Full')) {
						return 1;
					}
					return parseInt(b.resolution, 10) - parseInt(a.resolution, 10);
				});

				items.unshift(new ResolutionTitleMenuItem(player, {
					el: videojs.dom.createEl('li', {
						className: 'vjs-menu-title vjs-res-menu-title',
						innerHTML: player.localize('Quality'),
					}),
				}));

				return items;
			}
		}

		videojs.registerPlugin('resolutionSelector', function (options) {
			const player = this;

			// Cleanup existing button if it exists
			const controlBar = player.getChild('controlBar');
			if (controlBar) {
				const existing = controlBar.getChild('resolutionSelector');
				if (existing) {
					controlBar.removeChild(existing);
					existing.dispose();
				}
			}

			// Reset player data
			player.currentRes = '';

			const sources = this.options_.sources || [];

			player.getCurrentRes = function () {
				return player.currentRes || (sources[0] ? (sources[0].resolution || sources[0]['data-res']) : '') || '';
			};

			if (!this.el().firstChild || !this.el().firstChild.canPlayType) {
				return;
			}

			const source_groups = options.source_groups || {};
			const has_source_groups = source_groups && Object.keys(source_groups).length > 0;

			// Flatten every source across every codec group into one list —
			// quality selection stays resolution-only; when a resolution has
			// multiple codec candidates, changeRes() hands all of them to
			// the browser as <source> elements and lets its native fallback
			// choose (see changeRes below).
			const flat_sources = has_source_groups
				? Object.keys(source_groups).flatMap((groupId) => source_groups[groupId].sources || [])
				: sources;

			const available_res = { length: 0 };
			const sources_by_res = methods.group_sources_by_resolution(flat_sources);

			for (const current_res in sources_by_res) {
				available_res.length++;
				available_res[current_res] = sources_by_res[current_res];

				if (current_res === player.localize('Full')) {
					player.off('loadedmetadata', player.updateFullResLabel);
					player.updateFullResLabel = function () {
						if (!Number.isNaN(player.videoHeight())) {
							const resMenu = player.controlBar && player.controlBar.getChild('resolutionSelector');
							if (resMenu) {
								const fullResEl = resMenu.$('li.vjs-menu-item').find((el) => el.textContent.includes(player.localize('Full')));
								if (fullResEl) {
									fullResEl.innerHTML = `${player.videoHeight()}p`;
								}
							}
						}
					};
					player.on('loadedmetadata', player.updateFullResLabel);
				}
			}

			player.changeRes = function (target_resolution) {
				const current_res = player.getCurrentRes();
				if (current_res === target_resolution) {
					return;
				}

				const has_hls_levels = player.qualityLevels && player.qualityLevels().length > 0;
				if (has_hls_levels) {
					const qLevels = player.qualityLevels();

					// 1. Enable matching tracks first to prevent any transition state with 0 enabled tracks (stalls ABR)
					for (let i = 0; i < qLevels.length; i++) {
						const level = qLevels[i];
						let match = true;

						if (target_resolution !== 'Auto') {
							const level_res = level.height || level.width;
							if (level_res && String(level_res) !== String(target_resolution)) {
								match = false;
							}
						}

						if (match) {
							level.enabled = true;
						}
					}

					// 2. Disable non-matching tracks only after target tracks are enabled
					for (let i = 0; i < qLevels.length; i++) {
						const level = qLevels[i];
						let match = true;

						if (target_resolution !== 'Auto') {
							const level_res = level.height || level.width;
							if (level_res && String(level_res) !== String(target_resolution)) {
								match = false;
							}
						}

						if (!match) {
							level.enabled = false;
						}
					}

					player.currentRes = target_resolution;
					player.trigger('changeRes');
					return;
				}

				const candidates = player.availableRes[target_resolution] || player.availableRes[target_resolution.toString()];

				if (!candidates || !candidates.length) {
					return;
				}
				const targetVideo = player.el().firstChild;
				const is_paused = player.paused();
				const current_time = player.currentTime();
				let canvas;

				if ('none' === targetVideo.preload) {
					targetVideo.preload = 'metadata';
				}

				if (current_time > 0 && !is_paused) {
					player.pause();
				}

				if (current_time !== 0) {
					canvas = document.createElement('canvas');
					canvas.className = 'videopack_temp_thumb';
					canvas.width = (targetVideo.videoWidth > targetVideo.videoHeight) ? targetVideo.offsetWidth : (targetVideo.videoWidth / targetVideo.videoHeight) * targetVideo.offsetHeight;
					canvas.height = (targetVideo.videoWidth > targetVideo.videoHeight) ? (targetVideo.videoHeight / targetVideo.videoWidth) * targetVideo.offsetWidth : targetVideo.offsetHeight;
					// Positioned absolutely over the video so it actually masks
					// the black/poster flash during the source swap, instead of
					// just flowing into the DOM after it.
					canvas.style.position = 'absolute';
					canvas.style.top = '0';
					canvas.style.left = '0';
					canvas.style.pointerEvents = 'none';
					canvas.style.zIndex = '5';
					const topOffset = Math.round((targetVideo.offsetHeight - canvas.height) / 2);
					if (topOffset > 2) { canvas.style.top = `${topOffset}px`; }
					const leftOffset = Math.round((targetVideo.offsetWidth - canvas.width) / 2);
					if (leftOffset > 2) { canvas.style.left = `${leftOffset}px`; }
					const context = canvas.getContext('2d');
					context.drawImage(targetVideo, 0, 0, canvas.width, canvas.height);
					targetVideo.parentNode.appendChild(canvas);

					player.one('loadstart', function () {
						player.hasStarted(true);
					});
				}

				// Hand every candidate at this resolution to the browser as
				// real <source> elements (ordered by codec efficiency, most
				// efficient first — see group_sources_by_resolution above)
				// and let its native resource-selection algorithm choose,
				// rather than deciding via a one-shot canPlayType() guess.
				// This also gets us automatic fallback to the next candidate
				// if the chosen one fails to actually load, which a static
				// pick can't do. Only <source> children are removed, so
				// <track> (captions) elements are left untouched.
				Array.from(targetVideo.querySelectorAll('source')).forEach((el) => el.remove());
				candidates.forEach((source) => {
					const sourceEl = document.createElement('source');
					sourceEl.src = source.src;
					sourceEl.type = source.type;
					targetVideo.appendChild(sourceEl);
				});
				targetVideo.load();
				player.one('loadedmetadata', function () {
					if (current_time > 0) {
						player.currentTime(current_time);
					}
					if (!is_paused) {
						player.play();
					}
				});
				player.one('seeked', function () {
					if (current_time !== 0 && canvas) {
						canvas.parentNode.removeChild(canvas);
					}
				});

				player.currentRes = target_resolution;
				player.trigger('changeRes');
			};

			const resolutionSelector = new ResolutionSelector(player, { available_res });

			let hls_rebuild_timer = null;
			const onQualityLevelsChanged = function(event) {
				const qLevels = player.qualityLevels();

				if (qLevels.length > 0) {
					// Debounce rebuild so we capture all discovered levels before updating the menu
					if (hls_rebuild_timer) {
						clearTimeout(hls_rebuild_timer);
					}
					hls_rebuild_timer = setTimeout(() => {
						player.currentRes = player.currentRes || 'Auto'; // Default to auto

						// Robustly rebuild the MenuButton's child menu
						if (resolutionSelector.menu) {
							resolutionSelector.removeChild(resolutionSelector.menu);
						}
						resolutionSelector.menu = resolutionSelector.createMenu();
						resolutionSelector.addChild(resolutionSelector.menu);

						// Force display the button now that we have multiple levels
						resolutionSelector.removeClass('vjs-hidden');
						resolutionSelector.el().classList.remove('vjs-hidden');
					}, 50);
				}

				// Update active resolution display
				if (qLevels.selectedIndex >= 0) {
					const activeLevel = qLevels[qLevels.selectedIndex];
					if (activeLevel) {
						player.activeHlsRes = activeLevel.height;
						player.trigger('changeRes'); // Triggers UI update in ResolutionMenuItem
					}
				}
			};

			player.ready(() => {
				try {
					if (player.qualityLevels) {
						const ql = player.qualityLevels();
						ql.on('addqualitylevel', onQualityLevelsChanged);
						ql.on('change', onQualityLevelsChanged);

						// If the levels are already populated (e.g. from cache or fast load), initialize the menu immediately.
						if (ql.length > 0) {
							onQualityLevelsChanged({ type: 'init' });
						}
					}
				} catch (e) {
					// Silent catch to preserve error-free script execution
				}

				const controlBar = player.getChild('controlBar');
				if (controlBar) {
					controlBar.addChild(resolutionSelector, {}, 11);

					const has_static = available_res && available_res.length > 1;
					const has_hls_init = player.qualityLevels && player.qualityLevels().length > 0;

					if (!has_static && !has_hls_init) {
						resolutionSelector.addClass('vjs-hidden');
					}

					const default_res = options.default_res;

					// Don't auto-set resolution if HLS levels are populated (let VHS handle it)
					if (default_res && (!player.qualityLevels || player.qualityLevels().length === 0)) {
						player.changeRes(default_res);
					}
				}
			});
		});
	}(window.videojs));
}
