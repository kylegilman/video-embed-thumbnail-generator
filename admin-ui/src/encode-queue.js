import './encode-queue.scss';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useEffect, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	PanelBody,
	Button,
	Spinner,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableHeader,
	TableCell,
	Dashicon,
	Notice,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

// Helper to format duration from seconds to HH:MM:SS
const formatDuration = (seconds) => {
	if (isNaN(seconds) || seconds < 0) {
		return '--:--';
	}
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	const pad = (num) => num.toString().padStart(2, '0');
	return (h > 0 ? `${h}:` : '') + `${pad(m)}:${pad(s)}`;
};

const EncodeQueue = () => {
	const [queueData, setQueueData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isQueuePaused, setIsQueuePaused] = useState(
		videopack.encodeQueueData.initialQueueState === 'pause'
	);
	const [message, setMessage] = useState(null);
	const [isClearing, setIsClearing] = useState(false);
	const [isTogglingQueue, setIsTogglingQueue] = useState(false);
	const [deletingJobId, setDeletingJobId] = useState(null);
	const [retryingJobId, setRetryingJobId] = useState(null);

	const intervalRef = useRef(null);
	const pollInterval = 5000; // Poll every 5 seconds

	const { ffmpegExists } = videopack.encodeQueueData;

	// Use core data to get site language for Intl.ListFormat
	const siteLanguage = useSelect((select) => select('core').getSite()?.language);

	const fetchQueue = async () => {
		setIsLoading(true);
		try {
			const response = await apiFetch({
				path: '/videopack/v1/queue',
			});
			setQueueData(response);
			// Check if any job is currently processing to determine if polling should continue
			const anyProcessing = response.some(
				(job) => job.status === 'processing'
			);
			if (anyProcessing && !intervalRef.current) {
				intervalRef.current = setInterval(fetchQueue, pollInterval);
			} else if (!anyProcessing && intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		} catch (error) {
			console.error('Error fetching queue:', error);
			setMessage({
				type: 'error',
				text: sprintf(
					__('Failed to load queue: %s', 'video-embed-thumbnail-generator'),
					error.message || error.code
				),
			});
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchQueue();
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	const handleToggleQueue = async () => {
		setIsTogglingQueue(true);
		const action = isQueuePaused ? 'play' : 'pause';
		try {
			const response = await apiFetch({
				path: '/videopack/v1/queue/control',
				method: 'POST',
				data: { action },
			});
			setIsQueuePaused(response.queue_state === 'pause');
			setMessage({ type: 'success', text: response.message });
			fetchQueue(); // Refresh queue data after state change
		} catch (error) {
			console.error('Error toggling queue:', error);
			setMessage({
				type: 'error',
				text: sprintf(
					__('Failed to toggle queue: %s', 'video-embed-thumbnail-generator'),
					error.message || error.code
				),
			});
		} finally {
			setIsTogglingQueue(false);
		}
	};

	const handleClearQueue = async (type) => {
		if (
			!confirm(
				type === 'all'
					? __('Are you sure you want to clear all jobs?', 'video-embed-thumbnail-generator')
					: __('Are you sure you want to clear completed jobs?', 'video-embed-thumbnail-generator')
			)
		) {
			return;
		}

		setIsClearing(true);
		try {
			const response = await apiFetch({
				path: '/videopack/v1/queue/clear',
				method: 'DELETE',
				data: { type },
			});
			setMessage({ type: 'success', text: response.message });
			fetchQueue(); // Refresh queue data
		} catch (error) {
			console.error('Error clearing queue:', error);
			setMessage({
				type: 'error',
				text: sprintf(
					__('Failed to clear queue: %s', 'video-embed-thumbnail-generator'),
					error.message || error.code
				),
			});
		} finally {
			setIsClearing(false);
		}
	};

	const handleDeleteJob = async (jobId) => {
		if (!confirm(__('Are you sure you want to delete this job?', 'video-embed-thumbnail-generator'))) {
			return;
		}

		setDeletingJobId(jobId);
		try {
			const response = await apiFetch({
				path: `/videopack/v1/queue/${jobId}`,
				method: 'DELETE',
			});
			setMessage({ type: 'success', text: sprintf(__('Job %d deleted successfully.', 'video-embed-thumbnail-generator'), jobId) });
			fetchQueue(); // Refresh queue data
		} catch (error) {
			console.error('Error deleting job:', error);
			setMessage({
				type: 'error',
				text: sprintf(
					__('Failed to delete job %d: %s', 'video-embed-thumbnail-generator'),
					jobId,
					error.message || error.code
				),
			});
		} finally {
			setDeletingJobId(null);
		}
	};

	const handleRetryJob = async (jobId) => {
		setRetryingJobId(jobId);
		try {
			await apiFetch({
				path: `videopack/v1/queue/retry/${jobId}`,
				method: 'POST',
			});
			setMessage({ type: 'success', text: sprintf(__('Job %d has been re-queued.', 'video-embed-thumbnail-generator'), jobId) });
			fetchQueue(); // Refresh queue data
		} catch (error) {
			console.error('Error retrying job:', error);
			setMessage({
				type: 'error',
				text: sprintf(
					__('Failed to retry job %d: %s', 'video-embed-thumbnail-generator'),
					jobId,
					error.message || error.code
				),
			});
		} finally {
			setRetryingJobId(null);
		}
	};

	const getStatusDisplay = (job) => {
		if (job.status === 'processing' && job.progress) {
			const percent = job.progress.percent_done || 0;
			const elapsed = formatDuration(job.progress.elapsed);
			const remaining = formatDuration(job.progress.remaining);
			const fps = job.progress.fps || 0;
			return (
				<div>
					<div className="videopack-progress-bar-container">
						<div
							className="videopack-progress-bar"
							style={{ width: `${percent}%` }}
						>
							{percent > 5 && `${percent}%`}
						</div>
					</div>
					<small>
						{sprintf(__('Elapsed: %s', 'video-embed-thumbnail-generator'), elapsed)} |{' '}
						{sprintf(__('Remaining: %s', 'video-embed-thumbnail-generator'), remaining)} |{' '}
						{sprintf(__('FPS: %s', 'video-embed-thumbnail-generator'), fps)}
					</small>
				</div>
			);
		}
		return job.status_l10n || job.status;
	};

	return (
		<div className="wrap videopack-encode-queue">
			<h1>{__('Videopack Encode Queue', 'video-embed-thumbnail-generator')}</h1>

			{message && (
				<Notice status={message.type} onRemove={() => setMessage(null)}>
					{message.text}
				</Notice>
			)}

			<PanelBody>
				<div className="videopack-queue-controls">
					<Button
						variant="primary"
						onClick={handleToggleQueue}
						isBusy={isTogglingQueue}
						disabled={isLoading || isTogglingQueue || !ffmpegExists}
					>
						<Dashicon icon={isQueuePaused ? 'play' : 'pause'} />
						{isQueuePaused ? __('Play Queue', 'video-embed-thumbnail-generator') : __('Pause Queue', 'video-embed-thumbnail-generator')}
					</Button>
					<Button
						variant="secondary"
						onClick={() => handleClearQueue('completed')}
						isBusy={isClearing}
						disabled={isLoading || isClearing || !ffmpegExists}
					>
						{__('Clear Completed', 'video-embed-thumbnail-generator')}
					</Button>
					<Button
						variant="tertiary"
						isDestructive
						onClick={() => handleClearQueue('all')}
						isBusy={isClearing}
						disabled={isLoading || isClearing || !ffmpegExists}
					>
						{__('Clear All', 'video-embed-thumbnail-generator')}
					</Button>
					{isLoading && <Spinner />}
				</div>
				{!ffmpegExists && (
					<Notice status="warning" isDismissible={false}>
						{__('FFmpeg is not detected or configured. Encoding functions are disabled.', 'video-embed-thumbnail-generator')}
					</Notice>
				)}
				<Divider />
				{isLoading && queueData.length === 0 ? (
					<p>{__('Loading queue...', 'video-embed-thumbnail-generator')}</p>
				) : queueData.length === 0 ? (
					<p>{__('The encode queue is empty.', 'video-embed-thumbnail-generator')}</p>
				) : (
					<Table className="videopack-queue-table">
						<TableHead>
							<TableRow>
								<TableHeader>{__('ID', 'video-embed-thumbnail-generator')}</TableHeader>
								<TableHeader>{__('Thumbnail', 'video-embed-thumbnail-generator')}</TableHeader>
								<TableHeader>{__('Video Title', 'video-embed-thumbnail-generator')}</TableHeader>
								<TableHeader>{__('Format', 'video-embed-thumbnail-generator')}</TableHeader>
								<TableHeader>{__('Status', 'video-embed-thumbnail-generator')}</TableHeader>
								<TableHeader>{__('Actions', 'video-embed-thumbnail-generator')}</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{queueData.map((job) => (
								<TableRow key={job.job_id}>
									<TableCell>{job.job_id}</TableCell>
									<TableCell>
										{job.poster_url && (
											<img
												src={job.poster_url}
												alt={job.video_title}
												style={{ maxWidth: '80px', height: 'auto' }}
											/>
										)}
									</TableCell>
									<TableCell>{job.video_title}</TableCell>
									<TableCell>{job.format_name}</TableCell>
									<TableCell>{getStatusDisplay(job)}</TableCell>
									<TableCell>
										{job.status !== 'processing' && job.status !== 'queued' && job.status !== 'pending_replacement' && (
											<Button
												size="small"
												isDestructive
												onClick={() => handleDeleteJob(job.job_id)}
												isBusy={deletingJobId === job.job_id}
											>
												{__('Delete', 'video-embed-thumbnail-generator')}
											</Button>
										)}
										{(job.status === 'processing' || job.status === 'queued' || job.status === 'pending_replacement') && (
											<Button
												size="small"
												isDestructive
												onClick={() => handleDeleteJob(job.job_id)}
												isBusy={deletingJobId === job.job_id}
											>
												{__('Cancel', 'video-embed-thumbnail-generator')}
											</Button>
										)}
										{job.status === 'failed' && (
											<Button
												size="small"
												variant="secondary"
												onClick={() => handleRetryJob(job.job_id)}
												isBusy={ retryingJobId === job.job_id }
											>
												{__('Retry', 'video-embed-thumbnail-generator')}
											</Button>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</PanelBody>
		</div>
	);
};

// Render the component
document.addEventListener('DOMContentLoaded', function () {
	const rootElement = document.getElementById('videopack-queue-root');
	if (rootElement) {
		// Use createRoot for React 18+
		if (typeof ReactDOM !== 'undefined' && ReactDOM.createRoot) {
			const root = ReactDOM.createRoot(rootElement);
			root.render(<EncodeQueue />);
		} else if (typeof ReactDOM !== 'undefined' && ReactDOM.render) {
			// Fallback for older React versions
			ReactDOM.render(<EncodeQueue />, rootElement);
		} else {
			console.error('ReactDOM is not available. Cannot render React component.');
		}
	}
});
