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
		baseURL: 'http://localhost:8888',
		trace: 'retain-on-failure',
		video: 'retain-on-failure',
	},
});
