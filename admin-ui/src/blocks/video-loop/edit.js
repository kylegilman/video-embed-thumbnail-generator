import {
	useBlockProps,
	InnerBlocks,
	BlockContextProvider,
	InspectorControls,
	__experimentalBlockPreview as BlockPreview,
} from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	Spinner,
	Button,
	Icon,
	PanelBody,
	SelectControl,
	RangeControl,
} from '@wordpress/components';
import { useMemo, useState, useEffect, useCallback } from '@wordpress/element';
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
import { VideoThumbnailPreview } from '../thumbnail/VideoThumbnailPreview';
import { VideoTitle } from '../video-title/edit';
import { VideoDuration } from '../video-duration/edit';
import { ViewCount } from '../view-count/edit';
import { PlayButton } from '../play-button/edit';
import { VideoWatermark } from '../video-watermark/edit';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer.js';
import { getSettings } from '../../api/settings';
import CollectionSettingsPanel from '../../components/InspectorControls/CollectionSettingsPanel';

const PREVIEW_COMPONENTS = {
	'videopack/videopack-video': ({ children, resolvedDuotoneClass }) => (
		<div
			className={`videopack-video-block-container videopack-wrapper ${
				resolvedDuotoneClass || ''
			}`.trim()}
		>
			{children}
		</div>
	),
	'videopack/thumbnail': VideoThumbnailPreview,
	'videopack/video-title': VideoTitle,
	'videopack/video-duration': VideoDuration,
	'videopack/view-count': ViewCount,
	'videopack/play-button': PlayButton,
	'videopack/video-watermark': VideoWatermark,
};

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
		<div
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
				title={__(
					'Drag to reorder',
					'video-embed-thumbnail-generator'
				)}
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
		</div>
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
export default function Edit({ context, clientId }) {
	const [options, setOptions] = useState({});
	const [isHovering, setIsHovering] = useState(false);
	const { updateBlockAttributes } = useDispatch('core/block-editor');

	const { parentClientId } = useSelect(
		(select) => ({
			parentClientId: select('core/block-editor').getBlockRootClientId(
				clientId
			),
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
		gallery_pagination: context['videopack/gallery_pagination'],
		gallery_per_page: context['videopack/gallery_per_page'],
		page_number: context['videopack/currentPage'] || 1,
	};

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
			const { getBlocks, getBlockAttributes } = select('core/block-editor');
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
				? `videopack-custom-duotone-${ thumbClientId.split( '-' )[ 0 ] }`
				: '',
		[ thumbClientId ]
	);

	// Final duotone class resolution
	const resolvedDuotoneClass =
		presetDuotoneClass || ( customDuotoneColors ? customFilterId : '' );

	// We fetch query data to power the live preview template
	const queryData = useVideoQuery(
		queryAttributes,
		previewPostId
	);
	const { videoResults, isResolving } = queryData;

	const layout = context['videopack/layout'] || 'grid';
	const columns = context['videopack/columns'] || 3;

	const blockProps = useBlockProps({
		className: `videopack-video-loop layout-${layout} columns-${columns} ${
			isResolving && !isSaving && !isAutosaving ? 'is-loading' : ''
		}`,
		onMouseEnter: () => setIsHovering(true),
		onMouseLeave: () => setIsHovering(false),
	});

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
		(oldId) => {
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
				const currentInclude = queryAttributes.gallery_include
					? queryAttributes.gallery_include
							.split(',')
							.map((id) => id.trim())
					: (videoResults || []).map((v) =>
							v.attachment_id.toString()
					  );

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
			queryAttributes.gallery_include,
			videoResults,
			parentClientId,
			updateBlockAttributes,
		]
	);

	const handleAddVideo = useCallback(() => {
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
			const currentInclude = queryAttributes.gallery_include
				? queryAttributes.gallery_include
						.split(',')
						.map((id) => id.trim())
				: (videoResults || []).map((v) => v.attachment_id.toString());

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
		queryAttributes.gallery_include,
		videoResults,
		parentClientId,
		updateBlockAttributes,
	]);

	const handleDragEnd = useCallback(
		(event) => {
			const { active, over } = event;
			if (active && over && active.id !== over.id) {
				const currentVideos = videoResults || [];
				const oldIndex = currentVideos.findIndex(
					(v) => v.attachment_id === active.id
				);
				const newIndex = currentVideos.findIndex(
					(v) => v.attachment_id === over.id
				);

				if (oldIndex !== -1 && newIndex !== -1) {
					const newVideos = arrayMove(
						currentVideos,
						oldIndex,
						newIndex
					);
					const newInclude = newVideos
						.map((v) => v.attachment_id)
						.join(',');

					updateBlockAttributes(parentClientId, {
						gallery_include: newInclude,
						gallery_orderby: 'include',
						gallery_source: 'manual',
					});
				}
			}
		},
		[videoResults, parentClientId, updateBlockAttributes]
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
		return previewBlocks.map((block) => {
			const {
				name,
				attributes: blockAttrs,
				innerBlocks,
				clientId: blockClientId,
			} = block;
			const itemKey = `${video.attachment_id || video.id}-${blockClientId}`;

			// If it's a Videopack block we have in our registry, use the high-perf visual component.
			const Component = PREVIEW_COMPONENTS[name];
			if (Component) {
				const currentFlags = { ...parentFlags };
				if (name === 'videopack/thumbnail') {
					currentFlags.isInsideThumbnail = true;
					currentFlags.downloadlink = false;
					currentFlags.embedcode = false;
				}
				// Standardized overlay detection for display components
				const isOverlay = !!currentFlags.isInsideThumbnail || !!currentFlags.isInsidePlayer;

				return (
					<Component
						key={itemKey}
						{...blockAttrs}
						attributes={blockAttrs}
						postId={video.attachment_id}
						isOverlay={isOverlay}
						{...currentFlags}
						resolvedDuotoneClass={resolvedDuotoneClass}
						context={{
							...previewContext,
							...currentFlags,
							'videopack/isInsideThumbnail': currentFlags.isInsideThumbnail,
							'videopack/isInsidePlayer': currentFlags.isInsidePlayer,
							'videopack/downloadlink': currentFlags.downloadlink,
							'videopack/embedcode': currentFlags.embedcode,
							'videopack/postId': video.attachment_id,
						}}
					>
						{innerBlocks?.length > 0 &&
							renderBlockPreview(
								innerBlocks,
								video,
								previewContext,
								currentFlags
							)}
					</Component>
				);
			}

			// Core/Player engine fallback
			if (name === 'videopack/video-player-engine') {
				return (
					<div key={itemKey} className="videopack-video-preview">
						<VideoPlayer
							attributes={{
								...options,
								...blockAttrs,
								id: video.attachment_id,
								title: video.title,
								sources: video.player_vars?.sources,
								poster: video.poster_url,
								starts: video.player_vars?.starts,
								'videopack/isInsidePlayer': true,
							}}
							isSelected={false}
						>
							{innerBlocks?.length > 0 &&
								renderBlockPreview(
									innerBlocks,
									video,
									previewContext,
									{ isInsidePlayer: true }
								)}
						</VideoPlayer>
					</div>
				);
			}

			// Fallback for any other block (Core blocks, 3rd party, etc)
			if (!BlockPreview) {
				return null;
			}

			return (
				<BlockPreview
					key={itemKey}
					blocks={[block]}
					context={{
						...previewContext,
						'videopack/postId': video.attachment_id,
					}}
				/>
			);
		});
	};

	const videos = videoResults || [];

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={__(
						'Layout Settings',
						'video-embed-thumbnail-generator'
					)}
				>
					<SelectControl
						label={__('Layout', 'video-embed-thumbnail-generator')}
						value={layout}
						options={[
							{
								label: __('Grid', 'video-embed-thumbnail-generator'),
								value: 'grid',
							},
							{
								label: __('List', 'video-embed-thumbnail-generator'),
								value: 'list',
							},
						]}
						onChange={(value) =>
							updateBlockAttributes(parentClientId, {
								layout: value,
							})
						}
					/>
					{layout === 'grid' && (
						<RangeControl
							label={__('Columns', 'video-embed-thumbnail-generator')}
							value={columns}
							onChange={(value) =>
								updateBlockAttributes(parentClientId, {
									columns: value,
								})
							}
							min={1}
							max={6}
						/>
					)}
				</PanelBody>

				<CollectionSettingsPanel
					attributes={parentAttributes}
					setAttributes={(newAttrs) =>
						updateBlockAttributes(parentClientId, newAttrs)
					}
					queryData={{ ...queryData, totalPages: context['videopack/totalPages'] }}
					options={options}
					showGalleryOptions={true}
					showPaginationToggle={false}
					showLayoutSettings={false}
					showPaginationSettings={true}
					hasPaginationBlock={hasPaginationBlock}
				/>
			</InspectorControls>

			<div {...blockProps}>
				<CustomDuotoneFilter
					colors={customDuotoneColors}
					id={customFilterId}
				/>

				{isResolving && videos.length === 0 && (
					<div className="videopack-collection-loading">
						<Spinner />
					</div>
				)}

				{!isResolving && videos.length === 0 && (
					<div className="videopack-no-videos">
						{__(
							'No videos found for this source.',
							'video-embed-thumbnail-generator'
						)}
					</div>
				)}

				{isResolving && !isSaving && !isAutosaving && videos.length > 0 && (
					<div className="videopack-loop-loading-overlay">
						<Spinner />
					</div>
				)}

				{videos.length > 0 && (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={videos.map((v) => v.attachment_id)}
							strategy={rectSortingStrategy}
						>
							<div className="videopack-collection-grid">
								{videos.map((video, index) => {
									const isEditableTemplate = index === 0;

									return (
										<SortableItem
											key={video.attachment_id || `temp-${index}`}
											id={video.attachment_id}
											isEditableTemplate={isEditableTemplate}
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
													'videopack/postId': video.attachment_id,
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
														context
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
			</div>
		</>
	);
}
