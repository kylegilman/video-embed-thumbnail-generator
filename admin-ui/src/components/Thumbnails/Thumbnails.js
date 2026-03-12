/* global Image, videopack_config */

import {
	BaseControl,
	Button,
	Dashicon,
	Icon,
	Modal,
	PanelBody,
	RangeControl,
	Spinner,
	TextControl,
} from '@wordpress/components';
import { useCallback, useRef, useEffect, useState } from '@wordpress/element';
import { MediaUpload } from '@wordpress/media-utils';
import { __ } from '@wordpress/i18n';
import {
	saveAllThumbnails,
	setPosterImage,
	generateThumbnail,
	createThumbnailFromCanvas,
} from '../../utils/utils';
import {
	captureVideoFrame,
	calculateTimecodes,
} from '../../utils/video-capture';

import { chevronUp, chevronDown, external } from '@wordpress/icons';
import './Thumbnails.scss';

const VideoPlayerInner = ({
	videoRef,
	panelRef,
	src,
	isPlaying,
	currentTime,
	isSaving,
	togglePlayback,
	handleSliderChange,
	handleUseThisFrame,
	onPopOut,
	onKeyDown,
	isModal = false,
}) => {
	const localPanelRef = useRef();
	const containerRef = panelRef || localPanelRef;
	const [duration, setDuration] = useState(videoRef.current?.duration || 0);

	const onLoadedMetadata = (event) => {
		setDuration(event.target.duration);
	};

	useEffect(() => {
		if (videoRef.current?.duration) {
			setDuration(videoRef.current.duration);
		}
	}, [videoRef.current?.duration]);

	useEffect(() => {
		if ((isModal || containerRef === panelRef) && containerRef?.current) {
			// Trigger a small delay to ensure the panel is visible/ready before focusing
			const timer = setTimeout(() => {
				containerRef.current?.focus();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isModal, panelRef]);

	return (
		<div
			className={`videopack-thumb-video-panel spinner-container${isSaving ? ' saving' : ''
				} ${isModal ? 'is-modal' : ''}`}
			tabIndex={0}
			ref={containerRef}
			onKeyDown={onKeyDown}
		>
			<video
				src={src}
				ref={videoRef}
				muted={true}
				preload="metadata"
				onClick={() => togglePlayback(videoRef)}
				onLoadedMetadata={onLoadedMetadata}
			/>
			<div className="videopack-thumb-video-controls">
				<Button
					className="videopack-play-pause"
					onClick={() => togglePlayback(videoRef)}
				>
					<Dashicon
						icon={isPlaying ? 'controls-pause' : 'controls-play'}
					/>
				</Button>
				{duration > 0 && (
					<RangeControl
						__nextHasNoMarginBottom
						min={0}
						max={duration}
						step="any"
						initialPosition={0}
						value={currentTime || 0}
						onChange={(val) => handleSliderChange(val, videoRef)}
						className="videopack-thumbvideo-slider"
						type="slider"
					/>
				)}
				{!isModal && onPopOut && (
					<Button
						className="videopack-popout"
						onClick={onPopOut}
						icon={external}
						label={__(
							'Open in larger window',
							'video-embed-thumbnail-generator'
						)}
						showTooltip={true}
					/>
				)}
			</div>
			<Button
				variant="secondary"
				onClick={() => handleUseThisFrame(videoRef)}
				className="videopack-use-this-frame"
				disabled={isSaving}
			>
				{__('Use this frame', 'video-embed-thumbnail-generator')}
			</Button>
			{isSaving && <Spinner />}
		</div>
	);
};

const Thumbnails = ({
	setAttributes,
	attributes,
	videoData, // Changed from attachment
	options = {},
	parentId = 0,
	src: propSrc, // Accept src as a separate prop
}) => {
	const { id, poster } = attributes;
	const src = propSrc || attributes.src;
	const total_thumbnails =
		attributes.total_thumbnails ||
		videoData?.record?.total_thumbnails ||
		options.total_thumbnails;
	const thumbVideoPanel = useRef();
	const videoRef = useRef();
	const modalVideoRef = useRef();
	const posterImageButton = useRef();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isOpened, setIsOpened] = useState(false);
	const [currentTime, setCurrentTime] = useState(false);
	const [thumbChoices, setThumbChoices] = useState([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const VIDEO_POSTER_ALLOWED_MEDIA_TYPES = ['image'];

	useEffect(() => {
		if (window.mejs && window.mejs.players && poster) {
			// Find the MediaElement.js player within the media modal
			const mejsContainer = document.querySelector(
				'.media-modal .mejs-container, .wp_attachment_holder .mejs-container'
			);
			if (mejsContainer) {
				const mejsId = mejsContainer.id;
				if (mejsId && window.mejs.players[mejsId]) {
					const player = window.mejs.players[mejsId];
					player.setPoster(poster);
				}
			}
		}
	}, [poster]);

	function onSelectPoster(image) {
		setAttributes({
			...attributes,
			poster: image.url,
			poster_id: Number(image.id),
		});
	}

	function onRemovePoster() {
		setAttributes({ ...attributes, poster: undefined });

		// Move focus back to the Media Upload button.
		posterImageButton.current.focus();
	}

	const handleGenerate = async (type = 'generate') => {
		setIsSaving(true);
		const ffmpegExists = videopack_config.ffmpeg_exists;
		const browserThumbnailsEnabled = videopack_config.browser_thumbnails;

		if (!browserThumbnailsEnabled && ffmpegExists) {
			// Browser thumbnails explicitly disabled, use FFmpeg directly
			const newThumbImages = [];
			let workingId = Number(id);
			for (let i = 1; i <= Number(total_thumbnails); i++) {
				const response = await generateThumb(i, type, workingId);
				if (response?.attachment_id && workingId === 0) {
					workingId = parseInt(response.attachment_id, 10) || 0;
					setAttributes({
						...attributes,
						id: workingId,
					});
				}
				const thumb = {
					src: response ? response.real_thumb_url : null,
					type: 'ffmpeg',
				};
				if (thumb.src) {
					newThumbImages.push(thumb);
					setThumbChoices([...newThumbImages]); // Update incrementally
				}
			}
			setIsSaving(false);
		} else {
			// Attempt browser-based generation
			generateThumbCanvases(type);
		}
	};

	const generateThumbCanvases = useCallback(async (type) => {
		const thumbsInt = Number(total_thumbnails);
		const newThumbCanvases = [];
		const ffmpegExists = videopack_config.ffmpeg_exists;
		let workingId = parseInt(id, 10) || 0;

		const timePoints = calculateTimecodes(
			videoRef.current.duration,
			thumbsInt,
			{ random: type === 'random' }
		);

		for (let i = 0; i < timePoints.length; i++) {
			const time = timePoints[i];
			const index = i + 1;
			let thumb;
			try {
				const canvas = await captureVideoFrame(
					videoRef.current,
					time,
					options?.ffmpeg_thumb_watermark || {}
				);
				thumb = {
					src: canvas.toDataURL(),
					type: 'canvas',
					canvasObject: canvas,
				};
				newThumbCanvases.push(thumb);
				setThumbChoices([...newThumbCanvases]); // Update incrementally
			} catch (error) {
				console.error('Error generating canvas thumbnail:', error);
				if (ffmpegExists) {
					try {
						const response = await generateThumb(
							index,
							type,
							workingId
						);
						if (response?.attachment_id && workingId === 0) {
							workingId = parseInt(response.attachment_id, 10) || 0;
							setAttributes({
								...attributes,
								id: workingId,
							});
						}
						if (response?.real_thumb_url) {
							thumb = {
								src: response.real_thumb_url,
								type: 'ffmpeg',
							};
							newThumbCanvases.push(thumb);
							setThumbChoices([...newThumbCanvases]);
						}
					} catch (ffmpegError) {
						console.error('Error in FFmpeg fallback:', ffmpegError);
					}
				}
			}
		}
		setIsSaving(false);
	});

	// function to toggle video playback
	const togglePlayback = (ref = videoRef) => {
		if (ref.current?.paused) {
			ref.current.play();
			setIsPlaying(true);
		} else {
			ref.current?.pause();
			setIsPlaying(false);
		}
	};

	const pauseVideo = (ref = videoRef) => {
		ref.current?.pause();
		setIsPlaying(false);
	};

	const playVideo = (ref = videoRef) => {
		ref.current?.play();
		setIsPlaying(true);
	};

	// function to handle slider changes
	const handleSliderChange = (value, ref = videoRef) => {
		if (ref.current) {
			ref.current.currentTime = value;
		}
		setCurrentTime(value);
	};

	useEffect(() => {
		const handleTimeUpdate = (event) => {
			setCurrentTime(event.target.currentTime); // update currentTime state variable
		};

		const mainVideo = videoRef.current;
		const modalVideo = modalVideoRef.current;

		mainVideo?.addEventListener('timeupdate', handleTimeUpdate);
		modalVideo?.addEventListener('timeupdate', handleTimeUpdate);

		return () => {
			mainVideo?.removeEventListener('timeupdate', handleTimeUpdate);
			modalVideo?.removeEventListener('timeupdate', handleTimeUpdate);
		};
	}, [isModalOpen]); // Re-attach when modal state changes to catch modalVideoRef

	useEffect(() => {
		if (isModalOpen && modalVideoRef.current && videoRef.current) {
			modalVideoRef.current.currentTime = videoRef.current.currentTime;
		}
	}, [isModalOpen]);

	const handleSaveThumbnail = (event, thumb) => {
		event.currentTarget.classList.add('saving');
		setIsSaving(true);
		if (thumb.type === 'ffmpeg') {
			setImgAsPoster(thumb.src);
		} else {
			setCanvasAsPoster(thumb.canvasObject);
		}
	};

	const handleSaveAllThumbnails = async () => {
		setIsSaving(true); // Show spinner for the whole operation
		const firstThumbType = thumbChoices[0]?.type; // Assuming all generated thumbs are of the same type

		if (firstThumbType === 'canvas') {
			const uploadPromises = thumbChoices.map((thumb) => {
				return createThumbnailFromCanvas(
					thumb.canvasObject,
					id,
					src,
					parentId
				);
			});

			try {
				await Promise.all(uploadPromises);
			} catch (error) {
				console.error('Error saving all canvas thumbnails:', error);
			}
			setThumbChoices([]);
		} else if (firstThumbType === 'ffmpeg') {
			// For FFmpeg thumbnails, send their temporary URLs to the server to be saved
			const thumbUrls = thumbChoices.map((thumb) => thumb.src);
			try {
				const response = await saveAllThumbnails(
					id,
					thumbUrls,
					parentId,
					src
				);
				const firstResult = response?.[0];
				if (firstResult?.attachment_id && Number(id) === 0) {
					setAttributes({
						...attributes,
						id: Number(firstResult.attachment_id),
					});
				}
				setThumbChoices([]); // Clear choices after saving
			} catch (error) {
				console.error('Error saving all FFmpeg thumbnails:', error);
			}
		}
		setIsSaving(false); // Hide spinner after all operations complete
	};

	const setCanvasAsPoster = async (canvasObject) => {
		setIsSaving(true);
		try {
			const response = await createThumbnailFromCanvas(
				canvasObject,
				id,
				src,
				parentId
			);

			setPosterData(response.thumb_url, response.thumb_id);
		} catch (error) {
			console.error('Error uploading thumbnail:', error);
		} finally {
			setIsSaving(false);
		}
	};

	const setPosterData = async (
		new_poster,
		new_poster_id,
		new_attachment_id
	) => {
		try {
			const metaData = {};
			if (new_poster) {
				// Only include if new_poster has a value
				metaData['_kgflashmediaplayer-poster'] = new_poster;
				metaData['_kgflashmediaplayer-poster-id'] =
					Number(new_poster_id);

				const existingMeta =
					videoData?.record?.meta?.['_videopack-meta'] || {};
				metaData['_videopack-meta'] = {
					...existingMeta,
					poster: new_poster,
					poster_id: Number(new_poster_id),
				};
			}

			// If we just created the attachment, we need to update the attributes first.
			if (new_attachment_id && Number(id) === 0) {
				setAttributes({
					id: Number(new_attachment_id),
					poster: new_poster,
					poster_id: Number(new_poster_id),
				});
			} else if (new_poster) {
				setAttributes({
					poster: new_poster,
					poster_id: Number(new_poster_id),
				});
			}

			if (videoData?.edit) {
				await videoData.edit({
					featured_media: new_poster_id
						? Number(new_poster_id)
						: null,
					meta: metaData,
				});
				await videoData.save();
			}

			// Refresh the media library grid to show the updated thumbnail.
			if (wp.media && wp.media.frame) {
				if (
					wp.media.frame.content.get() &&
					wp.media.frame.content.get().collection
				) {
					const collection = wp.media.frame.content.get().collection;
					collection.props.set({ ignore: new Date().getTime() });
				} else if (wp.media.frame.library) {
					// Fallback for different states of the media modal.
					wp.media.frame.library.props.set({
						ignore: new Date().getTime(),
					});
				}
			}

			setAttributes({
				...attributes,
				poster: new_poster,
				poster_id: new_poster_id,
			});
			setThumbChoices([]);
			setIsSaving(false);
		} catch (error) {
			console.error('Error updating attachment:', error);
			setIsSaving(false);
		}
	};

	const setImgAsPoster = async (thumb_url) => {
		try {
			const response = await setPosterImage(id, thumb_url, parentId, src);
			setPosterData(
				response.thumb_url,
				response.thumb_id,
				response.attachment_id
			);
		} catch (error) {
			console.error(error);
		}
	};

	const generateThumb = async (i, type, forceId = null) => {
		try {
			const response = await generateThumbnail(
				src,
				total_thumbnails,
				i,
				forceId !== null ? forceId : id,
				type,
				parentId
			);

			return response;
		} catch (error) {
			console.error(error);
		}
	};

	const handleVideoKeyboardControl = (event, ref = videoRef) => {
		switch (event.code) {
			case 'Space': // spacebar
				event.preventDefault();
				event.stopPropagation();
				togglePlayback(ref);
				break;

			case 'ArrowLeft': // left
				event.preventDefault();
				event.stopPropagation();
				pauseVideo(ref);
				if (ref.current) {
					ref.current.currentTime = ref.current.currentTime - 0.042;
				}
				break;

			case 'ArrowRight': // right
				event.preventDefault();
				event.stopPropagation();
				pauseVideo(ref);
				if (ref.current) {
					ref.current.currentTime = ref.current.currentTime + 0.042;
				}
				break;

			case 'KeyJ': //j
				event.preventDefault();
				event.stopPropagation();
				if (isPlaying && ref.current) {
					ref.current.playbackRate = Math.max(
						0,
						ref.current.playbackRate - 1
					);
				}
				break;

			case 'KeyK': // k
				event.preventDefault();
				event.stopPropagation();
				pauseVideo(ref);
				break;

			case 'KeyL': //l
				event.preventDefault();
				event.stopPropagation();
				if (isPlaying && ref.current) {
					ref.current.playbackRate = ref.current.playbackRate + 1;
				}
				playVideo(ref);
				break;

			default:
				return; // exit this handler for other keys
		}
	};

	const handleUseThisFrame = async (ref = videoRef) => {
		setIsSaving(true);
		const canvas = await captureVideoFrame(
			ref.current,
			ref.current.currentTime,
			options?.ffmpeg_thumb_watermark || {}
		);
		setCanvasAsPoster(canvas); // Pass the canvas object directly, index will be null
	};

	const handlePopOut = (event) => {
		event.preventDefault();
		pauseVideo(videoRef);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		if (modalVideoRef.current && videoRef.current) {
			videoRef.current.currentTime = modalVideoRef.current.currentTime;
		}
		pauseVideo(modalVideoRef);
		setIsModalOpen(false);
	};

	const handleToggleVideoPlayer = (event) => {
		event.preventDefault();
		const next = !isOpened;
		setIsOpened(next);
		if (next && thumbVideoPanel.current) {
			// Trigger a small delay to ensure the panel is visible before focusing
			setTimeout(() => {
				thumbVideoPanel.current?.focus();
			}, 50);
		}
	};

	return (
		<div className="videopack-thumbnail-generator">
			<PanelBody
				title={__('Thumbnails', 'video-embed-thumbnail-generator')}
			>
				{poster && (
					<img
						className="videopack-current-thumbnail"
						src={poster}
						alt={__(
							'Current Thumbnail',
							'video-embed-thumbnail-generator'
						)}
					/>
				)}
				<BaseControl className="editor-video-poster-control">
					<BaseControl.VisualLabel>
						{__(
							'Video Thumbnail',
							'video-embed-thumbnail-generator'
						)}
					</BaseControl.VisualLabel>
					<MediaUpload
						title={__(
							'Select video thumbnail',
							'video-embed-thumbnail-generator'
						)}
						onSelect={onSelectPoster}
						allowedTypes={VIDEO_POSTER_ALLOWED_MEDIA_TYPES}
						render={({ open }) => (
							<Button
								variant="secondary"
								onClick={open}
								ref={posterImageButton}
							>
								{!poster
									? __(
										'Select',
										'video-embed-thumbnail-generator'
									)
									: __(
										'Replace',
										'video-embed-thumbnail-generator'
									)}
							</Button>
						)}
					/>
					{!!poster && (
						<Button onClick={onRemovePoster} variant="tertiary">
							{__('Remove', 'video-embed-thumbnail-generator')}
						</Button>
					)}
				</BaseControl>
				<TextControl // This is the UI control for total_thumbnails.
					value={total_thumbnails}
					onChange={(value) => {
						if (!value) {
							setAttributes({
								...attributes,
								total_thumbnails: '',
							});
						} else {
							setAttributes({
								...attributes,
								total_thumbnails: Number(value),
							});
						}
					}}
					className="videopack-total-thumbnails"
					disabled={isSaving}
				/>
				<Button
					variant="secondary"
					onClick={() => handleGenerate('generate')}
					className="videopack-generate"
					disabled={isSaving}
				>
					{__('Generate', 'video-embed-thumbnail-generator')}
				</Button>
				<Button
					variant="secondary"
					onClick={() => handleGenerate('random')}
					className="videopack-generate"
					disabled={isSaving}
				>
					{__('Random', 'video-embed-thumbnail-generator')}
				</Button>
				{thumbChoices.length > 0 && (
					<Button
						variant="primary"
						onClick={handleSaveAllThumbnails}
						disabled={isSaving}
					>
						{__('Save All', 'video-embed-thumbnail-generator')}
					</Button>
				)}
				{thumbChoices.length > 0 && (
					<div
						className={`videopack-thumbnail-holder${isSaving ? ' disabled' : ''}`}
					>
						{thumbChoices.map((thumb, index) => (
							<button
								type="button"
								className={
									'videopack-thumbnail spinner-container'
								}
								key={index}
								onClick={(event) => {
									handleSaveThumbnail(event, thumb, index);
								}}
							>
								<img
									src={thumb.src}
									alt={`Thumbnail ${index + 1}`}
									title={__(
										'Save and set thumbnail',
										'video-embed-thumbnail-generator'
									)}
								/>
								{isSaving && <Spinner />}
							</button>
						))}
					</div>
				)}
				<div
					className={`components-panel__body videopack-thumb-video ${isOpened ? 'is-opened' : ''}`}
				>
					<h2 className="components-panel__body-title">
						<button
							className="components-button components-panel__body-toggle"
							type="button"
							onClick={handleToggleVideoPlayer}
							aria-expanded={isOpened}
						>
							<span aria-hidden="true">
								<Icon
									className="components-panel__arrow"
									icon={isOpened ? chevronUp : chevronDown}
								/>
							</span>
							{__(
								'Choose From Video',
								'video-embed-thumbnail-generator'
							)}
						</button>
					</h2>
					<div
						className={`videopack-thumb-video-container ${isOpened ? 'is-opened' : ''}`}
					>
						<VideoPlayerInner
							videoRef={videoRef}
							panelRef={thumbVideoPanel}
							src={src}
							isPlaying={isPlaying}
							currentTime={currentTime}
							isSaving={isSaving}
							togglePlayback={togglePlayback}
							handleSliderChange={handleSliderChange}
							handleUseThisFrame={handleUseThisFrame}
							onPopOut={handlePopOut}
							onKeyDown={(e) =>
								handleVideoKeyboardControl(e, videoRef)
							}
						/>
					</div>
				</div>
				{isModalOpen && (
					<Modal
						title={__(
							'Choose From Video',
							'video-embed-thumbnail-generator'
						)}
						onRequestClose={handleCloseModal}
						className="videopack-video-modal"
						overlayClassName="videopack-video-modal-overlay"
					>
						<VideoPlayerInner
							videoRef={modalVideoRef}
							src={src}
							isPlaying={isPlaying}
							currentTime={currentTime}
							isSaving={isSaving}
							togglePlayback={togglePlayback}
							handleSliderChange={handleSliderChange}
							handleUseThisFrame={handleUseThisFrame}
							onKeyDown={(e) =>
								handleVideoKeyboardControl(e, modalVideoRef)
							}
							isModal={true}
						/>
					</Modal>
				)}
			</PanelBody>
		</div>
	);
};

export default Thumbnails;
