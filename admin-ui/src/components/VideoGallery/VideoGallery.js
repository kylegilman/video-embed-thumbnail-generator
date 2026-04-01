/**
 * A gallery component that manages a collection of videos with drag-and-drop support.
 */

import { getVideoGallery } from '../../api/gallery';
import { useEffect, useState, useCallback, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Placeholder, Spinner, Icon } from '@wordpress/components';
import { arrowLeft, arrowRight, close } from '@wordpress/icons';
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

const noop = () => {};

/**
 * VideoGallery component.
 *
 * @param {Object}   props                Component props.
 * @param {Object}   props.attributes     Block attributes.
 * @param {Function} props.setAttributes  Function to update block attributes.
 * @param {boolean}  props.isEditing      Whether the gallery is in editing mode.
 * @param {Function} props.onRemoveItem   Callback to remove a video item.
 * @param {Function} props.onEditItem     Callback to edit a video item.
 * @param {number}   props.galleryPage    Current gallery page.
 * @param {Function} props.setGalleryPage Function to update gallery page.
 * @param {number}   props.totalPages     Total number of gallery pages.
 * @param {Function} props.setTotalPages  Function to update total gallery pages.
 * @param {Function} props.onModalToggle  Callback when the modal state changes.
 * @return {Object} The VideoGallery component.
 */
const VideoGallery = ({
	attributes,
	setAttributes = noop,
	isEditing = false,
	onRemoveItem = noop,
	onEditItem = noop,
	galleryPage = 1,
	setGalleryPage = noop,
	totalPages = 1,
	setTotalPages = noop,
	onModalToggle = noop,
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
		videos,
		collection_video_limit,
		play_button_color,
		play_button_icon_color,
		title_color,
		title_background_color,
	} = attributes;

	const [galleryVideos, setGalleryVideos] = useState([]);
	const [openVideo, setOpenVideo] = useState(null);
	const [currentVideoIndex, setCurrentVideoIndex] = useState(null);

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

	const openVideoAttributes = useMemo(() => {
		if (!openVideo) {
			return null;
		}
		return {
			...attributes,
			...openVideo.player_vars,
			autoplay: true,
		};
	}, [attributes, openVideo]);

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
				!gallery_pagination || isNaN(gallery_per_page)
					? -1
					: gallery_per_page,
			page_number: galleryPage,
			gallery_id,
			gallery_include,
			gallery_exclude,
			gallery_source,
			gallery_category,
			gallery_tag,
			gallery_pagination,
			videos: videos !== undefined ? videos : collection_video_limit,
		};

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

		setIsLoading(true);
		getVideoGallery(args)
			.then((response) => {
				setTotalPages(response.max_num_pages);
				setGalleryVideos(response.videos);
			})
			.catch((error) => {
				if (
					error.status === 404 ||
					(error.data && error.data.status === 404)
				) {
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
		videos,
		collection_video_limit,
		galleryPage,
		galleryVersion,
		setTotalPages,
	]);

	useEffect(() => {
		if (!gallery_pagination) {
			if (setTotalPages) {
				setTotalPages(1);
			}
			setGalleryPage(1);
		}
	}, [gallery_pagination, setTotalPages, setGalleryPage]);

	useEffect(() => {
		if (currentVideoIndex !== null && galleryVideos.length > 0) {
			setOpenVideo(galleryVideos[currentVideoIndex]);
		}
	}, [galleryVideos, currentVideoIndex]);

	const closeVideo = useCallback(() => {
		setOpenVideo(null);
		setCurrentVideoIndex(null);
	}, []);

	useEffect(() => {
		onModalToggle(!!openVideo);
	}, [openVideo, onModalToggle]);

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
		[isPlayerReady, galleryVideos, totalPages, galleryPage, setGalleryPage]
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
			document.addEventListener('keydown', handleNavigationKeyPress);
		} else {
			document.removeEventListener('keydown', handleNavigationKeyPress);
		}

		return () => {
			document.removeEventListener('keydown', handleNavigationKeyPress);
		};
	}, [
		openVideo,
		currentVideoIndex,
		galleryVideos,
		closeVideo,
		handleNavigationArrowClick,
	]);

	const handleVideoClick = (event) => {
		event.stopPropagation();
	};

	const handleVideoPlayerReady = useCallback(
		(player) => {
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
			title: __(
				'Add Videos to Gallery',
				'video-embed-thumbnail-generator'
			),
			button: {
				text: __('Add to Gallery', 'video-embed-thumbnail-generator'),
			},
			multiple: 'add',
			library: {
				type: 'video',
			},
		});

		frame.on('select', () => {
			const selection = frame.state().get('selection');
			const newAttachmentIds = selection.map((attachment) =>
				attachment.id.toString()
			);

			let currentInclude = [];
			if (gallery_include) {
				currentInclude = gallery_include.split(',');
			} else if (galleryVideos) {
				currentInclude = galleryVideos.map((video) =>
					video.attachment_id.toString()
				);
			}

			const newGalleryInclude = [
				...new Set([...currentInclude, ...newAttachmentIds]),
			].join(',');

			setAttributes({
				gallery_include: newGalleryInclude,
				gallery_source: 'manual',
			});
		});

		frame.open();
	};

	const renderGalleryContent = () => {
		if (isLoading) {
			return (
				<div
					style={{
						gridColumn: '1 / -1',
						display: 'flex',
						justifyContent: 'center',
						padding: '20px',
					}}
				>
					<Spinner />
				</div>
			);
		}

		if (galleryVideos && galleryVideos.length > 0) {
			return galleryVideos.map((videoRecord, index) => (
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
					isLastItem={index === galleryVideos.length - 1}
					onAddVideo={openMediaModalForNewVideos}
					isHoveringGallery={isHovering}
				/>
			));
		}

		if (isEditing) {
			return (
				<div style={{ gridColumn: '1 / -1' }}>
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
				</div>
			);
		}
		return null;
	};

	const wrapperClasses = useMemo(() => {
		const classes = ['videopack-gallery-wrapper'];
		if (play_button_color) {
			classes.push('videopack-has-play-button-color');
		}
		if (play_button_icon_color) {
			classes.push('videopack-has-play-button-icon-color');
		}
		if (title_color) {
			classes.push('videopack-has-title-color');
		}
		if (title_background_color) {
			classes.push('videopack-has-title-background-color');
		}
		return classes.join(' ');
	}, [
		play_button_color,
		play_button_icon_color,
		title_color,
		title_background_color,
	]);

	const galleryStyles = useMemo(() => {
		const styles = {};
		const config = window.videopack_config || {};

		if (config.mejs_controls_svg) {
			styles['--videopack-mejs-controls-svg'] =
				`url(${config.mejs_controls_svg})`;
		}

		if (gallery_columns > 0) {
			styles['--gallery-columns'] = gallery_columns;
		}
		if (play_button_color) {
			styles['--videopack-play-button-color'] = play_button_color;
		}
		if (play_button_icon_color) {
			styles['--videopack-play-button-icon-color'] =
				play_button_icon_color;
		}
		if (title_color) {
			styles['--videopack-title-color'] = title_color;
		}
		if (title_background_color) {
			styles['--videopack-title-background-color'] =
				title_background_color;
		}
		return styles;
	}, [
		gallery_columns,
		play_button_color,
		play_button_icon_color,
		title_color,
		title_background_color,
	]);

	return (
		<div
			className={wrapperClasses}
			style={galleryStyles}
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
						{renderGalleryContent()}
					</div>
				</SortableContext>
			</DndContext>
			{openVideo && (
				<div
					className="videopack-modal-overlay is-visible"
					onClick={closeVideo}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							closeVideo();
						}
					}}
					role="button"
					tabIndex={0}
					aria-label={__(
						'Close Overlay',
						'video-embed-thumbnail-generator'
					)}
				>
					<div
						className="videopack-modal-container"
						onClick={handleVideoClick}
						onKeyDown={(e) => e.stopPropagation()}
						role="presentation"
					>
						<button
							type="button"
							className="modal-navigation modal-close"
							title={__(
								'Close',
								'video-embed-thumbnail-generator'
							)}
							onClick={closeVideo}
						>
							<Icon icon={close} />
						</button>
						<button
							type="button"
							className={`modal-navigation modal-next ${
								currentVideoIndex < galleryVideos.length - 1 ||
								totalPages > galleryPage
									? ''
									: 'is-hidden'
							}`}
							title={__(
								'Next',
								'video-embed-thumbnail-generator'
							)}
							onClick={() => {
								handleNavigationArrowClick(
									currentVideoIndex + 1
								);
							}}
						>
							<Icon icon={arrowRight} />
						</button>
						<button
							type="button"
							className={`modal-navigation modal-previous ${
								currentVideoIndex > 0 || galleryPage > 1
									? ''
									: 'is-hidden'
							}`}
							title={__(
								'Previous',
								'video-embed-thumbnail-generator'
							)}
							onClick={() => {
								handleNavigationArrowClick(
									currentVideoIndex - 1
								);
							}}
						>
							<Icon icon={arrowLeft} />
						</button>
						<div className="modal-content">
							{openVideoAttributes && (
								<VideoPlayer
									key={openVideo?.attachment_id}
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
