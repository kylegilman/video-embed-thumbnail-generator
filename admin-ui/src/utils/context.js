/* global videopack_config */

/**
 * Resolves an effective design value by checking local overrides, inherited context,
 * and finally global plugin defaults.
 *
 * @param {string} key      The key to resolve (e.g., 'skin', 'title_color').
 * @param {Object} attributes The block's own attributes.
 * @param {Object} context    The inherited block context.
 * @return {*} The resolved value.
 */
export const getEffectiveValue = (key, attributes = {}, context = {}) => {
	const contextKey = key.includes('/') ? key : `videopack/${key}`;
	const attrKey = key.includes('/') ? key.split('/')[1] : key;

	// 1. Check local attribute override
	if (attributes[attrKey] !== undefined && attributes[attrKey] !== null && attributes[attrKey] !== '') {
		return attributes[attrKey];
	}

	// 2. Check inherited context (from Collection or Video block)
	if (context[contextKey] !== undefined && context[contextKey] !== null && context[contextKey] !== '') {
		return context[contextKey];
	}

	// 3. Fallback to global plugin defaults
	const globalOptions = videopack_config?.options || {};
	const globalDefaults = videopack_config?.defaults || {};

	if (attrKey === 'skin') {
		return attributes.skin || context['videopack/skin'] || globalOptions.skin || globalDefaults.skin || 'vjs-theme-videopack';
	}

	const val = attributes[attrKey] ?? context[`videopack/${attrKey}`];
	if ( val !== undefined && val !== null ) {
		return val;
	}

	const fallback = globalOptions[attrKey] ?? globalDefaults[attrKey];

	if ( attrKey === 'gallery_per_page' ) {
		console.log( `getEffectiveValue fallback for ${attrKey}:`, fallback );
	}

	return fallback;
};
