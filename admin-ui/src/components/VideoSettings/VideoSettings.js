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
import { applyFilters } from '@wordpress/hooks';

import { volumeUp, volumeDown } from '../../assets/icon';
import useVideoSettings from '../../hooks/useVideoSettings';
import CompactColorPicker from '../CompactColorPicker/CompactColorPicker';
import WatermarkSettingsPanel from '../WatermarkSettingsPanel/WatermarkSettingsPanel.js';
import TextTracks from '../TextTracks/TextTracks.js';
import { normalizeOptions } from '../../utils/helpers';
import { getColorFallbacks } from '../../utils/colors';

const VideoSettings = ({
	attributes,
	setAttributes,
	options = {},
	initialOpen = false,
	isBlockEditor = false,
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

	const THEME_COLORS = videopack_config?.themeColors || options?.themeColors;

	return (
		<div className="videopack-video-settings">
			{!isBlockEditor && (
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
							label={__(
								'Caption',
								'video-embed-thumbnail-generator'
							)}
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
								handleSettingChange('views', value)
							}
							checked={!!displayAttributes.views}
						/>
					</PanelRow>
					{(() => {
						const availableStats = [
							{
								key: 'starts',
								label: __(
									'Starts',
									'video-embed-thumbnail-generator'
								),
								val: displayAttributes.starts,
							},
							{
								key: 'play_25',
								label: '25%',
								val: displayAttributes.play_25,
							},
							{
								key: 'play_50',
								label: '50%',
								val: displayAttributes.play_50,
							},
							{
								key: 'play_75',
								label: '75%',
								val: displayAttributes.play_75,
							},
							{
								key: 'completeviews',
								label: __(
									'Ends',
									'video-embed-thumbnail-generator'
								),
								val: displayAttributes.completeviews,
							},
						].filter((s) => s.val > 0);

						if (availableStats.length === 0) {
							return null;
						}

						const isSingleStat = availableStats.length === 1;

						return (
							<div
								className={`videopack-video-stats-${
									isSingleStat ? 'simple' : 'funnel'
								}`}
							>
								<p className="videopack-settings-section-title">
									{__(
										'Views',
										'video-embed-thumbnail-generator'
									)}
								</p>
								{isSingleStat ? (
									<div className="videopack-stat-simple-row">
										<span className="videopack-stat-label">
											{availableStats[0].label}:
										</span>
										<span className="videopack-stat-value">
											{availableStats[0].val.toLocaleString()}
										</span>
									</div>
								) : (
									<div className="videopack-funnel-track">
										{availableStats.map(
											(stat, idx, arr) => {
												const retention =
													stat.key !== 'starts' &&
													displayAttributes.starts > 0
														? Math.round(
																(stat.val /
																	displayAttributes.starts) *
																	100
															) + '%'
														: null;

												return (
													<div
														key={stat.key}
														className="videopack-funnel-item"
													>
														<div className="videopack-funnel-marker">
															{idx <
																arr.length -
																	1 && (
																<div className="videopack-funnel-connector" />
															)}
														</div>
														<div className="videopack-funnel-label">
															{stat.label}
														</div>
														<div className="videopack-funnel-value">
															{stat.val.toLocaleString()}
														</div>
														{retention && (
															<div className="videopack-funnel-retention">
																{retention}
															</div>
														)}
													</div>
												);
											}
										)}
									</div>
								)}
							</div>
						);
					})()}
				</PanelBody>
			)}

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
				<div
					className="videopack-skin-section"
					style={{ marginBottom: '16px' }}
				>
					<SelectControl
						label={__(
							'Player Skin',
							'video-embed-thumbnail-generator'
						)}
						value={attributes.skin || options.skin || ''}
						options={[
							{
								label: __(
									'Videopack',
									'video-embed-thumbnail-generator'
								),
								value: 'vjs-theme-videopack',
							},
							{
								label: __(
									'Videopack Classic',
									'video-embed-thumbnail-generator'
								),
								value: 'kg-video-js-skin',
							},
							{
								label: __(
									'Video.js default',
									'video-embed-thumbnail-generator'
								),
								value: 'default',
							},
							{
								label: __(
									'City',
									'video-embed-thumbnail-generator'
								),
								value: 'vjs-theme-city',
							},
							{
								label: __(
									'Fantasy',
									'video-embed-thumbnail-generator'
								),
								value: 'vjs-theme-fantasy',
							},
							{
								label: __(
									'Forest',
									'video-embed-thumbnail-generator'
								),
								value: 'vjs-theme-forest',
							},
							{
								label: __(
									'Sea',
									'video-embed-thumbnail-generator'
								),
								value: 'vjs-theme-sea',
							},
						]}
						onChange={(value) => handleSettingChange('skin', value)}
					/>
				</div>

				{!isBlockEditor && (
					<div className="videopack-color-section">
						<p className="videopack-settings-section-title">
							{__(
								'Title overlay',
								'video-embed-thumbnail-generator'
							)}
						</p>
						<div className="videopack-color-flex-row">
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Text',
										'video-embed-thumbnail-generator'
									)}
									value={displayAttributes.title_color}
									onChange={(value) =>
										handleSettingChange(
											'title_color',
											value
										)
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
									value={
										displayAttributes.title_background_color
									}
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
				)}

				<div className="videopack-color-section">
					<p className="videopack-settings-section-title">
						{__('Player', 'video-embed-thumbnail-generator')}
					</p>
					<div className="videopack-color-flex-row">
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={
									displayAttributes.embed_method ===
									'WordPress Default'
										? __(
												'Play Button Color',
												'video-embed-thumbnail-generator'
											)
										: __(
												'Play Button Icon',
												'video-embed-thumbnail-generator'
											)
								}
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
								label={
									displayAttributes.embed_method ===
									'WordPress Default'
										? __(
												'Play Button Hover',
												'video-embed-thumbnail-generator'
											)
										: __(
												'Play Button Accent',
												'video-embed-thumbnail-generator'
											)
								}
								value={
									displayAttributes.play_button_secondary_color
								}
								onChange={(value) =>
									handleSettingChange(
										'play_button_secondary_color',
										value
									)
								}
								colors={THEME_COLORS}
								fallbackValue={
									PLAYER_COLOR_FALLBACKS.play_button_secondary_color
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
				{!isBlockEditor && (
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
				)}
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
				{!isBlockEditor && (
					<>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'Legacy dimension settings',
									'video-embed-thumbnail-generator'
								)}
								onChange={(value) =>
									handleSettingChange(
										'legacy_dimensions',
										value
									)
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
											handleSettingChange(
												'fullwidth',
												value
											)
										}
										checked={!!displayAttributes.fullwidth}
									/>
								</PanelRow>
							</>
						)}
					</>
				)}
			</PanelBody>
			{!isBlockEditor && (
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
									displayAttributes.watermark_link_to ||
									'false'
								}
								onChange={(value) =>
									handleSettingChange(
										'watermark_link_to',
										value
									)
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
									value={
										displayAttributes.watermark_url || ''
									}
									onChange={(value) =>
										handleSettingChange(
											'watermark_url',
											value
										)
									}
								/>
							</PanelRow>
						)}
				</WatermarkSettingsPanel>
			)}
			<TextTracks
				tracks={displayAttributes.text_tracks || []}
				onChange={(newTracks) =>
					handleSettingChange('text_tracks', newTracks)
				}
			/>
			{applyFilters('videopack.videoSettings.panels', [], {
				attributes,
				setAttributes,
				options,
				displayAttributes,
				handleSettingChange,
				isBlockEditor,
			})}
			<PanelBody
				title={__('Sharing', 'video-embed-thumbnail-generator')}
				initialOpen={false}
			>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Allow embedding / Show embed code',
							'video-embed-thumbnail-generator'
						)}
						onChange={(value) =>
							handleSettingChange('embedcode', value)
						}
						checked={!!displayAttributes.embedcode}
					/>
				</PanelRow>
				{displayAttributes.embedcode && (
					<>
						{!isBlockEditor && (
							<>
								<PanelRow>
									<ToggleControl
										__nextHasNoMarginBottom
										label={__(
											'Download link',
											'video-embed-thumbnail-generator'
										)}
										onChange={(value) =>
											handleSettingChange(
												'downloadlink',
												value
											)
										}
										checked={
											!!displayAttributes.downloadlink
										}
									/>
								</PanelRow>
							</>
						)}
					</>
				)}
			</PanelBody>
		</div>
	);
};

export default VideoSettings;
