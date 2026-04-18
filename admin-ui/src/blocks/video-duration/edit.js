import { 
	useBlockProps, 
	BlockControls, 
	BlockVerticalAlignmentControl, 
	AlignmentControl, 
	Spinner 
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { getEffectiveValue } from '../../utils/context';

/**
 * A internal component to display the video duration with correct formatting and data.
 * This can be reused in previews (e.g. video loops).
 */
export function VideoDuration({ postId, isOverlay, isInsideThumbnail, textAlign, position }) {
	const actualIsOverlay = isOverlay !== undefined ? isOverlay : isInsideThumbnail;
	const { duration, isResolving } = useSelect(
		(select) => {
			if (!postId) {
				return { duration: null, isResolving: false };
			}
			const { getEntityRecord, isResolving: isResolvingSelector } =
				select('core');
			const record = getEntityRecord('postType', 'attachment', postId);
			return {
				duration: record?.meta?.['_videopack-meta']?.duration,
				isResolving: isResolvingSelector('getEntityRecord', [
					'postType',
					'attachment',
					postId,
				]),
			};
		},
		[postId]
	);

	if (isResolving) {
		return (
			<div className={`videopack-video-duration ${actualIsOverlay ? 'is-overlay' : ''}`}>
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
		<div className={`videopack-video-duration-block videopack-video-duration ${actualIsOverlay ? 'is-overlay is-badge' : ''} position-${position || 'top'} has-text-align-${textAlign || 'right'}`}>
			{duration ? formatDuration(duration) : '0:00'}
		</div>
	);
}

export default function Edit({ clientId, attributes, setAttributes, context }) {
	const postId = context['videopack/postId'];
	const { textAlign, position: attrPosition } = attributes;

	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayer = !!context['videopack/isInsidePlayer'];
	const isOverlay = isInsideThumbnail || isInsidePlayer;
	const effectiveTitleBgColor = getEffectiveValue('title_background_color', attributes, context);

	const defaultAlign = isOverlay ? (isInsideThumbnail ? 'center' : 'left') : 'right';
	const finalTextAlign = textAlign || context['videopack/textAlign'] || defaultAlign;
	const position = attrPosition || context['videopack/position'] || 'top';

	const blockProps = useBlockProps({
		className: `videopack-video-duration-block ${
			isOverlay ? 'is-inside-thumbnail is-overlay is-badge' : ''
		} position-${position} has-text-align-${finalTextAlign} ${
			effectiveTitleBgColor ? 'videopack-has-title-background-color' : ''
		}`,
	});

	return (
		<>
			<BlockControls>
				{isOverlay && (
					<BlockVerticalAlignmentControl
						value={position}
						onChange={(nextPosition) => {
							setAttributes({
								position: nextPosition || undefined,
							});
						}}
					/>
				)}
				<AlignmentControl
					value={finalTextAlign}
					onChange={(nextAlign) => {
						setAttributes({ textAlign: nextAlign });
					}}
				/>
			</BlockControls>
			<div {...blockProps}>
				<VideoDuration 
					postId={postId} 
					isOverlay={isOverlay} 
					isInsideThumbnail={isInsideThumbnail}
					textAlign={finalTextAlign}
					position={position}
				/>
			</div>
		</>
	);
}
