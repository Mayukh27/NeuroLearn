"""
============================================================
ROUTER: Student — Profile, XP, Badges
Endpoints:
    GET  /api/student/profile
    POST /api/student/xp
============================================================
"""

from fastapi import APIRouter, HTTPException
from schemas.models import StudentProfile, XPAwardRequest, XPAwardResponse
from data.database import get_student, update_student

router = APIRouter(prefix="/api/student", tags=["Student"])


@router.get("/profile", response_model=StudentProfile)
async def get_profile(student_id: str = "student_001"):
    """Get student profile with badges, XP, streak, etc."""
    student = get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.post("/xp", response_model=XPAwardResponse)
async def award_xp(request: XPAwardRequest):
    """Award XP to a student. Handles level-up logic."""
    student = get_student(request.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_xp = student["xp"] + request.amount
    leveled_up = False
    new_level = student["level"]
    xp_to_next = student["xp_to_next_level"]

    if new_xp >= xp_to_next:
        leveled_up = True
        new_level += 1
        new_xp -= xp_to_next
        xp_to_next = int(xp_to_next * 1.2)  # 20% more XP per level

    update_student(request.student_id, {
        "xp": new_xp,
        "level": new_level,
        "xp_to_next_level": xp_to_next,
    })

    return XPAwardResponse(
        new_xp=new_xp,
        new_level=new_level,
        leveled_up=leveled_up,
        xp_to_next_level=xp_to_next,
    )
