/* global videopack_config */

import { __, _x, sprintf } from '@wordpress/i18n';
import {
	BaseControl,
	CheckboxControl,
	Flex,
	FlexBlock,
	FlexItem,
	PanelBody,
	PanelRow,
	RadioControl,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { volumeUp, volumeDown } from '../../../assets/icon';
import VideoPlayer from '../../../components/VideoPlayer/VideoPlayer';
import VideopackTooltip from './VideopackTooltip';
import WatermarkSettingsPanel from './WatermarkSettingsPanel';

const PlayerSettings = ({ settings, setSettings, changeHandlerFactory }) => {
	const {
		embed_method,
		overlay_title,
		watermark,
		watermark_styles,
		watermark_link_to,
		watermark_url,
		align,
		resize,
		auto_res,
		enable_custom_resolution,
		custom_resolution,
		auto_codec,
		pixel_ratio,
		find_formats,
		fullwidth,
		width,
		height,
		legacy_dimensions,
		fixed_aspect,
		controls,
		playsinline,
		pauseothervideos,
		volume,
		preload,
		skin,
		embeddable,
		embedcode,
		downloadlink,
		view_count,
		inline,
		minimum_width,
		autoplay,
		loop,
		muted,
		gifmode,
		playback_rate,
		encode,
	} = settings;

	const changeGifmode = (value) => {
		setSettings((prevSettings) => ({
			...prevSettings,
			gifmode: value,
			autoplay: value,
			loop: value,
			muted: value,
		}));
		if (value) {
			setSettings((prevSettings) => ({
				...prevSettings,
				controls: false,
				embeddable: false,
				overlay_title: false,
				view_count: false,
				playsinline: true,
			}));
		} else {
			setSettings((prevSettings) => ({
				...prevSettings,
				controls: true,
				embeddable: true,
			}));
		}
	};

	const handleCodecCheckboxChange = (codecId, isEnabled) => {
		const newEncode = JSON.parse(JSON.stringify(settings.encode || {}));
		const { codecs, resolutions } = videopack_config;
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

	const embedMethodOptions = [
		{
			value: 'Video.js',
			label: __('Video.js', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'WordPress Default',
			label: __('WordPress Default', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'None',
			label: __('None', 'video-embed-thumbnail-generator'),
		},
	];

	const preloadOptions = [
		{
			value: 'auto',
			label: __('Auto', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'metadata',
			label: __('Metadata', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'none',
			label: _x('None', 'Preload value'),
		},
	];

	const fixedAspectOptions = [
		{
			value: 'false',
			label: __('None', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'true',
			label: __('All', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'vertical',
			label: __('Vertical Videos', 'video-embed-thumbnail-generator'),
		},
	];

	const watermarkLinkOptions = [
		{
			value: 'home',
			label: __('Home page', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'parent',
			label: __('Parent post', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'attachment',
			label: __(
				'Video attachment page',
				'video-embed-thumbnail-generator'
			),
		},
		{
			value: 'download',
			label: __('Download video', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'custom',
			label: __('Custom URL', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'false',
			label: __('None', 'video-embed-thumbnail-generator'),
		},
	];

	const skinOptions = [
		{
			value: 'kg-video-js-skin',
			label: __('Videopack', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'default',
			label: __('Video.js default', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'vjs-theme-city',
			label: __('City', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'vjs-theme-fantasy',
			label: __('Fantasy', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'vjs-theme-forest',
			label: __('Forest', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'vjs-theme-sea',
			label: __('Sea', 'video-embed-thumbnail-generator'),
		},
	];

	const alignOptions = [
		{
			value: '',
			label: videopack_config.contentSize
				? sprintf(
					/* translators: %s: Content size in pixels. */
					__(
						"None (use theme's default width: %s)",
						'video-embed-thumbnail-generator'
					),
					videopack_config.contentSize
				)
				: __(
					"None (use theme's default width)",
					'video-embed-thumbnail-generator'
				),
		},
		{
			value: 'wide',
			label: videopack_config.wideSize
				? sprintf(
					/* translators: %s: Wide size in pixels. */
					__(
						"Wide (use theme's wide width: %s)",
						'video-embed-thumbnail-generator'
					),
					videopack_config.wideSize
				)
				: __(
					"Wide (use theme's wide width)",
					'video-embed-thumbnail-generator'
				),
		},
		{
			value: 'full',
			label: __('Full width', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'left',
			label: __('Left', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'center',
			label: __('Center', 'video-embed-thumbnail-generator'),
		},
		{
			value: 'right',
			label: __('Right', 'video-embed-thumbnail-generator'),
		},
	];

	const autoResOptions = () => {
		const items = [
			{
				value: 'automatic',
				label: __('Automatic', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'highest',
				label: __('Highest', 'video-embed-thumbnail-generator'),
			},
			{
				value: 'lowest',
				label: __('Lowest', 'video-embed-thumbnail-generator'),
			},
		];

		videopack_config.resolutions.forEach((resolution) => {
			items.push({
				value: resolution.id,
				label: resolution.name,
			});
		});

		return items;
	};

	const autoCodecOptions = () => {
		const items = [];
		videopack_config.codecs.forEach((codec) => {
			items.push({
				value: codec.id,
				label: codec.name,
			});
		});
		return items;
	};

	const handleVideoPlayerReady = () => { };

	const watermarkSettings = {
		url: watermark,
		...watermark_styles,
	};

	const handleWatermarkChange = (newSettings) => {
		const { url, ...styles } = newSettings;
		changeHandlerFactory.watermark(url);
		changeHandlerFactory.watermark_styles(styles);
	};

	return (
		<>
			<PanelBody>
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Video player:',
							'video-embed-thumbnail-generator'
						)}
						value={embed_method}
						onChange={changeHandlerFactory.embed_method}
						options={embedMethodOptions}
					/>
					<VideopackTooltip
						text={__(
							'Video.js version 8 is the default player. You can also choose the WordPress Default Mediaelement.js player which may already be skinned to match your theme. Selecting "None" will disable all plugin-related CSS and JS on the front end.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
			</PanelBody>
			<PanelBody>
				<div className={'videopack-sample-video-player'}>
					<div
						className={`wp-block-videopack-videopack-video${align ? ` align${align}` : ''
							}`}
					>
						<PanelRow>
							<Flex className="videopack-flex-bottom">
								<FlexBlock>
									<ToggleControl
										__nextHasNoMarginBottom
										label={__(
											'Overlay title',
											'video-embed-thumbnail-generator'
										)}
										onChange={
											changeHandlerFactory.overlay_title
										}
										checked={!!overlay_title}
									/>
								</FlexBlock>
								<FlexBlock>
									<ToggleControl
										__nextHasNoMarginBottom
										label={__(
											'Download link',
											'video-embed-thumbnail-generator'
										)}
										onChange={
											changeHandlerFactory.downloadlink
										}
										checked={!!downloadlink}
									/>
								</FlexBlock>
								<FlexBlock>
									<FlexItem>
										<ToggleControl
											__nextHasNoMarginBottom
											label={__(
												'Embed code',
												'video-embed-thumbnail-generator'
											)}
											onChange={
												changeHandlerFactory.embedcode
											}
											checked={!!embedcode}
											disabled={!embeddable}
										/>
									</FlexItem>
								</FlexBlock>
							</Flex>
						</PanelRow>

						<VideoPlayer
							attributes={{
								...settings,
								sources: [
									{
										src:
											videopack_config.url +
											'/src/images/Adobestock_469037984.mp4',
										type: 'video/mp4',
									},
								],
								id: 'sample-video',
								title: 'Sample Video',
								overlay_title,
								starts: 23,
								embedlink: 'https://www.website.com/embed/',
								caption: __(
									"If text is entered in the attachment's caption field it is displayed here automatically."
								),
							}}
							onReady={handleVideoPlayerReady}
						/>

						<PanelRow className="videopack-flex-right">
							<ToggleControl
								__nextHasNoMarginBottom
								label={__(
									'View count',
									'video-embed-thumbnail-generator'
								)}
								onChange={changeHandlerFactory.view_count}
								checked={!!view_count}
							/>
						</PanelRow>
					</div>
				</div>
			</PanelBody>
			<PanelBody
				title={__(
					'Default Playback',
					'video-embed-thumbnail-generator'
				)}
				initialOpen={true}
				className="videopack-setting-default-playback"
			>
				<Flex
					align-items="flex-start"
					expanded={false}
					gap={20}
					justify="flex-start"
				>
					<FlexItem>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__(
								'Autoplay',
								'video-embed-thumbnail-generator'
							)}
							onChange={changeHandlerFactory.autoplay}
							checked={!!autoplay}
							disabled={gifmode}
							help={__(
								'Most browsers will only autoplay if the video starts muted.'
							)}
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__(
								'Loop',
								'video-embed-thumbnail-generator'
							)}
							onChange={changeHandlerFactory.loop}
							checked={!!loop}
							disabled={gifmode}
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__(
								'Muted',
								'video-embed-thumbnail-generator'
							)}
							onChange={changeHandlerFactory.muted}
							checked={!!muted}
							disabled={gifmode}
						/>
						<RangeControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							className="videopack-volume-control"
							label={__(
								'Volume',
								'video-embed-thumbnail-generator'
							)}
							value={volume}
							beforeIcon={volumeDown}
							afterIcon={volumeUp}
							initialPosition={1}
							withInputField={false}
							onChange={changeHandlerFactory.volume}
							min={0}
							max={1}
							step={0.05}
							disabled={muted || gifmode}
						/>
					</FlexItem>
					<FlexItem>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__(
								'Controls',
								'video-embed-thumbnail-generator'
							)}
							onChange={changeHandlerFactory.controls}
							checked={!!controls}
							disabled={gifmode}
						/>

						<ToggleControl
							__nextHasNoMarginBottom
							label={__(
								'Play inline',
								'video-embed-thumbnail-generator'
							)}
							onChange={changeHandlerFactory.playsinline}
							checked={!!playsinline}
							disabled={gifmode}
							help={__(
								'Plays inline instead of fullscreen on iPhones.'
							)}
						/>

						<ToggleControl
							__nextHasNoMarginBottom
							label={__(
								'Variable speeds',
								'video-embed-thumbnail-generator'
							)}
							onChange={changeHandlerFactory.playback_rate}
							disabled={gifmode}
							checked={!!playback_rate}
						/>
						<RadioControl
							label={
								<span className="videopack-label-with-tooltip">
									{__('Preload', 'video-embed-thumbnail-generator')}
									<VideopackTooltip
										text={__(
											'Controls how much of a video to load before the user starts playback. Mobile browsers never preload any video information. Selecting "metadata" will load the height and width and format information along with a few seconds of the video in some desktop browsers. "Auto" will preload nearly a minute of video in most desktop browsers. "None" will prevent all data from preloading.',
											'video-embed-thumbnail-generator'
										)}
									/>
								</span>
							}
							selected={preload}
							onChange={changeHandlerFactory.preload}
							options={preloadOptions}
							disabled={gifmode}
						/>
					</FlexItem>
				</Flex>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('GIF mode', 'video-embed-thumbnail-generator')}
						onChange={(value) => {
							changeGifmode(value);
						}}
						checked={!!gifmode}
					/>
					<VideopackTooltip
						text={__(
							'Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				{embed_method.startsWith('Video.js') && (
					<div className="videopack-setting-reduced-width">
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Skin:',
								'video-embed-thumbnail-generator'
							)}
							value={skin}
							onChange={changeHandlerFactory.skin}
							options={skinOptions}
						/>
					</div>
				)}
			</PanelBody>
			<PanelBody
				title={__('Dimensions', 'video-embed-thumbnail-generator')}
				initialOpen={true}
			>
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Alignment / Width:',
							'video-embed-thumbnail-generator'
						)}
						value={align}
						onChange={changeHandlerFactory.align}
						options={alignOptions}
					/>
				</div>
				<RadioControl
					label={
						<span className="videopack-label-with-tooltip">
							{__('Constrain to default aspect ratio', 'video-embed-thumbnail-generator')}
							<VideopackTooltip
								text={__(
									'When set to "none," the video player will automatically adjust to the aspect ratio of the video, but in some cases a fixed aspect ratio is required, and vertical videos often fit better on the page when shown in a shorter window.',
									'video-embed-thumbnail-generator'
								)}
							/>
						</span>
					}
					selected={fixed_aspect}
					onChange={changeHandlerFactory.fixed_aspect}
					options={fixedAspectOptions}
					className="videopack-setting-radio-group"
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						'Use legacy dimension settings.',
						'video-embed-thumbnail-generator'
					)}
					onChange={changeHandlerFactory.legacy_dimensions}
					checked={!!legacy_dimensions}
				/>
				{legacy_dimensions && (
					<>
						<span className="videopack-setting-auto-width">
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__(
									'Width:',
									'video-embed-thumbnail-generator'
								)}
								type="number"
								value={width}
								onChange={changeHandlerFactory.width}
							/>
						</span>
						<span className="videopack-setting-auto-width">
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__(
									'Height:',
									'video-embed-thumbnail-generator'
								)}
								type="number"
								value={height}
								onChange={changeHandlerFactory.height}
							/>
						</span>
						<Flex
							direction="column"
							expanded={false}
							align="flex-start"
							justify="flex-start"
						>
							<FlexItem>
								<ToggleControl
									__nextHasNoMarginBottom
									label={__(
										'Shrink player to fit container',
										'video-embed-thumbnail-generator'
									)}
									onChange={changeHandlerFactory.resize}
									checked={!!resize}
								/>
								<div className="videopack-control-with-tooltip">
									<ToggleControl
										__nextHasNoMarginBottom
										label={__(
											'Expand player to full width of container',
											'video-embed-thumbnail-generator'
										)}
										onChange={changeHandlerFactory.fullwidth}
										checked={!!fullwidth}
									/>
									<VideopackTooltip
										text={__(
											"Enabling this will ignore any other width settings and set the width of the video to the width of the container it's in.",
											'video-embed-thumbnail-generator'
										)}
									/>
								</div>
							</FlexItem>
						</Flex>
					</>
				)}
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Default codec:',
							'video-embed-thumbnail-generator'
						)}
						value={auto_codec}
						onChange={changeHandlerFactory.auto_codec}
						options={autoCodecOptions()}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__(
							'Default resolution:',
							'video-embed-thumbnail-generator'
						)}
						value={auto_res}
						onChange={changeHandlerFactory.auto_res}
						options={autoResOptions()}
					/>
					<VideopackTooltip
						text={__(
							'If multiple resolutions for a video are available, you can choose to load the highest or lowest available resolution by default, automatically select the resolution based on the size of the video window, or indicate a particular resolution to use every time.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				<div className="videopack-control-with-tooltip">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Use device pixel ratio for resolution calculation.',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.pixel_ratio}
						checked={!!pixel_ratio}
					/>
					<VideopackTooltip
						text={__(
							'Most modern mobile devices and some very high-resolution desktop displays (what Apple calls a Retina display) use a pixel ratio to calculate the size of their viewport. Using the pixel ratio can result in a higher resolution being selected on mobile devices than on desktop devices. Because these devices actually have extremely high resolutions, and in a responsive design the video player usually takes up more of the screen than on a desktop browser, this is not a mistake, but your users might prefer to use less mobile data.',
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
				watermarkSettings={watermarkSettings}
				onChange={handleWatermarkChange}
				initialOpen={true}
			>
				{watermark && (
					<div className="videopack-setting-reduced-width">
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__(
								'Link to:',
								'video-embed-thumbnail-generator'
							)}
							value={watermark_link_to}
							onChange={changeHandlerFactory.watermark_link_to}
							options={watermarkLinkOptions}
						/>
						{watermark_link_to === 'custom' && (
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__(
									'URL:',
									'video-embed-thumbnail-generator'
								)}
								type="url"
								value={watermark_url}
								onChange={changeHandlerFactory.watermark_url}
							/>
						)}
					</div>
				)}
			</WatermarkSettingsPanel>
			<PanelBody
				title={__('Video Sources', 'video-embed-thumbnail-generator')}
			>
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
								'Custom Resolution Height:',
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
						label={__(
							'Automatically search for other formats of original file.',
							'video-embed-thumbnail-generator'
						)}
						onChange={changeHandlerFactory.find_formats}
						checked={!!find_formats}
					/>

					<VideopackTooltip
						text={__(
							'Videos encoded by Videopack or manually assigned in the Media Library will always be found, but if this setting is enabled for a video named video.mp4, the player will also search for files with the naming pattern basename-codec_resolution. Eg: video-h264_720.mp4, video-vp9_1080.mp4, etc. Legacy filename structures (video-720.mp4, video-1080.mp4, etc.) are still supported.',
							'video-embed-thumbnail-generator'
						)}
					/>
				</div>
				<BaseControl
					label={__(
						'Available Formats:',
						'video-embed-thumbnail-generator'
					)}
					id="videopack-find-formats-codecs"
					className="videopack-setting-checkbox-group"
				>
					<div>
						{videopack_config.codecs.map((codec) => (
							<CheckboxControl
								key={codec.id}
								__nextHasNoMarginBottom
								label={codec.name}
								checked={!!encode?.[codec.id]?.enabled}
								onChange={(isChecked) =>
									handleCodecCheckboxChange(
										codec.id,
										isChecked
									)
								}
							/>
						))}
					</div>
				</BaseControl>
			</PanelBody>
		</>
	);
};

export default PlayerSettings;
