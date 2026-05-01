import { VideoTitle } from '../../blocks/title/edit';
import { ViewCount } from '../../blocks/view-count/edit';
import { VideoWatermark } from '../../blocks/watermark/edit';
import { VideoDuration } from '../../blocks/duration/edit';
import { PlayButton } from '../../blocks/play-button/edit';
import { VideoThumbnailPreview } from '../../blocks/thumbnail/VideoThumbnailPreview';
import { isTrue } from '../../utils/context';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import CollectionWrapper from './parts/CollectionWrapper';
import VideoLoop from './parts/VideoLoop';
import Pagination from './parts/Pagination';

const PREVIEW_COMPONENTS = {
	'videopack/player-container': ({
		children,
		className,
		postId,
		postType,
		isOverlay,
		isInsideThumbnail,
		isInsidePlayerOverlay,
		isInsidePlayerContainer,
		downloadlink,
		embedcode,
		attributes,
		context,
		innerBlocks,
		video,
		resolvedDuotoneClass,
		isPreview,
		// Catch-all for other non-DOM attributes that might leak
		...props
	}) => {
		// Clean props for DOM element - Filter out block attributes and internal state flags
		const domProps = Object.keys(props).reduce((acc, key) => {
			const isBlockAttr = [
				'autoplay', 'playsinline', 'playback_rate', 'fullwidth', 
				'showCaption', 'restartCount', 'loop', 'muted', 'preload',
				'volume', 'auto_res', 'auto_codec', 'sources', 'source_groups',
				'text_tracks', 'default_ratio', 'fixed_aspect', 'embed_method',
				'skin', 'play_button_color', 'play_button_secondary_color',
				'control_bar_bg_color', 'control_bar_color', 'title_color',
				'title_background_color', 'overlay_title', 'downloadlink',
				'embedcode', 'watermark', 'views', 'variation', 'id', 'src', 'poster', 'title', 'duotone'
			].includes(key);

			if (!key.startsWith('videopack/') && !isBlockAttr) {
				acc[key] = props[key];
			}
			return acc;
		}, {});

		const loopDuotoneId = context['videopack/loopDuotoneId'];
		const duotone = props.duotone || attributes?.style?.color?.duotone || attributes?.duotone;
		let finalDuotoneClass = resolvedDuotoneClass || '';
		
		if (loopDuotoneId) {
			finalDuotoneClass = ''; // Loop handles the filter via its own class on the parent
		} else if (!finalDuotoneClass && duotone) {
			if (typeof duotone === 'string' && duotone.startsWith('var:preset|duotone|')) {
				finalDuotoneClass = `wp-duotone-${duotone.split('|').pop()}`;
			} else if (Array.isArray(duotone)) {
				const idPrefix = Math.random().toString(36).substr(2, 9);
				finalDuotoneClass = `videopack-custom-duotone-${idPrefix}`;
			}
		}

		return (
			<div
				className={`videopack-video-block-container videopack-wrapper ${className || ''} ${finalDuotoneClass}`}
				{...domProps}
			>
				{children}
			</div>
		);
	},
	'videopack/collection': CollectionWrapper,
	'videopack/loop': VideoLoop,
	'videopack/pagination': Pagination,
	'videopack/thumbnail': VideoThumbnailPreview,
	'videopack/title': VideoTitle,
	'videopack/duration': VideoDuration,
	'videopack/view-count': ViewCount,
	'videopack/play-button': PlayButton,
	'videopack/watermark': VideoWatermark,
	'videopack/player': ({
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
					isInsidePlayerOverlay: true,
					isInsidePlayerContainer: true,
					duotone: attributes.duotone || context['videopack/duotone'],
					style: attributes.style || context['videopack/style'],
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
