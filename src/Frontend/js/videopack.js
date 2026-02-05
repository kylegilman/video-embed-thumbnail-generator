/**
 * Videopack Frontend JS.
 *
 * @package Video-Embed-Thumbnail-Generator
 */

/* global videojs, mejs, videopack_l10n, gtag, ga, __gaTracker, _gaq */

( function() {
	'use strict';

	/**
	 * ============================================================================
	 * MediaElement.js Plugins (Speed and Source Chooser)
	 * ============================================================================
	 */
	if ( 'undefined' !== typeof window.mejs ) {
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
					radio.addEventListener('click', function() {
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
					labels[i].addEventListener('click',  function () {
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
								const nextRadio = _radios[i+1];
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
								const prevRadio = _radios[i-1];
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
			buildsourcechooser (player, controls, layers, media)  {

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
					`<button type="button" role="button" aria-haspopup="true" aria-owns="${t.id}" title="${sourceTitle}" aria-label="${sourceTitle}" tabindex="0"></button>` +
					`<div class="${t.options.classPrefix}sourcechooser-selector ${t.options.classPrefix}offscreen" role="menu" aria-expanded="false" aria-hidden="true"><ul></ul></div>`;

				t.addControlElement(player.sourcechooserButton, 'sourcechooser');

				for (let i = 0, total = sources.length; i < total; i++) {
					const src = sources[i];
					if (src.type !== undefined && typeof media.canPlayType === 'function') {
						player.addSourceButton(src.src, src.title, src.type, media.src === src.src);
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
					radios[i].addEventListener('click', function() {
						// set aria states
						this.setAttribute('aria-selected', true);
						this.checked = true;

						const otherRadios = this.closest(`.${t.options.classPrefix}sourcechooser-selector`).querySelectorAll('input[type=radio]');

						for (let j = 0, radioTotal = otherRadios.length; j < radioTotal; j++) {
							if (otherRadios[j] !== this) {
								otherRadios[j].setAttribute('aria-selected', false);
								otherRadios[j].removeAttribute('checked');
							}
						}

						const src = this.value;

						if (media.getSrc() !== src) {
							let currentTime = media.currentTime;

							const
								paused = media.paused,
								canPlayAfterSourceSwitchHandler = () => {
									if (!paused) {
										media.setCurrentTime(currentTime);
										media.play();
									}
									media.removeEventListener('canplay', canPlayAfterSourceSwitchHandler);
								}
							;

							media.pause();
							media.setSrc(src);
							media.load();
							media.addEventListener('canplay', canPlayAfterSourceSwitchHandler);
						}
					});
				}

				// Handle click so that screen readers can toggle the menu
				player.sourcechooserButton.querySelector('button').addEventListener('click', function() {
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
			addSourceButton (src, label, type, isCurrent)  {
				const t = this;
				if (label === '' || label === undefined) {
					label = src;
				}
				type = type.split('/')[1];

				t.sourcechooserButton.querySelector('ul').innerHTML += `<li>` +
					`<input type="radio" name="${t.id}_sourcechooser" id="${t.id}_sourcechooser_${label}${type}" ` +
						`role="menuitemradio" value="${src}" ${(isCurrent ? 'checked="checked"' : '')} aria-selected="${isCurrent}"/>` +
					`<label for="${t.id}_sourcechooser_${label}${type}" aria-hidden="true">${label} (${type})</label>` +
				`</li>`;

				t.adjustSourcechooserBox();
			},

			/**
			 *
			 */
			adjustSourcechooserBox ()  {
				const t = this;
				// adjust the size of the outer box
				t.sourcechooserButton.querySelector(`.${t.options.classPrefix}sourcechooser-selector`).style.height =
					`${parseFloat(t.sourcechooserButton.querySelector(`.${t.options.classPrefix}sourcechooser-selector ul`).offsetHeight)}px`;
			},

			/**
			 *
			 */
			hideSourcechooserSelector ()  {

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
			showSourcechooserSelector ()  {

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
		init: function() {
			document.querySelectorAll( '.videopack-player' ).forEach( ( element ) => {
				this.initPlayer( element );
			} );

			// Initialize galleries
			document.querySelectorAll( '.videopack-gallery-wrapper' ).forEach( ( element ) => {
				this.initGallery( element );
			} );


			// Fallback for MediaElement.js players initialized by other plugins/themes.
			if ( typeof window.mejs !== 'undefined' ) {
				// This is a bit of a hack to catch MEJS players initialized after our script runs.
				const originalSuccess = window.mejs.MepDefaults.success;
				window.mejs.MepDefaults.success = ( mediaElement, domObject, player ) => {
					originalSuccess( mediaElement, domObject, player );
					const playerWrapper = domObject.closest( '.videopack-player' );
					if ( playerWrapper && ! playerWrapper.dataset.videopackInitialized && window.videopack.player_data ) {
						this.setupVideo( playerWrapper, window.videopack.player_data[ `videopack_player_${ playerWrapper.dataset.id }` ] );
					}
				};
			}
		},

		/**
		 * Initialize a single player.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 */
		initPlayer: function( playerWrapper ) {
			let playerId  = playerWrapper.dataset.id;

			// Handle gallery player IDs which have a prefix.
			if ( String( playerId ).startsWith( 'gallery_' ) ) {
				playerId = `gallery_${ playerId.split( '_' )[ 1 ] }`;
			}
			const videoVars = window.videopack.player_data && window.videopack.player_data[ `videopack_player_${ playerId }` ];

			if ( ! videoVars ) {
				return;
			}

			if ( videoVars.player_type.startsWith( 'Video.js' ) ) {
				this.loadVideoJS( playerWrapper, videoVars );
			} else if ( videoVars.player_type === 'WordPress Default' ) {
				// ME.js is often auto-initialized by WP. We'll set up our hooks after it's ready.
				// The success callback hook in init() should handle this.
				// If it's already initialized, we set it up now.
				if ( playerWrapper.querySelector( '.mejs-container' ) ) {
					this.setupVideo( playerWrapper, videoVars );
				}
			}
		},

		/**
		 * Load and initialize a Video.js player.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 * @param {object} videoVars      The video variables.
		 */
		loadVideoJS: function( playerWrapper, videoVars ) {
			const playerId = playerWrapper.dataset.id;
			const videoElement = playerWrapper.querySelector( 'video' );

			if ( ! videoElement ) {
				return;
			}
			const videoElementId = videoElement.id;

			const videojsOptions = {
				language: videoVars.locale,
				responsive: true,
				userActions: { hotkeys: true },
			};

			if ( true === videoVars.autoplay ) {
				videojsOptions.autoplay = 'any';
			}

			if ( true === videoVars.resize || true === videoVars.fullwidth ) {
				videojsOptions.fluid = true;
			} else {
				videojsOptions.fluid = false;
			}

			if ( videojsOptions.fluid && videoVars.width && ( typeof videoVars.width !== 'string' || -1 === videoVars.width.indexOf( '%' ) ) && videoVars.height && videoVars.fixed_aspect ) {
				videojsOptions.aspectRatio = `${ videoVars.width }:${ videoVars.height }`;
			}

			if ( true === videoVars.nativecontrolsfortouch ) {
				videojsOptions.nativeControlsForTouch = true;
			}

			if ( true === videoVars.playback_rate ) {
				videojsOptions.playbackRates = [ 0.5, 1, 1.25, 1.5, 2 ];
			}

			if ( videoVars.skip_buttons && videoVars.skip_buttons.forward && videoVars.skip_buttons.backward ) {
				videojsOptions.controlBar = {
					skipButtons: {
						forward: Number( videoVars.skip_buttons.forward ),
						backward: Number( videoVars.skip_buttons.backward ),
					},
				};
			}

			const sources = Array.from( videoElement.querySelectorAll( 'source' ) );
			const hasResolutions = sources.some( ( s ) => s.dataset.res );
			const source_groups = videoVars.source_groups || {};

			if ( hasResolutions || ( source_groups && Object.keys(source_groups).length > 1 ) ) {
				if ( videojs.VERSION.split( '.' )[ 0 ] >= 5 ) {
					videojsOptions.plugins = videojsOptions.plugins || {};
					videojsOptions.plugins.resolutionSelector = {
						force_types: [ 'video/mp4' ],
						source_groups: source_groups,
					};
					const defaultResSource = sources.find( ( s ) => true === s.dataset.default_res );
					if ( defaultResSource ) {
						videojsOptions.plugins.resolutionSelector.default_res = defaultResSource.dataset.res;
					}
				} else {
					// eslint-disable-next-line no-console
					console.warn( 'Videopack: Video.js version ' + videojs.VERSION + ' is loaded by another application. Resolution selection is not compatible with this older version and has been disabled.' );
				}
			}

			if ( videojs.getPlayer( videoElementId ) ) {
				videojs.getPlayer( videoElementId ).dispose();
			}

			videojs( videoElement, videojsOptions ).ready( () => {
				this.setupVideo( playerWrapper, videoVars );
			} );
		},

		/**
		 * Common setup for any player type after initialization.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 * @param {object} videoVars The video variables.
		 */
		setupVideo: function( playerWrapper, videoVars ) {
			if ( playerWrapper.dataset.videopackInitialized ) {
				return;
			}

			const playerId = playerWrapper.dataset.id;

			// Move watermark and meta into the player.
			const watermark = document.getElementById( `video_${ playerId }_watermark` );
			if ( watermark ) {
				playerWrapper.prepend( watermark );
				watermark.style.display = 'block';
			}

			const meta = document.getElementById( `video_${ playerId }_meta` );
			if ( meta ) {
				playerWrapper.prepend( meta );
				meta.style.display = 'block';
			}

			// Setup share functionality.
			const shareIcon = playerWrapper.querySelector( '.videopack-share-icon' );
			if ( shareIcon ) {
				shareIcon.addEventListener( 'click', () => this.toggleShare( playerWrapper ) );
				playerWrapper.querySelector( '.videopack-click-trap' ).addEventListener( 'click', () => this.toggleShare( playerWrapper ) );
			}

			if ( true !== videoVars.right_click ) {
				playerWrapper.addEventListener( 'contextmenu', (e) => e.preventDefault() );
			}

			// Setup "start at" functionality.
			const embedWrapper = playerWrapper.querySelector( '.videopack-embed-wrapper' );
			if ( embedWrapper ) {
				embedWrapper.querySelector( '.videopack-start-at-enable' ).addEventListener( 'change', () => this.setStartAt( playerWrapper ) );
				embedWrapper.querySelector( '.videopack-start-at' ).addEventListener( 'change', () => this.changeStartAt( playerWrapper ) );
			}

			const downloadLink = playerWrapper.querySelector( '.download-link' );
			if ( downloadLink && downloadLink.hasAttribute( 'download' ) && downloadLink.dataset.alt_link ) {
				downloadLink.addEventListener( 'click', ( e ) => {
					e.preventDefault();
					this.checkDownloadLink( downloadLink );
				} );
			}

			if ( videoVars.player_type.startsWith( 'Video.js' ) ) {
				this.setupVideoJSPlayer( playerWrapper, videoVars );
			} else if ( videoVars.player_type === 'WordPress Default' ) {
				this.setupMEJSPlayer( playerWrapper, videoVars );
			}

			// Resize logic.
			if ( true === videoVars.resize || 'automatic' === videoVars.auto_res || window.location.search.includes( 'videopack[enable]=true' ) ) {
				this.resizeVideo( playerId );

				const target = playerWrapper.parentElement;

				if ( ! target ) {
					return;
				}

				let resizeId;
				const debouncedResize = () => {
					clearTimeout( resizeId );
					resizeId = setTimeout( () => this.resizeVideo( playerId ), 200 );
				};

				const resizeObserver = new ResizeObserver( debouncedResize );
				resizeObserver.observe( target );

				// Cleanup observer on player disposal.
				if ( videoVars.player_type.startsWith( 'Video.js' ) ) {
					const player = videojs.getPlayer( 'videopack_video_' + playerId );
					if ( player ) {
						player.on( 'dispose', () => {
							resizeObserver.disconnect();
						} );
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
		setupVideoJSPlayer: function( playerWrapper, videoVars ) {
			const playerId = playerWrapper.dataset.id;
			const videoElement = playerWrapper.querySelector( 'video' );

			if ( ! videoElement ) {
				return;
			}

			const player = videojs.getPlayer( videoElement.id );

			if ( ! player ) {
				return;
			}

			// Move watermark inside video element for proper positioning.
			const watermark = document.getElementById( `video_${ playerId }_watermark` );
			if ( watermark ) {
				player.el().appendChild( watermark );
			}

			// Touch device checks.
			if ( videojs.browser.TOUCH_ENABLED ) {
				if ( true === videoVars.nativecontrolsfortouch && videojs.browser.IS_ANDROID ) {
					player.bigPlayButton.hide();
				}
				if ( ! player.controls() && ! player.muted() ) {
					player.controls( true );
				}
			}

			player.on( 'loadedmetadata', () => {
				const played = playerWrapper.dataset.played || 'not played';

				if ( 'not played' === played ) {
					// Set default captions/subtitles.
					const trackElements = player.options_.tracks;
					if ( trackElements ) {
						player.textTracks().tracks_.forEach( ( track, index ) => {
							if ( trackElements[ index ] && trackElements[ index ].default && 'showing' !== track.mode ) {
								track.mode = 'showing';
							}
						} );
					}

					if ( videoVars.start ) {
						player.currentTime( this.convertFromTimecode( videoVars.start ) );
					}
				}

				if ( videoVars.set_volume ) {
					player.volume( videoVars.set_volume );
				}

				if ( true === videoVars.autoplay && player.paused() ) {
					const promise = player.play();
					if ( 'undefined' !== typeof promise ) {
						promise.catch( () => {
							// Autoplay was prevented.
						} );
					}
				}
			} );

			player.on( 'play', () => {
				player.focus();

				if ( videoVars.endofvideooverlay ) {
					player.posterImage.el().style.display = 'none';
				}

				playerWrapper.parentElement.classList.remove( 'meta-bar-visible' );

				if ( true === videoVars.pauseothervideos ) {
					const players = videojs.getPlayers();
					for ( const otherPlayerId in players ) {
						if ( players.hasOwnProperty( otherPlayerId ) ) {
							const otherPlayer = players[ otherPlayerId ];
							if ( otherPlayer && player.id() !== otherPlayer.id() && ! otherPlayer.paused() && ! otherPlayer.autoplay() ) {
								otherPlayer.pause();
							}
						}
					}
				}

				this.videoCounter( playerId, 'play' );

				player.on( 'timeupdate', () => {
					const percent = Math.round( ( player.currentTime() / player.duration() ) * 100 );
					if ( ! playerWrapper.dataset['25'] && percent >= 25 && percent < 50 ) {
						playerWrapper.dataset['25'] = true;
						this.videoCounter( playerId, '25' );
					} else if ( ! playerWrapper.dataset['50'] && percent >= 50 && percent < 75 ) {
						playerWrapper.dataset['50'] = true;
						this.videoCounter( playerId, '50' );
					} else if ( ! playerWrapper.dataset['75'] && percent >= 75 && percent < 100 ) {
						playerWrapper.dataset['75'] = true;
						this.videoCounter( playerId, '75' );
					}
				} );
			} );

			player.on( 'pause', () => {
				playerWrapper.parentElement.classList.add( 'meta-bar-visible' );
				this.videoCounter( playerId, 'pause' );
			} );
			player.on( 'seeked', () => this.videoCounter( playerId, 'seek' ) );

			player.on( 'ended', () => {
				if ( ! playerWrapper.dataset.end ) {
					playerWrapper.dataset.end = true;
					this.videoCounter( playerId, 'end' );
				}
				setTimeout( () => {
					if ( player.loadingSpinner && player.loadingSpinner.el() ) {
						player.loadingSpinner.el().style.display = 'none';
					}
				}, 250 );

				if ( videoVars.endofvideooverlay ) {
					const posterImage = player.posterImage.el();
					if ( posterImage ) {
						posterImage.style.backgroundImage = `url(${ videoVars.endofvideooverlay })`;
						posterImage.style.display = 'block';
					}
				}
			} );

			player.on( 'fullscreenchange', () => {
				this.resizeVideo( playerId );
			} );
		},

		/**
		 * Setup for a MediaElement.js player.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 * @param {object} videoVars The video variables.
		 */
		setupMEJSPlayer: function( playerWrapper, videoVars ) {
			const playerId = playerWrapper.dataset.id;
			const video = playerWrapper.querySelector( 'video' );
			const mejsId = playerWrapper.querySelector( '.mejs-container' ).id;

			if ( ! video || ! mejsId || ! mejs.players[ mejsId ] ) {
				return;
			}

			const player = mejs.players[ mejsId ];

			// Move watermark.
			const watermark = document.getElementById( `video_${ playerId }_watermark` );
			if ( watermark ) {
				playerWrapper.querySelector( '.mejs-container' ).append( watermark );
			}

			const played = playerWrapper.dataset.played || 'not played';
			if ( 'not played' === played ) {
				// Default captions.
				if ( player.tracks && player.tracks.length > 0 ) {
					const defaultTrack = document.querySelector( `#${ mejsId } track[default]` );
					if ( defaultTrack ) {
						const defaultLang = defaultTrack.getAttribute( 'srclang' ).toLowerCase();
						const trackToSet = player.tracks.find( ( t ) => t.srclang === defaultLang );
						if ( trackToSet ) {
							player.setTrack( trackToSet.trackId );
						}
					}
				}

				if ( videoVars.start ) {
					video.setCurrentTime( this.convertFromTimecode( videoVars.start ) );
				}
			}

			video.addEventListener( 'loadedmetadata', () => {
				if ( videoVars.set_volume ) {
					video.volume = videoVars.set_volume;
				}
				if ( true === videoVars.mute ) {
					video.setMuted( true );
				}
				if ( false === videoVars.pauseothervideos ) {
					player.options.pauseOtherPlayers = false;
				}
			} );

			video.addEventListener( 'play', () => {
				document.getElementById( mejsId ).focus();
				playerWrapper.parentElement.classList.remove( 'meta-bar-visible' );
				this.videoCounter( playerId, 'play' );

				video.addEventListener( 'timeupdate', () => {
					const percent = Math.round( ( video.currentTime / video.duration ) * 100 );
					if ( ! playerWrapper.dataset['25'] && percent >= 25 && percent < 50 ) {
						playerWrapper.dataset['25'] = true;
						this.videoCounter( playerId, '25' );
					} else if ( ! playerWrapper.dataset['50'] && percent >= 50 && percent < 75 ) {
						playerWrapper.dataset['50'] = true;
						this.videoCounter( playerId, '50' );
					} else if ( ! playerWrapper.dataset['75'] && percent >= 75 && percent < 100 ) {
						playerWrapper.dataset['75'] = true;
						this.videoCounter( playerId, '75' );
					}
				} );
			} );

			video.addEventListener( 'pause', () => {
				playerWrapper.parentElement.classList.add( 'meta-bar-visible' );
				this.videoCounter( playerId, 'pause' );
			} );
			video.addEventListener( 'seeked', () => this.videoCounter( playerId, 'seek' ) );

			video.addEventListener( 'ended', () => {
				if ( ! playerWrapper.dataset.end ) {
					playerWrapper.dataset.end = true;
					this.videoCounter( playerId, 'end' );
				}
				if ( videoVars.endofvideooverlay ) {
					const poster = playerWrapper.querySelector( '.mejs-poster' );
					if ( poster ) {
						poster.style.backgroundImage = `url(${ videoVars.endofvideooverlay })`;
						poster.style.display = 'block';
					}
					video.addEventListener( 'seeking', () => {
						if ( 0 !== video.currentTime ) {
							if ( poster ) {
								poster.style.display = 'none';
							}
						}
					}, { once: true } );
				}
			} );
		},

		/**
		 * Resize video player.
		 *
		 * @since 5.0.0
		 * @param {number} playerId The player ID.
		 */
		resizeVideo: function( playerId ) {
			const playerWrapper = document.querySelector( `.videopack-player[data-id="${ playerId }"]` );
			if ( ! playerWrapper ) {
				return;
			}
			const videoVars = this.player_data[ `videopack_player_${ playerId }` ];
			if ( ! videoVars ) {
				return;
			}

			let setWidth = videoVars.width;
			const setHeight = videoVars.height;
			const aspectRatio = Math.round( ( setHeight / setWidth ) * 1000 ) / 1000;
			const wrapperParent = playerWrapper.parentElement;

			let parentWidth;
			if ( wrapperParent.tagName === 'BODY' ) { // Embedded video
				parentWidth = window.innerWidth;
				setWidth = window.innerWidth;
			} else {
				parentWidth = wrapperParent.offsetWidth;
				if ( true === videoVars.fullwidth ) {
					setWidth = parentWidth;
				}
			}

			if ( parentWidth < setWidth ) {
				setWidth = parentWidth;
			}

			if ( setWidth > 0 && setWidth < 30000 ) {
				// Automatic resolution switching logic
				if ( 'automatic' === videoVars.auto_res ) {
					this.setAutomaticResolution( playerId, setWidth, aspectRatio );
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
		setAutomaticResolution: function( playerId, currentWidth, aspectRatio ) {
			// This function requires a resolution chooser plugin to be active for the player.
			// It is left as a placeholder for brevity as it depends on specific plugin implementations.
		},

		/**
		 * Send event to Google Analytics.
		 *
		 * @since 5.0.0
		 * @param {string} event The event name.
		 * @param {string} label The event label.
		 */
		sendGoogleAnalytics: function( event, label ) {
			if ( 'undefined' !== typeof gtag ) {
				gtag( 'event', event, { event_category: 'Videos', event_label: label } );
			} else if ( 'undefined' !== typeof ga ) {
				ga( 'send', 'event', 'Videos', event, label );
			} else if ( 'undefined' !== typeof __gaTracker ) {
				__gaTracker( 'send', 'event', 'Videos', event, label );
			} else if ( 'undefined' !== typeof _gaq ) {
				_gaq.push( [ '_trackEvent', 'Videos', event, label ] );
			}
		},

		/**
		 * Count video plays and send data to server.
		 *
		 * @since 5.0.0
		 * @param {number} playerId The player ID.
		 * @param {string} event    The video event (play, pause, etc.).
		 */
		videoCounter: function( playerId, event ) {
			const playerWrapper = document.querySelector( `.videopack-player[data-id="${ playerId }"]` );
			const videoVars = this.player_data[ `videopack_player_${ playerId }` ];

			if ( ! videoVars ) {
				return;
			}

			const viewCountWrapper = playerWrapper.closest( '.videopack-wrapper' );
			const viewCountElement = viewCountWrapper ? viewCountWrapper.querySelector( '.viewcount' ) : null;

			let changed = false;
			const played = playerWrapper.dataset.played || 'not played';

			if ( 'play' === event ) {
				if ( 'not played' === played ) { // Play start
					if ( videoVars.countable ) {
						changed = true;
					}
					playerWrapper.dataset.played = 'played';
					this.sendGoogleAnalytics( videopack_l10n.playstart, videoVars.title );
				} else { // Resume
					this.sendGoogleAnalytics( videopack_l10n.resume, videoVars.title );
				}
			} else if ( [ 'seek', 'pause', 'end' ].includes( event ) ) {
				if ( 'end' === event && videoVars.countable ) {
					changed = true;
				}
				this.sendGoogleAnalytics( videopack_l10n[ event ], videoVars.title );
			} else if ( ! isNaN( event ) ) { // Quarter-play
				if ( videoVars.countable ) {
					changed = true;
				}
				this.sendGoogleAnalytics( `${ event }%`, videoVars.title );
			}

			if ( changed && false !== videoVars.count_views ) {
				const countCondition = videoVars.count_views === 'quarters' ||
					( videoVars.count_views === 'start_complete' && ( 'play' === event || 'end' === event ) ) ||
					( videoVars.count_views === 'start' && 'play' === event );

				if ( countCondition ) {
					fetch( `${ videopack_l10n.rest_url }videopack/v1/count-play`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify( {
							post_id: videoVars.attachment_id,
							video_event: event,
							show_views: !!viewCountElement,
						} ),
					} )
						.then( ( response ) => {
							if ( ! response.ok ) {
								throw new Error( `HTTP error! status: ${ response.status }` );
							}
							return response.json();
						} )
						.then( ( data ) => {
							if ( 'play' === event && data.view_count && viewCountElement ) {
								viewCountElement.innerHTML = data.view_count;
							}
						} )
						.catch( ( error ) => {
							console.error( 'Videopack REST API Error:', error );
						} );
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
		convertToTimecode: function( time ) {
			const minutes = Math.floor( time / 60 );
			let seconds = Math.round( ( time - ( minutes * 60 ) ) * 100 ) / 100;
			let timeDisplay = '';

			timeDisplay += minutes < 10 ? `0${ minutes }` : minutes;
			timeDisplay += ':';
			timeDisplay += seconds < 10 ? `0${ seconds }` : seconds;

			return timeDisplay;
		},

		/**
		 * Convert timecode string to seconds.
		 *
		 * @since 5.0.0
		 * @param {string} timecode Timecode string.
		 * @return {number} Time in seconds.
		 */
		convertFromTimecode: function( timecode ) {
			const timecodeArray = timecode.split( ':' ).reverse();
			let totalSeconds = 0;

			if ( timecodeArray[ 0 ] ) {
				totalSeconds += parseFloat( timecodeArray[ 0 ] );
			}
			if ( timecodeArray[ 1 ] ) {
				totalSeconds += parseFloat( timecodeArray[ 1 ] ) * 60;
			}
			if ( timecodeArray[ 2 ] ) {
				totalSeconds += parseFloat( timecodeArray[ 2 ] ) * 3600;
			}

			return totalSeconds;
		},

		/**
		 * Toggle the share/embed section.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 */
		toggleShare: function( playerWrapper ) {
			const videoVars = this.player_data[ `videopack_player_${ playerWrapper.dataset.id }` ];
			const shareIcon = playerWrapper.querySelector( '.videopack-share-icon' );
			const embedWrapper = playerWrapper.querySelector( '.videopack-embed-wrapper' );
			const clickTrap = playerWrapper.querySelector( '.videopack-click-trap' );

			const isShareActive = shareIcon.classList.contains( 'vjs-icon-cancel' );

			if ( isShareActive ) {
				shareIcon.classList.remove( 'vjs-icon-cancel' );
				shareIcon.classList.add( 'vjs-icon-share' );
				embedWrapper.style.display = 'none';
				clickTrap.style.display = 'none';
			} else {
				shareIcon.classList.remove( 'vjs-icon-share' );
				shareIcon.classList.add( 'vjs-icon-cancel' );
				embedWrapper.style.display = 'block';
				clickTrap.style.display = 'block';
			}

			if ( videoVars.player_type.startsWith( 'Video.js' ) ) {
				const playerId = playerWrapper.dataset.id;
				const player = videojs.getPlayer( `videopack_video_${ playerId }` );
				if ( player ) {
					player.pause();
					const controls = player.hasStarted() ? player.controlBar.el() : player.bigPlayButton.el();
					if ( isShareActive ) {
						controls.style.display = '';
					} else {
						controls.style.display = 'none';
					}
				}
			} else if ( videoVars.player_type === 'WordPress Default' ) {
				const video = playerWrapper.querySelector( 'video' );
				if ( video ) {
					video.pause();
				}
				const overlayButton = playerWrapper.querySelector( '.mejs-overlay-button' );
				if ( overlayButton ) {
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
		checkDownloadLink: async function( downloadLink ) {
			const url = downloadLink.href;
			const altUrl = downloadLink.dataset.alt_link;

			try {
				const response = await fetch( url, { method: 'HEAD' } );
				if ( ! response.ok ) {
					throw new Error( 'Response not OK' );
				}
				const link = document.createElement( 'a' );
				link.href = url;
				link.setAttribute( 'download', '' );
				document.body.appendChild( link );
				link.click();
				document.body.removeChild( link );
			} catch ( error ) {
				if ( altUrl ) {
					window.location.href = altUrl;
				} else {
					// Optional: handle case where direct download fails and there's no altUrl
					console.error( 'Download failed and no alternative link available.' );
				}
			}
		},

		/**
		 * Set the "start at" time in the embed code from the current video time.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 */
		setStartAt: function( playerWrapper ) {
			const embedWrapper = playerWrapper.querySelector( '.videopack-embed-wrapper' );
			if ( embedWrapper.querySelector( '.videopack-start-at-enable' ).checked ) {
				const videoVars = this.player_data[ `videopack_player_${ playerWrapper.dataset.id }` ];
				let currentTime = 0;

				if ( videoVars.player_type.startsWith( 'Video.js' ) ) {
					const playerId = playerWrapper.dataset.id;
					const player = videojs.getPlayer( `videopack_video_${ playerId }` );
					if ( player ) {
						currentTime = player.currentTime();
					}
				} else if ( videoVars.player_type === 'WordPress Default' ) {
					const video = playerWrapper.querySelector( 'video' );
					if ( video ) {
						currentTime = video.currentTime;
					}
				}

				embedWrapper.querySelector( '.videopack-start-at' ).value = this.convertToTimecode( Math.floor( currentTime ) );
			}

			this.changeStartAt( playerWrapper );
		},

		/**
		 * Update the embed code with the "start at" time.
		 *
		 * @since 5.0.0
		 * @param {HTMLElement} playerWrapper The player wrapper element.
		 */
		changeStartAt: function( playerWrapper ) {
			const embedWrapper = playerWrapper.querySelector( '.videopack-embed-wrapper' );
			const embedCodeTextarea = embedWrapper.querySelector( '.videopack-embed-code' );
			const embedCode = embedCodeTextarea.value;

			const tempDiv = document.createElement( 'div' );
			tempDiv.innerHTML = embedCode;
			const iframe = tempDiv.querySelector( 'iframe' );
			if ( ! iframe ) {
				return;
			}

			let src = iframe.getAttribute( 'src' );
			if ( ! src ) {
				return;
			}

			src = src.replace( /&?videopack\[start\]=[^&]*/, '' );
			src = src.replace( /\?&/, '?' ).replace( /\?$/, '' );

			if ( embedWrapper.querySelector( '.videopack-start-at-enable' ).checked ) {
				const startTime = embedWrapper.querySelector( '.videopack-start-at' ).value;
				if ( startTime ) {
					const separator = src.includes( '?' ) ? '&' : '?';
					src += `${ separator }videopack[start]=${ encodeURIComponent( startTime ) }`;
				}
			}

			iframe.setAttribute( 'src', src );
			embedCodeTextarea.value = iframe.outerHTML;
		},

		/**
		 * ============================================================================
		 * Gallery Functions
		 * ============================================================================
		 */

		/**
		 * Initialize a single gallery.
		 * @param {HTMLElement} galleryWrapper The gallery wrapper element.
		 */
		initGallery: function( galleryWrapper ) {
			if ( galleryWrapper.dataset.videopackGalleryInitialized ) {
				return;
			}

			const gallerySettings = JSON.parse( galleryWrapper.dataset.gallerySettings || '{}' );
			// A better approach than setting data on the element would be a WeakMap, but for now this is fine.
			galleryWrapper.dataset.gallerySettingsCache = JSON.stringify( gallerySettings );

			// Store initial video data order for navigation.
			const initialVideoOrder = [];
			galleryWrapper.querySelectorAll( '.videopack-gallery-item' ).forEach( ( thumb ) => {
				initialVideoOrder.push( String( thumb.dataset.attachmentId ) );
			} );
			// See above note about WeakMap.
			galleryWrapper.dataset.currentVideosOrder = JSON.stringify( initialVideoOrder );
			galleryWrapper.dataset.currentPage = '1';
			const totalPages = galleryWrapper.querySelector( '.videopack-gallery-pagination' ) ? galleryWrapper.querySelectorAll( '.videopack-page-number-div' ).length : 1;
			galleryWrapper.dataset.totalPages = totalPages;

			// Event Listeners
			galleryWrapper.addEventListener( 'click', ( e ) => {
				const clickableArea = e.target.closest( '.gallery-item-clickable-area' );
				if ( clickableArea ) {
					this.handleGalleryThumbnailClick( e, galleryWrapper );
				}

				const pageButton = e.target.closest( '.videopack-gallery-pagination button' );
				if ( pageButton && ! pageButton.disabled ) {
					this.handleGalleryPaginationClick( e, galleryWrapper );
				}
			} );

			const popup = galleryWrapper.querySelector( '.videopack-modal-overlay' );
			popup.addEventListener( 'click', ( e ) => {
				if ( e.target.matches( '.modal-close, .videopack-modal-overlay' ) ) {
					this.closeGalleryPopup( popup );
				} else if ( e.target.matches( '.modal-next' ) ) {
					this.navigateGalleryPopup( 1, galleryWrapper );
				} else if ( e.target.matches( '.modal-previous' ) ) {
					this.navigateGalleryPopup( -1, galleryWrapper );
				}
			} );

			galleryWrapper.dataset.videopackGalleryInitialized = true;
		},

		handleGalleryThumbnailClick: function( e, galleryWrapper ) {
			e.preventDefault();
			const galleryItem = e.target.closest( '.videopack-gallery-item' );
			const attachmentId = galleryItem.dataset.attachmentId;
			const videoOrder = JSON.parse( galleryWrapper.dataset.currentVideosOrder );
			const videoIndex = videoOrder.indexOf( String( attachmentId ) );

			const videoData = window.videopack.player_data && window.videopack.player_data[ `videopack_player_gallery_${ attachmentId }` ];

			if ( videoData ) {
				this.openGalleryPopup( videoData, galleryWrapper, videoIndex );
			}
		},

		openGalleryPopup: function( videoData, galleryWrapper, videoIndex ) {
			const popup = galleryWrapper.querySelector( '.videopack-modal-overlay' );
			const playerContainer = popup.querySelector( '.modal-content' );
			const gallerySettings = JSON.parse( galleryWrapper.dataset.gallerySettingsCache || '{}' );
			let skinClass = gallerySettings.skin || 'vjs-default-skin';
			if ( skinClass === 'default' ) {
				skinClass = 'vjs-default-skin';
			}

			// Clean up any previous player
			if ( this.currentGalleryPlayer ) {
				if ( typeof this.currentGalleryPlayer.dispose === 'function' ) {
					this.currentGalleryPlayer.dispose();
				} else if ( typeof this.currentGalleryPlayer.remove === 'function' ) {
					this.currentGalleryPlayer.remove();
				}
				this.currentGalleryPlayer = null;
			}
			playerContainer.innerHTML = '';

			const playerId = videoData.id; // This is 'videopack_player_gallery_XXX'
			const attachmentId = videoData.attachment_id;
			const posterAttr = videoData.poster ? `poster="${ videoData.poster }"` : '';

			// Force autoplay for gallery popup.
			videoData.autoplay = true;

			// Create player HTML
			const playerHtml = `
				<div class="videopack-wrapper">
					<div class="videopack-player" data-id="gallery_${ attachmentId }">
						<video id="${ playerId }" class="videopack-video video-js ${ skinClass }" controls autoplay preload="auto" width="${ videoData.width }" height="${ videoData.height }" ${ posterAttr }>
							${ videoData.sources.map( ( source ) => `
								<source src="${ source.src }" type="${ source.type }" ${ source.resolution ? `data-res="${ source.resolution }"` : '' } />
							` ).join( '' ) }
						</video>
					</div>
				</div>
			`;
			playerContainer.innerHTML = playerHtml;

			const playerWrapper = playerContainer.querySelector( '.videopack-player' );

			if ( videoData.player_type && videoData.player_type.startsWith( 'Video.js' ) ) {
				this.initPlayer( playerWrapper );

				const checkPlayer = setInterval( () => {
					const player = videojs.getPlayer( playerId );
					if ( player ) {
						clearInterval( checkPlayer );
						this.currentGalleryPlayer = player;
						player.ready( () => {
							player.on( 'ended', () => {
								if ( gallerySettings.gallery_end === 'next' ) {
									this.navigateGalleryPopup( 1, galleryWrapper );
								}
								if ( gallerySettings.gallery_end === 'close' ) {
									this.closeGalleryPopup( popup );
								}
							} );
						} );
					}
				}, 100 );
			} else if ( videoData.player_type === 'WordPress Default' && typeof window.MediaElementPlayer !== 'undefined' ) {
				const settings = Object.assign( {}, window._wpmejsSettings || {} );
				settings.success = ( mediaElement, domObject, player ) => {
					this.currentGalleryPlayer = player;
					if ( ! playerWrapper.dataset.videopackInitialized ) {
						this.setupVideo( playerWrapper, videoData );
					}
					mediaElement.addEventListener( 'ended', () => {
						if ( gallerySettings.gallery_end === 'next' ) {
							this.navigateGalleryPopup( 1, galleryWrapper );
						}
						if ( gallerySettings.gallery_end === 'close' ) {
							this.closeGalleryPopup( popup );
						}
					} );
				};
				new MediaElementPlayer( playerId, settings );
			} else {
				this.setupVideo( playerWrapper, videoData );
				const videoElement = document.getElementById( playerId );
				if ( videoElement ) {
					this.currentGalleryPlayer = videoElement;
					videoElement.addEventListener( 'ended', () => {
						if ( gallerySettings.gallery_end === 'next' ) {
							this.navigateGalleryPopup( 1, galleryWrapper );
						}
						if ( gallerySettings.gallery_end === 'close' ) {
							this.closeGalleryPopup( popup );
						}
					} );
				}
			}

			galleryWrapper.dataset.currentGalleryAttachmentId = attachmentId;
			galleryWrapper.dataset.currentGalleryVideoIndex = videoIndex;

			popup.classList.add( 'is-visible' );
			popup.style.display = 'flex';

			// Update nav buttons visibility
			const videoOrder = JSON.parse( galleryWrapper.dataset.currentVideosOrder );
			const totalPages = parseInt( galleryWrapper.dataset.totalPages, 10 );
			const currentPage = parseInt( galleryWrapper.dataset.currentPage, 10 );

			const prevButton = popup.querySelector( '.modal-previous' );
			const nextButton = popup.querySelector( '.modal-next' );

			if ( videoIndex > 0 || currentPage > 1 ) {
				prevButton.style.display = 'block';
			} else {
				prevButton.style.display = 'none';
			}

			if ( videoIndex < videoOrder.length - 1 || currentPage < totalPages ) {
				nextButton.style.display = 'block';
			} else {
				nextButton.style.display = 'none';
			}
		},

		closeGalleryPopup: function( popup ) {
			if ( this.currentGalleryPlayer ) {
				if ( typeof this.currentGalleryPlayer.dispose === 'function' ) {
					this.currentGalleryPlayer.dispose();
				} else if ( typeof this.currentGalleryPlayer.remove === 'function' ) {
					this.currentGalleryPlayer.remove();
				} else if ( typeof this.currentGalleryPlayer.pause === 'function' ) {
					this.currentGalleryPlayer.pause();
				}
				this.currentGalleryPlayer = null;
			}
			popup.classList.remove( 'is-visible' );
			popup.style.display = 'none';
		},

		navigateGalleryPopup: function( direction, galleryWrapper ) {
			const currentIndex = parseInt( galleryWrapper.dataset.currentGalleryVideoIndex, 10 );
			const videoOrder = JSON.parse( galleryWrapper.dataset.currentVideosOrder );
			const currentPage = parseInt( galleryWrapper.dataset.currentPage, 10 );
			const totalPages = parseInt( galleryWrapper.dataset.totalPages, 10 );

			let nextIndex = currentIndex + direction;

			if ( nextIndex >= videoOrder.length && currentPage < totalPages ) {
				// Go to next page
				this.loadGalleryPage( currentPage + 1, galleryWrapper, 0 ); // Load next page and open first video
			} else if ( nextIndex < 0 && currentPage > 1 ) {
				// Go to previous page
				this.loadGalleryPage( currentPage - 1, galleryWrapper, -1 ); // Load prev page and open last video
			} else if ( nextIndex >= 0 && nextIndex < videoOrder.length ) {
				// Navigate within the current page
				const nextAttachmentId = videoOrder[ nextIndex ];
				const nextVideoData = window.videopack.player_data && window.videopack.player_data[ `videopack_player_gallery_${ nextAttachmentId }` ];

				if ( nextVideoData ) {
					this.openGalleryPopup( nextVideoData, galleryWrapper, nextIndex );
				}
			} else {
				// This case handles wrapping on single-page galleries or at the ends of a multi-page gallery
				if ( nextIndex < 0 ) {
					nextIndex = videoOrder.length - 1;
				} else if ( nextIndex >= videoOrder.length ) {
					nextIndex = 0;
				}
				const nextAttachmentId = videoOrder[ nextIndex ];
				const nextVideoData = window.videopack.player_data && window.videopack.player_data[ `videopack_player_gallery_${ nextAttachmentId }` ];

				if ( nextVideoData ) {
					this.openGalleryPopup( nextVideoData, galleryWrapper, nextIndex );
				}
			}
		},

		handleGalleryPaginationClick: function( e, galleryWrapper ) {
			e.preventDefault();
			const page = e.target.closest( 'button' ).dataset.page;
			this.loadGalleryPage( page, galleryWrapper );
		},

		loadGalleryPage: function( page, galleryWrapper, openVideoAtIndex = null ) {
			const gallerySettings = JSON.parse( galleryWrapper.dataset.gallerySettingsCache );
			const grid = galleryWrapper.querySelector( '.videopack-gallery-items' );
			const pagination = galleryWrapper.querySelector( '.videopack-gallery-pagination' );

			grid.style.opacity = 0.5; // Loading indicator

			const restUrl = new URL( videopack_l10n.rest_url + 'videopack/v1/video_gallery' );

			// Append gallery settings and page to URL params
			Object.keys( gallerySettings ).forEach( ( key ) => {
				if ( gallerySettings[ key ] !== null && gallerySettings[ key ] !== false && gallerySettings[ key ] !== '' ) {
					restUrl.searchParams.append( key, gallerySettings[ key ] );
				}
			} );
			restUrl.searchParams.append( 'page_number', page );

			fetch( restUrl )
				.then( ( response ) => response.json() )
				.then( ( data ) => {
					if ( data && data.videos ) {
						// Update caches
						const newVideoOrder = [];
						data.videos.forEach( ( video ) => {
							// Add data to global object for initPlayer
							window.videopack.player_data[ video.player_vars.id ] = video.player_vars;
							newVideoOrder.push( String( video.attachment_id ) );
						} );
						galleryWrapper.dataset.currentVideosOrder = JSON.stringify( newVideoOrder );
						galleryWrapper.dataset.currentPage = data.current_page;
						galleryWrapper.dataset.totalPages = data.max_num_pages;

						// Render new content
						this.renderGalleryThumbnails( data.videos, grid, gallerySettings );
						this.renderGalleryPagination( data.max_num_pages, data.current_page, pagination );

						if ( openVideoAtIndex !== null ) {
							let indexToOpen = openVideoAtIndex;
							if ( indexToOpen === -1 ) { // -1 means open the last one
								indexToOpen = data.videos.length - 1;
							}
							const videoToOpen = data.videos[ indexToOpen ];
							if ( videoToOpen ) {
								this.openGalleryPopup( videoToOpen.player_vars, galleryWrapper, indexToOpen );
							}
						}
					}
					grid.style.opacity = 1;
				} )
				.catch( ( error ) => {
					console.error( 'Error loading gallery page:', error );
					grid.style.opacity = 1;
				} );
		},

		renderGalleryThumbnails: function( videos, grid, settings ) {
			grid.innerHTML = '';
			let html = '';
			videos.forEach( ( video ) => {
				html += `
					<div class="gallery-thumbnail videopack-gallery-item" data-attachment-id="${ video.attachment_id }">
						<div class="gallery-item-clickable-area">
							<img src="${ video.poster_url }"
								 ${ video.poster_srcset ? `srcset="${ video.poster_srcset }"` : '' }
								 alt="${ video.title }">
							<div class="play-button-container ${ settings.skin || 'kg-video-js-skin' }">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
									<circle class="play-button-circle" cx="250" cy="250" r="230"/>
									<polygon class="play-button-triangle" points="374.68,250 188,142 188,358"/>
								</svg>
							</div>
							${ settings.gallery_title ? `
								<div class="video-title">
									<div class="video-title-background"></div>
									<span class="video-title-text">${ video.title }</span>
								</div>
							` : '' }
						</div>
					</div>
				`;
			} );
			grid.innerHTML = html;
		},

		renderGalleryPagination: function( maxPages, currentPage, pagination ) {
			pagination.innerHTML = '';
			if ( maxPages <= 1 ) {
				return;
			}
			let html = `
				<button
					class="videopack-pagination-arrow${ currentPage > 1 ? '' : ' videopack-hidden' }"
					data-page="${ currentPage - 1 }"
				>
					<span>&laquo;</span>
				</button>
			`;
			for ( let i = 1; i <= maxPages; i++ ) {
				html += `
					<div class="videopack-page-number-div">
						<button
							data-page="${ i }"
							class="videopack-page-number${ i === currentPage ? ' current-page' : '' }"
							${ i === currentPage ? 'disabled' : '' }
						>
							<span>${ i }</span>
						</button>
						<span class="videopack-pagination-separator">
							${ i === maxPages ? '' : '|' }
						</span>
					</div>
				`;
			}
			html += `
				<button
					class="videopack-pagination-arrow${ currentPage < maxPages ? '' : ' videopack-hidden' }"
					data-page="${ currentPage + 1 }"
				>
					<span>&raquo;</span>
				</button>
			`;
			pagination.innerHTML = html;
		},

	};

	// Expose the videopack object to the global scope, merging with any existing properties (like player_data).
	window.videopack = Object.assign( window.videopack || {}, videopack_obj );

	document.addEventListener( 'DOMContentLoaded', () => window.videopack.init() );
}() );
