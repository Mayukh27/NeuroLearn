"""
ML Module — All machine learning models for NeuroLearn

Models:
    - attention_detector: MediaPipe-based webcam attention scoring
    - transcription_service: Whisper-based video transcription
    - question_generator: FLAN-T5 based quiz generation
    - adaptive_engine: Difficulty adjustment engine (now CSR-driven, see csr.py)
    - compute_csr: Cognitive Readiness Score fusion (Phase 2 of the
      NeuroLearn-MCL implementation spec)
"""

from .attention_model import attention_detector, AttentionDetector
from .transcription_model import transcription_service, TranscriptionService
from .question_generator import question_generator, QuestionGenerator
from .adaptive_engine import adaptive_engine, AdaptiveEngine
from .csr import compute_csr, CSRResult, CSRComponents
from .performance import compute_performance, PerformanceResult
from .response_integrity import compute_response_integrity, IntegrityResult, TimingCategory
from .trend import compute_trend, TrendResult
from .content_complexity import compute_content_complexity, ComplexityResult
from .attention_subscores import derive_subscores, rolling_average_attention, AttentionSubscores

__all__ = [
    "attention_detector",
    "transcription_service",
    "question_generator",
    "adaptive_engine",
    "AttentionDetector",
    "TranscriptionService",
    "QuestionGenerator",
    "AdaptiveEngine",
    # CSR additions:
    "compute_csr",
    "CSRResult",
    "CSRComponents",
    "compute_performance",
    "PerformanceResult",
    "compute_response_integrity",
    "IntegrityResult",
    "TimingCategory",
    "compute_trend",
    "TrendResult",
    "compute_content_complexity",
    "ComplexityResult",
    "derive_subscores",
    "rolling_average_attention",
    "AttentionSubscores",
]
