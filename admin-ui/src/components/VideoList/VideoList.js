/**
 * A vertical list component for managing a collection of videos.
 */

import { getVideoGallery } from '../../api/gallery';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Placeholder, Spinner } from '@wordpress/components';
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
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import VideoListItem from './VideoListItem';
import './VideoList.scss';

const noop = () => {};

/**
 * VideoList component.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Callback to update attributes.
 * @param {boolean}  props.isEditing     Whether the list is in editing mode.
 * @param {Object}   props.options       Plugin options.
 * @param {boolean}  props.isSelected    Whether the list is selected.
 * @param {Function} props.onRemoveItem  Callback to remove a video item.
 * @param {Function} props.onEditItem    Callback to edit a video item.
 * @param {number}   props.currentPage   The current page number.
 * @return {Object} The VideoList component.
 */
const VideoList = ({
	attributes,
	setAttributes = noop,
	isEditing = false,
	options = {},
	isSelected = false,
	onRemoveItem = noop,
	onEditItem = noop,
	currentPage = 1,
}) => {
	const {
		gallery_id,
		gallery_pagination,
		gallery_per_page,
		gallery_orderby,
		gallery_order,
		gallery_include,
		gallery_exclude,
		gallery_source,
		gallery_category,
		gallery_tag,
		videos,
		collection_video_limit,
		title_color,
		title_background_color,
	} = attributes;

	const [listVideos, setListVideos] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showOverlay, setShowOverlay] = useState(!isSelected);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	function handleDragEnd(event) {
		const { active, over } = event;

		if (active && over && active.id !== over.id) {
			setListVideos((items) => {
				const oldIndex = items.findIndex(
					(item) => item.attachment_id === active.id
				);
				const newIndex = items.findIndex(
					(item) => item.attachment_id === over.id
				);
				const newItems = arrayMove(items, oldIndex, newIndex);

				const newGalleryInclude = newItems
					.map((video) => video.attachment_id)
					.join(',');
				setAttributes({
					gallery_include: newGalleryInclude,
					gallery_orderby: 'include',
				});

				return newItems;
			});
		}
	}

	useEffect(() => {
		setShowOverlay(!isSelected);
	}, [isSelected]);

	useEffect(() => {
		let new_gallery_orderby = gallery_orderby;
		if (new_gallery_orderby === 'menu_order') {
			new_gallery_orderby = 'menu_order ID';
		} else if (new_gallery_orderby === 'rand') {
			new_gallery_orderby =
				'RAND(' + Math.round(Math.random() * 10000) + ')';
		}

		const args = {
			gallery_orderby: new_gallery_orderby,
			gallery_order,
			gallery_pagination,
			gallery_per_page:
				!gallery_pagination || isNaN(gallery_per_page)
					? -1
					: gallery_per_page,
			page_number: currentPage,
			gallery_id,
			gallery_include,
			gallery_exclude,
			gallery_source,
			gallery_category,
			gallery_tag,
			videos: videos !== undefined ? videos : collection_video_limit,
		};

		// Last minute safety check for "current" source in TinyMCE/REST context.
		if (
			args.gallery_source === 'current' &&
			(!args.gallery_id ||
				args.gallery_id === '0' ||
				parseInt(args.gallery_id, 10) === 0)
		) {
			// Try to detect the post ID if it's missing.
			const detectedId =
				window.videopack_config?.postId ||
				window.wp?.media?.view?.settings?.post?.id ||
				document.getElementById('post_ID')?.value ||
				new URLSearchParams(window.location.search).get('post');

			if (detectedId) {
				args.gallery_id = detectedId;
			}
		}

		if (gallery_source === 'manual' && !gallery_include) {
			setIsLoading(false);
			return;
		}
		if (gallery_source === 'category' && !gallery_category) {
			setIsLoading(false);
			return;
		}
		if (gallery_source === 'tag' && !gallery_tag) {
			setIsLoading(false);
			return;
		}
		if (gallery_source === 'custom' && !gallery_id) {
			setIsLoading(false);
			return;
		}

		// eslint-disable-next-line no-console
		console.log('Videopack VideoList Query:', args);

		setIsLoading(true);
		getVideoGallery(args)
			.then((response) => {
				setListVideos(response.videos);
			})
			.catch((error) => {
				if (
					error.status === 404 ||
					(error.data && error.data.status === 404)
				) {
					setListVideos([]);
				} else {
					console.error('Error fetching videos:', error);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [
		gallery_id,
		gallery_pagination,
		gallery_per_page,
		gallery_orderby,
		gallery_order,
		gallery_include,
		gallery_exclude,
		gallery_source,
		gallery_category,
		gallery_tag,
		videos,
		collection_video_limit,
		currentPage,
		refreshTrigger,
	]);

	const openMediaModal = (video) => {
		const frame = window.wp.media({
			title: __('Edit Video', 'video-embed-thumbnail-generator'),
			button: {
				text: __('Update', 'video-embed-thumbnail-generator'),
			},
			multiple: false,
			library: {
				type: 'video',
			},
		});

		frame.on('open', () => {
			const selection = frame.state().get('selection');
			if (video.attachment_id) {
				const attachment = window.wp.media.attachment(
					video.attachment_id
				);
				attachment.fetch().done(() => {
					selection.add(attachment);
				});
			}
		});

		frame.on('select', () => {
			const newAttachment = frame
				.state()
				.get('selection')
				.first()
				.toJSON();
			if (video.attachment_id === newAttachment.id) {
				setRefreshTrigger((v) => v + 1);
				return;
			}
			onEditItem(video.attachment_id, newAttachment, listVideos);
		});

		frame.open();
	};

	const listStyles = useMemo(() => {
		const styles = {};
		if (title_color) {
			styles['--videopack-title-color'] = title_color;
		}
		if (title_background_color) {
			styles['--videopack-title-background-color'] =
				title_background_color;
		}
		return styles;
	}, [title_color, title_background_color]);

	return (
		<div className="videopack-video-list-wrapper" style={listStyles}>
			<div className="videopack-video-list">
				{isLoading && (
					<div className="videopack-loading-container">
						<Spinner />
					</div>
				)}
				{!isLoading && listVideos && listVideos.length > 0 && (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={listVideos.map(
								(video) => video.attachment_id
							)}
							strategy={verticalListSortingStrategy}
						>
							{listVideos.map((video) => (
								<VideoListItem
									key={video.attachment_id}
									video={video}
									attributes={attributes}
									options={options}
									isEditing={isEditing}
									showOverlay={showOverlay}
									onEdit={openMediaModal}
									onRemove={onRemoveItem}
								/>
							))}
						</SortableContext>
					</DndContext>
				)}
				{!isLoading &&
					(!listVideos || listVideos.length === 0) &&
					isEditing && (
						<Placeholder
							icon="format-video"
							label={__(
								'No videos found',
								'video-embed-thumbnail-generator'
							)}
							instructions={__(
								'Try adjusting your query settings.',
								'video-embed-thumbnail-generator'
							)}
						/>
					)}
			</div>
		</div>
	);
};

export default VideoList;
