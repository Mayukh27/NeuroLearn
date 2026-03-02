"""
ML Module — All machine learning models for NeuroLearn

Models:
    - attention_detector: MediaPipe-based webcam attention scoring
    - transcription_service: Whisper-based video transcription
    - question_generator: FLAN-T5 based quiz generation
    - adaptive_engine: Difficulty adjustment engine
"""

from .attention_model import attention_detector, AttentionDetector
from .transcription_model import transcription_service, TranscriptionService
from .question_generator import question_generator, QuestionGenerator
from .adaptive_engine import adaptive_engine, AdaptiveEngine

__all__ = [
    "attention_detector",
    "transcription_service",
    "question_generator",
    "adaptive_engine",
    "AttentionDetector",
    "TranscriptionService",
    "QuestionGenerator",
    "AdaptiveEngine",
]
