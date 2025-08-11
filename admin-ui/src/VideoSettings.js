import {
	PanelBody,
	PanelRow,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __experimentalGetElementClassName } from '@wordpress/block-editor';
import {
	Platform,
	useMemo,
	useCallback,
	useState,
	useEffect,
} from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';

import { volumeUp, volumeDown } from './icon';

const VideoSettings = ({ setAttributes, attributes }) => {
	const {
		autoplay,
		controls,
		loop,
		muted,
		volume,
		gifmode,
		playsinline,
		preload,
		view_count,
		title,
		videoTitle,
		downloadlink,
		twitter_button,
		facebook_button,
		embedcode,
		embeddable,
		playback_rate,
		caption,
	} = attributes;

	useEffect(() => {
		setAttributes({
			autoplay: gifmode,
			loop: gifmode,
			muted: gifmode,
		});
		if (gifmode) {
			setAttributes({
				controls: false,
				embeddable: false,
				title: false,
				view_count: false,
				playsinline: true,
			});
		} else {
			setAttributes({ controls: true });
		}
	}, [gifmode]);

	useEffect(() => {
		if (embeddable === false) {
			setAttributes({
				downloadlink: false,
				embedcode: false,
				twitter_button: false,
				facebook_button: false,
			});
		}
	}, [embeddable]);

	const autoPlayHelpText = __(
		'Autoplay may cause usability issues for some users.'
	);
	const getAutoplayHelp = Platform.select({
		web: useCallback((checked) => {
			return checked ? autoPlayHelpText : null;
		}, []),
		native: autoPlayHelpText,
	});

	const toggleFactory = useMemo(() => {
		const toggleAttribute = (attribute) => {
			return (newValue) => {
				setAttributes({ [attribute]: newValue });
			};
		};

		return {
			autoplay: toggleAttribute('autoplay'),
			loop: toggleAttribute('loop'),
			muted: toggleAttribute('muted'),
			controls: toggleAttribute('controls'),
			playsinline: toggleAttribute('playsinline'),
			view_count: toggleAttribute('view_count'),
			title: toggleAttribute('title'),
			downloadlink: toggleAttribute('downloadlink'),
			embeddable: toggleAttribute('embeddable'),
			embedcode: toggleAttribute('embedcode'),
			twitter_button: toggleAttribute('twitter_button'),
			facebook_button: toggleAttribute('facebook_button'),
			playback_rate: toggleAttribute('playback_rate'),
			gifmode: toggleAttribute('gifmode'),
		};
	}, []);

	const preloadOptions = [
		{ value: 'auto', label: __('Auto') },
		{ value: 'metadata', label: __('Metadata') },
		{ value: 'none', label: _x('None', 'Preload value') },
	];

	return (
		<>
			<PanelBody title={__('Player Settings')} initialOpen={false}>
				{!gifmode && (
					<>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Autoplay')}
								onChange={toggleFactory.autoplay}
								checked={!!autoplay}
								help={getAutoplayHelp}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Loop')}
								onChange={toggleFactory.loop}
								checked={!!loop}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Muted')}
								onChange={toggleFactory.muted}
								checked={!!muted}
							/>
						</PanelRow>
						{!muted && (
							<RangeControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__('Volume')}
								value={volume}
								beforeIcon={volumeDown}
								afterIcon={volumeUp}
								initialPosition={1}
								withInputField={false}
								onChange={(value) =>
									setAttributes({ volume: value })
								}
								min={0}
								max={1}
								step={0.05}
							/>
						)}
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Playback controls')}
								onChange={toggleFactory.controls}
								checked={!!controls}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Play inline')}
								onChange={toggleFactory.playsinline}
								checked={!!playsinline}
								help={__(
									'Plays inline instead of fullscreen on iPhones.'
								)}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Variable playback speeds')}
								onChange={toggleFactory.playback_rate}
								checked={!!playback_rate}
							/>
						</PanelRow>
						<PanelRow>
							<SelectControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__('Preload')}
								value={preload}
								onChange={(value) =>
									setAttributes({ preload: value })
								}
								options={preloadOptions}
								hideCancelButton={true}
							/>
						</PanelRow>
					</>
				)}
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('GIF mode')}
						onChange={toggleFactory.gifmode}
						checked={!!gifmode}
						help={__(
							'Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.'
						)}
					/>
				</PanelRow>
			</PanelBody>
			<PanelBody title={__('Sharing')} initialOpen={false}>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('Allow embedding on other sites')}
						onChange={toggleFactory.embeddable}
						checked={!!embeddable}
					/>
				</PanelRow>
				{embeddable && (
					<>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Download link')}
								onChange={toggleFactory.downloadlink}
								checked={!!downloadlink}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Embed code')}
								onChange={toggleFactory.embedcode}
								checked={!!embedcode}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Twitter button')}
								onChange={toggleFactory.twitter_button}
								checked={!!twitter_button}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Facebook button')}
								onChange={toggleFactory.facebook_button}
								checked={!!facebook_button}
							/>
						</PanelRow>
					</>
				)}
			</PanelBody>
			<PanelBody title={__('Metadata')} initialOpen={false}>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('Overlay title')}
						onChange={toggleFactory.title}
						checked={!!title}
					/>
				</PanelRow>
				{title && (
					<PanelRow>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__('Title')}
							value={videoTitle}
							onChange={(value) =>
								setAttributes({ videoTitle: value })
							}
						/>
					</PanelRow>
				)}
				<PanelRow>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Caption')}
						value={caption}
						onChange={(value) => setAttributes({ caption: value })}
					/>
				</PanelRow>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('View count')}
						onChange={toggleFactory.view_count}
						checked={!!view_count}
					/>
				</PanelRow>
			</PanelBody>
		</>
	);
};

export default VideoSettings;
