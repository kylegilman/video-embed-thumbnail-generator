import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import TextControlOnBlur from './TextControlOnBlur';

const ChooseFromLibrary = ({ value, onChange, label, ...props }) => {
	const openMediaLibrary = () => {
		const frame = window.wp.media({
			title: __('Select Image', 'video-embed-thumbnail-generator'),
			button: {
				text: __('Use this image', 'video-embed-thumbnail-generator'),
			},
			multiple: false,
			library: {
				type: 'image',
			},
		});

		frame.on('select', () => {
			const attachment = frame.state().get('selection').first().toJSON();
			onChange(attachment.url);
		});

		frame.open();
	};

	return (
		<div className="videopack-setting-reduced-width">
			<TextControlOnBlur
				__nextHasNoMarginBottom
				__next40pxDefaultSize
				label={label}
				value={value}
				onChange={onChange}
				{...props}
			/>
			<Button
				__next40pxDefaultSize
				className="videopack-library-button"
				variant="secondary"
				onClick={openMediaLibrary}
				disabled={props.disabled}
			>
				{__('Choose from library', 'video-embed-thumbnail-generator')}
			</Button>
		</div>
	);
};

export default ChooseFromLibrary;
