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

import { Icon, download as downloadIcon } from '@wordpress/icons';
import playerContainerMetadata from '../../blocks/player-container/block.json';
import thumbnailMetadata from '../../blocks/thumbnail/block.json';
import titleMetadata from '../../blocks/title/block.json';
import downloadMetadata from '../../blocks/download/block.json';
import shareMetadata from '../../blocks/share/block.json';
import { TITLE_DOWNLOAD_BLOCK_ATTRS } from '../../utils/titleDownloadBlock';
import durationMetadata from '../../blocks/duration/block.json';
import viewCountMetadata from '../../blocks/view-count/block.json';
import watermarkMetadata from '../../blocks/watermark/block.json';
import playButtonMetadata from '../../blocks/play-button/block.json';
import { designAttributes } from '../../blocks/shared/design-context';

const BLOCK_METADATA = {
	'videopack/player-container': playerContainerMetadata,
	'videopack/thumbnail': thumbnailMetadata,
	'videopack/title': titleMetadata,
	'videopack/download': downloadMetadata,
	'videopack/share': shareMetadata,
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
	'videopack/download': (props) => {
		const attrs = {
			...TITLE_DOWNLOAD_BLOCK_ATTRS,
			...props.attributes,
		};
		const styleType = attrs.styleType || 'text';
		return (
			<span
				className={`videopack-download-wrapper videopack-download-block is-inside-title-meta mode-${attrs.downloadMode || 'direct'}`}
				style={{ display: 'inline-flex', alignItems: 'center' }}
			>
				<button
					type="button"
					className={`videopack-download-link videopack-icons style-${styleType}`}
				>
					{attrs.icon !== false && (
						<Icon
							icon={downloadIcon}
							className="videopack-icon-svg"
						/>
					)}
				</button>
			</span>
		);
	},
	'videopack/share': (props) => {
		const attrs = {
			iconType: 'share',
			showText: false,
			styleType: 'text',
			...props.attributes,
		};
		const styleType = attrs.styleType || 'text';
		const iconType = attrs.iconType || 'share';

		const shareIconSvg = (
			<svg className="videopack-icon-svg share-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
				<path d="M9 11.8l6.1-4.5c.1.4.4.7.9.7h2c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v.4l-6.4 4.8c-.2-.1-.4-.2-.6-.2H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h2c.2 0 .4-.1.6-.2l6.4 4.8v.4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2c-.5 0-.8.3-.9.7L9 12.2v-.4z" />
			</svg>
		);
		const externalIconSvg = (
			<svg className="videopack-icon-svg external-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
				<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
			</svg>
		);
		const iosShareIconSvg = (
			<svg className="videopack-icon-svg ios-share-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
				<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
			</svg>
		);

		let activeIcon = null;
		if (iconType === 'share') {
			activeIcon = shareIconSvg;
		} else if (iconType === 'external') {
			activeIcon = externalIconSvg;
		} else if (iconType === 'iosShare') {
			activeIcon = iosShareIconSvg;
		}

		return (
			<span
				className="videopack-share-wrapper videopack-share-block is-inside-title-meta"
				style={{ display: 'inline-flex', alignItems: 'center' }}
			>
				<button
					type="button"
					className={`videopack-share-link videopack-share-toggle videopack-icons style-${styleType}`}
				>
					{iconType !== 'none' && activeIcon}
					{(attrs.showText || iconType === 'none') && (
						<span
							className="videopack-share-text-label"
							style={iconType !== 'none' ? { marginLeft: '4px' } : undefined}
						>
							{__('Share', 'video-embed-thumbnail-generator')}
						</span>
					)}
				</button>
			</span>
		);
	},
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
