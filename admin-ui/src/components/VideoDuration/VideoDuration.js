import { Spinner } from '@wordpress/components';
import useVideopackContext from '../../hooks/useVideopackContext';
import useVideopackData from '../../hooks/useVideopackData';

/**
 * A internal component to display the video duration with correct formatting and data.
 *
 * @param {Object}  root0                   Component props.
 * @param {boolean} root0.isOverlay         Whether it's an overlay.
 * @param {boolean} root0.isInsideThumbnail Whether it's inside a thumbnail.
 * @param {string}  root0.textAlign         Text alignment.
 * @param {string}  root0.position          Position (top/bottom).
 * @param {Object}  root0.attributes        Block attributes.
 * @param {Object}  root0.context           Block context.
 * @return {Element}                        The rendered component.
 */
export default function VideoDuration({
	isOverlay,
	isInsideThumbnail,
	textAlign,
	position,
	attributes,
	context = {},
}) {
	const vpContext = useVideopackContext(attributes, context);
	const { data: duration, isResolving } = useVideopackData(
		'duration',
		context
	);
	const attachmentId = vpContext.resolved.attachmentId;

	if (vpContext.resolved.isDiscovering && !attachmentId) {
		return (
			<div
				className={`videopack-video-duration ${
					isInsideThumbnail ||
					!!context['videopack/isInsidePlayerOverlay']
						? 'is-overlay'
						: ''
				}`}
			>
				<Spinner />
			</div>
		);
	}

	if (!attachmentId && !vpContext.resolved.isPreview) {
		return null;
	}

	const actualIsOverlay =
		isOverlay !== undefined
			? isOverlay
			: isInsideThumbnail || !!context['videopack/isInsidePlayerOverlay'];
	const isInsidePlayerContainer =
		!!context['videopack/isInsidePlayerContainer'];
	const defaultAlign =
		actualIsOverlay || isInsidePlayerContainer ? 'right' : 'left';

	if (isResolving) {
		return (
			<div
				className={`videopack-video-duration ${
					actualIsOverlay ? 'is-overlay' : ''
				}`}
			>
				<Spinner />
			</div>
		);
	}

	const formatDuration = (seconds) => {
		if (!seconds) {
			return '0:00';
		}
		const s = Math.floor(seconds);
		const h = Math.floor(s / 3600);
		const m = Math.floor((s % 3600) / 60);
		const sec = s % 60;
		if (h > 0) {
			return `${h}:${m.toString().padStart(2, '0')}:${sec
				.toString()
				.padStart(2, '0')}`;
		}
		return `${m}:${sec.toString().padStart(2, '0')}`;
	};

	return (
		<div
			className={`videopack-video-duration-block videopack-video-duration ${
				vpContext.classes
			} ${actualIsOverlay ? 'is-overlay is-badge' : ''} position-${
				position || 'top'
			} has-text-align-${textAlign || defaultAlign} ${
				vpContext.resolved.isPreview ? 'is-preview' : ''
			}`}
			style={vpContext.style}
		>
			{duration ? formatDuration(duration) : '0:00'}
		</div>
	);
}
