/* global videopack_config */
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from '@wordpress/element';
import {
	Flex,
	FlexItem,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { captureVideoFrame } from '../../../utils/video-capture';
import ChooseFromLibrary from './ChooseFromLibrary';
import WatermarkPositioner from './WatermarkPositioner';

const WatermarkSettingsPanel = ({
	watermarkSettings,
	onChange,
	title,
	initialOpen = false,
	opened,
	children,
	disabled = false,
}) => {
	const [baseFrame, setBaseFrame] = useState(null);
	const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
	const prevWatermarkUrl = useRef(watermarkSettings?.url);

	useEffect(() => {
		if (
			watermarkSettings?.url &&
			watermarkSettings.url !== prevWatermarkUrl.current
		) {
			setSettingsPanelOpen(true);
		}
		prevWatermarkUrl.current = watermarkSettings?.url;
	}, [watermarkSettings?.url]);

	useEffect(() => {
		if (watermarkSettings?.url && !baseFrame) {
			const videoUrl =
				videopack_config.url + '/src/images/Adobestock_469037984.mp4';
			const videoOffset = Math.random() * 1.9;
			captureVideoFrame(videoUrl, videoOffset)
				.then((canvas) => {
					setBaseFrame(canvas);
				})
				.catch((e) => console.error(e));
		}
	}, [watermarkSettings?.url, baseFrame]);

	const updateSetting = (key, value) => {
		const newSettings = {
			...watermarkSettings,
			[key]: value,
		};
		onChange(newSettings);
	};

	const panelProps = { title };
	if (opened !== undefined) {
		panelProps.opened = opened;
	} else {
		panelProps.initialOpen = initialOpen;
	}

	return (
		<PanelBody {...panelProps}>
			<ChooseFromLibrary
				label={__(
					'Watermark image URL:',
					'video-embed-thumbnail-generator'
				)}
				type="url"
				value={watermarkSettings?.url}
				onChange={(url) =>
					onChange(
						typeof watermarkSettings === 'object' &&
							watermarkSettings !== null
							? { ...watermarkSettings, url }
							: { url }
					)
				}
				disabled={disabled}
			/>
			{children}
			{watermarkSettings?.url && (
				<PanelBody
					title={__(
						'Watermark Settings',
						'video-embed-thumbnail-generator'
					)}
					opened={settingsPanelOpen}
					onToggle={() => setSettingsPanelOpen(!settingsPanelOpen)}
				>
					<div className="videopack-watermark-settings">
						{baseFrame && (
							<WatermarkPositioner
								baseFrame={baseFrame}
								settings={watermarkSettings}
								onChange={onChange}
							/>
						)}
						<RangeControl
							label={__(
								'Scale (%)',
								'video-embed-thumbnail-generator'
							)}
							value={Number(watermarkSettings.scale || 50)}
							onChange={(value) => updateSetting('scale', value)}
							min={1}
							max={100}
							step={0.01}
							__nextHasNoMarginBottom
							disabled={disabled}
						/>
						<Flex
							gap={4}
							align="flex-end"
							justify="flex-start"
							style={{ marginBottom: '10px' }}
						>
							<FlexItem className="videopack-alignment-control">
								<SelectControl
									label={__(
										'Horizontal Alignment',
										'video-embed-thumbnail-generator'
									)}
									value={watermarkSettings.align || 'center'}
									options={[
										{
											label: __(
												'Left',
												'video-embed-thumbnail-generator'
											),
											value: 'left',
										},
										{
											label: __(
												'Center',
												'video-embed-thumbnail-generator'
											),
											value: 'center',
										},
										{
											label: __(
												'Right',
												'video-embed-thumbnail-generator'
											),
											value: 'right',
										},
									]}
									onChange={(value) =>
										updateSetting('align', value)
									}
									__nextHasNoMarginBottom
									disabled={disabled}
								/>
							</FlexItem>
							<FlexItem className="videopack-offset-control">
								<TextControl
									label={__(
										'Horizontal Offset (%)',
										'video-embed-thumbnail-generator'
									)}
									type="number"
									step="0.01"
									value={watermarkSettings.x || 0}
									onChange={(value) =>
										updateSetting('x', value)
									}
									__nextHasNoMarginBottom
									disabled={disabled}
								/>
							</FlexItem>
						</Flex>
						<Flex gap={4} align="flex-end" justify="flex-start">
							<FlexItem className="videopack-alignment-control">
								<SelectControl
									label={__(
										'Vertical Alignment',
										'video-embed-thumbnail-generator'
									)}
									value={watermarkSettings.valign || 'center'}
									options={[
										{
											label: __(
												'Top',
												'video-embed-thumbnail-generator'
											),
											value: 'top',
										},
										{
											label: __(
												'Center',
												'video-embed-thumbnail-generator'
											),
											value: 'center',
										},
										{
											label: __(
												'Bottom',
												'video-embed-thumbnail-generator'
											),
											value: 'bottom',
										},
									]}
									onChange={(value) =>
										updateSetting('valign', value)
									}
									__nextHasNoMarginBottom
									disabled={disabled}
								/>
							</FlexItem>
							<FlexItem className="videopack-offset-control">
								<TextControl
									label={__(
										'Vertical Offset (%)',
										'video-embed-thumbnail-generator'
									)}
									type="number"
									step="0.01"
									value={watermarkSettings.y || 0}
									onChange={(value) =>
										updateSetting('y', value)
									}
									__nextHasNoMarginBottom
									disabled={disabled}
								/>
							</FlexItem>
						</Flex>
					</div>
				</PanelBody>
			)}
		</PanelBody>
	);
};

export default WatermarkSettingsPanel;
