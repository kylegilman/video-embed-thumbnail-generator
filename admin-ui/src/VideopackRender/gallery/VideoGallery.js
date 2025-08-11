import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import GalleryItem from './GalleryItem';
import VideoPlayer from '../player/VideoPlayer';

const VideoGallery = ({ attributes }) => {
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
	} = attributes;

	const [galleryVideos, setGalleryVideos] = useState(null);
	const [totalPages, setTotalPages] = useState(1);
	const [galleryPage, setGalleryPage] = useState(1);
	const [openVideo, setOpenVideo] = useState(null);
	const [currentVideoIndex, setCurrentVideoIndex] = useState(null);
	const [openVideoAttributes, setOpenVideoAttributes] = useState(attributes);
	const [currentVideoPlayer, setCurrentVideoPlayer] = useState(null);
	const [isPlayerReady, setIsPlayerReady] = useState(true);

	useEffect(() => {
		if (gallery_orderby === 'menu_order') {
			gallery_orderby = 'menu_order ID';
		} else if (gallery_orderby === 'rand') {
			gallery_orderby = 'RAND(' + Math.round(Math.random() * 10000) + ')';
		}

		const args = {
			gallery_orderby,
			gallery_order,
			gallery_per_page:
				gallery_pagination !== true || isNaN(gallery_per_page)
					? -1
					: gallery_per_page,
			page_number: galleryPage,
			gallery_id,
			gallery_include,
		};

		apiFetch({
			path: addQueryArgs('/videopack/v1/video_gallery', args),
			method: 'GET',
		})
			.then((response) => {
				setTotalPages(response.max_num_pages);
				setGalleryVideos(response.videos);
			})
			.catch((error) => {
				console.error('Error fetching videos:', error);
			});
	}, [
		gallery_id,
		gallery_pagination,
		gallery_per_page,
		gallery_orderby,
		gallery_order,
		gallery_include,
		gallery_exclude,
		galleryPage,
	]);

	useEffect(() => {
		if (!gallery_pagination) {
			setTotalPages(1);
			setGalleryPage(1);
		}
	}, [gallery_pagination]);

	useEffect(() => {
		if (currentVideoIndex !== null) {
			setOpenVideo(galleryVideos[currentVideoIndex]);
		}
	}, [galleryVideos]);

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
	}, [openVideo]);

	const closeVideo = () => {
		setOpenVideo(null);
		setCurrentVideoIndex(null);
	};

	const handleNavigationArrowClick = (videoIndex) => {
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
	};

	const handleVideoClick = (event) => {
		event.stopPropagation();
	};

	const handleVideoPlayerReady = (player) => {
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
					<span>{'<'}</span>
				</button>
				{buttons.map((pageNumber) => (
					<>
						<button
							key={pageNumber}
							onClick={() => setGalleryPage(pageNumber)}
							className={`videopack-page-number${pageNumber === galleryPage ? ' current-page' : ''}`}
							disabled={pageNumber === galleryPage}
						>
							<span>{pageNumber}</span>
						</button>
						<span className="videopack-pagination-separator">
							{pageNumber === totalPages ? '' : '|'}
						</span>
					</>
				))}
				<button
					className={`videopack-pagination-arrow${
						galleryPage < totalPages ? '' : ' videopack-hidden'
					}`}
					onClick={() => {
						setGalleryPage(galleryPage + 1);
					}}
				>
					<span>{'>'}</span>
				</button>
			</div>
		);
	};

	return (
		<>
			<div
				className="videopack-gallery-wrapper"
				style={
					gallery_columns > 0
						? { '--gallery-columns': gallery_columns }
						: {}
				}
			>
				{galleryVideos &&
					galleryVideos.map((videoRecord, index) => (
						<GalleryItem
							key={videoRecord.attachment_id}
							attributes={attributes}
							videoRecord={videoRecord}
							setOpenVideo={setOpenVideo}
							videoIndex={index}
							setCurrentVideoIndex={setCurrentVideoIndex}
						/>
					))}
			</div>
			{totalPages > 1 && <GalleryPagination />}
			{openVideo && (
				<div className="videopack-modal-overlay" onClick={closeVideo}>
					<div
						className="videopack-modal-container"
						onClick={handleVideoClick}
					>
						<button
							type="button"
							className="modal-navigation modal-close videopack-icons cross"
							title={__('Close')}
							onClick={closeVideo}
						/>
						{(currentVideoIndex < galleryVideos.length - 1 ||
							totalPages > galleryPage) && (
							<button
								type="button"
								className="modal-navigation modal-next videopack-icons right-arrow"
								title={__('Next')}
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
								title={__('Previous')}
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
		</>
	);
};

export default VideoGallery;
