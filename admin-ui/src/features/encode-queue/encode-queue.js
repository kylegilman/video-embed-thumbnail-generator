/* global videopack */

import './encode-queue.scss';
import { __, sprintf } from '@wordpress/i18n';
import {
	createRoot,
	useState,
	useEffect,
	memo,
	useRef,
} from '@wordpress/element';
import {
	PanelBody,
	Button,
	Spinner,
	Icon,
	Notice,
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import EncodeProgress from '../../components/AdditionalFormats/EncodeProgress';
import {
	getQueue,
	toggleQueue,
	clearQueue,
	deleteJob,
	removeJob,
	getBatchProgress,
} from '../../utils/utils';

const JobRow = memo(
	({
		job,
		index,
		isMultisite,
		openConfirmDialog,
		deletingJobId,
		fetchQueue,
	}) => {
		return (
			<tr
				key={job.id}
				className={
					job.status === 'encoding' || job.status === 'processing'
						? 'videopack-job-encoding'
						: ''
				}
			>
				<td>{index + 1}</td>
				{isMultisite && <td>{job.blog_name}</td>}
				<td>
					{job.user_name ||
						__('N/A', 'video-embed-thumbnail-generator')}
				</td>
				<td>
					{job.poster_url ? (
						<img
							src={job.poster_url}
							alt={job.video_title}
							className="videopack-queue-attachment-poster"
						/>
					) : (
						<Icon icon="format-video" />
					)}
				</td>
				<td>
					{job.attachment_link ? (
						<a href={decodeEntities(job.attachment_link)}>
							{job.video_title}
						</a>
					) : (
						job.video_title
					)}
				</td>
				<td>{job.format_name}</td>
				<td className="videopack-status-cell">
					<div>{job.status_l10n}</div>
					{job.status === 'completed' && job.completed_at && (
						<div className="videopack-completion-time">
							{new Date(job.completed_at + 'Z').toLocaleString(
								[],
								{
									year: 'numeric',
									month: 'numeric',
									day: 'numeric',
									hour: 'numeric',
									minute: 'numeric',
								}
							)}
						</div>
					)}
					<EncodeProgress
						formatData={{
							...job,
							encoding_now:
								job.status === 'encoding' ||
								job.status === 'processing',
							job_id: job.id,
						}}
						onCancelJob={() =>
							openConfirmDialog('delete', { jobId: job.id })
						}
						deleteInProgress={deletingJobId}
						onRefresh={() => fetchQueue()}
					/>
				</td>
				<td>
					{job.status !== 'encoding' && (
						<Button
							variant="tertiary"
							isDestructive
							onClick={() =>
								openConfirmDialog('remove', { jobId: job.id })
							}
							isBusy={deletingJobId === job.id}
						>
							{__('Clear', 'video-embed-thumbnail-generator')}
						</Button>
					)}
				</td>
			</tr>
		);
	}
);

const EncodeQueue = () => {
	const [queueData, setQueueData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isQueuePaused, setIsQueuePaused] = useState(
		videopack.encodeQueueData.initialQueueState === 'pause'
	);
	const [message, setMessage] = useState(null);
	const [isClearing, setIsClearing] = useState(false);
	const [isTogglingQueue, setIsTogglingQueue] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [itemToActOn, setItemToActOn] = useState(null); // { action: 'clear'/'delete'/'remove', type: 'completed'/'all', jobId: ? }
	const [deletingJobId, setDeletingJobId] = useState(null);
	const [batchProgress, setBatchProgress] = useState({});
	const progressTimerRef = useRef(null);

	// Auto-clear success messages after 30 seconds.
	useEffect(() => {
		if (message && message.type === 'success') {
			const timer = setTimeout(() => {
				setMessage(null);
			}, 30000);
			return () => clearTimeout(timer);
		}
	}, [message]);

	const isEncoding = queueData.some(
		(job) => job.status === 'encoding' || job.status === 'processing'
	);

	const incrementEncodeProgress = () => {
		setQueueData((currentQueueData) => {
			if (!currentQueueData) {
				return currentQueueData;
			}

			const anyActive = currentQueueData.some(
				(job) =>
					job.status === 'encoding' || job.status === 'processing'
			);
			if (!anyActive) {
				return currentQueueData;
			}

			const updatedQueueData = [...currentQueueData];
			const now = new Date().getTime() / 1000;

			updatedQueueData.forEach((job, index) => {
				if (
					(job.status === 'encoding' ||
						job.status === 'processing') &&
					job.progress &&
					job.started
				) {
					// Handle potential clock drift between server and client
					const elapsed = Math.max(0, now - job.started);
					let percent = parseFloat(job.progress.percent) || 0;
					let remaining = job.progress.remaining;

					if (job.video_duration && job.video_duration > 0) {
						const totalDurationInSeconds =
							job.video_duration / 1000000;
						const speedMatch = job.progress.speed
							? String(job.progress.speed).match(/(\d*\.?\d+)/)
							: null;
						const speed = speedMatch
							? parseFloat(speedMatch[1])
							: 1;

						// Interpolate progress
						const interpolatedPercent =
							(elapsed * speed * 100) / totalDurationInSeconds;

						// Don't let interpolation go backwards or exceed 99%
						// 100% should only be set by the server response
						percent = Math.min(
							99,
							Math.max(percent, interpolatedPercent)
						);

						const remainingSeconds =
							(totalDurationInSeconds -
								(totalDurationInSeconds * percent) / 100) /
							speed;
						remaining = Math.max(0, remainingSeconds);
					}

					updatedQueueData[index] = {
						...job,
						progress: {
							...job.progress,
							elapsed,
							remaining,
							percent,
						},
					};
				}
			});
			return updatedQueueData;
		});
	};

	const fetchQueue = async () => {
		try {
			const newData = await getQueue();
			setQueueData((prevData) => {
				if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
					return newData;
				}
				return prevData;
			});

			const progressData = await getBatchProgress('all');
			setBatchProgress(progressData);
		} catch (error) {
			console.error('Error fetching queue:', error);
			setMessage({
				type: 'error',
				text: sprintf(
					/* translators: %s is an error message */
					__(
						'Failed to load queue: %s',
						'video-embed-thumbnail-generator'
					),
					error.message || error.code
				),
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchQueue();
		const interval = setInterval(fetchQueue, 15000); // Poll every 15 seconds
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (isEncoding) {
			if (progressTimerRef.current === null) {
				progressTimerRef.current = setInterval(
					incrementEncodeProgress,
					1000
				);
			}
		} else {
			clearInterval(progressTimerRef.current);
			progressTimerRef.current = null;
		}

		return () => {
			if (progressTimerRef.current !== null) {
				clearInterval(progressTimerRef.current);
				progressTimerRef.current = null;
			}
		};
	}, [isEncoding]);

	const handleToggleQueue = async () => {
		setIsTogglingQueue(true);
		const action = isQueuePaused ? 'play' : 'pause';
		try {
			const response = await toggleQueue(action);
			setIsQueuePaused(response.queue_state === 'pause');
			setMessage({ type: 'success', text: response.message });
			fetchQueue(); // Refresh queue data after state change
		} catch (error) {
			console.error('Error toggling queue:', error);
			setMessage({
				type: 'error',
				text: sprintf(
					/* translators: %s is an error message */
					__(
						'Failed to toggle queue: %s',
						'video-embed-thumbnail-generator'
					),
					error.message || error.code
				),
			});
		} finally {
			setIsTogglingQueue(false);
		}
	};

	const openConfirmDialog = (action, details) => {
		setItemToActOn({ action, ...details });
		setIsConfirmOpen(true);
	};

	const handleConfirm = () => {
		if (!itemToActOn) {
			return;
		}

		if (itemToActOn.action === 'clear') {
			handleClearQueue(itemToActOn.type);
		} else if (itemToActOn.action === 'delete') {
			handleDeleteJob(itemToActOn.jobId);
		} else if (itemToActOn.action === 'remove') {
			handleRemoveJob(itemToActOn.jobId);
		}
		setIsConfirmOpen(false);
		setItemToActOn(null);
	};

	const handleClearQueue = async (type) => {
		setIsClearing(true);
		try {
			const response = await clearQueue(type);
			setMessage({ type: 'success', text: response.message });
			fetchQueue(); // Refresh queue data
		} catch (error) {
			console.error('Error clearing queue:', error);
			setMessage({
				type: 'error',
				text: sprintf(
					/* translators: %s is an error message */
					__(
						'Failed to clear queue: %s',
						'video-embed-thumbnail-generator'
					),
					error.message || error.code
				),
			});
		} finally {
			setIsClearing(false);
		}
	};

	const handleDeleteJob = async (jobId) => {
		setDeletingJobId(jobId);
		try {
			await deleteJob(jobId);
			setMessage({
				type: 'success',
				text: __('Job deleted.', 'video-embed-thumbnail-generator'),
			});
			fetchQueue();
		} catch (error) {
			console.error('Error deleting job:', error);
			setMessage({
				type: 'error',
				text: sprintf(
					/* translators: %s is an error message */
					__(
						'Error deleting job: %s',
						'video-embed-thumbnail-generator'
					),
					error.message
				),
			});
		} finally {
			setDeletingJobId(null);
		}
	};

	const handleRemoveJob = async (jobId) => {
		setDeletingJobId(jobId);
		try {
			await removeJob(jobId);
			setMessage({
				type: 'success',
				text: __(
					'Job removed from queue.',
					'video-embed-thumbnail-generator'
				),
			});
			fetchQueue();
		} catch (error) {
			console.error('Error removing job:', error);
			setMessage({
				type: 'error',
				text: sprintf(
					/* translators: %s is an error message */
					__(
						'Error removing job: %s',
						'video-embed-thumbnail-generator'
					),
					error.message
				),
			});
		} finally {
			setDeletingJobId(null);
		}
	};

	const isMultisite =
		videopack.isMultisite || videopack.encodeQueueData?.isNetwork;

	return (
		<div className="wrap videopack-encode-queue">
			<h1>{__('Videopack Queue', 'video-embed-thumbnail-generator')}</h1>

			{Object.entries(batchProgress).map(([type, progress]) => {
				if (
					!progress ||
					(progress.pending === 0 && progress['in-progress'] === 0)
				) {
					return null;
				}

				const labels = {
					featured: __(
						'Setting Featured Images',
						'video-embed-thumbnail-generator'
					),
					parents: __(
						'Updating Parents',
						'video-embed-thumbnail-generator'
					),
					thumbs: __(
						'Generating Thumbnails (FFmpeg)',
						'video-embed-thumbnail-generator'
					),
					encoding: __(
						'Bulk Encoding',
						'video-embed-thumbnail-generator'
					),
					browser: __(
						'Pending In-Browser Thumbnails',
						'video-embed-thumbnail-generator'
					),
				};

				const label = labels[type] || type;

				return (
					<PanelBody
						key={type}
						title={label}
						initialOpen={true}
						className="videopack-batch-progress-panel"
					>
						<div className="videopack-batch-progress-content">
							{type === 'browser' ? (
								<p>
									{sprintf(
										/* translators: %d: number of videos waiting for browser-side processing */
										__(
											'Waiting for processing: %d',
											'video-embed-thumbnail-generator'
										),
										progress.pending
									)}
								</p>
							) : (
								<>
									<div className="videopack-batch-stats">
										<span>
											{sprintf(
												/* translators: %d: number of pending items */
												__(
													'Pending: %d',
													'video-embed-thumbnail-generator'
												),
												progress.pending
											)}
										</span>
										<span>
											{sprintf(
												/* translators: %d: number of in-progress items */
												__(
													'In-Progress: %d',
													'video-embed-thumbnail-generator'
												),
												progress['in-progress']
											)}
										</span>
										<span>
											{sprintf(
												/* translators: %d: number of completed items */
												__(
													'Completed: %d',
													'video-embed-thumbnail-generator'
												),
												progress.complete
											)}
										</span>
										{progress.failed > 0 && (
											<span className="videopack-failed-count">
												{sprintf(
													/* translators: %d: number of failed items */
													__(
														'Failed: %d',
														'video-embed-thumbnail-generator'
													),
													progress.failed
												)}
											</span>
										)}
									</div>
									{progress.total > 0 && (
										<div className="videopack-meter">
											<div
												className="videopack-meter-bar"
												style={{
													width: `${Math.round(
														((progress.complete +
															progress.failed) /
															progress.total) *
														100
													)}%`,
												}}
											></div>
										</div>
									)}
								</>
							)}
						</div>
					</PanelBody>
				);
			})}

			{message && (
				<Notice status={message.type} onRemove={() => setMessage(null)}>
					{message.text}
				</Notice>
			)}

			<ConfirmDialog
				isOpen={isConfirmOpen}
				onConfirm={handleConfirm}
				onCancel={() => setIsConfirmOpen(false)}
				className="videopack-confirm-dialog"
			>
				{itemToActOn?.action === 'clear'
					? sprintf(
						/* translators: %s: jobs type ('completed' or 'all') */
						__(
							'Are you sure you want to clear %s jobs?',
							'video-embed-thumbnail-generator'
						),
						itemToActOn.type
					)
					: __(
						'Are you sure you want to remove this job?',
						'video-embed-thumbnail-generator'
					)}
			</ConfirmDialog>

			<PanelBody>
				<div className="videopack-queue-controls">
					<Button
						variant="primary"
						onClick={handleToggleQueue}
						isBusy={isTogglingQueue}
					>
						<Icon
							icon={
								isQueuePaused
									? 'controls-play'
									: 'controls-pause'
							}
						/>
						{isQueuePaused
							? __(
								'Play Queue',
								'video-embed-thumbnail-generator'
							)
							: __(
								'Pause Queue',
								'video-embed-thumbnail-generator'
							)}
					</Button>
					<Button
						variant="secondary"
						onClick={() =>
							openConfirmDialog('clear', { type: 'completed' })
						}
						isBusy={isClearing}
					>
						{__(
							'Clear Completed',
							'video-embed-thumbnail-generator'
						)}
					</Button>
					<Button
						variant="tertiary"
						isDestructive
						onClick={() =>
							openConfirmDialog('clear', { type: 'all' })
						}
						isBusy={isClearing}
					>
						{__('Clear All', 'video-embed-thumbnail-generator')}
					</Button>
					{isLoading && <Spinner />}
				</div>
				<Divider />
				<table
					className={`wp-list-table widefat striped table-view-list videopack-queue-table ${isMultisite ? 'is-multisite' : ''
						}`}
				>
					<thead>
						<tr>
							<th>
								{__('Order', 'video-embed-thumbnail-generator')}
							</th>
							{isMultisite && (
								<th>
									{__(
										'Site',
										'video-embed-thumbnail-generator'
									)}
								</th>
							)}
							<th>
								{__('User', 'video-embed-thumbnail-generator')}
							</th>
							<th>
								{__(
									'Thumbnail',
									'video-embed-thumbnail-generator'
								)}
							</th>
							<th>
								{__('File', 'video-embed-thumbnail-generator')}
							</th>
							<th>
								{__(
									'Format',
									'video-embed-thumbnail-generator'
								)}
							</th>
							<th>
								{__(
									'Status',
									'video-embed-thumbnail-generator'
								)}
							</th>
							<th>
								{__(
									'Actions',
									'video-embed-thumbnail-generator'
								)}
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading && (
							<tr className="videopack-queue-message-row">
								<td colSpan={isMultisite ? 8 : 7}>
									{__(
										'Loading queue…',
										'video-embed-thumbnail-generator'
									)}
								</td>
							</tr>
						)}
						{!isLoading && queueData.length === 0 && (
							<tr className="videopack-queue-message-row">
								<td colSpan={isMultisite ? 8 : 7}>
									{__(
										'The encode queue is empty.',
										'video-embed-thumbnail-generator'
									)}
								</td>
							</tr>
						)}
						{!isLoading &&
							queueData.map((job, index) => (
								<JobRow
									key={job.id}
									job={job}
									index={index}
									isMultisite={isMultisite}
									openConfirmDialog={openConfirmDialog}
									deletingJobId={deletingJobId}
									fetchQueue={fetchQueue}
								/>
							))}
					</tbody>
				</table>
			</PanelBody>
		</div>
	);
};

// Render the component
document.addEventListener('DOMContentLoaded', function () {
	const rootElement =
		document.getElementById('videopack-queue-root') ||
		document.getElementById('videopack-network-queue-root');
	if (rootElement) {
		const root = createRoot(rootElement);
		root.render(<EncodeQueue />);
	}
});
