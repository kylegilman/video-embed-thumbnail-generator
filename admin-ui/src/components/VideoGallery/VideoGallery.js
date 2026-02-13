import { getVideoGallery } from '../../utils/utils';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { Placeholder, Spinner, Icon } from '@wordpress/components';
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
} from '@dnd-kit/sortable';
import GalleryItem from './GalleryItem';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import './VideoGallery.scss';

const VideoGallery = ({
	attributes,
	setAttributes,
	isEditing,
	onRemoveItem,
	onEditItem,
}) => {
	const {
		gallery_id,
		gallery_pagination,
		gallery_per_page,
		gallery_columns,
		gallery_orderby,
		gallery_order,
		gallery_include,
		gallery_exclude,
		gallery_end,
		gallery_source,
		gallery_category,
		gallery_tag,
	} = attributes;

	const [galleryVideos, setGalleryVideos] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [galleryPage, setGalleryPage] = useState(1);
	const [openVideo, setOpenVideo] = useState(null);
	const [currentVideoIndex, setCurrentVideoIndex] = useState(null);
	const [openVideoAttributes, setOpenVideoAttributes] = useState(attributes);
	const [currentVideoPlayer, setCurrentVideoPlayer] = useState(null);
	const [isPlayerReady, setIsPlayerReady] = useState(true);
	const [isHovering, setIsHovering] = useState(false);
	const [galleryVersion, setGalleryVersion] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	function handleDragEnd(event) {
		const { active, over } = event;

		if (active && over && active.id !== over.id) {
			setGalleryVideos((items) => {
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
			page_number: galleryPage,
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
				setGalleryVideos(response.videos);
			})
			.catch((error) => {
				if (error.status === 404 || (error.data && error.data.status === 404)) {
					setTotalPages(0);
					setGalleryVideos([]);
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
		galleryPage,
		galleryVersion,
	]);

	useEffect(() => {
		if (!gallery_pagination) {
			setTotalPages(1);
			setGalleryPage(1);
		}
	}, [gallery_pagination]);

	useEffect(() => {
		if (currentVideoIndex !== null && galleryVideos.length > 0) {
			setOpenVideo(galleryVideos[currentVideoIndex]);
		}
	}, [galleryVideos, currentVideoIndex]);

	const closeVideo = useCallback(() => {
		setOpenVideo(null);
		setCurrentVideoIndex(null);
	}, []);

	const handleNavigationArrowClick = useCallback(
		(videoIndex) => {
			if (isPlayerReady) {
				setIsPlayerReady(false);
			}

			if (videoIndex > galleryVideos.length - 1 && totalPages > 1) {
				setGalleryPage(galleryPage + 1);
				setCurrentVideoIndex(0);
			} else if (videoIndex < 0 && galleryPage > 1) {
				setGalleryPage(galleryPage - 1);
				setCurrentVideoIndex(galleryVideos.length - 1);
			} else {
				setOpenVideo(galleryVideos[videoIndex]);
				setCurrentVideoIndex(videoIndex);
			}
		},
		[isPlayerReady, galleryVideos, totalPages, galleryPage]
	);

	useEffect(() => {
		const handleNavigationKeyPress = (e) => {
			if (e.key === 'Escape') {
				closeVideo();
			}

			if (
				e.key === 'ArrowRight' &&
				currentVideoIndex < galleryVideos.length - 1
			) {
				handleNavigationArrowClick(currentVideoIndex + 1);
			}

			if (e.key === 'ArrowLeft' && currentVideoIndex > 0) {
				handleNavigationArrowClick(currentVideoIndex - 1);
			}
		};

		if (openVideo) {
			setOpenVideoAttributes({
				...attributes,
				...openVideo?.player_vars,
				autoplay: true,
			});
			document.addEventListener('keydown', handleNavigationKeyPress);
		} else {
			setOpenVideoAttributes(attributes);
			document.removeEventListener('keydown', handleNavigationKeyPress);
		}

		return () => {
			document.removeEventListener('keydown', handleNavigationKeyPress);
		};
	}, [
		openVideo,
		currentVideoIndex,
		galleryVideos,
		attributes,
		closeVideo,
		handleNavigationArrowClick,
	]);

	const handleVideoClick = (event) => {
		event.stopPropagation();
	};

	const handleVideoPlayerReady = useCallback(
		(player) => {
			setCurrentVideoPlayer(player);
			setIsPlayerReady(true);

			player.addEventListener('ended', () => {
				if (gallery_end === 'next') {
					handleNavigationArrowClick(currentVideoIndex + 1);
				}
				if (gallery_end === 'close') {
					closeVideo();
				}
			});
		},
		[gallery_end, currentVideoIndex, handleNavigationArrowClick, closeVideo]
	);

	const handleEditItem = (oldAttachmentId, newAttachment) => {
		if (oldAttachmentId === newAttachment.id) {
			setGalleryVersion((v) => v + 1);
			return;
		}

		onEditItem(oldAttachmentId, newAttachment, galleryVideos);
	};

	const openMediaModalForNewVideos = () => {
		const frame = window.wp.media({
			title: __( 'Add Videos to Gallery', 'video-embed-thumbnail-generator' ),
			button: {
				text: __( 'Add to Gallery', 'video-embed-thumbnail-generator' ),
			},
			multiple: 'add',
			library: {
				type: 'video',
			},
		});

		frame.on('select', () => {
			const selection = frame.state().get('selection');
			const newAttachmentIds = selection.map(
				(attachment) => attachment.id
			);
			const currentInclude = gallery_include
				? gallery_include.split(',')
				: [];
			const newGalleryInclude = [
				...currentInclude,
				...newAttachmentIds,
			].join(',');
			setAttributes({ gallery_include: newGalleryInclude });
		});

		frame.open();
	};

	const GalleryPagination = () => {
		const buttons = Array.from({ length: totalPages }, (_, i) => i + 1);

		return (
			<div className="videopack-gallery-pagination">
				<button
					className={`videopack-pagination-arrow${
						galleryPage > 1 ? '' : ' videopack-hidden'
					}`}
					onClick={() => {
						setGalleryPage(galleryPage - 1);
					}}
				>
					<span>{'«'}</span>
				</button>
				{buttons.map((pageNumber) => (
					<div key={pageNumber} className="videopack-page-number-div">
						<button
							onClick={() => setGalleryPage(pageNumber)}
							className={`videopack-page-number${
								pageNumber === galleryPage
									? ' current-page'
									: ''
							}`}
							disabled={pageNumber === galleryPage}
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
						galleryPage < totalPages ? '' : ' videopack-hidden'
					}`}
					onClick={() => {
						setGalleryPage(galleryPage + 1);
					}}
				>
					<span>{'»'}</span>
				</button>
			</div>
		);
	};

	return (
		<div
			className="videopack-gallery-wrapper"
			style={
				gallery_columns > 0
					? { '--gallery-columns': gallery_columns }
					: {}
			}
			onMouseEnter={() => !openVideo && setIsHovering(true)}
			onMouseLeave={() => !openVideo && setIsHovering(false)}
		>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={galleryVideos.map((video) => video.attachment_id)}
					strategy={rectSortingStrategy}
				>
					<div
						className="videopack-gallery-items"
						style={
							gallery_columns > 0
								? { '--gallery-columns': gallery_columns }
								: {}
						}
					>
						{isLoading ? (
							<div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '20px' }}>
								<Spinner />
							</div>
						) : galleryVideos && galleryVideos.length > 0 ? (
							galleryVideos.map((videoRecord, index) => (
								<GalleryItem
									key={videoRecord.attachment_id}
									attributes={attributes}
									videoRecord={videoRecord}
									setOpenVideo={setOpenVideo}
									videoIndex={index}
									setCurrentVideoIndex={setCurrentVideoIndex}
									isEditing={isEditing}
									onRemove={onRemoveItem}
									onEdit={handleEditItem}
									isLastItem={
										index === galleryVideos.length - 1
									}
									onAddVideo={openMediaModalForNewVideos}
									isHoveringGallery={isHovering}
								/>
							))
						) : (
							isEditing && (
								<div style={{ gridColumn: '1 / -1' }}>
									<Placeholder
										icon="format-video"
										label={__( 'No videos found', 'video-embed-thumbnail-generator' )}
										instructions={__( 'Try adjusting your query settings.', 'video-embed-thumbnail-generator' )}
									/>
								</div>
							)
						)}
					</div>
				</SortableContext>
			</DndContext>
			{totalPages > 1 && <GalleryPagination />}
			{openVideo && (
				<div className="videopack-modal-overlay is-visible" onClick={closeVideo}>
					<div
						className="videopack-modal-container"
						onClick={handleVideoClick}
					>
						<button
							type="button"
							className="modal-navigation modal-close videopack-icons cross"
							title={__( 'Close', 'video-embed-thumbnail-generator' )}
							onClick={closeVideo}
						/>
						{(currentVideoIndex < galleryVideos.length - 1 ||
							totalPages > galleryPage) && (
							<button
								type="button"
								className="modal-navigation modal-next videopack-icons right-arrow"
								title={__( 'Next', 'video-embed-thumbnail-generator' )}
								onClick={() => {
									handleNavigationArrowClick(
										currentVideoIndex + 1
									);
								}}
							/>
						)}
						{(currentVideoIndex > 0 || galleryPage > 1) && (
							<button
								type="button"
								className="modal-navigation modal-previous videopack-icons left-arrow"
								title={__( 'Previous', 'video-embed-thumbnail-generator' )}
								onClick={() => {
									handleNavigationArrowClick(
										currentVideoIndex - 1
									);
								}}
							/>
						)}
						<div className="modal-content">
							{openVideoAttributes && (
								<VideoPlayer
									key={openVideoAttributes?.src}
									attributes={openVideoAttributes}
									onReady={handleVideoPlayerReady}
								/>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default VideoGallery;
