import { __, sprintf } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

const EncodeProgress = ({ formatData, onCancelJob, deleteInProgress }) => {
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

	if (formatData?.encoding_now && formatData?.progress) {
		const percent = Math.round(formatData.progress.percent);
		const percentText = sprintf('%d%%', percent);

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
						{__( 'Cancel', 'video-embed-thumbnail-generator' )}
					</Button>
				)}
				<div className="videopack-encode-progress-small-text">
					<span>
						{__( 'Elapsed:', 'video-embed-thumbnail-generator' ) +
							' ' +
							convertToTimecode(formatData.progress.elapsed)}
					</span>
					<span>
						{__( 'Remaining:', 'video-embed-thumbnail-generator' ) +
							' ' +
							convertToTimecode(formatData.progress.remaining)}
					</span>
					<span>{__( 'fps:', 'video-embed-thumbnail-generator' ) + ' ' + formatData.progress.fps}</span>
				</div>
			</div>
		);
	}

	if (formatData?.status === 'failed' && formatData?.error_message) {
		return (
			<div className="videopack-encode-error">
				{sprintf(__( 'Error: %s', 'video-embed-thumbnail-generator' ), formatData.error_message)}
				{formatData.job_id && (
					<Button
						onClick={() => onCancelJob(formatData.job_id)}
						variant="link"
						text={__( 'Delete Job', 'video-embed-thumbnail-generator' )}
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
