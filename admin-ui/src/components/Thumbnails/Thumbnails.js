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
import { listJobs } from '../../api/jobs';
import {
	captureVideoFrame,
	calculateTimecodes,
	captureFramesWithFallback,
} from '../../utils/video-capture';
import { getEffectiveFfmpegExists } from '../../utils/ffmpegCapability';

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
	const [activeJobs, setActiveJobs] = useState([]);
	const [showFailedNotice, setShowFailedNotice] = useState(true);

	// Poll for active thumbnail jobs if any exist
	useEffect(() => {
		let pollInterval;

		const checkJobs = async () => {
			try {
				const jobs = await listJobs(id);
				const activeThumbnailJobs = jobs.filter(
					(job) =>
						job.format_id === 'thumbnail' &&
						['queued', 'processing', 'encoding'].includes(
							job.status
						)
				);
				setActiveJobs(activeThumbnailJobs);
			} catch (error) {
				console.error('Error polling jobs:', error);
			}
		};

		if (id) {
			checkJobs();
			pollInterval = setInterval(checkJobs, 10000); // Poll every 10 seconds
		}

		return () => clearInterval(pollInterval);
	}, [id]);
	// active_encoder comes from `options` (this block's own settings), but
	// ffmpeg_exists comes from the global videopack_config, not `options` --
	// preserving that existing data-source split intentionally.
	const ffmpegExists = getEffectiveFfmpegExists(
		{
			ffmpeg_exists: videopack_config.ffmpeg_exists,
			active_encoder: options.active_encoder,
		},
		videopack_config.isTranscodingServiceReady
	);
	const { editPost } = useDispatch('core/editor') || {};
	// player/edit.js and player-container/edit.js both pass a videoData that
	// has no real .edit()/.save() (just a read-only record + a purely local
	// setRecord override), so the save below always takes the raw apiFetch
	// path — which writes to the server fine but never touches the `core`
	// data store, so nothing reading this attachment via getEntityRecord
	// (this block's own poster, other blocks on the same page, etc) knows to
	// re-render until a full reload re-fetches everything. Invalidating the
	// cached resolution after a successful save tells every mounted
	// useSelect consumer of this exact attachment to refetch and pick up the
	// change on its own.
	const { invalidateResolution } = useDispatch('core');
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

	function onSelectPoster(image) {
		const cleanUrl = image.url ? image.url.replace(/&amp;/g, '&') : '';
		const attachment = videoData?.record;
		const attachmentPoster =
			attachment?.videopack?.poster ||
			attachment?.meta?.['_videopack-meta']?.poster ||
			'';
		const attachmentPosterId =
			attachment?.meta?.['_videopack-meta']?.poster_id ||
			attachment?.meta?.['_kgflashmediaplayer-poster-id'] ||
			0;

		const finalPoster =
			cleanUrl && cleanUrl !== attachmentPoster ? cleanUrl : undefined;
		const finalPosterId =
			image.id && Number(image.id) !== Number(attachmentPosterId)
				? Number(image.id)
				: undefined;

		setAttributes({
			...attributes,
			poster: finalPoster,
			poster_id: finalPosterId,
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
		const browserThumbnailsEnabled =
			videopack_config.options.browser_thumbnails;

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

			await captureFramesWithFallback(
				timePoints,
				[
					(time) => {
						if (canvasTainted) {
							throw new Error(
								'Canvas tainted, skipping browser capture.'
							);
						}
						return captureVideoFrame(
							src,
							time,
							options?.ffmpeg_thumb_watermark || {}
						);
					},
					(time, index) => {
						if (!ffmpegExists) {
							throw new Error('FFmpeg fallback unavailable.');
						}
						return generateThumb(
							index + 1,
							type,
							workingId,
							featured
						);
					},
				],
				{
					onProgress: async ({ result, strategyIndex, error }) => {
						if (strategyIndex === 0) {
							const thumb = {
								src: result.toDataURL(),
								type: 'canvas',
								canvasObject: result,
							};
							newThumbCanvases.push(thumb);
							setThumbChoices([...newThumbCanvases]);
							return;
						}

						if (strategyIndex === 1) {
							if (result?.attachment_id && workingId === 0) {
								workingId =
									parseInt(result.attachment_id, 10) || 0;
								setAttributes({
									...attributes,
									id: workingId,
								});
							}
							if (result?.real_thumb_url) {
								const thumb = {
									src: result.real_thumb_url,
									type: 'ffmpeg',
								};
								newThumbCanvases.push(thumb);
								setThumbChoices([...newThumbCanvases]);
							}
							return;
						}

						// Both strategies failed for this timecode --
						// canvasTainted failures are expected (cross-origin
						// source, already surfaced via the "CORS ..."
						// notice), so only log the unexpected case.
						if (!canvasTainted) {
							console.error(
								'Error generating canvas thumbnail:',
								error
							);
						}
					},
				}
			);
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

			// createThumbnailFromCanvas already persisted this server-side
			// (the upload endpoint sets the poster by default), so this call
			// only needs to sync local state -- not write it again.
			setPosterData(
				response.thumb_url,
				response.thumb_id,
				response.attachment_id,
				{ skipServerWrite: true }
			);
		} catch (error) {
			console.error('Error uploading thumbnail:', error);
			throw error;
		} finally {
			setIsSaving(false);
		}
	};

	// Persists a poster choice and syncs local/editor state to match. The
	// server write only fires when skipServerWrite is false (the default) --
	// callers that already persisted this themselves (setImgAsPoster via
	// setPosterImage, setCanvasAsPoster via createThumbnailFromCanvas) pass
	// skipServerWrite: true and use this purely for the client-side sync.
	// onRemovePoster is the one caller with nothing upstream to persist it,
	// so it relies on the write happening here.
	//
	// The write itself only touches _videopack-meta -- _kgflashmediaplayer-*
	// are legacy keys nothing should still be writing; reads of them are
	// already transparently redirected to _videopack-meta server-side (see
	// Attachment_Meta::filter_legacy_post_metadata()).
	const setPosterData = async (
		new_poster,
		new_poster_id,
		new_attachment_id,
		{ skipServerWrite = false } = {}
	) => {
		try {
			const cleanPoster = new_poster
				? new_poster.replace(/&amp;/g, '&')
				: '';

			if (!skipServerWrite) {
				const existingMeta =
					videoData?.record?.meta?.['_videopack-meta'] || {};

				const metaData = {
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
			}

			if (featured && parentId && editPost && !isEditingAttachment) {
				editPost({
					featured_media: new_poster_id
						? Number(new_poster_id)
						: null,
				});
			}

			// Reflects this save everywhere this attachment is currently
			// rendered (this block's own preview, other blocks on the page,
			// etc) without waiting for a reload — see the comment on
			// invalidateResolution above for why this is necessary even
			// though the save itself already succeeded.
			const savedAttachmentId = Number(new_attachment_id || id);
			if (savedAttachmentId > 0) {
				invalidateResolution('getEntityRecord', [
					'postType',
					'attachment',
					savedAttachmentId,
				]);
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
				poster: undefined,
				poster_id: undefined,
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
			// setPosterImage already persisted this server-side; sync local
			// state only.
			setPosterData(
				response.thumb_url,
				response.thumb_id,
				response.attachment_id,
				{ skipServerWrite: true }
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

		const browserThumbnailsEnabled =
			videopack_config.options.browser_thumbnails;

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
						src={
							resolvedPoster
								? resolvedPoster.replace(/&amp;/g, '&')
								: ''
						}
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
						{applyFilters('videopack.thumbnail.actions', null, {
							id,
							src,
							parentId,
							isSaving,
							isProbing,
							ffmpegExists,
							canvasTainted,
							probedMetadata,
							options,
						})}
					</div>
				</div>

				{canvasTainted && !isProbing && !ffmpegExists && (
					<div className="videopack-security-error-notice">
						{__(
							'Cross-origin resource sharing (CORS) policy on the external server is preventing thumbnail generation.',
							'video-embed-thumbnail-generator'
						)}
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
			</PanelBody>
		</div>
	);
};

export default Thumbnails;
