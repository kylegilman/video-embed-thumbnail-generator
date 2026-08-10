/* global videopack_config */
import {
	InspectorControls,
	BlockControls,
	useBlockProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import VideopackContextBridge from '../../components/VideopackContextBridge';
import { useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo, useCallback } from '@wordpress/element';
import { Spinner, ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { getSettings } from '../../api/settings';
import useVideoQuery from '../../hooks/useVideoQuery';
import CollectionInspectorControls from '../../components/InspectorControls/CollectionInspectorControls';
import useVideopackContext from '../../hooks/useVideopackContext';
import { VideopackProvider } from '../../utils/VideopackContext';
import { resolveGalleryVideoSelection } from '../../utils/galleryVideoSelection';
import {
	getGridTemplate,
	getListTemplate,
	getFeedTemplate,
} from '../../utils/templates';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'videopack/loop', 'videopack/pagination' ];

// Collection is a valid theme-context root (Overlays.scss) — nested blocks
// inherit the skin class/CSS vars from here rather than each needing their own.
const COLLECTION_CONTEXT_OPTS = {
	excludeHoverTrigger: true,
	classKeys: [ 'skin' ],
};

export default function Edit( {
	attributes,
	setAttributes,
	clientId,
	context,
	isSelected,
} ) {
	const [ options, setOptions ] = useState();
	const {
		layout = 'grid',
		columns = 3,
		currentPage = 1,
		gallery_per_page,
		isEditingAllPages = false,
		variation,
	} = attributes;

	// Resolve Effective Values for design and pagination (these follow global settings)
	const vpContext = useVideopackContext(
		attributes,
		context,
		COLLECTION_CONTEXT_OPTS
	);
	const {
		resolved: effectiveValues,
		style: contextStyle,
		classes: collectionClasses,
	} = vpContext;

	const { hasPaginationBlock, isNewlyInserted, hasSelectedInnerBlock } =
		useSelect(
			( select ) => {
				const {
					getBlocks,
					getBlock,
					hasSelectedInnerBlock: hasSelectedInner,
				} = select( 'core/block-editor' );
				const blocks = getBlocks( clientId ) || [];
				const block = getBlock( clientId );
				return {
					hasPaginationBlock: blocks.some(
						( b ) => b.name === 'videopack/pagination'
					),
					isNewlyInserted:
						block &&
						! block.attributes.gallery_id &&
						! block.attributes.gallery_category &&
						! block.attributes.gallery_tag &&
						! block.attributes.gallery_include,
					// Shallow (direct children only) — Collection's own appender
					// adds a sibling to Loop/Pagination at the top level, so it
					// should only show while working with that top-level
					// structure, not e.g. while deep inside editing a
					// thumbnail's title text. A deep check (like Thumbnail/Loop
					// use for their own, much narrower trees) would leave it
					// visible almost continuously, since nearly all editing
					// happens somewhere inside the collection's tree.
					hasSelectedInnerBlock: hasSelectedInner( clientId ),
				};
			},
			[ clientId ]
		);

	// Only show Collection's own "Add block" appender while this block (or
	// a direct child, Loop/Pagination) is actively selected.
	const showCollectionAppender = isSelected || hasSelectedInnerBlock;

	const previewPostId = useSelect(
		// core/editor is only registered inside a real post-editing screen —
		// undefined in other contexts this component can be previewed in.
		( select ) => select( 'core/editor' )?.getCurrentPostId?.() ?? null,
		[]
	);

	// Signals the Loop child (which renders the visible grid via its own
	// useVideoQuery call) to refetch when a video is added but no attribute
	// actually changes — see handleSelectVideos below. Passed down through
	// the context bridge as videopack/refreshToken; a plain attribute touch
	// doesn't work here since useVideoQuery's fetch effect depends on
	// individual primitive fields, not object identity, so re-setting a
	// value to itself is a no-op as far as its dependency array is concerned.
	const [ refreshToken, setRefreshToken ] = useState( 0 );

	/**
	 * Handles video(s) selected/uploaded via the "Add Video" toolbar button.
	 * Mirrors the Loop block's own control (same shared decision logic) so
	 * it doesn't matter which of the two a user reaches for.
	 *
	 * @param {Object|Array} media Selected attachment object(s).
	 */
	const handleSelectVideos = useCallback(
		( media ) => {
			const result = resolveGalleryVideoSelection( {
				media,
				gallerySource: attributes.gallery_source,
				galleryInclude: attributes.gallery_include,
				previewPostId,
			} );

			if ( result.type === 'update' ) {
				setAttributes( result.updates );
			} else if ( result.type === 'no-change' ) {
				// A freshly uploaded file is already attached to this post,
				// so no attribute changes — just force the Loop child to refetch.
				setRefreshToken( ( prev ) => prev + 1 );
			}
		},
		[
			attributes.gallery_source,
			attributes.gallery_include,
			previewPostId,
			setAttributes,
		]
	);

	/**
	 * Opens the media frame for the "Add Video" toolbar button. Uses the raw
	 * wp.media() API directly rather than the <MediaUpload> React component
	 * — that component's componentWillUnmount calls frame.remove() whenever
	 * it unmounts (e.g. when this block is deselected right after the modal
	 * closes), which can race with an in-progress React render and crash
	 * with "Attempted to synchronously unmount a root while React was
	 * already rendering."
	 */
	const openAddVideoFrame = useCallback( () => {
		const frame = window.wp.media( {
			title: __( 'Add Video', 'video-embed-thumbnail-generator' ),
			button: {
				text: __( 'Add', 'video-embed-thumbnail-generator' ),
			},
			multiple: true,
			library: { type: 'video' },
		} );

		frame.on( 'select', () => {
			handleSelectVideos( frame.state().get( 'selection' ).toJSON() );
		} );

		frame.open();
	}, [ handleSelectVideos ] );

	const queryParams = useMemo( () => {
		let galleryPerPage = -1;
		if ( effectiveValues.isPreview ) {
			galleryPerPage = 2;
		} else if ( hasPaginationBlock ) {
			galleryPerPage =
				gallery_per_page || effectiveValues.gallery_per_page;
		} else if ( effectiveValues.enable_collection_video_limit ) {
			galleryPerPage =
				effectiveValues.collection_video_limit ||
				effectiveValues.gallery_per_page;
		}

		return {
			...attributes,
			gallery_pagination: hasPaginationBlock,
			gallery_per_page: galleryPerPage,
			page_number: currentPage || 1,
		};
	}, [
		attributes,
		hasPaginationBlock,
		effectiveValues.isPreview,
		effectiveValues.gallery_per_page,
		effectiveValues.enable_collection_video_limit,
		effectiveValues.collection_video_limit,
		gallery_per_page,
		currentPage,
	] );
	// We fetch query data to power the live preview template and pagination info
	const queryData = useVideoQuery( queryParams, previewPostId, refreshToken );

	useEffect( () => {
		getSettings().then( ( response ) => {
			setOptions( response );
		} );
	}, [] );

	// Give this instance a real, persisted identity the first time it's
	// saved — the server-side AJAX pagination endpoint (Blocks::
	// locate_collection_inner_blocks()) relies on this to re-locate this
	// exact instance's saved content later, instead of trusting a client-
	// resubmitted block tree. Same pattern WordPress core uses for
	// core/query's queryId: generate once, persist, never regenerate.
	useEffect( () => {
		if ( ! attributes.collectionId ) {
			setAttributes( {
				collectionId:
					'vp_' +
					Date.now().toString( 36 ) +
					Math.random().toString( 36 ).slice( 2, 8 ),
			} );
		}
		// Deliberately runs only once per mount — collectionId must not be
		// regenerated on subsequent re-renders once set.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// We no longer hydrate design attributes from options here to avoid bloat.
	// The VideopackContextBridge and useVideopackContext hook handle inheritance
	// dynamically, so we only save attributes that are explicitly changed.

	// Resolve blockGap value for use in internal grid spacing
	const resolvedBlockGap = useMemo( () => {
		const gap = attributes.style?.spacing?.blockGap;
		if ( ! gap ) {
			return undefined;
		}

		// Handle Gutenberg preset variables: var:preset|spacing|X -> var(--wp--preset--spacing--X)
		if (
			typeof gap === 'string' &&
			gap.startsWith( 'var:preset|spacing|' )
		) {
			return (
				gap.replace(
					'var:preset|spacing|',
					'var(--wp--preset--spacing--'
				) + ')'
			);
		}

		return gap;
	}, [ attributes.style?.spacing?.blockGap ] );

	// Dynamic Template based on global settings (only used for new blocks)
	const dynamicTemplate = useMemo( () => {
		if ( layout === 'list' ) {
			return getListTemplate( options );
		}
		// Base block (no variation) defaults to Feed template for grid layout
		if ( layout === 'grid' && ! variation ) {
			return getFeedTemplate( options );
		}
		return getGridTemplate( options );
	}, [ layout, variation, options ] );

	const blockProps = useBlockProps( {
		style: {
			...contextStyle,
			'--videopack-collection-columns': columns,
			'--videopack-collection-gap': resolvedBlockGap,
			containerType: 'inline-size',
		},
		className: [
			'videopack-collection',
			'videopack-wrapper',
			`layout-${ layout }`,
			`columns-${ columns }`,
			// If no explicit align is set, apply the effective (global) align class
			! attributes.align && effectiveValues.align
				? `align${ effectiveValues.align }`
				: '',
			effectiveValues.isPreview ? 'is-preview' : '',
			collectionClasses,
		]
			.filter( Boolean )
			.join( ' ' ),
	} );

	const videos = useMemo( () => {
		if ( queryData.videoResults && queryData.videoResults.length > 0 ) {
			return queryData.videoResults;
		}

		if ( effectiveValues.isPreview ) {
			return [
				{
					attachment_id: 10001,
					title: 'Sample Video 1',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_469037984_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_469037984.mp4',
					player_vars: {
						sources: [
							{
								src:
									videopack_config.url +
									'/src/images/Adobestock_469037984.mp4',
							},
						],
					},
				},
				{
					attachment_id: 10002,
					title: 'Sample Video 2',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_287460179_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_287460179.mp4',
					player_vars: {
						sources: [
							{
								src:
									videopack_config.url +
									'/src/images/Adobestock_287460179.mp4',
							},
						],
					},
				},
				{
					attachment_id: 10003,
					title: 'Sample Video 3',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_469037984_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_469037984.mp4',
				},
				{
					attachment_id: 10004,
					title: 'Sample Video 4',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_287460179_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_287460179.mp4',
				},
				{
					attachment_id: 10005,
					title: 'Sample Video 5',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_469037984_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_469037984.mp4',
				},
				{
					attachment_id: 10006,
					title: 'Sample Video 6',
					poster_url:
						videopack_config.url +
						'/src/images/Adobestock_287460179_thumb1.jpg',
					url:
						videopack_config.url +
						'/src/images/Adobestock_287460179.mp4',
				},
			];
		}

		return [];
	}, [ queryData.videoResults, effectiveValues.isPreview ] );

	// The 'videos' array is used for live preview only and should not be persisted
	// to block attributes to avoid bloat. The PHP renderer fetches these dynamically.

	const videopackContextValue = {
		gallery_pagination: hasPaginationBlock,
		gallery_per_page: effectiveValues.gallery_per_page,
		totalPages: queryData.maxNumPages,
		currentPage,
		videos,
	};

	// Lets the Loop child's own "Add Video" button (when the upload is already
	// attached to this post and no attribute changes) trigger a refetch here
	// too — Collection's own query is what actually supplies `videos` above
	// in the common nested case, and context can't flow child-to-parent, so
	// this callback is how Loop reaches back up to it.
	const refreshVideos = useCallback(
		() => setRefreshToken( ( prev ) => prev + 1 ),
		[]
	);

	const bridgeOverrides = useMemo(
		() => ( {
			'videopack/gallery_pagination': hasPaginationBlock,
			'videopack/totalPages': queryData.maxNumPages,
			'videopack/videos': videos,
			'videopack/refreshVideos': refreshVideos,
		} ),
		[ hasPaginationBlock, queryData.maxNumPages, videos, refreshVideos ]
	);

	// If options haven't loaded yet for a newly inserted block, don't render InnerBlocks
	// to prevent the wrong template from being applied.
	// We skip this check for previews to ensure they render immediately.
	if ( ! options && isNewlyInserted && ! effectiveValues.isPreview ) {
		return (
			<div
				{ ...blockProps }
				className={
					( blockProps.className || '' ) + ' ' + collectionClasses
				}
			>
				<div className="videopack-collection-placeholder">
					<Spinner />
				</div>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<CollectionInspectorControls
					clientId={ clientId }
					attributes={ attributes }
					setAttributes={ setAttributes }
					queryData={ queryData }
					options={ options }
					hasPaginationBlock={ hasPaginationBlock }
					isEditingAllPages={ isEditingAllPages }
				/>
			</InspectorControls>

			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ plus }
						label={ __(
							'Add Video',
							'video-embed-thumbnail-generator'
						) }
						onClick={ openAddVideoFrame }
					/>
				</ToolbarGroup>
			</BlockControls>

			<div { ...blockProps }>
				<VideopackContextBridge
					attributes={ attributes }
					context={ context }
					overrides={ bridgeOverrides }
				>
					<VideopackProvider value={ videopackContextValue }>
						<InnerBlocks
							allowedBlocks={ ALLOWED_BLOCKS }
							template={ dynamicTemplate }
							renderAppender={
								showCollectionAppender
									? InnerBlocks.ButtonBlockAppender
									: false
							}
						/>
					</VideopackProvider>
				</VideopackContextBridge>
			</div>
		</>
	);
}
