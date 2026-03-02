"""
============================================================
ROUTER: Gamification — Leaderboard, Challenges, Notifications
Endpoints:
    GET /api/leaderboard
    GET /api/challenges/daily
    GET /api/notifications
============================================================
"""

from fastapi import APIRouter
from schemas.models import LeaderboardEntry, DailyChallenge, Notification
from data.database import get_leaderboard, get_daily_challenges, get_notifications

router = APIRouter(prefix="/api", tags=["Gamification"])


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def leaderboard():
    """Get global leaderboard ranked by XP."""
    return get_leaderboard()


@router.get("/challenges/daily", response_model=list[DailyChallenge])
async def daily_challenges():
    """Get today's daily challenges with progress."""
    return get_daily_challenges()


@router.get("/notifications", response_model=list[Notification])
async def notifications(student_id: str = "student_001"):
    """Get notifications for a student."""
    return get_notifications(student_id)
