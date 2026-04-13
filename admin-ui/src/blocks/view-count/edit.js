/* global videopack_config */
import { useMemo } from '@wordpress/element';
import {
	useBlockProps,
	BlockControls,
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
export function ViewCount({ blockProps, iconType, showText, postId, count }) {
	const { viewCount, isResolving } = useSelect(
		(select) => {
			if (!postId || count !== undefined) {
				return { viewCount: count || 0, isResolving: false };
			}
			const { getEntityRecord, isResolving: isResolvingSelector } =
				select('core');
			const media = getEntityRecord('postType', 'attachment', postId);
			return {
				viewCount: media?.meta?.['_videopack-meta']?.starts,
				isResolving: isResolvingSelector('getEntityRecord', [
					'postType',
					'attachment',
					postId,
					'starts', // specifically for the meta key
				]),
			};
		},
		[postId, count]
	);

	if (isResolving) {
		return (
			<div {...blockProps}>
				<Spinner />
			</div>
		);
	}

	const safeViewCount =
		viewCount !== undefined && viewCount !== null ? Number(viewCount) : 0;

	const displayValue = showText
		? sprintf(
			/* translators: %s is the formatted number of views */
			_n(
				'%s view',
				'%s views',
				safeViewCount,
				'video-embed-thumbnail-generator'
			),
			safeViewCount.toLocaleString()
		)
		: safeViewCount.toLocaleString();

	const renderIcon = () => {
		switch (iconType) {
			case 'eye':
				return <Icon icon={seen} style={{ marginRight: '4px' }} />;
			case 'play':
				return (
					<Icon
						icon={playIcon}
						size={16}
						style={{ marginRight: '4px' }}
					/>
				);
			case 'playOutline':
				return (
					<Icon
						icon={playOutlineIcon}
						size={16}
						style={{ marginRight: '4px' }}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div {...blockProps}>
			{renderIcon()}
			{displayValue}
		</div>
	);
}

export default function Edit({ clientId, attributes, setAttributes, context }) {
	const { postId } = context;
	const {
		iconType,
		showText,
		textAlign,
		title_color,
		title_background_color,
	} = attributes;

	const { isInsidePlayer } = useSelect(
		(select) => {
			const { getBlockName, getBlockRootClientId } =
				select('core/block-editor');
			const rootId = getBlockRootClientId(clientId);
			const parentName = rootId ? getBlockName(rootId) : null;
			return {
				isInsidePlayer: parentName === 'videopack/videopack-video',
			};
		},
		[clientId]
	);

	const titleColorFallback = context['videopack/title_color'];
	const titleBackgroundColorFallback =
		context['videopack/title_background_color'];

	const THEME_COLORS = videopack_config?.themeColors;

	const colorFallbacks = useMemo(
		() =>
			getColorFallbacks({
				title_color: titleColorFallback,
				title_background_color: titleBackgroundColorFallback,
			}),
		[titleColorFallback, titleBackgroundColorFallback]
	);

	const finalTextAlign = textAlign || (isInsidePlayer ? 'right' : undefined);

	let justifyContent = 'flex-start';
	if (finalTextAlign === 'center') {
		justifyContent = 'center';
	} else if (finalTextAlign === 'right') {
		justifyContent = 'flex-end';
	}

	const blockProps = useBlockProps({
		className: 'videopack-view-count-block',
		style: {
			display: 'flex',
			alignItems: 'center',
			textAlign: finalTextAlign,
			'--videopack-title-color':
				title_color || titleColorFallback || undefined,
			'--videopack-title-background-color':
				title_background_color ||
				titleBackgroundColorFallback ||
				undefined,
			justifyContent,
			flexGrow: 1,
		},
	});

	return (
		<>
			<BlockControls>
				<AlignmentControl
					value={textAlign}
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
			/>
		</>
	);
}
