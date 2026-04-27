import { useMemo } from '@wordpress/element';
import { getEffectiveValue } from '../utils/context';

export const DESIGN_KEYS = [
	'skin',
	'title_color',
	'title_background_color',
	'play_button_color',
	'play_button_secondary_color',
	'control_bar_bg_color',
	'control_bar_color',
	'pagination_color',
	'pagination_background_color',
	'pagination_active_bg_color',
	'pagination_active_color',
	'watermark',
	'watermark_styles',
	'watermark_link_to',
	'align',
	'gallery_per_page',
	'enable_collection_video_limit',
	'collection_video_limit',
];

/**
 * Hook to resolve Videopack design context and generate styles/classes.
 *
 * @param {Object} attributes Block attributes.
 * @param {Object} context    Block context.
 * @return {Object} Resolved values, styles, and classes.
 */
export default function useVideopackContext(attributes, context) {
	return useMemo(() => {
		const resolved = {};
		const style = {};
		const classes = [];

		DESIGN_KEYS.forEach((key) => {
			const value = getEffectiveValue(key, attributes, context);
			resolved[key] = value;

			if (value) {
				const cssKey = key.replace(/_/g, '-');
				if (typeof value === 'string' || typeof value === 'number') {
					const cssVar = `--videopack-${cssKey}`;
					style[cssVar] = value;
				}
				
				// Only add classes for colors/styles that are actually set
				if (key !== 'skin') {
					classes.push(`videopack-has-${cssKey}`);
				}
			}
		});

		// Special handling for skin class
		if (resolved.skin && resolved.skin !== 'default') {
			classes.push(resolved.skin);
		}

		return {
			resolved,
			style,
			classes: classes.join(' '),
		};
	}, [attributes, context]);
}
