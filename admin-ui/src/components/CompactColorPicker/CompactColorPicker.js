import {
	Button,
	ColorIndicator,
	ColorPalette,
	Dropdown,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// Sentinel attribute value meaning "force CSS `inherit`", distinct from an
// empty string (which means "unset -- defer to context/global settings").
// Both Context_Manager::resolve() (PHP) and getEffectiveValue() (JS) already
// treat any non-empty string as a terminal, chain-stopping value, so the
// literal word "inherit" needs no special-casing there -- it flows straight
// through into `--videopack-{key}: inherit`, which is itself valid CSS when
// substituted into `color: var(--videopack-{key}, ...)`. The label shown to
// users is "Theme Default" rather than "Inherit" -- less jargon-y, and
// "Inherit Text"/"Inherit Background" read awkwardly next to each other,
// where "Theme Default" reads fine for either.
export const INHERIT = 'inherit';
const INHERIT_LABEL = __( 'Theme Default', 'video-embed-thumbnail-generator' );

/**
 * A compact color picker using a dropdown and color palette.
 *
 * @param {Object}   props                Component props.
 * @param {string}   props.label          Label for the color picker.
 * @param {string}   props.value          Current color value.
 * @param {Function} props.onChange       Callback for color change.
 * @param {Array}    props.colors         Available color palette.
 * @param {string}   props.fallbackValue  Default color to show when value is empty.
 * @param {boolean}  [props.allowInherit] Whether to offer the "Inherit" option.
 * @return {Element} The rendered component.
 */
const CompactColorPicker = ( {
	label,
	value,
	onChange,
	colors,
	fallbackValue,
	allowInherit = true,
} ) => {
	const isInherit = value === INHERIT;

	const resolveValueToHex = ( val ) => {
		if (
			typeof val === 'string' &&
			val.startsWith( 'var(--wp--preset--color--' )
		) {
			const slug = val
				.replace( 'var(--wp--preset--color--', '' )
				.replace( ')', '' );
			const matched = colors?.find( ( c ) => c.slug === slug );
			if ( matched ) {
				return matched.color;
			}
		}
		return val;
	};

	const hexValue = isInherit ? '' : resolveValueToHex( value );
	const displayColor =
		hexValue || resolveValueToHex( fallbackValue ) || 'transparent';

	const handleOnChange = ( val ) => {
		if ( val === undefined ) {
			onChange( '' );
			return;
		}
		const matched = colors?.find( ( c ) => c.color === val );
		if ( matched && matched.slug ) {
			onChange( `var(--wp--preset--color--${ matched.slug })` );
		} else {
			onChange( val );
		}
	};

	return (
		<div className="videopack-color-picker-container">
			<span className="videopack-color-picker-label">{ label }</span>
			<Dropdown
				className="videopack-color-dropdown"
				contentClassName="videopack-color-dropdown-content"
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						onClick={ onToggle }
						aria-expanded={ isOpen }
						variant="secondary"
						label={ isInherit ? INHERIT_LABEL : undefined }
						className={ `videopack-color-picker-button ${
							isInherit ? 'is-inherit' : ''
						}` }
					>
						{ isInherit ? (
							<span className="videopack-color-inherit-indicator" />
						) : (
							<ColorIndicator colorValue={ displayColor } />
						) }
					</Button>
				) }
				renderContent={ () => (
					<div className="videopack-color-picker-palette-wrapper">
						<ColorPalette
							colors={ colors }
							value={
								! isInherit && hexValue !== ''
									? hexValue
									: undefined
							}
							onChange={ handleOnChange }
							disableCustomColors={ false }
							clearable={ true }
						/>
						{ allowInherit && (
							<Button
								className="videopack-color-inherit-button"
								variant="tertiary"
								isPressed={ isInherit }
								onClick={ () =>
									onChange( isInherit ? '' : INHERIT )
								}
							>
								{ INHERIT_LABEL }
							</Button>
						) }
					</div>
				) }
			/>
		</div>
	);
};

export default CompactColorPicker;
