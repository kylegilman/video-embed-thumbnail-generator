import { __ } from '@wordpress/i18n';
import {
	Button,
	PanelBody,
	RadioControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import TextControlOnBlur from './TextControlOnBlur';

const ThumbnailSettings = ({ settings, changeHandlerFactory }) => {
	const {
		browser_thumbs,
		ffmpeg_exists,
		poster,
		endofvideooverlay,
		thumb_watermark,
		total_thumbnails,
		featured,
		thumb_parent,
		hide_thumbnails,
		endofvideooverlaysame,
	} = settings;

	const thumbParentOptions = [
		{
			value: 'post',
			label: __('Post'),
		},
		{
			value: 'video',
			label: __('Video'),
		},
	];

	return (
		<PanelBody>
			<div className="videopack-setting-auto-width">
				<TextControl
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('Number of thumbnails to generate:')}
					type="number"
					value={total_thumbnails}
					onChange={changeHandlerFactory.total_thumbnails}
				/>
			</div>
			{ffmpeg_exists === true && (
				<ToggleControl
					__nextHasNoMarginBottom
					label={__(
						"When possible, use the browser's built-in video capabilities to make thumbnails instead of FFmpeg."
					)}
					value={browser_thumbs}
					onChange={changeHandlerFactory.browser_thumbs}
				/>
			)}
			<div className="videopack-setting-reduced-width">
				<TextControlOnBlur
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('Default thumbnail:')}
					type="url"
					value={poster}
					onChange={changeHandlerFactory.poster}
				/>
				<Button
					className="videopack-library-button"
					variant="secondary"
				>
					{__('Choose from library')}
				</Button>
			</div>
			<ToggleControl
				__nextHasNoMarginBottom
				label={__('Display thumbnail image again when video ends.')}
				onChange={changeHandlerFactory.endofvideooverlaysame}
				checked={!!endofvideooverlaysame}
			/>
			<div className="videopack-setting-reduced-width">
				<TextControlOnBlur
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('End of video image:')}
					type="url"
					value={endofvideooverlay}
					onChange={changeHandlerFactory.endofvideooverlay}
					disabled={endofvideooverlaysame}
				/>
				<Button
					className="videopack-library-button"
					variant="secondary"
				>
					{__('Choose from library')}
				</Button>
			</div>
			<div className="videopack-setting-reduced-width">
				<TextControlOnBlur
					__nextHasNoMarginBottom
					__next40pxDefaultSize
					label={__('Add watermark to generated thumbnails:')}
					type="url"
					value={thumb_watermark?.url}
					onChange={changeHandlerFactory.thumb_watermark}
				/>
				<Button
					className="videopack-library-button"
					variant="secondary"
				>
					{__('Choose from library')}
				</Button>
			</div>
			<ToggleControl
				__nextHasNoMarginBottom
				label={__('Hide generated thumnbails from the Media Library.')}
				onChange={changeHandlerFactory.hide_thumbnails}
				checked={!!hide_thumbnails}
			/>
			<div className="videopack-setting-extra-margin">
				<ToggleControl
					__nextHasNoMarginBottom
					label={__('Set generated thumbnails as featured images.')}
					onChange={changeHandlerFactory.featured}
					checked={!!featured}
				/>
				<Button variant="secondary">{__('Set all as featured')}</Button>
			</div>
			<div className="videopack-setting-extra-margin">
				<RadioControl
					label={__('Attach thumbnails to:')}
					selected={thumb_parent}
					options={thumbParentOptions}
					onChange={changeHandlerFactory.thumb_parent}
					className="videopack-setting-radio-group"
				/>
				<Button variant="secondary">{__('Set all parents')}</Button>
			</div>
		</PanelBody>
	);
};

export default ThumbnailSettings;
