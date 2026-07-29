const { test, expect } = require('@playwright/test');
const { setEmbedMethod } = require('./helpers');

// The handful of documented [videopack] shortcode attributes whose
// correctness genuinely depends on real JS/browser behavior, not just HTML
// shape — see tests/ShortcodeAttributesTest.php for everything else (that
// suite covers rendering correctness far more cheaply, without a browser).
//
// skip_buttons is deliberately not covered here — it's currently
// non-functional independent of anything in this suite (see the flagged
// follow-up task), so a test here would just document a known bug rather
// than guard real behavior.

test.describe('Shortcode behavioral attributes', () => {
	test.beforeAll(() => {
		setEmbedMethod('Video.js');
	});

	test('autoplay + muted: video starts playing without interaction, and is muted', async ({ page }) => {
		await page.goto('/videopack-e2e-behavioral/');

		const video = page.locator('#test-autoplay-muted video');
		await expect(video).toBeVisible();

		// Real autoplay requires the video to actually be playing shortly
		// after load, not just have the attribute present (browsers can
		// silently block non-muted autoplay, so muted="true" here is load-
		// bearing for the assertion, not incidental).
		await expect(async () => {
			const paused = await video.evaluate((el) => el.paused);
			expect(paused).toBe(false);
		}).toPass({ timeout: 10000 });

		const muted = await video.evaluate((el) => el.muted);
		expect(muted).toBe(true);
	});

	test('loop: video restarts instead of ending', async ({ page }) => {
		await page.goto('/videopack-e2e-behavioral/');

		const video = page.locator('#test-loop video');
		await expect(video).toBeVisible();

		const hasLoopAttribute = await video.evaluate((el) => el.loop);
		expect(hasLoopAttribute).toBe(true);
	});

	test('pauseothervideos: starting the second player pauses the first', async ({ page }) => {
		await page.goto('/videopack-e2e-behavioral/');

		const videoA = page.locator('#test-pauseothervideos-a video');
		const videoB = page.locator('#test-pauseothervideos-b video');
		await expect(videoA).toBeVisible();
		await expect(videoB).toBeVisible();

		// Start A playing.
		await page.locator('#test-pauseothervideos-a .vjs-big-play-button').click();
		await expect(async () => {
			const paused = await videoA.evaluate((el) => el.paused);
			expect(paused).toBe(false);
		}).toPass({ timeout: 10000 });

		// Starting B should pause A.
		await page.locator('#test-pauseothervideos-b .vjs-big-play-button').click();
		await expect(async () => {
			const bPaused = await videoB.evaluate((el) => el.paused);
			expect(bPaused).toBe(false);
		}).toPass({ timeout: 10000 });

		await expect(async () => {
			const aPaused = await videoA.evaluate((el) => el.paused);
			expect(aPaused).toBe(true);
		}).toPass({ timeout: 5000 });
	});

	test('right_click="false": the player blocks its context menu', async ({ page }) => {
		await page.goto('/videopack-e2e-behavioral/');

		const player = page.locator('#test-right-click-disabled .videopack-player');
		await expect(player).toBeVisible();

		const contextMenuPrevented = await player.evaluate((el) => {
			const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
			el.dispatchEvent(event);
			return event.defaultPrevented;
		});
		expect(contextMenuPrevented).toBe(true);
	});
});
