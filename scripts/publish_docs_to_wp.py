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
POST_TYPE = os.environ.get("WP_POST_TYPE", "docs") # BetterDocs custom post type 'docs' or fallback
DOCS_DIR = os.environ.get("DOCS_DIR", "docs/public")

if not WP_URL or not WP_USER or not WP_PASSWORD:
    print("Missing WP_URL, WP_USER, or WP_PASSWORD environment variables.")
    sys.exit(1)

auth_header = {
    "Authorization": "Basic " + base64.b64encode(f"{WP_USER}:{WP_PASSWORD}".encode()).decode("utf-8"),
    "Content-Type": "application/json"
}

def get_rest_endpoint_base():
    """Dynamically discover whether the post type endpoint lives at /wp/v2/docs or /wp/v2/docs or /wp/v2/pages."""
    # First test custom post type endpoint (e.g., /wp-json/wp/v2/docs)
    test_url = f"{WP_URL}/wp-json/wp/v2/{POST_TYPE}"
    try:
        res = requests.get(test_url, headers=auth_header, timeout=10)
        if res.status_code in [200, 401]:
            print(f"Found post type endpoint: /wp-json/wp/v2/{POST_TYPE}")
            return test_url
    except Exception as e:
        print(f"Endpoint test failed for {test_url}: {e}")

    # Fallback to standard pages endpoint
    fallback_url = f"{WP_URL}/wp-json/wp/v2/pages"
    print(f"Falling back to default pages endpoint: /wp-json/wp/v2/pages")
    return fallback_url

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
    # Check if doc already exists by slug
    search_url = f"{ENDPOINT_BASE}?slug={slug}&status=publish,draft"
    response = requests.get(search_url, headers=auth_header)
    
    page_data = {
        "title": title,
        "content": html_content,
        "status": "publish",
        "slug": slug
    }

    if response.status_code == 200 and len(response.json()) > 0:
        page_id = response.json()[0]["id"]
        update_url = f"{ENDPOINT_BASE}/{page_id}"
        res = requests.post(update_url, headers=auth_header, json=page_data)
        print(f"Updated doc '{title}' (ID: {page_id}, Slug: {slug}): Status {res.status_code}")
        if res.status_code >= 400:
            print(f"Error details: {res.text}")
    else:
        create_url = ENDPOINT_BASE
        res = requests.post(create_url, headers=auth_header, json=page_data)
        print(f"Created doc '{title}' (Slug: {slug}): Status {res.status_code}")
        if res.status_code >= 400:
            print(f"Error details: {res.text}")

def main():
    for root, dirs, files in os.walk(DOCS_DIR):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                title, html_content, slug = parse_markdown_file(file_path)
                sync_page(title, html_content, slug)

if __name__ == "__main__":
    main()
