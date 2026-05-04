/* global videopack_config, ResizeObserver */
import {
	useBlockProps,
	InnerBlocks,
	BlockContextProvider,
	InspectorControls,
	BlockPreview,
	__experimentalBlockPreview,
} from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Spinner, Icon } from '@wordpress/components';
import {
	useMemo,
	useState,
	useEffect,
	useCallback,
	useRef,
} from '@wordpress/element';
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
import { useVideopackContext as useVideopackData } from '../../utils/VideopackContext';
import { isTrue } from '../../utils/context';
import { getSettings } from '../../api/settings';
import { getVideoGallery } from '../../api/gallery';
import CollectionInspectorControls from '../../components/InspectorControls/CollectionInspectorControls';
import { BlockPreview as VideopackPreview } from '../../components/Preview';
import './editor.scss';
/**
 * A internal component to wrap collection items with drag-and-drop and action functionality.
 *
 * @param {Object}        root0                    Component props.
 * @param {number|string} root0.id                 Item ID.
 * @param {boolean}       root0.isEditableTemplate Whether it's an editable template.
 * @param {boolean}       root0.isHoveringGallery  Whether gallery is being hovered.
 * @param {Function}      root0.onRemove           Remove callback.
 * @param {Function}      root0.onEdit             Edit callback.
 * @param {Function}      root0.onAddVideo         Add video callback.
 * @param {boolean}       root0.isPreview          Whether it's in preview mode.
 * @param {Element}       root0.children           Child elements.
 */
function SortableItem({
	id,
	isEditableTemplate,
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
				isEditableTemplate && !isPreview ? 'is-editable' : 'is-preview'
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
			)}
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
 * Renders a single block preview item.
 *
 * @param {Object} root0                      Component props.
 * @param {Object} root0.block                Block data.
 * @param {Object} root0.video                Video data.
 * @param {Object} root0.previewContext       Preview context.
 * @param {Object} root0.parentFlags          Parent flags.
 * @param {Object} root0.vpContext            Videopack context.
 * @param {string} root0.resolvedDuotoneClass Resolved duotone class name.
 */
const PreviewItem = ({
	block,
	video,
	previewContext,
	parentFlags,
	vpContext,
	resolvedDuotoneClass,
}) => {
	const [width, setWidth] = useState(400);
	const containerRef = useRef();
	const ActualBlockPreview = BlockPreview || __experimentalBlockPreview;

	useEffect(() => {
		if (!containerRef.current) {
			return;
		}
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

	const targetPostId =
		vpContext.resolved.prioritizePostData && video.parent_id
			? video.parent_id
			: video.attachment_id || video.id;
	const targetPostType =
		vpContext.resolved.prioritizePostData && video.parent_id
			? 'post'
			: 'attachment';

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
				<div className={resolvedDuotoneClass}>
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
							'videopack/parentPostId': video.parent_id,
							'videopack/loopDuotoneId': resolvedDuotoneClass,
						}}
					/>
				</div>
			</BlockContextProvider>
		</div>
	);
};
/**
 * @param {Object}   props               Component props.
 * @param {Object}   props.context       Block context.
 * @param {string}   props.clientId      Block client ID.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Block attributes setter.
 * @return {Element}              The rendered component.
 */
export default function Edit({ attributes, setAttributes, context, clientId }) {
	const vpContext = useVideopackContext(attributes, context, {
		excludeHoverTrigger: true,
	});
	const vpData = useVideopackData();

	const [options, setOptions] = useState({});
	const { updateBlockAttributes } = useDispatch('core/block-editor');
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
	} = useSelect(
		(select) => {
			const { getBlocks, getBlockAttributes, getBlockRootClientId } =
				select('core/block-editor');
			const { isSavingPost, isAutosavingPost, getCurrentPostId } =
				select('core/editor');

			const parentId = getBlockRootClientId(clientId);
			const blocks = getBlocks(clientId) || [];

			const parentAttrs = parentId ? getBlockAttributes(parentId) : {};

			const parentBlocks = parentId ? getBlocks(parentId) : [];
			const hasPagination = parentBlocks.some(
				(b) => b.name === 'videopack/pagination'
			);

			// Helper to find a block by name recursively in the inner blocks tree
			const findBlockRecursive = (blockList, names) => {
				const nameArray = Array.isArray(names) ? names : [names];
				for (const block of blockList) {
					if (nameArray.includes(block.name)) {
						return block;
					}
					if (block.innerBlocks && block.innerBlocks.length > 0) {
						const found = findBlockRecursive(
							block.innerBlocks,
							nameArray
						);
						if (found) {
							return found;
						}
					}
				}
				return null;
			};

			const childBlocks = findBlockRecursive(blocks, [
				'videopack/thumbnail',
				'videopack/player-container',
			]);

			const presetDuotone =
				attributes?.style?.color?.duotone ||
				attributes?.duotone ||
				parentAttrs?.duotone ||
				parentAttrs?.style?.color?.duotone ||
				childBlocks?.attributes?.duotone ||
				childBlocks?.attributes?.style?.color?.duotone;

			const isEditingAll = !!parentAttrs.isEditingAllPages;

			return {
				effectiveDuotone: presetDuotone,
				inheritedDuotone:
					parentAttrs?.duotone ||
					parentAttrs?.style?.color?.duotone ||
					childBlocks?.attributes?.style?.color?.duotone ||
					childBlocks?.attributes?.duotone,
				previewPostId: getCurrentPostId(),
				isSaving: isSavingPost ? isSavingPost() : false,
				isAutosaving: isAutosavingPost ? isAutosavingPost() : false,
				parentAttributes: parentAttrs,
				hasPaginationBlock: hasPagination,
				isEditingAllPages: isEditingAll,
				parentClientId: parentId,
			};
		},
		[clientId, attributes?.duotone, attributes?.style?.color?.duotone]
	);

	useEffect(() => {
		getSettings().then((response) => {
			setOptions(response);
		});
	}, []);

	// We get query-related attributes from the parent collection block via context.
	const queryAttributes = useMemo(
		() => ({
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
					context['videopack/currentPage'] ||
					1,
			prioritizePostData: vpContext.resolved.prioritizePostData,
		}),
		[context, isEditingAllPages, vpContext.resolved, vpContext.currentPage]
	);

	const queryData = useVideoQuery(
		vpData.videos && vpData.videos.length > 0 ? null : queryAttributes,
		previewPostId
	);
	const {
		videoResults: queryVideos,
		isResolving: isResolvingQuery,
		totalResults,
		maxNumPages,
	} = queryData;
	const parentVideos = vpData.videos || context['videopack/videos'];
	const videos =
		parentVideos && parentVideos.length > 0 ? parentVideos : queryVideos;
	const totalResultsCount =
		parentVideos && parentVideos.length > 0
			? parentVideos.length
			: totalResults;
	const totalPagesCount =
		parentVideos && parentVideos.length > 0 ? 1 : maxNumPages;
	const templateBlocks = useSelect(
		(select) =>
			clientId ? select('core/block-editor').getBlocks(clientId) : [],
		[clientId]
	);

	const previewVideos = queryVideos;
	const isPreviewResolving = isResolvingQuery;

	const layout = context['videopack/layout'] || 'grid';
	const columns = context['videopack/columns'] || 3;

	const presetDuotoneClass = useMemo(() => {
		if (typeof effectiveDuotone === 'string') {
			return `wp-duotone-${effectiveDuotone.replace('var:preset|duotone|', '')}`;
		}
		return '';
	}, [effectiveDuotone]);

	const blockProps = useBlockProps({
		className: `videopack-video-loop layout-${layout} columns-${columns} ${
			isPreviewResolving && !isSaving && !isAutosaving
				? 'has-loading-state'
				: ''
		} ${isEditingAllPages ? 'is-editing-all-pages' : ''}`,
	});

	// Find the duotone class that Gutenberg has applied to our block props.
	const duotoneClass = useMemo(() => {
		const classes = blockProps.className?.split(' ') || [];
		return classes.find((c) => c.startsWith('wp-duotone-'));
	}, [blockProps.className]);

	const computedStyle = {};
	if (columns && layout === 'grid') {
		computedStyle['--videopack-collection-columns'] = columns;
	}

	// Universal Solution: Fetch the actual attachment records to hydrate the store.
	// This ensures that BlockEdit and any inner blocks have the 'real' data they need.
	const videoIds = useMemo(() => {
		return (previewVideos || [])
			.map((v) => v.attachment_id)
			.filter(Boolean);
	}, [previewVideos]);

	useSelect(
		(select) => {
			if (!videoIds.length) {
				return null;
			}
			return select('core').getEntityRecords('postType', 'attachment', {
				include: videoIds,
				per_page: -1,
			});
		},
		[videoIds]
	);

	// Synchronize child/parent duotone attributes to the Loop block itself
	// so that Gutenberg applies the necessary classes and SVG filters to the Loop wrapper.
	useEffect(() => {
		const loopDuotone =
			attributes.style?.color?.duotone || attributes.duotone;

		// 1. If we have a new inherited duotone, adopt it.
		if (
			inheritedDuotone &&
			JSON.stringify(inheritedDuotone) !== JSON.stringify(loopDuotone)
		) {
			if (Array.isArray(inheritedDuotone)) {
				setAttributes({
					style: {
						...attributes.style,
						color: {
							...attributes.style?.color,
							duotone: inheritedDuotone,
						},
					},
				});
			} else {
				setAttributes({ duotone: inheritedDuotone });
			}
		}

		// 2. If the inheritance was JUST cleared, and our Loop still has that exact value, clear it.
		// This prevents "sticky" attributes while allowing local Loop-level filters to persist.
		const wasInherited =
			prevInheritedDuotone.current &&
			JSON.stringify(loopDuotone) ===
				JSON.stringify(prevInheritedDuotone.current);
		if (!inheritedDuotone && wasInherited) {
			setAttributes({
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
			});
		}

		// Update our tracker for the next render
		prevInheritedDuotone.current = inheritedDuotone;
	}, [inheritedDuotone, attributes.duotone, attributes.style, setAttributes]);

	// Pass-through: resolve the duotone class by checking local settings then inherited ones.
	const resolvedDuotoneClass = useMemo(() => {
		return duotoneClass || presetDuotoneClass || '';
	}, [duotoneClass, presetDuotoneClass]);

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
					currentInclude = (response.videos || []).map((v) =>
						v.attachment_id.toString()
					);
				} catch {
					currentInclude = (videos || []).map((v) =>
						v.attachment_id.toString()
					);
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
			previewPostId,
		]
	);

	const handleAddVideo = useCallback(async () => {
		let currentInclude = queryAttributes.gallery_include
			? queryAttributes.gallery_include.split(',').map((id) => id.trim())
			: [];

		// If we're not already in manual mode, we need to fetch ALL current IDs
		// from the server to ensure we don't lose items on other pages when freezing.
		if (queryAttributes.gallery_source !== 'manual') {
			try {
				const response = await getVideoGallery({
					...queryAttributes,
					gallery_id: queryAttributes.gallery_id || previewPostId,
					gallery_per_page: -1, // Get all IDs
					page_number: undefined, // Remove page limit
					gallery_pagination: false,
				});
				currentInclude = (response.videos || []).map((v) =>
					v.attachment_id.toString()
				);
			} catch {
				// Fallback to current page results if fetch fails
				currentInclude = (videos || []).map((v) =>
					v.attachment_id.toString()
				);
			}
		} else {
			// Already manual
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
		previewPostId,
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
							gallery_id:
								queryAttributes.gallery_id || previewPostId,
							gallery_per_page: -1,
							page_number: undefined,
							gallery_pagination: false,
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
		]
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
		const targetPostId =
			vpContext.resolved.prioritizePostData && video.parent_id
				? video.parent_id
				: video.attachment_id || video.id;
		const targetPostType =
			vpContext.resolved.prioritizePostData && video.parent_id
				? 'post'
				: 'attachment';

		return previewBlocks.map((block, index) => {
			const {
				name,
				attributes: blockAttrs,
				innerBlocks,
				clientId: blockClientId,
			} = block;
			const itemKey = `${video.attachment_id || video.id}-${
				blockClientId || name
			}-${index}`;

			// If it's a Videopack block we have in our registry, use the high-perf visual component.
			if (name.startsWith('videopack/')) {
				const currentFlags = { ...parentFlags };
				if (name === 'videopack/thumbnail') {
					currentFlags['videopack/isInsideThumbnail'] = true;
					currentFlags.isInsideThumbnail = true; // Keep for backward compatibility in some components
					currentFlags.downloadlink = false;
					currentFlags.embedcode = false;
				}
				if (name === 'videopack/player-container') {
					currentFlags['videopack/isInsidePlayerContainer'] = true;
					currentFlags.isInsidePlayerContainer = true;
				}
				if (name === 'videopack/player') {
					currentFlags['videopack/isInsidePlayerOverlay'] = true;
					currentFlags['videopack/isInsidePlayerContainer'] = true;
					currentFlags.isInsidePlayerOverlay = true;
					currentFlags.isInsidePlayerContainer = true;
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
						video={video}
						{...currentFlags}
						resolvedDuotoneClass={resolvedDuotoneClass}
						context={{
							...previewContext,
							...currentFlags,
							'videopack/isInsideThumbnail':
								currentFlags.isInsideThumbnail,
							'videopack/isInsidePlayerOverlay':
								currentFlags.isInsidePlayerOverlay,
							'videopack/isInsidePlayerContainer':
								currentFlags.isInsidePlayerContainer,
							'videopack/downloadlink': currentFlags.downloadlink,
							'videopack/embedcode': currentFlags.embedcode,
							'videopack/postId': targetPostId,
							'videopack/postType': targetPostType,
							'videopack/attachmentId':
								video.attachment_id || video.id,
							'videopack/parentPostId': video.parent_id,
							'videopack/title': video.title,
							'videopack/caption': video.caption,
							'videopack/embedlink':
								video.embed_url ||
								video.player_vars?.full_player_html ||
								'',
							'videopack/views': video.starts,
							'videopack/duration':
								video.duration || video.player_vars?.duration,
							'videopack/loopDuotoneId': resolvedDuotoneClass,
						}}
					>
						{(() => {
							let blocksToRender = innerBlocks || [];

							// If innerBlocks are empty for a container, try to hydrate from default templates
							if (blocksToRender.length === 0) {
								const globalOpts =
									videopack_config?.options || {};
								if (name === 'videopack/player-container') {
									blocksToRender = [
										{
											name: 'videopack/player',
											attributes: {},
											innerBlocks: [],
										},
									];
									if (globalOpts.views !== false) {
										blocksToRender.push({
											name: 'videopack/view-count',
											attributes: {},
											innerBlocks: [],
										});
									}
								} else if (name === 'videopack/player') {
									blocksToRender = [];
									const showTitleBar = !!(
										globalOpts.overlay_title ||
										globalOpts.downloadlink ||
										globalOpts.embedcode
									);
									if (showTitleBar) {
										blocksToRender.push({
											name: 'videopack/title',
											attributes: {},
											innerBlocks: [],
										});
									}
									if (globalOpts.watermark) {
										blocksToRender.push({
											name: 'videopack/watermark',
											attributes: {},
											innerBlocks: [],
										});
									}
								}
							}

							return blocksToRender.length > 0
								? renderBlockPreview(
										blocksToRender,
										video,
										previewContext,
										currentFlags
									)
								: null;
						})()}
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
					resolvedDuotoneClass={resolvedDuotoneClass}
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
				{presetDuotoneClass && (
					<style>
						{`
							.${presetDuotoneClass} .vjs-poster,
							.${presetDuotoneClass} .vjs-poster img,
							.${presetDuotoneClass} .mejs-poster,
							.${presetDuotoneClass} .mejs-poster img,
							.${presetDuotoneClass} .videopack-thumbnail {
								filter: url(#${presetDuotoneClass}) !important;
							}
							.${presetDuotoneClass} .vjs-poster .vjs-poster,
							.${presetDuotoneClass} .mejs-poster .mejs-poster {
								filter: none !important;
							}
							.${presetDuotoneClass} .wp-block-videopack-player-container,
							.${presetDuotoneClass} .wp-block-videopack-thumbnail,
							.${presetDuotoneClass} [class*="wp-duotone-"] {
								filter: none !important;
							}
						`}
					</style>
				)}
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
									const targetPostId =
										vpContext.resolved.prioritizePostData &&
										video.parent_id
											? video.parent_id
											: video.attachment_id || video.id;
									const targetPostType =
										vpContext.resolved.prioritizePostData &&
										video.parent_id
											? 'post'
											: 'attachment';

									return (
										<SortableItem
											key={
												video.attachment_id || video.id
											}
											id={video.attachment_id || video.id}
											isEditableTemplate={
												isEditableTemplate
											}
											isPreview={
												vpContext.resolved.isPreview ||
												isTrue(
													context[
														'videopack/isPreview'
													]
												)
											}
											onRemove={handleRemoveItem}
											onEdit={handleEditItem}
											onAddVideo={handleAddVideo}
											isHoveringGallery={false}
										>
											<BlockContextProvider
												value={{
													...context,
													...vpContext.sharedContext,
													postId: targetPostId,
													postType: targetPostType,
													'videopack/postId':
														targetPostId,
													'videopack/postType':
														targetPostType,
													'videopack/attachmentId':
														video.attachment_id ||
														video.id,
													'videopack/title':
														video.title,
													'videopack/caption':
														video.caption,
													'videopack/views':
														video.views ||
														video.starts ||
														video.meta?.[
															'_videopack-meta'
														]?.starts,
													'videopack/duration':
														video.duration ||
														video.meta?.[
															'_videopack-meta'
														]?.duration,
													'videopack/embedlink':
														video.embed_url ||
														video.player_vars
															?.full_player_html ||
														'',
													'videopack/parentPostId':
														video.parent_id,
													'videopack/totalPages':
														totalPagesCount,
													'videopack/totalResults':
														totalResultsCount,
													'videopack/loopDuotoneId':
														resolvedDuotoneClass,
												}}
											>
												<div
													className={
														resolvedDuotoneClass
													}
												>
													{isEditableTemplate &&
													!vpContext.resolved
														.isPreview &&
													!isTrue(
														context[
															'videopack/isPreview'
														]
													) ? (
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
												</div>
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
