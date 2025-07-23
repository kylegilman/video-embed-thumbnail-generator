import { TextControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

const TextControlOnBlur = ( { value, onChange, ...props } ) => {
	const [ innerValue, setInnerValue ] = useState( value );

	useEffect( () => {
		setInnerValue( value );
	}, [ value ] );

	const handleOnChange = ( newValue ) => {
		setInnerValue( newValue );
	};

	const handleOnBlur = () => {
		onChange( innerValue );
	};

	return (
		<TextControl
			{ ...props }
			value={ innerValue }
			onChange={ handleOnChange }
			onBlur={ handleOnBlur }
		/>
	);
};

export default TextControlOnBlur;
