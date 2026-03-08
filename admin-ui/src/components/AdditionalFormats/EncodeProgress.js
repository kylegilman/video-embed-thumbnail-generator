import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef } from '@wordpress/element';
import { Button } from '@wordpress/components';
import './EncodeProgress.scss';

const EncodeProgress = ({
	formatData,
	onCancelJob,
	deleteInProgress,
	onRefresh,
}) => {
	const hasTriggeredRefresh = useRef(false);
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

	useEffect(() => {
		const percent = formatData?.progress?.percent || 0;
		const isFinished =
			percent >= 100 || formatData?.progress?.progress === 'end';
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
	}, [
		formatData?.progress?.percent,
		formatData?.progress?.progress,
		onRefresh,
		formatData?.encoding_now,
	]);

	if (formatData?.encoding_now && formatData?.progress) {
		const percent = Math.round(formatData.progress.percent);
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
					{formatData.job_id && (
						<Button
							onClick={onCancelJob}
							variant="secondary"
							isDestructive
							size="small"
							className="videopack-cancel-job"
							isBusy={deleteInProgress === formatData.job_id}
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
							convertToTimecode(formatData.progress.elapsed)}
					</span>
					<span>
						{__('Remaining:', 'video-embed-thumbnail-generator') +
							' ' +
							convertToTimecode(formatData.progress.remaining)}
					</span>
					<span>
						{__('fps:', 'video-embed-thumbnail-generator') +
							' ' +
							formatData.progress.fps}
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
				{formatData.job_id && (
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
