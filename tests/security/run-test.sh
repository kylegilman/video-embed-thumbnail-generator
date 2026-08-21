#!/usr/bin/env bash
#
# Reproduces (and verifies the fix for) the unauthenticated data-integrity
# vulnerability reported against kgvid_count_play in Videopack <= 4.10.5:
# an anonymous request with video_event=track overwrote the '_kgvid-meta'
# postmeta's 'track' (caption) array with an integer, wiping the video's
# WebVTT caption association.
#
# This mirrors the reporter's own reproduction (WordPress + MariaDB in
# Docker, the plugin's bundled sample MP4, a real caption entry, a public
# shortcode page, and unauthenticated curl requests) without needing to
# match their exact WP/MariaDB point versions.
#
# Usage: ./run-test.sh [--keep]
#   --keep   leave the containers running after the test (default: torn down)

set -euo pipefail
cd "$(dirname "$0")"

# On Windows Git Bash (MSYS), absolute-looking arguments like /var/www/html
# get auto-converted to Windows paths before reaching a program. Docker needs
# that conversion disabled (its paths are for the Linux container), but the
# host-side curl calls below need it left ON (curl is the native Windows
# binary and needs "/dev/null" translated to a real Windows path). So this is
# scoped to a `docker` wrapper instead of exported globally.
docker() {
	MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*" command docker "$@"
}

KEEP=0
if [[ "${1:-}" == "--keep" ]]; then
	KEEP=1
fi

WP_URL="http://localhost:8765"
PASS=0
FAIL=0

cleanup() {
	rm -rf tmp
	if [[ "$KEEP" -eq 0 ]]; then
		echo
		echo "Tearing down containers..."
		docker compose down -v >/dev/null 2>&1 || true
	else
		echo
		echo "Containers left running (--keep). Tear down with: docker compose -f tests/security/docker-compose.yml down -v"
	fi
}
trap cleanup EXIT

wpcli() {
	docker compose exec -T -u www-data cli wp --path=/var/www/html "$@"
}

# tests/security/tmp lives inside the plugin dir that's bind-mounted into the
# containers, so scripts written here are readable via `wp eval-file` at
# .../plugins/video-embed-thumbnail-generator/tests/security/tmp/<name>.php
TMP_DIR="tmp"
mkdir -p "$TMP_DIR"
CONTAINER_TMP="/var/www/html/wp-content/plugins/video-embed-thumbnail-generator/tests/security/tmp"

wpcli_eval_file() {
	local name="$1"
	wpcli eval-file "$CONTAINER_TMP/$name"
}

check() {
	local desc="$1" ok="$2"
	if [[ "$ok" -eq 1 ]]; then
		echo "  PASS - $desc"
		PASS=$((PASS + 1))
	else
		echo "  FAIL - $desc"
		FAIL=$((FAIL + 1))
	fi
}

echo "== Starting WordPress + MariaDB =="
docker compose up -d

echo "== Waiting for WordPress core files to be provisioned =="
for i in $(seq 1 60); do
	if docker compose exec -T cli test -f /var/www/html/wp-load.php >/dev/null 2>&1; then
		break
	fi
	sleep 2
done

echo "== Fixing wp-content ownership for the CLI container =="
# The 'wordpress' image's own entrypoint (which we bypass on the cli
# container so it stays alive) is what normally aligns file ownership with
# the www-data user that runs `wp`. Do it explicitly instead.
docker compose exec -T -u root cli sh -c \
	'mkdir -p /var/www/html/wp-content/uploads && chown -R www-data:www-data /var/www/html/wp-content/uploads'

echo "== Waiting for the database to accept connections =="
for i in $(seq 1 30); do
	if wpcli db check >/dev/null 2>&1; then
		break
	fi
	sleep 2
done

echo "== Installing WordPress =="
wpcli core install \
	--url="$WP_URL" \
	--title="Videopack Security Test" \
	--admin_user=admin \
	--admin_password=admin \
	--admin_email=admin@example.test \
	--skip-email

echo "== Activating Videopack =="
wpcli plugin activate video-embed-thumbnail-generator

echo "== Importing the plugin's bundled sample video =="
ATTACHMENT_ID=$(wpcli media import \
	/var/www/html/wp-content/plugins/video-embed-thumbnail-generator/src/images/Adobestock_469037984.mp4 \
	--title="Videopack Test Video" \
	--porcelain)
echo "  attachment ID: $ATTACHMENT_ID"

echo "== Configuring a caption (WebVTT track) via the normal attachment meta workflow =="
cat > "$TMP_DIR/configure-caption.php" <<PHP
<?php
\$id = $ATTACHMENT_ID;
\$meta = kgvid_get_attachment_meta( \$id );
\$meta['track'] = array(
	array(
		'kind'    => 'captions',
		'srclang' => 'en',
		'label'   => 'English',
		'src'     => 'https://example.test/captions.vtt',
	),
);
kgvid_save_attachment_meta( \$id, \$meta );
echo "caption configured\n";
PHP
wpcli_eval_file configure-caption.php

echo "== Publishing a page with the standard shortcode player =="
PAGE_ID=$(wpcli post create \
	--post_type=page \
	--post_title="Videopack Test Page" \
	--post_status=publish \
	--post_content="[videopack id=$ATTACHMENT_ID]" \
	--porcelain)
PAGE_URL="$WP_URL/?page_id=$PAGE_ID"
echo "  page URL: $PAGE_URL"

echo "== Fetching the page as an anonymous visitor (no cookies) to extract the public nonce =="
PAGE_HTML=$(curl -s -c /dev/null "$PAGE_URL")
NONCE=$(echo "$PAGE_HTML" | grep -o '"ajax_nonce":"[^"]*"' | head -1 | cut -d'"' -f4)

if [[ -z "$NONCE" ]]; then
	echo "Could not extract kgvidL10n_frontend.ajax_nonce from the page. Aborting."
	exit 1
fi
echo "  nonce: $NONCE"

AJAX_URL="$WP_URL/wp-admin/admin-ajax.php"

cat > "$TMP_DIR/get-track-type.php" <<PHP
<?php
\$meta = kgvid_get_attachment_meta( $ATTACHMENT_ID );
echo gettype( \$meta['track'] );
PHP

cat > "$TMP_DIR/get-starts.php" <<PHP
<?php
\$meta = kgvid_get_attachment_meta( $ATTACHMENT_ID );
echo intval( \$meta['starts'] );
PHP

get_track_type() {
	wpcli_eval_file get-track-type.php
}

get_starts() {
	wpcli_eval_file get-starts.php
}

echo
echo "== Running unauthenticated requests against kgvid_count_play =="
echo

# 1. Empty nonce -> should be rejected before touching anything
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$AJAX_URL" \
	--cookie "" \
	-d "action=kgvid_count_play&post_id=$ATTACHMENT_ID&video_event=track&security=")
check "empty nonce is rejected with HTTP 403" "$([[ "$STATUS" == "403" ]] && echo 1 || echo 0)"

# 2. Invalid nonce -> should be rejected before touching anything
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$AJAX_URL" \
	--cookie "" \
	-d "action=kgvid_count_play&post_id=$ATTACHMENT_ID&video_event=track&security=not-a-real-nonce")
check "invalid nonce is rejected with HTTP 403" "$([[ "$STATUS" == "403" ]] && echo 1 || echo 0)"

# 3. Legitimate play event -> should succeed and only touch the 'starts' counter
STARTS_BEFORE=$(get_starts)
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$AJAX_URL" \
	--cookie "" \
	-d "action=kgvid_count_play&post_id=$ATTACHMENT_ID&video_event=play&security=$NONCE")
STARTS_AFTER=$(get_starts)
check "legitimate 'play' event returns HTTP 200" "$([[ "$STATUS" == "200" ]] && echo 1 || echo 0)"
check "legitimate 'play' event increments the starts counter" "$([[ "$STARTS_AFTER" -gt "$STARTS_BEFORE" ]] && echo 1 || echo 0)"

# 4. The actual vulnerability: video_event=track with a *valid* public nonce
TRACK_TYPE_BEFORE=$(get_track_type)
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$AJAX_URL" \
	--cookie "" \
	-d "action=kgvid_count_play&post_id=$ATTACHMENT_ID&video_event=track&security=$NONCE")
TRACK_TYPE_AFTER=$(get_track_type)

check "'track' event with a valid public nonce is rejected with HTTP 400" "$([[ "$STATUS" == "400" ]] && echo 1 || echo 0)"
check "caption metadata ('track') is still an array, not overwritten with an integer" "$([[ "$TRACK_TYPE_BEFORE" == "array" && "$TRACK_TYPE_AFTER" == "array" ]] && echo 1 || echo 0)"

echo
echo "== Results: $PASS passed, $FAIL failed =="
echo

if [[ "$FAIL" -gt 0 ]]; then
	exit 1
fi
