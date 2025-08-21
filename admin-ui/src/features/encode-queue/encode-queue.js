/* global videopack */

import './encode-queue.scss';
import { __, sprintf } from '@wordpress/i18n';
import { createRoot, useState, useEffect, memo } from '@wordpress/element';
import {
	PanelBody,
	Button,
	Spinner,
	Icon,
	Notice,
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import EncodeProgress from '../../components/AdditionalFormats/EncodeProgress';
import {
	getQueue,
	toggleQueue,
	clearQueue,
	deleteJob,
	removeJob,
} from '../../utils/utils';

const JobRow = memo(
	({ job, index, isMultisite, openConfirmDialog, deletingJobId }) => {
		return (
			<tr key={job.id}>
				<td>{index + 1}</td>
				{isMultisite && <td>{job.blog_name}</td>}
				<td>{job.user_name || __('N/A')}</td>
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
						<a href={job.attachment_link}>{job.video_title}</a>
					) : (
						job.video_title
					)}
				</td>
				<td>{job.format_name}</td>
				<td>
					<div>{job.status_l10n}</div>
					<EncodeProgress
						formatData={{
							...job,
							encoding_now: job.status === 'encoding',
							job_id: job.id,
						}}
						onCancelJob={() =>
							openConfirmDialog('delete', { jobId: job.id })
						}
						deleteInProgress={deletingJobId}
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
							{__('Clear')}
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

	const fetchQueue = async () => {
		try {
			const newData = await getQueue();
			setQueueData((prevData) => {
				if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
					return newData;
				}
				return prevData;
			});
		} catch (error) {
			console.error('Error fetching queue:', error);
			setMessage({
				type: 'error',
				text: sprintf(
					/* translators: %s is an error message */
					__('Failed to load queue: %s'),
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
					__('Failed to toggle queue: %s'),
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
					__('Failed to clear queue: %s'),
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
			setMessage({ type: 'success', text: __('Job deleted.') });
			fetchQueue();
		} catch (error) {
			console.error('Error deleting job:', error);
			setMessage({
				type: 'error',
				text: sprintf(__('Error deleting job: %s'), error.message),
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
				text: __('Job removed from queue.'),
			});
			fetchQueue();
		} catch (error) {
			console.error('Error removing job:', error);
			setMessage({
				type: 'error',
				text: sprintf(__('Error removing job: %s'), error.message),
			});
		} finally {
			setDeletingJobId(null);
		}
	};

	const isMultisite = videopack.isMultisite;

	return (
		<div className="wrap videopack-encode-queue">
			<h1>{__('Videopack Encode Queue')}</h1>

			{message && (
				<Notice status={message.type} onRemove={() => setMessage(null)}>
					{message.text}
				</Notice>
			)}

			<ConfirmDialog
				isOpen={isConfirmOpen}
				onConfirm={handleConfirm}
				onCancel={() => setIsConfirmOpen(false)}
			>
				{itemToActOn?.action === 'clear'
					? sprintf(
							__('Are you sure you want to clear %s jobs?'),
							itemToActOn.type
						)
					: __('Are you sure you want to remove this job?')}
			</ConfirmDialog>

			<PanelBody>
				<div className="videopack-queue-controls">
					<Button
						variant="primary"
						onClick={handleToggleQueue}
						isBusy={isTogglingQueue}
					>
						<Icon icon={isQueuePaused ? 'controls-play' : 'controls-pause'} />
						{isQueuePaused ? __('Play Queue') : __('Pause Queue')}
					</Button>
					<Button
						variant="secondary"
						onClick={() =>
							openConfirmDialog('clear', { type: 'completed' })
						}
						isBusy={isClearing}
					>
						{__('Clear Completed')}
					</Button>
					<Button
						variant="tertiary"
						isDestructive
						onClick={() =>
							openConfirmDialog('clear', { type: 'all' })
						}
						isBusy={isClearing}
					>
						{__('Clear All')}
					</Button>
					{isLoading && <Spinner />}
				</div>
				<Divider />
				<table className="wp-list-table widefat fixed striped table-view-list videopack-queue-table">
					<thead>
						<tr>
							<th>{__('Order')}</th>
							{isMultisite && <th>{__('Site')}</th>}
							<th>{__('User')}</th>
							<th>{__('Thumbnail')}</th>
							<th>{__('File')}</th>
							<th>{__('Format')}</th>
							<th>{__('Status')}</th>
							<th>{__('Actions')}</th>
						</tr>
					</thead>
					<tbody>
						{isLoading && (
							<tr>
								<td colSpan={isMultisite ? 8 : 7}>
									{__('Loading queue…')}
								</td>
							</tr>
						)}
						{!isLoading && queueData.length === 0 && (
							<tr>
								<td colSpan={isMultisite ? 8 : 7}>
									{__('The encode queue is empty.')}
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
	const rootElement = document.getElementById('videopack-queue-root');
	if (rootElement) {
		const root = createRoot(rootElement);
		root.render(<EncodeQueue />);
	}
});
