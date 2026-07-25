/**
 * Video title show/hide on play/pause/ended.
 */

/**
 * Sets up video title visibility and hover behavior for a given player.
 *
 * @param {HTMLElement} playerWrapper The player wrapper element.
 * @param {object}      player        The player instance (Video.js, a native <video>, or MEJS).
 * @param {object}      videoVars     The video variables.
 */
export function setupVideoTitle( playerWrapper, player, videoVars ) {
	const getMetaElements = () => {
		// Search both inside the player and in the immediate parent (for cases where they aren't moved yet)
		const elements = Array.from( playerWrapper.querySelectorAll( '.videopack-video-title, .videopack-meta-wrapper' ) );
		const parent = playerWrapper.closest( '.videopack-wrapper' );
		if ( parent ) {
			Array.from( parent.querySelectorAll( '.videopack-video-title, .videopack-meta-wrapper' ) ).forEach( ( el ) => {
				if ( ! elements.includes( el ) ) {
					elements.push( el );
				}
			} );
		}
		return elements;
	};

	const isMejs = 'WordPress Default' === videoVars.embed_method;
	const video = isMejs ? player.media : ( player.tagName === 'VIDEO' ? player : ( player.el ? player.el().querySelector( 'video' ) : null ) );

	const showMeta = () => {
		getMetaElements().forEach( ( el ) => el.classList.add( 'videopack-video-title-visible' ) );
	};
	const hideMeta = () => {
		getMetaElements().forEach( ( el ) => el.classList.remove( 'videopack-video-title-visible' ) );
	};

	if ( isMejs && video ) {
		video.addEventListener( 'play', hideMeta );
		video.addEventListener( 'pause', showMeta );
		video.addEventListener( 'ended', showMeta );
	} else if ( player && ! isMejs ) {
		if ( typeof player.on === 'function' ) {
			player.on( 'play', hideMeta );
			player.on( 'pause', showMeta );
			player.on( 'ended', showMeta );
		} else if ( typeof player.addEventListener === 'function' ) {
			player.addEventListener( 'play', hideMeta );
			player.addEventListener( 'pause', showMeta );
			player.addEventListener( 'ended', showMeta );
		}
	}
}
