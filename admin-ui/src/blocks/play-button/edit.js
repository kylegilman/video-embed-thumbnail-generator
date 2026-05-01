import { useMemo } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getEffectiveValue } from '../../utils/context';
import { getColorFallbacks } from '../../utils/colors';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import useVideopackContext from '../../hooks/useVideopackContext';
import './editor.scss';

/**
 * A internal component to display the play button with correct styling.
 */
export function PlayButton({ attributes = {}, context = {} }) {
	const config =
		typeof window !== 'undefined' ? window.videopack_config : undefined;
	const embed_method =
		typeof config !== 'undefined' ? config.embed_method : 'Video.js';
	const vpContext = useVideopackContext(attributes, context);

	if ('WordPress Default' === embed_method) {
		const styles = {
			width: '80px',
			height: '80px',
			...vpContext.style,
		};

		const mejsSvgPath =
			config?.mejs_controls_svg ||
			(typeof window !== 'undefined'
				? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg`
				: '');

		if (mejsSvgPath) {
			styles['--videopack-mejs-controls-svg'] = `url("${mejsSvgPath}")`;
		}

		return (
			<div
				className={`videopack-play-button mejs-overlay mejs-layer mejs-overlay-play play-button-container ${vpContext.classes}`}
			>
				<div
					className="mejs-overlay-button"
					role="button"
					tabIndex="0"
					aria-label={__('Play', 'video-embed-thumbnail-generator')}
					aria-pressed="false"
					style={styles}
				></div>
			</div>
		);
	}

	if ('None' === embed_method) {
		return (
			<div className="play-button-container videopack-none">
				<svg
					className="videopack-none-play-button"
					viewBox="0 0 100 100"
				>
					<circle
						className="play-button-circle"
						cx="50"
						cy="50"
						r="45"
					/>
					<polygon
						className="play-button-triangle"
						points="40,30 70,50 40,70"
					/>
				</svg>
			</div>
		);
	}

	return (
		<div
			className={`play-button-container video-js ${vpContext.classes} vjs-big-play-centered vjs-paused vjs-controls-enabled`}
			style={vpContext.style}
		>
			<button
				className="vjs-big-play-button"
				type="button"
				title={__('Play Video', 'video-embed-thumbnail-generator')}
				aria-disabled="false"
			>
				<span className="vjs-icon-placeholder" aria-hidden="true" />
				<span className="vjs-control-text" aria-live="polite">
					{__('Play Video', 'video-embed-thumbnail-generator')}
				</span>
			</button>
		</div>
	);
}

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

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				play_button_color: getEffectiveValue(
					'play_button_color',
					{},
					context
				),
				play_button_secondary_color: getEffectiveValue(
					'play_button_secondary_color',
					{},
					context
				),
			}),
		[context]
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
