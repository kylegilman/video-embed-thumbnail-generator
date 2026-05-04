/* global videopack_config */
import { useEffect, useMemo } from '@wordpress/element';
import {
	useBlockProps,
	BlockControls,
	HeadingLevelDropdown,
	BlockVerticalAlignmentControl,
	AlignmentControl,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	ToolbarGroup,
	ToolbarButton,
	PanelBody,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	share as shareIcon,
	download as downloadIcon,
	title as titleIcon,
	background as backgroundIcon,
} from '@wordpress/icons';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import VideoTitle from '../../components/VideoTitle/VideoTitle';
import { getColorFallbacks } from '../../utils/colors';
import useVideopackContext from '../../hooks/useVideopackContext';
import './editor.scss';

/**
 * Edit component for the Videopack Video Title block.
 *
 * @param {Object}   root0               Component props.
 * @param {string}   root0.clientId      Block client ID.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @return {Element}                     The rendered component.
 */
export default function Edit({ clientId, attributes, setAttributes, context }) {
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
	const isInsidePlayerContainer =
		!!context['videopack/isInsidePlayerContainer'];

	// Derived defaults that don't fight with user saved attributes
	const position = attrPosition || (isInsideThumbnail ? 'bottom' : 'top');
	const textAlign = attrTextAlign || (isInsideThumbnail ? 'center' : 'left');

	const globalOptions = videopack_config?.options || {};
	const finalDownloadLink =
		downloadlink !== undefined
			? downloadlink
			: !!globalOptions.downloadlink;
	const finalEmbedCode =
		embedcode !== undefined ? embedcode : !!globalOptions.embedcode;
	const finalOverlayTitle = useMemo(() => {
		if (overlay_title !== undefined) {
			return !!overlay_title;
		}
		return globalOptions.overlay_title !== undefined
			? !!globalOptions.overlay_title
			: true;
	}, [overlay_title, globalOptions.overlay_title]);

	const finalShowBackground = useMemo(() => {
		if (showBackground !== undefined) {
			return !!showBackground;
		}
		return globalOptions.showBackground !== undefined
			? !!globalOptions.showBackground
			: true;
	}, [showBackground, globalOptions.showBackground]);

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
	}, [
		isInsideThumbnail,
		attributes.downloadlink,
		attributes.embedcode,
		setAttributes,
	]);

	const isOverlay =
		explicitIsOverlay !== undefined
			? explicitIsOverlay
			: isInsideThumbnail || isInsidePlayerOverlay;
	const wrapperClass = 'videopack-video-title-wrapper';

	const THEME_COLORS = videopack_config?.themeColors;

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				title_color: vpContext.resolved.title_color,
				title_background_color:
					vpContext.resolved.title_background_color,
			}),
		[
			vpContext.resolved.title_color,
			vpContext.resolved.title_background_color,
		]
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
								setAttributes({
									overlay_title: !finalOverlayTitle,
								})
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
								setAttributes({
									downloadlink: !finalDownloadLink,
								})
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
				{!vpContext.resolved.isStandalone && (
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
				)}
				<PanelBody
					title={__('Colors', 'video-embed-thumbnail-generator')}
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
				embedlink={embedlink}
				onTitleChange={(newTitle) => setAttributes({ title: newTitle })}
				usePostTitle={usePostTitle}
				linkToPost={linkToPost}
			/>
		</>
	);
}
