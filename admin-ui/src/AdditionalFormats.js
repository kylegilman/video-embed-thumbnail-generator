/* global videopack */

import { __, _x, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	CheckboxControl,
	Dashicon,
	Icon,
	PanelBody,
	PanelRow,
	Spinner,
	__experimentalDivider as Divider,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import {
	MediaUpload,
	MediaUploadCheck,
	__experimentalGetElementClassName,
} from '@wordpress/block-editor';
import { useRef, useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

const AdditionalFormats = ({
	setAttributes,
	attributes,
	attachmentRecord,
	options = {},
}) => {
	const { id, src, height } = attributes;
	const { ffmpeg_exists } = options;
	const [videoFormats, setVideoFormats] = useState();
	const [encodeMessage, setEncodeMessage] = useState();
	const [itemToDelete, setItemToDelete] = useState(null); // { type: 'file'/'job', formatId: string, jobId?: int, id?: int, name?: string }
	const [deleteInProgress, setDeleteInProgress] = useState(null); // Stores formatId or jobId being deleted
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isEncoding, setIsEncoding] = useState(false);
	const checkboxTimerRef = useRef(null);
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
		if (response && typeof response === 'object') {
			const newFormats = { ...response };
			Object.keys(newFormats).forEach((key) => {
				// When updating, preserve the existing 'checked' state.
				// This prevents the UI from losing state on a poll refresh.
				newFormats[key].checked = videoFormats?.[key]?.checked || false;
			});

			// Only update state if the formats have actually changed.
			if (!deepEqual(videoFormats, newFormats)) {
				setVideoFormats(newFormats);
			}
		} else if (!deepEqual(videoFormats, response)) {
			// Fallback for non-object responses
			setVideoFormats(response);
		}
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

	const checkIsEncoding = (formats) => {
		if (!formats) {
			return false;
		}
		// Check if any format has status 'processing' or 'encoding'
		return Object.values(formats).some(
			(format) =>
				format.hasOwnProperty('encoding_now') && format.encoding_now
		);
	};

	const incrementEncodeProgress = () => {
		console.log('progress');
		if (isEncoding) {
			// Use the state variable
			const updatedVideoFormats = Object.entries(videoFormats).reduce(
				(updated, [key, format]) => {
					if (!isEmpty(format.progress)) {
						const currentSeconds =
							format.progress.current_seconds +
							parseInt(format.progress.fps) / 30;

						let percentDone = Math.round(
							(format.progress.current_seconds /
								parseInt(format.progress.duration)) *
								100
						);
						if (percentDone > 100) {
							percentDone = 100;
						}

						if (percentDone !== 0) {
							format.progress.elapsed =
								format.progress.elapsed + 1;
							if (!isNaN(format.progress.remaining)) {
								if (format.progress.remaining > 0) {
									format.progress.remaining--;
								} else {
									format.progress.remaing = 0;
								}
							}
						}

						updated[key] = {
							...format,
							progress: {
								...format.progress,
								current_seconds: currentSeconds,
								elapsed: format.progress.elapsed,
								percent_done: percentDone,
								remaining: format.progress.remaining,
							},
						};
					} else {
						updated[key] = format;
					}
					return updated;
				},
				{}
			);

			setVideoFormats(updatedVideoFormats);
		}
	};

	useEffect(() => {
		setIsEncoding(checkIsEncoding(videoFormats));
	}, [videoFormats]);

	useEffect(() => {
		// Schedule polling for updates
		checkboxTimerRef.current = setTimeout(pollVideoFormats, 5000);

		// Manage progress timer based on encoding state
		if (!isEncoding) {
			clearInterval(progressTimerRef.current);
			progressTimerRef.current = null;

			return;
		}
		if (progressTimerRef.current === null) {
			progressTimerRef.current = setInterval(
				incrementEncodeProgress,
				1000
			);
		}

		return () => {
			if (progressTimerRef.current !== null) {
				clearInterval(progressTimerRef.current);
				progressTimerRef.current = null;
			}
			if (checkboxTimerRef.current !== null) {
				clearTimeout(checkboxTimerRef.current);
				checkboxTimerRef.current = null;
			}
		};
	}, [isEncoding]); // Depend on isEncoding state

	const handleFormatCheckbox = (event, format) => {
		setVideoFormats((prevVideoFormats) => {
			const updatedFormats = { ...prevVideoFormats };
			if (updatedFormats[format]) {
				updatedFormats[format].checked = event;
			}
			return updatedFormats;
		});
		// Note: Checkbox state is now purely UI. Saving to DB happens on "Encode" button click.
	};

	const onSelectFormat = (media) => {
		console.log('select');
	};

	const handleEnqueue = () => {
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
						if (response?.enqueue_data?.encode_list) {
							return new Intl.ListFormat(
								siteSettings?.language
									? siteSettings.language.replace('_', '-')
									: 'en-US',
								{ style: 'long', type: 'conjunction' }
							).format(
								Object.values(
									response?.enqueue_data?.encode_list
								)
							);
						}

						return '';
					})();

					if (response?.enqueue_data?.new_queue_position == false) {
						const queuePosition =
							response?.enqueue_data?.existing_queue_position;

						if (
							!JSON.stringify(
								response?.enqueue_data?.encode_list
							) !== '[]'
						) {
							return sprintf(
								__(
									'%1$s updated in existing queue entry in position %2$s.'
								),
								queueList,
								queuePosition
							);
						}

						return sprintf(
							__('Video is already %1$s in the queue.'),
							queuePosition
						);
					}
					if (response?.enqueue_data?.new_queue_position === 1) {
						return __('Starting…');
					}

					const queuePosition =
						response?.enqueue_data?.new_queue_position;

					return sprintf(
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
				setEncodeMessage(sprintf(__('Error: %s'), errorMessage));
				setIsLoading(false);
				fetchVideoFormats(); // Re-fetch to ensure UI is consistent
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

		if (
			formatData?.status === 'processing' &&
			!isEmpty(formatData?.progress)
		) {
			const percentText = sprintf(
				__('%d%%'),
				formatData.progress.percent_done
			);
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
								{formatData.progress.percent_done > 20 &&
									percentText}
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
					{sprintf(__('Error: %s'), formatData.error_message)}
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
				__(
					'You are about to permanently delete the encoded %s video file from your site. This action cannot be undone.'
				),
				itemToDelete.name
			);
		}
		if (itemToDelete.type === 'job') {
			return sprintf(
				__(
					'You are about to permanently delete the encoding job for the %s video. This will also delete the encoded video file if it exists (if created by this job and not yet a separate attachment). This action cannot be undone.'
				),
				itemToDelete.name
			);
		}
	};

	return (
		<>
			<PanelBody title={__('Additional Formats')}>
				<MediaUploadCheck>
					<PanelRow>
						{videoFormats ? (
							<>
								<ul
									className={`videopack-formats-list${ffmpeg_exists === true ? '' : ' no-ffmpeg'}`}
								>
									{videopack.settings.codecs.map((codec) => {
										if (
											!options.encode[codec.id] ||
											!options.encode[codec.id].enabled
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

															if (
																(options.hide_video_formats &&
																	!options
																		.encode[
																		codec.id
																	]
																		.resolutions[
																		resolution
																			.id
																	]) ||
																(ffmpeg_exists !==
																	true &&
																	resolution.id ===
																		'fullres')
															) {
																return null;
															}

															const isCheckboxDisabled =
																ffmpeg_exists !==
																	true ||
																formatData.exists;

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
																			checked={
																				formatData.checked
																			}
																			disabled={
																				isCheckboxDisabled
																			}
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
																			<Button
																				variant="secondary"
																				onClick={() =>
																					onSelectFormat(
																						formatData
																					)
																				} // Implement onSelectFormat for linking
																				className="videopack-format-button"
																				size="small"
																				title={__(
																					'Pick existing file'
																				)}
																			>
																				{__(
																					'Pick'
																				)}
																			</Button>
																		)}
																	{formatData.was_picked && ( // Show "Replace" if it was manually picked/linked
																		<MediaUpload
																			title={sprintf(
																				__(
																					'Replace %s'
																				),
																				formatData.label
																			)}
																			onSelect={
																				onSelectFormat
																			} // Implement replace logic
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
																	{(formatData.status ===
																		'processing' ||
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
					{ffmpeg_exists === true && videoFormats && (
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
				</MediaUploadCheck>
			</PanelBody>
		</>
	);
};

export default AdditionalFormats;
