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
} from '@wordpress/icons';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import { getEffectiveValue } from '../../utils/context';
import { getColorFallbacks } from '../../utils/colors';
import useVideopackContext from '../../hooks/useVideopackContext';
import './editor.scss';

/**
 * An internal component to display the video title with correct styling and data.
 */
export function VideoTitle({
	blockProps,
	postId,
	title: manualTitle,
	tagName: Tag = 'h3',
	textAlign,
	isOverlay = false,
	downloadlink = false,
	embedcode = false,
	embedlink,
	overlay_title = true,
	showBackground = true,
	onTitleChange,
	isInsideThumbnail,
	isInsidePlayerOverlay,
	position: attrPosition,
	attributes = {},
	context = {}
}) {
	const vpContext = useVideopackContext(attributes, context);
	const { attachmentTitle, isResolving } = useSelect(
		(select) => {
			if (!postId || postId < 1) {
				return { attachmentTitle: '', isResolving: false };
			}
			const { getEntityRecord, isResolving: isResolvingSelector } =
				select('core');
			const record = getEntityRecord('postType', 'attachment', postId);
			return {
				attachmentTitle: record?.title?.rendered,
				isResolving: isResolvingSelector('getEntityRecord', [
					'postType',
					'attachment',
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
	const displayTitle = decodeEntities(
		manualTitle || titleFromContext || attachmentTitle || ''
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
	const finalTextAlign = textAlign || (isInsideThumbnail ? 'center' : isOverlay ? 'left' : undefined);

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
				{overlay_title && (
					<RichText
						tagName={Tag}
						className={titleClass}
						value={displayTitle}
						onChange={onTitleChange}
						placeholder={placeholder}
					/>
				)}
				{isOverlay && (
					<div className={iconsClass}>
						{embedcode && (
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
						{downloadlink && (
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
			{isOverlay && embedcode && (
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
	const postId = context['videopack/postId'];
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
	} = attributes;

	const vpContext = useVideopackContext(attributes, context);

	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
	const isInsidePlayerContainer = !!context['videopack/isInsidePlayerContainer'];

	// Derived defaults that don't fight with user saved attributes
	const position = attrPosition || (isInsideThumbnail ? 'bottom' : 'top');
	const textAlign = attrTextAlign || (isInsideThumbnail ? 'center' : 'left');

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
				title_color: getEffectiveValue('title_color', {}, context),
				title_background_color: getEffectiveValue('title_background_color', {}, context),
			}),
		[context]
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
								overlay_title
									? __(
											'Hide Title',
											'video-embed-thumbnail-generator'
									  )
									: __(
											'Show Title',
											'video-embed-thumbnail-generator'
									  )
							}
							isPressed={overlay_title}
							onClick={() =>
								setAttributes({ overlay_title: !overlay_title })
							}
						/>
						<ToolbarButton
							icon={shareIcon}
							label={__(
								'Embed/Share Button',
								'video-embed-thumbnail-generator'
							)}
							isPressed={embedcode}
							onClick={() =>
								setAttributes({ embedcode: !embedcode })
							}
						/>
						<ToolbarButton
							icon={downloadIcon}
							label={__(
								'Download Button',
								'video-embed-thumbnail-generator'
							)}
							isPressed={downloadlink}
							onClick={() =>
								setAttributes({ downloadlink: !downloadlink })
							}
						/>
						<ToolbarButton
							icon={backgroundIcon}
							label={
								showBackground
									? __(
											'Hide Background Bar',
											'video-embed-thumbnail-generator'
									  )
									: __(
											'Show Background Bar',
											'video-embed-thumbnail-generator'
									  )
							}
							isPressed={showBackground}
							onClick={() =>
								setAttributes({
									showBackground: !showBackground,
								})
							}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls>
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
				title={title}
				clientId={clientId}
				isInsideThumbnail={isInsideThumbnail}
				isInsidePlayerOverlay={isInsidePlayerOverlay}
				isOverlay={isOverlay}
				{...attributes}
				context={context}
				onTitleChange={(newTitle) => setAttributes({ title: newTitle })}
			/>
		</>
	);
}
