const fs = require( 'fs' );
const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/jest-unit.config.js' );
const {
	defaultRequestToExternal,
} = require( '@wordpress/dependency-extraction-webpack-plugin/lib/util' );

const shimDir = path.join( __dirname, '.wp-core', 'shims' );
if ( ! fs.existsSync( shimDir ) ) {
	throw new Error(
		"WordPress's JavaScript runtime has not been fetched. Start the wp-env site (`npm run env:start` from the repo root) and run `npm run fetch:wp-core` in admin-ui."
	);
}

// The production build resolves React and every @wordpress/* import except the
// few it bundles to WordPress's own copy (window.wp.*), so the tests must too.
// Mapping imports with the build's own rule, to shims over the real WordPress
// scripts, keeps tests from rendering controls WordPress never loads.
const escapeRegExp = ( request ) =>
	request.replace( /[.*+?^${}()|[\]\\/]/g, '\\$&' );
const shim = ( name ) => path.join( shimDir, `${ name }.js` );
const moduleNameMapper = {};

for ( const file of fs.readdirSync( shimDir ) ) {
	const name = file.replace( /\.js$/, '' );
	const request = `@wordpress/${ name }`;
	if ( defaultRequestToExternal( request ) ) {
		moduleNameMapper[ `^${ escapeRegExp( request ) }$` ] = shim( name );
	}
}
Object.assign( moduleNameMapper, {
	'^react$': shim( 'react' ),
	'^react-dom$': shim( 'react-dom' ),
	'^react-dom/client$': shim( 'react-dom' ),
	'^react-dom/test-utils$': shim( 'react-dom-test-utils' ),
	'^react/jsx-runtime$': shim( 'react-jsx-runtime' ),
	'^react/jsx-dev-runtime$': shim( 'react-jsx-runtime' ),
	'^moment$': shim( 'moment' ),
	'^lodash$': shim( 'lodash' ),
} );

module.exports = {
	...defaultConfig,
	moduleNameMapper: {
		...( defaultConfig.moduleNameMapper || {} ),
		...moduleNameMapper,
	},
	// The few packages the build bundles instead (such as @wordpress/icons) and
	// uuid ship ES modules only, some as .mjs, so Jest runs them through Babel.
	transform: {
		'\\.[cm]?[jt]sx?$': path.join(
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
