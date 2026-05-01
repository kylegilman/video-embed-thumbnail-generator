/**
 * Shared design attributes and context definitions for Videopack blocks.
 */

export const designAttributes = {
	skin: {
		type: 'string',
	},
	title_color: {
		type: 'string',
	},
	title_background_color: {
		type: 'string',
	},
	play_button_color: {
		type: 'string',
	},
	play_button_secondary_color: {
		type: 'string',
	},
	control_bar_bg_color: {
		type: 'string',
	},
	control_bar_color: {
		type: 'string',
	},
	pagination_color: {
		type: 'string',
	},
	pagination_background_color: {
		type: 'string',
	},
	pagination_active_bg_color: {
		type: 'string',
	},
	pagination_active_color: {
		type: 'string',
	},
	watermark: {
		type: 'string',
	},
	watermark_styles: {
		type: 'object',
	},
	watermark_link_to: {
		type: 'string',
	},
};

export const providesDesignContext = {
	'videopack/skin': 'skin',
	'videopack/title_color': 'title_color',
	'videopack/title_background_color': 'title_background_color',
	'videopack/play_button_color': 'play_button_color',
	'videopack/play_button_secondary_color': 'play_button_secondary_color',
	'videopack/control_bar_bg_color': 'control_bar_bg_color',
	'videopack/control_bar_color': 'control_bar_color',
	'videopack/pagination_color': 'pagination_color',
	'videopack/pagination_background_color': 'pagination_background_color',
	'videopack/pagination_active_bg_color': 'pagination_active_bg_color',
	'videopack/pagination_active_color': 'pagination_active_color',
	'videopack/watermark': 'watermark',
	'videopack/watermark_styles': 'watermark_styles',
	'videopack/watermark_link_to': 'watermark_link_to',
};

export const usesDesignContext = [
	'videopack/skin',
	'videopack/title_color',
	'videopack/title_background_color',
	'videopack/play_button_color',
	'videopack/play_button_secondary_color',
	'videopack/control_bar_bg_color',
	'videopack/control_bar_color',
	'videopack/pagination_color',
	'videopack/pagination_background_color',
	'videopack/pagination_active_bg_color',
	'videopack/pagination_active_color',
	'videopack/watermark',
	'videopack/watermark_styles',
	'videopack/watermark_link_to',
];
