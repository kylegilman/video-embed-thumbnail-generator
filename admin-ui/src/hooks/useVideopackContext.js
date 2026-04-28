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

		// Handle Gutenberg "style" attribute (typography, spacing, etc).
		if (attributes.style && typeof attributes.style === 'object') {
			// Typography Support
			if (attributes.style.typography) {
				const { fontSize, lineHeight, letterSpacing } =
					attributes.style.typography;
				if (fontSize) {
					if (fontSize.startsWith('var:preset|font-size|')) {
						const slug = fontSize.split('|').pop();
						style.fontSize = `var(--wp--preset--font-size--${slug})`;
					} else {
						style.fontSize = fontSize;
					}
				}
				if (lineHeight) style.lineHeight = lineHeight;
				if (letterSpacing) style.letterSpacing = letterSpacing;
			}

			// Spacing Support (Margin/Padding)
			if (attributes.style.spacing) {
				Object.entries(attributes.style.spacing).forEach(
					([type, values]) => {
						if (values && typeof values === 'object') {
							Object.entries(values).forEach(([dir, val]) => {
								let finalVal = val;
								if (
									typeof val === 'string' &&
									val.startsWith('var:preset|spacing|')
								) {
									const slug = val.split('|').pop();
									finalVal = `var(--wp--preset--spacing--${slug})`;
								}
								style[`${type}${dir.charAt(0).toUpperCase()}${dir.slice(1)}`] = finalVal;
							});
						}
					}
				);
			}
		}

		// Handle Gutenberg Typography Classes (Presets)
		if (attributes.fontSize) {
			classes.push(`has-${attributes.fontSize}-font-size`);
		}
		if (attributes.fontFamily) {
			classes.push(`has-${attributes.fontFamily}-font-family`);
		}

		return {
			resolved,
			style,
			classes: classes.join(' '),
		};
	}, [attributes, context]);
}
