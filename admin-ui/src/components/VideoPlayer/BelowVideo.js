/**
 * Component to display metadata below the video player, such as view counts and captions.
 */

import { _n, sprintf, __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';

/**
 * BelowVideo component.
 *
 * @param {Object} props            Component props.
 * @param {Object} props.attributes Block attributes.
 * @return {Element|null} The rendered component.
 */
const BelowVideo = ({ attributes, setAttributes, isSelected }) => {
	const { view_count, caption } = attributes;
	const isEditing = isSelected; // Usually driven by selection in the block editor

	let viewStarts = 0;
	if ((attributes?.starts && view_count) || caption) {
		if (attributes?.starts) {
			viewStarts = Number(attributes?.starts);
		}
		return (
			<>
				<div className="videopack-below-video">
					{view_count && viewStarts > 0 && (
						<div className="videopack-viewcount">
							{sprintf(
								/* translators: %d is number of views */
								_n(
									'%d view',
									'%d views',
									viewStarts,
									'video-embed-thumbnail-generator'
								),
								viewStarts
							)}
						</div>
					)}
					{(caption || isEditing) && (
						<RichText
							tagName="div"
							className="wp-element-caption"
							value={caption}
							onChange={(value) => setAttributes({ caption: value })}
							placeholder={__('Write caption…', 'video-embed-thumbnail-generator')}
							inlineToolbar
						/>
					)}
				</div>
			</>
		);
	}
	return null;
};

export default BelowVideo;
