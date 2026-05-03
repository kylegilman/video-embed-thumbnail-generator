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
import {
	Icon,
	Spinner,
	ToolbarGroup,
	ToolbarButton,
	PanelBody,
} from '@wordpress/components';
import { seen, mediaAndText, notAllowed as noneIcon } from '@wordpress/icons';
import { __, _n, sprintf } from '@wordpress/i18n';
import {
	play as playIcon,
	playOutline as playOutlineIcon,
} from '../../assets/icon';
import CompactColorPicker from '../../components/CompactColorPicker/CompactColorPicker';
import { getColorFallbacks } from '../../utils/colors';
import useVideopackContext from '../../hooks/useVideopackContext';
import useVideopackData from '../../hooks/useVideopackData';
import './index.css';

/**
 * A internal component to display the view count with correct styling and data.
 */
export function ViewCount({
	blockProps,
	iconType = 'none',
	showText = true,
	postId: propPostId,
	count,
	isInsideThumbnail = false,
	isOverlay = false,
	textAlign,
	position = 'top',
	attributes = {},
	context = {},
}) {
	const vpContext = useVideopackContext(attributes, context);
	const { data: views, isResolving } = useVideopackData('views', context);
	const attachmentId = vpContext.resolved.attachmentId;

	const actualIsOverlay = isOverlay !== undefined ? isOverlay : (isInsideThumbnail || !!context['videopack/isInsidePlayerOverlay']);
	const isInsidePlayerContainer = !!context['videopack/isInsidePlayerContainer'];
	const defaultAlign = isInsideThumbnail || actualIsOverlay || isInsidePlayerContainer ? 'right' : 'left';

	const wrapperClass = `videopack-view-count-block videopack-view-count-wrapper ${vpContext.classes} ${
		actualIsOverlay ? 'is-overlay is-badge' : ''
	} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${
		actualIsOverlay ? `position-${position || 'top'}` : ''
	} has-text-align-${textAlign || defaultAlign} ${
		vpContext.resolved.isPreview ? 'is-preview' : ''
	}`;

	const finalBlockProps = blockProps || {
		className: wrapperClass,
		style: vpContext.style,
	};

	if (vpContext.resolved.isDiscovering && !attachmentId) {
		return (
			<div {...finalBlockProps}>
				<Spinner />
			</div>
		);
	}

	if (!attachmentId && count === undefined && !vpContext.resolved.isPreview) {
		return null;
	}

	if (isResolving) {
		return (
			<div {...finalBlockProps}>
				<Spinner />
			</div>
		);
	}

	const safeViews =
		count !== undefined
			? Number(count)
			: views !== undefined && views !== null
			? Number(views)
			: 0;

	const displayValue = showText
		? sprintf(
			/* translators: %s is the formatted number of views */
			_n(
				'%s view',
				'%s views',
				safeViews,
				'video-embed-thumbnail-generator'
			),
			safeViews.toLocaleString()
		)
		: safeViews.toLocaleString();

	const renderIcon = () => {
		switch (iconType) {
			case 'eye':
				return <Icon icon={seen} className="videopack-icon-left-margin" />;
			case 'play':
				return (
					<Icon
						icon={playIcon}
						size={16}
						className="videopack-icon-left-margin"
					/>
				);
			case 'playOutline':
				return (
					<Icon
						icon={playOutlineIcon}
						size={16}
						className="videopack-icon-left-margin"
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div {...finalBlockProps}>
			<div className="videopack-view-count">
				{renderIcon()}
				{displayValue}
			</div>
		</div>
	);
}

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
	const isInsidePlayerContainer = !!context['videopack/isInsidePlayerContainer'];
	const isOverlay = isInsideThumbnail || isInsidePlayerOverlay;

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				title_color: vpContext.resolved.title_color,
				title_background_color: vpContext.resolved.title_background_color,
			}),
		[vpContext.resolved.title_color, vpContext.resolved.title_background_color]
	);

	const defaultAlign = isInsideThumbnail ? 'right' : ( ( isInsidePlayerOverlay || isInsidePlayerContainer ) ? 'right' : 'left' );
	const finalTextAlign = textAlign || context['videopack/textAlign'] || defaultAlign;

	const { latestVideoId } = useSelect((select) => {
		if (!vpContext.resolved.isPreview) return { latestVideoId: null };
		const { getEntityRecords } = select('core');
		const query = {
			post_type: 'attachment',
			mime_type: 'video',
			per_page: 1,
			_fields: 'id',
		};
		const media = getEntityRecords('postType', 'attachment', query);
		return { latestVideoId: media?.[0]?.id };
	}, [vpContext.resolved.isPreview]);

	const effectiveAttachmentId = postId || latestVideoId;

	const position = attributes.position || context['videopack/position'] || 'top';

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
					title={__(
						'Colors',
						'video-embed-thumbnail-generator'
					)}
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
			/>
		</>
	);
}
