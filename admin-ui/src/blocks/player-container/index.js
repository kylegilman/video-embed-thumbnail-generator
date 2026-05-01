import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './editor.scss';

import { designAttributes } from '../shared/design-context';
import { videopackVideo as icon } from '../../assets/icon';

registerBlockType(metadata.name, {
	...metadata,
	icon,
	attributes: {
		...metadata.attributes,
		...designAttributes,
	},
	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,
});
