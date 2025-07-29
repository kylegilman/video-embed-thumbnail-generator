/* global videopack */

import { __, _x } from '@wordpress/i18n';
import {
	BaseControl,
	Button,
	CheckboxControl,
	Flex,
	FlexBlock,
	FlexItem,
	Icon,
	PanelBody,
	PanelRow,
	RadioControl,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	Tooltip,
} from '@wordpress/components';
import { help } from '@wordpress/icons';
import { volumeUp, volumeDown } from '../icon';
import VideoPlayer from '../VideopackRender/player/VideoPlayer';
import VideopackTooltip from './VideopackTooltip';
import TextControlOnBlur from './TextControlOnBlur';

const PlayerSettings = ({ settings, setSettings, changeHandlerFactory }) => {
	const {
		embed_method,
		overlay_title,
		watermark,
		watermark_link_to,
		watermark_url,
		align,
		resize,
		auto_res,
		pixel_ratio,
		find_formats,
		fullwidth,
		width,
		height,
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
		gallery_pagination,
		nativecontrolsfortouch,
		autoplay,
		loop,
		muted,
		gifmode,
		playback_rate,
		encode,
		endofvideooverlaysame,
		browser_thumbnails,
		auto_encode,
		auto_encode_gif,
		auto_thumb,
		open_graph,
		twitter_card,
		oembed_provider,
		sample_rotate,
		alwaysloadscripts,
		replace_video_shortcode,
		auto_publish_post,
		transient_cache,
		queue_control,
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
		const { codecs, resolutions } = videopack.settings;
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
			label: __('Video.js'),
		},
		{
			value: 'WordPress Default',
			label: __('WordPress Default'),
		},
		{
			value: 'None',
			label: __('None'),
		},
	];

	const preloadOptions = [
		{
			value: 'auto',
			label: __('Auto'),
		},
		{
			value: 'metadata',
			label: __('Metadata'),
		},
		{
			value: 'none',
			label: _x('None', 'Preload value'),
		},
	];

	const fixedAspectOptions = [
		{
			value: 'false',
			label: __('None'),
		},
		{
			value: 'true',
			label: __('All'),
		},
		{
			value: 'vertical',
			label: __('Vertical Videos'),
		},
	];

	const watermarkLinkOptions = [
		{
			value: 'home',
			label: __('Home page'),
		},
		{
			value: 'parent',
			label: __('Parent post'),
		},
		{
			value: 'attachment',
			label: __('Video attachment page'),
		},
		{
			value: 'download',
			label: __('Download video'),
		},
		{
			value: 'Custom URL',
			label: __('Custom URL'),
		},
		{
			value: 'None',
			label: __('None'),
		},
	];

	const skinOptions = [
		{
			value: 'kg-video-js-skin',
			label: __('Videopack'),
		},
		{
			value: 'default',
			label: __('Video.js default'),
		},
		{
			value: 'vjs-theme-city',
			label: __('City'),
		},
		{
			value: 'vjs-theme-fantasy',
			label: __('Fantasy'),
		},
		{
			value: 'vjs-theme-forest',
			label: __('Forest'),
		},
		{
			value: 'vjs-theme-sea',
			label: __('Sea'),
		},
	];

	const autoResOptions = () => {
		const items = [
			{
				value: 'automatic',
				label: __('Automatic'),
			},
			{
				value: 'highest',
				label: __('Highest'),
			},
			{
				value: 'lowest',
				label: __('Lowest'),
			},
		];

		videopack.settings.resolutions.forEach((resolution) => {
			items.push({
				value: resolution.id,
				label: resolution.name,
			});
		});

		return items;
	};

	const onSelectMedia = (media) => {
		console.log(media);
	};

	const handleVideoPlayerReady = () => {};

	return (
		<>
			<PanelBody>
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Video player:')}
						value={embed_method}
						onChange={changeHandlerFactory.embed_method}
						options={embedMethodOptions}
					/>
					<Tooltip
						text={__(
							'Video.js version 8 is the default player. You can also choose the WordPress Default Mediaelement.js player which may already be skinned to match your theme. Selecting "None" will disable all plugin-related CSS and JS on the front end.'
						)}
						className="videopack-tooltip"
					>
						<span className="videopack-tooltip">
							<Icon icon={help} />
						</span>
					</Tooltip>
				</div>
			</PanelBody>
			<PanelBody>
				<PanelRow>
					<Flex className="videopack-flex-bottom">
						<FlexBlock>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Overlay title')}
								onChange={changeHandlerFactory.overlay_title}
								checked={!!overlay_title}
							/>
						</FlexBlock>
						<FlexBlock>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Download link')}
								onChange={changeHandlerFactory.downloadlink}
								checked={!!downloadlink}
							/>
						</FlexBlock>
						<FlexBlock>
							<FlexItem>
								<ToggleControl
									__nextHasNoMarginBottom
									label={__('Embed code')}
									onChange={changeHandlerFactory.embedcode}
									checked={!!embedcode}
									disabled={!embeddable}
								/>
							</FlexItem>
						</FlexBlock>
					</Flex>
				</PanelRow>
				<div>
					<VideoPlayer
						attributes={{
							...settings,
							src:
								videopack.settings.url +
								'/src/images/Adobestock_469037984.mp4',
							id: 'sample-video',
							videoTitle: 'Sample Video',
							title: overlay_title,
						}}
						onReady={handleVideoPlayerReady}
					/>
				</div>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('View count')}
						onChange={changeHandlerFactory.view_count}
						checked={!!view_count}
					/>
				</PanelRow>
			</PanelBody>
			<PanelBody
				title={__('Default Playback')}
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
							label={__('Autoplay')}
							onChange={changeHandlerFactory.autoplay}
							checked={!!autoplay}
							disabled={gifmode}
							help={__(
								'Most browsers will only autoplay if the video starts muted.'
							)}
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__('Loop')}
							onChange={changeHandlerFactory.loop}
							checked={!!loop}
							disabled={gifmode}
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__('Muted')}
							onChange={changeHandlerFactory.muted}
							checked={!!muted}
							disabled={gifmode}
						/>
						<RangeControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							className="videopack-volume-control"
							label={__('Volume')}
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
							label={__('Controls')}
							onChange={changeHandlerFactory.controls}
							checked={!!controls}
							disabled={gifmode}
						/>

						<ToggleControl
							__nextHasNoMarginBottom
							label={__('Play inline')}
							onChange={changeHandlerFactory.playsinline}
							checked={!!playsinline}
							disabled={gifmode}
							help={__(
								'Plays inline instead of fullscreen on iPhones.'
							)}
						/>

						<ToggleControl
							__nextHasNoMarginBottom
							label={__('Variable speeds')}
							onChange={changeHandlerFactory.playback_rate}
							disabled={gifmode}
							checked={!!playback_rate}
						/>
						<div className="videopack-control-with-tooltip">
							<RadioControl
								label={__('Preload')}
								value={preload}
								onChange={changeHandlerFactory.preload}
								options={preloadOptions}
								disabled={gifmode}
							/>
							<VideopackTooltip
								text={__(
									'Controls how much of a video to load before the user starts playback. Mobile browsers never preload any video information. Selecting "metadata" will load the height and width and format information along with a few seconds of the video in some desktop browsers. "Auto" will preload nearly a minute of video in most desktop browsers. "None" will prevent all data from preloading.'
								)}
							/>
						</div>
					</FlexItem>
				</Flex>
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('GIF mode')}
					onChange={(value) => {
						changeGifmode(value);
					}}
					checked={!!gifmode}
					help={__(
						'Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.'
					)}
				/>
				{embed_method.startsWith('Video.js') && (
					<div className="videopack-setting-reduced-width">
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__('Skin:')}
							value={skin}
							onChange={changeHandlerFactory.skin}
							options={skinOptions}
						/>
					</div>
				)}
			</PanelBody>
			<PanelBody title={__('Dimensions')} initialOpen={true}>
				<Flex
					direction="column"
					expanded={false}
					align="flex-start"
					justify="flex-start"
				>
					<FlexItem>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__('Shrink player to fit container')}
							onChange={changeHandlerFactory.resize}
							checked={!!resize}
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__(
								'Expand player to full width of container'
							)}
							onChange={changeHandlerFactory.fullwidth}
							checked={!!fullwidth}
						/>
					</FlexItem>
				</Flex>
				<span className="videopack-setting-auto-width">
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Width:')}
						type="number"
						value={width}
						onChange={changeHandlerFactory.width}
					/>
				</span>
				<span className="videopack-setting-auto-width">
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Height:')}
						type="number"
						value={height}
						onChange={changeHandlerFactory.height}
					/>
				</span>
				<div className="videopack-control-with-tooltip">
					<RadioControl
						label={__('Constrain to default aspect ratio')}
						selected={fixed_aspect}
						onChange={changeHandlerFactory.fixed_aspect}
						options={fixedAspectOptions}
						className="videopack-setting-radio-group"
					/>
					<VideopackTooltip
						text={__(
							'When set to "none," the video player will automatically adjust to the aspect ratio of the video, but in some cases a fixed aspect ratio is required, and vertical videos often fit better on the page when shown in a shorter window.'
						)}
					/>
				</div>
				<div className="videopack-setting-reduced-width">
					<SelectControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Default resolution:')}
						value={auto_res}
						onChange={changeHandlerFactory.auto_res}
						options={autoResOptions()}
					/>
					<VideopackTooltip
						text={__(
							'If multiple H.264 resolutions for a video are available, you can choose to load the highest or lowest available resolution by default, automatically select the resolution based on the size of the video window, or indicate a particular resolution to use every time.'
						)}
					/>
				</div>
				<div className="videopack-setting-reduced-width">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Use device pixel ratio for resolution calculation.'
						)}
						onChange={changeHandlerFactory.pixel_ratio}
						checked={!!pixel_ratio}
					/>
					<VideopackTooltip
						text={__(
							'Most modern mobile devices and some very high-resolution desktop displays (what Apple calls a Retina display) use a pixel ratio to calculate the size of their viewport. Using the pixel ratio can result in a higher resolution being selected on mobile devices than on desktop devices. Because these devices actually have extremely high resolutions, and in a responsive design the video player usually takes up more of the screen than on a desktop browser, this is not a mistake, but your users might prefer to use less mobile data.'
						)}
					/>
				</div>
			</PanelBody>
			<PanelBody title={__('Formats')}>
				<div className="videopack-setting-reduced-width">
					<ToggleControl
						__nextHasNoMarginBottom
						label={__(
							'Automatically search for other codecs and resolutions.'
						)}
						onChange={changeHandlerFactory.find_formats}
						checked={!!find_formats}
					/>
					<VideopackTooltip
						text={__(
							'If a video named video.mp4 is selected, the player will also search for files with the naming pattern basename-codec_resolution. Eg: video-h264_720.mp4, video-vp9_1080.mp4, etc. Legacy filename structures (video-720.mp4, video-1080.mp4, etc.) are still supported.'
						)}
					/>
				</div>
				<BaseControl
					label={__('Available Formats:')}
					id="videopack-find-formats-codecs"
					className="videopack-setting-checkbox-group"
				>
					<div>
						{videopack.settings.codecs.map((codec) => (
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
			<PanelBody title={__('Watermark Overlay')} initialOpen={true}>
				<div className="videopack-setting-reduced-width">
					<TextControlOnBlur
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Image URL:')}
						type="url"
						value={watermark}
						onChange={changeHandlerFactory.watermark}
					/>
					<Button
						className="videopack-library-button"
						variant="secondary"
					>
						{__('Choose from library')}
					</Button>
				</div>
				{watermark && (
					<div className="videopack-setting-reduced-width">
						<SelectControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__('Link to:')}
							value={watermark_link_to}
							onChange={changeHandlerFactory.watermark_link_to}
							options={watermarkLinkOptions}
						/>
						{watermark_link_to === 'custom' && (
							<TextControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__('URL:')}
								type="url"
								value={watermark_url}
								onChange={changeHandlerFactory.watermark_url}
							/>
						)}
					</div>
				)}
			</PanelBody>
		</>
	);
};

export default PlayerSettings;
