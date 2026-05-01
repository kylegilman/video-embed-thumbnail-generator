import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import { 
	videopackCollection as icon,
	videopackGallery,
	videopackList,
} from '../../assets/icon';
import { designAttributes } from '../shared/design-context';

registerBlockType(metadata.name, {
	...metadata,
	icon,
	attributes: {
		...metadata.attributes,
		...designAttributes,
	},
	edit: Edit,
	save,
});

registerBlockVariation(metadata.name, [
	{
		name: 'gallery',
		title: 'Videopack Gallery',
		description: 'Display a modular grid of videos.',
		icon: videopackGallery,
		attributes: { 
			layout: 'grid',
			variation: 'gallery',
		},
		scope: ['inserter', 'transform'],
		example: {
			attributes: {
				layout: 'grid',
				gallery_source: 'recent',
				columns: 2,
				gallery_per_page: 2,
				isPreview: true,
			},
		},
		isActive: (blockAttributes) => blockAttributes.variation === 'gallery',
	},
	{
		name: 'list',
		title: 'Videopack List',
		description: 'Display a modular list of videos with overlays.',
		icon: videopackList,
		attributes: { 
			layout: 'list',
			variation: 'list',
		},
		scope: ['inserter', 'transform'],
		example: {
			attributes: {
				layout: 'list',
				gallery_source: 'recent',
				gallery_per_page: 2,
				isPreview: true,
			},
		},
		isActive: (blockAttributes) => blockAttributes.variation === 'list',
	},
]);
