const { test, expect } = require('@playwright/test');
const { setEmbedMethod, setPluginActive } = require('./helpers');

// Player_Video_Js_10::get_video_code() (videopack-player-pro) fires
// 'videopack_video_js_10_adaptive_media_element', asking whether to
// substitute an HLS/DASH element for the plain <video> tag -- the only
// listener anywhere in the codebase is videopack-cloud-streaming's
// Videojs_10_Streaming_Subscriber. Every other spec in this suite runs
// with cloud-streaming active, so this fallback path (player-pro sold and
// used standalone, without the streaming add-on) has never actually been
// exercised by a test.
//
// A single test rather than the usual split across this suite's other
// player specs: setPluginActive() is a site-wide side effect, and keeping
// it to one test avoids depending on exactly when a describe block's
// beforeAll/afterAll fire relative to sibling tests.
test.describe('Video.js v10 player without videopack-cloud-streaming active', () => {
	test.beforeAll(() => {
		setPluginActive('videopack-cloud-streaming', false);
		setEmbedMethod('Video.js v10 Beta');
	});

	test.afterAll(() => {
		setPluginActive('videopack-cloud-streaming', true);
	});

	test('renders, plays, increments the view count, and exposes share/download, with no console errors', async ({ page }) => {
		const consoleErrors = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});
		page.on('pageerror', (err) => consoleErrors.push(err.message));

		await page.goto('/videopack-e2e-single/');

		// video-player/video-skin are custom elements defined by player-pro's
		// own script bundle -- confirms it registered them without ever
		// needing cloud-streaming's bridge script to be present.
		const videoPlayer = page.locator('video-player').first();
		await expect(videoPlayer).toBeVisible();
		await expect(videoPlayer.locator('video.videopack-video')).toBeAttached();

		const viewCount = page.locator('.videopack-view-count').first();
		const initialCount = parseInt((await viewCount.textContent())?.replace(/\D/g, '') || '0', 10);

		// <media-play-button> lives inside video-skin's open shadow root;
		// Playwright's locators pierce open shadow roots automatically.
		await page.locator('media-play-button').first().click();

		await expect(async () => {
			const count = parseInt((await viewCount.textContent())?.replace(/\D/g, '') || '0', 10);
			expect(count).toBeGreaterThan(initialCount);
		}).toPass({ timeout: 5000 });

		await page.locator('.videopack-share-toggle').first().click();
		await expect(page.locator('.videopack-share-container.is-visible').first()).toBeVisible();
		await expect(page.locator('.videopack-download-link').first()).toBeVisible();

		expect(consoleErrors).toEqual([]);
	});
});
