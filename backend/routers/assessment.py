"""Assessment orchestration for the fixed mixed-method research protocol.

One study session produces one 10-item assessment: a single MCRF decision
(from the learner's MCRF/CRS state for the completed study session as a
whole) sets ONE difficulty for all of questions 1--5; a single LEGACY
decision, made once at the Q5->Q6 boundary, sets ONE difficulty for all of
questions 6--10. This is protocol-level, not item-level, adaptivity: a
question's correctness, response time, or outcome is used only for scoring
and never changes the difficulty of the question after it. The engines
themselves remain in :mod:`ml.adaptive_engine`; this router owns only their
protocol, evidence flow, and durable study logging.
"""

from __future__ import annotations

import re
import time
import uuid
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from loguru import logger
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

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
    record_completed_video,
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


async def _generate_and_store_question_block(
    *,
    session_id: str,
    transcript_text: str,
    difficulty: str,
    topic_id: str,
    method: str,
    start_index: int,
    count: int,
) -> None:
    """Generate and persist a whole block of questions at one, already-fixed
    difficulty (protocol correction: difficulty is decided once per block —
    MCRF for Q1-5, LEGACY for Q6-10 — never recomputed from the previous
    question's correctness/timing). Runs after the triggering response has
    already been sent, so FLAN-T5 generation never blocks grading/persisting
    an answer or the client-side timer.
    """
    current = get_assessment_session(session_id)
    if not current:
        return
    existing_questions = list(current.get("questions") or [])
    have_indices = {q.get("decision_index") for q in existing_questions}
    generated: list[dict] = []
    for offset in range(count):
        index = start_index + offset
        if (index + 1) in have_indices:
            continue  # already generated (e.g. a retried trigger)
        try:
            # run_in_threadpool: _generate_unique_question is a blocking,
            # CPU-bound call (tokenize + FLAN-T5 forward pass); running it
            # off the event loop keeps other requests (e.g. session
            # polling) responsive while it runs.
            question = await run_in_threadpool(
                _generate_unique_question,
                transcript_text=transcript_text,
                difficulty=difficulty,
                topic_id=topic_id,
                existing_questions=existing_questions + generated,
                method=method,
                question_index=index,
            )
        except Exception:
            logger.exception(
                f"Background question generation failed for session {session_id}, "
                f"question_index={index}; falling back to question bank."
            )
            try:
                bank_questions = question_generator._generate_from_bank(difficulty, 1, topic_id)
            except Exception:
                logger.exception(f"Question-bank fallback also failed for session {session_id}")
                continue
            if not bank_questions:
                continue
            question = dict(bank_questions[0])
            question["adaptive_method"] = method
            question["decision_index"] = index + 1
        generated.append(question)

    if not generated:
        return

    # Re-read so we merge onto the latest questions list rather than one
    # captured before other concurrent writes landed.
    current = get_assessment_session(session_id)
    if not current:
        return
    latest_questions = list(current.get("questions") or [])
    have_indices = {q.get("decision_index") for q in latest_questions}
    to_add = [q for q in generated if q.get("decision_index") not in have_indices]
    if not to_add:
        return
    latest_questions.extend(to_add)
    latest_questions.sort(key=lambda q: q.get("decision_index", 0))
    update_assessment_adaptive_state(
        session_id,
        questions=latest_questions,
        completion_status="started",
    )
    save_generated_questions({**current, "questions": to_add})


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


def _record_block_decision(
    *,
    method: str,
    study_session: dict,
    assessment_session: dict,
    adaptive_result: dict,
    previous_scores: list[float],
    responses: list[dict],
    previous_difficulty: str | None,
    block_start_index: int,
    block_size: int,
) -> None:
    """Protocol correction: difficulty is decided ONCE per block (MCRF for
    Q1-5, LEGACY for Q6-10) before that block's questions are generated —
    never recomputed per question from the previous answer's correctness or
    timing. `adaptive_result`/`previous_scores`/`responses` are therefore
    the single, frozen inputs for the whole block; we still write one
    research decision record per question (decision_index block_start_index+1
    .. +block_size) so the existing CRS/LEGACY export shape (one row per
    question) is unchanged — every record in the block just carries the
    same already-determined difficulty instead of a re-evaluated one.
    """
    for offset in range(block_size):
        _record_decision(
            method=method,
            study_session=study_session,
            assessment_session=assessment_session,
            adaptive_result=adaptive_result,
            previous_scores=previous_scores,
            responses=responses,
            previous_difficulty=previous_difficulty,
            decision_index=block_start_index + offset + 1,
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
    allow_partial: bool = False,
) -> dict:
    questions = session.get("questions", [])
    answers = state.get("answers", {})
    # FIX (item 3, timeout auto-submit): the normal 10/10 completion path
    # (allow_partial=False, unchanged) still requires all ten protocol
    # questions to be answered — that behavior is untouched. allow_partial
    # is only used by the new /submit timeout path below, for the case
    # where the timer expired before the tenth question was reached; any
    # question the student never got to answer scores 0 rather than
    # blocking finalization. No MCRF/LEGACY/CRS records are written here
    # either way — those are only ever recorded per-question, at answer
    # time, exactly as before.
    if not allow_partial and (len(questions) != TOTAL_QUESTIONS or len(answers) != TOTAL_QUESTIONS):
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
        # FIX (item 3): lets the frontend/results page and research export
        # distinguish a genuine timeout finalize from a full 10/10 finish.
        "timed_out": allow_partial and len(answers) < TOTAL_QUESTIONS,
        "answered_count": len(answers),
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
    # FIX (items 8/9): complete_study_session is unchanged and still called
    # exactly once, right here, only once all ten questions are answered or
    # a genuine timeout finalize has happened (allow_partial path) — never
    # when the assessment starts or a video ends.
    complete_study_session(study_session["study_session_id"], "completed")
    # FIX (item 9): stash the final result on the session's adaptive_state so
    # a retried/duplicate finalize call (e.g. a race between the 10th
    # /answer and a near-simultaneous timeout /submit) can return the same
    # result idempotently instead of erroring or re-finalizing.
    update_assessment_adaptive_state(
        session["id"],
        adaptive_state={**state, "final_result": result},
        completion_status="completed",
    )
    return result


@router.post("/generate", response_model=AssessmentSession)
async def generate_assessment(
    request: GenerateAssessmentRequest,
    background_tasks: BackgroundTasks,
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
        # The frontend completion call (POST .../videos/{id}/complete) may have
        # been lost due to a stale-closure race, a network hiccup, or a rapid
        # video switch that replaced the study session before the ENDED event
        # fired.  Rather than returning 409 and forcing the user to retry,
        # auto-record the completion for the video that was passed with this
        # generate request so the pipeline can proceed.
        #
        # record_completed_video is idempotent: if the frontend DID manage to
        # record it concurrently, this is a no-op (the existing row is kept and
        # optionally enriched with the transcript text if it was previously
        # empty).
        if request.video_id:
            try:
                record_completed_video(
                    study_session_id=study_session["study_session_id"],
                    user_id=current_user.id,
                    video_id=request.video_id,
                    transcript_text=request.transcript_text or "",
                )
                completed_context = get_completed_video_context(study_session["study_session_id"])
                contributing_video_ids = completed_context["contributing_video_ids"]
            except Exception as auto_err:
                logger.warning(
                    f"Auto-record completion failed for session "
                    f"{study_session['study_session_id']} / video {request.video_id}: {auto_err}"
                )
        if not contributing_video_ids:
            raise HTTPException(
                status_code=409,
                detail="Complete at least one video before starting the assessment.",
            )

    existing_session = get_canonical_assessment_session_for_study(study_session["study_session_id"])
    if existing_session and existing_session.get("questions"):
        return existing_session

    # Protocol correction: MCRF is evaluated ONCE per assessment, from the
    # learner's MCRF/CRS state for the completed study session as a whole —
    # not re-evaluated per question. This single value governs all of
    # Q1-Q5; it is never recomputed from in-assessment answer correctness.
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
    mcrf_difficulty = initial["difficulty"]
    # Q1 is generated synchronously so there is something to show
    # immediately; Q2-Q5 use the identical mcrf_difficulty and are generated
    # in the background right away (their content never depends on how Q1
    # is answered), so answering never has to wait on FLAN-T5 for them.
    question = _generate_unique_question(
        transcript_text=transcript_text,
        difficulty=mcrf_difficulty,
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
        "difficulty": mcrf_difficulty,
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
            # Frozen, assessment-level block difficulties (item: no
            # per-question adaptivity). mcrf_block covers Q1-5;
            # legacy_block is filled in once, at the Q5->Q6 boundary.
            "mcrf_block_difficulty": mcrf_difficulty,
            "legacy_block_difficulty": None,
            "last_adaptive_response": {
                "performance_trend": "stable",
                "recommended_action": adaptive_metadata["reason"],
                "next_assessment_difficulty": mcrf_difficulty,
                "strength_areas": [],
                "weak_areas": [],
                "crs": initial.get("crs"),
            },
        },
    }
    save_assessment_session(session)
    save_generated_questions(session)
    # One research decision record per question (unchanged export shape),
    # but every one of Q1-Q5's records carries this same, single MCRF
    # decision — none are re-evaluated from answer correctness.
    _record_block_decision(
        method="MCRF",
        study_session=study_session,
        assessment_session=session,
        adaptive_result=initial,
        previous_scores=durable_scores,
        responses=[],
        previous_difficulty=None,
        block_start_index=0,
        block_size=MCRF_QUESTION_COUNT,
    )
    background_tasks.add_task(
        _generate_and_store_question_block,
        session_id=session["id"],
        transcript_text=transcript_text,
        difficulty=mcrf_difficulty,
        topic_id=request.course_id,
        method="MCRF",
        start_index=1,
        count=MCRF_QUESTION_COUNT - 1,
    )
    return session


@router.post("/answer")
async def submit_adaptive_answer(
    request: SubmitAdaptiveAnswerRequest,
    background_tasks: BackgroundTasks,
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

    # ── Protocol correction ──────────────────────────────────────────────
    # Difficulty is NOT re-evaluated per question. Q1-Q5 all use the single
    # MCRF decision made at assessment creation; Q6-Q10 all use a single
    # LEGACY decision made once, right here, the first time we cross into
    # the LEGACY block (i.e. immediately after Q5 is answered) — using the
    # learner's MCRF/CRS-derived state for the study session as a whole,
    # exactly as before at this same boundary. Once set, that LEGACY value
    # is frozen for Q7-Q10 too: no subsequent answer inside either block
    # changes the difficulty of the question after it.
    if next_index < MCRF_QUESTION_COUNT:
        next_difficulty = state.get("mcrf_block_difficulty") or session.get("difficulty", "medium")
        crs_for_response = (state.get("last_adaptive_response") or {}).get("crs")
    elif next_index == MCRF_QUESTION_COUNT:
        # One-time LEGACY block decision, computed from Q1-Q5 evidence as a
        # whole (unchanged engine call/inputs — just invoked once here
        # instead of on every subsequent LEGACY-block answer).
        durable_scores = get_recent_scores_pct(current_user.id, limit=5)
        legacy_decision = _decision_for_question(
            question_index=next_index,
            student_id=current_user.id,
            session={**session, "questions": questions},
            durable_scores=durable_scores,
            responses=responses,
        )
        next_difficulty = legacy_decision.get("difficulty", legacy_decision.get("next_assessment_difficulty"))
        evidence_responses = _responses_for_method(responses, next_method) or responses
        performance_history = (durable_scores + [
            _assessment_score(evidence_responses[:index + 1])
            for index in range(len(evidence_responses))
        ])[-5:]
        _record_block_decision(
            method="LEGACY",
            study_session=study_session,
            assessment_session={**session, "questions": questions},
            adaptive_result=legacy_decision,
            previous_scores=performance_history,
            responses=evidence_responses,
            previous_difficulty=question.get("difficulty"),
            block_start_index=MCRF_QUESTION_COUNT,
            block_size=TOTAL_QUESTIONS - MCRF_QUESTION_COUNT,
        )
        state = {**state, "legacy_block_difficulty": next_difficulty}
        crs_for_response = legacy_decision.get("crs")
        background_tasks.add_task(
            _generate_and_store_question_block,
            session_id=session["id"],
            transcript_text=session.get("transcript_text") or "",
            difficulty=next_difficulty,
            topic_id=session.get("course_id") or "course_001",
            method="LEGACY",
            start_index=MCRF_QUESTION_COUNT,
            count=TOTAL_QUESTIONS - MCRF_QUESTION_COUNT,
        )
    else:
        next_difficulty = state.get("legacy_block_difficulty") or session.get("difficulty", "medium")
        crs_for_response = (state.get("last_adaptive_response") or {}).get("crs")

    last_adaptive = {
        **(state.get("last_adaptive_response") or {}),
        "next_assessment_difficulty": next_difficulty,
        "crs": crs_for_response,
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
        # No `questions=` here: this endpoint no longer appends questions
        # itself (that only ever happens in the block background task), so
        # writing back the possibly-stale `questions` list captured at the
        # top of this request could clobber items a concurrently-finishing
        # background block just added. Leaving it out means this write
        # keeps whatever the DB row's questions currently are and the
        # returned `updated` reflects that current state.
        selected_difficulty=next_difficulty,
        adaptive_state=new_state,
        completion_status="generating",
    )
    # The next question is either already generated as part of its block, or
    # still on its way from the block's background task (scheduled either at
    # assessment creation for Q2-5, or above for Q6-10) — either way, no
    # generation is triggered here, and none is ever blocking this response.
    next_question_pending = len(updated.get("questions") or []) <= next_index
    return {
        "completed": False,
        "session": updated,
        "next_question_pending": next_question_pending,
        "adaptive_response": {"next_assessment_difficulty": next_difficulty, "crs": crs_for_response},
    }


@router.post("/submit", response_model=AssessmentResult)
async def submit_assessment(
    request: SubmitAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Timeout auto-submit (item 3): finalize with whatever was answered
    when the assessment clock runs out.

    In-order answering of all ten questions must still go through
    /api/assessment/answer, unchanged — this endpoint never accepts or
    grades a submitted answer itself (SubmitAssessmentRequest.answers is
    intentionally ignored: the ledger of graded answers already recorded
    via /answer is the only source of truth). This endpoint only exists to
    let a real timer expiry force finalization when fewer than ten
    questions were reached, so the study session is never left stranded.
    """
    session = get_assessment_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found")
    if session.get("student_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not your session")

    state = dict(session.get("adaptive_state") or {})

    if session.get("completion_status") == "completed":
        # Idempotent: either the 10th /answer already finalized this
        # session, or a duplicate timeout call arrived (e.g. a retry). Both
        # cases must not call complete_study_session or re-finalize again.
        final_result = state.get("final_result")
        if final_result:
            return final_result
        raise HTTPException(
            status_code=409,
            detail="This assessment is already completed.",
        )

    answers = dict(state.get("answers") or {})
    if len(answers) >= TOTAL_QUESTIONS:
        raise HTTPException(
            status_code=409,
            detail="This assessment already contains its ten protocol questions.",
        )

    try:
        study_session = get_or_create_active_study_session(
            current_user.id,
            requested_study_session_id=session["study_session_id"],
        )
    except ValueError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

    return _finalize_assessment(
        session=session,
        study_session=study_session,
        state=state,
        current_user=current_user,
        db=db,
        allow_partial=True,
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