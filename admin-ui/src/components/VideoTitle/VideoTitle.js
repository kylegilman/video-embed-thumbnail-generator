/* global videopack_config */

import { RichText, InnerBlocks } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

import useVideopackContext from '../../hooks/useVideopackContext';
import useVideopackData from '../../hooks/useVideopackData';
import VideopackContextBridge from '../VideopackContextBridge';

/**
 * An internal component to display the video title with correct styling and data.
 *
 * @param {Object}   root0                       Component props.
 * @param {Object}   root0.blockProps            Block props.
 * @param {number}   root0.postId                Post ID.
 * @param {string}   root0.title                 Manual title override.
 * @param {string}   root0.tagName               HTML tag name.
 * @param {string}   root0.textAlign             Text alignment.
 * @param {boolean}  root0.isOverlay             Whether it's an overlay.
 * @param {Element}  root0.children              Optional preview children (e.g. download block).
 * @param {boolean}  root0.overlay_title         Whether to show title in overlay.
 * @param {boolean}  root0.showBackground        Whether to show background bar.
 * @param {Function} root0.onTitleChange         Callback for title change.
 * @param {boolean}  root0.isInsideThumbnail     Whether it's inside a thumbnail.
 * @param {boolean}  root0.isInsidePlayerOverlay Whether it's inside a player overlay.
 * @param {string}   root0.position              Position (top/bottom).
 * @param {Object}   root0.attributes            Block attributes.
 * @param {Object}   root0.context               Block context.
 * @param {boolean}  root0.usePostTitle          Whether to use parent post title.
 * @param {boolean}  root0.linkToPost            Whether to link to parent post.
 * @return {Element}                             The rendered component.
 */
export default function VideoTitle({
	blockProps,
	postId: propPostId,
	title: manualTitle,
	tagName: Tag = 'h3',
	textAlign,
	isOverlay = false,
	overlay_title,
	showBackground,
	onTitleChange,
	isInsideThumbnail,
	isInsidePlayerOverlay,
	position: attrPosition,
	attributes = {},
	context = {},
	usePostTitle = false,
	linkToPost = false,
	children,
}) {
	const vpContext = useVideopackContext(attributes, context, {
		excludeKeys: ['downloadlink'],
	});
	const {
		postId: resolvedPostId,
		attachmentId: resolvedAttachmentId,
		prioritizePostData,
	} = vpContext.resolved;

	const postId =
		prioritizePostData || usePostTitle
			? resolvedPostId || propPostId
			: resolvedAttachmentId || resolvedPostId || propPostId;

	const titleKey =
		prioritizePostData || usePostTitle ? 'parentTitle' : 'title';
	const { data: resolvedTitle, isResolving } = useVideopackData(
		titleKey,
		context
	);
	const displayTitle = decodeEntities(manualTitle || resolvedTitle || '');

	if (isResolving && !displayTitle && !vpContext.resolved.isPreview) {
		return <Spinner />;
	}

	const position =
		attrPosition ||
		(isInsideThumbnail ? 'bottom' : vpContext.resolved.title_position) ||
		'top';
	let defaultAlign = 'left';
	if (isInsideThumbnail) {
		defaultAlign = 'center';
	}
	const finalTextAlign = textAlign || defaultAlign;

	const globalOptions = videopack_config?.options || {};

	let finalOverlayTitle = true;
	if (overlay_title !== undefined) {
		finalOverlayTitle = !!overlay_title;
	} else if (globalOptions.overlay_title !== undefined) {
		finalOverlayTitle = !!globalOptions.overlay_title;
	}

	let placeholder = __('Video Title', 'video-embed-thumbnail-generator');
	if (postId) {
		placeholder = resolvedTitle
			? __('(Untitled Video)', 'video-embed-thumbnail-generator')
			: '';
	}

	let titleClass = 'videopack-video-title';
	if (isInsideThumbnail) {
		titleClass = 'videopack-thumbnail-title-text';
	} else if (isOverlay) {
		titleClass = 'videopack-title';
	}
	const iconsClass = 'videopack-meta-icons';

	const finalBlockProps = blockProps || {
		className: `videopack-video-title-block videopack-video-title-wrapper ${vpContext.classes} ${
			isOverlay ? `is-overlay position-${position}` : ''
		} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${
			isInsidePlayerOverlay ? 'is-inside-player' : ''
		} ${!postId && !manualTitle ? 'no-title' : ''} has-text-align-${finalTextAlign}`,
		style: vpContext.style,
	};

	const barClass = `videopack-video-title videopack-video-title-visible ${
		isOverlay ? 'is-overlay' : ''
	} ${!showBackground && isOverlay ? 'has-no-background' : ''} ${
		isInsideThumbnail ? 'videopack-thumbnail-title' : ''
	} ${isInsidePlayerOverlay || isOverlay ? `position-${position}` : ''}`.trim();

	return (
		<div {...finalBlockProps}>
			<div className={`${barClass} has-text-align-${finalTextAlign}`}>
				{finalOverlayTitle && (
					<RichText
						tagName={Tag}
						className={`${titleClass} ${vpContext.classes} ${linkToPost ? 'is-link' : ''}`}
						style={vpContext.style}
						value={displayTitle}
						onChange={onTitleChange}
						placeholder={placeholder}
						allowedFormats={[
							'core/bold',
							'core/italic',
							'core/strikethrough',
						]}
					/>
				)}
				{isOverlay && (
					<div className={iconsClass}>
						<VideopackContextBridge
							attributes={attributes}
							context={context}
							overrides={{
								'videopack/isInsideTitleMeta': true,
								...(context['videopack/source_groups'] &&
								Object.keys(context['videopack/source_groups'])
									.length > 0
									? {
											'videopack/source_groups':
												context[
													'videopack/source_groups'
												],
										}
									: {}),
								...(context['videopack/sources']?.length > 0
									? {
											'videopack/sources':
												context['videopack/sources'],
										}
									: {}),
							}}
						>
							{children || (vpContext.resolved.isPreview ? null : (
								<InnerBlocks
									allowedBlocks={[
										'videopack/download',
										'videopack/share',
									]}
									template={[]}
									templateLock={false}
								/>
							))}
						</VideopackContextBridge>
					</div>
				)}
			</div>
		</div>
	);
}
