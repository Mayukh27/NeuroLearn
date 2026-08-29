"""Assessment orchestration for the fixed mixed-method research protocol.

One study session produces one 10-item assessment: MCRF chooses the
difficulties for questions 1--5, then LEGACY chooses questions 6--10.  The
engines themselves remain in :mod:`ml.adaptive_engine`; this router owns only
their protocol, evidence flow, and durable study logging.
"""

from __future__ import annotations

import re
import time
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.security import get_current_user
from data.database import (
    advance_challenge_progress,
    apply_xp,
    complete_study_session,
    get_canonical_assessment_session_for_study,
    get_completed_video_behavioral_score,
    get_completed_video_context,
    get_or_create_active_study_session,
    get_recent_scores_pct,
    get_student_results,
    get_assessment_session,
    refresh_behavioral_summary,
    save_assessment_result,
    save_assessment_session,
    save_crs_record,
    save_generated_questions,
    save_research_crs_decision,
    save_research_legacy_decision,
    save_single_question_response,
    update_assessment_adaptive_state,
)
from data.db import get_db
from data.models_orm import User
from ml import adaptive_engine, question_generator
from schemas.models import (
    AssessmentResult,
    AssessmentSession,
    GenerateAssessmentRequest,
    SubmitAdaptiveAnswerRequest,
    SubmitAssessmentRequest,
)


router = APIRouter(prefix="/api/assessment", tags=["Assessment"])

TOTAL_QUESTIONS = 10
MCRF_QUESTION_COUNT = 5
METHOD_SEQUENCE = ["MCRF"] * MCRF_QUESTION_COUNT + ["LEGACY"] * (TOTAL_QUESTIONS - MCRF_QUESTION_COUNT)
PER_QUESTION_TIME_LIMIT_SECONDS = 42
TIME_LIMIT_SECONDS = TOTAL_QUESTIONS * PER_QUESTION_TIME_LIMIT_SECONDS


def _apply_xp(user: User, amount: int, db: Session) -> dict:
    xp_result = apply_xp(user, amount)
    db.commit()
    return xp_result


def _method_for_question(question_index: int) -> str:
    if not 0 <= question_index < TOTAL_QUESTIONS:
        raise ValueError(f"Question index must be between 0 and {TOTAL_QUESTIONS - 1}")
    return METHOD_SEQUENCE[question_index]


def _question_text_key(question: dict) -> str:
    return re.sub(r"\s+", " ", str(question.get("question", "")).strip().casefold())


def _generate_unique_question(
    *,
    transcript_text: str,
    difficulty: str,
    topic_id: str,
    existing_questions: list[dict],
    method: str,
    question_index: int,
) -> dict:
    """Generate exactly one new, non-duplicate item for the current session."""
    existing_ids = {str(question.get("id")) for question in existing_questions}
    existing_texts = {_question_text_key(question) for question in existing_questions}
    for _ in range(20):
        generated = question_generator.generate_questions(
            transcript_text=transcript_text,
            difficulty=difficulty,
            num_questions=1,
            topic_id=topic_id,
        )
        if not generated:
            continue
        question = dict(generated[0])
        if question.get("id") in existing_ids or _question_text_key(question) in existing_texts:
            continue
        question["adaptive_method"] = method
        question["decision_index"] = question_index + 1
        return question
    raise HTTPException(
        status_code=503,
        detail="Could not generate a unique question for this assessment. Please retry later.",
    )


def _assessment_score(responses: list[dict]) -> float:
    answered = [response for response in responses if response.get("correctness") is not None]
    if not answered:
        return 0.0
    return round(100.0 * sum(bool(response["correctness"]) for response in answered) / len(answered), 1)


def _responses_for_method(responses: list[dict], method: str) -> list[dict]:
    return [response for response in responses if response.get("condition") == method]


def _decision_for_question(
    *,
    question_index: int,
    student_id: str,
    session: dict,
    durable_scores: list[float],
    responses: list[dict],
) -> dict:
    """Ask the method assigned to *this* question for its difficulty.

    MCRF receives the completed-video B/C evidence plus cumulative assessment
    performance and response timing.  LEGACY deliberately receives only the
    traditional score/history/timing inputs; video behavioral evidence,
    transcript complexity, and CRS are not passed into its baseline path.
    """
    method = _method_for_question(question_index)
    if question_index == 0:
        return adaptive_engine.get_initial_difficulty(
            student_id=student_id,
            attention_score=session["attention_score_during_video"],
            previous_score=durable_scores[-1] if durable_scores else None,
            previous_scores=durable_scores,
            transcript_text=session.get("transcript_text") or "",
        )

    prior_question = session["questions"][question_index - 1]
    prior_difficulty = prior_question.get("difficulty") or session.get("difficulty", "medium")
    completed_for_method = _responses_for_method(responses, method)
    # At the MCRF -> LEGACY boundary no LEGACY item has yet been answered.
    # The baseline's history therefore begins with the assessment performance
    # accumulated so far, as a genuine traditional performance/history input.
    evidence_responses = completed_for_method or responses
    cumulative_score = _assessment_score(evidence_responses)
    timing_values = [
        float(response["response_time_seconds"])
        for response in evidence_responses
        if response.get("response_time_seconds") is not None
    ]
    total_time = sum(timing_values)
    time_limit = PER_QUESTION_TIME_LIMIT_SECONDS * max(len(evidence_responses), 1)
    assessment_history = [
        _assessment_score(evidence_responses[:index + 1])
        for index in range(len(evidence_responses))
    ]
    previous_scores = (durable_scores + assessment_history[:-1])[-5:]
    was_correct = bool(evidence_responses[-1].get("correctness")) if evidence_responses else False

    if method == "LEGACY":
        return adaptive_engine._determine_difficulty_legacy(
            student_id=student_id,
            current_score=cumulative_score,
            # Neutral rather than video-derived: this is the CRS-free
            # performance/history baseline, not an MCRF multimodal decision.
            attention_score=50,
            time_spent=total_time,
            time_limit=time_limit,
            previous_difficulty=prior_difficulty,
            previous_scores=previous_scores,
        )

    return adaptive_engine.determine_difficulty(
        student_id=student_id,
        current_score=cumulative_score,
        attention_score=session["attention_score_during_video"],
        time_spent=total_time,
        time_limit=time_limit,
        previous_difficulty=prior_difficulty,
        previous_scores=previous_scores,
        transcript_text=session.get("transcript_text") or "",
        was_correct=was_correct,
    )


def _record_decision(
    *,
    method: str,
    study_session: dict,
    assessment_session: dict,
    adaptive_result: dict,
    previous_scores: list[float],
    responses: list[dict],
    previous_difficulty: str | None,
    decision_index: int,
) -> None:
    if method == "MCRF":
        crs = adaptive_result.get("crs")
        if not crs:
            raise RuntimeError("MCRF decision did not return a CRS record")
        selected_difficulty = adaptive_result.get("difficulty", adaptive_result.get("next_assessment_difficulty"))
        save_crs_record({
            "student_id": assessment_session["student_id"],
            "study_session_id": study_session["study_session_id"],
            "participant_id": study_session["participant_id"],
            "condition": "MCRF",
            "assessment_id": assessment_session["id"],
            "timestamp": time.time(),
            "performance": crs["components"]["performance"],
            "behavioral_cue": crs["components"]["behavioral_cue"],
            "integrity": crs["components"]["integrity"],
            "trend": crs["components"]["trend"],
            "complexity": crs["components"]["complexity"],
            "crs": crs["score"],
            "difficulty": selected_difficulty,
            "explanation": crs["explanation"],
        })
        save_research_crs_decision(
            study_session=study_session,
            assessment_session=assessment_session,
            adaptive_result={**adaptive_result, "next_assessment_difficulty": selected_difficulty},
            previous_scores=previous_scores,
            per_question_responses=responses,
            previous_difficulty=previous_difficulty or "",
            attention_score=assessment_session["attention_score_during_video"],
            transcript_text=assessment_session.get("transcript_text"),
            decision_index=decision_index,
            method="MCRF",
        )
        return

    save_research_legacy_decision(
        study_session=study_session,
        assessment_session=assessment_session,
        adaptive_result=adaptive_result,
        previous_scores=previous_scores,
        per_question_responses=responses,
        previous_difficulty=previous_difficulty or "",
        current_score=_assessment_score(responses),
        decision_index=decision_index,
        method="LEGACY",
    )


def _result_message(percentage: float) -> tuple[str, list[str]]:
    if percentage >= 90:
        return "Outstanding! You've truly mastered this material!", ["Next: Advanced Topics", "Challenge: Timed Quiz"]
    if percentage >= 70:
        return "Well done! You have a solid understanding.", ["Next: Advanced Topics", "Challenge: Timed Quiz"]
    if percentage >= 50:
        return "Decent effort! Review the videos to strengthen weak areas.", ["Review: Completed Videos", "Practice: Easier Questions"]
    return "Don't worry! Rewatch the completed videos and try again — you'll improve.", ["Review: Completed Videos", "Practice: Easier Questions", "Resource: Study Guide"]


def _finalize_assessment(
    *,
    session: dict,
    study_session: dict,
    state: dict,
    current_user: User,
    db: Session,
) -> dict:
    questions = session.get("questions", [])
    answers = state.get("answers", {})
    if len(questions) != TOTAL_QUESTIONS or len(answers) != TOTAL_QUESTIONS:
        raise RuntimeError("Cannot complete an assessment before all ten protocol questions are answered")
    correct_count = sum(answers.get(question["id"]) == question.get("correct_answer") for question in questions)
    total_points = sum(int(question.get("points", 10)) for question in questions)
    earned_points = sum(int(question.get("points", 10)) for question in questions if answers.get(question["id"]) == question.get("correct_answer"))
    percentage = round((correct_count / TOTAL_QUESTIONS) * 100, 1)
    xp_earned = int(earned_points * 1.5)
    xp_result = _apply_xp(current_user, xp_earned, db)
    if percentage >= 100:
        advance_challenge_progress(current_user.id, "quiz", set_to=1)
    last_adaptive = state.get("last_adaptive_response") or {
        "performance_trend": "stable",
        "recommended_action": "Assessment completed.",
        "next_assessment_difficulty": questions[-1].get("difficulty", "medium"),
        "strength_areas": [],
        "weak_areas": [],
    }
    message, suggested_topics = _result_message(percentage)
    result = {
        "session_id": session["id"],
        "study_session_id": study_session["study_session_id"],
        "participant_id": study_session["participant_id"],
        "condition": "MIXED",
        "student_id": current_user.id,
        "score": percentage,
        "total_points": total_points,
        "earned_points": earned_points,
        "percentage": percentage,
        "xp_earned": xp_earned,
        "total_xp": xp_result["new_xp"],
        "new_level": xp_result["new_level"],
        "leveled_up": xp_result["leveled_up"],
        "time_spent": int(sum(float(response.get("response_time_seconds") or 0) for response in state.get("responses", []))),
        "correct_answers": correct_count,
        "total_questions": TOTAL_QUESTIONS,
        "difficulty": session.get("difficulty", "medium"),
        "message": message,
        "next_difficulty": last_adaptive["next_assessment_difficulty"],
        "suggested_topics": suggested_topics,
        "timestamp": time.time(),
        "adaptive_response": {
            "performance_trend": last_adaptive["performance_trend"],
            "recommended_action": last_adaptive["recommended_action"],
            "next_assessment_difficulty": last_adaptive["next_assessment_difficulty"],
            "strength_areas": last_adaptive["strength_areas"],
            "weak_areas": last_adaptive["weak_areas"],
            # Question 10 is selected by LEGACY; CRS entries for questions
            # 1--5 remain separately and precisely logged.
            "crs": last_adaptive.get("crs"),
        },
        "completion_status": "completed",
    }
    save_assessment_result(result)
    refresh_behavioral_summary(study_session["study_session_id"])
    complete_study_session(study_session["study_session_id"], "completed")
    return result


@router.post("/generate", response_model=AssessmentSession)
async def generate_assessment(
    request: GenerateAssessmentRequest,
    current_user: User = Depends(get_current_user),
):
    """Start or resume the single 10-question mixed-method assessment."""
    request.student_id = current_user.id
    try:
        study_session = get_or_create_active_study_session(
            current_user.id,
            course_id=request.course_id,
            video_id=request.video_id,
            requested_study_session_id=request.study_session_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

    completed_context = get_completed_video_context(study_session["study_session_id"])
    contributing_video_ids = completed_context["contributing_video_ids"]
    if not contributing_video_ids:
        raise HTTPException(status_code=409, detail="Complete at least one video before starting the assessment.")

    existing_session = get_canonical_assessment_session_for_study(study_session["study_session_id"])
    if existing_session and existing_session.get("questions"):
        return existing_session

    # The server-recorded completion rows, not client query parameters, are
    # the sole source of contributing videos and transcript context.
    transcript_text = completed_context["transcript_text"]
    attention_score = get_completed_video_behavioral_score(study_session["study_session_id"])
    durable_scores = get_recent_scores_pct(current_user.id, limit=5)
    initial = _decision_for_question(
        question_index=0,
        student_id=current_user.id,
        session={
            "attention_score_during_video": attention_score,
            "transcript_text": transcript_text,
            "questions": [],
            "difficulty": "medium",
        },
        durable_scores=durable_scores,
        responses=[],
    )
    initial_difficulty = initial["difficulty"]
    question = _generate_unique_question(
        transcript_text=transcript_text,
        difficulty=initial_difficulty,
        topic_id=request.course_id,
        existing_questions=[],
        method="MCRF",
        question_index=0,
    )
    adaptive_metadata = initial["adaptive_metadata"]
    session = {
        "id": f"session_{uuid.uuid4().hex[:12]}",
        "study_session_id": study_session["study_session_id"],
        "participant_id": study_session["participant_id"],
        "condition": "MIXED",
        "course_id": request.course_id,
        "video_id": contributing_video_ids[-1],
        "contributing_video_ids": contributing_video_ids,
        "questions": [question],
        "difficulty": initial_difficulty,
        "time_limit": TIME_LIMIT_SECONDS,
        "attention_score_during_video": attention_score,
        "adaptive_metadata": adaptive_metadata,
        "student_id": current_user.id,
        "transcript_text": transcript_text,
        "adaptive_state": {
            "target_questions": TOTAL_QUESTIONS,
            "method_sequence": METHOD_SEQUENCE,
            "answered_count": 0,
            "answers": {},
            "responses": [],
            "adaptive_metadata": adaptive_metadata,
            "last_adaptive_response": {
                "performance_trend": "stable",
                "recommended_action": adaptive_metadata["reason"],
                "next_assessment_difficulty": initial_difficulty,
                "strength_areas": [],
                "weak_areas": [],
                "crs": initial.get("crs"),
            },
        },
    }
    save_assessment_session(session)
    save_generated_questions(session)
    _record_decision(
        method="MCRF",
        study_session=study_session,
        assessment_session=session,
        adaptive_result=initial,
        previous_scores=durable_scores,
        responses=[],
        previous_difficulty=None,
        decision_index=1,
    )
    return session


@router.post("/answer")
async def submit_adaptive_answer(
    request: SubmitAdaptiveAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record one sequential response and create at most the next item."""
    session = get_assessment_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found")
    if session.get("student_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not your session")
    if session.get("completion_status") == "completed":
        return {"completed": True, "session": session, "result": None}
    try:
        study_session = get_or_create_active_study_session(
            current_user.id,
            requested_study_session_id=session["study_session_id"],
        )
    except ValueError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

    state = dict(session.get("adaptive_state") or {})
    answers = dict(state.get("answers") or {})
    questions = list(session.get("questions") or [])
    question_index = next((index for index, question in enumerate(questions) if question.get("id") == request.question_id), -1)
    if question_index < 0:
        raise HTTPException(status_code=404, detail="Question not found in this assessment")
    if request.question_id in answers:
        return {"completed": False, "session": session, "duplicate": True}
    if question_index != len(answers):
        raise HTTPException(status_code=409, detail="Assessment questions must be answered in order")
    if question_index >= TOTAL_QUESTIONS:
        raise HTTPException(status_code=409, detail="This assessment already contains its ten protocol questions")

    question = questions[question_index]
    method = question.get("adaptive_method") or _method_for_question(question_index)
    response_event = dict(request.response_event or {})
    response_event["question_id"] = request.question_id
    response_event["question_index"] = question_index
    response = save_single_question_response(
        study_session=study_session,
        assessment_session=session,
        question=question,
        question_index=question_index,
        answer=request.answer,
        response_event=response_event,
        submitted_at=datetime.utcnow(),
        decision_method=method,
    )
    responses = list(state.get("responses") or []) + [response]
    answers[request.question_id] = request.answer
    answered_count = len(answers)

    if answered_count == TOTAL_QUESTIONS:
        new_state = {**state, "answers": answers, "responses": responses, "answered_count": answered_count}
        updated = update_assessment_adaptive_state(
            session["id"], adaptive_state=new_state, completion_status="completed"
        )
        result = _finalize_assessment(
            session={**session, "questions": questions},
            study_session=study_session,
            state=new_state,
            current_user=current_user,
            db=db,
        )
        return {"completed": True, "session": updated, "result": result}

    next_index = answered_count
    next_method = _method_for_question(next_index)
    durable_scores = get_recent_scores_pct(current_user.id, limit=5)
    adaptive_result = _decision_for_question(
        question_index=next_index,
        student_id=current_user.id,
        session={**session, "questions": questions},
        durable_scores=durable_scores,
        responses=responses,
    )
    next_difficulty = adaptive_result.get("difficulty", adaptive_result.get("next_assessment_difficulty"))
    next_question = _generate_unique_question(
        transcript_text=session.get("transcript_text") or "",
        difficulty=next_difficulty,
        topic_id=session.get("course_id") or "course_001",
        existing_questions=questions,
        method=next_method,
        question_index=next_index,
    )
    questions.append(next_question)
    evidence_responses = _responses_for_method(responses, next_method) or responses
    performance_history = (durable_scores + [
        _assessment_score(evidence_responses[:index + 1])
        for index in range(len(evidence_responses))
    ])[-5:]
    _record_decision(
        method=next_method,
        study_session=study_session,
        assessment_session={**session, "questions": questions},
        adaptive_result=adaptive_result,
        previous_scores=performance_history,
        responses=evidence_responses,
        previous_difficulty=question.get("difficulty"),
        decision_index=next_index + 1,
    )
    last_adaptive = {
        "performance_trend": adaptive_result["performance_trend"],
        "recommended_action": adaptive_result["recommended_action"],
        "next_assessment_difficulty": next_difficulty,
        "strength_areas": adaptive_result["strength_areas"],
        "weak_areas": adaptive_result["weak_areas"],
        "crs": adaptive_result.get("crs"),
    }
    new_state = {
        **state,
        "answers": answers,
        "responses": responses,
        "answered_count": answered_count,
        "last_adaptive_response": last_adaptive,
    }
    updated = update_assessment_adaptive_state(
        session["id"],
        questions=questions,
        selected_difficulty=next_difficulty,
        adaptive_state=new_state,
        completion_status="started",
    )
    save_generated_questions({**session, "questions": [next_question]})
    return {
        "completed": False,
        "session": updated,
        "adaptive_response": {"next_assessment_difficulty": next_difficulty, "crs": adaptive_result.get("crs")},
    }


@router.post("/submit", response_model=AssessmentResult)
async def submit_assessment(
    request: SubmitAssessmentRequest,
    current_user: User = Depends(get_current_user),
):
    """Retained endpoint with a clear guard against bypassing protocol order."""
    session = get_assessment_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found")
    if session.get("student_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not your session")
    raise HTTPException(
        status_code=409,
        detail="Submit each of the ten assessment questions in sequence via /api/assessment/answer.",
    )


@router.get("/session/{session_id}")
async def get_session(session_id: str, current_user: User = Depends(get_current_user)):
    session = get_assessment_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.get("student_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not your session")
    return session


@router.get("/results/{student_id}")
async def get_results_history(student_id: str, current_user: User = Depends(get_current_user)):
    if student_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view your own results")
    results = get_student_results(student_id)
    return {
        "student_id": student_id,
        "total_assessments": len(results),
        "results": results,
        "average_score": sum(result.get("percentage", 0) for result in results) / max(len(results), 1),
    }
