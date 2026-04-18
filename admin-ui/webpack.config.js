const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const { getWebpackEntryPoints } = require('@wordpress/scripts/utils/config');
const path = require('path');

// Execute `getWebpackEntryPoints` safely. Under `@wordpress/scripts`, `getWebpackEntryPoints`
// returns an object of dynamically discovered entry points from block.json files in `src/`.
const blockEntries =
	typeof getWebpackEntryPoints === 'function' ? getWebpackEntryPoints() : {};

// Get the default entry object if it's a function or an object.
let defaultEntries = {};
if (typeof defaultConfig.entry === 'function') {
	defaultEntries = defaultConfig.entry(); // Wait, getting it synchronously might be an issue. Let's merge standard block discovery.
} else if (typeof defaultConfig.entry === 'object') {
	defaultEntries = defaultConfig.entry;
}

// We will explicitly use the discovered blockEntries.
module.exports = {
	...defaultConfig,
	entry: {
		...defaultEntries,
		...blockEntries,

		'videopack-frontend': path.resolve(
			process.cwd(),
			'src/videopack-frontend.scss'
		),

		// Admin screens bundle
		'admin-screens': [
			path.resolve(process.cwd(), 'src/features/settings/settings.js'),
			path.resolve(
				process.cwd(),
				'src/features/settings-network/settings-network.js'
			),
			path.resolve(
				process.cwd(),
				'src/features/encode-queue/encode-queue.js'
			),
		],
		// Media Library specific bundle
		'media-library': path.resolve(
			process.cwd(),
			'src/features/attachment-details/attachment-details.js'
		),
		// Classic Editor bundle
		'classic-editor': [
			path.resolve(
				process.cwd(),
				'src/features/classic-embed/classic-embed.js'
			),
			path.resolve(process.cwd(), 'src/features/tinymce/tinymce.js'),
		],
		// Main legacy admin script
		videopack: path.resolve(process.cwd(), 'src/videopack-admin.js'),
	},
	optimization: {
		...defaultConfig.optimization,
		minimize: false, // Ensure this isn't lost if needed
	},
};
