/**
 * Videopack Frontend JS.
 *
 * @package Video-Embed-Thumbnail-Generator
 */

/* global videojs, mejs, videopack_l10n, gtag, ga, __gaTracker, _gaq */

(function () {
	'use strict';

	/**
	 * ============================================================================
	 * MediaElement.js Plugins (Speed and Source Chooser)
	 * ============================================================================
	 */
	if ('undefined' !== typeof window.mejs) {
		/**
		 * Speed plugin
		 *
		 * This feature creates a button to speed media in different levels.
		 */

		// Translations (English required)
		mejs.i18n.en['mejs.speed-rate'] = 'Speed Rate';

		// Feature configuration
		Object.assign(mejs.MepDefaults, {
			/**
			 * The speeds media can be accelerated
			 *
			 * Supports an array of float values or objects with format
			 * [{name: 'Slow', value: '0.75'}, {name: 'Normal', value: '1.00'}, ...]
			 * @type {{String[]|Object[]}}
			 */
			speeds: ['2.00', '1.50', '1.25', '1.00', '0.75'],
			/**
			 * @type {String}
			 */
			defaultSpeed: '1.00',
			/**
			 * @type {String}
			 */
			speedChar: 'x',
			/**
			 * @type {?String}
			 */
			speedText: null
		});

		Object.assign(
			MediaElementPlayer.prototype,
			{
				buildspeed: function buildspeed(player, controls, layers, media) {
					const
						t = this,
						isNative = t.media.rendererName !== null && /(native|html5)/i.test(t.media.rendererName)
						;

					if (!isNative) {
						return;
					}

					const
						speeds = [],
						speedTitle = mejs.Utils.isString(t.options.speedText) ? t.options.speedText : mejs.i18n.t('mejs.speed-rate'),
						getSpeedNameFromValue = (value) => {
							for (let i = 0, total = speeds.length; i < total; i++) {
								if (speeds[i].value === value) {
									return speeds[i].name;
								}
							}
						}
						;

					let
						playbackSpeed,
						defaultInArray = false
						;

					for (let i = 0, total = t.options.speeds.length; i < total; i++) {
						const s = t.options.speeds[i];

						if (typeof s === 'string') {
							speeds.push({
								name: `${s}${t.options.speedChar}`,
								value: s
							});

							if (s === t.options.defaultSpeed) {
								defaultInArray = true;
							}
						}
						else {
							speeds.push(s);
							if (s.value === t.options.defaultSpeed) {
								defaultInArray = true;
							}
						}
					}

					if (!defaultInArray) {
						speeds.push({
							name: t.options.defaultSpeed + t.options.speedChar,
							value: t.options.defaultSpeed
						});
					}

					speeds.sort((a, b) => {
						return parseFloat(b.value) - parseFloat(a.value);
					});

					t.cleanspeed(player);

					player.speedButton = document.createElement('div');
					player.speedButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}speed-button`;
					player.speedButton.innerHTML = `<button type="button" aria-controls="${t.id}" title="${speedTitle}" ` +
						`aria-label="${speedTitle}" tabindex="0">${getSpeedNameFromValue(t.options.defaultSpeed)}</button>` +
						`<div class="${t.options.classPrefix}speed-selector ${t.options.classPrefix}offscreen">` +
						`<ul class="${t.options.classPrefix}speed-selector-list"></ul>` +
						`</div>`;

					t.addControlElement(player.speedButton, 'speed');

					for (let i = 0, total = speeds.length; i < total; i++) {

						const inputId = `${t.id}-speed-${speeds[i].value}`;

						player.speedButton.querySelector('ul').innerHTML += `<li class="${t.options.classPrefix}speed-selector-list-item">` +
							`<input class="${t.options.classPrefix}speed-selector-input" type="radio" name="${t.id}_speed"` +
							`disabled="disabled" value="${speeds[i].value}" id="${inputId}"  ` +
							`${(speeds[i].value === t.options.defaultSpeed ? ' checked="checked"' : '')}/>` +
							`<label for="${inputId}" class="${t.options.classPrefix}speed-selector-label` +
							`${(speeds[i].value === t.options.defaultSpeed ? ` ${t.options.classPrefix}speed-selected` : '')}">` +
							`${speeds[i].name}</label>` +
							`</li>`;
					}

					playbackSpeed = t.options.defaultSpeed;

					player.speedSelector = player.speedButton.querySelector(`.${t.options.classPrefix}speed-selector`);

					const
						inEvents = ['mouseenter', 'focusin'],
						outEvents = ['mouseleave', 'focusout'],
						// Enable inputs after they have been appended to controls to avoid tab and up/down arrow focus issues
						radios = player.speedButton.querySelectorAll('input[type="radio"]'),
						labels = player.speedButton.querySelectorAll(`.${t.options.classPrefix}speed-selector-label`)
						;

					/**
					 * Store a reference to the radio buttons to prevent a scope bug in keyboard events
					 * when multiple MediaElement players are on the same page. Otherwise these keyboard
					 * events would always control the first speed button instance on the page.
					 */
					player.speedRadioButtons = radios;

					// hover or keyboard focus
					for (let i = 0, total = inEvents.length; i < total; i++) {
						player.speedButton.addEventListener(inEvents[i], () => {
							mejs.Utils.removeClass(player.speedSelector, `${t.options.classPrefix}offscreen`);
							player.speedSelector.style.height = player.speedSelector.querySelector('ul').offsetHeight;
							player.speedSelector.style.top = `${(-1 * parseFloat(player.speedSelector.offsetHeight))}px`;
						});
					}

					for (let i = 0, total = outEvents.length; i < total; i++) {
						player.speedSelector.addEventListener(outEvents[i], function () {
							mejs.Utils.addClass(this, `${t.options.classPrefix}offscreen`);
						});
					}

					for (let i = 0, total = radios.length; i < total; i++) {
						const radio = radios[i];
						radio.disabled = false;
						radio.addEventListener('click', function () {
							const
								self = this,
								newSpeed = self.value
								;

							playbackSpeed = newSpeed;
							media.playbackRate = parseFloat(newSpeed);
							player.speedButton.querySelector('button').innerHTML = (getSpeedNameFromValue(newSpeed));
							const selected = player.speedButton.querySelectorAll(`.${t.options.classPrefix}speed-selected`);
							for (let i = 0, total = selected.length; i < total; i++) {
								mejs.Utils.removeClass(selected[i], `${t.options.classPrefix}speed-selected`);
							}

							self.checked = true;
							const siblings = mejs.Utils.siblings(self, (el) => mejs.Utils.hasClass(el, `${t.options.classPrefix}speed-selector-label`));
							for (let j = 0, total = siblings.length; j < total; j++) {
								mejs.Utils.addClass(siblings[j], `${t.options.classPrefix}speed-selected`);
								mejs.Utils.addClass(siblings[j].parentElement, `${t.options.classPrefix}speed-selected`);
							}
						});
					}

					for (let i = 0, total = labels.length; i < total; i++) {
						labels[i].addEventListener('click', function () {
							const
								radio = mejs.Utils.siblings(this, (el) => el.tagName === 'INPUT')[0],
								event = mejs.Utils.createEvent('click', radio)
								;
							radio.dispatchEvent(event);
						});
					}

					t.options.keyActions.push({
						/*
						* Need to listen for both because keyActions dispatches
						* based on e.which || e.keyCode instead of e.key, so we
						* get the same value for comma as for less than.
						*/
						keys: [60, 188], // "<" & ","
						action: (player, media, key, event) => {
							if (event.key != '<')
								return;

							const _radios = player.speedRadioButtons;
							for (let i = 0; i < _radios.length - 1; i++) {
								if (_radios[i].checked) {
									const nextRadio = _radios[i + 1];
									nextRadio.dispatchEvent(mejs.Utils.createEvent('click', nextRadio));
									break;
								}
							}
						}
					}, {
						keys: [62, 190], // ">" & "."
						action: (player, media, key, event) => {
							if (event.key != '>')
								return;

							const _radios = player.speedRadioButtons;
							for (let i = 1; i < _radios.length; i++) {
								if (_radios[i].checked) {
									const prevRadio = _radios[i - 1];
									prevRadio.dispatchEvent(mejs.Utils.createEvent('click', prevRadio));
									break;
								}
							}
						}
					});

					//Allow up/down arrow to change the selected radio without changing the volume.
					player.speedSelector.addEventListener('keydown', (e) => {
						e.stopPropagation();
					});

					media.addEventListener('loadedmetadata', () => {
						if (playbackSpeed) {
							media.playbackRate = parseFloat(playbackSpeed);
						}
					});
				},
				/**
				 * Feature destructor.
				 *
				 * Always has to be prefixed with `clean` and the name that was used in MepDefaults.features list
				 * @param {MediaElementPlayer} player
				 */
				cleanspeed: function cleanspeed(player) {
					if (player) {
						if (player.speedButton) {
							player.speedButton.parentNode.removeChild(player.speedButton);
						}
						if (player.speedSelector) {
							player.speedSelector.parentNode.removeChild(player.speedSelector);
						}
					}
				}
			});

		/**
		 * Source chooser plugin
		 *
		 * This feature creates a button to speed media in different levels.
		 */

		// Translations (English required)
		mejs.i18n.en['mejs.source-chooser'] = 'Source Chooser';

		// Feature configuration
		Object.assign(mejs.MepDefaults, {
			/**
			 * @type {?String}
			 */
			sourcechooserText: null,
			/**
			 * @type {?Object}
			 */
			source_groups: null
		});

		Object.assign(MediaElementPlayer.prototype, {

			/**
			 * Feature constructor.
			 *
			 * Always has to be prefixed with `build` and the name that will be used in MepDefaults.features list
			 * @param {MediaElementPlayer} player
			 * @param {HTMLElement} controls
			 * @param {HTMLElement} layers
			 * @param {HTMLElement} media
			 */
			buildsourcechooser(player, controls, layers, media) {

				const
					t = this,
					sourceTitle = mejs.Utils.isString(t.options.sourcechooserText) ? t.options.sourcechooserText : mejs.i18n.t('mejs.source-chooser'),
					sources = [],
					children = t.mediaFiles ? t.mediaFiles : t.node.children
					;

				// add to list
				let hoverTimeout;

				for (let i = 0, total = children.length; i < total; i++) {
					const s = children[i];

					if (t.mediaFiles) {
						sources.push(s);
					} else if (s.nodeName === 'SOURCE') {
						sources.push(s);
					}
				}

				if (sources.length <= 1) {
					return;
				}

				player.sourcechooserButton = document.createElement('div');
				player.sourcechooserButton.className = `${t.options.classPrefix}button ${t.options.classPrefix}sourcechooser-button`;
				player.sourcechooserButton.innerHTML =
					`<button type="button" role="button" aria-haspopup="true" aria-owns="${t.id}" title="${sourceTitle}" aria-label="${sourceTitle}" tabindex="0">` +
					`<span class="videopack-icons gear"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 15.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zM19.4 13c0-.3.1-.6.1-1s0-.7-.1-1l2.1-1.7c.2-.2.2-.4.1-.6l-2-3.5c-.1-.2-.3-.3-.5-.2l-2.5 1c-.5-.4-1.1-.7-1.7-.9l-.4-2.6c0-.2-.2-.4-.5-.4h-4c-.3 0-.5.2-.5.4l-.4 2.6c-.6.2-1.2.5-1.7.9l-2.5-1c-.2-.1-.4 0-.5.2l-2 3.5c-.1.2-.1.4.1.6l2.1 1.7c-.1.3-.1.6-.1 1s0 .7.1 1l-2.1 1.7c-.2.2-.2.4-.1.6l2 3.5c.1.2.3.3.5.2l2.5-1c.5.4 1.1.7 1.7.9l.4 2.6c0 .2.2.4.5.4h4c.3 0 .5-.2.5-.4l.4-2.6c.6-.2 1.2-.5 1.7-.9l2.5 1c.2.1.4 0 .5-.2l2-3.5c.1-.2.1-.4-.1-.6L19.4 13z" /></svg></span>` +
					`</button>` +
					`<div class="${t.options.classPrefix}sourcechooser-selector ${t.options.classPrefix}offscreen" role="menu" aria-expanded="false" aria-hidden="true"><ul></ul></div>`;

				t.addControlElement(player.sourcechooserButton, 'sourcechooser');

				let source_groups = t.options.source_groups || null;

				// The player's own video variables (including source_groups) are
				// embedded directly on its .videopack-player element as
				// data-player-vars (see Player::get_player_start_html()) —
				// read straight from there rather than an ID-keyed global lookup,
				// which never matched for AJAX-rendered players anyway.
				if (!source_groups) {
					const wrapper = t.node.closest('.videopack-player');
					if (wrapper && wrapper.dataset.playerVars) {
						try {
							const vars = JSON.parse(wrapper.dataset.playerVars);
							source_groups = vars.source_groups || null;
						} catch {
							// Ignore malformed data.
						}
					}
				}

				const hasSourceGroups = source_groups && Object.keys(source_groups).length > 0;

				// Flatten every source across every codec group into one
				// list, then auto-pick the best-supported codec for each
				// resolution — quality selection is resolution-only; codec
				// compatibility is resolved automatically, the same way a
				// plain <source> fallback list would.
				const flatSources = hasSourceGroups
					? Object.keys(source_groups).flatMap((groupId) => source_groups[groupId].sources || [])
					: sources;
				const bestByRes = player.pickBestSourcesByResolution(flatSources, media);

				if (hasSourceGroups) {
					bestByRes.forEach((source) => {
						const isCurrent = media.src === source.src;
						player.addSourceButton(source, source.label, source.type, isCurrent);
					});
				} else {
					for (let i = 0, total = sources.length; i < total; i++) {
						const src = sources[i];
						if (src.type !== undefined && typeof media.canPlayType === 'function') {
							player.addSourceButton(src, src.title, src.type, media.src === src.src);
						}
					}
				}

				// hover
				player.sourcechooserButton.addEventListener('mouseover', () => {
					clearTimeout(hoverTimeout);
					player.showSourcechooserSelector();
				});
				player.sourcechooserButton.addEventListener('mouseout', () => {
					hoverTimeout = setTimeout(() => {
						player.hideSourcechooserSelector();
					}, 0);
				});

				// keyboard menu activation
				player.sourcechooserButton.addEventListener('keydown', (e) => {

					if (t.options.keyActions.length) {
						const keyCode = e.which || e.keyCode || 0;

						switch (keyCode) {
							case 32: // space
								if (!mejs.MediaFeatures.isFirefox) { // space sends the click event in Firefox
									player.showSourcechooserSelector();
								}
								player.sourcechooserButton.querySelector('input[type=radio]:checked').focus();
								break;
							case 13: // enter
								player.showSourcechooserSelector();
								player.sourcechooserButton.querySelector('input[type=radio]:checked').focus();
								break;
							case 27: // esc
								player.hideSourcechooserSelector();
								player.sourcechooserButton.querySelector('button').focus();
								break;
							default:
								return true;
						}

						e.preventDefault();
						e.stopPropagation();
					}
				});

				// close menu when tabbing away
				player.sourcechooserButton.addEventListener('focusout', mejs.Utils.debounce(() => {
					// Safari triggers focusout multiple times
					// Firefox does NOT support e.relatedTarget to see which element
					// just lost focus, so wait to find the next focused element
					setTimeout(() => {
						const parent = document.activeElement.closest(`.${t.options.classPrefix}sourcechooser-selector`);
						if (!parent) {
							// focus is outside the control; close menu
							player.hideSourcechooserSelector();
						}
					}, 0);
				}, 100));

				const radios = player.sourcechooserButton.querySelectorAll('input[type=radio]');

				for (let i = 0, total = radios.length; i < total; i++) {
					// handle clicks to the source radio buttons
					radios[i].addEventListener('click', function () {
						player.manualResolutionSelected = true;
						t.changeRes(this.value);
					});
				}

				// Handle click so that screen readers can toggle the menu
				player.sourcechooserButton.querySelector('button').addEventListener('click', function () {
					if (mejs.Utils.hasClass(mejs.Utils.siblings(this, `.${t.options.classPrefix}sourcechooser-selector`), `${t.options.classPrefix}offscreen`)) {
						player.showSourcechooserSelector();
						player.sourcechooserButton.querySelector('input[type=radio]:checked').focus();
					} else {
						player.hideSourcechooserSelector();
					}
				});

			},

			/**
			 * Picks one source per distinct resolution from a flat sources
			 * array (which may span multiple codec/format groups). When a
			 * resolution is offered by more than one codec, the browser's
			 * own playback support decides which file backs it (preferring
			 * "probably" over "maybe" over unsupported, falling back to the
			 * first-configured one on a tie) — codec compatibility is
			 * resolved automatically rather than exposed as a user choice.
			 *
			 * @param {Array} sources All sources across every codec group.
			 * @param {HTMLMediaElement} mediaEl Element used to test codec support.
			 * @return {Array} Deduplicated sources, one per resolution, sorted descending.
			 */
			pickBestSourcesByResolution(sources, mediaEl) {
				const byRes = {};
				sources.forEach((s) => {
					const res = s.resolution || (s.dataset && s.dataset.res) || s['data-res'];
					if (!res) {
						return;
					}
					if (!byRes[res]) {
						byRes[res] = [];
					}
					byRes[res].push(s);
				});

				const rank = (type) => {
					if (!type || !mediaEl || typeof mediaEl.canPlayType !== 'function') {
						return 0;
					}
					const support = mediaEl.canPlayType(type);
					if (support === 'probably') {
						return 2;
					}
					if (support === 'maybe') {
						return 1;
					}
					return 0;
				};

				// Object.keys/for-in always iterate integer-like string keys
				// (e.g. resolutions "1080", "720") in ascending numeric order
				// regardless of insertion order, so an explicit descending
				// sort is needed here rather than relying on key order.
				return Object.keys(byRes)
					.map((res) => {
						const candidates = byRes[res];
						return candidates.length === 1 ? candidates[0] : [...candidates].sort((a, b) => rank(b.type) - rank(a.type))[0];
					})
					.sort((a, b) => {
						const resA = a.resolution || (a.dataset && a.dataset.res) || a['data-res'];
						const resB = b.resolution || (b.dataset && b.dataset.res) || b['data-res'];
						return parseInt(resB, 10) - parseInt(resA, 10);
					});
			},

			/**
			 *
			 * @param {String} src
			 * @param {String} label
			 * @param {String} type
			 * @param {Boolean} isCurrent
			 */
			addSourceButton(src, label, type, isCurrent) {
				const t = this;
				const sourceUrl = src.src;
				// Prioritize data-res, fallback to the title (passed as label), and finally the src URL.
				let resolutionLabel = label || sourceUrl;
				if (src.dataset && src.dataset.res) {
					resolutionLabel = `${src.dataset.res}p`;
				} else if (src.resolution) {
					resolutionLabel = `${src.resolution}p`;
				}

				// Create a unique ID from the source URL to avoid collisions.
				const inputId = `${t.id}_sourcechooser_${sourceUrl.replace(/[^a-zA-Z0-9]/g, '')}`;

				const target = t.sourcechooserButton.querySelector('ul');
				const li = document.createElement('li');
				if (isCurrent) {
					li.className = 'sourcechooser-selected';
				}
				li.innerHTML = `<input type="radio" name="${t.id}_sourcechooser" id="${inputId}" ` +
					`role="menuitemradio" value="${sourceUrl}" ${(isCurrent ? 'checked="checked"' : '')} aria-selected="${isCurrent}"/>` +
					`<label for="${inputId}" aria-hidden="true">${resolutionLabel}</label>`;
				target.appendChild(li);

			},

			/**
			 *
			 * @param {String} src
			 */
			changeRes(src) {
				const t = this;
				const media = t.media;

				if (t.sourcechooserButton) {
					const radios = t.sourcechooserButton.querySelectorAll('input[type=radio]');
					let selectedRadio = null;

					for (let i = 0; i < radios.length; i++) {
						if (radios[i].value === src) {
							selectedRadio = radios[i];
						}
						radios[i].setAttribute('aria-selected', false);
						radios[i].removeAttribute('checked');
						const li = radios[i].closest('li');
						if (li) {
							li.classList.remove('sourcechooser-selected');
						}
					}

					if (selectedRadio) {
						selectedRadio.setAttribute('aria-selected', true);
						selectedRadio.checked = true;
						selectedRadio.closest('li').classList.add('sourcechooser-selected');
					}
				}

				if (media.getSrc() !== src) {
					let currentTime = media.currentTime;
					const paused = media.paused;

					// Freeze-frame overlay to mask the black/poster flash
					// during the source swap, matching the other players.
					const videoEl = t.node;
					let canvas = null;
					if (currentTime > 0 && videoEl && videoEl.videoWidth) {
						canvas = document.createElement('canvas');
						canvas.className = 'videopack_temp_thumb';
						canvas.width = videoEl.videoWidth || videoEl.offsetWidth || 640;
						canvas.height = videoEl.videoHeight || videoEl.offsetHeight || 360;
						canvas.style.position = 'absolute';
						canvas.style.top = '0';
						canvas.style.left = '0';
						canvas.style.width = '100%';
						canvas.style.height = '100%';
						canvas.style.pointerEvents = 'none';
						canvas.style.zIndex = '5';

						try {
							const context = canvas.getContext('2d');
							context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
							const container = t.container && t.container.get ? t.container.get(0) : t.container;
							(container || videoEl.parentNode).appendChild(canvas);
						} catch {
							canvas = null;
						}
					}

					const cleanupCanvas = () => {
						if (canvas && canvas.parentNode) {
							canvas.parentNode.removeChild(canvas);
						}
					};

					// Wait for the actual 'seeked' event to remove the canvas
					// rather than removing it right after issuing the seek:
					// setCurrentTime() is async, and the frame at the restored
					// position isn't actually rendered yet when 'canplay' fires,
					// so removing the overlay there re-exposes a stale/black
					// frame for a moment.
					//
					// Listening on the raw <video> node (not media.addEventListener)
					// deliberately: MEJS's native-renderer wrapper only forwards
					// DOM events to media's listeners while an internal "isActive"
					// flag is true (set by its own show()/hide()), and that flag
					// can still be false in the brief window right after setSrc()
					// recreates the renderer — a 'seeked' firing in that window
					// would otherwise be silently dropped and never clean up.
					const seekedCleanupHandler = () => {
						cleanupCanvas();
						videoEl.removeEventListener('seeked', seekedCleanupHandler);
					};

					const canPlayAfterSourceSwitchHandler = () => {
						if (currentTime > 0) {
							media.setCurrentTime(currentTime);
						} else {
							cleanupCanvas();
						}
						if (!paused) {
							media.play();
						}
						videoEl.removeEventListener('canplay', canPlayAfterSourceSwitchHandler);
					};

					media.pause();
					media.setSrc(src);
					media.load();
					videoEl.addEventListener('canplay', canPlayAfterSourceSwitchHandler);
					videoEl.addEventListener('seeked', seekedCleanupHandler);
				}
			},


			/**
			 *
			 */
			hideSourcechooserSelector() {

				const t = this;

				if (t.sourcechooserButton === undefined || !t.sourcechooserButton.querySelector('input[type=radio]')) {
					return;
				}

				const
					selector = t.sourcechooserButton.querySelector(`.${t.options.classPrefix}sourcechooser-selector`),
					radios = selector.querySelectorAll('input[type=radio]')
					;
				selector.setAttribute('aria-expanded', false);
				selector.setAttribute('aria-hidden', true);
				mejs.Utils.addClass(selector, `${t.options.classPrefix}offscreen`);

				// make radios not focusable
				for (let i = 0, total = radios.length; i < total; i++) {
					radios[i].setAttribute('tabindex', '-1');
				}
			},

			/**
			 *
			 */
			showSourcechooserSelector() {

				const t = this;

				if (t.sourcechooserButton === undefined || !t.sourcechooserButton.querySelector('input[type=radio]')) {
					return;
				}

				const
					selector = t.sourcechooserButton.querySelector(`.${t.options.classPrefix}sourcechooser-selector`),
					radios = selector.querySelectorAll('input[type=radio]')
					;
				selector.setAttribute('aria-expanded', true);
				selector.setAttribute('aria-hidden', false);
				mejs.Utils.removeClass(selector, `${t.options.classPrefix}offscreen`);

				// make radios not focusable
				for (let i = 0, total = radios.length; i < total; i++) {
					radios[i].setAttribute('tabindex', '0');
				}
			}
		});
	}
}());
