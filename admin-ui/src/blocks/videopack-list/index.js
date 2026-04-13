import { registerBlockType } from '@wordpress/blocks';
import edit from './edit';
import save from './save';
import metadata from './block.json';
import './editor.scss';
import './style.scss';
import { videopack as videopackIcon } from '../../assets/icon';

registerBlockType(metadata.name, {
	icon: videopackIcon,
	/**
	 * @see ./edit.js
	 */
	edit,

	/**
	 * @see ./save.js
	 */
	save,
});
