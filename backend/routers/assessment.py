"""
============================================================
ROUTER: Assessment — Quiz generation, submission, results
Endpoints:
    POST /api/assessment/generate  — generate quiz from transcript + difficulty
    POST /api/assessment/submit    — submit answers, get adaptive result
    GET  /api/assessment/session/{id} — get session details
============================================================
"""

import uuid
import time
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas.models import (
    AssessmentSession,
    AssessmentResult,
    GenerateAssessmentRequest,
    SubmitAssessmentRequest,
)
from ml import question_generator, adaptive_engine
from data.database import (
    save_assessment_session,
    get_assessment_session,
    save_assessment_result,
    get_student_results,
    get_recent_scores_pct,
    save_crs_record,
    advance_challenge_progress,
    apply_xp,
    get_or_create_active_study_session,
    get_canonical_assessment_session_for_study,
    save_generated_questions,
    save_question_responses,
    save_research_crs_decision,
    refresh_behavioral_summary,
)
from data.db import get_db
from data.models_orm import User
from auth.security import get_current_user

router = APIRouter(prefix="/api/assessment", tags=["Assessment"])


def _apply_xp(user: User, amount: int, db: Session) -> dict:
    """
    Actually persist earned XP to the student's record, with the same
    level-up math as POST /api/student/xp.

    FIX (real XP request): submit_assessment previously computed
    `xp_earned` and returned it in the response WITHOUT ever writing it
    to the student's record — the number shown to the frontend was
    real-looking but never actually banked, so it never moved the
    leaderboard or the student's level. This is the fix: XP is now
    credited here, in the same transaction as the assessment result.
    """
    xp_result = apply_xp(user, amount)
    db.commit()
    return xp_result


@router.post("/generate", response_model=AssessmentSession)
async def generate_assessment(
    request: GenerateAssessmentRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate an adaptive assessment.

    Flow:
        1. Adaptive engine determines difficulty based on:
           - Previous score
           - Behavioral Cue level during video
        2. Question generator (FLAN-T5) creates questions from transcript
        3. Returns assessment session with questions

    JSON Response includes adaptive_metadata explaining WHY
    this difficulty was chosen.
    """
    # Auth request: the JWT is authoritative, not whatever student_id the
    # client put in the request body — this closes the "pass a different
    # student_id and read/act on someone else's data" gap.
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

    # Camera is optional: an opt-out/no-camera session uses neutral B=50.
    attention_score = request.attention_score
    if attention_score is None:
        attention_score = 50

    # Step 1: Determine difficulty. The assigned server-side condition decides
    # which policy runs; clients cannot switch policy by request parameters.
    if study_session["condition"] == "LEGACY":
        difficulty_result = adaptive_engine._get_initial_difficulty_legacy(
            student_id=request.student_id,
            attention_score=attention_score,
            previous_score=request.previous_score,
        )
    else:
        difficulty_result = adaptive_engine.get_initial_difficulty(
            student_id=request.student_id,
            attention_score=attention_score,
            previous_score=request.previous_score,
        )

    difficulty = difficulty_result["difficulty"]
    adaptive_metadata = difficulty_result["adaptive_metadata"]

    existing_session = get_canonical_assessment_session_for_study(study_session["study_session_id"])
    if existing_session and existing_session.get("questions"):
        return {
            "id": existing_session["id"],
            "study_session_id": study_session["study_session_id"],
            "participant_id": study_session["participant_id"],
            "condition": study_session["condition"],
            "course_id": existing_session.get("course_id") or request.course_id,
            "video_id": existing_session.get("video_id") or request.video_id,
            "questions": existing_session["questions"],
            "difficulty": existing_session.get("difficulty", "medium"),
            "time_limit": existing_session.get("time_limit", 420),
            "attention_score_during_video": existing_session.get("attention_score_during_video", attention_score),
            "adaptive_metadata": adaptive_metadata,
        }

    # Step 2: Generate questions
    transcript_text = request.transcript_text or ""
    questions = question_generator.generate_questions(
        transcript_text=transcript_text,
        difficulty=difficulty,
        num_questions=5,
        topic_id=request.course_id,
    )

    # Step 3: Build session
    session_id = f"session_{uuid.uuid4().hex[:12]}"
    time_limits = {"easy": 600, "medium": 420, "hard": 300}

    session = {
        "id": session_id,
        "study_session_id": study_session["study_session_id"],
        "participant_id": study_session["participant_id"],
        "condition": study_session["condition"],
        "course_id": request.course_id,
        "video_id": request.video_id,
        "questions": questions,
        "difficulty": difficulty,
        "time_limit": time_limits.get(difficulty, 420),
        "attention_score_during_video": attention_score,
        "adaptive_metadata": adaptive_metadata,
        "student_id": request.student_id,
        "created_at": time.time(),
        # Phase 10/12 addition: persisted so submit_assessment() can feed the
        # SAME transcript into the Content Complexity (C) component when
        # scoring this session, rather than complexity silently defaulting
        # to neutral on every submission (the practical consequence of CR2
        # if this field weren't threaded through).
        "transcript_text": transcript_text,
    }

    # Save session
    save_assessment_session(session)
    save_generated_questions(session)

    return session


@router.post("/submit", response_model=AssessmentResult)
async def submit_assessment(
    request: SubmitAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit assessment answers and get adaptive results.

    Flow:
        1. Retrieve session with correct answers
        2. Grade submission
        3. Run adaptive engine → determine next difficulty
        4. Award XP
        5. Return detailed results with adaptive response

    The adaptive_response JSON tells the frontend:
        - performance_trend (improving/stable/declining)
        - next_assessment_difficulty
        - strength/weak areas
        - recommended action text
    """
    # Auth request: identity comes from the JWT, not the request body.
    request.student_id = current_user.id

    # Get session
    session = get_assessment_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found")
    if session.get("student_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not your session")
    if not session.get("study_session_id"):
        try:
            study_session = get_or_create_active_study_session(
                current_user.id,
                course_id=session.get("course_id"),
                video_id=session.get("video_id"),
            )
        except ValueError as exc:
            raise HTTPException(status_code=403, detail=str(exc))
    else:
        study_session = get_or_create_active_study_session(
            current_user.id,
            requested_study_session_id=session["study_session_id"],
        )

    questions = session.get("questions", [])

    # Grade
    correct_count = 0
    earned_points = 0
    total_points = 0

    for q in questions:
        total_points += q.get("points", 10)
        submitted_answer = request.answers.get(q["id"])
        if submitted_answer is not None and submitted_answer == q["correct_answer"]:
            correct_count += 1
            earned_points += q.get("points", 10)

    percentage = round((correct_count / max(len(questions), 1)) * 100, 1)
    xp_earned = int(earned_points * 1.5)

    # FIX (real XP request): this used to be where xp_earned's story
    # ended — computed, put in the response dict, never written to the
    # student's row. Now it's actually credited, in real time, to the
    # authenticated student's Postgres record.
    xp_result = _apply_xp(current_user, xp_earned, db)

    # FIX (remaining-things request): the "Perfect Quiz" daily challenge
    # existed in the seed data but nothing anywhere ever completed it —
    # there was no code path that advanced challenge progress at all.
    # A 100% score now completes it for real, same day, once.
    if percentage >= 100:
        advance_challenge_progress(current_user.id, "quiz", set_to=1)

    # Phase 12 fix: pull score history from the DURABLE results_table
    # instead of relying solely on AdaptiveEngine's in-memory dict, so
    # Performance (P) and Trend (T) survive a server restart — directly
    # addresses CR1/MJ4 from the peer review packet.
    previous_scores = get_recent_scores_pct(request.student_id, limit=5)

    # Approximate "was this attempt correct" for the Integrity (I)
    # component's explanation text as "majority correct" — note this does
    # NOT affect the integrity score itself (response_integrity.py scores
    # timing alone, per the CR3 fix), only the human-readable reason string.
    was_correct = percentage >= 50.0

    submitted_at = datetime.utcnow()
    question_responses = save_question_responses(
        study_session=study_session,
        assessment_session=session,
        answers=request.answers,
        response_events=request.response_events,
        submitted_at=submitted_at,
        total_time_spent=request.time_spent,
    )
    timing_values = [
        r["response_time_seconds"]
        for r in question_responses
        if r.get("response_time_seconds") is not None
    ]
    crs_time_spent = sum(timing_values) / max(len(timing_values), 1) if timing_values else request.time_spent
    per_question_limit = session.get("time_limit", 420) / max(len(questions), 1)

    # Run adaptive engine. Server-side condition controls whether MCRF or the
    # preserved legacy cascade is used.
    if study_session["condition"] == "LEGACY":
        adaptive_result = adaptive_engine._determine_difficulty_legacy(
            student_id=request.student_id,
            current_score=percentage,
            attention_score=session.get("attention_score_during_video", 50),
            time_spent=request.time_spent,
            time_limit=session.get("time_limit", 420),
            previous_difficulty=session.get("difficulty", "medium"),
            previous_scores=previous_scores,
        )
    else:
        adaptive_result = adaptive_engine.determine_difficulty(
            student_id=request.student_id,
            current_score=percentage,
            attention_score=session.get("attention_score_during_video", 50),
            time_spent=crs_time_spent,
            time_limit=per_question_limit,
            previous_difficulty=session.get("difficulty", "medium"),
            previous_scores=previous_scores,
            transcript_text=session.get("transcript_text"),
            was_correct=was_correct,
        )

    # Generate result message
    if percentage >= 90:
        message = "Outstanding! You've truly mastered this material!"
    elif percentage >= 70:
        message = "Well done! You have a solid understanding."
    elif percentage >= 50:
        message = "Decent effort! Review the video to strengthen weak areas."
    else:
        message = "Don't worry! Rewatch the video and try again — you'll improve."

    # Suggested topics based on performance
    if percentage >= 70:
        suggested = ["Next: Advanced Topics", "Challenge: Timed Quiz"]
    else:
        suggested = [
            "Review: Rewatch the Video",
            "Practice: Easier Questions",
            "Resource: Study Guide",
        ]

    result = {
        "session_id": request.session_id,
        "study_session_id": study_session["study_session_id"],
        "participant_id": study_session["participant_id"],
        "condition": study_session["condition"],
        "student_id": request.student_id,
        "score": percentage,
        "total_points": total_points,
        "earned_points": earned_points,
        "percentage": percentage,
        "xp_earned": xp_earned,
        # Real, persisted values (see _apply_xp above) — not just the
        # per-assessment delta, but where the student's account actually
        # landed after this submission.
        "total_xp": xp_result["new_xp"],
        "new_level": xp_result["new_level"],
        "leveled_up": xp_result["leveled_up"],
        "time_spent": request.time_spent,
        "correct_answers": correct_count,
        "total_questions": len(questions),
        "difficulty": session.get("difficulty", "medium"),
        "message": message,
        "next_difficulty": adaptive_result["next_assessment_difficulty"],
        "suggested_topics": suggested,
        # Phase 12 addition: needed so get_recent_scores_pct() can order
        # history correctly across restarts (previously absent entirely).
        "timestamp": time.time(),
        "adaptive_response": {
            "performance_trend": adaptive_result["performance_trend"],
            "recommended_action": adaptive_result["recommended_action"],
            "next_assessment_difficulty": adaptive_result["next_assessment_difficulty"],
            "strength_areas": adaptive_result["strength_areas"],
            "weak_areas": adaptive_result["weak_areas"],
            # Phase 11 addition: surfaces the full CRS breakdown to the
            # frontend (Phase 13 dashboards read this same shape).
            "crs": adaptive_result.get("crs"),
        },
    }

    # Save result (unchanged — durable assessment_results table)
    save_assessment_result(result)

    # Phase 10: persist the full CRS record as its own durable history
    # entry, independent of the legacy results_table, so each component
    # (P, A, I, T, C) has its own queryable time series.
    crs_block = adaptive_result.get("crs")
    if crs_block:
        save_crs_record({
            "student_id": request.student_id,
            "study_session_id": study_session["study_session_id"],
            "participant_id": study_session["participant_id"],
            "condition": study_session["condition"],
            "assessment_id": request.session_id,
            "timestamp": result["timestamp"],
            "performance": crs_block["components"]["performance"],
            "behavioral_cue": crs_block["components"]["behavioral_cue"],
            "integrity": crs_block["components"]["integrity"],
            "trend": crs_block["components"]["trend"],
            "complexity": crs_block["components"]["complexity"],
            "crs": crs_block["score"],
            "difficulty": adaptive_result["next_assessment_difficulty"],
            "explanation": crs_block["explanation"],
        })
        save_research_crs_decision(
            study_session=study_session,
            assessment_session=session,
            adaptive_result=adaptive_result,
            previous_scores=previous_scores + [percentage],
            per_question_responses=question_responses,
            previous_difficulty=session.get("difficulty", "medium"),
            attention_score=session.get("attention_score_during_video", 50),
            transcript_text=session.get("transcript_text"),
        )

    refresh_behavioral_summary(study_session["study_session_id"])

    return result


@router.get("/session/{session_id}")
async def get_session(session_id: str, current_user: User = Depends(get_current_user)):
    """Get assessment session details — only the session's own owner may view it."""
    session = get_assessment_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.get("student_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not your session")
    return session


@router.get("/results/{student_id}")
async def get_results_history(student_id: str, current_user: User = Depends(get_current_user)):
    """Get all assessment results for a student — only your own, for now
    (no admin/instructor role exists yet to justify viewing others')."""
    if student_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view your own results")
    results = get_student_results(student_id)
    return {
        "student_id": student_id,
        "total_assessments": len(results),
        "results": results,
        "average_score": (
            sum(r.get("percentage", 0) for r in results) / max(len(results), 1)
        ),
    }
