/* global videopack_config */

import {
	BaseControl,
	Button,
	Icon,
	Modal,
	__experimentalNumberControl as NumberControl,
	PanelBody,
	Spinner,
	ToggleControl,
	Notice,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { applyFilters } from '@wordpress/hooks';
import { useCallback, useRef, useEffect, useState } from '@wordpress/element';
import { MediaUpload } from '@wordpress/media-utils';
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';
import {
	generateThumbnail,
	saveAllThumbnails,
	setPosterImage,
	createThumbnailFromCanvas,
} from '../../api/thumbnails';
import { getVideoFormats } from '../../api/gallery';
import { deleteFile } from '../../api/media';
import { enqueueJob, listJobs } from '../../api/jobs';
import {
	captureVideoFrame,
	calculateTimecodes,
} from '../../utils/video-capture';

import { chevronUp, chevronDown } from '@wordpress/icons';

import VideoPlayerInner from './VideoPlayerInner';

const Thumbnails = ({
	setAttributes,
	attributes,
	videoData,
	options = {},
	parentId = 0,
	src: propSrc,
	isProbing,
	probedMetadata,
}) => {
	const { id, poster: rawPoster } = attributes;
	const resolvedPoster =
		videoData?.record?.videopack?.poster ||
		videoData?.record?.meta?.['_videopack-meta']?.poster ||
		rawPoster;
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
	const [spriteMessage, setSpriteMessage] = useState(null);
	const [activeJobs, setActiveJobs] = useState([]);
	const [existingSprite, setExistingSprite] = useState(null); // { id, url, status }
	const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showFailedNotice, setShowFailedNotice] = useState(true);

	const fetchSpriteStatus = useCallback(async () => {
		if (!id || !src) {
			return;
		}
		try {
			const formats = await getVideoFormats(id, src, probedMetadata);
			const spriteFormat = formats.thumbnail_sprite;
			console.log('Sprite detection:', { id, spriteFormat });
			if (spriteFormat && spriteFormat.exists) {
				setExistingSprite({
					id: spriteFormat.id,
					url: spriteFormat.url,
					status: spriteFormat.status,
				});
			} else {
				setExistingSprite(null);
			}
		} catch (error) {
			console.error('Error fetching sprite status:', error);
		}
	}, [id, src, probedMetadata]);

	// Poll for active thumbnail jobs if any exist
	useEffect(() => {
		let pollInterval;

		const checkJobs = async () => {
			try {
				const jobs = await listJobs(id);
				const activeThumbnailJobs = jobs.filter(
					(job) =>
						(job.format_id === 'thumbnail' ||
							job.format_id === 'thumbnail_sprite') &&
						[
							'queued',
							'processing',
							'encoding',
						].includes(job.status)
				);
				setActiveJobs(activeThumbnailJobs);

				if (activeThumbnailJobs.length === 0 && activeJobs.length > 0) {
					fetchSpriteStatus();
					// Jobs just finished, maybe refresh the poster if it was just set
					if (id) {
						// Optionally trigger a refresh of videoData if needed
					}
				}
			} catch (error) {
				console.error('Error polling jobs:', error);
			}
		};

		if (id) {
			checkJobs();
			pollInterval = setInterval(checkJobs, 10000); // Poll every 10 seconds
		}

		return () => clearInterval(pollInterval);
	}, [id, activeJobs.length, fetchSpriteStatus]);

	useEffect(() => {
		fetchSpriteStatus();
	}, [fetchSpriteStatus]);
	const { active_encoder = 'ffmpeg' } = options;
	const activeEncoderReady = applyFilters(
		'videopack.encoder.is_ready',
		!!videopack_config.isTranscodingServiceReady,
		active_encoder,
		options
	);
	const effectiveFfmpegExists =
		(active_encoder !== 'ffmpeg' && activeEncoderReady) ||
		(!!videopack_config.ffmpeg_exists &&
			videopack_config.ffmpeg_exists !== 'notinstalled');
	const ffmpegExists = effectiveFfmpegExists;
	const { editPost } = useDispatch('core/editor') || {};
	const isEditingAttachment = useSelect(
		(select) =>
			select('core/editor')?.getCurrentPostType() === 'attachment',
		[]
	);

	const featured = (() => {
		if (attributes.featured !== undefined) {
			return attributes.featured;
		}
		if (videoData?.record?.featured !== undefined) {
			return videoData.record.featured;
		}
		if (
			videoData?.record?.meta?.['_videopack-meta']?.featured !== undefined
		) {
			return videoData.record.meta['_videopack-meta'].featured;
		}
		return options.featured;
	})();

	const VIDEO_POSTER_ALLOWED_MEDIA_TYPES = ['image'];

	useEffect(() => {
		if (window.mejs && window.mejs.players && resolvedPoster) {
			// Find the MediaElement.js player within the media modal
			const mejsContainer = document.querySelector(
				'.media-modal .mejs-container, .wp_attachment_holder .mejs-container'
			);
			if (mejsContainer) {
				const mejsId = mejsContainer.id;
				if (mejsId && window.mejs.players[mejsId]) {
					const player = window.mejs.players[mejsId];
					player.setPoster(resolvedPoster);
				}
			}
		}
	}, [resolvedPoster]);

	useEffect(() => {
		if (spriteMessage && spriteMessage.type !== 'error') {
			const timer = setTimeout(() => {
				setSpriteMessage(null);
			}, 10000);
			return () => clearTimeout(timer);
		}
	}, [spriteMessage]);

	function onSelectPoster(image) {
		const cleanUrl = image.url ? image.url.replace(/&amp;/g, '&') : '';
		setAttributes({
			...attributes,
			poster: cleanUrl,
			poster_id: Number(image.id),
		});
	}

	async function onRemovePoster() {
		await setPosterData('', '', '');

		// Move focus back to the Media Upload button.
		posterImageButton.current.focus();
	}

	const handleGenerate = async (type = 'generate') => {
		setIsSaving(true);
		setThumbChoices([]);
		const browserThumbnailsEnabled = videopack_config.browser_thumbnails;

		if (!browserThumbnailsEnabled && !!ffmpegExists) {
			// Browser thumbnails explicitly disabled, use FFmpeg directly
			const newThumbImages = [];
			let workingId = Number(id);
			for (let i = 1; i <= Number(total_thumbnails); i++) {
				const response = await generateThumb(
					i,
					type,
					workingId,
					featured
				);



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

	const [spriteTiles, setSpriteTiles] = useState([]);
	const handleGenerateSprite = async () => {
		setIsSaving(true);
		setSpriteTiles([]);

		const browserThumbnailsEnabled = videopack_config.browser_thumbnails;
		const rawFfmpegExists =
			!!videopack_config.ffmpeg_exists &&
			videopack_config.ffmpeg_exists !== 'notinstalled';
		const activeEncoderReady = applyFilters(
			'videopack.encoder.is_ready',
			!!videopack_config.isTranscodingServiceReady,
			active_encoder,
			options
		);
		const activeEncoderIsCloud =
			active_encoder !== 'ffmpeg' && activeEncoderReady;

		if (
			!browserThumbnailsEnabled &&
			rawFfmpegExists &&
			!activeEncoderIsCloud
		) {
			try {
				const activeId = id || 0;
				await enqueueJob(
					activeId,
					src,
					{ thumbnail_sprite: true },
					parentId
				);
				let successMsg = __(
					'Sprite generation enqueued. Check Additional Formats panel for progress.',
					'video-embed-thumbnail-generator'
				);
				if (videopack_config.active_encoder === 'browser') {
					successMsg = (
						<div>
							<p>{successMsg}</p>
							<p>
								{__(
									'Browser encoding is active. Processing will only occur while the Videopack Queue page is open.',
									'video-embed-thumbnail-generator'
								)}{' '}
								<a href={videopack_config.queue_url}>
									{__(
										'Go to Queue Page',
										'video-embed-thumbnail-generator'
									)}
								</a>
							</p>
						</div>
					);
				}
				setSpriteMessage({
					type: 'success',
					text: successMsg,
				});
				// If we have an Additional Formats panel nearby, it will handle polling.
				fetchSpriteStatus(); // Initial check after enqueue
			} catch (error) {
				console.error('Sprite enqueue failed', error);
				setSpriteMessage({
					type: 'error',
					text: __(
						'Error: Failed to enqueue sprite generation.',
						'video-embed-thumbnail-generator'
					),
				});
			} finally {
				setIsSaving(false);
			}
			return;
		}

		const tileWidth = 160;
		const columns = 10;

		const targetCount = 100;
		const duration = videoRef.current.duration;
		const spriteInterval = Math.max(1.0, duration / targetCount);
		const totalTiles = Math.ceil(duration / spriteInterval);
		const timePoints = [];
		for (let i = 0; i < totalTiles; i++) {
			timePoints.push(i * spriteInterval);
		}

		const canvases = [];
		try {
			for (const time of timePoints) {
				const canvas = await captureVideoFrame(
					src,
					time,
					options?.ffmpeg_thumb_watermark || {}
				);
				// Resize canvas to tileWidth
				const tileCanvas = document.createElement('canvas');
				tileCanvas.width = tileWidth;
				tileCanvas.height = (tileWidth * canvas.height) / canvas.width;
				const tctx = tileCanvas.getContext('2d');
				tctx.drawImage(
					canvas,
					0,
					0,
					tileCanvas.width,
					tileCanvas.height
				);
				canvases.push(tileCanvas);
				setSpriteTiles((prev) => [
					...prev,
					tileCanvas.toDataURL('image/jpeg', 0.6),
				]);
			}

			const rows = Math.ceil(canvases.length / columns);
			const tileHeight = canvases[0].height;

			const spriteCanvas = document.createElement('canvas');
			spriteCanvas.width = tileWidth * columns;
			spriteCanvas.height = tileHeight * rows;
			const ctx = spriteCanvas.getContext('2d');

			canvases.forEach((canvas, index) => {
				const x = (index % columns) * tileWidth;
				const y = Math.floor(index / columns) * tileHeight;
				ctx.drawImage(canvas, x, y);
			});

			await createThumbnailFromCanvas(
				spriteCanvas,
				id,
				src,
				parentId,
				false,
				{
					is_sprite: true,
					interval: spriteInterval,
					total_tiles: canvases.length,
					width: tileWidth,
					set_poster: false,
					filename_suffix: '_thumbnail-sprite',
				}
			);
			fetchSpriteStatus();
		} catch (error) {
			console.error('Sprite generation failed', error);
		} finally {
			setIsSaving(false);
			setSpriteTiles([]);
		}
	};

	const handleDeleteSprite = async () => {
		if (!existingSprite || !existingSprite.id) {
			return;
		}

		setIsConfirmDeleteOpen(false);
		setIsDeleting(true);
		try {
			await deleteFile(existingSprite.id);
			setExistingSprite(null);
			setSpriteMessage({
				type: 'success',
				text: __(
					'Sprite sheet deleted successfully.',
					'video-embed-thumbnail-generator'
				),
			});
		} catch (error) {
			console.error('Failed to delete sprite:', error);
			setSpriteMessage({
				type: 'error',
				text: __(
					'Error: Failed to delete sprite sheet.',
					'video-embed-thumbnail-generator'
				),
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const srcIsExternal = (() => {
		try {
			const url = new URL(src, window.location.origin);
			return url.origin !== window.location.origin;
		} catch {
			return false;
		}
	})();

	const canvasTainted =
		probedMetadata?.isTainted ||
		(srcIsExternal && !isProbing && !probedMetadata);

	const generateThumb = useCallback(
		async (i, type, forceId = null, forceFeatured = null, time = null) => {
			try {
				const response = await generateThumbnail(
					src,
					total_thumbnails,
					i,
					forceId !== null ? forceId : id,
					type,
					parentId,
					forceFeatured !== null ? forceFeatured : featured,
					time
				);



				const data = await response.json();
				return data;
			} catch (error) {
				console.error(error);
			}
		},
		[src, total_thumbnails, id, parentId, featured]
	);

	const generateThumbCanvases = useCallback(
		async (type) => {
			const thumbsInt = Number(total_thumbnails);
			const newThumbCanvases = [];
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
					let canvas;
					if (!canvasTainted) {
						canvas = await captureVideoFrame(
							src,
							time,
							options?.ffmpeg_thumb_watermark || {}
						);
					} else {
						throw new Error(
							'Canvas tainted, skipping browser capture.'
						);
					}
					thumb = {
						src: canvas.toDataURL(),
						type: 'canvas',
						canvasObject: canvas,
					};
					newThumbCanvases.push(thumb);
					setThumbChoices([...newThumbCanvases]); // Update incrementally
				} catch (error) {
					if (!canvasTainted) {
						console.error(
							'Error generating canvas thumbnail:',
							error
						);
					}
					if (!!ffmpegExists) {
						try {
							const response = await generateThumb(
								index,
								type,
								workingId,
								featured
							);

							if (response?.attachment_id && workingId === 0) {
								workingId =
									parseInt(response.attachment_id, 10) || 0;
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
						} catch {
							// Silently handle FFmpeg fallback errors
						}
					}
				}
			}
			setIsSaving(false);
		},
		[
			attributes,
			featured,
			id,
			options.ffmpeg_thumb_watermark,
			setAttributes,
			total_thumbnails,
			generateThumb,
			ffmpegExists,
			src,
			canvasTainted,
		]
	);

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
					parentId,
					featured
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
					src,
					featured
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
				parentId,
				featured
			);

			setPosterData(
				response.thumb_url,
				response.thumb_id,
				response.attachment_id
			);
		} catch (error) {
			console.error('Error uploading thumbnail:', error);
			throw error;
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
			const cleanPoster = new_poster ? new_poster.replace(/&amp;/g, '&') : '';
			const existingMeta =
				videoData?.record?.meta?.['_videopack-meta'] || {};

			const metaData = {
				'_kgflashmediaplayer-poster': cleanPoster || '',
				'_kgflashmediaplayer-poster-id': new_poster_id
					? Number(new_poster_id)
					: 0,
				'_videopack-meta': {
					...existingMeta,
					poster: cleanPoster || '',
					poster_id: new_poster_id ? Number(new_poster_id) : 0,
				},
			};

			if (attributes.featured !== undefined) {
				metaData['_videopack-meta'].featured = attributes.featured;
			}

			if (videoData?.edit) {
				await videoData.edit({
					featured_media: new_poster_id
						? Number(new_poster_id)
						: null,
					meta: metaData,
				});
				await videoData.save();
			} else if (id && Number(id) > 0) {
				// Fallback for contexts without a core-data entity record (e.g. attachment details pane)
				await apiFetch({
					path: `/wp/v2/media/${id}`,
					method: 'POST',
					data: {
						featured_media: new_poster_id
							? Number(new_poster_id)
							: null,
						meta: metaData,
					},
				});
			}

			if (featured && parentId && editPost && !isEditingAttachment) {
				editPost({
					featured_media: new_poster_id
						? Number(new_poster_id)
						: null,
				});
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

			const finalAttributes = {
				...attributes,
				poster: cleanPoster || undefined,
				poster_id: new_poster_id || undefined,
			};

			// If we just created the attachment, ensure the ID is included
			if (new_attachment_id && (!id || Number(id) === 0)) {
				finalAttributes.id = Number(new_attachment_id);
			}

			setAttributes(finalAttributes);
			setThumbChoices([]);
			setIsSaving(false);
		} catch (error) {
			console.error('Error updating attachment:', error);
			setIsSaving(false);
		}
	};

	const setImgAsPoster = async (thumb_url) => {
		try {
			const response = await setPosterImage(
				id,
				thumb_url,
				parentId,
				src,
				featured
			);
			setPosterData(
				response.thumb_url,
				response.thumb_id,
				response.attachment_id
			);
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
			// exit this handler for other keys
		}
	};

	const handleUseThisFrame = async (ref = videoRef) => {
		setIsSaving(true);

		const runFfmpegFallback = async () => {
			if (!!ffmpegExists) {
				try {
					const response = await generateThumb(
						1,
						'generate',
						null,
						null,
						ref.current.currentTime
					);
					if (response?.real_thumb_url) {
						await setImgAsPoster(response.real_thumb_url);
					} else {
						setIsSaving(false);
					}
				} catch {
					console.error('FFmpeg pinpoint capture failed');
					setIsSaving(false);
				}
			} else {
				setIsSaving(false);
			}
		};

		const browserThumbnailsEnabled = videopack_config.browser_thumbnails;

		if (!browserThumbnailsEnabled || canvasTainted) {
			await runFfmpegFallback();
			return;
		}

		try {
			const canvas = await captureVideoFrame(
				ref.current,
				ref.current.currentTime,
				options?.ffmpeg_thumb_watermark || {}
			);
			await setCanvasAsPoster(canvas); // Pass the canvas object directly, index will be null
		} catch (error) {
			console.warn(
				'Canvas capture failed, attempting FFmpeg fallback:',
				error
			);
			await runFfmpegFallback();
		}
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
				{showFailedNotice &&
					Number(
						videoData?.record?.meta?._videopack_browser_thumb_failed
					) === 1 && (
						<Notice
							status="error"
							onRemove={() => setShowFailedNotice(false)}
							isDismissible={true}
						>
							{__(
								'Automatic in-browser thumbnail generation failed for this video (possibly due to CORS or canvas limitations). You can try generating thumbnails manually below.',
								'video-embed-thumbnail-generator'
							)}
						</Notice>
					)}
				{resolvedPoster && (
					<img
						className="videopack-current-thumbnail"
						src={resolvedPoster ? resolvedPoster.replace(/&amp;/g, '&') : ''}
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
								{!resolvedPoster
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
					{!!resolvedPoster && (
						<Button onClick={onRemovePoster} variant="tertiary">
							{__('Remove', 'video-embed-thumbnail-generator')}
						</Button>
					)}
				</BaseControl>
				{activeJobs.length > 0 && (
					<div className="videopack-active-jobs">
						<Spinner />
						<p>
							{__(
								'Thumbnail generation in progress…',
								'video-embed-thumbnail-generator'
							)}
						</p>
					</div>
				)}
				<ToggleControl
					label={__(
						"Set as post's featured image",
						'video-embed-thumbnail-generator'
					)}
					checked={!!featured}
					onChange={(value) => {
						setAttributes({
							...attributes,
							featured: value,
						});
					}}
				/>
				<div className="videopack-generation-controls">
					<NumberControl
						value={total_thumbnails}
						min={1}
						max={100}
						onChange={(value) => {
							if (isNaN(value) || value < 1) {
								setAttributes({
									...attributes,
									total_thumbnails: 1,
								});
							} else {
								setAttributes({
									...attributes,
									total_thumbnails: Number(value),
								});
							}
						}}
						className="videopack-total-thumbnails"
						disabled={
							isSaving ||
							((canvasTainted || isProbing) && !ffmpegExists)
						}
						label={__('Total', 'video-embed-thumbnail-generator')}
						hideLabelFromVision
					/>
					<div className="videopack-generation-actions">
						<Button
							variant="secondary"
							onClick={() => handleGenerate('generate')}
							className="videopack-generate"
							disabled={
								isSaving ||
								((canvasTainted || isProbing) && !ffmpegExists)
							}
						>
							{__('Generate', 'video-embed-thumbnail-generator')}
						</Button>
						<Button
							variant="secondary"
							onClick={() => handleGenerate('random')}
							className="videopack-generate"
							disabled={
								isSaving ||
								((canvasTainted || isProbing) && !ffmpegExists)
							}
						>
							{__('Random', 'video-embed-thumbnail-generator')}
						</Button>
						{applyFilters(
							'videopack.thumbnail.actions',
							null,
							{
								id,
								isSaving,
								isProbing,
								ffmpegExists,
								existingSprite,
								isDeleting,
								handleGenerateSprite,
								setIsConfirmDeleteOpen,
								canvasTainted,
							}
						)}
					</div>
				</div>
				{spriteMessage && (
					<Notice
						status={spriteMessage.type}
						onRemove={() => setSpriteMessage(null)}
						isDismissible={true}
						className="videopack-sprite-notice"
					>
						{spriteMessage.text}
					</Notice>
				)}
				{canvasTainted && !isProbing && !ffmpegExists && (
					<div className="videopack-security-error-notice">
						{__(
							'Cross-origin resource sharing (CORS) policy on the external server is preventing thumbnail generation.',
							'video-embed-thumbnail-generator'
						)}
					</div>
				)}
				{spriteTiles.length > 0 && (
					<div className="videopack-sprite-generation-preview">
						<p>
							{sprintf(
								/* translators: %d is the number of tiles captured */
								__(
									'Capturing sprite tiles… (%d)',
									'video-embed-thumbnail-generator'
								),
								spriteTiles.length
							)}
						</p>
						<div className="videopack-sprite-tiles-grid">
							{spriteTiles.map((tileSrc, index) => (
								<img key={index} src={tileSrc} alt="" />
							))}
						</div>
					</div>
				)}
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
									alt={sprintf(
										/* translators: %d is the thumbnail index */
										__(
											'Thumbnail %d',
											'video-embed-thumbnail-generator'
										),
										index + 1
									)}
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
							disabled={
								(canvasTainted || isProbing) && !ffmpegExists
							}
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
							{canvasTainted && !isProbing && !ffmpegExists && (
								<Icon
									icon={chevronUp}
									style={{ display: 'none' }}
								/>
							)}
						</button>
					</h2>
					<div
						className={`videopack-thumb-video-container ${isOpened ? 'is-opened' : ''} ${(canvasTainted || isProbing) && !ffmpegExists ? 'disabled' : ''}`}
					>
						<VideoPlayerInner
							videoRef={videoRef}
							panelRef={thumbVideoPanel}
							src={src}
							isPlaying={isPlaying}
							currentTime={currentTime}
							isSaving={
								isSaving ||
								((canvasTainted || isProbing) && !ffmpegExists)
							}
							togglePlayback={togglePlayback}
							handleSliderChange={handleSliderChange}
							handleUseThisFrame={handleUseThisFrame}
							onPopOut={handlePopOut}
							onKeyDown={(e) =>
								handleVideoKeyboardControl(e, videoRef)
							}
							disabled={
								(canvasTainted || isProbing) && !ffmpegExists
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
							disabled={
								(canvasTainted || isProbing) && !ffmpegExists
							}
							isModal={true}
						/>
					</Modal>
				)}
				{isConfirmDeleteOpen && (
					<ConfirmDialog
						isOpen={isConfirmDeleteOpen}
						title={__(
							'Delete Sprite Sheet',
							'video-embed-thumbnail-generator'
						)}
						confirmButtonText={__(
							'Delete',
							'video-embed-thumbnail-generator'
						)}
						onConfirm={handleDeleteSprite}
						onCancel={() => setIsConfirmDeleteOpen(false)}
					>
						{__(
							'Are you sure you want to permanently delete this sprite sheet? This action cannot be undone.',
							'video-embed-thumbnail-generator'
						)}
					</ConfirmDialog>
				)}
			</PanelBody>
		</div>
	);
};

export default Thumbnails;
