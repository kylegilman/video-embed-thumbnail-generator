# Videopack PHPUnit tests

Integration tests (`WP_UnitTestCase`) that run against a real WordPress
install — the same wp-env/Docker environment the E2E suite in
[tests/e2e/](e2e/README.md) uses, not a separately-running site. Nothing
here depends on any specific local WordPress install being active.

## One-time setup

Same as the E2E suite: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
running, then from the repo root: `npm install`.

## Running

```
npm run env:start   # starts the wp-env WordPress site (if not already running)
npm run test:php    # runs the full PHPUnit suite inside the wp-env cli container
```

`test:php` runs PHPUnit *inside* the wp-env `cli` container (not on the
host) — `tests/wp-tests-config.php` points at the container's own
filesystem (`/var/www/html`) and its `mysql` service, both of which only
resolve from inside Docker's network. A `pretest:php` step creates the
dedicated `phpunit_test` database first if it doesn't already exist —
deliberately separate from the `wordpress` database the dev site (and the
E2E fixture content) uses, since `WP_UnitTestCase` reinstalls WordPress
from scratch into whatever database it's pointed at.

Optional env vars (also read by `tests/bootstrap.php`), same as before:
`LOAD_PLAYER_PRO=1` and `LOAD_CLOUD_STREAMING=1` additionally load those
sibling plugins if present at their expected sibling paths.

## What's covered

- `ModularRendererTest.php` — server-rendered HTML for individual modular blocks.
- `ShortcodeAttributesTest.php` — every documented `[videopack]` shortcode attribute (see `Screens::add_contextual_help_tab()` for the reference list), verifying each still resolves/renders correctly. This is the backward-compatibility net for the 10,000+ sites running the shortcode directly.
- `ShortcodeLegacyCompatTest.php` — the *undocumented* legacy compatibility layer (deprecated attribute aliases, old shortcode tag names, legacy value formats) that doesn't appear in the current help tab and is therefore easy to forget still needs to keep working.

Tests specific to the premium add-ons (e.g. player restriction behavior)
live in `videopack-player-pro`'s own (private) test suite instead of here —
see that repo's `tests/README.md`. This repo is public, and those tests'
assertions and comments would otherwise document the private add-ons'
internal architecture (class/method names, data shapes, hook priorities)
in a public place for anyone to read without buying anything.

## Testing premium (Freemius-gated) plugin code

`videopack-player-pro` and `videopack-cloud-streaming` gate their real
functionality behind a Freemius license check (`can_use_premium_code()`),
which is never satisfied on a fresh local wp-env site. This repo's own
suite doesn't need that (see above), but the E2E suite's
`videojs-v10-standalone.spec.js` does, since it needs player-pro's Video.js
v10 player to actually activate. To exercise premium code locally without a
real license:

1. Copy `.wp-env.override.json.example` (repo root) to `.wp-env.override.json`
   (gitignored — never commit real values here) and set
   `VIDEOPACK_FORCE_PREMIUM_FOR_TESTING: true`.
2. `npm run env:start` (or `npx wp-env start`) — this constant is read by
   `videopack-player-pro`'s `tests/mu-plugins/force-premium.php`, mounted
   into the site via this repo's `.wp-env.json` `mappings` config (from the
   *private* add-on repo, not from here — see that repo's `tests/README.md`
   for what it actually does and why it lives there instead of in this
   public repo). The shipped plugin bootstrap files are never modified by
   this — `build-zip.ps1`'s include-list never references `tests/`, so this
   mechanism doesn't exist in any real install regardless of what's defined.

`.wp-env.override.json.example` also documents `..._FS_SECRET_KEY` fields
(from each product's Freemius Developer Dashboard) for genuine sandbox-mode
testing — a heavier, real-Freemius-API path; `FORCE_PREMIUM_FOR_TESTING` is
usually simpler and sufficient.

## Extending

Add a new `*Test.php` file here for anything else worth covering at the
PHP/rendering-output level. Reserve [tests/e2e/](e2e/README.md) for
behavior that genuinely needs a real browser (JS-driven interactivity) —
most shortcode/attribute correctness is cheaper and more reliable to check
here, against rendered HTML output directly.

## JavaScript and React tests

The admin UI's JavaScript has its own Jest suite, separate from PHPUnit and
the Playwright E2E suite:

```
cd admin-ui
npm test           # runs every *.test.js under admin-ui/src and admin-ui/test-support
```

Plain functions (for example `src/utils/bitrate.test.js`) test directly.
React components render in jsdom with React Testing Library — see
`src/features/settings/components/PerCodecQualitySettings.test.js` for the
pattern: set the `videopack_config` global the component reads, render it
with realistic props, then assert on what a user would see and on the
callbacks it fires.

**Component tests run against WordPress's own controls.** The production
build treats React and every `@wordpress/*` import (except the few it
bundles, like `@wordpress/icons`) as externals that resolve to the copy
WordPress core loads on the page. The Jest config maps those imports the same
way, to WordPress core's real scripts, so a test never renders a control that
differs from the one users get. Those files are copied out of the wp-env site
(the same WordPress version the E2E suite uses) into the git-ignored
`admin-ui/.wp-core`; `npm test` fetches them automatically the first time, so
start Docker and `npm run env:start` before the first run, and run
`npm run fetch:wp-core` after changing the WordPress version in `.wp-env.json`.
`test-support/wp-runtime.test.js` fails if the setup ever falls back to the
copies in `node_modules`. Anything that needs the real settings screen, a real
browser, or the PHP-provided data goes in the E2E suite instead
(`tests/e2e/settings-quality.spec.js` is an example).
