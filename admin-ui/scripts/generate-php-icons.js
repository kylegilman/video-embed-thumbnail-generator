const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve(__dirname, '../../src/icons.json');
const outputPath = path.resolve(__dirname, '../../src/Frontend/Icons.php');

const icons = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let phpContent = `<?php
/**
 * Icons helper class.
 *
 * @package Videopack
 */

namespace Videopack\\Frontend;

/**
 * Class Icons
 *
 * Automatically generated from src/icons.json. Do not edit directly.
 *
 * @since      5.0.0
 * @package    Videopack
 * @subpackage Videopack/Frontend
 */
class Icons {

	/**
	 * Map of icon keys to their raw SVG markup strings.
	 *
	 * @var array
	 */
	private static $icons = array(
`;

const maxKeyLength = Math.max(...Object.keys(icons).map(k => k.length));
for (const [key, icon] of Object.entries(icons)) {
	let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}" class="videopack-icon-svg" aria-hidden="true" focusable="false">`;
	for (const pathObj of icon.paths) {
		svg += `<path`;
		for (const [attr, val] of Object.entries(pathObj)) {
			svg += ` ${attr}="${val}"`;
		}
		svg += ` />`;
	}
	svg += `</svg>`;
	
	// Escape single quotes for PHP
	const escapedSvg = svg.replace(/'/g, "\\'");
	const padding = ' '.repeat(maxKeyLength - key.length);
	phpContent += `\t\t'${key}'${padding} => '${escapedSvg}',\n`;
}

phpContent += `\t);

	/**
	 * Retrieve the raw SVG icon markup by its type name.
	 *
	 * @param string $type          The name identifier of the icon (e.g. 'download').
	 * @param string $extra_classes Optional. Additional CSS classes to inject into the SVG tag.
	 * @return string The SVG markup or empty string if not found.
	 */
	public static function get( $type, $extra_classes = '' ) {
		if ( ! isset( self::$icons[ $type ] ) ) {
			return '';
		}
		$svg = self::$icons[ $type ];
		if ( $extra_classes ) {
			$svg = str_replace( 'class="videopack-icon-svg', 'class="videopack-icon-svg ' . esc_attr( $extra_classes ), $svg );
		}
		return $svg;
	}
}
`;

fs.writeFileSync(outputPath, phpContent, 'utf8');
console.log('Icons.php generated successfully.');
