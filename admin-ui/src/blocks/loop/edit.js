import {
	useBlockProps,
	BlockContextProvider,
	InspectorControls,
	BlockControls,
	MediaPlaceholder,
} from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Spinner, ToolbarGroup, ToolbarButton } from '@wordpress/components';
import {
	useMemo,
	useState,
	useEffect,
	useCallback,
	useRef,
	lazy,
	Suspense,
} from '@wordpress/element';
import { plus } from '@wordpress/icons';
import useVideoQuery from '../../hooks/useVideoQuery';
import useVideopackContext from '../../hooks/useVideopackContext';
import { useVideopackContext as useVideopackData } from '../../utils/VideopackContext';
import { isTrue } from '../../utils/context';
import { getSettings } from '../../api/settings';
import { getVideoGallery } from '../../api/gallery';
import { resolveGalleryVideoSelection } from '../../utils/galleryVideoSelection';
import CollectionInspectorControls from '../../components/InspectorControls/CollectionInspectorControls';
import LoopItemPreview from './LoopItemPreview';
import buildItemContext from './buildItemContext';
import './editor.scss';

// @dnd-kit (and the drag/reorder chrome it powers) is only ever functional
// in the real, editable block editor — never in a disabled preview (Settings
// page, Classic Editor, Attachment Details), where useBlockPreview makes
// everything inert anyway. Lazy-loading it here means webpack splits it into
// its own chunk that those preview-only bundles never request, since they
// always render the static grid branch below instead.
const SortableGrid = lazy( () =>
	import( /* webpackChunkName: "loop-sortable-grid" */ './SortableGrid' )
);

/**
 * @param {Object}   props               Component props.
 * @param {Object}   props.context       Block context.
 * @param {string}   props.clientId      Block client ID.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Block attributes setter.
 * @param {boolean}  props.isSelected    Whether the block is currently selected.
 * @return {Element}              The rendered component.
 */
export default function Edit( {
	attributes,
	setAttributes,
	context,
	clientId,
	isSelected,
} ) {
	const vpContext = useVideopackContext( attributes, context, {
		excludeHoverTrigger: true,
	} );
	const vpData = useVideopackData();

	const [ options, setOptions ] = useState( {} );
	// Which grid item currently shows real, editable InnerBlocks — keyed by
	// video/attachment ID (not array index) so it survives reorders/add/remove,
	// matching core/post-template's activeBlockContextId pattern.
	const [ activeVideoKey, setActiveVideoKey ] = useState( null );
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );
	const prevInheritedDuotone = useRef();

	const {
		effectiveDuotone,
		inheritedDuotone,
		previewPostId,
		isSaving,
		isAutosaving,
		parentAttributes,
		hasPaginationBlock,
		isEditingAllPages,
		parentClientId,
		hasSelectedInnerBlock,
	} = useSelect(
		( select ) => {
			const {
				getBlocks,
				getBlockAttributes,
				getBlockRootClientId,
				hasSelectedInnerBlock: hasSelectedInner,
			} = select( 'core/block-editor' );
			// core/editor is only registered inside a real post-editing screen
			// (Gutenberg's own editor) — it's undefined in other contexts this
			// component can be previewed in (e.g. a real block preview mounted
			// outside a post editor), so every selector here must be optional.
			const editorStore = select( 'core/editor' );
			const isSavingPost = editorStore?.isSavingPost;
			const isAutosavingPost = editorStore?.isAutosavingPost;
			const getCurrentPostId = editorStore?.getCurrentPostId;

			const parentId = getBlockRootClientId( clientId );
			const blocks = getBlocks( clientId ) || [];

			const parentAttrs = parentId ? getBlockAttributes( parentId ) : {};

			const parentBlocks = parentId ? getBlocks( parentId ) : [];
			const hasPagination = parentBlocks.some(
				( b ) => b.name === 'videopack/pagination'
			);

			// Helper to find a block by name recursively in the inner blocks tree
			const findBlockRecursive = ( blockList, names ) => {
				const nameArray = Array.isArray( names ) ? names : [ names ];
				for ( const block of blockList ) {
					if ( nameArray.includes( block.name ) ) {
						return block;
					}
					if ( block.innerBlocks && block.innerBlocks.length > 0 ) {
						const found = findBlockRecursive(
							block.innerBlocks,
							nameArray
						);
						if ( found ) {
							return found;
						}
					}
				}
				return null;
			};

			const childBlocks = findBlockRecursive( blocks, [
				'videopack/thumbnail',
				'videopack/player-container',
			] );

			const presetDuotone =
				attributes?.style?.color?.duotone ||
				attributes?.duotone ||
				parentAttrs?.duotone ||
				parentAttrs?.style?.color?.duotone ||
				childBlocks?.attributes?.duotone ||
				childBlocks?.attributes?.style?.color?.duotone;

			const isEditingAll = !! parentAttrs.isEditingAllPages;

			return {
				effectiveDuotone: presetDuotone,
				inheritedDuotone:
					parentAttrs?.duotone ||
					parentAttrs?.style?.color?.duotone ||
					childBlocks?.attributes?.style?.color?.duotone ||
					childBlocks?.attributes?.duotone,
				previewPostId: getCurrentPostId ? getCurrentPostId() : null,
				isSaving: isSavingPost ? isSavingPost() : false,
				isAutosaving: isAutosavingPost ? isAutosavingPost() : false,
				parentAttributes: parentAttrs,
				hasPaginationBlock: hasPagination,
				isEditingAllPages: isEditingAll,
				parentClientId: parentId,
				hasSelectedInnerBlock: hasSelectedInner( clientId ),
			};
		},
		[ clientId, attributes?.duotone, attributes?.style?.color?.duotone ]
	);

	// Only show Loop's own "Add block" appender while this block (or one of
	// its children) is actively selected, so it doesn't clutter the editor
	// whenever some unrelated block elsewhere on the page is selected.
	const showLoopAppender = isSelected || hasSelectedInnerBlock;

	// Drag-and-drop reordering (see SortableGrid.js) can't safely persist
	// gallery_source/gallery_include the instant a drag ends — it first has
	// to fetch the collection's full, unpaginated ID list so freezing into
	// manual mode doesn't silently drop videos that aren't on the current
	// page. That fetch is fast but not instant, so this flag lets the
	// Inspector's Source/Order-by fields show "Manual"/"Manually Sorted"
	// right away — purely a display override (see inspectorAttributes
	// below), never written to the real block attributes — so the label
	// doesn't lag a beat behind the reorder the user just saw happen.
	const [ isReorderPending, setIsReorderPending ] = useState( false );

	useEffect( () => {
		getSettings().then( ( response ) => {
			setOptions( response );
		} );
	}, [] );

	// We get query-related attributes from the parent collection block via context.
	const queryAttributes = useMemo(
		() => ( {
			gallery_source: context[ 'videopack/gallery_source' ],
			gallery_id: context[ 'videopack/gallery_id' ],
			gallery_category: context[ 'videopack/gallery_category' ],
			gallery_tag: context[ 'videopack/gallery_tag' ],
			gallery_orderby: context[ 'videopack/gallery_orderby' ],
			gallery_order: context[ 'videopack/gallery_order' ],
			gallery_include: context[ 'videopack/gallery_include' ],
			gallery_exclude: context[ 'videopack/gallery_exclude' ],
			gallery_pagination: isEditingAllPages
				? false
				: vpContext.resolved.gallery_pagination,
			gallery_per_page: isEditingAllPages
				? -1
				: vpContext.resolved.gallery_per_page,
			enable_collection_video_limit:
				vpContext.resolved.enable_collection_video_limit,
			collection_video_limit: vpContext.resolved.collection_video_limit,
			page_number: isEditingAllPages
				? 1
				: vpContext.currentPage ||
				  context[ 'videopack/currentPage' ] ||
				  1,
			prioritizePostData: vpContext.resolved.prioritizePostData,
		} ),
		[
			context,
			isEditingAllPages,
			vpContext.resolved,
			vpContext.currentPage,
		]
	);

	// Only used as a fallback when this Loop instance runs its own query
	// below (i.e. vpData.videos is empty) — in the common case, Collection's
	// own query is what actually supplies the rendered videos, so refreshing
	// after an upload goes through context['videopack/refreshVideos'] instead
	// (see handleSelectVideos).
	const [ refreshToken, setRefreshToken ] = useState( 0 );

	const queryData = useVideoQuery(
		vpData.videos && vpData.videos.length > 0 ? null : queryAttributes,
		previewPostId,
		refreshToken
	);
	const {
		videoResults: queryVideos,
		isResolving: isResolvingQuery,
		totalResults,
		maxNumPages,
	} = queryData;
	const parentVideos = vpData.videos || context[ 'videopack/videos' ];
	const videos =
		parentVideos && parentVideos.length > 0 ? parentVideos : queryVideos;
	// Videos load asynchronously, so default to the first one lazily at render
	// time rather than in the useState initializer.
	const effectiveActiveKey =
		activeVideoKey ??
		( videos?.[ 0 ] && ( videos[ 0 ].attachment_id || videos[ 0 ].id ) );

	const totalResultsCount =
		parentVideos && parentVideos.length > 0
			? parentVideos.length
			: totalResults;
	const totalPagesCount =
		parentVideos && parentVideos.length > 0 ? 1 : maxNumPages;
	const templateBlocks = useSelect(
		( select ) =>
			clientId ? select( 'core/block-editor' ).getBlocks( clientId ) : [],
		[ clientId ]
	);

	const previewVideos = queryVideos;
	const isPreviewResolving = isResolvingQuery;

	const layout = context[ 'videopack/layout' ] || 'grid';
	const columns = context[ 'videopack/columns' ] || 3;

	const presetDuotoneClass = useMemo( () => {
		if ( typeof effectiveDuotone === 'string' ) {
			return `wp-duotone-${ effectiveDuotone.replace(
				'var:preset|duotone|',
				''
			) }`;
		}
		return '';
	}, [ effectiveDuotone ] );

	const blockProps = useBlockProps( {
		className: `videopack-video-loop layout-${ layout } columns-${ columns } ${
			isPreviewResolving && ! isSaving && ! isAutosaving
				? 'has-loading-state'
				: ''
		} ${ isEditingAllPages ? 'is-editing-all-pages' : '' }`,
	} );

	// Find the duotone class that Gutenberg has applied to our block props.
	const duotoneClass = useMemo( () => {
		const classes = blockProps.className?.split( ' ' ) || [];
		return classes.find( ( c ) => c.startsWith( 'wp-duotone-' ) );
	}, [ blockProps.className ] );

	const computedStyle = {};
	if ( columns && layout === 'grid' ) {
		computedStyle[ '--videopack-collection-columns' ] = columns;
	}
	computedStyle.containerType = 'inline-size';

	// Universal Solution: Fetch the actual attachment records to hydrate the store.
	// This ensures that BlockEdit and any inner blocks have the 'real' data they need.
	const videoIds = useMemo( () => {
		return ( previewVideos || [] )
			.map( ( v ) => v.attachment_id )
			.filter( Boolean );
	}, [ previewVideos ] );

	useSelect(
		( select ) => {
			if ( ! videoIds.length ) {
				return null;
			}
			return select( 'core' ).getEntityRecords(
				'postType',
				'attachment',
				{
					include: videoIds,
					per_page: -1,
				}
			);
		},
		[ videoIds ]
	);

	// Synchronize child/parent duotone attributes to the Loop block itself
	// so that Gutenberg applies the necessary classes and SVG filters to the Loop wrapper.
	useEffect( () => {
		const loopDuotone =
			attributes.style?.color?.duotone || attributes.duotone;

		// 1. If we have a new inherited duotone, adopt it.
		if (
			inheritedDuotone &&
			JSON.stringify( inheritedDuotone ) !== JSON.stringify( loopDuotone )
		) {
			if ( Array.isArray( inheritedDuotone ) ) {
				setAttributes( {
					style: {
						...attributes.style,
						color: {
							...attributes.style?.color,
							duotone: inheritedDuotone,
						},
					},
				} );
			} else {
				setAttributes( { duotone: inheritedDuotone } );
			}
		}

		// 2. If the inheritance was JUST cleared, and our Loop still has that exact value, clear it.
		// This prevents "sticky" attributes while allowing local Loop-level filters to persist.
		const wasInherited =
			prevInheritedDuotone.current &&
			JSON.stringify( loopDuotone ) ===
				JSON.stringify( prevInheritedDuotone.current );
		if ( ! inheritedDuotone && wasInherited ) {
			setAttributes( {
				duotone: undefined,
				style: attributes.style
					? {
							...attributes.style,
							color: attributes.style.color
								? {
										...attributes.style.color,
										duotone: undefined,
								  }
								: undefined,
					  }
					: undefined,
			} );
		}

		// Update our tracker for the next render
		prevInheritedDuotone.current = inheritedDuotone;
	}, [
		inheritedDuotone,
		attributes.duotone,
		attributes.style,
		setAttributes,
	] );

	// Pass-through: resolve the duotone class by checking local settings then inherited ones.
	const resolvedDuotoneClass = useMemo( () => {
		return duotoneClass || presetDuotoneClass || '';
	}, [ duotoneClass, presetDuotoneClass ] );

	// Clears once the real persisted update (see SortableGrid.js's
	// handleDragEnd) actually lands — from that point the Inspector is
	// showing the real attributes anyway, so the override below becomes a
	// no-op; this just stops forcing it once it's no longer needed.
	useEffect( () => {
		if ( parentAttributes.gallery_source === 'manual' ) {
			setIsReorderPending( false );
		}
	}, [ parentAttributes.gallery_source ] );

	// Purely a display override for CollectionInspectorControls below — never
	// passed to setAttributes, so it can't affect what actually gets saved.
	// gallery_include only needs to be non-empty for "Manually Sorted" to
	// appear as an available option (see CollectionQuerySettings.js); its
	// actual value here is never read as real IDs anywhere.
	const inspectorAttributes = isReorderPending
		? {
				...parentAttributes,
				gallery_source: 'manual',
				gallery_orderby: 'include',
				gallery_include: parentAttributes.gallery_include || 'pending',
		  }
		: parentAttributes;

	const handleRemoveItem = useCallback(
		( idToRemove ) => {
			const currentExclude = queryAttributes.gallery_exclude
				? queryAttributes.gallery_exclude
						.split( ',' )
						.map( ( id ) => id.trim() )
				: [];
			if ( ! currentExclude.includes( idToRemove.toString() ) ) {
				currentExclude.push( idToRemove.toString() );
			}

			const currentInclude = queryAttributes.gallery_include
				? queryAttributes.gallery_include
						.split( ',' )
						.map( ( id ) => id.trim() )
				: [];
			const newInclude = currentInclude
				.filter( ( id ) => id !== idToRemove.toString() )
				.join( ',' );

			updateBlockAttributes( parentClientId, {
				gallery_exclude: currentExclude.join( ',' ),
				gallery_include: newInclude,
			} );
		},
		[ queryAttributes, parentClientId, updateBlockAttributes ]
	);

	const handleEditItem = useCallback(
		async ( oldId ) => {
			let currentInclude = queryAttributes.gallery_include
				? queryAttributes.gallery_include
						.split( ',' )
						.map( ( id ) => id.trim() )
				: [];

			if ( queryAttributes.gallery_source !== 'manual' ) {
				try {
					const response = await getVideoGallery( {
						...queryAttributes,
						gallery_id: queryAttributes.gallery_id || previewPostId,
						gallery_per_page: -1,
						page_number: undefined,
						gallery_pagination: false,
						skip_html: true,
					} );
					currentInclude = ( response.videos || [] ).map( ( v ) =>
						v.attachment_id.toString()
					);
				} catch {
					currentInclude = ( videos || [] ).map( ( v ) =>
						v.attachment_id.toString()
					);
				}
			}

			const frame = window.wp.media( {
				title: __( 'Edit Video', 'video-embed-thumbnail-generator' ),
				button: {
					text: __( 'Update', 'video-embed-thumbnail-generator' ),
				},
				multiple: false,
				library: { type: 'video' },
			} );

			frame.on( 'open', () => {
				const selection = frame.state().get( 'selection' );
				const attachment = window.wp.media.attachment( oldId );
				attachment.fetch().done( () => selection.add( attachment ) );
			} );

			frame.on( 'select', () => {
				const newAttachment = frame
					.state()
					.get( 'selection' )
					.first()
					.toJSON();

				const newInclude = currentInclude
					.map( ( id ) =>
						parseInt( id, 10 ) === oldId
							? newAttachment.id.toString()
							: id
					)
					.join( ',' );

				updateBlockAttributes( parentClientId, {
					gallery_include: newInclude,
					gallery_orderby: 'include',
					gallery_source: 'manual',
				} );
			} );

			frame.open();
		},
		[
			queryAttributes,
			videos,
			parentClientId,
			updateBlockAttributes,
			previewPostId,
		]
	);

	const handleAddVideo = useCallback( async () => {
		let currentInclude = queryAttributes.gallery_include
			? queryAttributes.gallery_include
					.split( ',' )
					.map( ( id ) => id.trim() )
			: [];

		// If we're not already in manual mode, we need to fetch ALL current IDs
		// from the server to ensure we don't lose items on other pages when freezing.
		if ( queryAttributes.gallery_source !== 'manual' ) {
			try {
				const response = await getVideoGallery( {
					...queryAttributes,
					gallery_id: queryAttributes.gallery_id || previewPostId,
					gallery_per_page: -1, // Get all IDs
					page_number: undefined, // Remove page limit
					gallery_pagination: false,
					skip_html: true,
				} );
				currentInclude = ( response.videos || [] ).map( ( v ) =>
					v.attachment_id.toString()
				);
			} catch {
				// Fallback to current page results if fetch fails
				currentInclude = ( videos || [] ).map( ( v ) =>
					v.attachment_id.toString()
				);
			}
		} else {
			// Already manual
		}

		const frame = window.wp.media( {
			title: __(
				'Add Videos to Collection',
				'video-embed-thumbnail-generator'
			),
			button: {
				text: __(
					'Add to Collection',
					'video-embed-thumbnail-generator'
				),
			},
			multiple: 'add',
			library: { type: 'video' },
		} );

		frame.on( 'select', () => {
			const selection = frame.state().get( 'selection' );
			const newIds = selection.map( ( attachment ) =>
				attachment.id.toString()
			);

			const combinedInclude = [
				...new Set( [ ...currentInclude, ...newIds ] ),
			].join( ',' );

			updateBlockAttributes( parentClientId, {
				gallery_include: combinedInclude,
				gallery_source: 'manual',
				gallery_orderby: 'include',
			} );
		} );

		frame.open();
	}, [
		queryAttributes,
		videos,
		parentClientId,
		updateBlockAttributes,
		previewPostId,
	] );

	/**
	 * Handles video(s) selected/uploaded via the "Add Video" toolbar button
	 * or the empty-state placeholder. See resolveGalleryVideoSelection for
	 * the shared decision logic (also used by the Collection block's own
	 * matching control).
	 *
	 * @param {Object|Array} media Selected attachment object(s).
	 */
	const handleSelectVideos = useCallback(
		( media ) => {
			const result = resolveGalleryVideoSelection( {
				media,
				gallerySource: queryAttributes.gallery_source,
				galleryInclude: queryAttributes.gallery_include,
				previewPostId,
			} );

			if ( result.type === 'update' ) {
				updateBlockAttributes( parentClientId, result.updates );
			} else if ( result.type === 'no-change' ) {
				// A freshly uploaded file is already attached to this post,
				// so no attribute changes. Refresh this instance's own query
				// (used when it's actually running one) and, since Collection's
				// query is what supplies the rendered videos in the common
				// case, ask it to refetch too.
				setRefreshToken( ( prev ) => prev + 1 );
				context[ 'videopack/refreshVideos' ]?.();
			}
		},
		[
			queryAttributes,
			previewPostId,
			parentClientId,
			updateBlockAttributes,
			context,
		]
	);

	/**
	 * Opens the media frame for the "Add Video" toolbar button. Uses the raw
	 * wp.media() API directly (like handleAddVideo/handleEditItem above)
	 * rather than the <MediaUpload> React component — that component's
	 * componentWillUnmount calls frame.remove() whenever it unmounts (e.g.
	 * when this block is deselected right after the modal closes), which can
	 * race with an in-progress React render and crash with "Attempted to
	 * synchronously unmount a root while React was already rendering."
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

	return (
		<>
			<InspectorControls>
				<CollectionInspectorControls
					clientId={ parentClientId }
					attributes={ inspectorAttributes }
					setAttributes={ ( newAttrs ) =>
						updateBlockAttributes( parentClientId, newAttrs )
					}
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

			<figure { ...blockProps } style={ computedStyle }>
				{ presetDuotoneClass && (
					<style>
						{ `
							.${ presetDuotoneClass } .vjs-poster,
							.${ presetDuotoneClass } .vjs-poster img,
							.${ presetDuotoneClass } .mejs-poster,
							.${ presetDuotoneClass } .mejs-poster img,
							.${ presetDuotoneClass } .videopack-thumbnail {
								filter: url(#${ presetDuotoneClass }) !important;
							}
							.${ presetDuotoneClass } .vjs-poster .vjs-poster,
							.${ presetDuotoneClass } .mejs-poster .mejs-poster {
								filter: none !important;
							}
							.${ presetDuotoneClass } .wp-block-videopack-player-container,
							.${ presetDuotoneClass } .wp-block-videopack-thumbnail,
							.${ presetDuotoneClass } [class*="wp-duotone-"] {
								filter: none !important;
							}
						` }
					</style>
				) }
				{ ( () => {
					if (
						! videos ||
						( isPreviewResolving && videos.length === 0 )
					) {
						return (
							<div className="videopack-collection-loading">
								<Spinner />
							</div>
						);
					}

					// Whether this Loop instance is the real, editable block editor
					// (drag-reordering, InnerBlocks) versus a disabled preview
					// (Settings page, Classic Editor, Attachment Details) — the
					// latter renders a plain grid below with no @dnd-kit at all,
					// since drag can't function in a disabled preview anyway.
					const canEdit =
						! vpContext.resolved.isPreview &&
						! isTrue( context[ 'videopack/isPreview' ] );

					if ( videos.length === 0 ) {
						const showUploadPlaceholder =
							canEdit &&
							( queryAttributes.gallery_source === 'current' ||
								( queryAttributes.gallery_source === 'manual' &&
									! queryAttributes.gallery_include ) );

						if ( showUploadPlaceholder ) {
							return (
								<MediaPlaceholder
									icon="video-alt3"
									labels={ {
										title: __(
											'Videopack Gallery',
											'video-embed-thumbnail-generator'
										),
										instructions: __(
											'Upload or select videos to attach to this post.',
											'video-embed-thumbnail-generator'
										),
									} }
									onSelect={ handleSelectVideos }
									accept="video/*"
									allowedTypes={ [ 'video' ] }
									multiple
								/>
							);
						}

						return (
							<div className="videopack-collection-preview-placeholder">
								{ __(
									'No videos found for this source.',
									'video-embed-thumbnail-generator'
								) }
							</div>
						);
					}

					if ( ! canEdit ) {
						// Static, non-interactive grid — no dnd-kit, no real
						// InnerBlocks, since none of it can function in a
						// disabled preview anyway.
						return (
							<div className="videopack-collection-grid">
								{ videos.map( ( video ) => {
									const videoKey =
										video.attachment_id || video.id;
									const itemContext = buildItemContext(
										video,
										{
											context,
											vpContext,
											resolvedDuotoneClass,
											totalPagesCount,
											totalResultsCount,
										}
									);

									return (
										<figure
											key={ videoKey }
											className="videopack-collection-item videopack-hover-trigger is-preview"
										>
											<BlockContextProvider
												value={ itemContext }
											>
												<div
													className={
														resolvedDuotoneClass
													}
												>
													<LoopItemPreview
														blocks={
															templateBlocks
														}
														isHidden={ false }
														onActivate={ () => {} }
													/>
												</div>
											</BlockContextProvider>
										</figure>
									);
								} ) }
							</div>
						);
					}

					return (
						<Suspense
							fallback={
								<div className="videopack-collection-loading">
									<Spinner />
								</div>
							}
						>
							<SortableGrid
								videos={ videos }
								effectiveActiveKey={ effectiveActiveKey }
								setActiveVideoKey={ setActiveVideoKey }
								context={ context }
								vpContext={ vpContext }
								templateBlocks={ templateBlocks }
								resolvedDuotoneClass={ resolvedDuotoneClass }
								totalPagesCount={ totalPagesCount }
								totalResultsCount={ totalResultsCount }
								showLoopAppender={ showLoopAppender }
								handleRemoveItem={ handleRemoveItem }
								handleEditItem={ handleEditItem }
								handleAddVideo={ handleAddVideo }
								queryAttributes={ queryAttributes }
								parentClientId={ parentClientId }
								updateBlockAttributes={ updateBlockAttributes }
								previewPostId={ previewPostId }
								onReorderStart={ () =>
									setIsReorderPending( true )
								}
							/>
						</Suspense>
					);
				} )() }
			</figure>
		</>
	);
}
