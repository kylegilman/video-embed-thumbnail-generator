/**
 * Component to display the status and controls for a single video format.
 */

import { __, sprintf } from '@wordpress/i18n';
import { Button, CheckboxControl, Spinner } from '@wordpress/components';
import EncodeProgress from './EncodeProgress';
import './EncodeFormatStatus.scss';

/**
 * EncodeFormatStatus component.
 *
 * @param {Object}   props                  Component props.
 * @param {string}   props.formatId         The format identifier.
 * @param {Object}   props.formatData       Data for the specific format.
 * @param {boolean}  props.ffmpegExists     Whether FFmpeg is available on the server.
 * @param {Function} props.onCheckboxChange Callback for checkbox toggles.
 * @param {Function} props.onSelectFormat   Callback for manual file selection.
 * @param {Function} props.onDeleteFile     Callback for file deletion.
 * @param {Function} props.onRemoveFormat   Callback for removing manual assignment.
 * @param {Function} props.onCancelJob      Callback for canceling an encoding job.
 * @param {string}   props.deleteInProgress The ID/JobId currently being deleted.
 * @param {Function} props.onRefresh        Callback to refresh format data.
 * @param {number}   props.parentId         ID of the parent video attachment.
 * @param {boolean}  props.showLabel        Whether to show the format label.
 * @param {boolean}  props.hideCancel       Whether to hide the cancel button.
 * @return {Element} The rendered component.
 */
const EncodeFormatStatus = ({
	formatId,
	formatData,
	ffmpegExists,
	onCheckboxChange,
	onSelectFormat,
	onDeleteFile,
	onRemoveFormat,
	onCancelJob,
	deleteInProgress,
	onRefresh,
	parentId,
	showLabel = true,
	hideCancel = false,
}) => {
	const openMediaLibrary = (currentId = null) => {
		if (typeof window.wp === 'undefined' || !window.wp.media) {
			return;
		}

		const frame = window.wp.media({
			title: currentId
				? sprintf(
						/* translators: %s is the label of a video resolution (eg: 720p ) */
						__('Replace %s', 'video-embed-thumbnail-generator'),
						formatData.label
					)
				: __('Select existing file', 'video-embed-thumbnail-generator'),
			button: {
				text: __('Select', 'video-embed-thumbnail-generator'),
			},
			multiple: false,
			library: {
				type: 'video',
				videopack_parent_id: parentId,
				videopack_filter: 'show_children',
			},
		});

		frame.on('select', () => {
			const attachment = frame.state().get('selection').first().toJSON();
			onSelectFormat(formatId)(attachment);
		});

		frame.on('open', () => {
			const library = frame.state().get('library');
			if (library) {
				library.props.set({
					videopack_parent_id: parentId,
					videopack_filter: 'show_children',
				});
			}

			if (currentId) {
				const selection = frame.state().get('selection');
				const attachment = window.wp.media.attachment(currentId);
				attachment.fetch().then(() => {
					selection.add(attachment);
				});
			}
		});

		frame.open();
	};

	if (!formatData) {
		return <Spinner />;
	}

	const getCheckboxCheckedState = (data) => {
		return !!data.checked;
	};

	const getCheckboxDisabledState = (data) => {
		return (
			(data.exists && data.status !== 'error') ||
			[
				'queued',
				'encoding',
				'processing',
				'completed',
				'needs_insert',
				'pending_replacement',
			].includes(data.status)
		);
	};

	return (
		<li key={formatId} className="videopack-format-row">
			{showLabel &&
				(ffmpegExists === true ? (
					<CheckboxControl
						__nextHasNoMarginBottom
						className="videopack-format"
						label={formatData.label}
						checked={getCheckboxCheckedState(formatData)}
						disabled={getCheckboxDisabledState(formatData)}
						onChange={(value) => onCheckboxChange(formatId, value)}
					/>
				) : (
					<span className="videopack-format">{formatData.label}</span>
				))}

			{formatData.status !== 'not_encoded' &&
				(formatData.status_l10n !== formatData.label || !showLabel) && (
					<span className="videopack-format-status">
						{formatData.status_l10n}
					</span>
				)}

			{formatData.status === 'not_encoded' &&
				!formatData.exists &&
				!formatData.replaces_original && (
					<Button
						variant="secondary"
						onClick={() => openMediaLibrary()}
						className="videopack-format-button"
						size="small"
						title={__(
							'Open the Media Library',
							'video-embed-thumbnail-generator'
						)}
					>
						{__('Choose', 'video-embed-thumbnail-generator')}
					</Button>
				)}

			{formatData.exists && !formatData.encoding_now && (
				<Button
					variant="secondary"
					onClick={() => openMediaLibrary(formatData.id)}
					className="videopack-format-button"
					size="small"
					title={__(
						'Open the Media Library',
						'video-embed-thumbnail-generator'
					)}
				>
					{__('Change', 'video-embed-thumbnail-generator')}
				</Button>
			)}

			{formatData.is_manual &&
				formatData.id &&
				!formatData.encoding_now && (
					<Button
						onClick={onRemoveFormat}
						variant="secondary"
						size="small"
						text={__('Remove', 'video-embed-thumbnail-generator')}
						title={__(
							'Removes manual selection. It will not be deleted.',
							'video-embed-thumbnail-generator'
						)}
					/>
				)}

			{formatData.deletable &&
				formatData.id &&
				!formatData.encoding_now && (
					<Button
						isBusy={deleteInProgress === formatId}
						onClick={onDeleteFile}
						variant="link"
						text={__(
							'Delete permanently',
							'video-embed-thumbnail-generator'
						)}
						isDestructive
					/>
				)}

			{(formatData.encoding_now || formatData.status === 'error') && (
				<EncodeProgress
					formatData={formatData}
					onCancelJob={onCancelJob}
					deleteInProgress={deleteInProgress}
					onRefresh={onRefresh}
					hideCancel={hideCancel}
				/>
			)}
		</li>
	);
};

export default EncodeFormatStatus;
