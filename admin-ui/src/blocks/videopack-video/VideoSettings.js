import {
	PanelBody,
	PanelRow,
	RadioControl,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

import { volumeUp, volumeDown } from '../../assets/icon';
import useVideoSettings from '../../hooks/useVideoSettings';
import VideopackTooltip from '../../features/settings/components/VideopackTooltip';
import WatermarkSettingsPanel from '../../features/settings/components/WatermarkSettingsPanel';
import TextTracks from '../../components/TextTracks/TextTracks.js';

const VideoSettings = ({ attributes, setAttributes, options }) => {
	const { handleSettingChange, preloadOptions } = useVideoSettings(
		attributes,
		setAttributes
	);

	const [displayAttributes, setDisplayAttributes] = useState({});

	useEffect(() => {
		if (options) {
			setDisplayAttributes({ ...options, ...attributes });
		}
	}, [options, attributes]);

	return (
		<>
			<PanelBody
				title={__('Player Settings', 'video-embed-thumbnail-generator')}
				initialOpen={false}
			>
				{!displayAttributes.gifmode && (
					<>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Autoplay',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange('autoplay', value)
								}
								checked={!!displayAttributes.autoplay}
								help={
									displayAttributes.autoplay &&
									!displayAttributes.muted
										? __(
												'Autoplay is disabled while editing unless muted.'
											)
										: null
								}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Loop',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange('loop', value)
								}
								checked={!!displayAttributes.loop}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Muted',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange('muted', value)
								}
								checked={!!displayAttributes.muted}
							/>
						</PanelRow>
						{!displayAttributes.muted && (
							<RangeControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__(
									'Volume',
									'video-embed-thumbnail-generator'
								)}
								value={displayAttributes.volume}
								beforeIcon={volumeDown}
								afterIcon={volumeUp}
								initialPosition={1}
								withInputField={false}
								onChange={(value) =>
									handleSettingChange('volume', value)
								}
								min={0}
								max={1}
								step={0.05}
							/>
						)}
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Controls',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange('controls', value)
								}
								checked={!!displayAttributes.controls}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Variable playback speeds',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange('playback_rate', value)
								}
								checked={!!displayAttributes.playback_rate}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Play inline',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange('playsinline', value)
								}
								checked={!!displayAttributes.playsinline}
								help={__(
									'Plays inline instead of fullscreen on iPhones.'
								)}
							/>
						</PanelRow>
						<PanelRow>
							<SelectControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__(
									'Preload',
									'video-embed-thumbnail-generator'
								)}
								value={displayAttributes.preload}
								onChange={(value) =>
									handleSettingChange('preload', value)
								}
								options={preloadOptions}
								hideCancelButton={true}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Allow right-click on video',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange('right_click', value)
								}
								checked={!!displayAttributes.right_click}
							/>
						</PanelRow>
					</>
				)}
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'GIF mode',
							'video-embed-thumbnail-generator'
						)}
						onChange={(value) =>
							handleSettingChange('gifmode', value)
						}
						checked={!!displayAttributes.gifmode}
						help={__(
							'Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.'
						)}
					/>
				</PanelRow>
			</PanelBody>
			<PanelBody
				title={__('Dimensions', 'video-embed-thumbnail-generator')}
				initialOpen={false}
			>
				<PanelRow>
					<div style={{ width: '100%' }}>
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Align / Width',
								'video-embed-thumbnail-generator'
							)}
							value={displayAttributes.align || ''}
							onChange={(value) =>
								handleSettingChange('align', value)
							}
							options={[
								{
									value: '',
									label: __(
										'None',
										'video-embed-thumbnail-generator'
									),
								},
								{
									value: 'wide',
									label: __(
										'Wide',
										'video-embed-thumbnail-generator'
									),
								},
								{
									value: 'full',
									label: __(
										'Full width',
										'video-embed-thumbnail-generator'
									),
								},
								{
									value: 'left',
									label: __(
										'Left',
										'video-embed-thumbnail-generator'
									),
								},
								{
									value: 'center',
									label: __(
										'Center',
										'video-embed-thumbnail-generator'
									),
								},
								{
									value: 'right',
									label: __(
										'Right',
										'video-embed-thumbnail-generator'
									),
								},
							]}
						/>
					</div>
				</PanelRow>
				<PanelRow>
					<RadioControl
						label={__(
							'Constrain to default aspect ratio',
							'video-embed-thumbnail-generator'
						)}
						selected={displayAttributes.fixed_aspect}
						onChange={(value) =>
							handleSettingChange('fixed_aspect', value)
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
								value: 'true',
								label: __(
									'All',
									'video-embed-thumbnail-generator'
								),
							},
							{
								value: 'vertical',
								label: __(
									'Vertical Videos',
									'video-embed-thumbnail-generator'
								),
							},
						]}
					/>
				</PanelRow>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Legacy dimension settings',
							'video-embed-thumbnail-generator'
						)}
						onChange={(value) =>
							handleSettingChange('legacy_dimensions', value)
						}
						checked={!!displayAttributes.legacy_dimensions}
					/>
				</PanelRow>
				{displayAttributes.legacy_dimensions && (
					<>
						<PanelRow>
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__(
									'Width',
									'video-embed-thumbnail-generator'
								)}
								type="number"
								value={displayAttributes.width}
								onChange={(value) =>
									handleSettingChange('width', value)
								}
							/>
						</PanelRow>
						<PanelRow>
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__(
									'Height',
									'video-embed-thumbnail-generator'
								)}
								type="number"
								value={displayAttributes.height}
								onChange={(value) =>
									handleSettingChange('height', value)
								}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Shrink to fit',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange('resize', value)
								}
								checked={!!displayAttributes.resize}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Expand to full width',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange('fullwidth', value)
								}
								checked={!!displayAttributes.fullwidth}
							/>
						</PanelRow>
					</>
				)}
			</PanelBody>
			<WatermarkSettingsPanel
				title={__(
					'Watermark Overlay',
					'video-embed-thumbnail-generator'
				)}
				watermarkSettings={{
					url: displayAttributes.watermark,
					...displayAttributes.watermark_styles,
				}}
				onChange={(newSettings) => {
					const { url, ...styles } = newSettings;
					handleSettingChange('watermark', url);
					handleSettingChange('watermark_styles', styles);
				}}
				initialOpen={false}
			>
				{displayAttributes.watermark && (
					<PanelRow>
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Link to',
								'video-embed-thumbnail-generator'
							)}
							value={
								displayAttributes.watermark_link_to || 'false'
							}
							onChange={(value) =>
								handleSettingChange('watermark_link_to', value)
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
					</PanelRow>
				)}
				{displayAttributes.watermark &&
					displayAttributes.watermark_link_to === 'custom' && (
						<PanelRow>
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__(
									'Watermark URL',
									'video-embed-thumbnail-generator'
								)}
								value={displayAttributes.watermark_url || ''}
								onChange={(value) =>
									handleSettingChange('watermark_url', value)
								}
							/>
						</PanelRow>
					)}
			</WatermarkSettingsPanel>
			<TextTracks
				tracks={displayAttributes.text_tracks || []}
				onChange={(newTracks) =>
					handleSettingChange('text_tracks', newTracks)
				}
			/>
			<PanelBody
				title={__('Sharing', 'video-embed-thumbnail-generator')}
				initialOpen={false}
			>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Allow embedding on other sites',
							'video-embed-thumbnail-generator'
						)}
						onChange={(value) =>
							handleSettingChange('embeddable', value)
						}
						checked={!!displayAttributes.embeddable}
					/>
				</PanelRow>
				{displayAttributes.embeddable && (
					<>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Download link',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange('downloadlink', value)
								}
								checked={!!displayAttributes.downloadlink}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Embed code',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange('embedcode', value)
								}
								checked={!!displayAttributes.embedcode}
							/>
						</PanelRow>
					</>
				)}
			</PanelBody>
			<PanelBody
				title={__('Metadata', 'video-embed-thumbnail-generator')}
				initialOpen={false}
			>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Overlay title',
							'video-embed-thumbnail-generator'
						)}
						onChange={(value) =>
							handleSettingChange('overlay_title', value)
						}
						checked={!!displayAttributes.overlay_title}
					/>
				</PanelRow>
				{displayAttributes.overlay_title && (
					<PanelRow>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Title',
								'video-embed-thumbnail-generator'
							)}
							value={displayAttributes.title || ''}
							onChange={(value) =>
								handleSettingChange('title', value)
							}
						/>
					</PanelRow>
				)}
				<PanelRow>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Caption', 'video-embed-thumbnail-generator')}
						value={displayAttributes.caption || ''}
						onChange={(value) =>
							handleSettingChange('caption', value)
						}
					/>
				</PanelRow>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'View count',
							'video-embed-thumbnail-generator'
						)}
						onChange={(value) =>
							handleSettingChange('view_count', value)
						}
						checked={!!displayAttributes.view_count}
					/>
				</PanelRow>
			</PanelBody>
		</>
	);
};

export default VideoSettings;
