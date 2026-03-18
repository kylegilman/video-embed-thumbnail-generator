/**
 * Features for managing the video encoding queue.
 */

import './encode-queue.scss';
import { __, sprintf } from '@wordpress/i18n';
import {
	createRoot,
	useState,
	useEffect,
	useCallback,
	useMemo,
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
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { decodeEntities } from '@wordpress/html-entities';
import EncodeFormatStatus from '../../components/AdditionalFormats/EncodeFormatStatus';
import {
	getQueue,
	toggleQueue,
	clearQueue,
	deleteJob,
	retryJob,
	removeJob,
	getBatchProgress,
} from '../../utils/utils';

const defaultLayouts = {
	table: {
		layout: {
			density: 'compact',
		},
	},
};

/**
 * EncodeQueue component.
 *
 * @return {Object} The rendered component.
 */
const EncodeQueue = () => {
	const [queueData, setQueueData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isQueuePaused, setIsQueuePaused] = useState(
		window.videopack?.encodeQueueData?.initialQueueState === 'pause'
	);
	const [message, setMessage] = useState(null);
	const [isClearing, setIsClearing] = useState(false);
	const [isTogglingQueue, setIsTogglingQueue] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [itemToActOn, setItemToActOn] = useState(null); // { action: 'clear'/'delete'/'remove', type: 'completed'/'all', jobIds: [] }
	const [actingJobIds, setActingJobIds] = useState([]);
	const [batchProgress, setBatchProgress] = useState({});

	const isMultisite =
		window.videopack?.isMultisite ||
		window.videopack?.encodeQueueData?.isNetwork;

	const [view, setView] = useState({
		type: 'table',
		perPage: 10,
		page: 1,
		sort: {
			field: 'queue_order',
			direction: 'asc',
		},
		fields: [
			'queue_order',
			'poster',
			'blog_name',
			'user_name',
			'video_title',
			'format_name',
			'status',
		].filter((field) => (field === 'blog_name' ? isMultisite : true)),
		layout: defaultLayouts.table.layout,
	});

	// Auto-clear success messages after 30 seconds.
	useEffect(() => {
		if (message && message.type === 'success') {
			const timer = setTimeout(() => {
				setMessage(null);
			}, 30000);
			return () => clearTimeout(timer);
		}
	}, [message]);
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
			handleDeleteJobs(itemToActOn.jobIds);
		} else if (itemToActOn.action === 'remove') {
			handleRemoveJobs(itemToActOn.jobIds);
		} else if (itemToActOn.action === 'delete_permanently') {
			handleDeleteJobs(itemToActOn.jobIds);
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

	const handleDeleteJobs = async (jobIds) => {
		const ids = Array.isArray(jobIds) ? jobIds : [jobIds];
		setActingJobIds((prev) => [...prev, ...ids]);
		try {
			for (const jobId of ids) {
				await deleteJob(jobId);
			}
			setMessage({
				type: 'success',
				text:
					ids.length === 1
						? __('Job deleted.', 'video-embed-thumbnail-generator')
						: sprintf(
								/* translators: %d: number of jobs deleted */
								__(
									'%d jobs deleted.',
									'video-embed-thumbnail-generator'
								),
								ids.length
							),
			});
			fetchQueue();
		} catch (error) {
			console.error('Error deleting job(s):', error);
			setMessage({
				type: 'error',
				text: sprintf(
					/* translators: %s is an error message */
					__(
						'Error deleting job(s): %s',
						'video-embed-thumbnail-generator'
					),
					error.message
				),
			});
		} finally {
			setActingJobIds((prev) => prev.filter((id) => !ids.includes(id)));
		}
	};

	const handleRemoveJobs = async (jobIds) => {
		const ids = Array.isArray(jobIds) ? jobIds : [jobIds];
		setActingJobIds((prev) => [...prev, ...ids]);
		try {
			for (const jobId of ids) {
				await removeJob(jobId);
			}
			setMessage({
				type: 'success',
				text:
					ids.length === 1
						? __(
								'Job removed from queue.',
								'video-embed-thumbnail-generator'
							)
						: sprintf(
								/* translators: %d: number of jobs removed */
								__(
									'%d jobs removed from queue.',
									'video-embed-thumbnail-generator'
								),
								ids.length
							),
			});
			fetchQueue();
		} catch (error) {
			console.error('Error removing job(s):', error);
			setMessage({
				type: 'error',
				text: sprintf(
					/* translators: %s is an error message */
					__(
						'Error removing job(s): %s',
						'video-embed-thumbnail-generator'
					),
					error.message
				),
			});
		} finally {
			setActingJobIds((prev) => prev.filter((id) => !ids.includes(id)));
		}
	};

	const handleRetryJobs = useCallback(async (jobIds) => {
		const ids = Array.isArray(jobIds) ? jobIds : [jobIds];
		setActingJobIds((prev) => [...prev, ...ids]);
		try {
			for (const jobId of ids) {
				await retryJob(jobId);
			}
			setMessage({
				type: 'success',
				text:
					ids.length === 1
						? __(
								'Job re-queued.',
								'video-embed-thumbnail-generator'
							)
						: sprintf(
								/* translators: %d: number of jobs re-queued */
								__(
									'%d jobs re-queued.',
									'video-embed-thumbnail-generator'
								),
								ids.length
							),
			});
			fetchQueue();
		} catch (error) {
			console.error('Error retrying job(s):', error);
			setMessage({
				type: 'error',
				text: sprintf(
					/* translators: %s is an error message */
					__(
						'Error retrying job(s): %s',
						'video-embed-thumbnail-generator'
					),
					error.message
				),
			});
		} finally {
			setActingJobIds((prev) => prev.filter((id) => !ids.includes(id)));
		}
	}, []);

	const fields = useMemo(
		() =>
			[
				{
					id: 'queue_order',
					label: __('#', 'video-embed-thumbnail-generator'),
					getValue: ({ item }) => item.queue_order,
					enableSorting: true,
					type: 'integer',
				},
				{
					id: 'poster',
					label: __('Thumbnail', 'video-embed-thumbnail-generator'),
					getValue: ({ item }) => item.poster_url,
					render: ({ item }) =>
						item.poster_url ? (
							<img
								src={item.poster_url}
								alt={item.video_title}
								className="videopack-queue-attachment-poster"
							/>
						) : (
							<Icon icon="format-video" />
						),
					enableHiding: false,
					enableSorting: false,
				},
				{
					id: 'blog_name',
					label: __('Site', 'video-embed-thumbnail-generator'),
					getValue: ({ item }) => item.blog_name,
					enableSorting: isMultisite,
				},
				{
					id: 'user_name',
					label: __('User', 'video-embed-thumbnail-generator'),
					getValue: ({ item }) =>
						item.user_name ||
						__('N/A', 'video-embed-thumbnail-generator'),
					enableSorting: true,
				},
				{
					id: 'video_title',
					label: __('File', 'video-embed-thumbnail-generator'),
					getValue: ({ item }) => item.video_title,
					render: ({ item }) =>
						item.attachment_link ? (
							<a href={decodeEntities(item.attachment_link)}>
								{decodeEntities(item.video_title)}
							</a>
						) : (
							decodeEntities(item.video_title)
						),
					enableSorting: true,
				},
				{
					id: 'format_name',
					label: __('Format', 'video-embed-thumbnail-generator'),
					getValue: ({ item }) => item.format_name,
					enableSorting: true,
				},
				{
					id: 'status',
					label: __('Status', 'video-embed-thumbnail-generator'),
					getValue: ({ item }) => item.status_l10n,
					render: ({ item }) => (
						<div
							className={`videopack-status-cell ${
								[
									'encoding',
									'processing',
									'needs_insert',
									'pending_replacement',
								].includes(item.status)
									? 'videopack-job-running'
									: ''
							}`}
						>
							<ul className="videopack-format-list">
								<EncodeFormatStatus
									formatId={item.preset || item.format_id}
									formatData={{
										...item,
										encoding_now: [
											'encoding',
											'processing',
											'needs_insert',
											'pending_replacement',
										].includes(item.status),
										job_id: item.id,
										label: item.status_l10n,
									}}
									onCancelJob={() =>
										openConfirmDialog('delete', {
											jobIds: [item.id],
										})
									}
									deleteInProgress={actingJobIds.includes(
										item.id
									)}
									onRefresh={() => fetchQueue()}
									showLabel={false}
									hideCancel={true}
								/>
							</ul>
						</div>
					),
					enableSorting: true,
				},
				{
					id: 'created_at',
					label: __('Created', 'video-embed-thumbnail-generator'),
					getValue: ({ item }) =>
						item.created_at ||
						(item.started
							? new Date(item.started * 1000).toISOString()
							: ''),
					render: ({ item }) => {
						let date = null;
						if (item.created_at) {
							date = new Date(item.created_at);
						} else if (item.started) {
							date = new Date(item.started * 1000);
						}
						return date ? date.toLocaleString() : '';
					},
					enableSorting: true,
				},
			].filter((field) =>
				field.id === 'blog_name' ? isMultisite : true
			),
		[actingJobIds, isMultisite]
	);

	const actions = useMemo(
		() => [
			{
				id: 'clear',
				label: __('Clear', 'video-embed-thumbnail-generator'),
				isDestructive: true,
				isPrimary: true,
				supportsBulk: true,
				isEligible: (item) =>
					[
						'completed',
						'failed',
						'canceled',
						'queued',
						'deleted',
					].includes(item.status),
				callback: (items) => {
					const eligibleItems = items.filter((item) =>
						[
							'completed',
							'failed',
							'canceled',
							'queued',
							'deleted',
						].includes(item.status)
					);
					if (eligibleItems.length > 0) {
						openConfirmDialog('remove', {
							jobIds: eligibleItems.map((i) => i.id),
						});
					}
				},
			},
			{
				id: 'cancel',
				label: __('Cancel', 'video-embed-thumbnail-generator'),
				isDestructive: true,
				supportsBulk: true,
				isEligible: (item) =>
					[
						'encoding',
						'processing',
						'needs_insert',
						'pending_replacement',
					].includes(item.status),
				callback: (items) => {
					const eligibleItems = items.filter((item) =>
						[
							'encoding',
							'processing',
							'needs_insert',
							'pending_replacement',
						].includes(item.status)
					);
					if (eligibleItems.length > 0) {
						openConfirmDialog('delete', {
							jobIds: eligibleItems.map((i) => i.id),
						});
					}
				},
			},
			{
				id: 'retry',
				label: __('Retry', 'video-embed-thumbnail-generator'),
				supportsBulk: true,
				isEligible: (item) =>
					['failed', 'canceled', 'deleted', 'error'].includes(
						item.status
					),
				callback: (items) => {
					const eligibleItems = items.filter((item) =>
						['failed', 'canceled', 'deleted', 'error'].includes(
							item.status
						)
					);
					if (eligibleItems.length > 0) {
						handleRetryJobs(eligibleItems.map((i) => i.id));
					}
				},
			},
			{
				id: 'delete_permanently',
				label: __(
					'Delete Permanently',
					'video-embed-thumbnail-generator'
				),
				isDestructive: true,
				supportsBulk: true,
				isEligible: (item) =>
					item.status === 'completed' && !!item.output_id,
				callback: (items) => {
					const eligibleItems = items.filter(
						(item) =>
							item.status === 'completed' && !!item.output_id
					);
					if (eligibleItems.length > 0) {
						openConfirmDialog('delete_permanently', {
							jobIds: eligibleItems.map((i) => i.id),
						});
					}
				},
			},
		],
		[handleRetryJobs]
	);

	// "processedData" and "paginationInfo" definition
	const { data: processedData, paginationInfo } = useMemo(() => {
		return filterSortAndPaginate(queueData, view, fields);
	}, [queueData, view, fields]);

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
						</div>
					</PanelBody>
				);
			})}

			{message && (
				<Notice status={message.type} onRemove={() => setMessage(null)}>
					{message.text}
				</Notice>
			)}

			{isConfirmOpen && (
				<ConfirmDialog
					isOpen={isConfirmOpen}
					title={(() => {
						if (itemToActOn?.action === 'delete_permanently') {
							return __(
								'Delete Attachment?',
								'video-embed-thumbnail-generator'
							);
						}
						return __(
							'Confirm Action',
							'video-embed-thumbnail-generator'
						);
					})()}
					confirmButtonText={(() => {
						if (itemToActOn?.action === 'delete_permanently') {
							return __(
								'Delete',
								'video-embed-thumbnail-generator'
							);
						}
						return __('Confirm', 'video-embed-thumbnail-generator');
					})()}
					onConfirm={handleConfirm}
					onCancel={() => setIsConfirmOpen(false)}
				>
					{(() => {
						const count = itemToActOn?.jobIds?.length || 0;
						if (itemToActOn?.action === 'delete_permanently') {
							return count > 1
								? sprintf(
										/* translators: %d: number of items */
										__(
											'Are you sure you want to permanently delete these %d attachments? This action cannot be undone.',
											'video-embed-thumbnail-generator'
										),
										count
									)
								: __(
										'Are you sure you want to permanently delete this attachment? This action cannot be undone.',
										'video-embed-thumbnail-generator'
									);
						}
						if (itemToActOn?.action === 'remove') {
							return count > 1
								? sprintf(
										/* translators: %d: number of items */
										__(
											'Are you sure you want to remove these %d jobs? This will not delete any files.',
											'video-embed-thumbnail-generator'
										),
										count
									)
								: __(
										'Are you sure you want to remove this job? This will not delete any files.',
										'video-embed-thumbnail-generator'
									);
						}
						if (itemToActOn?.action === 'delete') {
							return count > 1
								? sprintf(
										/* translators: %d: number of items */
										__(
											'Are you sure you want to cancel these %d jobs?',
											'video-embed-thumbnail-generator'
										),
										count
									)
								: __(
										'Are you sure you want to cancel this job?',
										'video-embed-thumbnail-generator'
									);
						}
						if (itemToActOn?.action === 'clear') {
							return sprintf(
								/* translators: %s: jobs type ('completed' or 'all') */
								__(
									'Are you sure you want to clear %s jobs?',
									'video-embed-thumbnail-generator'
								),
								itemToActOn.type
							);
						}
						return __(
							'Are you sure you want to perform this action?',
							'video-embed-thumbnail-generator'
						);
					})()}
				</ConfirmDialog>
			)}

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
				<div className="videopack-dataviews-container">
					<DataViews
						data={processedData}
						fields={fields}
						view={view}
						onChangeView={setView}
						defaultLayouts={defaultLayouts}
						actions={actions}
						paginationInfo={paginationInfo}
					/>
				</div>
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
