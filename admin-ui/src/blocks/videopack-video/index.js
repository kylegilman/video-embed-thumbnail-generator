import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './editor.scss';

import { videopack as videopackIcon } from '../../assets/icon';

import { designAttributes, providesDesignContext } from '../shared/design-context';

registerBlockType(metadata.name, {
	...metadata,
	icon: videopackIcon,
	attributes: {
		...metadata.attributes,
		...designAttributes,
	},
	providesContext: {
		...metadata.providesContext,
		...providesDesignContext,
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
