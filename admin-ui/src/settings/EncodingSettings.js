/* global videopack */

import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	BaseControl,
	Button,
	CheckboxControl,
	ExternalLink,
	Flex,
	FlexBlock,
	FlexItem,
	Icon,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	MediaUpload,
	MediaUploadCheck,
	Panel,
	PanelBody,
	PanelRow,
	RadioControl,
	RangeControl,
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
	Spinner,
	TabPanel,
	Tooltip,
} from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { useEffect, useState } from '@wordpress/element';
import TextControlOnBlur from './TextControlOnBlur';

const EncodingSettings = ({ settings, changeHandlerFactory, ffmpegTest }) => {
	const {
		app_path,
		replace_format,
		encode,
		custom_format,
		hide_video_formats,
		auto_thumb_number,
		auto_thumb_position,
		error_email,
		ffmpeg_thumb_watermark,
		ffmpeg_watermark,
		h264_profile,
		h264_level,
		audio_bitrate,
		audio_channels,
		simultaneous_encodes,
		threads,
		nice,
		ffmpeg_exists,
		ffmpeg_error,
		auto_encode,
		auto_encode_gif,
		auto_thumb,
		sample_rotate,
		auto_publish_post,
	} = settings;

	const [users, setUsers] = useState(null);
	const [bitrates, setBitrates] = useState(null);

	useEffect(() => {
		apiFetch({
			path: '/wp/v2/users?capability=edit_others_video_encodes',
			method: 'GET',
		})
			.then((response) => {
				setUsers(response);
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

	const EncodeFormatGrid = () => {
		const { codecs, resolutions } = videopack.settings;
		const { encode: currentEncode, ffmpeg_exists: ffmpegExists } = settings;

		const handleCheckboxChange = (codecId, resolutionId, isChecked) => {
			const newEncode = JSON.parse(JSON.stringify(currentEncode || {}));

			if (!newEncode[codecId]) {
				newEncode[codecId] = { resolutions: {} };
			} else if (!newEncode[codecId].resolutions) {
				newEncode[codecId].resolutions = {};
			}

			newEncode[codecId].resolutions[resolutionId] = !!isChecked;
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
				resolutions.forEach((resolution) => {
					newEncode[codecId].resolutions[resolution.id] = false;
				});
			}

			changeHandlerFactory.encode(newEncode);
		};

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
						{resolutions.map((resolution) => (
							<CheckboxControl
								key={resolution.id}
								__nextHasNoMarginBottom
								label={resolution.name}
								checked={
									!!currentEncode?.[codec.id]?.resolutions?.[
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
									ffmpegExists !== true ||
									!currentEncode?.[codec.id]?.enabled
								}
							/>
						))}
					</div>
				))}
			</div>
		);
	};

	const PerCodecQualitySettings = ({ codec }) => {
		const [bitrates, setBitrates] = useState([]);
		const { resolutions } = videopack.settings;
		const codecEncodeSettings = encode[codec.id] || {};
		const {
			rate_control: currentRateControl = codec.supported_rate_controls[0],
			crf: currentCrf = codec.rate_control.crf.default,
			vbr: currentVbr = codec.rate_control.vbr.default,
		} = codecEncodeSettings;

		const handleSettingChange = (key, value) => {
			changeHandlerFactory.encode({
				...encode,
				[codec.id]: {
					...encode[codec.id],
					[key]: value,
				},
			});
		};

		useEffect(() => {
			const newBitrates = [];
			const vbrSettings = codec.rate_control.vbr;

			resolutions.forEach((res) => {
				const bitrate = Math.round(
					currentVbr * 0.001 * res.width * res.height +
						vbrSettings.constant
				);
				newBitrates.push(`${res.name} = ${bitrate}kbps`);
			});
			setBitrates(newBitrates);
		}, [currentVbr, codec]);

		return (
			<div
				key={codec.id}
				className="videopack-per-codec-quality-settings"
			>
				<h4 className="videopack-codec-quality-header">{codec.name}</h4>
				{codec.supported_rate_controls.length > 1 && (
					<RadioControl
						label={__('Primary rate control:')}
						selected={currentRateControl}
						className={'videopack-component-margin'}
						onChange={(value) =>
							handleSettingChange('rate_control', value)
						}
						options={[
							{
								label: __('Constant Rate Factor'),
								value: 'crf',
							},
							{
								label: __('Average Bitrate'),
								value: 'vbr',
							},
						]}
						disabled={ffmpeg_exists !== true}
					/>
				)}

				{currentRateControl === 'crf' && (
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Constant Rate Factor (CRF):')}
						value={currentCrf}
						className="videopack-settings-slider"
						onChange={(value) => handleSettingChange('crf', value)}
						min={codec.rate_control.crf.min}
						max={codec.rate_control.crf.max}
						step={1}
						marks={generateMarks(codec.id, 'crf')}
						disabled={ffmpeg_exists !== true}
					/>
				)}

				{currentRateControl === 'vbr' && (
					<RangeControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Average Bitrate:')}
						value={currentVbr}
						className="videopack-settings-slider"
						onChange={(value) => handleSettingChange('vbr', value)}
						min={0.01}
						max={5}
						step={0.01}
						disabled={ffmpeg_exists !== true}
						help={bitrates.map((text, index) => (
							<span key={index}>{text}</span>
						))}
					/>
				)}
				{codec.id === 'h264' && (
					<div className="videopack-setting-reduced-width">
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__('H.264 profile')}
							value={h264_profile}
							onChange={changeHandlerFactory.h264_profile}
							options={h264ProfileOptions}
							disabled={ffmpeg_exists !== true}
						/>
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__('H.264 level')}
							value={h264_level}
							onChange={changeHandlerFactory.h264_level}
							options={h264LevelOptions}
							disabled={ffmpeg_exists !== true}
						/>
					</div>
				)}
			</div>
		);
	};

	const errorEmailOptions = () => {
		const authorizedUsers = [
			{
				value: 'nobody',
				label: __('Nobody'),
			},
			{
				value: 'encoder',
				label: __('User who initiated encoding'),
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

	const SampleFormatSelects = () => {
		const { sample_codec, sample_resolution } = settings;

		const codecs = videopack.settings.codecs.map((codec) => ({
			value: codec.id,
			label: codec.name,
		}));
		const resolutions = videopack.settings.resolutions.map(
			(resolution) => ({
				value: resolution.id,
				label: resolution.name,
			})
		);

		return (
			<Flex className={'videopack-setting-sample-formats'}>
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('Codec:')}
					value={sample_codec}
					options={codecs}
					onChange={changeHandlerFactory.sample_codec}
					disabled={ffmpeg_exists !== true}
				/>
				<SelectControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('Resolution:')}
					value={sample_resolution}
					options={resolutions}
					onChange={changeHandlerFactory.sample_resolution}
					disabled={ffmpeg_exists !== true}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('Test vertical video rotation.')}
					onChange={changeHandlerFactory.sample_rotate}
					checked={sample_rotate}
					disabled={ffmpeg_exists !== true}
				/>
			</Flex>
		);
	};

	const autoThumbLabel = () => {
		const changeAutoThumbNumberHandler = (value) => {
			changeHandlerFactory.auto_thumb_number(value);
			changeHandlerFactory.auto_thumb_position(
				String(value) === '1' ? '50' : '1'
			);
		};

		const autoThumbPositionLabel = () => {
			if (String(auto_thumb_number) === '1') {
				return (
					<>
						{__('thumbnail from')}
						<RangeControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							className="videopack-setting-auto-thumb"
							value={Number(auto_thumb_position)}
							onChange={changeHandlerFactory.auto_thumb_position}
							min={0}
							max={100}
							step={1}
							disabled={ffmpeg_exists !== true}
						/>
						{__('% through the video')}
					</>
				);
			}
			return (
				<>
					{__('thumbnails and set #')}
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						className="videopack-setting-auto-thumb"
						type="number"
						value={auto_thumb_position}
						onChange={changeHandlerFactory.auto_thumb_position}
						disabled={ffmpeg_exists !== true}
					/>
					{__('as the featured image.')}
				</>
			);
		};

		return (
			<span>
				{__('Generate')}
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					className="videopack-setting-auto-thumb"
					type="number"
					min="1"
					max="99"
					value={auto_thumb_number}
					onChange={changeAutoThumbNumberHandler}
					disabled={ffmpeg_exists !== true}
				/>
				{autoThumbPositionLabel()}
			</span>
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
				marks.push({ value: 0, label: __('Auto') });
				for (let i = 2; i <= 16; i += 2) {
					marks.push({ value: i, label: String(i) });
				}
				break;
		}
		return marks;
	};

	const generateMarks = (codecId, type) => {
		const codec = videopack.settings.codecs.find((c) => c.id === codecId);
		if (!codec) {
			return [];
		}

		const rateControl = codec.rate_control[type];
		if (!rateControl) {
			return [];
		}

		const { min, max, labels = {} } = rateControl;
		const marks = [];

		for (let i = min; i <= max; i++) {
			if (labels && labels[i]) {
				marks.push({ value: i, label: labels[i] });
			} else if (i % 5 === 0) {
				const labelExistsNearby = Object.keys(labels).some((label) => {
					const distance = Math.abs(i - label);
					return distance > 0 && distance < 5;
				});
				if (!labelExistsNearby) {
					marks.push({ value: i, label: String(i) });
				}
			}
		}

		return marks;
	};

	const h264ProfileOptions = [
		{ value: 'none', label: __('None') },
		{ value: 'baseline', label: 'baseline' },
		{ value: 'main', label: 'main' },
		{ value: 'high', label: 'high' },
		{ value: 'high10', label: 'high10' },
		{ value: 'high422', label: 'high422' },
		{ value: 'high444', label: 'high444' },
	];

	const h264LevelOptions = [
		{ value: 'none', label: __('None') },
		{ value: '1', label: '1' },
		{ value: '1.1', label: '1.1' },
		{ value: '1.2', label: '1.2' },
		{ value: '1.3', label: '1.3' },
		{ value: '2', label: '2' },
		{ value: '2.1', label: '2.1' },
		{ value: '2.2', label: '2.2' },
		{ value: '3', label: '3' },
		{ value: '3.1', label: '3.1' },
		{ value: '3.2', label: '3.2' },
		{ value: '4', label: '4' },
		{ value: '4.1', label: '4.1' },
		{ value: '4.2', label: '4.2' },
		{ value: '5', label: '5' },
		{ value: '5.1', label: '5.1' },
		{ value: '5.2', label: '5.2' },
		{ value: '6', label: '6' },
		{ value: '6.1', label: '6.1' },
		{ value: '6.2', label: '6.2' },
	];

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
						label={__('Path to FFmpeg folder on server:')}
						value={app_path}
						onChange={changeHandlerFactory.app_path}
						help={__(
							'Leave blank if FFmpeg is in your system path.'
						)}
					/>
				</PanelRow>
				{ffmpeg_exists !== true && ffmpeg_error && (
					<div className="notice notice-error videopack-ffmpeg-notice">
						<p dangerouslySetInnerHTML={{ __html: ffmpeg_error }} />
					</div>
				)}
			</PanelBody>
			<PanelBody
				title={__('Default video encode formats')}
				opened={ffmpeg_exists === true}
			>
				<Flex direction="column">
					<FlexItem>
						<BaseControl
							__nextHasNoMarginBottom
							id="default-video-encode-formats"
						>
							<EncodeFormatGrid />
						</BaseControl>
					</FlexItem>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'List only default formats on WordPress admin pages.'
						)}
						onChange={changeHandlerFactory.hide_video_formats}
						checked={hide_video_formats}
						disabled={ffmpeg_exists !== true}
					/>
				</Flex>
			</PanelBody>
			<PanelBody
				title={__('Do automatically on upload')}
				opened={ffmpeg_exists === true}
			>
				<BaseControl __nextHasNoMarginBottom id="autoEncode">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('Encode default formats.')}
						onChange={changeHandlerFactory.auto_encode}
						checked={auto_encode}
						disabled={ffmpeg_exists !== true}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('Convert animated GIFs to H.264.')}
						onChange={changeHandlerFactory.auto_encode_gif}
						checked={hide_video_formats}
						disabled={ffmpeg_exists !== true}
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={autoThumbLabel()}
						onChange={changeHandlerFactory.auto_thumb}
						checked={auto_thumb}
						disabled={ffmpeg_exists !== true}
					/>
				</BaseControl>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						"Automatically publish video's parent post when encoding finishes."
					)}
					onChange={changeHandlerFactory.auto_publish_post}
					checked={auto_publish_post}
					disabled={ffmpeg_exists !== true}
				/>
			</PanelBody>
			<PanelBody
				title={__('Email encoding errors to')}
				opened={ffmpeg_exists === true}
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
				title={__('For previously uploaded videos')}
				opened={ffmpeg_exists === true}
			>
				<BaseControl __nextHasNoMarginBottom id="previouslyUploaded">
					<Button
						className="videopack-library-button no-vertical-align"
						variant="secondary"
						disabled={ffmpeg_exists !== true}
					>
						{__('Generate thumbnails')}
					</Button>
					<Button
						className="videopack-library-button no-vertical-align"
						variant="secondary"
						disabled={ffmpeg_exists !== true}
					>
						{__('Encode videos')}
					</Button>
				</BaseControl>
			</PanelBody>
			<PanelBody
				title={__('Video quality')}
				opened={ffmpeg_exists === true}
			>
				{videopack.settings.codecs.map(
					(codec) =>
						!!encode?.[codec.id]?.enabled && (
							<PerCodecQualitySettings
								key={codec.id}
								codec={codec}
							/>
						)
				)}
			</PanelBody>
			<PanelBody title={__('Audio')} opened={ffmpeg_exists === true}>
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Audio bitrate:')}
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
						label={__('Always output stereo audio.')}
						onChange={changeHandlerFactory.audio_channels}
						checked={audio_channels}
						disabled={ffmpeg_exists !== true}
					/>
				</div>
			</PanelBody>
			<PanelBody title={__('Execution')} opened={ffmpeg_exists === true}>
				<RangeControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('Simultaneous encodes:')}
					value={simultaneous_encodes}
					className="videopack-settings-slider"
					onChange={changeHandlerFactory.simultaneous_encodes}
					min={1}
					max={10}
					step={1}
					marks={generateNonCrfMarks('simultaneous')}
					disabled={ffmpeg_exists !== true}
				/>
				<RangeControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('Threads:')}
					value={threads}
					className="videopack-settings-slider"
					onChange={changeHandlerFactory.threads}
					min={0}
					max={16}
					step={1}
					marks={generateNonCrfMarks('threads')}
					disabled={ffmpeg_exists !== true}
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('Run nice')}
					onChange={changeHandlerFactory.nice}
					checked={nice}
					disabled={ffmpeg_exists !== true}
				/>
			</PanelBody>
			<PanelBody
				title={__('Video Encoding Test')}
				opened={ffmpeg_exists === true}
			>
				<BaseControl
					__nextHasNoMarginBottom
					label={__('Test encode command:')}
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
					label={__('FFmpeg test output:')}
					rows={20}
					disabled={true}
					value={ffmpegTest?.output}
				/>
			</PanelBody>
		</>
	);
};

export default EncodingSettings;
