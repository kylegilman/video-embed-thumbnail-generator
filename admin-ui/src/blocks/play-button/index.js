import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import { videopackPlayButton as icon } from '../../assets/icon';

registerBlockType(metadata.name, {
	icon,
	edit: Edit,
	save,
});
