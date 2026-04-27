import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import { videopack as videopackIcon } from '../../assets/icon';
import { designAttributes, providesDesignContext } from '../shared/design-context';

registerBlockType(metadata.name, {
	...metadata,
	attributes: {
		...metadata.attributes,
		...designAttributes,
	},
	providesContext: {
		...metadata.providesContext,
		...providesDesignContext,
	},
	edit: Edit,
	save,
});

registerBlockVariation(metadata.name, [
	{
		name: 'gallery',
		title: 'Videopack Gallery',
		description: 'Display a modular grid of videos.',
		icon: 'format-video',
		attributes: { 
			layout: 'grid',
		},
		scope: ['inserter', 'transform'],
		isActive: (blockAttributes) => blockAttributes.layout === 'grid',
	},
	{
		name: 'list',
		title: 'Videopack List',
		description: 'Display a modular list of videos with overlays.',
		icon: 'list-view',
		attributes: { 
			layout: 'list',
		},
		scope: ['inserter', 'transform'],
		isActive: (blockAttributes) => blockAttributes.layout === 'list',
	},
]);
