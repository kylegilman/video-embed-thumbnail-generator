import { BlockContextProvider, InnerBlocks } from '@wordpress/block-editor';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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
import { getVideoGallery } from '../../api/gallery';
import LoopItemPreview from './LoopItemPreview';
import buildItemContext from './buildItemContext';

/**
 * An internal component to wrap collection items with drag-and-drop and action functionality.
 *
 * @param {Object}        root0                   Component props.
 * @param {number|string} root0.id                Item ID.
 * @param {boolean}       root0.isActive          Whether this item currently shows real InnerBlocks.
 * @param {boolean}       root0.isHoveringGallery Whether gallery is being hovered.
 * @param {Function}      root0.onRemove          Remove callback.
 * @param {Function}      root0.onEdit            Edit callback.
 * @param {Function}      root0.onAddVideo        Add video callback.
 * @param {boolean}       root0.isPreview         Whether it's in preview mode.
 * @param {Element}       root0.children          Child elements.
 */
function SortableItem({
	id,
	isActive,
	isHoveringGallery,
	onRemove,
	onEdit,
	onAddVideo,
	isPreview,
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
			className={`videopack-collection-item videopack-hover-trigger ${
				isActive && !isPreview ? 'is-editable' : 'is-preview'
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
			<div className="gallery-item-edit">
				<button
					type="button"
					className="videopack-edit-item"
					onClick={(e) => {
						e.stopPropagation();
						onEdit(id);
					}}
					title={__('Edit', 'video-embed-thumbnail-generator')}
				>
					<Icon icon={pencil} />
				</button>
			</div>
			<div className="gallery-item-remove">
				<button
					type="button"
					className="videopack-remove-item"
					onClick={(e) => {
						e.stopPropagation();
						onRemove(id);
					}}
					title={__('Remove', 'video-embed-thumbnail-generator')}
				>
					<Icon icon={close} />
				</button>
			</div>
			{!isActive && isHoveringGallery && (
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
 * The interactive, draggable/reorderable grid for videopack/loop — used only
 * in the real, editable block editor, never in a disabled preview (dragging
 * can't function there anyway, since useBlockPreview makes everything inert).
 * Lazy-loaded from edit.js specifically so @dnd-kit never ends up in a bundle
 * that only ever renders static previews (Settings page, Classic Editor,
 * Attachment Details) — see edit.js's canEdit branch for the static grid
 * used instead in those contexts.
 *
 * @param {Object}   root0                     Component props.
 * @param {Array}    root0.videos              Video records to render.
 * @param {string}   root0.effectiveActiveKey  The currently-active video's key.
 * @param {Function} root0.setActiveVideoKey   Marks a video as active (shows real InnerBlocks).
 * @param {Object}   root0.context             This Loop instance's inherited block context.
 * @param {Object}   root0.vpContext           This Loop instance's resolved videopack context.
 * @param {Array}    root0.templateBlocks      Loop's own inner block template.
 * @param {string}   root0.resolvedDuotoneClass Duotone class shared across all items.
 * @param {number}   root0.totalPagesCount     Total pages (for item context).
 * @param {number}   root0.totalResultsCount   Total results (for item context).
 * @param {boolean}  root0.showLoopAppender    Whether to show the "add block" appender.
 * @param {Function} root0.handleRemoveItem    Removes a video from the collection.
 * @param {Function} root0.handleEditItem      Opens the media frame to replace a video.
 * @param {Function} root0.handleAddVideo      Opens the media frame to add videos.
 * @param {Object}   root0.queryAttributes     Loop's resolved query attributes.
 * @param {string}   root0.parentClientId      The parent Collection block's clientId.
 * @param {Function} root0.updateBlockAttributes Dispatch action to update a block's attributes.
 * @param {number}   root0.previewPostId       The current post's ID (for gallery_id fallback).
 * @param {Function} root0.onReorderStart      Called synchronously the instant a drag completes,
 *                                             before the persisted-order fetch even starts — lets
 *                                             the Inspector show "Manual"/"Manually Sorted" right away.
 */
export default function SortableGrid({
	videos,
	effectiveActiveKey,
	setActiveVideoKey,
	context,
	vpContext,
	templateBlocks,
	resolvedDuotoneClass,
	totalPagesCount,
	totalResultsCount,
	showLoopAppender,
	handleRemoveItem,
	handleEditItem,
	handleAddVideo,
	queryAttributes,
	parentClientId,
	updateBlockAttributes,
	previewPostId,
	onReorderStart,
}) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Reordering persists via updateBlockAttributes below, which changes the
	// parent Collection's query attributes and triggers a REST refetch to
	// confirm the new order — but until that round-trip resolves, `videos`
	// (below) is still the previous, unreordered response, so the grid would
	// otherwise visibly snap back to the old order for a moment before
	// snapping forward again once the fetch completes. Reordering this local
	// copy immediately on drop (before the fetch even starts) shows the
	// result instantly instead; once fresh data arrives reflecting the same
	// order, this defers back to it with no visible change.
	const [optimisticVideos, setOptimisticVideos] = useState(null);

	useEffect(() => {
		setOptimisticVideos(null);
	}, [videos]);

	const displayVideos = optimisticVideos || videos;

	const handleDragEnd = useCallback(
		async (event) => {
			const { active, over } = event;
			if (active && over && active.id !== over.id) {
				const displayOldIndex = videos.findIndex(
					(v) => (v.attachment_id || v.id) === active.id
				);
				const displayNewIndex = videos.findIndex(
					(v) => (v.attachment_id || v.id) === over.id
				);
				if (displayOldIndex !== -1 && displayNewIndex !== -1) {
					setOptimisticVideos(
						arrayMove(videos, displayOldIndex, displayNewIndex)
					);
					onReorderStart?.();
				}

				let fullIds = [];
				if (
					queryAttributes.gallery_source === 'manual' &&
					queryAttributes.gallery_include
				) {
					fullIds = queryAttributes.gallery_include
						.split(',')
						.map((id) => id.trim());
				} else {
					try {
						const response = await getVideoGallery({
							...queryAttributes,
							gallery_id: queryAttributes.gallery_id || previewPostId,
							gallery_per_page: -1,
							page_number: undefined,
							gallery_pagination: false,
							skip_html: true,
						});
						fullIds = (response.videos || []).map((v) =>
							v.attachment_id.toString()
						);
					} catch {
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
		[
			queryAttributes,
			videos,
			parentClientId,
			updateBlockAttributes,
			previewPostId,
			onReorderStart,
		]
	);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={displayVideos.map(
					(v, i) => v.attachment_id || `temp-${i}`
				)}
				strategy={rectSortingStrategy}
			>
				<div className="videopack-collection-grid">
					{displayVideos.map((video) => {
						const videoKey = video.attachment_id || video.id;
						const isActive = videoKey === effectiveActiveKey;

						const itemContext = buildItemContext(video, {
							context,
							vpContext,
							resolvedDuotoneClass,
							totalPagesCount,
							totalResultsCount,
						});

						return (
							<SortableItem
								key={video.attachment_id || video.id}
								id={video.attachment_id || video.id}
								isActive={isActive}
								isPreview={false}
								onRemove={handleRemoveItem}
								onEdit={handleEditItem}
								onAddVideo={handleAddVideo}
								isHoveringGallery={false}
							>
								<BlockContextProvider value={itemContext}>
									<div className={resolvedDuotoneClass}>
										{isActive && (
											<InnerBlocks
												templateLock={false}
												renderAppender={
													showLoopAppender
														? InnerBlocks.ButtonBlockAppender
														: false
												}
											/>
										)}
										<LoopItemPreview
											blocks={templateBlocks}
											isHidden={isActive}
											onActivate={() =>
												setActiveVideoKey(videoKey)
											}
										/>
									</div>
								</BlockContextProvider>
							</SortableItem>
						);
					})}
				</div>
			</SortableContext>
		</DndContext>
	);
}
