import { useMemo } from '@wordpress/element';

/**
 * Helper to parse hex/rgb colors into 0-1 range for SVG filters.
 */
export const parseColor = (color) => {
	if (!color) return { r: 0, g: 0, b: 0, a: 1 };
	
	if (color.startsWith('#')) {
		const hex = color.slice(1);
		let r = 0, g = 0, b = 0, a = 255;
		if (hex.length === 3) {
			r = parseInt(hex[0] + hex[0], 16);
			g = parseInt(hex[1] + hex[1], 16);
			b = parseInt(hex[2] + hex[2], 16);
		} else if (hex.length === 6) {
			r = parseInt(hex.slice(0, 2), 16);
			g = parseInt(hex.slice(2, 4), 16);
			b = parseInt(hex.slice(4, 6), 16);
		}
		return { r: r / 255, g: g / 255, b: b / 255, a: a / 255 };
	}
	
	const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
	if (rgbMatch) {
		return {
			r: parseInt(rgbMatch[1], 10) / 255,
			g: parseInt(rgbMatch[2], 10) / 255,
			b: parseInt(rgbMatch[3], 10) / 255,
			a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
		};
	}
	return { r: 0, g: 0, b: 0, a: 1 };
};

/**
 * Shared component to render a custom SVG duotone filter.
 *
 * @param {Object} props        Component props
 * @param {Array}  props.colors Array of two hex/rgb colors
 * @param {string} props.id     Filter ID to use in url(#id)
 * @return {Element|null} SVG filter element
 */
const CustomDuotoneFilter = ({ colors, id }) => {
	const filterData = useMemo(() => {
		if (!colors || colors.length < 2) return null;
		
		const c1 = parseColor(colors[0]);
		const c2 = parseColor(colors[1]);
		
		return {
			rValues: `${c1.r} ${c2.r}`,
			gValues: `${c1.g} ${c2.g}`,
			bValues: `${c1.b} ${c2.b}`,
			aValues: `${c1.a} ${c2.a}`,
		};
	}, [colors]);

	if (!filterData) return null;

	return (
		<svg
			style={{ position: 'absolute', width: 0, height: 0, visibility: 'hidden' }}
			aria-hidden="true"
		>
			<filter id={id}>
				<feColorMatrix
					type="matrix"
					values=".299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0"
				/>
				<feComponentTransfer colorInterpolationFilters="sRGB">
					<feFuncR type="table" tableValues={filterData.rValues} />
					<feFuncG type="table" tableValues={filterData.gValues} />
					<feFuncB type="table" tableValues={filterData.bValues} />
					<feFuncA type="table" tableValues={filterData.aValues} />
				</feComponentTransfer>
			</filter>
		</svg>
	);
};

export default CustomDuotoneFilter;
