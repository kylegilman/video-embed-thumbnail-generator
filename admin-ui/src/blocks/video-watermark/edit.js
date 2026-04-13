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
import { useEffect } from '@wordpress/element';
import { image as imageIcon } from '@wordpress/icons';

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
		url,
		scale = 10,
		align = 'right',
		valign = 'bottom',
		x = 5,
		y = 7,
	} = attributes;

	// Auto-initialize attributes based on plugin settings if this is a new block
	useEffect(() => {
		if (!videopack_config?.options) {
			return;
		}

		const { options } = videopack_config;
		const newAttributes = {};

		// Only initialize if we don't have a URL set yet (indicating a fresh block)
		if (!url && options.watermark) {
			newAttributes.url = options.watermark;

			if (options.watermark_link_to) {
				newAttributes.linkToType = options.watermark_link_to;
			}
			if (options.watermark_url) {
				newAttributes.customLinkUrl = options.watermark_url;
			}

			if (options.watermark_styles) {
				const styles = options.watermark_styles;
				if (styles.scale) {
					newAttributes.scale = Number(styles.scale);
				}
				if (styles.align) {
					newAttributes.align = styles.align;
				}
				if (styles.valign) {
					newAttributes.valign = styles.valign;
				}
				if (styles.x) {
					newAttributes.x = Number(styles.x);
				}
				if (styles.y) {
					newAttributes.y = Number(styles.y);
				}
			}
		}

		if (Object.keys(newAttributes).length > 0) {
			setAttributes(newAttributes);
		}
	}, [url, setAttributes]); // Dependency array included to satisfy lint but we only act if url is empty

	// Fallback to global setting if no local URL exists.
	const globalWatermarkUrl = context['videopack/watermark'];
	const effectiveUrl = url || globalWatermarkUrl;

	// Use context fallback for link if needed (for rendering preview)
	const effectiveLinkToType =
		attributes.linkToType ||
		context['videopack/watermark_link_to'] ||
		'false';
	const effectiveCustomLinkUrl =
		attributes.customLinkUrl || context['videopack/watermark_url'] || '';

	const skin = context['videopack/skin'] || 'default';
	const blockProps = useBlockProps({
		className: `videopack-video-watermark ${skin}`,
		style: {
			position: 'absolute',
			maxWidth: '90%',
			width: effectiveUrl ? `${scale}%` : '260px',
			height: 'auto',
			zIndex: 111, // One level higher than title bar (110)
			pointerEvents: 'auto', // Always allow interaction in the editor
			[align]: effectiveUrl ? `${x}%` : '5%',
			[valign]: effectiveUrl ? `${y}%` : '7%',
		},
	});

	if (!effectiveUrl) {
		return (
			<div {...blockProps}>
				<MediaPlaceholder
					icon={imageIcon}
					label={__(
						'Watermark Image',
						'video-embed-thumbnail-generator'
					)}
					onSelect={(media) => setAttributes({ url: media.url })}
					accept="image/*"
					allowedTypes={['image']}
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls>
				<MediaReplaceFlow
					mediaURL={url}
					allowedTypes={['image']}
					accept="image/*"
					onSelect={(media) => setAttributes({ url: media.url })}
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
				>
					<RangeControl
						label={__(
							'Scale (%)',
							'video-embed-thumbnail-generator'
						)}
						value={scale}
						onChange={(value) => setAttributes({ scale: value })}
						min={1}
						max={100}
					/>
					<div style={{ display: 'flex', gap: '10px' }}>
						<SelectControl
							label={__(
								'Horizontal Align',
								'video-embed-thumbnail-generator'
							)}
							value={align}
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
								setAttributes({ align: value })
							}
							style={{ flex: 1 }}
						/>
						<SelectControl
							label={__(
								'Vertical Align',
								'video-embed-thumbnail-generator'
							)}
							value={valign}
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
								setAttributes({ valign: value })
							}
							style={{ flex: 1 }}
						/>
					</div>
					<RangeControl
						label={__(
							'Horizontal Offset (%)',
							'video-embed-thumbnail-generator'
						)}
						value={x}
						onChange={(value) => setAttributes({ x: value })}
						min={0}
						max={100}
						step={0.01}
					/>
					<RangeControl
						label={__(
							'Vertical Offset (%)',
							'video-embed-thumbnail-generator'
						)}
						value={y}
						onChange={(value) => setAttributes({ y: value })}
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
							setAttributes({ linkToType: value })
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
								setAttributes({ customLinkUrl: value })
							}
						/>
					)}
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>
				<img
					src={effectiveUrl}
					alt={__('Watermark', 'video-embed-thumbnail-generator')}
					style={{ display: 'block', width: '100%', height: 'auto' }}
				/>
			</div>
		</>
	);
}
