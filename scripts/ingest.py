#!/usr/bin/env python3
import json, re, urllib.request, hashlib
from html.parser import HTMLParser
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
SOURCES=ROOT/"data/sources.json"
INBOX=ROOT/"data/inbox.json"
UA="PULSE-DE/1.0 (+https://github.com/Rololol/Pulse-Headmap)"
KEYWORDS=re.compile(r"schaden|mehrkosten|fehlbetrag|fehlinvestition|korruption|vergab|aufsicht|rückforderung|steuerausfall|untersuchung|rechnungshof|haushalt|subvention|beschaffung|klage|urteil|entscheidung|gesetz",re.I)

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.href=None; self.buf=[]
    def handle_starttag(self,tag,attrs):
        if tag=="a": self.href=dict(attrs).get("href"); self.buf=[]
    def handle_data(self,data):
        if self.href is not None: self.buf.append(data)
    def handle_endtag(self,tag):
        if tag=="a" and self.href:
            self.links.append((self.href," ".join("".join(self.buf).split())))
            self.href=None; self.buf=[]

def fetch(url):
    req=urllib.request.Request(url,headers={"User-Agent":UA})
    with urllib.request.urlopen(req,timeout=30) as r: return r.read()

def absolute(base,href):
    if href.startswith(("http://","https://")): return href
    m=re.match(r"(https?://[^/]+)",base)
    if href.startswith("/"): return (m.group(1) if m else "")+href
    return base.rstrip("/")+"/"+href.lstrip("/")

def record(source,title,url,date=None):
    return {"id":"src-"+hashlib.sha256(url.encode()).hexdigest()[:16],"sourceId":source["id"],"publisher":source["publisher"],"scope":source["scope"],"title":title[:500],"url":url,"publishedAt":date or None,"matched":bool(KEYWORDS.search(title)),"reviewState":"needs_review","discoveredAt":datetime.now(timezone.utc).isoformat()}

def rss_items(raw,source):
    root=ET.fromstring(raw); out=[]
    for item in root.findall(".//item"):
        title=(item.findtext("title") or "").strip(); link=(item.findtext("link") or "").strip()
        date=(item.findtext("pubDate") or item.findtext("date") or "").strip()
        if title and link: out.append(record(source,title,link,date))
    return out

def html_items(raw,source,base):
    p=LinkParser(); p.feed(raw.decode("utf-8","ignore")); out=[]
    for href,title in p.links:
        if len(title)<8: continue
        url=absolute(base,href)
        if source["scope"]=="berichte" and "/veroeffentlichungen/" not in url: continue
        if source["scope"]=="pressemitteilungen" and not (KEYWORDS.search(title) or "presse" in title.lower()): continue
        out.append(record(source,title,url))
    return out

def main():
    sources=json.loads(SOURCES.read_text())
    inbox=json.loads(INBOX.read_text()) if INBOX.exists() else {"version":1,"updatedAt":None,"items":[]}
    known={x["url"] for x in inbox.get("items",[])}; added=[]
    for source in sources:
        if not source.get("enabled"): continue
        try:
            raw=fetch(source["url"])
            items=rss_items(raw,source) if source["type"]=="rss" else html_items(raw,source,source["url"])
            items=sorted(items,key=lambda x:(not x["matched"],x["title"]))[:120]
            for item in items:
                if item["url"] not in known:
                    inbox["items"].append(item); known.add(item["url"]); added.append(item)
        except Exception as e:
            print(f"WARN {source['id']}: {e}")
    inbox["items"]=sorted(inbox["items"],key=lambda x:x["discoveredAt"],reverse=True)
    inbox["updatedAt"]=datetime.now(timezone.utc).isoformat()
    INBOX.write_text(json.dumps(inbox,ensure_ascii=False,indent=2)+"\n")
    print(f"Added {len(added)} new source records; inbox now contains {len(inbox['items'])}.")

if __name__=="__main__": main()
