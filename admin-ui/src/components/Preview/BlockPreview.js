import { VideoTitle } from '../../blocks/video-title/edit';
import { ViewCount } from '../../blocks/view-count/edit';
import { VideoWatermark } from '../../blocks/video-watermark/edit';
import { VideoDuration } from '../../blocks/video-duration/edit';
import { PlayButton } from '../../blocks/play-button/edit';
import { VideoThumbnailPreview } from '../../blocks/thumbnail/VideoThumbnailPreview';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import CollectionWrapper from './parts/CollectionWrapper';
import VideoLoop from './parts/VideoLoop';
import Pagination from './parts/Pagination';

const PREVIEW_COMPONENTS = {
	'videopack/videopack-video': ({
		children,
		className,
		postId,
		isOverlay,
		innerBlocks,
		video,
		isInsideThumbnail,
		isInsidePlayer,
		downloadlink,
		embedcode,
		attributes,
		context,
		...props
	}) => (
		<div
			className={`videopack-video-block-container ${className || ''}`}
			{...props}
		>
			{children}
		</div>
	),
	'videopack/collection': CollectionWrapper,
	'videopack/video-loop': VideoLoop,
	'videopack/pagination': Pagination,
	'videopack/thumbnail': VideoThumbnailPreview,
	'videopack/video-title': VideoTitle,
	'videopack/video-duration': VideoDuration,
	'videopack/view-count': ViewCount,
	'videopack/play-button': PlayButton,
	'videopack/video-watermark': VideoWatermark,
	'videopack/video-player-engine': ({
		children,
		attributes,
		context,
		video,
	}) => (
		<div className="videopack-video-preview">
			<VideoPlayer
				attributes={{
					...attributes,
					id: video?.attachment_id,
					title: video?.title,
					sources: video?.player_vars?.sources,
					poster: video?.poster_url || attributes.poster,
					starts: video?.player_vars?.starts,
					// Prioritize video URL from resolution over the raw attribute URL
					src: video?.url || (!attributes.id ? attributes.src : undefined),
					'videopack/isInsidePlayer': true,
				}}
				context={context}
				isSelected={false}
			>
				{children}
			</VideoPlayer>
		</div>
	),
};

/**
 * Renders a preview for a single Videopack block by name.
 *
 * @param {Object} props            Component props.
 * @param {string} props.name       The name of the block (e.g., 'videopack/thumbnail').
 * @param {Object} props.attributes The block attributes.
 * @param {Object} props.context    The inherited context.
 * @param {Object} props.children   Child components/inner blocks.
 * @return {Element|null} The rendered component.
 */
export default function BlockPreview({
	name,
	attributes = {},
	context = {},
	children,
	...props
}) {
	const Component = PREVIEW_COMPONENTS[name];
	if (!Component) {
		return children || null;
	}

	return (
		<Component
			{...attributes}
			attributes={attributes}
			context={context}
			{...props}
		>
			{children}
		</Component>
	);
}
