'use strict';

/**
 * ============================================================================
 * Video.js Quality Selector Plugin
 * ============================================================================
 */
if ('undefined' !== typeof window.videojs && 'undefined' === typeof window.videojs.getPlugin('resolutionSelector')) {
	(function (videojs) {
		const methods = {
			res_label: function (res) {
				return (/^\d+$/.test(res)) ? res + 'p' : res;
			},
		};

		// Add default english translations
		videojs.addLanguage('en', {
			'Quality': 'Quality',
			'Full': 'Full',
			'Codecs': 'Codecs',
		});

		const MenuItem = videojs.getComponent('MenuItem');
		const Menu = videojs.getComponent('Menu');

		class ResolutionMenuItem extends MenuItem {
			call_count = 0;

			constructor(player, options) {
				options.label = methods.res_label(options.res);
				options.selected = (options.res.toString() === player.getCurrentRes().toString());

				super(player, options);

				this.resolution = options.res;
				this.codec = options.codec;
				this.on(['click', 'tap'], this.onClick);

				this.on(player, 'changeRes', () => {
					const is_current_res = this.resolution.toString() === player.getCurrentRes().toString();
					let is_selected_now = is_current_res;
					const has_multiple_codecs = player.source_groups && Object.keys(player.source_groups).length > 1;

					if (has_multiple_codecs) {
						is_selected_now = is_current_res && (this.codec === player.getCurrentCodec());
					}

					this.selected(is_selected_now);
					this.call_count = 0;
				});
			}

			onClick() {
				if (this.call_count > 0) { return; }
				this.player().manualResolutionSelected = true;
				this.player().changeRes(this.resolution, this.codec);
				this.call_count++;
			}
		}

		class CodecMenuItem extends MenuItem {
			constructor(player, options) {
				super(player, options);
				this.on('mouseenter', this.handleMouseEnter);
			}

			handleMouseEnter() {
				this.closeOtherSubmenus();

				const subMenu = this.children()[0];
				if (subMenu) {
					const subMenuEl = subMenu.el();
					const parentRect = this.el().getBoundingClientRect();

					subMenuEl.style.visibility = 'hidden';
					subMenuEl.style.display = 'block';
					const subMenuWidth = subMenuEl.offsetWidth;
					subMenuEl.style.display = '';
					subMenuEl.style.visibility = '';

					const playerRect = this.player().el().getBoundingClientRect();
					if (parentRect.right + subMenuWidth > playerRect.right && parentRect.left - subMenuWidth > playerRect.left) {
						subMenuEl.classList.add('vjs-submenu-left');
					} else {
						subMenuEl.classList.remove('vjs-submenu-left');
					}
				}
			}

			closeOtherSubmenus() {
				const parent = this.parentComponent_;
				if (parent && parent.children) {
					parent.children().forEach(child => {
						if (child !== this && child.hasClass && child.hasClass('vjs-has-submenu')) {
							child.removeClass('vjs-submenu-open');
						}
					});
				}
			}

			handleClick(event) {
				// Handle double-fire from tap+click
				if (event.type === 'click' && this.tapHandled_) {
					this.tapHandled_ = false;
					event.preventDefault();
					event.stopImmediatePropagation();
					return;
				}
				if (event.type === 'tap') {
					this.tapHandled_ = true;
					setTimeout(() => this.tapHandled_ = false, 500);
				}

				// Prevent the menu from closing when clicking a codec
				event.preventDefault();
				event.stopImmediatePropagation();

				const wasOpen = this.hasClass('vjs-submenu-open');

				// Close all other submenus
				this.closeOtherSubmenus();
				this.toggleClass('vjs-submenu-open', !wasOpen);
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
				player.source_groups = options.source_groups;
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
				const source_groups = player.source_groups;

				if (source_groups && Object.keys(source_groups).length > 1) {
					// Create a menu with codecs
					for (const groupId in source_groups) {
						const group = source_groups[groupId];
						const resolutionItems = [];
						for (const source of group.sources) {
							const resolution = source.resolution || source['data-res'];
							if (resolution) {
								resolutionItems.push(new ResolutionMenuItem(player, { res: resolution, codec: groupId, selectable: true }));
							}
						}

						if (resolutionItems.length > 0) {
							const menuItem = new CodecMenuItem(player, {
								label: group.label,
								selectable: false,
							});
							menuItem.el().classList.add('vjs-has-submenu');

							const subMenu = new Menu(player);
							menuItem.addChild(subMenu);
							resolutionItems.forEach(item => subMenu.addChild(item));
							items.push(menuItem);
						}
					}
					items.unshift(new ResolutionTitleMenuItem(player, {
						el: videojs.dom.createEl('li', {
							className: 'vjs-menu-title vjs-res-menu-title',
							innerHTML: player.localize('Codecs'),
						}),
					}));

				} else {
					// Original behavior: create a menu with resolutions
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
				}

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
			player.currentCodec = '';

			const sources = this.options_.sources || [];

			player.getCurrentRes = function () {
				return player.currentRes || (sources[0] ? (sources[0].resolution || sources[0]['data-res']) : '') || '';
			};

			player.getCurrentCodec = function () {
				return player.currentCodec || '';
			};

			if (!this.el().firstChild || !this.el().firstChild.canPlayType) {
				return;
			}

			const available_res = { length: 0 };
			const source_groups = options.source_groups || {};
			const has_multiple_codecs = source_groups && Object.keys(source_groups).length > 1;

			if (!has_multiple_codecs) {
				const sources_for_res_map = (source_groups && Object.keys(source_groups).length === 1) ?
					Object.values(source_groups)[0].sources :
					sources;

				for (let i = sources_for_res_map.length - 1; i >= 0; i--) {
					const source = sources_for_res_map[i];
					const current_res = source.resolution || source['data-res'];
					if (!current_res) {
						continue;
					}

					if (!(current_res in available_res)) {
						available_res.length++;
					}
					available_res[current_res] = source;

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
			}

			if ((!has_multiple_codecs && available_res.length < 2)) {
				return;
			}

			// Initialize currentCodec based on the initial source
			if (has_multiple_codecs) {
				const initialSrc = player.currentSrc();
				for (const groupId in source_groups) {
					if (source_groups[groupId].sources.some(s => s.src === initialSrc)) {
						player.currentCodec = groupId;
						break;
					}
				}
			}

			player.changeRes = function (target_resolution, target_codec_id) {
				const current_res = player.getCurrentRes();
				const current_codec_id = player.getCurrentCodec();

				if (current_res === target_resolution && (!target_codec_id || current_codec_id === target_codec_id)) {
					return;
				}

				let target_source = null;

				if (has_multiple_codecs && target_codec_id) {
					if (player.source_groups[target_codec_id]) {
						target_source = player.source_groups[target_codec_id].sources.find((s) => {
							const res = s.resolution || s['data-res'];
							return res && res.toString() === target_resolution.toString();
						});
					}
				} else {
					target_source = player.availableRes[target_resolution] || player.availableRes[target_resolution.toString()];
				}


				if (!target_source) {
					return;
				}

				const video = player.el().firstChild;
				const is_paused = player.paused();
				const current_time = player.currentTime();
				let canvas;

				if ('none' === video.preload) {
					video.preload = 'metadata';
				}

				if (current_time > 0 && !is_paused) {
					player.pause();
				}

				if (current_time !== 0) {
					canvas = document.createElement('canvas');
					canvas.className = 'videopack_temp_thumb';
					canvas.width = (video.videoWidth > video.videoHeight) ? video.offsetWidth : (video.videoWidth / video.videoHeight) * video.offsetHeight;
					canvas.height = (video.videoWidth > video.videoHeight) ? (video.videoHeight / video.videoWidth) * video.offsetWidth : video.offsetHeight;
					const topOffset = Math.round((video.offsetHeight - canvas.height) / 2);
					if (topOffset > 2) { canvas.style.top = `${topOffset}px`; }
					const leftOffset = Math.round((video.offsetWidth - canvas.width) / 2);
					if (leftOffset > 2) { canvas.style.left = `${leftOffset}px`; }
					const context = canvas.getContext('2d');
					context.drawImage(video, 0, 0, canvas.width, canvas.height);
					video.parentNode.appendChild(canvas);

					player.one('loadstart', function () {
						player.hasStarted(true);
					});
				}

				player.src(target_source);
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
				if (target_codec_id) {
					player.currentCodec = target_codec_id;
				}
				player.trigger('changeRes');
			};

			const resolutionSelector = new ResolutionSelector(player, { available_res, source_groups });
			player.ready(() => {
				const controlBar = player.getChild('controlBar');
				if (controlBar) {
					controlBar.addChild(resolutionSelector, {}, 11);
					const default_res = options.default_res;
					const default_codec = options.default_codec;
					if (default_res) {
						player.changeRes(default_res, default_codec);
					}
				}
			});
		});
	}(window.videojs));
}
