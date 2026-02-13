import { getVideoGallery } from '../../utils/utils';
import { useEffect, useState } from '@wordpress/element';
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

const VideoList = ({
	attributes,
	setAttributes,
	isEditing,
	options,
	isSelected,
	onRemoveItem,
	onEditItem,
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
	} = attributes;

	const [listVideos, setListVideos] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [listPage, setListPage] = useState(1);
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
			gallery_per_page:
				gallery_pagination !== true || isNaN(gallery_per_page)
					? -1
					: gallery_per_page,
			page_number: listPage,
			gallery_id,
			gallery_include,
			gallery_exclude,
			gallery_source,
			gallery_category,
			gallery_tag,
		};

		setIsLoading(true);
		getVideoGallery(args)
			.then((response) => {
				setTotalPages(response.max_num_pages);
				setListVideos(response.videos);
			})
			.catch((error) => {
				if (error.status === 404 || (error.data && error.data.status === 404)) {
					setTotalPages(0);
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
		listPage,
		refreshTrigger,
	]);

	useEffect(() => {
		if (!gallery_pagination) {
			setTotalPages(1);
			setListPage(1);
		}
	}, [gallery_pagination]);

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
			const newAttachment = frame.state().get('selection').first().toJSON();
			if (video.attachment_id === newAttachment.id) {
				setRefreshTrigger((v) => v + 1);
				return;
			}
			onEditItem(video.attachment_id, newAttachment, listVideos);
		});

		frame.open();
	};

	const Pagination = () => {
		const buttons = Array.from({ length: totalPages }, (_, i) => i + 1);

		return (
			<div className="videopack-gallery-pagination">
				<button
					className={`videopack-pagination-arrow${
						listPage > 1 ? '' : ' videopack-hidden'
					}`}
					onClick={() => {
						setListPage(listPage - 1);
					}}
				>
					<span>{'«'}</span>
				</button>
				{buttons.map((pageNumber) => (
					<div key={pageNumber} className="videopack-page-number-div">
						<button
							onClick={() => setListPage(pageNumber)}
							className={`videopack-page-number${
								pageNumber === listPage
									? ' current-page'
									: ''
							}`}
							disabled={pageNumber === listPage}
						>
							<span>{pageNumber}</span>
						</button>
						<span className="videopack-pagination-separator">
							{pageNumber === totalPages ? '' : '|'}
						</span>
					</div>
				))}
				<button
					className={`videopack-pagination-arrow${
						listPage < totalPages ? '' : ' videopack-hidden'
					}`}
					onClick={() => {
						setListPage(listPage + 1);
					}}
				>
					<span>{'»'}</span>
				</button>
			</div>
		);
	};

	return (
		<div className="videopack-video-list-wrapper">
			<div className="videopack-video-list">
				{isLoading ? (
					<div className="videopack-loading-container">
						<Spinner />
					</div>
				) : listVideos && listVideos.length > 0 ? (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={listVideos.map((video) => video.attachment_id)}
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
				) : (
					isEditing && (
						<Placeholder
							icon="format-video"
							label={__( 'No videos found', 'video-embed-thumbnail-generator' )}
							instructions={__( 'Try adjusting your query settings.', 'video-embed-thumbnail-generator' )}
						/>
					)
				)}
			</div>
			{totalPages > 1 && <Pagination />}
		</div>
	);
};

export default VideoList;
