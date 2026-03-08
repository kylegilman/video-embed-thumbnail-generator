/* global videopack_config */

import { __, _n, sprintf } from '@wordpress/i18n';
import {
	Button,
	PanelBody,
	PanelRow,
	Spinner,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { useState, useEffect, useCallback, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import './additional-formats.scss';
import EncodeFormatStatus from './EncodeFormatStatus';
import {
	getVideoFormats,
	enqueueJob,
	assignFormat,
	deleteFile,
	deleteJob,
} from '../../utils/utils';

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

const AdditionalFormats = ({ attributes, options = {} }) => {
	const { id, src } = attributes;
	const { ffmpeg_exists } = options;
	const [videoFormats, setVideoFormats] = useState({});
	const [encodeMessage, setEncodeMessage] = useState();
	const [itemToDelete, setItemToDelete] = useState(null); // { type: 'file'/'job', formatId: string, jobId?: int, id?: int, name?: string }
	const [deleteInProgress, setDeleteInProgress] = useState(null); // Stores formatId or jobId being deleted
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isEncoding, setIsEncoding] = useState(false);
	const progressTimerRef = useRef(null);

	// Auto-clear success messages after 30 seconds.
	useEffect(() => {
		if (
			encodeMessage &&
			!encodeMessage.includes(
				__('Error:', 'video-embed-thumbnail-generator')
			)
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
					newFormat.checked = oldFormat
						? !!oldFormat.checked
						: !!newFormat.checked;

					// Special handling for progress interpolation
					if (newFormat.encoding_now && newFormat.progress) {
						if (
							oldFormat &&
							oldFormat.encoding_now &&
							oldFormat.progress &&
							newFormat.progress.percent <
							oldFormat.progress.percent
						) {
							// Don't let progress jump backwards due to server polling lag
							newFormat.progress = {
								...newFormat.progress,
								percent: oldFormat.progress.percent,
								remaining: oldFormat.progress.remaining,
							};
						} else {
							// If no old progress, ensure we don't start with a negative percent.
							newFormat.progress.percent =
								newFormat.progress.percent > 0
									? newFormat.progress.percent
									: 0;
						}
					}
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

	const fetchVideoFormats = useCallback(async () => {
		if (!id) {
			return;
		} // Don't fetch if there's no ID.
		try {
			const formats = await getVideoFormats(id);
			updateVideoFormats(formats);
		} catch (error) {
			console.error('Error fetching video formats:', error);
		}
	}, [id, updateVideoFormats]);

	const pollVideoFormats = useCallback(async () => {
		if (src && id) {
			try {
				const formats = await getVideoFormats(id);
				updateVideoFormats(formats);
				return formats;
			} catch (error) {
				console.error('Error polling video formats:', error);
			}
		}
		return null;
	}, [src, id, updateVideoFormats]);

	useEffect(() => {
		fetchVideoFormats();
	}, [fetchVideoFormats]); // Fetch formats when the attachment ID changes

	const siteSettings = useSelect((select) => {
		return select('core').getSite();
	}, []);

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
				format.status === 'needs_insert'
		);
	};

	const incrementEncodeProgress = useCallback(() => {
		setVideoFormats((currentVideoFormats) => {
			if (!currentVideoFormats || !isEncoding) {
				return currentVideoFormats;
			}

			const updatedVideoFormats = { ...currentVideoFormats };
			Object.keys(updatedVideoFormats).forEach((fId) => {
				const format = updatedVideoFormats[fId];
				if (format.encoding_now && format.progress) {
					const elapsed =
						new Date().getTime() / 1000 - format.started;
					let percent = format.progress.percent || 0;
					let remaining = null;

					// Only calculate remaining time if video_duration is available.
					if (format.video_duration) {
						const totalDurationInSeconds =
							format.video_duration / 1000000;
						const speedMatch = format.progress.speed
							? String(format.progress.speed).match(/(\d*\.?\d+)/)
							: null;
						const speed = speedMatch
							? parseFloat(speedMatch[0])
							: 0;

						// Increment percent based on speed. This function runs every second.
						if (speed > 0) {
							const increment =
								(1 / totalDurationInSeconds) * 100 * speed;
							percent += increment;
						}

						// Calculate remaining time based on current percent and speed
						if (percent > 0 && speed > 0) {
							const remainingPercent = 100 - percent;
							remaining =
								(totalDurationInSeconds *
									(remainingPercent / 100)) /
								speed;
						} else {
							remaining = totalDurationInSeconds - elapsed;
						}
					}

					// Clamp values to be within expected ranges.
					percent = Math.min(100, Math.max(0, percent));
					remaining =
						remaining !== null ? Math.max(0, remaining) : null;

					updatedVideoFormats[fId] = {
						...format,
						progress: {
							...format.progress,
							elapsed,
							remaining,
							percent,
						},
					};
				}
			});
			return updatedVideoFormats;
		});
	}, [isEncoding]);

	useEffect(() => {
		setIsEncoding(shouldPoll(videoFormats));
	}, [videoFormats]);

	useEffect(() => {
		let pollTimer = null;
		// Manage progress timer based on encoding state
		if (isEncoding) {
			const runPoll = async () => {
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
				pollTimer = setTimeout(runPoll, delay);
			};
			runPoll();

			if (progressTimerRef.current === null) {
				progressTimerRef.current = setInterval(
					incrementEncodeProgress,
					1000
				);
			}
		} else {
			// Clear all timers if not encoding
			clearInterval(progressTimerRef.current);
			progressTimerRef.current = null;
			clearTimeout(pollTimer);
			pollTimer = null;
		}

		return () => {
			if (progressTimerRef.current !== null) {
				clearInterval(progressTimerRef.current);
				progressTimerRef.current = null;
			}
			if (pollTimer !== null) {
				clearTimeout(pollTimer);
				pollTimer = null;
			}
		};
	}, [isEncoding, pollVideoFormats, incrementEncodeProgress]); // Depend on isEncoding state and stable callbacks

	const handleFormatCheckbox = (event, formatId) => {
		setVideoFormats((prevVideoFormats) => {
			const updatedFormats = { ...prevVideoFormats };
			if (updatedFormats[formatId]) {
				updatedFormats[formatId].checked = event;
			}
			return updatedFormats;
		});
		// Note: Checkbox state is now purely UI. Saving to DB happens on "Encode" button click.
	};

	const handleEnqueue = async () => {
		if (!videopack_config) {
			return <Spinner />;
		}

		setIsLoading(true);

		// Get list of format IDs that are checked and available
		const formatsToEncode = Object.entries(videoFormats)
			.filter(
				([, value]) =>
					value.checked &&
					value.status !== 'queued' &&
					value.status !== 'processing' &&
					value.status !== 'completed'
			)
			.reduce((acc, [formatId]) => {
				acc[formatId] = true; // Backend expects an object { format_id: true, ... }
				return acc;
			}, {});

		try {
			const response = await enqueueJob(id, src, formatsToEncode);
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

				setEncodeMessage(
					sprintf(
						/* translators: %1$d is the number of jobs. %2$s is the ordinal position (e.g. 1st, 2nd). */
						_n(
							'%1$d job added to queue in %2$s position.',
							'%1$d jobs added to queue starting in %2$s position.',
							jobCount,
							'video-embed-thumbnail-generator'
						),
						jobCount,
						ordinalPosition
					)
				);
			}
			fetchVideoFormats(); // Re-fetch to update statuses
		} catch (error) {
			console.error(error);
			// Use the detailed error messages from the server if available
			const errorMessage = error?.data?.details
				? error.data.details.join(', ')
				: error.message;
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
			setIsLoading(false);
		}
	};

	const onSelectFormat = (formatId) => async (media) => {
		if (!media || !media.id || !formatId) {
			return;
		}

		setIsLoading(true);

		try {
			await assignFormat(media.id, formatId, id);
			setEncodeMessage(
				__(
					'Video format assigned successfully.',
					'video-embed-thumbnail-generator'
				)
			);
			fetchVideoFormats(); // Refresh the list
		} catch (error) {
			console.error('Error assigning video format:', error);
			setEncodeMessage(
				sprintf(
					/* translators: %s is an error message */
					__('Error: %s', 'video-embed-thumbnail-generator'),
					error.message
				)
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Deletes the actual media file (WP Attachment)
	const handleFileDelete = async (formatId) => {
		const formatData = videoFormats?.[formatId];
		if (!formatData || !formatData.id) {
			setEncodeMessage(
				__(
					'Error: Cannot delete file, missing attachment ID.',
					'video-embed-thumbnail-generator'
				)
			);
			console.error(
				'Cannot delete file: Missing id for format',
				formatId
			);
			return;
		}
		setDeleteInProgress(formatId); // Mark this formatId as being deleted
		try {
			await deleteFile(formatData.id);
			setEncodeMessage(
				__(
					'File deleted successfully.',
					'video-embed-thumbnail-generator'
				)
			);
			fetchVideoFormats(); // Re-fetch to get the latest status from backend
		} catch (error) {
			console.error('File delete failed:', error);
			setEncodeMessage(
				/* translators: %s is an error message */
				sprintf(
					__(
						'Error deleting file: %s',
						'video-embed-thumbnail-generator'
					),
					error.message
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
					'Job cancelled/deleted successfully.',
					'video-embed-thumbnail-generator'
				)
			);
			fetchVideoFormats(); // Re-fetch to get the latest status
		} catch (error) {
			console.error('Job delete failed:', error);
			setEncodeMessage(
				/* translators: %s is an error message */
				sprintf(
					__(
						'Error deleting job: %s',
						'video-embed-thumbnail-generator'
					),
					error.message
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
			if (itemToDelete.type === 'file' && itemToDelete.id) {
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
					obj.status !== 'queued' &&
					obj.status !== 'processing' &&
					obj.status !== 'completed' &&
					obj.status !== 'pending_replacement'
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
		isLoading || ffmpeg_exists !== true || !somethingToEncode();

	const confirmDialogMessage = () => {
		if (!itemToDelete) {
			return '';
		}
		if (itemToDelete.type === 'file') {
			return sprintf(
				/* translators: %s is the name of a video format (eg: H264 MP4 HD (720p) ) */
				__(
					'You are about to permanently delete the encoded %s video file from your site. This action cannot be undone.'
				),
				itemToDelete.name
			);
		}
		if (itemToDelete.type === 'job') {
			return sprintf(
				/* translators: %s is the name of a video format (eg: H264 MP4 HD (720p) ) */
				__(
					'You are about to permanently delete the encoding job for the %s video. This will also delete the encoded video file if it exists (if created by this job and not yet a separate attachment). This action cannot be undone.'
				),
				itemToDelete.name
			);
		}
	};

	const canUploadFiles = useSelect(
		(select) => select(coreStore).canUser('create', 'media', id),
		[id]
	);

	const groupedFormats = Object.values(videoFormats).reduce((acc, format) => {
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
			// Prioritize formats that replace the original video.
			if (a.replaces_original && !b.replaces_original) {
				return -1;
			}
			if (!a.replaces_original && b.replaces_original) {
				return 1;
			}
			// Otherwise, sort by resolution height in descending order.
			return b.resolution.height - a.resolution.height;
		});
		return acc;
	}, {});

	return (
		<>
			<PanelBody
				title={__(
					'Additional Formats',
					'video-embed-thumbnail-generator'
				)}
			>
				<PanelRow>
					{videoFormats ? (
						<>
							<ul
								className={`videopack-formats-list${ffmpeg_exists === true ? '' : ' no-ffmpeg'
									}`}
							>
								{Object.keys(groupedFormats).map((codecId) => {
									const codecGroup = groupedFormats[codecId];
									if (
										options.encode[codecId]?.enabled !==
										true
									) {
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
																formatData={
																	formatData
																}
																ffmpegExists={
																	ffmpeg_exists
																}
																onCheckboxChange={
																	handleFormatCheckbox
																}
																onSelectFormat={
																	onSelectFormat
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
																deleteInProgress={
																	deleteInProgress
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
						</>
					) : (
						<>
							<Spinner />
						</>
					)}
				</PanelRow>
				{ffmpeg_exists === true && videoFormats && canUploadFiles && (
					<PanelRow className="videopack-encode-button-row">
						<Button
							variant="secondary"
							onClick={handleEnqueue}
							title={encodeButtonTitle()}
							text={__(
								'Encode',
								'video-embed-thumbnail-generator'
							)}
							disabled={isEncodeButtonDisabled}
						></Button>
						{isLoading && <Spinner />}
						{encodeMessage && (
							<span className="videopack-encode-message">
								{encodeMessage}
							</span>
						)}
					</PanelRow>
				)}
			</PanelBody>
		</>
	);
};

export default AdditionalFormats;
