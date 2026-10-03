#!/usr/bin/env python3
"""Busca pines en Pinterest usando el endpoint JSON público (SSR sin login)."""
import json, sys, urllib.parse, urllib.request

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

def fetch(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "application/json, text/javascript, */*, q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Accept-Language": "es-PE,es;q=0.9,en;q=0.8",
        "Referer": "https://www.pinterest.com/",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8", "ignore"))

def find_pins(obj, out):
    if isinstance(obj, dict):
        if "images" in obj and ("id" in obj):
            out.append(obj)
            return
        for v in obj.values():
            find_pins(v, out)
    elif isinstance(obj, list):
        for v in obj:
            find_pins(v, out)

def search(query, page_size=25):
    data = {
        "options": {
            "article": None,
            "appliedProductFilters": "---",
            "auto_correction_disabled": False,
            "corpus": None,
            "customized_rerank_type": None,
            "filters": None,
            "query": query,
            "query_pin_sigs": None,
            "related_pins": None,
            "scope": "pins",
            "source_id": None,
            "source_module": None,
            "page_size": page_size,
        },
        "context": {},
    }
    q = urllib.parse.urlencode({"source_url": "/search/pins/?q=" + query,
                                "data": json.dumps(data)})
    url = "https://www.pinterest.com/resource/BaseSearchResource/get/?" + q
    return fetch(url)

def pin_best_image(pin):
    imgs = pin.get("images", {})
    for key in ("736x", "orig", "564x", "474x", "236x"):
        if key in imgs and imgs[key].get("url"):
            return imgs[key]["url"]
    # cualquier url disponible
    for v in imgs.values():
        if isinstance(v, dict) and v.get("url"):
            return v["url"]
    return None

def main():
    query = sys.argv[1] if len(sys.argv) > 1 else "boutique website design"
    d = search(query)
    pins = []
    find_pins(d, pins)
    print(f"QUERY: {query} -> {len(pins)} pines", file=sys.stderr)
    rows = []
    for p in pins[:20]:
        rows.append({
            "id": p.get("id"),
            "title": (p.get("title") or p.get("grid_title") or "")[:80],
            "desc": (p.get("description") or "")[:120],
            "img": pin_best_image(p),
            "link": p.get("link") or "",
            "board": (p.get("board") or {}).get("name", ""),
        })
    print(json.dumps(rows, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
