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

		'videopack-core': path.resolve(
			process.cwd(),
			'src/videopack-core.scss'
		),

		// Settings page bundle — the only one of these three that needs the
		// full block-preview machinery (PlayerSettings/VideoCollectionSettings
		// live previews). Split from settings-network/encode-queue below since
		// neither of those renders any block previews or a live player, but
		// previously shared this same bundle regardless.
		settings: path.resolve(
			process.cwd(),
			'src/features/settings/settings.js'
		),
		'settings-network': path.resolve(
			process.cwd(),
			'src/features/settings-network/settings-network.js'
		),
		// Used by both the site and network Encode Queue pages. Pulls in
		// @wordpress/dataviews (and its own dependency tree — @base-ui/react,
		// @ariakit/*, @floating-ui/*), by far the largest single dependency in
		// any of these bundles — keeping it out of settings.js means the
		// Settings page no longer pays for a data table it never renders.
		'encode-queue': path.resolve(
			process.cwd(),
			'src/features/encode-queue/encode-queue.js'
		),
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
		// Named chunk IDs so dynamically-imported chunks (e.g. loop/edit.js's
		// `import(/* webpackChunkName: "loop-sortable-grid" */ ...)`) get a
		// readable filename instead of a numeric one.
		chunkIds: 'named',
		splitChunks: {
			...defaultConfig.optimization.splitChunks,
			cacheGroups: {
				...defaultConfig.optimization.splitChunks.cacheGroups,
				// Disable webpack's built-in automatic vendor-splitting
				// (defaultVendors) for JS — none of our node_modules
				// dependencies are shared across multiple lazy-loaded chunks,
				// so splitting them out separately only produces an extra,
				// auto-numbered chunk file (e.g. dnd-kit landing in its own
				// "9.js" alongside the intentionally-named
				// "loop-sortable-grid.js") instead of being inlined into the
				// one named chunk that actually needs it.
				defaultVendors: false,
			},
		},
	},
};
