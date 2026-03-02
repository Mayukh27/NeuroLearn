"""
============================================================
NEUROLEARN — Adaptive Learning Platform Backend
FastAPI Application Entry Point

Run: uvicorn main:app --reload --host 0.0.0.0 --port 8000
Docs: http://localhost:8000/docs (Swagger UI)
============================================================
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers import (
    student_router,
    courses_router,
    attention_router,
    transcription_router,
    assessment_router,
    gamification_router,
    report_router,
)

# Import database seeding
from data.database import seed_database

# Import ML models (for health check)
from ml import attention_detector, transcription_service, question_generator


# ── Lifespan: Startup & Shutdown ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # ── STARTUP ──
    logger.info("=" * 60)
    logger.info("  NEUROLEARN BACKEND — Starting Up")
    logger.info("=" * 60)

    # Seed database with dummy data
    seed_database()

    # Log ML model status
    logger.info(f"Attention Model:     {'LIVE' if attention_detector.face_mesh else 'DUMMY'}")
    logger.info(f"Transcription Model: {'LIVE' if transcription_service.model else 'DUMMY'}")
    logger.info(f"Question Generator:  {'LIVE' if question_generator.model else 'DUMMY'}")
    logger.info("=" * 60)
    logger.success("Backend ready! Docs at http://localhost:8000/docs")

    yield

    # ── SHUTDOWN ──
    logger.info("Shutting down — cleaning up resources...")
    attention_detector.cleanup()
    logger.info("Shutdown complete.")


# ── Create App ──
app = FastAPI(
    title="NeuroLearn API",
    description=(
        "Adaptive Learning Platform Backend\n\n"
        "**ML Models:**\n"
        "- Attention Detection (MediaPipe Face Mesh)\n"
        "- Video Transcription (OpenAI Whisper)\n"
        "- Question Generation (FLAN-T5)\n"
        "- Adaptive Difficulty Engine\n\n"
        "**Features:**\n"
        "- Student profiles with gamification (XP, levels, badges)\n"
        "- Course management with video links\n"
        "- Real-time attention monitoring from webcam\n"
        "- Live video transcription\n"
        "- Adaptive assessments that adjust to student performance\n"
        "- Leaderboard, daily challenges, notifications"
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# ── CORS ──
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Register Routers ──
app.include_router(student_router)
app.include_router(courses_router)
app.include_router(attention_router)
app.include_router(transcription_router)
app.include_router(assessment_router)
app.include_router(gamification_router)
app.include_router(report_router)


# ── Health Check ──
@app.get("/", tags=["Health"])
async def root():
    """API root — basic info."""
    return {
        "name": "NeuroLearn API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Detailed health check with ML model status.

    JSON Response:
    {
        "status": "healthy",
        "version": "1.0.0",
        "models_loaded": {
            "attention_detector": true/false,
            "transcription_whisper": true/false,
            "question_generator_flan_t5": true/false,
            "adaptive_engine": true
        }
    }
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "models_loaded": {
            "attention_detector": attention_detector.face_mesh is not None,
            "transcription_whisper": transcription_service.model is not None,
            "question_generator_flan_t5": question_generator.model is not None,
            "adaptive_engine": True,  # Always available (no ML model needed)
        },
    }


# ── API Overview ──
@app.get("/api", tags=["Health"])
async def api_overview():
    """List all available API endpoint groups."""
    return {
        "endpoints": {
            "student": {
                "GET /api/student/profile": "Get student profile",
                "POST /api/student/xp": "Award XP",
            },
            "courses": {
                "GET /api/courses": "List all courses",
                "GET /api/courses/{id}": "Get course details",
                "GET /api/courses/{id}/videos/{vid}": "Get video details",
            },
            "attention": {
                "POST /api/attention/snapshot": "Analyze camera frame",
                "GET /api/attention/history": "Get attention logs",
                "GET /api/attention/dummy-snapshot": "Get dummy data (no camera)",
            },
            "transcription": {
                "GET /api/transcription/{video_id}": "Full transcript",
                "GET /api/transcription/{video_id}/live": "Segment at timestamp",
                "POST /api/transcription/chunk": "Transcribe audio chunk",
            },
            "assessment": {
                "POST /api/assessment/generate": "Generate adaptive quiz",
                "POST /api/assessment/submit": "Submit answers + get results",
                "GET /api/assessment/session/{id}": "Get session details",
                "GET /api/assessment/results/{student_id}": "Result history",
            },
            "gamification": {
                "GET /api/leaderboard": "Global leaderboard",
                "GET /api/challenges/daily": "Daily challenges",
                "GET /api/notifications": "Student notifications",
            },
        }
    }


# ── Run directly ──
if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "true").lower() == "true"

    uvicorn.run("main:app", host=host, port=port, reload=debug)
