/* global videopack_config */

import { useMemo } from '@wordpress/element';

/**
 * Resolves whether an overlay/badge block's background should show.
 *
 * Precedence: the block's own attribute (if explicitly set) -> inherited
 * context (e.g. a parent that provides videopack/showBackground) -> the
 * global option -> isOverlay itself. A background bar makes sense by
 * default when it's actually a bar/badge overlaid on a video or thumbnail;
 * a standalone block (plain text/icon in normal page flow, not overlaid on
 * anything) defaults to no background box instead.
 *
 * @param {Object}  attributes       Block attributes.
 * @param {Object}  context          Block context.
 * @param {boolean} [isOverlay=true] Whether this block is currently
 *                                   rendering as an overlay/badge. Used only
 *                                   as the final fallback default.
 * @return {boolean} Whether the background should show.
 */
export default function useShowBackground(
	attributes,
	context,
	isOverlay = true
) {
	const { showBackground } = attributes;
	const contextValue = context?.[ 'videopack/showBackground' ];
	const globalOptions = videopack_config?.options || {};

	return useMemo( () => {
		if ( showBackground !== undefined ) {
			return !! showBackground;
		}
		if ( contextValue !== undefined ) {
			return !! contextValue;
		}
		return globalOptions.showBackground !== undefined
			? !! globalOptions.showBackground
			: !! isOverlay;
	}, [
		showBackground,
		contextValue,
		globalOptions.showBackground,
		isOverlay,
	] );
}
