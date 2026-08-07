import os
import re
import sys
import json
import base64
import requests
import markdown

# Configuration from Environment
WP_URL = os.environ.get("WP_URL", "").rstrip("/")
WP_USER = os.environ.get("WP_USER", "")
WP_PASSWORD = os.environ.get("WP_PASSWORD", "")
POST_TYPE = os.environ.get("WP_POST_TYPE", "docs") # BetterDocs custom post type
DOCS_DIR = os.environ.get("DOCS_DIR", "docs/public")

if not WP_URL or not WP_USER or not WP_PASSWORD:
    print("Missing WP_URL, WP_USER, or WP_PASSWORD environment variables.")
    sys.exit(1)

auth_header = {
    "Authorization": "Basic " + base64.b64encode(f"{WP_USER}:{WP_PASSWORD}".encode()).decode("utf-8"),
    "Content-Type": "application/json",
    "User-Agent": "VideopackDocsPublisher/1.0"
}

def get_rest_endpoint_base():
    """Discover available endpoints on the WordPress site by probing candidates."""
    candidates = [
        f"{WP_URL}/wp-json/wp/v2/{POST_TYPE}",       # /wp-json/wp/v2/docs
        f"{WP_URL}/wp-json/wp/v2/betterdocs",         # /wp-json/wp/v2/betterdocs
        f"{WP_URL}/index.php?rest_route=/wp/v2/{POST_TYPE}", # Non-pretty permalinks
        f"{WP_URL}/wp-json/wp/v2/pages"               # Default WP Pages fallback
    ]

    for candidate in candidates:
        try:
            print(f"Testing REST endpoint candidate: {candidate}")
            res = requests.get(candidate, headers=auth_header, timeout=10)
            if res.status_code in [200, 401]:
                print(f"--> Success! Using endpoint: {candidate}")
                return candidate
            else:
                print(f"--> Returned status {res.status_code}")
        except Exception as e:
            print(f"--> Endpoint test failed: {e}")

    print("Warning: All candidate tests failed. Defaulting to standard pages endpoint.")
    return f"{WP_URL}/wp-json/wp/v2/pages"

ENDPOINT_BASE = get_rest_endpoint_base()

def parse_markdown_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract H1 title if present
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else os.path.basename(file_path).replace(".md", "").title()

    # Convert markdown to HTML while leaving Gutenberg block comments intact
    html_content = markdown.markdown(content, extensions=['fenced_code', 'tables', 'toc', 'admonition'])
    
    # Calculate slug from file path relative to DOCS_DIR
    rel_path = os.path.relpath(file_path, DOCS_DIR).replace("\\", "/")
    slug = rel_path.replace(".md", "").replace("/", "-")
    if slug == "index":
        slug = "videopack-docs"

    return title, html_content, slug

def sync_page(title, html_content, slug):
    query_param = "&" if "?" in ENDPOINT_BASE else "?"
    search_url = f"{ENDPOINT_BASE}{query_param}slug={slug}&status=publish,draft"
    response = requests.get(search_url, headers=auth_header)
    
    page_data = {
        "title": title,
        "content": html_content,
        "status": "publish",
        "slug": slug
    }

    if response.status_code == 200 and len(response.json()) > 0:
        page_id = response.json()[0]["id"]
        update_url = f"{ENDPOINT_BASE}/{page_id}" if "?" not in ENDPOINT_BASE else f"{ENDPOINT_BASE}&id={page_id}"
        res = requests.post(update_url, headers=auth_header, json=page_data)
        print(f"Updated doc '{title}' (ID: {page_id}, Slug: {slug}): Status {res.status_code}")
        if res.status_code >= 400:
            print(f"Error payload: {res.text[:500]}")
    else:
        create_url = ENDPOINT_BASE
        res = requests.post(create_url, headers=auth_header, json=page_data)
        print(f"Created doc '{title}' (Slug: {slug}): Status {res.status_code}")
        if res.status_code >= 400:
            print(f"Error payload: {res.text[:500]}")

def main():
    print(f"Starting documentation sync to: {WP_URL}")
    for root, dirs, files in os.walk(DOCS_DIR):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                title, html_content, slug = parse_markdown_file(file_path)
                sync_page(title, html_content, slug)

if __name__ == "__main__":
    main()
