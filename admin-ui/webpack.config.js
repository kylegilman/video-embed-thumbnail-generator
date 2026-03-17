const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

// Exclude the default entry from the config, we'll define our own.
const { entry, ...config } = defaultConfig;

module.exports = {
	...config,
	entry: {
		'blocks/videopack-video/videopack-video': path.resolve(
			process.cwd(),
			'src',
			'blocks',
			'videopack-video'
		),
		'blocks/videopack-gallery/videopack-gallery': path.resolve(
			process.cwd(),
			'src',
			'blocks',
			'videopack-gallery'
		),
		'blocks/videopack-list/videopack-list': path.resolve(
			process.cwd(),
			'src',
			'blocks',
			'videopack-list'
		),
		settings: path.resolve(
			process.cwd(),
			'src',
			'features',
			'settings',
			'settings.js'
		),
		'settings-network': path.resolve(
			process.cwd(),
			'src',
			'features',
			'settings-network',
			'settings-network.js'
		),
		'attachment-details': path.resolve(
			process.cwd(),
			'src',
			'features',
			'attachment-details',
			'attachment-details.js'
		),
		'encode-queue': path.resolve(
			process.cwd(),
			'src',
			'features',
			'encode-queue',
			'encode-queue.js'
		),
		'frontend-styles': path.resolve(
			process.cwd(),
			'src',
			'features',
			'frontend-styles',
			'frontend-styles.js'
		),
		'classic-embed': path.resolve(
			process.cwd(),
			'src',
			'features',
			'classic-embed',
			'classic-embed.js'
		),
		tinymce: path.resolve(
			process.cwd(),
			'src',
			'features',
			'tinymce',
			'tinymce.js'
		),
	},
	optimization: {
		...config.optimization,
		minimize: false,
	},
	externals: {
		videopack: 'videopack',
	},
};
