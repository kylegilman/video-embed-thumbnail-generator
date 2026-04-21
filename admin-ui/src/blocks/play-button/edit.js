import { useMemo } from '@wordpress/element';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getEffectiveValue } from '../../utils/context';
import { getColorFallbacks } from '../../utils/colors';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import './editor.scss';

/* global videopack_config */

export function PlayButton({ attributes = {}, context = {} }) {
	const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
	const embed_method = typeof config !== 'undefined' ? config.embed_method : 'Video.js';

	const effectivePlayColor = getEffectiveValue('play_button_color', attributes, context);
	const effectivePlaySecondaryColor = getEffectiveValue('play_button_secondary_color', attributes, context);

	if ('WordPress Default' === embed_method) {
		const styles = {
			width: '80px',
			height: '80px',
		};

		if (effectivePlayColor) {
			styles['--videopack-play-button-color'] = effectivePlayColor;
		}

		if (effectivePlaySecondaryColor) {
			styles['--videopack-play-button-secondary-color'] = effectivePlaySecondaryColor;
		}

		const mejsSvgPath = config?.mejs_controls_svg || (typeof window !== 'undefined' ? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg` : '');

		if (mejsSvgPath) {
			styles['--videopack-mejs-controls-svg'] = `url("${mejsSvgPath}")`;
		}

		return (
			<div className={`videopack-play-button mejs-overlay mejs-layer mejs-overlay-play play-button-container ${
				effectivePlayColor ? 'videopack-has-play-button-color' : ''
			} ${
				effectivePlaySecondaryColor ? 'videopack-has-play-button-secondary-color' : ''
			}`}>
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
				<svg className="videopack-none-play-button" viewBox="0 0 100 100">
					<circle className="play-button-circle" cx="50" cy="50" r="45" />
					<polygon className="play-button-triangle" points="40,30 70,50 40,70" />
				</svg>
			</div>
		);
	}

	const effectiveSkin = getEffectiveValue('skin', attributes, context);

	const styles = {
		'--videopack-play-button-color': effectivePlayColor || undefined,
		'--videopack-play-button-secondary-color': effectivePlaySecondaryColor || undefined,
	};

	return (
		<div 
			className={`play-button-container video-js ${effectiveSkin} vjs-big-play-centered vjs-paused vjs-controls-enabled ${
				effectivePlayColor ? 'videopack-has-play-button-color' : ''
			} ${
				effectivePlaySecondaryColor ? 'videopack-has-play-button-secondary-color' : ''
			}`}
			style={styles}
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
	const isInsidePlayer = !!context?.['videopack/isInsidePlayer'];

	const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
	const embed_method = typeof config !== 'undefined' ? config.embed_method : 'Video.js';
	const THEME_COLORS = config?.themeColors;

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				play_button_color: getEffectiveValue('play_button_color', {}, context),
				play_button_secondary_color: getEffectiveValue('play_button_secondary_color', {}, context),
			}),
		[context]
	);

	const overlayStyles = {};
	if (isInsidePlayer || isInsideThumbnail) {
		overlayStyles.position = 'absolute';
		overlayStyles.top = '50%';
		overlayStyles.left = '50%';
		overlayStyles.transform = 'translate(-50%, -50%)';
		overlayStyles.zIndex = 115;
		overlayStyles.width = 'auto';
		overlayStyles.height = 'auto';
	}

	const blockProps = useBlockProps({
		className: `videopack-play-button-block ${isInsidePlayer ? 'is-overlay' : ''}`,
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
									label={'WordPress Default' === embed_method ? __('Color', 'video-embed-thumbnail-generator') : __('Icon', 'video-embed-thumbnail-generator')}
									value={play_button_color}
									onChange={(value) => setAttributes({ play_button_color: value })}
									colors={THEME_COLORS}
									fallbackValue={colorFallbacks.play_button_color}
								/>
							</div>
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={'WordPress Default' === embed_method ? __('Hover', 'video-embed-thumbnail-generator') : __('Accent', 'video-embed-thumbnail-generator')}
									value={play_button_secondary_color}
									onChange={(value) => setAttributes({ play_button_secondary_color: value })}
									colors={THEME_COLORS}
									fallbackValue={colorFallbacks.play_button_secondary_color}
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
