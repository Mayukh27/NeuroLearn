"""
data/models_orm.py — SQLAlchemy ORM models backing the Postgres database.

Design note: nested/variable-shape content (badges, video_links, tags,
model_response) is stored as JSONB columns rather than exploded into
further join tables. This keeps the exact same document shapes the
existing Pydantic response models (schemas/models.py) already expect —
so routers barely change — while still getting real Postgres benefits
where they matter most: a unique/indexed `users.email` for auth, and a
real `ORDER BY xp DESC` for the leaderboard instead of a static seeded
table (see data/database.py's get_leaderboard()).
"""
import uuid
from datetime import datetime, date

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Date, ForeignKey, Text
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from data.db import Base


def _uuid() -> str:
    return uuid.uuid4().hex


class User(Base):
    """
    A registered account. Doubles as the "student profile" the rest of the
    app already models (schemas.models.StudentProfile) — auth fields and
    gamification fields live on the same row rather than a separate join,
    since every user in this app *is* a student.
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    avatar = Column(String, default="/placeholder-user.jpg")

    # Gamification (previously a TinyDB dict in data/database.py's seed)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    xp_to_next_level = Column(Integer, default=100)
    streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    total_courses_completed = Column(Integer, default=0)
    total_watch_time = Column(Integer, default=0)  # minutes
    badges = Column(JSONB, default=list)

    joined_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)
    # FIX (remaining-things request): `streak`/`best_streak` existed as
    # columns but nothing anywhere ever wrote to them after creation —
    # they were permanently stuck at their initial value. This tracks the
    # last calendar date the student did anything streak-worthy (logged
    # in or submitted an assessment), so routers/auth.py's login handler
    # can compute a real consecutive-day streak.
    last_active_date = Column(Date, nullable=True)

    consent = relationship("Consent", back_populates="user", uselist=False)


class Course(Base):
    __tablename__ = "courses"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)
    category = Column(String)
    difficulty = Column(String)
    total_videos = Column(Integer, default=0)
    completed_videos = Column(Integer, default=0)
    progress = Column(Float, default=0)
    estimated_hours = Column(Float, default=0)
    tags = Column(JSONB, default=list)
    video_links = Column(JSONB, default=list)


class AutoCourse(Base):
    __tablename__ = "auto_courses"
    course_id = Column(String, primary_key=True)
    course_title = Column(String)
    description = Column(Text)
    icon = Column(String)
    category = Column(String)
    difficulty = Column(String)
    tags = Column(JSONB, default=list)
    videos = Column(JSONB, default=list)
    generated_at = Column(Float, default=0)


class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"
    id = Column(String, primary_key=True, default=_uuid)
    student_id = Column(String, ForeignKey("users.id"), index=True)
    questions = Column(JSONB, default=list)
    difficulty = Column(String, default="medium")
    time_limit = Column(Integer, default=420)
    attention_score_during_video = Column(Float, default=50)
    transcript_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AssessmentResult(Base):
    __tablename__ = "assessment_results"
    id = Column(String, primary_key=True, default=_uuid)
    student_id = Column(String, ForeignKey("users.id"), index=True)
    session_id = Column(String, index=True)
    score = Column(Float)
    percentage = Column(Float)
    xp_earned = Column(Integer)
    timestamp = Column(Float)  # epoch seconds, matches previous TinyDB field
    payload = Column(JSONB, default=dict)  # everything else (message, adaptive_response, etc.)


class CRSHistory(Base):
    __tablename__ = "crs_history"
    id = Column(String, primary_key=True, default=_uuid)
    student_id = Column(String, ForeignKey("users.id"), index=True)
    assessment_id = Column(String, nullable=True)
    timestamp = Column(Float)
    performance = Column(Float)
    behavioral_cue = Column(Float)
    integrity = Column(Float)
    trend = Column(Float)
    complexity = Column(Float)
    crs = Column(Float)
    difficulty = Column(String)
    explanation = Column(Text)


class Consent(Base):
    """CR6 (peer review packet) — webcam-monitoring consent, one row per user."""
    __tablename__ = "consent"
    student_id = Column(String, ForeignKey("users.id"), primary_key=True)
    granted = Column(Boolean, default=False)
    granted_at = Column(DateTime, nullable=True)
    retention_days = Column(Integer, default=30)
    raw_frames_stored = Column(Boolean, default=False)
    version = Column(String, default="1.0")

    user = relationship("User", back_populates="consent")


class AttentionLog(Base):
    __tablename__ = "attention_logs"
    id = Column(String, primary_key=True, default=_uuid)
    student_id = Column(String, ForeignKey("users.id"), index=True)
    video_id = Column(String, index=True)
    timestamp = Column(String)
    score = Column(Integer)
    state = Column(String)
    confidence = Column(Float)
    message = Column(String)
    model_response = Column(JSONB, default=dict)
    source = Column(String, default="dummy")  # MJ4 fix: "live" | "dummy"
    consent_confirmed = Column(Boolean, default=False)


class DailyChallenge(Base):
    """
    Global challenge TEMPLATE — title/description/xp_reward/target only.
    FIX (remaining-things request): this table previously held
    `completed`/`progress` directly, meaning one student completing
    "Watch 30 minutes" marked it completed for every student, since
    there was only ever one row per challenge. Per-student state now
    lives in DailyChallengeProgress below.
    """
    __tablename__ = "daily_challenges"
    id = Column(String, primary_key=True)
    title = Column(String)
    description = Column(String)
    xp_reward = Column(Integer)
    type = Column(String)
    target = Column(Integer, default=1)


class DailyChallengeProgress(Base):
    """Per-student, per-day progress against a DailyChallenge template."""
    __tablename__ = "daily_challenge_progress"
    id = Column(String, primary_key=True, default=_uuid)
    student_id = Column(String, ForeignKey("users.id"), index=True)
    challenge_id = Column(String, ForeignKey("daily_challenges.id"), index=True)
    challenge_date = Column(Date, default=date.today, index=True)
    progress = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    xp_awarded = Column(Boolean, default=False)  # guards against double XP for the same day


class PasswordResetToken(Base):
    """
    FIX (remaining-things request): password reset didn't exist at all.
    Tokens are stored as a SHA-256 hash, not the raw value — mirrors how
    the raw token is never persisted anywhere a DB read could leak it,
    same principle as not storing plaintext passwords.
    """
    __tablename__ = "password_reset_tokens"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    token_hash = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class RefreshToken(Base):
    """
    FIX (remaining-things request): access tokens were long-lived (10h)
    stateless JWTs with no revocation mechanism at all — logging out only
    ever meant "the browser forgot the token", the token itself stayed
    valid until it expired no matter what. Refresh tokens are stored
    hashed (same rationale as PasswordResetToken) and can be revoked
    server-side, which is what makes logout and "log out of all
    sessions" real actions rather than client-only gestures.
    """
    __tablename__ = "refresh_tokens"
    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    token_hash = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=_uuid)
    student_id = Column(String, nullable=True, index=True)
    type = Column(String)
    title = Column(String)
    message = Column(String)
    timestamp = Column(String)
    read = Column(Boolean, default=False)
    icon = Column(String)
