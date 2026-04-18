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
import { getColorFallbacks } from '../../utils/colors';
import { getEffectiveValue } from '../../utils/context';

/**
 * An internal component to display the video title with correct styling and data.
 *
 * @param {Object}   props                Component props.
 * @param {Object}   props.blockProps     Merged Gutenberg block props.
 * @param {number}   props.postId         Post ID.
 * @param {string}   props.title          Manual title override.
 * @param {string}   props.tagName        HTML tag name.
 * @param {string}   props.textAlign      Text alignment.
 * @param {boolean}  props.isOverlay      Whether in overlay mode.
 * @param {boolean}  props.downloadlink   Whether download is enabled.
 * @param {boolean}  props.embedcode      Whether sharing is enabled.
 * @param {string}   props.embedlink      Base embed link.
 * @param {boolean}  props.overlay_title  Whether to show title text.
 * @param {boolean}  props.showBackground Whether to show bar background.
 * @param {Function} props.onTitleChange  Callback for title changes.
 * @param {Object}   props.barStyle       Styles for the inner title bar.
 *
 * @return {Object} The component.
 */
export function VideoTitle({
	blockProps,
	postId,
	title: manualTitle,
	tagName: Tag = 'h3',
	textAlign,
	isOverlay,
	downloadlink,
	embedcode,
	embedlink,
	overlay_title,
	showBackground,
	onTitleChange,
	barStyle = {}, // New prop for inner bar styling
	isInsideThumbnail,
	isInsidePlayer,
	position: attrPosition,
	skin,
	title_color,
	title_background_color,
	context = {},
	...attributes // Catch-all for renamed attributes
}) {
	const effectiveEmbedcode = getEffectiveValue('embedcode', attributes, context);
	const effectiveOverlayTitle = getEffectiveValue('overlay_title', attributes, context);
	const effectiveDownloadlink = getEffectiveValue('downloadlink', attributes, context);
	const effectiveShowBackground = getEffectiveValue('showBackground', attributes, context);
	const position = attrPosition || (isInsideThumbnail ? 'bottom' : 'top');
	const effectiveSkin = getEffectiveValue('skin', { skin }, context);
	const effectiveTitleColor = getEffectiveValue('title_color', { title_color }, context);
	const effectiveTitleBgColor = getEffectiveValue('title_background_color', { title_background_color }, context);

	const { attachmentTitle, isResolving } = useSelect(
		(select) => {
			if (!postId) {
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

	const displayTitle = decodeEntities(manualTitle || attachmentTitle || '');
	const finalTextAlign = textAlign || (isInsideThumbnail ? 'center' : isOverlay ? 'left' : undefined);

	let placeholder = __('Video Title', 'video-embed-thumbnail-generator');
	if (postId) {
		placeholder = attachmentTitle
			? __('(Untitled Video)', 'video-embed-thumbnail-generator')
			: '';
	}

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

	const titleClass = isInsideThumbnail ? 'videopack-thumbnail-title-text' : isOverlay ? 'videopack-title' : 'videopack-video-title';
	const iconsClass = 'videopack-meta-icons';

	const finalBlockProps = blockProps || {
		className: `videopack-video-title-block videopack-video-title-wrapper ${effectiveSkin} ${
			isOverlay ? `is-overlay position-${position}` : ''
		} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${
			isInsidePlayer ? 'is-inside-player' : ''
		} ${!postId && !manualTitle ? 'no-title' : ''} ${
			effectiveTitleBgColor ? 'videopack-has-title-background-color' : ''
		} has-text-align-${finalTextAlign}`,
		style: {
			'--videopack-title-color': effectiveTitleColor || undefined,
			'--videopack-title-background-color': effectiveTitleBgColor || undefined,
		},
	};

	if (isResolving) {
		return (
			<div {...finalBlockProps}>
				<Spinner />
			</div>
		);
	}

	const barClass = `videopack-video-title ${
		isOverlay ? 'is-overlay' : ''
	} ${!showBackground && isOverlay ? 'has-no-background' : ''} ${
		isInsideThumbnail ? 'videopack-thumbnail-title' : ''
	} ${isInsidePlayer ? `videopack-title-${position}` : ''}`.trim();

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
				{effectiveOverlayTitle && (
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
						{effectiveEmbedcode && (
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
						{effectiveDownloadlink && (
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
			{isOverlay && effectiveEmbedcode && (
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

	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayer = !!context['videopack/isInsidePlayer'];

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

	// Design attributes are now derived dynamically via getEffectiveValue in the render cycle.
	// We no longer auto-initialize attributes to prevent them from becoming "stale".

	const effectiveDownloadlink = getEffectiveValue('downloadlink', attributes, context);
	const effectiveEmbedcode = getEffectiveValue('embedcode', attributes, context);
	const effectiveOverlayTitle = getEffectiveValue('overlay_title', attributes, context);
	const effectiveShowBackground = getEffectiveValue('showBackground', attributes, context);

	const isOverlay = explicitIsOverlay !== undefined ? explicitIsOverlay : (isInsideThumbnail || isInsidePlayer);
	const wrapperClass = 'videopack-video-title-wrapper';

	const titleColorFallback = context['videopack/title_color'];
	const titleBackgroundColorFallback =
		context['videopack/title_background_color'];

	const THEME_COLORS = videopack_config?.themeColors;

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				title_color: getEffectiveValue('title_color', {}, context),
				title_background_color: getEffectiveValue('title_background_color', {}, context),
			}),
		[context]
	);

	const skin = getEffectiveValue('skin', attributes, context);
	const effectiveTitleColor = getEffectiveValue('title_color', attributes, context);
	const effectiveTitleBgColor = getEffectiveValue('title_background_color', attributes, context);

	const blockProps = useBlockProps({
		className: `videopack-video-title-block ${wrapperClass} ${skin} ${
			isOverlay ? `is-overlay position-${position}` : ''
		} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${
			isInsidePlayer ? 'is-inside-player' : ''
		} ${!postId && !title ? 'no-title' : ''} ${
			effectiveTitleBgColor
				? 'videopack-has-title-background-color'
				: ''
		} has-text-align-${textAlign}`,
		style: {
			'--videopack-title-color': effectiveTitleColor || undefined,
			'--videopack-title-background-color': effectiveTitleBgColor || undefined,
		},
	});

	// No longer building barStyle manually

	return (
		<>
			<BlockControls group="block">
				{!isInsideThumbnail && !isInsidePlayer && (
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
				{isInsidePlayer && (
					<ToolbarGroup>
						<ToolbarButton
							icon={titleIcon}
							label={
								effectiveOverlayTitle
									? __(
											'Hide Title',
											'video-embed-thumbnail-generator'
									  )
									: __(
											'Show Title',
											'video-embed-thumbnail-generator'
									  )
							}
							isPressed={effectiveOverlayTitle}
							onClick={() =>
								setAttributes({ overlay_title: !effectiveOverlayTitle })
							}
						/>
						<ToolbarButton
							icon={shareIcon}
							label={__(
								'Embed/Share Button',
								'video-embed-thumbnail-generator'
							)}
							isPressed={effectiveEmbedcode}
							onClick={() =>
								setAttributes({ embedcode: !effectiveEmbedcode })
							}
						/>
						<ToolbarButton
							icon={downloadIcon}
							label={__(
								'Download Button',
								'video-embed-thumbnail-generator'
							)}
							isPressed={effectiveDownloadlink}
							onClick={() =>
								setAttributes({ downloadlink: !effectiveDownloadlink })
							}
						/>
						<ToolbarButton
							icon={backgroundIcon}
							label={
								effectiveShowBackground
									? __(
											'Hide Background Bar',
											'video-embed-thumbnail-generator'
									  )
									: __(
											'Show Background Bar',
											'video-embed-thumbnail-generator'
									  )
							}
							isPressed={effectiveShowBackground}
							onClick={() =>
								setAttributes({
									showBackground: !effectiveShowBackground,
								})
							}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={__(
						'Videopack: Design',
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
				postId={postId}
				title={title}
				clientId={clientId}
				isInsideThumbnail={isInsideThumbnail}
				isInsidePlayer={isInsidePlayer}
				isOverlay={isOverlay}
				{...attributes}
				context={context}
				onTitleChange={(newTitle) => setAttributes({ title: newTitle })}
			/>
		</>
	);
}
