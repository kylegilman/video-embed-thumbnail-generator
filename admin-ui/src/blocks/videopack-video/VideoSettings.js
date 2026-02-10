import {
	PanelBody,
	PanelRow,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';

import { volumeUp, volumeDown } from '../../assets/icon';
import useVideoSettings from '../../hooks/useVideoSettings';

const VideoSettings = ({ attributes, setAttributes, options }) => {
	const { handleSettingChange, preloadOptions } = useVideoSettings(
		attributes,
		setAttributes
	);

	const [displayAttributes, setDisplayAttributes] = useState({});

	useEffect(() => {
		if (options) {
			setDisplayAttributes({ ...options, ...attributes });
		}
	}, [options, attributes]);

	return (
		<>
			<PanelBody title={__( 'Player Settings', 'video-embed-thumbnail-generator' )} initialOpen={false}>
				{!displayAttributes.gifmode && (
					<>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__( 'Autoplay', 'video-embed-thumbnail-generator' )}
								onChange={(value) =>
									handleSettingChange('autoplay', value)
								}
								checked={!!displayAttributes.autoplay}
								help={
									displayAttributes.autoplay &&
									!displayAttributes.muted
										? __(
												'Autoplay is disabled while editing unless muted.'
											)
										: null
								}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__( 'Loop', 'video-embed-thumbnail-generator' )}
								onChange={(value) =>
									handleSettingChange('loop', value)
								}
								checked={!!displayAttributes.loop}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__( 'Muted', 'video-embed-thumbnail-generator' )}
								onChange={(value) =>
									handleSettingChange('muted', value)
								}
								checked={!!displayAttributes.muted}
							/>
						</PanelRow>
						{!displayAttributes.muted && (
							<RangeControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__( 'Volume', 'video-embed-thumbnail-generator' )}
								value={displayAttributes.volume}
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
								label={__( 'Controls', 'video-embed-thumbnail-generator' )}
								onChange={(value) =>
									handleSettingChange('controls', value)
								}
								checked={!!displayAttributes.controls}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__( 'Variable playback speeds', 'video-embed-thumbnail-generator' )}
								onChange={(value) =>
									handleSettingChange('playback_rate', value)
								}
								checked={!!displayAttributes.playback_rate}
							/>
						</PanelRow>
						<PanelRow>
							<SelectControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={__( 'Preload', 'video-embed-thumbnail-generator' )}
								value={displayAttributes.preload}
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
						label={__( 'GIF mode', 'video-embed-thumbnail-generator' )}
						onChange={(value) =>
							handleSettingChange('gifmode', value)
						}
						checked={!!displayAttributes.gifmode}
						help={__(
							'Video acts like an animated GIF. Enables autoplay, loop, mute, and disables controls.'
						)}
					/>
				</PanelRow>
			</PanelBody>
			<PanelBody title={__( 'Sharing', 'video-embed-thumbnail-generator' )} initialOpen={false}>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__( 'Allow embedding on other sites', 'video-embed-thumbnail-generator' )}
						onChange={(value) =>
							handleSettingChange('embeddable', value)
						}
						checked={!!displayAttributes.embeddable}
					/>
				</PanelRow>
				{displayAttributes.embeddable && (
					<>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__( 'Download link', 'video-embed-thumbnail-generator' )}
								onChange={(value) =>
									handleSettingChange('downloadlink', value)
								}
								checked={!!displayAttributes.downloadlink}
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__( 'Embed code', 'video-embed-thumbnail-generator' )}
								onChange={(value) =>
									handleSettingChange('embedcode', value)
								}
								checked={!!displayAttributes.embedcode}
							/>
						</PanelRow>
					</>
				)}
			</PanelBody>
			<PanelBody title={__( 'Metadata', 'video-embed-thumbnail-generator' )} initialOpen={false}>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__( 'Overlay title', 'video-embed-thumbnail-generator' )}
						onChange={(value) =>
							handleSettingChange('overlay_title', value)
						}
						checked={!!displayAttributes.overlay_title}
					/>
				</PanelRow>
				{displayAttributes.overlay_title && (
					<PanelRow>
						<TextControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							label={__( 'Title', 'video-embed-thumbnail-generator' )}
							value={displayAttributes.title || ''}
							onChange={(value) =>
								handleSettingChange('title', value)
							}
						/>
					</PanelRow>
				)}
				<PanelRow>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={__( 'Caption', 'video-embed-thumbnail-generator' )}
						value={displayAttributes.caption || ''}
						onChange={(value) =>
							handleSettingChange('caption', value)
						}
					/>
				</PanelRow>
				<PanelRow>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__( 'View count', 'video-embed-thumbnail-generator' )}
						onChange={(value) =>
							handleSettingChange('view_count', value)
						}
						checked={!!displayAttributes.view_count}
					/>
				</PanelRow>
			</PanelBody>
		</>
	);
};

export default VideoSettings;
