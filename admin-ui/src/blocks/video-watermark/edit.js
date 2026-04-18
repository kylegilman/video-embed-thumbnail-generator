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
} from '@wordpress/components';
import { useEffect, useMemo } from '@wordpress/element';
import { image as imageIcon } from '@wordpress/icons';
import { getEffectiveValue } from '../../utils/context';

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
}) {
	const effectiveUrl = getEffectiveValue('watermark', { watermark }, context);
	const effectiveScale = getEffectiveValue('watermark_styles', { scale: watermark_scale }, context)?.scale ?? getEffectiveValue('watermark_scale', { watermark_scale }, context);
	const effectiveAlign = getEffectiveValue('watermark_styles', { align: watermark_align }, context)?.align ?? getEffectiveValue('watermark_align', { watermark_align }, context);
	const effectiveValign = getEffectiveValue('watermark_styles', { valign: watermark_valign }, context)?.valign ?? getEffectiveValue('watermark_valign', { watermark_valign }, context);
	const effectiveX = getEffectiveValue('watermark_styles', { x: watermark_x }, context)?.x ?? getEffectiveValue('watermark_x', { watermark_x }, context);
	const effectiveY = getEffectiveValue('watermark_styles', { y: watermark_y }, context)?.y ?? getEffectiveValue('watermark_y', { watermark_y }, context);

	const skin = getEffectiveValue('skin', {}, context);

	const actualAlign = effectiveAlign || 'right';
	const actualValign = effectiveValign || 'bottom';
	const actualX = effectiveX !== undefined && effectiveX !== '' ? effectiveX : 5;
	const actualY = effectiveY !== undefined && effectiveY !== '' ? effectiveY : 7;
	const actualScale = effectiveScale !== undefined && effectiveScale !== '' ? effectiveScale : 10;

	const style = {
		position: 'absolute',
		maxWidth: '90%',
		width: effectiveUrl ? `${actualScale}%` : '260px',
		height: 'auto',
		zIndex: 111,
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

	if (!style.transform) {
		delete style.transform;
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
			/>
		</div>
	);
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
export default function Edit({ attributes, setAttributes, context }) {
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

	// Design attributes are now derived dynamically via getEffectiveValue in the render cycle.
	// We no longer auto-initialize attributes to prevent them from becoming "stale".

	const effectiveUrl = getEffectiveValue('watermark', attributes, context);
	const effectiveScale = getEffectiveValue('watermark_styles', attributes, context)?.scale ?? getEffectiveValue('watermark_scale', attributes, context) ?? 10;
	const effectiveAlign = getEffectiveValue('watermark_styles', attributes, context)?.align ?? getEffectiveValue('watermark_align', attributes, context) ?? 'right';
	const effectiveValign = getEffectiveValue('watermark_styles', attributes, context)?.valign ?? getEffectiveValue('watermark_valign', attributes, context) ?? 'bottom';
	const effectiveX = getEffectiveValue('watermark_styles', attributes, context)?.x ?? getEffectiveValue('watermark_x', attributes, context) ?? 5;
	const effectiveY = getEffectiveValue('watermark_styles', attributes, context)?.y ?? getEffectiveValue('watermark_y', attributes, context) ?? 7;

	const effectiveLinkToType = getEffectiveValue('watermark_link_to', attributes, context) || 'false';
	const effectiveCustomLinkUrl = getEffectiveValue('watermark_url', attributes, context) || '';


	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayer = !!context['videopack/isInsidePlayer'];

	const blockProps = useBlockProps({
		className: `videopack-video-watermark-block ${
			isInsideThumbnail || isInsidePlayer ? 'is-overlay' : ''
		}`,
	});

	if (!watermark && !context['videopack/watermark']) {
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
			<VideoWatermark
				watermark={watermark}
				watermark_scale={watermark_scale}
				watermark_align={watermark_align}
				watermark_valign={watermark_valign}
				watermark_x={watermark_x}
				watermark_y={watermark_y}
				context={context}
			/>
		</div>
	);
}

