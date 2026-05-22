import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import Edit from './edit';
import metadata from './block.json';
import { videopackTitle as icon } from '../../assets/icon';

registerBlockType(metadata.name, {
	icon,
	edit: Edit,
	save: () => <InnerBlocks.Content />, // Dynamic block with inner blocks
});
