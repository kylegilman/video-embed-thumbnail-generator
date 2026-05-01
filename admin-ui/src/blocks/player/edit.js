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
			return ALLOWED_BLOCKS.filter(
				(name) => name !== 'videopack/title'
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

	const isPreview = context.isPreview;
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
			isPreview: context.isPreview,
		};

		if (isPreview) {
			result.src = videopack_config.url + '/src/images/Adobestock_469037984.mp4';
			result.poster = videopack_config.url + '/src/images/Adobestock_469037984_thumb1.jpg';
		}

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

	// Map context back to attributes for the VideoPlayer component
	const attributes = useMemo(() => {
		const result = {
			'videopack/postId': resolvedPostId,
			embed_method: getEffectiveValue(
				'embed_method',
				parentAttributes,
				context
			),
			skin: getEffectiveValue('skin', parentAttributes, context),
			autoplay: context['videopack/autoplay'],
			controls: context['videopack/controls'],
			loop: context['videopack/loop'],
			muted: context['videopack/muted'],
			playsinline: context['videopack/playsinline'],
			poster: context['videopack/poster'],
			preload: context['videopack/preload'],
			src: context['videopack/src'],
			volume: context['videopack/volume'],
			auto_res: context['videopack/auto_res'],
			auto_codec: context['videopack/auto_codec'],
			sources: context['videopack/sources'],
			source_groups: context['videopack/source_groups'],
			text_tracks: context['videopack/text_tracks'],
			playback_rate: context['videopack/playback_rate'],
			watermark: context['videopack/watermark'],
			watermark_styles: context['videopack/watermark_styles'],
			watermark_link_to: context['videopack/watermark_link_to'],
			default_ratio: context['videopack/default_ratio'],
			fixed_aspect: context['videopack/fixed_aspect'],
			fullwidth: context['videopack/fullwidth'],
			play_button_color: getEffectiveValue(
				'play_button_color',
				parentAttributes,
				context
			),
			play_button_secondary_color: getEffectiveValue(
				'play_button_secondary_color',
				parentAttributes,
				context
			),
			control_bar_bg_color: getEffectiveValue(
				'control_bar_bg_color',
				parentAttributes,
				context
			),
			control_bar_color: getEffectiveValue(
				'control_bar_color',
				parentAttributes,
				context
			),
			title_color: getEffectiveValue(
				'title_color',
				parentAttributes,
				context
			),
			title_background_color: getEffectiveValue(
				'title_background_color',
				parentAttributes,
				context
			),
			downloadlink: context['videopack/downloadlink'],
			embedcode: context['videopack/embedcode'],
			restartCount:
				restartCount || context['videopack/restartCount'],
			duotone: context['videopack/duotone'],
			style: context['videopack/style'],
		};
		return result;
	}, [context, parentAttributes, resolvedPostId, restartCount]);

	const bridgeOverrides = useMemo(() => {
		return {
			'videopack/isInsidePlayerContainer': context['videopack/isInsidePlayerContainer'],
			'videopack/isStandalone': context['videopack/isStandalone'],
			'videopack/attachmentId': context['videopack/attachmentId'] || effectiveAttributes.id,
			'videopack/postType': context['videopack/isStandalone'] ? 'attachment' : (context['videopack/postType'] || 'post'),
			'videopack/isInsidePlayerOverlay': true,
			'videopack/postId': context['videopack/attachmentId'] || effectiveAttributes.id,
		};
	}, [context, effectiveAttributes.id]);

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
		} ${
			getEffectiveValue('play_button_color', {}, effectiveAttributes)
				? 'videopack-has-play-button-color'
				: ''
		} ${
			getEffectiveValue('play_button_secondary_color', {}, effectiveAttributes)
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
				effectiveAttributes
			),
			'--videopack-play-button-secondary-color': getEffectiveValue(
				'play_button_secondary_color',
				{},
				effectiveAttributes
			),
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
				/>
			</InspectorControls>
			<VideoPlayer
				attributes={attributes}
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
						attributes={attributes}
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
