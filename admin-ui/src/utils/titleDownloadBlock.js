/**
 * Default inner download block for the title meta bar (matches legacy shortcode output).
 */
export const TITLE_DOWNLOAD_BLOCK_ATTRS = {
	icon: true,
	text: false,
	styleType: 'text',
	downloadMode: 'direct',
};

export const TITLE_SHARE_BLOCK_ATTRS = {
	iconType: 'share',
	showText: false,
	styleType: 'text',
};

/**
 * InnerBlocks template for videopack/title when download and/or share should be shown.
 *
 * @param {boolean} includeDownload Whether to include the download block.
 * @param {boolean} includeShare    Whether to include the share block.
 * @return {Array} Block template array.
 */
export const getTitleInnerTemplate = (includeDownload, includeShare) => {
	const template = [];
	if (includeDownload) {
		template.push(['videopack/download', TITLE_DOWNLOAD_BLOCK_ATTRS]);
	}
	if (includeShare) {
		template.push(['videopack/share', TITLE_SHARE_BLOCK_ATTRS]);
	}
	return template;
};
