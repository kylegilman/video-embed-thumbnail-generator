# Developer Guide: Running E2E Tests

Videopack's end-to-end suite drives a real browser (via
[Playwright](https://playwright.dev/)) against a real, disposable WordPress
site (via [`wp-env`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/),
Docker) with this plugin and `videopack-player-pro` both active. Nothing here
freezes what the markup "should" look like — every run hits whatever the PHP
renders right now, so a template change that breaks real behavior fails the
test instead of being silently missed.

> [!NOTE]
> Prefer the PHPUnit suite ([tests/README.md](../tests/README.md)) for
> anything checkable from rendered HTML alone — it's faster and doesn't need
> Docker. Reserve E2E tests for behavior that genuinely needs a real browser
> (JS-driven interactivity: playback, AJAX pagination, lightbox open/close).

## 1. One-time setup

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   and make sure it's running.
2. From the repo root: `npm install`

## 2. Running the suite

```bash
npm run env:start     # starts the WP site (first run downloads images; later runs are fast)
npm run e2e:seed      # creates/updates the fixture pages + imports the sample videos (idempotent)
npm run test:e2e      # runs the Playwright suite
```

Leave `wp-env` running between test runs — only re-run `env:start` after a
reboot or `env:stop`. Re-run `e2e:seed` any time; it reuses existing
attachments/pages by title/slug instead of duplicating them.

Other useful commands:

| Command | Purpose |
| --- | --- |
| `npm run test:e2e:headed` | Watch the browser while tests run. |
| `npm run test:e2e:ui` | Playwright's interactive UI mode. |
| `npm run env:stop` | Stop the WP site (keeps its data). |
| `npm run env:destroy` | Fully tear down the WP site and its data. |

The site is also reachable directly at `http://localhost:8888`
(admin: `admin` / `password`) for manual poking around.

## 3. How the player-type matrix works

Player type for the shared single-video fixture page is controlled by the
site's global `embed_method` option, switched **per spec** via
`tests/e2e/helpers.js`'s `setEmbedMethod()` — it isn't baked into the seeded
content. Because specs mutate this shared, site-wide option, `test:e2e` runs
strictly serially (`fullyParallel: false`, `workers: 1` in
`playwright.config.js`) — parallel workers could flip the option out from
under a different spec's in-flight assertions.

`setEmbedMethod()` writes the target value to a sibling `.embed-method` file
rather than passing it as a CLI argument, then runs `set-embed-method.php`
via `wp-env run cli wp eval-file`. This sidesteps a Windows-specific shell
quirk: `wp-env run` on Windows goes through several nested shell layers
(cmd.exe → the `npx.cmd` shim → wp-env's own Docker invocation), and a value
containing a space (e.g. `"WordPress Default"`) can silently get split into
two separate positional arguments somewhere in that chain.

## 4. What's covered

- `videojs-classic.spec.js` — Video.js (classic) playback + view counting, share/download dropdowns.
- `mejs.spec.js` — WordPress Default (MediaElement.js), same coverage.
- `gallery.spec.js` — lightbox open/navigate/close, AJAX pagination.
- `shortcode-behavioral.spec.js` — the handful of documented `[videopack]` shortcode attributes whose correctness is genuinely JS-behavioral (autoplay actually autoplaying, `right_click` actually blocking the context menu, skip buttons, etc.) rather than just HTML shape.

> [!IMPORTANT]
> A Video.js v10 spec belongs in the `videopack-player-pro` repo instead,
> since that player only exists there.

## 5. Extending

Add a new `*.spec.js` file under `tests/e2e/` for any other browser-facing
flow (settings pages, encode queue UI, etc.). If a new fixture page or
attachment is needed, add it to `tests/e2e/seed.php` — keep the seeder
idempotent (look up by title/slug before creating) so re-running
`e2e:seed` never duplicates content.

## 6. Testing premium (Freemius-gated) add-ons

`videopack-player-pro` and `videopack-cloud-streaming` gate their real
functionality behind a Freemius license check (`can_use_premium_code()`),
which is never satisfied on a fresh local `wp-env` site. To exercise that
code in E2E tests without a real license:

1. Copy `.wp-env.override.json.example` (repo root) to
   `.wp-env.override.json` (gitignored — never commit real values here) and
   set `VIDEOPACK_FORCE_PREMIUM_FOR_TESTING: true`.
2. `npm run env:start` (or `npx wp-env start`) — this constant is read by
   `tests/mu-plugins/force-premium.php`, mounted into the site via
   `.wp-env.json`'s `mappings` config, which directly constructs and runs
   the premium add-on classes on `plugins_loaded` when the real license
   check fails. This mechanism only exists in the local dev site — it's
   never part of a real install.

## 7. Troubleshooting

- **Tests hang or time out on first run** — the first `env:start` downloads
  Docker images and can take several minutes; watch its own output rather
  than assuming the test runner is stuck.
- **A spec fails claiming the wrong player rendered** — another spec's
  `setEmbedMethod()` call may not have completed before the next started;
  confirm `test:e2e` is still running serially (don't override
  `playwright.config.js`'s `workers`/`fullyParallel` settings).
- **Fixture content looks stale or wrong** — re-run `npm run e2e:seed`; it's
  safe to run repeatedly.
- **Starting fresh** — `npm run env:destroy` followed by `npm run env:start`
  and `npm run e2e:seed` rebuilds the site from scratch.

## Related docs

- [tests/e2e/README.md](../tests/e2e/README.md) — quick-start version of this guide, alongside the spec files themselves.
- [tests/README.md](../tests/README.md) — the PHPUnit suite, including more detail on Freemius sandbox-mode testing.
- [docs/add-on-settings.md](add-on-settings.md) — registering settings from an add-on plugin.
- [docs/hooks-reference.md](hooks-reference.md) — the plugin's filter/action hook reference.
