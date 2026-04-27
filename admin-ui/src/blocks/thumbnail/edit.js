import {
	useBlockProps,
	InnerBlocks,
	BlockContextProvider,
	BlockControls,
} from '@wordpress/block-editor';
import {
	ToolbarGroup,
	ToolbarButton,
	Placeholder,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	fullscreen as lightboxIcon,
	page as postIcon,
	notAllowed as noneIcon,
	video as videoIcon,
	post as parentIcon,
} from '@wordpress/icons';
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
	const postId = context['videopack/postId'];
	const { linkTo, style } = attributes;

	const blockProps = useBlockProps();

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

	return (
		<>
			<BlockControls>
				<ToolbarGroup
					label={__('Link To', 'video-embed-thumbnail-generator')}
				>
					<ToolbarButton
						icon={noneIcon}
						label={__('No Link', 'video-embed-thumbnail-generator')}
						onClick={() => setAttributes({ linkTo: 'none' })}
						isPressed={linkTo === 'none'}
					/>
					<ToolbarButton
						icon={lightboxIcon}
						label={__(
							'Open in Pop-up Player',
							'video-embed-thumbnail-generator'
						)}
						onClick={() => setAttributes({ linkTo: 'lightbox' })}
						isPressed={linkTo === 'lightbox'}
					/>
					<ToolbarButton
						icon={parentIcon}
						label={__(
							'Link to Parent Post',
							'video-embed-thumbnail-generator'
						)}
						onClick={() => setAttributes({ linkTo: 'parent' })}
						isPressed={linkTo === 'parent'}
					/>
					<ToolbarButton
						icon={videoIcon}
						label={__(
							'Link to Video File',
							'video-embed-thumbnail-generator'
						)}
						onClick={() => setAttributes({ linkTo: 'file' })}
						isPressed={linkTo === 'file'}
					/>
					<ToolbarButton
						icon={postIcon}
						label={__(
							'Link to Attachment Page',
							'video-embed-thumbnail-generator'
						)}
						onClick={() => setAttributes({ linkTo: 'post' })}
						isPressed={linkTo === 'post'}
					/>
				</ToolbarGroup>
			</BlockControls>
			<div
				{...blockProps}
				className={
					(blockProps.className || '') + ' videopack-thumbnail-block'
				}
			>
				{!postId ? (
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
				) : (
					<VideoThumbnailPreview
						postId={postId}
						resolvedDuotoneClass={resolvedDuotoneClass}
						context={context}
					>
						<BlockContextProvider
							value={{
								...context,
								'videopack/isInsideThumbnail': true,
								'videopack/downloadlink': false,
								'videopack/embedcode': false,
							}}
						>
							<InnerBlocks
								templateLock={false}
								renderAppender={InnerBlocks.ButtonBlockAppender}
							/>
						</BlockContextProvider>
					</VideoThumbnailPreview>
				)}

				{/* Ensure InnerBlocks is always present for Gutenberg validation, even if visually hidden. */}
				{!postId && (
					<div style={{ display: 'none' }}>
						<BlockContextProvider
							value={{
								...context,
								'videopack/isInsideThumbnail': true,
								'videopack/downloadlink': false,
								'videopack/embedcode': false,
							}}
						>
							<InnerBlocks
								templateLock={false}
								renderAppender={InnerBlocks.ButtonBlockAppender}
							/>
						</BlockContextProvider>
					</div>
				)}
			</div>
		</>
	);
}
