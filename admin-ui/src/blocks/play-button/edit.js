import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { getEffectiveValue } from '../../utils/context';
import './editor.scss';

export function PlayButton({ context = {} }) {
	const config = typeof window !== 'undefined' ? window.videopack_config : undefined;
	const embed_method = typeof config !== 'undefined' ? config.embed_method : 'Video.js';

	if ('WordPress Default' === embed_method) {
		return (
			<div className="videopack-play-button mejs-overlay mejs-layer mejs-overlay-play">
				<div
					className="mejs-overlay-button"
					role="button"
					tabIndex="0"
					aria-label={__('Play', 'video-embed-thumbnail-generator')}
					aria-pressed="false"
					style={{ width: '80px', height: '80px' }}
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

	const effectiveSkin = getEffectiveValue('skin', {}, context);
	const effectivePlayColor = getEffectiveValue('play_button_color', {}, context);
	const effectivePlayIconColor = getEffectiveValue('play_button_icon_color', {}, context);

	const styles = {
		'--videopack-play-button-color': effectivePlayColor || undefined,
		'--videopack-play-button-icon-color': effectivePlayIconColor || undefined,
	};

	return (
		<div 
			className={`play-button-container video-js ${effectiveSkin} vjs-big-play-centered vjs-paused vjs-controls-enabled ${
				effectivePlayColor ? 'videopack-has-play-button-color' : ''
			} ${
				effectivePlayIconColor ? 'videopack-has-play-button-icon-color' : ''
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

export default function Edit({ context }) {
	const skin = context?.['videopack/skin'] || '';

	const blockProps = useBlockProps({
		className: 'videopack-play-button-block',
	});

	return (
		<div {...blockProps}>
			<PlayButton context={context} />
		</div>
	);
}
