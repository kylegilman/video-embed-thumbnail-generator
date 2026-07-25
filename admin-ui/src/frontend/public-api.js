/**
 * Videopack cross-plugin public API — window.videopack.api.
 *
 * The single, supported surface for reading per-player metadata that the
 * server embeds via window.videopack.player_data (see Blocks.php). Replaces
 * ad hoc `window.videopack.player_data['videopack_player_' + id]` access
 * scattered across both this plugin and videopack-player-pro.
 *
 * Key format: every rendered `.videopack-player` element's own `data-id`
 * attribute is guaranteed (server-side, see Blocks.php's render_player()/
 * render_player_engine() and Shortcode::prepare_player()) to match the
 * instance id used to build its player_data key — always
 * `'videopack_player_' + dataId`, whether the player is a standalone
 * embed or was rendered inside a gallery/lightbox. Callers never need to
 * guess or reconstruct a different key format per context.
 *
 * Whenever this file changes, diff it against a grep of videopack-player-pro
 * for `window.videopack.` to catch a dropped or renamed export before it ships.
 */

const KEY_PREFIX = 'videopack_player_';

function getPlayerData( key ) {
	if ( typeof window === 'undefined' || ! window.videopack || ! window.videopack.player_data ) {
		return undefined;
	}
	return window.videopack.player_data[ key ];
}

function setPlayerData( key, data ) {
	if ( typeof window === 'undefined' ) {
		return;
	}
	window.videopack = window.videopack || {};
	window.videopack.player_data = window.videopack.player_data || {};
	window.videopack.player_data[ key ] = data;
}

function buildKeyFromId( id ) {
	return KEY_PREFIX + id;
}

/**
 * Looks up player_data for a rendered `.videopack-player` element (or any
 * element inside one), keyed off its own data-id.
 *
 * @param {Element} el Any element inside (or equal to) a `.videopack-player`.
 * @return {object|undefined} The player's metadata, if found.
 */
function getPlayerDataForWrapper( el ) {
	const wrapper = el && typeof el.closest === 'function' ? el.closest( '.videopack-player' ) : null;
	if ( ! wrapper || ! wrapper.dataset.id ) {
		return undefined;
	}
	return getPlayerData( buildKeyFromId( wrapper.dataset.id ) );
}

/**
 * Looks up player_data for a not-yet-rendered gallery/lightbox trigger
 * element that already carries the full canonical key directly, via
 * data-videopack-id (see Blocks.php's render_thumbnail()).
 *
 * @param {Element} el A `[data-videopack-id]` element (e.g. a gallery thumbnail trigger).
 * @return {object|undefined} The referenced player's metadata, if found.
 */
function getPlayerDataForTrigger( el ) {
	if ( ! el || ! el.dataset || ! el.dataset.videopackId ) {
		return undefined;
	}
	return getPlayerData( el.dataset.videopackId );
}

export { getPlayerData, setPlayerData, buildKeyFromId, getPlayerDataForWrapper, getPlayerDataForTrigger };
