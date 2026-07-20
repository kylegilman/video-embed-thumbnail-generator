const fs = require('fs');
const path = require('path');

/**
 * Cross-checks the two halves of the videopack/* block context system:
 *
 *  - The JS "provide" side: hooks/useVideopackContext.js's DEFAULT_CONTEXT_KEYS
 *    list, which every block feeds into VideopackContextBridge as
 *    videopack/<key> context values.
 *  - The PHP "consume" side: src/Admin/Ui.php's register_videopack_block_context()
 *    method, which is the sole authority for which videopack/<key> context keys
 *    Gutenberg actually delivers to a block's `context` prop (per
 *    admin-ui/docs/context-system.md). A key missing here is silently dropped —
 *    no error, no warning — so a block ends up re-fetching data a parent already
 *    resolved (this is exactly how the duration/views context bug happened).
 *
 * This only checks that every JS-side key has *some* PHP-side registration.
 * It intentionally does not check the reverse: Ui.php legitimately registers
 * several keys (videopack/attachmentId, videopack/refreshVideos, etc.) that
 * are wired up by hand in individual blocks' bridgeOverrides rather than via
 * the generic DEFAULT_CONTEXT_KEYS list, so "PHP has extra keys" is expected
 * and not a bug.
 *
 * Keys added at runtime via the `videopack.contextKeys` JS filter (e.g. by
 * add-on plugins) aren't visible to this static check.
 */

const jsHookPath = path.resolve(
	__dirname,
	'../src/hooks/useVideopackContext.js'
);
const phpRegistryPath = path.resolve(__dirname, '../../src/Admin/Ui.php');

function extractJsContextKeys(source) {
	const match = source.match(
		/const DEFAULT_CONTEXT_KEYS = \[([\s\S]*?)\n\];/
	);
	if (!match) {
		throw new Error(
			'Could not find DEFAULT_CONTEXT_KEYS array in useVideopackContext.js — has it been renamed or restructured?'
		);
	}
	const keys = [...match[1].matchAll(/'([a-zA-Z0-9_]+)'/g)].map(
		(m) => m[1]
	);
	if (keys.length === 0) {
		throw new Error('Parsed DEFAULT_CONTEXT_KEYS but found zero keys.');
	}
	return keys;
}

function extractPhpRegisteredContextKeys(source) {
	const fnStart = source.indexOf(
		'function register_videopack_block_context'
	);
	if (fnStart === -1) {
		throw new Error(
			'Could not find register_videopack_block_context() in Ui.php — has it been renamed or moved?'
		);
	}

	// Extract the function body by tracking brace depth from its opening `{`.
	const bodyStart = source.indexOf('{', fnStart);
	let depth = 0;
	let bodyEnd = -1;
	for (let i = bodyStart; i < source.length; i++) {
		if (source[i] === '{') {
			depth++;
		} else if (source[i] === '}') {
			depth--;
			if (depth === 0) {
				bodyEnd = i;
				break;
			}
		}
	}
	if (bodyEnd === -1) {
		throw new Error(
			'Could not find the closing brace of register_videopack_block_context() — mismatched braces?'
		);
	}
	const body = source.slice(bodyStart, bodyEnd);

	// videopack/<key> appears as either a $provides_context map key
	// ('videopack/x' => 'x') or a plain entry in the $uses_context array —
	// both are valid registration, so a single scan across the whole
	// function body covers both without needing to bound each array.
	const keys = new Set(
		[...body.matchAll(/'videopack\/([a-zA-Z0-9_]+)'/g)].map((m) => m[1])
	);
	if (keys.size === 0) {
		throw new Error(
			'Parsed register_videopack_block_context() but found zero registered context keys.'
		);
	}
	return keys;
}

const jsKeys = extractJsContextKeys(
	fs.readFileSync(jsHookPath, 'utf8')
);
const phpKeys = extractPhpRegisteredContextKeys(
	fs.readFileSync(phpRegistryPath, 'utf8')
);

const missing = jsKeys.filter((key) => !phpKeys.has(key));

if (missing.length > 0) {
	console.error(
		'\nContext key check failed: the following keys are in ' +
			'DEFAULT_CONTEXT_KEYS (admin-ui/src/hooks/useVideopackContext.js) ' +
			'but are not registered anywhere in ' +
			'register_videopack_block_context() (src/Admin/Ui.php).\n'
	);
	console.error(
		'Gutenberg silently drops unregistered context keys — blocks that ' +
			"rely on them will fall back to their own (slower) data-fetching\n" +
			'path instead of receiving the value from a parent block.\n'
	);
	missing.forEach((key) => console.error(`  - videopack/${key}`));
	console.error(
		"\nAdd each missing key to the \\$uses_context array in Ui.php's " +
			'register_videopack_block_context() to fix.\n'
	);
	process.exit(1);
}

console.log(
	`Context key check passed (${jsKeys.length} JS keys, all registered in Ui.php).`
);
