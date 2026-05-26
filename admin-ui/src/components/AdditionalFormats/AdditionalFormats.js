/**
 * Component to manage additional video formats, including encoding and file management.
 */

/* global videopack_config */

import { __, _n, sprintf } from '@wordpress/i18n';
import {
	Button,
	PanelBody,
	PanelRow,
	Spinner,
	Notice,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { applyFilters } from '@wordpress/hooks';
import { store as coreStore } from '@wordpress/core-data';

import EncodeFormatStatus from './EncodeFormatStatus';
import { getVideoFormats } from '../../api/gallery';
import { enqueueJob, deleteJob } from '../../api/jobs';
import { deleteFile, deleteFormat, assignFormat } from '../../api/media';

/**
 * Helper to get the ordinal string for a number.
 *
 * @param {number} n      The number.
 * @param {string} locale The locale string.
 * @return {string} Ordinal string (e.g., "1st", "2nd").
 */
const getOrdinal = (n, locale = 'en-US') => {
	const pr = new Intl.PluralRules(locale.replace('_', '-'), {
		type: 'ordinal',
	});
	const rule = pr.select(n);
	switch (rule) {
		case 'one':
			/* translators: %d is a number. This is for the 1st position in a queue. */
			return sprintf(__('%dst', 'video-embed-thumbnail-generator'), n);
		case 'two':
			/* translators: %d is a number. This is for the 2nd position in a queue. */
			return sprintf(__('%dnd', 'video-embed-thumbnail-generator'), n);
		case 'few':
			/* translators: %d is a number. This is for the 3rd position in a queue. */
			return sprintf(__('%drd', 'video-embed-thumbnail-generator'), n);
		default:
			/* translators: %d is a number. This is for the 4th, 5th, etc. position in a queue. */
			return sprintf(__('%dth', 'video-embed-thumbnail-generator'), n);
	}
};

/**
 * AdditionalFormats component for managing alternative video files.
 *
 * @param {Object}   props                Component props.
 * @param {Function} props.setAttributes  Function to update block attributes.
 * @param {Object}   props.attributes     Block attributes.
 * @param {Object}   props.options        Global Videopack options.
 * @param {number}   props.parentId       ID of the parent attachment.
 * @param {string}   props.src            Video source URL.
 * @param {Object}   props.probedMetadata Metadata from video probing.
 * @param {boolean}  props.isProbing      Whether the video is currently being probed.
 * @param {boolean}  props.isDiscovering  Whether formats are being discovered.
 * @return {Element} The rendered component.
 */
const AdditionalFormats = ({
	setAttributes,
	attributes,
	options = {},
	parentId: providedParentId,
	src: propSrc, // Accept src as a separate prop
	probedMetadata,
	isProbing,
	isDiscovering = false,
}) => {
	const parentId = providedParentId || attributes.id || 0;
	const src = propSrc || attributes.src;
	const { ffmpeg_exists, active_encoder = 'ffmpeg' } = options;
	const effectiveFfmpegExists =
		(active_encoder !== 'ffmpeg' &&
			(!!videopack_config.isTranscodingServiceReady ||
				!!videopack_config.is_pro)) ||
		ffmpeg_exists === true ||
		ffmpeg_exists === 'true' ||
		ffmpeg_exists === 1 ||
		ffmpeg_exists === '1';
	const [videoFormats, setVideoFormats] = useState(null);
	const isExternal = useMemo(() => {
		let isSrcExternal = false;
		if (src) {
			try {
				isSrcExternal = new URL(src).origin !== window.location.origin;
			} catch {
				// Relative URLs or invalid URLs are considered internal
			}
		}
		return !attributes.id || isSrcExternal;
	}, [attributes.id, src]);

	const [isOpen, setIsOpen] = useState(false);
	const [encodeMessage, setEncodeMessage] = useState();
	const [itemToDelete, setItemToDelete] = useState(null); // { type: 'file'/'job', formatId: string, jobId?: int, id?: int, name?: string }
	const [deleteInProgress, setDeleteInProgress] = useState(null); // Stores formatId or jobId being deleted
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [processingId, setProcessingId] = useState(null);
	const [isEncoding, setIsEncoding] = useState(false);
	const siteSettings = useSelect((select) => {
		return select('core').getSite();
	}, []);

	const sanitizeError = useCallback((error) => {
		let errorMessage = error?.data?.details
			? error.data.details.join(', ')
			: error.message || '';

		// If the message contains HTML, it's likely a WordPress fatal error response
		if (/<[a-z][\s\S]*>/i.test(errorMessage)) {
			errorMessage = __(
				'A server error occurred. Please check the PHP logs.',
				'video-embed-thumbnail-generator'
			);
		}
		return errorMessage;
	}, []);

	// Auto-clear success messages after 30 seconds.
	useEffect(() => {
		if (
			encodeMessage &&
			(typeof encodeMessage !== 'string' ||
				!encodeMessage.includes(
					__('Error:', 'video-embed-thumbnail-generator')
				))
		) {
			const timer = setTimeout(() => {
				setEncodeMessage(null);
			}, 30000);
			return () => clearTimeout(timer);
		}
	}, [encodeMessage]);

	const updateVideoFormats = useCallback((response) => {
		setVideoFormats((currentVideoFormats) => {
			if (response && response.constructor === Object) {
				const newFormats = { ...response };

				// If we have old data, try to preserve some client-side state
				Object.keys(newFormats).forEach((fId) => {
					const newFormat = newFormats[fId];
					const oldFormat = currentVideoFormats?.[fId];

					// Carry over UI-only 'checked' state or initialize it.
					// If the status is one where encoding is already done or in progress, uncheck it.
					const isBusyOrDone = [
						'queued',
						'encoding',
						'processing',
						'completed',
						'needs_insert',
						'pending_replacement',
						'remote_exists',
						'browser_pending',
						'browser_encoding',
					].includes(newFormat.status);

					newFormat.checked =
						oldFormat && !isBusyOrDone
							? !!oldFormat.checked
							: false;
				});

				// Only update state if the formats have actually changed.
				// This check is important to prevent unnecessary re-renders.
				if (
					JSON.stringify(currentVideoFormats) !==
					JSON.stringify(newFormats)
				) {
					return newFormats;
				}
			} else if (
				JSON.stringify(currentVideoFormats) !== JSON.stringify(response)
			) {
				// Fallback for non-object responses
				return response;
			}
			return currentVideoFormats;
		});
	}, []);

	const fetchVideoFormats = useCallback(
		async (signal = null) => {
			const activeId = attributes.id || 0;
			if (!activeId || !src) {
				return;
			}
			if (!videoFormats) {
				setIsLoading(true);
			}
			try {
				const formats = await getVideoFormats(
					activeId,
					src,
					probedMetadata,
					signal
				);
				updateVideoFormats(formats);
			} catch (error) {
				if (error.name === 'AbortError') {
					return;
				}
				console.error('Error fetching video formats:', error);
				const errorMessage = sanitizeError(error);
				setEncodeMessage(
					sprintf(
						/* translators: %s is the error details */
						__('Error: %s', 'video-embed-thumbnail-generator'),
						errorMessage
					)
				);
				setVideoFormats({});
			} finally {
				setIsLoading(false);
			}
		},
		[
			attributes.id,
			src,
			updateVideoFormats,
			probedMetadata,
			sanitizeError,
			videoFormats,
		]
	);

	const pollVideoFormats = useCallback(
		async (signal = null) => {
			const activeId = attributes.id || 0;
			if (src) {
				try {
					const formats = await getVideoFormats(
						activeId,
						src,
						probedMetadata,
						signal
					);
					updateVideoFormats(formats);
					return formats;
				} catch (error) {
					if (error.name === 'AbortError') {
						return null;
					}
					console.error('Error polling video formats:', error);
				}
			}
			return null;
		},
		[src, attributes.id, updateVideoFormats, probedMetadata]
	);

	// Initial fetch
	useEffect(() => {
		if (isProbing || !isOpen || isDiscovering) {
			return;
		}

		// Only fetch once. Polling handles updates if encoding.
		if (videoFormats) {
			return;
		}

		const controller = new AbortController();
		fetchVideoFormats(controller.signal);
		return () => controller.abort();
	}, [fetchVideoFormats, isProbing, isOpen, isDiscovering, videoFormats]);

	const shouldPoll = (formats) => {
		if (!formats) {
			return false;
		}
		// Poll only if at least one format is still in a state that requires updates.
		return Object.values(formats).some(
			(format) =>
				format.status === 'queued' ||
				format.status === 'encoding' ||
				format.status === 'processing' ||
				format.status === 'needs_insert' ||
				format.status === 'pending_replacement'
		);
	};

	useEffect(() => {
		setIsEncoding(shouldPoll(videoFormats));
	}, [videoFormats]);

	useEffect(() => {
		let pollTimer = null;
		let isMounted = true;

		// Handle real-time progress updates from browser encoder via CustomEvents
		const handleBrowserProgress = (event) => {
			const { job_id, format_id, percent } = event.detail;
			setVideoFormats((prevFormats) => {
				if (!prevFormats) {
					return prevFormats;
				}
				const updatedFormats = { ...prevFormats };
				const format = updatedFormats[format_id];
				if (
					format &&
					(format.job_id === job_id ||
						(!format.job_id && format.status === 'browser_pending'))
				) {
					updatedFormats[format_id] = {
						...format,
						status: 'encoding',
						encoding_now: true,
						progress: {
							...(typeof format.progress === 'object'
								? format.progress
								: {}),
							percent,
							status: 'encoding',
						},
					};
					return updatedFormats;
				}
				return prevFormats;
			});
		};

		window.addEventListener(
			'videopack_browser_progress',
			handleBrowserProgress
		);

		// Manage polling logic based on isEncoding state
		if (isEncoding && isOpen) {
			const runPoll = async () => {
				if (!isMounted) {
					return;
				}
				const formats = await pollVideoFormats();
				let delay = 15000;
				if (formats) {
					const isSlow = Object.values(formats).some(
						(format) =>
							format.encoding_now &&
							format.progress &&
							format.progress.fps &&
							parseFloat(format.progress.fps) < 5
					);
					if (isSlow) {
						delay = 30000;
					}
				}
				if (isMounted) {
					pollTimer = setTimeout(runPoll, delay);
				}
			};

			// Don't run immediately if we just mounted/changed state,
			// wait for the first interval.
			pollTimer = setTimeout(runPoll, 5000);
		}

		return () => {
			isMounted = false;
			window.removeEventListener(
				'videopack_browser_progress',
				handleBrowserProgress
			);
			if (pollTimer) {
				clearTimeout(pollTimer);
			}
		};
	}, [isEncoding, isOpen, pollVideoFormats]);

	const handleFormatCheckbox = (formatId, isChecked) => {
		setVideoFormats((prevVideoFormats) => {
			const updatedFormats = { ...prevVideoFormats };
			if (updatedFormats[formatId]) {
				// If a replacement format is checked, uncheck all other replacement formats.
				if (isChecked && updatedFormats[formatId].replaces_original) {
					Object.keys(updatedFormats).forEach((id) => {
						if (
							id !== formatId &&
							updatedFormats[id].replaces_original
						) {
							updatedFormats[id] = {
								...updatedFormats[id],
								checked: false,
							};
						}
					});
				}

				updatedFormats[formatId] = {
					...updatedFormats[formatId],
					checked: isChecked,
				};
			}

			// Allow extensions (Pro) to modify the state based on checkboxes.
			/**
			 * Filters the updated video formats list after checking/unchecking a checkbox.
			 *
			 * Useful for extensions to perform custom validations or toggle other codecs accordingly.
			 *
			 * @since 5.0.0
			 *
			 * @param {Object}  updatedFormats Copy of the video formats state object.
			 * @param {string}  formatId       The resolution format ID that was changed.
			 * @param {boolean} isChecked      True if format is checked, false otherwise.
			 */
			return applyFilters(
				'videopack.handle_format_checkbox',
				updatedFormats,
				formatId,
				isChecked
			);
		});
	};

	const handleEnqueue = async () => {
		if (!videopack_config) {
			return <Spinner />;
		}

		setIsProcessing(true);

		// Get list of format IDs that are checked and available
		const formatsToEncode = Object.entries(videoFormats)
			.filter(
				([, value]) =>
					value.checked &&
					![
						'queued',
						'encoding',
						'processing',
						'completed',
						'needs_insert',
						'pending_replacement',
						'remote_exists',
					].includes(value.status) &&
					!value.exists
			)
			.reduce((acc, [formatId]) => {
				acc[formatId] = true; // Backend expects an object { format_id: true, ... }
				return acc;
			}, {});

		try {
			const activeId = attributes.id || 0;
			const response = await enqueueJob(
				activeId,
				src,
				formatsToEncode,
				parentId
			);
			if (response?.attachment_id && !attributes.id) {
				// Attachment was created on the fly
				setAttributes({
					...attributes,
					id: Number(response.attachment_id),
				});
			}
			const jobCount = response?.encode_list?.length || 0;

			if (jobCount === 0) {
				const emptyMsg =
					response?.log?.length > 0
						? response.log.join(' ')
						: __(
								'No formats were added to the queue.',
								'video-embed-thumbnail-generator'
							);
				setEncodeMessage(emptyMsg);
			} else {
				const queuePosition = response?.new_queue_position;
				const startPosition = Math.max(1, queuePosition - jobCount + 1);
				const ordinalPosition = getOrdinal(
					startPosition,
					siteSettings?.language || 'en-US'
				);

				const encodeList = response?.encode_list || [];
				const cmafPartsCount = encodeList.filter((item) =>
					item.id?.startsWith('cmaf_')
				).length;
				const otherJobsCount = encodeList.length - cmafPartsCount;
				const effectiveJobCount =
					(cmafPartsCount > 0 ? 1 : 0) + otherJobsCount;

				let successMsg = (
					<span>
						{sprintf(
							/* translators: %1$d is the number of jobs. %2$s is the ordinal position (e.g. 1st, 2nd). */
							_n(
								'%1$d job added to queue in %2$s position.',
								'%1$d jobs added to queue starting in %2$s position.',
								effectiveJobCount,
								'video-embed-thumbnail-generator'
							),
							effectiveJobCount,
							ordinalPosition
						)}
					</span>
				);

				if (active_encoder === 'browser') {
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

				setEncodeMessage(successMsg);
			}
			fetchVideoFormats(); // Re-fetch to update statuses
		} catch (error) {
			console.error(error);
			const errorMessage = sanitizeError(error);

			/* translators: %s is an error message */
			setEncodeMessage(
				sprintf(
					/* translators: %s is an error message */
					__('Error: %s.', 'video-embed-thumbnail-generator'),
					errorMessage
				)
			);
			fetchVideoFormats(); // Re-fetch to ensure UI is consistent
		} finally {
			setIsProcessing(false);
			setProcessingId(null);
		}
	};

	const onSelectFormat = (formatId) => async (media) => {
		if (!media || !media.id || !formatId) {
			return;
		}

		setIsProcessing(true);
		setProcessingId(formatId);

		try {
			await assignFormat(media.id, formatId, attributes.id);
			setEncodeMessage(
				__(
					'Video format assigned successfully.',
					'video-embed-thumbnail-generator'
				)
			);
			fetchVideoFormats(); // Refresh the list
		} catch (error) {
			console.error('Error assigning video format:', error);
			const errorMessage = sanitizeError(error);
			setEncodeMessage(
				sprintf(
					/* translators: %s is an error message */
					__('Error: %s', 'video-embed-thumbnail-generator'),
					errorMessage
				)
			);
		} finally {
			setIsProcessing(false);
			setProcessingId(null);
		}
	};

	// Deletes the actual media file (WP Attachment or orphaned file)
	const handleFileDelete = async (formatId) => {
		const formatData = videoFormats?.[formatId];
		if (!formatData) {
			return;
		}

		setDeleteInProgress(formatId); // Mark this formatId as being deleted
		try {
			if (formatData.id) {
				await deleteFile(formatData.id);
			} else {
				// Cleanup orphaned file
				await deleteFormat(parentId, formatId);
			}

			setEncodeMessage(
				__(
					'File deleted successfully.',
					'video-embed-thumbnail-generator'
				)
			);
			fetchVideoFormats(); // Re-fetch to get the latest status from backend
		} catch (error) {
			console.error('File delete failed:', error);
			const errorMessage = sanitizeError(error);
			setEncodeMessage(
				sprintf(
					/* translators: %s is an error message */
					__(
						'Error deleting file: %s',
						'video-embed-thumbnail-generator'
					),
					errorMessage
				)
			);
			fetchVideoFormats(); // Re-fetch to get the latest status
		} finally {
			setDeleteInProgress(null);
		}
	};

	// Deletes/Cancels a queue job
	const handleJobDelete = async (jobId) => {
		if (!jobId) {
			setEncodeMessage(
				__(
					'Error: Cannot delete job, missing job ID.',
					'video-embed-thumbnail-generator'
				)
			);
			console.error('Cannot delete job: Missing job ID');
			return;
		}
		setDeleteInProgress(jobId); // Mark this jobId as being deleted
		try {
			await deleteJob(jobId);
			setEncodeMessage(
				__(
					'Job canceled/deleted successfully.',
					'video-embed-thumbnail-generator'
				)
			);
			fetchVideoFormats(); // Re-fetch to get the latest status
		} catch (error) {
			console.error('Job delete failed:', error);
			const errorMessage = sanitizeError(error);
			setEncodeMessage(
				sprintf(
					/* translators: %s is an error message */
					__(
						'Error deleting job: %s',
						'video-embed-thumbnail-generator'
					),
					errorMessage
				)
			);
			fetchVideoFormats(); // Re-fetch to get the latest status
		} finally {
			setDeleteInProgress(null);
		}
	};

	const openConfirmDialog = (type, formatId) => {
		const formatData = videoFormats?.[formatId];
		if (!formatData) {
			return;
		}

		setItemToDelete({
			type, // 'file' or 'job'
			formatId,
			jobId: formatData.job_id,
			id: formatData.id,
			name: formatData.name,
		});
		setIsConfirmOpen(true);
	};

	const handleConfirm = () => {
		setIsConfirmOpen(false);
		if (itemToDelete) {
			if (itemToDelete.type === 'file') {
				handleFileDelete(itemToDelete.formatId);
			} else if (itemToDelete.type === 'job' && itemToDelete.jobId) {
				handleJobDelete(itemToDelete.jobId);
			}
		}
		setItemToDelete(null);
	};

	const handleCancel = () => {
		setItemToDelete(null);
		setIsConfirmOpen(false);
	};

	const somethingToEncode = () => {
		if (videoFormats) {
			// Check if any format is checked AND available AND not already in a terminal/pending state
			return Object.values(videoFormats).some(
				(obj) =>
					obj.checked &&
					![
						'queued',
						'encoding',
						'processing',
						'completed',
						'needs_insert',
						'pending_replacement',
					].includes(obj.status) &&
					!obj.exists
			);
		}
		return false;
	};

	const encodeButtonTitle = () => {
		if (somethingToEncode()) {
			return isLoading
				? __('Loading…', 'video-embed-thumbnail-generator')
				: __(
						'Encode selected formats',
						'video-embed-thumbnail-generator'
					);
		}

		return __(
			'Select formats to encode',
			'video-embed-thumbnail-generator'
		);
	};

	const isEncodeButtonDisabled =
		isLoading || !effectiveFfmpegExists || !somethingToEncode();

	const confirmDialogMessage = () => {
		if (!itemToDelete) {
			return '';
		}
		if (itemToDelete.type === 'file') {
			return __(
				'Are you sure you want to permanently delete this attachment? This action cannot be undone.',
				'video-embed-thumbnail-generator'
			);
		}
		if (itemToDelete.type === 'job') {
			return __(
				'Are you sure you want to permanently delete this job record? This action cannot be undone.',
				'video-embed-thumbnail-generator'
			);
		}
	};

	const canUploadFiles = useSelect(
		(select) => {
			const activeId = attributes.id || 0;
			if (activeId) {
				return select(coreStore).canUser('create', 'media', activeId);
			}
			// If no ID but we have a src, check general media creation permissions
			return !!src && select(coreStore).canUser('create', 'media');
		},
		[attributes.id, src]
	);

	useSelect(
		(select) => {
			const activeId = attributes.id || 0;
			const editorSelector = select('core/editor');
			return (
				!!activeId &&
				!!editorSelector &&
				editorSelector.isDeletingPost(activeId)
			);
		},
		[attributes.id]
	);

	const groupedFormats = videoFormats
		? applyFilters(
				/**
				 * Filters the grouped formats list before rendering additional formats choices.
				 *
				 * Allows custom sorting, layout, or injecting custom codecs into grouped categories.
				 *
				 * @since 5.0.0
				 *
				 * @param {Object} groupedFormats Object mapping codec keys to arrays of formats.
				 * @param {Object} videoFormats   The original flat video formats state object.
				 */
				'videopack.grouped_formats',
				Object.values(videoFormats).reduce((acc, format) => {
					if (!format.codec || !format.codec.id) {
						return acc;
					}
					const codecId = format.codec.id;
					if (!acc[codecId]) {
						acc[codecId] = {
							name: format.codec.name,
							formats: [],
						};
					}

					acc[codecId].formats.push(format);
					// sort formats by height
					acc[codecId].formats.sort((a, b) => {
						// Prioritize the replacement format to be at the top of its codec.
						if (a.replaces_original && !b.replaces_original) {
							return -1;
						}
						if (!a.replaces_original && b.replaces_original) {
							return 1;
						}
						// Prioritize the fullres format.
						if (
							a.resolution.id === 'fullres' &&
							b.resolution.id !== 'fullres'
						) {
							return -1;
						}
						if (
							a.resolution.id !== 'fullres' &&
							b.resolution.id === 'fullres'
						) {
							return 1;
						}
						// Otherwise, sort by resolution height in descending order.
						return (
							(b.resolution.height || 0) -
							(a.resolution.height || 0)
						);
					});
					return acc;
				}, {}),
				videoFormats
			)
		: {};

	return (
		<>
			<PanelBody
				title={__(
					'Additional Formats',
					'video-embed-thumbnail-generator'
				)}
				opened={isOpen}
				onToggle={() => setIsOpen(!isOpen)}
			>
				{encodeMessage && (
					<Notice
						status={
							typeof encodeMessage === 'string' &&
							(encodeMessage.includes(
								__('Error', 'video-embed-thumbnail-generator')
							) ||
								encodeMessage.includes(':'))
								? 'error'
								: 'success'
						}
						isDismissible={true}
						onRemove={() => setEncodeMessage(null)}
						style={{ marginBottom: '15px' }}
					>
						{encodeMessage}
					</Notice>
				)}
				{!videoFormats ? (
					<div className="videopack-formats-loading">
						<Spinner />
						{isLoading && isExternal && (
							<span className="videopack-external-check-notice">
								{__(
									'Checking URLs on external server…',
									'video-embed-thumbnail-generator'
								)}
							</span>
						)}
					</div>
				) : (
					<div className="videopack-formats-container">
						{isLoading && isExternal && (
							<div className="videopack-external-check-notice">
								<Spinner size={16} />
								{__(
									'Checking URLs on external server…',
									'video-embed-thumbnail-generator'
								)}
							</div>
						)}
						<ul
							className={`videopack-formats-list${
								effectiveFfmpegExists ? '' : ' no-ffmpeg'
							}`}
						>
							{Object.keys(groupedFormats)
								.sort((a, b) => {
									if (a === 'thumbnail') {
										return 1;
									}
									if (b === 'thumbnail') {
										return -1;
									}
									return a.localeCompare(b);
								})
								.map((codecId) => {
									const codecGroup = groupedFormats[codecId];
									if (codecGroup.formats.length === 0) {
										return null;
									}
									return (
										<li key={codecId}>
											<h4 className="videopack-codec-name">
												{codecGroup.name}
											</h4>
											<ul>
												{codecGroup.formats.map(
													(formatData) => {
														const formatId =
															formatData.format_id;
														return (
															<EncodeFormatStatus
																key={formatId}
																formatId={
																	formatId
																}
																parentId={
																	parentId
																}
																formatData={
																	formatData
																}
																ffmpegExists={
																	effectiveFfmpegExists
																}
																onCheckboxChange={
																	handleFormatCheckbox
																}
																onSelectFormat={
																	onSelectFormat
																}
																isProcessing={
																	isProcessing
																}
																processingId={
																	processingId
																}
																deleteInProgress={
																	deleteInProgress
																}
																onDeleteFile={() =>
																	openConfirmDialog(
																		'file',
																		formatId
																	)
																}
																onCancelJob={() =>
																	openConfirmDialog(
																		'job',
																		formatId
																	)
																}
																onRefresh={
																	fetchVideoFormats
																}
															/>
														);
													}
												)}
											</ul>
										</li>
									);
								})}
						</ul>
						<ConfirmDialog
							isOpen={isConfirmOpen}
							onConfirm={handleConfirm}
							onCancel={handleCancel}
							className="videopack-confirm-dialog"
						>
							{confirmDialogMessage()}
						</ConfirmDialog>
					</div>
				)}
				{!!effectiveFfmpegExists && videoFormats && canUploadFiles && (
					<>
						{applyFilters(
							/**
							 * Action filter hook to render extra custom UI inside the Additional Formats panel.
							 *
							 * @since 5.0.0
							 *
							 * @param {null}   empty   Null context value.
							 * @param {Object} context Context object containing videoFormats, options, parentId.
							 */
							'videopack.AdditionalFormats.extraContent',
							null,
							{
								videoFormats,
								options,
								parentId,
							}
						)}
						<PanelRow className="videopack-encode-button-row">
							<Button
								variant="secondary"
								onClick={handleEnqueue}
								title={encodeButtonTitle()}
								text={__(
									'Encode',
									'video-embed-thumbnail-generator'
								)}
								disabled={
									isEncodeButtonDisabled || isProcessing
								}
							/>
							{(isLoading || isProcessing) && <Spinner />}
						</PanelRow>
					</>
				)}
			</PanelBody>
		</>
	);
};

export default AdditionalFormats;
