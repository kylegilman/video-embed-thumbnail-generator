/* global videopack_config */
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import {
	useBlockProps,
	BlockControls,
	HeadingLevelDropdown,
	BlockVerticalAlignmentControl,
	AlignmentControl,
	RichText,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	Spinner,
	ToolbarGroup,
	ToolbarButton,
	Icon,
	PanelBody,
	ToggleControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import {
	share as shareIcon,
	download as downloadIcon,
	close as closeIcon,
	code as embedIcon,
	title as titleIcon,
	background as backgroundIcon,
	post as postIcon,
} from '@wordpress/icons';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import { getColorFallbacks } from '../../utils/colors';
import useVideopackContext from '../../hooks/useVideopackContext';
import './editor.scss';

/**
 * An internal component to display the video title with correct styling and data.
 */
export function VideoTitle({
	blockProps,
	postId: propPostId,
	postType: propPostType,
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
		postType: resolvedPostType,
		prioritizePostData,
	} = vpContext.resolved;

	const postId = (prioritizePostData || usePostTitle)
		? resolvedPostId || propPostId
		: resolvedAttachmentId || resolvedPostId || propPostId;

	const postType = (prioritizePostData || usePostTitle)
		? resolvedPostType || propPostType
		: resolvedAttachmentId
		? 'attachment'
		: resolvedPostType || propPostType;

	const { attachmentTitle, isResolving } = useSelect(
		(select) => {
			if (!postId || postId < 1) {
				return { attachmentTitle: '', isResolving: false };
			}
			const { getEntityRecord, isResolving: isResolvingSelector } =
				select('core');
			const record = getEntityRecord('postType', postType, postId);
			return {
				attachmentTitle: record?.title?.rendered,
				isResolving: isResolvingSelector('getEntityRecord', [
					'postType',
					postType,
					postId,
				]),
			};
		},
		[postId]
	);

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

	const titleFromContext = context['videopack/title'];
	
	// If prioritizing post data, we use the title we fetched for the postId (which will be the parent post).
	// Otherwise, we prefer the title specifically passed in context (the video title).
	const displayTitle = decodeEntities(
		manualTitle ||
			( (vpContext.resolved.prioritizePostData || usePostTitle)
				? attachmentTitle || titleFromContext
				: titleFromContext || attachmentTitle ) ||
			''
	);

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

	if (isResolving && !displayTitle) {
		return <Spinner />;
	}

	const position = attrPosition || (isInsideThumbnail ? 'bottom' : 'top');
	const defaultAlign = isInsideThumbnail ? 'center' : (isOverlay ? 'left' : 'left');
	const finalTextAlign = textAlign || defaultAlign;

	const globalOptions = videopack_config?.options || {};
	const finalDownloadLink = isInsideThumbnail ? false : (downloadlink !== undefined ? downloadlink : !!globalOptions.downloadlink);
	const finalEmbedCode = isInsideThumbnail ? false : (embedcode !== undefined ? embedcode : !!globalOptions.embedcode);
	const finalOverlayTitle = overlay_title !== undefined ? overlay_title : (globalOptions.overlay_title !== undefined ? !!globalOptions.overlay_title : true);
	const finalShowBackground = showBackground !== undefined ? showBackground : (globalOptions.showBackground !== undefined ? !!globalOptions.showBackground : true);

	let placeholder = __('Video Title', 'video-embed-thumbnail-generator');
	if (postId) {
		placeholder = attachmentTitle
			? __('(Untitled Video)', 'video-embed-thumbnail-generator')
			: '';
	}
	const titleClass = isInsideThumbnail
		? 'videopack-thumbnail-title-text'
		: isOverlay
		? 'videopack-title'
		: 'videopack-video-title';
	const iconsClass = 'videopack-meta-icons';

	const finalBlockProps = blockProps || {
		className: `videopack-video-title-block videopack-video-title-wrapper ${vpContext.classes} ${
			isOverlay ? `is-overlay position-${position}` : ''
		} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${
			isInsidePlayerOverlay ? 'is-inside-player' : ''
		} ${!postId && !manualTitle ? 'no-title' : ''} has-text-align-${finalTextAlign}`,
		style: vpContext.style,
	};

	const barClass = `videopack-video-title ${
		isOverlay ? 'is-overlay' : ''
	} ${!showBackground && isOverlay ? 'has-no-background' : ''} ${
		isInsideThumbnail ? 'videopack-thumbnail-title' : ''
	} ${isInsidePlayerOverlay ? `videopack-title-${position}` : ''}`.trim();

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
						allowedFormats={ [ 'core/bold', 'core/italic', 'core/strikethrough' ] }
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

export default function Edit(props) {
	const { clientId, attributes, setAttributes, context } = props;
	const vpContext = useVideopackContext(attributes, context);
	const { postId, postType } = vpContext.resolved;
	const embedlink = context['videopack/embedlink'];
	const {
		title,
		tagName: Tag = 'h3',
		position: attrPosition,
		isOverlay: explicitIsOverlay,
		textAlign: attrTextAlign,
		downloadlink,
		embedcode,
		title_color,
		title_background_color,
		overlay_title,
		showBackground,
		usePostTitle,
		linkToPost,
	} = attributes;

	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
	const isInsidePlayerContainer = !!context['videopack/isInsidePlayerContainer'];

	// Derived defaults that don't fight with user saved attributes
	const position = attrPosition || (isInsideThumbnail ? 'bottom' : 'top');
	const textAlign = attrTextAlign || (isInsideThumbnail ? 'center' : 'left');

	const globalOptions = videopack_config?.options || {};
	const finalDownloadLink = downloadlink !== undefined ? downloadlink : !!globalOptions.downloadlink;
	const finalEmbedCode = embedcode !== undefined ? embedcode : !!globalOptions.embedcode;
	const finalOverlayTitle = overlay_title !== undefined ? overlay_title : (globalOptions.overlay_title !== undefined ? !!globalOptions.overlay_title : true);
	const finalShowBackground = showBackground !== undefined ? showBackground : (globalOptions.showBackground !== undefined ? !!globalOptions.showBackground : true);

	// For thumbnails, we only disable share and download features
	useEffect(() => {
		if (isInsideThumbnail) {
			const newAttributes = {};
			if (attributes.downloadlink) {
				newAttributes.downloadlink = false;
			}
			if (attributes.embedcode) {
				newAttributes.embedcode = false;
			}

			if (Object.keys(newAttributes).length > 0) {
				setAttributes(newAttributes);
			}
		}
	}, [isInsideThumbnail, attributes.downloadlink, attributes.embedcode, setAttributes]);

	const isOverlay = explicitIsOverlay !== undefined ? explicitIsOverlay : (isInsideThumbnail || isInsidePlayerOverlay);
	const wrapperClass = 'videopack-video-title-wrapper';

	const THEME_COLORS = videopack_config?.themeColors;

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				title_color: vpContext.resolved.title_color,
				title_background_color: vpContext.resolved.title_background_color,
			}),
		[vpContext.resolved.title_color, vpContext.resolved.title_background_color]
	);

	const blockProps = useBlockProps({
		className: `videopack-video-title-block ${wrapperClass} ${vpContext.classes} ${
			isOverlay ? `is-overlay position-${position}` : ''
		} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${
			isInsidePlayerOverlay ? 'is-inside-player' : ''
		} ${!postId && !title ? 'no-title' : ''} has-text-align-${textAlign}`,
		style: vpContext.style,
	});

	return (
		<>
			<BlockControls group="block">
				{!isInsideThumbnail && !isInsidePlayerOverlay && (
					<HeadingLevelDropdown
						value={Tag.replace('h', '') * 1}
						onChange={(newLevel) =>
							setAttributes({ tagName: `h${newLevel}` })
						}
					/>
				)}
				{isOverlay && (
					<BlockVerticalAlignmentControl
						value={position}
						onChange={(nextPosition) => {
							setAttributes({
								position: nextPosition || undefined,
							});
						}}
					/>
				)}
				<AlignmentControl
					value={textAlign}
					onChange={(nextAlign) => {
						setAttributes({ textAlign: nextAlign });
					}}
				/>
				{(isInsidePlayerOverlay || isInsidePlayerContainer) && (
					<ToolbarGroup>
						<ToolbarButton
							icon={titleIcon}
							label={
								finalOverlayTitle
									? __(
											'Hide Title',
											'video-embed-thumbnail-generator'
									  )
									: __(
											'Show Title',
											'video-embed-thumbnail-generator'
									  )
							}
							isPressed={finalOverlayTitle}
							onClick={() =>
								setAttributes({ overlay_title: !finalOverlayTitle })
							}
						/>
						<ToolbarButton
							icon={shareIcon}
							label={__(
								'Embed/Share Button',
								'video-embed-thumbnail-generator'
							)}
							isPressed={finalEmbedCode}
							onClick={() =>
								setAttributes({ embedcode: !finalEmbedCode })
							}
						/>
						<ToolbarButton
							icon={downloadIcon}
							label={__(
								'Download Button',
								'video-embed-thumbnail-generator'
							)}
							isPressed={finalDownloadLink}
							onClick={() =>
								setAttributes({ downloadlink: !finalDownloadLink })
							}
						/>
						<ToolbarButton
							icon={backgroundIcon}
							label={
								finalShowBackground
									? __(
											'Hide Background Bar',
											'video-embed-thumbnail-generator'
									  )
									: __(
											'Show Background Bar',
											'video-embed-thumbnail-generator'
									  )
							}
							isPressed={finalShowBackground}
							onClick={() =>
								setAttributes({
									showBackground: !finalShowBackground,
								})
							}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={__(
						'Data Settings',
						'video-embed-thumbnail-generator'
					)}
					initialOpen={true}
				>
					<ToggleControl
						label={__(
							'Use Post Title',
							'video-embed-thumbnail-generator'
						)}
						help={__(
							'When enabled, this block will display the title of the parent post instead of the video title.',
							'video-embed-thumbnail-generator'
						)}
						checked={usePostTitle}
						onChange={(value) =>
							setAttributes({ usePostTitle: value })
						}
					/>
					<ToggleControl
						label={__(
							'Make title a link',
							'video-embed-thumbnail-generator'
						)}
						help={__(
							'When enabled, the title will link to the parent post.',
							'video-embed-thumbnail-generator'
						)}
						checked={linkToPost}
						onChange={(value) =>
							setAttributes({ linkToPost: value })
						}
					/>
				</PanelBody>
				<PanelBody
					title={__(
						'Colors',
						'video-embed-thumbnail-generator'
					)}
					initialOpen={true}
				>
					<div className="videopack-color-section">
						<p className="videopack-settings-section-title">
							{__('Title Bar', 'video-embed-thumbnail-generator')}
						</p>
						<div className="videopack-color-flex-row">
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Text',
										'video-embed-thumbnail-generator'
									)}
									value={title_color}
									onChange={(value) =>
										setAttributes({ title_color: value })
									}
									colors={THEME_COLORS}
									fallbackValue={colorFallbacks.title_color}
								/>
							</div>
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Background',
										'video-embed-thumbnail-generator'
									)}
									value={title_background_color}
									onChange={(value) =>
										setAttributes({
											title_background_color: value,
										})
									}
									colors={THEME_COLORS}
									fallbackValue={
										colorFallbacks.title_background_color
									}
								/>
							</div>
						</div>
					</div>
				</PanelBody>
			</InspectorControls>
			<VideoTitle
				blockProps={blockProps}
				attributes={attributes}
				postId={postId}
				postType={postType}
				clientId={clientId}
				isInsideThumbnail={isInsideThumbnail}
				isInsidePlayerOverlay={isInsidePlayerOverlay}
				isOverlay={isOverlay}
				context={context}
				onTitleChange={(newTitle) => setAttributes({ title: newTitle })}
				usePostTitle={usePostTitle}
				linkToPost={linkToPost}
			/>
		</>
	);
}
