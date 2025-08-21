/* global Image */

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
import { getFilename } from '@wordpress/url';
import {
	uploadThumbnail,
	saveAllThumbnails,
	setPosterImage,
	generateThumbnail,
} from '../../utils/utils';

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
		attributes.total_thumbnails || videoData?.total_thumbnails || options.total_thumbnails;
	const thumbVideoPanel = useRef();
	const videoRef = useRef();
	const currentThumb = useRef();
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
		const ffmpegExists = window.videopack.settings.ffmpeg_exists;
		const browserThumbnailsEnabled =
			window.videopack.settings.browser_thumbnails;

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
		const ffmpegExists = window.videopack.settings.ffmpeg_exists;

		const timePoints = [...Array(thumbsInt)].map((_, i) => {
			let movieoffset =
				((i + 1) / (thumbsInt + 1)) * videoRef.current.duration;
			if (type === 'random') {
				const randomOffset = Math.floor(
					Math.random() * (videoRef.current.duration / thumbsInt)
				);
				movieoffset = Math.max(movieoffset - randomOffset, 0);
			}
			return movieoffset;
		});

		const processNextThumbnail = async (index) => {
			if (index >= thumbsInt) {
				videoRef.current.removeEventListener(
					'timeupdate',
					timeupdateListener
				);
				setIsSaving(false);
				return;
			}

			videoRef.current.currentTime = timePoints[index];
		};

		const timeupdateListener = async () => {
			let thumb;
			try {
				const canvas = await drawCanvasThumb();
				thumb = {
					src: canvas.toDataURL(),
					type: 'canvas',
					canvasObject: canvas,
				};
				newThumbCanvases.push(thumb);
				setThumbChoices([...newThumbCanvases]);
				processNextThumbnail(newThumbCanvases.length);
			} catch (error) {
				console.error('Error generating canvas thumbnail:', error);
				if (ffmpegExists) {
					console.warn(
						'Falling back to FFmpeg for thumbnail generation.'
					);
					try {
						const response = await generateThumb(
							newThumbCanvases.length + 1,
							type
						);
						thumb = {
							src: response.real_thumb_url,
							type: 'ffmpeg',
						};
						newThumbCanvases.push(thumb);
						setThumbChoices([...newThumbCanvases]);
						processNextThumbnail(newThumbCanvases.length);
					} catch (ffmpegError) {
						console.error(
							'FFmpeg fallback also failed:',
							ffmpegError
						);
						// Display a user-friendly error message if both methods fail
						// For now, just log and stop
						videoRef.current.removeEventListener(
							'timeupdate',
							timeupdateListener
						);
						setIsSaving(false);
					}
				} else {
					console.error(
						'Browser thumbnail generation failed and FFmpeg is not available.'
					);
					// Display a user-friendly error message
					videoRef.current.removeEventListener(
						'timeupdate',
						timeupdateListener
					);
					setIsSaving(false);
				}
			}
		};

		videoRef.current.addEventListener('timeupdate', timeupdateListener);
		processNextThumbnail(0); // Start the process
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

	const drawCanvasThumb = async () => {
		const canvas = document.createElement('canvas');
		canvas.width = videoRef.current.videoWidth;
		canvas.height = videoRef.current.videoHeight;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

		if (options?.ffmpeg_thumb_watermark?.url) {
			try {
				const watermarkCanvas = drawWatermarkOnCanvas(canvas);
				return watermarkCanvas;
			} catch (error) {
				console.error('Error drawing watermark:', error);
			}
		} else {
			return canvas;
		}
	};

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
			const postName = getFilename(src);
			const uploadPromises = thumbChoices.map((thumb) => {
				return new Promise((resolve, reject) => {
					thumb.canvasObject.toBlob(async (blob) => {
						try {
							const formData = new FormData();
							formData.append('file', blob, 'thumbnail.jpg');
							formData.append('attachment_id', id);
							formData.append('post_name', postName);

							// Don't need the response for "save all"
							await uploadThumbnail(formData);
							resolve();
						} catch (error) {
							reject(error);
						}
					}, 'image/jpeg');
				});
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

	function drawWatermarkOnCanvas(canvas) {
		return new Promise(async (resolve, reject) => {
			try {
				if (!options?.ffmpeg_thumb_watermark?.url) {
					reject(new Error('No thumbnail watermark set'));
				}
				const ctx = canvas.getContext('2d');
				const watermarkImage = new Image();
				const { url, scale, align, x, valign, y } =
					options.ffmpeg_thumb_watermark;

				watermarkImage.crossOrigin = 'Anonymous';
				watermarkImage.src = url;

				watermarkImage.onload = () => {
					const canvasWidth = canvas.width;
					const canvasHeight = canvas.height;
					const watermarkWidth = (canvasWidth * scale) / 100;
					const watermarkHeight = (canvasHeight * scale) / 100;

					const horizontalOffset = (canvasWidth * x) / 100;
					const verticalOffset = (canvasHeight * y) / 100;

					let xPos, yPos;

					switch (align) {
						case 'left':
							xPos = horizontalOffset;
							break;
						case 'center':
							xPos =
								(canvasWidth - watermarkWidth) / 2 +
								horizontalOffset;
							break;
						case 'right':
							xPos =
								canvasWidth - watermarkWidth - horizontalOffset;
							break;
						default:
							reject(
								new Error(
									__('Invalid horizontal alignment provided')
								)
							);
							return;
					}

					switch (valign) {
						case 'top':
							yPos = verticalOffset;
							break;
						case 'center':
							yPos =
								(canvasHeight - watermarkHeight) / 2 +
								verticalOffset;
							break;
						case 'bottom':
							yPos =
								canvasHeight - watermarkHeight - verticalOffset;
							break;
						default:
							reject(
								new Error(
									__('Invalid vertical alignment provided')
								)
							);
							return;
					}

					ctx.drawImage(
						watermarkImage,
						xPos,
						yPos,
						watermarkWidth,
						watermarkHeight
					);
					resolve(canvas);
				};

				watermarkImage.onerror = () => {
					reject(new Error(__('Failed to load watermark image')));
				};
			} catch (error) {
				reject(error);
			}
		});
	}

	const setCanvasAsPoster = async (canvasObject) => {
		setIsSaving(true);
		try {
			const blob = await new Promise((resolve) =>
				canvasObject.toBlob(resolve, 'image/jpeg')
			);

			const formData = new FormData();
			formData.append('file', blob, 'thumbnail.jpg');
			formData.append('attachment_id', id);
			const postName = getFilename(src);
			formData.append('post_name', postName);

			const response = await uploadThumbnail(formData);

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
					...attachment?.meta?.['_videopack-meta'],
					poster: new_poster,
				};
			}

			await attachment?.edit({
				featured_media: new_poster_id ? Number(new_poster_id) : null,
				meta: metaData,
			});
			await attachment?.save();

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
		const canvas = await drawCanvasThumb(); // Await the canvas object (no index for single frame)
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
			<PanelBody title={__('Thumbnails')}>
				{poster && (
					<img
						className="videopack-current-thumbnail"
						src={poster}
						alt={__('Current Thumbnail')}
					/>
				)}
				<BaseControl className="editor-video-poster-control">
					<BaseControl.VisualLabel>
						{__('Video Thumbnail')}
					</BaseControl.VisualLabel>
					<MediaUpload
						title={__('Select video thumbnail')}
						onSelect={onSelectPoster}
						allowedTypes={VIDEO_POSTER_ALLOWED_MEDIA_TYPES}
						render={({ open }) => (
							<Button
								variant="secondary"
								onClick={open}
								ref={posterImageButton}
							>
								{!poster ? __('Select') : __('Replace')}
							</Button>
						)}
					/>
					{!!poster && (
						<Button onClick={onRemovePoster} variant="tertiary">
							{__('Remove')}
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
					{__('Generate')}
				</Button>
				<Button
					variant="secondary"
					onClick={() => handleGenerate('random')}
					className="videopack-generate"
					disabled={isSaving}
				>
					{__('Random')}
				</Button>
				{thumbChoices.length > 0 && (
					<Button
						variant="primary"
						onClick={handleSaveAllThumbnails}
						disabled={isSaving}
					>
						{__('Save All')}
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
									title={__('Save and set thumbnail')}
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
							{__('Choose From Video')}
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
							{__('Use this frame')}
						</Button>
						{isSaving && <Spinner />}
					</div>
				</div>
			</PanelBody>
		</div>
	);
};

export default Thumbnails;
