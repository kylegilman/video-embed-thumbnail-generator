import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import './editor.scss';

import { designAttributes } from '../shared/design-context';
import { videopackVideo as icon } from '../../assets/icon';

// usesContext is intentionally excluded from this spread: the static,
// build-time block.json only has this block's own ["postId", "postType"],
// but src/Admin/Ui.php merges that with a much larger, dynamically-computed
// videopack/* list at registration time (Ui.php:453) — server-registered
// metadata already carries both. Passing our own (smaller, stale) local
// copy here would replace, not merge with, that server-provided value.
const { usesContext: _localUsesContext, ...metadataWithoutUsesContext } =
	metadata;

registerBlockType(metadata.name, {
	...metadataWithoutUsesContext,
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
