import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	CheckboxControl,
	Spinner,
	__experimentalDivider as Divider,
} from '@wordpress/components';
import { MediaUpload } from '@wordpress/media-utils';
import EncodeProgress from './EncodeProgress';

const EncodeFormatStatus = ({
	formatId,
	formatData,
	ffmpegExists,
	onCheckboxChange,
	onSelectFormat,
	onDeleteFile,
	onCancelJob,
	deleteInProgress,
}) => {
	if (!formatData) {
		return <Spinner />;
	}

	const getCheckboxCheckedState = (data) => {
		return data.checked || data.status === 'queued';
	};

	const getCheckboxDisabledState = (data) => {
		return (
			data.exists ||
			data.status === 'queued' ||
			data.status === 'encoding' ||
			data.status === 'processing' ||
			data.status === 'completed'
		);
	};

	return (
		<li key={formatId}>
			{ffmpegExists === true ? (
				<CheckboxControl
					__nextHasNoMarginBottom
					className="videopack-format"
					label={formatData.label}
					checked={getCheckboxCheckedState(formatData)}
					disabled={getCheckboxDisabledState(formatData)}
					onChange={(event) => onCheckboxChange(event, formatId)}
				/>
			) : (
				<span className="videopack-format">{formatData.label}</span>
			)}

			{formatData.status !== 'not_encoded' && (
				<span className="videopack-format-status">
					{formatData.status_l10n}
				</span>
			)}

			{formatData.status === 'not_encoded' && !formatData.was_picked && (
				<MediaUpload
					title={__('Choose existing file')}
					onSelect={onSelectFormat(formatId)}
					allowedTypes={['video']}
					render={({ open }) => (
						<Button
							variant="secondary"
							onClick={open}
							className="videopack-format-button"
							size="small"
						>
							{__('Select')}
						</Button>
					)}
				/>
			)}

			{formatData.was_picked && (
				<MediaUpload
					title={sprintf(
						/* translators: %s is the label of a video resolution (eg: 720p ) */
						__('Replace %s'),
						formatData.label
					)}
					onSelect={onSelectFormat(formatId)}
					allowedTypes={['video']}
					render={({ open }) => (
						<Button
							variant="secondary"
							onClick={open}
							className="videopack-format-button"
							size="small"
							title={__('Replace file')}
						>
							{__('Replace')}
						</Button>
					)}
				/>
			)}

			{formatData.deletable && formatData.id && (
				<Button
					isBusy={deleteInProgress === formatId}
					onClick={onDeleteFile}
					variant="link"
					text={__('Delete Permanently')}
					isDestructive
				/>
			)}

			{(formatData.encoding_now || formatData.status === 'failed') && (
				<EncodeProgress
					formatData={formatData}
					onCancelJob={onCancelJob}
					deleteInProgress={deleteInProgress}
				/>
			)}
			<Divider />
		</li>
	);
};

export default EncodeFormatStatus;
