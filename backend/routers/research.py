from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth.security import get_current_user
from data.database import (
    complete_study_session,
    create_study_session,
    get_or_create_study_session_for_material,
    get_or_create_research_participant,
    get_study_session,
    save_prepost_results,
)
from data.models_orm import User


router = APIRouter(prefix="/api/research", tags=["Research Study"])


class CreateStudySessionRequest(BaseModel):
    course_id: str | None = None
    module_id: str | None = None
    video_id: str | None = None


class CompleteStudySessionRequest(BaseModel):
    completion_status: str = "completed"


class PrePostQuestionResult(BaseModel):
    question_id: str
    question_index: int
    correctness: bool | None = None
    response_time_seconds: float | None = None
    score: float | None = None
    started_at: str | None = None
    completed_at: str | None = None


class SavePrePostRequest(BaseModel):
    test_type: str
    responses: list[PrePostQuestionResult]


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
    return complete_study_session(study_session_id, request.completion_status)


@router.post("/study-sessions/{study_session_id}/prepost")
async def save_prepost(
    study_session_id: str,
    request: SavePrePostRequest,
    current_user: User = Depends(get_current_user),
):
    session = get_study_session(study_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    if session["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not your study session")
    try:
        return save_prepost_results(
            study_session_id,
            request.test_type,
            [r.model_dump() for r in request.responses],
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
