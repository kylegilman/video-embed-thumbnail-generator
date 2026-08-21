#!/usr/bin/env bash
#
# Runs the official WordPress Plugin Check (PCP) plugin against this plugin,
# in a disposable Docker WordPress + MariaDB environment.
#
# Usage: ./run-plugin-check.sh [--keep] [-- <extra wp plugin check args>]
#   --keep   leave the containers running after the run (default: torn down)
#
# Examples:
#   ./run-plugin-check.sh
#   ./run-plugin-check.sh -- --exclude-directories=vendor
#   ./run-plugin-check.sh -- --categories=security

set -euo pipefail
cd "$(dirname "$0")"

# See tests/security/run-test.sh for why this is scoped to a `docker`
# wrapper instead of exported globally (Windows Git Bash / MSYS path
# conversion breaks curl if disabled globally; not needed here since this
# script only shells out to docker/wp, but kept for consistency and safety
# if curl is ever added).
docker() {
	MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*" command docker "$@"
}

KEEP=0
EXTRA_ARGS=()
while [[ $# -gt 0 ]]; do
	case "$1" in
		--keep)
			KEEP=1
			shift
			;;
		--)
			shift
			EXTRA_ARGS=("$@")
			break
			;;
		*)
			shift
			;;
	esac
done

WP_URL="http://localhost:8766"

cleanup() {
	if [[ "$KEEP" -eq 0 ]]; then
		echo
		echo "Tearing down containers..."
		docker compose down -v >/dev/null 2>&1 || true
	else
		echo
		echo "Containers left running (--keep). Tear down with: docker compose -f tests/plugin-check/docker-compose.yml down -v"
	fi
}
trap cleanup EXIT

wpcli() {
	docker compose exec -T -u www-data cli wp --path=/var/www/html "$@"
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
# Only chown wp-content and wp-content/plugins themselves (not recursively -
# the bind-mounted video-embed-thumbnail-generator directory under
# wp-content/plugins is read-only and would make a recursive chown fail).
# That's enough for `wp` to create new subdirectories like wp-content/upgrade
# and wp-content/plugins/plugin-check.
docker compose exec -T -u root cli sh -c \
	'chown www-data:www-data /var/www/html/wp-content /var/www/html/wp-content/plugins && mkdir -p /var/www/html/wp-content/uploads && chown -R www-data:www-data /var/www/html/wp-content/uploads'

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
	--title="Videopack Plugin Check" \
	--admin_user=admin \
	--admin_password=admin \
	--admin_email=admin@example.test \
	--skip-email

echo "== Installing and activating the Plugin Check plugin =="
wpcli plugin install plugin-check --activate

echo "== Activating Videopack =="
wpcli plugin activate video-embed-thumbnail-generator

echo
echo "== Running Plugin Check against video-embed-thumbnail-generator =="
echo
set +e
wpcli plugin check video-embed-thumbnail-generator --format=table "${EXTRA_ARGS[@]}"
RESULT=$?
set -e

echo
if [[ "$RESULT" -eq 0 ]]; then
	echo "== Plugin Check found no errors (warnings, if any, are shown above) =="
else
	echo "== Plugin Check reported errors (see above). Exit code: $RESULT =="
fi

exit "$RESULT"
