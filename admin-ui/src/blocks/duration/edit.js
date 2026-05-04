/* global videopack_config */
import { useMemo } from '@wordpress/element';
import {
	useBlockProps,
	BlockControls,
	BlockVerticalAlignmentControl,
	AlignmentControl,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import VideoDuration from '../../components/VideoDuration/VideoDuration';
import { getColorFallbacks } from '../../utils/colors';
import useVideopackContext from '../../hooks/useVideopackContext';

/**
 * Edit component for the Videopack Video Duration block.
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
		textAlign,
		position: attrPosition,
		title_color,
		title_background_color,
	} = attributes;

	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
	const isInsidePlayerContainer =
		!!context['videopack/isInsidePlayerContainer'];
	const isOverlay = isInsideThumbnail || isInsidePlayerOverlay;

	let defaultAlign = 'left';
	if (isOverlay || isInsidePlayerContainer) {
		defaultAlign = 'right';
	}
	const finalTextAlign =
		textAlign || context['videopack/textAlign'] || defaultAlign;
	const position = attrPosition || context['videopack/position'] || 'top';

	const THEME_COLORS = videopack_config?.themeColors;

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

	const blockProps = useBlockProps({
		className: `videopack-video-duration-block ${vpContext.classes} ${
			isOverlay ? 'is-inside-thumbnail is-overlay is-badge' : ''
		} position-${position} has-text-align-${finalTextAlign}`,
		style: vpContext.style,
	});

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
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={__('Colors', 'video-embed-thumbnail-generator')}
					initialOpen={true}
				>
					<div className="videopack-color-section">
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
			<div {...blockProps}>
				<VideoDuration
					postId={effectiveAttachmentId}
					isOverlay={isOverlay}
					isInsideThumbnail={isInsideThumbnail}
					textAlign={finalTextAlign}
					position={position}
					attributes={attributes}
					context={context}
				/>
			</div>
		</>
	);
}
