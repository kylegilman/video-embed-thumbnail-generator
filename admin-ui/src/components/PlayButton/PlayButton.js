import { __ } from '@wordpress/i18n';
import useVideopackContext from '../../hooks/useVideopackContext';

/**
 * An internal component to display the play button with correct styling.
 *
 * @param {Object} root0            Component props.
 * @param {Object} root0.attributes Block attributes.
 * @param {Object} root0.context    Block context.
 * @return {Element}                Rendered play button.
 */
export default function PlayButton({ attributes = {}, context = {} }) {
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
