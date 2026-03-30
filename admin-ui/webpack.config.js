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
		videopack: path.resolve(process.cwd(), 'src', 'videopack-admin.js'),
	},
	optimization: {
		...config.optimization,
		minimize: false,
		splitChunks: {
			cacheGroups: {
				videoplayer: {
					name: 'videopack-videoplayer',
					test: /[\\/]src[\\/]components[\\/]VideoPlayer[\\/]/,
					chunks: 'all',
					enforce: true,
				},
				videogallery: {
					name: 'videopack-videogallery',
					test: /[\\/]src[\\/]components[\\/]VideoGallery[\\/]/,
					chunks: 'all',
					enforce: true,
				},
				videolist: {
					name: 'videopack-videolist',
					test: /[\\/]src[\\/]components[\\/]VideoList[\\/]/,
					chunks: 'all',
					enforce: true,
				},
				dndkit: {
					name: 'videopack-dndkit',
					test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/,
					chunks: 'all',
					enforce: true,
					priority: 10,
				},
				shared: {
					name: 'videopack-shared',
					chunks: 'all',
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true,
					enforce: true,
				},
			},
		},
	},
};
