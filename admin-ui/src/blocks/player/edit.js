/* global videopack_config */
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	store as blockEditorStore,
	BlockControls,
} from '@wordpress/block-editor';
import VideopackContextBridge from '../../components/VideopackContextBridge';
import { useMemo, useCallback, useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { useVideoFormats } from '../../hooks/useVideoFormats.js';
import useVideopackContext from '../../hooks/useVideopackContext';
import useVideoProbe from '../../hooks/useVideoProbe.js';
import { getSettings } from '../../api/settings';
import { __ } from '@wordpress/i18n';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { undo as resetIcon } from '@wordpress/icons';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import VideoSettings from '../../components/VideoSettings/VideoSettings.js';
import Thumbnails from '../../components/Thumbnails/Thumbnails.js';
import AdditionalFormats from '../../components/AdditionalFormats/AdditionalFormats.js';
import './editor.scss';

const ALLOWED_BLOCKS = ['videopack/watermark', 'videopack/title'];

/**
 * Edit component for the video player block.
 *
 * @param {Object} props         Component props.
 * @param {Object} props.context Block context.
 * @return {Object}              The rendered component.
 */
export default function Edit(props) {
	const { context, isSelected, clientId } = props;
	const [options, setOptions] = useState({});
	const [restartCount, setRestartCount] = useState(0);

	const { parentClientId, parentAttributes, hasTitleBlock, isAnySelected } =
		useSelect(
			(select) => {
				const {
					getBlockRootClientId,
					getBlockAttributes,
					getBlocks,
					isBlockSelected,
					hasSelectedInnerBlock,
				} = select(blockEditorStore);
				const rootId = getBlockRootClientId(clientId);
				const blocks = getBlocks(clientId);

				return {
					parentClientId: rootId,
					parentAttributes: rootId ? getBlockAttributes(rootId) : {},
					hasTitleBlock: blocks.some(
						(block) => block.name === 'videopack/title'
					),
					isAnySelected:
						isBlockSelected(clientId) ||
						hasSelectedInnerBlock(clientId, true),
				};
			},
			[clientId]
		);

	const resetPlayer = useCallback(() => {
		setRestartCount((prev) => prev + 1);
	}, []);

	useEffect(() => {
		getSettings().then(setOptions);
	}, []);

	const { updateBlockAttributes } = useDispatch(blockEditorStore);

	const setParentAttributes = useCallback(
		(newAttrs) => {
			if (parentClientId) {
				updateBlockAttributes(parentClientId, newAttrs);
			}
		},
		[parentClientId, updateBlockAttributes]
	);

	const filteredAllowedBlocks = useMemo(() => {
		if (hasTitleBlock) {
			return ALLOWED_BLOCKS.filter((name) => name !== 'videopack/title');
		}
		return ALLOWED_BLOCKS;
	}, [hasTitleBlock]);

	// These options would ideally come from the parent via context if we updated videopack-video to provide them,
	// but for now we'll fetch them or rely on the parent's attributes.
	const videoData = useMemo(
		() => ({ record: null, setRecord: () => {}, hasResolved: true }),
		[]
	);

	const editorPostId = useSelect(
		(select) => select('core/editor')?.getCurrentPostId(),
		[]
	);
	const isSiteEditor = useSelect((select) => {
		const postType = select('core/editor')?.getCurrentPostType();
		return postType === 'wp_template' || postType === 'wp_template_part';
	}, []);
	const postId = context['videopack/postId'];
	const isContextual =
		postId && (Number(postId) !== Number(editorPostId) || isSiteEditor);
	const resolvedPostId = isContextual
		? postId
		: parentAttributes.id || undefined;

	// Use unified context hook for all design and behavior resolution
	const {
		resolved,
		style: contextStyles,
		classes: contextClasses,
	} = useVideopackContext({ ...parentAttributes, restartCount }, context);

	const { src, skin, isDiscovering } = resolved;
	useVideoProbe(src);
	const hasSources =
		(parentAttributes.sources && parentAttributes.sources.length > 0) ||
		(parentAttributes.source_groups &&
			Object.keys(parentAttributes.source_groups).length > 0);

	const { formats } = useVideoFormats(
		!hasSources && !isDiscovering && src ? resolvedPostId : null,
		!hasSources && !isDiscovering && src ? src : null
	);

	useEffect(() => {
		resetPlayer();
	}, [skin, resetPlayer]);

	// Merge parent attributes with global options for mirroring panels
	const effectiveAttributes = useMemo(() => {
		const result = {
			...options,
			...parentAttributes,
			...resolved, // Include all resolved values
			id: resolvedPostId,
		};

		if (context.isPreview) {
			result.src =
				videopack_config.url + '/src/images/Adobestock_469037984.mp4';
			result.poster =
				videopack_config.url +
				'/src/images/Adobestock_469037984_thumb1.jpg';
		}

		return result;
	}, [
		options,
		parentAttributes,
		resolved,
		resolvedPostId,
		context.isPreview,
	]);

	const config =
		typeof window !== 'undefined' ? window.videopack_config : undefined;
	const mejsSvgPath =
		config?.mejs_controls_svg ||
		(typeof window !== 'undefined'
			? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg`
			: '');

	const bridgeOverrides = useMemo(() => {
		return {
			'videopack/isInsidePlayerContainer':
				context['videopack/isInsidePlayerContainer'],
			'videopack/isStandalone': context['videopack/isStandalone'],
			'videopack/attachmentId':
				context['videopack/attachmentId'] || effectiveAttributes.id,
			'videopack/postType': context['videopack/isStandalone']
				? 'attachment'
				: context['videopack/postType'] || 'post',
			'videopack/isInsidePlayerOverlay': true,
			'videopack/postId':
				context['videopack/attachmentId'] || effectiveAttributes.id,
		};
	}, [context, effectiveAttributes.id]);

	const blockProps = useBlockProps({
		className: `videopack-video-player-engine-block videopack-wrapper ${contextClasses}`,
		style: {
			...contextStyles,
			'--videopack-mejs-controls-svg': mejsSvgPath
				? `url("${mejsSvgPath}")`
				: undefined,
		},
	});

	return (
		<div {...blockProps}>
			{isSelected && (
				<BlockControls group="other">
					<ToolbarGroup>
						<ToolbarButton
							icon={resetIcon}
							label={__(
								'Restart Video',
								'video-embed-thumbnail-generator'
							)}
							onClick={resetPlayer}
						/>
					</ToolbarGroup>
				</BlockControls>
			)}
			<InspectorControls>
				<Thumbnails
					setAttributes={setParentAttributes}
					attributes={effectiveAttributes}
					videoData={videoData}
					options={options}
					parentId={parentAttributes.id || 0}
				/>
				<VideoSettings
					setAttributes={setParentAttributes}
					attributes={effectiveAttributes}
					options={options}
					fallbackTitle={parentAttributes.title || ''}
					isBlockEditor={true}
				/>
				<AdditionalFormats
					key={parentAttributes.id || parentAttributes.src}
					attributes={effectiveAttributes}
					options={options}
					isDiscovering={isDiscovering}
				/>
			</InspectorControls>
			<VideoPlayer
				attributes={{
					...parentAttributes,
					restartCount,
					...( formats && ! hasSources ? { source_groups: formats } : {} ),
				}}
				context={context}
				isSelected={isSelected}
				hideStaticOverlays={true}
				onReady={() => {}}
			>
				<div
					className={`videopack-inner-blocks-overlay ${
						hasTitleBlock ? 'videopack-has-title-block' : ''
					}`}
				>
					<VideopackContextBridge
						key={resolvedPostId}
						attributes={parentAttributes}
						context={context}
						overrides={bridgeOverrides}
					>
						<InnerBlocks
							allowedBlocks={filteredAllowedBlocks}
							templateLock={false}
							renderAppender={
								isSelected
									? InnerBlocks.ButtonBlockAppender
									: undefined
							}
						/>
					</VideopackContextBridge>
				</div>
				{!isAnySelected && <div className="videopack-block-overlay" />}
			</VideoPlayer>
		</div>
	);
}
