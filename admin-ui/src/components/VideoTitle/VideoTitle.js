/* global videopack_config */

import { RichText, InnerBlocks } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';

import useVideopackContext from '../../hooks/useVideopackContext';
import useVideopackData from '../../hooks/useVideopackData';
import VideopackContextBridge from '../VideopackContextBridge';

const TITLE_CONTEXT_OPTS = {
	excludeKeys: ['downloadlink'],
	classKeys: ['skin', 'title_color', 'title_background_color'],
};

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
 * @param {boolean}  [root0.usePostTitle]        Whether to use the parent post title. Undefined inherits the Collection/Loop's prioritizePostData setting.
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
	usePostTitle,
	linkToPost = false,
	children,
}) {
	const vpContext = useVideopackContext(attributes, context, TITLE_CONTEXT_OPTS);
	const {
		postId: resolvedPostId,
		attachmentId: resolvedAttachmentId,
		prioritizePostData,
	} = vpContext.resolved;

	// Undefined (never explicitly set on this block) inherits the
	// Collection/Loop's prioritizePostData setting; an explicit true/false
	// always wins over it, in either direction.
	const usePostData = usePostTitle ?? !!prioritizePostData;

	// context's parentPostId is the video's real attached-post id, set
	// unconditionally whenever one exists -- unlike resolvedPostId, it isn't
	// gated by the Loop's prioritizePostData toggle, so this block's own
	// usePostTitle override works even when the Loop-level setting disagrees.
	const postId = usePostData
		? context['videopack/parentPostId'] || resolvedPostId || propPostId
		: resolvedAttachmentId || resolvedPostId || propPostId;

	const titleKey = usePostData ? 'parentTitle' : 'title';
	const { data: resolvedTitle, isResolving } = useVideopackData(
		titleKey,
		context
	);
	const displayTitle = decodeEntities(manualTitle || resolvedTitle || '');
	const isLoadingTitle =
		isResolving && !displayTitle && !vpContext.resolved.isPreview;

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

	// Background visibility is controlled by showBackground regardless of
	// overlay status (matches the frontend's non-overlay branch in
	// Modular_Renderer::render_video_title(), which never special-cased
	// this on is_overlay either). has-title-background is the standalone
	// (non-overlay) case specifically -- it only ever gets added when a
	// real custom color is present, since its CSS has no fallback color.
	const hasCustomBackgroundColor = !!vpContext.resolved.title_background_color;
	const barClass = `videopack-video-title videopack-video-title-visible ${
		isOverlay ? 'is-overlay' : ''
	} ${!showBackground ? 'has-no-background' : ''} ${
		showBackground && !isOverlay && hasCustomBackgroundColor
			? 'has-title-background'
			: ''
	} ${isInsideThumbnail ? 'videopack-thumbnail-title' : ''} ${
		isInsidePlayerOverlay || isOverlay ? `position-${position}` : ''
	}`.trim();

	return (
		<div {...blockProps}>
			<div className={`${barClass} has-text-align-${finalTextAlign}`}>
				{isLoadingTitle ? (
					<Spinner />
				) : (
					finalOverlayTitle &&
					(() => {
						const richText = (
							<RichText
								tagName={Tag}
								className={`${titleClass} has-text-align-${finalTextAlign} ${vpContext.classes}`}
								style={vpContext.style}
								value={displayTitle}
								onChange={onTitleChange}
								placeholder={placeholder}
								allowedFormats={[
									'core/bold',
									'core/italic',
									'core/strikethrough',
								]}
								// Only the real Edit component passes onTitleChange (it wires up
								// setAttributes). Everywhere else this renders — Loop's templated
								// preview items, the settings-page preview, the classic-editor
								// preview — has nowhere to persist an edit, so RichText must not
								// accept one; an editable field that silently discards changes
								// just looks broken to a user.
								readOnly={!onTitleChange}
							/>
						);

						// A real <a> (rather than a CSS class faking the look) so the
						// active theme's own link styling — whatever it actually is —
						// applies here the same way it will on the frontend
						// (Modular_Renderer::render_video_title() wraps the title in
						// exactly this class there). href="#" + preventDefault keeps
						// it inert instead of navigating away mid-edit; the heading
						// tag stays nested inside so it's still announced as a
						// heading, matching <h3><a>Title</a></h3> semantics.
						return linkToPost ? (
							<a
								href="#"
								className="videopack-title-link"
								onClick={(e) => e.preventDefault()}
							>
								{richText}
							</a>
						) : (
							richText
						);
					})()
				)}
				{!isLoadingTitle && isOverlay && (
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
							{children || (
								<InnerBlocks
									allowedBlocks={[
										'videopack/download',
										'videopack/share',
									]}
									template={[]}
									templateLock={false}
								/>
							)}
						</VideopackContextBridge>
					</div>
				)}
			</div>
		</div>
	);
}
