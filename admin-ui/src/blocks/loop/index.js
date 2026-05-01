import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import { videopackLoop as icon } from '../../assets/icon';

registerBlockType(metadata.name, {
	...metadata,
	icon,
	edit: Edit,
	save,
});
