from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth.security import get_current_user
from data.database import (
    complete_study_session,
    get_or_create_study_session_for_material,
    get_or_create_research_participant,
    get_study_session,
    record_completed_video,
)
from data.models_orm import User


router = APIRouter(prefix="/api/research", tags=["Research Study"])


class CreateStudySessionRequest(BaseModel):
    course_id: str | None = None
    module_id: str | None = None
    video_id: str | None = None


class CompleteStudySessionRequest(BaseModel):
    completion_status: str = "completed"


class CompleteStudyVideoRequest(BaseModel):
    transcript_text: str = ""


@router.get("/participant")
async def get_participant(current_user: User = Depends(get_current_user)):
    return get_or_create_research_participant(current_user.id)


@router.post("/study-sessions")
async def start_study_session(
    request: CreateStudySessionRequest,
    current_user: User = Depends(get_current_user),
):
    return get_or_create_study_session_for_material(
        current_user.id,
        course_id=request.course_id,
        module_id=request.module_id,
        video_id=request.video_id,
    )


@router.get("/study-sessions/{study_session_id}")
async def read_study_session(
    study_session_id: str,
    current_user: User = Depends(get_current_user),
):
    session = get_study_session(study_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    if session["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not your study session")
    return session


@router.post("/study-sessions/{study_session_id}/videos/{video_id}/complete")
async def complete_study_video(
    study_session_id: str,
    video_id: str,
    request: CompleteStudyVideoRequest,
    current_user: User = Depends(get_current_user),
):
    """Record a terminal video-completion event for assessment evidence."""
    try:
        return record_completed_video(
            study_session_id=study_session_id,
            user_id=current_user.id,
            video_id=video_id,
            transcript_text=request.transcript_text,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))


@router.post("/study-sessions/{study_session_id}/complete")
async def finish_study_session(
    study_session_id: str,
    request: CompleteStudySessionRequest,
    current_user: User = Depends(get_current_user),
):
    session = get_study_session(study_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    if session["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not your study session")
    if request.completion_status == "completed":
        raise HTTPException(
            status_code=409,
            detail="Study sessions are completed automatically after the tenth assessment response succeeds.",
        )
    return complete_study_session(study_session_id, request.completion_status)
