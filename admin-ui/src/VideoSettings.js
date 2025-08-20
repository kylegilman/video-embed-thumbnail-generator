import {
	PanelBody,
	PanelRow,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { volumeUp, volumeDown } from './icon';
import useVideoSettings from './hooks/useVideoSettings';

const VideoSettings = ({ attributes, setAttributes }) => {
	console.log('VideoSettings props:', attributes);
	const { handleSettingChange, preloadOptions } = useVideoSettings(
		attributes,
		setAttributes
	);

	return (
		<>
			<PanelBody title={__('Player Settings')} initialOpen={false}>
				{!attributes.gifmode && (
					<>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Autoplay')}
								onChange={(value) =>
									handleSettingChange('autoplay', value)
								}
								checked={!!attributes.autoplay}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Loop')}
								onChange={(value) =>
									handleSettingChange('loop', value)
								}
								checked={!!attributes.loop}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Muted')}
								onChange={(value) =>
									handleSettingChange('muted', value)
								}
								checked={!!attributes.muted}
							/>
						</PanelRow>
						{!attributes.muted && (
							<RangeControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__('Volume')}
								value={attributes.volume}
								beforeIcon={volumeDown}
								afterIcon={volumeUp}
								initialPosition={1}
								withInputField={false}
								onChange={(value) =>
									handleSettingChange('volume', value)
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
								onChange={(value) =>
									handleSettingChange('controls', value)
								}
								checked={!!attributes.controls}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Play inline')}
								onChange={(value) =>
									handleSettingChange('playsinline', value)
								}
								checked={!!attributes.playsinline}
								help={__(
									'Plays inline instead of fullscreen on iPhones.'
								)}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Variable playback speeds')}
								onChange={(value) =>
									handleSettingChange('playback_rate', value)
								}
								checked={!!attributes.playback_rate}
							/>
						</PanelRow>
						<PanelRow>
							<SelectControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__('Preload')}
								value={attributes.preload}
								onChange={(value) =>
									handleSettingChange('preload', value)
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
						onChange={(value) =>
							handleSettingChange('gifmode', value)
						}
						checked={!!attributes.gifmode}
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
						onChange={(value) =>
							handleSettingChange('embeddable', value)
						}
						checked={!!attributes.embeddable}
					/>
				</PanelRow>
				{attributes.embeddable && (
					<>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Download link')}
								onChange={(value) =>
									handleSettingChange('downloadlink', value)
								}
								checked={!!attributes.downloadlink}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Embed code')}
								onChange={(value) =>
									handleSettingChange('embedcode', value)
								}
								checked={!!attributes.embedcode}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Twitter button')}
								onChange={(value) =>
									handleSettingChange('twitter_button', value)
								}
								checked={!!attributes.twitter_button}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__('Facebook button')}
								onChange={(value) =>
									handleSettingChange(
										'facebook_button',
										value
									)
								}
								checked={!!attributes.facebook_button}
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
						onChange={(value) =>
							handleSettingChange('title', value)
						}
						checked={!!attributes.title}
					/>
				</PanelRow>
				{attributes.title && (
					<PanelRow>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__('Title')}
							value={attributes.videoTitle}
							onChange={(value) =>
								handleSettingChange('videoTitle', value)
							}
						/>
					</PanelRow>
				)}
				<PanelRow>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__('Caption')}
						value={attributes.caption}
						onChange={(value) =>
							handleSettingChange('caption', value)
						}
					/>
				</PanelRow>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('View count')}
						onChange={(value) =>
							handleSettingChange('view_count', value)
						}
						checked={!!attributes.view_count}
					/>
				</PanelRow>
			</PanelBody>
		</>
	);
};

export default VideoSettings;
