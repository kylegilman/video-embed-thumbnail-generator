import { VideoTitle } from '../../blocks/video-title/edit';
import { ViewCount } from '../../blocks/view-count/edit';
import { VideoWatermark } from '../../blocks/video-watermark/edit';
import { VideoDuration } from '../../blocks/video-duration/edit';
import { PlayButton } from '../../blocks/play-button/edit';
import { VideoThumbnailPreview } from '../../blocks/thumbnail/VideoThumbnailPreview';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import Pagination from '../Pagination/Pagination';

const CollectionPreview = ({ children, attributes = {}, context = {} }) => {
	const layout = attributes.layout || context['videopack/layout'] || 'grid';
	const columns = attributes.columns || context['videopack/columns'] || 3;
	const align = attributes.align || context['videopack/align'] || '';

	return (
		<div
			className={`videopack-collection videopack-wrapper layout-${layout} columns-${columns}${
				align ? ` align${align}` : ''
			}`}
			style={{
				'--videopack-collection-columns': columns,
				'--videopack-title-color':
					attributes.title_color || context['videopack/title_color'],
				'--videopack-title-background-color':
					attributes.title_background_color ||
					context['videopack/title_background_color'],
				'--videopack-play-button-color':
					attributes.play_button_color ||
					context['videopack/play_button_color'],
				'--videopack-play-button-icon-color':
					attributes.play_button_icon_color ||
					context['videopack/play_button_icon_color'],
			}}
		>
			{children}
		</div>
	);
};

const VideoLoopPreview = ({
	children,
	attributes = {},
	context = {},
	innerBlocks,
}) => {
	const videos = context['videopack/videos'] || attributes.videos || [];
	const layout = context['videopack/layout'] || 'grid';
	const columns = context['videopack/columns'] || 3;

	return (
		<div
			className={`videopack-video-loop layout-${layout} columns-${columns}`}
		>
			<div className="videopack-collection-grid">
				{videos.map((video, index) => (
					<div
						key={video.attachment_id || index}
						className="videopack-collection-item"
					>
						{innerBlocks ? (
							<VideopackTemplatePreview
								template={innerBlocks}
								video={video}
								context={context}
							/>
						) : (
							children
						)}
					</div>
				))}
			</div>
		</div>
	);
};

const PaginationPreview = ({ attributes = {}, context = {} }) => {
	const paginationColor =
		attributes.pagination_color || context['videopack/pagination_color'];
	const paginationBg =
		attributes.pagination_background_color ||
		context['videopack/pagination_background_color'];
	const paginationActiveColor =
		attributes.pagination_active_color ||
		context['videopack/pagination_active_color'];
	const paginationActiveBg =
		attributes.pagination_active_bg_color ||
		context['videopack/pagination_active_bg_color'];

	const currentPage = context['videopack/currentPage'] || 1;
	const totalPages = context['videopack/totalPages'] || 1;
	const onPageChange = context['videopack/onPageChange'] || (() => {});

	return (
		<div
			className="videopack-pagination-block"
			style={{
				'--videopack-pagination-color': paginationColor,
				'--videopack-pagination-bg': paginationBg,
				'--videopack-pagination-active-color': paginationActiveColor,
				'--videopack-pagination-active-bg': paginationActiveBg,
			}}
		>
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={onPageChange}
			/>
		</div>
	);
};

const PREVIEW_COMPONENTS = {
	'videopack/videopack-video': ({ children, className, ...props }) => (
		<div
			className={`videopack-video-block-container ${className || ''}`}
			{...props}
		>
			{children}
		</div>
	),
	'videopack/collection': CollectionPreview,
	'videopack/video-loop': VideoLoopPreview,
	'videopack/pagination': PaginationPreview,
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
					poster: video?.poster_url,
					starts: video?.player_vars?.starts,
					'videopack/isInsidePlayer': true,
				}}
				isSelected={false}
			>
				{children}
			</VideoPlayer>
		</div>
	),
};

/**
 * A helper to render a list of blocks recursively.
 */
export const VideopackTemplatePreview = ({
	template = [],
	video = {},
	context = {},
	parentFlags = {},
}) => {
	return template.map((block, index) => {
		const [name, attributes = {}, innerBlocks = []] = Array.isArray(block)
			? block
			: [block.name, block.attributes, block.innerBlocks];

		const itemKey = `${video.attachment_id || 'sample'}-${name}-${index}`;

		const currentFlags = { ...parentFlags };
		if (name === 'videopack/thumbnail') {
			currentFlags.isInsideThumbnail = true;
			currentFlags.downloadlink = false;
			currentFlags.embedcode = false;
		}
		if (name === 'videopack/video-player-engine') {
			currentFlags.isInsidePlayer = true;
		}

		const isOverlay =
			!!currentFlags.isInsideThumbnail || !!currentFlags.isInsidePlayer;

		const itemContext = {
			...context,
			...currentFlags,
			'videopack/isInsideThumbnail': currentFlags.isInsideThumbnail,
			'videopack/isInsidePlayer': currentFlags.isInsidePlayer,
			'videopack/downloadlink': currentFlags.downloadlink,
			'videopack/embedcode': currentFlags.embedcode,
			'videopack/postId': video.attachment_id,
			'videopack/title': video.title,
		};

		return (
			<VideopackBlockPreview
				key={itemKey}
				name={name}
				attributes={attributes}
				postId={video.attachment_id}
				isOverlay={isOverlay}
				video={video}
				innerBlocks={innerBlocks}
				{...currentFlags}
				context={itemContext}
			>
				{innerBlocks.length > 0 && (
					<VideopackTemplatePreview
						template={innerBlocks}
						video={video}
						context={itemContext}
						parentFlags={currentFlags}
					/>
				)}
			</VideopackBlockPreview>
		);
	});
};

/**
 * A shared component for rendering Videopack block previews in React.
 *
 * @param {Object} props            Component props.
 * @param {string} props.name       The name of the block (e.g., 'videopack/video-title').
 * @param {Object} props.attributes The block attributes.
 * @param {Object} props.context     The inherited context.
 * @param {Object} props.children    Child components.
 * @return {Element|null} The rendered component.
 */
export const VideopackBlockPreview = ({
	name,
	attributes = {},
	context = {},
	children,
	...props
}) => {
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
};

export default VideopackBlockPreview;
