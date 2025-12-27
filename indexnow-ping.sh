#!/usr/bin/env bash
# Simple build-time ping to IndexNow using sitemap URLs.
# Keeps build green even if the ping endpoint is unreachable.

set -uo pipefail

python3 <<'PY'
import json
import pathlib
import sys
import urllib.request
import xml.etree.ElementTree as ET

SITEMAPS = [pathlib.Path("sitemap-fr.xml"), pathlib.Path("en/sitemap-en.xml")]
HOST = "rayzvideoai.com"
KEY = "ab507b8db88046e6923b95eb9f486a52"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
API_URL = "https://api.indexnow.org/indexnow"

urls = []
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}

for path in SITEMAPS:
    if not path.exists():
        print(f"IndexNow: sitemap absente -> {path}")
        continue

    try:
        tree = ET.parse(path)
    except ET.ParseError as exc:
        print(f"IndexNow: sitemap illisible {path}: {exc}")
        continue

    for loc in tree.iterfind(".//s:loc", ns):
        if loc.text and loc.text.strip():
            urls.append(loc.text.strip())

if not urls:
    print("IndexNow: aucune URL trouvée, ping ignoré.")
    sys.exit(0)

payload = {
    "host": HOST,
    "key": KEY,
    "keyLocation": KEY_LOCATION,
    "urlList": urls,
}

data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(API_URL, data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode(errors="ignore")
        print(f"IndexNow: ping envoyé ({resp.status}).")
        if resp.status >= 300:
            print(f"IndexNow: réponse: {body}")
except Exception as exc:
    print(f"IndexNow: ping échoué: {exc}")
PY
