const { test, expect } = require('@playwright/test');
const { prepareQualityFixture, loginAsAdmin } = require('./helpers');

const SETTINGS_URL = '/wp-admin/options-general.php?page=video_embed_thumbnail_generator_settings';

/**
 * Expands an accordion section if it is collapsed. Whether a panel starts open
 * depends on saved UI state, so clicking blindly could collapse it instead.
 *
 * @param {import('@playwright/test').Locator} header The section's header button.
 */
async function expand(header) {
	await header.waitFor();
	if ((await header.getAttribute('aria-expanded')) !== 'true') {
		await header.click();
	}
}

/**
 * Opens the H.264 section of Settings > Videopack > Encoding > Video quality
 * and switches it to ABR, so the quality slider and bitrate preview show.
 */
async function openH264Abr(page) {
	await loginAsAdmin(page);
	await page.goto(SETTINGS_URL);

	// The Freemius opt-in screen takes over the page the first time an admin
	// visits; declining is the privacy-preserving choice.
	const skip = page.getByRole('link', { name: 'Skip', exact: true });
	if (await skip.isVisible().catch(() => false)) {
		await skip.click();
	}

	await page.getByRole('tab', { name: 'Encoding' }).click();
	await expand(page.getByRole('button', { name: 'Video quality' }));
	await expand(page.getByRole('button', { name: /^H\.264/ }));
	await page.getByLabel('Average Bitrate (ABR)').check();
}

test.describe('Settings: ABR quality slider and bitrate preview', () => {
	test.beforeAll(() => {
		prepareQualityFixture();
	});

	test('shows the default bitrate for each resolution, from the server formula', async ({ page }) => {
		await openH264Abr(page);

		const preview = page.locator('.videopack-bitrate-grid');
		// H.264 at the default quality: 0.004404 * pixels^0.92.
		await expect(preview).toContainText('1080p = 2853 kbps');
		await expect(preview).toContainText('720p = 1353 kbps');
		await expect(preview).toContainText('360p = 378 kbps');
		await expect(preview).toContainText('240p = 179 kbps');
		await expect(page.locator('.videopack-bitrate-note')).toHaveText(
			'For video at 48 fps or faster, bitrates are multiplied by 1.5.'
		);
	});

	test('offers a quality scale around 1 and updates the preview as it moves', async ({ page }) => {
		await openH264Abr(page);

		const slider = page.locator('.videopack-abr-slider input[type="range"]');
		await expect(slider).toHaveAttribute('min', '0.25');
		await expect(slider).toHaveAttribute('max', '3');
		await expect(slider).toHaveAttribute('step', '0.05');
		await expect(slider).toHaveValue('1');

		await page.locator('.videopack-abr-slider input[type="number"]').fill('2');
		await page.locator('.videopack-abr-slider input[type="number"]').blur();

		// Quality scales the bitrate linearly: 1352.8 * 2 at 720p.
		await expect(page.locator('.videopack-bitrate-grid')).toContainText('720p = 2706 kbps');
	});
});
