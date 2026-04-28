import {
	useBlockProps,
	InnerBlocks,
	BlockContextProvider,
	InspectorControls,
	BlockPreview,
	__experimentalBlockPreview,
} from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	Spinner,
	Icon,
	PanelBody,
	Disabled,
} from '@wordpress/components';
import { EntityProvider } from '@wordpress/core-data';
import { useMemo, useState, useEffect, useCallback, useRef } from '@wordpress/element';
import { pencil, close, dragHandle, create } from '@wordpress/icons';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	rectSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useVideoQuery from '../../hooks/useVideoQuery';
import useVideopackContext from '../../hooks/useVideopackContext';
import { getEffectiveValue } from '../../utils/context';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer.js';
import { getSettings } from '../../api/settings';
import { getVideoGallery } from '../../api/gallery';
import CollectionInspectorControls from '../../components/InspectorControls/CollectionInspectorControls';
import { BlockPreview as VideopackPreview } from '../../components/Preview';
import './editor.scss';

/**
 * Helper component to render a custom SVG duotone filter.
 *
 * @param {Object} root0        Props
 * @param {Array}  root0.colors Array of two hex colors
 * @param {string} root0.id     Filter ID
 * @return {Element|null} SVG element
 */
const CustomDuotoneFilter = ({ colors, id }) => {
	if (!colors || colors.length < 2) {
		return null;
	}

	const parseColor = (color) => {
		if (!color) {
			return { r: 0, g: 0, b: 0, a: 1 };
		}

		// Handle Hex colors (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
		if (color.startsWith('#')) {
			const hex = color.slice(1);
			let r = 0,
				g = 0,
				b = 0,
				a = 255;
			if (hex.length === 3) {
				r = parseInt(hex[0] + hex[0], 16);
				g = parseInt(hex[1] + hex[1], 16);
				b = parseInt(hex[2] + hex[2], 16);
			} else if (hex.length === 4) {
				r = parseInt(hex[0] + hex[0], 16);
				g = parseInt(hex[1] + hex[1], 16);
				b = parseInt(hex[2] + hex[2], 16);
				a = parseInt(hex[3] + hex[3], 16);
			} else if (hex.length === 6) {
				r = parseInt(hex.slice(0, 2), 16);
				g = parseInt(hex.slice(2, 4), 16);
				b = parseInt(hex.slice(4, 6), 16);
			} else if (hex.length === 8) {
				r = parseInt(hex.slice(0, 2), 16);
				g = parseInt(hex.slice(2, 4), 16);
				b = parseInt(hex.slice(4, 6), 16);
				a = parseInt(hex.slice(6, 8), 16);
			}
			return {
				r: r / 255,
				g: g / 255,
				b: b / 255,
				a: a / 255,
			};
		}

		// Handle RGB/RGBA strings
		const rgbMatch = color.match(
			/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/
		);
		if (rgbMatch) {
			return {
				r: parseInt(rgbMatch[1], 10) / 255,
				g: parseInt(rgbMatch[2], 10) / 255,
				b: parseInt(rgbMatch[3], 10) / 255,
				a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
			};
		}

		return { r: 0, g: 0, b: 0, a: 1 };
	};

	const c1 = parseColor(colors[0]);
	const c2 = parseColor(colors[1]);

	const rValues = `${c1.r} ${c2.r}`;
	const gValues = `${c1.g} ${c2.g}`;
	const bValues = `${c1.b} ${c2.b}`;
	const aValues = `${c1.a} ${c2.a}`;

	return (
		<svg
			style={{
				position: 'absolute',
				width: 0,
				height: 0,
				visibility: 'hidden',
			}}
			aria-hidden="true"
		>
			<filter id={id}>
				<feColorMatrix
					type="matrix"
					values=".299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0"
				/>
				<feComponentTransfer colorInterpolationFilters="sRGB">
					<feFuncR type="table" tableValues={rValues} />
					<feFuncG type="table" tableValues={gValues} />
					<feFuncB type="table" tableValues={bValues} />
					<feFuncA type="table" tableValues={aValues} />
				</feComponentTransfer>
			</filter>
		</svg>
	);
};

/**
 * A internal component to wrap collection items with drag-and-drop and action functionality.
 */
function SortableItem({
	id,
	isEditableTemplate,
	isHoveringGallery,
	onRemove,
	onEdit,
	onAddVideo,
	children,
}) {
	const {
		attributes: sortableAttributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 200 : undefined,
	};

	return (
		<figure
			ref={setNodeRef}
			style={style}
			{...sortableAttributes}
			className={`videopack-collection-item ${
				isEditableTemplate ? 'is-editable' : 'is-preview'
			} ${isDragging ? 'is-dragging' : ''}`}
		>
			{children}
			<button
				className="videopack-drag-handle"
				{...listeners}
				title={__('Drag to reorder', 'video-embed-thumbnail-generator')}
			>
				<Icon icon={dragHandle} />
			</button>
			{!isEditableTemplate && (
				<div
					className="gallery-item-edit"
					onClick={(e) => {
						e.stopPropagation();
						onEdit(id);
					}}
					tabIndex="0"
					role="button"
					title={__('Edit', 'video-embed-thumbnail-generator')}
				>
					<button type="button" className="videopack-edit-item">
						<Icon icon={pencil} />
					</button>
				</div>
			)}
			<div
				className="gallery-item-remove"
				onClick={(e) => {
					e.stopPropagation();
					onRemove(id);
				}}
				tabIndex="0"
				role="button"
				title={__('Remove', 'video-embed-thumbnail-generator')}
			>
				<button type="button" className="videopack-remove-item">
					<Icon icon={close} />
				</button>
			</div>
			{!isEditableTemplate && isHoveringGallery && (
				<button
					className="gallery-add-button"
					onClick={onAddVideo}
					title={__('Add video', 'video-embed-thumbnail-generator')}
				>
					<Icon icon={create} />
				</button>
			)}
		</figure>
	);
}

/**
 * The Edit component for the Video Loop block.
 *
 * @param {Object} props          Component props.
 * @param {Object} props.context  Block context.
 * @param {string} props.clientId Block client ID.
 * @return {Element}              The rendered component.
 */
export default function Edit({ attributes, setAttributes, context, clientId }) {
	const vpContext = useVideopackContext(attributes, context);

	const isEditingAllPages = context['videopack/isEditingAllPages'] || false;
	const [options, setOptions] = useState({});
	const [isHovering, setIsHovering] = useState(false);
	const { updateBlockAttributes } = useDispatch('core/block-editor');
	const { parentClientId } = useSelect(
		(select) => ({
			parentClientId:
				select('core/block-editor').getBlockRootClientId(clientId),
		}),
		[clientId]
	);

	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});
	}, []);

	// We get query-related attributes from the parent collection block via context.
	const queryAttributes = {
		gallery_source: context['videopack/gallery_source'],
		gallery_id: context['videopack/gallery_id'],
		gallery_category: context['videopack/gallery_category'],
		gallery_tag: context['videopack/gallery_tag'],
		gallery_orderby: context['videopack/gallery_orderby'],
		gallery_order: context['videopack/gallery_order'],
		gallery_include: context['videopack/gallery_include'],
		gallery_exclude: context['videopack/gallery_exclude'],
		gallery_pagination: isEditingAllPages 
			? false 
			: (vpContext.gallery_pagination ?? getEffectiveValue('gallery_pagination', attributes, context)),
		gallery_per_page: isEditingAllPages 
			? -1 
			: (vpContext.gallery_per_page ?? getEffectiveValue('gallery_per_page', attributes, context)),
		enable_collection_video_limit: getEffectiveValue(
			'enable_collection_video_limit',
			attributes,
			context
		),
		collection_video_limit: getEffectiveValue(
			'collection_video_limit',
			attributes,
			context
		),
		page_number: isEditingAllPages ? 1 : (vpContext.currentPage || context['videopack/currentPage'] || 1),
		prioritizePostData: vpContext.resolved.prioritizePostData,
	};

	const { videoResults: queryVideos, isResolving: isResolvingQuery } = useVideoQuery(
		vpContext.videos ? null : queryAttributes
	);
	const videos = vpContext.videos || queryVideos;
	const isResolving = vpContext.videos ? false : isResolvingQuery;






	const {
		presetDuotoneClass,
		customDuotoneColors,
		thumbClientId,
		previewPostId,
		isSaving,
		isAutosaving,
		parentAttributes,
		hasPaginationBlock,
	} = useSelect(
		(select) => {
			const { getBlocks, getBlockAttributes } =
				select('core/block-editor');
			const { isSavingPost, isAutosavingPost } = select('core/editor');
			const blocks = getBlocks(clientId) || [];

			const parentAttrs = parentClientId
				? getBlockAttributes(parentClientId)
				: {};

			const parentBlocks = parentClientId
				? getBlocks(parentClientId)
				: [];
			const hasPagination = parentBlocks.some(
				(b) => b.name === 'videopack/pagination'
			);

			// Helper to find a block by name recursively in the inner blocks tree
			const findBlockRecursive = (blockList, name) => {
				for (const block of blockList) {
					if (block.name === name) {
						return block;
					}
					if (block.innerBlocks && block.innerBlocks.length > 0) {
						const found = findBlockRecursive(
							block.innerBlocks,
							name
						);
						if (found) {
							return found;
						}
					}
				}
				return null;
			};

			const isSaving = isSavingPost ? isSavingPost() : false;
			const isAutosaving = isAutosavingPost ? isAutosavingPost() : false;

			const thumb = findBlockRecursive(blocks, 'videopack/thumbnail');
			const duotone = thumb?.attributes?.style?.color?.duotone;
			let presetClass = '';
			let customColors = null;

			if (
				typeof duotone === 'string' &&
				duotone.startsWith('var:preset|duotone|')
			) {
				presetClass = `wp-duotone-${duotone.split('|').pop()}`;
			} else if (Array.isArray(duotone)) {
				customColors = duotone;
			}

			return {
				presetDuotoneClass: presetClass,
				customDuotoneColors: customColors,
				thumbClientId: thumb?.clientId,
				previewPostId: select('core/editor').getCurrentPostId(),
				isSaving,
				isAutosaving,
				parentAttributes: parentAttrs,
				hasPaginationBlock: hasPagination,
			};
		},
		[clientId, parentClientId]
	);

	const templateBlocks = useSelect(
		(select) => select('core/block-editor').getBlocks(clientId) || [],
		[clientId]
	);

	// Generate a stable ID for custom filters to prevent flickering.
	// We use the Thumbnail block's ID so it matches what the Thumbnail block expects locally.
	const customFilterId = useMemo(
		() =>
			thumbClientId
				? `videopack-custom-duotone-${thumbClientId.split('-')[0]}`
				: '',
		[thumbClientId]
	);

	// Final duotone class resolution
	const resolvedDuotoneClass =
		presetDuotoneClass || (customDuotoneColors ? customFilterId : '');

	// We fetch query data to power the live preview template
	const queryData = useVideoQuery(queryAttributes, previewPostId);
	const { videoResults: previewVideos, isResolving: isPreviewResolving } = queryData;

	const layout = context['videopack/layout'] || 'grid';
	const columns = context['videopack/columns'] || 3;

	const blockProps = useBlockProps({
		className: `videopack-video-loop layout-${layout} columns-${columns} ${
			isPreviewResolving && !isSaving && !isAutosaving ? 'is-loading' : ''
		} ${isEditingAllPages ? 'is-editing-all-pages' : ''}`,
		onMouseEnter: () => setIsHovering(true),
		onMouseLeave: () => setIsHovering(false),
	});

	const computedStyle = {};
	if (columns && layout === 'grid') {
		computedStyle['--videopack-collection-columns'] = columns;
	}

	// Universal Solution: Fetch the actual attachment records to hydrate the store.
	// This ensures that BlockEdit and any inner blocks have the 'real' data they need.
	const videoIds = useMemo(() => {
		return (previewVideos || []).map((v) => v.attachment_id).filter(Boolean);
	}, [previewVideos]);

	const attachmentRecords = useSelect(
		(select) => {
			if (!videoIds.length) return null;
			return select('core').getEntityRecords('postType', 'attachment', {
				include: videoIds,
				per_page: -1,
			});
		},
		[videoIds]
	);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleRemoveItem = useCallback(
		(idToRemove) => {
			const currentExclude = queryAttributes.gallery_exclude
				? queryAttributes.gallery_exclude
						.split(',')
						.map((id) => id.trim())
				: [];
			if (!currentExclude.includes(idToRemove.toString())) {
				currentExclude.push(idToRemove.toString());
			}

			const currentInclude = queryAttributes.gallery_include
				? queryAttributes.gallery_include
						.split(',')
						.map((id) => id.trim())
				: [];
			const newInclude = currentInclude
				.filter((id) => id !== idToRemove.toString())
				.join(',');

			updateBlockAttributes(parentClientId, {
				gallery_exclude: currentExclude.join(','),
				gallery_include: newInclude,
			});
		},
		[queryAttributes, parentClientId, updateBlockAttributes]
	);

	const handleEditItem = useCallback(
		async (oldId) => {
			let currentInclude = queryAttributes.gallery_include
				? queryAttributes.gallery_include
						.split(',')
						.map((id) => id.trim())
				: [];

			if (queryAttributes.gallery_source !== 'manual') {
				try {
					const response = await getVideoGallery({
						...queryAttributes,
						gallery_id: queryAttributes.gallery_id || previewPostId,
						gallery_per_page: -1,
						page_number: undefined,
						gallery_pagination: false,
					});
					currentInclude = (response.videos || []).map((v) => v.attachment_id.toString());
				} catch (error) {
					console.error('Failed to fetch full collection IDs:', error);
					currentInclude = (videos || []).map((v) => v.attachment_id.toString());
				}
			}

			const frame = window.wp.media({
				title: __('Edit Video', 'video-embed-thumbnail-generator'),
				button: {
					text: __('Update', 'video-embed-thumbnail-generator'),
				},
				multiple: false,
				library: { type: 'video' },
			});

			frame.on('open', () => {
				const selection = frame.state().get('selection');
				const attachment = window.wp.media.attachment(oldId);
				attachment.fetch().done(() => selection.add(attachment));
			});

			frame.on('select', () => {
				const newAttachment = frame
					.state()
					.get('selection')
					.first()
					.toJSON();

				const newInclude = currentInclude
					.map((id) =>
						parseInt(id, 10) === oldId
							? newAttachment.id.toString()
							: id
					)
					.join(',');

				updateBlockAttributes(parentClientId, {
					gallery_include: newInclude,
					gallery_orderby: 'include',
					gallery_source: 'manual',
				});
			});

			frame.open();
		},
		[
			queryAttributes,
			videos,
			parentClientId,
			updateBlockAttributes,
		]
	);

	const handleAddVideo = useCallback(async () => {
		let currentInclude = queryAttributes.gallery_include
			? queryAttributes.gallery_include
					.split(',')
					.map((id) => id.trim())
			: [];

		// If we're not already in manual mode, we need to fetch ALL current IDs 
		// from the server to ensure we don't lose items on other pages when freezing.
		if (queryAttributes.gallery_source !== 'manual') {
			try {
				console.log('[Videopack Debug] Fetching full collection IDs for freeze. Query:', queryAttributes);
				const response = await getVideoGallery({
					...queryAttributes,
					gallery_id: queryAttributes.gallery_id || previewPostId,
					gallery_per_page: -1, // Get all IDs
					page_number: undefined, // Remove page limit
					gallery_pagination: false,
				});
				currentInclude = (response.videos || []).map((v) => v.attachment_id.toString());
				console.log('[Videopack Debug] Fetched IDs:', currentInclude.length, currentInclude);
			} catch (error) {
				console.error('Failed to fetch full collection IDs:', error);
				// Fallback to current page results if fetch fails
				currentInclude = (videos || []).map((v) => v.attachment_id.toString());
				console.log('[Videopack Debug] Fallback to current page IDs:', currentInclude.length, currentInclude);
			}
		} else {
			console.log('[Videopack Debug] Already manual. currentInclude:', currentInclude.length, currentInclude);
		}

		const frame = window.wp.media({
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
		});

		frame.on('select', () => {
			const selection = frame.state().get('selection');
			const newIds = selection.map((attachment) =>
				attachment.id.toString()
			);

			const combinedInclude = [
				...new Set([...currentInclude, ...newIds]),
			].join(',');

			updateBlockAttributes(parentClientId, {
				gallery_include: combinedInclude,
				gallery_source: 'manual',
				gallery_orderby: 'include',
			});
		});

		frame.open();
	}, [
		queryAttributes,
		videos,
		parentClientId,
		updateBlockAttributes,
	]);

	const handleDragEnd = useCallback(
		async (event) => {
			const { active, over } = event;
			if (active && over && active.id !== over.id) {
				let fullIds = [];
				if (
					queryAttributes.gallery_source === 'manual' &&
					queryAttributes.gallery_include
				) {
					fullIds = queryAttributes.gallery_include
						.split(',')
						.map((id) => id.trim());
				} else {
					// If dynamic, fetch full collection before freezing
					try {
						const response = await getVideoGallery({
							...queryAttributes,
							gallery_id: queryAttributes.gallery_id || previewPostId,
							gallery_per_page: -1,
							page_number: undefined,
							gallery_pagination: false,
						});
						fullIds = (response.videos || []).map((v) =>
							v.attachment_id.toString()
						);
					} catch (error) {
						console.error(
							'Failed to fetch full collection IDs for drag:',
							error
						);
						fullIds = (videos || []).map((v) =>
							v.attachment_id.toString()
						);
					}
				}

				const oldIndex = fullIds.findIndex(
					(id) => parseInt(id, 10) === active.id
				);
				const newIndex = fullIds.findIndex(
					(id) => parseInt(id, 10) === over.id
				);

				if (oldIndex !== -1 && newIndex !== -1) {
					const newIds = arrayMove(fullIds, oldIndex, newIndex);
					const newInclude = newIds.join(',');

					updateBlockAttributes(parentClientId, {
						gallery_include: newInclude,
						gallery_orderby: 'include',
						gallery_source: 'manual',
					});
				}
			}
		},
		[queryAttributes, videos, parentClientId, updateBlockAttributes]
	);

	/**
	 * Helper to render a high-fidelity preview of the template blocks
	 *
	 * @param {Array}  previewBlocks  Template blocks to render
	 * @param {Object} video          Video data
	 * @param {Object} previewContext Design context (skin, colors, etc)
	 * @param {Object} parentFlags    Flags for parentage (isInsideThumbnail, etc)
	 * @return {Array}                The rendered blocks.
	 */
	const renderBlockPreview = (
		previewBlocks,
		video,
		previewContext,
		parentFlags = {}
	) => {
		const targetPostId = ( vpContext.resolved.prioritizePostData && video.parent_id ) ? video.parent_id : ( video.attachment_id || video.id );
		const targetPostType = ( vpContext.resolved.prioritizePostData && video.parent_id ) ? 'post' : 'attachment';

		return previewBlocks.map((block) => {
			const {
				name,
				attributes: blockAttrs,
				innerBlocks,
				clientId: blockClientId,
			} = block;
			const itemKey = `${video.attachment_id || video.id}-${blockClientId}`;

			// If it's a Videopack block we have in our registry, use the high-perf visual component.
			if (name.startsWith('videopack/')) {
				const currentFlags = { ...parentFlags };
				if (name === 'videopack/thumbnail') {
					currentFlags.isInsideThumbnail = true;
					currentFlags.downloadlink = false;
					currentFlags.embedcode = false;
				}
				// Standardized overlay detection for display components
				const isOverlay =
					!!currentFlags.isInsideThumbnail ||
					!!currentFlags.isInsidePlayerOverlay;

				return (
					<VideopackPreview
						key={itemKey}
						name={name}
						attributes={blockAttrs}
						postId={targetPostId}
						postType={targetPostType}
						isOverlay={isOverlay}
						{...currentFlags}
						resolvedDuotoneClass={resolvedDuotoneClass}
						context={{
							...previewContext,
							...currentFlags,
							'videopack/isInsideThumbnail':
								currentFlags.isInsideThumbnail,
							'videopack/isInsidePlayerOverlay':
								currentFlags.isInsidePlayerOverlay,
							'videopack/downloadlink': currentFlags.downloadlink,
							'videopack/embedcode': currentFlags.embedcode,
							'videopack/postId': targetPostId,
							'videopack/postType': targetPostType,
							'videopack/attachmentId': video.attachment_id || video.id,
							postId: targetPostId,
							postType: targetPostType,
							'videopack/parentPostId': video.parent_id,
						}}
					>
						{innerBlocks?.length > 0 &&
							renderBlockPreview(
								innerBlocks,
								video,
								previewContext,
								currentFlags
							)}
					</VideopackPreview>
				);
			}

			// Fallback for any other block (Core blocks, 3rd party, etc)
			return (
				<PreviewItem
					key={itemKey}
					block={block}
					video={video}
					previewContext={previewContext}
					parentFlags={parentFlags}
					vpContext={vpContext}
				/>
			);
		});
	};



	return (
		<>
			<InspectorControls>
				<CollectionInspectorControls
					clientId={parentClientId}
					attributes={parentAttributes}
					setAttributes={(newAttrs) =>
						updateBlockAttributes(parentClientId, newAttrs)
					}
					queryData={queryData}
					options={options}
					hasPaginationBlock={hasPaginationBlock}
					isEditingAllPages={isEditingAllPages}
				/>
			</InspectorControls>

			<figure {...blockProps} style={computedStyle}>
				{!videos ? (
					<div className="videopack-collection-loading">
						<Spinner />
					</div>
				) : (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={videos.map(
								(v, i) => v.attachment_id || `temp-${i}`
							)}
							strategy={rectSortingStrategy}
						>
							<div className="videopack-collection-grid">
								{videos.map((video, index) => {
									const isEditableTemplate = index === 0;
									const targetPostId = ( vpContext.resolved.prioritizePostData && video.parent_id ) ? video.parent_id : ( video.attachment_id || video.id );
									const targetPostType = ( vpContext.resolved.prioritizePostData && video.parent_id ) ? 'post' : 'attachment';

									return (
										<SortableItem
											key={
												video.attachment_id ||
												`temp-${index}`
											}
											id={video.attachment_id}
											isEditableTemplate={
												isEditableTemplate
											}
											isHoveringGallery={
												isHovering &&
												index === videos.length - 1
											}
											onRemove={handleRemoveItem}
											onEdit={handleEditItem}
											onAddVideo={handleAddVideo}
										>

											<BlockContextProvider
												value={{
													...context,
													postId: targetPostId,
													postType: targetPostType,
													'videopack/postId': targetPostId,
													'videopack/postType': targetPostType,
													'videopack/attachmentId': video.attachment_id || video.id,
													'videopack/title': video.title,
													'videopack/embedlink': video.player_vars?.full_player_html || '',
													'videopack/parentPostId': video.parent_id,
													'videopack/video': video,
												}}
											>
												{isEditableTemplate ? (
													<InnerBlocks
														templateLock={false}
														renderAppender={
															InnerBlocks.ButtonBlockAppender
														}
													/>
												) : (
													renderBlockPreview(
														templateBlocks,
														video,
														context,
														{},
														vpContext
													)
												)}
											</BlockContextProvider>
										</SortableItem>
									);
								})}
							</div>
						</SortableContext>
					</DndContext>
				)}
			</figure>
		</>
	);
}

/**
 * Renders a single block preview item.
 */
const PreviewItem = ({ block, video, previewContext, parentFlags, vpContext }) => {
	const [width, setWidth] = useState(400);
	const containerRef = useRef();
	const ActualBlockPreview = BlockPreview || __experimentalBlockPreview;

	useEffect(() => {
		if (!containerRef.current) return;
		let timeoutId;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.contentRect.width > 0) {
					const newWidth = entry.contentRect.width;
					clearTimeout(timeoutId);
					timeoutId = setTimeout(() => {
						setWidth((prev) => {
							if (Math.abs(prev - newWidth) > 2) {
								return newWidth;
							}
							return prev;
						});
					}, 100);
				}
			}
		});
		observer.observe(containerRef.current);
		return () => {
			observer.disconnect();
			clearTimeout(timeoutId);
		};
	}, []);

	if (!ActualBlockPreview) {
		return <div>{block.name}</div>;
	}

	const targetPostId = ( vpContext.resolved.prioritizePostData && video.parent_id ) ? video.parent_id : ( video.attachment_id || video.id );
	const targetPostType = ( vpContext.resolved.prioritizePostData && video.parent_id ) ? 'post' : 'attachment';

	return (
		<div ref={containerRef} className="videopack-block-preview-external">
			<BlockContextProvider
				value={{
					...previewContext,
					...parentFlags,
					postId: targetPostId,
					postType: targetPostType,
					'videopack/postId': targetPostId,
					'videopack/postType': targetPostType,
					'videopack/attachmentId': video.attachment_id || video.id,
					'videopack/parentPostId': video.parent_id,
					'videopack/video': video,
				}}
			>
				<ActualBlockPreview
					blocks={[block]}
					viewportWidth={width}
					context={{
						...previewContext,
						...parentFlags,
						postId: targetPostId,
						postType: targetPostType,
						'videopack/postId': targetPostId,
						'videopack/postType': targetPostType,
						'videopack/attachmentId': video.attachment_id || video.id,
						'videopack/parentPostId': video.parent_id,
					}}
				/>
			</BlockContextProvider>
		</div>
	);
};

