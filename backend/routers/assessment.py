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
from fastapi import APIRouter, HTTPException
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
)

router = APIRouter(prefix="/api/assessment", tags=["Assessment"])


@router.post("/generate", response_model=AssessmentSession)
async def generate_assessment(request: GenerateAssessmentRequest):
    """
    Generate an adaptive assessment.

    Flow:
        1. Adaptive engine determines difficulty based on:
           - Previous score
           - Attention level during video
        2. Question generator (FLAN-T5) creates questions from transcript
        3. Returns assessment session with questions

    JSON Response includes adaptive_metadata explaining WHY
    this difficulty was chosen.
    """
    # Step 1: Determine difficulty
    difficulty_result = adaptive_engine.get_initial_difficulty(
        student_id=request.student_id,
        attention_score=request.attention_score,
        previous_score=request.previous_score,
    )

    difficulty = difficulty_result["difficulty"]
    adaptive_metadata = difficulty_result["adaptive_metadata"]

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
        "course_id": request.course_id,
        "video_id": request.video_id,
        "questions": questions,
        "difficulty": difficulty,
        "time_limit": time_limits.get(difficulty, 420),
        "attention_score_during_video": request.attention_score,
        "adaptive_metadata": adaptive_metadata,
        "student_id": request.student_id,
        "created_at": time.time(),
    }

    # Save session
    save_assessment_session(session)

    return session


@router.post("/submit", response_model=AssessmentResult)
async def submit_assessment(request: SubmitAssessmentRequest):
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
    # Get session
    session = get_assessment_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment session not found")

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

    # Run adaptive engine
    adaptive_result = adaptive_engine.determine_difficulty(
        student_id=request.student_id,
        current_score=percentage,
        attention_score=session.get("attention_score_during_video", 50),
        time_spent=request.time_spent,
        time_limit=session.get("time_limit", 420),
        previous_difficulty=session.get("difficulty", "medium"),
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
        "student_id": request.student_id,
        "score": percentage,
        "total_points": total_points,
        "earned_points": earned_points,
        "percentage": percentage,
        "xp_earned": xp_earned,
        "time_spent": request.time_spent,
        "correct_answers": correct_count,
        "total_questions": len(questions),
        "difficulty": session.get("difficulty", "medium"),
        "message": message,
        "next_difficulty": adaptive_result["next_assessment_difficulty"],
        "suggested_topics": suggested,
        "adaptive_response": {
            "performance_trend": adaptive_result["performance_trend"],
            "recommended_action": adaptive_result["recommended_action"],
            "next_assessment_difficulty": adaptive_result["next_assessment_difficulty"],
            "strength_areas": adaptive_result["strength_areas"],
            "weak_areas": adaptive_result["weak_areas"],
        },
    }

    # Save result
    save_assessment_result(result)

    return result


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get assessment session details."""
    session = get_assessment_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/results/{student_id}")
async def get_results_history(student_id: str):
    """Get all assessment results for a student."""
    results = get_student_results(student_id)
    return {
        "student_id": student_id,
        "total_assessments": len(results),
        "results": results,
        "average_score": (
            sum(r.get("percentage", 0) for r in results) / max(len(results), 1)
        ),
    }
