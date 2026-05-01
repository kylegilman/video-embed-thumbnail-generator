/* global videopack_config */

/**
 * Helper to check if a value is truthy, handling both booleans and string values from PHP.
 *
 * @param {*} val Value to check.
 * @return {boolean} True if truthy.
 */
export const isTrue = (val) => {
	if (val === true || val === 'true' || val === 1 || val === '1' || val === 'on' || val === 'yes') {
		return true;
	}
	return false;
};

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
	const isValid = (val) => val !== undefined && val !== null && val !== '';

	// 1. Check local attribute override
	if (isValid(attributes[attrKey])) {
		// Special case for isPreview: if local is false but context is true, prefer context true
		if (attrKey === 'isPreview' && !attributes[attrKey] && isTrue(context[contextKey])) {
			return true;
		}
		return attributes[attrKey];
	}
	if (attrKey === 'postId' && isValid(attributes.id) && !isValid(context[contextKey])) {
		return attributes.id;
	}
	if (attrKey === 'attachmentId' && isValid(attributes.id)) {
		return attributes.id;
	}

	// 2. Check inherited context (from Collection or Video block)
	if (isValid(context[contextKey])) {
		return context[contextKey];
	}

	// If we are resolving postType and we have an attachmentId but no explicit postType context,
	// assume it's an attachment.
	if (attrKey === 'postType') {
		const attachmentId = getEffectiveValue('attachmentId', attributes, context);
		const postId = getEffectiveValue('postId', attributes, context);
		if (attachmentId && attachmentId === postId && !isValid(context[contextKey])) {
			return 'attachment';
		}
	}

	// 2b. Check standard Gutenberg context fallbacks
	if (attrKey === 'postType' && isValid(attributes.id) && !isValid(context[contextKey])) {
		return 'attachment';
	}
	if ((attrKey === 'postId' || attrKey === 'postType') && isValid(context[attrKey])) {
		return context[attrKey];
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

	if (attrKey === 'align') {
		const localValue = attributes[attrKey] || context[contextKey];
		if (isValid(localValue)) {
			return localValue;
		}
		// Collections use gallery_align as their global default
		const isCollection = attributes.layout || context['videopack/layout'];
		if (isCollection) {
			return globalOptions.gallery_align || globalOptions.align || globalDefaults.align || '';
		}
		return globalOptions.align || globalDefaults.align || '';
	}

	const globalValue = globalOptions[attrKey] ?? globalDefaults[attrKey] ?? videopack_config?.[attrKey];
	const finalValue = isValid(globalValue) ? globalValue : undefined;

	return finalValue;
};

/**
 * Normalizes video sources from the API into source_groups for the player.
 *
 * @param {Object} videoSources Grouped sources returned from the API.
 * @return {Object} Grouped sources.
 */
export const normalizeSourceGroups = (videoSources) => {
	if (!videoSources || typeof videoSources !== 'object') {
		return {};
	}

	// If it's already in the grouped format { codecId: { label, sources } }, return it
	return videoSources;
};
