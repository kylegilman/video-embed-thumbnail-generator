import { __ } from '@wordpress/i18n';

// Every preset value doubles as the literal CSS `aspect-ratio` value it
// produces (e.g. "16/9" -> `aspect-ratio: 16/9`), so resolving an attribute/
// option down to this string is the entire job -- no separate "custom" flag
// or parsing step is needed at render time, only at the picker UI level.
// "auto" is the one special case (see Thumbnail.scss's
// `.has-native-aspect-ratio`): it means "no forced ratio, let the image's own
// shape decide," which needs a different (grid-based) layout, not just a
// different ratio value.
export const ASPECT_RATIO_PRESETS = [
	{
		value: '16/9',
		label: __( '16:9 (widescreen)', 'video-embed-thumbnail-generator' ),
	},
	{
		value: '4/3',
		label: __( '4:3 (standard)', 'video-embed-thumbnail-generator' ),
	},
	{
		value: '1/1',
		label: __( '1:1 (square)', 'video-embed-thumbnail-generator' ),
	},
	{
		value: '9/16',
		label: __( '9:16 (vertical)', 'video-embed-thumbnail-generator' ),
	},
	{
		value: 'auto',
		label: __(
			'Native (image’s own shape)',
			'video-embed-thumbnail-generator'
		),
	},
];

export const ASPECT_RATIO_CUSTOM_VALUE = 'custom';

export const ASPECT_RATIO_DEFAULT = '16/9';

/**
 * A raw aspect-ratio ratio, either one of the presets above or a custom
 * "W/H" string a user typed in (e.g. "21/9").
 *
 * @param {string} value Raw stored value.
 * @return {boolean} Whether it's a valid W/H ratio (not "auto", not empty).
 */
export const isCustomRatioValue = ( value ) =>
	!! value && /^\s*\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?\s*$/.test( value );

/**
 * Resolves the SelectControl's own value: one of the preset values, or the
 * sentinel "custom" value when the stored ratio doesn't match any preset
 * (so the UI can reveal the custom text input pre-filled with it).
 *
 * @param {string} value Raw stored aspect-ratio value.
 * @return {string} A preset value, or ASPECT_RATIO_CUSTOM_VALUE.
 */
export const getAspectRatioSelectValue = ( value ) => {
	if ( ASPECT_RATIO_PRESETS.some( ( preset ) => preset.value === value ) ) {
		return value;
	}
	return ASPECT_RATIO_CUSTOM_VALUE;
};

export const getAspectRatioSelectOptions = () => [
	...ASPECT_RATIO_PRESETS,
	{
		value: ASPECT_RATIO_CUSTOM_VALUE,
		label: __( 'Custom…', 'video-embed-thumbnail-generator' ),
	},
];

// The custom picker asks for width/height as two plain numbers (matching
// how the presets are labeled, e.g. "16:9") rather than one text field
// where the user has to type the "16/9" CSS syntax themselves -- the stored
// value is still a single "W/H" string either way (that's what `aspect-ratio`
// as a CSS value needs), these two helpers just convert at the UI boundary.
export const DEFAULT_CUSTOM_RATIO = { width: 16, height: 9 };

/**
 * Splits a stored "W/H" ratio string into its two numbers for the width/
 * height inputs. Falls back to DEFAULT_CUSTOM_RATIO for anything that isn't
 * a valid custom ratio (including "auto" and the fixed presets, though a
 * preset would still parse fine numerically -- callers only use this once
 * "Custom…" is already selected).
 *
 * @param {string} value Raw stored aspect-ratio value.
 * @return {{width: number, height: number}} The two ratio numbers.
 */
export const parseRatioValue = ( value ) => {
	if ( ! isCustomRatioValue( value ) ) {
		return { ...DEFAULT_CUSTOM_RATIO };
	}
	const [ width, height ] = value
		.split( '/' )
		.map( ( n ) => parseFloat( n.trim() ) );
	return { width, height };
};

/**
 * Combines width/height numbers back into the "W/H" string format the
 * attribute/option is stored as.
 *
 * @param {number|string} width  Ratio width.
 * @param {number|string} height Ratio height.
 * @return {string} A "W/H" ratio string.
 */
export const formatRatioValue = ( width, height ) => `${ width }/${ height }`;
