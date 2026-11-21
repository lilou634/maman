#!/usr/bin/env python3
"""NeuroPlay : petit serveur local (Python standard, aucune installation).

Lancement :  python3 server.py        (Windows : python server.py)
Puis ouvrir  http://localhost:8000

Il sert les pages du dossier public/ et l'adresse /api/news, qui va lire les flux
d'actualités listés dans feeds.json (le navigateur ne peut pas les lire lui-même).
"""
import argparse
import concurrent.futures
import html
import json
import os
import re
import ssl
import threading
import time
import urllib.request
import webbrowser
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(HERE, "public")
FEEDS_FILE = os.environ.get("NEURO_FEEDS_FILE", os.path.join(HERE, "feeds.json"))

CACHE_SECONDS = 20 * 60      # les flux sont relus toutes les 20 minutes
MIN_FORCE_INTERVAL = 60      # « Actualiser » ne relit pas plus d'une fois par minute
MAX_PER_FEED = 25
USER_AGENT = "Mozilla/5.0 (compatible; NeuroPlay-local/1.0; lecteur RSS personnel)"

_cache = {"time": 0.0, "data": None}
_lock = threading.Lock()


# ---------- lecture des flux ----------

def load_feeds():
    with open(FEEDS_FILE, encoding="utf-8") as f:
        return json.load(f)


def strip_html(text, limit=280):
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\s+([.,)])", r"\1", text)
    if len(text) > limit:
        text = text[:limit].rsplit(" ", 1)[0] + "…"
    return text


def parse_date(value):
    if not value:
        return None
    value = value.strip()
    try:
        d = parsedate_to_datetime(value)
    except (TypeError, ValueError, IndexError):
        try:
            d = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    return d.astimezone(timezone.utc)


def local(tag):
    return tag.rsplit("}", 1)[-1]


def child_text(el, *names):
    for c in el:
        if local(c.tag) in names and (c.text or "").strip():
            return c.text.strip()
    return ""


def parse_feed(xml_bytes, feed):
    root = ET.fromstring(xml_bytes)
    items = []
    entries = [e for e in root.iter() if local(e.tag) in ("item", "entry")]
    for e in entries[:MAX_PER_FEED]:
        title = strip_html(child_text(e, "title"), 300)
        link = ""
        for c in e:
            if local(c.tag) == "link":
                link = (c.text or "").strip() or c.get("href", "")
                if c.get("rel", "alternate") == "alternate" and link:
                    break
        if not title or not link:
            continue
        summary = strip_html(child_text(e, "description", "summary", "content", "encoded"))
        source = feed["name"]
        for c in e:
            if local(c.tag) == "source" and (c.text or "").strip():
                source = c.text.strip()
        # Google Actualités : « Titre - Journal » -> on retire le journal du titre
        if "news.google.com" in feed["url"]:
            if title.endswith(" - " + source):
                title = title[: -len(" - " + source)]
            summary = ""  # le résumé Google ne fait que répéter le titre
        d = parse_date(child_text(e, "pubDate", "published", "updated", "date"))
        items.append({
            "title": title,
            "link": link,
            "summary": summary,
            "source": source,
            "feed": feed["id"],
            "feedName": feed["name"],
            "lang": feed.get("lang", "fr"),
            "date": d.isoformat() if d else None,
        })
    return items


def fetch_feed(feed):
    req = urllib.request.Request(feed["url"], headers={
        "User-Agent": USER_AGENT,
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
    })
    started = time.time()
    try:
        with urllib.request.urlopen(req, timeout=12, context=ssl.create_default_context()) as r:
            data = r.read(3_000_000)
        items = parse_feed(data, feed)
        return items, {"id": feed["id"], "name": feed["name"], "ok": True,
                       "count": len(items), "ms": int((time.time() - started) * 1000)}
    except Exception as exc:  # un flux en panne ne doit pas bloquer les autres
        msg = str(exc)
        if "CERTIFICATE_VERIFY_FAILED" in msg:
            msg = ("certificats SSL absents : sur Mac, lancez « Install Certificates.command » "
                   "dans le dossier Python des Applications")
        return [], {"id": feed["id"], "name": feed["name"], "ok": False, "error": msg[:200]}


def collect_news():
    feeds = load_feeds()
    items, status = [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for its, st in pool.map(fetch_feed, feeds):
            items.extend(its)
            status.append(st)
    seen, unique = set(), []
    for it in items:
        key = re.sub(r"\W+", "", it["title"].lower())[:90]
        if key in seen:
            continue
        seen.add(key)
        unique.append(it)
    unique.sort(key=lambda i: i["date"] or "", reverse=True)
    return {
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "nextRefreshSeconds": CACHE_SECONDS,
        "sources": status,
        "items": unique,
    }


def get_news(force=False):
    with _lock:
        age = time.time() - _cache["time"]
        stale = _cache["data"] is None or age > CACHE_SECONDS
        if stale or (force and age > MIN_FORCE_INTERVAL):
            _cache["data"] = collect_news()
            _cache["time"] = time.time()
        return _cache["data"]


# ---------- serveur web ----------

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/api/news":
            force = parse_qs(url.query).get("force") == ["1"]
            try:
                body = json.dumps(get_news(force), ensure_ascii=False).encode("utf-8")
                self.send_response(200)
            except Exception as exc:
                body = json.dumps({"error": str(exc), "items": [], "sources": []}).encode()
                self.send_response(500)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def log_message(self, fmt, *args):
        if "/api/news" in (args[0] if args else ""):
            super().log_message(fmt, *args)


def main():
    p = argparse.ArgumentParser(description="NeuroPlay en local")
    p.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8000)))
    p.add_argument("--no-browser", action="store_true", help="ne pas ouvrir le navigateur")
    args = p.parse_args()

    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    url = f"http://localhost:{args.port}"
    print(f"\n  🧠 NeuroPlay tourne sur {url}\n  (Ctrl+C pour arrêter)\n")
    threading.Thread(target=get_news, daemon=True).start()  # précharge les actus
    if not args.no_browser:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  À bientôt !")


if __name__ == "__main__":
    main()
