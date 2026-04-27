import { registerBlockType } from '@wordpress/blocks';
import './editor.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

registerBlockType(metadata.name, {
	edit: Edit,
	save,
});
