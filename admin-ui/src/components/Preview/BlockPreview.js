import VideoTitle from '../VideoTitle/VideoTitle';
import ViewCount from '../ViewCount/ViewCount';
import VideoWatermark from '../VideoWatermark/VideoWatermark';
import VideoDuration from '../VideoDuration/VideoDuration';
import PlayButton from '../PlayButton/PlayButton';
import VideoThumbnailPreview from '../VideoThumbnailPreview/VideoThumbnailPreview';
import PlayerContainer from '../PlayerContainer/PlayerContainer';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import CollectionWrapper from './parts/CollectionWrapper';
import VideoLoop from './parts/VideoLoop';
import Pagination from '../Pagination/Pagination';

import playerContainerMetadata from '../../blocks/player-container/block.json';
import thumbnailMetadata from '../../blocks/thumbnail/block.json';
import titleMetadata from '../../blocks/title/block.json';
import durationMetadata from '../../blocks/duration/block.json';
import viewCountMetadata from '../../blocks/view-count/block.json';
import watermarkMetadata from '../../blocks/watermark/block.json';
import playButtonMetadata from '../../blocks/play-button/block.json';
import { designAttributes } from '../../blocks/shared/design-context';

const BLOCK_METADATA = {
	'videopack/player-container': playerContainerMetadata,
	'videopack/thumbnail': thumbnailMetadata,
	'videopack/title': titleMetadata,
	'videopack/duration': durationMetadata,
	'videopack/view-count': viewCountMetadata,
	'videopack/watermark': watermarkMetadata,
	'videopack/play-button': playButtonMetadata,
};

/**
 * Get all registered attributes for a block name, including shared design attributes.
 * @param {string} name Block name.
 */
const getBlockAttributes = (name) => {
	const metadata = BLOCK_METADATA[name];
	const keys = [];

	if (metadata?.attributes) {
		keys.push(...Object.keys(metadata.attributes));
	}

	// Add shared design attributes that blocks might use via context but pass as props
	keys.push(...Object.keys(designAttributes || {}));

	// Global internal keys that should never hit the DOM
	keys.push(
		'variation',
		'isPreview',
		'isOverlay',
		'isInsideThumbnail',
		'isInsidePlayerOverlay',
		'isInsidePlayerContainer'
	);

	return [...new Set(keys)];
};

/**
 * Filter props to only include standard DOM primitives.
 *
 * @param {Object} props Component props.
 * @param {string} name  Block name.
 * @return {Object} Clean DOM props.
 */
const getCleanDomProps = (props, name) => {
	const blockAttributeKeys = getBlockAttributes(name);
	const cleanDomProps = {};
	Object.keys(props).forEach((key) => {
		if (
			key !== 'attributes' &&
			!blockAttributeKeys.includes(key) &&
			!key.startsWith('videopack/') &&
			typeof props[key] !== 'object' &&
			typeof props[key] !== 'function'
		) {
			cleanDomProps[key] = props[key];
		}
	});
	return cleanDomProps;
};

const PREVIEW_COMPONENTS = {
	'videopack/player-container': (props) => (
		<PlayerContainer
			{...props}
			{...getCleanDomProps(props, 'videopack/player-container')}
		/>
	),
	'videopack/collection': CollectionWrapper,
	'videopack/loop': VideoLoop,
	'videopack/pagination': Pagination,
	'videopack/thumbnail': (props) => (
		<VideoThumbnailPreview
			{...props}
			{...getCleanDomProps(props, 'videopack/thumbnail')}
		/>
	),
	'videopack/title': (props) => (
		<VideoTitle
			{...props}
			{...getCleanDomProps(props, 'videopack/title')}
		/>
	),
	'videopack/duration': (props) => (
		<VideoDuration
			{...props}
			{...getCleanDomProps(props, 'videopack/duration')}
		/>
	),
	'videopack/view-count': (props) => (
		<ViewCount
			{...props}
			{...getCleanDomProps(props, 'videopack/view-count')}
		/>
	),
	'videopack/play-button': (props) => (
		<PlayButton
			{...props}
			{...getCleanDomProps(props, 'videopack/play-button')}
		/>
	),
	'videopack/watermark': (props) => (
		<VideoWatermark
			{...props}
			{...getCleanDomProps(props, 'videopack/watermark')}
		/>
	),
	'videopack/player': ({ children, attributes, context, video }) => (
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
					src:
						video?.url ||
						(!attributes.id ? attributes.src : undefined),
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
