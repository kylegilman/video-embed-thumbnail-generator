const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

// Exclude the default entry from the config, we'll define our own.
const { entry, ...config } = defaultConfig;

module.exports = {
	...config,
	entry: {
		// Blocks bundle
		blocks: [
			path.resolve(process.cwd(), 'src/blocks/videopack-video'),
			path.resolve(process.cwd(), 'src/blocks/videopack-gallery'),
			path.resolve(process.cwd(), 'src/blocks/videopack-list'),
		],
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
		...config.optimization,
		minimize: false,
	},
};
