# Release checklist — Videopack core

A repeatable sequence to run before tagging a release, instead of "load a
site and click around." Automated steps are enforced by [CI](../.github/workflows/ci.yml)
on every push/PR — if CI is green on the commit you're about to tag, those
boxes are already checked. The manual section covers the handful of things
automation can't verify.

If you're releasing player-pro or cloud-streaming alongside a core change,
also run through their own `docs/release-checklist.md` (player-pro's,
cloud-streaming's) — this document only covers core.

## 1. Automated (should already be green in CI before you start)

- [ ] `vendor/bin/phpcs -n` — coding standards
- [ ] `composer analyze` — static analysis (phpstan)
- [ ] `npm run test:php` — PHPUnit core suite (shortcode back-compat, options
      migration, modular renderer, attachment meta migration)
- [ ] `npm run test:e2e` — Playwright suite (Video.js classic, MediaElement.js,
      gallery lightbox) against a real wp-env site with player-pro active

If any of these are red, stop — don't hand-fix it in the release branch and
tag anyway. Fix it, let CI go green, then proceed.

## 2. Version/metadata consistency

These aren't caught by CI and are easy to let drift:

- [ ] `Stable tag` in `readme.txt` matches `Version` in
      `video-embed-thumbnail-generator.php`
- [ ] `readme.txt`'s changelog has an entry for this version
- [ ] `Requires PHP` / `Requires at least` (WP version) are the same in
      `readme.txt`, the plugin header comment, `composer.json`'s
      `require.php` / `config.platform.php`, and `phpcs.xml`'s
      PHPCompatibility `testVersion` — all four currently agree on 7.4,
      matching WordPress core's own documented floor (wordpress.org/about/requirements/);
      keep them in sync if this ever changes
- [ ] `Tested up to` reflects a WordPress version you've actually run the
      E2E suite against recently -- and `.wp-env.json`'s `core` pin
      (`WordPress/WordPress#X.Y`) matches it. CI/local `wp-env` both resolve
      against that exact tag, so this can't silently drift, but it also
      won't self-update: bump it by hand when `Tested up to` changes.
      Deliberately pinned rather than `null` ("latest") -- `wp-env` resolves
      "latest" via the WordPress.org version-check API and then `git fetch`es
      that version as a tag from the WordPress git mirror, which can briefly
      lag a just-published point release (e.g. `7.0.4`) and fail CI with
      "couldn't find remote ref" until the mirror catches up -- a transient
      upstream issue, not anything in this repo, but pinning to an
      already-mirrored version avoids ever hitting it.

## 3. Manual smoke test (things CI genuinely can't cover)

- [ ] **Remove debug logging**: grep for `error_log(`/`Debug_Logger::log(`
      calls added for active development that were never meant to ship —
      e.g. `Public_Controller::log_rest_api_errors()`, a `rest_post_dispatch`
      hook that (even scoped to this plugin's own routes) logs full raw
      REST request params to the PHP error log on any error response.
      Remove the method and its `get_filters()` registration, not just
      disable it.
- [ ] **Freemius license flow**: on a site *without* `FORCE_PREMIUM_FOR_TESTING`,
      confirm the free plugin works standalone and the upgrade prompts/links
      point somewhere real
- [ ] **Fresh install**: activate on a clean WP install with no existing
      Videopack options — confirm no PHP notices/warnings and default
      settings are sane
- [ ] **Upgrade path**: activate this build over a site running the
      previous stable version — confirm any options/postmeta migration
      (`OptionsMigrationTest`/`AttachmentMetaMigrationTest` cover the logic,
      but not a real upgrade-in-place) runs cleanly and nothing silently
      resets
- [ ] **FFmpeg-present vs FFmpeg-absent servers**: thumbnail generation and
      encoding paths behave sanely either way, including the "not installed"
      messaging in the admin
- [ ] Spot-check one non-Chromium browser (Safari or Firefox) for the
      player — Playwright's default project is Chromium only unless you've
      added others

## 4. Build the release artifact

- [ ] `./build-zip.ps1` completes without error
- [ ] Unzip the output and confirm `vendor/` contains production
      dependencies only (`composer install --no-dev` ran, not a dev install)
- [ ] Confirm `admin-ui/build` in the zip is a fresh build, not stale
      committed output from an earlier commit

## Extending this checklist

If a bug ships that this checklist would have caught, add the check here —
that's the point of the list existing.
