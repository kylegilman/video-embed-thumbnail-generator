import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import TextControlOnBlur from './TextControlOnBlur';

const SelectFromLibrary = ({ value, onChange, label, children, ...props }) => {
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
			<div className="videopack-library-button-wrapper">
				<Button
					__next40pxDefaultSize
					className="videopack-library-button"
					variant="secondary"
					onClick={openMediaLibrary}
					disabled={props.disabled}
				>
					{__(
						'Select from library',
						'video-embed-thumbnail-generator'
					)}
				</Button>
				{children}
			</div>
		</div>
	);
};

export default SelectFromLibrary;
