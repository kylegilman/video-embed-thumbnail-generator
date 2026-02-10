/* global Image, videopack_config */

import {
	BaseControl,
	Button,
	Dashicon,
	Icon,
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

import { chevronUp, chevronDown } from '@wordpress/icons';
import './Thumbnails.scss';

const Thumbnails = ({
	setAttributes,
	attributes,
	videoData, // Changed from attachment
	options = {},
}) => {
	const { id, src, poster, poster_id, isExternal } = attributes;
	const total_thumbnails =
		attributes.total_thumbnails ||
		videoData?.record?.total_thumbnails ||
		options.total_thumbnails;
	const thumbVideoPanel = useRef();
	const videoRef = useRef();
	const posterImageButton = useRef();
	const [isPlaying, setIsPlaying] = useState(false);
	const [isOpened, setIsOpened] = useState(false);
	const [currentTime, setCurrentTime] = useState(false);
	const [thumbChoices, setThumbChoices] = useState([]);
	const [isSaving, setIsSaving] = useState(false);

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
			for (let i = 1; i <= Number(total_thumbnails); i++) {
				const response = await generateThumb(i, type);
				const thumb = {
					src: response.real_thumb_url,
					type: 'ffmpeg',
				};
				newThumbImages.push(thumb);
				setThumbChoices([...newThumbImages]); // Update incrementally
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

		const timePoints = calculateTimecodes(
			videoRef.current.duration,
			thumbsInt,
			{ random: type === 'random' }
		);

		for (const time of timePoints) {
			let thumb;
			try {
				const canvas = await captureVideoFrame(
					videoRef.current,
					time,
					options?.ffmpeg_thumb_watermark
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
							newThumbCanvases.length + 1,
							type
						);
						thumb = {
							src: response.real_thumb_url,
							type: 'ffmpeg'
						};
						newThumbCanvases.push(thumb);
						setThumbChoices([...newThumbCanvases]);
					} catch (ffmpegError) {}
				}
			}
		}
		setIsSaving(false);
	});

	// function to toggle video playback
	const togglePlayback = () => {
		if (videoRef.current?.paused) {
			videoRef.current.play();
			setIsPlaying(true);
		} else {
			videoRef.current?.pause();
			setIsPlaying(false);
		}
	};

	const pauseVideo = () => {
		videoRef.current.pause();
		setIsPlaying(false);
	};

	const playVideo = () => {
		videoRef.current.play();
		setIsPlaying(true);
	};

	// function to handle slider changes
	const handleSliderChange = (value) => {
		videoRef.current.currentTime = value;
		setCurrentTime(value);
	};

	useEffect(() => {
		const handleTimeUpdate = () => {
			setCurrentTime(videoRef.current.currentTime); // update currentTime state variable
		};

		videoRef.current?.addEventListener('timeupdate', handleTimeUpdate);
		return () => {
			videoRef.current?.removeEventListener(
				'timeupdate',
				handleTimeUpdate
			);
		};
	}, []);

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
				return createThumbnailFromCanvas(thumb.canvasObject, id, src);
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
				await saveAllThumbnails(id, thumbUrls);
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
				src
			);

			setPosterData(response.thumb_url, response.thumb_id);
		} catch (error) {
			console.error('Error uploading thumbnail:', error);
		} finally {
			setIsSaving(false);
		}
	};

	const setPosterData = async (new_poster, new_poster_id) => {
		try {
			const metaData = {};
			if (new_poster) {
				// Only include if new_poster has a value
				metaData['_kgflashmediaplayer-poster'] = new_poster;
				metaData['_kgflashmediaplayer-poster-id'] =
					Number(new_poster_id);
				metaData['_videopack-meta'] = {
					...videoData?.record?.meta?.['_videopack-meta'],
					poster: new_poster,
				};
			}

			await videoData?.edit({
				featured_media: new_poster_id ? Number(new_poster_id) : null,
				meta: metaData,
			});
			await videoData?.save();

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
			const response = await setPosterImage(id, thumb_url);
			setPosterData(response.thumb_url, response.thumb_id);
		} catch (error) {
			console.error(error);
		}
	};

	const generateThumb = async (i, type) => {
		try {
			const response = await generateThumbnail(
				src,
				total_thumbnails,
				i,
				id,
				type
			);

			return response;
		} catch (error) {
			console.error(error);
		}
	};

	const handleVideoKeyboardControl = (event) => {
		event.stopImmediatePropagation();

		switch (event.code) {
			case 'Space': // spacebar
				togglePlayback();
				break;

			case 'ArrowLeft': // left
				pauseVideo();
				videoRef.current.currentTime =
					videoRef.current.currentTime - 0.042;
				break;

			case 'ArrowRight': // right
				pauseVideo();
				videoRef.current.currentTime =
					videoRef.current.currentTime + 0.042;
				break;

			case 'KeyJ': //j
				if (isPlaying) {
					videoRef.current.playbackRate = Math.max(
						0,
						videoRef.current.playbackRate - 1
					);
				}
				break;

			case 'KeyK': // k
				pauseVideo();
				break;

			case 'KeyL': //l
				if (isPlaying) {
					videoRef.current.playbackRate =
						videoRef.current.playbackRate + 1;
				}
				playVideo();
				break;

			default:
				return; // exit this handler for other keys
		}
		event.preventDefault(); // prevent the default action (scroll / move caret)
	};

	const handleUseThisFrame = async () => {
		setIsSaving(true);
		const canvas = await captureVideoFrame(
			videoRef.current,
			videoRef.current.currentTime,
			options?.ffmpeg_thumb_watermark
		);
		setCanvasAsPoster(canvas); // Pass the canvas object directly, index will be null
	};

	const handleToggleVideoPlayer = (event) => {
		event.preventDefault();
		const next = !isOpened;
		setIsOpened(next);
		if (next && thumbVideoPanel.current) {
			thumbVideoPanel.current.focus();
			thumbVideoPanel.current.addEventListener(
				'keydown',
				handleVideoKeyboardControl
			);
		} else {
			thumbVideoPanel.current.addEventListener(
				'keydown',
				handleVideoKeyboardControl
			);
		}
	};

	return (
		<div className="videopack-thumbnail-generator">
			<PanelBody title={__( 'Thumbnails', 'video-embed-thumbnail-generator' )}>
				{poster && (
					<img
						className="videopack-current-thumbnail"
						src={poster}
						alt={__( 'Current Thumbnail', 'video-embed-thumbnail-generator' )}
					/>
				)}
				<BaseControl className="editor-video-poster-control">
					<BaseControl.VisualLabel>
						{__( 'Video Thumbnail', 'video-embed-thumbnail-generator' )}
					</BaseControl.VisualLabel>
					<MediaUpload
						title={__( 'Select video thumbnail', 'video-embed-thumbnail-generator' )}
						onSelect={onSelectPoster}
						allowedTypes={VIDEO_POSTER_ALLOWED_MEDIA_TYPES}
						render={({ open }) => (
							<Button
								variant="secondary"
								onClick={open}
								ref={posterImageButton}
							>
								{!poster ? __( 'Select', 'video-embed-thumbnail-generator' ) : __( 'Replace', 'video-embed-thumbnail-generator' )}
							</Button>
						)}
					/>
					{!!poster && (
						<Button onClick={onRemovePoster} variant="tertiary">
							{__( 'Remove', 'video-embed-thumbnail-generator' )}
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
					{__( 'Generate', 'video-embed-thumbnail-generator' )}
				</Button>
				<Button
					variant="secondary"
					onClick={() => handleGenerate('random')}
					className="videopack-generate"
					disabled={isSaving}
				>
					{__( 'Random', 'video-embed-thumbnail-generator' )}
				</Button>
				{thumbChoices.length > 0 && (
					<Button
						variant="primary"
						onClick={handleSaveAllThumbnails}
						disabled={isSaving}
					>
						{__( 'Save All', 'video-embed-thumbnail-generator' )}
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
									title={__( 'Save and set thumbnail', 'video-embed-thumbnail-generator' )}
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
							{__( 'Choose From Video', 'video-embed-thumbnail-generator' )}
						</button>
					</h2>
					<div
						className={`videopack-thumb-video-panel spinner-container${
							isSaving ? ' saving' : ''
						}`}
						tabIndex={0}
						ref={thumbVideoPanel}
					>
						<video
							src={src}
							ref={videoRef}
							muted={true}
							preload="metadata"
							onClick={togglePlayback}
						/>
						<div className="videopack-thumb-video-controls">
							<Button
								className="videopack-play-pause"
								onClick={togglePlayback}
							>
								<Dashicon
									icon={
										isPlaying
											? 'controls-pause'
											: 'controls-play'
									}
								/>
							</Button>
							{!isNaN(videoRef.current?.duration) && (
								<RangeControl
									__nextHasNoMarginBottom
									min={0}
									max={videoRef.current.duration}
									step="any"
									initialPosition={0}
									value={videoRef.current.currentTime}
									onChange={handleSliderChange}
									className="videopack-thumbvideo-slider"
									type="slider"
								/>
							)}
						</div>
						<Button
							variant="secondary"
							onClick={handleUseThisFrame}
							className="videopack-use-this-frame"
							disabled={isSaving}
						>
							{__( 'Use this frame', 'video-embed-thumbnail-generator' )}
						</Button>
						{isSaving && <Spinner />}
					</div>
				</div>
			</PanelBody>
		</div>
	);
};

export default Thumbnails;
