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
DOCS_DIR = os.environ.get("DOCS_DIR", "docs/public")

if not WP_URL or not WP_USER or not WP_PASSWORD:
    print("Missing WP_URL, WP_USER, or WP_PASSWORD environment variables.")
    sys.exit(1)

auth_header = {
    "Authorization": "Basic " + base64.b64encode(f"{WP_USER}:{WP_PASSWORD}".encode()).decode("utf-8"),
    "Content-Type": "application/json"
}

def parse_markdown_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Preserve Gutenberg block comments (<!-- wp:... --> and <!-- /wp:... -->)
    # Extract H1 title if present
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else os.path.basename(file_path).replace(".md", "").title()

    # Convert markdown to HTML while leaving block HTML comments intact
    html_content = markdown.markdown(content, extensions=['fenced_code', 'tables', 'toc', 'admonition'])
    
    # Calculate slug from file path relative to DOCS_DIR
    rel_path = os.path.relpath(file_path, DOCS_DIR).replace("\\", "/")
    slug = rel_path.replace(".md", "").replace("/", "-")
    if slug == "index":
        slug = "videopack-docs"

    return title, html_content, slug

def sync_page(title, html_content, slug):
    # Check if page already exists by slug
    search_url = f"{WP_URL}/wp-json/wp/v2/pages?slug={slug}&status=publish,draft"
    response = requests.get(search_url, headers=auth_header)
    
    # Send content string containing Gutenberg HTML block comments in raw content
    page_data = {
        "title": title,
        "content": html_content,
        "status": "publish",
        "slug": slug
    }

    if response.status_code == 200 and len(response.json()) > 0:
        page_id = response.json()[0]["id"]
        update_url = f"{WP_URL}/wp-json/wp/v2/pages/{page_id}"
        res = requests.post(update_url, headers=auth_header, json=page_data)
        print(f"Updated page '{title}' (ID: {page_id}, Slug: {slug}): Status {res.status_code}")
    else:
        create_url = f"{WP_URL}/wp-json/wp/v2/pages"
        res = requests.post(create_url, headers=auth_header, json=page_data)
        print(f"Created page '{title}' (Slug: {slug}): Status {res.status_code}")

def main():
    for root, dirs, files in os.walk(DOCS_DIR):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(root, file)
                title, html_content, slug = parse_markdown_file(file_path)
                sync_page(title, html_content, slug)

if __name__ == "__main__":
    main()
