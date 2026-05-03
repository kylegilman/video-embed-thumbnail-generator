/**
 * Wrapper for Videopack Collection Previews.
 */
export default function CollectionWrapper({ children, attributes = {}, context = {} }) {
	const layout = attributes.layout || context['videopack/layout'] || 'grid';
	const columns = attributes.columns || context['videopack/columns'] || 3;
	const align = attributes.align || context['videopack/align'] || '';

	const play_button_color =
		attributes.play_button_color || context['videopack/play_button_color'];
	const play_button_secondary_color =
		attributes.play_button_secondary_color ||
		context['videopack/play_button_secondary_color'];

	const skin = attributes.skin || context['videopack/skin'] || '';
	const duotone = attributes?.style?.color?.duotone || attributes?.duotone || context['videopack/duotone'];
	let duotoneClass = '';
	if (duotone && typeof duotone === 'string' && duotone.startsWith('var:preset|duotone|')) {
		duotoneClass = `wp-duotone-${duotone.split('|').pop()}`;
	}

	return (
		<div
			className={`videopack-collection videopack-wrapper layout-${layout} columns-${columns}${
				align ? ` align${align}` : ''
			} ${skin} ${
				play_button_color ? 'videopack-has-play-button-color' : ''
			} ${
				play_button_secondary_color
					? 'videopack-has-play-button-secondary-color'
					: ''
			} ${duotoneClass}`}
			style={{
				'--videopack-collection-columns': columns,
				'--videopack-title-color':
					attributes.title_color || context['videopack/title_color'],
				'--videopack-title-background-color':
					attributes.title_background_color ||
					context['videopack/title_background_color'],
				'--videopack-play-button-color':
					attributes.play_button_color ||
					context['videopack/play_button_color'],
				'--videopack-play-button-secondary-color':
					attributes.play_button_secondary_color ||
					context['videopack/play_button_secondary_color'],
			}}
		>
			{children}
		</div>
	);
}
