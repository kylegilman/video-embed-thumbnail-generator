import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	BlockContextProvider,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useMemo, useCallback, useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { getSettings } from '../../api/settings';
import { __ } from '@wordpress/i18n';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import VideoSettings from '../../components/VideoSettings/VideoSettings.js';
import Thumbnails from '../../components/Thumbnails/Thumbnails.js';
import AdditionalFormats from '../../components/AdditionalFormats/AdditionalFormats.js';
import { getEffectiveValue } from '../../utils/context';
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
	const skin = getEffectiveValue('skin', {}, context);
	const [options, setOptions] = useState({});

	useEffect(() => {
		getSettings().then(setOptions);
	}, []);

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

	const hasTitleFeatures = !!(
		effectiveAttributes.overlay_title ||
		effectiveAttributes.downloadlink ||
		effectiveAttributes.embedcode
	);

	const blockProps = useBlockProps({
		className: `videopack-video-player-engine-block videopack-wrapper ${skin} ${
			hasTitleFeatures ? 'videopack-video-title-visible' : ''
		}`,
	});

	const contextValue = useMemo(() => {
		const result = {
			...context,
			'videopack/postId': resolvedPostId,
			'videopack/isInsidePlayer': true,
		};

		// Map attributes to prefixed context for inner blocks
		Object.entries(effectiveAttributes).forEach(([key, val]) => {
			if (key === 'id') {
				result.id = val;
				result['videopack/postId'] = val;
			} else {
				result[`videopack/${key}`] = val;
			}
		});

		return result;
	}, [context, effectiveAttributes, resolvedPostId, isContextual]);

	// Map context back to attributes for the VideoPlayer component
	const attributes = useMemo(() => {
		return {
			'videopack/postId': resolvedPostId,
			embed_method: contextValue['videopack/embed_method'],
			skin: getEffectiveValue('skin', {}, contextValue),
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
				{},
				contextValue
			),
			play_button_icon_color: getEffectiveValue(
				'play_button_icon_color',
				{},
				contextValue
			),
			control_bar_bg_color: getEffectiveValue(
				'control_bar_bg_color',
				{},
				contextValue
			),
			control_bar_color: getEffectiveValue(
				'control_bar_color',
				{},
				contextValue
			),
			title_color: getEffectiveValue('title_color', {}, contextValue),
			title_background_color: getEffectiveValue(
				'title_background_color',
				{},
				contextValue
			),
			downloadlink: contextValue['videopack/downloadlink'],
			embedcode: contextValue['videopack/embedcode'],
			restartCount: contextValue['videopack/restartCount'],
		};
	}, [contextValue, resolvedPostId]);

	return (
		<div {...blockProps}>
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
				isSelected={isSelected}
				hideStaticOverlays={true}
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
				{!isAnySelected && (
					<div className="videopack-block-overlay" />
				)}
			</VideoPlayer>
		</div>
	);
}
