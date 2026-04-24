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

	// Helper to check if a value is valid (not undefined, null, or empty string)
	const isValid = (val) => val !== undefined && val !== null;

	// 1. Check local attribute override
	if (isValid(attributes[attrKey])) {
		return attributes[attrKey];
	}

	// 2. Check inherited context (from Collection or Video block)
	if (isValid(context[contextKey])) {
		return context[contextKey];
	}

	// 3. Fallback to global plugin defaults
	const globalOptions = videopack_config?.options || {};
	const globalDefaults = videopack_config?.defaults || {};

	if (attrKey === 'skin') {
		const localValue = attributes[attrKey] || context[contextKey];
		if (isValid(localValue)) {
			return localValue;
		}
		return globalOptions.skin || globalDefaults.skin || videopack_config?.skin || 'vjs-theme-videopack';
	}

	const globalValue = globalOptions[attrKey] ?? globalDefaults[attrKey] ?? videopack_config?.[attrKey];
	const finalValue = isValid(globalValue) ? globalValue : undefined;

	return finalValue;
};
