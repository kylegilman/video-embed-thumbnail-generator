const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
	testDir: './tests/e2e',
	testMatch: '**/*.spec.js',
	// Specs mutate shared site-wide state (the embed_method option), so runs
	// must be strictly serial — parallel workers could flip that option out
	// from under a different spec's in-flight assertions.
	fullyParallel: false,
	workers: 1,
	retries: 0,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		// wp-env honors WP_ENV_PORT; match it so a machine where 8888 is
		// unavailable (e.g. a Windows reserved port range) can still run the suite.
		baseURL: `http://localhost:${process.env.WP_ENV_PORT || 8888}`,
		trace: 'retain-on-failure',
		video: 'retain-on-failure',
	},
});
