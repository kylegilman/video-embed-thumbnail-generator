const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/jest-unit.config.js' );

module.exports = {
	...defaultConfig,
	// @wordpress/components and the packages it builds on (and uuid) ship
	// ES modules only, some as .mjs, so Jest has to run them through Babel like
	// the rest of the source in order to render real components in tests.
	transform: {
		'.[cm]?[jt]sx?$': path.join(
			path.dirname(
				require.resolve(
					'@wordpress/scripts/config/jest-unit.config.js'
				)
			),
			'babel-transform'
		),
	},
	transformIgnorePatterns: [ '/node_modules/(?!(@wordpress|uuid)/)' ],
};
