/* global videopack_config */
import { useMemo } from '@wordpress/element';
import {
	useBlockProps,
	BlockControls,
	BlockVerticalAlignmentControl,
	AlignmentControl,
	InspectorControls,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { ToolbarGroup, ToolbarButton, PanelBody } from '@wordpress/components';
import { seen, mediaAndText, notAllowed as noneIcon } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import {
	play as playIcon,
	playOutline as playOutlineIcon,
} from '../../assets/icon';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import ViewCount from '../../components/ViewCount/ViewCount';
import { getColorFallbacks } from '../../utils/colors';
import useVideopackContext from '../../hooks/useVideopackContext';

/**
 * Edit component for the Videopack View Count block.
 *
 * @param {Object}   root0               Component props.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @return {Element}                     The rendered component.
 */
export default function Edit({ attributes, setAttributes, context }) {
	const vpContext = useVideopackContext(attributes, context);
	const postId = vpContext.resolved.attachmentId;
	const {
		iconType,
		showText,
		textAlign,
		title_color,
		title_background_color,
	} = attributes;

	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
	const isInsidePlayerContainer =
		!!context['videopack/isInsidePlayerContainer'];
	const isOverlay = isInsideThumbnail || isInsidePlayerOverlay;

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				title_color: vpContext.resolved.title_color,
				title_background_color:
					vpContext.resolved.title_background_color,
			}),
		[
			vpContext.resolved.title_color,
			vpContext.resolved.title_background_color,
		]
	);

	const defaultAlign = useMemo(() => {
		if (isInsideThumbnail) {
			return 'right';
		}
		return isInsidePlayerOverlay || isInsidePlayerContainer
			? 'right'
			: 'left';
	}, [isInsideThumbnail, isInsidePlayerOverlay, isInsidePlayerContainer]);
	const finalTextAlign =
		textAlign || context['videopack/textAlign'] || defaultAlign;

	const { latestVideoId } = useSelect(
		(select) => {
			if (!vpContext.resolved.isPreview) {
				return { latestVideoId: null };
			}
			const { getEntityRecords } = select('core');
			const query = {
				post_type: 'attachment',
				mime_type: 'video',
				per_page: 1,
				_fields: 'id',
			};
			const media = getEntityRecords('postType', 'attachment', query);
			return { latestVideoId: media?.[0]?.id };
		},
		[vpContext.resolved.isPreview]
	);

	const effectiveAttachmentId = postId || latestVideoId;

	const position =
		attributes.position || context['videopack/position'] || 'top';

	const blockProps = useBlockProps({
		className: `videopack-view-count-block videopack-view-count-wrapper ${vpContext.classes} ${
			isOverlay ? `is-overlay position-${position}` : ''
		} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${
			isInsidePlayerOverlay ? 'is-inside-player' : ''
		} ${!effectiveAttachmentId ? 'no-title' : ''} has-text-align-${finalTextAlign}`,
		style: vpContext.style,
	});

	const THEME_COLORS = videopack_config?.themeColors;

	return (
		<>
			<BlockControls>
				{isOverlay && (
					<BlockVerticalAlignmentControl
						value={position}
						onChange={(nextPosition) => {
							setAttributes({
								position: nextPosition || undefined,
							});
						}}
					/>
				)}
				<AlignmentControl
					value={finalTextAlign}
					onChange={(nextAlign) => {
						setAttributes({ textAlign: nextAlign });
					}}
				/>
				<ToolbarGroup
					label={__('Icon Type', 'video-embed-thumbnail-generator')}
				>
					<ToolbarButton
						icon={noneIcon}
						label={__('No Icon', 'video-embed-thumbnail-generator')}
						onClick={() => setAttributes({ iconType: 'none' })}
						isPressed={iconType === 'none'}
					/>
					<ToolbarButton
						icon={seen}
						label={__(
							'Eye Icon',
							'video-embed-thumbnail-generator'
						)}
						onClick={() => setAttributes({ iconType: 'eye' })}
						isPressed={iconType === 'eye'}
					/>
					<ToolbarButton
						icon={playIcon}
						label={__(
							'Play Icon (Filled)',
							'video-embed-thumbnail-generator'
						)}
						onClick={() => setAttributes({ iconType: 'play' })}
						isPressed={iconType === 'play'}
					/>
					<ToolbarButton
						icon={playOutlineIcon}
						label={__(
							'Play Icon (Outline)',
							'video-embed-thumbnail-generator'
						)}
						onClick={() =>
							setAttributes({ iconType: 'playOutline' })
						}
						isPressed={iconType === 'playOutline'}
					/>
				</ToolbarGroup>
				<ToolbarGroup
					label={__(
						'Display Options',
						'video-embed-thumbnail-generator'
					)}
				>
					<ToolbarButton
						icon={mediaAndText}
						label={
							showText
								? __(
										'Hide "views" text',
										'video-embed-thumbnail-generator'
									)
								: __(
										'Show "views" text',
										'video-embed-thumbnail-generator'
									)
						}
						onClick={() => setAttributes({ showText: !showText })}
						isPressed={showText}
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={__('Colors', 'video-embed-thumbnail-generator')}
					initialOpen={true}
				>
					<div className="videopack-color-section">
						<p className="videopack-settings-section-title">
							{__('Colors', 'video-embed-thumbnail-generator')}
						</p>
						<div className="videopack-color-flex-row">
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Text',
										'video-embed-thumbnail-generator'
									)}
									value={title_color}
									onChange={(value) =>
										setAttributes({ title_color: value })
									}
									colors={THEME_COLORS}
									fallbackValue={colorFallbacks.title_color}
								/>
							</div>
							<div className="videopack-color-flex-item">
								<CompactColorPicker
									label={__(
										'Background',
										'video-embed-thumbnail-generator'
									)}
									value={title_background_color}
									onChange={(value) =>
										setAttributes({
											title_background_color: value,
										})
									}
									colors={THEME_COLORS}
									fallbackValue={
										colorFallbacks.title_background_color
									}
								/>
							</div>
						</div>
					</div>
				</PanelBody>
			</InspectorControls>
			<ViewCount
				blockProps={blockProps}
				iconType={iconType}
				showText={showText}
				postId={effectiveAttachmentId}
				isInsideThumbnail={isInsideThumbnail}
				context={context}
				attributes={attributes}
			/>
		</>
	);
}
