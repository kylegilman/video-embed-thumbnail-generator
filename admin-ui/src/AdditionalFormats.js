/* global videopack */

import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	CheckboxControl,
	PanelBody,
	PanelRow,
	Spinner,
	__experimentalDivider as Divider,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { MediaUpload } from '@wordpress/media-utils';
import { useRef, useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import './additional-formats.scss';

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
	const queueApiPath = '/videopack/v1/queue';

	const deepEqual = (obj1, obj2) => {
		if (obj1 === obj2) {
			return true;
		}

		if (
			typeof obj1 !== 'object' ||
			typeof obj2 !== 'object' ||
			obj1 === null ||
			obj2 === null
		) {
			return false;
		}

		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);

		if (keys1.length !== keys2.length) {
			return false;
		}

		for (const key of keys1) {
			if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
				return false;
			}
		}

		return true;
	};

	const updateVideoFormats = (response) => {
		setVideoFormats((currentVideoFormats) => {
			if (response && typeof response === 'object') {
				const newFormats = { ...response };
				Object.keys(newFormats).forEach((key) => {
					const newFormat = newFormats[key];
					const oldFormat = currentVideoFormats?.[key];

					// Preserve the existing 'checked' state to prevent UI flicker on poll refresh.
					newFormat.checked = oldFormat?.checked || false;

					// If the format is encoding, merge progress data carefully.
					if (newFormat.encoding_now && newFormat.progress) {
						// If there's old progress data, merge it to prevent flashes of 0%.
						if (oldFormat?.progress) {
							newFormat.progress = {
								...oldFormat.progress,
								...newFormat.progress,
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
				if (!deepEqual(currentVideoFormats, newFormats)) {
					return newFormats;
				}
			} else if (!deepEqual(currentVideoFormats, response)) {
				// Fallback for non-object responses
				return response;
			}
			return currentVideoFormats;
		});
	};

	const fetchVideoFormats = () => {
		if (!id) {
			return;
		} // Don't fetch if there's no ID.
		apiFetch({ path: '/videopack/v1/formats/' + id }).then(
			updateVideoFormats
		);
	};

	const pollVideoFormats = () => {
		console.log('update');
		if (src && id) {
			apiFetch({ path: '/videopack/v1/formats/' + id, method: 'GET' })
				.then(updateVideoFormats)
				.catch((error) =>
					console.error('Error polling video formats:', error)
				);
		}
	};

	useEffect(() => {
		fetchVideoFormats();
	}, [id]); // Fetch formats when the attachment ID changes

	const isEmpty = (value) => {
		if (
			value === false ||
			value === null ||
			(Array.isArray(value) && value.length === 0) ||
			(typeof value === 'object' && Object.keys(value).length === 0)
		) {
			return true;
		}

		return false;
	};

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

	const incrementEncodeProgress = () => {
		setVideoFormats((currentVideoFormats) => {
			if (!currentVideoFormats || !isEncoding) {
				return currentVideoFormats;
			}

			const updatedVideoFormats = { ...currentVideoFormats };
			Object.keys(updatedVideoFormats).forEach((key) => {
				const format = updatedVideoFormats[key];
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

					updatedVideoFormats[key] = {
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
	};

	useEffect(() => {
		setIsEncoding(shouldPoll(videoFormats));
	}, [videoFormats]);

	useEffect(() => {
		let pollTimer = null;
		// Manage progress timer based on encoding state
		if (isEncoding) {
			// Start polling immediately and then every 5 seconds
			pollVideoFormats(); // Initial poll
			pollTimer = setInterval(pollVideoFormats, 5000);

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
			clearInterval(pollTimer);
			pollTimer = null;
		}

		return () => {
			if (progressTimerRef.current !== null) {
				clearInterval(progressTimerRef.current);
				progressTimerRef.current = null;
			}
			if (pollTimer !== null) {
				clearInterval(pollTimer);
				pollTimer = null;
			}
		};
	}, [isEncoding]); // Depend on isEncoding state

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

	const getCheckboxCheckedState = (formatData) => {
		return formatData.checked || formatData.status === 'queued';
	};

	const getCheckboxDisabledState = (formatData) => {
		return (
			formatData.exists ||
			formatData.status === 'queued' ||
			formatData.status === 'encoding' ||
			formatData.status === 'processing' ||
			formatData.status === 'completed'
		);
	};

	const handleEnqueue = () => {
		if (!window.videopack || !window.videopack.settings) {
			return <Spinner />;
		}

		setIsLoading(true);

		// Get list of format IDs that are checked and available
		const formatsToEncode = Object.entries(videoFormats)
			.filter(
				([key, value]) =>
					value.checked &&
					value.status !== 'queued' &&
					value.status !== 'processing' &&
					value.status !== 'completed'
			)
			.reduce((acc, [key, value]) => {
				acc[key] = true; // Backend expects an object { format_id: true, ... }
				return acc;
			}, {});

		apiFetch({
			path: `${queueApiPath}/${id}`,
			method: 'POST',
			data: {
				url: src,
				formats: formatsToEncode,
			},
		})
			.then((response) => {
				console.log(response);
				const queueMessage = () => {
					const queueList = (() => {
						if (
							response?.encode_list &&
							Array.isArray(response.encode_list) &&
							response.encode_list.length > 0
						) {
							return new Intl.ListFormat(
								siteSettings?.language
									? siteSettings.language.replace('_', '-')
									: 'en-US',
								{ style: 'long', type: 'conjunction' }
							).format(response.encode_list);
						}
						return '';
					})();

					if (!queueList) {
						if (response?.log?.length > 0) {
							return response.log.join(' ');
						}
						return __('No formats were added to the queue.');
					}

					const queuePosition = response?.new_queue_position;

					return sprintf(
						/* translators: %1$s is a list of video formats. %2$s is a number */
						__('%1$s added to queue in position %2$s.'),
						queueList,
						queuePosition
					);
				};
				setEncodeMessage(queueMessage());
				setIsLoading(false);
				fetchVideoFormats(); // Re-fetch to update statuses
			})
			.catch((error) => {
				console.error(error);
				// Use the detailed error messages from the server if available
				const errorMessage = error?.data?.details
					? error.data.details.join(', ')
					: error.message;
				/* translators: %s is an error message */
				setEncodeMessage(sprintf(__('Error: %s'), errorMessage));
				setIsLoading(false);
				fetchVideoFormats(); // Re-fetch to ensure UI is consistent
			});
	};

	const onSelectFormat = (formatId) => (media) => {
		if (!media || !media.id || !formatId) {
			return;
		}

		setIsLoading(true);

		const data = {
			meta: {
				'_kgflashmediaplayer-format': formatId,
				'_kgflashmediaplayer-parent': id,
			},
		};

		apiFetch({
			path: `/wp/v2/media/${media.id}`,
			method: 'POST',
			data,
		})
			.then(() => {
				setEncodeMessage(__('Video format assigned successfully.'));
				setIsLoading(false);
				fetchVideoFormats(); // Refresh the list
			})
			.catch((error) => {
				console.error('Error assigning video format:', error);
				setEncodeMessage(
					sprintf(
						/* translators: %s is an error message */
						__('Error: %s'),
						error.message
					)
				);
				setIsLoading(false);
			});
	};

	const formatPickable = (format) => {
		if (
			videoFormats &&
			videoFormats[format] &&
			// A format is "pickable" if the file doesn't exist AND it's not already queued/processing/completed
			((!videoFormats[format].exists &&
				videoFormats[format].status === 'not_encoded') ||
				videoFormats[format].was_picked) &&
			!videoFormats[format].encoding_now
		) {
			return true;
		}
		return false;
	};

	// Deletes the actual media file (WP Attachment)
	const handleFileDelete = (formatId) => {
		const formatData = videoFormats?.[formatId];
		if (!formatData || !formatData.id) {
			setEncodeMessage(
				__('Error: Cannot delete file, missing attachment ID.')
			);
			console.error(
				'Cannot delete file: Missing id for format',
				formatId
			);
			return;
		}
		setDeleteInProgress(formatId); // Mark this formatId as being deleted
		apiFetch({
			path: `/wp/v2/media/${formatData.id}?force=true`,
			method: 'DELETE',
		})
			.then(() => {
				setEncodeMessage(__('File deleted successfully.'));
				fetchVideoFormats(); // Re-fetch to get the latest status from backend
			})
			.catch((error) => {
				console.error('File delete failed:', error);
				setEncodeMessage(
					/* translators: %s is an error message */
					sprintf(__('Error deleting file: %s'), error.message)
				);
				fetchVideoFormats(); // Re-fetch to get the latest status
			})
			.finally(() => {
				setDeleteInProgress(null);
			});
	};

	// Deletes/Cancels a queue job
	const handleJobDelete = (jobId) => {
		if (!jobId) {
			setEncodeMessage(__('Error: Cannot delete job, missing job ID.'));
			console.error('Cannot delete job: Missing job ID');
			return;
		}
		setDeleteInProgress(jobId); // Mark this jobId as being deleted
		apiFetch({
			path: `${queueApiPath}/${jobId}`,
			method: 'DELETE',
		})
			.then((response) => {
				setEncodeMessage(__('Job cancelled/deleted successfully.'));
				fetchVideoFormats(); // Re-fetch to get the latest status
			})
			.catch((error) => {
				console.error('Job delete failed:', error);
				setEncodeMessage(
					/* translators: %s is an error message */
					sprintf(__('Error deleting job: %s'), error.message)
				);
				fetchVideoFormats(); // Re-fetch to get the latest status
			})
			.finally(() => {
				setDeleteInProgress(null);
			});
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

	const convertToTimecode = (time) => {
		if (time === null || time === undefined || isNaN(time)) {
			return '--:--';
		}
		const padZero = (num) => Math.floor(num).toString().padStart(2, '0');

		const h = Math.floor(time / 3600);
		const m = Math.floor((time % 3600) / 60);
		const s = Math.floor(time % 60);

		const hh = h > 0 ? padZero(h) + ':' : '';
		const mm = padZero(m);
		const ss = padZero(s);

		return hh + mm + ':' + ss;
	};

	const EncodeProgress = ({ format }) => {
		const formatData = videoFormats?.[format];

		if (formatData?.encoding_now && !isEmpty(formatData?.progress)) {
			const percent = Math.round(formatData.progress.percent);
			const percentText = sprintf('%d%%', percent);
			const onCancelJob = () => {
				if (formatData.job_id) {
					handleJobDelete(formatData.job_id);
				}
			};

			return (
				<div className="videopack-encode-progress">
					<div className="videopack-meter">
						<div
							className="videopack-meter-bar"
							style={{ width: percentText }}
						>
							<div className="videopack-meter-text">
								{percentText}
							</div>
						</div>
					</div>
					{formatData.job_id && (
						<Button
							onClick={onCancelJob}
							variant="secondary"
							isDestructive
							size="small"
							isBusy={deleteInProgress === formatData.job_id}
						>
							{__('Cancel')}
						</Button>
					)}
					<div className="videopack-encode-progress-small-text">
						<span>
							{__('Elapsed:') +
								' ' +
								convertToTimecode(formatData.progress.elapsed)}
						</span>
						<span>
							{__('Remaining:') +
								' ' +
								convertToTimecode(
									formatData.progress.remaining
								)}
						</span>
						<span>
							{__('fps:') + ' ' + formatData.progress.fps}
						</span>
					</div>
				</div>
			);
		}
		// Display error message if status is failed
		if (
			formatData?.status === 'failed' &&
			!isEmpty(formatData?.error_message)
		) {
			return (
				<div className="videopack-encode-error">
					{
						/* translators: %s is an error message */
						sprintf(__('Error: %s'), formatData.error_message)
					}
					{formatData.job_id && ( // Allow deleting failed jobs
						<Button
							onClick={() => openConfirmDialog('job', format)}
							variant="link"
							text={__('Delete Job')}
							isDestructive
							isBusy={deleteInProgress === formatData.job_id}
						/>
					)}
				</div>
			);
		}
		return null;
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
			return isLoading ? __('Loading…') : __('Encode selected formats');
		}

		return __('Select formats to encode');
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

	return (
		<>
			<PanelBody title={__('Additional Formats')}>
				{canUploadFiles && (
					<PanelRow>
						{videoFormats ? (
							<>
								<ul
									className={`videopack-formats-list${ffmpeg_exists === true ? '' : ' no-ffmpeg'}`}
								>
									{videopack.settings.codecs.map((codec) => {
										if (
											options.encode[codec.id]
												?.enabled !== '1'
										) {
											return null;
										}
										return (
											<li key={codec.id}>
												<h4 className="videopack-codec-name">
													{codec.name}
												</h4>
												<ul>
													{videopack.settings.resolutions.map(
														(resolution) => {
															const formatId = `${codec.id}_${resolution.id}`;
															const formatData =
																videoFormats[
																	formatId
																];

															if (!formatData) {
																return null;
															}
															return (
																<li
																	key={
																		formatId
																	}
																>
																	{ffmpeg_exists ===
																	true ? (
																		<CheckboxControl
																			__nextHasNoMarginBottom
																			className="videopack-format"
																			label={
																				formatData.label
																			}
																			checked={getCheckboxCheckedState(
																				formatData
																			)}
																			disabled={getCheckboxDisabledState(
																				formatData
																			)}
																			onChange={(
																				event
																			) =>
																				handleFormatCheckbox(
																					event,
																					formatId
																				)
																			}
																		/>
																	) : (
																		<span className="videopack-format">
																			{
																				formatData.label
																			}
																		</span>
																	)}
																	{formatData.status !==
																		'not_encoded' && (
																		<span className="videopack-format-status">
																			{
																				formatData.status_l10n
																			}
																		</span>
																	)}
																	{formatData.status ===
																		'not_encoded' &&
																		!formatData.was_picked && (
																			<MediaUpload
																				title={__(
																					'Pick existing file'
																				)}
																				onSelect={onSelectFormat(
																					formatId
																				)}
																				allowedTypes={[
																					'video',
																				]}
																				render={({
																					open,
																				}) => (
																					<Button
																						variant="secondary"
																						onClick={
																							open
																						}
																						className="videopack-format-button"
																						size="small"
																					>
																						{__(
																							'Pick'
																						)}
																					</Button>
																				)}
																			/>
																		)}
																	{formatData.was_picked && ( // Show "Replace" if it was manually picked/linked
																		<MediaUpload
																			title={sprintf(
																				/* translators: %s is the label of a video resolution (eg: 720p ) */
																				__(
																					'Replace %s'
																				),
																				formatData.label
																			)}
																			onSelect={onSelectFormat(
																				formatId
																			)} // Implement replace logic
																			allowedTypes={[
																				'video',
																			]}
																			render={({
																				open,
																			}) => (
																				<Button
																					variant="secondary"
																					onClick={
																						open
																					}
																					className="videopack-format-button"
																					size="small"
																					title={__(
																						'Replace file'
																					)}
																				>
																					{__(
																						'Replace'
																					)}
																				</Button>
																			)}
																		/>
																	)}
																	{formatData.deletable &&
																		formatData.id && ( // Delete FILE button
																			<Button
																				isBusy={
																					deleteInProgress ===
																					formatId
																				}
																				onClick={() =>
																					openConfirmDialog(
																						'file',
																						formatId
																					)
																				}
																				variant="link"
																				text={__(
																					'Delete Permanently'
																				)}
																				isDestructive
																			/>
																		)}
																	{(formatData.encoding_now ||
																		formatData.status ===
																			'failed') && (
																		<EncodeProgress
																			format={
																				formatId
																			}
																		/>
																	)}
																	<Divider />
																</li>
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
				)}
				{ffmpeg_exists === true && videoFormats && canUploadFiles && (
					<PanelRow>
						<Button
							variant="secondary"
							onClick={handleEnqueue}
							title={encodeButtonTitle()}
							text={__('Encode')}
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
