/* global videopack_config */

import { __, sprintf } from '@wordpress/i18n';
import {
	RadioControl,
	RangeControl,
	SelectControl,
} from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import {
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
} from '@wordpress/element';
import VideopackTooltip from './VideopackTooltip';

const PerCodecQualitySettings = ({ codec, settings, changeHandlerFactory }) => {
	const [bitrates, setBitrates] = useState([]);
	const { resolutions } = videopack_config;
	const {
		encode,
		ffmpeg_exists,
		h264_profile,
		h264_level,
		h265_profile,
		h265_level,
	} = settings;
	const codecEncodeSettings = encode[codec.id] || {};
	const {
		rate_control: currentRateControl = codec.supported_rate_controls[0],
		crf: currentCrf = codec.rate_control.crf.default,
		vbr: currentVbr = codec.rate_control.vbr.default,
	} = codecEncodeSettings;

	const [localCrf, setLocalCrf] = useState(currentCrf);
	const [localVbr, setLocalVbr] = useState(currentVbr);

	const h264ProfileOptions = useMemo(
		() => [
			{
				value: 'none',
				label: __('None', 'video-embed-thumbnail-generator'),
			},
			{ value: 'baseline', label: 'baseline' },
			{ value: 'main', label: 'main' },
			{ value: 'high', label: 'high' },
			{ value: 'high10', label: 'high10' },
			{ value: 'high422', label: 'high422' },
			{ value: 'high444', label: 'high444' },
		],
		[]
	);

	const h265ProfileOptions = useMemo(
		() => [
			{
				value: 'none',
				label: __('None', 'video-embed-thumbnail-generator'),
			},
			{ value: 'main', label: 'main' },
			{ value: 'main10', label: 'main10' },
		],
		[]
	);

	const h265LevelOptions = useMemo(
		() => [
			{
				value: 'none',
				label: __('None', 'video-embed-thumbnail-generator'),
			},
			{ value: '1', label: '1' },
			{ value: '2', label: '2' },
			{ value: '2.1', label: '2.1' },
			{ value: '3', label: '3' },
			{ value: '3.1', label: '3.1' },
			{ value: '4', label: '4' },
			{ value: '4.1', label: '4.1' },
			{ value: '5', label: '5' },
			{ value: '5.1', label: '5.1' },
			{ value: '5.2', label: '5.2' },
			{ value: '6', label: '6' },
			{ value: '6.1', label: '6.1' },
			{ value: '6.2', label: '6.2' },
		],
		[]
	);

	const h264LevelOptions = useMemo(
		() => [
			{
				value: 'none',
				label: __('None', 'video-embed-thumbnail-generator'),
			},
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
		],
		[]
	);

	const generateMarks = useCallback(
		(type) => {
			const rateControl = codec.rate_control[type];
			if (!rateControl) {
				return [];
			}

			if (type === 'vbr') {
				const marks = [
					{
						value: 0.1,
						label: __(
							'0.1: lower quality',
							'video-embed-thumbnail-generator'
						),
					},
					{
						value: 50,
						label: __(
							'50: higher quality',
							'video-embed-thumbnail-generator'
						),
					},
				];

				if (rateControl.default) {
					const existingMark = marks.find(
						(m) => m.value === rateControl.default
					);
					const defaultLabel = sprintf(
						/* translators: %s: VBR value. */
						__('%s: default', 'video-embed-thumbnail-generator'),
						rateControl.default
					);

					if (existingMark) {
						existingMark.label = defaultLabel;
					} else {
						marks.push({
							value: rateControl.default,
							label: defaultLabel,
						});
					}
				}

				for (let i = 5; i < 50; i += 5) {
					if (marks.find((m) => m.value === i)) {
						continue;
					}
					if (rateControl.default) {
						if (Math.abs(i - rateControl.default) <= 2) {
							continue;
						}
					}
					marks.push({ value: i, label: String(i) });
				}

				marks.sort((a, b) => a.value - b.value);
				return marks;
			}

			const {
				min,
				max,
				labels: originalLabels = {},
				default: defaultValue,
			} = rateControl;
			const labels = { ...originalLabels }; // create a mutable copy

			// Add the 'Default' label if there isn't already a label for the default value
			if (defaultValue !== undefined && !labels[defaultValue]) {
				labels[defaultValue] = sprintf(
					/* translators: %d: CRF value. */
					__('%d: default', 'video-embed-thumbnail-generator'),
					defaultValue
				);
			}

			labels[min] = sprintf(
				/* translators: %d: CRF value. */
				__('%d: higher quality', 'video-embed-thumbnail-generator'),
				min
			);

			labels[max] = sprintf(
				/* translators: %d: CRF value. */
				__('%d: lower quality', 'video-embed-thumbnail-generator'),
				max
			);

			const marks = [];

			for (let i = min; i <= max; i++) {
				if (labels && labels[i]) {
					marks.push({ value: i, label: labels[i] });
				} else if (i % 5 === 0) {
					const labelExistsNearby = Object.keys(labels).some(
						(label) => {
							const distance = Math.abs(i - label);
							return distance > 0 && distance < 5;
						}
					);
					if (!labelExistsNearby) {
						marks.push({ value: i, label: String(i) });
					}
				}
			}

			return marks;
		},
		[codec]
	);

	useEffect(() => setLocalCrf(currentCrf), [currentCrf]);
	useEffect(() => setLocalVbr(currentVbr), [currentVbr]);

	const settingsRef = useRef(settings);
	const changeHandlerFactoryRef = useRef(changeHandlerFactory);

	useEffect(() => {
		settingsRef.current = settings;
		changeHandlerFactoryRef.current = changeHandlerFactory;
	}, [settings, changeHandlerFactory]);

	const performUpdate = useCallback(
		(key, value) => {
			const currentEncode = settingsRef.current.encode;
			changeHandlerFactoryRef.current.encode({
				...currentEncode,
				[codec.id]: {
					...currentEncode[codec.id],
					[key]: value,
				},
			});
		},
		[codec.id]
	);

	const debouncedUpdate = useDebounce(performUpdate, 500);

	const handleSettingChange = (key, value) => {
		if (key === 'rate_control') {
			// Immediate update for radio buttons
			changeHandlerFactory.encode({
				...encode,
				[codec.id]: {
					...encode[codec.id],
					[key]: value,
				},
			});
			return;
		}

		if (key === 'crf') {
			setLocalCrf(value);
		} else if (key === 'vbr') {
			setLocalVbr(value);
		}
		debouncedUpdate(key, value);
	};

	useEffect(() => {
		const newBitrates = [];
		const vbrSettings = codec.rate_control.vbr;

		resolutions.forEach((res) => {
			let width = res.width;
			let height = res.height;

			if (!width || !height) {
				const parsedHeight = parseInt(res.id, 10);
				if (!isNaN(parsedHeight)) {
					height = parsedHeight;
					width = Math.ceil((height * 16) / 9);
				}
			}

			if (width && height) {
				const bitrate = Math.round(
					localVbr * 0.0001 * width * height + vbrSettings.constant
				);
				newBitrates.push({
					label: `${height}`,
					value: `${bitrate}`,
				});
			}
		});
		setBitrates(newBitrates);
	}, [localVbr, codec, resolutions]);

	return (
		<div key={codec.id} className="videopack-per-codec-quality-settings">
			<h4 className="videopack-codec-quality-header">{codec.name}</h4>
			{codec.supported_rate_controls.length > 1 && (
				<RadioControl
					label={
						<span className="videopack-label-with-tooltip">
							{__(
								'Primary rate control:',
								'video-embed-thumbnail-generator'
							)}
							<VideopackTooltip
								text={__(
									'CRF prioritizes a consistent level of quality over consistent file sizes. Lower numbers are better quality. ABR prioritizes consistent file sizes. If you choose ABR, Videopack will automatically calculate bitrates for different resolutions based on the relative quality you select.',
									'video-embed-thumbnail-generator'
								)}
							/>
						</span>
					}
					selected={currentRateControl}
					onChange={(value) =>
						handleSettingChange('rate_control', value)
					}
					options={[
						{
							label: __(
								'Constant Rate Factor (CRF)',
								'video-embed-thumbnail-generator'
							),
							value: 'crf',
						},
						{
							label: __(
								'Average Bitrate (ABR)',
								'video-embed-thumbnail-generator'
							),
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
					label={__('CRF:', 'video-embed-thumbnail-generator')}
					value={localCrf}
					className="videopack-crf-slider"
					onChange={(value) => handleSettingChange('crf', value)}
					min={codec.rate_control.crf.min}
					max={codec.rate_control.crf.max}
					step={1}
					marks={generateMarks('crf')}
					disabled={ffmpeg_exists !== true}
				/>
			)}

			{currentRateControl === 'vbr' && (
				<RangeControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('Quality:', 'video-embed-thumbnail-generator')}
					value={localVbr}
					className="videopack-abr-slider"
					onChange={(value) => handleSettingChange('vbr', value)}
					min={0.1}
					max={50}
					step={0.5}
					marks={generateMarks('vbr')}
					disabled={ffmpeg_exists !== true}
					help={
						<span className="videopack-bitrate-grid">
							{bitrates.map((item, index) => (
								<span key={index}>
									{item.label}p ={' '}
									<strong>{item.value}</strong> kbps
								</span>
							))}
						</span>
					}
				/>
			)}
			{codec.id === 'h264' && (
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'H.264 profile',
							'video-embed-thumbnail-generator'
						)}
						value={h264_profile}
						onChange={changeHandlerFactory.h264_profile}
						options={h264ProfileOptions}
						disabled={ffmpeg_exists !== true}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'H.264 level',
							'video-embed-thumbnail-generator'
						)}
						value={h264_level}
						onChange={changeHandlerFactory.h264_level}
						options={h264LevelOptions}
						disabled={ffmpeg_exists !== true}
					/>
				</div>
			)}
			{codec.id === 'h265' && (
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'H.265 profile',
							'video-embed-thumbnail-generator'
						)}
						value={h265_profile}
						onChange={changeHandlerFactory.h265_profile}
						options={h265ProfileOptions}
						disabled={ffmpeg_exists !== true}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'H.265 level',
							'video-embed-thumbnail-generator'
						)}
						value={h265_level}
						onChange={changeHandlerFactory.h265_level}
						options={h265LevelOptions}
						disabled={ffmpeg_exists !== true}
					/>
				</div>
			)}
		</div>
	);
};

export default PerCodecQualitySettings;
