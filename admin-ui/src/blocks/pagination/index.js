import { registerBlockType } from '@wordpress/blocks';
import './editor.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import { videopackPagination as icon } from '../../assets/icon';

registerBlockType(metadata.name, {
	icon,
	edit: Edit,
	save,
});
