const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
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
};
