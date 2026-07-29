<?php
/**
 * WordPress Tests Configuration File for wp-phpunit.
 *
 * Points at the wp-env Docker environment (see .wp-env.json), not any
 * particular developer's local WordPress install — so `npm run test:php`
 * works the same way on any machine with Docker, the same way the E2E
 * suite in tests/e2e/ does, with no separately-running site required.
 *
 * Only valid when run *inside* the wp-env `cli` container (see the
 * `test:php` script in package.json) — ABSPATH/DB_HOST are container-
 * internal paths/hostnames that don't exist on the host machine.
 */

define( 'ABSPATH', '/var/www/html/' );

// A dedicated database on wp-env's mysql instance, separate from the
// 'wordpress' database the dev site (and the E2E suite) uses — WP_UnitTestCase
// reinstalls WordPress from scratch into whatever database it's pointed at,
// which would otherwise wipe out the E2E fixture content.
define( 'DB_NAME', 'phpunit_test' );
define( 'DB_USER', 'root' );
define( 'DB_PASSWORD', 'password' );
define( 'DB_HOST', 'mysql' );

$table_prefix = 'wp_';

define( 'WP_TESTS_DOMAIN', 'localhost' );
define( 'WP_TESTS_EMAIL', 'admin@example.org' );
define( 'WP_TESTS_TITLE', 'Test Blog' );

define( 'WP_PHP_BINARY', 'php' );
define( 'WPLANG', '' );
