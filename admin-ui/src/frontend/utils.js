/**
 * Shared pure-logic helpers for the Videopack frontend runtime.
 *
 * No DOM access, no globals — safe to unit test in isolation. Anything
 * here that needs a real `<video>`/DOM element to do its job belongs in a
 * different module.
 */

/**
 * Groups a flat list of sources (which may span multiple codec/format
 * groups) by resolution. Grouping only — callers decide how to reduce
 * each group to what they need (e.g. one representative source for a
 * `<source>` fallback list, or the full candidate list for a menu).
 *
 * @param {Array} sources All sources across every codec group. Each entry
 *                        is expected to have a `resolution` or `data-res` field.
 * @return {Array} `[{ res, candidates }, ...]`, sorted descending by resolution.
 */
export function groupSourcesByResolution( sources ) {
	const byRes = {};
	( sources || [] ).forEach( ( s ) => {
		const res = s.resolution || s[ 'data-res' ];
		if ( ! res ) {
			return;
		}
		if ( ! byRes[ res ] ) {
			byRes[ res ] = [];
		}
		byRes[ res ].push( s );
	} );

	return Object.keys( byRes )
		.map( ( res ) => ( { res, candidates: byRes[ res ] } ) )
		.sort( ( a, b ) => parseInt( b.res, 10 ) - parseInt( a.res, 10 ) );
}

/**
 * Converts a time in seconds to a `mm:ss` (or `h:mm:ss`-style, for the
 * seconds part) timecode string.
 *
 * @param {number} time Time in seconds.
 * @return {string} Formatted timecode.
 */
export function convertToTimecode( time ) {
	const minutes = Math.floor( time / 60 );
	const seconds = Math.round( ( time - minutes * 60 ) * 100 ) / 100;
	let timeDisplay = '';

	timeDisplay += minutes < 10 ? `0${ minutes }` : minutes;
	timeDisplay += ':';
	timeDisplay += seconds < 10 ? `0${ seconds }` : seconds;

	return timeDisplay;
}

/**
 * Converts a `[h:]mm:ss` timecode string to seconds.
 *
 * @param {string} timecode Timecode string.
 * @return {number} Time in seconds.
 */
export function convertFromTimecode( timecode ) {
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
}

/**
 * Strips any existing `t`/`start` query parameters from a URL, so a fresh
 * one can be added without duplicates.
 *
 * @param {string} url The URL to strip.
 * @return {string} The URL with `t`/`start` params removed.
 */
export function stripTimeParams( url ) {
	let result = url.replace( /([?&])t=[^&]*&?/, '$1' );
	result = result.replace( /([?&])start=[^&]*&?/, '$1' );
	result = result.replace( /[?&]$/, '' );
	return result;
}

/**
 * Appends a `t=<seconds>` query parameter to a URL, if seconds is positive.
 *
 * @param {string} url     The URL to append to (assumed already free of a `t` param).
 * @param {number} seconds The start time in seconds.
 * @return {string} The URL, with `t=<seconds>` appended if applicable.
 */
export function addStartTimeParam( url, seconds ) {
	if ( ! seconds || seconds <= 0 ) {
		return url;
	}
	const separator = url.includes( '?' ) ? '&' : '?';
	return `${ url }${ separator }t=${ seconds }`;
}
