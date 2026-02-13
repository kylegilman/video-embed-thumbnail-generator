const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

// Exclude the default entry from the config, we'll define our own.
const { entry, ...config } = defaultConfig;

module.exports = {
	...config,
	entry: {
		'videopack-video': path.resolve(
			process.cwd(),
			'src',
			'blocks',
			'videopack-video'
		),
		'videopack-collection': path.resolve(
			process.cwd(),
			'src',
			'blocks',
			'videopack-collection'
		),
		settings: path.resolve(
			process.cwd(),
			'src',
			'features',
			'settings',
			'settings.js'
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
	},
	optimization: {
		...config.optimization,
		minimize: false,
	},
	externals: {
		videopack: 'videopack',
	},
};
