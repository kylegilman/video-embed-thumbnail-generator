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
			sourcechooserText: null
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
					`<button type="button" role="button" aria-haspopup="true" aria-owns="${t.id}" title="${sourceTitle}" aria-label="${sourceTitle}" tabindex="0"><span class="videopack-icons gear"></span></button>` +
					`<div class="${t.options.classPrefix}sourcechooser-selector ${t.options.classPrefix}offscreen" role="menu" aria-expanded="false" aria-hidden="true"><ul></ul></div>`;

				t.addControlElement(player.sourcechooserButton, 'sourcechooser');

				let source_groups = null;
				if (window.videopack && window.videopack.player_data) {
					const wrapper = t.node.closest('.videopack-player');
					if (wrapper) {
						let id = wrapper.dataset.id;
						if (String(id).startsWith('gallery_')) {
							id = `gallery_${id.split('_')[1]}`;
						}
						const vars = window.videopack.player_data['videopack_player_' + id];
						if (vars) {
							source_groups = vars.source_groups;
						}
					}
				}

				const hasMultipleCodecs = source_groups && Object.keys(source_groups).length > 1;

				if (hasMultipleCodecs) {
					for (const codecId in source_groups) {
						const group = source_groups[codecId];
						const codecLi = document.createElement('li');
						codecLi.className = `${t.options.classPrefix}sourcechooser-codec-item`;
						const span = document.createElement('span');
						span.textContent = group.label || codecId;
						codecLi.appendChild(span);

						const subMenu = document.createElement('ul');
						subMenu.className = `${t.options.classPrefix}sourcechooser-submenu`;
						codecLi.appendChild(subMenu);

						subMenu.addEventListener('change', (e) => {
							if (e.target.tagName === 'INPUT') {
								player.currentCodec = codecId;
							}
						});

						t.sourcechooserButton.querySelector('ul').appendChild(codecLi);

						for (const groupSource of group.sources) {
							const isCurrent = media.src === groupSource.src;
							player.addSourceButton(groupSource, groupSource.label, groupSource.type, isCurrent, subMenu);
						}

						codecLi.addEventListener('mouseenter', () => {
							const allCodecItems = t.sourcechooserButton.querySelectorAll(`.${t.options.classPrefix}sourcechooser-codec-item`);
							allCodecItems.forEach((el) => {
								if (el !== codecLi) {
									el.classList.remove('mejs-submenu-open');
								}
							});

							const parentRect = codecLi.getBoundingClientRect();
							if (subMenu) {
								subMenu.style.visibility = 'hidden';
								subMenu.style.display = 'block';
								const subMenuWidth = subMenu.offsetWidth;
								subMenu.style.display = '';
								subMenu.style.visibility = '';

								if (parentRect.right + subMenuWidth > window.innerWidth && parentRect.left > subMenuWidth) {
									codecLi.classList.add('mejs-submenu-left');
								} else {
									codecLi.classList.remove('mejs-submenu-left');
								}
							}
						});

						codecLi.addEventListener('click', (e) => {
							if (e.target === codecLi || e.target === span) {
								e.preventDefault();
								e.stopPropagation();
								const wasOpen = codecLi.classList.contains('mejs-submenu-open');
								const allCodecItems = t.sourcechooserButton.querySelectorAll(`.${t.options.classPrefix}sourcechooser-codec-item`);
								allCodecItems.forEach((el) => {
									el.classList.remove('mejs-submenu-open');
								});
								if (!wasOpen) {
									codecLi.classList.add('mejs-submenu-open');
								}
							}
						});
					}
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
			 *
			 * @param {String} src
			 * @param {String} label
			 * @param {String} type
			 * @param {Boolean} isCurrent
			 */
			addSourceButton(src, label, type, isCurrent, container) {
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

				const target = container || t.sourcechooserButton.querySelector('ul');
				const li = document.createElement('li');
				if (isCurrent) {
					li.className = 'sourcechooser-selected';
				}
				li.innerHTML = `<input type="radio" name="${t.id}_sourcechooser" id="${inputId}" ` +
					`role="menuitemradio" value="${sourceUrl}" ${(isCurrent ? 'checked="checked"' : '')} aria-selected="${isCurrent}"/>` +
					`<label for="${inputId}" aria-hidden="true">${resolutionLabel}</label>`;
				target.appendChild(li);

				t.adjustSourcechooserBox();
			},

			/**
			 *
			 * @param {String} src
			 * @param {String} codec
			 */
			changeRes(src, codec) {
				const t = this;
				if (codec) {
					t.currentCodec = codec;
				}
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
					const canPlayAfterSourceSwitchHandler = () => {
						media.setCurrentTime(currentTime);
						if (!paused) {
							media.play();
						}
						media.removeEventListener('canplay', canPlayAfterSourceSwitchHandler);
					};

					media.pause();
					media.setSrc(src);
					media.load();
					media.addEventListener('canplay', canPlayAfterSourceSwitchHandler);
				}
			},

			/**
			 *
			 */
			adjustSourcechooserBox() {
				const t = this;
				// adjust the size of the outer box
				t.sourcechooserButton.querySelector(`.${t.options.classPrefix}sourcechooser-selector`).style.height =
					`${parseFloat(t.sourcechooserButton.querySelector(`.${t.options.classPrefix}sourcechooser-selector ul`).offsetHeight)}px`;
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
