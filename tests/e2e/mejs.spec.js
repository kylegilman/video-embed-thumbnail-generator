const { test, expect } = require('@playwright/test');
const { setEmbedMethod } = require('./helpers');

test.describe('WordPress Default (MediaElement.js) player', () => {
	test.beforeAll(() => {
		setEmbedMethod('WordPress Default');
	});

	test('plays and increments the view count', async ({ page }) => {
		// The overlay-button wait below (45s) can exceed Playwright's default
		// 30s per-test timeout on its own, independent of that assertion's own
		// timeout — both need raising together.
		test.setTimeout(75000);

		await page.goto('/videopack-e2e-single/');

		const viewCount = page.locator('.videopack-view-count').first();
		const initialCount = parseInt((await viewCount.textContent())?.replace(/\D/g, '') || '0', 10);

		const player = page.locator('.videopack-player').first();
		await expect(player.locator('video')).toBeVisible();

		// MediaElement.js wraps the native <video> and builds its own overlay
		// button client-side after initializing — on a cold first load this
		// can take noticeably longer than the default 30s test timeout, so
		// wait for it explicitly (generously) before the actionability check
		// that .click() itself would otherwise perform under the tighter
		// default budget.
		const overlayButton = player.locator('.mejs-overlay-button');
		await expect(overlayButton).toBeVisible({ timeout: 45000 });
		await overlayButton.click();

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
