/* global videopack_config */
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import { RichText } from '@wordpress/block-editor';
import { Spinner, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import {
	share as shareIcon,
	download as downloadIcon,
	close as closeIcon,
	code as embedIcon,
} from '@wordpress/icons';
import useVideopackContext from '../../hooks/useVideopackContext';
import useVideopackData from '../../hooks/useVideopackData';

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
 * @param {boolean}  root0.downloadlink          Whether to show download link.
 * @param {boolean}  root0.embedcode             Whether to show embed code.
 * @param {string}   root0.embedlink             Embed link.
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
	downloadlink,
	embedcode,
	embedlink,
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
}) {
	const vpContext = useVideopackContext(attributes, context);
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

	const [startAtEnabled, setStartAtEnabled] = useState(false);
	const [startAtTime, setStartAtTime] = useState('00:00');
	const [shareIsOpen, setShareIsOpen] = useState(false);
	const randomId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

	const baseEmbedLink = useCallback(() => {
		if (embedlink) {
			return String(embedlink);
		}
		return '';
	}, [embedlink]);

	const [currentEmbedCode, setCurrentEmbedCode] = useState(baseEmbedLink());

	useEffect(() => {
		const originalEmbedLink = baseEmbedLink();
		if (!originalEmbedLink) {
			setCurrentEmbedCode('');
			return;
		}

		// Normalize to a clean URL if it was already an iframe.
		let src = originalEmbedLink;
		if (originalEmbedLink.includes('<iframe')) {
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = originalEmbedLink;
			const iframe = tempDiv.querySelector('iframe');
			src = iframe ? iframe.getAttribute('src') : originalEmbedLink;
		}

		src = src.replace(/&?videopack\[start\]=[^&]*/, '');
		src = src.replace(/\?&/, '?').replace(/\?$/, '');

		if (startAtEnabled && startAtTime) {
			const separator = src.includes('?') ? '&' : '?';
			src += `${separator}videopack[start]=${encodeURIComponent(
				startAtTime
			)}`;
		}

		const allowPolicy =
			'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
		const sandboxPolicy =
			'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-forms';
		const iframeTitle = displayTitle
			? `Video Player - ${displayTitle}`
			: 'Video Player';

		const newEmbedCode = `<iframe src="${src}" width="960" height="540" style="border:0; width:100%; aspect-ratio:16/9;" allow="${allowPolicy}" allowfullscreen credentialless sandbox="${sandboxPolicy}" loading="lazy" title="${iframeTitle}" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

		setCurrentEmbedCode(newEmbedCode);
	}, [startAtEnabled, startAtTime, baseEmbedLink, displayTitle]);

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

	let finalDownloadLink = !!globalOptions.downloadlink;
	if (isInsideThumbnail) {
		finalDownloadLink = false;
	} else if (downloadlink !== undefined) {
		finalDownloadLink = downloadlink;
	}

	let finalEmbedCode = !!globalOptions.embedcode;
	if (isInsideThumbnail) {
		finalEmbedCode = false;
	} else if (embedcode !== undefined) {
		finalEmbedCode = embedcode;
	}

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
			<button
				className={`videopack-click-trap${
					shareIsOpen ? ' is-visible' : ''
				}`}
				onClick={() => {
					setShareIsOpen(false);
				}}
				aria-label={__(
					'Close share overlay',
					'video-embed-thumbnail-generator'
				)}
			/>
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
						{finalEmbedCode && (
							<button
								className={`videopack-icons ${
									shareIsOpen ? 'close' : 'share'
								}`}
								onClick={() => setShareIsOpen(!shareIsOpen)}
								title={
									shareIsOpen
										? __(
												'Close',
												'video-embed-thumbnail-generator'
											)
										: __(
												'Share',
												'video-embed-thumbnail-generator'
											)
								}
							>
								<Icon
									icon={shareIsOpen ? closeIcon : shareIcon}
									className="videopack-icon-svg"
								/>
							</button>
						)}
						{finalDownloadLink && (
							<button className="videopack-icons download">
								<Icon
									icon={downloadIcon}
									className="videopack-icon-svg"
								/>
							</button>
						)}
					</div>
				)}
			</div>
			{isOverlay && finalEmbedCode && (
				<div
					className={`videopack-share-container${
						shareIsOpen ? ' is-visible' : ''
					}`}
				>
					<span className="videopack-embedcode-container">
						<span className="videopack-icons embed">
							<Icon
								icon={embedIcon}
								className="videopack-icon-svg"
							/>
						</span>
						<span>
							{__('Embed:', 'video-embed-thumbnail-generator')}
						</span>
						<span>
							<input
								className="videopack-embed-code"
								type="text"
								value={currentEmbedCode}
								onClick={(e) => e.target.select()}
								readOnly
							/>
						</span>
					</span>
					<span className="videopack-start-at-container">
						<input
							type="checkbox"
							className="videopack-start-at-enable"
							id={`videopack-start-at-enable-block-${randomId}`}
							checked={startAtEnabled}
							onChange={(e) =>
								setStartAtEnabled(e.target.checked)
							}
						/>
						<label
							htmlFor={`videopack-start-at-enable-block-${randomId}`}
						>
							{__('Start at:', 'video-embed-thumbnail-generator')}
						</label>
						<input
							type="text"
							className="videopack-start-at"
							value={startAtTime}
							onChange={(e) => setStartAtTime(e.target.value)}
						/>
					</span>
				</div>
			)}
		</div>
	);
}
