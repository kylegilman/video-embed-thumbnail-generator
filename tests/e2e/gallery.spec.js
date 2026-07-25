const { test, expect } = require('@playwright/test');
const { setEmbedMethod } = require('./helpers');

test.describe('Gallery: lightbox and pagination', () => {
	test.beforeAll(() => {
		// Player type is incidental to these tests; pin one for determinism.
		setEmbedMethod('Video.js');
	});

	test('opens the lightbox, navigates to the next video, and closes', async ({ page }) => {
		await page.goto('/videopack-e2e-gallery/');

		const firstThumb = page.locator('.videopack-gallery-item').first();
		await expect(firstThumb).toBeVisible();
		await firstThumb.click();

		const modal = page.locator('#videopack-global-modal');
		await expect(modal).toHaveClass(/is-visible/);
		await expect(modal.locator('video')).toBeVisible();

		await modal.locator('.modal-next').click();
		// The player is torn down and rebuilt on navigation (see
		// destroyCurrentGalleryPlayer in gallery.js) — just confirm the
		// modal is still open with a live video afterward, not stuck/broken.
		await expect(modal.locator('video')).toBeVisible();

		await modal.locator('.modal-close').click();
		await expect(modal).not.toHaveClass(/is-visible/);
	});

	test('paginates to page 2 via AJAX', async ({ page }) => {
		await page.goto('/videopack-e2e-gallery/');

		const firstItemBefore = page.locator('.videopack-gallery-item').first();
		await expect(firstItemBefore).toBeVisible();
		const attachmentIdBefore = await firstItemBefore.getAttribute('data-attachment-id');

		await page.locator('.videopack-pagination-button[data-page="2"]').first().click();

		// loadCollectionPage() swaps the grid's innerHTML once the AJAX
		// response lands — wait for the first item to actually change
		// rather than a fixed timeout. Confirmed manually that the request/
		// swap is correct; wp-env's local stack is just slower than 5s under
		// load, so this budget is generous rather than tight.
		await expect(async () => {
			const attachmentIdAfter = await page.locator('.videopack-gallery-item').first().getAttribute('data-attachment-id');
			expect(attachmentIdAfter).not.toBe(attachmentIdBefore);
		}).toPass({ timeout: 15000 });
	});
});
