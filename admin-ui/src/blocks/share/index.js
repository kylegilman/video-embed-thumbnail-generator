import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import { share as icon } from '../../assets/icon';
import './index.scss';
import './editor.scss';

registerBlockType(metadata.name, {
	icon,
	edit: Edit,
	save,
});

