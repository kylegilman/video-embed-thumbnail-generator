const { test, expect } = require('@playwright/test');
const { setEmbedMethod } = require('./helpers');

test.describe('Video.js classic player', () => {
	test.beforeAll(() => {
		setEmbedMethod('Video.js');
	});

	test('plays and increments the view count', async ({ page }) => {
		await page.goto('/videopack-e2e-single/');

		const viewCount = page.locator('.videopack-view-count').first();
		const initialCount = parseInt((await viewCount.textContent())?.replace(/\D/g, '') || '0', 10);

		const player = page.locator('.videopack-player').first();
		await expect(player.locator('video')).toBeVisible();
		await player.locator('.vjs-big-play-button').click();

		// count-play fires via admin-ajax on the 'play' event; the client
		// also applies an optimistic increment immediately, then the real
		// server value overwrites it — either way this should settle above
		// the pre-play count within a few seconds.
		await expect(async () => {
			const count = parseInt((await viewCount.textContent())?.replace(/\D/g, '') || '0', 10);
			expect(count).toBeGreaterThan(initialCount);
		}).toPass({ timeout: 5000 });
	});

	test('share dropdown opens and a download link is present', async ({ page }) => {
		await page.goto('/videopack-e2e-single/');

		await page.locator('.videopack-share-toggle').first().click();
		await expect(page.locator('.videopack-share-container.is-visible').first()).toBeVisible();

		// A single-format video renders a direct download link rather than a
		// dropdown trigger (only videos with multiple downloadable formats
		// get the .videopack-download-trigger dropdown).
		await expect(page.locator('.videopack-download-link').first()).toBeVisible();
	});
});
