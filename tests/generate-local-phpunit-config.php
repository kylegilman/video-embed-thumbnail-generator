<?php
/**
 * Generates a `<file>`-based PHPUnit config from a `<directory>`-based one.
 *
 * @package Videopack
 *
 * Works around a known, currently-unfixed PHP core bug
 * (https://bugs.php.net/bug.php?id=80056): RecursiveDirectoryIterator --
 * which PHPUnit's own <directory> test discovery relies on -- silently
 * loses directory entries on 9p filesystems, which is how Docker
 * Desktop's WSL2 backend shares a Windows host directory into the
 * container. Plain glob(), used here, is unaffected.
 *
 * Only needed on that specific host setup -- CI and any native Linux/
 * macOS dev environment can keep using phpunit.xml/phpunit-multisite.xml
 * directly, since <directory> discovery works fine there. The generated
 * file is gitignored and regenerated fresh on every `npm run
 * test:php:local`/`test:php:multisite:local` invocation, so it can never
 * go stale as tests are added or removed.
 *
 * Usage: php generate-local-phpunit-config.php <source-config.xml> <output-config.xml>
 *
 * phpcs:disable WordPress.NamingConventions.ValidVariableName -- native
 * DOMDocument/DOMNode property names (preserveWhiteSpace, nodeValue, etc.)
 * aren't ours to rename.
 * phpcs:disable WordPress.Security.EscapeOutput -- plain CLI tool writing
 * to its own stdout, not web-facing.
 * phpcs:disable WordPress.WP.GlobalVariablesOverride -- $comment here is a
 * local DOMComment node, unrelated to WP's global of the same name.
 */

$source = $argv[1] ?? null;
$output = $argv[2] ?? null;

if ( ! $source || ! $output ) {
	fwrite( STDERR, "Usage: php generate-local-phpunit-config.php <source-config.xml> <output-config.xml>\n" );
	exit( 1 );
}

if ( ! is_file( $source ) ) {
	fwrite( STDERR, "Source config not found: $source\n" );
	exit( 1 );
}

$source_dir = dirname( realpath( $source ) );

$dom = new DOMDocument();
$dom->preserveWhiteSpace = false;
$dom->formatOutput       = true;
$dom->load( $source );

$directory_nodes = $dom->getElementsByTagName( 'directory' );

// Collect nodes to replace first -- can't mutate a live DOMNodeList while
// iterating it.
$to_replace = array();
foreach ( $directory_nodes as $directory_node ) {
	$to_replace[] = $directory_node;
}

$total_files = 0;

foreach ( $to_replace as $directory_node ) {
	$relative_dir = trim( $directory_node->nodeValue );
	$absolute_dir = realpath( $source_dir . '/' . $relative_dir );

	if ( ! $absolute_dir || ! is_dir( $absolute_dir ) ) {
		fwrite( STDERR, "Warning: directory '$relative_dir' not found relative to $source_dir, leaving as-is.\n" );
		continue;
	}

	$files = glob( $absolute_dir . '/*Test.php' );
	sort( $files );
	$total_files += count( $files );

	$parent = $directory_node->parentNode;
	foreach ( $files as $file ) {
		$relative_file = $relative_dir . '/' . basename( $file );
		$file_node     = $dom->createElement( 'file', htmlspecialchars( $relative_file, ENT_XML1 ) );
		$parent->insertBefore( $file_node, $directory_node );
	}
	$parent->removeChild( $directory_node );
}

// Note where this came from, for anyone who opens the generated file directly.
$comment = $dom->createComment(
	"\n    GENERATED FILE, do not edit or commit.\n" .
	'    Produced by tests/generate-local-phpunit-config.php from ' . basename( $source ) . ".\n" .
	'    Regenerated fresh on every `npm run test:php:local` / `test:php:multisite:local` run.' . "\n"
);
$dom->documentElement->parentNode->insertBefore( $comment, $dom->documentElement );

$dom->save( $output );

echo "Wrote $total_files test file(s) into " . basename( $output ) . "\n";
