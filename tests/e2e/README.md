# Videopack E2E tests

Real-browser tests (Playwright) against a real, disposable WordPress site
(wp-env/Docker) with this plugin and `videopack-player-pro` both active.
Unlike a hand-authored HTML fixture, nothing here freezes what the markup
"should" look like — every run hits whatever the PHP renders right now, so a
template change that breaks real behavior fails the test instead of being
silently missed.

## One-time setup

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   and make sure it's running.
2. From the repo root: `npm install`

## Running

```
npm run env:start     # starts the WP site (first run downloads images; later runs are fast)
npm run e2e:seed       # creates/updates the fixture pages + imports the sample videos (idempotent)
npm run test:e2e       # runs the Playwright suite
```

Leave `wp-env` running between test runs — only re-run `env:start` after a
reboot or `env:stop`. Re-run `e2e:seed` any time; it reuses existing
attachments/pages by title/slug instead of duplicating them.

Other useful commands:

- `npm run test:e2e:headed` — watch the browser while tests run.
- `npm run test:e2e:ui` — Playwright's interactive UI mode.
- `npm run env:stop` / `npm run env:destroy` — stop or fully tear down the WP site.
- Site is reachable directly at `http://localhost:8888` (admin: `admin`/`password`).

## What's covered

- `videojs-classic.spec.js` — Video.js (classic) playback + view counting, share/download dropdowns.
- `mejs.spec.js` — WordPress Default (MediaElement.js), same coverage.
- `gallery.spec.js` — lightbox open/navigate/close, AJAX pagination.

Player type for the single-video fixture page is controlled by the global
`embed_method` option, switched per spec via `helpers.js`'s `setEmbedMethod()`
— not baked into the seeded content — so `test:e2e` must run serially
(already configured in `playwright.config.js`).

A Video.js v10 spec belongs in the `videopack-player-pro` repo instead, since
that player only exists there.

## Extending

Add a new `*.spec.js` file here for any other browser-facing flow (settings
pages, encode queue UI, etc.) — see the main migration plan discussion for
how this generalizes beyond the player.
