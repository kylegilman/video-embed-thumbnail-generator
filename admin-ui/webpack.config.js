const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

// Exclude the default entry from the config, we'll define our own.
const { entry, ...config } = defaultConfig;

module.exports = {
	...config,
	entry: {
		index: path.resolve(
			process.cwd(),
			'src',
			'index.js'
		),
		settings: path.resolve(
			process.cwd(),
			'src',
			'settings',
			'settings.js'
		),
		'attachment-details': path.resolve(
			process.cwd(),
			'src',
			'attachment-details',
			'attachment-details.js'
		),
		'encode-queue': path.resolve(
			process.cwd(),
			'src',
			'encode-queue.js'
		),
	},
	optimization: {
		...config.optimization,
		minimize: false,
	},
};
