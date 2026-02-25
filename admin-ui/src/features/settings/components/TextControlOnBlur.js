import { TextControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const TextControlOnBlur = ({ value, onChange, ...props }) => {
	const [innerValue, setInnerValue] = useState(value);

	useEffect(() => {
		setInnerValue(value);
	}, [value]);

	const handleOnChange = (newValue) => {
		setInnerValue(newValue);
	};

	const handleOnBlur = () => {
		onChange(innerValue);
	};

	const handleOnFocus = (event) => {
		if (innerValue === __('No limit', 'video-embed-thumbnail-generator')) {
			setInnerValue('');
		}
		if (props.onFocus) {
			props.onFocus(event);
		}
	};

	return (
		<TextControl
			{...props}
			value={innerValue}
			onChange={handleOnChange}
			onBlur={handleOnBlur}
			onFocus={handleOnFocus}
		/>
	);
};

export default TextControlOnBlur;
