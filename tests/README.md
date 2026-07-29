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
- `Pro/PlayerRestrictionTest.php` — pro-plugin player restrictions (skipped unless `LOAD_PLAYER_PRO=1`).
- `ShortcodeAttributesTest.php` — every documented `[videopack]` shortcode attribute (see `Screens::add_contextual_help_tab()` for the reference list), verifying each still resolves/renders correctly. This is the backward-compatibility net for the 10,000+ sites running the shortcode directly.
- `ShortcodeLegacyCompatTest.php` — the *undocumented* legacy compatibility layer (deprecated attribute aliases, old shortcode tag names, legacy value formats) that doesn't appear in the current help tab and is therefore easy to forget still needs to keep working.

## Testing premium (Freemius-gated) plugin code

`videopack-player-pro` and `videopack-cloud-streaming` gate their real
functionality behind a Freemius license check (`can_use_premium_code()`),
which is never satisfied on a fresh local wp-env site. To exercise that code
locally without a real license:

1. Copy `.wp-env.override.json.example` (repo root) to `.wp-env.override.json`
   (gitignored — never commit real values here) and set
   `VIDEOPACK_FORCE_PREMIUM_FOR_TESTING: true`.
2. `npm run env:start` (or `npx wp-env start`) — this constant is read by
   `tests/mu-plugins/force-premium.php`, mounted into the site only via
   `.wp-env.json`'s `mappings` config, which directly constructs and runs
   `\Videopack\Player_Pro\Pro()` on `plugins_loaded` when the real license
   check fails. The shipped plugin bootstrap files are never modified by
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
