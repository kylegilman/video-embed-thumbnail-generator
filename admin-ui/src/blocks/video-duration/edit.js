import { useMemo } from '@wordpress/element';
import {
	useBlockProps,
	BlockControls,
	BlockVerticalAlignmentControl,
	AlignmentControl,
	InspectorControls,
	Spinner,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { getEffectiveValue } from '../../utils/context';
import { getColorFallbacks } from '../../utils/colors';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';

/* global videopack_config */

import useVideopackContext from '../../hooks/useVideopackContext';

/**
 * A internal component to display the video duration with correct formatting and data.
 */
export function VideoDuration({
	postId,
	isOverlay,
	isInsideThumbnail,
	textAlign,
	position,
	attributes,
	context,
}) {
	const actualIsOverlay =
		isOverlay !== undefined ? isOverlay : isInsideThumbnail;
	const vpContext = useVideopackContext(attributes, context);

	const { duration, isResolving } = useSelect(
		(select) => {
			if (!postId) {
				return { duration: null, isResolving: false };
			}
			const { getEntityRecord, isResolving: isResolvingSelector } =
				select('core');
			const record = getEntityRecord('postType', 'attachment', postId);
			return {
				duration: record?.meta?.['_videopack-meta']?.duration,
				isResolving: isResolvingSelector('getEntityRecord', [
					'postType',
					'attachment',
					postId,
				]),
			};
		},
		[postId]
	);

	if (isResolving) {
		return (
			<div
				className={`videopack-video-duration ${actualIsOverlay ? 'is-overlay' : ''}`}
			>
				<Spinner />
			</div>
		);
	}

	const formatDuration = (seconds) => {
		if (!seconds) {
			return '0:00';
		}
		const s = Math.floor(seconds);
		const h = Math.floor(s / 3600);
		const m = Math.floor((s % 3600) / 60);
		const sec = s % 60;
		if (h > 0) {
			return `${h}:${m.toString().padStart(2, '0')}:${sec
				.toString()
				.padStart(2, '0')}`;
		}
		return `${m}:${sec.toString().padStart(2, '0')}`;
	};

	return (
		<div
			className={`videopack-video-duration-block videopack-video-duration ${vpContext.classes} ${actualIsOverlay ? 'is-overlay is-badge' : ''} position-${position || 'top'} has-text-align-${textAlign || 'right'}`}
			style={vpContext.style}
		>
			{duration ? formatDuration(duration) : '0:00'}
		</div>
	);
}

export default function Edit({ attributes, setAttributes, context }) {
	const postId = context['videopack/postId'];
	const {
		textAlign,
		position: attrPosition,
		title_color,
		title_background_color,
	} = attributes;

	const vpContext = useVideopackContext(attributes, context);

	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
	const isInsidePlayerContainer =
		!!context['videopack/isInsidePlayerContainer'];
	const isOverlay = isInsideThumbnail || isInsidePlayerOverlay;

	const defaultAlign = isOverlay
		? isInsideThumbnail
			? 'center'
			: 'left'
		: isInsidePlayerContainer
			? 'right'
			: 'left';
	const finalTextAlign =
		textAlign || context['videopack/textAlign'] || defaultAlign;
	const position = attrPosition || context['videopack/position'] || 'top';

	const THEME_COLORS = videopack_config?.themeColors;

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				title_color: getEffectiveValue('title_color', {}, context),
				title_background_color: getEffectiveValue(
					'title_background_color',
					{},
					context
				),
			}),
		[context]
	);

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
					postId={postId}
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
