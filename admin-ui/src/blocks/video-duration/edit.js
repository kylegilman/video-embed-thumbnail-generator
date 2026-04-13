import { useBlockProps, Spinner } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

/**
 * A internal component to display the video duration with correct formatting and data.
 * This can be reused in previews (e.g. video loops).
 */
export function VideoDuration({ postId }) {
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
		return <Spinner />;
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
		<div className="videopack-video-duration">
			{duration ? formatDuration(duration) : '0:00'}
		</div>
	);
}

export default function Edit({ clientId, context }) {
	const { postId } = context;

	const { isInsideThumbnail } = useSelect(
		(select) => {
			const { getBlockName, getBlockRootClientId } = select('core/block-editor');
			const rootId = getBlockRootClientId(clientId);
			const parentName = rootId ? getBlockName(rootId) : null;
			return {
				isInsideThumbnail: parentName === 'videopack/thumbnail',
			};
		},
		[clientId]
	);

	const blockProps = useBlockProps({
		className: `videopack-video-duration-block ${isInsideThumbnail ? 'is-inside-thumbnail' : ''}`,
	});

	return (
		<div {...blockProps}>
			<VideoDuration postId={postId} />
		</div>
	);
}
