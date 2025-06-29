/**
 * Videopack Frontend JS.
 *
 * @package Video-Embed-Thumbnail-Generator
 */

/* global videojs, mejs, videopack_l10n, gtag, ga, __gaTracker, _gaq */

( function( $ ) {
	'use strict';

	/**
	 * ============================================================================
	 * Video.js Quality Selector Plugin
	 * ============================================================================
	 */
	if ( 'undefined' !== typeof window.videojs && 'undefined' === typeof window.videojs.getPlugin( 'resolutionSelector' ) ) {
		( function( videojs ) {
			const methods = {
				res_label: function( res ) {
					return ( /^\d+$/.test( res ) ) ? res + 'p' : res;
				},
			};

			const MenuItem = videojs.getComponent( 'MenuItem' );
			class ResolutionMenuItem extends MenuItem {
				call_count = 0;

				constructor( player, options ) {
					options.label = methods.res_label( options.res );
					options.selected = ( options.res.toString() === player.getCurrentRes().toString() );

					super( player, options );

					this.resolution = options.res;
					this.on( [ 'click', 'tap' ], this.onClick );

					player.on( 'changeRes', () => {
						this.selected( this.resolution === player.getCurrentRes() );
						this.call_count = 0;
					} );
				}

				onClick() {
					if ( this.call_count > 0 ) {
						return;
					}
					this.player().changeRes( this.resolution );
					this.call_count++;
				}
			}

			class ResolutionTitleMenuItem extends MenuItem {
				constructor( player, options ) {
					super( player, options );
					this.off( 'click' );
				}
			}

			const MenuButton = videojs.getComponent( 'MenuButton' );
			class ResolutionSelector extends MenuButton {
				constructor( player, options ) {
					player.availableRes = options.available_res;
					super( player, options );
				}

				buildCSSClass() {
					return 'vjs-res-button ' + super.buildCSSClass();
				}

				createItems() {
					const player = this.player();
					const items = [];

					for ( const current_res in player.availableRes ) {
						if ( 'length' === current_res ) {
							continue;
						}
						items.push( new ResolutionMenuItem( player, { res: current_res, selectable: true } ) );
					}

					items.sort( ( a, b ) => {
						if ( 'undefined' === typeof a.resolution ) {
							return -1;
						} else if ( a.resolution === videopack_l10n.fullres ) {
							return -1;
						} else if ( b.resolution === videopack_l10n.fullres ) {
							return 1;
						}
						return parseInt( b.resolution, 10 ) - parseInt( a.resolution, 10 );
					} );

					items.unshift( new ResolutionTitleMenuItem( player, {
						el: videojs.dom.createEl( 'li', {
							className: 'vjs-menu-title vjs-res-menu-title',
							innerHTML: videopack_l10n.quality,
						} ),
					} ) );

					return items;
				}
			}

			videojs.registerPlugin( 'resolutionSelector', function( options ) {
				if ( ! this.el().firstChild.canPlayType ) {
					return;
				}

				const player = this;
				const sources = this.options_.sources;
				const available_res = { length: 0 };

				for ( let i = sources.length - 1; i >= 0; i-- ) {
					const source = sources[ i ];
					if ( ! source[ 'data-res' ] ) {
						continue;
					}
					const current_res = source[ 'data-res' ];
					if ( 'undefined' === typeof available_res[ current_res ] ) {
						available_res[ current_res ] = [];
						available_res.length++;
					}
					available_res[ current_res ].push( source );

					if ( current_res === videopack_l10n.fullres ) {
						player.on( 'loadedmetadata', function() {
							if ( ! Number.isNaN( player.videoHeight() ) ) {
								const resMenu = player.controlBar.getChild( 'resolutionSelector' );
								if ( resMenu ) {
									const fullResEl = resMenu.$( 'li.vjs-menu-item' ).find( ( el ) => el.textContent.includes( videopack_l10n.fullres ) );
									if ( fullResEl ) {
										fullResEl.innerHTML = `${ player.videoHeight() }p`;
									}
								}
							}
						} );
					}
				}

				if ( available_res.length < 2 ) {
					return;
				}

				player.getCurrentRes = function() {
					return player.currentRes || ( sources[ 0 ] ? sources[ 0 ][ 'data-res' ] : '' ) || '';
				};

				player.changeRes = function( target_resolution ) {
					if ( player.getCurrentRes() === target_resolution || ! player.availableRes || ! player.availableRes[ target_resolution ] ) {
						return;
					}

					const video = player.el().firstChild;
					const is_paused = player.paused();
					const current_time = player.currentTime();

					if ( 'none' === video.preload ) {
						video.preload = 'metadata';
					}

					if ( current_time > 0 && ! is_paused ) {
						player.pause();
					}

					if ( current_time !== 0 ) {
						const canvas = document.createElement( 'canvas' );
						canvas.className = 'videopack_temp_thumb';
						canvas.width = ( video.videoWidth > video.videoHeight ) ? video.offsetWidth : ( video.videoWidth / video.videoHeight ) * video.offsetHeight;
						canvas.height = ( video.videoWidth > video.videoHeight ) ? ( video.videoHeight / video.videoWidth ) * video.offsetWidth : video.offsetHeight;
						const topOffset = Math.round( ( video.offsetHeight - canvas.height ) / 2 );
						if ( topOffset > 2 ) { canvas.style.top = `${ topOffset }px`; }
						const leftOffset = Math.round( ( video.offsetWidth - canvas.width ) / 2 );
						if ( leftOffset > 2 ) { canvas.style.left = `${ leftOffset }px`; }
						const context = canvas.getContext( '2d' );
						context.drawImage( video, 0, 0, canvas.width, canvas.height );
						video.parentNode.appendChild( canvas );
					}

					player.src( player.availableRes[ target_resolution ] );
					player.one( 'loadedmetadata', function() {
						if ( current_time > 0 ) {
							player.currentTime( current_time );
						}
						if ( ! is_paused ) {
							player.play();
						}
					} );
					player.one( 'seeked', function() {
						if ( current_time !== 0 ) {
							canvas.parentNode.removeChild( canvas );
						}
					} );

					player.currentRes = target_resolution;
					player.trigger( 'changeRes' );
				};

				const resolutionSelector = new ResolutionSelector( player, { available_res } );
				player.ready( () => {
					player.getChild( 'controlBar' ).addChild( resolutionSelector, {}, 11 );
					const default_res = options.default_res;
					if ( default_res && available_res[ default_res ] ) {
						player.changeRes( default_res );
					}
				} );
			} );
		}( window.videojs ) );
	}

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
								otherRadios[j].setAttribute('aria-selected', 'false');
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
				selector.setAttribute('aria-expanded', 'false');
				selector.setAttribute('aria-hidden', 'true');
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
				selector.setAttribute('aria-expanded', 'true');
				selector.setAttribute('aria-hidden', 'false');
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
	const Videopack = {

		/**
		 * Initialize video players.
		 *
		 * @since 5.0.0
		 */
		init: function() {
			$( '.videopack-player' ).each( ( index, element ) => {
				this.initPlayer( $( element ) );
			} );

			// Initialize galleries
			$( '.videopack-gallery-wrapper' ).each( ( index, element ) => {
				this.initGallery( $( element ) );
			} );


			// Fallback for MediaElement.js players initialized by other plugins/themes.
			if ( typeof window.mejs !== 'undefined' ) {
				// This is a bit of a hack to catch MEJS players initialized after our script runs.
				const originalSuccess = window.mejs.MepDefaults.success;
				window.mejs.MepDefaults.success = ( mediaElement, domObject, player ) => {
					originalSuccess( mediaElement, domObject, player );
					const $playerWrapper = $( domObject ).closest( '.videopack-player' );
					if ( $playerWrapper.length && ! $playerWrapper.data( 'videopack-initialized' ) ) {
						this.setupVideo( $playerWrapper );
					}
				};
			}
		},

		/**
		 * Initialize a single player.
		 *
		 * @since 5.0.0
		 * @param {jQuery} $playerWrapper The player wrapper element.
		 */
		initPlayer: function( $playerWrapper ) {
			let playerId  = $playerWrapper.data( 'id' );

			// Handle gallery player IDs which have a prefix.
			if ( String( playerId ).startsWith( 'gallery_' ) ) {
				playerId = `gallery_${ playerId.split( '_' )[ 1 ] }`;
			}
			const videoVars = this.player_data && this.player_data[ `videopack_player_${ playerId }` ];

			if ( ! videoVars ) {
				return;
			}
			$playerWrapper.data( 'videopack_video_vars', videoVars );

			if ( videoVars.player_type.startsWith( 'Video.js' ) ) {
				this.loadVideoJS( $playerWrapper, videoVars );
			} else if ( videoVars.player_type === 'WordPress Default' ) {
				// ME.js is often auto-initialized by WP. We'll set up our hooks after it's ready.
				// The success callback hook in init() should handle this.
				// If it's already initialized, we set it up now.
				if ( $playerWrapper.find( '.mejs-container' ).length ) {
					this.setupVideo( $playerWrapper );
				}
			}
		},

		/**
		 * Load and initialize a Video.js player.
		 *
		 * @since 5.0.0
		 * @param {jQuery} $playerWrapper The player wrapper element.
		 * @param {object} videoVars      The video variables.
		 */
		loadVideoJS: function( $playerWrapper, videoVars ) {
			const playerId = $playerWrapper.data( 'id' );
			const videoElementId = `videopack_video_${ playerId }`;
			const videoElement = document.getElementById( videoElementId );

			if ( ! videoElement ) {
				return;
			}

			const videojsOptions = {
				language: videoVars.locale,
				responsive: true,
				userActions: { hotkeys: true },
			};

			if ( 'true' === videoVars.autoplay ) {
				videojsOptions.autoplay = 'any';
			}

			if ( 'true' === videoVars.resize || 'true' === videoVars.fullwidth ) {
				videojsOptions.fluid = true;
			} else {
				videojsOptions.fluid = false;
			}

			if ( videojsOptions.fluid && videoVars.width && -1 === videoVars.width.indexOf( '%' ) && videoVars.height && 'false' !== videoVars.fixed_aspect ) {
				videojsOptions.aspectRatio = `${ videoVars.width }:${ videoVars.height }`;
			}

			if ( 'true' === videoVars.nativecontrolsfortouch ) {
				videojsOptions.nativeControlsForTouch = true;
			}

			if ( 'true' === videoVars.playback_rate ) {
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

			if ( hasResolutions ) {
				if ( videojs.VERSION.split( '.' )[ 0 ] >= 5 ) {
					videojsOptions.plugins = videojsOptions.plugins || {};
					videojsOptions.plugins.resolutionSelector = {
						force_types: [ 'video/mp4' ],
					};
					const defaultResSource = sources.find( ( s ) => 'true' === s.dataset.default_res );
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
				this.setupVideo( $playerWrapper );
			} );
		},

		/**
		 * Common setup for any player type after initialization.
		 *
		 * @since 5.0.0
		 * @param {jQuery} $playerWrapper The player wrapper element.
		 */
		setupVideo: function( $playerWrapper ) {
			if ( $playerWrapper.data( 'videopack-initialized' ) ) {
				return;
			}

			const playerId = $playerWrapper.data( 'id' );
			const videoVars = $playerWrapper.data( 'videopack_video_vars' );

			// Disable FitVids.js from conflicting.
			if ( typeof $.fn.fitVids === 'function' ) {
				$.fn.fitVids = function() {
					return this;
				};
			}

			// Move watermark and meta into the player.
			const $watermark = $( `#video_${ playerId }_watermark` );
			if ( $watermark.length ) {
				$playerWrapper.prepend( $watermark );
				$watermark.show();
			}

			const $meta = $( `#video_${ playerId }_meta` );
			if ( $meta.length ) {
				$playerWrapper.prepend( $meta );
				$meta.show();
			}

			// Setup share functionality.
			const $shareIcon = $playerWrapper.find( '.videopack-share-icon' );
			if ( $shareIcon.length ) {
				$shareIcon.on( 'click', () => this.toggleShare( $playerWrapper ) );
				$playerWrapper.find( '.videopack-click-trap' ).on( 'click', () => this.toggleShare( $playerWrapper ) );
			}

			if ( 'true' !== videoVars.right_click ) {
				$playerWrapper.on( 'contextmenu', () => false );
			}

			// Setup "start at" functionality.
			const $embedWrapper = $playerWrapper.find( '.videopack-embed-wrapper' );
			if ( $embedWrapper.length ) {
				$embedWrapper.find( '.videopack-start-at-enable' ).on( 'change', () => this.setStartAt( $playerWrapper ) );
				$embedWrapper.find( '.videopack-start-at' ).on( 'change', () => this.changeStartAt( $playerWrapper ) );
			}

			if ( $meta.length ) {
				this.addHoverHandlers( $playerWrapper );
			}

			if ( $meta.length ) {
				$meta.addClass( 'videopack-meta-hover' );
			}

			const $downloadLink = $playerWrapper.find( '.download-link' );
			if ( $downloadLink.length && 'undefined' !== typeof $downloadLink.attr( 'download' ) && $downloadLink.data( 'alt_link' ) ) {
				$downloadLink.on( 'click', ( e ) => {
					e.preventDefault();
					this.checkDownloadLink( $downloadLink );
				} );
			}

			if ( videoVars.player_type.startsWith( 'Video.js' ) ) {
				this.setupVideoJSPlayer( $playerWrapper );
			} else if ( videoVars.player_type === 'WordPress Default' ) {
				this.setupMEJSPlayer( $playerWrapper );
			}

			// Resize logic.
			if ( 'true' === videoVars.resize || 'automatic' === videoVars.auto_res || window.location.search.includes( 'videopack[enable]=true' ) ) {
				this.resizeVideo( playerId );
				let resizeId;
				$( window ).on( 'resize', () => {
					clearTimeout( resizeId );
					resizeId = setTimeout( () => this.resizeVideo( playerId ), 500 );
				} );
			}

			$playerWrapper.data( 'videopack-initialized', true );
		},

		/**
		 * Setup for a Video.js player.
		 *
		 * @since 5.0.0
		 * @param {jQuery} $playerWrapper The player wrapper element.
		 */
		setupVideoJSPlayer: function( $playerWrapper ) {
			const playerId = $playerWrapper.data( 'id' );
			const videoVars = $playerWrapper.data( 'videopack_video_vars' );
			const player = videojs.getPlayer( `videopack_video_${ playerId }` );

			if ( ! player ) {
				return;
			}

			// Move watermark inside video element for proper positioning.
			const $watermark = $( `#video_${ playerId }_watermark` );
			if ( $watermark.length ) {
				player.el().appendChild( $watermark[ 0 ] );
			}

			// Touch device checks.
			if ( videojs.browser.TOUCH_ENABLED ) {
				if ( 'true' === videoVars.nativecontrolsfortouch && videojs.browser.IS_ANDROID ) {
					player.bigPlayButton.hide();
				}
				if ( ! player.controls() && ! player.muted() ) {
					player.controls( true );
				}
			}

			player.on( 'loadedmetadata', () => {
				const played = $playerWrapper.data( 'played' ) || 'not played';

				const $meta = $playerWrapper.find( '.videopack-meta' );
				if ( $meta.length ) {
					$meta.addClass( 'videopack-meta-hover' );
				}

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

				if ( 'true' === videoVars.autoplay && player.paused() ) {
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
					$( player.posterImage.el() ).hide();
				}

				const $meta = $playerWrapper.find( '.videopack-meta' );
				if ( $meta.length ) {
					$meta.removeClass( 'videopack-meta-hover' );
				}

				if ( 'true' === videoVars.pauseothervideos ) {
					videojs.getPlayers().forEach( ( otherPlayer ) => {
						if ( player.id() !== otherPlayer.id() && otherPlayer && ! otherPlayer.paused() && ! otherPlayer.autoplay() ) {
							otherPlayer.pause();
						}
					} );
				}

				this.videoCounter( playerId, 'play' );

				player.on( 'timeupdate.videopack', () => {
					const percent = Math.round( ( player.currentTime() / player.duration() ) * 100 );
					if ( ! $playerWrapper.data( '25' ) && percent >= 25 && percent < 50 ) {
						$playerWrapper.data( '25', true );
						this.videoCounter( playerId, '25' );
					} else if ( ! $playerWrapper.data( '50' ) && percent >= 50 && percent < 75 ) {
						$playerWrapper.data( '50', true );
						this.videoCounter( playerId, '50' );
					} else if ( ! $playerWrapper.data( '75' ) && percent >= 75 && percent < 100 ) {
						$playerWrapper.data( '75', true );
						this.videoCounter( playerId, '75' );
					}
				} );
			} );

			player.on( 'pause', () => {
				const $meta = $playerWrapper.find( '.videopack-meta' );
				if ( $meta.length ) {
					$meta.addClass( 'videopack-meta-hover' );
				}
				this.videoCounter( playerId, 'pause' );
			} );
			player.on( 'seeked', () => this.videoCounter( playerId, 'seek' ) );

			player.on( 'ended', () => {
				if ( ! $playerWrapper.data( 'end' ) ) {
					$playerWrapper.data( 'end', true );
					this.videoCounter( playerId, 'end' );
				}
				setTimeout( () => $( player.loadingSpinner.el() ).hide(), 250 );

				if ( videoVars.endofvideooverlay ) {
					$( player.posterImage.el() ).css( 'background-image', `url(${ videoVars.endofvideooverlay })` ).fadeIn();
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
		 * @param {jQuery} $playerWrapper The player wrapper element.
		 */
		setupMEJSPlayer: function( $playerWrapper ) {
			const playerId = $playerWrapper.data( 'id' );
			const videoVars = $playerWrapper.data( 'videopack_video_vars' );
			const $video = $playerWrapper.find( 'video' );
			const mejsId = $playerWrapper.find( '.mejs-container' ).attr( 'id' );

			if ( ! $video.length || ! mejsId || ! mejs.players[ mejsId ] ) {
				return;
			}

			const player = mejs.players[ mejsId ];

			// Move watermark.
			const $watermark = $( `#video_${ playerId }_watermark` );
			if ( $watermark.length ) {
				$playerWrapper.find( '.mejs-container' ).append( $watermark );
			}

			const $meta = $playerWrapper.find( '.videopack-meta' );
			if ( $meta.length ) {
				$meta.addClass( 'videopack-meta-hover' );
			}

			const played = $playerWrapper.data( 'played' ) || 'not played';
			if ( 'not played' === played ) {
				// Default captions.
				if ( player.tracks && player.tracks.length > 0 ) {
					const defaultTrack = $( `#${ mejsId } track[default]` );
					if ( defaultTrack.length ) {
						const defaultLang = defaultTrack.attr( 'srclang' ).toLowerCase();
						const trackToSet = player.tracks.find( ( t ) => t.srclang === defaultLang );
						if ( trackToSet ) {
							player.setTrack( trackToSet.trackId );
						}
					}
				}

				if ( videoVars.start ) {
					$video[ 0 ].setCurrentTime( this.convertFromTimecode( videoVars.start ) );
				}
			}

			$video.on( 'loadedmetadata', () => {
				if ( videoVars.set_volume ) {
					$video[ 0 ].volume = videoVars.set_volume;
				}
				if ( 'true' === videoVars.mute ) {
					$video[ 0 ].setMuted( true );
				}
				if ( 'false' === videoVars.pauseothervideos ) {
					player.options.pauseOtherPlayers = false;
				}
			} );

			$video.on( 'play', () => {
				document.getElementById( mejsId ).focus();
				this.videoCounter( playerId, 'play' );

				$video.on( 'timeupdate.videopack', () => {
					const percent = Math.round( ( $video[ 0 ].currentTime / $video[ 0 ].duration ) * 100 );
					if ( ! $playerWrapper.data( '25' ) && percent >= 25 && percent < 50 ) {
						$playerWrapper.data( '25', true );
						this.videoCounter( playerId, '25' );
					} else if ( ! $playerWrapper.data( '50' ) && percent >= 50 && percent < 75 ) {
						$playerWrapper.data( '50', true );
						this.videoCounter( playerId, '50' );
					} else if ( ! $playerWrapper.data( '75' ) && percent >= 75 && percent < 100 ) {
						$playerWrapper.data( '75', true );
						this.videoCounter( playerId, '75' );
					}
				} );
			} );

			$video.on( 'pause', () => {
				const $meta = $playerWrapper.find( '.videopack-meta' );
				if ( $meta.length ) {
					$meta.addClass( 'videopack-meta-hover' );
				}
				this.videoCounter( playerId, 'pause' );
			} );
			$video.on( 'seeked', () => this.videoCounter( playerId, 'seek' ) );

			$video.on( 'ended', () => {
				if ( ! $playerWrapper.data( 'end' ) ) {
					$playerWrapper.data( 'end', true );
					this.videoCounter( playerId, 'end' );
				}
				if ( videoVars.endofvideooverlay ) {
					$playerWrapper.find( '.mejs-poster' ).css( 'background-image', `url(${ videoVars.endofvideooverlay })` ).fadeIn();
					$video.one( 'seeking.videopack', () => {
						if ( 0 !== $video[ 0 ].currentTime ) {
							$playerWrapper.find( '.mejs-poster' ).fadeOut();
						}
					} );
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
			const $playerWrapper = $( `.videopack-player[data-id="${ playerId }"]` );
			if ( ! $playerWrapper.length ) {
				return;
			}
			const videoVars = $playerWrapper.data( 'videopack_video_vars' );
			if ( ! videoVars ) {
				return;
			}

			let setWidth = videoVars.width;
			const setHeight = videoVars.height;
			const aspectRatio = Math.round( ( setHeight / setWidth ) * 1000 ) / 1000;
			const $wrapperParent = $playerWrapper.parent();

			let parentWidth;
			if ( $wrapperParent.is( 'body' ) ) { // Embedded video
				parentWidth = window.innerWidth;
				setWidth = window.innerWidth;
			} else {
				parentWidth = $wrapperParent.width();
				if ( 'true' === videoVars.fullwidth ) {
					setWidth = parentWidth;
				}
			}

			if ( parentWidth < setWidth ) {
				setWidth = parentWidth;
			}

			if ( setWidth > 0 && setWidth < 30000 ) {
				$playerWrapper.closest( '.videopack-wrapper' ).width( setWidth );
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
			const $playerWrapper = $( `.videopack-player[data-id="${ playerId }"]` );
			const videoVars = $playerWrapper.data( 'videopack_video_vars' );

			if ( ! videoVars ) {
				return;
			}

			let changed = false;
			const played = $playerWrapper.data( 'played' ) || 'not played';

			if ( 'play' === event ) {
				if ( 'not played' === played ) { // Play start
					if ( videoVars.countable ) {
						changed = true;
					}
					$playerWrapper.data( 'played', 'played' );
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

			if ( changed && 'false' !== videoVars.count_views ) {
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
							show_views: !!$( `.videopack-view-count[data-id="${ playerId }"]` ).length,
						} ),
					} )
						.then( ( response ) => {
							if ( ! response.ok ) {
								throw new Error( `HTTP error! status: ${ response.status }` );
							}
							return response.json();
						} )
						.then( ( data ) => {
							if ( 'play' === event && data.view_count ) {
								$( `.videopack-view-count[data-id="${ playerId }"]` ).html( data.view_count );
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
		 * @param {jQuery} $playerWrapper The player wrapper element.
		 */
		toggleShare: function( $playerWrapper ) {
			const videoVars = $playerWrapper.data( 'videopack_video_vars' );
			const $shareIcon = $playerWrapper.find( '.videopack-share-icon' );
			const $embedWrapper = $playerWrapper.find( '.videopack-embed-wrapper' );
			const $clickTrap = $playerWrapper.find( '.videopack-click-trap' );
			const $meta = $playerWrapper.find( '.videopack-meta' );

			const isShareActive = $shareIcon.hasClass( 'vjs-icon-cancel' );

			if ( isShareActive ) {
				$shareIcon.removeClass( 'vjs-icon-cancel' ).addClass( 'vjs-icon-share' );
				$embedWrapper.slideUp();
				$clickTrap.slideUp();
				if ( $meta.length ) {
					this.addHoverHandlers( $playerWrapper );
				}
			} else {
				$shareIcon.removeClass( 'vjs-icon-share' ).addClass( 'vjs-icon-cancel' );
				$embedWrapper.slideDown();
				$clickTrap.slideDown();
				if ( $meta.length ) {
					this.removeHoverHandlers( $playerWrapper );
					$meta.addClass( 'videopack-meta-hover' );
				}
			}

			if ( videoVars.player_type.startsWith( 'Video.js' ) ) {
				const playerId = $playerWrapper.data( 'id' );
				const player = videojs.getPlayer( `videopack_video_${ playerId }` );
				if ( player ) {
					player.pause();
					const $controls = player.hasStarted() ? $( player.controlBar.el() ) : $( player.bigPlayButton.el() );
					if ( isShareActive ) {
						$controls.show();
					} else {
						$controls.hide();
					}
				}
			} else if ( videoVars.player_type === 'WordPress Default' ) {
				const $video = $playerWrapper.find( 'video' );
				if ( $video.length ) {
					$video[ 0 ].pause();
				}
				$playerWrapper.find( '.mejs-overlay-button' ).toggle();
			}
		},

		/**
		 * Check if a download link is valid, otherwise use the alternative.
		 *
		 * @since 5.0.0
		 * @param {jQuery} $downloadLink The download link element.
		 */
		checkDownloadLink: function( $downloadLink ) {
			const url = $downloadLink.attr( 'href' );
			const altUrl = $downloadLink.data( 'alt_link' );

			$.ajax( {
				type: 'HEAD',
				url: url,
				success: function() {
					const link = document.createElement( 'a' );
					link.href = url;
					link.setAttribute( 'download', '' );
					document.body.appendChild( link );
					link.click();
					document.body.removeChild( link );
				},
				error: function() {
					if ( altUrl ) {
						window.location.href = altUrl;
					}
				},
			} );
		},

		/**
		 * Set the "start at" time in the embed code from the current video time.
		 *
		 * @since 5.0.0
		 * @param {jQuery} $playerWrapper The player wrapper element.
		 */
		setStartAt: function( $playerWrapper ) {
			const $embedWrapper = $playerWrapper.find( '.videopack-embed-wrapper' );
			if ( $embedWrapper.find( '.videopack-start-at-enable' ).prop( 'checked' ) ) {
				const videoVars = $playerWrapper.data( 'videopack_video_vars' );
				let currentTime = 0;

				if ( videoVars.player_type.startsWith( 'Video.js' ) ) {
					const playerId = $playerWrapper.data( 'id' );
					const player = videojs.getPlayer( `videopack_video_${ playerId }` );
					if ( player ) {
						currentTime = player.currentTime();
					}
				} else if ( videoVars.player_type === 'WordPress Default' ) {
					const $video = $playerWrapper.find( 'video' );
					if ( $video.length ) {
						currentTime = $video[ 0 ].currentTime;
					}
				}

				$embedWrapper.find( '.videopack-start-at' ).val( this.convertToTimecode( Math.floor( currentTime ) ) );
			}

			this.changeStartAt( $playerWrapper );
		},

		/**
		 * Update the embed code with the "start at" time.
		 *
		 * @since 5.0.0
		 * @param {jQuery} $playerWrapper The player wrapper element.
		 */
		changeStartAt: function( $playerWrapper ) {
			const $embedWrapper = $playerWrapper.find( '.videopack-embed-wrapper' );
			const $embedCodeTextarea = $embedWrapper.find( '.videopack-embed-code' );
			const embedCode = $embedCodeTextarea.val();

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

			if ( $embedWrapper.find( '.videopack-start-at-enable' ).prop( 'checked' ) ) {
				const startTime = $embedWrapper.find( '.videopack-start-at' ).val();
				if ( startTime ) {
					const separator = src.includes( '?' ) ? '&' : '?';
					src += `${ separator }videopack[start]=${ encodeURIComponent( startTime ) }`;
				}
			}

			iframe.setAttribute( 'src', src );
			$embedCodeTextarea.val( iframe.outerHTML );
		},

		/**
		 * Add hover handlers for meta information.
		 *
		 * @since 5.0.0
		 * @param {jQuery} $playerWrapper The player wrapper element.
		 */
		addHoverHandlers: function( $playerWrapper ) {
			const $meta = $playerWrapper.find( '.videopack-meta' );
			if ( ! $meta.length ) {
				return;
			}
			$playerWrapper
				.on( 'mouseenter.videopack.hover', () => $meta.addClass( 'videopack-meta-hover' ) )
				.on( 'mouseleave.videopack.hover', () => $meta.removeClass( 'videopack-meta-hover' ) )
				.on( 'focusin.videopack.hover', () => $meta.addClass( 'videopack-meta-hover' ) )
				.on( 'focusout.videopack.hover', () => $meta.removeClass( 'videopack-meta-hover' ) );
		},

		/**
		 * Remove hover handlers for meta information.
		 *
		 * @since 5.0.0
		 * @param {jQuery} $playerWrapper The player wrapper element.
		 */
		removeHoverHandlers: function( $playerWrapper ) {
			$playerWrapper.off( '.videopack.hover' );
		},

		/**
		 * ============================================================================
		 * Gallery Functions
		 * ============================================================================
		 */

		/**
		 * Initialize a single gallery.
		 * @param {jQuery} $galleryWrapper The gallery wrapper element.
		 */
		initGallery: function( $galleryWrapper ) {
			if ( $galleryWrapper.data( 'videopack-gallery-initialized' ) ) {
				return;
			}

			const gallerySettings = $galleryWrapper.data( 'gallery-settings' ) || {};
			$galleryWrapper.data( 'gallery-settings-cache', gallerySettings );

			// Store initial video data order for navigation.
			const initialVideoOrder = [];
			$galleryWrapper.find( '.videopack-gallery-thumbnail' ).each( ( i, thumb ) => {
				initialVideoOrder.push( String( $( thumb ).data( 'attachment-id' ) ) );
			} );
			$galleryWrapper.data( 'current-videos-order', initialVideoOrder );

			// Event Listeners
			$galleryWrapper.on( 'click', '.videopack-gallery-thumbnail a', ( e ) => this.handleGalleryThumbnailClick( e, $galleryWrapper ) );
			$galleryWrapper.on( 'click', '.videopack-gallery-pagination a', ( e ) => this.handleGalleryPaginationClick( e, $galleryWrapper ) );

			const $popup = $galleryWrapper.find( '.videopack-gallery-popup' );
			$popup.on( 'click', '.videopack-gallery-popup-close, .videopack-gallery-popup-overlay', () => this.closeGalleryPopup( $popup ) );
			$popup.on( 'click', '.videopack-gallery-popup-next', () => this.navigateGalleryPopup( 1, $galleryWrapper ) );
			$popup.on( 'click', '.videopack-gallery-popup-prev', () => this.navigateGalleryPopup( -1, $galleryWrapper ) );

			$galleryWrapper.data( 'videopack-gallery-initialized', true );
		},

		handleGalleryThumbnailClick: function( e, $galleryWrapper ) {
			e.preventDefault();
			const attachmentId = $( e.currentTarget ).parent( '.videopack-gallery-thumbnail' ).data( 'attachment-id' );
			const videoData = this.player_data && this.player_data[ `videopack_player_gallery_${ attachmentId }` ];

			if ( videoData ) {
				this.openGalleryPopup( videoData, $galleryWrapper );
			}
		},

		openGalleryPopup: function( videoData, $galleryWrapper ) {
			const $popup = $galleryWrapper.find( '.videopack-gallery-popup' );
			const $playerContainer = $popup.find( '.videopack-gallery-player-container' );

			// Clean up any previous player
			if ( this.currentGalleryPlayer && typeof this.currentGalleryPlayer.dispose === 'function' ) {
				this.currentGalleryPlayer.dispose();
			}
			$playerContainer.empty();

			const playerId = videoData.id; // This is 'videopack_player_gallery_XXX'
			const attachmentId = videoData.attachment_id;

			// Create player HTML
			const playerHtml = `
				<div class="videopack-player" data-id="gallery_${ attachmentId }">
					<video id="${ playerId }" class="videopack-video video-js vjs-default-skin" controls preload="auto" width="${ videoData.width }" height="${ videoData.height }" poster="${ videoData.poster }">
						${ videoData.sources.map( ( source ) => `
							<source src="${ source.src }" type="${ source.type }" ${ source.resolution ? `data-res="${ source.resolution }"` : '' } />
						` ).join( '' ) }
					</video>
				</div>
			`;
			$playerContainer.html( playerHtml );

			// The data is already on window.Videopack.player_data, so initPlayer will find it.
			this.initPlayer( $playerContainer.find( '.videopack-player' ) );

			this.currentGalleryPlayer = videojs.getPlayer( playerId );
			$galleryWrapper.data( 'current-gallery-attachment-id', attachmentId );

			$popup.fadeIn();
		},

		closeGalleryPopup: function( $popup ) {
			if ( this.currentGalleryPlayer && typeof this.currentGalleryPlayer.dispose === 'function' ) {
				this.currentGalleryPlayer.dispose();
				this.currentGalleryPlayer = null;
			}
			$popup.fadeOut();
		},

		navigateGalleryPopup: function( direction, $galleryWrapper ) {
			const currentAttachmentId = $galleryWrapper.data( 'current-gallery-attachment-id' );
			const videoOrder = $galleryWrapper.data( 'current-videos-order' );

			const currentIndex = videoOrder.indexOf( String( currentAttachmentId ) );
			let nextIndex = currentIndex + direction;

			if ( nextIndex < 0 ) {
				nextIndex = videoOrder.length - 1; // Wrap around
			} else if ( nextIndex >= videoOrder.length ) {
				nextIndex = 0; // Wrap around
			}

			const nextAttachmentId = videoOrder[ nextIndex ];
			const nextVideoData = this.player_data && this.player_data[ `videopack_player_gallery_${ nextAttachmentId }` ];

			if ( nextVideoData ) {
				this.openGalleryPopup( nextVideoData, $galleryWrapper );
			}
		},

		handleGalleryPaginationClick: function( e, $galleryWrapper ) {
			e.preventDefault();
			const page = $( e.currentTarget ).data( 'page' );
			this.loadGalleryPage( page, $galleryWrapper );
		},

		loadGalleryPage: function( page, $galleryWrapper ) {
			const gallerySettings = $galleryWrapper.data( 'gallery-settings-cache' );
			const $grid = $galleryWrapper.find( '.videopack-gallery-grid' );
			const $pagination = $galleryWrapper.find( '.videopack-gallery-pagination' );

			$grid.css( 'opacity', 0.5 ); // Loading indicator

			const restUrl = new URL( videopack_l10n.rest_url + 'videopack/v1/video_gallery' );

			// Append gallery settings and page to URL params
			Object.keys( gallerySettings ).forEach( ( key ) => {
				if ( gallerySettings[ key ] !== null && gallerySettings[ key ] !== false && gallerySettings[ key ] !== '' ) {
					restUrl.searchParams.append( key, gallerySettings[ key ] );
				}
			} );
			restUrl.searchParams.append( 'page', page );

			fetch( restUrl )
				.then( ( response ) => response.json() )
				.then( ( data ) => {
					if ( data && data.videos ) {
						// Update caches
						const newVideoOrder = [];
						data.videos.forEach( ( video ) => {
							// Add data to global object for initPlayer
							window.Videopack.player_data[ video.player_vars.id ] = video.player_vars;
							newVideoOrder.push( String( video.attachment_id ) );
						} );
						$galleryWrapper.data( 'current-videos-order', newVideoOrder );

						// Render new content
						this.renderGalleryThumbnails( data.videos, $grid, gallerySettings );
						this.renderGalleryPagination( data.max_num_pages, data.current_page, $pagination );
					}
					$grid.css( 'opacity', 1 );
				} )
				.catch( ( error ) => {
					console.error( 'Error loading gallery page:', error );
					$grid.css( 'opacity', 1 );
				} );
		},

		renderGalleryThumbnails: function( videos, $grid, settings ) {
			$grid.empty();
			let html = '';
			videos.forEach( ( video ) => {
				html += `
					<div class="videopack-gallery-thumbnail" data-attachment-id="${ video.attachment_id }" style="width: ${ settings.gallery_thumb }px;">
						<a href="#">
							<img src="${ video.poster_url }"
								 ${ video.poster_srcset ? `srcset="${ video.poster_srcset }"` : '' }
								 alt="${ video.title }">
							<div class="videopack-gallery-play-button"></div>
							${ settings.gallery_title === 'true' ? `
								<div class="videopack-gallery-title-overlay">
									<span>${ video.title }</span>
								</div>
							` : '' }
						</a>
					</div>
				`;
			} );
			$grid.html( html );
		},

		renderGalleryPagination: function( maxPages, currentPage, $pagination ) {
			$pagination.empty();
			if ( maxPages <= 1 ) {
				return;
			}
			let html = `
				<span class="videopack-gallery-pagination-arrow prev" ${ currentPage === 1 ? 'style="visibility:hidden;"' : '' }>
					<a href="#" data-page="${ currentPage - 1 }">&larr;</a>
				</span>
			`;
			for ( let i = 1; i <= maxPages; i++ ) {
				if ( i === currentPage ) {
					html += `<span class="videopack-gallery-pagination-selected">${ i }</span>`;
				} else {
					html += `<span class="videopack-gallery-page-number"><a href="#" data-page="${ i }">${ i }</a></span>`;
				}
			}
			html += `
				<span class="videopack-gallery-pagination-arrow next" ${ currentPage === maxPages ? 'style="visibility:hidden;"' : '' }>
					<a href="#" data-page="${ currentPage + 1 }">&rarr;</a>
				</span>
			`;
			$pagination.html( html );
		},

	};

	// Expose the Videopack object to the global scope, merging with any existing properties (like player_data).
	window.Videopack = Object.assign( window.Videopack || {}, Videopack );

	$( () => {
		Videopack.init();
	} );
}( jQuery ) );
