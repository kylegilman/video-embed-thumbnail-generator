/**
 * Analytics: Google Analytics event dispatch + server-side view/play counting.
 */

/* global videopack_l10n, videopack_config */

/**
 * Sends a video event to Google Analytics (GA4, via `gtag`) if present.
 *
 * Only `gtag` is checked — Universal Analytics (`ga()`/`_gaq`, the
 * `analytics.js`/`ga.js` snippets) stopped processing data in mid-2023,
 * and Jetpack removed its own `__gaTracker` proxy for self-hosted sites in
 * version 13.7 (Aug 2024); `gtag` (GA4) is the one standard every current
 * WordPress analytics plugin (Site Kit, MonsterInsights) still uses.
 *
 * Also always dispatches a generic DOM event so any other analytics
 * integration can listen without this file needing to know its specific
 * global variable name.
 *
 * @param {string} event Event name.
 * @param {string} label Event label (usually the video title).
 */
export function sendGoogleAnalytics( event, label ) {
	if ( typeof window !== 'undefined' && typeof window.gtag === 'function' ) {
		window.gtag( 'event', event, { event_category: 'Videos', event_label: label } );
	}

	if ( typeof document !== 'undefined' ) {
		document.dispatchEvent(
			new CustomEvent( 'videopack:analytics', { detail: { event, label } } )
		);
	}
}

/**
 * Counts video plays and sends data to the server, and fires
 * sendGoogleAnalytics() for every event.
 *
 * Depends on window.videopack.getPlayerVars() (now defined in
 * players/init.js) rather than importing it directly — deliberately, not
 * just provisionally: players/init.js imports from this file's siblings
 * (meta-bar.js, resolution.js) to wire up player setup, so importing
 * getPlayerVars() directly back from players/init.js here would add a new
 * circular-import edge on top of the one that already exists between
 * players/init.js and players/video-js.js. Safe either way, since this is
 * only ever called from event handlers that run well after
 * window.videopack has been fully assembled — just simpler to reason
 * about with one circular edge instead of several.
 *
 * @param {number} playerId The player ID.
 * @param {string} event    The video event (play, pause, seek, end, or a quarter percentage).
 */
export function videoCounter( playerId, event ) {
	const playerWrapper = document.querySelector( `.videopack-player[data-id="${ playerId }"]` );
	if ( ! playerWrapper ) {
		return;
	}
	const videoVars = window.videopack.getPlayerVars( playerWrapper );

	if ( ! videoVars ) {
		return;
	}

	const viewCountWrapper = playerWrapper.closest( '.videopack-wrapper' );
	const viewCountElement = viewCountWrapper ? viewCountWrapper.querySelector( '.videopack-view-count' ) : null;

	let changed = false;
	const played = playerWrapper.dataset.played || 'not played';

	if ( 'play' === event ) {
		if ( 'not played' === played ) { // Play start
			if ( videoVars.countable ) {
				changed = true;
			}
			playerWrapper.dataset.played = 'played';
			sendGoogleAnalytics( videopack_l10n.playstart, videoVars.title );
		} else { // Resume
			sendGoogleAnalytics( videopack_l10n.resume, videoVars.title );
		}
	} else if ( [ 'seek', 'pause', 'end' ].includes( event ) ) {
		if ( 'end' === event && videoVars.countable ) {
			changed = true;
		}
		sendGoogleAnalytics( videopack_l10n[ event ], videoVars.title );
	} else if ( ! isNaN( event ) ) { // Quarter-play
		if ( videoVars.countable ) {
			changed = true;
		}
		sendGoogleAnalytics( `${ event }%`, videoVars.title );
	}

	if ( changed && false !== videoVars.count_views ) {
		const countCondition = videoVars.count_views === 'quarters' ||
			( videoVars.count_views === 'start_complete' && ( 'play' === event || 'end' === event ) ) ||
			( videoVars.count_views === 'start' && 'play' === event );

		if ( countCondition ) {
			// Optimistic UI update: show the incremented count right away
			// rather than waiting on the request below. Overwritten with
			// the authoritative server value once that response arrives.
			// Only for 'play', matching the one place the real response
			// updates this element.
			if ( 'play' === event && viewCountElement ) {
				const optimisticSpan = viewCountElement.tagName === 'SPAN' ? viewCountElement : viewCountElement.querySelector( 'span' );
				const optimisticTarget = optimisticSpan || viewCountElement;
				const match = optimisticTarget.textContent.match( /[\d,.]+/ );
				const digitsOnly = match ? match[ 0 ].replace( /\D/g, '' ) : '';
				if ( digitsOnly ) {
					const incremented = String( parseInt( digitsOnly, 10 ) + 1 ).replace( /\B(?=(\d{3})+(?!\d))/g, ',' );
					optimisticTarget.textContent = optimisticTarget.textContent.replace( match[ 0 ], incremented );
				}
			}

			// admin-ajax, not REST: this fires on every video play, and
			// admin-ajax skips rest_api_init plus the REST server's
			// route-matching/schema/permission-callback overhead for this
			// one hot path, while still running after `init` — same as a
			// REST call would — so other security/rate-limiting plugins on
			// the site get the same chance to inspect the request first.
			// Not deferred: an earlier attempt to schedule this for idle
			// time didn't help — the stall it was working around was
			// traced to a backend/dev-server concurrency limit (confirmed
			// via two unrelated tabs on the same site blocking each
			// other), not a connection-scheduling race, so shifting *when*
			// this fires changes nothing. `priority: 'low'` + `keepalive`
			// are kept as harmless, low-cost hints for real production
			// hosts with more headroom.
			const body = new URLSearchParams( {
				action: 'count_play',
				security: videopack_config.count_play_nonce,
				attachment_id: videoVars.attachment_id,
				video_event: event,
				show_views: viewCountElement ? '1' : '',
			} );

			fetch( videopack_config.ajax_url, {
				method: 'POST',
				body,
				priority: 'low',
				keepalive: true,
			} )
				.then( ( response ) => response.json() )
				.then( ( data ) => {
					if ( 'play' === event && data && data.success && data.data && data.data.views && viewCountElement ) {
						const span = viewCountElement.tagName === 'SPAN' ? viewCountElement : viewCountElement.querySelector( 'span' );
						if ( span ) {
							span.innerHTML = data.data.views;
						} else {
							viewCountElement.innerHTML = data.data.views;
						}
					}
				} )
				.catch( ( error ) => {
					console.error( 'Videopack AJAX Error:', error );
				} );
		}
	}
}
