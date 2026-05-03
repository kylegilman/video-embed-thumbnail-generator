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
	keys.push('variation', 'isPreview', 'isOverlay', 'isInsideThumbnail', 'isInsidePlayerOverlay', 'isInsidePlayerContainer');
	
	return [...new Set(keys)];
};

const PREVIEW_COMPONENTS = {
	'videopack/player-container': (props) => {
		const name = 'videopack/player-container';
		const {
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
			attributes = {},
			context = {},
			innerBlocks,
			video,
			resolvedDuotoneClass,
			isPreview,
			tagName: Tag = 'div',
			// Catch-all for everything else
			...allProps
		} = props;

		// 1. Identify which keys are valid block attributes that should NOT go to the DOM
		const blockAttributeKeys = getBlockAttributes(name);

		// 2. Separate DOM props from Block props
		const cleanDomProps = {};
		const blockProps = {};

		Object.keys(allProps).forEach((key) => {
			if (blockAttributeKeys.includes(key)) {
				blockProps[key] = allProps[key];
			} else if (
				!key.startsWith('videopack/') && 
				typeof allProps[key] !== 'object' && 
				typeof allProps[key] !== 'function'
			) {
				// Only standard primitives that aren't videopack-internal keys go to DOM
				cleanDomProps[key] = allProps[key];
			}
		});

		const loopDuotoneId = context['videopack/loopDuotoneId'];
		const activeDuotone = blockProps.duotone || attributes?.style?.color?.duotone || attributes?.duotone;
		let finalDuotoneClass = resolvedDuotoneClass || '';
		
		if (loopDuotoneId) {
			finalDuotoneClass = ''; // Loop handles the filter via its own class on the parent
		} else if (!finalDuotoneClass && activeDuotone) {
			if (typeof activeDuotone === 'string' && activeDuotone.startsWith('var:preset|duotone|')) {
				finalDuotoneClass = `wp-duotone-${activeDuotone.split('|').pop()}`;
			} else if (Array.isArray(activeDuotone)) {
				const idPrefix = Math.random().toString(36).substr(2, 9);
				finalDuotoneClass = `videopack-custom-duotone-${idPrefix}`;
			}
		}

		return (
			<Tag
				className={`videopack-video-block-container videopack-wrapper ${className || ''} ${finalDuotoneClass}`}
				{...cleanDomProps}
			>
				{children}
			</Tag>
		);
	},
	'videopack/collection': CollectionWrapper,
	'videopack/loop': VideoLoop,
	'videopack/pagination': Pagination,
	'videopack/thumbnail': (props) => {
		const name = 'videopack/thumbnail';
		const { attributes = {}, ...allProps } = props;
		const blockAttributeKeys = getBlockAttributes(name);
		const cleanDomProps = {};
		Object.keys(allProps).forEach((key) => {
			if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
				cleanDomProps[key] = allProps[key];
			}
		});
		return <VideoThumbnailPreview {...props} {...cleanDomProps} />;
	},
	'videopack/title': (props) => {
		const name = 'videopack/title';
		const { attributes = {}, ...allProps } = props;
		const blockAttributeKeys = getBlockAttributes(name);
		const cleanDomProps = {};
		Object.keys(allProps).forEach((key) => {
			if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
				cleanDomProps[key] = allProps[key];
			}
		});
		return <VideoTitle {...props} {...cleanDomProps} />;
	},
	'videopack/duration': (props) => {
		const name = 'videopack/duration';
		const { attributes = {}, ...allProps } = props;
		const blockAttributeKeys = getBlockAttributes(name);
		const cleanDomProps = {};
		Object.keys(allProps).forEach((key) => {
			if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
				cleanDomProps[key] = allProps[key];
			}
		});
		return <VideoDuration {...props} {...cleanDomProps} />;
	},
	'videopack/view-count': (props) => {
		const name = 'videopack/view-count';
		const { attributes = {}, ...allProps } = props;
		const blockAttributeKeys = getBlockAttributes(name);
		const cleanDomProps = {};
		Object.keys(allProps).forEach((key) => {
			if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
				cleanDomProps[key] = allProps[key];
			}
		});
		return <ViewCount {...props} {...cleanDomProps} />;
	},
	'videopack/play-button': (props) => {
		const name = 'videopack/play-button';
		const { attributes = {}, ...allProps } = props;
		const blockAttributeKeys = getBlockAttributes(name);
		const cleanDomProps = {};
		Object.keys(allProps).forEach((key) => {
			if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
				cleanDomProps[key] = allProps[key];
			}
		});
		return <PlayButton {...props} {...cleanDomProps} />;
	},
	'videopack/watermark': (props) => {
		const name = 'videopack/watermark';
		const { attributes = {}, ...allProps } = props;
		const blockAttributeKeys = getBlockAttributes(name);
		const cleanDomProps = {};
		Object.keys(allProps).forEach((key) => {
			if (!blockAttributeKeys.includes(key) && !key.startsWith('videopack/') && typeof allProps[key] !== 'object' && typeof allProps[key] !== 'function') {
				cleanDomProps[key] = allProps[key];
			}
		});
		return <VideoWatermark {...props} {...cleanDomProps} />;
	},
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
