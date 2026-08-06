/* global videopack_config */
import { useMemo } from '@wordpress/element';
import {
	useBlockProps,
	BlockControls,
	HeadingLevelDropdown,
	BlockVerticalAlignmentControl,
	AlignmentControl,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	ToolbarGroup,
	ToolbarButton,
	PanelBody,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { title as titleIcon } from '@wordpress/icons';
import BackgroundToggleButton from '../../components/BackgroundToggleButton/BackgroundToggleButton';
import TitleColorPanel from '../../components/TitleColorPanel/TitleColorPanel';
import VideoTitle from '../../components/VideoTitle/VideoTitle';
import useVideopackContext from '../../hooks/useVideopackContext';
import useShowBackground from '../../hooks/useShowBackground';
import './editor.scss';

// Title is a valid theme-context root (Overlays.scss) and owns its own
// title/background colors — see the $badge-selectors comment in
// VideoDuration.js for why Duration/View-count also need these two.
const TITLE_CONTEXT_OPTS = {
	excludeKeys: ['downloadlink'],
	classKeys: ['skin', 'title_color', 'title_background_color'],
};

/**
 * Edit component for the Videopack Video Title block.
 *
 * @param {Object}   root0               Component props.
 * @param {string}   root0.clientId      Block client ID.
 * @param {Object}   root0.attributes    Block attributes.
 * @param {Function} root0.setAttributes Attribute setter.
 * @param {Object}   root0.context       Block context.
 * @return {Element}                     The rendered component.
 */
export default function Edit({ clientId, attributes, setAttributes, context }) {
	const vpContext = useVideopackContext(
		attributes,
		context,
		TITLE_CONTEXT_OPTS
	);
	const { postId, postType, prioritizePostData } = vpContext.resolved;
	const embedlink = context['videopack/embedlink'];
	const {
		title,
		tagName: Tag = 'h3',
		position: attrPosition,
		isOverlay: explicitIsOverlay,
		textAlign: attrTextAlign,
		overlay_title,
		usePostTitle,
		linkToPost,
	} = attributes;

	// Undefined (never touched by this block) inherits the Collection/Loop's
	// setting -- the toggle shows that inherited value and nothing is written
	// to this block's attributes until the user explicitly overrides it.
	const effectiveUsePostTitle = usePostTitle ?? !!prioritizePostData;

	const isInsideThumbnail = !!context['videopack/isInsideThumbnail'];
	const isInsidePlayerOverlay = !!context['videopack/isInsidePlayerOverlay'];
	const isInsidePlayerContainer =
		!!context['videopack/isInsidePlayerContainer'];

	// Derived defaults that don't fight with user saved attributes
	const position = attrPosition || (isInsideThumbnail ? 'bottom' : 'top');
	const textAlign = attrTextAlign || (isInsideThumbnail ? 'center' : 'left');

	const globalOptions = videopack_config?.options || {};

	const finalOverlayTitle = useMemo(() => {
		if (overlay_title !== undefined) {
			return !!overlay_title;
		}
		return globalOptions.overlay_title !== undefined
			? !!globalOptions.overlay_title
			: true;
	}, [overlay_title, globalOptions.overlay_title]);

	const isOverlay =
		explicitIsOverlay !== undefined
			? explicitIsOverlay
			: isInsideThumbnail || isInsidePlayerOverlay;

	const finalShowBackground = useShowBackground(
		attributes,
		context,
		isOverlay
	);
	const wrapperClass = 'videopack-video-title-wrapper';

	const blockProps = useBlockProps({
		className: `videopack-video-title-block ${wrapperClass} ${vpContext.classes} ${
			isOverlay ? `is-overlay position-${position}` : ''
		} ${isInsideThumbnail ? 'is-inside-thumbnail' : ''} ${
			isInsidePlayerOverlay ? 'is-inside-player' : ''
		} ${!postId && !title ? 'no-title' : ''} has-text-align-${textAlign}`,
		style: vpContext.style,
	});

	return (
		<>
			<BlockControls group="block">
				{!isInsideThumbnail && !isInsidePlayerOverlay && (
					<HeadingLevelDropdown
						value={Tag.replace('h', '') * 1}
						onChange={(newLevel) =>
							setAttributes({ tagName: `h${newLevel}` })
						}
					/>
				)}
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
					value={textAlign}
					onChange={(nextAlign) => {
						setAttributes({ textAlign: nextAlign });
					}}
				/>
				<ToolbarGroup>
					{(isInsidePlayerOverlay || isInsidePlayerContainer) && (
						<ToolbarButton
							icon={titleIcon}
							label={
								finalOverlayTitle
									? __(
											'Hide Title',
											'video-embed-thumbnail-generator'
										)
									: __(
											'Show Title',
											'video-embed-thumbnail-generator'
										)
							}
							isPressed={finalOverlayTitle}
							onClick={() =>
								setAttributes({
									overlay_title: !finalOverlayTitle,
								})
							}
						/>
					)}

					{/* Background toggle is available regardless of overlay
					status -- a standalone title can have a real background
					color just like an overlay one; see VideoTitle.js's
					has-title-background handling for the non-overlay case. */}
					<BackgroundToggleButton
						showBackground={finalShowBackground}
						onChange={(value) =>
							setAttributes({ showBackground: value })
						}
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={__(
						'Data Settings',
						'video-embed-thumbnail-generator'
					)}
					initialOpen={true}
				>
					<ToggleControl
						label={__(
							'Use Post Title',
							'video-embed-thumbnail-generator'
						)}
						help={__(
							"When enabled, this block will display the title of the parent post instead of the video title. Follows the Collection/Loop's Prioritize Attached Post Data setting until you set this directly.",
							'video-embed-thumbnail-generator'
						)}
						checked={effectiveUsePostTitle}
						onChange={(value) =>
							setAttributes({ usePostTitle: value })
						}
					/>
					<ToggleControl
						label={__(
							'Make title a link',
							'video-embed-thumbnail-generator'
						)}
						help={__(
							'When enabled, the title will link to the parent post.',
							'video-embed-thumbnail-generator'
						)}
						checked={linkToPost}
						onChange={(value) =>
							setAttributes({ linkToPost: value })
						}
					/>
				</PanelBody>
				<TitleColorPanel
					attributes={attributes}
					setAttributes={setAttributes}
					resolved={vpContext.resolved}
				/>
			</InspectorControls>
			<VideoTitle
				blockProps={blockProps}
				attributes={attributes}
				postId={postId}
				postType={postType}
				clientId={clientId}
				tagName={Tag}
				textAlign={textAlign}
				isInsideThumbnail={isInsideThumbnail}
				isInsidePlayerOverlay={isInsidePlayerOverlay}
				isOverlay={isOverlay}
				context={context}
				embedlink={embedlink}
				onTitleChange={(newTitle) => setAttributes({ title: newTitle })}
				usePostTitle={usePostTitle}
				linkToPost={linkToPost}
				overlay_title={finalOverlayTitle}
				showBackground={finalShowBackground}
			/>
		</>
	);
}
