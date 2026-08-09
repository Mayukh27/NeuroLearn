"""
============================================================
ROUTER: Student — Profile, XP, Badges
Endpoints:
    GET  /api/student/profile   (auth required — returns YOUR profile)
    POST /api/student/xp        (auth required — awards XP to YOU)
============================================================
FIX (auth request): both endpoints previously trusted a client-supplied
student_id with no verification — any caller could read or credit XP to
any other student by simply passing a different id. Both now derive
identity from the JWT (Depends(get_current_user)) instead.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from schemas.models import StudentProfile, XPAwardRequest, XPAwardResponse
from data.db import get_db
from data.database import _user_to_dict
from data.models_orm import User
from auth.security import get_current_user

router = APIRouter(prefix="/api/student", tags=["Student"])


@router.get("/profile", response_model=StudentProfile)
async def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the authenticated student's profile (badges, XP, streak, live rank)."""
    return StudentProfile(**_user_to_dict(current_user, db))


@router.post("/xp", response_model=XPAwardResponse)
async def award_xp(
    request: XPAwardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Award XP to the authenticated student. Handles level-up logic.
    `request.student_id` is accepted for backward compatibility with the
    existing frontend/schema but is IGNORED for authorization purposes —
    XP is always credited to whoever the JWT identifies, never to an
    arbitrary id an unauthenticated or malicious caller could supply.
    """
    new_xp = current_user.xp + request.amount
    leveled_up = False
    new_level = current_user.level
    xp_to_next = current_user.xp_to_next_level

    if new_xp >= xp_to_next:
        leveled_up = True
        new_level += 1
        new_xp -= xp_to_next
        xp_to_next = int(xp_to_next * 1.2)  # 20% more XP per level

    current_user.xp = new_xp
    current_user.level = new_level
    current_user.xp_to_next_level = xp_to_next
    db.commit()

    return XPAwardResponse(
        new_xp=new_xp,
        new_level=new_level,
        leveled_up=leveled_up,
        xp_to_next_level=xp_to_next,
    )
