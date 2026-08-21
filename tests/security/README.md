# Security regression test: kgvid_count_play

Reproduces the unauthenticated data-integrity report against `kgvid_count_play`
(fixed in 4.10.6) in a disposable Docker WordPress + MariaDB environment, and
verifies the fix. Loosely follows the original reporter's reproduction steps:
a real attachment imported from the plugin's bundled sample video, a caption
configured through the plugin's own attachment-meta functions, a published
shortcode page, and unauthenticated `curl` requests against `admin-ajax.php`
(no login cookie, exercising the public nonce pulled straight from the page).

## Requirements

- Docker with Compose v2 (`docker compose`)
- `curl`, `bash`

## Run

```bash
cd tests/security
./run-test.sh
```

Add `--keep` to leave the containers running afterwards for manual poking
(`docker compose -f tests/security/docker-compose.yml down -v` to tear down
later). The site is reachable at http://localhost:8765 while running.

## What it checks

1. An empty nonce is rejected (HTTP 403), no metadata touched.
2. An invalid nonce is rejected (HTTP 403), no metadata touched.
3. A legitimate `video_event=play` request (valid public nonce) succeeds and
   only increments the `starts` counter.
4. A `video_event=track` request with a *valid* public nonce — the actual
   reported vulnerability — is rejected (HTTP 400) and the attachment's
   `track` (caption) metadata is left untouched as an array, never
   overwritten with an integer.

Exits non-zero if any check fails.
