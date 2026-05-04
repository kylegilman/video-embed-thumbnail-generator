/* global videopack_config */

import { __, sprintf } from '@wordpress/i18n';
import { getUsersWithCapability } from '../../../utils/utils';
import { startBatchProcess, getBatchProgress } from '../../../api/media';
import useBatchProcess from '../../../hooks/useBatchProcess';
import {
	BaseControl,
	Button,
	CheckboxControl,
	Flex,
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	PanelBody,
	PanelRow,
	RangeControl,
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import TextControlOnBlur from './TextControlOnBlur';
import PerCodecQualitySettings from './PerCodecQualitySettings';
import WatermarkSettingsPanel from '../../../components/WatermarkSettingsPanel/WatermarkSettingsPanel';
import VideopackTooltip from './VideopackTooltip';
import useResolutions from '../../../hooks/useResolutions';

/**
 * EncodingSettings component.
 *
 * @param {Object} props                      Component props.
 * @param {Object} props.settings             Plugin settings.
 * @param {Object} props.changeHandlerFactory Factory for creating change handlers.
 * @param {Object} props.ffmpegTest           Results of the FFmpeg test.
 * @return {Object} The rendered component.
 */
const EncodingSettings = ({ settings, changeHandlerFactory, ffmpegTest }) => {
	const { isNetworkActive } = videopack_config;
	const {
		app_path,
		encode,
		hide_video_formats,
		enable_custom_resolution,
		custom_resolution,
		error_email,
		ffmpeg_watermark,
		audio_bitrate,
		audio_channels,
		simultaneous_encodes,
		threads,
		nice,
		ffmpeg_exists,
		ffmpeg_error,
		auto_encode,
		auto_encode_gif,
		sample_rotate,
		auto_publish_post,
	} = settings;

	const [users, setUsers] = useState(null);

	const encodingBatch = useBatchProcess();

	const handleEncodeAllVideos = () => {
		encodingBatch.confirmAndRun(
			__(
				"Are you sure you want to add all videos to the encoding queue? This will check every video in your library and add it to the queue if it hasn't been encoded yet.",
				'video-embed-thumbnail-generator'
			),
			() => startBatchProcess('encoding'),
			() => getBatchProgress('encoding'),
			__('No videos found to process.', 'video-embed-thumbnail-generator')
		);
	};

	useEffect(() => {
		getUsersWithCapability('edit_others_video_encodes')
			.then((response) => {
				setUsers(response);
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	const currentResolutions = useResolutions(
		enable_custom_resolution,
		custom_resolution
	);

	const EncodeFormatGrid = () => {
		const { codecs } = videopack_config;
		const { encode: currentEncode, ffmpeg_exists: ffmpegExists } = settings;

		const handleCheckboxChange = (codecId, resolutionId, isChecked) => {
			const newEncode = JSON.parse(JSON.stringify(currentEncode || {}));

			if (!newEncode[codecId]) {
				newEncode[codecId] = { resolutions: {} };
			} else if (!newEncode[codecId].resolutions) {
				newEncode[codecId].resolutions = {};
			}

			newEncode[codecId].resolutions[resolutionId] = !!isChecked;

			// If we're disabling the format that is currently the replacement format,
			// we should probably unset it or keep it enabled.
			// The backend ENSURES it is enabled if it's the replace_format,
			// but for UI consistency, let's keep it checked if it's selected as replacement.
			const formatId = `${codecId}_${resolutionId}`;
			if (!isChecked && settings.replace_format === formatId) {
				// Don't allow disabling the replacement format checkbox.
				// (Or we can allow it, but the backend will override).
				// Let's just make it enabled if it's the replacement.
			}

			changeHandlerFactory.encode(newEncode);
		};

		const handleCodecEnableChange = (codecId, isEnabled) => {
			const newEncode = JSON.parse(JSON.stringify(currentEncode || {}));
			const codecInfo = codecs.find((c) => c.id === codecId);

			if (!newEncode[codecId]) {
				newEncode[codecId] = { resolutions: {} };
			}

			newEncode[codecId].enabled = !!isEnabled;

			if (isEnabled && codecInfo) {
				// Set default quality settings when enabling a codec for the first time
				if (!newEncode[codecId].rate_control) {
					newEncode[codecId].rate_control =
						codecInfo.supported_rate_controls[0];
					newEncode[codecId].crf = codecInfo.rate_control.crf.default;
					newEncode[codecId].vbr = codecInfo.rate_control.vbr.default;
				}
			}

			if (!isEnabled) {
				if (!newEncode[codecId].resolutions) {
					newEncode[codecId].resolutions = {};
				}
				currentResolutions.forEach((resolution) => {
					newEncode[codecId].resolutions[resolution.id] = false;
				});
			}

			changeHandlerFactory.encode(newEncode);
		};

		const filteredResolutions = currentResolutions;

		return (
			<div className="videopack-encode-grid">
				{codecs.map((codec) => (
					<div key={codec.id} className="videopack-encode-column">
						<div className="videopack-encode-grid-header-cell">
							<ToggleControl
								__nextHasNoMarginBottom
								label={codec.name}
								checked={!!currentEncode?.[codec.id]?.enabled}
								onChange={(isEnabled) =>
									handleCodecEnableChange(codec.id, isEnabled)
								}
								disabled={ffmpegExists !== true}
							/>
						</div>
						{filteredResolutions.map((resolution) => {
							const formatId = `${codec.id}_${resolution.id}`;
							const isReplacement =
								settings.replace_format === formatId;
							return (
								<div
									key={formatId}
									className="videopack-encode-grid-row"
								>
									<CheckboxControl
										__nextHasNoMarginBottom
										label={resolution.name}
										checked={
											isReplacement ||
											!!currentEncode?.[codec.id]
												?.resolutions?.[resolution.id]
										}
										onChange={(isChecked) =>
											handleCheckboxChange(
												codec.id,
												resolution.id,
												isChecked
											)
										}
										disabled={
											ffmpegExists !== true ||
											!currentEncode?.[codec.id]?.enabled
										}
									/>
								</div>
							);
						})}
					</div>
				))}
			</div>
		);
	};

	const errorEmailOptions = () => {
		const authorizedUsers = [
			{
				value: 'nobody',
				label: __('Nobody', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'encoder',
				label: __(
					'User who initiated encoding',
					'video-embed-thumbnail-generator'
				),
			},
		];
		if (users) {
			users.forEach((user) => {
				authorizedUsers.push({
					value: user.id,
					label: user.name,
				});
			});
		}
		return authorizedUsers;
	};

	const VideoReplacementSettings = () => {
		const { replace_format } = settings;
		const { codecs } = videopack_config;

		// Extract current codec and resolution
		let currentCodecId = 'none';
		let currentResolutionId = 'fullres';

		if (replace_format && replace_format !== 'none') {
			const parts = replace_format.split('_');
			if (parts.length >= 2) {
				currentCodecId = parts[0];
				currentResolutionId = parts.slice(1).join('_');
			}
		}

		const codecOptions = [
			{
				value: 'none',
				label: __('None', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'same',
				label: __(
					'Same format as original',
					'video-embed-thumbnail-generator'
				),
			},
			...codecs.map((codec) => ({ value: codec.id, label: codec.name })),
		];

		const resolutionOptions = currentResolutions.map((res) => ({
			value: res.id,
			label: res.name,
		}));

		const handleCodecChange = (newCodecId) => {
			if (newCodecId === 'none') {
				changeHandlerFactory.replace_format('none');
			} else {
				changeHandlerFactory.replace_format(
					`${newCodecId}_${currentResolutionId}`
				);
			}
		};

		const handleResolutionChange = (newResolutionId) => {
			if (currentCodecId !== 'none') {
				changeHandlerFactory.replace_format(
					`${currentCodecId}_${newResolutionId}`
				);
			}
		};

		return (
			<div className="videopack-setting-reduced-width videopack-replacement-controls">
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__(
						'Replace original video with',
						'video-embed-thumbnail-generator'
					)}
					value={currentCodecId}
					options={codecOptions}
					onChange={handleCodecChange}
				/>
				{currentCodecId !== 'none' && (
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Resolution',
							'video-embed-thumbnail-generator'
						)}
						value={currentResolutionId}
						options={resolutionOptions}
						onChange={handleResolutionChange}
					/>
				)}
				<VideopackTooltip
					text={__(
						'Choose a format to replace the original uploaded video. If "None" is selected, the original video will be kept and additional formats will be created alongside it.',
						'video-embed-thumbnail-generator'
					)}
				/>
			</div>
		);
	};

	const SampleFormatSelects = () => {
		const { sample_codec, sample_resolution } = settings;

		const codecs = videopack_config.codecs.map((codec) => ({
			value: codec.id,
			label: codec.name,
		}));

		const resolutions = currentResolutions.map((resolution) => ({
			value: resolution.id,
			label: resolution.name,
		}));

		return (
			<Flex className={'videopack-setting-sample-formats'}>
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('Codec', 'video-embed-thumbnail-generator')}
					value={sample_codec}
					options={codecs}
					onChange={changeHandlerFactory.sample_codec}
					disabled={ffmpeg_exists !== true}
				/>
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('Resolution', 'video-embed-thumbnail-generator')}
					value={sample_resolution}
					options={resolutions}
					onChange={changeHandlerFactory.sample_resolution}
					disabled={ffmpeg_exists !== true}
				/>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Test vertical video rotation',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.sample_rotate}
						checked={sample_rotate}
						disabled={ffmpeg_exists !== true}
					/>
					<VideopackTooltip
						text={__(
							"Tests FFmpeg's ability to rotate vertical videos shot on mobile devices.",
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
			</Flex>
		);
	};

	const generateNonCrfMarks = (type) => {
		const marks = [];
		switch (type) {
			case 'simultaneous':
				for (let i = 1; i <= 10; i++) {
					marks.push({ value: i, label: String(i) });
				}
				break;
			case 'threads':
				marks.push({
					value: 0,
					label: __('Auto', 'video-embed-thumbnail-generator'),
				});
				for (let i = 2; i <= 16; i += 2) {
					marks.push({ value: i, label: String(i) });
				}
				break;
		}
		return marks;
	};

	const audioBitrateOptions = [
		{ value: '32', label: '32' },
		{ value: '64', label: '64' },
		{ value: '96', label: '96' },
		{ value: '128', label: '128' },
		{ value: '160', label: '160' },
		{ value: '192', label: '192' },
		{ value: '224', label: '224' },
		{ value: '256', label: '256' },
		{ value: '320', label: '320' },
	];

	return (
		<>
			<PanelBody>
				<PanelRow>
					<TextControlOnBlur
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Path to FFmpeg folder on server',
							'video-embed-thumbnail-generator'
						)}
						value={app_path}
						onChange={changeHandlerFactory.app_path}
						help={
							isNetworkActive
								? __(
										'This setting is controlled at the network level.',
										'video-embed-thumbnail-generator'
									)
								: __(
										'Leave blank if FFmpeg is in your system path.'
									)
						}
						disabled={isNetworkActive}
						title={
							isNetworkActive
								? __(
										'This setting is controlled by the network administrator.',
										'video-embed-thumbnail-generator'
									)
								: null
						}
					/>
				</PanelRow>
				{ffmpeg_exists !== true && ffmpeg_error && (
					<div className="notice notice-error videopack-ffmpeg-notice">
						<p dangerouslySetInnerHTML={{ __html: ffmpeg_error }} />
					</div>
				)}
			</PanelBody>
			<PanelBody
				title={__(
					'Default video encode formats',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={ffmpeg_exists === true}
			>
				<div>
					<span className="videopack-label-with-tooltip">
						<strong>
							{__(
								'About formats',
								'video-embed-thumbnail-generator'
							)}
						</strong>
						<VideopackTooltip
							text={__(
								'If you have FFmpeg and the proper libraries installed, you can choose to replace your uploaded video with your preferred format, and also transcode into several additional formats depending on the resolution of your original source. Videopack will not upconvert your video, so if you upload a 720p video, it will not waste your time creating a 1080p version. Different browsers have different playback capabilities. All browsers on all devices can play H.264. VP8 is an open-source codec supported by most devices, but not as effecient as the newer codecs H.265, VP9, and AV1, which are not as universally supported. AV1 can also be extremely CPU intensive to encode. If you must use AV1, make sure you have the libsvtav1 FFmpeg library installed. The reference libaom-av1 encoder is more commonly available in FFmpeg builds, but is much slower.',
								'video-embed-thumbnail-generator'
							)}
						/>
					</span>
				</div>
				<EncodeFormatGrid />
				<VideoReplacementSettings />
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						'Enable Custom Resolution',
						'video-embed-thumbnail-generator'
					)}
					onChange={changeHandlerFactory.enable_custom_resolution}
					checked={!!enable_custom_resolution}
				/>
				{enable_custom_resolution && (
					<div className="videopack-setting-auto-width">
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Custom Resolution Height',
								'video-embed-thumbnail-generator'
							)}
							type="number"
							value={custom_resolution || ''}
							onChange={(value) =>
								changeHandlerFactory.custom_resolution(
									value === '' ? 0 : parseInt(value, 10)
								)
							}
						/>
					</div>
				)}

				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('Show only default formats on admin pages')}
						onChange={changeHandlerFactory.hide_video_formats}
						checked={hide_video_formats}
						disabled={ffmpeg_exists !== true}
					/>
					<VideopackTooltip
						text={__(
							'To avoid cluttering the admin interface with too many options, you can choose to list only the default formats on WordPress admin pages.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
			</PanelBody>
			<PanelBody
				title={__(
					'Do automatically on upload',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={ffmpeg_exists === true}
			>
				<BaseControl __nextHasNoMarginBottom id="autoEncode">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Encode default formats',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.auto_encode}
						checked={auto_encode}
						disabled={ffmpeg_exists !== true}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Convert animated GIFs to H.264',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.auto_encode_gif}
						checked={auto_encode_gif}
						disabled={ffmpeg_exists !== true}
					/>
				</BaseControl>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							"Automatically publish video's parent post when encoding finishes"
						)}
						onChange={changeHandlerFactory.auto_publish_post}
						checked={auto_publish_post}
						disabled={ffmpeg_exists !== true}
					/>
					<VideopackTooltip
						text={__(
							'If all videos in the encode queue attached to a draft post are completed, the draft post will be automatically published.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
			</PanelBody>
			<PanelBody
				title={__(
					'For previously uploaded videos',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={ffmpeg_exists === true}
			>
				<div className="videopack-control-with-tooltip">
					<Button
						__next40pxDefaultSize
						variant="secondary"
						disabled={
							ffmpeg_exists !== true || encodingBatch.isProcessing
						}
						onClick={handleEncodeAllVideos}
					>
						{encodingBatch.isProcessing
							? sprintf(
									/* translators: 1: current count, 2: total count */
									__(
										'Processing %1$d / %2$d',
										'video-embed-thumbnail-generator'
									),
									encodingBatch.progress.current,
									encodingBatch.progress.total
								)
							: __(
									'Encode default formats',
									'video-embed-thumbnail-generator'
								)}
					</Button>
					<VideopackTooltip
						text={__(
							"Add every video in the Media Library to the encode queue if it hasn't already been encoded. Uses the default encode formats chosen above.",
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
			</PanelBody>
			<WatermarkSettingsPanel
				title={__(
					'Watermark Overlay',
					'video-embed-thumbnail-generator'
				)}
				watermarkSettings={ffmpeg_watermark}
				onChange={changeHandlerFactory.ffmpeg_watermark}
				initialOpen={ffmpeg_exists === true}
				disabled={ffmpeg_exists !== true}
			/>
			<PanelBody
				title={__(
					'Email encoding errors to',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={ffmpeg_exists === true}
			>
				<div className="videopack-setting-auto-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						value={error_email}
						onChange={changeHandlerFactory.error_email}
						options={errorEmailOptions()}
						disabled={ffmpeg_exists !== true}
					/>
				</div>
			</PanelBody>
			<PanelBody
				title={__('Video quality', 'video-embed-thumbnail-generator')}
				initialOpen={ffmpeg_exists === true}
			>
				{videopack_config.codecs.map(
					(codec) =>
						!!encode?.[codec.id]?.enabled && (
							<PerCodecQualitySettings
								key={codec.id}
								codec={codec}
								settings={settings}
								changeHandlerFactory={changeHandlerFactory}
							/>
						)
				)}
			</PanelBody>
			<PanelBody
				title={__('Audio', 'video-embed-thumbnail-generator')}
				initialOpen={ffmpeg_exists === true}
			>
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Audio bitrate',
							'video-embed-thumbnail-generator'
						)}
						value={audio_bitrate}
						onChange={changeHandlerFactory.audio_bitrate}
						options={audioBitrateOptions}
						suffix={
							<InputControlSuffixWrapper>
								kbps
							</InputControlSuffixWrapper>
						}
						disabled={ffmpeg_exists !== true}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Always output stereo audio',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.audio_channels}
						checked={audio_channels}
						disabled={ffmpeg_exists !== true}
					/>
				</div>
			</PanelBody>
			<PanelBody
				title={__('Execution', 'video-embed-thumbnail-generator')}
				initialOpen={ffmpeg_exists === true && !isNetworkActive}
			>
				<RangeControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={
						<span className="videopack-label-with-tooltip">
							{__(
								'Simultaneous encodes',
								'video-embed-thumbnail-generator'
							)}
							<VideopackTooltip
								text={__(
									'Increasing the number will allow FFmpeg to encode more than one file at a time, but may lead to FFmpeg monopolizing system resources.',
									'video-embed-thumbnail-generator'
								)}
							/>
						</span>
					}
					value={simultaneous_encodes}
					className="videopack-settings-slider"
					onChange={changeHandlerFactory.simultaneous_encodes}
					min={1}
					max={10}
					step={1}
					marks={generateNonCrfMarks('simultaneous')}
					disabled={isNetworkActive || ffmpeg_exists !== true}
					title={
						isNetworkActive
							? __(
									'This setting is controlled by the network administrator.',
									'video-embed-thumbnail-generator'
								)
							: null
					}
					help={
						isNetworkActive
							? __(
									'This setting is controlled at the network level.',
									'video-embed-thumbnail-generator'
								)
							: null
					}
				/>
				<RangeControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={
						<span className="videopack-label-with-tooltip">
							{__('Threads', 'video-embed-thumbnail-generator')}
							<VideopackTooltip
								text={__(
									'Default is 1, which limits encoding speed but prevents encoding from using too many system resources. Selecting 0 will allow FFmpeg to optimize the number of threads or you can set the number manually. This may lead to FFmpeg monopolizing system resources.',
									'video-embed-thumbnail-generator'
								)}
							/>
						</span>
					}
					value={threads}
					className="videopack-settings-slider"
					onChange={changeHandlerFactory.threads}
					min={0}
					max={16}
					step={1}
					marks={generateNonCrfMarks('threads')}
					disabled={isNetworkActive || ffmpeg_exists !== true}
					title={
						isNetworkActive
							? __(
									'This setting is controlled by the network administrator.',
									'video-embed-thumbnail-generator'
								)
							: null
					}
					help={
						isNetworkActive
							? __(
									'This setting is controlled at the network level.',
									'video-embed-thumbnail-generator'
								)
							: null
					}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={
						<span className="videopack-label-with-tooltip">
							{__('Run nice', 'video-embed-thumbnail-generator')}
							<VideopackTooltip
								text={__(
									'Tells FFmpeg to run at a lower priority on Linux/Unix systems to avoid monopolizing system resources.',
									'video-embed-thumbnail-generator'
								)}
							/>
						</span>
					}
					className="videopack-flex-align-center"
					onChange={changeHandlerFactory.nice}
					checked={nice}
					disabled={isNetworkActive || ffmpeg_exists !== true}
					title={
						isNetworkActive
							? __(
									'This setting is controlled by the network administrator.',
									'video-embed-thumbnail-generator'
								)
							: null
					}
					help={
						isNetworkActive
							? __(
									'This setting is controlled at the network level.',
									'video-embed-thumbnail-generator'
								)
							: null
					}
				/>
			</PanelBody>
			<PanelBody
				title={__(
					'Video Encoding Test',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={ffmpeg_exists === true}
			>
				<BaseControl
					__nextHasNoMarginBottom
					label={__(
						'Test encode command',
						'video-embed-thumbnail-generator'
					)}
					id="sample-format-selects"
				>
					<SampleFormatSelects />
				</BaseControl>

				<TextareaControl
					__nextHasNoMarginBottom
					disabled={true}
					value={ffmpegTest?.command}
				/>
				<TextareaControl
					__nextHasNoMarginBottom
					label={__(
						'FFmpeg test output',
						'video-embed-thumbnail-generator'
					)}
					rows={20}
					disabled={true}
					value={ffmpegTest?.output}
				/>
			</PanelBody>
			{encodingBatch.confirmDialog.isOpen && (
				<ConfirmDialog
					isOpen={true}
					onConfirm={() => {
						if (encodingBatch.confirmDialog.onConfirm) {
							encodingBatch.confirmDialog.onConfirm();
						}
						encodingBatch.closeConfirmDialog();
					}}
					onCancel={encodingBatch.closeConfirmDialog}
					confirmButtonText={
						encodingBatch.confirmDialog.isAlert
							? __('OK', 'video-embed-thumbnail-generator')
							: __('OK', 'video-embed-thumbnail-generator')
					}
				>
					{encodingBatch.confirmDialog.message}
				</ConfirmDialog>
			)}
		</>
	);
};

export default EncodingSettings;
