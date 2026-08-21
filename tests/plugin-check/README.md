# WordPress Plugin Check (PCP)

Runs the official [WordPress Plugin Check](https://wordpress.org/plugins/plugin-check/)
plugin against Videopack in a disposable Docker WordPress + MariaDB
environment — the same automated review WordPress.org runs against
plugins in the directory.

## Requirements

- Docker with Compose v2 (`docker compose`)
- `bash`

## Run

```bash
cd tests/plugin-check
./run-plugin-check.sh
```

Pass extra `wp plugin check` arguments after `--`, e.g. to skip noise from
directories that don't ship in the actual WordPress.org release (see
`.distignore`):

```bash
./run-plugin-check.sh -- --exclude-directories=vendor,tests,.github
./run-plugin-check.sh -- --categories=security
```

Add `--keep` to leave the containers running afterwards (tear down later with
`docker compose -f tests/plugin-check/docker-compose.yml down -v`).

## Notes

- This scans the raw checked-out plugin directory, not the packaged release.
  Findings on dotfiles (`.gitignore`, `.distignore`, etc.), `.github/`, or
  files under `tests/` reflect that scanning scope, not the actual shipped
  plugin — those paths are excluded from the real release via `.distignore`
  and `.gitattributes` `export-ignore` rules. Use `--exclude-directories`
  (see above) to filter them out of the report.
- `WordPress.Security.ValidatedSanitizedInput.InputNotSanitized` warnings on
  `$_POST`/`$_GET` reads throughout the AJAX handlers are expected false
  positives: this plugin sanitizes through its own `kgvid_sanitize_text_field()`
  wrapper, which the project's own `phpcs.xml` knows about (via
  `customSanitizingFunctions`) but Plugin Check's bundled ruleset does not.
