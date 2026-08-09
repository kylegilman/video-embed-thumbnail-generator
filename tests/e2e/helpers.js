const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Matches the folder name this plugin is mounted under inside the wp-env
// container (the basename of the repo root, since .wp-env.json maps "." as
// a plugin) — wp-env's `run` commands execute with the WordPress root as
// their working directory, not this repo, so paths must be spelled out
// relative to wp-content/plugins/<slug>/.
const PLUGIN_PATH = 'wp-content/plugins/video-embed-thumbnail-generator';

const METHOD_FILE = path.join(__dirname, '.embed-method');

/**
 * Switches the site's global embed_method option via WP-CLI, so a spec file
 * can choose which player renders the shared single-video fixture page
 * before running its assertions.
 *
 * The target value is written to a file rather than passed as a CLI
 * argument — `wp-env run` on Windows goes through several nested shell
 * layers (cmd.exe → the npx.cmd shim → wp-env's own docker invocation), and
 * a value containing a space (e.g. "WordPress Default") silently gets
 * split into two separate positional arguments somewhere in that chain,
 * so set-embed-method.php only ever saw "WordPress". File I/O sidesteps
 * shell word-splitting entirely.
 *
 * @param {string} method One of: 'Video.js', 'WordPress Default', 'Video.js v10 Beta'.
 */
function setEmbedMethod(method) {
	fs.writeFileSync(METHOD_FILE, method, 'utf8');
	execFileSync(
		'npx',
		[
			'wp-env', 'run', 'cli',
			'wp', 'eval-file', `${PLUGIN_PATH}/tests/e2e/set-embed-method.php`,
		],
		{ stdio: 'inherit', shell: true }
	);
}

/**
 * Activates or deactivates a plugin via WP-CLI, so a spec file can verify
 * behavior that's supposed to degrade gracefully when an optional sibling
 * add-on isn't installed (e.g. videopack-player-pro without
 * videopack-cloud-streaming). Always restore the plugin's original state
 * (e.g. in `test.afterAll`) — plugin activation is site-wide, shared with
 * every other spec, and specs run serially but not in isolation from
 * each other's state.
 *
 * @param {string} slug   Plugin folder/basename, e.g. 'videopack-cloud-streaming'.
 * @param {boolean} active True to activate, false to deactivate.
 */
function setPluginActive(slug, active) {
	execFileSync(
		'npx',
		[
			'wp-env', 'run', 'cli',
			'wp', 'plugin', active ? 'activate' : 'deactivate', slug,
		],
		{ stdio: 'inherit', shell: true }
	);
}

module.exports = { setEmbedMethod, setPluginActive };
