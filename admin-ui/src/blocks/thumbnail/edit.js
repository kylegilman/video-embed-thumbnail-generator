import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	BlockContextProvider,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, Placeholder } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { VideoThumbnailPreview } from './VideoThumbnailPreview';

import './editor.scss';

/**
 * Thumbnail Edit Component
 *
 * @param {Object}   root0               Component props
 * @param {Object}   root0.attributes    Block attributes
 * @param {Function} root0.setAttributes Attribute setter
 * @param {Object}   root0.context       Block context
 * @param            root0.clientId
 * @return {Element} Thumbnail edit component
 */
export default function Edit({ attributes, setAttributes, context, clientId }) {
	const { postId } = context;
	const { linkTo, style } = attributes;

	const blockProps = useBlockProps({
		className: 'videopack-thumbnail-block',
	});

	/**
	 * For the template preview itself, we can derive the duotone class from attributes.
	 * This is essentially a local version of the sync logic in VideoLoop.
	 */
	const duotone = style?.color?.duotone;
	let resolvedDuotoneClass = '';
	if (
		typeof duotone === 'string' &&
		duotone.startsWith('var:preset|duotone|')
	) {
		resolvedDuotoneClass = `wp-duotone-${duotone.split('|').pop()}`;
	} else if (Array.isArray(duotone)) {
		// For custom duotones in the template, we'll let Gutenberg's native block-item class handle the filter.
		// However, we use a stable prefix for previews to match VideoLoop's custom filter logic.
		resolvedDuotoneClass = `videopack-custom-duotone-${clientId.split('-')[0]}`;
	}

	if (!postId) {
		return (
			<div {...blockProps}>
				<Placeholder
					icon="format-video"
					label={__(
						'Video Thumbnail',
						'video-embed-thumbnail-generator'
					)}
					instructions={__(
						'This block displays the video thumbnail when placed inside a Videopack Collection.',
						'video-embed-thumbnail-generator'
					)}
				/>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__(
						'Thumbnail Settings',
						'video-embed-thumbnail-generator'
					)}
				>
					<SelectControl
						label={__('Link To', 'video-embed-thumbnail-generator')}
						value={linkTo}
						options={[
							{
								label: __(
									'None',
									'video-embed-thumbnail-generator'
								),
								value: 'none',
							},
							{
								label: __(
									'Lightbox',
									'video-embed-thumbnail-generator'
								),
								value: 'lightbox',
							},
							{
								label: __(
									'Direct Link',
									'video-embed-thumbnail-generator'
								),
								value: 'file',
							},
							{
								label: __(
									'Attachment Page',
									'video-embed-thumbnail-generator'
								),
								value: 'post',
							},
						]}
						onChange={(value) => setAttributes({ linkTo: value })}
					/>
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>
				<BlockContextProvider
					value={{
						postId,
						'videopack/skin': context['videopack/skin'],
						'videopack/play_button_color': context['videopack/play_button_color'],
						'videopack/play_button_icon_color': context['videopack/play_button_icon_color'],
					}}
				>
					<VideoThumbnailPreview
						postId={postId}
						skin={context?.['videopack/skin']}
						resolvedDuotoneClass={resolvedDuotoneClass}
					>
						<InnerBlocks
							templateLock={false}
							renderAppender={InnerBlocks.ButtonBlockAppender}
						/>
					</VideoThumbnailPreview>
				</BlockContextProvider>
			</div>
		</>
	);
}
