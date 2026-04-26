"""
============================================================
SCRAPING MODULE: Content Discovery Pipeline
File: backend/scraping/pipeline.py

Orchestrates the full auto-course generation flow:
  1. Accept topic input
  2. Invoke YouTube scraper
  3. Clean, deduplicate, rank results
  4. Return structured video list ready for DB insertion
  5. (Optionally) trigger downstream transcription + assessment

Designed as a modular, replaceable component — the scraper
implementation can be swapped without touching this file.
============================================================
"""

import re
import uuid
import time
from typing import Optional
from loguru import logger

from scraping.youtube_scraper import scrape_youtube, ScrapedVideo


# ── Config ───────────────────────────────────────────────────

DEFAULT_MAX_VIDEOS = 5
MIN_VIDEOS_THRESHOLD = 1      # Minimum acceptable results before warning


# ── Cleaning Helpers ─────────────────────────────────────────

_NOISE_PATTERNS = [
    re.compile(r"\s*\|\s*.*$"),          # Remove "| Channel Name" suffixes
    re.compile(r"\s*-\s*youtube\s*$", re.I),
    re.compile(r"\s*\(official.*?\)", re.I),
    re.compile(r"\s*\[.*?\]"),           # Remove [brackets]
    re.compile(r"\s{2,}"),              # Collapse extra whitespace
]


def _clean_title(title: str) -> str:
    """Strip noisy suffixes / brackets from video titles."""
    cleaned = title
    for pattern in _NOISE_PATTERNS:
        cleaned = pattern.sub(" ", cleaned)
    return cleaned.strip()


def _deduplicate(videos: list[ScrapedVideo]) -> list[ScrapedVideo]:
    """
    Remove duplicate videos by video_id.
    Also removes near-duplicate titles (same first 40 chars).
    """
    seen_ids: set[str] = set()
    seen_title_prefixes: set[str] = set()
    unique: list[ScrapedVideo] = []

    for video in videos:
        if video.video_id in seen_ids:
            continue
        title_prefix = video.title[:40].lower().strip()
        if title_prefix in seen_title_prefixes:
            continue
        seen_ids.add(video.video_id)
        seen_title_prefixes.add(title_prefix)
        unique.append(video)

    return unique


def _rank_videos(videos: list[ScrapedVideo], topic: str) -> list[ScrapedVideo]:
    """
    Heuristic ranking — prefer videos that:
      - Mention the topic in the title
      - Have a reasonable duration (5 min – 2 hr)
      - Come from recognisable educational channels
    Returns sorted list (best first).
    """
    topic_words = set(topic.lower().split())

    EDUCATIONAL_CHANNELS = {
        "mit opencourseware", "stanford", "khan academy", "freeCodeCamp",
        "traversy media", "fireship", "sentdex", "3blue1brown", "numberphile",
        "computerphile", "tech with tim", "corey schafer", "programming with mosh",
        "the coding train", "crash course", "neso academy", "gate smashers",
        "jenny's lectures", "abdul bari",
    }

    def _score(v: ScrapedVideo) -> float:
        score = 0.0
        title_lower = v.title.lower()

        # Topic keyword overlap
        matched_words = sum(1 for w in topic_words if w in title_lower)
        score += matched_words * 2.0

        # Duration sweet spot: 5 min–2 hr
        if 300 <= v.duration_seconds <= 7200:
            score += 1.5
        elif v.duration_seconds > 0:
            score += 0.5

        # Educational channel bonus
        chan_lower = v.channel.lower()
        if any(ec in chan_lower for ec in EDUCATIONAL_CHANNELS):
            score += 2.0

        # Prefer results that have a valid thumbnail
        if v.thumbnail:
            score += 0.5

        return score

    return sorted(videos, key=_score, reverse=True)


# ── Video → API Structure ─────────────────────────────────────

def _video_to_api_dict(video: ScrapedVideo, order: int, topic: str) -> dict:
    """
    Convert a ScrapedVideo into the VideoLink-compatible dict
    used by the existing NeuroLearn Course schema.
    """
    video_db_id = f"auto_{video.video_id}"
    return {
        "id": video_db_id,
        "title": _clean_title(video.title),
        "url": video.url,
        "duration": video.duration_seconds or 600,   # default 10 min if unknown
        "thumbnail": video.thumbnail,
        "order": order,
        "completed": False,
        "watched_percent": 0.0,
        "channel": video.channel,
        "source": video.source,
        "assessment_available": True,       # Pipeline will generate one
        "transcription_available": False,   # Set True after Whisper processes it
        "scraped_for_topic": topic,
    }


# ── Public Pipeline Function ──────────────────────────────────

def discover_content(
    topic: str,
    max_videos: int = DEFAULT_MAX_VIDEOS,
) -> dict:
    """
    Main entry point for the auto-course generation pipeline.

    Args:
        topic:      Educational topic, e.g. "Operating Systems"
        max_videos: How many videos to include (3–5 recommended)

    Returns:
        {
            "course_id": "auto_<uuid>",
            "course_title": "Operating Systems",
            "topic": "Operating Systems",
            "videos": [ { VideoLink dict }, ... ],
            "total_found": int,
            "generated_at": float (unix timestamp),
            "status": "success" | "partial" | "failed",
        }
    """
    logger.info(f"[Pipeline] Starting content discovery for topic: '{topic}'")
    start_time = time.time()

    # ── Step 1: Scrape ──
    raw_videos: list[ScrapedVideo] = scrape_youtube(topic, max_results=max_videos * 2)

    # ── Step 2: Deduplicate ──
    deduped = _deduplicate(raw_videos)
    logger.info(f"[Pipeline] After dedup: {len(deduped)} unique videos (from {len(raw_videos)} raw)")

    # ── Step 3: Rank ──
    ranked = _rank_videos(deduped, topic)

    # ── Step 4: Trim to requested count ──
    final_videos = ranked[:max_videos]

    # ── Step 5: Build API-ready structures ──
    video_dicts = [
        _video_to_api_dict(v, idx + 1, topic)
        for idx, v in enumerate(final_videos)
    ]

    elapsed = round(time.time() - start_time, 2)
    status = "success" if len(final_videos) >= MIN_VIDEOS_THRESHOLD else "failed"
    if 0 < len(final_videos) < MIN_VIDEOS_THRESHOLD:
        status = "partial"

    logger.info(f"[Pipeline] Done in {elapsed}s — status={status}, videos={len(final_videos)}")

    return {
        "course_id": f"auto_{uuid.uuid4().hex[:10]}",
        "course_title": topic.title(),
        "topic": topic,
        "description": f"Auto-generated course on '{topic.title()}' using web-sourced educational videos.",
        "icon": "🎓",
        "category": "Auto-Generated",
        "difficulty": "Intermediate",
        "tags": topic.lower().split() + ["auto-generated"],
        "videos": video_dicts,
        "total_found": len(final_videos),
        "generated_at": start_time,
        "elapsed_seconds": elapsed,
        "status": status,
    }
