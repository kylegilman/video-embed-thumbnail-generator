import {
	Button,
	ColorIndicator,
	ColorPalette,
	Dropdown,
} from '@wordpress/components';


/**
 * A compact color picker using a dropdown and color palette.
 *
 * @param {Object}   props               Component props.
 * @param {string}   props.label         Label for the color picker.
 * @param {string}   props.value         Current color value.
 * @param {Function} props.onChange      Callback for color change.
 * @param {Array}    props.colors        Available color palette.
 * @param {string}   props.fallbackValue Default color to show when value is empty.
 * @return {Element} The rendered component.
 */
const CompactColorPicker = ({
	label,
	value,
	onChange,
	colors,
	fallbackValue,
}) => {
	const resolveValueToHex = (val) => {
		if (
			typeof val === 'string' &&
			val.startsWith('var(--wp--preset--color--')
		) {
			const slug = val
				.replace('var(--wp--preset--color--', '')
				.replace(')', '');
			const matched = colors?.find((c) => c.slug === slug);
			if (matched) {
				return matched.color;
			}
		}
		return val;
	};

	const hexValue = resolveValueToHex(value);
	const displayColor =
		hexValue || resolveValueToHex(fallbackValue) || 'transparent';

	const handleOnChange = (val) => {
		if (val === undefined) {
			onChange('');
			return;
		}
		const matched = colors?.find((c) => c.color === val);
		if (matched && matched.slug) {
			onChange(`var(--wp--preset--color--${matched.slug})`);
		} else {
			onChange(val);
		}
	};

	return (
		<div className="videopack-color-picker-container">
			<span className="videopack-color-picker-label">{label}</span>
			<Dropdown
				className="videopack-color-dropdown"
				contentClassName="videopack-color-dropdown-content"
				renderToggle={({ isOpen, onToggle }) => (
					<Button
						onClick={onToggle}
						aria-expanded={isOpen}
						variant="secondary"
						className="videopack-color-picker-button"
					>
						<ColorIndicator colorValue={displayColor} />
					</Button>
				)}
				renderContent={() => (
					<div className="videopack-color-picker-palette-wrapper">
						<ColorPalette
							colors={colors}
							value={hexValue === '' ? undefined : hexValue}
							onChange={handleOnChange}
							disableCustomColors={false}
							clearable={true}
						/>
					</div>
				)}
			/>
		</div>
	);
};

export default CompactColorPicker;
