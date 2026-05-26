/* global videopack_config */

import { __, sprintf } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { getUsersWithCapability } from '../../../utils/utils';
import {
	startBatchProcess,
	getBatchProgress,
	downloadBrowserEncoderAssets,
	deleteBrowserEncoderAssets,
} from '../../../api/media';
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
import { useEffect, useState, useMemo } from '@wordpress/element';
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
		keep_gif_source,
		sample_rotate,
		auto_publish_post,
		active_encoder = 'ffmpeg',
		browser_encoder_assets_status = 'missing',
	} = settings;

	const effectiveFfmpegExists =
		(active_encoder !== 'ffmpeg' &&
			(!!videopack_config.isTranscodingServiceReady ||
				!!videopack_config.is_pro)) ||
		ffmpeg_exists === true ||
		ffmpeg_exists === 'true' ||
		ffmpeg_exists === 1 ||
		ffmpeg_exists === '1';

	const availableEncoders =
		/**
		 * Filters the list of available encoders in the dropdown list.
		 *
		 * @since 5.0.0
		 *
		 * @param {Array} encoders List of active encoder choices.
		 */
		applyFilters(
			'videopack.settings.encoders',
			[
				{
					value: 'ffmpeg',
					label: __(
						'Web Server FFmpeg',
						'video-embed-thumbnail-generator'
					),
				},
			],
			settings
		);

	const [users, setUsers] = useState(null);
	const [isDownloadingAssets, setIsDownloadingAssets] = useState(false);

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

	const filteredCodecs = useMemo(() => {
		const { codecs } = videopack_config;
		return codecs.filter((codec) => {
			const defaultSupported = !(
				(codec.id === 'av1' && active_encoder === 'browser') ||
				(codec.id === 'cmaf' && active_encoder === 'browser')
			);
			const isSupported = applyFilters(
				/**
				 * Filters whether a specific video codec and resolution is supported by the active encoder.
				 *
				 * @since 5.0.0
				 *
				 * @param {boolean} supported      True if supported, false otherwise.
				 * @param {string}  codecId        Video codec ID string.
				 * @param {string}  active_encoder The active encoder identifier.
				 * @param {Object}  settings       The global plugin settings object.
				 */
				'videopack.settings.codec_supported',
				defaultSupported,
				codec.id,
				active_encoder,
				settings
			);
			if (!isSupported) {
				return false;
			}
			if (codec.id === 'thumbnail') {
				const rawFfmpegExists = settings.ffmpeg_exists;
				return (
					rawFfmpegExists === true ||
					rawFfmpegExists === 'true' ||
					rawFfmpegExists === 1 ||
					rawFfmpegExists === '1'
				);
			}
			return true;
		});
	}, [active_encoder, settings]);

	useEffect(() => {
		if (!encode) {
			return;
		}

		let changed = false;
		const newEncode = { ...encode };

		// Auto-disable unsupported codecs
		Object.keys(encode).forEach((codecId) => {
			if (encode[codecId]?.enabled) {
				const defaultSupported = !(
					(codecId === 'av1' && active_encoder === 'browser') ||
					(codecId === 'cmaf' && active_encoder === 'browser')
				);
				const isSupported = applyFilters(
					/** This filter is documented in src/features/settings/components/EncodingSettings.js */
					'videopack.settings.codec_supported',
					defaultSupported,
					codecId,
					active_encoder,
					settings
				);
				if (!isSupported) {
					newEncode[codecId] = {
						...newEncode[codecId],
						enabled: false,
					};
					changed = true;
				}
			}
		});

		if (changed) {
			changeHandlerFactory.encode(newEncode);
		}
	}, [active_encoder, encode, changeHandlerFactory, settings]);

	useEffect(() => {
		const isDisabled = applyFilters(
			/**
			 * Filters whether the animated GIF auto-transcode setting toggle should be disabled.
			 *
			 * @since 5.0.0
			 *
			 * @param {boolean} disabled       True if toggle should be disabled.
			 * @param {boolean} ffmpegExists   True if FFmpeg is detected.
			 * @param {string}  active_encoder The active encoder identifier.
			 * @param {Object}  settings       The global plugin settings object.
			 */
			'videopack.settings.auto_encode_gif.disabled',
			effectiveFfmpegExists !== true,
			active_encoder,
			settings
		);
		if (isDisabled && auto_encode_gif) {
			changeHandlerFactory.auto_encode_gif(false);
		}
	}, [
		active_encoder,
		auto_encode_gif,
		changeHandlerFactory,
		effectiveFfmpegExists,
		settings,
	]);

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
		custom_resolution,
		false
	);

	const EncodeFormatGrid = () => {
		const { codecs } = videopack_config;
		const { encode: currentEncode, ffmpeg_exists: rawFfmpegExists } =
			settings;
		const ffmpegExists =
			(settings.active_encoder !== 'ffmpeg' &&
				(!!videopack_config.isTranscodingServiceReady ||
					!!videopack_config.is_pro)) ||
			rawFfmpegExists === true ||
			rawFfmpegExists === 'true' ||
			rawFfmpegExists === 1 ||
			rawFfmpegExists === '1';

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
				{filteredCodecs.map((codec) => (
					<div key={codec.id} className="videopack-encode-column">
						<div className="videopack-encode-grid-header-cell">
							<ToggleControl
								__nextHasNoMarginBottom
								label={codec.name}
								checked={!!currentEncode?.[codec.id]?.enabled}
								onChange={(isEnabled) =>
									handleCodecEnableChange(codec.id, isEnabled)
								}
								disabled={!ffmpegExists}
							/>
						</div>
						{filteredResolutions
							.filter(
								(resolution) =>
									!resolution.allowed_codecs ||
									resolution.allowed_codecs.length === 0 ||
									resolution.allowed_codecs.includes(codec.id)
							)
							.map((resolution) => {
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
													?.resolutions?.[
													resolution.id
												]
											}
											onChange={(isChecked) =>
												handleCheckboxChange(
													codec.id,
													resolution.id,
													isChecked
												)
											}
											disabled={
												!ffmpegExists ||
												!currentEncode?.[codec.id]
													?.enabled
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
			...codecs
				.filter(
					(c) =>
						c.is_video !== false &&
						c.id !== 'cmaf' &&
						applyFilters(
							/** This filter is documented in src/features/settings/components/EncodingSettings.js */
							'videopack.settings.codec_supported',
							!(c.id === 'av1' && active_encoder === 'browser'),
							c.id,
							active_encoder,
							settings
						)
				)
				.map((codec) => ({ value: codec.id, label: codec.name })),
		];

		const resolutionOptions = currentResolutions
			.filter(
				(res) =>
					res.is_standard !== false &&
					(currentCodecId === 'none' ||
						currentCodecId === 'same' ||
						!res.allowed_codecs ||
						res.allowed_codecs.length === 0 ||
						res.allowed_codecs.includes(currentCodecId))
			)
			.map((res) => ({
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

		const codecs = videopack_config.codecs
			.filter((c) => !c.is_preview)
			.map((codec) => ({
				value: codec.id,
				label: codec.name,
			}));

		const resolutions = currentResolutions
			.filter(
				(res) =>
					!res.allowed_codecs ||
					res.allowed_codecs.length === 0 ||
					res.allowed_codecs.includes(sample_codec)
			)
			.map((resolution) => ({
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
					disabled={!effectiveFfmpegExists}
				/>
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('Resolution', 'video-embed-thumbnail-generator')}
					value={sample_resolution}
					options={resolutions}
					onChange={changeHandlerFactory.sample_resolution}
					disabled={effectiveFfmpegExists !== true}
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
						disabled={!effectiveFfmpegExists}
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
				{availableEncoders.length > 1 && (
					<PanelRow>
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Encoding service',
								'video-embed-thumbnail-generator'
							)}
							value={active_encoder}
							options={availableEncoders}
							onChange={changeHandlerFactory.active_encoder}
						/>
					</PanelRow>
				)}
				{active_encoder === 'browser' && (
					<PanelRow className="videopack-panel-row-vertical">
						<p>
							{browser_encoder_assets_status === 'ready'
								? __(
										'The FFmpeg encoder library is currently hosted on your own server.',
										'video-embed-thumbnail-generator'
									)
								: __(
										'The FFmpeg encoder library (30MB) is currently loaded from a global CDN. To improve privacy and reliability, you can download the library and host it on your own server.',
										'video-embed-thumbnail-generator'
									)}
						</p>
						<Flex
							align="flex-end"
							justify="flex-start"
							gap={2}
							className="videopack-flex-bottom"
						>
							<Button
								__next40pxDefaultSize
								variant="secondary"
								isBusy={isDownloadingAssets}
								disabled={isDownloadingAssets}
								onClick={async () => {
									setIsDownloadingAssets(true);
									try {
										await downloadBrowserEncoderAssets();
										changeHandlerFactory.browser_encoder_assets_status(
											'ready'
										);
										videopack_config.browser_encoder_assets_status =
											'ready';
									} catch (error) {
										console.error(
											'Failed to download browser encoder assets:',
											error
										);
										// eslint-disable-next-line no-alert
										window.alert(
											__(
												'Failed to download assets. Please check your server permissions.',
												'video-embed-thumbnail-generator'
											)
										);
									} finally {
										setIsDownloadingAssets(false);
									}
								}}
							>
								{browser_encoder_assets_status === 'ready'
									? __(
											'Update assets',
											'video-embed-thumbnail-generator'
										)
									: __(
											'Download and install assets',
											'video-embed-thumbnail-generator'
										)}
							</Button>
							{browser_encoder_assets_status === 'ready' && (
								<Button
									variant="link"
									isDestructive
									onClick={async () => {
										if (
											// eslint-disable-next-line no-alert
											window.confirm(
												__(
													'Are you sure you want to delete the local FFmpeg assets? This will revert to using the CDN.',
													'video-embed-thumbnail-generator'
												)
											)
										) {
											try {
												await deleteBrowserEncoderAssets();
												changeHandlerFactory.browser_encoder_assets_status(
													'missing'
												);
												videopack_config.browser_encoder_assets_status =
													'missing';
											} catch (error) {
												console.error(
													'Failed to delete browser encoder assets:',
													error
												);
												// eslint-disable-next-line no-alert
												window.alert(
													__(
														'Failed to delete assets.',
														'video-embed-thumbnail-generator'
													)
												);
											}
										}
									}}
								>
									{__(
										'Delete local assets',
										'video-embed-thumbnail-generator'
									)}
								</Button>
							)}
						</Flex>
					</PanelRow>
				)}
				{active_encoder === 'ffmpeg' && (
					<>
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
						{effectiveFfmpegExists !== true && ffmpeg_error && (
							<div className="notice notice-error videopack-ffmpeg-notice">
								<p
									dangerouslySetInnerHTML={{
										__html: ffmpeg_error,
									}}
								/>
							</div>
						)}
					</>
				)}
			</PanelBody>
			<PanelBody
				title={__(
					'Default video encode formats',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={!!effectiveFfmpegExists}
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
								'If you have FFmpeg and the proper libraries installed, you can choose to replace your uploaded video with your preferred format, and also encode into several additional formats depending on the resolution of your original source. Videopack will not upconvert your video, so if you upload a 720p video, it will not waste your time creating a 1080p version. Different browsers have different playback capabilities. All browsers on all devices can play H.264. VP8 is an open-source codec supported by most devices, but not as effecient as the newer codecs H.265, VP9, and AV1, which are not as universally supported. AV1 can also be extremely CPU intensive to encode. If you must use AV1, make sure you have the libsvtav1 FFmpeg library installed. The reference libaom-av1 encoder is more commonly available in FFmpeg builds, but is much slower.',
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
						disabled={!effectiveFfmpegExists}
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
				initialOpen={!!effectiveFfmpegExists}
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
						disabled={effectiveFfmpegExists !== true}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Convert animated GIFs to H.264',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.auto_encode_gif}
						checked={auto_encode_gif}
						disabled={applyFilters(
							/** This filter is documented in src/features/settings/components/EncodingSettings.js */
							'videopack.settings.auto_encode_gif.disabled',
							effectiveFfmpegExists !== true,
							active_encoder,
							settings
						)}
						help={applyFilters(
							/**
							 * Filters custom descriptive help text for the Auto Encode GIFs option.
							 *
							 * @since 5.0.0
							 *
							 * @param {string|null} helpText       Custom help text or null for default.
							 * @param {string}      active_encoder Active encoder.
							 * @param {Object}      settings       The global settings object.
							 */
							'videopack.settings.auto_encode_gif.help',
							null,
							active_encoder,
							settings
						)}
					/>
					{auto_encode_gif && (
						<ToggleControl
							__nextHasNoMarginBottom
							label={__(
								'Keep original GIF file as source',
								'video-embed-thumbnail-generator'
							)}
							onChange={changeHandlerFactory.keep_gif_source}
							checked={keep_gif_source}
							disabled={applyFilters(
								/**
								 * Filters whether the "Keep Original GIF" option toggle is disabled.
								 *
								 * @since 5.0.0
								 *
								 * @param {boolean} disabled       True to disable the toggle.
								 * @param {boolean} ffmpegExists   True if FFmpeg is active.
								 * @param {string}  active_encoder Active encoder.
								 * @param {Object}  settings       The global settings object.
								 */
								'videopack.settings.keep_gif_source.disabled',
								effectiveFfmpegExists !== true,
								active_encoder,
								settings
							)}
							help={applyFilters(
								/**
								 * Filters custom descriptive help text for the Keep Original GIF option.
								 *
								 * @since 5.0.0
								 *
								 * @param {string|null} helpText       Custom help text or null for default.
								 * @param {string}      active_encoder Active encoder.
								 * @param {Object}      settings       The global settings object.
								 */
								'videopack.settings.keep_gif_source.help',
								null,
								active_encoder,
								settings
							)}
						/>
					)}
				</BaseControl>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							"Automatically publish video's parent post when encoding finishes"
						)}
						onChange={changeHandlerFactory.auto_publish_post}
						checked={auto_publish_post}
						disabled={effectiveFfmpegExists !== true}
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
				initialOpen={!!effectiveFfmpegExists}
			>
				<div className="videopack-control-with-tooltip">
					<Button
						__next40pxDefaultSize
						variant="secondary"
						disabled={
							!effectiveFfmpegExists || encodingBatch.isProcessing
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
				initialOpen={!!effectiveFfmpegExists}
				disabled={!effectiveFfmpegExists}
			/>
			<PanelBody
				title={__(
					'Email encoding errors to',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={!!effectiveFfmpegExists}
			>
				<div className="videopack-setting-auto-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						value={error_email}
						onChange={changeHandlerFactory.error_email}
						options={errorEmailOptions()}
						disabled={!effectiveFfmpegExists}
					/>
				</div>
			</PanelBody>
			<PanelBody
				title={__('Video quality', 'video-embed-thumbnail-generator')}
				initialOpen={!!effectiveFfmpegExists}
			>
				{applyFilters(
					/**
					 * Action filter hook to render custom settings components before codec quality panels.
					 *
					 * @since 5.0.0
					 *
					 * @param {null}   empty   Null context value.
					 * @param {Object} context Object containing settings, changeHandlerFactory, etc.
					 */
					'videopack.settings.encoding.before_quality',
					null,
					{
						settings,
						changeHandlerFactory,
						ffmpegTest,
					}
				)}
				{filteredCodecs.map((codec) => {
					if (!encode?.[codec.id]?.enabled) {
						return null;
					}
					const content = applyFilters(
						/**
						 * Filters the rendered settings panel for a codec block.
						 *
						 * Enables extensions to insert custom fields or override the quality settings layout entirely.
						 *
						 * @since 5.0.0
						 *
						 * @param {Element} panel   React element representing codec settings.
						 * @param {Object}  context Object containing codec details, settings, and changeHandlerFactory.
						 */
						'videopack.settings.encoding.codec_settings',
						<PerCodecQualitySettings
							key={codec.id}
							codec={codec}
							settings={settings}
							changeHandlerFactory={changeHandlerFactory}
						/>,
						{ codec, settings, changeHandlerFactory }
					);
					if (!content) {
						return null;
					}
					return (
						<PanelBody
							key={codec.id}
							title={codec.label || codec.name}
							initialOpen={false}
						>
							{content}
						</PanelBody>
					);
				})}
			</PanelBody>
			<PanelBody
				title={__('Audio', 'video-embed-thumbnail-generator')}
				initialOpen={!!effectiveFfmpegExists}
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
						disabled={!effectiveFfmpegExists}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Always output stereo audio',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.audio_channels}
						checked={audio_channels}
						disabled={!effectiveFfmpegExists}
					/>
				</div>
			</PanelBody>
			{active_encoder === 'ffmpeg' && (
				<PanelBody
					title={__('Execution', 'video-embed-thumbnail-generator')}
					initialOpen={!!effectiveFfmpegExists && !isNetworkActive}
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
						disabled={
							isNetworkActive || effectiveFfmpegExists !== true
						}
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
								{__(
									'Threads',
									'video-embed-thumbnail-generator'
								)}
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
						disabled={isNetworkActive || !effectiveFfmpegExists}
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
								{__(
									'Run nice',
									'video-embed-thumbnail-generator'
								)}
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
						disabled={isNetworkActive || !effectiveFfmpegExists}
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
			)}
			{active_encoder === 'ffmpeg' && (
				<PanelBody
					title={__(
						'Video Encoding Test',
						'video-embed-thumbnail-generator'
					)}
					initialOpen={!!effectiveFfmpegExists}
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
			)}
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
			{applyFilters(
				/**
				 * Action filter hook to render custom settings components after encoding settings panels.
				 *
				 * @since 5.0.0
				 *
				 * @param {null}   empty   Null context value.
				 * @param {Object} context Object containing settings, changeHandlerFactory, etc.
				 */
				'videopack.settings.encoding.after_panels',
				null,
				{
					settings,
					changeHandlerFactory,
					ffmpegTest,
				}
			)}
		</>
	);
};

export default EncodingSettings;
