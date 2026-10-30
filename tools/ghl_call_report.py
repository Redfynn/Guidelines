#!/usr/bin/env python3
"""Pull GoHighLevel call records for a date window and summarize them.

Read-only (GET only). Token comes from the GHL_TOKEN env var and is never
printed or written anywhere.

Works around the broken date filtering on /conversations/messages/export
(channel=Call): startDate/endDate and sortBy=createdAt are NOT used. Instead we
page through sortBy=updatedAt&sortOrder=desc and filter on dateAdded locally.

Usage:
    export GHL_TOKEN=...
    python3 ghl_call_report.py --start 2026-10-26 --end now
    python3 ghl_call_report.py --start 2026-10-26 --partner-only
"""
import argparse
import csv
import os
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import requests

LOCATION_ID = "BASh7MCH6WO6exJ85vQm"
BASE_URL = "https://services.leadconnectorhq.com"
TZ = ZoneInfo("America/Phoenix")
EXPORT_VERSION = "2021-04-15"
USERS_VERSION = "2021-07-28"
CONTACTS_VERSION = "2021-07-28"
PAGE_LIMIT = 1000
STOP_MARGIN = timedelta(days=2)
MAX_RETRIES = 6
SHORT_CALL_SECONDS = 30

KNOWN_USERS = {
    "kr5UPYm4gqki2P8Xawqv": "Josh McGraw",
    "4oXKsyLJroOyNlhbkfRt": "Quinn Roshandel",
}

CSV_COLUMNS = [
    "id", "dateAdded_local", "day", "hour", "direction", "status",
    "duration_seconds", "userId", "userName", "from", "to",
    "conversationId", "contactId",
]


# ---------------------------------------------------------------- time helpers

def parse_when(text, end=False):
    """Parse 'now', 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM' as Phoenix local time.

    A date-only --end is treated as inclusive, i.e. the window runs to the end
    of that day.
    """
    if text.lower() == "now":
        return datetime.now(TZ)
    for fmt, date_only in (("%Y-%m-%d %H:%M", False), ("%Y-%m-%dT%H:%M", False),
                           ("%Y-%m-%d", True)):
        try:
            dt = datetime.strptime(text, fmt).replace(tzinfo=TZ)
        except ValueError:
            continue
        if date_only and end:
            dt += timedelta(days=1)
        return dt
    raise argparse.ArgumentTypeError(f"can't parse date/time: {text!r}")


def parse_ts(value):
    """GHL timestamps: ISO-8601 strings, or epoch seconds/millis. Returns aware dt."""
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)) or (isinstance(value, str) and value.isdigit()):
        n = float(value)
        if n > 1e11:  # milliseconds
            n /= 1000.0
        return datetime.fromtimestamp(n, tz=ZoneInfo("UTC")).astimezone(TZ)
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))
    return dt.astimezone(TZ)


# ---------------------------------------------------------------- HTTP

class GHL:
    def __init__(self, token, base_url=BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.session = requests.Session()
        self.requests_made = 0

    def get(self, path, version, params=None):
        """GET with retry/backoff on 429, 5xx and connection errors."""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Version": version,
            "Accept": "application/json",
        }
        url = self.base_url + path
        delay = 1.0
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = self.session.get(url, headers=headers, params=params, timeout=60)
            except requests.RequestException as exc:
                # Exception class only: never echo anything that could carry headers.
                if attempt == MAX_RETRIES:
                    raise SystemExit(f"GET {path} failed: {type(exc).__name__}")
                self._sleep(delay, path, type(exc).__name__)
                delay = min(delay * 2, 30)
                continue
            self.requests_made += 1
            if resp.status_code == 429 or resp.status_code >= 500:
                if attempt == MAX_RETRIES:
                    raise SystemExit(f"GET {path} failed: HTTP {resp.status_code} after {attempt} tries")
                wait = delay
                retry_after = resp.headers.get("Retry-After")
                if retry_after and retry_after.isdigit():
                    wait = max(wait, int(retry_after))
                self._sleep(wait, path, f"HTTP {resp.status_code}")
                delay = min(delay * 2, 30)
                continue
            return resp
        raise SystemExit(f"GET {path} failed")

    @staticmethod
    def _sleep(seconds, path, why):
        print(f"  retry: {path} ({why}), waiting {seconds:.0f}s", file=sys.stderr)
        time.sleep(seconds)


# ---------------------------------------------------------------- export paging

def fetch_calls(api, start, end, debug_fields=False):
    """Page the export newest-updated-first; return (records_in_window, stats)."""
    stop_before = start - STOP_MARGIN
    kept, seen_ids = [], set()
    pages = 0
    newest_added = oldest_added = None
    cursor = None
    total_reported = None

    while True:
        params = {
            "locationId": LOCATION_ID,
            "channel": "Call",
            "sortBy": "updatedAt",
            "sortOrder": "desc",
            "limit": PAGE_LIMIT,
        }
        if cursor:
            params["cursor"] = cursor
        resp = api.get("/conversations/messages/export", EXPORT_VERSION, params)
        if resp.status_code != 200:
            hint = " (cursors expire after 2 minutes)" if cursor else ""
            raise SystemExit(f"export failed: HTTP {resp.status_code}{hint}: {resp.text[:200]}")
        body = resp.json()
        pages += 1
        messages = body.get("messages") or []
        if total_reported is None:
            total_reported = body.get("total")
        if debug_fields and pages == 1 and messages:
            print("DEBUG first-record field names:", sorted(messages[0].keys()), file=sys.stderr)
            meta = messages[0].get("meta")
            if isinstance(meta, dict):
                print("DEBUG meta field names:", sorted(meta.keys()), file=sys.stderr)

        oldest_updated = None
        for m in messages:
            added = parse_ts(m.get("dateAdded"))
            updated = parse_ts(m.get("dateUpdated"))
            if updated and (oldest_updated is None or updated < oldest_updated):
                oldest_updated = updated
            if added:
                newest_added = added if newest_added is None else max(newest_added, added)
                oldest_added = added if oldest_added is None else min(oldest_added, added)
            if not added or not (start <= added < end):
                continue
            mid = m.get("id")
            if mid in seen_ids:
                continue
            seen_ids.add(mid)
            m["_added"] = added
            kept.append(m)

        print(f"  page {pages}: {len(messages)} records, oldest dateUpdated "
              f"{oldest_updated.strftime('%Y-%m-%d %H:%M') if oldest_updated else 'n/a'}",
              file=sys.stderr)

        cursor = body.get("nextCursor")
        if not cursor or not messages:
            break
        if oldest_updated and oldest_updated < stop_before:
            break

    stats = {
        "pages": pages,
        "total_reported": total_reported,
        "newest_added": newest_added,
        "oldest_added": oldest_added,
    }
    return kept, stats


# ---------------------------------------------------------------- field extraction

def call_duration(m):
    """Duration in seconds; GHL puts it in different spots depending on version."""
    candidates = [m.get("duration"), m.get("callDuration")]
    meta = m.get("meta")
    if isinstance(meta, dict):
        call = meta.get("call")
        if isinstance(call, dict):
            candidates.append(call.get("duration"))
        candidates.append(meta.get("duration"))
    for c in candidates:
        if c is None or c == "":
            continue
        try:
            return int(float(c))
        except (TypeError, ValueError):
            continue
    return 0


def call_status(m):
    meta = m.get("meta")
    if isinstance(meta, dict) and isinstance(meta.get("call"), dict) and meta["call"].get("status"):
        return meta["call"]["status"]
    return m.get("status") or "unknown"


# ---------------------------------------------------------------- name / tag lookups

class UserNames:
    def __init__(self, api):
        self.api = api
        self.cache = dict(KNOWN_USERS)

    def name(self, user_id):
        if not user_id:
            return "(no user)"
        if user_id in self.cache:
            return self.cache[user_id]
        resp = self.api.get(f"/users/{user_id}", USERS_VERSION)
        name = None
        if resp.status_code == 200:
            body = resp.json()
            # Keep only the name; discard the rest of the response.
            name = body.get("name") or " ".join(
                p for p in (body.get("firstName"), body.get("lastName")) if p) or None
        self.cache[user_id] = name or f"(unknown {user_id[:6]})"
        return self.cache[user_id]


class PartnerFilter:
    def __init__(self, api):
        self.api = api
        self.cache = {}

    def is_partner(self, contact_id):
        if not contact_id:
            return False
        if contact_id not in self.cache:
            resp = self.api.get(f"/contacts/{contact_id}", CONTACTS_VERSION)
            tags = []
            if resp.status_code == 200:
                body = resp.json()
                tags = (body.get("contact") or body).get("tags") or []
            self.cache[contact_id] = any("partner" in str(t).lower() for t in tags)
        return self.cache[contact_id]


# ---------------------------------------------------------------- output

def write_csv(path, rows):
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=CSV_COLUMNS)
        w.writeheader()
        w.writerows(rows)


def print_counter(title, counter, order=None):
    print(f"\n{title}")
    keys = order if order is not None else sorted(counter, key=lambda k: (-counter[k], str(k)))
    for k in keys:
        print(f"  {k:<28} {counter.get(k, 0)}")


def fmt_hms(seconds):
    h, rem = divmod(int(seconds), 3600)
    mnt, s = divmod(rem, 60)
    return f"{h}h {mnt:02d}m {s:02d}s"


def summarize(rows):
    print(f"\nTotal calls: {len(rows)}")

    by_day = Counter(r["day"] for r in rows)
    print_counter("Calls by day", by_day, sorted(by_day))
    print_counter("Calls by user", Counter(r["userName"] for r in rows))
    print_counter("Calls by direction", Counter(r["direction"] for r in rows))
    print_counter("Calls by status", Counter(r["status"] for r in rows))

    out_completed = [r for r in rows
                     if r["direction"] == "outbound" and r["status"] == "completed"]
    short = sum(1 for r in out_completed if r["duration_seconds"] < SHORT_CALL_SECONDS)
    long_ = len(out_completed) - short
    print(f"\nOutbound 'completed' calls: {len(out_completed)}")
    print(f"  < {SHORT_CALL_SECONDS}s  (likely not real conversations): {short}")
    print(f"  >= {SHORT_CALL_SECONDS}s: {long_}")

    talk = [r["duration_seconds"] for r in rows if r["duration_seconds"] >= SHORT_CALL_SECONDS]
    print(f"\nCalls >= {SHORT_CALL_SECONDS}s (all directions/statuses): {len(talk)}")
    if talk:
        print(f"  total talk time:   {fmt_hms(sum(talk))}")
        print(f"  average talk time: {fmt_hms(sum(talk) / len(talk))}")

    by_hour = Counter(r["hour"] for r in rows)
    print("\nCalls by hour of day (Phoenix)")
    for h in range(24):
        if by_hour.get(h):
            print(f"  {h:02d}:00  {by_hour[h]}")


# ---------------------------------------------------------------- main

def default_start():
    now = datetime.now(TZ)
    monday = now - timedelta(days=now.weekday())
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--start", type=lambda s: parse_when(s),
                    help="window start, Phoenix time: YYYY-MM-DD[ HH:MM] (default: Monday 00:00 this week)")
    ap.add_argument("--end", type=lambda s: parse_when(s, end=True),
                    help="window end, Phoenix time: YYYY-MM-DD[ HH:MM] or 'now' (date-only = through end of that day; default: now)")
    ap.add_argument("--out", default="calls.csv", help="CSV output path (default: calls.csv)")
    ap.add_argument("--partner-only", action="store_true",
                    help="keep only calls whose contact has a tag containing 'partner'")
    ap.add_argument("--debug-fields", action="store_true",
                    help="print field NAMES (never values) of the first export record to stderr")
    ap.add_argument("--base-url", default=BASE_URL, help=argparse.SUPPRESS)
    args = ap.parse_args()

    token = os.environ.get("GHL_TOKEN")
    if not token:
        sys.exit("GHL_TOKEN is not set.")

    start = args.start or default_start()
    end = args.end or datetime.now(TZ)
    if end <= start:
        sys.exit("--end must be after --start")

    print(f"Window (America/Phoenix): {start:%Y-%m-%d %H:%M} -> {end:%Y-%m-%d %H:%M}",
          file=sys.stderr)
    api = GHL(token, args.base_url)
    records, stats = fetch_calls(api, start, end, args.debug_fields)

    users = UserNames(api)
    partners = PartnerFilter(api) if args.partner_only else None
    rows = []
    for m in sorted(records, key=lambda r: r["_added"]):
        if partners and not partners.is_partner(m.get("contactId")):
            continue
        added = m["_added"]
        uid = m.get("userId")
        rows.append({
            "id": m.get("id"),
            "dateAdded_local": added.strftime("%Y-%m-%d %H:%M:%S"),
            "day": added.strftime("%Y-%m-%d"),
            "hour": added.hour,
            "direction": m.get("direction") or "unknown",
            "status": call_status(m),
            "duration_seconds": call_duration(m),
            "userId": uid or "",
            "userName": users.name(uid),
            "from": m.get("from") or "",
            "to": m.get("to") or "",
            "conversationId": m.get("conversationId") or "",
            "contactId": m.get("contactId") or "",
        })

    write_csv(args.out, rows)
    print(f"\nWrote {len(rows)} rows to {args.out}")
    if args.partner_only:
        print(f"(--partner-only: {len(records)} calls in window before the tag filter)")
    summarize(rows)

    fmt = lambda d: d.strftime("%Y-%m-%d %H:%M") if d else "n/a"
    print("\nSanity check")
    print(f"  export pages fetched:   {stats['pages']}")
    print(f"  export total reported:  {stats['total_reported']}")
    print(f"  newest dateAdded seen:  {fmt(stats['newest_added'])}")
    print(f"  oldest dateAdded seen:  {fmt(stats['oldest_added'])}")


if __name__ == "__main__":
    main()
