/**
 * Shared block templates for Videopack collections.
 */

/**
 * Returns the template for a grid/gallery layout.
 *
 * @param {Object} options Plugin or block options.
 * @return {Array} The block template.
 */
export const getGridTemplate = (options) => {
	const loopChildren = [
		[
			'videopack/thumbnail',
			{ linkTo: 'lightbox' },
			[
				['videopack/play-button', {}],
				options?.overlay_title !== false ? ['videopack/title', {}] : null,
			].filter(Boolean),
		],
	];

	const template = [['videopack/loop', {}, loopChildren]];

	if (options?.gallery_pagination) {
		template.push(['videopack/pagination', {}]);
	}
	return template;
};

/**
 * Returns the template for a list layout.
 *
 * @param {Object} options Plugin or block options.
 * @return {Array} The block template.
 */
export const getListTemplate = (options) => {
	const showTitleBar = !!(
		options?.overlay_title ||
		options?.downloadlink ||
		options?.embedcode
	);

	const engineChildren = [];
	if (showTitleBar) {
		engineChildren.push(['videopack/title', {}]);
	}
	if (options?.watermark) {
		engineChildren.push(['videopack/watermark', {}]);
	}

	const videoChildren = [
		[
			'videopack/player',
			{ lock: { remove: true, move: false } },
			engineChildren,
		],
	];

	if (options?.views) {
		videoChildren.push(['videopack/view-count', {}]);
	}

	const loopChildren = [['videopack/player-container', {}, videoChildren]];

	const template = [['videopack/loop', {}, loopChildren]];

	if (options?.gallery_pagination) {
		template.push(['videopack/pagination', {}]);
	}

	return template;
};
/**
 * Returns the template for a feed layout (rich metadata).
 *
 * @param {Object} options Plugin or block options.
 * @return {Array} The block template.
 */
export const getFeedTemplate = (options) => {
	const loopChildren = [
		[
			'videopack/thumbnail',
			{ linkTo: 'parent' },
			[
				['videopack/duration', { position: 'bottom', style: { typography: { fontSize: '14px' } } }],
			]
		],
		['videopack/title', {}],
		['core/post-date', { metadata: { bindings: { datetime: { source: 'core/post-data', args: { field: 'date' } } } } }],
		['videopack/view-count', { iconType: 'playOutline' }],
	];

	const template = [['videopack/loop', {}, loopChildren]];

	if (options?.gallery_pagination) {
		template.push(['videopack/pagination', {}]);
	}

	return template;
};
