import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	BlockContextProvider,
	store as blockEditorStore,
	BlockControls,
} from '@wordpress/block-editor';
import { useMemo, useCallback, useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { useVideoFormats } from '../../hooks/useVideoFormats.js';
import { getEffectiveValue, normalizeSourceGroups } from '../../utils/context';
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

const ALLOWED_BLOCKS = ['videopack/video-watermark', 'videopack/video-title'];

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
						(block) => block.name === 'videopack/video-title'
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
			return ALLOWED_BLOCKS.filter(
				(name) => name !== 'videopack/video-title'
			);
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

	const src = getEffectiveValue('src', {}, context);
	const { probedMetadata } = useVideoProbe(src);
	const { formats: videoFormats } = useVideoFormats(resolvedPostId, src);
	const fetchedSourceGroups = useMemo(
		() => normalizeSourceGroups(videoFormats),
		[videoFormats]
	);

	// Merge parent attributes with global options for mirroring panels
	const effectiveAttributes = useMemo(() => {
		const result = {
			...options,
			...parentAttributes,
			id: resolvedPostId,
		};

		// Prioritize fresh data from context (either from parent hydration or loop context)
		const overrides = {
			src: context['videopack/src'],
			poster: context['videopack/poster'],
			width: context['videopack/width'],
			height: context['videopack/height'],
			sources: context['videopack/sources'],
			source_groups: context['videopack/source_groups'],
			text_tracks: context['videopack/text_tracks'],
			default_ratio: context['videopack/default_ratio'],
			fixed_aspect: context['videopack/fixed_aspect'],
			fullwidth: context['videopack/fullwidth'],
		};

		Object.entries(overrides).forEach(([key, val]) => {
			if (val !== undefined && val !== null) {
				result[key] = val;
			}
		});

		return result;
	}, [options, parentAttributes, resolvedPostId, context, isContextual]);

	const config =
		typeof window !== 'undefined' ? window.videopack_config : undefined;
	const mejsSvgPath =
		config?.mejs_controls_svg ||
		(typeof window !== 'undefined'
			? `${window.location.origin}/wp-includes/js/mediaelement/mejs-controls.svg`
			: '');

	const hasTitleFeatures = !!(
		effectiveAttributes.overlay_title ||
		effectiveAttributes.downloadlink ||
		effectiveAttributes.embedcode
	);

	const contextValue = useMemo(() => {
		const result = {
			...context,
			'videopack/postId': resolvedPostId,
			'videopack/isInsidePlayerOverlay': true,
		};

		// Map attributes to prefixed context for inner blocks
		Object.entries(effectiveAttributes).forEach(([key, val]) => {
			if (key === 'id') {
				result.id = val;
				result['videopack/postId'] = val;
			} else {
				// Only overwrite context if the attribute actually has a value
				if (
					val !== undefined &&
					val !== null &&
					(typeof val !== 'object' ||
						(Array.isArray(val)
							? val.length > 0
							: Object.keys(val).length > 0))
				) {
					result[`videopack/${key}`] = val;
				}
			}
		});

		// FORCE dynamically fetched sources to take priority
		if (
			fetchedSourceGroups &&
			Object.keys(fetchedSourceGroups).length > 0
		) {
			result['videopack/source_groups'] = fetchedSourceGroups;
		}

		return result;
	}, [
		context,
		effectiveAttributes,
		resolvedPostId,
		isContextual,
		fetchedSourceGroups,
	]);

	const effectiveEmbedMethod = getEffectiveValue(
		'embed_method',
		parentAttributes,
		context
	);
	const skin = getEffectiveValue('skin', parentAttributes, context);

	useEffect(() => {
		resetPlayer();
	}, [skin, resetPlayer]);

	const blockProps = useBlockProps({
		className: `videopack-video-player-engine-block videopack-wrapper ${
			effectiveEmbedMethod === 'Video.js' ? skin : ''
		} ${hasTitleFeatures ? 'videopack-video-title-visible' : ''} ${
			getEffectiveValue('play_button_color', {}, contextValue)
				? 'videopack-has-play-button-color'
				: ''
		} ${
			getEffectiveValue('play_button_secondary_color', {}, contextValue)
				? 'videopack-has-play-button-secondary-color'
				: ''
		}`,
		style: {
			'--videopack-mejs-controls-svg': mejsSvgPath
				? `url("${mejsSvgPath}")`
				: undefined,
			'--videopack-play-button-color': getEffectiveValue(
				'play_button_color',
				{},
				contextValue
			),
			'--videopack-play-button-secondary-color': getEffectiveValue(
				'play_button_secondary_color',
				{},
				contextValue
			),
		},
	});

	// Map context back to attributes for the VideoPlayer component
	const attributes = useMemo(() => {
		return {
			'videopack/postId': resolvedPostId,
			embed_method: getEffectiveValue(
				'embed_method',
				parentAttributes,
				contextValue
			),
			skin: getEffectiveValue('skin', parentAttributes, contextValue),
			autoplay: contextValue['videopack/autoplay'],
			controls: contextValue['videopack/controls'],
			loop: contextValue['videopack/loop'],
			muted: contextValue['videopack/muted'],
			playsinline: contextValue['videopack/playsinline'],
			poster: contextValue['videopack/poster'],
			preload: contextValue['videopack/preload'],
			src: contextValue['videopack/src'],
			volume: contextValue['videopack/volume'],
			auto_res: contextValue['videopack/auto_res'],
			auto_codec: contextValue['videopack/auto_codec'],
			sources: contextValue['videopack/sources'],
			source_groups: contextValue['videopack/source_groups'],
			text_tracks: contextValue['videopack/text_tracks'],
			playback_rate: contextValue['videopack/playback_rate'],
			watermark: contextValue['videopack/watermark'],
			watermark_styles: contextValue['videopack/watermark_styles'],
			watermark_link_to: contextValue['videopack/watermark_link_to'],
			default_ratio: contextValue['videopack/default_ratio'],
			fixed_aspect: contextValue['videopack/fixed_aspect'],
			fullwidth: contextValue['videopack/fullwidth'],
			play_button_color: getEffectiveValue(
				'play_button_color',
				parentAttributes,
				contextValue
			),
			play_button_secondary_color: getEffectiveValue(
				'play_button_secondary_color',
				parentAttributes,
				contextValue
			),
			control_bar_bg_color: getEffectiveValue(
				'control_bar_bg_color',
				parentAttributes,
				contextValue
			),
			control_bar_color: getEffectiveValue(
				'control_bar_color',
				parentAttributes,
				contextValue
			),
			title_color: getEffectiveValue(
				'title_color',
				parentAttributes,
				contextValue
			),
			title_background_color: getEffectiveValue(
				'title_background_color',
				parentAttributes,
				contextValue
			),
			downloadlink: contextValue['videopack/downloadlink'],
			embedcode: contextValue['videopack/embedcode'],
			restartCount:
				restartCount || contextValue['videopack/restartCount'],
		};
	}, [contextValue, resolvedPostId, restartCount]);

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
				/>
			</InspectorControls>
			<VideoPlayer
				attributes={attributes}
				context={contextValue}
				isSelected={isSelected}
				hideStaticOverlays={true}
				onReady={() => {}}
			>
				<div
					className={`videopack-inner-blocks-overlay ${
						hasTitleBlock ? 'videopack-has-title-block' : ''
					}`}
				>
					<BlockContextProvider
						key={resolvedPostId}
						value={contextValue}
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
					</BlockContextProvider>
				</div>
				{!isAnySelected && <div className="videopack-block-overlay" />}
			</VideoPlayer>
		</div>
	);
}
