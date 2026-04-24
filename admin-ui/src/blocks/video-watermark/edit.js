/* global videopack_config */
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls,
	MediaReplaceFlow,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToolbarGroup,
	ToolbarButton,
	Dropdown,
} from '@wordpress/components';
import { useState, useEffect, useMemo, useRef, useCallback } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import WatermarkPositioner from '../../components/WatermarkPositioner/WatermarkPositioner';
import {
	image as imageIcon,
	link as customIcon,
	home as homeIcon,
	download as downloadIcon,
	page as attachmentIcon,
	post as parentIcon,
	notAllowed as noneIcon,
} from '@wordpress/icons';
import { getEffectiveValue } from '../../utils/context';
import './editor.scss';

/**
 * Internal component to display the watermark with correct positioning and fallback.
 *
 * @param {Object} props         Component props.
 * @param {Object} props.context Block context.
 * @return {Object} The rendered component.
 */
export function VideoWatermark({
	watermark,
	watermark_scale,
	watermark_align,
	watermark_valign,
	watermark_x,
	watermark_y,
	context = {},
	isBlockEditor = false,
	onDimensions = null,
}) {
	const watermarkProps = { watermark, watermark_scale, watermark_align, watermark_valign, watermark_x, watermark_y };
	const effectiveUrl = getEffectiveValue('watermark', { watermark }, context);

	const getEffective = (attrKey, contextKey, fallback) => {
		if (watermarkProps[attrKey] !== undefined && watermarkProps[attrKey] !== null && watermarkProps[attrKey] !== '') {
			return watermarkProps[attrKey];
		}
		const styles = getEffectiveValue('watermark_styles', {}, context);
		if (styles && typeof styles === 'object' && styles[contextKey] !== undefined) {
			return styles[contextKey];
		}
		return getEffectiveValue(`watermark_${contextKey}`, {}, context) ?? fallback;
	};

	const effectiveScale = getEffective('watermark_scale', 'scale', 10);
	const effectiveAlign = getEffective('watermark_align', 'align', 'right');
	const effectiveValign = getEffective('watermark_valign', 'valign', 'bottom');
	const effectiveX = getEffective('watermark_x', 'x', 5);
	const effectiveY = getEffective('watermark_y', 'y', 7);

	const skin = getEffectiveValue('skin', {}, context);

	const actualAlign = effectiveAlign || 'right';
	const actualValign = effectiveValign || 'bottom';
	const actualX = effectiveX !== undefined && effectiveX !== '' ? effectiveX : 5;
	const actualY = effectiveY !== undefined && effectiveY !== '' ? effectiveY : 7;
	const actualScale = effectiveScale !== undefined && effectiveScale !== '' ? effectiveScale : 10;

	const style = {
		position: isBlockEditor ? 'relative' : 'absolute',
		width: effectiveUrl ? `${actualScale}%` : '260px',
		height: 'auto',
		pointerEvents: 'auto',
		transform: '',
	};

	// X Positioning
	if (actualAlign === 'center') {
		style.left = '50%';
		style.transform += 'translateX(-50%) ';
		style.marginLeft = `${-actualX}%`;
	} else {
		style[actualAlign] = `${actualX}%`;
	}

	// Y Positioning
	if (actualValign === 'center') {
		style.top = '50%';
		style.transform += 'translateY(-50%) ';
		style.marginTop = `${-actualY}%`;
	} else {
		style[actualValign] = `${actualY}%`;
	}

	if (!style.transform || isBlockEditor) {
		delete style.transform;
	}

	if (isBlockEditor) {
		delete style.left;
		delete style.right;
		delete style.top;
		delete style.bottom;
		delete style.marginLeft;
		delete style.marginTop;
		style.width = '100%'; // Inner container fills the outer block
	}

	if (!effectiveUrl) {
		return null;
	}

	return (
		<div className={`videopack-video-watermark ${skin}`} style={style}>
			<img
				src={effectiveUrl}
				alt={__('Watermark', 'video-embed-thumbnail-generator')}
				style={{ display: 'block', width: '100%', height: 'auto' }}
				onLoad={(e) => {
					if (onDimensions && e.target.naturalWidth && e.target.naturalHeight) {
						const ratio = e.target.naturalWidth / e.target.naturalHeight;
						onDimensions(ratio);
					}
				}}
			/>
		</div>
	);
}

/**
 * Helper to calculate watermark positioning styles for the block wrapper.
 */
export function getWatermarkBlockStyles(attributes, context) {
	const watermark = attributes.watermark;
	const contextWatermark = context['videopack/watermark'];
	
	const effectiveUrl = getEffectiveValue('watermark', attributes, context);
	if (!effectiveUrl) return {};

	const getEffective = (attrKey, contextKey, fallback) => {
		if (attributes[attrKey] !== undefined && attributes[attrKey] !== null && attributes[attrKey] !== '') {
			return attributes[attrKey];
		}
		const styles = getEffectiveValue('watermark_styles', attributes, context);
		if (styles && typeof styles === 'object' && styles[contextKey] !== undefined) {
			return styles[contextKey];
		}
		return getEffectiveValue(`watermark_${contextKey}`, attributes, context) ?? fallback;
	};

	const effectiveScale = getEffective('watermark_scale', 'scale', 10);
	const effectiveAlign = getEffective('watermark_align', 'align', 'right');
	const effectiveValign = getEffective('watermark_valign', 'valign', 'bottom');
	const effectiveX = getEffective('watermark_x', 'x', 5);
	const effectiveY = getEffective('watermark_y', 'y', 7);

	const style = {
		position: 'absolute',
		width: `${effectiveScale}%`,
		minWidth: '20px', // Prevent total collapse
		minHeight: '20px',
		height: 'auto',
		transform: '',
	};

	if (effectiveAlign === 'center') {
		style.left = '50%';
		style.transform += 'translateX(-50%) ';
		style.marginLeft = `${-effectiveX}%`;
	} else {
		style[effectiveAlign] = `${effectiveX}%`;
	}

	if (effectiveValign === 'center') {
		style.top = '50%';
		style.transform += 'translateY(-50%) ';
		style.marginTop = `${-effectiveY}%`;
	} else {
		style[effectiveValign] = `${effectiveY}%`;
	}

	if (!style.transform) delete style.transform;

	return style;
}

/**
 * Edit component for the Video Watermark block.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update block attributes.
 * @param {Object}   props.context       Block context.
 *
 * @return {Object} The component.
 */
export default function Edit({ attributes, setAttributes, context, isSelected }) {
	const containerRef = useRef(null);
	const [containerDimensions, setContainerDimensions] = useState(null);
	const [detectedAspectRatio, setDetectedAspectRatio] = useState(null);

	// Measure the parent container dimensions for accurate positioning.
	useEffect(() => {
		if (!containerRef.current) return;

		const updateDimensions = () => {
			if (!containerRef.current) return;
			const element = containerRef.current;
			
			// Find the most specific media container to ensure accurate pixel calculations
			const container = element.closest('.videopack-player, .videopack-video-thumbnail-preview, .videopack-wrapper, .videopack-video-block-container, .wp-block-videopack-videopack-video');
			if (container) {
				const rect = container.getBoundingClientRect();
				if (rect.width > 0 && rect.height > 0) {
					setContainerDimensions({
						width: rect.width,
						height: rect.height,
					});
				}
			}
		};

		updateDimensions();

		const observer = new ResizeObserver(updateDimensions);
		const container = containerRef.current.closest('.videopack-player, .videopack-video-thumbnail-preview, .videopack-wrapper, .videopack-video-block-container, .wp-block-videopack-videopack-video');
		if (container) {
			observer.observe(container);
		}

		return () => observer.disconnect();
	}, []);

	const {
		watermark,
		watermark_scale = 10,
		watermark_align = 'right',
		watermark_valign = 'bottom',
		watermark_x = 5,
		watermark_y = 7,
		watermark_link_to = 'false',
		watermark_url = '',
	} = attributes;


	// Resolve effective values with correct priority: 
	// Individual attribute -> Composite context object -> Individual context key -> Default
	const getEffective = (attrKey, contextKey, fallback) => {
		// 1. Local attribute ALWAYS wins if it's explicitly set (and not just defaulting)
		if (attributes[attrKey] !== undefined && attributes[attrKey] !== null && attributes[attrKey] !== '') {
			return attributes[attrKey];
		}
		// 2. Try the composite styles object from context
		const styles = getEffectiveValue('watermark_styles', attributes, context);
		if (styles && typeof styles === 'object' && styles[contextKey] !== undefined) {
			return styles[contextKey];
		}
		// 3. Try individual context key
		return getEffectiveValue(`watermark_${contextKey}`, attributes, context) ?? fallback;
	};

	const effectiveUrl = getEffectiveValue('watermark', attributes, context);
	const effectiveScale = getEffective('watermark_scale', 'scale', 10);
	const effectiveAlign = getEffective('watermark_align', 'align', 'right');
	const effectiveValign = getEffective('watermark_valign', 'valign', 'bottom');
	const effectiveX = getEffective('watermark_x', 'x', 5);
	const effectiveY = getEffective('watermark_y', 'y', 7);

	const effectiveLinkToType = getEffectiveValue('watermark_link_to', attributes, context) || 'false';
	const effectiveCustomLinkUrl = getEffectiveValue('watermark_url', attributes, context) || '';


	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayer = !!context['videopack/isInsidePlayer'];
	const isOverlay = isInsideThumbnail || isInsidePlayer;

	const overlayStyles = isOverlay ? getWatermarkBlockStyles(attributes, context) : {};

	// Implementation of Full-Frame Selection mode:
	// When selected, the block expands to fill the entire container to allow dragging everywhere.
	const activeOverlayStyles = isOverlay && isSelected ? {
		...overlayStyles,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: '100%',
		height: '100%',
		maxWidth: 'none',
		marginLeft: 0,
		marginTop: 0,
		transform: 'none',
	} : overlayStyles;

	const blockProps = useBlockProps({
		className: `videopack-video-watermark-block ${
			isOverlay ? 'is-overlay' : ''
		} ${isSelected ? 'is-selected' : ''}`,
		style: activeOverlayStyles,
	});


	if (!effectiveUrl) {
		return (
			<div {...blockProps} className="videopack-video-watermark-placeholder">
				<MediaPlaceholder
					icon={imageIcon}
					label={__(
						'Watermark Image',
						'video-embed-thumbnail-generator'
					)}
					onSelect={(media) => setAttributes({ watermark: media.url })}
					accept="image/*"
					allowedTypes={['image']}
				/>
			</div>
		);
	}

	return (
		<div {...blockProps}>
			<BlockControls>
				<MediaReplaceFlow
					mediaURL={watermark}
					allowedTypes={['image']}
					accept="image/*"
					onSelect={(media) => setAttributes({ watermark: media.url })}
					name={__(
						'Replace Watermark',
						'video-embed-thumbnail-generator'
					)}
				/>
				<ToolbarGroup label={__('Link To', 'video-embed-thumbnail-generator')}>
					<ToolbarButton
						icon={noneIcon}
						label={__('No Link', 'video-embed-thumbnail-generator')}
						onClick={() => setAttributes({ watermark_link_to: 'false' })}
						isPressed={effectiveLinkToType === 'false'}
					/>
					<ToolbarButton
						icon={homeIcon}
						label={__('Link to Home Page', 'video-embed-thumbnail-generator')}
						onClick={() => setAttributes({ watermark_link_to: 'home' })}
						isPressed={effectiveLinkToType === 'home'}
					/>
					<ToolbarButton
						icon={parentIcon}
						label={__('Link to Parent Post', 'video-embed-thumbnail-generator')}
						onClick={() => setAttributes({ watermark_link_to: 'parent' })}
						isPressed={effectiveLinkToType === 'parent'}
					/>
					<ToolbarButton
						icon={downloadIcon}
						label={__('Download Video', 'video-embed-thumbnail-generator')}
						onClick={() => setAttributes({ watermark_link_to: 'download' })}
						isPressed={effectiveLinkToType === 'download'}
					/>
					<ToolbarButton
						icon={attachmentIcon}
						label={__('Link to Attachment Page', 'video-embed-thumbnail-generator')}
						onClick={() => setAttributes({ watermark_link_to: 'attachment' })}
						isPressed={effectiveLinkToType === 'attachment'}
					/>
					<Dropdown
						popoverProps={{ position: 'bottom center', className: 'videopack-url-popover' }}
						renderToggle={({ isOpen, onToggle }) => (
							<ToolbarButton
								icon={customIcon}
								label={__('Link to Custom URL', 'video-embed-thumbnail-generator')}
								onClick={() => {
									setAttributes({ watermark_link_to: 'custom' });
									onToggle();
								}}
								aria-expanded={isOpen}
								isPressed={effectiveLinkToType === 'custom'}
							/>
						)}
						renderContent={() => (
							<div style={{ padding: '12px', minWidth: '260px' }}>
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={__('Custom URL', 'video-embed-thumbnail-generator')}
									value={watermark_url}
									placeholder="https://..."
									onChange={(value) =>
										setAttributes({ watermark_url: value })
									}
								/>
							</div>
						)}
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={__(
						'Watermark Settings',
						'video-embed-thumbnail-generator'
					)}
					initialOpen={true}
				>
					<RangeControl
						label={__(
							'Scale (%)',
							'video-embed-thumbnail-generator'
						)}
						value={effectiveScale}
						onChange={(value) => setAttributes({ watermark_scale: value })}
						min={1}
						max={100}
					/>
					<div style={{ display: 'flex', gap: '10px' }}>
						<SelectControl
							label={__(
								'Horizontal Align',
								'video-embed-thumbnail-generator'
							)}
							value={effectiveAlign}
							options={[
								{
									label: __(
										'Left',
										'video-embed-thumbnail-generator'
									),
									value: 'left',
								},
								{
									label: __(
										'Center',
										'video-embed-thumbnail-generator'
									),
									value: 'center',
								},
								{
									label: __(
										'Right',
										'video-embed-thumbnail-generator'
									),
									value: 'right',
								},
							]}
							onChange={(value) =>
								setAttributes({ watermark_align: value })
							}
							style={{ flex: 1 }}
						/>
						<SelectControl
							label={__(
								'Vertical Align',
								'video-embed-thumbnail-generator'
							)}
							value={effectiveValign}
							options={[
								{
									label: __(
										'Top',
										'video-embed-thumbnail-generator'
									),
									value: 'top',
								},
								{
									label: __(
										'Center',
										'video-embed-thumbnail-generator'
									),
									value: 'center',
								},
								{
									label: __(
										'Bottom',
										'video-embed-thumbnail-generator'
									),
									value: 'bottom',
								},
							]}
							onChange={(value) =>
								setAttributes({ watermark_valign: value })
							}
							style={{ flex: 1 }}
						/>
					</div>
					<RangeControl
						label={__(
							'Horizontal Offset (%)',
							'video-embed-thumbnail-generator'
						)}
						value={effectiveX}
						onChange={(value) => setAttributes({ watermark_x: value })}
						min={0}
						max={100}
						step={0.01}
					/>
					<RangeControl
						label={__(
							'Vertical Offset (%)',
							'video-embed-thumbnail-generator'
						)}
						value={effectiveY}
						onChange={(value) => setAttributes({ watermark_y: value })}
						min={0}
						max={100}
						step={0.01}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Link to', 'video-embed-thumbnail-generator')}
						value={effectiveLinkToType}
						onChange={(value) =>
							setAttributes({ watermark_link_to: value })
						}
						options={[
							{
								value: 'false',
								label: __(
									'None',
									'video-embed-thumbnail-generator'
								),
							},
							{
								value: 'home',
								label: __(
									'Home page',
									'video-embed-thumbnail-generator'
								),
							},
							{
								value: 'parent',
								label: __(
									'Parent post',
									'video-embed-thumbnail-generator'
								),
							},
							{
								value: 'download',
								label: __(
									'Download video',
									'video-embed-thumbnail-generator'
								),
							},
							{
								value: 'attachment',
								label: __(
									'Video attachment page',
									'video-embed-thumbnail-generator'
								),
							},
							{
								value: 'custom',
								label: __(
									'Custom URL',
									'video-embed-thumbnail-generator'
								),
							},
						]}
					/>
					{effectiveLinkToType === 'custom' && (
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Watermark URL',
								'video-embed-thumbnail-generator'
							)}
							value={effectiveCustomLinkUrl}
							onChange={(value) =>
								setAttributes({ watermark_url: value })
							}
						/>
					)}
				</PanelBody>
			</InspectorControls>
			{isOverlay && containerDimensions && isSelected ? (
				<div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'auto' }}>
					<WatermarkPositioner
						containerDimensions={containerDimensions}
						settings={attributes}
						onChange={(newAttrs) => setAttributes(newAttrs)}
						isSelected={isSelected}
						showBackground={false}
						aspectRatio={detectedAspectRatio}
					>
						<VideoWatermark
							watermark={watermark}
							watermark_scale={watermark_scale}
							watermark_align={watermark_align}
							watermark_valign={watermark_valign}
							watermark_x={watermark_x}
							watermark_y={watermark_y}
							context={context}
							isBlockEditor={true}
							onDimensions={setDetectedAspectRatio}
						/>
					</WatermarkPositioner>
				</div>
			) : (
				<div ref={containerRef} style={{ ... (isOverlay ? { width: '100%', height: '100%', position: 'relative' } : {}) }}>
					<VideoWatermark
						watermark={watermark}
						watermark_scale={watermark_scale}
						watermark_align={watermark_align}
						watermark_valign={watermark_valign}
						watermark_x={watermark_x}
						watermark_y={watermark_y}
						context={context}
						isBlockEditor={isOverlay}
						onDimensions={setDetectedAspectRatio}
					/>
				</div>
			)}
		</div>
	);
}

