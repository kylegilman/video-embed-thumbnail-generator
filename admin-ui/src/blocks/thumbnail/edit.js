/* global videopack_config */
import { useCallback, useState } from '@wordpress/element';
import {
	useBlockProps,
	InnerBlocks,
	BlockContextProvider,
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
} from '@wordpress/block-editor';
import {
	Placeholder,
	Spinner,
	ToolbarButton,
	ToolbarGroup,
	PanelBody,
	SelectControl,
	TextControl,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	fullscreen as lightboxIcon,
	page as postIcon,
	notAllowed as noneIcon,
	video as videoIcon,
	post as parentIcon,
	video as placeholderIcon,
} from '@wordpress/icons';
import { useSelect } from '@wordpress/data';
import VideoThumbnailPreview from '../../components/VideoThumbnailPreview/VideoThumbnailPreview';

import useVideopackContext from '../../hooks/useVideopackContext';
import {
	ASPECT_RATIO_DEFAULT,
	ASPECT_RATIO_CUSTOM_VALUE,
	getAspectRatioSelectOptions,
	getAspectRatioSelectValue,
	isCustomRatioValue,
	parseRatioValue,
	formatRatioValue,
} from '../../utils/aspectRatioOptions';
import './editor.scss';

const ALLOWED_MEDIA_TYPES = [ 'video' ];

// Blocks actually designed to render inside a Thumbnail overlay (each reads
// context['videopack/isInsideThumbnail']). Restricting to this list prevents
// e.g. a Thumbnail (or Player-Container/Player) from being nested inside
// itself via the block inserter, which renders but produces a broken,
// duplicated DOM with no clear error.
const ALLOWED_BLOCKS = [
	'videopack/play-button',
	'videopack/title',
	'videopack/duration',
	'videopack/view-count',
	'videopack/watermark',
	'videopack/share',
	'videopack/download',
];

/**
 * Thumbnail Edit Component
 *
 * @param {Object}   root0               Component props
 * @param {Object}   root0.attributes    Block attributes
 * @param {Function} root0.setAttributes Attribute setter
 * @param {Object}   root0.context       Block context
 * @param {string}   root0.clientId      Block client ID
 * @param {boolean}  root0.isSelected    Whether this block is currently selected
 * @return {Element} Thumbnail edit component
 */
export default function Edit( {
	attributes,
	setAttributes,
	context,
	clientId,
	isSelected,
} ) {
	const vpContext = useVideopackContext( attributes, context );
	const attachmentId = vpContext.resolved.attachmentId;
	const isDiscovering = vpContext.resolved.isDiscovering;
	const { linkTo, id, aspect_ratio: aspectRatio } = attributes;

	const resolvedAspectRatio =
		vpContext.resolved.aspect_ratio || ASPECT_RATIO_DEFAULT;
	const isNativeAspectRatio = 'auto' === resolvedAspectRatio;

	// Picking "Custom…" needs its own bit of UI state, separate from the
	// resolved ratio: seeding the attribute with the current resolved value
	// (e.g. "16/9" when nothing's overridden yet) so the field isn't blank
	// would just re-match that same preset on the very next render --
	// getAspectRatioSelectValue() would call it "16/9" again, never
	// "custom", and the select would snap straight back before the text
	// field ever had a chance to appear. This flag is only ever needed for
	// that in-between moment; once the attribute holds a real non-preset
	// ratio, getAspectRatioSelectValue() already reports "custom" on its
	// own and this flag becomes redundant (harmless to leave true).
	const [ isPickingCustom, setIsPickingCustom ] = useState( false );

	// The picker otherwise reflects the *resolved* ratio (so an unset
	// attribute shows whatever it currently inherits, e.g. the global
	// default, instead of looking like an unrecognized "Custom" value) --
	// picking any preset always writes an explicit override onto this
	// block's own attribute.
	const aspectRatioSelectValue = isPickingCustom
		? ASPECT_RATIO_CUSTOM_VALUE
		: getAspectRatioSelectValue( resolvedAspectRatio );

	const blockProps = useBlockProps( {
		style: isNativeAspectRatio
			? undefined
			: { '--videopack-aspect-ratio': resolvedAspectRatio },
	} );
	const { latestVideoId, hasSelectedInnerBlock, hasInnerBlocks } = useSelect(
		( select ) => {
			const { hasSelectedInnerBlock: hasSelectedInner, getBlockCount } =
				select( 'core/block-editor' );
			const result = {
				latestVideoId: null,
				hasSelectedInnerBlock: hasSelectedInner( clientId, true ),
				hasInnerBlocks: getBlockCount( clientId ) > 0,
			};
			// Only discover a fallback video when we don't already have one —
			// otherwise every grid item in a real gallery preview (each with
			// its own known attachmentId) fires this query pointlessly.
			if (
				! vpContext.resolved.isPreview ||
				vpContext.resolved.attachmentId
			) {
				return result;
			}
			const query = {
				post_type: 'attachment',
				mime_type: 'video',
				per_page: 1,
				_fields: 'id',
			};
			const media = select( 'core' ).getEntityRecords(
				'postType',
				'attachment',
				query
			);
			return { ...result, latestVideoId: media?.[ 0 ]?.id };
		},
		[
			vpContext.resolved.isPreview,
			vpContext.resolved.attachmentId,
			clientId,
		]
	);

	// Only show the thumbnail's own "Add block" appender while this block
	// (or one of its children) is actively selected, so it doesn't clutter
	// the editor whenever some unrelated block elsewhere is selected.
	const showThumbnailAppender = isSelected || hasSelectedInnerBlock;

	const effectiveAttachmentId = attachmentId || latestVideoId;

	// A parent (Collection/Loop's grid items, or a Player-container) already
	// supplying an attachment ID via context means this Thumbnail's source
	// is externally controlled -- offering a manual picker there would let a
	// user "fix" one grid item's video while every other item silently kept
	// using the loop's own query, which is more confusing than helpful.
	// Standalone is the only case where there's no other mechanism at all
	// for choosing which video this block shows.
	const isStandalone = ! context[ 'videopack/attachmentId' ];

	const onSelectVideo = useCallback(
		( media ) => {
			setAttributes( { id: media?.id } );
		},
		[ setAttributes ]
	);

	// Note: resolvedDuotoneClass is now computed internally by VideoThumbnailPreview
	// from the style attribute.

	return (
		<>
			<BlockControls>
				<ToolbarGroup
					label={ __( 'Link To', 'video-embed-thumbnail-generator' ) }
				>
					<ToolbarButton
						icon={ noneIcon }
						label={ __(
							'No Link',
							'video-embed-thumbnail-generator'
						) }
						onClick={ () => setAttributes( { linkTo: 'none' } ) }
						isPressed={ linkTo === 'none' }
					/>
					<ToolbarButton
						icon={ lightboxIcon }
						label={ __(
							'Open in Pop-up Player',
							'video-embed-thumbnail-generator'
						) }
						onClick={ () =>
							setAttributes( { linkTo: 'lightbox' } )
						}
						isPressed={ linkTo === 'lightbox' }
					/>
					<ToolbarButton
						icon={ parentIcon }
						label={ __(
							'Link to Parent Post',
							'video-embed-thumbnail-generator'
						) }
						onClick={ () => setAttributes( { linkTo: 'parent' } ) }
						isPressed={ linkTo === 'parent' }
					/>
					<ToolbarButton
						icon={ videoIcon }
						label={ __(
							'Link to Video File',
							'video-embed-thumbnail-generator'
						) }
						onClick={ () => setAttributes( { linkTo: 'file' } ) }
						isPressed={ linkTo === 'file' }
					/>
					<ToolbarButton
						icon={ postIcon }
						label={ __(
							'Link to Attachment Page',
							'video-embed-thumbnail-generator'
						) }
						onClick={ () => setAttributes( { linkTo: 'post' } ) }
						isPressed={ linkTo === 'post' }
					/>
				</ToolbarGroup>
				{ isStandalone && effectiveAttachmentId && (
					<MediaReplaceFlow
						mediaId={ id || effectiveAttachmentId }
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						accept="video/*"
						onSelect={ onSelectVideo }
					/>
				) }
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'Layout', 'video-embed-thumbnail-generator' ) }
					initialOpen={ true }
				>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __(
							'Aspect Ratio',
							'video-embed-thumbnail-generator'
						) }
						value={ aspectRatioSelectValue }
						onChange={ ( value ) => {
							if ( ASPECT_RATIO_CUSTOM_VALUE === value ) {
								setIsPickingCustom( true );
								// Seed the custom field with whatever ratio is
								// currently in effect (already a custom value
								// if that's why "Custom…" was reachable at
								// all otherwise the resolved preset/default)
								// so switching to Custom doesn't blank it out.
								if (
									! isCustomRatioValue( resolvedAspectRatio )
								) {
									setAttributes( {
										aspect_ratio: ASPECT_RATIO_DEFAULT,
									} );
								}
								return;
							}
							setIsPickingCustom( false );
							setAttributes( { aspect_ratio: value } );
						} }
						options={ getAspectRatioSelectOptions() }
					/>
					{ ASPECT_RATIO_CUSTOM_VALUE === aspectRatioSelectValue &&
						( () => {
							const { width, height } = parseRatioValue(
								isCustomRatioValue( aspectRatio )
									? aspectRatio
									: resolvedAspectRatio
							);
							return (
								<Flex align="flex-end">
									<FlexItem>
										<TextControl
											__nextHasNoMarginBottom
											__next40pxDefaultSize
											type="number"
											min={ 1 }
											label={ __(
												'Width',
												'video-embed-thumbnail-generator'
											) }
											value={ width }
											onChange={ ( value ) =>
												setAttributes( {
													aspect_ratio:
														formatRatioValue(
															value,
															height
														),
												} )
											}
										/>
									</FlexItem>
									<FlexItem>
										<TextControl
											__nextHasNoMarginBottom
											__next40pxDefaultSize
											type="number"
											min={ 1 }
											label={ __(
												'Height',
												'video-embed-thumbnail-generator'
											) }
											value={ height }
											onChange={ ( value ) =>
												setAttributes( {
													aspect_ratio:
														formatRatioValue(
															width,
															value
														),
												} )
											}
										/>
									</FlexItem>
								</Flex>
							);
						} )() }
				</PanelBody>
			</InspectorControls>
			<div
				{ ...blockProps }
				className={
					( blockProps.className || '' ) +
					' videopack-thumbnail-block' +
					( isNativeAspectRatio ? ' has-native-aspect-ratio' : '' )
				}
			>
				{ ( () => {
					if ( isDiscovering && ! attachmentId ) {
						return (
							<div className="videopack-thumbnail-discovery-loading">
								<Spinner />
								<p>
									{ __(
										'Searching for attached video…',
										'video-embed-thumbnail-generator'
									) }
								</p>
							</div>
						);
					}

					// A genuinely empty block (no source resolved anywhere,
					// and nothing nested in it yet) gets the "helpful nudge"
					// placeholder instead of the real preview + InnerBlocks --
					// once there's a source OR real child blocks, this always
					// falls through to rendering InnerBlocks exactly once
					// below (a block that hid its InnerBlocks behind a
					// `display: none` duplicate whenever `!attachmentId`, so
					// Gutenberg's own "must always render your declared
					// InnerBlocks" requirement was still technically met, used
					// to make any nested block permanently unselectable the
					// moment this Thumbnail had no resolvable source -- the
					// common case for a fresh standalone block before a
					// source is picked).
					if (
						! attachmentId &&
						! vpContext.resolved.isPreview &&
						! hasInnerBlocks
					) {
						if ( isStandalone ) {
							return (
								<MediaPlaceholder
									icon={ placeholderIcon }
									labels={ {
										title: __(
											'Video Thumbnail',
											'video-embed-thumbnail-generator'
										),
										instructions: __(
											'Select the video this thumbnail should represent.',
											'video-embed-thumbnail-generator'
										),
									} }
									onSelect={ onSelectVideo }
									accept="video/*"
									allowedTypes={ ALLOWED_MEDIA_TYPES }
								/>
							);
						}
						return (
							<Placeholder
								icon={ placeholderIcon }
								label={ __(
									'Video Thumbnail',
									'video-embed-thumbnail-generator'
								) }
								instructions={ __(
									'This block displays a video thumbnail. Place it inside a Videopack Collection or a post with attached videos.',
									'video-embed-thumbnail-generator'
								) }
							/>
						);
					}

					return (
						<VideoThumbnailPreview
							postId={ effectiveAttachmentId }
							video={
								vpContext.resolved.isPreview &&
								! effectiveAttachmentId
									? {
											poster_url:
												videopack_config.url +
												'/src/images/Adobestock_469037984_thumb1.jpg',
									  }
									: {}
							}
							linkTo={ linkTo }
							context={ context }
							attributes={ attributes }
							className="videopack-thumbnail-preview"
							resolvedDuotoneClass={ undefined }
							clientId={ clientId }
						>
							<BlockContextProvider
								value={ {
									...context,
									'videopack/isInsideThumbnail': true,
									'videopack/attachmentId': attachmentId,
									'videopack/downloadlink': false,
									'videopack/embedcode': false,
								} }
							>
								<InnerBlocks
									templateLock={ false }
									allowedBlocks={ ALLOWED_BLOCKS }
									renderAppender={
										showThumbnailAppender
											? InnerBlocks.ButtonBlockAppender
											: false
									}
								/>
							</BlockContextProvider>
						</VideoThumbnailPreview>
					);
				} )() }
			</div>
		</>
	);
}
