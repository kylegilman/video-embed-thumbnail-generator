const fs = require('fs');
const path = require('path');

const jsonPath = path.resolve(__dirname, '../../src/icons.json');
const outputPath = path.resolve(__dirname, '../../src/Frontend/Icons.php');

const icons = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let phpContent = `<?php
namespace Videopack\\Frontend;

/**
 * Automatically generated file. Do not edit directly.
 * Generated from src/icons.json by npm run build.
 */
class Icons {
	private static $icons = array(
`;

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
	phpContent += `\t\t'${key}' => '${escapedSvg}',\n`;
}

phpContent += `\t);

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
