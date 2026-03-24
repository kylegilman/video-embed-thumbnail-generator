import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	ToggleControl,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import { getColorFallbacks } from '../../utils/colors';

/* global videopack_config */

export default function VideoSettings({
	attributes,
	setAttributes,
	options = {},
}) {
	const displayAttributes = useMemo(
		() => ({ ...options, ...attributes }),
		[options, attributes]
	);

	const PLAYER_COLOR_FALLBACKS = useMemo(
		() => getColorFallbacks(displayAttributes),
		[displayAttributes]
	);

	const THEME_COLORS = videopack_config.themeColors;

	const handleSettingChange = (setting, value) => {
		setAttributes({ [setting]: value });
	};

	const skinOptions = [
		{
			value: 'vjs-theme-videopack',
			label: __('Videopack', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'kg-video-js-skin',
			label: __('Legacy', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'vjs-theme-city',
			label: __('City', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'vjs-theme-fantasy',
			label: __('Fantasy', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'vjs-theme-forest',
			label: __('Forest', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'vjs-theme-sea',
			label: __('Sea', 'video-embed-thumbnail-generator'),
		},
	];

	return (
		<>
			<PanelBody
				title={__('Player Settings', 'video-embed-thumbnail-generator')}
			>
				<SelectControl
					label={__('Skin', 'video-embed-thumbnail-generator')}
					value={displayAttributes.skin}
					onChange={(value) => handleSettingChange('skin', value)}
					options={skinOptions}
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>

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
				title={__(
					'Playback Settings',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={false}
			>
				<ToggleControl
					label={__('Autoplay', 'video-embed-thumbnail-generator')}
					checked={!!displayAttributes.autoplay}
					onChange={(value) => handleSettingChange('autoplay', value)}
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={__('Loop', 'video-embed-thumbnail-generator')}
					checked={!!displayAttributes.loop}
					onChange={(value) => handleSettingChange('loop', value)}
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={__('Muted', 'video-embed-thumbnail-generator')}
					checked={!!displayAttributes.muted}
					onChange={(value) => handleSettingChange('muted', value)}
					__nextHasNoMarginBottom
				/>
				<ToggleControl
					label={__(
						'Plays Inline',
						'video-embed-thumbnail-generator'
					)}
					checked={!!displayAttributes.playsinline}
					onChange={(value) =>
						handleSettingChange('playsinline', value)
					}
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={__('Preload', 'video-embed-thumbnail-generator')}
					value={displayAttributes.preload}
					onChange={(value) => handleSettingChange('preload', value)}
					options={[
						{
							value: 'auto',
							label: __('Auto', 'video-embed-thumbnail-generator'),
						},
						{
							value: 'metadata',
							label: __(
								'Metadata',
								'video-embed-thumbnail-generator'
							),
						},
						{
							value: 'none',
							label: __('None', 'video-embed-thumbnail-generator'),
						},
					]}
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>
			</PanelBody>

			<PanelBody
				title={__(
					'Display Settings',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={false}
			>
				<ToggleControl
					label={__('Controls', 'video-embed-thumbnail-generator')}
					checked={!!displayAttributes.controls}
					onChange={(value) => handleSettingChange('controls', value)}
					__nextHasNoMarginBottom
				/>
				<SelectControl
					label={__(
						'Fixed Aspect Ratio',
						'video-embed-thumbnail-generator'
					)}
					value={displayAttributes.fixed_aspect}
					onChange={(value) =>
						handleSettingChange('fixed_aspect', value)
					}
					options={[
						{
							value: '',
							label: __(
								'None (Responsive)',
								'video-embed-thumbnail-generator'
							),
						},
						{
							value: '16:9',
							label: '16:9',
						},
						{
							value: '4:3',
							label: '4:3',
						},
						{
							value: '1:1',
							label: '1:1',
						},
						{
							value: 'vertical',
							label: __('Vertical', 'video-embed-thumbnail-generator'),
						},
					]}
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>
				<div className="videopack-dimensions-settings">
					<TextControl
						label={__(
							'Max Width',
							'video-embed-thumbnail-generator'
						)}
						type="number"
						value={displayAttributes.width}
						onChange={(value) => handleSettingChange('width', value)}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					<TextControl
						label={__(
							'Max Height',
							'video-embed-thumbnail-generator'
						)}
						type="number"
						value={displayAttributes.height}
						onChange={(value) =>
							handleSettingChange('height', value)
						}
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
				</div>
			</PanelBody>
		</>
	);
}
