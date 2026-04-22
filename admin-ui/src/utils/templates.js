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
				options?.overlay_title !== false ? ['videopack/video-title', {}] : null,
			].filter(Boolean),
		],
	];

	const template = [['videopack/video-loop', {}, loopChildren]];

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
		engineChildren.push(['videopack/video-title', {}]);
	}
	if (options?.watermark) {
		engineChildren.push(['videopack/video-watermark', {}]);
	}

	const videoChildren = [
		[
			'videopack/video-player-engine',
			{ lock: { remove: true, move: false } },
			engineChildren,
		],
	];

	if (options?.views) {
		videoChildren.push(['videopack/view-count', {}]);
	}

	const loopChildren = [['videopack/videopack-video', {}, videoChildren]];

	const template = [['videopack/video-loop', {}, loopChildren]];

	if (options?.gallery_pagination) {
		template.push(['videopack/pagination', {}]);
	}

	return template;
};
