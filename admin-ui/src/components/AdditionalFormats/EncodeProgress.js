/**
 * Component to display and interpolate encoding progress for a video job.
 */

import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { Button } from '@wordpress/components';
import './EncodeProgress.scss';

/**
 * EncodeProgress component.
 *
 * @param {Object}   props                  Component props.
 * @param {Object}   props.formatData       Data for the format being encoded.
 * @param {Function} props.onCancelJob      Callback to cancel the job.
 * @param {string}   props.deleteInProgress The ID/JobId currently being deleted.
 * @param {Function} props.onRefresh        Callback to refresh data.
 * @param {boolean}  props.hideCancel       Whether to hide the cancel button.
 * @return {Element} The rendered component.
 */
const EncodeProgress = ({
	formatData,
	onCancelJob,
	deleteInProgress,
	onRefresh,
	hideCancel = false,
}) => {
	const hasTriggeredRefresh = useRef(false);
	const [interpolatedProgress, setInterpolatedProgress] = useState({
		percent: 0,
		elapsed: 0,
		remaining: null,
	});

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

	// Sync local state when server data updates
	useEffect(() => {
		if (
			formatData?.progress &&
			typeof formatData.progress === 'object' &&
			formatData.progress !== 'recheck'
		) {
			setInterpolatedProgress((prev) => {
				// Don't let progress jump backwards due to server polling lag
				if (formatData.progress.percent < prev.percent) {
					return prev;
				}
				return {
					percent: formatData.progress.percent || 0,
					elapsed: formatData.progress.elapsed || 0,
					remaining: formatData.progress.remaining,
				};
			});
		}
	}, [formatData?.progress]);

	// Internal interpolation timer
	useEffect(() => {
		const isRunning = [
			'encoding',
			'processing',
			'needs_insert',
			'pending_replacement',
		].includes(formatData?.status);

		if (
			!isRunning ||
			!formatData?.progress ||
			typeof formatData.progress !== 'object'
		) {
			return;
		}

		const interval = setInterval(() => {
			setInterpolatedProgress((prev) => {
				const now = new Date().getTime() / 1000;
				const started =
					formatData.progress?.started || formatData.started;
				const elapsed = started
					? Math.max(0, now - started)
					: prev.elapsed + 1;

				let percent = parseFloat(prev.percent) || 0;
				let remaining = prev.remaining;

				const video_duration =
					formatData.progress?.video_duration ||
					formatData.video_duration;
				if (video_duration && video_duration > 0) {
					const totalDurationInSeconds = video_duration / 1000000;
					const speedMatch = formatData.progress?.speed
						? String(formatData.progress.speed).match(/(\d*\.?\d+)/)
						: null;
					const speed = speedMatch ? parseFloat(speedMatch[0]) : 0;

					if (speed > 0) {
						percent =
							(elapsed * speed * 100) / totalDurationInSeconds;
					}

					if (percent > 0 && speed > 0) {
						remaining =
							(totalDurationInSeconds * (100 - percent)) /
							100 /
							speed;
					} else {
						remaining = Math.max(
							0,
							totalDurationInSeconds - elapsed
						);
					}
				}

				if (percent >= 100) {
					remaining = 0;
				}

				return {
					percent: Math.min(100, Math.max(0, percent)),
					elapsed,
					remaining:
						remaining !== null ? Math.max(0, remaining) : null,
				};
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [
		formatData?.status,
		formatData?.progress,
		formatData?.started,
		formatData?.video_duration,
	]);

	// Auto-refresh when finished
	useEffect(() => {
		const percent = interpolatedProgress.percent;
		const isFinished = percent >= 100;
		if (
			isFinished &&
			onRefresh &&
			!hasTriggeredRefresh.current &&
			formatData?.encoding_now
		) {
			hasTriggeredRefresh.current = true;
			onRefresh();
		} else if (!isFinished) {
			hasTriggeredRefresh.current = false;
		}
	}, [interpolatedProgress.percent, onRefresh, formatData?.encoding_now]);

	if (
		formatData?.encoding_now &&
		formatData?.progress &&
		typeof formatData.progress === 'object'
	) {
		const percent = Math.round(interpolatedProgress.percent);
		const percentText = sprintf('%d%%', percent);

		return (
			<div className="videopack-encode-progress">
				<div className="videopack-encode-progress-row">
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
					{!hideCancel &&
						(formatData.progress?.job_id || formatData.job_id) && (
							<Button
								onClick={() =>
									onCancelJob(
										formatData.progress?.job_id ||
											formatData.job_id
									)
								}
								variant="secondary"
								isDestructive
								size="small"
								className="videopack-cancel-job"
								isBusy={
									deleteInProgress ===
									(formatData.progress?.job_id ||
										formatData.job_id)
								}
								icon="no-alt"
								title={__(
									'Cancel',
									'video-embed-thumbnail-generator'
								)}
							>
								<span className="videopack-button-text">
									{__(
										'Cancel',
										'video-embed-thumbnail-generator'
									)}
								</span>
							</Button>
						)}
				</div>
				<div className="videopack-encode-progress-small-text">
					<span>
						{__('Elapsed:', 'video-embed-thumbnail-generator') +
							' ' +
							convertToTimecode(interpolatedProgress.elapsed)}
					</span>
					<span>
						{__('Remaining:', 'video-embed-thumbnail-generator') +
							' ' +
							convertToTimecode(interpolatedProgress.remaining)}
					</span>
					<span>
						{__('fps:', 'video-embed-thumbnail-generator') +
							' ' +
							(formatData.progress.fps || '--')}
					</span>
				</div>
			</div>
		);
	}

	if (formatData?.status === 'failed' && formatData?.error_message) {
		return (
			<div className="videopack-encode-error">
				{sprintf(
					/* translators: %s is an error message */
					__('Error: %s.', 'video-embed-thumbnail-generator'),
					formatData.error_message
				)}{' '}
				{hideCancel === false && formatData.job_id && (
					<Button
						onClick={() => onCancelJob(formatData.job_id)}
						variant="link"
						text={__(
							'Delete Job',
							'video-embed-thumbnail-generator'
						)}
						isDestructive
						isBusy={deleteInProgress === formatData.job_id}
					/>
				)}
			</div>
		);
	}

	return null;
};

export default EncodeProgress;
