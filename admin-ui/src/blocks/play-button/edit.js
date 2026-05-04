import { useMemo } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getColorFallbacks } from '../../utils/colors';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import useVideopackContext from '../../hooks/useVideopackContext';
import PlayButton from '../../components/PlayButton/PlayButton';
import './editor.scss';

/**
 * Play Button Edit Component.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @return {Element} Play Button edit component.
 */
export default function Edit({ attributes, setAttributes, context }) {
	const { play_button_color, play_button_secondary_color } = attributes;
	const isInsideThumbnail = !!context?.['videopack/isInsideThumbnail'];
	const isInsidePlayerOverlay =
		!!context?.['videopack/isInsidePlayerOverlay'];

	const config =
		typeof window !== 'undefined' ? window.videopack_config : undefined;
	const embed_method =
		typeof config !== 'undefined' ? config.embed_method : 'Video.js';
	const THEME_COLORS = config?.themeColors;

	const { resolved } = useVideopackContext(attributes, context);

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				play_button_color: resolved.play_button_color,
				play_button_secondary_color:
					resolved.play_button_secondary_color,
			}),
		[resolved.play_button_color, resolved.play_button_secondary_color]
	);

	const overlayStyles = {};
	if (isInsidePlayerOverlay || isInsideThumbnail || context.isPreview) {
		overlayStyles.position = 'absolute';
		overlayStyles.top = 0;
		overlayStyles.left = 0;
		overlayStyles.right = 0;
		overlayStyles.bottom = 0;
		overlayStyles.zIndex = 115;
		overlayStyles.minHeight = '100px'; // Ensure it's visible in inserter
	}

	const blockProps = useBlockProps({
		className: `videopack-play-button-block ${isInsidePlayerOverlay ? 'is-overlay' : ''}`,
		style: overlayStyles,
	});

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__('Colors', 'video-embed-thumbnail-generator')}
					initialOpen={true}
				>
					<div className="videopack-color-section">
						<div className="videopack-color-flex-row">
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={
										'WordPress Default' === embed_method
											? __(
													'Color',
													'video-embed-thumbnail-generator'
												)
											: __(
													'Icon',
													'video-embed-thumbnail-generator'
												)
									}
									value={play_button_color}
									onChange={(value) =>
										setAttributes({
											play_button_color: value,
										})
									}
									colors={THEME_COLORS}
									fallbackValue={
										colorFallbacks.play_button_color
									}
								/>
							</div>
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={
										'WordPress Default' === embed_method
											? __(
													'Hover',
													'video-embed-thumbnail-generator'
												)
											: __(
													'Accent',
													'video-embed-thumbnail-generator'
												)
									}
									value={play_button_secondary_color}
									onChange={(value) =>
										setAttributes({
											play_button_secondary_color: value,
										})
									}
									colors={THEME_COLORS}
									fallbackValue={
										colorFallbacks.play_button_secondary_color
									}
								/>
							</div>
						</div>
					</div>
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>
				<PlayButton attributes={attributes} context={context} />
			</div>
		</>
	);
}
