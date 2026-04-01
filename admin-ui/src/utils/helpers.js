/**
 * Helper functions for Videopack shortcodes and options.
 */

/**
 * Normalizes Videopack options, ensuring correct types and defaults.
 *
 * @param {Object} options The raw options to normalize.
 */
export const normalizeOptions = (options) => {
	const normalized = { ...options };

	// Boolean conversions
	const booleans = [
		'autoplay',
		'loop',
		'muted',
		'controls',
		'playback_rate',
		'playsinline',
		'downloadlink',
		'overlay_title',
		'nativecontrolsfortouch',
		'pauseothervideos',
		'right_click',
		'auto_res',
		'auto_codec',
	];

	booleans.forEach((key) => {
		if (Object.prototype.hasOwnProperty.call(normalized, key)) {
			normalized[key] =
				normalized[key] === 'true' || normalized[key] === true;
		}
	});

	// Number conversions
	const numbers = [
		'width',
		'height',
		'auto_thumb_number',
		'auto_thumb_position',
	];
	numbers.forEach((key) => {
		if (Object.prototype.hasOwnProperty.call(normalized, key)) {
			normalized[key] = Number(normalized[key]);
		}
	});

	return normalized;
};

/**
 * Generates a WordPress shortcode string from an attributes object.
 *
 * @param {string} tag        The shortcode tag name.
 * @param {Object} attributes The attributes for the shortcode.
 * @param {string} content    Optional. The content enclosed by the shortcode.
 */
export const generateShortcode = (tag, attributes, content = '') => {
	let shortcode = `[${tag}`;

	Object.keys(attributes).forEach((key) => {
		const val = attributes[key];
		if (val !== undefined && val !== null && val !== '') {
			shortcode += ` ${key}="${val}"`;
		}
	});

	shortcode += `]${content}[/${tag}]`;

	return shortcode;
};

/**
 * Rudimentary parser for Videopack shortcodes.
 *
 * @param {string} shortcode The shortcode string to parse.
 */
export const parseShortcode = (shortcode) => {
	const regex = /\[(\w+)\s+([^\]]+)\]/g;
	const match = regex.exec(shortcode);
	if (!match) {
		return null;
	}

	const tag = match[1];
	const attrString = match[2];
	const attributes = {};

	const attrRegex = /(\w+)="([^"]*)"/g;
	let attrMatch;
	while ((attrMatch = attrRegex.exec(attrString)) !== null) {
		attributes[attrMatch[1]] = attrMatch[2];
	}

	return { tag, attributes };
};
