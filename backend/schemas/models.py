"""
============================================================
PYDANTIC SCHEMAS — JSON Models for all API endpoints
These map 1:1 with the frontend TypeScript interfaces
============================================================
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


# ── Student ─────────────────────────────────────────────────

class Badge(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    earned: bool
    earned_date: Optional[str] = None
    rarity: Literal["common", "rare", "epic", "legendary"]


class StudentProfile(BaseModel):
    id: str
    name: str
    email: str
    avatar: str
    level: int
    xp: int
    xp_to_next_level: int
    streak: int
    best_streak: int
    total_courses_completed: int
    total_watch_time: int  # minutes
    joined_date: str
    rank: int
    badges: list[Badge]


class XPAwardRequest(BaseModel):
    student_id: str
    amount: int
    reason: str


class XPAwardResponse(BaseModel):
    new_xp: int
    new_level: int
    leveled_up: bool
    xp_to_next_level: int


# ── Courses ─────────────────────────────────────────────────

class VideoLink(BaseModel):
    id: str
    title: str
    url: str
    duration: int  # seconds
    thumbnail: str
    order: int
    completed: bool
    watched_percent: float


class Course(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    category: str
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]
    total_videos: int
    completed_videos: int
    progress: float
    estimated_hours: float
    tags: list[str]
    video_links: list[VideoLink]


# ── Attention / Camera ──────────────────────────────────────

class AttentionModelOutput(BaseModel):
    """Raw JSON output from the attention detection ML model"""
    eye_contact: float = Field(ge=0, le=1)
    head_pose: Literal["forward", "slightly_away", "away"]
    face_detected: bool
    blink_rate: float


class AttentionSnapshot(BaseModel):
    timestamp: str
    score: int = Field(ge=0, le=100)
    state: Literal["attentive", "inattentive", "unfocused"]
    confidence: float = Field(ge=0, le=1)
    message: str
    model_response: AttentionModelOutput


class AttentionFrameRequest(BaseModel):
    """Request with base64 camera frame"""
    frame_base64: str
    video_id: str
    student_id: str


# ── Transcription ───────────────────────────────────────────

class WordTimestamp(BaseModel):
    word: str
    start: float
    end: float
    confidence: float


class TranscriptionModelOutput(BaseModel):
    """Raw JSON from Whisper / transcription model"""
    language: str
    words: list[WordTimestamp]


class TranscriptSegment(BaseModel):
    id: str
    text: str
    timestamp: str
    start_time: float
    end_time: float
    confidence: float
    model_response: TranscriptionModelOutput


class TranscriptionRequest(BaseModel):
    video_id: str
    audio_chunk_base64: Optional[str] = None
    video_url: Optional[str] = None


# ── Assessment / Quiz ───────────────────────────────────────

class LLMQuestionMetadata(BaseModel):
    """JSON metadata from the LLM question generator (FLAN-T5)"""
    model: str
    generated_from: str
    difficulty_score: float = Field(ge=0, le=1)
    blooms_level: Literal[
        "remember", "understand", "apply", "analyze", "evaluate", "create"
    ]


class AssessmentQuestion(BaseModel):
    id: str
    type: Literal["mcq", "true-false", "short-answer"]
    question: str
    options: Optional[list[str]] = None
    correct_answer: int | str
    difficulty: Literal["easy", "medium", "hard"]
    points: int
    explanation: str
    topic_id: str
    llm_metadata: LLMQuestionMetadata


class AdaptiveMetadata(BaseModel):
    """JSON from the adaptive difficulty engine"""
    previous_score: Optional[float] = None
    adjusted_difficulty: str
    reason: str


class AssessmentSession(BaseModel):
    id: str
    course_id: str
    video_id: str
    questions: list[AssessmentQuestion]
    difficulty: Literal["easy", "medium", "hard"]
    time_limit: int  # seconds
    attention_score_during_video: float
    adaptive_metadata: AdaptiveMetadata


class GenerateAssessmentRequest(BaseModel):
    course_id: str
    video_id: str
    student_id: str
    attention_score: float = Field(ge=0, le=100)
    previous_score: Optional[float] = None
    transcript_text: Optional[str] = None


class SubmitAssessmentRequest(BaseModel):
    session_id: str
    student_id: str
    answers: dict[str, int | str]  # question_id -> selected answer
    time_spent: int  # seconds


class AdaptiveResponse(BaseModel):
    """JSON from the adaptive engine after assessment"""
    performance_trend: Literal["improving", "stable", "declining"]
    recommended_action: str
    next_assessment_difficulty: Literal["easy", "medium", "hard"]
    strength_areas: list[str]
    weak_areas: list[str]


class AssessmentResult(BaseModel):
    session_id: str
    score: float
    total_points: int
    earned_points: int
    percentage: float
    xp_earned: int
    time_spent: int
    correct_answers: int
    total_questions: int
    difficulty: str
    message: str
    next_difficulty: Literal["easy", "medium", "hard"]
    suggested_topics: list[str]
    adaptive_response: AdaptiveResponse


# ── Leaderboard ─────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    student_id: str
    name: str
    avatar: str
    xp: int
    level: int
    streak: int
    courses_completed: int


# ── Daily Challenges ────────────────────────────────────────

class DailyChallenge(BaseModel):
    id: str
    title: str
    description: str
    xp_reward: int
    type: Literal["watch", "quiz", "streak", "review"]
    completed: bool
    progress: int
    target: int


# ── Notifications ───────────────────────────────────────────

class Notification(BaseModel):
    id: str
    type: Literal["achievement", "reminder", "milestone", "challenge"]
    title: str
    message: str
    timestamp: str
    read: bool
    icon: str


# ── Health ──────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    models_loaded: dict[str, bool]
