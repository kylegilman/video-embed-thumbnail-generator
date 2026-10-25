/**
 * Loads WordPress core's own script runtime into the Jest (jsdom) window, the
 * way a WordPress admin page does: React and the vendor scripts first, then
 * each wp-* package after the packages it depends on, each assigning itself to
 * window.wp. Packages are loaded lazily, the first time a test imports one, so
 * tests that need none pay nothing.
 *
 * The files come from admin-ui/.wp-core (see scripts/fetch-wp-core.js).
 */
const fs = require( 'fs' );
const path = require( 'path' );

const CORE_DIR = path.resolve( __dirname, '..', '.wp-core' );

// Script handle (as WordPress names it) -> [ file under dist/vendor, global ].
const VENDOR = {
	react: [ 'react.js', 'React' ],
	'react-dom': [ 'react-dom.js', 'ReactDOM' ],
	'react-jsx-runtime': [ 'react-jsx-runtime.js', 'ReactJSXRuntime' ],
	moment: [ 'moment.js', 'moment' ],
	lodash: [ 'lodash.js', 'lodash' ],
};

let dependencyMap;
function dependencies( packageName ) {
	if ( ! dependencyMap ) {
		const php = fs.readFileSync(
			path.join( CORE_DIR, 'assets', 'script-loader-packages.php' ),
			'utf8'
		);
		dependencyMap = {};
		const entry =
			/'([a-z0-9-]+)\.js' => array\(\s*'dependencies' => array\(([^)]*)\)/g;
		let match;
		while ( ( match = entry.exec( php ) ) ) {
			dependencyMap[ match[ 1 ] ] = [
				...match[ 2 ].matchAll( /'([^']+)'/g ),
			].map( ( m ) => m[ 1 ] );
		}
	}
	return dependencyMap[ packageName ] || [];
}

function run( file ) {
	// Load it the way a browser does, as a classic <script>. WordPress's files
	// start with "use strict"; var wp;, which only becomes the global `wp` when
	// run as a script, not through eval.
	const script = document.createElement( 'script' );
	script.textContent = fs.readFileSync( file, 'utf8' );
	document.head.appendChild( script );
	script.remove();
}

const loaded = new Set();

function loadHandle( handle ) {
	if ( loaded.has( handle ) ) {
		return;
	}
	loaded.add( handle );

	if ( VENDOR[ handle ] ) {
		// react-dom and friends expect React to exist first.
		if (
			handle !== 'react' &&
			handle !== 'moment' &&
			handle !== 'lodash'
		) {
			loadHandle( 'react' );
		}
		run( path.join( CORE_DIR, 'dist', 'vendor', VENDOR[ handle ][ 0 ] ) );
	} else if ( handle.startsWith( 'wp-' ) ) {
		const name = handle.slice( 3 );
		dependencies( name ).forEach( loadHandle );
		run( path.join( CORE_DIR, 'dist', `${ name }.js` ) );
	}
	// Anything else (polyfills, regenerator-runtime) is built into Node.
}

function camelCase( name ) {
	return name.replace( /-([a-z0-9])/g, ( _, c ) => c.toUpperCase() );
}

/**
 * Returns WordPress's copy of a @wordpress/* package, e.g. load( 'components' ).
 *
 * @param {string} name Package name without the @wordpress/ prefix.
 * @return {*} The package's exports (window.wp[ camelCasedName ]).
 */
function load( name ) {
	loadHandle( `wp-${ name }` );
	return window.wp[ camelCase( name ) ];
}

/**
 * Returns a vendor script's global, e.g. loadVendor( 'react' ) is window.React.
 *
 * @param {string} id Key of VENDOR.
 * @return {*} The vendor library.
 */
function loadVendor( id ) {
	loadHandle( id );
	return window[ VENDOR[ id ][ 1 ] ];
}

module.exports = { load, loadVendor, VENDOR };
