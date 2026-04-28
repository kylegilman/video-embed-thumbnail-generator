import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import CompactColorPicker from '../CompactColorPicker/CompactColorPicker';
import { getColorFallbacks } from '../../utils/colors';

/* global videopack_config */

export default function CollectionColorSettings({
	attributes,
	setAttributes,
	options = {},
	blockType = 'gallery',
	showPaginationSettings = true,
	showTitleSettings = true,
	showPlayerSettings = true,
	showSkinSettings = true,
}) {
	const {
		skin,
		title_color,
		title_background_color,
		play_button_color,
		play_button_secondary_color,
		control_bar_bg_color,
		control_bar_color,
		pagination_color,
		pagination_background_color,
		pagination_active_bg_color,
		pagination_active_color,
	} = attributes;

	const effectiveValues = useMemo(
		() => ({ ...options, ...attributes }),
		[options, attributes]
	);

	const colorFallbacks = useMemo(
		() => getColorFallbacks(effectiveValues),
		[effectiveValues]
	);

	const THEME_COLORS = videopack_config?.themeColors || options?.themeColors;

	const isGalleryOrList = blockType === 'gallery' || blockType === 'list' || blockType === 'grid';

	return (
		<>
			{isGalleryOrList && showSkinSettings && (
				<div className="videopack-skin-section" style={{ marginBottom: '16px' }}>
					<SelectControl
						label={__('Player Skin', 'video-embed-thumbnail-generator')}
						value={skin || options.skin || ''}
						options={[
							{ label: __('Videopack', 'video-embed-thumbnail-generator'), value: 'vjs-theme-videopack' },
							{ label: __('Videopack Classic', 'video-embed-thumbnail-generator'), value: 'kg-video-js-skin' },
							{ label: __('Video.js default', 'video-embed-thumbnail-generator'), value: 'default' },
							{ label: __('City', 'video-embed-thumbnail-generator'), value: 'vjs-theme-city' },
							{ label: __('Fantasy', 'video-embed-thumbnail-generator'), value: 'vjs-theme-fantasy' },
							{ label: __('Forest', 'video-embed-thumbnail-generator'), value: 'vjs-theme-forest' },
							{ label: __('Sea', 'video-embed-thumbnail-generator'), value: 'vjs-theme-sea' },
						]}
						onChange={(value) => setAttributes({ skin: value })}
					/>
				</div>
			)}

			{isGalleryOrList && showTitleSettings && (
				<div className="videopack-color-section">
					<p className="videopack-settings-section-title">
						{__('Titles', 'video-embed-thumbnail-generator')}
					</p>
					<div className="videopack-color-flex-row">
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__('Text', 'video-embed-thumbnail-generator')}
								value={title_color}
								onChange={(value) => setAttributes({ title_color: value })}
								colors={THEME_COLORS}
								fallbackValue={colorFallbacks.title_color}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__('Background', 'video-embed-thumbnail-generator')}
								value={title_background_color}
								onChange={(value) => setAttributes({ title_background_color: value })}
								colors={THEME_COLORS}
								fallbackValue={colorFallbacks.title_background_color}
							/>
						</div>
					</div>
				</div>
			)}

			{isGalleryOrList && showPlayerSettings && (
				<div className="videopack-color-section">
					<p className="videopack-settings-section-title">
						{__('Player', 'video-embed-thumbnail-generator')}
					</p>
					<div className="videopack-color-flex-row">
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__('Play Button Icon', 'video-embed-thumbnail-generator')}
								value={play_button_color}
								onChange={(value) => setAttributes({ play_button_color: value })}
								colors={THEME_COLORS}
								fallbackValue={colorFallbacks.play_button_color}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__('Play Button Accent', 'video-embed-thumbnail-generator')}
								value={play_button_secondary_color}
								onChange={(value) => setAttributes({ play_button_secondary_color: value })}
								colors={THEME_COLORS}
								fallbackValue={colorFallbacks.play_button_secondary_color}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__('Control Bar Background', 'video-embed-thumbnail-generator')}
								value={control_bar_bg_color}
								onChange={(value) => setAttributes({ control_bar_bg_color: value })}
								colors={THEME_COLORS}
								fallbackValue={colorFallbacks.control_bar_bg_color}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__('Control Bar Icons', 'video-embed-thumbnail-generator')}
								value={control_bar_color}
								onChange={(value) => setAttributes({ control_bar_color: value })}
								colors={THEME_COLORS}
								fallbackValue={colorFallbacks.control_bar_color}
							/>
						</div>
					</div>
				</div>
			)}

			{showPaginationSettings && (
				<div className="videopack-color-section">
					<p className="videopack-settings-section-title">
						{__('Pagination', 'video-embed-thumbnail-generator')}
					</p>
					<div className="videopack-color-flex-row is-pagination">
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__('Outline/Text', 'video-embed-thumbnail-generator')}
								value={pagination_color}
								onChange={(value) => setAttributes({ pagination_color: value })}
								colors={THEME_COLORS}
								fallbackValue={colorFallbacks.pagination_color}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__('Background', 'video-embed-thumbnail-generator')}
								value={pagination_background_color}
								onChange={(value) => setAttributes({ pagination_background_color: value })}
								colors={THEME_COLORS}
								fallbackValue={colorFallbacks.pagination_background_color}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__('Active Background', 'video-embed-thumbnail-generator')}
								value={pagination_active_bg_color}
								onChange={(value) => setAttributes({ pagination_active_bg_color: value })}
								colors={THEME_COLORS}
								fallbackValue={colorFallbacks.pagination_active_bg_color}
							/>
						</div>
						<div className="videopack-color-flex-item">
							<CompactColorPicker
								label={__('Active Text', 'video-embed-thumbnail-generator')}
								value={pagination_active_color}
								onChange={(value) => setAttributes({ pagination_active_color: value })}
								colors={THEME_COLORS}
								fallbackValue={colorFallbacks.pagination_active_color}
							/>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
