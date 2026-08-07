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
- [ ] `Requires PHP` / `Requires at least` (WP version) are the same in both
      `readme.txt` and the plugin header comment — **these are currently out
      of sync** (`readme.txt` says PHP 7.3, the plugin header says 7.2); pick
      the actual minimum and make both agree next time either changes
- [ ] `Tested up to` reflects a WordPress version you've actually run the
      E2E suite against recently

## 3. Manual smoke test (things CI genuinely can't cover)

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
