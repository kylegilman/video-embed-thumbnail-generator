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
import { getEffectiveValue } from '../../utils/context';
import './index.css';

/**
 * A internal component to display the view count with correct styling and data.
 * This can be reused in previews (e.g. video loops).
 *
 * @param {Object}  props              Component props.
 * @param {Object}  props.blockProps   Merged Gutenberg block props.
 * @param {string}  props.iconType     The type of icon to display.
 * @param {boolean} props.showText     Whether to show the "views" text.
 * @param {number}  props.postId       The ID of the attachment to fetch meta for.
 * @param {number}  [props.count]      Optional pre-fetched count to display.
 */
export function ViewCount({
	blockProps,
	iconType,
	showText,
	postId,
	count,
	isInsideThumbnail,
	isOverlay,
	textAlign,
	position,
	skin,
	title_color,
	title_background_color,
	context = {},
}) {
	const effectiveSkin = getEffectiveValue('skin', { skin }, context);
	const effectiveTitleColor = getEffectiveValue('title_color', { title_color }, context);
	const effectiveTitleBgColor = getEffectiveValue('title_background_color', { title_background_color }, context);
	const { views, isResolving } = useSelect(
		(select) => {
			if (!postId || count !== undefined) {
				return { views: count || 0, isResolving: false };
			}
			const { getEntityRecord, isResolving: isResolvingSelector } =
				select('core');
			const media = getEntityRecord('postType', 'attachment', postId);
			return {
				views: media?.meta?.['_videopack-meta']?.starts,
				isResolving: isResolvingSelector('getEntityRecord', [
					'postType',
					'attachment',
					postId,
				]),
			};
		},
		[postId, count]
	);

	const actualIsOverlay = isOverlay !== undefined ? isOverlay : isInsideThumbnail;

	const wrapperClass = `videopack-view-count-block videopack-view-count-wrapper ${effectiveSkin} ${
		actualIsOverlay ? 'is-overlay is-badge' : ''
	} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${
		effectiveTitleBgColor ? 'videopack-has-title-background-color' : ''
	} position-${position || 'top'} has-text-align-${textAlign || 'right'}`;

	const finalBlockProps = blockProps || {
		className: wrapperClass,
		style: {
			'--videopack-title-color': effectiveTitleColor || undefined,
			'--videopack-title-background-color': effectiveTitleBgColor || undefined,
		},
	};

	if (isResolving) {
		return (
			<div {...finalBlockProps}>
				<Spinner />
			</div>
		);
	}

	const safeViews =
		views !== undefined && views !== null ? Number(views) : 0;

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

export default function Edit({ clientId, attributes, setAttributes, context }) {
	const postId = context['videopack/postId'];
	const {
		iconType,
		showText,
		textAlign,
		title_color,
		title_background_color,
	} = attributes;

	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayer = !!context['videopack/isInsidePlayer'];
	const isInsidePlayerBlock = !!context['videopack/isInsidePlayerBlock'];
	const isOverlay = isInsideThumbnail || isInsidePlayer;

	const effectiveTitleColor = getEffectiveValue('title_color', attributes, context);
	const effectiveTitleBgColor = getEffectiveValue('title_background_color', attributes, context);

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				title_color: getEffectiveValue('title_color', {}, context),
				title_background_color: getEffectiveValue('title_background_color', {}, context),
			}),
		[context]
	);

	const defaultAlign = isInsideThumbnail ? 'center' : ( ( isInsidePlayer || isInsidePlayerBlock ) ? 'right' : 'left' );
	const finalTextAlign = textAlign || context['videopack/textAlign'] || defaultAlign;

	const position = attributes.position || context['videopack/position'] || 'top';

	const blockProps = useBlockProps({
		className: `videopack-view-count-block videopack-view-count-wrapper ${
			isOverlay
				? 'is-overlay is-badge'
				: ''
		} position-${position} has-text-align-${finalTextAlign} ${
			effectiveTitleBgColor ? 'videopack-has-title-background-color' : ''
		}`,
		style: {
			'--videopack-title-color': effectiveTitleColor || undefined,
			'--videopack-title-background-color': effectiveTitleBgColor || undefined,
		},
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
						'Videopack: Design',
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
				postId={postId}
				isInsideThumbnail={isInsideThumbnail}
				context={context}
			/>
		</>
	);
}
