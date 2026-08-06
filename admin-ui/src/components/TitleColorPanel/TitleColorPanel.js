/* global videopack_config */

import { useMemo } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import CompactColorPicker from '../CompactColorPicker/CompactColorPicker';
import { getColorFallbacks } from '../../utils/colors';

/**
 * Shared "Colors" inspector panel for the Text/Background color pickers
 * that Title, Duration, View Count, Share, and Download all have in
 * common. Each block still owns its own title_color/title_background_color
 * attributes -- this only centralizes the panel markup and fallback-preview
 * wiring, so a future change to it doesn't need five parallel edits.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.resolved      vpContext.resolved, used for the
 *                                       fallback preview shown when no
 *                                       color is explicitly chosen.
 * @return {Element} The rendered inspector panel.
 */
export default function TitleColorPanel({ attributes, setAttributes, resolved }) {
	const { title_color, title_background_color } = attributes;
	const THEME_COLORS = videopack_config?.themeColors;

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				title_color: resolved.title_color,
				title_background_color: resolved.title_background_color,
			}),
		[resolved.title_color, resolved.title_background_color]
	);

	return (
		<PanelBody
			title={__('Colors', 'video-embed-thumbnail-generator')}
			initialOpen={true}
		>
			<div className="videopack-color-section">
				<div className="videopack-color-flex-row">
					<div className="videopack-color-flex-item">
						<CompactColorPicker
							label={__('Text', 'video-embed-thumbnail-generator')}
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
							fallbackValue={colorFallbacks.title_background_color}
						/>
					</div>
				</div>
			</div>
		</PanelBody>
	);
}
