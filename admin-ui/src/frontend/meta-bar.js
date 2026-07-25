/**
 * Meta bar: share toggle, download dropdown menus, submenu alignment math,
 * and "start at" timecode embedding.
 *
 * Depends on window.videopack.getPlayerVars() (now defined in
 * players/init.js) rather than importing it directly — deliberately:
 * players/init.js imports setupMetaBar/setStartAt from this file to wire up
 * player setup, so importing getPlayerVars() directly back from
 * players/init.js here would add a new circular-import edge. Safe either
 * way, since every export here is only ever called from event handlers
 * that run well after window.videopack has been fully assembled.
 */

/* global videojs */

import { convertToTimecode, convertFromTimecode, stripTimeParams, addStartTimeParam } from './utils';

/**
 * Resolves the player container's bounding rect, used to decide whether a
 * dropdown/submenu needs to flip to stay within the player's bounds.
 *
 * @param {HTMLElement} wrapper Any element inside the player.
 * @return {DOMRect|null} The player container's bounding rect, if found.
 */
export function getDownloadPlayerRect( wrapper ) {
	const playerEl = wrapper.closest(
		'.videopack-wrapper, .videopack-player-relative-wrapper, .videopack-video-block-container, .wp-block-videopack-player-container'
	);
	return playerEl ? playerEl.getBoundingClientRect() : null;
}

export function alignDownloadDropdownMenu( menuEl, triggerEl, playerRect ) {
	if ( ! menuEl || ! triggerEl || ! playerRect ) {
		return;
	}
	menuEl.classList.remove( 'align-right', 'align-left', 'opens-above' );
	void menuEl.offsetHeight;

	let menuRect = menuEl.getBoundingClientRect();
	if ( menuRect.right > playerRect.right ) {
		menuEl.classList.add( 'align-right' );
	}
	if ( menuRect.left < playerRect.left ) {
		menuEl.classList.add( 'align-left' );
	}

	menuRect = menuEl.getBoundingClientRect();
	if ( menuRect.bottom > playerRect.bottom ) {
		menuEl.classList.add( 'opens-above' );
	}
	menuRect = menuEl.getBoundingClientRect();
	if ( menuRect.top < playerRect.top ) {
		menuEl.classList.remove( 'opens-above' );
	}
}

export function alignDownloadSubmenu( submenuEl, triggerEl, playerRect ) {
	if ( ! submenuEl || ! triggerEl || ! playerRect ) {
		return;
	}
	submenuEl.classList.remove( 'opens-left', 'opens-right' );

	const parentRect = triggerEl.getBoundingClientRect();
	const wasVisible = submenuEl.classList.contains( 'is-visible' );
	submenuEl.style.visibility = 'hidden';
	submenuEl.style.display = 'block';
	const subWidth = submenuEl.offsetWidth;
	submenuEl.style.visibility = '';
	if ( ! wasVisible ) {
		submenuEl.style.display = '';
	}

	const spaceLeft = parentRect.left - playerRect.left;
	const spaceRight = playerRect.right - parentRect.right;
	const inTitleMeta = !! triggerEl.closest( '.is-inside-title-meta' );
	let openLeft = inTitleMeta;
	if ( openLeft ) {
		if ( subWidth > spaceLeft && spaceRight > spaceLeft ) {
			openLeft = false;
		}
	} else if ( subWidth > spaceRight && spaceLeft > spaceRight ) {
		openLeft = true;
	}
	submenuEl.classList.add( openLeft ? 'opens-left' : 'opens-right' );
}

/**
 * Centered window popup helper for sharing services.
 *
 * @param {string} url  The intent URL.
 * @param {string} name The window name.
 */
export function openPopup( url, name ) {
	const width = 600;
	const height = 400;
	const left = ( window.innerWidth - width ) / 2 + window.screenX;
	const top = ( window.innerHeight - height ) / 2 + window.screenY;
	window.open( url, name, `width=${ width },height=${ height },left=${ left },top=${ top },location=no,menubar=no,status=no,toolbar=no` );
}

/**
 * Checks if a download link is valid, otherwise falls back to the
 * alternative link.
 *
 * @param {HTMLAnchorElement} downloadLink The download link element.
 */
export async function checkDownloadLink( downloadLink ) {
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
			console.error( 'Download failed and no alternative link available.' );
		}
	}
}

/**
 * Computes the share URL, incorporating start-at parameters if active.
 *
 * @param {HTMLElement} wrapper The meta/share block wrapper.
 * @return {string} The final computed URL to share.
 */
export function getShareUrl( wrapper ) {
	let url = stripTimeParams( window.location.href );

	const embedWrapper = wrapper._shareContainer || wrapper.querySelector( '.videopack-share-container' );
	if ( embedWrapper ) {
		const checkbox = embedWrapper.querySelector( '.videopack-start-at-enable' );
		if ( checkbox && checkbox.checked ) {
			const timecode = embedWrapper.querySelector( '.videopack-start-at' ).value;
			const seconds = Math.floor( convertFromTimecode( timecode ) );
			url = addStartTimeParam( url, seconds );
		}
	}
	return url;
}

/**
 * Updates the embed code with the "start at" time.
 *
 * @param {HTMLElement} playerWrapper The player wrapper element.
 * @param {HTMLElement} shareWrapper  The share block wrapper element.
 */
export function changeStartAt( playerWrapper, shareWrapper = null ) {
	const embedWrapper = ( shareWrapper && shareWrapper._shareContainer ) || playerWrapper.querySelector( '.videopack-share-container' );
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
}

/**
 * Sets the "start at" time in the embed code from the current video time.
 *
 * @param {HTMLElement} playerWrapper The player wrapper element.
 * @param {HTMLElement} shareWrapper  Optional share block wrapper element.
 */
export function setStartAt( playerWrapper, shareWrapper = null ) {
	const embedWrapper = ( shareWrapper && shareWrapper._shareContainer ) || playerWrapper.querySelector( '.videopack-share-container' );
	if ( ! embedWrapper ) {
		return;
	}
	const checkbox = embedWrapper.querySelector( '.videopack-start-at-enable' );
	if ( checkbox && checkbox.checked && embedWrapper.classList.contains( 'is-visible' ) ) {
		const videoVars = window.videopack.getPlayerVars( playerWrapper ) || {};
		let currentTime = 0;

		if ( videoVars.embed_method === 'Video.js' ) {
			const playerId = playerWrapper.dataset.id;
			const player = videojs.getPlayer( `videopack_video_${ playerId }` );
			if ( player ) {
				currentTime = player.currentTime();
			}
		} else if ( videoVars.embed_method === 'WordPress Default' ) {
			const video = playerWrapper.querySelector( 'video' );
			if ( video ) {
				currentTime = video.currentTime;
			}
		}

		embedWrapper.querySelector( '.videopack-start-at' ).value = convertToTimecode( Math.floor( currentTime ) );
	}

	if ( embedWrapper.classList.contains( 'is-visible' ) ) {
		changeStartAt( playerWrapper, shareWrapper );
	}
}

/**
 * Toggles the share/embed section.
 *
 * @param {HTMLElement} playerWrapper The player wrapper element.
 */
export function toggleShare( playerWrapper ) {
	const playerContainer = playerWrapper.closest( '.videopack-player' ) ||
		playerWrapper.closest( '.videopack-player-relative-wrapper' ) ||
		playerWrapper.closest( '.videopack-thumbnail-wrapper' ) ||
		playerWrapper.closest( '.videopack-wrapper' ) ||
		playerWrapper.closest( '.wp-block-videopack-player-container' ) ||
		playerWrapper.closest( '.videopack-collection-item' ) ||
		playerWrapper;

	const videoVars = window.videopack.getPlayerVars( playerWrapper ) || {};
	const shareIcon = playerWrapper.querySelector( '.videopack-icons.share, .videopack-icons.close' );
	const embedWrapper = playerWrapper._shareContainer || playerContainer.querySelector( '.videopack-share-container' ) || playerWrapper.querySelector( '.videopack-share-container' );
	const clickTrap = playerWrapper._clickTrap || playerContainer.querySelector( '.videopack-click-trap' ) || playerWrapper.querySelector( '.videopack-click-trap' );

	if ( ! shareIcon || ! embedWrapper ) {
		return;
	}

	const isShareActive = shareIcon.classList.contains( 'close' );

	if ( isShareActive ) {
		shareIcon.classList.remove( 'close' );
		shareIcon.classList.add( 'share' );
		shareIcon.classList.remove( 'is-active' );
		embedWrapper.classList.remove( 'is-visible' );
		if ( clickTrap ) {
			clickTrap.classList.remove( 'is-visible' );
		}
	} else {
		shareIcon.classList.remove( 'share' );
		shareIcon.classList.add( 'close' );
		shareIcon.classList.add( 'is-active' );
		embedWrapper.classList.add( 'is-visible' );
		if ( clickTrap ) {
			clickTrap.classList.add( 'is-visible' );
		}
		setStartAt( playerContainer, playerWrapper );
	}

	if ( videoVars.embed_method === 'Video.js' ) {
		const activePlayerId = playerWrapper.dataset.id || playerContainer.dataset.id;
		const player = videojs.getPlayer( `videopack_video_${ activePlayerId }` );
		if ( player ) {
			player.pause();
			const controls = player.hasStarted() ? player.controlBar.el() : player.bigPlayButton.el();
			if ( isShareActive ) {
				controls.style.display = '';
			} else {
				controls.style.display = 'none';
			}
		}
	} else if ( videoVars.embed_method === 'WordPress Default' ) {
		const video = playerWrapper.querySelector( 'video' );
		if ( video ) {
			video.pause();
		}
		const overlayButton = playerWrapper.querySelector( '.mejs-overlay-button' );
		if ( overlayButton ) {
			overlayButton.style.display = overlayButton.style.display === 'none' ? '' : 'none';
		}
	}
}

/**
 * Sets up the meta bar (share toggle, download dropdown menus, embed code
 * copying, etc.) for a given wrapper.
 *
 * @param {HTMLElement} wrapper   The wrapper containing the icons.
 * @param {object}      videoVars Optional video variables (currently unused directly here).
 */
export function setupMetaBar( wrapper, videoVars ) { // eslint-disable-line no-unused-vars
	if ( wrapper.dataset.videopackMetaInitialized ) {
		return;
	}

	const shareToggle = wrapper.querySelector( '.videopack-share-toggle' );
	if ( shareToggle && ! shareToggle.dataset.videopackInitialized ) {
		shareToggle.addEventListener( 'click', ( e ) => {
			e.preventDefault();
			e.stopPropagation();
			toggleShare( wrapper );
		} );
		shareToggle.dataset.videopackInitialized = 'true';

		const clickTrap = wrapper.querySelector( '.videopack-click-trap' );
		if ( clickTrap ) {
			clickTrap.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				e.stopPropagation();
				toggleShare( wrapper );
			} );
		}
	}

	const isDownloadDropdownMenu = ( menu ) => {
		return menu && (
			menu.classList.contains( 'videopack-download-dropdown-menu' ) ||
			menu.classList.contains( 'videopack-dropdown-menu' ) ||
			menu.classList.contains( 'videopack-download-menu' )
		);
	};

	const closeAllDownloadDropdowns = ( exceptTrigger = null ) => {
		document.querySelectorAll( '.videopack-download-trigger[aria-expanded="true"], .videopack-dropdown-trigger[aria-expanded="true"]' ).forEach( ( openTrigger ) => {
			if ( openTrigger === exceptTrigger ) {
				return;
			}
			openTrigger.setAttribute( 'aria-expanded', 'false' );
			openTrigger.classList.remove( 'is-active' );
			const menu = openTrigger.closest( '.videopack-download-menu-container' )?.querySelector( '.videopack-download-dropdown-menu' )
				|| openTrigger.nextElementSibling;
			if ( menu ) {
				menu.classList.remove( 'is-visible' );
			}
		} );
		document.querySelectorAll( '.videopack-download-submenu-trigger[aria-expanded="true"]' ).forEach( ( subTrigger ) => {
			subTrigger.setAttribute( 'aria-expanded', 'false' );
			const submenu = subTrigger.nextElementSibling;
			if ( submenu ) {
				submenu.classList.remove( 'is-visible' );
			}
			subTrigger.closest( '.videopack-has-submenu' )?.classList.remove( 'is-open' );
		} );
	};

	// Setup generic dropdown interactions
	const dropdownTriggers = wrapper.querySelectorAll( '.videopack-download-trigger, .videopack-dropdown-trigger' );
	dropdownTriggers.forEach( ( trigger ) => {
		if ( ! trigger.dataset.videopackDropdownInitialized ) {
			trigger.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				e.stopPropagation();
				const menuContainer = trigger.closest( '.videopack-download-menu-container' );
				const dropdownMenu = menuContainer
					? menuContainer.querySelector( '.videopack-download-dropdown-menu' )
					: trigger.nextElementSibling;
				if ( ! isDownloadDropdownMenu( dropdownMenu ) ) {
					return;
				}
				const isExpanded = trigger.getAttribute( 'aria-expanded' ) === 'true';

				closeAllDownloadDropdowns( trigger );

				trigger.setAttribute( 'aria-expanded', String( ! isExpanded ) );
				if ( ! isExpanded ) {
					trigger.classList.add( 'is-active' );
					dropdownMenu.classList.add( 'is-visible' );
					const playerRect = getDownloadPlayerRect( wrapper );
					if ( playerRect ) {
						window.requestAnimationFrame( () => {
							alignDownloadDropdownMenu( dropdownMenu, trigger, playerRect );
						} );
					}
				} else {
					trigger.classList.remove( 'is-active' );
					dropdownMenu.classList.remove( 'is-visible' );
				}
			} );
			trigger.dataset.videopackDropdownInitialized = 'true';
		}
	} );

	const setupTitleMetaSubmenuHover = ( menuItem ) => {
		if ( menuItem.dataset.videopackSubmenuHoverInitialized ) {
			return;
		}
		const submenu = menuItem.querySelector( '.videopack-download-submenu' );
		const subTrigger = menuItem.querySelector( '.videopack-download-submenu-trigger' );
		if ( ! submenu || ! subTrigger ) {
			return;
		}

		const closeSiblingSubmenus = () => {
			const dropdownMenu = menuItem.closest( '.videopack-download-dropdown-menu' );
			if ( ! dropdownMenu ) {
				return;
			}
			dropdownMenu.querySelectorAll( '.videopack-has-submenu.is-open' ).forEach( ( openItem ) => {
				if ( openItem === menuItem ) {
					return;
				}
				openItem.classList.remove( 'is-open' );
				openItem.querySelector( '.videopack-download-submenu' )?.classList.remove( 'is-visible' );
				openItem.querySelector( '.videopack-download-submenu-trigger' )?.setAttribute( 'aria-expanded', 'false' );
			} );
		};

		menuItem.addEventListener( 'mouseenter', () => {
			closeSiblingSubmenus();
			menuItem.classList.add( 'is-open' );
			submenu.classList.add( 'is-visible' );
			subTrigger.setAttribute( 'aria-expanded', 'true' );
			const playerRect = getDownloadPlayerRect( wrapper );
			if ( playerRect ) {
				window.requestAnimationFrame( () => {
					alignDownloadSubmenu( submenu, subTrigger, playerRect );
				} );
			}
		} );

		menuItem.addEventListener( 'mouseleave', ( e ) => {
			if ( menuItem.contains( e.relatedTarget ) ) {
				return;
			}
			menuItem.classList.remove( 'is-open' );
			submenu.classList.remove( 'is-visible' );
			subTrigger.setAttribute( 'aria-expanded', 'false' );
		} );

		menuItem.dataset.videopackSubmenuHoverInitialized = 'true';
	};

	wrapper.querySelectorAll( '.is-inside-title-meta .videopack-has-submenu' ).forEach( setupTitleMetaSubmenuHover );

	wrapper.querySelectorAll( '.videopack-download-submenu-trigger' ).forEach( ( subTrigger ) => {
		if ( subTrigger.closest( '.is-inside-title-meta' ) ) {
			return;
		}
		if ( subTrigger.dataset.videopackSubmenuInitialized ) {
			return;
		}
		subTrigger.addEventListener( 'click', ( e ) => {
			e.preventDefault();
			e.stopPropagation();
			const submenu = subTrigger.nextElementSibling;
			if ( ! submenu || ! submenu.classList.contains( 'videopack-download-submenu' ) ) {
				return;
			}
			const isExpanded = subTrigger.getAttribute( 'aria-expanded' ) === 'true';
			wrapper.querySelectorAll( '.videopack-download-submenu-trigger[aria-expanded="true"]' ).forEach( ( openSub ) => {
				if ( openSub !== subTrigger ) {
					openSub.setAttribute( 'aria-expanded', 'false' );
					openSub.nextElementSibling?.classList.remove( 'is-visible' );
					openSub.closest( '.videopack-has-submenu' )?.classList.remove( 'is-open' );
				}
			} );
			subTrigger.setAttribute( 'aria-expanded', String( ! isExpanded ) );
			subTrigger.closest( '.videopack-has-submenu' )?.classList.toggle( 'is-open', ! isExpanded );
			if ( ! isExpanded ) {
				submenu.classList.add( 'is-visible' );
				const playerRect = getDownloadPlayerRect( wrapper );
				if ( playerRect ) {
					window.requestAnimationFrame( () => {
						alignDownloadSubmenu( submenu, subTrigger, playerRect );
					} );
				}
			} else {
				submenu.classList.remove( 'is-visible' );
			}
		} );
		subTrigger.addEventListener( 'mouseenter', () => {
			const hoverSubmenu = subTrigger.nextElementSibling;
			if ( ! hoverSubmenu || ! hoverSubmenu.classList.contains( 'videopack-download-submenu' ) ) {
				return;
			}
			const playerRect = getDownloadPlayerRect( wrapper );
			if ( playerRect ) {
				window.requestAnimationFrame( () => {
					alignDownloadSubmenu( hoverSubmenu, subTrigger, playerRect );
				} );
			}
		} );
		subTrigger.dataset.videopackSubmenuInitialized = 'true';
	} );

	wrapper.querySelectorAll( '.videopack-has-submenu' ).forEach( ( menuItem ) => {
		if ( menuItem.closest( '.is-inside-title-meta' ) ) {
			return;
		}
		if ( menuItem.dataset.videopackSubmenuHoverInitialized ) {
			return;
		}
		menuItem.addEventListener( 'mouseenter', () => {
			const submenu = menuItem.querySelector( '.videopack-download-submenu' );
			const subTrigger = menuItem.querySelector( '.videopack-download-submenu-trigger' );
			const playerRect = getDownloadPlayerRect( wrapper );
			if ( submenu && subTrigger && playerRect ) {
				window.requestAnimationFrame( () => {
					alignDownloadSubmenu( submenu, subTrigger, playerRect );
				} );
			}
		} );
		menuItem.dataset.videopackSubmenuHoverInitialized = 'true';
	} );

	if ( ! window.videopackDropdownOutsideClickInitialized ) {
		document.addEventListener( 'click', ( e ) => {
			if ( ! e.target.closest( '.videopack-dropdown-wrapper' ) && ! e.target.closest( '.videopack-download-wrapper' ) ) {
				closeAllDownloadDropdowns();
			}
		} );
		window.videopackDropdownOutsideClickInitialized = true;
	}

	if ( ! window.videopackShareOutsideClickInitialized ) {
		document.addEventListener( 'click', ( e ) => {
			if ( ! e.target.closest( '.videopack-share-wrapper' ) && ! e.target.closest( '.videopack-share-container' ) ) {
				document.querySelectorAll( '.videopack-share-wrapper' ).forEach( ( shareWrapper ) => {
					const shareIcon = shareWrapper.querySelector( '.videopack-icons.close' );
					const embedWrapper = shareWrapper._shareContainer || shareWrapper.querySelector( '.videopack-share-container' );
					const clickTrap = shareWrapper._clickTrap || shareWrapper.querySelector( '.videopack-click-trap' );
					if ( shareIcon && embedWrapper && embedWrapper.classList.contains( 'is-visible' ) ) {
						shareIcon.classList.remove( 'close' );
						shareIcon.classList.add( 'share' );
						shareIcon.classList.remove( 'is-active' );
						embedWrapper.classList.remove( 'is-visible' );
						if ( clickTrap ) {
							clickTrap.classList.remove( 'is-visible' );
						}
					}
				} );
			}
		} );
		window.videopackShareOutsideClickInitialized = true;
	}

	// Resolve the parent player container for portal relocations
	const playerContainer = wrapper.closest( '.videopack-player' ) ||
		wrapper.closest( '.videopack-player-relative-wrapper' ) ||
		wrapper.closest( '.videopack-thumbnail-wrapper' ) ||
		wrapper.closest( '.videopack-wrapper' ) ||
		wrapper.closest( '.wp-block-videopack-player-container' ) ||
		wrapper.closest( '.videopack-collection-item' );
	const portalTarget = playerContainer || wrapper;

	// Setup "start at" functionality.
	const embedWrapper = wrapper.querySelector( '.videopack-share-container' );
	if ( embedWrapper ) {
		const startAtEnable = embedWrapper.querySelector( '.videopack-start-at-enable' );
		if ( startAtEnable ) {
			startAtEnable.addEventListener( 'change', () => setStartAt( portalTarget, wrapper ) );
		}
		const startAtInput = embedWrapper.querySelector( '.videopack-start-at' );
		if ( startAtInput ) {
			startAtInput.addEventListener( 'change', () => changeStartAt( portalTarget, wrapper ) );
		}
		const embedInput = embedWrapper.querySelector( '.videopack-embed-code' );
		if ( embedInput ) {
			embedInput.addEventListener( 'click', () => embedInput.select() );
		}

		// Wire up sharing service buttons inside the dropdown
		const nativeBtn = embedWrapper.querySelector( '.videopack-btn-nativeshare' );
		if ( nativeBtn ) {
			if ( ! navigator.share ) {
				nativeBtn.style.display = 'none';
			} else {
				nativeBtn.addEventListener( 'click', ( e ) => {
					e.preventDefault();
					const shareUrl = getShareUrl( wrapper );
					navigator.share( {
						title: document.title,
						url: shareUrl,
					} ).catch( ( err ) => console.log( 'Share failed:', err ) );
				} );
			}
		}

		const copyBtn = embedWrapper.querySelector( '.videopack-btn-copylink' );
		if ( copyBtn ) {
			copyBtn.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				const shareUrl = getShareUrl( wrapper );
				if ( navigator.clipboard && navigator.clipboard.writeText ) {
					navigator.clipboard.writeText( shareUrl ).then( () => {
						copyBtn.classList.add( 'copied' );
						setTimeout( () => copyBtn.classList.remove( 'copied' ), 1500 );
					} );
				} else {
					// Fallback
					const tempInput = document.createElement( 'input' );
					tempInput.value = shareUrl;
					document.body.appendChild( tempInput );
					tempInput.select();
					document.execCommand( 'copy' );
					document.body.removeChild( tempInput );
					copyBtn.classList.add( 'copied' );
					setTimeout( () => copyBtn.classList.remove( 'copied' ), 1500 );
				}
			} );
		}

		const bskyBtn = embedWrapper.querySelector( '.videopack-btn-bluesky' );
		if ( bskyBtn ) {
			bskyBtn.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				const shareUrl = getShareUrl( wrapper );
				const text = `${ document.title } ${ shareUrl }`;
				openPopup( `https://bsky.app/intent/compose?text=${ encodeURIComponent( text ) }`, 'share_bluesky' );
			} );
		}

		const threadsBtn = embedWrapper.querySelector( '.videopack-btn-threads' );
		if ( threadsBtn ) {
			threadsBtn.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				const shareUrl = getShareUrl( wrapper );
				const text = `${ document.title } ${ shareUrl }`;
				openPopup( `https://www.threads.net/intent/post?text=${ encodeURIComponent( text ) }`, 'share_threads' );
			} );
		}

		const fbBtn = embedWrapper.querySelector( '.videopack-btn-facebook' );
		if ( fbBtn ) {
			fbBtn.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				const shareUrl = getShareUrl( wrapper );
				openPopup( `https://www.facebook.com/sharer/sharer.php?u=${ encodeURIComponent( shareUrl ) }`, 'share_facebook' );
			} );
		}

		const redditBtn = embedWrapper.querySelector( '.videopack-btn-reddit' );
		if ( redditBtn ) {
			redditBtn.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				const shareUrl = getShareUrl( wrapper );
				openPopup( `https://www.reddit.com/submit?url=${ encodeURIComponent( shareUrl ) }&title=${ encodeURIComponent( document.title ) }`, 'share_reddit' );
			} );
		}

		const emailBtn = embedWrapper.querySelector( '.videopack-btn-email' );
		if ( emailBtn ) {
			emailBtn.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				const shareUrl = getShareUrl( wrapper );
				window.location.href = `mailto:?subject=${ encodeURIComponent( document.title ) }&body=${ encodeURIComponent( shareUrl ) }`;
			} );
		}
	}

	wrapper.querySelectorAll( '.videopack-download-link[download]' ).forEach( ( downloadLink ) => {
		if ( downloadLink.dataset.videopackDownloadInitialized ) {
			return;
		}
		if ( downloadLink.dataset.alt_link ) {
			downloadLink.addEventListener( 'click', ( e ) => {
				e.preventDefault();
				checkDownloadLink( downloadLink );
			} );
		}
		downloadLink.dataset.videopackDownloadInitialized = 'true';
	} );

	// Portal fix: Lift the share overlay container and click-trap to the player container root
	// so they are not trapped by inner layout/position bounds of the share block.
	const isInsideTitleMeta = wrapper.classList.contains( 'is-inside-title-meta' );
	const isOverlay = wrapper.classList.contains( 'is-overlay' );
	const isInsideThumbnail = wrapper.classList.contains( 'is-inside-thumbnail' );
	const shouldPortal = isInsideTitleMeta || isOverlay || isInsideThumbnail;

	const shareContainer = wrapper.querySelector( '.videopack-share-container' );
	const clickTrap = wrapper.querySelector( '.videopack-click-trap' );

	wrapper._shareContainer = shareContainer;
	wrapper._clickTrap = clickTrap;

	if ( shouldPortal && playerContainer ) {
		if ( shareContainer && shareContainer.parentElement !== playerContainer ) {
			playerContainer.appendChild( shareContainer );
		}
		if ( clickTrap && clickTrap.parentElement !== playerContainer ) {
			playerContainer.appendChild( clickTrap );
		}
	}

	wrapper.dataset.videopackMetaInitialized = 'true';
}
