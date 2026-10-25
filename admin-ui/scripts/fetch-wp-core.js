/**
 * Copies WordPress core's own JavaScript runtime (wp-includes/js/dist and the
 * script dependency map) out of the wp-env site into admin-ui/.wp-core, so the
 * Jest component tests render against the same React and @wordpress/* controls
 * a real WordPress page loads, not whatever copy happens to be in node_modules.
 *
 * The production build marks every @wordpress/* import (and React) as an
 * external that resolves to WordPress's copy at runtime; tests that load a
 * different copy can pass or fail for reasons that have nothing to do with
 * production. Uses the same WordPress version the E2E suite runs against.
 *
 * Usage: node scripts/fetch-wp-core.js [--if-missing]
 * Needs Docker running and `npm run env:start` from the repo root.
 */
const { execFileSync } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );

const ADMIN_UI = path.resolve( __dirname, '..' );
const REPO_ROOT = path.resolve( ADMIN_UI, '..' );
const CORE_DIR = path.join( ADMIN_UI, '.wp-core' );
const PLUGIN_SLUG = path.basename( REPO_ROOT );
const CONTAINER_CORE_DIR = `/var/www/html/wp-content/plugins/${ PLUGIN_SLUG }/admin-ui/.wp-core`;

if (
	process.argv.includes( '--if-missing' ) &&
	fs.existsSync( path.join( CORE_DIR, 'shims' ) )
) {
	process.exit( 0 );
}

const copyCommands = [
	`rm -rf ${ CONTAINER_CORE_DIR }`,
	`mkdir -p ${ CONTAINER_CORE_DIR }/assets`,
	`cp -r /var/www/html/wp-includes/js/dist ${ CONTAINER_CORE_DIR }/dist`,
	`cp /var/www/html/wp-includes/assets/script-loader-packages.php ${ CONTAINER_CORE_DIR }/assets/`,
	`cp /var/www/html/wp-includes/version.php ${ CONTAINER_CORE_DIR }/`,
].join( ' && ' );

try {
	execFileSync(
		'npx',
		[ 'wp-env', 'run', 'cli', 'sh', '-c', `"${ copyCommands }"` ],
		{ cwd: REPO_ROOT, stdio: 'inherit', shell: true }
	);
} catch {
	console.error(
		'\nCould not copy WordPress core from wp-env. Start Docker and run `npm run env:start` from the repo root, then retry.'
	);
	process.exit( 1 );
}

// One tiny module per runtime package, so Jest can map each import to it.
const runtime = require( '../test-support/wp-runtime' );
const shimDir = path.join( CORE_DIR, 'shims' );
fs.rmSync( shimDir, { recursive: true, force: true } );
fs.mkdirSync( shimDir, { recursive: true } );

const write = ( name, body ) =>
	fs.writeFileSync( path.join( shimDir, `${ name }.js` ), body );

for ( const file of fs.readdirSync( path.join( CORE_DIR, 'dist' ) ) ) {
	if ( file.endsWith( '.js' ) && ! file.endsWith( '.min.js' ) ) {
		const name = file.replace( /\.js$/, '' );
		write(
			name,
			`module.exports = require( '../../test-support/wp-runtime' ).load( '${ name }' );\n`
		);
	}
}
for ( const id of Object.keys( runtime.VENDOR ) ) {
	write(
		id,
		`module.exports = require( '../../test-support/wp-runtime' ).loadVendor( '${ id }' );\n`
	);
}
write(
	'react-dom-test-utils',
	"const React = require( '../../test-support/wp-runtime' ).loadVendor( 'react' );\nmodule.exports = { act: React.act };\n"
);

const version = fs
	.readFileSync( path.join( CORE_DIR, 'version.php' ), 'utf8' )
	.match( /\$wp_version = '([^']+)'/ );
console.log(
	`WordPress ${
		version ? version[ 1 ] : '?'
	} runtime copied to admin-ui/.wp-core`
);
