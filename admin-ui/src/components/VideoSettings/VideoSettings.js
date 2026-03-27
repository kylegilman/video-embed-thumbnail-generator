/* global videopack_config */

import {
	Flex,
	FlexItem,
	PanelBody,
	PanelRow,
	RadioControl,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';

import { volumeUp, volumeDown } from '../../assets/icon';
import useVideoSettings from '../../hooks/useVideoSettings';
import CompactColorPicker from '../CompactColorPicker/CompactColorPicker';
import WatermarkSettingsPanel from '../WatermarkSettingsPanel/WatermarkSettingsPanel.js';
import TextTracks from '../TextTracks/TextTracks.js';
import { normalizeOptions } from '../../utils/utils';
import { getColorFallbacks } from '../../utils/colors';
import './VideoSettings.scss';

const VideoSettings = ({
	attributes,
	setAttributes,
	options = {},
	initialOpen = false,
}) => {
	const { handleSettingChange, preloadOptions } = useVideoSettings(
		attributes,
		setAttributes,
		options
	);

	const displayAttributes = useMemo(() => {
		const merged = { ...options, ...attributes };
		return normalizeOptions(merged);
	}, [options, attributes]);

	const PLAYER_COLOR_FALLBACKS = useMemo(
		() => getColorFallbacks(displayAttributes),
		[displayAttributes]
	);

	const THEME_COLORS = videopack_config.themeColors;

	return (
		<div className="videopack-video-settings">
			<PanelBody
				title={__('Metadata', 'video-embed-thumbnail-generator')}
				initialOpen={initialOpen}
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
					<div className="videopack-video-settings-input-wrapper">
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
					</div>
				)}
				<div className="videopack-video-settings-input-wrapper">
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Caption', 'video-embed-thumbnail-generator')}
						value={displayAttributes.caption || ''}
						onChange={(value) =>
							handleSettingChange('caption', value)
						}
					/>
				</div>
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

			<PanelBody
				title={__('Player Settings', 'video-embed-thumbnail-generator')}
				initialOpen={initialOpen}
			>
				{!displayAttributes.gifmode && (
					<>
						<Flex
							align-items="flex-start"
							expanded={false}
							gap={20}
							justify="flex-start"
							className="videopack-player-settings-flex"
						>
							<FlexItem>
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
							</FlexItem>
							<FlexItem>
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
								<ToggleControl
									__nextHasNoMarginBottom
									label={__(
										'Variable playback speeds',
										'video-embed-thumbnail-generator'
									)}
									onChange={(value) =>
										handleSettingChange(
											'playback_rate',
											value
										)
									}
									checked={!!displayAttributes.playback_rate}
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									label={__(
										'Play inline on iPhones',
										'video-embed-thumbnail-generator'
									)}
									onChange={(value) =>
										handleSettingChange(
											'playsinline',
											value
										)
									}
									checked={!!displayAttributes.playsinline}
								/>
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
								/>
							</FlexItem>
						</Flex>
					</>
				)}
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('GIF mode', 'video-embed-thumbnail-generator')}
					onChange={(value) => handleSettingChange('gifmode', value)}
					checked={!!displayAttributes.gifmode}
					help={__(
						'Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.'
					)}
				/>
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
			</PanelBody>

			<PanelBody
				title={__('Colors', 'video-embed-thumbnail-generator')}
				initialOpen={false}
			>
				<div className="videopack-color-section">
					<p className="videopack-settings-section-title">
						{__('Title overlay', 'video-embed-thumbnail-generator')}
					</p>
					<div className="videopack-color-flex-row">
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__('Text', 'video-embed-thumbnail-generator')}
								value={displayAttributes.title_color}
								onChange={(value) =>
									handleSettingChange('title_color', value)
								}
								colors={THEME_COLORS}
								fallbackValue={
									PLAYER_COLOR_FALLBACKS.title_color
								}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__(
									'Background',
									'video-embed-thumbnail-generator'
								)}
								value={displayAttributes.title_background_color}
								onChange={(value) =>
									handleSettingChange(
										'title_background_color',
										value
									)
								}
								colors={THEME_COLORS}
								fallbackValue={
									PLAYER_COLOR_FALLBACKS.title_background_color
								}
							/>
						</div>
					</div>
				</div>

				<div className="videopack-color-section">
					<p className="videopack-settings-section-title">
						{__('Player', 'video-embed-thumbnail-generator')}
					</p>
					<div className="videopack-color-flex-row">
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__(
									'Play Button (Accent)',
									'video-embed-thumbnail-generator'
								)}
								value={displayAttributes.play_button_color}
								onChange={(value) =>
									handleSettingChange(
										'play_button_color',
										value
									)
								}
								colors={THEME_COLORS}
								fallbackValue={
									PLAYER_COLOR_FALLBACKS.play_button_color
								}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__(
									'Play Button Icon',
									'video-embed-thumbnail-generator'
								)}
								value={displayAttributes.play_button_icon_color}
								onChange={(value) =>
									handleSettingChange(
										'play_button_icon_color',
										value
									)
								}
								colors={THEME_COLORS}
								fallbackValue={
									PLAYER_COLOR_FALLBACKS.play_button_icon_color
								}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__(
									'Control Bar Background',
									'video-embed-thumbnail-generator'
								)}
								value={displayAttributes.control_bar_bg_color}
								onChange={(value) =>
									handleSettingChange(
										'control_bar_bg_color',
										value
									)
								}
								colors={THEME_COLORS}
								fallbackValue={
									PLAYER_COLOR_FALLBACKS.control_bar_bg_color
								}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__(
									'Control Bar Icons',
									'video-embed-thumbnail-generator'
								)}
								value={displayAttributes.control_bar_color}
								onChange={(value) =>
									handleSettingChange(
										'control_bar_color',
										value
									)
								}
								colors={THEME_COLORS}
								fallbackValue={
									PLAYER_COLOR_FALLBACKS.control_bar_color
								}
							/>
						</div>
					</div>
				</div>
			</PanelBody>

			<PanelBody
				title={__('Dimensions', 'video-embed-thumbnail-generator')}
				initialOpen={false}
			>
				<PanelRow>
					<div className="videopack-video-settings-full-width">
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
									label: videopack_config.contentSize
										? sprintf(
												/* translators: %s: Content size in pixels. */
												__(
													"None (use theme's default width: %s)",
													'video-embed-thumbnail-generator'
												),
												videopack_config.contentSize
										  )
										: __(
												"None (use theme's default width)",
												'video-embed-thumbnail-generator'
										  ),
								},
								{
									value: 'wide',
									label: videopack_config.wideSize
										? sprintf(
												/* translators: %s: Wide size in pixels. */
												__(
													"Wide (use theme's wide width: %s)",
													'video-embed-thumbnail-generator'
												),
												videopack_config.wideSize
										  )
										: __(
												"Wide (use theme's wide width)",
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
		</div>
	);
};

export default VideoSettings;
