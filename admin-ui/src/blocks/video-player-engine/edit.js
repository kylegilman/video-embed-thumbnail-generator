import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useMemo, useCallback, useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { getSettings } from '../../api/settings';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import VideoSettings from '../../components/VideoSettings/VideoSettings.js';
import Thumbnails from '../../components/Thumbnails/Thumbnails.js';
import AdditionalFormats from '../../components/AdditionalFormats/AdditionalFormats.js';
import './editor.scss';

const ALLOWED_BLOCKS = ['videopack/video-watermark', 'videopack/video-title'];

const PlayerOverlayAppender = () => (
	<div className="videopack-overlay-appender-container">
		<InnerBlocks.ButtonBlockAppender />
	</div>
);

/**
 * Edit component for the video player block.
 *
 * @param {Object} props         Component props.
 * @param {Object} props.context Block context.
 * @return {Object}              The rendered component.
 */
export default function Edit(props) {
	const { context, isSelected, clientId } = props;
	const skin = context['videopack/skin'] || 'default';
	const [options, setOptions] = useState({});

	useEffect(() => {
		getSettings().then(setOptions);
	}, []);

	const {
		parentClientId,
		parentAttributes,
		hasTitleBlock,
		isAnySelected,
	} = useSelect(
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

	// Merge parent attributes with global options for mirroring panels
	const effectiveAttributes = useMemo(() => {
		return {
			...options,
			...parentAttributes,
		};
	}, [options, parentAttributes]);

	const blockProps = useBlockProps({
		className: `videopack-video-player-engine-block ${skin}`,
	});

	// Map context back to attributes for the VideoPlayer component
	const attributes = useMemo(() => {
		return {
			postId: context.postId,
			embed_method: context['videopack/embed_method'],
			skin: context['videopack/skin'],
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
			play_button_color: context['videopack/play_button_color'],
			play_button_icon_color: context['videopack/play_button_icon_color'],
			control_bar_bg_color: context['videopack/control_bar_bg_color'],
			control_bar_color: context['videopack/control_bar_color'],
			title_color: context['videopack/title_color'],
			title_background_color: context['videopack/title_background_color'],
		};
	}, [context]);

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
					<InnerBlocks
						allowedBlocks={filteredAllowedBlocks}
						templateLock={false}
						renderAppender={
							isSelected ? PlayerOverlayAppender : undefined
						}
					/>
				</div>
				{!isAnySelected && (
					<div className="videopack-engine-selection-overlay" />
				)}
			</VideoPlayer>
		</div>
	);
}
