#!/usr/bin/env python3
"""
build-listings.py — Outscraper CSV → listings.json for havasu.boats
====================================================================
Reads the raw Outscraper export and normalizes it to our directory schema.

Job of this script (deterministic, re-runnable):
  1. Load CSV, drop the ~100 columns we don't need, keep the 15ish that map
     to our Listing schema.
  2. Classify each row into service tags (rentals / sales / marinas / storage
     / tour / other) from Google's `category` and `subtypes` fields.
  3. Filter out categories that are noise from broad queries (vacation
     rentals, hotels, real estate, etc.) — flagged, not silently dropped.
  4. Deduplicate on google_id / place_id.
  5. Emit two files:
        data/listings.json  — the clean data the Next.js site renders from
        data/review.json    — the flagged rows for your eyes-on pass
  6. Storage listings are IMPORTED but marked isActive=false so no category
     page renders for them yet (Storage is deferred launch).

Design principle: this is a normalization script, not a classifier. The
Outscraper query already vetted these as boat-related. Our job is mapping,
not judging.

Run:
    python3 scripts/build-listings.py path/to/outscraper.csv
"""
from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path
from typing import Any

# ── Config ──────────────────────────────────────────────────────────────────
# Which Outscraper columns feed which schema fields. Everything else dropped.
COLUMN_MAP = {
    "name": "name",
    "phone": "phone",
    "website": "website",
    "address": "address",
    "city": "city_raw",
    "state_code": "state",
    "postal_code": "zip",
    "latitude": "lat",
    "longitude": "lng",
    "working_hours": "hours_json",
    "rating": "rating",
    "reviews": "review_count",
    "photo": "photo",
    "about": "about_json",
    "description": "gmb_description",
    "subtypes": "subtypes",
    "category": "gmb_category",
    "email": "email",
    "place_id": "place_id",
    "google_id": "google_id",
    "verified": "gmb_verified",
    "booking_appointment_link": "booking_url",
    "reservation_links": "reservation_links",
}

# Category → service tag classification. Order matters: first match wins for
# the *primary* service, but every matching tag is added to `services[]`.
# The classification key is normalized-lowercase.
CATEGORY_TO_SERVICES = {
    # RENTALS
    "boat rental service": ["rentals"],
    "water sports equipment rental service": ["rentals"],
    "canoe & kayak rental service": ["rentals"],
    "ski rental service": ["rentals"],
    "water ski shop": ["rentals"],  # borderline — often rents + retails
    # TOURS (tag as rentals-adjacent for now, distinguished by boat_types)
    "boat tour agency": ["tours"],
    # SALES
    "boat dealer": ["sales"],
    # MARINAS
    "marina": ["marina"],
    # STORAGE (deferred — imported dormant)
    "boat storage facility": ["dry-storage"],
    "rv storage facility": ["lot-storage"],
    "storage facility": ["lot-storage"],
    # REPAIR (dormant category)
    "boat repair shop": ["repair"],
    # OUTDOOR / SPORTS retail (borderline — often carry gear)
    "outdoor sports store": ["retail"],
}

# Categories that leak into broad boat queries but AREN'T boat businesses.
# Flagged for the review file, kept out of the launch data.
NOISE_CATEGORIES = {
    "vacation home rental agency",
    "real estate rental agency",
    "property management company",
    "hotels",
    "travel agency",
    "attractions",  # too vague; many are worth manual review
}

# Which service tags produce a live category page at launch.
# Storage/repair/tours are imported but hidden until you're ready.
LAUNCH_CATEGORIES = {"rentals", "sales", "marina"}

# Boat-type inference from name and subtypes. Cheap, imperfect, but useful
# for filtering. Add more patterns as you see the data.
BOAT_TYPE_PATTERNS = [
    ("pwc",           r"\b(jet\s*ski|waverunner|pwc|wave runner|sea[-\s]?doo)\b"),
    ("pontoon",       r"\bpontoon(s)?\b"),
    ("wakeboard-ski", r"\b(wake(board)?|ski\s*boat|surf\s*boat|malibu|mastercraft)\b"),
    ("kayak",         r"\bkayak(s)?\b"),
    ("paddleboard",   r"\b(paddle\s*board|sup)\b"),
    ("fishing",       r"\b(fishing|bass\s*boat)\b"),
    ("houseboat",     r"\bhouse\s*boat(s)?\b"),
    ("performance",   r"\b(cigarette|go[-\s]?fast|performance boat)\b"),
    ("cruiser",       r"\b(cabin cruiser|yacht)\b"),
]

# Town normalization → our controlled Town vocabulary.
TOWN_MAP = {
    "lake havasu city": "lake-havasu-city",
    "parker":           "parker",
    "bullhead city":    "bullhead-city",
    "laughlin":         "laughlin",
    "needles":          "needles",
    "havasu lake":      "lake-havasu-city",  # tiny CA hamlet across the lake; roll into main town for search
}


# ── Helpers ─────────────────────────────────────────────────────────────────

def slugify(s: str) -> str:
    """Turn a business name into a URL slug."""
    s = s.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-")


def norm_town(city_raw: str | None) -> str | None:
    if not city_raw:
        return None
    return TOWN_MAP.get(city_raw.strip().lower())


def parse_hours(hours_json_str: str | None) -> str | None:
    """Outscraper stores hours as a JSON string. Return a compact human string
    for display, or None if the shop is 24/7 or format is weird."""
    if not hours_json_str or hours_json_str.strip() in ("", "None"):
        return None
    try:
        obj = json.loads(hours_json_str)
    except json.JSONDecodeError:
        return None
    # Compact form: "Mon-Sun 8AM-6PM" when uniform, else per-day
    days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    entries = [obj.get(d, ["Closed"]) for d in days]
    entries_str = [",".join(e) if isinstance(e, list) else str(e) for e in entries]
    if len(set(entries_str)) == 1:
        return f"Daily {entries_str[0]}"
    # Compact if weekdays uniform and weekend uniform
    wd, sat, sun = entries_str[:5], entries_str[5], entries_str[6]
    if len(set(wd)) == 1 and sat == sun:
        return f"Mon-Fri {wd[0]}, Sat-Sun {sat}"
    return "; ".join(f"{d[:3]} {entries_str[i]}" for i, d in enumerate(days))


def infer_boat_types(name: str, subtypes: str, gmb_desc: str) -> list[str]:
    """Best-effort boat-type tagging from the text signals we have."""
    text = f"{name} {subtypes} {gmb_desc or ''}".lower()
    found = []
    for tag, pattern in BOAT_TYPE_PATTERNS:
        if re.search(pattern, text):
            found.append(tag)
    return found


def classify(gmb_category: str, subtypes: str) -> tuple[list[str], bool]:
    """Return (service_tags, is_noise). Multiple tags possible (e.g. a boat
    dealer that also rents shows subtypes 'Boat rental service, Boat dealer'
    → gets both tags).

    Fuzzy-category handling: if Google's PRIMARY category is noise
    (attractions, hotels, real estate) but the SUBTYPES contain a real boat
    category, we recover the listing — the boat business is real, Google
    just picked the wrong primary label. This is the exact miscategorization
    problem that broke earlier scrape passes.
    """
    subtype_list = [s.strip() for s in (subtypes or "").split(",") if s.strip()]
    services: list[str] = []
    seen: set[str] = set()

    for c in [gmb_category] + subtype_list:
        for t in CATEGORY_TO_SERVICES.get((c or "").strip().lower(), []):
            if t not in seen:
                services.append(t)
                seen.add(t)

    # is_noise means DROP this listing. Only drop if BOTH the primary is
    # noise AND no valid boat subtype rescued it.
    primary_is_noise = (gmb_category or "").strip().lower() in NOISE_CATEGORIES
    is_noise = primary_is_noise and not services
    return services, is_noise


def to_float(v: Any) -> float | None:
    try:
        f = float(v)
        return f if f == f else None  # filter NaN
    except (TypeError, ValueError):
        return None


def to_int(v: Any) -> int | None:
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


def clean_str(v: Any) -> str | None:
    if v is None:
        return None
    s = str(v).strip()
    if not s or s.lower() in ("nan", "none"):
        return None
    return s


# ── Main ────────────────────────────────────────────────────────────────────

def normalize_row(row: dict[str, str]) -> dict[str, Any]:
    """Transform one Outscraper row into a Listing dict."""
    # Rename to our internal names
    r = {new: clean_str(row.get(old)) for old, new in COLUMN_MAP.items()}

    name = r["name"] or ""
    town = norm_town(r["city_raw"])
    services, is_noise = classify(r["gmb_category"] or "", r["subtypes"] or "")
    boat_types = infer_boat_types(name, r["subtypes"] or "", r["gmb_description"] or "")

    # Build a short description from what we have — prefer the GMB `about`
    # descriptor if present, else the first sentence of gmb_description.
    description = None
    if r["gmb_description"]:
        # Take first ~200 chars, cut at sentence boundary if possible
        d = r["gmb_description"]
        cut = d[:220]
        if "." in cut:
            cut = cut[: cut.rfind(".") + 1]
        description = cut

    listing = {
        "id": clean_str(r["place_id"]) or slugify(name),
        "slug": slugify(name),
        "name": name,
        "description": description,
        "town": town,
        "address": r["address"],
        "phone": r["phone"],
        "email": r["email"] if r.get("email") else None,
        "website": r["website"],
        "bookingUrl": r["booking_url"] or (
            r["reservation_links"].split(",")[0].strip()
            if r["reservation_links"] else None
        ),
        "hours": parse_hours(r["hours_json"]),
        "lat": to_float(r["lat"]),
        "lng": to_float(r["lng"]),
        "services": services,
        "boatTypes": boat_types,
        "rating": to_float(r["rating"]),
        "reviewCount": to_int(r["review_count"]),
        "photo": r["photo"],
        "verified": (r["gmb_verified"] or "").strip().upper() == "TRUE",
        "isFeatured": False,
        "isClaimed": False,
        # Storage-only listings are imported dormant until Storage launches.
        "isActive": any(s in LAUNCH_CATEGORIES for s in services),
        # Metadata for auditing / de-noising
        "_meta": {
            "gmb_category": r["gmb_category"],
            "subtypes": r["subtypes"],
            "is_noise": is_noise,
            "no_services_matched": not services,
            "town_unmatched": town is None,
        },
    }
    return listing


def main(csv_path: str) -> None:
    root = Path(__file__).resolve().parent.parent
    data_dir = root / "data"
    data_dir.mkdir(exist_ok=True)

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Read {len(rows)} rows from {csv_path}")

    # Dedupe on place_id (or google_id) — same business surfacing on
    # multiple search queries.
    seen_ids: set[str] = set()
    listings: list[dict[str, Any]] = []
    review: list[dict[str, Any]] = []
    dupes_dropped = 0

    for row in rows:
        pid = (row.get("place_id") or row.get("google_id") or "").strip()
        if pid and pid in seen_ids:
            dupes_dropped += 1
            continue
        if pid:
            seen_ids.add(pid)

        listing = normalize_row(row)
        meta = listing["_meta"]

        if meta["is_noise"]:
            review.append({**listing, "_reason": "noise_category"})
            continue
        if meta["no_services_matched"]:
            review.append({**listing, "_reason": "no_services_matched"})
            continue
        if meta["town_unmatched"]:
            review.append({**listing, "_reason": "town_unmatched"})
            continue

        # Strip the _meta before writing to the public data file
        listing.pop("_meta", None)
        listings.append(listing)

    # ── Write output ────────────────────────────────────────────────────────
    (data_dir / "listings.json").write_text(
        json.dumps(listings, indent=2, ensure_ascii=False)
    )
    (data_dir / "review.json").write_text(
        json.dumps(review, indent=2, ensure_ascii=False)
    )

    # ── Summary ─────────────────────────────────────────────────────────────
    from collections import Counter
    service_counts: Counter[str] = Counter()
    town_counts: Counter[str] = Counter()
    for l in listings:
        for s in l["services"]:
            service_counts[s] += 1
        town_counts[l["town"] or "?"] += 1
    active = sum(1 for l in listings if l["isActive"])

    print("─" * 60)
    print(f"Deduped:   {dupes_dropped} duplicate rows dropped")
    print(f"Published: {len(listings)} listings → data/listings.json")
    print(f"  Active (visible on site):  {active}")
    print(f"  Dormant (Storage/etc.):    {len(listings) - active}")
    print(f"Flagged:   {len(review)} rows → data/review.json (needs your eyes)")
    print()
    print("By service tag:")
    for s, n in service_counts.most_common():
        launch = " (LIVE)" if s in LAUNCH_CATEGORIES else " (dormant)"
        print(f"  {s:16s} {n:3d}{launch}")
    print()
    print("By town:")
    for t, n in town_counts.most_common():
        print(f"  {t:20s} {n:3d}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 build-listings.py <outscraper.csv>", file=sys.stderr)
        sys.exit(1)
    main(sys.argv[1])
