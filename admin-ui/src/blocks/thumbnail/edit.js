/* global videopack_config */
import {
	useBlockProps,
	InnerBlocks,
	BlockContextProvider,
	BlockControls,
} from '@wordpress/block-editor';
import {
	Placeholder,
	Spinner,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	fullscreen as lightboxIcon,
	page as postIcon,
	notAllowed as noneIcon,
	video as videoIcon,
	post as parentIcon,
	video as placeholderIcon,
} from '@wordpress/icons';
import { useSelect } from '@wordpress/data';
import VideoThumbnailPreview from '../../components/VideoThumbnailPreview/VideoThumbnailPreview';

import useVideopackContext from '../../hooks/useVideopackContext';
import './editor.scss';

/**
 * Thumbnail Edit Component
 *
 * @param {Object}   root0               Component props
 * @param {Object}   root0.attributes    Block attributes
 * @param {Function} root0.setAttributes Attribute setter
 * @param {Object}   root0.context       Block context
 * @param {string}   root0.clientId      Block client ID
 * @param {boolean}  root0.isSelected    Whether this block is currently selected
 * @return {Element} Thumbnail edit component
 */
export default function Edit({
	attributes,
	setAttributes,
	context,
	clientId,
	isSelected,
}) {
	const vpContext = useVideopackContext(attributes, context);
	const attachmentId = vpContext.resolved.attachmentId;
	const isDiscovering = vpContext.resolved.isDiscovering;
	const { linkTo } = attributes;

	const blockProps = useBlockProps();
	const { latestVideoId, hasSelectedInnerBlock } = useSelect(
		(select) => {
			const { hasSelectedInnerBlock: hasSelectedInner } =
				select('core/block-editor');
			const result = {
				latestVideoId: null,
				hasSelectedInnerBlock: hasSelectedInner(clientId, true),
			};
			// Only discover a fallback video when we don't already have one —
			// otherwise every grid item in a real gallery preview (each with
			// its own known attachmentId) fires this query pointlessly.
			if (
				!vpContext.resolved.isPreview ||
				vpContext.resolved.attachmentId
			) {
				return result;
			}
			const query = {
				post_type: 'attachment',
				mime_type: 'video',
				per_page: 1,
				_fields: 'id',
			};
			const media = select('core').getEntityRecords(
				'postType',
				'attachment',
				query
			);
			return { ...result, latestVideoId: media?.[0]?.id };
		},
		[
			vpContext.resolved.isPreview,
			vpContext.resolved.attachmentId,
			clientId,
		]
	);

	// Only show the thumbnail's own "Add block" appender while this block
	// (or one of its children) is actively selected, so it doesn't clutter
	// the editor whenever some unrelated block elsewhere is selected.
	const showThumbnailAppender = isSelected || hasSelectedInnerBlock;

	const effectiveAttachmentId = attachmentId || latestVideoId;

	// Note: resolvedDuotoneClass is now computed internally by VideoThumbnailPreview
	// from the style attribute.

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
				{(() => {
					if (isDiscovering && !attachmentId) {
						return (
							<div className="videopack-thumbnail-discovery-loading">
								<Spinner />
								<p>
									{__(
										'Searching for attached video…',
										'video-embed-thumbnail-generator'
									)}
								</p>
							</div>
						);
					}

					if (!attachmentId && !vpContext.resolved.isPreview) {
						return (
							<Placeholder
								icon={placeholderIcon}
								label={__(
									'Video Thumbnail',
									'video-embed-thumbnail-generator'
								)}
								instructions={__(
									'This block displays a video thumbnail. Place it inside a Videopack Collection or a post with attached videos.',
									'video-embed-thumbnail-generator'
								)}
							/>
						);
					}

					return (
						<VideoThumbnailPreview
							postId={effectiveAttachmentId}
							video={
								vpContext.resolved.isPreview &&
								!effectiveAttachmentId
									? {
											poster_url:
												videopack_config.url +
												'/src/images/Adobestock_469037984_thumb1.jpg',
										}
									: {}
							}
							linkTo={linkTo}
							context={context}
							attributes={attributes}
							className="videopack-thumbnail-preview"
							resolvedDuotoneClass={undefined}
							clientId={clientId}
						>
							<BlockContextProvider
								value={{
									...context,
									'videopack/isInsideThumbnail': true,
									'videopack/attachmentId': attachmentId,
									'videopack/downloadlink': false,
									'videopack/embedcode': false,
								}}
							>
								<InnerBlocks
									templateLock={false}
									renderAppender={
										showThumbnailAppender
											? InnerBlocks.ButtonBlockAppender
											: false
									}
								/>
							</BlockContextProvider>
						</VideoThumbnailPreview>
					);
				})()}

				{/* Ensure InnerBlocks is always present for Gutenberg validation, even if visually hidden. */}
				{!attachmentId && (
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
